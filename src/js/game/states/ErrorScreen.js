/**
 * @class ErrorScreen
 * @category Game States
 * @summary Error display screen shown when game crashes
 * @constructor
 * @param {string} [message] - Crash message shown to the player.
 * @param {string} [recoverStateKey] - State to restart into when the player recovers.
 * @features
 * Displays crash message on a full-screen splash
 * Any key recovers to a configured state
 * Clicking opens the bug report page before recovering
 * @description
 * The ErrorScreen state is shown when the game crashes, displaying the crash
 * message on a full-screen splash. Pressing any key restarts the game into the
 * configured recovery state, while clicking the screen opens the bug report
 * page before recovering.
 * @example
 * // Modding usage example
 * game.state.start("ErrorScreen");
 *
 * // Provide a custom message and recovery state
 * game.state.start("ErrorScreen", true, false, "Audio device failed", "MainMenu");
 */
class ErrorScreen {
  /**
   * Stores the crash message and the state used to recover from the error.
   * @param {string} message - Crash message shown to the player.
   * @param {string} recoverStateKey - State to restart into on recovery.
   */
  init(message, recoverStateKey) {
    /** @type {string} Crash message displayed to the player. */
    this.message = message || "The causes of this failure are unknown yet";
    /** @type {string} State key to restart into on recovery. */
    this.recoverStateKey = recoverStateKey || "Title";
  }
  /**
   * Renders the error splash and wires the recovery input handlers.
   */
  create() {
    this.background = game.add.graphics(0, 0);
    this.background.beginFill(0x4428bc, 1);
    this.background.drawRect(0, 0, game.width, game.height);
    this.background.endFill();
    
    const text = new Text(120, 64, "");
    
    text.write(`AN ERROR HAS OCURRED!
    
${this.message}

Please Report The Developer Immediately!

• Press Any Key To Recover
• ${game.device.touch ? 'Tap' : 'Click'} the blue screen to report`);
    text.wrap(236);

    text.anchor.set(0.5);
    
    window.addEventListener("keydown", () => {
      game.state.start(this.recoverStateKey);
    }, { once: true });
    
    game.canvas.parentNode.addEventListener("click", () => {
      window.openExternalUrl(FEEDBACK_BUG_REPORT_URL);
      game.state.start(this.recoverStateKey);
    }, { once: true });
  }
}