class Keybindings {
  create() {
    game.camera.fadeIn(0x000000);

    this.futuristicLines = new FuturisticLines();
    this.backgroundGradient = new BackgroundGradient();
    this.navigationHint = new NavigationHint([
      {
        position: "right",
        icon: "d-pad",
        text: "NAVIGATE"
      },
      {
        position: "right",
        icon: "a",
        text: "CHANGE"
      },
      {
        position: "right",
        icon: "b",
        text: "BACK"
      }
    ]);
    
    this.windowManager = new WindowManager();
    
    // Estado para la espera de teclas
    this.waitingState = null; // { type, mappingKey, index, description, selectedIndex, menuWindow }
    this.waitOverlayActive = false;
    this.originalCallbacks = {
      keyboardDown: null,
      keyboardUp: null,
      gamepadDown: null
    };
    
    gamepad.releaseAll();
    
    this.showKeybindingsMenu();
    
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  update() {
    gamepad.update();
    this.windowManager.update();
  }
  
  shutdown() {
    // Limpiar cualquier overlay activo al salir
    this.cleanupWaitOverlay();
  }
  
  showKeybindingsMenu() {
    const settingsWindow = this.windowManager.createWindow(3, 1, 24, 14, "1");
    settingsWindow.fontTint = 0x76fcde;
    
    this.windowManager.focus(settingsWindow);
    
    // NEW: Player-specific categories
    settingsWindow.addItem("PLAYER 1 KEYBOARD", ">", () => {
      this.windowManager.remove(settingsWindow, true);
      this.showKeyboardCustomization(1);
    });
    
    settingsWindow.addItem("PLAYER 2 KEYBOARD", ">", () => {
      this.windowManager.remove(settingsWindow, true);
      this.showKeyboardCustomization(2);
    });
    
    settingsWindow.addItem("PLAYER 1 GAMEPAD", ">", () => {
      this.windowManager.remove(settingsWindow, true);
      this.showGamepadCustomization(1);
    });
    
    settingsWindow.addItem("PLAYER 2 GAMEPAD", ">", () => {
      this.windowManager.remove(settingsWindow, true);
      this.showGamepadCustomization(2);
    });
    
    settingsWindow.addItem("RESET TO DEFAULTS", "", () => {
      // RESET both players
      this.windowManager.remove(settingsWindow, true);
      this.confirmDialog(
        "Reset all keybindings to default settings?",
        () => {
          Account.mapping.keyboard = JSON.parse(JSON.stringify(DEFAULT_KEYBOARD_MAPPING));
          Account.mapping.gamepad = JSON.parse(JSON.stringify(DEFAULT_GAMEPAD_MAPPING));
          saveAccount();
          gamepad1.updateMapping(Account.mapping.keyboard.player1, Account.mapping.gamepad.player1);
          gamepad2.updateMapping(Account.mapping.keyboard.player2, Account.mapping.gamepad.player2);
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
    
    const playerPrefix = playerNum === 1 ? "player1." : "player2.";
    
    keyboardControls.forEach(control => {
      const currentKey = this.getKeyboardKeyDisplay(playerPrefix + control.mappingKey, control.index);
      keysWindow.addItem(`${playerNum === 1 ? "P1" : "P2"} ${control.key}`, currentKey, () => {
        this.waitingState = {
          type: "keyboard",
          playerNum: playerNum,
          mappingKey: control.mappingKey,
          index: control.index,
          description: `${playerNum === 1 ? "Player 1" : "Player 2"} ${control.description}`,
          selectedIndex: keysWindow.selectedIndex,
          menuWindow: keysWindow
        };
        this.windowManager.remove(keysWindow, true);
        this.showKeyWaitOverlay(playerNum, `PRESS KEY FOR: ${playerNum === 1 ? "P1" : "P2"} ${control.description}`);
      });
    });
    
    keysWindow.addItem("< BACK", "", () => {
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
    
    const playerPrefix = playerNum === 1 ? "player1." : "player2.";
    
    gamepadControls.forEach(control => {
      const currentButton = this.getGamepadButtonDisplay(playerPrefix + control.mappingKey);
      gamepadWindow.addItem(`${playerNum === 1 ? "P1" : "P2"} ${control.key}`, currentButton, () => {
        this.waitingState = {
          type: "gamepad",
          playerNum: playerNum,
          mappingKey: control.mappingKey,
          description: `${playerNum === 1 ? "Player 1" : "Player 2"} ${control.description}`,
          selectedIndex: gamepadWindow.selectedIndex,
          menuWindow: gamepadWindow
        };
        this.windowManager.remove(gamepadWindow, true);
        this.showKeyWaitOverlay(playerNum, `PRESS GAMEPAD BUTTON FOR: ${playerNum === 1 ? "P1" : "P2"} ${control.description}`);
      });
    });
    
    gamepadWindow.addItem("< BACK", "", () => {
      this.windowManager.remove(gamepadWindow, true);
      this.windowManager.unfocus();
      this.showKeybindingsMenu();
    }, true);
  }
  
  showKeyWaitOverlay(playerNum = 1, message = "PRESS ANY KEY") {
    // Limpiar cualquier overlay existente
    this.cleanupWaitOverlay();
    
    this.waitOverlayActive = true;
    
    this.navigationHint.visible = false;
    
    // Crear elementos visuales
    const overlay = game.add.graphics(0, 0);
    overlay.beginFill(0x000000, 0.7);
    overlay.drawRect(0, 0, 240, 140);
    overlay.endFill();
    
    const instructionText = new Text(120, 50, message);
    instructionText.anchor.set(0.5, 0.5);
    instructionText.fontSize = 2;
    
    const helpText = new Text(120, 100, "Hold ESC or MENU to unmap");
    helpText.anchor.set(0.5, 0.5);
    
    const progressBarBg = game.add.graphics(0, 0);
    progressBarBg.beginFill(0x333333, 0.8);
    progressBarBg.drawRect(0, 146, 240, 4);
    progressBarBg.endFill();
    progressBarBg.visible = false;
    
    const progressBar = game.add.graphics(0, 0);
    
    // Estado del hold
    let escHoldStartTime = 0;
    let escIsHeld = false;
    let progressInterval = null;
    
    const holdDuration = 1000;
    
    const updateProgress = () => {
      if (!escIsHeld || !this.waitOverlayActive) return;
      
      progressBarBg.visible = true;
      
      const elapsed = Date.now() - escHoldStartTime;
      const progress = Math.min(elapsed / holdDuration, 1);
      
      progressBar.clear();
      progressBar.beginFill(0xffffff, 1);
      progressBarBg.drawRect(0, 146, 240 * progress, 4);
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
        this.unmapCurrentKey();
      }
    };
    
    const resetProgress = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      progressBar.clear();
      overlay.clear();
      overlay.beginFill(0x000000, 0.7);
      overlay.drawRect(0, 0, 240, 140);
      overlay.endFill();
    };
    
    // Listeners
    const keyDownListener = (event) => {
      if (!this.waitOverlayActive || !this.waitingState) return;
      
      if (event.keyCode === Phaser.KeyCode.ESC) {
        if (!escIsHeld) {
          escIsHeld = true;
          escHoldStartTime = Date.now();
          if (progressInterval) clearInterval(progressInterval);
          progressInterval = setInterval(updateProgress, 16);
        }
      } else if (this.waitingState.type === "keyboard") {
        if (escIsHeld) {
          escIsHeld = false;
          resetProgress();
        }
      }
    };
    
    const keyUpListener = (event) => {
      if (!this.waitOverlayActive) return;
      
      if (event.keyCode === Phaser.KeyCode.ESC && escIsHeld) {
        const holdTime = Date.now() - escHoldStartTime;
        escIsHeld = false;
        resetProgress();
      }
      
      this.handleKeyboardKeyPress(event.keyCode);
    };
    
    const gamepadListener = (buttonCode, _, index) => {
      if (!this.waitOverlayActive || !this.waitingState || index + 1 != playerNum) return;
      
      if (this.waitingState.type === "gamepad") {
        this.handleGamepadButtonPress(buttonCode);
      }
    };
    
    // Guardar callbacks originales
    this.originalCallbacks = {
      keyboardDown: game.input.keyboard.onDownCallback,
      keyboardUp: game.input.keyboard.onUpCallback,
      gamepadDown: game.input.gamepad.onDownCallback
    };
    
    // Instalar nuevos callbacks
    game.input.keyboard.onDownCallback = keyDownListener;
    game.input.keyboard.onUpCallback = keyUpListener;
    game.input.gamepad.onDownCallback = gamepadListener;
    
    // Guardar referencia para cleanup
    this.waitOverlayElements = {
      overlay,
      instructionText,
      helpText,
      progressBarBg,
      progressBar,
      keyDownListener,
      keyUpListener,
      gamepadListener,
      progressInterval,
      resetProgress
    };
  }
  
  cleanupWaitOverlay() {
    if (!this.waitOverlayActive) return;
    
    this.waitOverlayActive = false;
    
    // Limpiar intervalo
    if (this.waitOverlayElements?.progressInterval) {
      clearInterval(this.waitOverlayElements.pro.gressInterval);
    }
    
    // Destruir elementos gráficos
    const elements = ['overlay', 'instructionText', 'helpText', 'progressBarBg', 'progressBar'];
    for (const el of elements) {
      if (this.waitOverlayElements?.[el] && typeof this.waitOverlayElements[el].destroy === 'function') {
        this.waitOverlayElements[el].destroy();
      }
    }
    
    // Mostrar lo que fue oculto
    this.navigationHint.visible = true;
    
    // Restaurar callbacks originales
    if (this.originalCallbacks.keyboardDown !== undefined) {
      game.input.keyboard.onDownCallback = this.originalCallbacks.keyboardDown;
    } else {
      game.input.keyboard.onDownCallback = null;
    }
    
    if (this.originalCallbacks.keyboardUp !== undefined) {
      game.input.keyboard.onUpCallback = this.originalCallbacks.keyboardUp;
    } else {
      game.input.keyboard.onUpCallback = null;
    }
    
    if (this.originalCallbacks.gamepadDown !== undefined) {
      game.input.gamepad.onDownCallback = this.originalCallbacks.gamepadDown;
    } else {
      game.input.gamepad.onDownCallback = null;
    }
    
    this.waitOverlayElements = null;
  }
  
  cancelKeyWait() {
    if (!this.waitOverlayActive) return;
    
    const waitingState = this.waitingState;
    this.cleanupWaitOverlay();
    
    if (waitingState && waitingState.menuWindow) {
      // Devolver al menú anterior
      if (waitingState.type === "keyboard") {
        this.showKeyboardCustomization(waitingState.selectedIndex, waitingState.selectedIndex);
      } else if (waitingState.type === "gamepad") {
        this.showGamepadCustomization(waitingState.selectedIndex, waitingState.selectedIndex);
      }
    }
    
    this.waitingState = null;
  }
  
  handleKeyboardKeyPress(keyCode) {
    if (!this.waitingState || this.waitingState.type !== "keyboard") return;
    
    const mapping = Account.mapping.keyboard;
    const { playerNum, mappingKey, index } = this.waitingState;
    const playerKey = playerNum === 1 ? "player1" : "player2";
    
    if (!mapping[playerKey][mappingKey]) {
      mapping[playerKey][mappingKey] = [];
    }
    
    while (mapping[playerKey][mappingKey].length <= index) {
      mapping[playerKey][mappingKey].push(null);
    }
    
    mapping[playerKey][mappingKey][index] = keyCode;
    
    saveAccount();
    // Update appropriate gamepad
    if (playerNum === 1) {
      gamepad1.updateMapping(Account.mapping.keyboard.player1, Account.mapping.gamepad.player1);
    } else {
      gamepad2.updateMapping(Account.mapping.keyboard.player2, Account.mapping.gamepad.player2);
    }
    
    notifications.show(`MAPPED: ${this.getKeyName(keyCode)}`);
    
    const selectedIndex = this.waitingState.selectedIndex;
    this.cleanupWaitOverlay();
    this.showKeyboardCustomization(playerNum, selectedIndex, selectedIndex);
    this.waitingState = null;
  }
  
  handleGamepadButtonPress(buttonCode) {
    if (!this.waitingState || this.waitingState.type !== "gamepad") return;
    
    const { playerNum, mappingKey } = this.waitingState;
    const playerKey = playerNum === 1 ? "player1" : "player2";
    
    Account.mapping.gamepad[playerKey][mappingKey] = buttonCode;
    
    saveAccount();
    if (playerNum === 1) {
      gamepad1.updateMapping(Account.mapping.keyboard.player1, Account.mapping.gamepad.player1);
    } else {
      gamepad2.updateMapping(Account.mapping.keyboard.player2, Account.mapping.gamepad.player2);
    }
    
    notifications.show(`MAPPED: ${GAMEPAD_KEY_NAMES[buttonCode] || `BUTTON ${buttonCode}`}`);
    
    const selectedIndex = this.waitingState.selectedIndex;
    this.cleanupWaitOverlay();
    this.showGamepadCustomization(playerNum, selectedIndex, selectedIndex);
    this.waitingState = null;
  }
  
  unmapCurrentKey() {
    if (!this.waitingState) return;
    
    if (this.waitingState.type === "keyboard") {
      const mapping = Account.mapping.keyboard;
      const { mappingKey, index } = this.waitingState;
      
      if (mapping[mappingKey] && Array.isArray(mapping[mappingKey]) && mapping[mappingKey].length > index) {
        mapping[mappingKey][index] = null;
        
        while (mapping[mappingKey].length > 0 && mapping[mappingKey][mapping[mappingKey].length - 1] === null) {
          mapping[mappingKey].pop();
        }
        
        saveAccount();
        gamepad.updateMapping(Account.mapping.keyboard, Account.mapping.gamepad);
        notifications.show("KEY UNMAPPED!");
      }
    } else if (this.waitingState.type === "gamepad") {
      Account.mapping.gamepad[this.waitingState.mappingKey] = null;
      saveAccount();
      gamepad.updateMapping(Account.mapping.keyboard, Account.mapping.gamepad);
      notifications.show("BUTTON UNMAPPED!");
    }
    
    const selectedIndex = this.waitingState.selectedIndex;
    const wasKeyboard = this.waitingState.type === "keyboard";
    
    this.cleanupWaitOverlay();
    
    if (wasKeyboard) {
      this.showKeyboardCustomization(selectedIndex, selectedIndex);
    } else {
      this.showGamepadCustomization(selectedIndex, selectedIndex);
    }
    
    this.waitingState = null;
  }
  
  getKeyboardKeyDisplay(mappingPath, index) {
    const [player, mappingKey] = mappingPath.split('.');
    const mapping = Account.mapping.keyboard[player][mappingKey];
    
    if (!mapping || !Array.isArray(mapping) || index >= mapping.length || !mapping[index]) {
      return "???";
    }
    
    return this.getKeyName(mapping[index]);
  }
  
  getGamepadButtonDisplay(mappingPath) {
    const [player, mappingKey] = mappingPath.split('.');
    const buttonCode = Account.mapping.gamepad[player][mappingKey];
    
    if (buttonCode === undefined || buttonCode === null) {
      return "???";
    }
    
    return GAMEPAD_KEY_NAMES[buttonCode] || `BUTTON ${buttonCode}`;
  }
  
  getKeyName(keyCode) {
    for (const [name, code] of Object.entries(Phaser.KeyCode)) {
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