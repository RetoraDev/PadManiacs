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