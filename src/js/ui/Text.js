class Text extends Phaser.Sprite {
  constructor(x, y, text = "", config = {}, parent) {
    super(game, x, y, null);
    
    this.config = {
      ...FONTS.default,
      tint: 0xffffff,
      typewriter: false,
      typewriterInterval: 100,
      ...config
    };
    
    this.texture = new Phaser.RetroFont(game, this.config.font, this.config.fontWidth, this.config.fontHeight, this.config.fontMap);

    this.texture.multiLine = true;
    this.texture.autoUpperCase = this.config.autoUpperCase;

    this.timer = game.time.create(false);

    this.typewriterInterval = this.config.typewriterInterval;

    this.tint = this.config.tint;
    
    if (this.config.typewriter) {
      this.typewriter(text);
    } else {
      this.write(text);
    }
    
    if (parent) {
      if (parent instanceof Phaser.Group) parent.add(this);
      else if (parent instanceof PIXI.DisplayObjectContainer) parent.addChild(this);
    } else {
      game.add.existing(this);
    }
  }

  write(text, max) {
    if (typeof text != "string") return this;
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
    let direction = 1; // 1 for forward, -1 for backward
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
      stop: () => this.stopScrolling(),
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
  
  wrapOld(maxWidth, lineSpacing = 1) {
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
  
  getMaxCharsPerLine(maxWidth = 1) {
    const charWidth = this.config.fontWidth || 4;
    return Math.floor(maxWidth / charWidth);
  }
  
  getWrappedText(maxWidth = 1) {
    if (!this.texture.text) return this.texture.text;
    
    const originalText = this.texture.text;
    
    const maxCharsPerLine = this.getMaxCharsPerLine(maxWidth);
    
    if (maxCharsPerLine <= 0) return this.texture.text;
    
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
    
    return wrappedLines.join('\n');
  }
  
  wrap(maxWidth) {
    this.write(this.getWrappedText(maxWidth));
    return this;
  }
}
