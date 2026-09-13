/**
 * @class AddonManager
 * @category Addon System Classes
 * @summary Manages addon loading, execution, hibernation, and safe mode
 * @constructor
 * @features
 * Discovers and loads addons from the external storage directory
 * Executes addon behaviours in sandboxed contexts per game state
 * Supports enable, disable, hibernate, and wake lifecycle operations
 * Manages addon assets for Phaser resource loading
 * Provides safe mode to skip all addon loading on startup
 * @description
 * AddonManager handles the full lifecycle of game addons: loading manifests
 * from disk, registering assets with Phaser, executing behaviour scripts
 * at state transitions, and persisting enabled/disabled/hibernating state
 * to the player account. Safe mode allows the game to start without running
 * any addon code when a problematic addon is detected.
 * @example
 * // Listing all loaded addons and their status
 * const mgr = new AddonManager();
 * await mgr.initialize();
 * mgr.getAddonList().forEach(addon => {
 *   console.log(`${addon.name} v${addon.version}: ${addon.isEnabled ? 'enabled' : 'disabled'}`);
 * });
 *
 * // Executing state behaviours when entering a game state
 * mgr.executeStateBehaviors('Gameplay', gameState, { difficulty: 'Hard' });
 */
class AddonManager {
  constructor() {
    /** @type {Map<string, Object>} Map of addon IDs to addon descriptor objects */
    this.addons = new Map();
    /** @type {Set<string>} Set of enabled addon IDs */
    this.enabledAddons = new Set();
    /** @type {Set<string>} Set of hibernating addon IDs */
    this.hibernatingAddons = new Set();
    /** @type {boolean} Whether safe mode is active, preventing addon loading */
    this.safeMode = false;
    /** @type {boolean} Whether the manager has finished initialising */
    this.isInitialized = false;
  }

  /**
   * Initialises the addon manager by loading saved settings and discovering addons.
   * Skips loading entirely when safe mode is enabled.
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) return;
    
    // Load addon settings from account
    this.safeMode = Account.settings?.safeMode || false;
    this.enabledAddons = new Set(Account.settings?.enabledAddons || []);
    this.hibernatingAddons = new Set(Account.settings?.hibernatingAddons || []);
    
    if (this.safeMode) {
      console.log("Addon Safe Mode enabled: skipping addon loading");
      this.isInitialized = true;
      return;
    }

    await this.loadAddons();
    this.isInitialized = true;
  }

  /**
   * Orchestrates addon discovery from storage and processing of enabled addons.
   * @returns {Promise<void>}
   */
  async loadAddons() {
    try {
      console.log("Loading addons...");
      
      await this.loadAddonsFromStorage();
      
      await this.processAddons();
      
    } catch (error) {
      console.error("Error loading addons:", error);
    }
  }

  /**
   * Scans the addons directory on the file system and loads each addon.
   * @returns {Promise<void>}
   */
  async loadAddonsFromStorage() {
    const fileSystem = new FileSystemTools();
    
    try {
      const rootDir = await fileSystem.getDirectory(EXTERNAL_DIRECTORY + ADDONS_DIRECTORY);
      const addonDirs = await fileSystem.listDirectories(rootDir);
      
      console.log(`Found ${addonDirs.length} addon directories`);
      
      for (const addonDir of addonDirs) {
        try {
          await this.loadAddonFromDirectory(addonDir, fileSystem);
        } catch (error) {
          console.warn(`Failed to load addon from ${addonDir.name}:`, error);
        }
      }
    } catch (error) {
      console.log("No external addons directory found");
    }
  }

