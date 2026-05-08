let inputManager, gamepad, gamepad1, gamepad2;

class InputManager {
  constructor(game) {
    this.game = game;
    
    inputManager = this;
    
    this.gamepadListener = new GamepadListener(game);
    this.keyboardListener = new KeyboardListener(game);
    
    window.gamepadListener = this.gamepadListener;
    window.keyboardListener = this.keyboardListener;
    
    // Create both input managers
    this.gamepad1 = new Gamepad(game, Account.mapping.keyboard.player1, Account.mapping.gamepad.player1, 0);
    this.gamepad2 = new Gamepad(game, Account.mapping.keyboard.player2, Account.mapping.gamepad.player2, 1);

    gamepad1 = this.gamepad1;
    gamepad2 = this.gamepad2;

    gamepad = new AllPads(game, [gamepad1, gamepad2]);
  }
}