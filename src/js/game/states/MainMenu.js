class MainMenu {
  create() {
    game.camera.fadeIn(0xffffff);
    
    this.futuristicLines = new FuturisticLines();
    this.backgroundGradient = new BackgroundGradient();
    this.navigationHint = new NavigationHint('general');
    
    // Check for feedback dialogs before showing menu
    this.checkInitialDialogs();
    
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
      __("Seems like the game crashed last time.\n" +
      "Sorry about that!!\n\n" +
      "As a solo developer, crash reports are super helpful for fixing issues.\n\n" +
      "Could you quickly report what you were doing when it crashed?\n" +
      "||Parece que el juego se bloqueó la última vez.\n" +
      "¡Perdón por eso!\n\n" +
      "Como desarrollador solitario, los reportes de error son súper útiles para arreglar problemas.\n\n" +
      "¿Podrías reportar rápidamente qué estabas haciendo cuando ocurrió?\n"),
      () => {
        // Open bug report page
        window.openExternalUrl(FEEDBACK_BUG_REPORT_URL);
        
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
      __("Report Bug||Reportar Bug"),
      __("Maybe Later||Después")
    );
  }

  showRatingDialog() {
    this.confirmDialog(
      __("Hey! You've been playing a while!\n\n" +
      "Do you like the game? Ratings really help keep me motivated.\n\n" +
      "Would you mind leaving a quick rating?\n" +
      "||¡Vaya! ¡Llevas un buen rato jugando!\n\n" +
      "¿Te gusta el juego? Las valoraciones realmente me ayudan a mantener la motivación.\n\n" +
      "¿Te importaría dejar una valoración rápida?\n"),
      () => {
        // Rate Now
        window.openExternalUrl(FEEDBACK_REVIEW_URL);
        
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
      __("Rate Now||Valorar"), 
      __("No Thanks||No, Gracias")
    );
  }

  showFeatureRequestDialog() {
    this.confirmDialog(
      __("Thank you for playing!\n\n" +
      "I'm a solo developer, so hearing your ideas directly is incredibly valuable.\n\n" +
      "Got any feature requests or suggestions?\n" +
      "What would you like to see in the game?\n" +
      "||¡Gracias por jugar!\n\n" +
      "Soy un desarrollador solitario, así que escuchar tus ideas directamente es increíblemente valioso.\n\n" +
      "¿Tienes alguna sugerencia o petición?\n" +
      "¿Qué te gustaría ver en el juego?\n"),
      () => {
        // Share ideas
        window.openExternalUrl(FEEDBACK_FEATURE_REQUEST_URL);
        
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
      __("Share Ideas||Compartir Ideas"),
      __("Not Now||Ahora No")
    );
  }
  
  showCommunityDialog() {
    this.confirmDialog(
      __("Enjoying the game?\n" +
      "Join the community to download more charts, and share your creations and high scores with other players!\n" +
      "||¿Disfrutando el juego?\n" +
      "¡Únete a la comunidad para descargar más charts, y compartir tus creaciones y records con otros jugadores!\n"),
      () => {
        // Join
        window.openExternalUrl(COMMUNITY_HOMEPAGE_URL);
        
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
      __("Join||Unirse"), 
      __("No Thanks||No, Gracias")
    );
  }

  menu() {
    this.windowManager = new WindowManager();
    
    this.showHomeMenu();
  }

  showHomeMenu() {
    const carousel = new CarouselMenu(0, game.height / 2 - 16, 112, 64, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    carousel.addItem(__("Rhythm Game||Partida"), () => this.startGame());
    carousel.addItem(__("Character Select||Personaje"), () => {
      this.keepBackgroundMusic = true;
      game.state.start("CharacterSelect");
    });
    carousel.addItem(__("Chart Editor||Editor"), () => this.openEditor());
    carousel.addItem(__("Settings||Ajustes"), () => this.showSettings());
    carousel.addItem(__("Extras||Extras"), () => this.showExtras());
    
    game.onMenuIn.dispatch('home', carousel);
    
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      carousel.addItem(__("Exit||Salir"), () => this.confirmExit());
      carousel.onCancel.add(() => this.confirmExit());
    }
  }

  startGame() {
    const carousel = new CarouselMenu(0, game.height / 2 - 16, 112,   64, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    carousel.addItem(__("Free Play||Juego Libre"), () => this.freePlay());
    carousel.addItem(__("Extra Songs||Canciones Extra"), () => this.showExtraSongs());
    carousel.addItem("Playlists", () => {
      this.keepBackgroundMusic = true;
      game.state.start("Playlists");
    });
    game.onMenuIn.dispatch('startGame', carousel);
    carousel.addItem(__("< Back||< Volver"), () => this.showHomeMenu());
    carousel.onCancel.add(() => this.showHomeMenu());
  }

  showExtraSongs() {
    const carousel = new CarouselMenu(0, game.height / 2 - 16, 112,   64, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA) {
      carousel.addItem(__("User Songs||Canciones de Usuario"), () => this.loadExternalSongs());
      carousel.addItem(__("Filesystem||Sistema de Archivos"), () => this.startFileSelect());
    }
    carousel.addItem(__("Load Single Song||Cargar Canción Individual"), () => this.loadSingleSong());
    
    if (window.externalSongs && (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS)) {
      carousel.addItem(__("Reload User Songs||Recargar Canciones de Usuario"), () => {
        backgroundMusic.refreshCache();
        window.externalSongs = undefined;
        this.loadExternalSongs();
      });
    }
    
    game.onMenuIn.dispatch('extraSongs', carousel);
    carousel.addItem(__("< Back||< Volver"), () => this.startGame());
    carousel.onCancel.add(() => this.startGame());
  }

  showExtras() {
    const carousel = new CarouselMenu(0, game.height / 2 - 16, 112,   64, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS || window.DEBUG) {
      carousel.addItem(__("Addon Manager||Gestor de Addons"), () => this.showAddonManager());
    }
    carousel.addItem(__("Jukebox||Jukebox"), () => this.startJukebox());
    carousel.addItem(__("Offset Assistant||Asistente de Offset"), () => this.startOffsetAssistant());
    carousel.addItem(__("Achievements||Logros"), () => this.showAchievements());
    carousel.addItem(__("Player Stats||Estadísticas"), () => this.showStats());
    carousel.addItem(__("Feedback||Comentarios"), () => this.showFeedback());
    carousel.addItem(__("Community||Comunidad"), () => this.showCommunity());
    carousel.addItem(__("Credits||Créditos"), () => this.showCredits());
    
    game.onMenuIn.dispatch('extras', carousel);
    carousel.addItem(__("< Back||< Volver"), () => this.showHomeMenu());
    carousel.onCancel.add(() => this.showHomeMenu());
  }

  showFeedback() {
    const carousel = new CarouselMenu(0, game.height / 2 - 16, 112,   64, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    const openLink = url => {
      window.openExternalUrl(url);
      this.showFeedback();
    };
    
    carousel.addItem(__("Leave A Review||Dejar Reseña"), () => openLink(FEEDBACK_REVIEW_URL));
    carousel.addItem(__("Feature Request||Solicitar Función"), () => openLink(FEEDBACK_FEATURE_REQUEST_URL));
    carousel.addItem(__("Bug Report||Reportar Error"), () => openLink(FEEDBACK_BUG_REPORT_URL));
    
    game.onMenuIn.dispatch('feedback', carousel);
    carousel.addItem(__("< Back||< Volver"), () => this.showExtras());
    carousel.onCancel.add(() => this.showExtras());
  }
  
  showCommunity() {
    window.openExternalUrl(COMMUNITY_HOMEPAGE_URL);
    
    Account.stats.wentToCommunity = true;
    saveAccount();
    
    this.menu();
  }
  
  showAddonManager() {
    this.keepBackgroundMusic = true;
    game.state.start("Addons");
  }
  
  showSettings() {
    this.keepBackgroundMusic = true;
    game.state.start("Settings");
  }
  
  confirmDialog(message, onConfirm, onCancel, confirmText = __("Yes||Sí"), cancelText = __("No||No")) {
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
      __("Are you sure you want to exit the game?||¿Estás seguro de que quieres salir del juego?"),
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
      __("Exit||Salir"),
      __("Cancel||Cancelar")
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
  
  startFileSelect() {
    game.state.start('FileSelect', true, false, ['sm', 'zip'], (entry) => {
      const fileName = entry.name;
      const folderPath = FileTools.getDirectory(entry.fullPath);
      
      game.state.start('LoadExternalSongFile', true, false, fileName, folderPath);
    });
  }

  loadSingleSong() {
    game.state.start("LoadSongFolder");
  }

  startJukebox() {
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      if (!window.externalSongs) {
        this.confirmDialog(
          __("Load extra songs from external storage?||¿Cargar canciones extras desde almacenamiento externo?"),
          () => {
            game.state.start("LoadExternalSongs", true, false, "Jukebox", [undefined, undefined]);
          },
          () => {
            game.state.start("Jukebox");
          },
          __("Load Songs||Cargar Canciones"),
          __("Skip||Saltar")
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