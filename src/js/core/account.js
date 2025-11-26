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
    hapticFeedback: false,
    // Addon system settings
    safeMode: false, 
    enabledAddons: [],
    hibernatingAddons: []
  },
  characters: {
    unlockedHairs: {
      front: [1],
      back: [1],
    },
    unlockedItems: ["school_uniform"],
    currentCharacter: DEFAULT_CHARACTER.name,
    list: [
      JSON.parse(JSON.stringify(DEFAULT_CHARACTER))
    ]
  },
  lastSong: null,
  highScores: {},
  stats: {
    // Gameplay stats
    totalGamesPlayed: 0,
    totalBeginnerGamesPlayed: 0,
    totalEasyGamesPlayed: 0,
    totalMediumGamesPlayed: 0,
    totalHardGamesPlayed: 0,
    totalChallengeGamesPlayed: 0,
    totalEditGamesPlayed: 0,
    totalTimePlayed: 0, // in seconds
    totalScore: 0,
    maxCombo: 0,
    perfectGames: 0,
    maxMarvelousInGame: 0,
    
    // Character stats
    charactersCreated: 0,
    maxCharacterLevel: 1,
    skillsUnlocked: 0,
    
    // Progression stats
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedDate: null,
    
    // Mastery stats
    difficultiesCompleted: 0,
    highScoresSet: 0,
    
    // Time-based stats
    totalPlaySessions: 0,
    averageSessionTime: 0,
    longestSession: 0, // in seconds
    currentSessionStart: null,
    
    // Time achievement flags
    playedAtNight: false,
    playedEarlyMorning: false,
    playedWeekend: false,
    playedHoliday: false,
    
    // Miscellaneous stats
    maxSkillsInGame: 0,
    
    // Detailed tracking
    totalNotesHit: 0,
    totalMarvelous: 0,
    totalPerfect: 0,
    totalGreat: 0,
    totalGood: 0,
    totalBoo: 0,
    totalMiss: 0,
  },
  achievements: {
    unlocked: {},
    progress: {}
  }
};

