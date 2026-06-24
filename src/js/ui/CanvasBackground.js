class CanvasBackground extends Phaser.Sprite {
  constructor(x = 0, y = 0, canvas) {
    super(game, x, y);

    this.setCanvas(canvas);
    
    game.add.existing(this);
  }
  restoreCanvas() {
    if (this.canvas && this.canvas instanceof HTMLCanvasElement) {
      this.setCanvas(this.canvas);
    }
  }
  setCanvas(canvas) {
    this.canvas = canvas ? canvas : document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    
    this.baseTexture = new PIXI.BaseTexture(this.canvas);
    
    this.texture = new PIXI.Texture(
      this.baseTexture,
      new PIXI.Rectangle(0, 0, game.width, game.height),
      new PIXI.Rectangle(0, 0, game.width, game.height)
    );
  }
  dirty() {
    this.render();
  }
  render() {
    this.baseTexture.dirty();
  }
}