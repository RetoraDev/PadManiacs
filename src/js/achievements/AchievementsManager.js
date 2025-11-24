class AchievementsManager {
  constructor() {
    this.newAchievements = [];

    // Time tracking properties
    this.timeUpdateInterval = null;
    this.sessionStartTime = null;
    this.lastUpdateTime = null;
    this.isTracking = false;
  }

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

    // Update sub systems
    setInterval(() => this.update(), 2);

    console.log("Achievements Manager initialized");
  }

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

  startTimeTracking() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }

    this.timeUpdateInterval = setInterval(() => {
      this.updateTimeStats();
    }, 100);

    this.isTracking = true;
  }

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

      // Check for time-based achievements every minute
      if (elapsedSeconds >= 60 || this.lastUpdateTime % 60000 < 1000) {
        this.checkTimeBasedAchievements();
      }
    }
  }

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

  checkTimeBasedConditions() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

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
    const month = now.getMonth();
    const date = now.getDate();
    const isHoliday = this.isHoliday(month, date);
    if (isHoliday) {
      Account.stats.playedHoliday = true;
    }
  }

  checkTimeBasedAchievements() {
    // Check achievements that depend on total time played
    this.checkAchievements();
  }

  isHoliday(month, date) {
    // Comprehensive holiday detection (US holidays)
    const holidays = {
      0: [1], // January: New Year's Day (1st)
      1: [14], // February: Valentine's Day (14th)
      2: [17], // March: St. Patrick's Day (17th)
      4: [5], // May: Cinco de Mayo (5th)
      5: [14], // June: Flag Day (14th)
      6: [4], // July: Independence Day (4th)
      8: [11], // September: 9/11 Memorial
      9: [31], // October: Halloween (31st)
      10: [11, 25], // November: Veterans Day (11th), Thanksgiving (25th-ish)
      11: [24, 25, 31] // December: Christmas Eve, Christmas, New Year's Eve
    };

    return holidays[month] && holidays[month].includes(date);
  }

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

  onPageHide() {
    // Page is being hidden - pause time tracking
    this.isTracking = false;
    console.log("Page hidden - time tracking paused");
  }

  onPageShow() {
    // Page is visible again - resume time tracking
    if (!this.isTracking) {
      this.lastUpdateTime = Date.now();
      this.isTracking = true;
      console.log("Page visible - time tracking resumed");
    }
  }

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

    console.log("Play session ended");
  }

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
            isExternal: false, // Flag for external songs
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

  awardAchievementExp(achievement) {
    if (achievement.expReward > 0) {
      const characterManager = new CharacterManager();
      const currentCharacter = characterManager.getCurrentCharacter();

      if (currentCharacter) {
        currentCharacter.addExperience(achievement.expReward);

        const { levelBefore, levelAfter, expBefore, expAfter } = currentCharacter.getLastExperienceStoryEntry();

        // Show exp gain notification
        //notifications.showExpGain(currentCharacter, achievement.expReward, levelBefore, levelAfter, expBefore, expAfter);

        characterManager.saveToAccount();
      }
    }
  }

  getUnlockedAchievements() {
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => Account.achievements.unlocked[achievement.id]);
  }

  getLockedAchievements() {
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => !Account.achievements.unlocked[achievement.id] && !achievement.hidden);
  }

  getHiddenAchievements() {
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => achievement.hidden && !Account.achievements.unlocked[achievement.id]);
  }

  getAchievementProgress(achievementId) {
    return Account.achievements.progress[achievementId] || 0;
  }

  getTotalUnlockedCount() {
    return Object.keys(Account.achievements.unlocked).length;
  }

  getTotalAchievementsCount() {
    return ACHIEVEMENT_DEFINITIONS.length;
  }

  getCompletionPercentage() {
    const total = this.getTotalAchievementsCount();
    const unlocked = this.getTotalUnlockedCount();
    return total > 0 ? Math.floor((unlocked / total) * 100) : 0;
  }

  getTimePlayedFormatted() {
    return this.formatTime(Account.stats.totalTimePlayed);
  }

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

  getCurrentSessionTime() {
    if (!this.sessionStartTime) return 0;
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }

  update() {}

  forceSave() {
    this.saveSessionState();
  }

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
