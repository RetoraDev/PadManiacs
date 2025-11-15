class NotificationSystem {
  constructor() {
    this.queue = [];
    this.isShowing = false;
    this.currentNotification = null;
    this.duration = 3000;
    this.lineHeight = 8;
    this.padding = 8;
    this.maxLineWidth = 160; // Maximum width for text before wrapping (in pixels)
    this.charWidth = 4; // Approximate width per character
    
    this.notificationWindow = null;
    this.notificationTexts = null;
    
    this.restrictedStates = new Set(['Title', 'Play', 'Load', 'LoadLocalSongs', 'LoadExternalSongs', 'LoadSongFolder', 'Boot']);
    this.allowedStates = new Set(['MainMenu', 'SongSelect', 'Results']);
    
    this.setupStateChangeHandling();
  }

  setupStateChangeHandling() {
    const originalStart = game.state.start;
    
    game.state.start = function(key, clearWorld, clearCache, ...args) {
      if (notifications && notifications.isShowing) {
        notifications.preserveCurrentNotification();
      }
      
      return originalStart.call(this, key, clearWorld, clearCache, ...args);
    };
    
    game.state.onStateChange.add(this.onStateChange, this);
  }

  onStateChange(newState) {
    game.time.events.add(100, () => {
      const currentState = game.state.getCurrentState();
      const stateName = currentState?.constructor?.name || '';
      
      if (this.isStateAllowed(stateName)) {
        this.processPendingNotifications();
      }
      
      if (this.preservedNotification) {
        this.restorePreservedNotification();
      }
    });
  }

  show(text, duration = 3000) {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    
    // Wrap text before queuing
    const wrappedText = this.wrapText(text);
    
    this.queue.push({ 
      text: wrappedText, 
      originalText: text, // Keep original for debugging
      duration,
      endTime: Date.now() + duration,
      queuedInState: stateName
    });
    
    if (this.isStateAllowed(stateName) && !this.isShowing) {
      this.processNext();
    }
  }

  wrapText(text) {
    const lines = text.split('\n');
    const wrappedLines = [];
    
    for (let line of lines) {
      // If line is already within limits, keep it as is
      if (this.getTextWidth(line) <= this.maxLineWidth) {
        wrappedLines.push(line);
        continue;
      }
      
      // Split long line into multiple wrapped lines
      let currentLine = '';
      const words = line.split(' ');
      
      for (let word of words) {
        // If word itself is too long, break it
        if (this.getTextWidth(word) > this.maxLineWidth) {
          // If we have content in current line, push it first
          if (currentLine) {
            wrappedLines.push(currentLine.trim());
            currentLine = '';
          }
          // Break the long word
          const brokenWord = this.breakLongWord(word);
          wrappedLines.push(...brokenWord);
          continue;
        }
        
        // Test if adding this word would exceed the limit
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (this.getTextWidth(testLine) <= this.maxLineWidth) {
          currentLine = testLine;
        } else {
          // Push current line and start new one
          if (currentLine) {
            wrappedLines.push(currentLine.trim());
          }
          currentLine = word;
        }
      }
      
      // Push the last line
      if (currentLine) {
        wrappedLines.push(currentLine.trim());
      }
    }
    
    return wrappedLines.join('\n');
  }

  breakLongWord(word) {
    const chunks = [];
    let currentChunk = '';
    
    for (let i = 0; i < word.length; i++) {
      currentChunk += word[i];
      
      // Check if adding next character would exceed limit
      if (this.getTextWidth(currentChunk + (word[i + 1] || '')) > this.maxLineWidth) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  getTextWidth(text) {
    // Simple approximation based on character count and average width
    return text.length * this.charWidth;
  }

  processPendingNotifications() {
    if (this.queue.length > 0 && !this.isShowing) {
      console.log(`📢 Processing ${this.queue.length} pending notifications`);
      this.processNext();
    }
  }

  processNext() {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    
    if (!this.isStateAllowed(stateName)) {
      console.log(`📢 Processing blocked in restricted state: ${stateName}`);
      return;
    }
    
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const notification = this.queue.shift();
    this.currentNotification = notification;

    console.log(`📢 Showing notification: "${notification.originalText}"`);
    this.displayNotification(notification.text);

    game.time.events.add(notification.duration, () => {
      this.hideCurrent();
    });
  }

  preserveCurrentNotification() {
    if (this.currentNotification && this.notificationWindow) {
      this.preservedNotification = {
        text: this.currentNotification.text,
        originalText: this.currentNotification.originalText,
        duration: this.currentNotification.duration,
        remainingTime: this.currentNotification.endTime - Date.now()
      };
      
      this.cleanupUI();
    }
  }

  restorePreservedNotification() {
    if (this.preservedNotification) {
      const currentState = game.state.getCurrentState();
      const stateName = currentState?.constructor?.name || '';
      
      if (!this.isStateAllowed(stateName)) {
        console.log(`📢 Restore blocked in restricted state: ${stateName}`);
        return;
      }
      
      const preserved = this.preservedNotification;
      
      this.displayNotification(preserved.text);
      this.isShowing = true;
      
      const remainingDuration = Math.max(500, preserved.remainingTime);
      
      game.time.events.add(remainingDuration, () => {
        this.hideCurrent();
      });
      
      this.currentNotification = {
        text: preserved.text,
        originalText: preserved.originalText,
        duration: remainingDuration,
        endTime: Date.now() + remainingDuration
      };
      
      this.preservedNotification = null;
    }
  }

  displayNotification(text) {
    const lines = text.split('\n');
    const lineCount = lines.length;
    
    // Calculate window dimensions based on wrapped text
    const maxLineWidth = Math.min(this.maxLineWidth, Math.max(...lines.map(line => this.getTextWidth(line))));
    const windowWidth = Math.floor(Math.min(180, maxLineWidth + this.padding * 2));
    const windowHeight = Math.floor((lineCount * this.lineHeight) + this.padding * 2);
    
    const x = (game.width - windowWidth) / 2;
    const y = 4;

    this.notificationWindow = new Window(x / 8, y / 8, windowWidth / 8, windowHeight / 8, "1");
    this.notificationWindow.focus = false;
    this.notificationWindow.selector.visible = false;
    
    this.notificationTexts = [];
    
    lines.forEach((line, index) => {
      const lineText = new Text(
        windowWidth / 2,
        this.padding + (index * this.lineHeight) + (this.lineHeight / 2),
        line,
        {
          ...FONTS.default,
          tint: 0x76fcde
        }
      );
      lineText.anchor.set(0.5);
      this.notificationWindow.addChild(lineText);
      this.notificationTexts.push(lineText);
    });

    this.notificationWindow.alpha = 0;
    game.add.tween(this.notificationWindow).to({ alpha: 1 }, 300, "Linear", true);
  }

  hideCurrent() {
    if (this.currentNotification) {
      const tween = game.add.tween(this.notificationWindow).to({ alpha: 0 }, 300, "Linear", true);
      tween.onComplete.add(() => {
        this.cleanupUI();
        this.currentNotification = null;
        
        const currentState = game.state.getCurrentState();
        const stateName = currentState?.constructor?.name || '';
        
        if (this.isStateAllowed(stateName)) {
          this.processNext();
        }
      });
    }
  }

  cleanupUI() {
    if (this.notificationWindow) {
      this.notificationWindow.destroy();
      this.notificationWindow = null;
    }
    if (this.notificationTexts) {
      this.notificationTexts.forEach(text => text.destroy());
      this.notificationTexts = null;
    }
  }

  isStateRestricted(stateName) {
    return this.restrictedStates.has(stateName) || 
           (!this.allowedStates.has(stateName) && stateName !== '');
  }

  isStateAllowed(stateName) {
    return this.allowedStates.has(stateName);
  }

  canShowInCurrentState() {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    return this.isStateAllowed(stateName);
  }

  // Method to adjust text wrapping settings
  setWrappingSettings(maxLineWidth = 160, charWidth = 4) {
    this.maxLineWidth = maxLineWidth;
    this.charWidth = charWidth;
  }

  // Method to force a specific number of lines (for testing)
  wrapTextToLines(text, maxLines = 3) {
    const wrapped = this.wrapText(text);
    const lines = wrapped.split('\n');
    
    if (lines.length <= maxLines) {
      return wrapped;
    }
    
    // Truncate and add ellipsis
    const truncated = lines.slice(0, maxLines - 1).join('\n');
    const lastLine = lines[maxLines - 1];
    
    // Shorten last line to fit ellipsis
    let shortenedLine = lastLine;
    while (this.getTextWidth(shortenedLine + '...') > this.maxLineWidth && shortenedLine.length > 3) {
      shortenedLine = shortenedLine.slice(0, -1);
    }
    
    return truncated + '\n' + shortenedLine + '...';
  }

  getQueueStatus() {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    
    return {
      queueLength: this.queue.length,
      isShowing: this.isShowing,
      currentState: stateName,
      isStateAllowed: this.isStateAllowed(stateName),
      hasPreserved: !!this.preservedNotification,
      maxLineWidth: this.maxLineWidth
    };
  }

  clear() {
    this.queue = [];
    if (this.currentNotification) {
      this.hideCurrent();
    }
    this.preservedNotification = null;
  }

  hasActiveNotifications() {
    return this.isShowing || this.queue.length > 0 || this.preservedNotification;
  }

  getNotificationCount() {
    let count = this.queue.length;
    if (this.isShowing) count++;
    if (this.preservedNotification) count++;
    return count;
  }

  destroy() {
    this.clear();
    game.state.onStateChange.remove(this.onStateChange, this);
  }
}
