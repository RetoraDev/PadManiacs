/**
 * @class Character
 * @category Character System Classes
 * @summary Character data model with leveling and experience
 * @constructor
 * @param {Object} data - Initial character data
 * @features
 * Leveling and experience system
 * Skill, hair, and item unlocking
 * Appearance and clothing customization
 * Personality development from gameplay history
 * @description
 * Core data model representing a playable character, including level, experience,
 * unlocked skills, appearance, and developed personalities. Progress advances through
 * gameplay and unlocks are granted at level milestones.
 * @example
 * // Modding usage example
 * const char = new Character({
 *   name: 'Hero',
 *   level: 1,
 *   experience: 0,
 *   appearance: { skinTone: 0, frontHair: 1, backHair: 1 }
 * });
 * char.addExperience(120);
 * console.log(char.level, char.getExperienceProgress());
 * char.changeHairStyle('front', 2);
 * char.changeClothing('top_seifuku_red');
 * console.log(char.toJSON());
 */
class Character {
  constructor(data) {
    /** @type {string} Character display name */
    this.name = data.name;
    /** @type {number} Current character level */
    this.level = data.level || 1;
    /** @type {number} Current experience points */
    this.experience = data.experience || 0;
    /** @type {number} Skill proficiency level */
    this.skillLevel = data.skillLevel || 1;
    /** @type {Array} List of unlocked skill IDs */
    this.unlockedSkills = data.unlockedSkills || [];
    /** @type {string|null} Currently selected skill ID */
    this.selectedSkill = data.selectedSkill || null;
    /** @type {Object} Character appearance configuration */
    this.appearance = data.appearance || {
      skinTone: 0,
      frontHair: 1,
      backHair: 1,
      clothing: {
        accessory: null,
        top: "top_seifuku_default",
        bottom: "bottom_skirt_blue",
        shoes: "shoes_common",
        special: null
      },
      tints: {
        hair: 0xa8705a,
        accessory: null,
        top: null,
        bottom: null,
        shoes: null,
        special: null
      }
    };
    /** @type {Object} Cumulative gameplay statistics */
    this.stats = data.stats || {
      gamesPlayed: 0,
      totalScore: 0,
      maxCombo: 0,
      perfectGames: 0,
      skillsUsed: 0
    };
    /** @type {Array} History of experience gain events */
    this.experienceStory = [];
    /** @type {number} Level at which the character last raised their skill level */
    this.lastSkillLevelUp = data.lastSkillLevelUp || 0;
    /** @type {number} Level at which the character last unlocked a hair style */
    this.lastHairUnlockLevel = data.lastHairUnlockLevel || 0;
    /** @type {number} Level at which the character last unlocked an item */
    this.lastItemUnlockLevel = data.lastItemUnlockLevel || 0;
    /** @type {string|null} Active personality ID */
    this.personality = data.personality || null;
    /** @type {Array} List of developed personality IDs */
    this.developedPersonalities = data.developedPersonalities || [];
    /** @type {Array} History of personality study results */
    this.personalityStudyHistory = data.personalityStudyHistory || [];
    /** @type {number} Index of the current personality in the developed list */
    this.currentPersonalityIndex = data.currentPersonalityIndex || 0;
  }
  
  /**
   * Returns the most recent experience story entry, or null when no history exists.
   * @returns {Object|null} The last experience story entry
   */
  getLastExperienceStoryEntry() {
    return this.experienceStory.length ? this.experienceStory[this.experienceStory.length - 1] : null;
  }

  /**
   * Adds experience points and triggers level ups whenever thresholds are crossed.
   * @param {number} amount - Experience points to grant
   */
  addExperience(amount) {
    const storyEntry = {
      levelBefore: this.level,
      expBefore: this.experience,
      expGain: amount
    };
    
    this.experience += amount;
    const requiredExp = CHARACTER_SYSTEM.EXPERIENCE_CURVE(this.level);
    
    while (this.experience >= requiredExp) {
      this.levelUp();
      this.experience -= requiredExp;
    }
    
    storyEntry.expAfter = this.experience;
    storyEntry.levelAfter = this.level;
    
    this.experienceStory.push(storyEntry);
  }

