class CharacterSelect extends Phaser.State {
  create() {
    game.camera.fadeIn(0x000000);

    this.characterManager = new CharacterManager();
    this.selectedCharacter = this.characterManager.getCurrentCharacter();

    new Background('ui_lobby_background', false, 1);
    new Background('ui_lobby_overlay', true, 0.3, 0.5);
    new FuturisticLines();

    this.navigationHint = new NavigationHint(0);

    this.createUI();
    this.updateDisplay();
  }

  createUI() {
    // Create all UI elements that persist throughout the state
    this.characterDisplay = new CharacterDisplay(46, 6, this.selectedCharacter);
    this.createDetailsText();
    
    // Initialize menus as null
    this.actionMenu = null;
    this.customizationMenu = null;
    this.skillsCarousel = null;
    this.creationMenu = null;
    this.characterCarousel = null;

    // Show initial state
    this.showHomeUI();
  }

  createDetailsText() {
    // Create text display for character details
    this.nameText = new Text(115, 10, "", FONTS.shaded);
    this.levelText = new Text(140, 10, "", FONTS.default);
    this.selectedSkillText = new Text(115, 34, "", FONTS.default);
    this.skillDescriptionText = new Text(117, 42, "", FONTS.default);
    
    // Create experience bar and skill bar
    this.expBar = new ExperienceBar(140, 16, 36, 3);
    this.skillBar = new SkillBar(117, 18);
  }
  
  showHomeUI() {
    // Clear any existing menus
    this.clearAllMenus();
    
    // Show character details
    this.showCharacterDetails();
    
    // Create character list
    this.showCharacterList();
    
    // Update display with current character
    this.updateDisplay();
  }
  
  clearAllMenus() {
    // Destroy all menus
    if (this.characterCarousel) {
      this.characterCarousel.destroy();
      this.characterCarousel = null;
    }
    if (this.actionMenu) {
      this.actionMenu.destroy();
      this.actionMenu = null;
    }
    if (this.customizationMenu) {
      this.customizationMenu.destroy();
      this.customizationMenu = null;
    }
    if (this.skillsCarousel) {
      this.skillsCarousel.destroy();
      this.skillsCarousel = null;
    }
    if (this.creationMenu) {
      this.creationMenu.destroy();
      this.creationMenu = null;
    }
    
    // Remove any input handlers
    gamepad.signals.pressed.any.removeAll();
  }
  
  writeCharacterInformation() {
    const char = this.selectedCharacter;
    
    // Name
    this.nameText.write(char ? char.name : "");
    this.nameText.bringToTop();
    
    // Level and experience
    const expText = char ? `${char.experience}/${char.getRequiredExperience()}` : "";
    this.levelText.write(char ? `Lv. ${char.level}` : "");
    this.levelText.bringToTop();
    
    // Update experience bar
    if (char) {
      this.expBar.setProgress(char.getExperienceProgress());
      this.expBar.bringToTop();
      this.expBar.visible = true;
    } else {
      this.expBar.visible = false;
    }
    
    // Skill level
    if (char) {
      this.skillBar.value = char.skillLevel;
      this.skillBar.update();
      this.skillBar.bringToTop();
      this.skillBar.visible = true;
    } else {
      this.skillBar.visible = false;
    }
    
    // Selected skill info
    if (char && char.selectedSkill) {
      const skill = CHARACTER_SKILLS.find(s => s.id === char.selectedSkill);
      if (skill) {
        this.selectedSkillText.write(skill.name);
        this.skillDescriptionText.write(skill.description);
        this.skillDescriptionText.wrapPreserveNewlines(70);
        this.selectedSkillText.bringToTop();
        this.skillDescriptionText.bringToTop();
      } else {
        this.selectedSkillText.write("");
        this.skillDescriptionText.write("< NO SKILL >");
        this.skillDescriptionText.bringToTop();
      }
    } else {
      this.selectedSkillText.write("");
      this.skillDescriptionText.write(char ? "< NO SKILL >" : "< NO CHARACTER >");
      this.selectedSkillText.bringToTop();
    }
  }

  selectCharacter(character) {
    this.selectedCharacter = character;
    this.updateDisplay();
  }

  updateDisplay() {
    // Update character display
    if (this.characterDisplay) {
      this.characterDisplay.destroy();
    }
    this.characterDisplay = new CharacterDisplay(46, 6, this.selectedCharacter);

    if (this.characterCarousel) {
      this.characterCarousel.bringToTop();
    }

    // Update details text
    this.writeCharacterInformation();
  }

