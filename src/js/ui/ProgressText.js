class ProgressText extends Text {
  constructor(text) {
    super(4, game.height - 4, text, FONTS.default);
    
    this.anchor.y = 1;
  }
}
