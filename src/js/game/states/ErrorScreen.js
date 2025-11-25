class ErrorScreen {
  init(message, recoverStateKey) {
    this.message = message || "The causes of this failure are unknown yet";
    this.recoverStateKey = recoverStateKey || "Title";
  }
  create() {
    this.background = game.add.graphics(0, 0);
    this.background.beginFill(0x4428bc, 1);
    this.background.drawRect(0, 0, game.width, game.height);
    this.background.endFill();
    
    const text = new Text(96, 52, "");
    
    text.write(`AN ERROR HAS OCURRED!
    
${this.message}

Please Report The Developer Immediately!

Press Any Key To Recover`);
    text.wrapPreserveNewlines(188);

    text.anchor.set(0.5);
    
    // TODO: Check if gamepad didn't crashed before using it, fallback to window event listeners
    gamepad.signals.pressed.any.addOnce(() => {
      game.state.start(this.recoverStateKey);
    });
  }
  update() {
    gamepad.update();
  }
}