class CharacterSelect {
  create() {
    game.camera.fadeIn(0x000000);

    this.characterManager = new CharacterManager();
    this.selectedCharacter = this.characterManager.getCurrentCharacter();

    new Background('ui_lobby_background', false, 1);
    new Background('ui_lobby_overlay', true, 0.3, 0.5);
    new FuturisticLines();

    this.navigationHint = new NavigationHint('general');

    this.createUI();
    this.updateDisplay();
  }

  createUI() {
    this.characterDisplay = new CharacterDisplay(70, 24, this.selectedCharacter);
    this.createDetailsText();

    this.actionMenu = null;
    this.customizationMenu = null;
    this.skillsCarousel = null;
    this.creationMenu = null;
    this.characterCarousel = null;
    this.itemListMenu = null;
    this.layerColorMenu = null;
    this.colorUI = null;
    this.colorSlot = null;
    this.colorValue = 0xffffff;
    this.colorStep = 32;
    this.colorHandler = null;
    this.currentLayerIndex = 0;

    this.showHomeUI();
  }

  createDetailsText() {
    this.nameText = new Text(144, 10, "", FONTS.shaded);
    this.levelText = new Text(175, 10, "", FONTS.default);
    this.itemNameText = new Text(144, 34, "", FONTS.default);
    this.itemDescriptionText = new Text(146, 42, "", FONTS.default);

    this.expBar = new ExperienceBar(175, 16, 36, 3);
    this.skillBar = new SkillBar(146, 18);
  }

  showHomeUI() {
    gamepad.releaseAll();
    this.clearAllMenus();
    this.showCharacterList();
    this.updateDisplay();
  }

  clearAllMenus() {
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
    if (this.itemListMenu) {
      this.itemListMenu.destroy();
      this.itemListMenu = null;
    }
    if (this.layerColorMenu) {
      this.layerColorMenu.destroy();
      this.layerColorMenu = null;
    }
    if (this.colorUI) {
      this.cleanupColorUI();
    }

    this.updateDetails("", "", false);
    gamepad.signals.pressed.any.removeAll();
  }

  writeCharacterInformation() {
    const char = this.selectedCharacter;
    this.nameText.write(char ? char.name : "");
    this.nameText.bringToTop();
    this.levelText.write(char ? `Lv. ${char.level}` : "");
    this.levelText.bringToTop();

    if (char) {
      this.expBar.setProgress(char.getExperienceProgress());
      this.expBar.bringToTop();
      this.expBar.visible = true;
    } else {
      this.expBar.visible = false;
    }

    if (char) {
      this.skillBar.value = char.skillLevel;
      this.skillBar.update();
      this.skillBar.bringToTop();
      this.skillBar.visible = true;
    } else {
      this.skillBar.visible = false;
    }
    
    let text = '';
    
    if (char) {
      if (char.personality) {
        const personality = CHARACTER_SYSTEM.PERSONALITIES.find(p => p.id === char.personality);
        text += `${personality.name} person, ${personality.description}\n\n`;
      } else {
        text += `Casual person\n\n`;
      }
      if (char.selectedSkill) {
        const skill = CHARACTER_SKILLS.find(s => s.id === char.selectedSkill);
        text += `Skill: ${skill.name},\n\n${skill.description}\n\n`;
      } else {
        text += '< No skill >';
      }
    } else {
      text = '< No character >';
    }

    this.updateDetails("", text, !!char);
  }

  updateDetails(title, description, showCharacterInfo = false) {
    this.itemNameText.write(title);
    this.itemDescriptionText.write(description);
    this.itemDescriptionText.wrap(70);
    this.itemNameText.bringToTop();
    this.itemDescriptionText.bringToTop();

    this.nameText.visible = showCharacterInfo;
    this.levelText.visible = showCharacterInfo;
    this.expBar.visible = showCharacterInfo;
    this.skillBar.visible = showCharacterInfo;

    this.itemNameText.y = showCharacterInfo ? 34 : 10;
    this.itemDescriptionText.y = showCharacterInfo ? 42 : 18;
  }

  selectCharacter(character) {
    this.selectedCharacter = character;
    this.updateDisplay();
  }

  updateDisplay() {
    if (this.characterDisplay) {
      this.characterDisplay.destroy();
    }
    this.characterDisplay = new CharacterDisplay(70, 24, this.selectedCharacter);

    if (this.characterCarousel) {
      this.characterCarousel.bringToTop();
    }

    this.writeCharacterInformation();
  }

  showCharacterList() {
    this.characterCarousel = new CarouselMenu(0, 8, 100, 130, {
      bgcolor: "#9b59b6",
      fgcolor: "#ffffff",
      align: "left",
      animate: true
    });

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

    this.characterCarousel.addItem("× No character", () => {
      this.selectedCharacter = null;
      this.characterManager.unsetCharacter();
      this.showHomeUI();
    }, {
      bgcolor: this.selectedCharacter ? "#9b59b6" : "#e74c3c"
    });

    if (!this.selectedCharacter) this.characterCarousel.selectIndex(index);

    this.characterCarousel.addItem("+ Add character", () => this.startCharacterCreation());

    this.characterCarousel.onSelect.add((index, item) => {
      this.selectCharacter(item.data.character || null);
    });

    this.characterCarousel.onCancel.add(() => {
      game.state.start("MainMenu");
    });
  }

  showActionMenu() {
    gamepad.releaseAll();
    this.clearAllMenus();
    this.updateDetails("", "", false);

    this.actionMenu = new CarouselMenu(75, 75, 72, 48, {
      bgcolor: "#34495e",
      fgcolor: "#ffffff",
      align: "center",
      activeAlpha: 1,
      inactiveAlpha: 0.5
    });

    this.actionMenu.addItem("Select", () => this.confirmSelection());
    if (this.selectedCharacter?.unlockedSkills?.length) {
      this.actionMenu.addItem("Set skill", () => this.setSkill());
    }
    this.actionMenu.addItem("Customize", () => this.customizeCharacter());
    this.actionMenu.addItem("Delete", () => this.deleteCharacter());

    this.actionMenu.onCancel.add(() => {
      gamepad.releaseAll();
      this.showHomeUI();
    });
  }

  confirmSelection() {
    this.characterManager.setCurrentCharacter(this.selectedCharacter.name);
    this.showCharacterList();
  }

