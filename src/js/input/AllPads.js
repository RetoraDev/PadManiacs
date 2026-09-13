/**
 * @class AllPads
 * @category Core Game Classes
 * @summary Handles multiple gamepads and distributes input
 * @constructor
 * @param {Phaser.Game} game - Phaser game instance
 * @param {Gamepad[]} [gamepads] - Array of Gamepad instances to aggregate
 * @features
 * Polls every managed Gamepad and merges their input states
 * Tracks which player last provided input
 * Supports restricting aggregation to a single player
 * @description
 * AllPads behaves like a single virtual gamepad that mirrors the input of every
 * managed Gamepad instance. When any of its pads presses a key, the combined state
 * and signals reflect that press, so gameplay code can watch one object instead of
 * each player individually. Passing a singlePlayerId limits polling to one player.
 * @example
 * // Modding usage example
 * const pads = new AllPads(game, [gamepad1, gamepad2]);
 * pads.signals.pressed.a.add(() => {
 *   console.log('A pressed by any player');
 * });
 * // Restrict input to player 2 only
 * pads.singlePlayerId = 2;
 * // Read the merged state each frame
 * if (pads.held.start) startGame();
 */
class AllPads extends Gamepad {
  constructor(game, gamepads) {
    super(game, undefined, undefined, 0);
    
    /** @type {Gamepad[]} The Gamepad instances whose input is aggregated */
    this.gamepads = gamepads || [];
    /** @type {number} Player index of the last pad that pressed a key */
    this.lastPlayerId = 1;
    /** @type {number} Restrict polling to this player, or -1 for all pads */
    this.singlePlayerId = -1; // All pads enabled
  }
  /**
   * Polls every managed Gamepad and merges their states into this controller.
   * Call once per frame instead of the base Gamepad update.
   */
  update() {
    this.keys.forEach(key => {
      this.held[key] = false;
      this.pressed[key] = false;
      this.released[key] = false;
      this.prevState[key] = false;
    });
    
    let anyHeld = false;
    let anyPressed = false;
    let anyReleased = false;
    
    this.gamepads.forEach(pad => {
      if (this.singlePlayerId != -1) {
        if (pad.playerIndex + 1 !== this.singlePlayerId) {
          return;
        }
      }
      
      pad.update();
      
      this.keys.forEach(key => {
        const held = pad.held[key];
        const pressed = pad.pressed[key];
        const released = pad.released[key];
        const prevState = pad.prevState[key];

        if (held) {
          this.held[key] = true;
          anyHeld = key;
        }
        
        if (pressed) {
          this.pressed[key] = true;
          anyPressed = key;
          this.lastPlayerId = pad.playerIndex + 1;
          this.lastInputSource = pad.lastInputSource;
        }
        
        if (released) {
          this.released[key] = true;
          anyReleased = key;
        }
        
        if (prevState) {
          this.prevState[key] = true;
        }
      });
    });
    
    this.keys.forEach(key => {
      if (this.pressed[key]) {
        this.signals.pressed[key].dispatch(key);
      }
      if (this.released[key]) {
        this.signals.released[key].dispatch(key);
      }
    });
    
    // Dispatch 'any' signals
    if (anyPressed) this.signals.pressed.any.dispatch(anyPressed);
    if (anyReleased) this.signals.released.any.dispatch(anyReleased);
    
    // Update 'any' states
    this.pressed.any = anyPressed;
    this.released.any = anyReleased;
    this.held.any = anyHeld;
  }
  
  /** Disabled: remapping is handled by the underlying Gamepad instances. */
  updateMapping() {}
  /** Disabled: keyboard events are handled by the underlying Gamepad instances. */
  setupKeyboard() {}
  /** Disabled: gamepad events are handled by the underlying Gamepad instances. */
  setupGamepad() {}
  /** Disabled: touch controls belong to the individual Gamepad instances. */
  setupTouch() {}
  /** Disabled: input detection is handled by the individual pads. */
  setupInputDetection() {}
  /** Disabled: input detection is handled by the individual pads. */
  detectInputSource() {}
  /** Disabled: touch control visibility is managed by the individual pads. */
  updateTouchControlsVisibility() {}
  /** Disabled: touch events are wired by the individual pads. */
  setupControllerTouchEvents() {}
  /** Disabled: touch handling is done by the individual pads. */
  handleTouchStart() {}
  /** Disabled: touch handling is done by the individual pads. */
  handleTouchMove() {}
  /** Disabled: touch handling is done by the individual pads. */
  handleTouchEnd() {}
  /** Disabled: touch handling is done by the individual pads. */
  getButtonFromTouch() {}
  /**
   * Always returns false since AllPads itself does not handle touches.
   * @returns {boolean} Always false
   */
  isTouchControlled() { return false }
  /** Disabled: edge states are merged from the individual pads. */
  updateButtonStates() {}
  
  /**
   * Releases every key on every managed pad and on this controller.
   */
  releaseAll() {
    this.gamepads.forEach(pad => pad.releaseAll());
    super.releaseAll();
  }
  /**
   * Programmatically presses a key on the first managed gamepad.
   * @param {string} key - The action key to press
   */
  press(key) {
    this.gamepads[0]?.press(key);
  }
  /**
   * Checks whether any managed pad is holding a direction key.
   * @returns {boolean} True if any pad holds up, down, left, or right
   */
  isDirectionPressed() {
    for (const pad of this.gamepads) {
      if (pad.held.up || pad.held.down || pad.held.left || pad.held.right) {
        return true;
      }
    }
    
    return false;
  }
  /**
   * Returns the direction vector of the first managed gamepad.
   * @returns {?{x: number, y: number}} Direction vector, or undefined when no pads exist
   */
  getDirection() {
    return this.gamepads[0]?.getDirection();
  }
  /**
   * Triggers vibration on every managed gamepad.
   * @param {number} duration - Vibration duration in milliseconds
   */
  vibrate(duration) {
    this.gamepads.forEach(pad => pad.vibrate(duration));
  }
  /**
   * Resets the state of all managed gamepads.
   */
  reset() {
    this.gamepads.forEach(pad => pad.reset());
  }
  
  /** No-op: AllPads does not own listeners or DOM elements to clean up. */
  destroy() {}
}