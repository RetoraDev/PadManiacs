class BPMVisualizer extends Visualizer {
  constructor(scene, x, y, width, height) {
    super(scene, x, y, width, height);
    this.bpmChanges = scene.song?.chart?.bpmChanges || [];
    this.stops = scene.song?.chart?.stops || [];
    this.text = new Text(width - 1, 1, "");
    this.text.anchor.x = 1;
    this.text.alpha = 0.5;
    this.graphics.addChild(this.text);
    this.beatIndicatorAlpha = 1;
    this.currentBeat = 0;
    this.currentBeatInt = 0;
    this.previusBeatInt = 1;
    this.currentBpm = 0;
    this.previusBpm = 1;
  }

  update() {
    if (!this.active) return;
    
    this.clear();
    
    const currentTime = this.scene.getCurrentTime();
    this.currentBeat = currentTime.beat;
    
    this.currentBeatInt = Math.floor(this.currentBeat);
    
    if (this.currentBeatInt != this.previusBeatInt) this.beatIndicatorAlpha = 1;
    
    this.previusBeatInt = this.currentBeatInt;
    
    this.currentBpm = this.getLastBpm();
    
    if (this.currentBpm != this.previusBpm) {
      this.text.write(this.currentBpm.toFixed(3));
      this.text.alpha = 1;
      game.add.tween(this.text).to({ alpha: 0.5 }, 100, "Linear", true);
    }
    
    this.text.tint = this.getLastStop() && this.getLastStop().beat == this.currentBeat ? 0xFF0000 : 0xFFFFFF;
    
    this.previusBpm = this.currentBpm;
    
    // Draw BPM changes
    const maxBeat = Math.max(...this.bpmChanges.map(b => b.beat), this.currentBeat + 50);
    const beatsToShow = 8; 

    this.bpmChanges.forEach(bpmChange => {
      const x = ((bpmChange.beat - this.currentBeat) / beatsToShow) * this.width;
      if (x >= 0 && x <= this.width) {
        // BPM change marker
        this.graphics.beginFill(0xFFFF00, 0.8);
        this.graphics.drawRect(x - 1, 0, 1, this.height);
        this.graphics.endFill();
      }
    });

    // Draw stops
    this.stops.forEach(stop => {
      const x = ((stop.beat - this.currentBeat) / beatsToShow) * this.width;
      if (x >= 0 && x <= this.width) {
        // Stop marker
        this.graphics.beginFill(0xFF0000, 0.8);
        this.graphics.drawRect(x - 1, 0, 1, this.height);
        this.graphics.endFill();
      }
    });
    
    // Draw beat indicator
    this.graphics.beginFill(0x00FF00, this.beatIndicatorAlpha);
    this.graphics.drawCircle(3, 3, 4);
    this.graphics.endFill();
    
    let speed = (Math.min(250, this.currentBpm) / 250) * 0.5;
    
    this.beatIndicatorAlpha -= speed;
  }
  
  getLastBpm() {
    return this.bpmChanges.length ? this.bpmChanges.find((e, i, a) => i + 1 == a.length || a[i + 1].beat >= this.currentBeat).bpm : 0;
  }
  
  getLastStop() {
    return this.stops.length ? this.stops.find((e, i, a) => i + 1 == a.length || a[i + 1].beat >= this.currentBeat) : null;
  }

  destroy() {
    super.destroy();
    this.text.destroy();
  }
}
