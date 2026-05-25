class TextInput extends Phaser.Sprite {
  constructor(config = {}) {
    config = {
      text: "",
      x: 120,
      y: 35,
      width: 8,
      height: 2,
      useNewLine: true,
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
    
    this.config = config;
    
    this.size = {
      cells: {
        x: width,
        y: height
      },
      width: (width - 1) * 8,
      height: height * 8
    };

    this.window = new Window(0, 0, width, height, "1", this);
    this.window.x -= (this.window.size.width / 2) * 8;
    
    this.maxLength = config.maxLength;
    this.text = config.text.slice(0, this.maxLength);
    this.currentIndex = this.text.length;
    
    this.textLayer = new Text(3, 5, "");
    this.textLayer.tint = this.window.fontTint;
    this.window.addChild(this.textLayer);

    this.cursor = game.add.graphics(0, 0);
    this.cursor.beginFill(this.window.fontTint, 1);
    this.cursor.drawRect(0, 0, 2, 5);
    this.cursor.endFill();
    this.textLayer.addChild(this.cursor);
    
    this.lastCursorBlinkTime = 0;
    this.cursorVisible = false;
    
    this.onConfirm = new Phaser.Signal();
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
  
  validateCharInput(char) {
    const isValidChar = typeof char == 'string' && char.length == 1;
    const isCharAllowed = this.config.charset ? this.config.charset.includes(char) : true;
    const isCharLimited = this.config.limitedCharacters && typeof this.config.limitedCharacters[char] != undefined; 
    const isCharExhausted = isCharLimited && this.config.limitedCharacters[char] <= this.countCharacter(char);
    return isValidChar && isCharAllowed && !isCharExhausted;
  }
  
  countCharacter(char) {
    let count = 0;
    
    for (const c of this.text) {
      if (c == char) count ++;
    }
    
    return count;
  }

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
  
  insertCharacter(input) {
    const left = this.text.slice(0, this.currentIndex);
    const right = this.text.slice(this.currentIndex);
    
    if (this.validateCharInput(input)) {
      this.text = left + input + right;
      this.currentIndex ++;
      this.updateCursor();
    }
  }
  
  erase() {
    const left = this.text.slice(0, this.currentIndex);
    const right = this.text.slice(this.currentIndex);
    
    if (left.length) {
      this.text = left.slice(0, left.length -1) + right;
      this.currentIndex --;
      this.updateCursor();
    }
  }
  
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
  
  getMaxCharsPerLine() {
    return this.textLayer.getMaxCharsPerLine(this.size.width);
  }
  
  isAtMaxLength() {
    return this.text.length >= this.maxLength;
  }
  
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
  
  updateCursor() {
    const isAtMaxLength = this.isAtMaxLength();

    this.textLayer.write(this.text);
    this.textLayer.wrap(this.size.width);

    const { x, y } = this.getLocalCursorPosition();
    
    this.cursor.x = x * 4;
    this.cursor.y = y * 7;
  }

  update() {
    this.cursor.visible = !this.isAtMaxLength() && this.cursorVisible;

    // Blink cursor
    if (game.time.now - this.lastCursorBlinkTime >= 350) {
      this.cursorVisible = !this.cursorVisible;
      this.lastCursorBlinkTime = game.time.now;
    }
  }
  
  confirm() {
    this.onConfirm.dispatch(this.text);
    this.destroy();
  }
  
  cancel() {
    this.onCancel.dispatch(this.text);
    this.destroy();
  }
  
  destroy() {
    super.destroy();
    this.onConfirm.dispose();
    this.onCancel.dispose();
    if (window.focusedElement == this) {
      window.focusedElement = null;
    }
  }
}
