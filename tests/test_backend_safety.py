from __future__ import annotations

import asyncio
from email.message import Message
import json
import sys
import threading
from types import ModuleType, SimpleNamespace
from typing import cast
import unittest
import urllib.error
from unittest.mock import patch


yt_dlp = ModuleType("yt_dlp")
setattr(yt_dlp, "YoutubeDL", object)
setattr(yt_dlp, "utils", SimpleNamespace(DownloadError=RuntimeError))
sys.modules.setdefault("yt_dlp", yt_dlp)

basic_pitch = ModuleType("basic_pitch")
setattr(basic_pitch, "ICASSP_2022_MODEL_PATH", "mock-model")
basic_pitch_inference = ModuleType("basic_pitch.inference")
setattr(basic_pitch_inference, "predict", lambda *_args, **_kwargs: (None, None, []))
sys.modules.setdefault("basic_pitch", basic_pitch)
sys.modules.setdefault("basic_pitch.inference", basic_pitch_inference)

from fastapi import HTTPException, UploadFile

from backend import app as backend


class _FakeUpload:
    def __init__(self, chunks: list[bytes], content_type: str = "image/jpeg") -> None:
        self._chunks = iter(chunks)
        self.content_type = content_type

    async def read(self, _size: int = -1) -> bytes:
        return next(self._chunks, b"")


def FakeUpload(chunks: list[bytes], content_type: str = "image/jpeg") -> UploadFile:
    # Duck-typed stand-in; the backend only uses content_type and read().
    return cast(UploadFile, _FakeUpload(chunks, content_type))


class BackendSafetyTests(unittest.TestCase):
    def test_ytdlp_options_use_bounded_audio_fallback_without_cookies(self) -> None:
        with patch.dict(backend.os.environ, {"YT_DLP_COOKIES_FROM_BROWSER": ""}):
            options = backend._youtube_dl_options("/tmp/audio")

        self.assertEqual(
            options["format"],
            "bestaudio/best[height<=360][acodec!=none]",
        )
        self.assertNotIn("cookiesfrombrowser", options)

    def test_ytdlp_browser_cookies_are_explicit_opt_in(self) -> None:
        with patch.dict(
            backend.os.environ,
            {"YT_DLP_COOKIES_FROM_BROWSER": "chrome"},
        ):
            options = backend._youtube_dl_options("/tmp/audio")

        self.assertEqual(options["cookiesfrombrowser"], ("chrome",))

    def test_ytdlp_browser_cookie_source_rejects_unknown_values(self) -> None:
        with patch.dict(
            backend.os.environ,
            {"YT_DLP_COOKIES_FROM_BROWSER": "../cookies.txt"},
        ):
            with self.assertRaisesRegex(ValueError, "Unsupported browser"):
                backend._youtube_dl_options("/tmp/audio")

    def test_youtube_url_allowlist(self) -> None:
        self.assertEqual(
            backend._validated_youtube_url("https://youtu.be/dQw4w9WgXcQ"),
            "https://youtu.be/dQw4w9WgXcQ",
        )
        for unsafe in ("file:///etc/passwd", "http://127.0.0.1/private", "https://example.com/video"):
            with self.subTest(unsafe=unsafe), self.assertRaises(HTTPException) as raised:
                backend._validated_youtube_url(unsafe)
            self.assertEqual(raised.exception.status_code, 422)

    def test_upload_limit_and_media_type(self) -> None:
        with patch.object(backend, "MAX_IMAGE_UPLOAD_BYTES", 5):
            content = asyncio.run(backend._read_image_upload(FakeUpload([b"abc", b"de"])))
            self.assertEqual(content, b"abcde")

            with self.assertRaises(HTTPException) as raised:
                asyncio.run(backend._read_image_upload(FakeUpload([b"abc", b"def"])))
            self.assertEqual(raised.exception.status_code, 413)

        with self.assertRaises(HTTPException) as raised:
            asyncio.run(backend._read_image_upload(FakeUpload([b"abc"], "text/plain")))
        self.assertEqual(raised.exception.status_code, 415)

    def test_spotify_requests_have_timeout(self) -> None:
        backend._spotify_tokens.clear()
        backend._spotify_tokens["access_token"] = "test-token"
        response = SimpleNamespace(status_code=200)
        with patch.object(backend.http_requests, "get", return_value=response) as get:
            self.assertIs(backend._spotify_get("/me"), response)
        self.assertEqual(get.call_args.kwargs["timeout"], backend.HTTP_TIMEOUT_SECONDS)

    def test_prompt_provider_failure_is_sanitized(self) -> None:
        upload = FakeUpload([b"image"])
        with patch.object(backend, "_prompt_image_ollama", side_effect=RuntimeError("private detail")):
            with self.assertRaises(HTTPException) as raised:
                asyncio.run(backend.prompt_image_endpoint(upload, provider="ollama"))
        self.assertEqual(raised.exception.detail, "Ollama unavailable")


