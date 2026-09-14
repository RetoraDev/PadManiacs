/**
 * @class NodeDirectoryEntry
 * @category File System Classes
 * @summary Cordova DirectoryEntry equivalent for Node.js
 * @constructor
 * @param {string} name - The directory name
 * @param {string} fullPath - The relative path from the filesystem root
 * @param {NodeFileSystem} fileSystem - The parent NodeFileSystem instance
 * @param {string} [nativeURL] - The native file:// URL for this directory
 * @features
 * Mimics the Cordova DirectoryEntry API for NW.js environments
 * Supports directory creation, recursive removal, and file listing
 * Bridges Node.js fs operations to Cordova-style callbacks
 * @description
 * NodeDirectoryEntry provides a Cordova-compatible DirectoryEntry interface on
 * top of Node.js synchronous file system calls. It is used by NodeFileSystem so
 * that addon and song code can interact with directories identically across
 * Cordova and NW.js platforms.
 * @example
 * // Listing subdirectories through a NodeDirectoryEntry
 * const fs = new NodeFileSystem();
 * const root = await fs.getDirectory('Songs/');
 * const reader = root.createReader();
 * reader.readEntries((entries) => {
 *   entries.filter(e => e.isDirectory).forEach(dir => {
 *     console.log('Found directory:', dir.name);
 *   });
 * }, (err) => console.error(err));
 */
// Node.js DirectoryEntry equivalent
class NodeDirectoryEntry {
  constructor(name, fullPath, fileSystem, nativeURL) {
    this.isFile = false;
    this.isDirectory = true;
    this.name = name;
    this.fullPath = fullPath;
    this.filesystem = fileSystem;
    this.nativeURL = nativeURL || `file://${fullPath}`;
  }

  createReader() {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(this.filesystem.basePath, this.fullPath);
    
    return {
      readEntries: (successCallback, errorCallback) => {
        try {
          const entries = [];
          const items = fs.readdirSync(fullPath);
          
          for (const item of items) {
            const itemPath = path.join(fullPath, item);
            const stats = fs.statSync(itemPath);
            const relativePath = path.join(this.fullPath, item);
            
            if (stats.isDirectory()) {
              entries.push(new NodeDirectoryEntry(
                item, 
                relativePath, 
                this.filesystem,
                `file://${itemPath}`
              ));
            } else {
              entries.push(new NodeFileEntry(
                item,
                relativePath,
                this.filesystem,
                `file://${itemPath}`
              ));
            }
          }
          
          successCallback(entries);
        } catch (error) {
          errorCallback(error);
        }
      }
    };
  }

  getDirectory(path, options, successCallback, errorCallback) {
    const fs = require('fs');
    const pathModule = require('path');
    const fullPath = pathModule.join(this.filesystem.basePath, this.fullPath, path);
    
    try {
      if (!fs.existsSync(fullPath)) {
        if (options && options.create) {
          fs.mkdirSync(fullPath, { recursive: true });
        } else {
          throw new Error(`Directory not found: ${path}`);
        }
      }
      
      const stats = fs.statSync(fullPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${path}`);
      }
      
      const dirEntry = new NodeDirectoryEntry(
        pathModule.basename(path),
        pathModule.join(this.fullPath, path),
        this.filesystem,
        `file://${fullPath}`
      );
      
      successCallback(dirEntry);
    } catch (error) {
      errorCallback(error);
    }
  }

  getFile(path, options, successCallback, errorCallback) {
    const fs = require('fs');
    const pathModule = require('path');
    const fullPath = pathModule.join(this.filesystem.basePath, this.fullPath, path);
    
    try {
      if (!fs.existsSync(fullPath)) {
        if (options && options.create) {
          // Create empty file
          fs.writeFileSync(fullPath, '');
        } else {
          throw new Error(`File not found: ${path}`);
        }
      }
      
      const stats = fs.statSync(fullPath);
      if (!stats.isFile()) {
        throw new Error(`Path is not a file: ${path}`);
      }
      
      const fileEntry = new NodeFileEntry(
        pathModule.basename(path),
        pathModule.join(this.fullPath, path),
        this.filesystem,
        `file://${fullPath}`
      );
      
      successCallback(fileEntry);
    } catch (error) {
      errorCallback(error);
    }
  }

