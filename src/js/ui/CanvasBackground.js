class CanvasBackground extends Phaser.Sprite {
  constructor(canvas) {
    super(game, 0, 0);
    
    this.baseTexture = new PIXI.BaseTexture(canvas);
    
    this.texture = new PIXI.Texture(
      this.baseTexture,
      new PIXI.Rectangle(0, 0, game.width, game.height),
      new PIXI.Rectangle(0, 0, game.width, game.height)
    );
    
    game.add.existing(this);
  }
  render() {
    this.baseTexture.dirty();
  }
}