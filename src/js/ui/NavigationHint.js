class NavigationHint extends Phaser.Sprite {
  constructor(hints = []) {
    super(game, 0, game.height - 6);
    
    if (typeof hints === 'string') hints = NAVIGATION_HINT_PRESETS[hints] || [];
    
    this.hints = hints;
    this.items = [];
    this.alternateTimer = null;
    this.currentAlternatePlayer = 1;
    this.alternateMode = Account.settings.alternateHintMode || false;
    
    // Cache last state to avoid unnecessary refreshes
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
  
  setupInputTracking() {
    const updateCondition = () => {
      if (this.alternateMode) return;
      const currentSource = this.getInputSource();
      const currentPlayer = this.getActivePlayer();
      const currentStyle = Account.settings.buttonStyle || 'xbox';
      
      if (currentSource !== this.lastState.inputSource ||
          currentPlayer !== this.lastState.activePlayer ||
          currentStyle !== this.lastState.buttonStyle) {
        this.refreshHints();
      }
    };
    
    if (gamepad1) gamepad1.signals.pressed.any.add(updateCondition);
    if (gamepad2) gamepad2.signals.pressed.any.add(updateCondition);
    
    if (game.input && game.input.keyboard) {
      const originalCallback = game.input.keyboard.onDownCallback;
      game.input.keyboard.onDownCallback = (event) => {
        if (originalCallback) originalCallback(event);
        updateCondition();
      };
    }
    
    if (mouse) mouse.onDown.add(updateCondition);
  }
  
  startAlternateMode() {
    if (this.alternateTimer) game.time.events.remove(this.alternateTimer);
    this.alternateTimer = game.time.events.loop(2000, () => {
      this.currentAlternatePlayer = this.currentAlternatePlayer === 1 ? 2 : 1;
      this.refreshHints();
    });
  }
  
  stopAlternateMode() {
    if (this.alternateTimer) {
      game.time.events.remove(this.alternateTimer);
      this.alternateTimer = null;
    }
  }
  
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
  
  getActivePlayer() {
    if (this.alternateMode) return this.currentAlternatePlayer;
    return gamepad?.lastPlayerId || 1;
  }
  
  getInputSource() {
    if (this.alternateMode) return 'gamepad';
    return gamepad?.lastInputSource || 'keyboard';
  }
  
  refreshHints() {
    // Update cached state
    this.lastState.inputSource = this.getInputSource();
    this.lastState.activePlayer = this.getActivePlayer();
    this.lastState.buttonStyle = Account.settings.buttonStyle || 'xbox';
    this.lastState.alternateMode = this.alternateMode;
    
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
    this.createHints();
  }
  
  createHints() {
    const activePlayer = this.getActivePlayer();
    const inputSource = this.getInputSource();
    const buttonStyle = Account.settings.buttonStyle || 'xbox';
    
    const groupedHints = { left: [], center: [], right: [] };
    this.hints.forEach(hint => groupedHints[hint.position].push(hint));
    
    this.createPositionHints('left', groupedHints.left, activePlayer, inputSource, buttonStyle);
    this.createPositionHints('center', groupedHints.center, activePlayer, inputSource, buttonStyle);
    this.createPositionHints('right', groupedHints.right, activePlayer, inputSource, buttonStyle);
  }
  
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
    
    // Create each hint
    for (const hint of hints) {
      const iconGroup = this.createIcon(hint, inputSource, buttonStyle, activePlayer, currentX);
      if (iconGroup) {
        this.addChild(iconGroup.group);
        currentX += iconGroup.width;
      }
      
      const descriptionText = hint.text;
      if (descriptionText) {
        const descSprite = new Text(0, 0, descriptionText, FONTS.default);
        descSprite.anchor.y = 0.5;
        descSprite.x = currentX;
        this.addChild(descSprite);
        currentX += descSprite.width + 4;
        this.items.push({ descriptionSprite: descSprite });
      } else {
        currentX += 4;
      }
    }
  }
  
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
    const label = new Text(1 + totalWidth / 2, 0, keyText, FONTS.default);
    label.anchor.set(0.5, 0.5);
    group.add(label);
    
    return group;
  }
  
  calculateKeyWidth(keyText) {
    return 3 + (keyText.length * 4) + 3;
  }
  
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
  
  getIconFrame(icon, inputSource, buttonStyle, activePlayer) {
    // Keyboard mode: dedicated frames for special icons, others use -1 (custom key sprite)
    if (inputSource === 'keyboard') {
      const keyboardFrames = {
        'd-pad': 16,
        'cursor': 16
      };
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

  keyCodeToString(keyCode) {
    const keyNames = {
      65:'A',66:'B',67:'C',68:'D',69:'E',70:'F',71:'G',72:'H',73:'I',74:'J',
      75:'K',76:'L',77:'M',78:'N',79:'O',80:'P',81:'Q',82:'R',83:'S',84:'T',
      85:'U',86:'V',87:'W',88:'X',89:'Y',90:'Z',
      48:'0',49:'1',50:'2',51:'3',52:'4',53:'5',54:'6',55:'7',56:'8',57:'9',
      16:'SHIFT',17:'CTRL',18:'ALT',13:'ENTER',32:'SPACE',
      37:'◄',38:'▲',39:'►',40:'▼'
    };
    return keyNames[keyCode] || String.fromCharCode(keyCode);
  }
  
  setButtonStyle(style) {
    Account.settings.buttonStyle = style;
    saveAccount();
    this.refreshHints();
  }
  
  updateHints(hints) {
    if (typeof hints === 'string') hints = NAVIGATION_HINT_PRESETS[hints] || [];
    this.hints = hints;
    this.refreshHints();
  }
  
  destroy() {
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