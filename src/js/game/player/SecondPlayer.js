class SecondPlayer extends Player {
  constructor(scene, settings = {}) {
    // Call parent with "right" side
    super(scene, "right", settings);
    
    this.gamepad = gamepad2; // Use Player 2
    
    this.HEALTH_X = 104;
    this.HEALTH_WIDTH = 71;
    this.ACCURACY_BAR_WIDTH = 73;
    
    scene.p2JudgementText.x = this.renderer.calculateCenter();
    
    this.hud = scene.p2Hud;
  }
}
