/**
 * @class NavigationHint
 * @category UI Classes
 * @summary Displays input prompts in menus (0-7 frames)
 * @constructor
 * @param {Array|string} hints - Hint definitions or a NAVIGATION_HINT_PRESETS key
 * @param {boolean} [disableCache] - When true, rebuild hint sprites on every refresh
 * @features
 * Renders icon and description prompts grouped left, center, and right
 * Keyboard, gamepad, mouse, and touch input source detection
 * Cached sprite parents for instant input-source switching
 * Alternate mode that cycles the active player periodically
 * @description
 * NavigationHint renders the contextual button prompts at the bottom of the
 * screen. It watches the active input source and player, redrawing prompts
 * with the correct key labels or gamepad button icons, and caches both player
 * and input-source variants so switching is instant. Alternate mode cycles
 * between player 1 and player 2 prompts on a timer.
 * @example
 * // Modding usage example
 * const hints = new NavigationHint([
 *   { icon: 'up', text: 'Move', position: 'left' },
 *   { icon: 'a', text: 'Select', position: 'center' },
 *   { icon: 'b', text: 'Back', position: 'right' }
 * ]);
 */
class NavigationHint extends Phaser.Sprite {
  constructor(hints = [], disableCache) {
    super(game, 0, game.height - 6);
    
    if (typeof hints === 'string') hints = NAVIGATION_HINT_PRESETS[hints] || [];
    
    /** @type {Array} Resolved list of hint definitions */
    this.hints = hints;
    /** @type {Array} All hint sprites and groups currently created */
    this.items = [];
    /** @type {object} Timer handle for the alternate-mode cycling */
    this.alternateTimer = null;
    /** @type {number} Player id currently displayed when cycling alternate mode */
    this.currentAlternatePlayer = 1;
    /** @type {boolean} Whether player-switch refreshes are temporarily suppressed */
    this.ignorePlayerSwitch = false;
    /** @type {boolean} Whether prompt caching is disabled */
    this.disableCache = disableCache || false;
    /** @type {boolean} Whether the hints automatically cycle between players */
    this.alternateMode = Account.settings.alternateHintMode || false;
    
    /** @type {Phaser.Signal} Dispatched with the player id when the active player changes */
    this.onPlayerSwitch = new Phaser.Signal();
    
    // Cache prompt elements to reuse them later
    /** @type {object} Cached parents keyed by player id and input source */
    this.parents = {};
    
    /** @type {Object} Tracked width of each player's rendered hint row */
    this.sizes = {
      '1': 0,
      '2': 0
    };
    
    // Cache last state to avoid unnecessary refreshes
    /** @type {Object} Last rendered state used to skip redundant refreshes */
    this.lastState = {
      inputSource: null,
      activePlayer: null,
      buttonStyle: null,
      alternateMode: null
    };
    
    this.setupInputTracking();
    this.createHints();
    
    if (this.alternateMode) this.startAlternateMode();
    
    game.add.existing(this);
    
    window.currentNavigationHint = this;
  }
  
  /**
   * Subscribes a refresh callback to the global gamepad press signal.
   */
  setupInputTracking() {
    const updateCondition = () => {
      if (this.alternateMode) return;
      const currentSource = this.getInputSource();
      const currentPlayer = this.getActivePlayer();
      const currentStyle = Account.settings.buttonStyle || 'xbox';
      
      if (currentSource !== this.lastState.inputSource ||
          currentPlayer !== this.lastState.activePlayer ||
          currentStyle !== this.lastState.buttonStyle) {
        if (!this.ignorePlayerSwitch) {
          this.refreshHints();
          this.onPlayerSwitch.dispatch(currentPlayer);
        }
      }
    };
    
    /** @type {Function} Refresh callback invoked on gamepad presses */
    this.updateCondition = updateCondition;
    
    if (gamepad) gamepad.signals.pressed.any.add(this.updateCondition);
  }
  
  /**
   * Unsubscribes the input-tracking refresh callback from the gamepad signal.
   */
  stopInputTracking() {
    if (gamepad) gamepad.signals.pressed.any.remove(this.updateCondition);
  }
  
  /**
   * Starts cycling the active player between 1 and 2 every two seconds.
   */
  startAlternateMode() {
    if (this.alternateTimer) game.time.events.remove(this.alternateTimer);
    this.alternateTimer = game.time.events.loop(2000, () => {
      this.currentAlternatePlayer = this.currentAlternatePlayer === 1 ? 2 : 1;
      this.refreshHints();
    });
  }
  
