/**
 * @class CharacterDisplay
 * @category Character System Classes
 * @summary Visual character sprite with layered rendering
 * @constructor
 * @param {number} x - Horizontal position
 * @param {number} y - Vertical position
 * @param {Object} characterData - Character data model
 * @features
 * Layered sprite rendering for hair, base, eyes, and clothing
 * Personality-based and generic eye blinking
 * Particle aura effects for special items
 * Alternate tint cycling on clothing layers
 * @description
 * A Phaser.Sprite subclass that renders a character from layered sprites representing
 * back hair, base, front hair, eyes, and clothing items, applying tints and effects.
 * Supports animated blinking, aura particles, and appearance updates at runtime.
 * @example
 * // Modding usage example
 * const display = new CharacterDisplay(0, 0, characterData);
 * game.world.addChild(display);
 * display.updateAppearance({ frontHair: 2 });
 * display.destroy();
 */
class CharacterDisplay extends Phaser.Sprite {
  constructor(x, y, characterData) {
    super(game, x, y);
    /** @type {Object} Character data used for rendering */
    this.character = characterData;
    /** @type {Object} Rendering sprites keyed by layer name */
    this.layers = {};
    /** @type {Object} Active alternate tint timers keyed by layer */
    this.alternateTimers = {};
    /** @type {boolean} Whether a special item hides the character */
    this.isSpecial = false;
    /** @type {boolean} Whether a special item renders as an aura */
    this.isAura = false;
    /** @type {Phaser.Group|null} Group holding aura particle sprites */
    this.auraParticleGroup = null;
    /** @type {Array} Currently active aura particles */
    this.particles = [];
    /** @type {Array} Pool of reusable aura particles */
    this.particlePool = [];
    /** @type {Object} Rectangle defining the aura emission area */
    this.auraRect = { x: 25, y: 0, w: 50, h: 80 };
    /** @type {Object|null} Loop timer that emits aura particles */
    this.particleTimer = null;
    /** @type {Object|null} Configuration of the active aura effect */
    this.auraConfig = null;
    /** @type {Object|null} Eye behavior config of the character's personality */
    this.personalityBehavior = null;
    /** @type {Array} Queue of blink behaviors to follow */
    this.blinkQueue = [];
    /** @type {number} Current position in the blink queue */
    this.currentBlinkIndex = 0;
    /** @type {boolean} Whether a blink animation is in progress */
    this.isBlinking = false;
    
    if (characterData) {
      this.createLayers(true);
      this.loadPersonalityBehavior();
    }
    game.add.existing(this);
  }

  /**
   * Returns the special clothing item equipped by the character, if any.
   * @param {Object} [appearanceObj] - Optional appearance object; defaults to the character's
   * @returns {Object|null} The special item definition or null
   */
  getSpecialItem(appearanceObj) {
    const appearance = appearanceObj || this.character.appearance;
    if (!appearance.clothing || !appearance.clothing.special) return null;
    const specialId = appearance.clothing.special;
    if (!specialId) return null;
    return CHARACTER_ITEMS.find(item => item.id === specialId && item.type === 'special');
  }

  /**
   * Loads the personality's eye behavior and rebuilds the blink queue for the character.
   */
  loadPersonalityBehavior() {
    if (!this.character || !this.character.personality) {
      this.personalityBehavior = null;
      return;
    }
    const personality = CHARACTER_SYSTEM.PERSONALITIES.find(p => p.id === this.character.personality);
    if (personality && personality.eyesBehavior) {
      this.personalityBehavior = personality.eyesBehavior;
      this.blinkQueue = this.buildBlinkQueue();
      this.currentBlinkIndex = 0;
    } else {
      this.personalityBehavior = null;
    }
  }

