class OnScreenKeyboard extends Phaser.Sprite {
  constructor(x, y) {
    super(game, x || 60, y || 75, "ui_keyboard", 0);
    
    this.keys = [
      { top: 4, left: 4, width: 7, height: 7, code: "1", symbol: "1" }, 
      { top: 4, left: 14, width: 7, height: 7, code: "2", symbol: "2" },
      { top: 4, left: 24, width: 7, height: 7, code: "3", symbol: "3" },
      { top: 4, left: 34, width: 7, height: 7, code: "4", symbol: "4" },
      { top: 4, left: 44, width: 7, height: 7, code: "5", symbol: "5" },
      { top: 4, left: 54, width: 7, height: 7, code: "6", symbol: "6" },
      { top: 4, left: 64, width: 7, height: 7, code: "7", symbol: "7" },
      { top: 4, left: 74, width: 7, height: 7, code: "8", symbol: "8" },
      { top: 4, left: 84, width: 7, height: 7, code: "9", symbol: "9" },
      { top: 4, left: 94, width: 7, height: 7, code: "0", symbol: "0" },
      { top: 4, left: 104, width: 11, height: 7, code: "Backspace", action: "erase", shortcut: "b" },
      { top: 14, left: 4, width: 7, height: 7, code: "q", symbol: "%" },
      { top: 14, left: 14, width: 7, height: 7, code: "w", symbol: "\\" },
      { top: 14, left: 24, width: 7, height: 7, code: "e", symbol: "|" },
      { top: 14, left: 34, width: 7, height: 7, code: "r", symbol: "=" },
      { top: 14, left: 44, width: 7, height: 7, code: "t", symbol: "[" },
      { top: 14, left: 54, width: 7, height: 7, code: "y", symbol: "]" },
      { top: 14, left: 64, width: 7, height: 7, code: "u", symbol: "<" },
      { top: 14, left: 74, width: 7, height: 7, code: "i", symbol: ">" },
      { top: 14, left: 84, width: 7, height: 7, code: "o", symbol: "{" },
      { top: 14, left: 94, width: 7, height: 7, code: "p", symbol: "}" },
      { top: 14, left: 104, width: 11, height: 7, action: "symbol" },
      { top: 24, left: 4, width: 7, height: 7, code: "a", symbol: "@" },
      { top: 24, left: 14, width: 7, height: 7, code: "s", symbol: "#" },
      { top: 24, left: 24, width: 7, height: 7, code: "d", symbol: "$" },
      { top: 24, left: 34, width: 7, height: 7, code: "f", symbol: "^" },
      { top: 24, left: 44, width: 7, height: 7, code: "g", symbol: "&" },
      { top: 24, left: 54, width: 7, height: 7, code: "h", symbol: "-" },
      { top: 24, left: 64, width: 7, height: 7, code: "i", symbol: "+" },
      { top: 24, left: 74, width: 7, height: 7, code: "k", symbol: "(" },
      { top: 24, left: 84, width: 7, height: 7, code: "l", symbol: ")" },
      { top: 24, left: 94, width: 7, height: 7, char: ";", symbol: "/" },
      { top: 24, left: 104, width: 11, height: 7, code: "Enter", action: 'enter', char: "\n", symbol: "\n", shortcut: "a" },
      { top: 34, left: 4, width: 9, height: 7, code: "Shift", action: "shift" },
      { top: 34, left: 16, width: 7, height: 7, code: "z", symbol: "*" },
      { top: 34, left: 26, width: 7, height: 7, code: "x", symbol: "\"" },
      { top: 34, left: 36, width: 7, height: 7, code: "c", symbol: "'" },
      { top: 34, left: 46, width: 7, height: 7, code: "v", symbol: ":" },
      { top: 34, left: 56, width: 7, height: 7, code: "b", symbol: ";" },
      { top: 34, left: 66, width: 7, height: 7, code: "n", symbol: "!" },
      { top: 34, left: 76, width: 7, height: 7, code: "m", symbol: "?" },
      { top: 34, left: 86, width: 7, height: 7, char: "_", symbol: "∥" },
      { top: 34, left: 96, width: 7, height: 7, char: ".", symbol: "▶" },
      { top: 34, left: 106, width: 9, height: 7, code: "Shift", action: "shift", shortcut: "select" },
      { top: 44, left: 4, width: 7, height: 7, gamepad: true, code: 0 },
      { top: 44, left: 14, width: 7, height: 7, gamepad: true, code: 1, symbol: "•" },
      { top: 44, left: 24, width: 7, height: 7, gamepad: true, code: 2, symbol: "❤" },
      { top: 44, left: 34, width: 7, height: 7, gamepad: true, code: 3, symbol: "★" },
      { top: 44, left: 44, width: 31, height: 7, code: " ", char: " ", symbol: " " },
      { top: 44, left: 98, width: 7, height: 7, code: "ArrowLeft", action: "left", shortcut: "left" },
      { top: 44, left: 88, width: 7, height: 7, code: "ArrowDown", action: "down", shortcut: "down" },
      { top: 44, left: 78, width: 7, height: 7, code: "ArrowUp", action: "up", shortcut: "up" },
      { top: 44, left: 108, width: 7, height: 7, code: "ArrowRight", action: "right", shortcut: "right" }
    ];
    
    this.highlight = game.add.graphics(0, 0);
    this.addChild(this.highlight);
    
    this.visible = true;
    
    this.activeKey = null;
    this.keyboardKey = null;
    this.previousShiftState = false;
    this.previousActiveKey = null;
    
    this.keycode = null;
    
    this.symbol = false;
    this.shift = false;
    
    this.onDown = new Phaser.Signal();
    this.onUp = new Phaser.Signal();
    
    this.addListeners();
    
    game.add.existing(this);
  }
  
