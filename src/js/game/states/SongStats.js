class SongStats {
  init(song, returnState, returnParams = {}) {
    this.song = song;
    this.returnState = returnState;
    this.returnParams = returnParams;
    this.currentTab = 0;
    this.currentDifficultyIndex = 0;
    this.tabContent = null;
    this.chartRenderer = null;
    this.previewAudio = null;
    this.previewPlaying = false;
    this.previewBeat = 0;
    this.previewStartTime = 0;
    this.isDestroyed = false;
    this.scrollDirection = Account.settings.scrollDirection || 'falling';
    
    this.tabs = [
      { id: 'general', label: 'General', create: this.createGeneralTab.bind(this) },
      { id: 'difficulties', label: 'Difficulties', create: this.createDifficultiesTab.bind(this) },
      { id: 'scores', label: 'Scores', create: this.createScoresTab.bind(this) },
      { id: 'preview', label: 'Preview', create: this.createPreviewTab.bind(this) }
    ];
    
    this.visibilityChangeListener = () => {
      if (this.previewAudio) {
        if (document.hidden) {
          this.previewAudio.volume = 0;
        } else {
          this.previewAudio.volume = Account.settings.volume / 100;
        }
      }
    };
    
    window.addEventListener('visibilitychange', this.visibilityChangeListener);
    
  }

  create() {
    game.camera.fadeIn(0x000000);
    
    this.backgroundGradient = new BackgroundGradient();
    this.futuristicLines = new FuturisticLines();
    
    this.navigationHint = new NavigationHint([
      { position: "left", icon: "d-pad", text: "NAVIGATE" },
      { position: "right", icon: "select", text: "DIFFICULTY" },
      { position: "right", icon: "b", text: "BACK" }
    ]);
    
    this.windowManager = new WindowManager();
    
    this.headerGroup = game.add.group();
    this.leftArrow = new Text(92, 6, "<", FONTS.default);
    this.leftArrow.anchor.set(0.5);
    this.leftArrow.tint = 0x76fcde;
    this.headerGroup.add(this.leftArrow);
    
    this.tabTitle = new Text(120, 6, "", FONTS.default);
    this.tabTitle.anchor.set(0.5);
    this.tabTitle.tint = 0x76fcde;
    this.headerGroup.add(this.tabTitle);
    
    this.rightArrow = new Text(148, 6, ">", FONTS.default);
    this.rightArrow.anchor.set(0.5);
    this.rightArrow.tint = 0x76fcde;
    this.headerGroup.add(this.rightArrow);
    
    this.diffText = new Text(120, 16, "", FONTS.tiny_default);
    this.diffText.anchor.set(0.5);
    this.diffText.tint = 0x888888;
    this.headerGroup.add(this.diffText);
    
    this.startArrowIdle();
    this.updateDiffText();
    this.showTab(0);
  }

  updateDiffText() {
    const diff = this.getCurrentDifficulty();
    if (diff) {
      this.diffText.write(`${diff.type} ${diff.rating}`);
    } else {
      this.diffText.write("No difficulty");
    }
    // Show only in difficulties and preview tabs
    this.diffText.visible = (this.currentTab === 1 || this.currentTab === 2 || this.currentTab === 3);
  }

  startArrowIdle() {
    this.leftArrowTween = game.add.tween(this.leftArrow)
      .to({ x: 89 }, 300, Phaser.Easing.Quadratic.InOut, true, 0, -1)
      .yoyo(true);
    this.rightArrowTween = game.add.tween(this.rightArrow)
      .to({ x: 151 }, 300, Phaser.Easing.Quadratic.InOut, true, 0, -1)
      .yoyo(true);
  }

  stopArrowIdle() {
    if (this.leftArrowTween) {
      this.leftArrowTween.stop();
      this.leftArrowTween = null;
    }
    if (this.rightArrowTween) {
      this.rightArrowTween.stop();
      this.rightArrowTween = null;
    }
  }

  animateArrowPress(direction) {
    this.stopArrowIdle();
    const arrow = direction === -1 ? this.leftArrow : this.rightArrow;
    const targetX = arrow.x + (direction * 3);
    const originalX = direction === -1 ? 92 : 148;
    
    game.add.tween(arrow)
      .to({ x: targetX }, 100, Phaser.Easing.Quadratic.Out, true)
      .onComplete.add(() => {
        game.add.tween(arrow)
          .to({ x: originalX }, 100, Phaser.Easing.Quadratic.In, true)
          .onComplete.add(() => this.startArrowIdle());
      });
  }

  showTab(index) {
    if (this.isDestroyed) return;
    this.currentTab = index;
    this.clearTab();
    this.tabTitle.write(this.tabs[index].label);
    this.tabs[index].create();
    this.updateDiffText();
  }

  clearTab() {
    if (this.tabContent) {
      this.tabContent.destroy();
      this.tabContent = null;
    }
    if (this.chartRenderer && this.currentTab !== 3) {
      this.chartRenderer.destroy();
      this.chartRenderer = null;
    }
    if (this.previewAudio) {
      this.previewAudio.pause();
      this.previewAudio = null;
    }
    this.previewPlaying = false;
  }

  getDifficulties() {
    return this.song.chart.difficulties || [];
  }

  getCurrentDifficulty() {
    const diffs = this.getDifficulties();
    if (diffs.length === 0) return null;
    if (this.currentDifficultyIndex >= diffs.length) {
      this.currentDifficultyIndex = 0;
    }
    return diffs[this.currentDifficultyIndex];
  }

  getCurrentNotes() {
    const diff = this.getCurrentDifficulty();
    if (!diff) return [];
    const key = diff.type + diff.rating;
    return this.song.chart.notes[key] || [];
  }

  rotateDifficulty() {
    const diffs = this.getDifficulties();
    if (diffs.length === 0) return;
    this.currentDifficultyIndex = (this.currentDifficultyIndex + 1) % diffs.length;
    this.updateDiffText();
    
    if (this.currentTab === 1) {
      this.showTab(1);
    }
    if (this.currentTab === 3) {
      this.clearTab();
      this.createPreviewTab();
    }
  }

  getScrollDirection(beat) {
    return this.scrollDirection === 'falling' ? -1 : 1;
  }

  getCurrentTime() {
    const chartOffset = this.song.chart.offset || 0;
    const currentTime = ((game.time.now - this.previewStartTime + (chartOffset * 1000)) / 1000) + this.chartRenderer.beatToSec(this.previewBeat);
    const currentBeat = this.chartRenderer.secToBeat(currentTime);
    return {
      now: currentTime,
      beat: currentBeat
    };
  }

  getSongKey() {
    const chart = this.song.chart;
    // Use folderName if available (local or external songs)
    if (chart.folderName) {
      return `local_${chart.folderName}`;
    }
    // Fallback to audio URL hash
    if (chart.audioUrl) {
      let hash = 0;
      for (let i = 0; i < chart.audioUrl.length; i++) {
        const char = chart.audioUrl.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return `external_${hash.toString(36)}`;
    }
    return `unknown_${Date.now()}`;
  }

  createGeneralTab() {
    this.tabContent = game.add.group();
    const banner = new CanvasBackground(4, 24);
    this.tabContent.addChild(banner);
    
    const chart = this.song.chart;
    if (chart.bannerUrl && chart.bannerUrl !== "no-media") {
      const img = new Image();
      img.onload = () => {
        if (this.isDestroyed) return;
        banner.ctx.drawImage(img, 0, 0, 96, 32);
        banner.dirty();
      };
      img.src = chart.bannerUrl;
    }
    
    const totalDiffs = (chart.difficulties || []).length;
    let totalNotes = 0;
    for (const diff of chart.difficulties || []) {
      const notes = chart.notes[diff.type + diff.rating] || [];
      totalNotes += notes.length;
    }
    
    const info = new Text(104, 24, 
      `Title: ${chart.title || 'Unknown'}\n` +
      `Artist: ${chart.artist || 'Unknown'}\n` +
      `Genre: ${chart.genre || 'Unknown'}\n` +
      `Credit: ${chart.credit || 'Unknown'}\n` +
      `Difficulties: ${totalDiffs}\n` +
      `Total Notes: ${totalNotes}\n` +
      `Sample Start: ${chart.sampleStart || 0}s\n` +
      `Offset: ${chart.offset || 0}`,
      FONTS.default
    );
    info.wrap(136 - 8);
    this.tabContent.addChild(info);
  }

  createDifficultiesTab() {
    this.tabContent = game.add.group();
    const diffs = this.getDifficulties();
    if (diffs.length === 0) {
      const text = new Text(4, 24, "No difficulties available", FONTS.default);
      this.tabContent.addChild(text);
      return;
    }
    
    // Preview carousel - all same color, no > indicator
    const diffCarousel = new CarouselMenu(0, 24, 80, 86, {
      bgcolor: '#2c3e50',
      fgcolor: '#ffffff',
      align: 'left',
      animate: true,
      margin: { left: 4, right: 4 },
      disableConfirm: true,
      disableCancel: true
    });
    this.tabContent.addChild(diffCarousel);
    
    diffs.forEach((diff, index) => {
      const noteCount = this.song.chart.notes[diff.type + diff.rating]?.length || 0;
      diffCarousel.addItem(
        ` ${diff.type} ${diff.rating}`,
        null,
        { bgcolor: '#34495e', diffIndex: index }
      );
    });
    diffCarousel.selectIndex(this.currentDifficultyIndex);
    
    this._rightContainer = game.add.group();
    this.tabContent.addChild(this._rightContainer);
    
    this._densityChart = new LineChart(84, 24, 152, 56, [0]);
    this._densityChart.config.lineColor = 0x76fcde;
    this._densityChart.config.fillUnderLine = true;
    this._densityChart.config.fillColor = 0x76fcde;
    this._densityChart.config.fillAlpha = 0.2;
    this._densityChart.drawChart();
    this._rightContainer.addChild(this._densityChart);
    
    this._statsText = new Text(84, 82, "", FONTS.default);
    this._statsText.tint = 0xffffff;
    this._rightContainer.addChild(this._statsText);
    
    diffCarousel.onSelect.add((index, item) => {
      if (item.data && item.data.diffIndex !== undefined) {
        this.currentDifficultyIndex = item.data.diffIndex;
        this.updateDiffText();
        this.updateDifficultyStats();
      }
    });
    
    this.updateDifficultyStats();
  }

  updateDifficultyStats() {
    const diff = this.getCurrentDifficulty();
    if (!diff) return;
    
    const notes = this.getCurrentNotes();
    
    let totalNotes = 0, mines = 0, holds = 0, rolls = 0;
    let jumps = 0, hands = 0;
    const beats = new Map();
    
    for (const note of notes) {
      if (note.type === 'M') mines++;
      else if (note.type === '2') holds++;
      else if (note.type === '4') rolls++;
      else if (note.type === '1') totalNotes++;
      
      if (note.type === '1' || note.type === '2' || note.type === '4') {
        const key = note.beat.toFixed(6);
        if (!beats.has(key)) beats.set(key, []);
        beats.get(key).push(note);
      }
    }
    
    for (const beatNotes of beats.values()) {
      if (beatNotes.length >= 3) hands++;
      else if (beatNotes.length === 2) jumps++;
    }
    
    const total = totalNotes + mines + holds + rolls;
    
    this._statsText.write(
      `\n       Notes: ${String(totalNotes).padEnd(5)}  Mines: ${String(mines).padEnd(5)}\n` +
      `       Holds: ${String(holds).padEnd(5)}  Rolls: ${String(rolls).padEnd(5)}\n` +
      `       Jumps: ${String(jumps).padEnd(5)}  Hands: ${String(hands).padEnd(5)}\n` +
      `            Total: ${String(total).padEnd(5)}`
    );
    
    if (notes.length > 0) {
      const maxBeat = Math.max(...notes.map(n => n.beat));
      const data = [];
      const step = 4;
      for (let i = 0; i <= maxBeat + step; i += step) {
        data.push(notes.filter(n => n.beat >= i && n.beat < i + step).length);
      }
      this._densityChart.setData(data);
    } else {
      this._densityChart.setData([0]);
    }
  }

  createScoresTab() {
    this.tabContent = game.add.group();
    const songKey = this.getSongKey();
    const scores = Account.highScores[songKey] || {};
    const diffs = this.getDifficulties();
    if (diffs.length === 0) {
      const text = new Text(4, 24, "No difficulties available", FONTS.default);
      this.tabContent.addChild(text);
      return;
    }
    
    const sorted = [...diffs].sort((a, b) => a.rating - b.rating);
    
    const diffCarousel = new CarouselMenu(0, 24, 100, 86, {
      bgcolor: '#2c3e50',
      fgcolor: '#ffffff',
      align: 'left',
      animate: true,
      margin: { left: 4, right: 4 }
    });
    this.tabContent.addChild(diffCarousel);
    
    sorted.forEach((diff, index) => {
      const key = diff.type + diff.rating;
      const data = scores[key];
      const label = data ? `${diff.type} ${diff.rating} ✓` : `${diff.type} ${diff.rating}`;
      diffCarousel.addItem(label, null, {
        bgcolor: data ? '#27ae60' : '#34495e',
        diffIndex: index,
        diff: diff,
        score: data
      });
    });
    diffCarousel.selectIndex(0);
    
    diffCarousel.onSelect.add((index, item) => {
      if (item.data && item.data.score) {
        const data = item.data.score;
        const date = new Date(data.date);
        this._scoreDetails.write(
          `Score: ${data.score.toLocaleString()}\n` +
          `Accuracy: ${data.accuracy.toFixed(2)}%\n` +
          `Rating: ${data.rating}\n` +
          `Max Combo: ${data.maxCombo}\n` +
          `Date: ${date.toLocaleDateString()}`
        );
      } else if (item.data && item.data.diff) {
        this._scoreDetails.write(`\n\n< No score recorded >`);
      }
    });
    
    this._scoreDetails = new Text(104, 24, "Select a difficulty", FONTS.default);
    this._scoreDetails.tint = 0xffffff;
    this.tabContent.addChild(this._scoreDetails);
    
    const firstItem = diffCarousel.items[0];
    if (firstItem && firstItem.data) {
      diffCarousel.onSelect.dispatch(0, firstItem);
    }
  }

  createPreviewTab() {
    this.tabContent = game.add.group();
    const diff = this.getCurrentDifficulty();
    if (!diff) {
      const text = new Text(4, 24, "No difficulty selected", FONTS.default);
      this.tabContent.addChild(text);
      return;
    }
    
    this.chartRenderer = new ChartRenderer(this, this.song, this.currentDifficultyIndex, {
      enableGameplayLogic: false,
      enableJudgement: false,
      enableInput: false,
      enableHealth: false,
      enableMissChecking: false,
      enableReceptors: true,
      enableBeatLines: true,
      enableSpeedRendering: true,
      enableBGRendering: true,
      judgeLineYFalling: 80,
      judgeLineYRising: 60,
      enableChartBackground: true,
      chartBackgroundOpacity: 0.2,
      scrollDirection: this.scrollDirection
    });
    this.chartRenderer.notes.forEach(n => n.hitEffectShown = false);
    this.chartRenderer.receptors.forEach(r => r.visible = true);
    this.chartRenderer.backgroundGraphics.visible = false;
    
    this.tabContent.addChild(this.chartRenderer.receptorsGroup);
    this.tabContent.addChild(this.chartRenderer.notesGroup);
    this.tabContent.addChild(this.chartRenderer.freezeBodyGroup);
    this.tabContent.addChild(this.chartRenderer.freezeEndGroup);
    this.tabContent.addChild(this.chartRenderer.linesGroup);
    this.tabContent.addChild(this.chartRenderer.minesGroup);
    this.tabContent.addChild(this.chartRenderer.tagsGroup);
    this.tabContent.addChild(this.chartRenderer.speedModGraphics);
    this.tabContent.addChild(this.chartRenderer.bgChangeGraphics);
    this.tabContent.addChild(this.chartRenderer.backgroundGraphics);
    
    this.previewBeat = 0;
    this.previewPlaying = false;
    this.previewStartTime = game.time.now;
    
    if (!this.previewAudio) {
      this.previewAudio = document.createElement('audio');
      this.previewAudio.src = this.song.chart.audioUrl;
    }
    
    this.previewAudio.currentTime = 0;
    this.previewAudio.play();
  }

  updatePreview() {
    if (this.isDestroyed || !this.chartRenderer || this.currentTab !== 3) return;
    
    const chartOffset = this.song.chart.offset || 0;
    const currentTime = ((game.time.now - this.previewStartTime + (chartOffset * 1000)) / 1000) + this.chartRenderer.beatToSec(this.previewBeat);
    const beat = this.chartRenderer.secToBeat(currentTime);
    
    if (this.previewPlaying) {
      this.previewBeat = beat;
    }
    
    const now = this.chartRenderer.beatToSec(beat);
    this.chartRenderer.render(now, beat);
    if (this.chartRenderer.notes) {
      this.chartRenderer.notes.forEach(note => {
        if (!note.hitEffectShown && note.sec - now <= 0 && note.sec - now > -0.5) {
          this.playExplosionEffect(note.column);
          note.hitEffectShown = true;
        }
      });
    }
  }

  playExplosionEffect(column) {
    if (!this.chartRenderer) return;
    const receptor = this.chartRenderer.receptors[column];
    if (receptor && receptor.explosion) {
      receptor.explosion.visible = true;
      receptor.explosion.alpha = 1;
      game.add.tween(receptor.explosion).to({ alpha: 0 }, 200, "Linear", true)
        .onComplete.add(() => receptor.explosion.visible = false);
    }
  }

  update() {
    if (this.isDestroyed) return;
    gamepad.update();
    this.windowManager.update();
    
    if (gamepad.pressed.left) {
      this.animateArrowPress(-1);
      this.showTab((this.currentTab - 1 + this.tabs.length) % this.tabs.length);
    }
    if (gamepad.pressed.right) {
      this.animateArrowPress(1);
      this.showTab((this.currentTab + 1) % this.tabs.length);
    }
    
    if (this.currentTab === 3) {
      this.updatePreview();
      
      if (gamepad.pressed.select) {
        this.rotateDifficulty();
      }
    }
    
    if (this.currentTab !== 3) {
      if (this.previewAudio && !this.previewAudio.paused) this.previewAudio.pause();
    }
    
    if (gamepad.pressed.b) {
      this.cleanup();
      const params = Array.isArray(this.returnParams) ? this.returnParams : [this.returnParams];
      game.state.start(this.returnState, true, false, ...params);
    }
  }

  cleanup() {
    this.isDestroyed = true;
    this.stopArrowIdle();
    window.removeEventListener("visibilitychange", this.visibilityChangeListener);
    if (this.previewAudio) {
      this.previewAudio.pause();
      this.previewAudio = null;
    }
    if (this.chartRenderer) {
      this.chartRenderer.destroy();
      this.chartRenderer = null;
    }
    if (this.tabContent) {
      this.tabContent.destroy();
      this.tabContent = null;
    }
    if (this.headerGroup) {
      this.headerGroup.destroy();
      this.headerGroup = null;
    }
  }

  shutdown() {
    this.cleanup();
  }
}