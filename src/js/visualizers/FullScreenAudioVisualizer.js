/**
 * @class FullScreenAudioVisualizer
 * @category Core Game Classes
 * @summary Advanced audio visualization for Jukebox
 * @constructor
 * @param {HTMLAudioElement} audioElement - Audio element to analyze
 * @param {Object} [options] - Configuration options
 * @features
 * Multiple visualization types: bars, waveform, circular, symmetrical
 * Configurable bar colors, sizes, smoothing, and alpha
 * Static factory and browser support detection helpers
 * @description
 * Full-screen audio visualizer that renders a configurable frequency spectrum visualization.
 * Supports four visualization styles and smooths frequency data for a fluid visual response.
 * @example
 * // Modding usage example
 * const viz = FullScreenAudioVisualizer.create(audioElement, {
 *   barColor: 0xFF00FF,
 *   visualizationType: 'circular',
 *   fftSize: 512
 * });
 * function update() {
 *   viz.update();
 * }
 */
class FullScreenAudioVisualizer {
  constructor(audioElement, options = {}) {
    /** @type {HTMLAudioElement} The audio element being analyzed */
    this.audioElement = audioElement;
    /** @type {Object} Visualization configuration options */
    this.options = {
      barColor: 0x76fcde,
      barWidth: 4,
      barSpacing: 2,
      barBaseHeight: 10,
      barMaxHeight: 80,
      smoothing: 0.8,
      alpha: 1,
      fftSize: 256,
      visualizationType: 'circular', // 'bars', 'waveform', 'circular', 'symmetrical'
      ...options
    };
    
    /** @type {Phaser.Graphics} Graphics object used for all drawing */
    this.graphics = game.add.graphics(0, 0);
    /** @type {AnalyserNode|null} Analyser node providing audio data */
    this.analyser = null;
    /** @type {Uint8Array|null} Raw frequency data buffer */
    this.dataArray = null;
    /** @type {number} Length of the frequency buffer */
    this.bufferLength = 0;
    /** @type {Uint8Array|null} Smoothed frequency data buffer */
    this.frequencyData = null;
    /** @type {boolean} Whether the visualizer is active and analyzing */
    this.isActive = false;
    
    this.setupAudioAnalysis();
  }

