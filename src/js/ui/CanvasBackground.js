/**
 * @class CanvasBackground
 * @category UI Classes
 * @summary Canvas-based background rendering for dynamic content
 * @constructor
 * @param {Number} [x=0] - X position of the background
 * @param {Number} [y=0] - Y position of the background
 * @param {HTMLCanvasElement} [canvas] - Existing canvas to render; created if omitted
 * @features
 * Backs the sprite with a live HTML canvas texture
 * Restores a replaced canvas texture
 * @description
 * Wraps a 2D canvas in a PIXI texture so dynamic content can be drawn to it like a normal sprite. Canvas textures are exposed for direct painting, and a per-frame dirty flag forces them to refresh. Useful for effects that Phaser shapes cannot easily produce.
 * @example
 * // Modding usage example
 * const bg = new CanvasBackground(0, 0, document.createElement('canvas'));
 * game.add.existing(bg);
 * bg.render();
 */
class CanvasBackground extends Phaser.Sprite {
  constructor(x = 0, y = 0, canvas) {
    super(game, x, y);

    this.setCanvas(canvas);
    
    game.add.existing(this);
  }
  /**
   * Re-attaches the previously stored canvas, restoring its texture after the canvas was replaced.
   */
  restoreCanvas() {
    if (this.canvas && this.canvas instanceof HTMLCanvasElement) {
      this.setCanvas(this.canvas);
    }
  }
  /**
   * Wraps the given canvas in a fresh base texture and sprite texture sized to the game viewport.
   * @param {HTMLCanvasElement} [canvas] - Canvas element to render; created if omitted
   */
  setCanvas(canvas) {
    /** @type {HTMLCanvasElement} The canvas element backing the texture */
    this.canvas = canvas ? canvas : document.createElement("canvas");
    /** @type {CanvasRenderingContext2D} 2D drawing context of the canvas */
    this.ctx = this.canvas.getContext("2d");
    
    /** @type {PIXI.BaseTexture} Base texture built from the canvas */
    this.baseTexture = new PIXI.BaseTexture(this.canvas);
    
    /** @type {PIXI.Texture} Sprite texture mapping the game viewport into the base texture */
    this.texture = new PIXI.Texture(
      this.baseTexture,
      new PIXI.Rectangle(0, 0, game.width, game.height),
      new PIXI.Rectangle(0, 0, game.width, game.height)
    );
  }
  /**
   * Marks the canvas as needing a refresh by re-rendering its texture next frame.
   */
  dirty() {
    this.render();
  }
  /**
   * Flags the base texture as dirty so the canvas contents are re-uploaded to the GPU.
   */
  render() {
    this.baseTexture.dirty();
  }
}