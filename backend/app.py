import os
import tempfile

import yt_dlp
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Mega Guitar Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5500",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:8080",
        "https://mcamner.github.io",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    youtube_url: str


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "Mega Guitar Backend",
    }


@app.post("/generate")
def generate_tabs(payload: GenerateRequest):
    with tempfile.TemporaryDirectory() as tmp:
        audio_path = _download_audio(payload.youtube_url, tmp)
        title = os.path.splitext(os.path.basename(audio_path))[0]

    return {
        "status": "ok",
        "source": payload.youtube_url,
        "title": title,
        "mode": "audio downloaded — tab generation coming soon",
        "tuning": "E A D G B e",
        "tab": f"Audio downloaded: {title}\n\nTab generation not yet implemented.\nNext step: run Basic Pitch transcription.",
    }


def _download_audio(url: str, dest_dir: str) -> str:
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(dest_dir, "%(title)s.%(ext)s"),
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "wav",
                "preferredquality": "192",
            }
        ],
        "quiet": True,
        "no_warnings": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            title = info.get("title", "unknown")
            filename = ydl.prepare_filename(info)
            wav_path = os.path.splitext(filename)[0] + ".wav"
            return wav_path if os.path.exists(wav_path) else f"{title}.wav"
    except yt_dlp.utils.DownloadError as e:
        raise HTTPException(status_code=422, detail=f"Could not download audio: {e}")
