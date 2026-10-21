/**
 * @class FileSystemTools
 * @category File System Classes
 * @summary Platform-agnostic file system access wrapper
 * @constructor
 * @features
 * Auto-detects runtime platform (Neutralino, Cordova, or browser)
 * Delegates all operations to the platform-specific implementation
 * Provides uniform API for directory listing, file reading, and writing
 * @description
 * FileSystemTools wraps platform-specific file system implementations behind a single
 * consistent API. It detects the current runtime on construction and selects the
 * appropriate backend (NeutralinoFileSystem, CordovaFileSystem, or FallbackFileSystem)
 * so that the rest of the application never needs to care about the environment.
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
    
    if (this.platform === 'neutralino') {
      /** @type {Object} The platform-specific filesystem adapter */
      this.fileSystem = new NeutralinoFileSystem();
    } else if (this.platform === 'cordova') {
      this.fileSystem = new CordovaFileSystem();
    } else {
      this.fileSystem = new FallbackFileSystem();
    }
    
    console.log(`FileSystem: Using ${this.platform} implementation`);
  }

  /**
   * Determines the current runtime platform by checking for Neutralino, Cordova,
   * or falling back to the browser environment.
   * @returns {string} One of 'neutralino', 'cordova', or 'fallback'
   */
  detectPlatform() {
    // Check for Neutralino.js (client connected, native API available)
    if (typeof Neutralino !== 'undefined' && typeof NL_PATH !== 'undefined') {
      return 'neutralino';
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
   * Only meaningful on Neutralino; returns empty string on other platforms.
   * @returns {string} The base path or an empty string
   */
  getBasePath() {
    if (this.platform === 'neutralino' && this.fileSystem.getBasePath) {
      return this.fileSystem.getBasePath();
    }
    return '';
  }

  /**
   * Checks whether the application can be programmatically closed on this platform.
   * @returns {boolean} True if the platform supports app exit
   */
  canExitApp() {
    return this.platform === 'neutralino' || this.platform === 'cordova';
  }

  /**
   * Terminates the application. Only works on Neutralino and Cordova platforms.
   */
  exitApp() {
    if (this.platform === 'neutralino') {
      if (typeof Neutralino !== 'undefined' && Neutralino.app) {
        Neutralino.app.exit();
      }
    } else if (this.platform === 'cordova') {
      if (typeof navigator !== 'undefined' && navigator.app) {
        navigator.app.exitApp();
      }
    }
  }

  /**
   * Shows a native open dialog (Neutralino only)
   * @param {string} title 
   * @param {Object} options 
   * @returns {Promise<Array<string>>}
   */
  showOpenDialog(title, options = {}) {
    if (this.platform === 'neutralino' && typeof Neutralino !== 'undefined' && Neutralino.os && Neutralino.os.showOpenDialog) {
      return Neutralino.os.showOpenDialog(title, options);
    }
    return Promise.reject(new Error('showOpenDialog not supported on this platform'));
  }

  /**
   * Shows a native folder dialog (Neutralino only)
   * @param {string} title 
   * @param {Object} options 
   * @returns {Promise<string>}
   */
  showFolderDialog(title, options = {}) {
    if (this.platform === 'neutralino' && typeof Neutralino !== 'undefined' && Neutralino.os && Neutralino.os.showFolderDialog) {
      return Neutralino.os.showFolderDialog(title, options);
    }
    return Promise.reject(new Error('showFolderDialog not supported on this platform'));
  }

  /**
   * Shows a native save dialog (Neutralino only)
   * @param {string} title 
   * @param {Object} options 
   * @returns {Promise<string>}
   */
  showSaveDialog(title, options = {}) {
    if (this.platform === 'neutralino' && typeof Neutralino !== 'undefined' && Neutralino.os && Neutralino.os.showSaveDialog) {
      return Neutralino.os.showSaveDialog(title, options);
    }
    return Promise.reject(new Error('showSaveDialog not supported on this platform'));
  }

  /**
   * Executes a shell command (Neutralino only)
   * @param {string} command 
   * @param {Object} options 
   * @returns {Promise<any>}
   */
  execCommand(command, options = {}) {
    if (this.platform === 'neutralino' && typeof Neutralino !== 'undefined' && Neutralino.os && Neutralino.os.execCommand) {
      return Neutralino.os.execCommand(command, options);
    }
    return Promise.reject(new Error('execCommand not supported on this platform'));
  }

  /**
   * Direct access to Neutralino filesystem
   */
  get neutralinoFs() {
    if (this.platform === 'neutralino') {
      return this.fileSystem;
    }
    return null;
  }
}