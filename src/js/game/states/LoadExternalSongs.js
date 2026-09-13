/**
 * @class LoadExternalSongs
 * @category Game States
 * @summary Loads user-added songs from external storage
 * @constructor
 * @description
 * A loading state that scans external storage (or, on non-mobile platforms, lets the
 * user pick a directory) for StepMania songs, parsing every .sm or .ssc chart file found.
 * It supports sequential and batched parallel loading with progress feedback, caches the
 * results in window.externalSongs for the rest of the game, and then transitions into
 * the requested next state.
 * @example
 * // Load all user songs, then drop the player into the song select screen.
 * game.state.add('LoadExternalSongs', LoadExternalSongs);
 * game.state.start('LoadExternalSongs', true, false, undefined);
 */
class LoadExternalSongs {
  /**
   * Stores the target state and the parameters to hand to it once loading completes.
   * @param {string} nextState - Key of the game state to start after loading finishes
   * @param {Array} nextStateParams - Parameters forwarded to the next state
   */
  init(nextState, nextStateParams) {
    /** @type {string} Game state key to start once external songs are loaded */
    this.nextState = nextState || 'SongSelect';
    /** @type {Array} Parameters forwarded to the next state */
    this.nextStateParams = nextStateParams || [];
  }
  
  /**
   * Sets up loading UI, state tracking fields, and file system access, then either
   * loads songs from external storage or falls back to a file input picker.
   */
  create() {
    /** @type {LoadingDots} Animated loading indicator dots */
    this.loadingDots = new LoadingDots();
    
    /** @type {ProgressText} Bilingual progress text shown while songs load */
    this.progressText = new ProgressText(__("Loading External Songs...||Cargando canciones externas..."));
    
    /** @type {FileSystemTools} Helper for reading directories and files */
    this.fileSystem = new FileSystemTools();
    
    if (window.externalSongs) {
      /** @type {Array<Object>} Parsed external song charts */
      this.songs = window.externalSongs;
      this.finish(window.lastExternalSongIndex || 0);
      return;
    }
    
    /** @type {Array<Object>} Parsed external song charts collected so far */
    this.songs = [];
    /** @type {ExternalSMParser} Parser used to read external chart files */
    this.parser = new ExternalSMParser();
    /** @type {number} Running index used to keep load order stable */
    this.currentIndex = 0;
    /** @type {number} Count of songs loaded successfully */
    this.loadedCount = 0;
    /** @type {number} Count of directories that failed to load */
    this.failedCount = 0;
    /** @type {number} Total number of song directories to process */
    this.totalCount = 0;
    /** @type {Set<string>} Names of directories currently being loaded */
    this.currentlyLoading = new Set();
    
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      this.loadSongsFromStorage();
    } else {
      this.showFileInput();
    }
  }

  /**
   * Lists every directory under the external songs path and loads each one, either in
   * parallel batches or sequentially depending on the ENABLE_PARALLEL_LOADING flag.
   * @returns {Promise<void>} Resolves once all directories have been processed
   */
  async loadSongsFromStorage() {
    try {
      const rootDir = await this.fileSystem.getDirectory(EXTERNAL_DIRECTORY + SONGS_DIRECTORY);
      const allDirs = await this.fileSystem.listAllDirectories(rootDir);
      allDirs.unshift(rootDir);

      this.totalCount = allDirs.length;
      this.updateProgress();

      if (ENABLE_PARALLEL_LOADING) {
        await this.loadDirectoriesParallel(allDirs);
      } else {
        await this.loadDirectoriesSequential(allDirs);
      }

      this.finish();
      
    } catch (error) {
      console.warn("Error loading external songs:", error);
      this.showError("Failed to load external songs: " + error.message);
    }
  }

  /**
   * Splits the directory list into batches no larger than MAX_PARALLEL_DOWNLOADS and
   * processes each batch concurrently to bound resource usage.
   * @param {Array<Object>} directories - Directory entries to load
   * @returns {Promise<void>} Resolves once every batch has been processed
   */
  async loadDirectoriesParallel(directories) {
    const batches = [];
    
    for (let i = 0; i < directories.length; i += MAX_PARALLEL_DOWNLOADS) {
      batches.push(directories.slice(i, i + MAX_PARALLEL_DOWNLOADS));
    }

    for (const batch of batches) {
      await this.processDirectoryBatch(batch);
    }
  }

  /**
   * Loads every directory in a batch concurrently, tolerating individual failures.
   * @param {Array<Object>} batch - Directory entries to process in parallel
   * @returns {Promise<void>} Resolves once the whole batch has been attempted
   */
  async processDirectoryBatch(batch) {
    const promises = batch.map(dir => this.processSongDirectoryWithTracking(dir));
    await Promise.allSettled(promises);
  }

  /**
   * Loads the given directories one at a time, ensuring only a single song is parsed
   * at any moment.
   * @param {Array<Object>} directories - Directory entries to load
   * @returns {Promise<void>} Resolves once all directories have been processed
   */
  async loadDirectoriesSequential(directories) {
    for (const dir of directories) {
      await this.processSongDirectoryWithTracking(dir);
    }
  }

  /**
   * Loads one directory while tracking its progress: it waits for a free parallel slot,
   * parses the folder, records success or failure, and refreshes the progress display.
   * @param {Object} dirEntry - Directory entry to process
   * @returns {Promise<void>} Resolves once the directory has been processed
   */
  async processSongDirectoryWithTracking(dirEntry) {
    const index = this.currentIndex;
    this.currentIndex ++;
    
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
      
      if (!song) {
        // It's likely a directory that doesn't contain a StepMania song
        this.failedCount++;
        return;
      }
      
      song.index = index;
      if (song) {
        // Song loaded successfully!
        this.songs.push(song);
        this.loadedCount++;
      } else {
        // Failed to load song
        this.failedCount++;
      }
    } catch (error) {
      console.warn(`✗ Error in ${dirName}:`, error);
      this.failedCount++;
    } finally {
      this.currentlyLoading.delete(dirName);
      this.updateProgress();
    }
  }

  /**
   * Reads all files inside a directory, finds its .sm/.ssc chart files, and returns the
   * first chart that parses successfully, or null if the folder is not a chart folder.
   * @param {Object} dirEntry - Directory entry to scan for chart files
   * @returns {Promise<Object|null>} The parsed chart, or null if none could be loaded
   */
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
        // No chart files the folder is empty or is not a chart folder
        return null;
      }

      for (const smFileName of chartFileNames) {
        try {
          // Try to parse the chart file
          const content = await this.fileSystem.readFileContent(chartFiles[smFileName]);
          const chart = await this.parser.parseSM(chartFiles, content);
          
          if (chart && chart.difficulties && chart.difficulties.length > 0) {
            // Chart file parsed successfully
            chart.folderName = dirEntry.name || `External_Song_${smFileName}`;
            chart.isLocal = true;
            chart.isExternal = true;
            chart.loaded = true;
            return chart;
          }
        } catch (parseError) {
          // Failed to parse, continue loading next chart
          console.warn(`Failed to parse ${smFileName}:`, parseError);
          continue;
        }
      }

      // All charts failed to load
      return null;
      
    } catch (error) {
      console.warn(`Error processing directory ${dirEntry.name}:`, error);
      return null;
    }
  }

  /**
   * Writes the current load progress percentage and loaded/failed counts to the
   * progress text overlay.
   */
  updateProgress() {
    const processed = this.loadedCount + this.failedCount;
    const progress = this.totalCount > 0 ? Math.round(processed / this.totalCount * 100) : 0;
    const loadingText = `${this.loadedCount}/${this.totalCount - this.failedCount} (${progress}%)`;
    
    this.progressText.write(loadingText);
  }

  /**
   * Opens a native webkitdirectory file picker and forwards the chosen files to the
   * processing pipeline on selection.
   */
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

  /**
   * Groups the files picked by the user into per-directory maps and processes them,
   * either in parallel batches or sequentially.
   * @param {FileList} files - Files selected from the directory picker
   * @returns {Promise<void>} Resolves once all file groups have been processed
   */
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
      console.warn("Error processing file input:", error);
      this.showError("Failed to load songs from files: " + error.message);
    }
  }

  /**
   * Splits the directory names into parallel-safe batches and processes each batch.
   * @param {Object} directories - Maps directory names to their file maps
   * @param {Array<string>} dirNames - Names of the directories to process
   * @returns {Promise<void>} Resolves once every batch has been processed
   */
  async processFileDirectoriesParallel(directories, dirNames) {
    const batches = [];
    
    for (let i = 0; i < dirNames.length; i += MAX_PARALLEL_DOWNLOADS) {
      batches.push(dirNames.slice(i, i + MAX_PARALLEL_DOWNLOADS));
    }

    for (const batch of batches) {
      await this.processFileDirectoryBatch(directories, batch);
    }
  }

  /**
   * Processes a single batch of picked directories concurrently, tolerating failures.
   * @param {Object} directories - Maps directory names to their file maps
   * @param {Array<string>} batch - Names of the directories in this batch
   * @returns {Promise<void>} Resolves once the batch has been attempted
   */
  async processFileDirectoryBatch(directories, batch) {
    const promises = batch.map(dirName => this.processSongFilesWithTracking(directories[dirName], dirName));
    await Promise.allSettled(promises);
  }

  /**
   * Processes every picked directory sequentially, one at a time.
   * @param {Object} directories - Maps directory names to their file maps
   * @param {Array<string>} dirNames - Names of the directories to process
   * @returns {Promise<void>} Resolves once all directories have been processed
   */
  async processFileDirectoriesSequential(directories, dirNames) {
    for (const dirName of dirNames) {
      await this.processSongFilesWithTracking(directories[dirName], dirName);
    }
  }

  /**
   * Parses the files of one picked folder while tracking progress and refresh the
   * progress display once the folder has been processed.
   * @param {Object} files - Map of lowercased filenames to picked File objects
   * @param {string} folderName - Name of the folder being processed
   * @returns {Promise<void>} Resolves once the folder has been processed
   */
  async processSongFilesWithTracking(files, folderName) {
    const index = this.currentIndex;
    this.currentIndex ++;
    
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
      song.index = index;
      if (song) {
        this.songs.push(song);
        this.loadedCount++;
      } else {
        this.failedCount++;
    }
    } catch (error) {
      console.warn(`✗ Error in ${folderName}:`, error);
      this.failedCount++;
    } finally {
      this.currentlyLoading.delete(folderName);
      this.updateProgress();
    }
  }

  /**
   * Finds the .sm/.ssc files within a picked folder and returns the first chart that
   * parses successfully, or null if the folder holds no loadable chart.
   * @param {Object} files - Map of lowercased filenames to picked File objects
   * @param {string} folderName - Name of the folder being processed
   * @returns {Promise<Object|null>} The parsed chart, or null if none could be loaded
   */
  async processSongFiles(files, folderName) {
    const chartFileNames = Object.keys(files).filter(name => 
      name.endsWith(".sm") || name.endsWith(".ssc")
    );
    
    if (chartFileNames.length === 0) {
      return null;
    }

    for (const smFileName of chartFileNames) {
      try {
        const content = await this.fileSystem.readFileContent(files[smFileName]);
        const chart = this.parser.parseSM(files, content);
        
        if (chart && chart.difficulties && chart.difficulties.length > 0) {
          chart.folderName = folderName;
          chart.loaded = true;
          return chart;
        }
      } catch (parseError) {
        console.warn(`Failed to parse ${smFileName}:`, parseError);
        continue;
      }
    }

    return null;
  }
  
  /**
   * Displays an error message on the progress text and returns to the main menu after
   * a short delay.
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.progressText.write(message);
    game.time.events.add(3000, () => {
      game.state.start("MainMenu");
    });
  }
  
  /**
   * Sorts the loaded songs, caches them in window.externalSongs, and starts the next
   * state, defaulting to the song select screen, or shows an error if nothing loaded.
   * @param {number} [resetIndex] - Optional starting song index to remember for next time
   */
  finish(resetIndex = 0) {
    if (this.songs.length === 0) {
      this.showError(__("No external songs found||No se encontraron canciones"));
      return;
    }
    
    this.songs = this.songs.sort((a, b) => a.index - b.index)
    
    window.externalSongs = this.songs;
    
    if (this.nextStateParams.length) {
      game.state.start(this.nextState, true, false, ...this.nextStateParams);
    } else {
      game.state.start(this.nextState, true, false,  this.songs, null, false, "external");
    }
    
    setTimeout(() => window.lastExternalSongIndex = window.selectStartingIndex)
  }
}
