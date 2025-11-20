class SkillBar extends Phaser.Sprite {
  constructor(x, y) {
    super(game, x, y);
    
    this.parts = [];
    
    this.visibleParts = 5;
    this.value = 5;
    
    for (let i = 0, x = 0; i < 5; i++, x += 3) {
      const part = game.add.sprite(x, 0, 'ui_skill_bar', 0);
      this.addChild(part);
      this.parts.push(part);
    }
    
    game.add.existing(this);
  }
  update() {
    for (let i = 1; i <= 5; i++) {
      const part = this.parts[i - 1];
      
      part.visible = i <= this.visibleParts;
      part.frame = this.value >= i ? 0 : 1;
    }
  }
}