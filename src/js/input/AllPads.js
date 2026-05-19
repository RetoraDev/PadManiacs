class AllPads extends Gamepad {
  constructor(game, gamepads) {
    super(game, undefined, undefined, 0);
    
    this.gamepads = gamepads || [];
    this.lastPlayerId = 1;
  }
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
  
  updateMapping() {}
  setupKeyboard() {}
  setupGamepad() {}
  setupTouch() {}
  setupInputDetection() {}
  detectInputSource() {}
  updateTouchControlsVisibility() {}
  setupControllerTouchEvents() {}
  handleTouchStart() {}
  handleTouchMove() {}
  handleTouchEnd() {}
  getButtonFromTouch() {}
  isTouchControlled() { return false }
  updateButtonStates() {}
  
  releaseAll() {
    this.gamepads.forEach(pad => pad.releaseAll());
  }
  press(key) {
    this.gamepads[0]?.press(key);
  }
  isDirectionPressed() {
    for (const pad of this.gamepads) {
      if (pad.held.up || pad.held.down || pad.held.left || pad.held.right) {
        return true;
      }
    }
    
    return false;
  }
  getDirection() {
    return this.gamepads[0]?.getDirection();
  }
  vibrate(duration) {
    this.gamepads.forEach(pad => pad.vibrate(duration));
  }
  reset() {
    this.gamepads.forEach(pad => pad.reset());
  }
  
  destroy() {}
}