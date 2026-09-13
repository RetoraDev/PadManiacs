/**
 * @class FileSelect
 * @category Game States
 * @summary File system browser with navigation history and extension filtering
 * @constructor
 * @description
 * A navigable file and directory browser presented as a carousel menu. It lets the
 * caller open, rename, or pick files by providing extension filters and selection and
 * cancel callbacks, keeps a navigation history to go back to parent folders, and
 * persists its current position so the state can be restored after navigating away.
 * @example
 * // Open the browser to a folder of screenshots (.png) and act on selection.
 * game.state.add('FileSelect', FileSelect);
 * game.state.start('FileSelect', true, false, ['png'],
 *   entry => console.log('Selected', entry), () => console.log('Cancelled'));
 */
class FileSelect {
  /**
   * Stores the extension filter, selection/cancel callbacks, and navigation defaults,
   * restoring a previously saved file browser state if present.
   * @param {Array<string>|null} [extensions] - Allowed file extensions, or null to show all files
   * @param {Function|null} [onSelect] - Callback invoked when a file is selected
   * @param {Function|null} [onCancel] - Callback invoked when browsing is cancelled
   * @param {boolean} [allowCancel] - Whether the back/cancel action completes the state
   */
  init(extensions = null, onSelect = null, onCancel = null, allowCancel = true) {
    /** @type {Array<string>|null} Allowed file extensions, or null for any file */
    this.extensions = extensions;
    /** @type {Function|null} Callback invoked when a file is selected */
    this.onSelect = onSelect;
    /** @type {Function|null} Callback invoked when browsing is cancelled */
    this.onCancel = onCancel;
    /** @type {boolean} Whether the back/cancel action completes the state */
    this.allowCancel = allowCancel;
    /** @type {string} Full path of the directory currently being browsed */
    this.currentPath = '';
    /** @type {Object|null} File entry for the current directory */
    this.currentDir = null;
    /** @type {Array<Object>} Stack of previously visited directories */
    this.history = [];
    /** @type {FileSystemTools} Helper for listing and reading directories */
    this.fileSystem = new FileSystemTools();
    
    if (window.fileSelectState) {
      this.restoreState(window.fileSelectState);
    }
  }

  /**
   * Builds the file browser UI: fades in the camera, adds the background layers and
   * navigation hint, creates the path and empty-folder texts, and loads the current
   * directory into the carousel.
   */
  create() {
    game.camera.fadeIn(0x000000);
    
    this.backgroundGradient = new BackgroundGradient();
    this.futuristicLines = new FuturisticLines();
    this.navigationHint = new NavigationHint([
      { position: "left", icon: "cursor", text: __("NAVIGATE||NAVEGAR") },
      { position: "right", icon: "a", text: __("SELECT||SELECCIONAR") },
      { position: "right", icon: "b", text: this.allowCancel ? __("BACK/CANCEL||VOLVER/CANCELAR") : __("BACK||VOLVER") }
    ]);
    
    this.pathText = new Text(4, 4, __("PATH: /||RUTA: /"), FONTS.default);
    this.pathText.wrap(180);
    
    this.emptyFolderText = new Text(game.width / 2, game.height / 2, __("This folder is empty||Esta carpeta está vacía"), FONTS.shaded);
    this.emptyFolderText.anchor.set(0.5);
    this.emptyFolderText.visible = false;
    
    this.loadDirectory();
  }

  /**
   * Persists the browser position (current path, selection, scroll offset, filters, and
   * history) to window.fileSelectState so the state can be restored later.
   */
  saveState() {
    window.fileSelectState = {
      currentPath: this.currentDir ? this.currentDir.fullPath : '/',
      selectedIndex: this.carousel ? this.carousel.selectedIndex : 0,
      scrollOffset: this.carousel ? this.carousel.scrollOffset : 0,
      extensions: this.extensions,
      history: this.history.map(dir => dir ? dir.fullPath : null)
    };
  }

