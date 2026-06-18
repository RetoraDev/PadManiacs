class LineChart extends Phaser.Sprite {
  constructor(x, y, width, height, data) {
    super(game, x, y);
    this.size = { width, height };
    this.config = {
      backgroundColor: 0x000000,
      backgroundAlpha: 0.5,
      borderColor: 0xffffff,
      borderAlpha: 1,
      lineColor: 0x00ff00,
      lineWidth: 1,
      lineAlpha: 1,
      zeroLineColor: 0xffffff,
      zeroLineAlpha: 0.1,
      fillUnderLine: false,
      fillColor: 0x00ff00,
      fillAlpha: 0.3,
      pointRadius: 2,
      showPoints: false
    };
    this.data = data || [];
    this.graphics = game.add.graphics(0, 0);
    this.addChild(this.graphics);
    this.drawChart();
    game.add.existing(this);
  }
  
  drawChart() {
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
    
    if (!this.data || this.data.length < 2) return;
    
    // Find min and max values
    let minValue = Math.min(...this.data);
    let maxValue = Math.max(...this.data);
    
    if (minValue === maxValue) {
      minValue = minValue - 1;
      maxValue = maxValue + 1;
    }
    
    const valueRange = maxValue - minValue;
    const stepX = width / (this.data.length - 1);
    
    // Calculate points
    const points = [];
    for (let i = 0; i < this.data.length; i++) {
      const xPos = i * stepX;
      const normalizedValue = (this.data[i] - minValue) / valueRange;
      const yPos = height - (normalizedValue * height);
      points.push({ x: xPos, y: yPos });
    }
    
    // Draw zero line
    if (minValue <= 0 && maxValue >= 0) {
      const zeroY = height - ((0 - minValue) / valueRange) * height;
      this.graphics.lineStyle(1, this.config.zeroLineColor, this.config.zeroLineAlpha);
      this.graphics.moveTo(0, zeroY);
      this.graphics.lineTo(width, zeroY);
    }
    
    // Fill under line if enabled
    if (this.config.fillUnderLine && points.length > 0) {
      this.graphics.beginFill(this.config.fillColor, this.config.fillAlpha);
      this.graphics.moveTo(0, height);
      for (const point of points) {
        this.graphics.lineTo(point.x, point.y);
      }
      this.graphics.lineTo(width, height);
      this.graphics.lineTo(0, height);
      this.graphics.endFill();
    }
    
    // Draw line
    this.graphics.lineStyle(this.config.lineWidth, this.config.lineColor, this.config.lineAlpha);
    this.graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.graphics.lineTo(points[i].x, points[i].y);
    }
    
    // Draw points
    if (this.config.showPoints) {
      for (const point of points) {
        this.graphics.beginFill(this.config.lineColor, this.config.lineAlpha);
        this.graphics.drawCircle(point.x, point.y, this.config.pointRadius);
        this.graphics.endFill();
      }
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