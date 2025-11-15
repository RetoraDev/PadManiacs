class AudioVisualizer extends Visualizer {
  constructor(scene, x, y, width, height) {
    super(scene, x, y, width, height);
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.bufferLength = 32;
    this.bars = [];
    this.setupAudioAnalysis();
  }

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

  destroy() {
    super.destroy();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
