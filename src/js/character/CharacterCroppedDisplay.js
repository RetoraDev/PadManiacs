/**
 * @class CharacterCroppedDisplay
 * @category Character System Classes
 * @summary Character display with cropping support
 * @constructor
 * @param {number} x - Horizontal position
 * @param {number} y - Vertical position
 * @param {Object} characterData - Character data model
 * @param {Object} cropArea - Crop rectangle with x, y, w, and h
 * @features
 * Applies a crop rectangle to all rendering layers
 * Adjusts the aura emission area to match the crop region
 * Re-crops layers after appearance updates
 * @description
 * A character display subclass that crops every rendering layer to a configured rectangle,
 * making it suitable for portraits and close-up views where only a region of the character
 * should be visible.
 * @example
 * // Modding usage example
 * const crop = { x: 10, y: 5, w: 40, h: 60 };
 * const display = new CharacterCroppedDisplay(0, 0, characterData, crop);
 * game.world.addChild(display);
 * display.updateAppearance({ frontHair: 2 });
 * display.destroy();
 */
class CharacterCroppedDisplay extends CharacterDisplay {
  constructor(x, y, characterData, cropArea) {
    super(0, 0, characterData);
    /** @type {Object} Crop rectangle applied to all layers */
    this.cropArea = cropArea;
    /** @type {Object} Aura emission area matching the crop region */
    this.auraRect = {
      x: cropArea.x,
      y: cropArea.y,
      w: cropArea.w,
      h: cropArea.h
    };
    this.cropSprite();
    this.x = x;
    this.y = y;
  }

  /**
   * Applies the configured crop rectangle to every sprite layer and aura region.
   */
  cropSprite() {
    // Crop all layers in the layers object
    for (const [key, layer] of Object.entries(this.layers)) {
      if (!layer) continue;
      
      if (Array.isArray(layer)) {
        // Handle array of sprites (layered items)
        for (const sprite of layer) {
          if (sprite && sprite.crop) {
            sprite.crop(new Phaser.Rectangle(
              this.cropArea.x,
              this.cropArea.y,
              this.cropArea.w,
              this.cropArea.h
            ));
          }
        }
      } else if (layer.crop) {
        // Handle single sprite
        layer.crop(new Phaser.Rectangle(
          this.cropArea.x,
          this.cropArea.y,
          this.cropArea.w,
          this.cropArea.h
        ));
      }
    }
  
    // Update aura rect for cropped display
    this.auraRect = {
      x: this.cropArea.x,
      y: this.cropArea.y,
      w: this.cropArea.w,
      h: this.cropArea.h
    };
  }

  /**
   * Rebuilds layers for new appearance data and re-applies the crop afterwards.
   * @param {Object} newAppearance - Partial appearance overrides to apply
   */
  updateAppearance(newAppearance) {
    super.updateAppearance(newAppearance);
    this.cropSprite();
  }
}