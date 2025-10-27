let game, gamepad, backgroundMusic, notifications;

let Account = {
  ...DEFAULT_ACCOUNT,
  ...JSON.parse(localStorage.getItem("Account") || "{}")
};

const saveAccount = () => localStorage.setItem("Account", JSON.stringify(Account));

window.onload = () => {
  game = new Phaser.Game({
    width: 192,
    height: 112,
    renderer: Account.settings.renderer,
    scaleMode: Phaser.ScaleManager.SHOW_ALL,
    crisp: Account.settings.pixelated,
    antialias: false,
    alignV: false,
    alignH: true,
    enableDebug: false,
    failIfMajorPerformanceCaveat: false,
    forceSetTimeOut: false,
    clearBeforeRender: true,
    maxPointers: 0,
    keyboard: true,
    mouse: false,
    mouseWheel: false,
    mspointer: false,
    multiTexture: true,
    pointerLock: false,
    preserveDrawingBuffer: false,
    roundPixels: true,
    touch: false,
    transparent: false,
    parent: "game",
    state: {
      create() {
        game.state.add('Boot', Boot);
        game.state.add('Load', Load);
        game.state.add('LoadCordova', LoadCordova);
        game.state.add('LoadLocalSongs', LoadLocalSongs);
        game.state.add('LoadExternalSongs', LoadExternalSongs);
        game.state.add('LoadSongFolder', LoadSongFolder);
        game.state.add('Title', Title);
        game.state.add('MainMenu', MainMenu);
        game.state.add('SongSelect', SongSelect);
        game.state.add('Play', Play);
        game.state.add('Results', Results);
        game.state.start('Boot');
      }
    }
  });
};

class Boot {
  preload() {
    this.load.baseURL = "assets/";
    
    this.keys = [];
    
    Object.keys(FONTS).forEach(key => {
      const entry = FONTS[key];
      this.load.spritesheet(entry.font, `fonts/${key}.png`, entry.fontWidth || 4, entry.fontHeight || 6);
    });
    
    WINDOW_PANELS.forEach(key => {
      this.load.spritesheet(`ui_window_${key}`, `ui/window_${key}.png`, 8, 8);
      this.keys.push(`ui_window_${key}`);
    });
  }
  create() {
    gamepad = new Gamepad(game);
    
    notifications = new NotificationSystem();
    
    game.time.advancedTiming = true;
    
    game.world.updateOnlyExistingChildren = true;
    
    window.primaryAssets = this.keys;
    
    game.state.start("Load", true, false, [
      {
        key: "ui_background_gradient",
        url: "ui/background_gradient.png"
      },
      {
        key: "ui_logo_shape",
        url: "ui/logo_shape.png"
      },
      {
        key: "ui_hud_background",
        url: "ui/hud_background.png"
      },
      {
        key: "ui_navigation_hint",
        url: "ui/navigation_hint.png",
        type: "spritesheet",
        frameWidth: 192,
        frameHeight: 112
      },
      {
        key: "ui_difficulty_banner",
        url: "ui/difficulty_banner.png"
      },
      {
        key: "ui_lifebar",
        url: "ui/lifebar.png",
        type: "spritesheet",
        frameWidth: 1,
        frameHeight: 5
      },
      {
        key: "ui_acurracy_bar",
        url: "ui/acurracy_bar.png"
      },
      // Chart assets
      {
        key: "arrows",
        url: "chart/arrows.png",
        type: 'spritesheet',
        frameWidth: 16,
        frameHeight: 16
      },
      {
        key: "receptor",
        url: "chart/receptor.png",
        type: 'spritesheet', 
        frameWidth: 16,
        frameHeight: 16
      },
      {
        key: "explosion",
        url: "chart/explosion.png",
        type: 'image'
      },
      {
        key: "mineexplosion", 
        url: "chart/mine_explosion.png",
        type: 'image'
      },
      {
        key: "mine",
        url: "chart/mine.png",
        type: 'spritesheet',
        frameWidth: 16,
        frameHeight: 16
      },
      {
        key: "hold_end",
        url: "chart/hold_end.png",
        type: 'spritesheet',
        frameWidth: 16, 
        frameHeight: 8
      },
      {
        key: "hold_body",
        url: "chart/hold_body.png",
        type: 'spritesheet',
        frameWidth: 16,
        frameHeight: 112
      },
      {
        key: "roll_end", 
        url: "chart/roll_end.png",
        type: 'spritesheet',
        frameWidth: 16,
        frameHeight: 8
      },
      {
        key: "roll_body",
        url: "chart/roll_body.png",
        type: 'spritesheet',
        frameWidth: 16,
        frameHeight: 16
      }
    ], "LoadCordova");
  }
}

class Load {
  init(resources, nextState, nextStateParams) {
    this.resources = resources || [];
    this.nextState = nextState || 'Title';
    this.nextStateParams = nextStateParams || {};
    this.loadedCount = 0;
    this.totalCount = this.resources.length;
  }

  preload() {
    // Load all resources from the provided list
    this.resources.forEach(resource => {
      switch (resource.type) {
        case undefined:
        case 'image':
          this.load.image(resource.key, resource.url);
          break;
        case 'spritesheet':
          this.load.spritesheet(resource.key, resource.url, resource.frameWidth, resource.frameHeight);
          break;
        case 'audio':
          this.load.audio(resource.key, resource.url);
          break;
        case 'json':
          this.load.json(resource.key, resource.url);
          break;
      }
      
      this.loadedCount++;
    });

    // Create simple progress display
    this.progressText = new Text(96, 56, "LOADING ASSETS", FONTS.tiny);
    this.progressText.anchor.set(0.5);
  }

  create() {
    // All resources loaded, start next state
    game.state.start(this.nextState, true, false, this.nextStateParams);
  }
}

class LoadCordova {
  create() {
    if (window.location.protocol == "file:") {
      this.loadScript();
    } else {
      this.continue();
    }
  }
  loadScript() {
    this.progressText = new Text(96, 56, "INITIALIZING FILESYSTEM", FONTS.tiny);
    this.progressText.anchor.set(0.5);
    
    const script = document.createElement("script");
    script.src = "./cordova/cordova.js";
    document.head.appendChild(script);
    document.addEventListener("deviceready", () => {
      this.continue();
      document.addEventListener("backbutton", () => {
        if (game.state.current == "Play") {
          gamepad.press('start');
        } else {
          gamepad.press('b');
        }
      });
    });
  }
  continue() {
    game.state.start("LoadLocalSongs");
  }
}

class LoadLocalSongs {
  create() {
    this.progressText = new Text(96, 56, "LOADING SONGS", FONTS.tiny);
    this.progressText.anchor.set(0.5);
    this.songs = [];
    this.parser = new LocalSMParser();
    this.loadSongs();
  }
  async loadSongs() {
    try {
      // Define default song folders
      const defaultSongFolders = DEFAULT_SONG_FOLDERS;

      // Load each default song
      for (const folder of defaultSongFolders) {
        try {
          const song = await this.loadSong(folder);
          if (song) {
            this.songs.push(song);
          }
        } catch (error) {
          console.warn(`Failed to load song from ${folder}:`, error);
        }
      }

      // End
      this.finish();
      
    } catch (error) {
      console.error("Error loading songs:", error);
    }
  }
  async loadSong(folderName) {
    const baseUrl = `assets/songs/${folderName}/`;
    
    try {
      // Try to load .sm file with same name as folder
      let smUrl = baseUrl + folderName + '.sm';
      let smContent = await this.loadTextFile(smUrl);
      
      // If that fails, look for any .sm file in the folder
      if (!smContent) {
        const alternativeNames = ['song.sm', 'chart.sm', 'steps.sm'];
        for (const name of alternativeNames) {
          smContent = await this.loadTextFile(baseUrl + name);
          if (smContent) break;
        }
      }

      if (!smContent) {
        throw new Error(`No .sm file found in ${folderName}`);
      }

      // Parse the SM file
      const chart = await this.parser.parseSM(smContent, baseUrl);
      chart.folderName = folderName;
      chart.loaded = true;
      
      return chart;
      
    } catch (error) {
      console.warn(`Could not load song ${folderName}:`, error);
      return null;
    }
  }
  async loadTextFile(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          resolve(null);
        }
      };
      xhr.onerror = () => resolve(null);
      xhr.send();
    });
  }
  finish() {
    window.localSongs = this.songs;
    game.state.start("Title");
  }
}

class LoadExternalSongs {
  create() {
    this.progressText = new Text(96, 56, "LOADING EXTERNAL SONGS", FONTS.tiny);
    this.progressText.anchor.set(0.5);
    
    if (window.externalSongs) {
      this.songs = window.externalSongs;
      this.finish(window.lastExternalSongIndex);
      return;
    }
    
    this.songs = [];
    this.parser = new ExternalSMParser();
    this.loadedCount = 0;
    this.failedCount = 0;
    this.totalCount = 0;
    this.currentlyLoading = new Set();
    
    if (window.cordova && cordova.file) {
      this.loadSongsFromStorage();
    } else {
      this.showFileInput();
    }
  }

  async loadSongsFromStorage() {
    try {
      console.log("Loading songs from external storage...");
      
      const rootDir = await this.getDirectory(EXTERNAL_DIRECTORY);
      const allDirs = await this.listAllDirectories(rootDir);
      allDirs.unshift(rootDir);

      this.totalCount = allDirs.length;
      this.updateProgress();

      console.log(`Found ${this.totalCount} directories to scan`);

      if (ENABLE_PARALLEL_LOADING) {
        await this.loadDirectoriesParallel(allDirs);
      } else {
        await this.loadDirectoriesSequential(allDirs);
      }

      this.finish();
      
    } catch (error) {
      console.error("Error loading external songs:", error);
      this.showError("Failed to load external songs: " + error.message);
    }
  }

  async loadDirectoriesParallel(directories) {
    const batches = [];
    
    for (let i = 0; i < directories.length; i += MAX_PARALLEL_DOWNLOADS) {
      batches.push(directories.slice(i, i + MAX_PARALLEL_DOWNLOADS));
    }

    for (const batch of batches) {
      await this.processDirectoryBatch(batch);
    }
  }

  async processDirectoryBatch(batch) {
    const promises = batch.map(dir => this.processSongDirectoryWithTracking(dir));
    await Promise.allSettled(promises);
  }

  async loadDirectoriesSequential(directories) {
    for (const dir of directories) {
      await this.processSongDirectoryWithTracking(dir);
    }
  }

  async processSongDirectoryWithTracking(dirEntry) {
    if (ENABLE_PARALLEL_LOADING && this.currentlyLoading.size >= MAX_PARALLEL_DOWNLOADS) {
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (this.currentlyLoading.size < MAX_PARALLEL_DOWNLOADS) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 10);
      });
    }

    const dirName = dirEntry.name || "Unknown Directory";
    this.currentlyLoading.add(dirName);

    try {
      const song = await this.processSongDirectory(dirEntry);
      if (song) {
        this.songs.push(song);
        this.loadedCount++;
        console.log(`✓ Loaded: ${song.title || dirName}`);
      } else {
        this.failedCount++;
        console.log(`✗ Failed: ${dirName} (no valid chart found)`);
      }
    } catch (error) {
      console.warn(`✗ Error in ${dirName}:`, error);
      this.failedCount++;
    } finally {
      this.currentlyLoading.delete(dirName);
      this.updateProgress();
    }
  }

  async processSongDirectory(dirEntry) {
    try {
      const files = await this.listFiles(dirEntry);
      const chartFiles = {};

      for (const fileEntry of files) {
        const file = await this.getFile(fileEntry);
        chartFiles[file.name.toLowerCase()] = file;
      }

      const chartFileNames = Object.keys(chartFiles).filter(name => 
        name.endsWith(".sm") || name.endsWith(".ssc")
      );

      if (chartFileNames.length === 0) {
        console.log(`No chart files found in ${dirEntry.name}`);
        return null;
      }

      for (const smFileName of chartFileNames) {
        try {
          console.log(`Trying to parse ${smFileName} in ${dirEntry.name}`);
          const content = await this.readFileContent(chartFiles[smFileName]);
          const chart = this.parser.parseSM(chartFiles, content);
          
          if (chart && chart.difficulties && chart.difficulties.length > 0) {
            chart.folderName = dirEntry.name || "External Song";
            chart.loaded = true;
            console.log(`✓ Successfully parsed ${smFileName}`);
            return chart;
          }
        } catch (parseError) {
          console.warn(`Failed to parse ${smFileName}:`, parseError);
          continue;
        }
      }

      console.log(`No valid chart files in ${dirEntry.name}`);
      return null;
      
    } catch (error) {
      console.warn(`Error processing directory ${dirEntry.name}:`, error);
      return null;
    }
  }

  updateProgress() {
    const processed = this.loadedCount + this.failedCount;
    const progress = this.totalCount > 0 ? Math.round(processed / this.totalCount * 100) : 0;
    const loadingText = `LOADING EXTERNAL SONGS\n${this.loadedCount}/${this.totalCount} (${progress}%)\nFailed: ${this.failedCount}`;
    
    if (ENABLE_PARALLEL_LOADING) {
      this.progressText.write(loadingText + `\nParallel: ${this.currentlyLoading.size}/${MAX_PARALLEL_DOWNLOADS}`);
    } else {
      this.progressText.write(loadingText);
    }
  }

  showFileInput() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.webkitdirectory = true;
    fileInput.multiple = true;
    
    fileInput.onchange = (e) => {
      this.processFileInput(e.target.files);
    };
    
    fileInput.click();
  }

  async processFileInput(files) {
    try {
      const fileMap = {};
      for (let i = 0; i < files.length; i++) {
        fileMap[files[i].name.toLowerCase()] = files[i];
      }

      const directories = {};
      for (const file of files) {
        const path = file.webkitRelativePath;
        const dir = path.split('/')[0];
        if (!directories[dir]) {
          directories[dir] = {};
        }
        directories[dir][file.name.toLowerCase()] = file;
      }

      const dirNames = Object.keys(directories);
      this.totalCount = dirNames.length;
      this.updateProgress();

      if (ENABLE_PARALLEL_LOADING) {
        await this.processFileDirectoriesParallel(directories, dirNames);
      } else {
        await this.processFileDirectoriesSequential(directories, dirNames);
      }

      this.finish();
      
    } catch (error) {
      console.error("Error processing file input:", error);
      this.showError("Failed to load songs from files: " + error.message);
    }
  }

  async processFileDirectoriesParallel(directories, dirNames) {
    const batches = [];
    
    for (let i = 0; i < dirNames.length; i += MAX_PARALLEL_DOWNLOADS) {
      batches.push(dirNames.slice(i, i + MAX_PARALLEL_DOWNLOADS));
    }

    for (const batch of batches) {
      await this.processFileDirectoryBatch(directories, batch);
    }
  }

  async processFileDirectoryBatch(directories, batch) {
    const promises = batch.map(dirName => this.processSongFilesWithTracking(directories[dirName], dirName));
    await Promise.allSettled(promises);
  }

  async processFileDirectoriesSequential(directories, dirNames) {
    for (const dirName of dirNames) {
      await this.processSongFilesWithTracking(directories[dirName], dirName);
    }
  }

  async processSongFilesWithTracking(files, folderName) {
    if (ENABLE_PARALLEL_LOADING && this.currentlyLoading.size >= MAX_PARALLEL_DOWNLOADS) {
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (this.currentlyLoading.size < MAX_PARALLEL_DOWNLOADS) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 10);
      });
    }

    this.currentlyLoading.add(folderName);

    try {
      const song = await this.processSongFiles(files, folderName);
      if (song) {
        this.songs.push(song);
        this.loadedCount++;
        console.log(`✓ Loaded: ${song.title || folderName}`);
      } else {
        this.failedCount++;
        console.log(`✗ Failed: ${folderName} (no valid chart found)`);
      }
    } catch (error) {
      console.warn(`✗ Error in ${folderName}:`, error);
      this.failedCount++;
    } finally {
      this.currentlyLoading.delete(folderName);
      this.updateProgress();
    }
  }

  async processSongFiles(files, folderName) {
    const chartFileNames = Object.keys(files).filter(name => 
      name.endsWith(".sm") || name.endsWith(".ssc")
    );
    
    if (chartFileNames.length === 0) {
      console.log(`No chart files found in ${folderName}`);
      return null;
    }

    for (const smFileName of chartFileNames) {
      try {
        console.log(`Trying to parse ${smFileName} in ${folderName}`);
        const content = await this.readFileContent(files[smFileName]);
        const chart = this.parser.parseSM(files, content);
        
        if (chart && chart.difficulties && chart.difficulties.length > 0) {
          chart.folderName = folderName;
          chart.loaded = true;
          console.log(`✓ Successfully parsed ${smFileName}`);
          return chart;
        }
      } catch (parseError) {
        console.warn(`Failed to parse ${smFileName}:`, parseError);
        continue;
      }
    }

    console.log(`No valid chart files in ${folderName}`);
    return null;
  }

  getDirectory(path) {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(
        cordova.file.externalRootDirectory + path,
        dir => resolve(dir),
        err => reject(err)
      );
    });
  }

  listDirectories(dirEntry) {
    return new Promise((resolve, reject) => {
      dirEntry.createReader().readEntries(
        entries => resolve(entries.filter(e => e.isDirectory)),
        err => reject(err)
      );
    });
  }

  listAllDirectories(startDir) {
    return new Promise(async resolve => {
      const dirs = [];
      const queue = [startDir];

      while (queue.length) {
        const dir = queue.shift();
        try {
          const subDirs = await this.listDirectories(dir);
          dirs.push(...subDirs);
          queue.push(...subDirs);
        } catch (error) {
          console.warn(`Error listing directories in ${dir.name}:`, error);
        }
      }

      resolve(dirs);
    });
  }

  listFiles(dirEntry) {
    return new Promise((resolve, reject) => {
      dirEntry.createReader().readEntries(
        entries => resolve(entries.filter(e => e.isFile)),
        err => reject(err)
      );
    });
  }

  getFile(fileEntry) {
    return new Promise((resolve, reject) => {
      fileEntry.file(
        file => resolve(file),
        err => reject(err)
      );
    });
  }

  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  showError(message) {
    this.progressText.write(message);
    game.time.events.add(3000, () => {
      game.state.start("MainMenu");
    });
  }

  finish(resetIndex = 0) {
    console.log(`Loading complete: ${this.loadedCount} songs loaded, ${this.failedCount} failed`);
    
    if (this.songs.length === 0) {
      this.showError("No songs found in any folders");
      return;
    }
    
    window.externalSongs = this.songs;
    
    game.state.start("SongSelect", true, false, this.songs, resetIndex);
    
    setTimeout(() => window.lastExternalSongIndex = window.selectStartingIndex)
  }
}

class LoadSongFolder {
  create() {
    this.progressText = new Text(96, 56, "SELECT SONG FOLDER", FONTS.tiny);
    this.progressText.anchor.set(0.5);

    this.parser = new ExternalSMParser();
    this.showFileInput();
  }

  showFileInput() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.webkitdirectory = true;
    fileInput.multiple = true;

    fileInput.onchange = e => {
      this.processFiles(e.target.files);
    };

    // Add a fallback for non-webkit browsers
    if (!fileInput.webkitdirectory) {
      fileInput.multiple = true;
      this.progressText.write("Select all song files");
    }

    fileInput.click();
  }

  async processFiles(files) {
    try {
      this.progressText.write("LOADING SONG...");

      const fileMap = {};
      for (let i = 0; i < files.length; i++) {
        fileMap[files[i].name.toLowerCase()] = files[i];
      }

      // Find .sm file
      const chartFileNames = Object.keys(fileMap).filter(name => name.endsWith(".sm"));

      if (chartFileNames.length === 0) {
        this.showError("No .sm file found in selected folder");
        return;
      }

      const smFileName = chartFileNames[0];
      const content = await this.readFileContent(fileMap[smFileName]);

      const chart = this.parser.parseSM(fileMap, content);
      chart.folderName = "External Song";
      chart.loaded = true;

      // Start gameplay directly with this single song
      game.state.start("SongSelect", true, false, [ chart ]);
    } catch (error) {
      console.error("Error loading song folder:", error);
      this.showError("Failed to load song");
    }
  }

  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  showError(message) {
    this.progressText.write(message);
    game.time.events.add(3000, () => {
      game.state.start("MainMenu");
    });
  }
}

