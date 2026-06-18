class BarChart extends Phaser.Sprite {
  constructor(x, y, width, height, data) {
    super(game, x, y);
    this.size = { width, height };
    this.config = {
      backgroundColor: 0x000000,
      backgroundAlpha: 0.5,
      borderColor: 0xffffff,
      borderAlpha: 1,
      barColor: 0x00ff00,
      barAlpha: 0.8,
      barSpacing: 2,
      showLabels: true,
      labelColor: 0xffffff,
      showValues: false,
      valueColor: 0xffffff
    };
    this.data = data || [];
    this.graphics = game.add.graphics(0, 0);
    this.addChild(this.graphics);
    this.drawChart();
    game.add.existing(this);
  }
  
  drawChart() {
    // Clear graphics
    this.graphics.clear();
    
    const { width, height } = this.size;
    
    // Draw background
    this.graphics.beginFill(this.config.backgroundColor, this.config.backgroundAlpha);
    this.graphics.drawRect(0, 0, width, height);
    this.graphics.endFill();
    
    // Draw border
    this.graphics.lineStyle(1, this.config.borderColor, this.config.borderAlpha);
    this.graphics.drawRect(0, 0, width, height);
    this.graphics.endFill();
    
    if (!this.data || this.data.length === 0) return;
    
    // Find max value
    let maxValue = Math.max(...this.data.map(item => item.value));
    if (maxValue <= 0) maxValue = 1;
    
    // Calculate bar dimensions
    const totalSpacing = this.config.barSpacing * (this.data.length - 1);
    const barWidth = (width - totalSpacing) / this.data.length;
    const actualBarWidth = Math.max(2, barWidth);
    const actualSpacing = this.config.barSpacing;
    
    let currentX = 0;
    
    for (let i = 0; i < this.data.length; i++) {
      const item = this.data[i];
      const barHeight = (item.value / maxValue) * height;
      const barY = height - barHeight;
      
      // Draw bar
      this.graphics.beginFill(this.config.barColor, this.config.barAlpha);
      this.graphics.drawRect(currentX, barY, actualBarWidth, barHeight);
      this.graphics.endFill();
      
      // Draw label
      if (this.config.showLabels && item.name) {
        const label = new Text(currentX + actualBarWidth / 2, height + 2, item.name, FONTS.default);
        label.anchor.set(0.5, 0);
        label.tint = this.config.labelColor;
        this.addChild(label);
      }
      
      // Draw value text
      if (this.config.showValues) {
        const valueText = new Text(currentX + actualBarWidth / 2, barY - 2, item.value.toString(), FONTS.default);
        valueText.anchor.set(0.5, 1);
        valueText.tint = this.config.valueColor;
        this.addChild(valueText);
      }
      
      currentX += actualBarWidth + actualSpacing;
    }
  }
  
  setData(data) {
    this.data = data;
    this.drawChart();
  }
  
  setConfig(config) {
    Object.assign(this.config, config);
    this.drawChart();
  }
}