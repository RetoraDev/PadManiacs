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
    // Character display area (center top)
    this.characterDisplay = new CharacterDisplay(96, 0, this.selectedCharacter);
    this.characterDisplay.anchor.set(0.5, 0);
    
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
    
    // Character details (right)
    this.detailsWindow = new Window(110, 10, 10, 12, "1");
    this.updateDetails();
    
    // Action menu (will be shown when character is selected)
    this.actionMenu = null;
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
    this.characterDisplay = new CharacterDisplay(96, 0, this.selectedCharacter);
    this.characterDisplay.anchor.set(0.5, 0);
    
    // Update details
    this.updateDetails();
    
    // Update carousel selection highlighting
    /* NOTE: COMPLETELY BUGGY and unnecessary, REMOVE
    this.characterCarousel.items.forEach((item, index) => {
      if (item.data && item.data.character) {
        const isSelected = item.data.character.name === this.selectedCharacter.name;
        item.data.bgcolor = isSelected ? '#e74c3c' : '#9b59b6';
        item.setText(isSelected ? `> ${item.data.character.name}` : `  ${item.data.character.name}`);
      }
    });
    */
    this.characterCarousel.updateSelection();
  }

  updateDetails() {
    if (!this.detailsWindow) return;
    
    this.detailsWindow.clear();
    
    // NOTE: Dont use a window, use Text class instead
    const char = this.selectedCharacter;
    this.detailsWindow.addItem(`NAME: ${char.name}`, "");
    this.detailsWindow.addItem(`LEVEL: ${char.level}`, "");
    this.detailsWindow.addItem(`SKILL: ${char.skillLevel}/5`, "");
    this.detailsWindow.addItem(`EXP: ${char.experience}/${char.getRequiredExperience()}`, "");
    
    // Experience bar
    const expProgress = char.getExperienceProgress();
    const expBar = `[${'='.repeat(Math.floor(expProgress * 8))}${' '.repeat(8 - Math.floor(expProgress * 8))}]`;
    this.detailsWindow.addItem(expBar, "");
    
    // Unlocked skills
    this.detailsWindow.addItem("SKILLS:", "");
    char.unlockedSkills.forEach(skillId => {
      const skill = CHARACTER_SKILLS.find(s => s.id === skillId);
      if (skill) {
        this.detailsWindow.addItem(`- ${skill.name}`, "");
      }
    });
    
    this.detailsWindow.update();
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
    this.actionMenu.addItem("SET SKILL", () => this.setSkill());
    this.actionMenu.addItem("DELETE", () => this.deleteCharacter());
    
    this.actionMenu.onCancel.add(() => {
      this.actionMenu.destroy();
      this.actionMenu = null;
    });
  }

  confirmSelection() {
    this.characterManager.setCurrentCharacter(this.selectedCharacter.name);
    notifications.show(`Character selected: ${this.selectedCharacter.name}`);
    game.state.start("MainMenu");
  }

  customizeCharacter() {
    // NOTE: No need to start a different game state, CharacterCustomize logic can be implemented here
    game.state.start("CharacterCustomize", true, false, this.selectedCharacter);
  }

  setSkill() {
    // TODO: Implement skill selection interface
    // NOTE: Implement this logic
    notifications.show("Skill selection not yet implemented");
  }

  deleteCharacter() {
    if (this.characterManager.getCharacterList().length <= 1) {
      notifications.show("Cannot delete last character");
      return;
    }
    
    const confirmWindow = new Window(70, 40, 8, 4, "1");
    confirmWindow.addItem("CONFIRM?", "");
    confirmWindow.addItem("YES", () => {
      this.characterManager.deleteCharacter(this.selectedCharacter.name);
      this.selectedCharacter = this.characterManager.getCharacterList()[0];
      confirmWindow.destroy();
      this.actionMenu.destroy();
      this.actionMenu = null;
      this.createUI(); // Refresh UI
      this.updateDisplay();
    });
    confirmWindow.addItem("NO", () => {
      confirmWindow.destroy();
    });
  }

  addCharacter() {
    const nameInputWindow = new Window(70, 40, 10, 4, "1");
    nameInputWindow.addItem("ENTER NAME:", "");
    
    let name = "";
    const nameItem = nameInputWindow.addItem(name.padEnd(CHARACTER_SYSTEM.MAX_NAME_LENGTH, '_'), "");
    
    // Simple name input handling
    const onInput = (key) => {
      if (key === 'backspace') {
        name = name.slice(0, -1);
      } else if (key.length === 1 && name.length < CHARACTER_SYSTEM.MAX_NAME_LENGTH) {
        name += key.toUpperCase();
      }
      nameItem.setText(name.padEnd(CHARACTER_SYSTEM.MAX_NAME_LENGTH, '_'));
    };
    
    // Map gamepad to input
    gamepad.signals.pressed.any.add((key) => {
      if (['a', 'b', 'up', 'down', 'left', 'right', 'start', 'select'].includes(key)) return;
      
      if (key === 'backspace') {
        onInput('backspace');
      } else {
        // Map gamepad buttons to letters
        const buttonMap = {
          'a': 'A', 'b': 'B', 'x': 'X', 'y': 'Y'
        };
        if (buttonMap[key]) {
          onInput(buttonMap[key]);
        }
      }
    });
    
    // NOTE: This input system is incomplete
    
    nameInputWindow.addItem("CREATE", () => {
      if (name.length > 0) {
        const newChar = this.characterManager.createCharacter(name);
        if (newChar) {
          this.selectedCharacter = newChar;
          nameInputWindow.destroy();
          this.createUI();
          this.updateDisplay();
          this.showActionMenu();
        } else {
          notifications.show("Invalid name or character exists");
        }
      }
    });
    
    nameInputWindow.addItem("CANCEL", () => {
      nameInputWindow.destroy();
    });
  }

  update() {
    gamepad.update();
    if (this.characterCarousel) this.characterCarousel.update();
    if (this.actionMenu) this.actionMenu.update();
  }

  shutdown() {
    this.characterManager.saveToAccount();
  }
}