  addListeners() {
    inputManager.keyboardListener.onDown.add((_, event) => {
      // Press the corresponding key
      const key = this.keys.find(k => !k.gamepad && k.code == event.key);
      
      if (key) {
        this.keyboardKey = key;
      }
    });
    
    inputManager.keyboardListener.onUp.add(() => this.keyboardKey = null);
  }
  
  getKeyUnderPointer(pointer) {
    let { x, y } = pointer;
    
    x -= this.x;
    y -= this.y;
    
    for (const key of this.keys) {
      if (x >= key.left && y >= key.top && x <= key.left + key.width && y <= key.top + key.height) {
        return key;
      }
    }
    
    return null;
  }
  
  toggleSymbol() {
    this.symbol = !this.symbol;
    
    this.frame = this.symbol ? 1 : 0;
  }
  
  toggleShift() {
    this.shift = !this.shift;
  }
  
  onKeyDown(key) {
    if (key.gamepad) {
      if (this.symbol && !key.symbol) {
        return;
      }
    }
    
    this.keycode = key.code || null;
    
    const rawInput = this.symbol ? key.symbol || key.char || key.code || '' : key.char || key.code || key.symbol || '';
    const input = this.shift ? rawInput.toUpperCase() : rawInput.toLowerCase();
    
    this.onDown.dispatch(key, input);
    
    if (key.action) {
      switch(key.action) {
        case 'symbol':
          this.toggleSymbol();
          break;
        case 'shift':
          this.toggleShift();
          break;
        default:
          this.sendInput(key, input);
          break;
      }
    } else {
      this.sendInput(key, input);
    }
  }
  
  sendInput(key = {}, input = '') {
    if (window.focusedElement && typeof window.focusedElement.receiveInput == 'function') {
      window.focusedElement.receiveInput(key, input);
    }
  }
  
  onKeyUp(key) {
    this.keycode = null;
    this.onUp.dispatch(key);
  }
  
  update() {
    const pointer = game.input.activePointer;
    
    
    if (pointer.isDown) {
      this.activeKey = this.getKeyUnderPointer(pointer);
    } else if (this.activeKey) {
      this.activeKey = this.keyboardKey;
    }
    
    this.keys.forEach(key => {
      if (key.shortcut && gamepad.pressed[key.shortcut]) {
        this.activeKey = key;
      } 
    });
    
    if (this.activeKey != this.previousActiveKey) {
      this.highlight.clear();
      
      const symbolActions = ["symbol", "erase", "enter", "left", "right", "up", "down", "shift"];
    
      if (this.activeKey && !(this.symbol && !symbolActions.includes(this.activeKey.action) && !this.activeKey.symbol)) {
        this.highlight.beginFill(this.tint, 1);
        this.highlight.drawRect(this.activeKey.left, this.activeKey.top, this.activeKey.width, this.activeKey.height);
        this.highlight.endFill();
        this.onKeyDown(this.activeKey);
      } else {
        this.onKeyUp(this.previousActiveKey);
      }
    }
    
    if (this.shift) {
      const shiftKeys = this.keys.filter(key => key.action == 'shift');
      
      shiftKeys.forEach(key => {
        this.highlight.beginFill(this.tint, 0.8);
        this.highlight.drawRect(key.left, key.top, key.width, key.height);
        this.highlight.endFill();
      });
    }
    
    this.previousShiftState = this.shift;
    this.previousActiveKey = this.activeKey;
  }
}