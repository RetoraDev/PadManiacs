/**
 * @class FirstPlayer
 * @category Core Game Classes
 * @summary First player gameplay instance using Player
 * @constructor
 * @param {Phaser.Scene} scene - The Phaser game scene
 * @param {Object} settings - Gameplay configuration overrides
 * @features
 * Uses gamepad1 for input
 * Left-side screen positioning
 * P1-specific HUD elements
 * @description
 * Concrete Player subclass configured for the first player in both single and multiplayer modes.
 * Assigns gamepad1 for input, positions the chart on the left side of the screen,
 * and binds P1-specific HUD elements for judgement, combo, score, and health display.
 * @example
 * // Creating a first player in a gameplay scene
 * const p1 = new FirstPlayer(scene, { speedMod: "X-MOD" });
 * p1.update();
 * console.log(p1.score, p1.getScoreRating());
 */
class FirstPlayer extends Player {
  constructor(scene, settings = {}) {
    // Call parent with "left" side
    super(scene, "left", settings);
    
    this.gamepad = gamepad1; // Use Player 1
    
    this.HEALTH_X = 14;
    this.HEALTH_WIDTH = 71;
    this.ACCURACY_BAR_WIDTH = 92;
    
    scene.p1JudgementText.x = this.renderer.calculateCenter();
    
    this.hud = scene.p1Hud;
  }
}