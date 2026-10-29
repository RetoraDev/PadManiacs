/**
 * @class LanguageSelect
 * @category Game States
 * @summary First-run language selection screen
 * @constructor
 * @features
 * Black screen with a centered Window frame
 * Flag spritesheet at src/assets/flags.png with two frames (English / Español)
 * Left/right arrows to change language
 * Language name text below the flag
 * Confirm with A or START
 * @description
 * The first-run language selection screen. Shown when Account.firstRun is true
 * before the game loads any songs. Displays a flag for the currently selected
 * language, lets the player switch between English and Spanish, and on confirm
 * saves the choice to the account and continues to load local songs.
 */
class LanguageSelect {
  /**
   * Phaser state hook that builds the language selection screen.
   */
  create() {
    game.camera.fadeIn(0x000000);

    /** @type {Array<Object>} Supported languages with their display info */
    this.languages = [
      { key: 0, name: "English", frame: 0 },
      { key: 1, name: "Español", frame: 1 }
    ];

    /** @type {number} Index into this.languages for the current selection */
    this.currentIndex = Account.settings?.language ?? 0;

    // Clamp to valid range
    if (this.currentIndex < 0 || this.currentIndex >= this.languages.length) {
      this.currentIndex = 0;
    }

    // Dark background
    /** @type {Phaser.Graphics} Black backdrop for the language screen */
    this.background = game.add.graphics(0, 0);
    this.background.beginFill(0x000000, 1);
    this.background.drawRect(0, 0, game.width, game.height);
    this.background.endFill();

    // Centered window (Window units are 8px cells)
    // Window width: 10 cells = 80px, height: 5 cells = 40px
    // Center it: x = (240 - 80) / 2 / 8 = 10, y = (140 - 40) / 2 / 8 = 6.25 → 6
    const windowWidth = 10;
    const windowHeight = 5;
    const windowX = Math.floor((game.width / 8 - windowWidth) / 2);
    const windowY = Math.floor((game.height / 8 - windowHeight) / 2);

    /** @type {Window} The centered window frame */
    this.window = new Window(windowX, windowY, windowWidth, windowHeight, "1");
    this.window.disableScrollBar = true;
    this.window.disableHighlight = true;
    this.window.selector.visible = false;

    // Window pixel geometry for precise layout
    const winLeft = windowX * 8;
    const winTop = windowY * 8;
    const winW = windowWidth * 8;
    const winH = windowHeight * 8;
    const centerX = winLeft + winW / 2;

    // Flag position: centered horizontally in window
    const flagW = 24;
    const flagH = 16;
    const flagX = Math.floor(centerX - flagW / 2);
    const flagY = winTop + 8;

    /** @type {Phaser.Sprite} Flag sprite showing the currently selected language */
    this.flagSprite = game.add.sprite(flagX, flagY, 'flags', this.languages[this.currentIndex].frame);
    this.flagSprite.scale.set(1, 1);

    // Left arrow
    /** @type {Text} Left arrow indicator */
    this.leftArrow = new Text(winLeft + 10, flagY + 5, "<", FONTS.bold);
    this.leftArrow.tint = 0xffffff;
    this.leftArrow.alpha = 0.6;

    // Right arrow
    /** @type {Text} Right arrow indicator */
    this.rightArrow = new Text(winLeft + winW - 14, flagY + 5, ">", FONTS.bold);
    this.rightArrow.tint = 0xffffff;
    this.rightArrow.alpha = 0.6;

    // Blink the arrows to hint at interactivity
    game.add.tween(this.leftArrow).to({ alpha: 1 }, 400, "Linear", true, 0, -1).yoyo(true);
    game.add.tween(this.rightArrow).to({ alpha: 1 }, 400, "Linear", true, 0, -1).yoyo(true);

    // Language name text below the flag
    /** @type {Text} Selected language display name */
    this.languageText = new Text(centerX, flagY + flagH + 2, this.languages[this.currentIndex].name, FONTS.default);
    this.languageText.anchor.x = 0.5;
    this.languageText.tint = 0x76fcde;

    // Input cooldown to prevent immediate confirm on state start
    /** @type {number} Timestamp before which input is ignored */
    this.inputLockedUntil = game.time.now + 200;

    // Execute addon behaviors for this state
    if (typeof addonManager !== 'undefined' && addonManager) {
      addonManager.executeStateBehaviors(this.constructor.name, this);
    }
  }

  /**
   * Cycles the language selection by a direction and refreshes the UI.
   * @param {number} direction - -1 for previous, 1 for next
   */
  changeLanguage(direction) {
    const count = this.languages.length;
    this.currentIndex = (this.currentIndex + direction + count) % count;
    this.refreshUI();
    ENABLE_UI_SFX && Audio.play('ui_nav');
  }

  /**
   * Updates the flag frame and language text to match currentIndex.
   */
  refreshUI() {
    const lang = this.languages[this.currentIndex];
    this.flagSprite.frame = lang.frame;
    this.languageText.write(lang.name);
  }

  /**
   * Saves the selected language, clears the first-run flag, and starts loading.
   */
  confirm() {
    Account.settings.language = this.languages[this.currentIndex].key;
    Account.firstRun = false;
    saveAccount();

    ENABLE_UI_SFX && Audio.play('ui_select');

    // Continue the boot chain
    game.state.start("LoadPlatform");
  }

  /**
   * Phaser lifecycle hook: processes input each frame.
   */
  update() {
    if (gamepad) gamepad.update();

    // Ignore input briefly after state start
    if (game.time.now < this.inputLockedUntil) return;

    // Navigation
    if (gamepad.pressed.left) {
      this.changeLanguage(-1);
      return;
    }
    if (gamepad.pressed.right) {
      this.changeLanguage(1);
      return;
    }

    // Mouse: click arrows
    if (mouse && mouse.pressed.left) {
      const p = mouse.pointer.position;
      const leftBounds = new Phaser.Rectangle(this.leftArrow.x - 4, this.leftArrow.y - 4, this.leftArrow.width + 8, this.leftArrow.height + 8);
      const rightBounds = new Phaser.Rectangle(this.rightArrow.x - 4, this.rightArrow.y - 4, this.rightArrow.width + 8, this.rightArrow.height + 8);
      if (Phaser.Rectangle.contains(leftBounds, p.x, p.y)) {
        this.changeLanguage(-1);
        return;
      }
      if (Phaser.Rectangle.contains(rightBounds, p.x, p.y)) {
        this.changeLanguage(1);
        return;
      }
    }

    // Confirm with A or START
    if (gamepad.pressed.a || gamepad.pressed.start || (mouse && mouse.pressed.left)) {
      // Only auto-confirm on mouse if clicked outside arrows; otherwise the arrows already returned.
      // Since arrows return before reaching here, a mouse click here means "confirm".
      this.confirm();
    }
  }
}