class Title {
  create() {
    game.renderer.setTexturePriority([
      'arrows',
      'explosion',
      //'hold_body',
      //'hold_end',
      //'roll_body',
      //'roll_end',
      'mine',
      'mineexplosion',
      'receptor',
      'ui_lifebar',
      'ui_logo_shape',
      ...window.primaryAssets
    ]);
    
    game.camera.fadeIn(0xffffff);
    
    this.background = new BackgroundGradient();
    this.lines = new FuturisticLines();
    this.logo = new Logo();
    
    this.inputInstructionText = new Text(game.width / 2, 80, "PRESS ANY KEY");
    this.inputInstructionText.anchor.x = 0.5;
    game.add.tween(this.inputInstructionText).to({ alpha: 0 }, 500, "Linear", true, 0, -1).yoyo(true);
    
    this.text = game.add.sprite(0, 0);
    
    this.creditText = new Text(2, 110, "(C) Retora 2025", this.text);
    this.creditText.anchor.y = 1;
    
    this.creditText = new Text(190, 110, "v0.0.1", this.text);
    this.creditText.anchor.set(1);
    
    if (!backgroundMusic) {
      backgroundMusic = new BackgroundMusic();
    }
    backgroundMusic.playLastSong();
    
    this.introEnded = false;
    
    this.logo.intro(() => this.introEnded = true);
  }
  update() {
    gamepad.update();
    
    if (this.introEnded && !this.outroStarted && gamepad.pressed.any) {
      this.outroStarted = true;
      this.text.alpha = 0;
      this.logo.outro(() => game.state.start('MainMenu'));
    }
  }
}

class MainMenu {
  create() {
    game.camera.fadeIn(0xffffff);
    
    new FuturisticLines();
    
    new BackgroundGradient();
    
    game.add.sprite(0, 0, "ui_navigation_hint");
    
    this.menu();
    
    // Only start music if it's not already playing from Title
    if (!backgroundMusic || !backgroundMusic.isPlaying) {
      if (!backgroundMusic) {
        backgroundMusic = new BackgroundMusic();
      }
      backgroundMusic.playLastSong();
    }
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
      
      if (typeof window.cordova !== "undefined") {
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
      if (typeof window.cordova != "undefined") carousel.addItem("User Songs", () => this.loadExternalSongs());
      carousel.addItem("Load Single Song", () => this.loadSingleSong());
      if (typeof window.cordova != "undefined" && window.externalSongs) {
        carousel.addItem("Reload User Songs", () => {
          backgroundMusic.refreshCache();
          this.loadExternalSongs();
        });
      }
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
      
      let index = 0;
      if (Account.settings.enableMenuMusic) {
        index = Account.settings.randomSong ? 1 : 0;
      } else {
        index = 2;
      }
      
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
          
          if (notifications && notifications.canShowInCurrentState()) {
            //notifications.show(`NOTE COLORS\n${noteOptions[index].display}`, 1500);
          }
          
          // If we're in gameplay, update immediately
          const currentState = game.state.getCurrentState();
          if (currentState instanceof Play && currentState.player) {
            currentState.player.setNoteColorOption(selectedOption);
          }
        }
      );

      settingsWindow.addSettingItem(
        "Note Speed",
        ["Normal", "Double"],
        Account.settings.noteSpeedMult - 1,
        index => {
          Account.settings.noteSpeedMult = index + 1;
          saveAccount();
        }
      );
      
      const offsetOptions = [];
      for (let ms = -400; ms <= 400; ms += 25) {
        offsetOptions.push(`${ms}ms`);
      }
      
      const currentOffset = Account.settings.userOffset || 0;
      const currentOffsetIndex = (currentOffset + 400) / 25;
      
      settingsWindow.addSettingItem(
        "Global Offset",
        offsetOptions,
        currentOffsetIndex,
        index => {
          const newOffset = (index * 25) - 400;
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
      
      settingsWindow.addItem(
        "Erase Highscores",
        "",
        () => eraseHighscores()
      );
      
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
    
    const confirm = (message, onConfirm, onCancel) => {
      manager.remove(settingsWindow, true);
      
      const text = new Text(game.width / 2, 40, message || "You sure?", FONTS.shaded);
      text.anchor.x = 0.5;
      
      const window = manager.createWindow(10, 7, 5, 4, "1");
      window.fontTint = 0x76fcde;
      
      window.offset = {
        x: 7,
        y: 4
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
    });
    
    const restoreDefaultSettings = () => {
      confirm("All settings will be restored to default.\nA refresh is needed", () => {
        Account.settings = DEFAULT_ACCOUNT.settings;
        saveAccount();
        window.location.reload();
      }, () => settings());
    }
    
    const reload = () => confirm("Restart Now?", () => location.reload(), () => settings());
    
    const exit = () => confirm("Sure? Exit?", () => navigator.app.exitApp(), () => home());
    
    home();
  }
  freePlay() {
    game.state.start("SongSelect", true, false, window.localSongs);
  }
  loadExternalSongs() {
    game.state.start("LoadExternalSongs");
  }
  loadSingleSong() {
    game.state.start("LoadSongFolder");
  }
  update() {
    gamepad.update();
    this.manager?.update();
  }
  shutdown() {
    // Stop music when leaving MainMenu for gameplay states
    if (backgroundMusic) {
      backgroundMusic.stop();
    }
  }
}

class SongSelect {
  init(songs, index, autoSelect) {
    this.songs = songs || [];
    this.songs = songs ?
      songs :
      window.selectedSongs || []
    ;
    window.selectedSongs = this.songs;
    this.startingIndex = index ?
      index :
      window.selectStartingIndex || 0
    ;
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
    this.cdtitleImg = document.createElement("img");
    
    this.previewCanvas = document.createElement("canvas");
    this.previewCtx = this.previewCanvas.getContext("2d");
    
    this.navigationHint = game.add.sprite(0, 0, "ui_navigation_hint", 2);
    
    this.autoplayText = new Text(4, 104, "");
    
    this.bannerSprite = game.add.sprite(4, 4, null);

    this.metadataText = new Text(102, 4, "");
    
    this.highScoreText = new Text(104, 50, "");
    
    window.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.previewAudio?.pause();
      } else {
        this.previewAudio?.play();
      }
    });
    
    this.createSongSelectionMenu();
    
    if (this.autoSelect) {
      this.selectSong(this.songs[this.songCarousel.selectedIndex], this.songCarousel.selectedIndex);
      this.songCarousel.destroy();
    }
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
    if (song.audioUrl) {
      // Load and play preview
      this.previewAudio.src = song.audioUrl;
      this.previewAudio.currentTime = song.sampleStart || 0;
      this.previewAudio.play();
    }
    if (song.banner) {
      this.bannerImg.src = song.banner;
      this.bannerImg.onload = () => {
        this.previewCtx.drawImage(this.bannerImg, 0, 0, 96, 32);
        
        const texture = PIXI.Texture.fromCanvas(this.previewCanvas);
        
        this.bannerSprite.loadTexture(texture);
      };
    }
    this.metadataText.write(this.getMetadataText(song));
    this.metadataText.wrapPreserveNewlines(80);
    this.displayHighScores(song);
    this.startingIndex = window.selectStartingIndex = this.songCarousel.selectedIndex;
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
    if (artist) text += artist + '\n';
    if (genre) text += genre + '\n';
    if (credit) text += credit;
    
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
    
    // Add difficulties
    song.difficulties.forEach((diff, index) => {
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
    console.log(song);
    // Load all required assets for the song
    const resources = [
      {
        key: `song_${song.folderName}_audio`,
        url: song.audioUrl,
        type: 'audio'
      }
    ];

    // Add banner if available
    if (song.banner && song.banner !== "assets/no-banner.png") {
      resources.push({
        key: `song_${song.folderName}_banner`,
        url: song.banner,
        type: 'image'
      });
    }

    // Add background if available
    if (song.background && song.background !== "assets/no-background.png") {
      resources.push({
        key: `song_${song.folderName}_background`,
        url: song.background,
        type: 'image'
      });
    }

    // Load resources and start gameplay
    game.state.start("Load", true, false, resources, "Play", {
      chart: song,
      difficultyIndex: difficultyIndex
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
    this.previewAudio = null;
  }
}

class Play {
  init(song, difficultyIndex) {
    this.song = song;
    this.difficultyIndex = difficultyIndex;
    this.player = null;
    this.backgroundQueue = [];
    this.currentBackground = null;
    this.isPaused = false;
    this.pauseStartTime = 0;
    this.totalPausedDuration = 0;
    this.pendingSongStart = false;
    this.audioEndListener = null;
    this.started = false;
    this.startTime = 0;
    this.autoplay = Account.settings.autoplay;
    
    // Save last song to Account
    Account.lastSong = {
      url: song.chart.audioUrl,
      title: song.chart.title,
      artist: song.chart.artist,
      sampleStart: song.chart.sampleStart || 0,
      isExternal: song.chart.files !== undefined // Flag for external songs
    };
    saveAccount();
    
    // Game constants
    this.JUDGE_WINDOWS = {
      marvelous: 0.15,
      perfect: 0.2,
      great: 0.25,
      good: 0.3,
      boo: 0.4
    };
    
    this.SCORE_VALUES = {
      marvelous: 1000,
      perfect: 800,
      great: 500,
      good: 200,
      boo: 50,
      miss: 0
    };
  }
  
  create() {
    // Ensure background music is stopped during gameplay
    if (backgroundMusic) {
      backgroundMusic.stop();
    }
    
    game.camera.fadeIn(0x000000);
    
    // Create background
    this.backgroundSprite = game.add.sprite(0, 0, null);
    this.backgroundSprite.alpha = 0.6;
    this.backgroundCanvas = document.createElement("canvas");
    this.backgroundCanvas.width = 192;
    this.backgroundCanvas.height = 112;
    this.backgroundCtx = this.backgroundCanvas.getContext("2d");
    
    // Create audio element
    this.audio = document.createElement("audio");
    this.audio.src = this.song.chart.audioUrl;
    this.audio.volume = [0,25,50,75,100][Account.settings.volume] / 100;
    
    window.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (!this.isPaused) this.pause();
      }
    });
    
    // Create video element for background videos
    this.video = document.createElement("video");
    this.video.muted = true;
    this.video.loop = true;
    
    this.createHud();
    
    this.player = new Player(this);
    
    this.songStart();
  }
  
  createHud() {
    this.backgroundGradient = new BackgroundGradient(0, 0.4, 5000);

    this.hud = game.add.sprite(0, 0, "ui_hud_background", 0);
  
    const difficulty = this.song.chart.difficulties[this.song.difficultyIndex];
    
    this.difficultyBanner = game.add.sprite(0, 0, "ui_difficulty_banner", 0);
    this.difficultyBanner.tint = this.getDifficultyColor(difficulty.rating);
    this.hud.addChild(this.difficultyBanner);
    
    this.difficultyTypeText = new Text(5, 1, difficulty.type.substr(0, 7), null, this.difficultyBanner);
    
    const title = this.song.chart.titleTranslit || this.song.chart.title;
    
    this.songTitleText = new Text(34, 1, title, null, this.hud);
    this.playerName = new Text(4, 8, "Miku", FONTS.shaded, this.hud);
    this.playerName.tint = 0xffffff;
    
    if (title.length > 28) this.songTitleText.scrollwrite(title, 28);
    
    this.scoreText = new Text(22, 12, "0".repeat(9), null, this.hud);
    
    this.lifebarStart = game.add.sprite(21, 8, "ui_lifebar", 0);
    this.lifebarMiddle = game.add.sprite(1, 0, "ui_lifebar", 1);
    this.lifebarMiddle.width = 104;
    this.lifebarEnd = game.add.sprite(104, 0, "ui_lifebar", 2);
    
    this.hud.addChild(this.lifebarStart);
    this.lifebarStart.addChild(this.lifebarMiddle);
    this.lifebarStart.addChild(this.lifebarEnd);
    
    // Autoplay text
    this.autoplayText = new Text(4, 90, this.autoplay ? "AUTOPLAY" : "", FONTS.stroke, this.hud);
    
    this.healthText = new Text(137, 8, "100", FONTS.number, this.hud);
    this.healthText.anchor.x = 1;
    
    this.judgementText = new Text(game.width / 2, 60, "", FONTS.shaded);
    this.judgementText.anchor.set(0.5);
    
    this.acurracyBar = game.add.sprite(41, 108, "ui_acurracy_bar");
    this.hud.addChild(this.acurracyBar);
    
    this.comboText = new Text(191, 106, "0", FONTS.combo);
    this.comboText.anchor.set(1);
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
    return (r << 16) | (g << 8) | b;
  }
  
  getDifficultyColorFromType(type) {
    return {
      'Beginner': 0x00ffb2,
      'Easy': 0x00ff4c,
      'Medium': 0xffcc00,
      'Hard': 0xff7f00,
      'Challenge': 0xff4c00,
    }[type];
  }
  
  songStart(initialDelay = 2000) {
    // Set initial background
    if (this.song.chart.background && this.song.chart.background !== "assets/no-background.png") {
      this.loadBackgroundImage(this.song.chart.background);
    } else {
      // Default black background
      this.backgroundCtx.fillStyle = "#000000";
      this.backgroundCtx.fillRect(0, 0, 192, 112);
      this.updateBackgroundTexture();
    }
    
    // Apply both chart offset and user offset
    const totalOffset = (this.song.chart.offset || 0) * 1000 + this.userOffset;
    this.startTime = game.time.now + initialDelay - totalOffset;
    
    setTimeout(() => this.startChart(), initialDelay);
    
    this.audioEndListener = this.audio.addEventListener("ended", () => this.songEnd(), { once: true });
  }
  
  startChart() {
    if (this.isPaused) {
      this.pendingSongStart = true;
      return;
    }
    this.audio.play();
    this.started = true;
  }
  
  loadBackgroundImage(url) {
    const img = new Image();
    img.onload = () => {
      this.backgroundCtx.drawImage(img, 0, 0, 192, 112);
      this.updateBackgroundTexture();
    };
    img.src = url;
  }
  
  updateBackgroundTexture() {
    const texture = PIXI.Texture.fromCanvas(this.backgroundCanvas);
    this.backgroundSprite.loadTexture(texture);
  }
  
  songEnd() {
    // Pass game data to Results state
    const gameData = {
      song: this.song,
      difficultyIndex: this.difficultyIndex,
      player: this.player
    };
    
    game.state.start("Results", true, false, gameData);
  }
  
  togglePause() {
    if (this.isAnimating) return;
    
    if (!this.isPaused) {
      this.pause();
    } else {
      this.resume();
    }
  }
  
  pause() {
    this.isPaused = true;
    this.pauseStartTime = game.time.now;
    this.audio?.pause();
    if (this.video.src) this.video?.pause();
    this.showPauseMenu();
  }
  
  resume() {
    this.isPaused = false;
    this.totalPausedDuration += game.time.now - this.pauseStartTime;
    this.hidePauseMenu();
    if (this.pendingSongStart) {
      this.pendingSongStart = false;
      this.startChart();
    } else {
      if (this.video.src) this.video?.play();
      this.audio?.play();
    }
  }
  
  showPauseMenu() {
    const x = 10;
    const y = game.height / 2 - 20;
    const width = 80;
    const height = 60;
    
    this.pauseBg = game.add.graphics(0, 0);
    
    this.pauseBg.beginFill(0x000000, 0.6);
    this.pauseBg.drawRect(0, 0, 192, 112);
    this.pauseBg.endFill();
    
    this.pauseCarousel = new CarouselMenu(x, y, width, height, {
      bgcolor: "brown",
      fgcolor: "#ffffff",
      align: "center",
      animate: true
    });
    
    this.pauseCarousel.addItem("CONTINUE", () => this.resume());
    if (Account.settings.autoplay) {
      this.pauseCarousel.addItem("DISABLE AUTOPLAY", () => {
        Account.settings.autoplay = false;
        game.state.start("SongSelect", true, false, null, null, true);
      });
    }
    this.pauseCarousel.addItem("RESTART", () => game.state.restart(true, false, this.song, this.difficultyIndex));
    this.pauseCarousel.addItem("GIVE UP", () => this.songEnd());
    this.pauseCarousel.addItem("QUIT", () => game.state.start("MainMenu"));
    
    this.pauseCarousel.onCancel.add(() => this.resume());
  }
  
  hidePauseMenu() {
    if (this.pauseCarousel) {
      this.pauseBg.destroy();
      this.pauseCarousel.destroy();
      this.pauseCarousel = null;
    }
  }
  
  getCurrentTime() {
    if (this.isPaused) {
      const elapsed = this.pauseStartTime - this.startTime - this.totalPausedDuration;
      return {
        now: elapsed / 1000,
        beat: this.secToBeat(elapsed / 1000)
      };
    } else {
      const elapsed = game.time.now - this.startTime - this.totalPausedDuration;
      return {
        now: elapsed / 1000,
        beat: this.secToBeat(elapsed / 1000)
      };
    }
  }
  
  secToBeat(sec) {
    return this.player ? this.player.secToBeat(sec) : 0;
  }
  
  update() {
    gamepad.update();
    
    if (this.isPaused) return;
    
    // Pause with start button
    if (gamepad.pressed.start && !this.lastStart) {
      this.togglePause();
    }
    this.lastStart = gamepad.pressed.start;
    
    this.player.update();
    
    this.hud.bringToTop();
    this.hud.alpha = this.player.gameOver ? 0.5 : 1;
    
    this.judgementText.bringToTop();
    this.comboText.bringToTop();
  }
  
  render() {
    if (this.player) {
      this.player.render();
    }
  }
  
  shutdown() {
    this.audio.removeEventListener("ended", this.audioEndListener);
    this.audio.pause();
    this.audio.src = "";
    this.audio = null;
    if (this.video.src) {
      this.video.pause();
      this.video.src = "";
      this.video = null;
    }
  }
}

class Player {
  constructor(scene) {
    this.scene = scene;
    this.chart = JSON.parse(JSON.stringify(scene.song.chart));
    this.difficulty = this.chart.difficulties[scene.song.difficultyIndex];
    this.notes = this.chart.notes[this.difficulty.type + this.difficulty.rating];
    this.bpmChanges = this.chart.bpmChanges;
    this.stops = this.chart.stops;
    
    this.autoplay = scene.autoplay;
    this.autoplayActiveHolds = new Set();

    // Gamepad keymap
    this.keymap = {
      left: 0,
      down: 1,
      up: 2,
      right: 3,
      a: 3,
      b: 2
    };

    // Game state
    this.inputStates = [false, false, false, false];
    this.lastInputStates = [false, false, false, false];
    this.activeHolds = {};
    this.heldColumns = new Set();
    this.judgementHistory = [];
    this.lastNoteCheckBeats = [0, 0, 0, 0];
    this.score = 0;
    this.combo = 0;
    this.acurracy = 0;
    this.maxCombo = 0;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.previousHealth = this.health;

    // Visual elements
    this.receptors = [];
    this.judgementText = null;
    this.comboText = null;
    this.scoreText = null;
    this.healthText = null;

    // Game constants
    this.VERTICAL_SEPARATION = 1.5;
    this.NOTE_SPEED_MULTIPLIER = Account.settings.noteSpeedMult + 1;
    this.JUDGE_LINE = 90;
    this.COLUMN_SIZE = 16;
    this.COLUMN_SEPARATION = 4;
    this.HOLD_FORGIVENESS = 0.3;
    this.ROLL_FORGIVENESS = 0.3;
    this.ROLL_REQUIRED_INTERVALS = 2;
    this.INACTIVE_COLOR = 0x888888;
    
    // Accuracy tracking
    this.judgementCounts = {
      marvelous: 0,
      perfect: 0,
      great: 0,
      good: 0,
      boo: 0,
      miss: 0
    };
    this.totalNotes = 0;
    this.accuracy = 0;
    this.gameOver = false;
    
    // Calculate total notes for accuracy
    this.calculateTotalNotes();
    this.updateAccuracy();

    this.initialize();
    
    // Groups for pooling
    this.freezeBodyGroup = game.add.group();
    this.freezeEndGroup = game.add.group();
    this.notesGroup = game.add.group();
    
    // Note color option (default to NOTE)
    this.noteColorOption = Account.settings.noteColorOption || 'NOTE';
    
    // Color mappings for different options
    this.colorMappings = {
      NOTE: this.getNoteColorMapping(),
      VIVID: this.getVividColorMapping(),
      FLAT: this.getFlatColorMapping(),
      RAINBOW: this.getRainbowColorMapping()
    };
  }

