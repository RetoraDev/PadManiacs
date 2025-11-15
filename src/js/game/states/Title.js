class Title {
  create() {
    game.camera.fadeIn(0xffffff);
    
    this.background = new BackgroundGradient();
    this.lines = new FuturisticLines();
    this.logo = new Logo();
    
    this.inputInstructionText = new Text(game.width / 2, 80, "PRESS ANY KEY");
    this.inputInstructionText.anchor.x = 0.5;
    game.add.tween(this.inputInstructionText).to({ alpha: 0 }, 500, "Linear", true, 0, -1).yoyo(true);
    
    this.text = game.add.sprite(0, 0);
    
    this.creditText = new Text(2, 110, COPYRIGHT, this.text);
    this.creditText.anchor.y = 1;
    
    this.creditText = new Text(190, 110, VERSION, this.text);
    this.creditText.anchor.set(1);
    
    if (!backgroundMusic) {
      backgroundMusic = new BackgroundMusic();
    }
    backgroundMusic.playLastSong();
    
    this.introEnded = false;
    
    this.logo.intro(() => this.introEnded = true);

    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  update() {
    gamepad.update();
    
    if (this.introEnded && !this.outroStarted && gamepad.pressed.any) {
      this.outroStarted = true;
      this.text.alpha = 0;
      this.logo.outro(() => game.state.start('MainMenu'));
    }
  }
}