  /**
   * Loads a single addon from its directory, reading its manifest and files.
   * @param {Object} addonDir - The directory entry for the addon
   * @param {FileSystemTools} fileSystem - The file system instance
   * @returns {Promise<void>}
   */
  async loadAddonFromDirectory(addonDir, fileSystem) {
    const files = await fileSystem.listFiles(addonDir);
    const fileMap = {};
    
    for (const fileEntry of files) {
      const file = await fileSystem.getFile(fileEntry);
      fileMap[file.name.toLowerCase()] = {
        entry: fileEntry,
        file: file,
        name: file.name
      };
    }
    
    // Check for manifest
    const manifestFile = fileMap['manifest.json'];
    if (!manifestFile) {
      throw new Error("No manifest.json found");
    }
    
    const manifestContent = await fileSystem.readFileContent(manifestFile.file);
    const manifest = JSON.parse(manifestContent);
    
    // Validate manifest
    if (!manifest.id || !manifest.name || !manifest.version) {
      throw new Error("Invalid manifest: missing required fields");
    }
    
    const addon = {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      icon: manifest.icon,
      author: manifest.author || "Unknown",
      description: manifest.description || "",
      manifest: manifest,
      directory: addonDir,
      dir: addonDir,
      files: fileMap,
      assets: [],
      behaviors: {},
      isEnabled: this.enabledAddons.has(manifest.id) && !this.hibernatingAddons.has(manifest.id),
      isHibernating: this.hibernatingAddons.has(manifest.id)
    };
    
    if (manifest.icon) {
      addon.icon = addon.dir.nativeURL + manifest.icon;
    }
    
    this.processAddonAssets(addon);
    
    this.addons.set(addon.id, addon);
    console.log(`Loaded addon: ${addon.name} v${addon.version} (${addon.isEnabled ? 'enabled' : 'disabled'})`);
  }

  /**
   * Processes assets and behaviours for all enabled addons.
   * @returns {Promise<void>}
   */
  async processAddons() {
    // Process assets and behaviors for enabled addons
    for (const [addonId, addon] of this.addons) {
      if (!addon.isEnabled) continue;
      
      try {
        await this.processAddonBehaviors(addon);
      } catch (error) {
        console.error(`Failed to process addon ${addon.name}:`, error);
      }
    }
  }

  /**
   * Registers addon assets from the manifest into the addon's asset list.
   * @param {Object} addon - The addon descriptor object
   */
  processAddonAssets(addon) {
    const assetsManifest = addon.manifest.assets;
    if (!assetsManifest) return;
    
    const defaultResources = {};
    window.gameResources.forEach(res => defaultResources[res.key] = res);
    
    for (const [assetKey, assetValue] of Object.entries(assetsManifest)) {
      const assetTypes = {
        txt: 'text',
        csv: 'text',
        json: 'json',
        mp3: 'audio',
        ogg: 'audio',
        wav: 'audio',
        webm: 'video',
        mp4: 'video',
        jpg: 'image',
        jpeg: 'image',
        png: 'image',
        gif: 'image',
        webp: 'image',
        ...(addon.manifest.assetTypes || {})
      };
      
      let assetUrl, assetType, extension;
      
      if (typeof assetValue == 'object') {
        extension = FileTools.getExtension(assetValue.path);
        assetUrl = addon.dir.nativeURL + assetValue.path;
        assetType = assetValue.type || assetTypes[extension] || "image";
      } else {
        extension = FileTools.getExtension(assetValue);
        assetUrl = addon.dir.nativeURL + assetValue;
        assetType = assetTypes[extension] || "image";
      }
      
      const addonAssets = addon.assets;
      
      if (defaultResources[assetKey]) {
        addon.assets.push({
          ...defaultResources[assetKey],
          key: assetKey,
          url: assetUrl
        });
      } else {
        addon.assets.push({
          type: assetType,
          key: assetKey,
          url: assetUrl
        });
      }
    }
  }

  /**
   * Loads behaviour script content for each state defined in the manifest.
   * @param {Object} addon - The addon descriptor object
   * @returns {Promise<void>}
   */
  async processAddonBehaviors(addon) {
    const behaviorsManifest = addon.manifest.behaviors;
    if (!behaviorsManifest) return;
    
    for (const [stateName, behaviorPath] of Object.entries(behaviorsManifest)) {
      const behaviorUrl = addon.dir.nativeURL + behaviorPath;
            
      const content = await this.loadTextFile(behaviorUrl);
      addon.behaviors[stateName] = { 
        content,
        stateName
      };
    }
  }
  
