/**
 * @class AviSettings
 * @category Game States
 * @summary AVI bgvideo decoding settings screen (FFmpeg.wasm)
 * @constructor
 * @features
 * FFmpeg preset selector (ultrafast .. medium) for AVI to H.264 conversion
 * Quality (CRF) slider from 18 (near-lossless) to 32 (tiny)
 * Optional scaling of decoded videos to the game resolution
 * Optional deletion of the original .avi files after a successful Decode & Replace
 * @description
 * AviSettings edits Account.settings.aviSettings, which control how the
 * DecodeAvi state transcodes AVI background videos with the bundled
 * FFmpeg.wasm lite build. It mirrors the layout of Keybindings and
 * ChartModifiers and returns to the state that opened it.
 * @example
 * // Open from Settings
 * game.state.start("AviSettings");
 */
class AviSettings {
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

    /** @type {Object} Working copy of the AVI decoding settings */
    this.settings = Object.assign(
      {},
      DEFAULT_ACCOUNT.settings.aviSettings,
      Account.settings.aviSettings || {}
    );

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

    // FFmpeg preset
    const presets = ["ultrafast", "superfast", "veryfast", "faster", "fast", "medium"];
    const currentPresetIndex = Math.max(0, presets.indexOf(this.settings.ffmpegPreset));
    settingsWindow.addSettingItem(
      __("FFmpeg Preset||Preset de FFmpeg"),
      presets,
      currentPresetIndex,
      index => {
        this.settings.ffmpegPreset = presets[index];
      }
    );

    // Quality (CRF)
    settingsWindow.addRangeItem(
      __("Quality (CRF)||Calidad (CRF)"),
      18,
      32,
      1,
      this.settings.crf,
      "",
      value => {
        this.settings.crf = value;
      }
    );

    // Scale to game resolution
    settingsWindow.addSettingItem(
      __("Scale to Game Resolution||Escalar a Resolución del Juego"),
      [__("ENABLED||ACTIVADO"), __("DISABLED||DESACTIVADO")],
      this.settings.scaleToGameRes ? 0 : 1,
      index => {
        this.settings.scaleToGameRes = index === 0;
      }
    );

    // Delete original AVI
    settingsWindow.addSettingItem(
      __("Delete Original AVI||Eliminar AVI Original"),
      [__("ENABLED||ACTIVADO"), __("DISABLED||DESACTIVADO")],
      this.settings.deleteOriginal ? 0 : 1,
      index => {
        this.settings.deleteOriginal = index === 0;
      }
    );

    settingsWindow.addItem(__("BACK||VOLVER"), "", () => {
      this.windowManager.remove(settingsWindow, true);
      Account.settings.aviSettings = this.settings;
      saveAccount();
      game.state.start(this.returnState, true, false);
    }, true);
  }
}
