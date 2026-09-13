/**
 * @class LoadSongFolder
 * @category Game States
 * @summary Loads a single song via file input
 * @constructor
 * @description
 * Lets the user select a song folder (or a .zip archive) through a native file picker
 * and plays the resulting chart immediately. It locates and parses a .sm chart from the
 * chosen files, extracting audio, background, banner, lyrics, and BG change assets from
 * the ZIP when applicable, and starts SongSelect with the single chart.
 * @example
 * // Opens a file picker so the player can select a folder or ZIP to play.
 * game.state.add('LoadSongFolder', LoadSongFolder);
 * game.state.start('LoadSongFolder');
 */
class LoadSongFolder {
  /**
   * Shows the folder selection progress text, prepares the parser, and opens the
   * native directory picker.
   */
  create() {
    /** @type {ProgressText} Bilingual progress text shown while a folder is selected */
    this.progressText = new ProgressText(__("Select Song Folder...||Seleccionar carpeta..."));
    
    /** @type {ExternalSMParser} Parser used to read the selected chart files */
    this.parser = new ExternalSMParser();
    this.showFileInput();
  }

  /**
   * Creates and opens a webkitdirectory file input, wiring up selection to processFiles
   * and cancellation to an error message, with a fallback hint for non-webkit browsers.
   */
  showFileInput() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.webkitdirectory = true;
    fileInput.multiple = true;

    fileInput.onchange = e => {
      this.processFiles(e.target.files);
    };
    
    fileInput.oncancel = e => {
      this.showError(__("Nothing selected||Nada seleccionado"));
    };

    // Add a fallback for non-webkit browsers
    if (!fileInput.webkitdirectory) {
      fileInput.multiple = true;
      this.progressText.write(__("Select all song files||Seleccionar todos los archivos"));
    }

    fileInput.click();
  }

  /**
   * Handles the picked files: dispatches a .zip to the ZIP processor, otherwise locates
   * and parses the first .sm chart and starts SongSelect with that single song.
   * @param {FileList} files - Files chosen from the directory picker
   * @returns {Promise<void>} Resolves once the song has been parsed or rejected
   */
  async processFiles(files) {
    try {
      this.progressText.write(__("Loading Song...||Cargando canción..."));
      
      if (files[0].name.endsWith(".zip")) {
        this.processZipFile(files[0]);
        return;
      }

      const fileMap = {};
      for (let i = 0; i < files.length; i++) {
        fileMap[files[i].name.toLowerCase()] = files[i];
      }

      // Find .sm file
      const chartFileNames = Object.keys(fileMap).filter(name => name.endsWith(".sm"));

      if (chartFileNames.length === 0) {
        this.showError(__("No .sm file found||No se encontró el archivo .sm"));
        return;
      }

      const smFileName = chartFileNames[0];
      const content = await this.parser.readFileContent(fileMap[smFileName]);

      const chart = await this.parser.parseSM(fileMap, content);
      
      if (chart.error) {
        this.showError(__("Error in SM file||Error en el archivo SM"));
        return;
      }
      
      chart.folderName = `Single_External_${smFileName}`;
      chart.isExternal = true;
      chart.loaded = true;

      // Start gameplay directly with this single song
      game.state.start("SongSelect", true, false, [ chart ], 0, true);
    } catch (error) {
      console.error("Error loading song folder:", error);
      this.showError("Failed to load song");
    }
  }
  
  /**
   * Decompresses the selected .zip with JSZip and imports its contents, starting
   * SongSelect with the first chart that is produced.
   * @param {File} file - The .zip archive chosen by the user
   * @returns {Promise<void>} Resolves once the ZIP has been processed or rejected
   */
  async processZipFile(file) {
    const JSZip = window.JSZip;
    if (!JSZip) {
      this.showError(__("Couldn't load ZIP file||No se pudo cargar el ZIP"));
      throw new Error("JSZip library not loaded");
    }
    
    if (!file) {
      this.showError(__("Couldn't load ZIP file||No se pudo cargar el ZIP"));
      throw new Error("Undefined .zip file");
    }
    
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);

    // Import the project
    await this.processZipContent(zipContent, chart => {
      // Start gameplay directly with this single song
      game.state.start("SongSelect", true, false, [ chart ], 0, true);
    });
  }

  /**
   * Extracts the first .sm chart found in a decompressed ZIP, loads its audio, background,
   * banner, lyrics, and BG change assets as object URLs, and invokes the callback with
   * the finished chart.
   * @param {Object} zipContent - JSZip archive object containing the song files
   * @param {Function} callback - Invoked with the fully loaded chart object
   * @returns {Promise<void>} Resolves once the chart and its assets have been loaded
   */
  async processZipContent(zipContent, callback) {
    // Find .sm file
    let smFile = null;
    let smFilename = null;

    zipContent.forEach((relativePath, file) => {
      if (relativePath.toLowerCase().endsWith(".sm") && !smFile) {
        smFile = file;
        smFilename = relativePath;
      }
    });

    if (!smFile) {
      this.showError(__("No .sm file found in ZIP||No se encontró el archivo .sm en el ZIP"));
      return;
    }

    // Parse SM file
    const smContent = await smFile.async("text");
    const basePath = smFilename.split("/").slice(0, -1).join("/");
    const chart = await new LocalSMParser().parseSM(smContent, basePath);

    if (chart.error) {
      this.showError(__("Error in SM file||Error en el archivo SM"));
      return;
    }

    chart.folderName = `Single_External_${smFilename}`;
    chart.loaded = true;
    
    // Helper function to find and load file from ZIP
    const loadFileFromZip = async (filename, targetProp) => {
      if (!filename) return null;

      // Try to find the file in ZIP
      let fileEntry = zipContent.file(filename);

      // If not found, try with relative path
      if (!fileEntry && basePath) {
        fileEntry = zipContent.file(basePath + "/" + filename);
      }

      // If still not found, search case-insensitive
      if (!fileEntry) {
        zipContent.forEach((relativePath, file) => {
          if (relativePath.toLowerCase().includes(filename.toLowerCase())) {
            fileEntry = file;
          }
        });
      }

      if (fileEntry) {
        const blob = await fileEntry.async("blob");
        
        // Create object URL for immediate use
        const objectUrl = URL.createObjectURL(blob);

        if (targetProp === "audio") {
          chart.audio = filename;
          chart.audioUrl = objectUrl;
        } else if (targetProp === "background") {
          chart.background = filename;
          chart.backgroundUrl = objectUrl;
        } else if (targetProp === "banner") {
          chart.banner = filename;
          chart.bannerUrl = objectUrl;
        } else if (targetProp === "lyrics") {
          chart.lyrics = filename;
          chart.lyricsContent = await fileEntry.async("text");
        }

        return objectUrl;
      }

      return null;
    };
    
    // Load main files
    await loadFileFromZip(chart.audio, "audio");
    await loadFileFromZip(chart.background, "background");
    await loadFileFromZip(chart.banner, "banner");
    await loadFileFromZip(chart.lyrics, "lyrics");

    // Load BG change files
    if (chart.backgrounds) {
      for (const bg of chart.backgrounds) {
        if (bg.file != "" && bg.file != "-nosongbg-") {
          bg.url = await loadFileFromZip(bg.file, "extra");
        }
      }
    }
    
    callback(chart);
  }  
  
  /**
   * Displays an error on the progress text and returns to the main menu after a delay.
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.progressText.write(message);
    game.time.events.add(3000, () => {
      game.state.start("MainMenu");
    });
  }
}
