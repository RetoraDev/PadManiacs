class Editor {
  init(song = null) {
    this.song = song || this.createNewSong();
    this.initializedWithSong = song ? true : false;
    this.currentScreen = "metadata";
    this.currentDifficultyIndex = 0;
    this.snapDivision = 8;
    this.cursorBeat = 0;
    this.cursorColumn = 0;
    this.selectedNotes = [];
    this.isAreaSelecting = false;
    this.areaSelectStart = { beat: 0, column: 0 };
    this.holdAStartTime = 0;
    this.holdBStartTime = 0;
    this.holdADirectionTime = 0;
    this.holdSelectStartTime = 0;
    this.lastSeekTime = 0;
    this.seekCooldown = 72;
    this.isPlaying = false;
    this.isPlayingPreview = false;
    this.previewEndHandler = null;
    this.previewEndTimeoutId = null;
    this.menuVisible = false;
    this.playStartTime = 0;
    this.playOffset = 0;
    this.menuVisible = false;
    this.freezePreview = null;
    this.clipboard = [];

    this.files = {
      audio: null,
      background: null,
      banner: null,
      lyrics: null,
      extra: {}
    };
    
    // For debugging
    window.e = this;

    this.divisions = [1, 2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 192];

    // File input element
    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
  }

  create() {
    game.camera.fadeIn(0x000000);

    new BackgroundGradient();

    // Background elements
    this.backgroundLayer = game.add.group();
    this.backgroundSprite = game.add.sprite(0, 0, null, 0, this.backgroundLayer);
    this.backgroundSprite.alpha = 0.3;
    
    this.chartRenderer = new ChartRenderer(this, this.song, this.currentDifficultyIndex, {
      enableGameplayLogic: false,
      enableJudgement: false,
      enableInput: false,
      enableHealth: false,
      enableMissChecking: false,
      enableReceptors: true,
      enableBeatLines: true,
      enableSpeedRendering: true,
      enableBGRendering: true,
      judgeLineYFalling: 70,
      judgeLineYRising: 50
    });

    this.homeOverlay = game.add.graphics(0, 0);
    this.homeOverlay.beginFill(0x000000, 0.5);
    this.homeOverlay.drawRect(0, 0, game.width, game.height);
    this.homeOverlay.endFill();
    this.homeOverlay.visible = false;

    this.navigationHint = new NavigationHint(0);

    this.cursorSprite = game.add.graphics(0, 0);
    this.selectionRect = game.add.graphics(0, 0);
    this.freezePreviewSprite = game.add.graphics(0, 0);
    this.updateCursorPosition();
    
    this.lyricsText = new Text(game.width / 2, 85, "", FONTS.stroke);
    this.lyricsText.anchor.set(0.5);
    this.lyricsText.visible = false;
    
    this.bannerSprite = game.add.sprite(8, 56, null);
    
    this.icons = game.add.sprite(8, 90);
    
    this.audioIcon = game.add.sprite(0, 0, "ui_editor_icons", 0);
    this.bgIcon = game.add.sprite(9, 0, "ui_editor_icons", 1);
    this.bnIcon = game.add.sprite(9 + 9, 0, "ui_editor_icons", 2);
    this.lrcIcon = game.add.sprite(9 + 9 + 9, 0, "ui_editor_icons", 3);
    this.extraIcon = game.add.sprite(9 + 9 + 9 + 9, 0, "ui_editor_icons", 4);

    this.icons.addChild(this.audioIcon);
    this.icons.addChild(this.bgIcon);
    this.icons.addChild(this.bnIcon);
    this.icons.addChild(this.lrcIcon);
    this.icons.addChild(this.extraIcon);

    this.infoText = new Text(4, 4, "");
    this.bgInfoText = new Text(0, 90, "", null, this.infoText);
    
    this.updateInfoText();
    
    // Create play/pause audio
    this.audio = document.createElement("audio");
    if (this.song.chart.audioUrl) {
      this.audio.src = this.song.chart.audioUrl;
    }

    this.initalSetup();

    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  async initalSetup() {
    if (this.initializedWithSong) {
      this.showLoadingScreen("Setting up");
      this.files.audio = await FileTools.urlToBase64(this.song.chart.audioUrl);
      this.files.banner = await FileTools.urlToBase64(this.song.chart.bannerUrl);
      this.files.background = await FileTools.urlToBase64(this.song.chart.backgroundUrl);
      this.files.lyrics = this.song.chart.lyricsContent;
      this.song.chart.backgrounds.forEach(async bg => {
        if (bg.file != "" && bg.file != "-nosongbg-") {
          const fileContent = await FileTools.urlToBase64(bg.url);
          if (fileContent && fileContent != "") this.files.extra[bg.file] = fileContent;
        }
      });
      this.updateBanner(this.song.chart.bannerUrl);
      this.updateBackground(this.song.chart.backgroundUrl);
      this.refreshLyrics();
      this.hideLoadingScreen();
    }
    this.showHomeScreen();
  }

  createNewSong() {
    return {
      chart: {
        title: "New Song",
        subtitle: "",
        artist: "Unknown Artist",
        titleTranslit: "",
        subtitleTranslit: "",
        artistTranslit: "",
        genre: "",
        credit: "",
        banner: "no-media",
        bannerUrl: "",
        background: "no-media",
        backgroundUrl: "",
        lyrics: "",
        lyricsContent: null,
        cdtitle: "no-media",
        cdtitleUrl: "",
        audio: "",
        audioUrl: "",
        offset: 0,
        sampleStart: 0,
        sampleLength: 10,
        difficulties: [{ type: "Beginner", rating: "1" }],
        notes: { Beginner1: [] },
        bpmChanges: [{ beat: 0, bpm: 120, sec: 0 }],
        stops: [],
        backgrounds: [],
        videoUrl: null
      }
    };
  }

  showHomeScreen() {
    this.currentScreen = "metadata";
    this.clearUI();
    this.stopPlayback();
    this.navigationHint.change(0);
    this.homeOverlay.visible = true;
    this.bannerSprite.visible = true;
    
    const leftWidth = game.width / 2;
    const rightWidth = game.width / 2;

    // Left side: Main menu
    this.mainCarousel = new CarouselMenu(0, 0, leftWidth, game.height / 2, {
      align: "left",
      bgcolor: "#9b59b6",
      fgcolor: "#ffffff",
      animate: true
    });

    this.mainCarousel.addItem("File", () => this.showFileMenu());
    this.mainCarousel.addItem("Edit", () => this.showEditMenu());
    this.mainCarousel.addItem("Playtest", () => this.playtest());
    this.mainCarousel.addItem("Export", () => this.showExportMenu());
    this.mainCarousel.addItem("< Exit", () => this.exitEditor());

    this.mainCarousel.onCancel.add(() => this.exitEditor());

    game.onMenuIn.dispatch("editorMain", this.mainCarousel);

    // Right side: Song info
    this.songInfoText = new Text(leftWidth + 4, 4, this.getSongInfoText());
    this.songInfoText.wrapPreserveNewlines(rightWidth - 8);

    this.updateInfoText();
  }
  
  updateBanner(url = null) {
    if (url && url !== "no-media") {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 86;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 86, 32);
        const texture = PIXI.Texture.fromCanvas(canvas);
        this.bannerSprite.loadTexture(texture);
        this.bannerSprite.bringToTop();
      };
      img.src = url;
    }
  }
  
  updateBackground(url = null) {
    if (url && url !== "no-media") {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 192;
        canvas.height = 112;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 192, 112);
        const texture = PIXI.Texture.fromCanvas(canvas);
        this.backgroundSprite.loadTexture(texture);
      };
      img.src = url;
    } else {
      this.backgroundSprite.loadTexture(null);
    }
  }
  
  refreshLyrics() {
    this.lyrics = new Lyrics({
      textElement: this.lyricsText,
      maxLineLength: 25,
      lrc: this.files.lyrics || this.song.chart.lyricsContent || ""
    });
  }

  showFileMenu() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#3498db",
      fgcolor: "#ffffff",
      animate: true
    });

    carousel.addItem("Load Audio", () => this.pickFile("audio/*", e => this.loadAudioFile(e.target.files[0]), () => this.showFileMenu()));
    carousel.addItem("Load Background", () => this.pickFile("image/*", e => this.loadBackgroundFile(e.target.files[0]), () => this.showFileMenu()));
    carousel.addItem("Load Banner", () => this.pickFile("image/*", e => this.loadBannerFile(e.target.files[0]), () => this.showFileMenu()));
    carousel.addItem("Load Lyrics", () => this.pickFile(".lrc", e => this.loadLyricsFile(e.target.files[0]), () => this.showFileMenu()));
    if (this.song.chart.backgrounds && this.song.chart.backgrounds.length > 0) {
      carousel.addItem("Edit BG Changes", () => this.editBGChangeFiles());
    }
    carousel.addItem("New Song", () => this.createNewSongAndReload());
    carousel.addItem("Load Song", () => this.loadSong());

    game.onMenuIn.dispatch("editorFile", carousel);

    carousel.addItem("< Back", () => this.showHomeScreen());
    carousel.onCancel.add(() => this.showHomeScreen());
  }
  
  pickFolder(accept = "*", onConfirm, onCancel) {
    this.fileInput.accept = accept;
    this.fileInput.webkitdirectory = true;
    this.fileInput.multiple = true;

    this.fileInput.onchange = (e) => {
      onConfirm?.(e);
      this.fileInput.value = "";
    };

    this.fileInput.oncancel = (e) => {
      onCancel?.(e);
      this.fileInput.value = "";
    };

    this.fileInput.click();
  }
  
  pickFile(accept = "*", onConfirm, onCancel) {
    this.fileInput.accept = accept;
    this.fileInput.webkitdirectory = false;
    this.fileInput.multiple = false;

    this.fileInput.onchange = (e) => {
      onConfirm?.(e);
      this.fileInput.value = "";
    };

    this.fileInput.oncancel = (e) => {
      onCancel?.(e);
      this.fileInput.value = "";
    };

    this.fileInput.click();
  }
  
  showLoadingScreen(text) {
    // Destroy any existing loading screen
    if (this.loadingScreen) {
      this.loadingScreen.destroy();
    }
    
    // Create a new loading screen
    this.loadingScreen = game.add.graphics(0, 0);
    this.loadingScreen.beginFill(0x000000, 1);
    this.loadingScreen.drawRect(0, 0, game.width, game.height);
    this.loadingScreen.endFill();

    // Create loading screen conteng
    this.loadingDots = new LoadingDots();
    this.loadingScreen.addChild(this.loadingDots);
    
    this.progressText = new ProgressText(text);
    this.loadingScreen.addChild(this.progressText);
  }
  
  hideLoadingScreen() {
    this.loadingScreen?.destroy();
  }
  
  loadSong() {
    this.pickFolder("*", e => this.processFiles(e.target.files), e => this.showFileMenu());
    
    Account.stats.totalImportedSongs ++;
  }

  readTextFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  showEditMenu() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#e67e22",
      fgcolor: "#ffffff",
      animate: true
    });

    carousel.addItem("Charts", () => this.showChartsMenu());
    carousel.addItem("Metadata", () => this.showMetadataEdit());

    game.onMenuIn.dispatch("editorEdit", carousel);

    carousel.addItem("< Back", () => this.showHomeScreen());
    carousel.onCancel.add(() => this.showHomeScreen());
  }

  showExportMenu() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#e67e22",
      fgcolor: "#ffffff",
      animate: true
    });

    carousel.addItem("Export StepMania Song", () => this.exportSong());

    game.onMenuIn.dispatch("editorProject", carousel);

    carousel.addItem("< Back", () => this.showHomeScreen());
    carousel.onCancel.add(() => this.showHomeScreen());
  }

  showChartsMenu() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#2ecc71",
      fgcolor: "#ffffff",
      animate: true
    });

    this.song.chart.difficulties.forEach((diff, index) => {
      const noteCount = this.song.chart.notes[diff.type + diff.rating]?.length || 0;
      carousel.addItem(`${diff.type} (${diff.rating}) - ${noteCount} notes`, () => this.showChartOptions(index), { difficulty: diff, index: index });
    });

    carousel.addItem("+ Add Difficulty", () => this.addNewDifficulty());

    game.onMenuIn.dispatch("editorCharts", carousel);

    carousel.addItem("< Back", () => this.showEditMenu());
    carousel.onCancel.add(() => this.showEditMenu());
  }

  showChartOptions(difficultyIndex) {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#f39c12",
      fgcolor: "#ffffff",
      animate: true
    });

    carousel.addItem("Edit Chart", () => this.editChart(difficultyIndex));
    carousel.addItem("Set Difficulty Type", () => this.setDifficultyType(difficultyIndex));
    carousel.addItem("Set Difficulty Rating", () => this.setDifficultyRating(difficultyIndex));
    carousel.addItem("Delete Difficulty", () => this.deleteDifficulty(difficultyIndex));

    game.onMenuIn.dispatch("editorChartOptions", carousel);

    carousel.addItem("< Back", () => this.showChartsMenu());
    carousel.onCancel.add(() => this.showChartsMenu());
  }

  editChart(difficultyIndex) {
    this.currentScreen = "chartEdit";
    this.currentDifficultyIndex = difficultyIndex;
    this.selectedNotes = [];
    this.clearUI();
    this.stopPlayback();
    this.homeOverlay.visible = false;
    this.bannerSprite.visible = false;
    this.navigationHint.change(7);

    this.chartRenderer.load(this.song, this.currentDifficultyIndex);

    this.updateInfoText();
  }
  
  playtest() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#2ecc71",
      fgcolor: "#ffffff",
      animate: true
    });

    this.song.chart.difficulties.forEach((diff, index) => {
      const noteCount = this.song.chart.notes[diff.type + diff.rating]?.length || 0;
      carousel.addItem(`${diff.type} (${diff.rating}) - ${noteCount} notes`, () => this.startPlaytest(index), { difficulty: diff, index: index });
    });

    game.onMenuIn.dispatch("editorPlaytest", carousel);

    carousel.addItem("< Back", () => this.showHomeScreen());
    carousel.onCancel.add(() => this.showHomeScreen());
  }
  
  startPlaytest(difficultyIndex) {
    // Clean up any note sprites before switching to play state
    this.getCurrentChartNotes().forEach(note => this.chartRenderer.killNote(note));

    game.state.start(
      "Play",
      true,
      false,
      {
        chart: this.song.chart,
        difficultyIndex
      },
      0,
      true
    );
  }

  updateInfoText() {
    if (this.currentScreen === "chartEdit") {
      const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
      const noteCount = this.song.chart.notes[diff.type + diff.rating]?.length || 0;
      const currentTime = this.audio.currentTime;
      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60);
      const formatedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      const currentBpm = this.chartRenderer ? this.chartRenderer.getCurrentBPM(this.cursorBeat) : "---";

      const text = this.isPlaying
        ?
          "Playing\n" +
          `TIME: ${formatedTime}\n` +
          `BEAT: ${this.cursorBeat.toFixed(0)}\n` +
          `BPM: ${currentBpm}`
        :
          `EDITING: ${diff.type} (${diff.rating})\n` +
          `SNAP: 1/${this.snapDivision}\n` +
          `TIME: ${formatedTime}\n` +
          `BEAT: ${this.cursorBeat.toFixed(3)}\n` +
          `BPM: ${currentBpm}\n` +
          `NOTES: ${noteCount}\n` +
          `SELECTED: ${this.selectedNotes.length}`;
      
      const bgText = `BG: ${this.getCurrentBgFileName()}`;
      
      if (text != this.infoText.texture.text) this.infoText.write(text);
      if (bgText != this.bgInfoText.texture.text) this.bgInfoText.write(bgText, 45);
      
      this.infoText.visible = true;
    } else {
      this.infoText.visible = false;
      
      if (this.songInfoText) {
        this.songInfoText.write(this.getSongInfoText());
      }
    }
  }
  
  getCurrentBgFileName() {
    let filename = this.song.chart.background;
    
    const queue = [];
    
    // Check for background(s) needed for this beat
    this.song.chart.backgrounds.forEach(bg => {
      if (this.cursorBeat >= bg.beat) {
        queue.push(bg.file);
      }
    });
    
    return queue.pop() || filename;
  }

  updateCursorPosition() {
    this.cursorSprite.clear();

    if (!this.isAreaSelecting) {
      const leftOffset = this.chartRenderer.calculateLeftOffset();
      const x = leftOffset + this.cursorColumn * (this.chartRenderer.COLUMN_SIZE + this.chartRenderer.COLUMN_SEPARATION);
      const y = this.chartRenderer.JUDGE_LINE;

      this.cursorSprite.lineStyle(1, 0xffffff, 0.5);
      this.cursorSprite.drawRect(x, y - this.chartRenderer.COLUMN_SIZE / 2, this.chartRenderer.COLUMN_SIZE, this.chartRenderer.COLUMN_SIZE);

      this.cursorSprite.endFill();
    }
  }

  updateSelectionRect() {
    this.selectionRect.clear();

    if (this.isAreaSelecting) {
      const leftOffset = this.chartRenderer.calculateLeftOffset();
      const startX = leftOffset + this.areaSelectStart.column * (this.chartRenderer.COLUMN_SIZE + this.chartRenderer.COLUMN_SEPARATION);
      const endX = leftOffset + this.cursorColumn * (this.chartRenderer.COLUMN_SIZE + this.chartRenderer.COLUMN_SEPARATION);

      const startY = this.chartRenderer.getYPos(this.getCurrentTime().now, this.getCurrentTime().beat, this.areaSelectStart.beat);
      const endY = this.chartRenderer.getYPos(this.getCurrentTime().now, this.getCurrentTime().beat, this.cursorBeat);

      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const width = Math.abs(endX - startX) + this.chartRenderer.COLUMN_SIZE;
      const height = Math.abs(endY - startY);

      this.selectionRect.lineStyle(1, 0x00ffff, 0.8);
      this.selectionRect.drawRect(x, y, width, height);
      this.selectionRect.endFill();
    }
  }

  updateFreezePreview() {
    this.freezePreviewSprite.clear();

    if (!this.isPlaying && gamepad.held.b && this.holdBStartTime !== null) {
      const currentBeat = this.getCurrentTime().beat;
      const startBeat = this.holdBStartTime;
      const duration = currentBeat - startBeat;

      if (Math.abs(duration) > 0.001) {
        const leftOffset = this.chartRenderer.calculateLeftOffset();
        const x = leftOffset + this.cursorColumn * (this.chartRenderer.COLUMN_SIZE + this.chartRenderer.COLUMN_SEPARATION);

        const startY = this.chartRenderer.getYPos(this.getCurrentTime().now, this.getCurrentTime().beat, startBeat);
        const endY = this.chartRenderer.getYPos(this.getCurrentTime().now, this.getCurrentTime().beat, currentBeat);

        const y = Math.min(startY, endY);
        const height = Math.abs(endY - startY);

        const alpha = 0.8 + 0.2 * Math.sin(Date.now() * 0.01);

        this.freezePreviewSprite.lineStyle(4, 0x00ff00, alpha);
        this.freezePreviewSprite.drawRect(x, y, this.chartRenderer.COLUMN_SIZE, height);
        this.freezePreviewSprite.endFill();
      }
    }
  }

  getDivisionSize() {
    return 4 / this.snapDivision;
  }

  getSnappedBeat(beat) {
    const snapped = Phaser.Math.snapToFloor(beat, this.getDivisionSize());
    return Math.max(0, snapped);
  }

  getCurrentTime() {
    const offset = (this.song.chart.offset || 0) + (Account.settings.userOffset || 0);
    if (this.isPlaying) {
      const currentTime = (game.time.now - this.playStartTime) / 1000 + this.playOffset + offset;
      const currentBeat = this.chartRenderer.secToBeat(currentTime);
      return {
        now: currentTime,
        beat: currentBeat
      };
    } else {
      const currentTime = this.chartRenderer.beatToSec(this.cursorBeat) + offset;
      return {
        now: currentTime,
        beat: this.cursorBeat
      };
    }
  }

  handleChartEditInput() {
    if (this.menuVisible) return;

    const { now, beat } = this.getCurrentTime();

    // Handle A button - selection
    if (gamepad.pressed.a) {
      this.holdAStartTime = game.time.now;
      this.startSingleSelect();
    }

    if (gamepad.released.a) {
      const holdDuration = game.time.now - this.holdAStartTime;

      if (holdDuration < 300 && !this.isAreaSelecting) {
        // Single tap - toggle selection
        this.toggleNoteSelection();
      } else if (this.isAreaSelecting) {
        // End area selection
        this.endAreaSelection();
      }
    }

    // Handle B button - placement
    if (gamepad.pressed.b) {
      this.holdBStartTime = beat;
    }

    if (gamepad.released.b) {
      const holdDuration = beat - this.holdBStartTime;

      if (Math.abs(holdDuration) == 0) {
        // Single tap - place note
        this.placeNote(this.cursorColumn, this.cursorBeat);
      } else {
        // Long press - place freeze
        const freezeStart = holdDuration > 0 ? this.holdBStartTime : this.holdBStartTime + holdDuration;

        this.placeFreeze(this.cursorColumn, freezeStart, Math.abs(holdDuration));
      }
    }

    if (gamepad.held.a && (gamepad.pressed.up || gamepad.pressed.down)) {
      if (!this.isAreaSelecting) {
        this.startAreaSelection();
      }
    } else if (gamepad.held.a && (gamepad.pressed.left || gamepad.pressed.right)) {
      if (!this.isAreaSelecting) {
        this.changeSnapDivision(gamepad.pressed.left ? -1 : 1);
        this.holdADirectionTime = game.time.now;
      } else {
        if (gamepad.pressed.left) {
          this.moveCursor(-1, 0);
        }
        if (gamepad.pressed.right) {
          this.moveCursor(1, 0);
        }
      }
    } else {
      if (gamepad.pressed.left) {
        this.moveCursor(-1, 0);
      }
      if (gamepad.pressed.right) {
        this.moveCursor(1, 0);
      }
    }

    // Handle cursor movement
    if (game.time.now - this.lastSeekTime > this.seekCooldown) {
      if (gamepad.held.up) {
        this.moveCursor(0, -this.getDivisionSize() * this.chartRenderer.DIRECTION);
        this.lastSeekTime = game.time.now;
      }
      if (gamepad.held.down) {
        this.moveCursor(0, this.getDivisionSize() * this.chartRenderer.DIRECTION);
        this.lastSeekTime = game.time.now;
      }
    }

    // Toggle playback with SELECT
    if (gamepad.pressed.select && !gamepad.held.start) {
      this.togglePlayback();
    }

    // Handle context menu with START
    if (gamepad.pressed.start && !gamepad.held.select) {
      this.showContextMenu();
    }

    // Update visuals
    this.updateSelectionRect();
    this.updateFreezePreview();
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
    this.updateInfoText();
  }

  startPlayback() {
    this.isPlaying = true;
    this.playStartTime = game.time.now;
    this.playOffset = this.chartRenderer.beatToSec(this.cursorBeat);
    this.navigationHint.visible = false;

    this.getCurrentChartNotes().forEach(note => (note.hitEffectShown = false));

    if (this.audio && this.audio.src) {
      if (this.previewEndTimeoutId) clearTimeout(this.previewEndTimeoutId);
      this.audio.currentTime = this.playOffset;
      this.audio.play();
    }
  }

  stopPlayback() {
    this.isPlaying = false;
    this.navigationHint.visible = true;

    if (this.audio && this.audio.src) {
      this.audio.pause();
    }

    // Snap cursor to current position
    if (this.playStartTime > 0) {
      this.snapCursor();
      this.updateCursorPosition();
    }
    this.playStartTime = 0;
  }

  abortPreview() {
    if (this.previewEndHandler && this.previewEndTimeoutId) {
      clearTimeout(this.previewEndTimeoutId);
      this.previewEndHandler();
      this.previewEndHandler = null;
      this.previewEndTimeoutId = null;
    }
  }

  playPreview(start, length) {
    if (!this.isPlaying && this.audio && this.audio.src) {
      this.abortPreview();

      this.audio.currentTime = start;

      this.previewEndHandler = () => {
        this.audio.pause();
        this.audio.currentTime = start;
      };

      this.audio.play().then(() => {
        this.previewEndTimeoutId = setTimeout(this.previewEndHandler, length * 1000);
      });
    }
  }

  snapCursor(beat) {
    this.cursorBeat = this.getSnappedBeat(beat || this.cursorBeat);
  }

  moveCursor(deltaX, deltaBeat) {
    this.cursorColumn = Phaser.Math.clamp(this.cursorColumn + deltaX, 0, 3);

    if (deltaBeat !== 0) {
      this.cursorBeat += deltaBeat;
      this.snapCursor();
    }

    this.chartRenderer.cleanupAllLines();
    this.updateCursorPosition();
    this.updateInfoText();
  }

  startSingleSelect() {
    this.isAreaSelecting = false;
  }

  startAreaSelection() {
    this.isAreaSelecting = true;
    this.areaSelectStart.beat = this.cursorBeat;
    this.areaSelectStart.column = this.cursorColumn;
  }

  endAreaSelection() {
    this.isAreaSelecting = false;
    const areaSelectEnd = { beat: this.cursorBeat, column: this.cursorColumn };

    const startBeat = Math.min(this.areaSelectStart.beat, areaSelectEnd.beat);
    const endBeat = Math.max(this.areaSelectStart.beat, areaSelectEnd.beat);
    const startCol = Math.min(this.areaSelectStart.column, areaSelectEnd.column);
    const endCol = Math.max(this.areaSelectStart.column, areaSelectEnd.column);

    const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
    const notes = this.song.chart.notes[diff.type + diff.rating] || [];

    this.selectedNotes = notes.filter(note => note.beat >= startBeat && note.beat <= endBeat && note.column >= startCol && note.column <= endCol);

    this.updateCursorPosition();
    this.updateInfoText();
  }

  toggleNoteSelection() {
    const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
    const notes = this.song.chart.notes[diff.type + diff.rating] || [];

    const noteAtCursor = notes.find(note => note.column === this.cursorColumn && Math.abs(note.beat - this.cursorBeat) < 0.001);

    if (noteAtCursor) {
      const index = this.selectedNotes.indexOf(noteAtCursor);
      if (index > -1) {
        this.selectedNotes.splice(index, 1);
      } else {
        this.selectedNotes.push(noteAtCursor);
      }
    } else {
      this.selectedNotes = [];
    }

    this.updateInfoText();
  }

  previewNote(note) {
    const start = note.sec;
    const duration = note.secLength ? note.secLength : this.chartRenderer.beatToSec(this.getDivisionSize());
    this.playPreview(start, duration);

    if (note.type === "2" || note.type === "4") {
      // TODO: Draw a explosion sprite from freeze start to end
    }
  }

  placeNote(column, beat, replace = false, mine = false) {
    if (this.isPlaying) return;

    const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
    const notes = this.song.chart.notes[diff.type + diff.rating] || [];

    const existingNote = notes.find(note => note.column === column && Math.abs(note.beat - beat) < 0.001);

    if (existingNote) {
      this.chartRenderer.killNote(existingNote);
      const index = notes.indexOf(existingNote);
      notes.splice(index, 1);

      const selectedIndex = this.selectedNotes.indexOf(existingNote);
      if (selectedIndex > -1) {
        this.selectedNotes.splice(selectedIndex, 1);
      }

      this.playExplosionEffect(this.cursorColumn);
      
      if (replace) {
        const newNote = {
          type: mine ? "M" : "1",
          beat: beat,
          sec: this.chartRenderer.beatToSec(beat),
          column: column
        };
        notes.push(newNote);
        this.playExplosionEffect(column);
        this.previewNote(newNote);
      }
    } else {
      const newNote = {
        type: mine ? "M" : "1",
        beat: beat,
        sec: this.chartRenderer.beatToSec(beat),
        column: column
      };
      notes.push(newNote);
      this.playExplosionEffect(column);
      this.previewNote(newNote);
    }
    
    Account.stats.totalPlacedArrows ++;
    
    this.sortNotes();
    this.updateInfoText();
  }

  placeFreeze(column, startBeat, duration, type = "2") {
    if (this.isPlaying) return;

    const notes = this.getCurrentChartNotes();

    // Remove any existing notes in the freeze range
    for (let i = notes.length - 1; i >= 0; i--) {
      const note = notes[i];
      if (note.column === this.cursorColumn && note.beat >= startBeat && note.beat <= startBeat + duration) {
        this.chartRenderer.killNote(note);
        notes.splice(i, 1);
      }
    }

    const newNote = {
      type: type,
      beat: startBeat,
      sec: this.chartRenderer.beatToSec(startBeat),
      column: this.cursorColumn,
      beatLength: duration,
      secLength: this.chartRenderer.beatToSec(startBeat + duration) - this.chartRenderer.beatToSec(startBeat),
      beatEnd: startBeat + duration,
      secEnd: this.chartRenderer.beatToSec(startBeat + duration)
    };
    notes.push(newNote);
    this.previewNote(newNote);
    
    Account.stats.totalPlacedFreezes ++;

    this.sortNotes();
    this.updateInfoText();
    this.playExplosionEffect(this.cursorColumn);
  }

  sortNotes() {
    const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
    const notes = this.song.chart.notes[diff.type + diff.rating];
    if (notes) {
      notes.sort((a, b) => a.beat - b.beat);
    }
  }

  placeMine(column, beat, replace) {
    if (this.isPlaying) return;
    
    this.placeNote(column, beat, replace, true);

    Account.stats.totalPlacedMines ++;
  }

  placeQuickHold() {
    this.placeFreeze(this.cursorColumn, this.cursorBeat, 1, "2");
  }

  playExplosionEffect(column) {
    const receptor = this.chartRenderer.receptors[column];
    if (receptor && receptor.explosion) {
      receptor.explosion.visible = true;
      receptor.explosion.alpha = 1;

      game.add
        .tween(receptor.explosion)
        .to({ alpha: 0 }, 200, "Linear", true)
        .onComplete.add(() => {
          receptor.explosion.visible = false;
        });
    }
  }

  changeSnapDivision(direction) {
    const currentIndex = this.divisions.indexOf(this.snapDivision);
    let newIndex = currentIndex + direction;

    if (newIndex < 0) newIndex = this.divisions.length - 1;
    if (newIndex >= this.divisions.length) newIndex = 0;

    this.snapDivision = this.divisions[newIndex];
    this.updateInfoText();
  }

  showContextMenu() {
    if (this.isPlaying || this.menuVisible) return;

    this.menuVisible = true;

    const contextMenu = new CarouselMenu(0, 48, 80, 56, {
      bgcolor: "#34495e",
      fgcolor: "#ffffff",
      align: "left",
      animate: true,
      inactiveAlpha: 0.6,
      activeAlpha: 1
    });

    if (this.selectedNotes.length === 0) {
      contextMenu.addItem("Place Mine", () => this.placeMine(this.cursorColumn, this.cursorBeat));
      contextMenu.addItem("Place Quick Hold", () => this.placeQuickHold());

      if (this.clipboard.length) {
        contextMenu.addItem("Paste Notes", () => this.pasteNotes());
        contextMenu.addItem("Clear Clipboard", () => this.clearClipboard());
      }

      if (!this.getBPMChange()) {
        contextMenu.addItem("Add BPM Change", () => this.addBPMChange());
      } else {
        contextMenu.addItem("Edit BPM Value", () => this.editBPMChange());
        contextMenu.addItem("Remove BPM Change", () => this.removeBPMChange());
      }

      if (!this.getStop()) {
        contextMenu.addItem("Add Stop", () => this.addStop());
      } else {
        contextMenu.addItem("Edit Stop Duration", () => this.editStop());
        contextMenu.addItem("Remove Stop", () => this.removeStop());
      }

      if (!this.getBGChange()) {
        contextMenu.addItem("Add BG Change", () => this.addBGChange());
        contextMenu.addItem("Add -nosongbg-", () => this.addNoSongBgChange());
      } else {
        contextMenu.addItem("Edit BG Change", () => this.editBGChange());
        contextMenu.addItem("Remove BG Change", () => this.removeBGChange());
      }
      
      contextMenu.addItem("Detect BPM Here", () => this.detectBPMHere());
    } else if (this.selectedNotes.length === 1) {
      const note = this.selectedNotes[0];
      contextMenu.addItem("Unselect", () => (this.selectedNotes = []));
      
      contextMenu.addItem("Copy Note", () => this.copyNotes([ note ]));
      
      if (this.clipboard.length) {
        contextMenu.addItem("Paste Notes", () => this.pasteNotes());
        contextMenu.addItem("Clear Clipboard", () => this.clearClipboard());
      }
      
      if (note.type === "1") {
        contextMenu.addItem("Turn Into Mine", () => this.convertNoteType("M"));
      } else if (note.type === "M") {
        contextMenu.addItem("Turn Into Note", () => this.convertNoteType("1"));
      } else if (note.type === "2" || note.type === "4") {
        contextMenu.addItem("Turn Into Roll", () => this.convertFreezeType("4"));
        contextMenu.addItem("Turn Into Hold", () => this.convertFreezeType("2"));
      }

      contextMenu.addItem("Align To Beat Division", () => this.alignToBeatDivision());
      contextMenu.addItem("Delete", () => this.deleteSelectedNotes());
    } else {
      contextMenu.addItem("Unselect All", () => (this.selectedNotes = []));

      const allNotes = this.selectedNotes.every(n => n.type === "1" || n.type === "M");
      const allFreezes = this.selectedNotes.every(n => n.type === "2" || n.type === "4");

      contextMenu.addItem("Copy Notes", () => this.copyNotes(this.selectedNotes));

      if (this.clipboard.length) {
        contextMenu.addItem("Paste Notes", () => this.pasteNotes());
        contextMenu.addItem("Clear Clipboard", () => this.clearClipboard());
      }

      if (allNotes) {
        contextMenu.addItem("Turn All Into Mines", () => this.convertNotesType("M"));
        contextMenu.addItem("Turn All Into Notes", () => this.convertNotesType("1"));
      } else if (allFreezes) {
        contextMenu.addItem("Turn All Into Rolls", () => this.convertFreezesType("4"));
        contextMenu.addItem("Turn All Into Holds", () => this.convertFreezesType("2"));
      }

      contextMenu.addItem("Align All To Beat Division", () => this.alignAllToBeatDivision());
      contextMenu.addItem("Delete All", () => this.deleteSelectedNotes());
    }

    contextMenu.addItem("Save And Exit", () => this.saveAndExit());

    contextMenu.onConfirm.add(() => {
      contextMenu.destroy();
      this.menuVisible = false;
    });

    contextMenu.onCancel.add(() => {
      contextMenu.destroy();
      this.menuVisible = false;
    });
  }
  
  copyNotes(notes = []) {
    if (notes.length) {
      this.clipboard = notes;
      notifications.show(`Copied ${notes.length} notes`);
    }
  }
  
  pasteNotes() {
    if (this.clipboard.length) {
      const firstBeat = this.clipboard[0].beat;
      const difference = this.cursorBeat - firstBeat;
      
      this.clipboard.forEach(note => {
        const newBeat = Math.max(0, note.beat + difference);
        
        switch (note.type) {
          case "1":
            this.placeNote(note.column, newBeat, true);
            break;
          case "2":
          case "4":
            this.placeFreeze(note.column, newBeat, note.beatLength, note.type);
            break;
          case "M":
            this.placeMine(note.column, newBeat, true);
            break;
        }
      });
      
      this.sortNotes();
      this.updateInfoText();
    }
  }
  
  clearClipboard() {
    this.clipboard = [];
  }

  convertNoteType(newType) {
    if (this.selectedNotes.length === 1) {
      this.selectedNotes[0].type = newType;
      this.refreshSelectedNotes();
    }
  }

  convertNotesType(newType) {
    this.selectedNotes.forEach(note => {
      note.type = newType;
    });
    this.refreshSelectedNotes();
  }

  convertFreezeType(newType) {
    if (this.selectedNotes.length === 1 && (this.selectedNotes[0].type === "2" || this.selectedNotes[0].type === "4")) {
      this.selectedNotes[0].type = newType;
      this.refreshSelectedNotes();
    }
  }

  convertFreezesType(newType) {
    this.selectedNotes.forEach(note => {
      if (note.type === "2" || note.type === "4") {
        note.type = newType;
      }
    });
    this.refreshSelectedNotes();
  }

  alignToBeatDivision() {
    if (this.selectedNotes.length === 1) {
      const note = this.selectedNotes[0];
      note.beat = this.getSnappedBeat(note.beat);
      note.sec = this.chartRenderer.beatToSec(note.beat);
      this.refreshSelectedNotes();
      this.sortNotes();
    }
  }

  alignAllToBeatDivision() {
    this.selectedNotes.forEach(note => {
      note.beat = this.getSnappedBeat(note.beat);
      note.sec = this.chartRenderer.beatToSec(note.beat);
    });
    this.refreshSelectedNotes();
    this.sortNotes();
  }
  
  refreshSelectedNotes() {
    this.selectedNotes.forEach(note => this.chartRenderer.killNote(note)); // the renderer will automatically recreate the note visuals
  }
  
  deleteSelectedNotes() {
    const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
    const notes = this.song.chart.notes[diff.type + diff.rating] || [];

    this.selectedNotes.forEach(note => {
      const index = notes.indexOf(note);
      this.chartRenderer.killNote(note);
      if (index > -1) {
        notes.splice(index, 1);
      }
    });

    this.selectedNotes = [];
    this.updateInfoText();
  }

  getCurrentChartNotes() {
    const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
    
    if (!diff) return [];
    
    return this.song.chart.notes[diff.type + diff.rating] || [];
  }

  getSongInfoText() {
    const chart = this.song.chart;
    let totalNotes = 0;
    chart.difficulties.forEach(diff => {
      const notes = chart.notes[diff.type + diff.rating];
      if (notes) totalNotes += notes.length;
    });

    return `
TITLE: ${chart.title}
ARTIST: ${chart.artist}
GENRE: ${chart.genre || "Unknown"}
CREDIT: ${chart.credit || "Unknown"}

DIFFICULTIES: ${chart.difficulties.length}
TOTAL NOTES: ${totalNotes}
BPM CHANGES: ${chart.bpmChanges.length}
STOPS: ${chart.stops.length}
BG CHANGES: ${chart.backgrounds.length}

OFFSET: ${chart.offset}
SAMPLE START: ${chart.sampleStart}
SAMPLE LENGTH: ${chart.sampleLength}
    `.trim();
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && this.currentFileCallback) {
      this.currentFileCallback(file);
    }
    this.fileInput.value = "";
  }
  
  async processFiles(files) {
    try {
      const fileMap = {};
      for (let i = 0; i < files.length; i++) {
        fileMap[files[i].name.toLowerCase()] = files[i];
      }

      const packageFileNames = Object.keys(fileMap).filter(name => name.endsWith(".zip") || name.endsWith(".pmz"));
      const chartFileNames = Object.keys(fileMap).filter(name => name.endsWith(".sm"));

      if (packageFileNames.length > 0) {
        const zipFileName = packageFileNames[0];
        const zipFile = fileMap[zipFileName];
        this.importFromZip(zipFile);
        return;
      }

      if (chartFileNames.length === 0) {
        this.showFileMenu();
        notifications.show("No chart files found");
        return;
      }

      const smFileName = chartFileNames[0];
      const content = await this.readTextFileContent(fileMap[smFileName.toLowerCase()]);

      const chart = await new ExternalSMParser().parseSM(fileMap, content);
      chart.folderName = `Single_External_${smFileName}`;
      chart.loaded = true;
      
      this.showLoadingScreen("Processing Files");
      
      // Load main files
      this.files.audio = await FileTools.urlToBase64(chart.audioUrl);
      this.files.banner = await FileTools.urlToBase64(chart.bannerUrl);
      this.files.background = await FileTools.urlToBase64(chart.backgroundUrl);
      this.files.lyrics = chart.lyricsContent;
      
      // Load BG change files
      if (chart.backgrounds) {
        for (const bg of chart.backgrounds) {
          if (bg.file != "" && bg.file != "-nosongbg-") {
            const file = fileMap[bg.file.toLowerCase()] || "";
            this.files.extra[bg.file] = file || "";
          }
        }
      }
      
      this.hideLoadingScreen();
      
      this.audio.src = chart.audioUrl;
      this.updateBanner(chart.bannerUrl);
      this.updateBackground(chart.backgroundUrl);
      this.refreshLyrics();

      this.song = { chart };
      this.showHomeScreen();
    } catch (error) {
      console.error("Error loading song:", error);
      this.showFileMenu();
    }
  }

  async loadAudioFile(file) {
    try {
      const url = URL.createObjectURL(file);
      this.song.chart.audio = file.name;
      this.song.chart.audioUrl = url;
      
      this.showLoadingScreen("Processing Audio");
      
      const reader = new FileReader();
      reader.onload = () => {
        this.files.audio = FileTools.extractBase64(reader.result);
        this.audio.src = url;
        this.hideLoadingScreen();
        this.showHomeScreen();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error loading audio:", error);
      this.showHomeScreen();
    }
  }

  async loadBackgroundFile(file) {
    try {
      const url = URL.createObjectURL(file);
      this.song.chart.background = file.name;
      this.song.chart.backgroundUrl = url;

      this.showLoadingScreen("Processing Background");
      
      const reader = new FileReader();
      reader.onload = () => {
        this.files.background = FileTools.extractBase64(reader.result);
        this.updateBackground(url);
        this.hideLoadingScreen();
        this.showHomeScreen();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error loading background:", error);
      this.showHomeScreen();
    }
  }

  async loadBannerFile(file) {
    try {
      const url = URL.createObjectURL(file);
      this.song.chart.banner = file.name;
      this.song.chart.bannerUrl = url;
      
      this.showLoadingScreen("Processing Banner");
      
      this.updateBanner(url);
      
      const reader = new FileReader();
      reader.onload = () => {
        this.files.banner = FileTools.extractBase64(reader.result);
        this.hideLoadingScreen();
        this.showHomeScreen();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error loading banner:", error);
      this.showHomeScreen();
    }
  }
  
  async loadLyricsFile(file) {
    try {
      this.showLoadingScreen("Processing Lyrics");
      
      const reader = new FileReader();
      reader.onload = () => {
        this.song.chart.lyrics = file.name;
        this.song.chart.lyricsContent = reader.result;
        this.files.lyrics = reader.result;
        this.refreshLyrics();
        this.hideLoadingScreen();
        this.showHomeScreen();
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error loading banner:", error);
      this.showHomeScreen();
    }
  }

  async importFromZip(file) {
    const JSZip = window.JSZip;
    if (!JSZip) {
      this.showHomeScreen();
      throw new Error("JSZip library not loaded");
    }
    
    if (!file) {
      this.showHomeScreen();
      throw new Error("Undefined .zip file");
    }
    
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);

    // Import the project
    await this.importStepManiaSong(zipContent);
    
    this.hideLoadingScreen();
    this.showHomeScreen();
    
    Account.stats.totalImportedSongs ++;
  }

  async importStepManiaSong(zipContent) {
    // Find .sm file
    let smFile = null;
    let smFilename = null;

    zipContent.forEach((relativePath, file) => {
      if (relativePath.toLowerCase().endsWith(".sm") && !smFile) {
        smFile = file;
        smFilename = relativePath;
      }
    });

    if (!smFile) {
      throw new Error("No .sm file found in ZIP");
    }

    // Parse SM file
    const smContent = await smFile.async("text");
    const basePath = smFilename.split("/").slice(0, -1).join("/");
    const chart = await new LocalSMParser().parseSM(smContent, basePath);

    this.song = { chart };
    this.files = {
      audio: null,
      background: null,
      banner: null,
      lyrics: null,
      extra: {}
    };

    // Helper function to find and load file from ZIP
    const loadFileFromZip = async (filename, targetProp) => {
      if (!filename) return null;

      // Try to find the file in ZIP
      let fileEntry = zipContent.file(filename);

      // If not found, try with relative path
      if (!fileEntry && basePath) {
        fileEntry = zipContent.file(basePath + "/" + filename);
      }

      // If still not found, search case-insensitive
      if (!fileEntry) {
        zipContent.forEach((relativePath, file) => {
          if (relativePath.toLowerCase().includes(filename.toLowerCase())) {
            fileEntry = file;
          }
        });
      }

      if (fileEntry) {
        this.showLoadingScreen(`Loading ${targetProp} file`);
        
        const blob = await fileEntry.async("blob");

        // Create object URL for immediate use
        const objectUrl = URL.createObjectURL(blob);

        if (targetProp === "audio") {
          this.song.chart.audio = filename;
          this.song.chart.audioUrl = objectUrl;
          this.files.audio = FileTools.urlToBase64(objectUrl);
          this.audio.src = objectUrl;
        } else if (targetProp === "background") {
          this.song.chart.background = filename;
          this.song.chart.backgroundUrl = objectUrl;
          this.files.background = FileTools.urlToBase64(objectUrl);
          this.updateBackground(objectUrl);
        } else if (targetProp === "banner") {
          this.song.chart.banner = filename;
          this.song.chart.bannerUrl = objectUrl;
          this.files.banner = FileTools.urlToBase64(objectUrl);
          this.updateBanner(objectUrl);
        } else if (targetProp === "lyrics") {
          this.files.lyrics = await fileEntry.async("text");
          this.song.chart.lyrics = filename;
          this.song.chart.lyricsContent = this.files.lyrics;
          this.refreshLyrics();
        } else if (targetProp === "extra") {
          this.files.extra[filename] = FileTools.urlToBase64(objectUrl);
        }

        return objectUrl;
      }

      return null;
    };
    
    this.audio.src = "";

    // Load main files
    await loadFileFromZip(this.song.chart.audio, "audio");
    await loadFileFromZip(this.song.chart.background, "background");
    await loadFileFromZip(this.song.chart.banner, "banner");
    await loadFileFromZip(this.song.chart.lyrics, "lyrics");

    // Load BG change files
    if (this.song.chart.backgrounds) {
      for (const bg of this.song.chart.backgrounds) {
        if (bg.file != "" && bg.file != "-nosongbg-") {
          bg.url = await loadFileFromZip(bg.file, "extra");
        }
      }
    }
    
    this.hideLoadingScreen();

    notifications.show("StepMania song imported!");
  }

  async importSMFile(file) {
    const content = await this.readTextFileContent(file);
    const chart = await new LocalSMParser().parseSM(content);

    this.song = { chart };

    this.files = {
      audio: null,
      background: null,
      banner: null,
      extra: {}
    };
    
    this.updateBackground();
    this.updateBanner();
    this.refreshLyrics();
    this.audio.src = "";
    
    notifications.show("SM file imported! Load audio/background files manually.");
  }

  async exportSong() {
    try {
      this.showLoadingScreen("Exporting song");

      // Prepare song data
      const songData = await FileTools.prepareSongForExport(this.song, this.files);

      // Generate SM content
      const smContent = SMFile.generateSM(songData);

      // Create ZIP file
      const JSZip = window.JSZip;
      if (!JSZip) {
        throw new Error("JSZip library not loaded");
      }

      const zip = new JSZip();

      // Add SM file
      const smFilename = `${songData.title || "song"}.sm`;
      zip.file(smFilename, smContent);

      // Add resources
      this.addSongResourcesToZip(songData, zip);

      // Generate ZIP file
      const blob = await zip.generateAsync({ type: "blob" });

      // Save file
      const fileName = `${songData.title || "song"}.zip`;
      await this.saveFile(blob, fileName);
      
      Account.stats.totalExportedSongs ++;

      this.hideLoadingScreen();
      this.showHomeScreen();
      notifications.show("Song exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      this.hideLoadingScreen();
      this.showHomeScreen();
      notifications.show("Export failed!");
    }
  }

  addSongResourcesToZip(songData, zip) {
    // Add main files
    songData.audio !== "no-media" && zip.file(songData.audio, this.files.audio, { base64: true });
    songData.background !== "no-media" && zip.file(songData.background, this.files.background, { base64: true });
    songData.banner !== "no-media" && zip.file(songData.banner, this.files.banner, { base64: true });
    songData.lyricsContent && zip.file(songData.lyrics, this.files.lyrics);

    // Add BG change files
    if (songData.backgrounds) {
      for (const bg of songData.backgrounds) {
        if (bg.file && bg.file !== "no-media" && this.files.extra[bg.file]) {
          zip.file(bg.file, this.files.extra[bg.file], { base64: true });
        }
      }
    }

    return zip;
  }

  async saveFile(blob, filename) {
    if (CURRENT_ENVIRONMENT === ENVIRONMENT.WEB) {
      // Download in browser
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (CURRENT_ENVIRONMENT === ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT === ENVIRONMENT.NWJS) {
      await this.saveFileToFilesystem(blob, filename);
    }
  }
  
  async saveFileToFilesystem(blob, filename) {
    const fileSystem = new FileSystemTools();
    
    const outputDir = await fileSystem.getDirectory(EXTERNAL_DIRECTORY + EDITOR_OUTPUT_DIRECTORY);
    
    await fileSystem.saveFile(outputDir, blob, filename);
  }
  
  setDifficultyType(difficultyIndex) {
    const types = ["Beginner", "Easy", "Medium", "Hard", "Challenge"];
    const currentType = this.song.chart.difficulties[difficultyIndex].type;

    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#8e44ad",
      fgcolor: "#ffffff",
      animate: true
    });

    types.forEach(type => {
      carousel.addItem(type, () => {
        const oldKey = this.song.chart.difficulties[difficultyIndex].type + this.song.chart.difficulties[difficultyIndex].rating;
        this.song.chart.difficulties[difficultyIndex].type = type;
        const newKey = type + this.song.chart.difficulties[difficultyIndex].rating;

        if (this.song.chart.notes[oldKey]) {
          this.song.chart.notes[newKey] = this.song.chart.notes[oldKey];
          delete this.song.chart.notes[oldKey];
        }

        this.showChartsMenu();
      });
    });

    carousel.addItem("< Back", () => this.showChartOptions(difficultyIndex));
    carousel.onCancel.add(() => this.showChartOptions(difficultyIndex));
  }

  setDifficultyRating(difficultyIndex) {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#8e44ad",
      fgcolor: "#ffffff",
      animate: true
    });

    for (let i = 1; i <= 20; i++) {
      carousel.addItem(i.toString(), () => {
        const oldKey = this.song.chart.difficulties[difficultyIndex].type + this.song.chart.difficulties[difficultyIndex].rating;
        this.song.chart.difficulties[difficultyIndex].rating = i.toString();
        const newKey = this.song.chart.difficulties[difficultyIndex].type + i.toString();

        if (this.song.chart.notes[oldKey]) {
          this.song.chart.notes[newKey] = this.song.chart.notes[oldKey];
          delete this.song.chart.notes[oldKey];
        }

        this.showChartsMenu();
      });
    }

    carousel.addItem("< Back", () => this.showChartOptions(difficultyIndex));
    carousel.onCancel.add(() => this.showChartOptions(difficultyIndex));
  }

  deleteDifficulty(difficultyIndex) {
    const diff = this.song.chart.difficulties[difficultyIndex];
    const key = diff.type + diff.rating;

    this.song.chart.difficulties.splice(difficultyIndex, 1);
    delete this.song.chart.notes[key];

    this.showChartsMenu();
    this.updateInfoText();
  }
  
  addNewDifficulty() {
    const newDiff = {
      type: "Medium",
      rating: "1"
    };
    this.song.chart.difficulties.push(newDiff);
    this.song.chart.notes[newDiff.type + newDiff.rating] = [];
    this.showChartsMenu();
    this.updateInfoText();
  }

  showMetadataEdit() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#16a085",
      fgcolor: "#ffffff",
      animate: true
    });

    carousel.addItem("Edit Title", () => this.editMetadataField("title"));
    carousel.addItem("Edit Artist", () => this.editMetadataField("artist"));
    carousel.addItem("Edit Genre", () => this.editMetadataField("genre"));
    carousel.addItem("Edit Credit", () => this.editMetadataField("credit"));
    carousel.addItem("Edit BPM", () => this.editSongBpm());
    carousel.addItem("Edit Offset", () => this.editSongOffset());
    carousel.addItem("Edit Sample Start", () => this.editSampleStart());
    carousel.addItem("Edit Sample Length", () => this.editSampleLength());

    carousel.addItem("< Back", () => this.showEditMenu());
    carousel.onCancel.add(() => this.showEditMenu());
  }

  editMetadataField(field) {
    const currentValue = this.song.chart[field] || "";
    const textInput = new TextInput(
      currentValue,
      20,
      newValue => {
        this.song.chart[field] = newValue;
        this.showMetadataEdit();
        this.updateInfoText();
      },
      () => {
        this.showMetadataEdit();
      }
    );
  }

  editSongBpm() {
    const bpm = this.song.chart.bpmChanges[0]?.bpm || 120;
    new ValueInput(
      bpm,
      0,
      1000,
      1,
      value => {
        if (!this.song.chart.bpmChanges[0]) {
          this.song.chart.bpmChanges[0] = { beat: 0, bpm: value, sec: 0 };
        } else {
          this.song.chart.bpmChanges[0].bpm = value;
        }
        this.showMetadataEdit();
        this.updateInfoText();
      },
      () => {
        this.showMetadataEdit();
      }
    );
  }

  editSongOffset() {
    const offset = this.song.chart.offset || 0;
    new ValueInput(
      offset,
      -32,
      32,
      0.001,
      value => {
        this.song.chart.offset = value;
        this.showMetadataEdit();
      },
      () => {
        this.showMetadataEdit();
      }
    );
  }

  editSampleStart() {
    const sampleStart = this.song.chart.sampleStart || 0;
    new ValueInput(
      sampleStart,
      0,
      this.audio.duration || 100,
      0.1,
      value => {
        this.song.chart.sampleStart = value;

        // Preview the sample
        if (this.audio && this.audio.src) {
          this.playPreview(value, this.song.chart.sampleLength);
        }
        
        this.updateInfoText();
        this.showMetadataEdit();
      },
      () => {
        this.showMetadataEdit();
      }
    );
  }

  editSampleLength() {
    const sampleLength = this.song.chart.sampleLength || 10;
    new ValueInput(
      sampleLength,
      1,
      30,
      0.1,
      value => {
        this.song.chart.sampleLength = value;
        this.updateInfoText();
        this.showMetadataEdit();
      },
      () => {
        this.showMetadataEdit();
      }
    );
  }

  editBGChangeFiles() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#d35400",
      fgcolor: "#ffffff",
      animate: true
    });

    this.song.chart.backgrounds.forEach((bg, index) => {
      const fileName = bg.file ? bg.file.split("/").pop() : "No file";
      carousel.addItem(`BG ${index + 1}: ${fileName}`, () => {
        this.pickFile("image/*,video/*", async event => {
          const file = event.target.files[0];
          bg.file = file.name;
          this.files.extra[file.name] = FileTools.extractBase64(URL.createObjectURL(file));
          this.editBGChangeFiles();
        }, () => editBGChangeFiles());
      });
    });

    carousel.addItem("< Back", () => this.showFileMenu());
    carousel.onCancel.add(() => this.showFileMenu());
  }

  createNewSongAndReload() {
    this.song = this.createNewSong();
    game.state.start("Editor");
  }

  saveAndExit() {
    this.showHomeScreen();
  }

  clearUI() {
    if (this.mainCarousel) {
      this.mainCarousel.destroy();
      this.mainCarousel = null;
    }
    if (this.songInfoText) {
      this.songInfoText.destroy();
      this.songInfoText = null;
    }
    if (this.bannerSprite) {
      this.bannerSprite.visible = false;
    }
  }

  // BPM/Stop/BG change methods
  calculateBPM(beats) {
    if (beats.length < 3) {
      return 0;
    }

    // Calculate intervals between beats
    const intervals = [];
    for (let i = 1; i < beats.length; i++) {
      intervals.push(beats[i] - beats[i - 1]);
    }

    // Filter out outliers (keep only intervals within 20% of median)
    const median = intervals.sort((a, b) => a - b)[Math.floor(intervals.length / 2)];
    const validIntervals = intervals.filter(interval => Math.abs(interval - median) / median < 0.2);

    if (validIntervals.length === 0) {
      return 0;
    }

    // Calculate average interval and convert to BPM
    const avgInterval = validIntervals.reduce((a, b) => a + b, 0) / validIntervals.length;
    const bpm = Math.round(60 / avgInterval);

    // TODO: Validate BPM range
    return bpm;
  }

  detectBPMHere() {
    const audioElement = document.createElement("audio");
    audioElement.src = this.audio.src;
    audioElement.currentTime = this.chartRenderer.beatToSec(this.cursorBeat);

    this.menuVisible = true;

    // Create background
    const background = game.add.graphics(0, 0);
    background.beginFill(0x000000, 0.8);
    background.drawRect(0, 0, game.width, game.height);
    background.endFill();

    // Create instruction text
    const instructionText = new Text(game.width / 2, game.height / 2 - 20, "TAP TO THE BEAT TO CALCULATE BPM");
    instructionText.anchor.set(0.5);

    // Create offset display text
    const valueText = new Text(game.width / 2, game.height / 2 + 10, "BPM: 0", FONTS.default);
    valueText.tint = 0xffff00;
    valueText.anchor.set(0.5);
    
    const startTime = this.audio.currentTime;

    const beats = [];

    this.stopPlayback();
    audioElement.play();

    const inputHandler = key => {
      if (key == "a") {
        beats.push(audioElement.currentTime);
        valueText.write(`BPM: ${this.calculateBPM(beats)}`);
        game.add.tween(valueText.scale).to({ x: 1.1, y: 1.1 }, 50, Phaser.Easing.Quadratic.Out, true).yoyo(true);
      } else if (key == "b") {
        background.destroy();
        instructionText.destroy();
        valueText.destroy();
        audioElement.pause();
        audioElement.src = "";
        gamepad.signals.pressed.any.remove(inputHandler);
        this.menuVisible = false;
      }
    };

    gamepad.signals.pressed.any.add(inputHandler);
  }

  addBPMChange() {
    this.menuVisible = true;

    new ValueInput(120, 0, 1000, 1,
      value => {
        this.song.chart.bpmChanges.push({
          beat: this.cursorBeat,
          bpm: value,
          sec: this.chartRenderer.beatToSec(this.cursorBeat)
        });
        this.song.chart.bpmChanges.sort((a, b) => a.beat - b.beat);
        this.updateInfoText();
        this.menuVisible = false;
      },
      () => {
        this.menuVisible = false;
      }
    );
  }

  getBPMChange() {
    return this.song.chart.bpmChanges.find(bpm => Math.abs(bpm.beat - this.cursorBeat) < 0.001);
  }

  editBPMChange() {
    const bpmChange = this.getBPMChange();
    if (bpmChange) {
      this.menuVisible = true;
      
      new ValueInput(
        bpmChange.bpm,
        0,
        1000,
        1,
        bpm => {
          const index = this.song.chart.bpmChanges.indexOf(bpmChange);
          if (index != -1) this.song.chart.bpmChanges[index].bpm = bpm;
          this.updateInfoText();
          this.menuVisible = false;
        },
        () => {
          this.menuVisible = false;
        }
      );
    }
  }
  
  removeBPMChange() {
    const bpmChange = this.getBPMChange();
    if (bpmChange) {
      const index = this.song.chart.bpmChanges.indexOf(bpmChange);
      this.chartRenderer.removeTag(bpmChange.beat, 'bpm');
      this.song.chart.bpmChanges.splice(index, 1);
    }
    this.updateInfoText();
  }

  addStop() {
    this.menuVisible = true;

    new ValueInput(
      1,
      0,
      360,
      0.1,
      length => {
        this.song.chart.stops.push({
          beat: this.cursorBeat,
          len: length,
          sec: this.chartRenderer.beatToSec(this.cursorBeat)
        });
        this.song.chart.stops.sort((a, b) => a.beat - b.beat);
        this.updateInfoText();
        this.menuVisible = false;
      },
      () => {
        this.menuVisible = false;
      }
    );
  }
  
  getStop() {
    return this.song.chart.stops.find(s => Math.abs(s.beat - this.cursorBeat) < 0.001);
  }

  editStop() {
    const stop = this.getStop();
    if (stop) {
      this.menuVisible = true;
      
      new ValueInput(
        stop.len,
        0,
        360,
        0.1,
        length => {
          const index = this.song.chart.stops.indexOf(stop);
          if (index != -1) this.song.chart.stops[index].len = length;
          this.updateInfoText();
          this.menuVisible = false;
        },
        () => {
          this.menuVisible = false;
        }
      );
    }
  }

  removeStop() {
    const stop = this.getStop();
    if (stop) {
      const index = this.song.chart.stops.indexOf(stop);
      this.song.chart.stops.splice(index, 1);
      this.chartRenderer.removeTag(stop.beat, 'stop');
    }
    this.updateInfoText();
  }

  addBGChange() {
    this.pickFile("image/*,video/*", async event => {
      const file = event.target.files[0];
      const fileType = file.type.includes("video") ? "video" : "image";
      const url = URL.createObjectURL(file);
      this.song.chart.backgrounds.push({
        beat: this.cursorBeat,
        file: file.name,
        url: url,
        opacity: 1,
        fadeIn: 0,
        fadeOut: 0,
        effect: 0,
        type: fileType
      });
      this.song.chart.backgrounds.sort((a, b) => a.beat - b.beat);
      this.files.extra[file.name] = await FileTools.urlToBase64(url);
      this.updateInfoText();
    });
  }
  
  addNoSongBgChange() {
    this.song.chart.backgrounds.push({
      beat: this.cursorBeat,
      file: "-nosongbg-",
      url: "",
      opacity: 1,
      fadeIn: 0,
      fadeOut: 0,
      effect: 0,
      type: "image"
    });
    this.song.chart.backgrounds.sort((a, b) => a.beat - b.beat);
  }

  getBGChange() {
    return this.song.chart.backgrounds.find(bg => Math.abs(bg.beat - this.cursorBeat) < 0.001);
  }
  
  editBGChange() {
    const bgChange = this.getBGChange();
    if (bgChange) {
      this.pickFile("image/*,video/*", async event => {
        const file = event.target.files[0];
        const fileType = file.type.includes("video") ? "video" : "image";
        const url = URL.createObjectURL(file);
        const index = this.song.chart.backgrounds.indexOf(bgChange);
        this.song.chart.backgrounds[index].file = file.name;
        this.song.chart.backgrounds[index].url = url;
        this.files.extra[file.name] = FileTools.extractBase64(url);
        this.updateInfoText();
      });
    }
    this.updateInfoText();
  }
  
  removeBGChange() {
    const bgChange = this.getBGChange();
    if (bgChange) {
      const index = this.song.chart.backgrounds.indexOf(bgChange);
      this.song.chart.backgrounds.splice(index, 1);
      this.chartRenderer.removeTag(bgChange.beat, 'bg');
      delete this.files.extra[bgChange.file];
    }
    this.updateInfoText();
  }

  update() {
    gamepad.update();
    
    const { now, beat } = this.getCurrentTime();
    
    this.chartRenderer.render(now, beat);
    
    if (notifications.notificationWindow) notifications.notificationWindow.bringToTop();

    if (this.currentScreen === "metadata") {
      this.lyricsText.visible = false;
      this.icons.visible = true;
      
      const updateIconTint = (icon, enabled) => icon.tint = enabled ? 0xffffff : 0x888888;
      
      updateIconTint(this.audioIcon, this.files.audio);
      updateIconTint(this.bgIcon, this.files.background && this.files.background !== "");
      updateIconTint(this.bnIcon, this.files.banner && this.files.banner !== "");
      updateIconTint(this.lrcIcon, this.files.lyrics && this.files.lyrics.length);
      updateIconTint(this.extraIcon, this.files.extra && Object.entries(this.files.extra).length);
    } else if (this.currentScreen === "chartEdit") {
      this.handleChartEditInput();
      this.icons.visible = false;
      this.lyricsText.visible = this.isPlaying;
      if (this.lyrics) this.lyrics.move(now);

      if (this.isPlaying) {
        this.cursorBeat = beat;
        this.updateCursorPosition();
        this.updateInfoText();
        
        // Show hit effects when notes reach judge line
        this.showHitEffects(now, beat);
      }

      // Highlight selected notes
      const alpha = 0.8 + 0.2 * Math.sin(Date.now() * 0.01);
      this.getCurrentChartNotes().forEach(note => {
        if (note.sprite) note.sprite.alpha = 1;
        if (note.holdParts) {
          note.holdParts.body.alpha = 1;
          note.holdParts.end.alpha = 1;
        }
      });
      this.selectedNotes.forEach(note => {
        if (note.sprite) note.sprite.alpha = alpha;
        if (note.holdParts) {
          note.holdParts.body.alpha = alpha;
          note.holdParts.end.alpha = alpha;
        }
      });
    }
  }

  showHitEffects(now, beat) {
    const notes = this.getCurrentChartNotes();

    notes.forEach(note => {
      if (!note.hitEffectShown && note.sec - now <= 0 && note.sec - now > -1) {
        this.playExplosionEffect(note.column);
        note.hitEffectShown = true;
      }
    });
  }
  
  exitEditor() {
    game.state.start("MainMenu");
  }

  shutdown() {
    if (this.fileInput) {
      this.fileInput.value = "";
      this.fileInput = null;
    }
    this.stopPlayback();
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
      this.audio = null;
    }
    window.editorSongData = this.song;
  }
}
