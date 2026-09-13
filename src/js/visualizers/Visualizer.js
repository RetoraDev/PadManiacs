/**
 * @class Visualizer
 * @category Core Game Classes
 * @summary Base class for gameplay visualizers
 * @constructor
 * @param {Object} scene - The Phaser game state scene
 * @param {number} x - Horizontal position
 * @param {number} y - Vertical position
 * @param {number} width - Display width in pixels
 * @param {number} height - Display height in pixels
 * @features
 * Provides graphics object for subclass rendering
 * Active state toggle for enabling and disabling updates
 * Clear and destroy lifecycle methods
 * @description
 * Abstract base class for gameplay visualizers such as accuracy graphs, audio analyzers,
 * and BPM displays. Provides shared positioning, graphics context, and lifecycle management.
 * @example
 * // Modding usage example
 * class MyVisualizer extends Visualizer {
 *   update() {
 *     this.clear();
 *     this.graphics.beginFill(0xFF0000);
 *     this.graphics.drawRect(0, 0, this.width, this.height);
 *     this.graphics.endFill();
 *   }
 * }
 * const viz = new MyVisualizer(scene, 0, 0, 200, 50);
 */
class Visualizer {
  constructor(scene, x, y, width, height) {
    /** @type {Object} The owning Phaser game state scene */
    this.scene = scene;
    /** @type {number} Horizontal position in pixels */
    this.x = x;
    /** @type {number} Vertical position in pixels */
    this.y = y;
    /** @type {number} Display width in pixels */
    this.width = width;
    /** @type {number} Display height in pixels */
    this.height = height;
    /** @type {Phaser.Graphics} Graphics object used for all drawing operations */
    this.graphics = scene.add.graphics(x, y);
    /** @type {boolean} Whether the visualizer is actively updating */
    this.active = true;
  }

  /**
   * Updates the visualizer each frame. Intended to be overridden by subclasses.
   */
  update() {
    // To be implemented by subclasses
  }

  /**
   * Destroys the underlying graphics object and frees resources.
   */
  destroy() {
    this.graphics.destroy();
  }

  /**
   * Clears all drawn content from the graphics object.
   */
  clear() {
    this.graphics.clear();
  }
}
