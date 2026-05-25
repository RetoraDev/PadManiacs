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

  async loadDirectory(dirEntry = null) {
    this.emptyFolderText.visible = false;
    
    // Show loading indicator
    if (this.loadingDots) this.loadingDots.destroy();
    this.loadingDots = new LoadingDots();
    this.loadingDots.y -= 8;
    
    // Clear existing carousel
    if (this.carousel) {
      this.carousel.destroy();
    }
    
    // Get directory contents
    let entries = [];
    
    if (dirEntry === null) {
      // Load root directory
      try {
        this.currentDir = await this.fileSystem.getDirectory('');
        entries = await this.fileSystem.listDirectories(this.currentDir);
        // Add files from root too
        const files = await this.fileSystem.listFiles(this.currentDir);
        entries = [...entries, ...files];
      } catch (error) {
        console.error("Failed to load root directory:", error);
        this.showError("Cannot access file system");
        return;
      }
    } else {
      this.currentDir = dirEntry;
      const dirs = await this.fileSystem.listDirectories(this.currentDir);
      const files = await this.fileSystem.listFiles(this.currentDir);
      entries = [...dirs, ...files];
    }
  
    // Destroy loading indicator
    this.loadingDots.destroy();
    this.loadingDots = null;
  
    // Filter by extensions if specified
    if (this.extensions !== null) {
      entries = entries.filter(entry => {
        if (entry.isDirectory) return true;
        const ext = FileTools.getExtension(entry.name);
        return this.extensions.includes(ext);
      });
    }
    
    // Separate directories and files
    const directories = entries.filter(e => e.isDirectory);
    const files = entries.filter(e => e.isFile);
    
    // Sort alphabetically
    directories.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));
    
    // Combine (directories first, then files)
    const sortedEntries = [...directories, ...files];
    
    // Create carousel
    this.carousel = new CarouselMenu(0, 16, game.width, game.height - 24, {
      bgcolor: '#2c3e50',
      fgcolor: '#ffffff',
      align: 'left',
      animate: true,
      disableCancel: !this.allowCancel
    });
    
    // Handle cancel
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
    
    // Add parent directory entry (..) if not in root
    if (this.history.length > 0 || (this.currentDir && this.currentDir.fullPath !== '/')) {
      this.carousel.addItem("..", () => this.goToParent(), {
        entry: null,
        icon: 4,
        isParent: true,
        bgcolor: '#34495e'
      });
    }
    
    // Add all entries
    sortedEntries.forEach(entry => {
      const ext = FileTools.getExtension(entry.name);
      const fileIcons = {
        wav: 3,
        mp3: 3,
        ogg: 3,
        wma: 3,
        sm: 5,
        scc: 5,
        zip: 5
      };
      
      this.carousel.addItem(entry.name, () => this.onEntrySelected(entry), {
        entry: entry,
        icon: entry.isDirectory ? 2 : fileIcons[ext] || 1,
        isDirectory: entry.isDirectory,
        bgcolor: entry.isDirectory ? '#2980b9' : '#8e44ad'
      });
    });
    
    if (sortedEntries.length === 0 && (!this.history.length && this.currentDir && this.currentDir.fullPath === '/')) {
      this.emptyFolderText.visible = true;
    }
    
    // Update path display
    this.updatePathDisplay();
  }
  
  onEntrySelected(entry) {
    if (entry.isDirectory) {
      // Push current path to history and navigate into directory
      this.history.push(this.currentDir);
      this.loadDirectory(entry);
    } else {
      // File selected
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
      // Navigate to parent directory
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
    this.pathText.wrapPreserveNewlines(240 - 10);
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
    if (this.loadingDots) this.loadingDots.destroy();
    if (this.carousel) this.carousel.destroy();
  }
}