/**
 * @class SecondPlayer
 * @category Core Game Classes
 * @summary Second player gameplay instance for multiplayer
 * @constructor
 * @param {Phaser.Scene} scene - The Phaser game scene
 * @param {Object} settings - Gameplay configuration overrides
 * @features
 * Uses gamepad2 for input
 * Right-side screen positioning
 * P2-specific HUD elements
 * @description
 * Concrete Player subclass configured for the second player in multiplayer mode.
 * Assigns gamepad2 for input, positions the chart on the right side of the screen,
 * and binds P2-specific HUD elements for judgement, combo, score, and health display.
 * @example
 * // Creating a second player for head-to-head gameplay
 * const p2 = new SecondPlayer(scene, { speedMod: "C-MOD" });
 * p2.update();
 * console.log(p2.score, p2.getScoreRating());
 */
class SecondPlayer extends Player {
  constructor(scene, settings = {}) {
    // Call parent with "right" side
    super(scene, "right", settings);
    
    this.gamepad = gamepad2; // Use Player 2
    
    this.HEALTH_X = 104;
    this.HEALTH_WIDTH = 71;
    this.ACCURACY_BAR_WIDTH = 92;
    
    scene.p2JudgementText.x = this.renderer.calculateCenter();
    
    this.hud = scene.p2Hud;
  }
}
