class GamepadListener {
  constructor(game) {
    this.game = game;
    
    this.game.input.gamepad.start();
    
    this.onConnect = new Phaser.Signal();
    this.onDisconnect = new Phaser.Signal();
    this.onDown = new Phaser.Signal();
    this.onUp = new Phaser.Signal();
    
    this.game.input.gamepad.onConnectCallback = (index) => this.onConnect.dispatch(index);
    this.game.input.gamepad.onDisconnectCallback = (index) => this.onDisconnect.dispatch(index);
    this.game.input.gamepad.onDownCallback = (code, _, index) => this.onDown.dispatch(index, code);
    this.game.input.gamepad.onUpCallback = (code, _, index) => this.onUp.dispatch(index, code);
  }
}