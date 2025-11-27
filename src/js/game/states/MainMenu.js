class MainMenu {
  create() {
    game.camera.fadeIn(0xffffff);
    
    this.futuristicLines = new FuturisticLines();
    this.backgroundGradient = new BackgroundGradient();
    this.navigationHint = new NavigationHint(0);
    
    this.menu();
    
    this.previewCanvas = document.createElement("canvas");
    this.previewCtx = this.previewCanvas.getContext("2d");
    this.previewImg = new Image();
    
    // Only start music if it's not already playing from Title
    if (!backgroundMusic || !backgroundMusic.isPlaying) {
      if (!backgroundMusic) {
        backgroundMusic = new BackgroundMusic();
      }
      backgroundMusic.playLastSong();
    }
    
    // Dispose background music when player leaves 
    this.keepBackgroundMusic = false;
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  menu() {
    const manager = new WindowManager();
    this.manager = manager;
    
    this.showHomeMenu();
  }

  showHomeMenu() {
    const carousel = new CarouselMenu(0, 112 / 2 - 16, 112, 112 / 2, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    carousel.addItem("Rhythm Game", () => this.startGame());
    carousel.addItem("Character Select", () => {
      this.keepBackgroundMusic = true;
      game.state.start("CharacterSelect");
    });
    carousel.addItem("Settings", () => this.showSettings());
    carousel.addItem("Extras", () => this.showExtras());
    
    game.onMenuIn.dispatch('home', carousel);
    
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      carousel.addItem("Exit", () => this.confirmExit());
      carousel.onCancel.add(() => this.confirmExit());
    }
  }

  startGame() {
    const carousel = new CarouselMenu(0, 112 / 2 - 16, 112, 112 / 2, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    carousel.addItem("Free Play", () => this.freePlay());
    carousel.addItem("Extra Songs", () => this.showExtraSongs());
    game.onMenuIn.dispatch('startGame', carousel);
    carousel.addItem("< Back", () => this.showHomeMenu());
    carousel.onCancel.add(() => this.showHomeMenu());
  }

  showExtraSongs() {
    const carousel = new CarouselMenu(0, 112 / 2 - 16, 112, 112 / 2, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      carousel.addItem("User Songs", () => this.loadExternalSongs());
    }
    carousel.addItem("Load Single Song", () => this.loadSingleSong());
    
    if (window.externalSongs && (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS)) {
      carousel.addItem("Reload User Songs", () => {
        backgroundMusic.refreshCache();
        window.externalSongs = undefined;
        this.loadExternalSongs();
      });
    }
    
    game.onMenuIn.dispatch('extraSongs', carousel);
    carousel.addItem("< Back", () => this.startGame());
    carousel.onCancel.add(() => this.startGame());
  }

  showSettings() {
    const settingsWindow = this.manager.createWindow(3, 1, 18, 12, "1");
    settingsWindow.fontTint = 0x76fcde;
    
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
    
    // Dangerous actions
    settingsWindow.addItem("Erase Highscores", "", () => this.confirmEraseHighscores());
    settingsWindow.addItem("Restore Default Settings", "", () => this.confirmRestoreDefaults());
    
    game.onMenuIn.dispatch('settings', settingsWindow);
    
    settingsWindow.addItem("APPLY", "", () => {
      this.manager.remove(settingsWindow, true);
      if (restartNeeded) {
        this.confirmRestart();
      } else {
        this.showHomeMenu();
      }
    }, true);
  }

  showExtras() {
    const carousel = new CarouselMenu(0, 112 / 2 - 16, 112, 112 / 2, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      carousel.addItem("Addon Manager", () => this.showAddonManager());
    }
    carousel.addItem("Offset Assistant", () => this.startOffsetAssistant());
    carousel.addItem("Jukebox", () => this.startJukebox());
    carousel.addItem("Player Stats", () => this.showStats());
    carousel.addItem("Achievements", () => this.showAchievements());
    carousel.addItem("Credits", () => this.showCredits());
    carousel.addItem("Feedback", () => this.showFeedback());
    
    game.onMenuIn.dispatch('extras', carousel);
    carousel.addItem("< Back", () => this.showHomeMenu());
    carousel.onCancel.add(() => this.showHomeMenu());
  }

  showFeedback() {
    const carousel = new CarouselMenu(0, 112 / 2 - 16, 112, 112 / 2, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    const openLink = url => {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.click();
      this.showFeedback();
    };
    
    carousel.addItem("Leave A Review", () => openLink(FEEDBACK_REVIEW_URL));
    carousel.addItem("Feature Request", () => openLink(FEEDBACK_FEATURE_REQUEST_URL));
    carousel.addItem("Bug Report", () => openLink(FEEDBACK_BUG_REPORT_URL));
    
    game.onMenuIn.dispatch('feedback', carousel);
    carousel.addItem("< Back", () => this.showExtras());
    carousel.onCancel.add(() => this.showExtras());
  }
  
  showAddonManager() {
    // Clear existing UI
    this.manager?.removeAll();
    
    // Create addon manager interface
    this.createAddonManagerInterface();
  }

  createAddonManagerInterface() {
    const manager = new WindowManager();
    this.manager = manager;

    // Title
    const titleText = new Text(game.width / 2, 8, "ADDON MANAGER", {
      ...FONTS.shaded,
      tint: 0x76fcde
    });
    titleText.anchor.x = 0.5;

    // Addon list on left
    this.addonList = new CarouselMenu(2, 4, 12, 10, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });

    // Details panel on right
    this.detailsPanel = this.createDetailsPanel();
    
    // Preview area
    this.previewArea = this.createPreviewArea();

    // Load addons
    this.loadAddonList();

    // Set up navigation
    this.setupAddonManagerNavigation();
  }

  createDetailsPanel() {
    const panel = game.add.group();
    panel.x = 104;
    panel.y = 16;

    // Background
    const bg = new Window(0, 0, 10, 10, "1", panel);
    bg.focus = false;

    // Details text
    this.detailsText = new Text(8, 8, "Select an addon to view details", {
      ...FONTS.default,
      tint: 0x76fcde
    });
    bg.addChild(this.detailsText);

    return panel;
  }

  createPreviewArea() {
    const preview = game.add.sprite(140, 80);
    preview.scale.set(2);
    
    // Preview canvas for addon icons
    this.previewCanvas = document.createElement("canvas");
    this.previewCanvas.width = 25;
    this.previewCanvas.height = 25;
    this.previewCtx = this.previewCanvas.getContext("2d");
    this.previewImg = new Image();
    
    return preview;
  }

  loadAddonList() {
    const addons = addonManager.getAddonList();
    this.addonList.clear();

    if (addons.length === 0) {
      this.addonList.addItem("No addons installed", () => {});
      this.updateAddonDetails(null);
      return;
    }

    addons.forEach((addon, index) => {
      const statusColor = this.getAddonStatusColor(addon);
      this.addonList.addItem(
        addon.name,
        () => this.showAddonActions(addon),
        { addon, bgcolor: statusColor }
      );
    });

    // Select first addon by default
    if (addons.length > 0) {
      this.addonList.selectedIndex = 0;
      this.selectAddon(addons[0]);
    }

    this.addonList.onSelect.add((index, item) => {
      if (item.data && item.data.addon) {
        this.selectAddon(item.data.addon);
      }
    });
  }

  getAddonStatusColor(addon) {
    if (addon.isHibernating) return "gray";
    return addon.isEnabled ? "#00cc00" : "brown";
  }

  selectAddon(addon) {
    this.selectedAddon = addon;
    this.updateAddonDetails(addon);
    this.updateAddonPreview(addon);
  }

  updateAddonDetails(addon) {
    if (!addon) {
      this.detailsText.write("Select an addon to view details");
      return;
    }

    const details = [
      `Name: ${addon.name}`,
      `Version: ${addon.version}`,
      `Author: ${addon.author}`,
      `Behaviors: ${addon.behaviors ? Object.keys(addon.behaviors).length : 0}`,
      `Assets: ${addon.assets ? addon.assets.length : 0}`,
      ``,
      `${addon.description}`,
      ``,
      `Status: ${this.getAddonStatusText(addon)}`
    ].join('\n');

    this.detailsText.write(details).wrap(80);
  }

  getAddonStatusText(addon) {
    if (addon.isHibernating) return 'HIBERNATING';
    return addon.isEnabled ? 'ENABLED' : 'DISABLED';
  }

  updateAddonPreview(addon) {
    if (addon.icon) {
      this.previewImg.onload = () => {
        this.previewCtx.clearRect(0, 0, 25, 25);
        this.previewCtx.drawImage(this.previewImg, 0, 0, 25, 25);
        this.previewArea.loadTexture(PIXI.Texture.fromCanvas(this.previewCanvas));
      };
      this.previewImg.src = addon.icon;
    } else {
      this.previewArea.loadTexture(null);
    }
  }

  showAddonActions(addon) {
    const actionsWindow = this.manager.createWindow(6, 4, 12, 8, "1");
    actionsWindow.fontTint = 0x76fcde;

    if (addon.isHibernating) {
      actionsWindow.addItem("Wake Addon", "", () => {
        this.performAddonAction(() => addonManager.wakeAddon(addon.id));
      });
    } else if (addon.isEnabled) {
      actionsWindow.addItem("Disable Addon", "", () => {
        this.performAddonAction(() => addonManager.disableAddon(addon.id));
      });
      actionsWindow.addItem("Hibernate Addon", "", () => {
        this.performAddonAction(() => addonManager.hibernateAddon(addon.id));
      });
    } else {
      actionsWindow.addItem("Enable Addon", "", () => {
        this.performAddonAction(() => addonManager.enableAddon(addon.id));
      });
    }

    actionsWindow.addItem("Uninstall Addon", "", () => {
      this.confirmUninstallAddon(addon);
    });

    actionsWindow.addItem("< Back", "", () => {
      this.manager.remove(actionsWindow, true);
    }, true);

    actionsWindow.onCancel.add(() => {
      this.manager.remove(actionsWindow, true);
    });
  }

  performAddonAction(action) {
    action();
    this.refreshAddonManager();
    
    // Show feedback
    notifications.show("Addon updated successfully!");
  }

  confirmUninstallAddon(addon) {
    this.confirmDialog(
      `Uninstall "${addon.name}"?\n\nThe addon folder will be permanently removed. This action cannot be undone.`,
      () => {
        addonManager.uninstallAddon(addon.id);
        this.refreshAddonManager();
        notifications.show("Addon uninstalled!");
      },
      () => this.showAddonActions(addon),
      "Uninstall",
      "Cancel"
    );
  }

  refreshAddonManager() {
    this.loadAddonList();
    if (this.selectedAddon) {
      // Update selected addon if it still exists
      const addons = addonManager.getAddonList();
      const updatedAddon = addons.find(a => a.id === this.selectedAddon.id);
      if (updatedAddon) {
        this.selectAddon(updatedAddon);
      } else {
        this.selectAddon(null);
      }
    }
  }

  setupAddonManagerNavigation() {
    // Back button
    const backCarousel = new CarouselMenu(2, 15, 12, 2, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });

    backCarousel.addItem("< Back to Menu", () => this.returnToMainMenu());
    backCarousel.addItem("Apply Changes", () => this.applyAddonChanges());

    backCarousel.onCancel.add(() => this.returnToMainMenu());
  }

  returnToMainMenu() {
    if (addonManager.needsReload()) {
      this.confirmAddonRestart();
    } else {
      this.cleanupAddonManager();
      this.showHomeMenu();
    }
  }

  applyAddonChanges() {
    if (addonManager.needsReload()) {
      this.confirmAddonRestart();
    } else {
      notifications.show("No changes requiring restart detected.");
    }
  }

  confirmAddonRestart() {
    this.confirmDialog(
      "Some addon changes require a restart to take effect.\n\nRestart the game now?",
      () => {
        location.reload();
      },
      () => {
        // Continue without restart
        this.cleanupAddonManager();
        this.showHomeMenu();
      },
      "Restart Now",
      "Continue"
    );
  }

  cleanupAddonManager() {
    // Clean up resources
    if (this.previewArea) {
      this.previewArea.destroy();
    }
    if (this.detailsPanel) {
      this.detailsPanel.destroy();
    }
    if (this.addonList) {
      this.addonList.destroy();
    }
    this.manager?.removeAll();
  }

  confirmDialog(message, onConfirm, onCancel, confirmText = "Yes", cancelText = "No") {
    const dialog = new DialogWindow(message, {
      buttons: [confirmText, cancelText],
      defaultButton: 1 // Default to "No" for safety
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

  confirmExit() {
    this.confirmDialog(
      "Are you sure you want to exit the game?",
      () => {
        switch (CURRENT_ENVIRONMENT) {
          case ENVIRONMENT.CORDOVA:
            navigator.app.exitApp();
            break;
          case ENVIRONMENT.NWJS:
            nw?.App?.quit?.();
            break;
        }
      },
      () => this.showHomeMenu(),
      "Exit",
      "Cancel"
    );
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
      () => this.showHomeMenu(),
      "Restart",
      "Later"
    );
  }

  freePlay() {
    game.state.start("SongSelect", true, false, window.localSongs);
  }

  startOffsetAssistant() {
    const offsetAssistant = new OffsetAssistant(game);
    game.add.existing(offsetAssistant);
  }

  loadExternalSongs() {
    game.state.start("LoadExternalSongs");
  }

  loadSingleSong() {
    game.state.start("LoadSongFolder");
  }

  startJukebox() {
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      if (!window.externalSongs) {
        this.confirmDialog(
          "Load extra songs from external storage?",
          () => {
            game.state.start("LoadExternalSongs", true, false, "Jukebox", [undefined, undefined]);
          },
          () => {
            game.state.start("Jukebox");
          },
          "Load Songs",
          "Skip"
        );
      } else {
        game.state.start("Jukebox");
      }
    } else {
      game.state.start("Jukebox");
    }
  }

  showAchievements() {
    game.state.start("AchievementsMenu");
  }

  showStats() {
    game.state.start("StatsMenu");
  }

  showCredits() {
    game.state.start("Credits", true, false, "MainMenu");
  }

  update() {
    gamepad.update();
    this.manager?.update();
  }

  shutdown() {
    if (backgroundMusic && !this.keepBackgroundMusic) {
      backgroundMusic.destroy();
      backgroundMusic = null;
    }
  }
}
