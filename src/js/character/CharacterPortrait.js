/**
 * @class CharacterPortrait
 * @category Character System Classes
 * @summary Cropped character portrait display (15x15)
 * @constructor
 * @param {number} x - Horizontal position
 * @param {number} y - Vertical position
 * @param {Object} characterData - Character data model
 * @features
 * Uses portrait crop area from CHARACTER_SYSTEM constants
 * Inherits all layered rendering from CharacterCroppedDisplay
 * @description
 * A specialized cropped character display configured with the standard portrait crop dimensions.
 * Used for character selection screens and profile displays.
 * @example
 * // Modding usage example
 * const portrait = new CharacterPortrait(100, 50, characterData);
 * game.world.addChild(portrait);
 * portrait.updateAppearance({ top: 'top_seifuku_red' });
 * portrait.destroy();
 */
class CharacterPortrait extends CharacterCroppedDisplay {
  constructor(x, y, characterData) {
    super(x, y, characterData, CHARACTER_SYSTEM.PORTRAIT_CROP);
  }
}
