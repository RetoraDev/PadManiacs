class LoadAddons {
  create() {
    this.progressText = new ProgressText(__("Loading Add-ons...||Cargando Add-ons..."));
    this.loadingDots = new LoadingDots();
    this.initialize();
  }
  async initialize() {
    // Initialize addon manager
    addonManager = new AddonManager();
    await addonManager.initialize();
    
    // Execute global addon behaviors
    addonManager.executeGlobalBehaviors();
    
    const resources = addonManager.getResourceList();
    
    game.load.baseURL = "";
    
    game.state.start("Load", true, false, resources, "LoadLocalSongs");
  }
}
