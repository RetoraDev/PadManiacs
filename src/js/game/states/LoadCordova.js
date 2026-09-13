/**
 * @class LoadCordova
 * @category Game States
 * @summary Initialize Cordova on mobile devices, initialize file system
 * @constructor
 * @description
 * A conditional startup state that runs before any external storage is accessed. When
 * the game is running inside a Cordova environment the Cordova script is injected and
 * the filesystem is created once the device is ready; on other platforms the game
 * proceeds straight to building the required directory structure.
 * @example
 * // Added to the boot chain so storage directories exist before song loading.
 * game.state.add('LoadCordova', LoadCordova);
 * game.state.start('LoadCordova');
 */
class LoadCordova {
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
  /**
   * Advances to the LoadAddons state to continue the startup sequence.
   */
  continue() {
    game.state.start("LoadAddons");
  }
}