  async loadTextFile(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          resolve(null);
        }
      };
      xhr.onerror = () => resolve(null);
      xhr.send();
    });
  }

  async readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /**
   * Executes a behaviour script for an addon in a sandboxed context.
   * @param {Object} addon - The addon descriptor
   * @param {string} stateName - The game state name the behaviour targets
   * @param {Object} context - The execution context (global, state, etc.)
   * @param {Object} [extraParams] - Additional parameters to inject
   */
  executeBehavior(addon, stateName, context, extraParams) {
    const behavior = addon.behaviors[stateName];
    if (!behavior) return;
    
    try {
      // Create a safe execution context
      const safeContext = {
        global: context.global,
        game: game,
        state: context.state,
        addon: addon,
        console: console,
        ...(extraParams || {})
      };
      
      // Execute in a controlled environment
      const func = new Function(
        ...Object.keys(safeContext),
        `${behavior.content}`
      );
      
      func.call(context.global || window, ...Object.values(safeContext));
      
    } catch (error) {
      console.error(`Error executing behavior for ${addon.name} in ${stateName}:`, error);
    }
  }

  /**
   * Runs the 'Global' behaviour for all active, non-hibernating addons.
   */
  executeGlobalBehaviors() {
    for (const [addonId, addon] of this.addons) {
      if (addon.isHibernating || !addon.isEnabled) continue;
      this.executeBehavior(addon, 'Global', { game, global: window });
    }
  }

  /**
   * Runs behaviours for a specific game state across all active addons.
   * @param {string} stateName - The game state name
   * @param {Object} stateInstance - The Phaser state instance
   * @param {Object} [extraParams] - Additional parameters to pass
   */
  executeStateBehaviors(stateName, stateInstance, extraParams) {
    for (const [addonId, addon] of this.addons) {
      if (addon.isHibernating || !addon.isEnabled) continue;
      this.executeBehavior(addon, stateName, {
        game: game,
        global: stateInstance,
        state: stateInstance,
        stateName: stateName,
        extraParams: extraParams
      });
    }
  }

  /**
   * Splits a version string into a three-element numeric array.
   * @param {string} version - A semver-style version string
   * @returns {Array<number>} Array of [major, minor, patch]
   */
  parseVersion(version) {
    const parts = version.split('.').map(part => parseInt(part, 10) || 0);
    while (parts.length < 3) parts.push(0);
    return parts;
  }

  /**
   * Compares two parsed version arrays.
   * @param {Array<number>} v1 - The first version array
   * @param {Array<number>} v2 - The second version array
   * @returns {number} 1 if v1 > v2, -1 if v1 < v2, 0 if equal
   */
  compareVersions(v1, v2) {
    for (let i = 0; i < 3; i++) {
      if (v1[i] > v2[i]) return 1;
      if (v1[i] < v2[i]) return -1;
    }
    return 0;
  }

  /**
   * Enables an addon and persists the setting.
   * @param {string} addonId - The addon ID to enable
   * @returns {boolean} True if the addon was found and enabled
   */
  enableAddon(addonId) {
    const addon = this.addons.get(addonId);
    if (addon) {
      addon.isEnabled = true;
      this.enabledAddons.add(addonId);
      this.hibernatingAddons.delete(addonId);
      this.saveAddonSettings();
      return true;
    }
    return false;
  }

  /**
   * Disables an addon and persists the setting.
   * @param {string} addonId - The addon ID to disable
   * @returns {boolean} True if the addon was found and disabled
   */
  disableAddon(addonId) {
    const addon = this.addons.get(addonId);
    if (addon) {
      addon.isEnabled = false;
      this.enabledAddons.delete(addonId);
      this.saveAddonSettings();
      return true;
    }
    return false;
  }
  
  /**
   * Moves an addon into hibernation, disabling it until explicitly woken.
   * @param {string} addonId - The addon ID to hibernate
   * @returns {boolean} True if the addon was found and hibernated
   */
  hibernateAddon(addonId) {
    const addon = this.addons.get(addonId);
    if (addon) {
      addon.isEnabled = false;
      addon.isHibernating = true;
      this.enabledAddons.delete(addonId);
      this.hibernatingAddons.add(addonId);
      this.saveAddonSettings();
      return true;
    }
    return false;
  }
  
  /**
   * Wakes a hibernating addon, re-enabling it.
   * @param {string} addonId - The addon ID to wake
   * @returns {boolean} True if the addon was found and woken
   */
  wakeAddon(addonId) {
    const addon = this.addons.get(addonId);
    if (addon && addon.isHibernating) {
      addon.isEnabled = true;
      addon.isHibernating = false;
      this.enabledAddons.add(addonId);
      this.hibernatingAddons.delete(addonId);
      this.saveAddonSettings();
      return true;
    }
    return false;
  }

  /**
   * Permanently removes an addon by deleting its directory and registry entry.
   * @param {string} addonId - The addon ID to uninstall
   * @returns {boolean} True if the addon was found and removed
   */
  uninstallAddon(addonId) {
    const addon = this.addons.get(addonId);
    if (addon) {
      addon.dir.removeRecursively();
      this.addons.delete(addonId);
      return true;
    }
    return false;
  }
  
  /**
   * Enables or disables safe mode globally.
   * @param {boolean} enabled - Whether safe mode should be active
   */
  setSafeMode(enabled) {
    this.safeMode = enabled;
    Account.settings.safeMode = enabled;
    saveAccount();
  }

  /**
   * Returns a serialisable list of all loaded addons with their status.
   * @returns {Array<Object>} Array of addon summary objects
   */
  getAddonList() {
    return Array.from(this.addons.values()).map(addon => ({
      id: addon.id,
      name: addon.name,
      version: addon.version,
      author: addon.author,
      description: addon.description,
      isEnabled: addon.isEnabled,
      isHibernating: addon.isHibernating,
      icon: addon.icon,
      assets: addon.assets,
      behaviors: addon.behaviors,
      hasAssets: Object.keys(addon.assets).length > 0,
      hasBehaviors: Object.keys(addon.behaviors).length > 0
    }));
  }
  
  /**
   * Collects all assets from active, non-hibernating addons for Phaser loading.
   * @returns {Array<Object>} Combined asset list
   */
  getResourceList() {
    let resources = [];
    
    const addons = Array.from(this.addons.values());
    
    addons.forEach(addon => {
      if (!addon.isHibernating && addon.isEnabled) {
        resources = [
          ...resources,
          ...addon.assets
        ];
      }
    });
    
    return resources;
  }

  /**
   * Persists the current enabled, hibernating, and safe mode state to the account.
   */
  saveAddonSettings() {
    Account.settings.enabledAddons = Array.from(this.enabledAddons);
    Account.settings.hibernatingAddons = Array.from(this.hibernatingAddons);
    Account.settings.safeMode = this.safeMode;
    saveAccount();
  }

  /**
   * Checks whether the saved settings differ from the current in-memory state.
   * @returns {boolean} True if a reload is required to apply changes
   */
  needsReload() {
    // Check if any changes were made that require a reload
    const currentEnabled = new Set(Account.settings?.enabledAddons || []);
    const currentHibernating = new Set(Account.settings?.hibernatingAddons || []);
    const currentSafeMode = Account.settings?.safeMode || false;
    
    return !this.setsEqual(currentEnabled, this.enabledAddons) ||
           !this.setsEqual(currentHibernating, this.hibernatingAddons) ||
           currentSafeMode !== this.safeMode;
  }

  /**
   * Tests whether two Sets contain the same elements.
   * @param {Set} set1 - The first set
   * @param {Set} set2 - The second set
   * @returns {boolean} True if both sets are equal
   */
  setsEqual(set1, set2) {
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }
}