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
    
    this.min = config.min;
    this.max = config.max;
    this.decimals = config.decimals;
  }
  
  getNumericValue() {
    let value = parseFloat(this.text);
    if (isNaN(value)) value = this.min;
    return Math.min(this.max, Math.max(this.min, value));
  }
  
  validateCharInput(char) {
    if (char === '-') {
      return this.text.length === 0;
    }
    
    if (char === '.') {
      return this.decimals > 0 && !this.text.includes('.');
    }
    
    return super.validateCharInput(char);
  }
  
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
  
  increment() {
    let step = Math.pow(10, -this.decimals);
    let newValue = this.getNumericValue() + step;
    newValue = Math.min(this.max, newValue);
    this.setValue(newValue);
  }
  
  decrement() {
    let step = Math.pow(10, -this.decimals);
    let newValue = this.getNumericValue() - step;
    newValue = Math.max(this.min, newValue);
    this.setValue(newValue);
  }
  
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
  
  confirm() {
    const numericValue = this.getNumericValue();
    this.onConfirm.dispatch(numericValue);
    this.destroy();
  }
  
  cancel() {
    const numericValue = this.getNumericValue();
    this.onCancel.dispatch(numericValue);
    this.destroy();
  }
}