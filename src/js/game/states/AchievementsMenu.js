/**
 * @class AchievementsMenu
 * @category Game States
 * @summary Achievements viewing interface
 * @constructor
 * @features
 * Carousel of unlocked or locked achievements
 * Toggle between sections with the Select button
 * Detail pane with unlock dates and experience rewards
 * @description
 * The AchievementsMenu state displays the player's achievement progress in a
 * two-pane layout, listing names in a carousel and showing rich details for the
 * selected achievement. The Select button toggles between the unlocked and
 * locked sections, while canceling returns to the main menu.
 * @example
 * // Modding usage example
 * game.state.start("AchievementsMenu");
 *
 * // Inspect unlock status for a custom achievement id
 * Account.achievements.unlocked["custom_id"];
 */
class AchievementsMenu {
  /**
   * Sets up the carousel, detail text, and addon behaviors for the state.
   */
  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    new BackgroundGradient();
    
    /** @type {NavigationHint} On-screen overlay hinting button usage. */
    this.navigationHint = new NavigationHint('achievements');
    
    /** @type {boolean} Whether the list is showing unlocked achievements. */
    this.showingUnlocked = true;
    
    // Initialize details text first
    /** @type {Text} Details pane for the selected achievement. */
    this.detailsText = new Text(game.width / 2 + 8, 10, "");
    
    this.createMenu();
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  /**
   * Builds the achievements carousel and toggling header text.
   */
  createMenu() {
    const achievementsManager = new AchievementsManager();
    
    // Left side - Carousel menu
    const carouselWidth = game.width / 2;
    const carouselHeight = game.height - 12;
    
    /** @type {CarouselMenu} Carousel listing achievement names. */
    this.carousel = new CarouselMenu(0, 8, carouselWidth, carouselHeight, {
      bgcolor: '#9b59b6',
      fgcolor: '#ffffff',
      align: 'left',
      animate: true,
      disableConfirm: true,
      disableCancel: true
    });
    
    // Toggle button
    /** @type {Text} Header text showing the current achievements section. */
    this.toggleText = new Text(4, 3, __("Showing: Unlocked||Sección: Desbloqueados"));
    
    game.onMenuIn.dispatch('achievements', this.carousel);
    
    this.updateAchievementsList();
  }

  /**
   * Rebuilds the carousel for the currently selected achievements section.
   */
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

  /**
   * Writes the selected achievement's details into the detail pane.
   * @param {Object} achievement - The achievement descriptor to describe.
   */
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

  /**
   * Toggles between unlocked and locked sections with the Select button.
   */
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