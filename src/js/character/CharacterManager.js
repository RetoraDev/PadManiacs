/**
 * @class CharacterManager
 * @category Character System Classes
 * @summary Manages multiple characters and persistence
 * @constructor
 * @features
 * Character creation, deletion, and selection
 * Load and save of characters to the account
 * Experience gain calculation from game results
 * Statistics and personality updates after each game
 * @description
 * Coordinates the character roster stored on the player's account, creating, deleting,
 * selecting, and persisting characters while updating their stats after gameplay sessions.
 * @example
 * // Modding usage example
 * const mgr = new CharacterManager();
 * const hero = mgr.createCharacter('Hero', { skinTone: 0 });
 * mgr.setCurrentCharacter('Hero');
 * const exp = mgr.updateCharacterStats(gameResults);
 * console.log(mgr.getCharacterList());
 */
class CharacterManager {
  constructor() {
    /** @type {Map} Character instances keyed by name */
    this.characters = new Map();
    /** @type {Object|null} Currently active character */
    this.currentCharacter = null;
    this.loadFromAccount();
  }

  /**
   * Rebuilds the character roster and current selection from the stored account data.
   */
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

  /**
   * Creates and persists a new character if the name is free and within the length limit.
   * @param {string} name - The new character's name
   * @param {Object} [appearance] - Initial appearance settings
   * @returns {Character|null} The created character or null on failure
   */
  createCharacter(name, appearance = {}) {
    if (this.characters.has(name) || name.length > CHARACTER_SYSTEM.MAX_NAME_LENGTH) {
      return null;
    }

    const newCharacter = new Character({
      name: name,
      appearance
    });

    this.characters.set(name, newCharacter);
    Account.characters.list.push(newCharacter.toJSON());
    saveAccount();

    return newCharacter;
  }

  /**
   * Removes a character from the roster and updates the account and current selection.
   * @param {string} name - Name of the character to delete
   * @returns {boolean} Whether the character was deleted
   */
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
  
  /**
   * Clears the current character selection and persists the change to the account.
   */
  unsetCharacter() {
    this.currentCharacter = null;
    Account.characters.currentCharacter = null;
    saveAccount();
  }

  /**
   * Makes a character the active roster selection.
   * @param {string} name - Name of the character to select
   * @returns {boolean} Whether the selection succeeded
   */
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

  /**
   * Applies game results to the current character's stats, experience, and personality.
   * @param {Object} gameResults - Results from a completed game session
   * @returns {number} Experience gained during the update
   */
  updateCharacterStats(gameResults) {
    if (!this.currentCharacter) return 0;

    const char = this.currentCharacter;
    char.stats.gamesPlayed++;
    char.stats.totalScore += gameResults.score;
    char.stats.maxCombo = Math.max(char.stats.maxCombo, gameResults.maxCombo);
    
    if (gameResults.accuracy >= 99) {
      char.stats.perfectGames++;
    }

    char.stats.skillsUsed += gameResults.skillsUsed || 0;

    const expGain = this.calculateExperienceGain(gameResults);
    char.addExperience(expGain);

    const developedPersonality = char.studyPersonalities(gameResults);
    
    const accountChar = Account.characters.list.find(c => c.name === char.name);
    if (accountChar) {
      Object.assign(accountChar, char.toJSON());
    }
    
    saveAccount();
    
    return expGain;
  }

  /**
   * Computes experience awarded from game results based on accuracy, combo, and difficulty.
   * @param {Object} gameResults - Results from a completed game session
   * @returns {number} The experience points earned
   */
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

  /**
   * Unlocks a hair style of the given type for the account if not already owned.
   * @param {string} type - Hair type, either 'front' or 'back'
   * @param {number} id - The hair style ID
   * @returns {boolean} Whether the unlock was applied
   */
  unlockHair(type, id) {
    if (!Account.characters.unlockedHairs[type].includes(id)) {
      Account.characters.unlockedHairs[type].push(id);
      saveAccount();
      return true;
    }
    return false;
  }

  /**
   * Unlocks a clothing item for the account if not already owned.
   * @param {string} itemId - The item identifier
   * @returns {boolean} Whether the unlock was applied
   */
  unlockItem(itemId) {
    if (!Account.characters.unlockedItems.includes(itemId)) {
      Account.characters.unlockedItems.push(itemId);
      saveAccount();
      return true;
    }
    return false;
  }

  /**
   * Returns all character instances in the roster.
   * @returns {Array} List of Character objects
   */
  getCharacterList() {
    return Array.from(this.characters.values());
  }

  /**
   * Returns the currently selected character instance.
   * @returns {Object|null} The active character or null
   */
  getCurrentCharacter() {
    return this.currentCharacter;
  }

  /**
   * Writes the full roster and current selection back to the account.
   */
  saveToAccount() {
    Account.characters.list = this.getCharacterList().map(char => char.toJSON());
    Account.characters.currentCharacter = this.currentCharacter ? this.currentCharacter.name : null;
    saveAccount();
  }
}
