const DEFAULT_ACCOUNT = {
  settings: {
    volume: 3,
    autoplay: false,
    enableMenuMusic: true,
    randomSong: false,
    renderer: 0,
    pixelated: true,
    noteColorOption: 'NOTE',
    noteSpeedMult: 1,
    userOffset: 0,
    scrollDirection: 'falling',
    visualizer: 'BPM',
    metronome: 'OFF',
    beatLines: false,
    beatsPerMeasure: 4, // TODO: Make this configurable
    speedMod: 'X-MOD',
    // Addon system settings
    safeMode: false, 
    enabledAddons: [],
    hibernatingAddons: []
  },
  characters: {
    unlockedHairs: {
      front: ["1", "2", "3", "4", "5"],
      back: ["1", "2", "3", "4", "5"]
    },
    unlockedItems: ["school_uniform", "headphones"],
    currentCharacter: DEFAULT_CHARACTER.name,
    list: [
      JSON.parse(JSON.stringify(DEFAULT_CHARACTER))
    ]
  },
  lastSong: null,
  highScores: {}
};