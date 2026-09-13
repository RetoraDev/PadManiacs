/**
 * @class AccuracyVisualizer
 * @category Core Game Classes
 * @summary Displays timing accuracy history graph
 * @constructor
 * @param {Object} scene - The Phaser game state scene
 * @param {number} x - Horizontal position
 * @param {number} y - Vertical position
 * @param {number} width - Display width in pixels
 * @param {number} height - Display height in pixels
 * @features
 * Real-time timing accuracy line graph
 * Automatic history trimming to fit display width
 * Green line rendering with zero-baseline reference
 * @description
 * Renders a scrolling line graph that visualizes the player's recent timing accuracy judgments.
 * Each point represents one note's timing offset, drawn relative to a zero-accuracy baseline.
 * @example
 * // Modding usage example
 * const accViz = new AccuracyVisualizer(scene, 0, 0, 300, 50);
 * scene.update = function () {
 *   accViz.update();
 * };
 */
class AccuracyVisualizer extends Visualizer {
  constructor(scene, x, y, width, height) {
    super(scene, x, y, width, height);
    /** @type {Array} Timing accuracy history from the player */
    this.accuracyHistory = [];
    /** @type {number} Maximum number of history points visible at once */
    this.maxHistoryLength = this.width / 4;
  }

  /**
   * Draws the accuracy history graph by reading timing data from the active player.
   */
  update() {
    if (!this.active || !this.scene.player) return;

    this.clear();
    
    this.accuracyHistory = this.scene.player.timingStory;
    
    // Keep only recent history
    if (this.accuracyHistory.length > this.maxHistoryLength) {
      this.accuracyHistory.shift();
    }
    
    // Draw 0 line
    this.graphics.lineStyle(1, 0xF0F0F0, 0.1);
    this.graphics.moveTo(0, 3);
    this.graphics.lineTo(this.width, 3);
      
    // Draw accuracy line
    if (this.accuracyHistory.length > 1) {
      this.graphics.lineStyle(1, 0x00FF00, 1);
      this.graphics.moveTo(0, 3);

      for (let i = 0; i < this.accuracyHistory.length; i++) {
        const x = (i / this.maxHistoryLength) * this.width;
        const accuracy = this.accuracyHistory[i];
        const y = 3 + (accuracy * 10) * 3;
        
        this.graphics.lineTo(x, y);
      }
    }
  }
}
