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
  characters: {
    unlockedHairs: {
      front: ["1", "2", "3"],
      back: ["1", "2", "3"]
    },
    unlockedItems: ["school_uniform", "headphones"],
    currentCharacter: "EIRI",
    list: [
      {
        name: "EIRI",
        level: 1,
        experience: 0,
        skillLevel: 1,
        unlockedSkills: ["safety_net"],
        appearance: {
          skinTone: 0,
          hairColor: 0xFFFFFF,
          frontHair: "1",
          backHair: "1",
          clothing: "school_uniform",
          accessory: "headphones"
        },
        stats: {
          gamesPlayed: 0,
          totalScore: 0,
          maxCombo: 0,
          perfectGames: 0,
          skillsUsed: 0
        },
        lastSkillLevelUp: 0
      }
    ]
  },
  lastSong: null,
  highScores: {}
};