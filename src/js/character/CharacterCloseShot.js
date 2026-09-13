/**
 * @class CharacterCloseShot
 * @category Character System Classes
 * @summary Close-up character display for skill effects (36x7)
 * @constructor
 * @param {number} x - Horizontal position
 * @param {number} y - Vertical position
 * @param {Object} characterData - Character data model
 * @features
 * Uses close shot crop area from CHARACTER_SYSTEM constants
 * Displays cropped character view for skill activation feedback
 * @description
 * A specialized cropped character display configured with close-up crop dimensions.
 * Shown briefly when skills activate to provide visual feedback during gameplay.
 * @example
 * // Modding usage example
 * const closeShot = new CharacterCloseShot(200, 100, characterData);
 * game.world.addChild(closeShot);
 * closeShot.updateAppearance({ top: 'top_seifuku_red' });
 * closeShot.destroy();
 */
class CharacterCloseShot extends CharacterCroppedDisplay {
  constructor(x, y, characterData) {
    super(x, y, characterData, CHARACTER_SYSTEM.CLOSE_SHOT_CROP);
  }
}
