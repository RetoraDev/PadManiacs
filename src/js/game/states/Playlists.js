class Playlists {
  create() {
    game.camera.fadeIn(0x000000);
    
    new BackgroundGradient();
    new FuturisticLines();
    this.navigationHint = new NavigationHint('general');
    
    this.playlistManager = PlaylistManager.getInstance();
    this.actionText = new Text(4, 4, "PLAYLISTS", FONTS.default);
    
    this.showPlaylistList();
  }

  showPlaylistList() {
    if (this.carousel) this.carousel.destroy();
    
    this.carousel = new CarouselMenu(0, 16, game.width, game.height - 24, {
      bgcolor: '#9b59b6',
      fgcolor: '#ffffff',
      align: 'left',
      animate: true
    });
    
    const keys = this.playlistManager.getPlaylistNames();
    
    for (const key of keys) {
      const playlist = this.playlistManager.getPlaylist(key);
      const count = playlist.songs.length;
      this.carousel.addItem(`${playlist.name} (${count} songs)`, () => {
        this.openPlaylist(key);
      }, { bgcolor: '#2c3e50', playlistKey: key });
    }
    
    this.carousel.addItem("+ Add Playlist", () => this.addPlaylist());
    this.carousel.addItem("< Back", () => game.state.start("MainMenu"));
    
    this.carousel.onCancel.add(() => game.state.start("MainMenu"));
    this.actionText.write("PLAYLISTS");
  }

  addPlaylist() {
    const keyboard = new OnScreenKeyboard(undefined, 55);
    
    window.focusedElement = new TextInput({
      text: "My Playlist",
      maxLength: 20,
      useNewline: false,
      onConfirm: (name) => {
        if (name.trim()) {
          const key = this.playlistManager.createPlaylist(name.trim());
          if (key) {
            notifications.show(`Playlist "${name}" created!`);
            keyboard.destroy();
            this.showPlaylistList();
          } else {
            notifications.show("Playlist already exists!");
          }
        } else {
          notifications.show("Name cannot be empty!");
        }
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
    this.actionText.write(`${playlist.name} (${playlist.songs.length} songs)`);
    
    this.carousel = new CarouselMenu(0, 16, game.width, game.height - 24, {
      bgcolor: '#2c3e50',
      fgcolor: '#ffffff',
      align: 'left',
      animate: true
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
    
    if (songs.length) {
      this.carousel.addItem("× Clear playlist", () => {
        this.clearPlaylist(key);
      }, { bgcolor: '#c0392b' });
    }
    
    this.carousel.addItem("× Delete playlist", () => {
      this.deletePlaylist(key);
    }, { bgcolor: '#e74c3c' });
    
    this.carousel.addItem("< Back", () => this.showPlaylistList());
    this.carousel.onCancel.add(() => this.showPlaylistList());
  }

  removeFromPlaylist(key) {
    const playlist = this.playlistManager.getPlaylist(key);
    if (!playlist || playlist.songs.length === 0) return;
    
    const songs = playlist.songs;
    const removeCarousel = new CarouselMenu(0, 36, game.width, game.height - 48, {
      bgcolor: '#8e44ad',
      fgcolor: '#ffffff',
      align: 'left',
      animate: true
    });
    
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      const title = song.titleTranslit || song.title || `Song ${i + 1}`;
      removeCarousel.addItem(`× ${title}`, () => {
        this.playlistManager.removeSong(key, i);
        notifications.show(`Removed "${title}" from playlist`);
        this.openPlaylist(key);
      }, { bgcolor: '#c0392b' });
    }
    
    removeCarousel.addItem("< Back", () => this.openPlaylist(key));
    removeCarousel.onCancel.add(() => this.openPlaylist(key));
    
    // Replace carousel
    if (this.carousel) this.carousel.destroy();
    this.carousel = removeCarousel;
    this.actionText.write("Select song to remove");
  }

  clearPlaylist(key) {
    this.confirmDialog(
      "Remove all songs from this playlist?",
      () => {
        const playlist = this.playlistManager.getPlaylist(key);
        if (playlist) {
          playlist.songs = [];
          playlist.updatedAt = Date.now();
          this.playlistManager.save();
          notifications.show("Playlist cleared!");
          this.openPlaylist(key);
        }
      },
      () => this.openPlaylist(key)
    );
  }

  deletePlaylist(key) {
    this.confirmDialog(
      "Delete this playlist permanently?",
      () => {
        this.playlistManager.deletePlaylist(key);
        notifications.show("Playlist deleted!");
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
      buttons: ["Yes", "No"],
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