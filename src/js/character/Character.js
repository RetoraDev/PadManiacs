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
    this.lastSkillLevelUp = data.lastSkillLevelUp || 0;
  }

  addExperience(amount) {
    this.experience += amount;
    const requiredExp = CHARACTER_SYSTEM.EXPERIENCE_CURVE(this.level);
    
    while (this.experience >= requiredExp) {
      this.levelUp();
      this.experience -= requiredExp;
    }
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
      lastSkillLevelUp: this.lastSkillLevelUp
    };
  }
}