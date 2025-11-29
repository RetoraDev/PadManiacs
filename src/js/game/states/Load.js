class Load {
  init(resources, nextState, nextStateParams) {
    this.resources = resources || [];
    this.nextState = nextState || 'Title';
    this.nextStateParams = nextStateParams || {};
    this.loadedCount = 0;
    this.totalCount = this.resources.length;
  }

  preload() {
    // Load all resources from the provided list
    this.resources.forEach(resource => {
      switch (resource.type) {
        case undefined:
        case 'image':
          this.load.image(resource.key, resource.url);
          break;
        case 'spritesheet':
          this.load.spritesheet(resource.key, resource.url, resource.frameWidth, resource.frameHeight);
          break;
        case 'audio':
          this.load.audio(resource.key, resource.url);
          break;
        case 'video':
          this.load.video(resource.key, resource.url, 'canplay', true);
          break;
        case 'json':
          this.load.json(resource.key, resource.url);
          break;
        case 'text':
          this.load.text(resource.key, resource.url);
          break;
      }
      
      this.loadedCount++;
    });

    // Create simple progress display
    this.progressText = new ProgressText("LOADING ASSETS");
  }

  create() {
    // All resources loaded, start next state
    game.state.start(this.nextState, true, false, this.nextStateParams);
  }
}
