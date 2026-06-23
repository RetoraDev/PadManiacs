class Boot {
  preload() {
    this.load.baseURL = "assets/";

    this.keys = [];

    Object.keys(FONTS).forEach(key => {
      const entry = FONTS[key];
      this.load.spritesheet(entry.font, `fonts/${key}.png`, entry.fontWidth || 4, entry.fontHeight || 6);
    });

    WINDOW_PANELS.forEach(key => {
      this.load.spritesheet(`ui_window_${key}`, `ui/window_${key}.png`, 8, 8);
      this.keys.push(`ui_window_${key}`);
    });
    
    // Check if game crashed last time
    this.checkForCrashRecovery();
  }
  checkForCrashRecovery() {
    const lastCrashed = localStorage.getItem('gameLastCrashed');
    if (lastCrashed === 'true') {
      // Clear the flag
      localStorage.removeItem('gameLastCrashed');
      
      // Set flag in account to show bug report dialog later
      Account.stats.lastCrashed = true;
      saveAccount();
    }
  }
  fixSettings() {
    const currentVersion = DEFAULT_ACCOUNT.version;
    const oldVersion = Account.version;
    const difference = currentVersion - oldVersion;
    
    if (Math.abs(difference) > 0) console.log('Migrating:', oldVersion, '->', currentVersion);
    
    // Fix settings from old versions
    if (!oldVersion) {
      // Try to migrate settings and progress
      Account = {
        ...DEFAULT_ACCOUNT,
        settings: {
          ...DEFAULT_ACCOUNT.settings,
          ...Account.settings
        },
        characters: {
          ...DEFAULT_ACCOUNT.characters,
          ...Account.characters
        },
        stats: {
          ...DEFAULT_ACCOUNT.stats,
          ...Account.stats
        },
        achievements: Account.achievements,
        highscores: Account.highscores,
      };
    }
    
    // Reset keyboard mapping for older versions that didn't have two players
    if (!Account.mapping || !Account.mapping.keyboard.player1 || !Account.mapping.gamepad.player1) {
      Account.mapping = DEFAULT_ACCOUNT.mapping;
    }
    
    // Add background opacity field 
    if (isNaN(Account.settings.backgroundOpacity) || typeof Account.settings.backgroundOpacity == undefined) Account.settings.backgroundOpacity = 0.3; 
    
    // Add SFX volume field
    if (!Account.settings.sfxVolume && Account.settings.sfxVolume != 0) Account.settings.sfxVolume = 100;
    
    const forceMigrateCharacters = false;
    
    // Version 1.1 has better character customization
    if (oldVersion < 1.1 || forceMigrateCharacters) {
      // Convert old version characters to new character system
      Account.characters.list = Account.characters.list.map(character => {
        console.log('Migrating', character.name);
        
        if (!forceMigrateCharacters && typeof character.appearance.tints != 'undefined') {
          console.log(character.name, 'is already compatible with current version');
          return character;
        }
        
        const newCharacter = structuredClone(character);
        
        newCharacter.appearance.clothing = DEFAULT_CHARACTER.appearance.clothing;
        newCharacter.appearance.tints = DEFAULT_CHARACTER.appearance.tints;
        newCharacter.appearance.tints.hair = character.appearance.hairColor;
        
        return newCharacter;
      });
      
      // Reset clothing unlock state
      Account.characters.unlockedItems = DEFAULT_ACCOUNT.characters.unlockedItems;
      
      console.log('Character list converted!');
    }
    
    // Fix broken unlocked items
    if (!Account.characters.unlockedItems) {
      Account.characters.unlockedItems = [];
    }
    
    if (currentVersion >= 1.1) {
      // Ensure default items are always unlocked
      const defaultItems = ['top_seifuku_default', 'bottom_skirt_blue', 'shoes_common'];
      for (const itemId of defaultItems) {
        if (!Account.characters.unlockedItems.includes(itemId)) {
          Account.characters.unlockedItems.push(itemId);
        }
      }
    }
    
    // Add lyrics settings
    if (typeof Account.settings.enableLyrics == 'undefined') {
      Account.settings.enableLyrics = true;
    }
    if (typeof Account.settings.lyricsPosition == 'undefined') {
      Account.settings.lyricsPosition = 0;
    }
      
    Account.version = currentVersion;
    saveAccount();
  }
  create() {
    notifications = new NotificationSystem();
    
    this.fixSettings();

    window.inputManager = new InputManager(game);
    
    achievementsManager = new AchievementsManager();
    achievementsManager.initialize();
    
    mouse = new MouseCursor();

    game.time.advancedTiming = true;

    game.world.updateOnlyExistingChildren = true;

    game.onMenuIn = new Phaser.Signal();

    game.state.add("Load", Load);
    game.state.add("LoadCordova", LoadCordova);
    game.state.add("LoadAddons", LoadAddons);
    game.state.add("LoadLocalSongs", LoadLocalSongs);
    game.state.add("LoadExternalSongs", LoadExternalSongs);
    game.state.add("LoadSongFolder", LoadSongFolder);
    game.state.add("LoadExternalSongFile", LoadExternalSongFile);
    game.state.add("Title", Title);
    game.state.add("MainMenu", MainMenu);
    game.state.add("Addons", Addons);
    game.state.add("Settings", Settings);
    game.state.add("ChartModifiers", ChartModifiers);
    game.state.add("Keybindings", Keybindings);
    game.state.add("SongSelect", SongSelect);
    game.state.add("FileSelect", FileSelect);
    game.state.add("CharacterSelect", CharacterSelect);
    game.state.add("AchievementsMenu", AchievementsMenu);
    game.state.add("StatsMenu", StatsMenu);
    game.state.add("Play", Play);
    game.state.add("PlayMulti", PlayMulti);
    game.state.add("Results", Results);
    game.state.add("ResultsMulti", ResultsMulti);
    game.state.add("Editor", Editor);
    game.state.add("Jukebox", Jukebox);
    game.state.add("Credits", Credits);

    window.primaryAssets = this.keys;

    window.gameResources = [
      {
        key: "ui_loading_dots",
        url: "ui/loading_dots.png",
        type: "spritesheet",
        frameWidth: 31,
        frameHeight: 7
      },
      {
        key: "ui_background_gradient",
        url: "ui/background_gradient.png"
      },
      {
        key: "ui_logo_shape",
        url: "ui/logo_shape.png"
      },
      {
        key: "ui_hud_background_top",
        url: "ui/hud_background_top.png"
      },
      {
        key: "ui_hud_background_bottom",
        url: "ui/hud_background_bottom.png"
      },
      {
        key: "ui_hud_background_top_multi",
        url: "ui/hud_background_top_multi.png"
      },
      {
        key: "ui_hud_background_bottom_multi",
        url: "ui/hud_background_bottom_multi.png"
      },
      {
        key: "ui_hud_player_parent_multi",
        url: "ui/hud_player_parent_multi.png",
        type: "spritesheet",
        frameWidth: 240,
        frameHeight: 140
      },
      {
        key: "ui_hud_flash_shape",
        url: "ui/hud_flash_shape.png",
      },
      {
        key: "ui_hud_flash_shape_multi",
        url: "ui/hud_flash_shape_multi.png",
      },
      {
        key: "ui_editor_icons",
        url: "ui/editor_icons.png",
        type: "spritesheet",
        frameWidth: 8,
        frameHeight: 8
      },
      {
        key: "ui_lobby_background",
        url: "ui/lobby_background.png"
      },
      {
        key: "ui_lobby_overlay",
        url: "ui/lobby_overlay.png"
      },
      {
        key: "ui_icons",
        url: "ui/icons.png",
        type: "spritesheet",
        frameWidth: 8,
        frameHeight: 8
      },
      {
        key: "ui_navigation_icons",
        url: "ui/navigation_icons.png",
        type: "spritesheet",
        frameWidth: 10,
        frameHeight: 10
      },
      {
        key: "ui_navigation_key",
        url: "ui/navigation_key.png",
        type: "spritesheet",
        frameWidth: 4,
        frameHeight: 9
      },
      {
        key: "ui_keyboard",
        url: "ui/keyboard.png",
        type: "spritesheet",
        frameWidth: 119,
        frameHeight: 55
      },
      {
        key: "ui_keyboard_numeric",
        url: "ui/keyboard_numeric.png"
      },
      {
        key: "ui_glitch_animation",
        url: "ui/glitch_animation.png",
        type: "spritesheet",
        frameWidth: 240,
        frameHeight: 140
      },
      {
        key: "ui_difficulty_banner",
        url: "ui/difficulty_banner.png"
      },
      {
        key: "ui_difficulty_banner_multi",
        url: "ui/difficulty_banner_multi.png"
      },
      {
        key: "ui_lifebar",
        url: "ui/lifebar.png",
        type: "spritesheet",
        frameWidth: 1,
        frameHeight: 5
      },
      {
        key: "ui_skill_bar",
        url: "ui/skill_bar.png",
        type: "spritesheet",
        frameWidth: 2,
        frameHeight: 2
      },
      {
        key: "ui_accuracy_bar",
        url: "ui/accuracy_bar.png"
      },
      {
        key: "ui_accuracy_bar_multi",
        url: "ui/accuracy_bar_multi.png"
      },
      {
        key: "ui_mouse_cursor",
        url: "ui/mouse_cursor.png",
        type: "spritesheet",
        frameWidth: 6,
        frameHeight: 6
      },
      {
        key: "ui_jukebox_pause_toggle",
        url: "ui/jukebox_pause_toggle.png",
        type: "spritesheet",
        frameWidth: 16,
        frameHeight: 16
      },
      {
        key: "ui_jukebox_seek",
        url: "ui/jukebox_seek.png",
        type: "spritesheet",
        frameWidth: 9,
        frameHeight: 9
      },
      {
        key: "ui_jukebox_skip",
        url: "ui/jukebox_skip.png",
        type: "spritesheet",
        frameWidth: 9,
        frameHeight: 9
      },
      {
        key: "ui_jukebox_menu",
        url: "ui/jukebox_menu.png",
        type: "spritesheet",
        frameWidth: 9,
        frameHeight: 9
      },
      {
        key: "ui_jukebox_visualization",
        url: "ui/jukebox_visualization.png",
        type: "spritesheet",
        frameWidth: 9,
        frameHeight: 9
      },
      {
        key: "ui_addon_no_image",
        url: "ui/addon_no_image.png",
      },
      {
        key: "ui_banner_no_image",
        url: "ui/banner_no_image.png",
      },
      {
        key: "ui_banner_no_image_small",
        url: "ui/banner_no_image_small.png",
      },
      // Sfx
      {
        key: "assist_tick",
        type: "audio",
        url: "sfx/assist_tick.ogg"
      },
      {
        key: "level_up",
        type: "audio",
        url: "sfx/level_up.ogg"
      },
      {
        key: "exp_up",
        type: "audio",
        url: "sfx/exp_up.ogg"
      },
      {
        key: "full_combo",
        type: "audio",
        url: "sfx/full_combo.ogg"
      },
      {
        key: "ui_select",
        type: "audio",
        url: "sfx/ui_select.ogg"
      },
      {
        key: "ui_cancel",
        type: "audio",
        url: "sfx/ui_cancel.ogg"
      },
      {
        key: "ui_nav",
        type: "audio",
        url: "sfx/ui_nav.ogg"
      },
      {
        key: "ui_error",
        type: "audio",
        url: "sfx/ui_error.ogg"
      },
      {
        key: "ui_notification",
        type: "audio",
        url: "sfx/ui_notification.ogg"
      },
      {
        key: "unlock",
        type: "audio",
        url: "sfx/unlock.ogg"
      },
      // Chart assets
      {
        key: "arrows",
        url: "chart/arrows.png",
        type: "spritesheet",
        frameWidth: 20,
        frameHeight: 20
      },
      {
        key: "judgement",
        url: "chart/judgement.png",
        type: "spritesheet",
        frameWidth: 60,
        frameHeight: 7
      },
      {
        key: "receptor",
        url: "chart/receptor.png",
        type: "spritesheet",
        frameWidth: 20,
        frameHeight: 20
      },
      {
        key: "explosion",
        url: "chart/explosion.png",
        type: "image"
      },
      {
        key: "mineexplosion",
        url: "chart/mine_explosion.png",
        type: "image"
      },
      {
        key: "mine",
        url: "chart/mine.png",
        type: "spritesheet",
        frameWidth: 20,
        frameHeight: 20
      },
      {
        key: "hold_end",
        url: "chart/hold_end.png",
        type: "spritesheet",
        frameWidth: 20,
        frameHeight: 10
      },
      {
        key: "hold_body",
        url: "chart/hold_body.png",
        type: "spritesheet",
        frameWidth: 20,
        frameHeight: 140
      },
      {
        key: "roll_end",
        url: "chart/roll_end.png",
        type: "spritesheet",
        frameWidth: 20,
        frameHeight: 10
      },
      {
        key: "roll_body",
        url: "chart/roll_body.png",
        type: "spritesheet",
        frameWidth: 20,
        frameHeight: 140
      },
      // Character assets
      {
        key: "character_base",
        url: "character/base.png",
        type: "spritesheet",
        frameWidth: 100,
        frameHeight: 100
      },
      {
        key: "character_eyes",
        url: "character/eyes.png",
        type: "spritesheet",
        frameWidth: 100,
        frameHeight: 100
      },
      // Hair styles
      ...(() => {
        const resources = [];
        // Front hairs
        for (let i = 1; i <= CHARACTER_SYSTEM.HAIR_STYLES.front.length; i++) {
          resources.push({
            key: `character_front_hair_${i}`,
            url: `character/front_hair_${i}.png`,
            type: "spritesheet",
            frameWidth: 100,
            frameHeight: 100
          });
        }
        // Back hairs
        for (let i = 1; i <= CHARACTER_SYSTEM.HAIR_STYLES.back.length; i++) {
          resources.push({
            key: `character_back_hair_${i}`,
            url: `character/back_hair_${i}.png`,
            type: "spritesheet",
            frameWidth: 100,
            frameHeight: 100
          });
        }
        return resources;
      })(),
      // Clothing and accessories
      ...(() => {
        const resources = [];
        CHARACTER_ITEMS.forEach(item => {
          if (item.isAura) return;
          if (item.layers) {
            for (let i = 0; i < item.layers.length; i++) {
              const layer = item.layers[i];
              resources.push({
                key: `character_item_${item.id}_layer${i}`,
                url: `character/${ layer.sprite ? layer.sprite : `${item.id}_layer${i}.png` }`,
                type: "spritesheet",
                frameWidth: 100,
                frameHeight: 100
              });
            };
          } else {
            resources.push({
              key: `character_item_${item.id}`,
              url: `character/${item.id}.png`,
              type: "spritesheet",
              frameWidth: 100,
              frameHeight: 100
            });
          }
        });
        return resources;
      })(),
      // Auras
      ...(() => {
        const auras = CHARACTER_ITEMS.filter(item => item.isAura);
        let particles = [];
        
        auras.forEach(aura => {
          particles = [...particles, ...aura.particle.keys];
        });
        
        return particles.map(key => ({
          key: key,
          url: `character/${key}.png`,
          type: 'spritesheet',
          frameWidth: 16,
          frameHeight: 16
        }));
      })(),
      {
        key: "character_noise",
        url: "ui/character_noise.png",
        type: "spritesheet",
        frameWidth: 46,
        frameHeight: 7
      }
    ];
    
    game.state.start("Load", true, false, window.gameResources, "LoadCordova");
  }
}