  /**
   * Creates the audio context and analyser, then connects the audio element source.
   */
  setupAudioAnalysis() {
    try {
      // Create audio context if not already created
      if (!this.audioContext) {
        /** @type {AudioContext} Web Audio context driving the analyser */
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.options.fftSize;
      this.analyser.smoothingTimeConstant = this.options.smoothing;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;
      
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      this.frequencyData = new Uint8Array(this.bufferLength);
      
      // Connect audio element to analyser
      if (this.audioElement) {
        this.connectAudioSource();
      }
      
      this.isActive = true;
      
    } catch (error) {
      console.warn('FullScreenAudioVisualizer: Audio analysis not supported:', error);
      this.isActive = false;
    }
  }

  /**
   * Connects or reconnects the audio element to the analyser node.
   */
  connectAudioSource() {
    if (!this.audioElement || !this.analyser) return;
    
    try {
      // Disconnect existing source if any
      if (this.source) {
        this.source.disconnect();
      }
      
      // Create new source and connect
      /** @type {MediaElementAudioSourceNode} Audio source node linked to the audio element */
      this.source = this.audioContext.createMediaElementSource(this.audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
    } catch (error) {
      console.warn('FullScreenAudioVisualizer: Could not connect audio source:', error);
    }
  }

  /**
   * Swaps in a new audio element and reconnects it to the analyser.
   * @param {HTMLAudioElement} audioElement - The new audio element
   */
  setAudioSource(audioElement) {
    this.audioElement = audioElement;
    if (this.isActive) {
      this.connectAudioSource();
    }
  }

/**
   * Fetches audio data, applies smoothing, and renders the configured visualization each frame.
   */
  update() {
    if (!this.isActive || !this.analyser) return;
    
    this.graphics.clear();
    this.graphics.alpha = this.options.alpha;
    
    // Get frequency data for all visualization types
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Apply smoothing - only process first half of buffer (the meaningful frequencies)
    const meaningfulLength = Math.floor(this.bufferLength / 2);
    
    if (!this.frequencyData) {
      this.frequencyData = new Uint8Array(this.dataArray);
    } else {
      for (let i = 0; i < meaningfulLength; i++) {
        this.frequencyData[i] = Math.max(
          this.frequencyData[i] * this.options.smoothing,
          this.dataArray[i]
        );
      }
      // Ignore second half (usually zeros with MP3 files)
      for (let i = meaningfulLength; i < this.bufferLength; i++) {
        this.frequencyData[i] = 0;
      }
    }
    
    // Handle different visualization types
    switch (this.options.visualizationType) {
      case 'bars':
        this.drawBars();
        break;
      case 'waveform':
        this.drawWaveform();
        break;
      case 'circular':
        this.drawCircularVisualizer();
        break;
      case 'symmetrical':
        this.drawSymmetricalBars();
        break;
      default:
        this.drawBars(); // Default fallback
    }
  }

  // Bars visualization implementation
  drawBars() {
    const totalBars = Math.floor(game.width / (this.options.barWidth + this.options.barSpacing));
    const startX = (game.width - (totalBars * (this.options.barWidth + this.options.barSpacing))) / 2;
    const meaningfulLength = Math.floor(this.bufferLength / 2);
    
    for (let i = 0; i < totalBars; i++) {
      // Map to first half of frequency data only
      const dataIndex = Math.floor((i / totalBars) * meaningfulLength);
      
      if (dataIndex >= meaningfulLength) continue;
      
      const frequencyValue = this.frequencyData[dataIndex] || 0;
      const normalizedValue = frequencyValue / 255;
      const barHeight = this.options.barBaseHeight + (normalizedValue * this.options.barMaxHeight);
      
      const x = startX + i * (this.options.barWidth + this.options.barSpacing);
      const y = game.height - barHeight;
      
      this.drawBar(x, y, this.options.barWidth, barHeight, normalizedValue);
    }
  }

  // Symmetrical bars visualization (mirrored from center)
  drawSymmetricalBars() {
    const totalBars = Math.floor(game.width / (this.options.barWidth + this.options.barSpacing));
    const barsPerSide = Math.floor(totalBars / 2);
    const centerX = game.width / 2;
    const meaningfulLength = Math.floor(this.bufferLength / 2);
    
    for (let i = 0; i < barsPerSide; i++) {
      // Map to first half of frequency data only
      const dataIndex = Math.floor((i / barsPerSide) * meaningfulLength);
      
      if (dataIndex >= meaningfulLength) continue;
      
      const frequencyValue = this.frequencyData[dataIndex] || 0;
      const normalizedValue = frequencyValue / 255;
      const barHeight = this.options.barBaseHeight + (normalizedValue * this.options.barMaxHeight);
      
      // Right side bar
      const rightX = centerX + i * (this.options.barWidth + this.options.barSpacing);
      const rightY = game.height - barHeight;
      this.drawBar(rightX, rightY, this.options.barWidth, barHeight, normalizedValue);
      
      // Left side bar (mirrored)
      const leftX = centerX - (i + 1) * (this.options.barWidth + this.options.barSpacing);
      const leftY = game.height - barHeight;
      this.drawBar(leftX, leftY, this.options.barWidth, barHeight, normalizedValue);
    }
  }

  // Waveform visualization implementation
  drawWaveform() {
    const waveformData = new Uint8Array(this.bufferLength);
    this.analyser.getByteTimeDomainData(waveformData);
    
    this.graphics.lineStyle(2, this.options.barColor, 0.8);
    
    const sliceWidth = game.width / this.bufferLength;
    let x = 0;
    
    for (let i = 0; i < this.bufferLength; i++) {
      const v = waveformData[i] / 128.0;
      const y = (v * game.height) / 2;
      
      if (i === 0) {
        this.graphics.moveTo(x, y);
      } else {
        this.graphics.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
  }

  // Circular visualization implementation
  drawCircularVisualizer() {
    const centerX = game.width / 2;
    const centerY = game.height / 2;
    const radius = Math.min(game.width, game.height) * 0.3;
    const meaningfulLength = Math.floor(this.bufferLength / 2);
    
    this.graphics.lineStyle(2, this.options.barColor, 0.8);
    
    for (let i = 0; i < meaningfulLength; i += 2) {
      const value = this.frequencyData[i] / 255;
      const angle = (i / meaningfulLength) * Math.PI * 2;
      const barLength = value * radius * 0.5;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barLength);
      const y2 = centerY + Math.sin(angle) * (radius + barLength);
      
      this.graphics.moveTo(x1, y1);
      this.graphics.lineTo(x2, y2);
    }
  }

  // Individual bar drawing method
  drawBar(x, y, width, height, intensity) {
    const baseColor = this.options.barColor;
    const brightness = 0.3 + (intensity * 0.7);
    
    const r = ((baseColor >> 16) & 0xFF) * brightness;
    const g = ((baseColor >> 8) & 0xFF) * brightness;
    const b = (baseColor & 0xFF) * brightness;
    
    const color = (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
    
    // Draw main bar
    this.graphics.beginFill(color, 0.8);
    this.graphics.drawRect(x, y, width, height);
    this.graphics.endFill();
    
    // Add highlight effect on top
    if (intensity > 0.5) {
      const highlightAlpha = (intensity - 0.5) * 0.4;
      this.graphics.beginFill(0xFFFFFF, highlightAlpha);
      this.graphics.drawRect(x, y, width, Math.max(2, height * 0.1));
      this.graphics.endFill();
    }
  }

  // Method to change visualization type
  /**
   * Changes the visualization style to one of the supported types.
   * @param {string} type - Visualization type ('bars', 'waveform', 'circular', 'symmetrical')
   */
  setVisualizationType(type) {
    const validTypes = ['bars', 'waveform', 'circular', 'symmetrical'];
    if (validTypes.includes(type)) {
      this.options.visualizationType = type;
    } else {
      console.warn(`Invalid visualization type: ${type}. Using 'bars' instead.`);
      this.options.visualizationType = 'bars';
    }
  }

  /**
   * Sets the bar color used by the visualization.
   * @param {number} color - Hex color value as a number
   */
  setBarColor(color) {
    this.options.barColor = color;
  }

  /**
   * Sets the rendering alpha of the visualization.
   * @param {number} alpha - Alpha value clamped between 0 and 1
   */
  setAlpha(alpha) {
    this.options.alpha = Phaser.Math.clamp(alpha, 0, 1);
  }

  /**
   * Merges new configuration options and re-applies analyser settings when present.
   * @param {Object} newOptions - Partial configuration options to apply
   */
  setOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    
    // Re-apply analyser settings if changed
    if (this.analyser) {
      if (newOptions.fftSize) {
        this.analyser.fftSize = newOptions.fftSize;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.frequencyData = new Uint8Array(this.bufferLength);
      }
      
      if (newOptions.smoothing !== undefined) {
        this.analyser.smoothingTimeConstant = newOptions.smoothing;
      }
    }
    
    // Validate visualization type
    if (newOptions.visualizationType) {
      this.setVisualizationType(newOptions.visualizationType);
    }
  }

  // Get current visualization settings
  /**
   * Returns a copy of the current visualization settings.
   * @returns {Object} Copy of the options object
   */
  getSettings() {
    return { ...this.options };
  }

  // Check if visualizer is ready and active
  /**
   * Returns whether the visualizer is active and ready for analysis.
   * @returns {boolean} True if active and the analyser exists
   */
  isReady() {
    return this.isActive && this.analyser !== null;
  }

  // Pause/Resume functionality
  /**
   * Pauses visualization updates.
   */
  pause() {
    this.isActive = false;
  }

  /**
   * Resumes visualization updates.
   */
  resume() {
    this.isActive = true;
  }

  /**
   * Stops analysis, disconnects audio nodes, closes the context, and frees resources.
   */
  destroy() {
    this.isActive = false;
    
    // Disconnect audio nodes
    if (this.source) {
      this.source.disconnect();
    }
    
    if (this.analyser) {
      this.analyser.disconnect();
    }
    
    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(error => {
        console.warn('Error closing audio context:', error);
      });
    }
    
    // Remove graphics
    if (this.graphics) {
      this.graphics.destroy();
    }
    
    // Clean up references
    this.audioElement = null;
    this.analyser = null;
    this.source = null;
    this.audioContext = null;
    this.dataArray = null;
    this.frequencyData = null;
  }

  // Static method to create visualizer with default settings
  /**
   * Factory method to create a FullScreenAudioVisualizer with default settings.
   * @param {HTMLAudioElement} audioElement - Audio element to analyze
   * @param {Object} [options] - Configuration options
   * @returns {FullScreenAudioVisualizer} The created visualizer instance
   */
  static create(audioElement, options = {}) {
    return new FullScreenAudioVisualizer(audioElement, options);
  }

  // Static method to check if browser supports audio analysis
  /**
   * Checks whether the browser supports Web Audio analysis.
   * @returns {boolean} True if an AudioContext is available
   */
  static isSupported() {
    return !!(window.AudioContext || window.webkitAudioContext);
  }
}
