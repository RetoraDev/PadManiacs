/**
 * @class FileTools
 * @category File System Classes
 * @summary File utilities for Base64 conversion and export
 * @constructor
 * @features
 * Converts URLs to Base64 data URIs
 * Strips data URI prefixes to extract raw Base64 strings
 * Parses song data for chart export
 * Resolves file paths, names, and extensions
 * @description
 * FileTools is a static utility class that provides methods for Base64
 * conversion, file path manipulation, and song data preparation for chart
 * export. It centralises common file-related operations so that parsers,
 * the file system layer, and the export pipeline share a single
 * implementation.
 * @example
 * // Converting a remote image URL to a Base64 string
 * const base64 = await FileTools.urlToBase64('https://example.com/banner.png');
 * if (base64) {
 *   const img = new Image();
 *   img.src = 'data:image/png;base64,' + base64;
 * }
 *
 * // Extracting a filename from a full path
 * const name = FileTools.getFilename('Songs/MySong/audio.mp3');
 * console.log(name); // "audio.mp3"
 */
class FileTools {
  /**
   * Converts a URL (http, file, blob, or data) into a Base64 data URI string.
   * @param {string} url - The URL to convert
   * @param {string} [type] - The MIME type hint
   * @returns {Promise<string>} Resolves with the data URI or empty string on failure
   */
  static async urlToDataURL(url, type) {
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
    });
  }
  
  /**
   * Strips the data URI prefix from a data URI string, returning raw Base64.
   * @param {string} dataUrl - The data URI or plain Base64 string
   * @returns {string|null} The raw Base64 content, or null if input is not a string
   */
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
  
  /**
   * Converts a URL directly to a raw Base64 string.
   * @param {string} url - The URL to convert
   * @returns {Promise<string|null>} Resolves with raw Base64 or null on error
   */
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
  
  /**
   * Prepares a song object for export by stripping sprite and runtime references.
   * @param {Object} song - The song object containing a chart property
   * @param {Object} files - The associated file map
   * @returns {Promise<Object>} A deep copy of the chart data without sprite references
   */
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
  
  /**
   * Extracts the filename portion from a URL or file path.
   * @param {string} url - The full URL or file path
   * @returns {string} The filename, or empty string if invalid
   */
  static getFilename(url) {
    if (!url || url === "no-media") return "";
    const parts = url.split(/[\\/]/);
    return parts[parts.length - 1] || "";
  }
  
  /**
   * Extracts the directory portion from a URL or file path.
   * @param {string} url - The full URL or file path
   * @returns {string} The directory path, or empty string if invalid
   */
  static getDirectory(url) {
    if (!url || url === "no-media") return "";
    const parts = url.split('/');
    parts.pop();
    return parts.join('/');
  }
  
  /**
   * Extracts the file extension from a URL or file path.
   * @param {string} url - The full URL or file path
   * @returns {string} The extension without the dot, or empty string if invalid
   */
  static getExtension(url) {
    if (!url || url === "no-media") return "";
    const parts = url.split('.');
    return parts[parts.length - 1] || "";
  }
  
  /**
   * Retrieves raw Base64 data for a named file from a file map.
   * @param {string} filename - The filename to look up
   * @param {Object} files - A map of filenames to data URIs or URLs
   * @returns {Promise<string|null>} Resolves with raw Base64 or null if not found
   */
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
  
  /**
   * Fetches a text file from a URL using XMLHttpRequest.
   * @param {string} url - The URL to fetch
   * @returns {Promise<string|null>} Resolves with the text content or null on failure
   */
  static loadTextFile(url) {
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
  
  /**
   * Reads a File object as text using FileReader.
   * @param {File} file - The File object to read
   * @returns {Promise<string>} Resolves with the text content
   */
  static readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
  
  /**
   * Reads a File object as a binary string using FileReader.
   * @param {File} file - The File object to read
   * @returns {Promise<string>} Resolves with the binary string content
   */
  static readBinaryFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsBinaryString(file);
    });
  }
  
  /**
   * Fetches a resource as a Blob, supporting http, data, blob, and local file URLs.
   * @param {string} url - The URL to fetch
   * @returns {Promise<Blob>} Resolves with the Blob data
   */
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
