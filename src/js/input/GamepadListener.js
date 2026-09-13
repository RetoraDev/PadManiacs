/**
 * @class GamepadListener
 * @category Core Game Classes
 * @summary Browser gamepad API listener
 * @constructor
 * @param {Phaser.Game} game - Phaser game instance
 * @features
 * Starts Phaser's gamepad polling
 * Exposes connect, disconnect, down, and up Phaser signals
 * @description
 * GamepadListener wraps Phaser's raw gamepad callbacks and re-exposes them as
 * Phaser signals. Phaser fires a single callback for any connected pad, so this
 * listener forwards the pad index and button code through its signals.
 * @example
 * // Modding usage example
 * const listener = new GamepadListener(game);
 * listener.onDown.add((index, code) => {
 *   console.log(`Pad ${index} button ${code}`);
 * });
 * listener.onConnect.add((index) => {
 *   console.log(`Pad ${index} connected`);
 * });
 */
class GamepadListener {
  constructor(game) {
    /** @type {Phaser.Game} Phaser game instance being listened to */
    this.game = game;
    
    this.game.input.gamepad.start();
    
    /** @type {Phaser.Signal} Dispatched with the pad index when a pad connects */
    this.onConnect = new Phaser.Signal();
    /** @type {Phaser.Signal} Dispatched with the pad index when a pad disconnects */
    this.onDisconnect = new Phaser.Signal();
    /** @type {Phaser.Signal} Dispatched with pad index and button code on button press */
    this.onDown = new Phaser.Signal();
    /** @type {Phaser.Signal} Dispatched with pad index and button code on button release */
    this.onUp = new Phaser.Signal();
    
    this.game.input.gamepad.onConnectCallback = (index) => this.onConnect.dispatch(index);
    this.game.input.gamepad.onDisconnectCallback = (index) => this.onDisconnect.dispatch(index);
    this.game.input.gamepad.onDownCallback = (code, _, index) => this.onDown.dispatch(index, code);
    this.game.input.gamepad.onUpCallback = (code, _, index) => this.onUp.dispatch(index, code);
  }
}