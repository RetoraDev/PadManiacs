/**
 * @class AudioTemperatureMeter
 * @category Core Game Classes
 * @summary Audio-based tempo meter for dynamic background effects
 * @constructor
 * @param {Phaser.Scene} scene - The Phaser game scene
 * @param {HTMLAudioElement} audioElement - The game audio element to analyze
 * @features
 * Volume-based silence detection
 * BPM spike detection for intensity changes
 * Stop event awareness
 * Sample section highlighting
 * @description
 * Monitors audio playback and chart data to determine when the music is at a high or low
 * intensity, dispatching signals that drive dynamic visual effects like background animations.
 * Uses Web Audio API for volume analysis and chart metadata for BPM changes, stops,
 * and sample section detection to make temperature state decisions.
 * @example
 * // Creating a temperature meter for background effects
 * const meter = new AudioTemperatureMeter(scene, audioElement);
 * meter.onHighTemperature.add(() => {
 *   backgroundSprite.playAnimation("intense");
 * });
 * meter.onLowTemperature.add(() => {
 *   backgroundSprite.playAnimation("calm");
 * });
 */
class AudioTemperatureMeter {
  constructor(scene, audioElement) {
    /** @type {Object} The gameplay scene this meter belongs to */
    this.scene = scene;
    /** @type {HTMLAudioElement} Audio element whose volume is monitored */
    this.audio = audioElement;
    
    /** @type {Phaser.Signal} Dispatched when the temperature switches to high */
    this.onHighTemperature = new Phaser.Signal();
    /** @type {Phaser.Signal} Dispatched when the temperature switches to low */
    this.onLowTemperature = new Phaser.Signal();
    
    /** @type {boolean} Whether the meter currently reports a high state */
    this.isHigh = false;
    /** @type {number} Start of the sampled audio section in seconds */
    this.sampleStartSec = 9999;
    /** @type {number} End of the sampled audio section in seconds */
    this.sampleEndSec = 9999 + 1;
    /** @type {number} Most recently measured BPM value */
    this.lastBPM = 120;
    /** @type {boolean} Whether a BPM spike is currently being detected */
    this.bpmSpikeActive = false;
    /** @type {number} Time when the active BPM spike ends */
    this.bpmSpikeEndTime = 0;
    /** @type {boolean} Whether the meter is inside a chart stop section */
    this.inStop = false;
    /** @type {?number} Time when silence was first detected */
    this.silenceStartTime = null;
    /** @type {?number} Time when silence last finished */
    this.silenceEndTime = null;
    /** @type {Array} Rolling history of recent loudness samples */
    this.volumeHistory = [];
    
    /** @type {Object} Tunable detection settings for the meter */
    this.config = {
      debug: false,
      ignoreFirstSeconds: 5,
      volumeHistorySize: 10,
      silenceThreshold: 0.05,
      minSilenceSeconds: 0.3
    };
    
    this.init();
    this.setupVolumeDetection();
    
    if (this.config.debug) {
      this.createDebugText();
    }
  }
  
  /**
   * Reads the song's sample start and length from the chart for temperature timing.
   * Called once during construction to define the sample section window.
   */
  init() {
    if (!this.scene || !this.scene.song) return;
    
    const chart = this.scene.song.chart;
    this.sampleStartSec = chart.sampleStart || 0;
    const sampleLength = chart.sampleLength || 10;
    this.sampleEndSec = this.sampleStartSec + sampleLength;
    
    if (this.config.debug) {
      console.log("Sample: " + this.sampleStartSec.toFixed(1) + "s to " + this.sampleEndSec.toFixed(1) + "s");
    }
  }
  
  /**
   * Initializes the Web Audio API analyser for volume detection.
   * Safe to call with no audio element; setup is skipped silently.
   */
  setupVolumeDetection() {
    if (!this.audio) return;
    
    try {
      /** @type {AudioContext} Web Audio context backing the analyser */
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      /** @type {AnalyserNode} Sine/frequency analyser reading loudness */
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      /** @type {number} Number of frequency bins in the analyser */
      this.bufferLength = this.analyser.frequencyBinCount;
      /** @type {Uint8Array} Buffer receiving the frequency data */
      this.dataArray = new Uint8Array(this.bufferLength);
      
      const source = this.audioContext.createMediaElementSource(this.audio);
      source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    } catch (error) {
      // console.warn("Volume detection not available");
    }
  }
  
