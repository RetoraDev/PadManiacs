/**
 * @class Gamepad
 * @category Core Game Classes
 * @summary Unified input system for keyboard, touchscreen, and gamepad
 * @constructor
 * @param {Phaser.Game} game - Phaser game instance
 * @param {Object} keyboardMap - Mapping of action names to keyboard key codes
 * @param {Object} gamepadMap - Mapping of action names to gamepad button codes
 * @param {number} [playerIndex=0] - Player index this gamepad handles (0 or 1)
 * @features
 * Tracks held, pressed, and released state for every action every frame
 * Accepts input from keyboard, on-screen touch buttons, and HTML5 gamepads
 * Dispatches Phaser signals when keys are pressed or released
 * Detects the active input source to show touch controls and drive vibration
 * @description
 * Gamepad is the per-player input controller that sits between raw hardware input
 * and game logic. State objects (held, pressed, released, prevState) hold one boolean
 * per tracked action and are refreshed by the update() loop. The class wires keyboard
 * and gamepad listeners through InputManager and dispatches pressed/released Phaser
 * signals plus a combined "any" signal, so game code never touches browser events.
 * @example
 * // Modding usage example
 * const pad = new Gamepad(game, keyboardMap, gamepadMap, 0);
 * pad.signals.pressed.up.add(() => {
 *   console.log('Up pressed');
 * });
 * // Rebuild button mappings at runtime
 * pad.updateMapping(newKeyboardMap, newGamepadMap);
 * // Read raw state in your update loop
 * if (pad.pressed.a) player.jump();
 */
class Gamepad {
  constructor(game, keyboardMap, gamepadMap, playerIndex = 0) {
    /** @type {Phaser.Game} Phaser game instance this controller belongs to */
    this.game = game;
    
    /** @type {number} Player index (0 for player 1, 1 for player 2) */
    this.playerIndex = playerIndex; // 0 for player 1, 1 for player 2

    // Define the control keys we want to track
    /** @type {string[]} Names of the action keys this gamepad tracks */
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
    /** @type {Object<string, boolean>} Current held state of every action key */
    this.held = {};
    /** @type {Object<string, boolean>} Single-frame pressed edge state of every action key */
    this.pressed = {};
    /** @type {Object<string, boolean>} Single-frame released edge state of every action key */
    this.released = {};
    /** @type {Object<string, boolean>} Held state from the previous frame */
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

    // Initialize keyboard mapping
    this.updateMapping(keyboardMap, gamepadMap);
    
    // Phaser signals
    /** @type {Object} Phaser signals dispatched when keys are pressed or released */
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
    /** @type {Map<number, string>} Active touch identifiers mapped to their button key */
    this.activeTouches = new Map();
    /** @type {number} Maximum number of simultaneous touches tracked */
    this.maxTouches = 4;

    // Input detection
    /** @type {string} The most recently detected input source ('none', 'keyboard', 'touch' or 'gamepad') */
    this.lastInputSource = 'none';
    /** @type {?number} Timeout ID that auto-hides touch controls after inactivity */
    this.inputDetectionTimeout = null;
    /** @type {boolean} Whether the touch controls are currently shown */
    this.touchControlsVisible = false;

    // Set up all input methods
    this.setupGamepad();
    this.setupTouch();
  }
  
  /**
   * Updates the keyboard and gamepad mappings and rebuilds the keyboard capture.
   * Existing held state is released and the previous keyboard wiring is torn down.
   * @param {Object} keyboardMap - Mapping of action names to keyboard key codes
   * @param {Object} gamepadMap - Mapping of action names to gamepad button codes
   */
  updateMapping(keyboardMap, gamepadMap) {
    /** @type {Object} Mapping of action names to keyboard key codes */
    this.keyboardMap = keyboardMap || DEFAULT_KEYBOARD_MAPPING;
    /** @type {Object} Mapping of action names to gamepad button codes */
    this.gamepadMap = gamepadMap || DEFAULT_GAMEPAD_MAPPING;
    
    // Reset gamepad for new mapping
    /** @type {boolean} Whether held state should be re-released on the next update */
    this.dontUpdateThisTime = true;
    this.setupKeyboard();
  }

