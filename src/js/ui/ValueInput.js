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
    
    // Track input states
    this.firstPressTime = undefined;
    this.lastPress = 0;
    
    this.textLayer = new Text(3, 5, "");
    this.textLayer.tint = this.window.fontTint;
    this.window.addChild(this.textLayer);
    
    this.cursor = game.add.graphics(0, 1);
    this.cursor.beginFill(this.window.fontTint, 1);
    this.cursor.drawRect(0, 0, 2, 4);
    this.cursor.endFill();
    this.textLayer.addChild(this.cursor);

    this.lastCursorBlinkTime = 0;

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
    // Update text layer
    this.textLayer.write(`${this.value.toFixed(this.getDecimalPlaces())}`);
    
    // Update cursor position
    this.cursor.x = this.textLayer.texture.text.length * 4;

    // Blink cursor
    if (game.time.now - this.lastCursorBlinkTime >= 350) {
      this.cursor.visible = !this.cursor.visible;
      this.lastCursorBlinkTime = game.time.now;
    }
    
    // Handle navigation
    const { up, down, left, right, a, b } = gamepad.held;
    const pressed = gamepad.pressed;
    const released = gamepad.released;
  
    // Dynamic cooldown system
    let cooldown = 100;
    
    // Calculate time since last held press
    const timeSinceLastPress = game.time.now - this.lastPress;
    const timeSinceFirstPress = game.time.now - (this.firstPressTime || 0);
    
    // Dynamic cooldown logic: 
    if (timeSinceFirstPress < 1000) {
      cooldown = 400;
    } else if (timeSinceFirstPress < 1500) {
      cooldown = 200;
    } else if (timeSinceFirstPress < 1700) {
      cooldown = 100;
    } else if (timeSinceLastPress < 5000) {
      cooldown = 50;
    } else {
      cooldown = 16;
    }
    
    const cooldownEnded = timeSinceLastPress >= cooldown;
  
    // Handle pressed buttons
    if (pressed.up) {
      this.value = Math.min(this.max, this.value + this.step);
      this.resetPressTiming();
      return;
    } else if (pressed.down) {
      this.value = Math.max(this.min, this.value - this.step);
      this.resetPressTiming();
      return;
    } else if (pressed.left) {
      this.value = Math.max(this.min, this.value - this.step * 5);
      this.resetPressTiming();
      return;
    } else if (pressed.right) {
      this.value = Math.min(this.max, this.value + this.step * 5);
      this.resetPressTiming();
      return;
    }
    
    if (gamepad.pressed.a || gamepad.pressed.start) {
      this.confirm();
    }
    
    if (gamepad.pressed.b || gamepad.pressed.select) {
      this.cancel();
    }
    
    if (cooldownEnded) {
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
  }
  updatePressTiming() {
    // Track first press time
    if (this.firstPressTime === undefined) {
      this.firstPressTime = game.time.now;
    }
    
    // Update last press time
    this.lastPress = game.time.now;
  }
  resetPressTiming() {
    this.firstPressTime = game.time.now;
    this.lastPress = game.time.now;
  }
  getDecimalPlaces() {
    const split = this.step.toString().split('.');
    if (split[1]) {
      return split[1].length;
    } else {
      return 0;
    }
  }
  destroy() {
    super.destroy();
    this.onConfirm.dispose();
  }
}
