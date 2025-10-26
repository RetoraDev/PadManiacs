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
    this.held = {
      any: false
    };
    this.pressed = {
      any: false
    };
    this.released = {
      any: false
    };

    // Initialize all keys to false
    this.keys.forEach(key => {
      this.held[key] = false;
      this.pressed[key] = false;
      this.released[key] = false;
    });

    // Keyboard mappings
    this.keyboardMap = {
      up: Phaser.KeyCode.UP,
      down: Phaser.KeyCode.DOWN,
      left: Phaser.KeyCode.LEFT,
      right: Phaser.KeyCode.RIGHT,
      a: Phaser.KeyCode.Z,      // Z key for A button
      b: Phaser.KeyCode.X,      // X key for B button
      select: Phaser.KeyCode.SHIFT,
      start: Phaser.KeyCode.ENTER
    };

    // Gamepad button mappings (standard gamepad layout)
    this.gamepadMap = {
      up: 12,    // D-pad up
      down: 13,  // D-pad down
      left: 14,  // D-pad left
      right: 15, // D-pad right
      a: 0,      // A button (usually bottom button)
      b: 1,      // B button (usually right button)
      select: 8, // Select button
      start: 9   // Start button
    };
    
    // Phaser signals to listen for key events
    this.signals = {
      pressed: {
        any: new Phaser.Signal()
      },
      released: {
        any: new Phaser.Signal()
      }
    };
    this.keys.forEach(key => {
      this.signals.pressed[key] = new Phaser.Signal()
      this.signals.released[key] = new Phaser.Signal()
    });

    // Touch tracking
    this.activeTouches = new Map(); // Map to track active touches: touchId -> buttonKey
    this.maxTouches = 2; // Maximum simultaneous touches allowed

    // Set up keyboard input
    this.setupKeyboard();

    // Set up gamepad input
    this.setupGamepad();

    // Set up touch input for virtual controls
    this.setupTouch();

    // Track previous state for pressed/released detection
    this.prevState = { ...this.held };
  }

  setupKeyboard() {
    // Create Phaser keyboard handlers for each key
    this.keyboard = {};
    for (const [key, keyCode] of Object.entries(this.keyboardMap)) {
      const keyboardKey = this.game.input.keyboard.addKey(keyCode);
      keyboardKey.onDown.add(() => this.held[key] = true);
      keyboardKey.onUp.add(() => this.held[key] = false);
      this.keyboard[key] = keyboardKey;
    }
  }

  setupGamepad() {
    this.gamepad = null;
    this.gamepadButtons = {};

    // Initialize gamepad buttons state
    for (const key of this.keys) {
      this.gamepadButtons[key] = false;
    }

    // Start gamepad input
    this.game.input.gamepad.start();

    // Check if a gamepad is already connected
    if (this.game.input.gamepad.supported && this.game.input.gamepad.active && this.game.input.gamepad.pad1.connected) {
      this.gamepad = this.game.input.gamepad.pad1;
    }

    // Listen for gamepad connected
    this.game.input.gamepad.onConnectCallback = (pad) => {
      this.gamepad = pad;
    };
  }

  setupTouch() {
    // Virtual D-pad buttons
    this.dpadElements = {
      up: document.getElementById('controller_up'),
      down: document.getElementById('controller_down'),
      left: document.getElementById('controller_left'),
      right: document.getElementById('controller_right')
    };
    
    // Virtual action buttons
    this.buttonElements = {
      a: document.getElementById('controller_a'),
      b: document.getElementById('controller_b'),
      select: document.getElementById('controller_select'),
      start: document.getElementById('controller_start'),
      // Virtual rhythm pad buttons (these are only for touch)
      rhythm_up: document.getElementById('controller_rhythm_up'),
      rhythm_down: document.getElementById('controller_rhythm_down'),
      rhythm_left: document.getElementById('controller_rhythm_left'),
      rhythm_right: document.getElementById('controller_rhythm_right')
    };

    // Get the parent controller element
    this.controllerElement = document.getElementById('controller');

    if (!this.controllerElement) return;

    // Set up touch event listeners on the parent controller element
    this.setupControllerTouchEvents();

    // Show virtual controls on touch devices
    if (this.game.device.touch) {
      this.controllerElement.style.display = 'block';
    }
  }

  setupControllerTouchEvents() {
    const controller = this.controllerElement;

    // Prevent default touch behavior to avoid scrolling
    controller.addEventListener('touchstart', (e) => {
      e.preventDefault();
    }, { passive: false });

    controller.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.handleTouchMove(e);
    }, { passive: false });

    controller.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleTouchEnd(e);
    }, { passive: false });

    controller.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.handleTouchEnd(e);
    }, { passive: false });

    // Also handle touch start
    controller.addEventListener('touchstart', (e) => {
      this.handleTouchStart(e);
    });
  }

  handleTouchStart(e) {
    const touches = e.changedTouches;

    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      
      // Check if we've reached the maximum number of touches
      if (this.activeTouches.size >= this.maxTouches) {
        continue;
      }

      const buttonKey = this.getButtonFromTouch(touch);
      
      if (buttonKey) {
        // Store the touch and associated button
        this.activeTouches.set(touch.identifier, buttonKey);
        
        // Activate the button
        this.held[buttonKey] = true;
        
        // Add visual feedback
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
      
      // Only process if this touch is already being tracked
      if (currentButtonKey !== undefined) {
        const newButtonKey = this.getButtonFromTouch(touch);
        
        // If the touch moved to a different button
        if (newButtonKey && newButtonKey !== currentButtonKey) {
          // Deactivate the old button
          this.held[currentButtonKey] = false;
          const oldElement = this.dpadElements[currentButtonKey] || this.buttonElements[currentButtonKey];
          if (oldElement) {
            oldElement.classList.remove('btnPressed');
          }
          
          // Activate the new button
          this.held[newButtonKey] = true;
          const newElement = this.dpadElements[newButtonKey] || this.buttonElements[newButtonKey];
          if (newElement) {
            newElement.classList.add('btnPressed');
          }
          
          // Update the tracking
          this.activeTouches.set(touch.identifier, newButtonKey);
        }
        // If the touch moved away from any button, deactivate the current button
        else if (!newButtonKey) {
          this.held[currentButtonKey] = false;
          const element = this.dpadElements[currentButtonKey] || this.buttonElements[currentButtonKey];
          if (element) {
            element.classList.remove('btnPressed');
          }
          // Don't remove from activeTouches yet - wait for touch end
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
        // Deactivate the button
        this.held[buttonKey] = false;
        
        // Remove visual feedback
        const element = this.dpadElements[buttonKey] || this.buttonElements[buttonKey];
        if (element) {
          element.classList.remove('btnPressed');
        }
        
        // Remove the touch from tracking
        this.activeTouches.delete(touch.identifier);
      }
    }
  }

  getButtonFromTouch(touch) {
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (!element) return null;

    // Check if the touched element is one of our controller buttons
    // or a child of one
    const buttonElement = element.closest('[id^="controller_"]');
    if (!buttonElement) return null;

    const id = buttonElement.id;
    
    // Extract the button key from the ID (remove "controller_" prefix)
    const key = id.replace('controller_', '').replace('rhythm_', '');
    
    // Return the key only if it's one of our recognized buttons
    return this.keys.includes(key) ? key : null;
  }

  update() {
    if (this.dontUpdateThisTime) {
      delete this.dontUpdateThisTime;
      return;
    }
    
    // Update gamepad state if connected
    this.updateGamepad();

    // Calculate pressed and released states
    this.updateButtonStates();
    
    // Dispatch signals
    this.keys.forEach(key => {
      if (this.pressed[key]) this.signals.pressed[key].dispatch();
      if (this.released[key]) this.signals.released[key].dispatch();
    });
    if (this.pressed.any) this.signals.pressed.any.dispatch();
    if (this.released.any) this.signals.released.any.dispatch();
    
    // Save previous state for pressed/released detection
    this.prevState = { ...this.held };
  }
  
  debugString() {
    const state = pressed => pressed ? "1" : "0";
    return this.keys.map(key => `${key} - ${state(this.held[key])}${state(this.pressed[key])}${state(this.released[key])}`).join('\n');
  }

  updateGamepad() {
    // Check if gamepad is connected and available
    if (!this.gamepad || !this.gamepad.connected) {
      // Try to get the first connected gamepad
      if (this.game.input.gamepad.active && this.game.input.gamepad.pad1.connected) {
        this.gamepad = this.game.input.gamepad.pad1;
      } else {
        return; // No gamepad connected
      }
    }

    // Update button states using Phaser CE's gamepad API
    for (const [key, buttonIndex] of Object.entries(this.gamepadMap)) {
      const button = this.gamepad.getButton(buttonIndex);
      if (button && button.isDown) {
        this.held[key] = true;
      } else {
        // Only set to false if not already set by touch
        if (!this.isTouchControlled(key)) {
          this.held[key] = false;
        }
      }
    }

    // Handle analog sticks for directional input
    // This allows using sticks as an alternative to the d-pad
    const deadZone = 0.2;

    // Check if analog sticks are available
    if (this.gamepad.axes.length >= 2) {
      const xAxis = this.gamepad.axis(0);
      const yAxis = this.gamepad.axis(1);

      if (Math.abs(xAxis) > deadZone || Math.abs(yAxis) > deadZone) {
        // Only update if not being controlled by touch
        if (!this.isTouchControlled('left') && !this.isTouchControlled('right')) {
          this.held.left = xAxis < -deadZone;
          this.held.right = xAxis > deadZone;
        }

        if (!this.isTouchControlled('up') && !this.isTouchControlled('down')) {
          this.held.up = yAxis < -deadZone;
          this.held.down = yAxis > deadZone;
        }
      } else {
        // Reset directional input if not being controlled by touch
        if (!this.isTouchControlled('left')) this.held.left = false;
        if (!this.isTouchControlled('right')) this.held.right = false;
        if (!this.isTouchControlled('up')) this.held.up = false;
        if (!this.isTouchControlled('down')) this.held.down = false;
      }
    }
  }

  isTouchControlled(key) {
    // Check if this key is currently being controlled by touch input
    return Array.from(this.activeTouches.values()).includes(key);
  }

  updateButtonStates() {
    // Calculate pressed (just pressed this frame) and released (just released this frame)
    for (const key of this.keys) {
      this.pressed[key] = this.held[key] && !this.prevState[key];
      this.released[key] = !this.held[key] && this.prevState[key];
    }
    // Update 'any' key states
    let anyKeyPressed = false;
    let anyKeyReleased = false;
    let anyKeyHeld = false;
    for (const key of this.keys) {
      if (this.pressed[key]) anyKeyPressed = true;
      if (this.released[key]) anyKeyReleased = true;
      if (this.held[key]) anyKeyHeld = true;
    }
    this.pressed.any = anyKeyPressed;
    this.released.any = anyKeyReleased;
    this.held.any = anyKeyHeld;
  }
  
  releaseAll() {
    this.keys.forEach(key => {
      this.pressed[key] = false;
      this.released[key] = false;
      this.held[key] = false;
    });
  }
  
  press(key) {
    this.dontUpdateThisTime = true;
    this.pressed[key] = true;
    this.pressed.any = true;
  }

  // Helper method to check if any direction is pressed
  isDirectionPressed() {
    return this.held.up || this.held.down || this.held.left || this.held.right;
  }

  // Helper method to get direction as a normalized vector
  getDirection() {
    let x = 0, y = 0;

    if (this.held.left) x -= 1;
    if (this.held.right) x += 1;
    if (this.held.up) y -= 1;
    if (this.held.down) y += 1;

    // Normalize for diagonal movement
    if (x !== 0 && y !== 0) {
      x *= 0.7071; // 1 / sqrt(2)
      y *= 0.7071;
    }

    return { x, y };
  }

  // Reset all states
  reset() {
    for (const key of this.keys) {
      this.held[key] = false;
      this.pressed[key] = false;
      this.released[key] = false;
      this.prevState[key] = false;
    }

    // Clear all active touches
    this.activeTouches.clear();

    // Remove pressed class from all virtual buttons
    for (const element of Object.values(this.dpadElements)) {
      if (element) element.classList.remove('btnPressed');
    }

    for (const element of Object.values(this.buttonElements)) {
      if (element) element.classList.remove('btnPressed');
    }
  }
  
  // Destroy
  destroy() {
    // Remove Phaser keyboard event listeners and clear keyboard keys
    if (this.keyboard) {
      for (const key in this.keyboard) {
        if (this.keyboard[key]) {
          this.keyboard[key].onDown.removeAll();
          this.keyboard[key].onUp.removeAll();
          this.game.input.keyboard.removeKey(this.keyboard[key]);
          this.keyboard[key] = null;
        }
      }
      this.keyboard = null;
    }
  
    // Remove gamepad onConnect callback
    if (this.game && this.game.input && this.game.input.gamepad) {
      this.game.input.gamepad.onConnectCallback = null;
    }
    this.gamepad = null;
    this.gamepadButtons = null;
  
    // Remove all Phaser signals listeners
    if (this.signals) {
      for (const key of this.keys) {
        if (this.signals.pressed[key]) {
          this.signals.pressed[key].removeAll();
          this.signals.pressed[key] = null;
        }
        if (this.signals.released[key]) {
          this.signals.released[key].removeAll();
          this.signals.released[key] = null;
        }
      }
      this.signals = null;
    }
  
    // Remove touch event listeners from controller element
    if (this.controllerElement) {
      this.controllerElement.removeEventListener('touchstart', this.handleTouchStart.bind(this));
      this.controllerElement.removeEventListener('touchmove', this.handleTouchMove.bind(this));
      this.controllerElement.removeEventListener('touchend', this.handleTouchEnd.bind(this));
      this.controllerElement.removeEventListener('touchcancel', this.handleTouchEnd.bind(this));
      this.controllerElement = null;
    }
  
    // Clear active touches map
    if (this.activeTouches) {
      this.activeTouches.clear();
      this.activeTouches = null;
    }
  
    // Clear other references
    this.keys = null;
    this.held = null;
    this.pressed = null;
    this.released = null;
    this.prevState = null;
    this.dpadElements = null;
    this.buttonElements = null;
    this.keyboardMap = null;
    this.gamepadMap = null;
    this.game = null;
  }
}
