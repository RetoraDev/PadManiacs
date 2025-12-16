// Character system constants
const CHARACTER_SYSTEM = {
  MAX_NAME_LENGTH: 6,
  DEFAULT_CHARACTER: "EIRI",
  MAX_SKILL_LEVEL: 5,
  EXPERIENCE_CURVE: level => Math.floor(10 * Math.pow(level, 1.03)),
  SKILL_UNLOCK_CHANCE: 0.6,
  HAIR_UNLOCK_CHANCE: 0.5,
  ITEM_UNLOCK_CHANCE: 0.4,
  SKILL_LEVEL_UP_CHANCE: 0.4,
  MIN_LEVEL_FOR_SKILL: 4,
  MIN_LEVEL_FOR_HAIR: 2,
  MIN_LEVEL_FOR_ITEM: 3,
  SKILL_COOLDOWN_LEVELS: 1,
  HAIR_COOLDOWN_LEVELS: 2,
  ITEM_COOLDOWN_LEVELS: 2,
  PORTRAIT_CROP: { x: 43, y: 11, w: 15, h: 15 },
  CLOSE_SHOT_CROP: { x: 32, y: 15, w: 36, h: 7 },
  HAIR_STYLES: {
    front: ["Casual", "Smart", "Daring", "Simple", "Bulky", "Afro", "Emotional", "Clean"],
    back: ["Casual", "Smart", "Curly", "Ponytails", "Short", "Afro", "Diva", "Clean"],
  },
  NAME_SYLLABLES: [
    // Two of these syllables are joined together to make anime style character name
    // TODO: Better and more organized syllables
    
    // Random syllables (with easter eggs)
    "A", "E", "I", "O", "U",
    "AI", "AM", "RE", "RU",
    "SI", "MI", "KU", "LU",
    "KA", "KAN", "NA", "EI",
    "RI", "NE", "RU", "CHA",
    "RA", "FI", "SEI", "TO",
    "TOU", "HAT", "SU", "NE",
    "TO", "RIEL", "ME", "TA",
    "TON", "ZA", "ZU", "KA",
    "AS", "RIEL", "M", "C.",
    "LE", "LO", "LU", "SEN",
    "CA", "Y", "YE", "YA",
    "K.", "NU", "ES", "SE",
    "WA", "JA", "JEI", "JO",
    "LI", "LEI", "LOU", "TI"
  ]
};

const DEFAULT_CHARACTER = {
  name: "EIRI",
  level: 1,
  experience: 0,
  skillLevel: 1,
  unlockedSkills: ["focus_boost"],
  selectedSkill: "focus_boost",
  appearance: {
    skinTone: 0,
    hairColor: 0xa8705a,
    frontHair: 1,
    backHair: 1,
    clothing: "school_uniform",
    accessory: null
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
const CHARACTER_ITEMS = {
  clothing: [
    {
      id: "school_uniform",
      name: "School Uniform",
      type: "clothing"
    },
    {
      id: "teacher_clothing",
      name: "Teacher Clothing",
      type: "clothing"
    },
    {
      id: "daring_clothing",
      name: "Daring",
      type: "clothing"
    },
    {
      id: "short_dress_red",
      name: "Short Dress (RED)",
      type: "clothing"
    },
    {
      id: "short_dress_black",
      name: "Short Dress (BLACK)",
      type: "clothing"
    },
    {
      id: "short_dress_orange",
      name: "Short Dress (ORANGE)",
      type: "clothing"
    },
    {
      id: "short_dress_blue",
      name: "Short Dress (BLUE)",
      type: "clothing"
    },
    {
      id: "dubstep_dress_black",
      name: "Dubstep Dress (BLACK)",
      type: "clothing"
    },
    {
      id: "dubstep_dress_blue",
      name: "Dubstep Dress (BLUE)",
      type: "clothing"
    },
    {
      id: "pinkachu",
      name: "Pinkachu :D",
      hideCharacter: true,
      type: "clothing"
    },
    {
      id: "lencery",
      name: "Lencery (Remove this! For the love of god!)",
      type: "clothing"
    },
  ],
  accessories: [
    {
      id: "headphones",
      name: "Headphones",
      type: "accessory"
    },
    {
      id: "hair_ties_red",
      name: "Hair Ties (RED)",
      type: "accessory"
    },
    {
      id: "hair_ties_black",
      name: "Hair Ties (BLACK)",
      type: "accessory"
    },
    {
      id: "hair_ties_orange",
      name: "Hair Ties (ORANGE)",
      type: "accessory"
    },
    {
      id: "hair_ties_blue",
      name: "Hair Ties (BLUE)",
      type: "accessory"
    },
  ]
};
