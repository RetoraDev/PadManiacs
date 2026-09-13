/**
 * @class ChartModifiers
 * @category Game States
 * @summary Chart modifier and note rendering settings screen
 * @constructor
 * @features
 * Toggle switches for No Jumps, No Hands, No Freezes, No Mines, Mirrored and Randomized
 * Inline note colors, note speed and speed mod options when opened outside of Settings
 * Applies and saves the modifiers to the account before returning to the calling state
 * @description
 * The Chart Modifiers state is a compact settings overlay reachable from the pause menu
 * or from Settings. It edits note rendering options and toggles the chart modifier flags,
 * saving them to the account and returning control to the state that requested them.
 * @example
 * // Launch chart modifiers and resume gameplay afterwards
 * game.state.start("ChartModifiers", true, false, "Play", song, 0);
 *
 * // Read the active chart modifiers
 * console.log(Account.settings.chartModifiers);
 */
class ChartModifiers {
  /**
   * Phaser state hook that stores the state to return to after applying.
   * @param {string} returnState - Name of the state to return to after applying
   * @param {...*} returnParams - Params to forward when restarting the return state
   */
  init(returnState = "Settings", ...returnParams) {
    this.returnState = returnState;
    this.returnParams = returnParams;
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
    
    /** @type {Object} The current chart modifier flags being edited */
    this.modifiers = Account.settings.chartModifiers || DEFAULT_ACCOUNT.settings.chartModifiers;
    
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
   * Builds the settings window with the modifier and rendering options.
   */
  showMenu() {
    const settingsWindow = this.windowManager.createWindow(2, 1, 26, 15, "1");
    settingsWindow.fontTint = 0x76fcde;
    
    if (this.returnState != 'Settings') {
      // Note colors
      const noteOptions = [
        { value: 'NOTE', display: "NOTE" },
        { value: 'VIVID', display: "VIVID" },
        { value: 'FLAT', display: "FLAT" },
        { value: 'RAINBOW', display: "RAINBOW" }
      ];
      const currentNoteIndex = noteOptions.findIndex(opt => opt.value === Account.settings.noteColorOption);
      settingsWindow.addSettingItem(
        __("Note Colors||Colores de Notas"),
        noteOptions.map(opt => opt.display),
        currentNoteIndex,
        index => {
          Account.settings.noteColorOption = noteOptions[index].value;
          saveAccount();
        }
      );
  
      // Note speed
      settingsWindow.addSettingItem(
        __("Note Speed||Velocidad de Notas"),
        [
          __("Normal||Normal"),
          __("Double||Doble"),
          __("Triple||Triple"),
          __("Insane||Alucinante"),
          __("Sound Barrier||Barrera de Sonido"),
          __("Light Speed||Velocidad de la Luz"),
          __("Faster than light||Más Rápido que la Luz")
        ],
        Account.settings.noteSpeedMult - 1,
        index => {
          Account.settings.noteSpeedMult = index + 1;
          saveAccount();
        }
      );
      
      // Speed mod
      settingsWindow.addSettingItem(
        __("Speed Mod||Modo de Velocidad"),
        ["X-MOD", "C-MOD"],
        Account.settings.speedMod === 'C-MOD' ? 1 : 0,
        index => {
          Account.settings.speedMod = index === 1 ? 'C-MOD' : 'X-MOD';
          saveAccount();
        }
      );
    }
    
    // Asegurar que modifiers existe
    if (!this.modifiers) {
      this.modifiers = {
        NO_JUMPS: false,
        NO_HANDS: false,
        NO_FREEZES: false,
        NO_MINES: false,
        MIRRORED: false,
        RANDOMIZED: false
      };
    }
    
    Object.keys(this.modifiers).forEach(key => {
      const enabled = this.modifiers[key];
      
      // Traducir nombres de modificadores
      const modifierNames = {
        'NO_JUMPS': __("No Jumps||Sin Saltos"),
        'NO_HANDS': __("No Hands||Sin Manos"),
        'NO_FREEZES': __("No Freezes||Sin Holds"),
        'NO_MINES': __("No Mines||Sin Minas"),
        'MIRRORED': __("Mirrored||Espejo"),
        'RANDOMIZED': __("Randomized||Aleatorio")
      };
      
      settingsWindow.addSettingItem(
        modifierNames[key] || key.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        [__("ENABLED||ACTIVADO"), __("DISABLED||DESACTIVADO")],
        enabled ? 0 : 1,
        index => {
          this.modifiers[key] = index === 0;
        }
      );
    });
    
    settingsWindow.addItem(__("APPLY||APLICAR"), "", () => {
      this.windowManager.remove(settingsWindow, true);
      Account.settings.chartModifiers = this.modifiers;
      saveAccount();
      console.log("Saved modifiers:", Account.settings.chartModifiers);
      game.state.start(this.returnState, true, false, ...this.returnParams);
    }, true);
  }

  /**
   * Shows a modal confirmation dialog with the given message and buttons.
   * @param {string} message - Text to display inside the dialog
   * @param {Function} onConfirm - Callback invoked when the confirm button is chosen
   * @param {Function} onCancel - Callback invoked when the dialog is cancelled
   * @param {string} [confirmText] - Label for the confirm button
   * @param {string} [cancelText] - Label for the cancel button
   * @returns {DialogWindow} The created dialog
   */
  confirmDialog(message, onConfirm, onCancel, confirmText = __("Yes||Sí"), cancelText = __("No||No")) {
    const dialog = new DialogWindow(message, {
      buttons: [confirmText, cancelText]
    });
    
    dialog.onConfirm.add((buttonIndex) => {
      if (buttonIndex === 0) {
        onConfirm?.();
      } else {
        onCancel?.();
      }
      dialog.destroy();
    });
    
    dialog.onCancel.add(() => {
      onCancel?.();
      dialog.destroy();
    });
    
    return dialog;
  }
}