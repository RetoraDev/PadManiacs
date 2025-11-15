class BackgroundGradient extends Phaser.Sprite {
  constructor(min = 0.1, max = 0.5, time = 5000) {
    super(game, 0, 0, "ui_background_gradient");
    
    this.alpha = min;
    
    game.add.tween(this).to({ alpha: max }, 5000, Phaser.Easing.Quadratic.InOut, true).yoyo(true).repeat(-1);
    
    game.add.existing(this);
  }
} 
