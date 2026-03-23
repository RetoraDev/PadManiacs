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
      "Thank you for playing!\n\n" +
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
    game.state.start("Addons");
  }
  
  showSettings() {
    game.state.start("Settings");
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
    this.keepBackgroundMusic = false;
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