  setSkill() {
    this.updateDetails("", "", false);

    this.skillsCarousel = new CarouselMenu(0, 8, 100, 130, {
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
          this.setSkill();
        }, {
          skillId: skillId,
          bgcolor: isCurrent ? "#e74c3c" : "#9b59b6"
        });
      }
    });

    this.skillsCarousel.selectIndex(selectedIndex);

    this.skillsCarousel.onSelect.add((index, item) => {
      this.updateSkillPreview(item.data.skillId);
    });

    this.skillsCarousel.onCancel.add(() => {
      this.skillsCarousel.destroy();
      this.skillsCarousel = null;
      this.showActionMenu();
    });

    if (this.selectedCharacter.unlockedSkills.length > 0) {
      this.updateSkillPreview(this.selectedCharacter.unlockedSkills[0]);
    }
  }

  updateSkillPreview(skillId) {
    const skill = CHARACTER_SKILLS.find(s => s.id === skillId);
    if (!skill) return;

    let previewText = "";
    previewText += `${skill.description}\n\n`;

    previewText += "Effect:\n";
    switch (skill.effect) {
      case 'convert_judgement':
        previewText += `• Converts ${skill.effectParams.from} to ${skill.effectParams.to}\n`;
        break;
      case 'modify_judgement_window':
        previewText += `• Judgement window ×${skill.effectParams.multiplier}\n`;
        break;
      case 'health_regen':
        previewText += `• +${skill.effectParams.amount} HP every ${skill.effectParams.interval / 1000}s\n`;
        break;
      case 'modify_max_health':
        previewText += `• +${skill.effectParams.amount} Max HP\n`;
        break;
      case 'modify_note_speed':
        previewText += `• Note speed ×${skill.effectParams.multiplier}\n`;
        break;
      case 'modify_hold_forgiveness':
        previewText += `• Hold forgiveness ×${skill.effectParams.multiplier}\n`;
        break;
      case 'modify_roll_forgiveness':
        previewText += `• Roll forgiveness ×${skill.effectParams.multiplier}\n`;
        break;
      case 'reduce_mine_damage':
        previewText += `• Reduces mine damage by ×${100 - 100 * skill.effectParams.multiplier}%\n`;
        break;
      case 'modify_score_gain':
        previewText += `• ${skill.effectParams.judgement} Score ×${skill.effectParams.multiplier}\n`;
        break;
      case 'modify_health_gain':
        previewText += `• Health gain ×${skill.effectParams.multiplier}\n`;
        break;
      case 'combo_shield':
        previewText += `• Enables Combo Shield\n`;
        break;
      case 'modify_input_lag':
        previewText += `• Modifies Input Lag\n`;
        break;
      case 'burst_health_regen':
        previewText += `• Gives ${skill.effectParams.amount}% Burst health regeneration\n`;
        break;
      case 'stabilize_judgement':
        previewText += `• Judgement Stabilization\n`;
        break;
      case 'general_boost':
        previewText += `• General Boost\n`;
        break;
    }

    previewText += "\nActivation:\n";
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
      case 'on_critical_health':
        previewText += `• When health drops below ${skill.effectParams.threshold}%\n`;
        break;
      case 'on_mine_hit':
        previewText += `• Before hitting a mine\n`;
        break;
      case 'custom':
        previewText += `• ${skill.activationText || 'Custom'}`;
        break;
    }

    if (skill.duration > 0) {
      previewText += `\nDuration: ${skill.duration / 1000}s\n`;
    }
    if (skill.cooldown > 0) {
      previewText += `Cooldown: ${skill.cooldown / 1000}s\n`;
    }

    this.updateDetails(skill.name, previewText, false);
  }

  customizeCharacter() {
    gamepad.releaseAll();
    this.clearAllMenus();
    this.updateDetails("", "", false);
    
    this.refreshCharacter({});

    this.updateEquipmentText('front_hair');

    this.customizationMenu = new CarouselMenu(0, 8, 100, 130, {
      bgcolor: "#2c3e50",
      fgcolor: "#ffffff",
      align: "left",
      animate: true
    });

    const slots = [
      { id: 'front_hair', label: 'Front hair' },
      { id: 'back_hair', label: 'Back hair' },
      { id: 'hair_color', label: 'Hair Color' },
      { id: 'skin', label: 'Skin tone' },
      { id: 'top', label: 'Top' },
      { id: 'bottom', label: 'Bottom' },
      { id: 'shoes', label: 'Shoes' },
      { id: 'accessory', label: 'Accessory' },
      { id: 'special', label: 'Special' }
    ];

    slots.forEach((slot) => {
      this.customizationMenu.addItem(slot.label, () => {
        this.showSlotItems(slot.id);
      }, {
        slot: slot,
        bgcolor: '#34495e'
      });
    });

    this.customizationMenu.onSelect.add((index, item) => {
      if (item.data && item.data.slot) {
        this.updateEquipmentText(item.data.slot.id);
      }
    });

    this.customizationMenu.onCancel.add(() => {
      gamepad.releaseAll();
      this.showActionMenu();
    });
  }

  updateEquipmentText(slotId) {
    const slots = {
      'front_hair': 'Front hair',
      'back_hair': 'Back hair',
      'hair_color': 'Hair Color' ,
      'skin': 'Skin tone',
      'top': 'Top',
      'bottom': 'Bottom',
      'shoes': 'Shoes',
      'accessory': 'Accessory',
      'special': 'Special'
    };
    
    // Special handling for hair color
    if (slotId == 'hair_color') {
      const currentColor = this.selectedCharacter.appearance.tints?.hair || 0xa8705a;
      this.updateDetails(slots['hair_color'], '\n\n\n' + this.colorToName(currentColor) + ' hair color.');
      return;
    }

    const currentItem = this.getCurrentSlotItem(slotId);
    
    let titleText = slots[slotId];
    let labelText = '';
    let desc = '';

    if (currentItem) {
      labelText = currentItem.name || 'None';
      desc = currentItem.description || currentItem.name || '';
    }

    if (!labelText || labelText === 'None') {
      if (slotId === 'accessory') labelText = 'No accessory';
      else if (slotId === 'special') labelText = 'No special clothing';
      else if (slotId === 'shoes') labelText = 'No shoes';
    }

    this.updateDetails(titleText, '\n\n\n' + (labelText || '< ??? >') + '\n\n' + (desc || ''));
  }
  
  colorToName(color, step = 32) {
    const r = (color >> 16) & 0xFF;
    const g = (color >> 8) & 0xFF;
    const b = color & 0xFF;
    
    const roundToStep = (val) => Math.round(val / step) * step;
    const rr = roundToStep(r);
    const gg = roundToStep(g);
    const bb = roundToStep(b);
    
    const colorNames = [
      // Neutrals
      { r: 0, g: 0, b: 0, name: "Black" },
      { r: 32, g: 32, b: 32, name: "Dark Gray" },
      { r: 96, g: 96, b: 96, name: "Gray" },
      { r: 160, g: 160, b: 160, name: "Light Gray" },
      { r: 224, g: 224, b: 224, name: "Silver" },
      { r: 255, g: 255, b: 255, name: "White" },
      
      // Reds
      { r: 255, g: 0, b: 0, name: "Red" },
      { r: 255, g: 32, b: 32, name: "Bright Red" },
      { r: 224, g: 0, b: 0, name: "Dark Red" },
      { r: 192, g: 0, b: 0, name: "Crimson" },
      { r: 160, g: 0, b: 0, name: "Blood Red" },
      { r: 255, g: 64, b: 64, name: "Coral Red" },
      { r: 255, g: 128, b: 128, name: "Light Red" },
      
      // Oranges
      { r: 255, g: 128, b: 0, name: "Orange" },
      { r: 255, g: 160, b: 0, name: "Light Orange" },
      { r: 224, g: 96, b: 0, name: "Dark Orange" },
      { r: 255, g: 64, b: 0, name: "Vermilion" },
      { r: 255, g: 192, b: 64, name: "Apricot" },
      { r: 255, g: 140, b: 0, name: "Tangerine" },
      { r: 255, g: 165, b: 0, name: "Carrot" },
      
      // Yellows
      { r: 255, g: 224, b: 0, name: "Yellow" },
      { r: 255, g: 255, b: 0, name: "Bright Yellow" },
      { r: 224, g: 192, b: 0, name: "Dark Yellow" },
      { r: 255, g: 215, b: 0, name: "Gold" },
      { r: 224, g: 184, b: 0, name: "Dark Gold" },
      { r: 255, g: 255, b: 128, name: "Pale Yellow" },
      { r: 255, g: 240, b: 128, name: "Cream" },
      { r: 255, g: 200, b: 0, name: "Amber" },
      
      // Greens
      { r: 0, g: 255, b: 0, name: "Green" },
      { r: 32, g: 224, b: 32, name: "Bright Green" },
      { r: 0, g: 160, b: 0, name: "Dark Green" },
      { r: 0, g: 128, b: 64, name: "Forest Green" },
      { r: 64, g: 224, b: 64, name: "Lime Green" },
      { r: 128, g: 255, b: 128, name: "Mint" },
      { r: 0, g: 200, b: 100, name: "Emerald" },
      { r: 0, g: 100, b: 50, name: "Deep Forest" },
      { r: 50, g: 205, b: 50, name: "Spring Green" },
      
      // Cyans
      { r: 0, g: 255, b: 255, name: "Cyan" },
      { r: 0, g: 224, b: 224, name: "Bright Cyan" },
      { r: 0, g: 160, b: 160, name: "Dark Cyan" },
      { r: 0, g: 206, b: 209, name: "Teal" },
      { r: 175, g: 238, b: 238, name: "Pale Turquoise" },
      { r: 64, g: 224, b: 208, name: "Turquoise" },
      { r: 128, g: 255, b: 224, name: "Aquamarine" },
      { r: 0, g: 180, b: 180, name: "Deep Teal" },
      
      // Blues
      { r: 0, g: 0, b: 255, name: "Blue" },
      { r: 32, g: 32, b: 255, name: "Bright Blue" },
      { r: 0, g: 0, b: 224, name: "Dark Blue" },
      { r: 0, g: 128, b: 255, name: "Azure" },
      { r: 65, g: 105, b: 225, name: "Royal Blue" },
      { r: 70, g: 130, b: 180, name: "Steel Blue" },
      { r: 128, g: 224, b: 255, name: "Sky Blue" },
      { r: 100, g: 149, b: 237, name: "Cornflower Blue" },
      { r: 0, g: 0, b: 128, name: "Navy" },
      { r: 25, g: 25, b: 112, name: "Midnight Blue" },
      { r: 0, g: 100, b: 200, name: "Ocean Blue" },
      
      // Purples
      { r: 160, g: 0, b: 255, name: "Violet" },
      { r: 224, g: 0, b: 255, name: "Purple" },
      { r: 123, g: 104, b: 238, name: "Medium Purple" },
      { r: 218, g: 112, b: 214, name: "Orchid" },
      { r: 224, g: 128, b: 255, name: "Lavender" },
      { r: 128, g: 0, b: 128, name: "Dark Purple" },
      { r: 75, g: 0, b: 130, name: "Indigo" },
      { r: 148, g: 0, b: 211, name: "Deep Violet" },
      { r: 230, g: 230, b: 250, name: "Lavender Mist" },
      
      // Pinks
      { r: 255, g: 0, b: 255, name: "Magenta" },
      { r: 255, g: 32, b: 224, name: "Bright Pink" },
      { r: 255, g: 96, b: 192, name: "Pink" },
      { r: 255, g: 160, b: 192, name: "Light Pink" },
      { r: 224, g: 64, b: 160, name: "Dark Pink" },
      { r: 255, g: 105, b: 180, name: "Hot Pink" },
      { r: 255, g: 20, b: 147, name: "Deep Pink" },
      { r: 255, g: 192, b: 203, name: "Pastel Pink" },
      { r: 255, g: 240, b: 245, name: "Lavender Blush" },
      
      // Browns
      { r: 192, g: 128, b: 64, name: "Brown" },
      { r: 160, g: 96, b: 32, name: "Dark Brown" },
      { r: 224, g: 160, b: 96, name: "Light Brown" },
      { r: 128, g: 64, b: 32, name: "Saddle Brown" },
      { r: 160, g: 82, b: 45, name: "Sienna" },
      { r: 210, g: 105, b: 30, name: "Chocolate" },
      { r: 205, g: 133, b: 63, name: "Peru" },
      { r: 139, g: 69, b: 19, name: "Burnt Sienna" },
      { r: 244, g: 164, b: 96, name: "Peach" },
      { r: 245, g: 222, b: 179, name: "Wheat" },
      { r: 255, g: 228, b: 196, name: "Bisque" },
      { r: 255, g: 248, b: 220, name: "Cornsilk" },
      { r: 255, g: 245, b: 238, name: "Seashell" },
      { r: 245, g: 245, b: 220, name: "Beige" },
      { r: 253, g: 245, b: 230, name: "Old Lace" },
      { r: 255, g: 250, b: 240, name: "Floral White" },
      { r: 240, g: 255, b: 240, name: "Honeydew" },
      { r: 240, g: 248, b: 255, name: "Alice Blue" },
      
      // Special Anime/Vibrant Colors
      { r: 68, g: 196, b: 252, name: "Miku Turquoise" },
      { r: 255, g: 56, b: 132, name: "Miku Pink" },
      { r: 255, g: 128, b: 0, name: "Naruto Orange" },
      { r: 255, g: 220, b: 0, name: "Pikachu Yellow" },
      { r: 255, g: 0, b: 0, name: "Sonic Red" },
      { r: 0, g: 200, b: 255, name: "Sonic Blue" },
      { r: 255, g: 200, b: 255, name: "Sakura Pink" },
      { r: 0, g: 150, b: 200, name: "Aoi Blue" },
      { r: 255, g: 100, b: 0, name: "Yuzu Orange" },
      { r: 200, g: 0, b: 200, name: "Lilac Purple" },
      { r: 0, g: 200, b: 100, name: "Midori Green" },
      { r: 255, g: 150, b: 255, name: "Pastel Pink" },
      { r: 200, g: 200, b: 255, name: "Periwinkle" },
      { r: 0, g: 255, b: 200, name: "Mint Green" },
      { r: 255, g: 200, b: 200, name: "Cherry Blossom" },
      { r: 100, g: 200, b: 255, name: "Natsu Blue" },
      { r: 255, g: 100, b: 100, name: "Akai Red" },
      { r: 255, g: 150, b: 100, name: "Kitsune Orange" },
      { r: 255, g: 255, b: 100, name: "Himawari Yellow" },
      { r: 100, g: 255, b: 100, name: "Kusa Green" },
      { r: 100, g: 100, b: 255, name: "Sora Blue" },
      { r: 255, g: 100, b: 200, name: "Momo Pink" },
      { r: 200, g: 100, b: 255, name: "Fuji Purple" },
      { r: 100, g: 255, b: 200, name: "Aoba Green" },
      { r: 255, g: 200, b: 100, name: "Kogane Yellow" },
      { r: 100, g: 100, b: 200, name: "Aoki Blue" },
      { r: 200, g: 255, b: 200, name: "Shiro Mint" },
      { r: 255, g: 200, b: 150, name: "Momiji Orange" },
      { r: 150, g: 200, b: 255, name: "Suzu Blue" },
      { r: 255, g: 150, b: 200, name: "Sakura Pink" },
      { r: 200, g: 150, b: 255, name: "Sumire Violet" },
      { r: 150, g: 255, b: 200, name: "Hajime Green" },
      { r: 200, g: 255, b: 150, name: "Yuzu Green" },
      { r: 255, g: 150, b: 150, name: "Beni Red" },
      { r: 150, g: 150, b: 255, name: "Ruri Blue" },
      { r: 255, g: 255, b: 150, name: "Kira Yellow" },
      { r: 150, g: 255, b: 255, name: "Aoi Cyan" },
      { r: 255, g: 255, b: 200, name: "Shiro Yellow" },
      { r: 200, g: 200, b: 200, name: "Gin Silver" },
      { r: 100, g: 100, b: 100, name: "Kuro Gray" },
    ];
    
    // Find exact match with step-aligned values
    for (const cn of colorNames) {
      if (cn.r === rr && cn.g === gg && cn.b === bb) {
        return cn.name;
      }
    }
    
    // If no exact match, find closest by Euclidean distance
    let closest = colorNames[0];
    let minDist = Infinity;
    
    for (const cn of colorNames) {
      const dr = cn.r - rr;
      const dg = cn.g - gg;
      const db = cn.b - bb;
      const dist = dr * dr + dg * dg + db * db;
      if (dist < minDist) {
        minDist = dist;
        closest = cn;
      }
    }
    
    // If distance is too far, use a descriptive fallback
    const threshold = step * step * 3;
    if (minDist > threshold) {
      const brightness = Math.round((r * 0.299 + g * 0.587 + b * 0.114) / step) * step;
      const hueNames = ["Red", "Orange", "Yellow", "Green", "Cyan", "Blue", "Purple", "Pink"];
      const hue = Math.atan2(g - 128, r - 128) * 180 / Math.PI + 180;
      const hueIndex = Math.floor(hue / 45) % 8;
      const baseName = hueNames[hueIndex] || "Color";
      
      if (brightness < 32) return "Dark " + baseName;
      if (brightness > 224) return "Light " + baseName;
      return baseName;
    }
    
    return closest.name;
  }

  getCurrentSlotItem(slotId) {
    const appearance = this.selectedCharacter?.appearance;
    if (!appearance) return null;

    if (slotId === 'front_hair') {
      const id = appearance.frontHair || 1;
      const styles = CHARACTER_SYSTEM.HAIR_STYLES.front;
      const style = styles[id - 1];
      return { name: style?.name || `Front ${id}`, id: id, description: style?.description || 'Front hair style.' };
    }

    if (slotId === 'back_hair') {
      const id = appearance.backHair || 1;
      const styles = CHARACTER_SYSTEM.HAIR_STYLES.back;
      const style = styles[id - 1];
      return { name: style?.name || `Back ${id}`, id: id, description: style?.description || 'Back hair style.' };
    }

    if (slotId === 'skin') {
      const idx = appearance.skinTone || 0;
      const skin = CHARACTER_SYSTEM.SKIN_TONES[idx];
      return { name: skin?.name || 'Default', id: idx, description: skin?.description || 'Skin tone.' };
    }

    const itemId = appearance.clothing?.[slotId];
    if (!itemId) return null;

    const item = CHARACTER_ITEMS.find(i => i.id === itemId && i.type === slotId);
    if (item) {
      return { name: item.name, id: item.id, description: item.description || item.name };
    }

    return { name: 'None', id: null, description: '' };
  }
  
  showSlotItems(slotId) {
    gamepad.releaseAll();
    this.clearAllMenus();
  
    let items = [];
    const isDev = VERSION.includes('dev');
    const unlockAll = window.UNLOCK_ALL_CLOTHES === true && isDev;
  
    if (slotId === 'hair_color') {
      this.customizeHairColor();
      return;
    }
  
    if (slotId === 'front_hair' || slotId === 'back_hair') {
      const type = slotId === 'front_hair' ? 'front' : 'back';
      let unlocked;
      if (unlockAll) {
        const total = CHARACTER_SYSTEM.HAIR_STYLES[type].length;
        unlocked = Array.from({ length: total }, (_, i) => i + 1);
      } else {
        unlocked = Account.characters.unlockedHairs[type] || [1];
      }
      const styles = CHARACTER_SYSTEM.HAIR_STYLES[type];
  
      let index = 0;
  
      items = unlocked.map(id => {
        const s = styles[id - 1];
        return {
          id: id,
          name: s?.name || `Style ${id}`,
          type: slotId,
          isHair: true,
          hairType: type,
          dyable: false,
          description: s?.description || (s?.name ? `${s.name} hair style` : `Hair style ${id}`)
        };
      });
    } else if (slotId === 'skin') {
      const skinOptions = CHARACTER_SYSTEM.SKIN_TONES;
      items = skinOptions.map((skin, index) => ({
        id: index,
        name: skin.name || `Skin ${index + 1}`,
        type: slotId,
        isSkin: true,
        dyable: false,
        description: skin.description || (skin.name ? `${skin.name} skin tone` : `Skin tone ${index + 1}`)
      }));
    } else {
      const allItems = CHARACTER_ITEMS.filter(item => item.type === slotId);
      const unlockedIds = Account.characters.unlockedItems || [];
  
      items = allItems.filter(item => {
        if (unlockAll) return true;
        return unlockedIds.includes(item.id);
      });
  
      const slotTypesWithNone = ['accessory', 'shoes', 'special'];
      if (slotTypesWithNone.includes(slotId)) {
        items.unshift({
          id: null,
          name: 'None',
          type: slotId,
          isNone: true,
          dyable: false,
          description: 'No item equipped.'
        });
      }
    }
  
    // Get current item ID from character
    let currentItemId = null;
    const appearance = this.selectedCharacter?.appearance;
    
    if (slotId === 'front_hair' || slotId === 'back_hair') {
      const slotKey = slotId == 'front_hair' ? 'frontHair' : 'backHair';
      currentItemId = appearance?.[slotKey] || 1;
    } else if (slotId === 'skin') {
      currentItemId = appearance?.skinTone || 0;
    } else {
      currentItemId = appearance?.clothing?.[slotId] || null;
    }
  
    // Create the menu
    this.itemListMenu = new CarouselMenu(0, 8, 100, 130, {
      bgcolor: "#8e44ad",
      fgcolor: "#ffffff",
      align: "left",
      animate: true
    });
  
    let selectedIndex = 0;
  
    // Add all items to the menu and track which one is current
    items.forEach((item, index) => {
      let isCurrent = false;
      
      if (item.isHair) {
        isCurrent = item.id === currentItemId;
      } else if (item.isSkin) {
        isCurrent = item.id === currentItemId;
      } else {
        isCurrent = item.id === currentItemId;
      }
      
      if (isCurrent) {
        selectedIndex = index;
      }
  
      this.itemListMenu.addItem(
        isCurrent ? `> ${item.name}` : `  ${item.name}`,
        null,
        {
          item: item,
          slotId: slotId,
          bgcolor: isCurrent ? "#e74c3c" : "#8e44ad"
        }
      );
    });
  
    // Select the current item
    this.itemListMenu.selectIndex(selectedIndex);
  
    this.itemListMenu.onSelect.add((index, item) => {
      if (item.data && item.data.item) {
        this.previewSlotItem(slotId, item.data.item);
        const desc = item.data.item.description || '';
        this.updateDetails(item.data.item.name, '\n\n\n' + desc, false);
      }
    });
    
    this.itemListMenu.onSelect.dispatch(selectedIndex, this.itemListMenu.items[selectedIndex]);
    
    this.itemListMenu.onConfirm.add(() => {
      const selectedItem = items[this.itemListMenu.selectedIndex];
      if (!selectedItem) return;
    
      this.equipSlotItem(slotId, selectedItem);
    
      const menuToDestroy = this.itemListMenu;
      this.itemListMenu = null;
      menuToDestroy.destroy();
    
      const fullItem = CHARACTER_ITEMS.find(i => i.id === selectedItem.id && i.type === slotId);
      
      // Check if item has multiple layers
      if (fullItem && fullItem.layers && fullItem.layers.length > 1) {
        this.showLayerColorMenu(slotId, fullItem);
        return;
      }
      
      // Check if item is an aura with dyable particles
      if (fullItem && fullItem.isAura && fullItem.dyable !== false) {
        this.customizeAuraColor(slotId, fullItem);
        return;
      }
    
      if (slotId === 'front_hair' || slotId === 'back_hair') {
        this.customizeCharacter();
        return;
      }
    
      if (selectedItem.dyable !== false && !selectedItem.isNone && !selectedItem.isSkin) {
        this.customizeItemColor(slotId, fullItem);
        return;
      }
    
      this.updateDetails("", "", false);
      this.customizeCharacter();
    });
  
    this.itemListMenu.onCancel.add(() => {
      gamepad.releaseAll();
      this.updateDetails("", "", false);
      this.customizeCharacter();
    });
  }

  previewSlotItem(slotId, item) {
    if (!this.selectedCharacter) return;

    const appearance = this.selectedCharacter.appearance;
    const newAppearance = {};

    if (item.isHair) {
      const type = item.hairType || 'front';
      const key = type === 'front' ? 'frontHair' : 'backHair';
      newAppearance[key] = item.id;
    } else if (item.isSkin) {
      newAppearance.skinTone = item.id;
    } else {
      if (!appearance.clothing) {
        appearance.clothing = {};
      }
      newAppearance.clothing = {
        ...appearance.clothing,
        [slotId]: item.id
      };
    }

    this.refreshCharacter(newAppearance);
  }
  
  refreshCharacter(appearance = {}, hardReset = false) {
    const tempChar = {
      ...this.selectedCharacter,
      appearance: {
        ...this.selectedCharacter.appearance,
        ...appearance
      }
    };
    if (hardReset) {
      if (this.characterDisplay) {
        this.characterDisplay.destroy();
      }
      this.characterDisplay = new CharacterDisplay(70, 24, tempChar);
    } else {
      if (!this.characterDisplay) {
        this.characterDisplay = new CharacterDisplay(70, 24, tempChar);
      } else {
        this.characterDisplay.updateAppearance(tempChar.appearance);
      }
    }
  }

  equipSlotItem(slotId, item) {
    if (!this.selectedCharacter) return;

    const appearance = this.selectedCharacter.appearance;

    if (item.isHair) {
      const type = item.hairType || 'front';
      const key = type === 'front' ? 'frontHair' : 'backHair';
      appearance[key] = item.id;
      this.characterManager.saveToAccount();
      this.updateDisplay();
      return;
    }

    if (item.isSkin) {
      appearance.skinTone = item.id;
      this.characterManager.saveToAccount();
      this.updateDisplay();
      return;
    }

    if (!appearance.clothing) {
      appearance.clothing = {};
    }

    appearance.clothing[slotId] = item.id;
    this.characterManager.saveToAccount();
    this.updateDisplay();
  }

  showLayerColorMenu(slotId, item) {
    if (!item || !item.layers || item.layers.length < 2) return;

    gamepad.releaseAll();
    this.clearAllMenus();
    this.updateDetails("", "", false);

    this.layerColorMenu = new CarouselMenu(0, 8, 100, 130, {
      bgcolor: "#8e44ad",
      fgcolor: "#ffffff",
      align: "left",
      animate: true
    });

    const appearance = this.selectedCharacter?.appearance;
    const tints = appearance?.tints || {};

    let selectedIndex = 0;

    item.layers.forEach((layer, index) => {
      const layerName = layer.name || `Layer ${index + 1}`;
      const tintKey = slotId + '_layer' + index;
      const currentTint = tints[tintKey] || layer.tint || 0xffffff;
      const colorHex = '#' + currentTint.toString(16).padStart(6, '0');

      this.layerColorMenu.addItem(
        `${layerName}: ${colorHex}`,
        null,
        {
          layerIndex: index,
          layerName: layerName,
          slotId: slotId,
          item: item,
          bgcolor: '#8e44ad'
        }
      );
    });

    this.layerColorMenu.selectIndex(selectedIndex);

    this.layerColorMenu.onConfirm.add(() => {
      const selectedItem = this.layerColorMenu.items[this.layerColorMenu.selectedIndex];
      if (!selectedItem || !selectedItem.data) return;

      const layerIndex = selectedItem.data.layerIndex;
      const slot = selectedItem.data.slotId;
      const layer = selectedItem.data.item.layers[layerIndex];
      const tintKey = slot + '_layer' + layerIndex;
      const currentTint = tints[tintKey] || layer.tint || 0xffffff;

      this.customizeLayerColor(slot, selectedItem.data.item, layerIndex, currentTint);
    });

    this.layerColorMenu.onCancel.add(() => {
      gamepad.releaseAll();
      this.updateDetails("", "", false);
      this.customizeCharacter();
    });
  }

  customizeLayerColor(slotId, item, layerIndex, defaultColor) {
    const layerName = item.layers[layerIndex].name || `Layer ${layerIndex + 1}`;
    const colorKey = slotId + '_layer' + layerIndex;
    
    this.showColorInput(
      `${layerName} color`,
      defaultColor,
      (color) => {
        // Live preview
        this.applyLayerColorToCharacter(colorKey, color);
      },
      (color) => {
        // Confirm
        this.applyLayerColorToCharacter(colorKey, color);
        this.characterManager.saveToAccount();
        this.updateDetails("", "", false);
        this.showLayerColorMenu(slotId, item);
      },
      () => {
        // Cancel
        this.updateDisplay();
        this.updateDetails("", "", false);
        this.showLayerColorMenu(slotId, item);
      }
    );
  }

  applyLayerColorToCharacter(colorKey, color) {
    if (!this.selectedCharacter) return;
    const appearance = this.selectedCharacter.appearance;
    if (!appearance.tints) appearance.tints = {};
    appearance.tints[colorKey] = color;
    
    if (this.characterDisplay) {
      this.characterDisplay.destroy();
      this.characterDisplay = new CharacterDisplay(70, 24, this.selectedCharacter);
    }
  }

  customizeItemColor(slotId, item) {
    const currentColor = this.selectedCharacter?.appearance?.tints?.[slotId] || item?.tint || 0xffffff;
    
    this.showColorInput(
      `${item?.name || 'Item'} color`,
      currentColor,
      (color) => {
        // Live preview
        this.applyItemColorToCharacter(slotId, color);
      },
      (color) => {
        // Confirm
        this.applyItemColorToCharacter(slotId, color);
        this.characterManager.saveToAccount();
        this.updateDetails("", "", false);
        this.customizeCharacter();
      },
      () => {
        // Cancel
        this.updateDisplay();
        this.updateDetails("", "", false);
        this.customizeCharacter();
      }
    );
  }

  applyItemColorToCharacter(slotId, color) {
    if (!this.selectedCharacter) return;
    const appearance = this.selectedCharacter.appearance;
    if (!appearance.tints) appearance.tints = {};
    appearance.tints[slotId] = color;
    
    if (this.characterDisplay) {
      this.characterDisplay.destroy();
      this.characterDisplay = new CharacterDisplay(70, 24, this.selectedCharacter);
    }
  }
  
  customizeAuraColor(slotId, item) {
    const currentColor = this.selectedCharacter?.appearance?.tints?.special || item?.tint || 0xffffff;
    
    this.showColorInput(
      `${item?.name || 'Aura'} color`,
      currentColor,
      (color) => {
        // Live preview
        if (!this.selectedCharacter) return;
        const appearance = this.selectedCharacter.appearance;
        if (!appearance.tints) appearance.tints = {};
        appearance.tints.special = color;
        
        if (this.characterDisplay) {
          this.characterDisplay.destroy();
          this.characterDisplay = new CharacterDisplay(70, 24, this.selectedCharacter);
        }
      },
      (color) => {
        // Confirm
        if (!this.selectedCharacter) return;
        const appearance = this.selectedCharacter.appearance;
        if (!appearance.tints) appearance.tints = {};
        appearance.tints.special = color;
        this.characterManager.saveToAccount();
        this.updateDetails("", "", false);
        this.customizeCharacter();
      },
      () => {
        // Cancel
        this.updateDisplay();
        this.updateDetails("", "", false);
        this.customizeCharacter();
      }
    );
  }

  customizeHairColor() {
    const currentColor = this.selectedCharacter.appearance.tints?.hair || 0xa8705a;
    
    this.updateEquipmentText('hair_color');
    
    this.showColorInput(
      'Hair color',
      currentColor,
      (color) => {
        // Update live preview
        if (!this.selectedCharacter.appearance.tints) {
          this.selectedCharacter.appearance.tints = {};
        }
        this.selectedCharacter.appearance.tints.hair = color;
        if (this.characterDisplay) {
          this.characterDisplay.destroy();
          this.characterDisplay = new CharacterDisplay(70, 24, this.selectedCharacter);
        }
        this.updateEquipmentText('hair_color');
      },
      (color) => {
        // Confirm
        if (!this.selectedCharacter.appearance.tints) {
          this.selectedCharacter.appearance.tints = {};
        }
        this.selectedCharacter.appearance.tints.hair = color;
        this.characterManager.saveToAccount();
        this.updateDetails("", "", false);
        this.customizeCharacter();
      },
      () => {
        // Cancel - revert
        this.updateDisplay();
        this.updateDetails("", "", false);
        this.customizeCharacter();
      }
    );
  }

  showColorInput(title, defaultColor, onColorChange, onConfirm, onCancel) {
    let color = defaultColor || 0xffffff;
    let r = (color >> 16) & 0xff;
    let g = (color >> 8) & 0xff;
    let b = color & 0xff;
    
    this.navigationHint.updateHints('color_input');
  
    const background = createGradientBackground(115, 100, 92, 30);
    background.anchor.set(0.5);
  
    const titleText = new Text(120, 100, title, FONTS.shaded);
    titleText.anchor.set(0.5);
  
    const rgbText = new Text(120, 110, `R:${r} G:${g} B:${b}`, FONTS.default);
    rgbText.anchor.set(0.5);
  
    const updateColor = () => {
      const newColor = (r << 16) | (g << 8) | b;
      if (onColorChange) onColorChange(newColor);
      background.bringToTop();
      titleText.bringToTop();
      rgbText.bringToTop();
      rgbText.write(`R:${r} G:${g} B:${b}`);
    };
  
    const handler = (key) => {
      switch (key) {
        case 'left':
          r = Math.max(0, r - 32);
          break;
        case 'right':
          r = Math.min(255, r + 32);
          break;
        case 'up':
          g = Math.min(255, g + 32);
          break;
        case 'down':
          g = Math.max(0, g - 32);
          break;
        case 'a':
          b = Math.min(255, b + 32);
          break;
        case 'b':
          b = Math.max(0, b - 32);
          break;
        case 'start':
          titleText.destroy();
          rgbText.destroy();
          background.destroy();
          gamepad.signals.pressed.any.remove(handler);
          this.navigationHint.updateHints('general');
          const finalColor = (r << 16) | (g << 8) | b;
          if (onConfirm) onConfirm(finalColor);
          return;
        case 'select':
          titleText.destroy();
          rgbText.destroy();
          background.destroy();
          gamepad.signals.pressed.any.remove(handler);
          this.navigationHint.updateHints('general');
          if (onCancel) onCancel();
          return;
      }
      updateColor();
    };
  
    this.colorHandler = handler;
    gamepad.signals.pressed.any.add(handler);
  
    this.colorUI = { background, titleText, rgbText };
  }
  
  cleanupColorUI() {
    if (this.colorUI) {
      if (this.colorUI.background) this.colorUI.background.destroy();
      if (this.colorUI.titleText) this.colorUI.titleText.destroy();
      if (this.colorUI.rgbText) this.colorUI.rgbText.destroy();
      this.colorUI = null;
    }
    this.colorSlot = null;
    this.navigationHint.updateHints('general');
  }

  deleteCharacter() {
    this.confirm(
      'Delete character?',
      () => {
        this.characterManager.deleteCharacter(this.selectedCharacter.name);

        if (this.characterManager.getCharacterList().length <= 1) {
          this.selectedCharacter = null;
          this.characterManager.unsetCharacter();
        } else {
          this.selectedCharacter = this.characterManager.getCharacterList()[0];
        }
        this.showHomeUI();
      },
      () => {
        this.showActionMenu();
      },
      'no'
    );
  }

  confirm(message, onConfirm, onCancel, recommended = 'none') {
    this.clearAllMenus();

    const dialog = new DialogWindow(message, {
      buttons: ['Yes', 'No'],
      defaultButton: recommended == 'no' ? 1 : 0
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
  }

  startCharacterCreation() {
    this.creationStep = 0;
    this.newCharacterAppearance = {
      skinTone: 0,
      hairColor: 0xFFFFFF,
      frontHair: '1',
      backHair: '1',
      clothing: {
        top: 'top_seifuku_default',      // Default top
        bottom: 'bottom_skirt_blue',     // Default bottom
        shoes: 'shoes_common',           // Default shoes
        accessory: null,
        special: null
      },
      tints: {
        hair: 0xa8705a,
        top: null,
        bottom: null,
        shoes: null,
        accessory: null,
        special: null
      }
    };

    this.clearAllMenus();
    this.updateDetails("", "", false);

    this.tempCharacterDisplay = new CharacterDisplay(70, 24, {
      name: 'New character',
      appearance: this.newCharacterAppearance
    });

    this.creationWindowManager = new WindowManager();
    this.showCreationStep();
  }

  showCreationStep() {
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

    gamepad.signals.pressed.any.removeAll();

    const steps = [
      { title: 'Choose skin tone', action: (callback) => this.creationCustomizeSkinTone(callback) },
      { title: 'Choose hair color', action: (callback) => this.creationCustomizeHairColor(callback) },
      { title: 'Choose front hair', action: (callback) => this.creationCustomizeHairStyle('frontHair', callback) },
      { title: 'Choose back hair', action: (callback) => this.creationCustomizeHairStyle('backHair', callback) },
      { title: 'Choose top', action: (callback) => this.creationCustomizeSlot('top', callback) },
      { title: 'Choose bottom', action: (callback) => this.creationCustomizeSlot('bottom', callback) },
      { title: 'Choose shoes', action: (callback) => this.creationCustomizeSlot('shoes', callback) },
      { title: 'Choose accessory', action: (callback) => this.creationCustomizeSlot('accessory', callback) },
      { title: 'Choose special', action: (callback) => this.creationCustomizeSlot('special', callback) },
      { title: 'Name your character', action: (callback) => this.creationNameCharacter(callback) }
    ];

    if (this.creationStep < steps.length) {
      const step = steps[this.creationStep];

      this.creationWindow = this.creationWindowManager.createWindow(15, 10, 10, 5, '1');
      this.creationWindow.x -= (this.creationWindow.size.width / 2) * 8;
      this.creationWindow.offset = { x: 20, y: 8 };
      this.creationWindow.forceHighlight(22);
      this.creationWindow.disableScrollBar = true;

      this.creationText = new Text(120, 92, step.title, FONTS.default);
      this.creationText.anchor.set(0.5);

      step.action(() => {
        this.showCreationNavigationMenu();
      });
    }
  }

  showCreationNavigationMenu() {
    gamepad.releaseAll();
    this.creationWindow.forcedHighlightY = null;

    this.creationWindow.addItem('Next', '', () => {
      this.creationStep++;
      this.showCreationStep();
    });

    if (this.creationStep > 0) {
      this.creationWindow.addItem('Previous', '', () => {
        this.creationStep--;
        this.showCreationStep();
      }, true);
    }

    this.creationWindow.addItem('Cancel', '', () => {
      this.cancelCharacterCreation();
    }, this.creationStep <= 0);

    this.creationWindowManager.focus(this.creationWindow);
  }

  creationCustomizeSkinTone(callback) {
    const skinOptions = ['Lighter', 'Light', 'Medium', 'Tan', 'Another'];
    let currentIndex = this.newCharacterAppearance.skinTone;

    const skinText = new Text(120, 107, skinOptions[currentIndex], FONTS.default);
    skinText.anchor.set(0.5);

    const skinHandler = (key) => {
      if (key === 'left') {
        currentIndex = (currentIndex - 1 + skinOptions.length) % skinOptions.length;
      } else if (key === 'right') {
        currentIndex = (currentIndex + 1) % skinOptions.length;
      } else if (key === 'a') {
        skinText.destroy();
        gamepad.signals.pressed.any.remove(skinHandler);
        callback();
        return;
      } else if (key === 'b') {
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
      this.newCharacterAppearance.tints.hair = newColor;
      // Update temp display with tints
      this.tempCharacterDisplay.updateAppearance({ 
        hairColor: newColor,
        tints: { hair: newColor }
      });
      return `R:${r} G:${g} B:${b}`;
    };
  
    const rgbText = new Text(120, 107, updateColor(), FONTS.default);
    rgbText.anchor.set(0.5);
  
    const colorHandler = (key) => {
      switch (key) {
        case 'left':
          r = Math.max(0, r - 32);
          break;
        case 'right':
          r = Math.min(255, r + 32);
          break;
        case 'up':
          g = Math.min(255, g + 32);
          break;
        case 'down':
          g = Math.max(0, g - 32);
          break;
        case 'a':
          b = Math.min(255, b + 32);
          break;
        case 'b':
          b = Math.max(0, b - 32);
          break;
        case 'start':
          rgbText.destroy();
          gamepad.signals.pressed.any.remove(colorHandler);
          callback();
          this.navigationHint.updateHints('general');
          return;
        case 'select':
          rgbText.destroy();
          gamepad.signals.pressed.any.remove(colorHandler);
          this.navigationHint.updateHints('general');
          this.showCreationNavigationMenu();
          return;
      }
      rgbText.write(updateColor());
    };
  
    this.navigationHint.updateHints('color_input');
    gamepad.signals.pressed.any.add(colorHandler);
  }

  creationCustomizeHairStyle(type, callback) {
    const isDev = VERSION.includes('dev');
    const unlockAll = window.UNLOCK_ALL_CLOTHES === true && isDev;
    let unlocked;
    if (unlockAll) {
      const total = CHARACTER_SYSTEM.HAIR_STYLES[type === 'frontHair' ? 'front' : 'back'].length;
      unlocked = Array.from({ length: total }, (_, i) => i + 1);
    } else {
      unlocked = Account.characters.unlockedHairs[type === 'frontHair' ? 'front' : 'back'] || [1];
    }
    const styles = CHARACTER_SYSTEM.HAIR_STYLES[type === 'frontHair' ? 'front' : 'back'];
    // Get the name from the style object
    const options = unlocked.map(id => {
      const style = styles[id - 1];
      return style?.name || `Style ${id}`;
    });
    const values = unlocked;
  
    let currentIndex = this.newCharacterAppearance[type] - 1;
    if (currentIndex < 0 || currentIndex >= options.length) currentIndex = 0;
  
    const hairText = new Text(120, 107, options[currentIndex] || 'Style', FONTS.default);
    hairText.anchor.set(0.5);
  
    const updateHair = () => {
      this.newCharacterAppearance[type] = values[currentIndex];
      this.tempCharacterDisplay.updateAppearance({ [type]: values[currentIndex] });
      hairText.write(options[currentIndex] || 'Style');
    };
  
    const hairHandler = (key) => {
      if (key === 'left') {
        currentIndex = (currentIndex - 1 + options.length) % options.length;
      } else if (key === 'right') {
        currentIndex = (currentIndex + 1) % options.length;
      } else if (key === 'a') {
        hairText.destroy();
        gamepad.signals.pressed.any.remove(hairHandler);
        callback();
        return;
      } else if (key === 'b') {
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

  creationCustomizeSlot(slotId, callback) {
    const items = CHARACTER_ITEMS.filter(item => item.type === slotId);
    const slotTypesWithNone = ['shoes', 'accessory', 'special'];
  
    let options = [];
    if (slotTypesWithNone.includes(slotId)) {
      options.push({ id: null, name: 'None' });
    }
  
    const unlockedIds = Account.characters.unlockedItems || [];
    const isDev = VERSION.includes('dev');
    const unlockAll = window.UNLOCK_ALL_CLOTHES === true && isDev;
  
    for (const item of items) {
      if (unlockAll || unlockedIds.includes(item.id)) {
        options.push(item);
      }
    }
  
    let currentIndex = 0;
    const currentItemId = this.newCharacterAppearance.clothing?.[slotId];
    if (currentItemId) {
      const found = options.findIndex(opt => opt.id === currentItemId);
      if (found !== -1) currentIndex = found;
    }
  
    const optionNames = options.map(opt => opt.name || 'None');
    const optionValues = options.map(opt => opt.id);
  
    const itemText = new Text(120, 107, optionNames[currentIndex] || 'None', FONTS.default);
    itemText.anchor.set(0.5);
  
    const itemHandler = (key) => {
      if (key === 'left') {
        currentIndex = (currentIndex - 1 + optionNames.length) % optionNames.length;
      } else if (key === 'right') {
        currentIndex = (currentIndex + 1) % optionNames.length;
      } else if (key === 'a') {
        const selectedId = optionValues[currentIndex];
        if (!this.newCharacterAppearance.clothing) {
          this.newCharacterAppearance.clothing = {};
        }
        this.newCharacterAppearance.clothing[slotId] = selectedId;
        this.tempCharacterDisplay.updateAppearance({
          clothing: { ...this.newCharacterAppearance.clothing }
        });
  
        itemText.destroy();
        gamepad.signals.pressed.any.remove(itemHandler);
        callback();
        return;
      } else if (key === 'b') {
        itemText.destroy();
        gamepad.signals.pressed.any.remove(itemHandler);
        this.showCreationNavigationMenu();
        return;
      }
  
      const previewId = optionValues[currentIndex];
      const previewClothing = { ...this.newCharacterAppearance.clothing };
      previewClothing[slotId] = previewId;
      this.tempCharacterDisplay.updateAppearance({
        clothing: previewClothing
      });
      itemText.write(optionNames[currentIndex] || 'None');
    };
  
    gamepad.signals.pressed.any.add(itemHandler);
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
    if (this.creationWindow) {
      this.creationWindow.visible = false;
    }

    const nameText = new Text(120, 20, 'Name your character', FONTS.shaded);
    nameText.anchor.set(0.5);

    this.navigationHint.visible = false;
    gamepad.releaseAll();

    const keyboard = new OnScreenKeyboard();

    window.focusedElement = new TextInput({
      text: this.generateName(),
      maxLength: CHARACTER_SYSTEM.MAX_NAME_LENGTH,
      useNewline: false,
      onConfirm: (name) => {
        const newChar = this.characterManager.createCharacter(name, this.newCharacterAppearance);
        if (newChar) {
          this.selectedCharacter = newChar;
          nameText.destroy();
          keyboard.destroy();
          this.navigationHint.updateHints('general');

          if (this.tempCharacterDisplay) {
            this.tempCharacterDisplay.destroy();
            this.tempCharacterDisplay = null;
          }

          this.showHomeUI();
        } else {
          notifications.show('Character name already exists');
          this.navigationHint.updateHints('general');
          this.creationNameCharacter(callback);
        }
      },
      onCancel: () => {
        nameText.destroy();
        keyboard.destroy();
        this.navigationHint.updateHints('general');
        this.cancelCharacterCreation();
      }
    });
  }

  generateName() {
    const syllables = CHARACTER_SYSTEM.NAME_SYLLABLES;
    const firstSyllabe = game.rnd.pick(syllables);
    const secondSyllabe = game.rnd.pick(syllables);
    return firstSyllabe + secondSyllabe;
  }

  cancelCharacterCreation() {
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

    this.showHomeUI();
  }

  cleanupColorUI() {
    if (this.colorUI) {
      if (this.colorUI.background) this.colorUI.background.destroy();
      if (this.colorUI.colorText) this.colorUI.colorText.destroy();
      if (this.colorUI.rgbText) this.colorUI.rgbText.destroy();
      if (this.colorUI.preview) this.colorUI.preview.destroy();
      this.colorUI = null;
    }
    this.colorSlot = null;
    this.navigationHint.updateHints('general');
  }

  update() {
    gamepad.update();

    if (notifications.notificationWindow) {
      notifications.notificationWindow.bringToTop();
    }

    if (this.creationWindowManager) {
      this.creationWindowManager.update();
    }
  }

  shutdown() {
    this.characterManager.saveToAccount();
  }
}