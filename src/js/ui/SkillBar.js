/**
 * @class SkillBar
 * @category UI Classes
 * @summary Visual skill level indicator (1-5 segments)
 * @constructor
 * @param {Number} x - X position of the bar
 * @param {Number} y - Y position of the bar
 * @features
 * Five segment sprites toggled individually
 * Update hooks from value and visibleParts
 * @description
 * A row of up to five segment sprites representing a 1-5 skill rating. Each segment shows a filled or empty frame depending on whether its index is below the current value. Fewer segments can be shown by lowering visibleParts.
 * @example
 * // Modding usage example
 * const bar = new SkillBar(100, 200);
 * game.add.existing(bar);
 * bar.value = 3;
 */
class SkillBar extends Phaser.Sprite {
  constructor(x, y) {
    super(game, x, y);
    
    /** @type {Array<Phaser.Sprite>} Segment sprites making up the bar */
    this.parts = [];
    
    /** @type {Number} How many of the five segments are shown */
    this.visibleParts = 5;
    /** @type {Number} Current rating 1-5 that fills segments */
    this.value = 5;
    
    for (let i = 0, x = 0; i < 5; i++, x += 3) {
      const part = game.add.sprite(x, 0, 'ui_skill_bar', 0);
      this.addChild(part);
      this.parts.push(part);
    }
    
    game.add.existing(this);
  }
  /**
   * Phaser lifecycle hook called every frame. Toggles each segment's visibility and frame based on visibleParts and value.
   */
  update() {
    for (let i = 1; i <= 5; i++) {
      const part = this.parts[i - 1];
      
      part.visible = i <= this.visibleParts;
      part.frame = this.value >= i ? 0 : 1;
    }
  }
}