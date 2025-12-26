class LoadCordova {
  create() {
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA && typeof window.cordova == 'undefined') {
      this.loadScript();
    } else {
      this.createFolderStructure();
    }
  }
  loadScript() {
    this.loadingDots = new LoadingDots();
    
    this.progressText = new ProgressText("INITIALIZING FILESYSTEM");
    
    const script = document.createElement("script");
    script.src = "./cordova/cordova.js";
    document.head.appendChild(script);
    document.addEventListener("deviceready", () => {
      this.createFolderStructure();
      document.addEventListener("backbutton", () => {
        if (game.state.current == "Play") {
          gamepad.press('start');
        } else {
          gamepad.press('b');
        }
      });
    });
  }
  async createFolderStructure() {
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      const fileSystem = new FileSystemTools();
      
      const rootDir = await fileSystem.getDirectory("");
      
      const gameDir = await fileSystem.createDirectory(rootDir, EXTERNAL_DIRECTORY);
      
      await fileSystem.createDirectory(gameDir, ADDONS_DIRECTORY);
      await fileSystem.createDirectory(gameDir, SCREENSHOTS_DIRECTORY);
      await fileSystem.createDirectory(gameDir, SONGS_DIRECTORY);
      await fileSystem.createDirectory(gameDir, EDITOR_OUTPUT_DIRECTORY);
    }
    this.continue();
  }
  continue() {
    game.state.start("LoadAddons");
  }
}
