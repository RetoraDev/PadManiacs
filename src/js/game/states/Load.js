/**
 * @class Load
 * @category Game States
 * @summary Dynamic asset loading with progress tracking
 * @constructor
 * @description
 * A generic loading state that receives a list of resources and loads them for the
 * game cache according to their declared type (image, spritesheet, audio, video, JSON,
 * or text). It displays a bilingual progress text overlay while assets are retrieved
 * and, once every resource has been queued, transitions into the state that was
 * requested after loading completes.
 * @example
 * // Kicking off a load of arbitrary assets, then jumping to the Title state.
 * const resources = [
 *   { key: 'ui_logo_shape', url: 'ui/logo_shape.png', type: 'image' }
 * ];
 * game.state.start('Load', true, false, resources, 'Title');
 */
class Load {
  /**
   * Stores the resource list, the state to start once loading finishes, and any
   * parameters that should be passed along to that next state.
   * @param {Array<Object>} resources - Descriptors of assets to load (key, url, type, etc.)
   * @param {string} nextState - Key of the game state to start after loading completes
   * @param {Object} nextStateParams - Parameters to forward to the next state
   */
  init(resources, nextState, nextStateParams) {
    /** @type {Array<Object>} Pending resource manifest to load */
    this.resources = resources || [];
    /** @type {string} Game state key to start once loading finishes */
    this.nextState = nextState || 'Title';
    /** @type {Object} Parameters forwarded to the next state */
    this.nextStateParams = nextStateParams || {};
    /** @type {number} Number of resources queued so far */
    this.loadedCount = 0;
    /** @type {number} Total number of resources to load */
    this.totalCount = this.resources.length;
  }

  /**
   * Registers every resource from the manifest with the Phaser loader using its
   * declared type, and shows the bilingual loading progress text while assets load.
   */
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

    this.progressText = new ProgressText(__("Loading assets...||Cargando recursos..."));
  }

  /**
   * Runs after all resources have been loaded and starts the requested next state,
   * forwarding along any stored parameters.
   */
  create() {
    // All resources loaded, start next state
    game.state.start(this.nextState, true, false, this.nextStateParams);
  }
}
