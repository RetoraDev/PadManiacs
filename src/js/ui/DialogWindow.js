/**
 * @class DialogWindow
 * @category UI Classes
 * @summary Modal dialog windows for confirmations
 * @constructor
 * @param {string} text - Dialog message text
 * @param {object} [options={}] - Dialog options (position, buttons, scrolling, etc.)
 * @features
 * Centered modal with an auto-sized window
 * Word-wrapped text with optional scrolling
 * Multiple selectable buttons with gamepad and mouse support
 * Mouse wheel text scrolling and clickable buttons
 * Dispatches onConfirm and onCancel signals
 * @description
 * DialogWindow shows a modal message with a set of buttons and dispatches the
 * chosen button. The window auto-sizes to the wrapped text, can display a
 * blinking scroll indicator when text overflows, and supports gamepad, mouse,
 * and keyboard interaction. It is used for confirmation prompts across the UI.
 * @example
 * // Modding usage example
 * const dialog = new DialogWindow('Delete save?', {
 *   buttons: ['Cancel', 'Delete'],
 *   defaultButton: 0
 * });
 * dialog.onConfirm.add((index, label) => {
 *   if (index === 1) deleteSave();
 * });
 */
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
      enableTextScroll = false,
      disableMouse = false,
      parent = null
    } = options;

    super(game, x, y);
    
    this.anchor.set(anchorX, anchorY);

    /** @type {string} Raw dialog message text */
    this.text = text;
    /** @type {Array} Button labels shown at the bottom of the dialog */
    this.buttons = buttons;
    /** @type {number} Index of the currently selected button */
    this.selectedButton = defaultButton;
    /** @type {boolean} Whether the text content can be scrolled with the pad */
    this.enableTextScroll = enableTextScroll;
    /** @type {boolean} Whether mouse interaction is disabled */
    this.disableMouse = disableMouse;
    /** @type {number} Current scroll offset of the text lines */
    this.currentScroll = 0;
    /** @type {number} Maximum scroll offset for the text content */
    this.maxScroll = 0;
    /** @type {number} Tint color applied to text and buttons */
    this.fontTint = 0x76fcde;
    /** @type {boolean} Whether the dialog is active and can accept input */
    this.isActive = true;
    
    if (parent) {
      parent.addChild(this);
    } else {
      game.add.existing(this);
    }

    this.createDialog();
  }

  /**
   * Builds the window frame, text content, buttons, and input handling.
   */
  createDialog() {
    // Create window background using Window class
    const { width, height, wrappedText } = this.calculateWindowSize();
    
    /** @type {Window} The window frame that draws the dialog background */
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

  /**
   * Computes the window size needed for the wrapped text plus buttons.
   * @returns {object} Width, height, and the wrapped text lines
   */
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

  /**
   * Wraps the dialog text into lines that fit the maximum line width.
   * @param {string} text - The text to wrap
   * @returns {Array} Array of wrapped lines
   */
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

  /**
   * Splits a word longer than one line into fixed-size chunks.
   * @param {string} word - The word to break apart
   * @param {number} charsPerLine - Characters per chunk
   * @returns {Array} Array of chunks
   */
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

  /**
   * Estimates the rendered width of a text string at 4px per character.
   * @param {string} text - The text to measure
   * @returns {number} Width in pixels
   */
  getTextWidth(text) {
    return text.length * 4; // 4px per character
  }

  /**
   * Creates the visible text lines and the scroll indicator and scroll bar.
   * @param {Array} wrappedText - Wrapped lines to display
   */
  createTextContent(wrappedText) {
    /** @type {Array} Visible Text sprites showing the current lines */
    this.textLines = [];
    /** @type {Array} All wrapped text lines, including those scrolled out of view */
    this.allTextLines = wrappedText;
    
    const startY = 8;
    const textAreaHeight = (this.window.size.height * 8) - 28; // Total available height for text (window height - padding - buttons)
    const lineHeight = 6;
    /** @type {number} Maximum number of text lines shown at once */
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

  /**
   * Creates the button texts, sizes them, and wires up mouse handlers.
   */
  createButtonElements() {
    /** @type {Array} Text sprites for each button label */
    this.buttonTexts = [];
    const buttonAreaY = this.window.size.height * 8 - 12;
    
    // Calculate actual button widths based on text content
    const buttonWidths = this.buttons.map(buttonText => {
      return buttonText.length * 4 + 16; // Text width + padding
    });
    
    const totalButtonWidth = buttonWidths.reduce((sum, width) => sum + width, 0);
    const buttonSpacing = 8; // Space between buttons
    const startX = (this.window.size.width * 8 - totalButtonWidth - (buttonSpacing * (this.buttons.length - 1))) / 2;
    
    let currentX = startX;
    this.buttons.forEach((buttonText, index) => {
      const button = new Text(currentX + (buttonWidths[index] / 2), buttonAreaY, buttonText, {
        ...FONTS.default,
        tint: this.fontTint
      });
      button.anchor.x = 0.5;
      this.window.addChild(button);
      this.buttonTexts.push(button);
      
      // Move to next button position
      currentX += buttonWidths[index] + buttonSpacing;
      
      // Add mouse event listeners
      button.inputEnabled = !this.disableMouse;
      button.useHandCursor = true;
      button.events.onInputDown.add(() => this.confirm());
      button.events.onInputOver.add(() => this.selectIndex(index));
    });
    
    this.updateButtonSelection();
  }
  
  /**
   * Marks the button matching the selected index as selected.
   */
  updateButtonSelection() {
    this.buttonTexts.forEach((button, index) => {
      button.selected = index === this.selectedButton;
    });
  }

  /**
   * Creates or removes the blinking scroll indicator based on overflow.
   */
  updateScrollIndicator() {
    // Remove existing scroll indicator
    if (this.scrollIndicator) {
      this.scrollIndicator.destroy();
    }
    
    // Show scroll indicator if text can be scrolled
    if (this.enableTextScroll && this.maxScroll > 0) {
      const indicatorX = this.window.size.width * 8 - 8;
      const indicatorY = this.window.size.height * 8 - 20;
      
      /** @type {Text} Blinking indicator that the text can be scrolled */
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
  
  /**
   * Draws the scroll bar sized to the visible-to-total text ratio.
   */
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
      /** @type {Phaser.Graphics} Scroll bar showing the visible-text ratio */
      this.scrollBar = game.add.graphics(scrollBarX, scrollBarY);
      this.scrollBar.beginFill(this.fontTint, 0.8);
      this.scrollBar.drawRect(0, 0, 2, scrollBarHeight);
      this.scrollBar.endFill();
      this.window.addChild(this.scrollBar);
    }
  }

  /**
   * Creates the dialog signals and wires up gamepad button handlers.
   */
  setupInputHandling() {
    /** @type {Phaser.Signal} Dispatched when a button is confirmed */
    this.onConfirm = new Phaser.Signal();
    /** @type {Phaser.Signal} Dispatched when the dialog is cancelled */
    this.onCancel = new Phaser.Signal();
    
    // Use gamepad signals instead of checking pressed states
    this.setupGamepadSignals();
  }

  /**
   * Subscribes the per-dialog handlers to the global gamepad signals.
   */
  setupGamepadSignals() {
    // Add signals for dialog navigation
    gamepad.signals.pressed.left.add(this.onLeftPressed, this);
    gamepad.signals.pressed.right.add(this.onRightPressed, this);
    gamepad.signals.pressed.up.add(this.onUpPressed, this);
    gamepad.signals.pressed.down.add(this.onDownPressed, this);
    gamepad.signals.pressed.a.add(this.onAPressed, this);
    gamepad.signals.pressed.b.add(this.onBPressed, this);
  }
  
  /**
   * Selects the button at the given index and updates button visuals.
   * @param {number} index - Button index to select
   */
  selectIndex(index) {
    this.selectedButton = index;
    this.updateButtonSelection();
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
    }
  }

  onDownPressed() {
    if (!this.isActive || !this.enableTextScroll) return;
    
    if (this.currentScroll < this.maxScroll) {
      this.currentScroll++;
      this.refreshTextContent();
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

  /**
   * Rebuilds the visible text lines and scroll bar for the current scroll.
   */
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

  /**
   * Confirms the selected button, dispatches onConfirm, then cleans up.
   */
  confirm() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.onConfirm.dispatch(this.selectedButton, this.buttons[this.selectedButton]);
    ENABLE_UI_SFX && Audio.play('ui_select');
    this.cleanup();
  }

  /**
   * Cancels the dialog, confirming the cancel-ish button or dispatching onCancel.
   */
  cancel() {
    if (!this.isActive) return;
    
    this.isActive = false;
    // Find cancel button (usually "No" or "Cancel")
    const cancelIndex = this.cancelIndex || this.buttons.findIndex(btn => 
      btn.toUpperCase().includes('NO') || 
      btn.toUpperCase().includes('CANCEL') ||
      btn.toUpperCase().includes('BACK') ||
      btn.toUpperCase().includes('LATER')
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
  
  /**
   * Animates the selected button and handles mouse wheel text scrolling.
   */
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
    
    // Update mouse wheel scrolling
    if (mouse.wheel.up) {
      this.onUpPressed();
    } else if (mouse.wheel.down) {
      this.onDownPressed();
    }
  }

  /**
   * Removes the dialog's gamepad signal handlers after it closes.
   */
  cleanup() {
    // Remove original gamepad signal handlers
    this.removeGamepadSignals();
  }

  /**
   * Unsubscribes all dialog handlers from the global gamepad signals.
   */
  removeGamepadSignals() {
    gamepad.signals.pressed.left.remove(this.onLeftPressed, this);
    gamepad.signals.pressed.right.remove(this.onRightPressed, this);
    gamepad.signals.pressed.up.remove(this.onUpPressed, this);
    gamepad.signals.pressed.down.remove(this.onDownPressed, this);
    gamepad.signals.pressed.a.remove(this.onAPressed, this);
    gamepad.signals.pressed.b.remove(this.onBPressed, this);
    gamepad.pressed.a = false;
    gamepad.pressed.b = false;
  }

  /**
   * Destroys the dialog, its window, and its gamepad subscriptions.
   */
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