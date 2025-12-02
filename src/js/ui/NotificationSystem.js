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
    this.notificationTexts = null;
    
    this.restrictedStates = new Set(['Title', 'Play', 'Load', 'LoadLocalSongs', 'LoadExternalSongs', 'LoadSongFolder', 'Boot']);
    this.allowedStates = new Set(['MainMenu', 'SongSelect', 'Results', 'CharacterSelect', 'Jukebox', 'Editor', 'AchievementsMenu', 'StatsMenu']);
    
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
  show(text, duration = 2000) {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    
    const wrappedText = this.wrapText(text);
    
    this.queue.push({ 
      type: 'text',
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

  // Show experience gain notification with animation
  showExpGain(character, expGain, levelBefore, levelAfter, expBefore, expAfter) {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    
    this.queue.push({
      type: 'exp',
      character: character,
      expGain: expGain,
      levelBefore: levelBefore,
      levelAfter: levelAfter,
      expBefore: expBefore,
      expAfter: expAfter,
      duration: 5000, // Longer for exp animations
      endTime: Date.now() + 5000,
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
        this.displayTextNotification(notification.text);
        break;
      case 'exp':
        this.displayExpNotification(notification);
        break;
      case 'text':
      default:
        this.displayTextNotification(notification.text);
        break;
    }

    game.time.events.add(notification.duration, () => {
      this.hideCurrent();
    });
  }

  displayTextNotification(text) {
    const lines = text.split('\n');
    const lineCount = lines.length;
    
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
  
  displayExpNotification(notification) {
    const windowWidth = 140;
    const windowHeight = 40;
    const x = (game.width - windowWidth) / 2;
    const y = 4;

    this.notificationWindow = new Window(x / 8, y / 8, windowWidth / 8, windowHeight / 8, "1");
    this.notificationWindow.focus = false;
    this.notificationWindow.selector.visible = false;
    
    // Title
    const titleText = new Text(
      windowWidth / 2,
      7,
      "EXPERIENCE GAIN!",
      {
        ...FONTS.default,
        tint: 0x76FCDE
      }
    );
    titleText.anchor.set(0.5);
    this.notificationWindow.addChild(titleText);

    // Character name and level
    const charText = new Text(
      windowWidth / 2,
      14,
      `${notification.character.name} - Level ${notification.levelBefore}`,
      {
        ...FONTS.default,
        tint: 0xFFFFFF
      }
    );
    charText.anchor.set(0.5);
    this.notificationWindow.addChild(charText);

    // Experience amount
    const expText = new Text(
      windowWidth / 2,
      22,
      `+${notification.expGain} EXP`,
      {
        ...FONTS.default,
        tint: 0xFFFFFF
      }
    );
    expText.anchor.set(0.5);
    this.notificationWindow.addChild(expText);

    // Experience bar background
    const barBg = game.add.graphics(20, 30);
    barBg.beginFill(0x333333);
    barBg.drawRect(0, 0, windowWidth - 40, 4);
    barBg.endFill();
    this.notificationWindow.addChild(barBg);

    // Experience bar foreground
    const expBar = game.add.graphics(20, 30);
    expBar.beginFill(0x76FCDE);
    this.notificationWindow.addChild(expBar);

    this.notificationWindow.alpha = 0;
    game.add.tween(this.notificationWindow).to({ alpha: 1 }, 300, "Linear", true);

    // Animate experience gain
    this.animateExpBar(notification, expBar, windowWidth - 40);
  }

  animateExpBar(notification, expBar, barWidth) {
    const expCurve = CHARACTER_SYSTEM.EXPERIENCE_CURVE;
    let currentExp = notification.expBefore;
    let currentLevel = notification.levelBefore;
    const targetExp = notification.expAfter;
    const targetLevel = notification.levelAfter;
    
    const animate = () => {
      if (currentLevel < targetLevel || currentExp < targetExp) {
        if (currentExp < expCurve(currentLevel)) {
          currentExp++;
        } else {
          currentExp = 0;
          currentLevel++;
          
          // Level up effect
          this.showLevelUpEffect(currentLevel);
        }
        
        // Update exp bar
        const progress = currentExp / expCurve(currentLevel);
        expBar.clear();
        expBar.beginFill(0x76FCDE);
        expBar.drawRect(0, 0, barWidth * progress, 4);
        expBar.endFill();
        
        game.time.events.add(30, animate);
      }
    };
    
    game.time.events.add(500, animate);
  }

  showLevelUpEffect(level) {
    // Create level up text effect
    const levelText = new Text(
      game.width / 2,
      game.height / 2,
      `LEVEL UP! ${level}`,
      {
        ...FONTS.shaded,
        tint: 0xFFD700
      }
    );
    levelText.anchor.set(0.5);
    levelText.alpha = 0;
    levelText.scale.set(1.5);
    
    game.world.add(levelText);
    
    // Animate level up text
    const levelTween = game.add.tween(levelText).to({ 
      alpha: 1,
      scale: { x: 2, y: 2 }
    }, 400, Phaser.Easing.Back.Out, true);
    
    levelTween.onComplete.add(() => {
      game.add.tween(levelText).to({ 
        alpha: 0,
        y: levelText.y - 20
      }, 600, Phaser.Easing.Cubic.In, true).onComplete.add(() => {
        levelText.destroy();
      });
    });
    
    // Play level up sound if available
    if (ENABLE_UI_SFX) {
      Audio.play('level_up', 0.7);
    }
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
          this.displayTextNotification(preserved.text);
          break;
        case 'exp':
          this.displayExpNotification(preserved);
          break;
        case 'text':
        default:
          this.displayTextNotification(preserved.text);
          break;
      }
      
      this.isShowing = true;
      
      const remainingDuration = Math.max(500, preserved.remainingTime);
      
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
    return this.allowedStates.has(stateName);
  }

  clear() {
    this.queue = [];
    if (this.currentNotification) {
      this.hideCurrent();
    }
    this.preservedNotification = null;
  }

  destroy() {
    this.clear();
    game.state.onStateChange.remove(this.onStateChange, this);
  }
}