  /**
   * Stops the alternate-mode cycling timer.
   */
  stopAlternateMode() {
    if (this.alternateTimer) {
      game.time.events.remove(this.alternateTimer);
      this.alternateTimer = null;
    }
  }
  
  /**
   * Enables or disables alternate mode and refreshes the hint prompts.
   * @param {boolean} enabled - Whether to enable alternate-mode cycling
   */
  setAlternateMode(enabled) {
    this.alternateMode = enabled;
    Account.settings.alternateHintMode = enabled;
    saveAccount();
    if (enabled) {
      this.currentAlternatePlayer = gamepad?.lastPlayerId || 1;
      this.startAlternateMode();
    } else {
      this.stopAlternateMode();
    }
    this.refreshHints();
  }
  
  /**
   * Returns the active player id, honoring alternate mode when enabled.
   * @returns {number} The active player id (1 or 2)
   */
  getActivePlayer() {
    if (this.alternateMode) return this.currentAlternatePlayer;
    return gamepad?.lastPlayerId || 1;
  }
  
  /**
   * Returns the current input source, forcing gamepad in alternate mode.
   * @returns {string} Input source (keyboard, gamepad, mouse, touch, or none)
   */
  getInputSource() {
    if (this.alternateMode) return 'gamepad';
    return gamepad?.lastInputSource || 'keyboard';
  }
  
  /**
   * Rebuilds the visible hint prompts for the current player and input source.
   */
  refreshHints() {
    // Update cached state
    this.lastState.inputSource = this.getInputSource();
    this.lastState.activePlayer = this.getActivePlayer();
    this.lastState.buttonStyle = Account.settings.buttonStyle || 'xbox';
    this.lastState.alternateMode = this.alternateMode;
    
    let inputSource = this.lastState.inputSource;
    
    if (inputSource == 'none' || inputSource == 'touch') inputSource = 'gamepad';
    
    if (!this.disableCache) {
      if (this.parents[1] && this.parents[2]) {
        this.parents[1]['keyboard'].visible = false;
        this.parents[2]['keyboard'].visible = false;
        this.parents[1]['gamepad'].visible = false;
        this.parents[2]['gamepad'].visible = false;
        this.parents[this.lastState.activePlayer][inputSource].visible = true;
      } else {
        this.destroyHints();
        this.createHints(1, 'keyboard', true);
        this.createHints(1, 'gamepad', true);
        this.createHints(2, 'keyboard', true);
        this.createHints(2, 'gamepad', true);
        this.parents[this.lastState.activePlayer][inputSource].visible = true;
      }
    } else {
      this.destroyHints();
      this.createHints();
    }
  }
  
  /**
   * Destroys all hint items, groups, and sprites.
   */
  destroyHints() {
    // Destroy all existing items
    this.items.forEach(item => {
      if (item.group) {
        item.group.destroy(true);
      } else {
        if (item.iconSprite) item.iconSprite.destroy();
        if (item.keySprite) item.keySprite.destroy();
        if (item.descriptionSprite) item.descriptionSprite.destroy();
      }
    });
    this.items = [];
  }
  
  /**
   * Creates hint prompts for the given player and input source.
   * @param {number} [player] - Player id to render prompts for
   * @param {string} [input] - Input source to render prompts for
   * @param {boolean} [hide] - Whether to hide the created group afterwards
   */
  createHints(player, input, hide) {
    const activePlayer = player || this.getActivePlayer();
    const inputSource = input || this.getInputSource();
    const buttonStyle = Account.settings.buttonStyle || 'xbox';
    
    const groupedHints = { left: [], center: [], right: [] };
    this.hints.forEach(hint => groupedHints[hint.position].push(hint));
    
    this.createPositionHints('left', groupedHints.left, activePlayer, inputSource, buttonStyle);
    this.createPositionHints('center', groupedHints.center, activePlayer, inputSource, buttonStyle);
    this.createPositionHints('right', groupedHints.right, activePlayer, inputSource, buttonStyle);
    
    if (hide) this.parents[activePlayer][inputSource].visible = false;
  }
  
