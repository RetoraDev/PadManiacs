/**
 * @class Logo
 * @category UI Classes
 * @summary Animated logo for title screen
 * @constructor
 * @description
 * The animated title-screen emblem centered on the screen. It builds its own layered shapes and runs intro, looping-pulse, flourish and outro choreography. The outro effect detonates the logo into expanding rings while the camera flashes and fades to white.
 * @example
 * // Modding usage example
 * const logo = new Logo();
 * game.add.existing(logo);
 * logo.intro(() => {
 *   logo.effect(5, 1000);
 * });
 */
class Logo extends Phaser.Sprite {
  constructor() {
    super(game, game.width / 2, game.height / 2, null);
    
    this.anchor.set(0.5);
    
    /** @type {Phaser.Sprite} Main logo shape that can be tweaked */
    this.mainShape = this.addShape();
    
    game.add.existing(this);
  }
  /**
   * Plays the intro animation, fading the main shape in and then starting an infinite breathing pulse before invoking the callback.
   * @param {Function} [callback] - Called once the intro animation finishes
   */
  intro(callback) {
    this.mainShape.alpha = 0;
    
    game.add.tween(this.mainShape).to({ alpha: 1 }, 1000, "Linear", true).onComplete.addOnce(() => {
      /** @type {Phaser.Tween} Infinite yoyo pulse tween on the main shape */
      this.logoTween = game.add.tween(this.mainShape).to({ alpha: 0.8 }, 500, "Linear", true).repeat(-1).yoyo(true);
      callback && callback();
    });
  }
  /**
   * Plays the outro animation: spawns a flash shape, scales it up while fading, flashes the camera white and fades to white before calling the callback.
   * @param {Function} [callback] - Called once the fade-out completes
   */
  outro(callback) {
    this.effect(32, 1000);
      
    const shape = this.addShape();
    shape.alpha = 1;
    game.add.tween(shape).to({ alpha: 0 }, 250, "Linear", true);
    game.add.tween(shape.scale).to({ x: 8, y: 8 }, 250, "Linear", true);
      
    game.camera.flash(0xffffff, 300);
    game.time.events.add(350, () => game.camera.fade(0xffffff, 1000));
    game.camera.onFadeComplete.addOnce(() => callback && callback());
  }
  /**
   * Spawns several logo shapes that fade in and out in a staggered yoyo cascade for a shockwave flourish.
   * @param {Number} [amountLayers=5] - Number of layered shapes to spawn
   * @param {Number} [time=1000] - Fade tween duration in milliseconds
   * @param {Boolean} [invert=false] - Whether layer delays cascade downward instead of upward
   */
  effect(amountLayers = 5, time = 1000, invert = false) {
    let layers = [];
    for (let i = 0; i < amountLayers; i ++) {
      const shape = this.addShape();
      shape.alpha = 0;
      shape.scale.set(1.0 + (i / 10));
      layers.push(shape);
      game.add.tween(shape).to({ alpha: 1 }, time, "Linear", true, (invert ? - amountLayers * 100 : 0) + i * 100).yoyo(true);
    }
  }
  /**
   * Creates a centered tinted logo shape child at the given local offset.
   * @param {Number} [tint=0xffffff] - Hex color to tint the shape with
   * @param {Number} [x=0] - Local X offset
   * @param {Number} [y=0] - Local Y offset
   * @returns {Phaser.Sprite} The newly created logo shape child
   */
  addShape(tint = 0xffffff, x = 0, y = 0) {
    const shape = game.add.sprite(x, y, "ui_logo_shape");
    shape.anchor.set(0.5);
    shape.tint = tint;
    this.addChild(shape);
    return shape;
  }
}
