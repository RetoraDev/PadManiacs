class Addons {
  create() {
    game.camera.fadeIn(0x000000);

    this.futuristicLines = new FuturisticLines();
    this.backgroundGradient = new BackgroundGradient();
    this.navigationHint = new NavigationHint(0);
    
    this.windowManager = new WindowManager();
    
    gamepad.releaseAll();
    
    this.showAddonManager();
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  update() {
    gamepad.update();
    this.windowManager.update();
  }
  
  showAddonManager() {
    // TODO: Clean addon manager interface and logic split in methods here 
    
    const detailText = new Text(4, 4, "");
    
    const preview = game.add.sprite(112, 4);
      
    const showInstalledAddons = () => {
      const addons = addonManager.getAddonList();
      const carousel = new CarouselMenu(192 / 2, 112 / 2, 192 / 2, 112 / 2, {
        align: 'left',
        bgcolor: 'brown',
        fgcolor: '#ffffff',
        animate: true,
        crop: false
      });
      
      if (addons.length === 0) {
        carousel.addItem("No addons installed", () => {});
      } else {
        addons.forEach(addon => {
          const statusColor = addon.isHibernating ? "gray" : (addon.isEnabled ? "#00cc00" : "brown")
          carousel.addItem(
            `${addon.name} v${addon.version}`,
            () => showAddonDetails(addon),
            { addon, bgcolor: statusColor }
          );
        });
        
        carousel.onSelect.add((index, item) => {
          if (item.data && item.data.addon) {
            previewAddon(item.data.addon);
          }
        });
        
        previewAddon(addons[0]);
      }
      
      game.onMenuIn.dispatch('addons', carousel);
      
      carousel.addItem("< Back", () => applyChanges());
      carousel.onCancel.add(() => applyChanges());
    };
    
    let needsReload = false;
    
    const previewAddon = (addon) => {
      detailText.write(
        `${addon.name}\n` +
        `V${addon.version}\n` +
        `By ${addon.author}\n` +
        `BEHAVIORS:${addon.behaviors ? Object.keys(addon.behaviors).length : 0}\n` +
        `ASSETS:${addon.assets ? addon.assets.length : 0}\n\n` +
        `${addon.description}\n` +
        'STATE: ' + 
        (addon.isHibernating ?
          'Hybernating'
          :
        (addon.isEnabled ?
          'Enabled' : 'Disabled')) + '\n'
      ).wrap(112);
      if (addon.icon) {
        this.previewImg.src = addon.icon;
        this.previewImg.onload = () => {
          this.previewCtx.drawImage(this.previewImg, 0, 0, 50, 50);
          preview.loadTexture(PIXI.Texture.fromCanvas(this.previewCanvas));
        };
      }
    }
    
    const showAddonDetails = (addon) => {
      const carousel = new CarouselMenu(192 / 2, 112 / 2, 192 / 2, 112 / 2, {
        align: 'left',
        bgcolor: '#9b59b6',
        fgcolor: '#ffffff',
        animate: true,
        crop: false
      });
      
      if (addon.isHibernating) {
        carousel.addItem("Wake Addon", () => {
          addonManager.wakeAddon(addon.id);
          needsReload = true;
          showInstalledAddons();
        });
      } else if (addon.isEnabled) {
        carousel.addItem("Disable Addon", () => {
          addonManager.disableAddon(addon.id);
          needsReload = true;
          showInstalledAddons();
        });
        carousel.addItem("Hibernate Addon", () => {
          addonManager.hibernateAddon(addon.id);
          needsReload = true;
          showInstalledAddons();
        });
      } else {
        carousel.addItem("Enable Addon", () => {
          addonManager.enableAddon(addon.id);
          needsReload = true;
          showInstalledAddons();
        });
      }
      
      carousel.addItem("Uninstall Addon", () => this.confirmDialog("The addon folder will be removed. Continue?", () => {
        addonManager.uninstallAddon(addon.id);
        needsReload = true;
        showInstalledAddons();
      }, () => showInstalledAddons()));
      
      game.onMenuIn.dispatch('addonDetails', carousel);
      
      carousel.addItem("< Back", () => showInstalledAddons());
      carousel.onCancel.add(() => showInstalledAddons());
    };
    
    const applyChanges = () => {
      if (needsReload || addonManager.needsReload()) {
        this.confirmDialog("Reload required. Restart now?", () => {
          location.reload();
        }, () => {
          preview.destroy();
          detailText.destroy();
          this.showMainMenu();
        });
      } else {
        preview.destroy();
        detailText.destroy();
        this.showMainMenu();
      }
    };
    
    showInstalledAddons();
  }
  
  showMainMenu() {
    game.state.start("MainMenu");
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