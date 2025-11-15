class Background extends Phaser.Sprite {
  constructor(key, tween, min = 0.1, max = 0.5, time = 5000) {
    super(game, 0, 0, key);
    
    this.alpha = min;
    
    if (tween) game.add.tween(this).to({ alpha: max }, 5000, Phaser.Easing.Quadratic.InOut, true).yoyo(true).repeat(-1);
    
    game.add.existing(this);
  }
}
