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
    let exp = 0; // Base experience
    
    // Accuracy bonus
    if (gameResults.accuracy >= 95) exp += 5;
    else if (gameResults.accuracy >= 90) exp += 4;
    else if (gameResults.accuracy >= 80) exp += 3;
    
    // Combo bonus
    if (gameResults.maxCombo > 0) exp += 1;
    if (gameResults.maxCombo >= 500) exp += 5;
    if (gameResults.maxCombo >= 1000) exp += 10;
    if (gameResults.maxCombo >= 400) exp += 4;
    if (gameResults.maxCombo >= 100) exp += 3;
    else if (gameResults.maxCombo >= 50) exp += 2;
    
    // Full combo bonus
    if (gameResults.maxCombo > 0 && gameResults.judgements.miss === 0) exp += 8;
    
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
    console.log(Account.characters);
    saveAccount();
  }
}
