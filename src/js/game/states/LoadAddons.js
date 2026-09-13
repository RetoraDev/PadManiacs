/**
 * @class LoadAddons
 * @category Game States
 * @summary Initializes the addon manager and loads addon resources
 * @constructor
 * @description
 * A startup state that enables the game's addon system before the rest of the game
 * loads. It creates the global addon manager, runs any global addon behaviors, collects
 * the resources contributed by addons, and hands them to the generic Load state.
 * @example
 * // Part of the boot chain; addon resources end up in the Load state.
 * game.state.add('LoadAddons', LoadAddons);
 * game.state.start('LoadAddons');
 */
class LoadAddons {
  /**
   * Shows the loading text and dots, then kicks off asynchronous addon initialization.
   */
  create() {
    /** @type {ProgressText} Bilingual progress text for the addon loading phase */
    this.progressText = new ProgressText(__("Loading Add-ons...||Cargando Add-ons..."));
    /** @type {LoadingDots} Animated loading indicator dots */
    this.loadingDots = new LoadingDots();
    this.initialize();
  }
  /**
   * Creates and initializes the global addon manager, executes global addon behaviors,
   * gathers the resource list from mounted addons, and sends them to the Load state.
   * @returns {Promise<void>} Resolves once addons are ready and loading has been started
   */
  async initialize() {
    // Initialize addon manager
    /** @type {AddonManager} Global addon management system */
    addonManager = new AddonManager();
    await addonManager.initialize();
    
    // Execute global addon behaviors
    addonManager.executeGlobalBehaviors();
    
    const resources = addonManager.getResourceList();
    
    game.load.baseURL = "";
    
    game.state.start("Load", true, false, resources, "LoadLocalSongs");
  }
}
