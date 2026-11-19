/**
 * @class BpmDetector
 * @category Utility Classes
 * @summary Audio tempo/BPM detection ported from ArrowVortex
 * @constructor
 * @features
 * Onset detection from decoded audio buffers
 * Tempo candidate estimation with gap-confidence scoring and polynomial normalization
 * Confidence-ranked BPM results with offset estimation
 * Optional result caching keyed by audio identity
 * @description
 * Analyzes an AudioBuffer to detect likely BPM values. The tempo estimation
 * algorithm (interval/gap confidence, refinement, deduplication and rounding)
 * is ported from ArrowVortex's FindTempo. Designed as an independent utility so
 * it can be reused by the editor and other parts of the game.
 * @example
 * const detector = new BpmDetector();
 * const { results } = detector.detect(audioBuffer, { cacheKey: song.audio });
 * // results: [{ bpm, offset, fitness, confidence }, ...] ordered by confidence
 */
class BpmDetector {
  constructor() {
    /** @type {string|null} Cache key for the last detection */
    this._cacheKey = null;
    /** @type {Array|null} Cached detection results */
    this._cacheResults = null;
  }

  /**
   * Clears cached detection results.
   * @param {string} [key] - If provided, only clear when it matches the cache key.
   */
  clearCache(key) {
    if (typeof key === "undefined" || key === null || key === this._cacheKey) {
      this._cacheKey = null;
      this._cacheResults = null;
    }
  }

  /**
   * Detects BPM candidates from an AudioBuffer.
   * @param {AudioBuffer} audioBuffer - Decoded audio buffer to analyze
   * @param {Object} [options]
   * @param {string} [options.cacheKey] - Audio identity key for caching/invalidation
   * @param {number} [options.startSec=0] - Analysis start time in seconds
   * @param {number} [options.durationSec] - Analysis duration in seconds
   * @returns {{results: Array<{bpm:number, offset:number, fitness:number, confidence:number}>}}
   */
  detect(audioBuffer, options = {}) {
    if (!audioBuffer) return { results: [] };

    const cacheKey = typeof options.cacheKey !== "undefined" ? options.cacheKey : null;
    if (cacheKey !== null) {
      if (cacheKey !== this._cacheKey) {
        this._cacheKey = cacheKey;
        this._cacheResults = null;
      } else if (this._cacheResults) {
        return { results: this._cacheResults.slice() };
      }
    }

    const samplerate = audioBuffer.sampleRate;
    const totalFrames = audioBuffer.length;
    const startFrame = Math.max(0, Math.floor((options.startSec || 0) * samplerate));
    const maxLen = Math.max(0, totalFrames - startFrame);
    const wantLen = typeof options.durationSec === "number"
      ? Math.floor(options.durationSec * samplerate)
      : maxLen;
    const numFrames = Math.max(0, Math.min(wantLen, maxLen));

    let results = [];
    if (numFrames > samplerate * 0.5) {
      const samples = this._getMonoSamples(audioBuffer, startFrame, numFrames);
      const onsets = this._findOnsets(samples, samplerate);
      this._recomputeOnsetStrengths(samples, onsets);
      results = this._calculateBPM(onsets, samplerate);
      if (results.length > 0) {
        this._calculateOffset(samples, samplerate, onsets, results);
      }
      // Normalize confidence for display
      let sum = 0;
      for (let i = 0; i < results.length; i++) sum += results[i].fitness;
      for (let i = 0; i < results.length; i++) {
        results[i].confidence = sum > 0 ? results[i].fitness / sum : 0;
      }
    }

    if (cacheKey !== null) {
      this._cacheKey = cacheKey;
      this._cacheResults = results.slice();
    }

    return { results: results.slice() };
  }

  // --------------------------------------------------------------------------------------------
  // Audio preparation and onset detection

