/**
 * @class NeutralinoDirectoryEntry
 * @category File System Classes
 * @summary Cordova DirectoryEntry equivalent for Neutralino.js
 * @constructor
 * @param {string} name - The directory name
 * @param {string} fullPath - The relative path from the application base directory
 * @param {NeutralinoFileSystem} fileSystem - The parent NeutralinoFileSystem instance
 * @param {string} [nativeURL] - The server URL for this directory
 * @features
 * Mimics the Cordova DirectoryEntry API on top of Neutralino.filesystem
 * Bridges async Neutralino native calls to Cordova-style callbacks
 * Exposes server-mounted URLs so external assets load over HTTP
 * @description
 * NeutralinoDirectoryEntry provides a Cordova-compatible DirectoryEntry interface
 * over the Neutralino native filesystem API so that addon and song code can
 * interact with directories identically across Cordova, NW.js and Neutralino
 * platforms. Directory and file URLs are served through Neutralino's built-in
 * HTTP server (mounted at /pmfs), so media referenced by nativeURL works in the
 * webview without blob conversion.
 * @example
 * // Listing subdirectories through a NeutralinoDirectoryEntry
 * const fs = new NeutralinoFileSystem();
 * const root = await fs.getDirectory('data/Songs/');
 * const reader = root.createReader();
 * reader.readEntries((entries) => {
 *   entries.filter(e => e.isDirectory).forEach(dir => {
 *     console.log('Found directory:', dir.name);
 *   });
 * }, (err) => console.error(err));
 */
class NeutralinoDirectoryEntry {
  constructor(name, fullPath, fileSystem, nativeURL) {
    this.isFile = false;
    this.isDirectory = true;
    this.name = name;
    this.fullPath = fullPath;
    this.filesystem = fileSystem;
    // Directory URLs keep a trailing slash so code can concatenate child paths
    // (e.g. addon.dir.nativeURL + manifest.icon), matching Cordova semantics.
    this.nativeURL = nativeURL || (fileSystem.toServerUrl(fullPath) + '/');
  }

  createReader() {
    return {
      readEntries: (successCallback, errorCallback) => {
        Neutralino.filesystem.readDirectory(this.filesystem.resolvePath(this.fullPath))
          .then(entries => {
            const result = entries.map(entry => {
              const relativePath = NeutralinoDirectoryEntry.joinRelative(this.fullPath, entry.entry);
              if (entry.type === 'directory') {
                return new NeutralinoDirectoryEntry(entry.entry, relativePath, this.filesystem);
              }
              return new NeutralinoFileEntry(entry.entry, relativePath, this.filesystem);
            });
            successCallback(result);
          })
          .catch(errorCallback);
      }
    };
  }

  getDirectory(path, options, successCallback, errorCallback) {
    const relativePath = NeutralinoDirectoryEntry.joinRelative(this.fullPath, path);
    this.filesystem.ensureDirectory(relativePath, options)
      .then(() => {
        successCallback(new NeutralinoDirectoryEntry(
          NeutralinoDirectoryEntry.baseName(path),
          relativePath,
          this.filesystem
        ));
      })
      .catch(errorCallback);
  }

  getFile(path, options, successCallback, errorCallback) {
    const relativePath = NeutralinoDirectoryEntry.joinRelative(this.fullPath, path);
    this.filesystem.ensureFile(relativePath, options)
      .then(() => {
        successCallback(new NeutralinoFileEntry(
          NeutralinoFileEntry.baseName(path),
          relativePath,
          this.filesystem
        ));
      })
      .catch(errorCallback);
  }

  removeRecursively(successCallback, errorCallback) {
    Neutralino.filesystem.remove(this.filesystem.resolvePath(this.fullPath))
      .then(() => successCallback())
      .catch(errorCallback);
  }

