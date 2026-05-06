class KeyboardListener {
  constructor(game) {
    this.game = game;
    
    this.onDown = new Phaser.Signal();
    this.onUp = new Phaser.Signal();
    
    // Global keyboard listeners
    this.game.input.keyboard.onDownCallback = (event) => this.onDown.dispatch(event.keyCode, event);
    this.game.input.keyboard.onUpCallback = (event) => this.onUp.dispatch(event.keyCode, event);
  }
}