class RhythmLevelEditor {
  constructor() {
    this.game = null;
    this.gamepad = null;
    this.currentSong = null;
    this.selectedNote = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.lastNoteTime = 0;
    this.gridSize = 4;
    this.editMode = 'add';
    this.noteType = 'tap';
    this.autoPosition = false;
    this.timelineScale = 100; // pixels per second

    this.noteColors = {
      tap: 0xe74c3c,
      long: 0x3498db,
      a: 0xe74c3c,
      b: 0x2ecc71,
      up: 0xf39c12,
      down: 0x9b59b6,
      left: 0x1abc9c,
      right: 0x34495e
    };

    this.inputMap = {
      a: ['a'],
      b: ['b'],
      up: ['up'],
      down: ['down'],
      left: ['left'],
      right: ['right'],
      tap: ['a', 'b'], // Default for tap notes
      long: ['a', 'b']  // Default for long notes
    };

    this.init();
  }

  init() {
    // Initialize default song
    this.currentSong = {
      id: 'default-song',
      title: 'New Song',
      artist: 'Unknown Artist',
      author: 'Editor User',
      difficulty: 'Normal',
      icon: 'select_icon.png',
      background: 'gameplay_background.png',
      video: '',
      timing: {
        bpm: 120,
        offset: 0
      },
      notes: []
    };

    // Set up UI event listeners
    this.setupUI();

    // Initialize Phaser game
    this.initGame();
  }

  setupUI() {
    // Toolbar toggle
    document.getElementById('toggle-toolbar').addEventListener('click', () => {
      document.getElementById('toolbar').classList.toggle('collapsed');
    });

    // Edit mode
    document.getElementById('edit-mode').addEventListener('change', (e) => {
      this.editMode = e.target.value;
      this.updateEditMode();
    });

    // Note type
    document.getElementById('note-type').addEventListener('change', (e) => {
      this.noteType = e.target.value;
    });

    // Grid size
    document.getElementById('grid-size').addEventListener('change', (e) => {
      this.gridSize = parseInt(e.target.value);
      this.drawGrid();
    });

    // Auto position
    document.getElementById('auto-position').addEventListener('change', (e) => {
      this.autoPosition = e.target.checked;
    });

    // Play/Pause
    document.getElementById('play-pause').addEventListener('click', () => {
      this.togglePlayback();
    });

    // Stop
    document.getElementById('stop').addEventListener('click', () => {
      this.stopPlayback();
    });

    // Save
    document.getElementById('save').addEventListener('click', () => {
      this.saveSong();
    });

    // Load
    document.getElementById('load').addEventListener('click', () => {
      this.showLoadModal();
    });

    // Export
    document.getElementById('export').addEventListener('click', () => {
      this.showExportModal();
    });

    // Modal events
    document.getElementById('close-load').addEventListener('click', () => {
      document.getElementById('load-modal').style.display = 'none';
    });

    document.getElementById('close-export').addEventListener('click', () => {
      document.getElementById('export-modal').style.display = 'none';
    });

    document.getElementById('copy-json').addEventListener('click', () => {
      this.copyJSON();
    });

    document.getElementById('download-json').addEventListener('click', () => {
      this.downloadJSON();
    });

    // File input
    document.getElementById('file-input').addEventListener('change', (e) => {
      this.loadSongFile(e.target.files[0]);
    });

    // Timeline interaction
    this.setupTimelineEvents();
  }