  /**
   * Builds the reverse keycode lookup and captures the keys used by this player.
   * Registers global keyboard handlers that update held state for mapped actions.
   */
  setupKeyboard() {
    // Clear any existing keyboard state
    this.releaseAll();
    
    // Create reverse mapping for quick lookup
    /** @type {Object} Reverse lookup of key codes to action names */
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
    inputManager.keyboardListener.onDown.add((keyCode, event) => {
      const action = this.keyCodeToAction[keyCode];
      if (action) {
        event.preventDefault();
        this.held[action] = true;
        this.detectInputSource('keyboard');
      } else if (window.focusedElement) {
        event.preventDefault();
      }
    });
  
    inputManager.keyboardListener.onUp.add((keyCode) => {
      const action = this.keyCodeToAction[keyCode];
      if (action) {
        this.held[action] = false;
        event.preventDefault();
      } else if (window.focusedElement) {
        event.preventDefault();
      }
    });
    
    this.update();
  }

  /**
   * Registers gamepad connect, disconnect, press, and release handlers.
   * Only events for this player's pad index are applied to this gamepad.
   */
  setupGamepad() {
    /** @type {Object} Current state of the physical gamepad including connection status */
    this.gamepadState = {
      isConnected: false
    };
    
    this.keys.forEach(key => {
      this.gamepadState[key] = false;
    });
    
    inputManager.gamepadListener.onDown.add((keyCode, index) => {
      if (index !== this.playerIndex) return; // Ignore other gamepadState
      
      this.keys.forEach(key => {
        if (this.gamepadMap[key] == keyCode) {
          this.held[key] = true;
          this.gamepadState[key] = true;
          this.detectInputSource('gamepad');
        }
      });
    });
    
    inputManager.gamepadListener.onUp.add((keyCode, index) => {
      if (index !== this.playerIndex) return; // Ignore other gamepadState
      
      this.keys.forEach(key => {
        if (this.gamepadMap[key] == keyCode) {
          this.held[key] = false;
          this.gamepadState[key] = false;
        }
      });
    });
    
    inputManager.gamepadListener.onConnect.add((index) => {
      if (index !== this.playerIndex) return; // Ignore other gamepadState
      
      console.log(`Pad ${index + 1} connected`);
      
      this.gamepadState.isConnected = true;
    });
    
    inputManager.gamepadListener.onDisconnect.add((index) => {
      if (index !== this.playerIndex) return; // Ignore other gamepadState
      
      console.log(`Pad ${index + 1} disconnected`);
      
      this.gamepadState.isConnected = false;
    });
  }