  /**
   * Joins a relative path with a child segment, collapsing duplicate slashes.
   * @param {string} base - The parent relative path
   * @param {string} child - The child path segment
   * @returns {string} The joined relative path
   */
  static joinRelative(base, child) {
    const joined = `${base || ''}/${child || ''}`.replace(/\/+/g, '/');
    return joined.replace(/^\//, '');
  }

  /**
   * Returns the last segment of a path.
   * @param {string} path - The path to process
   * @returns {string} The base name
   */
  static baseName(path) {
    const parts = (path || '').replace(/\/+$/, '').split('/');
    return parts[parts.length - 1] || '.';
  }
}

/**
 * @class NeutralinoFileEntry
 * @category File System Classes
 * @summary Cordova FileEntry equivalent for Neutralino.js
 * @constructor
 * @param {string} name - The file name
 * @param {string} fullPath - The relative path from the application base directory
 * @param {NeutralinoFileSystem} fileSystem - The parent NeutralinoFileSystem instance
 * @param {string} [nativeURL] - The server URL for this file
 * @features
 * Mimics the Cordova FileEntry API on top of Neutralino.filesystem
 * Supports string, ArrayBuffer, typed array and Blob writes
 * Exposes localURL served over Neutralino's HTTP server for media loading
 * @description
 * NeutralinoFileEntry wraps a single file behind the same interface Cordova's
 * FileEntry exposes. The returned file descriptor carries a server-backed
 * localURL (mounted via Neutralino.server.mount) so higher-level code can use
 * it directly as a media URL, matching the NW.js file:// and Cordova localURL
 * behaviour on other platforms.
 * @example
 * // Reading a file via NeutralinoFileEntry
 * const fs = new NeutralinoFileSystem();
 * const dir = await fs.getDirectory('data/Songs/MySong/');
 * const reader = dir.createReader();
 * reader.readEntries((entries) => {
 *   const fileEntry = entries.find(e => e.isFile && e.name === 'song.sm');
 *   fileEntry.file((file) => {
 *     console.log('File size:', file.size, 'URL:', file.localURL);
 *   }, (err) => console.error(err));
 * }, (err) => console.error(err));
 */
class NeutralinoFileEntry {
  constructor(name, fullPath, fileSystem, nativeURL) {
    this.isFile = true;
    this.isDirectory = false;
    this.name = name;
    this.fullPath = fullPath;
    this.filesystem = fileSystem;
    this.nativeURL = nativeURL || fileSystem.toServerUrl(fullPath);
  }

  createWriter(successCallback, errorCallback) {
    const absolutePath = this.filesystem.resolvePath(this.fullPath);

    try {
      const writer = {
        write: (data, onDone, onError) => {
          const done = () => { if (onDone) onDone(); };
          const fail = err => { if (onError) onError(err); else errorCallback(err); };
          try {
            if (typeof Blob !== 'undefined' && data instanceof Blob) {
              const reader = new FileReader();
              reader.onload = () => {
                Neutralino.filesystem.writeBinaryFile(absolutePath, reader.result)
                  .then(done)
                  .catch(fail);
              };
              reader.onerror = () => fail(reader.error);
              reader.readAsArrayBuffer(data);
            } else if (typeof data === 'string') {
              Neutralino.filesystem.writeFile(absolutePath, data).then(done).catch(fail);
            } else if (data instanceof ArrayBuffer) {
              Neutralino.filesystem.writeBinaryFile(absolutePath, data).then(done).catch(fail);
            } else if (data && data.buffer instanceof ArrayBuffer) {
              // Typed arrays (e.g. Uint8Array)
              const view = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
              Neutralino.filesystem.writeBinaryFile(absolutePath, view.buffer).then(done).catch(fail);
            } else if (data == null) {
              Neutralino.filesystem.writeFile(absolutePath, '').then(done).catch(fail);
            } else {
              Neutralino.filesystem.writeFile(absolutePath, String(data)).then(done).catch(fail);
            }
          } catch (error) {
            fail(error);
          }
        }
      };

      successCallback(writer);
    } catch (error) {
      errorCallback(error);
    }
  }

  file(successCallback, errorCallback) {
    const absolutePath = this.filesystem.resolvePath(this.fullPath);

    Neutralino.filesystem.getStats(absolutePath)
      .then(stats => {
        const file = {
          name: this.name,
          size: stats.size,
          type: this.getMimeType(this.name),
          lastModified: new Date(stats.modifiedAt),
          localURL: this.nativeURL,
          slice: (start, end) => {
            // Lazy synchronous slice is not possible with native calls;
            // callers needing partial reads should use readBinaryFile options.
            throw new Error('slice() is not supported on Neutralino file entries, use FileSystemTools.readFileContent');
          }
        };

        // Add the path for internal use
        file._path = absolutePath;

        successCallback(file);
      })
      .catch(errorCallback);
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
      'json': 'application/json',
      'txt': 'text/plain'
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Returns the last segment of a path.
   * @param {string} path - The path to process
   * @returns {string} The base name
   */
  static baseName(path) {
    const parts = (path || '').replace(/\/+$/, '').split('/');
    return parts[parts.length - 1] || '.';
  }
}

/**
 * @class NeutralinoFileSystem
 * @category File System Classes
 * @summary File system for Neutralino.js desktop apps
 * @constructor
 * @features
 * Uses Neutralino.filesystem native API for all disk access
 * Serves the app base directory over Neutralino's HTTP server at /pmfs
 * Provides a Promise-based API consistent with NodeFileSystem/CordovaFileSystem
 * @description
 * NeutralinoFileSystem implements the full file system interface for Neutralino
 * desktop builds. It resolves the application base directory from the NL_PATH
 * global, exposes Promise-based methods mirroring the Cordova file system API,
 * and mounts the base directory into Neutralino's built-in HTTP server so that
 * directory/file nativeURLs can be used directly as media URLs inside the
 * webview (the same role file:// URLs play on NW.js).
 * @example
 * // Reading song data from the file system in a Neutralino build
 * const fs = new NeutralinoFileSystem();
 * const songsDir = await fs.getDirectory('data/Songs/');
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
class NeutralinoFileSystem {
  constructor() {
    /** @type {string} The resolved base directory path (app working directory) */
    this.basePath = this.getBasePath();

