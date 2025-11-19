class CharacterSelect {
  create() {
    game.camera.fadeIn(0x000000);
    
    this.characterManager = new CharacterManager();
    this.selectedCharacter = this.characterManager.getCurrentCharacter();
    
    new FuturisticLines();
    new BackgroundGradient();
    
    this.navigationHint = new NavigationHint(0);
    
    this.createUI();
    this.updateDisplay();
  }

  createUI() {
    // Character display area (center, properly positioned)
    this.characterDisplay = new CharacterDisplay(96, 30, this.selectedCharacter);
    this.characterDisplay.scale.set(0.5);
    this.characterDisplay.anchor.set(0.5);
    
    // Character list carousel (left)
    this.characterCarousel = new CarouselMenu(10, 30, 80, 60, {
      bgcolor: "#9b59b6",
      fgcolor: "#ffffff",
      align: "left",
      animate: true
    });
    
    // Add characters to carousel
    this.characterManager.getCharacterList().forEach(character => {
      const isCurrent = character.name === this.selectedCharacter.name;
      this.characterCarousel.addItem(
        isCurrent ? `> ${character.name}` : `  ${character.name}`,
        () => this.selectCharacter(character),
        { 
          character: character,
          bgcolor: isCurrent ? '#e74c3c' : '#9b59b6'
        }
      );
    });
    
    // Add "Add Character" option
    this.characterCarousel.addItem("+ ADD CHARACTER", () => this.addCharacter());
    
    // Character details using Text class instead of Window
    this.createDetailsText();
    
    // Action menu (will be shown when character is selected)
    this.actionMenu = null;
    
    // Set up proper navigation
    this.characterCarousel.onCancel.add(() => {
      game.state.start("MainMenu");
    });
  }

  createDetailsText() {
    // Remove any existing details
    if (this.detailsText) {
      this.detailsText.destroy();
    }
    
    const char = this.selectedCharacter;
    const detailsContent = [
      `NAME: ${char.name}`,
      `LEVEL: ${char.level}`,
      `SKILL: ${char.skillLevel}/5`,
      `EXP: ${char.experience}/${char.getRequiredExperience()}`,
      "",
      "SKILLS:"
    ];
    
    // Add unlocked skills
    char.unlockedSkills.forEach(skillId => {
      const skill = CHARACTER_SKILLS.find(s => s.id === skillId);
      if (skill) {
        detailsContent.push(`- ${skill.name}`);
      }
    });
    
    // Create experience bar
    if (this.expBar) {
      this.expBar.destroy();
    }
    this.expBar = new ExperienceBar(110, 70, 70, 4);
    this.expBar.setProgress(char.getExperienceProgress());
    
    // Create text display with wrapping
    this.detailsText = new Text(110, 10, detailsContent.join('\n'), FONTS.default);
    this.detailsText.wrapPreserveNewlines(70);
  }

  selectCharacter(character) {
    this.selectedCharacter = character;
    this.updateDisplay();
    
    // Show action menu
    this.showActionMenu();
  }

  updateDisplay() {
    // Update character display
    if (this.characterDisplay) {
      this.characterDisplay.destroy();
    }
    this.characterDisplay = new CharacterDisplay(96, 30, this.selectedCharacter);
    this.characterDisplay.scale.set(0.5);
    this.characterDisplay.anchor.set(0.5);
    
    // Update details text
    this.createDetailsText();
    
    // Update experience bar
    if (this.expBar) {
      this.expBar.setProgress(this.selectedCharacter.getExperienceProgress());
    }
    
    // Carousel selection is handled automatically by the carousel component
  }

  showActionMenu() {
    if (this.actionMenu) {
      this.actionMenu.destroy();
    }
    
    this.actionMenu = new CarouselMenu(60, 70, 72, 30, {
      bgcolor: "#34495e",
      fgcolor: "#ffffff",
      align: "center"
    });
    
    this.actionMenu.addItem("SELECT", () => this.confirmSelection());
    this.actionMenu.addItem("CUSTOMIZE", () => this.customizeCharacter());
    this.actionMenu.addItem("DELETE", () => this.deleteCharacter());
    
    // Proper cancel handling - return to character list
    this.actionMenu.onCancel.add(() => {
      this.actionMenu.destroy();
      this.actionMenu = null;
      // Return focus to character carousel
      if (this.characterCarousel) {
        this.characterCarousel.inputEnabled = true;
      }
    });
  }

  confirmSelection() {
    this.characterManager.setCurrentCharacter(this.selectedCharacter.name);
    notifications.show(`Character selected: ${this.selectedCharacter.name}`);
    game.state.start("MainMenu");
  }

  customizeCharacter() {
    // Implement customization directly in this state instead of separate state
    this.showCustomizationMenu();
  }

  showCustomizationMenu() {
    if (this.customizationMenu) {
      this.customizationMenu.destroy();
    }
    
    this.customizationMenu = new CarouselMenu(10, 70, 172, 30, {
      bgcolor: "#2c3e50",
      fgcolor: "#ffffff",
      align: "center"
    });
    
    this.customizationMenu.addItem("SKIN TONE", () => this.customizeSkinTone());
    this.customizationMenu.addItem("HAIR COLOR", () => this.customizeHairColor());
    this.customizationMenu.addItem("FRONT HAIR", () => this.customizeHairStyle('frontHair'));
    this.customizationMenu.addItem("BACK HAIR", () => this.customizeHairStyle('backHair'));
    this.customizationMenu.addItem("CLOTHING", () => this.customizeClothing());
    this.customizationMenu.addItem("ACCESSORY", () => this.customizeAccessory());
    this.customizationMenu.addItem("APPLY & BACK", () => this.finishCustomization());
    
    // Proper cancel handling - return to action menu
    this.customizationMenu.onCancel.add(() => {
      this.customizationMenu.destroy();
      this.customizationMenu = null;
      // Restore original appearance if cancelled
      this.characterDisplay.updateAppearance(this.originalAppearance);
      this.showActionMenu();
    });
    
    // Store original appearance for cancellation
    this.originalAppearance = { ...this.selectedCharacter.appearance };
    
    // Hide action menu
    if (this.actionMenu) {
      this.actionMenu.destroy();
      this.actionMenu = null;
    }
  }

  customizeSkinTone() {
    const skinOptions = ["LIGHT", "DARK"];
    const skinText = new Text(96, 80, "SKIN TONE", FONTS.shaded);
    skinText.anchor.set(0.5);
    
    let currentIndex = this.selectedCharacter.appearance.skinTone;
    const skinValueText = new Text(96, 90, skinOptions[currentIndex], FONTS.default);
    skinValueText.anchor.set(0.5);
    
    const skinHandler = (key) => {
      if (key === 'left') {
        currentIndex = (currentIndex - 1 + skinOptions.length) % skinOptions.length;
      } else if (key === 'right') {
        currentIndex = (currentIndex + 1) % skinOptions.length;
      } else if (key === 'a' || key === 'start') {
        // Apply and exit
        this.selectedCharacter.appearance.skinTone = currentIndex;
        this.characterDisplay.updateAppearance({ skinTone: currentIndex });
        skinText.destroy();
        skinValueText.destroy();
        gamepad.signals.pressed.any.remove(skinHandler);
        return;
      } else if (key === 'b' || key === 'select') {
        // Cancel
        skinText.destroy();
        skinValueText.destroy();
        gamepad.signals.pressed.any.remove(skinHandler);
        return;
      }
      
      skinValueText.write(skinOptions[currentIndex]);
    };
    
    gamepad.signals.pressed.any.add(skinHandler);
  }

  customizeHairColor() {
    let color = this.selectedCharacter.appearance.hairColor;
    let r = (color >> 16) & 0xFF;
    let g = (color >> 8) & 0xFF;
    let b = color & 0xFF;
    
    const colorText = new Text(96, 80, "HAIR COLOR", FONTS.shaded);
    colorText.anchor.set(0.5);
    
    const rgbText = new Text(96, 90, `R:${r} G:${g} B:${b}`, FONTS.default);
    rgbText.anchor.set(0.5);
    
    const updateColor = () => {
      const newColor = (r << 16) | (g << 8) | b;
      this.selectedCharacter.appearance.hairColor = newColor;
      this.characterDisplay.updateAppearance({ hairColor: newColor });
      rgbText.write(`R:${r} G:${g} B:${b}`);
    };
    
    const colorHandler = (key) => {
      switch(key) {
        case 'left': r = Math.max(0, r - 32); break;
        case 'right': r = Math.min(255, r + 32); break;
        case 'up': g = Math.min(255, g + 32); break;
        case 'down': g = Math.max(0, g - 32); break;
        case 'a': b = Math.min(255, b + 32); break;
        case 'b': b = Math.max(0, b - 32); break;
        case 'start':
          // Apply and exit
          colorText.destroy();
          rgbText.destroy();
          gamepad.signals.pressed.any.remove(colorHandler);
          return;
        case 'select':
          // Cancel
          this.characterDisplay.updateAppearance({ hairColor: color });
          colorText.destroy();
          rgbText.destroy();
          gamepad.signals.pressed.any.remove(colorHandler);
          return;
      }
      updateColor();
    };
    
    gamepad.signals.pressed.any.add(colorHandler);
  }

  customizeHairStyle(type) {
    const unlocked = Account.characters.unlockedHairs[type === 'frontHair' ? 'front' : 'back'];
    const options = unlocked.map(id => `STYLE ${id}`);
    
    const hairText = new Text(96, 80, `${type.toUpperCase()}`, FONTS.shaded);
    hairText.anchor.set(0.5);
    
    let currentIndex = unlocked.indexOf(this.selectedCharacter.appearance[type]);
    const hairValueText = new Text(96, 90, options[currentIndex], FONTS.default);
    hairValueText.anchor.set(0.5);
    
    const hairHandler = (key) => {
      if (key === 'left') {
        currentIndex = (currentIndex - 1 + options.length) % options.length;
      } else if (key === 'right') {
        currentIndex = (currentIndex + 1) % options.length;
      } else if (key === 'a' || key === 'start') {
        // Apply and exit
        this.selectedCharacter.appearance[type] = unlocked[currentIndex];
        this.characterDisplay.updateAppearance({ [type]: unlocked[currentIndex] });
        hairText.destroy();
        hairValueText.destroy();
        gamepad.signals.pressed.any.remove(hairHandler);
        return;
      } else if (key === 'b' || key === 'select') {
        // Cancel
        hairText.destroy();
        hairValueText.destroy();
        gamepad.signals.pressed.any.remove(hairHandler);
        return;
      }
      
      hairValueText.write(options[currentIndex]);
    };
    
    gamepad.signals.pressed.any.add(hairHandler);
  }

  customizeClothing() {
    const unlocked = Account.characters.unlockedItems.filter(itemId => 
      CHARACTER_ITEMS.clothing.some(item => item.id === itemId)
    );
    const options = unlocked.map(id => {
      const item = CHARACTER_ITEMS.clothing.find(i => i.id === id);
      return item ? item.name : id;
    });
    
    const clothingText = new Text(96, 80, "CLOTHING", FONTS.shaded);
    clothingText.anchor.set(0.5);
    
    let currentIndex = unlocked.indexOf(this.selectedCharacter.appearance.clothing);
    const clothingValueText = new Text(96, 90, options[currentIndex], FONTS.default);
    clothingValueText.anchor.set(0.5);
    
    const clothingHandler = (key) => {
      if (key === 'left') {
        currentIndex = (currentIndex - 1 + options.length) % options.length;
      } else if (key === 'right') {
        currentIndex = (currentIndex + 1) % options.length;
      } else if (key === 'a' || key === 'start') {
        // Apply and exit
        this.selectedCharacter.appearance.clothing = unlocked[currentIndex];
        this.characterDisplay.updateAppearance({ clothing: unlocked[currentIndex] });
        clothingText.destroy();
        clothingValueText.destroy();
        gamepad.signals.pressed.any.remove(clothingHandler);
        return;
      } else if (key === 'b' || key === 'select') {
        // Cancel
        clothingText.destroy();
        clothingValueText.destroy();
        gamepad.signals.pressed.any.remove(clothingHandler);
        return;
      }
      
      clothingValueText.write(options[currentIndex]);
    };
    
    gamepad.signals.pressed.any.add(clothingHandler);
  }

  customizeAccessory() {
    const unlocked = Account.characters.unlockedItems.filter(itemId => 
      CHARACTER_ITEMS.accessories.some(item => item.id === itemId)
    );
    const options = ["NONE", ...unlocked.map(id => {
      const item = CHARACTER_ITEMS.accessories.find(i => i.id === id);
      return item ? item.name : id;
    })];
    
    const accessoryText = new Text(96, 80, "ACCESSORY", FONTS.shaded);
    accessoryText.anchor.set(0.5);
    
    const currentIndex = this.selectedCharacter.appearance.accessory ? 
      unlocked.indexOf(this.selectedCharacter.appearance.accessory) + 1 : 0;
    let selectedIndex = currentIndex;
    const accessoryValueText = new Text(96, 90, options[selectedIndex], FONTS.default);
    accessoryValueText.anchor.set(0.5);
    
    const accessoryHandler = (key) => {
      if (key === 'left') {
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
      } else if (key === 'right') {
        selectedIndex = (selectedIndex + 1) % options.length;
      } else if (key === 'a' || key === 'start') {
        // Apply and exit
        this.selectedCharacter.appearance.accessory = selectedIndex === 0 ? null : unlocked[selectedIndex - 1];
        this.characterDisplay.updateAppearance({ accessory: this.selectedCharacter.appearance.accessory });
        accessoryText.destroy();
        accessoryValueText.destroy();
        gamepad.signals.pressed.any.remove(accessoryHandler);
        return;
      } else if (key === 'b' || key === 'select') {
        // Cancel
        accessoryText.destroy();
        accessoryValueText.destroy();
        gamepad.signals.pressed.any.remove(accessoryHandler);
        return;
      }
      
      accessoryValueText.write(options[selectedIndex]);
    };
    
    gamepad.signals.pressed.any.add(accessoryHandler);
  }

  finishCustomization() {
    // Save changes
    this.characterManager.saveToAccount();
    
    // Clean up
    if (this.customizationMenu) {
      this.customizationMenu.destroy();
      this.customizationMenu = null;
    }
    
    // Return to action menu
    this.showActionMenu();
  }

  deleteCharacter() {
    if (this.characterManager.getCharacterList().length <= 1) {
      notifications.show("Cannot delete last character");
      return;
    }
    
    // Use text-based confirmation instead of window
    const confirmText = new Text(96, 60, "DELETE CHARACTER?\n\nPRESS A TO CONFIRM\nPRESS B TO CANCEL", FONTS.shaded);
    confirmText.anchor.set(0.5);
    
    const confirmHandler = (key) => {
      if (key === 'a') {
        // Confirm deletion
        this.characterManager.deleteCharacter(this.selectedCharacter.name);
        this.selectedCharacter = this.characterManager.getCharacterList()[0];
        confirmText.destroy();
        gamepad.signals.pressed.any.remove(confirmHandler);
        
        // Refresh UI
        if (this.actionMenu) {
          this.actionMenu.destroy();
          this.actionMenu = null;
        }
        this.createUI();
        this.updateDisplay();
        
      } else if (key === 'b') {
        // Cancel
        confirmText.destroy();
        gamepad.signals.pressed.any.remove(confirmHandler);
      }
    };
    
    gamepad.signals.pressed.any.add(confirmHandler);
  }

  addCharacter() {
    const nameText = new Text(96, 60, "ENTER NAME (MAX 4 LETTERS)\n\nUSE A/B/X/Y BUTTONS\nSTART TO CONFIRM", FONTS.shaded);
    nameText.anchor.set(0.5);
    
    const nameDisplay = new Text(96, 80, "____", FONTS.default);
    nameDisplay.anchor.set(0.5);
    
    let name = "";
    
    const updateNameDisplay = () => {
      let display = name;
      while (display.length < CHARACTER_SYSTEM.MAX_NAME_LENGTH) {
        display += "_";
      }
      nameDisplay.write(display);
    };
    
    const nameHandler = (key) => {
      if (key === 'backspace') {
        name = name.slice(0, -1);
      } else if (key === 'a' && name.length < CHARACTER_SYSTEM.MAX_NAME_LENGTH) {
        name += 'A';
      } else if (key === 'b' && name.length < CHARACTER_SYSTEM.MAX_NAME_LENGTH) {
        name += 'B';
      } else if (key === 'x' && name.length < CHARACTER_SYSTEM.MAX_NAME_LENGTH) {
        name += 'X';
      } else if (key === 'y' && name.length < CHARACTER_SYSTEM.MAX_NAME_LENGTH) {
        name += 'Y';
      } else if (key === 'start') {
        // Confirm creation
        if (name.length > 0) {
          const newChar = this.characterManager.createCharacter(name);
          if (newChar) {
            this.selectedCharacter = newChar;
            nameText.destroy();
            nameDisplay.destroy();
            gamepad.signals.pressed.any.remove(nameHandler);
            
            // Refresh UI
            this.createUI();
            this.updateDisplay();
            this.showActionMenu();
          } else {
            notifications.show("Character name already exists");
          }
        }
        return;
      } else if (key === 'select') {
        // Cancel
        nameText.destroy();
        nameDisplay.destroy();
        gamepad.signals.pressed.any.remove(nameHandler);
        return;
      }
      
      updateNameDisplay();
    };
    
    gamepad.signals.pressed.any.add(nameHandler);
    updateNameDisplay();
  }

  update() {
    gamepad.update();
    if (this.characterCarousel && !this.actionMenu && !this.customizationMenu) {
      this.characterCarousel.update();
    }
    if (this.actionMenu) {
      this.actionMenu.update();
    }
    if (this.customizationMenu) {
      this.customizationMenu.update();
    }
  }

  shutdown() {
    this.characterManager.saveToAccount();
  }
}