// NOTE: onCancel signal noy being used correctly. It should used to start previous carousel or go back to menu when button B pressed, do not destroy the menu without bringing another menu or the player will get stuck
// NOTE: Character display was not visible for some reason

class CharacterCustomize {
  init(character) {
    this.character = character;
    this.originalAppearance = { ...character.appearance };
  }

  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    new BackgroundGradient();
    
    this.navigationHint = new NavigationHint(0);
    
    this.characterDisplay = new CharacterDisplay(96, 40, this.character);
    this.characterDisplay.scale.set(0.8);
    this.characterDisplay.anchor.set(0.5);
    
    this.createCustomizationMenu();
  }

  createCustomizationMenu() {
    this.menu = new CarouselMenu(10, 70, 172, 30, {
      bgcolor: "#2c3e50",
      fgcolor: "#ffffff",
      align: "center"
    });
    
    this.menu.addItem("SKIN TONE", () => this.customizeSkinTone());
    this.menu.addItem("HAIR COLOR", () => this.customizeHairColor());
    this.menu.addItem("FRONT HAIR", () => this.customizeFrontHair());
    this.menu.addItem("BACK HAIR", () => this.customizeBackHair());
    this.menu.addItem("CLOTHING", () => this.customizeClothing());
    this.menu.addItem("ACCESSORY", () => this.customizeAccessory());
    this.menu.addItem("APPLY", () => this.applyChanges());
    this.menu.addItem("CANCEL", () => this.cancelChanges());
  }

  customizeSkinTone() {
    const skinWindow = new Window(70, 40, 8, 4, "1");
    skinWindow.addItem("SKIN TONE:", "");
    skinWindow.addSettingItem(
      "",
      ["LIGHT", "DARK"],
      this.character.appearance.skinTone,
      (index) => {
        this.character.appearance.skinTone = index;
        this.characterDisplay.updateAppearance({ skinTone: index });
      }
    );
    skinWindow.addItem("BACK", () => skinWindow.destroy());
  }

  customizeHairColor() {
    // Simple hair color picker using RGB sliders
    let color = this.character.appearance.hairColor;
    let r = (color >> 16) & 0xFF;
    let g = (color >> 8) & 0xFF;
    let b = color & 0xFF;
    
    const colorWindow = new Window(60, 30, 12, 8, "1");
    colorWindow.addItem("HAIR COLOR:", "");
    
    const updateColor = () => {
      const newColor = (r << 16) | (g << 8) | b;
      this.character.appearance.hairColor = newColor;
      this.characterDisplay.updateAppearance({ hairColor: newColor });
    };
    
    colorWindow.addSettingItem("RED", ["0", "32", "64", "96", "128", "160", "192", "224", "255"], 
      Math.floor(r / 32), (index) => { r = index * 32; updateColor(); });
    colorWindow.addSettingItem("GREEN", ["0", "32", "64", "96", "128", "160", "192", "224", "255"], 
      Math.floor(g / 32), (index) => { g = index * 32; updateColor(); });
    colorWindow.addSettingItem("BLUE", ["0", "32", "64", "96", "128", "160", "192", "224", "255"], 
      Math.floor(b / 32), (index) => { b = index * 32; updateColor(); });
    
    colorWindow.addItem("BACK", () => colorWindow.destroy());
  }

  customizeFrontHair() {
    this.customizeHairStyle('frontHair');
  }

  customizeBackHair() {
    this.customizeHairStyle('backHair');
  }

  customizeHairStyle(type) {
    const unlocked = Account.characters.unlockedHairs[type === 'frontHair' ? 'front' : 'back'];
    const options = unlocked.map(id => `STYLE ${id}`);
    
    const hairWindow = new Window(70, 40, 8, Math.min(6, options.length + 2), "1");
    hairWindow.addItem(`${type.toUpperCase()}:`, "");
    
    hairWindow.addSettingItem(
      "",
      options,
      unlocked.indexOf(this.character.appearance[type]),
      (index) => {
        this.character.appearance[type] = unlocked[index];
        this.characterDisplay.updateAppearance({ [type]: unlocked[index] });
      }
    );
    
    hairWindow.addItem("BACK", () => hairWindow.destroy());
  }

  customizeClothing() {
    const unlocked = Account.characters.unlockedItems.filter(itemId => 
      CHARACTER_ITEMS.clothing.some(item => item.id === itemId)
    );
    const options = unlocked.map(id => {
      const item = CHARACTER_ITEMS.clothing.find(i => i.id === id);
      return item ? item.name : id;
    });
    
    const clothingWindow = new Window(70, 40, 10, Math.min(6, options.length + 2), "1");
    clothingWindow.addItem("CLOTHING:", "");
    
    clothingWindow.addSettingItem(
      "",
      options,
      unlocked.indexOf(this.character.appearance.clothing),
      (index) => {
        this.character.appearance.clothing = unlocked[index];
        this.characterDisplay.updateAppearance({ clothing: unlocked[index] });
      }
    );
    
    clothingWindow.addItem("BACK", () => clothingWindow.destroy());
  }

  customizeAccessory() {
    const unlocked = Account.characters.unlockedItems.filter(itemId => 
      CHARACTER_ITEMS.accessories.some(item => item.id === itemId)
    );
    const options = ["NONE", ...unlocked.map(id => {
      const item = CHARACTER_ITEMS.accessories.find(i => i.id === id);
      return item ? item.name : id;
    })];
    
    const accessoryWindow = new Window(70, 40, 10, Math.min(6, options.length + 2), "1");
    accessoryWindow.addItem("ACCESSORY:", "");
    
    const currentIndex = this.character.appearance.accessory ? 
      unlocked.indexOf(this.character.appearance.accessory) + 1 : 0;
    
    accessoryWindow.addSettingItem(
      "",
      options,
      currentIndex,
      (index) => {
        this.character.appearance.accessory = index === 0 ? null : unlocked[index - 1];
        this.characterDisplay.updateAppearance({ accessory: this.character.appearance.accessory });
      }
    );
    
    accessoryWindow.addItem("BACK", () => accessoryWindow.destroy());
  }

  applyChanges() {
    // Changes are already applied in real-time, just go back
    game.state.start("CharacterSelect");
  }

  cancelChanges() {
    // Restore original appearance
    this.character.appearance = this.originalAppearance;
    game.state.start("CharacterSelect");
  }

  update() {
    gamepad.update();
    if (this.menu) this.menu.update();
  }
}