  _getMonoSamples(audioBuffer, startFrame, numFrames) {
    const channels = audioBuffer.numberOfChannels || 1;
    const out = new Float32Array(numFrames);
    if (channels === 1) {
      const ch = audioBuffer.getChannelData(0);
      for (let i = 0; i < numFrames; i++) out[i] = ch[startFrame + i] || 0;
      return out;
    }
    const ch0 = audioBuffer.getChannelData(0);
    const ch1 = channels > 1 ? audioBuffer.getChannelData(1) : null;
    if (ch1) {
      for (let i = 0; i < numFrames; i++) {
        out[i] = ((ch0[startFrame + i] || 0) + (ch1[startFrame + i] || 0)) * 0.5;
      }
    } else {
      const inv = 1 / channels;
      for (let c = 0; c < channels; c++) {
        const ch = audioBuffer.getChannelData(c);
        for (let i = 0; i < numFrames; i++) out[i] += (ch[startFrame + i] || 0) * inv;
      }
    }
    return out;
  }

  _findOnsets(samples, samplerate) {
    const n = samples.length;
    if (n < 2048) return [];

    // Downsample for faster analysis
    let factor = 1;
    if (samplerate >= 44100) factor = 2;
    if (samplerate >= 88200) factor = 4;
    let dsRate = samplerate;
    let ds = samples;
    if (factor > 1) {
      const dn = Math.floor(n / factor);
      ds = new Float32Array(dn);
      for (let i = 0, j = 0; i < dn; i++, j += factor) {
        let sum = 0;
        for (let k = 0; k < factor; k++) sum += samples[j + k] || 0;
        ds[i] = sum / factor;
      }
      dsRate = samplerate / factor;
    }

    const frameSize = 1024;
    const hop = 512;
    if (ds.length < frameSize + hop) return [];

    const numBins = (frameSize >> 1) + 1;
    const prevMag = new Float64Array(numBins);
    const flux = [];
    const window = this._hannWindow(frameSize);
    const re = new Float64Array(frameSize);
    const im = new Float64Array(frameSize);

    for (let pos = 0; pos + frameSize <= ds.length; pos += hop) {
      for (let i = 0; i < frameSize; i++) {
        re[i] = (ds[pos + i] || 0) * window[i];
        im[i] = 0;
      }
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

    // Pick onset peaks
    let mean = 0;
    for (let i = 0; i < flux.length; i++) mean += flux[i];
    mean /= flux.length;
    let variance = 0;
    for (let i = 0; i < flux.length; i++) { const d = flux[i] - mean; variance += d * d; }
    const std = Math.sqrt(variance / flux.length);
    const threshold = mean + std * 0.3;

    const onsets = [];
    for (let i = 1; i < flux.length - 1; i++) {
      const v = flux[i];
      if (v >= threshold && v >= flux[i - 1] && v >= flux[i + 1]) {
        const pos = Math.round(i * hop * factor);
        if (pos >= 0 && pos < n) onsets.push({ pos, strength: v });
      }
    }
    return onsets;
  }

  _recomputeOnsetStrengths(samples, onsets) {
    const n = samples.length;
    for (let i = 0; i < onsets.length; i++) {
      const pos = onsets[i].pos;
      const a = Math.max(0, pos - 100);
      const b = Math.min(n, pos + 100);
      let v = 0;
      for (let j = a; j < b; j++) v += Math.abs(samples[j] || 0);
      const count = Math.max(1, b - a);
      onsets[i].strength = v / count;
    }
  }

  _hannWindow(size) {
    const w = new Float64Array(size);
    const t = (2 * Math.PI) / (size - 1);
    for (let i = 0; i < size; i++) w[i] = 0.5 - 0.5 * Math.cos(i * t);
    return w;
  }

  _fft(re, im) {
    const n = re.length;
    // bit-reversal permutation
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
      const wlenRe = Math.cos(ang);
      const wlenIm = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let wRe = 1, wIm = 0;
        const half = len >> 1;
        for (let j = 0; j < half; j++) {
          const u = i + j;
          const v = i + j + half;
          const xRe = re[u], xIm = im[u];
          const yRe = re[v] * wRe - im[v] * wIm;
          const yIm = re[v] * wIm + im[v] * wRe;
          re[u] = xRe + yRe; im[u] = xIm + yIm;
          re[v] = xRe - yRe; im[v] = xIm - yIm;
          const nextWRe = wRe * wlenRe - wIm * wlenIm;
          wIm = wRe * wlenIm + wIm * wlenRe;
          wRe = nextWRe;
        }
      }
    }
  }

  // --------------------------------------------------------------------------------------------
  // ArrowVortex tempo estimation (ported)

  _createHammingWindow(out, n) {
    const t = (2 * Math.PI) / (n - 1);
    for (let i = 0; i < n; i++) out[i] = 0.54 - 0.46 * Math.cos(i * t);
  }

  _normalizeFitness(obj, coefs, interval) {
    const x = interval, x2 = x * x, x3 = x2 * x;
    return obj - (coefs[0] + coefs[1] * x + coefs[2] * x2 + coefs[3] * x3);
  }

  _gapConfidence(wrappedOnsets, windowArr, windowSize, interval, gapPos) {
    const half = windowSize >> 1;
    let area = 0.0;
    let begin = gapPos - half;
    let end = gapPos + half;

    if (begin < 0) {
      const wrappedBegin = begin + interval;
      for (let i = wrappedBegin; i < interval; i++) {
        area += wrappedOnsets[i] * windowArr[i - wrappedBegin];
      }
      begin = 0;
    }
    if (end > interval) {
      const wrappedEnd = end - interval;
      const indexOffset = windowSize - wrappedEnd;
      for (let i = 0; i < wrappedEnd; i++) {
        area += wrappedOnsets[i] * windowArr[i + indexOffset];
      }
      end = interval;
    }
    for (let i = begin; i < end; i++) {
      area += wrappedOnsets[i] * windowArr[i - begin];
    }
    return area;
  }

  _getConfidenceForInterval(onsets, wrappedOnsets, wrappedPos, windowArr, windowSize, interval, downsample) {
    const nOn = onsets.length;
    // clear
    for (let i = 0; i < wrappedOnsets.length; i++) wrappedOnsets[i] = 0;

    const reducedInterval = interval >> downsample;
    for (let i = 0; i < nOn; i++) {
      const pos = ((onsets[i].pos % interval) + interval) % interval;
      const rpos = pos >> downsample;
      wrappedPos[i] = rpos;
      if (rpos >= 0 && rpos < wrappedOnsets.length) wrappedOnsets[rpos] += onsets[i].strength;
    }

    let highest = 0.0;
    for (let i = 0; i < nOn; i++) {
      const pos = wrappedPos[i];
      let confidence = this._gapConfidence(wrappedOnsets, windowArr, windowSize, reducedInterval, pos);
      const offbeatPos = (pos + (reducedInterval >> 1)) % reducedInterval;
      confidence += this._gapConfidence(wrappedOnsets, windowArr, windowSize, reducedInterval, offbeatPos) * 0.5;
      if (confidence > highest) highest = confidence;
    }
    return highest;
  }

  _getConfidenceForIntervalFine(onsets, wrappedOnsets, wrappedPos, windowArr, windowSize, interval) {
    const nOn = onsets.length;
    for (let i = 0; i < interval && i < wrappedOnsets.length; i++) wrappedOnsets[i] = 0;

    for (let i = 0; i < nOn; i++) {
      const pos = ((onsets[i].pos % interval) + interval) % interval;
      wrappedPos[i] = pos;
      if (pos < wrappedOnsets.length) wrappedOnsets[pos] += onsets[i].strength;
    }

    let highest = 0.0;
    for (let i = 0; i < nOn; i++) {
      const pos = wrappedPos[i];
      let confidence = this._gapConfidence(wrappedOnsets, windowArr, windowSize, interval, pos);
      const offbeatPos = (pos + (interval >> 1)) % interval;
      confidence += this._gapConfidence(wrappedOnsets, windowArr, windowSize, interval, offbeatPos) * 0.5;
      if (confidence > highest) highest = confidence;
    }
    return highest;
  }

  _intervalToBPM(samplerate, intervalIndex, minInterval) {
    return (samplerate * 60.0) / (intervalIndex + minInterval);
  }

  _fillIntervalRange(fitness, coefs, onsets, wrappedOnsets, wrappedPos, windowArr, windowSize, samplerate, minInterval, numIntervals, begin, end) {
    begin = Math.max(begin, 0);
    end = Math.min(end, numIntervals);
    for (let i = begin; i < end; i++) {
      if (fitness[i] === 0) {
        const interval = minInterval + i;
        let f = this._getConfidenceForIntervalFine(onsets, wrappedOnsets, wrappedPos, windowArr, windowSize, interval);
        f = this._normalizeFitness(f, coefs, interval);
        fitness[i] = Math.max(f, 0.1);
      }
    }
    return { begin, end };
  }

  _findBestInterval(fitness, begin, end) {
    let best = begin;
    let highest = -Infinity;
    for (let i = begin; i < end; i++) {
      if (fitness[i] > highest) { highest = fitness[i]; best = i; }
    }
    return best;
  }

  _removeDuplicates(tempo) {
    for (let i = 0; i < tempo.length; i++) {
      const bpm = tempo[i].bpm, doubled = bpm * 2.0, halved = bpm * 0.5;
      for (let j = tempo.length - 1; j > i; j--) {
        const v = tempo[j].bpm;
        const d = Math.min(Math.abs(v - bpm), Math.abs(v - doubled), Math.abs(v - halved));
        if (d < 0.1) tempo.splice(j, 1);
      }
    }
  }

  _getConfidenceForBPM(onsets, wrappedOnsets, wrappedPos, windowArr, windowSize, samplerate, bpm, coefs) {
    const nOn = onsets.length;
    const intervalf = samplerate * 60.0 / bpm;
    const interval = Math.round(intervalf);
    for (let i = 0; i < interval && i < wrappedOnsets.length; i++) wrappedOnsets[i] = 0;

    for (let i = 0; i < nOn; i++) {
      const pos = Math.floor(((onsets[i].pos % intervalf) + intervalf) % intervalf);
      wrappedPos[i] = pos;
      if (pos < wrappedOnsets.length) wrappedOnsets[pos] += onsets[i].strength;
    }

    let highest = 0.0;
    for (let i = 0; i < nOn; i++) {
      const pos = wrappedPos[i];
      let confidence = this._gapConfidence(wrappedOnsets, windowArr, windowSize, interval, pos);
      const offbeatPos = (pos + (interval >> 1)) % interval;
      confidence += this._gapConfidence(wrappedOnsets, windowArr, windowSize, interval, offbeatPos) * 0.5;
      if (confidence > highest) highest = confidence;
    }

    highest = this._normalizeFitness(highest, coefs, intervalf);
    return highest;
  }

  _roundBPMValues(tempo, onsets, wrappedOnsets, wrappedPos, windowArr, windowSize, samplerate, coefs) {
    for (let t = 0; t < tempo.length; t++) {
      const roundBPM = Math.round(tempo[t].bpm);
      const diff = Math.abs(tempo[t].bpm - roundBPM);
      if (diff < 0.01) {
        tempo[t].bpm = roundBPM;
      } else if (diff < 0.05) {
        const oldC = this._getConfidenceForBPM(onsets, wrappedOnsets, wrappedPos, windowArr, windowSize, samplerate, tempo[t].bpm, coefs);
        const curC = this._getConfidenceForBPM(onsets, wrappedOnsets, wrappedPos, windowArr, windowSize, samplerate, roundBPM, coefs);
        if (curC > oldC * 0.99) tempo[t].bpm = roundBPM;
      }
    }
  }

  _calculateBPM(onsets, samplerate) {
    const tempo = [];
    if (!onsets || onsets.length < 2) return tempo;

    const MinimumBPM = 89.0;
    const MaximumBPM = 205.0;
    const IntervalDelta = 10;
    const IntervalDownsample = 3;

    const minInterval = Math.round(samplerate * 60.0 / MaximumBPM);
    const maxInterval = Math.round(samplerate * 60.0 / MinimumBPM);
    const numIntervals = maxInterval - minInterval;
    if (numIntervals <= 0) return tempo;

    const fitness = new Float64Array(numIntervals);
    const wrappedPos = new Int32Array(onsets.length);

    // Coarse pass (downsampled gap window)
    const coarseWindowSize = 2048 >> IntervalDownsample;
    const coarseWindow = new Float64Array(coarseWindowSize);
    this._createHammingWindow(coarseWindow, coarseWindowSize);
    const coarseWrapped = new Float64Array(maxInterval + 1);

    // Fill coarse intervals (every IntervalDelta)
    for (let i = 0; i < numIntervals; i += IntervalDelta) {
      const interval = minInterval + i;
      const c = this._getConfidenceForInterval(onsets, coarseWrapped, wrappedPos, coarseWindow, coarseWindowSize, interval, IntervalDownsample);
      fitness[i] = Math.max(0.001, c);
    }

    // Polynomial coefficients for normalization (degree 3) from coarse samples
    const coefs = this._polyfitSpecial(3, fitness, numIntervals, minInterval);
    let maxFitness = 0.001;
    for (let i = 0; i < numIntervals; i += IntervalDelta) {
      fitness[i] = this._normalizeFitness(fitness[i], coefs, minInterval + i);
      if (fitness[i] > maxFitness) maxFitness = fitness[i];
    }

    // Fine pass buffers
    const fineWindowSize = 2048;
    const fineWindow = new Float64Array(fineWindowSize);
    this._createHammingWindow(fineWindow, fineWindowSize);
    const fineWrapped = new Float64Array(maxInterval + 1);

    const fitnessThreshold = maxFitness * 0.4;
    for (let i = 0; i < numIntervals; i += IntervalDelta) {
      if (fitness[i] > fitnessThreshold) {
        const range = this._fillIntervalRange(fitness, coefs, onsets, fineWrapped, wrappedPos, fineWindow, fineWindowSize, samplerate, minInterval, numIntervals, i - IntervalDelta, i + IntervalDelta);
        const best = this._findBestInterval(fitness, range.begin, range.end);
        tempo.push({ bpm: this._intervalToBPM(samplerate, best, minInterval), offset: 0.0, fitness: fitness[best] });
      }
    }

    // Sort, dedupe, round
    tempo.sort((a, b) => b.fitness - a.fitness);
    this._removeDuplicates(tempo);
    this._roundBPMValues(tempo, onsets, fineWrapped, wrappedPos, fineWindow, fineWindowSize, samplerate, coefs);

    // Second opinion if top 2 very close
    if (tempo.length >= 2 && tempo[0].fitness > 0 && (tempo[0].fitness / tempo[1].fitness) < 1.05) {
      for (let t = 0; t < tempo.length; t++) {
        tempo[t].fitness = this._getConfidenceForBPM(onsets, fineWrapped, wrappedPos, fineWindow, fineWindowSize, samplerate, tempo[t].bpm, coefs);
      }
      tempo.sort((a, b) => b.fitness - a.fitness);
    }

    if (tempo.length > 3) tempo.length = 3;
    return tempo;
  }

  // --------------------------------------------------------------------------------------------
  // Offset estimation (ported)

  _computeSlopes(samples, out) {
    const n = samples.length;
    const samplerateApprox = 44100; // not passed; window is relative but AV uses samplerate/20
    // We'll compute with passed samplerate in caller; this variant takes wh directly
    for (let i = 0; i < n; i++) out[i] = 0;
  }

  _calculateOffset(samples, samplerate, onsets, tempo) {
    if (!tempo.length) return;

    let maxInterval = 0.0;
    for (let i = 0; i < tempo.length; i++) {
      maxInterval = Math.max(maxInterval, samplerate * 60.0 / tempo[i].bpm);
    }
    const bufferSize = Math.ceil(maxInterval) + 1;
    const windowSize = 2048 >> 1; // downsample 1 in GapData ctor for offset
    const windowArr = new Float64Array(windowSize);
    this._createHammingWindow(windowArr, windowSize);
    const wrappedOnsets = new Float64Array(bufferSize);
    const wrappedPos = new Int32Array(onsets.length);

    // Base offsets
    for (let i = 0; i < tempo.length; i++) {
      tempo[i].offset = this._getBaseOffsetValue(onsets, wrappedOnsets, wrappedPos, windowArr, windowSize, bufferSize, samplerate, tempo[i].bpm);
    }

    // Adjust for offbeats using slope envelope
    const slopes = new Float64Array(samples.length);
    this._fillSlopes(samples, slopes, samplerate);
    for (let i = 0; i < tempo.length; i++) {
      tempo[i].offset = this._adjustForOffbeats(slopes, samplerate, tempo[i].offset, tempo[i].bpm);
    }
  }

  _getBaseOffsetValue(onsets, wrappedOnsets, wrappedPos, windowArr, windowSize, bufferSize, samplerate, bpm) {
    const nOn = onsets.length;
    const intervalf = samplerate * 60.0 / bpm;
    const interval = Math.round(intervalf);
    for (let i = 0; i < interval && i < bufferSize; i++) wrappedOnsets[i] = 0;

    for (let i = 0; i < nOn; i++) {
      const pos = Math.floor(((onsets[i].pos % intervalf) + intervalf) % intervalf);
      wrappedPos[i] = pos;
      if (pos < bufferSize) wrappedOnsets[pos] += 1.0;
    }

    let highest = 0.0;
    let offsetPos = 0;
    for (let i = 0; i < nOn; i++) {
      const pos = wrappedPos[i];
      let confidence = this._gapConfidence(wrappedOnsets, windowArr, windowSize, interval, pos);
      const offbeatPos = (pos + (interval >> 1)) % interval;
      confidence += this._gapConfidence(wrappedOnsets, windowArr, windowSize, interval, offbeatPos) * 0.5;
      if (confidence > highest) {
        highest = confidence;
        offsetPos = pos;
      }
    }

    return offsetPos / samplerate;
  }

  _fillSlopes(samples, out, samplerate) {
    const n = samples.length;
    out.fill(0);
    const wh = Math.max(1, Math.floor(samplerate / 20));
    if (n < wh * 2) return;

    let sumL = 0, sumR = 0;
    for (let i = 0, j = wh; i < wh; i++, j++) {
      sumL += Math.abs(samples[i] || 0);
      sumR += Math.abs(samples[j] || 0);
    }

    const scalar = 1.0 / wh;
    for (let i = wh, end = n - wh; i < end; i++) {
      const slope = (sumR - sumL) * scalar;
      out[i] = slope > 0 ? slope : 0;
      const cur = Math.abs(samples[i] || 0);
      sumL -= Math.abs(samples[i - wh] || 0);
      sumL += cur;
      sumR -= cur;
      sumR += Math.abs(samples[i + wh] || 0);
    }
  }

  _adjustForOffbeats(slopes, samplerate, offset, bpm) {
    const n = slopes.length;
    const secondsPerBeat = 60.0 / bpm;
    let offbeat = offset + secondsPerBeat * 0.5;
    if (offbeat > secondsPerBeat) offbeat -= secondsPerBeat;

    const end = n;
    const interval = secondsPerBeat * samplerate;
    let posA = offset * samplerate, sumA = 0.0;
    let posB = offbeat * samplerate, sumB = 0.0;
    while (posA < end && posB < end) {
      const ia = posA | 0;
      const ib = posB | 0;
      if (ia >= 0 && ia < n) sumA += slopes[ia];
      if (ib >= 0 && ib < n) sumB += slopes[ib];
      posA += interval;
      posB += interval;
    }
    return sumA >= sumB ? offset : offbeat;
  }

  // --------------------------------------------------------------------------------------------
  // Polynomial fit (ported from ArrowVortex Core/Polyfit.h specialized version)

  _polyfitSpecial(degree, inValues, numIntervals, offsetX) {
    degree = degree + 1; // coefficients count

    // Count non-zero coarse samples (every IntervalDelta in our usage mirrors AV layout)
    const xs = [];
    const ys = [];
    for (let i = 0; i < numIntervals; i++) {
      if (inValues[i] !== 0) {
        xs.push(offsetX + i);
        ys.push(inValues[i]);
      }
    }
    const m = xs.length;
    const coefs = new Float64Array(degree);
    if (m === 0) return coefs;

    // Build normal equations X^T X * a = X^T y
    const XtX = [];
    const XtY = new Float64Array(degree);
    for (let r = 0; r < degree; r++) {
      XtX[r] = new Float64Array(degree);
    }

    // Precompute powers sums incrementally per row
    const powers = new Float64Array(degree * 2);
    for (let k = 0; k < m; k++) {
      const x = xs[k];
      const y = ys[k];
      let p = 1.0;
      for (let j = 0; j < degree * 2 - 1; j++) {
        powers[j] += p;
        p *= x;
      }
      let py = 1.0;
      for (let j = 0; j < degree; j++) {
        XtY[j] += py * y;
        py *= x;
      }
    }
    // fill XtX from powers: (r,c) = sum x^(r+c)
    // recompute powers sums properly
    for (let r = 0; r < degree; r++) XtX[r].fill(0);
    const powSums = new Float64Array(degree * 2);
    for (let k = 0; k < m; k++) {
      let p = 1.0;
      const x = xs[k];
      for (let j = 0; j < degree * 2; j++) {
        powSums[j] += p;
        p *= x;
      }
    }
    for (let r = 0; r < degree; r++) {
      for (let c = 0; c < degree; c++) {
        XtX[r][c] = powSums[r + c];
      }
    }

    // Solve via Gaussian elimination
    const a = this._solveLinearSystem(XtX, XtY, degree);
    for (let i = 0; i < degree; i++) coefs[i] = a[i];
    return coefs;
  }

  _solveLinearSystem(A, b, n) {
    // A: array of Float64Array rows (n x n), b: Float64Array(n)
    const M = [];
    for (let i = 0; i < n; i++) {
      const row = new Float64Array(n + 1);
      for (let j = 0; j < n; j++) row[j] = A[i][j];
      row[n] = b[i];
      M[i] = row;
    }
    for (let col = 0; col < n; col++) {
      // pivot
      let pivot = col;
      let maxAbs = Math.abs(M[col][col]);
      for (let r = col + 1; r < n; r++) {
        const v = Math.abs(M[r][col]);
        if (v > maxAbs) { maxAbs = v; pivot = r; }
      }
      if (maxAbs < 1e-12) continue;
      if (pivot !== col) { const tmp = M[col]; M[col] = M[pivot]; M[pivot] = tmp; }
      const diag = M[col][col];
      for (let r = col + 1; r < n; r++) {
        const factor = M[r][col] / diag;
        if (factor === 0) continue;
        for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
      }
    }
    const x = new Float64Array(n);
    for (let i = n - 1; i >= 0; i--) {
      let sum = M[i][n];
      for (let j = i + 1; j < n; j++) sum -= M[i][j] * x[j];
      const diag = M[i][i];
      x[i] = Math.abs(diag) < 1e-12 ? 0 : sum / diag;
    }
    return x;
  }
}
