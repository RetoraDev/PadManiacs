class WindowManager {
  constructor() {
    this.windows = [];
    this.focusedWindow = null;

    // Track input states to prevent repeated inputs
    this.lastUp = false;
    this.lastDown = false;
    this.lastConfirm = false;
    this.lastCancel = false;
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
    if (this.focusedWindow) {
      // Handle navigation - only trigger on new presses (not holds)
      const upPressed = gamepad.pressed.up && !this.lastUp;
      const downPressed = gamepad.pressed.down && !this.lastDown;
      const leftPressed = gamepad.pressed.left && !this.lastDown;
      const rightPressed = gamepad.pressed.right && !this.lastDown;
      const confirmPressed = gamepad.pressed.a && !this.lastConfirm;
      const cancelPressed = gamepad.pressed.b && !this.lastCancel;

      if (upPressed) {
        this.focusedWindow.navigate('up');
      } else if (downPressed) {
        this.focusedWindow.navigate('down');
      } else if (leftPressed) {
        this.focusedWindow.navigate('left');
      } else if (rightPressed) {
        this.focusedWindow.navigate('right');
      }

      if (confirmPressed) {
        this.focusedWindow.confirm();
      }

      if (cancelPressed) {
        this.focusedWindow.cancel();
      }

      // Update input states
      this.lastUp = gamepad.pressed.up;
      this.lastDown = gamepad.pressed.down;
      this.lastConfirm = gamepad.pressed.a;
      this.lastCancel = gamepad.pressed.b;
    }
  }

  // Helper methods for common operations
  createWindow(x, y, width, height, skin = "1", parent = null) {
    const window = new Window(x, y, width, height, skin, parent);
    this.add(window);
    return window;
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
