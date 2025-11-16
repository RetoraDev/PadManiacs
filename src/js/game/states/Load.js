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
        case 'video':
          this.load.video(resource.key, resource.url, 'canplay', true);
          break;
        case 'json':
          this.load.json(resource.key, resource.url);
          break;
        case 'text':
          this.load.text(resource.key, resource.url);
          break;
      }
      
      this.loadedCount++;
    });

    // Create simple progress display
    this.progressText = new ProgressText("LOADING ASSETS");
  }

  create() {
    // All resources loaded, start next state
    game.state.start(this.nextState, true, false, this.nextStateParams);
  }
}

class LoadCordova {
  create() {
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA) {
      this.loadScript();
    } else {
      this.createFolderStructure();
    }
  }
  loadScript() {
    this.loadingDots = new LoadingDots();
    
    this.progressText = new ProgressText("INITIALIZING FILESYSTEM");
    
    const script = document.createElement("script");
    script.src = "./cordova/cordova.js";
    document.head.appendChild(script);
    document.addEventListener("deviceready", () => {
      this.createFolderStructure();
      document.addEventListener("backbutton", () => {
        if (game.state.current == "Play") {
          gamepad.press('start');
        } else {
          gamepad.press('b');
        }
      });
    });
  }
  async createFolderStructure() {
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      const fileSystem = new FileSystemTools();
      
      const rootDir = await fileSystem.getDirectory("");
      
      const gameDir = await fileSystem.createDirectory(rootDir, EXTERNAL_DIRECTORY);
      
      await fileSystem.createDirectory(gameDir, ADDONS_DIRECTORY);
      await fileSystem.createDirectory(gameDir, SCREENSHOTS_DIRECTORY);
      await fileSystem.createDirectory(gameDir, SONGS_DIRECTORY);
    }
    this.continue();
  }
  continue() {
    game.state.start("LoadAddons");
  }
}

class LoadAddons {
  create() {
    this.progressText = new ProgressText("LOADING ADD-ONS");
    this.loadingDots = new LoadingDots();
    this.initialize();
  }
  async initialize() {
    // Initialize addon manager
    addonManager = new AddonManager();
    await addonManager.initialize();
    
    // Execute global addon behaviors
    addonManager.executeGlobalBehaviors();
    
    const resources = addonManager.getResourceList();
    
    game.load.baseURL = "";
    
    game.state.start("Load", true, false, resources, "LoadLocalSongs");
  }
}

class LoadLocalSongs {
  create() {
    this.progressText = new ProgressText("LOADING SONGS");
    this.songs = [];
    this.parser = new LocalSMParser();
    this.loadSongs();
    this.loadingDots = new LoadingDots();
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
  init(nextState, nextStateParams) {
    this.nextState = nextState || 'SongSelect';
    this.nextStateParams = nextStateParams || {};
  }
  
  create() {
    this.loadingDots = new LoadingDots();
    
    this.progressText = new ProgressText("LOADING EXTERNAL SONGS");
    
    this.fileSystem = new FileSystemTools();
    
    if (window.externalSongs) {
      this.songs = window.externalSongs;
      this.finish(window.lastExternalSongIndex || 0);
      return;
    }
    
    this.songs = [];
    this.parser = new ExternalSMParser();
    this.loadedCount = 0;
    this.failedCount = 0;
    this.totalCount = 0;
    this.currentlyLoading = new Set();
    
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      this.loadSongsFromStorage();
    } else {
      this.showFileInput();
    }
  }

  async loadSongsFromStorage() {
    try {
      console.log("Loading songs from external storage...");
      
      const rootDir = await this.fileSystem.getDirectory(EXTERNAL_DIRECTORY + SONGS_DIRECTORY);
      const allDirs = await this.fileSystem.listAllDirectories(rootDir);
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
      const files = await this.fileSystem.listFiles(dirEntry);
      const chartFiles = {};

      for (const fileEntry of files) {
        const file = await this.fileSystem.getFile(fileEntry);
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
          const content = await this.fileSystem.readFileContent(chartFiles[smFileName]);
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
    const loadingText = `${this.loadedCount}/${this.totalCount - this.failedCount} (${progress}%)`;
    
    this.progressText.write(loadingText);
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
        const content = await this.fileSystem.readFileContent(files[smFileName]);
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
  
  showError(message) {
    this.progressText.write(message);
    game.time.events.add(3000, () => {
      game.state.start("MainMenu");
    });
  }
  
  finish(resetIndex = 0) {
    console.log(`Loading complete: ${this.loadedCount} songs loaded, ${this.failedCount} failed`);
    
    if (this.songs.length === 0) {
      this.showError("No external songs found");
      return;
    }
    
    window.externalSongs = this.songs;
    
    game.state.start(this.nextState, true, false, this.nextStateParams);
    
    setTimeout(() => window.lastExternalSongIndex = window.selectStartingIndex)
  }
}

class LoadSongFolder {
  create() {
    this.progressText = new ProgressText("SELECT SONG FOLDER");

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
      chart.folderName = `Single_External_${smFileName}`;
      chart.loaded = true;

      // Start gameplay directly with this single song
      game.state.start("SongSelect", true, false, [ chart ], 0, true);
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
