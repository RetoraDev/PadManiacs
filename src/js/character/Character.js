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
      hairColor: 0xFFFFFF,
      frontHair: "1",
      backHair: "1",
      clothing: "school_uniform",
      accessory: "headphones"
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
        notifications.show(`New skill unlocked: ${unlockedSkill.name}`);
      }
    }
    
    // Check for hair style unlock
    if (this.level >= CHARACTER_SYSTEM.MIN_LEVEL_FOR_HAIR &&
        this.level - this.lastHairUnlockLevel >= CHARACTER_SYSTEM.HAIR_COOLDOWN_LEVELS &&
        Math.random() < CHARACTER_SYSTEM.HAIR_UNLOCK_CHANCE) {
      const unlockedHair = this.unlockRandomHairStyle();
      if (unlockedHair) {
        this.lastHairUnlockLevel = this.level;
        notifications.show(`New hair style unlocked: ${unlockedHair.type} ${unlockedHair.id}`);
      }
    }
    
    // Check for item unlock
    if (this.level >= CHARACTER_SYSTEM.MIN_LEVEL_FOR_ITEM &&
        this.level - this.lastItemUnlockLevel >= CHARACTER_SYSTEM.ITEM_COOLDOWN_LEVELS &&
        Math.random() < CHARACTER_SYSTEM.ITEM_UNLOCK_CHANCE) {
      const unlockedItem = this.unlockRandomItem();
      if (unlockedItem) {
        this.lastItemUnlockLevel = this.level;
        notifications.show(`New item unlocked: ${unlockedItem.name}`);
      }
    }
    
    // Check for skill level up
    if (this.level - this.lastSkillLevelUp >= CHARACTER_SYSTEM.SKILL_COOLDOWN_LEVELS &&
        Math.random() < CHARACTER_SYSTEM.SKILL_LEVEL_UP_CHANCE &&
        this.skillLevel < CHARACTER_SYSTEM.MAX_SKILL_LEVEL) {
      this.skillLevel++;
      this.lastSkillLevelUp = this.level;
      notifications.show(`Skill level increased to ${this.skillLevel}`);
    }
  }

  unlockRandomSkill() {
    const availableSkills = CHARACTER_SKILLS.filter(skill => 
      !this.unlockedSkills.includes(skill.id)
    );
    
    if (availableSkills.length > 0) {
      const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
      this.unlockedSkills.push(randomSkill.id);
      return randomSkill;
    }
    
    return null;
  }

  unlockRandomHairStyle() {
    const availableFrontHairs = [];
    const availableBackHairs = [];
    
    // Find all front hair styles not yet unlocked
    for (let i = 1; i <= CHARACTER_SYSTEM.HAIR_STYLES.front; i++) {
      if (!Account.characters.unlockedHairs.front.includes(i)) {
        availableFrontHairs.push(i);
      }
    }
    
    // Find all back hair styles not yet unlocked
    for (let i = 1; i <= CHARACTER_SYSTEM.HAIR_STYLES.back; i++) {
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
    const allItems = [
      ...CHARACTER_ITEMS.clothing,
      ...CHARACTER_ITEMS.accessories
    ];
    
    const availableItems = allItems.filter(item => 
      !Account.characters.unlockedItems.includes(item.id)
    );
    
    if (availableItems.length > 0) {
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      
      // Add to Account's unlocked items
      Account.characters.unlockedItems.push(randomItem.id);
      
      // Save to localStorage
      localStorage.setItem("Account", JSON.stringify(Account));
      
      return randomItem;
    }
    
    return null;
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

  changeClothing(itemId) {
    if (Account.characters.unlockedItems.includes(itemId)) {
      const item = CHARACTER_ITEMS.clothing.find(i => i.id === itemId) || 
                   CHARACTER_ITEMS.accessories.find(i => i.id === itemId);
      if (item) {
        if (item.type === 'clothing') {
          this.appearance.clothing = itemId;
        } else if (item.type === 'accessory') {
          this.appearance.accessory = itemId;
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
      stats: this.stats,
      lastSkillLevelUp: this.lastSkillLevelUp,
      lastHairUnlockLevel: this.lastHairUnlockLevel,
      lastItemUnlockLevel: this.lastItemUnlockLevel
    };
  }
}
