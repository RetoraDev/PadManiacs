class Addons {
  create() {
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
    
    this.descriptionText = new Text(84, 4, "");
    
    this.carousel = new CarouselMenu(0, 56, 80, 56, {
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
      "NO ADDONS INSTALLED\n\nAddons extend the game with new features,\nvisual effects, and gameplay modifications.\n\nVisit the community page to download addons,\nor place addons in the 'Addons' folder.",
      () => {
        openExternalUrl(COMMUNITY_HOMEPAGE_URL);
        game.time.events.add(100, () => this.showNoAddonsDialog());
      },
      () => {
        this.showMainMenu();
      },
      "VISIT COMMUNITY",
      "RETURN"
    );
  }
  
  loadAddons() {
    this.carousel.destroy();
    
    this.carousel = new CarouselMenu(0, 56, 80, 56, {
      align: 'left',
      bgcolor: '#9b59b6',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });

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
        { addon, bgcolor: statusColor }
      );
    });
        
    this.carousel.onSelect.add((index, item) => {
      if (item.data && item.data.addon) {
        this.previewAddon(item.data.addon);
      }
    });
    
    this.previewAddon(addons[0]);
    
    this.carousel.addItem("< Back", () => this.applyChanges());
    this.carousel.onCancel.add(() => this.applyChanges());
  }
  
  previewAddon(addon) {
   this.descriptionText.write(
      `${addon.name}\n\n` +
      'STATE: ' + 
      (addon.isHibernating ?
        'Hybernating'
        :
      (addon.isEnabled ?
        'Enabled' : 'Disabled')) + '\n' +
      `VERSION: V${addon.version}\n` +
      `AUTHOR: ${addon.author}\n` +
      `BEHAVIORS: ${addon.behaviors ? Object.keys(addon.behaviors).length : 0}\n` +
      `ASSETS: ${addon.assets ? addon.assets.length : 0}\n\n` +
      `${addon.description}\n`
    ).wrapPreserveNewlines(112 - 4);
    
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
    this.carousel.destroy();
    
    this.carousel = new CarouselMenu(0, 56, 80, 56, {
      align: 'left',
      bgcolor: '#9b59b6',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    if (addon.isHibernating) {
      this.carousel.addItem("Wake Addon", () => {
        addonManager.wakeAddon(addon.id);
        this.needsReload = true;
        this.loadAddons();
      });
    } else if (addon.isEnabled) {
      this.carousel.addItem("Disable Addon", () => {
        addonManager.disableAddon(addon.id);
        this.needsReload = false;
        this.loadAddons();
      });
      this.carousel.addItem("Hibernate Addon", () => {
        addonManager.hibernateAddon(addon.id);
        this.needsReload = true;
        this.loadAddons();
      });
    } else {
      this.carousel.addItem("Enable Addon", () => {
        addonManager.enableAddon(addon.id);
        this.needsReload = true;
        this.loadAddons();
      });
    }
    
    this.carousel.addItem("Uninstall Addon", () => this.confirmDialog("The addon will be removed from storage. Continue?", () => {
      addonManager.uninstallAddon(addon.id);
      this.needsReload = true;
      this.loadAddons();
    }));
    
    game.onMenuIn.dispatch('addonDetails', this.carousel);
    
    this.carousel.addItem("< Back", () => this.loadAddons());
    this.carousel.onCancel.add(() => this.loadAddons());
  }
  
  applyChanges() {
    if (this.needsReload || addonManager.needsReload()) {
      this.confirmDialog("Reload required. Restart now?", () => {
        window.location.reload();
      }, () => {
        this.showMainMenu();
      });
    } else {
      this.showMainMenu();
    }
  };
  
  showMainMenu() {
    game.state.start("MainMenu");
  }
  
  update() {
    gamepad.update();
    this.windowManager.update();
  }
  
  confirmDialog(message, onConfirm, onCancel, confirmText = "Yes", cancelText = "No") {
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
