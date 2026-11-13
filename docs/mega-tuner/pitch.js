// Mega Tuner pitch detection (McLeod pitch method).
// Kept apart from index.html so it can be tested in Node:
//   node --test tests/test_mega_tuner_pitch.js
(function (root) {
"use strict";

const MIN_FREQ = 70;
const MAX_FREQ = 1200;
const MIN_VOLUME = 0.012;
const MIN_CLARITY = 0.42;
// Take the first peak that reaches this share of the highest one. Picking the
// highest peak outright lands on two or three periods as often as on one.
const PEAK_SHARE = 0.9;

function rms(buf) {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
  return Math.sqrt(sum / buf.length);
}

function centsOff(freq, target) {
  return Math.round(1200 * Math.log2(freq / target)) + 0; // + 0 turns -0 into 0
}

function detectPitch(buf, sampleRate) {
  const size = buf.length;

  // Remove DC so the correlation can cross zero between periods.
  let mean = 0;
  for (let i = 0; i < size; i++) mean += buf[i];
  mean /= size;
  const x = new Float32Array(size);
  for (let i = 0; i < size; i++) x[i] = buf[i] - mean;

  const volume = rms(x);
  if (volume < MIN_VOLUME) return { pitch: -1, volume };

  const minLag = Math.floor(sampleRate / MAX_FREQ);
  const maxLag = Math.min(Math.floor(sampleRate / MIN_FREQ), size - 2);

  // Normalised square difference function, one value per lag.
  const nsdf = new Float32Array(maxLag + 2);
  for (let lag = 1; lag <= maxLag + 1; lag++) {
    let corr = 0;
    let energy = 0;
    for (let i = 0; i < size - lag; i++) {
      corr += x[i] * x[i + lag];
      energy += x[i] * x[i] + x[i + lag] * x[i + lag];
    }
    nsdf[lag] = energy ? (2 * corr) / energy : 0;
  }

  // One candidate per positive lobe, skipping the lobe around lag 0.
  const peaks = [];
  let lag = 1;
  while (lag <= maxLag && nsdf[lag] > 0) lag++;
  while (lag <= maxLag) {
    while (lag <= maxLag && nsdf[lag] <= 0) lag++;
    let best = -1;
    while (lag <= maxLag && nsdf[lag] > 0) {
      if (best === -1 || nsdf[lag] > nsdf[best]) best = lag;
      lag++;
    }
    if (best >= minLag && best < maxLag) peaks.push(best);
  }

  let highest = 0;
  for (const p of peaks) if (nsdf[p] > highest) highest = nsdf[p];
  if (highest < MIN_CLARITY) return { pitch: -1, volume };

  const chosen = peaks.find((p) => nsdf[p] >= PEAK_SHARE * highest);

  // Parabolic interpolation: the true period falls between two samples.
  const a = nsdf[chosen - 1];
  const b = nsdf[chosen];
  const c = nsdf[chosen + 1];
  const denom = a - 2 * b + c;
  const shift = denom ? (0.5 * (a - c)) / denom : 0;

  return { pitch: sampleRate / (chosen + shift), volume, clarity: b };
}

// Median over the last `size` readings; removes single misreadings.
function createSmoother(size) {
  let values = [];
  return {
    push(freq) {
      values.push(freq);
      if (values.length > size) values.shift();
      const sorted = values.slice().sort((p, q) => p - q);
      const mid = sorted.length >> 1;
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    },
    reset() {
      values = [];
    },
  };
}

const api = { detectPitch, rms, centsOff, createSmoother };
if (typeof module !== "undefined" && module.exports) module.exports = api;
else root.MegaTunerPitch = api;
})(typeof window !== "undefined" ? window : this);
