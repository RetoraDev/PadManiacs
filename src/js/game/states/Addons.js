class Addons {
  create() {
    this.leaving = false;
    
    game.camera.fadeIn(0x000000);
    gamepad.releaseAll();

    this.futuristicLines = new FuturisticLines();
    this.backgroundGradient = new BackgroundGradient();
    this.navigationHint = new NavigationHint('general');
    
    this.previewCanvas = document.createElement("canvas");
    this.previewCtx = this.previewCanvas.getContext("2d");
    this.previewImg = new Image();
    
    this.previewSprite = game.add.sprite(8, 4, null);
    
    this.windowManager = new WindowManager();
    
    this.descriptionText = new Text(110, 4, "");
    
    this.carousel = new CarouselMenu(0, 56, 100, 70, {
      align: 'left',
      bgcolor: '#9b59b6',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    this.needsReload = false;
    
    this.loadAddons();
  }
  
  showNoAddonsDialog() {
    this.confirmDialog(
      __("NO ADDONS INSTALLED\n\nAddons extend the game with new features,\nvisual effects, and gameplay modifications.\n\nVisit the community page to download addons,\nor place addons in the 'Addons' folder.||NO HAY ADDONS INSTALADOS\n\nLos addons expanden el juego con nuevas funciones,\nefectos visuales y modificaciones de gameplay.\n\nVisita la página de la comunidad para descargar addons,\no coloca addons en la carpeta 'Addons'."),
      () => {
        openExternalUrl(COMMUNITY_HOMEPAGE_URL);
        game.time.events.add(100, () => this.showNoAddonsDialog());
      },
      () => {
        setTimeout(() => this.backToMainMenu());
      },
      __("VISIT COMMUNITY||VISITAR COMUNIDAD"),
      __("RETURN||VOLVER")
    );
  }
  
  loadAddons() {
    this.carousel = this.carousel.replace();

    const addons = addonManager.getAddonList();
    
    if (!addons.length) {
      this.showNoAddonsDialog();
      return;
    }
    
    addons.forEach(addon => {
      const statusColor = addon.isHibernating ? "gray" : (addon.isEnabled ? "#00cc00" : "brown")
      this.carousel.addItem(
        `${addon.name} v${addon.version}`,
        () => this.showAddonDetails(addon),
        { addon, bgcolor: statusColor, icon: 2 }
      );
    });
        
    this.carousel.onSelect.add((index, item) => {
      if (item.data && item.data.addon) {
        this.previewAddon(item.data.addon);
      }
    });
    
    this.previewAddon(addons[0]);
    
    this.carousel.addItem(__("< Back||< Volver"), () => this.applyChanges());
    this.carousel.onCancel.add(() => this.applyChanges());
  }
  
  previewAddon(addon) {
   this.descriptionText.write(
      `${addon.name}\n\n` +
      __(`(State|Estado): `) + 
      (addon.isHibernating ?
        __(`(Hybernating|Hibernando)`)
        :
      (addon.isEnabled ?
        __(`(Enabled|Activado)`) : __(`(Disabled|Desactivado)`))) + '\n' +
      __(`(Version|Versión): v${addon.version}\n`) +
      __(`(Author|Autor): ${addon.author}\n`) +
      __(`(Behaviors|Comportamientos): ${addon.behaviors ? Object.keys(addon.behaviors).length : 0}\n`) +
      __(`(Assets|Recursos): ${addon.assets ? addon.assets.length : 0}\n\n`) +
      `${addon.description}\n`
    ).wrap(130 - 4);
    
    if (addon.icon) {
      this.previewImg.src = addon.icon;
      this.previewImg.onload = () => {
        this.previewCtx.clearRect(0, 0, 64, 50);
        this.previewCtx.drawImage(this.previewImg, 0, 0, 64, 50);
        this.previewSprite.loadTexture(PIXI.Texture.fromCanvas(this.previewCanvas));
      };
      this.previewImg.onerror = () => this.previewSprite.loadTexture("ui_addon_no_image");
    } else {
      this.previewSprite.loadTexture("ui_addon_no_image");
    }
  }
  
  showAddonDetails(addon) {
    this.carousel = this.carousel.replace();
    
    if (addon.isHibernating) {
      this.carousel.addItem(__("Wake Addon||Despertar Addon"), () => {
        addonManager.wakeAddon(addon.id);
        this.needsReload = true;
        this.loadAddons();
      });
    } else if (addon.isEnabled) {
      this.carousel.addItem(__("Disable Addon||Desactivar Addon"), () => {
        addonManager.disableAddon(addon.id);
        this.needsReload = false;
        this.loadAddons();
      });
      this.carousel.addItem(__("Hibernate Addon||Hibernar Addon"), () => {
        addonManager.hibernateAddon(addon.id);
        this.needsReload = true;
        this.loadAddons();
      });
    } else {
      this.carousel.addItem(__("Enable Addon||Activar Addon"), () => {
        addonManager.enableAddon(addon.id);
        this.needsReload = true;
        this.loadAddons();
      });
    }
    
    this.carousel.addItem(__("Uninstall Addon||Desinstalar Addon"), () => this.confirmDialog(
      __("The addon will be removed from storage. Continue?||El addon será eliminado del almacenamiento. ¿Continuar?"),
      () => {
        addonManager.uninstallAddon(addon.id);
        this.needsReload = true;
        this.loadAddons();
      }
    ));
    
    game.onMenuIn.dispatch('addonDetails', this.carousel);
    
    this.carousel.addItem(__("< Back||< Volver"), () => this.loadAddons());
    this.carousel.onCancel.add(() => this.loadAddons());
  }
  
  applyChanges() {
    if (this.needsReload || addonManager.needsReload()) {
      this.confirmDialog(
        __("Reload required. Restart now?||Se necesita recargar. ¿Reiniciar ahora?"),
        () => {
          window.location.reload();
        },
        () => {
          this.backToMainMenu();
        }
      );
    } else {
      this.backToMainMenu();
    }
  };
  
  backToMainMenu() {
    this.leaving = true;
    game.state.start("MainMenu");
  }
  
  update() {
    if (this.leaving) return;
    gamepad.update();
    this.windowManager.update();
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
}