  showCharacterList() {
    // Character list carousel (left)
    this.characterCarousel = new CarouselMenu(0, 8, 80, 104, {
      bgcolor: "#9b59b6",
      fgcolor: "#ffffff",
      align: "left",
      animate: true
    });

    // Add characters to carousel
    let index = 0;
    this.characterManager.getCharacterList().forEach(character => {
      const isCurrent = this.selectedCharacter && character.name === this.selectedCharacter.name;
      this.characterCarousel.addItem(isCurrent ? `> ${character.name}` : `  ${character.name}`, () => {
        this.selectCharacter(character);
        this.showActionMenu();
      }, {
        character: character,
        bgcolor: isCurrent ? "#e74c3c" : "#9b59b6"
      });
      if (isCurrent) {
        this.characterCarousel.selectIndex(index);
      }
      index++;
    });
    
    // Add Unselect option
    this.characterCarousel.addItem("× NO CHARACTER", () => {
      this.selectedCharacter = null;
      this.characterManager.unsetCharacter();
      this.showHomeUI();
    }, {
      bgcolor: this.selectedCharacter ? "#9b59b6" : "#e74c3c"
    });
    
    if (!this.selectedCharacter) this.characterCarousel.selectIndex(index);
    
    // Add "Add Character" option
    this.characterCarousel.addItem("+ ADD CHARACTER", () => this.startCharacterCreation());

    // Set up proper navigation
    this.characterCarousel.onSelect.add((index, item) => {
      this.selectCharacter(item.data.character || null);
    });
    
    this.showCharacterDetails();
    
    this.characterCarousel.onCancel.add(() => {
      game.state.start("MainMenu");
    });
  }

  showActionMenu() {
    this.clearAllMenus();
    this.hideCharacterDetails();

    this.actionMenu = new CarouselMenu(60, 60, 72, 48, {
      bgcolor: "#34495e",
      fgcolor: "#ffffff",
      align: "center",
      activeAlpha: 1,
      inactiveAlpha: 0.5
    });

    this.actionMenu.addItem("SELECT", () => this.confirmSelection());
    if (this.selectedCharacter.unlockedSkills.length) this.actionMenu.addItem("SET SKILL", () => this.setSkill());
    this.actionMenu.addItem("CUSTOMIZE", () => this.customizeCharacter());
    this.actionMenu.addItem("DELETE", () => this.deleteCharacter());

    // Proper cancel handling
    this.actionMenu.onCancel.add(() => {
      this.showHomeUI();
    });
  }

  confirmSelection() {
    this.characterManager.setCurrentCharacter(this.selectedCharacter.name);
    this.showCharacterList();
  }

  setSkill() {
    // Hide character details
    this.hideCharacterDetails();
    
    // Create skill preview text
    this.skillPreviewText = new Text(110, 4, "", FONTS.default);
    this.skillPreviewText.wrapPreserveNewlines(70);
    
    this.skillsCarousel = new CarouselMenu(0, 8, 80, 104, {
      bgcolor: "#9b59b6",
      fgcolor: "#ffffff",
      align: "left",
      animate: true
    });
    
    let i = 0;
    let selectedIndex = 0;
    
    this.selectedCharacter.unlockedSkills.forEach(skillId => {
      const skill = CHARACTER_SKILLS.find(s => s.id === skillId);
      if (skill) {
        const isCurrent = this.selectedCharacter.selectedSkill === skillId;
        if (isCurrent) selectedIndex = i;
        i++;
        this.skillsCarousel.addItem(isCurrent ? `> ${skill.name}` : `  ${skill.name}`, (item) => {
          this.selectedCharacter.selectedSkill = item.data.skillId;
          this.updateSkillPreview(item.data.skillId);
          this.skillsCarousel.destroy();
          this.skillsCarousel = null;
          this.skillPreviewText.destroy();
          this.setSkill();
        }, {
          skillId: skillId,
          bgcolor: isCurrent ? "#e74c3c" : "#9b59b6"
        });
      }
    });
    
    this.skillsCarousel.selectIndex(selectedIndex);
    
    // Set up navigation
    this.skillsCarousel.onSelect.add((index, item) => {
      this.updateSkillPreview(item.data.skillId);
    });
    
    this.skillsCarousel.onCancel.add(() => {
      this.skillsCarousel.destroy();
      this.skillsCarousel = null;
      this.skillPreviewText.destroy();
      this.showActionMenu();
    });
    
    // Update preview with first skill
    if (this.selectedCharacter.unlockedSkills.length > 0) {
      this.updateSkillPreview(this.selectedCharacter.unlockedSkills[0]);
    }
  }
  
