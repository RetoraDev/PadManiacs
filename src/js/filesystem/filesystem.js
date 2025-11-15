class FileSystemTools {
  constructor() {
    this.platform = this.detectPlatform();
    
    if (this.platform === 'nwjs') {
      this.fileSystem = new NodeFileSystem();
    } else if (this.platform === 'cordova') {
      this.fileSystem = new CordovaFileSystem();
    } else {
      this.fileSystem = new FallbackFileSystem();
    }
    
    console.log(`FileSystem: Using ${this.platform} implementation`);
  }

  detectPlatform() {
    // Check for NW.js
    if (typeof nw !== 'undefined' && nw.process) {
      return 'nwjs';
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
  
  createDirectory(rootDirEntry, dirName) {
    return this.fileSystem.createDirectory(rootDirEntry, dirName);
  }

  // Additional utility methods
  getBasePath() {
    if (this.platform === 'nwjs' && this.fileSystem.getBasePath) {
      return this.fileSystem.getBasePath();
    }
    return '';
  }

  canExitApp() {
    return this.platform === 'nwjs' || this.platform === 'cordova';
  }

  exitApp() {
    if (this.platform === 'nwjs') {
      if (typeof nw !== 'undefined' && nw.App) {
        nw.App.quit();
      }
    } else if (this.platform === 'cordova') {
      if (typeof navigator !== 'undefined' && navigator.app) {
        navigator.app.exitApp();
      }
    }
  }
}