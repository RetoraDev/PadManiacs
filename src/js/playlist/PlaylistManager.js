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
    if (this.playlists[playlistKey].songs.find(s => s.audioUrl === song.audioUrl)) return false;
    
    this.playlists[playlistKey].songs.push(song);
    this.playlists[playlistKey].updatedAt = Date.now();
    this.save();
    return true;
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
    return this.playlists[key] || null;
  }

  getPlaylistNames() {
    return Object.keys(this.playlists);
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