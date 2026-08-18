class PlaylistManager {
  constructor() {
    this.playlists = JSON.parse(localStorage.getItem('Playlists') || "{}");
    this.lastPlaylistKey = null;
  }

  createPlaylist(name) {
    const key = this.generateKey(name);
    if (this.playlists[key]) return null;
    
    this.playlists[key] = {
      name: name,
      songs: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.save();
    return key;
  }

  generateKey(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36);
  }

  addSong(playlistKey, song) {
    if (!this.playlists[playlistKey]) return false;
    
    // Store only minimal reference
    const songRef = this.createSongRef(song);
    if (this.playlists[playlistKey].songs.find(s => s.audioUrl === song.audioUrl)) return false;
    
    this.playlists[playlistKey].songs.push(songRef);
    this.playlists[playlistKey].updatedAt = Date.now();
    this.save();
    return true;
  }

  createSongRef(song) {
    // Minimal data - only what's needed to find the song again
    return {
      audioUrl: song.audioUrl,
      title: song.title,
      titleTranslit: song.titleTranslit || null,
      artist: song.artist,
      artistTranslit: song.artistTranslit || null,
      folderName: song.folderName || null,
      isExternal: song.isExternal || false,
      isLocal: song.isLocal || false,
      // For local songs, store the index or folder name
      localIndex: song.localIndex !== undefined ? song.localIndex : null
    };
  }

  restoreFullSong(songRef) {
    // First try to find in local songs
    if (window.localSongs) {
      const found = window.localSongs.find(s => s.audioUrl === songRef.audioUrl);
      if (found) return found;
    }
    
    // Then try external songs
    if (window.externalSongs) {
      const found = window.externalSongs.find(s => s.audioUrl === songRef.audioUrl);
      if (found) return found;
    }
    
    // If not found, return the minimal object with a flag
    return {
      ...songRef,
      loaded: false,
      missing: true
    };
  }

  getPlaylistSongs(key) {
    if (!this.playlists[key]) return [];
    return this.playlists[key].songs.map(ref => this.restoreFullSong(ref));
  }

  getPlaylistRefs(key) {
    if (!this.playlists[key]) return [];
    return this.playlists[key].songs;
  }

  hasExternalSongs(key) {
    if (!this.playlists[key]) return false;
    return this.playlists[key].songs.some(s => s.isExternal);
  }

  removeSong(playlistKey, songIndex) {
    if (!this.playlists[playlistKey]) return false;
    this.playlists[playlistKey].songs.splice(songIndex, 1);
    this.playlists[playlistKey].updatedAt = Date.now();
    this.save();
    return true;
  }

  moveSong(playlistKey, fromIndex, toIndex) {
    if (!this.playlists[playlistKey]) return false;
    const songs = this.playlists[playlistKey].songs;
    if (fromIndex < 0 || fromIndex >= songs.length || toIndex < 0 || toIndex >= songs.length) return false;
    
    const [song] = songs.splice(fromIndex, 1);
    songs.splice(toIndex, 0, song);
    this.playlists[playlistKey].updatedAt = Date.now();
    this.save();
    return true;
  }

  getPlaylist(key) {
    if (!this.playlists[key]) return null;
    return {
      ...this.playlists[key],
      songs: this.getPlaylistSongs(key)
    };
  }

  getPlaylistRef(key) {
    return this.playlists[key] || null;
  }

  getPlaylistNames() {
    return Object.keys(this.playlists);
  }
  
  getSongPlaylist(song) {
    const keys = Object.keys(this.playlists);
    
    for (const key of keys) {
      const songs = this.getPlaylistSongs(key);
      
      for (const s of songs) {
        if (s.audioUrl === song.audioUrl) {
          return key;
        }
      }
      
    };
    
    return null;
  }
  
  getSongPlaylists(song) {
    const keys = Object.keys(this.playlists);
    const playlists = [];
    
    for (const key of keys) {
      const songs = this.getPlaylistSongs(key);
      
      for (const s of songs) {
        if (s.audioUrl === song.audioUrl) {
          playlists.push(key);
        }
      }
      
    };
    
    return playlists;
  }

  renamePlaylist(key, name) {
    if (!this.playlists[key]) return false;
    this.playlists[key].name = name;
    this.save();
    return true;
  }
  
  deletePlaylist(key) {
    if (!this.playlists[key]) return false;
    delete this.playlists[key];
    this.save();
    return true;
  }

  save() {
    window.playlists = this.playlists;
    localStorage.setItem('Playlists', JSON.stringify(this.playlists));
  }

  static getInstance() {
    if (!PlaylistManager._instance) {
      PlaylistManager._instance = new PlaylistManager();
    }
    return PlaylistManager._instance;
  }
}