class LoadingDots extends Phaser.Sprite {
  constructor() {
    super(game, game.width - 2, game.height - 2, "ui_loading_dots");
    
    this.anchor.set(1);
    
    this.animations.add('loading', [0, 1, 2, 3, 4, 3, 2, 1], 8, true);
    this.animations.play('loading');
    
    game.add.existing(this);
  }
}
