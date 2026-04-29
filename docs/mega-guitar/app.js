const input = document.querySelector("#youtubeUrl");
const generateBtn = document.querySelector("#generateBtn");
const chordsBtn = document.querySelector("#chordsBtn");
const demoBtn = document.querySelector("#demoBtn");
const resetBtn = document.querySelector("#resetBtn");
const savePdfBtn = document.querySelector("#savePdfBtn");
const message = document.querySelector("#message");
const resultPanel = document.querySelector("#resultPanel");
const tabOutput = document.querySelector("#tabOutput");
const chordsPanel = document.querySelector("#chordsPanel");
const chordSequence = document.querySelector("#chordSequence");
const chordDiagrams = document.querySelector("#chordDiagrams");

let currentTitle = "guitar-tab";

if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
  document.getElementById("local-notice").style.display = "block";
}

const preloadUrl = new URLSearchParams(location.search).get("url");
if (preloadUrl) {
  input.value = preloadUrl;
  setMessage("URL loaded from Mega Now. Press Generate Tabs.");
}

const steps = {
  input: document.querySelector("#step-input"),
  analyze: document.querySelector("#step-analyze"),
  transcribe: document.querySelector("#step-transcribe"),
  render: document.querySelector("#step-render"),
};

const BACKEND = "http://127.0.0.1:8000";
const demoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function resetSteps() {
  Object.values(steps).forEach((step) => {
    step.classList.remove("active", "done");
  });
}

function setStep(name, state) {
  const step = steps[name];
  if (!step) return;
  step.classList.remove("active", "done");
  if (state) step.classList.add(state);
}

function isValidYouTubeUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace("www.", "");
    return (
      host === "youtube.com" ||
      host === "youtu.be" ||
      host === "music.youtube.com"
    );
  } catch {
    return false;
  }
}

// ── Chord shapes ─────────────────────────────────────────────────────────────
// Each shape: [lowE, A, D, G, B, highE] — -1=muted, 0=open, N=fret number

const CHORD_SHAPES = {
  C:   [-1, 3, 2, 0, 1, 0],
  Cm:  [-1, 3, 5, 5, 4, 3],
  "C#":  [-1, 4, 6, 6, 6, 4],
  "C#m": [-1, 4, 6, 6, 5, 4],
  D:   [-1, -1, 0, 2, 3, 2],
  Dm:  [-1, -1, 0, 2, 3, 1],
  "D#":  [-1, 6, 8, 8, 8, 6],
  "D#m": [-1, 6, 8, 8, 7, 6],
  E:   [0, 2, 2, 1, 0, 0],
  Em:  [0, 2, 2, 0, 0, 0],
  F:   [1, 3, 3, 2, 1, 1],
  Fm:  [1, 3, 3, 1, 1, 1],
  "F#":  [2, 4, 4, 3, 2, 2],
  "F#m": [2, 4, 4, 2, 2, 2],
  G:   [3, 2, 0, 0, 0, 3],
  Gm:  [3, 5, 5, 3, 3, 3],
  "G#":  [4, 6, 6, 5, 4, 4],
  "G#m": [4, 6, 6, 4, 4, 4],
  A:   [-1, 0, 2, 2, 2, 0],
  Am:  [-1, 0, 2, 2, 1, 0],
  "A#":  [-1, 1, 3, 3, 3, 1],
  "A#m": [6, 8, 8, 6, 6, 6],
  B:   [-1, 2, 4, 4, 4, 2],
  Bm:  [-1, 2, 4, 4, 3, 2],
};

function chordSvg(name, shape) {
  const played = shape.filter((f) => f > 0);
  const minFret = played.length ? Math.min(...played) : 1;
  const startFret = minFret > 1 ? minFret : 1;
  const isOpen = startFret === 1;

  const W = 100, H = 132;
  const x0 = 16, x1 = 84;
  const y0 = 36, y1 = 112;
  const sg = (x1 - x0) / 5;
  const fg = (y1 - y0) / 4;

  let s = `<svg viewBox="0 0 ${W} ${H}" width="100" height="132" xmlns="http://www.w3.org/2000/svg">`;

  s += `<text x="${W / 2}" y="14" text-anchor="middle" fill="#fff7ff" font-family="Arial Black,Impact,sans-serif" font-size="13" font-weight="900">${name}</text>`;

  if (isOpen) {
    s += `<rect x="${x0 - 1}" y="${y0 - 4}" width="${x1 - x0 + 2}" height="4" rx="1" fill="#fff7ff"/>`;
  } else {
    s += `<text x="${x0 - 4}" y="${y0 + fg * 0.55}" text-anchor="end" fill="#28f3ff" font-size="9" font-family="Arial,sans-serif">${startFret}fr</text>`;
  }

  for (let i = 0; i <= 4; i++) {
    s += `<line x1="${x0}" y1="${y0 + i * fg}" x2="${x1}" y2="${y0 + i * fg}" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>`;
  }
  for (let i = 0; i < 6; i++) {
    s += `<line x1="${x0 + i * sg}" y1="${y0}" x2="${x0 + i * sg}" y2="${y1}" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>`;
  }

  shape.forEach((fret, i) => {
    const x = x0 + i * sg;
    if (fret === -1) {
      s += `<text x="${x}" y="${y0 - 7}" text-anchor="middle" fill="#ff3b3b" font-size="11" font-family="Arial,sans-serif">×</text>`;
    } else if (fret === 0 && isOpen) {
      s += `<circle cx="${x}" cy="${y0 - 9}" r="4" fill="none" stroke="#4dff7a" stroke-width="1.5"/>`;
    }
  });

  shape.forEach((fret, i) => {
    if (fret <= 0) return;
    const rel = fret - startFret + 1;
    if (rel < 1 || rel > 4) return;
    const x = x0 + i * sg;
    const y = y0 + (rel - 0.5) * fg;
    s += `<circle cx="${x}" cy="${y}" r="7" fill="#ff2fb2"/>`;
  });

  s += `</svg>`;
  return s;
}

