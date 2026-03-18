class Keybindings {
  create() {
    game.camera.fadeIn(0x000000);

    this.futuristicLines = new FuturisticLines();
    this.backgroundGradient = new BackgroundGradient();
    this.navigationHint = new NavigationHint(0);
    
    this.windowManager = new WindowManager();
    
    gamepad.releaseAll();
    
    this.showKeybindingsMenu();
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  update() {
    gamepad.update();
    this.windowManager.update();
  }
  
  showKeybindingsMenu() {
    const settingsWindow = this.windowManager.createWindow(3, 1, 18, 12, "1");
    settingsWindow.fontTint = 0x76fcde;
    
    this.windowManager.focus(settingsWindow);
    
    settingsWindow.addItem("KEYBOARD KEYS", ">", () => {
      this.windowManager.remove(settingsWindow, true);
      this.showKeyboardCustomization();
    });
    
    settingsWindow.addItem("GAMEPAD KEYS", ">", () => {
      this.windowManager.remove(settingsWindow, true);
      this.showGamepadCustomization();
    });
    
    settingsWindow.addItem("RESET TO DEFAULTS", "", () => {
      this.windowManager.remove(settingsWindow, true);
      this.confirmDialog(
        "Reset all keybindings to default settings?",
        () => {
          Account.mapping.keyboard = JSON.parse(JSON.stringify(DEFAULT_KEYBOARD_MAPPING));
          Account.mapping.gamepad = JSON.parse(JSON.stringify(DEFAULT_GAMEPAD_MAPPING));
          saveAccount();
          gamepad.updateMapping(Account.mapping.keyboard, Account.mapping.gamepad);
          game.state.restart();
          notifications.show("Keybindings reset!");
        },
        () => {
          this.showKeybindingsMenu();
        },
        "RESET",
        "CANCEL"
      );
    });
    
    settingsWindow.addItem("< BACK", "", () => {
      game.state.start("Settings");
    }, true);
    
    game.onMenuIn.dispatch('keybindings', settingsWindow);
  }

  showKeyboardCustomization(index = 0) {
    const keysWindow = this.windowManager.createWindow(3, 1, 18, 12, "1");
    keysWindow.fontTint = 0x76fcde;
    
    keysWindow.selectIndex(index);
    
    this.windowManager.focus(keysWindow);
    
    // Define keyboard controls
    const keyboardControls = [
      { key: "UP", description: "UP ARROW", mappingKey: "up", index: 0 },
      { key: "DOWN", description: "DOWN ARROW", mappingKey: "down", index: 0 },
      { key: "LEFT", description: "LEFT ARROW", mappingKey: "left", index: 0 },
      { key: "RIGHT", description: "RIGHT ARROW", mappingKey: "right", index: 0 },
      { key: "DANCE LEFT", description: "DANCE LEFT", mappingKey: "left", index: 1 },
      { key: "DANCE DOWN", description: "DANCE DOWN", mappingKey: "down", index: 1 },
      { key: "DANCE UP", description: "DANCE UP", mappingKey: "up", index: 1 },
      { key: "DANCE RIGHT", description: "DANCE RIGHT", mappingKey: "right", index: 1 },
      { key: "SECONDARY DANCE LEFT", description: "SECONDARY DANCE LEFT", mappingKey: "left", index: 2 },
      { key: "SECONDARY DANCE DOWN", description: "SECONDARY DANCE DOWN", mappingKey: "down", index: 2 },
      { key: "SECONDARY DANCE UP", description: "SECONDARY DANCE UP", mappingKey: "up", index: 2 },
      { key: "SECONDARY DANCE RIGHT", description: "SECONDARY DANCE RIGHT", mappingKey: "right", index: 2 },
      { key: "CONFIRM", description: "CONFIRM", mappingKey: "a", index: 0 },
      { key: "CANCEL", description: "CANCEL", mappingKey: "b", index: 0 },
      { key: "START", description: "START", mappingKey: "start", index: 0 },
      { key: "SELECT", description: "SELECT", mappingKey: "select", index: 0 }
    ];
    
    // Add each control item
    keyboardControls.forEach(control => {
      const currentKey = this.getKeyboardKeyDisplay(control.mappingKey, control.index);
      keysWindow.addItem(control.key, currentKey, () => {
        this.waitingForKey = {
          type: "keyboard",
          mappingKey: control.mappingKey,
          index: control.index,
          description: control.description,
          selected: keysWindow.selectedIndex
        };
        this.windowManager.remove(keysWindow, true);
        this.showKeyWaitOverlay(`PRESS KEY FOR: ${control.description}`);
      });
    });
    
    keysWindow.addItem("< BACK", "", () => {
      this.windowManager.remove(keysWindow, true);
      this.windowManager.unfocus();
      this.showKeybindingsMenu();
    }, true);
    
    game.onMenuIn.dispatch('keyboardCustomization', keysWindow);
  }

  showGamepadCustomization(index = 0) {
    const gamepadWindow = this.windowManager.createWindow(3, 1, 18, 12, "1");
    gamepadWindow.fontTint = 0x76fcde;
    
    gamepadWindow.selectIndex(index);
    
    this.windowManager.focus(gamepadWindow);
    
    // Define gamepad controls
    const gamepadControls = [
      { key: "UP", description: "UP ARROW", mappingKey: "up" },
      { key: "DOWN", description: "DOWN ARROW", mappingKey: "down" },
      { key: "LEFT", description: "LEFT ARROW", mappingKey: "left" },
      { key: "RIGHT", description: "RIGHT ARROW", mappingKey: "right" },
      { key: "CONFIRM/RIGHT", description: "CONFIRM/RIGHT", mappingKey: "a" },
      { key: "CANCEL/DOWN", description: "CANCEL/DOWN", mappingKey: "b" },
      { key: "START", description: "START", mappingKey: "start" },
      { key: "SELECT", description: "SELECT", mappingKey: "select" }
    ];
    
    // Add each control item
    gamepadControls.forEach(control => {
      const currentButton = this.getGamepadButtonDisplay(control.mappingKey);
      gamepadWindow.addItem(control.key, currentButton, () => {
        this.waitingForKey = {
          type: "gamepad",
          mappingKey: control.mappingKey,
          description: control.description,
          selected: gamepadWindow.selectedIndex
        };
        this.windowManager.remove(gamepadWindow, true);
        this.showKeyWaitOverlay(`PRESS GAMEPAD BUTTON FOR: ${control.description}`);
      });
    });
    
    gamepadWindow.addItem("< BACK", "", () => {
      this.windowManager.remove(gamepadWindow, true);
      this.windowManager.unfocus();
      this.showKeybindingsMenu();
    }, true);
    
    game.onMenuIn.dispatch('gamepadCustomization', gamepadWindow);
  }

  showKeyWaitOverlay(message) {
    // Remove any existing overlay
    if (this.waitOverlay) {
      this.waitOverlay.destroy();
    }

    // Store the current menu type for navigation back
    this.lastCustomizationMenu = this.waitingForKey?.type;

    // Create semi-transparent overlay
    const overlay = game.add.graphics(0, 0);
    overlay.beginFill(0x000000, 0.7);
    overlay.drawRect(0, 0, 192, 112);
    overlay.endFill();

    // Create instruction text
    const instructionText = new Text(96, 40, message);
    instructionText.anchor.set(0.5, 0.5);
    instructionText.fontSize = 2;

    // Create help text
    const helpText = new Text(96, 80, "PRESS ESC TO CANCEL\nHOLD TO UNMAP");
    helpText.anchor.set(0.5, 0.5);

    // Create progress bar background
    const progressBarBg = game.add.graphics(0, 0);
    progressBarBg.beginFill(0x333333, 0.8);
    progressBarBg.drawRect(48, 60, 96, 8);
    progressBarBg.endFill();

    // Create progress bar fill
    const progressBar = game.add.graphics(0, 0);

    // Variables for tracking ESC hold
    const holdDuration = 1000; // 1 second
    let escHoldStartTime = 0;
    let escIsHeld = false;
    let progressTween = null;

    // Update function for the progress bar
    const updateProgressBar = () => {
      if (!escIsHeld) return;

      const currentTime = Date.now();
      const elapsed = currentTime - escHoldStartTime;
      const progress = Math.min(elapsed / holdDuration, 1);

      // Clear and redraw progress bar
      progressBar.clear();
      progressBar.beginFill(0xffffff, 1);
      progressBar.drawRect(48, 60, 96 * progress, 8);
      progressBar.endFill();

      // Update overlay color based on progress
      const colorProgress = Math.min(progress, 1);
      const overlayAlpha = 0.7 * (1 - colorProgress * 0.7); // Fade to 30% of original
      overlay.clear();
      overlay.beginFill(0x000000, overlayAlpha);
      overlay.drawRect(0, 0, 192, 112);
      overlay.endFill();

      // Check if hold duration is reached
      if (progress >= 1) {
        // Unmap the key
        this.unmapCurrentKey();
      }
    };

    // Keyboard listener
    const keyListener = event => {
      if (this.waitingForKey) {
        if (event.keyCode === Phaser.KeyCode.ESC) {
          // Handle ESC key down
          if (!escIsHeld) {
            escIsHeld = true;
            escHoldStartTime = Date.now();

            // Start progress update loop
            if (this.waitOverlay?.progressUpdateLoop) {
              clearInterval(this.waitOverlay.progressUpdateLoop);
            }
            this.waitOverlay.progressUpdateLoop = setInterval(updateProgressBar, 16);
          }
        } else if (this.waitingForKey.type === "keyboard") {
          // Cancel any ESC hold
          if (escIsHeld) {
            escIsHeld = false;
            if (this.waitOverlay?.progressUpdateLoop) {
              clearInterval(this.waitOverlay.progressUpdateLoop);
            }
            resetProgressBar();
          }

          // Handle other keyboard key
          this.handleKeyboardKeyPress(event.keyCode);
        }
      }
    };

    const keyUpListener = event => {
      if (event.keyCode === Phaser.KeyCode.ESC && escIsHeld) {
        const holdTime = Date.now() - escHoldStartTime;
        escIsHeld = false;

        // Clear progress update loop
        if (this.waitOverlay?.progressUpdateLoop) {
          clearInterval(this.waitOverlay.progressUpdateLoop);
        }

        // Reset progress bar
        resetProgressBar();

        // Check if it was a short press (cancel) or incomplete hold
        if (holdTime < holdDuration * 0.8) {
          // 80% threshold
          this.cancelKeyWait();
        }
      }
    };

    // Gamepad listener
    const gamepadListener = buttonCode => {
      if (this.waitingForKey && this.waitingForKey.type === "gamepad") {
        // Handle gamepad button press
        this.handleGamepadButtonPress(buttonCode);
      }
    };

    // Store original callbacks
    const originalKeyboardCallback = game.input.keyboard.onDownCallback;
    const originalKeyUpCallback = game.input.keyboard.onUpCallback;
    const originalGamepadCallback = game.input.gamepad.onDownCallback;

    // Setup listeners
    game.input.keyboard.onDownCallback = keyListener;
    game.input.keyboard.onUpCallback = keyUpListener;
    game.input.gamepad.onDownCallback = gamepadListener;

    // Function to reset progress bar
    const resetProgressBar = () => {
      progressBar.clear();
      overlay.clear();
      overlay.beginFill(0x000000, 0.7);
      overlay.drawRect(0, 0, 192, 112);
      overlay.endFill();
    };

    // Store reference
    this.waitOverlay = {
      graphics: overlay,
      instructionText: instructionText,
      helpText: helpText,
      progressBarBg: progressBarBg,
      progressBar: progressBar,
      keyListener: keyListener,
      keyUpListener: keyUpListener,
      gamepadListener: gamepadListener,
      originalKeyboardCallback: originalKeyboardCallback,
      originalKeyUpCallback: originalKeyUpCallback,
      originalGamepadCallback: originalGamepadCallback,
      progressUpdateLoop: null
    };
  }

  unmapCurrentKey() {
    if (!this.waitingForKey) return;

    if (this.waitingForKey.type === "keyboard") {
      // Unmap keyboard key
      const mapping = Account.mapping.keyboard;

      if (mapping[this.waitingForKey.mappingKey] && Array.isArray(mapping[this.waitingForKey.mappingKey]) && mapping[this.waitingForKey.mappingKey].length > this.waitingForKey.index) {
        mapping[this.waitingForKey.mappingKey][this.waitingForKey.index] = null;

        // Clean up empty slots at the end
        while (mapping[this.waitingForKey.mappingKey].length > 0 && mapping[this.waitingForKey.mappingKey][mapping[this.waitingForKey.mappingKey].length - 1] === null) {
          mapping[this.waitingForKey.mappingKey].pop();
        }

        saveAccount();
        gamepad.updateMapping(Account.mapping.keyboard, Account.mapping.gamepad);
        setTimeout(() => notifications.show("KEY UNMAPPED!"), 50);
      }
    } else if (this.waitingForKey.type === "gamepad") {
      // Unmap gamepad button
      Account.mapping.gamepad[this.waitingForKey.mappingKey] = null;
      saveAccount();
      gamepad.updateMapping(Account.mapping.keyboard, Account.mapping.gamepad);
      setTimeout(() => notifications.show("BUTTON UNMAPPED!"), 50);
    }

    // Return to menu
    this.cancelKeyWait();

    // Navigate back to appropriate menu
    setTimeout(() => {
      if (this.lastCustomizationMenu === "keyboard") {
        this.showKeyboardCustomization();
      } else if (this.lastCustomizationMenu === "gamepad") {
        this.showGamepadCustomization();
      }
    }, 50);
  }

  cancelKeyWait() {
    if (this.waitOverlay) {
      // Clear progress update loop
      if (this.waitOverlay.progressUpdateLoop) {
        clearInterval(this.waitOverlay.progressUpdateLoop);
      }

      // Remove overlay elements
      this.waitOverlay.graphics.destroy();
      this.waitOverlay.instructionText.destroy();
      this.waitOverlay.helpText.destroy();
      this.waitOverlay.progressBarBg.destroy();
      this.waitOverlay.progressBar.destroy();

      // Restore original callbacks
      if (this.waitOverlay.originalKeyboardCallback) {
        game.input.keyboard.onDownCallback = this.waitOverlay.originalKeyboardCallback;
      }

      if (this.waitOverlay.originalKeyUpCallback) {
        game.input.keyboard.onUpCallback = this.waitOverlay.originalKeyUpCallback;
      }

      if (this.waitOverlay.originalGamepadCallback) {
        game.input.gamepad.onDownCallback = this.waitOverlay.originalGamepadCallback;
      }

      // Return to appropriate menu
      if (this.lastCustomizationMenu === "keyboard") {
        this.showKeyboardCustomization(this.waitingForKey.selected);
      } else if (this.lastCustomizationMenu === "gamepad") {
        this.showGamepadCustomization(this.waitingForKey.selected);
      }
      
      this.waitOverlay = null;
      this.waitingForKey = null;
      this.lastCustomizationMenu = null;
    }
  }

  handleKeyboardKeyPress(keyCode) { 
    if (!this.waitingForKey || this.waitingForKey.type !== "keyboard") return;
    
    // Check if key is ESC (should be handled by cancelKeyWait)
    if (keyCode === Phaser.KeyCode.ESC) {
      return;
    }
    
    // Map the key
    const mapping = Account.mapping.keyboard;
    
    // Ensure array exists for this mapping key
    if (!mapping[this.waitingForKey.mappingKey]) {
      mapping[this.waitingForKey.mappingKey] = [];
    }
    
    // Ensure array is long enough
    while (mapping[this.waitingForKey.mappingKey].length <= this.waitingForKey.index) {
      mapping[this.waitingForKey.mappingKey].push(null);
    }
    
    // Set the key
    mapping[this.waitingForKey.mappingKey][this.waitingForKey.index] = keyCode;
    
    // Save and update gamepad
    saveAccount();
    gamepad.updateMapping(Account.mapping.keyboard, Account.mapping.gamepad);
    
    // Show confirmation
    setTimeout(() => notifications.show(`MAPPED: ${this.getKeyName(keyCode)}`), 25);
    
    // Return to menu
    this.cancelKeyWait();
    this.showKeyboardCustomization();
  }

  handleGamepadButtonPress(buttonCode) {
    if (!this.waitingForKey || this.waitingForKey.type !== "gamepad") return;
    
    // Map the button
    Account.mapping.gamepad[this.waitingForKey.mappingKey] = buttonCode;
    
    // Save and update gamepad
    saveAccount();
    gamepad.updateMapping(Account.mapping.keyboard, Account.mapping.gamepad);
    
    // Show confirmation
    setTimeout(() => notifications.show(`MAPPED: ${GAMEPAD_KEY_NAMES[buttonCode] || `BUTTON ${buttonCode}`}`), 25);
    
    // Return to menu
    this.cancelKeyWait();
    this.showGamepadCustomization();
  }

  getKeyboardKeyDisplay(mappingKey, index) {
    const mapping = Account.mapping.keyboard[mappingKey];
    
    if (!mapping || !Array.isArray(mapping) || index >= mapping.length || !mapping[index]) {
      return "---";
    }
    
    const keyCode = mapping[index];
    return this.getKeyName(keyCode);
  }

  getGamepadButtonDisplay(mappingKey) {
    const buttonCode = Account.mapping.gamepad[mappingKey];
    
    if (buttonCode === undefined || buttonCode === null) {
      return "---";
    }
    
    return GAMEPAD_KEY_NAMES[buttonCode] || `BUTTON ${buttonCode}`;
  }

  getKeyName(keyCode) {
    // Find the key name from Phaser.KeyCode
    for (const [name, code] of Object.entries(Phaser.KeyCode)) {
      if (code === keyCode) {
        // Convert to readable name
        return this.formatKeyName(name);
      }
    }
    
    // If not found in Phaser.KeyCode, try to get from event
    return `KEY ${keyCode}`;
  }

  formatKeyName(name) {
    // Convert Phaser key code names to readable format
    const nameMap = KEYBOARD_KEY_NAMES;
    
    // Check if we have a mapped name
    if (nameMap[name]) {
      return nameMap[name];
    }
    
    // For letter keys (A-Z)
    if (name.length === 1 && /^[A-Z]$/.test(name)) {
      return name;
    }
    
    // For number keys (0-9)
    if (name.length === 1 && /^[0-9]$/.test(name)) {
      return name;
    }
    
    // Convert to readable format (e.g., "A" -> "A", "COMMA" -> "COMMA")
    return name.replace(/_/g, ' ');
  }
  
  confirmDialog(message, onConfirm, onCancel, confirmText = "Yes", cancelText = "No") {
    const dialog = new DialogWindow(message, {
      buttons: [confirmText, cancelText]
    });
    
    dialog.onConfirm.add((buttonIndex, buttonText) => {
      if (buttonIndex === 0) {
        onConfirm?.();
      } else {
        onCancel?.();
      }
      dialog.destroy();
    });
    
    dialog.onCancel.add(() => {
      onCancel?.();
      dialog.destroy();
    });
    
    return dialog;
  }
}