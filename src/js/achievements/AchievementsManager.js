/**
 * @class AchievementsManager
 * @category Achievements and Stats Classes
 * @summary Achievement tracking, unlocking, and stats management
 * @constructor
 * @features
 * Tracks play time with a high-frequency interval timer
 * Evaluates achievement conditions against live player stats
 * Manages daily play streaks and holiday detection
 * Persists session state across page visibility changes
 * Awards experience to the current character on unlock
 * @description
 * AchievementsManager maintains the player's statistics, play streak, and
 * session timing throughout the game session. It periodically evaluates all
 * achievement definitions against the current stats, unlocks any that are
 * newly satisfied, awards experience, and triggers in-game notifications.
 * It also handles page visibility events to pause and resume time tracking
 * correctly.
 * @example
 * // Initialising and checking achievements after a song
 * const mgr = new AchievementsManager();
 * mgr.initialize();
 * // After a gameplay result:
 * const newAchievements = mgr.updateStats(gameResults);
 * newAchievements.forEach(a => console.log('Unlocked:', a.name));
 */
class AchievementsManager {
  constructor() {
    /** @type {Array<Object>} Achievements unlocked this session */
    this.newAchievements = [];

    // Time tracking properties
    this.timeUpdateInterval = null;
    this.sessionStartTime = null;
    this.lastUpdateTime = null;
    this.isTracking = false;
  }

