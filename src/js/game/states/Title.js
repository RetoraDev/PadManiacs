class Title {
  create() {
    game.camera.fadeIn(0xffffff);

    this.background = new BackgroundGradient();
    this.lines = new FuturisticLines();
    this.logo = new Logo();

    this.inputInstructionText = new Text(game.width / 2, 80, "PRESS ANY KEY");
    this.inputInstructionText.anchor.x = 0.5;
    game.add.tween(this.inputInstructionText).to({ alpha: 0 }, 500, "Linear", true, 0, -1).yoyo(true);

    this.text = game.add.sprite(0, 0);

    this.creditText = new Text(2, 110, COPYRIGHT, this.text);
    this.creditText.anchor.y = 1;

    this.creditText = new Text(190, 110, VERSION, this.text);
    this.creditText.anchor.set(1);

    if (!backgroundMusic) {
      backgroundMusic = new BackgroundMusic();
    }
    backgroundMusic.playLastSong();

    this.introEnded = false;

    this.logo.intro(() => (this.introEnded = true));

    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  resetKeybindings() {
    Account.mapping.keyboard = JSON.parse(JSON.stringify(DEFAULT_KEYBOARD_MAPPING));
    Account.mapping.gamepad = JSON.parse(JSON.stringify(DEFAULT_GAMEPAD_MAPPING));
    saveAccount();
    gamepad.updateMapping(Account.mapping.keyboard, Account.mapping.gamepad);
    notifications.show("Keybindings reset!");
  }
  update() {
    gamepad.update();

    let heldButtons = Object.values(gamepad.held).reduce((acc, held) => (held ? acc + 1 : acc));

    if (this.introEnded && !this.outroStarted && gamepad.pressed.any) {
      this.outroStarted = true;
      this.text.alpha = 0;
      this.logo.outro(() => {
        if (heldButtons >= 3) {
          this.resetKeybindings();
          gamepad.vibrate(100);
        } 
        
        game.state.start("MainMenu");
      });
    }
  }
}
