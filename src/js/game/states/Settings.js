class Settings {
  create() {
    game.camera.fadeIn(0x000000);

    this.futuristicLines = new FuturisticLines();
    this.backgroundGradient = new BackgroundGradient();
    this.navigationHint = new NavigationHint(0);
    
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
    
    this.windowManager.focus(settingsWindow);
    
    // Volume setting
    settingsWindow.addSettingItem(
      "Volume",
      ["0%", "25%", "50%", "75%", "100%"], 
      Account.settings.volume,
      index => {
        Account.settings.volume = index;
        saveAccount();
        backgroundMusic.audio.volume = [0,25,50,75,100][index] / 100;
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
    
    // Visualizer setting
    const visualizerOptions = ['NONE', 'BPM', 'ACCURACY', 'AUDIO'];
    const currentVisualizerIndex = visualizerOptions.indexOf(Account.settings.visualizer || 'NONE');
    settingsWindow.addSettingItem(
      "Visualizer",
      visualizerOptions,
      currentVisualizerIndex,
      index => {
        Account.settings.visualizer = visualizerOptions[index];
        saveAccount();
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
    
    // Global offset
    const offsetOptions = [];
    for (let ms = -1000; ms <= 1000; ms += 25) {
      offsetOptions.push(`${ms}ms`);
    }
    const currentOffsetIndex = (Account.settings.userOffset + 1000) / 25;
    settingsWindow.addSettingItem(
      "Global Offset",
      offsetOptions,
      currentOffsetIndex,
      index => {
        Account.settings.userOffset = (index * 25) - 1000;
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
    let restartNeeded = false;
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