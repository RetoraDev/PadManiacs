class MouseCursor {
  constructor() {
    this.sprite = null;
    
    this.visible = true;
    
    this.onDown = new Phaser.Signal();
    this.onMove = new Phaser.Signal();
    this.onUp = new Phaser.Signal();
    this.onWheel = new Phaser.Signal();
    
    this.keys = [];
    
    this.reset();
    
    this.pointer = game.input.mousePointer;
    
    this.lastPosition = { x: 0, y: 0 };
    this.lastUpdate = game.time.now;
    
    this.setupStateChangeHandling();
    
    this.restrictedStates = new Set(['Load', 'LoadLocalSongs', 'LoadExternalSongs', 'LoadSongFolder', 'Boot']);
    
    // Prevent all mouse interactions
    game.canvas.parentNode.addEventListener('click', (e) => e.preventDefault(), true);
    game.canvas.parentNode.addEventListener('mousedown', (e) => e.preventDefault(), true);
    game.canvas.parentNode.addEventListener('mouseup', (e) => e.preventDefault(), true);
    game.canvas.parentNode.addEventListener('contextmenu', (e) => e.preventDefault(), true);
  }
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
  setupStateChangeHandling() {
    game.state.onStateChange.add(this.onStateChange, this);
  }
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
  isStateAllowed(stateName) {
    return !this.restrictedStates.has(stateName);
  }
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
  hide() {
    this.visible = false;
  }
  show() {
    this.visible = true;
  }
  destroy() {
    this.sprite?.destroy?.();
    this.onDown.dispose();
    this.onMove.dispose();
    this.onUp.dispose();
    this.onWheel.dispose();
  }
}