    // Create file system object for DirectoryEntry
    /** @type {Object} Pseudo filesystem exposed to DirectoryEntry instances */
    this.fileSystemObj = {
      name: 'neutralinofs',
      root: new NeutralinoDirectoryEntry('', '/', this)
    };

    // Mount the base directory into the built-in HTTP server (idempotent)
    this.ensureMounted();
  }

  /**
   * Resolves the base directory path for the Neutralino environment.
   * @returns {string} The application working directory path
   */
  getBasePath() {
    if (typeof NL_PATH !== 'undefined' && NL_PATH) {
      return NL_PATH;
    }
    if (typeof window !== 'undefined' && window.NL_PATH) {
      return window.NL_PATH;
    }
    return '.';
  }

  /**
   * Resolves a relative path into an absolute path for Neutralino native calls.
   * @param {string} relativePath - Path relative to the base directory
   * @returns {string} The absolute filesystem path
   */
  resolvePath(relativePath) {
    const relative = (relativePath || '').replace(/^\/+/, '').replace(/\/+$/, '');
    if (!relative) return this.basePath;
    if ((relativePath || '').startsWith(this.basePath)) return relativePath.replace(/\/+$/, '');
    return `${this.basePath}/${relative}`.replace(/\/+/g, '/');
  }

  /**
   * Converts a relative path into a URL served by Neutralino's HTTP server.
   * Segments are URI-encoded so paths with spaces or accents stay loadable.
   * @param {string} relativePath - Path relative to the base directory
   * @returns {string} The server URL path (e.g. /pmfs/data/Songs/My%20Song)
   */
  toServerUrl(relativePath) {
    const relative = (relativePath || '').replace(/^\/+/, '');
    const encoded = relative.split('/').map(segment => encodeURIComponent(segment)).join('/');
    return `${NeutralinoFileSystem.MOUNT_URL}/${encoded}`;
  }

  /**
   * Mounts the base directory into the Neutralino HTTP server once.
   * @returns {Promise<boolean>} Resolves true when the mount succeeded
   */
  ensureMounted() {
    if (!NeutralinoFileSystem.mountPromise) {
      console.log('Ensure mounted:', NeutralinoFileSystem.MOUNT_URL, this.basePath);
      NeutralinoFileSystem.mountPromise = Neutralino.server.mount(NeutralinoFileSystem.MOUNT_URL, this.basePath)
        .then(() => {
          console.log(`FileSystem: Mounted ${this.basePath} at ${NeutralinoFileSystem.MOUNT_URL}`);
          return true;
        })
        .catch(error => {
          console.warn('FileSystem: Neutralino server.mount failed, nativeURL loading may not work:', error);
          return false;
        });
    }
    return NeutralinoFileSystem.mountPromise;
  }

  /**
   * Stats a relative path, creating it when options.request create is set.
   * @param {string} relativePath - Path relative to the base directory
   * @param {boolean} shouldBeDirectory - Whether the path must be a directory
   * @param {Object} [options] - Cordova-style options ({create: true})
   * @returns {Promise<Object>} Resolves with the Neutralino stats object
   */
  ensurePath(relativePath, shouldBeDirectory, options) {
    const absolutePath = this.resolvePath(relativePath);

    return Neutralino.filesystem.getStats(absolutePath)
      .catch(() => null)
      .then(stats => {
        if (!stats) {
          if (!(options && options.create)) {
            throw new Error(`${shouldBeDirectory ? 'Directory' : 'File'} not found: ${relativePath}`);
          }
          if (shouldBeDirectory) {
            return Neutralino.filesystem.createDirectory(absolutePath)
              .then(() => Neutralino.filesystem.getStats(absolutePath));
          }
          return Neutralino.filesystem.writeFile(absolutePath, '')
            .then(() => Neutralino.filesystem.getStats(absolutePath));
        }

        if (shouldBeDirectory && !stats.isDirectory) {
          throw new Error(`Path is not a directory: ${relativePath}`);
        }
        if (!shouldBeDirectory && !stats.isFile) {
          throw new Error(`Path is not a file: ${relativePath}`);
        }
        return stats;
      });
  }

