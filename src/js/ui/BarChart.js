/**
 * @class BarChart
 * @category UI Classes
 * @summary Bar chart for statistics display
 * @constructor
 * @param {Number} x - X position of the chart
 * @param {Number} y - Y position of the chart
 * @param {Number} width - Width of the chart area
 * @param {Number} height - Height of the chart area
 * @param {Array<{name: String, value: Number}>} [data] - Initial bars to display
 * @features
 * Customizable colors, labels and spacing via config
 * Optional value text shown above bars
 * @description
 * A bar chart sprite for displaying statistics. Bars are scaled relative to the largest value in the data set and drawn below optional name labels. Appearance is fully configurable so modders can match the game's color scheme.
 * @example
 * // Modding usage example
 * const chart = new BarChart(50, 100, 200, 150, [
 *   { name: 'A', value: 10 },
 *   { name: 'B', value: 25 },
 *   { name: 'C', value: 15 }
 * ]);
 * game.add.existing(chart);
 * chart.setConfig({ barColor: 0xff8800 });
 * chart.setData([{ name: 'A', value: 5 }, { name: 'B', value: 20 }]);
 */
class BarChart extends Phaser.Sprite {
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
      barColor: 0x00ff00,
      barAlpha: 0.8,
      barSpacing: 2,
      showLabels: true,
      labelColor: 0xffffff,
      showValues: false,
      valueColor: 0xffffff
    };
    /** @type {Array<{name: String, value: Number}>} Bars to display */
    this.data = data || [];
    /** @type {Phaser.Graphics} Drawing surface for the chart */
    this.graphics = game.add.graphics(0, 0);
    this.addChild(this.graphics);
    this.drawChart();
    game.add.existing(this);
  }
  
  /**
   * Rebuilds the entire chart on the graphics object. Clears prior drawing then redraws the background, border, bars, labels and optional value text from the current config and data.
   */
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
  
  /**
   * Replaces the chart data and redraws the chart.
   * @param {Array<{name: String, value: Number}>} data - New bars to display
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