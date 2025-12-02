class FileTools {
  static async urlToDataURL(url) {
    return new Promise((resolve, reject) => {
      if (typeof url !== "string") {
        resolve("");
        return;
      }
      
      // Handle data URLs
      if (url.startsWith('data:')) {
        resolve(url);
        return;
      }
      
      // Handle file:// URLs and blob URLs
      if (url.startsWith('file://') || url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        
        xhr.onload = function() {
          if (this.status === 200) {
            const reader = new FileReader();
            reader.onload = function() {
              resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(xhr.response);
          } else {
            resolve("");
          }
        };
        xhr.onerror = reject;
        xhr.send();
        return;
      }
      
      resolve("");
    });
  }
  
  static extractBase64(dataUrl) {
    if (typeof dataUrl === "string") {
      if (!dataUrl.startsWith('data:')) {
        return dataUrl;
      } else {
        return dataUrl.replace(/^data:[^;]+;base64,/, '');
      }
    } else {
      return null;
    }
  }
  
  static async urlToBase64(url) {
    return new Promise(async (resolve, reject) => {
      try {
        const dataUrl = await this.urlToDataURL(url);
        const base64 = this.extractBase64(dataUrl);
        resolve(base64);
      } catch (error) {
        resolve(null);
        throw new Error(error);
      }
    });
  }
  
  static async prepareSongForExport(song, files) {
    // Create a deep copy without sprite references
    const songCopy = { ...song.chart };
    
    // Remove temporary properties
    if (songCopy.notes) {
      Object.keys(songCopy.notes).forEach(key => {
        const notes = songCopy.notes[key];
        notes.forEach(note => {
          delete note.sprite;
          delete note.holdParts;
          delete note.hit;
          delete note.miss;
          delete note.finish;
          delete note.holdActive;
          delete note.active;
          delete note.visibleHeight;
          delete note.hitEffectShown;
        });
      });
    }
    
    return songCopy;
  }
  
  static async getFileData(filename, files) {
    if (!files[filename]) {
      return null;
    }
    
    try {
      const dataUrl = files[filename];
      if (dataUrl.startsWith('data:')) {
        return FileTools.extractBase64(dataUrl);
      }
      
      // Convert URL to base64 if needed
      const base64Data = await FileTools.urlToBase64(dataUrl);
      return FileTools.extractBase64(base64Data);
    } catch (error) {
      console.error(`Failed to get file data for ${filename}:`, error);
      return null;
    }
  }
}
