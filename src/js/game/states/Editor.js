class Editor {
  init(song = null) {
    this.song = song || this.createNewSong();
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
    this.menuVisible = false;
    this.playStartTime = 0;
    this.playOffset = 0;
    this.menuVisible = false;
    this.freezePreview = null;

    this.files = {
      audio: null,
      background: null,
      banner: null,
      extra: []
    };

    this.divisions = [4, 8, 12, 16, 24, 32, 48, 64, 96, 192];

    // File input element
    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    this.fileInput.style.display = "none";
    this.fileInput.onchange = e => this.handleFileSelect(e);
    document.body.appendChild(this.fileInput);
  }

  create() {
    game.camera.fadeIn(0x000000);

    new FuturisticLines();
    new BackgroundGradient();

    this.navigationHint = new NavigationHint(3);

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

    this.cursorSprite = game.add.graphics(0, 0);
    this.selectionRect = game.add.graphics(0, 0);
    this.freezePreviewSprite = game.add.graphics(0, 0);
    this.updateCursorPosition();

    this.infoText = new Text(4, 4, "");
    this.updateInfoText();

    // Create play/pause audio
    this.audio = document.createElement("audio");
    if (this.song.chart.audioUrl) {
      this.audio.src = this.song.chart.audioUrl;
    }

    this.showMetadataScreen();

    addonManager.executeStateBehaviors(this.constructor.name, this);
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
        background: "no-media",
        lyrics: null,
        cdtitle: null,
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

  showMetadataScreen() {
    this.currentScreen = "metadata";
    this.clearUI();
    this.stopPlayback();

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
    this.mainCarousel.addItem("Project", () => this.showProjectMenu());
    this.mainCarousel.addItem("Edit", () => this.showEditMenu());
    this.mainCarousel.addItem("Playtest", () => this.playtest());
    this.mainCarousel.addItem("Export", () => this.exportSong());

    game.onMenuIn.dispatch("editorMain", this.mainCarousel);

    // Right side: Song info
    this.songInfoText = new Text(leftWidth + 4, 4, this.getSongInfoText());
    this.songInfoText.wrapPreserveNewlines(rightWidth - 8);

    this.updateInfoText();

    // Banner display
    if (this.song.chart.banner && this.song.chart.banner !== "no-media") {
      this.bannerSprite = game.add.sprite(8, 56, null);
      this.loadBanner(this.song.chart.banner);
    }

    //Update background
    this.updateBackground();
  }
  
  updateBackground() {
    if (this.song.chart.background && this.song.chart.background !== "no-media") {
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
      img.src = this.song.chart.background;
    } else {
      this.backgroundSprite.loadTexture(null);
    }
  }

  showFileMenu() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#3498db",
      fgcolor: "#ffffff",
      animate: true
    });

    carousel.addItem("Load Audio", () => this.pickFile("audio/*", this.loadAudioFile.bind(this)));
    carousel.addItem("Load Background", () => this.pickFile("image/*,video/*", this.loadBackgroundFile.bind(this)));
    carousel.addItem("Load Banner", () => this.pickFile("image/*", this.loadBannerFile.bind(this)));
    if (this.song.chart.backgrounds && this.song.chart.backgrounds.length > 0) {
      carousel.addItem("Edit BG Changes", () => this.editBGChangeFiles());
    }
    carousel.addItem("New Song", () => this.createNewSongAndReload());
    carousel.addItem("Load Song", () => this.loadSong());

    game.onMenuIn.dispatch("editorFile", carousel);

    carousel.addItem("< Back", () => this.showMetadataScreen());
    carousel.onCancel.add(() => this.showMetadataScreen());
  }

  loadSong() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.webkitdirectory = true;
    fileInput.multiple = true;

    fileInput.onchange = e => {
      this.processFiles(e.target.files);
    };

    fileInput.oncancel = e => {
      this.showFileMenu();
    };

    fileInput.click();
  }

  async processFiles(files) {
    try {
      const fileMap = {};
      for (let i = 0; i < files.length; i++) {
        fileMap[files[i].name.toLowerCase()] = files[i];
      }

      const chartFileNames = Object.keys(fileMap).filter(name => name.endsWith(".sm"));

      if (chartFileNames.length === 0) {
        this.showFileMenu();
        return;
      }

      const smFileName = chartFileNames[0];
      const content = await this.readTextFileContent(fileMap[smFileName]);

      const chart = new ExternalSMParser().parseSM(fileMap, content);
      chart.folderName = `Single_External_${smFileName}`;
      chart.loaded = true;

      this.song = { chart };
      this.showMetadataScreen();
    } catch (error) {
      console.error("Error loading song:", error);
      this.showFileMenu();
    }
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

    carousel.addItem("< Back", () => this.showMetadataScreen());
    carousel.onCancel.add(() => this.showMetadataScreen());
  }
  
  showProjectMenu() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#e67e22",
      fgcolor: "#ffffff",
      animate: true
    });

    carousel.addItem("Export", () => this.exportProject());

    game.onMenuIn.dispatch("editorProject", carousel);

    carousel.addItem("< Back", () => this.showMetadataScreen());
    carousel.onCancel.add(() => this.showMetadataScreen());
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

    this.chartRenderer.load(this.song, this.currentDifficultyIndex);

    this.updateInfoText();
  }

  updateInfoText() {
    if (this.currentScreen === "chartEdit") {
      const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
      const noteCount = this.song.chart.notes[diff.type + diff.rating]?.length || 0;

      this.infoText.write(`EDITING: ${diff.type} (${diff.rating})\n` + `SNAP: 1/${this.snapDivision}\n` + `BEAT: ${this.cursorBeat.toFixed(3)}\n` + `COLUMN: ${this.cursorColumn}\n` + `NOTES: ${noteCount}\n` + `SELECTED: ${this.selectedNotes.length}\n` + `STATUS: ${this.isPlaying ? "PLAYING" : "PAUSED"}`);
      this.infoText.visible = true;
    } else {
      this.infoText.visible = false;
    }
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

    if (gamepad.held.b && this.holdBStartTime !== null) {
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
        this.placeNote();
      } else {
        // Long press - place freeze
        const freezeStart = holdDuration > 0 ? this.holdBStartTime : this.holdBStartTime + holdDuration;

        this.placeFreeze(freezeStart, Math.abs(holdDuration));
      }
    }

    if (gamepad.held.a && (gamepad.pressed.up || gamepad.pressed.down)) {
      if (!this.isAreaSelecting) {
        this.startAreaSelection();
      }
    } else if (gamepad.held.a && (gamepad.pressed.left || gamepad.pressed.right)) {
      if (game.time.now - this.holdADirectionTime > 200) {
        this.changeSnapDivision(gamepad.pressed.left ? -1 : 1);
        this.holdADirectionTime = game.time.now;
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

    this.getCurrentChartNotes().forEach(note => (note.hitEffectShown = false));

    if (this.audio.src) {
      this.audio.currentTime = this.playOffset;
      this.audio.play().catch(e => console.log("Audio play failed:", e));
    }
  }

  stopPlayback() {
    this.isPlaying = false;

    if (this.audio.src) {
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
    if (this.previewEndHandler) {
      clearTimeout(this.previewEndHandler);
      this.previewEndHandler();
    }
  }

  playPreview(start, length) {
    if (!this.isPlaying && this.audio.src) {
      this.abortPreview();

      this.audio.currentTime = start;

      this.previewEndHandler = () => {
        this.audio.pause();
        this.audio.currentTime = start;
        this.previewEndHandler = null;
      };

      this.audio.play().then(() => setTimeout(this.previewEndHandler, length * 1000));
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

  placeNote() {
    if (this.isPlaying) return;

    const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
    const notes = this.song.chart.notes[diff.type + diff.rating] || [];

    const existingNote = notes.find(note => note.column === this.cursorColumn && Math.abs(note.beat - this.cursorBeat) < 0.001);

    if (existingNote) {
      this.chartRenderer.killNote(existingNote);
      const index = notes.indexOf(existingNote);
      notes.splice(index, 1);

      const selectedIndex = this.selectedNotes.indexOf(existingNote);
      if (selectedIndex > -1) {
        this.selectedNotes.splice(selectedIndex, 1);
      }

      this.playExplosionEffect(this.cursorColumn);
    } else {
      const newNote = {
        type: "1",
        beat: this.cursorBeat,
        sec: this.chartRenderer.beatToSec(this.cursorBeat),
        column: this.cursorColumn
      };
      notes.push(newNote);
      this.playExplosionEffect(this.cursorColumn);
      this.previewNote(newNote);
    }

    this.sortNotes();
    this.updateInfoText();
  }

  placeFreeze(startBeat, duration, type = "2") {
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

  placeMine() {
    if (this.isPlaying) return;

    const notes = this.getCurrentChartNotes();

    const newNote = {
      type: "M",
      beat: this.cursorBeat,
      sec: this.chartRenderer.beatToSec(this.cursorBeat),
      column: this.cursorColumn
    };
    notes.push(newNote);
    this.previewNote(newNote);

    this.sortNotes();
    this.updateInfoText();
    this.playExplosionEffect(this.cursorColumn);
  }

  placeQuickHold() {
    if (this.isPlaying) return;

    const notes = this.getCurrentChartNotes();

    const newNote = {
      type: "2",
      beat: this.cursorBeat,
      sec: this.chartRenderer.beatToSec(this.cursorBeat),
      column: this.cursorColumn,
      beatLength: 1,
      secLength: 60 / this.chartRenderer.getCurrentBPM(this.cursorBeat),
      beatEnd: this.cursorBeat + 1,
      secEnd: this.chartRenderer.beatToSec(this.cursorBeat + 1)
    };
    notes.push(newNote);
    this.previewNote(newNote);

    this.sortNotes();
    this.updateInfoText();
    this.playExplosionEffect(this.cursorColumn);
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

    const contextMenu = new CarouselMenu(0, 48, 80, 64, {
      bgcolor: "#34495e",
      fgcolor: "#ffffff",
      align: "left",
      animate: true,
      inactiveAlpha: 0.6,
      activeAlpha: 1
    });

    if (this.selectedNotes.length === 0) {
      contextMenu.addItem("Place Mine", () => this.placeMine());
      contextMenu.addItem("Place Quick Hold", () => this.placeQuickHold());

      if (!this.getBPMChange()) {
        contextMenu.addItem("Add BPM Change", () => this.addBPMChange());
      } else {
        contextMenu.addItem("Remove BPM Change", () => this.removeBPMChange());
      }

      if (!this.getStop()) {
        contextMenu.addItem("Add Stop", () => this.addStop());
      } else {
        contextMenu.addItem("Remove Stop", () => this.removeStop());
      }

      if (!this.getBGChange()) {
        contextMenu.addItem("Add BG Change", () => this.addBGChange());
      } else {
        contextMenu.addItem("Remove BG Change", () => this.removeBGChange());
      }

      contextMenu.addItem("Detect BPM Here", () => this.detectBPMHere());
    } else if (this.selectedNotes.length === 1) {
      const note = this.selectedNotes[0];
      contextMenu.addItem("Unselect", () => (this.selectedNotes = []));

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

  convertNoteType(newType) {
    if (this.selectedNotes.length === 1) {
      this.selectedNotes[0].type = newType;
    }
  }

  convertNotesType(newType) {
    this.selectedNotes.forEach(note => {
      note.type = newType;
    });
  }

  convertFreezeType(newType) {
    if (this.selectedNotes.length === 1 && (this.selectedNotes[0].type === "2" || this.selectedNotes[0].type === "4")) {
      this.selectedNotes[0].type = newType;
    }
  }

  convertFreezesType(newType) {
    this.selectedNotes.forEach(note => {
      if (note.type === "2" || note.type === "4") {
        note.type = newType;
      }
    });
  }

  alignToBeatDivision() {
    if (this.selectedNotes.length === 1) {
      const note = this.selectedNotes[0];
      note.beat = this.getSnappedBeat(note.beat);
      note.sec = this.chartRenderer.beatToSec(note.beat);
      this.sortNotes();
    }
  }

  alignAllToBeatDivision() {
    this.selectedNotes.forEach(note => {
      note.beat = this.getSnappedBeat(note.beat);
      note.sec = this.chartRenderer.beatToSec(note.beat);
    });
    this.sortNotes();
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

  pickFile(accept, callback) {
    this.fileInput.accept = accept;
    this.currentFileCallback = callback;
    this.fileInput.click();
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && this.currentFileCallback) {
      this.currentFileCallback(file);
    }
    this.fileInput.value = "";
  }

  getBase64(dataUrl) {
    return dataUrl.replace("data:", "").replace(/^.+,/, "");
  }

  loadAudioFile(file) {
    try {
      const url = URL.createObjectURL(file);
      this.song.chart.audio = file.name;
      this.song.chart.audioUrl = url;
      this.files.audio = this.getBase64(url);
      this.audio.src = url;
      this.showMetadataScreen();
    } catch (error) {
      console.error("Error loading audio:", error);
    }
  }

  loadBackgroundFile(file) {
    try {
      const url = URL.createObjectURL(file);
      this.song.chart.background = file.name;
      this.files.background = this.getBase64(url);
      this.updateBackground();
      this.showMetadataScreen();
    } catch (error) {
      console.error("Error loading background:", error);
    }
  }

  loadBannerFile(file) {
    try {
      const url = URL.createObjectURL(file);
      this.song.chart.banner = file.name;
      this.files.banner = this.getBase64(url);
      this.showMetadataScreen();
    } catch (error) {
      console.error("Error loading banner:", error);
    }
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

    carousel.addItem("< Back", () => this.showMetadataScreen());
    carousel.onCancel.add(() => this.showMetadataScreen());
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
  
  async importProject() {
    // TODO: Import project data from zip
    // Will be capable of importing
    // - A folder containing song data (already implemented)
    // - A folder containing PadManiacs project json and project files
    // - A single SM or project json file ignoring required files
    // - A zip file containing StepMania .SM, audio, images and videos
    // - A zip file with .zip or .pmz extension contains PadManiacs project json and it's files
    
    this.showMetadataScreen();
  }
  
  async exportProject() {
    // TODO: Export project as PadManiacs ZIP file (.pmz) containing edited data and currently loaded files
    // - Need to take into account that only plain objects can be serialized with JSON.stringify. It's important to remove all note sprites before serializing the JSON
    // - Take in account audio files need to be converted to base64 to be saved as files in zip. The actual implementation should be 
    //   modified tostore file urls, then convert them to base64 with a special method
    // - The urlToBase64 method should work no matter if a data url or normal file:// or http(s):// url
    
    this.showMetadataScreen();
  }

  async exportSong() {
    // TODO: Export StepMania ZIP (.zip) file containing song files and chart data in StepMania .SM format
    // - Need to take into account audio files need to be converted to base64 to be saved as files in zip. The actual implementation should be 
    // - Need to take into that SM content generation methods inside SMFIle are buggy. Specially the method to generate measures section. Should be fixed before inplementing this
    //   modified tostore file urls, then convert them to base64 with a special method
    // - The urlToBase64 method should work no matter if a data url or normal file:// or http(s):// url
    
    this.showMetadataScreen();
  }

  saveToExternalStorage(blob, filename) {
    if (CURRENT_ENVIRONMENT === ENVIRONMENT.CORDOVA) {
      this.saveCordovaFile(blob, filename);
    } else if (CURRENT_ENVIRONMENT === ENVIRONMENT.NWJS) {
      this.saveNWJSFile(blob, filename);
    } else {
      this.exportSong();
    }
  }

  saveCordovaFile(blob, filename) {
    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, dir => {
      dir.getDirectory("Edits", { create: true }, editsDir => {
        editsDir.getFile(filename, { create: true }, fileEntry => {
          fileEntry.createWriter(fileWriter => {
            fileWriter.onwriteend = () => {
              notifications.add("Song saved to Edits folder!");
            };
            fileWriter.onerror = e => {
              console.error("Error saving song:", e);
              notifications.add("Save failed!");
            };
            fileWriter.write(blob);
          });
        });
      });
    });
  }

  saveNWJSFile(blob, filename) {
    const fs = require("fs");
    const path = require("path");

    const editsDir = path.join(nw.App.dataPath, "Edits");
    if (!fs.existsSync(editsDir)) {
      fs.mkdirSync(editsDir, { recursive: true });
    }

    const filePath = path.join(editsDir, filename);
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = Buffer.from(reader.result);
      fs.writeFile(filePath, buffer, err => {
        if (err) {
          console.error("Error saving song:", err);
          notifications.add("Save failed!");
        } else {
          notifications.add("Song saved to Edits folder!");
        }
      });
    };
    reader.readAsArrayBuffer(blob);
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
  }

  addNewDifficulty() {
    const newDiff = {
      type: "Medium",
      rating: "1"
    };
    this.song.chart.difficulties.push(newDiff);
    this.song.chart.notes[newDiff.type + newDiff.rating] = [];
    this.showChartsMenu();
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
        if (this.audio.src) {
          this.audio.currentTime = value;
          this.audio.play().then(() => {
            setTimeout(() => this.audio.pause(), this.song.chart.sampleLength * 1000);
          });
        }

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
        this.pickFile("image/*,video/*", async file => {
          bg.file = file.name;
          this.files.extra[file.name] = this.getBase64(URL.createObjectURL(file));
          this.editBGChangeFiles();
        });
      });
    });

    carousel.addItem("+ Add BG Change", () => {
      this.song.chart.backgrounds.push({
        beat: 0,
        file: "",
        opacity: 1,
        fadeIn: 0,
        fadeOut: 0,
        effect: 0,
        type: "image"
      });
      this.editBGChangeFiles();
    });

    carousel.addItem("< Back", () => this.showFileMenu());
    carousel.onCancel.add(() => this.showFileMenu());
  }

  createNewSongAndReload() {
    this.song = this.createNewSong();
    this.showMetadataScreen();
  }

  saveAndExit() {
    this.showMetadataScreen();
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
      this.bannerSprite.destroy();
      this.bannerSprite = null;
    }
  }

  loadBanner(url) {
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
      };
      img.src = url;
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

    const beats = [];
    
    this.startPlayback();
    
    const inputHandler = key => {
      if (key == "a") {
        beats.push(this.audio.currentTime);
        valueText.write(`BPM: ${this.calculateBPM(beats)}`);
        game.add.tween(valueText.scale)
          .to({ x: 1.1, y: 1.1 }, 50, Phaser.Easing.Quadratic.Out, true)
          .yoyo(true);
      } else if (key == "b") {
        background.destroy();
        instructionText.destroy();
        valueText.destroy();
        this.stopPlayback();
        gamepad.signals.pressed.any.remove(inputHandler);
        this.menuVisible = false;
      }
    };
    
    gamepad.signals.pressed.any.add(inputHandler);
  }

  addBPMChange() {
    this.menuVisible = true;

    new ValueInput(
      120,
      0,
      1000,
      1,
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

  removeBPMChange() {
    const bpmChange = this.getBPMChange();
    if (bpmChange) {
      const index = this.song.chart.bpmChanges.indexOf(bpmChange);
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

  removeStop() {
    const stop = this.getStop();
    if (stop) {
      const index = this.song.chart.stops.indexOf(stop);
      this.song.chart.stops.splice(index, 1);
    }
    this.updateInfoText();
  }

  addBGChange() {
    this.menuVisible = true;

    this.pickFile("image/*,video/*", async file => {
      const fileType = file.type.includes("video") ? "video" : "image";
      this.song.chart.backgrounds.push({
        beat: this.cursorBeat,
        file: file.name,
        opacity: 1,
        fadeIn: 0,
        fadeOut: 0,
        effect: 0,
        type: fileType
      });
      this.song.chart.backgrounds.sort((a, b) => a.beat - b.beat);
      this.files.extra[file.name] = this.getBase64(URL.createObjectURL(file));
      this.updateInfoText();
      this.menuVisible = false;
    });
  }

  getBGChange() {
    return this.song.chart.backgrounds.find(bg => Math.abs(bg.beat - this.cursorBeat) < 0.001);
  }

  removeBGChange() {
    const bgChange = this.getBGChange();
    if (bgChange) {
      const index = this.song.chart.backgrounds.indexOf(bgChange);
      this.song.chart.backgrounds.splice(index, 1);
    }
    this.updateInfoText();
  }

  update() {
    gamepad.update();

    if (this.currentScreen === "metadata") {
      if (this.mainCarousel) {
        this.mainCarousel.update();
      }
    } else if (this.currentScreen === "chartEdit") {
      this.handleChartEditInput();

      const { now, beat } = this.getCurrentTime();
      this.chartRenderer.render(now, beat);

      if (this.isPlaying) {
        this.cursorBeat = beat;
        this.updateCursorPosition();

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
    const judgeWindow = 0.1; // seconds

    notes.forEach(note => {
      if (!note.hitEffectShown && Math.abs(note.sec - now) < judgeWindow) {
        this.playExplosionEffect(note.column);
        note.hitEffectShown = true;
      }
    });
  }

  shutdown() {
    if (this.chartRenderer) {
      this.chartRenderer.destroy();
    }
    this.clearUI();
    if (this.cursorSprite) {
      this.cursorSprite.destroy();
    }
    if (this.selectionRect) {
      this.selectionRect.destroy();
    }
    if (this.freezePreviewSprite) {
      this.freezePreviewSprite.destroy();
    }
    if (this.infoText) {
      this.infoText.destroy();
    }
    if (this.backgroundSprite) {
      this.backgroundSprite.destroy();
    }
    if (this.backgroundLayer) {
      this.backgroundLayer.destroy();
    }
    if (this.fileInput) {
      document.body.removeChild(this.fileInput);
    }
    this.stopPlayback();
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
    }
  }
}
