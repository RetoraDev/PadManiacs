class SongSelect {
  init(songs, index, autoSelect, type = "auto", playlistKey = null) {
    this.type = type;
    this.playlistKey = playlistKey;
    
    this.isActionMenuOpen = false;
    this.actionsMenuBlocked = false;
    
    switch (type) {
      case "local":
        this.songs = songs || window.localSongs || [];
        this.startingIndex = index || Account.songSelectStartingIndex.local || 0;
        break;
      case "external":
        this.songs = songs || window.externalSongs || [];
        this.startingIndex = index || Account.songSelectStartingIndex.external || 0;
        break;
      case "auto":
      default:
        this.songs = songs || window.selectedSongs || [];
        this.startingIndex = index || window.selectStartingIndex || 0;
        break;
    }
    
    window.selectedSongs = this.songs;
    
    this.autoSelect = autoSelect || false;
    
    if (!window.multiplayerState) window.multiplayerState = {
      player1: {},
      player2: {}
    };
    
    window.multiplayerState.player1.ready = false;
    window.multiplayerState.player2.ready = false;
    window.multiplayerState.player2.joined = false;
    this.multiplayerState = window.multiplayerState;
    
    if (this.startingIndex + 1 > this.songs.length) {
      this.startingIndex = 0;
    }
  }
  
  create() {
    //gamepad.singlePlayerId = gamepad.lastPlayerId;
    
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    
    new BackgroundGradient();
    
    this.selectedSong = null;
    this.selectedDifficulty = 0;
    
    // Stop any background music when entering song selection
    if (backgroundMusic) {
      backgroundMusic.stop();
    }
    
    this.previewAudio = this.previewAudio || document.createElement("audio");
    this.previewAudio.volume = Account.settings.volume / 100;
    
    this.bannerImg = this.bannerImg || document.createElement("img");
    
    this.navigationHint = new NavigationHint('song_select');
    this.navigationHint.ignorePlayerSwitch = true;
    
    this.autoplayText = new Text(4, 132, "");
    
    this.bannerSprite = new CanvasBackground(4, 4);

    this.metadataText = new Text(102, 4, "");
    
    this.highScoreText = new Text(game.width / 2 + 8, 58, "");
    
    this.loadingDots = new LoadingDots();
    this.loadingDots.y -= 8;
    this.loadingDots.visible = false;
    
    this.windowManager1 = new WindowManager(); // For Player 1
    this.windowManager2 = new WindowManager(); // For Player 2
    
    this.windowManager1.gamepad = gamepad1;
    this.windowManager2.gamepad = gamepad2;
    
    this.visibilityChangeListener = () => {
      if (document.hidden) {
        this.previewAudio?.pause();
      } else {
        this.previewAudio?.play();
      }
    };
    
    window.addEventListener('visibilitychange', this.visibilityChangeListener);
    
    this.createSongSelectionMenu();
    
    if (this.autoSelect) {
      this.selectSong(this.songs[this.songCarousel.selectedIndex], this.songCarousel.selectedIndex);
      this.songCarousel.destroy();
      this.autoSelect = false;
    }
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  createSongSelectionMenu() {
    const x = 0;
    const y = 35;
    const width = game.width / 2;
    const height = 100;

    this.songCarousel = new CarouselMenu(x, y, width, height, {
      bgcolor: "#9b59b6",
      fgcolor: "#ffffff",
      align: "left",
      animate: true,
      doubleClickConfirm: true,
      margin: { left: 2 }
    });

    // Add songs to carousel
    if (this.songs.length === 0) {
      this.songCarousel.addItem(__("No songs found||No se encontraron canciones"), null);
      this.songCarousel.config.disableConfirm = true;
    } else {
      this.songs.forEach((song, index) => {
        const title = song.titleTranslit || song.title;
        const displayText = title ? title : __(`Song ${index + 1}||Canción ${index + 1}`);
        
        this.songCarousel.addItem(
          displayText,
          (item) => {
            this.selectSong(song, index);
          },
          { song: song, index: index }
        );
      });
    }
    
    game.onMenuIn.dispatch('songList', this.songCarousel);
    
    // Move to the starting index
    this.songCarousel.selectedIndex = this.startingIndex;
    this.songCarousel.updateSelection();

    // Handle carousel events
    this.songCarousel.onSelect.add((index, item) => {
      if (item.data && item.data.song) {
        this.previewSong(item.data.song, index);
      }
    });

    this.songCarousel.onCancel.add(() => {
      game.state.start("MainMenu");
    });
    
    // Preview song if available
    if (this.songs.length > 0) {
      this.previewSong(this.songs[this.songCarousel.selectedIndex]);
    }
  }

  previewSong(song) {
    let index = this.songCarousel.selectedIndex;
    
    if (song.audioUrl) {
      // Load and play preview
      this.previewAudio.src = song.audioUrl;
      this.previewAudio.currentTime = song.sampleStart || 0;
      this.previewAudio.play();
    }
    
    if (song.bannerUrl) {
      if (!this.autoSelect) this.loadingDots.visible = true;
      this.songCarousel.config.disableNavigation = true;
      
      if (Account.settings.imageRenderingCompatibility) {
        const usePhaser = false;
        if (usePhaser) {
          this.bannerSprite.loadTexture('__default');
          game.cache.addImageAsync('__song_banner', song.bannerUrl, () => {
            if (index == this.songCarousel.selectedIndex) this.loadingDots.visible = false;
            this.bannerSprite.loadTexture('__song_banner');
            this.bannerSprite.width = 96;
            this.bannerSprite.height = 32;
            this.songCarousel.config.disableNavigation = false;
          });
        } else {
          this.bannerSprite.loadTexture('__default');
          FileTools.urlToDataURL(song.bannerUrl).then(url => {
            this.bannerSprite.restoreCanvas();
          
            this.bannerImg.src = url;
            this.bannerImg.onload = () => {
              if (index == this.songCarousel.selectedIndex) this.loadingDots.visible = false;
              
              this.bannerSprite.ctx.clearRect(0, 0, 96, 32);
              this.bannerSprite.ctx.drawImage(this.bannerImg, 0, 0, 96, 32);
              
              this.bannerSprite.dirty();
              
              this.songCarousel.config.disableNavigation = false;
            };
            this.bannerImg.onerror = () => {
              this.loadingDots.visible = false;
              this.bannerSprite.loadTexture('ui_banner_no_image');
              this.songCarousel.config.disableNavigation = false;
            };
          });
        }
      } else {
        this.bannerSprite.restoreCanvas();
          
        this.bannerImg.src = song.bannerUrl;
        this.bannerImg.onload = () => {
          if (index == this.songCarousel.selectedIndex) this.loadingDots.visible = false;
          
          this.bannerSprite.ctx.clearRect(0, 0, 96, 32);
          this.bannerSprite.ctx.drawImage(this.bannerImg, 0, 0, 96, 32);
          
          this.bannerSprite.dirty();
          
          this.songCarousel.config.disableNavigation = false;
        };
        this.bannerImg.onerror = () => {
          this.loadingDots.visible = false;
          this.bannerSprite.loadTexture('ui_banner_no_image');
          this.songCarousel.config.disableNavigation = false;
        };
      }
    } else {
      this.bannerSprite.loadTexture('ui_banner_no_image');
      this.songCarousel.config.disableNavigation = false;
    }
    
    this.metadataText.write(this.getMetadataText(song));
    this.metadataText.wrap(136);
    
    this.displayHighScores(song);
    
    this.startingIndex = this.songCarousel.selectedIndex;
    window.selectStartingIndex = this.startingIndex;
    
    if (this.type === "local") {
      Account.songSelectStartingIndex.local = this.startingIndex;
    } else {
      Account.songSelectStartingIndex.external = this.startingIndex;
    }
  }
  
  displayHighScores(song) {
    const songKey = this.getSongKey(song);
    const highScores = Account.highScores[songKey];
    
    if (!highScores) {
      if (this.highScoreText) {
        this.highScoreText.write(__("NO HIGH SCORES||SIN HIGH SCORES"));
      }
      return;
    }
    
    let highScoreText = __("HIGH SCORES:\n||HIGH SCORES:\n");
    
    // Show best score for each difficulty
    song.difficulties.forEach((diff, index) => {
      const diffKey = `${diff.type}${diff.rating}`;
      const scoreData = highScores[diffKey];
      
      if (scoreData) {
        highScoreText += `${diff.type}: ${scoreData.score.toLocaleString()} (${scoreData.rating})\n`;
      } else {
        highScoreText += `${diff.type}: ---\n`;
      }
    });
    
    this.highScoreText.write(highScoreText);
  }
  
  getSongKey(song) {
    if (song.folderName) {
      return `local_${song.folderName}`;
    } else if (song.audioUrl) {
      let hash = 0;
      for (let i = 0; i < song.audioUrl.length; i++) {
        const char = song.audioUrl.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return `external_${hash.toString(36)}`;
    }
    return `unknown_${Date.now()}`;
  }
  
  getMetadataText(data) {
    const title = data.titleTranslit || data.title;
    const subtitle = data.subtitleTranslit || data.subtitle;
    const artist = data.artistTranslit || data.artist;
    const genre = data.genre;
    const credit = data.credit;
    
    let text = "";
    
    if (title) text += title + '\n';
    if (subtitle) text += subtitle + '\n';
    if (artist) text += __("Artist: ") + artist + '\n';
    //if (genre) text += genre + '\n';
    if (credit) text += __("Credit: ") + credit;
    
    return text;
  }

  selectSong(song, index) {
    this.selectedSong = song;
    this.selectedDifficulty = 0;
    
    // Show difficulty selection
    this.showDifficultySelection(song);
  }

  showDifficultySelection(song) {
    const x = 0;
    const y = 37;
    const width = game.width / 2;
    const height = game.height;
    
    this.actionsMenuBlocked = true;
    
    this.difficultyCarousel = new CarouselMenu(x, y, width, height, {
      bgcolor: "#e67e22",
      fgcolor: "#ffffff",
      align: "center",
      animate: true
    });
    
    this.difficultyCarousel.onSelect.add((index) => {
      song.lastDifficultySelectedIndex = index;
    });
    
    if (song.lastDifficultySelectedIndex) {
      this.difficultyCarousel.selectIndex(song.lastDifficultySelectedIndex);
    }
    
    game.onMenuIn.dispatch('difficulty', this.difficultyCarousel);
    
    // Add difficulties
    song.difficulties.sort((a, b) => a.rating - b.rating).forEach((diff, index) => {
      this.difficultyCarousel.addItem(
        `${diff.type} (${diff.rating})`,
        (item) => {
          this.showGameModeSelection(song, index);
        },
        {
          difficulty: diff,
          index: index,
          bgcolor: window.getDifficultyColor(parseInt(diff.rating))
        }
      );
    });

    this.difficultyCarousel.onCancel.add(() => {
      this.createSongSelectionMenu();
      this.actionsMenuBlocked = false;
    });
  }
  
  showGameModeSelection(song, difficultyIndex) {
    const x = 0;
    const y = 37;
    const width = game.width / 2;
    const height = game.height;

    this.gamemodeCarousel = new CarouselMenu(x, y, width, height, {
      bgcolor: "#e67e22",
      fgcolor: "#ffffff",
      align: "center",
      animate: true
    });
    
    this.gamemodeCarousel.onSelect.add((index) => {
      window.lastGameModeSelectedIndex = index;
    });
    
    if (window.lastGameModeSelectedIndex) {
      this.gamemodeCarousel.selectIndex(window.lastGameModeSelectedIndex);
    }
    
    game.onMenuIn.dispatch('gamemode', this.gamemodeCarousel);
    
    this.gamemodeCarousel.addItem(__("Single Player||Un Jugador"), () => this.startGame(song, difficultyIndex, true));
    this.gamemodeCarousel.addItem(__("Multiplayer||Multijugador"), () => this.showMultiplayerScreen(song, difficultyIndex));
    
    this.gamemodeCarousel.onCancel.add(() => {
      this.showDifficultySelection(song);
    });
  }

  showMultiplayerScreen(song, difficultyIndex) {
    this.multiplayerScreen = game.add.group();
    
    this.player1Frame = this.windowManager1.createWindow(1, 5, 14, 10, "1", this.multiplayerScreen);
    this.player2Frame = this.windowManager2.createWindow(15.5, 5, 14, 10, "1", this.multiplayerScreen);
    
    this.populatePlayerFrame(this.player1Frame, 1);
    this.populatePlayerFrame(this.player2Frame, 2);
    
    this.windowManager1.focus(this.player1Frame);
            
    // Create ready text
    this.p1ReadyBackground = createGradientBackground(this.player1Frame.x + this.player1Frame.size.width * 8 / 2, this.player1Frame.y + this.player1Frame.size.height * 8 / 2, this.player1Frame.size.width * 8, 10);
    this.p2ReadyBackground = createGradientBackground(this.player2Frame.x + this.player2Frame.size.width * 8 / 2, this.player2Frame.y + this.player2Frame.size.height * 8 / 2, this.player2Frame.size.width * 8, 10);
    
    this.p1ReadyBackground.anchor.set(0.5);
    this.p2ReadyBackground.anchor.set(0.5);
    
    this.p1ReadyText = new Text(0, 1, __("READY||LISTO"), null, this.p1ReadyBackground);
    this.p2ReadyText = new Text(0, 1, __("READY||LISTO"), null, this.p2ReadyBackground);
    
    this.p1ReadyText.anchor.set(0.5);
    this.p2ReadyText.anchor.set(0.5);
    
    this.multiplayerScreen.addChild(this.p1ReadyBackground);
    this.multiplayerScreen.addChild(this.p2ReadyBackground);

    // Prompt player 2 to press start
    this.playerJoinInstructionText = new Text(120 + 55, 50 + 32, __("PLAYER 2\n< PRESS START >||JUGADOR 2\n< PRESIONA START >"), null, this.multiplayerScreen);
    this.playerJoinInstructionText.anchor.set(0.5);
    
    // Prompt both players to press start
    this.startInstructionText = new Text(game.width / 2, 100, __("PRESS START TO BEGIN||PRESIONA START PARA COMENZAR"), null, this.multiplayerScreen);
    this.startInstructionText.visible = false;
    this.startInstructionText.anchor.set(0.5);
    
    this.player2Frame.visible = false;
    
    this.highScoreText.visible = false;
    
    this.multiplayerState.song = song;
    this.multiplayerState.difficultyIndex = difficultyIndex;
  }
  
  startMultiplayer() {
    this.multiplayerScreen.destroy();
    this.multiplayerScreen = null;
    
    // Start gameplay with selected song and settings 
    game.state.start("PlayMulti", true, false, this.multiplayerState);
  }
  
  populatePlayerFrame(window, playerNumber) {
    const settings = this.multiplayerState["player" + playerNumber].settings;
    
    // Auto-play
    window.addSettingItem(
      "(Auto-play|Auto-juego)",
      [__("(OFF|APAGADO)"), __("(ON|ACTIVADO)")], 
      settings.autoplay ? 1 : 0,
      index => settings.autoplay = index === 1
    );
    
    // Scroll Direction
    window.addSettingItem(
      __("(Scroll|Desplazamiento)"),
      [__("(FALLING|CAYENDO)"), __("(RISING|ASCENDENTE)")],
      settings.scrollDirection === 'falling' ? 0 : 1,
      index => settings.scrollDirection = index === 0 ? 'falling' : 'rising'
    );
    
    // Note colors
    const noteOptions = [
      { value: 'NOTE', display: "NOTE" },
      { value: 'VIVID', display: "VIVID" },
      { value: 'FLAT', display: "FLAT" },
      { value: 'RAINBOW', display: "RAINBOW" }
    ];
    const currentNoteIndex = noteOptions.findIndex(opt => opt.value === settings.noteColorOption);
    window.addSettingItem(
      __("(Note Colors|Colores de Notas)"),
      noteOptions.map(opt => opt.display),
      currentNoteIndex,
      index => settings.noteColorOption = noteOptions[index].value
    );

    // Note speed
    window.addSettingItem(
      __("(Note Speed|Velocidad de Notas)"),
      ["x1", "x2", "x3", "x4", "x5", "x6", "x7"],
      settings.noteSpeedMult - 1,
      index => settings.noteSpeedMult = index + 1
    );
    
    // Speed mod
    window.addSettingItem(
      __("(Speed Mod|Modo de Velocidad)"),
      ["X-MOD", "C-MOD"],
      settings.speedMod === 'C-MOD' ? 1 : 0,
      index => settings.speedMod = index === 1 ? 'C-MOD' : 'X-MOD'
    );
  }

  startGame(song, difficultyIndex, singlePlayer = true) {
    // Start gameplay with selected song
    game.state.start(singlePlayer ? "Play" : "PlayMulti", true, false, {
      chart: song,
      difficultyIndex
    }, difficultyIndex, undefined, undefined, this.playlistKey);
  }

  showActionsMenu(playlistKey) {
    this.isActionMenuOpen = true;
    this.songCarousel.visible = false;
    this.songCarousel.inputEnabled = false;
    
    this.actionsMenu = new CarouselMenu(0, 35, game.width / 2, 100, {
      bgcolor: '#2c3e50',
      fgcolor: '#ffffff',
      align: 'left',
      animate: true
    });
    
    const playlistManager = PlaylistManager.getInstance();
    
    const hasPlaylistKey = !!playlistKey;
    const currentSong = this.songs[this.songCarousel.selectedIndex];
    const existingPlaylistKeys = playlistManager.getSongPlaylists(currentSong);

    // Add to playlist
    if (!hasPlaylistKey) {
      this.actionsMenu.addItem(__("Add to playlist||Agregar a playlist"), () => this.showAddToPlaylistMenu(currentSong));
    } else {
      this.actionsMenu.addItem(__("Add to another playlist||Agregar a otra playlist"), () => this.showAddToPlaylistMenu(currentSong, playlistKey));
    }
    
    // Remove from playlist
    if (hasPlaylistKey) {
      this.actionsMenu.addItem(__("Remove from playlist||Quitar de playlist"), () => {
        const playlist = playlistManager.getPlaylist(playlistKey);
        if (playlist) {
          const index = playlist.songs.findIndex(s => s.audioUrl === currentSong.audioUrl);
          if (index !== -1) {
            playlistManager.removeSong(playlistKey, index);
            notifications.show(__("Removed from playlist!||¡Quitado de la playlist!"));
            this.closeActionsMenu();
            
            // Reinitialize with updated songs at the same index (or previous if last)
            const updatedPlaylist = playlistManager.getPlaylist(playlistKey);
            const newIndex = Math.min(index, updatedPlaylist.songs.length - 1);
            game.state.start("SongSelect", true, false, 
              updatedPlaylist.songs, 
              newIndex, 
              false, 
              this.type, 
              this.playlistKey
            );
          } else {
            notifications.show(__("Song not in playlist!||¡Canción no está en la playlist!"));
          }
        }
      });
    } else if (existingPlaylistKeys.length) {
      const addItem = key => {
        const playlist = playlistManager.getPlaylist(key);
        
        if (playlist) {
          this.actionsMenu.addItem(__(`Remove from "${playlist.name}"||Quitar de "${playlist.name}"`), () => {
            const index = playlist.songs.findIndex(s => s.audioUrl === currentSong.audioUrl);
            if (index !== -1) {
              playlistManager.removeSong(key, index);
              notifications.show(__("Removed from playlist!||¡Quitado de la playlist!"));
              this.closeActionsMenu();
            } else {
              notifications.show(__("Song not in playlist!||¡Canción no está en la playlist!"));
            }
          });
        }
      };
      
      for (const key of existingPlaylistKeys) {
        addItem(key); // TODO: Limit the amout of items 
      }
    }
    
    // Move up/down
    // TODO: Allow the top/bottom song of the list to move up/down 
    if (hasPlaylistKey) {
      const playlist = playlistManager.getPlaylist(playlistKey);
      if (playlist) {
        const index = playlist.songs.findIndex(s => s.audioUrl === currentSong.audioUrl);
        if (index !== -1) {
          this.actionsMenu.addItem(__("Move up||Subir"), () => {
            if (index > 0) {
              const playlistManager = PlaylistManager.getInstance();
              playlistManager.moveSong(playlistKey, index, index - 1);
              notifications.show(__("Moved up!||¡Subido!"));
              this.closeActionsMenu();
              
              // Reinitialize with swapped songs at the new index
              const updatedPlaylist = playlistManager.getPlaylist(playlistKey);
              const newIndex = index - 1; // The song moved up one position
              game.state.start("SongSelect", true, false, 
                updatedPlaylist.songs, 
                newIndex, 
                false, 
                this.type, 
                this.playlistKey
              );
            } else {
              notifications.show(__("The song is already at top||La canción ya está al principio"));
              this.closeActionsMenu();
            }
          });
          this.actionsMenu.addItem(__("Move down||Bajar"), () => {
            if (index < playlist.songs.length - 1) {
              const playlistManager = PlaylistManager.getInstance();
              playlistManager.moveSong(playlistKey, index, index + 1);
              notifications.show(__("Moved down!||¡Bajado!"));
              this.closeActionsMenu();
              
              // Reinitialize with swapped songs at the new index
              const updatedPlaylist = playlistManager.getPlaylist(playlistKey);
              const newIndex = index + 1; // The song moved down one position
              game.state.start("SongSelect", true, false, 
                updatedPlaylist.songs, 
                newIndex, 
                false, 
                this.type, 
                this.playlistKey
              );
            } else {
              notifications.show(__("The song is already at bottom||La canción ya está al final"));
              this.closeActionsMenu();
            }
          });
        }
      }
    }
    
    // Statistics
    this.actionsMenu.addItem(__("See properties||Ver propiedades"), () => {
      game.state.start("SongStats", true, false, { chart: this.songs[this.songCarousel.selectedIndex], playlistKey: this.playlistKey }, "SongSelect", [this.songs, this.songCarousel.selectedIndex, this.autoSelect, this.type, this.playlistKey]);
    });
    
    // Open in Jukebox
    this.actionsMenu.addItem(__("Open in Jukebox||Abrir en Jukebox"), () => {
      game.state.start("Jukebox", true, false, this.songs, this.songCarousel.selectedIndex);
    });
    
    // Open in Editor
    this.actionsMenu.addItem(__("Open in Editor||Abrir en Editor"), () => {
      game.state.start("Editor", true, false, { chart: this.songs[this.songCarousel.selectedIndex] });
    });
    
    this.actionsMenu.addItem(__("< Back||< Volver"), () => this.closeActionsMenu());
    this.actionsMenu.onCancel.add(() => this.closeActionsMenu());
  }
  
  showAddToPlaylistMenu(song, omitKey) {
    if (this.actionsMenu) this.actionsMenu.destroy();
    
    if (!song.isLocal) {
      notifications.show(__("Songs loaded with file picker can't be added to playlists||Las canciones cargadas con selector de archivos no se pueden agregar a playlists"));
      this.showActionsMenu(omitKey);
      return;
    }
    
    this.actionsMenu = new CarouselMenu(0, 35, game.width / 2, 100, {
      bgcolor: '#8e44ad',
      fgcolor: '#ffffff',
      align: 'left',
      animate: true
    });
    
    const playlistManager = PlaylistManager.getInstance();
    
    this.actionsMenu.addItem(__("Create new playlist||Crear nueva playlist"), () => {
      this.createPlaylistForSong(song);
    });
    
    const keys = playlistManager.getPlaylistNames();
    for (const key of keys) {
      if (key === omitKey) continue;
      const playlist = playlistManager.getPlaylist(key);
      this.actionsMenu.addItem(__(`Add to "${playlist.name}"||Agregar a "${playlist.name}"`), () => {
        this.closeActionsMenu();
        if (playlistManager.addSong(key, song)) {
          notifications.show(__(`Added to "${playlist.name}"!||¡Agregado a "${playlist.name}"!`));
        } else {
          notifications.show(__("Song already in playlist!||¡Canción ya está en la playlist!"));
        }
      });
    }
    
    this.actionsMenu.addItem(__("< Back||< Volver"), () => {
      this.showActionsMenu(omitKey);
    });
    this.actionsMenu.onCancel.add(() => this.showActionsMenu(omitKey));
  }
  
  createPlaylistForSong(song) {
    const keyboard = new OnScreenKeyboard(undefined, 68);
    
    this.highScoreText.visible = false;
    
    window.focusedElement = new TextInput({
      text: __("(My|Mi) Playlist"),
      width: 12,
      maxLength: 20,
      useNewline: false,
      y: 38,
      onConfirm: (name) => {
        if (name.trim()) {
          const playlistManager = PlaylistManager.getInstance();
          const key = playlistManager.createPlaylist(name.trim());
          if (key) {
            playlistManager.addSong(key, song);
            notifications.show(__(`Playlist "${name}" created with song!||¡Playlist "${name}" creada con esta canción!`));
          } else {
            notifications.show(__("Playlist already exists!||¡La playlist ya existe!"));
          }
        } else {
          notifications.show(__("Name cannot be empty!||¡El nombre no puede estar vacío!"));
        }
        keyboard.destroy();
        this.closeActionsMenu();
        this.highScoreText.visible = true;
      },
      onCancel: () => {
        keyboard.destroy();
        this.closeActionsMenu();
        this.highScoreText.visible = true;
      }
    });
  }
  
  closeActionsMenu() {
    this.isActionMenuOpen = false;
    this.songCarousel.inputEnabled = true;
    this.songCarousel.visible = true;
    if (this.actionsMenu) {
      this.actionsMenu.destroy();
      this.actionsMenu = null;
    }
  }

  update() {
    gamepad.update();
    
    if (gamepad.pressed.select) {
      Account.settings.autoplay = !Account.settings.autoplay;
    }
    
    this.autoplayText.write(Account.settings.autoplay ? "AUTOPLAY" : "");
    
    if (this.multiplayerScreen) {
      if (gamepad1.pressed.b) {
        if (this.multiplayerState.player1.ready) {
          this.multiplayerState.player1.ready = false;
          ENABLE_UI_SFX && Audio.play('ui_cancel');
        } else {
          this.multiplayerState.player1.ready = false;
          this.multiplayerState.player2.ready = false;
          this.multiplayerState.player2.joined = false;
        
          this.showGameModeSelection(this.multiplayerState.song, this.multiplayerState.difficultyIndex);
          this.multiplayerScreen.destroy();
          this.multiplayerScreen = null;
          
          ENABLE_UI_SFX && Audio.play('ui_cancel');
          return;
        }
      }
      
      if (gamepad2.pressed.b) {
        if (this.multiplayerState.player2.ready && this.multiplayerState.player2.joined) {
          this.multiplayerState.player2.ready = false;
          ENABLE_UI_SFX && Audio.play('ui_cancel');
        } else {
          this.multiplayerState.player1.ready = false;
          this.multiplayerState.player2.ready = false;
          this.multiplayerState.player2.joined = false;
        
          this.showGameModeSelection(this.multiplayerState.song, this.multiplayerState.difficultyIndex);
          this.multiplayerScreen.destroy();
          this.multiplayerScreen = null;
          
          ENABLE_UI_SFX && Audio.play('ui_cancel');
          return;
        }
      }
      
      if (!this.multiplayerState.player1.ready) this.windowManager1.update();
    
      if (this.multiplayerState.player2.joined && !this.multiplayerState.player2.ready) this.windowManager2.update();
      
      this.player1Frame.alpha = this.multiplayerState.player1.ready ? 0.2 : 1;
      this.player2Frame.alpha = this.multiplayerState.player2.ready ? 0.2 : 1;
      this.p1ReadyBackground.visible = this.multiplayerState.player1.ready;
      this.p2ReadyBackground.visible = this.multiplayerState.player2.ready;
      
      this.player2Frame.visible = this.multiplayerState.player2.joined;
      
      if (this.multiplayerState.player1.ready && this.multiplayerState.player2.ready) {
        this.startInstructionText.visible = true;
        
        if (gamepad.pressed.start) {
          this.startMultiplayer();
          ENABLE_UI_SFX && Audio.play('ui_select');
          
          return;
        }
      } else {
        this.startInstructionText.visible = false;
      }

      if (gamepad1.pressed.start) {
        this.multiplayerState.player1.ready = !this.multiplayerState.player1.ready;
        this.windowManager1.focus(this.player1Frame);
        gamepad.pressed.start = false;
        ENABLE_UI_SFX && Audio.play('ui_select');
      }
      
      if (this.multiplayerState.player2.joined && gamepad2.pressed.start) {
        this.multiplayerState.player2.ready = !this.multiplayerState.player2.ready;
        this.windowManager2.focus(this.player2Frame);
        this.player2Frame.playNavSound();
        gamepad.pressed.start = false;
        ENABLE_UI_SFX && Audio.play('ui_select');
      }
      
      if (!this.multiplayerState.player2.joined && gamepad2.pressed.start) {
        this.multiplayerState.player2.joined = true;
        this.playerJoinInstructionText.visible = false;
        this.windowManager2.focus(this.player2Frame);
        this.player2Frame.playNavSound();
        gamepad.pressed.start = false;
        ENABLE_UI_SFX && Audio.play('ui_select');
      }
    } else if (gamepad.pressed.start && !this.isActionMenuOpen && !this.actionsMenuBlocked) {
      this.showActionsMenu(this.playlistKey);
    }
  }
  
  shutdown() {
    if (this.previewAudio && typeof this.previewAudio.pause == 'function') {
      this.previewAudio.pause();
      this.previewAudio.src = "";
    }
    if (this.bannerImg) {
      this.bannerImg.onload = null;
      this.bannerImg.onerror = null;
      this.bannerImg.src = "";
    }
    if (this.visibilityChangeListener) {
      window.removeEventListener("visibilitychange", this.visibilityChangeListener);
    }
    
    gamepad.singlePlayerId = -1;
  }
}