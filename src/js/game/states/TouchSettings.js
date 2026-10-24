/**
 * @class TouchSettings
 * @category Game States
 * @summary On-screen touch controls settings screen
 * @constructor
 * @features
 * 
 * @description
 * 
 */
class TouchSettings {
  /**
   * Phaser state hook that stores the state to return to after editing.
   * @param {string} [returnState='Settings'] - Name of the state to return to
   */
  init(returnState = "Settings") {
    /** @type {string} Game state to start when leaving this screen */
    this.returnState = returnState;
  }

  /**
   * Phaser state hook that sets up the background and builds the settings window.
   */
  create() {
    game.camera.fadeIn(0x000000);

    /** @type {FuturisticLines} Decorative animated background line effect */
    this.futuristicLines = new FuturisticLines();
    /** @type {BackgroundGradient} Ambient gradient overlay for the menu background */
    this.backgroundGradient = new BackgroundGradient();
    /** @type {NavigationHint} On-screen hint bar with contextual button labels */
    this.navigationHint = new NavigationHint("general");

    /** @type {WindowManager} Manages the settings window and its focus */
    this.windowManager = new WindowManager();

    gamepad.releaseAll();

    this.showMenu();

    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  /**
   * Phaser lifecycle hook called every frame to poll gamepad input.
   */
  update() {
    gamepad.update();
    this.windowManager.update();
  }

  /**
   * Builds the settings window with every AVI decoding option.
   */
  showMenu() {
    const settingsWindow = this.windowManager.createWindow(2, 1, 26, 15, "1");
    settingsWindow.fontTint = 0x76fcde;

    /** @type {Window} The settings window being edited */
    this.settingsWindow = settingsWindow;

    // Portrait Touch Gamepad Size
    settingsWindow.addRangeItem(
      __("(Portrait Touch Gamepad Size|Tamaño del mando táctil en vertical)"),
      0,
      150,
      1,
      Account.settings.touch.controlsScalePortrait * 100,
      "%",
      value => {
        Account.settings.touch.controlsScalePortrait = value / 100;
        saveAccount();
        document.body.style.setProperty("--controls-scale-portrait", `${value / 100}`);
      }
    );
    
    // Landscape Touch Gamepad Size
    settingsWindow.addRangeItem(
      __("(Landscape Touch Gamepad Size|Tamaño del mando táctil en horizontal)"),
      0,
      150,
      1,
      Account.settings.touch.controlsScaleLandscape * 100,
      "%",
      value => {
        Account.settings.touch.controlsScaleLandscape = value / 100;
        saveAccount();
        document.body.style.setProperty("--controls-scale-landscape", `${value / 100}`);
      }
    );
    
    // Portrait Touch Gamepad Opacity
    settingsWindow.addRangeItem(
      __("(Portrait Touch Gamepad Opacity|Opacidad del mando táctil en vertical)"),
      0,
      100,
      1,
      Account.settings.touch.controlsOpacityPortrait * 100,
      "%",
      value => {
        Account.settings.touch.controlsOpacityPortrait = value / 100;
        saveAccount();
        document.body.style.setProperty("--controls-opacity-portrait", `${value / 100}`);
      }
    );
    
    // Landscape Touch Gamepad Opacity
    settingsWindow.addRangeItem(
      __("(Landscape Touch Gamepad Opacity|Opacidad del mando táctil en horizontal)"),
      0,
      100,
      1,
      Account.settings.touch.controlsOpacityLandscape * 100,
      "%",
      value => {
        Account.settings.touch.controlsOpacityLandscape = value / 100;
        saveAccount();
        document.body.style.setProperty("--controls-opacity-landscape", `${value / 100}`);
      }
    );
    
    // Portrait Rhythm Pad Size
    settingsWindow.addRangeItem(
      __("(Portrait Rhythm Pad Size|Tamaño del Rhythm Pad en vertical)"),
      0,
      150,
      1,
      Account.settings.touch.rhythmPadScalePortrait * 100,
      "%",
      value => {
        Account.settings.touch.rhythmPadScalePortrait = value / 100;
        saveAccount();
        document.body.style.setProperty("--rhythm-pad-scale-portrait", `${value / 100}`);
      }
    );
    
    // Landscape Rhythm Pad Size
    settingsWindow.addRangeItem(
      __("(Landscape Rhythm Pad Size|Tamaño del Rhythm Pad en horizontal)"),
      0,
      150,
      1,
      Account.settings.touch.rhythmPadScaleLandscape * 100,
      "%",
      value => {
        Account.settings.touch.rhythmPadScaleLandscape = value / 100;
        saveAccount();
        document.body.style.setProperty("--rhythm-pad-scale-landscape", `${value / 100}`);
      }
    );
    
    // Portrait Screen Position 
    settingsWindow.addRangeItem(
      __("(Vertical Game Position|Posición vertical del juego)"),
      30,
      70,
      1,
      Account.settings.touch.portraitScreenPosition,
      "%",
      value => {
        Account.settings.touch.portraitScreenPosition = value;
        saveAccount();
        document.body.style.setProperty("--controller-parent-height", `${100 - value}%`);
      }
    );
    
    // Show Rhythm Pad in Landscape
    settingsWindow.addSettingItem(
      __("(Show Rhythm Pad in Landscape|Mostrar Rhythm Pad en Horizontal)"),
      [__("(Yes|Sí)"), __("(No|No)")],
      Account.settings.touch.showRhythmPadInLandscape ? 0 : 1,
      index => {
        Account.settings.touch.showRhythmPadInLandscape = index === 0;
        document.body.style.setProperty("--rhythm-pad-visibility-landscape", `${Account.settings.touch.showRhythmPadInLandscape ? "visible" : "hidden"}`);
        saveAccount();
      }
    );

    settingsWindow.addItem(__("BACK||VOLVER"), "", () => {
      this.windowManager.remove(settingsWindow, true);
      saveAccount();
      game.state.start(this.returnState, true, false);
    }, true);
  }
}