  /**
   * Ensures a directory exists at the given relative path.
   * @param {string} relativePath - Path relative to the base directory
   * @param {Object} [options] - Cordova-style options ({create: true})
   * @returns {Promise<void>} Resolves once the directory exists
   */
  ensureDirectory(relativePath, options) {
    return this.ensurePath(relativePath, true, options).then(() => {});
  }

  /**
   * Ensures a file exists at the given relative path.
   * @param {string} relativePath - Path relative to the base directory
   * @param {Object} [options] - Cordova-style options ({create: true})
   * @returns {Promise<void>} Resolves once the file exists
   */
  ensureFile(relativePath, options) {
    return this.ensurePath(relativePath, false, options).then(() => {});
  }

  /**
   * Resolves a directory path and returns a NeutralinoDirectoryEntry.
   * @param {string} path - Relative path to the directory
   * @returns {Promise<NeutralinoDirectoryEntry>} Resolves with the directory entry
   */
  getDirectory(path) {
    const relativePath = (path || '').replace(/^\/+/, '');

    return this.ensurePath(relativePath, true, null).then(() => {
      return new NeutralinoDirectoryEntry(
        NeutralinoDirectoryEntry.baseName(relativePath) || '.',
        relativePath,
        this
      );
    });
  }

  /**
   * Lists immediate child directories within a NeutralinoDirectoryEntry.
   * @param {NeutralinoDirectoryEntry} dirEntry - The directory entry to list
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
   * @param {NeutralinoDirectoryEntry} startDir - The root directory to traverse
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
   * @param {NeutralinoDirectoryEntry} dirEntry - The directory entry to list
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
   * @param {NeutralinoFileEntry} fileEntry - The file entry to read
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
      // If file has _path (from NeutralinoFileEntry), use it directly
      if (file && file._path) {
        Neutralino.filesystem.readFile(file._path)
          .then(data => resolve(data))
          .catch(reject);
      } else if (file && typeof file.text === 'function') {
        // Fallback for Blob/File objects
        file.text().then(resolve).catch(reject);
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
   * Creates or opens a file for saving data, writing fileData when provided.
   * @param {NeutralinoDirectoryEntry} dirEntry - The parent directory
   * @param {string|Blob|ArrayBuffer} [fileData] - Optional data to write into the file
   * @param {string} fileName - The file name to save
   * @returns {Promise<NeutralinoFileEntry>} Resolves with the file entry once written
   */
  saveFile(dirEntry, fileData, fileName) {
    return new Promise((resolve, reject) => {
      dirEntry.getFile(fileName, { create: true, exclusive: false },
        fileEntry => {
          if (fileData === undefined || fileData === null) {
            resolve(fileEntry);
            return;
          }
          this.writeFile(fileEntry, fileData)
            .then(() => resolve(fileEntry))
            .catch(err => reject(err));
        },
        error => reject(error)
      );
    });
  }

  /**
   * Creates an empty file or opens an existing one for appending.
   * @param {NeutralinoDirectoryEntry} dirEntry - The parent directory
   * @param {string} fileName - The file name to create
   * @param {boolean} isAppend - Whether to append to existing content
   * @returns {Promise<NeutralinoFileEntry>} Resolves with the file entry
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
   * Writes data to an existing file entry, resolving once the data is on disk.
   * @param {NeutralinoFileEntry} fileEntry - The file entry to write to
   * @param {string|Blob|ArrayBuffer} dataObj - The data to write
   * @param {boolean} isAppend - Whether to append instead of overwrite
   * @returns {Promise<Object>} Resolves with the writer
   */
  writeFile(fileEntry, dataObj, isAppend) {
    return new Promise((resolve, reject) => {
      fileEntry.createWriter(
        writer => {
          writer.write(dataObj, () => resolve(writer), reject);
        },
        err => reject(err)
      );
    });
  }

  /**
   * Deletes a file from the filesystem.
   * @param {NeutralinoFileEntry} fileEntry - The file entry to delete
   * @returns {Promise<boolean>} Resolves true once the file is removed
   */
  deleteFile(fileEntry) {
    return Neutralino.filesystem.remove(this.resolvePath(fileEntry.fullPath))
      .then(() => true);
  }

  /**
   * Creates a new subdirectory inside a parent directory.
   * @param {NeutralinoDirectoryEntry} rootDirEntry - The parent directory
   * @param {string} dirName - The directory name to create
   * @returns {Promise<NeutralinoDirectoryEntry>} Resolves with the new directory entry
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

/** @type {string} URL prefix where the base directory is mounted in the Neutralino HTTP server */
NeutralinoFileSystem.MOUNT_URL = '/pmfs';
/** @type {Promise<boolean>|null} Shared mount promise (server.mount is idempotent per path) */
NeutralinoFileSystem.mountPromise = null;
