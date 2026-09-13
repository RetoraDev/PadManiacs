/**
 * @class TextInput
 * @category UI Classes
 * @summary Text input dialog for character naming
 * @constructor
 * @param {object} [config={}] - Input configuration (text, limits, callbacks, etc.)
 * @features
 * Character-by-character input with a blinking cursor
 * Charset whitelists and limited-character usage counts
 * Move, insert, and erase editing with multi-line support
 * Dispatches onConfirm and onCancel signals
 * @description
 * TextInput is a modal text editor backed by a Window for entering names or
 * other short strings. It supports moving the cursor, inserting and erasing
 * characters, optional newlines, character whitelists, and per-character
 * usage limits. It is used by naming screens and dispatches the final text
 * through its onConfirm signal.
 * @example
 * // Modding usage example
 * const input = new TextInput({
 *   text: 'Player',
 *   maxLength: 12,
 *   x: 120, y: 35, width: 14, height: 2,
 *   onConfirm: (name) => setName(name)
 * });
 */
class TextInput extends Phaser.Sprite {
  constructor(config = {}) {
    config = {
      text: "",
      x: 120,
      y: 35,
      width: 8,
      height: 2,
      useNewLine: false,
      maxLength: 28,
      onConfirm: null,
      onCancel: null,
      charset: null, // allow any character
      limitedCharacters: null, // do not limit characters
      ...config
    };
    
    const { x, y, width, height } = config;
    
    super(game, x, y);
    this.anchor.x = 0.5;
    
    /** @type {object} Merged input configuration */
    this.config = config;
    
    /** @type {object} Window and cell dimensions ({ cells, width, height }) */
    this.size = {
      cells: {
        x: width,
        y: height
      },
      width: (width - 1) * 8,
      height: height * 8
    };

    /** @type {Window} Background window hosting the input text */
    this.window = new Window(0, 0, width, height, "1", this);
    this.window.x -= (this.window.size.width / 2) * 8;
    
    /** @type {number} Maximum number of characters allowed */
    this.maxLength = config.maxLength;
    /** @type {string} Current text being edited */
    this.text = config.text.slice(0, this.maxLength);
    /** @type {number} Cursor position within the text */
    this.currentIndex = this.text.length;
    
    /** @type {Text} Text layer that renders and wraps the input text */
    this.textLayer = new Text(3, 5, "");
    this.textLayer.tint = this.window.fontTint;
    this.window.addChild(this.textLayer);

    /** @type {Phaser.Graphics} Blinking cursor rectangle */
    this.cursor = game.add.graphics(0, 0);
    this.cursor.beginFill(this.window.fontTint, 1);
    this.cursor.drawRect(0, 0, 2, 5);
    this.cursor.endFill();
    this.textLayer.addChild(this.cursor);
    
    this.lastCursorBlinkTime = 0;
    this.cursorVisible = false;
    
    /** @type {Phaser.Signal} Dispatched with the final text when confirmed */
    this.onConfirm = new Phaser.Signal();
    /** @type {Phaser.Signal} Dispatched with the current text when cancelled */
    this.onCancel = new Phaser.Signal();
    
    this.updateCursor();

    if (config.onConfirm) {
      this.onConfirm.add(config.onConfirm);
    }
    if (config.onCancel) {
      this.onCancel.add(config.onCancel);
    }

    game.add.existing(this);
  }
  
  /**
   * Returns whether a character passes charset and usage-limit checks.
   * @param {string} char - The single character to validate
   * @returns {boolean} True when the character may be inserted
   */
  validateCharInput(char) {
    const isValidChar = typeof char == 'string' && char.length == 1;
    const isCharAllowed = this.config.charset ? this.config.charset.includes(char) : true;
    const isCharLimited = this.config.limitedCharacters && typeof this.config.limitedCharacters[char] != undefined; 
    const isCharExhausted = isCharLimited && this.config.limitedCharacters[char] <= this.countCharacter(char);
    return isValidChar && isCharAllowed && !isCharExhausted;
  }
  
  /**
   * Counts how many times a character appears in the current text.
   * @param {string} char - The character to count
   * @returns {number} Occurrence count
   */
  countCharacter(char) {
    let count = 0;
    
    for (const c of this.text) {
      if (c == char) count ++;
    }
    
    return count;
  }

