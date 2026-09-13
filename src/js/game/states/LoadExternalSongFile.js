/**
 * @class LoadExternalSongFile
 * @category Game States
 * @summary Loads a single external song file or ZIP archive
 * @constructor
 * @description
 * Loads one individually chosen song from external storage. Given a chart filename and
 * its directory, it parses the .sm/.ssc chart directly, or unzips a .zip archive and
 * imports its chart and associated assets before handoff.
 * @example
 * // Load an individual song file and jump straight to the song select screen.
 * game.state.add('LoadExternalSongFile', LoadExternalSongFile);
 * game.state.start('LoadExternalSongFile', true, false, 'down.sm', 'Songs/Folder');
 */
class LoadExternalSongFile {
  /**
   * Stores the target file name, its directory path, and the next state to start once
   * the song has been loaded.
   * @param {string} fileName - Name of the chart or .zip file to load
   * @param {string} filePath - Directory path that contains the file
   * @param {string} [nextState] - Game state key to start after loading finishes
   * @param {Array} [nextStateParams] - Parameters forwarded to the next state
   */
  init(fileName, filePath, nextState, nextStateParams) {
    /** @type {string} Name of the chart or .zip file to load */
    this.fileName = fileName;
    /** @type {string} Directory path that contains the file */
    this.filePath = filePath;
    /** @type {string} Game state key to start once the song is loaded */
    this.nextState = nextState || 'SongSelect';
    /** @type {Array} Parameters forwarded to the next state */
    this.nextStateParams = nextStateParams || [];
  }
  
  /**
   * Sets up the loading UI, file system access, and chart parser, then dispatches to
   * ZIP or plain song loading depending on the file extension.
   */
  create() {
    /** @type {LoadingDots} Animated loading indicator dots */
    this.loadingDots = new LoadingDots();
    
    /** @type {ProgressText} Bilingual progress text shown while the song loads */
    this.progressText = new ProgressText(__("Loading Song...||Cargando canción..."));

    /** @type {FileSystemTools} Helper for reading directories and files */
    this.fileSystem = new FileSystemTools();
    /** @type {ExternalSMParser} Parser used to read external chart files */
    this.parser = new ExternalSMParser();
    
    if (this.fileName.endsWith('.zip')) {
      this.loadZipFileData();
    } else {
      this.loadSongData();
    }
  }
  
  /**
   * Reads every file in the song directory, locates the requested chart file, and parses
   * it, finishing the state on success or showing an error otherwise.
   * @returns {Promise<void>} Resolves once the chart has been parsed or rejected
   */
  async loadSongData() {
    const dirEntry = await this.fileSystem.getDirectory(this.filePath);
          
    const files = await this.fileSystem.listFiles(dirEntry);
    const chartFiles = {};

    for (const fileEntry of files) {
      const file = await this.fileSystem.getFile(fileEntry);
      chartFiles[file.name.toLowerCase()] = file;
    }
    
    try {
      const smFile = chartFiles[this.fileName.toLowerCase()];
      
      // Try to parse the chart file
      const content = await this.fileSystem.readFileContent(smFile);
      const chart = await this.parser.parseSM(chartFiles, content);
      
      if (chart && chart.difficulties && chart.difficulties.length > 0) {
        // Chart file parsed successfully
        chart.folderName = dirEntry.name || `External_Song_${this.fileName.toLowerCase()}`;
        chart.isExternal = true;
        chart.loaded = true;
        this.finish(chart);
        return;
      }
    } catch (parseError) {
      // Failed to parse, abort
      this.showError(__(`(Failed to parse|Error al analizar): ${this.fileName}`));
      console.warn(`Failed to parse ${this.fileName}:`, parseError);
      return;
    }
    
    this.showError(__(`(Failed to parse|Error al analizar): ${this.fileName}`));
  }
  
  /**
   * Reads the requested .zip archive, decompresses it with JSZip, and imports the chart
   * plus its assets using the shared ZIP processing routine from LoadSongFolder.
   * @returns {Promise<void>} Resolves once the ZIP has been processed or rejected
   */
  async loadZipFileData() {
    const dirEntry = await this.fileSystem.getDirectory(this.filePath);
          
    const files = await this.fileSystem.listFiles(dirEntry);
    
    let file = null;

    for (const fileEntry of files) {
      if (fileEntry.name == this.fileName) {
        file = await this.fileSystem.getFile(fileEntry);
        break;
      }
    }
    
    if (file) {
      file = await FileTools.readBinaryFile(file);
    }
    
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
    await LoadSongFolder.prototype.processZipContent.call(this, zipContent, chart => this.finish(chart));
  }
  
  /**
   * Writes an error message and returns to the main menu after a short delay.
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.progressText.write(message);
    game.time.events.add(3000, () => {
      game.state.start("MainMenu");
    });
  }
  
  /**
   * Starts the next state with the loaded chart (or a single-element array) and any
   * stored parameters, or shows an error if no chart was produced.
   * @param {Object|null} [chart] - The parsed chart to hand to the next state
   */
  finish(chart = null) {
    if (!chart) {
      this.showError(__("Couldn't load song||No se pudo cargar la canción"));
      return;
    }
    
    if (this.nextStateParams.length) {
      game.state.start(this.nextState, true, false, chart, ...this.nextStateParams);
    } else {
      game.state.start(this.nextState, true, false, [ chart ], null, false, "external");
    }
  }
}