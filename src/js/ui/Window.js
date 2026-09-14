/**
 * @class Window
 * @category UI Classes
 * @summary Customizable UI window with menu items and scrollbar
 * @constructor
 * @param {number} x - X position in 8px grid cells
 * @param {number} y - Y position in 8px grid cells
 * @param {number} width - Window width in 8px cells
 * @param {number} height - Window height in 8px cells
 * @param {string} [skin="1"] - Window skin key used for frame sprites
 * @param {object} [parent] - Optional parent to add the window sprite to
 * @features
 * Grid-aligned frame built from tiled sprite parts
 * Plain, setting, and range menu items
 * Blinking selector arrow and pulsing highlight
 * Auto-hiding scroll bar and signal-based events
 * @description
 * Window is a sprite-based UI window that renders a frame from tiled sprite
 * parts on an 8px grid. It hosts menu items (plain, setting, and range
 * types) and handles selection, navigation, highlighting, scrolling, and an
 * optional scroll bar. Its signals let mods react to selection, confirmation,
 * and cancellation without touching window internals.
 * @example
 * // Modding usage example
 * const win = new Window(4, 4, 12, 6, "1");
 * win.addItem('Play', '', () => game.state.start('Play'), true);
 * win.addSettingItem('Volume', ['Low', 'Med', 'High'], 1);
 * win.addRangeItem('Speed', 0, 200, 10, 100, '%');
 * win.onConfirm.add(() => {});
 */
class Window extends Phaser.Sprite {
  constructor(x, y, width, height, skin = "1", parent = null) {
    super(game, x * 8, y * 8);

    /** @type {object} Window dimensions in grid cells ({ width, height }) */
    this.size = {
      width,
      height
    };
    
    /** @type {object} Pixel offset applied to item content ({ x, y }) */
    this.offset = {
      x: 0,
      y: 0
    };
    
    /** @type {number} Index of the first visible item */
    this.scrollOffset = 0;
    /** @type {number} Vertical spacing between items in grid cells */
    this.itemOffset = 1;
    /** @type {number} Number of items that fit in the visible area */
    this.visibleItems = height;
    /** @type {number} Index of the currently selected item */
    this.selectedIndex = 0;
    /** @type {boolean} Whether this window is focused for navigation */
    this.focus = false;
    /** @type {string} Window skin key used for frame sprites */
    this.skin = skin;
    /** @type {string} Font key used for item text */
    this.font = "default";
    /** @type {number} Tint color applied to item text */
    this.fontTint = 0x76fcde;
    /** @type {boolean} Whether the selection highlight is disabled */
    this.disableHighlight = false;
    /** @type {boolean} Whether the scroll bar is disabled */
    this.disableScrollBar = false;
    /** @type {boolean} Whether mouse interaction is disabled */
    this.disableMouse = false;

    if (parent) {
      parent.addChild(this);
    } else {
      game.add.existing(this);
    }

    // Create window frame
    this.createWindowFrame();

    // Selection arrow
    /** @type {Phaser.Sprite} Blinking selection arrow sprite */
    this.selector = game.add.sprite(3, 0, `ui_window_${skin}`, 9);
    this.selector.visible = false;
    this.selector.animations.add('blink', [9, 10], 4, true);
    this.selector.animations.play('blink');
    this.addChild(this.selector);
    
    // Highlight rectangle
    /** @type {Phaser.Graphics} Animated highlight rectangle behind the selection */
    this.highlight = game.add.graphics(0, 0);
    this.highlight.alpha = 0; // Start hidden
    this.highlight.beginFill(this.fontTint, 0.8);
    this.highlight.drawRect(0, 0, this.size.width * 8, 8);
    this.highlight.endFill();
    this.addChild(this.highlight);
    
    // Scroll bar
    /** @type {Phaser.Graphics} Auto-hiding scroll bar indicator */
    this.scrollBar = game.add.graphics(this.size.width * 8 - 3, 8);
    this.scrollBar.alpha = 0; // Start hidden
    this.addChild(this.scrollBar);
    
    this.scrollBarTween = null;

    // Signals
    /** @type {Phaser.Signal} Dispatched with the new index when selection moves */
    this.onSelect = new Phaser.Signal();
    /** @type {Phaser.Signal} Dispatched when the window is confirmed */
    this.onConfirm = new Phaser.Signal();
    /** @type {Phaser.Signal} Dispatched when the window is cancelled */
    this.onCancel = new Phaser.Signal();

    // Items array
    /** @type {Array} Array of menu items managed by this window */
    this.items = [];
    this.updateSelector();
  }

