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
    
    const text = new Text(120, 64, "");
    
    text.write(`AN ERROR HAS OCURRED!
    
${this.message}

Please Report The Developer Immediately!

• Press Any Key To Recover
• ${game.device.touch ? 'Tap' : 'Click'} the blue screen to report`);
    text.wrap(236);

    text.anchor.set(0.5);
    
    window.addEventListener("keydown", () => {
      game.state.start(this.recoverStateKey);
    }, { once: true });
    
    game.canvas.parentNode.addEventListener("click", () => {
      openExternalUrl(FEEDBACK_BUG_REPORT_URL);
      game.state.start(this.recoverStateKey);
    }, { once: true });
  }
}