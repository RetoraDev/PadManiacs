class FallbackFileSystem {
  // Fallback implementation for browsers without file system access
  getDirectory(path) {
    return Promise.reject(new Error('File system not available in this environment'));
  }

  listDirectories(dirEntry) {
    return Promise.reject(new Error('File system not available in this environment'));
  }

  listAllDirectories(startDir) {
    return Promise.reject(new Error('File system not available in this environment'));
  }

  listFiles(dirEntry) {
    return Promise.reject(new Error('File system not available in this environment'));
  }

  getFile(fileEntry) {
    return Promise.reject(new Error('File system not available in this environment'));
  }

  readFileContent(file) {
    return Promise.reject(new Error('File system not available in this environment'));
  }
  
  saveFile(dirEntry, fileData, fileName) {
    return Promise.reject(new Error('File system not available in this environment'));
  }
  
  createEmptyFile(dirEntry, fileName, isAppend) {
    return Promise.reject(new Error('File system not available in this environment'));
  }
  
  writeFile(fileEntry, dataObj, isAppend) {
    return Promise.reject(new Error('File system not available in this environment'));
  }
  
  createDirectory(rootDirEntry, dirName) {
    return Promise.reject(new Error('File system not available in this environment'));
  }
}