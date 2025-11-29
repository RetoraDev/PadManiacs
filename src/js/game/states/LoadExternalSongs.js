class LoadExternalSongs {
  init(nextState, nextStateParams) {
    this.nextState = nextState || 'SongSelect';
    this.nextStateParams = nextStateParams || [];
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
    
    if (this.nextStateParams.length) {
      game.state.start(this.nextState, true, false, ...this.nextStateParams);
    } else {
      game.state.start(this.nextState, true, false,  this.songs);
    }
    
    setTimeout(() => window.lastExternalSongIndex = window.selectStartingIndex)
  }
}
