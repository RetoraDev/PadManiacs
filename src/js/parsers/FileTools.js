class FileTools {
  static isValidFileURL(url) {
    if (typeof url != 'string') {
      return false;
    }
    
    return true;
  }
  
  static xhr(url, responseType, onload, onerror) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = responseType;
    
    xhr.onload = function() {
      if (xhr.status === 200) {
        onload?.(xhr.response);
      } else {
        onload?.("");
      }
    };
    xhr.onerror = onerror;
    xhr.send();
    
    return xhr;
  }
  
  static async getFileAsBlob(url) {
    return new Promise((resolve, reject) => {
      if (typeof url !== "string") {
        resolve(url);
        return;
      }
      
      // Handle file:// URLs and blob URLs
      if (FileTools.isValidFileURL(url)) {
        FileTools.xhr(url, 'blob', resolve, reject);
      } else {
        reject();
      }
    });
  }
  
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
      if (FileTools.isValidFileURL(url)) {
        const xhr = FileTools.xhr(url, 'blob', blob => {
          const reader = new FileReader();
          reader.onload = function() {
            resolve(reader.result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }, () => {
          resolve("");
        });
        
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
  
  static getFilename(url) {
    if (!url || url === "no-media") return "";
    const parts = url.split(/[\\/]/);
    return parts[parts.length - 1] || "";
  }
  
  static getDirectory(url) {
    if (!url || url === "no-media") return "";
    const parts = url.split('/');
    parts.pop();
    return parts.join('/');
  }
  
  static getExtension(url) {
    if (!url || url === "no-media") return "";
    const parts = url.split('.');
    return parts[parts.length - 1] || "";
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
  
  static loadTextFile(url) {
    return new Promise((resolve, reject) => {
      const xhr = FileTools.xhr(url, 'text', () => {
        resolve(xhr.responseText);
      }, () => {
        reject(null);
      });
    });
  }
  
  static readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
  
  static readBinaryFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsBinaryString(file);
    });
  }
  
  static async fetchFileAsBlob(url) {
    // Si es una URL de objeto (blob:) o data URL, fetch directamente
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      const response = await fetch(url);
      return await response.blob();
    }
    
    // Si es una URL relativa o absoluta (http/https)
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      return await response.blob();
    }
    
    // Si es un path de archivo local (Cordova/NWJS)
    if (CURRENT_ENVIRONMENT === ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT === ENVIRONMENT.NWJS) {
      try {
        const fileSystem = new FileSystemTools();
        const fileEntry = await fileSystem.getFile(url);
        return new Promise((resolve, reject) => {
          fileEntry.file(resolve, reject);
        });
      } catch (e) {
        throw new Error(`Failed to load local file: ${url}`);
      }
    }
    
    throw new Error(`Unsupported URL type: ${url}`);
  }
}
