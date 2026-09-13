/**
 * @class ExperienceBar
 * @category UI Classes
 * @summary Visual experience progress bar
 * @constructor
 * @param {Number} x - X position of the bar
 * @param {Number} y - Y position of the bar
 * @param {Number} width - Width of the bar
 * @param {Number} height - Height of the bar
 * @features
 * Clamped 0-1 progress updates
 * Built-in background, fill and border graphics
 * @description
 * A progress bar showing experience or ANY / similar 0-to-1 value. It is drawn from three stacked graphics objects: a dark track, a teal fill scaled by progress, and a white border. Updating progress redraws the fill to match the current value.
 * @example
 * // Modding usage example
 * const bar = new ExperienceBar(10, 10, 300, 20);
 * game.add.existing(bar);
 * bar.setProgress(0.75);
 */
class ExperienceBar extends Phaser.Sprite {
  constructor(x, y, width, height) {
    super(game, x, y);
    /** @type {Number} Width of the bar */
    this.barWidth = width;
    /** @type {Number} Height of the bar */
    this.barHeight = height;
    /** @type {Number} Current progress between 0 and 1 */
    this.progress = 0;
    
    /** @type {Phaser.Graphics} Dark track behind the fill */
    this.background = game.add.graphics(0, 0);
    this.background.beginFill(0x333333);
    this.background.drawRect(0, 0, width, height);
    this.background.endFill();
    this.addChild(this.background);
    
    /** @type {Phaser.Graphics} Teal fill scaled by progress */
    this.bar = game.add.graphics(0, 0);
    this.addChild(this.bar);
    
    /** @type {Phaser.Graphics} White border around the bar */
    this.border = game.add.graphics(0, 0);
    this.border.lineStyle(1, 0xFFFFFF, 1);
    this.border.drawRect(0, 0, width, height);
    this.border.endFill();
    this.addChild(this.border);
    
    this.updateBar();
    
    game.add.existing(this);
  }
  
  /**
   * Sets the progress value clamped to 0-1 and redraws the fill.
   * @param {Number} progress - Progress value between 0 and 1
   */
  setProgress(progress) {
    this.progress = Phaser.Math.clamp(progress, 0, 1);
    this.updateBar();
  }
  
  /**
   * Redraws the fill graphics to match the current progress.
   */
  updateBar() {
    this.bar.clear();
    this.bar.beginFill(0x76fcde);
    this.bar.drawRect(0, 0, this.barWidth * this.progress, this.barHeight);
    this.bar.endFill();
  }
  
  /**
   * Destroys the track, fill, border and the bar sprite itself.
   */
  destroy() {
    this.background.destroy();
    this.bar.destroy();
    this.border.destroy();
    super.destroy();
  }
}