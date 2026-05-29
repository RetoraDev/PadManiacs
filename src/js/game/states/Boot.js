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
    
    if (isNaN(Account.settings.backgroundOpacity)) Account.settings.backgroundOpacity = 0.3; 
    
    Account.version = currentVersion;
    saveAccount();
  }
  create() {
    window.inputManager = new InputManager(game);

    notifications = new NotificationSystem();
    
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
        CHARACTER_ITEMS.clothing.forEach(item => {
          resources.push({
            key: `character_clothing_${item.id}`,
            url: `character/${item.id}.png`,
            type: "spritesheet",
            frameWidth: 100,
            frameHeight: 100
          });
        });
        CHARACTER_ITEMS.accessories.forEach(item => {
          resources.push({
            key: `character_accessory_${item.id}`,
            url: `character/${item.id}.png`,
            type: "spritesheet",
            frameWidth: 100,
            frameHeight: 100
          });
        });
        return resources;
      })(),
      {
        key: "character_noise",
        url: "ui/character_noise.png",
        type: "spritesheet",
        frameWidth: 46,
        frameHeight: 7
      }
    ];

    window.addEventListener("keydown", event => {
      // Only process if we're in the game and not in an input field
      if (document.activeElement.tagName === "INPUT" || window.focusedElement) return;

      switch (event.code) {
        case "F8": // Screenshot
          event.preventDefault();
          if (game.recorder) {
            game.recorder.screenshot();
          }
          break;

        case "F9": // Start/Stop recording
          event.preventDefault();
          if (game.recorder.isRecording) {
            game.recorder.stop();
          } else {
            game.recorder.start();
          }
          break;

        case "F10": // Record next game
          event.preventDefault();
          window.recordNextGame = true;
          break;
      }
    });

    game.state.start("Load", true, false, window.gameResources, "LoadCordova");
  }
}
