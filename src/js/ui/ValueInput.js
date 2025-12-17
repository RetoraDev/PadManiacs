class ValueInput extends Phaser.Sprite {
  constructor(value = 0, min = 0, max = Infinity, step = 1, onConfirm, onCancel) {
    super(game, 96, 28);
    
    this.anchor.x = 0.5;

    this.window = new Window(0, 0, 8, 2, "1", this);
    this.window.x -= (this.window.size.width / 2) * 8;
    
    this.value = value;
    this.min = min;
    this.max = max;
    this.step = step;
    
    this.lastInputTime = 0;
    this.inputCooldown = 120; 
    
    this.textLayer = new Text(3, 5, "");
    this.textLayer.tint = this.window.fontTint;
    this.window.addChild(this.textLayer);
    
    this.cursor = game.add.graphics(0, 1);
    this.cursor.beginFill(this.window.fontTint, 1);
    this.cursor.drawRect(0, 0, 2, 4);
    this.cursor.endFill();
    this.textLayer.addChild(this.cursor);

    this.lastCursorBlinkTime = 0;
    this.cursorVisible = false;

    this.onConfirm = new Phaser.Signal();
    this.onCancel = new Phaser.Signal();

    if (onConfirm) {
      this.onConfirm.add(onConfirm);
    }
    if (onCancel) {
      this.onCancel.add(onCancel);
    }

    game.add.existing(this);
  }
  confirm() {
    this.onConfirm.dispatch(parseFloat(this.value.toFixed(3)));
    this.destroy();
  }
  cancel() {
    this.onCancel.dispatch(parseFloat(this.value.toFixed(3)));
    this.destroy();
  }
  update() {
    if (game.time.now - this.lastInputTime > this.inputCooldown) {
      if (gamepad.held.down) {
        this.value = Math.max(this.min, this.value - this.step);
        this.lastInputTime = game.time.now;
      }
      if (gamepad.held.up) {
        this.value = Math.min(this.max, this.value + this.step);
        this.lastInputTime = game.time.now;
      }
      if (gamepad.held.left) {
        this.value = Math.max(this.min, this.value - this.step * 5);
        this.lastInputTime = game.time.now;
      }
      if (gamepad.held.right) {
        this.value = Math.min(this.max, this.value + this.step * 5);
        this.lastInputTime = game.time.now;
      }
    }
    
    this.textLayer.write(`${this.value.toFixed(3)}`);
    
    this.cursor.x = this.textLayer.texture.text.length * 4;
    
    if (gamepad.pressed.a || gamepad.pressed.start) {
      this.confirm();
    }
    
    if (gamepad.pressed.b || gamepad.pressed.select) {
      this.cancel();
    }
    
    if (game.time.now - this.lastCursorBlinkTime >= 350) {
      this.cursorVisible = !this.cursorVisible;
      this.lastCursorBlinkTime = game.time.now;
    }
  }
  destroy() {
    super.destroy();
    this.onConfirm.dispose();
  }
}