  /**
   * Builds a queue of blink behaviors from the personality's eye behavior config.
   * @returns {Array} List of resolved blink behavior entries
   */
  buildBlinkQueue() {
    if (!this.personalityBehavior) return [];
    const queue = [];
    for (const behavior of this.personalityBehavior) {
      let distance = behavior.distance;
      if (Array.isArray(distance)) {
        distance = game.rnd.pick(distance);
      }
      let waitMin = behavior.waitMin || 1000;
      let waitMax = behavior.waitMax || 3000;
      queue.push({
        distance: distance,
        waitMin: waitMin,
        waitMax: waitMax,
        frame: this.getBlinkFrame(distance)
      });
    }
    return queue;
  }

  /**
   * Maps an eye distance value to a blink animation frame index.
   * @param {number} distance - The eye distance value
   * @returns {number} Clamped frame index between 0 and 3
   */
  getBlinkFrame(distance) {
    return Math.min(3, Math.max(0, distance));
  }

  /**
   * Starts either personality-based or generic blinking depending on the character's behavior.
   */
  setupBlinking() {
    if (this.personalityBehavior && this.blinkQueue.length > 0) {
      this.startPersonalityBlinking();
    } else {
      this.startGenericBlinking();
    }
  }

  /**
   * Starts the default blinking loop with randomly timed blink intervals.
   */
  startGenericBlinking() {
    const blinkFrames = [0, 1, 2, 3, 2, 1, 0];
    this.layers.eyes?.animations.add('blink', blinkFrames, 16, false);
    const nextBlink = game.rnd.between(500, 5000);
    this.blink(nextBlink, () => {
      this.startGenericBlinking();
    });
  }

  /**
   * Starts the personality-driven blinking sequence that follows the character's blink queue.
   */
  startPersonalityBlinking() {
    if (this.blinkQueue.length === 0) return;
    const personality = CHARACTER_SYSTEM.PERSONALITIES.find(p => p.id === this.character.personality);
    const useRandom = personality?.blinkRandom || false;
    let nextBehavior;
    if (useRandom) {
      const randomIndex = game.rnd.between(0, this.blinkQueue.length - 1);
      nextBehavior = this.blinkQueue[randomIndex];
    } else {
      nextBehavior = this.blinkQueue[this.currentBlinkIndex % this.blinkQueue.length];
      this.currentBlinkIndex++;
    }
    const waitTime = game.rnd.between(nextBehavior.waitMin, nextBehavior.waitMax);
    const targetFrame = nextBehavior.frame;
    const currentFrame = this.layers.eyes.frame || 0;
    const frames = [];
    if (currentFrame < targetFrame) {
      for (let i = currentFrame; i <= targetFrame; i++) frames.push(i);
    } else if (currentFrame > targetFrame) {
      for (let i = currentFrame; i >= targetFrame; i--) frames.push(i);
    } else {
      frames.push(targetFrame);
    }
    this.layers.eyes.animations.add('personality_blink', frames, 16, false);
    this.layers.eyes.animations.play('personality_blink');
    this.layers.eyes.animations.currentAnim.onComplete.addOnce(() => {
      this.startPersonalityBlinking();
    });
  }

  /**
   * Schedules a blink animation after a delay, then runs the completion callback.
   * @param {number} time - Delay in milliseconds before blinking
   * @param {Function} callback - Callback invoked after the blink completes
   */
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

