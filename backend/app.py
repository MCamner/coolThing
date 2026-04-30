import os
import secrets
import tempfile
import urllib.parse
from collections import defaultdict

import requests as http_requests
import yt_dlp
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
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

# ── Guitar tab config ─────────────────────────────────────────────────────────

STRINGS = [
    ("e", 64),
    ("B", 59),
    ("G", 55),
    ("D", 50),
    ("A", 45),
    ("E", 40),
]

MAX_FRET = 19
GROUP_WINDOW = 0.06


# ── Spotify config ────────────────────────────────────────────────────────────

SPOTIFY_CLIENT_ID     = os.getenv("SPOTIFY_CLIENT_ID", "")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET", "")
SPOTIFY_REDIRECT_URI  = "http://127.0.0.1:8000/spotify/callback"
SPOTIFY_SCOPES        = "user-read-currently-playing user-read-playback-state"
FRONTEND_NOW_URL      = "http://localhost:3000/mega-now/"

KEY_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")

_spotify_tokens: dict = {}
_oauth_state: str = ""
_whisper_model = None


# ── Models ────────────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    youtube_url: str


# ── Chord detection ───────────────────────────────────────────────────────────

_NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

def _build_chord_templates(np):
    templates = {}
    for i, name in enumerate(_NOTE_NAMES):
        maj = np.zeros(12)
        maj[i % 12] = 1.0
        maj[(i + 4) % 12] = 0.75
        maj[(i + 7) % 12] = 0.75
        templates[name] = maj / np.linalg.norm(maj)

        min_ = np.zeros(12)
        min_[i % 12] = 1.0
        min_[(i + 3) % 12] = 0.75
        min_[(i + 7) % 12] = 0.75
        templates[name + "m"] = min_ / np.linalg.norm(min_)
    return templates


def _analyze_chords(audio_path: str) -> list:
    import librosa
    import numpy as np

    y, sr = librosa.load(audio_path, duration=180)
    hop = int(sr * 0.5)
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
    templates = _build_chord_templates(np)

    raw = []
    for t in range(chroma.shape[1]):
        frame = chroma[:, t]
        norm = np.linalg.norm(frame)
        if norm < 0.1:
            raw.append(None)
            continue
        fv = frame / norm
        best, best_score = None, 0.45
        for chord_name, tmpl in templates.items():
            score = float(np.dot(fv, tmpl))
            if score > best_score:
                best_score = score
                best = chord_name
        raw.append(best)

    merged = []
    for t, chord in enumerate(raw):
        if chord is None:
            continue
        time = round(t * hop / sr, 1)
        if not merged or merged[-1]["chord"] != chord:
            merged.append({"time": time, "chord": chord})

    return merged


def _get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        try:
            from faster_whisper import WhisperModel
        except ImportError as e:
            raise HTTPException(
                status_code=500,
                detail="faster-whisper is not installed. Run ./tools/run-mega-guitar-backend.sh to install requirements.",
            ) from e

        _whisper_model = WhisperModel(
            WHISPER_MODEL_SIZE,
            device="cpu",
            compute_type="int8",
        )
    return _whisper_model


def _transcribe_lyrics(audio_path: str) -> list:
    model = _get_whisper_model()
    segments, _ = model.transcribe(
        audio_path,
        beam_size=5,
        vad_filter=True,
    )
    return [
        {
            "start": round(segment.start, 2),
            "end": round(segment.end, 2),
            "text": segment.text.strip(),
        }
        for segment in segments
        if segment.text.strip()
    ]


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Mega Guitar Backend"}


# ── Guitar tab endpoints ──────────────────────────────────────────────────────

