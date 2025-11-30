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
