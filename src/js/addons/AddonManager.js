class AddonManager {
  constructor() {
    this.addons = new Map();
    this.enabledAddons = new Set();
    this.hibernatingAddons = new Set();
    this.safeMode = false;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    // Load addon settings from account
    this.safeMode = Account.settings?.safeMode || false;
    this.enabledAddons = new Set(Account.settings?.enabledAddons || []);
    this.hibernatingAddons = new Set(Account.settings?.hibernatingAddons || []);
    
    if (this.safeMode) {
      console.log("🔒 Addon Safe Mode enabled - skipping addon loading");
      this.isInitialized = true;
      return;
    }

    await this.loadAddons();
    this.isInitialized = true;
  }

  async loadAddons() {
    try {
      console.log("📦 Loading addons...");
      
      await this.loadAddonsFromStorage();
      
      await this.processAddons();
      
    } catch (error) {
      console.error("Error loading addons:", error);
    }
  }

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
    console.log(`📦 Loaded addon: ${addon.name} v${addon.version} (${addon.isEnabled ? 'enabled' : 'disabled'})`);
  }

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

  processAddonAssets(addon) {
    const assetsManifest = addon.manifest.assets;
    if (!assetsManifest) return;
    
    const defaultResources = {};
    window.gameResources.forEach(res => defaultResources[res.key] = res);
    
    for (const [assetKey, assetPath] of Object.entries(assetsManifest)) {
      const assetUrl = addon.dir.nativeURL + assetPath;
      
      const addonAssets = addon.assets;
      
      if (defaultResources[assetKey]) {
        addon.assets.push({
          ...defaultResources[assetKey],
          key: assetKey,
          url: assetUrl
        });
      } else {
        addon.assets.push({
          type: "image",
          key: assetKey,
          url: assetUrl
        });
      }
    }
  }

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

  executeGlobalBehaviors() {
    for (const [addonId, addon] of this.addons) {
      if (addon.isHibernating || !addon.isEnabled) continue;
      this.executeBehavior(addon, 'Global', { game, global: window });
    }
  }

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

  parseVersion(version) {
    const parts = version.split('.').map(part => parseInt(part, 10) || 0);
    while (parts.length < 3) parts.push(0);
    return parts;
  }

  compareVersions(v1, v2) {
    for (let i = 0; i < 3; i++) {
      if (v1[i] > v2[i]) return 1;
      if (v1[i] < v2[i]) return -1;
    }
    return 0;
  }

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

  uninstallAddon(addonId) {
    const addon = this.addons.get(addonId);
    if (addon) {
      addon.dir.removeRecursively();
      this.addons.delete(addonId);
      return true;
    }
    return false;
  }
  
  setSafeMode(enabled) {
    this.safeMode = enabled;
    Account.settings.safeMode = enabled;
    saveAccount();
  }

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

  saveAddonSettings() {
    Account.settings.enabledAddons = Array.from(this.enabledAddons);
    Account.settings.hibernatingAddons = Array.from(this.hibernatingAddons);
    Account.settings.safeMode = this.safeMode;
    saveAccount();
  }

  needsReload() {
    // Check if any changes were made that require a reload
    const currentEnabled = new Set(Account.settings?.enabledAddons || []);
    const currentHibernating = new Set(Account.settings?.hibernatingAddons || []);
    const currentSafeMode = Account.settings?.safeMode || false;
    
    return !this.setsEqual(currentEnabled, this.enabledAddons) ||
           !this.setsEqual(currentHibernating, this.hibernatingAddons) ||
           currentSafeMode !== this.safeMode;
  }

  setsEqual(set1, set2) {
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }
}