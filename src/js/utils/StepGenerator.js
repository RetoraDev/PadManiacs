/**
 * @class StepGenerator
 * @category Utility Classes
 * @summary Generates step patterns for a chart section from audio onsets
 * @constructor
 * @features
 * Analyzes audio onset strengths and maps them to beats
 * Generates taps/holds/rolls/mines with style and rating-driven density
 * Supports editor-snap or auto-detected subdivisions (up to max editor resolution)
 * Respects existing notes via remove or overwrite-collisions conflict modes
 * @description
 * Utility for automatic step generation in the editor. Uses onset detection to
 * find rhythmically relevant grid positions within a beat range and places
 * notes according to style, difficulty rating, and allowed note types.
 */
class StepGenerator {
  constructor() {}

  /**
   * Computes total beat span for the song (audio end or last chart element).
   * @param {Object} editor - Editor instance
   * @returns {number}
   */
  static getSongTotalBeats(editor) {
    let maxBeat = 0;
    try {
      const chart = editor.song && editor.song.chart ? editor.song.chart : null;
      if (chart) {
        if (Array.isArray(chart.bpmChanges)) {
          chart.bpmChanges.forEach(b => { if (b && isFinite(b.beat)) maxBeat = Math.max(maxBeat, b.beat); });
        }
        if (Array.isArray(chart.stops)) {
          chart.stops.forEach(s => { if (s && isFinite(s.beat)) maxBeat = Math.max(maxBeat, s.beat + (s.len || 0)); });
        }
        if (Array.isArray(chart.backgrounds)) {
          chart.backgrounds.forEach(b => { if (b && isFinite(b.beat)) maxBeat = Math.max(maxBeat, b.beat); });
        }
        if (chart.difficulties && chart.notes) {
          chart.difficulties.forEach(diff => {
            const key = diff.type + diff.rating;
            const notes = chart.notes[key] || [];
            notes.forEach(n => {
              if (!n) return;
              if (isFinite(n.beat)) maxBeat = Math.max(maxBeat, n.beat);
              if (isFinite(n.beatEnd)) maxBeat = Math.max(maxBeat, n.beatEnd);
            });
          });
        }
      }
      if (editor.chartRenderer && typeof editor.getEditorAudioDuration === 'function') {
        const dur = editor.getEditorAudioDuration();
        if (isFinite(dur) && dur > 0) {
          const offset = (chart && chart.offset) || 0;
          const user = typeof editor.getAudioOffset === 'function' ? editor.getAudioOffset() : 0;
          const sec = dur + offset - user;
          const b = editor.chartRenderer.secToBeat(sec);
          if (isFinite(b)) maxBeat = Math.max(maxBeat, b);
        }
      }
    } catch (e) {}
    return Math.max(1, Math.ceil(maxBeat + 1));
  }

