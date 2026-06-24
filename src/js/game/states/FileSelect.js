class FileSelect {
  init(extensions = null, onSelect = null, onCancel = null, allowCancel = true) {
    this.extensions = extensions;
    this.onSelect = onSelect;
    this.onCancel = onCancel;
    this.allowCancel = allowCancel;
    this.currentPath = '';
    this.currentDir = null;
    this.history = []; // Stack for navigation history
    this.fileSystem = new FileSystemTools();
    
    // Restore state from window if exists
    if (window.fileSelectState) {
      this.restoreState(window.fileSelectState);
    }
  }

  create() {
    game.camera.fadeIn(0x000000);
    
    this.backgroundGradient = new BackgroundGradient();
    this.futuristicLines = new FuturisticLines();
    this.navigationHint = new NavigationHint([
      { position: "left", icon: "cursor", text: "NAVIGATE" },
      { position: "right", icon: "a", text: "SELECT" },
      { position: "right", icon: "b", text: this.allowCancel ? "BACK/CANCEL" : "BACK" }
    ]);
    
    this.pathText = new Text(4, 4, "PATH: /", FONTS.default);
    this.pathText.wrap(180);
    
    this.emptyFolderText = new Text(game.width / 2, game.height / 2, "This folder is empty", FONTS.shaded);
    this.emptyFolderText.anchor.set(0.5);
    this.emptyFolderText.visible = false;
    
    this.loadDirectory();
  }

  // Save current state to window
  saveState() {
    window.fileSelectState = {
      currentPath: this.currentDir ? this.currentDir.fullPath : '/',
      selectedIndex: this.carousel ? this.carousel.selectedIndex : 0,
      scrollOffset: this.carousel ? this.carousel.scrollOffset : 0,
      extensions: this.extensions,
      history: this.history.map(dir => dir ? dir.fullPath : null)
    };
  }

  // Restore state from window
  restoreState(state) {
    if (state.extensions) {
      this.extensions = state.extensions;
    }
    // History will be restored after loading directory
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
        // Check if we have a restored path
        if (this._restorePath && this._restorePath !== '/') {
          try {
            this.currentDir = await this.fileSystem.getDirectory(this._restorePath);
            entries = await this.fileSystem.listDirectories(this.currentDir);
            const files = await this.fileSystem.listFiles(this.currentDir);
            entries = [...entries, ...files];
            this._restorePath = null;
          } catch (e) {
            // If path doesn't exist, fallback to root
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
      this.showError("Cannot access file system");
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
    
    // Restore history
    if (this._restoreHistory) {
      for (const path of this._restoreHistory) {
        if (path) {
          try {
            const dir = await this.fileSystem.getDirectory(path);
            this.history.push(dir);
          } catch (e) {
            // Skip invalid paths
          }
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
    
    // Restore selection
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
  
  onEntrySelected(entry) {
    if (entry.isDirectory) {
      this.history.push(this.currentDir);
      this.loadDirectory(entry);
    } else {
      // Save state before leaving
      this.saveState();
      if (this.onSelect) {
        this.onSelect(entry);
      } else {
        game.state.start("MainMenu");
      }
    }
  }
  
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
  
  goBack() {
    if (this.history.length > 0) {
      const previous = this.history.pop();
      this.loadDirectory(previous);
    }
  }
  
  updatePathDisplay() {
    let path = this.currentDir ? this.currentDir.fullPath : '/';
    if (path === '') path = '/';
    this.pathText.write("PATH: " + path);
    this.pathText.wrap(240 - 10);
  }
  
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
  
  update() {
    gamepad.update();
  }
  
  shutdown() {
    // Save state when leaving
    this.saveState();
    
    if (this.loadingDots) this.loadingDots.destroy();
    if (this.carousel) this.carousel.destroy();
  }
}