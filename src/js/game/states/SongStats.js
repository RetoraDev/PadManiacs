/**
 * @class SongStats
 * @category Game States
 * @summary Per-song statistics, difficulties, scores and preview browser
 * @constructor
 * @features
 * Tabbed interface covering general info, difficulty breakdowns, high scores and previews
 * Note density chart plus counts of notes, mines, holds, rolls, jumps and hands
 * Interactive chart preview with a scrubbed playhead and explosion hit effects
 * @description
 * The Song Stats state inspects a single chart in detail. It exposes tabs for general
 * metadata, per-difficulty statistics with a density chart, saved high scores, and
 * an interactive chart preview that renders notes against the song's audio.
 * @example
 * // Open the stats window for a song and return to the caller afterwards
 * game.state.start("SongStats", true, false, song, "SongSelect", [songs, index]);
 */
class SongStats {
  /**
   * Phaser state hook that stores the song and builds the tab definitions.
   * @param {Object} song - The song whose stats are inspected, including playlist key
   * @param {string} returnState - Name of the state to return to
   * @param {Array} [returnParams] - Parameters to pass when returning
   */
  init(song, returnState, returnParams = {}) {
    /** @type {Object} The song being inspected */
    this.song = song;
    this.playlistKey = this.song.playlistKey || null;
    /** @type {string} Name of the state to return to */
    this.returnState = returnState;
    this.returnParams = returnParams;
    /** @type {number} Index of the currently active tab */
    this.currentTab = 0;
    this.currentDifficultyIndex = 0;
    this.tabContent = null;
    this.chartRenderer = null;
    this.previewAudio = null;
    this.previewPlaying = false;
    this.previewBeat = 0;
    this.previewStartTime = 0;
    this.isDestroyed = false;
    /** @type {string} Scroll direction used by the chart preview */
    this.scrollDirection = Account.settings.scrollDirection || 'falling';
    
    /** @type {Object[]} The tab definitions with their builder callbacks */
    this.tabs = [
      { id: 'general', label: __("General||General"), create: this.createGeneralTab.bind(this) },
      { id: 'difficulties', label: __("Difficulties||Dificultades"), create: this.createDifficultiesTab.bind(this) },
      { id: 'scores', label: __("Scores||Puntuaciones"), create: this.createScoresTab.bind(this) },
      { id: 'preview', label: __("Preview||Vista Previa"), create: this.createPreviewTab.bind(this) }
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

  /**
   * Phaser state hook that sets up the header, background and first tab.
   */
  create() {
    game.camera.fadeIn(0x000000);
    
    this.background = new CanvasBackground();
    this.background.alpha = 0.3;
    
    this.backgroundGradient = new BackgroundGradient(0, 0.3);
    this.futuristicLines = new FuturisticLines();
    
    const chart = this.song.chart;
    if (chart.backgroundUrl && chart.backgroundUrl !== "no-media") {
      const img = new Image();
      img.onload = () => {
        if (this.isDestroyed) return;
        this.background.ctx.drawImage(img, 0, 0, 240, 140);
        this.background.dirty();
      };
      img.src = chart.backgroundUrl;
    }
    
    this.navigationHint = new NavigationHint("song_stats");
    
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

  /**
   * Refreshes the difficulty label shown in the header.
   */
  updateDiffText() {
    const diff = this.getCurrentDifficulty();
    if (diff) {
      this.diffText.write(`${diff.type} ${diff.rating}`);
    } else {
      this.diffText.write(__("No difficulty||Sin dificultad"));
    }
    // Show only in difficulties and preview tabs
    this.diffText.visible = (this.currentTab === 1 || this.currentTab === 3);
  }

  /**
   * Starts the looping idle animation on the tab navigation arrows.
   */
  startArrowIdle() {
    if (this.leftArrowTween) {
      this.leftArrowTween.start();
    } else {
      this.leftArrowTween = game.add.tween(this.leftArrow)
        .to({ x: 89 }, 300, Phaser.Easing.Quadratic.InOut, true, 0, -1)
        .yoyo(true);
    }
    
    if (this.rightArrowTween) {
      this.rightArrowTween.start();
    } else {
      this.rightArrowTween = game.add.tween(this.rightArrow)
        .to({ x: 151 }, 300, Phaser.Easing.Quadratic.InOut, true, 0, -1)
        .yoyo(true);
    }
  }

  /**
   * Stops the idle arrow animations and clears their tweens.
   */
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

  /**
   * Plays a quick press animation on the navigation arrow for a direction.
   * @param {number} direction - -1 for the left arrow, 1 for the right arrow
   */
  animateArrowPress(direction) {
    const arrow = direction === -1 ? this.leftArrow : this.rightArrow;
    const targetX = arrow.x + (direction * 3);
    const originalX = direction === -1 ? 92 : 148;
    
    game.add.tween(arrow)
      .to({ x: targetX }, 100, Phaser.Easing.Quadratic.Out, true)
      .yoyo(true);
  }

  /**
   * Activates the tab at the given index and builds its content.
   * @param {number} index - Index of the tab to show
   */
  showTab(index) {
    if (this.isDestroyed) return;
    this.currentTab = index;
    this.clearTab();
    this.tabTitle.write(this.tabs[index].label);
    this.tabs[index].create();
    this.updateDiffText();
    this.navigationHint.updateHints(index === 3 ? "song_stats_song_preview" : "song_stats");
  }

  /**
   * Destroys the current tab's content and stops its preview audio.
   */
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

  /**
   * Returns the chart's difficulty list.
   * @returns {Object[]} The difficulties defined for the song
   */
  getDifficulties() {
    return this.song.chart.difficulties || [];
  }

  /**
   * Returns the currently selected difficulty, clamped to the list.
   * @returns {Object|null} The current difficulty or null when none exist
   */
  getCurrentDifficulty() {
    const diffs = this.getDifficulties();
    if (diffs.length === 0) return null;
    if (this.currentDifficultyIndex >= diffs.length) {
      this.currentDifficultyIndex = 0;
    }
    return diffs[this.currentDifficultyIndex];
  }

  /**
   * Returns the note list for the current difficulty.
   * @returns {Object[]} The notes of the current difficulty, or an empty array
   */
  getCurrentNotes() {
    const diff = this.getCurrentDifficulty();
    if (!diff) return [];
    const key = diff.type + diff.rating;
    return this.song.chart.notes[key] || [];
  }

  /**
   * Moves to the next difficulty and refreshes dependent tabs.
   */
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

  /**
   * Returns the scroll direction multiplier used by the chart preview.
   * @param {number} beat - The beat being scrolled (unused placeholder)
   * @returns {number} -1 for falling scroll, 1 for rising scroll
   */
  getScrollDirection(beat) {
    return this.scrollDirection === 'falling' ? -1 : 1;
  }

  /**
   * Computes the current preview time and beat accounting for the chart offset.
   * @returns {Object} Object with numeric "now" and "beat" fields
   */
  getCurrentTime() {
    const chartOffset = this.song.chart.offset || 0;
    const currentTime = ((game.time.now - this.previewStartTime + (chartOffset * 1000)) / 1000) + this.chartRenderer.beatToSec(this.previewBeat);
    const currentBeat = this.chartRenderer.secToBeat(currentTime);
    return {
      now: currentTime,
      beat: currentBeat
    };
  }

  /**
   * Builds the general info tab with song metadata and play/editor actions.
   */
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
      __(`(Title|Título): ${chart.title || 'Unknown'}\n`) +
      __(`(Artist|Artista): ${chart.artist || 'Unknown'}\n`) +
      __(`(Genre|Género): ${chart.genre || 'Unknown'}\n`) +
      __(`(Credit|Crédito): ${chart.credit || 'Unknown'}\n`) +
      __(`(Difficulties|Dificultades): ${totalDiffs}\n`) +
      __(`(Total Notes|Total de Notas): ${totalNotes}\n`) +
      __(`(Sample Start|Inicio de Muestra): ${chart.sampleStart || 0}s\n`) +
      __(`(Offset|Offset): ${chart.offset || 0}`),
      FONTS.default
    );
    info.wrap(136 - 8);
    this.tabContent.addChild(info);
    
    let carousel;
    
    const resetCarousel = (disableCancel = false) => {
      if (carousel) carousel.destroy();
      
      carousel = new CarouselMenu(0, 24 + 32, 80, 86, {
        bgcolor: '#2c3e50',
        fgcolor: '#ffffff',
        align: 'left',
        animate: true,
        margin: { left: 4, right: 4 },
        disableCancel: disableCancel
      });
      
      this.tabContent.addChild(carousel);
      
      this.returnBlocked = !disableCancel;
    };
    
    const mainMenu = () => {
      resetCarousel(true);
      carousel.addItem(__("Play Song||Jugar Canción"), () => modeSelect());
      carousel.addItem(__("Open in Editor||Abrir en Editor"), () => {
        game.state.start("Editor", true, false, this.song);
      });
    };
    
    const modeSelect = () => {
      resetCarousel();
      carousel.addItem(__("Normal||Normal"), () => diffSelect(false));
      carousel.addItem(__("Autoplay||Autoplay"), () => diffSelect(true));
      carousel.addItem(__("< Back||< Volver"), () => mainMenu());
      carousel.onCancel.add(() => mainMenu());
    };
    
    const diffSelect = (autoplay) => {
      resetCarousel();
      this.song.chart.difficulties.sort((a, b) => a.rating - b.rating).forEach((diff, index) => {
        carousel.addItem(
          `${diff.type} (${diff.rating})`,
          (item) => {
            game.state.start("Play", true, false, this.song, index, undefined, autoplay, undefined, this.playlistKey);
          },
          {
            difficulty: diff,
            index: index,
            bgcolor: window.getDifficultyColor(parseInt(diff.rating))
          }
        );
      });
    };
    
    mainMenu();
  }

  /**
   * Builds the difficulties tab with a note density chart and stats.
   */
  createDifficultiesTab() {
    this.tabContent = game.add.group();
    const diffs = this.getDifficulties();
    if (diffs.length === 0) {
      const text = new Text(4, 24, __("No difficulties available||No hay dificultades disponibles"), FONTS.default);
      this.tabContent.addChild(text);
      return;
    }
    
    // Preview carousel
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

  /**
   * Refreshes the note statistics text and density chart for the current difficulty.
   */
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
    
    this._statsText.write(__(
      `\n       (Notes|Notas): ${String(totalNotes).padEnd(5)}  (Mines|Minas): ${String(mines).padEnd(5)}\n` +
      `       (Holds|Holds): ${String(holds).padEnd(5)}  (Rolls|Rolls): ${String(rolls).padEnd(5)}\n` +
      `       (Jumps|Saltos): ${String(jumps).padEnd(5)}  (Hands|Manos): ${String(hands).padEnd(5)}\n` +
      `             (Total|Total): ${String(total).padEnd(5)}`
    ));
    
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

  /**
   * Builds the high scores tab listing saved scores for each difficulty.
   */
  createScoresTab() {
    this.tabContent = game.add.group();
    const songKey = window.getSongKey(this.song);
    const scores = Account.highScores[songKey] || {};
    const diffs = this.getDifficulties();
    if (diffs.length === 0) {
      const text = new Text(4, 24, __("No difficulties available||No hay dificultades disponibles"), FONTS.default);
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
          __(`(Date|Fecha): ${date.toLocaleDateString()}\n\n`) +
          __(`(Score|Puntaje): ${data.score.toLocaleString()}\n`) +
          __(`(Accuracy|Precisión): ${data.accuracy.toFixed(2)}%\n`) +
          __(`(Max Combo|Combo Máx): ${data.maxCombo}\n\n`) +
          __(`(Rating|Calificación): ${data.rating}\n`) +
          __("(Judgements|Juicios):\n") +
          __(` • Marvelous: ${data.judgements.marvelous}\n`) +
          __(` • Perfect: ${data.judgements.perfect}\n`) +
          __(` • Great: ${data.judgements.great}\n`) +
          __(` • Good: ${data.judgements.good}\n`) +
          __(` • Boo: ${data.judgements.boo}\n`) +
          __(` • Miss: ${data.judgements.miss}`)
        );
      } else {
        this._scoreDetails.write('\n< ' + __("(NO|SIN) HIGHSCORES") + ' >');
      }
    });
    