  /**
   * Generates steps into the current difficulty.
   * @param {Object} editor - Editor instance
   * @param {Object} cfg - Configuration
   * @returns {{placed:number, removed:number}}
   */
  static generate(editor, cfg) {
    const chart = editor.song && editor.song.chart ? editor.song.chart : null;
    if (!chart || !editor.chartRenderer) return { placed: 0, removed: 0 };
    const diff = chart.difficulties[editor.currentDifficultyIndex];
    if (!diff) return { placed: 0, removed: 0 };
    const key = diff.type + diff.rating;
    if (!chart.notes[key]) chart.notes[key] = [];
    const notesArr = chart.notes[key];

    const startBeat = Math.max(0, Number(cfg.startBeat) || 0);
    const lengthBeats = Math.max(0, Number(cfg.lengthBeats) || 0);
    const endBeat = startBeat + lengthBeats;
    if (!(lengthBeats > 0) || endBeat <= startBeat) return { placed: 0, removed: 0 };

    const snapDiv = Math.max(1, Number(editor.snapDivision) || 4);
    const maxStep = 4 / snapDiv; // beat units, finest allowed
    const rating = Math.max(1, Math.min(20, Math.round(Number(cfg.rating) || 5)));
    const style = cfg.style || 'Stream';
    const autoSnap = !!cfg.autoSnap;
    const removeExisting = !!cfg.removeExisting;
    const allowHolds = !!cfg.allowHolds;
    const allowMines = !!cfg.allowMines;
    const allowJumps = cfg.allowJumps !== false;

    // Remove/collect existing in range
    let removed = 0;
    if (removeExisting) {
      for (let i = notesArr.length - 1; i >= 0; i--) {
        const n = notesArr[i];
        if (!n) continue;
        const nb = Number(n.beat);
        const nEnd = (n.type === '2' || n.type === '4') && isFinite(n.beatEnd) ? n.beatEnd : nb;
        const overlaps = (nb >= startBeat - 1e-9 && nb < endBeat - 1e-9) ||
          (nEnd > startBeat + 1e-9 && nEnd <= endBeat + 1e-9) ||
          (nb <= startBeat + 1e-9 && nEnd >= endBeat - 1e-9);
        if (overlaps) {
          try { editor.chartRenderer.killNote(n); } catch (e) {}
          notesArr.splice(i, 1);
          removed++;
        }
      }
      // also clear selection entries that were removed
      if (Array.isArray(editor.selectedNotes)) {
        editor.selectedNotes = editor.selectedNotes.filter(n => notesArr.indexOf(n) !== -1);
      }
    }

    const onsetData = this._buildOnsetEnergy(editor, startBeat, endBeat, maxStep);
    const candidates = this._selectCandidates(editor, startBeat, endBeat, maxStep, autoSnap, rating, style, onsetData);
    const placed = this._placeNotes(editor, notesArr, candidates, {
      rating, style, allowHolds, allowMines, allowJumps, maxStep, endBeat, overwriteOnly: !removeExisting
    });

    try { editor.sortNotes(); } catch (e) { notesArr.sort((a,b)=>a.beat-b.beat || a.column-b.column); }
    try { editor.refreshMetronome(); } catch (e) {}
    try { editor.rearrangeNotes(); } catch (e) {}
    try { editor.updateInfoText(); } catch (e) {}
    try { editor.chartRenderer.load(editor.song, editor.currentDifficultyIndex); } catch (e) {}

    return { placed, removed };
  }

  static _buildOnsetEnergy(editor, startBeat, endBeat, maxStep) {
    const map = new Map();
    const onsetBeats = [];
    const buf = editor.audioBuffer;
    if (!buf) return { map, onsetBeats };
    try {
      const sr = buf.sampleRate;
      const samples = this._mono(buf);
      const onsets = this._findOnsets(samples, sr);
      if (!onsets.length) return { map, onsetBeats };
      for (let i = 0; i < onsets.length; i++) {
        const sec = onsets[i].pos / sr;
        const beat = editor.chartRenderer.secToBeat(sec);
        if (!isFinite(beat) || beat < startBeat - maxStep || beat >= endBeat + maxStep) continue;
        const strength = onsets[i].strength || 1;
        onsetBeats.push({ beat, strength });
        // quantize to nearest maxStep grid for lookup
        const q = Math.round(beat / maxStep) * maxStep;
        if (q >= startBeat - 1e-9 && q < endBeat - 1e-9) {
          const key = this._key(q);
          map.set(key, (map.get(key) || 0) + strength);
        }
      }
    } catch (e) {}
    return { map, onsetBeats };
  }

  static _mono(audioBuffer) {
    const chs = audioBuffer.numberOfChannels || 1;
    const len = audioBuffer.length;
    if (chs === 1) {
      const c = audioBuffer.getChannelData(0);
      const out = new Float32Array(len);
      out.set(c);
      return out;
    }
    const out = new Float32Array(len);
    const c0 = audioBuffer.getChannelData(0);
    const c1 = chs > 1 ? audioBuffer.getChannelData(1) : null;
    if (c1) {
      for (let i = 0; i < len; i++) out[i] = (c0[i] + c1[i]) * 0.5;
    } else {
      for (let c = 0; c < chs; c++) {
        const d = audioBuffer.getChannelData(c);
        for (let i = 0; i < len; i++) out[i] += d[i] / chs;
      }
    }
    return out;
  }

