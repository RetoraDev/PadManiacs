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

  listDirectories(dirEntry) {
    return new Promise((resolve, reject) => {
      dirEntry.createReader().readEntries(
        entries => resolve(entries.filter(e => e.isDirectory)),
        err => reject(err)
      );
    });
  }

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
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
  
  saveFile(dirEntry, fileData, fileName) {
    return new Promise((resolve, reject) => {
      dirEntry.getFile(fileName, { create: true, exclusive: false }, fileEntry => {
        this.writeFile(fileEntry, fileData)
          .then(() => resolve(fileEntry))
          .catch(err => reject(err));
      }, error => reject(error));
    });
  }
  
  createEmptyFile(dirEntry, fileName, isAppend) {
    return new Promise((resolve, reject) => {
      dirEntry.getFile(fileName, {create: true, exclusive: false}, fileEntry => {
        this.writeFile(fileEntry, null, isAppend)
          .then(() => resolve(fileEntry))
          .catch(err => reject(err));
      }, err => reject(err));
    });
  }
  
  writeFile(fileEntry, dataObj, isAppend) {
    return new Promise((resolve, reject) => {
      fileEntry.createWriter(fileWriter => {
        fileWriter.onwrite = () => resolve(fileWriter);
        fileWriter.onerror = err => reject(err);
  
        fileWriter.write(dataObj);
      });
    });
  }
  
  createDirectory(rootDirEntry, dirName) {
    return new Promise((resolve, reject) => {
      rootDirEntry.getDirectory(dirName, { create: true }, dirEntry => {
        resolve(dirEntry);
      }, err => reject(err));
    });
  }
}
