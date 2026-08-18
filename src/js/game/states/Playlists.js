class Playlists {
  create() {
    game.camera.fadeIn(0x000000);
    
    new BackgroundGradient(0, 0.3);
    new FuturisticLines();
    this.navigationHint = new NavigationHint('general');
    
    this.playlistManager = PlaylistManager.getInstance();
    
    this.actionText = new Text(8, 6, "PLAYLISTS", FONTS.bold_shadow);
    this.detailText = new Text(8, 6, "", FONTS.default_shadow);
    this.detailText.tint = 0x989898;
    
    // Check if external songs are loaded
    if (this._pendingExternalLoad) {
      this._pendingExternalLoad = false;
      this.loadExternalSongsThenProceed();
      return;
    }
    
    this.showPlaylistList();
  }

  loadExternalSongsThenProceed(callback) {
    if (window.externalSongs && window.externalSongs.length > 0) {
      callback?.();
      this.showPlaylistList();
      return;
    }
    
    this.confirmDialog(
      __("This playlist contains external songs. Load them now?||Esta playlist contiene canciones externas. ¿Cargarlas ahora?"),
      () => {
        // Save the state to return here after loading
        this._pendingReturn = true;
        game.state.start("LoadExternalSongs", true, false, "Playlists", []);
      },
      () => {
        // User canceled, show playlists without external songs
        this.showPlaylistList();
      }
    );
  }

  showPlaylistList() {
    if (this.carousel) this.carousel.destroy();
    
    this.carousel = new CarouselMenu(0, 16, game.width - 8, game.height - 24, {
      bgcolor: '#9b59b6',
      fgcolor: '#ffffff',
      gradient: false,
      animate: true
    });
    
    const keys = this.playlistManager.getPlaylistNames();
    
    for (const key of keys) {
      const playlist = this.playlistManager.getPlaylistRef(key);
      const count = playlist.songs.length;
      const hasExternal = this.playlistManager.hasExternalSongs(key);
      const label = hasExternal ? `${playlist.name} (${count} songs) *` : `${playlist.name} (${count} songs)`;
      this.carousel.addItem(label, () => {
        this.openPlaylist(key);
      }, { playlistKey: key });
    }
    
    this.carousel.addItem("+ (Add|Añadir) Playlist", () => this.addPlaylist(), { bgcolor: '#2c3e50' });
    this.carousel.addItem("< (Back|Volver)", () => game.state.start("MainMenu"), { bgcolor: '#2c3e50' });
    
    this.carousel.onCancel.add(() => game.state.start("MainMenu"));
    this.actionText.write("PLAYLISTS");
    this.detailText.write("");
  }

  addPlaylist() {
    const keyboard = new OnScreenKeyboard(undefined, 55);
    
    window.focusedElement = new TextInput({
      text: __("(My|Mi) Playlist"),
      width: 12,
      maxLength: 20,
      useNewline: false,
      onConfirm: (name) => {
        if (name.trim()) {
          const key = this.playlistManager.createPlaylist(name.trim());
          if (key) {
            notifications.show(__(`( |¡)Playlist "${name}" (created|creada)!`));
          } else {
            notifications.show(__("Playlist already exists!||La playlist ya existe"));
          }
        } else {
          notifications.show(__("Name cannot be empty!||El nombre no puede ir vacio"));
        }
        keyboard.destroy();
        this.showPlaylistList();
      },
      onCancel: () => {
        keyboard.destroy();
        this.showPlaylistList();
      }
    });
  }

  openPlaylist(key) {
    const playlistRef = this.playlistManager.getPlaylistRef(key);
    if (!playlistRef) return;
    
    // Check if external songs need to be loaded
    if (this.playlistManager.hasExternalSongs(key) && (!window.externalSongs || window.externalSongs.length === 0)) {
      this.confirmDialog(
        __("This playlist contains external songs. Load them now?||Esta playlist contiene canciones externas. ¿Cargarlas ahora?"),
        () => {
          this._pendingPlaylistKey = key;
          this._pendingReturn = true;
          game.state.start("LoadExternalSongs", true, false, "Playlists", []);
        },
        () => {
          // Still show playlist but with missing songs marked
          this.openPlaylistWithRefs(key);
        }
      );
      return;
    }
    
    this.openPlaylistWithRefs(key);
  }

  openPlaylistWithRefs(key) {
    const playlist = this.playlistManager.getPlaylistRef(key);
    if (!playlist) return;
    
    if (this.carousel) this.carousel.destroy();
    
    this.currentPlaylistKey = key;
    this.actionText.write(playlist.name);
    this.detailText.x = this.actionText.right + 4;
    this.detailText.write(`(${playlist.songs.length} ${__("songs||canciones")})`);
    
    this.carousel = new CarouselMenu(0, 16, game.width - 8, game.height - 24, {
      bgcolor: '#2c3e50',
      fgcolor: '#ffffff',
      gradient: false,
      animate: true,
      itemHeight: 9
    });
    
    const songRefs = playlist.songs;
    
    for (let i = 0; i < songRefs.length; i++) {
      const songRef = songRefs[i];
      const fullSong = this.playlistManager.restoreFullSong(songRef);
      const isMissing = fullSong.missing === true;
      const title = isMissing ? `⚠ ${songRef.title || 'Missing song'}` : (songRef.titleTranslit || songRef.title || `Song ${i + 1}`);
      
      this.carousel.addItem(`${i + 1}. ${title}`, () => {
        if (isMissing) {
          notifications.show(__("Song not found! Load external songs first.||¡Canción no encontrada! Carga canciones externas primero."));
          return;
        }
        this.startSongSelect(key, songRefs, i);
      }, { 
        bgcolor: isMissing ? '#8e44ad' : '#34495e', 
        songRef: songRef, 
        songIndex: i,
        playlistKey: key,
        isMissing: isMissing
      });
    }
    
    this.carousel.addItem("(Rename|Renombrar) playlist", () => {
      this.renamePlaylist(key);
    }, { bgcolor: '#34495e' });
    
    if (songRefs.length) {
      this.carousel.addItem("(Clear|Limpiar) playlist", () => {
        this.clearPlaylist(key);
      }, { bgcolor: '#c0392b' });
    }
    
    this.carousel.addItem("(Delete|Borrar) playlist", () => {
      this.deletePlaylist(key);
    }, { bgcolor: '#e74c3c' });
    
    this.carousel.addItem("< Back", () => this.showPlaylistList());
    this.carousel.onCancel.add(() => this.showPlaylistList());
  }
  
  renamePlaylist(key) {
    const playlist = this.playlistManager.getPlaylistRef(key);
    
    if (!playlist) {
      this.showPlaylistList();
      return;
    }
    
    const keyboard = new OnScreenKeyboard(undefined, 55);
    
    window.focusedElement = new TextInput({
      text: playlist.name,
      width: 12,
      maxLength: 20,
      useNewline: false,
      onConfirm: (name) => {
        if (name.trim()) {
          this.playlistManager.renamePlaylist(key, name);
          notifications.show(__("Playlist (renamed|renombrada)"));
        } else {
          notifications.show(__("Name cannot be empty!||El nombre no puede ir vacio"));
        }
        keyboard.destroy();
        this.openPlaylistWithRefs(key);
      },
      onCancel: () => {
        keyboard.destroy();
        this.openPlaylistWithRefs(key);
      }
    });
  }

  deletePlaylist(key) {
    this.confirmDialog(
      __("Delete this playlist permanently?||¿Borrar playlist para siempre?"),
      () => {
        this.playlistManager.deletePlaylist(key);
        notifications.show(__("Playlist (deleted|borrada)!"));
        this.showPlaylistList();
      },
      () => this.openPlaylistWithRefs(key)
    );
  }

  startSongSelect(playlistKey, songRefs, songIndex) {
    // Only convert refs to full songs for the ones we need (just the current view)
    const songs = songRefs.map(ref => this.playlistManager.restoreFullSong(ref));
    // Filter out missing songs
    const validSongs = songs.filter(s => !s.missing);
    // Find the index of the selected song in the filtered list
    const selectedSong = songs[songIndex];
    const newIndex = validSongs.findIndex(s => s.audioUrl === selectedSong?.audioUrl);
    
    game.state.start("SongSelect", true, false, 
      validSongs, 
      Math.max(0, newIndex), 
      false, 
      "auto",
      playlistKey
    );
  }

  confirmDialog(message, onConfirm, onCancel) {
    const dialog = new DialogWindow(message, {
      buttons: [__("Yes||Sí"), "No"],
      defaultButton: 1
    });
    dialog.onConfirm.add((buttonIndex) => {
      if (buttonIndex === 0) onConfirm();
      else onCancel();
      dialog.destroy();
    });
    dialog.onCancel.add(() => {
      onCancel();
      dialog.destroy();
    });
  }

  update() {
    gamepad.update();
  }
}