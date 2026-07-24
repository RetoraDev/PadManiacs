class Keybindings {
  create() {
    game.camera.fadeIn(0x000000);

    this.futuristicLines = new FuturisticLines();
    this.backgroundGradient = new BackgroundGradient();
    this.navigationHint = new NavigationHint([
      {
        position: "right",
        icon: "d-pad",
        text: __("NAVIGATE||NAVEGAR")
      },
      {
        position: "right",
        icon: "a",
        text: __("CHANGE||CAMBIAR")
      },
      {
        position: "right",
        icon: "b",
        text: __("BACK||VOLVER")
      }
    ]);
    
    this.windowManager = new WindowManager();
    
    this.waitOverlayActive = false;
    this.pendingChanges = {
      keyboard: JSON.parse(JSON.stringify(Account.mapping.keyboard)),
      gamepad: JSON.parse(JSON.stringify(Account.mapping.gamepad))
    };
    
    // Notification system
    this.notifications = [];
    this.notificationContainer = game.add.group();
    
    gamepad.releaseAll();
    
    this.showKeybindingsMenu();
    
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  update() {
    gamepad.update();
    this.windowManager.update();
    this.updateNotifications();
  }
  
  shutdown() {
    this.cleanupWaitOverlay();
    // Apply pending changes
    Account.mapping.keyboard = this.pendingChanges.keyboard;
    Account.mapping.gamepad = this.pendingChanges.gamepad;
    saveAccount();
    gamepad1.updateMapping(Account.mapping.keyboard.player1, Account.mapping.gamepad.player1);
    gamepad2.updateMapping(Account.mapping.keyboard.player2, Account.mapping.gamepad.player2);
    // Clean up notifications
    for (const entry of this.notifications) {
      if (entry.text) entry.text.destroy();
    }
    this.notifications = [];
    if (this.notificationContainer) this.notificationContainer.destroy();
  }
  
  showNotification(text, duration = 2500) {
    const entry = {
      text: new Text(4, 140, text, FONTS.default_stroke),
      born: game.time.now,
      duration: duration,
      alpha: 1,
      targetY: 140
    };
    entry.text.anchor.y = 1;
    entry.text.tint = 0x76fcde;
    this.notificationContainer.add(entry.text);
    this.notifications.push(entry);
    
    // Move existing notifications up
    for (let i = 0; i < this.notifications.length - 1; i++) {
      const oldEntry = this.notifications[i];
      oldEntry.targetY -= 8;
      game.add.tween(oldEntry.text).to({ y: oldEntry.targetY }, 150, Phaser.Easing.Quadratic.Out, true);
    }
    
    // Limit notifications
    if (this.notifications.length > 8) {
      const old = this.notifications.shift();
      old.text.destroy();
    }
  }
  
  updateNotifications() {
    const now = game.time.now;
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const entry = this.notifications[i];
      const age = now - entry.born;
      
      if (age > entry.duration) {
        if (entry.alpha > 0) {
          entry.alpha -= 0.02;
          entry.text.alpha = entry.alpha;
          if (entry.alpha <= 0) {
            entry.text.destroy();
            this.notifications.splice(i, 1);
          }
        }
      }
    }
  }
  
  showKeybindingsMenu() {
    const settingsWindow = this.windowManager.createWindow(3, 1, 24, 14, "1");
    settingsWindow.fontTint = 0x76fcde;
    
    this.windowManager.focus(settingsWindow);
    
    settingsWindow.addItem(__("Keyboard P1||Teclado P1"), ">", () => {
      this.windowManager.remove(settingsWindow, true);
      this.showKeyboardCustomization(1);
    });
    
    settingsWindow.addItem(__("Keyboard P2||Teclado P2"), ">", () => {
      this.windowManager.remove(settingsWindow, true);
      this.showKeyboardCustomization(2);
    });
    
    settingsWindow.addItem(__("Gamepad P1||Mando P1"), ">", () => {
      this.windowManager.remove(settingsWindow, true);
      this.showGamepadCustomization(1);
    });
    
    settingsWindow.addItem(__("Gamepad P2||Mando P2"), ">", () => {
      this.windowManager.remove(settingsWindow, true);
      this.showGamepadCustomization(2);
    });
    
    settingsWindow.addItem(__("Reset To Defaults||restablecer"), "", () => {
      this.windowManager.remove(settingsWindow, true);
      this.confirmDialog(
        __("Reset all keybindings to default settings?||¿Restablecer todas las configuraciones de teclas a los valores predeterminados?"),
        () => {
          this.pendingChanges.keyboard = JSON.parse(JSON.stringify(DEFAULT_KEYBOARD_MAPPING));
          this.pendingChanges.gamepad = JSON.parse(JSON.stringify(DEFAULT_GAMEPAD_MAPPING));
          this.showNotification(__("Keybindings reset!||¡Teclas restablecidas!"));
          this.showKeybindingsMenu();
        },
        () => {
          this.showKeybindingsMenu();
        },
        __("RESET||RESTABLECER"),
        __("CANCEL||CANCELAR")
      );
    });
    
    settingsWindow.addItem(__("< Back||< Volver"), "", () => {
      game.state.start("Settings");
    }, true);
    
    game.onMenuIn.dispatch('keybindings', settingsWindow);
  }
  
  showKeyboardCustomization(playerNum = 1, selectedIndex = 0, returnIndex = null) {
    const keysWindow = this.windowManager.createWindow(3, 1, 24, 14, "1");
    keysWindow.fontTint = 0x76fcde;
    
    const keyboardControls = [
      { key: "UP", description: "UP", mappingKey: "up", index: 0 },
      { key: "DOWN", description: "DOWN", mappingKey: "down", index: 0 },
      { key: "LEFT", description: "LEFT", mappingKey: "left", index: 0 },
      { key: "RIGHT", description: "RIGHT", mappingKey: "right", index: 0 },
      { key: "CONFIRM", description: "CONFIRM", mappingKey: "a", index: 0 },
      { key: "CANCEL", description: "CANCEL", mappingKey: "b", index: 0 },
      { key: "START", description: "START", mappingKey: "start", index: 0 },
      { key: "SELECT", description: "SELECT", mappingKey: "select", index: 0 }
    ];
    
    const playerKey = playerNum === 1 ? "player1" : "player2";
    
    keyboardControls.forEach(control => {
      const currentKey = this.getKeyboardKeyDisplay(playerKey, control.mappingKey, control.index);
      keysWindow.addItem(`${playerNum === 1 ? "P1" : "P2"} ${control.key}`, currentKey, () => {
        this.windowManager.remove(keysWindow, true);
        this.showKeyWaitOverlay(
          __(`PRESS KEY FOR: ${playerNum === 1 ? "P1" : "P2"} ${control.description}||PRESIONA TECLA PARA: ${playerNum === 1 ? "P1" : "P2"} ${control.description}`),
          (keyCode) => {
            this.mapKeyboardKey(playerNum, control.mappingKey, control.index, keyCode);
            this.showKeyboardCustomization(playerNum, keysWindow.selectedIndex, returnIndex);
          },
          () => {
            this.unmapKeyboardKey(playerNum, control.mappingKey, control.index);
            this.showKeyboardCustomization(playerNum, keysWindow.selectedIndex, returnIndex);
          }
        );
      });
    });
    
    keysWindow.addItem(__("< BACK||< VOLVER"), "", () => {
      this.windowManager.remove(keysWindow, true);
      this.windowManager.unfocus();
      this.showKeybindingsMenu();
    }, true);
  }
  
  showGamepadCustomization(playerNum = 1, selectedIndex = 0, returnIndex = null) {
    const gamepadWindow = this.windowManager.createWindow(3, 1, 24, 14, "1");
    gamepadWindow.fontTint = 0x76fcde;
    
    const gamepadControls = [
      { key: "UP", description: "UP", mappingKey: "up" },
      { key: "DOWN", description: "DOWN", mappingKey: "down" },
      { key: "LEFT", description: "LEFT", mappingKey: "left" },
      { key: "RIGHT", description: "RIGHT", mappingKey: "right" },
      { key: "CONFIRM", description: "CONFIRM", mappingKey: "a" },
      { key: "CANCEL", description: "CANCEL", mappingKey: "b" },
      { key: "START", description: "START", mappingKey: "start" },
      { key: "SELECT", description: "SELECT", mappingKey: "select" }
    ];
    
    const playerKey = playerNum === 1 ? "player1" : "player2";
    
    gamepadControls.forEach(control => {
      const currentButton = this.getGamepadButtonDisplay(playerKey, control.mappingKey);
      gamepadWindow.addItem(`${playerNum === 1 ? "P1" : "P2"} ${control.key}`, currentButton, () => {
        this.windowManager.remove(gamepadWindow, true);
        this.showKeyWaitOverlay(
          __(`PRESS GAMEPAD BUTTON FOR: ${playerNum === 1 ? "P1" : "P2"} ${control.description}||PRESIONA BOTÓN DEL MANDO PARA: ${playerNum === 1 ? "P1" : "P2"} ${control.description}`),
          (buttonCode) => {
            this.mapGamepadKey(playerNum, control.mappingKey, buttonCode);
            this.showGamepadCustomization(playerNum, gamepadWindow.selectedIndex, returnIndex);
          },
          () => {
            this.unmapGamepadKey(playerNum, control.mappingKey);
            this.showGamepadCustomization(playerNum, gamepadWindow.selectedIndex, returnIndex);
          }
        );
      });
    });
    
    gamepadWindow.addItem(__("< BACK||< VOLVER"), "", () => {
      this.windowManager.remove(gamepadWindow, true);
      this.windowManager.unfocus();
      this.showKeybindingsMenu();
    }, true);
  }
  
  showKeyWaitOverlay(message, onSubmit, onCancel) {
    this.cleanupWaitOverlay();
    
    this.waitOverlayActive = true;
    this.navigationHint.visible = false;
    
    const overlay = game.add.graphics(0, 0);
    overlay.beginFill(0x000000, 0.7);
    overlay.drawRect(0, 0, 240, 140);
    overlay.endFill();
    
    const instructionText = new Text(120, 50, message);
    instructionText.anchor.set(0.5, 0.5);
    instructionText.fontSize = 2;
    
    const helpText = new Text(120, 100, __("Hold ESC or MENU to unmap||Mantén ESC o MENÚ para desasignar"));
    helpText.anchor.set(0.5, 0.5);
    
    let escHoldStartTime = 0;
    let escIsHeld = false;
    let progressInterval = null;
    let keyPressed = false;
    
    const holdDuration = 1000;
    
    const progressBarBg = game.add.graphics(0, 0);
    progressBarBg.beginFill(0x333333, 0.8);
    progressBarBg.drawRect(0, 146, 240, 4);
    progressBarBg.endFill();
    progressBarBg.visible = false;
    
    const progressBar = game.add.graphics(0, 0);
    
    const updateProgress = () => {
      if (!escIsHeld || !this.waitOverlayActive) return;
      
      progressBarBg.visible = true;
      
      const elapsed = Date.now() - escHoldStartTime;
      const progress = Math.min(elapsed / holdDuration, 1);
      
      progressBar.clear();
      progressBar.beginFill(0xffffff, 1);
      progressBar.drawRect(0, 146, 240 * progress, 4);
      progressBar.endFill();
      
      const overlayAlpha = 0.7 * (1 - progress * 0.7);
      overlay.clear();
      overlay.beginFill(0x000000, overlayAlpha);
      overlay.drawRect(0, 0, 240, 140);
      overlay.endFill();
      
      if (progress >= 1) {
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        this.cleanupWaitOverlay();
        this.showNotification(__("Key unmapped!||¡Tecla desasignada!"));
        onCancel?.();
      }
    };
    
    const resetProgress = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      progressBar.clear();
      progressBarBg.visible = false;
      overlay.clear();
      overlay.beginFill(0x000000, 0.7);
      overlay.drawRect(0, 0, 240, 140);
      overlay.endFill();
    };
    
    const cleanup = () => {
      this.waitOverlayActive = false;
      this.navigationHint.visible = true;
      if (progressInterval) clearInterval(progressInterval);
      window.keyboardListener.onDown.remove(keyDownListener);
      window.keyboardListener.onUp.remove(keyUpListener);
      window.gamepadListener.onDown.remove(gamepadListener);
      overlay.destroy();
      instructionText.destroy();
      helpText.destroy();
      progressBarBg.destroy();
      progressBar.destroy();
    };
    
    const keyDownListener = (keyCode) => {
      if (!this.waitOverlayActive) return;
      
      if (keyCode === Phaser.KeyCode.ESC) {
        if (!escIsHeld) {
          escIsHeld = true;
          escHoldStartTime = Date.now();
          if (progressInterval) clearInterval(progressInterval);
          progressInterval = setInterval(updateProgress, 16);
        }
      } else if (!keyPressed) {
        keyPressed = true;
        // Check if key is Unidentified
        const keyName = this.getKeyName(keyCode);
        if (keyName === 'Unidentified' || keyName === '???') {
          cleanup();
          this.showNotification(__(`Cannot map: ${keyName}||No se puede asignar: ${keyName}`));
          this.showKeyWaitOverlay(message, onSubmit, onCancel);
          return;
        }
        cleanup();
        // Check for conflicts BEFORE calling onSubmit
        const conflict = this.findKeyboardKeyConflict(
          this._pendingPlayerKey || 'player1',
          this._pendingMappingKey || 'up',
          this._pendingIndex || 0,
          keyCode
        );
        if (conflict) {
          this.showNotification(__(`Changed with ${conflict.label}||Cambiado con ${conflict.label}`));
        }
        onSubmit?.(keyCode);
      }
    };
    
    const keyUpListener = (keyCode) => {
      if (!this.waitOverlayActive) return;
      
      if (keyCode === Phaser.KeyCode.ESC && escIsHeld) {
        escIsHeld = false;
        resetProgress();
      }
    };
    
    const gamepadListener = (buttonCode) => {
      if (!this.waitOverlayActive) return;
      
      cleanup();
      // Check for conflicts
      const conflict = this.findGamepadKeyConflict(
        this._pendingPlayerKey || 'player1',
        this._pendingMappingKey || 'up',
        buttonCode
      );
      if (conflict) {
        setTimeout(() => this.showNotification(__(`Swapped with ${conflict.label}||Intercambiado con ${conflict.label}`)));
      }
      onSubmit?.(buttonCode);
    };
    
    // Store pending info for conflict resolution
    const match = message.match(/P([12])/);
    if (match) {
      this._pendingPlayerKey = match[1] === '1' ? 'player1' : 'player2';
    }
    const keyMatch = message.match(/(UP|DOWN|LEFT|RIGHT|CONFIRM|CANCEL|START|SELECT)/);
    if (keyMatch) {
      const keyMap = {
        'UP': 'up',
        'DOWN': 'down',
        'LEFT': 'left',
        'RIGHT': 'right',
        'CONFIRM': 'a',
        'CANCEL': 'b',
        'START': 'start',
        'SELECT': 'select'
      };
      this._pendingMappingKey = keyMap[keyMatch[1]] || 'up';
    }
    this._pendingIndex = 0;
    
    window.keyboardListener.onDown.add(keyDownListener, this);
    window.keyboardListener.onUp.add(keyUpListener, this);
    window.gamepadListener.onDown.add(gamepadListener, this);
    
    this.waitOverlayElements = {
      overlay,
      instructionText,
      helpText,
      progressBarBg,
      progressBar,
      keyDownListener,
      keyUpListener,
      gamepadListener,
      cleanup
    };
  }
  
  cleanupWaitOverlay() {
    if (this.waitOverlayElements) {
      this.waitOverlayElements.cleanup?.();
      this.waitOverlayElements = null;
    }
    this.waitOverlayActive = false;
    this.navigationHint.visible = true;
  }
  
  mapKeyboardKey(playerNum, mappingKey, index, keyCode) {
    const playerKey = playerNum === 1 ? "player1" : "player2";
    const mapping = this.pendingChanges.keyboard;
    
    // Check if this key is already used elsewhere (conflict)
    const conflict = this.findKeyboardKeyConflict(playerKey, mappingKey, index, keyCode);
    
    if (conflict) {
      // Swap: move the conflicting key to the old position
      const oldKey = mapping[playerKey][mappingKey][index];
      mapping[conflict.playerKey][conflict.mappingKey][conflict.index] = oldKey;
    }
    
    // Set the new key
    if (!mapping[playerKey][mappingKey]) {
      mapping[playerKey][mappingKey] = [];
    }
    while (mapping[playerKey][mappingKey].length <= index) {
      mapping[playerKey][mappingKey].push(null);
    }
    mapping[playerKey][mappingKey][index] = keyCode;
    
    this.showNotification(__(`Mapped: ${this.getKeyName(keyCode)}||Asignado: ${this.getKeyName(keyCode)}`));
  }
  
  mapGamepadKey(playerNum, mappingKey, buttonCode) {
    const playerKey = playerNum === 1 ? "player1" : "player2";
    const mapping = this.pendingChanges.gamepad;
    
    // Check if this button is already used elsewhere
    const conflict = this.findGamepadKeyConflict(playerKey, mappingKey, buttonCode);
    
    if (conflict) {
      const oldButton = mapping[playerKey][mappingKey];
      mapping[conflict.playerKey][conflict.mappingKey] = oldButton;
    }
    
    mapping[playerKey][mappingKey] = buttonCode;
    
    this.showNotification(__(`Mapped: ${GAMEPAD_KEY_NAMES[buttonCode] || `BUTTON ${buttonCode}`}||Asignado: ${GAMEPAD_KEY_NAMES[buttonCode] || `BOTÓN ${buttonCode}`}`));
  }
  
  findKeyboardKeyConflict(playerKey, mappingKey, index, keyCode) {
    const mapping = this.pendingChanges.keyboard;
    const controlLabels = {
      'up': 'UP',
      'down': 'DOWN',
      'left': 'LEFT',
      'right': 'RIGHT',
      'a': 'CONFIRM',
      'b': 'CANCEL',
      'start': 'START',
      'select': 'SELECT'
    };
    
    for (const [pKey, player] of Object.entries(mapping)) {
      for (const [mKey, keys] of Object.entries(player)) {
        if (pKey === playerKey && mKey === mappingKey) continue;
        if (!Array.isArray(keys)) continue;
        for (let i = 0; i < keys.length; i++) {
          if (keys[i] === keyCode) {
            const label = `${pKey === 'player1' ? 'P1' : 'P2'} ${controlLabels[mKey] || mKey.toUpperCase()}`;
            return { playerKey: pKey, mappingKey: mKey, index: i, label: label };
          }
        }
      }
    }
    return null;
  }
  
  findGamepadKeyConflict(playerKey, mappingKey, buttonCode) {
    const mapping = this.pendingChanges.gamepad;
    const controlLabels = {
      'up': 'UP',
      'down': 'DOWN',
      'left': 'LEFT',
      'right': 'RIGHT',
      'a': 'CONFIRM',
      'b': 'CANCEL',
      'start': 'START',
      'select': 'SELECT'
    };
    
    for (const [pKey, player] of Object.entries(mapping)) {
      for (const [mKey, code] of Object.entries(player)) {
        if (pKey === playerKey && mKey === mappingKey) continue;
        if (code === buttonCode) {
          const label = `${pKey === 'player1' ? 'P1' : 'P2'} ${controlLabels[mKey] || mKey.toUpperCase()}`;
          return { playerKey: pKey, mappingKey: mKey, label: label };
        }
      }
    }
    return null;
  }
  
  unmapKeyboardKey(playerNum, mappingKey, index) {
    const playerKey = playerNum === 1 ? "player1" : "player2";
    const mapping = this.pendingChanges.keyboard;
    
    if (mapping[playerKey][mappingKey] && Array.isArray(mapping[playerKey][mappingKey]) && mapping[playerKey][mappingKey].length > index) {
      mapping[playerKey][mappingKey][index] = null;
      
      while (mapping[playerKey][mappingKey].length > 0 && mapping[playerKey][mappingKey][mapping[playerKey][mappingKey].length - 1] === null) {
        mapping[playerKey][mappingKey].pop();
      }
      
      this.showNotification(__("KEY UNMAPPED!||¡TECLA DESASIGNADA!"));
    }
  }
  
  unmapGamepadKey(playerNum, mappingKey) {
    const playerKey = playerNum === 1 ? "player1" : "player2";
    const mapping = this.pendingChanges.gamepad;
    
    mapping[playerKey][mappingKey] = null;
    
    this.showNotification(__("BUTTON UNMAPPED!||¡BOTÓN DESASIGNADO!"));
  }
  
  getKeyboardKeyDisplay(playerKey, mappingKey, index) {
    const mapping = this.pendingChanges.keyboard[playerKey][mappingKey];
    
    if (!mapping || !Array.isArray(mapping) || index >= mapping.length || !mapping[index]) {
      return "???";
    }
    
    return this.getKeyName(mapping[index]);
  }
  
  getGamepadButtonDisplay(playerKey, mappingKey) {
    const buttonCode = this.pendingChanges.gamepad[playerKey][mappingKey];
    
    if (buttonCode === undefined || buttonCode === null) {
      return "???";
    }
    
    return GAMEPAD_KEY_NAMES[buttonCode] || `BUTTON ${buttonCode}`;
  }
  
  getKeyName(keyCode) {
    for (const [name, code] of Object.entries(KEYBOARD_KEY_CODES)) {
      if (code === keyCode) {
        return this.formatKeyName(name);
      }
    }
    return `KEY ${keyCode}`;
  }
  
  formatKeyName(name) {
    const nameMap = KEYBOARD_KEY_NAMES;
    if (nameMap[name]) return nameMap[name];
    if (name.length === 1 && /^[A-Z0-9]$/.test(name)) return name;
    return name.replace(/_/g, ' ');
  }
  
  confirmDialog(message, onConfirm, onCancel, confirmText = "Yes", cancelText = "No") {
    const dialog = new DialogWindow(message, {
      buttons: [confirmText, cancelText]
    });
    
    dialog.onConfirm.add((buttonIndex) => {
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