  /**
   * Creates and lays out the prompts for one position group (left/center/right).
   * @param {string} position - Position group to build: left, center, or right
   * @param {Array} hints - Hints belonging to this position
   * @param {number} activePlayer - Player id the prompts are for
   * @param {string} inputSource - Input source the prompts are for
   * @param {string} buttonStyle - Button icon style (xbox or playstation)
   */
  createPositionHints(position, hints, activePlayer, inputSource, buttonStyle) {
    if (hints.length === 0) return;
    
    // Calculate total width
    let totalWidth = 0;
    for (const hint of hints) {
      const iconWidth = this.getIconWidth(hint, inputSource, buttonStyle, activePlayer);
      const keyText = this.getKeyText(hint, inputSource, activePlayer);
      const descriptionText = hint.text;
      const descriptionWidth = descriptionText ? (descriptionText.length * 4) : 0;
      totalWidth += iconWidth + descriptionWidth + 4;
    }
    totalWidth -= 4;
    
    // Calculate start X
    let currentX;
    if (position === 'left') currentX = 4;
    else if (position === 'center') currentX = (game.width / 2) - (totalWidth / 2);
    else currentX = game.width - 4 - totalWidth;
    
    if (inputSource == 'none' || inputSource == 'touch') inputSource = 'gamepad';
    
    if (!this.parents[activePlayer]) {
      this.parents[activePlayer] = {};
    }
    
    if (!this.parents[activePlayer][inputSource]) {
      this.parents[activePlayer][inputSource] = game.add.group();
      this.addChild(this.parents[activePlayer][inputSource]);
    }
    
    // Create each hint
    for (const hint of hints) {
      const iconGroup = this.createIcon(hint, inputSource, buttonStyle, activePlayer, currentX);
      if (iconGroup) {
        this.parents[activePlayer][inputSource].addChild(iconGroup.group);
        currentX += iconGroup.width;
      }
      
      const descriptionText = hint.text;
      if (descriptionText) {
        const descSprite = new Text(0, 2, descriptionText, FONTS.small);
        descSprite.anchor.y = 0.5;
        descSprite.x = currentX;
        this.parents[activePlayer][inputSource].addChild(descSprite);
        currentX += descSprite.width + 4;
        this.items.push({ descriptionSprite: descSprite });
      } else {
        currentX += 4;
      }
    }
  }
  
  /**
   * Creates a key sprite or dedicated icon frame for a single hint icon.
   * @param {object} hint - The hint to create an icon for
   * @param {string} inputSource - Input source determining the icon look
   * @param {string} buttonStyle - Button icon style (xbox or playstation)
   * @param {number} activePlayer - Player id for key mapping
   * @param {number} x - X position of the icon group
   * @returns {object|null} Icon group with width, or null when nothing applies
   */
  createIcon(hint, inputSource, buttonStyle, activePlayer, x) {
    const keyText = this.getKeyText(hint, inputSource, activePlayer);
    const useKeySprite = (inputSource === 'keyboard' && keyText !== null);
    const iconFrame = this.getIconFrame(hint.icon, inputSource, buttonStyle, activePlayer);
    const useDedicatedFrame = (iconFrame !== undefined && iconFrame !== -1);
    
    let group = null;
    let width = 0;
    
    // Case 1: Custom key sprite (for keyboard action buttons)
    if (useKeySprite && !useDedicatedFrame) {
      group = this.createKeySprite(keyText, 0, 0);
      width = group.width;
      group.x = x;
    }
    // Case 2: Dedicated frame (D-PAD, cursor, space, enter, or gamepad buttons)
    else if (useDedicatedFrame) {
      const sprite = game.add.sprite(0, 0, 'ui_navigation_icons', iconFrame);
      sprite.anchor.y = 0.5;
      group = new Phaser.Group(game);
      group.add(sprite);
      group.x = x;
      width = 10;
    }
    
    if (group) {
      this.items.push({ group: group, hint: hint });
      return { group: group, width: width };
    }
    return null;
  }
  
  /**
   * Builds a keyboard key sprite with caps, center slices, and a label.
   * @param {string} keyText - The key label to render
   * @param {number} x - X position of the key group
   * @param {number} y - Y position of the key group
   * @returns {Phaser.Group} The assembled key sprite group
   */
  createKeySprite(keyText, x, y) {
    const group = game.add.group();
    group.x = x;
    group.y = y;
    
    const textWidth = keyText.length * 4;
    const totalWidth = 3 + textWidth + 3;
    
    // Left cap
    const left = game.add.sprite(0, 0, 'ui_navigation_key', 0);
    left.anchor.y = 0.5;
    group.add(left);
    
    // Center slices (each 4px)
    let currentX = 3;
    for (let i = 0; i < textWidth; i += 4) {
      const center = game.add.sprite(currentX, 0, 'ui_navigation_key', 1);
      center.anchor.y = 0.5;
      group.add(center);
      currentX += 4;
    }
    
    // Right cap
    const right = game.add.sprite(totalWidth - 3, 0, 'ui_navigation_key', 2);
    right.anchor.y = 0.5;
    group.add(right);
    
    // Text label
    const label = new Text(1 + totalWidth / 2, 1, keyText, FONTS.small);
    label.anchor.set(0.5, 0.5);
    group.add(label);
    
    return group;
  }
  
