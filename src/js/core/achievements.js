// Achievements system constants
const ACHIEVEMENTS = {
  EXPERIENCE_VALUES: {
    COMMON: 5,
    UNCOMMON: 10,
    RARE: 20,
    EPIC: 35,
    LEGENDARY: 64
  }
};

// Achievement categories
const ACHIEVEMENT_CATEGORIES = {
  GAMEPLAY: "Gameplay",
  CHARACTER: "Character",
  PROGRESSION: "Progression",
  MASTERY: "Mastery",
  TIME: "Time",
  HOLIDAYS: "Holidays",
  EDITOR: "Editor",
  MISC: "Miscellaneous"
};

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
  // Gameplay Achievements
  {
    id: "first_game",
    name: "First Steps",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Complete your first game",
      achieved: "You completed your first game!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalGamesPlayed >= 1,
    hidden: false
  },
  {
    id: "first_extra_songs_game",
    name: "Love My Charts",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Complete your first external song",
      achieved: "You completed your first external song!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: (_, song) => song.complete && song.isExternal,
    hidden: false
  },
  {
    id: "combo_100",
    name: "Getting the Rhythm",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Reach 100 combo",
      achieved: "You reached 100 combo!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.maxCombo >= 100,
    hidden: false
  },
  {
    id: "combo_500",
    name: "Combo Builder",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Reach 500 combo",
      achieved: "You reached 500 combo!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.maxCombo >= 500,
    hidden: false
  },
  {
    id: "combo_1000",
    name: "Chain Master",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Reach 1000 combo",
      achieved: "You reached 1000 combo!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.maxCombo >= 1000,
    hidden: false
  },
  {
    id: "combo_1500",
    name: "Rhythm Savant",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Reach 1500 combo",
      achieved: "You reached 1500 combo!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.maxCombo >= 1500,
    hidden: false
  },
  {
    id: "combo_2000",
    name: "Unbreakable Chain",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Reach 2000 combo",
      achieved: "You reached 2000 combo!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.maxCombo >= 2000,
    hidden: false
  },
  {
    id: "combo_3000",
    name: "Perfect Flow",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Reach 3000 combo",
      achieved: "You reached 3000 combo!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.maxCombo >= 3000,
    hidden: false
  },
  {
    id: "perfect_game",
    name: "Flawless Performance",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Complete a song with 100% accuracy",
      achieved: "You completed a song with 100% accuracy!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.perfectGames >= 1,
    hidden: false
  },
  {
    id: "perfect_games_5",
    name: "Consistent Perfection",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Complete 5 songs with 100% accuracy",
      achieved: "You completed 5 songs with 100% accuracy!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.perfectGames >= 5,
    hidden: false
  },
  {
    id: "perfect_games_25",
    name: "Perfection Master",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Complete 25 songs with 100% accuracy",
      achieved: "You completed 25 songs with 100% accuracy!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.perfectGames >= 25,
    hidden: false
  },
  {
    id: "marvelous_500",
    name: "Marvelous Master",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Get 500 Marvelous judgements in one game",
      achieved: "You got 500 Marvelous judgements!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.maxMarvelousInGame >= 500,
    hidden: false
  },
  {
    id: "marvelous_1000",
    name: "Precision Expert",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Get 1000 Marvelous judgements in one game",
      achieved: "You got 1000 Marvelous judgements!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.maxMarvelousInGame >= 1000,
    hidden: false
  },
  {
    id: "marvelous_1500",
    name: "Timing Virtuoso",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Get 1500 Marvelous judgements in one game",
      achieved: "You got 1500 Marvelous judgements!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.maxMarvelousInGame >= 1500,
    hidden: false
  },
  {
    id: "all_marvelous",
    name: "Absolute Precision",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Get only Marvelous judgements in a song",
      achieved: "You got only Marvelous judgements in a song!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: (_, song) => song.judgements.marvelous >= song.totalNotes,
    condition: stats => stats.perfectGames >= 1 && stats.maxMarvelousInGame >= 50,
    hidden: false
  },
  {
    id: "first_million",
    name: "Millionaire",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Score 1,000,000 points in one game",
      achieved: "You scored 1,000,000 points in one game!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: (_, song) => song.score >= 1000000,
    hidden: false
  },
  {
    id: "accuracy_90",
    name: "A Grade",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Achieve 90% accuracy in a song",
      achieved: "You achieved 90% accuracy in a song!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: (_, song) => song.accuracy >= 90,
    hidden: false
  },
  {
    id: "accuracy_95",
    name: "S Grade",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Achieve 95% accuracy in a song",
      achieved: "You achieved 95% accuracy in a song!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: (_, song) => song.accuracy >= 95,
    hidden: false
  },
  {
    id: "accuracy_99",
    name: "SS Grade",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Achieve 99% accuracy in a song",
      achieved: "You achieved 99% accuracy in a song!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: (_, song) => song.accuracy >= 99,
    hidden: false
  },
  {
    id: "no_boo_game",
    name: "Clean Play",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Complete a song without any Boo judgements",
      achieved: "You completed a song without any Boo judgements!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: (_, song) => song.complete && song.judgements.boo <= 0,
    hidden: false
  },
  {
    id: "only_perfect_plus",
    name: "Perfect+ Only",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Get only Marvelous and Perfect judgements",
      achieved: "You got only Marvelous and Perfect judgements!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: (_, song) => song.complete && song.judgements.marvelous + song.judgements.perfect >= song.totalNotes,
    hidden: false
  },
  {
    id: "speed_challenge",
    name: "Speed Demon",
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: "Complete a song on maximum note speed",
      achieved: "You completed a song on maximum note speed!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: (_, song) => song.complete && Account.settings.noteSpeedMult >= 6,
    hidden: false
  },

  // Character Achievements
  {
    id: "first_character",
    name: "New Identity",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Create your first character",
      achieved: "You created your first character!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.charactersCreated >= 1,
    hidden: false
  },
  {
    id: "character_collector",
    name: "Character Collector",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Create 5 different characters",
      achieved: "You created 5 different characters!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.charactersCreated >= 5,
    hidden: false
  },
  {
    id: "character_archivist",
    name: "Character Archivist",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Create 10 different characters",
      achieved: "You created 10 different characters!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.charactersCreated >= 10,
    hidden: false
  },
  {
    id: "character_level_5",
    name: "Apprentice Dancer",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Reach character level 5",
      achieved: "You reached character level 5!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.maxCharacterLevel >= 5,
    hidden: false
  },
  {
    id: "character_level_10",
    name: "Seasoned Performer",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Reach character level 10",
      achieved: "You reached character level 10!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.maxCharacterLevel >= 10,
    hidden: false
  },
  {
    id: "character_level_20",
    name: "Experienced Artist",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Reach character level 20",
      achieved: "You reached character level 20!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.maxCharacterLevel >= 20,
    hidden: false
  },
  {
    id: "character_level_30",
    name: "Veteran Dancer",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Reach character level 30",
      achieved: "You reached character level 30!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.maxCharacterLevel >= 30,
    hidden: false
  },
  {
    id: "character_level_50",
    name: "Rhythm Legend",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Reach character level 50",
      achieved: "You reached character level 50!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.maxCharacterLevel >= 50,
    hidden: false
  },
  {
    id: "first_skill",
    name: "First Skill",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Unlock your first skill",
      achieved: "You unlocked your first skill!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.skillsUnlocked >= 1,
    hidden: false
  },
  {
    id: "skill_collector",
    name: "Skill Collector",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Unlock 5 different skills",
      achieved: "You unlocked 5 different skills!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.skillsUnlocked >= 5,
    hidden: false
  },
  {
    id: "skill_master",
    name: "Skill Master",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Unlock 10 different skills",
      achieved: "You unlocked 10 different skills!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.skillsUnlocked >= 10,
    hidden: false
  },
  {
    id: "skill_grandmaster",
    name: "Skill Grandmaster",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Unlock 20 different skills",
      achieved: "You unlocked 20 different skills!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.skillsUnlocked >= 20,
    hidden: false
  },
  {
    id: "skill_legend",
    name: "Skill Legend",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Unlock 30 different skills",
      achieved: "You unlocked 30 different skills!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.skillsUnlocked >= 30,
    hidden: false
  },
  {
    id: "first_hair_style",
    name: "New Look",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Unlock a new hair style",
      achieved: "You unlocked a new hair style!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.charactersCreated >= 1,
    hidden: false
  },
  {
    id: "fashion_collector",
    name: "Fashion Collector",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Unlock 5 different clothing items",
      achieved: "You unlocked 5 different clothing items!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.charactersCreated >= 2,
    hidden: false
  },
  {
    id: "fashion_icon",
    name: "Fashion Icon",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Unlock 10 different clothing items",
      achieved: "You unlocked 10 different clothing items!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.charactersCreated >= 3,
    hidden: false
  },
  {
    id: "accessory_hunter",
    name: "Accessory Hunter",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Unlock 5 different accessories",
      achieved: "You unlocked 5 different accessories!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.charactersCreated >= 2,
    hidden: false
  },
  {
    id: "max_skill_level",
    name: "Maxed Out",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Reach maximum skill level with a character",
      achieved: "You reached maximum skill level with a character!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.maxCharacterLevel >= CHARACTER_SYSTEM.MAX_SKILL_LEVEL,
    hidden: false
  },
  {
    id: "character_perfection",
    name: "Character Perfection",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Max out all character stats",
      achieved: "You maxed out all character stats!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.maxCharacterLevel >= 50 && stats.skillsUnlocked >= 30,
    hidden: false
  },
  {
    id: "name_master",
    name: "Name Master",
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: "Create a character with maximum name length",
      achieved: "You created a character with maximum name length!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.charactersCreated >= 1,
    hidden: false
  },

  // Progression Achievements
  {
    id: "games_10",
    name: "Dedicated Player",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Play 10 games",
      achieved: "You played 10 games!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalGamesPlayed >= 25,
    hidden: false
  },
  {
    id: "games_25",
    name: "Regular Player",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Play 25 games",
      achieved: "You played 25 games!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalGamesPlayed >= 25,
    hidden: false
  },
  {
    id: "games_50",
    name: "Rhythm Enthusiast",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Play 50 games",
      achieved: "You played 50 games!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalGamesPlayed >= 50,
    hidden: false
  },
  {
    id: "games_100",
    name: "Addicted to Rhythm",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Play 100 games",
      achieved: "You played 100 games!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.totalGamesPlayed >= 250,
    hidden: false
  },
  {
    id: "streak_3",
    name: "Consistent Player",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Maintain a 3-day play streak",
      achieved: "You maintained a 3-day play streak!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.currentStreak >= 3,
    hidden: false
  },
  {
    id: "streak_7",
    name: "Weekly Warrior",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Maintain a 7-day play streak",
      achieved: "You maintained a 7-day play streak!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.currentStreak >= 7,
    hidden: false
  },
  {
    id: "streak_14",
    name: "Fortnight Fanatic",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Maintain a 14-day play streak",
      achieved: "You maintained a 14-day play streak!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.currentStreak >= 14,
    hidden: false
  },
  {
    id: "streak_30",
    name: "Monthly Master",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Maintain a 30-day play streak",
      achieved: "You maintained a 30-day play streak!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.currentStreak >= 30,
    hidden: false
  },
  {
    id: "streak_90",
    name: "Seasoned Veteran",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Maintain a 90-day play streak",
      achieved: "You maintained a 90-day play streak!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.currentStreak >= 90,
    hidden: false
  },
  {
    id: "first_high_score",
    name: "High Scorer",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Set your first high score",
      achieved: "You set your first high score!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.highScoresSet >= 1,
    hidden: false
  },
  {
    id: "high_score_master",
    name: "High Score Hunter",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Set 10 high scores",
      achieved: "You set 10 high scores!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.highScoresSet >= 10,
    hidden: false
  },
  {
    id: "high_score_expert",
    name: "High Score Expert",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Set 25 high scores",
      achieved: "You set 25 high scores!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.highScoresSet >= 25,
    hidden: false
  },
  {
    id: "high_score_legend",
    name: "High Score Legend",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Set 50 high scores",
      achieved: "You set 50 high scores!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.highScoresSet >= 50,
    hidden: false
  },
  {
    id: "total_score_1m",
    name: "Million Points",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Reach 1 million total score",
      achieved: "You reached 1 million total score!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalScore >= 1000000,
    hidden: false
  },
  {
    id: "total_score_10m",
    name: "Ten Million Points",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Reach 10 million total score",
      achieved: "You reached 10 million total score!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalScore >= 10000000,
    hidden: false
  },
  {
    id: "total_score_100m",
    name: "Hundred Million Points",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Reach 100 million total score",
      achieved: "You reached 100 million total score!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.totalScore >= 100000000,
    hidden: false
  },
  {
    id: "notes_1000",
    name: "Thousand Notes",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Hit 1000 notes total",
      achieved: "You hit 1000 notes total!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalNotesHit >= 1000,
    hidden: false
  },
  {
    id: "notes_10000",
    name: "Ten Thousand Notes",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Hit 10,000 notes total",
      achieved: "You hit 10,000 notes total!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalNotesHit >= 10000,
    hidden: false
  },
  {
    id: "notes_100000",
    name: "Hundred Thousand Notes",
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: "Hit 100,000 notes total",
      achieved: "You hit 100,000 notes total!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalNotesHit >= 100000,
    hidden: false
  },

  // Time Achievements
  {
    id: "time_1_hour",
    name: "Hour of Rhythm",
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: "Play for 1 hour total",
      achieved: "You played for 1 hour total!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalTimePlayed >= 3600,
    hidden: false
  },
  {
    id: "time_5_hours",
    name: "Rhythm Enthusiast",
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: "Play for 5 hours total",
      achieved: "You played for 5 hours total!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalTimePlayed >= 18000,
    hidden: false
  },
  {
    id: "time_10_hours",
    name: "Dedicated Dancer",
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: "Play for 10 hours total",
      achieved: "You played for 10 hours total!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalTimePlayed >= 36000,
    hidden: false
  },
  {
    id: "time_24_hours",
    name: "Rhythm Marathon",
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: "Play for 24 hours total",
      achieved: "You played for 24 hours total!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.totalTimePlayed >= 86400,
    hidden: false
  },
  {
    id: "time_100_hours",
    name: "Rhythm Master",
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: "Play for 100 hours total",
      achieved: "You played for 100 hours total!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.totalTimePlayed >= 360000,
    hidden: false
  },
  {
    id: "session_30_min",
    name: "Focused Session",
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: "Play a single session for 30 minutes",
      achieved: "You played a single session for 30 minutes!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.longestSession >= 1800,
    hidden: false
  },
  {
    id: "session_1_hour",
    name: "Extended Session",
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: "Play a single session for 1 hour",
      achieved: "You played a single session for 1 hour!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.longestSession >= 3600,
    hidden: false
  },
  {
    id: "session_2_hours",
    name: "Marathon Session",
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: "Play a single session for 2 hours",
      achieved: "You played a single session for 2 hours!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.longestSession >= 7200,
    hidden: false
  },
  {
    id: "session_4_hours",
    name: "Ultra Marathon",
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: "Play a single session for 4 hours",
      achieved: "You played a single session for 4 hours!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.longestSession >= 14400,
    hidden: false
  },
  {
    id: "early_bird",
    name: "Early Bird",
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: "Play between 5 AM and 9 AM",
      achieved: "You played between 5 AM and 9 AM!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.playedEarlyMorning,
    hidden: false
  },
  {
    id: "night_owl",
    name: "Night Owl",
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: "Play between midnight and 4 AM",
      achieved: "You played between midnight and 4 AM!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.playedAtNight,
    hidden: false
  },
  {
    id: "weekend_warrior",
    name: "Weekend Warrior",
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: "Play on a weekend",
      achieved: "You played on a weekend!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.playedWeekend,
    hidden: false
  },
  {
    id: "holiday_player",
    name: "Holiday Player",
    category: ACHIEVEMENT_CATEGORIES.HOLIDAYS,
    description: {
      unachieved: "Play on a holiday",
      achieved: "You played on a holiday!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.playedHoliday,
    hidden: false
  },

  // Editor Achievements
  {
    id: "first_arrow_placed",
    name: "First Step",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Place your first arrow in the editor",
      achieved: "You placed your first arrow!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalPlacedArrows >= 1,
    hidden: false
  },
  {
    id: "arrow_master",
    name: "Arrow Architect",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Place 100 arrows in the editor",
      achieved: "You placed 100 arrows!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalPlacedArrows >= 100,
    hidden: false
  },
  {
    id: "arrow_expert",
    name: "Pattern Weaver",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Place 500 arrows in the editor",
      achieved: "You placed 500 arrows!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalPlacedArrows >= 500,
    hidden: false
  },
  {
    id: "arrow_legend",
    name: "Stepchart Legend",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Place 1000 arrows in the editor",
      achieved: "You placed 1000 arrows!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalPlacedArrows >= 1000,
    hidden: false
  },
  {
    id: "first_freeze_placed",
    name: "Hold On",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Place your first freeze arrow",
      achieved: "You placed your first freeze arrow!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalPlacedFreezes >= 1,
    hidden: false
  },
  {
    id: "freeze_master",
    name: "Hold Master",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Place 50 freeze arrows",
      achieved: "You placed 50 freeze arrows!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalPlacedFreezes >= 50,
    hidden: false
  },
  {
    id: "freeze_artist",
    name: "Sustain Artist",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Place 200 freeze arrows",
      achieved: "You placed 200 freeze arrows!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalPlacedFreezes >= 200,
    hidden: false
  },
  {
    id: "first_mine_placed",
    name: "Danger Zone",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Place your first mine",
      achieved: "You placed your first mine!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalPlacedMines >= 1,
    hidden: false
  },
  {
    id: "mine_layer",
    name: "Mine Layer",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Place 25 mines",
      achieved: "You placed 25 mines!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalPlacedMines >= 25,
    hidden: false
  },
  {
    id: "mine_expert",
    name: "Trap Master",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Place 100 mines",
      achieved: "You placed 100 mines!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalPlacedMines >= 100,
    hidden: false
  },
  {
    id: "first_chart_created",
    name: "Chart Creator",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Create your first complete chart",
      achieved: "You created your first complete chart!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.chartsCreated >= 1,
    hidden: false
  },
  {
    id: "chart_creator",
    name: "Prolific Creator",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Create 5 complete charts",
      achieved: "You created 5 complete charts!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.chartsCreated >= 5,
    hidden: false
  },
  {
    id: "chart_master",
    name: "Chart Master",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Create 10 complete charts",
      achieved: "You created 10 complete charts!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.chartsCreated >= 10,
    hidden: false
  },
  {
    id: "first_song_imported",
    name: "Music Importer",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Import your first song",
      achieved: "You imported your first song!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalImportedSongs >= 1,
    hidden: false
  },
  {
    id: "song_collector",
    name: "Music Collector",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Import 5 songs",
      achieved: "You imported 5 songs!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalImportedSongs >= 5,
    hidden: false
  },
  {
    id: "music_archivist",
    name: "Music Archivist",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Import 10 songs",
      achieved: "You imported 10 songs!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalImportedSongs >= 10,
    hidden: false
  },
  {
    id: "first_song_exported",
    name: "Chart Exporter",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Export your first chart",
      achieved: "You exported your first chart!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalExportedSongs >= 1,
    hidden: false
  },
  {
    id: "song_exporter",
    name: "Content Creator",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Export 5 charts",
      achieved: "You exported 5 charts!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalExportedSongs >= 5,
    hidden: false
  },
  {
    id: "chart_publisher",
    name: "Chart Publisher",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Export 10 charts",
      achieved: "You exported 10 charts!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.totalExportedSongs >= 10,
    hidden: false
  },
  {
    id: "editor_time_1_hour",
    name: "Editor Apprentice",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Spend 1 hour in the editor",
      achieved: "You spent 1 hour in the editor!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.editorTimeSpent >= 3600,
    hidden: false
  },
  {
    id: "editor_time_5_hours",
    name: "Editor Enthusiast",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Spend 5 hours in the editor",
      achieved: "You spent 5 hours in the editor!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.editorTimeSpent >= 18000,
    hidden: false
  },
  {
    id: "editor_time_10_hours",
    name: "Editor Veteran",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Spend 10 hours in the editor",
      achieved: "You spent 10 hours in the editor!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.editorTimeSpent >= 36000,
    hidden: false
  },
  {
    id: "editor_time_24_hours",
    name: "Editor Master",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Spend 24 hours in the editor",
      achieved: "You spent 24 hours in the editor!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.editorTimeSpent >= 86400,
    hidden: false
  },
  {
    id: "complex_chart",
    name: "Complexity Creator",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Create a chart with 1000+ notes",
      achieved: "You created a chart with 1000+ notes!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.createdChartWith1000Notes,
    hidden: false
  },
  {
    id: "difficulty_setter",
    name: "Difficulty Designer",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Set difficulty ratings for 5 charts",
      achieved: "You set difficulty ratings for 5 charts!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.chartsWithDifficultySet >= 5,
    hidden: false
  },
  {
    id: "all_note_types",
    name: "Note Variety Expert",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Use all note types in a single chart",
      achieved: "You used all note types in a single chart!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.usedAllNoteTypesInChart,
    hidden: false
  },
  {
    id: "chart_test_play",
    name: "Quality Tester",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Test play your own chart",
      achieved: "You test played your own chart!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.chartsTestPlayed >= 1,
    hidden: false
  },
  {
    id: "editor_completionist",
    name: "Editor Completionist",
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: "Complete all basic editor achievements",
      achieved: "You completed all basic editor achievements!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.totalPlacedArrows >= 1000 && stats.totalPlacedFreezes >= 200 && stats.totalPlacedMines >= 100 && stats.chartsCreated >= 10 && stats.totalExportedSongs >= 10 && stats.editorTimeSpent >= 36000,
    hidden: true
  },

  // Mastery Achievements
  {
    id: "all_difficulties",
    name: "Versatile Player",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: "Complete songs on all difficulty types",
      achieved: "You completed songs on all difficulty types!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalBeginnerGamesPlayed && stats.totalEasyGamesPlayed && stats.totalMediumGamesPlayed && stats.totalHardGamesPlayed && stats.totalChallengeGamesPlayed && stats.totalEditGamesPlayed,
    hidden: false
  },
  {
    id: "beginner_master",
    name: "Beginner Master",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: "Complete 25 Beginner difficulty charts",
      achieved: "You completed 25 Beginner difficulty charts!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalBeginnerGamesPlayed >= 25,
    hidden: false
  },
  {
    id: "easy_master",
    name: "Easy Master",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: "Complete 25 Easy difficulty charts",
      achieved: "You completed 25 Easy difficulty charts!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalEasyGamesPlayed >= 25,
    hidden: false
  },
  {
    id: "medium_master",
    name: "Medium Master",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: "Complete 25 Medium difficulty charts",
      achieved: "You completed 25 Medium difficulty charts!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalMediumGamesPlayed >= 25,
    hidden: false
  },
  {
    id: "hard_master",
    name: "Hard Master",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: "Complete 25 Hard difficulty charts",
      achieved: "You completed 25 Hard difficulty charts!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalHardGamesPlayed >= 25,
    hidden: false
  },
  {
    id: "challenge_master",
    name: "Challenge Master",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: "Complete 25 Challenge difficulty charts",
      achieved: "You completed 25 Challenge difficulty charts!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.totalChallengeGamesPlayed >= 25,
    hidden: false
  },
  {
    id: "difficulty_11",
    name: "Expert Player",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: "Complete a difficulty 11 chart",
      achieved: "You completed a difficulty 11 chart!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: (_, song) => song.complete && song.difficultyRating >= 11,
    hidden: false
  },
  {
    id: "difficulty_15",
    name: "Master Player",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: "Complete a difficulty 15 song",
      achieved: "You completed a difficulty 15 song!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: (_, song) => song.complete && song.difficultyRating >= 15,
    hidden: false
  },
  {
    id: "difficulty_25",
    name: "Just... Don't know what to say",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: "Complete a difficulty 25 song",
      achieved: "You completed a difficulty 25 song!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: (_, song) => song.complete && song.difficultyRating >= 15,
    hidden: false
  },
  {
    id: "skill_spammer",
    name: "Skill Spammer",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: "Use 5 skills in a single game",
      achieved: "You used 5 skills in a single game!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.maxSkillsInGame >= 5,
    hidden: false
  },
  {
    id: "skill_expert",
    name: "Skill Expert",
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: "Use 10 skills in a single game",
      achieved: "You used 10 skills in a single game!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.maxSkillsInGame >= 10,
    hidden: false
  },

  // Miscellaneous
  {
    id: "submit_bug_report",
    name: "Crash Tester",
    category: ACHIEVEMENT_CATEGORIES.MISC,
    description: {
      unachieved: "Submit a bug report",
      achieved: "You submitted a bug report!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.submittedBugReport,
    hidden: false
  },
  {
    id: "submit_rating",
    name: "Review it!",
    category: ACHIEVEMENT_CATEGORIES.MISC,
    description: {
      unachieved: "Submit a review about this game",
      achieved: "You submitted a review! Thank you!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.gameRated,
    hidden: false
  },
  {
    id: "submit_feature_request",
    name: "Hmm... Maybe add this",
    category: ACHIEVEMENT_CATEGORIES.MISC,
    description: {
      unachieved: "Request a feature",
      achieved: "You requested a feature!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.featureRequestPrompted,
    hidden: false
  }
];
