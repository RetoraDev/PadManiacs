class MainMenu {
  create() {
    game.camera.fadeIn(0xffffff);
    
    this.futuristicLines = new FuturisticLines();
    this.backgroundGradient = new BackgroundGradient();
    this.navigationHint = new NavigationHint(0);
    
    // Check for feedback dialogs before showing menu
    this.checkInitialDialogs();
    
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
  
  checkInitialDialogs() {
    // Check for bug report first (highest priority)
    if (!window.DEBUG && Account.stats.lastCrashed) {
      this.showBugReportDialog();
      return;
    }

    // Check for rating dialog
    if (!Account.stats.gameRated && Account.stats.totalTimePlayed >= RATING_PROMPT_MIN_PLAYTIME) {
      this.showRatingDialog();
      return;
    }

    // Check for feature request dialog
    if (!Account.stats.featureRequestPrompted && Account.stats.totalTimePlayed >= FEATURE_REQUEST_MIN_PLAYTIME) {
      this.showFeatureRequestDialog();
      return;
    }
    
    // Check for community dialog
    if (!Account.stats.wentToCommunity && Account.stats.totalTimePlayed >= COMMUNITY_PROMPT_MIN_PLAYTIME) {
      this.showCommunityDialog();
      return;
    }

    // No dialogs to show, proceed with normal menu
    this.menu();
  }

  showBugReportDialog() {
    this.confirmDialog(
      "Seems like the game crashed last time.\n" +
      "Sorry about that!!\n\n" +
      "As a solo developer, crash reports are super helpful for fixing issues.\n\n" +
      "Could you quickly report what you were doing when it crashed?\n",
      () => {
        // Open bug report page
        openExternalUrl(FEEDBACK_BUG_REPORT_URL);
        
        // Clear the flag and show menu
        Account.stats.lastCrashed = false;
        Account.stats.submittedBugReport = true;
        saveAccount();
        this.menu();
        
        // Force check achievements
        achievementsManager.checkAchievements();
      },
      () => {
        // User chose "Maybe Later" - just clear flag and show menu
        Account.stats.lastCrashed = false;
        saveAccount();
        this.menu();
      },
      "Report Bug",
      "Maybe Later"
    );
  }

  showRatingDialog() {
    this.confirmDialog(
      "Hey! You've been playing a while!\n\n" +
      "Do you like the game? Ratings really help keep me motivated.\n\n" +
      "Would you mind leaving a quick rating?\n",
      () => {
        // Rate Now
        openExternalUrl(FEEDBACK_REVIEW_URL);
        
        Account.stats.gameRated = true;
        saveAccount();
        this.menu();

        // Force check achievements
        achievementsManager.checkAchievements();        
      },
      () => {
        // No Thanks
        this.menu();
      },
      "Rate Now", 
      "No Thanks"
    );
  }

  showFeatureRequestDialog() {
    this.confirmDialog(
      "Thanks for playing!\n\n" +
      "I'm a solo developer, so hearing your ideas directly is incredibly valuable.\n\n" +
      "Got any feature requests or suggestions?\n" +
      "What would you like to see in the game?\n",
      () => {
        // Share ideas
        openExternalUrl(FEEDBACK_FEATURE_REQUEST_URL);
        
        Account.stats.featureRequestPrompted = true;
        saveAccount();
        this.menu();
        
        // Force check achievements
        achievementsManager.checkAchievements();
      },
      () => {
        // Not Now - ask again after more playtime
        Account.stats.totalTimePlayed = FEATURE_REQUEST_MIN_PLAYTIME - (30 * 60); // Ask again in 30 min
        saveAccount();
        this.menu();
      },
      "Share Ideas",
      "Not Now"
    );
  }
  
  showCommunityDialog() {
    this.confirmDialog(
      "Enjoying the game?\n" +
      "Join the community to download more charts, and share your creations and high scores with other players!\n",
      () => {
        // Join
        openExternalUrl(COMMUNITY_HOMEPAGE_URL);
        
        Account.stats.wentToCommunity = true;
        saveAccount();
        this.menu();
        
        // Force check achievements
        achievementsManager.checkAchievements();
      },
      () => {
        // No Thanks
        this.menu();
      },
      "Join", 
      "No Thanks"
    );
  }

  menu() {
    this.windowManager = new WindowManager();
    
    this.showHomeMenu();
  }

  showHomeMenu() {
    const carousel = new CarouselMenu(0, 112 / 2 - 16, 112,   64, {
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
    carousel.addItem("Chart Editor", () => this.openEditor());
    carousel.addItem("Settings", () => this.showSettings());
    carousel.addItem("Extras", () => this.showExtras());
    
    game.onMenuIn.dispatch('home', carousel);
    
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      carousel.addItem("Exit", () => this.confirmExit());
      carousel.onCancel.add(() => this.confirmExit());
    }
  }

  startGame() {
    const carousel = new CarouselMenu(0, 112 / 2 - 16, 112,   64, {
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
    const carousel = new CarouselMenu(0, 112 / 2 - 16, 112,   64, {
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
      this.windowManager.remove(settingsWindow, true);
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
        this.showHomeMenu();
      }
    }, true);
  }

  showExtras() {
    const carousel = new CarouselMenu(0, 112 / 2 - 16, 112,   64, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      carousel.addItem("Addon Manager", () => this.showAddonManager());
    }
    carousel.addItem("Jukebox", () => this.startJukebox());
    carousel.addItem("Offset Assistant", () => this.startOffsetAssistant());
    carousel.addItem("Achievements", () => this.showAchievements());
    carousel.addItem("Player Stats", () => this.showStats());
    carousel.addItem("Feedback", () => this.showFeedback());
    carousel.addItem("Comunity", () => this.showCommunity());
    carousel.addItem("Credits", () => this.showCredits());
    
    game.onMenuIn.dispatch('extras', carousel);
    carousel.addItem("< Back", () => this.showHomeMenu());
    carousel.onCancel.add(() => this.showHomeMenu());
  }

  showFeedback() {
    const carousel = new CarouselMenu(0, 112 / 2 - 16, 112,   64, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    const openLink = url => {
      openExternalUrl(url);
      this.showFeedback();
    };
    
    carousel.addItem("Leave A Review", () => openLink(FEEDBACK_REVIEW_URL));
    carousel.addItem("Feature Request", () => openLink(FEEDBACK_FEATURE_REQUEST_URL));
    carousel.addItem("Bug Report", () => openLink(FEEDBACK_BUG_REPORT_URL));
    
    game.onMenuIn.dispatch('feedback', carousel);
    carousel.addItem("< Back", () => this.showExtras());
    carousel.onCancel.add(() => this.showExtras());
  }
  
  showCommunity() {
    openExternalUrl(COMMUNITY_HOMEPAGE_URL);
    
    Account.stats.wentToCommunity = true;
    saveAccount();
    
    this.menu();
  }
  
  showAddonManager() {
    // TODO: Clean addon manager interface and logic 
    const detailText = new Text(4, 4, "");
    
    const preview = game.add.sprite(112, 4);
      
    const showInstalledAddons = () => {
      const addons = addonManager.getAddonList();
      const carousel = new CarouselMenu(192 / 2, 112 / 2, 192 / 2, 112 / 2, {
        align: 'left',
        bgcolor: 'brown',
        fgcolor: '#ffffff',
        animate: true,
        crop: false
      });
      
      if (addons.length === 0) {
        carousel.addItem("No addons installed", () => {});
      } else {
        addons.forEach(addon => {
          const statusColor = addon.isHibernating ? "gray" : (addon.isEnabled ? "#00cc00" : "brown")
          carousel.addItem(
            `${addon.name} v${addon.version}`,
            () => showAddonDetails(addon),
            { addon, bgcolor: statusColor }
          );
        });
        
        carousel.onSelect.add((index, item) => {
          if (item.data && item.data.addon) {
            previewAddon(item.data.addon);
          }
        });
        
        previewAddon(addons[0]);
      }
      
      game.onMenuIn.dispatch('addons', carousel);
      
      carousel.addItem("< Back", () => applyChanges());
      carousel.onCancel.add(() => applyChanges());
    };
    
    let needsReload = false;
    
    const previewAddon = (addon) => {
      detailText.write(
        `${addon.name}\n` +
        `V${addon.version}\n` +
        `By ${addon.author}\n` +
        `BEHAVIORS:${addon.behaviors ? Object.keys(addon.behaviors).length : 0}\n` +
        `ASSETS:${addon.assets ? addon.assets.length : 0}\n\n` +
        `${addon.description}\n` +
        'STATE: ' + 
        (addon.isHibernating ?
          'Hybernating'
          :
        (addon.isEnabled ?
          'Enabled' : 'Disabled')) + '\n'
      ).wrap(112);
      if (addon.icon) {
        this.previewImg.src = addon.icon;
        this.previewImg.onload = () => {
          this.previewCtx.drawImage(this.previewImg, 0, 0, 50, 50);
          preview.loadTexture(PIXI.Texture.fromCanvas(this.previewCanvas));
        };
      }
    }
    
    const showAddonDetails = (addon) => {
      const carousel = new CarouselMenu(192 / 2, 112 / 2, 192 / 2, 112 / 2, {
        align: 'left',
        bgcolor: '#9b59b6',
        fgcolor: '#ffffff',
        animate: true,
        crop: false
      });
      
      if (addon.isHibernating) {
        carousel.addItem("Wake Addon", () => {
          addonManager.wakeAddon(addon.id);
          needsReload = true;
          showInstalledAddons();
        });
      } else if (addon.isEnabled) {
        carousel.addItem("Disable Addon", () => {
          addonManager.disableAddon(addon.id);
          needsReload = true;
          showInstalledAddons();
        });
        carousel.addItem("Hibernate Addon", () => {
          addonManager.hibernateAddon(addon.id);
          needsReload = true;
          showInstalledAddons();
        });
      } else {
        carousel.addItem("Enable Addon", () => {
          addonManager.enableAddon(addon.id);
          needsReload = true;
          showInstalledAddons();
        });
      }
      
      carousel.addItem("Uninstall Addon", () => this.confirmDialog("The addon folder will be removed. Continue?", () => {
        addonManager.uninstallAddon(addon.id);
        needsReload = true;
        showInstalledAddons();
      }, () => showInstalledAddons()));
      
      game.onMenuIn.dispatch('addonDetails', carousel);
      
      carousel.addItem("< Back", () => showInstalledAddons());
      carousel.onCancel.add(() => showInstalledAddons());
    };
    
    const applyChanges = () => {
      if (needsReload || addonManager.needsReload()) {
        this.confirmDialog("Reload required. Restart now?", () => {
          location.reload();
        }, () => {
          preview.destroy();
          detailText.destroy();
          this.menu();
        });
      } else {
        preview.destroy();
        detailText.destroy();
        this.menu();
      }
    };
    
    showInstalledAddons();
  }
  
  showKeybindingsMenu() {
    const settingsWindow = this.windowManager.createWindow(3, 1, 18, 12, "1");
    settingsWindow.fontTint = 0x76fcde;
    
    this.windowManager.focus(settingsWindow);
    
    settingsWindow.addItem("KEYBOARD KEYS", ">", () => {
      this.windowManager.remove(settingsWindow, true);
      this.showKeyboardCustomization();
    });
    
    settingsWindow.addItem("GAMEPAD KEYS", ">", () => {
      this.windowManager.remove(settingsWindow, true);
      this.showGamepadCustomization();
    });
    
    settingsWindow.addItem("RESET TO DEFAULTS", "", () => {
      this.confirmDialog(
        "Reset all keybindings to default settings?",
        () => {
          Account.mapping.keyboard = JSON.parse(JSON.stringify(DEFAULT_KEYBOARD_MAPPING));
          Account.mapping.gamepad = JSON.parse(JSON.stringify(DEFAULT_GAMEPAD_MAPPING));
          saveAccount();
          gamepad.updateMapping(Account.mapping.keyboard, Account.mapping.gamepad);
          notifications.show("Keybindings reset!");
          this.showKeybindingsMenu();
        },
        () => {
          this.showKeybindingsMenu();
        },
        "RESET",
        "CANCEL"
      );
    });
    
    settingsWindow.addItem("< BACK", "", () => {
      this.windowManager.remove(settingsWindow, true);
      this.showSettings();
    }, true);
    
    game.onMenuIn.dispatch('keybindings', settingsWindow);
  }

  showKeyboardCustomization() {
    const keysWindow = this.windowManager.createWindow(3, 1, 18, 12, "1");
    keysWindow.fontTint = 0x76fcde;
    
    this.windowManager.focus(keysWindow);
    
    // Define keyboard controls
    const keyboardControls = [
      { key: "UP", description: "UP ARROW", mappingKey: "up", index: 0 },
      { key: "DOWN", description: "DOWN ARROW", mappingKey: "down", index: 0 },
      { key: "LEFT", description: "LEFT ARROW", mappingKey: "left", index: 0 },
      { key: "RIGHT", description: "RIGHT ARROW", mappingKey: "right", index: 0 },
      { key: "DANCE LEFT", description: "DANCE LEFT", mappingKey: "left", index: 1 },
      { key: "DANCE DOWN", description: "DANCE DOWN", mappingKey: "down", index: 1 },
      { key: "DANCE UP", description: "DANCE UP", mappingKey: "up", index: 1 },
      { key: "DANCE RIGHT", description: "DANCE RIGHT", mappingKey: "right", index: 1 },
      { key: "SECONDARY DANCE LEFT", description: "SECONDARY DANCE LEFT", mappingKey: "left", index: 2 },
      { key: "SECONDARY DANCE DOWN", description: "SECONDARY DANCE DOWN", mappingKey: "down", index: 2 },
      { key: "SECONDARY DANCE UP", description: "SECONDARY DANCE UP", mappingKey: "up", index: 2 },
      { key: "SECONDARY DANCE RIGHT", description: "SECONDARY DANCE RIGHT", mappingKey: "right", index: 2 },
      { key: "CONFIRM", description: "CONFIRM", mappingKey: "a", index: 0 },
      { key: "CANCEL", description: "CANCEL", mappingKey: "b", index: 0 },
      { key: "START", description: "START", mappingKey: "start", index: 0 },
      { key: "SELECT", description: "SELECT", mappingKey: "select", index: 0 }
    ];
    
    // Add each control item
    keyboardControls.forEach(control => {
      const currentKey = this.getKeyboardKeyDisplay(control.mappingKey, control.index);
      keysWindow.addItem(control.key, currentKey, () => {
        this.waitingForKey = {
          type: "keyboard",
          mappingKey: control.mappingKey,
          index: control.index,
          description: control.description
        };
        this.windowManager.remove(keysWindow, true);
        this.showKeyWaitOverlay(`PRESS KEY FOR: ${control.description}`);
      });
    });
    
    keysWindow.addItem("< BACK", "", () => {
      this.windowManager.remove(keysWindow, true);
      this.showKeybindingsMenu();
    }, true);
    
    game.onMenuIn.dispatch('keyboardCustomization', keysWindow);
  }

  showGamepadCustomization() {
    const gamepadWindow = this.windowManager.createWindow(3, 1, 18, 12, "1");
    gamepadWindow.fontTint = 0x76fcde;
    
    this.windowManager.focus(gamepadWindow);
    
    // Define gamepad controls
    const gamepadControls = [
      { key: "UP", description: "UP ARROW", mappingKey: "up" },
      { key: "DOWN", description: "DOWN ARROW", mappingKey: "down" },
      { key: "LEFT", description: "LEFT ARROW", mappingKey: "left" },
      { key: "RIGHT", description: "RIGHT ARROW", mappingKey: "right" },
      { key: "CONFIRM/RIGHT", description: "CONFIRM/RIGHT", mappingKey: "a" },
      { key: "CANCEL/DOWN", description: "CANCEL/DOWN", mappingKey: "b" },
      { key: "START", description: "START", mappingKey: "start" },
      { key: "SELECT", description: "SELECT", mappingKey: "select" }
    ];
    
    // Add each control item
    gamepadControls.forEach(control => {
      const currentButton = this.getGamepadButtonDisplay(control.mappingKey);
      gamepadWindow.addItem(control.key, currentButton, () => {
        this.waitingForKey = {
          type: "gamepad",
          mappingKey: control.mappingKey,
          description: control.description
        };
        this.windowManager.remove(gamepadWindow, true);
        this.showKeyWaitOverlay(`PRESS GAMEPAD BUTTON FOR: ${control.description}`);
      });
    });
    
    gamepadWindow.addItem("< BACK", "", () => {
      this.windowManager.remove(gamepadWindow, true);
      this.showKeybindingsMenu();
    }, true);
    
    game.onMenuIn.dispatch('gamepadCustomization', gamepadWindow);
  }

  showKeyWaitOverlay(message) {
    // Remove any existing overlay
    if (this.waitOverlay) {
      this.waitOverlay.destroy();
    }
    
    // Create semi-transparent overlay
    const overlay = game.add.graphics(0, 0);
    overlay.beginFill(0x000000, 0.7);
    overlay.drawRect(0, 0, 192, 112);
    overlay.endFill();
    
    // Create instruction text
    const instructionText = new Text(96, 40, message);
    instructionText.anchor.set(0.5, 0.5);
    instructionText.fontSize = 2;
    
    // Create cancel text
    const cancelText = new Text(96, 80, "PRESS ESC TO CANCEL");
    cancelText.anchor.set(0.5, 0.5);
    cancelText.fontSize = 2;
    
    // Create timeout bar
    const timeoutBar = game.add.graphics(0, 0);
    
    // Store reference
    this.waitOverlay = {
      graphics: overlay,
      instructionText: instructionText,
      cancelText: cancelText,
      keyListener: null
    };
    
    // Set up keyboard listener
    this.waitOverlay.keyListener = (event) => {
      if (this.waitingForKey) {
        if (event.keyCode === Phaser.KeyCode.ESC) {
          // Cancel key binding
          this.cancelKeyWait();
        } else if (this.waitingForKey.type === "keyboard") {
          // Handle keyboard key
          this.handleKeyboardKeyPress(event.keyCode);
        }
      }
    };
    
    // Set up gamepad listener
    this.waitOverlay.gamepadListener = (buttonCode) => {
      if (this.waitingForKey && this.waitingForKey.type === "gamepad") {
        this.handleGamepadButtonPress(buttonCode);
      }
    };
    
    const originalKeyboardCallback = game.input.keyboard.onDownCallback;
    const originalGamepadCallback = game.input.gamepad.onDownCallback;
    
    // Add listeners
    game.input.keyboard.onDownCallback = this.waitOverlay.keyListener;
    
    // Hook into gamepad input for button detection
    game.input.gamepad.onDownCallback = (buttonCode) => {
      if (this.waitOverlay.gamepadListener) {
        this.waitOverlay.gamepadListener(buttonCode);
      }
      
      game.input.gamepad.onDownCallback = originalGamepadCallback;
    };
    
    this.waitOverlay.originalKeyboardCallback = originalKeyboardCallback;
    this.waitOverlay.originalGamepadCallback = originalGamepadCallback;
  }

  cancelKeyWait() {
    if (this.waitOverlay) {
      // Remove overlay
      this.waitOverlay.graphics.destroy();
      this.waitOverlay.instructionText.destroy();
      this.waitOverlay.cancelText.destroy();
      
      this.waitingForKey = false;
      
      // Remove listeners
      if (this.waitOverlay.originalKeyboardCallback) {
        game.input.keyboard.onDownCallback = this.waitOverlay.originalKeyboardCallback;
      }
      
      // Restore original gamepad callback
      if (this.waitOverlay.originalGamepadCallback) {
        game.input.gamepad.onDownCallback = this.waitOverlay.originalGamepadCallback;
      }
      
      this.waitOverlay = null;
      this.waitingForKey = null;
    }
    
    // Return to appropriate menu
    if (this.lastCustomizationMenu === "keyboard") {
      this.showKeyboardCustomization();
    } else if (this.lastCustomizationMenu === "gamepad") {
      this.showGamepadCustomization();
    }
  }

  handleKeyboardKeyPress(keyCode) {
    if (!this.waitingForKey || this.waitingForKey.type !== "keyboard") return;
    
    // Check if key is already mapped
    const isAlreadyMapped = this.isKeyAlreadyMapped(keyCode, this.waitingForKey.mappingKey, this.waitingForKey.index);
    
    if (isAlreadyMapped) {
      notifications.show("KEY ALREADY MAPPED!");
      return;
    }
    
    // Map the key
    const mapping = Account.mapping.keyboard;
    
    // Ensure array exists for this mapping key
    if (!mapping[this.waitingForKey.mappingKey]) {
      mapping[this.waitingForKey.mappingKey] = [];
    }
    
    // Ensure array is long enough
    while (mapping[this.waitingForKey.mappingKey].length <= this.waitingForKey.index) {
      mapping[this.waitingForKey.mappingKey].push(null);
    }
    
    // Set the key
    mapping[this.waitingForKey.mappingKey][this.waitingForKey.index] = keyCode;
    
    // Save and update gamepad
    saveAccount();
    gamepad.updateMapping(Account.mapping.keyboard, Account.mapping.gamepad);
    
    // Show confirmation
    setTimeout(() => notifications.show(`MAPPED: ${this.getKeyName(keyCode)}`), 25);
    
    // Return to menu
    this.cancelKeyWait();
    this.showKeyboardCustomization();
  }

  handleGamepadButtonPress(buttonCode) {
    if (!this.waitingForKey || this.waitingForKey.type !== "gamepad") return;
    
    // Check if button is already mapped
    const isAlreadyMapped = this.isGamepadButtonAlreadyMapped(buttonCode, this.waitingForKey.mappingKey);
    
    if (isAlreadyMapped) {
      notifications.show("BUTTON ALREADY MAPPED!");
      return;
    }
    
    // Map the button
    Account.mapping.gamepad[this.waitingForKey.mappingKey] = buttonCode;
    
    // Save and update gamepad
    saveAccount();
    gamepad.updateMapping(Account.mapping.keyboard, Account.mapping.gamepad);
    
    // Show confirmation
    setTimeout(() => notifications.show(`MAPPED: ${GAMEPAD_KEY_NAMES[buttonCode] || `BUTTON ${buttonCode}`}`), 25);
    
    // Return to menu
    this.cancelKeyWait();
    this.showGamepadCustomization();
  }

  isKeyAlreadyMapped(keyCode, excludeMappingKey, excludeIndex) {
    const mapping = Account.mapping.keyboard;
    
    for (const [mappingKey, keyCodes] of Object.entries(mapping)) {
      if (Array.isArray(keyCodes)) {
        keyCodes.forEach((code, index) => {
          if (code === keyCode && !(mappingKey === excludeMappingKey && index === excludeIndex)) {
            return true;
          }
        });
      }
    }
    
    return false;
  }

  isGamepadButtonAlreadyMapped(buttonCode, excludeMappingKey) {
    const mapping = Account.mapping.gamepad;
    
    for (const [mappingKey, code] of Object.entries(mapping)) {
      if (code === buttonCode && mappingKey !== excludeMappingKey) {
        return true;
      }
    }
    
    return false;
  }

  getKeyboardKeyDisplay(mappingKey, index) {
    const mapping = Account.mapping.keyboard[mappingKey];
    
    if (!mapping || !Array.isArray(mapping) || index >= mapping.length || !mapping[index]) {
      return "---";
    }
    
    const keyCode = mapping[index];
    return this.getKeyName(keyCode);
  }

  getGamepadButtonDisplay(mappingKey) {
    const buttonCode = Account.mapping.gamepad[mappingKey];
    
    if (buttonCode === undefined || buttonCode === null) {
      return "---";
    }
    
    return GAMEPAD_KEY_NAMES[buttonCode] || `BUTTON ${buttonCode}`;
  }

  getKeyName(keyCode) {
    // Find the key name from Phaser.KeyCode
    for (const [name, code] of Object.entries(Phaser.KeyCode)) {
      if (code === keyCode) {
        // Convert to readable name
        return this.formatKeyName(name);
      }
    }
    
    // If not found in Phaser.KeyCode, try to get from event
    return `KEY ${keyCode}`;
  }

  formatKeyName(name) {
    // Convert Phaser key code names to readable format
    const nameMap = KEYBOARD_KEY_NAMES;
    
    // Check if we have a mapped name
    if (nameMap[name]) {
      return nameMap[name];
    }
    
    // For letter keys (A-Z)
    if (name.length === 1 && /^[A-Z]$/.test(name)) {
      return name;
    }
    
    // For number keys (0-9)
    if (name.length === 1 && /^[0-9]$/.test(name)) {
      return name;
    }
    
    // Convert to readable format (e.g., "A" -> "A", "COMMA" -> "COMMA")
    return name.replace(/_/g, ' ');
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
    game.state.start("SongSelect", true, false, window.localSongs, null, false, "local");
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
  
  openEditor() {
    game.state.start("Editor", true, false, window.editorSongData || null);
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
    this.windowManager?.update();
  }

  shutdown() {
    if (backgroundMusic && !this.keepBackgroundMusic) {
      backgroundMusic.destroy();
      backgroundMusic = null;
    }
  }
}