  /**
   * Handles an incoming key event, inserting glyphs or running actions.
   * @param {object} key - Key event with an optional action string
   * @param {string} input - The character to insert (ignored for actions)
   */
  receiveInput(key, input) {
    const isAtMaxLength = this.isAtMaxLength();
    
    // Insert glyph 
    if (!isAtMaxLength) {
      if (!key.action) {
        this.insertCharacter(input);
      }
    } else {
      // buzzer sound goes here
    }
    
    // Special keys logic
    if (key.action) {
      switch (key.action) {
        // Move cursor
        case 'up':
        case 'down':
        case 'left':
        case 'right':
          this.moveCursor(key.action);
          break;
          
        // Insert newline or confirm
        case 'enter':
          if (this.useNewLine) { // TODO: Limit new line
            this.insertCharacter('\n');
          } else {
            this.confirm();
          }
          break;
        
        // Remove glyph
        case 'erase':
          this.erase();
          break;
      }
    }
  }
  
  /**
   * Inserts a validated character at the cursor position.
   * @param {string} input - The single character to insert
   */
  insertCharacter(input) {
    const left = this.text.slice(0, this.currentIndex);
    const right = this.text.slice(this.currentIndex);
    
    if (this.validateCharInput(input)) {
      this.text = left + input + right;
      this.currentIndex ++;
      this.updateCursor();
    }
  }
  
  /**
   * Erases the character just before the cursor position.
   */
  erase() {
    const left = this.text.slice(0, this.currentIndex);
    const right = this.text.slice(this.currentIndex);
    
    if (left.length) {
      this.text = left.slice(0, left.length -1) + right;
      this.currentIndex --;
      this.updateCursor();
    }
  }
  
  /**
   * Moves the cursor in the given direction across lines and wraps.
   * @param {string} dir - One of 'left', 'right', 'up', or 'down'
   */
  moveCursor(dir) {
    switch (dir) {
      case 'left':
        if (this.currentIndex > 0) this.currentIndex--;
        break;
      case 'right':
        if (this.currentIndex < this.text.length) this.currentIndex++;
        break;
      case 'up':
        const lineWidth = this.getMaxCharsPerLine();
        this.currentIndex -= lineWidth;
        if (this.currentIndex < 0) this.currentIndex = 0;
        break;
      case 'down':
        const lineWidthDown = this.getMaxCharsPerLine();
        this.currentIndex += lineWidthDown;
        if (this.currentIndex > this.text.length) this.currentIndex = this.text.length;
        break;
    }
    
    this.updateCursor();
  }
  
  /**
   * Returns the number of characters that fit on one input line.
   * @returns {number} Maximum characters per line
   */
  getMaxCharsPerLine() {
    return this.textLayer.getMaxCharsPerLine(this.size.width);
  }
  
  /**
   * Returns whether the text has reached its maximum length.
   * @returns {boolean} True at the character limit
   */
  isAtMaxLength() {
    return this.text.length >= this.maxLength;
  }
  
  /**
   * Computes the cursor's cell position accounting for word wrapping.
   * @returns {object} Cursor cell position ({ x, y })
   */
  getLocalCursorPosition() {
    const maxChars = this.getMaxCharsPerLine();
    
    let i = 0, x = 0, y = 0;
    
    // Count chars one by one to get position 
    for (const char of this.text) {
      if (i == this.currentIndex) {
        return { x, y };
      }
      if (char == '\n') {
        x = 0;
        y ++;
      } else if (x >= maxChars) {
        x = 1;
        y ++;
      } else {
        x ++;
      }
      i++;
    }
    
    return { x, y };
  }
  
  /**
   * Rewrites the wrapped text layer and repositions the cursor sprite.
   */
  updateCursor() {
    const isAtMaxLength = this.isAtMaxLength();

    this.textLayer.write(this.text);
    this.textLayer.wrap(this.size.width);

    const { x, y } = this.getLocalCursorPosition();
    
    this.cursor.x = x * 4;
    this.cursor.y = y * 7;
  }

  /**
   * Blinks the cursor and refreshes its visibility each frame.
   */
  update() {
    this.cursor.visible = !this.isAtMaxLength() && this.cursorVisible;

    // Blink cursor
    if (game.time.now - this.lastCursorBlinkTime >= 350) {
      this.cursorVisible = !this.cursorVisible;
      this.lastCursorBlinkTime = game.time.now;
    }
  }
  
  /**
   * Dispatches the current text on onConfirm and destroys the input.
   */
  confirm() {
    this.onConfirm.dispatch(this.text);
    this.destroy();
  }
  
  /**
   * Dispatches the current text on onCancel and destroys the input.
   */
  cancel() {
    this.onCancel.dispatch(this.text);
    this.destroy();
  }
  
  /**
   * Destroys the sprite and disposes the input signals.
   */
  destroy() {
    super.destroy();
    this.onConfirm.dispose();
    this.onCancel.dispose();
    if (window.focusedElement == this) {
      window.focusedElement = null;
    }
  }
}
