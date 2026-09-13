/**
 * @class WindowManager
 * @category UI Classes
 * @summary Manages UI windows, focus, and navigation
 * @constructor
 * @features
 * Tracks and focuses a stack of UI windows
 * Routes gamepad navigation, confirm, and cancel to the focused window
 * Mouse hover selection, wheel scrolling, and click confirmation
 * Dynamic repeat cooldown for held directional buttons
 * @description
 * WindowManager owns every open Window, keeps a single focused window, and
 * forwards gamepad and mouse input to it. It applies a dynamic cooldown so
 * held directional buttons repeat at increasing speed, moves the selection by
 * mouse hover, and supports wheel scrolling and click confirmation. It is the
 * hub that connects the menu windows together.
 * @example
 * // Modding usage example
 * const ui = new WindowManager();
 * const menu = ui.createWindow(4, 3, 14, 8, "1");
 * const modal = ui.createWindow(6, 5, 10, 4, "1");
 * ui.focus(menu);
 */
class WindowManager {
  constructor() {
    /** @type {Array} Stack of managed Window objects */
    this.windows = [];
    /** @type {Window} Window that currently receives navigation input */
    this.focusedWindow = null;
    
    this.gamepad = gamepad;

    // Track input states to prevent repeated inputs
    this.firstPressTime = undefined;
    this.lastPress = 0;
    
    // Mouse state
    this.previousMousePosition = { x: 0, y: 0 };
    this.previousMouseTarget = null;
    this.mouseTarget = null;
  }

  /**
   * Registers a window and focuses it automatically when it is the first.
   * @param {Window} window - The window to manage
   * @returns {Window} The added window
   */
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

  /**
   * Shows a managed window without changing focus.
   * @param {Window} window - The window to show
   */
  show(window) {
    window.show();
  }

  /**
   * Removes a window from the stack, optionally destroying it.
   * The next available window receives focus when the focused one is removed.
   * @param {Window} window - The window to remove
   * @param {boolean} [destroy=true] - Whether to destroy the window
   * @returns {boolean} True when the window was removed
   */
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

  /**
   * Focuses a window, hiding the previously focused one and showing its arrow.
   * @param {Window} window - The window to focus
   * @param {boolean} [hide=true] - Whether to hide the previously focused window
   * @returns {boolean} True when the window was focused
   */
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

  /**
   * Clears the focused window reference without modifying the stack.
   */
  unfocus() {
    this.focusedWindow = null;
  }

  /**
   * Clears focus and hides every managed window.
   */
  closeAll() {
    if (this.focusedWindow) {
      this.focusedWindow.focus = false;
      this.focusedWindow = null;
    }
    this.windows.forEach(window => window.hide());
  }

  /**
   * Processes mouse and gamepad input for the focused window each frame.
   */
  update() {
    // Only process input if we have a focused window
    if (this.focusedWindow && !this.focusedWindow.disposed) {
      this.handleMouseNavigation();
      
      this.handleGamepadNavigation();
    }
  }
  
  /**
   * Routes gamepad presses and held buttons to the focused window.
   * Uses a dynamic cooldown so held directions repeat at increasing speed.
   */
  handleGamepadNavigation() {
    // Handle gamepad navigation
    const { up, down, left, right, a, b } = this.gamepad.held;
    const pressed = this.gamepad.pressed;
    const released = this.gamepad.released;
    
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
  
  /**
   * Handles mouse hover selection, wheel scrolling, and click confirmation.
   */
  handleMouseNavigation() {
    const position = mouse.pointer.position;
    
    if (!this.checkMouseBounds(this.focusedWindow, position)) return;
    
    if (position.x != this.previousMousePosition.x && position.y != this.previousMousePosition.y) {
      const target = this.getMouseTarget(this.focusedWindow, position);
      this.mouseTarget = target;
      
      if (target && target != this.previousMouseTarget) {
        this.focusedWindow.selectIndex(target.index);
      }
    }
    
    if (mouse.wheel.up) {
      this.focusedWindow.scroll(-1);
    } else if (mouse.wheel.down) {
      this.focusedWindow.scroll(1);
    }
    
    if (mouse.pressed.left) {
      this.focusedWindow.confirm();
    }
    
    this.previousMousePosition.x = position.x;
    this.previousMousePosition.y = position.y;
    this.previousMouseTarget = this.mouseTarget;
  }
  
  /**
   * Returns whether the given position lies inside the window bounds.
   * @param {Window} window - The window to test against
   * @param {object} position - Position with x and y properties
   * @returns {boolean} True when the position is inside the window
   */
  checkMouseBounds(window, position) {
    const { x, y } = position;

    // Check bounds
    if (x < window.x || x > window.x + window.size.width * 8) {
      return false;
    }
    if (y < window.y || y > window.y + window.size.height * 8) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Returns the topmost visible item hovered by the given mouse position.
   * @param {Window} window - The window whose items are tested
   * @param {object} position - Position with x and y properties
   * @returns {object|null} The hovered item or null
   */
  getMouseTarget(window, position) {
    const { x, y } = position;
    
    const items = window.items.filter(item => item.visible).reverse();
    
    // Get hovered item
    for (const item of items) {
      if (
        item && item.text && 
        y >= (-3 + item.text.y + window.y)
      ) return item;
    }
    
    return null;
  }

  // Helper methods for common operations
  /**
   * Creates a Window, registers it with the manager, and returns it.
   * @param {number} x - Window X position in grid cells
   * @param {number} y - Window Y position in grid cells
   * @param {number} width - Window width in grid cells
   * @param {number} height - Window height in grid cells
   * @param {string} [skin="1"] - Window skin key
   * @param {object} [parent] - Optional parent for the new window
   * @returns {Window} The created window
   */
  createWindow(x, y, width, height, skin = "1", parent = null) {
    const window = new Window(x, y, width, height, skin, parent);
    this.add(window);
    return window;
  }

  /**
   * Records the first press time to seed the dynamic cooldown timing.
   */
  updatePressTiming() {
    // Track first press time
    if (this.firstPressTime === undefined) {
      this.firstPressTime = game.time.now;
    }
    
    // Update last press time
    this.lastPress = game.time.now;
  }

  /**
   * Resets the first and last press timestamps after a fresh input.
   */
  resetPressTiming() {
    this.firstPressTime = game.time.now;
    this.lastPress = game.time.now;
  }

  /**
   * Clears the window stack and focus, optionally destroying each window.
   * @param {boolean} [destroy=false] - Whether to destroy the removed windows
   */
  clearAll(destroy = false) {
    if (destroy) {
      this.windows.forEach(window => window.destroy());
    }
    this.windows = [];
    this.focusedWindow = null;
  }

  // Bring window to front (visually) without necessarily focusing it
  /**
   * Brings a window to the top visually and reorders the stack array.
   * @param {Window} window - The window to bring to the front
   * @returns {boolean} True when the window was reordered
   */
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
