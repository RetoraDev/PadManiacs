/**
 * @class BackgroundGradient
 * @category UI Classes
 * @summary Animated gradient background
 * @constructor
 * @param {Number} min - Minimum alpha value
 * @param {Number} max - Maximum alpha value
 * @param {Number} time - Full alpha cycle duration in milliseconds
 * @features
 * Loops the gradient alpha forever
 * @description
 * A looping gradient backdrop used on title and loading screens. Extends Background and always configures its own looping alpha tween. It layers a soft animated color gradient behind menus without any further setup from the caller.
 * @example
 * // Modding usage example
 * const bg = new BackgroundGradient(0.1, 0.5, 5000);
 * game.add.existing(bg);
 * bg.fadeIn();
 */
class BackgroundGradient extends Background {
  constructor(min = 0.1, max = 0.5, time = 5000) {
    super("ui_background_gradient", true, min, max, time);
  }
} 