  /**
   * Builds all rendering layers from the character's appearance, including aura effects.
   * @param {boolean} specialItemChanged - Whether the special item changed, requiring aura rebuild
   */
  createLayers(specialItemChanged) {
    const appearance = this.character.appearance;
    const tints = appearance.tints || {};
    const specialItem = this.getSpecialItem();
    this.isSpecial = specialItem && specialItem.hideCharacter;
    this.isAura = specialItem && specialItem.isAura;
    
    if (this.isAura && specialItem && specialItemChanged) {
      this.createAura(specialItem, tints);
    }
    
    this.layers.backHair = game.add.sprite(0, 0, `character_back_hair_${appearance.backHair}`);
    this.layers.backHair.tint = tints.hair || 0xa8705a;
    this.addChild(this.layers.backHair);
    
    this.layers.base = game.add.sprite(0, 0, 'character_base', appearance.skinTone);
    this.layers.base.visible = !this.isSpecial || this.isAura;
    this.addChild(this.layers.base);
    
    this.layers.frontHair = game.add.sprite(0, 0, `character_front_hair_${appearance.frontHair}`);
    this.layers.frontHair.tint = tints.hair || 0xa8705a;
    this.layers.frontHair.visible = !this.isSpecial || this.isAura;
    this.addChild(this.layers.frontHair);
    
    this.layers.eyes = game.add.sprite(0, 0, 'character_eyes', 0);
    this.layers.eyes.visible = !this.isSpecial || this.isAura;
    this.addChild(this.layers.eyes);
    this.setupBlinking();
    
    this.createClothingLayers(appearance, tints);
    
    this.setupAlternateTints();
  }

