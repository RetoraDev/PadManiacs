/**
 * @class LoadingDots
 * @category UI Classes
 * @summary Animated loading indicator
 * @constructor
 * @features
 * Looping 8-frame animation
 * Anchor pinned to the bottom-right corner
 * @description
 * A small animated sprite shown in the bottom-right corner while the game loads assets. It plays a looping animation cycling through several dot frames and is anchored at its bottom-right corner. No configuration or interaction is required once added to the world.
 * @example
 * // Modding usage example
 * const dots = new LoadingDots();
 * game.add.existing(dots);
 */
class LoadingDots extends Phaser.Sprite {
  constructor() {
    super(game, game.width - 2, game.height - 2, "ui_loading_dots");
    
    this.anchor.set(1);
    
    this.animations.add('loading', [0, 1, 2, 3, 4, 3, 2, 1], 8, true);
    this.animations.play('loading');
    
    game.add.existing(this);
  }
}
