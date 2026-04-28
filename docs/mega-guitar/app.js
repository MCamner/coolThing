const input = document.querySelector("#youtubeUrl");
const generateBtn = document.querySelector("#generateBtn");
const demoBtn = document.querySelector("#demoBtn");
const resetBtn = document.querySelector("#resetBtn");
const message = document.querySelector("#message");
const resultPanel = document.querySelector("#resultPanel");
const tabOutput = document.querySelector("#tabOutput");

const steps = {
  input: document.querySelector("#step-input"),
  analyze: document.querySelector("#step-analyze"),
  transcribe: document.querySelector("#step-transcribe"),
  render: document.querySelector("#step-render"),
};

const demoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

const mockTab = `Tuning: E A D G B e
Tempo: 92 BPM
Feel: clean intro → blues-rock phrase

e|-----------------------------5--7--5------------------|
B|----------------------5--7----------7--5--------------|
G|----------------5--7---------------------7--5---------|
D|----------5--7-------------------------------7--5-----|
A|----5--7-----------------------------------------7----|
E|------------------------------------------------------|

e|-----------------------------8b10--8--5---------------|
B|----------------------5--8--------------8--5----------|
G|----------------5--7------------------------7--5------|
D|----------5--7-----------------------------------7----|
A|----5--7----------------------------------------------|
E|------------------------------------------------------|

Suggested practice:
1. Play slowly with alternate picking.
2. Add light vibrato on held notes.
3. Try the phrase in A minor pentatonic position 1.
`;

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

  if (state) {
    step.classList.add(state);
  }
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

async function runMockFlow() {
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
  await sleep(500);
  setStep("input", "done");

  setMessage("Analyzing audio source...");
  setStep("analyze", "active");
  await sleep(750);
  setStep("analyze", "done");

  setMessage("Generating tab structure...");
  setStep("transcribe", "active");
  await sleep(900);
  setStep("transcribe", "done");

  setMessage("Rendering playable preview...");
  setStep("render", "active");
  await sleep(650);
  setStep("render", "done");

  tabOutput.textContent = mockTab;
  resultPanel.classList.remove("hidden");
  setMessage("Done. Mock tab generated successfully.", "success");

  generateBtn.disabled = false;
}

generateBtn.addEventListener("click", runMockFlow);

demoBtn.addEventListener("click", () => {
  input.value = demoUrl;
  setMessage("Demo URL loaded. Press Generate Tabs.");
});

resetBtn.addEventListener("click", resetApp);

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    runMockFlow();
  }
});