  /**
   * Computes the width of a key sprite built for the given label.
   * @param {string} keyText - The key label
   * @returns {number} Width in pixels
   */
  calculateKeyWidth(keyText) {
    return 3 + (keyText.length * 4) + 3;
  }
  
  /**
   * Returns the width needed to render a hint's icon in the current style.
   * @param {object} hint - The hint to measure
   * @param {string} inputSource - Input source determining the icon look
   * @param {string} buttonStyle - Button icon style (xbox or playstation)
   * @param {number} activePlayer - Player id for key mapping
   * @returns {number} Icon width in pixels
   */
  getIconWidth(hint, inputSource, buttonStyle, activePlayer) {
    const keyText = this.getKeyText(hint, inputSource, activePlayer);
    const useKeySprite = (inputSource === 'keyboard' && keyText !== null);
    const iconFrame = this.getIconFrame(hint.icon, inputSource, buttonStyle, activePlayer);
    const useDedicatedFrame = (iconFrame !== undefined && iconFrame !== -1);
    const frameWidths = {
      12: 12,
      13: 12,
      14: 12,
      15: 12,
      16: 12,
      20: 12,
      21: 12
    };
    
    if (useKeySprite && !useDedicatedFrame) return this.calculateKeyWidth(keyText);
    if (useDedicatedFrame) return frameWidths[iconFrame] || 10;
    return 0;
  }
  
  /**
   * Maps a hint icon to a sprite frame for the current input source and style.
   * @param {string} icon - The hint icon key (e.g. 'up', 'a', 'd-pad')
   * @param {string} inputSource - Input source determining the icon look
   * @param {string} buttonStyle - Button icon style (xbox or playstation)
   * @param {number} activePlayer - Player id for key mapping
   * @returns {number} Sprite frame index, or -1 to use a custom key sprite
   */
  getIconFrame(icon, inputSource, buttonStyle, activePlayer) {
    // Keyboard mode: dedicated frames for special icons, others use -1 (custom key sprite)
    if (inputSource === 'keyboard') {
      const keyboardFrames = {
        'd-pad': 16,
        'cursor': 16,
        32: 17, // spacebar
        13: 18, // enter
        108: 18, // numpad enter
        37: 19, // left
        39: 20, // right 
        38: 21, // up 
        40: 22, // down
      };
      
      // Get mapped key for action buttons
      const player = activePlayer === 1 ? 'player1' : 'player2';
      const mapping = Account.mapping.keyboard[player];
      let keyCode = null;
      
      switch (icon) {
        case 'up': keyCode = mapping.up?.[0]; break;
        case 'down': keyCode = mapping.down?.[0]; break;
        case 'left': keyCode = mapping.left?.[0]; break;
        case 'right': keyCode = mapping.right?.[0]; break;
        case 'a': keyCode = mapping.a?.[0]; break;
        case 'b': keyCode = mapping.b?.[0]; break;
        case 'select': keyCode = mapping.select?.[0]; break;
        case 'start': keyCode = mapping.start?.[0]; break;
        case 'x': keyCode = mapping.a?.[0]; break;
        case 'y': keyCode = mapping.b?.[0]; break;
      };
      
      if (keyboardFrames[keyCode] !== undefined) return keyboardFrames[keyCode];
      
      if (keyboardFrames[icon] !== undefined) return keyboardFrames[icon];
      
      return -1; // Signal to use custom key sprite
    }
    
    // Gamepad mode
    if (icon === 'd-pad' || icon === 'cursor') return 1;
    
    const mappedButton = this.getButtonMapping(icon, activePlayer);
    if (mappedButton !== undefined && mappedButton !== null) {
      if (buttonStyle === 'xbox') {
        const xboxFrames = {
          0: 3,
          1: 2,
          2: 4,
          3: 5,
          8: 10,
          9: 11, 
          4: -1,
          5: -1,
          6: -1,
          7: -1
        };
        return xboxFrames[mappedButton] !== undefined ? xboxFrames[mappedButton] : -1;
      } else {
        const psFrames = {
          0: 7,
          1: 6,
          2: 8,
          3: 9,
          8: 10,
          9: 11,
          4: -1,
          5: -1,
          6: -1,
          7: -1
        };
        return psFrames[mappedButton] !== undefined ? psFrames[mappedButton] : -1;
      }
    }
    return -1;
  }
  
