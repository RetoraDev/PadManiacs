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
    
    this.showPlaylistList();
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
      const playlist = this.playlistManager.getPlaylist(key);
      const count = playlist.songs.length;
      this.carousel.addItem(`${playlist.name} (${count} songs)`, () => {
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
    const playlist = this.playlistManager.getPlaylist(key);
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
    
    const songs = playlist.songs;
    
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      const title = song.titleTranslit || song.title || `Song ${i + 1}`;
      this.carousel.addItem(`${i + 1}. ${title}`, () => {
        this.startSongSelect(key, songs, i);
      }, { 
        bgcolor: '#34495e', 
        song: song, 
        songIndex: i,
        playlistKey: key
      });
    }
    
    this.carousel.addItem("(Rename|Renombrar) playlist", () => {
      this.renamePlaylist(key);
    }, { bgcolor: '#34495e' });
    
    if (songs.length) {
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
    const playlist = this.playlistManager.getPlaylist(key);
    
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
        this.openPlaylist(key);
      },
      onCancel: () => {
        keyboard.destroy();
        this.openPlaylist(key);
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
      () => this.openPlaylist(key)
    );
  }

  startSongSelect(playlistKey, songs, songIndex) {
    game.state.start("SongSelect", true, false, 
      songs, 
      songIndex, 
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