function renderChords(chords) {
  // Chord sequence chips
  chordSequence.innerHTML = chords
    .map((c) => `<span class="chord-chip">${c.chord}</span>`)
    .join("");

  // Unique chord diagrams
  const seen = new Set();
  const unique = chords.filter((c) => {
    if (seen.has(c.chord)) return false;
    seen.add(c.chord);
    return true;
  });

  chordDiagrams.innerHTML = unique
    .map((c) => {
      const shape = CHORD_SHAPES[c.chord];
      if (!shape) return `<div class="chord-card chord-card--unknown"><span>${c.chord}</span></div>`;
      return `<div class="chord-card">${chordSvg(c.chord, shape)}</div>`;
    })
    .join("");
}

async function detectChords() {
  const url = input.value.trim();

  if (!url) {
    setMessage("Paste a YouTube link first.", "error");
    return;
  }
  if (!isValidYouTubeUrl(url)) {
    setMessage("That does not look like a valid YouTube URL.", "error");
    return;
  }

  chordsPanel.classList.add("hidden");
  chordsBtn.disabled = true;
  setMessage("Detecting chords — downloading audio...");

  let data;
  try {
    const res = await fetch(`${BACKEND}/chords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtube_url: url }),
    });
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    data = await res.json();
  } catch {
    setMessage(
      "Could not reach backend. Is it running? Try: ./tools/run-mega-guitar-backend.sh",
      "error"
    );
    chordsBtn.disabled = false;
    return;
  }

  if (!data.chords || data.chords.length === 0) {
    setMessage("No chords detected in this audio.", "error");
    chordsBtn.disabled = false;
    return;
  }

  renderChords(data.chords);
  chordsPanel.classList.remove("hidden");
  setMessage(`Chords detected: ${[...new Set(data.chords.map((c) => c.chord))].join(", ")}`, "success");
  chordsBtn.disabled = false;
}

function resetApp() {
  input.value = "";
  tabOutput.textContent = "";
  resultPanel.classList.add("hidden");
  chordsPanel.classList.add("hidden");
  resetSteps();
  setMessage("Ready. Paste a YouTube link to start.");
  generateBtn.disabled = false;
}

async function generateTabs() {
  const url = input.value.trim();

  resultPanel.classList.add("hidden");
  tabOutput.textContent = "";
  resetSteps();

  if (!url) {
    setMessage("Paste a YouTube link first.", "error");
    setStep("input", "active");
    return;
  }

  if (!isValidYouTubeUrl(url)) {
    setMessage("That does not look like a valid YouTube URL.", "error");
    setStep("input", "active");
    return;
  }

  generateBtn.disabled = true;

  setMessage("Validating YouTube link...");
  setStep("input", "active");
  await sleep(400);
  setStep("input", "done");

  setMessage("Calling local backend...");
  setStep("analyze", "active");

  let data;
  try {
    const res = await fetch(`${BACKEND}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtube_url: url }),
    });

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }

    data = await res.json();
  } catch {
    setStep("analyze", "active");
    setMessage(
      "Could not reach backend. Is it running? Try: ./tools/run-mega-guitar-backend.sh",
      "error"
    );
    generateBtn.disabled = false;
    return;
  }

  setStep("analyze", "done");

  setMessage("Receiving tab data...");
  setStep("transcribe", "active");
  await sleep(500);
  setStep("transcribe", "done");

  setMessage("Rendering playable preview...");
  setStep("render", "active");
  await sleep(400);
  setStep("render", "done");

  currentTitle = data.title || "guitar-tab";
  tabOutput.textContent = data.tab;
  resultPanel.classList.remove("hidden");

  if (data.chords && data.chords.length > 0) {
    renderChords(data.chords);
    chordsPanel.classList.remove("hidden");
  }

  setMessage(`Done. Tab + chords generated. Mode: ${data.mode}.`, "success");

  generateBtn.disabled = false;
}

function savePdf() {
  const printArea = document.getElementById("print-area");
  const originalTitle = document.title;

  printArea.textContent = tabOutput.textContent;
  document.title = currentTitle;

  window.print();

  document.title = originalTitle;
  printArea.textContent = "";
}

savePdfBtn.addEventListener("click", savePdf);
generateBtn.addEventListener("click", generateTabs);
chordsBtn.addEventListener("click", detectChords);

demoBtn.addEventListener("click", () => {
  input.value = demoUrl;
  setMessage("Demo URL loaded. Press Generate Tabs.");
});

resetBtn.addEventListener("click", resetApp);

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") generateTabs();
});
