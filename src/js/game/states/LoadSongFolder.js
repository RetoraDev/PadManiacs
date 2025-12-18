class LoadSongFolder {
  create() {
    this.progressText = new ProgressText("SELECT SONG FOLDER");

    this.parser = new ExternalSMParser();
    this.showFileInput();
  }

  showFileInput() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.webkitdirectory = true;
    fileInput.multiple = true;

    fileInput.onchange = e => {
      this.processFiles(e.target.files);
    };
    
    fileInput.oncancel = e => {
      this.showError("Nothing selected");
    };

    // Add a fallback for non-webkit browsers
    if (!fileInput.webkitdirectory) {
      fileInput.multiple = true;
      this.progressText.write("Select all song files");
    }

    fileInput.click();
  }

  async processFiles(files) {
    try {
      this.progressText.write("LOADING SONG...");
      
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
        this.showError("No .sm file found in selected folder");
        return;
      }

      const smFileName = chartFileNames[0];
      const content = await this.parser.readFileContent(fileMap[smFileName]);

      const chart = await this.parser.parseSM(fileMap, content);
      
      if (chart.error) {
        this.showError("Error in SM file");
        return;
      }
      
      chart.folderName = `Single_External_${smFileName}`;
      chart.loaded = true;

      // Start gameplay directly with this single song
      game.state.start("SongSelect", true, false, [ chart ], 0, true);
    } catch (error) {
      console.error("Error loading song folder:", error);
      this.showError("Failed to load song");
    }
  }
  
  async processZipFile(file) {
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
    await this.processZipContent(zipContent);
  }

  async processZipContent(zipContent) {
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
      this.showError("No .sm file found in ZIP");
      return;
    }

    // Parse SM file
    const smContent = await smFile.async("text");
    const basePath = smFilename.split("/").slice(0, -1).join("/");
    const chart = await new LocalSMParser().parseSM(smContent, basePath);

    if (chart.error) {
      this.showError("Error in SM file");
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
          chart.lyricsContent = this.files.lyrics;
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
    
    // Start gameplay directly with this single song
    game.state.start("SongSelect", true, false, [ chart ], 0, true);
  }  
  
  showError(message) {
    this.progressText.write(message);
    game.time.events.add(3000, () => {
      game.state.start("MainMenu");
    });
  }
}