  /**
   * Initialises achievement progress, stats, holiday definitions, and session tracking.
   */
  initialize() {
    // Initialize achievements progress if not exists
    if (!Account.achievements) {
      Account.achievements = {
        unlocked: {},
        progress: {}
      };
    }

    // Initialize stats if not exists
    if (!Account.stats) {
      Account.stats = JSON.parse(JSON.stringify(DEFAULT_ACCOUNT.stats));
    }
    
    // Add holidays to achievement definitions
    const holidays = this.getHolidays();
    for (let monthId = 0; monthId <= 11; monthId ++) {
      const month = holidays[monthId];
      
      if (!month) continue;
      
      for (let dateId = 0; dateId <= 31; dateId ++) {
        const dateName = month[dateId];
        
        if (dateName) ACHIEVEMENT_DEFINITIONS.push({
          id: `holiday_day_${monthId}_${dateId}`,
          name: dateName,
          category: ACHIEVEMENT_CATEGORIES.HOLIDAYS,
          description: {
            unachieved: __(`Play on ${dateName} (${dateId}/${monthId})||Jugar en ${dateName} (${dateId}/${monthId})`),
            achieved: __(`You played on ${dateName}!||¡Jugaste en ${dateName}!`)
          },
          expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
          condition: () => {
            const { month, date } = this.getDate();
            return monthId === month && dateId === date;
          },
          hidden: false
        });
      }
    }

    // Initialize all achievements progress
    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
      if (!Account.achievements.progress[achievement.id]) {
        Account.achievements.progress[achievement.id] = 0;
      }
    });

    // Start new session
    this.startSession();

    // Start time tracking
    this.startTimeTracking();

    // Set up window event listeners for session management
    this.setupWindowEvents();

    console.log("Achievements Manager initialized");
  }

  /**
   * Starts a new play session, incrementing session counters and updating the streak.
   */
  startSession() {
    this.sessionStartTime = Date.now();
    this.lastUpdateTime = this.sessionStartTime;

    // Only count as new session if not resuming
    if (!Account.stats.currentSessionStart) {
      Account.stats.totalPlaySessions++;
      Account.stats.currentSessionStart = this.sessionStartTime;
    }

    this.updatePlayStreak();
    this.checkTimeBasedConditions();

    console.log("New play session started");
  }

  /**
   * Begins the periodic time tracking interval that updates play time stats.
   */
  startTimeTracking() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }

    this.timeUpdateInterval = setInterval(() => {
      this.updateTimeStats();
    }, 100);

    this.isTracking = true;
  }

  /**
   * Called on each timer tick to accumulate play time and check achievements periodically.
   */
  updateTimeStats() {
    if (!this.isTracking || !this.sessionStartTime) return;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - this.lastUpdateTime) / 1000);

    if (elapsedSeconds > 0) {
      // Update total time played
      Account.stats.totalTimePlayed += elapsedSeconds;

      // Update current session duration for longest session tracking
      const currentSessionDuration = Math.floor((now - this.sessionStartTime) / 1000);
      if (currentSessionDuration > Account.stats.longestSession) {
        Account.stats.longestSession = currentSessionDuration;
      }

      this.lastUpdateTime = now;

      // Update Achievements every minute
      if (elapsedSeconds >= 60 || this.lastUpdateTime % 60000 < 1000) {
        this.checkAchievements();
      }
    }
  }

  /**
   * Updates the daily play streak based on the last played date.
   */
  updatePlayStreak() {
    const now = new Date();
    const today = now.toDateString();
    const lastPlayed = Account.stats.lastPlayedDate;

    if (!lastPlayed) {
      // First time playing
      Account.stats.currentStreak = 1;
      Account.stats.longestStreak = Math.max(Account.stats.longestStreak, 1);
    } else {
      const lastPlayedDate = new Date(lastPlayed);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastPlayedDate.toDateString() === yesterday.toDateString()) {
        // Consecutive day
        Account.stats.currentStreak++;
        Account.stats.longestStreak = Math.max(Account.stats.longestStreak, Account.stats.currentStreak);
      } else if (lastPlayedDate.toDateString() !== today) {
        // Streak broken
        Account.stats.currentStreak = 1;
      }
    }

    Account.stats.lastPlayedDate = today;
  }

  /**
   * Evaluates time-of-day and holiday conditions for the current session.
   */
  checkTimeBasedConditions() {
    const { now, currentHour, currentDay, month, date } = this.getDate();
        
    // Early morning (5 AM - 9 AM)
    if (currentHour >= 5 && currentHour < 9) {
      Account.stats.playedEarlyMorning = true;
    }

    // Night (midnight - 4 AM)
    if (currentHour >= 0 && currentHour < 4) {
      Account.stats.playedAtNight = true;
    }

    // Weekend (Saturday or Sunday)
    if (currentDay === 0 || currentDay === 6) {
      Account.stats.playedWeekend = true;
    }

    // Holiday detection
    const isHoliday = this.isHoliday(month, date);
    if (isHoliday) {
      Account.stats.playedHoliday = true;
    }
  }
  
  /**
   * Returns the current date breakdown needed for time-based achievement checks.
   * @returns {Object} An object with now, currentHour, currentDay, month, and date
   */
  getDate() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const month = now.getMonth();
    const date = now.getDate();
    return { now, currentHour, currentDay, month, date };
  }

  /**
   * Returns the full holiday calendar mapping months and dates to holiday names.
   * @returns {Object} Nested object keyed by month (0-11) then date (1-31)
   */
  getHolidays() {
    // Comprehensive holiday calendar
    return {
      0: {
        1: __("New Year's Day||Año Nuevo")
      },
      1: {
        14: __("Valentine's Day||Día de San Valentín")
      },
      2: {
        17: __("St. Patrick's Day||Día de San Patricio")
      },
      3: {
        // April
      },
      4: {
        5: __("Cinco de Mayo||Cinco de Mayo")
      },
      5: {
        14: __("Flag Day||Día de la Bandera")
      },
      6: {
        4: __("Independence Day||Día de la Independencia")
      },
      7: {
        // August
      },
      8: {
        11: __("9/11 Memorial||Memorial del 11-S")
      },
      9: {
        26: __("PadManiacs Day||Día de PadManiacs"),
        31: __("Halloween||Halloween")
      },
      10: {
        11: __("Veterans Day||Día de los Veteranos"),
        25: __("39 Giving||39 Giving")
      },
      11: {
        24: __("Christmas Eve||Nochebuena"),
        25: __("Christmas||Navidad"),
        31: __("New Year's Eve||Nochevieja")
      } 
    }
  }

  /**
   * Returns the localised name of a holiday for a given month and date.
   * @param {number} month - The month (0-11)
   * @param {number} date - The day of the month (1-31)
   * @returns {string|null} The holiday name or null if not a holiday
   */
  getHolidayName(month, date) {
    const holidays = this.getHolidays();
    if (holidays[month]) {
      const currentDate = holidays[month][date];
      if (currentDate) {
        return currentDate;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  /**
   * Checks whether a given month and date corresponds to a known holiday.
   * @param {number} month - The month (0-11)
   * @param {number} date - The day of the month (1-31)
   * @returns {boolean} True if the date is a holiday
   */
  isHoliday(month, date) {
    const holidays = this.getHolidays();
    return holidays[month] && holidays[month][date] !== undefined;
  }

  /**
   * Attaches DOM event listeners for page visibility and unload to manage session state.
   */
  setupWindowEvents() {
    // Handle page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.onPageHide();
      } else {
        this.onPageShow();
      }
    });

    // Handle page unload
    window.addEventListener("beforeunload", () => {
      this.endSession();
    });

    // Handle page freeze (some mobile browsers)
    document.addEventListener("freeze", () => {
      this.onPageHide();
    });

    document.addEventListener("resume", () => {
      this.onPageShow();
    });
  }

  /**
   * Pauses time tracking when the page becomes hidden.
   */
  onPageHide() {
    // Page is being hidden - pause time tracking
    this.isTracking = false;
    console.log("Page hidden - time tracking paused");
  }

  /**
   * Resumes time tracking when the page becomes visible again.
   */
  onPageShow() {
    // Page is visible again - resume time tracking
    if (!this.isTracking) {
      this.lastUpdateTime = Date.now();
      this.isTracking = true;
      console.log("Page visible - time tracking resumed");
    }
  }

  /**
   * Ends the current play session, finalising stats and saving to account.
   */
  endSession() {
    // Final time update
    this.updateTimeStats();

    // Clear intervals
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }

    // Update average session time
    if (Account.stats.totalPlaySessions > 0) {
      Account.stats.averageSessionTime = Math.floor(Account.stats.totalTimePlayed / Account.stats.totalPlaySessions);
    }

    // Clear current session
    Account.stats.currentSessionStart = null;

    this.isTracking = false;
    this.sessionStartTime = null;
    
    saveAccount();

    console.log("Play session ended");
  }

  /**
   * Updates stats with gameplay results and checks for newly unlocked achievements.
   * @param {Object} [gameResults] - The results object from a completed song
   * @returns {Array<Object>} Any achievements unlocked during this call
   */
  updateStats(gameResults = null) {
    if (!Account.stats) return;

    if (gameResults) {
      this.updateGameStats(gameResults);
    }

    // Update play streak periodically (once per minute)
    const now = Date.now();
    if (!this.lastStreakUpdate || now - this.lastStreakUpdate > 60000) {
      this.updatePlayStreak();
      this.lastStreakUpdate = now;
    }

    // Check for new achievements
    const newAchievements = this.checkAchievements();

    if (newAchievements.length > 0) {
      console.log(`Unlocked ${newAchievements.length} new achievements`);
    }

    return newAchievements;
  }

  /**
   * Records gameplay statistics from a completed song into Account.stats.
   * @param {Object} gameResults - The results object with score, judgements, etc.
   */
  updateGameStats(gameResults) {
    if (Account.settings.autoplay) return;

    Account.stats.totalGamesPlayed++;
    Account.stats.totalScore += gameResults.score;
    Account.stats.maxCombo = Math.max(Account.stats.maxCombo, gameResults.maxCombo);

    if (gameResults.accuracy >= 100) {
      Account.stats.perfectGames++;
    }

    // Update judgement counts
    const judgements = gameResults.judgements || {};
    Account.stats.totalNotesHit += Object.values(judgements).reduce((a, b) => a + b, 0);
    Account.stats.totalMarvelous += judgements.marvelous || 0;
    Account.stats.totalPerfect += judgements.perfect || 0;
    Account.stats.totalGreat += judgements.great || 0;
    Account.stats.totalGood += judgements.good || 0;
    Account.stats.totalBoo += judgements.boo || 0;
    Account.stats.totalMiss += judgements.miss || 0;

    // Update max values
    Account.stats.maxMarvelousInGame = Math.max(Account.stats.maxMarvelousInGame, judgements.marvelous || 0);

    Account.stats.maxSkillsInGame = Math.max(Account.stats.maxSkillsInGame, gameResults.skillsUsed || 0);

    // Update character stats if available
    if (gameResults.character) {
      Account.stats.maxCharacterLevel = Math.max(Account.stats.maxCharacterLevel, gameResults.character.level || 1);

      Account.stats.skillsUnlocked = Math.max(Account.stats.skillsUnlocked, gameResults.character.unlockedSkills?.length || 0);
    }
  }

  /**
   * Evaluates all achievement definitions and unlocks any that are newly satisfied.
   * @returns {Array<Object>} Array of achievement objects that were just unlocked
   */
  checkAchievements() {
    const newlyUnlocked = [];

    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
      if (!Account.achievements.unlocked[achievement.id]) {
        const progress = achievement.condition(
          Account.stats,
          Account.lastSong || {
            url: null,
            title: "",
            artist: "",
            sampleStart: 0,
            isExternal: false,
            score: 0,
            accuracy: 0,
            maxCombo: 0,
            judgements: {
              marvelous: 0,
              perfect: 0,
              great: 0,
              good: 0,
              boo: 0,
              miss: 0
            },
            totalNotes: 0,
            skillsUsed: 0,
            difficultyRating: 0,
            complete: false
          }
        );

        if (progress && !Account.achievements.unlocked[achievement.id]) {
          // Unlock achievement
          Account.achievements.unlocked[achievement.id] = {
            unlockedAt: Date.now(),
            expReward: achievement.expReward
          };

          newlyUnlocked.push(achievement);

          saveAccount();

          // Show notification
          notifications.showAchievement(achievement);

          // Award experience to current character if available
          this.awardAchievementExp(achievement);
        }
      }
    });

    this.newAchievements = newlyUnlocked;
    return newlyUnlocked;
  }

  /**
   * Awards the achievement experience reward to the current character.
   * @param {Object} achievement - The achievement definition with expReward
   */
  awardAchievementExp(achievement) {
    if (achievement.expReward > 0) {
      const characterManager = new CharacterManager();
      const currentCharacter = characterManager.getCurrentCharacter();

      if (currentCharacter) {
        currentCharacter.addExperience(achievement.expReward);
        characterManager.saveToAccount();
      }
    }
  }

  /**
   * Returns all achievements that have been unlocked.
   * @returns {Array<Object>} Filtered achievement definitions
   */
  getUnlockedAchievements() {
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => Account.achievements.unlocked[achievement.id]);
  }

  /**
   * Returns non-hidden achievements that have not yet been unlocked.
   * @returns {Array<Object>} Filtered achievement definitions
   */
  getLockedAchievements() {
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => !Account.achievements.unlocked[achievement.id] && !achievement.hidden);
  }

  /**
   * Returns hidden achievements that have not yet been unlocked.
   * @returns {Array<Object>} Filtered achievement definitions
   */
  getHiddenAchievements() {
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => achievement.hidden && !Account.achievements.unlocked[achievement.id]);
  }

  /**
   * Returns the stored progress value for a specific achievement.
   * @param {string} achievementId - The achievement ID
   * @returns {number} The progress value
   */
  getAchievementProgress(achievementId) {
    return Account.achievements.progress[achievementId] || 0;
  }

  /**
   * Returns the total number of achievements that have been unlocked.
   * @returns {number} The unlocked count
   */
  getTotalUnlockedCount() {
    return Object.keys(Account.achievements.unlocked).length;
  }

  /**
   * Returns the total number of achievement definitions.
   * @returns {number} The total count
   */
  getTotalAchievementsCount() {
    return ACHIEVEMENT_DEFINITIONS.length;
  }

  /**
   * Calculates the achievement completion percentage as a whole number.
   * @returns {number} The percentage from 0 to 100
   */
  getCompletionPercentage() {
    const total = this.getTotalAchievementsCount();
    const unlocked = this.getTotalUnlockedCount();
    return total > 0 ? Math.floor((unlocked / total) * 100) : 0;
  }

  /**
   * Returns the total time played formatted as a human-readable string.
   * @returns {string} Formatted time string (e.g. "2h 15m 30s")
   */
  getTimePlayedFormatted() {
    return this.formatTime(Account.stats.totalTimePlayed);
  }

  /**
   * Converts a number of seconds into a human-readable time string.
   * @param {number} seconds - The total seconds to format
   * @returns {string} Formatted string (e.g. "1h 5m 3s" or "42s")
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Returns the duration of the current session in seconds.
   * @returns {number} Seconds elapsed since the session started
   */
  getCurrentSessionTime() {
    if (!this.sessionStartTime) return 0;
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }
  
  /**
   * Forces an immediate save of the current session state to the account.
   */
  forceSave() {
    this.saveSessionState();
  }

  /**
   * Ends the session and removes all DOM event listeners.
   */
  destroy() {
    this.endSession();

    // Clean up event listeners
    document.removeEventListener("visibilitychange", this.onPageHide);
    document.removeEventListener("visibilitychange", this.onPageShow);
    document.removeEventListener("freeze", this.onPageHide);
    document.removeEventListener("resume", this.onPageShow);
    window.removeEventListener("beforeunload", this.endSession);

    console.log("Achievements Manager destroyed");
  }
}