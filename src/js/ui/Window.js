class Window extends Phaser.Sprite {
  constructor(x, y, width, height, skin = "1", parent = null) {
    super(game, x * 8, y * 8);

    this.size = {
      width,
      height
    };
    
    this.offset = {
      x: 0,
      y: 0
    };
    
    this.scrollOffset = 0;
    this.itemOffset = 1;
    this.visibleItems = height;
    this.selectedIndex = 0;
    this.focus = false;
    this.skin = skin;
    this.font = "default";
    this.fontTint = 0x76fcde;
    this.disableScrollBar = false;

    if (parent) {
      parent.addChild(this);
    } else {
      game.add.existing(this);
    }

    // Create window frame
    this.createWindowFrame();

    // Selection arrow
    this.selector = game.add.sprite(3, 0, `ui_window_${skin}`, 9);
    this.selector.visible = false;
    this.selector.animations.add('blink', [9, 10], 4, true);
    this.selector.animations.play('blink');
    this.addChild(this.selector);

    // Scroll bar
    this.scrollBar = game.add.graphics(this.size.width * 8 - 3, 8);
    this.scrollBar.alpha = 0; // Start hidden
    this.addChild(this.scrollBar);
    
    this.scrollBarTween = null;

    // Signals
    this.onSelect = new Phaser.Signal();
    this.onConfirm = new Phaser.Signal();
    this.onCancel = new Phaser.Signal();

    // Items array
    this.items = [];
    this.updateSelector();
  }

  createWindowFrame() {
    // Window frame parts
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

  addItem(text, valueText, callback = null, backButton = false) {
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
      text: itemText,
      valueText: itemValueText,
      callback: callback,
      backButton: backButton,
      type: 'item',
      visible: true,
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

  addSettingItem(text, options, currentIndex, callback = null) {
    const itemText = new Text(8 + this.offset.x, 0, text, {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    this.addChild(itemText);
    
    // Translate text
    options = options.map(option => Window.processMultilingual(option));

    const valueText = new Text(this.size.width * 8 -8- 4, 0, options[currentIndex].toString(), {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    valueText.anchor.x = 1;
    itemText.addChild(valueText);

    const item = {
      text: itemText,
      valueText: valueText,
      options: options,
      currentIndex: currentIndex,
      callback: callback,
      type: 'setting',
      visible: true
    };

    this.items.push(item);
    this.update();
    return item;
  }
  
  static processMultilingual(text) {
    // Translate text only
    if (typeof text !== 'string') {
      return text;
    }

    // Handle simple split case (text||text)
    const simpleSplitRegex = /([^|(]+\|\|[^|)]+)/g;
    text = text.replace(simpleSplitRegex, match => {
      const parts = match.split('||');
      return parts[SETTINGS.language] || parts[0]; // Default to first part if language index is invalid
    });

    // Handle parenthetical cases (ES|EN)
    const parenRegex = /\(([^)|]+)\|([^)]+)\)/g;
    text = text.replace(parenRegex, (match, esText, enText) => {
      return SETTINGS.language === 0 ? esText : enText;
    });

    return text;
  }
  
  getVisibleHeight(excluding = 0) {
    return (this.size.height * 8) - (10 + this.offset.y);
  }

  update() {
    // Calculate visible items based on window height and item spacing
    const availableHeight = this.getVisibleHeight(); // Subtract padding
    this.visibleItems = Math.floor(availableHeight / 8);// Each item is 8px tall
    
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
  }
  
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
        this.scrollBarTween = null;
      });
  }

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
      this.playNavSound();
    } else if (item.type === 'toggle') {
      item.state = !item.state;
      item.toggleSwitch.animations.play(item.state ? 'on' : 'off');
      if (item.callback) item.callback(item.state);
      this.playNavSound();
    }
  }

  handleRight() {
    const item = this.items[this.selectedIndex];
    if (!item) return;
    
    if (item.type === 'setting') {
      item.currentIndex = (item.currentIndex + 1) % item.options.length;
      item.valueText.write(item.options[item.currentIndex].toString());
      if (item.callback) item.callback(item.currentIndex, item.options[item.currentIndex]);
      this.playNavSound();
    } else if (item.type === 'toggle') {
      item.state = !item.state;
      item.toggleSwitch.animations.play(item.state ? 'on' : 'off');
      if (item.callback) item.callback(item.state);
      this.playNavSound();
    }
  }

  playNavSound() {
    ENABLE_UI_SFX && Audio.play('ui_nav');
  }

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

  cancel() {
    this.items.forEach(item => {
      if (item.backButton) {
        item.callback();
        ENABLE_UI_SFX && Audio.play('ui_cancel');
      }
    });
    this.onCancel.dispatch(this.selectedIndex);
  }
  
  removeAll() {
    this.items.forEach(item => {
      item.text.destroy();
      if (item.valueText) item.valueText.destroy();
      if (item.toggleText) item.toggleText.destroy();
    });
    this.items = [];
    this.selectedIndex = 0;
  }

  clear() {
    this.removeAll();
    if (this.scrollBarTween) {
      this.scrollBarTween.stop();
      this.scrollBarTween = null;
    }
    this.frameParts.forEach(part => part.destroy());
    this.frameParts = [];
    this.selectedIndex = 0;
    this.scrollOffset = 0;
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  destroy() {
    this.clear();
    super.destroy();
  }
}