  /**
   * Applies a previously saved file browser state to this instance, restoring the path,
   * history, selection index, and scroll offset for the next load.
   * @param {Object} state - Saved state object previously written by saveState
   */
  restoreState(state) {
    if (state.extensions) {
      this.extensions = state.extensions;
    }
    if (state.history) {
      this._restoreHistory = state.history;
    }
    if (state.selectedIndex !== undefined) {
      this._restoreSelectedIndex = state.selectedIndex;
    }
    if (state.scrollOffset !== undefined) {
      this._restoreScrollOffset = state.scrollOffset;
    }
    if (state.currentPath) {
      this._restorePath = state.currentPath;
    }
  }

  /**
   * Lists the entries of the given (or root/file-system default) directory, filters them
   * by the extension whitelist, builds a sorted carousel menu with parent navigation,
   * restores any saved selection, and refreshes the path display.
   * @param {Object|null} [dirEntry] - Directory to browse, or null to browse the default path
   * @returns {Promise<void>} Resolves once the directory has been loaded into the carousel
   */
  async loadDirectory(dirEntry = null) {
    this.emptyFolderText.visible = false;
    
    if (this.loadingDots) this.loadingDots.destroy();
    this.loadingDots = new LoadingDots();
    this.loadingDots.y -= 8;
    
    if (this.carousel) {
      this.carousel.destroy();
    }
    
    let entries = [];
    
    try {
      if (dirEntry === null) {
        if (this._restorePath && this._restorePath !== '/') {
          try {
            this.currentDir = await this.fileSystem.getDirectory(this._restorePath);
            entries = await this.fileSystem.listDirectories(this.currentDir);
            const files = await this.fileSystem.listFiles(this.currentDir);
            entries = [...entries, ...files];
            this._restorePath = null;
          } catch (e) {
            this.currentDir = await this.fileSystem.getDirectory('');
            entries = await this.fileSystem.listDirectories(this.currentDir);
            const files = await this.fileSystem.listFiles(this.currentDir);
            entries = [...entries, ...files];
          }
        } else {
          this.currentDir = await this.fileSystem.getDirectory('');
          entries = await this.fileSystem.listDirectories(this.currentDir);
          const files = await this.fileSystem.listFiles(this.currentDir);
          entries = [...entries, ...files];
        }
      } else {
        this.currentDir = dirEntry;
        const dirs = await this.fileSystem.listDirectories(this.currentDir);
        const files = await this.fileSystem.listFiles(this.currentDir);
        entries = [...dirs, ...files];
      }
    } catch (error) {
      console.error("Failed to load directory:", error);
      this.loadingDots.destroy();
      this.loadingDots = null;
      this.showError(__("Cannot access file system||No se puede acceder al sistema de archivos"));
      return;
    }
  
    this.loadingDots.destroy();
    this.loadingDots = null;
  
    if (this.extensions !== null) {
      entries = entries.filter(entry => {
        if (entry.isDirectory) return true;
        const ext = FileTools.getExtension(entry.name);
        return this.extensions.includes(ext);
      });
    }
    
    const directories = entries.filter(e => e.isDirectory);
    const files = entries.filter(e => e.isFile);
    
    directories.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));
    
    const sortedEntries = [...directories, ...files];
    
    this.carousel = new CarouselMenu(0, 16, game.width, game.height - 24, {
      bgcolor: '#2c3e50',
      fgcolor: '#ffffff',
      align: 'left',
      animate: true,
      disableCancel: !this.allowCancel
    });
    
    this.carousel.onCancel.add(() => {
      if (this.history.length > 0) {
        this.goBack();
      } else if (this.allowCancel && this.onCancel) {
        this.onCancel();
        game.state.start("MainMenu");
      } else if (this.allowCancel) {
        game.state.start("MainMenu");
      }
    });
    
    if (this._restoreHistory) {
      for (const path of this._restoreHistory) {
        if (path) {
          try {
            const dir = await this.fileSystem.getDirectory(path);
            this.history.push(dir);
          } catch (e) {}
        }
      }
      this._restoreHistory = null;
    }
    
    let parentAdded = false;
    if (this.history.length > 0 || (this.currentDir && this.currentDir.fullPath !== '/')) {
      this.carousel.addItem("..", () => this.goToParent(), {
        entry: null,
        icon: 4,
        isParent: true,
        bgcolor: '#34495e'
      });
      parentAdded = true;
    }
    
    let itemIndex = parentAdded ? 1 : 0;
    const fileIcons = {
      wav: 3,
      mp3: 3,
      ogg: 3,
      wma: 3,
      sm: 5,
      scc: 5,
      zip: 5
    };
    
    sortedEntries.forEach(entry => {
      const ext = FileTools.getExtension(entry.name);
      this.carousel.addItem(entry.name, () => this.onEntrySelected(entry), {
        entry: entry,
        icon: entry.isDirectory ? 2 : fileIcons[ext] || 1,
        isDirectory: entry.isDirectory,
        bgcolor: entry.isDirectory ? '#2980b9' : '#8e44ad',
        index: itemIndex
      });
      itemIndex++;
    });
    
    if (sortedEntries.length === 0 && (!this.history.length && this.currentDir && this.currentDir.fullPath === '/')) {
      this.emptyFolderText.visible = true;
    }
    
    if (this._restoreSelectedIndex !== undefined && this.carousel.items.length > this._restoreSelectedIndex) {
      this.carousel.selectIndex(this._restoreSelectedIndex);
      this._restoreSelectedIndex = undefined;
    }
    if (this._restoreScrollOffset !== undefined) {
      this.carousel.scrollOffset = this._restoreScrollOffset;
      this._restoreScrollOffset = undefined;
    }
    
    this.updatePathDisplay();
    this.saveState();
  }
  
  /**
   * Handles a carousel selection: directories are pushed into history and opened, while
   * files are selected through the onSelect callback or advance to the main menu.
   * @param {Object} entry - File or directory entry that was selected
   */
  onEntrySelected(entry) {
    if (entry.isDirectory) {
      this.history.push(this.currentDir);
      this.loadDirectory(entry);
    } else {
      this.saveState();
      if (this.onSelect) {
        this.onSelect(entry);
      } else {
        game.state.start("MainMenu");
      }
    }
  }
  
  /**
   * Navigates up one level, either to the previously visited directory from history or
   * to the parent of the current path.
   * @returns {Promise<void>} Resolves once the parent directory has been loaded
   */
  async goToParent() {
    if (this.history.length > 0) {
      const parent = this.history.pop();
      this.loadDirectory(parent);
    } else if (this.currentDir && this.currentDir.fullPath !== '/') {
      const parentPath = this.currentDir.fullPath.split('/').slice(0, -1).join('/') || '/';
      try {
        const parentDir = await this.fileSystem.getDirectory(parentPath);
        this.loadDirectory(parentDir);
      } catch (error) {
        console.error("Failed to navigate to parent:", error);
      }
    }
  }
  
  /**
   * Pops the most recent directory from history and reloads it.
   */
  goBack() {
    if (this.history.length > 0) {
      const previous = this.history.pop();
      this.loadDirectory(previous);
    }
  }
  
  /**
   * Rewrites the path label with the current directory's full path, wrapping the text
   * to fit the screen width.
   */
  updatePathDisplay() {
    let path = this.currentDir ? this.currentDir.fullPath : '/';
    if (path === '') path = '/';
    this.pathText.write(__("PATH: ||RUTA: ") + path);
    this.pathText.wrap(240 - 10);
  }
  
  /**
   * Cleans up the browser UI and shows an error message, returning to the main menu
   * after a short delay.
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.loadingDots?.destroy();
    this.carousel?.destroy();
    
    const errorText = new Text(game.width / 2, game.height / 2, message, FONTS.shaded);
    errorText.anchor.set(0.5);
    
    game.time.events.add(2000, () => {
      errorText.destroy();
      game.state.start("MainMenu");
    });
  }
  
  /**
   * Called each frame; refreshes the gamepad state so carousel navigation stays responsive.
   */
  update() {
    gamepad.update();
  }
  
  /**
   * Runs when the state is shut down: saves the browser position and destroys the
   * loading dots and carousel widgets.
   */
  shutdown() {
    this.saveState();
    
    if (this.loadingDots) this.loadingDots.destroy();
    if (this.carousel) this.carousel.destroy();
  }
}