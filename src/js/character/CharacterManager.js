class CharacterManager {
  constructor() {
    this.characters = new Map();
    this.currentCharacter = null;
    this.loadFromAccount();
  }

  loadFromAccount() {
    if (!Account.characters) {
      Account.characters = JSON.parse(JSON.stringify(DEFAULT_ACCOUNT.characters));
    }

    Account.characters.list.forEach(charData => {
      const character = new Character(charData);
      this.characters.set(character.name, character);
    });
    
    if (Account.characters.currentCharacter) {
      this.currentCharacter = this.characters.get(Account.characters.currentCharacter) || 
                             this.characters.values().next().value;
    } else {
      this.currentCharacter = null;
    }
  }

  createCharacter(name, appearance = {}) {
    if (this.characters.has(name) || name.length > CHARACTER_SYSTEM.MAX_NAME_LENGTH) {
      return null;
    }

    const newCharacter = new Character({
      name: name,
      appearance: {
        skinTone: appearance.skinTone || 0,
        hairColor: appearance.hairColor || 0xFFFFFF,
        frontHair: appearance.frontHair || "1",
        backHair: appearance.backHair || "1",
        clothing: appearance.clothing || "school_uniform",
        accessory: appearance.accessory || null
      }
    });

    this.characters.set(name, newCharacter);
    Account.characters.list.push(newCharacter.toJSON());
    saveAccount();

    return newCharacter;
  }

  deleteCharacter(name) {
    if (this.characters.size <= 1) this.unsetCharacter;
    
    const deleted = this.characters.delete(name);
    if (deleted) {
      Account.characters.list = Account.characters.list.filter(char => char.name !== name);
      
      if (Account.characters.currentCharacter === name) {
        Account.characters.currentCharacter = this.characters.keys().next().value;
        this.currentCharacter = this.characters.get(Account.characters.currentCharacter);
      }
      
      saveAccount();
    }
    
    return deleted;
  }
  
  unsetCharacter() {
    this.currentCharacter = null;
    Account.characters.currentCharacter = null;
    saveAccount();
  }

  setCurrentCharacter(name) {
    const character = this.characters.get(name);
    if (character) {
      this.currentCharacter = character;
      Account.characters.currentCharacter = name;
      saveAccount();
      return true;
    }
    return false;
  }

  updateCharacterStats(gameResults) {
    if (!this.currentCharacter) return 0;

    const char = this.currentCharacter;
    char.stats.gamesPlayed++;
    char.stats.totalScore += gameResults.score;
    char.stats.maxCombo = Math.max(char.stats.maxCombo, gameResults.maxCombo);
    
    if (gameResults.accuracy >= 100) {
      char.stats.perfectGames++;
    }

    char.stats.skillsUsed += gameResults.skillsUsed || 0;

    const expGain = this.calculateExperienceGain(gameResults);
    char.addExperience(expGain);

    const accountChar = Account.characters.list.find(c => c.name === char.name);
    if (accountChar) {
      Object.assign(accountChar, char.toJSON());
    }
    
    saveAccount();
    
    return expGain;
  }

  calculateExperienceGain(gameResults) {
    let exp = 0;
    
    // Minimum performance requirements - no experience for giving up early
    const totalNotes = Object.values(gameResults.judgements).reduce((a, b) => a + b, 0);
    
    // Require at least 25 notes played to get any experience
    if (totalNotes < 25) {
      return 0;
    }
    
    // Require minimum accuracy threshold (50%) to get any experience
    if (gameResults.accuracy < 40) {
      return 0;
    }
    
    // Base completion bonus (only if player completed meaningful portion of song)
    if (gameResults.accuracy >= 70) {
      exp += 2;
    }
    
    // Accuracy bonuses (only for decent to excellent performance)
    if (gameResults.accuracy >= 100) exp += 8;    // Impeccable 
    else if (gameResults.accuracy >= 99) exp += 6; // Nearly perfect
    else if (gameResults.accuracy >= 97) exp += 5; // Excellent
    else if (gameResults.accuracy >= 95) exp += 4; // Great
    else if (gameResults.accuracy >= 90) exp += 3; // Good
    else if (gameResults.accuracy >= 85) exp += 2; // Decent
    else if (gameResults.accuracy >= 80) exp += 1; // Okay
    // 70-79% gets base completion only
    
    // Combo milestones (only meaningful chains)
    if (gameResults.maxCombo >= 1000) exp += 8;   // Incredible
    else if (gameResults.maxCombo >= 500) exp += 6; // Amazing
    else if (gameResults.maxCombo >= 250) exp += 4; // Impressive
    else if (gameResults.maxCombo >= 100) exp += 3; // Solid
    else if (gameResults.maxCombo >= 50) exp += 2;  // Good chain
    // No bonus for chains under 50
    
    // Full combo bonus (significant reward for perfect play)
    if (gameResults.maxCombo > 0 && gameResults.judgements.miss === 0) {
      exp += 8;
      
      // Perfect game bonus (all marvelous/perfect)
      const perfectNotes = (gameResults.judgements.marvelous || 0) + (gameResults.judgements.perfect || 0);
      if (perfectNotes === totalNotes) {
        exp += 4; // Perfect game bonus
      }
    }
    
    // Judgement quality bonus (only for high precision)
    if (totalNotes > 0) {
      const marvelousRate = (gameResults.judgements.marvelous || 0) / totalNotes;
      const perfectRate = (gameResults.judgements.perfect || 0) / totalNotes;
      
      if (marvelousRate >= 0.8) exp += 3;        // Mostly marvelous
      else if (marvelousRate >= 0.6) exp += 2;   // Many marvelous
      else if (perfectRate >= 0.9) exp += 2;     // Very consistent
      // No bonus for lower precision rates
    }
    
    // Difficulty multiplier (scaled down)
    if (gameResults.difficultyRating) {
      if (gameResults.difficultyRating >= 11) exp += 3;    // Expert
      else if (gameResults.difficultyRating >= 9) exp += 2; // Hard
      else if (gameResults.difficultyRating >= 5) exp += 1;  // Medium
      // Easy gets no extra bonus
    }
    
    // Skill usage bonus (small incentive)
    if (gameResults.skillsUsed > 0) {
      exp += gameResults.skillsUsed; // Up to 5 exp for skill usage
    }
    
    return exp;
}

  unlockHair(type, id) {
    if (!Account.characters.unlockedHairs[type].includes(id)) {
      Account.characters.unlockedHairs[type].push(id);
      saveAccount();
      return true;
    }
    return false;
  }

  unlockItem(itemId) {
    if (!Account.characters.unlockedItems.includes(itemId)) {
      Account.characters.unlockedItems.push(itemId);
      saveAccount();
      return true;
    }
    return false;
  }

  getCharacterList() {
    return Array.from(this.characters.values());
  }

  getCurrentCharacter() {
    return this.currentCharacter;
  }

  saveToAccount() {
    Account.characters.list = this.getCharacterList().map(char => char.toJSON());
    Account.characters.currentCharacter = this.currentCharacter ? this.currentCharacter.name : null;
    saveAccount();
  }
}
