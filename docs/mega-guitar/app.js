const input = document.querySelector("#youtubeUrl");
const generateBtn = document.querySelector("#generateBtn");
const demoBtn = document.querySelector("#demoBtn");
const resetBtn = document.querySelector("#resetBtn");
const savePdfBtn = document.querySelector("#savePdfBtn");
const message = document.querySelector("#message");
const resultPanel = document.querySelector("#resultPanel");
const tabOutput = document.querySelector("#tabOutput");

let currentTitle = "guitar-tab";

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

function resetApp() {
  input.value = "";
  tabOutput.textContent = "";
  resultPanel.classList.add("hidden");
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
  setMessage(`Done. Tab generated. Mode: ${data.mode}.`, "success");

  generateBtn.disabled = false;
}

function savePdf() {
  const win = window.open("", "_blank");
  win.document.write(`<!doctype html><html><head>
    <title>${currentTitle}</title>
    <style>
      body { font-family: monospace; font-size: 13px; padding: 32px; white-space: pre; }
    </style>
  </head><body>${tabOutput.textContent}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}

savePdfBtn.addEventListener("click", savePdf);
generateBtn.addEventListener("click", generateTabs);

demoBtn.addEventListener("click", () => {
  input.value = demoUrl;
  setMessage("Demo URL loaded. Press Generate Tabs.");
});

resetBtn.addEventListener("click", resetApp);

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") generateTabs();
});
