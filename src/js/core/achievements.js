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
  GAMEPLAY: __("Gameplay||Juego"),
  CHARACTER: __("Character||Personaje"),
  PROGRESSION: __("Progression||Progresión"),
  MASTERY: __("Mastery||Maestría"),
  TIME: __("Time||Tiempo"),
  HOLIDAYS: __("Holidays||Festivos"),
  EDITOR: __("Editor||Editor"),
  MISC: __("Miscellaneous||Varios")
};

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
  // Gameplay Achievements
  {
    id: "first_game",
    name: __("First Steps||Primeros Pasos"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Complete your first game||Completa tu primera partida"),
      achieved: __("You completed your first game!||¡Completaste tu primera partida!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalGamesPlayed >= 1,
    hidden: false
  },
  {
    id: "first_extra_songs_game",
    name: __("Love My Charts||Amo Mis Charts"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Complete your first external song||Completa tu primera canción externa"),
      achieved: __("You completed your first external song!||¡Completaste tu primera canción externa!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: (_, song) => song.complete && song.isExternal,
    hidden: false
  },
  {
    id: "combo_100",
    name: __("Getting the Rhythm||Tomando el Ritmo"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Reach 100 combo||Alcanza 100 combo"),
      achieved: __("You reached 100 combo!||¡Alcanzaste 100 combo!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.maxCombo >= 100,
    hidden: false
  },
  {
    id: "combo_500",
    name: __("Combo Builder||Constructor de Combo"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Reach 500 combo||Alcanza 500 combo"),
      achieved: __("You reached 500 combo!||¡Alcanzaste 500 combo!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.maxCombo >= 500,
    hidden: false
  },
  {
    id: "combo_1000",
    name: __("Chain Master||Maestro de la Cadena"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Reach 1000 combo||Alcanza 1000 combo"),
      achieved: __("You reached 1000 combo!||¡Alcanzaste 1000 combo!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.maxCombo >= 1000,
    hidden: false
  },
  {
    id: "combo_1500",
    name: __("Rhythm Savant||Sabio del Ritmo"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Reach 1500 combo||Alcanza 1500 combo"),
      achieved: __("You reached 1500 combo!||¡Alcanzaste 1500 combo!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.maxCombo >= 1500,
    hidden: false
  },
  {
    id: "combo_2000",
    name: __("Unbreakable Chain||Cadena Irrompible"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Reach 2000 combo||Alcanza 2000 combo"),
      achieved: __("You reached 2000 combo!||¡Alcanzaste 2000 combo!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.maxCombo >= 2000,
    hidden: false
  },
  {
    id: "combo_3000",
    name: __("Perfect Flow||Flujo Perfecto"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Reach 3000 combo||Alcanza 3000 combo"),
      achieved: __("You reached 3000 combo!||¡Alcanzaste 3000 combo!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.maxCombo >= 3000,
    hidden: false
  },
  {
    id: "perfect_game",
    name: __("Flawless Performance||Actuación Impecable"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Complete a song with 100% accuracy||Completa una canción con 100% de precisión"),
      achieved: __("You completed a song with 100% accuracy!||¡Completaste una canción con 100% de precisión!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.perfectGames >= 1,
    hidden: false
  },
  {
    id: "perfect_games_5",
    name: __("Consistent Perfection||Perfección Constante"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Complete 5 songs with 100% accuracy||Completa 5 canciones con 100% de precisión"),
      achieved: __("You completed 5 songs with 100% accuracy!||¡Completaste 5 canciones con 100% de precisión!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.perfectGames >= 5,
    hidden: false
  },
  {
    id: "perfect_games_25",
    name: __("Perfection Master||Maestro de la Perfección"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Complete 25 songs with 100% accuracy||Completa 25 canciones con 100% de precisión"),
      achieved: __("You completed 25 songs with 100% accuracy!||¡Completaste 25 canciones con 100% de precisión!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.perfectGames >= 25,
    hidden: false
  },
  {
    id: "marvelous_500",
    name: __("Marvelous Master||Maestro Maravilloso"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Get 500 Marvelous judgements in one game||Obtén 500 juicios Marvelous en una partida"),
      achieved: __("You got 500 Marvelous judgements!||¡Obtuviste 500 juicios Marvelous!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.maxMarvelousInGame >= 500,
    hidden: false
  },
  {
    id: "marvelous_1000",
    name: __("Precision Expert||Experto en Precisión"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Get 1000 Marvelous judgements in one game||Obtén 1000 juicios Marvelous en una partida"),
      achieved: __("You got 1000 Marvelous judgements!||¡Obtuviste 1000 juicios Marvelous!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.maxMarvelousInGame >= 1000,
    hidden: false
  },
  {
    id: "marvelous_1500",
    name: __("Timing Virtuoso||Virtuoso del Timing"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Get 1500 Marvelous judgements in one game||Obtén 1500 juicios Marvelous en una partida"),
      achieved: __("You got 1500 Marvelous judgements!||¡Obtuviste 1500 juicios Marvelous!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.maxMarvelousInGame >= 1500,
    hidden: false
  },
  {
    id: "all_marvelous",
    name: __("Absolute Precision||Precisión Absoluta"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Get only Marvelous judgements in a song||Obtén solo juicios Marvelous en una canción"),
      achieved: __("You got only Marvelous judgements in a song!||¡Obtuviste solo juicios Marvelous en una canción!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: (_, song) => song.complete && song.judgements.marvelous >= song.totalNotes,
    hidden: false
  },
  {
    id: "first_million",
    name: __("Millionaire||Millonario"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Score 1,000,000 points in one game||Consigue 1,000,000 puntos en una partida"),
      achieved: __("You scored 1,000,000 points in one game!||¡Consiguiste 1,000,000 puntos en una partida!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: (_, song) => song.score >= 1000000,
    hidden: false
  },
  {
    id: "accuracy_90",
    name: __("A Grade||Nota A"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Achieve 90% accuracy in a song||Alcanza 90% de precisión en una canción"),
      achieved: __("You achieved 90% accuracy in a song!||¡Alcanzaste 90% de precisión en una canción!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: (_, song) => song.accuracy >= 90,
    hidden: false
  },
  {
    id: "accuracy_95",
    name: __("S Grade||Nota S"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Achieve 95% accuracy in a song||Alcanza 95% de precisión en una canción"),
      achieved: __("You achieved 95% accuracy in a song!||¡Alcanzaste 95% de precisión en una canción!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: (_, song) => song.accuracy >= 95,
    hidden: false
  },
  {
    id: "accuracy_99",
    name: __("SS Grade||Nota SS"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Achieve 99% accuracy in a song||Alcanza 99% de precisión en una canción"),
      achieved: __("You achieved 99% accuracy in a song!||¡Alcanzaste 99% de precisión en una canción!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: (_, song) => song.accuracy >= 99,
    hidden: false
  },
  {
    id: "no_boo_game",
    name: __("Clean Play||Juego Limpio"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Complete a song without any Boo judgements||Completa una canción sin juicios Boo"),
      achieved: __("You completed a song without any Boo judgements!||¡Completaste una canción sin juicios Boo!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: (_, song) => song.complete && song.judgements.boo <= 0,
    hidden: false
  },
  {
    id: "only_perfect_plus",
    name: __("Perfect+ Only||Solo Perfect+"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Get only Marvelous and Perfect judgements||Obtén solo juicios Marvelous y Perfect"),
      achieved: __("You got only Marvelous and Perfect judgements!||¡Obtuviste solo juicios Marvelous y Perfect!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: (_, song) => song.complete && song.judgements.marvelous + song.judgements.perfect >= song.totalNotes,
    hidden: false
  },
  {
    id: "speed_challenge",
    name: __("Speed Demon||Demonio de Velocidad"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Complete a song on maximum note speed||Completa una canción a velocidad máxima"),
      achieved: __("You completed a song on maximum note speed!||¡Completaste una canción a velocidad máxima!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: (_, song) => song.complete && Account.settings.noteSpeedMult >= 6,
    hidden: false
  },
  {
    id: "first_full_combo",
    name: __("First Full Combo||Primer Combo Completo"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Complete your first full combo||Completa tu primer combo completo"),
      achieved: __("You completed your first full combo!||¡Completaste tu primer combo completo!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.fullCombos >= 1,
    hidden: false
  },
  {
    id: "full_combo_5",
    name: __("Consistent Combo||Combo Consistente"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Get 5 full combos||Obtén 5 combos completos"),
      achieved: __("You got 5 full combos!||¡Obtuviste 5 combos completos!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.fullCombos >= 5,
    hidden: false
  },
  {
    id: "full_combo_25",
    name: __("Combo Master||Maestro del Combo"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Get 25 full combos||Obtén 25 combos completos"),
      achieved: __("You got 25 full combos!||¡Obtuviste 25 combos completos!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.fullCombos >= 25,
    hidden: false
  },
  {
    id: "full_combo_100",
    name: __("Unstoppable||Imparable"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Get 100 full combos||Obtén 100 combos completos"),
      achieved: __("You got 100 full combos!||¡Obtuviste 100 combos completos!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.fullCombos >= 100,
    hidden: false
  },
  {
    id: "full_combo_streak_3",
    name: __("On Fire||En Racha"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Get 3 full combos in a row||Obtén 3 combos completos seguidos"),
      achieved: __("You got 3 full combos in a row!||¡Obtuviste 3 combos completos seguidos!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.maxFullComboStreak >= 3,
    hidden: false
  },
  {
    id: "full_combo_streak_5",
    name: __("Burning Rhythm||Ritmo Ardiente"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Get 5 full combos in a row||Obtén 5 combos completos seguidos"),
      achieved: __("You got 5 full combos in a row!||¡Obtuviste 5 combos completos seguidos!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.maxFullComboStreak >= 5,
    hidden: false
  },
  {
    id: "full_combo_streak_10",
    name: __("Unstoppable Rhythm||Ritmo Imparable"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Get 10 full combos in a row||Obtén 10 combos completos seguidos"),
      achieved: __("You got 10 full combos in a row!||¡Obtuviste 10 combos completos seguidos!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.maxFullComboStreak >= 10,
    hidden: false
  },
  {
    id: "full_combo_streak_20",
    name: __("Rhythm God||Dios del Ritmo"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Get 20 full combos in a row||Obtén 20 combos completos seguidos"),
      achieved: __("You got 20 full combos in a row!||¡Obtuviste 20 combos completos seguidos!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.maxFullComboStreak >= 20,
    hidden: false
  },
  {
    id: "first_flawless",
    name: __("Flawless||Impecable"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Complete a flawless full combo||Completa un combo completo impecable"),
      achieved: __("You completed a flawless full combo!||¡Completaste un combo completo impecable!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.flawlessFullCombos >= 1,
    hidden: false
  },
  {
    id: "flawless_5",
    name: __("Flawless Master||Maestro Impecable"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Get 5 flawless full combos||Obtén 5 combos completos impecables"),
      achieved: __("You got 5 flawless full combos!||¡Obtuviste 5 combos completos impecables!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.flawlessFullCombos >= 5,
    hidden: false
  },
  {
    id: "flawless_10",
    name: __("Perfectionist||Perfeccionista"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Get 10 flawless full combos||Obtén 10 combos completos impecables"),
      achieved: __("You got 10 flawless full combos!||¡Obtuviste 10 combos completos impecables!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.flawlessFullCombos >= 10,
    hidden: false
  },
  {
    id: "flawless_streak_3",
    name: __("Perfect Run||Racha Perfecta"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Get 3 flawless full combos in a row||Obtén 3 combos completos impecables seguidos"),
      achieved: __("You got 3 flawless full combos in a row!||¡Obtuviste 3 combos completos impecables seguidos!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.flawlessStreak >= 3,
    hidden: false
  },
  {
    id: "absolute_flawless",
    name: __("Absolute Perfection||Perfección Absoluta"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Complete a song with only Marvelous judgements||Completa una canción solo con juicios Marvelous"),
      achieved: __("You completed a song with only Marvelous judgements!||¡Completaste una canción solo con juicios Marvelous!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.absoluteFlawless >= 1,
    hidden: false
  },
  {
    id: "first_multiplayer_game",
    name: __("Together We Play||Jugamos Juntos"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Complete your first multiplayer game||Completa tu primera partida multijugador"),
      achieved: __("You completed your first multiplayer game!||¡Completaste tu primera partida multijugador!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.multiplayerGamesPlayed >= 1,
    hidden: false
  },
  {
    id: "multiplayer_games_10",
    name: __("Co-op Player||Jugador Cooperativo"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Play 10 multiplayer games||Juega 10 partidas multijugador"),
      achieved: __("You played 10 multiplayer games!||¡Jugaste 10 partidas multijugador!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.multiplayerGamesPlayed >= 10,
    hidden: false
  },
  {
    id: "multiplayer_games_50",
    name: __("Multiplayer Veteran||Veterano Multijugador"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Play 50 multiplayer games||Juega 50 partidas multijugador"),
      achieved: __("You played 50 multiplayer games!||¡Jugaste 50 partidas multijugador!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.multiplayerGamesPlayed >= 50,
    hidden: false
  },
  {
    id: "multiplayer_games_100",
    name: __("Versus Master||Maestro del Versus"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Play 100 multiplayer games||Juega 100 partidas multijugador"),
      achieved: __("You played 100 multiplayer games!||¡Jugaste 100 partidas multijugador!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.multiplayerGamesPlayed >= 100,
    hidden: false
  },
  {
    id: "multiplayer_games_500",
    name: __("Rivalry Legend||Leyenda de Rivalidad"),
    category: ACHIEVEMENT_CATEGORIES.GAMEPLAY,
    description: {
      unachieved: __("Play 500 multiplayer games||Juega 500 partidas multijugador"),
      achieved: __("You played 500 multiplayer games!||¡Jugaste 500 partidas multijugador!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.multiplayerGamesPlayed >= 500,
    hidden: false
  },

  // Character Achievements
  {
    id: "first_character",
    name: __("New Identity||Nueva Identidad"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Create your first character||Crea tu primer personaje"),
      achieved: __("You created your first character!||¡Creaste tu primer personaje!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.charactersCreated >= 1,
    hidden: false
  },
  {
    id: "character_collector",
    name: __("Character Collector||Coleccionista de Personajes"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Create 5 different characters||Crea 5 personajes diferentes"),
      achieved: __("You created 5 different characters!||¡Creaste 5 personajes diferentes!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.charactersCreated >= 5,
    hidden: false
  },
  {
    id: "character_archivist",
    name: __("Character Archivist||Archivista de Personajes"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Create 10 different characters||Crea 10 personajes diferentes"),
      achieved: __("You created 10 different characters!||¡Creaste 10 personajes diferentes!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.charactersCreated >= 10,
    hidden: false
  },
  {
    id: "character_level_5",
    name: __("Apprentice Dancer||Bailarín Aprendiz"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Reach character level 5||Alcanza el nivel 5 de personaje"),
      achieved: __("You reached character level 5!||¡Alcanzaste el nivel 5 de personaje!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.maxCharacterLevel >= 5,
    hidden: false
  },
  {
    id: "character_level_10",
    name: __("Seasoned Performer||Artista Experimentado"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Reach character level 10||Alcanza el nivel 10 de personaje"),
      achieved: __("You reached character level 10!||¡Alcanzaste el nivel 10 de personaje!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.maxCharacterLevel >= 10,
    hidden: false
  },
  {
    id: "character_level_20",
    name: __("Experienced Artist||Artista Experimentado"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Reach character level 20||Alcanza el nivel 20 de personaje"),
      achieved: __("You reached character level 20!||¡Alcanzaste el nivel 20 de personaje!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.maxCharacterLevel >= 20,
    hidden: false
  },
  {
    id: "character_level_30",
    name: __("Veteran Dancer||Bailarín Veterano"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Reach character level 30||Alcanza el nivel 30 de personaje"),
      achieved: __("You reached character level 30!||¡Alcanzaste el nivel 30 de personaje!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.maxCharacterLevel >= 30,
    hidden: false
  },
  {
    id: "character_level_50",
    name: __("Rhythm Legend||Leyenda del Ritmo"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Reach character level 50||Alcanza el nivel 50 de personaje"),
      achieved: __("You reached character level 50!||¡Alcanzaste el nivel 50 de personaje!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.maxCharacterLevel >= 50,
    hidden: false
  },
  {
    id: "first_skill",
    name: __("First Skill||Primera Habilidad"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Unlock your first skill||Desbloquea tu primera habilidad"),
      achieved: __("You unlocked your first skill!||¡Desbloqueaste tu primera habilidad!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.skillsUnlocked >= 1,
    hidden: false
  },
  {
    id: "skill_collector",
    name: __("Skill Collector||Coleccionista de Habilidades"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Unlock 5 different skills||Desbloquea 5 habilidades diferentes"),
      achieved: __("You unlocked 5 different skills!||¡Desbloqueaste 5 habilidades diferentes!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.skillsUnlocked >= 5,
    hidden: false
  },
  {
    id: "skill_master",
    name: __("Skill Master||Maestro de Habilidades"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Unlock 10 different skills||Desbloquea 10 habilidades diferentes"),
      achieved: __("You unlocked 10 different skills!||¡Desbloqueaste 10 habilidades diferentes!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.skillsUnlocked >= 10,
    hidden: false
  },
  {
    id: "skill_grandmaster",
    name: __("Skill Grandmaster||Gran Maestro de Habilidades"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Unlock 20 different skills||Desbloquea 20 habilidades diferentes"),
      achieved: __("You unlocked 20 different skills!||¡Desbloqueaste 20 habilidades diferentes!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.skillsUnlocked >= 20,
    hidden: false
  },
  {
    id: "skill_legend",
    name: __("Skill Legend||Leyenda de Habilidades"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Unlock 30 different skills||Desbloquea 30 habilidades diferentes"),
      achieved: __("You unlocked 30 different skills!||¡Desbloqueaste 30 habilidades diferentes!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.skillsUnlocked >= 30,
    hidden: false
  },
  {
    id: "first_hair_style",
    name: __("New Look||Nuevo Look"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Unlock a new hair style||Desbloquea un nuevo peinado"),
      achieved: __("You unlocked a new hair style!||¡Desbloqueaste un nuevo peinado!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.charactersCreated >= 1,
    hidden: false
  },
  {
    id: "fashion_collector",
    name: __("Fashion Collector||Coleccionista de Moda"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Unlock 5 different clothing items||Desbloquea 5 prendas diferentes"),
      achieved: __("You unlocked 5 different clothing items!||¡Desbloqueaste 5 prendas diferentes!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.charactersCreated >= 2,
    hidden: false
  },
  {
    id: "fashion_icon",
    name: __("Fashion Icon||Icono de Moda"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Unlock 10 different clothing items||Desbloquea 10 prendas diferentes"),
      achieved: __("You unlocked 10 different clothing items!||¡Desbloqueaste 10 prendas diferentes!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.charactersCreated >= 3,
    hidden: false
  },
  {
    id: "accessory_hunter",
    name: __("Accessory Hunter||Cazador de Accesorios"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Unlock 5 different accessories||Desbloquea 5 accesorios diferentes"),
      achieved: __("You unlocked 5 different accessories!||¡Desbloqueaste 5 accesorios diferentes!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.charactersCreated >= 2,
    hidden: false
  },
  {
    id: "max_skill_level",
    name: __("Maxed Out||Al Máximo"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Reach maximum skill level with a character||Alcanza el nivel máximo de habilidad con un personaje"),
      achieved: __("You reached maximum skill level with a character!||¡Alcanzaste el nivel máximo de habilidad con un personaje!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.maxCharacterLevel >= CHARACTER_SYSTEM.MAX_SKILL_LEVEL,
    hidden: false
  },
  {
    id: "character_perfection",
    name: __("Character Perfection||Perfección de Personaje"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Max out all character stats||Maximiza todas las estadísticas del personaje"),
      achieved: __("You maxed out all character stats!||¡Maximizaste todas las estadísticas del personaje!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.maxCharacterLevel >= 50 && stats.skillsUnlocked >= 30,
    hidden: false
  },
  {
    id: "name_master",
    name: __("Name Master||Maestro de Nombres"),
    category: ACHIEVEMENT_CATEGORIES.CHARACTER,
    description: {
      unachieved: __("Create a character with maximum name length||Crea un personaje con el nombre más largo posible"),
      achieved: __("You created a character with maximum name length!||¡Creaste un personaje con el nombre más largo posible!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.charactersCreated >= 1,
    hidden: false
  },

  // Progression Achievements
  {
    id: "games_10",
    name: __("Dedicated Player||Jugador Dedicado"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Play 10 games||Juega 10 partidas"),
      achieved: __("You played 10 games!||¡Jugaste 10 partidas!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalGamesPlayed >= 25,
    hidden: false
  },
  {
    id: "games_25",
    name: __("Regular Player||Jugador Regular"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Play 25 games||Juega 25 partidas"),
      achieved: __("You played 25 games!||¡Jugaste 25 partidas!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalGamesPlayed >= 25,
    hidden: false
  },
  {
    id: "games_50",
    name: __("Rhythm Enthusiast||Entusiasta del Ritmo"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Play 50 games||Juega 50 partidas"),
      achieved: __("You played 50 games!||¡Jugaste 50 partidas!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalGamesPlayed >= 50,
    hidden: false
  },
  {
    id: "games_100",
    name: __("Addicted to Rhythm||Adicto al Ritmo"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Play 100 games||Juega 100 partidas"),
      achieved: __("You played 100 games!||¡Jugaste 100 partidas!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.totalGamesPlayed >= 250,
    hidden: false
  },
  {
    id: "streak_3",
    name: __("Consistent Player||Jugador Constante"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Maintain a 3-day play streak||Mantén una racha de 3 días jugando"),
      achieved: __("You maintained a 3-day play streak!||¡Mantuviste una racha de 3 días jugando!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.currentStreak >= 3,
    hidden: false
  },
  {
    id: "streak_7",
    name: __("Weekly Warrior||Guerrero Semanal"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Maintain a 7-day play streak||Mantén una racha de 7 días jugando"),
      achieved: __("You maintained a 7-day play streak!||¡Mantuviste una racha de 7 días jugando!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.currentStreak >= 7,
    hidden: false
  },
  {
    id: "streak_14",
    name: __("Fortnight Fanatic||Fanático de Quince Días"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Maintain a 14-day play streak||Mantén una racha de 14 días jugando"),
      achieved: __("You maintained a 14-day play streak!||¡Mantuviste una racha de 14 días jugando!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.currentStreak >= 14,
    hidden: false
  },
  {
    id: "streak_30",
    name: __("Monthly Master||Maestro Mensual"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Maintain a 30-day play streak||Mantén una racha de 30 días jugando"),
      achieved: __("You maintained a 30-day play streak!||¡Mantuviste una racha de 30 días jugando!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.currentStreak >= 30,
    hidden: false
  },
  {
    id: "streak_90",
    name: __("Seasoned Veteran||Veterano Experimentado"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Maintain a 90-day play streak||Mantén una racha de 90 días jugando"),
      achieved: __("You maintained a 90-day play streak!||¡Mantuviste una racha de 90 días jugando!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.currentStreak >= 90,
    hidden: false
  },
  {
    id: "first_high_score",
    name: __("High Scorer||Puntuación Alta"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Set your first high score||Establece tu primera puntuación alta"),
      achieved: __("You set your first high score!||¡Estableciste tu primera puntuación alta!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.highScoresSet >= 1,
    hidden: false
  },
  {
    id: "high_score_master",
    name: __("High Score Hunter||Cazador de Puntuaciones Altas"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Set 10 high scores||Establece 10 puntuaciones altas"),
      achieved: __("You set 10 high scores!||¡Estableciste 10 puntuaciones altas!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.highScoresSet >= 10,
    hidden: false
  },
  {
    id: "high_score_expert",
    name: __("High Score Expert||Experto en Puntuaciones Altas"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Set 25 high scores||Establece 25 puntuaciones altas"),
      achieved: __("You set 25 high scores!||¡Estableciste 25 puntuaciones altas!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.highScoresSet >= 25,
    hidden: false
  },
  {
    id: "high_score_legend",
    name: __("High Score Legend||Leyenda de Puntuaciones Altas"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Set 50 high scores||Establece 50 puntuaciones altas"),
      achieved: __("You set 50 high scores!||¡Estableciste 50 puntuaciones altas!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.highScoresSet >= 50,
    hidden: false
  },
  {
    id: "total_score_1m",
    name: __("Million Points||Millón de Puntos"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Reach 1 million total score||Alcanza 1 millón de puntos totales"),
      achieved: __("You reached 1 million total score!||¡Alcanzaste 1 millón de puntos totales!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalScore >= 1000000,
    hidden: false
  },
  {
    id: "total_score_10m",
    name: __("Ten Million Points||Diez Millones de Puntos"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Reach 10 million total score||Alcanza 10 millones de puntos totales"),
      achieved: __("You reached 10 million total score!||¡Alcanzaste 10 millones de puntos totales!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalScore >= 10000000,
    hidden: false
  },
  {
    id: "total_score_100m",
    name: __("Hundred Million Points||Cien Millones de Puntos"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Reach 100 million total score||Alcanza 100 millones de puntos totales"),
      achieved: __("You reached 100 million total score!||¡Alcanzaste 100 millones de puntos totales!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.totalScore >= 100000000,
    hidden: false
  },
  {
    id: "notes_1000",
    name: __("Thousand Notes||Mil Notas"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Hit 1000 notes total||Acierta 1000 notas en total"),
      achieved: __("You hit 1000 notes total!||¡Acertaste 1000 notas en total!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalNotesHit >= 1000,
    hidden: false
  },
  {
    id: "notes_10000",
    name: __("Ten Thousand Notes||Diez Mil Notas"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Hit 10,000 notes total||Acierta 10,000 notas en total"),
      achieved: __("You hit 10,000 notes total!||¡Acertaste 10,000 notas en total!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalNotesHit >= 10000,
    hidden: false
  },
  {
    id: "notes_100000",
    name: __("Hundred Thousand Notes||Cien Mil Notas"),
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
    description: {
      unachieved: __("Hit 100,000 notes total||Acierta 100,000 notas en total"),
      achieved: __("You hit 100,000 notes total!||¡Acertaste 100,000 notas en total!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalNotesHit >= 100000,
    hidden: false
  },

  // Time Achievements
  {
    id: "time_1_hour",
    name: __("Hour of Rhythm||Hora de Ritmo"),
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: __("Play for 1 hour total||Juega durante 1 hora en total"),
      achieved: __("You played for 1 hour total!||¡Jugaste durante 1 hora en total!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalTimePlayed >= 3600,
    hidden: false
  },
  {
    id: "time_5_hours",
    name: __("Rhythm Enthusiast||Entusiasta del Ritmo"),
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: __("Play for 5 hours total||Juega durante 5 horas en total"),
      achieved: __("You played for 5 hours total!||¡Jugaste durante 5 horas en total!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalTimePlayed >= 18000,
    hidden: false
  },
  {
    id: "time_10_hours",
    name: __("Dedicated Dancer||Bailarín Dedicado"),
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: __("Play for 10 hours total||Juega durante 10 horas en total"),
      achieved: __("You played for 10 hours total!||¡Jugaste durante 10 horas en total!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalTimePlayed >= 36000,
    hidden: false
  },
  {
    id: "time_24_hours",
    name: __("Rhythm Marathon||Maratón de Ritmo"),
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: __("Play for 24 hours total||Juega durante 24 horas en total"),
      achieved: __("You played for 24 hours total!||¡Jugaste durante 24 horas en total!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.totalTimePlayed >= 86400,
    hidden: false
  },
  {
    id: "time_100_hours",
    name: __("Rhythm Master||Maestro del Ritmo"),
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: __("Play for 100 hours total||Juega durante 100 horas en total"),
      achieved: __("You played for 100 hours total!||¡Jugaste durante 100 horas en total!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.totalTimePlayed >= 360000,
    hidden: false
  },
  {
    id: "session_30_min",
    name: __("Focused Session||Sesión Enfocada"),
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: __("Play a single session for 30 minutes||Juega una sesión de 30 minutos"),
      achieved: __("You played a single session for 30 minutes!||¡Jugaste una sesión de 30 minutos!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.longestSession >= 1800,
    hidden: false
  },
  {
    id: "session_1_hour",
    name: __("Extended Session||Sesión Extendida"),
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: __("Play a single session for 1 hour||Juega una sesión de 1 hora"),
      achieved: __("You played a single session for 1 hour!||¡Jugaste una sesión de 1 hora!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.longestSession >= 3600,
    hidden: false
  },
  {
    id: "session_2_hours",
    name: __("Marathon Session||Sesión Maratón"),
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: __("Play a single session for 2 hours||Juega una sesión de 2 horas"),
      achieved: __("You played a single session for 2 hours!||¡Jugaste una sesión de 2 horas!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.longestSession >= 7200,
    hidden: false
  },
  {
    id: "session_4_hours",
    name: __("Ultra Marathon||Ultra Maratón"),
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: __("Play a single session for 4 hours||Juega una sesión de 4 horas"),
      achieved: __("You played a single session for 4 hours!||¡Jugaste una sesión de 4 horas!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.LEGENDARY,
    condition: stats => stats.longestSession >= 14400,
    hidden: false
  },
  {
    id: "early_bird",
    name: __("Early Bird||Madrugador"),
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: __("Play between 5 AM and 9 AM||Juega entre las 5 AM y 9 AM"),
      achieved: __("You played between 5 AM and 9 AM!||¡Jugaste entre las 5 AM y 9 AM!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.playedEarlyMorning,
    hidden: false
  },
  {
    id: "night_owl",
    name: __("Night Owl||Búho Nocturno"),
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: __("Play between midnight and 4 AM||Juega entre la medianoche y las 4 AM"),
      achieved: __("You played between midnight and 4 AM!||¡Jugaste entre la medianoche y las 4 AM!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.playedAtNight,
    hidden: false
  },
  {
    id: "weekend_warrior",
    name: __("Weekend Warrior||Guerrero de Fin de Semana"),
    category: ACHIEVEMENT_CATEGORIES.TIME,
    description: {
      unachieved: __("Play on a weekend||Juega durante el fin de semana"),
      achieved: __("You played on a weekend!||¡Jugaste durante el fin de semana!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.playedWeekend,
    hidden: false
  },
  {
    id: "holiday_player",
    name: __("Holiday Player||Jugador Festivo"),
    category: ACHIEVEMENT_CATEGORIES.HOLIDAYS,
    description: {
      unachieved: __("Play on a holiday||Juega en un día festivo"),
      achieved: __("You played on a holiday!||¡Jugaste en un día festivo!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.playedHoliday,
    hidden: false
  },

  // Editor Achievements
  {
    id: "first_arrow_placed",
    name: __("First Step||Primer Paso"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Place your first arrow in the editor||Coloca tu primera flecha en el editor"),
      achieved: __("You placed your first arrow!||¡Colocaste tu primera flecha!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalPlacedArrows >= 1,
    hidden: false
  },
  {
    id: "arrow_master",
    name: __("Arrow Architect||Arquitecto de Flechas"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Place 100 arrows in the editor||Coloca 100 flechas en el editor"),
      achieved: __("You placed 100 arrows!||¡Colocaste 100 flechas!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalPlacedArrows >= 100,
    hidden: false
  },
  {
    id: "arrow_expert",
    name: __("Pattern Weaver||Tejedor de Patrones"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Place 500 arrows in the editor||Coloca 500 flechas en el editor"),
      achieved: __("You placed 500 arrows!||¡Colocaste 500 flechas!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalPlacedArrows >= 500,
    hidden: false
  },
  {
    id: "arrow_legend",
    name: __("Stepchart Legend||Leyenda del Stepchart"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Place 1000 arrows in the editor||Coloca 1000 flechas en el editor"),
      achieved: __("You placed 1000 arrows!||¡Colocaste 1000 flechas!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalPlacedArrows >= 1000,
    hidden: false
  },
  {
    id: "first_freeze_placed",
    name: __("Hold On||Espera"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Place your first freeze arrow||Coloca tu primera flecha de presión"),
      achieved: __("You placed your first freeze arrow!||¡Colocaste tu primera flecha de presión!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalPlacedFreezes >= 1,
    hidden: false
  },
  {
    id: "freeze_master",
    name: __("Hold Master||Maestro de Presión"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Place 50 freeze arrows||Coloca 50 flechas de presión"),
      achieved: __("You placed 50 freeze arrows!||¡Colocaste 50 flechas de presión!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalPlacedFreezes >= 50,
    hidden: false
  },
  {
    id: "freeze_artist",
    name: __("Sustain Artist||Artista de Sostenido"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Place 200 freeze arrows||Coloca 200 flechas de presión"),
      achieved: __("You placed 200 freeze arrows!||¡Colocaste 200 flechas de presión!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalPlacedFreezes >= 200,
    hidden: false
  },
  {
    id: "first_mine_placed",
    name: __("Danger Zone||Zona de Peligro"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Place your first mine||Coloca tu primera mina"),
      achieved: __("You placed your first mine!||¡Colocaste tu primera mina!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalPlacedMines >= 1,
    hidden: false
  },
  {
    id: "mine_layer",
    name: __("Mine Layer||Colocador de Minas"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Place 25 mines||Coloca 25 minas"),
      achieved: __("You placed 25 mines!||¡Colocaste 25 minas!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalPlacedMines >= 25,
    hidden: false
  },
  {
    id: "mine_expert",
    name: __("Trap Master||Maestro de Trampas"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Place 100 mines||Coloca 100 minas"),
      achieved: __("You placed 100 mines!||¡Colocaste 100 minas!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalPlacedMines >= 100,
    hidden: false
  },
  {
    id: "first_chart_created",
    name: __("Chart Creator||Creador de Charts"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Create your first complete chart||Crea tu primer chart completo"),
      achieved: __("You created your first complete chart!||¡Creaste tu primer chart completo!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.chartsCreated >= 1,
    hidden: false
  },
  {
    id: "chart_creator",
    name: __("Prolific Creator||Creador Prolífico"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Create 5 complete charts||Crea 5 charts completos"),
      achieved: __("You created 5 complete charts!||¡Creaste 5 charts completos!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.chartsCreated >= 5,
    hidden: false
  },
  {
    id: "chart_master",
    name: __("Chart Master||Maestro de Charts"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Create 10 complete charts||Crea 10 charts completos"),
      achieved: __("You created 10 complete charts!||¡Creaste 10 charts completos!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.chartsCreated >= 10,
    hidden: false
  },
  {
    id: "first_song_imported",
    name: __("Music Importer||Importador de Música"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Import your first song||Importa tu primera canción"),
      achieved: __("You imported your first song!||¡Importaste tu primera canción!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalImportedSongs >= 1,
    hidden: false
  },
  {
    id: "song_collector",
    name: __("Music Collector||Coleccionista de Música"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Import 5 songs||Importa 5 canciones"),
      achieved: __("You imported 5 songs!||¡Importaste 5 canciones!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalImportedSongs >= 5,
    hidden: false
  },
  {
    id: "music_archivist",
    name: __("Music Archivist||Archivista Musical"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Import 10 songs||Importa 10 canciones"),
      achieved: __("You imported 10 songs!||¡Importaste 10 canciones!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalImportedSongs >= 10,
    hidden: false
  },
  {
    id: "first_song_exported",
    name: __("Chart Exporter||Exportador de Charts"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Export your first chart||Exporta tu primer chart"),
      achieved: __("You exported your first chart!||¡Exportaste tu primer chart!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalExportedSongs >= 1,
    hidden: false
  },
  {
    id: "song_exporter",
    name: __("Content Creator||Creador de Contenido"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Export 5 charts||Exporta 5 charts"),
      achieved: __("You exported 5 charts!||¡Exportaste 5 charts!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalExportedSongs >= 5,
    hidden: false
  },
  {
    id: "chart_publisher",
    name: __("Chart Publisher||Publicador de Charts"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Export 10 charts||Exporta 10 charts"),
      achieved: __("You exported 10 charts!||¡Exportaste 10 charts!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.totalExportedSongs >= 10,
    hidden: false
  },
  {
    id: "editor_time_1_hour",
    name: __("Editor Apprentice||Aprendiz de Editor"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Spend 1 hour in the editor||Pasa 1 hora en el editor"),
      achieved: __("You spent 1 hour in the editor!||¡Pasaste 1 hora en el editor!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.editorTimeSpent >= 3600,
    hidden: false
  },
  {
    id: "editor_time_5_hours",
    name: __("Editor Enthusiast||Entusiasta del Editor"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Spend 5 hours in the editor||Pasa 5 horas en el editor"),
      achieved: __("You spent 5 hours in the editor!||¡Pasaste 5 horas en el editor!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.editorTimeSpent >= 18000,
    hidden: false
  },
  {
    id: "editor_time_10_hours",
    name: __("Editor Veteran||Veterano del Editor"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Spend 10 hours in the editor||Pasa 10 horas en el editor"),
      achieved: __("You spent 10 hours in the editor!||¡Pasaste 10 horas en el editor!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.editorTimeSpent >= 36000,
    hidden: false
  },
  {
    id: "editor_time_24_hours",
    name: __("Editor Master||Maestro del Editor"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Spend 24 hours in the editor||Pasa 24 horas en el editor"),
      achieved: __("You spent 24 hours in the editor!||¡Pasaste 24 horas en el editor!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.editorTimeSpent >= 86400,
    hidden: false
  },
  {
    id: "difficulty_setter",
    name: __("Difficulty Designer||Diseñador de Dificultades"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Set difficulty ratings for 5 charts||Establece niveles de dificultad para 5 charts"),
      achieved: __("You set difficulty ratings for 5 charts!||¡Estableciste niveles de dificultad para 5 charts!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.chartsWithDifficultySet >= 5,
    hidden: false
  },
  {
    id: "all_note_types",
    name: __("Note Variety Expert||Experto en Variedad de Notas"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Use all note types in a single chart||Usa todos los tipos de notas en un solo chart"),
      achieved: __("You used all note types in a single chart!||¡Usaste todos los tipos de notas en un solo chart!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.usedAllNoteTypesInChart,
    hidden: false
  },
  {
    id: "chart_test_play",
    name: __("Quality Tester||Probador de Calidad"),
    category: ACHIEVEMENT_CATEGORIES.EDITOR,
    description: {
      unachieved: __("Test play your own chart||Prueba tu propio chart"),
      achieved: __("You test played your own chart!||¡Probaste tu propio chart!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.chartsTestPlayed >= 1,
    hidden: false
  },

  // Mastery Achievements
  {
    id: "all_difficulties",
    name: __("Versatile Player||Jugador Versátil"),
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: __("Complete songs on all difficulty types||Completa canciones en todos los tipos de dificultad"),
      achieved: __("You completed songs on all difficulty types!||¡Completaste canciones en todos los tipos de dificultad!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalBeginnerGamesPlayed && stats.totalEasyGamesPlayed && stats.totalMediumGamesPlayed && stats.totalHardGamesPlayed && stats.totalChallengeGamesPlayed && stats.totalEditGamesPlayed,
    hidden: false
  },
  {
    id: "beginner_master",
    name: __("Beginner Master||Maestro Principiante"),
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: __("Complete 25 Beginner difficulty charts||Completa 25 charts de dificultad Principiante"),
      achieved: __("You completed 25 Beginner difficulty charts!||¡Completaste 25 charts de dificultad Principiante!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalBeginnerGamesPlayed >= 25,
    hidden: false
  },
  {
    id: "easy_master",
    name: __("Easy Master||Maestro Fácil"),
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: __("Complete 25 Easy difficulty charts||Completa 25 charts de dificultad Fácil"),
      achieved: __("You completed 25 Easy difficulty charts!||¡Completaste 25 charts de dificultad Fácil!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.totalEasyGamesPlayed >= 25,
    hidden: false
  },
  {
    id: "medium_master",
    name: __("Medium Master||Maestro Medio"),
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: __("Complete 25 Medium difficulty charts||Completa 25 charts de dificultad Media"),
      achieved: __("You completed 25 Medium difficulty charts!||¡Completaste 25 charts de dificultad Media!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.totalMediumGamesPlayed >= 25,
    hidden: false
  },
  {
    id: "hard_master",
    name: __("Hard Master||Maestro Difícil"),
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: __("Complete 25 Hard difficulty charts||Completa 25 charts de dificultad Difícil"),
      achieved: __("You completed 25 Hard difficulty charts!||¡Completaste 25 charts de dificultad Difícil!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: stats => stats.totalHardGamesPlayed >= 25,
    hidden: false
  },
  {
    id: "challenge_master",
    name: __("Challenge Master||Maestro del Desafío"),
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: __("Complete 25 Challenge difficulty charts||Completa 25 charts de dificultad Desafío"),
      achieved: __("You completed 25 Challenge difficulty charts!||¡Completaste 25 charts de dificultad Desafío!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: stats => stats.totalChallengeGamesPlayed >= 25,
    hidden: false
  },
  {
    id: "difficulty_11",
    name: __("Expert Player||Jugador Experto"),
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: __("Complete a difficulty 11 chart||Completa un chart de dificultad 11"),
      achieved: __("You completed a difficulty 11 chart!||¡Completaste un chart de dificultad 11!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
    condition: (_, song) => song.complete && song.difficultyRating >= 11,
    hidden: false
  },
  {
    id: "difficulty_15",
    name: __("Master Player||Jugador Maestro"),
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: __("Complete a difficulty 15 song||Completa una canción de dificultad 15"),
      achieved: __("You completed a difficulty 15 song!||¡Completaste una canción de dificultad 15!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: (_, song) => song.complete && song.difficultyRating >= 15,
    hidden: false
  },
  {
    id: "difficulty_25",
    name: __("Just... Don't know what to say||Solo... No sé qué decir"),
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: __("Complete a difficulty 25 song||Completa una canción de dificultad 25"),
      achieved: __("You completed a difficulty 25 song!||¡Completaste una canción de dificultad 25!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.EPIC,
    condition: (_, song) => song.complete && song.difficultyRating >= 15,
    hidden: false
  },
  {
    id: "skill_spammer",
    name: __("Skill Spammer||Spam de Habilidades"),
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: __("Use 5 skills in a single game||Usa 5 habilidades en una sola partida"),
      achieved: __("You used 5 skills in a single game!||¡Usaste 5 habilidades en una sola partida!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: stats => stats.maxSkillsInGame >= 5,
    hidden: false
  },
  {
    id: "skill_expert",
    name: __("Skill Expert||Experto en Habilidades"),
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    description: {
      unachieved: __("Use 10 skills in a single game||Usa 10 habilidades en una sola partida"),
      achieved: __("You used 10 skills in a single game!||¡Usaste 10 habilidades en una sola partida!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.maxSkillsInGame >= 10,
    hidden: false
  },
  
  // TODO: Multiplayer achievements 

  // Miscellaneous
  {
    id: "submit_bug_report",
    name: __("Crash Tester||Probador de Fallos"),
    category: ACHIEVEMENT_CATEGORIES.MISC,
    description: {
      unachieved: __("Submit a bug report||Envía un reporte de error"),
      achieved: __("You submitted a bug report!||¡Enviaste un reporte de error!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.submittedBugReport,
    hidden: false
  },
  {
    id: "submit_rating",
    name: __("Review it!||¡Reséñalo!"),
    category: ACHIEVEMENT_CATEGORIES.MISC,
    description: {
      unachieved: __("Submit a review about this game||Envía una reseña sobre este juego"),
      achieved: __("You submitted a review! Thank you!||¡Enviaste una reseña! ¡Gracias!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.gameRated,
    hidden: false
  },
  {
    id: "submit_feature_request",
    name: __("Hmm... Maybe add this||Mmm... Quizás añadir esto"),
    category: ACHIEVEMENT_CATEGORIES.MISC,
    description: {
      unachieved: __("Request a feature||Solicita una funcionalidad"),
      achieved: __("You requested a feature!||¡Solicitaste una funcionalidad!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.UNCOMMON,
    condition: stats => stats.featureRequestPrompted,
    hidden: false
  },
  {
    id: "community_explorer",
    name: __("Community Explorer||Explorador de la Comunidad"),
    category: ACHIEVEMENT_CATEGORIES.MISC,
    description: {
      unachieved: __("Visit the community homepage||Visita la página de la comunidad"),
      achieved: __("You visited the community!||¡Visitaste la comunidad!")
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: (stats) => stats.wentToCommunity,
    hidden: false
  }
];