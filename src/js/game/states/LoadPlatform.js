/**
 * @class LoadPlatform
 * @category Game States
 * @summary Initialize platform (Cordova, Neutralino) and file system
 * @constructor
 * @description
 * A conditional startup state that runs before any external storage is accessed. When
 * the game is running inside a Cordova environment the Cordova script is injected and
 * the filesystem is created once the device is ready; on Neutralino it initializes the
 * Neutralino client and creates the required directory structure; on other platforms
 * it builds the folder structure immediately.
 * @example
 * // Added to the boot chain so storage directories exist before song loading.
 * game.state.add('LoadPlatform', LoadPlatform);
 * game.state.start('LoadPlatform');
 */
class LoadPlatform {
  /**
   * Detects the current environment: on Cordova it injects cordova.js and waits for
   * the device to be ready, otherwise it builds the folder structure immediately.
   */
  create() {
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA && typeof window.cordova == 'undefined') {
      this.loadScript();
    } else {
      this.createFolderStructure();
    }
  }
  /**
   * Shows the loading dots, injects the cordova.js script into the page, and registers
   * a back button handler for mobile devices once the Cordova device is ready.
   */
  loadScript() {
    this.loadingDots = new LoadingDots();
    
    this.progressText = new ProgressText(__("Initializing filesystem...||Inicializando Sistema de Archivos..."));

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
  /**
   * Creates the main storage directory along with its addons, screenshots, songs, and
   * editor output subdirectories, then continues to the next startup state.
   * @returns {Promise<void>} Resolves once the folders have been created
   */
  async createFolderStructure() {
    // Initialize Neutralino client if running in Neutralino environment
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.NEUTRALINO && window.Neutralino) {
      try {
        await Neutralino.init();
      } catch (e) {
        console.warn("Neutralino.init() failed:", e);
      }
    }
    
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NEUTRALINO) {
      this.fileSystemTools = new FileSystemTools();
      
      const fileSystem = this.fileSystemTools;
      
      const rootDir = await fileSystem.getDirectory("");
      
      const gameDir = await fileSystem.createDirectory(rootDir, EXTERNAL_DIRECTORY);
      
      await fileSystem.createDirectory(gameDir, ADDONS_DIRECTORY);
      await fileSystem.createDirectory(gameDir, SCREENSHOTS_DIRECTORY);
      await fileSystem.createDirectory(gameDir, SONGS_DIRECTORY);
      await fileSystem.createDirectory(gameDir, EDITOR_OUTPUT_DIRECTORY);
      
      this.checkFfmpegBundle();
    } else {
      this.continue();
    }
  }
  
  /**
   * Check if the bundled ffmpeg lib needs to be copied to external folder and copies them
   */
  async checkFfmpegBundle() {
    const fileSystem = this.fileSystemTools;
    
    const gameDir = await fileSystem.getDirectory(EXTERNAL_DIRECTORY);
    
    const ffDir = await fileSystem.createDirectory(gameDir, FF_DIR_NAME);
    
    window.ff_bundle_dir = ffDir.nativeURL || window.ff_dir;
    
    // Check ffmpeg-wasm-lite files 
    const fileNames = [
      "ffmpeg-core.js",
      "ffmpeg-core.wasm",
      "ffmpeg-worker.js"
    ];
    const presentFileNames = [];
    
    const entries = await fileSystem.listFiles(ffDir);
    
    entries.forEach(fileEntry => {
      presentFileNames.push(fileEntry.name);
    });
    
    const filesToCopy = fileNames.filter(n => !presentFileNames.includes(n));
     
    for (const fileName of filesToCopy) {
      const file = await fetch(window.ff_dir + fileName);
      const blob = await file.blob();
      
      this.progressText.write(__(`(Copying|Copiando) ${fileName}`));
      
      await fileSystem.saveFile(ffDir, blob, fileName);
    }
    
    this.continue();
  }

  /**
   * Advances to the LoadAddons state to continue the startup sequence.
   */
  continue() {
    game.state.start("LoadAddons");
  }
}
