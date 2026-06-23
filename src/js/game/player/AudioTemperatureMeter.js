class AudioTemperatureMeter {
  constructor(scene, audioElement) {
    this.scene = scene;
    this.audio = audioElement;
    
    this.onHighTemperature = new Phaser.Signal();
    this.onLowTemperature = new Phaser.Signal();
    
    this.isHigh = false;
    this.sampleStartSec = 9999;
    this.sampleEndSec = 9999 + 1;
    this.lastBPM = 120;
    this.bpmSpikeActive = false;
    this.bpmSpikeEndTime = 0;
    this.inStop = false;
    this.silenceStartTime = null;
    this.silenceEndTime = null;
    this.volumeHistory = [];
    
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
  
  setupVolumeDetection() {
    if (!this.audio) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      
      const source = this.audioContext.createMediaElementSource(this.audio);
      source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    } catch (error) {
      // console.warn("Volume detection not available");
    }
  }
  
  getVolume() {
    if (!this.analyser || !this.dataArray) return 0.5;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      sum += this.dataArray[i] / 255;
    }
    return sum / this.bufferLength;
  }
  
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
  
  reset() {
    this.isHigh = false;
    this.bpmSpikeActive = false;
    this.inStop = false;
    this.lastBPM = 120;
    this.silenceStartTime = null;
    this.silenceEndTime = null;
    this.volumeHistory = [];
  }
  
  getTemperature() {
    return this.isHigh ? 100 : 0;
  }
  
  isTemperatureHigh() {
    return this.isHigh;
  }
    
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