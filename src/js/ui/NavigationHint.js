class NavigationHint extends Phaser.Sprite {
  constructor(frame = 0) {
    super(game, 0, 0, 'ui_navigation_hint_screens');
    
    this.frame = frame;
    
    game.add.existing(this);
  }
  change(value) {
    this.frame = value;
  }
  hide() {
    this.visible = false;
  }
  show() {
    this.visible = true;
  }
}
