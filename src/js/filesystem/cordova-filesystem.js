/**
 * @class CordovaFileSystem
 * @category File System Classes
 * @summary File system for Apache Cordova mobile apps
 * @constructor
 * @features
 * Resolves directories via the Cordova file plugin
 * Adapts root storage location per OS (iOS, Android, Windows)
 * Wraps callback-based APIs in Promises
 * @description
 * CordovaFileSystem implements the standard file system interface using the
 * Apache Cordova File plugin. It selects the appropriate persistent storage
 * directory based on the device operating system and wraps all callback-based
 * Cordova file operations in Promises for consistent async usage.
 * @example
 * // Reading a song file on a Cordova mobile device
 * const fs = new CordovaFileSystem();
 * const songsDir = await fs.getDirectory('Songs/MySong/');
 * const files = await fs.listFiles(songsDir);
 * for (const entry of files) {
 *   const file = await fs.getFile(entry);
 *   const text = await fs.readFileContent(file);
 *   console.log(entry.name, text.length);
 * }
 */
class CordovaFileSystem {
  getDirectory(path) {
    return new Promise((resolve, reject) => {
      let rootDir = LocalFileSystem.PERSISTENT;
      if (game.device.windows) {
        rootDir = cordova.file.dataDirectory;
      } else if (game.device.macOS || game.device.iOS) {
        rootDir = cordova.file.documentsDirectory;
      } else if (game.device.android) {
        rootDir = cordova.file.externalRootDirectory;
      }
      window.resolveLocalFileSystemURL(
        rootDir + path,
        dir => resolve(dir),
        err => reject(err)
      );
    });
  }

  /**
   * Lists immediate child directories within a directory entry.
   * @param {Object} dirEntry - The Cordova directory entry to list
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
   * Recursively lists all subdirectories starting from a root directory.
   * Uses a breadth-first traversal to discover the full directory tree.
   * @param {Object} startDir - The root directory entry to traverse
   * @returns {Promise<Array>} Resolves with all descendant directory entries
   */
  listAllDirectories(startDir) {
    return new Promise(async resolve => {
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
   * @param {Object} dirEntry - The Cordova directory entry to list
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
   * Retrieves the File object from a file entry.
   * @param {Object} fileEntry - The Cordova file entry
   * @returns {Promise<File>} Resolves with the File object
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
   * Reads the full text content of a File object.
   * @param {File} file - The File object to read
   * @returns {Promise<string>} Resolves with the file content as text
   */
  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
  
  /**
   * Saves data to a file, creating it if it does not exist.
   * @param {Object} dirEntry - The parent directory entry
   * @param {string|Blob} fileData - The data to write
   * @param {string} fileName - The name of the file to save
   * @returns {Promise<Object>} Resolves with the created file entry
   */
  saveFile(dirEntry, fileData, fileName) {
    return new Promise((resolve, reject) => {
      dirEntry.getFile(fileName, { create: true, exclusive: false }, fileEntry => {
        this.writeFile(fileEntry, fileData)
          .then(() => resolve(fileEntry))
          .catch(err => reject(err));
      }, error => reject(error));
    });
  }
  
  /**
   * Creates an empty file or opens an existing file for appending.
   * @param {Object} dirEntry - The parent directory entry
   * @param {string} fileName - The name of the file to create
   * @param {boolean} isAppend - Whether to append to existing content
   * @returns {Promise<Object>} Resolves with the file entry
   */
  createEmptyFile(dirEntry, fileName, isAppend) {
    return new Promise((resolve, reject) => {
      dirEntry.getFile(fileName, {create: true, exclusive: false}, fileEntry => {
        this.writeFile(fileEntry, null, isAppend)
          .then(() => resolve(fileEntry))
          .catch(err => reject(err));
      }, err => reject(err));
    });
  }
  
  /**
   * Writes data to an existing file entry.
   * @param {Object} fileEntry - The file entry to write to
   * @param {string|Blob} dataObj - The data to write
   * @param {boolean} isAppend - Whether to append instead of overwrite
   * @returns {Promise<Object>} Resolves with the file writer
   */
  writeFile(fileEntry, dataObj, isAppend) {
    return new Promise((resolve, reject) => {
      fileEntry.createWriter(fileWriter => {
        fileWriter.onwrite = () => resolve(fileWriter);
        fileWriter.onerror = err => reject(err);
  
        fileWriter.write(dataObj);
      });
    });
  }
  
  /**
   * Creates a new subdirectory inside a parent directory.
   * @param {Object} rootDirEntry - The parent directory entry
   * @param {string} dirName - The name of the directory to create
   * @returns {Promise<Object>} Resolves with the new directory entry
   */
  createDirectory(rootDirEntry, dirName) {
    return new Promise((resolve, reject) => {
      rootDirEntry.getDirectory(dirName, { create: true }, dirEntry => {
        resolve(dirEntry);
      }, err => reject(err));
    });
  }
}
