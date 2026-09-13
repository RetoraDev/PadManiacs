/**
 * @class LineChart
 * @category UI Classes
 * @summary Line chart for statistics display
 * @constructor
 * @param {Number} x - X position of the chart
 * @param {Number} y - Y position of the chart
 * @param {Number} width - Width of the chart area
 * @param {Number} height - Height of the chart area
 * @param {Array<Number>} [data] - Initial data points to plot
 * @features
 * Optional area fill under the plotted line
 * Zero line drawn when the value range spans zero
 * @description
 * A line chart sprite for plotting numeric series. Data points are normalized against the min/max of the series and connected with a stroked line, optionally with points and a filled area beneath. Appearance is configurable for both line and fill styling.
 * @example
 * // Modding usage example
 * const chart = new LineChart(50, 100, 200, 150, [5, 12, 8, 20]);
 * game.add.existing(chart);
 * chart.setConfig({ lineColor: 0x00e5ff, showPoints: true });
 * chart.setData([1, 4, 3, 9, 7]);
 */
class LineChart extends Phaser.Sprite {
  constructor(x, y, width, height, data) {
    super(game, x, y);
    /** @type {{width: Number, height: Number}} Chart dimensions */
    this.size = { width, height };
    /** @type {Object} Chart appearance settings */
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
    /** @type {Array<Number>} Data points to plot */
    this.data = data || [];
    /** @type {Phaser.Graphics} Drawing surface for the chart */
    this.graphics = game.add.graphics(0, 0);
    this.addChild(this.graphics);
    this.drawChart();
    game.add.existing(this);
  }
  
  /**
   * Rebuilds the entire chart on the graphics object. Clears prior drawing then redraws the background, border, zero line, optional filled area, main line and points from the current config and data.
   */
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
  
  /**
   * Replaces the chart data and redraws the chart.
   * @param {Array<Number>} data - New data points to plot
   */
  setData(data) {
    this.data = data;
    this.drawChart();
  }
  
  /**
   * Merges the given settings into the chart config and redraws the chart.
   * @param {Object} config - Partial config object to merge in
   */
  setConfig(config) {
    Object.assign(this.config, config);
    this.drawChart();
  }
}