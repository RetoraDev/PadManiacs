class Text extends Phaser.Sprite {
  constructor(x, y, text = "", config, parent) {
    config = {
      font: "font_tiny",
      fontMap: " ABCDEFGHIJKLMNOPQRSTUVWXYZ.,:!¡?¿h+-×*()[]/\\0123456789_'\"`•<>=%",
      fontWidth: 4,
      fontHeight: 6,
      typewriter: false,
      typewriterInterval: 100,
      ...config
    };
    
    super(game, x, y);
    
    this.config = config;

    this.texture = new Phaser.RetroFont(game, config.font, config.fontWidth, config.fontHeight, config.fontMap);

    this.texture.multiLine = true;
    this.texture.autoUpperCase = true;

    this.timer = game.time.create(false);

    this.typewriterInterval = config.typewriterInterval;

    if (config.typewriter) {
      this.typewriter(text);
    } else {
      this.write(text);
    }

    game.add.existing(this);
    
    if (parent) {
      if (parent instanceof Phaser.Group) parent.add(this);
      else if (parent instanceof PIXI.DisplayObjectContainer) parent.addChild(this);
    }
  }

  write(text, max) {
    if (!text) return this;
    if (max && text.length > max) {
      this.scrollwrite(text, max);
    } else {
      if (this.timer.running) this.timer.stop();
      this.texture.text = text;
    }
    return this;
  }

  typewrite(text, callback) {
    if (this.timer.running) this.timer.stop();

    let index = 0;

    this.texture.text = "";

    this.timer.loop(this.typewriterInterval, () => {
      if (index < text.length) {
        this.write(this.texture.text + text[index]);
        index++;
      } else {
        callback && callback();
        this.timer.stop();
      }
    });

    this.timer.start();
    
    return this;
  }

  scrollwrite(text, visibleLength = 5, scrollSpeed = 200, separation = 5) {
    if (this.timer.running) this.timer.stop();
    
    // Prepare the text with separation spaces
    const fullText = text + ' '.repeat(separation);
    let position = 0;
    let direction = 1; // 1 for forward, -1 for backward (optional)
    let isScrolling = true;

    const update = () => {
      if (!this.visible || !isScrolling) return;

      // Extract the visible portion
      let visibleText = '';
      
      for (let i = 0; i < visibleLength; i++) {
        const charIndex = (position + i) % fullText.length;
        visibleText += fullText[charIndex];
      }

      this.texture.text = visibleText;

      // Move to next position
      position = (position + 1) % fullText.length;
    };
    
    this.timer.loop(scrollSpeed, () => update());
    
    update();

    this.timer.start();

    // Return methods to control the scrolling
    return {
      stop: () => {
        isScrolling = false;
        this.timer.stop();
      },
      pause: () => {
        isScrolling = false;
      },
      resume: () => {
        isScrolling = true;
      },
      setSpeed: (newSpeed) => {
        scrollSpeed = newSpeed;
        this.timer.loopDelay = newSpeed;
      }
    };
  }

  stopScrolling() {
    if (this.timer.running) {
      this.timer.stop();
    }
  }

  isScrolling() {
    return this.timer.running;
  }
  
  wrap(maxWidth, lineSpacing = 1) {
    if (!this.texture.text) return this;
    
    const originalText = this.texture.text;
    const charWidth = this.config.fontWidth || 4;
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);
    
    if (maxCharsPerLine <= 0) return this;
    
    const words = originalText.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      // Check if word itself is too long and needs to be broken
      if (word.length > maxCharsPerLine) {
        // If we have content in current line, push it first
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }
        
        // Break the long word into chunks
        let wordChunk = '';
        for (let j = 0; j < word.length; j++) {
          wordChunk += word[j];
          if (wordChunk.length >= maxCharsPerLine || j === word.length - 1) {
            lines.push(wordChunk);
            wordChunk = '';
          }
        }
        continue;
      }
      
      // Normal word wrapping
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    // Push the last line
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Join lines with newline characters
    const wrappedText = lines.join('\n');
    this.write(wrappedText);
    
    return this;
  }

  wrapPreserveNewlines(maxWidth, lineSpacing = 1) {
    if (!this.texture.text) return this;
    
    const originalText = this.texture.text;
    const charWidth = this.config.fontWidth || 4;
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);
    
    if (maxCharsPerLine <= 0) return this;
    
    const originalLines = originalText.split('\n');
    const wrappedLines = [];
    
    for (const line of originalLines) {
      if (line.length <= maxCharsPerLine) {
        wrappedLines.push(line);
        continue;
      }
      
      const words = line.split(' ');
      let currentLine = '';
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // Handle very long words
        if (word.length > maxCharsPerLine) {
          if (currentLine) {
            wrappedLines.push(currentLine);
            currentLine = '';
          }
          
          let wordChunk = '';
          for (let j = 0; j < word.length; j++) {
            wordChunk += word[j];
            if (wordChunk.length >= maxCharsPerLine || j === word.length - 1) {
              wrappedLines.push(wordChunk);
              wordChunk = '';
            }
          }
          continue;
        }
        
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        
        if (testLine.length <= maxCharsPerLine) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            wrappedLines.push(currentLine);
          }
          currentLine = word;
        }
      }
      
      if (currentLine) {
        wrappedLines.push(currentLine);
      }
    }
    
    const wrappedText = wrappedLines.join('\n');
    this.write(wrappedText);
    
    return this;
  }

  getWrappedText(maxWidth) {
    if (!this.texture.text) return '';
    
    const originalText = this.texture.text;
    const charWidth = this.config.fontWidth || 4;
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);
    
    if (maxCharsPerLine <= 0) return originalText;
    
    const words = originalText.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      if (word.length > maxCharsPerLine) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }
        
        let wordChunk = '';
        for (let j = 0; j < word.length; j++) {
          wordChunk += word[j];
          if (wordChunk.length >= maxCharsPerLine || j === word.length - 1) {
            lines.push(wordChunk);
            wordChunk = '';
          }
        }
        continue;
      }
      
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.join('\n');
  }
}
