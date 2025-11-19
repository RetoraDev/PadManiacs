class CharacterDisplay extends Phaser.Sprite {
  constructor(x, y, characterData) {
    super(game, x, y);
    this.character = characterData;
    this.layers = {};
    this.createLayers();
  }

  createLayers() {
    // Back hair layer (bottom)
    this.layers.backHair = game.add.sprite(0, 0, `character_back_hair_${this.character.appearance.backHair}`);
    this.layers.backHair.tint = this.character.appearance.hairColor;
    this.addChild(this.layers.backHair);

    // Base layer (skin)
    this.layers.base = game.add.sprite(0, 0, 'character_base', this.character.appearance.skinTone);
    this.addChild(this.layers.base);

    // Front hair layer
    this.layers.frontHair = game.add.sprite(0, 0, `character_front_hair_${this.character.appearance.frontHair}`);
    this.layers.frontHair.tint = this.character.appearance.hairColor;
    this.addChild(this.layers.frontHair);

    // Eyes layer with blinking animation
    this.layers.eyes = game.add.sprite(0, 0, 'character_eyes', 0);
    this.addChild(this.layers.eyes);
    this.setupBlinking();

    // Clothing layer
    this.layers.clothing = game.add.sprite(0, 0, `character_clothing_${this.character.appearance.clothing}`);
    this.addChild(this.layers.clothing);

    // Accessory layer (if equipped)
    if (this.character.appearance.accessory) {
      this.layers.accessory = game.add.sprite(0, 0, `character_accessory_${this.character.appearance.accessory}`);
      this.addChild(this.layers.accessory);
    }
  }

  setupBlinking() {
    const blinkFrames = [0, 1, 2, 3, 2, 1, 0];
    this.layers.eyes.animations.add('blink', blinkFrames, 10, false);
    this.startBlinking();
  }

  startBlinking() {
    const nextBlink = game.rnd.between(2000, 5000);
    game.time.events.add(nextBlink, () => {
      if (this.layers.eyes) {
        this.layers.eyes.animations.play('blink');
        this.layers.eyes.animations.currentAnim.onComplete.addOnce(() => {
          this.startBlinking();
        });
      }
    });
  }

  updateAppearance(newAppearance) {
    this.character.appearance = { ...this.character.appearance, ...newAppearance };
    
    if (this.layers.backHair) {
      this.layers.backHair.tint = this.character.appearance.hairColor;
      if (newAppearance.backHair) {
        this.layers.backHair.loadTexture(`character_back_hair_${newAppearance.backHair}`);
      }
    }
    
    if (this.layers.frontHair) {
      this.layers.frontHair.tint = this.character.appearance.hairColor;
      if (newAppearance.frontHair) {
        this.layers.frontHair.loadTexture(`character_front_hair_${newAppearance.frontHair}`);
      }
    }
    
    if (this.layers.base && newAppearance.skinTone !== undefined) {
      this.layers.base.frame = this.character.appearance.skinTone;
    }
    
    if (this.layers.clothing && newAppearance.clothing) {
      this.layers.clothing.loadTexture(`character_clothing_${newAppearance.clothing}`);
    }
    
    if (newAppearance.accessory !== undefined) {
      if (this.layers.accessory) {
        this.layers.accessory.destroy();
      }
      if (newAppearance.accessory) {
        this.layers.accessory = game.add.sprite(0, 0, `character_accessory_${newAppearance.accessory}`);
        this.addChild(this.layers.accessory);
      }
    }
  }

  destroy() {
    Object.values(this.layers).forEach(layer => {
      if (layer && layer.destroy) layer.destroy();
    });
    this.layers = {};
    super.destroy();
  }
}