  /**
   * Enables on-screen touch controls, but only for player 1.
   * Fetches the DOM controller elements and wires their touch events.
   */
  setupTouch() {
    if (this.playerIndex > 0) return; // Only Player 1 uses touch
    
    // Get controller elements
    /** @type {?HTMLElement} Touch controller parent element */
    this.controllerElement = document.getElementById('controller_parent');
    
    if (!this.controllerElement) {
      return;
    }

    // Get all button elements
    /** @type {Object<string, HTMLElement>} Directional pad button elements */
    this.dpadElements = {
      up: document.getElementById('controller_up'),
      down: document.getElementById('controller_down'),
      left: document.getElementById('controller_left'),
      right: document.getElementById('controller_right')
    };
    
    /** @type {Object<string, HTMLElement>} Action button elements */
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

  /**
   * Records the source of the latest input and schedules touch control auto-hide.
   * @param {string} source - The input source ('keyboard', 'touch', or 'gamepad')
   */
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

  /**
   * Shows or hides the touch controller based on device and input source.
   */
  updateTouchControlsVisibility() {
    if (!this.controllerElement) return;

    const shouldShow = this.game.device.touch && 
                     (this.lastInputSource === 'touch' || this.lastInputSource === 'none');

    if (shouldShow !== this.touchControlsVisible) {
      this.controllerElement.style.display = shouldShow ? 'block' : 'none';
      this.touchControlsVisible = shouldShow;
    }
  }

  /**
   * Attaches touch handlers to the controller DOM element.
   */
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

  /**
   * Tracks a new touch and presses the button beneath its starting point.
   * @param {TouchEvent} e - The touchstart event
   */
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

  /**
   * Re-evaluates which button a moving touch is over and switches held keys.
   * @param {TouchEvent} e - The touchmove event
   */
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

  /**
   * Releases the key a touch was holding and stops tracking the touch.
   * @param {TouchEvent} e - The touchend or touchcancel event
   */
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

  /**
   * Resolves the controller button key under a given touch point.
   * @param {Touch} touch - The touch being examined
   * @returns {?string} The matching action key, 'rhythm_*' key, or null
   */
  getButtonFromTouch(touch) {
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return null;

    const buttonElement = element.closest('[id^="controller_"]');
    if (!buttonElement) return null;

    const id = buttonElement.id;
    const key = id.replace('controller_', '');
    
    return this.keys.includes(key) || key.startsWith('rhythm_') ? key : null;
  }
  
  /**
   * Returns a display label for the gamepad button bound to an action.
   * @param {string} action - The action key to look up
   * @returns {?string} Button label (A, CROSS, DPAD_UP, etc.) or null if unknown
   */
  getButtonForAction(action) {
    const buttonCode = this.gamepadMap[action];
    if (buttonCode === undefined) return null;
    
    // Determinar el nombre del botón según el estilo
    const buttonStyle = Account.settings.buttonStyle || 'xbox';
    
    // Mapeo de códigos a nombres de botones
    const buttonNames = {
      // Xbox style
      xbox: {
        0: 'A',
        1: 'B', 
        2: 'X',
        3: 'Y',
        4: 'LB',
        5: 'RB',
        6: 'LT',
        7: 'RT',
        8: 'SELECT',
        9: 'START',
        12: 'DPAD_UP',
        13: 'DPAD_DOWN',
        14: 'DPAD_LEFT',
        15: 'DPAD_RIGHT'
      },
      // PlayStation style
      ps: {
        0: 'CROSS',
        1: 'CIRCLE',
        2: 'SQUARE',
        3: 'TRIANGLE',
        4: 'L1',
        5: 'R1',
        6: 'L2',
        7: 'R2',
        8: 'SELECT',
        9: 'START',
        12: 'DPAD_UP',
        13: 'DPAD_DOWN',
        14: 'DPAD_LEFT',
        15: 'DPAD_RIGHT'
      }
    };
    
    const names = buttonNames[buttonStyle];
    return names[buttonCode] || null;
  }

  /**
   * Refreshes pressed/released edge states and dispatches Phaser signals.
   * Call this once per frame from the game loop.
   */
  update() {
    if (this.dontUpdateThisTime) {
      delete this.dontUpdateThisTime;
      return;
    }
    
    // Calculate pressed and released states
    this.updateButtonStates();
    
    // Dispatch signals for any pressed/released keys
    let anyPressed = null;
    let anyReleased = null;
    
    this.keys.forEach(key => {
      if (this.pressed[key]) {
        this.signals.pressed[key].dispatch();
        anyPressed = key;
      }
      if (this.released[key]) {
        this.signals.released[key].dispatch();
        anyReleased = key;
      }
    });
    
    // Dispatch 'any' signals
    if (anyPressed) this.signals.pressed.any.dispatch(anyPressed);
    if (anyReleased) this.signals.released.any.dispatch(anyReleased);
    
    // Save current state for next frame
    this.keys.forEach(key => {
      this.prevState[key] = this.held[key];
    });
    this.prevState.any = this.held.any;
  }

  /**
   * Checks whether a key is currently being held by a touch input.
   * @param {string} key - The action key to check
   * @returns {boolean} True if the key is held by an active touch
   */
  isTouchControlled(key) {
    return Array.from(this.activeTouches.values()).includes(key);
  }

  /**
   * Computes pressed and released edge states from held and previous state.
   */
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
  
  /**
   * Clears held, pressed, and released state for every action key.
   */
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
  
  /**
   * Programmatically presses a key as a user input would.
   * @param {string} key - The action key to press
   */
  press(key) {
    this.dontUpdateThisTime = true;
    this.pressed[key] = true;
    this.pressed.any = true;
    this.held[key] = true;
    this.held.any = true;
  }
  
  /**
   * Checks whether any direction action is currently held.
   * @returns {boolean} True if up, down, left, or right is held
   */
  isDirectionPressed() {
    return this.held.up || this.held.down || this.held.left || this.held.right;
  }

  /**
   * Computes a normalized direction vector from the held direction keys.
   * @returns {{x: number, y: number}} Direction vector with diagonal normalization
   */
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
  
  /**
   * Vibrates the device or gamepad based on the last detected input source.
   * @param {number} [duration=100] - Vibration duration in milliseconds
   * @returns {boolean} True if a vibration was actually executed
   */
  vibrate(duration = 100) {
    // Do not vibrate if the last input source was keyboard
    if (this.lastInputSource === 'keyboard') {
      return false;
    }
  
    let vibrationExecuted = false;
  
    // Vibrate according to the last input source detected
    switch (this.lastInputSource) {
      case 'touch':
        // Only vibrate on cordova for touch screen
        if (CURRENT_ENVIRONMENT === ENVIRONMENT.CORDOVA && typeof navigator.vibrate === "function") {
          navigator.vibrate(duration);
          vibrationExecuted = true;
        }
        break;
  
      case 'gamepad':
        // Vibrate HTML5 gamepads if available and support vibration
        if (navigator.getGamepads && this.game.input.gamepad.supported) {
          const gamepads = navigator.getGamepads();
          
          for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (gamepad && 
                gamepad.connected && 
                gamepad.vibrationActuator && 
                typeof gamepad.vibrationActuator.playEffect === 'function') {
              
              try {
                gamepad.vibrationActuator.playEffect("dual-rumble", {
                  startDelay: 0,
                  duration: duration,
                  weakMagnitude: 0.8,
                  strongMagnitude: 0.8
                });
                vibrationExecuted = true;
                break; // Vibrate only the first pad found
              } catch (error) {
                console.warn(`Error al vibrar mando ${i}:`, error);
              }
            }
          }
        }
        break;
  
      case 'none':
      default:
        // For 'none' or unknown input source, try both methods
        if (CURRENT_ENVIRONMENT === ENVIRONMENT.CORDOVA && typeof navigator.vibrate === "function") {
          navigator.vibrate(duration);
          vibrationExecuted = true;
        } else if (navigator.getGamepads && this.game.input.gamepad.supported) {
          // Try to vibrate gamepads if any are connected
          const gamepads = navigator.getGamepads();
          
          for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (gamepad && 
                gamepad.connected && 
                gamepad.vibrationActuator && 
                typeof gamepad.vibrationActuator.playEffect === 'function') {
              
              try {
                gamepad.vibrationActuator.playEffect("dual-rumble", {
                  startDelay: 0,
                  duration: duration,
                  weakMagnitude: 0.8,
                  strongMagnitude: 0.8
                });
                vibrationExecuted = true;
                break; // Vibrate only the first pad found
              } catch (error) {
                console.warn(`Error al vibrar mando ${i}:`, error);
              }
            }
          }
        }
        break;
    }
  
    return vibrationExecuted;
  }

  /**
   * Releases all keys and clears active touches and button highlight states.
   */
  reset() {
    this.releaseAll();
    this.activeTouches.clear();

    // Remove pressed classes from all buttons
    Object.values(this.dpadElements).forEach(el => el?.classList.remove('btnPressed'));
    Object.values(this.buttonElements).forEach(el => el?.classList.remove('btnPressed'));
  }
  
  /**
   * Removes all listeners, signals, and DOM elements associated with this gamepad.
   */
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