  /**
   * Increases the character level and rolls for skill, hair, item, and skill level unlocks.
   */
  levelUp() {
    this.level++;
    
    // Check for skill unlock
    if (Math.random() < CHARACTER_SYSTEM.SKILL_UNLOCK_CHANCE && 
        this.level >= CHARACTER_SYSTEM.MIN_LEVEL_FOR_SKILL) {
      const unlockedSkill = this.unlockRandomSkill();
      if (unlockedSkill) {
        notifications.show(__("New skill unlocked: ||Nueva habilidad desbloqueada: ") + unlockedSkill.name, 2000, "unlock");
      }
    }
    
    // Check for hair style unlock
    if (this.level >= CHARACTER_SYSTEM.MIN_LEVEL_FOR_HAIR &&
        this.level - this.lastHairUnlockLevel >= CHARACTER_SYSTEM.HAIR_COOLDOWN_LEVELS &&
        Math.random() < CHARACTER_SYSTEM.HAIR_UNLOCK_CHANCE) {
      const unlockedHair = this.unlockRandomHairStyle();
      if (unlockedHair) {
        this.lastHairUnlockLevel = this.level;
        
        notifications.show(__("New hair style unlocked: ||Nuevo corte de pelo desbloqueado: ") + CHARACTER_SYSTEM.HAIR_STYLES[unlockedHair.type][unlockedHair.id-1].name, 2000, "unlock");
      }
    }
    
    // Check for item unlock
    if (this.level >= CHARACTER_SYSTEM.MIN_LEVEL_FOR_ITEM &&
        this.level - this.lastItemUnlockLevel >= CHARACTER_SYSTEM.ITEM_COOLDOWN_LEVELS &&
        Math.random() < CHARACTER_SYSTEM.ITEM_UNLOCK_CHANCE) {
      const unlockedItem = this.unlockRandomItem();
      if (unlockedItem) {
        this.lastItemUnlockLevel = this.level;
        notifications.show(__("New item unlocked: ||Nuevo item desbloqueado: ") + unlockedItem.name, 2000, "unlock");
      }
    }
    
    // Check for skill level up
    if (this.level - this.lastSkillLevelUp >= CHARACTER_SYSTEM.SKILL_COOLDOWN_LEVELS &&
        Math.random() < CHARACTER_SYSTEM.SKILL_LEVEL_UP_CHANCE &&
        this.skillLevel < CHARACTER_SYSTEM.MAX_SKILL_LEVEL) {
      this.skillLevel++;
      this.lastSkillLevelUp = this.level;
      notifications.show(__("Skill level increased to ||Nivel de habilidad ha aumentado a ") + this.skillLevel, 2000, "unlock");
    }
  }

  /**
   * Unlocks a random available skill, preferring ones matching the character's personality.
   * @returns {Object|null} The unlocked skill object or null if none are available
   */
  unlockRandomSkill() {
    const personality = this.personality ? CHARACTER_SYSTEM.PERSONALITIES.find(p => p.id === this.personality) : null;
    
    let availableSkills = CHARACTER_SKILLS.filter(skill => 
      !this.unlockedSkills.includes(skill.id)
    );
    
    if (availableSkills.length === 0) return null;
    
    if (personality && personality.skillTendencies) {
      const tendencies = personality.skillTendencies;
      const preferredSkills = [];
      const otherSkills = [];
      
      for (const skill of availableSkills) {
        let matches = false;
        
        if (tendencies.activation && tendencies.activation.length > 0) {
          if (tendencies.activation.includes(skill.activationCondition)) {
            matches = true;
          }
        }
        
        if (tendencies.effects && tendencies.effects.length > 0) {
          if (tendencies.effects.includes(skill.effect)) {
            matches = true;
          }
        }
        
        if (matches) {
          preferredSkills.push(skill);
        } else {
          otherSkills.push(skill);
        }
      }
      
      if (preferredSkills.length > 0 && Math.random() < 0.7) {
        const randomSkill = preferredSkills[Math.floor(Math.random() * preferredSkills.length)];
        this.unlockedSkills.push(randomSkill.id);
        return randomSkill;
      }
      
      const pool = otherSkills.length > 0 ? otherSkills : preferredSkills;
      if (pool.length > 0) {
        const randomSkill = pool[Math.floor(Math.random() * pool.length)];
        this.unlockedSkills.push(randomSkill.id);
        return randomSkill;
      }
    }
    
    const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
    this.unlockedSkills.push(randomSkill.id);
    return randomSkill;
  }