  initialize() {
    const leftOffset = this.calculateLeftOffset();

    // Create receptors
    this.receptors = [];
    for (let i = 0; i < 4; i++) {
      const receptor = game.add.sprite(leftOffset + i * (this.COLUMN_SIZE + this.COLUMN_SEPARATION) + this.COLUMN_SIZE / 2, this.JUDGE_LINE, "receptor", 2);
      receptor.anchor.set(0.5);
      receptor.angle = {
        0: 90, // left
        1: 0, // down
        2: 180, // up
        3: -90 // right
      }[i];

      receptor.inputEnabled = true;
      receptor.down = false;
      receptor.events.onInputDown.add(() => this.handleInput(i, true));
      receptor.events.onInputUp.add(() => this.handleInput(i, false));

      receptor.animations.add("down", [2, 1, 0], 30, false);
      receptor.animations.add("up", [0, 1, 2], 30, false);

      // Add explosion effect for receptors
      const explosion = game.add.sprite(receptor.x, receptor.y, "explosion");
      explosion.anchor.set(0.5);
      explosion.angle = receptor.angle;
      explosion.visible = false;
      receptor.explosion = explosion;

      const duration = 50;
      explosion.visible = false;
      explosion.scale.setTo(1.5);
      game.add.tween(explosion.scale).to({ x: 2, y: 2 }, duration, "Linear", true).yoyo(true).repeat(-1);

      this.receptors.push(receptor);
    }

    // Create UI text elements
    this.judgementText =
      this.scene.judgementText ||
      new Text(96, 20, "", {
        tint: 0xffffff
      });
    
    this.comboText =
      this.scene.comboText ||
      new Text(96, 40, "0", {
        tint: 0xffffff
      });

    this.scoreText =
      this.scene.scoreText ||
      new Text(8, 8, "00000000", {
        tint: 0xffffff
      });

    this.healthText =
      this.scene.healthText ||
      new Text(184, 8, "100%", {
        tint: 0xffffff
      });
  }

  calculateTotalNotes() {
    this.totalNotes = this.notes.filter(note => 
      note.type === "1" || note.type === "2" || note.type === "4"
    ).length;
  }
  
  calculateLeftOffset() {
    const totalWidth = 4 * this.COLUMN_SIZE + 3 * this.COLUMN_SEPARATION;
    return (192 - totalWidth) / 2;
  }
  
  // AI autoplay method
  autoPlay() {
    if (!this.scene.startTime || this.scene.isPaused) return;
    
    const { now, beat } = this.scene.getCurrentTime();
    
    // Process regular notes for auto-play
    for (let column = 0; column < 4; column++) {
      const closestNote = this.notes.find(n => 
        !n.hit && 
        n.column === column && 
        n.type === "1" && 
        Math.abs(n.beat - beat) <= this.scene.JUDGE_WINDOWS.marvelous
      );
      
      if (closestNote && !this.inputStates[column]) {
        // Simulate perfect input - press and immediately release
        this.handleInput(column, true);
        this.handleInput(column, false);
      }
    }
    
    // Process hold notes for auto-play
    for (let column = 0; column < 4; column++) {
      const holdNote = this.notes.find(n => 
        (n.type === "2" || n.type === "4") && 
        n.column === column && 
        !n.hit && 
        !n.holdActive && // Only process if not already active
        Math.abs(n.beat - beat) <= this.scene.JUDGE_WINDOWS.marvelous
      );
      
      if (holdNote && !this.autoplayActiveHolds.has(column)) {
        // Start hold
        this.handleInput(column, true);
        this.autoplayActiveHolds.add(column);
      }
      
      // Check if we should release completed holds
      const activeHold = this.activeHolds[column];
      if (activeHold && activeHold.progress >= activeHold.note.secLength) {
        this.handleInput(column, false);
        this.autoplayActiveHolds.delete(column);
      }
    }
    
    // Process roll notes (type "4") - need rapid tapping
    for (let column = 0; column < 4; column++) {
      const rollNote = this.notes.find(n => 
        n.type === "4" && 
        n.column === column && 
        !n.hit && 
        n.beat <= beat && 
        n.beat + n.beatLength >= beat
      );
      
      if (rollNote && this.autoplayActiveHolds.has(column)) {
        // For rolls, simulate rapid tapping while the note is active
        const activeHold = this.activeHolds[column];
        if (activeHold && activeHold.note === rollNote) {
          const timeSinceLastTap = now - (activeHold.lastTap || 0);
          const tapInterval = 100; // Tap every 100ms for rolls
          
          if (timeSinceLastTap > tapInterval) {
            // Simulate tap by briefly releasing and pressing
            this.handleInput(column, false);
            this.handleInput(column, true);
            activeHold.lastTap = now;
            activeHold.tapped++;
          }
        }
      }
    }
    
    // Clean up any holds that are no longer active but we think they are
    for (let column of this.autoplayActiveHolds) {
      const activeHold = this.activeHolds[column];
      if (!activeHold || activeHold.note.hit) {
        this.handleInput(column, false);
        this.autoplayActiveHolds.delete(column);
      }
    }
  }

  // Input handling
  handleInput(column, isKeyDown) {
    if (!this.scene.startTime || this.scene.isPaused) return;

    const { now, beat } = this.scene.getCurrentTime();

    this.inputStates[column] = isKeyDown;

    const hold = this.activeHolds[column];
    if (isKeyDown) {
      if (hold && hold.inactive) {
        if (now - hold.lastRelease < this.HOLD_FORGIVENESS) {
          hold.active = true;
          hold.inactive = false;
          hold.pressCount++;
          hold.lastPress = now;
          this.toggleHoldExplosion(column, true);
        }
      }
    }

    if (hold && hold.inactive) {
      if (now - hold.lastRelease < this.HOLD_FORGIVENESS) {
        if (isKeyDown) {
          hold.active = true;
          hold.inactive = false;
          hold.pressCount++;
          hold.lastPress = now;
          this.toggleHoldExplosion(column, true);
        }
      }
    }

    if (isKeyDown) {
      this.heldColumns.add(column);
      this.checkHoldStart(column, now, beat);
    } else {
      this.heldColumns.delete(column);
      this.checkHoldRelease(column, now);
    }

    if (isKeyDown) {
      this.checkRegularNotes(column, now, beat);
    }

    if (isKeyDown) {
      this.heldColumns.add(column);
      this.checkHoldStart(column, now, beat);
    } else {
      this.heldColumns.delete(column);
      this.checkHoldRelease(column, now);
    }

    if (isKeyDown) {
      const hold = this.activeHolds[column];
      if (hold?.note.type === "4") {
        hold.tapped++;
        hold.lastTap = now;
        hold.active = true;
        hold.inactive = false;
        this.toggleHoldExplosion(column, true);
      }
      this.checkRegularNotes(column, now, beat);
    }
  }

  checkRegularNotes(column, now, beat) {
    const closestNote = this.notes.find(n => !n.hit && n.column === column && n.type === "1" && Math.abs(n.beat - beat) <= this.scene.JUDGE_WINDOWS.boo);

    if (closestNote && this.lastNoteCheckBeats[column] !== beat) {
      const delta = Math.abs(closestNote.beat - beat);
      const judgement = this.getJudgement(delta);

      this.createExplosion(closestNote);
      closestNote.sprite?.destroy();
      this.processJudgement(closestNote, judgement, column);
      closestNote.hit = true;

      this.lastNoteCheckBeats[column] = beat;
    }
  }

  checkMines(column, now, beat) {
    const mineNote = this.notes.find(n => n.type === "M" && n.column === column && !n.hit && Math.abs(n.beat - beat) <= this.scene.JUDGE_WINDOWS.marvelous);

    if (mineNote) {
      this.createMineExplosion(mineNote);
      this.processJudgement(mineNote, "miss", column);
      mineNote.hit = true;
      mineNote.sprite?.destroy();
      this.health = Math.max(0, this.health - 10);
    }
  }

  checkHoldStart(column, now, beat) {
    const holdNote = this.notes.find(n => (n.type === "2" || n.type === "4") && n.column === column && !n.hit && Math.abs(n.beat - beat) <= this.scene.JUDGE_WINDOWS.boo);

    if (holdNote) {
      this.activeHolds[column] = {
        note: holdNote,
        startTime: now,
        progress: 0,
        tapped: 0,
        pressCount: 0,
        active: true,
        inactive: false,
        lastPress: now,
        lastRelease: null,
        lastTap: now
      };
      holdNote.holdActive = true;
    }
  }

  checkHoldRelease(column, now) {
    const hold = this.activeHolds[column];
    if (hold) {
      hold.lastRelease = now;

      if (hold.note.type === "2") {
        const remaining = hold.note.secLength - (now - hold.startTime);
        if (remaining > this.HOLD_FORGIVENESS) {
          hold.active = false;
          hold.inactive = true;
          this.toggleHoldExplosion(column, false);
        }
      }
    }
  }

  toggleHoldExplosion(column, visible) {
    const explosion = this.receptors[column].explosion;
    explosion.visible = visible;
    if (visible) {
      explosion.bringToTop();
    }
  }

  getJudgement(delta) {
    for (const [judgement, window] of Object.entries(this.scene.JUDGE_WINDOWS)) {
      if (delta <= window) return judgement;
    }
    return "miss";
  }

  processJudgement(note, judgement, column) {
    const scoreValue = this.scene.SCORE_VALUES[judgement];
    if (!this.gameOver) this.score += scoreValue;
    
    // Update judgement counts
    this.judgementCounts[judgement]++;

    if (judgement === "miss") {
      this.combo = 0;
      this.health = Math.max(0, this.health - 5);
    } else {
      this.combo++;
      if (!this.gameOver) this.health = Math.min(this.maxHealth, this.health + 2);
      if (this.combo > this.maxCombo) {
        this.maxCombo = this.combo;
      }
    }

    // Update accuracy
    this.updateAccuracy();

    // Update UI
    this.updateUI();

    // Show judgement text
    this.showJudgementText(judgement, column);
  }
  
  updateAccuracy() {
    if (this.gameOver) return;
    
    const weights = {
      marvelous: 1.0,
      perfect: 1.0,
      great: 0.8,
      good: 0.5,
      boo: 0.25,
      miss: 0.0
    };

    let totalWeight = 0;
    let achievedWeight = 0;

    // Calculate weights for all judged notes
    for (const [judgement, count] of Object.entries(this.judgementCounts)) {
      const weight = weights[judgement];
      totalWeight += count * 1.0; // Maximum possible weight for each note
      achievedWeight += count * weight;
    }

    // Add remaining notes as misses (0 weight)
    const judgedNotes = Object.values(this.judgementCounts).reduce((a, b) => a + b, 0);
    const remainingNotes = Math.max(0, this.totalNotes - judgedNotes);
    totalWeight += remainingNotes * 1.0; // Maximum possible weight for remaining notes
    // achievedWeight stays the same for remaining notes (they count as 0)

    // Calculate final accuracy (0-100%)
    this.accuracy = totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 100;
    
    // Clamp to 0-100%
    this.accuracy = Phaser.Math.clamp(this.accuracy, 0, 100);
    
    // Update accuracy bar in HUD if it exists
    if (this.scene.acurracyBar) {
      const accuracyWidth = Math.floor(Math.max(1, (this.accuracy / 100) * 150));
      this.scene.acurracyBar.crop(new Phaser.Rectangle(0, 0, accuracyWidth, 2));
    }
  }

  updateUI() {
    this.comboText.write(this.combo.toString());
    this.comboText.tint = this.getComboColor(this.combo);

    this.scoreText.write(this.score.toString().padStart(8, "0"));

    const healthPercent = Math.round(this.health / this.maxHealth);
    this.healthText.write(`${healthPercent * 100}`);

    // Pulse combo on increase
    if (this.combo > 0) {
      this.pulseText(this.comboText);
    }
  }
  
  getScoreRating() {
    const acc = this.accuracy;
    
    if (acc >= 100) return "SSS+";
    if (acc >= 99.5) return "SSS";
    if (acc >= 99) return "SS";
    if (acc >= 97) return "S";
    if (acc >= 94) return "A";
    if (acc >= 90) return "B";
    if (acc >= 85) return "C";
    if (acc >= 80) return "D";
    if (acc >= 70) return "E";
    return "F";
  }

  showJudgementText(judgement, column) {
    const colors = {
      marvelous: 0x00ffff,
      perfect: 0xffff00,
      great: 0x00ff00,
      good: 0x0000ff,
      boo: 0xffa500,
      miss: 0xff0000
    };

    this.judgementText.write(judgement.toUpperCase());
    this.judgementText.tint = colors[judgement];
    this.judgementText.alpha = 1;
    this.judgementText.scale.set(1);

    game.tweens.removeFrom(this.judgementText);
    game.add.tween(this.judgementText.scale).to({ x: 1.5, y: 1 }, 200, "Linear", true).yoyo(true);
    game.add.tween(this.judgementText).to({ alpha: 0 }, 200, "Linear", true, 200);
    
    if (column !== undefined && judgement !== "miss") {
      const receptor = this.receptors[column];
      this.pulseSprite(receptor);
    }
  }

  pulseText(text) {
    text.scale.set(1);
    game.add.tween(text.scale).to({ x: 1.3, y: 1.3 }, 100, "Linear", true).yoyo(true);
  }

  pulseSprite(sprite) {
    sprite.scale.set(1);
    game.add.tween(sprite.scale).to({ x: 1.2, y: 1.2 }, 50, "Linear", true).yoyo(true);
  }

  getComboColor(combo) {
    const max = 100;
    const value = Math.min(max, combo);
    const r = Math.floor(255 + (255 - 255) * (value / max));
    const g = Math.floor(255 + (255 - 255) * (value / max));
    const b = Math.floor(255 + (0 - 255) * (value / max));
    return (r << 16) | (g << 8) | b;
  }

  createExplosion(note) {
    const receptor = this.receptors[note.column];
    const explosion = game.add.sprite(receptor.x, receptor.y, "explosion");
    explosion.anchor.set(0.5);
    explosion.angle = receptor.angle;

    const duration = 200;
    game.add.tween(explosion.scale).to({ x: 2, y: 2 }, duration, "Linear", true);
    game.add
      .tween(explosion)
      .to({ alpha: 0 }, duration, "Linear", true)
      .onComplete.add(() => explosion.destroy());
  }

  createMineExplosion(note) {
    const receptor = this.receptors[note.column];
    const explosion = game.add.sprite(receptor.x, receptor.y, "mineexplosion");
    explosion.anchor.set(0.5);
    explosion.angle = receptor.angle;

    const duration = 200;
    game.add.tween(explosion.scale).to({ x: 2.5, y: 2.5 }, duration, "Linear", true);
    game.add
      .tween(explosion)
      .to({ alpha: 0 }, duration, "Linear", true)
      .onComplete.add(() => explosion.destroy());
  }
  
    // NOTE mode - stepmania default
  getNoteColorMapping() {
    return {
      0: 0xFF0000,  // 4th - Red
      1: 0x0000FF,  // 8th - Blue
      2: 0x00FF00,  // 12th+ - Green (NOTE mode makes all others green)
      3: 0xFFFF00,  // 16th - Yellow
      4: 0x00FF00,  // 24th - Green
      5: 0x00FF00,  // 32nd - Green
      6: 0x00FF00,  // 48th - Green
      7: 0x00FF00,  // 64th - Green
      8: 0x00FF00,  // 96th - Green
      9: 0x00FF00,  // 128th - Green
      10: 0x00FF00, // 192nd - Green
      11: 0x00FF00  // 384th+ - Green
    };
  }

  // VIVID mode - color cycle per beat
  getVividColorMapping() {
    const vividColors = [0xFFFF00, 0x800000, 0x0000FF, 0x00FFFF]; // Yellow, Maroon, Blue, Cyan
    
    return {
      0: vividColors[0],  // 4th - Yellow
      1: vividColors[1],  // 8th - Maroon
      2: vividColors[2],  // 12th - Blue
      3: vividColors[3],  // 16th - Cyan
      4: vividColors[0],  // 24th - Yellow
      5: vividColors[1],  // 32nd - Maroon
      6: vividColors[2],  // 48th - Blue
      7: vividColors[3],  // 64th - Cyan
      8: vividColors[0],  // 96th - Yellow
      9: vividColors[1],  // 128th - Maroon
      10: vividColors[2], // 192nd - Blue
      11: vividColors[3]  // 384th+ - Cyan
    };
  }

  // FLAT mode - all notes same color as 4th notes
  getFlatColorMapping() {
    const flatColor = 0xFFFF00; // Yellow (same as VIVID 4th notes)
    
    return {
      0: flatColor,  // 4th - Yellow
      1: flatColor,  // 8th - Yellow
      2: flatColor,  // 12th - Yellow
      3: flatColor,  // 16th - Yellow
      4: flatColor,  // 24th - Yellow
      5: flatColor,  // 32nd - Yellow
      6: flatColor,  // 48th - Yellow
      7: flatColor,  // 64th - Yellow
      8: flatColor,  // 96th - Yellow
      9: flatColor,  // 128th - Yellow
      10: flatColor, // 192nd - Yellow
      11: flatColor  // 384th+ - Yellow
    };
  }

  // RAINBOW mode - orange, blue, purple/pink
  getRainbowColorMapping() {
    return {
      0: 0xFF8800,  // 4th - Orange
      1: 0x0000FF,  // 8th - Blue
      2: 0xFF00FF,  // 12th - Purple/Pink
      3: 0xFF00FF,  // 16th - Purple/Pink
      4: 0x0000FF,  // 24th - Blue (reused)
      5: 0xFF8800,  // 32nd - Orange (reused)
      6: 0xFF00FF,  // 48th - Purple/Pink
      7: 0x0000FF,  // 64th - Blue (reused)
      8: 0xFF00FF,  // 96th - Purple/Pink
      9: 0xFF8800,  // 128th - Orange (reused)
      10: 0x0000FF, // 192nd - Blue (reused)
      11: 0xFF00FF  // 384th+ - Purple/Pink
    };
  }
  
  getNoteFrame(note) {
    const beat = note.beat;
    
    // Check for specific beat divisions in order of increasing frequency
    if (this.isBeatDivision(beat, 4)) return 0;   // 4th notes
    if (this.isBeatDivision(beat, 8)) return 1;   // 8th notes
    if (this.isBeatDivision(beat, 12)) return 2;  // 12th notes
    if (this.isBeatDivision(beat, 16)) return 3;  // 16th notes
    if (this.isBeatDivision(beat, 24)) return 4;  // 24th notes
    if (this.isBeatDivision(beat, 32)) return 5;  // 32nd notes
    if (this.isBeatDivision(beat, 48)) return 6;  // 48th notes
    if (this.isBeatDivision(beat, 64)) return 7;  // 64th notes
    if (this.isBeatDivision(beat, 96)) return 8;  // 96th notes
    if (this.isBeatDivision(beat, 128)) return 9; // 128th notes
    if (this.isBeatDivision(beat, 192)) return 10; // 192nd notes
    
    // For anything faster than 192nd, use frame 11
    return 11;
  }

