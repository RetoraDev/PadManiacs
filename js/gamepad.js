class Gamepad {
  constructor(game) {
    this.game = game;

    // Define the control keys we want to track
    this.keys = [
      'up',
      'down',
      'left',
      'right',
      'a',
      'b',
      'select',
      'start'
    ];

    // Initialize state objects
    this.held = {};
    this.pressed = {};
    this.released = {};
    this.prevState = {};

    // Initialize all keys
    this.keys.forEach(key => {
      this.held[key] = false;
      this.pressed[key] = false;
      this.released[key] = false;
      this.prevState[key] = false;
    });
    
    // Initialize 'any' states
    this.held.any = false;
    this.pressed.any = false;
    this.released.any = false;
    this.prevState.any = false;

    // Keyboard mappings
    this.keyboardMap = {
      up: [Phaser.KeyCode.UP, Phaser.KeyCode.W, Phaser.KeyCode.B],
      down: [Phaser.KeyCode.DOWN, Phaser.KeyCode.S, Phaser.KeyCode.V],
      left: [Phaser.KeyCode.LEFT, Phaser.KeyCode.A, Phaser.KeyCode.C],
      right: [Phaser.KeyCode.RIGHT, Phaser.KeyCode.D, Phaser.KeyCode.N],
      a: [Phaser.KeyCode.Z, Phaser.KeyCode.K],
      b: [Phaser.KeyCode.X, Phaser.KeyCode.J],
      select: [Phaser.KeyCode.SHIFT, Phaser.KeyCode.TAB],
      start: [Phaser.KeyCode.ENTER, Phaser.KeyCode.ESC]
    };
    
    // Gamepad button mappings
    this.gamepadMap = {
      up: 12,
      down: 13,
      left: 14,
      right: 15,
      a: 0,
      b: 1,
      select: 8,
      start: 9
    };
    
    // Phaser signals
    this.signals = {
      pressed: {},
      released: {}
    };
    this.keys.forEach(key => {
      this.signals.pressed[key] = new Phaser.Signal();
      this.signals.released[key] = new Phaser.Signal();
    });
    this.signals.pressed.any = new Phaser.Signal();
    this.signals.released.any = new Phaser.Signal();

    // Touch tracking
    this.activeTouches = new Map();
    this.maxTouches = 4;

    // Input detection
    this.lastInputSource = 'none';
    this.inputDetectionTimeout = null;
    this.touchControlsVisible = false;

    // Set up all input methods
    this.setupKeyboard();
    this.setupGamepad();
    this.setupTouch();
    this.setupInputDetection();
  }

  setupKeyboard() {
    // Clear any existing keyboard state
    this.keyboardState = {};
    this.keys.forEach(key => {
      this.keyboardState[key] = false;
    });
  
    // Create reverse mapping for quick lookup
    this.keyCodeToAction = {};
    for (const [action, keyCodes] of Object.entries(this.keyboardMap)) {
      keyCodes.forEach(keyCode => {
        this.keyCodeToAction[keyCode] = action;
      });
    }
  
    // Dynamically create key capture array from keyboard map
    const keyCaptureArray = [];
    for (const keyCodes of Object.values(this.keyboardMap)) {
      keyCaptureArray.push(...keyCodes);
    }
    
    // Remove duplicates and add key capture
    const uniqueKeyCapture = [...new Set(keyCaptureArray)];
    this.game.input.keyboard.addKeyCapture(uniqueKeyCapture);
  
    // Global keyboard listeners
    this.game.input.keyboard.onDownCallback = (event) => {
      const action = this.keyCodeToAction[event.keyCode];
      if (action) {
        this.held[action] = true;
        this.keyboardState[action] = true;
      }
      this.detectInputSource('keyboard');
    };
  
    this.game.input.keyboard.onUpCallback = (event) => {
      const action = this.keyCodeToAction[event.keyCode];
      if (action) {
        this.held[action] = false;
        this.keyboardState[action] = false;
      }
    };
  }

  setupGamepad() {
    // Start gamepad polling
    if (!this.game.input.gamepad.supported) return
    
    this.game.input.gamepad.start();
    
    this.gamepadState = {};
    this.keys.forEach(key => {
      this.gamepadState[key] = false;
    });
    
    this.game.input.gamepad.onDownCallback = keyCode => {
      this.keys.forEach(key => {
        if (this.gamepadMap[key] == keyCode) {
          this.held[key] = true;
          this.gamepadState[key] = true;
        }
      });
    };
    
    this.game.input.gamepad.onUpCallback = keyCode => {
      this.keys.forEach(key => {
        if (this.gamepadMap[key] == keyCode) {
          this.held[key] = false;
          this.gamepadState[key] = false;
        }
      });
    };
  }

  setupTouch() {
    // Get controller elements
    this.controllerElement = document.getElementById('controller');
    
    if (!this.controllerElement) {
      return;
    }

    // Get all button elements
    this.dpadElements = {
      up: document.getElementById('controller_up'),
      down: document.getElementById('controller_down'),
      left: document.getElementById('controller_left'),
      right: document.getElementById('controller_right')
    };
    
    this.buttonElements = {
      a: document.getElementById('controller_a'),
      b: document.getElementById('controller_b'),
      select: document.getElementById('controller_select'),
      start: document.getElementById('controller_start'),
      rhythm_up: document.getElementById('controller_rhythm_up'),
      rhythm_down: document.getElementById('controller_rhythm_down'),
      rhythm_left: document.getElementById('controller_rhythm_left'),
      rhythm_right: document.getElementById('controller_rhythm_right')
    };

    // Set up touch events
    this.setupControllerTouchEvents();

    // Initial visibility - show on mobile, hide on desktop
    this.updateTouchControlsVisibility();
  }

  setupInputDetection() {
    // Listen for screen taps to show touch controls
    document.addEventListener('touchstart', (e) => {
      if (!e.target.closest('#controller')) {
        this.detectInputSource('touch');
      }
    }, { passive: true });

    // Also detect clicks outside controller
    document.addEventListener('mousedown', (e) => {
      if (this.game.device.touch && !e.target.closest('#controller')) {
        this.detectInputSource('touch');
      }
    }, { passive: true });
  }

  detectInputSource(source) {
    if (this.lastInputSource === source) return;

    this.lastInputSource = source;
    
    // Clear existing timeout
    if (this.inputDetectionTimeout) {
      clearTimeout(this.inputDetectionTimeout);
    }

    // Update touch controls visibility
    this.updateTouchControlsVisibility();

    // Auto-hide touch controls after 10 seconds of no touch input
    if (source !== 'touch' && this.game.device.touch) {
      this.inputDetectionTimeout = setTimeout(() => {
        if (this.lastInputSource === source) {
          this.lastInputSource = 'none';
          this.updateTouchControlsVisibility();
        }
      }, 10000);
    }
  }

  updateTouchControlsVisibility() {
    if (!this.controllerElement) return;

    const shouldShow = this.game.device.touch && 
                     (this.lastInputSource === 'touch' || this.lastInputSource === 'none');

    if (shouldShow !== this.touchControlsVisible) {
      this.controllerElement.style.display = shouldShow ? 'block' : 'none';
      this.touchControlsVisible = shouldShow;
    }
  }

  setupControllerTouchEvents() {
    const controller = this.controllerElement;

    // Prevent default touch behavior
    const preventDefault = (e) => e.preventDefault();
    
    controller.addEventListener('touchstart', preventDefault, { passive: false });
    controller.addEventListener('touchmove', preventDefault, { passive: false });
    controller.addEventListener('touchend', preventDefault, { passive: false });
    controller.addEventListener('touchcancel', preventDefault, { passive: false });

    // Handle touch events
    controller.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    controller.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    controller.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    controller.addEventListener('touchcancel', (e) => this.handleTouchEnd(e));
  }

  handleTouchStart(e) {
    const touches = e.changedTouches;

    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      
      if (this.activeTouches.size >= this.maxTouches) continue;

      const buttonKey = this.getButtonFromTouch(touch);
      
      
      if (buttonKey) {
        this.activeTouches.set(touch.identifier, buttonKey);
        this.held[buttonKey.replace('rhythm_', '')] = true;
        this.detectInputSource('touch');
        
        const element = this.dpadElements[buttonKey] || this.buttonElements[buttonKey];
        if (element) {
          element.classList.add('btnPressed');
        }
      }
    }
  }

  handleTouchMove(e) {
    const touches = e.changedTouches;

    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const currentButtonKey = this.activeTouches.get(touch.identifier);
      
      if (currentButtonKey !== undefined) {
        const newButtonKey = this.getButtonFromTouch(touch);
        
        if (newButtonKey && newButtonKey !== currentButtonKey) {
          // Switch to new button
          this.held[currentButtonKey.replace('rhythm_', '')] = false;
          this.held[newButtonKey.replace('rhythm_', '')] = true;
          
          const oldElement = this.dpadElements[currentButtonKey] || this.buttonElements[currentButtonKey];
          const newElement = this.dpadElements[newButtonKey] || this.buttonElements[newButtonKey];
          
          if (oldElement) oldElement.classList.remove('btnPressed');
          if (newElement) newElement.classList.add('btnPressed');
          
          this.activeTouches.set(touch.identifier, newButtonKey);
        } else if (!newButtonKey) {
          // Moved away from buttons
          this.held[currentButtonKey.replace('rhythm_', '')] = false;
          const element = this.dpadElements[currentButtonKey] || this.buttonElements[currentButtonKey];
          if (element) element.classList.remove('btnPressed');
        }
      }
    }
  }

  handleTouchEnd(e) {
    const touches = e.changedTouches;

    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const buttonKey = this.activeTouches.get(touch.identifier);
      
      if (buttonKey !== undefined) {
        this.held[buttonKey.replace('rhythm_', '')] = false;
        
        const element = this.dpadElements[buttonKey] || this.buttonElements[buttonKey];
        if (element) element.classList.remove('btnPressed');
        
        this.activeTouches.delete(touch.identifier);
      }
    }
  }

  getButtonFromTouch(touch) {
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return null;

    const buttonElement = element.closest('[id^="controller_"]');
    if (!buttonElement) return null;

    const id = buttonElement.id;
    const key = id.replace('controller_', '');
    
    return this.keys.includes(key) || key.startsWith('rhythm_') ? key : null;
  }

  update() {
    if (this.dontUpdateThisTime) {
      delete this.dontUpdateThisTime;
      return;
    }
    
    // Calculate pressed and released states
    this.updateButtonStates();
    
    // Dispatch signals for any pressed/released keys
    let anyPressed = false;
    let anyReleased = false;
    
    this.keys.forEach(key => {
      if (this.pressed[key]) {
        this.signals.pressed[key].dispatch();
        anyPressed = true;
      }
      if (this.released[key]) {
        this.signals.released[key].dispatch();
        anyReleased = true;
      }
    });
    
    // Dispatch 'any' signals
    if (anyPressed) this.signals.pressed.any.dispatch();
    if (anyReleased) this.signals.released.any.dispatch();
    
    // Save current state for next frame
    this.keys.forEach(key => {
      this.prevState[key] = this.held[key];
    });
    this.prevState.any = this.held.any;
  }

  isTouchControlled(key) {
    return Array.from(this.activeTouches.values()).includes(key);
  }

  updateButtonStates() {
    // Calculate pressed/released for individual keys
    let anyPressed = false;
    let anyReleased = false;
    let anyHeld = false;

    this.keys.forEach(key => {
      this.pressed[key] = this.held[key] && !this.prevState[key];
      this.released[key] = !this.held[key] && this.prevState[key];
      
      if (this.pressed[key]) anyPressed = true;
      if (this.released[key]) anyReleased = true;
      if (this.held[key]) anyHeld = true;
    });

    // Update 'any' states
    this.pressed.any = anyPressed;
    this.released.any = anyReleased;
    this.held.any = anyHeld;
  }
  
  releaseAll() {
    this.keys.forEach(key => {
      this.held[key] = false;
      this.pressed[key] = false;
      this.released[key] = false;
    });
    this.held.any = false;
    this.pressed.any = false;
    this.released.any = false;
  }
  
  press(key) {
    this.dontUpdateThisTime = true;
    this.pressed[key] = true;
    this.pressed.any = true;
    this.held[key] = true;
    this.held.any = true;
  }

  isDirectionPressed() {
    return this.held.up || this.held.down || this.held.left || this.held.right;
  }

  getDirection() {
    let x = 0, y = 0;

    if (this.held.left) x -= 1;
    if (this.held.right) x += 1;
    if (this.held.up) y -= 1;
    if (this.held.down) y += 1;

    if (x !== 0 && y !== 0) {
      x *= 0.7071;
      y *= 0.7071;
    }

    return { x, y };
  }

  reset() {
    this.releaseAll();
    this.activeTouches.clear();

    // Remove pressed classes from all buttons
    Object.values(this.dpadElements).forEach(el => el?.classList.remove('btnPressed'));
    Object.values(this.buttonElements).forEach(el => el?.classList.remove('btnPressed'));
  }
  
  destroy() {
    // Clean up everything
    if (this.inputDetectionTimeout) {
      clearTimeout(this.inputDetectionTimeout);
    }

    // Keyboard cleanup
    if (this.keyboardKeys) {
      Object.values(this.keyboardKeys).forEach(keys => {
        keys.forEach(key => {
          key.onDown.removeAll();
          key.onUp.removeAll();
        });
      });
    }

    // Gamepad cleanup
    if (this.game.input.gamepad) {
      this.game.input.gamepad.onConnectCallback = null;
      this.game.input.gamepad.onDisconnectCallback = null;
    }

    // Signal cleanup
    if (this.signals) {
      Object.values(this.signals.pressed).forEach(signal => signal?.removeAll());
      Object.values(this.signals.released).forEach(signal => signal?.removeAll());
    }

    // Touch cleanup
    if (this.controllerElement) {
      this.controllerElement.remove();
    }

    this.activeTouches?.clear();
  }
}