  /**
   * Unlocks a random front or back hair style not yet owned by the account.
   * @returns {Object|null} Object with type and id of the unlocked hair, or null
   */
  unlockRandomHairStyle() {
    const availableFrontHairs = [];
    const availableBackHairs = [];
    
    for (let i = 1; i <= CHARACTER_SYSTEM.HAIR_STYLES.front.length; i++) {
      if (!Account.characters.unlockedHairs.front.includes(i)) {
        availableFrontHairs.push(i);
      }
    }
    
    for (let i = 1; i <= CHARACTER_SYSTEM.HAIR_STYLES.back.length; i++) {
      if (!Account.characters.unlockedHairs.back.includes(i)) {
        availableBackHairs.push(i);
      }
    }
    
    const unlockType = Math.random() < 0.5 ? 'front' : 'back';
    const availableHairs = unlockType === 'front' ? availableFrontHairs : availableBackHairs;
    
    if (availableHairs.length > 0) {
      const randomHairId = availableHairs[Math.floor(Math.random() * availableHairs.length)];
      
      Account.characters.unlockedHairs[unlockType].push(randomHairId);
      
      localStorage.setItem("Account", JSON.stringify(Account));
      
      return {
        type: unlockType,
        id: randomHairId
      };
    }
    
    return null;
  }

  /**
   * Unlocks a random clothing item not yet owned by the account.
   * @returns {Object|null} The unlocked item object or null if none are available
   */
  unlockRandomItem() {
    const defaultItems = ["top_seifuku_default", "bottom_skirt_blue", "shoes_common"];
    
    const availableItems = CHARACTER_ITEMS.filter(item => 
      !Account.characters.unlockedItems.includes(item.id) &&
      !defaultItems.includes(item.id)
    );
    
    if (availableItems.length > 0) {
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      
      Account.characters.unlockedItems.push(randomItem.id);
      
      saveAccount();
      
      return randomItem;
    }
    
    return null;
  }
  
  /**
   * Evaluates finished game results and may develop a new personality from eligible candidates.
   * @param {Object} gameResults - Results from a completed game session
   * @returns {Object|null} The developed personality object or null
   */
  studyPersonalities(gameResults) {
    if (!gameResults.complete || gameResults.autoplay) return null;
    
    const stats = this.stats;
    const personalities = CHARACTER_SYSTEM.PERSONALITIES;
    const developed = this.developedPersonalities || [];
    
    if (developed.length >= personalities.length) {
      if (window.LOG_PERSONALITY_STUDY) {
        console.log(this.name + " has developed all personalities");
      }
      return null;
    }
    
    let candidates = [];
    
    if (developed.length === 0) {
      candidates = personalities;
    } else {
      const lastDeveloped = personalities.find(p => p.id === developed[developed.length - 1]);
      if (lastDeveloped && lastDeveloped.possibleNextPersonalities) {
        candidates = personalities.filter(p => 
          lastDeveloped.possibleNextPersonalities.includes(p.id) &&
          !developed.includes(p.id)
        );
      }
      
      if (candidates.length === 0) {
        candidates = personalities.filter(p => !developed.includes(p.id));
      }
    }
    
    if (window.LOG_PERSONALITY_STUDY) {
      console.log("Studying personality " + candidates.length + " candidates for " + this.name);
    }
    
    let bestCandidate = null;
    let bestScore = 0;
    
    for (const personality of candidates) {
      const score = this.calculatePersonalityScore(personality, gameResults);
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = personality;
      }
      
      if (window.LOG_PERSONALITY_STUDY) {
        console.log(personality.name + ": score " + score.toFixed(2));
      }
    }
    
