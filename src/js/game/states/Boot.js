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
  create() {
    gamepad = new Gamepad(game, Account.mapping?.keyboard, Account.mapping?.gamepad);

    notifications = new NotificationSystem();
    
    achievementsManager = new AchievementsManager();
    achievementsManager.initialize();

    game.time.advancedTiming = true;

    game.world.updateOnlyExistingChildren = true;

    game.onMenuIn = new Phaser.Signal();

    game.state.add("Load", Load);
    game.state.add("LoadCordova", LoadCordova);
    game.state.add("LoadAddons", LoadAddons);
    game.state.add("LoadLocalSongs", LoadLocalSongs);
    game.state.add("LoadExternalSongs", LoadExternalSongs);
    game.state.add("LoadSongFolder", LoadSongFolder);
    game.state.add("Title", Title);
    game.state.add("MainMenu", MainMenu);
    game.state.add("SongSelect", SongSelect);
    game.state.add("CharacterSelect", CharacterSelect);
    game.state.add("AchievementsMenu", AchievementsMenu);
    game.state.add("StatsMenu", StatsMenu);
    game.state.add("Play", Play);
    game.state.add("Results", Results);
    game.state.add("Editor", Editor);
    game.state.add("Jukebox", Jukebox);
    game.state.add("Credits", Credits);

    window.primaryAssets = this.keys;

    window.gameResources = [
      {
        key: "ui_loading_dots",
        url: "ui/loading_dots.png",
        type: "spritesheet",
        frameWidth: 26,
        frameHeight: 6
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
        key: "ui_hud_background",
        url: "ui/hud_background.png"
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
        key: "ui_navigation_hint_screens",
        url: "ui/navigation_hint_screens.png",
        type: "spritesheet",
        frameWidth: 192,
        frameHeight: 112
      },
      {
        key: "ui_glitch_animation",
        url: "ui/glitch_animation.png",
        type: "spritesheet",
        frameWidth: 192,
        frameHeight: 112
      },
      {
        key: "ui_difficulty_banner",
        url: "ui/difficulty_banner.png"
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
        key: "ui_jukebox_pause_toggle",
        url: "ui/jukebox_pause_toggle.png",
        type: "spritesheet",
        frameWidth: 12,
        frameHeight: 12
      },
      {
        key: "ui_jukebox_seek",
        url: "ui/jukebox_seek.png",
        type: "spritesheet",
        frameWidth: 8,
        frameHeight: 8
      },
      {
        key: "ui_jukebox_skip",
        url: "ui/jukebox_skip.png",
        type: "spritesheet",
        frameWidth: 8,
        frameHeight: 8
      },
      {
        key: "ui_jukebox_menu",
        url: "ui/jukebox_menu.png",
        type: "spritesheet",
        frameWidth: 8,
        frameHeight: 8
      },
      {
        key: "ui_jukebox_visualization",
        url: "ui/jukebox_visualization.png",
        type: "spritesheet",
        frameWidth: 8,
        frameHeight: 8
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
        frameWidth: 16,
        frameHeight: 16
      },
      {
        key: "receptor",
        url: "chart/receptor.png",
        type: "spritesheet",
        frameWidth: 16,
        frameHeight: 16
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
        frameWidth: 16,
        frameHeight: 16
      },
      {
        key: "hold_end",
        url: "chart/hold_end.png",
        type: "spritesheet",
        frameWidth: 16,
        frameHeight: 8
      },
      {
        key: "hold_body",
        url: "chart/hold_body.png",
        type: "spritesheet",
        frameWidth: 16,
        frameHeight: 112
      },
      {
        key: "roll_end",
        url: "chart/roll_end.png",
        type: "spritesheet",
        frameWidth: 16,
        frameHeight: 8
      },
      {
        key: "roll_body",
        url: "chart/roll_body.png",
        type: "spritesheet",
        frameWidth: 16,
        frameHeight: 16
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
        frameWidth: 36,
        frameHeight: 7
      }
    ];

    window.addEventListener("keydown", event => {
      // Only process if we're in the game and not in an input field
      if (document.activeElement.tagName === "INPUT") return;

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