  isBeatDivision(beat, division) {
    // Check if the beat aligns with the given division
    // Using a small epsilon to account for floating point precision
    const epsilon = 0.0001;
    const remainder = (beat * division) % 4;
    return Math.abs(remainder) < epsilon || Math.abs(remainder - 4) < epsilon;
  }

  // Actually unused. Might be removed in the future 
  getNoteColor(note) {
    const frame = this.getNoteFrame(note);
    const colorMapping = this.colorMappings[this.noteColorOption];
    
    return colorMapping[frame] || 0x888888; // Fallback to gray
  }
  
  // Method to change note color option
  setNoteColorOption(option) {
    if (this.colorMappings[option]) {
      this.noteColorOption = option;
      Account.settings.noteColorOption = option;
      saveAccount();
      
      // Refresh all note colors if we're in gameplay
      this.refreshNoteColors();
    }
  }

  refreshNoteColors() {
    // Update colors for all existing notes
    this.notes.forEach(note => {
      if (note.sprite) {
        const frame = this.getNoteFrame(note);
        const color = this.getNoteColor(note);
        note.sprite.tint = color;
      }
    });
  }

  // Method to get available note options
  getNoteColorOptions() {
    return [
      { key: 'NOTE', name: 'NOTE', description: 'Red/Blue/Yellow/Green' },
      { key: 'VIVID', name: 'VIVID', description: 'Yellow/Maroon/Blue/Cyan cycle' },
      { key: 'FLAT', name: 'FLAT', description: 'All notes yellow' },
      { key: 'RAINBOW', name: 'RAINBOW', description: 'Orange/Blue/Purple' }
    ];
  }

  render() {
    if (!this.scene.startTime || this.scene.isPaused) return;

    const { now, beat } = this.scene.getCurrentTime();
    const leftOffset = this.calculateLeftOffset();

    // Key down/up animation
    for (let i = 0; i < 4; i++) {
      const receptor = this.receptors[i];
      const down = this.inputStates[i];
      if (receptor.down != down) {
        receptor.down = down;
        receptor.play(down ? "down" : "up");
      }
    }

    // Render notes
    this.notes.forEach(note => {
      const deltaNote = (note.beat - beat) * this.NOTE_SPEED_MULTIPLIER;
      const bodyHeight = note.beatLength ? (note.beatLength + 1) * this.COLUMN_SIZE * this.NOTE_SPEED_MULTIPLIER * this.VERTICAL_SEPARATION - this.COLUMN_SIZE * 4 : 0;
      let yPos = this.JUDGE_LINE - deltaNote * this.COLUMN_SIZE * this.VERTICAL_SEPARATION;
      const x = leftOffset + note.column * (this.COLUMN_SIZE + this.COLUMN_SEPARATION);

      // Check for missed notes
      if (note.type !== "M" && note.type != "2" && note.type != "4" && !note.hit && !note.miss && yPos > game.height) {
        note.miss = true;
        this.processJudgement(note, "miss", note.column);
      }

      // Remove off-screen notes
      if (yPos < -this.COLUMN_SIZE || yPos > game.height + bodyHeight) {
        if (note.sprite) {
          note.sprite.kill();
          delete note.sprite;
          if (note.holdParts) {
            note.holdParts.body.destroy();
            note.holdParts.end.destroy();
            delete note.holdParts;
          }
        }
        return;
      }

      const holdData = this.activeHolds[note.column];

      if (note.type === "M") {
        if (!note.sprite) {
          note.sprite = this.notesGroup.getFirstDead() || (() => {
            const sprite = game.add.sprite(x, yPos, "mine");
            this.notesGroup.add(sprite);
            return sprite;
          })();
          note.sprite.reset(0, -32);
          note.sprite.loadTexture("mine");
          note.sprite.animations.add("blink", [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
          note.sprite.animations.play("blink");
        }
        note.sprite.anchor.set(0.5);
        note.sprite.x = x + this.COLUMN_SIZE / 2;
        note.sprite.y = yPos + this.COLUMN_SIZE / 2;
      } else if (note.type === "2" || note.type === "4") {
        if (!note.holdParts) {
          const prefix = note.type === "2" ? "hold" : "roll";
          
          const getBody = () => {
            const sprite = this.freezeBodyGroup.getFirstDead() || (() => {
              const child = game.add.tileSprite(-64, -64, this.COLUMN_SIZE, `${prefix}_body`);
              this.freezeBodyGroup.add(child);
              return child;
            })();
            sprite.reset(x, -64);
            sprite.loadTexture(`${prefix}_body`);
            return sprite;
          };
          
          const getEnd = () => {
            const sprite = this.freezeEndGroup.getFirstDead() || (() => {
              const child = game.add.sprite(0, 0);
              this.freezeEndGroup.add(child);
              return child;
            })();
            sprite.reset(x, -64);
            sprite.loadTexture(`${prefix}_end`);
            return sprite;
          };
          
          note.holdParts = {
            //body: game.add.tileSprite(x, yPos, this.COLUMN_SIZE, 0, `${prefix}_body`),
            //end: game.add.sprite(x, yPos, `${prefix}_end`)
            body: getBody(),
            end: getEnd()
          };
          note.holdParts.body.anchor.y = 1;
          note.holdParts.end.anchor.y = 1;
          note.holdActive = false;
        }
        
        const isActive = !note.finish && !note.miss && holdData?.note === note && holdData.active;
        const isInactive = holdData?.note === note && holdData.inactive;

        let visibleHeightIsSet = typeof note.visibleHeight != "undefined";
        let visibleHeight = visibleHeightIsSet ? note.visibleHeight : bodyHeight;

        if (visibleHeight < 0) visibleHeight = 1;

        if (isActive) {
          const holdBottomY = yPos - bodyHeight;
          const judgeLineY = this.JUDGE_LINE;

          visibleHeight = Math.max(0, judgeLineY - holdBottomY) - this.COLUMN_SIZE / 3;
          note.visibleHeight = visibleHeight - this.COLUMN_SIZE / 2;

          if (yPos > this.JUDGE_LINE) yPos = this.JUDGE_LINE - this.COLUMN_SIZE / 2;

          note.active = true;
        } else if (typeof note.visibleHeight != "undefined") {
          yPos -= bodyHeight - note.visibleHeight;
          note.active = false;
        }
        
        // Miss note when past judge line but keep it to don't mess the rhythm
        if (!note.miss && !note.holdActive && yPos > this.JUDGE_LINE + this.COLUMN_SIZE / 2) {
          note.miss = true;
          this.processJudgement(note, "miss", note.column);
        }

        let spritesVisible = !note.finish;

        note.holdParts.body.y = yPos + this.COLUMN_SIZE / 2;
        note.holdParts.body.height = visibleHeight;

        note.holdParts.end.y = note.holdParts.body.top +1;

        note.holdParts.body.visible = spritesVisible;
        note.holdParts.end.visible = spritesVisible;
        if (note.sprite) {
          note.sprite.visible = !isActive && spritesVisible;
        }

        const frame = isActive ? 1 : 0;
        const baseColor = note.type === "2" ? 0x00bb00 : 0x00eeee;
        const tint = note.miss ? this.INACTIVE_COLOR : baseColor;
        const alpha = note.miss ? 0.8 : 1;

        note.holdParts.body.frame = frame;
        note.holdParts.end.frame = frame;

        note.holdParts.body.tint = tint;
        note.holdParts.end.tint = tint;

        note.holdParts.body.alpha = alpha;
        note.holdParts.end.alpha = alpha;
      }

      // Show hold explosion when active
      if (holdData?.active && !note.finish && !note.miss) {
        this.toggleHoldExplosion(note.column, true);
      }

      if (note.type !== "M" && note.type !== "3") {
        if (!note.sprite) {
          note.sprite = this.notesGroup.getFirstDead() || (() => {
            const sprite = game.add.sprite(0, 0);
            this.notesGroup.add(sprite);
            return sprite;
          })();
          note.sprite.reset(0, -32);
          note.sprite.loadTexture("arrows");
          note.sprite.frame = this.getNoteFrame(note);
          note.sprite.anchor.set(0.5);
          note.sprite.angle = {
            0: 90,
            1: 0,
            2: 180,
            3: -90
          }[note.column];
        }
        note.sprite.x = x + this.COLUMN_SIZE / 2;
        note.sprite.y = yPos + this.COLUMN_SIZE / 2;
      }
    });
  }

  update() {
    const { now, beat } = this.scene.getCurrentTime();

    // Input handling
    if (!this.autoplay) {
      Object.keys(this.keymap).forEach(key => {
      if (gamepad.pressed[key]) this.handleInput(this.keymap[key], true);
      else if (gamepad.released[key]) this.handleInput(this.keymap[key], false);
      for (let column = 0; column < 4; column++) {
        let pressed = this.inputStates[column];
        if (pressed) {
          this.checkMines(column, now, beat);
        }
      }
    });
    } else {
      this.autoPlay();
    }

    if (this.health != this.previousHealth) {
      this.previousHealth = this.health;
      //this.scene.lifebarMiddle.width = (this.health / this.maxHealth) * 104;
      game.add.tween(this.scene.lifebarMiddle).to({ width: (this.health / this.maxHealth) * 104 }, 100, Phaser.Easing.Quadratic.In, true);
      if (this.health <= 0) {
        this.gameOver = true;
        // TODO: Danger warning
      }
    }
    this.scene.lifebarEnd.x = this.scene.lifebarMiddle.width;

    // Update active holds
    Object.entries(this.activeHolds).forEach(([col, hold]) => {
      const { now } = this.scene.getCurrentTime();
      if (hold.note.type === "2") {
        if (!hold.active) {
          const sinceRelease = now - hold.lastRelease;
          if (sinceRelease > this.HOLD_FORGIVENESS) {
            hold.inactive = true;
            hold.note.miss = true;
            this.toggleHoldExplosion(col, false);
          }
        }
      } else if (hold.note.type === "4") {
        const sinceLastTap = now - hold.lastTap;
        if (sinceLastTap > this.ROLL_FORGIVENESS) {
          hold.inactive = true;
          hold.active = false;
          hold.note.miss = true;
          this.toggleHoldExplosion(col, false);
        }
      }

      hold.progress = now - hold.startTime;
      if (hold.progress >= hold.note.secLength) {
        let judgement = "boo";

        if (hold.note.type === "2") {
          judgement = !hold.note.miss ? "marvelous" : "boo";
        } else if (hold.note.type === "4") {
          const requiredTaps = Math.ceil(hold.note.beatLength * this.ROLL_REQUIRED_INTERVALS);
          judgement = hold.tapped >= requiredTaps && !hold.note.miss ? "marvelous" : "boo";
        }

        hold.note.finish = true;

        this.processJudgement(hold.note, judgement, Number(col));
        hold.note.hit = true;
        this.toggleHoldExplosion(col, false);
        delete this.activeHolds[col];
      }
    });
  }

  getLastStop(time, valueType) {
    return this.stops.find((e, i, a) => i + 1 == a.length || a[i + 1][valueType] >= time);
  }
  
  getLastBpm(time, valueType) {
    return this.bpmChanges.find((e, i, a) => i + 1 == a.length || a[i + 1][valueType] >= time);
  }
  
  secToBeat(sec) {
    let b = this.getLastBpm(sec, "sec");
    let s = this.stops.filter(({ sec: i }) => i >= b.sec && i < sec).map(i => (i.sec + i.len > sec ? sec - i.sec : i.len));
    for (let i in s) sec -= s[i];
    return ((sec - b.sec) * b.bpm) / 60 + b.beat;
  }
  
  beatToSec(beat) {
    let b = this.getLastBpm(bpmChanges, beat, "beat");
    let x = ((beat - b.beat) / b.bpm) * 60 + b.sec;
    let s = this.stops.filter(({ beat: i }) => i >= b.beat && i < beat).map(i => i.len);
    for (let i in s) x += s[i];
    return x;
  }
}

class Results {
  init(gameData) {
    this.gameData = gameData; // { song, difficultyIndex, player }
    this.isNewRecord = false;
    this.finalScore = 0;
    this.finalAccuracy = 0;
    this.scoreRating = "";
  }

  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    
    new BackgroundGradient();
    
    const { song, player } = this.gameData;
    const difficulty = song.chart.difficulties[song.difficultyIndex];
    
    this.finalScore = player.score;
    this.finalAccuracy = player.accuracy;
    this.scoreRating = player.getScoreRating();
    
    // Save high score and check if it's a new record
    
    this.isNewRecord = this.saveHighScore(song, difficulty, player);
    
    this.displayResults();
    this.showMenu();
  }

  saveHighScore(song, difficulty, player) {
    if (Account.settings.autoplay) {
      return false;
    }
    
    const songKey = this.getSongKey(song);
    const difficultyKey = `${difficulty.type}${difficulty.rating}`;
    
    if (!Account.highScores[songKey]) {
      Account.highScores[songKey] = {};
    }
    
    const currentHighScore = Account.highScores[songKey][difficultyKey];
    const newScoreData = {
      score: player.score,
      accuracy: player.accuracy,
      rating: player.getScoreRating(),
      maxCombo: player.maxCombo,
      date: Date.now(),
      judgements: { ...player.judgementCounts }
    };
    
    let isNewRecord = false;
    
    if (!currentHighScore || player.score > currentHighScore.score) {
      Account.highScores[songKey][difficultyKey] = newScoreData;
      saveAccount();
      isNewRecord = true;
    }
    
    return isNewRecord;
  }

  getSongKey(song) {
    // Create unique key for song (for both local and external)
    if (song.chart.folderName) {
      return `local_${song.chart.folderName}`;
    } else if (song.audioUrl) {
      // For external songs, use audio URL hash
      return `external_${this.hashString(song.chart.audioUrl)}`;
    }
    return `unknown_${Date.now()}`;
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  displayResults() {
    const { song, player } = this.gameData;
    const difficulty = song.chart.difficulties[song.difficultyIndex];
    
    // Banner
    this.bannerImg = document.createElement("img");
    this.cdtitleImg = document.createElement("img");
    
    this.bannerCanvas = document.createElement("canvas");
    this.bannerCtx = this.bannerCanvas.getContext("2d");
    
    this.bannerSprite = game.add.sprite(112, 10);
    
    if (song.chart.banner) {
      this.bannerImg.src = song.chart.banner;
      this.bannerImg.onload = () => {
        this.bannerCtx.drawImage(this.bannerImg, 0, 0, 72, 28);
        this.bannerSprite.loadTexture(PIXI.Texture.fromCanvas(this.bannerCanvas));
      };
    }
    
    // Song info
    this.songText = new Text(8, 10, `${song.chart.title}`, FONTS.shaded);
    this.diffText = new Text(10, 20, `${difficulty.type} (${difficulty.rating})`);
    this.diffText.tint = new Play().getDifficultyColor(difficulty.rating);
    
    // Don't celebrate if autoplay is enabled
    const autoplay = Account.settings.autoplay;
    
    // Score
    this.scoreText = new Text(10, 30, `SCORE: ${autoplay ? "---" : this.finalScore.toLocaleString()}`, FONTS.default);
    
    // Accuracy
    this.accuracyText = new Text(10, 40, `ACCURACY: ${autoplay ? "---" : `${this.finalAccuracy.toFixed(2)}%`}`, FONTS.default);
    
    // Rating
    this.ratingText = new Text(10, 50, `RATING: ${autoplay ? "AUTO" : this.scoreRating}`, FONTS.shaded);
    this.ratingText.tint = this.getRatingColor(this.scoreRating);
    
    // Combo
    this.comboText = new Text(10, 60, `MAX COMBO: ${autoplay ? "---" : player.maxCombo}`, FONTS.default);
    
    // Judgements
    this.judgementsText = new Text(15, 70, autoplay ? "\nAUTOPLAY ENABLED" : this.getJudgementsText(player.judgementCounts));
    this.judgementsText.tint = autoplay ? 0xff0000 : 0xffffff;
    
    // New record indicator
    if (!autoplay && this.isNewRecord) {
      this.recordText = new Text(152, 38, "NEW RECORD!", FONTS.shaded);
      this.recordText.anchor.x = 0.5;
      this.recordText.tint = 0xFFD700; // Gold color
      
      // Pulse animation for new record
      game.add.tween(this.recordText.scale).to({ x: 1.2, y: 1.2 }, 500, "Linear", true).yoyo(true).repeat(-1);
    }
  }
  
  showMenu() {
    game.add.sprite(0, 0, "ui_navigation_hint", 1);
    
    const menu = new CarouselMenu(108, 44, 80, 80, {
      bgcolor: 'brown',
      fgcolor: '#ffffff'
    });
    
    menu.addItem("NEXT", () => {
      game.state.start("SongSelect", true, false, null, window.selectStartingIndex + 1, true);
    });
    menu.addItem("CONTINUE", () => game.state.start("SongSelect"));
    if (Account.settings.autoplay) {
      menu.addItem("DISABLE AUTOPLAY", () => {
        Account.settings.autoplay = false;
        game.state.start("SongSelect");
      });
    }
    menu.addItem("RETRY", () => game.state.start("Play", true, false, this.gameData.song));
    menu.addItem("QUIT", () => game.state.start("MainMenu"));
  }

  getJudgementsText(judgements) {
    return `MARVELOUS: ${judgements.marvelous}\n` +
           `PERFECT: ${judgements.perfect}\n` +
           `GREAT: ${judgements.great}\n` +
           `GOOD: ${judgements.good}\n` +
           `BOO: ${judgements.boo}\n` +
           `MISS: ${judgements.miss}`;
  }

  getRatingColor(rating) {
    const colors = {
      "SSS+": 0xFFD700, // Gold
      "SSS": 0xFFD700,  // Gold
      "SS": 0xFFFFFF,   // White
      "S": 0xFFFFFF,    // White
      "A": 0x00FF00,    // Green
      "B": 0x0000FF,    // Blue
      "C": 0xFFFF00,    // Yellow
      "D": 0xFFA500,    // Orange
      "E": 0xFF0000,    // Red
      "F": 0x800080     // Purple
    };
    return colors[rating] || 0xFFFFFF;
  }

  update() {
    gamepad.update();
  }
}

window.PhaserGlobal = {
  enableWebAudio: false
};

class Logo extends Phaser.Sprite {
  constructor() {
    super(game, game.width / 2, game.height / 2, null);
    
    this.anchor.set(0.5);
    
    this.mainShape = this.addShape();
    
    game.add.existing(this);
  }
  intro(callback) {
    this.mainShape.alpha = 0;
    
    game.add.tween(this.mainShape).to({ alpha: 1 }, 1000, "Linear", true).onComplete.addOnce(() => {
      this.logoTween = game.add.tween(this.mainShape).to({ alpha: 0.8 }, 500, "Linear", true).repeat(-1).yoyo(true);
      callback && callback();
    });
  }
  outro(callback) {
    this.effect(32, 1000);
      
    const shape = this.addShape();
    shape.alpha = 1;
    game.add.tween(shape).to({ alpha: 0 }, 250, "Linear", true);
    game.add.tween(shape.scale).to({ x: 8, y: 8 }, 250, "Linear", true);
      
    game.camera.flash(0xffffff, 300);
    game.time.events.add(350, () => game.camera.fade(0xffffff, 1000));
    game.camera.onFadeComplete.addOnce(() => callback && callback());
  }
  effect(amountLayers = 5, time = 1000, invert = false) {
    let layers = [];
    for (let i = 0; i < amountLayers; i ++) {
      const shape = this.addShape();
      shape.alpha = 0;
      shape.scale.set(1.0 + (i / 10));
      layers.push(shape);
      game.add.tween(shape).to({ alpha: 1 }, time, "Linear", true, (invert ? - amountLayers * 100 : 0) + i * 100).yoyo(true);
    }
  }
  addShape(tint = 0xffffff, x = 0, y = 0) {
    const shape = game.add.sprite(x, y, "ui_logo_shape");
    shape.anchor.set(0.5);
    shape.tint = tint;
    this.addChild(shape);
    return shape;
  }
}

const Audio = {
  pool: {},
  add: function (key, volume = 1, loop = false, reset = true) {
    if (!reset || !this.pool[key]) {
      this.pool[key] = game.add.audio(key);
    }
    return this.pool[key];
  },
  play: function (key, volume = 1, loop = false, reset = true) {
    if (game) {
      if (!reset || !this.pool[key]) {
        this.pool[key] = game.add.audio(key);
      }
      return this.pool[key].play(null, 0, volume, loop, reset);
    }
  },
  stop: function (key, fadeOut) {
    if (game) {
      const audio = this.pool[key];
      if (audio) {
        if (fadeOut) {
          audio.stop();
        } else {
          audio.fadeOut();
          audio.onFadeComplete.addOnce(() => audio.stop());
        }
      }
      return;
    }
  }
};

class Text extends Phaser.Sprite {
  constructor(x, y, text = "", config, parent) {
    config = {
      font: "font_tiny",
      fontMap: " ABCDEFGHIJKLMNOPQRSTUVWXYZ.,:!¡?¿h+-×*()[]/\\0123456789_'\"`•<>=%",
      fontWidth: 4,
      fontHeight: 6,
      typewriter: false,
      typewriterInterval: 100,
      ...config
    };
    
    super(game, x, y);
    
    this.config = config;

    this.texture = new Phaser.RetroFont(game, config.font, config.fontWidth, config.fontHeight, config.fontMap);

    this.texture.multiLine = true;
    this.texture.autoUpperCase = true;

    this.timer = game.time.create(false);

    this.typewriterInterval = config.typewriterInterval;

    if (config.typewriter) {
      this.typewriter(text);
    } else {
      this.write(text);
    }

    game.add.existing(this);
    
    if (parent) {
      if (parent instanceof Phaser.Group) parent.add(this);
      else if (parent instanceof PIXI.DisplayObjectContainer) parent.addChild(this);
    }
  }

  write(text) {
    this.texture.text = text;
  }

  typewrite(text, callback) {
    if (this.timer.running) this.timer.stop();

    let index = 0;

    this.texture.text = "";

    this.timer.loop(this.typewriterInterval, () => {
      if (index < text.length) {
        this.write(this.texture.text + text[index]);
        index++;
      } else {
        callback && callback();
        this.timer.stop();
      }
    });

    this.timer.start();
  }

  scrollwrite(text, visibleLength = 5, scrollSpeed = 200, separation = 5) {
    if (this.timer.running) this.timer.stop();

    // Prepare the text with separation spaces
    const fullText = text + ' '.repeat(separation);
    let position = 0;
    let direction = 1; // 1 for forward, -1 for backward (optional)
    let isScrolling = true;

    const update = () => {
      if (!this.visible || !isScrolling) return;

      // Extract the visible portion
      let visibleText = '';
      
      for (let i = 0; i < visibleLength; i++) {
        const charIndex = (position + i) % fullText.length;
        visibleText += fullText[charIndex];
      }

      this.write(visibleText);

      // Move to next position
      position = (position + 1) % fullText.length;
    };
    
    this.timer.loop(scrollSpeed, () => update());
    
    update();

    this.timer.start();

    // Return methods to control the scrolling
    return {
      stop: () => {
        isScrolling = false;
        this.timer.stop();
      },
      pause: () => {
        isScrolling = false;
      },
      resume: () => {
        isScrolling = true;
      },
      setSpeed: (newSpeed) => {
        scrollSpeed = newSpeed;
        this.timer.loopDelay = newSpeed;
      }
    };
  }

  scrollwriteBidirectional(text, visibleLength = 5, scrollSpeed = 200, separation = 5) {
    if (this.timer.running) this.timer.stop();

    const fullText = text + ' '.repeat(separation);
    let position = 0;
    let direction = 1; // 1 = right, -1 = left
    let pauseCount = 0;
    const maxPause = 10; // Pause at ends

    this.timer.loop(scrollSpeed, () => {
      // Pause at the beginning and end
      if (pauseCount > 0) {
        pauseCount--;
        return;
      }

      let visibleText = '';
      
      if (direction === 1) {
        // Scrolling right
        for (let i = 0; i < visibleLength; i++) {
          const charIndex = (position + i) % fullText.length;
          visibleText += fullText[charIndex];
        }
        
        position = (position + 1) % fullText.length;
        
        // Change direction when we reach the end
        if (position === 0) {
          direction = -1;
          pauseCount = maxPause;
        }
      } else {
        // Scrolling left
        for (let i = 0; i < visibleLength; i++) {
          let charIndex = position - i;
          if (charIndex < 0) charIndex += fullText.length;
          visibleText += fullText[charIndex];
        }
        
        position = (position - 1 + fullText.length) % fullText.length;
        
        // Change direction when we reach the beginning
        if (position === fullText.length - 1) {
          direction = 1;
          pauseCount = maxPause;
        }
      }

      this.write(visibleText);
    });

    this.timer.start();

    return {
      stop: () => this.timer.stop(),
      pause: () => this.timer.pause(),
      resume: () => this.timer.resume()
    };
  }

  marquee(text, visibleLength = 5, scrollSpeed = 200) {
    return this.scrollwrite(text, visibleLength, scrollSpeed, visibleLength);
  }

  stopScrolling() {
    if (this.timer.running) {
      this.timer.stop();
    }
  }

  isScrolling() {
    return this.timer.running;
  }
  
  wrap(maxWidth, lineSpacing = 1) {
    if (!this.texture.text) return this;
    
    const originalText = this.texture.text;
    const charWidth = this.config.fontWidth || 4;
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);
    
    if (maxCharsPerLine <= 0) return this;
    
    const words = originalText.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      // Check if word itself is too long and needs to be broken
      if (word.length > maxCharsPerLine) {
        // If we have content in current line, push it first
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }
        
        // Break the long word into chunks
        let wordChunk = '';
        for (let j = 0; j < word.length; j++) {
          wordChunk += word[j];
          if (wordChunk.length >= maxCharsPerLine || j === word.length - 1) {
            lines.push(wordChunk);
            wordChunk = '';
          }
        }
        continue;
      }
      
      // Normal word wrapping
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    // Push the last line
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Join lines with newline characters
    const wrappedText = lines.join('\n');
    this.write(wrappedText);
    
    return this;
  }

