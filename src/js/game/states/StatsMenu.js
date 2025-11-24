class StatsMenu {
  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    new BackgroundGradient();
    
    this.titleText = new Text(92, 8, "PLAYER STATISTICS");
    this.titleText.anchor.x = 0.5;
    
    this.leftColumn = new Text(8, 56, "");
    this.leftColumn.anchor.y = 0.5;
    
    this.rightColumn = new Text(92, 56, "");
    this.rightColumn.anchor.y = 0.5;
    
    this.instructionText = new Text(92, 92, "PRESS ANY KEY TO LEAVE");
    this.instructionText.anchor.x = 0.5;
    
    this.updateStatsText();
    
    // Update stats for real-time updates
    this.updateTimer = game.time.events.loop(100, this.updateStatsText, this);
    
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
    
    let leftColumnText = "";
    let rightColumnText = "";
    
    // Left column - General Stats
    leftColumnText += `Games Played: ${stats.totalGamesPlayed}\n`;
    leftColumnText += `Total Score: ${stats.totalScore.toLocaleString()}\n`;
    leftColumnText += `Max Combo: ${stats.maxCombo}\n`;
    leftColumnText += `Perfect Games: ${stats.perfectGames}\n`;
    leftColumnText += `Characters: ${stats.charactersCreated}\n`;
    leftColumnText += `Max Level: ${stats.maxCharacterLevel}\n`;
    leftColumnText += `Skills Unlocked: ${stats.skillsUnlocked}\n`;
    
    // Right column - Time & Progression Stats
    rightColumnText += `Total Time: ${this.formatTime(stats.totalTimePlayed)}\n`;
    rightColumnText += `Play Sessions: ${stats.totalPlaySessions}\n`;
    rightColumnText += `Avg Session: ${this.formatSessionTime(stats.averageSessionTime)}\n`;
    rightColumnText += `Longest Session: ${this.formatSessionTime(stats.longestSession)}\n`;
    rightColumnText += `Current Streak: ${stats.currentStreak} days\n`;
    rightColumnText += `Longest Streak: ${stats.longestStreak} days\n`;
    rightColumnText += `High Scores: ${stats.highScoresSet}\n`;

    this.leftColumn.write(leftColumnText);
    this.rightColumn.write(rightColumnText);
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