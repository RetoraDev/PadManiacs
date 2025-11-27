class DialogWindow extends Phaser.Sprite {
  constructor(text, options = {}) {
    const {
      x = game.width / 2,
      y = game.height / 2,
      anchorX = 0.5,
      anchorY = 0.5,
      maxWidth = 180,
      maxHeight = 80,
      buttons = ['OK'],
      defaultButton = 0,
      enableTextScroll = true,
      parent = null
    } = options;

    super(game, x, y);
    
    this.anchor.set(anchorX, anchorY);

    this.text = text;
    this.buttons = buttons;
    this.selectedButton = defaultButton;
    this.enableTextScroll = enableTextScroll;
    this.currentScroll = 0;
    this.maxScroll = 0;
    this.fontTint = 0x76fcde;
    this.isActive = true;
    
    if (parent) {
      parent.addChild(this);
    } else {
      game.add.existing(this);
    }

    this.createDialog();
  }

  createDialog() {
    // Create window background using Window class
    const { width, height, wrappedText } = this.calculateWindowSize();
    
    this.window = new Window(0, 0, width, height, "1", this);
    this.window.x -= this.window.size.width * 8 * this.anchor.x;
    this.window.y -= this.window.size.height * 8 * this.anchor.y;
    this.window.focus = false;
    this.window.selector.visible = false;
    
    // Create text content
    this.createTextContent(wrappedText);
    
    // Create buttons
    this.createButtonElements();
    
    // Set up input handling
    this.setupInputHandling();
  }

  calculateWindowSize() {
    // Wrap the text
    const wrappedText = this.wrapText(this.text);
    const lineCount = wrappedText.length;
    
    // Calculate required dimensions - ensure minimum height for text
    const textHeight = Math.max(lineCount * 6, 6) + 16; // At least one line height + padding
    const buttonHeight = 12;
    const totalHeight = textHeight + buttonHeight;
    
    // Ensure minimum window height to prevent text cutoff
    const minHeightInUnits = Math.ceil((6 * 3 + 16 + 12) / 8); // At least 3 lines of text
    const calculatedHeight = Math.floor(totalHeight / 8);
    const finalHeight = Math.max(minHeightInUnits, calculatedHeight);
    
    const width = Math.floor(180 / 8); // Convert to 8px units
    
    return {
      width: width,
      height: finalHeight,
      wrappedText: wrappedText
    };
  }

  wrapText(text) {
    const maxLineWidth = 160; // pixels
    const charWidth = 4;
    const charsPerLine = Math.floor(maxLineWidth / charWidth);
    
    const lines = text.split('\n');
    const wrappedLines = [];
    
    for (let line of lines) {
      if (this.getTextWidth(line) <= maxLineWidth) {
        wrappedLines.push(line);
        continue;
      }
      
      let currentLine = '';
      const words = line.split(' ');
      
      for (let word of words) {
        if (this.getTextWidth(word) > maxLineWidth) {
          if (currentLine) {
            wrappedLines.push(currentLine.trim());
            currentLine = '';
          }
          const brokenWord = this.breakLongWord(word, charsPerLine);
          wrappedLines.push(...brokenWord);
          continue;
        }
        
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (this.getTextWidth(testLine) <= maxLineWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            wrappedLines.push(currentLine.trim());
          }
          currentLine = word;
        }
      }
      
      if (currentLine) {
        wrappedLines.push(currentLine.trim());
      }
    }
    
    return wrappedLines;
  }

  breakLongWord(word, charsPerLine) {
    const chunks = [];
    let currentChunk = '';
    
    for (let i = 0; i < word.length; i++) {
      currentChunk += word[i];
      if (currentChunk.length >= charsPerLine || i === word.length - 1) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
    }
    
    return chunks;
  }

  getTextWidth(text) {
    return text.length * 4; // 4px per character
  }

  createTextContent(wrappedText) {
    this.textLines = [];
    this.allTextLines = wrappedText;
    
    const startY = 8;
    const textAreaHeight = (this.window.size.height * 8) - 28; // Total available height for text (window height - padding - buttons)
    const lineHeight = 6;
    this.maxVisibleLines = Math.floor(textAreaHeight / lineHeight);
    
    this.maxScroll = Math.max(0, wrappedText.length - this.maxVisibleLines);
    const visibleLines = wrappedText.slice(this.currentScroll, this.currentScroll + this.maxVisibleLines);
    
    visibleLines.forEach((line, index) => {
      const text = new Text(8, startY + (index * lineHeight), line, {
        ...FONTS.default,
        tint: this.fontTint
      });
      this.window.addChild(text);
      this.textLines.push(text);
    });
    
    this.updateScrollIndicator();
    this.updateScrollBar(); // Add scrollbar
  }

  createButtonElements() {
    this.buttonTexts = [];
    const buttonAreaY = this.window.size.height * 8 - 12;
    const totalButtonWidth = this.buttons.length * 40;
    const startX = (this.window.size.width * 8 - totalButtonWidth) / 2;
    
    this.buttons.forEach((buttonText, index) => {
      const buttonX = startX + (index * 40);
      const button = new Text(buttonX, buttonAreaY, buttonText, {
        ...FONTS.default,
        tint: this.fontTint
      });
      button.anchor.x = 0.5;
      this.window.addChild(button);
      this.buttonTexts.push(button);
    });
    
    this.updateButtonSelection();
  }

  updateButtonSelection() {
    this.buttonTexts.forEach((button, index) => {
      button.selected = index === this.selectedButton;
    });
  }

  updateScrollIndicator() {
    // Remove existing scroll indicator
    if (this.scrollIndicator) {
      this.scrollIndicator.destroy();
    }
    
    // Show scroll indicator if text can be scrolled
    if (this.enableTextScroll && this.maxScroll > 0) {
      const indicatorX = this.window.size.width * 8 - 8;
      const indicatorY = this.window.size.height * 8 - 20;
      
      this.scrollIndicator = new Text(indicatorX, indicatorY, ">", {
        ...FONTS.default,
        tint: this.fontTint
      });
      this.scrollIndicator.anchor.set(1, 0.5);
      this.window.addChild(this.scrollIndicator);
      
      // Blink animation for scroll indicator
      game.add.tween(this.scrollIndicator).to({ alpha: 0 }, 500, "Linear", true, 0, -1).yoyo(true);
    }
  }
  
  updateScrollBar() {
    // Remove existing scroll bar
    if (this.scrollBar) {
      this.scrollBar.destroy();
    }
    
    // Only show scroll bar if text can be scrolled
    if (this.enableTextScroll && this.maxScroll > 0) {
      const scrollBarX = this.window.size.width * 8 - 4;
      const textAreaY = 8;
      const textAreaHeight = (this.window.size.height * 8) - 28;
      
      // Calculate scroll bar dimensions
      const totalTextHeight = this.allTextLines.length * 6;
      const visibleRatio = textAreaHeight / totalTextHeight;
      const scrollBarHeight = Math.max(8, textAreaHeight * visibleRatio);
      
      // Calculate scroll bar position
      const scrollRange = this.maxScroll;
      const scrollProgress = this.currentScroll / scrollRange;
      const availableScrollSpace = textAreaHeight - scrollBarHeight;
      const scrollBarY = textAreaY + (scrollProgress * availableScrollSpace);
      
      // Create scroll bar graphics
      this.scrollBar = game.add.graphics(scrollBarX, scrollBarY);
      this.scrollBar.beginFill(this.fontTint, 0.8);
      this.scrollBar.drawRect(0, 0, 2, scrollBarHeight);
      this.scrollBar.endFill();
      this.window.addChild(this.scrollBar);
    }
  }

  setupInputHandling() {
    this.onConfirm = new Phaser.Signal();
    this.onCancel = new Phaser.Signal();
    
    // Use gamepad signals instead of checking pressed states
    this.setupGamepadSignals();
  }

  setupGamepadSignals() {
    // Store the original signal handlers to restore later
    this.originalLeftHandler = gamepad.signals.pressed.left;
    this.originalRightHandler = gamepad.signals.pressed.right;
    this.originalUpHandler = gamepad.signals.pressed.up;
    this.originalDownHandler = gamepad.signals.pressed.down;
    this.originalAHandler = gamepad.signals.pressed.a;
    this.originalBHandler = gamepad.signals.pressed.b;
    
    // Override the signals for dialog navigation
    gamepad.signals.pressed.left.add(this.onLeftPressed, this);
    gamepad.signals.pressed.right.add(this.onRightPressed, this);
    gamepad.signals.pressed.up.add(this.onUpPressed, this);
    gamepad.signals.pressed.down.add(this.onDownPressed, this);
    gamepad.signals.pressed.a.add(this.onAPressed, this);
    gamepad.signals.pressed.b.add(this.onBPressed, this);
  }

  onLeftPressed() {
    if (!this.isActive) return;
    
    this.selectedButton = Math.max(0, this.selectedButton - 1);
    this.updateButtonSelection();
    ENABLE_UI_SFX && Audio.play('ui_nav');
  }

  onRightPressed() {
    if (!this.isActive) return;
    
    this.selectedButton = Math.min(this.buttons.length - 1, this.selectedButton + 1);
    this.updateButtonSelection();
    ENABLE_UI_SFX && Audio.play('ui_nav');
  }

  onUpPressed() {
    if (!this.isActive || !this.enableTextScroll) return;
    
    if (this.currentScroll > 0) {
      this.currentScroll--;
      this.refreshTextContent();
      ENABLE_UI_SFX && Audio.play('ui_nav');
    }
  }

  onDownPressed() {
    if (!this.isActive || !this.enableTextScroll) return;
    
    if (this.currentScroll < this.maxScroll) {
      this.currentScroll++;
      this.refreshTextContent();
      ENABLE_UI_SFX && Audio.play('ui_nav');
    }
  }

  onAPressed() {
    if (!this.isActive) return;
    
    this.confirm();
  }

  onBPressed() {
    if (!this.isActive) return;
    
    this.cancel();
  }

  refreshTextContent() {
    // Remove existing text lines
    this.textLines.forEach(text => text.destroy());
    this.textLines = [];
    
    // Remove existing scroll bar
    if (this.scrollBar) {
      this.scrollBar.destroy();
      this.scrollBar = null;
    }
    
    // Create new text content with current scroll
    const startY = 8;
    const lineHeight = 6;
    const visibleLines = this.allTextLines.slice(this.currentScroll, this.currentScroll + this.maxVisibleLines);
    
    visibleLines.forEach((line, index) => {
      const text = new Text(8, startY + (index * lineHeight), line, {
        ...FONTS.default,
        tint: this.fontTint
      });
      this.window.addChild(text);
      this.textLines.push(text);
    });
    
    this.updateScrollIndicator();
    this.updateScrollBar(); // Update scrollbar position
  }

  confirm() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.onConfirm.dispatch(this.selectedButton, this.buttons[this.selectedButton]);
    ENABLE_UI_SFX && Audio.play('ui_select');
    this.cleanup();
  }

  cancel() {
    if (!this.isActive) return;
    
    this.isActive = false;
    // Find cancel button (usually "No" or "Cancel")
    const cancelIndex = this.buttons.findIndex(btn => 
      btn.toUpperCase().includes('NO') || 
      btn.toUpperCase().includes('CANCEL') ||
      btn.toUpperCase().includes('BACK')
    );
    
    if (cancelIndex !== -1) {
      this.selectedButton = cancelIndex;
      this.onConfirm.dispatch(this.selectedButton, this.buttons[this.selectedButton]);
      ENABLE_UI_SFX && Audio.play('ui_select');
    } else {
      this.onCancel.dispatch(this.selectedButton);
      ENABLE_UI_SFX && Audio.play('ui_cancel');
    }
    this.cleanup();
  }
  
  update() {
    // Update button animations
    if (this.buttonTexts) {
      const time = game.time.now * 0.01; // Slow down the animation
      this.buttonTexts.forEach((button, index) => {
        if (index === this.selectedButton) {
          // Sine wave alpha animation: oscillates between 0.5 and 1.0
          const alpha = 0.75 + Math.sin(time) * 0.25;
          button.alpha = Math.max(0.5, Math.min(1.0, alpha));
        } else {
          // Non-selected buttons are fully opaque
          button.alpha = 1.0;
        }
      });
    }
  }

  cleanup() {
    // Restore original gamepad signal handlers
    this.restoreGamepadSignals();
  }

  restoreGamepadSignals() {
    gamepad.signals.pressed.left.remove(this.onLeftPressed, this);
    gamepad.signals.pressed.right.remove(this.onRightPressed, this);
    gamepad.signals.pressed.up.remove(this.onUpPressed, this);
    gamepad.signals.pressed.down.remove(this.onDownPressed, this);
    gamepad.signals.pressed.a.remove(this.onAPressed, this);
    gamepad.signals.pressed.b.remove(this.onBPressed, this);
    
    // Restore original handlers if they existed
    if (this.originalLeftHandler) {
      gamepad.signals.pressed.left.add(this.originalLeftHandler);
    }
    if (this.originalRightHandler) {
      gamepad.signals.pressed.right.add(this.originalRightHandler);
    }
    if (this.originalUpHandler) {
      gamepad.signals.pressed.up.add(this.originalUpHandler);
    }
    if (this.originalDownHandler) {
      gamepad.signals.pressed.down.add(this.originalDownHandler);
    }
    if (this.originalAHandler) {
      gamepad.signals.pressed.a.add(this.originalAHandler);
    }
    if (this.originalBHandler) {
      gamepad.signals.pressed.b.add(this.originalBHandler);
    }
  }

  destroy() {
    if (this.isActive) {
      this.cleanup();
    }
    if (this.window) {
      this.window.destroy();
    }
    super.destroy();
  }
}