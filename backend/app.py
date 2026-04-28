from fastapi import FastAPI
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
    return {
        "status": "ok",
        "source": payload.youtube_url,
        "mode": "mock",
        "tuning": "E A D G B e",
        "tempo": "92 BPM",
        "tab": """Tuning: E A D G B e
Tempo: 92 BPM
Mode: mock backend response

e|-----------------------------5--7--5------------------|
B|----------------------5--7----------7--5--------------|
G|----------------5--7---------------------7--5---------|
D|----------5--7-------------------------------7--5-----|
A|----5--7-----------------------------------------7----|
E|------------------------------------------------------|

Suggested practice:
1. Play slowly.
2. Add vibrato on held notes.
3. Try it in A minor pentatonic position 1.
""",
    }
