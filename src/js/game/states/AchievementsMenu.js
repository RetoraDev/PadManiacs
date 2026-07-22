class AchievementsMenu {
  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    new BackgroundGradient();
    
    this.navigationHint = new NavigationHint('achievements');
    
    this.showingUnlocked = true;
    
    // Initialize details text first
    this.detailsText = new Text(game.width / 2 + 8, 10, "");
    
    this.createMenu();
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  createMenu() {
    const achievementsManager = new AchievementsManager();
    
    // Left side - Carousel menu
    const carouselWidth = game.width / 2;
    const carouselHeight = game.height - 12;
    
    this.carousel = new CarouselMenu(0, 8, carouselWidth, carouselHeight, {
      bgcolor: '#9b59b6',
      fgcolor: '#ffffff',
      align: 'left',
      animate: true,
      disableConfirm: true,
      disableCancel: true
    });
    
    // Toggle button
    this.toggleText = new Text(4, 3, __("Showing: Unlocked||Sección: Desbloqueados"));
    
    game.onMenuIn.dispatch('achievements', this.carousel);
    
    this.updateAchievementsList();
  }

  updateAchievementsList() {
    const achievementsManager = new AchievementsManager();
    
    const achievements = this.showingUnlocked ? 
      achievementsManager.getUnlockedAchievements() : 
      achievementsManager.getLockedAchievements();
    
    this.carousel.clear();
    
    if (achievements.length === 0) {
      this.carousel.addItem(
        this.showingUnlocked ? __("No achievements unlocked||Ningún logro desbloqueado") : __("No achievements available||No hay logros disponibles"),
        null,
        { bgcolor: '#34495e' }
      );
      if (this.detailsText) {
        this.detailsText.write("");
      }
    } else {
      achievements.forEach(achievement => {
        const status = this.showingUnlocked ? "✓" : "○";
        const displayName = `${status} ${achievement.name}`;
        
        this.carousel.addItem(
          displayName,
          null,
          { 
            achievement: achievement,
            bgcolor: this.showingUnlocked ? '#27ae60' : '#e74c3c'
          }
        );
      });
      
      // Show first achievement details
      if (achievements.length > 0 && this.detailsText) {
        this.showAchievementDetails(achievements[0]);
      }
    }
    
    if (this.toggleText) {
      this.toggleText.write(__("Showing: Unlocked||Sección: Desbloqueados"));
    }
    
    // Handle carousel selection
    this.carousel.onSelect.add((index, item) => {
      if (item.data && item.data.achievement) {
        this.showAchievementDetails(item.data.achievement);
      }
    });
    
    this.carousel.onCancel.add(() => {
      game.state.start("MainMenu");
    });
  }

  showAchievementDetails(achievement) {
    if (!this.detailsText) return;
    
    const achievementsManager = new AchievementsManager();
    const isUnlocked = Account.achievements.unlocked[achievement.id];
    
    let details = `${achievement.name}\n`;
    details += __(`(Category|Categoría): ${achievement.category}\n\n`);
    
    if (isUnlocked) {
      details += achievement.description.achieved + '\n\n';
      const unlockData = Account.achievements.unlocked[achievement.id];
      const unlockDate = new Date(unlockData.unlockedAt);
      details += __(`(Unlocked|Desbloqueado): ${unlockDate.toLocaleDateString()}\n`);
      details += __(`(Experience|Experiencia): +${unlockData.expReward}`);
    } else {
      details += achievement.description.unachieved + '\n\n';
      if (achievement.hidden) {
        details += __("(Hidden Achievement|Logro Oculto)");
      } else {
        details += __(`(Experience|Experiencia): +${achievement.expReward}`);
      }
    }
    
    this.detailsText.write(details).wrap(game.width / 2 - 16);
  }

  update() {
    gamepad.update();
    
    // Toggle between unlocked/locked with Select button
    if (gamepad.pressed.select && !this.lastSelect) {
      this.showingUnlocked = !this.showingUnlocked;
      this.updateAchievementsList();
    }
    this.lastSelect = gamepad.pressed.select;
  }
}