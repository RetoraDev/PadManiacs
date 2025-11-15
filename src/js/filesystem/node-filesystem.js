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

class NodeFileSystem {
  constructor() {
    try {
      this.fs = require('fs');
      this.path = require('path');
      this.basePath = this.getBasePath();
      
      // Create file system object for DirectoryEntry
      this.fileSystemObj = {
        name: 'nodefs',
        root: new NodeDirectoryEntry('', '/', this, `file://${this.basePath}`)
      };
      
    } catch (error) {
      console.error('Node.js modules not available:', error);
      throw error;
    }
  }

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

  listDirectories(dirEntry) {
    return new Promise((resolve, reject) => {
      dirEntry.createReader().readEntries(
        entries => resolve(entries.filter(e => e.isDirectory)),
        err => reject(err)
      );
    });
  }

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

  listFiles(dirEntry) {
    return new Promise((resolve, reject) => {
      dirEntry.createReader().readEntries(
        entries => resolve(entries.filter(e => e.isFile)),
        err => reject(err)
      );
    });
  }

  getFile(fileEntry) {
    return new Promise((resolve, reject) => {
      fileEntry.file(
        file => resolve(file),
        err => reject(err)
      );
    });
  }

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
  
  saveFile(dirEntry, fileData, fileName) {
    return new Promise((resolve, reject) => {
      dirEntry.getFile(fileName, { create: true, exclusive: false }, 
        fileEntry => resolve(fileEntry),
        error => reject(error)
      );
    });
  }
  
  createEmptyFile(dirEntry, fileName, isAppend) {
    return new Promise((resolve, reject) => {
      dirEntry.getFile(fileName, {create: true, exclusive: false}, 
        fileEntry => resolve(fileEntry),
        err => reject(err)
      );
    });
  }
  
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
  
  createDirectory(rootDirEntry, dirName) {
    return new Promise((resolve, reject) => {
      rootDirEntry.getDirectory(dirName, { create: true }, 
        dirEntry => resolve(dirEntry),
        err => reject(err)
      );
    });
  }
}