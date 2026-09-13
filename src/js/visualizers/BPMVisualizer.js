/**
 * @class BPMVisualizer
 * @category Core Game Classes
 * @summary Displays BPM changes and beat timing
 * @constructor
 * @param {Object} scene - The Phaser game state scene
 * @param {number} x - Horizontal position
 * @param {number} y - Vertical position
 * @param {number} width - Display width in pixels
 * @param {number} height - Display height in pixels
 * @features
 * On-screen text showing current BPM value
 * Yellow markers for BPM changes in the chart
 * Red markers for stops in the chart
 * Beat indicator dot that pulses each beat
 * @description
 * Renders a timeline of upcoming BPM changes and stops alongside the current BPM readout.
 * A pulsing beat indicator and tinted text help the player track beat timing during gameplay.
 * @example
 * // Modding usage example
 * const bpmViz = new BPMVisualizer(scene, 0, 0, 250, 30);
 * function update() {
 *   bpmViz.update();
 * }
 */
class BPMVisualizer extends Visualizer {
  constructor(scene, x, y, width, height) {
    super(scene, x, y, width, height);
    /** @type {Array} BPM change events from the song chart */
    this.bpmChanges = scene.song?.chart?.bpmChanges || [];
    /** @type {Array} Stop events from the song chart */
    this.stops = scene.song?.chart?.stops || [];
    /** @type {Object} Text display showing the current BPM */
    this.text = new Text(width - 1, 1, "");
    this.text.anchor.x = 1;
    this.text.alpha = 0.5;
    this.graphics.addChild(this.text);
    /** @type {number} Current alpha of the beat indicator */
    this.beatIndicatorAlpha = 1;
    /** @type {number} Current beat fraction from scene timing */
    this.currentBeat = 0;
    /** @type {number} Integer part of the current beat */
    this.currentBeatInt = 0;
    /** @type {number} Last integer beat value for change detection */
    this.previusBeatInt = 1;
    /** @type {number} Current BPM value */
    this.currentBpm = 0;
    /** @type {number} Last BPM value for change detection */
    this.previusBpm = 1;
  }

  /**
   * Redraws BPM change markers, stops, and the beat indicator each frame.
   */
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
      this.text.write(`${parseFloat(this.currentBpm.toFixed(3))}`);
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
  
  /**
   * Returns the BPM active at the current beat from the chart's BPM changes.
   * @returns {number} Current BPM value, or 0 if no changes exist
   */
  getLastBpm() {
    return this.bpmChanges.length ? this.bpmChanges.find((e, i, a) => i + 1 == a.length || a[i + 1].beat >= this.currentBeat).bpm : 0;
  }
  
  /**
   * Returns the stop active at the current beat from the chart's stop data.
   * @returns {Object|null} The active stop event or null if none exist
   */
  getLastStop() {
    return this.stops.length ? this.stops.find((e, i, a) => i + 1 == a.length || a[i + 1].beat >= this.currentBeat) : null;
  }

  /**
   * Frees the graphics and text display.
   */
  destroy() {
    super.destroy();
    this.text.destroy();
  }
}