  updateSkillPreview(skillId) {
    const skill = CHARACTER_SKILLS.find(s => s.id === skillId);
    if (!skill) return;
    
    let previewText = `${skill.name}\n\n`;
    previewText += `${skill.description}\n\n`;
    
    // Add effect details
    previewText += "EFFECT:\n";
    switch (skill.effect) {
      case 'convert_judgement':
        previewText += `• Converts ${skill.effectParams.from} to ${skill.effectParams.to}\n`;
        break;
      case 'modify_judgement_window':
        previewText += `• Judgement window ×${skill.effectParams.multiplier}\n`;
        break;
      case 'health_regen':
        previewText += `• +${skill.effectParams.amount} HP every ${skill.effectParams.interval/1000}s\n`;
        break;
      case 'modify_max_health':
        previewText += `• +${skill.effectParams.amount} Max HP\n`;
        break;
      case 'modify_note_speed':
        previewText += `• Note speed ×${skill.effectParams.multiplier}\n`;
        break;
    }
    
    // Add activation details
    previewText += "\nACTIVATION:\n";
    switch (skill.activationCondition) {
      case 'on_miss':
        previewText += "• When you get a Miss judgement\n";
        break;
      case 'on_combo':
        previewText += `• When combo reaches ${skill.effectParams.threshold}\n`;
        break;
      case 'on_low_health':
        previewText += `• When health drops below ${skill.effectParams.threshold}%\n`;
        break;
      case 'on_high_combo':
        previewText += `• When combo reaches ${skill.effectParams.threshold}\n`;
        break;
      case 'on_perfect_streak':
        previewText += `• After ${skill.effectParams.threshold} perfect notes in a row\n`;
        break;
    }
    
    // Add duration and cooldown
    if (skill.duration > 0) {
      previewText += `\nDURATION: ${skill.duration/1000}s\n`;
    }
    if (skill.cooldown > 0) {
      previewText += `COOLDOWN: ${skill.cooldown/1000}s\n`;
    }
    
    this.skillPreviewText.write(previewText);
    this.skillPreviewText.wrapPreserveNewlines(80);
    
    this.skillPreviewText.bringToTop();
  }

  customizeCharacter() {
    this.showCustomizationMenu();
  }

  showCustomizationMenu() {
    this.clearAllMenus();

    this.customizationMenu = new CarouselMenu(10, 60, 172, 48, {
      bgcolor: "#2c3e50",
      fgcolor: "#ffffff",
      align: "center",
      activeAlpha: 1,
      inactiveAlpha: 0.6
    });

    this.customizationMenu.addItem("SKIN TONE", () => this.customizeSkinTone());
    this.customizationMenu.addItem("HAIR COLOR", () => this.customizeHairColor());
    this.customizationMenu.addItem("FRONT HAIR", () => this.customizeHairStyle("frontHair"));
    this.customizationMenu.addItem("BACK HAIR", () => this.customizeHairStyle("backHair"));
    this.customizationMenu.addItem("CLOTHING", () => this.customizeClothing());
    this.customizationMenu.addItem("ACCESSORY", () => this.customizeAccessory());
    this.customizationMenu.addItem("APPLY", () => this.finishCustomization());

    // Proper cancel handling
    this.customizationMenu.onCancel.add(() => {
      this.characterDisplay.updateAppearance(this.originalAppearance);
      this.showActionMenu();
    });

    // Store original appearance for cancellation
    this.originalAppearance = { ...this.selectedCharacter.appearance };
  }
  
  createGradientBackground(x, y, width, height, color) {
    const bitmap = game.add.bitmapData(width, height);
    
    const gradient = bitmap.context.createLinearGradient(width, 0, 0, 0);
    
    const bgcolor = color || "rgba(44, 90, 198, 0.6)";
    
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.3, bgcolor);
    gradient.addColorStop(0.7, bgcolor);
    gradient.addColorStop(1, 'transparent');
    
    bitmap.context.fillStyle = gradient;
    bitmap.context.fillRect(0, 0, width, height);
    
