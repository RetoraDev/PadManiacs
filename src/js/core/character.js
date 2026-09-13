// Character system constants
/** @type {Object} Character system constants (max level, name length, etc.) */
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
      { 
        name: __("Casual||Casual"), 
        description: __("Relaxed and effortless style that frames the face naturally.||Estilo relajado y sin esfuerzo, enmarca la cara natural.") 
      },
      { 
        name: __("Smart||Elegante"), 
        description: __("Clean and polished look with a sophisticated edge.||Look limpio y pulido con un toque sofisticado.") 
      },
      { 
        name: __("Daring||Atrevido"), 
        description: __("Bold and eye-catching with an adventurous spirit.||Atrevido y llamativo con espíritu aventurero.") 
      },
      { 
        name: __("Simple||Simple"), 
        description: __("Minimalist and understated elegance at its finest.||Elegancia minimalista y discreta en su máxima expresión.") 
      },
      { 
        name: __("Bulky||Voluminoso"), 
        description: __("Voluminous and full of personality for a commanding presence.||Voluminoso y lleno de personalidad, presencia que impone.") 
      },
      { 
        name: __("Afro||Afro"), 
        description: __("Celebrating natural texture with a bold, iconic silhouette.||Celebrando la textura natural con una silueta icónica.") 
      },
      { 
        name: __("Emotional||Emocional"), 
        description: __("Expressive and artistic with a touch of drama.||Expresivo y artístico con un toque de drama.") 
      },
      { 
        name: __("Clean||Limpio"), 
        description: __("Crisp and precise with sharp, defined lines.||Crisp y preciso con líneas definidas y afiladas.") 
      }
    ],
    back: [
      { 
        name: __("Casual||Casual"), 
        description: __("Laid-back and natural flowing style.||Estilo despreocupado que fluye natural.") 
      },
      { 
        name: __("Smart||Elegante"), 
        description: __("Sleek and well-groomed from every angle.||Elegante y bien arreglado desde cualquier ángulo.") 
      },
      { 
        name: __("Curly||Rizado"), 
        description: __("Bouncy and playful with beautiful defined curls.||Rebotante y juguetón con hermosos rizos definidos.") 
      },
      { 
        name: __("Ponytails||Colitas"), 
        description: __("Playful and energetic with twin tails full of character.||Divertido y enérgico con coletas llenas de carácter.") 
      },
      { 
        name: __("Short||Corto"), 
        description: __("Chic and modern with a bold, cropped silhouette.||Chic y moderno con una silueta atrevida y corta.") 
      },
      { 
        name: __("Afro||Afro"), 
        description: __("Natural and iconic with full, rounded volume.||Natural e icónico con volumen completo y redondeado.") 
      },
      { 
        name: __("Diva||Diva"), 
        description: __("Glamorous and show-stopping with undeniable presence.||Glamuroso y arrollador con presencia innegable.") 
      },
      { 
        name: __("Clean||Limpio"), 
        description: __("Neat and refined with perfect symmetry.||Ordenado y refinado con simetría perfecta.") 
      }
    ]
  },
  SKIN_TONES: [
    { 
      name: __("Lighter||Clarito"), 
      description: __("Fair porcelain tone with a delicate, ethereal quality.||Tono porcelana claro con una cualidad delicada y etérea.") 
    },
    { 
      name: __("Light||Claro"), 
      description: __("Soft warm complexion with a natural glow.||Tez cálida y suave con un brillo natural.") 
    },
    { 
      name: __("Medium||Medio"), 
      description: __("Balanced earthy tone with healthy warmth.||Tono terroso equilibrado con calidez saludable.") 
    },
    { 
      name: __("Tan||Bronceado"), 
      description: __("Rich sun-kissed warmth with golden undertones.||Cálido bronceado por el sol con tonos dorados.") 
    },
    { 
      name: __("Another||Otro"), 
      description: __("Unique and distinct tone for those who stand out.||Tono único y distintivo para quienes destacan.") 
    }
  ],
  NAME_SYLLABLES: [
    "A",   "E",   "I",   "O",   "U",
    "AI",  "AO",  "EI",  "IO",  "OU",
    "KA",  "KI",  "KU",  "KE",  "KO",
    "SA",  "SI",  "SU",  "SE",  "SO",
    "TA",  "TI",  "TU",  "TE",  "TO",
    "NA",  "NI",  "NU",  "NE",  "NO",
    "HA",  "HI",  "HU",  "HE",  "HO",
    "MA",  "MI",  "MU",  "ME",  "MO",
    "KA",  "KI",  "KU",  "KO",  "RI",
    "RA",  "RU",  "RE",  "RO",  "YA",
    "YU",  "YO",  "WA",  "WO",  "N",
    "KAN", "KEN", "RIN", "REN", "HAN",
    "SHI", "SHO", "SHU", "CHA", "CHI",
    "TSU", "TSUI", "TOU", "KYO", "RYO",
    "MI",  "MU",  "ME",  "MO",  "FU",
    "YU",  "YUI", "YUA", "REI", "RAI",
    "HIK", "HAR", "SOR", "KIR", "MIR",
    "TAI", "KEN", "RYU", "JIN", "GEN",
    "REI", "SEI", "MAI", "KAI", "GAI",
    "DAN", "RAN", "BAN", "ZAN", "MAN",
    "LU",  "LE",  "LO",  "LA",  "LI",
    "FI",  "FA",  "FE",  "FO",  "ZE",
    "VI",  "VE",  "VO",  "XA",  "XE",
    "RIEL", "SEN", "TON", "ZA",  "ZU",
    "M",    "C.",  "K.",  "Y",   "YE",
    "WA",   "JA",  "JEI", "JO",  "LEI",
    "LOU",  "TI",  "NU",  "ES",  "SE",
    "HAT",  "NE",  "TO",  "ME",  "TA",
  ],
  PERSONALITIES: [
    {
      id: "chill",
      name: __("Chill||Tranqui"),
      description: __("Relaxed and easygoing, takes things at their own pace.||Relajado y sin prisas, va a su propio ritmo."),
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
      name: __("Focused||Enfocado"),
      description: __("Intense concentration and unwavering determination.||Concentración intensa y determinación inquebrantable."),
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
      name: __("Perfectionist||Perfeccionista"),
      description: __("Nothing less than perfect is acceptable.||Nada menos que perfecto es aceptable."),
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
      name: __("Steady||Constante"),
      description: __("Consistent and reliable, never misses a beat.||Consistente y confiable, nunca falla un beat."),
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
      name: __("Unbreakable||Inquebrantable"),
      description: __("No matter what happens, they never give up.||Pase lo que pase, nunca se rinde."),
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
      name: __("Rhythm Savant||Sabio del Ritmo"),
      description: __("Born with an innate sense of rhythm and timing.||Nacido con un sentido innato del ritmo y el timing."),
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
      name: __("Determined||Decidido"),
      description: __("Nothing stands in their way. They will succeed.||Nada se interpone en su camino. Va a triunfar."),
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
      name: __("Carefree||Despreocupado"),
      description: __("Living in the moment, enjoying every note.||Viviendo el momento, disfrutando cada nota."),
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
      name: __("Playful||Juguetón"),
      description: __("Full of energy and joy, turning every game into fun.||Lleno de energía y alegría, convierte cada juego en diversión."),
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
      name: __("Cheerful||Alegre"),
      description: __("Always smiling, spreading positivity through rhythm.||Siempre sonriendo, contagiando buena vibra con el ritmo."),
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
      name: __("Energetic||Enérgico"),
      description: __("Boundless energy that fuels every move.||Energía sin límites que impulsa cada movimiento."),
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
      name: __("Mysterious||Misterioso"),
      description: __("Enigmatic and unpredictable, keeps everyone guessing.||Enigmático e impredecible, mantiene a todos con la duda."),
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
      name: __("Enigmatic||Enigmático"),
      description: __("Deep and complex, with layers of personality.||Profundo y complejo, con capas de personalidad."),
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
      name: __("Serious||Serio"),
      description: __("Focused and disciplined, treats every game with gravity.||Enfocado y disciplinado, trata cada juego con seriedad."),
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
      name: __("Dreamy||Soñador"),
      description: __("Lost in the music, dancing to their own rhythm.||Perdido en la música, bailando su propio ritmo."),
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
      name: __("Creative||Creativo"),
      description: __("Expressive and artistic, finds beauty in every pattern.||Expresivo y artístico, encuentra belleza en cada patrón."),
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
      name: __("Artistic||Artístico"),
      description: __("A true artist of rhythm, every move is a masterpiece.||Un verdadero artista del ritmo, cada movimiento es una obra maestra."),
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
      name: __("Spirited||Apasionado"),
      description: __("Full of life and passion, plays with their heart.||Lleno de vida y pasión, juega con el corazón."),
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
      name: __("Gentle||Gentil"),
      description: __("Soft and precise, every note is handled with care.||Suave y preciso, cada nota es tratada con cuidado."),
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
      name: __("Fierce||Feroz"),
      description: __("Intense and powerful, dominates every chart.||Intenso y poderoso, domina cada chart."),
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
      name: __("Calm||Calmado"),
      description: __("Serene and composed, never loses their cool.||Sereno y compuesto, nunca pierde la calma."),
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
      name: __("Zen||Zen"),
      description: __("At one with the rhythm, perfectly balanced.||En sintonía con el ritmo, perfectamente equilibrado."),
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
      name: __("Sassy||Atrevido"),
      description: __("Bold and confident, with a dash of attitude.||Audaz y seguro, con un toque de actitud."),
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
      name: __("Shy||Tímido"),
      description: __("Quiet and reserved, but brilliant when they shine.||Callado y reservado, pero brillante cuando se luce."),
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
      name: __("Bold||Osado"),
      description: __("Fearless and daring, takes on every challenge.||Sin miedo y atrevido, acepta cada desafío."),
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
      name: __("Graceful||Elegante"),
      description: __("Elegant and fluid, makes every move look effortless.||Elegante y fluido, hace que cada movimiento parezca sin esfuerzo."),
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
      name: __("Witty||Ingenioso"),
      description: __("Quick and sharp, always one step ahead.||Rápido y astuto, siempre un paso adelante."),
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
      name: __("Mellow||Suave"),
      description: __("Laid-back and smooth, flows with the music.||Relajado y suave, fluye con la música."),
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
      name: __("Spunky||Vivaz"),
      description: __("Full of spunk and sass, brings personality to every play.||Lleno de chispa y actitud, le da personalidad a cada juego."),
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
      name: __("Emotive||Emotivo"),
      description: __("Feels every note deeply, plays with heart and soul.||Siente cada nota profundamente, juega con el alma."),
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
      name: __("Expressive||Expresivo"),
      description: __("Every movement tells a story, every note has meaning.||Cada movimiento cuenta una historia, cada nota tiene significado."),
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

/** @type {array} Clothing items unlocked by default */
const DEFAULT_UNLOCKED_ITEMS = [
  "top_seifuku_default",
  "bottom_skirt_blue",
  "shoes_common",
  "accessory_hair_ties"
];

/** @type {Object} Default character used for new accounts */
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
/** @type {array} Skill definitions for characters */
const CHARACTER_SKILLS = [
  {
    id: "safety_net",
    name: __("Safety Net||Red de Seguridad"),
    description: __("Converts Miss judgments to Boo when activated||Convierte juicios Miss a Boo al activarse"),
    activationCondition: "on_miss",
    effect: "convert_judgement",
    effectParams: { from: "miss", to: "boo" },
    duration: 0,
    cooldown: 0
  },
  {
    id: "focus_boost",
    name: __("Focus Boost||Boost de Enfoque"),
    description: __("Temporarily increases accuracy window by 20%||Aumenta temporalmente la ventana de precisión en 20%"),
    activationCondition: "on_combo",
    effect: "modify_judgement_window",
    effectParams: { multiplier: 1.2, threshold: 50 },
    duration: 5000,
    cooldown: 30000
  },
  {
    id: "health_regen",
    name: __("Health Regeneration||Regeneración de Vida"),
    description: __("Regenerates 1 health per second for 10 seconds||Regenera 1 de vida por segundo durante 10 segundos"),
    activationCondition: "on_low_health",
    effect: "health_regen",
    effectParams: { amount: 1, interval: 1000, threshold: 30 },
    duration: 10000,
    cooldown: 45000
  },
  {
    id: "max_health_boost",
    name: __("Max Health Boost||Boost de Vida Máxima"),
    description: __("Increases maximum health by 25 for 15 seconds||Aumenta la vida máxima en 25 durante 15 segundos"),
    activationCondition: "on_high_combo",
    effect: "modify_max_health",
    effectParams: { amount: 25, threshold: 100 },
    duration: 15000,
    cooldown: 60000
  },
  {
    id: "time_dilation",
    name: __("Time Dilation||Dilatación Temporal"),
    description: __("Slows down note speed by 15% for 8 seconds||Ralentiza la velocidad de notas en 15% por 8 segundos"),
    activationCondition: "on_perfect_streak",
    effect: "modify_note_speed",
    effectParams: { multiplier: 0.85, threshold: 10 },
    duration: 8000,
    cooldown: 40000
  },
  {
    id: "rhythm_echo",
    name: __("Rhythm Echo||Eco Rítmico"),
    description: __("Slightly extends hold forgiveness for 12 seconds||Extiende ligeramente el perdón de holds por 12 segundos"),
    activationCondition: "on_combo",
    effect: "modify_hold_forgiveness",
    effectParams: { multiplier: 1.3, threshold: 30 },
    duration: 12000,
    cooldown: 35000
  },
  {
    id: "combo_shield",
    name: __("Combo Shield||Escudo de Combo"),
    description: __("Next miss won't break combo||El próximo Miss no rompe el combo"),
    activationCondition: "on_high_combo",
    effect: "combo_shield",
    effectParams: { threshold: 75 },
    duration: 0,
    cooldown: 60000
  },
  {
    id: "precision_focus",
    name: __("Precision Focus||Enfoque de Precisión"),
    description: __("Reduces judgement window variation for 10 seconds||Reduce la variación de la ventana de juicio por 10 segundos"),
    activationCondition: "on_perfect_streak",
    effect: "stabilize_judgement",
    effectParams: { threshold: 8 },
    duration: 10000,
    cooldown: 45000
  },
  {
    id: "recovery_boost",
    name: __("Recovery Boost||Boost de Recuperación"),
    description: __("Increases health gain from hits by 50% for 15 seconds||Aumenta la ganancia de vida en 50% durante 15 segundos"),
    activationCondition: "on_low_health",
    effect: "modify_health_gain",
    effectParams: { multiplier: 1.5, threshold: 40 },
    duration: 15000,
    cooldown: 50000
  },
  {
    id: "mine_evasion",
    name: __("Mine Evasion||Evasión de Minas"),
    description: __("Reduces mine damage by 50% for 20 seconds||Reduce el daño de minas en 50% por 20 segundos"),
    activationCondition: "on_mine_hit",
    effect: "reduce_mine_damage",
    effectParams: { multiplier: 0.5 },
    duration: 20000,
    cooldown: 40000
  },
  {
    id: "momentum_builder",
    name: __("Momentum Builder||Constructor de Momento"),
    description: __("Slightly increases score from perfects for 12 seconds||Aumenta ligeramente el puntaje de Perfect por 12 segundos"),
    activationCondition: "on_combo",
    effect: "modify_score_gain",
    effectParams: { multiplier: 1.1, judgement: "perfect", threshold: 40 },
    duration: 12000,
    cooldown: 30000
  },
  {
    id: "grace_period",
    name: __("Grace Period||Periodo de Gracia"),
    description: __("Extends roll note tapping window for 10 seconds||Extiende la ventana de notas roll por 10 segundos"),
    activationCondition: "on_low_health",
    effect: "modify_roll_forgiveness",
    effectParams: { multiplier: 1.4, threshold: 25 },
    duration: 10000,
    cooldown: 40000
  },
  {
    id: "steady_hands",
    name: __("Steady Hands||Manos Firmes"),
    description: __("Reduces input lag slightly for 8 seconds||Reduce ligeramente el input lag por 8 segundos"),
    activationCondition: "on_perfect_streak",
    effect: "modify_input_lag",
    effectParams: { reduction: 0.02, threshold: 12 },
    duration: 8000,
    cooldown: 35000
  },
  {
    id: "second_wind",
    name: __("Second Wind||Segundo Aire"),
    description: __("Brief health regeneration when very low health||Regeneración breve de vida cuando la vida está muy baja"),
    activationCondition: "on_critical_health",
    effect: "burst_health_regen",
    effectParams: { amount: 15, threshold: 15 },
    duration: 0,
    cooldown: 90000
  },
  {
    id: "flow_state",
    name: __("Flow State||Estado de Flujo"),
    description: __("Slightly improves all judgements for a short time||Mejora ligeramente todos los juicios por un momento"),
    activationCondition: "on_high_combo",
    effect: "general_boost",
    effectParams: { windowMultiplier: 1.1, healthMultiplier: 1.2, threshold: 150 },
    duration: 6000,
    cooldown: 60000
  },
  {
    id: "rapid_recovery",
    name: __("Rapid Recovery||Recuperación Rápida"),
    description: __("Quick health burst when combo reaches 25||Burst de vida al alcanzar 25 combo"),
    activationCondition: "on_combo",
    effect: "burst_health_regen",
    effectParams: { amount: 10, threshold: 25 },
    duration: 0,
    cooldown: 30000
  },
  {
    id: "precision_flow",
    name: __("Precision Flow||Flujo de Precisión"),
    description: __("Slightly widens judgement windows at 40 combo||Amplía ligeramente las ventanas de juicio en 40 combo"),
    activationCondition: "on_combo",
    effect: "modify_judgement_window",
    effectParams: { multiplier: 1.15, threshold: 40 },
    duration: 8000,
    cooldown: 35000
  },
  {
    id: "endurance_training",
    name: __("Endurance Training||Entrenamiento de Resistencia"),
    description: __("Increases max health by 15 at 80 combo||Aumenta la vida máxima en 15 al llegar a 80 combo"),
    activationCondition: "on_high_combo",
    effect: "modify_max_health",
    effectParams: { amount: 15, threshold: 80 },
    duration: 12000,
    cooldown: 45000
  },
  {
    id: "slow_motion",
    name: __("Slow Motion||Cámara Lenta"),
    description: __("Reduces note speed by 10% after 15 perfects||Reduce la velocidad de notas en 10% tras 15 Perfect"),
    activationCondition: "on_perfect_streak",
    effect: "modify_note_speed",
    effectParams: { multiplier: 0.9, threshold: 15 },
    duration: 6000,
    cooldown: 40000
  },
  {
    id: "safety_cushion",
    name: __("Safety Cushion||Colchón de Seguridad"),
    description: __("Converts two misses to boos when health is low||Convierte dos Miss a Boo cuando la vida está baja"),
    activationCondition: "on_low_health",
    effect: "convert_judgement",
    effectParams: { from: "miss", to: "boo", threshold: 25 },
    duration: 15000,
    cooldown: 60000
  },
  {
    id: "rhythm_mastery",
    name: __("Rhythm Mastery||Maestría Rítmica"),
    description: __("Extends hold forgiveness by 25% at 60 combo||Extiende el perdón de holds en 25% al llegar a 60 combo"),
    activationCondition: "on_combo",
    effect: "modify_hold_forgiveness",
    effectParams: { multiplier: 1.25, threshold: 60 },
    duration: 10000,
    cooldown: 30000
  },
  {
    id: "roll_expert",
    name: __("Roll Expert||Experto en Rolls"),
    description: __("Increases roll forgiveness by 35% when health drops||Aumenta el perdón de rolls en 35% cuando baja la vida"),
    activationCondition: "on_low_health",
    effect: "modify_roll_forgiveness",
    effectParams: { multiplier: 1.35, threshold: 35 },
    duration: 12000,
    cooldown: 40000
  },
  {
    id: "mine_deflector",
    name: __("Mine Deflector||Desviador de Minas"),
    description: __("Reduces mine damage by 75% after hitting a mine||Reduce el daño de minas en 75% tras golpear una mina"),
    activationCondition: "on_mine_hit",
    effect: "reduce_mine_damage",
    effectParams: { multiplier: 0.25 },
    duration: 15000,
    cooldown: 50000
  },
  {
    id: "score_amplifier",
    name: __("Score Amplifier||Amplificador de Puntaje"),
    description: __("Increases marvelous score by 15% at 100 combo||Aumenta el puntaje Marvelous en 15% al llegar a 100 combo"),
    activationCondition: "on_high_combo",
    effect: "modify_score_gain",
    effectParams: { multiplier: 1.15, judgement: "marvelous", threshold: 100 },
    duration: 10000,
    cooldown: 35000
  },
  {
    id: "vitality_surge",
    name: __("Vitality Surge||Auge de Vitalidad"),
    description: __("Boosts health gain by 75% when critically low||Aumenta la ganancia de vida en 75% cuando está crítico"),
    activationCondition: "on_critical_health",
    effect: "modify_health_gain",
    effectParams: { multiplier: 1.75, threshold: 20 },
    duration: 8000,
    cooldown: 45000
  },
  {
    id: "combo_anchor",
    name: __("Combo Anchor||Ancla de Combo"),
    description: __("Prevents combo break at 50 combo (one-time)||Evita que se rompa el combo al llegar a 50 (una vez)"),
    activationCondition: "on_high_combo",
    effect: "combo_shield",
    effectParams: { threshold: 50 },
    duration: 0,
    cooldown: 75000
  },
  {
    id: "reflex_enhancer",
    name: __("Reflex Enhancer||Potenciador de Reflejos"),
    description: __("Reduces input lag after 8 perfects in a row||Reduce el input lag tras 8 Perfect consecutivos"),
    activationCondition: "on_perfect_streak",
    effect: "modify_input_lag",
    effectParams: { reduction: 0.015, threshold: 8 },
    duration: 5000,
    cooldown: 30000
  },
  {
    id: "graceful_recovery",
    name: __("Graceful Recovery||Recuperación Elegante"),
    description: __("Converts good to great when missing||Convierte Good a Great cuando fallas"),
    activationCondition: "on_miss",
    effect: "convert_judgement",
    effectParams: { from: "good", to: "great" },
    duration: 10000,
    cooldown: 40000
  },
  {
    id: "momentum_keeper",
    name: __("Momentum Keeper||Guardián del Momento"),
    description: __("Regenerates 2 health/sec for 8s at 30 combo||Regenera 2 vida/seg por 8s al llegar a 30 combo"),
    activationCondition: "on_combo",
    effect: "health_regen",
    effectParams: { amount: 2, interval: 1000, threshold: 30 },
    duration: 8000,
    cooldown: 40000
  },
  {
    id: "precision_boost",
    name: __("Precision Boost||Boost de Precisión"),
    description: __("Widens perfect window by 18% after 12 perfects||Amplía la ventana Perfect en 18% tras 12 Perfect"),
    activationCondition: "on_perfect_streak",
    effect: "modify_judgement_window",
    effectParams: { multiplier: 1.18, threshold: 12 },
    duration: 7000,
    cooldown: 35000
  },
  {
    id: "health_reserve",
    name: __("Health Reserve||Reserva de Vida"),
    description: __("Adds 20 max health when health drops to 40%||Añade 20 de vida máxima cuando la vida baja al 40%"),
    activationCondition: "on_low_health",
    effect: "modify_max_health",
    effectParams: { amount: 20, threshold: 40 },
    duration: 10000,
    cooldown: 50000
  },
  {
    id: "tempo_control",
    name: __("Tempo Control||Control de Tempo"),
    description: __("Slows notes by 12% at 120 combo||Ralentiza las notas en 12% al llegar a 120 combo"),
    activationCondition: "on_high_combo",
    effect: "modify_note_speed",
    effectParams: { multiplier: 0.88, threshold: 120 },
    duration: 9000,
    cooldown: 45000
  },
  {
    id: "hold_stability",
    name: __("Hold Stability||Estabilidad de Holds"),
    description: __("40% longer hold forgiveness when struggling||40% más de perdón en holds cuando estás en aprietos"),
    activationCondition: "on_low_health",
    effect: "modify_hold_forgiveness",
    effectParams: { multiplier: 1.4, threshold: 30 },
    duration: 15000,
    cooldown: 50000
  },
  {
    id: "rapid_rolls",
    name: __("Rapid Rolls||Rolls Rápidos"),
    description: __("50% more roll forgiveness at 70 combo||50% más de perdón en rolls al llegar a 70 combo"),
    activationCondition: "on_combo",
    effect: "modify_roll_forgiveness",
    effectParams: { multiplier: 1.5, threshold: 70 },
    duration: 8000,
    cooldown: 35000
  },
  {
    id: "mine_immunity",
    name: __("Mine Immunity||Inmunidad a Minas"),
    description: __("90% mine damage reduction after mine hit||90% de reducción de daño de minas tras golpear una"),
    activationCondition: "on_mine_hit",
    effect: "reduce_mine_damage",
    effectParams: { multiplier: 0.1 },
    duration: 10000,
    cooldown: 60000
  },
  {
    id: "perfect_bonus",
    name: __("Perfect Bonus||Bonus Perfect"),
    description: __("20% more score from perfects at 90 combo||20% más de puntaje de Perfect al llegar a 90 combo"),
    activationCondition: "on_high_combo",
    effect: "modify_score_gain",
    effectParams: { multiplier: 1.2, judgement: "perfect", threshold: 90 },
    duration: 12000,
    cooldown: 40000
  },
  {
    id: "recovery_expert",
    name: __("Recovery Expert||Experto en Recuperación"),
    description: __("Double health gain when below 25% health||Doble ganancia de vida cuando estás bajo 25% de vida"),
    activationCondition: "on_critical_health",
    effect: "modify_health_gain",
    effectParams: { multiplier: 2.0, threshold: 25 },
    duration: 10000,
    cooldown: 55000
  },
  {
    id: "unbreakable_chain",
    name: __("Unbreakable Chain||Cadena Irrompible"),
    description: __("Combo shield activates at 200 combo||Escudo de combo se activa al llegar a 200 combo"),
    activationCondition: "on_high_combo",
    effect: "combo_shield",
    effectParams: { threshold: 200 },
    duration: 0,
    cooldown: 90000
  },
  {
    id: "lightning_reflexes",
    name: __("Lightning Reflexes||Reflejos Relámpago"),
    description: __("Maximum input lag reduction after 20 perfects||Máxima reducción de input lag tras 20 Perfect"),
    activationCondition: "on_perfect_streak",
    effect: "modify_input_lag",
    effectParams: { reduction: 0.025, threshold: 20 },
    duration: 6000,
    cooldown: 40000
  },
  {
    id: "judgement_boost",
    name: __("Judgement Boost||Boost de Juicio"),
    description: __("Multiple improvements at high combo||Múltiples mejoras al alcanzar alto combo"),
    activationCondition: "on_high_combo",
    effect: "general_boost",
    effectParams: { windowMultiplier: 1.12, healthMultiplier: 1.3, threshold: 150 },
    duration: 5000,
    cooldown: 60000
  },
  {
    id: "emergency_convert",
    name: __("Emergency Convert||Conversión de Emergencia"),
    description: __("Converts boo to good when health critical||Convierte Boo a Good cuando la vida es crítica"),
    activationCondition: "on_critical_health",
    effect: "convert_judgement",
    effectParams: { from: "boo", to: "good", threshold: 10 },
    duration: 12000,
    cooldown: 70000
  },
  {
    id: "sustained_rhythm",
    name: __("Sustained Rhythm||Ritmo Sostenido"),
    description: __("Long health regeneration at medium combo||Regeneración larga de vida en combo medio"),
    activationCondition: "on_combo",
    effect: "health_regen",
    effectParams: { amount: 1, interval: 800, threshold: 45 },
    duration: 15000,
    cooldown: 50000
  },
  {
    id: "accuracy_focus",
    name: __("Accuracy Focus||Enfoque de Precisión"),
    description: __("Major window increase after perfect streak||Gran aumento de ventana tras racha de Perfect"),
    activationCondition: "on_perfect_streak",
    effect: "modify_judgement_window",
    effectParams: { multiplier: 1.25, threshold: 18 },
    duration: 6000,
    cooldown: 45000
  },
  {
    id: "overdrive_health",
    name: __("Overdrive Health||Vida Overdrive"),
    description: __("Large max health boost at very high combo||Gran boost de vida máxima en combo muy alto"),
    activationCondition: "on_high_combo",
    effect: "modify_max_health",
    effectParams: { amount: 35, threshold: 180 },
    duration: 8000,
    cooldown: 70000
  },
  {
    id: "time_master",
    name: __("Time Master||Maestro del Tiempo"),
    description: __("Significant note slowdown for skilled play||Ralentización significativa de notas para juego experto"),
    activationCondition: "on_perfect_streak",
    effect: "modify_note_speed",
    effectParams: { multiplier: 0.8, threshold: 25 },
    duration: 7000,
    cooldown: 60000
  },
  {
    id: "expert_holds",
    name: __("Expert Holds||Holds de Experto"),
    description: __("Maximum hold forgiveness extension||Extensión máxima de perdón de holds"),
    activationCondition: "on_high_combo",
    effect: "modify_hold_forgiveness",
    effectParams: { multiplier: 1.6, threshold: 130 },
    duration: 10000,
    cooldown: 40000
  },
  {
    id: "master_roller",
    name: __("Master Roller||Maestro Roller"),
    description: __("Extreme roll forgiveness for high combo||Perdón extremo de rolls en combo alto"),
    activationCondition: "on_high_combo",
    effect: "modify_roll_forgiveness",
    effectParams: { multiplier: 1.8, threshold: 110 },
    duration: 9000,
    cooldown: 45000
  },
  {
    id: "score_perfection",
    name: __("Score Perfection||Perfección de Puntaje"),
    description: __("Massive score boost for marvelous hits||Boost masivo de puntaje para hits Marvelous"),
    activationCondition: "on_perfect_streak",
    effect: "modify_score_gain",
    effectParams: { multiplier: 1.3, judgement: "marvelous", threshold: 15 },
    duration: 8000,
    cooldown: 50000
  },
  {
    id: "ultimate_recovery",
    name: __("Ultimate Recovery||Recuperación Definitiva"),
    description: __("Maximum health gain boost in critical state||Máximo boost de ganancia de vida en estado crítico"),
    activationCondition: "on_critical_health",
    effect: "modify_health_gain",
    effectParams: { multiplier: 2.5, threshold: 15 },
    duration: 12000,
    cooldown: 80000
  },
  {
    id: "perfect_flow",
    name: __("Perfect Flow||Flujo Perfecto"),
    description: __("Ultimate general boost for expert players||Boost general definitivo para jugadores expertos"),
    activationCondition: "on_perfect_streak",
    effect: "general_boost",
    effectParams: { windowMultiplier: 1.2, healthMultiplier: 1.5, threshold: 30 },
    duration: 4000,
    cooldown: 75000
  },
  {
    id: "final_stand",
    name: __("Final Stand||Última Resistencia"),
    description: __("Emergency health burst when near failure||Burst de vida de emergencia cuando estás al borde del fracaso"),
    activationCondition: "on_critical_health",
    effect: "burst_health_regen",
    effectParams: { amount: 25, threshold: 5 },
    duration: 0,
    cooldown: 120000
  },
  {
    id: "rhythm_savant",
    name: __("Rhythm Savant||Sabio del Ritmo"),
    description: __("Perfect input timing at extreme combo||Timing de input perfecto en combo extremo"),
    activationCondition: "on_high_combo",
    effect: "modify_input_lag",
    effectParams: { reduction: 0.03, threshold: 250 },
    duration: 5000,
    cooldown: 90000
  }
];

// Character items
/** @type {Object} Clothing and accessory definitions */
const CHARACTER_ITEMS = [
  // Top
  {
    id: "top_blouse",
    name: __("Blouse||Blusa"),
    description: __("A simple blouse with rolled sleeves.||Una blusa simple con mangas arremangadas."),
    type: "top",
    tint: 0x0f1d42,
    dyable: true
  },
  {
    id: "top_dubstep_dress",
    name: __("Dubstep Dress||Vestido Dubstep"),
    description: __("A dress that pulses with rhythm. The lights react to the beat!||Un vestido que late con ritmo. ¡Las luces reaccionan al beat!"),
    type: "top",
    layers: [
      {
        name: __("Main||Principal"),
        dyable: true,
        tint: 0x0f1d42
      },
      {
        name: __("Lights||Luces"),
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
    name: __("Lencery||Lencería"),
    description: __("A mysterious top with an otherworldly shimmer.||Un top misterioso con un brillo de otro mundo."),
    type: "top",
    tint: 0x352a34,
    dyable: true,
    lencery: true
  },
  {
    id: "top_office_shirt",
    name: __("Office Shirt||Camisa de Oficina"),
    description: __("Business casual. Perfect for the office... or the dance floor.||Casual de oficina. Perfecto para la chamba... o la pista de baile."),
    type: "top",
    dyable: false,
  },
  {
    id: "top_seifuku",
    name: __("Seifuku (Dyable)||Seifuku (Personalizable)"),
    description: __("A classic school uniform. Customize every detail!||Un uniforme escolar clásico. ¡Personaliza cada detalle!"),
    type: "top",
    layers: [
      {
        name: __("Main||Principal"),
        dyable: true,
        tint: 0xffffff
      },
      {
        name: __("Detail 1||Detalle 1"),
        dyable: true,
        tint: 0x0f1d42
      },
      {
        name: __("Detail 2||Detalle 2"),
        dyable: true,
        tint: 0xff0000
      }
    ],
    dyable: true
  },
  {
    id: "top_seifuku_default",
    name: __("Seifuku||Seifuku"),
    description: __("A classic school uniform. Simple and elegant.||Un uniforme escolar clásico. Simple y elegante."),
    type: "top",
    dyable: false
  },
  {
    id: "top_dress",
    name: __("Dress||Vestido"),
    description: __("A flowing dress with a golden trim.||Un vestido fluido con ribete dorado."),
    type: "top",
    layers: [
      {
        name: __("Main||Principal"),
        dyable: true,
        tint: 0xffffff
      },
      {
        name: __("Detail||Detalle"),
        dyable: true,
        tint: 0xe8c258
      },
    ],
    dyable: true
  },
  {
    id: "top_tshirt",
    name: __("T-shirt||Playera"),
    description: __("A casual t-shirt with a bold design.||Una playera casual con un diseño atrevido."),
    type: "top",
    layers: [
      {
        name: __("Main||Principal"),
        dyable: true,
        tint: 0xcd4345
      },
      {
        name: __("Detail||Detalle"),
        dyable: true,
        tint: 0xfefefe
      },
    ],
    dyable: true
  },
  {
    id: "top_racing",
    name: __("Racing Suit||Traje de Carreras"),
    type: "top",
    dyable: true,
    tint: 0x0066ff,
    description: __("A sleek blue latex suit with black accents. Built for speed and rhythm.||Un traje de látex azul elegante con acentos negros. Hecho para la velocidad y el ritmo.")
  },
  {
    id: "top_swimsuit",
    name: __("Swimsuit||Traje de Baño"),
    type: "top",
    dyable: true,
    tint: 0xf85998,
    description: __("A standard polyester swimsuit||Un traje de baño de poliéster estándar")
  },
  // Bottom
  {
    id: "bottom_knee_length_jeans",
    name: __("Knee-length Jeans||Jeans a la Rodilla"),
    description: __("Comfortable jeans that end just below the knee.||Jeans cómodos que terminan justo debajo de la rodilla."),
    type: "bottom",
    tint: 0x0f1d42,
    dyable: true
  },
  {
    id: "bottom_lencery",
    name: __("Lencery||Lencería"),
    description: __("Mysterious pants with an otherworldly shimmer.||Pantalones misteriosos con un brillo de otro mundo."),
    type: "bottom",
    tint: 0x352a34,
    dyable: true,
    lencery: true
  },
  {
    id: "bottom_long_jeans",
    name: __("Long Jeans||Jeans Largos"),
    description: __("Full-length jeans. Classic and reliable.||Jeans de largo completo. Clásicos y confiables."),
    type: "bottom",
    tint: 0x0f1d42,
    dyable: true
  },
  {
    id: "bottom_shorts_type1",
    name: __("Shorts||Shorts"),
    description: __("Simple shorts. Perfect for warm days.||Shorts simples. Perfectos para días calurosos."),
    type: "bottom",
    dyable: false
  },
  {
    id: "bottom_shorts_type2",
    name: __("Shorts (Dyable)||Shorts (Personalizable)"),
    description: __("Simple shorts you can dye any color you want.||Shorts simples que puedes teñir del color que quieras."),
    type: "bottom",
    layers: [
      {
        name: __("Main||Principal"),
        dyable: true,
        tint: 0x46767d
      },
      {
        name: __("Detail||Detalle"),
        dyable: true,
        tint: 0x9c7141
      }
    ],
    dyable: true
  },
  {
    id: "bottom_skirt_blue",
    name: __("Skirt||Falda"),
    description: __("A blue skirt that flows with your movements.||Una falda azul que fluye con tus movimientos."),
    type: "bottom",
    dyable: false
  },
  {
    id: "bottom_skirt",
    name: __("Skirt (Dyable)||Falda (Personalizable)"),
    description: __("A skirt you can dye any color you like.||Una falda que puedes teñir del color que quieras."),
    type: "bottom",
    layers: [
      {
        name: __("Main||Principal"),
        dyable: true,
        tint: 0x403660
      },
      {
        name: __("Detail||Detalle"),
        dyable: true,
        tint: 0x403660
      }
    ],
    dyable: true 
  },
  // Shoes
  {
    id: "shoes_common",
    name: __("Common Shoes||Zapatos Comunes"),
    description: __("Simple shoes that go with everything.||Zapatos simples que combinan con todo."),
    type: "shoes",
    dyable: false
  },
  {
    id: "shoes_high_boots",
    name: __("High Boots||Botas Altas"),
    description: __("Boots that reach the knee. Command attention.||Botas que llegan a la rodilla. Imponen presencia."),
    type: "shoes",
    layers: [
      {
        name: __("Main||Principal"),
        dyable: true,
        tint: 0x403660
      },
      {
        name: __("Lights||Luces"),
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
    name: __("Red Sports||Deportivas Rojas"),
    description: __("Bold red sports shoes. Perfect for active dancers.||Zapatillas deportivas rojas atrevidas. Perfectas para bailarines activos."),
    type: "shoes",
    dyable: false
  },
  {
    id: "shoes_sports",
    name: __("Sports (Dyable)||Deportivas (Personalizable)"),
    description: __("Sports shoes you can color to match your outfit.||Zapatillas deportivas que puedes colorear para que combinen con tu outfit."),
    type: "shoes",
    layers: [
      {
        name: __("Main||Principal"),
        dyable: true,
        tint: 0xffffff
      },
      {
        name: __("Detail||Detalle"),
        dyable: true,
        tint: 0xffffff
      }
    ],
    dyable: true 
  },
  // Accessories
  {
    id: "accessory_hair_ties",
    name: __("Hair Ties||Ligas para el Pelo"),
    description: __("Cute hair ties. Dye them to match your hair!||Ligas lindas para el pelo. ¡Tiñelas para que combinen con tu cabello!"),
    type: "accessory",
    tint: 0xffffff,
    dyable: true 
  },
  {
    id: "accessory_rubber_globes",
    name: __("Rubber Globes||Globos de Goma"),
    description: __("Glowing accessories that pulse with energy.||Accesorios brillantes que laten con energía."),
    type: "accessory",
    layers: [
      {
        name: __("Main||Principal"),
        dyable: true,
        tint: 0x0f1d42
      },
      {
        name: __("Lights||Luces"),
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
    name: __("Shoulder Belt (Left)||Cinturón de Hombro (Izquierdo)"),
    description: __("A belt that rests on the left shoulder. Edgy.||Un cinturón que descansa sobre el hombro izquierdo. Con estilo."),
    type: "accessory",
    dyable: false
  },
  {
    id: "accessory_shoulder_belt_right",
    name: __("Shoulder Belt (Right)||Cinturón de Hombro (Derecho)"),
    description: __("A belt that rests on the right shoulder. Edgy.||Un cinturón que descansa sobre el hombro derecho. Con estilo."),
    type: "accessory",
    dyable: false
  },
  {
    id: "accessory_fedora",
    name: __("Fedora||Fedora"),
    type: "accessory",
    dyable: false,
    description: __("A classic fedora hat for those who appreciate style and mystery.||Un sombrero fedora clásico para quienes aprecian el estilo y el misterio.")
  },
  {
    id: "accessory_paper_hat",
    name: __("Paper Hat||Sombrero de Papel"),
    type: "accessory",
    dyable: true,
    tint: 0xffffff,
    description: __("A hat made of paper.||Un sombrero hecho de papel.")
  },
  {
    id: "accessory_cat_ears",
    name: __("Cat Ears||Orejas de Gato"),
    type: "accessory",
    dyable: true,
    tint: 0xfcdcc1,
    description: __("Neko girl! Nya~!||¡Chica neko! ¡Nya~!")
  },
  {
    id: "accessory_cap",
    name: __("Casual Cap||Gorra Casual"),
    type: "accessory",
    dyable: true,
    tint: 0xf8a4c0,
    description: __("Casual Dyable Cap||Gorra casual personalizable")
  },
  // Special costumes
  {
    id: "special_pajamas",
    name: __("Pajamas||Pijama"),
    description: __("Are you sleepy?||¿Tienes sueño?"),
    type: "special",
    hideCharacter: false,
    dyable: true,
    layers: [
      {
        name: __("Main||Principal"),
        tint: 0xf8c8d8,
        dyable: true
      },
      {
        name: __("Detail 1||Detalle 1"),
        tint: 0xffffff,
        dyable: true
      },
      {
        name: __("Detail 2||Detalle 2"),
        tint: 0xffffff,
        dyable: true
      }
    ]
  },
  {
    id: "special_pinkachu",
    name: __("Pinkachu :D||Pinkachu :D"),
    description: __("Our totally original mascot that definitely doesn't resemble any popular yellow electric mouse from a famous franchise. I swear. :3||Nuestra mascota totalmente original que definitivamente no se parece a ningún ratón eléctrico amarillo de una franquicia famosa. Lo juro. :3"),
    type: "special",
    hideCharacter: true,
    dyable: false
  },
  // Auras
  {
    id: "aura_dots",
    name: __("Dots||Puntitos"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffffff,
    description: __("Simple dots that dance around you like digital fireflies.||Puntitos simples que bailan a tu alrededor como luciérnagas digitales."),
    particle: {
      keys: ["particle_dot"],
      frames: [0],
      frequency: 15,
      duration: 2500,
      velocity: { min: 15, max: 40 },
      alpha: { min: 0.3, max: 0.7 },
      gravity: { min: -15, max: 15 }
    }
  },
  {
    id: "aura_circles",
    name: __("Circles||Círculos"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffffff,
    description: __("Elegant circles that orbit around you with grace.||Círculos elegantes que orbitan a tu alrededor con gracia."),
    particle: {
      keys: ["particle_circle"],
      frames: [0],
      frequency: 12,
      duration: 3000,
      velocity: { min: 10, max: 30 },
      alpha: { min: 0.4, max: 0.8 },
      gravity: { min: -10, max: 10 }
    }
  },
  {
    id: "aura_squares",
    name: __("Squares||Cuadrados"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffffff,
    description: __("Sharp geometric squares that pulse with rhythm.||Cuadrados geométricos afilados que laten con el ritmo."),
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
    name: __("Paws||Huellitas"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffffff,
    description: __("Adorable paw prints that follow your every move. Nya~!||Adorables huellitas que siguen cada uno de tus movimientos. ¡Nya~!"),
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
    name: __("Hearts||Corazones"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b9d,
    description: __("Cute hearts that flutter around you with love.||Corazones lindos que revolotean a tu alrededor con amor."),
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
    name: __("Filled Hearts||Corazones Rellenos"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b9d,
    description: __("Solid hearts filled with pure love and affection.||Corazones sólidos llenos de amor y cariño puro."),
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
    name: __("Stars||Estrellitas"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffd700,
    description: __("Sparkling stars that shine bright like your rhythm.||Estrellas brillantes que relucen como tu ritmo."),
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
    name: __("Filled Stars||Estrellas Rellenas"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffd700,
    description: __("Solid stars that shine even brighter.||Estrellas sólidas que brillan aún más."),
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
    name: __("Random Arrows||Flechas Random"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ff88,
    description: __("Arrows pointing in all directions, full of energy!||¡Flechas apuntando a todos lados, llenas de energía!"),
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
    name: __("Up Arrows||Flechas Arriba"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ff88,
    description: __("Rising arrows that lift your spirit higher!||¡Flechas ascendentes que elevan tu espíritu!"),
    particle: {
      keys: ["particle_arrow_filled"],
      frames: [0],
      frequency: 14,
      duration: 2800,
      velocity: { min: 20, max: 45 },
      alpha: { min: 0.3, max: 0.7 },
      gravity: { min: -25, max: -10 },
      rotate: false,
      lockDirection: "up"
    }
  },
  {
    id: "aura_arrows_down",
    name: __("Down Arrows||Flechas Abajo"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b35,
    description: __("Grounding arrows that keep you steady.||Flechas que te mantienen firme y centrado."),
    particle: {
      keys: ["particle_arrow_filled"],
      frames: [0],
      frequency: 14,
      duration: 2800,
      velocity: { min: 20, max: 45 },
      alpha: { min: 0.3, max: 0.7 },
      gravity: { min: 10, max: 25 },
      rotate: false,
      lockDirection: "down"
    }
  },
  {
    id: "aura_bubbles",
    name: __("Bubbles||Burbujas"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x88ccff,
    description: __("Colorful bubbles floating all around.||Burbujas coloridas flotando por todos lados."),
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
    name: __("Double Hearts||Corazones Dobles"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b9d,
    description: __("Double the love, double the sparkle!||¡Doble amor, doble brillo!"),
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
    name: __("Triple Hearts||Corazones Triples"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b9d,
    description: __("Triple the love, triple the sparkle!||¡Triple amor, triple brillo!"),
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
    name: __("Quad Hearts||Corazones Cuádruples"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b9d,
    description: __("So much love it fills the screen!||¡Tanto amor que llena la pantalla!"),
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
    name: __("Double Stars||Estrellas Dobles"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffd700,
    description: __("Twice the sparkle, twice the shine!||¡Doble brillo, doble resplandor!"),
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
    name: __("Triple Stars||Estrellas Triples"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffd700,
    description: __("A constellation of brilliance!||¡Una constelación de brillo!"),
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
    name: __("Love & Shine||Amor & Brillo"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b9d,
    description: __("Hearts and stars dancing together in harmony.||Corazones y estrellas bailando juntos en armonía."),
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
    name: __("Shine & Love||Brillo & Amor"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffd700,
    description: __("Stars and hearts in a beautiful dance.||Estrellas y corazones en un baile hermoso."),
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
    name: __("Paw Love||Amor de Patitas"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff6b9d,
    description: __("Cute paws and hearts for maximum kawaii!||¡Patitas lindas y corazones para máximo kawaii!"),
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
    name: __("Stellar Orbs||Orbes Estelares"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ccff,
    description: __("Orbs of starlight that orbit around you.||Orbes de luz estelar que orbitan a tu alrededor."),
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
    name: __("Cosmic Cubes||Cubos Cósmicos"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ff88,
    description: __("Square stars from another dimension!||¡Estrellas cuadradas de otra dimensión!"),
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
    name: __("Neon Lights||Luces de Neón"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ff88,
    description: __("Neon lights that pulse and glow with energy.||Luces de neón que laten y brillan con energía."),
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
    name: __("Pulse Hearts||Corazones Late"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xff0066,
    description: __("Hearts that pulse with a rhythm of their own.||Corazones que laten con su propio ritmo."),
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
    name: __("Chroma Stars||Estrellas Croma"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ffcc,
    description: __("Stars shifting through a spectrum of color.||Estrellas que cambian a través del espectro de colores."),
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
    name: __("Dual Arrows||Flechas Duales"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ff88,
    description: __("Arrows pointing both up and down in harmony.||Flechas apuntando arriba y abajo en armonía."),
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
    name: __("Sparkle Rain||Lluvia de Brillo"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffffff,
    description: __("A gentle rain of sparkles that never stops.||Una lluvia suave de brillo que nunca se detiene."),
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
    name: __("Galaxy||Galaxia"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x8800ff,
    description: __("A swirling galaxy of cosmic particles.||Una galaxia en espiral de partículas cósmicas."),
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
    name: __("Fireflies||Luciérnagas"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0xffdd44,
    description: __("Gentle fireflies lighting up the night around you.||Luciérnagas suaves iluminando la noche a tu alrededor."),
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
    name: __("Music Notes||Notas Musicales"),
    type: "special",
    isAura: true,
    dyable: true,
    tint: 0x00ccff,
    description: __("Music notes that dance to your rhythm.||Notas musicales que bailan a tu ritmo."),
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
    name: __("Rainbow Hearts||Corazones Arcoíris"),
    type: "special",
    isAura: true,
    dyable: false,
    tint: 0xffffff,
    description: __("Hearts in every color of the rainbow.||Corazones de todos los colores del arcoíris."),
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
    name: __("Rainbow Stars||Estrellas Arcoíris"),
    type: "special",
    isAura: true,
    dyable: false,
    tint: 0xffffff,
    description: __("Stars in every color of the rainbow.||Estrellas de todos los colores del arcoíris."),
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
    name: __("Rainbow Hybrid||Híbrido Arcoíris"),
    type: "special",
    isAura: true,
    dyable: false,
    tint: 0xffffff,
    description: __("A mix of hearts and stars in rainbow colors.||Una mezcla de corazones y estrellas en colores arcoíris."),
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