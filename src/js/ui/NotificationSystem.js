class NotificationSystem {
  constructor() {
    this.queue = [];
    this.isShowing = false;
    this.currentNotification = null;
    this.duration = 3000;
    this.lineHeight = 8;
    this.padding = 8;
    this.maxLineWidth = 160;
    this.charWidth = 4;
    
    this.notificationWindow = null;
    this.notificationTint = null;
    this.notificationTexts = null;
    
    this.restrictedStates = new Set(['Title', 'Play', 'Load', 'LoadLocalSongs', 'LoadExternalSongs', 'LoadSongFolder', 'Boot']);
    
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

  // Main show method for regular text notifications
  show(text, duration = 2000, type = "normal") {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    
    const wrappedText = this.wrapText(text);
    
    this.queue.push({ 
      type: type,
      text: wrappedText, 
      originalText: text,
      duration,
      endTime: Date.now() + duration,
      queuedInState: stateName
    });
    
    if (this.isStateAllowed(stateName) && !this.isShowing) {
      this.processNext();
    }
  }

  // Show achievement notification
  showAchievement(achievement, expGain = 0) {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    
    this.queue.push({
      type: 'achievement',
      text: `Achievement Unlocked!\n${achievement.name}\n${achievement.description.achieved}`,
      duration: 2500, // Longer for achievements
      endTime: Date.now() + 2500,
      queuedInState: stateName
    });
    
    if (this.isStateAllowed(stateName) && !this.isShowing) {
      this.processNext();
    }
  }

  processPendingNotifications() {
    if (this.queue.length > 0 && !this.isShowing) {
      this.processNext();
    }
  }

  processNext() {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    
    if (!this.isStateAllowed(stateName)) {
      return;
    }
    
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const notification = this.queue.shift();
    this.currentNotification = notification;

    // Handle different notification types
    switch (notification.type) {
      case 'achievement':
      case 'normal':
      default:
        this.displayTextNotification(notification.text, notification.type);
        break;
    }
    
    this.animateNotificationTint(notification);
    this.playNotificationSound(notification);
    
    game.time.events.add(notification.duration, () => {
      this.hideCurrent();
    });
  }
  
  animateNotificationTint(notification) {
    let tintAnimationIndex = 0;
    this.tintAnimationLoop = game.time.events.loop(100, () => {
      if (!this.notificationWindow) return;
      
      const tint = this.notificationTint[tintAnimationIndex];
      
      this.notificationWindow.tint = tint;
      this.notificationWindow.setTint(tint);
      this.notificationTexts.forEach(text => text.tint = tint);

      if (tintAnimationIndex >= this.notificationTint.length -1) {
        tintAnimationIndex = 0;
      } else {
        tintAnimationIndex++;
      }
    });

    game.time.events.add(notification.duration + 300, () => {
      game.time.events.remove(this.tintAnimationLoop);
    });
  }
  
  stopNotificationTintAnimation() {
    if (this.tintAnimationLoop) {
      game.time.events.remove(this.tintAnimationLoop);
    }
  }
  
  playNotificationSound(notification) {
    const soundKey = {
      'normal': 'ui_notification',
      'error': 'ui_error',
      'success': 'ui_notification', 
      'unlock': 'unlock',
      'achievement': 'unlock'
    }[notification.type];
    
    ENABLE_UI_SFX && Audio.play(soundKey);
  }

  displayTextNotification(text, type = "normal") {
    const lines = text.split('\n');
    const lineCount = lines.length;
    
    const maxLineWidth = Math.min(this.maxLineWidth, Math.max(...lines.map(line => this.getTextWidth(line))));
    const windowWidth = Math.floor(Math.min(180, maxLineWidth + this.padding * 2));
    const windowHeight = Math.floor((lineCount * this.lineHeight) + this.padding * 2);
    
    const x = (game.width - windowWidth) / 2;
    const y = 4;
    
    const tint = {
      "normal": [0x76fcde],
      "error": [0xfd5409, 0xfa1409],
      "success": [0x11b60f, 0x76fcde],
      "unlock": [0xFFFF00, 0xffb200],
      "achievement": [0x76fcde, 0x00cbff]
    }[type];
    
    this.notificationTint = tint;

    this.notificationWindow = new Window(x / 8, y / 8, windowWidth / 8, windowHeight / 8, "2");
    this.notificationWindow.focus = false;
    this.notificationWindow.tint = typeof tint == 'object' ? tint[0] : tint;
    this.notificationWindow.selector.visible = false;
    
    this.notificationTexts = [];
    
    lines.forEach((line, index) => {
      const lineText = new Text(
        windowWidth / 2,
        this.padding + (index * this.lineHeight) + (this.lineHeight / 2),
        line,
        FONTS.default
      );
      lineText.anchor.set(0.5);
      this.notificationWindow.addChild(lineText);
      this.notificationTexts.push(lineText);
    });

    this.notificationWindow.alpha = 0;
    game.add.tween(this.notificationWindow).to({ alpha: 1 }, 300, "Linear", true);
  }

  // Existing helper methods
  wrapText(text) {
    const lines = text.split('\n');
    const wrappedLines = [];
    
    for (let line of lines) {
      if (this.getTextWidth(line) <= this.maxLineWidth) {
        wrappedLines.push(line);
        continue;
      }
      
      let currentLine = '';
      const words = line.split(' ');
      
      for (let word of words) {
        if (this.getTextWidth(word) > this.maxLineWidth) {
          if (currentLine) {
            wrappedLines.push(currentLine.trim());
            currentLine = '';
          }
          const brokenWord = this.breakLongWord(word);
          wrappedLines.push(...brokenWord);
          continue;
        }
        
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (this.getTextWidth(testLine) <= this.maxLineWidth) {
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
    
    return wrappedLines.join('\n');
  }

  breakLongWord(word) {
    const chunks = [];
    let currentChunk = '';
    
    for (let i = 0; i < word.length; i++) {
      currentChunk += word[i];
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
    return text.length * this.charWidth;
  }

  preserveCurrentNotification() {
    if (this.currentNotification && this.notificationWindow) {
      this.preservedNotification = {
        ...this.currentNotification,
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
        return;
      }
      
      const preserved = this.preservedNotification;
      
      // Re-display based on type
      switch (preserved.type) {
        case 'achievement':
        case 'normal':
        default:
          this.displayTextNotification(preserved.text, preserved.type);
          break;
      }
      
      this.isShowing = true;
      
      const remainingDuration = Math.max(500, preserved.remainingTime);
      
      this.animateNotificationTint(preserved);
      this.playNotificationSound(preserved);
      
      game.time.events.add(remainingDuration, () => {
        this.hideCurrent();
      });
      
      this.currentNotification = {
        ...preserved,
        duration: remainingDuration,
        endTime: Date.now() + remainingDuration
      };
      
      this.preservedNotification = null;
    }
  }

  hideCurrent() {
    if (this.currentNotification && this.notificationWindow) {
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

  isStateAllowed(stateName) {
    return !this.restrictedStates.has(stateName);
  }

  clear() {
    this.queue = [];
    if (this.currentNotification) {
      this.hideCurrent();
    }
    this.stopNotificationTintAnimation();
    this.preservedNotification = null;
  }

  destroy() {
    this.clear();
    game.state.onStateChange.remove(this.onStateChange, this);
  }
}