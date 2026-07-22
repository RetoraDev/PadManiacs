class Settings {
  create() {
    this.futuristicLines = new FuturisticLines();
    this.backgroundGradient = new BackgroundGradient();
    this.navigationHint = new NavigationHint('general');
    
    this.windowManager = new WindowManager();
    
    gamepad.releaseAll();
    
    this.showSettings();
    
    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  update() {
    gamepad.update();
    this.windowManager.update();
  }
  
  showSettings() {
    const loading = new Text(game.width / 2, game.height / 2, __("Please Wait...||Espera..."));
    loading.anchor.set(0.5);
    
    game.time.events.add(100, () => {
      this.createSettingsWindow();
      loading.destroy();
    });
  }
  
  createSettingsWindow() {
    const settingsWindow = this.windowManager.createWindow(2, 1, 26, 15, "1");
    settingsWindow.fontTint = 0x76fcde;
    
    this.settingsWindow = settingsWindow;
    
    let restartNeeded = false;
    
    this.windowManager.focus(settingsWindow);
    
    // Music Volume
    settingsWindow.addRangeItem(
      __("(Music Playback Volume|Volumen de la Música)"),
      0,
      100,
      1,
      Account.settings.volume,
      "%",
      value => {
        Account.settings.volume = value;
        saveAccount();
        if (backgroundMusic && backgroundMusic.audio) {
          backgroundMusic.audio.volume = value / 100;
        }
      }
    );
    
    // Sfx Volume
    settingsWindow.addRangeItem(
      __("(Sound Effects Volume|Volumen de los Efectos)"),
      0,
      100,
      1,
      Account.settings.sfxVolume,
      "%",
      value => {
        Account.settings.sfxVolume = value;
        saveAccount();
        if (backgroundMusic && backgroundMusic.audio) {
          backgroundMusic.audio.volume = value / 100;
        }
      }
    );

    // Auto-play setting
    settingsWindow.addSettingItem(
      "Auto-play",
      [__("(Off|Apagado)"), __("(On|Activado)")], 
      Account.settings.autoplay ? 1 : 0,
      index => {
        Account.settings.autoplay = index === 1;
        saveAccount();
      }
    );
    
    // Metronome setting
    const metronomeOptions = [
      { key: 'Off', label: __("(Off|Apagado)") },
      { key: 'Note', label: __("(Note|Nota)") },
      { key: 'Quarters', label: __("(Quarters|Negras)") },
      { key: 'Eighths', label: __("(Eighths|Corcheas)") },
      { key: 'Sixteenths', label: __("(Sixteenths|Semicorcheas)") },
      { key: 'Thirty-seconds', label: __("(Thirty-seconds|Fusas)") }
    ];
    const currentMetronomeIndex = metronomeOptions.findIndex(opt => opt.key === (Account.settings.metronome || 'Off'));
    settingsWindow.addSettingItem(
      __("(Metronome|Metrónomo)"),
      metronomeOptions.map(opt => opt.label),
      currentMetronomeIndex,
      index => {
        Account.settings.metronome = metronomeOptions[index].key;
        saveAccount();
      }
    );
        
    // Visualizer 
    const visualizerOptions = [
      __("(None|Ninguno)"), 
      "BPM", 
      __("(Accuracy|Precisión)"), 
      "Audio"
    ];
    const currentVisualizer = Account.settings.visualizer || 'None';
    const currentVisualizerIndex = visualizerOptions.indexOf(currentVisualizer);
    
    settingsWindow.addSettingItem(
      __("(Visualizer|Visualizador)"),
      visualizerOptions,
      currentVisualizerIndex,
      index => {
        const selectedVisualizer = visualizerOptions[index];
        Account.settings.visualizer = selectedVisualizer;
        saveAccount();
      }
    );
    
    // Mouse 
    settingsWindow.addSettingItem(
      __("(Enable Mouse|Activar Mouse)"),
      [__("(Yes|Sí)"), __("(No|No)")],
      Account.settings.enableMouse ? 0 : 1,
      index => {
        Account.settings.enableMouse = index === 0;
        saveAccount();
        restartNeeded = true;
      }
    );
    
    // Touch 
    settingsWindow.addSettingItem(
      __("(Enable Touch|Activar Táctil)"),
      [__("(Yes|Sí)"), __("(No|No)")],
      Account.settings.enableTouch ? 0 : 1,
      index => {
        Account.settings.enableTouch = index === 0;
        saveAccount();
        restartNeeded = true;
      }
    );
    
    // Scroll direction
    settingsWindow.addSettingItem(
      __("(Scroll Direction|Dirección de Desplazamiento)"),
      [__("(Falling|Cayendo)"), __("(Rising|Ascendente)")],
      Account.settings.scrollDirection === 'falling' ? 0 : 1,
      index => {
        Account.settings.scrollDirection = index === 0 ? 'falling' : 'rising';
        saveAccount();
      }
    );
    
    // Idioma
    settingsWindow.addSettingItem(
      __("(Language|Idioma)"),
      [__("(English|Inglés)"), __("(Spanish|Español)")],
      Account.settings.language || 0,
      index => {
        Account.settings.language = index;
        saveAccount();
        restartNeeded = true;
        notifications.show(__("Language changed. Restart required.||Idioma cambiado. Requiere reiniciar."), 2000, "info");
      }
    );
    
    // Button Style
    settingsWindow.addSettingItem(
      __("(Button Style|Estilo de Botones)"),
      ["X-Box", "Playstation"],
      (Account.settings.buttonStyle || 'xbox') === 'xbox' ? 0 : 1,
      index => {
        Account.settings.buttonStyle = index === 0 ? 'xbox' : 'ps';
        saveAccount();
        
        if (window.currentNavigationHint) {
          window.currentNavigationHint.setButtonStyle(Account.settings.buttonStyle);
        }
      }
    );
    
    // Note colors
    const noteOptions = [
      { value: 'NOTE', display: "Note" },
      { value: 'VIVID', display: "Vivid" },
      { value: 'FLAT', display: "Flat" },
      { value: 'RAINBOW', display: "Rainbow" }
    ];
    const currentNoteIndex = noteOptions.findIndex(opt => opt.value === Account.settings.noteColorOption);
    settingsWindow.addSettingItem(
      __("(Note Colors|Colores de Notas)"),
      noteOptions.map(opt => opt.display),
      currentNoteIndex,
      index => {
        Account.settings.noteColorOption = noteOptions[index].value;
        saveAccount();
      }
    );

    // Note speed
    settingsWindow.addSettingItem(
      __("(Note Speed|Velocidad de Notas)"),
      [
        __("(Normal|Normal)"),
        __("(Double|Doble)"),
        __("(Triple|Triple)"),
        __("(Insane|Alucinante)"),
        __("(Sound Barrier|Barrera de Sonido)"),
        __("(Light Speed|Velocidad de la Luz)"),
        __("(Faster than light|Más Rápido que la Luz)")
      ],
      Account.settings.noteSpeedMult - 1,
      index => {
        Account.settings.noteSpeedMult = index + 1;
        saveAccount();
      }
    );
    
    // Speed mod
    settingsWindow.addSettingItem(
      __("(Speed Mod|Modo de Velocidad)"),
      ["X-Mod", "C-Mod"],
      Account.settings.speedMod === 'C-MOD' ? 1 : 0,
      index => {
        Account.settings.speedMod = index === 1 ? 'C-MOD' : 'X-MOD';
        saveAccount();
      }
    );
    
    // Haptic feedback
    settingsWindow.addSettingItem(
      __("(Haptic Feedback|Retroalimentación Háptica)"),
      [__("(Off|Apagado)"), __("(On|Activado)")], 
      Account.settings.hapticFeedback ? 1 : 0,
      index => {
        Account.settings.hapticFeedback = index === 1;
        saveAccount();
      }
    );
    
    // Enable Temperature
    settingsWindow.addSettingItem(
      __("(Enable Audio Temperature|Activar Temperatura del Audio) (Experimental)"),
      [__("(Yes|Sí)"), __("(No|No)")], 
      Account.settings.enableTemperature ? 0 : 1,
      index => {
        Account.settings.enableTemperature = index === 0;
        saveAccount();
      }
    );
    
    // Enable Lyrics
    settingsWindow.addSettingItem(
      __("(Enable Lyrics|Activar Letras)"),
      [__("(Yes|Sí)"), __("(No|No)")], 
      Account.settings.enableLyrics ? 0 : 1,
      index => {
        Account.settings.enableLyrics = index === 0;
        saveAccount();
      }
    );
    
    // Lyrics Position
    settingsWindow.addSettingItem(
      __("(Lyrics Position|Posición de Letras)"),
      [__("(Bottom|Abajo)"), __("(Top|Arriba)")], 
      Account.settings.lyricsPosition,
      index => {
        Account.settings.lyricsPosition = index;
        saveAccount();
      }
    );
    
    // Background opacity
    settingsWindow.addRangeItem(
      __("(Background Image Opacity|Opacidad de Imagen de Fondo)"),
      0,
      100,
      1,
      Account.settings.backgroundOpacity * 100,
      "%",
      value => {
        Account.settings.backgroundOpacity = value / 100;
        saveAccount();
      }
    );
    
    // Video Background opacity
    settingsWindow.addRangeItem(
      __("(Background Video Opacity|Opacidad de Video de Fondo)"),
      0,
      100,
      1,
      Account.settings.videoBackgroundOpacity * 100,
      "%",
      value => {
        Account.settings.videoBackgroundOpacity = value / 100;
        saveAccount();
      }
    );
    
    // Video FPS
    settingsWindow.addSettingItem(
      __("(Background Video FPS|FPS de Videos)"),
      ["60 Fps", "30 Fps", "15 Fps"],
      (Account.settings.videoFPS || 1) - 1,
      index => {
        Account.settings.videoFPS = index + 1;
        saveAccount();
      }
    );
    
    // Song Info Intro
    settingsWindow.addSettingItem(
      __("(Display Song Info Intro|Mostrar Información de Canción)"),
      [__("(Yes|Sí)"), __("(No|No)")],
      Account.settings.enableSongInfo ? 0 : 1,
      index => {
        Account.settings.enableSongInfo = index === 0;
        saveAccount();
      }
    );
    
    // Beat lines
    settingsWindow.addSettingItem(
      __("(Enable Beat Lines|Activar Líneas de Beat)"),
      [__("(Yes|Sí)"), __("(No|No)")],
      Account.settings.beatLines ? 0 : 1,
      index => {
        Account.settings.beatLines = index === 0;
        saveAccount();
      }
    );
    
    // Chart background
    settingsWindow.addSettingItem(
      __("(Enable Chart Overlay|Activar Superposición de Chart)"),
      [__("(Yes|Sí)"), __("(No|No)")],
      Account.settings.enableChartBackground ? 0 : 1,
      index => {
        Account.settings.enableChartBackground = index === 0;
        saveAccount();
      }
    );
    
    // Chart Background opacity
    settingsWindow.addRangeItem(
      __("(Chart Overlay Opacity|Opacidad de Superposición de Chart)"),
      0,
      100,
      1,
      (Account.settings.chartBackgroundOpacity || 0.3) * 100,
      "%",
      value => {
        Account.settings.chartBackgroundOpacity = value / 100;
        saveAccount();
      }
    );
    
    // Global offset
    settingsWindow.addRangeItem(
      __("(Global Offset|Offset Global)"),
      -2000,
      2000,
      1,
      Account.settings.userOffset,
      "ms",
      value => {
        Account.settings.userOffset = value;
        saveAccount();
      }
    );
    
    // Menu music
    let menuMusicIndex = 0;
    if (Account.settings.enableMenuMusic) {
      menuMusicIndex = Account.settings.randomSong ? 1 : 0;
    } else {
      menuMusicIndex = 2;
    }
    settingsWindow.addSettingItem(
      __("(Menu Music|Música del Menú)"),
      [
        __("(Last Song|Última Canción)"), 
        __("(Random Song|Canción Aleatoria)"), 
        __("(Off|Apagado)")
      ],
      menuMusicIndex,
      index => {
        switch (index) {
          case 0:
            Account.settings.randomSong = false;
            Account.settings.enableMenuMusic = true;
            break;
          case 1:
            Account.settings.randomSong = true;
            Account.settings.enableMenuMusic = true;
            break;
          case 2:
            Account.settings.enableMenuMusic = false;
            break;
        }
        saveAccount();
      }
    );

    // Renderer
    settingsWindow.addSettingItem(
      __("(Renderer|Renderizador)"),
      ["Auto", __("(Canvas (Experimental)|Canvas (Experimental))"), "Webgl"],
      Account.settings.renderer,
      index => {
        Account.settings.renderer = index;
        saveAccount();
        restartNeeded = true;
      }
    );
    
    // Pixelated
    settingsWindow.addSettingItem(
      __("(Pixelated|Pixelado)"),
      [__("(Yes|Sí)"), __("(No|No)")],
      Account.settings.pixelated ? 0 : 1,
      index => {
        Account.settings.pixelated = index == 0;
        restartNeeded = true;
        saveAccount();
      }
    );
    
    // Image Rendering Mode
    settingsWindow.addSettingItem(
      __("(Image Rendering Mode|Modo de Renderizado de Imágenes)"),
      [__("(Compatibility|Compatibilidad)"), __("(Normal|Normal)")],
      Account.settings.imageRenderingCompatibility ? 0 : 1,
      index => {
        Account.settings.imageRenderingCompatibility = index === 0;
        saveAccount();
      }
    );
    
    // Safe Mode
    settingsWindow.addSettingItem(
      __("(Safe Mode|Modo Seguro)"),
      [__("(Enabled|Activado)"), __("(Disabled|Desactivado)")],
      Account.settings.safeMode ? 0 : 1,
      index => {
        restartNeeded = true;
        const enabled = index == 0;
        addonManager?.setSafeMode(enabled);
        saveAccount();
      }
    );
    
    // Configure keybindings
    settingsWindow.addItem(__("(Configure keybindings|Configurar teclas)"), ">", () => {
      this.showKeybindingsMenu()
    });
    
    // Chart Modifiers
    settingsWindow.addItem(__("(Chart Modifiers|Modificadores de Chart)"), ">", () => this.showChartModifiersMenu());
    
    // Danger zone
    settingsWindow.addItem(__("(Erase Highscores|Borrar Highscores)"), "", () => this.confirmEraseHighscores());
    settingsWindow.addItem(__("(Import Backup Data|Importar Datos de Respaldo)"), "", () => this.importBackupData());
    settingsWindow.addItem(__("(Export Backup Data|Exportar Datos de Respaldo)"), "", () => this.exportBackupData());
    settingsWindow.addItem(__("(Restore Default Settings|Restaurar Configuración Predeterminada)"), "", () => this.confirmRestoreDefaults());
    
    game.onMenuIn.dispatch('settings', settingsWindow);
    
    settingsWindow.addItem(__("Apply||Aplicar"), "", () => {
      this.windowManager.remove(settingsWindow, true);
      if (restartNeeded) {
        this.confirmRestart();
      } else {
        this.showMainMenu();
      }
    }, true);
  }
  
  async importBackupData() {
    this.fileInput.accept = "application/json";
  
    this.fileInput.onchange = async event => {
      const file = event.target.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const backupData = JSON.parse(e.target.result);
          
          this.windowManager.remove(this.settingsWindow, true);
      
          this.confirmDialog(
            __(`Backup version: ${backupData.version || '???'}\n` +
            `Backup date: ${backupData.exportDate ? new Date(backupData.exportDate).toDateString() : '???'}\n\n` +
            "Importing will overwrite your current account data including:\n" +
            "- High scores\n- Settings\n- Characters\n- Achievements\n- Statistics\n\n" +
            "This action cannot be undone!\n\nAre you sure you want to import this backup?||" +
            `Versión del respaldo: ${backupData.version || '???'}\n` +
            `Fecha del respaldo: ${backupData.exportDate ? new Date(backupData.exportDate).toDateString() : '???'}\n\n` +
            "Importar sobrescribirá tus datos actuales de cuenta incluyendo:\n" +
            "- Highscores\n- Configuración\n- Personajes\n- Logros\n- Estadísticas\n\n" +
            "¡Esta acción no se puede deshacer!\n\n¿Estás seguro de que quieres importar este respaldo?"),
            () => {
              const mergedAccount = {
                ...DEFAULT_ACCOUNT,
                ...backupData,
                settings: { ...DEFAULT_ACCOUNT.settings, ...backupData.settings },
                characters: { ...DEFAULT_ACCOUNT.characters, ...backupData.characters },
                stats: { ...DEFAULT_ACCOUNT.stats, ...backupData.stats },
                achievements: { ...DEFAULT_ACCOUNT.achievements, ...backupData.achievements },
                mapping: { ...DEFAULT_ACCOUNT.mapping, ...backupData.mapping }
              };
              
              Object.assign(Account, mergedAccount);
              saveAccount();
              
              notifications.show(__("Backup imported successfully!||¡Respaldo importado exitosamente!"), 2000, "success");
              
              setTimeout(() => {
                this.confirmDialog(
                  __("Import complete. Restart the game to ensure all data is properly loaded?||Importación completa. ¿Reiniciar el juego para asegurar que todos los datos se carguen correctamente?"),
                  () => location.reload(),
                  () => this.showSettings(),
                  __("Restart Now||Reiniciar Ahora"),
                  __("Later||Después")
                );
              }, 500);
            },
            () => {
              this.showSettings();
            },
            __("Import||Importar"),
            __("Cancel||Cancelar")
          );
        } catch (error) {
          console.error("Failed to parse backup file:", error);
          notifications.show(__("Invalid backup file!||¡Archivo de respaldo inválido!"), 2000, "error");
          this.showSettings();
        }
      };
      
      reader.readAsText(file);
      this.fileInput.value = "";
    };
  
    this.fileInput.click();
  }
  
  async exportBackupData() {
    const backupData = {
      version: VERSION,
      exportDate: new Date().toISOString(),
      settings: Account.settings,
      characters: Account.characters,
      lastSong: Account.lastSong,
      songSelectStartingIndex: Account.songSelectStartingIndex,
      highScores: Account.highScores,
      stats: Account.stats,
      achievements: Account.achievements,
      mapping: Account.mapping
    };
    
    const backupJson = JSON.stringify(backupData, null, 2);
    const blob = new Blob([backupJson], { type: "application/json" });
    const filename = `PadManiacs_Backup_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
    
    if (CURRENT_ENVIRONMENT === ENVIRONMENT.WEB) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notifications.show(__("Backup exported successfully!||¡Respaldo exportado exitosamente!"), 2000, "success");
      this.showSettings();
    } else if (CURRENT_ENVIRONMENT === ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT === ENVIRONMENT.NWJS) {
      try {
        const fileSystem = new FileSystemTools();
        const outputDir = await fileSystem.getDirectory(EXTERNAL_DIRECTORY + BACKUPS_DIRECTORY);
        await fileSystem.saveFile(outputDir, blob, filename);
        notifications.show(__(`Backup saved to ${filename}||Respaldo guardado como ${filename}`), 2000, "success");
        this.showSettings();
      } catch (error) {
        console.error("Failed to save backup:", error);
        notifications.show(__("Failed to save backup!||¡Error al guardar el respaldo!"), 2000, "error");
        this.showSettings();
      }
    }
  }
  
  showMainMenu() {
    game.state.start("MainMenu");
  }
  
  showKeybindingsMenu() {
    game.state.start("Keybindings");
  }
  
  showChartModifiersMenu() {
    game.state.start("ChartModifiers", true, false, "MainMenu");
  }

  confirmDialog(message, onConfirm, onCancel, confirmText = __("Yes||Sí"), cancelText = __("No||No")) {
    const dialog = new DialogWindow(message, {
      buttons: [confirmText, cancelText]
    });
    
    dialog.onConfirm.add((buttonIndex, buttonText) => {
      if (buttonIndex === 0) {
        onConfirm?.();
      } else {
        onCancel?.();
      }
      dialog.destroy();
    });
    
    dialog.onCancel.add(() => {
      onCancel?.();
      dialog.destroy();
    });
    
    return dialog;
  }

  confirmEraseHighscores() {
    this.confirmDialog(
      __("This will permanently erase all your high scores.\nThis action cannot be undone!\n\nAre you sure?||Esto borrará permanentemente todas tus puntuaciones altas.\n¡Esta acción no se puede deshacer!\n\n¿Estás seguro?"),
      () => {
        Account.highScores = {};
        saveAccount();
        notifications.show(__("High scores erased!||¡Puntuaciones altas borradas!"));
        this.showSettings();
      },
      () => this.showSettings(),
      __("Erase||Borrar"),
      __("Cancel||Cancelar")
    );
  }

  confirmRestoreDefaults() {
    this.windowManager.remove(this.settingsWindow, true);
    
    this.confirmDialog(
      __("All settings will be restored to their default values.\nThe game will need to restart.\n\nContinue?||Toda la configuración será restaurada a sus valores predeterminados.\nEl juego necesitará reiniciarse.\n\n¿Continuar?"),
      () => {
        Account.settings = DEFAULT_ACCOUNT.settings;
        saveAccount();
        window.location.reload();
      },
      () => this.showSettings(),
      __("Restore||Restaurar"),
      __("Cancel||Cancelar")
    );
  }

  confirmRestart() {
    this.confirmDialog(
      __("Settings changed require a restart to take effect.\nRestart now?||Los cambios en la configuración requieren un reinicio para aplicar.\n¿Reiniciar ahora?"),
      () => location.reload(),
      () => this.showMainMenu(),
      __("Restart||Reiniciar"),
      __("Later||Después")
    );
  }
}
