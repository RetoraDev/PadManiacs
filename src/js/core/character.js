// Character system constants
const CHARACTER_SYSTEM = {
  MAX_NAME_LENGTH: 12,
  DEFAULT_CHARACTER: "EIRI",
  MAX_SKILL_LEVEL: 8,
  EXPERIENCE_CURVE: level => Math.floor(10 * Math.pow(level, 1.03)),
  HAIR_UNLOCK_CHANCE: 0.4,
  ITEM_UNLOCK_CHANCE: 0.5,
  SKILL_UNLOCK_CHANCE: 0.6,
  SKILL_LEVEL_UP_CHANCE: 0.4,
  MIN_LEVEL_FOR_HAIR: 2,
  MIN_LEVEL_FOR_ITEM: 3,
  MIN_LEVEL_FOR_SKILL: 4,
  SKILL_COOLDOWN_LEVELS: 1,
  HAIR_COOLDOWN_LEVELS: 2,
  ITEM_COOLDOWN_LEVELS: 2,
  PORTRAIT_CROP: { x: 43, y: 11, w: 15, h: 15 },
  CLOSE_SHOT_CROP: { x: 36, y: 15, w: 46, h: 7 },
  HAIR_STYLES: {
    front: [
      { name: "Casual", description: "Relaxed and effortless style that frames the face naturally." },
      { name: "Smart", description: "Clean and polished look with a sophisticated edge." },
      { name: "Daring", description: "Bold and eye-catching with an adventurous spirit." },
      { name: "Simple", description: "Minimalist and understated elegance at its finest." },
      { name: "Bulky", description: "Voluminous and full of personality for a commanding presence." },
      { name: "Afro", description: "Celebrating natural texture with a bold, iconic silhouette." },
      { name: "Emotional", description: "Expressive and artistic with a touch of drama." },
      { name: "Clean", description: "Crisp and precise with sharp, defined lines." }
    ],
    back: [
      { name: "Casual", description: "Laid-back and natural flowing style." },
      { name: "Smart", description: "Sleek and well-groomed from every angle." },
      { name: "Curly", description: "Bouncy and playful with beautiful defined curls." },
      { name: "Ponytails", description: "Playful and energetic with twin tails full of character." },
      { name: "Short", description: "Chic and modern with a bold, cropped silhouette." },
      { name: "Afro", description: "Natural and iconic with full, rounded volume." },
      { name: "Diva", description: "Glamorous and show-stopping with undeniable presence." },
      { name: "Clean", description: "Neat and refined with perfect symmetry." }
    ]
  },
  SKIN_TONES: [
    { name: "Lighter", description: "Fair porcelain tone with a delicate, ethereal quality." },
    { name: "Light", description: "Soft warm complexion with a natural glow." },
    { name: "Medium", description: "Balanced earthy tone with healthy warmth." },
    { name: "Tan", description: "Rich sun-kissed warmth with golden undertones." },
    { name: "Another", description: "Unique and distinct tone for those who stand out." }
  ],
  NAME_SYLLABLES: [
    // Two of these syllables are joined together to make anime style character name
    
    // Basic vowels and common starters
    "A",   "E",   "I",   "O",   "U",
    "AI",  "AO",  "EI",  "IO",  "OU",
    "KA",  "KI",  "KU",  "KE",  "KO",
    "SA",  "SI",  "SU",  "SE",  "SO",
    
    // Standard consonants + vowel combos
    "TA",  "TI",  "TU",  "TE",  "TO",
    "NA",  "NI",  "NU",  "NE",  "NO",
    "HA",  "HI",  "HU",  "HE",  "HO",
    "MA",  "MI",  "MU",  "ME",  "MO",
    
    // Common anime name endings
    "KA",  "KI",  "KU",  "KO",  "RI",
    "RA",  "RU",  "RE",  "RO",  "YA",
    "YU",  "YO",  "WA",  "WO",  "N",
    
    // Multi-syllable combinations
    "KAN", "KEN", "RIN", "REN", "HAN",
    "SHI", "SHO", "SHU", "CHA", "CHI",
    "TSU", "TSUI", "TOU", "KYO", "RYO",
    
    // Soft/gentle sounds
    "MI",  "MU",  "ME",  "MO",  "FU",
    "YU",  "YUI", "YUA", "REI", "RAI",
    "HIK", "HAR", "SOR", "KIR", "MIR",
    
    // Strong/action sounds  
    "TAI", "KEN", "RYU", "JIN", "GEN",
    "REI", "SEI", "MAI", "KAI", "GAI",
    "DAN", "RAN", "BAN", "ZAN", "MAN",
    
    // Special/unique syllables
    "LU",  "LE",  "LO",  "LA",  "LI",
    "FI",  "FA",  "FE",  "FO",  "ZE",
    "VI",  "VE",  "VO",  "XA",  "XE",
    
    // Easter eggs and fun additions
    "RIEL", "SEN", "TON", "ZA",  "ZU",
    "M",    "C.",  "K.",  "Y",   "YE",
    "WA",   "JA",  "JEI", "JO",  "LEI",
    "LOU",  "TI",  "NU",  "ES",  "SE",
    "HAT",  "NE",  "TO",  "ME",  "TA",
  ],
  PERSONALITIES: [
    {
      id: "chill",
      name: "Chill",
      description: "Relaxed and easygoing, takes things at their own pace.",
      reasons: {
        gamesPlayed: 5,
        ratingThreshold: 0.3,
        accuracyMin: 60,
        comboMin: 50,
        perfectStreakMin: 5
      },
      skillTendencies: {
        activation: ["on_combo", "on_low_health"],
        effects: ["health_regen", "combo_shield"]
      },
      eyesBehavior: [
        { distance: 3, waitMin: 2000, waitMax: 5000 },
        { distance: 0, waitMin: 100, waitMax: 300 },
        { distance: 2, waitMin: 1000, waitMax: 3000 },
        { distance: 0, waitMin: 50, waitMax: 150 },
        { distance: 3, waitMin: 2000, waitMax: 4000 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: ["focused", "steady"]
    },
    {
      id: "focused",
      name: "Focused",
      description: "Intense concentration and unwavering determination.",
      reasons: {
        gamesPlayed: 15,
        accuracyMin: 85,
        comboMin: 200,
        perfectStreakMin: 20,
        ratingThreshold: 0.8
      },
      skillTendencies: {
        activation: ["on_perfect_streak", "on_high_combo"],
        effects: ["modify_judgement_window", "modify_score_gain"]
      },
      eyesBehavior: [
        { distance: 3, waitMin: 3000, waitMax: 8000 },
        { distance: 1, waitMin: 100, waitMax: 200 },
        { distance: 3, waitMin: 2000, waitMax: 6000 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: ["perfectionist", "rhythm_savant"]
    },
    {
      id: "perfectionist",
      name: "Perfectionist",
      description: "Nothing less than perfect is acceptable.",
      reasons: {
        gamesPlayed: 25,
        accuracyMin: 95,
        perfectGames: 3,
        ratingThreshold: 0.95,
        maxMarvelous: 500
      },
      skillTendencies: {
        activation: ["on_perfect_streak"],
        effects: ["modify_judgement_window", "modify_score_gain", "stabilize_judgement"]
      },
      eyesBehavior: [
        { distance: 3, waitMin: 4000, waitMax: 10000 },
        { distance: 2, waitMin: 200, waitMax: 400 },
        { distance: 3, waitMin: 3000, waitMax: 8000 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: ["rhythm_savant"]
    },
    {
      id: "steady",
      name: "Steady",
      description: "Consistent and reliable, never misses a beat.",
      reasons: {
        gamesPlayed: 20,
        accuracyMin: 70,
        comboMin: 100,
        maxMiss: 5,
        ratingThreshold: 0.5
      },
      skillTendencies: {
        activation: ["on_combo", "on_low_health"],
        effects: ["health_regen", "modify_hold_forgiveness", "modify_roll_forgiveness"]
      },
      eyesBehavior: [
        { distance: 2, waitMin: 1000, waitMax: 3000 },
        { distance: 0, waitMin: 200, waitMax: 500 },
        { distance: 3, waitMin: 2000, waitMax: 5000 },
        { distance: 0, waitMin: 100, waitMax: 200 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: ["unbreakable"]
    },
    {
      id: "unbreakable",
      name: "Unbreakable",
      description: "No matter what happens, they never give up.",
      reasons: {
        gamesPlayed: 30,
        accuracyMin: 60,
        maxCombo: 500,
        maxMiss: 20,
        ratingThreshold: 0.4
      },
      skillTendencies: {
        activation: ["on_low_health", "on_critical_health"],
        effects: ["combo_shield", "burst_health_regen", "convert_judgement"]
      },
      eyesBehavior: [
        { distance: 3, waitMin: 1000, waitMax: 3000 },
        { distance: 0, waitMin: 500, waitMax: 1000 },
        { distance: 2, waitMin: 1000, waitMax: 3000 },
        { distance: 1, waitMin: 300, waitMax: 500 }
      ],
      blinkRandom: true,
      possibleNextPersonalities: ["determined"]
    },
    {
      id: "rhythm_savant",
      name: "Rhythm Savant",
      description: "Born with an innate sense of rhythm and timing.",
      reasons: {
        gamesPlayed: 40,
        accuracyMin: 90,
        perfectGames: 5,
        maxMarvelous: 1000,
        ratingThreshold: 0.9
      },
      skillTendencies: {
        activation: ["on_perfect_streak"],
        effects: ["modify_note_speed", "modify_judgement_window", "general_boost"]
      },
      eyesBehavior: [
        { distance: 3, waitMin: 2000, waitMax: 5000 },
        { distance: 1, waitMin: 100, waitMax: 300 },
        { distance: 3, waitMin: 3000, waitMax: 7000 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: []
    },
    {
      id: "determined",
      name: "Determined",
      description: "Nothing stands in their way. They will succeed.",
      reasons: {
        gamesPlayed: 35,
        accuracyMin: 75,
        comboMin: 300,
        maxMiss: 10,
        ratingThreshold: 0.6
      },
      skillTendencies: {
        activation: ["on_high_combo", "on_low_health"],
        effects: ["combo_shield", "modify_max_health", "modify_health_gain"]
      },
      eyesBehavior: [
        { distance: 3, waitMin: 1500, waitMax: 4000 },
        { distance: 0, waitMin: 300, waitMax: 600 },
        { distance: 3, waitMin: 2000, waitMax: 5000 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: ["unbreakable"]
    },
    {
      id: "carefree",
      name: "Carefree",
      description: "Living in the moment, enjoying every note.",
      reasons: {
        gamesPlayed: 5,
        accuracyMin: 50,
        comboMin: 30,
        ratingThreshold: 0.2
      },
      skillTendencies: {
        activation: ["on_combo"],
        effects: ["health_regen"]
      },
      eyesBehavior: [
        { distance: 3, waitMin: 1000, waitMax: 4000 },
        { distance: 2, waitMin: 100, waitMax: 300 },
        { distance: 3, waitMin: 3000, waitMax: 6000 },
        { distance: 1, waitMin: 500, waitMax: 800 }
      ],
      blinkRandom: true,
      possibleNextPersonalities: ["chill", "playful"]
    },
    {
      id: "playful",
      name: "Playful",
      description: "Full of energy and joy, turning every game into fun.",
      reasons: {
        gamesPlayed: 10,
        accuracyMin: 55,
        comboMin: 80,
        ratingThreshold: 0.35
      },
      skillTendencies: {
        activation: ["on_combo", "on_perfect_streak"],
        effects: ["modify_score_gain", "modify_note_speed"]
      },
      eyesBehavior: [
        { distance: [1, 3], waitMin: 500, waitMax: 2000 },
        { distance: 0, waitMin: 50, waitMax: 150 },
        { distance: [2, 3], waitMin: 1000, waitMax: 3000 },
        { distance: 0, waitMin: 100, waitMax: 200 }
      ],
      blinkRandom: true,
      possibleNextPersonalities: ["cheerful"]
    },
    {
      id: "cheerful",
      name: "Cheerful",
      description: "Always smiling, spreading positivity through rhythm.",
      reasons: {
        gamesPlayed: 5,
        accuracyMin: 60,
        comboMin: 150,
        perfectGames: 1,
        ratingThreshold: 0.4
      },
      skillTendencies: {
        activation: ["on_combo", "on_perfect_streak"],
        effects: ["modify_score_gain", "general_boost"]
      },
      eyesBehavior: [
        { distance: [2, 3], waitMin: 500, waitMax: 1500 },
        { distance: 0, waitMin: 100, waitMax: 250 },
        { distance: 3, waitMin: 2000, waitMax: 4000 },
        { distance: [1, 2], waitMin: 800, waitMax: 1200 }
      ],
      blinkRandom: true,
      possibleNextPersonalities: ["energetic"]
    },
    {
      id: "energetic",
      name: "Energetic",
      description: "Boundless energy that fuels every move.",
      reasons: {
        gamesPlayed: 30,
        accuracyMin: 65,
        comboMin: 200,
        perfectGames: 2,
        ratingThreshold: 0.5
      },
      skillTendencies: {
        activation: ["on_high_combo", "on_perfect_streak"],
        effects: ["modify_note_speed", "modify_score_gain", "general_boost"]
      },
      eyesBehavior: [
        { distance: 3, waitMin: 300, waitMax: 800 },
        { distance: 1, waitMin: 100, waitMax: 200 },
        { distance: 3, waitMin: 500, waitMax: 1500 },
        { distance: 0, waitMin: 50, waitMax: 100 }
      ],
      blinkRandom: true,
      possibleNextPersonalities: []
    },
    {
      id: "mysterious",
      name: "Mysterious",
      description: "Enigmatic and unpredictable, keeps everyone guessing.",
      reasons: {
        gamesPlayed: 25,
        accuracyMin: 70,
        comboMin: 120,
        ratingThreshold: 0.55
      },
      skillTendencies: {
        activation: ["on_mine_hit", "on_miss"],
        effects: ["reduce_mine_damage", "convert_judgement"]
      },
      eyesBehavior: [
        { distance: [0, 3], waitMin: 2000, waitMax: 6000 },
        { distance: 2, waitMin: 100, waitMax: 400 },
        { distance: [0, 1], waitMin: 3000, waitMax: 8000 },
        { distance: 3, waitMin: 1500, waitMax: 3000 }
      ],
      blinkRandom: true,
      possibleNextPersonalities: ["enigmatic"]
    },
    {
      id: "enigmatic",
      name: "Enigmatic",
      description: "Deep and complex, with layers of personality.",
      reasons: {
        gamesPlayed: 35,
        accuracyMin: 75,
        comboMin: 250,
        ratingThreshold: 0.6
      },
      skillTendencies: {
        activation: ["on_mine_hit", "on_low_health"],
        effects: ["reduce_mine_damage", "combo_shield", "convert_judgement"]
      },
      eyesBehavior: [
        { distance: [0, 1], waitMin: 3000, waitMax: 8000 },
        { distance: 2, waitMin: 200, waitMax: 500 },
        { distance: [0, 3], waitMin: 4000, waitMax: 10000 }
      ],
      blinkRandom: true,
      possibleNextPersonalities: []
    },
    {
      id: "serious",
      name: "Serious",
      description: "Focused and disciplined, treats every game with gravity.",
      reasons: {
        gamesPlayed: 20,
        accuracyMin: 80,
        comboMin: 200,
        ratingThreshold: 0.7
      },
      skillTendencies: {
        activation: ["on_perfect_streak", "on_high_combo"],
        effects: ["modify_judgement_window", "modify_input_lag", "stabilize_judgement"]
      },
      eyesBehavior: [
        { distance: 3, waitMin: 3000, waitMax: 7000 },
        { distance: 1, waitMin: 200, waitMax: 400 },
        { distance: 3, waitMin: 4000, waitMax: 8000 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: ["focused"]
    },
    {
      id: "dreamy",
      name: "Dreamy",
      description: "Lost in the music, dancing to their own rhythm.",
      reasons: {
        gamesPlayed: 15,
        accuracyMin: 50,
        comboMin: 40,
        ratingThreshold: 0.3
      },
      skillTendencies: {
        activation: ["on_combo"],
        effects: ["modify_note_speed"]
      },
      eyesBehavior: [
        { distance: [1, 2], waitMin: 2000, waitMax: 6000 },
        { distance: 3, waitMin: 100, waitMax: 300 },
        { distance: [2, 3], waitMin: 3000, waitMax: 8000 },
        { distance: 1, waitMin: 500, waitMax: 1000 }
      ],
      blinkRandom: true,
      possibleNextPersonalities: ["creative"]
    },
    {
      id: "creative",
      name: "Creative",
      description: "Expressive and artistic, finds beauty in every pattern.",
      reasons: {
        gamesPlayed: 25,
        accuracyMin: 60,
        comboMin: 100,
        ratingThreshold: 0.4
      },
      skillTendencies: {
        activation: ["on_perfect_streak"],
        effects: ["modify_score_gain", "stabilize_judgement"]
      },
      eyesBehavior: [
        { distance: [2, 3], waitMin: 1000, waitMax: 4000 },
        { distance: 0, waitMin: 200, waitMax: 500 },
        { distance: [1, 3], waitMin: 2000, waitMax: 6000 }
      ],
      blinkRandom: true,
      possibleNextPersonalities: ["artistic"]
    },
    {
      id: "artistic",
      name: "Artistic",
      description: "A true artist of rhythm, every move is a masterpiece.",
      reasons: {
        gamesPlayed: 35,
        accuracyMin: 70,
        comboMin: 200,
        perfectGames: 3,
        ratingThreshold: 0.6
      },
      skillTendencies: {
        activation: ["on_perfect_streak", "on_high_combo"],
        effects: ["modify_score_gain", "general_boost"]
      },
      eyesBehavior: [
        { distance: 3, waitMin: 1500, waitMax: 4000 },
        { distance: 1, waitMin: 100, waitMax: 300 },
        { distance: [2, 3], waitMin: 2000, waitMax: 5000 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: []
    },
    {
      id: "spirited",
      name: "Spirited",
      description: "Full of life and passion, plays with their heart.",
      reasons: {
        gamesPlayed: 20,
        accuracyMin: 65,
        comboMin: 150,
        ratingThreshold: 0.45
      },
      skillTendencies: {
        activation: ["on_combo", "on_low_health"],
        effects: ["health_regen", "modify_max_health"]
      },
      eyesBehavior: [
        { distance: 3, waitMin: 500, waitMax: 2000 },
        { distance: 0, waitMin: 100, waitMax: 300 },
        { distance: 3, waitMin: 1000, waitMax: 3000 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: ["energetic"]
    },
    {
      id: "gentle",
      name: "Gentle",
      description: "Soft and precise, every note is handled with care.",
      reasons: {
        gamesPlayed: 25,
        accuracyMin: 80,
        comboMin: 100,
        maxMiss: 3,
        ratingThreshold: 0.6
      },
      skillTendencies: {
        activation: ["on_combo"],
        effects: ["modify_hold_forgiveness", "modify_roll_forgiveness"]
      },
      eyesBehavior: [
        { distance: 2, waitMin: 2000, waitMax: 6000 },
        { distance: 0, waitMin: 500, waitMax: 800 },
        { distance: 3, waitMin: 3000, waitMax: 8000 },
        { distance: 1, waitMin: 200, waitMax: 400 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: ["steady"]
    },
    {
      id: "fierce",
      name: "Fierce",
      description: "Intense and powerful, dominates every chart.",
      reasons: {
        gamesPlayed: 30,
        accuracyMin: 70,
        comboMin: 300,
        ratingThreshold: 0.6
      },
      skillTendencies: {
        activation: ["on_high_combo", "on_perfect_streak"],
        effects: ["modify_note_speed", "combo_shield"]
      },
      eyesBehavior: [
        { distance: 3, waitMin: 1000, waitMax: 3000 },
        { distance: 0, waitMin: 300, waitMax: 500 },
        { distance: 3, waitMin: 1500, waitMax: 4000 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: ["determined"]
    },
    {
      id: "calm",
      name: "Calm",
      description: "Serene and composed, never loses their cool.",
      reasons: {
        gamesPlayed: 5,
        accuracyMin: 75,
        comboMin: 120,
        ratingThreshold: 0.5
      },
      skillTendencies: {
        activation: ["on_low_health", "on_critical_health"],
        effects: ["health_regen", "modify_health_gain"]
      },
      eyesBehavior: [
        { distance: 2, waitMin: 3000, waitMax: 8000 },
        { distance: 0, waitMin: 800, waitMax: 1200 },
        { distance: 3, waitMin: 4000, waitMax: 10000 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: ["zen"]
    },
    {
      id: "zen",
      name: "Zen",
      description: "At one with the rhythm, perfectly balanced.",
      reasons: {
        gamesPlayed: 40,
        accuracyMin: 85,
        comboMin: 300,
        perfectGames: 5,
        ratingThreshold: 0.8
      },
      skillTendencies: {
        activation: ["on_perfect_streak", "on_high_combo"],
        effects: ["general_boost", "stabilize_judgement"]
      },
      eyesBehavior: [
        { distance: 2, waitMin: 5000, waitMax: 12000 },
        { distance: 1, waitMin: 200, waitMax: 400 },
        { distance: 3, waitMin: 5000, waitMax: 15000 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: []
    },
    {
      id: "sassy",
      name: "Sassy",
      description: "Bold and confident, with a dash of attitude.",
      reasons: {
        gamesPlayed: 15,
        accuracyMin: 60,
        comboMin: 80,
        ratingThreshold: 0.4
      },
      skillTendencies: {
        activation: ["on_combo", "on_perfect_streak"],
        effects: ["modify_score_gain"]
      },
      eyesBehavior: [
        { distance: [0, 3], waitMin: 500, waitMax: 2000 },
        { distance: 2, waitMin: 100, waitMax: 300 },
        { distance: [1, 3], waitMin: 1000, waitMax: 3000 }
      ],
      blinkRandom: true,
      possibleNextPersonalities: ["playful"]
    },
    {
      id: "shy",
      name: "Shy",
      description: "Quiet and reserved, but brilliant when they shine.",
      reasons: {
        gamesPlayed: 15,
        accuracyMin: 70,
        comboMin: 60,
        ratingThreshold: 0.35
      },
      skillTendencies: {
        activation: ["on_combo"],
        effects: ["modify_hold_forgiveness"]
      },
      eyesBehavior: [
        { distance: 1, waitMin: 2000, waitMax: 6000 },
        { distance: 0, waitMin: 1000, waitMax: 2000 },
        { distance: 2, waitMin: 3000, waitMax: 8000 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: ["gentle"]
    },
    {
      id: "bold",
      name: "Bold",
      description: "Fearless and daring, takes on every challenge.",
      reasons: {
        gamesPlayed: 25,
        accuracyMin: 65,
        comboMin: 200,
        ratingThreshold: 0.5
      },
      skillTendencies: {
        activation: ["on_high_combo", "on_mine_hit"],
        effects: ["combo_shield", "reduce_mine_damage"]
      },
      eyesBehavior: [
        { distance: 3, waitMin: 500, waitMax: 1500 },
        { distance: 0, waitMin: 200, waitMax: 400 },
        { distance: 3, waitMin: 1000, waitMax: 3000 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: ["fierce"]
    },
    {
      id: "graceful",
      name: "Graceful",
      description: "Elegant and fluid, makes every move look effortless.",
      reasons: {
        gamesPlayed: 30,
        accuracyMin: 80,
        comboMin: 150,
        perfectGames: 2,
        ratingThreshold: 0.65
      },
      skillTendencies: {
        activation: ["on_perfect_streak"],
        effects: ["modify_roll_forgiveness", "stabilize_judgement"]
      },
      eyesBehavior: [
        { distance: 2, waitMin: 2000, waitMax: 5000 },
        { distance: 0, waitMin: 300, waitMax: 500 },
        { distance: 3, waitMin: 3000, waitMax: 7000 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: ["artistic"]
    },
    {
      id: "witty",
      name: "Witty",
      description: "Quick and sharp, always one step ahead.",
      reasons: {
        gamesPlayed: 20,
        accuracyMin: 70,
        comboMin: 150,
        ratingThreshold: 0.5
      },
      skillTendencies: {
        activation: ["on_perfect_streak", "on_mine_hit"],
        effects: ["reduce_mine_damage", "modify_input_lag"]
      },
      eyesBehavior: [
        { distance: [1, 3], waitMin: 500, waitMax: 2000 },
        { distance: 0, waitMin: 100, waitMax: 250 },
        { distance: [2, 3], waitMin: 1000, waitMax: 3000 }
      ],
      blinkRandom: true,
      possibleNextPersonalities: ["sassy"]
    },
    {
      id: "mellow",
      name: "Mellow",
      description: "Laid-back and smooth, flows with the music.",
      reasons: {
        gamesPlayed: 20,
        accuracyMin: 65,
        comboMin: 80,
        ratingThreshold: 0.4
      },
      skillTendencies: {
        activation: ["on_combo", "on_low_health"],
        effects: ["health_regen", "modify_hold_forgiveness"]
      },
      eyesBehavior: [
        { distance: 2, waitMin: 3000, waitMax: 8000 },
        { distance: 0, waitMin: 500, waitMax: 1000 },
        { distance: 3, waitMin: 4000, waitMax: 10000 },
        { distance: 1, waitMin: 200, waitMax: 400 }
      ],
      blinkRandom: false,
      possibleNextPersonalities: ["calm"]
    },
    {
      id: "spunky",
      name: "Spunky",
      description: "Full of spunk and sass, brings personality to every play.",
      reasons: {
        gamesPlayed: 18,
        accuracyMin: 55,
        comboMin: 100,
        ratingThreshold: 0.35
      },
      skillTendencies: {
        activation: ["on_combo"],
        effects: ["modify_score_gain", "modify_note_speed"]
      },
      eyesBehavior: [
        { distance: [0, 3], waitMin: 300, waitMax: 1000 },
        { distance: 1, waitMin: 100, waitMax: 200 },
        { distance: [2, 3], waitMin: 500, waitMax: 1500 }
      ],
      blinkRandom: true,
      possibleNextPersonalities: ["playful"]
    },
    {
      id: "emotive",
      name: "Emotive",
      description: "Feels every note deeply, plays with heart and soul.",
      reasons: {
        gamesPlayed: 25,
        accuracyMin: 70,
        comboMin: 120,
        perfectGames: 1,
        ratingThreshold: 0.5
      },
      skillTendencies: {
        activation: ["on_low_health", "on_critical_health"],
        effects: ["modify_health_gain", "burst_health_regen"]
      },
      eyesBehavior: [
        { distance: [1, 2], waitMin: 1000, waitMax: 4000 },
        { distance: 0, waitMin: 300, waitMax: 600 },
        { distance: [2, 3], waitMin: 2000, waitMax: 5000 },
        { distance: 0, waitMin: 100, waitMax: 200 }
      ],
      blinkRandom: true,
      possibleNextPersonalities: ["expressive"]
    },
    {
      id: "expressive",
      name: "Expressive",
      description: "Every movement tells a story, every note has meaning.",
      reasons: {
        gamesPlayed: 35,
        accuracyMin: 75,
        comboMin: 200,
        perfectGames: 3,
        ratingThreshold: 0.6
      },
      skillTendencies: {
        activation: ["on_perfect_streak", "on_high_combo"],
        effects: ["modify_score_gain", "general_boost"]
      },
      eyesBehavior: [
        { distance: [1, 3], waitMin: 800, waitMax: 2500 },
        { distance: 0, waitMin: 200, waitMax: 400 },
        { distance: [2, 3], waitMin: 1500, waitMax: 4000 },
        { distance: 1, waitMin: 300, waitMax: 500 }
      ],
      blinkRandom: true,
      possibleNextPersonalities: []
    }
  ]
};

const DEFAULT_UNLOCKED_ITEMS = [
  "top_seifuku_default",
  "bottom_skirt_blue",
  "shoes_common",
  "accessory_hair_ties"
];

const DEFAULT_CHARACTER = {
  name: "EIRI",
  level: 1,
  experience: 0,
  skillLevel: 1,
  unlockedSkills: ["focus_boost"],
  selectedSkill: "focus_boost",
  appearance: {
    skinTone: 0,
    frontHair: 1,
    backHair: 1,
    clothing: {
      accessory: null,
      top: "top_seifuku_default",
      bottom: "bottom_skirt_blue",
      shoes: "shoes_common",
      special: null 
    },
    tints: {
      hair: 0xa8705a,
      accessory: null,
      top: null,
      bottom: null,
      shoes: null,
      special: null
    }
  },
  stats: {
    gamesPlayed: 0,
    totalScore: 0,
    maxCombo: 0,
    perfectGames: 0,
    skillsUsed: 0
  },
  lastSkillLevelUp: 0
};

// Character skills list
const CHARACTER_SKILLS = [
  {
    id: "safety_net",
    name: "Safety Net",
    description: "Converts Miss judgments to Boo when activated",
    activationCondition: "on_miss",
    effect: "convert_judgement",
    effectParams: { from: "miss", to: "boo" },
    duration: 0,
    cooldown: 0
  },
  {
    id: "focus_boost",
    name: "Focus Boost",
    description: "Temporarily increases accuracy window by 20%",
    activationCondition: "on_combo",
    effect: "modify_judgement_window",
    effectParams: { multiplier: 1.2, threshold: 50 },
    duration: 5000,
    cooldown: 30000
  },
  {
    id: "health_regen",
    name: "Health Regeneration",
    description: "Regenerates 1 health per second for 10 seconds",
    activationCondition: "on_low_health",
    effect: "health_regen",
    effectParams: { amount: 1, interval: 1000, threshold: 30 },
    duration: 10000,
    cooldown: 45000
  },
  {
    id: "max_health_boost",
    name: "Max Health Boost",
    description: "Increases maximum health by 25 for 15 seconds",
    activationCondition: "on_high_combo",
    effect: "modify_max_health",
    effectParams: { amount: 25, threshold: 100 },
    duration: 15000,
    cooldown: 60000
  },
  {
    id: "time_dilation",
    name: "Time Dilation",
    description: "Slows down note speed by 15% for 8 seconds",
    activationCondition: "on_perfect_streak",
    effect: "modify_note_speed",
    effectParams: { multiplier: 0.85, threshold: 10 },
    duration: 8000,
    cooldown: 40000
  },
  {
    id: "rhythm_echo",
    name: "Rhythm Echo",
    description: "Slightly extends hold forgiveness for 12 seconds",
    activationCondition: "on_combo",
    effect: "modify_hold_forgiveness",
    effectParams: { multiplier: 1.3, threshold: 30 },
    duration: 12000,
    cooldown: 35000
  },
  {
    id: "combo_shield",
    name: "Combo Shield",
    description: "Next miss won't break combo",
    activationCondition: "on_high_combo",
    effect: "combo_shield",
    effectParams: { threshold: 75 },
    duration: 0,
    cooldown: 60000
  },
  {
    id: "precision_focus",
    name: "Precision Focus",
    description: "Reduces judgement window variation for 10 seconds",
    activationCondition: "on_perfect_streak",
    effect: "stabilize_judgement",
    effectParams: { threshold: 8 },
    duration: 10000,
    cooldown: 45000
  },
  {
    id: "recovery_boost",
    name: "Recovery Boost",
    description: "Increases health gain from hits by 50% for 15 seconds",
    activationCondition: "on_low_health",
    effect: "modify_health_gain",
    effectParams: { multiplier: 1.5, threshold: 40 },
    duration: 15000,
    cooldown: 50000
  },
  {
    id: "mine_evasion",
    name: "Mine Evasion",
    description: "Reduces mine damage by 50% for 20 seconds",
    activationCondition: "on_mine_hit",
    effect: "reduce_mine_damage",
    effectParams: { multiplier: 0.5 },
    duration: 20000,
    cooldown: 40000
  },
  {
    id: "momentum_builder",
    name: "Momentum Builder",
    description: "Slightly increases score from perfects for 12 seconds",
    activationCondition: "on_combo",
    effect: "modify_score_gain",
    effectParams: { multiplier: 1.1, judgement: "perfect", threshold: 40 },
    duration: 12000,
    cooldown: 30000
  },
  {
    id: "grace_period",
    name: "Grace Period",
    description: "Extends roll note tapping window for 10 seconds",
    activationCondition: "on_low_health",
    effect: "modify_roll_forgiveness",
    effectParams: { multiplier: 1.4, threshold: 25 },
    duration: 10000,
    cooldown: 40000
  },
  {
    id: "steady_hands",
    name: "Steady Hands",
    description: "Reduces input lag slightly for 8 seconds",
    activationCondition: "on_perfect_streak",
    effect: "modify_input_lag",
    effectParams: { reduction: 0.02, threshold: 12 },
    duration: 8000,
    cooldown: 35000
  },
  {
    id: "second_wind",
    name: "Second Wind",
    description: "Brief health regeneration when very low health",
    activationCondition: "on_critical_health",
    effect: "burst_health_regen",
    effectParams: { amount: 15, threshold: 15 },
    duration: 0,
    cooldown: 90000
  },
  {
    id: "flow_state",
    name: "Flow State",
    description: "Slightly improves all judgements for a short time",
    activationCondition: "on_high_combo",
    effect: "general_boost",
    effectParams: { windowMultiplier: 1.1, healthMultiplier: 1.2, threshold: 150 },
    duration: 6000,
    cooldown: 60000
  },
  {
    id: "rapid_recovery",
    name: "Rapid Recovery",
    description: "Quick health burst when combo reaches 25",
    activationCondition: "on_combo",
    effect: "burst_health_regen",
    effectParams: { amount: 10, threshold: 25 },
    duration: 0,
    cooldown: 30000
  },
  {
    id: "precision_flow",
    name: "Precision Flow",
    description: "Slightly widens judgement windows at 40 combo",
    activationCondition: "on_combo",
    effect: "modify_judgement_window",
    effectParams: { multiplier: 1.15, threshold: 40 },
    duration: 8000,
    cooldown: 35000
  },
  {
    id: "endurance_training",
    name: "Endurance Training",
    description: "Increases max health by 15 at 80 combo",
    activationCondition: "on_high_combo",
    effect: "modify_max_health",
    effectParams: { amount: 15, threshold: 80 },
    duration: 12000,
    cooldown: 45000
  },
  {
    id: "slow_motion",
    name: "Slow Motion",
    description: "Reduces note speed by 10% after 15 perfects",
    activationCondition: "on_perfect_streak",
    effect: "modify_note_speed",
    effectParams: { multiplier: 0.9, threshold: 15 },
    duration: 6000,
    cooldown: 40000
  },
  {
    id: "safety_cushion",
    name: "Safety Cushion",
    description: "Converts two misses to boos when health is low",
    activationCondition: "on_low_health",
    effect: "convert_judgement",
    effectParams: { from: "miss", to: "boo", threshold: 25 },
    duration: 15000,
    cooldown: 60000
  },
  {
    id: "rhythm_mastery",
    name: "Rhythm Mastery",
    description: "Extends hold forgiveness by 25% at 60 combo",
    activationCondition: "on_combo",
    effect: "modify_hold_forgiveness",
    effectParams: { multiplier: 1.25, threshold: 60 },
    duration: 10000,
    cooldown: 30000
  },
  {
    id: "roll_expert",
    name: "Roll Expert",
    description: "Increases roll forgiveness by 35% when health drops",
    activationCondition: "on_low_health",
    effect: "modify_roll_forgiveness",
    effectParams: { multiplier: 1.35, threshold: 35 },
    duration: 12000,
    cooldown: 40000
  },
  {
    id: "mine_deflector",
    name: "Mine Deflector",
    description: "Reduces mine damage by 75% after hitting a mine",
    activationCondition: "on_mine_hit",
    effect: "reduce_mine_damage",
    effectParams: { multiplier: 0.25 },
    duration: 15000,
    cooldown: 50000
  },
  {
    id: "score_amplifier",
    name: "Score Amplifier",
    description: "Increases marvelous score by 15% at 100 combo",
    activationCondition: "on_high_combo",
    effect: "modify_score_gain",
    effectParams: { multiplier: 1.15, judgement: "marvelous", threshold: 100 },
    duration: 10000,
    cooldown: 35000
  },
  {
    id: "vitality_surge",
    name: "Vitality Surge",
    description: "Boosts health gain by 75% when critically low",
    activationCondition: "on_critical_health",
    effect: "modify_health_gain",
    effectParams: { multiplier: 1.75, threshold: 20 },
    duration: 8000,
    cooldown: 45000
  },
  {
    id: "combo_anchor",
    name: "Combo Anchor",
    description: "Prevents combo break at 50 combo (one-time)",
    activationCondition: "on_high_combo",
    effect: "combo_shield",
    effectParams: { threshold: 50 },
    duration: 0,
    cooldown: 75000
  },
  {
    id: "reflex_enhancer",
    name: "Reflex Enhancer",
    description: "Reduces input lag after 8 perfects in a row",
    activationCondition: "on_perfect_streak",
    effect: "modify_input_lag",
    effectParams: { reduction: 0.015, threshold: 8 },
    duration: 5000,
    cooldown: 30000
  },
  {
    id: "graceful_recovery",
    name: "Graceful Recovery",
    description: "Converts good to great when missing",
    activationCondition: "on_miss",
    effect: "convert_judgement",
    effectParams: { from: "good", to: "great" },
    duration: 10000,
    cooldown: 40000
  },
  {
    id: "momentum_keeper",
    name: "Momentum Keeper",
    description: "Regenerates 2 health/sec for 8s at 30 combo",
    activationCondition: "on_combo",
    effect: "health_regen",
    effectParams: { amount: 2, interval: 1000, threshold: 30 },
    duration: 8000,
    cooldown: 40000
  },
  {
    id: "precision_boost",
    name: "Precision Boost",
    description: "Widens perfect window by 18% after 12 perfects",
    activationCondition: "on_perfect_streak",
    effect: "modify_judgement_window",
    effectParams: { multiplier: 1.18, threshold: 12 },
    duration: 7000,
    cooldown: 35000
  },
  {
    id: "health_reserve",
    name: "Health Reserve",
    description: "Adds 20 max health when health drops to 40%",
    activationCondition: "on_low_health",
    effect: "modify_max_health",
    effectParams: { amount: 20, threshold: 40 },
    duration: 10000,
    cooldown: 50000
  },
  {
    id: "tempo_control",
    name: "Tempo Control",
    description: "Slows notes by 12% at 120 combo",
    activationCondition: "on_high_combo",
    effect: "modify_note_speed",
    effectParams: { multiplier: 0.88, threshold: 120 },
    duration: 9000,
    cooldown: 45000
  },
  {
    id: "hold_stability",
    name: "Hold Stability",
    description: "40% longer hold forgiveness when struggling",
    activationCondition: "on_low_health",
    effect: "modify_hold_forgiveness",
    effectParams: { multiplier: 1.4, threshold: 30 },
    duration: 15000,
    cooldown: 50000
  },
  {
    id: "rapid_rolls",
    name: "Rapid Rolls",
    description: "50% more roll forgiveness at 70 combo",
    activationCondition: "on_combo",
    effect: "modify_roll_forgiveness",
    effectParams: { multiplier: 1.5, threshold: 70 },
    duration: 8000,
    cooldown: 35000
  },
  {
    id: "mine_immunity",
    name: "Mine Immunity",
    description: "90% mine damage reduction after mine hit",
    activationCondition: "on_mine_hit",
    effect: "reduce_mine_damage",
    effectParams: { multiplier: 0.1 },
    duration: 10000,
    cooldown: 60000
  },
  {
    id: "perfect_bonus",
    name: "Perfect Bonus",
    description: "20% more score from perfects at 90 combo",
    activationCondition: "on_high_combo",
    effect: "modify_score_gain",
    effectParams: { multiplier: 1.2, judgement: "perfect", threshold: 90 },
    duration: 12000,
    cooldown: 40000
  },
  {
    id: "recovery_expert",
    name: "Recovery Expert",
    description: "Double health gain when below 25% health",
    activationCondition: "on_critical_health",
    effect: "modify_health_gain",
    effectParams: { multiplier: 2.0, threshold: 25 },
    duration: 10000,
    cooldown: 55000
  },
  {
    id: "unbreakable_chain",
    name: "Unbreakable Chain",
    description: "Combo shield activates at 200 combo",
    activationCondition: "on_high_combo",
    effect: "combo_shield",
    effectParams: { threshold: 200 },
    duration: 0,
    cooldown: 90000
  },
  {
    id: "lightning_reflexes",
    name: "Lightning Reflexes",
    description: "Maximum input lag reduction after 20 perfects",
    activationCondition: "on_perfect_streak",
    effect: "modify_input_lag",
    effectParams: { reduction: 0.025, threshold: 20 },
    duration: 6000,
    cooldown: 40000
  },
  {
    id: "judgement_boost",
    name: "Judgement Boost",
    description: "Multiple improvements at high combo",
    activationCondition: "on_high_combo",
    effect: "general_boost",
    effectParams: { windowMultiplier: 1.12, healthMultiplier: 1.3, threshold: 150 },
    duration: 5000,
    cooldown: 60000
  },
  {
    id: "emergency_convert",
    name: "Emergency Convert",
    description: "Converts boo to good when health critical",
    activationCondition: "on_critical_health",
    effect: "convert_judgement",
    effectParams: { from: "boo", to: "good", threshold: 10 },
    duration: 12000,
    cooldown: 70000
  },
  {
    id: "sustained_rhythm",
    name: "Sustained Rhythm",
    description: "Long health regeneration at medium combo",
    activationCondition: "on_combo",
    effect: "health_regen",
    effectParams: { amount: 1, interval: 800, threshold: 45 },
    duration: 15000,
    cooldown: 50000
  },
  {
    id: "accuracy_focus",
    name: "Accuracy Focus",
    description: "Major window increase after perfect streak",
    activationCondition: "on_perfect_streak",
    effect: "modify_judgement_window",
    effectParams: { multiplier: 1.25, threshold: 18 },
    duration: 6000,
    cooldown: 45000
  },
  {
    id: "overdrive_health",
    name: "Overdrive Health",
    description: "Large max health boost at very high combo",
    activationCondition: "on_high_combo",
    effect: "modify_max_health",
    effectParams: { amount: 35, threshold: 180 },
    duration: 8000,
    cooldown: 70000
  },
  {
    id: "time_master",
    name: "Time Master",
    description: "Significant note slowdown for skilled play",
    activationCondition: "on_perfect_streak",
    effect: "modify_note_speed",
    effectParams: { multiplier: 0.8, threshold: 25 },
    duration: 7000,
    cooldown: 60000
  },
  {
    id: "expert_holds",
    name: "Expert Holds",
    description: "Maximum hold forgiveness extension",
    activationCondition: "on_high_combo",
    effect: "modify_hold_forgiveness",
    effectParams: { multiplier: 1.6, threshold: 130 },
    duration: 10000,
    cooldown: 40000
  },
  {
    id: "master_roller",
    name: "Master Roller",
    description: "Extreme roll forgiveness for high combo",
    activationCondition: "on_high_combo",
    effect: "modify_roll_forgiveness",
    effectParams: { multiplier: 1.8, threshold: 110 },
    duration: 9000,
    cooldown: 45000
  },
  {
    id: "score_perfection",
    name: "Score Perfection",
    description: "Massive score boost for marvelous hits",
    activationCondition: "on_perfect_streak",
    effect: "modify_score_gain",
    effectParams: { multiplier: 1.3, judgement: "marvelous", threshold: 15 },
    duration: 8000,
    cooldown: 50000
  },
  {
    id: "ultimate_recovery",
    name: "Ultimate Recovery",
    description: "Maximum health gain boost in critical state",
    activationCondition: "on_critical_health",
    effect: "modify_health_gain",
    effectParams: { multiplier: 2.5, threshold: 15 },
    duration: 12000,
    cooldown: 80000
  },
  {
    id: "perfect_flow",
    name: "Perfect Flow",
    description: "Ultimate general boost for expert players",
    activationCondition: "on_perfect_streak",
    effect: "general_boost",
    effectParams: { windowMultiplier: 1.2, healthMultiplier: 1.5, threshold: 30 },
    duration: 4000,
    cooldown: 75000
  },
  {
    id: "final_stand",
    name: "Final Stand",
    description: "Emergency health burst when near failure",
    activationCondition: "on_critical_health",
    effect: "burst_health_regen",
    effectParams: { amount: 25, threshold: 5 },
    duration: 0,
    cooldown: 120000
  },
  {
    id: "rhythm_savant",
    name: "Rhythm Savant",
    description: "Perfect input timing at extreme combo",
    activationCondition: "on_high_combo",
    effect: "modify_input_lag",
    effectParams: { reduction: 0.03, threshold: 250 },
    duration: 5000,
    cooldown: 90000
  }
];

// Character items
const CHARACTER_ITEMS = [
  // Top
  {
    id: "top_blouse",
    name: "Blouse",
    description: "A simple blouse with rolled sleeves.",
    type: "top",
    tint: 0x0f1d42,
    dyable: true
  },
  {
    id: "top_dubstep_dress",
    name: "Dubstep Dress",
    description: "A dress that pulses with rhythm. The lights react to the beat!",
    type: "top",
    layers: [
      {
        name: "Main",
        dyable: true,
        tint: 0x0f1d42
      },
      {
        name: "Lights",
        dyable: true,
        alternateTint: 0xffffff,
        alternateFrequency: 100,
        tint: 0x00cb4f
      },
    ],
    dyable: true
  },
  {
    id: "top_lencery",
    name: "Lencery",
    description: "A mysterious top with an otherworldly shimmer.",
    type: "top",
    tint: 0x352a34,
    dyable: true,
    lencery: true
  },
  {
    id: "top_office_shirt",
    name: "Office Shirt",
    description: "Business casual. Perfect for the office... or the dance floor.",
    type: "top",
    dyable: false,
  },
  {
    id: "top_seifuku",
    name: "Seifuku (Dyable)",
    description: "A classic school uniform. Customize every detail!",
    type: "top",
    layers: [
      {
        name: "Main",
        dyable: true,
        tint: 0xffffff
      },
      {
        name: "Detail 1",
        dyable: true,
        tint: 0x0f1d42
      },
      {
        name: "Detail 2",
        dyable: true,
        tint: 0xff0000
      }
    ],
    dyable: true
  },
  {
    id: "top_seifuku_default",
    name: "Seifuku",
    description: "A classic school uniform. Simple and elegant.",
    type: "top",
    dyable: false
  },
  {
    id: "top_dress",
    name: "Dress",
    description: "A flowing dress with a golden trim.",
    type: "top",
    layers: [
      {
        name: "Main",
        dyable: true,
        tint: 0xffffff
      },
      {
        name: "Detail",
        dyable: true,
        tint: 0xe8c258
      },
    ],
    dyable: true
  },
  {
    id: "top_tshirt",
    name: "T-shirt",
    description: "A casual t-shirt with a bold design.",
    type: "top",
    layers: [
      {
        name: "Main",
        dyable: true,
        tint: 0xcd4345
      },
      {
        name: "Detail",
        dyable: true,
        tint: 0xfefefe
      },
    ],
    dyable: true
  },
  {
    id: "top_racing",
    name: "Racing Suit",
    type: "top",
    dyable: true,
    tint: 0x0066ff,
    description: "A sleek blue latex suit with black accents. Built for speed and rhythm."
  },
  {
    id: "top_swimsuit",
    name: "Swimsuit",
    type: "top",
    dyable: true,
    tint: 0xf85998,
    description: "A standard polyester swimsuit"
  },
  // Bottom
  {
    id: "bottom_knee_length_jeans",
    name: "Knee-length Jeans",
    description: "Comfortable jeans that end just below the knee.",
    type: "bottom",
    tint: 0x0f1d42,
    dyable: true
  },
  {
    id: "bottom_lencery",
    name: "Lencery",
    description: "Mysterious pants with an otherworldly shimmer.",
    type: "bottom",
    tint: 0x352a34,
    dyable: true,
    lencery: true
  },
  {
    id: "bottom_long_jeans",
    name: "Long Jeans",
    description: "Full-length jeans. Classic and reliable.",
    type: "bottom",
    tint: 0x0f1d42,
    dyable: true
  },
  {
    id: "bottom_shorts_type1",
    name: "Shorts",
    description: "Simple shorts. Perfect for warm days.",
    type: "bottom",
    dyable: false
  },
  {
    id: "bottom_shorts_type2",
    name: "Shorts (Dyable)",
    description: "Simple shorts you can dye any color you want.",
    type: "bottom",
    layers: [
      {
        name: "Main",
        dyable: true,
        tint: 0x46767d
      },
      {
        name: "Detail",
        dyable: true,
        tint: 0x9c7141
      }
    ],
    dyable: true
  },
  {
    id: "bottom_skirt_blue",
    name: "Skirt",
    description: "A blue skirt that flows with your movements.",
    type: "bottom",
    dyable: false
  },
  {
    id: "bottom_skirt",
    name: "Skirt (Dyable)",
    description: "A skirt you can dye any color you like.",
    type: "bottom",
    layers: [
      {
        name: "Main",
        dyable: true,
        tint: 0x403660
      },
      {
        name: "Detail",
        dyable: true,
        tint: 0x403660
      }
    ],
    dyable: true 
  },
  // Shoes
  {
    id: "shoes_common",
    name: "Common Shoes",
    description: "Simple shoes that go with everything.",
    type: "shoes",
    dyable: false
  },
  {
    id: "shoes_high_boots",
    name: "High Boots",
    description: "Boots that reach the knee. Command attention.",
    type: "shoes",
    layers: [
      {
        name: "Main",
        dyable: true,
        tint: 0x403660
      },
      {
        name: "Lights",
        dyable: true,
        alternateTint: 0xffffff,
        alternateFrequency: 100,
        tint: 0x403660
      }
    ],
    dyable: true 
  },
  {
    id: "shoes_red_sports",
    name: "Red Sports",
    description: "Bold red sports shoes. Perfect for active dancers.",
    type: "shoes",
    dyable: false
  },
  {
    id: "shoes_sports",
    name: "Sports (Dyable)",
    description: "Sports shoes you can color to match your outfit.",
    type: "shoes",
    layers: [
      {
        name: "Main",
        dyable: true,
        tint: 0xffffff
      },
      {
        name: "Detail",
        dyable: true,
        tint: 0xffffff
      }
    ],
    dyable: true 
  },
  // Accessories
  {
    id: "accessory_hair_ties",
    name: "Hair Ties",
    description: "Cute hair ties. Dye them to match your hair!",
    type: "accessory",
    tint: 0xffffff,
    dyable: true 
  },
  {
    id: "accessory_rubber_globes",
    name: "Rubber Globes",
    description: "Glowing accessories that pulse with energy.",
    type: "accessory",
    layers: [
      {
        name: "Main",
        dyable: true,
        tint: 0x0f1d42
      },
      {
        name: "Lights",
        dyable: true,
        alternateTint: 0xffffff,
        alternateFrequency: 100,
        tint: 0x00cb4f
      },
    ],
    dyable: true 
  },
  {
    id: "accessory_shoulder_belt_left",
    name: "Shoulder Belt (Left)",
    description: "A belt that rests on the left shoulder. Edgy.",
    type: "accessory",
    dyable: false
  },
  {
    id: "accessory_shoulder_belt_right",
    name: "Shoulder Belt (Right)",
    description: "A belt that rests on the right shoulder. Edgy.",
    type: "accessory",
    dyable: false
  },
  {
    id: "accessory_fedora",
    name: "Fedora",
    type: "accessory",
    dyable: false,
    description: "A classic fedora hat for those who appreciate style and mystery."
  },
  {
    id: "accessory_paper_hat",
    name: "Paper Hat",
    type: "accessory",
    dyable: true,
    tint: 0xffffff,
    description: "A hat made of paper."
  },
  {
    id: "accessory_cat_ears",
    name: "Cat Ears",
    type: "accessory",
    dyable: true,
    tint: 0xfcdcc1,
    description: "Neko girl! Nya~!"
  },
  {
    id: "accessory_cap",
    name: "Casual Cap",
    type: "accessory",
    dyable: true,
    tint: 0xf8a4c0,
    description: "Casual Dyable Cap"
  },
  // Special costumes
  {
    id: "special_pajamas",
    name: "Pajamas",
    description: "Are you sleepy?",
    type: "special",
    hideCharacter: false,
    dyable: true,
    layers: [
      {
        name: "Main",
        tint: 0xf8c8d8,
        dyable: true
      },
      {
        name: "Detail 1",
        tint: 0xffffff,
        dyable: true
      },
      {
        name: "Detail 2",
        tint: 0xffffff,
        dyable: true
      }
    ]
  },
  {
    id: "special_pinkachu",
    name: "Pinkachu :D",
    description: "Our totally original mascot that definitely doesn't resemble any popular yellow electric mouse from a famous franchise. I swear. :3",
    type: "special",
    hideCharacter: true,
    dyable: false
  },
  // Auras
  {
    id: "aura_dots",
    name: "Dots",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffffff,
    description: "Simple dots that dance around you like digital fireflies.",
    particle: {
      keys: ["particle_dot"],
      frames: [0],
      frequency: 15,        // Reduced from 30
      duration: 2500,       // Slightly longer
      velocity: { min: 15, max: 40 },
      alpha: { min: 0.3, max: 0.7 },
      gravity: { min: -15, max: 15 }
    }
  },
  {
    id: "aura_circles",
    name: "Circles",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffffff,
    description: "Elegant circles that orbit around you with grace.",
    particle: {
      keys: ["particle_circle"],
      frames: [0],
      frequency: 12,        // Reduced from 25
      duration: 3000,
      velocity: { min: 10, max: 30 },
      alpha: { min: 0.4, max: 0.8 },
      gravity: { min: -10, max: 10 }
    }
  },
  {
    id: "aura_squares",
    name: "Squares",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffffff,
    description: "Sharp geometric squares that pulse with rhythm.",
    particle: {
      keys: ["particle_square"],
      frames: [0],
      frequency: 10,
      duration: 3500,
      velocity: { min: 8, max: 25 },
      alpha: { min: 0.3, max: 0.6 },
      gravity: { min: -8, max: 8 }
    }
  },
  {
    id: "aura_paws",
    name: "Paws",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffffff,
    description: "Adorable paw prints that follow your every move. Nya~!",
    particle: {
      keys: ["particle_paw"],
      frames: [0],
      frequency: 10,
      duration: 3000,
      velocity: { min: 8, max: 25 },
      alpha: { min: 0.5, max: 1.0 },
      gravity: { min: -8, max: 8 }
    }
  },
  {
    id: "aura_hearts",
    name: "Hearts",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b9d,
    description: "Cute hearts that flutter around you with love.",
    particle: {
      keys: ["particle_heart"],
      frames: [0],
      frequency: 12,
      duration: 3500,
      velocity: { min: 8, max: 25 },
      alpha: { min: 0.4, max: 0.8 },
      gravity: { min: -12, max: 12 }
    }
  },
  {
    id: "aura_hearts_filled",
    name: "Filled Hearts",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b9d,
    description: "Solid hearts filled with pure love and affection.",
    particle: {
      keys: ["particle_heart_filled"],
      frames: [0],
      frequency: 12,
      duration: 3500,
      velocity: { min: 8, max: 25 },
      alpha: { min: 0.4, max: 0.8 },
      gravity: { min: -12, max: 12 }
    }
  },
  {
    id: "aura_stars",
    name: "Stars",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffd700,
    description: "Sparkling stars that shine bright like your rhythm.",
    particle: {
      keys: ["particle_star"],
      frames: [0],
      frequency: 14,
      duration: 3000,
      velocity: { min: 12, max: 32 },
      alpha: { min: 0.4, max: 0.8 },
      gravity: { min: -12, max: 12 }
    }
  },
  {
    id: "aura_stars_filled",
    name: "Filled Stars",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffd700,
    description: "Solid stars that shine even brighter.",
    particle: {
      keys: ["particle_star_filled"],
      frames: [0],
      frequency: 14,
      duration: 3000,
      velocity: { min: 12, max: 32 },
      alpha: { min: 0.4, max: 0.8 },
      gravity: { min: -12, max: 12 }
    }
  },
  {
    id: "aura_arrows_random",
    name: "Random Arrows",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ff88,
    description: "Arrows pointing in all directions, full of energy!",
    particle: {
      keys: ["particle_arrow", "particle_arrow_filled"],
      frames: [0, 0, 0, 0],
      frequency: 14,
      duration: 2800,
      velocity: { min: 12, max: 30 },
      alpha: { min: 0.3, max: 0.7 },
      gravity: { min: -15, max: 15 },
      rotate: true
    }
  },
  {
    id: "aura_arrows_up",
    name: "Up Arrows",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ff88,
    description: "Rising arrows that lift your spirit higher!",
    particle: {
      keys: ["particle_arrow_filled"],
      frames: [0],
      frequency: 14,
      duration: 2800,
      velocity: { min: 20, max: 45 },
      alpha: { min: 0.3, max: 0.7 },
      gravity: { min: -25, max: -10 }, // Always going up
      rotate: false,
      lockDirection: "up"
    }
  },
  {
    id: "aura_arrows_down",
    name: "Down Arrows",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b35,
    description: "Grounding arrows that keep you steady.",
    particle: {
      keys: ["particle_arrow_filled"],
      frames: [0],
      frequency: 14,
      duration: 2800,
      velocity: { min: 20, max: 45 },
      alpha: { min: 0.3, max: 0.7 },
      gravity: { min: 10, max: 25 }, // Always going down
      rotate: false,
      lockDirection: "down"
    }
  },
  {
    id: "aura_bubbles",
    name: "Bubbles",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x88ccff,
    description: "Colorful bubbles floating all around.",
    particle: {
      keys: ["particle_bubble"],
      frames: [0, 1, 2],
      frequency: 8,
      duration: 4500,
      velocity: { min: 4, max: 12 },
      alpha: { min: 0.3, max: 0.5 },
      gravity: { min: -8, max: 8 }
    }
  },
  {
    id: "aura_hearts_ii",
    name: "Double Hearts",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b9d,
    description: "Double the love, double the sparkle!",
    particle: {
      keys: ["particle_heart"],
      frames: [0],
      layers: 2,
      frequency: 14,
      duration: 3500,
      velocity: { min: 8, max: 28 },
      alpha: { min: 0.3, max: 0.7 },
      gravity: { min: -15, max: 15 }
    }
  },
  {
    id: "aura_hearts_iii",
    name: "Triple Hearts",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b9d,
    description: "Triple the love, triple the sparkle!",
    particle: {
      keys: ["particle_heart"],
      frames: [0],
      layers: 3,
      frequency: 16,
      duration: 3500,
      velocity: { min: 8, max: 30 },
      alpha: { min: 0.2, max: 0.6 },
      gravity: { min: -18, max: 18 }
    }
  },
  {
    id: "aura_hearts_iv",
    name: "Quad Hearts",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b9d,
    description: "So much love it fills the screen!",
    particle: {
      keys: ["particle_heart"],
      frames: [0],
      layers: 4,
      frequency: 18,
      duration: 3500,
      velocity: { min: 8, max: 32 },
      alpha: { min: 0.2, max: 0.5 },
      gravity: { min: -20, max: 20 }
    }
  },
  {
    id: "aura_stars_ii",
    name: "Double Stars",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffd700,
    description: "Twice the sparkle, twice the shine!",
    particle: {
      keys: ["particle_star"],
      frames: [0],
      layers: 2,
      frequency: 14,
      duration: 3000,
      velocity: { min: 12, max: 32 },
      alpha: { min: 0.3, max: 0.7 },
      gravity: { min: -15, max: 15 }
    }
  },
  {
    id: "aura_stars_iii",
    name: "Triple Stars",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffd700,
    description: "A constellation of brilliance!",
    particle: {
      keys: ["particle_star"],
      frames: [0],
      layers: 3,
      frequency: 16,
      duration: 3000,
      velocity: { min: 10, max: 35 },
      alpha: { min: 0.2, max: 0.6 },
      gravity: { min: -18, max: 18 }
    }
  },
  {
    id: "aura_heart_star",
    name: "Love & Shine",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b9d,
    description: "Hearts and stars dancing together in harmony.",
    particle: {
      keys: ["particle_heart", "particle_star"],
      frames: [0, 0],
      frequency: 14,
      duration: 3500,
      velocity: { min: 8, max: 28 },
      alpha: { min: 0.3, max: 0.8 },
      gravity: { min: -12, max: 12 }
    }
  },
  {
    id: "aura_star_heart",
    name: "Shine & Love",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffd700,
    description: "Stars and hearts in a beautiful dance.",
    particle: {
      keys: ["particle_star", "particle_heart"],
      frames: [0, 0],
      frequency: 14,
      duration: 3500,
      velocity: { min: 8, max: 28 },
      alpha: { min: 0.3, max: 0.8 },
      gravity: { min: -12, max: 12 }
    }
  },
  {
    id: "aura_paw_heart",
    name: "Paw Love",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b9d,
    description: "Cute paws and hearts for maximum kawaii!",
    particle: {
      keys: ["particle_paw", "particle_heart"],
      frames: [0, 0],
      frequency: 10,
      duration: 3500,
      velocity: { min: 8, max: 25 },
      alpha: { min: 0.4, max: 0.8 },
      gravity: { min: -10, max: 10 }
    }
  },
  {
    id: "aura_circle_star",
    name: "Stellar Orbs",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ccff,
    description: "Orbs of starlight that orbit around you.",
    particle: {
      keys: ["particle_circle", "particle_star"],
      frames: [0, 0],
      frequency: 12,
      duration: 3200,
      velocity: { min: 8, max: 25 },
      alpha: { min: 0.4, max: 0.7 },
      gravity: { min: -8, max: 8 }
    }
  },
  {
    id: "aura_square_star",
    name: "Cosmic Cubes",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ff88,
    description: "Square stars from another dimension!",
    particle: {
      keys: ["particle_square", "particle_star"],
      frames: [0, 0],
      frequency: 12,
      duration: 3200,
      velocity: { min: 8, max: 25 },
      alpha: { min: 0.4, max: 0.7 },
      gravity: { min: -8, max: 8 }
    }
  },
  {
    id: "aura_neon_lights",
    name: "Neon Lights",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ff88,
    description: "Neon lights that pulse and glow with energy.",
    particle: {
      keys: ["particle_circle", "particle_dot"],
      frames: [0, 0],
      frequency: 10,
      duration: 2500,
      velocity: { min: 15, max: 35 },
      alpha: { min: 0.4, max: 0.8 },
      gravity: { min: -15, max: 15 },
      alternateTint: 0xff0088,
      alternateFrequency: 500
    }
  },
  {
    id: "aura_pulse_hearts",
    name: "Pulse Hearts",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff0066,
    description: "Hearts that pulse with a rhythm of their own.",
    particle: {
      keys: ["particle_heart_filled"],
      frames: [0],
      frequency: 10,
      duration: 3500,
      velocity: { min: 8, max: 20 },
      alpha: { min: 0.5, max: 0.9 },
      gravity: { min: -8, max: 8 },
      alternateTint: 0xff66cc,
      alternateFrequency: 400
    }
  },
  {
    id: "aura_chroma_stars",
    name: "Chroma Stars",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ffcc,
    description: "Stars shifting through a spectrum of color.",
    particle: {
      keys: ["particle_star_filled"],
      frames: [0],
      frequency: 12,
      duration: 3500,
      velocity: { min: 12, max: 32 },
      alpha: { min: 0.4, max: 0.8 },
      gravity: { min: -12, max: 12 },
      alternateTint: 0xff44aa,
      alternateFrequency: 600
    }
  },
  {
    id: "aura_dual_arrows",
    name: "Dual Arrows",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ff88,
    description: "Arrows pointing both up and down in harmony.",
    particle: {
      keys: ["particle_arrow_filled", "particle_arrow_filled"],
      frames: [0, 0],
      frequency: 12,
      duration: 3500,
      velocity: { min: 12, max: 30 },
      alpha: { min: 0.3, max: 0.7 },
      gravity: { min: -15, max: 15 },
      alternateTint: 0xff6b35,
      alternateFrequency: 800,
      rotate: false,
      lockDirection: "random"
    }
  },
  {
    id: "aura_sparkle_rain",
    name: "Sparkle Rain",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffffff,
    description: "A gentle rain of sparkles that never stops.",
    particle: {
      keys: ["particle_star", "particle_dot"],
      frames: [0, 0],
      frequency: 14,
      duration: 4000,
      velocity: { min: 4, max: 15 },
      alpha: { min: 0.3, max: 0.6 },
      gravity: { min: 8, max: 25 },
      alternateTint: 0x88ddff,
      alternateFrequency: 700
    }
  },
  {
    id: "aura_galaxy",
    name: "Galaxy",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x8800ff,
    description: "A swirling galaxy of cosmic particles.",
    particle: {
      keys: ["particle_dot", "particle_circle"],
      frames: [0, 0],
      frequency: 10,
      duration: 4500,
      velocity: { min: 8, max: 20 },
      alpha: { min: 0.3, max: 0.6 },
      gravity: { min: -4, max: 4 },
      alternateTint: 0xff00aa,
      alternateFrequency: 900
    }
  },
  {
    id: "aura_fireflies",
    name: "Fireflies",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffdd44,
    description: "Gentle fireflies lighting up the night around you.",
    particle: {
      keys: ["particle_dot"],
      frames: [0],
      frequency: 8,
      duration: 4500,
      velocity: { min: 4, max: 15 },
      alpha: { min: 0.3, max: 0.6 },
      gravity: { min: -4, max: 4 },
      alternateTint: 0x88ddff,
      alternateFrequency: 500
    }
  },
  {
    id: "aura_music_notes",
    name: "Music Notes",
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ccff,
    description: "Music notes that dance to your rhythm.",
    particle: {
      keys: ["particle_music_note"],
      frames: [0, 1, 2, 3],
      frequency: 12,
      duration: 3500,
      velocity: { min: 10, max: 25 },
      alpha: { min: 0.4, max: 0.8 },
      gravity: { min: -12, max: 12 },
      alternateTint: 0xff66aa,
      alternateFrequency: 600
    }
  },
  {
    id: "aura_rainbow_hearts",
    name: "Rainbow Hearts",
    type: "special",
    isAura: true,
    dyable: false,
    tint: 0xffffff,
    description: "Hearts in every color of the rainbow.",
    particle: {
      keys: ["particle_heart"],
      frames: [0],
      frequency: 14,
      duration: 3500,
      velocity: { min: 8, max: 28 },
      alpha: { min: 0.4, max: 0.8 },
      gravity: { min: -15, max: 15 },
      rainbow: true,
      rainbowColors: [0xff0000, 0xff8800, 0xffdd00, 0x00cc00, 0x0066ff, 0x4400cc, 0x8800aa]
    }
  },
  {
    id: "aura_rainbow_stars",
    name: "Rainbow Stars",
    type: "special",
    isAura: true,
    dyable: false,
    tint: 0xffffff,
    description: "Stars in every color of the rainbow.",
    particle: {
      keys: ["particle_star_filled"],
      frames: [0],
      frequency: 14,
      duration: 3500,
      velocity: { min: 12, max: 32 },
      alpha: { min: 0.4, max: 0.8 },
      gravity: { min: -15, max: 15 },
      rainbow: true,
      rainbowColors: [0xff0000, 0xff8800, 0xffdd00, 0x00cc00, 0x0066ff, 0x4400cc, 0x8800aa]
    }
  },
  {
    id: "aura_rainbow_hybrid",
    name: "Rainbow Hybrid",
    type: "special",
    isAura: true,
    dyable: false,
    tint: 0xffffff,
    description: "A mix of hearts and stars in rainbow colors.",
    particle: {
      keys: ["particle_heart", "particle_star_filled"],
      frames: [0, 0],
      frequency: 14,
      duration: 3500,
      velocity: { min: 8, max: 28 },
      alpha: { min: 0.4, max: 0.8 },
      gravity: { min: -15, max: 15 },
      rainbow: true,
      rainbowColors: [0xff0000, 0xff8800, 0xffdd00, 0x00cc00, 0x0066ff, 0x4400cc, 0x8800aa]
    }
  }
];