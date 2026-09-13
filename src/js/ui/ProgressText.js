/**
 * @class ProgressText
 * @category UI Classes
 * @summary Progress text for loading screens
 * @constructor
 * @param {string} text - The text to display
 * @features
 * Anchors to the bottom-left of the screen
 * Reuses Text rendering, typewriter, and wrapping effects
 * @description
 * ProgressText is a Text subclass that displays loading progress messages at
 * the bottom-left corner of the screen. It anchors its bottom edge so the
 * text stays on-screen regardless of message length, inheriting all of the
 * typewriter and wrapping behavior of Text.
 * @example
 * // Modding usage example
 * const progress = new ProgressText('Loading assets...');
 * progress.write('Loading 50%...');
 */
class ProgressText extends Text {
  constructor(text) {
    super(4, game.height - 2, text, FONTS.default);
    
    /** @type {PIXI.Point} Anchor pinned to the bottom so the text stays on-screen */
    this.anchor.y = 1;
  }
}
