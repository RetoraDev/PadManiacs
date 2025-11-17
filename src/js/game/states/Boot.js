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
  }
  create() {
    gamepad = new Gamepad(game);
    
    notifications = new NotificationSystem();
    
    game.time.advancedTiming = true;
    
    game.world.updateOnlyExistingChildren = true;
    
    game.onMenuIn = new Phaser.Signal();
    
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
        key: "ui_navigation_hint_keyboard",
        url: "ui/navigation_hint_keyboard.png",
        type: "spritesheet",
        frameWidth: 192,
        frameHeight: 112
      },
      {
        key: "ui_navigation_hint_gamepad",
        url: "ui/navigation_hint_gamepad.png",
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
        key: "ui_acurracy_bar",
        url: "ui/acurracy_bar.png"
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
      // Chart assets
      {
        key: "arrows",
        url: "chart/arrows.png",
        type: 'spritesheet',
        frameWidth: 16,
        frameHeight: 16
      },
      {
        key: "receptor",
        url: "chart/receptor.png",
        type: 'spritesheet', 
        frameWidth: 16,
        frameHeight: 16
      },
      {
        key: "explosion",
        url: "chart/explosion.png",
        type: 'image'
      },
      {
        key: "mineexplosion", 
        url: "chart/mine_explosion.png",
        type: 'image'
      },
      {
        key: "mine",
        url: "chart/mine.png",
        type: 'spritesheet',
        frameWidth: 16,
        frameHeight: 16
      },
      {
        key: "hold_end",
        url: "chart/hold_end.png",
        type: 'spritesheet',
        frameWidth: 16, 
        frameHeight: 8
      },
      {
        key: "hold_body",
        url: "chart/hold_body.png",
        type: 'spritesheet',
        frameWidth: 16,
        frameHeight: 112
      },
      {
        key: "roll_end", 
        url: "chart/roll_end.png",
        type: 'spritesheet',
        frameWidth: 16,
        frameHeight: 8
      },
      {
        key: "roll_body",
        url: "chart/roll_body.png",
        type: 'spritesheet',
        frameWidth: 16,
        frameHeight: 16
      }
    ];
    
    window.addEventListener('keydown', (event) => {
      // Only process if we're in the game and not in an input field
      if (document.activeElement.tagName === 'INPUT') return;
      
      switch(event.code) {
        case 'F8': // Screenshot
          event.preventDefault();
          if (game.recorder) {
            game.recorder.screenshot();
          }
          break;
          
        case 'F9': // Start/Stop recording
          event.preventDefault();
          if (game.recorder.isRecording) {
            game.recorder.stop();
          } else {
            game.recorder.start();
          }
          break;
          
        case 'F10': // Record next game
          event.preventDefault();
          window.recordNextGame = true;
          break;
      }
    });
    
    game.state.start("Load", true, false, window.gameResources, "LoadCordova");
  }
}
