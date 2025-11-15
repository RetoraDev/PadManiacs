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
    this.visibilityChangeListener = () => {
      if (document.hidden) {
        this.audio.pause();
      } else {
        this.audio.play();
      }
    };
    
    window.addEventListener('visibilitychange', this.visibilityChangeListener);
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
      if (!url) {
        reject();
        return
      }
      
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
    this.audio.volume = [0,25,50,75,100][volume] / 100;
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
    window.removeEventListener("visibilitychange", this.visibilityChangeListener);
    this.availableSongsCache = null;
  }
}