  setupTimelineEvents() {
    const timeline = document.getElementById('timeline');

    // Touch events for timeline scrubbing
    timeline.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleTimelineTouch(e);
    }, { passive: false });

    timeline.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.handleTimelineTouch(e);
    }, { passive: false });

    // Mouse events for desktop
    timeline.addEventListener('mousedown', (e) => {
      this.handleTimelineClick(e);
    });

    timeline.addEventListener('mousemove', (e) => {
      if (e.buttons === 1) { // Left mouse button held
        this.handleTimelineClick(e);
      }
    });
  }

  handleTimelineTouch(e) {
    const touch = e.touches[0];
    const rect = document.getElementById('timeline').getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const time = x / this.timelineScale;

    this.seekToTime(time);

    if (this.editMode === 'add') {
      this.addNoteAtTime(time);
    }
  }

  handleTimelineClick(e) {
    const rect = document.getElementById('timeline').getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / this.timelineScale;

    this.seekToTime(time);

    if (this.editMode === 'add' && e.type === 'mousedown') {
      this.addNoteAtTime(time);
    }
  }

  initGame() {
    const config = {
      type: Phaser.CANVAS,
      width: 200,
      height: 112,
      parent: 'game-canvas',
      backgroundColor: '#1a1a1a',
      render: {
        antialias: false,
        pixelArt: true
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      input: {
        gamepad: true
      }
    };

    this.game = new Phaser.Game(config);

    // Add game states
    this.game.state.add('Editor', {
      preload: this.preload.bind(this),
      create: this.create.bind(this),
      update: this.update.bind(this)
    });

    // Start the editor state
    this.game.state.start('Editor');
  }

  preload() {
    // Load placeholder sprites
    this.game.load.baseURL = 'assets/';

    // Note sprites
    this.game.load.image('note-a', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    this.game.load.image('note-b', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwAEZwGAI+QSaAAAAABJRU5ErkJggg==');
    this.game.load.image('note-up', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbhyQAAAABJRU5ErkJggg==');
    this.game.load.image('note-down', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGBgAAAFCQEDrZzppQAAAABJRU5ErkJggg==');
    this.game.load.image('note-left', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    this.game.load.image('note-right', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwAEZwGAI+QSaAAAAABJRU5ErkJggg==');

    // Effect sprites
    this.game.load.image('note-effect', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbhyQAAAABJRU5ErkJggg==');
    this.game.load.image('long-note-effect', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGBgAAAFCQEDrZzppQAAAABJRU5ErkJggg==');
    this.game.load.image('circle', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbhyQAAAABJRU5ErkJggg==');
  }

  create() {
    // Initialize gamepad
    this.gamepad = new Gamepad(this.game);

    // Set up canvas input
    this.setupCanvasInput();

    // Draw grid
    this.drawGrid();

    // Draw timeline
    this.drawTimeline();

    // Start update loop
    this.game.time.events.loop(Phaser.Timer.SECOND / 60, this.updateEditor, this);
  }

  setupCanvasInput() {
    const canvas = document.getElementById('game-canvas');

    // Touch events for canvas
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleCanvasTouch(e);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.editMode === 'edit' && this.selectedNote) {
        this.handleCanvasTouch(e);
      }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (this.editMode === 'add') {
        this.finishLongNote();
      }
    }, { passive: false });

    // Mouse events for desktop
    canvas.addEventListener('mousedown', (e) => {
      this.handleCanvasClick(e);
    });

    canvas.addEventListener('mousemove', (e) => {
      if (this.editMode === 'edit' && this.selectedNote && e.buttons === 1) {
        this.handleCanvasClick(e);
      }
    });

    canvas.addEventListener('mouseup', (e) => {
      if (this.editMode === 'add') {
        this.finishLongNote();
      }
    });
  }

  handleCanvasTouch(e) {
    const touch = e.touches[0];
    const rect = document.getElementById('game-canvas').getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (200 / rect.width);
    const y = (touch.clientY - rect.top) * (112 / rect.height);

    this.handleCanvasInteraction(x, y, e.type === 'touchstart');
  }

  handleCanvasClick(e) {
    const rect = document.getElementById('game-canvas').getBoundingClientRect();
    const x = (e.clientX - rect.left) * (200 / rect.width);
    const y = (e.clientY - rect.top) * (112 / rect.height);

    this.handleCanvasInteraction(x, y, e.type === 'mousedown');
  }

  handleCanvasInteraction(x, y, isStart) {
    const gridX = Math.floor(x / (200 / this.gridSize)) * (200 / this.gridSize);
    const gridY = Math.floor(y / (112 / this.gridSize)) * (112 / this.gridSize);

    if (this.editMode === 'add') {
      if (isStart) {
        this.startAddNote(gridX, gridY);
      }
    } else if (this.editMode === 'edit') {
      if (isStart) {
        this.selectNoteAt(gridX, gridY);
      } else if (this.selectedNote) {
        this.moveSelectedNote(gridX, gridY);
      }
    }
  }

  startAddNote(x, y) {
    if (this.noteType === 'long') {
      // Start creating a long note
      this.creatingLongNote = {
        time: this.currentTime,
        position: { x: x, y: y },
        type: 'long',
        duration: 0,
        input: this.inputMap[this.noteType] || ['a']
      };
    } else {
      // Add a tap note immediately
      this.addNote({
        time: this.currentTime,
        position: { x: x, y: y },
        type: this.noteType,
        duration: 0,
        input: this.inputMap[this.noteType] || ['a']
      });
    }
  }

  finishLongNote() {
    if (this.creatingLongNote) {
      const duration = this.currentTime - this.creatingLongNote.time;
      if (duration > 0.1) { // Minimum duration for long notes
        this.creatingLongNote.duration = duration;
        this.addNote(this.creatingLongNote);
      }
      this.creatingLongNote = null;
    }
  }

  addNote(noteData) {
    // Check for collisions
    if (this.hasNoteCollision(noteData)) {
      return false;
    }

    // Auto-position if enabled
    if (this.autoPosition) {
      this.autoPositionNote(noteData);
    }

    // Add the note
    this.currentSong.notes.push(noteData);

    // Sort notes by time
    this.currentSong.notes.sort((a, b) => a.time - b.time);

    // Update timeline
    this.drawTimeline();

    return true;
  }

  addNoteAtTime(time) {
    if (this.noteType === 'long') return; // Long notes handled separately

    const position = this.getAutoPosition(time);

    this.addNote({
      time: time,
      position: position,
      type: this.noteType,
      duration: 0,
      input: this.inputMap[this.noteType] || ['a']
    });
  }

  hasNoteCollision(note) {
    return this.currentSong.notes.some(existingNote => {
      const timeDiff = Math.abs(existingNote.time - note.time);
      const posDiff = Math.abs(existingNote.position.x - note.position.x) +
        Math.abs(existingNote.position.y - note.position.y);

      return timeDiff < 0.01 && posDiff < 10; // Collision threshold
    });
  }

  autoPositionNote(note) {
    const timeDiff = note.time - this.lastNoteTime;

    if (timeDiff < 0.5) { // Less than 500ms from last note
      // Place near previous note with same input
      const lastNotes = this.currentSong.notes.filter(n =>
        Math.abs(n.time - this.lastNoteTime) < 0.01
      );

      if (lastNotes.length > 0) {
        const lastNote = lastNotes[0];
        note.position = this.findNearbyPosition(lastNote.position);
        note.input = lastNote.input;
      }
    } else {
      // Random position and input
      note.position = this.getRandomPosition();
      note.input = this.getRandomInput();
    }

    this.lastNoteTime = note.time;
  }

  findNearbyPosition(position) {
    const positions = [
      { x: position.x - 50, y: position.y },
      { x: position.x + 50, y: position.y },
      { x: position.x, y: position.y - 28 },
      { x: position.x, y: position.y + 28 }
    ].filter(pos =>
      pos.x >= 0 && pos.x <= 200 && pos.y >= 0 && pos.y <= 112
    );

    return positions.length > 0 ?
      positions[Math.floor(Math.random() * positions.length)] :
      this.getRandomPosition();
  }

  getRandomPosition() {
    const gridCellWidth = 200 / this.gridSize;
    const gridCellHeight = 112 / this.gridSize;

    return {
      x: Math.floor(Math.random() * this.gridSize) * gridCellWidth,
      y: Math.floor(Math.random() * this.gridSize) * gridCellHeight
    };
  }

  getAutoPosition(time) {
    const timeDiff = time - this.lastNoteTime;

    if (timeDiff < 0.5 && this.currentSong.notes.length > 0) {
      const lastNotes = this.currentSong.notes.filter(n =>
        Math.abs(n.time - this.lastNoteTime) < 0.01
      );

      if (lastNotes.length > 0) {
        return this.findNearbyPosition(lastNotes[0].position);
      }
    }

    this.lastNoteTime = time;
    return this.getRandomPosition();
  }

  getRandomInput() {
    const inputs = ['a', 'b', 'up', 'down', 'left', 'right'];
    return [inputs[Math.floor(Math.random() * inputs.length)]];
  }

  selectNoteAt(x, y) {
    // Find note at position (with some tolerance)
    const tolerance = 20;
    this.selectedNote = this.currentSong.notes.find(note => {
      const dx = note.position.x - x;
      const dy = note.position.y - y;
      return Math.sqrt(dx * dx + dy * dy) < tolerance;
    });

    if (this.selectedNote) {
      this.seekToTime(this.selectedNote.time);
      this.drawTimeline();
    }
  }

  moveSelectedNote(x, y) {
    if (!this.selectedNote) return;

    // Snap to grid
    const gridX = Math.floor(x / (200 / this.gridSize)) * (200 / this.gridSize);
    const gridY = Math.floor(y / (112 / this.gridSize)) * (112 / this.gridSize);

    // Check for collisions
    const tempNote = {
      ...this.selectedNote,
      position: { x: gridX, y: gridY }
    };

    if (!this.hasNoteCollision(tempNote)) {
      this.selectedNote.position.x = gridX;
      this.selectedNote.position.y = gridY;
      this.drawTimeline();
    }
  }

  deleteSelectedNote() {
    if (this.selectedNote) {
      const index = this.currentSong.notes.indexOf(this.selectedNote);
      if (index !== -1) {
        this.currentSong.notes.splice(index, 1);
        this.selectedNote = null;
        this.drawTimeline();
      }
    }
  }

  update() {
    if (this.gamepad) {
      this.gamepad.update();
    }

    // Handle input for gameplay preview
    if (this.isPlaying) {
      this.updateGameplay();
    }

    // Handle editor shortcuts
    this.handleEditorInput();
  }

  updateEditor() {
    // Update current time if playing
    if (this.isPlaying) {
      this.currentTime += 1 / 60; // 60 FPS
      this.updatePlayhead();
    }

    // Redraw canvas
    this.drawCanvas();
  }

  updateGameplay() {
    // Check for note hits
    const currentNotes = this.currentSong.notes.filter(note => {
      const noteTime = note.time;
      return noteTime >= this.currentTime - 0.5 && noteTime <= this.currentTime + 0.1;
    });

    currentNotes.forEach(note => {
      if (this.checkInput(note)) {
        // Note hit successfully
        this.showHitEffect(note);
      }
    });
  }

  checkInput(note) {
    const requiredInputs = note.input;

    return requiredInputs.every(input => {
      return this.gamepad.held[input];
    });
  }

  showHitEffect(note) {
    // Visual feedback for note hit
    // This would create sprite effects in a real implementation
    console.log('Note hit:', note);
  }

  handleEditorInput() {
    // Delete selected note
    if (this.gamepad.pressed.select) {
      this.deleteSelectedNote();
    }

    // Play/pause toggle
    if (this.gamepad.pressed.start) {
      this.togglePlayback();
    }

    // Switch edit mode
    if (this.gamepad.pressed.a && this.gamepad.held.select) {
      this.editMode = this.editMode === 'add' ? 'edit' : 'add';
      this.updateEditMode();
    }

    // Switch note type
    if (this.gamepad.pressed.b && this.gamepad.held.select) {
      const types = ['tap', 'long', 'a', 'b', 'up', 'down', 'left', 'right'];
      const currentIndex = types.indexOf(this.noteType);
      this.noteType = types[(currentIndex + 1) % types.length];
      this.updateNoteType();
    }
  }

  updateEditMode() {
    document.getElementById('edit-mode').value = this.editMode;
  }

  updateNoteType() {
    document.getElementById('note-type').value = this.noteType;
  }

  togglePlayback() {
    this.isPlaying = !this.isPlaying;
    document.getElementById('play-pause').textContent = this.isPlaying ? 'Pause' : 'Play';

    if (this.isPlaying && this.currentTime >= this.getSongDuration()) {
      this.currentTime = 0;
    }
  }

  stopPlayback() {
    this.isPlaying = false;
    this.currentTime = 0;
    document.getElementById('play-pause').textContent = 'Play';
    this.updatePlayhead();
  }

  seekToTime(time) {
    this.currentTime = Math.max(0, Math.min(time, this.getSongDuration()));
    this.updatePlayhead();
  }

  updatePlayhead() {
    const playhead = document.querySelector('.timeline-playhead');
    if (playhead) {
      playhead.style.left = (this.currentTime * this.timelineScale) + 'px';
    }
  }

  getSongDuration() {
    if (this.currentSong.notes.length === 0) return 30; // Default 30 seconds

    const lastNote = this.currentSong.notes[this.currentSong.notes.length - 1];
    return lastNote.time + (lastNote.duration || 0) + 5; // Add 5 seconds padding
  }

  drawCanvas() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, 200, 112);

    // Draw background (placeholder)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 200, 112);

    // Draw notes
    const visibleNotes = this.currentSong.notes.filter(note => {
      const noteEndTime = note.time + (note.duration || 0);
      return noteEndTime >= this.currentTime - 2 && note.time <= this.currentTime + 2;
    });

    visibleNotes.forEach(note => {
      this.drawNoteOnCanvas(ctx, note);
    });

    // Draw approach circles for upcoming notes
    const upcomingNotes = this.currentSong.notes.filter(note =>
      note.time > this.currentTime && note.time <= this.currentTime + 1
    );

    upcomingNotes.forEach(note => {
      this.drawApproachCircle(ctx, note);
    });
  }

  drawNoteOnCanvas(ctx, note) {
    const timeDiff = note.time - this.currentTime;
    const alpha = Math.max(0, Math.min(1, 1 - timeDiff / 2));

    ctx.save();
    ctx.globalAlpha = alpha;

    const color = this.noteColors[note.type] || 0xe74c3c;
    ctx.fillStyle = this.rgbToHex(color);

    if (note.type === 'long') {
      // Draw long note body
      const durationHeight = note.duration * 50; // Visual representation of duration
      ctx.fillRect(
        note.position.x - 8,
        note.position.y - durationHeight / 2,
        16,
        durationHeight
      );

      // Draw long note ends
      ctx.fillRect(note.position.x - 12, note.position.y - durationHeight / 2 - 4, 24, 8);
      ctx.fillRect(note.position.x - 12, note.position.y + durationHeight / 2 - 4, 24, 8);
    } else {
      // Draw tap note as diamond
      ctx.save();
      ctx.translate(note.position.x, note.position.y);
      ctx.rotate(45 * Math.PI / 180);
      ctx.fillRect(-8, -8, 16, 16);
      ctx.restore();
    }

    // Highlight selected note
    if (note === this.selectedNote) {
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2;

      if (note.type === 'long') {
        const durationHeight = note.duration * 50;
        ctx.strokeRect(
          note.position.x - 8,
          note.position.y - durationHeight / 2,
          16,
          durationHeight
        );
      } else {
        ctx.save();
        ctx.translate(note.position.x, note.position.y);
        ctx.rotate(45 * Math.PI / 180);
        ctx.strokeRect(-8, -8, 16, 16);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  drawApproachCircle(ctx, note) {
    const timeUntilNote = note.time - this.currentTime;
    const scale = Math.max(0.1, timeUntilNote);

    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(note.position.x, note.position.y, 20 * scale, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  drawGrid() {
    const canvas = document.getElementById('grid-overlay');
    const ctx = canvas.getContext('2d');

    // Clear grid
    ctx.clearRect(0, 0, 200, 112);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(68, 68, 68, 0.5)';
    ctx.lineWidth = 1;

    const cellWidth = 200 / this.gridSize;
    const cellHeight = 112 / this.gridSize;

    // Vertical lines
    for (let x = 0; x <= 200; x += cellWidth) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 112);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= 112; y += cellHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(200, y);
      ctx.stroke();
    }
  }

  drawTimeline() {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';

    const duration = this.getSongDuration();
    const width = duration * this.timelineScale;
    timeline.style.width = width + 'px';

    // Draw time markers
    this.drawTimeMarkers(timeline, duration);

    // Draw notes
    this.currentSong.notes.forEach(note => {
      this.drawNoteOnTimeline(timeline, note);
    });

    // Draw playhead
    const playhead = document.createElement('div');
    playhead.className = 'timeline-playhead';
    playhead.style.left = (this.currentTime * this.timelineScale) + 'px';
    timeline.appendChild(playhead);
  }

  drawTimeMarkers(timeline, duration) {
    const bpm = this.currentSong.timing.bpm;
    const secondsPerBeat = 60 / bpm;
    const beatsPerMeasure = 4; // Assume 4/4 time

    for (let time = 0; time <= duration; time += secondsPerBeat) {
      const isMeasure = (time / secondsPerBeat) % beatsPerMeasure === 0;
      const marker = document.createElement('div');
      marker.className = `timeline-marker ${isMeasure ? 'measure' : 'beat'}`;
      marker.style.left = (time * this.timelineScale) + 'px';
      timeline.appendChild(marker);
    }
  }

  drawNoteOnTimeline(timeline, note) {
    const noteElement = document.createElement('div');
    noteElement.className = `timeline-note ${note.type}`;
    noteElement.style.left = (note.time * this.timelineScale - 6) + 'px';

    if (note === this.selectedNote) {
      noteElement.classList.add('selected');
    }

    // Add tooltip with note info
    noteElement.title = `Time: ${note.time.toFixed(2)}s\nPosition: (${note.position.x}, ${note.position.y})\nInput: ${note.input.join(', ')}`;

    // Add click handler for selection
    noteElement.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectedNote = note;
      this.seekToTime(note.time);
      this.drawTimeline();
    });

    timeline.appendChild(noteElement);

    // Draw duration tail for long notes
    if (note.type === 'long' && note.duration > 0) {
      const tail = document.createElement('div');
      tail.className = 'long-note-tail';
      tail.style.left = (note.time * this.timelineScale) + 'px';
      tail.style.width = (note.duration * this.timelineScale) + 'px';
      timeline.appendChild(tail);
    }
  }

  saveSong() {
    // In a real implementation, this would save to local storage or server
    localStorage.setItem('rhythmEditor_currentSong', JSON.stringify(this.currentSong));
    alert('Song saved locally!');
  }

  showLoadModal() {
    document.getElementById('load-modal').style.display = 'flex';
  }

  showExportModal() {
    document.getElementById('export-modal').style.display = 'flex';
    document.getElementById('json-output').value = JSON.stringify(this.currentSong, null, 2);
  }

  loadSongFile(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        if (file.name.endsWith('.zip')) {
          this.loadZipFile(e.target.result);
        } else {
          this.currentSong = JSON.parse(e.target.result);
          this.onSongLoaded();
        }
      } catch (error) {
        alert('Error loading file: ' + error.message);
      }
    };

    if (file.name.endsWith('.zip')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  }

  async loadZipFile(arrayBuffer) {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const songFile = zip.file('song.json');

      if (songFile) {
        const songData = await songFile.async('text');
        this.currentSong = JSON.parse(songData);
        this.onSongLoaded();
      } else {
        alert('No song.json found in ZIP file');
      }
    } catch (error) {
      alert('Error loading ZIP file: ' + error.message);
    }
  }

  onSongLoaded() {
    // Reset playback
    this.stopPlayback();

    // Update UI
    this.drawTimeline();
    this.drawGrid();

    // Close modal
    document.getElementById('load-modal').style.display = 'none';
    document.getElementById('file-input').value = '';

    alert('Song loaded successfully!');
  }

  copyJSON() {
    const jsonOutput = document.getElementById('json-output');
    jsonOutput.select();
    document.execCommand('copy');
    alert('JSON copied to clipboard!');
  }

  downloadJSON() {
    const blob = new Blob([JSON.stringify(this.currentSong, null, 2)], {
      type: 'application/json'
    });
    saveAs(blob, `${this.currentSong.id}.json`);
  }

  rgbToHex(rgb) {
    return '#' + ((1 << 24) + (rgb >> 16) * 65536 + ((rgb >> 8) & 0xff) * 256 + (rgb & 0xff)).toString(16).slice(1);
  }
}

window.addEventListener('load', () => {
    new RhythmLevelEditor();
});
