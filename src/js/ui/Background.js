class Background extends Phaser.Sprite {
  constructor(key, tween, min = 0.1, max = 0.5, time = 1000) {
    super(game, 0, 0, key);
    
    this.alpha = min;
    
    this.minAlpha = min;
    this.maxAlpha = max;
    this.tweenTime = time;
    
    if (tween) game.add.tween(this).to({ alpha: max }, time, Phaser.Easing.Quadratic.InOut, true).yoyo(true).repeat(-1);
    
    game.add.existing(this);
  }
  fadeIn() {
    game.add.tween(this).to({ alpha: this.maxAlpha }, this.tweenTime, "Linear", true);
  }
  fadeOut() {
    game.add.tween(this).to({ alpha: this.minAlpha }, this.tweenTime, "Linear", true);
  }
}
