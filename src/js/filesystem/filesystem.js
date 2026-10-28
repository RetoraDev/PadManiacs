/**
 * @class FileSystemTools
 * @category File System Classes
 * @summary Platform-agnostic file system access wrapper
 * @constructor
 * @features
 * Auto-detects runtime platform (NW.js, Cordova, or browser)
 * Delegates all operations to the platform-specific implementation
 * Provides uniform API for directory listing, file reading, and writing
 * @description
 * FileSystemTools wraps platform-specific file system implementations behind a single
 * consistent API. It detects the current runtime on construction and selects the
 * appropriate backend so that the rest of the application never needs to care about the environment.
 * @example
 * // Accessing the file system from any platform
 * const fs = new FileSystemTools();
 * const rootDir = await fs.getDirectory('Songs/');
 * const files = await fs.listFiles(rootDir);
 * for (const fileEntry of files) {
 *   const file = await fs.getFile(fileEntry);
 *   const content = await fs.readFileContent(file);
 *   console.log(file.name, content.substring(0, 100));
 * }
 */
class FileSystemTools {
  constructor() {
    /** @type {string} The detected runtime platform identifier */
    this.platform = this.detectPlatform();
    
    if (this.platform === 'nwjs') {
      // NW.js uses Node.js filesystem directly - use fallback with Node FS or create NW adapter
      this.fileSystem = new FallbackFileSystem();
    } else if (this.platform === 'cordova') {
      this.fileSystem = new CordovaFileSystem();
    } else {
      this.fileSystem = new FallbackFileSystem();
    }
    
    console.log(`FileSystem: Using ${this.platform} implementation`);
  }

  /**
   * Determines the current runtime platform by checking for NW.js, Cordova,
   * or falling back to the browser environment.
   * @returns {string} One of 'nwjs', 'cordova', or 'fallback'
   */
  detectPlatform() {
    // Check for NW.js
    if (typeof nw !== 'undefined' || (typeof process !== 'undefined' && process.versions && process.versions['node-webkit'])) {
      return 'nwjs';
    }
    if (typeof require !== 'undefined' && typeof window !== 'undefined' && window.nw) {
      return 'nwjs';
    }
    if (typeof global !== 'undefined' && global.require) {
      // Could be NW.js
    }
    
    // Check for Cordova
    if (typeof cordova !== 'undefined' && cordova.file) {
      return 'cordova';
    }
    
    return 'fallback';
  }

  // Wrap all Cordova FileSystem methods
  getDirectory(path) {
    return this.fileSystem.getDirectory(path);
  }

  listDirectories(dirEntry) {
    return this.fileSystem.listDirectories(dirEntry);
  }

  listAllDirectories(startDir) {
    return this.fileSystem.listAllDirectories(startDir);
  }

  listFiles(dirEntry) {
    return this.fileSystem.listFiles(dirEntry);
  }

  getFile(fileEntry) {
    return this.fileSystem.getFile(fileEntry);
  }

  readFileContent(file) {
    return this.fileSystem.readFileContent(file);
  }
  
  saveFile(dirEntry, fileData, fileName) {
    return this.fileSystem.saveFile(dirEntry, fileData, fileName);
  }
  
  createEmptyFile(dirEntry, fileName, isAppend) {
    return this.fileSystem.createEmptyFile(dirEntry, fileName, isAppend);
  }
  
  writeFile(fileEntry, dataObj, isAppend) {
    return this.fileSystem.writeFile(fileEntry, dataObj, isAppend);
  }
  
  deleteFile(fileEntry) {
    return this.fileSystem.deleteFile(fileEntry);
  }
  
  createDirectory(rootDirEntry, dirName) {
    return this.fileSystem.createDirectory(rootDirEntry, dirName);
  }
  
  // Additional utility methods
  /**
   * Returns the base directory path for the current platform.
   * @returns {string} The base path or an empty string
   */
  getBasePath() {
    if (this.fileSystem.getBasePath) {
      return this.fileSystem.getBasePath();
    }
    return '';
  }

  /**
   * Checks whether the application can be programmatically closed on this platform.
   * @returns {boolean} True if the platform supports app exit
   */
  canExitApp() {
    return this.platform === 'nwjs' || this.platform === 'cordova';
  }

  /**
   * Terminates the application.
   */
  exitApp() {
    if (this.platform === 'nwjs') {
      try {
        if (typeof nw !== 'undefined' && nw.App) {
          nw.App.quit();
          return;
        }
      } catch(e) {}
    } else if (this.platform === 'cordova') {
      if (typeof navigator !== 'undefined' && navigator.app) {
        navigator.app.exitApp();
      }
    }
  }
}