  wrapPreserveNewlines(maxWidth, lineSpacing = 1) {
    if (!this.texture.text) return this;
    
    const originalText = this.texture.text;
    const charWidth = this.config.fontWidth || 4;
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);
    
    if (maxCharsPerLine <= 0) return this;
    
    const originalLines = originalText.split('\n');
    const wrappedLines = [];
    
    for (const line of originalLines) {
      if (line.length <= maxCharsPerLine) {
        wrappedLines.push(line);
        continue;
      }
      
      const words = line.split(' ');
      let currentLine = '';
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // Handle very long words
        if (word.length > maxCharsPerLine) {
          if (currentLine) {
            wrappedLines.push(currentLine);
            currentLine = '';
          }
          
          let wordChunk = '';
          for (let j = 0; j < word.length; j++) {
            wordChunk += word[j];
            if (wordChunk.length >= maxCharsPerLine || j === word.length - 1) {
              wrappedLines.push(wordChunk);
              wordChunk = '';
            }
          }
          continue;
        }
        
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        
        if (testLine.length <= maxCharsPerLine) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            wrappedLines.push(currentLine);
          }
          currentLine = word;
        }
      }
      
      if (currentLine) {
        wrappedLines.push(currentLine);
      }
    }
    
    const wrappedText = wrappedLines.join('\n');
    this.write(wrappedText);
    
    return this;
  }

  getWrappedText(maxWidth) {
    if (!this.texture.text) return '';
    
    const originalText = this.texture.text;
    const charWidth = this.config.fontWidth || 4;
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);
    
    if (maxCharsPerLine <= 0) return originalText;
    
    const words = originalText.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      if (word.length > maxCharsPerLine) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }
        
        let wordChunk = '';
        for (let j = 0; j < word.length; j++) {
          wordChunk += word[j];
          if (wordChunk.length >= maxCharsPerLine || j === word.length - 1) {
            lines.push(wordChunk);
            wordChunk = '';
          }
        }
        continue;
      }
      
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.join('\n');
  }
}

class WindowManager {
  constructor() {
    this.windows = [];
    this.focusedWindow = null;

    // Track input states to prevent repeated inputs
    this.lastUp = false;
    this.lastDown = false;
    this.lastConfirm = false;
    this.lastCancel = false;
  }

  add(window) {
    if (!this.windows.includes(window)) {
      this.windows.push(window);
      // Hide selector by default for new windows
      window.selector.visible = false;
      // If this is the first window added, focus it automatically
      if (this.windows.length === 1) {
        this.focus(window);
      }
    }
    return window;
  }

  show(window) {
    window.show();
  }

  remove(window, destroy = true) {
    const index = this.windows.indexOf(window);
    if (index !== -1) {
      // If we're removing the focused window, focus the next available one
      if (window === this.focusedWindow) {
        this.windows.splice(index, 1);
        this.focusedWindow = this.windows.length > 0 ?
          this.windows[this.windows.length - 1] : null;
        // Update selector visibility for new focused window
        if (this.focusedWindow) {
          this.focusedWindow.selector.visible = true;
        }
      } else {
        this.windows.splice(index, 1);
      }

      // Destroy window if requested
      if (destroy) {
        window.destroy();
      }
      return true;
    }
    return false;
  }

  focus(window, hide = true) {
    if (window && this.windows.includes(window)) {
      // Hide selector for previously focused window
      if (this.focusedWindow) {
        this.focusedWindow.focus = false;
        if (hide) this.focusedWindow.visible = false;
        this.focusedWindow.selector.visible = false;
      }

      // Focus new window and show its selector
      this.focusedWindow = window;
      window.focus = true;
      window.selector.visible = true;
      //window.bringToTop();
      window.show();
      return true;
    }
    return false;
  }

  unfocus() {
    this.focusedWindow = null;
  }

  closeAll() {
    if (this.focusedWindow) {
      this.focusedWindow.focus = false;
      this.focusedWindow = null;
    }
    this.windows.forEach(window => window.hide());
  }

  update() {
    // Only process input if we have a focused window
    if (this.focusedWindow) {
      // Handle navigation - only trigger on new presses (not holds)
      const upPressed = gamepad.pressed.up && !this.lastUp;
      const downPressed = gamepad.pressed.down && !this.lastDown;
      const leftPressed = gamepad.pressed.left && !this.lastDown;
      const rightPressed = gamepad.pressed.right && !this.lastDown;
      const confirmPressed = gamepad.pressed.a && !this.lastConfirm;
      const cancelPressed = gamepad.pressed.b && !this.lastCancel;

      if (upPressed) {
        this.focusedWindow.navigate('up');
      } else if (downPressed) {
        this.focusedWindow.navigate('down');
      } else if (leftPressed) {
        this.focusedWindow.navigate('left');
      } else if (rightPressed) {
        this.focusedWindow.navigate('right');
      }

      if (confirmPressed) {
        this.focusedWindow.confirm();
      }

      if (cancelPressed) {
        this.focusedWindow.cancel();
      }

      // Update input states
      this.lastUp = gamepad.pressed.up;
      this.lastDown = gamepad.pressed.down;
      this.lastConfirm = gamepad.pressed.a;
      this.lastCancel = gamepad.pressed.b;
    }
  }

  // Helper methods for common operations
  createWindow(x, y, width, height, skin = "1", parent = null) {
    const window = new Window(x, y, width, height, skin, parent);
    this.add(window);
    return window;
  }

  clearAll(destroy = false) {
    if (destroy) {
      this.windows.forEach(window => window.destroy());
    }
    this.windows = [];
    this.focusedWindow = null;
  }

  // Bring window to front (visually) without necessarily focusing it
  bringToFront(window) {
    if (this.windows.includes(window)) {
      window.bringToTop();
      // Reorder windows array to maintain proper z-index
      this.windows.splice(this.windows.indexOf(window), 1);
      this.windows.push(window);
      return true;
    }
    return false;
  }
}
class Window extends Phaser.Sprite {
  constructor(x, y, width, height, skin = "1", parent = null) {
    super(game, x * 8, y * 8);

    this.size = {
      width,
      height
    };
    
    this.offset = {
      x: 0,
      y: 0
    }
    
    this.scrollOffset = 0;
    this.itemOffset = 1;
    this.visibleItems = height;
    this.selectedIndex = 0;
    this.focus = false;
    this.skin = skin;
    this.font = "default";
    this.fontTint = 0x76fcde;

    this.fixedToCamera = true;

    if (parent) {
      parent.addChild(this);
    } else {
      game.add.existing(this);
    }

    // Create window frame
    this.createWindowFrame();

    // Selection arrow
    this.selector = game.add.sprite(3, 0, `ui_window_${skin}`, 9);
    this.selector.visible = false;
    this.selector.animations.add('blink', [9, 10], 4, true);
    this.selector.animations.play('blink');
    this.addChild(this.selector);

    // Signals
    this.onSelect = new Phaser.Signal();
    this.onConfirm = new Phaser.Signal();
    this.onCancel = new Phaser.Signal();

    // Items array
    this.items = [];
    this.updateSelector();
  }

  createWindowFrame() {
    // Window frame parts
    this.frameParts = [];

    // Create corners and borders
    for (let y = 0; y < this.size.height; y++) {
      for (let x = 0; x < this.size.width; x++) {
        let frame = 4; // Default to center

        // Determine which frame to use
        if (y === 0) { // Top row
          if (x === 0) frame = 0; // Top-left corner
          else if (x >= this.size.width - 1) frame = 2; // Top-right corner
          else frame = 1; // Top border
        } else if (y === this.size.height - 1) { // Bottom row
          if (x === 0) frame = 6; // Bottom-left corner
          else if (x >= this.size.width - 1) frame = 8; // Bottom-right corner
          else frame = 7; // Bottom border
        } else { // Middle rows
          if (x === 0) frame = 3; // Left border
          else if (x >= this.size.width - 1) frame = 5; // Right border
          else frame = 4; // Center fill
        }

        const part = game.add.sprite(x * 8, y * 8, `ui_window_${this.skin}`, frame);
        this.addChild(part);
        this.frameParts.push(part);
      }
    }
  }

