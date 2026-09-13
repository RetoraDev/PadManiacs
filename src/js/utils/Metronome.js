/**
 * @class Metronome
 * @category Core Game Classes
 * @summary Audio metronome system for timing assistance
 * @constructor
 * @param {Object} scene - The Phaser game state scene
 * @features
 * Quarter, eighth, sixteenth, and thirty-second beat divisions
 * Note-triggered mode that ticks on actual note beats
 * Toggle via scene select button binding
 * @description
 * Plays audible tick sounds synchronized to the song's beat to assist timing.
 * Supports standard rhythmic subdivisions and a note mode that triggers on actual
 * chart note beats for practice assistance.
 * @example
 * // Modding usage example
 * const metro = new Metronome(scene);
 * metro.setMode('Quarters');
 * metro.toggle();
 * function update() {
 *   metro.update();
 * }
 */
class Metronome {
  constructor(scene) {
    /** @type {Object} The owning Phaser game state scene */
    this.scene = scene;
    /** @type {string} Current metronome mode from account settings */
    this.mode = Account.settings.metronome;
    /** @type {boolean} Whether the metronome ticks are active */
    this.enabled = false;
    /** @type {Object} Map of mode names to beat division multipliers */
    this.beatDivisions = {
      'OFF': 0,
      'Quarters': 1,       // Every whole beat (1, 2, 3, 4...)
      'Eighths': 2,        // Every half beat (1, 1.5, 2, 2.5...)
      'Sixteenths': 4,     // Every quarter beat (1, 1.25, 1.5, 1.75...)
      'Thirty-seconds': 8, // Every eighth beat (1, 1.125, 1.25, 1.375...)
      'Note': 'Note'       // Special mode - plays when notes reach their beat time
    };
    
    /** @type {number} Last division value to detect beat crossings */
    this.lastDivisionValue = -1;
    /** @type {number} Division multiplier of the current mode */
    this.currentDivision = this.beatDivisions[this.mode];
    
    // For NOTE mode
    /** @type {number} Current note index to check */
    this.noteIndex = 0; // Current note index to check
    /** @type {number} Last note beat that triggered a tick */
    this.lastNoteBeat = -1; // Last note beat that triggered a tick
    /** @type {Array} Array of unique note beats */
    this.notes = []; // Array of unique note beats
    
    // Bind the toggle method to the scene
    this.scene.onSelectPressed = this.toggle.bind(this);
  }

  /**
   * Updates the metronome each frame, dispatching to the active mode's update logic.
   */
  update() {
    if (!this.enabled) return;
    
    if (this.mode === 'Note') {
      this.updateNoteMode();
    } else {
      this.updateBeatMode();
    }
  }
  
  /**
   * Plays a tick whenever the beat crosses into a new subdivision value.
   */
  updateBeatMode() {
    if (this.currentDivision === 0) return;
    
    const { beat } = this.scene.getCurrentTime();
    const currentDivisionValue = this.getCurrentDivisionValue(beat);
    
    // Check if we've crossed a new division
    if (currentDivisionValue !== this.lastDivisionValue) {
      this.playTick();
      this.lastDivisionValue = currentDivisionValue;
    }
  }

  /**
   * Triggers ticks as the song time reaches the beat of each chart note.
   */
  updateNoteMode() {
    const { beat } = this.scene.getCurrentTime();
    const currentBeat = beat;
    
    // Initialize notes array if empty
    if (this.notes.length === 0) {
      this.initializeNotes();
    }
    
    // If we've processed all notes, return
    if (this.noteIndex >= this.notes.length) return;
    
    // Get the next note beat to check
    const nextNoteBeat = this.notes[this.noteIndex];
    
    // Check if current time has reached the next note's beat
    if (currentBeat >= nextNoteBeat) {
      // Play tick and move to next note
      this.playTick();
      this.lastNoteBeat = nextNoteBeat;
      this.noteIndex++;
      
      // Skip any notes with the same beat (group them together)
      while (this.noteIndex < this.notes.length && this.notes[this.noteIndex] === this.lastNoteBeat) {
        this.noteIndex++;
      }
    }
  }

  /**
   * Builds a sorted list of unique note beats from the current difficulty chart.
   */
  initializeNotes() {
    // Get all notes from the current difficulty
    const difficulty = this.scene.song.chart.difficulties[this.scene.song.difficultyIndex];
    const difficultyKey = `${difficulty.type}${difficulty.rating}`;
    const allNotes = this.scene.song.chart.notes[difficultyKey];
    
    if (!allNotes) {
      this.notes = [];
      return;
    }
    
    // Extract unique note beats (only regular notes, no duplicates, sorted)
    const uniqueBeats = new Set();
    
    for (const note of allNotes) {
      // Skip mines and freeze end
      if (note.type === "1" || note.type === "2" || note.type === "4") {
        // Round to 3 decimal places to handle floating point precision
        const roundedBeat = Math.round(note.beat * 1000) / 1000;
        uniqueBeats.add(roundedBeat);
      }
    }
    
    // Convert to sorted array
    this.notes = Array.from(uniqueBeats).sort((a, b) => a - b);
    this.noteIndex = 0;
    this.lastNoteBeat = -1;
  }

  /**
   * Computes the current subdivision value by scaling the beat with the mode's multiplier.
   * @param {number} beat - Current song beat
   * @returns {number} The scaled division value, or -1 when disabled
   */
  getCurrentDivisionValue(beat) {
    if (this.currentDivision === 0) return -1;
    
    // Calculate the current division value
    return Math.floor(beat * this.currentDivision);
  }

  /**
   * Plays the metronome tick sound effect.
   */
  playTick() {
    Audio.play('assist_tick');
  }

  /**
   * Toggles the metronome enabled state when the mode is not OFF.
   */
  toggle() {
    if (this.mode == 'OFF') return;
    
    this.enabled = !this.enabled;
    this.lastDivisionValue = -1; // Reset to ensure tick plays on next division
    this.resetNoteMode(); // Reset note mode state
  }

  /**
   * Resets note mode state so ticks restart from the beginning of the chart.
   */
  resetNoteMode() {
    this.noteIndex = 0;
    this.lastNoteBeat = -1;
    this.notes = [];
  }

  /**
   * Changes the metronome mode and reconfigures enabled state and tracking.
   * @param {string} mode - One of the supported mode keys
   */
  setMode(mode) {
    if (this.beatDivisions.hasOwnProperty(mode)) {
      this.mode = mode;
      this.currentDivision = this.beatDivisions[mode];
      this.lastDivisionValue = -1; // Reset division tracking
      this.resetNoteMode(); // Reset note mode state
      
      // Update enabled state based on mode
      this.enabled = mode !== 'OFF';
      
      // Update account settings
      //Account.settings.metronome = mode;
      //saveAccount();
    }
  }

  /**
   * Disables the metronome, resets state, and cleans up the status text display.
   */
  destroy() {
    this.enabled = false;
    this.lastDivisionValue = -1;
    this.resetNoteMode();
    
    // Clean up text display
    if (this.statusText) {
      this.statusText.destroy();
      this.statusText = null;
    }
  }
}