class FakeOllamaResponse:
    def __init__(self, body: dict) -> None:
        self._body = json.dumps(body).encode("utf-8")

    def __enter__(self) -> "FakeOllamaResponse":
        return self

    def __exit__(self, *_args: object) -> None:
        return None

    def read(self) -> bytes:
        return self._body


class PromptImageOllamaTests(unittest.TestCase):
    def _call(self) -> dict:
        return backend._prompt_image_ollama("aW1n", "style", "detail", False)

    def test_payload_disables_thinking_and_requests_json(self) -> None:
        body = {"response": json.dumps({"prompt": "p", "negative_prompt": "n"})}
        with patch("urllib.request.urlopen", return_value=FakeOllamaResponse(body)) as urlopen:
            result = self._call()

        payload = json.loads(urlopen.call_args.args[0].data)
        self.assertIs(payload["think"], False)
        self.assertEqual(payload["format"], "json")
        self.assertEqual(result["prompt"], "p")

    def test_missing_model_names_the_model(self) -> None:
        error = urllib.error.HTTPError("http://ollama", 404, "Not Found", Message(), None)
        with patch("urllib.request.urlopen", side_effect=error):
            with self.assertRaises(HTTPException) as raised:
                self._call()
        self.assertEqual(raised.exception.status_code, 502)
        self.assertIn("qwen3.5:9b", raised.exception.detail)
        self.assertIn("ollama pull", raised.exception.detail)

    def test_timeout_is_reported_as_timeout(self) -> None:
        with patch("urllib.request.urlopen", side_effect=TimeoutError("timed out")):
            with self.assertRaises(HTTPException) as raised:
                self._call()
        self.assertEqual(raised.exception.status_code, 504)
        self.assertEqual(raised.exception.detail, "Ollama timed out")

    def test_connection_refused_stays_unavailable(self) -> None:
        upload = FakeUpload([b"image"])
        error = urllib.error.URLError(ConnectionRefusedError())
        with patch("urllib.request.urlopen", side_effect=error):
            with self.assertRaises(HTTPException) as raised:
                asyncio.run(backend.prompt_image_endpoint(upload, provider="ollama"))
        self.assertEqual(raised.exception.status_code, 502)
        self.assertEqual(raised.exception.detail, "Ollama unavailable")

    def test_provider_call_runs_off_the_event_loop_thread(self) -> None:
        upload = FakeUpload([b"image"])
        seen: list[int] = []

        def fake_provider(*_args: object) -> dict:
            seen.append(threading.get_ident())
            return {"prompt": "p", "negative_prompt": "", "variations": []}

        async def run() -> int:
            with patch.object(backend, "_prompt_image_ollama", side_effect=fake_provider):
                await backend.prompt_image_endpoint(upload, provider="ollama")
            return threading.get_ident()

        loop_thread = asyncio.run(run())
        self.assertEqual(len(seen), 1)
        self.assertNotEqual(seen[0], loop_thread)


if __name__ == "__main__":
    unittest.main()