  createWindowFrame() {
    // Window frame parts
    /** @type {Array} Sprites that compose the window frame */
    this.frameParts = [];

    // Create corners and borders
    for (let y = 0; y < this.size.height; y++) {
      for (let x = 0; x < this.size.width; x++) {
        let frame = 4; // Default to center

        // Determine which frame to use
        if (y === 0) { // Top row
          if (x === 0) frame = 0; // Top-left corner
          else if (x >= this.size.width - 1) frame = 2; // Top-right corner
          else frame = 1; // Top border
        } else if (y === this.size.height - 1) { // Bottom row
          if (x === 0) frame = 6; // Bottom-left corner
          else if (x >= this.size.width - 1) frame = 8; // Bottom-right corner
          else frame = 7; // Bottom border
        } else { // Middle rows
          if (x === 0) frame = 3; // Left border
          else if (x >= this.size.width - 1) frame = 5; // Right border
          else frame = 4; // Center fill
        }

        const part = game.add.sprite(x * 8, y * 8, `ui_window_${this.skin}`, frame);
        this.addChild(part);
        this.frameParts.push(part);
      }
    }
  }

  /**
   * Adds a plain menu item with an optional value text on the right side.
   * @param {string} text - Item label, localized unless already localized
   * @param {string} valueText - Value text aligned to the right edge
   * @param {Function} [callback] - Called with the item when confirmed
   * @param {boolean} [backButton=false] - Whether this item acts as a back/cancel button
   * @returns {object} The created item object
   */
  addItem(text, valueText, callback = null, backButton = false) {
    text = text._localized ? text : __(text);
    
    const itemText = new Text(8 + this.offset.x, 0, text, {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    this.addChild(itemText);
    
    const itemValueText = new Text(this.size.width * 8 -8 - 4, 0, valueText, {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    itemValueText.anchor.x = 1;
    itemText.addChild(itemValueText);
    
    const item = {
      index: this.items.length,
      text: itemText,
      valueText: itemValueText,
      callback: callback,
      backButton: backButton,
      type: 'item',
      visible: false,
      setText: text => {
        itemText.write(text);
      },
      setValueText: text => {
        itemValueText.write(text);
      }
    };

    this.items.push(item);

    return item;
  }

  /**
   * Adds a setting item that cycles through options with left/right input.
   * @param {string} text - Item label, localized unless already localized
   * @param {Array} options - List of option values to cycle through
   * @param {number} currentIndex - Index of the initially selected option
   * @param {Function} [callback] - Called with the new index and value when changed
   * @returns {object} The created item object
   */
  addSettingItem(text, options, currentIndex, callback = null) {
    text = text._localized ? text : __(text);
    
    const itemText = new Text(8 + this.offset.x, 0, text, {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    this.addChild(itemText);
    
    const valueText = new Text(this.size.width * 8 -8- 4, 0, options[currentIndex]?.toString() || "", {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    valueText.anchor.x = 1;
    itemText.addChild(valueText);

    const item = {
      index: this.items.length,
      text: itemText,
      valueText: valueText,
      options: options,
      currentIndex: currentIndex,
      callback: callback,
      type: 'setting',
      visible: false
    };

    this.items.push(item);
    this.update();
    return item;
  }
  
  /**
   * Adds a numeric range item adjusted by a step on left/right input.
   * @param {string} text - Item label, localized unless already localized
   * @param {number} [min=0] - Minimum allowed value
   * @param {number} [max=100] - Maximum allowed value
   * @param {number} [step=1] - Increment/decrement step
   * @param {number} [value=0] - Initial value
   * @param {string} [suffix=""] - Text rendered after the value
   * @param {Function} [callback] - Called with the new value when changed
   * @returns {object} The created item object
   */
  addRangeItem(text, min = 0, max = 100, step = 1, value = 0, suffix = "", callback = null) {
    text = text._localized ? text : __(text);
    
    const itemText = new Text(8 + this.offset.x, 0, text, {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    this.addChild(itemText);
    
    const valueText = new Text(this.size.width * 8 -8- 4, 0, `${value}${suffix}`, {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    valueText.anchor.x = 1;
    itemText.addChild(valueText);

    const item = {
      index: this.items.length,
      text: itemText,
      valueText: valueText,
      min, max, step, value, suffix,
      callback: callback,
      type: 'range',
      visible: false 
    };

    this.items.push(item);
    this.update();
    return item;
  }
  
  /**
   * Returns the usable content height in pixels below the window padding.
   * @param {number} [excluding=0] - Extra pixels to exclude from the height
   * @returns {number} Usable height in pixels
   */
  getVisibleHeight(excluding = 0) {
    return (this.size.height * 8) - (10 + this.offset.y);
  }

  /**
   * Recomputes visible items, scroll bounds, and item positions.
   * Called automatically after items are added or the window is resized.
   */
  update() {
    // Calculate visible items based on window height and item spacing
    const availableHeight = this.getVisibleHeight(); // Subtract padding
    this.visibleItems = Math.floor(availableHeight / 8); // Each item is 8px tall
    
    // Ensure we don't show more items than we have
    this.visibleItems = Math.min(this.visibleItems, this.items.length);
    
    // Ensure scroll offset is within bounds
    this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, this.items.length - this.visibleItems));

    // Calculate vertical centering
    const totalContentHeight = this.visibleItems * 8; // Total height of all visible items
    const startY = ((this.size.height * 8) - totalContentHeight) / 2; // Center the block of items

    this.items.forEach((item, index) => {
      const isVisible = index >= this.scrollOffset && index < this.scrollOffset + this.visibleItems;
      
      item.text.visible = isVisible;
      item.visible = isVisible;
      item.text.tint = this.fontTint;
      if (item.valueText) item.valueText.tint = this.fontTint;

      if (isVisible) {
        // Calculate Y position with vertical centering
        const visibleIndex = index - this.scrollOffset;
        const yPos = startY + (visibleIndex * 8); // Fixed 8px per item, centered
        
        item.text.y = yPos + this.offset.y;
      }
    });

    this.updateSelector();
  }
  
  /**
   * Positions the selector arrow and highlight on the selected item.
   */
  updateSelector() {
    // Position selector arrow
    if (this.focus && this.items.length > 0 && this.selectedIndex >= this.scrollOffset && this.selectedIndex < this.scrollOffset + this.visibleItems) {
      const totalContentHeight = this.visibleItems * 8;
      const startY = ((this.size.height * 8) - totalContentHeight) / 2;
      const visibleIndex = this.selectedIndex - this.scrollOffset;
      const selectorY = startY + (visibleIndex * 8) + this.offset.y;
      
      this.selector.y = selectorY;
      this.selector.visible = true;
    } else {
      this.selector.visible = false;
    }
    
    // Update highlight
    this.updateHighlight();
  }
  
  /**
   * Animates the highlight rectangle alpha and positions it on the selection.
   */
  updateHighlight() {
    if (this.forcedHighlightY || this.selector.visible && !this.disableHighlight) {
      // Position with selector arrow
      this.highlight.y = this.forcedHighlightY || this.selector.y - 1;
      
      // Tween highlight alpha
      this.highlight.alpha = 0.6 + (0.4 * Math.sin(Date.now() * 0.01));
    } else {
      this.highlight.alpha = 0;
    }
  }
  
  /**
   * Pins the highlight rectangle to a fixed Y position within the window.
   * @param {number} y - Y position for the highlight
   */
  forceHighlight(y) {
    /** @type {?number} Fixed Y position for the highlight, or null when not forced */
    this.forcedHighlightY = y;
  }
  
  /**
   * Redraws and reveals the scroll bar when items overflow the window.
   */
  updateScrollBar() {
    if (this.disableScrollBar) return;
    
    // Clear previous scroll bar
    this.scrollBar.clear();
    
    // Only show scroll bar if there are more items than visible
    if (this.items.length <= this.visibleItems) {
      this.hideScrollBar();
      return;
    }
    
    const windowHeight = (this.size.height - 2) * 8;
    const totalItems = this.items.length;
    
    // Calculate scroll bar dimensions
    const scrollBarHeight = Math.max(8, (this.visibleItems / totalItems) * windowHeight);
    const scrollBarWidth = 1;
    
    // Calculate scroll bar position
    const scrollRange = totalItems - this.visibleItems;
    const scrollProgress = this.scrollOffset / scrollRange;
    const scrollBarY = scrollProgress * (windowHeight - scrollBarHeight);
    
    // Draw scroll bar
    this.scrollBar.beginFill(this.fontTint, 0.8);
    this.scrollBar.drawRect(0, scrollBarY, scrollBarWidth, scrollBarHeight);
    this.scrollBar.endFill();
    
    // Show scroll bar with fade in
    this.showScrollBar();
  }
  
  /**
   * Fades the scroll bar in and schedules an automatic fade out.
   */
  showScrollBar() {
    // Cancel any existing fade out tween
    if (this.scrollBarTween) {
      this.scrollBarTween.stop();
    }
    
    // Fade in immediately
    this.scrollBar.alpha = 1;
    
    // Start fade out after 1 second
    this.scrollBarTween = game.add.tween(this.scrollBar);
    
    this.scrollBarTween.to({ alpha: 0 }, 1000, Phaser.Easing.Quadratic.Out, true, 500)
      .onComplete.add(() => {
/** @type {?Phaser.Tween} Tween animating the scroll bar fade */
    this.scrollBarTween = null;
      });
  }

  /**
   * Immediately hides and clears the scroll bar.
   */
  hideScrollBar() {
    // Cancel any existing tween
    if (this.scrollBarTween) {
      this.scrollBarTween.stop();
      this.scrollBarTween = null;
    }
    
    // Hide immediately
    this.scrollBar.alpha = 0;
    this.scrollBar.clear();
  }
  
  adjustScroll() {
    // Adjust scroll offset to ensure selected item is visible
    if (this.selectedIndex < this.scrollOffset) {
      this.scrollOffset = this.selectedIndex;
    } else if (this.selectedIndex >= this.scrollOffset + this.visibleItems) {
      this.scrollOffset = this.selectedIndex - this.visibleItems + 1;
    }
  }

  /**
   * Moves selection by the given direction and plays the navigation sound.
   * @param {string} direction - One of 'up', 'down', 'left', or 'right'
   */
  navigate(direction) {
    if (this.items.length === 0) return;

    let newIndex = this.selectedIndex;

    switch (direction) {
      case 'up':
        newIndex = Math.max(0, this.selectedIndex - 1);
        break;
      case 'down':
        newIndex = Math.min(this.items.length - 1, this.selectedIndex + 1);
        break;
      case 'left':
        this.handleLeft();
        return;
      case 'right':
        this.handleRight();
        return;
    }

    this.onSelect.dispatch(newIndex, direction);

    if (newIndex !== this.selectedIndex) {
      this.selectedIndex = newIndex;
      this.adjustScroll();
      this.updateScrollBar();
      this.playNavSound();
    }
  }

  handleLeft() {
    const item = this.items[this.selectedIndex];
    if (!item) return;
    
    if (item.type === 'setting') {
      item.currentIndex = (item.currentIndex - 1 + item.options.length) % item.options.length;
      item.valueText.write(item.options[item.currentIndex].toString());
      if (item.callback) item.callback(item.currentIndex, item.options[item.currentIndex]);
    } else if (item.type === 'range') {
      if (item.value - item.step >= item.min) item.value -= item.step;
      item.valueText.write(`${item.value}${item.suffix}`);
      if (item.callback) item.callback(item.value);
    }
    
    this.playNavSound();
  }

  handleRight() {
    const item = this.items[this.selectedIndex];
    if (!item) return;
    
    if (item.type === 'setting') {
      item.currentIndex = (item.currentIndex + 1) % item.options.length;
      item.valueText.write(item.options[item.currentIndex].toString());
      if (item.callback) item.callback(item.currentIndex, item.options[item.currentIndex]);
      this.playNavSound();
    } else if (item.type === 'range') {
      if (item.value + item.step <= item.max) item.value += item.step;
      item.valueText.write(`${item.value}${item.suffix}`);
      if (item.callback) item.callback(item.value);
    }
    
    this.playNavSound();
  }
  
  /**
   * Selects the item at the given index and adjusts scrolling to show it.
   * @param {number} index - Item index to select
   */
  selectIndex(index) {
    this.selectedIndex = index;
    this.adjustScroll();
    this.updateScrollBar();
  }

  playNavSound() {
    ENABLE_UI_SFX && Audio.play('ui_nav');
  }
  
  /**
   * Applies a tint to every window frame part.
   * @param {number} tint - RGB tint value
   */
  setTint(tint) {
    this.frameParts.forEach(part => part.tint = tint);
  }

  /**
   * Confirms the selected item's callback or dispatches the onConfirm signal.
   * @returns {boolean} True when an item handled the confirmation
   */
  confirm() {
    if (this.items.length > 0) {
      const item = this.items[this.selectedIndex];
      
      if (item.type === 'item') {
        item.callback && item.callback(this.items[this.selectedIndex]);
        ENABLE_UI_SFX && Audio.play('ui_select');
      } else {
        this.handleRight();
      }
      
      return true;
    }
    
    this.onConfirm.dispatch(this.selectedIndex, this.items[this.selectedIndex]);
    
    return false;
  }

  /**
   * Runs back-button callbacks and dispatches the onCancel signal.
   */
  cancel() {
    this.items.forEach(item => {
      if (item.backButton) {
        item.callback();
        ENABLE_UI_SFX && Audio.play('ui_cancel');
      }
    });
    this.onCancel.dispatch(this.selectedIndex);
  }
  
  /**
   * Scrolls the selection by the given delta, clamping it to the item list.
   * @param {number} [delta=0] - Amount to scroll the selection by
   */
  scroll(delta = 0) {
    this.scrollOffset += delta;
    this.selectedIndex += delta;
    this.adjustScroll();
    if (this.selectedIndex < 0) {
      this.selectedIndex = 0;
    } else if (this.selectedIndex >= this.items.length) {
      this.selectedIndex = this.items.length - 1;
    }
  }
  
  /**
   * Destroys all item texts and resets the item list and selection.
   */
  removeAll() {
    this.items.forEach(item => {
      item.text.destroy();
      if (item.valueText) item.valueText.destroy();
      if (item.toggleText) item.toggleText.destroy();
    });
    this.items = [];
    this.selectedIndex = 0;
  }

  /**
   * Removes all items, disposes signals, and no-ops navigation handlers.
   */
  clear() {
    this.removeAll();
    if (this.scrollBarTween) {
      this.scrollBarTween.stop();
      this.scrollBarTween = null;
    }
    this.onSelect.dispose();
    this.onConfirm.dispose();
    this.onCancel.dispose();
    /** @type {Function} Confirmation handler, emptied when the window is cleared */
    this.confirm = () => {};
    /** @type {Function} Cancel handler, emptied when the window is cleared */
    this.cancel = () => {};
    /** @type {Function} Navigation handler, emptied when the window is cleared */
    this.navigate = () => {};
    this.frameParts.forEach(part => part.destroy());
    this.frameParts = [];
    this.selectedIndex = 0;
    this.scrollOffset = 0;
  }

  /**
   * Makes the window sprite visible.
   */
  show() {
    /** @type {boolean} Whether the window sprite is currently visible */
    this.visible = true;
  }

  /**
   * Hides the window sprite.
   */
  hide() {
    this.visible = false;
  }

  /**
   * Clears the window, marks it disposed, and destroys the sprite.
   */
  destroy() {
    this.clear();
    /** @type {boolean} Whether the window has been disposed and can no longer be used */
    this.disposed = true;
    super.destroy();
  }
}
