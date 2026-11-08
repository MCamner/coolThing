// MQ-TAB pentatonic box analysis.
// Scale, segment and box logic from Pentabox (pentabox.html), unchanged apart
// from dropping its own GP3/GP4 reader; input now comes from alphaTab.
(function (root) {
"use strict";
// Pentatonic scale + box analysis
const NOTE_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const MINOR_PENT = [0, 3, 5, 7, 10];
const STD_TUNING = [64, 59, 55, 50, 45, 40, 35]; // string 1..7
const DEGREE_NAMES = { 0: "1", 1: "b2", 2: "2", 3: "b3", 4: "3", 5: "4", 6: "b5", 7: "5", 8: "b6", 9: "6", 10: "b7", 11: "7" };
const noteName = (pc, flat) => (flat ? NOTE_FLAT : NOTE_SHARP)[((pc % 12) + 12) % 12];

const STD_BASS = [43, 38, 33, 28, 23]; // G D A E B
function tuningInfo(tuning) {
  const n = tuning.length;
  const std = n <= 5 && tuning[0] < 52 ? STD_BASS.slice(0, n) : STD_TUNING.slice(0, n);
  const diffs = tuning.map((v, i) => v - std[i]);
  // global shift = most common offset (so Drop D keeps shift 0 and only the low string differs)
  const freq = {}; for (const x of diffs) freq[x] = (freq[x] || 0) + 1;
  const shift = +Object.entries(freq).sort((a, b) => b[1] - a[1] || Math.abs(a[0]) - Math.abs(b[0]))[0][0];
  const uniform = diffs.every((x) => x === shift);
  const fingered = tuning.map((v) => v - shift); // actual open strings in "fingering space"
  const ref = std.slice(); // box shapes are defined on this reference tuning
  const drop = !uniform && diffs.slice(0, n - 1).every((x) => x === shift) && diffs[n - 1] === shift - 2;
  let label;
  if (uniform && shift === 0) label = "Standard (E)";
  else if (uniform) label = `${noteName(std[0] + shift, true)}-stämning (standard ${shift > 0 ? "+" : "−"}${Math.abs(shift)} halvton)`;
  else if (drop) label = `Drop ${noteName(tuning[n - 1], true)}${shift ? ` (standard ${shift > 0 ? "+" : "−"}${Math.abs(shift)}, lägsta strängen −2)` : " (lägsta strängen −2)"}`;
  else label = tuning.slice().reverse().map((v) => noteName(v, false)).join(" ");
  return { shift, fingered, ref, uniform, drop, label };
}

// Build the 5 boxes for minor-pentatonic root (pitch class).
// Shapes are built on the reference tuning `ref` (standard) and then moved to the actual tuning,
// so in Drop D the low-string notes of each box sit two frets higher – same pitches, correct box.
function buildBoxes(rootPc, ref, actual = ref, maxFret = 24) {
  const tuning = ref;
  const n = tuning.length, low = n - 1; // index of lowest string
  const f0 = (((rootPc - tuning[low]) % 12) + 12) % 12;
  const offs = [0, 3, 5, 7, 10];
  const boxes = [];
  for (let k = 0; k < 5; k++) {
    // 12 consecutive scale tones starting at degree k on lowest string
    const startPitch = tuning[low] + f0 + offs[k];
    const pitches = [];
    let pc = startPitch;
    while (pitches.length < n * 2) {
      const rel = (((pc - rootPc) % 12) + 12) % 12;
      if (MINOR_PENT.includes(rel)) pitches.push(pc);
      pc++;
    }
    const base = [];
    for (let si = low, j = 0; si >= 0; si--, j += 2) {
      for (const pit of [pitches[j], pitches[j + 1]]) base.push({ string: si + 1, fret: pit - actual[si], degree: (((pit - rootPc) % 12) + 12) % 12 });
    }
    // octave variants
    const variants = [];
    for (let o = -24; o <= 24; o += 12) {
      // keep boxes that are cut off by the nut or the last fret (open-string boxes), minus the unreachable positions
      const pos = base.map((x) => ({ ...x, fret: x.fret + o })).filter((x) => x.fret >= 0 && x.fret <= maxFret);
      if (pos.length < base.length / 2) continue;
      const mn = Math.min(...pos.map((x) => x.fret)), mx = Math.max(...pos.map((x) => x.fret));
      variants.push({ id: `${k + 1}@${o}`, box: k + 1, minFret: mn, maxFret: mx, pos, partial: pos.length < base.length });
    }
    boxes.push({ box: k + 1, variants });
  }
  // lookup string:fret -> regions
  const lookup = {};
  for (const b of boxes) for (const v of b.variants) for (const x of v.pos) (lookup[`${x.string}:${x.fret}`] ||= []).push(v);
  return { boxes, lookup };
}

function noteWeight(n) { return 240 + Math.min(n.time, 1920); }

function scoreSets(notes) {
  const hist = new Array(12).fill(0); let total = 0;
  for (const n of notes) { const w = noteWeight(n); hist[n.pc] += w; total += w; }
  const scores = [];
  for (let r = 0; r < 12; r++) {
    let s = 0; for (const o of MINOR_PENT) s += hist[(r + o) % 12];
    scores.push({ root: r, coverage: total ? s / total : 0 });
  }
  scores.sort((a, b) => b.coverage - a.coverage);
  return { hist, total, scores };
}

// decide minor root vs relative major root
function tonicEvidence(notes, minorRoot) {
  const majorRoot = (minorRoot + 3) % 12;
  let em = 0, eM = 0;
  const add = (pc, w) => { if (pc === minorRoot) em += w; if (pc === majorRoot) eM += w; };
  for (const n of notes) add(n.pc, noteWeight(n));
  if (notes.length) {
    const last = notes[notes.length - 1]; add(last.pc, 2000);
    const lowest = notes.reduce((a, b) => (b.fp < a.fp ? b : a)); add(lowest.pc, 1200);
    // notes on first beat of measures
    for (const n of notes) if (n.beatStart === 0) add(n.pc, 400);
  }
  // b3 of the major view (= 5th of minor) also signals minor; the 6th of major (= root of minor)
  const fifth = (minorRoot + 7) % 12;
  for (const n of notes) if (n.pc === fifth) em += noteWeight(n) * 0.3;
  return em >= eM ? "minor" : "major";
}

function flattenNotes(song, ti, opts) {
  const t = song.tracks[ti];
  const tinfo = tuningInfo(t.tuning);
  const out = []; let abs = 0;
  t.measures.forEach((m, mi) => {
    m.beats.forEach((b, bi) => {
      for (const n of b.notes) {
        const rec = { measure: mi, beat: bi, beatStart: b.start, absStart: abs + b.start, time: b.time, string: n.string, fret: n.fret,
          midi: n.midi, fp: n.midi - tinfo.shift, tied: n.tied, dead: n.dead, tapping: !!b.tapping, harmonic: n.harmonic, bend: n.bend, hammer: n.hammer, slide: n.slide };
        rec.pc = ((rec.fp % 12) + 12) % 12; // pitch class in fingering space
        rec.spc = ((rec.midi % 12) + 12) % 12; // sounding
        rec.analyzed = !rec.tied && !rec.dead && !(opts.excludeTapping && rec.tapping) && !(opts.excludeHarmonics && rec.harmonic);
        out.push(rec);
      }
    });
    abs += m.length || 3840;
  });
  return { notes: out, tinfo };
}

function chooseSet(scored, preferRoots) {
  const best = scored.scores[0].coverage;
  const tied = scored.scores.filter((s) => s.coverage >= best - 0.025);
  for (const r of preferRoots) { const hit = tied.find((s) => s.root === r); if (hit) return hit; }
  return tied[0];
}

function analyze(song, ti, opts = {}) {
  opts = Object.assign({ segment: "auto", excludeTapping: false, excludeHarmonics: false, lockKey: false, threshold: 0.75, switchPenalty: 2 }, opts);
  const { notes, tinfo } = flattenNotes(song, ti, opts);
  const used = notes.filter((n) => n.analyzed);
  const t = song.tracks[ti];
  const nMeasures = t.measures.length;

  // global
  const nonTap = used.filter((n) => !n.tapping);
  const gScore = scoreSets(nonTap.length >= 30 ? nonTap : used);
  const gSet = gScore.scores[0];
  const gMode = tonicEvidence(nonTap.length >= 30 ? nonTap : used, gSet.root);
  const global = { root: gSet.root, coverage: gSet.coverage, mode: gMode, hist: gScore.hist, total: gScore.total, alts: gScore.scores.slice(0, 3) };

  // chord / text annotations per measure
  const ann = Array.from({ length: nMeasures }, () => []);
  t.measures.forEach((m, mi) => m.beats.forEach((b) => { if (b.chord) ann[mi].push(b.chord.trim()); else if (b.text && b.text.length <= 14) ann[mi].push(b.text.trim()); }));
  const tapCount = new Array(nMeasures).fill(0); const perM = new Array(nMeasures).fill(0);
  for (const n of notes) { perM[n.measure]++; if (n.tapping) tapCount[n.measure]++; }

  // measure-level choice
  const byMeasure = Array.from({ length: nMeasures }, () => []);
  for (const n of used) byMeasure[n.measure].push(n);

  let ranges = [];
  if (opts.segment === "all") ranges = [[0, nMeasures - 1]];
  else if (opts.segment === "auto") {
    // Dynamic programming (Viterbi): one pentatonic root per measure, penalty for switching.
    const W = byMeasure.map((ns) => ns.reduce((s, n) => s + noteWeight(n), 0) / 960);
    const cov = byMeasure.map((ns) => { const sc = scoreSets(ns); const c = new Array(12).fill(0); for (const s of sc.scores) c[s.root] = s.coverage; return c; });
    const lambda = opts.switchPenalty;
    let cost = new Array(12).fill(0).map((_, r) => (r === global.root ? 0 : 0.01));
    const back = [];
    for (let mi = 0; mi < nMeasures; mi++) {
      const nc = new Array(12), bk = new Array(12);
      for (let r = 0; r < 12; r++) {
        let best = Infinity, arg = 0;
        for (let q = 0; q < 12; q++) { const c = cost[q] + (q === r ? 0 : lambda); if (c < best) { best = c; arg = q; } }
        const local = W[mi] ? (1 - cov[mi][r]) * W[mi] + (r === global.root ? 0 : 0.001) : 0;
        nc[r] = best + local; bk[r] = arg;
      }
      back.push(bk); cost = nc;
    }
    let r = cost.indexOf(Math.min(...cost)); const path = new Array(nMeasures);
    for (let mi = nMeasures - 1; mi >= 0; mi--) { path[mi] = r; r = back[mi][r]; }
    // also split where tapping starts/stops
    const isTap = tapCount.map((c, i) => perM[i] ? c / perM[i] >= 0.2 : null);
    for (let mi = 1; mi < nMeasures; mi++) if (isTap[mi] === null) isTap[mi] = isTap[mi - 1];
    let start = 0;
    for (let mi = 1; mi <= nMeasures; mi++) {
      if (mi < nMeasures && path[mi] === path[start] && isTap[mi] === isTap[start]) continue;
      ranges.push([start, mi - 1]); start = mi;
    }
  } else {
    const size = +opts.segment;
    for (let s = 0; s < nMeasures; s += size) ranges.push([s, Math.min(nMeasures - 1, s + size - 1)]);
  }

  const segments = [];
  let prevRoot = null;
  for (const [a, b] of ranges) {
    const ns = used.filter((n) => n.measure >= a && n.measure <= b);
    const all = notes.filter((n) => n.measure >= a && n.measure <= b);
    const seg = { from: a, to: b, notes: all, count: ns.length };
    const annotations = []; let taps = 0, tot = 0;
    for (let mi = a; mi <= b; mi++) { annotations.push(...ann[mi]); taps += tapCount[mi]; tot += perM[mi]; }
    seg.annotations = annotations; seg.tapShare = tot ? taps / tot : 0;
    if (!ns.length) { seg.empty = true; segments.push(seg); continue; }
    const sc = scoreSets(ns);
    const pick = opts.lockKey ? sc.scores.find((s) => s.root === global.root) : chooseSet(sc, [global.root, prevRoot].filter((x) => x !== null));
    seg.root = pick.root; seg.coverage = pick.coverage; seg.hist = sc.hist; seg.total = sc.total;
    seg.alts = sc.scores.filter((s) => s.root !== pick.root).slice(0, 2);
    seg.mode = pick.root === global.root ? global.mode : tonicEvidence(ns, pick.root);
    seg.pentatonic = pick.coverage >= opts.threshold;
    // arpeggio detection: tapping, or measures built from <=3 pitch classes forming a triad
    let triadMeasures = 0, mWith = 0;
    for (let mi = a; mi <= b; mi++) {
      const pcs = [...new Set(byMeasure[mi].map((n) => n.pc))]; if (!pcs.length) continue; mWith++;
      if (pcs.length <= 4 && byMeasure[mi].length >= 6 && isTriadish(pcs)) triadMeasures++;
    }
    seg.distinctPcs = new Set(ns.map((n) => n.pc)).size;
    seg.kind = seg.tapShare >= 0.2 || (mWith && triadMeasures / mWith >= 0.6) ? "arpeggio" : seg.distinctPcs <= 3 ? "sparse" : seg.pentatonic ? "pentatonic" : "other";
    prevRoot = pick.root;
    // out-of-scale degrees
    const extra = {};
    for (const n of ns) { const rel = (n.pc - pick.root + 12) % 12; if (!MINOR_PENT.includes(rel)) extra[rel] = (extra[rel] || 0) + noteWeight(n); }
    seg.extra = Object.entries(extra).map(([rel, w]) => ({ rel: +rel, share: w / sc.total })).sort((x, y) => y.share - x.share);
    seg.flavor = describeFlavor(seg);
    // boxes
    const geo = buildBoxes(pick.root, tinfo.ref, tinfo.fingered);
    seg.geo = geo;
    const regionCount = {};
    for (const n of ns) { const regs = geo.lookup[`${n.string}:${n.fret}`] || []; for (const r of regs) regionCount[r.id] = (regionCount[r.id] || 0) + 1; }
    const inScale = ns.filter((n) => geo.lookup[`${n.string}:${n.fret}`]);
    // greedy cover: pick region covering most uncovered notes, repeat
    const remaining = new Set(inScale); const regions = [];
    while (remaining.size) {
      let best = null, bestHits = 0;
      for (const b of geo.boxes) for (const v of b.variants) {
        let h = 0; for (const n of remaining) if (v.pos.some((x) => x.string === n.string && x.fret === n.fret)) h++;
        if (h > bestHits || (h === bestHits && best && regionCount[v.id] > regionCount[best.id])) { best = v; bestHits = h; }
      }
      if (!best || !bestHits) break;
      const share = (regionCount[best.id] || 0) / ns.length;
      regions.push({ region: best, notes: regionCount[best.id] || 0, share });
      for (const n of [...remaining]) if (best.pos.some((x) => x.string === n.string && x.fret === n.fret)) remaining.delete(n);
    }
    seg.regions = regions;
    // assign each note to a region (first in regions list containing it)
    for (const n of all) {
      const regs = geo.lookup[`${n.string}:${n.fret}`];
      n.region = null; n.degree = (n.pc - pick.root + 12) % 12;
      if (regs) { for (const r of regions) if (regs.includes(r.region)) { n.region = r.region; break; } if (!n.region) n.region = regs[0]; }
    }
    // dominant region per measure
    seg.measureRegion = {};
    for (let mi = a; mi <= b; mi++) {
      const c = {}; for (const n of byMeasure[mi]) if (n.region) c[n.region.id] = (c[n.region.id] || 0) + 1;
      const top = Object.entries(c).sort((x, y) => y[1] - x[1])[0];
      if (top) seg.measureRegion[mi] = regions.find((r) => r.region.id === top[0])?.region || null;
    }
    segments.push(seg);
  }
  return { notes, tinfo, global, segments, track: t };
}

function isTriadish(pcs) {
  // true if some root has major or minor (or dim) triad covering >= all but one of pcs
  for (const r of pcs) for (const q of [[0, 4, 7], [0, 3, 7], [0, 3, 6], [0, 4, 7, 10], [0, 3, 7, 10]]) {
    const set = q.map((x) => (r + x) % 12); const out = pcs.filter((p) => !set.includes(p)).length;
    if (out === 0 && pcs.length >= 3) return true;
  }
  return false;
}

function describeFlavor(seg) {
  const has = (r, min = 0.03) => seg.extra.some((e) => e.rel === r && e.share >= min);
  const tags = [];
  if (has(6)) tags.push("bluesskala (b5)");
  if (has(2) && has(8)) tags.push("naturlig moll / eolisk (2 + b6)");
  else if (has(2) && has(9)) tags.push("dorisk (2 + 6)");
  else if (has(2)) tags.push("+ 2 (nia)");
  else if (has(9)) tags.push("+ 6 (dorisk färg)");
  else if (has(8)) tags.push("+ b6");
  if (has(4)) tags.push("+ dur-ters (3)");
  if (has(11)) tags.push("+ ledton (7)");
  return tags;
}

// ── alphaTab adapter (MQ-TAB) ──
// Builds the song shape analyze() expects from an alphaTab Score, so the
// analysis runs on every format alphaTab reads (gp3–gp8, gpx, MusicXML).
// Differences from alphaTab's model that matter:
//  - alphaTab string 1 is the LOWEST string; here string 1 is the highest.
//  - Grace-note beats are skipped: Pentabox's GP3/4 reader drops grace notes too.
//  - Notated (display) timing is used: playback timing shortens the beat
//    before a grace note, which Pentabox does not do.
// Returns { song, noteAt } where noteAt(measure, beat, string) gives the
// alphaTab Note behind an analysed note, for styling.
function songFromAlphaTab(score) {
  const refs = [];
  const song = {
    title: score.title, artist: score.artist, tempo: score.tempo,
    measures: score.masterBars.map((mb, i) => ({ index: i, num: mb.timeSignatureNumerator, den: mb.timeSignatureDenominator })),
    tracks: [],
  };
  score.tracks.forEach((track, ti) => {
    const staff = track.staves[0];
    const tuning = staff.stringTuning.tunings.slice();
    const n = tuning.length;
    const percussion = !!(staff.isPercussion || n === 0);
    const lookup = new Map();
    const measures = staff.bars.map((bar, mi) => {
      const beats = [];
      for (const voice of bar.voices) {
        for (const b of voice.beats) {
          if (b.graceType) continue;
          beats.push(b);
        }
      }
      beats.sort((x, y) => x.displayStart - y.displayStart);
      let length = 0;
      const out = beats.map((b, bi) => {
        const rec = {
          start: b.displayStart, time: b.displayDuration, empty: b.isEmpty,
          tapping: !!b.tap, chord: b.chord ? b.chord.name : undefined, text: b.text || undefined, notes: [],
        };
        if (!b.isEmpty) length = Math.max(length, b.displayStart + b.displayDuration);
        if (!percussion) {
          for (const note of b.notes) {
            const s = n - note.string + 1;
            const fret = note.fret < 0 ? 0 : note.fret;
            rec.notes.push({ string: s, fret, midi: tuning[s - 1] + fret, tied: !!note.isTieDestination, dead: !!note.isDead, harmonic: note.harmonicType ? note.harmonicType : undefined });
            lookup.set(mi + ':' + bi + ':' + s, note);
          }
          rec.notes.sort((x, y) => x.string - y.string);
        }
        return rec;
      });
      return { beats: out, length };
    });
    refs.push(lookup);
    song.tracks.push({ index: ti, name: track.name, percussion, tuning, measures });
  });
  return { song, noteAt: (ti, mi, bi, s) => refs[ti].get(mi + ':' + bi + ':' + s) || null };
}

const api = { analyze, buildBoxes, tuningInfo, noteName, songFromAlphaTab, MINOR_PENT, DEGREE_NAMES };
if (typeof module !== "undefined" && module.exports) module.exports = api;
else root.MQTabAnalysis = api;
})(typeof window !== "undefined" ? window : this);
