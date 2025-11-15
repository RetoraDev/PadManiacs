class Visualizer {
  constructor(scene, x, y, width, height) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.graphics = scene.add.graphics(x, y);
    this.active = true;
  }

  update() {
    // To be implemented by subclasses
  }

  destroy() {
    this.graphics.destroy();
  }

  clear() {
    this.graphics.clear();
  }
}