    this._scoreDetails = new Text(104, 24, __("Select a difficulty||Selecciona una dificultad"), FONTS.default);
    this._scoreDetails.tint = 0xffffff;
    this.tabContent.addChild(this._scoreDetails);
    
    const firstItem = diffCarousel.items[0];
    if (firstItem && firstItem.data) {
      diffCarousel.onSelect.dispatch(0, firstItem);
    }
  }

  /**
   * Builds the interactive chart preview tab for the current difficulty.
   */
  createPreviewTab() {
    this.tabContent = game.add.group();
    const diff = this.getCurrentDifficulty();
    if (!diff) {
      const text = new Text(4, 24, __("No difficulty selected||Ninguna dificultad seleccionada"), FONTS.default);
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
      judgeLineYFalling: 90,
      judgeLineYRising: 50,
      enableChartBackground: true,
      chartBackgroundOpacity: 0.3,
      parent: this.tabContent
    });
    this.chartRenderer.notes.forEach(n => n.hitEffectShown = false);
    this.chartRenderer.receptors.forEach(r => r.visible = true);
    
    this.navigationHint.bringToTop();
    
    this.previewBeat = 0;
    this.previewPlaying = false;
    this.previewStartTime = null;
    
    if (!this.previewAudio) {
      const dots = new LoadingDots();
      dots.x -= 4;
      dots.y -= 8;
      this.navigationBlocked = true;
      this.previewAudio = document.createElement('audio');
      this.previewAudio.src = this.song.chart.audioUrl;
      this.previewAudio.oncanplaythrough = () => {
        this.previewStartTime = game.time.now;
        this.previewAudio.oncanplaythrough = null;
        this.navigationBlocked = false;
        dots.destroy();
      };
      this.previewAudio.onerror = () => {
        this.previewStartTime = game.time.now;
        this.previewAudio.onerror = null;
        this.navigationBlocked = false;
        dots.destroy();
      };
    } else {
      this.previewStartTime = game.time.now;
    }
    
    this.previewAudio.currentTime = 0;
    this.previewAudio.play();
  }

  /**
   * Advances the chart preview render and triggers explosion hit effects.
   */
  updatePreview() {
    if (this.isDestroyed || !this.chartRenderer || this.currentTab !== 3 || !this.previewStartTime) return;
    
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

  /**
   * Plays a brief explosion effect on the receptor of the given column.
   * @param {number} column - The note column to flash
   */
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

  /**
   * Phaser lifecycle hook called every frame; handles tab navigation input.
   */
  update() {
    if (this.isDestroyed) return;
    
    gamepad.update();
    
    if (this.navigationBlocked) return;
    
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
    
    if (!this.returnBlocked && gamepad.pressed.b) {
      this.cleanup();
      const params = Array.isArray(this.returnParams) ? this.returnParams : [this.returnParams];
      game.state.start(this.returnState, true, false, ...params);
    }
  }

  /**
   * Releases the preview audio, renderer and event listeners used by this state.
   */
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

  /**
   * Phaser lifecycle hook called when leaving the state; performs cleanup.
   */
  shutdown() {
    this.cleanup();
  }
}