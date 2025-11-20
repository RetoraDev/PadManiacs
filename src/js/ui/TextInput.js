class TextInput extends Phaser.Sprite {
  constructor(text = "", maxLength = 6, onConfirm, onCancel) {
    super(game, 96, 28);
    this.anchor.x = 0.5;

    this.characterSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";

    this.window = new Window(0, 0, maxLength, 2, "1", this);
    this.window.x -= (this.window.size.width / 2) * 8;

    this.stackedText = text;
    this.text = "";
    this.currentIndex = 0;
    this.maxLength = maxLength;

    this.textLayer = new Text(3, 5, text);
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
  getCharacterToInsert() {
    return this.characterSet[this.currentIndex];
  }
  update() {
    const isAtMaxLength = this.stackedText.length >= this.maxLength;

    this.text = isAtMaxLength ? this.stackedText : this.stackedText + this.getCharacterToInsert();

    this.textLayer.write(this.text);

    this.cursor.x = this.text.length * 4;
    this.cursor.visible = !isAtMaxLength && this.cursorVisible;

    let newIndex = this.currentIndex;

    // Change letter
    if (gamepad.pressed.up) {
      newIndex--;
    }
    if (gamepad.pressed.down) {
      newIndex++;
    }

    if (newIndex < 0) newIndex = this.characterSet.length - 1;
    if (newIndex > this.characterSet.length - 1) newIndex = 0;

    this.currentIndex = newIndex;

    // Insert letter
    if (gamepad.pressed.a) {
      if (!isAtMaxLength) {
        this.stackedText += this.getCharacterToInsert();
      } else {
        this.confirm();
      }
    }

    // Remove letter
    if (gamepad.pressed.b) {
      if (this.stackedText.length > 0) {
        this.stackedText = this.stackedText.substr(0, this.stackedText.length - 1);
      } else {
        this.cancel();
      }
    }

    // Blink cursor
    if (game.time.now - this.lastCursorBlinkTime >= 350) {
      this.cursorVisible = !this.cursorVisible;
      this.lastCursorBlinkTime = game.time.now;
    }

    // Confirm
    if (gamepad.pressed.start) {
      this.confirm();
    }

    // Cancel
    if (gamepad.pressed.select) {
      this.cancel();
    }
  }
  confirm() {
    this.onConfirm.dispatch(this.text);
    this.destroy();
  }
  cancel() {
    this.onCancel.dispatch(this.text);
    this.destroy();
  }
  destroy() {
    super.destroy();
    this.onConfirm.dispose();
  }
}
