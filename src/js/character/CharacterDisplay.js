class CharacterDisplay extends Phaser.Sprite {
  constructor(x, y, characterData) {
    super(game, x, y);
    this.character = characterData;
    this.layers = {};
    this.alternateTimers = {};
    this.isSpecial = false;
    
    if (characterData) {
      this.createLayers();
    }
    game.add.existing(this);
  }

  createLayers() {
    const appearance = this.character.appearance;
    const tints = appearance.tints || {};
    
    // Check if special item is equipped
    const specialItem = this.getSpecialItem();
    this.isSpecial = specialItem && specialItem.hideCharacter;
    
    // Back hair layer (bottom)
    this.layers.backHair = game.add.sprite(0, 0, `character_back_hair_${appearance.backHair}`);
    this.layers.backHair.tint = tints.hair || 0xa8705a;
    this.addChild(this.layers.backHair);
    
    // Base layer (skin) - hide if special
    this.layers.base = game.add.sprite(0, 0, 'character_base', appearance.skinTone);
    this.layers.base.visible = !this.isSpecial;
    this.addChild(this.layers.base);
    
    // Front hair layer
    this.layers.frontHair = game.add.sprite(0, 0, `character_front_hair_${appearance.frontHair}`);
    this.layers.frontHair.tint = tints.hair || 0xa8705a;
    this.layers.frontHair.visible = !this.isSpecial;
    this.addChild(this.layers.frontHair);
    
    // Eyes layer with blinking
    this.layers.eyes = game.add.sprite(0, 0, 'character_eyes', 0);
    this.layers.eyes.visible = !this.isSpecial;
    this.addChild(this.layers.eyes);
    this.setupBlinking();
    
    // Clothing layers
    this.createClothingLayers(appearance, tints);
    
    // Special layer (on top of everything)
    if (specialItem) {
      this.createSpecialLayer(specialItem);
    }
    
    this.setupAlternateTints();
  }
  
  getSpecialItem() {
    const appearance = this.character.appearance;
    if (!appearance.clothing || !appearance.clothing.special) return null;
    
    const specialId = appearance.clothing.special;
    if (!specialId) return null;
    
    return CHARACTER_ITEMS.find(item => item.id === specialId && item.type === 'special');
  }
  
  createClothingLayers(appearance, tints) {
    const slots = ['shoes', 'bottom', 'top', 'accessory'];
    
    for (const slot of slots) {
      const itemId = appearance.clothing?.[slot];
      if (!itemId) continue;
      
      const item = CHARACTER_ITEMS.find(i => i.id === itemId && i.type === slot);
      if (!item) continue;
      
      if (this.isSpecial && slot !== 'special') continue;
      
      if (item.layers) {
        // Multi-layer item
        this.layers[slot] = [];
        for (let i = 0; i < item.layers.length; i++) {
          const layer = item.layers[i];
          // Use the tint key: slot + '_layer' + index
          const tintKey = slot + '_layer' + i;
          const tintValue = tints[tintKey] || layer.tint || null;
          
          const key = `character_item_${item.id}_layer${i}`;
          const sprite = game.add.sprite(0, 0, key);
          
          if (tintValue !== null && layer.dyable !== false) {
            sprite.tint = tintValue;
          }
          
          if (layer.alternateTint) {
            sprite._alternateTint = layer.alternateTint;
            sprite._alternateFrequency = layer.alternateFrequency || 100;
            sprite._currentTint = tintValue || layer.tint || 0xffffff;
          }
          
          this.addChild(sprite);
          this.layers[slot].push(sprite);
        }
      } else {
        // Single layer item
        const key = `character_item_${item.id}`;
        const sprite = game.add.sprite(0, 0, key);
        
        // Use slot key directly
        const tintValue = tints[slot] || item.tint || null;
        if (tintValue !== null && item.dyable !== false) {
          sprite.tint = tintValue;
        }
        
        this.addChild(sprite);
        this.layers[slot] = sprite;
      }
    }
  }
  
  createSpecialLayer(specialItem) {
    const key = `character_item_${specialItem.id}`;
    const sprite = game.add.sprite(0, 0, key);
    this.addChild(sprite);
    this.layers.special = sprite;
    
    // If special hides character, hide base layers
    if (specialItem.hideCharacter) {
      if (this.layers.base) this.layers.base.visible = false;
      if (this.layers.frontHair) this.layers.frontHair.visible = false;
      if (this.layers.eyes) this.layers.eyes.visible = false;
      if (this.layers.backHair) this.layers.backHair.visible = false;
      
      // Hide clothing layers except special
      const slots = ['top', 'bottom', 'shoes', 'accessory'];
      for (const slot of slots) {
        if (this.layers[slot]) {
          if (Array.isArray(this.layers[slot])) {
            for (const layer of this.layers[slot]) {
              layer.visible = false;
            }
          } else {
            this.layers[slot].visible = false;
          }
        }
      }
    }
  }
  
  setupBlinking() {
    const blinkFrames = [0, 1, 2, 3, 2, 1, 0];
    this.layers.eyes.animations.add('blink', blinkFrames, 16, false);
    this.startBlinking();
  }

  startBlinking() {
    const nextBlink = game.rnd.between(500, 5000);
    this.blink(nextBlink, () => {
      this.startBlinking();
    });
  }
  
  blink(time, callback) {
    game.time.events.add(time, () => {
      if (this.layers.eyes && this.layers.eyes.visible) {
        this.layers.eyes.animations.play('blink');
        this.layers.eyes.animations.currentAnim.onComplete.addOnce(() => callback?.());
      } else {
        callback?.();
      }
    });
  }
  
  setupAlternateTints() {
    // Check all layers for alternate tint animations
    for (const [key, layer] of Object.entries(this.layers)) {
      if (Array.isArray(layer)) {
        for (const sprite of layer) {
          if (sprite._alternateTint) {
            this.startAlternateTint(sprite);
          }
        }
      } else if (layer && layer._alternateTint) {
        this.startAlternateTint(layer);
      }
    }
  }
  
  startAlternateTint(sprite) {
    const frequency = sprite._alternateFrequency || 100;
    let toggle = false;
    
    this.alternateTimers[sprite.key] = game.time.events.loop(frequency, () => {
      if (!sprite.visible || !sprite.parent) {
        // Stop if sprite is destroyed or hidden
        if (this.alternateTimers[sprite.key]) {
          game.time.events.remove(this.alternateTimers[sprite.key]);
          delete this.alternateTimers[sprite.key];
        }
        return;
      }
      
      toggle = !toggle;
      sprite.tint = toggle ? sprite._alternateTint : sprite._currentTint;
    });
  }
  
  updateAppearance(newAppearance) {
    // Merge with existing appearance
    this.character.appearance = this.deepMerge(this.character.appearance, newAppearance);
    
    // Remove old alternate timers
    for (const [key, timer] of Object.entries(this.alternateTimers)) {
      game.time.events.remove(timer);
    }
    this.alternateTimers = {};
    
    // Rebuild layers
    for (const [key, layer] of Object.entries(this.layers)) {
      if (Array.isArray(layer)) {
        for (const sprite of layer) {
          sprite.destroy();
        }
      } else if (layer) {
        layer.destroy();
      }
    }
    this.layers = {};
    
    this.createLayers();
  }
  
  deepMerge(target, source) {
    const result = { ...target };
    for (const [key, value] of Object.entries(source)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.deepMerge(result[key] || {}, value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  destroy() {
    // Remove all alternate timers
    for (const [key, timer] of Object.entries(this.alternateTimers)) {
      game.time.events.remove(timer);
    }
    this.alternateTimers = {};
    
    // Destroy all layers
    for (const [key, layer] of Object.entries(this.layers)) {
      if (Array.isArray(layer)) {
        for (const sprite of layer) {
          sprite.destroy();
        }
      } else if (layer) {
        layer.destroy();
      }
    }
    this.layers = {};
    super.destroy();
  }
}