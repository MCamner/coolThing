let audioCtx;
let isAudioInit = false;

function initAudio() {
    if (isAudioInit) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    isAudioInit = true;
    document.getElementById('boot-screen').style.display = 'none';
    playBeep(600, 0.5);
}

function playBeep(freq = 440, duration = 0.1) {
    if (!isAudioInit) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth'; // Rougher 90s sound
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

async function generateTab() {
    const url = document.getElementById('yt-url').value;
    const msg = document.getElementById('status-msg');
    
    if (!url) {
        msg.innerText = "ERROR: NO URL DETECTED";
        msg.style.color = "red";
        return;
    }

    msg.innerText = "PROCESSING... (AI ENGINE CONNECTING)";
    msg.style.color = "var(--mtv-blue)";

    // HÄR SKER ANROPET TILL DIN BACKEND
    // Exempel:
    /*
    try {
        const response = await fetch('https://din-huggingface-space.hf.space/predict', {
            method: 'POST',
            body: JSON.stringify({url: url})
        });
        const data = await response.json();
        renderTab(data.midi);
    } catch (e) {
        msg.innerText = "SERVER BUSY - TRY AGAIN";
    }
    */
    
    setTimeout(() => {
        msg.innerText = "NOTICE: CONNECT YOUR BACKEND API IN APP.JS";
    }, 2000);
}

function renderTab(midiData) {
    // AlphaTab integration för att rita tabben
    const api = new alphaTab.AlphaTabApi(document.getElementById('alphaTab'), {
        // inställningar
    });
}