  /**
   * Returns the gamepad button id mapped to an action for the given player.
   * @param {string} icon - Action icon key (a, b, x, y, select, start)
   * @param {number} playerId - Player id to look up
   * @returns {number|null} Mapped gamepad button id or null
   */
  getButtonMapping(icon, playerId) {
    const player = playerId === 1 ? 'player1' : 'player2';
    const actionMap = {
      'a': 'a', 'b': 'b', 'x': 'a', 'y': 'b',
      'select': 'select', 'start': 'start'
    };
    const action = actionMap[icon];
    if (!action) return null;
    return Account.mapping.gamepad[player][action];
  }
  
  /**
   * Resolves the key label to show for a hint in keyboard mode.
   * @param {object} hint - The hint to resolve
   * @param {string} inputSource - Input source determining the icon look
   * @param {number} activePlayer - Player id for key mapping
   * @returns {string|null} Key label or null when no label applies
   */
  getKeyText(hint, inputSource, activePlayer) {
    if (inputSource !== 'keyboard') {
      const triggerIcons = ['lb', 'rb', 'lt', 'rt'];
      if (triggerIcons.includes(hint.icon)) {
        const buttonNames = { 'lb': 'LB', 'rb': 'RB', 'lt': 'LT', 'rt': 'RT' };
        return buttonNames[hint.icon];
      }
      return null;
    }
    
    // Icons that use dedicated keyboard frames do not need key text
    const dedicatedIcons = ['d-pad', 'cursor', 'space', 'enter'];
    if (dedicatedIcons.includes(hint.icon)) return null;
    
    // Get mapped key for action buttons
    const player = activePlayer === 1 ? 'player1' : 'player2';
    const mapping = Account.mapping.keyboard[player];
    let keyCode = null;
    
    switch (hint.icon) {
      case 'up': keyCode = mapping.up?.[0]; break;
      case 'down': keyCode = mapping.down?.[0]; break;
      case 'left': keyCode = mapping.left?.[0]; break;
      case 'right': keyCode = mapping.right?.[0]; break;
      case 'a': keyCode = mapping.a?.[0]; break;
      case 'b': keyCode = mapping.b?.[0]; break;
      case 'select': keyCode = mapping.select?.[0]; break;
      case 'start': keyCode = mapping.start?.[0]; break;
      case 'x': keyCode = mapping.a?.[0]; break;
      case 'y': keyCode = mapping.b?.[0]; break;
    }
    
    if (keyCode) return this.keyCodeToString(keyCode);
    
    // Fallbacks
    const fallbacks = { 'a': 'K', 'b': 'J', 'select': 'SHIFT', 'start': 'ENTER' };
    return fallbacks[hint.icon] || null;
  }  

  /**
   * Converts a key code into its human-readable name from KEYBOARD_KEY_CODES.
   * @param {number} keyCode - The key code to convert
   * @returns {string} Key name, or '???' when unknown
   */
  keyCodeToString(keyCode) {
    for (const key of Object.keys(KEYBOARD_KEY_CODES)) {
      const keyName = key.replace('_', ' ');
      
      if (KEYBOARD_KEY_CODES[key] == keyCode) return keyName;
    }
    
    return '???';
  }
  
  /**
   * Sets the button icon style and refreshes the hint prompts.
   * @param {string} style - Button style key (xbox or playstation)
   */
  setButtonStyle(style) {
    Account.settings.buttonStyle = style;
    saveAccount();
    this.refreshHints();
  }
  
  /**
   * Replaces the current hints and rebuilds all prompt sprites.
   * @param {Array|string} hints - Hint definitions or a NAVIGATION_HINT_PRESETS key
   */
  updateHints(hints) {
    if (typeof hints === 'string') hints = NAVIGATION_HINT_PRESETS[hints] || [];
    this.hints = hints;
    this.parents = {};
    this.refreshHints();
  }
  
  /**
   * Stops tracking and cycling, destroys all prompts, and destroys the sprite.
   */
  destroy() {
    this.stopInputTracking();
    this.stopAlternateMode();
    this.items.forEach(item => {
      if (item.group) item.group.destroy(true);
      else {
        if (item.iconSprite) item.iconSprite.destroy();
        if (item.keySprite) item.keySprite.destroy();
        if (item.descriptionSprite) item.descriptionSprite.destroy();
      }
    });
    super.destroy();
  }
}