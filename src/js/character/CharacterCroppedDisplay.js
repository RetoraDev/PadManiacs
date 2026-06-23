class CharacterCroppedDisplay extends CharacterDisplay {
  constructor(x, y, characterData, cropArea) {
    super(0, 0, characterData);
    this.cropArea = cropArea;
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

  updateAppearance(newAppearance) {
    super.updateAppearance(newAppearance);
    this.cropSprite();
  }
}