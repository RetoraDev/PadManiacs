class NumericTypeOnScreenKeyboard extends OnScreenKeyboard {
  constructor(x, y) {
    super(80, 70);
    
    this.loadTexture('ui_keyboard_numeric');
    
    this.keys = [
      { top: 4, left: 4, width: 7, height: 7, code: "7" }, 
      { top: 4, left: 14, width: 7, height: 7, code: "8" }, 
      { top: 4, left: 24, width: 7, height: 7, code: "9" }, 
      { top: 4, left: 34, width: 7, height: 7, code: "Backspace", action: "erase", shortcut: "b" }, 
      { top: 14, left: 4, width: 7, height: 7, code: "4" }, 
      { top: 14, left: 14, width: 7, height: 7, code: "5" }, 
      { top: 14, left: 24, width: 7, height: 7, code: "6" }, 
      { top: 14, left: 34, width: 7, height: 7, code: "+", action: "add", shortcut: "up" }, 
      { top: 24, left: 4, width: 7, height: 7, code: "1" }, 
      { top: 24, left: 14, width: 7, height: 7, code: "2" }, 
      { top: 24, left: 24, width: 7, height: 7, code: "3" }, 
      { top: 24, left: 34, width: 7, height: 7, code: "-", action: "subtract", shortcut: "down" }, 
      { top: 34, left: 4, width: 7, height: 7, code: "c", action: "clear" }, 
      { top: 34, left: 14, width: 7, height: 7, code: "0" }, 
      { top: 34, left: 24, width: 7, height: 7, code: "." }, 
      { top: 34, left: 34, width: 7, height: 7, code: "Enter", action: 'enter', shortcut: "a"  }, 
    ];
  }
}