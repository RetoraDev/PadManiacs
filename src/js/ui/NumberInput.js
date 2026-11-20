/**
 * @class NumberInput
 * @category UI Classes
 * @summary Numeric value input dialog
 * @constructor
 * @param {object} [config={}] - Config with min, max, decimals, and initial text
 * @features
 * Clamped numeric range with min and max enforcement
 * Decimal place support with fixed formatting
 * Cursor can be moved left/right across digits (skipping sign and separator)
 * Up/down adjusts the digit under cursor by its place value, respecting step
 * Dispatches the numeric value on confirm or cancel
 * @description
 * NumberInput extends TextInput to edit numeric values instead of free text.
 * The input is clamped to a min/max range, honors a decimal-place count, and
 * restricts the permitted characters accordingly. Cursor movement is limited to
 * digits, and up/down changes the selected digit's place value while respecting
 * the configured step granularity.
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
      step: null,
      x: 120,
      y: 35,
      width: 10,
      height: 2,
      onConfirm: null,
      onCancel: null,
      ...config
    };

    const initialValue = typeof config.text === 'number' ? config.text : parseFloat(config.text) || 0;
    const baseStep = (typeof config.step === 'number' && config.step > 0) ? config.step : Math.pow(10, -config.decimals);
    const clampedValue = Math.min(config.max, Math.max(config.min, initialValue));
    const displayText = config.decimals > 0 ? clampedValue.toFixed(config.decimals) : Math.round(clampedValue).toString();

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
    /** @type {number} Minimum granularity for value changes */
    this.step = baseStep;
    this.stepPrecision = this._countDecimals(baseStep, config.decimals);

    this.currentIndex = this.getLastDigitIndex();
    this.updateCursor();
  }

  _countDecimals(step, decimals) {
    let d = decimals || 0;
    const s = String(step);
    if (s.indexOf('e-') !== -1) {
      const parts = s.split('e-');
      d = Math.max(d, parseInt(parts[1], 10) || 0);
    } else if (s.indexOf('.') !== -1) {
      d = Math.max(d, s.split('.')[1].length);
    }
    return d;
  }

  formatValue(value) {
    if (this.decimals > 0) return value.toFixed(this.decimals);
    return Math.round(value).toString();
  }

  snapToStep(value) {
    if (!isFinite(value)) return this.min;
    const step = this.step || 1;
    let snapped = Math.round(value / step) * step;
    const prec = Math.max(this.decimals || 0, this.stepPrecision || 0, 0);
    snapped = parseFloat(snapped.toFixed(prec + 4));
    if (Object.is(snapped, -0)) snapped = 0;
    return snapped;
  }

  /**
   * Parses the current text into a number clamped to the configured range.
   * @returns {number} The clamped numeric value
   */
  getNumericValue() {
    let value = parseFloat(this.text);
    if (isNaN(value)) value = this.min;
    value = this.snapToStep(value);
    return Math.min(this.max, Math.max(this.min, value));
  }

  getFirstDigitIndex() {
    for (let i = 0; i < this.text.length; i++) {
      if (/[0-9]/.test(this.text[i])) return i;
    }
    return 0;
  }

  getLastDigitIndex() {
    for (let i = this.text.length - 1; i >= 0; i--) {
      if (/[0-9]/.test(this.text[i])) return i;
    }
    return 0;
  }

  clampCursorToDigit() {
    if (this.text.length === 0) { this.currentIndex = 0; return; }
    if (this.currentIndex >= 0 && this.currentIndex < this.text.length && /[0-9]/.test(this.text[this.currentIndex])) return;
    let left = Math.min(this.currentIndex, this.text.length - 1);
    let right = Math.max(this.currentIndex, 0);
    while (left >= 0 || right < this.text.length) {
      if (left >= 0 && /[0-9]/.test(this.text[left])) { this.currentIndex = left; return; }
      if (right < this.text.length && /[0-9]/.test(this.text[right])) { this.currentIndex = right; return; }
      left--; right++;
    }
    this.currentIndex = this.getLastDigitIndex();
  }

  getExponentAt(index, text) {
    const t = text || this.text;
    if (index == null || index < 0 || index >= t.length || !/[0-9]/.test(t[index])) return null;
    const dot = t.indexOf('.');
    if (dot === -1) {
      return (t.length - 1) - index;
    }
    if (index < dot) return (dot - 1) - index;
    if (index > dot) return -(index - dot);
    return null;
  }

  getIndexForExponent(exp, text) {
    const t = text || this.text;
    if (exp == null) return null;
    const dot = t.indexOf('.');
    let idx;
    if (dot === -1) {
      idx = (t.length - 1) - exp;
    } else {
      if (exp >= 0) idx = (dot - 1) - exp;
      else idx = dot + (-exp);
    }
    if (idx >= 0 && idx < t.length && /[0-9]/.test(t[idx])) return idx;
    return null;
  }

  getNearestIndexForExponent(exp, text) {
    const t = text || this.text;
    let best = null;
    let bestDiff = Infinity;
    for (let i = 0; i < t.length; i++) {
      if (!/[0-9]/.test(t[i])) continue;
      const e = this.getExponentAt(i, t);
      if (e == null) continue;
      const d = Math.abs(e - exp);
      if (d < bestDiff) { bestDiff = d; best = i; }
    }
    return best != null ? best : this.getLastDigitIndex();
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
   * Moves cursor left/right across digits, skipping sign and separator.
   * @param {string} dir - 'left' or 'right'
   */
  moveCursor(dir) {
    if (dir === 'left' || dir === 'right') {
      const delta = dir === 'left' ? -1 : 1;
      let i = this.currentIndex + delta;
      while (i >= 0 && i < this.text.length) {
        if (/[0-9]/.test(this.text[i])) {
          this.currentIndex = i;
          this.updateCursor();
          return;
        }
        i += delta;
      }
      return;
    }
    super.moveCursor(dir);
    this.clampCursorToDigit();
    this.updateCursor();
  }

  adjustAtCursor(direction) {
    this.clampCursorToDigit();
    const idx = this.currentIndex;
    if (idx < 0 || idx >= this.text.length || !/[0-9]/.test(this.text[idx])) return;
    const exp = this.getExponentAt(idx, this.text);
    if (exp == null) return;
    let delta = Math.pow(10, exp);
    if (!isFinite(delta) || delta <= 0) delta = this.step;
    if (delta < this.step) delta = this.step;
    delta = this.snapToStep(delta);
    if (delta <= 0) delta = this.step;
    const val = this.getNumericValue();
    let next = val + direction * delta;
    next = this.snapToStep(next);
    next = Math.min(this.max, Math.max(this.min, next));
    this.setValue(next, idx);
  }

  /**
   * Handles input: left/right move cursor, up/down adjust by digit place value.
   * @param {object} key - Key event with an optional action string
   * @param {string} input - The character to insert (ignored for actions)
   */
  receiveInput(key, input) {
    if (key.action) {
      switch (key.action) {
        case 'up':
        case 'add':
          this.adjustAtCursor(1);
          return;
        case 'down':
        case 'subtract':
          this.adjustAtCursor(-1);
          return;
        case 'left':
          this.moveCursor('left');
          return;
        case 'right':
          this.moveCursor('right');
          return;
        case 'enter':
          this.confirm();
          return;
        case 'erase':
          this.erase();
          this.clampAndUpdateDisplay(true);
          return;
        case 'clear':
          this.clear();
          return;
      }
      return;
    }

    this.insertCharacter(input);
    this.clampAndUpdateDisplay(true);
  }

  /**
   * Increases the value at the cursor's place value.
   */
  increment() {
    this.adjustAtCursor(1);
  }

  /**
   * Decreases the value at the cursor's place value.
   */
  decrement() {
    this.adjustAtCursor(-1);
  }

  /**
   * Sets and displays a value, clamped to range and snapped to step.
   * @param {number} value - The value to set
   * @param {?number} anchorIndex - Digit index whose place value to preserve
   */
  setValue(value, anchorIndex = null) {
    value = this.snapToStep(Math.min(this.max, Math.max(this.min, value)));
    let exp = null;
    if (anchorIndex != null) exp = this.getExponentAt(anchorIndex, this.text);
    const oldIndex = this.currentIndex;
    this.text = this.formatValue(value);
    if (exp != null) {
      let ni = this.getIndexForExponent(exp, this.text);
      if (ni == null) ni = this.getNearestIndexForExponent(exp, this.text);
      this.currentIndex = ni != null ? ni : this.getLastDigitIndex();
    } else if (anchorIndex == null) {
      this.currentIndex = this.getLastDigitIndex();
    } else {
      this.currentIndex = Math.min(oldIndex, this.text.length - 1);
    }
    this.clampCursorToDigit();
    this.updateCursor();
  }

  /**
   * Reclamps the current text's value and refreshes its formatted display.
   */
  clampAndUpdateDisplay(preserveCursor = false) {
    const exp = preserveCursor ? this.getExponentAt(this.currentIndex, this.text) : null;
    const oldIndex = this.currentIndex;
    let value = this.getNumericValue();
    value = this.snapToStep(Math.min(this.max, Math.max(this.min, value)));
    const newDisplay = this.formatValue(value);
    if (this.text !== newDisplay) {
      this.text = newDisplay;
      if (exp != null) {
        let ni = this.getIndexForExponent(exp, this.text);
        if (ni == null) ni = this.getNearestIndexForExponent(exp, this.text);
        this.currentIndex = ni != null ? ni : this.getLastDigitIndex();
      } else if (preserveCursor) {
        this.currentIndex = Math.min(oldIndex, this.text.length - 1);
      } else {
        this.currentIndex = this.getLastDigitIndex();
      }
    } else if (preserveCursor) {
      this.currentIndex = oldIndex;
    } else {
      this.currentIndex = this.getLastDigitIndex();
    }
    this.clampCursorToDigit();
    this.updateCursor();
  }

  clear() {
    this.setValue(this.min, null);
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