  /**
   * Returns the current normalized loudness of the audio stream.
   * Falls back to a neutral 0.5 when no analyser is available.
   * @returns {number} Normalized volume from 0 to 1
   */
  getVolume() {
    if (!this.analyser || !this.dataArray) return 0.5;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      sum += this.dataArray[i] / 255;
    }
    return sum / this.bufferLength;
  }
  
  /**
   * Returns the BPM in effect at the given playback time from chart changes.
   * Falls back to the last measured BPM when no chart is available.
   * @param {number} nowSec - Current playback time in seconds
   * @returns {number} BPM value
   */
  getCurrentBPM(nowSec) {
    if (!this.scene || !this.scene.player || !this.scene.player.renderer) {
      return this.lastBPM;
    }
    
    const bpmChanges = this.scene.player.renderer.bpmChanges;
    if (!bpmChanges || bpmChanges.length === 0) {
      return this.lastBPM;
    }
    
    let currentBPM = bpmChanges[0].bpm;
    for (let i = bpmChanges.length - 1; i >= 0; i--) {
      const change = bpmChanges[i];
      if (change.sec <= nowSec) {
        currentBPM = change.bpm;
        break;
      }
    }
    
    return currentBPM;
  }
  
  /**
   * Detects significant BPM increases and activates a spike section.
   * A 16-measure (64 beat) high section is triggered on large jumps.
   * @param {number} nowSec - Current playback time in seconds
   */
  checkForBPMSpike(nowSec) {
    const currentBPM = this.getCurrentBPM(nowSec);
    
    if (currentBPM === this.lastBPM) {
      return;
    }
    
    if (nowSec <= this.config.ignoreFirstSeconds) {
      return;
    }
    
    const bpmDiff = currentBPM - this.lastBPM;
    
    // Only care about BPM increases
    if (bpmDiff > 0) {
      const changePercent = (bpmDiff / this.lastBPM) * 100;
      
      // Significant BPM increase detected
      if (changePercent >= 10 || bpmDiff >= 20) {
        // Calculate section length based on BPM (16 measures = 64 beats)
        const beatsPerMinute = currentBPM;
        const secondsPerBeat = 60 / beatsPerMinute;
        const sectionLengthSeconds = 64 * secondsPerBeat; // 16 measures
        
        this.bpmSpikeActive = true;
        this.bpmSpikeEndTime = nowSec + sectionLengthSeconds;
        
        if (this.config.debug) {
          console.log("BPM spike at " + nowSec.toFixed(1) + "s: " + this.lastBPM + " -> " + currentBPM);
          console.log("  Section length: " + sectionLengthSeconds.toFixed(1) + "s (" + 64 + " beats)");
        }
      }
    }
    
    this.lastBPM = currentBPM;
  }
  
  /**
   * Samples audio volume and tracks periods of silence.
   * Returns whether the current moment is silent and for how long.
   * @param {number} nowSec - Current playback time in seconds
   * @returns {Object} {isSilent, silenceDuration}
   */
  checkForSilence(nowSec) {
    const volume = this.getVolume();
    
    this.volumeHistory.push({ time: nowSec, volume: volume });
    while (this.volumeHistory.length > this.config.volumeHistorySize) {
      this.volumeHistory.shift();
    }
    
    const isSilent = volume < this.config.silenceThreshold;
    
    if (isSilent && this.silenceStartTime === null) {
      this.silenceStartTime = nowSec;
    } else if (!isSilent && this.silenceStartTime !== null) {
      const silenceDuration = nowSec - this.silenceStartTime;
      if (silenceDuration >= this.config.minSilenceSeconds) {
        this.silenceEndTime = nowSec;
        if (this.config.debug) {
          console.log("Silence ended at " + nowSec.toFixed(1) + "s (duration: " + silenceDuration.toFixed(1) + "s)");
        }
      }
      this.silenceStartTime = null;
    }
    
    return { isSilent, silenceDuration: this.silenceStartTime !== null ? nowSec - this.silenceStartTime : 0 };
  }
  
  /**
   * Detects when playback passes through a chart stop event.
   * Temporarily marks the meter as in a stop with a timed reset.
   * @param {number} nowSec - Current playback time in seconds
   */
  checkForStops(nowSec) {
    if (!this.scene || !this.scene.player || !this.scene.player.renderer) {
      return;
    }
    
    const stops = this.scene.player.renderer.stops;
    if (!stops || stops.length === 0) return;
    
    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      const stopStartSec = stop.sec;
      const stopEndSec = stop.sec + (stop.len || 0);
      
      if (!stop.triggered && nowSec >= stopStartSec && nowSec < stopEndSec) {
        stop.triggered = true;
        
        this.inStop = true;
        
        if (this.config.debug) {
          console.log("Stop at " + stopStartSec.toFixed(1) + "s, ends at " + stopEndSec.toFixed(1) + "s");
        }
        
        setTimeout(function() {
          this.inStop = false;
          if (this.config.debug) {
            console.log("Stop ended at " + stopEndSec.toFixed(1) + "s");
          }
        }.bind(this), (stopEndSec - nowSec) * 1000);
        
        break;
      }
    }
  }
  
  /**
   * Main per-frame evaluation that decides high or low temperature state.
   * Combines sample section, BPM spike, silence, and stop rules, then dispatches signals.
   * @param {number} nowSec - Current playback time in seconds
   * @param {number} beat - Current beat position
   */
  update(nowSec, beat) {
    if (!this.audio || !this.scene) return;
    
    this.checkForBPMSpike(nowSec);
    this.checkForStops(nowSec);
    const silence = this.checkForSilence(nowSec);
    
    let shouldBeHigh = false;
    let reason = "";
    
    // Rule 1: Sample section (from chart)
    if (nowSec >= this.sampleStartSec && nowSec <= this.sampleEndSec) {
      shouldBeHigh = true;
      reason = "sample";
    }
    
    // Rule 2: BPM spike active (calculated from BPM)
    if (this.bpmSpikeActive && nowSec < this.bpmSpikeEndTime) {
      shouldBeHigh = true;
      reason = "bpm spike";
    } else if (this.bpmSpikeActive && nowSec >= this.bpmSpikeEndTime) {
      this.bpmSpikeActive = false;
      if (this.config.debug) {
        console.log("BPM spike ended at " + nowSec.toFixed(1) + "s");
      }
    }
    
    // Rule 3: Silence after high - force low
    if (silence.isSilent && silence.silenceDuration > this.config.minSilenceSeconds && this.isHigh) {
      shouldBeHigh = false;
      reason = "silence";
    }
    
    // Rule 4: After silence ends, check if we should resume
    if (this.silenceEndTime !== null && nowSec - this.silenceEndTime < 0.5) {
      if (nowSec >= this.sampleStartSec && nowSec <= this.sampleEndSec) {
        shouldBeHigh = true;
        reason = "resume after silence";
      } else if (this.bpmSpikeActive && nowSec < this.bpmSpikeEndTime) {
        shouldBeHigh = true;
        reason = "resume after silence (bpm)";
      }
    }
    
    // Rule 5: Stop forces low
    if (this.inStop) {
      shouldBeHigh = false;
      reason = "stop";
    }
    
    // Apply state change
    if (shouldBeHigh && !this.isHigh) {
      this.isHigh = true;
      this.onHighTemperature.dispatch();
      if (this.config.debug) {
        console.log("HIGH at " + nowSec.toFixed(1) + "s - " + reason);
      }
    }
    else if (!shouldBeHigh && this.isHigh) {
      this.isHigh = false;
      this.onLowTemperature.dispatch();
      if (this.config.debug) {
        console.log("LOW at " + nowSec.toFixed(1) + "s - " + reason);
      }
    }
    
    if (this.config.debug) {
      this.updateDebugText(nowSec);
    }
  }
  
  createDebugText() {
    /** @type {?Text} Debug label showing live meter readings */
    this.debugText = new Text(4, 50, "", FONTS.default);
    this.debugText.tint = 0x00ff00;
    game.add.existing(this.debugText);
  }
  
  updateDebugText(nowSec) {
    if (!this.debugText) return;
    
    let status = this.isHigh ? "HIGH" : "LOW";
    let info = "";
    
    if (nowSec >= this.sampleStartSec && nowSec <= this.sampleEndSec) {
      info = " SAMPLE";
    }
    if (this.bpmSpikeActive && nowSec < this.bpmSpikeEndTime) {
      const remaining = (this.bpmSpikeEndTime - nowSec).toFixed(0);
      info = info + " SPIKE(" + remaining + "s)";
    }
    if (this.inStop) {
      info = info + " STOP";
    }
    if (this.silenceStartTime !== null) {
      const silenceDur = (nowSec - this.silenceStartTime).toFixed(1);
      info = info + " SILENCE(" + silenceDur + "s)";
    }
    
    let bpmInfo = " BPM:" + this.getCurrentBPM(nowSec).toFixed(0);
    let volInfo = " VOL:" + this.getVolume().toFixed(2);
    
    this.debugText.write(
      "TEMP: " + status + "\n" +
      "TIME: " + nowSec.toFixed(1) + "s" + info + bpmInfo + volInfo
    );
  }
  
  /**
   * Resets all detection state back to initial values.
   */
  reset() {
    this.isHigh = false;
    this.bpmSpikeActive = false;
    this.inStop = false;
    this.lastBPM = 120;
    this.silenceStartTime = null;
    this.silenceEndTime = null;
    this.volumeHistory = [];
  }
  
  /**
   * Returns the temperature as a numeric value.
   * @returns {number} 100 when high, 0 when low
   */
  getTemperature() {
    return this.isHigh ? 100 : 0;
  }
  
  /**
   * Returns whether the meter currently reports a high temperature state.
   * @returns {boolean} True when high
   */
  isTemperatureHigh() {
    return this.isHigh;
  }
    
  /**
   * Cleans up signals and debug text used by the meter.
   */
  destroy() {
    // Detener todas las señales primero
    this.onHighTemperature.dispose();
    this.onLowTemperature.dispose();
    
    // TODO: No idea why song audio mutes for every game if I destroy this. For now trust JavaScript garbage collection
    /*
    // Cerrar audio context correctamente
    if (this.audioContext) {
      //this.audioContext.close().catch(e => console.warn("Error closing audio context:", e));
      //this.audioContext = null;
    }
    
    
    // Limpiar analyser y source
    if (this.analyser) {
      //this.analyser.disconnect();
      this.analyser = null;
    }
    
    if (this.source) {
      //this.source.disconnect();
      this.source = null;
    }
    */
    // Limpiar debug text
    if (this.debugText) {
      this.debugText.destroy();
      this.debugText = null;
    }
  }
}