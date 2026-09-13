/**
 * @class Background
 * @category UI Classes
 * @summary Generic background sprite with alpha tween
 * @constructor
 * @param {String} key - Texture key of the background image
 * @param {Boolean} tween - Whether to automatically oscillate alpha
 * @param {Number} min - Minimum alpha value
 * @param {Number} max - Maximum alpha value
 * @param {Number} time - Duration of the alpha tween in milliseconds
 * @features
 * Optional looping alpha pulsation
 * Manual fade in/out helpers
 * @description
 * A full-screen sprite anchored at the top-left that sits behind the gameplay scene. The sprite starts at the minimum alpha and, when tween is enabled, drifts between min and max with an infinite yoyo tween. Fade methods let individual states animate the background in and out on demand.
 * @example
 * // Modding usage example
 * const bg = new Background('my_background', true, 0.1, 0.5, 1000);
 * game.add.existing(bg);
 * bg.fadeIn();
 * bg.fadeOut();
 */
class Background extends Phaser.Sprite {
  constructor(key, tween, min = 0.1, max = 0.5, time = 1000) {
    super(game, 0, 0, key);
    
    /** @type {Number} Current alpha value */
    this.alpha = min;
    
    /** @type {Number} Minimum alpha value */
    this.minAlpha = min;
    /** @type {Number} Maximum alpha value */
    this.maxAlpha = max;
    /** @type {Number} Alpha tween duration in milliseconds */
    this.tweenTime = time;
    
    if (tween) game.add.tween(this).to({ alpha: max }, time, Phaser.Easing.Quadratic.InOut, true).yoyo(true).repeat(-1);
    
    game.add.existing(this);
  }
  /**
   * Fades the background sprite up to its maximum alpha using a linear tween.
   */
  fadeIn() {
    game.add.tween(this).to({ alpha: this.maxAlpha }, this.tweenTime, "Linear", true);
  }
  /**
   * Fades the background sprite down to its minimum alpha using a linear tween.
   */
  fadeOut() {
    game.add.tween(this).to({ alpha: this.minAlpha }, this.tweenTime, "Linear", true);
  }
}
