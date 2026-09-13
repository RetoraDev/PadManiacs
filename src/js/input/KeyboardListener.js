/**
 * @class KeyboardListener
 * @category Core Game Classes
 * @summary Keyboard input listener
 * @constructor
 * @param {Phaser.Game} game - Phaser game instance
 * @features
 * Bridges Phaser's global keyboard callbacks to Phaser signals
 * @description
 * KeyboardListener forwards the browser keyboard events captured by Phaser into
 * onDown and onUp Phaser signals that carry the key code and the original event.
 * @example
 * // Modding usage example
 * const listener = new KeyboardListener(game);
 * listener.onDown.add((keyCode, event) => {
 *   console.log(`Key down: ${keyCode}`);
 * });
 */
class KeyboardListener {
  constructor(game) {
    /** @type {Phaser.Game} Phaser game instance being listened to */
    this.game = game;
    
    /** @type {Phaser.Signal} Dispatched with key code and event when a key is pressed */
    this.onDown = new Phaser.Signal();
    /** @type {Phaser.Signal} Dispatched with key code and event when a key is released */
    this.onUp = new Phaser.Signal();
    
    // Global keyboard listeners
    this.game.input.keyboard.onDownCallback = (event) => {
      this.onDown.dispatch(event.keyCode, event);
    };
    
    this.game.input.keyboard.onUpCallback = (event) => {
      this.onUp.dispatch(event.keyCode, event);
    };
  }
}