    const sprite = game.add.sprite(x, y, bitmap);
    return sprite;
  }
  
  customizeSkinTone() {
    const skinOptions = ["LIGHT", "DARK"];
    
    const background = this.createGradientBackground(92, 85, 92, 24);
    background.anchor.set(0.5);
    
    const skinText = new Text(96, 80, "SKIN TONE", FONTS.shaded);
    skinText.anchor.set(0.5);

    let currentIndex = this.selectedCharacter.appearance.skinTone;
    const skinValueText = new Text(96, 90, skinOptions[currentIndex], FONTS.default);
    skinValueText.anchor.set(0.5);

    const skinHandler = key => {
      if (key === "left") {
        currentIndex = (currentIndex - 1 + skinOptions.length) % skinOptions.length;
        this.selectedCharacter.appearance.skinTone = currentIndex;
        this.characterDisplay.updateAppearance({ skinTone: currentIndex });
      } else if (key === "right") {
        currentIndex = (currentIndex + 1) % skinOptions.length;
        this.selectedCharacter.appearance.skinTone = currentIndex;
        this.characterDisplay.updateAppearance({ skinTone: currentIndex });
      } else if (key === "a" || key === "b" || key === "start") {
        skinText.destroy();
        skinValueText.destroy();
        background.destroy();
        gamepad.signals.pressed.any.remove(skinHandler);
        this.showCustomizationMenu();
        return;
      }

      skinValueText.write(skinOptions[currentIndex]);
    };

    gamepad.signals.pressed.any.add(skinHandler);
  }

  customizeHairColor() {
    let color = this.selectedCharacter.appearance.hairColor;
    let r = (color >> 16) & 0xff;
    let g = (color >> 8) & 0xff;
    let b = color & 0xff;
    
    const background = this.createGradientBackground(92, 85, 92, 24);
    background.anchor.set(0.5);

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

    const colorHandler = key => {
      switch (key) {
        case "left":
          r = Math.max(0, r - 32);
          break;
        case "right":
          r = Math.min(255, r + 32);
          break;
        case "up":
          g = Math.min(255, g + 32);
          break;
        case "down":
          g = Math.max(0, g - 32);
          break;
        case "a":
          b = Math.min(255, b + 32);
          break;
        case "b":
          b = Math.max(0, b - 32);
          break;
        case "start":
          colorText.destroy();
          rgbText.destroy();
          background.destroy();
          gamepad.signals.pressed.any.remove(colorHandler);
          this.showCustomizationMenu();
          return;
      }
      updateColor();
    };

    gamepad.signals.pressed.any.add(colorHandler);
  }

  customizeHairStyle(type) {
    const unlocked = Account.characters.unlockedHairs[type === "frontHair" ? "front" : "back"];
    const options = unlocked.map(id => CHARACTER_SYSTEM.HAIR_STYLES[type === "frontHair" ? "front" : "back"][id-1]);
    const values = [];
    
    for (let i = 0; i < unlocked.length; i++) {
      values.push(i + 1);
    }
    
    const background = this.createGradientBackground(92, 85, 92, 24);
    background.anchor.set(0.5);
    
    const hairText = new Text(96, 80, `${type.toUpperCase()}`, FONTS.shaded);
    hairText.anchor.set(0.5);
    
    let currentIndex = this.selectedCharacter.appearance[type] - 1;
    
    const hairValueText = new Text(96, 90, options[currentIndex], FONTS.default);
    hairValueText.anchor.set(0.5);

    const hairHandler = key => {
      if (key === "left") {
        currentIndex = (currentIndex - 1 + options.length) % options.length;
        this.characterDisplay.updateAppearance({ [type]: values[currentIndex] });
      } else if (key === "right") {
        currentIndex = (currentIndex + 1) % options.length;
        this.characterDisplay.updateAppearance({ [type]: values[currentIndex] });
      } else if (key === "a" || key === "b" || key === "start") {
        this.selectedCharacter.appearance[type] = values[currentIndex];
        this.characterDisplay.updateAppearance({ [type]: values[currentIndex] });
        hairText.destroy();
        hairValueText.destroy();
        background.destroy();
        gamepad.signals.pressed.any.remove(hairHandler);
        this.showCustomizationMenu();
        return;
      }

      hairValueText.write(options[currentIndex]);
    };

    gamepad.signals.pressed.any.add(hairHandler);
  }

  customizeClothing() {
    const unlocked = Account.characters.unlockedItems.filter(itemId => CHARACTER_ITEMS.clothing.some(item => item.id === itemId));
    const options = unlocked.map(id => {
      const item = CHARACTER_ITEMS.clothing.find(i => i.id === id);
      return item ? item.name : id;
    });
    
    const background = this.createGradientBackground(92, 85, 92, 24);
    background.anchor.set(0.5);

    const clothingText = new Text(96, 80, "CLOTHING", FONTS.shaded);
    clothingText.anchor.set(0.5);

    let currentIndex = unlocked.indexOf(this.selectedCharacter.appearance.clothing);
    if (currentIndex === -1) currentIndex = 0;
    
    const clothingValueText = new Text(96, 90, options[currentIndex], FONTS.default);
    clothingValueText.anchor.set(0.5);

    const clothingHandler = key => {
      if (key === "left") {
        currentIndex = (currentIndex - 1 + options.length) % options.length;
        this.characterDisplay.updateAppearance({ clothing: unlocked[currentIndex] });
      } else if (key === "right") {
        currentIndex = (currentIndex + 1) % options.length;
        this.characterDisplay.updateAppearance({ clothing: unlocked[currentIndex] });
      } else if (key === "a" || key === "b" || key === "start") {
        this.selectedCharacter.appearance.clothing = unlocked[currentIndex];
        this.characterDisplay.updateAppearance({ clothing: unlocked[currentIndex] });
        clothingText.destroy();
        clothingValueText.destroy();
        background.destroy();
        gamepad.signals.pressed.any.remove(clothingHandler);
        this.showCustomizationMenu();
        return;
      }

      clothingValueText.write(options[currentIndex]);
    };

    gamepad.signals.pressed.any.add(clothingHandler);
  }

  customizeAccessory() {
    const unlocked = Account.characters.unlockedItems.filter(itemId => CHARACTER_ITEMS.accessories.some(item => item.id === itemId));
    const options = [
      "NONE",
      ...unlocked.map(id => {
        const item = CHARACTER_ITEMS.accessories.find(i => i.id === id);
        return item ? item.name : id;
      })
    ];

    const background = this.createGradientBackground(92, 85, 92, 24);
    background.anchor.set(0.5);
    
    const accessoryText = new Text(96, 80, "ACCESSORY", FONTS.shaded);
    accessoryText.anchor.set(0.5);

    const currentIndex = this.selectedCharacter.appearance.accessory ? unlocked.indexOf(this.selectedCharacter.appearance.accessory) + 1 : 0;
    let selectedIndex = currentIndex;
    const accessoryValueText = new Text(96, 90, options[selectedIndex], FONTS.default);
    accessoryValueText.anchor.set(0.5);

    const accessoryHandler = key => {
      if (key === "left") {
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        this.characterDisplay.updateAppearance({ accessory: selectedIndex === 0 ? null : unlocked[selectedIndex - 1] });
      } else if (key === "right") {
        selectedIndex = (selectedIndex + 1) % options.length;
        this.characterDisplay.updateAppearance({ accessory: selectedIndex === 0 ? null : unlocked[selectedIndex - 1] });
      } else if (key === "a" || key === "b" || key === "start") {
        this.selectedCharacter.appearance.accessory = selectedIndex === 0 ? null : unlocked[selectedIndex - 1];
        this.characterDisplay.updateAppearance({ accessory: this.selectedCharacter.appearance.accessory });
        accessoryText.destroy();
        accessoryValueText.destroy();
        background.destroy();
        gamepad.signals.pressed.any.remove(accessoryHandler);
        this.showCustomizationMenu();
        return;
      }
      accessoryValueText.write(options[selectedIndex]);
    };

    gamepad.signals.pressed.any.add(accessoryHandler);
  }

  finishCustomization() {
    this.characterManager.saveToAccount();
    this.showActionMenu();
  }

  deleteCharacter() {
    this.confirm(
      "DELETE CHARACTER?",
      () => {
        // Confirm callback
        this.characterManager.deleteCharacter(this.selectedCharacter.name);
        
        // Equip another character or leave unequiped
        if (this.characterManager.getCharacterList().length <= 1) {
          this.selectedCharacter = null;
          this.characterManager.unsetCharacter();
        } else {
          this.selectedCharacter = this.characterManager.getCharacterList()[0];
        }
        this.showHomeUI();
      },
      () => {
        // Cancel callback - return to action menu
        this.showActionMenu();
      },
      "no" // Recommended to choose "No" for destructive actions
    );
  }
  
  confirm(message, onConfirm, onCancel, recommended = "none") {
    // Clear any existing menus
    this.clearAllMenus();
    
    // Create confirmation text
    const confirmText = new Text(96, 60, message, FONTS.shaded);
    confirmText.anchor.set(0.5);
    
    // Create confirmation menu
    const confirmMenu = new CarouselMenu(60, 70, 72, 32, {
      bgcolor: "#2c3e50",
      fgcolor: "#ffffff",
      align: "center"
    });
    
    // Determine button colors based on recommended option
    let yesColor = "#34495e"; // Default
    let noColor = "#34495e";  // Default
    let initialSelection = 0; // Start on first item (YES)
    
    switch (recommended) {
      case "yes":
        yesColor = "#27ae60"; // Green for recommended
        noColor = "#c0392b";  // Red for not recommended
        initialSelection = 0; // Start on YES
        break;
      case "no":
        yesColor = "#c0392b"; // Red for not recommended
        noColor = "#27ae60";  // Green for recommended
        initialSelection = 1; // Start on NO
        break;
      default: // "none" or undefined
        yesColor = "#34495e";
        noColor = "#34495e";
        initialSelection = 0;
        break;
    }
    
    // Add buttons with appropriate colors
    confirmMenu.addItem("YES", () => {
      confirmText.destroy();
      confirmMenu.destroy();
      onConfirm?.();
    }, {
      bgcolor: yesColor
    });
    
    confirmMenu.addItem("NO", () => {
      confirmText.destroy();
      confirmMenu.destroy();
      onCancel?.();
    }, {
      bgcolor: noColor
    });
    
    // Set initial selection based on recommended option
    if (initialSelection === 1) {
      confirmMenu.selectIndex(1);
    }
    
    // Set up cancel handling
    confirmMenu.onCancel.add(() => {
      confirmText.destroy();
      confirmMenu.destroy();
      onCancel?.();
    });
  }

  startCharacterCreation() {
    this.creationStep = 0;
    this.newCharacterAppearance = {
      skinTone: 0,
      hairColor: 0xFFFFFF,
      frontHair: "1",
      backHair: "1",
      clothing: "school_uniform",
      accessory: null
    };
    
    // Hide existing UI and character details
    this.clearAllMenus();
    this.hideCharacterDetails();
    
    // Create temporary character display for creation
    this.tempCharacterDisplay = new CharacterDisplay(46, 6, {
      name: "NEW CHARACTER",
      appearance: this.newCharacterAppearance
    });
    
    this.creationWindowManager = new WindowManager();
    
    this.showCreationStep();
  }
  
  hideCharacterDetails() {
    this.nameText.visible = false;
    this.levelText.visible = false;
    this.selectedSkillText.visible = false;
    this.skillDescriptionText.visible = false;
    this.expBar.visible = false;
    this.skillBar.visible = false;
  }
  
  showCharacterDetails() {
    this.nameText.visible = true;
    this.levelText.visible = true;
    this.selectedSkillText.visible = true;
    this.skillDescriptionText.visible = true;
    this.expBar.visible = true;
    this.skillBar.visible = true;
  }
  
  showCreationStep() {
    // Remove any existing creation UI and input handlers
    if (this.creationMenu) {
      this.creationMenu.destroy();
      this.creationMenu = null;
    }
    if (this.creationText) {
      this.creationText.destroy();
      this.creationText = null;
    }
    if (this.creationWindow) {
      this.creationWindowManager.remove(this.creationWindow, true);
    }
    
    // Clear any existing input handlers
    gamepad.signals.pressed.any.removeAll();
    
    const steps = [
      { title: "CHOOSE SKIN TONE", action: (callback) => this.creationCustomizeSkinTone(callback) },
      { title: "CHOOSE HAIR COLOR", action: (callback) => this.creationCustomizeHairColor(callback) },
      { title: "CHOOSE FRONT HAIR", action: (callback) => this.creationCustomizeHairStyle("frontHair", callback) },
      { title: "CHOOSE BACK HAIR", action: (callback) => this.creationCustomizeHairStyle("backHair", callback) },
      { title: "CHOOSE CLOTHING", action: (callback) => this.creationCustomizeClothing(callback) },
      { title: "CHOOSE ACCESSORY", action: (callback) => this.creationCustomizeAccessory(callback) },
      { title: "NAME YOUR CHARACTER", action: (callback) => this.creationNameCharacter(callback) }
    ];
    
    if (this.creationStep < steps.length) {
      const step = steps[this.creationStep];
      
      this.creationWindow = this.creationWindowManager.createWindow(12, 7, 10, 5, "1");
      this.creationWindow.x -= (this.creationWindow.size.width / 2) * 8;
      
      this.creationWindow.offset = {
        x: 20,
        y: 8
      };
      
      this.creationWindow.disableScrollBar = true;
      
      this.creationText = new Text(96, 70, step.title, FONTS.shaded);
      this.creationText.anchor.set(0.5);
      
      // Show customization interface first
      step.action(() => {
        // When customization is done, show the navigation menu
        this.showCreationNavigationMenu();
      });
    }
  }
  
  showCreationNavigationMenu() {
    this.creationWindow.addItem("NEXT", "", () => {
      this.creationStep++;
      this.showCreationStep();
    });
    
    if (this.creationStep > 0) {
      this.creationWindow.addItem("PREVIOUS", "", () => {
        this.creationStep--;
        this.showCreationStep();
      }, true);
    }
    
    this.creationWindow.addItem("CANCEL", "", () => {
      this.cancelCharacterCreation();
    }, this.creationStep <= 0);
    
    this.creationWindowManager.focus(this.creationWindow);
  }
  
  creationCustomizeSkinTone(callback) {
    const skinOptions = ["LIGHT", "DARK"];
    let currentIndex = this.newCharacterAppearance.skinTone;
    
    const skinText = new Text(96, 80, skinOptions[currentIndex], FONTS.default);
    skinText.anchor.set(0.5);
    
    const skinHandler = key => {
      if (key === "left") {
        currentIndex = (currentIndex - 1 + skinOptions.length) % skinOptions.length;
      } else if (key === "right") {
        currentIndex = (currentIndex + 1) % skinOptions.length;
      } else if (key === "a") {
        // Confirm selection and proceed
        skinText.destroy();
        gamepad.signals.pressed.any.remove(skinHandler);
        callback();
        return;
      } else if (key === "b") {
        // Go back to navigation
        skinText.destroy();
        gamepad.signals.pressed.any.remove(skinHandler);
        this.showCreationNavigationMenu();
        return;
      }
      
      this.newCharacterAppearance.skinTone = currentIndex;
      this.tempCharacterDisplay.updateAppearance({ skinTone: currentIndex });
      skinText.write(skinOptions[currentIndex]);
    };
    
    gamepad.signals.pressed.any.add(skinHandler);
  }
  
  creationCustomizeHairColor(callback) {
    let color = this.newCharacterAppearance.hairColor;
    let r = Math.max(0x88, (color >> 16) & 0xff);
    let g = Math.max(0x88, (color >> 8) & 0xff);
    let b = Math.max(0x88, color & 0xff);
    
    const updateColor = () => {
      const newColor = (r << 16) | (g << 8) | b;
      this.newCharacterAppearance.hairColor = newColor;
      this.tempCharacterDisplay.updateAppearance({ hairColor: newColor });
      return `R:${r} G:${g} B:${b}`;
    };
    
    const rgbText = new Text(96, 80, updateColor(), FONTS.default);
    rgbText.anchor.set(0.5);
    
    const colorHandler = key => {
      switch (key) {
        case "left":
          r = Math.max(0, r - 32);
          break;
        case "right":
          r = Math.min(255, r + 32);
          break;
        case "up":
          g = Math.min(255, g + 32);
          break;
        case "down":
          g = Math.max(0, g - 32);
          break;
        case "a":
          b = Math.min(255, b + 32);
          break;
        case "b":
          b = Math.max(0, b - 32);
          break;
        case "start":
          // Confirm selection
          rgbText.destroy();
          gamepad.signals.pressed.any.remove(colorHandler);
          callback();
          return;
        case "select":
          // Go back to navigation
          rgbText.destroy();
          gamepad.signals.pressed.any.remove(colorHandler);
          this.showCreationNavigationMenu();
          return;
      }
      
      rgbText.write(updateColor());
    };
    
    gamepad.signals.pressed.any.add(colorHandler);
  }
  
  creationCustomizeHairStyle(type, callback) {
    const unlocked = Account.characters.unlockedHairs[type === "frontHair" ? "front" : "back"];
    const options = unlocked.map(id => CHARACTER_SYSTEM.HAIR_STYLES[type === "frontHair" ? "front" : "back"][id-1]);
    const values = [];
    
    for (let i = 0; i < unlocked.length; i++) {
      values.push(i + 1);
    }
    
    let currentIndex = this.newCharacterAppearance[type] - 1;
    
    const hairText = new Text(96, 80, options[currentIndex], FONTS.default);
    hairText.anchor.set(0.5);

    const updateHair = () => {
      this.newCharacterAppearance[type] = values[currentIndex];
      this.tempCharacterDisplay.updateAppearance({ [type]: values[currentIndex] });
      hairText.write(options[currentIndex]);
    };
    
    const hairHandler = key => {
      if (key === "left") {
        currentIndex = (currentIndex - 1 + options.length) % options.length;
      } else if (key === "right") {
        currentIndex = (currentIndex + 1) % options.length;
      } else if (key === "a") {
        // Confirm selection
        hairText.destroy();
        gamepad.signals.pressed.any.remove(hairHandler);
        callback();
        return;
      } else if (key === "b") {
        // Go back to navigation
        hairText.destroy();
        gamepad.signals.pressed.any.remove(hairHandler);
        this.showCreationNavigationMenu();
        return;
      }
      
      updateHair();
    };
    
    updateHair();
    gamepad.signals.pressed.any.add(hairHandler);
  }

  creationCustomizeClothing(callback) {
    const unlocked = Account.characters.unlockedItems.filter(itemId => 
      CHARACTER_ITEMS.clothing.some(item => item.id === itemId)
    );
    const options = unlocked.map(id => {
      const item = CHARACTER_ITEMS.clothing.find(i => i.id === id);
      return item ? item.name : id;
    });
    
    let currentIndex = unlocked.indexOf(this.newCharacterAppearance.clothing);
    if (currentIndex === -1) currentIndex = 0;
    
    const clothingText = new Text(96, 80, options[currentIndex], FONTS.default);
    clothingText.anchor.set(0.5);
    
    const clothingHandler = key => {
      if (key === "left") {
        currentIndex = (currentIndex - 1 + options.length) % options.length;
      } else if (key === "right") {
        currentIndex = (currentIndex + 1) % options.length;
      } else if (key === "a") {
        // Confirm selection
        clothingText.destroy();
        gamepad.signals.pressed.any.remove(clothingHandler);
        callback();
        return;
      } else if (key === "b") {
        // Go back to navigation
        clothingText.destroy();
        gamepad.signals.pressed.any.remove(clothingHandler);
        this.showCreationNavigationMenu();
        return;
      }
      
      this.newCharacterAppearance.clothing = unlocked[currentIndex];
      this.tempCharacterDisplay.updateAppearance({ clothing: unlocked[currentIndex] });
      clothingText.write(options[currentIndex]);
    };
    
    gamepad.signals.pressed.any.add(clothingHandler);
  }
  
  creationCustomizeAccessory(callback) {
    const unlocked = Account.characters.unlockedItems.filter(itemId => 
      CHARACTER_ITEMS.accessories.some(item => item.id === itemId)
    );
    const options = [
      "NONE",
      ...unlocked.map(id => {
        const item = CHARACTER_ITEMS.accessories.find(i => i.id === id);
        return item ? item.name : id;
      })
    ];
    
    let currentIndex = this.newCharacterAppearance.accessory ? 
      unlocked.indexOf(this.newCharacterAppearance.accessory) + 1 : 0;
    
    const accessoryText = new Text(96, 80, options[currentIndex], FONTS.default);
    accessoryText.anchor.set(0.5);
    
    const accessoryHandler = key => {
      if (key === "left") {
        currentIndex = (currentIndex - 1 + options.length) % options.length;
      } else if (key === "right") {
        currentIndex = (currentIndex + 1) % options.length;
      } else if (key === "a") {
        // Confirm selection
        accessoryText.destroy();
        gamepad.signals.pressed.any.remove(accessoryHandler);
        callback();
        return;
      } else if (key === "b") {
        // Go back to navigation
        accessoryText.destroy();
        gamepad.signals.pressed.any.remove(accessoryHandler);
        this.showCreationNavigationMenu();
        return;
      }
      
      this.newCharacterAppearance.accessory = currentIndex === 0 ? null : unlocked[currentIndex - 1];
      this.tempCharacterDisplay.updateAppearance({ accessory: this.newCharacterAppearance.accessory });
      accessoryText.write(options[currentIndex]);
    };
    
    accessoryHandler();
    gamepad.signals.pressed.any.add(accessoryHandler);
  }
  
  creationNameCharacter(callback) {
    if (this.creationMenu) {
      this.creationMenu.destroy();
      this.creationMenu = null;
    }
    if (this.creationText) {
      this.creationText.destroy();
      this.creationText = null;
    }
    
    const nameText = new Text(96, 80, "ENTER CHARACTER NAME", FONTS.shaded);
    nameText.anchor.set(0.5);
    
    new TextInput(
      "",
      CHARACTER_SYSTEM.MAX_NAME_LENGTH,
      name => {
        // Finalize character creation
        const newChar = this.characterManager.createCharacter(name, this.newCharacterAppearance);
        if (newChar) {
          this.selectedCharacter = newChar;
          nameText.destroy();
          instructionText.destroy();
          
          // Clean up temporary display
          if (this.tempCharacterDisplay) {
            this.tempCharacterDisplay.destroy();
            this.tempCharacterDisplay = null;
          }
          
          // Return to home UI
          this.showHomeUI();
        } else {
          notifications.show("Character name already exists");
          // Retry naming
          this.creationNameCharacter(callback);
        }
      },
      () => {
        // Cancel creation
        nameText.destroy();
        this.cancelCharacterCreation();
      }
    );
  }
  
  cancelCharacterCreation() {
    // Clean up
    if (this.tempCharacterDisplay) {
      this.tempCharacterDisplay.destroy();
      this.tempCharacterDisplay = null;
    }
    if (this.creationMenu) {
      this.creationMenu.destroy();
      this.creationMenu = null;
    }
    if (this.creationText) {
      this.creationText.destroy();
      this.creationText = null;
    }
    if (this.creationWindow) {
      this.creationWindowManager.remove(this.creationWindow, true);
    }
    
    // Return to home UI
    this.showHomeUI();
  }

  update() {
    gamepad.update();
    
    if (this.creationWindowManager) {
      this.creationWindowManager.update();
    }
  }

  shutdown() {
    this.characterManager.saveToAccount();
  }
}
