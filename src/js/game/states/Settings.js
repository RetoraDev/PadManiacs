class Settings {
  create() {
    game.camera.fadeIn(0x000000);

    this.futuristicLines = new FuturisticLines();
    this.backgroundGradient = new BackgroundGradient();
    this.navigationHint = new NavigationHint('general');
    
    this.windowManager = new WindowManager();
    
    gamepad.releaseAll();
    
    this.showSettings();
    
    // File input element for loading backup files
    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  update() {
    gamepad.update();
    this.windowManager.update();
  }
  
  showSettings() {
    const settingsWindow = this.windowManager.createWindow(2, 1, 26, 15, "1");
    settingsWindow.fontTint = 0x76fcde;
    
    this.settingsWindow = settingsWindow;
    
    let restartNeeded = false;
    
    this.windowManager.focus(settingsWindow);
    
    // Music Voluem
    settingsWindow.addRangeItem(
      "Music Playback Volume",
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
    
    // Sfx Volume
    settingsWindow.addRangeItem(
      "Sound Effects Volume",
      0,
      100,
      1,
      Account.settings.sfxVolume,
      "%",
      value => {
        Account.settings.sfxVolume = value;
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
    
    // Visualizer 
    const visualizerOptions = ['NONE', 'BPM', 'ACCURACY', 'AUDIO'];
    const currentVisualizer = Account.settings.visualizer || 'NONE';
    const currentVisualizerIndex = visualizerOptions.indexOf(currentVisualizer);
    
    settingsWindow.addSettingItem(
      "Visualizer",
      visualizerOptions,
      currentVisualizerIndex,
      index => {
        const selectedVisualizer = visualizerOptions[index];
        Account.settings.visualizer = selectedVisualizer;
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
    
    settingsWindow.addSettingItem(
      "Enable Temperature (Experimental)",
      ["YES", "NO"], 
      Account.settings.enableTemperature ? 0 : 1,
      index => {
        Account.settings.enableTemperature = index === 0;
        saveAccount();
      }
    );
    
    // Background opacity
    settingsWindow.addRangeItem(
      "Song Background Opacity",
      0,
      100,
      1,
      Account.settings.backgroundOpacity * 100,
      "%",
      value => {
        Account.settings.backgroundOpacity = value / 100;
        saveAccount();
      }
    );
    
    // Song Info Intro
    settingsWindow.addSettingItem(
      "Display Song Info Intro",
      ["YES", "NO"],
      Account.settings.enableSongInfo ? 0 : 1,
      index => {
        Account.settings.enableSongInfo = index === 0;
        saveAccount();
      }
    );
    
    // Beat lines
    settingsWindow.addSettingItem(
      "Enable Beat Lines",
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
    
    // Chart Modifiers
    settingsWindow.addItem("Chart Modifiers", ">", () => this.showChartModifiersMenu());
    
    // Danger zone
    settingsWindow.addItem("Erase Highscores", "", () => this.confirmEraseHighscores());
    settingsWindow.addItem("Import Backup Data", "", () => this.importBackupData());
    settingsWindow.addItem("Export Backup Data", "", () => this.exportBackupData());
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
  
  async importBackupData() {
    this.fileInput.accept = "application/json";
  
    this.fileInput.onchange = async event => {
      const file = event.target.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const backupData = JSON.parse(e.target.result);
          
          this.windowManager.remove(this.settingsWindow, true);
      
          this.confirmDialog(
            `Backup version: ${backupData.version || '???'}\n` +
            `Backup date: ${backupData.exportDate ? new Date(backupData.exportDate).toDateString() : '???'}\n\n` +
            "Importing will overwrite your current account data including:\n" +
            "- High scores\n- Settings\n- Characters\n- Achievements\n- Statistics\n\n" +
            "This action cannot be undone!\n\nAre you sure you want to import this backup?",
            () => {
              // Merge backup with default structure to ensure all fields exist
              const mergedAccount = {
                ...DEFAULT_ACCOUNT,
                ...backupData,
                settings: { ...DEFAULT_ACCOUNT.settings, ...backupData.settings },
                characters: { ...DEFAULT_ACCOUNT.characters, ...backupData.characters },
                stats: { ...DEFAULT_ACCOUNT.stats, ...backupData.stats },
                achievements: { ...DEFAULT_ACCOUNT.achievements, ...backupData.achievements },
                mapping: { ...DEFAULT_ACCOUNT.mapping, ...backupData.mapping }
              };
              
              // Update global Account object
              Object.assign(Account, mergedAccount);
              saveAccount();
              
              notifications.show("Backup imported successfully!", 2000, "success");
              
              // Reload to apply all changes
              setTimeout(() => {
                this.confirmDialog(
                  "Import complete. Restart the game to ensure all data is properly loaded?",
                  () => location.reload(),
                  () => this.showSettings(),
                  "Restart Now",
                  "Later"
                );
              }, 500);
            },
            () => {
              this.showSettings();
            },
            "IMPORT",
            "CANCEL"
          );
        } catch (error) {
          console.error("Failed to parse backup file:", error);
          notifications.show("Invalid backup file!", 2000, "error");
          this.showSettings();
        }
      };
      
      reader.readAsText(file);
      this.fileInput.value = "";
    };
  
    this.fileInput.click();
  }
  
  async exportBackupData() {
    // Create a backup object with all account data
    const backupData = {
      version: VERSION,
      exportDate: new Date().toISOString(),
      settings: Account.settings,
      characters: Account.characters,
      lastSong: Account.lastSong,
      songSelectStartingIndex: Account.songSelectStartingIndex,
      highScores: Account.highScores,
      stats: Account.stats,
      achievements: Account.achievements,
      mapping: Account.mapping
    };
    
    const backupJson = JSON.stringify(backupData, null, 2);
    const blob = new Blob([backupJson], { type: "application/json" });
    const filename = `PadManiacs_Backup_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
    
    if (CURRENT_ENVIRONMENT === ENVIRONMENT.WEB) {
      // Download in browser
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notifications.show("Backup exported successfully!", 2000, "success");
      this.showSettings();
    } else if (CURRENT_ENVIRONMENT === ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT === ENVIRONMENT.NWJS) {
      // Save to filesystem
      try {
        const fileSystem = new FileSystemTools();
        const outputDir = await fileSystem.getDirectory(EXTERNAL_DIRECTORY + BACKUPS_DIRECTORY);
        await fileSystem.saveFile(outputDir, blob, filename);
        notifications.show(`Backup saved to ${filename}`, 2000, "success");
        this.showSettings();
      } catch (error) {
        console.error("Failed to save backup:", error);
        notifications.show("Failed to save backup!", 2000, "error");
        this.showSettings();
      }
    }
  }
  
  showMainMenu() {
    game.state.start("MainMenu");
  }
  
  showKeybindingsMenu() {
    game.state.start("Keybindings");
  }
  
  showChartModifiersMenu() {
    game.state.start("ChartModifiers", true, false, "MainMenu");
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
    this.windowManager.remove(this.settingsWindow, true);
    
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