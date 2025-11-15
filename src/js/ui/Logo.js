class Logo extends Phaser.Sprite {
  constructor() {
    super(game, game.width / 2, game.height / 2, null);
    
    this.anchor.set(0.5);
    
    this.mainShape = this.addShape();
    
    game.add.existing(this);
  }
  intro(callback) {
    this.mainShape.alpha = 0;
    
    game.add.tween(this.mainShape).to({ alpha: 1 }, 1000, "Linear", true).onComplete.addOnce(() => {
      this.logoTween = game.add.tween(this.mainShape).to({ alpha: 0.8 }, 500, "Linear", true).repeat(-1).yoyo(true);
      callback && callback();
    });
  }
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
  addShape(tint = 0xffffff, x = 0, y = 0) {
    const shape = game.add.sprite(x, y, "ui_logo_shape");
    shape.anchor.set(0.5);
    shape.tint = tint;
    this.addChild(shape);
    return shape;
  }
}
