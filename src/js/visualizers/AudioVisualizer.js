/**
 * @class AudioVisualizer
 * @category Core Game Classes
 * @summary Shows audio frequency spectrum
 * @constructor
 * @param {Object} scene - The Phaser game state scene
 * @param {number} x - Horizontal position
 * @param {number} y - Vertical position
 * @param {number} width - Display width in pixels
 * @param {number} height - Display height in pixels
 * @features
 * Real-time frequency spectrum bars
 * Connects to game audio source through Web Audio API
 * Graceful fallback when audio analysis is unsupported
 * @description
 * Draws vertical bars representing the frequency spectrum of the currently playing audio.
 * Uses the Web Audio API to analyse the game audio element and render the data each frame.
 * @example
 * // Modding usage example
 * const audioViz = new AudioVisualizer(scene, 0, 0, 200, 50);
 * function update() {
 *   audioViz.update();
 * }
 */
class AudioVisualizer extends Visualizer {
  constructor(scene, x, y, width, height) {
    super(scene, x, y, width, height);
    /** @type {AudioContext|null} Web Audio API context for analysis */
    this.audioContext = null;
    /** @type {AnalyserNode|null} Analyser node providing frequency data */
    this.analyser = null;
    /** @type {Uint8Array|null} Buffer holding raw frequency data */
    this.dataArray = null;
    /** @type {number} Length of the frequency data buffer */
    this.bufferLength = 32;
    /** @type {Array} Sprites or metadata for drawn bars */
    this.bars = [];
    this.setupAudioAnalysis();
  }

  /**
   * Creates the Web Audio API context and analyser, connecting it to the scene's audio element.
   */
  setupAudioAnalysis() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.maxDecibels = -10;
      this.analyser.smoothingTimeConstant = 0.1;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);

      // Connect to game audio if available
      if (this.scene.audio) {
        const source = this.audioContext.createMediaElementSource(this.scene.audio);
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      }
    } catch (error) {
      console.warn('Audio visualizer not supported:', error);
      this.active = false;
    }
  }

  /**
   * Fetches frequency data and redraws the spectrum bars each frame.
   */
  update() {
    if (!this.active || !this.analyser) return;

    this.clear();
    
    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Draw bars
    const barWidth = (this.width / this.bufferLength) * 2;
    let x = 0;
    
    for (let i = 0; i < this.bufferLength / 2; i++) {
      const barHeight = (this.dataArray[i] / 255) * this.height;
      
      if (barHeight > 0) {
        this.graphics.lineStyle(barWidth - 1, 0x0000FF, 0.9);
        this.graphics.moveTo(x, this.height - 1);
        this.graphics.lineTo(x, this.height - barHeight);
      }

      x += barWidth;
    }
  }

  /**
   * Frees the graphics and closes the audio context.
   */
  destroy() {
    super.destroy();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
