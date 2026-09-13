/**
 * @class CharacterSkillSystem
 * @category Character System Classes
 * @summary Skill activation and effect management
 * @constructor
 * @param {Object} scene - The Phaser game state scene
 * @param {Object} [character] - Character data model; falls back to scene.character
 * @features
 * Condition-based skill activation during gameplay
 * Cooldown and duration tracking for all skills
 * Effect modifiers applied and reverted on deactivation
 * Skill bar updates and on-screen activation feedback
 * @description
 * Manages the lifecycle of character skills during a gameplay session, checking activation
 * conditions, applying temporary effect modifiers, tracking cooldowns and durations, and
 * reverting effects when skills expire or the game resets.
 * @example
 * // Modding usage example
 * const skills = new CharacterSkillSystem(scene, character);
 * function onJudge(judgement) {
 *   skills.checkSkillActivation('on_miss', { judgement });
 * }
 * function update() {
 *   skills.update();
 * }
 * skills.resetGame();
 */
class CharacterSkillSystem {
  constructor(scene, character) {
    /** @type {Object} The owning Phaser game state scene */
    this.scene = scene;
    /** @type {Object} Character data model using skills */
    this.character = character || scene.character;
    /** @type {Map} Skills currently active with their start and end times */
    this.activeSkills = new Map();
    /** @type {Map} Skill IDs mapped to their cooldown end times */
    this.skillCooldowns = new Map();
    /** @type {number} Number of skills used during the current game */
    this.skillsUsedThisGame = 0;
    /** @type {Object} Aggregate effect modifiers applied by active skills */
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
  /**
   * Checks whether the selected skill should activate for the given gameplay condition.
   * @param {string} condition - The activation condition that occurred
   * @param {Object} [params] - Context values such as judgement, combo, or health
   */
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

  /**
   * Determines whether a skill can be activated given cooldown, autoplay, and condition checks.
   * @param {Object} skill - The skill definition
   * @param {Object} params - Context values for condition evaluation
   * @returns {boolean} Whether activation is allowed
   */
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

  /**
   * Applies a skill's effect, sets its cooldown, shows visual feedback, and triggers the notify event.
   * @param {Object} skill - The skill definition to activate
   * @param {Object} params - Context values passed through for activation
   */
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
  
  /**
   * Shows an on-screen banner announcing the skill that was just used.
   * @param {Object} skill - The skill definition that was activated
   */
  notifySkillUsed(skill) {
    // Notify what skill was used
    const x = 4;
    const y = 32;
    const width = 8 + skill.name.length * 4;
    const height = 8;
    const bgcolor = "rgba(44, 90, 198, 0.6)";
    
    const bitmap = game.add.bitmapData(width, height);
    
    const gradient = bitmap.context.createLinearGradient(0, 0, width, 0);
    
    gradient.addColorStop(0, bgcolor);
    gradient.addColorStop(0.7, bgcolor);
    gradient.addColorStop(1, 'transparent');
    
    bitmap.context.fillStyle = gradient;
    bitmap.context.fillRect(0, 0, width, height);
    
    const background = game.add.sprite(-width, y, bitmap);
    background.alpha = 0;
    
    const text = new Text(4, 1, skill.name, FONTS.default, background);
    
    game.add.tween(background).to({ alpha: 1, x }, 350, Phaser.Easing.Quadratic.Out, true).yoyo(true).yoyoDelay(1000);
  }

  /**
   * Applies a skill's effect to the active modifiers based on its effect type.
   * @param {Object} skill - The skill definition whose effect is applied
   */
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

  /**
   * Reverts a skill's effect and removes it from the active skills list.
   * @param {string} skillId - ID of the skill to deactivate
   */
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

  /**
   * Begins periodic health regeneration using the skill's interval and amount.
   * @param {Object} params - Regeneration interval and amount
   */
  startHealthRegen(params) {
    this.stopHealthRegen(); // Stop any existing regen
    
    this.healthRegenTimer = game.time.events.loop(params.interval, () => {
      if (this.onHealthRegen) {
        this.onHealthRegen(params.amount);
      }
    });
  }

  /**
   * Stops any active health regeneration timer.
   */
  stopHealthRegen() {
    if (this.healthRegenTimer) {
      game.time.events.remove(this.healthRegenTimer);
      this.healthRegenTimer = null;
    }
  }
  
  // Getters for skill effects (used by Player class)
  /**
   * Getters for skill effects, consumed by the Player class during gameplay.
   * @returns {Object|null} Current judgement conversion effect
   */
  getJudgementConversion() {
    if (this.exhausted) {
      return null;
    } else {
      return this.skillEffects.judgementConversion;
    }
  }

  /**
   * @returns {number} Current judgement window multiplier
   */
  getJudgementWindowMultiplier() {
    return this.skillEffects.judgementWindowMultiplier;
  }

  /**
   * @returns {number} Current maximum health bonus
   */
  getMaxHealthBonus() {
    return this.skillEffects.maxHealthBonus;
  }

  /**
   * @returns {number} Current note speed multiplier
   */
  getNoteSpeedMultiplier() {
    return this.skillEffects.noteSpeedMultiplier;
  }

  /**
   * @returns {number} Current hold forgiveness multiplier
   */
  getHoldForgivenessMultiplier() {
    return this.skillEffects.holdForgivenessMultiplier;
  }

  /**
   * @returns {number} Current roll forgiveness multiplier
   */
  getRollForgivenessMultiplier() {
    return this.skillEffects.rollForgivenessMultiplier;
  }

  /**
   * @returns {number} Current mine damage multiplier
   */
  getMineDamageMultiplier() {
    return this.skillEffects.mineDamageMultiplier;
  }

  /**
   * Returns the score multiplier applied for a specific judgement type.
   * @param {string} judgement - The judgement type
   * @returns {number} The score multiplier, defaulting to 1.0
   */
  getScoreMultiplier(judgement) {
    return this.skillEffects.scoreMultipliers[judgement] || 1.0;
  }

  /**
   * @returns {number} Current health gain multiplier
   */
  getHealthGainMultiplier() {
    return this.skillEffects.healthGainMultiplier;
  }

  /**
   * @returns {number} Current input lag reduction
   */
  getInputLagReduction() {
    return this.skillEffects.inputLagReduction;
  }

/**
   * Updates exhaustion state, expires finished skills, and refreshes the skill bar each frame.
   */
  update() {
    const currentTime = game.time.now;
    
    // Abort if no character
    if (!this.character) return;
    
    // Update exhausted state
    this.exhausted = this.skillsUsedThisGame >= this.character.skillLevel;
    
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

  /**
   * Clears all active skills, cooldowns, effects, and usage count for a fresh game.
   */
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

  /**
   * Returns how many skills have been used during the current game.
   * @returns {number} Skills used count
   */
  getSkillsUsed() {
    return this.skillsUsedThisGame;
  }
}
