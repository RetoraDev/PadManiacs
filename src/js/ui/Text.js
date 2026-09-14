/**
 * @class Text
 * @category UI Classes
 * @summary Retro pixel text with typewriter and scrolling effects
 * @constructor
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} [text=""] - Initial text content
 * @param {object} [config={}] - Overrides for FONTS.default, tint, and typewriter options
 * @param {object} [parent] - Optional Phaser.Group or PIXI container to add this text sprite to
 * @features
 * Typewriter reveal effect with configurable interval
 * Scrolling marquee mode for overflowing text
 * Word wrapping helpers for multi-line layout
 * Renders with a Phaser.RetroFont pixel glyph set
 * @description
 * Text is a sprite-based retro text label that renders pixel fonts through a
 * Phaser.RetroFont texture. It supports normal display, typewriter reveal,
 * and a looping marquee scroll for text that overflows its window, and it
 * provides word wrapping helpers for multi-line layout.
 * @example
 * // Modding usage example
 * const title = new Text(8, 8, 'Select Song', FONTS.default);
 * title.tint = 0x76fcde;
 *
 * const typed = new Text(8, 16, 'Loading...', { typewriter: true });
 *
 * const ticker = new Text(8, 24, 'Queue', FONTS.small);
 * ticker.scrollwrite('A very long scrolling message', 12, 150);
 */
class Text extends Phaser.Sprite {
  constructor(x, y, text = "", config = {}, parent) {
    super(game, x, y, null);
    
    /** @type {object} Merged font, tint, and effect configuration */
    this.config = {
      ...FONTS.default,
      tint: 0xffffff,
      typewriter: false,
      typewriterInterval: 100,
      ...config
    };
    
    // Create the retro font texture
    /** @type {Phaser.RetroFont} Retro font texture that renders the glyphs */
    this.texture = new Phaser.RetroFont(game, this.config.font, this.config.fontWidth, this.config.fontHeight, this.config.fontMap);

    this.texture.multiLine = true;
    this.texture.autoUpperCase = this.config.autoUpperCase;

    /** @type {Phaser.Timer} Timer driving typewriter and scroll effects */
    this.timer = game.time.create(false);

    /** @type {number} Milliseconds between typewriter characters */
    this.typewriterInterval = this.config.typewriterInterval;

    /** @type {string} Tint color applied to the rendered text (hex string) */
    this.tint = this.config.tint;
    
    if (this.config.typewriter) {
      this.typewrite(text);
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

  /**
   * Sets the displayed text, capping it to a max visible length when given.
   * Longer text switches to the scrolling marquee mode instead.
   * @param {string} text - The text to display
   * @param {number} [max] - Maximum visible length; longer text scrolls
   * @returns {Text} This text sprite for chaining
   */
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

  /**
   * Reveals the text one character at a time using the typewriter timer.
   * @param {string} text - The text to type out
   * @param {Function} [callback] - Called once typing completes
   * @returns {Text} This text sprite for chaining
   */
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

  /**
   * Starts a looping marquee scroll of the given text and returns controls.
   * @param {string} text - The full text to scroll
   * @param {number} [visibleLength=5] - How many characters are visible at once
   * @param {number} [scrollSpeed=200] - Milliseconds between scroll steps
   * @param {number} [separation=5] - Spaces appended between repetitions
   * @returns {object} Controls with stop, pause, resume, and setSpeed methods
   */
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

  /**
   * Stops any running typewriter or scroll timer, halting effect updates.
   */
  stopScrolling() {
    if (this.timer.running) {
      this.timer.stop();
    }
  }

  /**
   * Returns whether a scrolling or typewriter effect is currently running.
   * @returns {boolean} True while the effect timer is active
   */
  isScrolling() {
    return this.timer.running;
  }
  
  /**
   * Wraps the current text to a maximum pixel width, breaking long words.
   * @param {number} maxWidth - Maximum line width in pixels
   * @param {number} [lineSpacing=1] - Unused legacy spacing parameter
   * @returns {Text} This text sprite for chaining
   */
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
  
  /**
   * Computes how many characters fit on a line at the given pixel width.
   * @param {number} maxWidth - Available width in pixels
   * @returns {number} Maximum characters per line
   */
  getMaxCharsPerLine(maxWidth = 1) {
    const charWidth = this.config.fontWidth || 4;
    return Math.floor(maxWidth / charWidth);
  }
  
  /**
   * Returns the current text wrapped into lines for a given pixel width.
   * @param {number} maxWidth - Maximum line width in pixels
   * @returns {string} The wrapped text, lines joined with newlines
   */
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
  
  /**
   * Wraps and rewrites the current text to a maximum pixel width.
   * @param {number} maxWidth - Maximum line width in pixels
   * @returns {Text} This text sprite for chaining
   */
  wrap(maxWidth) {
    this.write(this.getWrappedText(maxWidth));
    return this;
  }
}