@app.post("/generate")
def generate_tabs(payload: GenerateRequest):
    with tempfile.TemporaryDirectory() as tmp:
        audio_path, title = _download_audio(payload.youtube_url, tmp)
        _, _, note_events = predict(audio_path, ICASSP_2022_MODEL_PATH)
        chords = _analyze_chords(audio_path)

    tab = _notes_to_tab(note_events)

    return {
        "status": "ok",
        "source": payload.youtube_url,
        "title": title,
        "mode": "basic-pitch transcription",
        "tuning": "E A D G B e",
        "tab": f"Title: {title}\nTuning: E A D G B e\n\n{tab}",
        "chords": chords,
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
        "noplaylist": True,
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
    notes = [(float(s), int(p)) for s, _, p, *_ in note_events]

    if not notes:
        return "No notes detected."

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

    columns = []
    for group in groups:
        col = {}
        used = set()
        for _, pitch in sorted(group, key=lambda n: -n[1]):
            best_string, best_fret = None, MAX_FRET + 1
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

    line_width = 16
    lines_out = []
    for chunk_start in range(0, len(columns), line_width):
        chunk = columns[chunk_start: chunk_start + line_width]
        rows = []
        for si, (name, _) in enumerate(STRINGS):
            row = name + "|"
            for col in chunk:
                row += str(col[si]).ljust(3, "-") if si in col else "---"
            row += "|"
            rows.append(row)
        lines_out.append("\n".join(rows))

    return "\n\n".join(lines_out)


# ── Spotify endpoints ─────────────────────────────────────────────────────────

@app.get("/spotify/login")
def spotify_login():
    global _oauth_state
    if not SPOTIFY_CLIENT_ID:
        raise HTTPException(status_code=500, detail="SPOTIFY_CLIENT_ID not set")

    _oauth_state = secrets.token_urlsafe(16)
    params = {
        "client_id": SPOTIFY_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "scope": SPOTIFY_SCOPES,
        "state": _oauth_state,
    }
    auth_url = "https://accounts.spotify.com/authorize?" + urllib.parse.urlencode(params)
    return RedirectResponse(auth_url)


@app.get("/spotify/callback")
def spotify_callback(code: str = None, state: str = None, error: str = None):
    if error or not code or state != _oauth_state:
        return RedirectResponse(FRONTEND_NOW_URL + "?auth=error")

    resp = http_requests.post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": SPOTIFY_REDIRECT_URI,
        },
        auth=(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET),
    )

    if resp.status_code != 200:
        return RedirectResponse(FRONTEND_NOW_URL + "?auth=error")

    data = resp.json()
    _spotify_tokens["access_token"] = data["access_token"]
    _spotify_tokens["refresh_token"] = data.get("refresh_token", "")

    return RedirectResponse(FRONTEND_NOW_URL + "?auth=success")


def _refresh_access_token():
    resp = http_requests.post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": _spotify_tokens.get("refresh_token", ""),
        },
        auth=(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET),
    )
    if resp.status_code == 200:
        _spotify_tokens["access_token"] = resp.json()["access_token"]


def _spotify_get(path: str):
    token = _spotify_tokens.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated with Spotify")

    resp = http_requests.get(
        f"https://api.spotify.com/v1{path}",
        headers={"Authorization": f"Bearer {token}"},
    )

    if resp.status_code == 401:
        _refresh_access_token()
        resp = http_requests.get(
            f"https://api.spotify.com/v1{path}",
            headers={"Authorization": f"Bearer {_spotify_tokens.get('access_token')}"},
        )

    return resp


@app.get("/spotify/now-playing")
def spotify_now_playing():
    resp = _spotify_get("/me/player/currently-playing")

    if resp.status_code == 204:
        return {"playing": False}

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="Spotify error")

    data = resp.json()

    if not data or data.get("currently_playing_type") != "track":
        return {"playing": False}

    track = data["item"]

    features = {}
    feat_resp = _spotify_get(f"/audio-features/{track['id']}")
    if feat_resp.status_code == 200:
        f = feat_resp.json()
        features = {
            "bpm": round(f.get("tempo", 0)),
            "key": KEY_NAMES[f.get("key", 0)] + (" major" if f.get("mode") == 1 else " minor"),
            "energy": round(f.get("energy", 0) * 100),
            "danceability": round(f.get("danceability", 0) * 100),
        }

    return {
        "playing": True,
        "title": track["name"],
        "artist": ", ".join(a["name"] for a in track["artists"]),
        "album": track["album"]["name"],
        "cover": track["album"]["images"][0]["url"] if track["album"]["images"] else None,
        "progress_ms": data.get("progress_ms", 0),
        "duration_ms": track["duration_ms"],
        "features": features,
    }


@app.post("/chords")
def detect_chords_endpoint(payload: GenerateRequest):
    with tempfile.TemporaryDirectory() as tmp:
        audio_path, title = _download_audio(payload.youtube_url, tmp)
        chords = _analyze_chords(audio_path)
    return {
        "status": "ok",
        "source": payload.youtube_url,
        "title": title,
        "chords": chords,
    }


@app.post("/lyrics")
def transcribe_lyrics_endpoint(payload: GenerateRequest):
    with tempfile.TemporaryDirectory() as tmp:
        audio_path, title = _download_audio(payload.youtube_url, tmp)
        lyrics = _transcribe_lyrics(audio_path)
    return {
        "status": "ok",
        "source": payload.youtube_url,
        "title": title,
        "mode": f"faster-whisper {WHISPER_MODEL_SIZE}",
        "lyrics": lyrics,
        "text": "\n".join(line["text"] for line in lyrics),
    }


@app.get("/spotify/youtube-search")
def spotify_youtube_search(title: str, artist: str):
    query = f"{artist} {title} guitar"
    ydl_opts = {"quiet": True, "no_warnings": True}
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            results = ydl.extract_info(f"ytsearch1:{query}", download=False)
            entry = results["entries"][0]
            return {"url": entry["webpage_url"], "title": entry["title"]}
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"YouTube search failed: {e}")
