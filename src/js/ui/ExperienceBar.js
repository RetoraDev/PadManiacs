class ExperienceBar extends Phaser.Sprite {
  constructor(x, y, width, height) {
    super(game, x, y);
    this.barWidth = width;
    this.barHeight = height;
    this.progress = 0;
    
    this.background = game.add.graphics(0, 0);
    this.background.beginFill(0x333333);
    this.background.drawRect(0, 0, width, height);
    this.background.endFill();
    this.addChild(this.background);
    
    this.bar = game.add.graphics(0, 0);
    this.addChild(this.bar);
    
    this.border = game.add.graphics(0, 0);
    this.border.lineStyle(1, 0xFFFFFF, 1);
    this.border.drawRect(0, 0, width, height);
    this.border.endFill();
    this.addChild(this.border);
    
    this.updateBar();
    
    game.add.existing(this);
  }
  
  setProgress(progress) {
    this.progress = Phaser.Math.clamp(progress, 0, 1);
    this.updateBar();
  }
  
  updateBar() {
    this.bar.clear();
    this.bar.beginFill(0x76fcde);
    this.bar.drawRect(0, 0, this.barWidth * this.progress, this.barHeight);
    this.bar.endFill();
  }
  
  destroy() {
    this.background.destroy();
    this.bar.destroy();
    this.border.destroy();
    super.destroy();
  }
}