  addItem(text, leftText, callback = null, backButton = false) {
    const itemText = new Text(8 + this.offset.x, 0, text, {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    this.addChild(itemText);
    
    const itemLeftText = new Text(this.size.width * 8 -8 - 3, 0, leftText, {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    itemLeftText.anchor.x = 1;
    itemText.addChild(itemLeftText);
    
    const item = {
      text: itemText,
      leftText: itemLeftText,
      callback: callback,
      backButton: backButton,
      type: 'item',
      visible: true,
      setText: text => {
        itemText.write(text);
      },
      setLeftText: text => {
        itemLeftText.write(text);
      }
    };

    this.items.push(item);

    return item;
  }

  addSettingItem(text, options, currentIndex = 0, callback = null) {
    const itemText = new Text(8 + this.offset.x, 0, text, {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    this.addChild(itemText);
    
    // Translate text
    options = options.map(option => Window.processMultilingual(option));

    const valueText = new Text(this.size.width * 8 -8- 3, 0, options[currentIndex].toString(), {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    valueText.anchor.x = 1;
    itemText.addChild(valueText);

    const item = {
      text: itemText,
      leftText: valueText,
      valueText: valueText,
      options: options,
      currentIndex: currentIndex,
      callback: callback,
      type: 'setting',
      visible: true
    };

    this.items.push(item);
    this.update();
    return item;
  }

  static processMultilingual(text) {
    // Translate text only
    if (typeof text !== 'string') {
      return text;
    }

    // Handle simple split case (text||text)
    const simpleSplitRegex = /([^|(]+\|\|[^|)]+)/g;
    text = text.replace(simpleSplitRegex, match => {
      const parts = match.split('||');
      return parts[SETTINGS.language] || parts[0]; // Default to first part if language index is invalid
    });

    // Handle parenthetical cases (ES|EN)
    const parenRegex = /\(([^)|]+)\|([^)]+)\)/g;
    text = text.replace(parenRegex, (match, esText, enText) => {
      return SETTINGS.language === 0 ? esText : enText;
    });

    return text;
  }

  update() {
    this.visibleItems = this.size.height - 2 - Math.floor((this.itemOffset * this.items.length - 1) / 8);

    this.items.forEach((item, index) => {
      const isVisible = index >= this.scrollOffset &&
        index < this.scrollOffset + this.visibleItems;

      item.text.visible = isVisible;
      item.visible = isVisible;
      item.text.tint = this.fontTint;
      item.leftText.tint = this.fontTint;

      if (isVisible) {
        // Position the text relative to current scroll
        const yPos = 5 + ((index - this.scrollOffset) * 8) + this.itemOffset * index;
        item.text.y = yPos + this.offset.y;
      }
    });

    this.updateSelector();
  }

  updateSelector() {
    // Position selector arrow
    if (this.focus && this.items.length > 0) {
      const visibleIndex = this.selectedIndex - this.scrollOffset;
      this.selector.y = this.items[this.selectedIndex].text.y;
      this.selector.visible = true;
    } else {
      this.selector.visible = false;
    }
  }

  navigate(direction) {
    if (this.items.length === 0) return;

    let newIndex = this.selectedIndex;

    switch (direction) {
      case 'up':
        newIndex = Math.max(0, this.selectedIndex - 1);
        break;
      case 'down':
        newIndex = Math.min(this.items.length - 1, this.selectedIndex + 1);
        break;
      case 'left':
        this.handleLeft();
        return;
      case 'right':
        this.handleRight();
        return;
    }

    this.onSelect.dispatch(newIndex, direction);

    if (newIndex !== this.selectedIndex) {
      this.selectedIndex = newIndex;
      this.adjustScroll();
      this.playNavSound();
    }
  }

  handleLeft() {
    const item = this.items[this.selectedIndex];
    if (!item) return;
    
    if (item.type === 'setting') {
      item.currentIndex = (item.currentIndex - 1 + item.options.length) % item.options.length;
      item.valueText.write(item.options[item.currentIndex].toString());
      if (item.callback) item.callback(item.currentIndex, item.options[item.currentIndex]);
      this.playNavSound();
    } else if (item.type === 'toggle') {
      item.state = !item.state;
      item.toggleSwitch.animations.play(item.state ? 'on' : 'off');
      if (item.callback) item.callback(item.state);
      this.playNavSound();
    }
  }

  handleRight() {
    const item = this.items[this.selectedIndex];
    if (!item) return;
    
    if (item.type === 'setting') {
      item.currentIndex = (item.currentIndex + 1) % item.options.length;
      item.valueText.write(item.options[item.currentIndex].toString());
      if (item.callback) item.callback(item.currentIndex, item.options[item.currentIndex]);
      this.playNavSound();
    } else if (item.type === 'toggle') {
      item.state = !item.state;
      item.toggleSwitch.animations.play(item.state ? 'on' : 'off');
      if (item.callback) item.callback(item.state);
      this.playNavSound();
    }
  }

  adjustScroll() {
    if (this.selectedIndex < this.scrollOffset) {
      this.scrollOffset = this.selectedIndex;
    } else if (this.selectedIndex >= this.scrollOffset + this.visibleItems) {
      this.scrollOffset = this.selectedIndex - this.visibleItems + 1;
    }
  }

  playNavSound() {
    Audio.play('sfx_ui_nav');
  }

  confirm() {
    if (this.items.length > 0) {
      const item = this.items[this.selectedIndex];
      if (item.type === 'item') {
        item.callback && item.callback(this.items[this.selectedIndex]);
        Audio.play('sfx_ui_select');
      } else {
        this.handleRight();
      }
      return true;
    }
    this.onConfirm.dispatch(this.selectedIndex, this.items[this.selectedIndex]);
    return false;
  }

  cancel() {
    this.items.forEach(item => {
      if (item.backButton) {
        item.callback();
        Audio.play('sfx_ui_cancel');
      }
    });
    this.onCancel.dispatch(this.selectedIndex);
  }

  clear() {
    this.items.forEach(item => {
      item.text.destroy();
      if (item.valueText) item.valueText.destroy();
      if (item.toggleText) item.toggleText.destroy();
    });
    this.frameParts.forEach(part => part.destroy());
    this.items = [];
    this.frameParts = [];
    this.selectedIndex = 0;
    this.scrollOffset = 0;
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  destroy() {
    this.clear();
    super.destroy();
  }
}

class CarouselMenu extends Phaser.Sprite {
  constructor(x, y, width, height, config = {}) {
    super(game, x, y);
    
    this.config = {
      animate: true,
      align: 'left',
      bgcolor: '#3498db',
      fgcolor: '#ffffff',
      ...config,
      margin: { top: 4, bottom: 4, left: 4, right: 4, ...(config.margin || {}) },
    };
    
    this.viewport = {
      width: width,
      height: height
    };
    
    this.items = [];
    this.selectedIndex = 0;
    this.scrollOffset = 0;
    this.itemHeight = 8;
    this.itemSpacing = 1;
    this.totalItemHeight = this.itemHeight + this.itemSpacing;
    
    this.visibleItems = Math.floor((height - this.config.margin.top - this.config.margin.bottom) / this.totalItemHeight);
    this.visibleItems = Math.max(1, this.visibleItems);
    
    this.isAnimating = false;
    this.inputEnabled = true;
    
    this.lastUp = false;
    this.lastDown = false;
    this.lastConfirm = false;
    this.lastCancel = false;
    
    this.setupInput();
    
    if (!this.config.silent) game.add.existing(this);
  }
  
  setupInput() {
    gamepad.releaseAll();

    this.onSelect = new Phaser.Signal();
    this.onConfirm = new Phaser.Signal();
    this.onCancel = new Phaser.Signal();
  }
  
  addItem(text, callback = null, data = {}) {
    const index = this.items.length;
    
    const item = {
      parent: null,
      background: null,
      text: null,
      textContent: text,
      callback: callback,
      data: data,
      index: index,
      originalX: this.config.align === 'right' ? this.config.margin.right : this.config.margin.left,
      originalAlpha: .4,
      isSelected: false,
      alphaTween: null
    };
    
    this.items.push(item);
    
    this.updateSelection();
    
    return item;
  }
  
  createItemVisuals(item, isSelected) {
    const index = item.index;
    let xPos = this.config.margin.left;
    let yPos = item.initialY || this.config.margin.top + (index * this.totalItemHeight);
    const data = item.data;
    
    item.initialY = null;
    
    const itemParent = new Phaser.Sprite(game, xPos, yPos);
    itemParent.alpha = .4;
    this.addChild(itemParent);
    
    const bgWidth = this.viewport.width - this.config.margin.left - this.config.margin.right;
    const bgHeight = this.itemHeight;
    
    const background = this.createGradientBackground(bgWidth, bgHeight, data.bgcolor);
    background.x = item.originalX;
    itemParent.addChild(background);
    
    const textX = this.config.align === 'right' ? 
      bgWidth - 8 : 8;
    const textAnchor = this.config.align === 'right' ? 1 : 0;
    
    const itemText = new Text(textX, 0, item.textContent, {
      ...FONTS.default,
      tint: data.fgcolor || this.config.fgcolor
    });
    itemText.anchor.x = textAnchor;
    itemText.y = 1;
    itemParent.addChild(itemText);
    
    if (item.textContent.length * 4 > this.viewport.width -16) {
      itemText.scrollwrite(item.textContent, (this.viewport.width - 16) / 4);
    }
    
    item.parent = itemParent;
    item.background = background;
    item.text = itemText;
  }
  
  removeItemVisuals(item) {
    item.parent?.destroy();
    item.parent = null;
    item.background = null;
    item.text = null;
  }
  
  createGradientBackground(width, height, color) {
    const bitmap = game.add.bitmapData(width, height);
    
    const gradient = bitmap.context.createLinearGradient(
      this.config.align === 'right' ? width : 0, 0,
      this.config.align === 'right' ? 0 : width, 0
    );
    
    const bgcolor = color || this.config.bgcolor;
    
    if (this.config.align === 'right') {
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.3, bgcolor);
      gradient.addColorStop(1, bgcolor);
    } else {
      gradient.addColorStop(0, bgcolor);
      gradient.addColorStop(0.7, bgcolor);
      gradient.addColorStop(1, 'transparent');
    }
    
    bitmap.context.fillStyle = gradient;
    bitmap.context.fillRect(0, 0, width, height);
    
    const sprite = game.add.sprite(0, 0, bitmap);
    return sprite;
  }
  
  update() {
    if (!this.inputEnabled) return;
    
    this.handleInput();
    this.updateAnimations();
  }
  
  handleInput() {
    const upPressed = gamepad.pressed.up && !this.lastUp;
    const downPressed = gamepad.pressed.down && !this.lastDown;
    const confirmPressed = gamepad.pressed.a && !this.lastConfirm;
    const cancelPressed = gamepad.pressed.b && !this.lastCancel;
    
    if (upPressed) {
      this.navigate(-1);
    } else if (downPressed) {
      this.navigate(1);
    }
    
    if (confirmPressed && this.items.length > 0) {
      this.confirm();
    }
    
    if (cancelPressed) {
      this.cancel();
    }
    
    this.lastUp = gamepad.pressed.up;
    this.lastDown = gamepad.pressed.down;
    this.lastConfirm = gamepad.pressed.a;
    this.lastCancel = gamepad.pressed.b;
  }
  
  navigate(direction) {
    if (this.items.length === 0 || this.isAnimating) return;
    
    const newIndex = Phaser.Math.clamp(
      this.selectedIndex + direction,
      0,
      this.items.length - 1
    );
    
    if (newIndex !== this.selectedIndex) {
      this.selectedIndex = newIndex;
      this.updateSelection();
      this.playNavSound();
      this.onSelect.dispatch(this.selectedIndex, this.items[this.selectedIndex]);
    }
  }
  
  updateSelection() {
    this.adjustScroll();
    
    this.items.forEach((item, index) => {
      const isSelected = index === this.selectedIndex;
      const isVisible = index >= this.scrollOffset && 
                       index < this.scrollOffset + this.visibleItems;
      
      if (isVisible) {
        if (!item.parent) {
          this.createItemVisuals(item, isSelected);
        }
        if (isSelected && !item.isSelected) {
          this.selectItem(item);
        } else if (!isSelected && item.isSelected) {
          this.deselectItem(item);
        }
      } else {
        if (item.parent) {
          this.removeItemVisuals(item);
        }
        if (item.isSelected) {
          this.deselectItem(item);
        }
      }
    });
    
    this.updateItemPositions();
  }
  
  selectItem(item) {
    // Deselect previously selected item
    const previouslySelected = this.items.find(i => i.isSelected && i !== item);
    if (previouslySelected) {
      this.deselectItem(previouslySelected);
    }
    
    item.isSelected = true;
    
    // Stop any existing tween
    if (item.alphaTween) {
      item.alphaTween.stop();
    }
    
    if (item.parent) {
      if (this.config.animate) {
        // Start yoyo animation for selected item
        item.alphaTween = game.add.tween(item.parent)
          .to({ alpha: 0.9 }, 250, Phaser.Easing.Quadratic.InOut, true, 0, -1, true)
          .yoyo(true, 500);
      } else {
        item.parent.alpha = 0.9;
      }
    }
  }
  
  deselectItem(item) {
    item.isSelected = false;
    
    // Stop yoyo animation
    if (item.alphaTween) {
      item.alphaTween.stop();
      item.alphaTween = null;
    }
    
    // Set fixed alpha for unselected items
    if (item.parent) {
      if (this.config.animate) {
        game.add.tween(item.parent)
          .to({ alpha: .4 }, 100, Phaser.Easing.Quadratic.Out, true);
      } else {
        item.parent.alpha = .4;
      }
    }
  }
  
  adjustScroll() {
    if (this.selectedIndex < this.scrollOffset) {
      this.scrollOffset = this.selectedIndex;
    } else if (this.selectedIndex >= this.scrollOffset + this.visibleItems) {
      this.scrollOffset = this.selectedIndex - this.visibleItems + 1;
    }
    
    this.scrollOffset = Phaser.Math.clamp(
      this.scrollOffset,
      0,
      Math.max(0, this.items.length - this.visibleItems)
    );
  }
  
  updateItemPositions() {
    this.items.forEach((item, index) => {
      const visibleIndex = index - this.scrollOffset;
      const targetY = this.config.margin.top + (visibleIndex * this.totalItemHeight);
      
      if (item.parent) {
        if (this.config.animate && !this.isAnimating) {
          game.add.tween(item.parent).to({ y: targetY }, 150, "Quad.easeOut", true);
        } else {
          item.parent.y = targetY;
        }
      } else {
        item.initialY = targetY;
      }
    });
  }
  
  updateAnimations() {
    // Update any ongoing animations here, might be removed 
  }
  
  confirm() {
    if (this.items.length === 0 || this.isAnimating) return;
    
    const selectedItem = this.items[this.selectedIndex];
    this.inputEnabled = false;
    this.isAnimating = true;
    
    this.animateSelection(selectedItem, () => {
      this.onConfirm.dispatch(this.selectedIndex, selectedItem);
      selectedItem.callback?.(selectedItem);
      this.destroy();
    });
  }
  
  animateSelection(item, callback) {
    // Stop all alpha tweens before starting selection animation
    this.items.forEach(otherItem => {
      if (otherItem.alphaTween) {
        otherItem.alphaTween.stop();
        otherItem.alphaTween = null;
      }
    });
    
    if (!item.parent) return;
    
    const fadeDirection = this.config.align === 'right' ? 100 : -100;
    
    this.items.forEach(otherItem => {
      if (otherItem !== item && otherItem.parent && otherItem.parent.visible) {
        game.add.tween(otherItem.parent).to({ 
          x: otherItem.parent.x + fadeDirection,
          alpha: 0 
        }, 500, "Quad.easeOut", true);
      }
    });
    
    // Ensure selected item is fully visible during selection
    if (item.alphaTween) {
      item.alphaTween.stop();
    }
    item.parent.alpha = 1;
    
    // Glow
    const bgWidth = this.viewport.width - this.config.margin.left - this.config.margin.right;
    const bgHeight = this.itemHeight;
    
    const background = this.createGradientBackground(bgWidth, bgHeight);
    background.x = this.config.align === 'right' ? this.config.margin.right : this.config.margin.left;
    background.alpha = 0;
    item.parent.addChild(background);
    
    const glowTween = game.add.tween(background).to({ alpha: 1 }, 100, "Linear", true);
    
    glowTween.onComplete.addOnce(() => {
      item.text.visible = false;
      const fadeOutTween = game.add.tween(item.parent).to({ alpha: 0 }, 100, "Linear", true);
      fadeOutTween.onComplete.addOnce(() => {
        callback?.();
      });
    });
    
    Audio.play('sfx_ui_select');
  }
  
  animateCancel(callback) {
    // Stop all alpha tweens before starting selection animation
    this.items.forEach(item => {
      if (item.alphaTween) {
        item.alphaTween.stop();
        item.alphaTween = null;
      }
    });
    
    const fadeDirection = this.config.align === 'right' ? 100 : -100;
    
    this.items.forEach(item => {
      if (item.parent && item.parent.visible) {
        game.add.tween(item.parent).to({ 
          x: item.parent.x + fadeDirection,
          alpha: 0 
        }, 500, "Quad.easeOut", true);
      }
    });
    
    game.time.events.add(500, () => callback?.());
  }
  
  cancel() {
    if (!this.isAnimating && this.onCancel.getNumListeners() > 0) {
      Audio.play('sfx_ui_cancel');
      this.animateCancel(() => {
        this.onCancel.dispatch();
        this.destroy();
      });
    }
  }
  
  playNavSound() {
    Audio.play('sfx_ui_nav');
  }
  
  clear() {
    // Stop all tweens before clearing
    this.items.forEach(item => {
      if (item.alphaTween) {
        item.alphaTween.stop();
      }
      if (item.parent) {
        item.parent.destroy();
      }
    });
    this.items = [];
    this.selectedIndex = 0;
    this.scrollOffset = 0;
    
    // Destroy the signals
    this.onSelect.dispose();
    this.onConfirm.dispose();
    this.onCancel.dispose();
  }
  
  destroy() {
    this.clear();
    super.destroy();
  }
}

class BackgroundGradient extends Phaser.Sprite {
  constructor(min = 0.1, max = 0.5, time = 5000) {
    super(game, 0, 0, "ui_background_gradient");
    
    this.alpha = min;
    
    game.add.tween(this).to({ alpha: max }, 5000, Phaser.Easing.Quadratic.InOut, true).yoyo(true).repeat(-1);
    
    game.add.existing(this);
  }
} 

class Background extends Phaser.Sprite {
  constructor(key, tween, min = 0.1, max = 0.5, time = 5000) {
    super(game, 0, 0, key);
    
    this.alpha = min;
    
    if (tween) game.add.tween(this).to({ alpha: max }, 5000, Phaser.Easing.Quadratic.InOut, true).yoyo(true).repeat(-1);
    
    game.add.existing(this);
  }
}

class FuturisticLines extends Phaser.Sprite {
  constructor() {
    super(game, 0, 0);
    
    this.lines = [];
    this.maxLines = 12;
    this.lineSpeed = 1.2;
    this.tailLength = 100;
    this.spawnRate = 150;
    this.lastSpawnTime = 0;
    
    this.lineColors = [0x76FCFF, 0x4AFCFE, 0x00E5FF, 0x00B8D4];
    this.lineAlpha = 0.3;
    
    this.graphics = game.add.graphics(0, 0);
    this.addChild(this.graphics);
    
    game.add.existing(this);
  }

  update() {
    const currentTime = game.time.now;
    
    if (this.lines.length < this.maxLines && currentTime - this.lastSpawnTime > this.spawnRate) {
      this.spawnLine();
      this.spawnRate = game.rnd.between(150, 2000);
      this.lastSpawnTime = currentTime;
    }
    
    this.updateLines();
    this.drawLines();
  }

  spawnLine() {
    const startY = game.rnd.integerInRange(10, game.height - 10);
    const color = game.rnd.pick(this.lineColors);
    const speed = this.lineSpeed * game.rnd.realInRange(0.9, 1.1);
    
    const line = {
      x: -20,
      y: startY,
      startY: startY,
      points: [{ x: -20, y: startY }],
      color: color,
      speed: speed,
      direction: 0,
      age: 0,
      maxAge: 10000,
      active: true,
      lastDirectionChange: 0,
      nextDirectionChangeTime: game.rnd.integerInRange(1000, 5000), // First change: 1-5 seconds
      state: 'straight' // 'straight', 'angled', 'returning'
    };
    
    this.lines.push(line);
  }

  updateLines() {
    for (let i = this.lines.length - 1; i >= 0; i--) {
      const line = this.lines[i];
      
      if (!line.active) {
        this.lines.splice(i, 1);
        continue;
      }
      
      line.age += game.time.elapsed;
      
      if (line.age > line.maxAge) {
        line.active = false;
        continue;
      }
      
      // Check if it's time to change direction based on state
      if (line.age - line.lastDirectionChange > line.nextDirectionChangeTime) {
        this.changeLineDirection(line);
      }
      
      // Calculate movement
      const angleRad = line.direction * (Math.PI / 180);
      const moveX = line.speed * Math.cos(angleRad);
      const moveY = line.speed * Math.sin(angleRad);
      
      line.x += moveX;
      line.y += moveY;
      
      line.points.push({ x: line.x, y: line.y });
      
      while (line.points.length > 0 && line.points[0].x < line.x - this.tailLength) {
        line.points.shift();
      }
      
      if (line.x > game.width + 100 + this.tailLength || line.y < -50 || line.y > game.height + 50) {
        line.active = false;
      }
    }
  }

  changeLineDirection(line) {
    line.lastDirectionChange = line.age;
    
    if (line.state === 'straight') {
      // First change: from straight to angled (-45° or 45°)
      line.direction = game.rnd.pick([-45, 45]);
      line.state = 'angled';
      line.nextDirectionChangeTime = game.rnd.integerInRange(100, 500);
      
    } else if (line.state === 'angled') {
      // Second change: from angled to straight
      line.direction = 0;
      
      line.state = 'straight';
      line.nextDirectionChangeTime = game.rnd.integerInRange(1000, 5000);
    }
  }

  drawLines() {
    this.graphics.clear();
    
    for (const line of this.lines) {
      if (!line.active || line.points.length < 2) continue;
      
      this.drawTail(line);
      this.drawCap(line);
    }
  }

  drawTail(line) {
    const points = line.points;
    
    for (let i = 1; i < points.length; i++) {
      const startPoint = points[i - 1];
      const endPoint = points[i];
      
      const fadeProgress = i / points.length;
      const alpha = i <= 4 ? 0 : this.lineAlpha * (fadeProgress * 0.9);
      
      this.graphics.lineStyle(1, line.color, alpha);
      this.graphics.moveTo(startPoint.x, startPoint.y);
      this.graphics.lineTo(endPoint.x, endPoint.y);
    }
  }

  drawCap(line) {
    if (line.points.length === 0) return;
    
    const head = line.points[line.points.length - 1];
    
    // Bright 1px center
    this.graphics.beginFill(0xFFFFFF, this.lineAlpha * 1.5);
    this.graphics.drawRect(head.x, head.y, 1, 1);
    
    this.graphics.endFill();
  }

  setDensity(density) {
    this.maxLines = Phaser.Math.clamp(density, 1, 15);
  }

  setSpeed(speed) {
    this.lineSpeed = Phaser.Math.clamp(speed, 0.5, 3);
  }

  setTailLength(length) {
    this.tailLength = Phaser.Math.clamp(length, 20, 100);
  }

  clearLines() {
    this.lines = [];
    this.graphics.clear();
  }

  setColors(colors) {
    this.lineColors = colors;
  }

  setAlpha(alpha) {
    this.lineAlpha = Phaser.Math.clamp(alpha, 0.1, 0.8);
  }

  destroy() {
    this.clearLines();
    this.graphics.destroy();
    super.destroy();
  }
}

class LocalSMParser {
  constructor() {
    this.baseUrl = "";
  }

  async parseSM(smContent, baseUrl) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    
    let out = {};
    let isSSC = smContent.includes("#VERSION:");

    if (isSSC) {
      return this.parseSSC(smContent, baseUrl);
    }

    // Clean and parse SM content
    let sm = smContent
      .replace(/\/\/.*/g, "")
      .replace(/\r?\n|\r/g, "")
      .split(";");
    
    for (let i = sm.length - 1; i >= 0; i -= 1) {
      if (sm[i]) {
        sm[i] = sm[i].split(/:/g);
        for (let p in sm[i]) sm[i][p] = sm[i][p].trim();
      } else sm.splice(i, 1);
    }

    let steps = {};
    out.bpmChanges = [];
    out.stops = [];
    out.notes = {};
    out.backgrounds = [];
    out.banner = "assets/no-banner.png";
    out.difficulties = [];
    out.background = "assets/no-background.png";
    out.cdtitle = null;
    out.audioUrl = null;
    out.videoUrl = null;
    out.sampleStart = 0;
    out.sampleLength = 10;
    out.baseUrl = baseUrl;

    for (let i in sm) {
      let p = sm[i];
      switch (p[0]) {
        case "#TITLE":
          out.title = p[1];
          break;
        case "#SUBTITLE":
          out.subtitle = p[1];
          break;
        case "#ARTIST":
          out.artist = p[1];
          break;
        case "#TITLETRANSLIT":
          out.titleTranslit = p[1];
          break;
        case "#SUBTITLETRANSLIT":
          out.subtitleTranslit = p[1];
          break;
        case "#ARTISTTRANSLIT":
          out.artistTranslit = p[1];
          break;
        case "#GENRE":
          out.genre = p[1];
          break;
        case "#CREDIT":
          out.credit = p[1];
          break;
        case "#BGCHANGES":
          if (p[1]) {
            p[1].split(",").forEach(entry => {
              entry = entry.trim();
              if (!entry) return;

              const parts = entry.split("=").filter(x => x !== "");
              if (parts.length < 6) return;

              const bgEntry = {
                beat: parseFloat(parts[0]),
                file: parts[1],
                opacity: parseFloat(parts[2]),
                fadeIn: parseInt(parts[3]) || 0,
                fadeOut: parseInt(parts[4]) || 0,
                effect: parseInt(parts[5]) || 0,
                type: "image",
                startTime: 0,
                duration: 0
              };

              // Determine file type
              if (bgEntry.file) {
                const ext = bgEntry.file.split(".").pop().toLowerCase();
                bgEntry.type = ["mp4", "avi", "mov"].includes(ext) ? "video" : "image";
                bgEntry.url = this.resolveFileUrl(bgEntry.file);
              }

              // Calculate timing
              if (parts.length > 6) {
                bgEntry.duration = parseFloat(parts[6]) || 0;
                bgEntry.startTime = parseFloat(parts[7]) || 0;
              }

              out.backgrounds.push(bgEntry);
            });
          }
          break;
        case "#BANNER":
          if (p[1]) out.banner = this.resolveFileUrl(p[1]);
          break;
        case "#CDTITLE":
          if (p[1]) out.cdtitle = this.resolveFileUrl(p[1]);
          break;
        case "#SAMPLESTART":
          if (p[1]) out.sampleStart = parseFloat(p[1]);
          break;
        case "#SAMPLELENGTH":
          if (p[1]) out.sampleLength = parseFloat(p[1]);
          break;
        case "#BACKGROUND":
          if (p[1]) out.background = this.resolveFileUrl(p[1]);
          break;
        case "#VIDEO":
          if (p[1]) out.videoUrl = this.resolveFileUrl(p[1]);
          break;
        case "#MUSIC":
          if (p[1]) {
            out.audio = p[1];
            out.audioUrl = this.resolveFileUrl(p[1]);
          }
          break;
        case "#OFFSET":
          out.offset = Number(p[1]);
          break;
        case "#BPMS": {
          let bx = p[1].split(",");
          bx = bx.filter(i => /=/.exec(i));
          for (let i in bx) {
            let v = bx[i].split("=");
            bx[i] = { beat: Number(v[0]), bpm: Number(v[1]) };
          }
          out.bpmChanges = out.bpmChanges.concat(bx);
          break;
        }
        case "#STOPS": {
          let bx = p[1].split(",");
          bx = bx.filter(i => i.includes("="));
          for (let i in bx) {
            let v = bx[i].split("=");
            bx[i] = { beat: Number(v[0]), len: Number(v[1]) };
          }
          out.stops = out.stops.concat(bx);
          break;
        }
        case "#NOTES":
          steps[p[3] + p[4]] = p[6].split(",");
          out.difficulties.push({
            type: p[3],
            rating: p[4]
          });
          break;
      }
    }

    // Process BPM changes and stops
    out.bpmChanges.sort((a, b) => a.beat - b.beat);
    if (out.bpmChanges[0].beat !== 0) throw `No starting bpm, first bpm change is ${out.bpmChanges[0]}`;
    out.bpmChanges[0].sec = 0;
    for (let i = 1; i < out.bpmChanges.length; i++) {
      out.bpmChanges[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.bpmChanges[i].beat);
    }
    for (let i = 0; i < out.stops.length; i++) {
      out.stops[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.stops[i].beat);
    }

    // Process notes
    for (let key in steps) {
      let unfinHolds = [null, null, null, null];
      out.notes[key] = [];
      for (let m in steps[key]) {
        steps[key][m] = steps[key][m].trim();
        if (steps[key][m].length % 4)
          throw `Invalid length on measure ${m}, length is ${steps[key][m].length}`;
        steps[key][m] = steps[key][m].match(/(.{4})/g);

        let t = steps[key][m].length;
        for (let l in steps[key][m]) {
          let nt = steps[key][m][l];
          let note = [{}, {}, {}, {}];
          let b = m * 4 + (l / t) * 4;
          for (let c = 0; c < note.length; c++) {
            switch (nt[c]) {
              case "3": // Hold end
                if (unfinHolds[c] == null) throw `hold end without any hold before`;
                {
                  let i = out.notes[key][unfinHolds[c]];
                  i.beatEnd = b;
                  i.beatLength = b - i.beat;
                  i.secEnd = this.beatToSec(out.bpmChanges, out.stops, b);
                  i.secLength = this.beatToSec(out.bpmChanges, out.stops, b) - this.beatToSec(out.bpmChanges, out.stops, i.beat);
                }
                unfinHolds[c] = null;
              case "0": // Empty
                note[c] = null;
                continue;
              case "4": // Roll start
              case "2": // Hold start
                if (unfinHolds[c]) throw `new hold started before last ended`;
                unfinHolds[c] = out.notes[key].length + c;
              case "1": // Regular note
              case "M": // Mine
                note[c].type = nt[c];
                break;
              default:
                throw `invalid note type ${nt[c]}`;
            }
            note[c].beat = b;
            note[c].sec = this.beatToSec(out.bpmChanges, out.stops, b);
            note[c].column = c;
          }
          out.notes[key] = out.notes[key].concat(note);
        }
      }
      out.notes[key] = out.notes[key].filter(i => i !== null);
    }

    return out;
  }

  resolveFileUrl(filename) {
    if (!filename) return null;
    // Handle absolute URLs and relative paths
    if (filename.startsWith('http') || filename.startsWith('//')) {
      return filename;
    }
    return this.baseUrl + filename;
  }

  getLastBpm(bpmChanges, time, valueType) {
    return bpmChanges.find((e, i, a) => i + 1 == a.length || a[i + 1][valueType] >= time);
  }

  beatToSec(bpmChanges, stops, beat) {
    let b = this.getLastBpm(bpmChanges, beat, "beat");
    let x = ((beat - b.beat) / b.bpm) * 60 + b.sec;
    let s = stops.filter(({ beat: i }) => i >= b.beat && i < beat).map(i => i.len);
    for (let i in s) x += s[i];
    return x;
  }

  parseSSC(sscContent, baseUrl) {
    // Simplified SSC parser - you can expand this as needed
    const sections = sscContent.split(/\/\/-+/);
    const headerSection = sections[0];
    
    const out = {
      bpmChanges: [],
      stops: [],
      notes: {},
      backgrounds: [],
      banner: "assets/no-banner.png",
      difficulties: [],
      background: "assets/no-background.png",
      cdtitle: null,
      audioUrl: null,
      videoUrl: null,
      sampleStart: 0,
      sampleLength: 10,
      baseUrl: baseUrl
    };

    // Parse header tags
    const lines = headerSection.split('\n');
    for (let line of lines) {
      if (line.startsWith('#')) {
        const [key, ...valueParts] = line.slice(1).split(':');
        const value = valueParts.join(':').trim();
        
        switch(key) {
          case 'TITLE': out.title = value; break;
          case 'ARTIST': out.artist = value; break;
          case 'BANNER': out.banner = this.resolveFileUrl(value); break;
          case 'BACKGROUND': out.background = this.resolveFileUrl(value); break;
          case 'MUSIC': 
            out.audio = value;
            out.audioUrl = this.resolveFileUrl(value);
            break;
          // Add more tags as needed
        }
      }
    }

    return out;
  }
}

class ExternalSMParser {
  parseSM(files, smContent) {
    let out = {};
    let isSSC = smContent.includes("#VERSION:");

    if (isSSC) {
      return this.parseSSC(files, smContent);
    }

    // Clean and parse SM content
    let sm = smContent
      .replace(/\/\/.*/g, "")
      .replace(/\r?\n|\r/g, "")
      .split(";");

    for (let i = sm.length - 1; i >= 0; i -= 1) {
      if (sm[i]) {
        sm[i] = sm[i].split(/:/g);
        for (let p in sm[i]) sm[i][p] = sm[i][p].trim();
      } else sm.splice(i, 1);
    }

    let steps = {};
    out.bpmChanges = [];
    out.stops = [];
    out.notes = {};
    out.backgrounds = [];
    out.banner = "assets/no-banner.png";
    out.difficulties = [];
    out.background = "assets/no-background.png";
    out.cdtitle = null;
    out.audioUrl = null;
    out.videoUrl = null;
    out.files = files;
    out.sampleStart = 0;
    out.sampleLength = 10;

    for (let i in sm) {
      let p = sm[i];
      switch (p[0]) {
        case "#TITLE":
          out.title = p[1];
          break;
        case "#SUBTITLE":
          out.subtitle = p[1];
          break;
        case "#ARTIST":
          out.artist = p[1];
          break;
        case "#TITLETRANSLIT":
          out.titleTranslit = p[1];
          break;
        case "#SUBTITLETRANSLIT":
          out.subtitleTranslit = p[1];
          break;
        case "#ARTISTTRANSLIT":
          out.artistTranslit = p[1];
          break;
        case "#GENRE":
          out.genre = p[1];
          break;
        case "#CREDIT":
          out.credit = p[1];
          break;
        case "#BGCHANGES":
          if (p[1]) {
            p[1].split(",").forEach(entry => {
              entry = entry.trim();
              if (!entry) return;

              const parts = entry.split("=").filter(x => x !== "");
              if (parts.length < 6) return;

              const bgEntry = {
                beat: parseFloat(parts[0]),
                file: parts[1],
                opacity: parseFloat(parts[2]),
                fadeIn: parseInt(parts[3]) || 0,
                fadeOut: parseInt(parts[4]) || 0,
                effect: parseInt(parts[5]) || 0,
                type: "image",
                startTime: 0,
                duration: 0
              };

              if (bgEntry.file) {
                const ext = bgEntry.file.split(".").pop().toLowerCase();
                bgEntry.type = ["mp4", "avi", "mov"].includes(ext) ? "video" : "image";
                // Create URL for the file if it exists
                if (files[bgEntry.file.toLowerCase()]) {
                  const file = files[bgEntry.file.toLowerCase()];
                  bgEntry.url = file.localURL ? file.localURL : URL.createObjectURL(file);
                  bgEntry.url = bgEntry.url
                    .replace('cdvfile://', 'file://')
                    .replace('localhost/persistent/', '/storage/emulated/0/');
                }
              }

              if (parts.length > 6) {
                bgEntry.duration = parseFloat(parts[6]) || 0;
                bgEntry.startTime = parseFloat(parts[7]) || 0;
              }

              out.backgrounds.push(bgEntry);
            });
          }
          break;
        case "#BANNER":
          if (p[1] && files[p[1].toLowerCase()]) {
            const file = files[p[1].toLowerCase()];
            out.banner = file.localURL ? file.localURL : URL.createObjectURL(file);
            out.banner = out.banner
              .replace('cdvfile://', 'file://')
              .replace('localhost/persistent/', '/storage/emulated/0/');
          }
          break;
        case "#CDTITLE":
          if (p[1] && files[p[1].toLowerCase()]) {
            const file = files[p[1].toLowerCase()];
            out.cdtitle = file.localURL ? file.localURL : URL.createObjectURL(file);
            out.cdtitle = out.cdtitle
              .replace('cdvfile://', 'file://')
              .replace('localhost/persistent/', '/storage/emulated/0/');
          }
          break;
        case "#SAMPLESTART":
          if (p[1]) out.sampleStart = parseFloat(p[1]);
          break;
        case "#SAMPLELENGTH":
          if (p[1]) out.sampleLength = parseFloat(p[1]);
          break;
        case "#BACKGROUND":
          if (p[1] && files[p[1].toLowerCase()]) {
            const file = files[p[1].toLowerCase()];
            out.background = file.localURL ? file.localURL : URL.createObjectURL(file);
            out.background = out.background
              .replace('cdvfile://', 'file://')
              .replace('localhost/persistent/', '/storage/emulated/0/');
          }
          break;
        case "#VIDEO":
          if (p[1] && files[p[1].toLowerCase()]) {
            const file = files[p[1].toLowerCase()];
            out.videoUrl = file.localURL ? file.localURL : URL.createObjectURL(file);
            out.videoUrl = out.videoUrl
              .replace('cdvfile://', 'file://')
              .replace('localhost/persistent/', '/storage/emulated/0/');
          }
          break;
        case "#MUSIC":
          if (p[1]) {
            out.audio = p[1];
            if (files[p[1].toLowerCase()]) {
              const file = files[p[1].toLowerCase()];
              out.audioUrl = file.localURL ? file.localURL : URL.createObjectURL(file);
              out.audioUrl = out.audioUrl
                .replace('cdvfile://', 'file://')
                .replace('localhost/persistent/', '/storage/emulated/0/');
            }
          }
          break;
        case "#OFFSET":
          out.offset = Number(p[1]);
          break;
        case "#BPMS": {
          let bx = p[1].split(",");
          bx = bx.filter(i => /=/.exec(i));
          for (let i in bx) {
            let v = bx[i].split("=");
            bx[i] = { beat: Number(v[0]), bpm: Number(v[1]) };
          }
          out.bpmChanges = out.bpmChanges.concat(bx);
          break;
        }
        case "#STOPS": {
          let bx = p[1].split(",");
          bx = bx.filter(i => i.includes("="));
          for (let i in bx) {
            let v = bx[i].split("=");
            bx[i] = { beat: Number(v[0]), len: Number(v[1]) };
          }
          out.stops = out.stops.concat(bx);
          break;
        }
        case "#NOTES":
          steps[p[3] + p[4]] = p[6].split(",");
          out.difficulties.push({
            type: p[3],
            rating: p[4]
          });
          break;
      }
    }

    // Process BPM changes and stops
    out.bpmChanges.sort((a, b) => a.beat - b.beat);
    if (out.bpmChanges.length === 0 || out.bpmChanges[0].beat !== 0) {
      throw "No starting bpm";
    }
    out.bpmChanges[0].sec = 0;
    for (let i = 1; i < out.bpmChanges.length; i++) {
      out.bpmChanges[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.bpmChanges[i].beat);
    }
    for (let i = 0; i < out.stops.length; i++) {
      out.stops[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.stops[i].beat);
    }

    // Process notes
    for (let key in steps) {
      let unfinHolds = [null, null, null, null];
      out.notes[key] = [];
      for (let m in steps[key]) {
        steps[key][m] = steps[key][m].trim();
        if (steps[key][m].length % 4) throw `Invalid length on measure ${m}, length is ${steps[key][m].length}`;
        steps[key][m] = steps[key][m].match(/(.{4})/g);

        let t = steps[key][m].length;
        for (let l in steps[key][m]) {
          let nt = steps[key][m][l];
          let note = [{}, {}, {}, {}];
          let b = m * 4 + (l / t) * 4;
          for (let c = 0; c < note.length; c++) {
            switch (nt[c]) {
              case "3": // Hold end
                if (unfinHolds[c] == null) throw `hold end without any hold before`;
                {
                  let i = out.notes[key][unfinHolds[c]];
                  i.beatEnd = b;
                  i.beatLength = b - i.beat;
                  i.secEnd = this.beatToSec(out.bpmChanges, out.stops, b);
                  i.secLength = this.beatToSec(out.bpmChanges, out.stops, b) - this.beatToSec(out.bpmChanges, out.stops, i.beat);
                }
                unfinHolds[c] = null;
              case "0": // Empty
                note[c] = null;
                continue;
              case "4": // Roll start
              case "2": // Hold start
                if (unfinHolds[c]) throw `new hold started before last ended`;
                unfinHolds[c] = out.notes[key].length + c;
              case "1": // Regular note
              case "M": // Mine
                note[c].type = nt[c];
                break;
              default:
                throw `invalid note type ${nt[c]}`;
            }
            note[c].beat = b;
            note[c].sec = this.beatToSec(out.bpmChanges, out.stops, b);
            note[c].column = c;
          }
          out.notes[key] = out.notes[key].concat(note);
        }
      }
      out.notes[key] = out.notes[key].filter(i => i !== null);
    }

    return out;
  }

  parseSSC(files, sscContent) {
    const sections = sscContent.split(/\/\/-+/);
    const headerSection = sections[0];
    const chartSections = sections.slice(1);

    const out = {
      bpmChanges: [],
      stops: [],
      notes: {},
      backgrounds: [],
      banner: "assets/no-banner.png",
      difficulties: [],
      background: "assets/no-background.png",
      cdtitle: null,
      audioUrl: null,
      videoUrl: null,
      files: files,
      sampleStart: 0,
      sampleLength: 10
    };

    // Parse global metadata
    const headerTags = {};
    headerSection
      .split("\n")
      .filter(line => line.trim().startsWith("#"))
      .forEach(line => {
        const [key, ...rest] = line.slice(1).split(":");
        let value = rest.join(":").trim().replace(/;+$/, "");
        if (["BPMS", "STOPS", "BGCHANGES"].includes(key)) {
          value = value
            .split(",")
            .map(v => v.trim())
            .join(",");
        }
        headerTags[key] = value;
      });

    // Get audio file URL
    if (headerTags.MUSIC && files[headerTags.MUSIC.toLowerCase()]) {
      const audioFile = files[headerTags.MUSIC.toLowerCase()];
      out.audioUrl = audioFile.localURL ? audioFile.localURL : URL.createObjectURL(audioFile);
      out.audio = headerTags.MUSIC;
    }

    Object.assign(out, {
      title: headerTags.TITLE || "",
      subtitle: headerTags.SUBTITLE || "",
      artist: headerTags.ARTIST || "",
      titleTranslit: headerTags.TITLETRANSLIT || "",
      subtitleTranslit: headerTags.SUBTITLETRANSLIT || "",
      artistTranslit: headerTags.ARTISTTRANSLIT || "",
      genre: headerTags.GENRE || "",
      credit: headerTags.CREDIT || "",
      offset: Number(headerTags.OFFSET) || 0,
      sampleStart: Number(headerTags.SAMPLESTART) || 0,
      sampleLength: Number(headerTags.SAMPLELENGTH) || 10
    });

    // Get banner
    if (headerTags.BANNER && files[headerTags.BANNER.toLowerCase()]) {
      const bannerFile = files[headerTags.BANNER.toLowerCase()];
      out.banner = bannerFile.localURL ? bannerFile.localURL : URL.createObjectURL(bannerFile);
    }

    // Get background
    if (headerTags.BACKGROUND && files[headerTags.BACKGROUND.toLowerCase()]) {
      const bgFile = files[headerTags.BACKGROUND.toLowerCase()];
      out.background = bgFile.localURL ? bgFile.localURL : URL.createObjectURL(bgFile);
    }

    // Parse BPMs
    if (headerTags.BPMS) {
      const bpmList = headerTags.BPMS.split(",").map(entry => {
        const [beat, bpm] = entry.split("=");
        return { beat: Number(beat), bpm: Number(bpm) };
      });
      out.bpmChanges = bpmList;
    }

    // Parse stops
    if (headerTags.STOPS) {
      const stopList = headerTags.STOPS.split(",").map(entry => {
        const [beat, len] = entry.split("=");
        return { beat: Number(beat), len: Number(len) };
      });
      out.stops = stopList;
    }

    // Process BPM changes and stops timing
    if (out.bpmChanges.length > 0) {
      out.bpmChanges.sort((a, b) => a.beat - b.beat);
      out.bpmChanges[0].sec = 0;
      for (let i = 1; i < out.bpmChanges.length; i++) {
        out.bpmChanges[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.bpmChanges[i].beat);
      }
      for (let i = 0; i < out.stops.length; i++) {
        out.stops[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.stops[i].beat);
      }
    }

    // Parse chart sections (simplified - you may want to expand this)
    chartSections.forEach(section => {
      const lines = section.split("\n").filter(line => line.trim() !== "");
      const chartTags = {};
      let inNotes = false;
      let noteData = [];

      lines.forEach(line => {
        if (line.startsWith("#")) {
          if (line.startsWith("#NOTES")) {
            inNotes = true;
          } else if (!line.startsWith("#NOTEDATA") && !line.startsWith("#CHARTNAME")) {
            const [key, ...rest] = line.slice(1).split(":");
            const value = rest.join(":").trim().replace(/;+$/, "");
            chartTags[key] = value;
          }
        } else if (inNotes) {
          if (line.trim() === ";") {
            inNotes = false;
          } else {
            noteData.push(line.trim());
          }
        }
      });

      if (chartTags.DIFFICULTY && chartTags.METER) {
        const difficultyKey = `${chartTags.DIFFICULTY}${chartTags.METER}`;
        out.difficulties.push({
          type: chartTags.DIFFICULTY,
          rating: chartTags.METER
        });

        // Convert note data to our format (simplified)
        out.notes[difficultyKey] = this.convertSSCNotes(noteData, out.bpmChanges, out.stops);
      }
    });

    return out;
  }

  convertSSCNotes(noteData, bpmChanges, stops) {
    // Simplified conversion - you may need to expand this based on your needs
    const notes = [];
    let measureIndex = 0;

    noteData.forEach(measure => {
      const rows = measure.split("\n").filter(row => row.trim() !== "");
      const rowsPerMeasure = rows.length;

      rows.forEach((row, rowIndex) => {
        const beat = measureIndex * 4 + (rowIndex / rowsPerMeasure) * 4;

        for (let column = 0; column < 4 && column < row.length; column++) {
          const noteChar = row[column];
          if (noteChar !== "0" && noteChar !== "3") {
            // Skip empty and hold ends
            const note = {
              type: noteChar,
              beat: beat,
              sec: this.beatToSec(bpmChanges, stops, beat),
              column: column
            };
            notes.push(note);
          }
        }
      });

      measureIndex++;
    });

    return notes;
  }

  getLastBpm(bpmChanges, time, valueType) {
    return bpmChanges.find((e, i, a) => i + 1 == a.length || a[i + 1][valueType] >= time);
  }

  beatToSec(bpmChanges, stops, beat) {
    if (!bpmChanges || bpmChanges.length === 0) return beat;

    let b = this.getLastBpm(bpmChanges, beat, "beat");
    let x = ((beat - b.beat) / b.bpm) * 60 + b.sec;
    let s = stops.filter(({ beat: i }) => i >= b.beat && i < beat).map(i => i.len);
    for (let i in s) x += s[i];
    return x;
  }
}

class BackgroundMusic {
  constructor() {
    this.audio = document.createElement("audio");
    this.audio.volume = [0,25,50,75,100][Account.settings.volume] / 100;
    this.randomSong = Account.settings.randomSong;
    this.audio.loop = true;
    this.isPlaying = false;
    this.currentSong = null;
    this.availableSongsCache = null; // Cache for available songs
    this.cacheTimestamp = 0;
    this.cacheDuration = 30000; // Cache for 30 seconds
    this.registerVisibilityChangeListener();
  }
  
  registerVisibilityChangeListener() {
    this.visibilityHiddenState = game.state.current;
    this.visibilityVisibleState = game.state.current;
    window.addEventListener('visibilitychange', () => {
      if (document.hidden && this.visibilityVisibleState == game.state.current) {
        this.audio.pause();
        this.visibilityHiddenState = game.state.current;
      } else if (this.visibilityHiddenState == game.state.current) {
        this.audio.play();
        this.visibilityVisibleState = game.state.current;
      }
    });
  }

  async playLastSong() {
    if (this.isPlaying || !Account.settings.enableMenuMusic) return;
    
    if (this.randomSong || !Account.lastSong) {
      this.playRandomSong();
      return;
    }
    
    const lastSong = Account.lastSong;
    
    if (lastSong.isExternal) {
      try {
        await this.checkUrlAccessible(lastSong.url);
        this.playSong(lastSong);
      } catch (error) {
        console.warn("Last external song not accessible, falling back to random song:", error);
        this.playRandomSong();
      }
    } else {
      this.playSong(lastSong);
    }
  }

  playRandomSong() {
    // Get cached available songs (fast)
    const allSongs = this.getCachedAvailableSongs();
    
    if (allSongs.length === 0) {
      console.log("No songs available for background music");
      return;
    }
    
    const randomSong = game.rnd.pick(allSongs);
    const songData = {
      url: randomSong.audioUrl,
      title: randomSong.title || randomSong.chart?.title || "Unknown",
      artist: randomSong.artist || randomSong.chart?.artist || "Unknown",
      sampleStart: randomSong.sampleStart || randomSong.chart?.sampleStart || 0,
      isExternal: randomSong.files !== undefined || randomSong.chart?.files !== undefined
    };
    
    this.playSong(songData);
  }

  getCachedAvailableSongs() {
    const now = Date.now();
    
    // Return cached songs if they're still fresh
    if (this.availableSongsCache && now - this.cacheTimestamp < this.cacheDuration) {
      return this.availableSongsCache;
    }
    
    // Otherwise, build the cache (fast version without URL checking)
    this.availableSongsCache = this.getAllAvailableSongsFast();
    this.cacheTimestamp = now;
    
    return this.availableSongsCache;
  }

  getAllAvailableSongsFast() {
    const allSongs = [];
    const seenUrls = new Set();
    
    // Add local songs (always accessible)
    if (window.localSongs && window.localSongs.length > 0) {
      for (const song of window.localSongs) {
        if (song.audioUrl && this.isValidAudioUrl(song.audioUrl)) {
          if (!seenUrls.has(song.audioUrl)) {
            seenUrls.add(song.audioUrl);
            allSongs.push(song);
          }
        }
      }
    }
    
    // Add external songs (don't check accessibility - we'll handle failures during playback)
    if (window.externalSongs && window.externalSongs.length > 0) {
      for (const song of window.externalSongs) {
        if (song.audioUrl && this.isValidAudioUrl(song.audioUrl)) {
          if (!seenUrls.has(song.audioUrl)) {
            seenUrls.add(song.audioUrl);
            allSongs.push(song);
          }
        }
      }
    }
    
    // Add current state songs
    const currentState = game.state.getCurrentState();
    if (currentState && currentState.songs && Array.isArray(currentState.songs)) {
      for (const song of currentState.songs) {
        if (song.audioUrl && this.isValidAudioUrl(song.audioUrl)) {
          if (!seenUrls.has(song.audioUrl)) {
            seenUrls.add(song.audioUrl);
            allSongs.push(song);
          }
        }
      }
    }
    
    console.log(`🎵 Available songs for randomization: ${allSongs.length}`);
    return allSongs;
  }

  isValidAudioUrl(url) {
    // Fast URL validation - exclude obviously invalid URLs
    if (!url) return false;
    if (typeof url !== 'string') return false;
    if (url.includes("assets/no-")) return false;
    if (url === "undefined" || url === "null") return false;
    if (url.trim().length === 0) return false;
    return true;
  }

  async checkUrlAccessible(url) {
    return new Promise((resolve, reject) => {
      if (url.startsWith('blob:')) {
        resolve();
        return;
      }
      
      const audio = document.createElement("audio");
      audio.preload = 'metadata';
      
      audio.onloadedmetadata = () => {
        audio.remove();
        resolve();
      };
      
      audio.onerror = () => {
        audio.remove();
        reject(new Error('Audio load failed'));
      };
      
      // Force quick timeout
      setTimeout(() => {
        audio.remove();
        reject(new Error('Audio load timeout'));
      }, 800);
      
      audio.src = url;
    });
  }

  playSong(songData) {
    // Stop current audio if playing
    this.audio.pause();
    this.audio.currentTime = 0;
    
    this.audio.src = songData.url;
    this.audio.currentTime = songData.sampleStart || 0;
    
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.currentSong = songData;
      console.log(`🎵 Now playing: ${songData.title} - ${songData.artist}`);
      if (notifications) {
        const displayText = `${songData.title} - ${songData.artist}`;
        //notifications.show(`NOW PLAYING: \n ${displayText}`, 3000);
      }
    }).catch(error => {
      console.warn(`Failed to play background music: ${songData.title}`, error);
      
      // Remove the failed song from cache to avoid picking it again
      this.removeSongFromCache(songData.url);
      
      // Try another random song if this one fails
      setTimeout(() => {
        this.playRandomSong();
      }, 100);
    });
  }

  removeSongFromCache(failedUrl) {
    if (this.availableSongsCache) {
      this.availableSongsCache = this.availableSongsCache.filter(
        song => song.audioUrl !== failedUrl
      );
    }
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
    this.currentSong = null;
  }

  setVolume(volume) {
    this.audio.volume = [0,25,50,100][volume-1] / 100;
  }

  // Method to manually refresh the cache
  refreshCache() {
    this.availableSongsCache = null;
    this.cacheTimestamp = 0;
  }

  destroy() {
    this.stop();
    this.audio.src = "";
    this.audio = null;
    this.availableSongsCache = null;
  }
}

class NotificationSystem {
  constructor() {
    this.queue = [];
    this.isShowing = false;
    this.currentNotification = null;
    this.duration = 3000;
    this.lineHeight = 8;
    this.padding = 8;
    this.maxLineWidth = 160; // Maximum width for text before wrapping (in pixels)
    this.charWidth = 4; // Approximate width per character
    
    this.notificationWindow = null;
    this.notificationTexts = null;
    
    this.restrictedStates = new Set(['Title', 'Play', 'Load', 'LoadLocalSongs', 'LoadExternalSongs', 'LoadSongFolder', 'Boot']);
    this.allowedStates = new Set(['MainMenu', 'SongSelect', 'Results']);
    
    this.setupStateChangeHandling();
  }

  setupStateChangeHandling() {
    const originalStart = game.state.start;
    
    game.state.start = function(key, clearWorld, clearCache, ...args) {
      if (notifications && notifications.isShowing) {
        notifications.preserveCurrentNotification();
      }
      
      return originalStart.call(this, key, clearWorld, clearCache, ...args);
    };
    
    game.state.onStateChange.add(this.onStateChange, this);
  }

  onStateChange(newState) {
    game.time.events.add(100, () => {
      const currentState = game.state.getCurrentState();
      const stateName = currentState?.constructor?.name || '';
      
      if (this.isStateAllowed(stateName)) {
        this.processPendingNotifications();
      }
      
      if (this.preservedNotification) {
        this.restorePreservedNotification();
      }
    });
  }

  show(text, duration = 3000) {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    
    // Wrap text before queuing
    const wrappedText = this.wrapText(text);
    
    this.queue.push({ 
      text: wrappedText, 
      originalText: text, // Keep original for debugging
      duration,
      endTime: Date.now() + duration,
      queuedInState: stateName
    });
    
    console.log(`📢 Notification queued in ${stateName}: "${text}" -> "${wrappedText}"`);
    
    if (this.isStateAllowed(stateName) && !this.isShowing) {
      this.processNext();
    }
  }

  wrapText(text) {
    const lines = text.split('\n');
    const wrappedLines = [];
    
    for (let line of lines) {
      // If line is already within limits, keep it as is
      if (this.getTextWidth(line) <= this.maxLineWidth) {
        wrappedLines.push(line);
        continue;
      }
      
      // Split long line into multiple wrapped lines
      let currentLine = '';
      const words = line.split(' ');
      
      for (let word of words) {
        // If word itself is too long, break it
        if (this.getTextWidth(word) > this.maxLineWidth) {
          // If we have content in current line, push it first
          if (currentLine) {
            wrappedLines.push(currentLine.trim());
            currentLine = '';
          }
          // Break the long word
          const brokenWord = this.breakLongWord(word);
          wrappedLines.push(...brokenWord);
          continue;
        }
        
        // Test if adding this word would exceed the limit
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (this.getTextWidth(testLine) <= this.maxLineWidth) {
          currentLine = testLine;
        } else {
          // Push current line and start new one
          if (currentLine) {
            wrappedLines.push(currentLine.trim());
          }
          currentLine = word;
        }
      }
      
      // Push the last line
      if (currentLine) {
        wrappedLines.push(currentLine.trim());
      }
    }
    
    return wrappedLines.join('\n');
  }

  breakLongWord(word) {
    const chunks = [];
    let currentChunk = '';
    
    for (let i = 0; i < word.length; i++) {
      currentChunk += word[i];
      
      // Check if adding next character would exceed limit
      if (this.getTextWidth(currentChunk + (word[i + 1] || '')) > this.maxLineWidth) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  getTextWidth(text) {
    // Simple approximation based on character count and average width
    return text.length * this.charWidth;
  }

  processPendingNotifications() {
    if (this.queue.length > 0 && !this.isShowing) {
      console.log(`📢 Processing ${this.queue.length} pending notifications`);
      this.processNext();
    }
  }

  processNext() {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    
    if (!this.isStateAllowed(stateName)) {
      console.log(`📢 Processing blocked in restricted state: ${stateName}`);
      return;
    }
    
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const notification = this.queue.shift();
    this.currentNotification = notification;

    console.log(`📢 Showing notification: "${notification.originalText}"`);
    this.displayNotification(notification.text);

    game.time.events.add(notification.duration, () => {
      this.hideCurrent();
    });
  }

  preserveCurrentNotification() {
    if (this.currentNotification && this.notificationWindow) {
      this.preservedNotification = {
        text: this.currentNotification.text,
        originalText: this.currentNotification.originalText,
        duration: this.currentNotification.duration,
        remainingTime: this.currentNotification.endTime - Date.now()
      };
      
      this.cleanupUI();
    }
  }

  restorePreservedNotification() {
    if (this.preservedNotification) {
      const currentState = game.state.getCurrentState();
      const stateName = currentState?.constructor?.name || '';
      
      if (!this.isStateAllowed(stateName)) {
        console.log(`📢 Restore blocked in restricted state: ${stateName}`);
        return;
      }
      
      const preserved = this.preservedNotification;
      
      this.displayNotification(preserved.text);
      this.isShowing = true;
      
      const remainingDuration = Math.max(500, preserved.remainingTime);
      
      game.time.events.add(remainingDuration, () => {
        this.hideCurrent();
      });
      
      this.currentNotification = {
        text: preserved.text,
        originalText: preserved.originalText,
        duration: remainingDuration,
        endTime: Date.now() + remainingDuration
      };
      
      this.preservedNotification = null;
    }
  }

  displayNotification(text) {
    const lines = text.split('\n');
    const lineCount = lines.length;
    
    // Calculate window dimensions based on wrapped text
    const maxLineWidth = Math.min(this.maxLineWidth, Math.max(...lines.map(line => this.getTextWidth(line))));
    const windowWidth = Math.floor(Math.min(180, maxLineWidth + this.padding * 2));
    const windowHeight = Math.floor((lineCount * this.lineHeight) + this.padding * 2);
    
    const x = (game.width - windowWidth) / 2;
    const y = 4;

    this.notificationWindow = new Window(x / 8, y / 8, windowWidth / 8, windowHeight / 8, "1");
    this.notificationWindow.focus = false;
    this.notificationWindow.selector.visible = false;
    
    this.notificationTexts = [];
    
    lines.forEach((line, index) => {
      const lineText = new Text(
        windowWidth / 2,
        this.padding + (index * this.lineHeight) + (this.lineHeight / 2),
        line,
        {
          ...FONTS.default,
          tint: 0x76fcde
        }
      );
      lineText.anchor.set(0.5);
      this.notificationWindow.addChild(lineText);
      this.notificationTexts.push(lineText);
    });

    this.notificationWindow.alpha = 0;
    game.add.tween(this.notificationWindow).to({ alpha: 1 }, 300, "Linear", true);
  }

  hideCurrent() {
    if (this.currentNotification) {
      const tween = game.add.tween(this.notificationWindow).to({ alpha: 0 }, 300, "Linear", true);
      tween.onComplete.add(() => {
        this.cleanupUI();
        this.currentNotification = null;
        
        const currentState = game.state.getCurrentState();
        const stateName = currentState?.constructor?.name || '';
        
        if (this.isStateAllowed(stateName)) {
          this.processNext();
        }
      });
    }
  }

  cleanupUI() {
    if (this.notificationWindow) {
      this.notificationWindow.destroy();
      this.notificationWindow = null;
    }
    if (this.notificationTexts) {
      this.notificationTexts.forEach(text => text.destroy());
      this.notificationTexts = null;
    }
  }

  isStateRestricted(stateName) {
    return this.restrictedStates.has(stateName) || 
           (!this.allowedStates.has(stateName) && stateName !== '');
  }

  isStateAllowed(stateName) {
    return this.allowedStates.has(stateName);
  }

  canShowInCurrentState() {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    return this.isStateAllowed(stateName);
  }

  // Method to adjust text wrapping settings
  setWrappingSettings(maxLineWidth = 160, charWidth = 4) {
    this.maxLineWidth = maxLineWidth;
    this.charWidth = charWidth;
  }

  // Method to force a specific number of lines (for testing)
  wrapTextToLines(text, maxLines = 3) {
    const wrapped = this.wrapText(text);
    const lines = wrapped.split('\n');
    
    if (lines.length <= maxLines) {
      return wrapped;
    }
    
    // Truncate and add ellipsis
    const truncated = lines.slice(0, maxLines - 1).join('\n');
    const lastLine = lines[maxLines - 1];
    
    // Shorten last line to fit ellipsis
    let shortenedLine = lastLine;
    while (this.getTextWidth(shortenedLine + '...') > this.maxLineWidth && shortenedLine.length > 3) {
      shortenedLine = shortenedLine.slice(0, -1);
    }
    
    return truncated + '\n' + shortenedLine + '...';
  }

  getQueueStatus() {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    
    return {
      queueLength: this.queue.length,
      isShowing: this.isShowing,
      currentState: stateName,
      isStateAllowed: this.isStateAllowed(stateName),
      hasPreserved: !!this.preservedNotification,
      maxLineWidth: this.maxLineWidth
    };
  }

  clear() {
    this.queue = [];
    if (this.currentNotification) {
      this.hideCurrent();
    }
    this.preservedNotification = null;
  }

  hasActiveNotifications() {
    return this.isShowing || this.queue.length > 0 || this.preservedNotification;
  }

  getNotificationCount() {
    let count = this.queue.length;
    if (this.isShowing) count++;
    if (this.preservedNotification) count++;
    return count;
  }

  destroy() {
    this.clear();
    game.state.onStateChange.remove(this.onStateChange, this);
  }
}

/**
 * Caps the game's frame rate with frame skipping support
 * @param {number} [targetFps=30] - Desired frame rate, if 0 disable cap
 */
Phaser.Game.prototype.setFpsCap = function (targetFps = 30) {
  // Validate input
  if (targetFps < 0 || targetFps > 60) {
    console.warn('FPS cap must be between 0 (uncapped) and 60');
    return;
  }

  // Remove existing cap if any
  if (this._fpsCapLoop) {
    cancelAnimationFrame(this._fpsCapLoop);
    this._fpsCapLoop = null;
    this.raf.start();
  }

  // If 0, return to default uncapped behavior
  if (targetFps === 0) {
    console.log('FPS cap removed - using default render loop');
    return;
  }

  // Setup new capped loop with frame skipping
  const targetFrameDuration = 1000 / targetFps;
  let lastFrameTime = performance.now();
  let accumulatedTime = 0;
  const maxFrameSkip = Math.floor(targetFps / 2); // Maximum frames to skip before forcing an update

  // Stop Phaser's automatic updates
  this.raf.stop();

  const cappedLoop = currentTime => {
    this._fpsCapLoop = requestAnimationFrame(cappedLoop);

    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    accumulatedTime += deltaTime;

    // Frame skipping logic
    let framesToUpdate = 0;
    if (accumulatedTime >= targetFrameDuration) {
      framesToUpdate = Math.min(
        Math.floor(accumulatedTime / targetFrameDuration),
        maxFrameSkip
      );
      accumulatedTime -= framesToUpdate * targetFrameDuration;
    }

    // Update the game for each skipped frame
    while (framesToUpdate > 0) {
      this.update(currentTime);
      this.renderGB && this.renderGB();
      framesToUpdate--;
    }
  };

  // Start the capped loop
  this._fpsCapLoop = requestAnimationFrame(cappedLoop);
  console.log(`FPS capped at ${targetFps} with frame skipping (max ${maxFrameSkip} frames)`);
};