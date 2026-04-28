import os
import tempfile
from collections import defaultdict

import yt_dlp
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
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

# Standard tuning: string name, open MIDI pitch
STRINGS = [
    ("e", 64),
    ("B", 59),
    ("G", 55),
    ("D", 50),
    ("A", 45),
    ("E", 40),
]

MAX_FRET = 19
MAX_SECONDS = 30
GROUP_WINDOW = 0.06  # seconds — notes within this window become one column


class GenerateRequest(BaseModel):
    youtube_url: str


@app.get("/")
def health_check():
    return {"status": "ok", "service": "Mega Guitar Backend"}


@app.post("/generate")
def generate_tabs(payload: GenerateRequest):
    with tempfile.TemporaryDirectory() as tmp:
        audio_path, title = _download_audio(payload.youtube_url, tmp)
        _, _, note_events = predict(audio_path, ICASSP_2022_MODEL_PATH)

    tab = _notes_to_tab(note_events)

    return {
        "status": "ok",
        "source": payload.youtube_url,
        "title": title,
        "mode": "basic-pitch transcription",
        "tuning": "E A D G B e",
        "tab": f"Title: {title}\nTuning: E A D G B e\n\n{tab}",
    }


def _download_audio(url: str, dest_dir: str):
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
            wav_path = os.path.splitext(ydl.prepare_filename(info))[0] + ".wav"
            return wav_path, title
    except yt_dlp.utils.DownloadError as e:
        raise HTTPException(status_code=422, detail=f"Could not download audio: {e}")


def _notes_to_tab(note_events) -> str:
    # note_events: list of (start_s, end_s, pitch_midi, amplitude, pitch_bend)
    notes = [
        (float(s), int(p))
        for s, _, p, *_ in note_events
        if float(s) < MAX_SECONDS
    ]

    if not notes:
        return "No notes detected in the first 30 seconds."

    # Group notes that start within GROUP_WINDOW of each other
    notes.sort(key=lambda n: n[0])
    groups = []
    current = [notes[0]]
    for note in notes[1:]:
        if note[0] - current[0][0] <= GROUP_WINDOW:
            current.append(note)
        else:
            groups.append(current)
            current = [note]
    groups.append(current)

    # Assign each group to string/fret positions
    columns = []
    for group in groups:
        col = {}
        used = set()
        # Sort pitches high to low — assign high notes to high strings first
        for _, pitch in sorted(group, key=lambda n: -n[1]):
            best_string = None
            best_fret = MAX_FRET + 1
            for i, (_, open_midi) in enumerate(STRINGS):
                if i in used:
                    continue
                fret = pitch - open_midi
                if 0 <= fret <= MAX_FRET and fret < best_fret:
                    best_fret = fret
                    best_string = i
            if best_string is not None:
                col[best_string] = best_fret
                used.add(best_string)
        columns.append(col)

    # Render ASCII tab — split into lines of 16 columns each
    line_width = 16
    lines_out = []

    for chunk_start in range(0, len(columns), line_width):
        chunk = columns[chunk_start: chunk_start + line_width]
        rows = []
        for si, (name, _) in enumerate(STRINGS):
            row = name + "|"
            for col in chunk:
                if si in col:
                    fret = str(col[si])
                    row += fret.ljust(3, "-")
                else:
                    row += "---"
            row += "|"
            rows.append(row)
        lines_out.append("\n".join(rows))

    return "\n\n".join(lines_out)
