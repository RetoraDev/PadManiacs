class CarouselMenu extends Phaser.Sprite {
  constructor(x, y, width, height, config = {}) {
    super(game, x, y);
    
    this.config = {
      animate: true,
      align: 'left',
      bgcolor: '#3498db',
      fgcolor: '#ffffff',
      disableScrollBar: false,
      inactiveAlpha: 0.4,
      activeAlpha: 0.9,
      ...config,
      margin: { top: 4, bottom: 4, left: 4, right: 4, ...(config.margin || {}) },
    };
    
    this.viewport = {
      width: width,
      height: height
    };
    
    this.items = [];
    this.selectedIndex = 0;
    this.scrollOffset = 0;
    this.itemHeight = 8;
    this.itemSpacing = 1;
    this.totalItemHeight = this.itemHeight + this.itemSpacing;
    
    this.visibleItems = Math.floor((height - this.config.margin.top - this.config.margin.bottom) / this.totalItemHeight);
    this.visibleItems = Math.max(1, this.visibleItems);
    
    this.isAnimating = false;
    this.inputEnabled = true;
        
    // Scroll bar
    if (!this.config.disableScrollBar) {
      this.scrollBar = game.add.graphics(this.viewport.width - 3, this.config.margin.top);
      this.scrollBar.alpha = 0; // Start hidden
      this.addChild(this.scrollBar);
      
      this.scrollBarTween = null;
    }
    
    this.lastUp = false;
    this.lastDown = false;
    this.lastLeft = false;
    this.lastRight = false;
    this.lastConfirm = false;
    this.lastCancel = false;
    
    this.setupInput();
    
    if (!this.config.silent) game.add.existing(this);
  }
  
  setupInput() {
    gamepad.releaseAll();

    this.onSelect = new Phaser.Signal();
    this.onConfirm = new Phaser.Signal();
    this.onCancel = new Phaser.Signal();
  }
  
  addItem(text, callback = null, data = {}) {
    const index = this.items.length;
    
    const item = {
      parent: null,
      background: null,
      text: null,
      textContent: text,
      callback: callback,
      data: data,
      index: index,
      originalX: this.config.align === 'right' ? this.config.margin.right : this.config.margin.left,
      originalAlpha: this.config.inactiveAlpha,
      isSelected: false,
      alphaTween: null
    };
    
    this.items.push(item);
    
    this.updateSelection();
    
    return item;
  }
  
  createItemVisuals(item, isSelected) {
    const index = item.index;
    let xPos = this.config.margin.left;
    let yPos = item.initialY || this.config.margin.top + (index * this.totalItemHeight);
    const data = item.data;
    
    item.initialY = null;
    
    const itemParent = new Phaser.Sprite(game, xPos, yPos);
    itemParent.alpha = this.config.inactiveAlpha;
    this.addChild(itemParent);
    
    const bgWidth = this.viewport.width - this.config.margin.left - this.config.margin.right;
    const bgHeight = this.itemHeight;
    
    const background = this.createGradientBackground(bgWidth, bgHeight, data.bgcolor);
    background.x = item.originalX;
    itemParent.addChild(background);
    
    const textX = this.config.align === 'right' ? 
      bgWidth - 8 : 8;
    const textAnchor = this.config.align === 'right' ? 1 : 0;
    
    const itemText = new Text(textX, 0, item.textContent, {
      ...FONTS.default,
      tint: data.fgcolor || this.config.fgcolor
    });
    itemText.anchor.x = textAnchor;
    itemText.y = 1;
    itemParent.addChild(itemText);
    
    if (item.textContent.length * 4 > this.viewport.width -16) {
      itemText.write(item.textContent.substr(0, Math.floor(this.viewport.width - 16) / 4));
    }
    
    item.parent = itemParent;
    item.background = background;
    item.text = itemText;
  }
  
  removeItemVisuals(item) {
    item.parent?.destroy();
    item.parent = null;
    item.background = null;
    item.text = null;
  }
  
  createGradientBackground(width, height, color) {
    const bitmap = game.add.bitmapData(width, height);
    
    const gradient = bitmap.context.createLinearGradient(
      this.config.align === 'right' ? width : 0, 0,
      this.config.align === 'right' ? 0 : width, 0
    );
    
    const bgcolor = color || this.config.bgcolor;
    
    if (this.config.align === 'right') {
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.3, bgcolor);
      gradient.addColorStop(1, bgcolor);
    } else {
      gradient.addColorStop(0, bgcolor);
      gradient.addColorStop(0.7, bgcolor);
      gradient.addColorStop(1, 'transparent');
    }
    
    bitmap.context.fillStyle = gradient;
    bitmap.context.fillRect(0, 0, width, height);
    
    const sprite = game.add.sprite(0, 0, bitmap);
    return sprite;
  }
  
  update() {
    if (!this.inputEnabled) return;
    
    this.handleInput();
    this.updateAnimations();
  }
  
  handleInput() {
    const upPressed = gamepad.pressed.up && !this.lastUp;
    const downPressed = gamepad.pressed.down && !this.lastDown;
    const leftPressed = gamepad.pressed.left && !this.lastLeft;
    const rightPressed = gamepad.pressed.right && !this.lastRight;
    const confirmPressed = gamepad.pressed.a && !this.lastConfirm;
    const cancelPressed = gamepad.pressed.b && !this.lastCancel;
    
    if (upPressed) {
      this.navigate(-1);
    } else if (downPressed) {
      this.navigate(1);
    } else if (leftPressed) {
      this.navigate(-1, true);
    } else if (rightPressed) {
      this.navigate(1, true);
    }
    
    if (confirmPressed && this.items.length > 0) {
      this.confirm();
    }
    
    if (cancelPressed) {
      this.cancel();
    }
    
    this.lastUp = gamepad.pressed.up;
    this.lastDown = gamepad.pressed.down;
    this.lastLeft = gamepad.pressed.left;
    this.lastRight = gamepad.pressed.right;
    this.lastConfirm = gamepad.pressed.a;
    this.lastCancel = gamepad.pressed.b;
  }
  
  navigate(direction, page) {
    if (this.items.length === 0 || this.isAnimating) return;
    
    let scrollAmount = page ? direction * Math.max(1, this.visibleItems) : direction;
    
    let newIndex = this.selectedIndex + scrollAmount;
    
    if (!page) {
      if (newIndex < 0) newIndex = this.items.length - 1;
      if (newIndex > this.items.length - 1) newIndex = 0;
    } else {
      if (newIndex < 0) newIndex = 0;
      if (newIndex > this.items.length - 1) newIndex = this.items.length - 1;
    }
    
    if (newIndex !== this.selectedIndex) {
      this.selectedIndex = newIndex;
      this.updateSelection();
      this.playNavSound();
      this.onSelect.dispatch(this.selectedIndex, this.items[this.selectedIndex]);
      
      // Show scroll bar when navigating
      if (!this.config.disableScrollBar) {
        this.showScrollBar();
      }
    }
  }
  
  selectIndex(index) {
    this.selectedIndex = index;
    this.updateSelection();
    this.onSelect.dispatch(index, this.items[index]);
  }
  
  updateSelection() {
    this.adjustScroll();
    
    this.items.forEach((item, index) => {
      const isSelected = index === this.selectedIndex;
      const isVisible = index >= this.scrollOffset && 
                       index < this.scrollOffset + this.visibleItems;
      
      if (isVisible) {
        if (!item.parent) {
          this.createItemVisuals(item, isSelected);
        }
        if (isSelected && !item.isSelected) {
          this.selectItem(item);
        } else if (!isSelected && item.isSelected) {
          this.deselectItem(item);
        }
      } else {
        if (item.parent) {
          this.removeItemVisuals(item);
        }
        if (item.isSelected) {
          this.deselectItem(item);
        }
      }
    });
    
    this.updateItemPositions();
    
    // Update scroll bar after selection changes
    if (!this.config.disableScrollBar) {
      this.updateScrollBar();
    }
  }
  
  selectItem(item) {
    // Deselect previously selected item
    const previouslySelected = this.items.find(i => i.isSelected && i !== item);
    if (previouslySelected) {
      this.deselectItem(previouslySelected);
    }
    
    item.isSelected = true;
    
    // Stop any existing tween
    if (item.alphaTween) {
      item.alphaTween.stop();
    }
    
    if (item.parent) {
      if (this.config.animate) {
        // Start yoyo animation for selected item
        item.alphaTween = game.add.tween(item.parent)
          .to({ alpha: this.config.activeAlpha }, 250, Phaser.Easing.Quadratic.InOut, true, 0, -1, true)
          .yoyo(true, 500);
      } else {
        item.parent.alpha = this.config.activeAlpha;
      }
      if (item.text && item.textContent.length * 4 > this.viewport.width -16) {
        item.text.scrollwrite(item.textContent, Math.floor(this.viewport.width - 16) / 4);
      }
    }
  }
  
  deselectItem(item) {
    item.isSelected = false;
    
    // Stop yoyo animation
    if (item.alphaTween) {
      item.alphaTween.stop();
      item.alphaTween = null;
    }
    
    // Update visual for unselected items 
    if (item.parent) {
      if (this.config.animate) {
        game.add.tween(item.parent)
          .to({ alpha: this.config.inactiveAlpha }, 100, Phaser.Easing.Quadratic.Out, true);
      } else {
        item.parent.alpha = this.config.inactiveAlpha;
      }
      if (item.text && item.text.isScrolling()) {
        item.text.stopScrolling();
        item.text.write(item.textContent.substr(0, Math.floor(this.viewport.width - 16) / 4));
      }
    }
  }
  
  adjustScroll() {
    if (this.selectedIndex < this.scrollOffset) {
      this.scrollOffset = this.selectedIndex;
    } else if (this.selectedIndex >= this.scrollOffset + this.visibleItems) {
      this.scrollOffset = this.selectedIndex - this.visibleItems + 1;
    }
    
    this.scrollOffset = Phaser.Math.clamp(
      this.scrollOffset,
      0,
      Math.max(0, this.items.length - this.visibleItems)
    );
  }
  
  updateScrollBar() {
    if (this.config.disableScrollBar) return;
    
    // Clear previous scroll bar
    this.scrollBar.clear();
    
    // Only show scroll bar if there are more items than visible
    if (this.items.length <= this.visibleItems) {
      this.hideScrollBar();
      return;
    }
    
    const contentHeight = this.viewport.height - this.config.margin.top - this.config.margin.bottom;
    const totalItems = this.items.length;
    
    // Calculate scroll bar dimensions
    const scrollBarHeight = Math.max(8, (this.visibleItems / totalItems) * contentHeight);
    const scrollBarWidth = 1;
    
    // Calculate scroll bar position
    const scrollRange = totalItems - this.visibleItems;
    const scrollProgress = this.scrollOffset / scrollRange;
    const scrollBarY = scrollProgress * (contentHeight - scrollBarHeight);
    
    // Draw scroll bar using fgcolor
    const fgcolor = Phaser.Color.hexToRGB(this.config.fgcolor);
    this.scrollBar.beginFill(fgcolor, 0.8);
    this.scrollBar.drawRect(0, scrollBarY, scrollBarWidth, scrollBarHeight);
    this.scrollBar.endFill();
    
    // Show scroll bar with fade in
    this.showScrollBar();
  }

  showScrollBar() {
    if (this.config.disableScrollBar) return;
    
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
    if (this.config.disableScrollBar) return;
    
    // Cancel any existing tween
    if (this.scrollBarTween) {
      this.scrollBarTween.stop();
      this.scrollBarTween = null;
    }
    
    // Hide immediately
    this.scrollBar.alpha = 0;
    this.scrollBar.clear();
  }
  
  updateItemPositions() {
    this.items.forEach((item, index) => {
      const visibleIndex = index - this.scrollOffset;
      const targetY = this.config.margin.top + (visibleIndex * this.totalItemHeight);
      
      if (item.parent) {
        if (this.config.animate && !this.isAnimating) {
          game.add.tween(item.parent).to({ y: targetY }, 150, "Quad.easeOut", true);
        } else {
          item.parent.y = targetY;
        }
      } else {
        item.initialY = targetY;
      }
    });
  }
  
  updateAnimations() {
    // Update any ongoing animations here, might be removed 
  }
  
  confirm() {
    if (this.items.length === 0 || this.isAnimating) return;
    
    const selectedItem = this.items[this.selectedIndex];
    this.inputEnabled = false;
    this.isAnimating = true;
    
    this.animateSelection(selectedItem, () => {
      this.onConfirm.dispatch(this.selectedIndex, selectedItem);
      selectedItem.callback?.(selectedItem);
      this.destroy();
    });
  }
  
  animateSelection(item, callback) {
    // Stop all alpha tweens before starting selection animation
    this.items.forEach(otherItem => {
      if (otherItem.alphaTween) {
        otherItem.alphaTween.stop();
        otherItem.alphaTween = null;
      }
    });
    
    if (!item.parent) return;
    
    const fadeDirection = this.config.align === 'right' ? 100 : -100;
    
    this.items.forEach(otherItem => {
      if (otherItem !== item && otherItem.parent && otherItem.parent.visible) {
        game.add.tween(otherItem.parent).to({ 
          x: otherItem.parent.x + fadeDirection,
          alpha: 0 
        }, 500, "Quad.easeOut", true);
      }
    });
    
    // Ensure selected item is fully visible during selection
    if (item.alphaTween) {
      item.alphaTween.stop();
    }
    item.parent.alpha = 1;
    
    // Glow
    const bgWidth = this.viewport.width - this.config.margin.left - this.config.margin.right;
    const bgHeight = this.itemHeight;
    
    const background = this.createGradientBackground(bgWidth, bgHeight);
    background.x = this.config.align === 'right' ? this.config.margin.right : this.config.margin.left;
    background.alpha = 0;
    item.parent.addChild(background);
    
    const glowTween = game.add.tween(background).to({ alpha: 1 }, 100, "Linear", true);
    
    glowTween.onComplete.addOnce(() => {
      item.text.visible = false;
      const fadeOutTween = game.add.tween(item.parent).to({ alpha: 0 }, 100, "Linear", true);
      fadeOutTween.onComplete.addOnce(() => {
        callback?.();
      });
    });
    
    ENABLE_UI_SFX && Audio.play('ui_select');
  }
  
  animateCancel(callback) {
    // Stop all alpha tweens before starting selection animation
    this.items.forEach(item => {
      if (item.alphaTween) {
        item.alphaTween.stop();
        item.alphaTween = null;
      }
    });
    
    const fadeDirection = this.config.align === 'right' ? 100 : -100;
    
    this.items.forEach(item => {
      if (item.parent && item.parent.visible) {
        game.add.tween(item.parent).to({ 
          x: item.parent.x + fadeDirection,
          alpha: 0 
        }, 500, "Quad.easeOut", true);
      }
    });
    
    game.time.events.add(500, () => callback?.());
  }
  
  cancel() {
    if (!this.isAnimating && this.onCancel.getNumListeners() > 0) {
      ENABLE_UI_SFX && Audio.play('ui_cancel');
      this.animateCancel(() => {
        this.onCancel.dispatch();
        this.destroy();
      });
    }
  }
  
  playNavSound() {
    ENABLE_UI_SFX && Audio.play('ui_nav');
  }
  
  clear() {
    // Stop all tweens before clearing
    this.items.forEach(item => {
      this.removeItemVisuals(item);
      if (item.alphaTween) {
        item.alphaTween.stop();
      }
      if (item.parent) {
        item.parent.destroy();
      }
    });
    this.items = [];
    this.selectedIndex = 0;
    this.scrollOffset = 0;
    
    // Clean up scroll bar tween
    if (!this.config.disableScrollBar && this.scrollBarTween) {
      this.scrollBarTween.stop();
      this.scrollBarTween = null;
    }

    // Destroy the signals
    this.onSelect.dispose();
    this.onConfirm.dispose();
    this.onCancel.dispose();
  }
  
  destroy() {
    this.clear();
    super.destroy();
  }
}
