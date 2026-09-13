/**
 * @class NumberInput
 * @category UI Classes
 * @summary Numeric value input dialog
 * @constructor
 * @param {object} [config={}] - Config with min, max, decimals, and initial text
 * @features
 * Clamped numeric range with min and max enforcement
 * Decimal place support with fixed formatting
 * Increment and decrement on gamepad up/down
 * Dispatches the numeric value on confirm or cancel
 * @description
 * NumberInput extends TextInput to edit numeric values instead of free text.
 * The input is clamped to a min/max range, honors a decimal-place count, and
 * restricts the permitted characters accordingly. Gamepad up/down increments
 * or decrements the value, and confirm or cancel dispatch the numeric result.
 * @example
 * // Modding usage example
 * const input = new NumberInput({
 *   text: '7',
 *   min: 0, max: 10, decimals: 0,
 *   onConfirm: (value) => setSpeed(value)
 * });
 */
class NumberInput extends TextInput {
  constructor(config = {}) {
    config = {
      text: "0",
      min: 0,
      max: Infinity,
      decimals: 0,
      x: 120,
      y: 35,
      width: 10,
      height: 2,
      onConfirm: null,
      onCancel: null,
      ...config
    };
    
    const initialValue = typeof config.text === 'number' ? config.text : parseFloat(config.text) || 0;
    const clampedValue = Math.min(config.max, Math.max(config.min, initialValue));
    const displayText = config.decimals > 0 ? clampedValue.toFixed(config.decimals) : clampedValue.toString();
    
    super({
      text: displayText,
      x: config.x,
      y: config.y,
      width: config.width,
      height: config.height,
      useNewLine: false,
      maxLength: 12,
      charset: config.decimals > 0 ? "1234567890.-" : "1234567890-",
      limitedCharacters: config.decimals > 0 ? { ".": 1, "-": 1 } : { "-": 1 },
      onConfirm: config.onConfirm,
      onCancel: config.onCancel
    });
    
    /** @type {number} Minimum allowed value */
    this.min = config.min;
    /** @type {number} Maximum allowed value */
    this.max = config.max;
    /** @type {number} Number of decimal places to display */
    this.decimals = config.decimals;
  }
  
  /**
   * Parses the current text into a number clamped to the configured range.
   * @returns {number} The clamped numeric value
   */
  getNumericValue() {
    let value = parseFloat(this.text);
    if (isNaN(value)) value = this.min;
    return Math.min(this.max, Math.max(this.min, value));
  }
  
  /**
   * Validates characters for numeric input, guarding minus and decimal signs.
   * @param {string} char - The single character to validate
   * @returns {boolean} True when the character may be inserted
   */
  validateCharInput(char) {
    if (char === '-') {
      return this.text.length === 0;
    }
    
    if (char === '.') {
      return this.decimals > 0 && !this.text.includes('.');
    }
    
    return super.validateCharInput(char);
  }
  
  /**
   * Handles input, mapping up/down to increment/decrement actions.
   * @param {object} key - Key event with an optional action string
   * @param {string} input - The character to insert (ignored for actions)
   */
  receiveInput(key, input) {
    const oldValue = this.getNumericValue();
    
    if (key.action) {
      switch (key.action) {
        case 'up':
        case 'add':
          this.increment();
          break;
        case 'down':
        case 'subtract':
          this.decrement();
          break;
        case 'left':
          this.moveCursor('left');
          break;
        case 'right':
          this.moveCursor('right');
          break;
        case 'enter':
          this.confirm();
          break;
        case 'erase':
          this.erase();
          break;
      }
      return;
    }
    
    super.receiveInput(key, input);
    
    const newValue = this.getNumericValue();
    if (newValue !== oldValue) {
      this.clampAndUpdateDisplay();
    }
  }
  
  /**
   * Increases the value by one step of the configured decimal precision.
   */
  increment() {
    let step = Math.pow(10, -this.decimals);
    let newValue = this.getNumericValue() + step;
    newValue = Math.min(this.max, newValue);
    this.setValue(newValue);
  }
  
  /**
   * Decreases the value by one step of the configured decimal precision.
   */
  decrement() {
    let step = Math.pow(10, -this.decimals);
    let newValue = this.getNumericValue() - step;
    newValue = Math.max(this.min, newValue);
    this.setValue(newValue);
  }
  
  /**
   * Sets and displays a value, clamped to the configured range.
   * @param {number} value - The value to set
   */
  setValue(value) {
    value = Math.min(this.max, Math.max(this.min, value));
    let displayValue;
    if (this.decimals > 0) {
      displayValue = value.toFixed(this.decimals);
    } else {
      displayValue = Math.floor(value).toString();
    }
    this.text = displayValue;
    this.currentIndex = this.text.length;
    this.updateCursor();
  }
  
  /**
   * Reclamps the current text's value and refreshes its formatted display.
   */
  clampAndUpdateDisplay() {
    let value = this.getNumericValue();
    let newDisplay;
    
    if (this.decimals > 0) {
      newDisplay = value.toFixed(this.decimals);
    } else {
      newDisplay = Math.floor(value).toString();
    }
    
    if (this.text !== newDisplay) {
      this.text = newDisplay;
      this.currentIndex = Math.min(this.currentIndex, this.text.length);
      this.updateCursor();
    }
  }
  
  /**
   * Dispatches the clamped numeric value on onConfirm and destroys the input.
   */
  confirm() {
    const numericValue = this.getNumericValue();
    this.onConfirm.dispatch(numericValue);
    this.destroy();
  }
  
  /**
   * Dispatches the clamped numeric value on onCancel and destroys the input.
   */
  cancel() {
    const numericValue = this.getNumericValue();
    this.onCancel.dispatch(numericValue);
    this.destroy();
  }
}