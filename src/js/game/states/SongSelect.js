class SongSelect {
  init(songs, index, autoSelect, type = "auto") {
    this.type = type;
    
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
    
    if (this.startingIndex + 1 > this.songs.length) {
      this.startingIndex = 0;
    } 
  }
  
  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    
    new BackgroundGradient();
    
    this.selectedSong = null;
    this.selectedDifficulty = 0;
    
    // Stop any background music when entering song selection
    if (backgroundMusic) {
      backgroundMusic.stop();
    }
    
    this.previewAudio = document.createElement("audio");
    this.previewAudio.volume = [0,25,50,75,100][Account.settings.volume] / 100;
    
    this.bannerImg = document.createElement("img");
    
    this.previewCanvas = document.createElement("canvas");
    this.previewCtx = this.previewCanvas.getContext("2d");
    
    this.navigationHint = new NavigationHint(2);
    
    this.autoplayText = new Text(4, 104, "");
    
    this.bannerSprite = game.add.sprite(4, 4, null);

    this.metadataText = new Text(102, 4, "");
    
    this.highScoreText = new Text(104, 50, "");
    
    this.loadingDots = new LoadingDots();
    this.loadingDots.visible = false;
    
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
    const height = 72;

    this.songCarousel = new CarouselMenu(x, y, width, height, {
      bgcolor: "#9b59b6",
      fgcolor: "#ffffff",
      align: "left",
      animate: true,
      margin: { left: 2 }
    });

    // Add songs to carousel
    if (this.songs.length === 0) {
      this.songCarousel.addItem("No songs found", null);
    } else {
      this.songs.forEach((song, index) => {
        const title = song.titleTranslit || song.title;
        const displayText = title ? title : `Song ${index + 1}`;
        
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
        this.previewSong(item.data.song);
        
        
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
    
    this.previewCtx.clearRect(0, 0, 192, 112);
    this.bannerSprite.loadTexture(PIXI.Texture.fromCanvas(this.previewCanvas));
    
    if (song.bannerUrl) {
      if (!this.autoSelect) this.loadingDots.visible = true;
      this.bannerImg.src = song.bannerUrl;
      this.bannerImg.onload = () => {
        if (index == this.songCarousel.selectedIndex) this.loadingDots.visible = false;
        
        this.previewCtx.drawImage(this.bannerImg, 0, 0, 96, 32);
        
        const texture = PIXI.Texture.fromCanvas(this.previewCanvas);
        
        this.bannerSprite.loadTexture(texture);
      };
      this.bannerImg.onerror = () => this.loadingDots.visible = false;
    }
    
    this.metadataText.write(this.getMetadataText(song));
    this.metadataText.wrapPreserveNewlines(80);
    
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
        this.highScoreText.write("NO HIGH SCORES");
      }
      return;
    }
    
    let highScoreText = "HIGH SCORES:\n";
    
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
    if (artist) text += 'Artist: ' + artist + '\n';
    //if (genre) text += genre + '\n';
    if (credit) text += 'Credit: ' + credit;
    
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
    
    game.onMenuIn.dispatch('difficulty', this.songCarousel);
    
    // Add difficulties
    song.difficulties.sort((a, b) => a.rating - b.rating).forEach((diff, index) => {
      this.difficultyCarousel.addItem(
        `${diff.type} (${diff.rating})`,
        (item) => {
          this.startGame(song, index);
        },
        {
          difficulty: diff,
          index: index,
          bgcolor: this.getDifficultyColor(parseInt(diff.rating))
        }
      );
    });

    this.difficultyCarousel.onCancel.add(() => {
      this.createSongSelectionMenu();
    });
  }

  getDifficultyColor(value) {
    const max = 11; // The actual maximum considered difficulty
    
    // Ensure the value is within the range [0, max]
    value = Math.max(0, Math.min(max, value));

    // Extract the RGB components of the start and end colors
    var startColor = { r: 25, g: 210, b: 25 };
    var endColor = { r: 210, g: 0, b: 0 };

    // Interpolate between the start and end colors
    var r = Math.floor(startColor.r + (endColor.r - startColor.r) * (value / max));
    var g = Math.floor(startColor.g + (endColor.g - startColor.g) * (value / max));
    var b = Math.floor(startColor.b + (endColor.b - startColor.b) * (value / max));

    // Combine the RGB components into a single tint value
    const hexR = Phaser.Color.componentToHex(r);
    const hexG = Phaser.Color.componentToHex(g);
    const hexB = Phaser.Color.componentToHex(b);
    
    return `#${hexR}${hexG}${hexB}`;
  }

  startGame(song, difficultyIndex) {
    // Start gameplay with selected song
    game.state.start("Play", true, false, {
      chart: song,
      difficultyIndex
    });
  }

  update() {
    gamepad.update();
    
    if (this.songCarousel) {
      this.songCarousel.update();
    }
    
    if (this.difficultyCarousel) {
      this.difficultyCarousel.update();
    }
    
    if (gamepad.pressed.select) {
      Account.settings.autoplay = !Account.settings.autoplay;
    }
    
    this.autoplayText.write(Account.settings.autoplay ? "AUTOPLAY" : "");
  }
  
  shutdown() {
    this.previewAudio.pause();
    this.previewAudio.src = null;
    this.bannerImg.src = "";
    this.bannerImg = null;
    this.previewCanvas = null;
    this.previewCtx = null;
    window.removeEventListener("visibilitychange", this.visibilityChangeListener);
  }
}
