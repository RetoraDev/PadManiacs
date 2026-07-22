class Title {
  create() {
    game.camera.fadeIn(0xffffff);

    this.background = new BackgroundGradient();
    this.lines = new FuturisticLines();
    
    this.logo = new Logo();

    this.inputInstructionText = new Text(game.width / 2, 100, __("PRESS ANY KEY||PULSA CUALQUIER TECLA"));
    this.inputInstructionText.anchor.x = 0.5;
    game.add.tween(this.inputInstructionText).to({ alpha: 0 }, 500, "Linear", true, 0, -1).yoyo(true);

    this.text = game.add.sprite(0, 0);

    this.creditText = new Text(2, game.height, COPYRIGHT, FONTS.small, this.text);
    this.creditText.anchor.y = 1;

    this.versionText = new Text(game.width - 2, game.height, VERSION, FONTS.small, this.text);
    this.versionText.anchor.set(1);

    if (!backgroundMusic) {
      backgroundMusic = new BackgroundMusic();
    }
    backgroundMusic.playLastSong();

    this.introEnded = false;

    this.logo.intro(() => (this.introEnded = true));

    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  resetKeybindings() {
    if (confirm(__(
      "!! EMERGENCY RESET TRIGGERED !!\n" +
      "Holding 3+ buttons during the title animation has triggered the emergency reset of the control settings.\n" +
      "Proceed only if the controls have become unusable during remapping.\n" +
      "This will reset keyboard and gamepad mappings to their initial state.\n\n" +
      "Proceed?" +
      "||" +
      "!! RESET DE EMERGENCIA ACTIVADO !!\n" +
      "Mantener 3+ botones durante la animación del título ha activado el reset de emergencia de los controles.\n" +
      "Procede solo si los controles se han vuelto inutilizables durante la reasignación.\n" +
      "Esto restablecerá las configuraciones de teclado y mando a su estado inicial.\n\n" +
      "¿Proceder?"
    ))) {
      Account.mapping.keyboard = JSON.parse(JSON.stringify(DEFAULT_KEYBOARD_MAPPING));
      Account.mapping.gamepad = JSON.parse(JSON.stringify(DEFAULT_GAMEPAD_MAPPING));
      saveAccount();
      gamepad.updateMapping(Account.mapping.keyboard, Account.mapping.gamepad);
      notifications.show(__("Keybindings reset!||¡Teclas restablecidas!"));
    }
  }
  
  restoreDefaults() {
    if (confirm(__(
      "!! EMERGENCY RESET TRIGGERED !!\n" +
      "Holding 6+ buttons during the title animation has triggered a full factory reset.\n" +
      "This will restore ALL settings, controls, and preferences to their default state.\n\n" +
      "Proceed?" +
      "||" +
      "!! RESET DE EMERGENCIA ACTIVADO !!\n" +
      "Mantener 6+ botones durante la animación del título ha activado un restablecimiento de fábrica completo.\n" +
      "Esto restaurará TODOS los ajustes, controles y preferencias a su estado predeterminado.\n\n" +
      "¿Proceder?"
    ))) {
      Account.settings = DEFAULT_ACCOUNT.settings;
      saveAccount();
      window.location.reload();
    }
  }
  
  update() {
    gamepad.update();

    if (this.introEnded && !this.outroStarted && (mouse.pressed.left || gamepad.pressed.any)) {
      this.outroStarted = true;
      this.text.alpha = 0;
      
      this.logo.outro(() => {
        let heldButtons = Object.values(gamepad.held).reduce((acc, held) => (held ? acc + 1 : acc));
        if (heldButtons >= 6) {
          this.restoreDefaults();
          gamepad.vibrate(100);
        } else if (heldButtons >= 3) {
          this.resetKeybindings();
          gamepad.vibrate(100);
        } 
        
        game.state.start("MainMenu");
      });
    }
  }
}