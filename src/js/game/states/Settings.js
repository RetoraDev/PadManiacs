class Settings {
  create() {
    game.camera.fadeIn(0x000000);

    this.futuristicLines = new FuturisticLines();
    this.backgroundGradient = new BackgroundGradient();
    this.navigationHint = new NavigationHint('general');
    
    this.windowManager = new WindowManager();
    
    gamepad.releaseAll();
    
    this.showSettings();
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  update() {
    gamepad.update();
    this.windowManager.update();
  }
  
  showSettings() {
    const settingsWindow = this.windowManager.createWindow(3, 1, 18, 12, "1");
    settingsWindow.fontTint = 0x76fcde;
    
    let restartNeeded = false;
    
    this.windowManager.focus(settingsWindow);
    
    // Volume setting
    settingsWindow.addRangeItem(
      "Volume",
      0,
      100,
      1,
      Account.settings.volume,
      "%",
      value => {
        Account.settings.volume = value;
        saveAccount();
        if (backgroundMusic && backgroundMusic.audio) {
          backgroundMusic.audio.volume = value / 100;
        }
      }
    );

    // Auto-play setting
    settingsWindow.addSettingItem(
      "Auto-play",
      ["OFF", "ON"], 
      Account.settings.autoplay ? 1 : 0,
      index => {
        Account.settings.autoplay = index === 1;
        saveAccount();
      }
    );
    
    // Metronome setting
    const metronomeOptions = ['OFF', 'Note', 'Quarters', 'Eighths', 'Sixteenths', 'Thirty-seconds'];
    const currentMetronomeIndex = metronomeOptions.indexOf(Account.settings.metronome || 'OFF');
    settingsWindow.addSettingItem(
      "Metronome",
      metronomeOptions,
      currentMetronomeIndex,
      index => {
        Account.settings.metronome = metronomeOptions[index];
        saveAccount();
      }
    );
    
    // Mouse 
    settingsWindow.addSettingItem(
      "Enable Mouse",
      ["YES", "NO"],
      Account.settings.enableMouse ? 0 : 1,
      index => {
        Account.settings.enableMouse = index === 0;
        saveAccount();
        restartNeeded = true;
      }
    );
    
    // Touch 
    settingsWindow.addSettingItem(
      "Enable Touch",
      ["YES", "NO"],
      Account.settings.enableTouch ? 0 : 1,
      index => {
        Account.settings.enableTouch = index === 0;
        saveAccount();
        restartNeeded = true;
      }
    );
    
    // Scroll direction
    settingsWindow.addSettingItem(
      "Scroll Direction",
      ["FALLING", "RISING"],
      Account.settings.scrollDirection === 'falling' ? 0 : 1,
      index => {
        Account.settings.scrollDirection = index === 0 ? 'falling' : 'rising';
        saveAccount();
      }
    );
    
    // Button Style
    settingsWindow.addSettingItem(
      "Button Style",
      ["X-BOX", "PLAYSTATION"],
      (Account.settings.buttonStyle || 'xbox') === 'xbox' ? 0 : 1,
      index => {
        Account.settings.buttonStyle = index === 0 ? 'xbox' : 'ps';
        saveAccount();
        
        if (window.currentNavigationHint) {
          window.currentNavigationHint.setButtonStyle(Account.settings.buttonStyle);
        }
      }
    );
    
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
    
    // Haptic feedback
    settingsWindow.addSettingItem(
      "Haptic Feedback",
      ["OFF", "ON"], 
      Account.settings.hapticFeedback ? 1 : 0,
      index => {
        Account.settings.hapticFeedback = index === 1;
        saveAccount();
      }
    );
    
    // Beat lines
    settingsWindow.addSettingItem(
      "Beat Lines",
      ["YES", "NO"],
      Account.settings.beatLines ? 0 : 1,
      index => {
        Account.settings.beatLines = index === 0;
        saveAccount();
      }
    );
    
    // Chart background
    settingsWindow.addSettingItem(
      "Enable Chart Background",
      ["YES", "NO"],
      Account.settings.enableChartBackground ? 0 : 1,
      index => {
        Account.settings.enableChartBackground = index === 0;
        saveAccount();
      }
    );
    
    // Chart Background opacity
    settingsWindow.addRangeItem(
      "Chart Background Opacity",
      0,
      100,
      1,
      (Account.settings.chartBackgroundOpacity || 0.3) * 100,
      "%",
      value => {
        Account.settings.chartBackgroundOpacity = value / 100;
        saveAccount();
      }
    );
    
    // Video FPS
    settingsWindow.addSettingItem(
      "Video FPS",
      ["60 FPS", "30 FPS", "15 FPS"],
      (Account.settings.videoFPS || 1) - 1,
      index => {
        Account.settings.videoFPS = index + 1;
        saveAccount();
      }
    );
    
    // Global offset
    settingsWindow.addRangeItem(
      "Global Offset",
      -2000,
      2000,
      1,
      Account.settings.userOffset,
      "ms",
      value => {
        Account.settings.userOffset = value;
        saveAccount();
      }
    );
    
    // Menu music
    let menuMusicIndex = 0;
    if (Account.settings.enableMenuMusic) {
      menuMusicIndex = Account.settings.randomSong ? 1 : 0;
    } else {
      menuMusicIndex = 2;
    }
    settingsWindow.addSettingItem(
      "Menu Music",
      ["LAST SONG", "RANDOM SONG", "OFF"],
      menuMusicIndex,
      index => {
        switch (index) {
          case 0:
            Account.settings.randomSong = false;
            Account.settings.enableMenuMusic = true;
            break;
          case 1:
            Account.settings.randomSong = true;
            Account.settings.enableMenuMusic = true;
            break;
          case 2:
            Account.settings.enableMenuMusic = false;
            break;
        }
        saveAccount();
      }
    );
    
    // Renderer
    settingsWindow.addSettingItem(
      "Renderer",
      ["AUTO", "CANVAS", "WEBGL"],
      Account.settings.renderer,
      index => {
        Account.settings.renderer = index;
        saveAccount();
        restartNeeded = true;
      }
    );
    
    // Pixelated
    settingsWindow.addSettingItem(
      "Pixelated",
      ["YES", "NO"],
      Account.settings.pixelated ? 0 : 1,
      index => {
        Account.settings.pixelated = index == 0;
        restartNeeded = true;
        saveAccount();
      }
    );
    
    // Safe Mode
    settingsWindow.addSettingItem(
      "Safe Mode",
      ["ENABLED", "DISABLED"],
      Account.settings.safeMode ? 0 : 1,
      index => {
        restartNeeded = true;
        const enabled = index == 0;
        addonManager?.setSafeMode(enabled);
        saveAccount();
      }
    );
    
    // Configure keybindings
    settingsWindow.addItem("Configure keybindings", ">", () => {
      this.showKeybindingsMenu()
    });
    
    // Danger zone
    settingsWindow.addItem("Erase Highscores", "", () => this.confirmEraseHighscores());
    settingsWindow.addItem("Restore Default Settings", "", () => this.confirmRestoreDefaults());
    
    game.onMenuIn.dispatch('settings', settingsWindow);
    
    settingsWindow.addItem("APPLY", "", () => {
      this.windowManager.remove(settingsWindow, true);
      if (restartNeeded) {
        this.confirmRestart();
      } else {
        this.showMainMenu();
      }
    }, true);
  }
  
  showMainMenu() {
    game.state.start("MainMenu");
  }
  
  showKeybindingsMenu() {
    game.state.start("Keybindings");
  }

  confirmDialog(message, onConfirm, onCancel, confirmText = "Yes", cancelText = "No") {
    const dialog = new DialogWindow(message, {
      buttons: [confirmText, cancelText]
    });
    
    dialog.onConfirm.add((buttonIndex, buttonText) => {
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

  confirmEraseHighscores() {
    this.confirmDialog(
      "This will permanently erase all your high scores.\nThis action cannot be undone!\n\nAre you sure?",
      () => {
        Account.highScores = {};
        saveAccount();
        notifications.show("High scores erased!");
        this.showSettings();
      },
      () => this.showSettings(),
      "Erase",
      "Cancel"
    );
  }

  confirmRestoreDefaults() {
    this.confirmDialog(
      "All settings will be restored to their default values.\nThe game will need to restart.\n\nContinue?",
      () => {
        Account.settings = DEFAULT_ACCOUNT.settings;
        saveAccount();
        window.location.reload();
      },
      () => this.showSettings(),
      "Restore",
      "Cancel"
    );
  }

  confirmRestart() {
    this.confirmDialog(
      "Settings changed require a restart to take effect.\nRestart now?",
      () => location.reload(),
      () => this.showMainMenu(),
      "Restart",
      "Later"
    );
  }
}