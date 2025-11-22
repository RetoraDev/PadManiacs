class CharacterSkillSystem {
  constructor(scene, character) {
    this.scene = scene;
    this.character = character || scene.character;
    this.activeSkills = new Map();
    this.skillCooldowns = new Map();
    this.skillsUsedThisGame = 0;
    this.skillEffects = {
      judgementConversion: null,
      judgementWindowMultiplier: 1.0,
      healthRegen: null,
      maxHealthBonus: 0,
      noteSpeedMultiplier: 1.0,
      holdForgivenessMultiplier: 1.0,
      rollForgivenessMultiplier: 1.0,
      mineDamageMultiplier: 1.0,
      scoreMultipliers: {},
      healthGainMultiplier: 1.0,
      comboShield: false,
      inputLagReduction: 0
    };
  }

  // Main method to check and activate skills
  checkSkillActivation(condition, params = {}) {
    if (!this.character || this.exhausted) return;

    const availableSkills = this.character.unlockedSkills
      .map(skillId => CHARACTER_SKILLS.find(s => s.id === skillId));

    const selectedSkill = availableSkills.find(s => s.id === this.character.selectedSkill);

    if (selectedSkill && selectedSkill.activationCondition === condition && this.canActivateSkill(selectedSkill, params)) {
      this.activateSkill(selectedSkill, params);
      this.skillsUsedThisGame++;
    }
  }

  canActivateSkill(skill, params) {
    if (this.exhausted) return false;
    if (this.skillCooldowns.has(skill.id)) return false;
    if (this.scene.autoPlay) return false;

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
      case 'on_mine_hit':
        return true;
      case 'on_critical_health':
        return params.health <= (skill.effectParams.threshold || 15);
      case 'custom':
        return skill.activationCheckFunction ? skill.activationCheckFunction() : false;
      default:
        return true;
    }
  }

  activateSkill(skill, params) {
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
    this.scene?.showCharacterCloseShot(skill.duration || 1800);

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
    this.notifySkillUsed(skill);
  }
  
  notifySkillUsed(skill) {
    // TODO: Notify skill used
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
        this.scene.showGlitchAnimation(100);
        break;
        
      case 'modify_hold_forgiveness':
        this.skillEffects.holdForgivenessMultiplier = skill.effectParams.multiplier;
        break;
        
      case 'modify_roll_forgiveness':
        this.skillEffects.rollForgivenessMultiplier = skill.effectParams.multiplier;
        break;
        
      case 'reduce_mine_damage':
        this.skillEffects.mineDamageMultiplier = skill.effectParams.multiplier;
        break;
        
      case 'modify_score_gain':
        this.skillEffects.scoreMultipliers[skill.effectParams.judgement] = skill.effectParams.multiplier;
        break;
        
      case 'modify_health_gain':
        this.skillEffects.healthGainMultiplier = skill.effectParams.multiplier;
        break;
        
      case 'combo_shield':
        this.skillEffects.comboShield = true;
        if (this.onComboShield) {
          this.onComboShield();
        }
        break;
        
      case 'modify_input_lag':
        this.skillEffects.inputLagReduction = skill.effectParams.reduction;
        break;
        
      case 'burst_health_regen':
        if (this.onHealthRegen) {
          this.onHealthRegen(skill.effectParams.amount);
        }
        break;
        
      case 'stabilize_judgement':
        // This skill reduces timing variation - implemented in Player's timing calculations
        break;
        
      case 'general_boost':
        this.skillEffects.judgementWindowMultiplier = skill.effectParams.windowMultiplier;
        this.skillEffects.healthGainMultiplier = skill.effectParams.healthMultiplier;
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
        this.scene.showGlitchAnimation(100);
        break;
        
      case 'modify_hold_forgiveness':
        this.skillEffects.holdForgivenessMultiplier = 1.0;
        break;
        
      case 'modify_roll_forgiveness':
        this.skillEffects.rollForgivenessMultiplier = 1.0;
        break;
        
      case 'reduce_mine_damage':
        this.skillEffects.mineDamageMultiplier = 1.0;
        break;
        
      case 'modify_score_gain':
        delete this.skillEffects.scoreMultipliers[skill.effectParams.judgement];
        break;
        
      case 'modify_health_gain':
        this.skillEffects.healthGainMultiplier = 1.0;
        break;
        
      case 'combo_shield':
        this.skillEffects.comboShield = false;
        break;
        
      case 'modify_input_lag':
        this.skillEffects.inputLagReduction = 0;
        break;
        
      case 'general_boost':
        this.skillEffects.judgementWindowMultiplier = 1.0;
        this.skillEffects.healthGainMultiplier = 1.0;
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
  
  // Getters for skill effects (used by Player class)
  getJudgementConversion() {
    if (this.exhausted) {
      return null;
    } else {
      return this.skillEffects.judgementConversion;
    }
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

  getHoldForgivenessMultiplier() {
    return this.skillEffects.holdForgivenessMultiplier;
  }

  getRollForgivenessMultiplier() {
    return this.skillEffects.rollForgivenessMultiplier;
  }

  getMineDamageMultiplier() {
    return this.skillEffects.mineDamageMultiplier;
  }

  getScoreMultiplier(judgement) {
    return this.skillEffects.scoreMultipliers[judgement] || 1.0;
  }

  getHealthGainMultiplier() {
    return this.skillEffects.healthGainMultiplier;
  }

  getInputLagReduction() {
    return this.skillEffects.inputLagReduction;
  }

  update() {
    const currentTime = game.time.now;
    
    // Abort if no character
    if (!this.character) return;
    
    // Update exhausted state
    this.exhausted = this.skillsUsedThisGame >= this.character.skillLevel
    
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
  
    // Update skill bar
    this.scene.skillBar.value = (5 - (5 - this.character.skillLevel)) - this.getSkillsUsed();
    this.scene.skillBar.visibleParts = this.character.skillLevel;
    this.scene.skillBar.update();
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
      noteSpeedMultiplier: 1.0,
      holdForgivenessMultiplier: 1.0,
      rollForgivenessMultiplier: 1.0,
      mineDamageMultiplier: 1.0,
      scoreMultipliers: {},
      healthGainMultiplier: 1.0,
      comboShield: false,
      inputLagReduction: 0
    };
    
    this.stopHealthRegen();
  }

  getSkillsUsed() {
    return this.skillsUsedThisGame;
  }
}
