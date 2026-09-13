let inputManager, gamepad, gamepad1, gamepad2;

/**
 * @class InputManager
 * @category Core Game Classes
 * @summary Configures input system state and initializes listeners
 * @constructor
 * @param {Phaser.Game} game - Phaser game instance
 * @features
 * Creates the gamepad and keyboard listeners
 * Wires up two per-player Gamepad controllers
 * Exposes global inputManager, gamepad1, gamepad2, and gamepad singletons
 * @description
 * InputManager bootstraps the whole input stack for the game. It instantiates the
 * shared GamepadListener and KeyboardListener, builds one Gamepad per player, and
 * wraps them in a single AllPads aggregator. The module-level globals it assigns are
 * the standard way other systems access input from anywhere in the codebase.
 * @example
 * // Modding usage example
 * // Access the global input manager and pads created in the constructor
 * const mgr = inputManager;
 * const pad = gamepad1;
 * const pads = gamepad;
 * mgr.gamepadListener.onDown.add((index, code) => {
 *   console.log('Button down on pad', index);
 * });
 */
class InputManager {
  constructor(game) {
    /** @type {Phaser.Game} Phaser game instance */
    this.game = game;
    
    /** @type {InputManager} Global input manager instance */
    inputManager = this;
    
    /** @type {GamepadListener} Listener exposing gamepad connect/disconnect/button signals */
    this.gamepadListener = new GamepadListener(game);
    /** @type {KeyboardListener} Listener exposing global keyboard down/up signals */
    this.keyboardListener = new KeyboardListener(game);
    
    window.gamepadListener = this.gamepadListener;
    window.keyboardListener = this.keyboardListener;
    
    // Create both input managers
    /** @type {Gamepad} First player's Gamepad controller */
    this.gamepad1 = new Gamepad(game, Account.mapping.keyboard.player1, Account.mapping.gamepad.player1, 0);
    /** @type {Gamepad} Second player's Gamepad controller */
    this.gamepad2 = new Gamepad(game, Account.mapping.keyboard.player2, Account.mapping.gamepad.player2, 1);

    /** @type {Gamepad} First gamepad instance */
    gamepad1 = this.gamepad1;
    /** @type {Gamepad} Second gamepad instance */
    gamepad2 = this.gamepad2;

    /** @type {AllPads} Unified input system instance */
    gamepad = new AllPads(game, [gamepad1, gamepad2]);
    
    /** @type {AllPads} Aggregated AllPads controller for both players */
    this.gamepad = gamepad;
  }
}