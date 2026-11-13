// Regression tests for the Mega Tuner pitch detector.
// Run: node --test tests/test_mega_tuner_pitch.js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { detectPitch, centsOff, createSmoother } = require("../docs/mega-tuner/pitch.js");

const STRINGS = [
  ["E2", 82.41],
  ["A2", 110.0],
  ["D3", 146.83],
  ["G3", 196.0],
  ["B3", 246.94],
  ["E4", 329.63],
];
const SAMPLE_RATES = [44100, 48000];
const cents = (a, b) => 1200 * Math.log2(a / b);

// Deterministic string-like tone: harmonic amplitudes plus uniform noise.
function tone(freq, sampleRate, harmonics, noise, seed) {
  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32 - 0.5;
  };
  const buf = new Float32Array(4096);
  for (let i = 0; i < buf.length; i++) {
    let v = 0;
    harmonics.forEach((amp, h) => {
      v += amp * Math.sin((2 * Math.PI * freq * (h + 1) * i) / sampleRate + h);
    });
    buf[i] = 0.2 * v + noise * rand();
  }
  return buf;
}

test("clean in-tune strings are detected within 1.5 cents", () => {
  for (const sr of SAMPLE_RATES) {
    for (const [name, freq] of STRINGS) {
      const { pitch } = detectPitch(tone(freq, sr, [1, 0.5, 0.3], 0, 1), sr);
      assert.ok(pitch > 0, `${name} @${sr}: no pitch`);
      const err = cents(pitch, freq);
      assert.ok(Math.abs(err) < 1.5, `${name} @${sr}: ${pitch.toFixed(2)} Hz, ${err.toFixed(1)} cents off`);
    }
  }
});

test("noisy strings never land on an undertone or overtone", () => {
  for (const sr of SAMPLE_RATES) {
    for (const [name, freq] of STRINGS) {
      for (let t = 0; t < 200; t++) {
        const f = freq * (1 + (t - 100) / 20000);
        const { pitch } = detectPitch(tone(f, sr, [1, 0.6, 0.4, 0.2], 0.05, t + 7), sr);
        assert.ok(pitch > 0, `${name} @${sr} trial ${t}: no pitch`);
        const err = cents(pitch, f);
        assert.ok(Math.abs(err) < 5, `${name} @${sr} trial ${t}: ${pitch.toFixed(2)} Hz, ${err.toFixed(1)} cents off`);
      }
    }
  }
});

test("a weak fundamental is not reported an octave high", () => {
  for (const sr of SAMPLE_RATES) {
    for (const [name, freq] of STRINGS) {
      const { pitch } = detectPitch(tone(freq, sr, [0.3, 1, 0.5], 0.02, 11), sr);
      const err = cents(pitch, freq);
      assert.ok(Math.abs(err) < 5, `${name} @${sr}: ${pitch.toFixed(2)} Hz, ${err.toFixed(1)} cents off`);
    }
  }
});

test("detuned strings are tracked across +/-45 cents", () => {
  for (const [name, freq] of STRINGS) {
    for (let c = -45; c <= 45; c += 5) {
      const f = freq * Math.pow(2, c / 1200);
      const { pitch } = detectPitch(tone(f, 48000, [1, 0.5, 0.3], 0, 3), 48000);
      const err = cents(pitch, f);
      assert.ok(Math.abs(err) < 1.5, `${name} ${c} cents: ${err.toFixed(1)} cents off`);
    }
  }
});

test("a DC offset does not hide the pitch", () => {
  const buf = tone(196.0, 48000, [1, 0.5, 0.3], 0, 5).map((v) => v + 0.3);
  const { pitch } = detectPitch(buf, 48000);
  assert.ok(Math.abs(cents(pitch, 196.0)) < 1.5, `got ${pitch}`);
});

test("silence and pure noise give no pitch", () => {
  assert.equal(detectPitch(new Float32Array(4096), 48000).pitch, -1);
  assert.equal(detectPitch(tone(110, 48000, [0], 0.4, 9), 48000).pitch, -1);
});

test("centsOff rounds to nearest instead of flooring", () => {
  assert.equal(centsOff(440 * Math.pow(2, -0.2 / 1200), 440), 0);
  assert.equal(centsOff(440 * Math.pow(2, 0.2 / 1200), 440), 0);
  assert.equal(centsOff(440 * Math.pow(2, -7.6 / 1200), 440), -8);
  assert.equal(centsOff(440 * Math.pow(2, 7.6 / 1200), 440), 8);
});

test("smoother drops a single outlier and can be reset", () => {
  const smooth = createSmoother(5);
  [110, 110.1, 109.9, 110].forEach((f) => smooth.push(f));
  assert.ok(Math.abs(smooth.push(55) - 110) < 0.2, "outlier leaked through");
  smooth.reset();
  assert.equal(smooth.push(196), 196);
});
