/**
 * @class NotificationSystem
 * @category UI Classes
 * @summary Global notification manager with achievement/exp support
 * @constructor
 * @features
 * Queues and shows text, error, success, unlock, and achievement notifications
 * Preserves and restores notifications across state changes
 * Tinted windows with cycling color animation
 * Restricted states where notifications stay hidden
 * @description
 * NotificationSystem is the global toast manager that displays queued
 * notifications in a bordered window at the top of the screen. It supports
 * regular text as well as achievement, error, success, and unlock types,
 * each with its own color scheme and sound. Notifications survive state
 * transitions and are restored once an allowed state loads.
 * @example
 * // Modding usage example
 * notifications.show('Song downloaded!', 2000, 'success');
 * notifications.showAchievement(
 *   { name: 'First Steps', description: { achieved: 'Play 1 song' } }, 50
 * );
 */
class NotificationSystem {
  constructor() {
    /** @type {Array} Pending notifications waiting to be shown */
    this.queue = [];
    /** @type {boolean} Whether a notification is currently on screen */
    this.isShowing = false;
    /** @type {object} The notification currently being displayed */
    this.currentNotification = null;
    /** @type {number} Default display duration in milliseconds */
    this.duration = 3000;
    /** @type {number} Line height used to layout notification text */
    this.lineHeight = 8;
    /** @type {number} Padding around the notification text */
    this.padding = 8;
    /** @type {number} Maximum text width before wrapping in pixels */
    this.maxLineWidth = 160;
    /** @type {number} Width of a single character in pixels */
    this.charWidth = 4;
    
    /** @type {Window|null} The window displaying the current notification */
    this.notificationWindow = null;
    /** @type {Array} Cycling tint colors for the notification window */
    this.notificationTint = [0xffffff];
    /** @type {Array|null} Text sprites inside the notification window */
    this.notificationTexts = null;
    
    /** @type {Set} State names in which notifications are suppressed */
    this.restrictedStates = new Set(['Title', 'Play', 'Load', 'LoadLocalSongs', 'LoadExternalSongs', 'LoadSongFolder', 'Boot']);
    
    this.setupStateChangeHandling();
  }

  /**
   * Patches game.state.start and subscribes to the state change signal.
   */
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

  /**
   * Processes pending notifications and restores preserved ones after a state change.
   * @param {object} newState - The newly entered game state
   */
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
  /**
   * Queues and shows a regular text notification of the given type.
   * @param {string} text - The notification message text
   * @param {number} [duration=2000] - How long to display it in milliseconds
   * @param {string} [type="normal"] - Style type: normal, error, success, or unlock
   */
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
  /**
   * Queues an achievement banner showing the unlocked achievement details.
   * @param {object} achievement - Achievement with name and description fields
   * @param {number} [expGain=0] - Experience points gained (reserved for display)
   */
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

  /**
   * Processes the next queued notification when none is currently showing.
   */
  processPendingNotifications() {
    if (this.queue.length > 0 && !this.isShowing) {
      this.processNext();
    }
  }

  /**
   * Shows the next queued notification and schedules its hide.
   */
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
  
  /**
   * Cycles the notification window tint through its configured colors.
   * @param {object} notification - The notification whose colors are animated
   */
  animateNotificationTint(notification) {
    let tintAnimationIndex = 0;
    /** @type {?Phaser.TimerEvent} Timer cycling the notification window tint */
    this.tintAnimationLoop = game.time.events.loop(100, () => {
      if (!this.notificationWindow) return;
      
      if (!this.notificationTint) {
        this.notificationWindow.tint = 0x76fcde;
        return;
      }
      
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
  
  /**
   * Stops the cycling tint animation loop.
   */
  stopNotificationTintAnimation() {
    if (this.tintAnimationLoop) {
      game.time.events.remove(this.tintAnimationLoop);
    }
  }
  
  /**
   * Plays the sound corresponding to the notification type.
   * @param {object} notification - The notification being shown
   */
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

  /**
   * Builds the notification window and its text lines, fading it in.
   * @param {string} text - Text to display, with newlines
   * @param {string} [type="normal"] - Style type controlling tint and colors
   */
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
  /**
   * Wraps text into lines that fit the maximum notification width.
   * @param {string} text - The text to wrap
   * @returns {string} Wrapped text, lines joined with newlines
   */
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

  /**
   * Breaks a word that is longer than the maximum line width into chunks.
   * @param {string} word - The word to break apart
   * @returns {Array} Array of chunks that fit the line width
   */
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

  /**
   * Estimates the rendered width of a string at the configured char width.
   * @param {string} text - The text to measure
   * @returns {number} Width in pixels
   */
  getTextWidth(text) {
    return text.length * this.charWidth;
  }

  /**
   * Saves the current notification with remaining time and clears the UI
   * so it can be restored later, surviving a state change.
   */
  preserveCurrentNotification() {
    if (this.currentNotification && this.notificationWindow) {
      /** @type {?Object} Copy of the current notification saved across state changes */
      this.preservedNotification = {
        ...this.currentNotification,
        remainingTime: this.currentNotification.endTime - Date.now()
      };
      
      this.cleanupUI();
    }
  }

  /**
   * Re-displays a preserved notification for its remaining duration.
   */
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

  /**
   * Fades out and cleans up the current notification, then shows the next one.
   */
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

  /**
   * Destroys the notification window and all of its text sprites.
   */
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

  /**
   * Returns whether notifications are allowed in the given state name.
   * @param {string} stateName - Name of the current game state
   * @returns {boolean} True when the state is not restricted
   */
  isStateAllowed(stateName) {
    return !this.restrictedStates.has(stateName);
  }

  /**
   * Clears the queue, current notification, tint animation, and any preserved one.
   */
  clear() {
    this.queue = [];
    if (this.currentNotification) {
      this.hideCurrent();
    }
    this.stopNotificationTintAnimation();
    this.preservedNotification = null;
  }

  /**
   * Clears all notifications and unsubscribes from the state change signal.
   */
  destroy() {
    this.clear();
    game.state.onStateChange.remove(this.onStateChange, this);
  }
}