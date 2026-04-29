class WindowManager {
  constructor() {
    this.windows = [];
    this.focusedWindow = null;

    // Track input states to prevent repeated inputs
    this.firstPressTime = undefined;
    this.lastPress = 0;
  }

  add(window) {
    if (!this.windows.includes(window)) {
      this.windows.push(window);
      // Hide selector by default for new windows
      window.selector.visible = false;
      // If this is the first window added, focus it automatically
      if (this.windows.length === 1) {
        this.focus(window);
      }
    }
    return window;
  }

  show(window) {
    window.show();
  }

  remove(window, destroy = true) {
    const index = this.windows.indexOf(window);
    if (index !== -1) {
      // If we're removing the focused window, focus the next available one
      if (window === this.focusedWindow) {
        this.windows.splice(index, 1);
        this.focusedWindow = this.windows.length > 0 ?
          this.windows[this.windows.length - 1] : null;
        // Update selector visibility for new focused window
        if (this.focusedWindow) {
          this.focusedWindow.selector.visible = true;
        }
      } else {
        this.windows.splice(index, 1);
      }

      // Destroy window if requested
      if (destroy) {
        window.destroy();
      }
      
      return true;
    }
    return false;
  }

  focus(window, hide = true) {
    if (window && this.windows.includes(window)) {
      // Hide selector for previously focused window
      if (this.focusedWindow) {
        this.focusedWindow.focus = false;
        if (hide) this.focusedWindow.visible = false;
        this.focusedWindow.selector.visible = false;
      }

      // Focus new window and show its selector
      this.focusedWindow = window;
      window.focus = true;
      window.selector.visible = true;
      //window.bringToTop();
      window.show();
      return true;
    }
    return false;
  }

  unfocus() {
    this.focusedWindow = null;
  }

  closeAll() {
    if (this.focusedWindow) {
      this.focusedWindow.focus = false;
      this.focusedWindow = null;
    }
    this.windows.forEach(window => window.hide());
  }

  update() {
    // Only process input if we have a focused window
    if (this.focusedWindow && !this.focusedWindow.disposed) {
      // Handle navigation
      const { up, down, left, right, a, b } = gamepad.held;
      const pressed = gamepad.pressed;
      const released = gamepad.released;
      
      // Dynamic cooldown system
      let cooldown = 100;
      
      // Calculate time since last held press
      const timeSinceLastPress = game.time.now - this.lastPress;
      const timeSinceFirstPress = game.time.now - (this.firstPressTime || 0);
      
      // Dynamic cooldown logic: 
      if (timeSinceFirstPress < 1000) {
        cooldown = 400;
      } else if (timeSinceFirstPress < 1500) {
        cooldown = 200;
      } else if (timeSinceFirstPress < 1700) {
        cooldown = 100;
      } else if (timeSinceLastPress < 5000) {
        cooldown = 50;
      } else {
        cooldown = 16;
      }
      
      const cooldownEnded = timeSinceLastPress >= cooldown;
      
      // Handle pressed buttons
      if (pressed.up) {
        this.focusedWindow.navigate('up');
        this.resetPressTiming();
        return;
      } else if (pressed.down) {
        this.focusedWindow.navigate('down');
        this.resetPressTiming();
        return;
      } else if (pressed.left) {
        this.focusedWindow.navigate('left');
        this.resetPressTiming();
        return;
      } else if (pressed.right) {
        this.focusedWindow.navigate('right');
        this.resetPressTiming();
        return;
      }
    
      if (pressed.a) {
        this.focusedWindow.confirm();
        this.resetPressTiming();
        return;
      }
      
      if (pressed.b) {
        this.focusedWindow.cancel();
        this.resetPressTiming();
        return;
      }
        
      if (cooldownEnded) {
        // Handle held buttons
        if (up) {
          this.focusedWindow.navigate('up');
          this.updatePressTiming();
        } else if (down) {
          this.focusedWindow.navigate('down');
          this.updatePressTiming();
        } else if (left) {
          this.focusedWindow.navigate('left');
          this.updatePressTiming();
        } else if (right) {
          this.focusedWindow.navigate('right');
          this.updatePressTiming();
        }
      }
    }
  }

  // Helper methods for common operations
  createWindow(x, y, width, height, skin = "1", parent = null) {
    const window = new Window(x, y, width, height, skin, parent);
    this.add(window);
    return window;
  }

  updatePressTiming() {
    // Track first press time
    if (this.firstPressTime === undefined) {
      this.firstPressTime = game.time.now;
    }
    
    // Update last press time
    this.lastPress = game.time.now;
  }

  resetPressTiming() {
    this.firstPressTime = game.time.now;
    this.lastPress = game.time.now;
  }

  clearAll(destroy = false) {
    if (destroy) {
      this.windows.forEach(window => window.destroy());
    }
    this.windows = [];
    this.focusedWindow = null;
  }

  // Bring window to front (visually) without necessarily focusing it
  bringToFront(window) {
    if (this.windows.includes(window)) {
      window.bringToTop();
      // Reorder windows array to maintain proper z-index
      this.windows.splice(this.windows.indexOf(window), 1);
      this.windows.push(window);
      return true;
    }
    return false;
  }
}
