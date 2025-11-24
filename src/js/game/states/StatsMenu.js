class StatsMenu {
  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    new BackgroundGradient();
    
    this.statsText = new Text(40, 8, "");
    this.updateStatsText();
    
    // Update stats every 500ms for real-time updates
    this.updateTimer = game.time.events.loop(500, this.updateStatsText, this);
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  formatSessionTime(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  updateStatsText() {
    if (!Account.stats) return;
    
    const stats = Account.stats;
    
    let text = "PLAYER STATISTICS\n\n";
    
    // Left column - General Stats
    text += `Games Played: ${stats.totalGamesPlayed}\n`;
    text += `Total Score: ${stats.totalScore.toLocaleString()}\n`;
    text += `Max Combo: ${stats.maxCombo}\n`;
    text += `Perfect Games: ${stats.perfectGames}\n`;
    text += `Characters: ${stats.charactersCreated}\n`;
    text += `Max Level: ${stats.maxCharacterLevel}\n`;
    text += `Skills Unlocked: ${stats.skillsUnlocked}\n\n`;
    
    // Right column - Time & Progression Stats
    text += `Total Time: ${this.formatTime(stats.totalTimePlayed)}\n`;
    text += `Play Sessions: ${stats.totalPlaySessions}\n`;
    text += `Avg Session: ${this.formatSessionTime(stats.averageSessionTime)}\n`;
    text += `Longest Session: ${this.formatSessionTime(stats.longestSession)}\n`;
    text += `Current Streak: ${stats.currentStreak} days\n`;
    text += `Longest Streak: ${stats.longestStreak} days\n`;
    text += `High Scores: ${stats.highScoresSet}\n`;

    this.statsText.write(text);
  }

  update() {
    gamepad.update();
    
    // Press any key to go back
    if (gamepad.pressed.any) {
      game.state.start("MainMenu");
    }
  }
  
  shutdown() {
    if (this.updateTimer) {
      game.time.events.remove(this.updateTimer);
    }
  }
}