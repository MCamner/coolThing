const input = document.querySelector("#youtubeUrl");
const generateBtn = document.querySelector("#generateBtn");
const chordsBtn = document.querySelector("#chordsBtn");
const lyricsBtn = document.querySelector("#lyricsBtn");
const demoBtn = document.querySelector("#demoBtn");
const resetBtn = document.querySelector("#resetBtn");
const savePdfBtn = document.querySelector("#savePdfBtn");
const message = document.querySelector("#message");
const resultPanel = document.querySelector("#resultPanel");
const tabOutput = document.querySelector("#tabOutput");
const chordsPanel = document.querySelector("#chordsPanel");
const lyricsInput = document.querySelector("#lyricsInput");
const renderLyricsBtn = document.querySelector("#renderLyricsBtn");
const clearLyricsBtn = document.querySelector("#clearLyricsBtn");
const chordSheet = document.querySelector("#chordSheet");
const chordSequence = document.querySelector("#chordSequence");

let currentTitle = "guitar-tab";
let currentChords = [];
let currentLyrics = [];

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

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function compactChords(chords) {
  return chords.reduce((items, chord) => {
    const previous = items[items.length - 1];
    if (!previous || previous.chord !== chord.chord) {
      items.push(chord);
    }
    return items;
  }, []);
}

function buildChordLine(line, chords) {
  const width = Math.max(line.length, 24);
  const chars = Array(width + 8).fill(" ");

  chords.forEach((item, index) => {
    const chord = item.chord;
    const position = chords.length === 1
      ? 0
      : Math.round((index / (chords.length - 1)) * Math.max(width - chord.length, 0));

    for (let i = 0; i < chord.length; i += 1) {
      chars[position + i] = chord[i];
    }
  });

  return chars.join("").trimEnd();
}

function distributeChordsOverLyrics(chords, lyrics) {
  const lines = lyrics.split("\n");
  const playableLines = lines.filter((line) => line.trim()).length || 1;
  const chordsPerLine = Math.max(1, Math.ceil(chords.length / playableLines));
  let chordIndex = 0;

  return lines.map((line) => {
    if (!line.trim()) {
      return { chordLine: "", lyricLine: "" };
    }

    const lineChords = chords.slice(chordIndex, chordIndex + chordsPerLine);
    chordIndex += chordsPerLine;

    return {
      chordLine: buildChordLine(line, lineChords.length ? lineChords : [chords[chords.length - 1]]),
      lyricLine: line,
    };
  });
}

function distributeChordsOverTimedLyrics(chords, lyrics) {
  return lyrics.map((line) => {
    const lineChords = chords.filter((chord) => (
      chord.time >= line.start && chord.time <= line.end
    ));

    const fallbackChord = chords.find((chord) => chord.time >= line.start) || chords[chords.length - 1];

    return {
      chordLine: buildChordLine(line.text, lineChords.length ? lineChords : [fallbackChord]),
      lyricLine: line.text,
    };
  });
}

function renderChordSheet() {
  const chords = currentLyrics.length ? currentChords : compactChords(currentChords);

  if (!chords.length) {
    chordSheet.innerHTML = "";
    return;
  }

  const lyrics = lyricsInput.value.trim();

  if (!lyrics) {
    const progression = chords
      .map((item, index) => `${String(index + 1).padStart(2, "0")}  ${item.chord}`)
      .join("\n");

    chordSheet.innerHTML = `
      <div class="sheet-note">
        Paste lyrics above to place chords over text. Until then, here is the detected progression.
      </div>
      <pre>${escapeHtml(progression)}</pre>
    `;
    return;
  }

  const sheetRows = currentLyrics.length
    ? distributeChordsOverTimedLyrics(chords, currentLyrics)
    : distributeChordsOverLyrics(chords, lyrics);

  const rows = sheetRows
    .map((row) => `
      <div class="song-line">
        <div class="song-chords">${escapeHtml(row.chordLine)}</div>
        <div class="song-lyrics">${escapeHtml(row.lyricLine)}</div>
      </div>
    `)
    .join("");

  chordSheet.innerHTML = rows;
}

function renderChords(chords) {
  currentChords = chords;
  const displayChords = compactChords(chords);

  chordSequence.innerHTML = displayChords
    .map((c) => `<span class="chord-chip">${escapeHtml(c.chord)}</span>`)
    .join("");

  renderChordSheet();
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

async function autoLyrics(options = {}) {
  const skipChordDetection = Boolean(options.skipChordDetection);
  const url = input.value.trim();

  if (!url) {
    setMessage("Paste a YouTube link first.", "error");
    return;
  }
  if (!isValidYouTubeUrl(url)) {
    setMessage("That does not look like a valid YouTube URL.", "error");
    return;
  }

  lyricsBtn.disabled = true;
  setMessage("Auto Lyrics Beta — transcribing local audio with Whisper...");

  try {
    const res = await fetch(`${BACKEND}/lyrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtube_url: url }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || `Backend returned ${res.status}`);
    }

    const data = await res.json();
    currentLyrics = data.lyrics || [];
    lyricsInput.value = data.text || "";

    if (!currentLyrics.length) {
      setMessage(
        "Whisper did not find clear vocals. Try a lyric video, official audio with louder vocals, or paste lyrics manually.",
        "error"
      );
      return;
    }

    if (!currentChords.length && !skipChordDetection) {
      await detectChords();
    } else {
      renderChordSheet();
    }

    setMessage(`Auto lyrics ready. Mode: ${data.mode}.`, "success");
  } catch (error) {
    setMessage(`Auto lyrics failed: ${error.message}`, "error");
  } finally {
    lyricsBtn.disabled = false;
  }
}

function resetApp() {
  input.value = "";
  tabOutput.textContent = "";
  currentChords = [];
  currentLyrics = [];
  chordSheet.innerHTML = "";
  lyricsInput.value = "";
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
    setMessage("Tabs + chords ready. Auto Lyrics Beta is running...");
    autoLyrics({ skipChordDetection: true });
  } else {
    setMessage(`Done. Tab generated. Mode: ${data.mode}.`, "success");
  }

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
renderLyricsBtn.addEventListener("click", renderChordSheet);
clearLyricsBtn.addEventListener("click", () => {
  lyricsInput.value = "";
  currentLyrics = [];
  renderChordSheet();
});
lyricsInput.addEventListener("input", () => {
  currentLyrics = [];
  renderChordSheet();
});
lyricsBtn.addEventListener("click", autoLyrics);

demoBtn.addEventListener("click", () => {
  input.value = demoUrl;
  setMessage("Demo URL loaded. Press Generate Tabs.");
});

resetBtn.addEventListener("click", resetApp);

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") generateTabs();
});
