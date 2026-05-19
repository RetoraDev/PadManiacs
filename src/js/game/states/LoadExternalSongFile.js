class LoadExternalSongFile {
  init(fileName, filePath, nextState, nextStateParams) {
    this.fileName = fileName;
    this.filePath = filePath;
    this.nextState = nextState || 'SongSelect';
    this.nextStateParams = nextStateParams || [];
  }
  
  create() {
    this.loadingDots = new LoadingDots();
    
    this.progressText = new ProgressText("LOADING SONG DATA");
    
    this.fileSystem = new FileSystemTools();
    this.parser = new ExternalSMParser();
    
    if (this.fileName.endsWith('.zip')) {
      this.loadZipFileData();
    } else {
      this.loadSongData();
    }
  }
  
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
        chart.loaded = true;
        this.finish(chart);
        return;
      }
    } catch (parseError) {
      // Failed to parse, continue loading next chart
      this.showError(`Failed to parse ${this.fileName}:`);
      console.warn(`Failed to parse ${this.fileName}:`, parseError);
      return;
    }
    
    this.showError(`Failed to parse ${this.fileName}`);
  }
  
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
      this.showError("Couldn't load ZIP file");
      throw new Error("JSZip library not loaded");
    }
    
    if (!file) {
      this.showError("Couldn't load ZIP file");
      throw new Error("Undefined .zip file");
    }
    
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);

    // Import the project
    await LoadSongFolder.prototype.processZipContent.call(this, zipContent, chart => this.finish(chart));
  }
  
  showError(message) {
    this.progressText.write(message);
    game.time.events.add(3000, () => {
      game.state.start("MainMenu");
    });
  }
  
  finish(chart = null) {
    if (!chart) {
      this.showError("Couldn't load song");
      return;
    }
    
    if (this.nextStateParams.length) {
      game.state.start(this.nextState, true, false, chart, ...this.nextStateParams);
    } else {
      game.state.start(this.nextState, true, false, [ chart ], null, false, "external");
    }
  }
}