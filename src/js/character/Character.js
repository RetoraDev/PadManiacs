class Character {
  constructor(data) {
    this.name = data.name;
    this.level = data.level || 1;
    this.experience = data.experience || 0;
    this.skillLevel = data.skillLevel || 1;
    this.unlockedSkills = data.unlockedSkills || [];
    this.selectedSkill = data.selectedSkill || null;
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
    this.stats = data.stats || {
      gamesPlayed: 0,
      totalScore: 0,
      maxCombo: 0,
      perfectGames: 0,
      skillsUsed: 0
    };
    this.experienceStory = [];
    this.lastSkillLevelUp = data.lastSkillLevelUp || 0;
    this.lastHairUnlockLevel = data.lastHairUnlockLevel || 0;
    this.lastItemUnlockLevel = data.lastItemUnlockLevel || 0;
    this.personality = data.personality || null; // null means no personality yet
    this.developedPersonalities = data.developedPersonalities || []; // track developed personalities
    this.personalityStudyHistory = data.personalityStudyHistory || []; // for debugging
    this.currentPersonalityIndex = data.currentPersonalityIndex || 0;
  }
  
  getLastExperienceStoryEntry() {
    return this.experienceStory.length ? this.experienceStory[this.experienceStory.length - 1] : null;
  }

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

  levelUp() {
    this.level++;
    
    // Check for skill unlock
    if (Math.random() < CHARACTER_SYSTEM.SKILL_UNLOCK_CHANCE && 
        this.level >= CHARACTER_SYSTEM.MIN_LEVEL_FOR_SKILL) {
      const unlockedSkill = this.unlockRandomSkill();
      if (unlockedSkill) {
        notifications.show(`New skill unlocked: ${unlockedSkill.name}`, 2000, "unlock");
      }
    }
    
    // Check for hair style unlock
    if (this.level >= CHARACTER_SYSTEM.MIN_LEVEL_FOR_HAIR &&
        this.level - this.lastHairUnlockLevel >= CHARACTER_SYSTEM.HAIR_COOLDOWN_LEVELS &&
        Math.random() < CHARACTER_SYSTEM.HAIR_UNLOCK_CHANCE) {
      const unlockedHair = this.unlockRandomHairStyle();
      if (unlockedHair) {
        this.lastHairUnlockLevel = this.level;
        
        notifications.show(`New hair style unlocked: ${CHARACTER_SYSTEM.HAIR_STYLES[unlockedHair.type][unlockedHair.id-1].name}`, 2000, "unlock");
      }
    }
    
    // Check for item unlock
    if (this.level >= CHARACTER_SYSTEM.MIN_LEVEL_FOR_ITEM &&
        this.level - this.lastItemUnlockLevel >= CHARACTER_SYSTEM.ITEM_COOLDOWN_LEVELS &&
        Math.random() < CHARACTER_SYSTEM.ITEM_UNLOCK_CHANCE) {
      const unlockedItem = this.unlockRandomItem();
      if (unlockedItem) {
        this.lastItemUnlockLevel = this.level;
        notifications.show(`New item unlocked: ${unlockedItem.name}`, 2000, "unlock");
      }
    }
    
    // Check for skill level up
    if (this.level - this.lastSkillLevelUp >= CHARACTER_SYSTEM.SKILL_COOLDOWN_LEVELS &&
        Math.random() < CHARACTER_SYSTEM.SKILL_LEVEL_UP_CHANCE &&
        this.skillLevel < CHARACTER_SYSTEM.MAX_SKILL_LEVEL) {
      this.skillLevel++;
      this.lastSkillLevelUp = this.level;
      notifications.show(`Skill level increased to ${this.skillLevel}`, 2000, "unlock");
    }
  }

  unlockRandomSkill() {
    const personality = this.personality ? CHARACTER_SYSTEM.PERSONALITIES.find(p => p.id === this.personality) : null;
    
    // Get all available skills not yet unlocked
    let availableSkills = CHARACTER_SKILLS.filter(skill => 
      !this.unlockedSkills.includes(skill.id)
    );
    
    if (availableSkills.length === 0) return null;
    
    // If character has a personality with skill tendencies, bias the selection
    if (personality && personality.skillTendencies) {
      const tendencies = personality.skillTendencies;
      const preferredSkills = [];
      const otherSkills = [];
      
      for (const skill of availableSkills) {
        let matches = false;
        
        // Check activation condition preference
        if (tendencies.activation && tendencies.activation.length > 0) {
          if (tendencies.activation.includes(skill.activationCondition)) {
            matches = true;
          }
        }
        
        // Check effect preference
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
      
      // 70% chance to pick from preferred skills if any exist
      if (preferredSkills.length > 0 && Math.random() < 0.7) {
        const randomSkill = preferredSkills[Math.floor(Math.random() * preferredSkills.length)];
        this.unlockedSkills.push(randomSkill.id);
        return randomSkill;
      }
      
      // Otherwise pick from other skills (or preferred if no others)
      const pool = otherSkills.length > 0 ? otherSkills : preferredSkills;
      if (pool.length > 0) {
        const randomSkill = pool[Math.floor(Math.random() * pool.length)];
        this.unlockedSkills.push(randomSkill.id);
        return randomSkill;
      }
    }
    
    // No personality or no tendencies, pick random
    const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
    this.unlockedSkills.push(randomSkill.id);
    return randomSkill;
  }

  unlockRandomHairStyle() {
    const availableFrontHairs = [];
    const availableBackHairs = [];
    
    // Find all front hair styles not yet unlocked
    for (let i = 1; i <= CHARACTER_SYSTEM.HAIR_STYLES.front.length; i++) {
      if (!Account.characters.unlockedHairs.front.includes(i)) {
        availableFrontHairs.push(i);
      }
    }
    
    // Find all back hair styles not yet unlocked
    for (let i = 1; i <= CHARACTER_SYSTEM.HAIR_STYLES.back.length; i++) {
      if (!Account.characters.unlockedHairs.back.includes(i)) {
        availableBackHairs.push(i);
      }
    }
    
    // Randomly choose between front or back hair unlock
    const unlockType = Math.random() < 0.5 ? 'front' : 'back';
    const availableHairs = unlockType === 'front' ? availableFrontHairs : availableBackHairs;
    
    if (availableHairs.length > 0) {
      const randomHairId = availableHairs[Math.floor(Math.random() * availableHairs.length)];
      
      // Add to Account's unlocked hairs
      Account.characters.unlockedHairs[unlockType].push(randomHairId);
      
      // Save to localStorage
      localStorage.setItem("Account", JSON.stringify(Account));
      
      return {
        type: unlockType,
        id: randomHairId
      };
    }
    
    return null;
  }

  unlockRandomItem() {
    // Default items that are already equipped or unlocked by default
    const defaultItems = ["top_seifuku_default", "bottom_skirt_blue", "shoes_common"];
    
    // Get all items that are NOT in unlockedItems and NOT default items
    const availableItems = CHARACTER_ITEMS.filter(item => 
      !Account.characters.unlockedItems.includes(item.id) &&
      !defaultItems.includes(item.id)
    );
    
    if (availableItems.length > 0) {
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      
      // Add to Account's unlocked items
      Account.characters.unlockedItems.push(randomItem.id);
      
      // Save to localStorage
      saveAccount();
      
      return randomItem;
    }
    
    return null;
  }
  
  studyPersonalities(gameResults) {
    if (!gameResults.complete || gameResults.autoplay) return null;
    
    const stats = this.stats;
    const personalities = CHARACTER_SYSTEM.PERSONALITIES;
    const developed = this.developedPersonalities || [];
    
    // If already developed all possible personalities, stop
    if (developed.length >= personalities.length) {
      if (window.LOG_PERSONALITY_STUDY) {
        console.log(`${this.name} has developed all personalities`);
      }
      return null;
    }
    
    // Check which personalities we should study next
    let candidates = [];
    
    if (developed.length === 0) {
      // No personality yet - check all
      candidates = personalities;
    } else {
      // Check possible next personalities
      const lastDeveloped = personalities.find(p => p.id === developed[developed.length - 1]);
      if (lastDeveloped && lastDeveloped.possibleNextPersonalities) {
        candidates = personalities.filter(p => 
          lastDeveloped.possibleNextPersonalities.includes(p.id) &&
          !developed.includes(p.id)
        );
      }
      
      // If no candidates from next personalities, check all not developed
      if (candidates.length === 0) {
        candidates = personalities.filter(p => !developed.includes(p.id));
      }
    }
    
    if (window.LOG_PERSONALITY_STUDY) {
      console.log(`Studying personality ${candidates.length} candidates for ${this.name}`);
    }
    
    // Score each candidate based on game results
    let bestCandidate = null;
    let bestScore = 0;
    
    for (const personality of candidates) {
      const score = this.calculatePersonalityScore(personality, gameResults);
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = personality;
      }
      
      if (window.LOG_PERSONALITY_STUDY) {
        console.log(`${personality.name}: score ${score.toFixed(2)}`);
      }
    }
    
    // Threshold to develop personality (need at least 0.7 to unlock)
    if (bestCandidate && bestScore >= 0.7) {
      this.developedPersonalities.push(bestCandidate.id);
      this.personality = bestCandidate.id;
      this.currentPersonalityIndex = this.developedPersonalities.length - 1;
      
      if (window.LOG_PERSONALITY_STUDY) {
        console.log(`${this.name} developed "${bestCandidate.name}" personality! (score: ${bestScore.toFixed(2)})`);
      }
      
      return bestCandidate;
    }
    
    if (window.LOG_PERSONALITY_STUDY) {
      console.log(`${this.name} didn't develop a personality this time (best score: ${bestScore.toFixed(2)})`);
    }
    
    return null;
  }
  
  calculatePersonalityScore(personality, gameResults) {
    const reasons = personality.reasons || {};
    let score = 0;
    let totalChecks = 0;
    const stats = this.stats;
    const judgements = gameResults.judgements || {};
    const totalNotes = Object.values(judgements).reduce((a, b) => a + b, 0);
    
    // Games played check
    if (reasons.gamesPlayed !== undefined) {
      const games = stats.gamesPlayed || 0;
      const ratio = Math.min(1, games / reasons.gamesPlayed);
      score += ratio;
      totalChecks++;
    }
    
    // Accuracy check
    if (reasons.accuracyMin !== undefined) {
      const acc = gameResults.accuracy || 0;
      const ratio = Math.min(1, acc / reasons.accuracyMin);
      score += ratio;
      totalChecks++;
    }
    
    // Combo check
    if (reasons.comboMin !== undefined) {
      const combo = gameResults.maxCombo || 0;
      const ratio = Math.min(1, combo / reasons.comboMin);
      score += ratio;
      totalChecks++;
    }
    
    // Perfect streak check
    if (reasons.perfectStreakMin !== undefined) {
      // Calculate perfect streak from game data
      const perfectStreak = gameResults.maxPerfectStreak || 0;
      const ratio = Math.min(1, perfectStreak / reasons.perfectStreakMin);
      score += ratio;
      totalChecks++;
    }
    
    // Perfect games check
    if (reasons.perfectGames !== undefined) {
      const perfectGames = stats.perfectGames || 0;
      const ratio = Math.min(1, perfectGames / reasons.perfectGames);
      score += ratio;
      totalChecks++;
    }
    
    // Max marvelous in game check
    if (reasons.maxMarvelous !== undefined) {
      const marvelous = judgements.marvelous || 0;
      const ratio = Math.min(1, marvelous / reasons.maxMarvelous);
      score += ratio;
      totalChecks++;
    }
    
    // Max miss check
    if (reasons.maxMiss !== undefined) {
      const miss = judgements.miss || 0;
      const ratio = Math.max(0, 1 - (miss / reasons.maxMiss));
      score += ratio;
      totalChecks++;
    }
    
    // Rating threshold check
    if (reasons.ratingThreshold !== undefined) {
      const rating = gameResults.rating || 'F';
      const ratingValues = { 'F': 0, 'E': 0.1, 'D': 0.2, 'C': 0.3, 'B': 0.4, 'A': 0.5, 'S': 0.6, 'SS': 0.7, 'SSS': 0.8, 'SSS+': 0.9 };
      const ratingScore = ratingValues[rating] || 0;
      const ratio = Math.min(1, ratingScore / reasons.ratingThreshold);
      score += ratio;
      totalChecks++;
    }
    
    // Return normalized score (0-1)
    return totalChecks > 0 ? score / totalChecks : 0;
  }

  getAvailableHairStyles() {
    return {
      front: Account.characters.unlockedHairs.front,
      back: Account.characters.unlockedHairs.back
    };
  }

  getAvailableItems() {
    return Account.characters.unlockedItems;
  }
  
  static getItem(itemId) {
    for (const item of CHARACTER_ITEMS) {
      if (item.id === itemId) return item;
    }
    return null;
  }

  static getPersonlity(itemId) {
    for (const item of CHARACTER_SYSTEM.PERSONALITIES) {
      if (item.id === itemId) return item;
    }
    return null;
  }

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
  
  changeHairTint(tint) {
    this.appearance.tints.hair = tint;
    return true;
  }

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

  getRequiredExperience() {
    return CHARACTER_SYSTEM.EXPERIENCE_CURVE(this.level);
  }

  getExperienceProgress() {
    const required = this.getRequiredExperience();
    return this.experience / required;
  }

  canUseSkill() {
    return this.skillLevel > 0 && this.unlockedSkills.length > 0;
  }

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
