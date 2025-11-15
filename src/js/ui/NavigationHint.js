class NavigationHint extends Phaser.Sprite {
  constructor(frame = 0) {
    super(game, 0, 0);
    
    this.defaultFrame = frame;
    this.lastInputSource = null;
    
    game.add.existing(this);
  }
  hide() {
    this.visible = false;
  }
  show() {
    this.visible = true;
  }
  update() {
    if (!gamepad) return;
    
    if (gamepad.lastInputSource != this.lastInputSource) {
      this.loadTexture(gamepad.lastInputSource == 'keyboard' ? 'ui_navigation_hint_keyboard' : 'ui_navigation_hint_gamepad');
      this.frame = this.defaultFrame;
    }
    
    this.lastInputSource = gamepad.lastInputSource;
  }
}