    if (bestCandidate && bestScore >= 0.7) {
      this.developedPersonalities.push(bestCandidate.id);
      this.personality = bestCandidate.id;
      this.currentPersonalityIndex = this.developedPersonalities.length - 1;
      
      if (window.LOG_PERSONALITY_STUDY) {
        console.log(this.name + " developed " + bestCandidate.name + " personality! (score: " + bestScore.toFixed(2) + ")");
      }
      
      return bestCandidate;
    }
    
    if (window.LOG_PERSONALITY_STUDY) {
      console.log(this.name + " didn't develop a personality this time (best score: " + bestScore.toFixed(2) + ")");
    }
    
    return null;
  }
  
  /**
   * Computes how well gameplay results satisfy a personality's development criteria.
   * @param {Object} personality - The personality definition to score
   * @param {Object} gameResults - Results from a completed game session
   * @returns {number} Normalized score between 0 and 1
   */
  calculatePersonalityScore(personality, gameResults) {
    const reasons = personality.reasons || {};
    let score = 0;
    let totalChecks = 0;
    const stats = this.stats;
    const judgements = gameResults.judgements || {};
    const totalNotes = Object.values(judgements).reduce((a, b) => a + b, 0);
    
    if (reasons.gamesPlayed !== undefined) {
      const games = stats.gamesPlayed || 0;
      const ratio = Math.min(1, games / reasons.gamesPlayed);
      score += ratio;
      totalChecks++;
    }
    
    if (reasons.accuracyMin !== undefined) {
      const acc = gameResults.accuracy || 0;
      const ratio = Math.min(1, acc / reasons.accuracyMin);
      score += ratio;
      totalChecks++;
    }
    
    if (reasons.comboMin !== undefined) {
      const combo = gameResults.maxCombo || 0;
      const ratio = Math.min(1, combo / reasons.comboMin);
      score += ratio;
      totalChecks++;
    }
    
    if (reasons.perfectStreakMin !== undefined) {
      const perfectStreak = gameResults.maxPerfectStreak || 0;
      const ratio = Math.min(1, perfectStreak / reasons.perfectStreakMin);
      score += ratio;
      totalChecks++;
    }
    
    if (reasons.perfectGames !== undefined) {
      const perfectGames = stats.perfectGames || 0;
      const ratio = Math.min(1, perfectGames / reasons.perfectGames);
      score += ratio;
      totalChecks++;
    }
    
    if (reasons.maxMarvelous !== undefined) {
      const marvelous = judgements.marvelous || 0;
      const ratio = Math.min(1, marvelous / reasons.maxMarvelous);
      score += ratio;
      totalChecks++;
    }
    
    if (reasons.maxMiss !== undefined) {
      const miss = judgements.miss || 0;
      const ratio = Math.max(0, 1 - (miss / reasons.maxMiss));
      score += ratio;
      totalChecks++;
    }
    
    if (reasons.ratingThreshold !== undefined) {
      const rating = gameResults.rating || 'F';
      const ratingValues = { 'F': 0, 'E': 0.1, 'D': 0.2, 'C': 0.3, 'B': 0.4, 'A': 0.5, 'S': 0.6, 'SS': 0.7, 'SSS': 0.8, 'SSS+': 0.9 };
      const ratingScore = ratingValues[rating] || 0;
      const ratio = Math.min(1, ratingScore / reasons.ratingThreshold);
      score += ratio;
      totalChecks++;
    }
    
    return totalChecks > 0 ? score / totalChecks : 0;
  }

  /**
   * Returns all unlocked hair style IDs organized by front and back types.
   * @returns {Object} Object with front and back arrays of hair style IDs
   */
  getAvailableHairStyles() {
    return {
      front: Account.characters.unlockedHairs.front,
      back: Account.characters.unlockedHairs.back
    };
  }

  /**
   * Returns all unlocked clothing item IDs for the account.
   * @returns {Array} List of unlocked item IDs
   */
  getAvailableItems() {
    return Account.characters.unlockedItems;
  }
  
  /**
   * Looks up a clothing item definition by its ID.
   * @param {string} itemId - The item identifier
   * @returns {Object|null} The matching item object or null
   */
  static getItem(itemId) {
    for (const item of CHARACTER_ITEMS) {
      if (item.id === itemId) return item;
    }
    return null;
  }

  /**
   * Looks up a personality definition by its ID.
   * @param {string} itemId - The personality identifier
   * @returns {Object|null} The matching personality object or null
   */
  static getPersonlity(itemId) {
    for (const item of CHARACTER_SYSTEM.PERSONALITIES) {
      if (item.id === itemId) return item;
    }
    return null;
  }

  /**
   * Applies a hair style if the character owns it.
   * @param {string} type - Hair type, either 'front' or 'back'
   * @param {number} hairId - The hair style ID to apply
   * @returns {boolean} Whether the change succeeded
   */
  changeHairStyle(type, hairId) {
    if (type === 'front' && Account.characters.unlockedHairs.front.includes(hairId)) {
      this.appearance.frontHair = hairId;
      return true;
    } else if (type === 'back' && Account.characters.unlockedHairs.back.includes(hairId)) {
      this.appearance.backHair = hairId;
      return true;
    }
    return false;
  }
  
  /**
   * Sets the hair tint color for the character's appearance.
   * @param {number} tint - Hex color value for the hair tint
   * @returns {boolean} Whether the change succeeded
   */
  changeHairTint(tint) {
    this.appearance.tints.hair = tint;
    return true;
  }

  /**
   * Equips a clothing item if owned, handling tint layers and the special item slot.
   * @param {string} itemId - The clothing item ID to equip
   * @returns {boolean} Whether the change succeeded
   */
  changeClothing(itemId) {
    if (Account.characters.unlockedItems.includes(itemId)) {
      const item = CHARACTER_ITEMS.clothing.find(i => i.id === itemId) || 
                   CHARACTER_ITEMS.accessories.find(i => i.id === itemId);
      if (item) {
        if (item.type === 'special') {
          this.appearance.clothing.special = itemId;
          if (item.layers) {
            this.appearance.tints.special = [];
            item.layers.forEach(layer => {
              this.appearance.tints.special.push(layer.dyable ? layer.tint : null);
            });
          } else {
            this.appearance.tints.special = item.dyable ? item.tint : null;
          }
        } else {
          this.appearance.clothing.special = null;
          this.appearance.tints.special = null;
          this.appearance.clothing[item.type] = itemId;
          if (item.layers) {
            this.appearance.tints[item.type] = [];
            item.layers.forEach(layer => {
              this.appearance.tints[item.type].push(layer.dyable ? layer.tint : null);
            });
          } else {
            this.appearance.tints[item.type] = item.dyable ? item.tint : null;
          }
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the experience points required to reach the next level.
   * @returns {number} Required experience points
   */
  getRequiredExperience() {
    return CHARACTER_SYSTEM.EXPERIENCE_CURVE(this.level);
  }

  /**
   * Returns the progress ratio toward the next level.
   * @returns {number} Progress value between 0 and 1
   */
  getExperienceProgress() {
    const required = this.getRequiredExperience();
    return this.experience / required;
  }

  /**
   * Checks whether the character has any unlocked skills to use.
   * @returns {boolean} True if the character can use a skill
   */
  canUseSkill() {
    return this.skillLevel > 0 && this.unlockedSkills.length > 0;
  }

  /**
   * Serializes the character into a plain object suitable for persistence.
   * @returns {Object} Character data ready for JSON storage
   */
  toJSON() {
    return {
      name: this.name,
      level: this.level,
      experience: this.experience,
      skillLevel: this.skillLevel,
      unlockedSkills: this.unlockedSkills,
      selectedSkill: this.selectedSkill,
      appearance: this.appearance,
      personality: this.personality || null,
      stats: this.stats,
      lastSkillLevelUp: this.lastSkillLevelUp,
      lastHairUnlockLevel: this.lastHairUnlockLevel,
      lastItemUnlockLevel: this.lastItemUnlockLevel
    };
  }
}