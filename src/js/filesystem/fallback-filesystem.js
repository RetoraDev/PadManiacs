/**
 * @class FallbackFileSystem
 * @category File System Classes
 * @summary Stub for web environments without file access
 * @constructor
 * @features
 * Rejects every operation with a clear error message
 * Satisfies the same interface as real filesystem implementations
 * Prevents runtime crashes when file access is unavailable
 * @description
 * FallbackFileSystem is a no-op implementation used when no native file system
 * API is available (standard web browsers). Every method returns a rejected
 * Promise so callers receive a consistent error without needing environment
 * checks of their own.
 * @example
 * // The fallback is selected automatically when neither NW.js nor Cordova is detected
 * const fs = new FileSystemTools();
 * // fs.fileSystem will be a FallbackFileSystem instance in a browser
 * try {
 *   await fs.getDirectory('Songs/');
 * } catch (e) {
 *   console.warn('File system not supported:', e.message);
 * }
 */
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