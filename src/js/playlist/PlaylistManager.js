/**
 * @class PlaylistManager
 * @category Playlist System Classes
 * @summary Manages song playlists with localStorage persistence
 * @constructor
 * @features
 * Playlist creation, renaming, and deletion
 * Song add, remove, and reorder within playlists
 * Minified song references restored to full songs when available
 * Singleton access through getInstance
 * @description
 * Handles creation and management of song playlists stored in localStorage.
 * Playlists keep lightweight references to songs and resolve them to full song
 * objects at runtime, marking missing songs appropriately.
 * @example
 * // Modding usage example
 * const pm = PlaylistManager.getInstance();
 * const key = pm.createPlaylist('My Favorites');
 * pm.addSong(key, songObject);
 * const songs = pm.getPlaylistSongs(key);
 * pm.moveSong(key, 0, 1);
 * pm.renamePlaylist(key, 'Best Songs');
 * pm.deletePlaylist(key);
 */
class PlaylistManager {
  constructor() {
    /** @type {Object} All playlists keyed by generated identifier */
    this.playlists = JSON.parse(localStorage.getItem('Playlists') || "{}");
    /** @type {string|null} Identifier of the most recently used playlist */
    this.lastPlaylistKey = null;
  }

  /**
   * Creates a new empty playlist with a generated unique key.
   * @param {string} name - Display name of the playlist
   * @returns {string|null} The playlist key, or null if it already exists
   */
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

  /**
   * Builds a unique key from a playlist name and the current timestamp.
   * @param {string} name - Playlist name to slugify
   * @returns {string} Generated playlist key
   */
  generateKey(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36);
  }

  /**
   * Adds a song reference to a playlist, skipping duplicates by audio URL.
   * @param {string} playlistKey - Identifier of the target playlist
   * @param {Object} song - Full song object to reference
   * @returns {boolean} Whether the song was added
   */
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

  /**
   * Creates a minimal song reference containing only fields needed to find the song later.
   * @param {Object} song - Full song object
   * @returns {Object} Minified song reference
   */
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

  /**
   * Attempts to resolve a stored reference to its full song object.
   * @param {Object} songRef - Stored song reference
   * @returns {Object} The full song, or the reference flagged as missing
   */
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

  /**
   * Returns the full song objects for a playlist.
   * @param {string} key - Playlist identifier
   * @returns {Array} List of restored song objects
   */
  getPlaylistSongs(key) {
    if (!this.playlists[key]) return [];
    return this.playlists[key].songs.map(ref => this.restoreFullSong(ref));
  }

  /**
   * Returns the raw stored references for a playlist.
   * @param {string} key - Playlist identifier
   * @returns {Array} List of stored song references
   */
  getPlaylistRefs(key) {
    if (!this.playlists[key]) return [];
    return this.playlists[key].songs;
  }

  /**
   * Checks whether a playlist contains any external songs.
   * @param {string} key - Playlist identifier
   * @returns {boolean} True if any stored reference is external
   */
  hasExternalSongs(key) {
    if (!this.playlists[key]) return false;
    return this.playlists[key].songs.some(s => s.isExternal);
  }

  /**
   * Removes a song from a playlist by its index.
   * @param {string} playlistKey - Playlist identifier
   * @param {number} songIndex - Index of the song to remove
   * @returns {boolean} Whether the song was removed
   */
  removeSong(playlistKey, songIndex) {
    if (!this.playlists[playlistKey]) return false;
    this.playlists[playlistKey].songs.splice(songIndex, 1);
    this.playlists[playlistKey].updatedAt = Date.now();
    this.save();
    return true;
  }

  /**
   * Repositions a song within a playlist from one index to another.
   * @param {string} playlistKey - Playlist identifier
   * @param {number} fromIndex - Current index of the song
   * @param {number} toIndex - Target index for the song
   * @returns {boolean} Whether the move succeeded
   */
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

  /**
   * Returns a playlist object with its songs resolved to full song data.
   * @param {string} key - Playlist identifier
   * @returns {Object|null} The playlist object or null if not found
   */
  getPlaylist(key) {
    if (!this.playlists[key]) return null;
    return {
      ...this.playlists[key],
      songs: this.getPlaylistSongs(key)
    };
  }

  /**
   * Returns the raw playlist record without resolving songs.
   * @param {string} key - Playlist identifier
   * @returns {Object|null} The raw playlist record or null
   */
  getPlaylistRef(key) {
    return this.playlists[key] || null;
  }

  /**
   * Returns all playlist keys.
   * @returns {Array} List of playlist identifiers
   */
  getPlaylistNames() {
    return Object.keys(this.playlists);
  }
  
  /**
   * Returns the first playlist key containing a given song.
   * @param {Object} song - Song object to search for
   * @returns {string|null} The playlist key or null if not found
   */
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
  
  /**
   * Returns all playlist keys that contain a given song.
   * @param {Object} song - Song object to search for
   * @returns {Array} List of playlist keys
   */
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

  /**
   * Renames an existing playlist.
   * @param {string} key - Playlist identifier
   * @param {string} name - New display name
   * @returns {boolean} Whether the rename succeeded
   */
  renamePlaylist(key, name) {
    if (!this.playlists[key]) return false;
    this.playlists[key].name = name;
    this.save();
    return true;
  }
  
  /**
   * Deletes a playlist by its key.
   * @param {string} key - Playlist identifier
   * @returns {boolean} Whether the deletion succeeded
   */
  deletePlaylist(key) {
    if (!this.playlists[key]) return false;
    delete this.playlists[key];
    this.save();
    return true;
  }

  /**
   * Persists the current playlists to localStorage and exposes them on the window.
   */
  save() {
    window.playlists = this.playlists;
    localStorage.setItem('Playlists', JSON.stringify(this.playlists));
  }

  /**
   * Returns the shared singleton instance of the playlist manager.
   * @returns {PlaylistManager} The singleton instance
   */
  static getInstance() {
    if (!PlaylistManager._instance) {
      PlaylistManager._instance = new PlaylistManager();
    }
    return PlaylistManager._instance;
  }
}