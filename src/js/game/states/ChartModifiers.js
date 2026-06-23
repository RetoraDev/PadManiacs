class ChartModifiers {
  init(returnState = "Settings", ...returnParams) {
    this.returnState = returnState;
    this.returnParams = returnParams;
  }
  
  create() {
    game.camera.fadeIn(0x000000);

    this.futuristicLines = new FuturisticLines();
    this.backgroundGradient = new BackgroundGradient();
    this.navigationHint = new NavigationHint("general");
    
    this.modifiers = Account.settings.chartModifiers || DEFAULT_ACCOUNT.settings.chartModifiers;
    
    this.windowManager = new WindowManager();
    
    gamepad.releaseAll();
    
    this.showMenu();
    
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  update() {
    gamepad.update();
    this.windowManager.update();
  }
  
  showMenu() {
    const settingsWindow = this.windowManager.createWindow(2, 1, 26, 15, "1");
    settingsWindow.fontTint = 0x76fcde;
    
    if (this.returnState != 'Settings') {
      // Note colors
      const noteOptions = [
        { value: 'NOTE', display: 'NOTE' },
        { value: 'VIVID', display: 'VIVID' },
        { value: 'FLAT', display: 'FLAT' },
        { value: 'RAINBOW', display: 'RAINBOW' }
      ];
      const currentNoteIndex = noteOptions.findIndex(opt => opt.value === Account.settings.noteColorOption);
      settingsWindow.addSettingItem(
        "Note Colors",
        noteOptions.map(opt => opt.display),
        currentNoteIndex,
        index => {
          Account.settings.noteColorOption = noteOptions[index].value;
          saveAccount();
        }
      );
  
      // Note speed
      settingsWindow.addSettingItem(
        "Note Speed",
        ["Normal", "Double", "Triple", "Insane", "Sound Barrier", "Light Speed", "Faster than light"],
        Account.settings.noteSpeedMult - 1,
        index => {
          Account.settings.noteSpeedMult = index + 1;
          saveAccount();
        }
      );
      
      // Speed mod
      settingsWindow.addSettingItem(
        "Speed Mod",
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
      
      settingsWindow.addSettingItem(
        key.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        ['ENABLED', 'DISABLED'],
        enabled ? 0 : 1,
        index => {
          this.modifiers[key] = index === 0;
        }
      );
    });
    
    settingsWindow.addItem("APPLY", "", () => {
      this.windowManager.remove(settingsWindow, true);
      Account.settings.chartModifiers = this.modifiers;
      saveAccount();
      console.log("Saved modifiers:", Account.settings.chartModifiers); // Debug
      game.state.start(this.returnState, true, false, ...this.returnParams);
    }, true);
  }

  confirmDialog(message, onConfirm, onCancel, confirmText = "Yes", cancelText = "No") {
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