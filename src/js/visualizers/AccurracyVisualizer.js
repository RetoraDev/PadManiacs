class AccuracyVisualizer extends Visualizer {
  constructor(scene, x, y, width, height) {
    super(scene, x, y, width, height);
    this.accuracyHistory = [];
    this.maxHistoryLength = this.width / 4;
  }

  update() {
    if (!this.active || !this.scene.player) return;

    this.clear();
    
    this.accuracyHistory = this.scene.player.timingStory;
    
    // Keep only recent history
    if (this.accuracyHistory.length > this.maxHistoryLength) {
      this.accuracyHistory.shift();
    }
    
    // Draw 0 line
    this.graphics.lineStyle(1, 0xF0F0F0, 0.3);
    this.graphics.moveTo(0, 3);
    this.graphics.lineTo(this.width, 3);
      
    // Draw accuracy line
    if (this.accuracyHistory.length > 1) {
      this.graphics.lineStyle(1, 0x00FF00, 1);
      this.graphics.moveTo(0, 3);

      for (let i = 0; i < this.accuracyHistory.length; i++) {
        const x = (i / this.maxHistoryLength) * this.width;
        const accuracy = this.accuracyHistory[i];
        const y = 2 + (accuracy / 0.4) * 3;
        
        this.graphics.lineTo(x, y);
      }
    }
  }
}