  static _hann(size) {
    const w = new Float64Array(size);
    const t = (2 * Math.PI) / (size - 1);
    for (let i = 0; i < size; i++) w[i] = 0.5 - 0.5 * Math.cos(i * t);
    return w;
  }

  static _fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      while (j & bit) { j ^= bit; bit >>= 1; }
      j ^= bit;
      if (i < j) {
        let tmp = re[i]; re[i] = re[j]; re[j] = tmp;
        tmp = im[i]; im[i] = im[j]; im[j] = tmp;
      }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = -2 * Math.PI / len;
      const wlenRe = Math.cos(ang), wlenIm = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let wRe = 1, wIm = 0;
        const half = len >> 1;
        for (let j = 0; j < half; j++) {
          const u = i + j, v = i + j + half;
          const xRe = re[u], xIm = im[u];
          const yRe = re[v] * wRe - im[v] * wIm;
          const yIm = re[v] * wIm + im[v] * wRe;
          re[u] = xRe + yRe; im[u] = xIm + yIm;
          re[v] = xRe - yRe; im[v] = xIm - yIm;
          const nwr = wRe * wlenRe - wIm * wlenIm;
          wIm = wRe * wlenIm + wIm * wlenRe;
          wRe = nwr;
        }
      }
    }
  }

  static _findOnsets(samples, samplerate) {
    const n = samples.length;
    if (n < 2048) return [];
    let factor = 1;
    if (samplerate >= 44100) factor = 2;
    if (samplerate >= 88200) factor = 4;
    let ds = samples;
    if (factor > 1) {
      const dn = Math.floor(n / factor);
      ds = new Float32Array(dn);
      for (let i = 0, j = 0; i < dn; i++, j += factor) {
        let sum = 0;
        for (let k = 0; k < factor; k++) sum += samples[j + k] || 0;
        ds[i] = sum / factor;
      }
    }
    const frameSize = 1024, hop = 512;
    if (ds.length < frameSize + hop) return [];
    const numBins = (frameSize >> 1) + 1;
    const prevMag = new Float64Array(numBins);
    const flux = [];
    const win = this._hann(frameSize);
    const re = new Float64Array(frameSize), im = new Float64Array(frameSize);
    for (let pos = 0; pos + frameSize <= ds.length; pos += hop) {
      for (let i = 0; i < frameSize; i++) { re[i] = (ds[pos + i] || 0) * win[i]; im[i] = 0; }
      this._fft(re, im);
      let f = 0;
      for (let b = 0; b < numBins; b++) {
        const mag = Math.sqrt(re[b] * re[b] + im[b] * im[b]);
        const diff = mag - prevMag[b];
        if (diff > 0) f += diff;
        prevMag[b] = mag;
      }
      flux.push(f);
    }
    if (flux.length < 3) return [];
    let mean = 0; for (let i = 0; i < flux.length; i++) mean += flux[i]; mean /= flux.length;
    let variance = 0; for (let i = 0; i < flux.length; i++) { const d = flux[i] - mean; variance += d * d; }
    const std = Math.sqrt(variance / flux.length);
    const threshold = mean + std * 0.25;
    const out = [];
    for (let i = 1; i < flux.length - 1; i++) {
      const v = flux[i];
      if (v >= threshold && v >= flux[i - 1] && v >= flux[i + 1]) {
        // parabolic interpolation for sub-frame peak timing
        let delta = 0;
        const denom = (flux[i - 1] - 2 * v + flux[i + 1]);
        if (denom !== 0) {
          delta = 0.5 * (flux[i - 1] - flux[i + 1]) / denom;
          if (!isFinite(delta)) delta = 0;
          delta = Math.max(-0.5, Math.min(0.5, delta));
        }
        const p = Math.round((i + delta) * hop * factor);
        if (p >= 0 && p < n) out.push({ pos: p, strength: v });
      }
    }
    return out;
  }

  static _key(beat) {
    return Math.round(beat * 10000);
  }

  static _selectCandidates(editor, startBeat, endBeat, maxStep, autoSnap, rating, style, onsetData) {
    const onsetEnergy = (onsetData && onsetData.map) ? onsetData.map : (onsetData instanceof Map ? onsetData : new Map());
    const onsetBeats = (onsetData && onsetData.onsetBeats) ? onsetData.onsetBeats : [];
    // base allowed subdivisions up to max resolution
    const baseDivs = [1, 0.5, 0.25, 1/3, 1/6, 0.125, 1/12, 0.0625, 1/24, 1/48]; // 4th,8th,16th,12th,...
    const allowed = baseDivs.filter(d => d >= maxStep - 1e-9).sort((a,b)=>b-a);
    if (!allowed.length) allowed.push(maxStep);

    const density = this._densityFor(rating, style); // notes per beat approx target
    const candidates = [];
    const eps = 1e-9;

    if (!autoSnap) {
      // uniform grid on editor snap, close to density and <= max resolution
      let chosen = allowed[allowed.length - 1];
      for (let i = 0; i < allowed.length; i++) {
        const d = allowed[i];
        const perBeat = 1 / d;
        if (perBeat <= density * 1.5) { chosen = d; break; }
      }
      if (chosen < maxStep) chosen = maxStep;
      for (let b = startBeat; b < endBeat - eps; b += chosen) {
        const q = Math.round(b / maxStep) * maxStep;
        if (q >= startBeat - eps && q < endBeat - eps) candidates.push(q);
      }
    } else if (onsetBeats.length === 0 && onsetEnergy.size === 0) {
      // no audio/onsets: fallback to uniform grid
      let chosen = this._subdivForRating(rating, allowed);
      if (chosen < maxStep) chosen = maxStep;
      const alignedStep = this._alignStep(chosen, maxStep);
      for (let b = startBeat; b < endBeat - eps; b += alignedStep) {
        const q = Math.round(b / maxStep) * maxStep;
        if (q >= startBeat - eps && q < endBeat - eps) candidates.push(q);
      }
    } else {
      // per-onset snapping: place notes at onset beats quantized to the needed
      // subdivision (nearest point on the editor's max snap grid), mixing
      // subdivisions in the same section. Select strongest onsets up to density.
      const all = this._getOnsetsInRange(onsetBeats, startBeat - maxStep, endBeat + maxStep)
        .filter(o => o.beat >= startBeat - eps && o.beat < endBeat - eps);
      if (all.length === 0) {
        let chosen = this._subdivForRating(rating, allowed);
        if (chosen < maxStep) chosen = maxStep;
        const alignedStep = this._alignStep(chosen, maxStep);
        for (let b = startBeat; b < endBeat - eps; b += alignedStep) {
          const q = Math.round(b / maxStep) * maxStep;
          if (q >= startBeat - eps && q < endBeat - eps) candidates.push(q);
        }
      } else {
        const lengthBeats = Math.max(0, endBeat - startBeat);
        const targetCount = Math.max(1, Math.round(density * lengthBeats));
        const minGap = this._minGapFor(rating, style, maxStep, density);
        const sorted = all.slice().sort((a, b) => (b.strength || 0) - (a.strength || 0) || a.beat - b.beat);
        const picked = [];
        const pickedKeys = new Set();
        for (let i = 0; i < sorted.length && picked.length < targetCount; i++) {
          const ob = sorted[i].beat;
          let q = Math.round(ob / maxStep) * maxStep;
          if (q < startBeat) q = Math.ceil(startBeat / maxStep - 1e-9) * maxStep;
          if (q >= endBeat - eps || q < startBeat - eps) continue;
          const key = this._key(q);
          if (pickedKeys.has(key)) continue;
          let tooClose = false;
          for (let j = 0; j < picked.length; j++) {
            if (Math.abs(picked[j] - q) < minGap - 1e-9) { tooClose = true; break; }
          }
          if (tooClose) continue;
          pickedKeys.add(key);
          picked.push(q);
        }
        for (let i = 0; i < picked.length; i++) candidates.push(picked[i]);
      }
    }

    // unique & sort
    const uniq = [];
    const seen = new Set();
    candidates.sort((a,b)=>a-b);
    for (let i=0;i<candidates.length;i++) {
      const q = Math.round(candidates[i] / maxStep) * maxStep;
      const k = this._key(q);
      if (seen.has(k)) continue;
      if (q < startBeat - eps || q >= endBeat - eps) continue;
      seen.add(k);
      uniq.push(q);
    }
    return uniq;
  }

  static _alignStep(step, maxStep) {
    // make step a multiple of maxStep
    const r = Math.round(step / maxStep);
    return Math.max(maxStep, r * maxStep);
  }

  static _minGapFor(rating, style, maxStep, density) {
    const d = Math.max(density || 1, 0.25);
    let gap = Math.max(maxStep, (1 / d) * 0.6);
    if (rating <= 3) gap = Math.max(gap, 0.5);
    else if (rating <= 5) gap = Math.max(gap, 0.25);
    else if (rating <= 8) gap = Math.max(gap, 1 / 6);
    if (style === 'Stamina' || style === 'Stream') gap = Math.max(maxStep, gap * 0.85);
    if (style === 'Technical') gap = Math.max(maxStep, gap * 0.9);
    gap = Math.min(gap, Math.max(maxStep, (1 / d) * 1.1));
    return gap;
  }

  static _getOnsetsInRange(onsetBeats, start, end) {
    if (!onsetBeats || !onsetBeats.length) return [];
    const out = [];
    for (let i = 0; i < onsetBeats.length; i++) {
      const b = onsetBeats[i].beat;
      if (b >= start && b < end) out.push(onsetBeats[i]);
    }
    return out;
  }

  static _scoreGridPoint(beat, onsetBeats, gridStep, maxStep) {
    if (!onsetBeats || !onsetBeats.length) return 0;
    const tol = Math.max(maxStep * 0.51, (gridStep || maxStep) * 0.3);
    let score = 0;
    for (let i = 0; i < onsetBeats.length; i++) {
      const d = Math.abs(onsetBeats[i].beat - beat);
      if (d <= tol) {
        const w = 1 - (d / (tol + 1e-9));
        score += (onsetBeats[i].strength || 1) * (0.35 + 0.65 * w);
      }
    }
    return score;
  }

  static _densityFor(rating, style) {
    // approximate notes per beat
    let base = 0.5 + rating * 0.25; // 1->0.75, 10->3, 20->5.5
    if (style === 'Stamina' || style === 'Stream') base *= 1.15;
    if (style === 'Technical') base *= 1.05;
    if (style === 'DDR') base *= 0.9;
    return Math.max(0.25, Math.min(8, base));
  }

  static _subdivForRating(rating, allowed) {
    // pick from allowed (sorted desc = larger step) based on rating
    if (rating <= 3) return allowed[0] || 1;
    if (rating <= 6) return allowed[Math.min(1, allowed.length-1)];
    if (rating <= 9) return allowed[Math.min(2, allowed.length-1)];
    if (rating <= 13) return allowed[Math.min(3, allowed.length-1)];
    return allowed[allowed.length-1];
  }

  static _subdivForSegment(segOnsets, segStart, segEnd, maxStep, allowed, rating) {
    // compare alignment of actual onsets against candidate subdivisions
    let best = this._subdivForRating(rating, allowed);
    let bestScore = -1;
    const eps = 1e-9;
    for (let i = 0; i < allowed.length; i++) {
      const div = allowed[i];
      if (div < maxStep - 1e-9) continue;
      const step = this._alignStep(div, maxStep);
      let score = 0;
      for (let j = 0; j < segOnsets.length; j++) {
        const ob = segOnsets[j].beat;
        const g = Math.round((ob - segStart) / step) * step + segStart;
        const qg = Math.round(g / maxStep) * maxStep;
        if (qg < segStart - eps || qg >= segEnd - eps) continue;
        const d = Math.abs(ob - qg);
        const tol = Math.max(maxStep * 0.51, step * 0.35);
        if (d <= tol) {
          const w = 1 - (d / (tol + 1e-9));
          score += (segOnsets[j].strength || 1) * (0.4 + 0.6 * w);
        }
      }
      // bias toward rating-appropriate fineness
      const fineness = 1 / step;
      const pref = this._densityFor(rating, 'Stream');
      const bias = 1 / (1 + Math.abs(fineness - pref));
      const s = score * bias;
      if (s > bestScore) { bestScore = s; best = div; }
    }
    return best;
  }

  static _placeNotes(editor, notesArr, candidates, opt) {
    const { rating, style, allowHolds, allowMines, allowJumps, maxStep, endBeat, overwriteOnly } = opt;
    let placed = 0;
    let lastCols = [];
    let prevBeat = -999;

    const jumpProb = this._jumpProb(rating, style, allowJumps);
    const mineProb = allowMines ? this._mineProb(rating, style) : 0;
    const holdProb = allowHolds ? this._holdProb(rating, style) : 0;

    for (let i = 0; i < candidates.length; i++) {
      const beat = candidates[i];
      if (beat >= endBeat - 1e-9) continue;

      // decide if mine instead of tap (sparse)
      if (allowMines && Math.random() < mineProb && (beat - prevBeat) >= maxStep * 1.5) {
        const col = this._pickColumn(lastCols, style, 1)[0];
        placed += this._insertNote(editor, notesArr, { type: 'M', beat, column: col }, overwriteOnly) ? 1 : 0;
        lastCols = [col];
        prevBeat = beat;
        continue;
      }

      const doJump = allowJumps && Math.random() < jumpProb;
      const count = doJump ? 2 : 1;
      const cols = this._pickColumn(lastCols, style, count);

      // maybe hold
      let didHold = false;
      if (allowHolds && Math.random() < holdProb && i + 1 < candidates.length) {
        const col = cols[0];
        const next = candidates[i + 1];
        const dur = next - beat;
        if (dur >= maxStep * 2 - 1e-9 && dur <= 4.0) {
          didHold = this._insertFreeze(editor, notesArr, beat, dur, col, rating >= 12 && style === 'Technical' ? '4' : '2', overwriteOnly);
          if (didHold) {
            placed++;
            lastCols = [col];
            prevBeat = beat;
            continue;
          }
        }
      }

      for (let c = 0; c < cols.length; c++) {
        const ok = this._insertNote(editor, notesArr, { type: '1', beat, column: cols[c] }, overwriteOnly);
        if (ok) placed++;
      }
      lastCols = cols.slice();
      prevBeat = beat;
    }
    return placed;
  }

  static _jumpProb(rating, style, allowJumps) {
    if (!allowJumps) return 0;
    let p = Math.max(0, (rating - 3) * 0.03);
    if (style === 'Jumpstream' || style === 'DDR') p += 0.12;
    if (style === 'Stream' || style === 'Stamina') p *= 0.5;
    if (style === 'Technical') p += 0.05;
    return Math.max(0, Math.min(0.45, p));
  }
  static _mineProb(rating, style) {
    let p = Math.max(0, (rating - 6) * 0.01);
    if (style === 'Technical') p += 0.08;
    if (style === 'DDR') p += 0.03;
    return Math.max(0, Math.min(0.18, p));
  }
  static _holdProb(rating, style) {
    let p = Math.max(0, (rating - 4) * 0.015);
    if (style === 'Technical') p += 0.08;
    if (style === 'Stamina') p *= 0.5;
    if (style === 'Stream') p *= 0.6;
    return Math.max(0, Math.min(0.2, p));
  }

  static _pickColumn(lastCols, style, count) {
    const all = [0,1,2,3];
    let pool = all.slice();
    // avoid repeating same single column too often
    if (count === 1 && lastCols.length === 1) {
      if (Math.random() < 0.75) pool = all.filter(c => c !== lastCols[0]);
      if (!pool.length) pool = all.slice();
    }
    // simple flow: prefer movement
    if (count === 2) {
      const pairs = [[0,1],[1,2],[2,3],[0,2],[1,3],[0,3]];
      // avoid same pair
      let cand = pairs.slice();
      if (lastCols.length === 2) {
        const key = lastCols.slice().sort().join(',');
        cand = pairs.filter(p => p.join(',') !== key);
        if (!cand.length) cand = pairs.slice();
      }
      return cand[Math.floor(Math.random() * cand.length)].slice();
    }
    return [pool[Math.floor(Math.random() * pool.length)]];
  }

  static _insertNote(editor, notesArr, spec, overwriteOnly) {
    const beat = spec.beat;
    const column = spec.column;
    const existing = notesArr.find(n => n && n.column === column && Math.abs(n.beat - beat) < 0.001);
    if (existing) {
      if (!overwriteOnly) return false;
      try { editor.chartRenderer.killNote(existing); } catch (e) {}
      const idx = notesArr.indexOf(existing);
      if (idx > -1) notesArr.splice(idx, 1);
      if (Array.isArray(editor.selectedNotes)) {
        const si = editor.selectedNotes.indexOf(existing);
        if (si > -1) editor.selectedNotes.splice(si, 1);
      }
    }
    // also avoid placing tap inside a hold occupying this column? simple check
    for (let i = 0; i < notesArr.length; i++) {
      const n = notesArr[i];
      if (!n || n.column !== column) continue;
      if ((n.type === '2' || n.type === '4') && isFinite(n.beatEnd)) {
        if (beat > n.beat + 1e-9 && beat < n.beatEnd - 1e-9) return false;
      }
    }
    const note = {
      type: spec.type || '1',
      beat: beat,
      sec: editor.chartRenderer.beatToSec(beat),
      column: column
    };
    notesArr.push(note);
    return true;
  }

  static _insertFreeze(editor, notesArr, startBeat, duration, column, type, overwriteOnly) {
    const endBeat = startBeat + duration;
    // remove/skip colliding notes in range on this column
    for (let i = notesArr.length - 1; i >= 0; i--) {
      const n = notesArr[i];
      if (!n || n.column !== column) continue;
      const nb = n.beat;
      const nEnd = (n.type === '2' || n.type === '4') && isFinite(n.beatEnd) ? n.beatEnd : nb;
      const collides = !(nEnd <= startBeat + 1e-9 || nb >= endBeat - 1e-9);
      if (collides) {
        if (!overwriteOnly) return false;
        try { editor.chartRenderer.killNote(n); } catch (e) {}
        notesArr.splice(i, 1);
        if (Array.isArray(editor.selectedNotes)) {
          const si = editor.selectedNotes.indexOf(n);
          if (si > -1) editor.selectedNotes.splice(si, 1);
        }
      }
    }
    const note = {
      type: type || '2',
      beat: startBeat,
      sec: editor.chartRenderer.beatToSec(startBeat),
      column: column,
      beatLength: duration,
      secLength: editor.chartRenderer.beatToSec(endBeat) - editor.chartRenderer.beatToSec(startBeat),
      beatEnd: endBeat,
      secEnd: editor.chartRenderer.beatToSec(endBeat)
    };
    notesArr.push(note);
    return true;
  }
}
