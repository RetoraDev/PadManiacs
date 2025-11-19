class CharacterCroppedDisplay extends CharacterDisplay {
  constructor(x, y, characterData, cropArea) {
    super(0, 0, characterData);
    this.cropArea = cropArea;
    this.cropSprite();
    this.x = x;
    this.y = y;
  }

  cropSprite() {
    Object.values(this.layers).forEach(layer => {
      if (layer) {
        layer.crop(new Phaser.Rectangle(
          this.cropArea.x,
          this.cropArea.y,
          this.cropArea.w,
          this.cropArea.h
        ));
      }
    });
  }

  updateAppearance(newAppearance) {
    super.updateAppearance(newAppearance);
    this.cropSprite();
  }
}