  removeRecursively(successCallback, errorCallback) {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(this.filesystem.basePath, this.fullPath);
    
    try {
      const removeDir = (dirPath) => {
        if (fs.existsSync(dirPath)) {
          const items = fs.readdirSync(dirPath);
          for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
              removeDir(itemPath);
            } else {
              fs.unlinkSync(itemPath);
            }
          }
          fs.rmdirSync(dirPath);
        }
      };
      
      removeDir(fullPath);
      successCallback();
    } catch (error) {
      errorCallback(error);
    }
  }
}

/**
 * @class NodeFileEntry
 * @category File System Classes
 * @summary Cordova FileEntry equivalent for Node.js
 * @constructor
 * @param {string} name - The file name
 * @param {string} fullPath - The relative path from the filesystem root
 * @param {NodeFileSystem} fileSystem - The parent NodeFileSystem instance
 * @param {string} [nativeURL] - The native file:// URL for this file
 * @features
 * Mimics the Cordova FileEntry API for NW.js environments
 * Provides createWriter and file callbacks compatible with Cordova patterns
 * Detects MIME types from file extensions
 * @description
 * NodeFileEntry wraps a single file on disk behind the same interface that
 * Cordova FileEntry exposes. It supports reading file metadata, creating a
 * writer for output, and resolving a file descriptor so that higher-level code
 * can operate uniformly across platforms.
 * @example
 * // Reading a file via NodeFileEntry
 * const fs = new NodeFileSystem();
 * const dir = await fs.getDirectory('Songs/MySong/');
 * const reader = dir.createReader();
 * reader.readEntries((entries) => {
 *   const fileEntry = entries.find(e => e.isFile && e.name === 'song.sm');
 *   fileEntry.file((file) => {
 *     console.log('File size:', file.size, 'Type:', file.type);
 *   }, (err) => console.error(err));
 * }, (err) => console.error(err));
 */
// Node.js FileEntry equivalent
class NodeFileEntry {
  constructor(name, fullPath, fileSystem, nativeURL) {
    this.isFile = true;
    this.isDirectory = false;
    this.name = name;
    this.fullPath = fullPath;
    this.filesystem = fileSystem;
    this.nativeURL = nativeURL || `file://${fullPath}`;
  }

  createWriter(successCallback, errorCallback) {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(this.filesystem.basePath, this.fullPath);
    
    try {
      const writer = {
        write: (data) => {
          try {
            if (data instanceof Blob) {
              // Convert Blob to Buffer
              const reader = new FileReader();
              reader.onload = () => {
                fs.writeFileSync(fullPath, Buffer.from(reader.result));
              };
              reader.onerror = () => errorCallback(reader.error);
              reader.readAsArrayBuffer(data);
            } else if (typeof data === 'string') {
              fs.writeFileSync(fullPath, data);
            } else if (data instanceof ArrayBuffer) {
              fs.writeFileSync(fullPath, Buffer.from(data));
            } else {
              fs.writeFileSync(fullPath, data);
            }
          } catch (error) {
            errorCallback(error);
          }
        }
      };
      
      successCallback(writer);
    } catch (error) {
      errorCallback(error);
    }
  }

  file(successCallback, errorCallback) {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(this.filesystem.basePath, this.fullPath);
    
    try {
      const stats = fs.statSync(fullPath);
      const file = {
        name: this.name,
        size: stats.size,
        type: this.getMimeType(this.name),
        lastModified: stats.mtime,
        slice: (start, end) => {
          const buffer = fs.readFileSync(fullPath);
          return buffer.slice(start, end);
        },
        localURL: fullPath
      };
      
      // Add the path for internal use
      file._path = fullPath;
      
      successCallback(file);
    } catch (error) {
      errorCallback(error);
    }
  }

  getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'sm': 'text/plain',
      'ssc': 'text/plain',
      'json': 'application/json',
      'txt': 'text/plain'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

/**
 * @class NodeFileSystem
 * @category File System Classes
 * @summary File system for NW.js desktop apps
 * @constructor
 * @features
 * Uses Node.js fs and path modules for native file access
 * Auto-detects NW.js and plain Node.js working directories
 * Provides a Promise-based API consistent with CordovaFileSystem
 * @description
 * NodeFileSystem implements the full file system interface for NW.js desktop
 * builds using Node.js native modules. It resolves the application base
 * directory on construction and exposes Promise-based methods for directory
 * listing, file reading, writing, and creation that mirror the Cordova file
 * system API used elsewhere in the application.
 * @example
 * // Reading song data from the file system in an NW.js build
 * const fs = new NodeFileSystem();
 * const songsDir = await fs.getDirectory('Songs/');
 * const subDirs = await fs.listDirectories(songsDir);
 * for (const dir of subDirs) {
 *   const files = await fs.listFiles(dir);
 *   for (const fileEntry of files) {
 *     const file = await fs.getFile(fileEntry);
 *     const content = await fs.readFileContent(file);
 *     console.log(`${dir.name}/${fileEntry.name}: ${content.length} bytes`);
 *   }
 * }
 */
class NodeFileSystem {
  constructor() {
    try {
      /** @type {Object} The Node.js fs module reference */
      this.fs = require('fs');
      /** @type {Object} The Node.js path module reference */
      this.path = require('path');
      /** @type {string} The resolved base directory path */
      this.basePath = this.getBasePath();
      
      // Create file system object for DirectoryEntry
      /** @type {Object} Pseudo filesystem exposed to DirectoryEntry instances */
      this.fileSystemObj = {
        name: 'nodefs',
        root: new NodeDirectoryEntry('', '/', this, `file://${this.basePath}`)
      };
      
    } catch (error) {
      console.error('Node.js modules not available:', error);
      throw error;
    }
  }

  /**
   * Resolves the base directory path for NW.js or Node.js environments.
   * @returns {string} The working directory path
   */
  getBasePath() {
    if (typeof nw !== 'undefined' && nw.process) {
      // NW.js - use the directory where the executable is located
      return nw.process.cwd();
    } else if (typeof process !== 'undefined' && process.cwd) {
      // Node.js - use current working directory
      return process.cwd();
    }
    return '.';
  }

