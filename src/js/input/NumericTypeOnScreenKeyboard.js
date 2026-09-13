/**
 * @class NumericTypeOnScreenKeyboard
 * @category Core Game Classes
 * @summary Numeric touchscreen keyboard
 * @constructor
 * @param {number} x - Declared horizontal position (the base constructor places the sprite at 80, 70)
 * @param {number} y - Declared vertical position (the base constructor places the sprite at 80, 70)
 * @features
 * Replaces the full keyboard with a compact numeric keypad
 * Adds add, subtract, enter, clear, and erase action keys
 * @description
 * NumericTypeOnScreenKeyboard is an OnScreenKeyboard variant that loads the
 * 'ui_keyboard_numeric' texture and replaces the key layout with digits, a decimal
 * point, and arithmetic action keys. It inherits all highlight, signal, and input
 * routing behavior from its parent class.
 * @example
 * // Modding usage example
 * const numpad = new NumericTypeOnScreenKeyboard(80, 70);
 * numpad.onDown.add((key, input) => {
 *   console.log(`Numpad ${key.code} -> ${input}`);
 * });
 */
class NumericTypeOnScreenKeyboard extends OnScreenKeyboard {
  constructor(x, y) {
    super(80, 70);
    
    this.loadTexture('ui_keyboard_numeric');
    
    /** @type {Object[]} Numeric keypad definitions laid out on the numeric texture */
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