/**
 * @class MouseCursor
 * @category UI Classes
 * @summary Custom mouse cursor
 * @constructor
 * @description
 * Replaces the native OS cursor with a game sprite and exposes button/wheel signals for the rest of the UI. It tracks press, hold and release edge states for left, right and middle buttons, dispatches move signals, and hides itself after two seconds of inactivity. It automatically (re)initializes when the active state is allowed and disables all native mouse interactions.
 * @example
 * // Modding usage example
 * const cursor = new MouseCursor();
 * cursor.onMove.add((x, y) => {
 *   console.log('cursor at', x, y);
 * });
 * cursor.show();
 */
class MouseCursor {
  constructor() {
    /** @type {Phaser.Sprite} Cursor sprite rendered over the scene */
    this.sprite = null;
    
    /** @type {Boolean} Whether the cursor sprite is visible */
    this.visible = true;
    
    /** @type {Phaser.Signal} Fired when a mouse button is pressed */
    this.onDown = new Phaser.Signal();
    /** @type {Phaser.Signal} Fired when the mouse moves */
    this.onMove = new Phaser.Signal();
    /** @type {Phaser.Signal} Fired when a mouse button is released */
    this.onUp = new Phaser.Signal();
    /** @type {Phaser.Signal} Fired when the mouse wheel scrolls */
    this.onWheel = new Phaser.Signal();
    
    /** @type {Array<String>} Identifier strings for each tracked mouse button */
    this.keys = [];
    
    this.reset();
    
    /** @type {Phaser.Pointer} The active mouse input pointer */
    this.pointer = game.input.mousePointer;
    
    /** @type {{x: Number, y: Number}} Position reported on the last move */
    this.lastPosition = { x: 0, y: 0 };
    /** @type {Number} Timestamp of the last input activity */
    this.lastUpdate = game.time.now;
    
    this.setupStateChangeHandling();
    
    /** @type {Set} State names where the custom cursor is disabled */
    this.restrictedStates = new Set(['Load', 'LoadLocalSongs', 'LoadExternalSongs', 'LoadSongFolder', 'Boot']);
    
    // Prevent all mouse interactions
    game.canvas.parentNode.addEventListener('click', (e) => e.preventDefault(), true);
    game.canvas.parentNode.addEventListener('mousedown', (e) => e.preventDefault(), true);
    game.canvas.parentNode.addEventListener('mouseup', (e) => e.preventDefault(), true);
    game.canvas.parentNode.addEventListener('contextmenu', (e) => e.preventDefault(), true);
  }
  /**
   * Recreates all signals and clears every input state container, resetting pressed, held, released and wheel flags.
   */
  reset() {
    this.onDown.dispose();
    this.onMove.dispose();
    this.onUp.dispose();
    this.onWheel.dispose();
    
    this.onDown = new Phaser.Signal();
    this.onMove = new Phaser.Signal();
    this.onUp = new Phaser.Signal();
    this.onWheel = new Phaser.Signal();
    
    this.prevState = {};
    this.pressed = {};
    this.held = {};
    this.released = {};
    this.wheel = {
      up: false,
      down: false
    };
  }
  /**
   * Registers a state-change listener so the cursor reinitializes on every new state.
   */
  setupStateChangeHandling() {
    game.state.onStateChange.add(this.onStateChange, this);
  }
  /**
   * Resets input state on state change and reinitializes the cursor when the new state is allowed.
   * @param {Object} newState - The newly entered game state
   */
  onStateChange(newState) {
    this.reset();
    
    game.time.events.add(100, () => {
      const currentState = game.state.getCurrentState();
      const stateName = currentState?.constructor?.name || '';
      
      if (this.isStateAllowed(stateName)) {
        this.initializeCursor();
      }
    });
  }
  /**
   * Whether a given state name is allowed to use the custom cursor.
   * @param {String} stateName - Name of the game state to check
   * @returns {Boolean} True unless the state is in the restricted set
   */
  isStateAllowed(stateName) {
    return !this.restrictedStates.has(stateName);
  }
  /**
   * Builds the cursor sprite and wires up pointer button and wheel input callbacks. Any existing cursor sprite is destroyed first.
   */
  initializeCursor() {
    if (this.sprite) {
      this.sprite.destroy();
    }
    
    this.sprite = game.add.sprite(0, 0, 'ui_mouse_cursor');
    this.sprite.alpha = 0;
    this.sprite.update = () => this.updateCursor();
    
    this.setupDeviceButton(this.pointer.leftButton, 'left');
    this.setupDeviceButton(this.pointer.rightButton, 'right');
    this.setupDeviceButton(this.pointer.middleButton, 'middle');
    
    game.input.mouseWheel.callback = (event) => {
      if (event && event.deltaY != 0) {
        if (event.deltaY < 0) {
          this.onWheel.dispatch("up");
          this.wheel.up = true;
        } else {
          this.onWheel.dispatch("down");
          this.wheel.down = true;
        }
        this.lastUpdate = game.time.now;
        this.sprite.alpha = 1;
      }
    };
    game.input.mouseWheel.callbackContext = this;
  }
  /**
   * Attaches press and release handlers for one mouse button, dispatching the corresponding signals and waking the cursor sprite.
   * @param {Phaser.MouseButton} button - The pointer button to listen to
   * @param {String} id - Identifier reported in the dispatched signals
   */
  setupDeviceButton(button, id) {
    this.keys.push(id);
    button.onDown.add(() => {
      this.onDown.dispatch(id, this.pointer.x, this.pointer.y);
      this.held[id] = true;
      this.lastUpdate = game.time.now;
      this.sprite.alpha = 1;
    });
    button.onUp.add(() => {
      this.onUp.dispatch(id, this.pointer.x, this.pointer.y);
      this.held[id] = false;
      this.lastUpdate = game.time.now;
      this.sprite.alpha = 1;
    });
  }
  /**
   * Per-frame routine for the cursor sprite: tracks the pointer, switches to the hand frame over clickable targets, dispatches move signals and fades the sprite out after inactivity.
   */
  updateCursor() {
    this.updateState();
    
    const targetObject = this.pointer.targetObject;
    
    this.sprite.frame = targetObject && targetObject.sprite && targetObject.sprite.useHandCursor ? 1 : 0;
    
    const { x, y } = this.pointer.position;
    
    this.sprite.visible = this.visible;
    
    this.sprite.bringToTop();
    
    if (this.sprite.alpha > 0 && game.time.now - this.lastUpdate >= 2000) {
      this.sprite.alpha = 0;
    }
    
    if (x == this.lastPosition.x && y == this.lastPosition.y) return;
        
    this.sprite.x = x;
    this.sprite.y = y;
    
    this.lastPosition.x = this.pointer.position.x;
    this.lastPosition.y = this.pointer.position.y;
    
    this.lastUpdate = game.time.now;
    this.sprite.alpha = 1;
    
    this.onMove.dispatch(x, y);
  }
  /**
   * Computes pressed, released and held edge states for every tracked button and exposes them on the aggregate 'any' flags.
   */
  updateState() {
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
    
    // Set last update time
    if (anyPressed || anyReleased) {
      this.lastUpdate = game.time.now;
      this.sprite.alpha = 1;
    }

    // Update 'any' states
    this.pressed.any = anyPressed;
    this.released.any = anyReleased;
    this.held.any = anyHeld;
    
    // Release wheel state
    this.wheel.up = false;
    this.wheel.down = false;
    
    // Save current state for next frame
    this.keys.forEach(key => {
      this.prevState[key] = this.held[key];
    });
    this.prevState.any = this.held.any;
  }
  /**
   * Hides the cursor sprite while keeping input tracking active.
   */
  hide() {
    this.visible = false;
  }
  /**
   * Shows the cursor sprite again.
   */
  show() {
    this.visible = true;
  }
  /**
   * Destroys the cursor sprite and disposes of all signals.
   */
  destroy() {
    this.sprite?.destroy?.();
    this.onDown.dispose();
    this.onMove.dispose();
    this.onUp.dispose();
    this.onWheel.dispose();
  }
}