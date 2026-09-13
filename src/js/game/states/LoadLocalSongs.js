/**
 * @class LoadLocalSongs
 * @category Game States
 * @summary Loads built-in default songs
 * @constructor
 * @description
 * Startup state that discovers the songs shipped with the game. It walks through the
 * list of default song folders, locates and parses each .sm chart file, and exposes the
 * resulting charts globally before advancing to the Title screen.
 * @example
 * // Runs during the boot chain and populates window.localSongs for the menu.
 * game.state.add('LoadLocalSongs', LoadLocalSongs);
 * game.state.start('LoadLocalSongs');
 */
class LoadLocalSongs {
  /**
   * Sets up the loading UI, song collection, and parser, then starts loading the songs.
   */
  create() {
    /** @type {ProgressText} Bilingual progress text shown while songs load */
    this.progressText = new ProgressText(__("Loading Songs...||Cargando canciones..."));
    /** @type {Array<Object>} Collection of parsed local song charts */
    this.songs = [];
    /** @type {LocalSMParser} Parser used to read bundled .sm chart files */
    this.parser = new LocalSMParser();
    this.loadSongs();
    /** @type {LoadingDots} Animated loading indicator dots */
    this.loadingDots = new LoadingDots();
  }
  /**
   * Iterates over the default song folders, loads each one into the songs collection,
   * and finishes the state once all of them have been attempted.
   * @returns {Promise<void>} Resolves after every default folder has been handled
   */
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
  /**
   * Loads a single bundled song from a folder by reading and parsing its .sm chart file,
   * falling back to common alternative filenames if the folder does not share its name.
   * @param {string} folderName - Name of the song folder under assets/songs
   * @returns {Promise<Object|null>} Parsed chart object, or null if the song could not be loaded
   */
  async loadSong(folderName) {
    const baseUrl = `assets/songs/${folderName}/`;
    
    try {
      // Try to load .sm file with same name as folder
      let smUrl = baseUrl + folderName + '.sm';
      let smContent = await this.parser.loadTextFile(smUrl);
      
      // If that fails, look for any .sm file in the folder
      if (!smContent) {
        const alternativeNames = ['song.sm', 'chart.sm', 'steps.sm'];
        for (const name of alternativeNames) {
          smContent = await this.parser.loadTextFile(baseUrl + name);
          if (smContent) break;
        }
      }

      if (!smContent) {
        throw new Error(`No .sm file found in ${folderName}`);
      }

      // Parse the SM file
      const chart = await this.parser.parseSM(smContent, baseUrl);
      chart.folderName = folderName;
      chart.isLocal = true;
      chart.loaded = true;
      
      return chart;
      
    } catch (error) {
      console.warn(`Could not load song ${folderName}:`, error);
      return null;
    }
  }
  /**
   * Publishes the collected songs to window.localSongs and advances to the Title state.
   */
  finish() {
    window.localSongs = this.songs;
    game.state.start("Title");
  }
}
