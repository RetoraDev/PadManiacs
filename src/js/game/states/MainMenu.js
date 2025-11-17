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
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  menu() {
    const manager = new WindowManager();
    this.manager = manager;
    
    const home = () => {
      const carousel = new CarouselMenu(0, 112 / 2, 112, 112 / 2, {
        align: 'left',
        bgcolor: 'brown',
        fgcolor: '#ffffff',
        animate: true,
        crop: false
      });
      carousel.addItem("Rhythm Game", () => startGame());
      carousel.addItem("Settings", () => settings());
      carousel.addItem("Extras", () => extras());
      
      game.onMenuIn.dispatch('home', carousel);
      
      if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
        carousel.addItem("Exit", () => exit());
        carousel.onCancel.add(() => exit());
      }
    };
    
    const startGame = () => {
      const carousel = new CarouselMenu(0, 112 / 2, 112, 112 / 2, {
        align: 'left',
        bgcolor: 'brown',
        fgcolor: '#ffffff',
        animate: true,
        crop: false
      });
      carousel.addItem("Free Play", () => this.freePlay());
      carousel.addItem("Extra Songs", () => extraSongs());
      game.onMenuIn.dispatch('startGame', carousel);
      carousel.addItem("< Back", () => home());
      carousel.onCancel.add(() => home());
    };
    
    const extraSongs = () => {
      const carousel = new CarouselMenu(0, 112 / 2, 112, 112 / 2, {
        align: 'left',
        bgcolor: 'brown',
        fgcolor: '#ffffff',
        animate: true,
        crop: false
      });
      
      if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) carousel.addItem("User Songs", () => this.loadExternalSongs());
      carousel.addItem("Load Single Song", () => this.loadSingleSong());
      if (window.externalSongs && (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS)) {
        carousel.addItem("Reload User Songs", () => {
          backgroundMusic.refreshCache();
          window.externalSongs = undefined;
          this.loadExternalSongs();
        });
      }
      game.onMenuIn.dispatch('extraSongs', carousel);
      carousel.addItem("< Back", () => home());
      carousel.onCancel.add(() => home());
    };
    
    let settingsWindow;
    
    const settings = () => {
      settingsWindow = manager.createWindow(3, 1, 18, 12, "1");
      settingsWindow.fontTint = 0x76fcde;
      
      settingsWindow.addSettingItem(
        "Volume",
        ["0%", "25%", "50%", "75%", "100%"], Account.settings.volume,
        index => {
          Account.settings.volume = index;
          saveAccount();
          backgroundMusic.audio.volume = [0,25,50,75,100][index] / 100;
        }
      );
      
      settingsWindow.addSettingItem(
        "Auto-play",
        ["OFF", "ON"], Account.settings.autoplay ? 1 : 0,
        index => {
          Account.settings.autoplay = index === 1;
          saveAccount();
        }
      );
      
      const metronomeOptions = ['OFF', 'Note', 'Quarters', 'Eighths', 'Sixteenths', 'Thirty-seconds'];
      const currentMetronome = Account.settings.metronome || 'OFF';
      const currentMetronomeIndex = metronomeOptions.indexOf(currentMetronome);
      
      settingsWindow.addSettingItem(
        "Metronome",
        metronomeOptions,
        currentMetronomeIndex,
        index => {
          const selectedOption = metronomeOptions[index];
          Account.settings.metronome = selectedOption;
          saveAccount();
        }
      );
      
      let index = 0;
      if (Account.settings.enableMenuMusic) {
        index = Account.settings.randomSong ? 1 : 0;
      } else {
        index = 2;
      }
      
      const visualizerOptions = ['NONE', 'BPM', 'ACURRACY', 'AUDIO'];
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
      
      settingsWindow.addSettingItem(
        "Scroll Direction",
        ["FALLING", "RISING"],
        Account.settings.scrollDirection === 'falling' ? 0 : 1,
        index => {
          Account.settings.scrollDirection = index === 0 ? 'falling' : 'rising';
          saveAccount();
        }
      );
      
      const noteOptions = [
        { value: 'NOTE', display: 'NOTE' },
        { value: 'VIVID', display: 'VIVID' },
        { value: 'FLAT', display: 'FLAT' },
        { value: 'RAINBOW', display: 'RAINBOW' }
      ];
      
      const currentNoteOption = Account.settings.noteColorOption || 'NOTE';
      const currentNoteIndex = noteOptions.findIndex(opt => opt.value === currentNoteOption);
      
      settingsWindow.addSettingItem(
        "Note Colors",
        noteOptions.map(opt => opt.display),
        currentNoteIndex,
        index => {
          const selectedOption = noteOptions[index].value;
          Account.settings.noteColorOption = selectedOption;
          saveAccount();
        }
      );

      settingsWindow.addSettingItem(
        "Note Speed",
        ["Normal", "Double", "Triple", "Insane", "Sound Barrier", "Light Speed", "Faster than light"],
        Account.settings.noteSpeedMult - 1,
        index => {
          Account.settings.noteSpeedMult = index + 1;
          saveAccount();
        }
      );
      
      settingsWindow.addSettingItem(
        "Speed Mod",
        ["X-MOD", "C-MOD"],
        Account.settings.speedMod === 'C-MOD' ? 1 : 0,
        index => {
          Account.settings.speedMod = index === 1 ? 'C-MOD' : 'X-MOD';
          saveAccount();
        }
      );
      
      settingsWindow.addSettingItem(
        "Beat Lines",
        ["YES", "NO"],
        Account.settings.beatLines ? 0 : 1,
        index => {
          Account.settings.beatLines = index === 0;
          saveAccount();
        }
      );
      
      const offsetOptions = [];
      for (let ms = -1000; ms <= 1000; ms += 25) {
        offsetOptions.push(`${ms}ms`);
      }
      
      const currentOffset = Account.settings.userOffset || 0;
      const currentOffsetIndex = (currentOffset + 1000) / 25;
      
      settingsWindow.addSettingItem(
        "Global Offset",
        offsetOptions,
        currentOffsetIndex,
        index => {
          const newOffset = (index * 25) - 1000;
          Account.settings.userOffset = newOffset;
          saveAccount();
        }
      );
      
      settingsWindow.addSettingItem(
        "Menu Music",
        ["LAST SONG", "RANDOM SONG", "OFF"],
        index,
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
      
      settingsWindow.addSettingItem(
        "Pixelated",
        ["YES", "NO"],
        Account.settings.pixelated ? 0 : 1,
        index => {
          Account.settings.pixelated = index == 0 ? true : false;
          restartNeeded = true;
          saveAccount();
        }
      );
      
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
      
      settingsWindow.addItem(
        "Erase Highscores",
        "",
        () => eraseHighscores()
      );
      
      game.onMenuIn.dispatch('settings', settingsWindow);
      
      settingsWindow.addItem(
        "Restore Default Settings",
        "",
        () => restoreDefaultSettings()
      );
      
      settingsWindow.addItem("APPLY", "", () => {
        manager.remove(settingsWindow, true);
        if (restartNeeded) {
          reload();
        } else {
          home();
        }
      }, true);
    };
    
    const extras = () => {
      const carousel = new CarouselMenu(0, 112 / 2, 112, 112 / 2, {
        align: 'left',
        bgcolor: 'brown',
        fgcolor: '#ffffff',
        animate: true,
        crop: false
      });
      if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) carousel.addItem("Addon Manager", () => this.addonManager());
      carousel.addItem("Offset Assistant", () => this.startOffsetAssistant());
      carousel.addItem("Jukebox", () => jukebox());
      carousel.addItem("Credits", () => this.showCredits());
      game.onMenuIn.dispatch('extras', carousel);
      carousel.addItem("< Back", () => home());
      carousel.onCancel.add(() => home());
    };
    
    const jukebox = () => {
      if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
        if (!window.externalSongs) {
          confirm("Load extra songs from external storage?", () => {
            game.state.start("LoadExternalSongs", true, false, "Jukebox", [undefined, undefined]);
          }, () => {
            game.state.start("Jukebox");
          });
        } else {
          game.state.start("Jukebox");
        }
      } else {
        game.state.start("Jukebox");
      }
    };
    
    const confirm = (message, onConfirm, onCancel) => {
      manager.remove(settingsWindow, true);
      
      const text = new Text(game.width / 2, 40, message || "You sure?", FONTS.shaded);
      text.anchor.x = 0.5;
      
      const window = manager.createWindow(10, 7, 5, 4, "1");
      window.fontTint = 0x76fcde;
      
      window.offset = {
        x: 7,
        y: 0
      };
      
      window.addItem("Yes", "", () => {
        text.destroy();
        manager.remove(window, true);
        onConfirm?.()
      });
      window.addItem("No", "", () => {
        text.destroy();
        manager.remove(window, true);
        onCancel?.();
      }, true);
    }
    
    const eraseHighscores = () => confirm("Permanently erase hight scores?", () => {
      Account.highScores = {};
      saveAccount();
      settings();
    }, () => settings());
    
    const restoreDefaultSettings = () => {
      confirm("All settings will be restored to default.\nA refresh is needed", () => {
        Account.settings = DEFAULT_ACCOUNT.settings;
        saveAccount();
        window.location.reload();
      }, () => settings());
    }
    
    const reload = () => confirm("Restart Now?", () => location.reload(), () => settings());
    
    const exit = () => confirm("Sure? Exit?", () => {
      switch (CURRENT_ENVIRONMENT) {
        case ENVIRONMENT.CORDOVA:
          navigator.app.exitApp();
          break;
        case ENVIRONMENT.NWJS:
          nw?.App?.quit?.();
          break;
      }
    }, () => home());
    
    home();
  }
  freePlay() {
    game.state.start("SongSelect", true, false, window.localSongs);
  }
  startOffsetAssistant() {
    // Create and start the offset assistant
    const offsetAssistant = new OffsetAssistant(game);
    game.add.existing(offsetAssistant);
  }
  loadExternalSongs() {
    game.state.start("LoadExternalSongs");
  }
  loadSingleSong() {
    game.state.start("LoadSongFolder");
  }
  addonManager() {
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
      
      carousel.addItem("Uninstall Addon", () => confirm("The addon folder will be removed. Continue?", () => {
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
        confirm("Reload required. Restart now?", () => {
          location.reload();
        }, () => {
          this.menu();
        });
      } else {
        preview.destroy();
        detailText.destroy();
        this.menu();
      }
    };
    
    const confirm = (message, onConfirm, onCancel) => {
      const text = new Text(game.width / 2, 40, message || "You sure?", FONTS.shaded);
      text.anchor.x = 0.5;
      
      preview.destroy();
      detailText.destroy();
      
      const window = this.manager.createWindow(10, 7, 5, 4, "1");
      window.fontTint = 0x76fcde;
      
      window.offset = {
        x: 7,
        y: 0
      };
      
      window.addItem("Yes", "", () => {
        text.destroy();
        this.manager.remove(window, true);
        onConfirm?.()
      });
      window.addItem("No", "", () => {
        text.destroy();
        this.manager.remove(window, true);
        onCancel?.();
      }, true);
    }
    
    showInstalledAddons();
  }
  showCredits() {
    game.state.start("Credits", true, false, "MainMenu");
  }
  update() {
    gamepad.update();
    this.manager?.update();
  }
  shutdown() {
    if (backgroundMusic) {
      backgroundMusic.destroy();
      backgroundMusic = null;
    }
  }
}