  /**
   * Creates sprites for each clothing slot, applying tints and layering per item definition.
   * @param {Object} appearance - The character's appearance config
   * @param {Object} tints - Tint values per clothing slot
   */
  createClothingLayers(appearance, tints) {
    const slots = ['shoes', 'bottom', 'top', 'accessory', 'special'];
    for (const slot of slots) {
      const itemId = appearance.clothing?.[slot];
      if (!itemId) continue;
      const item = CHARACTER_ITEMS.find(i => i.id === itemId && i.type === slot);
      if (!item) continue;
      if (slot == 'special' && item.isAura) continue;
      
      if (item.layers) {
        this.layers[slot] = [];
        for (let i = 0; i < item.layers.length; i++) {
          const layer = item.layers[i];
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
        const key = `character_item_${item.id}`;
        const sprite = game.add.sprite(0, 0, key);
        const tintValue = tints[slot] || item.tint || null;
        if (tintValue !== null && item.dyable !== false) {
          sprite.tint = tintValue;
        }
        this.addChild(sprite);
        this.layers[slot] = sprite;
      }
      
      if (slot == 'special') {
        if (item.hideCharacter) {
          if (this.layers.base) this.layers.base.visible = false;
          if (this.layers.frontHair) this.layers.frontHair.visible = false;
          if (this.layers.eyes) this.layers.eyes.visible = false;
          if (this.layers.backHair) this.layers.backHair.visible = false;
          if (this.layers.accessory) this.layers.accessory.visible = false;
        }
        for (const slot of slots) {
          if (this.layers[slot] && slot != 'special' && slot != 'accessory') {
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
  }

  /**
   * Starts alternate tint cycling for any layers that define an alternate tint.
   */
  setupAlternateTints() {
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

  /**
   * Begins toggling a sprite's tint between its alternate and current colors on a loop.
   * @param {Object} sprite - The sprite with alternate tint metadata
   */
  startAlternateTint(sprite) {
    const frequency = sprite._alternateFrequency || 100;
    let toggle = false;
    this.alternateTimers[sprite.key] = game.time.events.loop(frequency, () => {
      if (!sprite.visible || !sprite.parent) {
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

  /**
   * Creates the particle group and starts the emission loop for an aura item.
   * @param {Object} item - The special item definition
   * @param {Object} tints - Tint values including the special slot
   */
  createAura(item, tints) {
    if (!item.particle) return;
    this.auraParticleGroup = game.add.group();
    this.addChild(this.auraParticleGroup);
    
    const config = item.particle;
    this.auraConfig = {
      keys: config.keys || [config.key || 'particle_dot'],
      frames: config.frames || [0],
      layers: config.layers || 1,
      frequency: config.frequency || 15,
      duration: config.duration || 3000,
      velocityMin: config.velocity?.min || 8,
      velocityMax: config.velocity?.max || 25,
      alphaMin: config.alpha?.min || 0.3,
      alphaMax: config.alpha?.max || 0.7,
      gravityMin: config.gravity?.min || -10,
      gravityMax: config.gravity?.max || 10,
      dyable: item.dyable !== false,
      tintBase: tints.special || item.tint || 0xffffff,
      alternateTint: config.alternateTint || null,
      alternateFrequency: config.alternateFrequency || 500,
      rainbow: config.rainbow || false,
      rainbowColors: config.rainbowColors || [],
      rotate: config.rotate !== false,
      lockDirection: config.lockDirection || null,
      currentTintIndex: 0,
      lastTintSwitch: 0,
      _usingAlternate: false,
      emitCount: 0
    };
    
    this.particleTimer = game.time.events.loop(1000 / this.auraConfig.frequency, () => {
      this.emitParticle();
    });
  }

  /**
   * Pulls an inactive particle from the pool or creates a new sprite for the given texture.
   * @param {string} key - Texture key for the particle
   * @param {number} frame - Frame index within the texture
   * @returns {Object} The prepared particle sprite
   */
  getParticleFromPool(key, frame) {
    for (let i = 0; i < this.particlePool.length; i++) {
      const p = this.particlePool[i];
      if (!p.active && p.key === key) {
        p.active = true;
        p.visible = true;
        p.loadTexture(key, frame);
        p.alpha = 1;
        p.scale.set(1);
        p.rotation = 0;
        return p;
      }
    }
    const sprite = game.add.sprite(0, 0, key, frame);
    sprite.anchor.set(0.5);
    sprite.active = true;
    this.auraParticleGroup.add(sprite);
    this.particlePool.push(sprite);
    return sprite;
  }

  /**
   * Marks a particle sprite as inactive and invisible for future reuse.
   * @param {Object} sprite - The particle sprite to recycle
   */
  recycleParticle(sprite) {
    sprite.active = false;
    sprite.visible = false;
    sprite.alpha = 0;
  }

  /**
   * Spawns one set of aura particles with randomized position, velocity, tint, and lifespan.
   */
  emitParticle() {
    if (!this.auraParticleGroup || !this.auraConfig) return;
    const config = this.auraConfig;
    const numParticles = config.layers || 1;
    const now = game.time.now;
    
    if (config.alternateTint || config.rainbow) {
      if (now - config.lastTintSwitch > config.alternateFrequency) {
        config.lastTintSwitch = now;
        if (config.rainbow && config.rainbowColors.length > 0) {
          config.currentTintIndex = (config.currentTintIndex + 1) % config.rainbowColors.length;
        } else if (config.alternateTint) {
          config._usingAlternate = !config._usingAlternate;
        }
      }
    }
    
    let currentTint = config.tintBase;
    if (config.rainbow && config.rainbowColors.length > 0) {
      currentTint = config.rainbowColors[config.currentTintIndex];
    } else if (config.alternateTint && config._usingAlternate) {
      currentTint = config.alternateTint;
    }
    
    const lockDir = config.lockDirection || null;
    const shouldRotate = config.rotate !== false;
    const rect = this.auraRect;
    
    for (let layer = 0; layer < numParticles; layer++) {
      const keyIndex = game.rnd.between(0, config.keys.length - 1);
      const spriteKey = config.keys[keyIndex];
      const frame = game.rnd.pick(config.frames);
      
      const sprite = this.getParticleFromPool(spriteKey, frame);
      const x = game.rnd.between(rect.x, rect.x + rect.w);
      const y = game.rnd.between(rect.y, rect.y + rect.h);
      sprite.x = x;
      sprite.y = y;
      
      if (config.dyable) {
        const tintVariation = (layer / Math.max(1, numParticles)) * 0.3;
        const r = ((currentTint >> 16) & 0xFF) * (1 - tintVariation * 0.3);
        const g = ((currentTint >> 8) & 0xFF) * (1 - tintVariation * 0.2);
        const b = (currentTint & 0xFF) * (1 - tintVariation * 0.1);
        sprite.tint = (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
      } else {
        sprite.tint = 0xffffff;
      }
      
      let angle, speed;
      if (lockDir === "up") {
        angle = game.rnd.between(-30, 30) * Math.PI / 180;
        speed = game.rnd.between(config.velocityMin, config.velocityMax);
        sprite.vx = Math.sin(angle) * speed * 0.5;
        sprite.vy = -Math.abs(Math.cos(angle)) * speed;
        sprite.rotation = -Math.PI / 2;
      } else if (lockDir === "down") {
        angle = game.rnd.between(-30, 30) * Math.PI / 180;
        speed = game.rnd.between(config.velocityMin, config.velocityMax);
        sprite.vx = Math.sin(angle) * speed * 0.5;
        sprite.vy = Math.abs(Math.cos(angle)) * speed;
        sprite.rotation = Math.PI / 2;
      } else if (lockDir === "random") {
        angle = game.rnd.angle() * Math.PI / 180;
        speed = game.rnd.between(config.velocityMin, config.velocityMax);
        sprite.vx = Math.cos(angle) * speed;
        sprite.vy = Math.sin(angle) * speed;
      } else {
        angle = game.rnd.angle() * Math.PI / 180;
        speed = game.rnd.between(config.velocityMin, config.velocityMax);
        sprite.vx = Math.cos(angle) * speed;
        sprite.vy = Math.sin(angle) * speed;
        if (shouldRotate) {
          sprite.rotation = game.rnd.angle() * Math.PI / 180;
        }
      }
      
      let gravityMin = config.gravityMin;
      let gravityMax = config.gravityMax;
      if (lockDir === "up") {
        gravityMin = Math.min(-15, config.gravityMin);
        gravityMax = Math.min(-5, config.gravityMax);
      } else if (lockDir === "down") {
        gravityMin = Math.max(5, config.gravityMin);
        gravityMax = Math.max(15, config.gravityMax);
      }
      sprite.gravity = game.rnd.between(gravityMin, gravityMax);
      sprite.alpha = game.rnd.realInRange(config.alphaMin, config.alphaMax);
      sprite.lifespan = config.duration + game.rnd.between(-500, 500);
      sprite.born = game.time.now;
      sprite._layer = layer;
      sprite._numLayers = numParticles;
      sprite._lockDir = lockDir;
      sprite._baseTint = currentTint;
      sprite._hasAlternate = config.alternateTint !== null;
      sprite._alternateTint = config.alternateTint;
      sprite._rainbow = config.rainbow;
      sprite._rainbowColors = config.rainbowColors;
      sprite._tintSwitchTime = config.alternateFrequency;
      sprite._lastTintSwitch = game.time.now;
      sprite._usingAlternate = false;
      sprite._tintIndex = 0;
      sprite.active = true;
      sprite.visible = true;
      
      this.particles.push(sprite);
    }
    config.emitCount++;
    if (config.emitCount % 5 === 0) {
      this.cleanParticles();
    }
  }

  /**
   * Removes particles whose lifespan has expired from the active list.
   */
  cleanParticles() {
    const now = game.time.now;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (now - p.born > p.lifespan || p.alpha <= 0) {
        this.recycleParticle(p);
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Advances particle physics, fading, and tint cycling each frame.
   */
  updateParticles() {
    const dt = game.time.elapsed / 1000;
    const rect = this.auraRect;
    const now = game.time.now;
    
    for (const p of this.particles) {
      if (!p.active || !p.visible) continue;
      
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      
      const age = (now - p.born) / p.lifespan;
      if (age > 0.7) {
        p.alpha = p.alpha * (1 - (age - 0.7) / 0.3);
      }
      
      const margin = 10;
      if (p.x < rect.x - margin || p.x > rect.x + rect.w + margin) {
        p.vx *= -0.5;
        p.x = Math.max(rect.x - margin, Math.min(rect.x + rect.w + margin, p.x));
      }
      if (p.y < rect.y - margin || p.y > rect.y + rect.h + margin) {
        p.vy *= -0.5;
        p.y = Math.max(rect.y - margin, Math.min(rect.y + rect.h + margin, p.y));
      }
      
      if (!p._lockDir) {
        p.rotation += dt * 0.5;
      }
      
      if ((p._hasAlternate || p._rainbow) && p.alpha > 0.1) {
        if (now - p._lastTintSwitch > p._tintSwitchTime) {
          p._lastTintSwitch = now;
          if (p._rainbow && p._rainbowColors && p._rainbowColors.length > 0) {
            p._tintIndex = (p._tintIndex + 1) % p._rainbowColors.length;
            const baseTint = p._rainbowColors[p._tintIndex];
            const tintVariation = (p._layer / Math.max(1, p._numLayers)) * 0.3;
            const r = ((baseTint >> 16) & 0xFF) * (1 - tintVariation * 0.3);
            const g = ((baseTint >> 8) & 0xFF) * (1 - tintVariation * 0.2);
            const b = (baseTint & 0xFF) * (1 - tintVariation * 0.1);
            p.tint = (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
          } else if (p._hasAlternate) {
            p._usingAlternate = !p._usingAlternate;
            const currentTint = p._usingAlternate ? p._alternateTint : p._baseTint;
            const tintVariation = (p._layer / Math.max(1, p._numLayers)) * 0.3;
            const r = ((currentTint >> 16) & 0xFF) * (1 - tintVariation * 0.3);
            const g = ((currentTint >> 8) & 0xFF) * (1 - tintVariation * 0.2);
            const b = (currentTint & 0xFF) * (1 - tintVariation * 0.1);
            p.tint = (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
          }
        }
      }
    }
    if (this.particles.length > 0) {
      this.cleanParticles();
    }
  }

  /**
   * Per-frame update that advances active aura particles.
   */
  update() {
    if (this.auraParticleGroup && this.particles.length > 0) {
      this.updateParticles();
    }
  }

  /**
   * Recursively merges a source object into a target, preserving nested object structure.
   * @param {Object} target - The target object to merge into
   * @param {Object} source - The source object providing values
   * @returns {Object} The merged result object
   */
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

  /**
   * Rebuilds all rendering layers to reflect a new appearance configuration.
   * @param {Object} [newAppearance] - Partial appearance overrides to apply
   */
  updateAppearance(newAppearance = {}) {
    const specialItemChanged = (this.character?.appearance?.clothing?.special ?? null) !== (newAppearance?.clothing?.special ?? null);
    
    this.character.appearance = this.deepMerge(this.character.appearance, newAppearance);
    
    for (const [key, timer] of Object.entries(this.alternateTimers)) {
      game.time.events.remove(timer);
    }
    this.alternateTimers = {};
    
    if (this.auraParticleGroup && specialItemChanged) {
      this.auraParticleGroup.destroy();
      this.auraParticleGroup = null;
      this.particles = [];
      this.particlePool = [];
      if (this.particleTimer) {
        game.time.events.remove(this.particleTimer);
        this.particleTimer = null;
      }
    }
    
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
    
    this.createLayers(specialItemChanged);
  }

  /**
   * Cleans up timers, particles, and rendering layers before destroying the sprite.
   */
  destroy() {
    if (this.particleTimer) {
      game.time.events.remove(this.particleTimer);
      this.particleTimer = null;
    }
    for (const [key, timer] of Object.entries(this.alternateTimers)) {
      game.time.events.remove(timer);
    }
    this.alternateTimers = {};
    
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
    
    if (this.auraParticleGroup) {
      this.auraParticleGroup.destroy();
      this.auraParticleGroup = null;
    }
    this.particles = [];
    this.particlePool = [];
    
    super.destroy();
  }
}