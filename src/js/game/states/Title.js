/**
 * @class Title
 * @category Game States
 * @summary Title Screen with animated logo
 * @constructor
 * @description
 * The game's title screen, shown after the local songs finish loading. It fades in the
 * camera, shows the background effects, animated logo, credit, and version texts, plays
 * the last heard song through the global background music controller, and waits for a
 * key press to advance to the main menu. Holding several buttons during the logo intro
 * triggers emergency keybinding or factory resets.
 * @example
 * // The menu entry point reached after the loading chain finishes.
 * game.state.add('Title', Title);
 * game.state.start('Title');
 */
class Title {
  /**
   * Builds the title screen visuals (background, logo, instruction and credit texts),
   * starts background music, runs the logo intro animation, and lets addons inject
   * their own state behaviors.
   */
  create() {
    game.camera.fadeIn(0xffffff);

    /** @type {BackgroundGradient} Animated gradient backdrop behind the title */
    this.background = new BackgroundGradient();
    /** @type {FuturisticLines} Decorative moving lines behind the logo */
    this.lines = new FuturisticLines();
    
    /** @type {Logo} The game's animated title logo */
    this.logo = new Logo();

    /** @type {Text} Pulsing "press any key" prompt shown beneath the logo */
    this.inputInstructionText = new Text(game.width / 2, 100, __("PRESS ANY KEY||PULSA CUALQUIER TECLA"));
    this.inputInstructionText.anchor.x = 0.5;
    game.add.tween(this.inputInstructionText).to({ alpha: 0 }, 500, "Linear", true, 0, -1).yoyo(true);

    /** @type {Phaser.Sprite} Container sprite holding the credit and version texts */
    this.text = game.add.sprite(0, 0);

    /** @type {Text} Copyright notice in the bottom left corner */
    this.creditText = new Text(2, game.height, COPYRIGHT, FONTS.small, this.text);
    this.creditText.anchor.y = 1;

    /** @type {Text} Game version label in the bottom right corner */
    this.versionText = new Text(game.width - 2, game.height, VERSION, FONTS.small, this.text);
    this.versionText.anchor.set(1);

    if (!backgroundMusic) {
      /** @type {BackgroundMusic} Global background music controller */
      backgroundMusic = new BackgroundMusic();
    }
    backgroundMusic.playLastSong();

    /** @type {boolean} Whether the logo intro animation has finished */
    this.introEnded = false;

    this.logo.intro(() => (this.introEnded = true));

    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  /**
   * Emergency fallback that restores the keyboard and gamepad mappings to their defaults
   * when holding at least three buttons during the title animation, after confirmation.
   */
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
  
  /**
   * Emergency fallback that performs a full factory reset of all settings and reloads
   * the page when holding at least six buttons during the title animation, if confirmed.
   */
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
  
  /**
   * Refreshes the gamepad each frame. Once the logo intro has finished, a mouse or
   * gamepad press triggers the logo outro, checks held buttons for emergency resets,
   * and advances to the main menu.
   */
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