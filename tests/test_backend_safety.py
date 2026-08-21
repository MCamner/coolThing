from __future__ import annotations

import asyncio
import sys
from types import ModuleType, SimpleNamespace
import unittest
from unittest.mock import patch


yt_dlp = ModuleType("yt_dlp")
yt_dlp.YoutubeDL = object
yt_dlp.utils = SimpleNamespace(DownloadError=RuntimeError)
sys.modules.setdefault("yt_dlp", yt_dlp)

basic_pitch = ModuleType("basic_pitch")
basic_pitch.ICASSP_2022_MODEL_PATH = "mock-model"
basic_pitch_inference = ModuleType("basic_pitch.inference")
basic_pitch_inference.predict = lambda *_args, **_kwargs: (None, None, [])
sys.modules.setdefault("basic_pitch", basic_pitch)
sys.modules.setdefault("basic_pitch.inference", basic_pitch_inference)

from fastapi import HTTPException

from backend import app as backend


class FakeUpload:
    def __init__(self, chunks: list[bytes], content_type: str = "image/jpeg") -> None:
        self._chunks = iter(chunks)
        self.content_type = content_type

    async def read(self, _size: int = -1) -> bytes:
        return next(self._chunks, b"")


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


if __name__ == "__main__":
    unittest.main()
