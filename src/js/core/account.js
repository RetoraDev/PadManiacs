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
    visualizer: 'NONE',
    metronome: 'OFF',
    beatLines: false,
    beatsPerMeasure: 4, // TODO: Make this configurable
    speedMod: 'X-MOD',
    // Addon system settings
    safeMode: false, 
    enabledAddons: [],
    hibernatingAddons: []
  },
  lastSong: null,
  highScores: {}
};