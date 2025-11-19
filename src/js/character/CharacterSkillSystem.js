class CharacterSkillSystem {
  constructor(character) {
    this.character = character;
    this.activeSkills = new Map();
    this.skillCooldowns = new Map();
    this.skillsUsedThisGame = 0;
    this.skillEffects = {
      judgementConversion: null,
      judgementWindowMultiplier: 1.0,
      healthRegen: null,
      maxHealthBonus: 0,
      noteSpeedMultiplier: 1.0
    };
  }

  // Main method to check and activate skills
  checkSkillActivation(condition, params = {}) {
    if (this.skillsUsedThisGame >= this.character.skillLevel) return;

    const availableSkills = this.character.unlockedSkills
      .map(skillId => CHARACTER_SKILLS.find(s => s.id === skillId))
      .filter(skill => skill && skill.activationCondition === condition);

    for (const skill of availableSkills) {
      if (this.canActivateSkill(skill, params)) {
        this.activateSkill(skill, params);
        this.skillsUsedThisGame++;
        break;
      }
    }
  }

  canActivateSkill(skill, params) {
    if (this.skillCooldowns.has(skill.id)) return false;

    switch (skill.activationCondition) {
      case 'on_miss':
        return params.judgement === 'miss';
      case 'on_combo':
        return params.combo >= (skill.effectParams.threshold || 50);
      case 'on_low_health':
        return params.health <= (skill.effectParams.threshold || 30);
      case 'on_high_combo':
        return params.combo >= (skill.effectParams.threshold || 100);
      case 'on_perfect_streak':
        return params.perfectStreak >= (skill.effectParams.threshold || 10);
      default:
        return true;
    }
  }

  activateSkill(skill, params) {
    console.log(`Skill activated: ${skill.name}`);
    
    // Apply skill effect
    this.applySkillEffect(skill);
    
    // Set cooldown
    if (skill.cooldown > 0) {
      this.skillCooldowns.set(skill.id, game.time.now + skill.cooldown);
      game.time.events.add(skill.cooldown, () => {
        this.skillCooldowns.delete(skill.id);
      });
    }

    // Show visual feedback
    this.showCharacterCloseShot(skill.duration || 1800);

    // Handle duration-based skills
    if (skill.duration > 0) {
      this.activeSkills.set(skill.id, {
        skill: skill,
        startTime: game.time.now,
        endTime: game.time.now + skill.duration
      });

      game.time.events.add(skill.duration, () => {
        this.deactivateSkill(skill.id);
      });
    }

    // Trigger notification
    notifications.show(`SKILL: ${skill.name}`, 2000);
  }

  applySkillEffect(skill) {
    switch (skill.effect) {
      case 'convert_judgement':
        this.skillEffects.judgementConversion = skill.effectParams;
        break;
        
      case 'modify_judgement_window':
        this.skillEffects.judgementWindowMultiplier = skill.effectParams.multiplier;
        break;
        
      case 'health_regen':
        this.startHealthRegen(skill.effectParams);
        break;
        
      case 'modify_max_health':
        this.skillEffects.maxHealthBonus = skill.effectParams.amount;
        break;
        
      case 'modify_note_speed':
        this.skillEffects.noteSpeedMultiplier = skill.effectParams.multiplier;
        break;
    }
  }

  deactivateSkill(skillId) {
    const skillData = this.activeSkills.get(skillId);
    if (!skillData) return;

    const skill = skillData.skill;
    
    switch (skill.effect) {
      case 'convert_judgement':
        this.skillEffects.judgementConversion = null;
        break;
        
      case 'modify_judgement_window':
        this.skillEffects.judgementWindowMultiplier = 1.0;
        break;
        
      case 'health_regen':
        this.stopHealthRegen();
        break;
        
      case 'modify_max_health':
        this.skillEffects.maxHealthBonus = 0;
        break;
        
      case 'modify_note_speed':
        this.skillEffects.noteSpeedMultiplier = 1.0;
        break;
    }

    this.activeSkills.delete(skillId);
  }

  startHealthRegen(params) {
    this.stopHealthRegen(); // Stop any existing regen
    
    this.healthRegenTimer = game.time.events.loop(params.interval, () => {
      if (this.onHealthRegen) {
        this.onHealthRegen(params.amount);
      }
    });
  }

  stopHealthRegen() {
    if (this.healthRegenTimer) {
      game.time.events.remove(this.healthRegenTimer);
      this.healthRegenTimer = null;
    }
  }

  showCharacterCloseShot(duration) {
    const displayTime = Math.max(500, duration - 200);
    const closeShot = new CharacterCloseShot(2, 103, this.character);
    closeShot.visible = false;
    game.world.add(closeShot);

    const noiseSprite = game.add.sprite(2, 103, 'character_noise');
    noiseSprite.animations.add('static', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
    noiseSprite.animations.play('static');

    game.time.events.add(100, () => {
      noiseSprite.destroy();
      closeShot.visible = true;
    });

    game.time.events.add(displayTime, () => {
      closeShot.visible = false;
      const endNoise = game.add.sprite(2, 103, 'character_noise');
      endNoise.animations.add('static', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
      endNoise.animations.play('static');
      
      game.time.events.add(100, () => {
        endNoise.destroy();
        closeShot.destroy();
      });
    });
  }

  // Getters for skill effects (used by Player class)
  getJudgementConversion() {
    return this.skillEffects.judgementConversion;
  }

  getJudgementWindowMultiplier() {
    return this.skillEffects.judgementWindowMultiplier;
  }

  getMaxHealthBonus() {
    return this.skillEffects.maxHealthBonus;
  }

  getNoteSpeedMultiplier() {
    return this.skillEffects.noteSpeedMultiplier;
  }

  update() {
    const currentTime = game.time.now;
    
    // Update active skills
    for (const [skillId, skillData] of this.activeSkills) {
      if (currentTime >= skillData.endTime) {
        this.deactivateSkill(skillId);
      }
    }

    // Update cooldowns
    for (const [skillId, cooldownEnd] of this.skillCooldowns) {
      if (currentTime >= cooldownEnd) {
        this.skillCooldowns.delete(skillId);
      }
    }
  }

  resetGame() {
    for (const skillId of this.activeSkills.keys()) {
      this.deactivateSkill(skillId);
    }
    this.activeSkills.clear();
    this.skillCooldowns.clear();
    this.skillsUsedThisGame = 0;
    
    // Reset all effects
    this.skillEffects = {
      judgementConversion: null,
      judgementWindowMultiplier: 1.0,
      healthRegen: null,
      maxHealthBonus: 0,
      noteSpeedMultiplier: 1.0
    };
    
    this.stopHealthRegen();
  }

  getSkillsUsed() {
    return this.skillsUsedThisGame;
  }
}