  /**
   * Resolves a directory path and returns a NodeDirectoryEntry.
   * @param {string} path - Relative path to the directory
   * @returns {Promise<NodeDirectoryEntry>} Resolves with the directory entry
   */
  getDirectory(path) {
    return new Promise((resolve, reject) => {
      const fullPath = this.path.join(this.basePath, path);
      
      this.fs.stat(fullPath, (err, stats) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!stats.isDirectory()) {
          reject(new Error(`Path is not a directory: ${path}`));
          return;
        }
        
        const dirEntry = new NodeDirectoryEntry(
          this.path.basename(path) || '.',
          path,
          this,
          `file://${fullPath}`
        );
        
        resolve(dirEntry);
      });
    });
  }

  /**
   * Lists immediate child directories within a NodeDirectoryEntry.
   * @param {NodeDirectoryEntry} dirEntry - The directory entry to list
   * @returns {Promise<Array>} Resolves with an array of directory entries
   */
  listDirectories(dirEntry) {
    return new Promise((resolve, reject) => {
      dirEntry.createReader().readEntries(
        entries => resolve(entries.filter(e => e.isDirectory)),
        err => reject(err)
      );
    });
  }

  /**
   * Recursively lists all subdirectories under a root directory.
   * @param {NodeDirectoryEntry} startDir - The root directory to traverse
   * @returns {Promise<Array>} Resolves with all descendant directory entries
   */
  listAllDirectories(startDir) {
    return new Promise(async (resolve) => {
      const dirs = [];
      const queue = [startDir];

      while (queue.length) {
        const dir = queue.shift();
        try {
          const subDirs = await this.listDirectories(dir);
          dirs.push(...subDirs);
          queue.push(...subDirs);
        } catch (error) {
          console.warn(`Error listing directories in ${dir.name}:`, error);
        }
      }

      resolve(dirs);
    });
  }

  /**
   * Lists immediate child files within a directory entry.
   * @param {NodeDirectoryEntry} dirEntry - The directory entry to list
   * @returns {Promise<Array>} Resolves with an array of file entries
   */
  listFiles(dirEntry) {
    return new Promise((resolve, reject) => {
      dirEntry.createReader().readEntries(
        entries => resolve(entries.filter(e => e.isFile)),
        err => reject(err)
      );
    });
  }

  /**
   * Retrieves the file object from a file entry.
   * @param {NodeFileEntry} fileEntry - The file entry to read
   * @returns {Promise<Object>} Resolves with the file descriptor object
   */
  getFile(fileEntry) {
    return new Promise((resolve, reject) => {
      fileEntry.file(
        file => resolve(file),
        err => reject(err)
      );
    });
  }

  /**
   * Reads the full text content of a file object.
   * @param {Object} file - The file descriptor object
   * @returns {Promise<string>} Resolves with the file content as text
   */
  readFileContent(file) {
    return new Promise((resolve, reject) => {
      // If file has _path (from NodeFileEntry), use it directly
      if (file._path) {
        this.fs.readFile(file._path, 'utf8', (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      } else {
        // Fallback for Blob files (from Cordova)
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      }
    });
  }
  
  /**
   * Creates or opens a file for saving data.
   * @param {NodeDirectoryEntry} dirEntry - The parent directory
   * @param {string} fileName - The file name to save
   * @returns {Promise<NodeFileEntry>} Resolves with the file entry
   */
  saveFile(dirEntry, fileData, fileName) {
    return new Promise((resolve, reject) => {
      dirEntry.getFile(fileName, { create: true, exclusive: false }, 
        fileEntry => resolve(fileEntry),
        error => reject(error)
      );
    });
  }
  
  /**
   * Creates an empty file or opens an existing one for appending.
   * @param {NodeDirectoryEntry} dirEntry - The parent directory
   * @param {string} fileName - The file name to create
   * @param {boolean} isAppend - Whether to append to existing content
   * @returns {Promise<NodeFileEntry>} Resolves with the file entry
   */
  createEmptyFile(dirEntry, fileName, isAppend) {
    return new Promise((resolve, reject) => {
      dirEntry.getFile(fileName, {create: true, exclusive: false}, 
        fileEntry => resolve(fileEntry),
        err => reject(err)
      );
    });
  }
  
  /**
   * Writes data to an existing file entry.
   * @param {NodeFileEntry} fileEntry - The file entry to write to
   * @param {string|Blob|ArrayBuffer} dataObj - The data to write
   * @param {boolean} isAppend - Whether to append instead of overwrite
   * @returns {Promise<Object>} Resolves with the writer
   */
  writeFile(fileEntry, dataObj, isAppend) {
    return new Promise((resolve, reject) => {
      fileEntry.createWriter(
        writer => {
          writer.write(dataObj);
          resolve(writer);
        },
        err => reject(err)
      );
    });
  }
  
  /**
   * Creates a new subdirectory inside a parent directory.
   * @param {NodeDirectoryEntry} rootDirEntry - The parent directory
   * @param {string} dirName - The directory name to create
   * @returns {Promise<NodeDirectoryEntry>} Resolves with the new directory entry
   */
  createDirectory(rootDirEntry, dirName) {
    return new Promise((resolve, reject) => {
      rootDirEntry.getDirectory(dirName, { create: true }, 
        dirEntry => resolve(dirEntry),
        err => reject(err)
      );
    });
  }
}