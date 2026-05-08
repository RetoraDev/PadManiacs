class FirstPlayer extends Player {
  constructor(scene, settings = {}) {
    // Call parent with "left" side
    super(scene, "left", settings);
    
    this.gamepad = gamepad1; // Use Player 1
    
    this.HEALTH_X = 14;
    this.HEALTH_WIDTH = 71;
    this.ACCURACY_BAR_WIDTH = 73;
    
    scene.p1JudgementText.x = this.renderer.calculateCenter();
    
    this.hud = scene.p1Hud;
  }
}