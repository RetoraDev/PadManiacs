/**
 * @class PadManiacsJSON
 * @category Parser Classes
 * @summary Read/write PadManiacs sidecar data (padmaniacs.json)
 * @constructor
 * @features
 * Loads and saves padmaniacs.json alongside chart files without contaminating .SM
 * Stores editor markers (beat positions) and is extensible for future data
 * Works with FileSystemTools on external/NW.js/Cordova storage and with file maps
 * Can be embedded in and restored from .zip imports/exports
 * @description
 * Provides a small sidecar format for PadManiacs-specific metadata that should not
 * live inside StepMania .SM files. Currently stores editor time markers as a list of
 * beat positions.
 */
class PadManiacsJSON {
  static get FILENAME() { return "padmaniacs.json"; }

  static createEmpty() {
    return { version: 1, markers: [] };
  }

  static parse(content) {
    if (!content) return this.createEmpty();
    try {
      const data = typeof content === "string" ? JSON.parse(content) : content;
      if (!data || typeof data !== "object") return this.createEmpty();
      const markers = Array.isArray(data.markers) ? data.markers : [];
      return {
        version: data.version || 1,
        markers: markers
          .map(m => {
            if (typeof m === "number") return { beat: m };
            if (m && typeof m === "object" && typeof m.beat === "number") return { beat: m.beat };
            return null;
          })
          .filter(m => m && isFinite(m.beat))
      };
    } catch (e) {
      return this.createEmpty();
    }
  }

  static stringify(data) {
    const out = data && typeof data === "object" ? data : this.createEmpty();
    if (!Array.isArray(out.markers)) out.markers = [];
    if (!out.version) out.version = 1;
    return JSON.stringify(out, null, 2);
  }

  static async loadFromDirectory(fileSystem, dirEntry) {
    try {
      const files = await fileSystem.listFiles(dirEntry);
      const entry = files.find(f => f.name && f.name.toLowerCase() === this.FILENAME);
      if (!entry) return this.createEmpty();
      const file = await fileSystem.getFile(entry);
      const content = await fileSystem.readFileContent(file);
      return this.parse(content);
    } catch (e) {
      return this.createEmpty();
    }
  }

  static async saveToDirectory(fileSystem, dirEntry, data) {
    try {
      const content = this.stringify(data);
      await fileSystem.saveFile(dirEntry, content, this.FILENAME);
      return true;
    } catch (e) {
      console.warn("Failed to save padmaniacs.json:", e);
      return false;
    }
  }

  static async loadFromFileMap(files) {
    if (!files) return this.createEmpty();
    try {
      const key = Object.keys(files).find(k => k.toLowerCase() === this.FILENAME);
      if (!key) return this.createEmpty();
      const file = files[key];
      let content = null;
      if (typeof file === "string") content = file;
      else if (typeof FileTools !== "undefined" && FileTools.readTextFile) content = await FileTools.readTextFile(file);
      else if (file && typeof file.text === "function") content = await file.text();
      return this.parse(content);
    } catch (e) {
      return this.createEmpty();
    }
  }

  static async loadFromZip(zipContent) {
    try {
      let entry = zipContent.file(this.FILENAME);
      if (!entry) {
        zipContent.forEach((relativePath, file) => {
          if (!entry && relativePath.split('/').pop().toLowerCase() === PadManiacsJSON.FILENAME) {
            entry = file;
          }
        });
      }
      if (!entry) return this.createEmpty();
      const content = await entry.async("text");
      return this.parse(content);
    } catch (e) {
      return this.createEmpty();
    }
  }
}
