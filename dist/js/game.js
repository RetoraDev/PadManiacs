/**
 * PadManiacs Rhythm Game
 * Copyright (C) RETORA 2025
 * Licensed under the PadManiacs License (see LICENSE file for full terms)
 * 
 * Source: https://github.com/RetoraDev/PadManiacs
 * Version: v0.0.8 dev
 * Build: 12/6/2025, 1:26:20 PM
 * Platform: Development
 * Debug: false
 * Minified: false
 */

const COPYRIGHT = "(C) RETORA 2025";

const VERSION = "v0.0.8 dev";

window.DEBUG = false;

const FONTS = {
  default: { font: "font_tiny" },
  tiny: { font: "font_tiny" },
  shaded: { font: "font_tiny_shaded" },
  stroke: { font: "font_tiny_stroke", fontWidth: 5 },
  number: { font: "font_tiny_number", fontMap: "1234567890 " },
  combo: { font: "font_combo", fontMap: "0123456789 ", fontWidth: 8, fontHeight: 8 }
};

const WINDOW_PANELS = ["1"];

const DEFAULT_SONG_FOLDERS = [
  "MikiMikiRomanticNight",
  "ThousandCherryBlossoms",
  "UndeadEnemy",
  "Carnival",
  "HatsuneMiku-Melt",
  "KagamineRin-LoveIsWar(R184mmRemix)",
  "KasaneTerritory-KasaneTeto",
  "ANewWorld",
  "39",
  "AsuNoHikari",
  "TheDubstepSoldiersattheFront",
  "JustBeFriends",
  "GentleDespair",
  "Palette",
  "GiganticGirl",
  "melody_2.exe"
];

const JUDGE_WINDOWS = {
  marvelous: 55,      // ~22.5ms (extended 55ms)
  perfect: 75,        // 45ms (extended to 75ms)  
  great: 99,          // 90ms (extended to 99ms)
  good: 140,          // 135ms (extended to 140ms)
  boo: 180            // 180ms
};

const SCORE_VALUES = {
  marvelous: 1000,
  perfect: 800,
  great: 500,
  good: 200,
  boo: 50,
  miss: 0
};

const COMMUNITY_HOMEPAGE_URL = "https://retora.itch.io/padmaniacs/community";
const FEEDBACK_REVIEW_URL = "https://retora.itch.io/padmaniacs/rate";
const FEEDBACK_FEATURE_REQUEST_URL = "https://itch.io/t/5585472/feature-requests";
const FEEDBACK_BUG_REPORT_URL = "https://itch.io/t/5585499/bug-reports";

const COMMUNITY_PROMPT_MIN_PLAYTIME = 60 * 60;
const RATING_PROMPT_MIN_PLAYTIME = 15 * 60;
const FEATURE_REQUEST_MIN_PLAYTIME = 30 * 60;

// Environment detection constants
const ENVIRONMENT = {
  UNKNOWN: 'WEB',
  NWJS: 'NWJS',
  CORDOVA: 'CORDOVA',
  WEB: 'WEB'
};

// Build-time environment setting
const CURRENT_ENVIRONMENT = ENVIRONMENT.UNKNOWN;

const CORDOVA_EXTERNAL_DIRECTORY = "PadManiacs/";
const NWJS_EXTERNAL_DIRECTORY = "data/";

const EXTERNAL_DIRECTORY = CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA ? CORDOVA_EXTERNAL_DIRECTORY : NWJS_EXTERNAL_DIRECTORY;

const ADDONS_DIRECTORY = "Addons";
const SCREENSHOTS_DIRECTORY = "Screenshots";
const SONGS_DIRECTORY = "Songs";
const EDITOR_OUTPUT_DIRECTORY = "Edits";

const ENABLE_PARALLEL_LOADING = true;
const MAX_PARALLEL_DOWNLOADS = 128;

const MAX_PARALLEL_ADDON_LOADS = 3;
const ENABLE_ADDON_SAFE_MODE = true;

const ENABLE_UI_SFX = false;
const ENABLE_EXP_SFX = true;

const REGULAR_VIBRATION_INTENSITY = 75;
const WEAK_VIBRATION_INTENSITY = 50;
const STRONG_VIBRATION_INTENSITY = 50;

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
  }
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
  songSelectStartingIndex: {
    local: 0,
    external: 0
  },
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
    
    // Detailed tracking
    totalNotesHit: 0,
    totalMarvelous: 0,
    totalPerfect: 0,
    totalGreat: 0,
    totalGood: 0,
    totalBoo: 0,
    totalMiss: 0,
    
    // Editor stats
    totalPlacedArrows: 0,
    totalPlacedFreezes: 0,
    totalPlacedMines: 0,
    totalImportedSongs: 0,
    totalExportedSongs: 0,
    
    // Miscellaneous
    maxSkillsInGame: 0,
    gameRated: false,
    featureRequestPrompted: false,
    lastCrashed: false,
    submittedBugReport: false,
    wentToCommunity: false
  },
  achievements: {
    unlocked: {},
    progress: {}
  }
};


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
  },
  {
    id: "community_explorer",
    name: "Community Explorer",
    category: ACHIEVEMENT_CATEGORIES.MISC,
    description: {
      unachieved: "Visit the community homepage",
      achieved: "You visited the community!"
    },
    expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
    condition: (stats) => stats.wentToCommunity,
    hidden: false
  }
];

class Character {
  constructor(data) {
    this.name = data.name;
    this.level = data.level || 1;
    this.experience = data.experience || 0;
    this.skillLevel = data.skillLevel || 1;
    this.unlockedSkills = data.unlockedSkills || [];
    this.selectedSkill = data.selectedSkill || null;
    this.appearance = data.appearance || {
      skinTone: 0,
      hairColor: 0xFFFFFF,
      frontHair: "1",
      backHair: "1",
      clothing: "school_uniform",
      accessory: "headphones"
    };
    this.stats = data.stats || {
      gamesPlayed: 0,
      totalScore: 0,
      maxCombo: 0,
      perfectGames: 0,
      skillsUsed: 0
    };
    this.experienceStory = [];
    this.lastSkillLevelUp = data.lastSkillLevelUp || 0;
    this.lastHairUnlockLevel = data.lastHairUnlockLevel || 0;
    this.lastItemUnlockLevel = data.lastItemUnlockLevel || 0;
  }
  
  getLastExperienceStoryEntry() {
    return this.experienceStory.length ? this.experienceStory[this.experienceStory.length - 1] : null;
  }

  addExperience(amount) {
    const storyEntry = {
      levelBefore: this.level,
      expBefore: this.experience,
      expGain: amount
    };
    
    this.experience += amount;
    const requiredExp = CHARACTER_SYSTEM.EXPERIENCE_CURVE(this.level);
    
    while (this.experience >= requiredExp) {
      this.levelUp();
      this.experience -= requiredExp;
    }
    
    storyEntry.expAfter = this.experience;
    storyEntry.levelAfter = this.level;
    
    this.experienceStory.push(storyEntry);
  }

  levelUp() {
    this.level++;
    
    // Check for skill unlock
    if (Math.random() < CHARACTER_SYSTEM.SKILL_UNLOCK_CHANCE && 
        this.level >= CHARACTER_SYSTEM.MIN_LEVEL_FOR_SKILL) {
      const unlockedSkill = this.unlockRandomSkill();
      if (unlockedSkill) {
        notifications.show(`New skill unlocked: ${unlockedSkill.name}`);
      }
    }
    
    // Check for hair style unlock
    if (this.level >= CHARACTER_SYSTEM.MIN_LEVEL_FOR_HAIR &&
        this.level - this.lastHairUnlockLevel >= CHARACTER_SYSTEM.HAIR_COOLDOWN_LEVELS &&
        Math.random() < CHARACTER_SYSTEM.HAIR_UNLOCK_CHANCE) {
      const unlockedHair = this.unlockRandomHairStyle();
      if (unlockedHair) {
        this.lastHairUnlockLevel = this.level;
        
        notifications.show(`New hair style unlocked: ${CHARACTER_SYSTEM.HAIR_STYLES[unlockedHair.type][unlockedHair.id-1]}`);
      }
    }
    
    // Check for item unlock
    if (this.level >= CHARACTER_SYSTEM.MIN_LEVEL_FOR_ITEM &&
        this.level - this.lastItemUnlockLevel >= CHARACTER_SYSTEM.ITEM_COOLDOWN_LEVELS &&
        Math.random() < CHARACTER_SYSTEM.ITEM_UNLOCK_CHANCE) {
      const unlockedItem = this.unlockRandomItem();
      if (unlockedItem) {
        this.lastItemUnlockLevel = this.level;
        notifications.show(`New item unlocked: ${unlockedItem.name}`);
      }
    }
    
    // Check for skill level up
    if (this.level - this.lastSkillLevelUp >= CHARACTER_SYSTEM.SKILL_COOLDOWN_LEVELS &&
        Math.random() < CHARACTER_SYSTEM.SKILL_LEVEL_UP_CHANCE &&
        this.skillLevel < CHARACTER_SYSTEM.MAX_SKILL_LEVEL) {
      this.skillLevel++;
      this.lastSkillLevelUp = this.level;
      notifications.show(`Skill level increased to ${this.skillLevel}`);
    }
  }

  unlockRandomSkill() {
    const availableSkills = CHARACTER_SKILLS.filter(skill => 
      !this.unlockedSkills.includes(skill.id)
    );
    
    if (availableSkills.length > 0) {
      const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
      this.unlockedSkills.push(randomSkill.id);
      return randomSkill;
    }
    
    return null;
  }

  unlockRandomHairStyle() {
    const availableFrontHairs = [];
    const availableBackHairs = [];
    
    // Find all front hair styles not yet unlocked
    for (let i = 1; i <= CHARACTER_SYSTEM.HAIR_STYLES.front.length; i++) {
      if (!Account.characters.unlockedHairs.front.includes(i)) {
        availableFrontHairs.push(i);
      }
    }
    
    // Find all back hair styles not yet unlocked
    for (let i = 1; i <= CHARACTER_SYSTEM.HAIR_STYLES.back.length; i++) {
      if (!Account.characters.unlockedHairs.back.includes(i)) {
        availableBackHairs.push(i);
      }
    }
    
    // Randomly choose between front or back hair unlock
    const unlockType = Math.random() < 0.5 ? 'front' : 'back';
    const availableHairs = unlockType === 'front' ? availableFrontHairs : availableBackHairs;
    
    if (availableHairs.length > 0) {
      const randomHairId = availableHairs[Math.floor(Math.random() * availableHairs.length)];
      
      // Add to Account's unlocked hairs
      Account.characters.unlockedHairs[unlockType].push(randomHairId);
      
      // Save to localStorage
      localStorage.setItem("Account", JSON.stringify(Account));
      
      return {
        type: unlockType,
        id: randomHairId
      };
    }
    
    return null;
  }

  unlockRandomItem() {
    const allItems = [
      ...CHARACTER_ITEMS.clothing,
      ...CHARACTER_ITEMS.accessories
    ];
    
    const availableItems = allItems.filter(item => 
      !Account.characters.unlockedItems.includes(item.id)
    );
    
    if (availableItems.length > 0) {
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      
      // Add to Account's unlocked items
      Account.characters.unlockedItems.push(randomItem.id);
      
      // Save to localStorage
      localStorage.setItem("Account", JSON.stringify(Account));
      
      return randomItem;
    }
    
    return null;
  }

  getAvailableHairStyles() {
    return {
      front: Account.characters.unlockedHairs.front,
      back: Account.characters.unlockedHairs.back
    };
  }

  getAvailableItems() {
    return Account.characters.unlockedItems;
  }

  changeHairStyle(type, hairId) {
    if (type === 'front' && Account.characters.unlockedHairs.front.includes(hairId)) {
      this.appearance.frontHair = hairId;
      return true;
    } else if (type === 'back' && Account.characters.unlockedHairs.back.includes(hairId)) {
      this.appearance.backHair = hairId;
      return true;
    }
    return false;
  }

  changeClothing(itemId) {
    if (Account.characters.unlockedItems.includes(itemId)) {
      const item = CHARACTER_ITEMS.clothing.find(i => i.id === itemId) || 
                   CHARACTER_ITEMS.accessories.find(i => i.id === itemId);
      if (item) {
        if (item.type === 'clothing') {
          this.appearance.clothing = itemId;
        } else if (item.type === 'accessory') {
          this.appearance.accessory = itemId;
        }
        return true;
      }
    }
    return false;
  }

  getRequiredExperience() {
    return CHARACTER_SYSTEM.EXPERIENCE_CURVE(this.level);
  }

  getExperienceProgress() {
    const required = this.getRequiredExperience();
    return this.experience / required;
  }

  canUseSkill() {
    return this.skillLevel > 0 && this.unlockedSkills.length > 0;
  }

  toJSON() {
    return {
      name: this.name,
      level: this.level,
      experience: this.experience,
      skillLevel: this.skillLevel,
      unlockedSkills: this.unlockedSkills,
      selectedSkill: this.selectedSkill,
      appearance: this.appearance,
      stats: this.stats,
      lastSkillLevelUp: this.lastSkillLevelUp,
      lastHairUnlockLevel: this.lastHairUnlockLevel,
      lastItemUnlockLevel: this.lastItemUnlockLevel
    };
  }
}

class CharacterDisplay extends Phaser.Sprite {
  constructor(x, y, characterData) {
    super(game, x, y);
    this.character = characterData;
    this.layers = {};
    if (characterData) {
      this.createLayers();
    }
    game.add.existing(this);
  }

  createLayers() {
    // Back hair layer (bottom)
    this.layers.backHair = game.add.sprite(0, 0, `character_back_hair_${this.character.appearance.backHair}`);
    this.layers.backHair.tint = this.character.appearance.hairColor;
    this.addChild(this.layers.backHair);

    // Base layer (skin)
    this.layers.base = game.add.sprite(0, 0, 'character_base', this.character.appearance.skinTone);
    this.addChild(this.layers.base);

    // Front hair layer
    this.layers.frontHair = game.add.sprite(0, 0, `character_front_hair_${this.character.appearance.frontHair}`);
    this.layers.frontHair.tint = this.character.appearance.hairColor;
    this.addChild(this.layers.frontHair);

    // Eyes layer with blinking animation
    this.layers.eyes = game.add.sprite(0, 0, 'character_eyes', 0);
    this.addChild(this.layers.eyes);
    this.setupBlinking();

    // Clothing layer
    this.layers.clothing = game.add.sprite(0, 0, `character_clothing_${this.character.appearance.clothing}`);
    this.addChild(this.layers.clothing);
    
    // Accessory layer (if equipped)
    if (this.character.appearance.accessory) {
      this.layers.accessory = game.add.sprite(0, 0, `character_accessory_${this.character.appearance.accessory}`);
      this.addChild(this.layers.accessory);
    }
    
    this.setClothingVisibility();
  }

  setClothingVisibility() {
    const clothingItem = CHARACTER_ITEMS.clothing.find(item => item.id === this.character.appearance.clothing);
    const visible = clothingItem.hideCharacter ? false : true;
      
    this.layers.backHair.visible = visible;
    this.layers.base.visible = visible;
    this.layers.frontHair.visible = visible;
    this.layers.eyes.visible = visible;
    this.layers.frontHair.visible = visible;
    if (this.layers.accessory) this.layers.accessory.visible = visible;
  }

  setupBlinking() {
    const blinkFrames = [0, 1, 2, 3, 2, 1, 0];
    this.layers.eyes.animations.add('blink', blinkFrames, 16, false);
    this.startBlinking();
  }

  startBlinking() {
    const nextBlink = game.rnd.between(500, 5000);
    this.blink(nextBlink, () => {
      this.startBlinking();
    });
  }
  
  blink(time, callback) {
    game.time.events.add(time, () => {
      if (this.layers.eyes) {
        this.layers.eyes.animations.play('blink');
        this.layers.eyes.animations.currentAnim.onComplete.addOnce(() => callback?.());
      }
    });
  }

  updateAppearance(newAppearance) {
    this.character.appearance = { ...this.character.appearance, ...newAppearance };
    
    if (this.layers.backHair) {
      this.layers.backHair.tint = this.character.appearance.hairColor;
      if (newAppearance.backHair) {
        this.layers.backHair.loadTexture(`character_back_hair_${newAppearance.backHair}`);
      }
    }
    
    if (this.layers.frontHair) {
      this.layers.frontHair.tint = this.character.appearance.hairColor;
      if (newAppearance.frontHair) {
        this.layers.frontHair.loadTexture(`character_front_hair_${newAppearance.frontHair}`);
      }
    }
    
    if (this.layers.base && newAppearance.skinTone !== undefined) {
      this.layers.base.frame = this.character.appearance.skinTone;
    }
    
    if (this.layers.clothing && newAppearance.clothing) {
      this.layers.clothing.loadTexture(`character_clothing_${newAppearance.clothing}`);
    }
    
    if (newAppearance.accessory !== undefined) {
      if (this.layers.accessory) {
        this.layers.accessory.destroy();
      }
      if (newAppearance.accessory) {
        this.layers.accessory = game.add.sprite(0, 0, `character_accessory_${newAppearance.accessory}`);
        this.addChild(this.layers.accessory);
      }
    }
    
    this.setClothingVisibility();
  }

  destroy() {
    Object.values(this.layers).forEach(layer => {
      if (layer && layer.destroy) layer.destroy();
    });
    this.layers = {};
    super.destroy();
  }
}

class CharacterCroppedDisplay extends CharacterDisplay {
  constructor(x, y, characterData, cropArea) {
    super(0, 0, characterData);
    this.cropArea = cropArea;
    this.cropSprite();
    this.x = x;
    this.y = y;
  }

  cropSprite() {
    Object.values(this.layers).forEach(layer => {
      if (layer) {
        layer.crop(new Phaser.Rectangle(
          this.cropArea.x,
          this.cropArea.y,
          this.cropArea.w,
          this.cropArea.h
        ));
      }
    });
  }

  updateAppearance(newAppearance) {
    super.updateAppearance(newAppearance);
    this.cropSprite();
  }
}

class CharacterPortrait extends CharacterCroppedDisplay {
  constructor(x, y, characterData) {
    super(x, y, characterData, CHARACTER_SYSTEM.PORTRAIT_CROP);
  }
}

class CharacterCloseShot extends CharacterCroppedDisplay {
  constructor(x, y, characterData) {
    super(x, y, characterData, CHARACTER_SYSTEM.CLOSE_SHOT_CROP);
  }
}

class CharacterManager {
  constructor() {
    this.characters = new Map();
    this.currentCharacter = null;
    this.loadFromAccount();
  }

  loadFromAccount() {
    if (!Account.characters) {
      Account.characters = JSON.parse(JSON.stringify(DEFAULT_ACCOUNT.characters));
    }

    Account.characters.list.forEach(charData => {
      const character = new Character(charData);
      this.characters.set(character.name, character);
    });
    
    if (Account.characters.currentCharacter) {
      this.currentCharacter = this.characters.get(Account.characters.currentCharacter) || 
                             this.characters.values().next().value;
    } else {
      this.currentCharacter = null;
    }
  }

  createCharacter(name, appearance = {}) {
    if (this.characters.has(name) || name.length > CHARACTER_SYSTEM.MAX_NAME_LENGTH) {
      return null;
    }

    const newCharacter = new Character({
      name: name,
      appearance: {
        skinTone: appearance.skinTone || 0,
        hairColor: appearance.hairColor || 0xFFFFFF,
        frontHair: appearance.frontHair || "1",
        backHair: appearance.backHair || "1",
        clothing: appearance.clothing || "school_uniform",
        accessory: appearance.accessory || null
      }
    });

    this.characters.set(name, newCharacter);
    Account.characters.list.push(newCharacter.toJSON());
    saveAccount();

    return newCharacter;
  }

  deleteCharacter(name) {
    if (this.characters.size <= 1) this.unsetCharacter;
    
    const deleted = this.characters.delete(name);
    if (deleted) {
      Account.characters.list = Account.characters.list.filter(char => char.name !== name);
      
      if (Account.characters.currentCharacter === name) {
        Account.characters.currentCharacter = this.characters.keys().next().value;
        this.currentCharacter = this.characters.get(Account.characters.currentCharacter);
      }
      
      saveAccount();
    }
    
    return deleted;
  }
  
  unsetCharacter() {
    this.currentCharacter = null;
    Account.characters.currentCharacter = null;
    saveAccount();
  }

  setCurrentCharacter(name) {
    const character = this.characters.get(name);
    if (character) {
      this.currentCharacter = character;
      Account.characters.currentCharacter = name;
      saveAccount();
      return true;
    }
    return false;
  }

  updateCharacterStats(gameResults) {
    if (!this.currentCharacter) return 0;

    const char = this.currentCharacter;
    char.stats.gamesPlayed++;
    char.stats.totalScore += gameResults.score;
    char.stats.maxCombo = Math.max(char.stats.maxCombo, gameResults.maxCombo);
    
    if (gameResults.accuracy >= 99) {
      char.stats.perfectGames++;
    }

    char.stats.skillsUsed += gameResults.skillsUsed || 0;

    const expGain = this.calculateExperienceGain(gameResults);
    char.addExperience(expGain);

    const accountChar = Account.characters.list.find(c => c.name === char.name);
    if (accountChar) {
      Object.assign(accountChar, char.toJSON());
    }
    
    saveAccount();
    
    return expGain;
  }

  calculateExperienceGain(gameResults) {
    let exp = 0;
    
    // Minimum performance requirements - no experience for giving up early
    const totalNotes = Object.values(gameResults.judgements).reduce((a, b) => a + b, 0);
    
    // Require at least 25 notes played to get any experience
    if (totalNotes < 25) {
      return 0;
    }
    
    // Require minimum accuracy threshold (50%) to get any experience
    if (gameResults.accuracy < 40) {
      return 0;
    }
    
    // Base completion bonus (only if player completed meaningful portion of song)
    if (gameResults.accuracy >= 70) {
      exp += 2;
    }
    
    // Accuracy bonuses (only for decent to excellent performance)
    if (gameResults.accuracy >= 100) exp += 8;    // Impeccable 
    else if (gameResults.accuracy >= 99) exp += 6; // Nearly perfect
    else if (gameResults.accuracy >= 97) exp += 5; // Excellent
    else if (gameResults.accuracy >= 95) exp += 4; // Great
    else if (gameResults.accuracy >= 90) exp += 3; // Good
    else if (gameResults.accuracy >= 85) exp += 2; // Decent
    else if (gameResults.accuracy >= 80) exp += 1; // Okay
    // 70-79% gets base completion only
    
    // Combo milestones (only meaningful chains)
    if (gameResults.maxCombo >= 1000) exp += 8;   // Incredible
    else if (gameResults.maxCombo >= 500) exp += 6; // Amazing
    else if (gameResults.maxCombo >= 250) exp += 4; // Impressive
    else if (gameResults.maxCombo >= 100) exp += 3; // Solid
    else if (gameResults.maxCombo >= 50) exp += 2;  // Good chain
    // No bonus for chains under 50
    
    // Full combo bonus (significant reward for perfect play)
    if (gameResults.maxCombo > 0 && gameResults.judgements.miss === 0) {
      exp += 8;
      
      // Perfect game bonus (all marvelous/perfect)
      const perfectNotes = (gameResults.judgements.marvelous || 0) + (gameResults.judgements.perfect || 0);
      if (perfectNotes === totalNotes) {
        exp += 4; // Perfect game bonus
      }
    }
    
    // Judgement quality bonus (only for high precision)
    if (totalNotes > 0) {
      const marvelousRate = (gameResults.judgements.marvelous || 0) / totalNotes;
      const perfectRate = (gameResults.judgements.perfect || 0) / totalNotes;
      
      if (marvelousRate >= 0.8) exp += 3;        // Mostly marvelous
      else if (marvelousRate >= 0.6) exp += 2;   // Many marvelous
      else if (perfectRate >= 0.9) exp += 2;     // Very consistent
      // No bonus for lower precision rates
    }
    
    // Difficulty multiplier (scaled down)
    if (gameResults.difficultyRating) {
      if (gameResults.difficultyRating >= 11) exp += 3;    // Expert
      else if (gameResults.difficultyRating >= 9) exp += 2; // Hard
      else if (gameResults.difficultyRating >= 5) exp += 1;  // Medium
      // Easy gets no extra bonus
    }
    
    // Skill usage bonus (small incentive)
    if (gameResults.skillsUsed > 0) {
      exp += gameResults.skillsUsed; // Up to 5 exp for skill usage
    }
    
    return exp;
}

  unlockHair(type, id) {
    if (!Account.characters.unlockedHairs[type].includes(id)) {
      Account.characters.unlockedHairs[type].push(id);
      saveAccount();
      return true;
    }
    return false;
  }

  unlockItem(itemId) {
    if (!Account.characters.unlockedItems.includes(itemId)) {
      Account.characters.unlockedItems.push(itemId);
      saveAccount();
      return true;
    }
    return false;
  }

  getCharacterList() {
    return Array.from(this.characters.values());
  }

  getCurrentCharacter() {
    return this.currentCharacter;
  }

  saveToAccount() {
    Account.characters.list = this.getCharacterList().map(char => char.toJSON());
    Account.characters.currentCharacter = this.currentCharacter ? this.currentCharacter.name : null;
    saveAccount();
  }
}

class CharacterSkillSystem {
  constructor(scene, character) {
    this.scene = scene;
    this.character = character || scene.character;
    this.activeSkills = new Map();
    this.skillCooldowns = new Map();
    this.skillsUsedThisGame = 0;
    this.skillEffects = {
      judgementConversion: null,
      judgementWindowMultiplier: 1.0,
      healthRegen: null,
      maxHealthBonus: 0,
      noteSpeedMultiplier: 1.0,
      holdForgivenessMultiplier: 1.0,
      rollForgivenessMultiplier: 1.0,
      mineDamageMultiplier: 1.0,
      scoreMultipliers: {},
      healthGainMultiplier: 1.0,
      comboShield: false,
      inputLagReduction: 0
    };
  }

  // Main method to check and activate skills
  checkSkillActivation(condition, params = {}) {
    if (!this.character || this.exhausted) return;

    const availableSkills = this.character.unlockedSkills
      .map(skillId => CHARACTER_SKILLS.find(s => s.id === skillId));

    const selectedSkill = availableSkills.find(s => s.id === this.character.selectedSkill);

    if (selectedSkill && selectedSkill.activationCondition === condition && this.canActivateSkill(selectedSkill, params)) {
      this.activateSkill(selectedSkill, params);
      this.skillsUsedThisGame++;
    }
  }

  canActivateSkill(skill, params) {
    if (this.exhausted) return false;
    if (this.skillCooldowns.has(skill.id)) return false;
    if (this.scene.autoPlay) return false;

    switch (skill.activationCondition) {
      case 'on_miss':
        return params.judgement === 'miss';
      case 'on_combo':
        return params.combo >= (skill.effectParams.threshold || 50);
      case 'on_low_health':
        return params.health <= (skill.effectParams.threshold || 30);
      case 'on_high_combo':
        return params.combo >= (skill.effectParams.threshold || 100);
      case 'on_perfect_streak':
        return params.perfectStreak >= (skill.effectParams.threshold || 10);
      case 'on_mine_hit':
        return true;
      case 'on_critical_health':
        return params.health <= (skill.effectParams.threshold || 15);
      case 'custom':
        return skill.activationCheckFunction ? skill.activationCheckFunction() : false;
      default:
        return true;
    }
  }

  activateSkill(skill, params) {
    // Apply skill effect
    this.applySkillEffect(skill);
    
    // Set cooldown
    if (skill.cooldown > 0) {
      this.skillCooldowns.set(skill.id, game.time.now + skill.cooldown);
      game.time.events.add(skill.cooldown, () => {
        this.skillCooldowns.delete(skill.id);
      });
    }

    // Show visual feedback
    this.scene?.showCharacterCloseShot(skill.duration || 1800);

    // Handle duration-based skills
    if (skill.duration > 0) {
      this.activeSkills.set(skill.id, {
        skill: skill,
        startTime: game.time.now,
        endTime: game.time.now + skill.duration
      });

      game.time.events.add(skill.duration, () => {
        this.deactivateSkill(skill.id);
      });
    }

    // Trigger notification
    this.notifySkillUsed(skill);
  }
  
  notifySkillUsed(skill) {
    // Notify what skill was used
    const x = 4;
    const y = 32;
    const width = 8 + skill.name.length * 4;
    const height = 8;
    const bgcolor = "rgba(44, 90, 198, 0.6)";
    
    const bitmap = game.add.bitmapData(width, height);
    
    const gradient = bitmap.context.createLinearGradient(0, 0, width, 0);
    
    gradient.addColorStop(0, bgcolor);
    gradient.addColorStop(0.7, bgcolor);
    gradient.addColorStop(1, 'transparent');
    
    bitmap.context.fillStyle = gradient;
    bitmap.context.fillRect(0, 0, width, height);
    
    const background = game.add.sprite(-width, y, bitmap);
    background.alpha = 0;
    
    const text = new Text(4, 1, skill.name, FONTS.default, background);
    
    game.add.tween(background).to({ alpha: 1, x }, 350, Phaser.Easing.Quadratic.Out, true).yoyo(true).yoyoDelay(1000);
  }

  applySkillEffect(skill) {
    switch (skill.effect) {
      case 'convert_judgement':
        this.skillEffects.judgementConversion = skill.effectParams;
        break;
        
      case 'modify_judgement_window':
        this.skillEffects.judgementWindowMultiplier = skill.effectParams.multiplier;
        break;
        
      case 'health_regen':
        this.startHealthRegen(skill.effectParams);
        break;
        
      case 'modify_max_health':
        this.skillEffects.maxHealthBonus = skill.effectParams.amount;
        break;
        
      case 'modify_note_speed':
        this.skillEffects.noteSpeedMultiplier = skill.effectParams.multiplier;
        this.scene.showGlitchAnimation(100);
        break;
        
      case 'modify_hold_forgiveness':
        this.skillEffects.holdForgivenessMultiplier = skill.effectParams.multiplier;
        break;
        
      case 'modify_roll_forgiveness':
        this.skillEffects.rollForgivenessMultiplier = skill.effectParams.multiplier;
        break;
        
      case 'reduce_mine_damage':
        this.skillEffects.mineDamageMultiplier = skill.effectParams.multiplier;
        break;
        
      case 'modify_score_gain':
        this.skillEffects.scoreMultipliers[skill.effectParams.judgement] = skill.effectParams.multiplier;
        break;
        
      case 'modify_health_gain':
        this.skillEffects.healthGainMultiplier = skill.effectParams.multiplier;
        break;
        
      case 'combo_shield':
        this.skillEffects.comboShield = true;
        if (this.onComboShield) {
          this.onComboShield();
        }
        break;
        
      case 'modify_input_lag':
        this.skillEffects.inputLagReduction = skill.effectParams.reduction;
        break;
        
      case 'burst_health_regen':
        if (this.onHealthRegen) {
          this.onHealthRegen(skill.effectParams.amount);
        }
        break;
        
      case 'stabilize_judgement':
        // This skill reduces timing variation - implemented in Player's timing calculations
        break;
        
      case 'general_boost':
        this.skillEffects.judgementWindowMultiplier = skill.effectParams.windowMultiplier;
        this.skillEffects.healthGainMultiplier = skill.effectParams.healthMultiplier;
        break;
    }
  }

  deactivateSkill(skillId) {
    const skillData = this.activeSkills.get(skillId);
    if (!skillData) return;

    const skill = skillData.skill;
    
    switch (skill.effect) {
      case 'convert_judgement':
        this.skillEffects.judgementConversion = null;
        break;
        
      case 'modify_judgement_window':
        this.skillEffects.judgementWindowMultiplier = 1.0;
        break;
        
      case 'health_regen':
        this.stopHealthRegen();
        break;
        
      case 'modify_max_health':
        this.skillEffects.maxHealthBonus = 0;
        break;
        
      case 'modify_note_speed':
        this.skillEffects.noteSpeedMultiplier = 1.0;
        this.scene.showGlitchAnimation(100);
        break;
        
      case 'modify_hold_forgiveness':
        this.skillEffects.holdForgivenessMultiplier = 1.0;
        break;
        
      case 'modify_roll_forgiveness':
        this.skillEffects.rollForgivenessMultiplier = 1.0;
        break;
        
      case 'reduce_mine_damage':
        this.skillEffects.mineDamageMultiplier = 1.0;
        break;
        
      case 'modify_score_gain':
        delete this.skillEffects.scoreMultipliers[skill.effectParams.judgement];
        break;
        
      case 'modify_health_gain':
        this.skillEffects.healthGainMultiplier = 1.0;
        break;
        
      case 'combo_shield':
        this.skillEffects.comboShield = false;
        break;
        
      case 'modify_input_lag':
        this.skillEffects.inputLagReduction = 0;
        break;
        
      case 'general_boost':
        this.skillEffects.judgementWindowMultiplier = 1.0;
        this.skillEffects.healthGainMultiplier = 1.0;
        break;
    }

    this.activeSkills.delete(skillId);
  }

  startHealthRegen(params) {
    this.stopHealthRegen(); // Stop any existing regen
    
    this.healthRegenTimer = game.time.events.loop(params.interval, () => {
      if (this.onHealthRegen) {
        this.onHealthRegen(params.amount);
      }
    });
  }

  stopHealthRegen() {
    if (this.healthRegenTimer) {
      game.time.events.remove(this.healthRegenTimer);
      this.healthRegenTimer = null;
    }
  }
  
  // Getters for skill effects (used by Player class)
  getJudgementConversion() {
    if (this.exhausted) {
      return null;
    } else {
      return this.skillEffects.judgementConversion;
    }
  }

  getJudgementWindowMultiplier() {
    return this.skillEffects.judgementWindowMultiplier;
  }

  getMaxHealthBonus() {
    return this.skillEffects.maxHealthBonus;
  }

  getNoteSpeedMultiplier() {
    return this.skillEffects.noteSpeedMultiplier;
  }

  getHoldForgivenessMultiplier() {
    return this.skillEffects.holdForgivenessMultiplier;
  }

  getRollForgivenessMultiplier() {
    return this.skillEffects.rollForgivenessMultiplier;
  }

  getMineDamageMultiplier() {
    return this.skillEffects.mineDamageMultiplier;
  }

  getScoreMultiplier(judgement) {
    return this.skillEffects.scoreMultipliers[judgement] || 1.0;
  }

  getHealthGainMultiplier() {
    return this.skillEffects.healthGainMultiplier;
  }

  getInputLagReduction() {
    return this.skillEffects.inputLagReduction;
  }

  update() {
    const currentTime = game.time.now;
    
    // Abort if no character
    if (!this.character) return;
    
    // Update exhausted state
    this.exhausted = this.skillsUsedThisGame >= this.character.skillLevel;
    
    // Update active skills
    for (const [skillId, skillData] of this.activeSkills) {
      if (currentTime >= skillData.endTime) {
        this.deactivateSkill(skillId);
      }
    }

    // Update cooldowns
    for (const [skillId, cooldownEnd] of this.skillCooldowns) {
      if (currentTime >= cooldownEnd) {
        this.skillCooldowns.delete(skillId);
      }
    }
    
    // Update skill bar
    this.scene.skillBar.value = (5 - (5 - this.character.skillLevel)) - this.getSkillsUsed();
    this.scene.skillBar.visibleParts = this.character.skillLevel;
    this.scene.skillBar.update();
  }

  resetGame() {
    for (const skillId of this.activeSkills.keys()) {
      this.deactivateSkill(skillId);
    }
    this.activeSkills.clear();
    this.skillCooldowns.clear();
    this.skillsUsedThisGame = 0;
    
    // Reset all effects
    this.skillEffects = {
      judgementConversion: null,
      judgementWindowMultiplier: 1.0,
      healthRegen: null,
      maxHealthBonus: 0,
      noteSpeedMultiplier: 1.0,
      holdForgivenessMultiplier: 1.0,
      rollForgivenessMultiplier: 1.0,
      mineDamageMultiplier: 1.0,
      scoreMultipliers: {},
      healthGainMultiplier: 1.0,
      comboShield: false,
      inputLagReduction: 0
    };
    
    this.stopHealthRegen();
  }

  getSkillsUsed() {
    return this.skillsUsedThisGame;
  }
}

class AchievementsManager {
  constructor() {
    this.newAchievements = [];

    // Time tracking properties
    this.timeUpdateInterval = null;
    this.sessionStartTime = null;
    this.lastUpdateTime = null;
    this.isTracking = false;
  }

  initialize() {
    // Initialize achievements progress if not exists
    if (!Account.achievements) {
      Account.achievements = {
        unlocked: {},
        progress: {}
      };
    }

    // Initialize stats if not exists
    if (!Account.stats) {
      Account.stats = JSON.parse(JSON.stringify(DEFAULT_ACCOUNT.stats));
    }
    
    // Add holidays to achievement definitions
    const holidays = this.getHolidays();
    for (let monthId = 0; monthId <= 11; monthId ++) {
      const month = holidays[monthId];
      
      if (!month) continue;
      
      for (let dateId = 0; dateId <= 31; dateId ++) {
        const dateName = month[dateId];
        
        if (dateName) ACHIEVEMENT_DEFINITIONS.push({
          id: `holiday_day_${monthId}_${dateId}`,
          name: dateName,
          category: ACHIEVEMENT_CATEGORIES.HOLIDAYS,
          description: {
            unachieved: `Play on ${dateName} (${dateId}/${monthId})`,
            achieved: `You played on ${dateName}!`
          },
          expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
          condition: () => {
            const { month, date } = this.getDate();
            return monthId === month && dateId === date;
          },
          hidden: false
        });
      }
    }

    // Initialize all achievements progress
    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
      if (!Account.achievements.progress[achievement.id]) {
        Account.achievements.progress[achievement.id] = 0;
      }
    });

    // Start new session
    this.startSession();

    // Start time tracking
    this.startTimeTracking();

    // Set up window event listeners for session management
    this.setupWindowEvents();

    console.log("Achievements Manager initialized");
  }

  startSession() {
    this.sessionStartTime = Date.now();
    this.lastUpdateTime = this.sessionStartTime;

    // Only count as new session if not resuming
    if (!Account.stats.currentSessionStart) {
      Account.stats.totalPlaySessions++;
      Account.stats.currentSessionStart = this.sessionStartTime;
    }

    this.updatePlayStreak();
    this.checkTimeBasedConditions();

    console.log("New play session started");
  }

  startTimeTracking() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }

    this.timeUpdateInterval = setInterval(() => {
      this.updateTimeStats();
    }, 100);

    this.isTracking = true;
  }

  updateTimeStats() {
    if (!this.isTracking || !this.sessionStartTime) return;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - this.lastUpdateTime) / 1000);

    if (elapsedSeconds > 0) {
      // Update total time played
      Account.stats.totalTimePlayed += elapsedSeconds;

      // Update current session duration for longest session tracking
      const currentSessionDuration = Math.floor((now - this.sessionStartTime) / 1000);
      if (currentSessionDuration > Account.stats.longestSession) {
        Account.stats.longestSession = currentSessionDuration;
      }

      this.lastUpdateTime = now;

      // Update Achievements every minute
      if (elapsedSeconds >= 60 || this.lastUpdateTime % 60000 < 1000) {
        this.checkAchievements();
      }
    }
  }

  updatePlayStreak() {
    const now = new Date();
    const today = now.toDateString();
    const lastPlayed = Account.stats.lastPlayedDate;

    if (!lastPlayed) {
      // First time playing
      Account.stats.currentStreak = 1;
      Account.stats.longestStreak = Math.max(Account.stats.longestStreak, 1);
    } else {
      const lastPlayedDate = new Date(lastPlayed);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastPlayedDate.toDateString() === yesterday.toDateString()) {
        // Consecutive day
        Account.stats.currentStreak++;
        Account.stats.longestStreak = Math.max(Account.stats.longestStreak, Account.stats.currentStreak);
      } else if (lastPlayedDate.toDateString() !== today) {
        // Streak broken
        Account.stats.currentStreak = 1;
      }
    }

    Account.stats.lastPlayedDate = today;
  }

  checkTimeBasedConditions() {
    const { now, currentHour, currentDay, month, date } = this.getDate();
        
    // Early morning (5 AM - 9 AM)
    if (currentHour >= 5 && currentHour < 9) {
      Account.stats.playedEarlyMorning = true;
    }

    // Night (midnight - 4 AM)
    if (currentHour >= 0 && currentHour < 4) {
      Account.stats.playedAtNight = true;
    }

    // Weekend (Saturday or Sunday)
    if (currentDay === 0 || currentDay === 6) {
      Account.stats.playedWeekend = true;
    }

    // Holiday detection
    const isHoliday = this.isHoliday(month, date);
    if (isHoliday) {
      Account.stats.playedHoliday = true;
    }
  }
  
  getDate() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const month = now.getMonth();
    const date = now.getDate();
    return { now, currentHour, currentDay, month, date };
  }

  getHolidays() {
    // Comprehensive holiday calendary (US holidays)
    // TODO: Region specific holidays
    return {
      0: {
        // January
        1: "New Year's Day"
      },
      1: {
        // February
        14: "Valentine's Day"
      },
      2: {
        // March
        17: "St. Patrick's Day"
      },
      3: {
        // April
      },
      4: {
        // May
        5: "Cinco de Mayo"
      },
      5: {
        // June
        14: "Flag Day"
      },
      6: {
        // July
        4: "Independence Day"
      },
      7: {
        // August
      },
      8: {
        // September
        11: "9/11 Memorial"
      },
      9: {
        // October
        26: "PadManiacs Day", // First release of the game
        31: "Halloween"
      },
      10: {
        // November
        11: "Veterans Day",
        25: "39 Giving" // Thanksgiving, Renamed to "39 Giving" by DECO*27's song: 39
      },
      11: {
        // December
        24: "Christmas Eve",
        25: "Christmas",
        31: "New Year's Eve"
      } 
    }
  }
  
  getHolidayName(month, date) {
    const holidays = this.getHolidays();
    if (holidays[month]) {
      const currentDate = holidays[month][date];
      if (currentDate) {
        return currentDate;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  isHoliday(month, date) {
    const holidays = this.getHolidays();
    return holidays[month] && holidays[month][date] !== undefined;
  }

  setupWindowEvents() {
    // Handle page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.onPageHide();
      } else {
        this.onPageShow();
      }
    });

    // Handle page unload
    window.addEventListener("beforeunload", () => {
      this.endSession();
    });

    // Handle page freeze (some mobile browsers)
    document.addEventListener("freeze", () => {
      this.onPageHide();
    });

    document.addEventListener("resume", () => {
      this.onPageShow();
    });
  }

  onPageHide() {
    // Page is being hidden - pause time tracking
    this.isTracking = false;
    console.log("Page hidden - time tracking paused");
  }

  onPageShow() {
    // Page is visible again - resume time tracking
    if (!this.isTracking) {
      this.lastUpdateTime = Date.now();
      this.isTracking = true;
      console.log("Page visible - time tracking resumed");
    }
  }

  endSession() {
    // Final time update
    this.updateTimeStats();

    // Clear intervals
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }

    // Update average session time
    if (Account.stats.totalPlaySessions > 0) {
      Account.stats.averageSessionTime = Math.floor(Account.stats.totalTimePlayed / Account.stats.totalPlaySessions);
    }

    // Clear current session
    Account.stats.currentSessionStart = null;

    this.isTracking = false;
    this.sessionStartTime = null;
    
    saveAccount();

    console.log("Play session ended");
  }

  updateStats(gameResults = null) {
    if (!Account.stats) return;

    if (gameResults) {
      this.updateGameStats(gameResults);
    }

    // Update play streak periodically (once per minute)
    const now = Date.now();
    if (!this.lastStreakUpdate || now - this.lastStreakUpdate > 60000) {
      this.updatePlayStreak();
      this.lastStreakUpdate = now;
    }

    // Check for new achievements
    const newAchievements = this.checkAchievements();

    if (newAchievements.length > 0) {
      console.log(`Unlocked ${newAchievements.length} new achievements`);
    }

    return newAchievements;
  }

  updateGameStats(gameResults) {
    if (Account.settings.autoplay) return;

    Account.stats.totalGamesPlayed++;
    Account.stats.totalScore += gameResults.score;
    Account.stats.maxCombo = Math.max(Account.stats.maxCombo, gameResults.maxCombo);

    if (gameResults.accuracy >= 100) {
      Account.stats.perfectGames++;
    }

    // Update judgement counts
    const judgements = gameResults.judgements || {};
    Account.stats.totalNotesHit += Object.values(judgements).reduce((a, b) => a + b, 0);
    Account.stats.totalMarvelous += judgements.marvelous || 0;
    Account.stats.totalPerfect += judgements.perfect || 0;
    Account.stats.totalGreat += judgements.great || 0;
    Account.stats.totalGood += judgements.good || 0;
    Account.stats.totalBoo += judgements.boo || 0;
    Account.stats.totalMiss += judgements.miss || 0;

    // Update max values
    Account.stats.maxMarvelousInGame = Math.max(Account.stats.maxMarvelousInGame, judgements.marvelous || 0);

    Account.stats.maxSkillsInGame = Math.max(Account.stats.maxSkillsInGame, gameResults.skillsUsed || 0);

    // Update character stats if available
    if (gameResults.character) {
      Account.stats.maxCharacterLevel = Math.max(Account.stats.maxCharacterLevel, gameResults.character.level || 1);

      Account.stats.skillsUnlocked = Math.max(Account.stats.skillsUnlocked, gameResults.character.unlockedSkills?.length || 0);
    }
  }

  checkAchievements() {
    const newlyUnlocked = [];

    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
      if (!Account.achievements.unlocked[achievement.id]) {
        const progress = achievement.condition(
          Account.stats,
          Account.lastSong || {
            url: null,
            title: "",
            artist: "",
            sampleStart: 0,
            isExternal: false, // Flag for external songs
            score: 0,
            accuracy: 0,
            maxCombo: 0,
            judgements: {
              marvelous: 0,
              perfect: 0,
              great: 0,
              good: 0,
              boo: 0,
              miss: 0
            },
            totalNotes: 0,
            skillsUsed: 0,
            difficultyRating: 0,
            complete: false
          }
        );

        if (progress && !Account.achievements.unlocked[achievement.id]) {
          // Unlock achievement
          Account.achievements.unlocked[achievement.id] = {
            unlockedAt: Date.now(),
            expReward: achievement.expReward
          };

          newlyUnlocked.push(achievement);

          saveAccount();

          // Show notification
          notifications.showAchievement(achievement);

          // Award experience to current character if available
          this.awardAchievementExp(achievement);
        }
      }
    });

    this.newAchievements = newlyUnlocked;
    return newlyUnlocked;
  }

  awardAchievementExp(achievement) {
    if (achievement.expReward > 0) {
      const characterManager = new CharacterManager();
      const currentCharacter = characterManager.getCurrentCharacter();

      if (currentCharacter) {
        currentCharacter.addExperience(achievement.expReward);

        const { levelBefore, levelAfter, expBefore, expAfter } = currentCharacter.getLastExperienceStoryEntry();

        // Show exp gain notification
        //notifications.showExpGain(currentCharacter, achievement.expReward, levelBefore, levelAfter, expBefore, expAfter);

        characterManager.saveToAccount();
      }
    }
  }

  getUnlockedAchievements() {
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => Account.achievements.unlocked[achievement.id]);
  }

  getLockedAchievements() {
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => !Account.achievements.unlocked[achievement.id] && !achievement.hidden);
  }

  getHiddenAchievements() {
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => achievement.hidden && !Account.achievements.unlocked[achievement.id]);
  }

  getAchievementProgress(achievementId) {
    return Account.achievements.progress[achievementId] || 0;
  }

  getTotalUnlockedCount() {
    return Object.keys(Account.achievements.unlocked).length;
  }

  getTotalAchievementsCount() {
    return ACHIEVEMENT_DEFINITIONS.length;
  }

  getCompletionPercentage() {
    const total = this.getTotalAchievementsCount();
    const unlocked = this.getTotalUnlockedCount();
    return total > 0 ? Math.floor((unlocked / total) * 100) : 0;
  }

  getTimePlayedFormatted() {
    return this.formatTime(Account.stats.totalTimePlayed);
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  getCurrentSessionTime() {
    if (!this.sessionStartTime) return 0;
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }
  
  forceSave() {
    this.saveSessionState();
  }

  destroy() {
    this.endSession();

    // Clean up event listeners
    document.removeEventListener("visibilitychange", this.onPageHide);
    document.removeEventListener("visibilitychange", this.onPageShow);
    document.removeEventListener("freeze", this.onPageHide);
    document.removeEventListener("resume", this.onPageShow);
    window.removeEventListener("beforeunload", this.endSession);

    console.log("Achievements Manager destroyed");
  }
}

class Text extends Phaser.Sprite {
  constructor(x, y, text = "", config, parent) {
    config = {
      font: "font_tiny",
      fontMap: " ABCDEFGHIJKLMNOPQRSTUVWXYZ.,:!¡?¿h+-×*()[]/\\0123456789_'\"`•<>=%",
      fontWidth: 4,
      fontHeight: 6,
      typewriter: false,
      typewriterInterval: 100,
      ...config
    };
    
    super(game, x, y, null);
    
    this.config = config;

    this.texture = new Phaser.RetroFont(game, config.font, config.fontWidth, config.fontHeight, config.fontMap);

    this.texture.multiLine = true;
    this.texture.autoUpperCase = true;

    this.timer = game.time.create(false);

    this.typewriterInterval = config.typewriterInterval;

    if (config.typewriter) {
      this.typewriter(text);
    } else {
      this.write(text);
    }

    game.add.existing(this);
    
    if (parent) {
      if (parent instanceof Phaser.Group) parent.add(this);
      else if (parent instanceof PIXI.DisplayObjectContainer) parent.addChild(this);
    }
  }

  write(text, max) {
    if (typeof text != "string") return this;
    if (max && text.length > max) {
      this.scrollwrite(text, max);
    } else {
      if (this.timer.running) this.timer.stop();
      this.texture.text = text;
    }
    return this;
  }

  typewrite(text, callback) {
    if (this.timer.running) this.timer.stop();

    let index = 0;

    this.texture.text = "";

    this.timer.loop(this.typewriterInterval, () => {
      if (index < text.length) {
        this.write(this.texture.text + text[index]);
        index++;
      } else {
        callback && callback();
        this.timer.stop();
      }
    });

    this.timer.start();
    
    return this;
  }

  scrollwrite(text, visibleLength = 5, scrollSpeed = 200, separation = 5) {
    if (this.timer.running) this.timer.stop();
    
    // Prepare the text with separation spaces
    const fullText = text + ' '.repeat(separation);
    let position = 0;
    let direction = 1; // 1 for forward, -1 for backward (optional)
    let isScrolling = true;

    const update = () => {
      if (!this.visible || !isScrolling) return;

      // Extract the visible portion
      let visibleText = '';
      
      for (let i = 0; i < visibleLength; i++) {
        const charIndex = (position + i) % fullText.length;
        visibleText += fullText[charIndex];
      }

      this.texture.text = visibleText;

      // Move to next position
      position = (position + 1) % fullText.length;
    };
    
    this.timer.loop(scrollSpeed, () => update());
    
    update();

    this.timer.start();

    // Return methods to control the scrolling
    return {
      stop: () => {
        isScrolling = false;
        this.timer.stop();
      },
      pause: () => {
        isScrolling = false;
      },
      resume: () => {
        isScrolling = true;
      },
      setSpeed: (newSpeed) => {
        scrollSpeed = newSpeed;
        this.timer.loopDelay = newSpeed;
      }
    };
  }

  stopScrolling() {
    if (this.timer.running) {
      this.timer.stop();
    }
  }

  isScrolling() {
    return this.timer.running;
  }
  
  wrap(maxWidth, lineSpacing = 1) {
    if (!this.texture.text) return this;
    
    const originalText = this.texture.text;
    const charWidth = this.config.fontWidth || 4;
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);
    
    if (maxCharsPerLine <= 0) return this;
    
    const words = originalText.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      // Check if word itself is too long and needs to be broken
      if (word.length > maxCharsPerLine) {
        // If we have content in current line, push it first
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }
        
        // Break the long word into chunks
        let wordChunk = '';
        for (let j = 0; j < word.length; j++) {
          wordChunk += word[j];
          if (wordChunk.length >= maxCharsPerLine || j === word.length - 1) {
            lines.push(wordChunk);
            wordChunk = '';
          }
        }
        continue;
      }
      
      // Normal word wrapping
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    // Push the last line
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Join lines with newline characters
    const wrappedText = lines.join('\n');
    this.write(wrappedText);
    
    return this;
  }

  wrapPreserveNewlines(maxWidth, lineSpacing = 1) {
    if (!this.texture.text) return this;
    
    const originalText = this.texture.text;
    const charWidth = this.config.fontWidth || 4;
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);
    
    if (maxCharsPerLine <= 0) return this;
    
    const originalLines = originalText.split('\n');
    const wrappedLines = [];
    
    for (const line of originalLines) {
      if (line.length <= maxCharsPerLine) {
        wrappedLines.push(line);
        continue;
      }
      
      const words = line.split(' ');
      let currentLine = '';
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // Handle very long words
        if (word.length > maxCharsPerLine) {
          if (currentLine) {
            wrappedLines.push(currentLine);
            currentLine = '';
          }
          
          let wordChunk = '';
          for (let j = 0; j < word.length; j++) {
            wordChunk += word[j];
            if (wordChunk.length >= maxCharsPerLine || j === word.length - 1) {
              wrappedLines.push(wordChunk);
              wordChunk = '';
            }
          }
          continue;
        }
        
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        
        if (testLine.length <= maxCharsPerLine) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            wrappedLines.push(currentLine);
          }
          currentLine = word;
        }
      }
      
      if (currentLine) {
        wrappedLines.push(currentLine);
      }
    }
    
    const wrappedText = wrappedLines.join('\n');
    this.write(wrappedText);
    
    return this;
  }

  getWrappedText(maxWidth) {
    if (!this.texture.text) return '';
    
    const originalText = this.texture.text;
    const charWidth = this.config.fontWidth || 4;
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);
    
    if (maxCharsPerLine <= 0) return originalText;
    
    const words = originalText.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      if (word.length > maxCharsPerLine) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }
        
        let wordChunk = '';
        for (let j = 0; j < word.length; j++) {
          wordChunk += word[j];
          if (wordChunk.length >= maxCharsPerLine || j === word.length - 1) {
            lines.push(wordChunk);
            wordChunk = '';
          }
        }
        continue;
      }
      
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.join('\n');
  }
}

class Window extends Phaser.Sprite {
  constructor(x, y, width, height, skin = "1", parent = null) {
    super(game, x * 8, y * 8);

    this.size = {
      width,
      height
    };
    
    this.offset = {
      x: 0,
      y: 0
    };
    
    this.scrollOffset = 0;
    this.itemOffset = 1;
    this.visibleItems = height;
    this.selectedIndex = 0;
    this.focus = false;
    this.skin = skin;
    this.font = "default";
    this.fontTint = 0x76fcde;
    this.disableScrollBar = false;

    if (parent) {
      parent.addChild(this);
    } else {
      game.add.existing(this);
    }

    // Create window frame
    this.createWindowFrame();

    // Selection arrow
    this.selector = game.add.sprite(3, 0, `ui_window_${skin}`, 9);
    this.selector.visible = false;
    this.selector.animations.add('blink', [9, 10], 4, true);
    this.selector.animations.play('blink');
    this.addChild(this.selector);

    // Scroll bar
    this.scrollBar = game.add.graphics(this.size.width * 8 - 3, 8);
    this.scrollBar.alpha = 0; // Start hidden
    this.addChild(this.scrollBar);
    
    this.scrollBarTween = null;

    // Signals
    this.onSelect = new Phaser.Signal();
    this.onConfirm = new Phaser.Signal();
    this.onCancel = new Phaser.Signal();

    // Items array
    this.items = [];
    this.updateSelector();
  }

  createWindowFrame() {
    // Window frame parts
    this.frameParts = [];

    // Create corners and borders
    for (let y = 0; y < this.size.height; y++) {
      for (let x = 0; x < this.size.width; x++) {
        let frame = 4; // Default to center

        // Determine which frame to use
        if (y === 0) { // Top row
          if (x === 0) frame = 0; // Top-left corner
          else if (x >= this.size.width - 1) frame = 2; // Top-right corner
          else frame = 1; // Top border
        } else if (y === this.size.height - 1) { // Bottom row
          if (x === 0) frame = 6; // Bottom-left corner
          else if (x >= this.size.width - 1) frame = 8; // Bottom-right corner
          else frame = 7; // Bottom border
        } else { // Middle rows
          if (x === 0) frame = 3; // Left border
          else if (x >= this.size.width - 1) frame = 5; // Right border
          else frame = 4; // Center fill
        }

        const part = game.add.sprite(x * 8, y * 8, `ui_window_${this.skin}`, frame);
        this.addChild(part);
        this.frameParts.push(part);
      }
    }
  }

  addItem(text, valueText, callback = null, backButton = false) {
    const itemText = new Text(8 + this.offset.x, 0, text, {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    this.addChild(itemText);
    
    const itemValueText = new Text(this.size.width * 8 -8 - 4, 0, valueText, {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    itemValueText.anchor.x = 1;
    itemText.addChild(itemValueText);
    
    const item = {
      text: itemText,
      valueText: itemValueText,
      callback: callback,
      backButton: backButton,
      type: 'item',
      visible: true,
      setText: text => {
        itemText.write(text);
      },
      setValueText: text => {
        itemValueText.write(text);
      }
    };

    this.items.push(item);

    return item;
  }

  addSettingItem(text, options, currentIndex, callback = null) {
    const itemText = new Text(8 + this.offset.x, 0, text, {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    this.addChild(itemText);
    
    // Translate text
    options = options.map(option => Window.processMultilingual(option));

    const valueText = new Text(this.size.width * 8 -8- 4, 0, options[currentIndex].toString(), {
      ...FONTS[this.font],
      tint: this.fontTint
    });
    valueText.anchor.x = 1;
    itemText.addChild(valueText);

    const item = {
      text: itemText,
      valueText: valueText,
      options: options,
      currentIndex: currentIndex,
      callback: callback,
      type: 'setting',
      visible: true
    };

    this.items.push(item);
    this.update();
    return item;
  }
  
  static processMultilingual(text) {
    // Translate text only
    if (typeof text !== 'string') {
      return text;
    }

    // Handle simple split case (text||text)
    const simpleSplitRegex = /([^|(]+\|\|[^|)]+)/g;
    text = text.replace(simpleSplitRegex, match => {
      const parts = match.split('||');
      return parts[SETTINGS.language] || parts[0]; // Default to first part if language index is invalid
    });

    // Handle parenthetical cases (ES|EN)
    const parenRegex = /\(([^)|]+)\|([^)]+)\)/g;
    text = text.replace(parenRegex, (match, esText, enText) => {
      return SETTINGS.language === 0 ? esText : enText;
    });

    return text;
  }
  
  getVisibleHeight(excluding = 0) {
    return (this.size.height * 8) - (10 + this.offset.y);
  }

  update() {
    // Calculate visible items based on window height and item spacing
    const availableHeight = this.getVisibleHeight(); // Subtract padding
    this.visibleItems = Math.floor(availableHeight / 8);// Each item is 8px tall
    
    // Ensure we don't show more items than we have
    this.visibleItems = Math.min(this.visibleItems, this.items.length);
    
    // Ensure scroll offset is within bounds
    this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, this.items.length - this.visibleItems));

    // Calculate vertical centering
    const totalContentHeight = this.visibleItems * 8; // Total height of all visible items
    const startY = ((this.size.height * 8) - totalContentHeight) / 2; // Center the block of items

    this.items.forEach((item, index) => {
      const isVisible = index >= this.scrollOffset && index < this.scrollOffset + this.visibleItems;
      
      item.text.visible = isVisible;
      item.visible = isVisible;
      item.text.tint = this.fontTint;
      if (item.valueText) item.valueText.tint = this.fontTint;

      if (isVisible) {
        // Calculate Y position with vertical centering
        const visibleIndex = index - this.scrollOffset;
        const yPos = startY + (visibleIndex * 8); // Fixed 8px per item, centered
        
        item.text.y = yPos + this.offset.y;
      }
    });

    this.updateSelector();
  }
  
  updateSelector() {
    // Position selector arrow
    if (this.focus && this.items.length > 0 && this.selectedIndex >= this.scrollOffset && this.selectedIndex < this.scrollOffset + this.visibleItems) {
      const totalContentHeight = this.visibleItems * 8;
      const startY = ((this.size.height * 8) - totalContentHeight) / 2;
      const visibleIndex = this.selectedIndex - this.scrollOffset;
      const selectorY = startY + (visibleIndex * 8) + this.offset.y;
      
      this.selector.y = selectorY;
      this.selector.visible = true;
    } else {
      this.selector.visible = false;
    }
  }
  
  updateScrollBar() {
    if (this.disableScrollBar) return;
    
    // Clear previous scroll bar
    this.scrollBar.clear();
    
    // Only show scroll bar if there are more items than visible
    if (this.items.length <= this.visibleItems) {
      this.hideScrollBar();
      return;
    }
    
    const windowHeight = (this.size.height - 2) * 8;
    const totalItems = this.items.length;
    
    // Calculate scroll bar dimensions
    const scrollBarHeight = Math.max(8, (this.visibleItems / totalItems) * windowHeight);
    const scrollBarWidth = 1;
    
    // Calculate scroll bar position
    const scrollRange = totalItems - this.visibleItems;
    const scrollProgress = this.scrollOffset / scrollRange;
    const scrollBarY = scrollProgress * (windowHeight - scrollBarHeight);
    
    // Draw scroll bar
    this.scrollBar.beginFill(this.fontTint, 0.8);
    this.scrollBar.drawRect(0, scrollBarY, scrollBarWidth, scrollBarHeight);
    this.scrollBar.endFill();
    
    // Show scroll bar with fade in
    this.showScrollBar();
  }
  
  showScrollBar() {
    // Cancel any existing fade out tween
    if (this.scrollBarTween) {
      this.scrollBarTween.stop();
    }
    
    // Fade in immediately
    this.scrollBar.alpha = 1;
    
    // Start fade out after 1 second
    this.scrollBarTween = game.add.tween(this.scrollBar);
    
    this.scrollBarTween.to({ alpha: 0 }, 1000, Phaser.Easing.Quadratic.Out, true, 500)
      .onComplete.add(() => {
        this.scrollBarTween = null;
      });
  }

  hideScrollBar() {
    // Cancel any existing tween
    if (this.scrollBarTween) {
      this.scrollBarTween.stop();
      this.scrollBarTween = null;
    }
    
    // Hide immediately
    this.scrollBar.alpha = 0;
    this.scrollBar.clear();
  }
  
  adjustScroll() {
    // Adjust scroll offset to ensure selected item is visible
    if (this.selectedIndex < this.scrollOffset) {
      this.scrollOffset = this.selectedIndex;
    } else if (this.selectedIndex >= this.scrollOffset + this.visibleItems) {
      this.scrollOffset = this.selectedIndex - this.visibleItems + 1;
    }
  }

  navigate(direction) {
    if (this.items.length === 0) return;

    let newIndex = this.selectedIndex;

    switch (direction) {
      case 'up':
        newIndex = Math.max(0, this.selectedIndex - 1);
        break;
      case 'down':
        newIndex = Math.min(this.items.length - 1, this.selectedIndex + 1);
        break;
      case 'left':
        this.handleLeft();
        return;
      case 'right':
        this.handleRight();
        return;
    }

    this.onSelect.dispatch(newIndex, direction);

    if (newIndex !== this.selectedIndex) {
      this.selectedIndex = newIndex;
      this.adjustScroll();
      this.updateScrollBar();
      this.playNavSound();
    }
  }

  handleLeft() {
    const item = this.items[this.selectedIndex];
    if (!item) return;
    
    if (item.type === 'setting') {
      item.currentIndex = (item.currentIndex - 1 + item.options.length) % item.options.length;
      item.valueText.write(item.options[item.currentIndex].toString());
      if (item.callback) item.callback(item.currentIndex, item.options[item.currentIndex]);
      this.playNavSound();
    } else if (item.type === 'toggle') {
      item.state = !item.state;
      item.toggleSwitch.animations.play(item.state ? 'on' : 'off');
      if (item.callback) item.callback(item.state);
      this.playNavSound();
    }
  }

  handleRight() {
    const item = this.items[this.selectedIndex];
    if (!item) return;
    
    if (item.type === 'setting') {
      item.currentIndex = (item.currentIndex + 1) % item.options.length;
      item.valueText.write(item.options[item.currentIndex].toString());
      if (item.callback) item.callback(item.currentIndex, item.options[item.currentIndex]);
      this.playNavSound();
    } else if (item.type === 'toggle') {
      item.state = !item.state;
      item.toggleSwitch.animations.play(item.state ? 'on' : 'off');
      if (item.callback) item.callback(item.state);
      this.playNavSound();
    }
  }

  playNavSound() {
    ENABLE_UI_SFX && Audio.play('ui_nav');
  }

  confirm() {
    if (this.items.length > 0) {
      const item = this.items[this.selectedIndex];
      if (item.type === 'item') {
        item.callback && item.callback(this.items[this.selectedIndex]);
        ENABLE_UI_SFX && Audio.play('ui_select');
      } else {
        this.handleRight();
      }
      return true;
    }
    this.onConfirm.dispatch(this.selectedIndex, this.items[this.selectedIndex]);
    return false;
  }

  cancel() {
    this.items.forEach(item => {
      if (item.backButton) {
        item.callback();
        ENABLE_UI_SFX && Audio.play('ui_cancel');
      }
    });
    this.onCancel.dispatch(this.selectedIndex);
  }

  clear() {
    this.items.forEach(item => {
      item.text.destroy();
      if (item.valueText) item.valueText.destroy();
      if (item.toggleText) item.toggleText.destroy();
    });
    if (this.scrollBarTween) {
      this.scrollBarTween.stop();
      this.scrollBarTween = null;
    }
    this.frameParts.forEach(part => part.destroy());
    this.items = [];
    this.frameParts = [];
    this.selectedIndex = 0;
    this.scrollOffset = 0;
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  destroy() {
    this.clear();
    super.destroy();
  }
}

class WindowManager {
  constructor() {
    this.windows = [];
    this.focusedWindow = null;

    // Track input states to prevent repeated inputs
    this.lastUp = false;
    this.lastDown = false;
    this.lastConfirm = false;
    this.lastCancel = false;
  }

  add(window) {
    if (!this.windows.includes(window)) {
      this.windows.push(window);
      // Hide selector by default for new windows
      window.selector.visible = false;
      // If this is the first window added, focus it automatically
      if (this.windows.length === 1) {
        this.focus(window);
      }
    }
    return window;
  }

  show(window) {
    window.show();
  }

  remove(window, destroy = true) {
    const index = this.windows.indexOf(window);
    if (index !== -1) {
      // If we're removing the focused window, focus the next available one
      if (window === this.focusedWindow) {
        this.windows.splice(index, 1);
        this.focusedWindow = this.windows.length > 0 ?
          this.windows[this.windows.length - 1] : null;
        // Update selector visibility for new focused window
        if (this.focusedWindow) {
          this.focusedWindow.selector.visible = true;
        }
      } else {
        this.windows.splice(index, 1);
      }

      // Destroy window if requested
      if (destroy) {
        window.destroy();
      }
      return true;
    }
    return false;
  }

  focus(window, hide = true) {
    if (window && this.windows.includes(window)) {
      // Hide selector for previously focused window
      if (this.focusedWindow) {
        this.focusedWindow.focus = false;
        if (hide) this.focusedWindow.visible = false;
        this.focusedWindow.selector.visible = false;
      }

      // Focus new window and show its selector
      this.focusedWindow = window;
      window.focus = true;
      window.selector.visible = true;
      //window.bringToTop();
      window.show();
      return true;
    }
    return false;
  }

  unfocus() {
    this.focusedWindow = null;
  }

  closeAll() {
    if (this.focusedWindow) {
      this.focusedWindow.focus = false;
      this.focusedWindow = null;
    }
    this.windows.forEach(window => window.hide());
  }

  update() {
    // Only process input if we have a focused window
    if (this.focusedWindow) {
      // Handle navigation - only trigger on new presses (not holds)
      const upPressed = gamepad.pressed.up && !this.lastUp;
      const downPressed = gamepad.pressed.down && !this.lastDown;
      const leftPressed = gamepad.pressed.left && !this.lastDown;
      const rightPressed = gamepad.pressed.right && !this.lastDown;
      const confirmPressed = gamepad.pressed.a && !this.lastConfirm;
      const cancelPressed = gamepad.pressed.b && !this.lastCancel;

      if (upPressed) {
        this.focusedWindow.navigate('up');
      } else if (downPressed) {
        this.focusedWindow.navigate('down');
      } else if (leftPressed) {
        this.focusedWindow.navigate('left');
      } else if (rightPressed) {
        this.focusedWindow.navigate('right');
      }

      if (confirmPressed) {
        this.focusedWindow.confirm();
      }

      if (cancelPressed) {
        this.focusedWindow.cancel();
      }

      // Update input states
      this.lastUp = gamepad.pressed.up;
      this.lastDown = gamepad.pressed.down;
      this.lastConfirm = gamepad.pressed.a;
      this.lastCancel = gamepad.pressed.b;
    }
  }

  // Helper methods for common operations
  createWindow(x, y, width, height, skin = "1", parent = null) {
    const window = new Window(x, y, width, height, skin, parent);
    this.add(window);
    return window;
  }

  clearAll(destroy = false) {
    if (destroy) {
      this.windows.forEach(window => window.destroy());
    }
    this.windows = [];
    this.focusedWindow = null;
  }

  // Bring window to front (visually) without necessarily focusing it
  bringToFront(window) {
    if (this.windows.includes(window)) {
      window.bringToTop();
      // Reorder windows array to maintain proper z-index
      this.windows.splice(this.windows.indexOf(window), 1);
      this.windows.push(window);
      return true;
    }
    return false;
  }
}

class DialogWindow extends Phaser.Sprite {
  constructor(text, options = {}) {
    const {
      x = game.width / 2,
      y = game.height / 2,
      anchorX = 0.5,
      anchorY = 0.5,
      maxWidth = 180,
      maxHeight = 80,
      buttons = ['OK'],
      defaultButton = 0,
      enableTextScroll = false,
      parent = null
    } = options;

    super(game, x, y);
    
    this.anchor.set(anchorX, anchorY);

    this.text = text;
    this.buttons = buttons;
    this.selectedButton = defaultButton;
    this.enableTextScroll = enableTextScroll;
    this.currentScroll = 0;
    this.maxScroll = 0;
    this.fontTint = 0x76fcde;
    this.isActive = true;
    
    if (parent) {
      parent.addChild(this);
    } else {
      game.add.existing(this);
    }

    this.createDialog();
  }

  createDialog() {
    // Create window background using Window class
    const { width, height, wrappedText } = this.calculateWindowSize();
    
    this.window = new Window(0, 0, width, height, "1", this);
    this.window.x -= this.window.size.width * 8 * this.anchor.x;
    this.window.y -= this.window.size.height * 8 * this.anchor.y;
    this.window.focus = false;
    this.window.selector.visible = false;
    
    // Create text content
    this.createTextContent(wrappedText);
    
    // Create buttons
    this.createButtonElements();
    
    // Set up input handling
    this.setupInputHandling();
  }

  calculateWindowSize() {
    // Wrap the text
    const wrappedText = this.wrapText(this.text);
    const lineCount = wrappedText.length;
    
    // Calculate required dimensions - ensure minimum height for text
    const textHeight = Math.max(lineCount * 6, 6) + 16; // At least one line height + padding
    const buttonHeight = 12;
    const totalHeight = textHeight + buttonHeight;
    
    // Ensure minimum window height to prevent text cutoff
    const minHeightInUnits = Math.ceil((6 * 3 + 16 + 12) / 8); // At least 3 lines of text
    const calculatedHeight = Math.floor(totalHeight / 8);
    const finalHeight = Math.max(minHeightInUnits, calculatedHeight);
    
    const width = Math.floor(180 / 8); // Convert to 8px units
    
    return {
      width: width,
      height: finalHeight,
      wrappedText: wrappedText
    };
  }

  wrapText(text) {
    const maxLineWidth = 160; // pixels
    const charWidth = 4;
    const charsPerLine = Math.floor(maxLineWidth / charWidth);
    
    const lines = text.split('\n');
    const wrappedLines = [];
    
    for (let line of lines) {
      if (this.getTextWidth(line) <= maxLineWidth) {
        wrappedLines.push(line);
        continue;
      }
      
      let currentLine = '';
      const words = line.split(' ');
      
      for (let word of words) {
        if (this.getTextWidth(word) > maxLineWidth) {
          if (currentLine) {
            wrappedLines.push(currentLine.trim());
            currentLine = '';
          }
          const brokenWord = this.breakLongWord(word, charsPerLine);
          wrappedLines.push(...brokenWord);
          continue;
        }
        
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (this.getTextWidth(testLine) <= maxLineWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            wrappedLines.push(currentLine.trim());
          }
          currentLine = word;
        }
      }
      
      if (currentLine) {
        wrappedLines.push(currentLine.trim());
      }
    }
    
    return wrappedLines;
  }

  breakLongWord(word, charsPerLine) {
    const chunks = [];
    let currentChunk = '';
    
    for (let i = 0; i < word.length; i++) {
      currentChunk += word[i];
      if (currentChunk.length >= charsPerLine || i === word.length - 1) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
    }
    
    return chunks;
  }

  getTextWidth(text) {
    return text.length * 4; // 4px per character
  }

  createTextContent(wrappedText) {
    this.textLines = [];
    this.allTextLines = wrappedText;
    
    const startY = 8;
    const textAreaHeight = (this.window.size.height * 8) - 28; // Total available height for text (window height - padding - buttons)
    const lineHeight = 6;
    this.maxVisibleLines = Math.floor(textAreaHeight / lineHeight);
    
    this.maxScroll = Math.max(0, wrappedText.length - this.maxVisibleLines);
    const visibleLines = wrappedText.slice(this.currentScroll, this.currentScroll + this.maxVisibleLines);
    
    visibleLines.forEach((line, index) => {
      const text = new Text(8, startY + (index * lineHeight), line, {
        ...FONTS.default,
        tint: this.fontTint
      });
      this.window.addChild(text);
      this.textLines.push(text);
    });
    
    this.updateScrollIndicator();
    this.updateScrollBar(); // Add scrollbar
  }

  createButtonElements() {
    this.buttonTexts = [];
    const buttonAreaY = this.window.size.height * 8 - 12;
    
    // Calculate actual button widths based on text content
    const buttonWidths = this.buttons.map(buttonText => {
      return buttonText.length * 4 + 16; // Text width + padding
    });
    
    const totalButtonWidth = buttonWidths.reduce((sum, width) => sum + width, 0);
    const buttonSpacing = 8; // Space between buttons
    const startX = (this.window.size.width * 8 - totalButtonWidth - (buttonSpacing * (this.buttons.length - 1))) / 2;
    
    let currentX = startX;
    this.buttons.forEach((buttonText, index) => {
      const button = new Text(currentX + (buttonWidths[index] / 2), buttonAreaY, buttonText, {
        ...FONTS.default,
        tint: this.fontTint
      });
      button.anchor.x = 0.5;
      this.window.addChild(button);
      this.buttonTexts.push(button);
      
      // Move to next button position
      currentX += buttonWidths[index] + buttonSpacing;
    });
    
    this.updateButtonSelection();
  }
  
  updateButtonSelection() {
    this.buttonTexts.forEach((button, index) => {
      button.selected = index === this.selectedButton;
    });
  }

  updateScrollIndicator() {
    // Remove existing scroll indicator
    if (this.scrollIndicator) {
      this.scrollIndicator.destroy();
    }
    
    // Show scroll indicator if text can be scrolled
    if (this.enableTextScroll && this.maxScroll > 0) {
      const indicatorX = this.window.size.width * 8 - 8;
      const indicatorY = this.window.size.height * 8 - 20;
      
      this.scrollIndicator = new Text(indicatorX, indicatorY, ">", {
        ...FONTS.default,
        tint: this.fontTint
      });
      this.scrollIndicator.anchor.set(1, 0.5);
      this.window.addChild(this.scrollIndicator);
      
      // Blink animation for scroll indicator
      game.add.tween(this.scrollIndicator).to({ alpha: 0 }, 500, "Linear", true, 0, -1).yoyo(true);
    }
  }
  
  updateScrollBar() {
    // Remove existing scroll bar
    if (this.scrollBar) {
      this.scrollBar.destroy();
    }
    
    // Only show scroll bar if text can be scrolled
    if (this.enableTextScroll && this.maxScroll > 0) {
      const scrollBarX = this.window.size.width * 8 - 4;
      const textAreaY = 8;
      const textAreaHeight = (this.window.size.height * 8) - 28;
      
      // Calculate scroll bar dimensions
      const totalTextHeight = this.allTextLines.length * 6;
      const visibleRatio = textAreaHeight / totalTextHeight;
      const scrollBarHeight = Math.max(8, textAreaHeight * visibleRatio);
      
      // Calculate scroll bar position
      const scrollRange = this.maxScroll;
      const scrollProgress = this.currentScroll / scrollRange;
      const availableScrollSpace = textAreaHeight - scrollBarHeight;
      const scrollBarY = textAreaY + (scrollProgress * availableScrollSpace);
      
      // Create scroll bar graphics
      this.scrollBar = game.add.graphics(scrollBarX, scrollBarY);
      this.scrollBar.beginFill(this.fontTint, 0.8);
      this.scrollBar.drawRect(0, 0, 2, scrollBarHeight);
      this.scrollBar.endFill();
      this.window.addChild(this.scrollBar);
    }
  }

  setupInputHandling() {
    this.onConfirm = new Phaser.Signal();
    this.onCancel = new Phaser.Signal();
    
    // Use gamepad signals instead of checking pressed states
    this.setupGamepadSignals();
  }

  setupGamepadSignals() {
    // Add signals for dialog navigation
    gamepad.signals.pressed.left.add(this.onLeftPressed, this);
    gamepad.signals.pressed.right.add(this.onRightPressed, this);
    gamepad.signals.pressed.up.add(this.onUpPressed, this);
    gamepad.signals.pressed.down.add(this.onDownPressed, this);
    gamepad.signals.pressed.a.add(this.onAPressed, this);
    gamepad.signals.pressed.b.add(this.onBPressed, this);
  }

  onLeftPressed() {
    if (!this.isActive) return;
    
    this.selectedButton = Math.max(0, this.selectedButton - 1);
    this.updateButtonSelection();
    ENABLE_UI_SFX && Audio.play('ui_nav');
  }

  onRightPressed() {
    if (!this.isActive) return;
    
    this.selectedButton = Math.min(this.buttons.length - 1, this.selectedButton + 1);
    this.updateButtonSelection();
    ENABLE_UI_SFX && Audio.play('ui_nav');
  }

  onUpPressed() {
    if (!this.isActive || !this.enableTextScroll) return;
    
    if (this.currentScroll > 0) {
      this.currentScroll--;
      this.refreshTextContent();
      ENABLE_UI_SFX && Audio.play('ui_nav');
    }
  }

  onDownPressed() {
    if (!this.isActive || !this.enableTextScroll) return;
    
    if (this.currentScroll < this.maxScroll) {
      this.currentScroll++;
      this.refreshTextContent();
      ENABLE_UI_SFX && Audio.play('ui_nav');
    }
  }

  onAPressed() {
    if (!this.isActive) return;
    
    this.confirm();
  }

  onBPressed() {
    if (!this.isActive) return;
    
    this.cancel();
  }

  refreshTextContent() {
    // Remove existing text lines
    this.textLines.forEach(text => text.destroy());
    this.textLines = [];
    
    // Remove existing scroll bar
    if (this.scrollBar) {
      this.scrollBar.destroy();
      this.scrollBar = null;
    }
    
    // Create new text content with current scroll
    const startY = 8;
    const lineHeight = 6;
    const visibleLines = this.allTextLines.slice(this.currentScroll, this.currentScroll + this.maxVisibleLines);
    
    visibleLines.forEach((line, index) => {
      const text = new Text(8, startY + (index * lineHeight), line, {
        ...FONTS.default,
        tint: this.fontTint
      });
      this.window.addChild(text);
      this.textLines.push(text);
    });
    
    this.updateScrollIndicator();
    this.updateScrollBar(); // Update scrollbar position
  }

  confirm() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.onConfirm.dispatch(this.selectedButton, this.buttons[this.selectedButton]);
    ENABLE_UI_SFX && Audio.play('ui_select');
    this.cleanup();
  }

  cancel() {
    if (!this.isActive) return;
    
    this.isActive = false;
    // Find cancel button (usually "No" or "Cancel")
    const cancelIndex = this.buttons.findIndex(btn => 
      btn.toUpperCase().includes('NO') || 
      btn.toUpperCase().includes('CANCEL') ||
      btn.toUpperCase().includes('BACK')
    );
    
    if (cancelIndex !== -1) {
      this.selectedButton = cancelIndex;
      this.onConfirm.dispatch(this.selectedButton, this.buttons[this.selectedButton]);
      ENABLE_UI_SFX && Audio.play('ui_select');
    } else {
      this.onCancel.dispatch(this.selectedButton);
      ENABLE_UI_SFX && Audio.play('ui_cancel');
    }
    this.cleanup();
  }
  
  update() {
    // Update button animations
    if (this.buttonTexts) {
      const time = game.time.now * 0.01; // Slow down the animation
      this.buttonTexts.forEach((button, index) => {
        if (index === this.selectedButton) {
          // Sine wave alpha animation: oscillates between 0.5 and 1.0
          const alpha = 0.75 + Math.sin(time) * 0.25;
          button.alpha = Math.max(0.5, Math.min(1.0, alpha));
        } else {
          // Non-selected buttons are fully opaque
          button.alpha = 1.0;
        }
      });
    }
  }

  cleanup() {
    // Remove original gamepad signal handlers
    this.removeGamepadSignals();
  }

  removeGamepadSignals() {
    gamepad.signals.pressed.left.remove(this.onLeftPressed, this);
    gamepad.signals.pressed.right.remove(this.onRightPressed, this);
    gamepad.signals.pressed.up.remove(this.onUpPressed, this);
    gamepad.signals.pressed.down.remove(this.onDownPressed, this);
    gamepad.signals.pressed.a.remove(this.onAPressed, this);
    gamepad.signals.pressed.b.remove(this.onBPressed, this);
  }

  destroy() {
    if (this.isActive) {
      this.cleanup();
    }
    if (this.window) {
      this.window.destroy();
    }
    super.destroy();
  }
}

class CarouselMenu extends Phaser.Sprite {
  constructor(x, y, width, height, config = {}) {
    super(game, x, y);
    
    this.config = {
      animate: true,
      align: 'left',
      bgcolor: '#3498db',
      fgcolor: '#ffffff',
      disableScrollBar: false,
      disableConfirm: false,
      disableCancel: false,
      inactiveAlpha: 0.4,
      activeAlpha: 0.9,
      ...config,
      margin: { top: 4, bottom: 4, left: 4, right: 4, ...(config.margin || {}) },
    };
    
    this.viewport = {
      width: width,
      height: height
    };
    
    this.items = [];
    this.selectedIndex = 0;
    this.scrollOffset = 0;
    this.itemHeight = 8;
    this.itemSpacing = 1;
    this.totalItemHeight = this.itemHeight + this.itemSpacing;
    
    this.visibleItems = Math.floor((height - this.config.margin.top - this.config.margin.bottom) / this.totalItemHeight);
    this.visibleItems = Math.max(1, this.visibleItems);
    
    this.isAnimating = false;
    this.inputEnabled = true;
        
    // Scroll bar
    if (!this.config.disableScrollBar) {
      this.scrollBar = game.add.graphics(this.viewport.width - 3, this.config.margin.top);
      this.scrollBar.alpha = 0; // Start hidden
      this.addChild(this.scrollBar);
      
      this.scrollBarTween = null;
    }
    
    this.lastUp = false;
    this.lastDown = false;
    this.lastLeft = false;
    this.lastRight = false;
    this.lastConfirm = false;
    this.lastCancel = false;
    
    this.setupInput();
    
    if (!this.config.silent) game.add.existing(this);
  }
  
  setupInput() {
    gamepad.releaseAll();

    this.onSelect = new Phaser.Signal();
    this.onConfirm = new Phaser.Signal();
    this.onCancel = new Phaser.Signal();
  }
  
  addItem(text, callback = null, data = {}) {
    const index = this.items.length;
    
    const item = {
      parent: null,
      background: null,
      text: null,
      textContent: text,
      callback: callback,
      data: data,
      index: index,
      originalX: this.config.align === 'right' ? this.config.margin.right : this.config.margin.left,
      originalAlpha: this.config.inactiveAlpha,
      isSelected: false,
      alphaTween: null
    };
    
    this.items.push(item);
    
    this.updateSelection();
    
    return item;
  }
  
  createItemVisuals(item, isSelected) {
    const index = item.index;
    let xPos = this.config.margin.left;
    let yPos = item.initialY || this.config.margin.top + (index * this.totalItemHeight);
    const data = item.data;
    
    item.initialY = null;
    
    const itemParent = new Phaser.Sprite(game, xPos, yPos);
    itemParent.alpha = this.config.inactiveAlpha;
    this.addChild(itemParent);
    
    const bgWidth = this.viewport.width - this.config.margin.left - this.config.margin.right;
    const bgHeight = this.itemHeight;
    
    const background = this.createGradientBackground(bgWidth, bgHeight, data.bgcolor);
    background.x = item.originalX;
    itemParent.addChild(background);
    
    const textX = this.config.align === 'right' ? 
      bgWidth - 8 : 8;
    const textAnchor = this.config.align === 'right' ? 1 : 0;
    
    const itemText = new Text(textX, 0, item.textContent, {
      ...FONTS.default,
      tint: data.fgcolor || this.config.fgcolor
    });
    itemText.anchor.x = textAnchor;
    itemText.y = 1;
    itemParent.addChild(itemText);
    
    if (item.textContent.length * 4 > this.viewport.width -16) {
      itemText.write(item.textContent.substr(0, Math.floor(this.viewport.width - 16) / 4));
    }
    
    item.parent = itemParent;
    item.background = background;
    item.text = itemText;
  }
  
  removeItemVisuals(item) {
    item.parent?.destroy();
    item.parent = null;
    item.background = null;
    item.text = null;
  }
  
  createGradientBackground(width, height, color) {
    const bitmap = game.add.bitmapData(width, height);
    
    const gradient = bitmap.context.createLinearGradient(
      this.config.align === 'right' ? width : 0, 0,
      this.config.align === 'right' ? 0 : width, 0
    );
    
    const bgcolor = color || this.config.bgcolor;
    
    if (this.config.align === 'right') {
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.3, bgcolor);
      gradient.addColorStop(1, bgcolor);
    } else {
      gradient.addColorStop(0, bgcolor);
      gradient.addColorStop(0.7, bgcolor);
      gradient.addColorStop(1, 'transparent');
    }
    
    bitmap.context.fillStyle = gradient;
    bitmap.context.fillRect(0, 0, width, height);
    
    const sprite = game.add.sprite(0, 0, bitmap);
    return sprite;
  }
  
  update() {
    if (!this.inputEnabled) return;
    
    this.handleInput();
    this.updateAnimations();
  }
  
  handleInput() {
    const upPressed = gamepad.pressed.up && !this.lastUp;
    const downPressed = gamepad.pressed.down && !this.lastDown;
    const leftPressed = gamepad.pressed.left && !this.lastLeft;
    const rightPressed = gamepad.pressed.right && !this.lastRight;
    const confirmPressed = gamepad.pressed.a && !this.lastConfirm;
    const cancelPressed = gamepad.pressed.b && !this.lastCancel;
    
    if (upPressed) {
      this.navigate(-1);
    } else if (downPressed) {
      this.navigate(1);
    } else if (leftPressed) {
      this.navigate(-1, true);
    } else if (rightPressed) {
      this.navigate(1, true);
    }
    
    if (confirmPressed && this.items.length > 0) {
      this.confirm();
    }
    
    if (cancelPressed) {
      this.cancel();
    }
    
    this.lastUp = gamepad.pressed.up;
    this.lastDown = gamepad.pressed.down;
    this.lastLeft = gamepad.pressed.left;
    this.lastRight = gamepad.pressed.right;
    this.lastConfirm = gamepad.pressed.a;
    this.lastCancel = gamepad.pressed.b;
  }
  
  navigate(direction, page) {
    if (this.items.length === 0 || this.isAnimating) return;
    
    let scrollAmount = page ? direction * Math.max(1, this.visibleItems) : direction;
    
    let newIndex = this.selectedIndex + scrollAmount;
    
    if (!page) {
      if (newIndex < 0) newIndex = this.items.length - 1;
      if (newIndex > this.items.length - 1) newIndex = 0;
    } else {
      if (newIndex < 0) newIndex = 0;
      if (newIndex > this.items.length - 1) newIndex = this.items.length - 1;
    }
    
    if (newIndex !== this.selectedIndex) {
      this.selectedIndex = newIndex;
      this.updateSelection();
      this.playNavSound();
      this.onSelect.dispatch(this.selectedIndex, this.items[this.selectedIndex]);
      
      // Show scroll bar when navigating
      if (!this.config.disableScrollBar) {
        this.showScrollBar();
      }
    }
  }
  
  selectIndex(index) {
    this.selectedIndex = index;
    this.updateSelection();
    this.onSelect.dispatch(index, this.items[index]);
  }
  
  updateSelection() {
    this.adjustScroll();
    
    this.items.forEach((item, index) => {
      const isSelected = index === this.selectedIndex;
      const isVisible = index >= this.scrollOffset && 
                       index < this.scrollOffset + this.visibleItems;
      
      if (isVisible) {
        if (!item.parent) {
          this.createItemVisuals(item, isSelected);
        }
        if (isSelected && !item.isSelected) {
          this.selectItem(item);
        } else if (!isSelected && item.isSelected) {
          this.deselectItem(item);
        }
      } else {
        if (item.parent) {
          this.removeItemVisuals(item);
        }
        if (item.isSelected) {
          this.deselectItem(item);
        }
      }
    });
    
    this.updateItemPositions();
    
    // Update scroll bar after selection changes
    if (!this.config.disableScrollBar) {
      this.updateScrollBar();
    }
  }
  
  selectItem(item) {
    // Deselect previously selected item
    const previouslySelected = this.items.find(i => i.isSelected && i !== item);
    if (previouslySelected) {
      this.deselectItem(previouslySelected);
    }
    
    item.isSelected = true;
    
    // Stop any existing tween
    if (item.alphaTween) {
      item.alphaTween.stop();
    }
    
    if (item.parent) {
      if (this.config.animate) {
        // Start yoyo animation for selected item
        item.alphaTween = game.add.tween(item.parent)
          .to({ alpha: this.config.activeAlpha }, 250, Phaser.Easing.Quadratic.InOut, true, 0, -1, true)
          .yoyo(true, 500);
      } else {
        item.parent.alpha = this.config.activeAlpha;
      }
      if (item.text && item.textContent.length * 4 > this.viewport.width -16) {
        item.text.scrollwrite(item.textContent, Math.floor(this.viewport.width - 16) / 4);
      }
    }
  }
  
  deselectItem(item) {
    item.isSelected = false;
    
    // Stop yoyo animation
    if (item.alphaTween) {
      item.alphaTween.stop();
      item.alphaTween = null;
    }
    
    // Update visual for unselected items 
    if (item.parent) {
      if (this.config.animate) {
        game.add.tween(item.parent)
          .to({ alpha: this.config.inactiveAlpha }, 100, Phaser.Easing.Quadratic.Out, true);
      } else {
        item.parent.alpha = this.config.inactiveAlpha;
      }
      if (item.text && item.text.isScrolling()) {
        item.text.stopScrolling();
        item.text.write(item.textContent.substr(0, Math.floor(this.viewport.width - 16) / 4));
      }
    }
  }
  
  adjustScroll() {
    if (this.selectedIndex < this.scrollOffset) {
      this.scrollOffset = this.selectedIndex;
    } else if (this.selectedIndex >= this.scrollOffset + this.visibleItems) {
      this.scrollOffset = this.selectedIndex - this.visibleItems + 1;
    }
    
    this.scrollOffset = Phaser.Math.clamp(
      this.scrollOffset,
      0,
      Math.max(0, this.items.length - this.visibleItems)
    );
  }
  
  updateScrollBar() {
    if (this.config.disableScrollBar) return;
    
    // Clear previous scroll bar
    this.scrollBar.clear();
    
    // Only show scroll bar if there are more items than visible
    if (this.items.length <= this.visibleItems) {
      this.hideScrollBar();
      return;
    }
    
    const contentHeight = this.viewport.height - this.config.margin.top - this.config.margin.bottom;
    const totalItems = this.items.length;
    
    // Calculate scroll bar dimensions
    const scrollBarHeight = Math.max(8, (this.visibleItems / totalItems) * contentHeight);
    const scrollBarWidth = 1;
    
    // Calculate scroll bar position
    const scrollRange = totalItems - this.visibleItems;
    const scrollProgress = this.scrollOffset / scrollRange;
    const scrollBarY = scrollProgress * (contentHeight - scrollBarHeight);
    
    // Draw scroll bar using fgcolor
    const fgcolor = Phaser.Color.hexToRGB(this.config.fgcolor);
    this.scrollBar.beginFill(fgcolor, 0.8);
    this.scrollBar.drawRect(0, scrollBarY, scrollBarWidth, scrollBarHeight);
    this.scrollBar.endFill();
    
    // Show scroll bar with fade in
    this.showScrollBar();
  }

  showScrollBar() {
    if (this.config.disableScrollBar) return;
    
    // Cancel any existing fade out tween
    if (this.scrollBarTween) {
      this.scrollBarTween.stop();
    }
    
    // Fade in immediately
    this.scrollBar.alpha = 1;
    
    // Start fade out after 1 second
    this.scrollBarTween = game.add.tween(this.scrollBar);
    
    this.scrollBarTween.to({ alpha: 0 }, 1000, Phaser.Easing.Quadratic.Out, true, 500)
      .onComplete.add(() => {
        this.scrollBarTween = null;
      });
  }

  hideScrollBar() {
    if (this.config.disableScrollBar) return;
    
    // Cancel any existing tween
    if (this.scrollBarTween) {
      this.scrollBarTween.stop();
      this.scrollBarTween = null;
    }
    
    // Hide immediately
    this.scrollBar.alpha = 0;
    this.scrollBar.clear();
  }
  
  updateItemPositions() {
    this.items.forEach((item, index) => {
      const visibleIndex = index - this.scrollOffset;
      const targetY = this.config.margin.top + (visibleIndex * this.totalItemHeight);
      
      if (item.parent) {
        if (this.config.animate && !this.isAnimating) {
          game.add.tween(item.parent).to({ y: targetY }, 150, "Quad.easeOut", true);
        } else {
          item.parent.y = targetY;
        }
      } else {
        item.initialY = targetY;
      }
    });
  }
  
  updateAnimations() {
    // Update any ongoing animations here, might be removed 
  }
  
  confirm() {
    if (this.items.length === 0 || this.isAnimating || this.config.disableConfirm) return;
    
    const selectedItem = this.items[this.selectedIndex];
    this.inputEnabled = false;
    this.isAnimating = true;
    
    this.animateSelection(selectedItem, () => {
      this.onConfirm.dispatch(this.selectedIndex, selectedItem);
      selectedItem.callback?.(selectedItem);
      this.destroy();
    });
  }
  
  animateSelection(item, callback) {
    // Stop all alpha tweens before starting selection animation
    this.items.forEach(otherItem => {
      if (otherItem.alphaTween) {
        otherItem.alphaTween.stop();
        otherItem.alphaTween = null;
      }
    });
    
    if (!item.parent) return;
    
    const fadeDirection = this.config.align === 'right' ? 100 : -100;
    
    this.items.forEach(otherItem => {
      if (otherItem !== item && otherItem.parent && otherItem.parent.visible) {
        game.add.tween(otherItem.parent).to({ 
          x: otherItem.parent.x + fadeDirection,
          alpha: 0 
        }, 500, "Quad.easeOut", true);
      }
    });
    
    // Ensure selected item is fully visible during selection
    if (item.alphaTween) {
      item.alphaTween.stop();
    }
    item.parent.alpha = 1;
    
    // Glow
    const bgWidth = this.viewport.width - this.config.margin.left - this.config.margin.right;
    const bgHeight = this.itemHeight;
    
    const background = this.createGradientBackground(bgWidth, bgHeight);
    background.x = this.config.align === 'right' ? this.config.margin.right : this.config.margin.left;
    background.alpha = 0;
    item.parent.addChild(background);
    
    const glowTween = game.add.tween(background).to({ alpha: 1 }, 100, "Linear", true);
    
    glowTween.onComplete.addOnce(() => {
      item.text.visible = false;
      const fadeOutTween = game.add.tween(item.parent).to({ alpha: 0 }, 100, "Linear", true);
      fadeOutTween.onComplete.addOnce(() => {
        callback?.();
      });
    });
    
    ENABLE_UI_SFX && Audio.play('ui_select');
  }
  
  animateCancel(callback) {
    // Stop all alpha tweens before starting selection animation
    this.items.forEach(item => {
      if (item.alphaTween) {
        item.alphaTween.stop();
        item.alphaTween = null;
      }
    });
    
    const fadeDirection = this.config.align === 'right' ? 100 : -100;
    
    this.items.forEach(item => {
      if (item.parent && item.parent.visible) {
        game.add.tween(item.parent).to({ 
          x: item.parent.x + fadeDirection,
          alpha: 0 
        }, 500, "Quad.easeOut", true);
      }
    });
    
    game.time.events.add(500, () => callback?.());
  }
  
  cancel() {
    if (!this.isAnimating && this.onCancel.getNumListeners() > 0 || this.config.disableCancel) {
      ENABLE_UI_SFX && Audio.play('ui_cancel');
      this.animateCancel(() => {
        this.onCancel.dispatch();
        this.destroy();
      });
    }
  }
  
  playNavSound() {
    ENABLE_UI_SFX && Audio.play('ui_nav');
  }
  
  clear() {
    // Stop all tweens before clearing
    this.items.forEach(item => {
      this.removeItemVisuals(item);
      if (item.alphaTween) {
        item.alphaTween.stop();
      }
      if (item.parent) {
        item.parent.destroy();
      }
    });
    this.items = [];
    this.selectedIndex = 0;
    this.scrollOffset = 0;
    
    // Clean up scroll bar tween
    if (!this.config.disableScrollBar && this.scrollBarTween) {
      this.scrollBarTween.stop();
      this.scrollBarTween = null;
    }

    // Destroy the signals
    this.onSelect.dispose();
    this.onConfirm.dispose();
    this.onCancel.dispose();
  }
  
  destroy() {
    this.clear();
    super.destroy();
  }
}

class BackgroundGradient extends Phaser.Sprite {
  constructor(min = 0.1, max = 0.5, time = 5000) {
    super(game, 0, 0, "ui_background_gradient");
    
    this.alpha = min;
    
    game.add.tween(this).to({ alpha: max }, 5000, Phaser.Easing.Quadratic.InOut, true).yoyo(true).repeat(-1);
    
    game.add.existing(this);
  }
} 

class Background extends Phaser.Sprite {
  constructor(key, tween, min = 0.1, max = 0.5, time = 5000) {
    super(game, 0, 0, key);
    
    this.alpha = min;
    
    if (tween) game.add.tween(this).to({ alpha: max }, 5000, Phaser.Easing.Quadratic.InOut, true).yoyo(true).repeat(-1);
    
    game.add.existing(this);
  }
}

class FuturisticLines extends Phaser.Sprite {
  constructor() {
    super(game, 0, 0);
    
    this.lines = [];
    this.maxLines = 12;
    this.lineSpeed = 1.2;
    this.tailLength = 100;
    this.spawnRate = 150;
    this.lastSpawnTime = 0;
    
    this.lineColors = [0x76FCFF, 0x4AFCFE, 0x00E5FF, 0x00B8D4];
    this.lineAlpha = 0.3;
    
    this.graphics = game.add.graphics(0, 0);
    this.addChild(this.graphics);
    
    game.add.existing(this);
  }

  update() {
    const currentTime = game.time.now;
    
    if (this.lines.length < this.maxLines && currentTime - this.lastSpawnTime > this.spawnRate) {
      this.spawnLine();
      this.spawnRate = game.rnd.between(150, 2000);
      this.lastSpawnTime = currentTime;
    }
    
    this.updateLines();
    this.drawLines();
  }

  spawnLine() {
    const startY = game.rnd.integerInRange(10, game.height - 10);
    const color = game.rnd.pick(this.lineColors);
    const speed = this.lineSpeed * game.rnd.realInRange(0.9, 1.1);
    
    const line = {
      x: -20,
      y: startY,
      startY: startY,
      points: [{ x: -20, y: startY }],
      color: color,
      speed: speed,
      direction: 0,
      age: 0,
      maxAge: 10000,
      active: true,
      lastDirectionChange: 0,
      nextDirectionChangeTime: game.rnd.integerInRange(1000, 5000), // First change: 1-5 seconds
      state: 'straight' // 'straight', 'angled', 'returning'
    };
    
    this.lines.push(line);
  }

  updateLines() {
    for (let i = this.lines.length - 1; i >= 0; i--) {
      const line = this.lines[i];
      
      if (!line.active) {
        this.lines.splice(i, 1);
        continue;
      }
      
      line.age += game.time.elapsed;
      
      if (line.age > line.maxAge) {
        line.active = false;
        continue;
      }
      
      // Check if it's time to change direction based on state
      if (line.age - line.lastDirectionChange > line.nextDirectionChangeTime) {
        this.changeLineDirection(line);
      }
      
      // Calculate movement
      const angleRad = line.direction * (Math.PI / 180);
      const moveX = line.speed * Math.cos(angleRad);
      const moveY = line.speed * Math.sin(angleRad);
      
      line.x += moveX;
      line.y += moveY;
      
      line.points.push({ x: line.x, y: line.y });
      
      while (line.points.length > 0 && line.points[0].x < line.x - this.tailLength) {
        line.points.shift();
      }
      
      if (line.x > game.width + 100 + this.tailLength || line.y < -50 || line.y > game.height + 50) {
        line.active = false;
      }
    }
  }

  changeLineDirection(line) {
    line.lastDirectionChange = line.age;
    
    if (line.state === 'straight') {
      // First change: from straight to angled (-45° or 45°)
      line.direction = game.rnd.pick([-45, 45]);
      line.state = 'angled';
      line.nextDirectionChangeTime = game.rnd.integerInRange(100, 500);
      
    } else if (line.state === 'angled') {
      // Second change: from angled to straight
      line.direction = 0;
      
      line.state = 'straight';
      line.nextDirectionChangeTime = game.rnd.integerInRange(1000, 5000);
    }
  }

  drawLines() {
    this.graphics.clear();
    
    for (const line of this.lines) {
      if (!line.active || line.points.length < 2) continue;
      
      this.drawTail(line);
      this.drawCap(line);
    }
  }

  drawTail(line) {
    const points = line.points;
    
    for (let i = 1; i < points.length; i++) {
      const startPoint = points[i - 1];
      const endPoint = points[i];
      
      const fadeProgress = i / points.length;
      const alpha = i <= 4 ? 0 : this.lineAlpha * (fadeProgress * 0.9);
      
      this.graphics.lineStyle(1, line.color, alpha);
      this.graphics.moveTo(startPoint.x, startPoint.y);
      this.graphics.lineTo(endPoint.x, endPoint.y);
    }
  }

  drawCap(line) {
    if (line.points.length === 0) return;
    
    const head = line.points[line.points.length - 1];
    
    // Bright 1px center
    this.graphics.beginFill(0xFFFFFF, this.lineAlpha * 1.5);
    this.graphics.drawRect(head.x, head.y, 1, 1);
    
    this.graphics.endFill();
  }

  setDensity(density) {
    this.maxLines = Phaser.Math.clamp(density, 1, 15);
  }

  setSpeed(speed) {
    this.lineSpeed = Phaser.Math.clamp(speed, 0.5, 3);
  }

  setTailLength(length) {
    this.tailLength = Phaser.Math.clamp(length, 20, 100);
  }

  clearLines() {
    this.lines = [];
    this.graphics.clear();
  }

  setColors(colors) {
    this.lineColors = colors;
  }

  setAlpha(alpha) {
    this.lineAlpha = Phaser.Math.clamp(alpha, 0.1, 0.8);
  }

  destroy() {
    this.clearLines();
    this.graphics.destroy();
    super.destroy();
  }
}

class LoadingDots extends Phaser.Sprite {
  constructor() {
    super(game, game.width - 2, game.height - 2, "ui_loading_dots");
    
    this.anchor.set(1);
    
    this.animations.add('loading', [0, 1, 2, 3, 4, 3, 2, 1], 8, true);
    this.animations.play('loading');
    
    game.add.existing(this);
  }
}

class Logo extends Phaser.Sprite {
  constructor() {
    super(game, game.width / 2, game.height / 2, null);
    
    this.anchor.set(0.5);
    
    this.mainShape = this.addShape();
    
    game.add.existing(this);
  }
  intro(callback) {
    this.mainShape.alpha = 0;
    
    game.add.tween(this.mainShape).to({ alpha: 1 }, 1000, "Linear", true).onComplete.addOnce(() => {
      this.logoTween = game.add.tween(this.mainShape).to({ alpha: 0.8 }, 500, "Linear", true).repeat(-1).yoyo(true);
      callback && callback();
    });
  }
  outro(callback) {
    this.effect(32, 1000);
      
    const shape = this.addShape();
    shape.alpha = 1;
    game.add.tween(shape).to({ alpha: 0 }, 250, "Linear", true);
    game.add.tween(shape.scale).to({ x: 8, y: 8 }, 250, "Linear", true);
      
    game.camera.flash(0xffffff, 300);
    game.time.events.add(350, () => game.camera.fade(0xffffff, 1000));
    game.camera.onFadeComplete.addOnce(() => callback && callback());
  }
  effect(amountLayers = 5, time = 1000, invert = false) {
    let layers = [];
    for (let i = 0; i < amountLayers; i ++) {
      const shape = this.addShape();
      shape.alpha = 0;
      shape.scale.set(1.0 + (i / 10));
      layers.push(shape);
      game.add.tween(shape).to({ alpha: 1 }, time, "Linear", true, (invert ? - amountLayers * 100 : 0) + i * 100).yoyo(true);
    }
  }
  addShape(tint = 0xffffff, x = 0, y = 0) {
    const shape = game.add.sprite(x, y, "ui_logo_shape");
    shape.anchor.set(0.5);
    shape.tint = tint;
    this.addChild(shape);
    return shape;
  }
}

class NavigationHint extends Phaser.Sprite {
  constructor(frame = 0) {
    super(game, 0, 0);
    
    this.defaultFrame = frame;
    this.lastInputSource = null;
    
    game.add.existing(this);
  }
  change(value) {
    this.defaultFrame = value;
    this.frame = value;
  }
  hide() {
    this.visible = false;
  }
  show() {
    this.visible = true;
  }
  update() {
    if (!gamepad) return;
    
    if (gamepad.lastInputSource != this.lastInputSource) {
      this.loadTexture(gamepad.lastInputSource == 'keyboard' ? 'ui_navigation_hint_keyboard' : 'ui_navigation_hint_gamepad');
      this.frame = this.defaultFrame;
    }
    
    this.lastInputSource = gamepad.lastInputSource;
  }
}

class ProgressText extends Text {
  constructor(text) {
    super(4, game.height - 4, text, FONTS.default);
    
    this.anchor.y = 1;
  }
}

class ExperienceBar extends Phaser.Sprite {
  constructor(x, y, width, height) {
    super(game, x, y);
    this.barWidth = width;
    this.barHeight = height;
    this.progress = 0;
    
    this.background = game.add.graphics(0, 0);
    this.background.beginFill(0x333333);
    this.background.drawRect(0, 0, width, height);
    this.background.endFill();
    this.addChild(this.background);
    
    this.bar = game.add.graphics(0, 0);
    this.addChild(this.bar);
    
    this.border = game.add.graphics(0, 0);
    this.border.lineStyle(1, 0xFFFFFF, 1);
    this.border.drawRect(0, 0, width, height);
    this.border.endFill();
    this.addChild(this.border);
    
    this.updateBar();
    
    game.add.existing(this);
  }
  
  setProgress(progress) {
    this.progress = Phaser.Math.clamp(progress, 0, 1);
    this.updateBar();
  }
  
  updateBar() {
    this.bar.clear();
    this.bar.beginFill(0x76fcde);
    this.bar.drawRect(0, 0, this.barWidth * this.progress, this.barHeight);
    this.bar.endFill();
  }
  
  destroy() {
    this.background.destroy();
    this.bar.destroy();
    this.border.destroy();
    super.destroy();
  }
}

class SkillBar extends Phaser.Sprite {
  constructor(x, y) {
    super(game, x, y);
    
    this.parts = [];
    
    this.visibleParts = 5;
    this.value = 5;
    
    for (let i = 0, x = 0; i < 5; i++, x += 3) {
      const part = game.add.sprite(x, 0, 'ui_skill_bar', 0);
      this.addChild(part);
      this.parts.push(part);
    }
    
    game.add.existing(this);
  }
  update() {
    for (let i = 1; i <= 5; i++) {
      const part = this.parts[i - 1];
      
      part.visible = i <= this.visibleParts;
      part.frame = this.value >= i ? 0 : 1;
    }
  }
}

class TextInput extends Phaser.Sprite {
  constructor(text = "", maxLength = 6, onConfirm, onCancel) {
    super(game, 96, 28);
    this.anchor.x = 0.5;

    this.characterSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";

    this.window = new Window(0, 0, maxLength, 2, "1", this);
    this.window.x -= (this.window.size.width / 2) * 8;

    this.stackedText = text;
    this.text = "";
    this.currentIndex = 0;
    this.maxLength = maxLength;

    this.textLayer = new Text(3, 5, text);
    this.textLayer.tint = this.window.fontTint;
    this.window.addChild(this.textLayer);

    this.cursor = game.add.graphics(0, 1);
    this.cursor.beginFill(this.window.fontTint, 1);
    this.cursor.drawRect(0, 0, 2, 4);
    this.cursor.endFill();
    this.textLayer.addChild(this.cursor);

    this.lastCursorBlinkTime = 0;
    this.cursorVisible = false;

    this.onConfirm = new Phaser.Signal();
    this.onCancel = new Phaser.Signal();

    if (onConfirm) {
      this.onConfirm.add(onConfirm);
    }
    if (onCancel) {
      this.onCancel.add(onCancel);
    }

    game.add.existing(this);
  }
  getCharacterToInsert() {
    return this.characterSet[this.currentIndex];
  }
  update() {
    const isAtMaxLength = this.stackedText.length >= this.maxLength;

    this.text = isAtMaxLength ? this.stackedText : this.stackedText + this.getCharacterToInsert();

    this.textLayer.write(this.text);

    this.cursor.x = this.text.length * 4;
    this.cursor.visible = !isAtMaxLength && this.cursorVisible;

    let newIndex = this.currentIndex;

    // Change letter
    if (gamepad.pressed.up) {
      newIndex--;
    }
    if (gamepad.pressed.down) {
      newIndex++;
    }

    if (newIndex < 0) newIndex = this.characterSet.length - 1;
    if (newIndex > this.characterSet.length - 1) newIndex = 0;

    this.currentIndex = newIndex;

    // Insert letter
    if (gamepad.pressed.a) {
      if (!isAtMaxLength) {
        this.stackedText += this.getCharacterToInsert();
      } else {
        this.confirm();
      }
    }

    // Remove letter
    if (gamepad.pressed.b) {
      if (this.stackedText.length > 0) {
        this.stackedText = this.stackedText.substr(0, this.stackedText.length - 1);
      } else {
        this.cancel();
      }
    }

    // Blink cursor
    if (game.time.now - this.lastCursorBlinkTime >= 350) {
      this.cursorVisible = !this.cursorVisible;
      this.lastCursorBlinkTime = game.time.now;
    }

    // Confirm
    if (gamepad.pressed.start) {
      this.confirm();
    }

    // Cancel
    if (gamepad.pressed.select) {
      this.cancel();
    }
  }
  confirm() {
    this.onConfirm.dispatch(this.text);
    this.destroy();
  }
  cancel() {
    this.onCancel.dispatch(this.text);
    this.destroy();
  }
  destroy() {
    super.destroy();
    this.onConfirm.dispose();
  }
}

class ValueInput extends Phaser.Sprite {
  constructor(value = 0, min = 0, max = Infinity, step = 1, onConfirm, onCancel) {
    super(game, 96, 28);
    
    this.anchor.x = 0.5;

    this.window = new Window(0, 0, 8, 2, "1", this);
    this.window.x -= (this.window.size.width / 2) * 8;
    
    this.value = value;
    this.min = min;
    this.max = max;
    this.step = step;
    
    this.lastInputTime = 0;
    this.inputCooldown = 120; 
    
    this.textLayer = new Text(3, 5, "");
    this.textLayer.tint = this.window.fontTint;
    this.window.addChild(this.textLayer);
    
    this.cursor = game.add.graphics(0, 1);
    this.cursor.beginFill(this.window.fontTint, 1);
    this.cursor.drawRect(0, 0, 2, 4);
    this.cursor.endFill();
    this.textLayer.addChild(this.cursor);

    this.lastCursorBlinkTime = 0;
    this.cursorVisible = false;

    this.onConfirm = new Phaser.Signal();
    this.onCancel = new Phaser.Signal();

    if (onConfirm) {
      this.onConfirm.add(onConfirm);
    }
    if (onCancel) {
      this.onCancel.add(onCancel);
    }

    game.add.existing(this);
  }
  confirm() {
    this.onConfirm.dispatch(this.value);
    this.destroy();
  }
  cancel() {
    this.onCancel.dispatch(this.value);
    this.destroy();
  }
  update() {
    if (game.time.now - this.lastInputTime > this.inputCooldown) {
      if (gamepad.held.down) {
        this.value = Math.max(this.min, this.value - this.step);
        this.lastInputTime = game.time.now;
      }
      if (gamepad.held.up) {
        this.value = Math.min(this.max, this.value + this.step);
        this.lastInputTime = game.time.now;
      }
      if (gamepad.held.left) {
        this.value = Math.max(this.min, this.value - this.step * 5);
        this.lastInputTime = game.time.now;
      }
      if (gamepad.held.right) {
        this.value = Math.min(this.max, this.value + this.step * 5);
        this.lastInputTime = game.time.now;
      }
    }
    
    this.textLayer.write(`${parseFloat(this.value.toFixed(3))}`);
    
    this.cursor.x = this.textLayer.texture.text.length * 4;
    
    if (gamepad.pressed.a || gamepad.pressed.start) {
      this.confirm();
    }
    
    if (gamepad.pressed.b || gamepad.pressed.select) {
      this.cancel();
    }
    
    if (game.time.now - this.lastCursorBlinkTime >= 350) {
      this.cursorVisible = !this.cursorVisible;
      this.lastCursorBlinkTime = game.time.now;
    }
  }
  destroy() {
    super.destroy();
    this.onConfirm.dispose();
  }
}

class NotificationSystem {
  constructor() {
    this.queue = [];
    this.isShowing = false;
    this.currentNotification = null;
    this.duration = 3000;
    this.lineHeight = 8;
    this.padding = 8;
    this.maxLineWidth = 160;
    this.charWidth = 4;
    
    this.notificationWindow = null;
    this.notificationTexts = null;
    
    this.restrictedStates = new Set(['Title', 'Play', 'Load', 'LoadLocalSongs', 'LoadExternalSongs', 'LoadSongFolder', 'Boot']);
    this.allowedStates = new Set(['MainMenu', 'SongSelect', 'Results', 'CharacterSelect', 'Jukebox', 'Editor', 'AchievementsMenu', 'StatsMenu']);
    
    this.setupStateChangeHandling();
  }

  setupStateChangeHandling() {
    const originalStart = game.state.start;
    
    game.state.start = function(key, clearWorld, clearCache, ...args) {
      if (notifications && notifications.isShowing) {
        notifications.preserveCurrentNotification();
      }
      
      return originalStart.call(this, key, clearWorld, clearCache, ...args);
    };
    
    game.state.onStateChange.add(this.onStateChange, this);
  }

  onStateChange(newState) {
    game.time.events.add(100, () => {
      const currentState = game.state.getCurrentState();
      const stateName = currentState?.constructor?.name || '';
      
      if (this.isStateAllowed(stateName)) {
        this.processPendingNotifications();
      }
      
      if (this.preservedNotification) {
        this.restorePreservedNotification();
      }
    });
  }

  // Main show method for regular text notifications
  show(text, duration = 2000) {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    
    const wrappedText = this.wrapText(text);
    
    this.queue.push({ 
      type: 'text',
      text: wrappedText, 
      originalText: text,
      duration,
      endTime: Date.now() + duration,
      queuedInState: stateName
    });
    
    if (this.isStateAllowed(stateName) && !this.isShowing) {
      this.processNext();
    }
  }

  // Show achievement notification
  showAchievement(achievement, expGain = 0) {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    
    this.queue.push({
      type: 'achievement',
      text: `Achievement Unlocked!\n${achievement.name}\n${achievement.description.achieved}`,
      duration: 2500, // Longer for achievements
      endTime: Date.now() + 2500,
      queuedInState: stateName
    });
    
    if (this.isStateAllowed(stateName) && !this.isShowing) {
      this.processNext();
    }
  }

  // Show experience gain notification with animation
  showExpGain(character, expGain, levelBefore, levelAfter, expBefore, expAfter) {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    
    this.queue.push({
      type: 'exp',
      character: character,
      expGain: expGain,
      levelBefore: levelBefore,
      levelAfter: levelAfter,
      expBefore: expBefore,
      expAfter: expAfter,
      duration: 5000, // Longer for exp animations
      endTime: Date.now() + 5000,
      queuedInState: stateName
    });
    
    if (this.isStateAllowed(stateName) && !this.isShowing) {
      this.processNext();
    }
  }

  processPendingNotifications() {
    if (this.queue.length > 0 && !this.isShowing) {
      this.processNext();
    }
  }

  processNext() {
    const currentState = game.state.getCurrentState();
    const stateName = currentState?.constructor?.name || '';
    
    if (!this.isStateAllowed(stateName)) {
      return;
    }
    
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const notification = this.queue.shift();
    this.currentNotification = notification;

    // Handle different notification types
    switch (notification.type) {
      case 'achievement':
        this.displayTextNotification(notification.text);
        break;
      case 'exp':
        this.displayExpNotification(notification);
        break;
      case 'text':
      default:
        this.displayTextNotification(notification.text);
        break;
    }

    game.time.events.add(notification.duration, () => {
      this.hideCurrent();
    });
  }

  displayTextNotification(text) {
    const lines = text.split('\n');
    const lineCount = lines.length;
    
    const maxLineWidth = Math.min(this.maxLineWidth, Math.max(...lines.map(line => this.getTextWidth(line))));
    const windowWidth = Math.floor(Math.min(180, maxLineWidth + this.padding * 2));
    const windowHeight = Math.floor((lineCount * this.lineHeight) + this.padding * 2);
    
    const x = (game.width - windowWidth) / 2;
    const y = 4;

    this.notificationWindow = new Window(x / 8, y / 8, windowWidth / 8, windowHeight / 8, "1");
    this.notificationWindow.focus = false;
    this.notificationWindow.selector.visible = false;
    
    this.notificationTexts = [];
    
    lines.forEach((line, index) => {
      const lineText = new Text(
        windowWidth / 2,
        this.padding + (index * this.lineHeight) + (this.lineHeight / 2),
        line,
        {
          ...FONTS.default,
          tint: 0x76fcde
        }
      );
      lineText.anchor.set(0.5);
      this.notificationWindow.addChild(lineText);
      this.notificationTexts.push(lineText);
    });

    this.notificationWindow.alpha = 0;
    game.add.tween(this.notificationWindow).to({ alpha: 1 }, 300, "Linear", true);
  }
  
  displayExpNotification(notification) {
    const windowWidth = 140;
    const windowHeight = 40;
    const x = (game.width - windowWidth) / 2;
    const y = 4;

    this.notificationWindow = new Window(x / 8, y / 8, windowWidth / 8, windowHeight / 8, "1");
    this.notificationWindow.focus = false;
    this.notificationWindow.selector.visible = false;
    
    // Title
    const titleText = new Text(
      windowWidth / 2,
      7,
      "EXPERIENCE GAIN!",
      {
        ...FONTS.default,
        tint: 0x76FCDE
      }
    );
    titleText.anchor.set(0.5);
    this.notificationWindow.addChild(titleText);

    // Character name and level
    const charText = new Text(
      windowWidth / 2,
      14,
      `${notification.character.name} - Level ${notification.levelBefore}`,
      {
        ...FONTS.default,
        tint: 0xFFFFFF
      }
    );
    charText.anchor.set(0.5);
    this.notificationWindow.addChild(charText);

    // Experience amount
    const expText = new Text(
      windowWidth / 2,
      22,
      `+${notification.expGain} EXP`,
      {
        ...FONTS.default,
        tint: 0xFFFFFF
      }
    );
    expText.anchor.set(0.5);
    this.notificationWindow.addChild(expText);

    // Experience bar background
    const barBg = game.add.graphics(20, 30);
    barBg.beginFill(0x333333);
    barBg.drawRect(0, 0, windowWidth - 40, 4);
    barBg.endFill();
    this.notificationWindow.addChild(barBg);

    // Experience bar foreground
    const expBar = game.add.graphics(20, 30);
    expBar.beginFill(0x76FCDE);
    this.notificationWindow.addChild(expBar);

    this.notificationWindow.alpha = 0;
    game.add.tween(this.notificationWindow).to({ alpha: 1 }, 300, "Linear", true);

    // Animate experience gain
    this.animateExpBar(notification, expBar, windowWidth - 40);
  }

  animateExpBar(notification, expBar, barWidth) {
    const expCurve = CHARACTER_SYSTEM.EXPERIENCE_CURVE;
    let currentExp = notification.expBefore;
    let currentLevel = notification.levelBefore;
    const targetExp = notification.expAfter;
    const targetLevel = notification.levelAfter;
    
    const animate = () => {
      if (currentLevel < targetLevel || currentExp < targetExp) {
        if (currentExp < expCurve(currentLevel)) {
          currentExp++;
        } else {
          currentExp = 0;
          currentLevel++;
          
          // Level up effect
          this.showLevelUpEffect(currentLevel);
        }
        
        // Update exp bar
        const progress = currentExp / expCurve(currentLevel);
        expBar.clear();
        expBar.beginFill(0x76FCDE);
        expBar.drawRect(0, 0, barWidth * progress, 4);
        expBar.endFill();
        
        game.time.events.add(30, animate);
      }
    };
    
    game.time.events.add(500, animate);
  }

  showLevelUpEffect(level) {
    // Create level up text effect
    const levelText = new Text(
      game.width / 2,
      game.height / 2,
      `LEVEL UP! ${level}`,
      {
        ...FONTS.shaded,
        tint: 0xFFD700
      }
    );
    levelText.anchor.set(0.5);
    levelText.alpha = 0;
    levelText.scale.set(1.5);
    
    game.world.add(levelText);
    
    // Animate level up text
    const levelTween = game.add.tween(levelText).to({ 
      alpha: 1,
      scale: { x: 2, y: 2 }
    }, 400, Phaser.Easing.Back.Out, true);
    
    levelTween.onComplete.add(() => {
      game.add.tween(levelText).to({ 
        alpha: 0,
        y: levelText.y - 20
      }, 600, Phaser.Easing.Cubic.In, true).onComplete.add(() => {
        levelText.destroy();
      });
    });
    
    // Play level up sound if available
    if (ENABLE_UI_SFX) {
      Audio.play('level_up', 0.7);
    }
  }

  // Existing helper methods
  wrapText(text) {
    const lines = text.split('\n');
    const wrappedLines = [];
    
    for (let line of lines) {
      if (this.getTextWidth(line) <= this.maxLineWidth) {
        wrappedLines.push(line);
        continue;
      }
      
      let currentLine = '';
      const words = line.split(' ');
      
      for (let word of words) {
        if (this.getTextWidth(word) > this.maxLineWidth) {
          if (currentLine) {
            wrappedLines.push(currentLine.trim());
            currentLine = '';
          }
          const brokenWord = this.breakLongWord(word);
          wrappedLines.push(...brokenWord);
          continue;
        }
        
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (this.getTextWidth(testLine) <= this.maxLineWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            wrappedLines.push(currentLine.trim());
          }
          currentLine = word;
        }
      }
      
      if (currentLine) {
        wrappedLines.push(currentLine.trim());
      }
    }
    
    return wrappedLines.join('\n');
  }

  breakLongWord(word) {
    const chunks = [];
    let currentChunk = '';
    
    for (let i = 0; i < word.length; i++) {
      currentChunk += word[i];
      if (this.getTextWidth(currentChunk + (word[i + 1] || '')) > this.maxLineWidth) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  getTextWidth(text) {
    return text.length * this.charWidth;
  }

  preserveCurrentNotification() {
    if (this.currentNotification && this.notificationWindow) {
      this.preservedNotification = {
        ...this.currentNotification,
        remainingTime: this.currentNotification.endTime - Date.now()
      };
      
      this.cleanupUI();
    }
  }

  restorePreservedNotification() {
    if (this.preservedNotification) {
      const currentState = game.state.getCurrentState();
      const stateName = currentState?.constructor?.name || '';
      
      if (!this.isStateAllowed(stateName)) {
        return;
      }
      
      const preserved = this.preservedNotification;
      
      // Re-display based on type
      switch (preserved.type) {
        case 'achievement':
          this.displayTextNotification(preserved.text);
          break;
        case 'exp':
          this.displayExpNotification(preserved);
          break;
        case 'text':
        default:
          this.displayTextNotification(preserved.text);
          break;
      }
      
      this.isShowing = true;
      
      const remainingDuration = Math.max(500, preserved.remainingTime);
      
      game.time.events.add(remainingDuration, () => {
        this.hideCurrent();
      });
      
      this.currentNotification = {
        ...preserved,
        duration: remainingDuration,
        endTime: Date.now() + remainingDuration
      };
      
      this.preservedNotification = null;
    }
  }

  hideCurrent() {
    if (this.currentNotification && this.notificationWindow) {
      const tween = game.add.tween(this.notificationWindow).to({ alpha: 0 }, 300, "Linear", true);
      tween.onComplete.add(() => {
        this.cleanupUI();
        this.currentNotification = null;
        
        const currentState = game.state.getCurrentState();
        const stateName = currentState?.constructor?.name || '';
        
        if (this.isStateAllowed(stateName)) {
          this.processNext();
        }
      });
    }
  }

  cleanupUI() {
    if (this.notificationWindow) {
      this.notificationWindow.destroy();
      this.notificationWindow = null;
    }
    if (this.notificationTexts) {
      this.notificationTexts.forEach(text => text.destroy());
      this.notificationTexts = null;
    }
  }

  isStateAllowed(stateName) {
    return this.allowedStates.has(stateName);
  }

  clear() {
    this.queue = [];
    if (this.currentNotification) {
      this.hideCurrent();
    }
    this.preservedNotification = null;
  }

  destroy() {
    this.clear();
    game.state.onStateChange.remove(this.onStateChange, this);
  }
}

class Lyrics {
  constructor(options = {}) {
    this.textElement = options.textElement || null; // Text instance to display lyrics
    this.maxLineLength = options.maxLineLength || 30; // Maximum characters per line
    this.currentTime = 0;
    this.lrcData = [];
    this.rangeLrc = [];
    this.currentLineIndex = -1;
    this.currentColor = 0xffffff; // Default white color
    
    // Parse LRC data
    if (options.lrc) {
      this.setLrc(options.lrc);
    }
  }

  setLrc(rawLrc) {
    this.tags = {};
    this.lrcData = [];
    this.rangeLrc = [];
    this.currentLineIndex = -1;
    this.currentColor = 0xffffff; // Reset to default white

    const tagRegex = /\[([a-z]+):(.*)\].*/;
    const lrcAllRegex = /(\[[0-9.:\[\]]*\])+(.*)/;
    const timeRegex = /\[([0-9]+):([0-9.]+)\]/;
    const colorRegex = /\[COLOUR\]0x([0-9a-fA-F]{6})/;
    const rawLrcArray = rawLrc.split(/[\r\n]/);
    
    for (let i = 0; i < rawLrcArray.length; i++) {
      // Handle color tags
      const colorMatch = colorRegex.exec(rawLrcArray[i]);
      if (colorMatch && colorMatch[0]) {
        const hexColor = colorMatch[1];
        // Convert hex string to integer (0xRRGGBB)
        this.currentColor = parseInt(hexColor, 16);
        continue;
      }
      
      // Handle other tags (artist, title, etc.)
      const tag = tagRegex.exec(rawLrcArray[i]);
      if (tag && tag[0]) {
        this.tags[tag[1]] = tag[2];
        continue;
      }
      
      // Handle lyrics with timestamps
      const lrc = lrcAllRegex.exec(rawLrcArray[i]);
      if (lrc && lrc[0]) {
        const times = lrc[1].replace(/\]\[/g,"],[").split(",");
        const lineText = lrc[2].trim();
        
        for (let j = 0; j < times.length; j++) {
          const time = timeRegex.exec(times[j]);
          if (time && time[0]) {
            const startTime = parseInt(time[1], 10) * 60 + parseFloat(time[2]);
            this.lrcData.push({ 
              startTime: startTime, 
              line: lineText,
              color: this.currentColor // Store current color with the line
            });
          }
        }
      }
    }

    // Sort by start time
    this.lrcData.sort((a, b) => a.startTime - b.startTime);

    // Create range-based LRC data for easier lookup
    let startTime = 0;
    let line = "";
    let color = 0xffffff; // Default white
    
    for (let i = 0; i < this.lrcData.length; i++) {
      const endTime = this.lrcData[i].startTime;
      this.rangeLrc.push({ 
        startTime: startTime, 
        endTime: endTime, 
        line: line,
        color: color
      });
      startTime = endTime;
      line = this.lrcData[i].line;
      color = this.lrcData[i].color;
    }
    
    // Add final segment
    this.rangeLrc.push({ 
      startTime: startTime, 
      endTime: Number.MAX_SAFE_INTEGER, 
      line: line,
      color: color
    });
  }

  move(time) {
    this.currentTime = time;
    
    // Find the current line based on time
    for (let i = 0; i < this.rangeLrc.length; i++) {
      if (time >= this.rangeLrc[i].startTime && time < this.rangeLrc[i].endTime) {
        if (this.currentLineIndex !== i && this.textElement) {
          this.currentLineIndex = i;
          this.displayCurrentLine();
        }
        return;
      }
    }
    
    // If no line found, clear display
    if (this.currentLineIndex !== -1 && this.textElement) {
      this.currentLineIndex = -1;
      this.textElement.write("");
    }
  }

  displayCurrentLine() {
    if (!this.textElement || this.currentLineIndex < 0) return;

    const currentLineData = this.rangeLrc[this.currentLineIndex];
    const lineText = currentLineData.line.trim();
    
    if (!lineText) {
      this.textElement.write("");
      return;
    }

    // Stop any existing scrolling
    if (this.textElement.isScrolling && this.textElement.stopScrolling) {
      this.textElement.stopScrolling();
    }

    // Set text tint to the stored color
    this.textElement.tint = currentLineData.color;
    this.textElement.write(lineText);
    
    // Warp if text too long
    if (lineText.length > this.maxLineLength) {
      this.textElement.wrap(this.maxLineLength * 5);
    }
  }

  // Get current line text
  getCurrentLine() {
    if (this.currentLineIndex >= 0 && this.currentLineIndex < this.rangeLrc.length) {
      return this.rangeLrc[this.currentLineIndex].line;
    }
    return "";
  }

  // Get current line color
  getCurrentColor() {
    if (this.currentLineIndex >= 0 && this.currentLineIndex < this.rangeLrc.length) {
      return this.rangeLrc[this.currentLineIndex].color;
    }
    return 0xffffff; // Default white
  }

  // Get next line text (for preview)
  getNextLine() {
    const nextIndex = this.currentLineIndex + 1;
    if (nextIndex < this.rangeLrc.length) {
      return this.rangeLrc[nextIndex].line;
    }
    return "";
  }

  // Check if lyrics are loaded
  hasLyrics() {
    return this.lrcData.length > 0;
  }

  // Clear lyrics display
  clear() {
    if (this.textElement) {
      this.textElement.write("");
    }
    this.currentLineIndex = -1;
    this.lrcData = [];
    this.rangeLrc = [];
    this.currentColor = 0xffffff;
  }

  // Destroy and cleanup
  destroy() {
    this.clear();
    this.textElement = null;
  }
}

class OffsetAssistant extends Phaser.Sprite {
  constructor(game) {
    super(game, 0, 0);
    
    this.taps = [];
    this.confidenceThreshold = 0.8;
    this.maxTaps = 16;
    this.requiredTaps = 8;
    this.tickBPM = 120;
    this.tickInterval = 60000 / this.tickBPM; // 500ms per tick
    
    // Store background music state
    this.wasMusicPlaying = backgroundMusic && backgroundMusic.isPlaying;
    this.originalMusicTime = 0;
    
    // Pause background music
    this.pauseBackgroundMusic();
    
    // Start tick sound
    this.startTickSound();
    
    // Create background
    this.background = game.add.graphics(0, 0);
    this.background.beginFill(0x000000, 0.8);
    this.background.drawRect(0, 0, game.width, game.height);
    this.background.endFill();
    this.addChild(this.background);
    
    // Create instruction text
    this.instructionText = new Text(game.width / 2, game.height / 2 - 20, "TAP A TO THE TICK", FONTS.shaded);
    this.instructionText.anchor.set(0.5);
    this.addChild(this.instructionText);
    
    // Create offset display text
    this.offsetText = new Text(game.width / 2, game.height / 2 + 10, "Offset: 0ms", FONTS.default);
    this.offsetText.anchor.set(0.5);
    this.addChild(this.offsetText);
    
    // Create tap counter
    this.tapCounter = new Text(game.width / 2, game.height / 2 + 30, "Taps: 0", FONTS.default);
    this.tapCounter.anchor.set(0.5);
    this.tapCounter.alpha = 0.7;
    this.addChild(this.tapCounter);
    
    // Create exit hint
    this.exitText = new Text(game.width / 2, game.height - 10, "Press B to exit and save", FONTS.default);
    this.exitText.anchor.set(0.5);
    this.exitText.alpha = 0.5;
    this.addChild(this.exitText);
    
    // Track button states
    this.lastAPress = false;
    this.lastBPress = false;
    
    // Track tick timing
    this.lastTickTime = 0;
    this.nextTickTime = this.game.time.now;
    
    // Store calculated offsets for averaging
    this.calculatedOffsets = [];
  }

  update() {
    // Handle A button for tapping
    if (gamepad.pressed.a && !this.lastAPress) {
      this.onTap();
    }
    this.lastAPress = gamepad.pressed.a;
    
    // Handle B button to exit
    if (gamepad.pressed.b && !this.lastBPress) {
      this.exit();
    }
    this.lastBPress = gamepad.pressed.b;
    
    // Update tick sound
    this.updateTickSound();
    
    // Update tap counter
    this.tapCounter.write(`Taps: ${this.taps.length}`);
  }

  pauseBackgroundMusic() {
    if (backgroundMusic && backgroundMusic.isPlaying) {
      this.originalMusicTime = backgroundMusic.audio.currentTime;
      backgroundMusic.stop();
    }
  }

  resumeBackgroundMusic() {
    if (backgroundMusic && this.wasMusicPlaying) {
      // Try to resume from where we left off
      backgroundMusic.audio.currentTime = this.originalMusicTime;
      backgroundMusic.audio.play();
    }
  }

  startTickSound() {
    // Preload the tick sound if not already loaded
    if (!game.cache.checkSoundKey('assist_tick')) {
      console.warn("Tick sound not preloaded!");
      return;
    }
    
    // Play first tick immediately
    this.playTickSound();
    this.lastTickTime = this.game.time.now;
    this.nextTickTime = this.lastTickTime + this.tickInterval;
  }

  updateTickSound() {
    if (this.destroyed) return;
    
    const currentTime = this.game.time.now;
    
    // Check if it's time for the next tick
    if (currentTime >= this.nextTickTime) {
      this.playTickSound();
      this.lastTickTime = currentTime;
      this.nextTickTime = currentTime + this.tickInterval;
    }
  }

  playTickSound() {
    if (game.cache.checkSoundKey('assist_tick')) {
      const tickSound = game.add.audio('assist_tick');
      tickSound.volume = 0.5;
      tickSound.play();
    }
  }

  onTap() {
    const currentTime = this.game.time.now;
    
    // Add the current tap time
    this.taps.push(currentTime);
    
    // Keep only the most recent taps
    if (this.taps.length > this.maxTaps) {
      this.taps.shift();
    }
    
    // Calculate the detected offset
    this.calculateOffset();
    
    // Provide visual feedback for the tap
    this.showTapFeedback();
  }

  calculateOffset() {
    if (this.taps.length < 2) {
      this.offsetText.write("Offset: 0ms");
      this.offsetText.tint = 0xFFFFFF;
      return;
    }
    
    // Calculate offset for each tap relative to the nearest tick
    const currentOffsets = [];
    
    for (let i = 0; i < this.taps.length; i++) {
      const tapTime = this.taps[i];
      
      // Find the nearest tick time
      const ticksSinceStart = Math.round((tapTime - this.taps[0]) / this.tickInterval);
      const expectedTapTime = this.taps[0] + (ticksSinceStart * this.tickInterval);
      
      // Calculate offset for this tap
      const offset = tapTime - expectedTapTime;
      currentOffsets.push(offset);
    }
    
    // Calculate average offset from all taps
    const averageOffset = currentOffsets.reduce((a, b) => a + b, 0) / currentOffsets.length;
    
    // Round to nearest 25ms
    const roundedOffset = Math.round(averageOffset / 25) * 25;
    
    // Store this calculated offset for final averaging
    this.calculatedOffsets.push(roundedOffset);
    
    // Keep only recent calculated offsets
    if (this.calculatedOffsets.length > 5) {
      this.calculatedOffsets.shift();
    }
    
    // Calculate final average offset from all calculations
    const finalAverageOffset = this.calculatedOffsets.length > 0 
      ? Math.round(this.calculatedOffsets.reduce((a, b) => a + b, 0) / this.calculatedOffsets.length / 25) * 25
      : roundedOffset;
    
    // Calculate confidence based on tap consistency
    const confidence = this.calculateConfidence(currentOffsets);
    
    // Update display with the final averaged offset
    const offsetDisplay = `Offset: ${finalAverageOffset}ms`;
    this.offsetText.write(offsetDisplay);
    
    // Change color based on confidence
    if (this.taps.length >= this.requiredTaps && confidence >= this.confidenceThreshold) {
      this.offsetText.tint = 0x00FF00; // Green - confident
    } else if (this.taps.length >= 4) {
      this.offsetText.tint = 0xFFFF00; // Yellow - somewhat confident
    } else {
      this.offsetText.tint = 0xFFFFFF; // White - not confident
    }
  }

  calculateConfidence(offsets) {
    if (offsets.length < 3) return 0;
    
    // Calculate mean offset
    const mean = offsets.reduce((a, b) => a + b, 0) / offsets.length;
    
    // Calculate variance
    const variance = offsets.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / offsets.length;
    
    // Calculate standard deviation
    const stdDev = Math.sqrt(variance);
    
    // Confidence is inverse of standard deviation (lower deviation = higher confidence)
    // Using 50ms as reference point (if stdDev is 50ms, confidence is 0)
    const confidence = Math.max(0, 1 - (stdDev / 50));
    
    return Math.min(1, confidence);
  }
  
  roundToNearestMultipleOf25(num) {
    const rounded = Math.round(num / 25);
    return rounded >= 0 ? rounded * 25 : (rounded + 1) * 25;
  }

  showTapFeedback() {
    // Flash the instruction text briefly
    this.game.add.tween(this.instructionText.scale)
      .to({ x: 1.1, y: 1.1 }, 50, Phaser.Easing.Quadratic.Out, true)
      .yoyo(true);
  }

  exit() {
    // Calculate final offset average
    let finalOffset = 0;
    
    if (this.calculatedOffsets.length > 0) {
      finalOffset = this.roundToNearestMultipleOf25(this.calculatedOffsets.reduce((a, b) => a + b, 0) / this.calculatedOffsets.length);
      
      // Update account settings with the final averaged offset
      Account.settings.userOffset = finalOffset;
      saveAccount();
      
      // Show confirmation
      notifications.show(`Offset set to ${finalOffset}ms`);
    } else if (this.taps.length > 0) {
      // Fallback to last calculation if no averages stored
      const currentOffset = this.parseOffsetText();
      if (currentOffset !== null) {
        Account.settings.userOffset = currentOffset;
        saveAccount();
        notifications.show(`Offset set to ${currentOffset}ms`);
      }
    }
    
    // Resume background music
    this.resumeBackgroundMusic();
    
    // Return to settings menu
    this.destroy();
    game.state.getCurrentState().menu();
  }

  parseOffsetText() {
    const text = this.offsetText.text;
    const match = text.match(/Offset: (-?\d+)ms/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  destroy() {
    // Make sure music is resumed even if destroyed unexpectedly
    this.resumeBackgroundMusic();
    
    this.destroyed = true;
    
    // Clean up all created objects
    this.background.destroy();
    this.instructionText.destroy();
    this.offsetText.destroy();
    this.tapCounter.destroy();
    this.exitText.destroy();
    
    super.destroy();
  }
}

class FileSystemTools {
  constructor() {
    this.platform = this.detectPlatform();
    
    if (this.platform === 'nwjs') {
      this.fileSystem = new NodeFileSystem();
    } else if (this.platform === 'cordova') {
      this.fileSystem = new CordovaFileSystem();
    } else {
      this.fileSystem = new FallbackFileSystem();
    }
    
    console.log(`FileSystem: Using ${this.platform} implementation`);
  }

  detectPlatform() {
    // Check for NW.js
    if (typeof nw !== 'undefined' && nw.process) {
      return 'nwjs';
    }
    
    // Check for Cordova
    if (typeof cordova !== 'undefined' && cordova.file) {
      return 'cordova';
    }
    
    return 'fallback';
  }

  // Wrap all Cordova FileSystem methods
  getDirectory(path) {
    return this.fileSystem.getDirectory(path);
  }

  listDirectories(dirEntry) {
    return this.fileSystem.listDirectories(dirEntry);
  }

  listAllDirectories(startDir) {
    return this.fileSystem.listAllDirectories(startDir);
  }

  listFiles(dirEntry) {
    return this.fileSystem.listFiles(dirEntry);
  }

  getFile(fileEntry) {
    return this.fileSystem.getFile(fileEntry);
  }

  readFileContent(file) {
    return this.fileSystem.readFileContent(file);
  }
  
  saveFile(dirEntry, fileData, fileName) {
    return this.fileSystem.saveFile(dirEntry, fileData, fileName);
  }
  
  createEmptyFile(dirEntry, fileName, isAppend) {
    return this.fileSystem.createEmptyFile(dirEntry, fileName, isAppend);
  }
  
  writeFile(fileEntry, dataObj, isAppend) {
    return this.fileSystem.writeFile(fileEntry, dataObj, isAppend);
  }
  
  createDirectory(rootDirEntry, dirName) {
    return this.fileSystem.createDirectory(rootDirEntry, dirName);
  }

  // Additional utility methods
  getBasePath() {
    if (this.platform === 'nwjs' && this.fileSystem.getBasePath) {
      return this.fileSystem.getBasePath();
    }
    return '';
  }

  canExitApp() {
    return this.platform === 'nwjs' || this.platform === 'cordova';
  }

  exitApp() {
    if (this.platform === 'nwjs') {
      if (typeof nw !== 'undefined' && nw.App) {
        nw.App.quit();
      }
    } else if (this.platform === 'cordova') {
      if (typeof navigator !== 'undefined' && navigator.app) {
        navigator.app.exitApp();
      }
    }
  }
}

// Node.js DirectoryEntry equivalent
class NodeDirectoryEntry {
  constructor(name, fullPath, fileSystem, nativeURL) {
    this.isFile = false;
    this.isDirectory = true;
    this.name = name;
    this.fullPath = fullPath;
    this.filesystem = fileSystem;
    this.nativeURL = nativeURL || `file://${fullPath}`;
  }

  createReader() {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(this.filesystem.basePath, this.fullPath);
    
    return {
      readEntries: (successCallback, errorCallback) => {
        try {
          const entries = [];
          const items = fs.readdirSync(fullPath);
          
          for (const item of items) {
            const itemPath = path.join(fullPath, item);
            const stats = fs.statSync(itemPath);
            const relativePath = path.join(this.fullPath, item);
            
            if (stats.isDirectory()) {
              entries.push(new NodeDirectoryEntry(
                item, 
                relativePath, 
                this.filesystem,
                `file://${itemPath}`
              ));
            } else {
              entries.push(new NodeFileEntry(
                item,
                relativePath,
                this.filesystem,
                `file://${itemPath}`
              ));
            }
          }
          
          successCallback(entries);
        } catch (error) {
          errorCallback(error);
        }
      }
    };
  }

  getDirectory(path, options, successCallback, errorCallback) {
    const fs = require('fs');
    const pathModule = require('path');
    const fullPath = pathModule.join(this.filesystem.basePath, this.fullPath, path);
    
    try {
      if (!fs.existsSync(fullPath)) {
        if (options && options.create) {
          fs.mkdirSync(fullPath, { recursive: true });
        } else {
          throw new Error(`Directory not found: ${path}`);
        }
      }
      
      const stats = fs.statSync(fullPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${path}`);
      }
      
      const dirEntry = new NodeDirectoryEntry(
        pathModule.basename(path),
        pathModule.join(this.fullPath, path),
        this.filesystem,
        `file://${fullPath}`
      );
      
      successCallback(dirEntry);
    } catch (error) {
      errorCallback(error);
    }
  }

  getFile(path, options, successCallback, errorCallback) {
    const fs = require('fs');
    const pathModule = require('path');
    const fullPath = pathModule.join(this.filesystem.basePath, this.fullPath, path);
    
    try {
      if (!fs.existsSync(fullPath)) {
        if (options && options.create) {
          // Create empty file
          fs.writeFileSync(fullPath, '');
        } else {
          throw new Error(`File not found: ${path}`);
        }
      }
      
      const stats = fs.statSync(fullPath);
      if (!stats.isFile()) {
        throw new Error(`Path is not a file: ${path}`);
      }
      
      const fileEntry = new NodeFileEntry(
        pathModule.basename(path),
        pathModule.join(this.fullPath, path),
        this.filesystem,
        `file://${fullPath}`
      );
      
      successCallback(fileEntry);
    } catch (error) {
      errorCallback(error);
    }
  }

  removeRecursively(successCallback, errorCallback) {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(this.filesystem.basePath, this.fullPath);
    
    try {
      const removeDir = (dirPath) => {
        if (fs.existsSync(dirPath)) {
          const items = fs.readdirSync(dirPath);
          for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
              removeDir(itemPath);
            } else {
              fs.unlinkSync(itemPath);
            }
          }
          fs.rmdirSync(dirPath);
        }
      };
      
      removeDir(fullPath);
      successCallback();
    } catch (error) {
      errorCallback(error);
    }
  }
}

// Node.js FileEntry equivalent
class NodeFileEntry {
  constructor(name, fullPath, fileSystem, nativeURL) {
    this.isFile = true;
    this.isDirectory = false;
    this.name = name;
    this.fullPath = fullPath;
    this.filesystem = fileSystem;
    this.nativeURL = nativeURL || `file://${fullPath}`;
  }

  createWriter(successCallback, errorCallback) {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(this.filesystem.basePath, this.fullPath);
    
    try {
      const writer = {
        write: (data) => {
          try {
            if (data instanceof Blob) {
              // Convert Blob to Buffer
              const reader = new FileReader();
              reader.onload = () => {
                fs.writeFileSync(fullPath, Buffer.from(reader.result));
              };
              reader.onerror = () => errorCallback(reader.error);
              reader.readAsArrayBuffer(data);
            } else if (typeof data === 'string') {
              fs.writeFileSync(fullPath, data);
            } else if (data instanceof ArrayBuffer) {
              fs.writeFileSync(fullPath, Buffer.from(data));
            } else {
              fs.writeFileSync(fullPath, data);
            }
          } catch (error) {
            errorCallback(error);
          }
        }
      };
      
      successCallback(writer);
    } catch (error) {
      errorCallback(error);
    }
  }

  file(successCallback, errorCallback) {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(this.filesystem.basePath, this.fullPath);
    
    try {
      const stats = fs.statSync(fullPath);
      const file = {
        name: this.name,
        size: stats.size,
        type: this.getMimeType(this.name),
        lastModified: stats.mtime,
        slice: (start, end) => {
          const buffer = fs.readFileSync(fullPath);
          return buffer.slice(start, end);
        },
        localURL: fullPath
      };
      
      // Add the path for internal use
      file._path = fullPath;
      
      successCallback(file);
    } catch (error) {
      errorCallback(error);
    }
  }

  getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'sm': 'text/plain',
      'ssc': 'text/plain',
      'json': 'application/json',
      'txt': 'text/plain'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

class NodeFileSystem {
  constructor() {
    try {
      this.fs = require('fs');
      this.path = require('path');
      this.basePath = this.getBasePath();
      
      // Create file system object for DirectoryEntry
      this.fileSystemObj = {
        name: 'nodefs',
        root: new NodeDirectoryEntry('', '/', this, `file://${this.basePath}`)
      };
      
    } catch (error) {
      console.error('Node.js modules not available:', error);
      throw error;
    }
  }

  getBasePath() {
    if (typeof nw !== 'undefined' && nw.process) {
      // NW.js - use the directory where the executable is located
      return nw.process.cwd();
    } else if (typeof process !== 'undefined' && process.cwd) {
      // Node.js - use current working directory
      return process.cwd();
    }
    return '.';
  }

  getDirectory(path) {
    return new Promise((resolve, reject) => {
      const fullPath = this.path.join(this.basePath, path);
      
      this.fs.stat(fullPath, (err, stats) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!stats.isDirectory()) {
          reject(new Error(`Path is not a directory: ${path}`));
          return;
        }
        
        const dirEntry = new NodeDirectoryEntry(
          this.path.basename(path) || '.',
          path,
          this,
          `file://${fullPath}`
        );
        
        resolve(dirEntry);
      });
    });
  }

  listDirectories(dirEntry) {
    return new Promise((resolve, reject) => {
      dirEntry.createReader().readEntries(
        entries => resolve(entries.filter(e => e.isDirectory)),
        err => reject(err)
      );
    });
  }

  listAllDirectories(startDir) {
    return new Promise(async (resolve) => {
      const dirs = [];
      const queue = [startDir];

      while (queue.length) {
        const dir = queue.shift();
        try {
          const subDirs = await this.listDirectories(dir);
          dirs.push(...subDirs);
          queue.push(...subDirs);
        } catch (error) {
          console.warn(`Error listing directories in ${dir.name}:`, error);
        }
      }

      resolve(dirs);
    });
  }

  listFiles(dirEntry) {
    return new Promise((resolve, reject) => {
      dirEntry.createReader().readEntries(
        entries => resolve(entries.filter(e => e.isFile)),
        err => reject(err)
      );
    });
  }

  getFile(fileEntry) {
    return new Promise((resolve, reject) => {
      fileEntry.file(
        file => resolve(file),
        err => reject(err)
      );
    });
  }

  readFileContent(file) {
    return new Promise((resolve, reject) => {
      // If file has _path (from NodeFileEntry), use it directly
      if (file._path) {
        this.fs.readFile(file._path, 'utf8', (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      } else {
        // Fallback for Blob files (from Cordova)
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      }
    });
  }
  
  saveFile(dirEntry, fileData, fileName) {
    return new Promise((resolve, reject) => {
      dirEntry.getFile(fileName, { create: true, exclusive: false }, 
        fileEntry => resolve(fileEntry),
        error => reject(error)
      );
    });
  }
  
  createEmptyFile(dirEntry, fileName, isAppend) {
    return new Promise((resolve, reject) => {
      dirEntry.getFile(fileName, {create: true, exclusive: false}, 
        fileEntry => resolve(fileEntry),
        err => reject(err)
      );
    });
  }
  
  writeFile(fileEntry, dataObj, isAppend) {
    return new Promise((resolve, reject) => {
      fileEntry.createWriter(
        writer => {
          writer.write(dataObj);
          resolve(writer);
        },
        err => reject(err)
      );
    });
  }
  
  createDirectory(rootDirEntry, dirName) {
    return new Promise((resolve, reject) => {
      rootDirEntry.getDirectory(dirName, { create: true }, 
        dirEntry => resolve(dirEntry),
        err => reject(err)
      );
    });
  }
}

class CordovaFileSystem {
  getDirectory(path) {
    return new Promise((resolve, reject) => {
      let rootDir = LocalFileSystem.PERSISTENT;
      if (game.device.windows) {
        rootDir = cordova.file.dataDirectory;
      } else if (game.device.macOS || game.device.iOS) {
        rootDir = cordova.file.documentsDirectory;
      } else if (game.device.android) {
        rootDir = cordova.file.externalRootDirectory;
      }
      window.resolveLocalFileSystemURL(
        rootDir + path,
        dir => resolve(dir),
        err => reject(err)
      );
    });
  }

  listDirectories(dirEntry) {
    return new Promise((resolve, reject) => {
      dirEntry.createReader().readEntries(
        entries => resolve(entries.filter(e => e.isDirectory)),
        err => reject(err)
      );
    });
  }

  listAllDirectories(startDir) {
    return new Promise(async resolve => {
      const dirs = [];
      const queue = [startDir];

      while (queue.length) {
        const dir = queue.shift();
        try {
          const subDirs = await this.listDirectories(dir);
          dirs.push(...subDirs);
          queue.push(...subDirs);
        } catch (error) {
          console.warn(`Error listing directories in ${dir.name}:`, error);
        }
      }

      resolve(dirs);
    });
  }

  listFiles(dirEntry) {
    return new Promise((resolve, reject) => {
      dirEntry.createReader().readEntries(
        entries => resolve(entries.filter(e => e.isFile)),
        err => reject(err)
      );
    });
  }

  getFile(fileEntry) {
    return new Promise((resolve, reject) => {
      fileEntry.file(
        file => resolve(file),
        err => reject(err)
      );
    });
  }

  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
  
  saveFile(dirEntry, fileData, fileName) {
    return new Promise((resolve, reject) => {
      dirEntry.getFile(fileName, { create: true, exclusive: false }, fileEntry => {
        this.writeFile(fileEntry, fileData)
          .then(() => resolve(fileEntry))
          .catch(err => reject(err));
      }, error => reject(error));
    });
  }
  
  createEmptyFile(dirEntry, fileName, isAppend) {
    return new Promise((resolve, reject) => {
      dirEntry.getFile(fileName, {create: true, exclusive: false}, fileEntry => {
        this.writeFile(fileEntry, null, isAppend)
          .then(() => resolve(fileEntry))
          .catch(err => reject(err));
      }, err => reject(err));
    });
  }
  
  writeFile(fileEntry, dataObj, isAppend) {
    return new Promise((resolve, reject) => {
      fileEntry.createWriter(fileWriter => {
        fileWriter.onwrite = () => resolve(fileWriter);
        fileWriter.onerror = err => reject(err);
  
        fileWriter.write(dataObj);
      });
    });
  }
  
  createDirectory(rootDirEntry, dirName) {
    return new Promise((resolve, reject) => {
      rootDirEntry.getDirectory(dirName, { create: true }, dirEntry => {
        resolve(dirEntry);
      }, err => reject(err));
    });
  }
}

class FallbackFileSystem {
  // Fallback implementation for browsers without file system access
  getDirectory(path) {
    return Promise.reject(new Error('File system not available in this environment'));
  }

  listDirectories(dirEntry) {
    return Promise.reject(new Error('File system not available in this environment'));
  }

  listAllDirectories(startDir) {
    return Promise.reject(new Error('File system not available in this environment'));
  }

  listFiles(dirEntry) {
    return Promise.reject(new Error('File system not available in this environment'));
  }

  getFile(fileEntry) {
    return Promise.reject(new Error('File system not available in this environment'));
  }

  readFileContent(file) {
    return Promise.reject(new Error('File system not available in this environment'));
  }
  
  saveFile(dirEntry, fileData, fileName) {
    return Promise.reject(new Error('File system not available in this environment'));
  }
  
  createEmptyFile(dirEntry, fileName, isAppend) {
    return Promise.reject(new Error('File system not available in this environment'));
  }
  
  writeFile(fileEntry, dataObj, isAppend) {
    return Promise.reject(new Error('File system not available in this environment'));
  }
  
  createDirectory(rootDirEntry, dirName) {
    return Promise.reject(new Error('File system not available in this environment'));
  }
}

let game, gamepad, backgroundMusic, notifications, addonManager, sidebarNotifications, achievementsManager;

let Account = {
  ...DEFAULT_ACCOUNT,
  ...JSON.parse(localStorage.getItem("Account") || "{}")
};

const saveAccount = () => localStorage.setItem("Account", JSON.stringify(Account));

const bootGame = () => {
  if (game) game.destroy();
  game = new Phaser.Game({
    width: 192,
    height: 112,
    renderer: Account.settings.renderer,
    scaleMode: Phaser.ScaleManager.SHOW_ALL,
    crisp: Account.settings.pixelated,
    antialias: false,
    alignV: false,
    alignH: true,
    enableDebug: false,
    failIfMajorPerformanceCaveat: false,
    forceSetTimeOut: false,
    clearBeforeRender: true,
    forceSingleUpdate: false,
    maxPointers: 0,
    keyboard: true,
    mouse: false,
    mouseWheel: false,
    mspointer: false,
    multiTexture: false,
    pointerLock: false,
    preserveDrawingBuffer: false,
    roundPixels: true,
    touch: false,
    transparent: false,
    parent: "canvas_parent",
    state: {
      create() {
        game.state.add('Boot', Boot);
        game.state.start('Boot');
        game.recorder = new ScreenRecorder(game);
      }
    },
    ...(window.GameConfig || {})
  });
};

window.onload = bootGame;

const addFpsText = () => {
  const text = new Text(190, 2, "");
  text.anchor.x = 1;
  game.time.events.loop(100, () => text.write(`${game.time.fps} (${game.renderer.renderSession.drawCount - 1})`));
};

const openExternalUrl = url => {
  // Ensure URL is properly encoded
  const encodedUrl = encodeURI(url);
  
  switch (CURRENT_ENVIRONMENT) {
    case ENVIRONMENT.CORDOVA:
      navigator.app.loadUrl(encodedUrl, { openExternal: true });
      break;
    case ENVIRONMENT.NWJS:
      nw.Shell.openExternal(encodedUrl);
      break;
    case ENVIRONMENT.WEB:
    default:
      const a = document.createElement('a');
      a.href = encodedUrl;
      a.target = '_blank';
      a.click();
      break;
  }
};

const Audio = {
  pool: {},
  add: function (key, volume = 1, loop = false, reset = true) {
    if (!reset || !this.pool[key]) {
      this.pool[key] = game.add.audio(key);
    }
    return this.pool[key];
  },
  play: function (key, volume = 1, loop = false, reset = true) {
    if (game) {
      if (!reset || !this.pool[key]) {
        this.pool[key] = game.add.audio(key);
      }
      return this.pool[key].play(null, 0, volume, loop, reset);
    }
  },
  stop: function (key, fadeOut) {
    if (game) {
      const audio = this.pool[key];
      if (audio) {
        if (fadeOut) {
          audio.stop();
        } else {
          audio.fadeOut();
          audio.onFadeComplete.addOnce(() => audio.stop());
        }
      }
      return;
    }
  }
};

// Register recovery listener
// TODO: Implement recovery from JavaScript freeze correctly
const script = document.createElement("script");
script.text = `
window.onerror = (details, file, line) => {
  localStorage.setItem('gameLastCrashed', 'true');
  if (!window.DEBUG && typeof window.eruda !== "undefined") eruda.init(); 
  const filename = file ? file.split('/').pop() : 'unknown file';
  const message = details + " On Line " + line + " of " + filename;
  console.error(message);
  game.state.add('ErrorScreen', ErrorScreen);
  game.state.start('ErrorScreen', false, false, message, 'Boot');
};`;
document.head.appendChild(script);

class Gamepad {
  constructor(game) {
    this.game = game;

    // Define the control keys we want to track
    this.keys = [
      'up',
      'down',
      'left',
      'right',
      'a',
      'b',
      'select',
      'start'
    ];

    // Initialize state objects
    this.held = {};
    this.pressed = {};
    this.released = {};
    this.prevState = {};

    // Initialize all keys
    this.keys.forEach(key => {
      this.held[key] = false;
      this.pressed[key] = false;
      this.released[key] = false;
      this.prevState[key] = false;
    });
    
    // Initialize 'any' states
    this.held.any = false;
    this.pressed.any = false;
    this.released.any = false;
    this.prevState.any = false;

    // Keyboard mappings
    this.keyboardMap = {
      up: [Phaser.KeyCode.UP, Phaser.KeyCode.B],
      down: [Phaser.KeyCode.DOWN, Phaser.KeyCode.F, Phaser.KeyCode.V],
      left: [Phaser.KeyCode.LEFT, Phaser.KeyCode.D, Phaser.KeyCode.C],
      right: [Phaser.KeyCode.RIGHT, Phaser.KeyCode.N],
      a: [Phaser.KeyCode.Z, Phaser.KeyCode.K],
      b: [Phaser.KeyCode.X, Phaser.KeyCode.J],
      select: [Phaser.KeyCode.SHIFT, Phaser.KeyCode.TAB, Phaser.KeyCode.SPACEBAR],
      start: [Phaser.KeyCode.ENTER, Phaser.KeyCode.ESC, Phaser.KeyCode.P]
    };
    
    // Gamepad button mappings
    this.gamepadMap = {
      up: 12,
      down: 13,
      left: 14,
      right: 15,
      a: 1,
      b: 0,
      select: 8,
      start: 9
    };
    
    // TODO: Implement control mapping
    
    // Phaser signals
    this.signals = {
      pressed: {},
      released: {}
    };
    this.keys.forEach(key => {
      this.signals.pressed[key] = new Phaser.Signal();
      this.signals.released[key] = new Phaser.Signal();
    });
    this.signals.pressed.any = new Phaser.Signal();
    this.signals.released.any = new Phaser.Signal();

    // Touch tracking
    this.activeTouches = new Map();
    this.maxTouches = 4;

    // Input detection
    this.lastInputSource = 'none';
    this.inputDetectionTimeout = null;
    this.touchControlsVisible = false;

    // Set up all input methods
    this.setupKeyboard();
    this.setupGamepad();
    this.setupTouch();
    this.setupInputDetection();
  }

  setupKeyboard() {
    // Clear any existing keyboard state
    this.keyboardState = {};
    this.keys.forEach(key => {
      this.keyboardState[key] = false;
    });
  
    // Create reverse mapping for quick lookup
    this.keyCodeToAction = {};
    for (const [action, keyCodes] of Object.entries(this.keyboardMap)) {
      keyCodes.forEach(keyCode => {
        this.keyCodeToAction[keyCode] = action;
      });
    }
  
    // Dynamically create key capture array from keyboard map
    const keyCaptureArray = [];
    for (const keyCodes of Object.values(this.keyboardMap)) {
      keyCaptureArray.push(...keyCodes);
    }
    
    // Remove duplicates and add key capture
    const uniqueKeyCapture = [...new Set(keyCaptureArray)];
    this.game.input.keyboard.addKeyCapture(uniqueKeyCapture);
  
    // Global keyboard listeners
    this.game.input.keyboard.onDownCallback = (event) => {
      const action = this.keyCodeToAction[event.keyCode];
      if (action) {
        this.held[action] = true;
        this.keyboardState[action] = true;
      }
      this.detectInputSource('keyboard');
    };
  
    this.game.input.keyboard.onUpCallback = (event) => {
      const action = this.keyCodeToAction[event.keyCode];
      if (action) {
        this.held[action] = false;
        this.keyboardState[action] = false;
      }
    };
  }

  setupGamepad() {
    // Start gamepad polling
    if (!this.game.input.gamepad.supported) return
    
    this.game.input.gamepad.start();
    
    this.gamepadState = {};
    this.keys.forEach(key => {
      this.gamepadState[key] = false;
    });
    
    this.game.input.gamepad.onDownCallback = keyCode => {
      this.keys.forEach(key => {
        if (this.gamepadMap[key] == keyCode) {
          this.held[key] = true;
          this.gamepadState[key] = true;
          this.detectInputSource('gamepad');
        }
      });
    };
    
    this.game.input.gamepad.onUpCallback = keyCode => {
      this.keys.forEach(key => {
        if (this.gamepadMap[key] == keyCode) {
          this.held[key] = false;
          this.gamepadState[key] = false;
        }
      });
    };
  }

  setupTouch() {
    // Get controller elements
    this.controllerElement = document.getElementById('controller_parent');
    
    if (!this.controllerElement) {
      return;
    }

    // Get all button elements
    this.dpadElements = {
      up: document.getElementById('controller_up'),
      down: document.getElementById('controller_down'),
      left: document.getElementById('controller_left'),
      right: document.getElementById('controller_right')
    };
    
    this.buttonElements = {
      a: document.getElementById('controller_a'),
      b: document.getElementById('controller_b'),
      select: document.getElementById('controller_select'),
      start: document.getElementById('controller_start'),
      rhythm_up: document.getElementById('controller_rhythm_up'),
      rhythm_down: document.getElementById('controller_rhythm_down'),
      rhythm_left: document.getElementById('controller_rhythm_left'),
      rhythm_right: document.getElementById('controller_rhythm_right')
    };

    // Set up touch events
    this.setupControllerTouchEvents();

    // Initial visibility - show on mobile, hide on desktop
    this.updateTouchControlsVisibility();
  }

  setupInputDetection() {
    // Listen for screen taps to show touch controls
    document.addEventListener('touchstart', (e) => {
      if (!e.target.closest('#controller')) {
        this.detectInputSource('touch');
      }
    }, { passive: true });

    // Also detect clicks outside controller
    document.addEventListener('mousedown', (e) => {
      if (this.game.device.touch && !e.target.closest('#controller')) {
        this.detectInputSource('touch');
      }
    }, { passive: true });
  }

  detectInputSource(source) {
    if (this.lastInputSource === source) return;
    
    this.lastInputSource = source;
    
    // Clear existing timeout
    if (this.inputDetectionTimeout) {
      clearTimeout(this.inputDetectionTimeout);
    }

    // Update touch controls visibility
    this.updateTouchControlsVisibility();

    // Auto-hide touch controls after 10 seconds of no touch input
    if (source !== 'touch' && this.game.device.touch) {
      this.inputDetectionTimeout = setTimeout(() => {
        if (this.lastInputSource === source) {
          this.lastInputSource = 'none';
          this.updateTouchControlsVisibility();
        }
      }, 10000);
    }
  }

  updateTouchControlsVisibility() {
    if (!this.controllerElement) return;

    const shouldShow = this.game.device.touch && 
                     (this.lastInputSource === 'touch' || this.lastInputSource === 'none');

    if (shouldShow !== this.touchControlsVisible) {
      this.controllerElement.style.display = shouldShow ? 'block' : 'none';
      this.touchControlsVisible = shouldShow;
    }
  }

  setupControllerTouchEvents() {
    const controller = this.controllerElement;

    // Prevent default touch behavior
    const preventDefault = (e) => e.preventDefault();
    
    controller.addEventListener('touchstart', preventDefault, { passive: false });
    controller.addEventListener('touchmove', preventDefault, { passive: false });
    controller.addEventListener('touchend', preventDefault, { passive: false });
    controller.addEventListener('touchcancel', preventDefault, { passive: false });

    // Handle touch events
    controller.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    controller.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    controller.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    controller.addEventListener('touchcancel', (e) => this.handleTouchEnd(e));
  }

  handleTouchStart(e) {
    const touches = e.changedTouches;

    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      
      if (this.activeTouches.size >= this.maxTouches) continue;

      const buttonKey = this.getButtonFromTouch(touch);
      
      
      if (buttonKey) {
        this.activeTouches.set(touch.identifier, buttonKey);
        this.held[buttonKey.replace('rhythm_', '')] = true;
        this.detectInputSource('touch');
        
        const element = this.dpadElements[buttonKey] || this.buttonElements[buttonKey];
        if (element) {
          element.classList.add('btnPressed');
        }
      }
    }
  }

  handleTouchMove(e) {
    const touches = e.changedTouches;

    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const currentButtonKey = this.activeTouches.get(touch.identifier);
      
      if (currentButtonKey !== undefined) {
        const newButtonKey = this.getButtonFromTouch(touch);
        
        if (newButtonKey && newButtonKey !== currentButtonKey) {
          // Switch to new button
          this.held[currentButtonKey.replace('rhythm_', '')] = false;
          this.held[newButtonKey.replace('rhythm_', '')] = true;
          
          const oldElement = this.dpadElements[currentButtonKey] || this.buttonElements[currentButtonKey];
          const newElement = this.dpadElements[newButtonKey] || this.buttonElements[newButtonKey];
          
          if (oldElement) oldElement.classList.remove('btnPressed');
          if (newElement) newElement.classList.add('btnPressed');
          
          this.activeTouches.set(touch.identifier, newButtonKey);
        } else if (!newButtonKey) {
          // Moved away from buttons
          this.held[currentButtonKey.replace('rhythm_', '')] = false;
          const element = this.dpadElements[currentButtonKey] || this.buttonElements[currentButtonKey];
          if (element) element.classList.remove('btnPressed');
        }
      }
    }
  }

  handleTouchEnd(e) {
    const touches = e.changedTouches;

    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const buttonKey = this.activeTouches.get(touch.identifier);
      
      if (buttonKey !== undefined) {
        this.held[buttonKey.replace('rhythm_', '')] = false;
        
        const element = this.dpadElements[buttonKey] || this.buttonElements[buttonKey];
        if (element) element.classList.remove('btnPressed');
        
        this.activeTouches.delete(touch.identifier);
      }
    }
  }

  getButtonFromTouch(touch) {
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return null;

    const buttonElement = element.closest('[id^="controller_"]');
    if (!buttonElement) return null;

    const id = buttonElement.id;
    const key = id.replace('controller_', '');
    
    return this.keys.includes(key) || key.startsWith('rhythm_') ? key : null;
  }

  update() {
    if (this.dontUpdateThisTime) {
      delete this.dontUpdateThisTime;
      return;
    }
    
    // Calculate pressed and released states
    this.updateButtonStates();
    
    // Dispatch signals for any pressed/released keys
    let anyPressed = null;
    let anyReleased = null;
    
    this.keys.forEach(key => {
      if (this.pressed[key]) {
        this.signals.pressed[key].dispatch();
        anyPressed = key;
      }
      if (this.released[key]) {
        this.signals.released[key].dispatch();
        anyReleased = key;
      }
    });
    
    // Dispatch 'any' signals
    if (anyPressed) this.signals.pressed.any.dispatch(anyPressed);
    if (anyReleased) this.signals.released.any.dispatch(anyReleased);
    
    // Save current state for next frame
    this.keys.forEach(key => {
      this.prevState[key] = this.held[key];
    });
    this.prevState.any = this.held.any;
  }

  isTouchControlled(key) {
    return Array.from(this.activeTouches.values()).includes(key);
  }

  updateButtonStates() {
    // Calculate pressed/released for individual keys
    let anyPressed = false;
    let anyReleased = false;
    let anyHeld = false;

    this.keys.forEach(key => {
      this.pressed[key] = this.held[key] && !this.prevState[key];
      this.released[key] = !this.held[key] && this.prevState[key];
      
      if (this.pressed[key]) anyPressed = true;
      if (this.released[key]) anyReleased = true;
      if (this.held[key]) anyHeld = true;
    });

    // Update 'any' states
    this.pressed.any = anyPressed;
    this.released.any = anyReleased;
    this.held.any = anyHeld;
  }
  
  releaseAll() {
    this.keys.forEach(key => {
      this.held[key] = false;
      this.pressed[key] = false;
      this.released[key] = false;
    });
    this.held.any = false;
    this.pressed.any = false;
    this.released.any = false;
  }
  
  press(key) {
    this.dontUpdateThisTime = true;
    this.pressed[key] = true;
    this.pressed.any = true;
    this.held[key] = true;
    this.held.any = true;
  }

  isDirectionPressed() {
    return this.held.up || this.held.down || this.held.left || this.held.right;
  }

  getDirection() {
    let x = 0, y = 0;

    if (this.held.left) x -= 1;
    if (this.held.right) x += 1;
    if (this.held.up) y -= 1;
    if (this.held.down) y += 1;

    if (x !== 0 && y !== 0) {
      x *= 0.7071;
      y *= 0.7071;
    }

    return { x, y };
  }
  
  vibrate(duration = 100) {
    // Do not vibrate if the last input source was keyboard
    if (this.lastInputSource === 'keyboard') {
      return false;
    }
  
    let vibrationExecuted = false;
  
    // Vibrate according to the last input source detected
    switch (this.lastInputSource) {
      case 'touch':
        // Only vibrate on cordova for touch screen
        if (CURRENT_ENVIRONMENT === ENVIRONMENT.CORDOVA && typeof navigator.vibrate === "function") {
          navigator.vibrate(duration);
          vibrationExecuted = true;
        }
        break;
  
      case 'gamepad':
        // Vibrate HTML5 gamepads if available and support vibration
        if (navigator.getGamepads && this.game.input.gamepad.supported) {
          const gamepads = navigator.getGamepads();
          
          for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (gamepad && 
                gamepad.connected && 
                gamepad.vibrationActuator && 
                typeof gamepad.vibrationActuator.playEffect === 'function') {
              
              try {
                gamepad.vibrationActuator.playEffect("dual-rumble", {
                  startDelay: 0,
                  duration: duration,
                  weakMagnitude: 0.8,
                  strongMagnitude: 0.8
                });
                vibrationExecuted = true;
                break; // Vibrate only the first pad found
              } catch (error) {
                console.warn(`Error al vibrar mando ${i}:`, error);
              }
            }
          }
        }
        break;
  
      case 'none':
      default:
        // For 'none' or unknown input source, try both methods
        if (CURRENT_ENVIRONMENT === ENVIRONMENT.CORDOVA && typeof navigator.vibrate === "function") {
          navigator.vibrate(duration);
          vibrationExecuted = true;
        } else if (navigator.getGamepads && this.game.input.gamepad.supported) {
          // Try to vibrate gamepads if any are connected
          const gamepads = navigator.getGamepads();
          
          for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (gamepad && 
                gamepad.connected && 
                gamepad.vibrationActuator && 
                typeof gamepad.vibrationActuator.playEffect === 'function') {
              
              try {
                gamepad.vibrationActuator.playEffect("dual-rumble", {
                  startDelay: 0,
                  duration: duration,
                  weakMagnitude: 0.8,
                  strongMagnitude: 0.8
                });
                vibrationExecuted = true;
                break; // Vibrate only the first pad found
              } catch (error) {
                console.warn(`Error al vibrar mando ${i}:`, error);
              }
            }
          }
        }
        break;
    }
  
    return vibrationExecuted;
  }

  reset() {
    this.releaseAll();
    this.activeTouches.clear();

    // Remove pressed classes from all buttons
    Object.values(this.dpadElements).forEach(el => el?.classList.remove('btnPressed'));
    Object.values(this.buttonElements).forEach(el => el?.classList.remove('btnPressed'));
  }
  
  destroy() {
    // Clean up everything
    if (this.inputDetectionTimeout) {
      clearTimeout(this.inputDetectionTimeout);
    }

    // Keyboard cleanup
    if (this.keyboardKeys) {
      Object.values(this.keyboardKeys).forEach(keys => {
        keys.forEach(key => {
          key.onDown.removeAll();
          key.onUp.removeAll();
        });
      });
    }

    // Gamepad cleanup
    if (this.game.input.gamepad) {
      this.game.input.gamepad.onConnectCallback = null;
      this.game.input.gamepad.onDisconnectCallback = null;
    }

    // Signal cleanup
    if (this.signals) {
      Object.values(this.signals.pressed).forEach(signal => signal?.removeAll());
      Object.values(this.signals.released).forEach(signal => signal?.removeAll());
    }

    // Touch cleanup
    if (this.controllerElement) {
      this.controllerElement.remove();
    }

    this.activeTouches?.clear();
  }
}

class ScreenRecorder {
  constructor(game) {
    this.game = game;
    this.mediaRecorder = null;
    this.recordedBlobs = [];
    this.isRecording = false;
    this.stream = null;
    this.videoBitsPerSecond = 1100000;
    this.videoFrameRate = 25;
    this.scale = 1; // Scale factor for videos TODO: rename it to videoScale
    this.imageScale = 7;

    this.canvas = game.canvas;  // Phaser CE game canvas element

    // Check if canvas.captureStream is supported
    if (!this.canvas.captureStream) {
      console.error('Canvas captureStream is not supported in this browser');
      return;
    }
  }

  async start(audioElement = null, audioDelay = 0) {
    if (this.isRecording) {
      console.warn('Already recording');
      return;
    }

    if (!this.canvas.captureStream) {
      console.error('Screen recording not supported in this browser');
      return;
    }

    try {
      // Create a scaled canvas for high-resolution recording
      this.scaledCanvas = document.createElement('canvas');
      this.scaledCanvas.width = this.canvas.width * this.scale;
      this.scaledCanvas.height = this.canvas.height * this.scale;
      this.scaledContext = this.scaledCanvas.getContext('2d');
      
      // Set scaling quality
      this.scaledContext.imageSmoothingEnabled = false;
      this.scaledContext.webkitImageSmoothingEnabled = false;
      this.scaledContext.mozImageSmoothingEnabled = false;

      // Capture scaled canvas stream
      this.stream = this.scaledCanvas.captureStream(this.videoFrameRate);

      // Add audio to stream BEFORE starting the recorder
      if (audioElement) {
        await this.addAudioToStream(audioElement, audioDelay);
      }

      let options = {
        mimeType: 'video/webm; codecs=vp9',
        videoBitsPerSecond: this.videoBitsPerSecond
      };

      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = {
          mimeType: 'video/webm; codecs=vp8',
          videoBitsPerSecond: this.videoBitsPerSecond
        };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = {
            mimeType: 'video/webm',
            videoBitsPerSecond: this.videoBitsPerSecond
          };
        }
      }

      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.recordedBlobs = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedBlobs.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.save();
        this.cleanup();
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        this.isRecording = false;
        this.cleanup();
      };

      // Start recording with timeslice for better memory management
      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;
      
      // Start rendering loop for scaled recording
      this.startRenderingLoop();
      
      console.log(`Started recording with MIME type: ${options.mimeType}, audio delay: ${audioDelay}ms`);

    } catch (e) {
      console.error('MediaRecorder init failed:', e);
      this.cleanup();
    }
  }

  startRenderingLoop() {
    const renderFrame = () => {
      if (this.isRecording && this.scaledCanvas && this.scaledContext) {
        // Fill with solid black background first to avoid transparent holes
        this.scaledContext.fillStyle = '#000000';
        this.scaledContext.fillRect(0, 0, this.scaledCanvas.width, this.scaledCanvas.height);
        
        // Draw scaled version of the game canvas
        this.scaledContext.drawImage(
          this.canvas,
          0, 0, this.canvas.width, this.canvas.height,
          0, 0, this.scaledCanvas.width, this.scaledCanvas.height
        );
        
        // Continue the loop
        requestAnimationFrame(renderFrame);
      }
    };
    
    // Start the rendering loop
    renderFrame();
  }

  stop() {
    if (!this.isRecording || !this.mediaRecorder) {
      console.warn('Not recording');
      return;
    }

    try {
      this.mediaRecorder.stop();
      this.isRecording = false;
      console.log('Stopped recording');
    } catch (e) {
      console.error('Error stopping recorder:', e);
      this.cleanup();
    }
  }

  pause() {
    if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      console.log('Recording paused');
    }
  }

  resume() {
    if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      console.log('Recording resumed');
    }
  }
  
  screenshot() {
    // Create a scaled canvas for high-resolution screenshot
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = this.game.width * this.imageScale
    scaledCanvas.height = this.game.height * this.imageScale;
    const scaledContext = scaledCanvas.getContext('2d');
    
    // Set scaling quality
    scaledContext.imageSmoothingEnabled = false;
    scaledContext.webkitImageSmoothingEnabled = false;
    scaledContext.mozImageSmoothingEnabled = false;
    
    // Fill with solid black background first
    scaledContext.fillStyle = '#000000';
    scaledContext.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
    
    // Create a temporary render texture at original size
    const renderTexture = this.game.add.renderTexture(this.game.width, this.game.height, 'screenshotTemp');
    renderTexture.renderXY(this.game.world, 0, 0, true);
    
    // Get the image and draw it scaled
    const tempCanvas = renderTexture.getCanvas();
    
    // Draw the scaled version
    scaledContext.drawImage(
      tempCanvas,
      0, 0, this.game.width, this.game.height,
      0, 0, scaledCanvas.width, scaledCanvas.height
    );
    
    // Convert to blob and save
    scaledCanvas.toBlob(async (blob) => {
      const filename = `screenshot-${Date.now()}.png`;
      await this.saveFile(filename, blob);
      console.log('Screenshot saved:', filename);
    }, 'image/png');
    
    // Clean up
    renderTexture.destroy();
  }

  async save(filename) {
    if (this.recordedBlobs.length === 0) {
      console.warn('No recording data available');
      return;
    }

    const blob = new Blob(this.recordedBlobs, { type: 'video/webm' });
    
    if (!filename) filename = `recording_${Date.now()}.webm`;
    
    await this.saveFile(filename, blob);

    console.log('Recording saved as:', filename);
  }
  
  async saveFile(filename, blob) {
    if (CURRENT_ENVIRONMENT === ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT === ENVIRONMENT.NWJS) {
      const fileSystem = new FileSystemTools();
      
      // Make sure SCREENSHOTS_DIRECTORY is defined, or use a default
      const screenshotsDir = typeof SCREENSHOTS_DIRECTORY !== 'undefined' ? SCREENSHOTS_DIRECTORY : 'Screenshots';
      const directory = await fileSystem.getDirectory(EXTERNAL_DIRECTORY + screenshotsDir);
      
      await fileSystem.saveFile(directory, blob, filename);
    } else {
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
  
      document.body.appendChild(a);
      a.click();
  
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    }
  }

  // Add audio to the stream
  async addAudioToStream(audioElement = null, audioDelay = 0) {
    try {
      if (audioElement && audioElement.src) {
        // Apply audio delay if specified
        if (audioDelay > 0) {
          console.log(`Applying audio delay: ${audioDelay}ms`);
          
          // Create a delay by setting currentTime back
          if (audioElement.currentTime > 0) {
            audioElement.currentTime = Math.max(0, audioElement.currentTime - (audioDelay / 1000));
          }
          
          // Wait for the delay period
          await new Promise(resolve => setTimeout(resolve, audioDelay));
        }
        
        // Ensure audio element is playing and has a valid source
        if (audioElement.paused) {
          console.warn('Audio element is paused, attempting to play it');
          try {
            await audioElement.play();
          } catch (playError) {
            console.warn('Could not play audio element:', playError);
          }
        }
        
        // Check if captureStream is supported for this audio element
        if (audioElement.captureStream) {
          const audioStream = audioElement.captureStream();
          
          // Wait a bit for the stream to initialize
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (audioStream && audioStream.getAudioTracks().length > 0) {
            audioStream.getAudioTracks().forEach(track => {
              console.log('Adding audio track:', track);
              this.stream.addTrack(track);
            });
            console.log('Game audio added to recording');
            return true;
          } else {
            console.warn('Audio stream has no audio tracks');
          }
        } else {
          console.warn('Audio element does not support captureStream');
        }
      }
      
      // Fall back to user microphone if audio element failed or not provided
      console.log('Falling back to microphone audio');
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.getAudioTracks().forEach(track => {
        this.stream.addTrack(track);
      });
      console.log('Microphone audio added to recording');
      return true;
      
    } catch (e) {
      console.warn('Could not add audio to recording:', e);
      return false;
    }
  }

  // Method to add audio after recording has started (experimental)
  async addAudioAfterStart(audioElement = null, audioDelay = 0) {
    if (!this.isRecording || !this.mediaRecorder) {
      console.warn('Cannot add audio - recording not started');
      return false;
    }
    
    // Pause recording to modify the stream
    this.mediaRecorder.pause();
    
    try {
      const success = await this.addAudioToStream(audioElement, audioDelay);
      
      // Resume recording
      this.mediaRecorder.resume();
      
      return success;
    } catch (e) {
      console.error('Error adding audio after start:', e);
      this.mediaRecorder.resume(); // Always resume even if audio fails
      return false;
    }
  }

  cleanup() {
    // Stop the rendering loop
    this.isRecording = false;
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    // Clean up scaled canvas
    if (this.scaledCanvas) {
      this.scaledCanvas = null;
      this.scaledContext = null;
    }
    
    this.mediaRecorder = null;
  }

  // Check if recording is supported
  static isSupported() {
    return !!(HTMLCanvasElement.prototype.captureStream && window.MediaRecorder);
  }

  // Get recording state
  getState() {
    return this.mediaRecorder ? this.mediaRecorder.state : 'inactive';
  }
  
  // Method to change scale factor
  setScale(newScale) {
    this.scale = newScale;
    console.log(`Scale factor set to: ${this.scale}`);
  }
  
  // Method to get current scale factor
  getScale() {
    return this.scale;
  }
}

class Metronome {
  constructor(scene) {
    this.scene = scene;
    this.player = scene.player;
    this.mode = Account.settings.metronome;
    this.enabled = this.mode !== 'OFF';
    this.beatDivisions = {
      'OFF': 0,
      'Quarters': 1,       // Every whole beat (1, 2, 3, 4...)
      'Eighths': 2,        // Every half beat (1, 1.5, 2, 2.5...)
      'Sixteenths': 4,     // Every quarter beat (1, 1.25, 1.5, 1.75...)
      'Thirty-seconds': 8, // Every eighth beat (1, 1.125, 1.25, 1.375...)
      'Note': 'Note'       // Special mode - plays when notes reach their beat time
    };
    
    this.lastDivisionValue = -1;
    this.currentDivision = this.beatDivisions[this.mode];
    
    // For NOTE mode
    this.noteIndex = 0; // Current note index to check
    this.lastNoteBeat = -1; // Last note beat that triggered a tick
    this.notes = []; // Array of unique note beats
    
    // Bind the toggle method to the scene
    this.scene.onSelectPressed = this.toggle.bind(this);
  }

  update() {
    if (!this.enabled) return;
    
    if (this.mode === 'Note') {
      this.updateNoteMode();
    } else {
      this.updateBeatMode();
    }
  }
  
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

  getCurrentDivisionValue(beat) {
    if (this.currentDivision === 0) return -1;
    
    // Calculate the current division value
    return Math.floor(beat * this.currentDivision);
  }

  playTick() {
    Audio.play('assist_tick');
  }

  toggle() {
    if (this.mode == 'OFF') return;
    
    this.enabled = !this.enabled;
    this.lastDivisionValue = -1; // Reset to ensure tick plays on next division
    this.resetNoteMode(); // Reset note mode state
  }

  resetNoteMode() {
    this.noteIndex = 0;
    this.lastNoteBeat = -1;
    this.notes = [];
  }

  setMode(mode) {
    if (this.beatDivisions.hasOwnProperty(mode)) {
      this.mode = mode;
      this.currentDivision = this.beatDivisions[mode];
      this.lastDivisionValue = -1; // Reset division tracking
      this.resetNoteMode(); // Reset note mode state
      
      // Update enabled state based on mode
      this.enabled = mode !== 'OFF';
      
      // Update account settings
      Account.settings.metronome = mode;
      saveAccount();
    }
  }

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

class BackgroundMusic {
  constructor() {
    this.audio = document.createElement("audio");
    this.audio.volume = [0,25,50,75,100][Account.settings.volume] / 100;
    this.randomSong = Account.settings.randomSong;
    this.audio.loop = true;
    this.isPlaying = false;
    this.currentSong = null;
    this.availableSongsCache = null; // Cache for available songs
    this.cacheTimestamp = 0;
    this.cacheDuration = 30000; // Cache for 30 seconds
    this.registerVisibilityChangeListener();
  }
  
  registerVisibilityChangeListener() {
    this.visibilityChangeListener = () => {
      if (document.hidden) {
        this.audio.pause();
      } else {
        this.audio.play();
      }
    };
    
    window.addEventListener('visibilitychange', this.visibilityChangeListener);
  }

  async playLastSong() {
    if (this.isPlaying || !Account.settings.enableMenuMusic) return;
    
    if (this.randomSong || !Account.lastSong) {
      this.playRandomSong();
      return;
    }
    
    const lastSong = Account.lastSong;
    
    if (lastSong.isExternal) {
      try {
        await this.checkUrlAccessible(lastSong.url);
        this.playSong(lastSong);
      } catch (error) {
        console.warn("Last external song not accessible, falling back to random song:", error);
        this.playRandomSong();
      }
    } else {
      this.playSong(lastSong);
    }
  }

  playRandomSong() {
    // Get cached available songs (fast)
    const allSongs = this.getCachedAvailableSongs();
    
    if (allSongs.length === 0) {
      return;
    }
    
    const randomSong = game.rnd.pick(allSongs);
    const songData = {
      url: randomSong.audioUrl,
      title: randomSong.title || randomSong.chart?.title || "Unknown",
      artist: randomSong.artist || randomSong.chart?.artist || "Unknown",
      sampleStart: randomSong.sampleStart || randomSong.chart?.sampleStart || 0,
      isExternal: randomSong.files !== undefined || randomSong.chart?.files !== undefined
    };
    
    this.playSong(songData);
  }

  getCachedAvailableSongs() {
    const now = Date.now();
    
    // Return cached songs if they're still fresh
    if (this.availableSongsCache && now - this.cacheTimestamp < this.cacheDuration) {
      return this.availableSongsCache;
    }
    
    // Otherwise, build the cache (fast version without URL checking)
    this.availableSongsCache = this.getAllAvailableSongsFast();
    this.cacheTimestamp = now;
    
    return this.availableSongsCache;
  }

  getAllAvailableSongsFast() {
    const allSongs = [];
    const seenUrls = new Set();
    
    // Add local songs (always accessible)
    if (window.localSongs && window.localSongs.length > 0) {
      for (const song of window.localSongs) {
        if (song.audioUrl && this.isValidAudioUrl(song.audioUrl)) {
          if (!seenUrls.has(song.audioUrl)) {
            seenUrls.add(song.audioUrl);
            allSongs.push(song);
          }
        }
      }
    }
    
    // Add external songs (don't check accessibility - we'll handle failures during playback)
    if (window.externalSongs && window.externalSongs.length > 0) {
      for (const song of window.externalSongs) {
        if (song.audioUrl && this.isValidAudioUrl(song.audioUrl)) {
          if (!seenUrls.has(song.audioUrl)) {
            seenUrls.add(song.audioUrl);
            allSongs.push(song);
          }
        }
      }
    }
    
    // Add current state songs
    const currentState = game.state.getCurrentState();
    if (currentState && currentState.songs && Array.isArray(currentState.songs)) {
      for (const song of currentState.songs) {
        if (song.audioUrl && this.isValidAudioUrl(song.audioUrl)) {
          if (!seenUrls.has(song.audioUrl)) {
            seenUrls.add(song.audioUrl);
            allSongs.push(song);
          }
        }
      }
    }
    
    return allSongs;
  }

  isValidAudioUrl(url) {
    // Fast URL validation - exclude obviously invalid URLs
    if (!url) return false;
    if (typeof url !== 'string') return false;
    if (url.includes("assets/no-")) return false;
    if (url === "undefined" || url === "null") return false;
    if (url.trim().length === 0) return false;
    return true;
  }

  async checkUrlAccessible(url) {
    return new Promise((resolve, reject) => {
      if (!url) {
        reject();
        return
      }
      
      if (url.startsWith('blob:')) {
        resolve();
        return;
      }
      
      const audio = document.createElement("audio");
      audio.preload = 'metadata';
      
      audio.onloadedmetadata = () => {
        audio.remove();
        resolve();
      };
      
      audio.onerror = () => {
        audio.remove();
        reject(new Error('Audio load failed'));
      };
      
      // Force quick timeout
      setTimeout(() => {
        audio.remove();
        reject(new Error('Audio load timeout'));
      }, 800);
      
      audio.src = url;
    });
  }

  playSong(songData) {
    // Stop current audio if playing
    this.audio.pause();
    this.audio.currentTime = 0;
    
    this.audio.src = songData.url;
    this.audio.currentTime = songData.sampleStart || 0;
    
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.currentSong = songData;
      if (notifications) {
        const displayText = `${songData.title} - ${songData.artist}`;
        //notifications.show(`NOW PLAYING: \n ${displayText}`, 3000);
      }
    }).catch(error => {
      console.warn(`Failed to play background music: ${songData.title}`, error);
      
      // Remove the failed song from cache to avoid picking it again
      this.removeSongFromCache(songData.url);
      
      // Try another random song if this one fails
      setTimeout(() => {
        this.playRandomSong();
      }, 100);
    });
  }

  removeSongFromCache(failedUrl) {
    if (this.availableSongsCache) {
      this.availableSongsCache = this.availableSongsCache.filter(
        song => song.audioUrl !== failedUrl
      );
    }
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
    this.currentSong = null;
  }

  setVolume(volume) {
    this.audio.volume = [0,25,50,75,100][volume] / 100;
  }

  // Method to manually refresh the cache
  refreshCache() {
    this.availableSongsCache = null;
    this.cacheTimestamp = 0;
  }

  destroy() {
    this.stop();
    this.audio.src = "";
    this.audio = null;
    window.removeEventListener("visibilitychange", this.visibilityChangeListener);
    this.availableSongsCache = null;
  }
}

class Visualizer {
  constructor(scene, x, y, width, height) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.graphics = scene.add.graphics(x, y);
    this.active = true;
  }

  update() {
    // To be implemented by subclasses
  }

  destroy() {
    this.graphics.destroy();
  }

  clear() {
    this.graphics.clear();
  }
}

class AccuracyVisualizer extends Visualizer {
  constructor(scene, x, y, width, height) {
    super(scene, x, y, width, height);
    this.accuracyHistory = [];
    this.maxHistoryLength = this.width / 4;
  }

  update() {
    if (!this.active || !this.scene.player) return;

    this.clear();
    
    this.accuracyHistory = this.scene.player.timingStory;
    
    // Keep only recent history
    if (this.accuracyHistory.length > this.maxHistoryLength) {
      this.accuracyHistory.shift();
    }
    
    // Draw 0 line
    this.graphics.lineStyle(1, 0xF0F0F0, 0.3);
    this.graphics.moveTo(0, 3);
    this.graphics.lineTo(this.width, 3);
      
    // Draw accuracy line
    if (this.accuracyHistory.length > 1) {
      this.graphics.lineStyle(1, 0x00FF00, 1);
      this.graphics.moveTo(0, 3);

      for (let i = 0; i < this.accuracyHistory.length; i++) {
        const x = (i / this.maxHistoryLength) * this.width;
        const accuracy = this.accuracyHistory[i];
        const y = 2 + (accuracy / 0.4) * 3;
        
        this.graphics.lineTo(x, y);
      }
    }
  }
}

class AudioVisualizer extends Visualizer {
  constructor(scene, x, y, width, height) {
    super(scene, x, y, width, height);
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.bufferLength = 32;
    this.bars = [];
    this.setupAudioAnalysis();
  }

  setupAudioAnalysis() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.maxDecibels = -10;
      this.analyser.smoothingTimeConstant = 0.1;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);

      // Connect to game audio if available
      if (this.scene.audio) {
        const source = this.audioContext.createMediaElementSource(this.scene.audio);
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      }
    } catch (error) {
      console.warn('Audio visualizer not supported:', error);
      this.active = false;
    }
  }

  update() {
    if (!this.active || !this.analyser) return;

    this.clear();
    
    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Draw bars
    const barWidth = (this.width / this.bufferLength) * 2;
    let x = 0;
    
    for (let i = 0; i < this.bufferLength / 2; i++) {
      const barHeight = (this.dataArray[i] / 255) * this.height;
      
      if (barHeight > 0) {
        this.graphics.lineStyle(barWidth - 1, 0x0000FF, 0.9);
        this.graphics.moveTo(x, this.height - 1);
        this.graphics.lineTo(x, this.height - barHeight);
      }

      x += barWidth;
    }
  }

  destroy() {
    super.destroy();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

class BPMVisualizer extends Visualizer {
  constructor(scene, x, y, width, height) {
    super(scene, x, y, width, height);
    this.bpmChanges = scene.song?.chart?.bpmChanges || [];
    this.stops = scene.song?.chart?.stops || [];
    this.text = new Text(width - 1, 1, "");
    this.text.anchor.x = 1;
    this.text.alpha = 0.5;
    this.graphics.addChild(this.text);
    this.beatIndicatorAlpha = 1;
    this.currentBeat = 0;
    this.currentBeatInt = 0;
    this.previusBeatInt = 1;
    this.currentBpm = 0;
    this.previusBpm = 1;
  }

  update() {
    if (!this.active) return;
    
    this.clear();
    
    const currentTime = this.scene.getCurrentTime();
    this.currentBeat = currentTime.beat;
    
    this.currentBeatInt = Math.floor(this.currentBeat);
    
    if (this.currentBeatInt != this.previusBeatInt) this.beatIndicatorAlpha = 1;
    
    this.previusBeatInt = this.currentBeatInt;
    
    this.currentBpm = this.getLastBpm();
    
    if (this.currentBpm != this.previusBpm) {
      this.text.write(`${parseFloat(this.currentBpm.toFixed(3))}`);
      this.text.alpha = 1;
      game.add.tween(this.text).to({ alpha: 0.5 }, 100, "Linear", true);
    }
    
    this.text.tint = this.getLastStop() && this.getLastStop().beat == this.currentBeat ? 0xFF0000 : 0xFFFFFF;
    
    this.previusBpm = this.currentBpm;
    
    // Draw BPM changes
    const maxBeat = Math.max(...this.bpmChanges.map(b => b.beat), this.currentBeat + 50);
    const beatsToShow = 8; 

    this.bpmChanges.forEach(bpmChange => {
      const x = ((bpmChange.beat - this.currentBeat) / beatsToShow) * this.width;
      if (x >= 0 && x <= this.width) {
        // BPM change marker
        this.graphics.beginFill(0xFFFF00, 0.8);
        this.graphics.drawRect(x - 1, 0, 1, this.height);
        this.graphics.endFill();
      }
    });

    // Draw stops
    this.stops.forEach(stop => {
      const x = ((stop.beat - this.currentBeat) / beatsToShow) * this.width;
      if (x >= 0 && x <= this.width) {
        // Stop marker
        this.graphics.beginFill(0xFF0000, 0.8);
        this.graphics.drawRect(x - 1, 0, 1, this.height);
        this.graphics.endFill();
      }
    });
    
    // Draw beat indicator
    this.graphics.beginFill(0x00FF00, this.beatIndicatorAlpha);
    this.graphics.drawCircle(3, 3, 4);
    this.graphics.endFill();
    
    let speed = (Math.min(250, this.currentBpm) / 250) * 0.5;
    
    this.beatIndicatorAlpha -= speed;
  }
  
  getLastBpm() {
    return this.bpmChanges.length ? this.bpmChanges.find((e, i, a) => i + 1 == a.length || a[i + 1].beat >= this.currentBeat).bpm : 0;
  }
  
  getLastStop() {
    return this.stops.length ? this.stops.find((e, i, a) => i + 1 == a.length || a[i + 1].beat >= this.currentBeat) : null;
  }

  destroy() {
    super.destroy();
    this.text.destroy();
  }
}

class FullScreenAudioVisualizer {
  constructor(audioElement, options = {}) {
    this.audioElement = audioElement;
    this.options = {
      barColor: 0x76fcde,
      barWidth: 4,
      barSpacing: 2,
      barBaseHeight: 10,
      barMaxHeight: 80,
      smoothing: 0.8,
      alpha: 1,
      fftSize: 256,
      visualizationType: 'circular', // 'bars', 'waveform', 'circular', 'symmetrical'
      ...options
    };
    
    this.graphics = game.add.graphics(0, 0);
    this.analyser = null;
    this.dataArray = null;
    this.bufferLength = 0;
    this.frequencyData = null;
    this.isActive = false;
    
    this.setupAudioAnalysis();
  }

  setupAudioAnalysis() {
    try {
      // Create audio context if not already created
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.options.fftSize;
      this.analyser.smoothingTimeConstant = this.options.smoothing;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;
      
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      this.frequencyData = new Uint8Array(this.bufferLength);
      
      // Connect audio element to analyser
      if (this.audioElement) {
        this.connectAudioSource();
      }
      
      this.isActive = true;
      
    } catch (error) {
      console.warn('FullScreenAudioVisualizer: Audio analysis not supported:', error);
      this.isActive = false;
    }
  }

  connectAudioSource() {
    if (!this.audioElement || !this.analyser) return;
    
    try {
      // Disconnect existing source if any
      if (this.source) {
        this.source.disconnect();
      }
      
      // Create new source and connect
      this.source = this.audioContext.createMediaElementSource(this.audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
    } catch (error) {
      console.warn('FullScreenAudioVisualizer: Could not connect audio source:', error);
    }
  }

  setAudioSource(audioElement) {
    this.audioElement = audioElement;
    if (this.isActive) {
      this.connectAudioSource();
    }
  }

  update() {
    if (!this.isActive || !this.analyser) return;
    
    this.graphics.clear();
    this.graphics.alpha = this.options.alpha;
    
    // Get frequency data for all visualization types
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Apply smoothing - only process first half of buffer (the meaningful frequencies)
    const meaningfulLength = Math.floor(this.bufferLength / 2);
    
    if (!this.frequencyData) {
      this.frequencyData = new Uint8Array(this.dataArray);
    } else {
      for (let i = 0; i < meaningfulLength; i++) {
        this.frequencyData[i] = Math.max(
          this.frequencyData[i] * this.options.smoothing,
          this.dataArray[i]
        );
      }
      // Ignore second half (usually zeros with MP3 files)
      for (let i = meaningfulLength; i < this.bufferLength; i++) {
        this.frequencyData[i] = 0;
      }
    }
    
    // Handle different visualization types
    switch (this.options.visualizationType) {
      case 'bars':
        this.drawBars();
        break;
      case 'waveform':
        this.drawWaveform();
        break;
      case 'circular':
        this.drawCircularVisualizer();
        break;
      case 'symmetrical':
        this.drawSymmetricalBars();
        break;
      default:
        this.drawBars(); // Default fallback
    }
  }

  // Bars visualization implementation
  drawBars() {
    const totalBars = Math.floor(game.width / (this.options.barWidth + this.options.barSpacing));
    const startX = (game.width - (totalBars * (this.options.barWidth + this.options.barSpacing))) / 2;
    const meaningfulLength = Math.floor(this.bufferLength / 2);
    
    for (let i = 0; i < totalBars; i++) {
      // Map to first half of frequency data only
      const dataIndex = Math.floor((i / totalBars) * meaningfulLength);
      
      if (dataIndex >= meaningfulLength) continue;
      
      const frequencyValue = this.frequencyData[dataIndex] || 0;
      const normalizedValue = frequencyValue / 255;
      const barHeight = this.options.barBaseHeight + (normalizedValue * this.options.barMaxHeight);
      
      const x = startX + i * (this.options.barWidth + this.options.barSpacing);
      const y = game.height - barHeight;
      
      this.drawBar(x, y, this.options.barWidth, barHeight, normalizedValue);
    }
  }

  // Symmetrical bars visualization (mirrored from center)
  drawSymmetricalBars() {
    const totalBars = Math.floor(game.width / (this.options.barWidth + this.options.barSpacing));
    const barsPerSide = Math.floor(totalBars / 2);
    const centerX = game.width / 2;
    const meaningfulLength = Math.floor(this.bufferLength / 2);
    
    for (let i = 0; i < barsPerSide; i++) {
      // Map to first half of frequency data only
      const dataIndex = Math.floor((i / barsPerSide) * meaningfulLength);
      
      if (dataIndex >= meaningfulLength) continue;
      
      const frequencyValue = this.frequencyData[dataIndex] || 0;
      const normalizedValue = frequencyValue / 255;
      const barHeight = this.options.barBaseHeight + (normalizedValue * this.options.barMaxHeight);
      
      // Right side bar
      const rightX = centerX + i * (this.options.barWidth + this.options.barSpacing);
      const rightY = game.height - barHeight;
      this.drawBar(rightX, rightY, this.options.barWidth, barHeight, normalizedValue);
      
      // Left side bar (mirrored)
      const leftX = centerX - (i + 1) * (this.options.barWidth + this.options.barSpacing);
      const leftY = game.height - barHeight;
      this.drawBar(leftX, leftY, this.options.barWidth, barHeight, normalizedValue);
    }
  }

  // Waveform visualization implementation
  drawWaveform() {
    const waveformData = new Uint8Array(this.bufferLength);
    this.analyser.getByteTimeDomainData(waveformData);
    
    this.graphics.lineStyle(2, this.options.barColor, 0.8);
    
    const sliceWidth = game.width / this.bufferLength;
    let x = 0;
    
    for (let i = 0; i < this.bufferLength; i++) {
      const v = waveformData[i] / 128.0;
      const y = (v * game.height) / 2;
      
      if (i === 0) {
        this.graphics.moveTo(x, y);
      } else {
        this.graphics.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
  }

  // Circular visualization implementation
  drawCircularVisualizer() {
    const centerX = game.width / 2;
    const centerY = game.height / 2;
    const radius = Math.min(game.width, game.height) * 0.3;
    const meaningfulLength = Math.floor(this.bufferLength / 2);
    
    this.graphics.lineStyle(2, this.options.barColor, 0.8);
    
    for (let i = 0; i < meaningfulLength; i += 2) {
      const value = this.frequencyData[i] / 255;
      const angle = (i / meaningfulLength) * Math.PI * 2;
      const barLength = value * radius * 0.5;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barLength);
      const y2 = centerY + Math.sin(angle) * (radius + barLength);
      
      this.graphics.moveTo(x1, y1);
      this.graphics.lineTo(x2, y2);
    }
  }

  // Individual bar drawing method
  drawBar(x, y, width, height, intensity) {
    const baseColor = this.options.barColor;
    const brightness = 0.3 + (intensity * 0.7);
    
    const r = ((baseColor >> 16) & 0xFF) * brightness;
    const g = ((baseColor >> 8) & 0xFF) * brightness;
    const b = (baseColor & 0xFF) * brightness;
    
    const color = (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
    
    // Draw main bar
    this.graphics.beginFill(color, 0.8);
    this.graphics.drawRect(x, y, width, height);
    this.graphics.endFill();
    
    // Add highlight effect on top
    if (intensity > 0.5) {
      const highlightAlpha = (intensity - 0.5) * 0.4;
      this.graphics.beginFill(0xFFFFFF, highlightAlpha);
      this.graphics.drawRect(x, y, width, Math.max(2, height * 0.1));
      this.graphics.endFill();
    }
  }

  // Method to change visualization type
  setVisualizationType(type) {
    const validTypes = ['bars', 'waveform', 'circular', 'symmetrical'];
    if (validTypes.includes(type)) {
      this.options.visualizationType = type;
    } else {
      console.warn(`Invalid visualization type: ${type}. Using 'bars' instead.`);
      this.options.visualizationType = 'bars';
    }
  }

  setBarColor(color) {
    this.options.barColor = color;
  }

  setAlpha(alpha) {
    this.options.alpha = Phaser.Math.clamp(alpha, 0, 1);
  }

  setOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    
    // Re-apply analyser settings if changed
    if (this.analyser) {
      if (newOptions.fftSize) {
        this.analyser.fftSize = newOptions.fftSize;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.frequencyData = new Uint8Array(this.bufferLength);
      }
      
      if (newOptions.smoothing !== undefined) {
        this.analyser.smoothingTimeConstant = newOptions.smoothing;
      }
    }
    
    // Validate visualization type
    if (newOptions.visualizationType) {
      this.setVisualizationType(newOptions.visualizationType);
    }
  }

  // Get current visualization settings
  getSettings() {
    return { ...this.options };
  }

  // Check if visualizer is ready and active
  isReady() {
    return this.isActive && this.analyser !== null;
  }

  // Pause/Resume functionality
  pause() {
    this.isActive = false;
  }

  resume() {
    this.isActive = true;
  }

  destroy() {
    this.isActive = false;
    
    // Disconnect audio nodes
    if (this.source) {
      this.source.disconnect();
    }
    
    if (this.analyser) {
      this.analyser.disconnect();
    }
    
    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(error => {
        console.warn('Error closing audio context:', error);
      });
    }
    
    // Remove graphics
    if (this.graphics) {
      this.graphics.destroy();
    }
    
    // Clean up references
    this.audioElement = null;
    this.analyser = null;
    this.source = null;
    this.audioContext = null;
    this.dataArray = null;
    this.frequencyData = null;
  }

  // Static method to create visualizer with default settings
  static create(audioElement, options = {}) {
    return new FullScreenAudioVisualizer(audioElement, options);
  }

  // Static method to check if browser supports audio analysis
  static isSupported() {
    return !!(window.AudioContext || window.webkitAudioContext);
  }
}

class SMFile {
  static generateSM(songData) {
    let smContent = "";
    
    // Basic metadata
    smContent += `#TITLE:${songData.title || ""};\n`;
    smContent += `#SUBTITLE:${songData.subtitle || ""};\n`;
    smContent += `#ARTIST:${songData.artist || ""};\n`;
    smContent += `#TITLETRANSLIT:${songData.titleTranslit || ""};\n`;
    smContent += `#SUBTITLETRANSLIT:${songData.subtitleTranslit || ""};\n`;
    smContent += `#ARTISTTRANSLIT:${songData.artistTranslit || ""};\n`;
    smContent += `#GENRE:${songData.genre || ""};\n`;
    smContent += `#CREDIT:${songData.credit || ""};\n`;
    smContent += `#BANNER:${FileTools.getFilename(songData.banner)};\n`;
    smContent += `#BACKGROUND:${FileTools.getFilename(songData.background)};\n`;
    smContent += `#LYRICSPATH:${songData.lyrics || ""};\n`;
    smContent += `#CDTITLE:${FileTools.getFilename(songData.cdtitle)};\n`;
    smContent += `#MUSIC:${FileTools.getFilename(songData.audio)};\n`;
    smContent += `#OFFSET:${(songData.offset || 0).toFixed(6)};\n`;
    smContent += `#SAMPLESTART:${(songData.sampleStart || 0).toFixed(6)};\n`;
    smContent += `#SAMPLELENGTH:${(songData.sampleLength || 10).toFixed(6)};\n`;
    
    // BPM changes
    if (songData.bpmChanges && songData.bpmChanges.length > 0) {
      smContent += `#BPMS:${songData.bpmChanges.map(bpm => `${bpm.beat.toFixed(6)}=${bpm.bpm.toFixed(6)}`).join(",")};\n`;
    } else {
      smContent += `#BPMS:0.000=120.000;\n`;
    }
    
    // Stops
    if (songData.stops && songData.stops.length > 0) {
      smContent += `#STOPS:${songData.stops.map(stop => `${stop.beat.toFixed(6)}=${stop.len.toFixed(6)}`).join(",")};\n`;
    } else {
      smContent += `#STOPS:;\n`;
    }
    
    // BG changes
    if (songData.backgrounds && songData.backgrounds.length > 0) {
      const bgChanges = songData.backgrounds.map(bg => 
        `${bg.beat.toFixed(6)}=${bg.file || ""}=${bg.opacity || 1}=${bg.fadeIn || 0}=${bg.fadeOut || 0}=${bg.effect || 0}`
      ).join(",");
      smContent += `#BGCHANGES:${bgChanges};\n`;
    } else {
      smContent += `#BGCHANGES:;\n`;
    }
    
    // Notes for each difficulty
    if (songData.difficulties && songData.notes) {
      songData.difficulties.forEach(diff => {
        const diffKey = diff.type + diff.rating;
        const notes = songData.notes[diffKey];
        if (notes) {
          smContent += this.generateNotesSection(diff, notes);
        }
      });
    }
    
    return smContent;
  }
  
  static generateNotesSection(difficulty, notes) {
    // First, process freeze notes to add their tail notes
    const processedNotes = this.processFreezeNotes(notes);

    let notesContent = `#NOTES:\n`;
    notesContent += `     dance-single:\n`;
    notesContent += `     :\n`;
    notesContent += `     ${difficulty.type}:\n`;
    notesContent += `     ${difficulty.rating}:\n`;
    notesContent += `     0.000000:\n`;
    
    // Group notes by measure
    const measures = {};
    processedNotes.forEach(note => {
      const measure = Math.floor(note.beat / 4);
      if (!measures[measure]) measures[measure] = [];
      measures[measure].push(note);
    });
    
    // Sort measures
    const measureNumbers = Object.keys(measures).map(Number).sort((a, b) => a - b);
    
    measureNumbers.forEach((measureNum, index) => {
      const measureNotes = measures[measureNum];
      const measureContent = this.convertMeasureToSM(measureNotes, measureNum);
      notesContent += measureContent;
      
      if (index < measureNumbers.length - 1) {
        notesContent += "\n,\n";
      } else {
        notesContent += "\n;\n";
      }
    });
    
    return notesContent;
  }
  
  static processFreezeNotes(notes) {
    const processedNotes = [...notes];
    const freezeTails = [];
    
    // Find freeze starts and create their tails
    notes.forEach((note, index) => {
      if (note.type === "2" || note.type === "4") { // Hold or Roll start
        if (note.beatEnd !== undefined && note.beatLength !== undefined) {
          // Add freeze tail note
          const tailNote = {
            type: "3", // Freeze tail
            beat: note.beatEnd,
            sec: note.secEnd,
            column: note.column
          };
          freezeTails.push(tailNote);
        }
      }
    });
    
    // Add all tails to processed notes
    processedNotes.push(...freezeTails);
    
    // Sort by beat
    processedNotes.sort((a, b) => a.beat - b.beat);
    
    return processedNotes;
  }
  
  static convertMeasureToSM(notes, measureNum) {
    // First, normalize all beat positions to be within [0, 4) range
    const normalizedNotes = notes.map(note => {
      const beatInMeasure = note.beat - (measureNum * 4);
      return {
        ...note,
        beatInMeasure: beatInMeasure
      };
    });
    
    // Find all unique beat positions
    const beatPositions = normalizedNotes.map(n => n.beatInMeasure);
    
    // Calculate the required resolution (subdivisions per beat)
    // First, convert all positions to fractions with a common denominator
    const allFractions = [];
    const positionsSet = new Set();
    
    beatPositions.forEach(pos => {
      // Round to avoid floating point issues
      const roundedPos = Math.round(pos * 1000000) / 1000000;
      positionsSet.add(roundedPos);
    });
    
    // Convert to array and sort
    const uniquePositions = Array.from(positionsSet).sort((a, b) => a - b);
    
    if (uniquePositions.length === 0) {
      // Empty measure, use 4 rows
      return "0000\n0000\n0000\n0000";
    }
    
    // Calculate the smallest interval between positions
    let smallestInterval = 4; // Start with whole measure
    for (let i = 1; i < uniquePositions.length; i++) {
      const interval = uniquePositions[i] - uniquePositions[i - 1];
      if (interval > 0 && interval < smallestInterval) {
        smallestInterval = interval;
      }
    }
    
    // Also check distance from 0 to first position and from last position to 4
    if (uniquePositions[0] > 0 && uniquePositions[0] < smallestInterval) {
      smallestInterval = uniquePositions[0];
    }
    if (4 - uniquePositions[uniquePositions.length - 1] < smallestInterval) {
      smallestInterval = 4 - uniquePositions[uniquePositions.length - 1];
    }
    
    // Determine resolution based on smallest interval
    // We need enough subdivisions to represent the smallest interval
    let requiredRowsPerBeat = Math.ceil(1 / smallestInterval);
    
    // Adjust to standard StepMania resolutions
    const standardResolutions = [
      { rowsPerBeat: 1, totalRows: 4 },    // 4th notes
      { rowsPerBeat: 2, totalRows: 8 },    // 8th notes
      { rowsPerBeat: 3, totalRows: 12 },   // 12th notes (triplets)
      { rowsPerBeat: 4, totalRows: 16 },   // 16th notes
      { rowsPerBeat: 6, totalRows: 24 },   // 24th notes (8th triplets)
      { rowsPerBeat: 8, totalRows: 32 },   // 32nd notes
      { rowsPerBeat: 12, totalRows: 48 },  // 48th notes (16th triplets)
      { rowsPerBeat: 16, totalRows: 64 },  // 64th notes
      { rowsPerBeat: 24, totalRows: 96 },  // 96th notes (32nd triplets)
      { rowsPerBeat: 48, totalRows: 192 }  // 192nd notes
    ];
    
    // Find the smallest standard resolution that can accommodate our required resolution
    let selectedResolution = standardResolutions[0];
    for (const res of standardResolutions) {
      if (res.rowsPerBeat >= requiredRowsPerBeat) {
        selectedResolution = res;
        break;
      }
    }
    
    // If we need more than 192, we'll use custom resolution (though SM typically caps at 192)
    if (requiredRowsPerBeat > 48) {
      // Use custom resolution (StepMania allows up to 999 rows per measure)
      const customRowsPerMeasure = Math.min(999, Math.ceil(4 / smallestInterval));
      return this.generateCustomResolutionMeasure(normalizedNotes, customRowsPerMeasure);
    }
    
    const totalRows = selectedResolution.totalRows;
    const rowsPerBeat = selectedResolution.rowsPerBeat;
    
    // Create empty rows
    const rowArray = new Array(totalRows);
    for (let i = 0; i < totalRows; i++) {
      rowArray[i] = "0000";
    }
    
    // Place notes
    normalizedNotes.forEach(note => {
      // Calculate row index: beatInMeasure * rowsPerBeat
      const exactRow = note.beatInMeasure * rowsPerBeat;
      const rowIndex = Math.round(exactRow);
      
      if (rowIndex >= 0 && rowIndex < totalRows) {
        const rowStr = rowArray[rowIndex];
        const chars = rowStr.split('');
        chars[note.column] = note.type;
        rowArray[rowIndex] = chars.join('');
      }
    });
    
    return rowArray.join("\n");
  }
  
  static generateCustomResolutionMeasure(notes, totalRows) {
    // For resolutions beyond standard StepMania limits
    const rowsPerBeat = totalRows / 4;
    const rowArray = new Array(totalRows);
    
    for (let i = 0; i < totalRows; i++) {
      rowArray[i] = "0000";
    }
    
    notes.forEach(note => {
      const exactRow = note.beatInMeasure * rowsPerBeat;
      const rowIndex = Math.round(exactRow);
      
      if (rowIndex >= 0 && rowIndex < totalRows) {
        const rowStr = rowArray[rowIndex];
        const chars = rowStr.split('');
        chars[note.column] = note.type;
        rowArray[rowIndex] = chars.join('');
      }
    });
    
    return rowArray.join("\n");
  }
  
  static resolveFileUrl(filename, baseUrl) {
    if (!filename) return "";
    if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('//')) {
      return filename;
    }
    if (baseUrl && !filename.startsWith('/')) {
      return baseUrl + '/' + filename;
    }
    return filename;
  }
}

class FileTools {
  static async urlToDataURL(url) {
    return new Promise((resolve, reject) => {
      if (typeof url !== "string") {
        resolve("");
        return;
      }
      
      // Handle data URLs
      if (url.startsWith('data:')) {
        resolve(url);
        return;
      }
      
      // Handle file:// URLs and blob URLs
      if (url.startsWith('file://') || url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        
        xhr.onload = function() {
          if (this.status === 200) {
            const reader = new FileReader();
            reader.onload = function() {
              resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(xhr.response);
          } else {
            resolve("");
          }
        };
        xhr.onerror = reject;
        xhr.send();
        return;
      }
      
      resolve("");
    });
  }
  
  static extractBase64(dataUrl) {
    if (typeof dataUrl === "string") {
      if (!dataUrl.startsWith('data:')) {
        return dataUrl;
      } else {
        return dataUrl.replace(/^data:[^;]+;base64,/, '');
      }
    } else {
      return null;
    }
  }
  
  static async urlToBase64(url) {
    return new Promise(async (resolve, reject) => {
      try {
        const dataUrl = await this.urlToDataURL(url);
        const base64 = this.extractBase64(dataUrl);
        resolve(base64);
      } catch (error) {
        resolve(null);
        throw new Error(error);
      }
    });
  }
  
  static async prepareSongForExport(song, files) {
    // Create a deep copy without sprite references
    const songCopy = { ...song.chart };
    
    // Remove temporary properties
    if (songCopy.notes) {
      Object.keys(songCopy.notes).forEach(key => {
        const notes = songCopy.notes[key];
        notes.forEach(note => {
          delete note.sprite;
          delete note.holdParts;
          delete note.hit;
          delete note.miss;
          delete note.finish;
          delete note.holdActive;
          delete note.active;
          delete note.visibleHeight;
          delete note.hitEffectShown;
        });
      });
    }
    
    return songCopy;
  }
  
  static getFilename(url) {
    if (!url || url === "no-media") return "";
    const parts = url.split(/[\\/]/);
    return parts[parts.length - 1] || "";
  }
  
  static async getFileData(filename, files) {
    if (!files[filename]) {
      return null;
    }
    
    try {
      const dataUrl = files[filename];
      if (dataUrl.startsWith('data:')) {
        return FileTools.extractBase64(dataUrl);
      }
      
      // Convert URL to base64 if needed
      const base64Data = await FileTools.urlToBase64(dataUrl);
      return FileTools.extractBase64(base64Data);
    } catch (error) {
      console.error(`Failed to get file data for ${filename}:`, error);
      return null;
    }
  }
}

class LocalSMParser {
  constructor() {
    this.baseUrl = "";
  }

  async parseSM(smContent, baseUrl) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    
    let out = {};

    // Clean and parse SM content
    let sm = smContent
      .replace(/\/\/.*/g, "")
      .replace(/\r?\n|\r/g, "")
      .split(";");
    
    for (let i = sm.length - 1; i >= 0; i -= 1) {
      if (sm[i]) {
        sm[i] = sm[i].split(/:/g);
        for (let p in sm[i]) sm[i][p] = sm[i][p].trim();
      } else sm.splice(i, 1);
    }

    let steps = {};
    out.bpmChanges = [];
    out.stops = [];
    out.notes = {};
    out.backgrounds = [];
    out.banner = "no-media";
    out.bannerUrl = "";
    out.difficulties = [];
    out.background = "no-media";
    out.backgroundUrl = "";
    out.cdtitle = "";
    out.cdtitleUrl = "";
    out.lyrics = "";
    out.lyricsContent = null;
    out.audioUrl = null;
    out.videoUrl = null;
    out.sampleStart = 0;
    out.sampleLength = 10;
    out.baseUrl = baseUrl;

    for (let i in sm) {
      let p = sm[i];
      switch (p[0]) {
        case "#TITLE":
          out.title = p[1];
          break;
        case "#SUBTITLE":
          out.subtitle = p[1];
          break;
        case "#ARTIST":
          out.artist = p[1];
          break;
        case "#TITLETRANSLIT":
          out.titleTranslit = p[1];
          break;
        case "#SUBTITLETRANSLIT":
          out.subtitleTranslit = p[1];
          break;
        case "#ARTISTTRANSLIT":
          out.artistTranslit = p[1];
          break;
        case "#GENRE":
          out.genre = p[1];
          break;
        case "#CREDIT":
          out.credit = p[1];
          break;
        case "#BGCHANGES":
          if (p[1]) {
            p[1].split(",").forEach(entry => {
              entry = entry.trim();
              if (!entry) return;

              const parts = entry.split("=").filter(x => x !== "");
              if (parts.length < 6) return;

              const bgEntry = {
                beat: parseFloat(parts[0]),
                file: parts[1],
                opacity: parseFloat(parts[2]),
                fadeIn: parseInt(parts[3]) || 0,
                fadeOut: parseInt(parts[4]) || 0,
                effect: parseInt(parts[5]) || 0,
                type: "image",
                startTime: 0,
                duration: 0
              };

              // Determine file type
              if (bgEntry.file) {
                const ext = bgEntry.file.split(".").pop().toLowerCase();
                bgEntry.type = ["mp4", "avi", "mov"].includes(ext) ? "video" : "image";
                bgEntry.url = this.resolveFileUrl(bgEntry.file, baseUrl);
              }

              // Calculate timing
              if (parts.length > 6) {
                bgEntry.duration = parseFloat(parts[6]) || 0;
                bgEntry.startTime = parseFloat(parts[7]) || 0;
              }

              out.backgrounds.push(bgEntry);
            });
          }
          break;
        case "#BANNER":
          if (p[1]) {
            out.banner = p[1];
            out.bannerUrl = this.resolveFileUrl(p[1], baseUrl);
          }
          break;
        case "#CDTITLE":
          if (p[1]) {
            out.cdtitle = p[1];
            out.cdtitleUrl = this.resolveFileUrl(p[1], baseUrl);
          }
          break;
        case "#LYRICSPATH":
          if (p[1]) {
            out.lyrics = p[1];
            out.lyricsContent = await this.loadTextFile(baseUrl + p[1]);
          }
          break;
        case "#SAMPLESTART":
          if (p[1]) out.sampleStart = parseFloat(p[1]);
          break;
        case "#SAMPLELENGTH":
          if (p[1]) out.sampleLength = parseFloat(p[1]);
          break;
        case "#BACKGROUND":
          if (p[1]) {
            out.background = p[1];
            out.backgroundUrl = this.resolveFileUrl(p[1], baseUrl);
          }
          break;
          case "#MUSIC":
          if (p[1]) {
            out.audio = p[1];
            out.audioUrl = this.resolveFileUrl(p[1], baseUrl);
          }
          break;
        case "#OFFSET":
          out.offset = Number(p[1]);
          break;
        case "#BPMS": {
          let bx = p[1].split(",");
          bx = bx.filter(i => /=/.exec(i));
          for (let i in bx) {
            let v = bx[i].split("=");
            bx[i] = { beat: Number(v[0]), bpm: Number(v[1]) };
          }
          out.bpmChanges = out.bpmChanges.concat(bx);
          break;
        }
        case "#STOPS": {
          let bx = p[1].split(",");
          bx = bx.filter(i => i.includes("="));
          for (let i in bx) {
            let v = bx[i].split("=");
            bx[i] = { beat: Number(v[0]), len: Number(v[1]) };
          }
          out.stops = out.stops.concat(bx);
          break;
        }
        case "#NOTES":
          steps[p[3] + p[4]] = p[6].split(",");
          out.difficulties.push({
            type: p[3],
            rating: p[4]
          });
          break;
      }
    }

    // Process BPM changes and stops
    out.bpmChanges.sort((a, b) => a.beat - b.beat);
    if (out.bpmChanges[0].beat !== 0) throw `No starting bpm, first bpm change is ${out.bpmChanges[0]}`;
    out.bpmChanges[0].sec = 0;
    for (let i = 1; i < out.bpmChanges.length; i++) {
      out.bpmChanges[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.bpmChanges[i].beat);
    }
    for (let i = 0; i < out.stops.length; i++) {
      out.stops[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.stops[i].beat);
    }

    // Process notes
    for (let key in steps) {
      let unfinHolds = [null, null, null, null];
      out.notes[key] = [];
      for (let m in steps[key]) {
        steps[key][m] = steps[key][m].trim();
        if (steps[key][m].length % 4)
          throw `Invalid length on measure ${m}, length is ${steps[key][m].length}`;
        steps[key][m] = steps[key][m].match(/(.{4})/g);

        let t = steps[key][m].length;
        for (let l in steps[key][m]) {
          let nt = steps[key][m][l];
          let note = [{}, {}, {}, {}];
          let b = m * 4 + (l / t) * 4;
          for (let c = 0; c < note.length; c++) {
            switch (nt[c]) {
              case "3": // Hold end
                if (unfinHolds[c] == null) throw `hold end without any hold before`;
                {
                  let i = out.notes[key][unfinHolds[c]];
                  i.beatEnd = b;
                  i.beatLength = b - i.beat;
                  i.secEnd = this.beatToSec(out.bpmChanges, out.stops, b);
                  i.secLength = this.beatToSec(out.bpmChanges, out.stops, b) - this.beatToSec(out.bpmChanges, out.stops, i.beat);
                }
                unfinHolds[c] = null;
              case "0": // Empty
                note[c] = null;
                continue;
              case "4": // Roll start
              case "2": // Hold start
                if (unfinHolds[c]) throw `new hold started before last ended`;
                unfinHolds[c] = out.notes[key].length + c;
              case "1": // Regular note
              case "M": // Mine
                note[c].type = nt[c];
                break;
              default:
                throw `invalid note type ${nt[c]}`;
            }
            note[c].beat = b;
            note[c].sec = this.beatToSec(out.bpmChanges, out.stops, b);
            note[c].column = c;
          }
          out.notes[key] = out.notes[key].concat(note);
        }
      }
      out.notes[key] = out.notes[key].filter(i => i !== null);
    }

    return out;
  }
  
  async loadTextFile(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          resolve(null);
        }
      };
      xhr.onerror = () => resolve(null);
      xhr.send();
    });
  }

  resolveFileUrl(filename, baseUrl) {
    if (!filename) return "";
    // Handle absolute URLs and relative paths
    if (filename.startsWith('http') || filename.startsWith('//')) {
      return filename;
    }
    if (!baseUrl) baseUrl = this.baseUrl || "";
    if (!baseUrl.endsWith("/") && !filename.startsWith("/")) baseUrl = baseUrl + "/"
    return baseUrl + filename;
  }

  getLastBpm(bpmChanges, time, valueType) {
    return bpmChanges.find((e, i, a) => i + 1 == a.length || a[i + 1][valueType] >= time);
  }

  beatToSec(bpmChanges, stops, beat) {
    let b = this.getLastBpm(bpmChanges, beat, "beat");
    let x = ((beat - b.beat) / b.bpm) * 60 + b.sec;
    let s = stops.filter(({ beat: i }) => i >= b.beat && i < beat).map(i => i.len);
    for (let i in s) x += s[i];
    return x;
  }
}

class ExternalSMParser {
  // TODO: Make this class use SMFile
  async parseSM(files, smContent) {
    let out = {};
    let isSSC = smContent.includes("#VERSION:");

    if (isSSC) {
      return this.parseSSC(files, smContent);
    }

    // Clean and parse SM content
    let sm = smContent
      .replace(/\/\/.*/g, "")
      .replace(/\r?\n|\r/g, "")
      .split(";");

    for (let i = sm.length - 1; i >= 0; i -= 1) {
      if (sm[i]) {
        sm[i] = sm[i].split(/:/g);
        for (let p in sm[i]) sm[i][p] = sm[i][p].trim();
      } else sm.splice(i, 1);
    }

    let steps = {};
    out.bpmChanges = [];
    out.stops = [];
    out.notes = {};
    out.backgrounds = [];
    out.banner = "no-media";
    out.bannerUrl = "";
    out.difficulties = [];
    out.background = "no-media";
    out.backgroundUrl = "";
    out.cdtitle = "no-media";
    out.cdtitleUrl = "";
    out.lyrics = "";
    out.lyricsContent = null;
    out.audioUrl = null;
    out.videoUrl = null;
    out.files = files;
    out.sampleStart = 0;
    out.sampleLength = 10;

    for (let i in sm) {
      let p = sm[i];
      switch (p[0]) {
        case "#TITLE":
          out.title = p[1];
          break;
        case "#SUBTITLE":
          out.subtitle = p[1];
          break;
        case "#ARTIST":
          out.artist = p[1];
          break;
        case "#TITLETRANSLIT":
          out.titleTranslit = p[1];
          break;
        case "#SUBTITLETRANSLIT":
          out.subtitleTranslit = p[1];
          break;
        case "#ARTISTTRANSLIT":
          out.artistTranslit = p[1];
          break;
        case "#GENRE":
          out.genre = p[1];
          break;
        case "#CREDIT":
          out.credit = p[1];
          break;
        case "#BGCHANGES":
          if (p[1]) {
            p[1].split(",").forEach(entry => {
              entry = entry.trim();
              if (!entry) return;

              const parts = entry.split("=").filter(x => x !== "");
              if (parts.length < 6) return;

              const bgEntry = {
                beat: parseFloat(parts[0]),
                file: parts[1],
                opacity: parseFloat(parts[2]),
                fadeIn: parseInt(parts[3]) || 0,
                fadeOut: parseInt(parts[4]) || 0,
                effect: parseInt(parts[5]) || 0,
                type: "image",
                startTime: 0,
                duration: 0
              };

              if (bgEntry.file) {
                const ext = bgEntry.file.split(".").pop().toLowerCase();
                bgEntry.type = ["mp4", "avi", "mov"].includes(ext) ? "video" : "image";
                // Create URL for the file if it exists
                if (files[bgEntry.file.toLowerCase()]) {
                  const file = files[bgEntry.file.toLowerCase()];
                  bgEntry.url = file.localURL ? file.localURL : URL.createObjectURL(file);
                  bgEntry.url = bgEntry.url
                    .replace('cdvfile://', 'file://')
                    .replace('localhost/persistent/', '/storage/emulated/0/');
                }
              }

              if (parts.length > 6) {
                bgEntry.duration = parseFloat(parts[6]) || 0;
                bgEntry.startTime = parseFloat(parts[7]) || 0;
              }

              out.backgrounds.push(bgEntry);
            });
          }
          break;
        case "#BANNER":
          if (p[1] && files[p[1].toLowerCase()]) {
            const file = files[p[1].toLowerCase()];
            out.banner = p[1];
            out.bannerUrl = file.localURL ? file.localURL : URL.createObjectURL(file);
            out.bannerUrl = out.bannerUrl
              .replace('cdvfile://', 'file://')
              .replace('localhost/persistent/', '/storage/emulated/0/');
          }
          break;
        case "#CDTITLE":
          if (p[1] && files[p[1].toLowerCase()]) {
            const file = files[p[1].toLowerCase()];
            out.cdtitle = p[1];
            out.cdtitleUrl = file.localURL ? file.localURL : URL.createObjectURL(file);
            out.cdtitleUrl = out.cdtitleUrl
              .replace('cdvfile://', 'file://')
              .replace('localhost/persistent/', '/storage/emulated/0/');
          }
          break;
        case "#SAMPLESTART":
          if (p[1]) out.sampleStart = parseFloat(p[1]);
          break;
        case "#SAMPLELENGTH":
          if (p[1]) out.sampleLength = parseFloat(p[1]);
          break;
        case "#BACKGROUND":
          if (p[1] && files[p[1].toLowerCase()]) {
            const file = files[p[1].toLowerCase()];
            out.background = p[1];
            out.backgroundUrl = file.localURL ? file.localURL : URL.createObjectURL(file);
            out.backgroundUrl = out.backgroundUrl
              .replace('cdvfile://', 'file://')
              .replace('localhost/persistent/', '/storage/emulated/0/');
          }
          break;
        case "#LYRICSPATH":
          if (p[1] && files[p[1].toLowerCase()]) {
            const file = files[p[1].toLowerCase()];
            out.lyrics = p[1];
            out.lyricsContent = await this.readFileContent(file);
          }
          break;
        case "#MUSIC":
          if (p[1]) {
            out.audio = p[1];
            if (files[p[1].toLowerCase()]) {
              const file = files[p[1].toLowerCase()];
              out.audioUrl = file.localURL ? file.localURL : URL.createObjectURL(file);
              out.audioUrl = out.audioUrl
                .replace('cdvfile://', 'file://')
                .replace('localhost/persistent/', '/storage/emulated/0/');
            }
          }
          break;
        case "#OFFSET":
          out.offset = Number(p[1]);
          break;
        case "#BPMS": {
          let bx = p[1].split(",");
          bx = bx.filter(i => /=/.exec(i));
          for (let i in bx) {
            let v = bx[i].split("=");
            bx[i] = { beat: Number(v[0]), bpm: Number(v[1]) };
          }
          out.bpmChanges = out.bpmChanges.concat(bx);
          break;
        }
        case "#STOPS": {
          let bx = p[1].split(",");
          bx = bx.filter(i => i.includes("="));
          for (let i in bx) {
            let v = bx[i].split("=");
            bx[i] = { beat: Number(v[0]), len: Number(v[1]) };
          }
          out.stops = out.stops.concat(bx);
          break;
        }
        case "#NOTES":
          steps[p[3] + p[4]] = p[6].split(",");
          out.difficulties.push({
            type: p[3],
            rating: p[4]
          });
          break;
      }
    }

    // Process BPM changes and stops
    out.bpmChanges.sort((a, b) => a.beat - b.beat);
    if (out.bpmChanges.length === 0 || out.bpmChanges[0].beat !== 0) {
      throw "No starting bpm";
    }
    out.bpmChanges[0].sec = 0;
    for (let i = 1; i < out.bpmChanges.length; i++) {
      out.bpmChanges[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.bpmChanges[i].beat);
    }
    for (let i = 0; i < out.stops.length; i++) {
      out.stops[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.stops[i].beat);
    }

    // Process notes
    for (let key in steps) {
      let unfinHolds = [null, null, null, null];
      out.notes[key] = [];
      for (let m in steps[key]) {
        steps[key][m] = steps[key][m].trim();
        if (steps[key][m].length % 4) throw `Invalid length on measure ${m}, length is ${steps[key][m].length}`;
        steps[key][m] = steps[key][m].match(/(.{4})/g);

        let t = steps[key][m].length;
        for (let l in steps[key][m]) {
          let nt = steps[key][m][l];
          let note = [{}, {}, {}, {}];
          let b = m * 4 + (l / t) * 4;
          for (let c = 0; c < note.length; c++) {
            switch (nt[c]) {
              case "3": // Hold end
                if (unfinHolds[c] == null) throw `hold end without any hold before`;
                {
                  let i = out.notes[key][unfinHolds[c]];
                  i.beatEnd = b;
                  i.beatLength = b - i.beat;
                  i.secEnd = this.beatToSec(out.bpmChanges, out.stops, b);
                  i.secLength = this.beatToSec(out.bpmChanges, out.stops, b) - this.beatToSec(out.bpmChanges, out.stops, i.beat);
                }
                unfinHolds[c] = null;
              case "0": // Empty
                note[c] = null;
                continue;
              case "4": // Roll start
              case "2": // Hold start
                if (unfinHolds[c]) throw `new hold started before last ended`;
                unfinHolds[c] = out.notes[key].length + c;
              case "1": // Regular note
              case "M": // Mine
                note[c].type = nt[c];
                break;
              default:
                throw `invalid note type ${nt[c]}`;
            }
            note[c].beat = b;
            note[c].sec = this.beatToSec(out.bpmChanges, out.stops, b);
            note[c].column = c;
          }
          out.notes[key] = out.notes[key].concat(note);
        }
      }
      out.notes[key] = out.notes[key].filter(i => i !== null);
    }

    return out;
  }
  
  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  parseSSC(files, sscContent) {
    const sections = sscContent.split(/\/\/-+/);
    const headerSection = sections[0];
    const chartSections = sections.slice(1);

    const out = {
      bpmChanges: [],
      stops: [],
      notes: {},
      backgrounds: [],
      banner: "no-media",
      difficulties: [],
      background: "no-media",
      cdtitle: null,
      audioUrl: null,
      videoUrl: null,
      files: files,
      sampleStart: 0,
      sampleLength: 10
    };

    // Parse global metadata
    const headerTags = {};
    headerSection
      .split("\n")
      .filter(line => line.trim().startsWith("#"))
      .forEach(line => {
        const [key, ...rest] = line.slice(1).split(":");
        let value = rest.join(":").trim().replace(/;+$/, "");
        if (["BPMS", "STOPS", "BGCHANGES"].includes(key)) {
          value = value
            .split(",")
            .map(v => v.trim())
            .join(",");
        }
        headerTags[key] = value;
      });

    // Get audio file URL
    if (headerTags.MUSIC && files[headerTags.MUSIC.toLowerCase()]) {
      const audioFile = files[headerTags.MUSIC.toLowerCase()];
      out.audioUrl = audioFile.localURL ? audioFile.localURL : URL.createObjectURL(audioFile);
      out.audio = headerTags.MUSIC;
    }

    Object.assign(out, {
      title: headerTags.TITLE || "",
      subtitle: headerTags.SUBTITLE || "",
      artist: headerTags.ARTIST || "",
      titleTranslit: headerTags.TITLETRANSLIT || "",
      subtitleTranslit: headerTags.SUBTITLETRANSLIT || "",
      artistTranslit: headerTags.ARTISTTRANSLIT || "",
      genre: headerTags.GENRE || "",
      credit: headerTags.CREDIT || "",
      offset: Number(headerTags.OFFSET) || 0,
      sampleStart: Number(headerTags.SAMPLESTART) || 0,
      sampleLength: Number(headerTags.SAMPLELENGTH) || 10
    });

    // Get banner
    if (headerTags.BANNER && files[headerTags.BANNER.toLowerCase()]) {
      const bannerFile = files[headerTags.BANNER.toLowerCase()];
      out.banner = bannerFile.name;
      out.bannerUrl = bannerFile.localURL ? bannerFile.localURL : URL.createObjectURL(bannerFile);
    }

    // Get background
    if (headerTags.BACKGROUND && files[headerTags.BACKGROUND.toLowerCase()]) {
      const bgFile = files[headerTags.BACKGROUND.toLowerCase()];
      out.background = bgFile.name;
      out.backgroundUrl = bgFile.localURL ? bgFile.localURL : URL.createObjectURL(bgFile);
    }

    // Parse BPMs
    if (headerTags.BPMS) {
      const bpmList = headerTags.BPMS.split(",").map(entry => {
        const [beat, bpm] = entry.split("=");
        return { beat: Number(beat), bpm: Number(bpm) };
      });
      out.bpmChanges = bpmList;
    }

    // Parse stops
    if (headerTags.STOPS) {
      const stopList = headerTags.STOPS.split(",").map(entry => {
        const [beat, len] = entry.split("=");
        return { beat: Number(beat), len: Number(len) };
      });
      out.stops = stopList;
    }

    // Process BPM changes and stops timing
    if (out.bpmChanges.length > 0) {
      out.bpmChanges.sort((a, b) => a.beat - b.beat);
      out.bpmChanges[0].sec = 0;
      for (let i = 1; i < out.bpmChanges.length; i++) {
        out.bpmChanges[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.bpmChanges[i].beat);
      }
      for (let i = 0; i < out.stops.length; i++) {
        out.stops[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.stops[i].beat);
      }
    }

    // Parse chart sections (simplified - you may want to expand this)
    chartSections.forEach(section => {
      const lines = section.split("\n").filter(line => line.trim() !== "");
      const chartTags = {};
      let inNotes = false;
      let noteData = [];

      lines.forEach(line => {
        if (line.startsWith("#")) {
          if (line.startsWith("#NOTES")) {
            inNotes = true;
          } else if (!line.startsWith("#NOTEDATA") && !line.startsWith("#CHARTNAME")) {
            const [key, ...rest] = line.slice(1).split(":");
            const value = rest.join(":").trim().replace(/;+$/, "");
            chartTags[key] = value;
          }
        } else if (inNotes) {
          if (line.trim() === ";") {
            inNotes = false;
          } else {
            noteData.push(line.trim());
          }
        }
      });

      if (chartTags.DIFFICULTY && chartTags.METER) {
        const difficultyKey = `${chartTags.DIFFICULTY}${chartTags.METER}`;
        out.difficulties.push({
          type: chartTags.DIFFICULTY,
          rating: chartTags.METER
        });

        // Convert note data to our format (simplified)
        out.notes[difficultyKey] = this.convertSSCNotes(noteData, out.bpmChanges, out.stops);
      }
    });

    return out;
  }

  convertSSCNotes(noteData, bpmChanges, stops) {
    const notes = [];
    let measureIndex = 0;

    noteData.forEach(measure => {
      const rows = measure.split("\n").filter(row => row.trim() !== "");
      const rowsPerMeasure = rows.length;

      rows.forEach((row, rowIndex) => {
        const beat = measureIndex * 4 + (rowIndex / rowsPerMeasure) * 4;

        for (let column = 0; column < 4 && column < row.length; column++) {
          const noteChar = row[column];
          if (noteChar !== "0" && noteChar !== "3") {
            // Skip empty and hold ends
            const note = {
              type: noteChar,
              beat: beat,
              sec: this.beatToSec(bpmChanges, stops, beat),
              column: column
            };
            notes.push(note);
          }
        }
      });

      measureIndex++;
    });

    return notes;
  }

  getLastBpm(bpmChanges, time, valueType) {
    return bpmChanges.find((e, i, a) => i + 1 == a.length || a[i + 1][valueType] >= time);
  }

  beatToSec(bpmChanges, stops, beat) {
    if (!bpmChanges || bpmChanges.length === 0) return beat;

    let b = this.getLastBpm(bpmChanges, beat, "beat");
    let x = ((beat - b.beat) / b.bpm) * 60 + b.sec;
    let s = stops.filter(({ beat: i }) => i >= b.beat && i < beat).map(i => i.len);
    for (let i in s) x += s[i];
    return x;
  }
}

class AddonManager {
  constructor() {
    this.addons = new Map();
    this.enabledAddons = new Set();
    this.hibernatingAddons = new Set();
    this.safeMode = false;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    // Load addon settings from account
    this.safeMode = Account.settings?.safeMode || false;
    this.enabledAddons = new Set(Account.settings?.enabledAddons || []);
    this.hibernatingAddons = new Set(Account.settings?.hibernatingAddons || []);
    
    if (this.safeMode) {
      console.log("🔒 Addon Safe Mode enabled - skipping addon loading");
      this.isInitialized = true;
      return;
    }

    await this.loadAddons();
    this.isInitialized = true;
  }

  async loadAddons() {
    try {
      console.log("📦 Loading addons...");
      
      await this.loadAddonsFromStorage();
      
      await this.processAddons();
      
    } catch (error) {
      console.error("Error loading addons:", error);
    }
  }

  async loadAddonsFromStorage() {
    const fileSystem = new FileSystemTools();
    
    try {
      const rootDir = await fileSystem.getDirectory(EXTERNAL_DIRECTORY + ADDONS_DIRECTORY);
      const addonDirs = await fileSystem.listDirectories(rootDir);
      
      console.log(`Found ${addonDirs.length} addon directories`);
      
      for (const addonDir of addonDirs) {
        try {
          await this.loadAddonFromDirectory(addonDir, fileSystem);
        } catch (error) {
          console.warn(`Failed to load addon from ${addonDir.name}:`, error);
        }
      }
      
    } catch (error) {
      console.log("No external addons directory found");
    }
  }

  async loadAddonFromDirectory(addonDir, fileSystem) {
    const files = await fileSystem.listFiles(addonDir);
    const fileMap = {};
    
    for (const fileEntry of files) {
      const file = await fileSystem.getFile(fileEntry);
      fileMap[file.name.toLowerCase()] = {
        entry: fileEntry,
        file: file,
        name: file.name
      };
    }
    
    // Check for manifest
    const manifestFile = fileMap['manifest.json'];
    if (!manifestFile) {
      throw new Error("No manifest.json found");
    }
    
    const manifestContent = await fileSystem.readFileContent(manifestFile.file);
    const manifest = JSON.parse(manifestContent);
    
    // Validate manifest
    if (!manifest.id || !manifest.name || !manifest.version) {
      throw new Error("Invalid manifest: missing required fields");
    }
    
    const addon = {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      icon: manifest.icon,
      author: manifest.author || "Unknown",
      description: manifest.description || "",
      manifest: manifest,
      directory: addonDir,
      dir: addonDir,
      files: fileMap,
      assets: [],
      behaviors: {},
      isEnabled: this.enabledAddons.has(manifest.id) && !this.hibernatingAddons.has(manifest.id),
      isHibernating: this.hibernatingAddons.has(manifest.id)
    };
    
    if (manifest.icon) {
      addon.icon = addon.dir.nativeURL + manifest.icon;
    }
    
    this.processAddonAssets(addon);
    
    this.addons.set(addon.id, addon);
    console.log(`📦 Loaded addon: ${addon.name} v${addon.version} (${addon.isEnabled ? 'enabled' : 'disabled'})`);
  }

  async processAddons() {
    // Process assets and behaviors for enabled addons
    for (const [addonId, addon] of this.addons) {
      if (!addon.isEnabled) continue;
      
      try {
        await this.processAddonBehaviors(addon);
      } catch (error) {
        console.error(`Failed to process addon ${addon.name}:`, error);
      }
    }
  }

  processAddonAssets(addon) {
    const assetsManifest = addon.manifest.assets;
    if (!assetsManifest) return;
    
    const defaultResources = {};
    window.gameResources.forEach(res => defaultResources[res.key] = res);
    
    for (const [assetKey, assetPath] of Object.entries(assetsManifest)) {
      const assetUrl = addon.dir.nativeURL + assetPath;
      
      const addonAssets = addon.assets;
      
      if (defaultResources[assetKey]) {
        addon.assets.push({
          ...defaultResources[assetKey],
          key: assetKey,
          url: assetUrl
        });
      } else {
        addon.assets.push({
          type: "image",
          key: assetKey,
          url: assetUrl
        });
      }
    }
  }

  async processAddonBehaviors(addon) {
    const behaviorsManifest = addon.manifest.behaviors;
    if (!behaviorsManifest) return;
    
    for (const [stateName, behaviorPath] of Object.entries(behaviorsManifest)) {
      const behaviorUrl = addon.dir.nativeURL + behaviorPath;
            
      const content = await this.loadTextFile(behaviorUrl);
      addon.behaviors[stateName] = { 
        content,
        stateName
      };
    }
  }
  
  async loadTextFile(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          resolve(null);
        }
      };
      xhr.onerror = () => resolve(null);
      xhr.send();
    });
  }

  async readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  executeBehavior(addon, stateName, context, extraParams) {
    const behavior = addon.behaviors[stateName];
    if (!behavior) return;
    
    try {
      // Create a safe execution context
      const safeContext = {
        global: context.global,
        game: game,
        state: context.state,
        addon: addon,
        console: console,
        ...(extraParams || {})
      };
      
      // Execute in a controlled environment
      const func = new Function(
        ...Object.keys(safeContext),
        `${behavior.content}`
      );
      
      func.call(context.global || window, ...Object.values(safeContext));
      
    } catch (error) {
      console.error(`Error executing behavior for ${addon.name} in ${stateName}:`, error);
    }
  }

  executeGlobalBehaviors() {
    for (const [addonId, addon] of this.addons) {
      if (addon.isHibernating || !addon.isEnabled) continue;
      this.executeBehavior(addon, 'Global', { game, global: window });
    }
  }

  executeStateBehaviors(stateName, stateInstance, extraParams) {
    for (const [addonId, addon] of this.addons) {
      if (addon.isHibernating || !addon.isEnabled) continue;
      this.executeBehavior(addon, stateName, {
        game: game,
        global: stateInstance,
        state: stateInstance,
        stateName: stateName,
        extraParams: extraParams
      });
    }
  }

  parseVersion(version) {
    const parts = version.split('.').map(part => parseInt(part, 10) || 0);
    while (parts.length < 3) parts.push(0);
    return parts;
  }

  compareVersions(v1, v2) {
    for (let i = 0; i < 3; i++) {
      if (v1[i] > v2[i]) return 1;
      if (v1[i] < v2[i]) return -1;
    }
    return 0;
  }

  enableAddon(addonId) {
    const addon = this.addons.get(addonId);
    if (addon) {
      addon.isEnabled = true;
      this.enabledAddons.add(addonId);
      this.hibernatingAddons.delete(addonId);
      this.saveAddonSettings();
      return true;
    }
    return false;
  }

  disableAddon(addonId) {
    const addon = this.addons.get(addonId);
    if (addon) {
      addon.isEnabled = false;
      this.enabledAddons.delete(addonId);
      this.saveAddonSettings();
      return true;
    }
    return false;
  }
  
  hibernateAddon(addonId) {
    const addon = this.addons.get(addonId);
    if (addon) {
      addon.isEnabled = false;
      addon.isHibernating = true;
      this.enabledAddons.delete(addonId);
      this.hibernatingAddons.add(addonId);
      this.saveAddonSettings();
      return true;
    }
    return false;
  }
  
  wakeAddon(addonId) {
    const addon = this.addons.get(addonId);
    if (addon && addon.isHibernating) {
      addon.isEnabled = true;
      addon.isHibernating = false;
      this.enabledAddons.add(addonId);
      this.hibernatingAddons.delete(addonId);
      this.saveAddonSettings();
      return true;
    }
    return false;
  }

  uninstallAddon(addonId) {
    const addon = this.addons.get(addonId);
    if (addon) {
      addon.dir.removeRecursively();
      this.addons.delete(addonId);
      return true;
    }
    return false;
  }
  
  setSafeMode(enabled) {
    this.safeMode = enabled;
    Account.settings.safeMode = enabled;
    saveAccount();
  }

  getAddonList() {
    return Array.from(this.addons.values()).map(addon => ({
      id: addon.id,
      name: addon.name,
      version: addon.version,
      author: addon.author,
      description: addon.description,
      isEnabled: addon.isEnabled,
      isHibernating: addon.isHibernating,
      icon: addon.icon,
      assets: addon.assets,
      behaviors: addon.behaviors,
      hasAssets: Object.keys(addon.assets).length > 0,
      hasBehaviors: Object.keys(addon.behaviors).length > 0
    }));
  }
  
  getResourceList() {
    let resources = [];
    
    const addons = Array.from(this.addons.values());
    
    addons.forEach(addon => {
      if (!addon.isHibernating && addon.isEnabled) {
        resources = [
          ...resources,
          ...addon.assets
        ];
      }
    });
    
    return resources;
  }

  saveAddonSettings() {
    Account.settings.enabledAddons = Array.from(this.enabledAddons);
    Account.settings.hibernatingAddons = Array.from(this.hibernatingAddons);
    Account.settings.safeMode = this.safeMode;
    saveAccount();
  }

  needsReload() {
    // Check if any changes were made that require a reload
    const currentEnabled = new Set(Account.settings?.enabledAddons || []);
    const currentHibernating = new Set(Account.settings?.hibernatingAddons || []);
    const currentSafeMode = Account.settings?.safeMode || false;
    
    return !this.setsEqual(currentEnabled, this.enabledAddons) ||
           !this.setsEqual(currentHibernating, this.hibernatingAddons) ||
           currentSafeMode !== this.safeMode;
  }

  setsEqual(set1, set2) {
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }
}

class Boot {
  preload() {
    this.load.baseURL = "assets/";

    this.keys = [];

    Object.keys(FONTS).forEach(key => {
      const entry = FONTS[key];
      this.load.spritesheet(entry.font, `fonts/${key}.png`, entry.fontWidth || 4, entry.fontHeight || 6);
    });

    WINDOW_PANELS.forEach(key => {
      this.load.spritesheet(`ui_window_${key}`, `ui/window_${key}.png`, 8, 8);
      this.keys.push(`ui_window_${key}`);
    });
    
    // Check if game crashed last time
    this.checkForCrashRecovery();
  }
  checkForCrashRecovery() {
    const lastCrashed = localStorage.getItem('gameLastCrashed');
    if (lastCrashed === 'true') {
      // Clear the flag
      localStorage.removeItem('gameLastCrashed');
      
      // Set flag in account to show bug report dialog later
      Account.stats.lastCrashed = true;
      saveAccount();
    }
  }
  create() {
    gamepad = new Gamepad(game);

    notifications = new NotificationSystem();
    
    achievementsManager = new AchievementsManager();
    achievementsManager.initialize();

    game.time.advancedTiming = true;

    game.world.updateOnlyExistingChildren = true;

    game.onMenuIn = new Phaser.Signal();

    game.state.add("Load", Load);
    game.state.add("LoadCordova", LoadCordova);
    game.state.add("LoadAddons", LoadAddons);
    game.state.add("LoadLocalSongs", LoadLocalSongs);
    game.state.add("LoadExternalSongs", LoadExternalSongs);
    game.state.add("LoadSongFolder", LoadSongFolder);
    game.state.add("Title", Title);
    game.state.add("MainMenu", MainMenu);
    game.state.add("SongSelect", SongSelect);
    game.state.add("CharacterSelect", CharacterSelect);
    game.state.add("AchievementsMenu", AchievementsMenu);
    game.state.add("StatsMenu", StatsMenu);
    game.state.add("Play", Play);
    game.state.add("Results", Results);
    game.state.add("Editor", Editor);
    game.state.add("Jukebox", Jukebox);
    game.state.add("Credits", Credits);

    window.primaryAssets = this.keys;

    window.gameResources = [
      {
        key: "ui_loading_dots",
        url: "ui/loading_dots.png",
        type: "spritesheet",
        frameWidth: 26,
        frameHeight: 6
      },
      {
        key: "ui_background_gradient",
        url: "ui/background_gradient.png"
      },
      {
        key: "ui_logo_shape",
        url: "ui/logo_shape.png"
      },
      {
        key: "ui_hud_background",
        url: "ui/hud_background.png"
      },
      {
        key: "ui_editor_icons",
        url: "ui/editor_icons.png",
        type: "spritesheet",
        frameWidth: 8,
        frameHeight: 8
      },
      {
        key: "ui_lobby_background",
        url: "ui/lobby_background.png"
      },
      {
        key: "ui_lobby_overlay",
        url: "ui/lobby_overlay.png"
      },
      {
        key: "ui_navigation_hint_keyboard",
        url: "ui/navigation_hint_keyboard.png",
        type: "spritesheet",
        frameWidth: 192,
        frameHeight: 112
      },
      {
        key: "ui_glitch_animation",
        url: "ui/glitch_animation.png",
        type: "spritesheet",
        frameWidth: 192,
        frameHeight: 112
      },
      {
        key: "ui_navigation_hint_gamepad",
        url: "ui/navigation_hint_gamepad.png",
        type: "spritesheet",
        frameWidth: 192,
        frameHeight: 112
      },
      {
        key: "ui_difficulty_banner",
        url: "ui/difficulty_banner.png"
      },
      {
        key: "ui_lifebar",
        url: "ui/lifebar.png",
        type: "spritesheet",
        frameWidth: 1,
        frameHeight: 5
      },
      {
        key: "ui_skill_bar",
        url: "ui/skill_bar.png",
        type: "spritesheet",
        frameWidth: 2,
        frameHeight: 2
      },
      {
        key: "ui_accuracy_bar",
        url: "ui/accuracy_bar.png"
      },
      {
        key: "ui_jukebox_pause_toggle",
        url: "ui/jukebox_pause_toggle.png",
        type: "spritesheet",
        frameWidth: 12,
        frameHeight: 12
      },
      {
        key: "ui_jukebox_seek",
        url: "ui/jukebox_seek.png",
        type: "spritesheet",
        frameWidth: 8,
        frameHeight: 8
      },
      {
        key: "ui_jukebox_skip",
        url: "ui/jukebox_skip.png",
        type: "spritesheet",
        frameWidth: 8,
        frameHeight: 8
      },
      {
        key: "ui_jukebox_menu",
        url: "ui/jukebox_menu.png",
        type: "spritesheet",
        frameWidth: 8,
        frameHeight: 8
      },
      {
        key: "ui_jukebox_visualization",
        url: "ui/jukebox_visualization.png",
        type: "spritesheet",
        frameWidth: 8,
        frameHeight: 8
      },
      // Sfx
      {
        key: "assist_tick",
        type: "audio",
        url: "sfx/assist_tick.ogg"
      },
      {
        key: "level_up",
        type: "audio",
        url: "sfx/level_up.ogg"
      },
      {
        key: "exp_up",
        type: "audio",
        url: "sfx/exp_up.ogg"
      },
      // Chart assets
      {
        key: "arrows",
        url: "chart/arrows.png",
        type: "spritesheet",
        frameWidth: 16,
        frameHeight: 16
      },
      {
        key: "receptor",
        url: "chart/receptor.png",
        type: "spritesheet",
        frameWidth: 16,
        frameHeight: 16
      },
      {
        key: "explosion",
        url: "chart/explosion.png",
        type: "image"
      },
      {
        key: "mineexplosion",
        url: "chart/mine_explosion.png",
        type: "image"
      },
      {
        key: "mine",
        url: "chart/mine.png",
        type: "spritesheet",
        frameWidth: 16,
        frameHeight: 16
      },
      {
        key: "hold_end",
        url: "chart/hold_end.png",
        type: "spritesheet",
        frameWidth: 16,
        frameHeight: 8
      },
      {
        key: "hold_body",
        url: "chart/hold_body.png",
        type: "spritesheet",
        frameWidth: 16,
        frameHeight: 112
      },
      {
        key: "roll_end",
        url: "chart/roll_end.png",
        type: "spritesheet",
        frameWidth: 16,
        frameHeight: 8
      },
      {
        key: "roll_body",
        url: "chart/roll_body.png",
        type: "spritesheet",
        frameWidth: 16,
        frameHeight: 16
      },
      // Character assets
      {
        key: "character_base",
        url: "character/base.png",
        type: "spritesheet",
        frameWidth: 100,
        frameHeight: 100
      },
      {
        key: "character_eyes",
        url: "character/eyes.png",
        type: "spritesheet",
        frameWidth: 100,
        frameHeight: 100
      },
      // Hair styles
      ...(() => {
        const resources = [];
        // Front hairs
        for (let i = 1; i <= CHARACTER_SYSTEM.HAIR_STYLES.front.length; i++) {
          resources.push({
            key: `character_front_hair_${i}`,
            url: `character/front_hair_${i}.png`,
            type: "spritesheet",
            frameWidth: 100,
            frameHeight: 100
          });
        }
        // Back hairs
        for (let i = 1; i <= CHARACTER_SYSTEM.HAIR_STYLES.back.length; i++) {
          resources.push({
            key: `character_back_hair_${i}`,
            url: `character/back_hair_${i}.png`,
            type: "spritesheet",
            frameWidth: 100,
            frameHeight: 100
          });
        }
        return resources;
      })(),
      // Clothing and accessories
      ...(() => {
        const resources = [];
        CHARACTER_ITEMS.clothing.forEach(item => {
          resources.push({
            key: `character_clothing_${item.id}`,
            url: `character/${item.id}.png`,
            type: "spritesheet",
            frameWidth: 100,
            frameHeight: 100
          });
        });
        CHARACTER_ITEMS.accessories.forEach(item => {
          resources.push({
            key: `character_accessory_${item.id}`,
            url: `character/${item.id}.png`,
            type: "spritesheet",
            frameWidth: 100,
            frameHeight: 100
          });
        });
        return resources;
      })(),
      {
        key: "character_noise",
        url: "ui/character_noise.png",
        type: "spritesheet",
        frameWidth: 36,
        frameHeight: 7
      }
    ];

    window.addEventListener("keydown", event => {
      // Only process if we're in the game and not in an input field
      if (document.activeElement.tagName === "INPUT") return;

      switch (event.code) {
        case "F8": // Screenshot
          event.preventDefault();
          if (game.recorder) {
            game.recorder.screenshot();
          }
          break;

        case "F9": // Start/Stop recording
          event.preventDefault();
          if (game.recorder.isRecording) {
            game.recorder.stop();
          } else {
            game.recorder.start();
          }
          break;

        case "F10": // Record next game
          event.preventDefault();
          window.recordNextGame = true;
          break;
      }
    });

    game.state.start("Load", true, false, window.gameResources, "LoadCordova");
  }
}

class Load {
  init(resources, nextState, nextStateParams) {
    this.resources = resources || [];
    this.nextState = nextState || 'Title';
    this.nextStateParams = nextStateParams || {};
    this.loadedCount = 0;
    this.totalCount = this.resources.length;
  }

  preload() {
    // Load all resources from the provided list
    this.resources.forEach(resource => {
      switch (resource.type) {
        case undefined:
        case 'image':
          this.load.image(resource.key, resource.url);
          break;
        case 'spritesheet':
          this.load.spritesheet(resource.key, resource.url, resource.frameWidth, resource.frameHeight);
          break;
        case 'audio':
          this.load.audio(resource.key, resource.url);
          break;
        case 'video':
          this.load.video(resource.key, resource.url, 'canplay', true);
          break;
        case 'json':
          this.load.json(resource.key, resource.url);
          break;
        case 'text':
          this.load.text(resource.key, resource.url);
          break;
      }
      
      this.loadedCount++;
    });

    // Create simple progress display
    this.progressText = new ProgressText("LOADING ASSETS");
  }

  create() {
    // All resources loaded, start next state
    game.state.start(this.nextState, true, false, this.nextStateParams);
  }
}

class LoadCordova {
  create() {
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA) {
      this.loadScript();
    } else {
      this.createFolderStructure();
    }
  }
  loadScript() {
    this.loadingDots = new LoadingDots();
    
    this.progressText = new ProgressText("INITIALIZING FILESYSTEM");
    
    const script = document.createElement("script");
    script.src = "./cordova/cordova.js";
    document.head.appendChild(script);
    document.addEventListener("deviceready", () => {
      this.createFolderStructure();
      document.addEventListener("backbutton", () => {
        if (game.state.current == "Play") {
          gamepad.press('start');
        } else {
          gamepad.press('b');
        }
      });
    });
  }
  async createFolderStructure() {
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      const fileSystem = new FileSystemTools();
      
      const rootDir = await fileSystem.getDirectory("");
      
      const gameDir = await fileSystem.createDirectory(rootDir, EXTERNAL_DIRECTORY);
      
      await fileSystem.createDirectory(gameDir, ADDONS_DIRECTORY);
      await fileSystem.createDirectory(gameDir, SCREENSHOTS_DIRECTORY);
      await fileSystem.createDirectory(gameDir, SONGS_DIRECTORY);
      await fileSystem.createDirectory(gameDir, EDITOR_OUTPUT_DIRECTORY);
    }
    this.continue();
  }
  continue() {
    game.state.start("LoadAddons");
  }
}

class LoadAddons {
  create() {
    this.progressText = new ProgressText("LOADING ADD-ONS");
    this.loadingDots = new LoadingDots();
    this.initialize();
  }
  async initialize() {
    // Initialize addon manager
    addonManager = new AddonManager();
    await addonManager.initialize();
    
    // Execute global addon behaviors
    addonManager.executeGlobalBehaviors();
    
    const resources = addonManager.getResourceList();
    
    game.load.baseURL = "";
    
    game.state.start("Load", true, false, resources, "LoadLocalSongs");
  }
}

class LoadLocalSongs {
  create() {
    this.progressText = new ProgressText("LOADING SONGS");
    this.songs = [];
    this.parser = new LocalSMParser();
    this.loadSongs();
    this.loadingDots = new LoadingDots();
  }
  async loadSongs() {
    
    try {
      // Define default song folders
      const defaultSongFolders = DEFAULT_SONG_FOLDERS;

      // Load each default song
      for (const folder of defaultSongFolders) {
        try {
          const song = await this.loadSong(folder);
          if (song) {
            this.songs.push(song);
          }
        } catch (error) {
          console.warn(`Failed to load song from ${folder}:`, error);
        }
      }

      // End
      this.finish();
      
    } catch (error) {
      console.error("Error loading songs:", error);
    }
  }
  async loadSong(folderName) {
    const baseUrl = `assets/songs/${folderName}/`;
    
    try {
      // Try to load .sm file with same name as folder
      let smUrl = baseUrl + folderName + '.sm';
      let smContent = await this.parser.loadTextFile(smUrl);
      
      // If that fails, look for any .sm file in the folder
      if (!smContent) {
        const alternativeNames = ['song.sm', 'chart.sm', 'steps.sm'];
        for (const name of alternativeNames) {
          smContent = await this.parser.loadTextFile(baseUrl + name);
          if (smContent) break;
        }
      }

      if (!smContent) {
        throw new Error(`No .sm file found in ${folderName}`);
      }

      // Parse the SM file
      const chart = await this.parser.parseSM(smContent, baseUrl);
      chart.folderName = folderName;
      chart.loaded = true;
      
      return chart;
      
    } catch (error) {
      console.warn(`Could not load song ${folderName}:`, error);
      return null;
    }
  }
  finish() {
    window.localSongs = this.songs;
    game.state.start("Title");
  }
}

class LoadExternalSongs {
  init(nextState, nextStateParams) {
    this.nextState = nextState || 'SongSelect';
    this.nextStateParams = nextStateParams || [];
  }
  
  create() {
    this.loadingDots = new LoadingDots();
    
    this.progressText = new ProgressText("LOADING EXTERNAL SONGS");
    
    this.fileSystem = new FileSystemTools();
    
    if (window.externalSongs) {
      this.songs = window.externalSongs;
      this.finish(window.lastExternalSongIndex || 0);
      return;
    }
    
    this.songs = [];
    this.parser = new ExternalSMParser();
    this.currentIndex = 0;
    this.loadedCount = 0;
    this.failedCount = 0;
    this.totalCount = 0;
    this.currentlyLoading = new Set();
    
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      this.loadSongsFromStorage();
    } else {
      this.showFileInput();
    }
  }

  async loadSongsFromStorage() {
    try {
      const rootDir = await this.fileSystem.getDirectory(EXTERNAL_DIRECTORY + SONGS_DIRECTORY);
      const allDirs = await this.fileSystem.listAllDirectories(rootDir);
      allDirs.unshift(rootDir);

      this.totalCount = allDirs.length;
      this.updateProgress();

      if (ENABLE_PARALLEL_LOADING) {
        await this.loadDirectoriesParallel(allDirs);
      } else {
        await this.loadDirectoriesSequential(allDirs);
      }

      this.finish();
      
    } catch (error) {
      console.warn("Error loading external songs:", error);
      this.showError("Failed to load external songs: " + error.message);
    }
  }

  async loadDirectoriesParallel(directories) {
    const batches = [];
    
    for (let i = 0; i < directories.length; i += MAX_PARALLEL_DOWNLOADS) {
      batches.push(directories.slice(i, i + MAX_PARALLEL_DOWNLOADS));
    }

    for (const batch of batches) {
      await this.processDirectoryBatch(batch);
    }
  }

  async processDirectoryBatch(batch) {
    const promises = batch.map(dir => this.processSongDirectoryWithTracking(dir));
    await Promise.allSettled(promises);
  }

  async loadDirectoriesSequential(directories) {
    for (const dir of directories) {
      await this.processSongDirectoryWithTracking(dir);
    }
  }

  async processSongDirectoryWithTracking(dirEntry) {
    const index = this.currentIndex;
    this.currentIndex ++;
    
    if (ENABLE_PARALLEL_LOADING && this.currentlyLoading.size >= MAX_PARALLEL_DOWNLOADS) {
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (this.currentlyLoading.size < MAX_PARALLEL_DOWNLOADS) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 10);
      });
    }

    const dirName = dirEntry.name || "Unknown Directory";
    this.currentlyLoading.add(dirName);

    try {
      const song = await this.processSongDirectory(dirEntry);
      
      if (!song) throw new Error("Song not loaded");
      
      song.index = index;
      if (song) {
        // Song loaded successfully!
        this.songs.push(song);
        this.loadedCount++;
      } else {
        // Failed to load song
        this.failedCount++;
      }
    } catch (error) {
      console.warn(`✗ Error in ${dirName}:`, error);
      this.failedCount++;
    } finally {
      this.currentlyLoading.delete(dirName);
      this.updateProgress();
    }
  }

  async processSongDirectory(dirEntry) {
    try {
      const files = await this.fileSystem.listFiles(dirEntry);
      const chartFiles = {};

      for (const fileEntry of files) {
        const file = await this.fileSystem.getFile(fileEntry);
        chartFiles[file.name.toLowerCase()] = file;
      }

      const chartFileNames = Object.keys(chartFiles).filter(name => 
        name.endsWith(".sm") || name.endsWith(".ssc")
      );

      if (chartFileNames.length === 0) {
        // No chart files the folder is empty or is not a chart folder
        return null;
      }

      for (const smFileName of chartFileNames) {
        try {
          // Try to parse the chart file
          const content = await this.fileSystem.readFileContent(chartFiles[smFileName]);
          const chart = await this.parser.parseSM(chartFiles, content);
          
          if (chart && chart.difficulties && chart.difficulties.length > 0) {
            // Chart file parsed successfully
            chart.folderName = dirEntry.name || `External_Song_${smFileName}`;
            chart.loaded = true;
            return chart;
          }
        } catch (parseError) {
          // Failed to parse, continue loading next chart
          console.warn(`Failed to parse ${smFileName}:`, parseError);
          continue;
        }
      }

      // All charts failed to load
      return null;
      
    } catch (error) {
      console.warn(`Error processing directory ${dirEntry.name}:`, error);
      return null;
    }
  }

  updateProgress() {
    const processed = this.loadedCount + this.failedCount;
    const progress = this.totalCount > 0 ? Math.round(processed / this.totalCount * 100) : 0;
    const loadingText = `${this.loadedCount}/${this.totalCount - this.failedCount} (${progress}%)`;
    
    this.progressText.write(loadingText);
  }

  showFileInput() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.webkitdirectory = true;
    fileInput.multiple = true;
    
    fileInput.onchange = (e) => {
      this.processFileInput(e.target.files);
    };
    
    fileInput.click();
  }

  async processFileInput(files) {
    try {
      const fileMap = {};
      for (let i = 0; i < files.length; i++) {
        fileMap[files[i].name.toLowerCase()] = files[i];
      }

      const directories = {};
      for (const file of files) {
        const path = file.webkitRelativePath;
        const dir = path.split('/')[0];
        if (!directories[dir]) {
          directories[dir] = {};
        }
        directories[dir][file.name.toLowerCase()] = file;
      }

      const dirNames = Object.keys(directories);
      this.totalCount = dirNames.length;
      this.updateProgress();

      if (ENABLE_PARALLEL_LOADING) {
        await this.processFileDirectoriesParallel(directories, dirNames);
      } else {
        await this.processFileDirectoriesSequential(directories, dirNames);
      }

      this.finish();
      
    } catch (error) {
      console.warn("Error processing file input:", error);
      this.showError("Failed to load songs from files: " + error.message);
    }
  }

  async processFileDirectoriesParallel(directories, dirNames) {
    const batches = [];
    
    for (let i = 0; i < dirNames.length; i += MAX_PARALLEL_DOWNLOADS) {
      batches.push(dirNames.slice(i, i + MAX_PARALLEL_DOWNLOADS));
    }

    for (const batch of batches) {
      await this.processFileDirectoryBatch(directories, batch);
    }
  }

  async processFileDirectoryBatch(directories, batch) {
    const promises = batch.map(dirName => this.processSongFilesWithTracking(directories[dirName], dirName));
    await Promise.allSettled(promises);
  }

  async processFileDirectoriesSequential(directories, dirNames) {
    for (const dirName of dirNames) {
      await this.processSongFilesWithTracking(directories[dirName], dirName);
    }
  }

  async processSongFilesWithTracking(files, folderName) {
    const index = this.currentIndex;
    this.currentIndex ++;
    
    if (ENABLE_PARALLEL_LOADING && this.currentlyLoading.size >= MAX_PARALLEL_DOWNLOADS) {
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (this.currentlyLoading.size < MAX_PARALLEL_DOWNLOADS) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 10);
      });
    }

    this.currentlyLoading.add(folderName);

    try {
      const song = await this.processSongFiles(files, folderName);
      song.index = index;
      if (song) {
        this.songs.push(song);
        this.loadedCount++;
      } else {
        this.failedCount++;
    }
    } catch (error) {
      console.warn(`✗ Error in ${folderName}:`, error);
      this.failedCount++;
    } finally {
      this.currentlyLoading.delete(folderName);
      this.updateProgress();
    }
  }

  async processSongFiles(files, folderName) {
    const chartFileNames = Object.keys(files).filter(name => 
      name.endsWith(".sm") || name.endsWith(".ssc")
    );
    
    if (chartFileNames.length === 0) {
      return null;
    }

    for (const smFileName of chartFileNames) {
      try {
        const content = await this.fileSystem.readFileContent(files[smFileName]);
        const chart = this.parser.parseSM(files, content);
        
        if (chart && chart.difficulties && chart.difficulties.length > 0) {
          chart.folderName = folderName;
          chart.loaded = true;
          return chart;
        }
      } catch (parseError) {
        console.warn(`Failed to parse ${smFileName}:`, parseError);
        continue;
      }
    }

    return null;
  }
  
  showError(message) {
    this.progressText.write(message);
    game.time.events.add(3000, () => {
      game.state.start("MainMenu");
    });
  }
  
  finish(resetIndex = 0) {
    if (this.songs.length === 0) {
      this.showError("No external songs found");
      return;
    }
    
    this.songs = this.songs.sort((a, b) => a.index - b.index)
    
    window.externalSongs = this.songs;
    
    if (this.nextStateParams.length) {
      game.state.start(this.nextState, true, false, ...this.nextStateParams);
    } else {
      game.state.start(this.nextState, true, false,  this.songs, null, false, "external");
    }
    
    setTimeout(() => window.lastExternalSongIndex = window.selectStartingIndex)
  }
}

class LoadSongFolder {
  create() {
    this.progressText = new ProgressText("SELECT SONG FOLDER");

    this.parser = new ExternalSMParser();
    this.showFileInput();
  }

  showFileInput() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.webkitdirectory = true;
    fileInput.multiple = true;

    fileInput.onchange = e => {
      this.processFiles(e.target.files);
    };
    
    fileInput.oncancel = e => {
      this.showError("Nothing selected");
    };

    // Add a fallback for non-webkit browsers
    if (!fileInput.webkitdirectory) {
      fileInput.multiple = true;
      this.progressText.write("Select all song files");
    }

    fileInput.click();
  }

  async processFiles(files) {
    try {
      this.progressText.write("LOADING SONG...");

      const fileMap = {};
      for (let i = 0; i < files.length; i++) {
        fileMap[files[i].name.toLowerCase()] = files[i];
      }

      // Find .sm file
      const chartFileNames = Object.keys(fileMap).filter(name => name.endsWith(".sm"));

      if (chartFileNames.length === 0) {
        this.showError("No .sm file found in selected folder");
        return;
      }

      const smFileName = chartFileNames[0];
      const content = await this.parser.readFileContent(fileMap[smFileName]);

      const chart = await this.parser.parseSM(fileMap, content);
      chart.folderName = `Single_External_${smFileName}`;
      chart.loaded = true;

      // Start gameplay directly with this single song
      game.state.start("SongSelect", true, false, [ chart ], 0, true);
    } catch (error) {
      console.error("Error loading song folder:", error);
      this.showError("Failed to load song");
    }
  }
  
  showError(message) {
    this.progressText.write(message);
    game.time.events.add(3000, () => {
      game.state.start("MainMenu");
    });
  }
}

class Title {
  create() {
    game.camera.fadeIn(0xffffff);
    
    this.background = new BackgroundGradient();
    this.lines = new FuturisticLines();
    this.logo = new Logo();
    
    this.inputInstructionText = new Text(game.width / 2, 80, "PRESS ANY KEY");
    this.inputInstructionText.anchor.x = 0.5;
    game.add.tween(this.inputInstructionText).to({ alpha: 0 }, 500, "Linear", true, 0, -1).yoyo(true);
    
    this.text = game.add.sprite(0, 0);
    
    this.creditText = new Text(2, 110, COPYRIGHT, this.text);
    this.creditText.anchor.y = 1;
    
    this.creditText = new Text(190, 110, VERSION, this.text);
    this.creditText.anchor.set(1);
    
    if (!backgroundMusic) {
      backgroundMusic = new BackgroundMusic();
    }
    backgroundMusic.playLastSong();
    
    this.introEnded = false;
    
    this.logo.intro(() => this.introEnded = true);

    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  update() {
    gamepad.update();
    
    if (this.introEnded && !this.outroStarted && gamepad.pressed.any) {
      this.outroStarted = true;
      this.text.alpha = 0;
      this.logo.outro(() => game.state.start('MainMenu'));
    }
  }
}

class MainMenu {
  create() {
    game.camera.fadeIn(0xffffff);
    
    this.futuristicLines = new FuturisticLines();
    this.backgroundGradient = new BackgroundGradient();
    this.navigationHint = new NavigationHint(0);
    
    // Check for feedback dialogs before showing menu
    this.checkInitialDialogs();
    
    this.previewCanvas = document.createElement("canvas");
    this.previewCtx = this.previewCanvas.getContext("2d");
    this.previewImg = new Image();
    
    // Only start music if it's not already playing from Title
    if (!backgroundMusic || !backgroundMusic.isPlaying) {
      if (!backgroundMusic) {
        backgroundMusic = new BackgroundMusic();
      }
      backgroundMusic.playLastSong();
    }
    
    // Dispose background music when player leaves 
    this.keepBackgroundMusic = false;
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  checkInitialDialogs() {
    // Check for bug report first (highest priority)
    if (!window.DEBUG && Account.stats.lastCrashed) {
      this.showBugReportDialog();
      return;
    }

    // Check for rating dialog
    if (!Account.stats.gameRated && Account.stats.totalTimePlayed >= RATING_PROMPT_MIN_PLAYTIME) {
      this.showRatingDialog();
      return;
    }

    // Check for feature request dialog
    if (!Account.stats.featureRequestPrompted && Account.stats.totalTimePlayed >= FEATURE_REQUEST_MIN_PLAYTIME) {
      this.showFeatureRequestDialog();
      return;
    }
    
    // Check for community dialog
    if (!Account.stats.wentToCommunity && Account.stats.totalTimePlayed >= COMMUNITY_PROMPT_MIN_PLAYTIME) {
      this.showCommunityDialog();
      return;
    }

    // No dialogs to show, proceed with normal menu
    this.menu();
  }

  showBugReportDialog() {
    this.confirmDialog(
      "Seems like the game crashed last time.\n" +
      "Sorry about that!!\n\n" +
      "As a solo developer, crash reports are super helpful for fixing issues.\n\n" +
      "Could you quickly report what you were doing when it crashed?\n",
      () => {
        // Open bug report page
        openExternalUrl(FEEDBACK_BUG_REPORT_URL);
        
        // Clear the flag and show menu
        Account.stats.lastCrashed = false;
        Account.stats.submittedBugReport = true;
        saveAccount();
        this.menu();
        
        // Force check achievements
        achievementsManager.checkAchievements();
      },
      () => {
        // User chose "Maybe Later" - just clear flag and show menu
        Account.stats.lastCrashed = false;
        saveAccount();
        this.menu();
      },
      "Report Bug",
      "Maybe Later"
    );
  }

  showRatingDialog() {
    this.confirmDialog(
      "Hey! You've been playing a while!\n\n" +
      "Do you like the game? Ratings really help keep me motivated.\n\n" +
      "Would you mind leaving a quick rating?\n",
      () => {
        // Rate Now
        openExternalUrl(FEEDBACK_REVIEW_URL);
        
        Account.stats.gameRated = true;
        saveAccount();
        this.menu();

        // Force check achievements
        achievementsManager.checkAchievements();        
      },
      () => {
        // No Thanks
        this.menu();
      },
      "Rate Now", 
      "No Thanks"
    );
  }

  showFeatureRequestDialog() {
    this.confirmDialog(
      "Thanks for playing!\n\n" +
      "I'm a solo developer, so hearing your ideas directly is incredibly valuable.\n\n" +
      "Got any feature requests or suggestions?\n" +
      "What would you like to see in the game?\n",
      () => {
        // Share ideas
        openExternalUrl(FEEDBACK_FEATURE_REQUEST_URL);
        
        Account.stats.featureRequestPrompted = true;
        saveAccount();
        this.menu();
        
        // Force check achievements
        achievementsManager.checkAchievements();
      },
      () => {
        // Not Now - ask again after more playtime
        Account.stats.totalTimePlayed = FEATURE_REQUEST_MIN_PLAYTIME - (30 * 60); // Ask again in 30 min
        saveAccount();
        this.menu();
      },
      "Share Ideas",
      "Not Now"
    );
  }
  
  showCommunityDialog() {
    this.confirmDialog(
      "Enjoying the game?\n" +
      "Join the community to download more charts, and share your creations and high scores with other players!\n",
      () => {
        // Join
        openExternalUrl(COMMUNITY_HOMEPAGE_URL);
        
        Account.stats.wentToCommunity = true;
        saveAccount();
        this.menu();
        
        // Force check achievements
        achievementsManager.checkAchievements();
      },
      () => {
        // No Thanks
        this.menu();
      },
      "Join", 
      "No Thanks"
    );
  }

  menu() {
    const manager = new WindowManager();
    this.manager = manager;
    
    this.showHomeMenu();
  }

  showHomeMenu() {
    const carousel = new CarouselMenu(0, 112 / 2 - 16, 112,   64, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    carousel.addItem("Rhythm Game", () => this.startGame());
    carousel.addItem("Character Select", () => {
      this.keepBackgroundMusic = true;
      game.state.start("CharacterSelect");
    });
    carousel.addItem("Chart Editor", () => this.openEditor());
    carousel.addItem("Settings", () => this.showSettings());
    carousel.addItem("Extras", () => this.showExtras());
    
    game.onMenuIn.dispatch('home', carousel);
    
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      carousel.addItem("Exit", () => this.confirmExit());
      carousel.onCancel.add(() => this.confirmExit());
    }
  }

  startGame() {
    const carousel = new CarouselMenu(0, 112 / 2 - 16, 112,   64, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    carousel.addItem("Free Play", () => this.freePlay());
    carousel.addItem("Extra Songs", () => this.showExtraSongs());
    game.onMenuIn.dispatch('startGame', carousel);
    carousel.addItem("< Back", () => this.showHomeMenu());
    carousel.onCancel.add(() => this.showHomeMenu());
  }

  showExtraSongs() {
    const carousel = new CarouselMenu(0, 112 / 2 - 16, 112,   64, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      carousel.addItem("User Songs", () => this.loadExternalSongs());
    }
    carousel.addItem("Load Single Song", () => this.loadSingleSong());
    
    if (window.externalSongs && (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS)) {
      carousel.addItem("Reload User Songs", () => {
        backgroundMusic.refreshCache();
        window.externalSongs = undefined;
        this.loadExternalSongs();
      });
    }
    
    game.onMenuIn.dispatch('extraSongs', carousel);
    carousel.addItem("< Back", () => this.startGame());
    carousel.onCancel.add(() => this.startGame());
  }

  showSettings() {
    const settingsWindow = this.manager.createWindow(3, 1, 18, 12, "1");
    settingsWindow.fontTint = 0x76fcde;
    
    // Volume setting
    settingsWindow.addSettingItem(
      "Volume",
      ["0%", "25%", "50%", "75%", "100%"], 
      Account.settings.volume,
      index => {
        Account.settings.volume = index;
        saveAccount();
        backgroundMusic.audio.volume = [0,25,50,75,100][index] / 100;
      }
    );
    
    // Auto-play setting
    settingsWindow.addSettingItem(
      "Auto-play",
      ["OFF", "ON"], 
      Account.settings.autoplay ? 1 : 0,
      index => {
        Account.settings.autoplay = index === 1;
        saveAccount();
      }
    );
    
    // Metronome setting
    const metronomeOptions = ['OFF', 'Note', 'Quarters', 'Eighths', 'Sixteenths', 'Thirty-seconds'];
    const currentMetronomeIndex = metronomeOptions.indexOf(Account.settings.metronome || 'OFF');
    settingsWindow.addSettingItem(
      "Metronome",
      metronomeOptions,
      currentMetronomeIndex,
      index => {
        Account.settings.metronome = metronomeOptions[index];
        saveAccount();
      }
    );
    
    // Visualizer setting
    const visualizerOptions = ['NONE', 'BPM', 'ACCURACY', 'AUDIO'];
    const currentVisualizerIndex = visualizerOptions.indexOf(Account.settings.visualizer || 'NONE');
    settingsWindow.addSettingItem(
      "Visualizer",
      visualizerOptions,
      currentVisualizerIndex,
      index => {
        Account.settings.visualizer = visualizerOptions[index];
        saveAccount();
      }
    );
    
    // Scroll direction
    settingsWindow.addSettingItem(
      "Scroll Direction",
      ["FALLING", "RISING"],
      Account.settings.scrollDirection === 'falling' ? 0 : 1,
      index => {
        Account.settings.scrollDirection = index === 0 ? 'falling' : 'rising';
        saveAccount();
      }
    );
    
    // Note colors
    const noteOptions = [
      { value: 'NOTE', display: 'NOTE' },
      { value: 'VIVID', display: 'VIVID' },
      { value: 'FLAT', display: 'FLAT' },
      { value: 'RAINBOW', display: 'RAINBOW' }
    ];
    const currentNoteIndex = noteOptions.findIndex(opt => opt.value === Account.settings.noteColorOption);
    settingsWindow.addSettingItem(
      "Note Colors",
      noteOptions.map(opt => opt.display),
      currentNoteIndex,
      index => {
        Account.settings.noteColorOption = noteOptions[index].value;
        saveAccount();
      }
    );

    // Note speed
    settingsWindow.addSettingItem(
      "Note Speed",
      ["Normal", "Double", "Triple", "Insane", "Sound Barrier", "Light Speed", "Faster than light"],
      Account.settings.noteSpeedMult - 1,
      index => {
        Account.settings.noteSpeedMult = index + 1;
        saveAccount();
      }
    );
    
    // Speed mod
    settingsWindow.addSettingItem(
      "Speed Mod",
      ["X-MOD", "C-MOD"],
      Account.settings.speedMod === 'C-MOD' ? 1 : 0,
      index => {
        Account.settings.speedMod = index === 1 ? 'C-MOD' : 'X-MOD';
        saveAccount();
      }
    );
    
    // Haptic feedback
    settingsWindow.addSettingItem(
      "Haptic Feedback",
      ["OFF", "ON"], 
      Account.settings.hapticFeedback ? 1 : 0,
      index => {
        Account.settings.hapticFeedback = index === 1;
        saveAccount();
      }
    );

    // Beat lines
    settingsWindow.addSettingItem(
      "Beat Lines",
      ["YES", "NO"],
      Account.settings.beatLines ? 0 : 1,
      index => {
        Account.settings.beatLines = index === 0;
        saveAccount();
      }
    );
    
    // Global offset
    const offsetOptions = [];
    for (let ms = -1000; ms <= 1000; ms += 25) {
      offsetOptions.push(`${ms}ms`);
    }
    const currentOffsetIndex = (Account.settings.userOffset + 1000) / 25;
    settingsWindow.addSettingItem(
      "Global Offset",
      offsetOptions,
      currentOffsetIndex,
      index => {
        Account.settings.userOffset = (index * 25) - 1000;
        saveAccount();
      }
    );
    
    // Menu music
    let menuMusicIndex = 0;
    if (Account.settings.enableMenuMusic) {
      menuMusicIndex = Account.settings.randomSong ? 1 : 0;
    } else {
      menuMusicIndex = 2;
    }
    settingsWindow.addSettingItem(
      "Menu Music",
      ["LAST SONG", "RANDOM SONG", "OFF"],
      menuMusicIndex,
      index => {
        switch (index) {
          case 0:
            Account.settings.randomSong = false;
            Account.settings.enableMenuMusic = true;
            break;
          case 1:
            Account.settings.randomSong = true;
            Account.settings.enableMenuMusic = true;
            break;
          case 2:
            Account.settings.enableMenuMusic = false;
            break;
        }
        saveAccount();
      }
    );
    
    // Renderer
    let restartNeeded = false;
    settingsWindow.addSettingItem(
      "Renderer",
      ["AUTO", "CANVAS", "WEBGL"],
      Account.settings.renderer,
      index => {
        Account.settings.renderer = index;
        saveAccount();
        restartNeeded = true;
      }
    );
    
    // Pixelated
    settingsWindow.addSettingItem(
      "Pixelated",
      ["YES", "NO"],
      Account.settings.pixelated ? 0 : 1,
      index => {
        Account.settings.pixelated = index == 0;
        restartNeeded = true;
        saveAccount();
      }
    );
    
    // Safe Mode
    settingsWindow.addSettingItem(
      "Safe Mode",
      ["ENABLED", "DISABLED"],
      Account.settings.safeMode ? 0 : 1,
      index => {
        restartNeeded = true;
        const enabled = index == 0;
        addonManager?.setSafeMode(enabled);
        saveAccount();
      }
    );
    
    // Dangerous actions
    settingsWindow.addItem("Erase Highscores", "", () => this.confirmEraseHighscores());
    settingsWindow.addItem("Restore Default Settings", "", () => this.confirmRestoreDefaults());
    
    game.onMenuIn.dispatch('settings', settingsWindow);
    
    settingsWindow.addItem("APPLY", "", () => {
      this.manager.remove(settingsWindow, true);
      if (restartNeeded) {
        this.confirmRestart();
      } else {
        this.showHomeMenu();
      }
    }, true);
  }

  showExtras() {
    const carousel = new CarouselMenu(0, 112 / 2 - 16, 112,   64, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      carousel.addItem("Addon Manager", () => this.showAddonManager());
    }
    carousel.addItem("Jukebox", () => this.startJukebox());
    carousel.addItem("Offset Assistant", () => this.startOffsetAssistant());
    carousel.addItem("Achievements", () => this.showAchievements());
    carousel.addItem("Player Stats", () => this.showStats());
    carousel.addItem("Feedback", () => this.showFeedback());
    carousel.addItem("Comunity", () => this.showCommunity());
    carousel.addItem("Credits", () => this.showCredits());
    
    game.onMenuIn.dispatch('extras', carousel);
    carousel.addItem("< Back", () => this.showHomeMenu());
    carousel.onCancel.add(() => this.showHomeMenu());
  }

  showFeedback() {
    const carousel = new CarouselMenu(0, 112 / 2 - 16, 112,   64, {
      align: 'left',
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      animate: true,
      crop: false
    });
    
    const openLink = url => {
      openExternalUrl(url);
      this.showFeedback();
    };
    
    carousel.addItem("Leave A Review", () => openLink(FEEDBACK_REVIEW_URL));
    carousel.addItem("Feature Request", () => openLink(FEEDBACK_FEATURE_REQUEST_URL));
    carousel.addItem("Bug Report", () => openLink(FEEDBACK_BUG_REPORT_URL));
    
    game.onMenuIn.dispatch('feedback', carousel);
    carousel.addItem("< Back", () => this.showExtras());
    carousel.onCancel.add(() => this.showExtras());
  }
  
  showCommunity() {
    openExternalUrl(COMMUNITY_HOMEPAGE_URL);
    
    Account.stats.wentToCommunity = true;
    saveAccount();
    
    this.menu();
  }
  
  showAddonManager() {
    // TODO: Clean addon manager interface and logic 
    const detailText = new Text(4, 4, "");
    
    const preview = game.add.sprite(112, 4);
      
    const showInstalledAddons = () => {
      const addons = addonManager.getAddonList();
      const carousel = new CarouselMenu(192 / 2, 112 / 2, 192 / 2, 112 / 2, {
        align: 'left',
        bgcolor: 'brown',
        fgcolor: '#ffffff',
        animate: true,
        crop: false
      });
      
      if (addons.length === 0) {
        carousel.addItem("No addons installed", () => {});
      } else {
        addons.forEach(addon => {
          const statusColor = addon.isHibernating ? "gray" : (addon.isEnabled ? "#00cc00" : "brown")
          carousel.addItem(
            `${addon.name} v${addon.version}`,
            () => showAddonDetails(addon),
            { addon, bgcolor: statusColor }
          );
        });
        
        carousel.onSelect.add((index, item) => {
          if (item.data && item.data.addon) {
            previewAddon(item.data.addon);
          }
        });
        
        previewAddon(addons[0]);
      }
      
      game.onMenuIn.dispatch('addons', carousel);
      
      carousel.addItem("< Back", () => applyChanges());
      carousel.onCancel.add(() => applyChanges());
    };
    
    let needsReload = false;
    
    const previewAddon = (addon) => {
      detailText.write(
        `${addon.name}\n` +
        `V${addon.version}\n` +
        `By ${addon.author}\n` +
        `BEHAVIORS:${addon.behaviors ? Object.keys(addon.behaviors).length : 0}\n` +
        `ASSETS:${addon.assets ? addon.assets.length : 0}\n\n` +
        `${addon.description}\n` +
        'STATE: ' + 
        (addon.isHibernating ?
          'Hybernating'
          :
        (addon.isEnabled ?
          'Enabled' : 'Disabled')) + '\n'
      ).wrap(112);
      if (addon.icon) {
        this.previewImg.src = addon.icon;
        this.previewImg.onload = () => {
          this.previewCtx.drawImage(this.previewImg, 0, 0, 50, 50);
          preview.loadTexture(PIXI.Texture.fromCanvas(this.previewCanvas));
        };
      }
    }
    
    const showAddonDetails = (addon) => {
      const carousel = new CarouselMenu(192 / 2, 112 / 2, 192 / 2, 112 / 2, {
        align: 'left',
        bgcolor: '#9b59b6',
        fgcolor: '#ffffff',
        animate: true,
        crop: false
      });
      
      if (addon.isHibernating) {
        carousel.addItem("Wake Addon", () => {
          addonManager.wakeAddon(addon.id);
          needsReload = true;
          showInstalledAddons();
        });
      } else if (addon.isEnabled) {
        carousel.addItem("Disable Addon", () => {
          addonManager.disableAddon(addon.id);
          needsReload = true;
          showInstalledAddons();
        });
        carousel.addItem("Hibernate Addon", () => {
          addonManager.hibernateAddon(addon.id);
          needsReload = true;
          showInstalledAddons();
        });
      } else {
        carousel.addItem("Enable Addon", () => {
          addonManager.enableAddon(addon.id);
          needsReload = true;
          showInstalledAddons();
        });
      }
      
      carousel.addItem("Uninstall Addon", () => this.confirmDialog("The addon folder will be removed. Continue?", () => {
        addonManager.uninstallAddon(addon.id);
        needsReload = true;
        showInstalledAddons();
      }, () => showInstalledAddons()));
      
      game.onMenuIn.dispatch('addonDetails', carousel);
      
      carousel.addItem("< Back", () => showInstalledAddons());
      carousel.onCancel.add(() => showInstalledAddons());
    };
    
    const applyChanges = () => {
      if (needsReload || addonManager.needsReload()) {
        this.confirmDialog("Reload required. Restart now?", () => {
          location.reload();
        }, () => {
          preview.destroy();
          detailText.destroy();
          this.menu();
        });
      } else {
        preview.destroy();
        detailText.destroy();
        this.menu();
      }
    };
    
    showInstalledAddons();
  }

  confirmDialog(message, onConfirm, onCancel, confirmText = "Yes", cancelText = "No") {
    const dialog = new DialogWindow(message, {
      buttons: [confirmText, cancelText]
    });
    
    dialog.onConfirm.add((buttonIndex, buttonText) => {
      if (buttonIndex === 0) {
        onConfirm?.();
      } else {
        onCancel?.();
      }
      dialog.destroy();
    });
    
    dialog.onCancel.add(() => {
      onCancel?.();
      dialog.destroy();
    });
    
    return dialog;
  }

  confirmExit() {
    this.confirmDialog(
      "Are you sure you want to exit the game?",
      () => {
        switch (CURRENT_ENVIRONMENT) {
          case ENVIRONMENT.CORDOVA:
            navigator.app.exitApp();
            break;
          case ENVIRONMENT.NWJS:
            nw?.App?.quit?.();
            break;
        }
      },
      () => this.showHomeMenu(),
      "Exit",
      "Cancel"
    );
  }

  confirmEraseHighscores() {
    this.confirmDialog(
      "This will permanently erase all your high scores.\nThis action cannot be undone!\n\nAre you sure?",
      () => {
        Account.highScores = {};
        saveAccount();
        notifications.show("High scores erased!");
        this.showSettings();
      },
      () => this.showSettings(),
      "Erase",
      "Cancel"
    );
  }

  confirmRestoreDefaults() {
    this.confirmDialog(
      "All settings will be restored to their default values.\nThe game will need to restart.\n\nContinue?",
      () => {
        Account.settings = DEFAULT_ACCOUNT.settings;
        saveAccount();
        window.location.reload();
      },
      () => this.showSettings(),
      "Restore",
      "Cancel"
    );
  }

  confirmRestart() {
    this.confirmDialog(
      "Settings changed require a restart to take effect.\nRestart now?",
      () => location.reload(),
      () => this.showHomeMenu(),
      "Restart",
      "Later"
    );
  }

  freePlay() {
    game.state.start("SongSelect", true, false, window.localSongs, null, false, "local");
  }

  startOffsetAssistant() {
    const offsetAssistant = new OffsetAssistant(game);
    game.add.existing(offsetAssistant);
  }

  loadExternalSongs() {
    game.state.start("LoadExternalSongs");
  }

  loadSingleSong() {
    game.state.start("LoadSongFolder");
  }

  startJukebox() {
    if (CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT == ENVIRONMENT.NWJS) {
      if (!window.externalSongs) {
        this.confirmDialog(
          "Load extra songs from external storage?",
          () => {
            game.state.start("LoadExternalSongs", true, false, "Jukebox", [undefined, undefined]);
          },
          () => {
            game.state.start("Jukebox");
          },
          "Load Songs",
          "Skip"
        );
      } else {
        game.state.start("Jukebox");
      }
    } else {
      game.state.start("Jukebox");
    }
  }
  
  openEditor() {
    game.state.start("Editor", true, false, window.editorSongData || null);
  }

  showAchievements() {
    game.state.start("AchievementsMenu");
  }

  showStats() {
    game.state.start("StatsMenu");
  }

  showCredits() {
    game.state.start("Credits", true, false, "MainMenu");
  }

  update() {
    gamepad.update();
    this.manager?.update();
  }

  shutdown() {
    if (backgroundMusic && !this.keepBackgroundMusic) {
      backgroundMusic.destroy();
      backgroundMusic = null;
    }
  }
}

class SongSelect {
  init(songs, index, autoSelect, type = "auto") {
    this.type = type;
    
    switch (type) {
      case "local":
        this.songs = songs || window.localSongs || [];
        this.startingIndex = index || Account.songSelectStartingIndex.local || 0;
        break;
      case "external":
        this.songs = songs || window.externalSongs || [];
        this.startingIndex = index || Account.songSelectStartingIndex.external || 0;
        break;
      case "auto":
      default:
        this.songs = songs || window.selectedSongs || [];
        this.startingIndex = index || window.selectStartingIndex || 0;
        break;
    }
    
    window.selectedSongs = this.songs;
    
    this.autoSelect = autoSelect || false;
    
    if (this.startingIndex + 1 > this.songs.length) {
      this.startingIndex = 0;
    } 
  }
  
  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    
    new BackgroundGradient();
    
    this.selectedSong = null;
    this.selectedDifficulty = 0;
    
    // Stop any background music when entering song selection
    if (backgroundMusic) {
      backgroundMusic.stop();
    }
    
    this.previewAudio = document.createElement("audio");
    this.previewAudio.volume = [0,25,50,75,100][Account.settings.volume] / 100;
    
    this.bannerImg = document.createElement("img");
    
    this.previewCanvas = document.createElement("canvas");
    this.previewCtx = this.previewCanvas.getContext("2d");
    
    this.navigationHint = new NavigationHint(2);
    
    this.autoplayText = new Text(4, 104, "");
    
    this.bannerSprite = game.add.sprite(4, 4, null);

    this.metadataText = new Text(102, 4, "");
    
    this.highScoreText = new Text(104, 50, "");
    
    this.loadingDots = new LoadingDots();
    this.loadingDots.visible = false;
    
    this.visibilityChangeListener = () => {
      if (document.hidden) {
        this.previewAudio?.pause();
      } else {
        this.previewAudio?.play();
      }
    };
    
    window.addEventListener('visibilitychange', this.visibilityChangeListener);
    
    this.createSongSelectionMenu();
    
    if (this.autoSelect) {
      this.selectSong(this.songs[this.songCarousel.selectedIndex], this.songCarousel.selectedIndex);
      this.songCarousel.destroy();
      this.autoSelect = false;
    }
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  createSongSelectionMenu() {
    const x = 0;
    const y = 35;
    const width = game.width / 2;
    const height = 72;

    this.songCarousel = new CarouselMenu(x, y, width, height, {
      bgcolor: "#9b59b6",
      fgcolor: "#ffffff",
      align: "left",
      animate: true,
      margin: { left: 2 }
    });

    // Add songs to carousel
    if (this.songs.length === 0) {
      this.songCarousel.addItem("No songs found", null);
    } else {
      this.songs.forEach((song, index) => {
        const title = song.titleTranslit || song.title;
        const displayText = title ? title : `Song ${index + 1}`;
        
        this.songCarousel.addItem(
          displayText,
          (item) => {
            this.selectSong(song, index);
          },
          { song: song, index: index }
        );
      });
    }
    
    game.onMenuIn.dispatch('songList', this.songCarousel);
    
    // Move to the starting index
    this.songCarousel.selectedIndex = this.startingIndex;
    this.songCarousel.updateSelection();

    // Handle carousel events
    this.songCarousel.onSelect.add((index, item) => {
      if (item.data && item.data.song) {
        this.previewSong(item.data.song);
        
        
      }
    });

    this.songCarousel.onCancel.add(() => {
      game.state.start("MainMenu");
    });
    
    // Preview song if available
    if (this.songs.length > 0) {
      this.previewSong(this.songs[this.songCarousel.selectedIndex]);
    }
  }

  previewSong(song) {
    let index = this.songCarousel.selectedIndex;
    
    if (song.audioUrl) {
      // Load and play preview
      this.previewAudio.src = song.audioUrl;
      this.previewAudio.currentTime = song.sampleStart || 0;
      this.previewAudio.play();
    }
    
    this.previewCtx.clearRect(0, 0, 192, 112);
    this.bannerSprite.loadTexture(PIXI.Texture.fromCanvas(this.previewCanvas));
    
    if (song.bannerUrl) {
      if (!this.autoSelect) this.loadingDots.visible = true;
      this.bannerImg.src = song.bannerUrl;
      this.bannerImg.onload = () => {
        if (index == this.songCarousel.selectedIndex) this.loadingDots.visible = false;
        
        this.previewCtx.drawImage(this.bannerImg, 0, 0, 96, 32);
        
        const texture = PIXI.Texture.fromCanvas(this.previewCanvas);
        
        this.bannerSprite.loadTexture(texture);
      };
      this.bannerImg.onerror = () => this.loadingDots.visible = false;
    }
    
    this.metadataText.write(this.getMetadataText(song));
    this.metadataText.wrapPreserveNewlines(80);
    
    this.displayHighScores(song);
    
    this.startingIndex = this.songCarousel.selectedIndex;
    window.selectStartingIndex = this.startingIndex;
    
    if (this.type === "local") {
      Account.songSelectStartingIndex.local = this.startingIndex;
    } else {
      Account.songSelectStartingIndex.external = this.startingIndex;
    }
  }
  
  displayHighScores(song) {
    const songKey = this.getSongKey(song);
    const highScores = Account.highScores[songKey];
    
    if (!highScores) {
      if (this.highScoreText) {
        this.highScoreText.write("NO HIGH SCORES");
      }
      return;
    }
    
    let highScoreText = "HIGH SCORES:\n";
    
    // Show best score for each difficulty
    song.difficulties.forEach((diff, index) => {
      const diffKey = `${diff.type}${diff.rating}`;
      const scoreData = highScores[diffKey];
      
      if (scoreData) {
        highScoreText += `${diff.type}: ${scoreData.score.toLocaleString()} (${scoreData.rating})\n`;
      } else {
        highScoreText += `${diff.type}: ---\n`;
      }
    });
    
    this.highScoreText.write(highScoreText);
  }
  
  getSongKey(song) {
    if (song.folderName) {
      return `local_${song.folderName}`;
    } else if (song.audioUrl) {
      let hash = 0;
      for (let i = 0; i < song.audioUrl.length; i++) {
        const char = song.audioUrl.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return `external_${hash.toString(36)}`;
    }
    return `unknown_${Date.now()}`;
  }
  
  getMetadataText(data) {
    const title = data.titleTranslit || data.title;
    const subtitle = data.subtitleTranslit || data.subtitle;
    const artist = data.artistTranslit || data.artist;
    const genre = data.genre;
    const credit = data.credit;
    
    let text = "";
    
    if (title) text += title + '\n';
    if (subtitle) text += subtitle + '\n';
    if (artist) text += 'Artist: ' + artist + '\n';
    //if (genre) text += genre + '\n';
    if (credit) text += 'Credit: ' + credit;
    
    return text;
  }

  selectSong(song, index) {
    this.selectedSong = song;
    this.selectedDifficulty = 0;
    
    // Show difficulty selection
    this.showDifficultySelection(song);
  }

  showDifficultySelection(song) {
    const x = 0;
    const y = 37;
    const width = game.width / 2;
    const height = game.height;

    this.difficultyCarousel = new CarouselMenu(x, y, width, height, {
      bgcolor: "#e67e22",
      fgcolor: "#ffffff",
      align: "center",
      animate: true
    });
    
    this.difficultyCarousel.onSelect.add((index) => {
      song.lastDifficultySelectedIndex = index;
    });
    
    if (song.lastDifficultySelectedIndex) {
      this.difficultyCarousel.selectIndex(song.lastDifficultySelectedIndex);
    }
    
    game.onMenuIn.dispatch('difficulty', this.songCarousel);
    
    // Add difficulties
    song.difficulties.sort((a, b) => a.rating - b.rating).forEach((diff, index) => {
      this.difficultyCarousel.addItem(
        `${diff.type} (${diff.rating})`,
        (item) => {
          this.startGame(song, index);
        },
        {
          difficulty: diff,
          index: index,
          bgcolor: this.getDifficultyColor(parseInt(diff.rating))
        }
      );
    });

    this.difficultyCarousel.onCancel.add(() => {
      this.createSongSelectionMenu();
    });
  }

  getDifficultyColor(value) {
    const max = 11; // The actual maximum considered difficulty
    
    // Ensure the value is within the range [0, max]
    value = Math.max(0, Math.min(max, value));

    // Extract the RGB components of the start and end colors
    var startColor = { r: 25, g: 210, b: 25 };
    var endColor = { r: 210, g: 0, b: 0 };

    // Interpolate between the start and end colors
    var r = Math.floor(startColor.r + (endColor.r - startColor.r) * (value / max));
    var g = Math.floor(startColor.g + (endColor.g - startColor.g) * (value / max));
    var b = Math.floor(startColor.b + (endColor.b - startColor.b) * (value / max));

    // Combine the RGB components into a single tint value
    const hexR = Phaser.Color.componentToHex(r);
    const hexG = Phaser.Color.componentToHex(g);
    const hexB = Phaser.Color.componentToHex(b);
    
    return `#${hexR}${hexG}${hexB}`;
  }

  startGame(song, difficultyIndex) {
    // Start gameplay with selected song
    game.state.start("Play", true, false, {
      chart: song,
      difficultyIndex
    });
  }

  update() {
    gamepad.update();
    
    if (this.songCarousel) {
      this.songCarousel.update();
    }
    
    if (this.difficultyCarousel) {
      this.difficultyCarousel.update();
    }
    
    if (gamepad.pressed.select) {
      Account.settings.autoplay = !Account.settings.autoplay;
    }
    
    this.autoplayText.write(Account.settings.autoplay ? "AUTOPLAY" : "");
  }
  
  shutdown() {
    this.previewAudio.pause();
    this.previewAudio.src = null;
    this.bannerImg.src = "";
    this.bannerImg = null;
    this.previewCanvas = null;
    this.previewCtx = null;
    window.removeEventListener("visibilitychange", this.visibilityChangeListener);
  }
}

class CharacterSelect extends Phaser.State {
  create() {
    game.camera.fadeIn(0x000000);

    this.characterManager = new CharacterManager();
    this.selectedCharacter = this.characterManager.getCurrentCharacter();

    new Background('ui_lobby_background', false, 1);
    new Background('ui_lobby_overlay', true, 0.3, 0.5);
    new FuturisticLines();

    this.navigationHint = new NavigationHint(0);

    this.createUI();
    this.updateDisplay();
  }

  createUI() {
    // Create all UI elements that persist throughout the state
    this.characterDisplay = new CharacterDisplay(46, 6, this.selectedCharacter);
    this.createDetailsText();
    
    // Initialize menus as null
    this.actionMenu = null;
    this.customizationMenu = null;
    this.skillsCarousel = null;
    this.creationMenu = null;
    this.characterCarousel = null;

    // Show initial state
    this.showHomeUI();
  }

  createDetailsText() {
    // Create text display for character details
    this.nameText = new Text(115, 10, "", FONTS.shaded);
    this.levelText = new Text(140, 10, "", FONTS.default);
    this.selectedSkillText = new Text(115, 34, "", FONTS.default);
    this.skillDescriptionText = new Text(117, 42, "", FONTS.default);
    
    // Create experience bar and skill bar
    this.expBar = new ExperienceBar(140, 16, 36, 3);
    this.skillBar = new SkillBar(117, 18);
  }
  
  showHomeUI() {
    // Clear any existing menus
    this.clearAllMenus();
    
    // Show character details
    this.showCharacterDetails();
    
    // Create character list
    this.showCharacterList();
    
    // Update display with current character
    this.updateDisplay();
  }
  
  clearAllMenus() {
    // Destroy all menus
    if (this.characterCarousel) {
      this.characterCarousel.destroy();
      this.characterCarousel = null;
    }
    if (this.actionMenu) {
      this.actionMenu.destroy();
      this.actionMenu = null;
    }
    if (this.customizationMenu) {
      this.customizationMenu.destroy();
      this.customizationMenu = null;
    }
    if (this.skillsCarousel) {
      this.skillsCarousel.destroy();
      this.skillsCarousel = null;
    }
    if (this.creationMenu) {
      this.creationMenu.destroy();
      this.creationMenu = null;
    }
    
    // Remove any input handlers
    gamepad.signals.pressed.any.removeAll();
  }
  
  writeCharacterInformation() {
    const char = this.selectedCharacter;
    
    // Name
    this.nameText.write(char ? char.name : "");
    this.nameText.bringToTop();
    
    // Level and experience
    const expText = char ? `${char.experience}/${char.getRequiredExperience()}` : "";
    this.levelText.write(char ? `Lv. ${char.level}` : "");
    this.levelText.bringToTop();
    
    // Update experience bar
    if (char) {
      this.expBar.setProgress(char.getExperienceProgress());
      this.expBar.bringToTop();
      this.expBar.visible = true;
    } else {
      this.expBar.visible = false;
    }
    
    // Skill level
    if (char) {
      this.skillBar.value = char.skillLevel;
      this.skillBar.update();
      this.skillBar.bringToTop();
      this.skillBar.visible = true;
    } else {
      this.skillBar.visible = false;
    }
    
    // Selected skill info
    if (char && char.selectedSkill) {
      const skill = CHARACTER_SKILLS.find(s => s.id === char.selectedSkill);
      if (skill) {
        this.selectedSkillText.write(skill.name);
        this.skillDescriptionText.write(skill.description);
        this.skillDescriptionText.wrapPreserveNewlines(70);
        this.selectedSkillText.bringToTop();
        this.skillDescriptionText.bringToTop();
      } else {
        this.selectedSkillText.write("");
        this.skillDescriptionText.write("< NO SKILL >");
        this.skillDescriptionText.bringToTop();
      }
    } else {
      this.selectedSkillText.write("");
      this.skillDescriptionText.write(char ? "< NO SKILL >" : "< NO CHARACTER >");
      this.selectedSkillText.bringToTop();
    }
  }

  selectCharacter(character) {
    this.selectedCharacter = character;
    this.updateDisplay();
  }

  updateDisplay() {
    // Update character display
    if (this.characterDisplay) {
      this.characterDisplay.destroy();
    }
    this.characterDisplay = new CharacterDisplay(46, 6, this.selectedCharacter);

    if (this.characterCarousel) {
      this.characterCarousel.bringToTop();
    }

    // Update details text
    this.writeCharacterInformation();
  }

  showCharacterList() {
    // Character list carousel (left)
    this.characterCarousel = new CarouselMenu(0, 8, 80, 104, {
      bgcolor: "#9b59b6",
      fgcolor: "#ffffff",
      align: "left",
      animate: true
    });

    // Add characters to carousel
    let index = 0;
    this.characterManager.getCharacterList().forEach(character => {
      const isCurrent = this.selectedCharacter && character.name === this.selectedCharacter.name;
      this.characterCarousel.addItem(isCurrent ? `> ${character.name}` : `  ${character.name}`, () => {
        this.selectCharacter(character);
        this.showActionMenu();
      }, {
        character: character,
        bgcolor: isCurrent ? "#e74c3c" : "#9b59b6"
      });
      if (isCurrent) {
        this.characterCarousel.selectIndex(index);
      }
      index++;
    });
    
    // Add Unselect option
    this.characterCarousel.addItem("× NO CHARACTER", () => {
      this.selectedCharacter = null;
      this.characterManager.unsetCharacter();
      this.showHomeUI();
    }, {
      bgcolor: this.selectedCharacter ? "#9b59b6" : "#e74c3c"
    });
    
    if (!this.selectedCharacter) this.characterCarousel.selectIndex(index);
    
    // Add "Add Character" option
    this.characterCarousel.addItem("+ ADD CHARACTER", () => this.startCharacterCreation());

    // Set up proper navigation
    this.characterCarousel.onSelect.add((index, item) => {
      this.selectCharacter(item.data.character || null);
    });
    
    this.showCharacterDetails();
    
    this.characterCarousel.onCancel.add(() => {
      game.state.start("MainMenu");
    });
  }

  showActionMenu() {
    this.clearAllMenus();
    this.hideCharacterDetails();

    this.actionMenu = new CarouselMenu(60, 60, 72, 48, {
      bgcolor: "#34495e",
      fgcolor: "#ffffff",
      align: "center",
      activeAlpha: 1,
      inactiveAlpha: 0.5
    });

    this.actionMenu.addItem("SELECT", () => this.confirmSelection());
    if (this.selectedCharacter.unlockedSkills.length) this.actionMenu.addItem("SET SKILL", () => this.setSkill());
    this.actionMenu.addItem("CUSTOMIZE", () => this.customizeCharacter());
    this.actionMenu.addItem("DELETE", () => this.deleteCharacter());

    // Proper cancel handling
    this.actionMenu.onCancel.add(() => {
      this.showHomeUI();
    });
  }

  confirmSelection() {
    this.characterManager.setCurrentCharacter(this.selectedCharacter.name);
    this.showCharacterList();
  }

  setSkill() {
    // Hide character details
    this.hideCharacterDetails();
    
    // Create skill preview text
    this.skillPreviewText = new Text(110, 4, "", FONTS.default);
    this.skillPreviewText.wrapPreserveNewlines(70);
    
    this.skillsCarousel = new CarouselMenu(0, 8, 80, 104, {
      bgcolor: "#9b59b6",
      fgcolor: "#ffffff",
      align: "left",
      animate: true
    });
    
    let i = 0;
    let selectedIndex = 0;
    
    this.selectedCharacter.unlockedSkills.forEach(skillId => {
      const skill = CHARACTER_SKILLS.find(s => s.id === skillId);
      if (skill) {
        const isCurrent = this.selectedCharacter.selectedSkill === skillId;
        if (isCurrent) selectedIndex = i;
        i++;
        this.skillsCarousel.addItem(isCurrent ? `> ${skill.name}` : `  ${skill.name}`, (item) => {
          this.selectedCharacter.selectedSkill = item.data.skillId;
          this.updateSkillPreview(item.data.skillId);
          this.skillsCarousel.destroy();
          this.skillsCarousel = null;
          this.skillPreviewText.destroy();
          this.setSkill();
        }, {
          skillId: skillId,
          bgcolor: isCurrent ? "#e74c3c" : "#9b59b6"
        });
      }
    });
    
    this.skillsCarousel.selectIndex(selectedIndex);
    
    // Set up navigation
    this.skillsCarousel.onSelect.add((index, item) => {
      this.updateSkillPreview(item.data.skillId);
    });
    
    this.skillsCarousel.onCancel.add(() => {
      this.skillsCarousel.destroy();
      this.skillsCarousel = null;
      this.skillPreviewText.destroy();
      this.showActionMenu();
    });
    
    // Update preview with first skill
    if (this.selectedCharacter.unlockedSkills.length > 0) {
      this.updateSkillPreview(this.selectedCharacter.unlockedSkills[0]);
    }
  }
  
  updateSkillPreview(skillId) {
    const skill = CHARACTER_SKILLS.find(s => s.id === skillId);
    if (!skill) return;
    
    let previewText = `${skill.name}\n\n`;
    previewText += `${skill.description}\n\n`;
    
    // Add effect details
    previewText += "EFFECT:\n";
    switch (skill.effect) {
      case 'convert_judgement':
        previewText += `• Converts ${skill.effectParams.from} to ${skill.effectParams.to}\n`;
        break;
      case 'modify_judgement_window':
        previewText += `• Judgement window ×${skill.effectParams.multiplier}\n`;
        break;
      case 'health_regen':
        previewText += `• +${skill.effectParams.amount} HP every ${skill.effectParams.interval/1000}s\n`;
        break;
      case 'modify_max_health':
        previewText += `• +${skill.effectParams.amount} Max HP\n`;
        break;
      case 'modify_note_speed':
        previewText += `• Note speed ×${skill.effectParams.multiplier}\n`;
        break;
      case 'modify_hold_forgiveness':
        previewText += `• Hold forgiveness ×${skill.effectParams.multiplier}\n`;
        break;
      case 'modify_roll_forgiveness':
        previewText += `• Roll forgiveness ×${skill.effectParams.multiplier}\n`;
        break;
      case 'reduce_mine_damage':
        previewText += `• Reduces mine damage by ×${100 - 100 * skill.effectParams.multiplier}%\n`;
        break;
      case 'modify_score_gain':
        previewText += `• ${skill.effectParams.judgement} Score ×${skill.effectParams.multiplier}\n`;
        break;
      case 'modify_health_gain':
        previewText += `• Health gain ×${skill.effectParams.multiplier}\n`;
        break;
      case 'combo_shield':
        previewText += `• Enables Combo Shield\n`;
        break;
      case 'modify_input_lag':
        previewText += `• Modifies Input Lag\n`;
        break;
      case 'burst_health_regen':
        previewText += `• Gives ${skill.effectParams.amount}% Burts health regeneration\n`;
        break;
      case 'stabilize_judgement':
        previewText += `• Judgement Stabilization\n`;
        break;
      case 'general_boost':
        previewText += `• General Boost\n`;
        break;
    }
    
    // Add activation details
    previewText += "\nACTIVATION:\n";
    switch (skill.activationCondition) {
      case 'on_miss':
        previewText += "• When you get a Miss judgement\n";
        break;
      case 'on_combo':
        previewText += `• When combo reaches ${skill.effectParams.threshold}\n`;
        break;
      case 'on_low_health':
        previewText += `• When health drops below ${skill.effectParams.threshold}%\n`;
        break;
      case 'on_high_combo':
        previewText += `• When combo reaches ${skill.effectParams.threshold}\n`;
        break;
      case 'on_perfect_streak':
        previewText += `• After ${skill.effectParams.threshold} perfect notes in a row\n`;
        break;
      case 'on_critical_health':
        previewText += `• When health drops below ${skill.effectParams.threshold}%\n`;
        break;
      case 'on_mine_hit':
        previewText += `• Before hitting a mine\n`;
        break;
      case 'custom':
        previewText += `• ${skill.activationText || 'Custom'}`;
        break;
    }
    
    // Add duration and cooldown
    if (skill.duration > 0) {
      previewText += `\nDURATION: ${skill.duration/1000}s\n`;
    }
    if (skill.cooldown > 0) {
      previewText += `COOLDOWN: ${skill.cooldown/1000}s\n`;
    }
    
    this.skillPreviewText.write(previewText);
    this.skillPreviewText.wrapPreserveNewlines(80);
    
    this.skillPreviewText.bringToTop();
  }

  customizeCharacter() {
    this.showCustomizationMenu();
  }

  showCustomizationMenu() {
    this.clearAllMenus();

    this.customizationMenu = new CarouselMenu(10, 60, 172, 48, {
      bgcolor: "#2c3e50",
      fgcolor: "#ffffff",
      align: "center",
      activeAlpha: 1,
      inactiveAlpha: 0.6
    });

    this.customizationMenu.addItem("SKIN TONE", () => this.customizeSkinTone());
    this.customizationMenu.addItem("HAIR COLOR", () => this.customizeHairColor());
    this.customizationMenu.addItem("FRONT HAIR", () => this.customizeHairStyle("frontHair"));
    this.customizationMenu.addItem("BACK HAIR", () => this.customizeHairStyle("backHair"));
    this.customizationMenu.addItem("CLOTHING", () => this.customizeClothing());
    this.customizationMenu.addItem("ACCESSORY", () => this.customizeAccessory());
    this.customizationMenu.addItem("APPLY", () => this.finishCustomization());

    // Proper cancel handling
    this.customizationMenu.onCancel.add(() => {
      this.characterDisplay.updateAppearance(this.originalAppearance);
      this.showActionMenu();
    });

    // Store original appearance for cancellation
    this.originalAppearance = { ...this.selectedCharacter.appearance };
  }
  
  createGradientBackground(x, y, width, height, color) {
    const bitmap = game.add.bitmapData(width, height);
    
    const gradient = bitmap.context.createLinearGradient(width, 0, 0, 0);
    
    const bgcolor = color || "rgba(44, 90, 198, 0.6)";
    
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.3, bgcolor);
    gradient.addColorStop(0.7, bgcolor);
    gradient.addColorStop(1, 'transparent');
    
    bitmap.context.fillStyle = gradient;
    bitmap.context.fillRect(0, 0, width, height);
    
    const sprite = game.add.sprite(x, y, bitmap);
    return sprite;
  }
  
  customizeSkinTone() {
    const skinOptions = ["LIGHT", "DARK"];
    
    const background = this.createGradientBackground(92, 85, 92, 24);
    background.anchor.set(0.5);
    
    const skinText = new Text(96, 80, "SKIN TONE", FONTS.shaded);
    skinText.anchor.set(0.5);

    let currentIndex = this.selectedCharacter.appearance.skinTone;
    const skinValueText = new Text(96, 90, skinOptions[currentIndex], FONTS.default);
    skinValueText.anchor.set(0.5);

    const skinHandler = key => {
      if (key === "left") {
        currentIndex = (currentIndex - 1 + skinOptions.length) % skinOptions.length;
        this.selectedCharacter.appearance.skinTone = currentIndex;
        this.characterDisplay.updateAppearance({ skinTone: currentIndex });
      } else if (key === "right") {
        currentIndex = (currentIndex + 1) % skinOptions.length;
        this.selectedCharacter.appearance.skinTone = currentIndex;
        this.characterDisplay.updateAppearance({ skinTone: currentIndex });
      } else if (key === "a" || key === "b" || key === "start") {
        skinText.destroy();
        skinValueText.destroy();
        background.destroy();
        gamepad.signals.pressed.any.remove(skinHandler);
        this.showCustomizationMenu();
        return;
      }

      skinValueText.write(skinOptions[currentIndex]);
    };

    gamepad.signals.pressed.any.add(skinHandler);
  }

  customizeHairColor() {
    let color = this.selectedCharacter.appearance.hairColor;
    let r = (color >> 16) & 0xff;
    let g = (color >> 8) & 0xff;
    let b = color & 0xff;
    
    this.navigationHint.change(4);
    
    const background = this.createGradientBackground(92, 85, 92, 24);
    background.anchor.set(0.5);

    const colorText = new Text(96, 80, "HAIR COLOR", FONTS.shaded);
    colorText.anchor.set(0.5);

    const rgbText = new Text(96, 90, `R:${r} G:${g} B:${b}`, FONTS.default);
    rgbText.anchor.set(0.5);

    const updateColor = () => {
      const newColor = (r << 16) | (g << 8) | b;
      this.selectedCharacter.appearance.hairColor = newColor;
      this.characterDisplay.updateAppearance({ hairColor: newColor });
      rgbText.write(`R:${r} G:${g} B:${b}`);
    };

    const colorHandler = key => {
      switch (key) {
        case "left":
          r = Math.max(0, r - 32);
          break;
        case "right":
          r = Math.min(255, r + 32);
          break;
        case "up":
          g = Math.min(255, g + 32);
          break;
        case "down":
          g = Math.max(0, g - 32);
          break;
        case "a":
          b = Math.min(255, b + 32);
          break;
        case "b":
          b = Math.max(0, b - 32);
          break;
        case "start":
          colorText.destroy();
          rgbText.destroy();
          background.destroy();
          gamepad.signals.pressed.any.remove(colorHandler);
          this.navigationHint.change(0);
          this.showCustomizationMenu();
          return;
      }
      updateColor();
    };
    
    gamepad.signals.pressed.any.add(colorHandler);
  }

  customizeHairStyle(type) {
    const unlocked = Account.characters.unlockedHairs[type === "frontHair" ? "front" : "back"];
    const options = unlocked.map(id => CHARACTER_SYSTEM.HAIR_STYLES[type === "frontHair" ? "front" : "back"][id-1]);
    const values = unlocked;
    
    const background = this.createGradientBackground(92, 85, 92, 24);
    background.anchor.set(0.5);
    
    const hairText = new Text(96, 80, `${type.toUpperCase()}`, FONTS.shaded);
    hairText.anchor.set(0.5);
    
    let currentIndex = this.selectedCharacter.appearance[type] - 1;
    
    const hairValueText = new Text(96, 90, "", FONTS.default);
    hairValueText.write(options[currentIndex], 18);
    hairValueText.anchor.set(0.5);

    const hairHandler = key => {
      if (key === "left") {
        currentIndex = (currentIndex - 1 + options.length) % options.length;
        this.characterDisplay.updateAppearance({ [type]: values[currentIndex] });
      } else if (key === "right") {
        currentIndex = (currentIndex + 1) % options.length;
        this.characterDisplay.updateAppearance({ [type]: values[currentIndex] });
      } else if (key === "a" || key === "b" || key === "start") {
        this.selectedCharacter.appearance[type] = values[currentIndex];
        this.characterDisplay.updateAppearance({ [type]: values[currentIndex] });
        hairText.destroy();
        hairValueText.destroy();
        background.destroy();
        gamepad.signals.pressed.any.remove(hairHandler);
        this.showCustomizationMenu();
        return;
      }

      hairValueText.write(options[currentIndex], 18);
    };

    gamepad.signals.pressed.any.add(hairHandler);
  }

  customizeClothing() {
    const unlocked = Account.characters.unlockedItems.filter(itemId => CHARACTER_ITEMS.clothing.some(item => item.id === itemId));
    const options = unlocked.map(id => {
      const item = CHARACTER_ITEMS.clothing.find(i => i.id === id);
      return item ? item.name : id;
    });
    
    const background = this.createGradientBackground(92, 85, 92, 24);
    background.anchor.set(0.5);

    const clothingText = new Text(96, 80, "CLOTHING", FONTS.shaded);
    clothingText.anchor.set(0.5);

    let currentIndex = unlocked.indexOf(this.selectedCharacter.appearance.clothing);
    if (currentIndex === -1) currentIndex = 0;
    
    const clothingValueText = new Text(96, 90, "", FONTS.default);
    clothingValueText.write(options[currentIndex], 18)
    clothingValueText.anchor.set(0.5);

    const clothingHandler = key => {
      if (key === "left") {
        currentIndex = (currentIndex - 1 + options.length) % options.length;
        this.characterDisplay.updateAppearance({ clothing: unlocked[currentIndex] });
      } else if (key === "right") {
        currentIndex = (currentIndex + 1) % options.length;
        this.characterDisplay.updateAppearance({ clothing: unlocked[currentIndex] });
      } else if (key === "a" || key === "b" || key === "start") {
        this.selectedCharacter.appearance.clothing = unlocked[currentIndex];
        this.characterDisplay.updateAppearance({ clothing: unlocked[currentIndex] });
        clothingText.destroy();
        clothingValueText.destroy();
        background.destroy();
        gamepad.signals.pressed.any.remove(clothingHandler);
        this.showCustomizationMenu();
        return;
      }

      clothingValueText.write(options[currentIndex], 18);
    };

    gamepad.signals.pressed.any.add(clothingHandler);
  }

  customizeAccessory() {
    const unlocked = Account.characters.unlockedItems.filter(itemId => CHARACTER_ITEMS.accessories.some(item => item.id === itemId));
    const options = [
      "NONE",
      ...unlocked.map(id => {
        const item = CHARACTER_ITEMS.accessories.find(i => i.id === id);
        return item ? item.name : id;
      })
    ];

    const background = this.createGradientBackground(92, 85, 92, 24);
    background.anchor.set(0.5);
    
    const accessoryText = new Text(96, 80, "ACCESSORY", FONTS.shaded);
    accessoryText.anchor.set(0.5);

    const currentIndex = this.selectedCharacter.appearance.accessory ? unlocked.indexOf(this.selectedCharacter.appearance.accessory) + 1 : 0;
    let selectedIndex = currentIndex;
    const accessoryValueText = new Text(96, 90, "", FONTS.default);
    accessoryValueText.write(options[selectedIndex], 18);
    accessoryValueText.anchor.set(0.5);

    const accessoryHandler = key => {
      if (key === "left") {
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        this.characterDisplay.updateAppearance({ accessory: selectedIndex === 0 ? null : unlocked[selectedIndex - 1] });
      } else if (key === "right") {
        selectedIndex = (selectedIndex + 1) % options.length;
        this.characterDisplay.updateAppearance({ accessory: selectedIndex === 0 ? null : unlocked[selectedIndex - 1] });
      } else if (key === "a" || key === "b" || key === "start") {
        this.selectedCharacter.appearance.accessory = selectedIndex === 0 ? null : unlocked[selectedIndex - 1];
        this.characterDisplay.updateAppearance({ accessory: this.selectedCharacter.appearance.accessory });
        accessoryText.destroy();
        accessoryValueText.destroy();
        background.destroy();
        gamepad.signals.pressed.any.remove(accessoryHandler);
        this.showCustomizationMenu();
        return;
      }
      accessoryValueText.write(options[selectedIndex], 18);
    };

    gamepad.signals.pressed.any.add(accessoryHandler);
  }

  finishCustomization() {
    this.characterManager.saveToAccount();
    this.showActionMenu();
  }

  deleteCharacter() {
    this.confirm(
      "DELETE CHARACTER?",
      () => {
        // Confirm callback
        this.characterManager.deleteCharacter(this.selectedCharacter.name);
        
        // Equip another character or leave unequiped
        if (this.characterManager.getCharacterList().length <= 1) {
          this.selectedCharacter = null;
          this.characterManager.unsetCharacter();
        } else {
          this.selectedCharacter = this.characterManager.getCharacterList()[0];
        }
        this.showHomeUI();
      },
      () => {
        // Cancel callback - return to action menu
        this.showActionMenu();
      },
      "no" // Recommended to choose "No" for destructive actions
    );
  }
  
  confirm(message, onConfirm, onCancel, recommended = "none") {
    // Clear any existing menus
    this.clearAllMenus();
    
    // Create confirmation text
    const confirmText = new Text(96, 60, message, FONTS.shaded);
    confirmText.anchor.set(0.5);
    
    // Create confirmation menu
    const confirmMenu = new CarouselMenu(60, 70, 72, 32, {
      bgcolor: "#2c3e50",
      fgcolor: "#ffffff",
      align: "center"
    });
    
    // Determine button colors based on recommended option
    let yesColor = "#34495e"; // Default
    let noColor = "#34495e";  // Default
    let initialSelection = 0; // Start on first item (YES)
    
    switch (recommended) {
      case "yes":
        yesColor = "#27ae60"; // Green for recommended
        noColor = "#c0392b";  // Red for not recommended
        initialSelection = 0; // Start on YES
        break;
      case "no":
        yesColor = "#c0392b"; // Red for not recommended
        noColor = "#27ae60";  // Green for recommended
        initialSelection = 1; // Start on NO
        break;
      default: // "none" or undefined
        yesColor = "#34495e";
        noColor = "#34495e";
        initialSelection = 0;
        break;
    }
    
    // Add buttons with appropriate colors
    confirmMenu.addItem("YES", () => {
      confirmText.destroy();
      confirmMenu.destroy();
      onConfirm?.();
    }, {
      bgcolor: yesColor
    });
    
    confirmMenu.addItem("NO", () => {
      confirmText.destroy();
      confirmMenu.destroy();
      onCancel?.();
    }, {
      bgcolor: noColor
    });
    
    // Set initial selection based on recommended option
    if (initialSelection === 1) {
      confirmMenu.selectIndex(1);
    }
    
    // Set up cancel handling
    confirmMenu.onCancel.add(() => {
      confirmText.destroy();
      confirmMenu.destroy();
      onCancel?.();
    });
  }

  startCharacterCreation() {
    this.creationStep = 0;
    this.newCharacterAppearance = {
      skinTone: 0,
      hairColor: 0xFFFFFF,
      frontHair: "1",
      backHair: "1",
      clothing: "school_uniform",
      accessory: null
    };
    
    // Hide existing UI and character details
    this.clearAllMenus();
    this.hideCharacterDetails();
    
    // Create temporary character display for creation
    this.tempCharacterDisplay = new CharacterDisplay(46, 6, {
      name: "NEW CHARACTER",
      appearance: this.newCharacterAppearance
    });
    
    this.creationWindowManager = new WindowManager();
    
    this.showCreationStep();
  }
  
  hideCharacterDetails() {
    this.nameText.visible = false;
    this.levelText.visible = false;
    this.selectedSkillText.visible = false;
    this.skillDescriptionText.visible = false;
    this.expBar.visible = false;
    this.skillBar.visible = false;
  }
  
  showCharacterDetails() {
    this.nameText.visible = true;
    this.levelText.visible = true;
    this.selectedSkillText.visible = true;
    this.skillDescriptionText.visible = true;
    this.expBar.visible = true;
    this.skillBar.visible = true;
  }
  
  showCreationStep() {
    // Remove any existing creation UI and input handlers
    if (this.creationMenu) {
      this.creationMenu.destroy();
      this.creationMenu = null;
    }
    if (this.creationText) {
      this.creationText.destroy();
      this.creationText = null;
    }
    if (this.creationWindow) {
      this.creationWindowManager.remove(this.creationWindow, true);
    }
    
    // Clear any existing input handlers
    gamepad.signals.pressed.any.removeAll();
    
    const steps = [
      { title: "CHOOSE SKIN TONE", action: (callback) => this.creationCustomizeSkinTone(callback) },
      { title: "CHOOSE HAIR COLOR", action: (callback) => this.creationCustomizeHairColor(callback) },
      { title: "CHOOSE FRONT HAIR", action: (callback) => this.creationCustomizeHairStyle("frontHair", callback) },
      { title: "CHOOSE BACK HAIR", action: (callback) => this.creationCustomizeHairStyle("backHair", callback) },
      { title: "CHOOSE CLOTHING", action: (callback) => this.creationCustomizeClothing(callback) },
      { title: "CHOOSE ACCESSORY", action: (callback) => this.creationCustomizeAccessory(callback) },
      { title: "NAME YOUR CHARACTER", action: (callback) => this.creationNameCharacter(callback) }
    ];
    
    if (this.creationStep < steps.length) {
      const step = steps[this.creationStep];
      
      this.creationWindow = this.creationWindowManager.createWindow(12, 7, 10, 5, "1");
      this.creationWindow.x -= (this.creationWindow.size.width / 2) * 8;
      
      this.creationWindow.offset = {
        x: 20,
        y: 8
      };
      
      this.creationWindow.disableScrollBar = true;
      
      this.creationText = new Text(96, 70, step.title, FONTS.shaded);
      this.creationText.anchor.set(0.5);
      
      // Show customization interface first
      step.action(() => {
        // When customization is done, show the navigation menu
        this.showCreationNavigationMenu();
      });
    }
  }
  
  showCreationNavigationMenu() {
    this.creationWindow.addItem("NEXT", "", () => {
      this.creationStep++;
      this.showCreationStep();
    });
    
    if (this.creationStep > 0) {
      this.creationWindow.addItem("PREVIOUS", "", () => {
        this.creationStep--;
        this.showCreationStep();
      }, true);
    }
    
    this.creationWindow.addItem("CANCEL", "", () => {
      this.cancelCharacterCreation();
    }, this.creationStep <= 0);
    
    this.creationWindowManager.focus(this.creationWindow);
  }
  
  creationCustomizeSkinTone(callback) {
    const skinOptions = ["LIGHT", "DARK"];
    let currentIndex = this.newCharacterAppearance.skinTone;
    
    const skinText = new Text(96, 80, skinOptions[currentIndex], FONTS.default);
    skinText.anchor.set(0.5);
    
    const skinHandler = key => {
      if (key === "left") {
        currentIndex = (currentIndex - 1 + skinOptions.length) % skinOptions.length;
      } else if (key === "right") {
        currentIndex = (currentIndex + 1) % skinOptions.length;
      } else if (key === "a") {
        // Confirm selection and proceed
        skinText.destroy();
        gamepad.signals.pressed.any.remove(skinHandler);
        callback();
        return;
      } else if (key === "b") {
        // Go back to navigation
        skinText.destroy();
        gamepad.signals.pressed.any.remove(skinHandler);
        this.showCreationNavigationMenu();
        return;
      }
      
      this.newCharacterAppearance.skinTone = currentIndex;
      this.tempCharacterDisplay.updateAppearance({ skinTone: currentIndex });
      skinText.write(skinOptions[currentIndex]);
    };
    
    gamepad.signals.pressed.any.add(skinHandler);
  }
  
  creationCustomizeHairColor(callback) {
    let color = this.newCharacterAppearance.hairColor;
    let r = Math.max(0x88, (color >> 16) & 0xff);
    let g = Math.max(0x88, (color >> 8) & 0xff);
    let b = Math.max(0x88, color & 0xff);
    
    const updateColor = () => {
      const newColor = (r << 16) | (g << 8) | b;
      this.newCharacterAppearance.hairColor = newColor;
      this.tempCharacterDisplay.updateAppearance({ hairColor: newColor });
      return `R:${r} G:${g} B:${b}`;
    };
    
    const rgbText = new Text(96, 80, updateColor(), FONTS.default);
    rgbText.anchor.set(0.5);
    
    const colorHandler = key => {
      switch (key) {
        case "left":
          r = Math.max(0, r - 32);
          break;
        case "right":
          r = Math.min(255, r + 32);
          break;
        case "up":
          g = Math.min(255, g + 32);
          break;
        case "down":
          g = Math.max(0, g - 32);
          break;
        case "a":
          b = Math.min(255, b + 32);
          break;
        case "b":
          b = Math.max(0, b - 32);
          break;
        case "start":
          // Confirm selection
          rgbText.destroy();
          gamepad.signals.pressed.any.remove(colorHandler);
          callback();
          this.navigationHint.change(0);
          return;
        case "select":
          // Go back to navigation
          rgbText.destroy();
          gamepad.signals.pressed.any.remove(colorHandler);
          this.navigationHint.change(0);
          this.showCreationNavigationMenu();
          return;
      }
      
      rgbText.write(updateColor());
    };
    
    this.navigationHint.change(4);
    
    gamepad.signals.pressed.any.add(colorHandler);
  }
  
  creationCustomizeHairStyle(type, callback) {
    const unlocked = Account.characters.unlockedHairs[type === "frontHair" ? "front" : "back"];
    const options = unlocked.map(id => CHARACTER_SYSTEM.HAIR_STYLES[type === "frontHair" ? "front" : "back"][id-1]);
    const values = unlocked;

    let currentIndex = this.newCharacterAppearance[type] - 1;
    
    const hairText = new Text(96, 80, options[currentIndex], FONTS.default);
    hairText.anchor.set(0.5);

    const updateHair = () => {
      this.newCharacterAppearance[type] = values[currentIndex];
      this.tempCharacterDisplay.updateAppearance({ [type]: values[currentIndex] });
      hairText.write(options[currentIndex]);
    };
    
    const hairHandler = key => {
      if (key === "left") {
        currentIndex = (currentIndex - 1 + options.length) % options.length;
      } else if (key === "right") {
        currentIndex = (currentIndex + 1) % options.length;
      } else if (key === "a") {
        // Confirm selection
        hairText.destroy();
        gamepad.signals.pressed.any.remove(hairHandler);
        callback();
        return;
      } else if (key === "b") {
        // Go back to navigation
        hairText.destroy();
        gamepad.signals.pressed.any.remove(hairHandler);
        this.showCreationNavigationMenu();
        return;
      }
      
      updateHair();
    };
    
    updateHair();
    gamepad.signals.pressed.any.add(hairHandler);
  }

  creationCustomizeClothing(callback) {
    const unlocked = Account.characters.unlockedItems.filter(itemId => 
      CHARACTER_ITEMS.clothing.some(item => item.id === itemId)
    );
    const options = unlocked.map(id => {
      const item = CHARACTER_ITEMS.clothing.find(i => i.id === id);
      return item ? item.name : id;
    });
    
    let currentIndex = unlocked.indexOf(this.newCharacterAppearance.clothing);
    if (currentIndex === -1) currentIndex = 0;
    
    const clothingText = new Text(96, 80, options[currentIndex], FONTS.default);
    clothingText.anchor.set(0.5);
    
    const clothingHandler = key => {
      if (key === "left") {
        currentIndex = (currentIndex - 1 + options.length) % options.length;
      } else if (key === "right") {
        currentIndex = (currentIndex + 1) % options.length;
      } else if (key === "a") {
        // Confirm selection
        clothingText.destroy();
        gamepad.signals.pressed.any.remove(clothingHandler);
        callback();
        return;
      } else if (key === "b") {
        // Go back to navigation
        clothingText.destroy();
        gamepad.signals.pressed.any.remove(clothingHandler);
        this.showCreationNavigationMenu();
        return;
      }
      
      this.newCharacterAppearance.clothing = unlocked[currentIndex];
      this.tempCharacterDisplay.updateAppearance({ clothing: unlocked[currentIndex] });
      clothingText.write(options[currentIndex]);
    };
    
    gamepad.signals.pressed.any.add(clothingHandler);
  }
  
  creationCustomizeAccessory(callback) {
    const unlocked = Account.characters.unlockedItems.filter(itemId => 
      CHARACTER_ITEMS.accessories.some(item => item.id === itemId)
    );
    const options = [
      "NONE",
      ...unlocked.map(id => {
        const item = CHARACTER_ITEMS.accessories.find(i => i.id === id);
        return item ? item.name : id;
      })
    ];
    
    let currentIndex = this.newCharacterAppearance.accessory ? 
      unlocked.indexOf(this.newCharacterAppearance.accessory) + 1 : 0;
    
    const accessoryText = new Text(96, 80, options[currentIndex], FONTS.default);
    accessoryText.anchor.set(0.5);
    
    const accessoryHandler = key => {
      if (key === "left") {
        currentIndex = (currentIndex - 1 + options.length) % options.length;
      } else if (key === "right") {
        currentIndex = (currentIndex + 1) % options.length;
      } else if (key === "a") {
        // Confirm selection
        accessoryText.destroy();
        gamepad.signals.pressed.any.remove(accessoryHandler);
        callback();
        return;
      } else if (key === "b") {
        // Go back to navigation
        accessoryText.destroy();
        gamepad.signals.pressed.any.remove(accessoryHandler);
        this.showCreationNavigationMenu();
        return;
      }
      
      this.newCharacterAppearance.accessory = currentIndex === 0 ? null : unlocked[currentIndex - 1];
      this.tempCharacterDisplay.updateAppearance({ accessory: this.newCharacterAppearance.accessory });
      accessoryText.write(options[currentIndex]);
    };
    
    accessoryHandler();
    gamepad.signals.pressed.any.add(accessoryHandler);
  }
  
  creationNameCharacter(callback) {
    if (this.creationMenu) {
      this.creationMenu.destroy();
      this.creationMenu = null;
    }
    if (this.creationText) {
      this.creationText.destroy();
      this.creationText = null;
    }
    if (this.creationWindow) {
      this.creationWindow.visible = false;
    }
    
    const nameText = new Text(96, 80, "ENTER CHARACTER NAME", FONTS.shaded);
    nameText.anchor.set(0.5);
    
    this.navigationHint.change(5);
    
    new TextInput(
      "",
      CHARACTER_SYSTEM.MAX_NAME_LENGTH,
      name => {
        // Finalize character creation
        const newChar = this.characterManager.createCharacter(name, this.newCharacterAppearance);
        if (newChar) {
          this.selectedCharacter = newChar;
          nameText.destroy();
          this.navigationHint.change(0);
          
          // Clean up temporary display
          if (this.tempCharacterDisplay) {
            this.tempCharacterDisplay.destroy();
            this.tempCharacterDisplay = null;
          }
          
          // Return to home UI
          this.showHomeUI();
        } else {
          notifications.show("Character name already exists");
          this.navigationHint.change(0);
          // Retry naming
          this.creationNameCharacter(callback);
        }
      },
      () => {
        // Cancel creation
        nameText.destroy();
        this.navigationHint.change(0);
        this.cancelCharacterCreation();
      }
    );
  }
  
  cancelCharacterCreation() {
    // Clean up
    if (this.tempCharacterDisplay) {
      this.tempCharacterDisplay.destroy();
      this.tempCharacterDisplay = null;
    }
    if (this.creationMenu) {
      this.creationMenu.destroy();
      this.creationMenu = null;
    }
    if (this.creationText) {
      this.creationText.destroy();
      this.creationText = null;
    }
    if (this.creationWindow) {
      this.creationWindowManager.remove(this.creationWindow, true);
    }
    
    // Return to home UI
    this.showHomeUI();
  }

  update() {
    gamepad.update();
    
    if (notifications.notificationWindow) notifications.notificationWindow.bringToTop();
    
    if (this.creationWindowManager) {
      this.creationWindowManager.update();
    }
  }

  shutdown() {
    this.characterManager.saveToAccount();
  }
}

class AchievementsMenu {
  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    new BackgroundGradient();
    
    this.navigationHint = new NavigationHint(6);
    
    this.showingUnlocked = true;
    
    // Initialize details text first
    this.detailsText = new Text(game.width / 2 + 8, 10, "");
    
    this.createMenu();
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  createMenu() {
    const achievementsManager = new AchievementsManager();
    
    // Left side - Carousel menu
    const carouselWidth = game.width / 2;
    const carouselHeight = game.height - 12;
    
    this.carousel = new CarouselMenu(0, 8, carouselWidth, carouselHeight, {
      bgcolor: '#9b59b6',
      fgcolor: '#ffffff',
      align: 'left',
      animate: true,
      disableConfirm: true,
      disableCancel: true
    });
    
    // Toggle button
    this.toggleText = new Text(4, 4, "SHOWING: UNLOCKED");
    
    game.onMenuIn.dispatch('achievements', this.carousel);
    
    this.updateAchievementsList();
  }

  updateAchievementsList() {
    const achievementsManager = new AchievementsManager();
    
    const achievements = this.showingUnlocked ? 
      achievementsManager.getUnlockedAchievements() : 
      achievementsManager.getLockedAchievements();
    
    this.carousel.clear();
    
    if (achievements.length === 0) {
      this.carousel.addItem(
        this.showingUnlocked ? "No achievements unlocked" : "No achievements available",
        null,
        { bgcolor: '#34495e' }
      );
      if (this.detailsText) {
        this.detailsText.write("");
      }
    } else {
      achievements.forEach(achievement => {
        const status = this.showingUnlocked ? "✓" : "○";
        const displayName = `${status} ${achievement.name}`;
        
        this.carousel.addItem(
          displayName,
          null,
          { 
            achievement: achievement,
            bgcolor: this.showingUnlocked ? '#27ae60' : '#e74c3c'
          }
        );
      });
      
      // Show first achievement details
      if (achievements.length > 0 && this.detailsText) {
        this.showAchievementDetails(achievements[0]);
      }
    }
    
    if (this.toggleText) {
      this.toggleText.write(`SHOWING: ${this.showingUnlocked ? 'UNLOCKED' : 'LOCKED'}`);
    }
    
    // Handle carousel selection
    this.carousel.onSelect.add((index, item) => {
      if (item.data && item.data.achievement) {
        this.showAchievementDetails(item.data.achievement);
      }
    });
    
    this.carousel.onCancel.add(() => {
      game.state.start("MainMenu");
    });
    
  }

  showAchievementDetails(achievement) {
    if (!this.detailsText) return;
    
    const achievementsManager = new AchievementsManager();
    const isUnlocked = Account.achievements.unlocked[achievement.id];
    
    let details = `${achievement.name}\n`;
    details += `Category: ${achievement.category}\n\n`;
    
    if (isUnlocked) {
      details += achievement.description.achieved + '\n\n';
      const unlockData = Account.achievements.unlocked[achievement.id];
      const unlockDate = new Date(unlockData.unlockedAt);
      details += `Unlocked: ${unlockDate.toLocaleDateString()}\n`;
      details += `Experience: +${unlockData.expReward}`;
    } else {
      details += achievement.description.unachieved + '\n\n';
      if (achievement.hidden) {
        details += "???\n(Hidden Achievement)";
      } else {
        details += `Experience: +${achievement.expReward}`;
      }
    }
    
    this.detailsText.write(details).wrapPreserveNewlines(game.width / 2 - 16);
  }

  update() {
    gamepad.update();
    
    // Toggle between unlocked/locked with Select button
    if (gamepad.pressed.select && !this.lastSelect) {
      this.showingUnlocked = !this.showingUnlocked;
      this.updateAchievementsList();
    }
    this.lastSelect = gamepad.pressed.select;
  }
}

class StatsMenu {
  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    new BackgroundGradient();
    
    this.titleText = new Text(92, 8, "PLAYER STATISTICS");
    this.titleText.anchor.x = 0.5;
    
    this.leftColumn = new Text(8, 56, "");
    this.leftColumn.anchor.y = 0.5;
    
    this.rightColumn = new Text(92, 56, "");
    this.rightColumn.anchor.y = 0.5;
    
    this.instructionText = new Text(92, 92, "PRESS ANY KEY TO LEAVE");
    this.instructionText.anchor.x = 0.5;
    
    this.updateStatsText();
    
    // Update stats for real-time updates
    this.updateTimer = game.time.events.loop(100, this.updateStatsText, this);
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  formatSessionTime(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  updateStatsText() {
    if (!Account.stats) return;
    
    const stats = Account.stats;
    
    let leftColumnText = "";
    let rightColumnText = "";
    
    // Left column - General Stats
    leftColumnText += `Games Played: ${stats.totalGamesPlayed}\n`;
    leftColumnText += `Score: ${stats.totalScore}\n`;
    leftColumnText += `Max Combo: ${stats.maxCombo}\n`;
    leftColumnText += `Perfect Games: ${stats.perfectGames}\n`;
    leftColumnText += `Characters: ${stats.charactersCreated}\n`;
    leftColumnText += `Max Level: ${stats.maxCharacterLevel}\n`;
    leftColumnText += `Skills Unlocked: ${stats.skillsUnlocked}\n`;
    
    // Right column - Time & Progression Stats
    rightColumnText += `Total Time: ${this.formatTime(stats.totalTimePlayed)}\n`;
    rightColumnText += `Play Sessions: ${stats.totalPlaySessions}\n`;
    rightColumnText += `Avg Session: ${this.formatSessionTime(stats.averageSessionTime)}\n`;
    rightColumnText += `Longest Session: ${this.formatSessionTime(stats.longestSession)}\n`;
    rightColumnText += `Current Streak: ${stats.currentStreak} days\n`;
    rightColumnText += `Longest Streak: ${stats.longestStreak} days\n`;
    rightColumnText += `High Scores: ${stats.highScoresSet}\n`;

    this.leftColumn.write(leftColumnText);
    this.rightColumn.write(rightColumnText);
  }

  update() {
    gamepad.update();
    
    // Press any key to go back
    if (gamepad.pressed.any) {
      game.state.start("MainMenu");
    }
  }
  
  shutdown() {
    if (this.updateTimer) {
      game.time.events.remove(this.updateTimer);
    }
  }
}

class Play {
  init(song, difficultyIndex, playtestMode, autoplay) {
    this.song = song;
    this.difficultyIndex = difficultyIndex || song.difficultyIndex;
    this.player = null;
    this.backgroundQueue = [];
    this.preloadedBackgroundElements = {};
    this.currentBackground = null;
    this.isPaused = false;
    this.pauseStartTime = 0;
    this.totalPausedDuration = 0;
    this.pendingSongStart = false;
    this.audioEndListener = null;
    this.started = false;
    this.startTime = 0;
    this.autoplay = typeof autoplay !== "undefined" ? autoplay : Account.settings.autoplay;
    this.userOffset = Account.settings.userOffset;
    this.lastVideoUpdateTime = 0;
    this.lyrics = null;
    this.hasLyricsFile = song.chart.lyricsContent ? true : false;
    this.visualizerType = Account.settings.visualizer || 'NONE';
    this.lastVisualizerUpdateTime = 0;
    this.metronome = null;
    this.gameRecorder = null;
    this.playtestMode = playtestMode;
    
    // Initialize character system
    this.characterManager = new CharacterManager();
    this.currentCharacter = this.characterManager.getCurrentCharacter();
    this.skillSystem = new CharacterSkillSystem(this, this.currentCharacter);
    
    // Save last song to Account
    Account.lastSong = {
      url: song.chart.audioUrl,
      title: song.chart.title,
      artist: song.chart.artist,
      sampleStart: song.chart.sampleStart || 0,
      isExternal: song.chart.files !== undefined, // Flag for external songs
      score: 0,
      accuracy: 0,
      maxCombo: 0,
      judgements: {
        marvelous: 0,
        perfect: 0,
        great: 0,
        good: 0,
        boo: 0,
        miss: 0
      },
      totalNotes: 0,
      skillsUsed: 0,
      difficultyRating: song.chart.difficulties[song.difficultyIndex].rating,
      complete: false
    };
    saveAccount();
    
    // For debugging
    window.p = this;
    
    // Game constants
    this.JUDGE_WINDOWS = JUDGE_WINDOWS;
    
    this.SCORE_VALUES = SCORE_VALUES;
  }
  
  create() {
    // Ensure background music is stopped during gameplay
    if (backgroundMusic) {
      backgroundMusic.stop();
    }
    
    game.camera.fadeIn(0x000000);
    
    // Create background
    this.backgroundLayer = game.add.group();
    this.backgroundSprite = game.add.sprite(0, 0, null, 0, this.backgroundLayer);
    this.backgroundSprite.alpha = 0.6;
    this.backgroundCanvas = document.createElement("canvas");
    this.backgroundCanvas.width = 192;
    this.backgroundCanvas.height = 112;
    this.backgroundCtx = this.backgroundCanvas.getContext("2d");
    
    this.visibilityChangeListener = () => {
      if (document.hidden) {
        if (!this.isPaused) this.pause();
        this.audio.volume = 0;
      } else {
        this.audio.volume = [0,25,50,75,100][Account.settings.volume] / 100;
      }
    };
    
    window.addEventListener('visibilitychange', this.visibilityChangeListener);
    
    this.createHud();
    
    this.setupLyrics();
    
    this.setupPlayer();
    
    this.metronome = new Metronome(this);
    
    this.initialSetup();
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  async initialSetup() {
    const dots = new LoadingDots();
    dots.x -= 4;
    dots.y -= 8;
    this.song.chart.backgrounds.forEach(async bg => {
      if (bg.file !== "-nosongbg-" && !this.preloadedBackgroundElements[bg.file]) {
        const element = await this.preloadBackground(bg);
        this.preloadedBackgroundElements[bg.file] = element;
      }
    }); 
    await this.setupAudio();
    dots.destroy();
    this.songStart();
  }
  
  setupAudio() {
    return new Promise(resolve => {
      // Create audio element and wait for it to load
      this.audio = document.createElement("audio");
      this.audio.volume = [0,25,50,75,100][Account.settings.volume] / 100;
      this.audio.src = this.song.chart.audioUrl;
      this.audio.addEventListener("canplaythrough", e => resolve());
      this.audio.addEventListener("error", e => resolve());
    });
  }
  
  preloadBackground(background) {
    return new Promise((resolve, reject) => {
      const { url, type } = background;
      const element = type == "video" ? document.createElement("video") : document.createElement("img");
      
      if (!url) {
        // Flag error if undefined or null url
        element.__errored = true;
        element.__type = type;
        element.__url = "";
        resolve(element);
        return;
      }
      
      // Add error flag property
      element.__errored = false;
      element.__type = type;
      element.__url = url;
      
      if (type == "image") {
        element.onload = () => resolve(element);
        element.onerror = () => {
          console.warn(`Failed to load background image: ${url}`);
          element.__errored = true;
          resolve(element);
        };
      } else {
        element.muted = true;
        element.volume = 0;
        element.loop = true;
        element.autoplay = false;
        element.addEventListener("canplaythrough", () => resolve(element));
        element.onerror = () => {
          console.warn(`Failed to load background video: ${url}`);
          element.__errored = true;
          resolve(element);
        };
      }
      
      element.src = url;
    });
  }
  
  createHud() {
    this.backgroundGradient = new BackgroundGradient(0, 0.4, 5000);

    this.hud = game.add.sprite(0, 0, "ui_hud_background", 0);
    
    this.overHud = game.add.sprite(0, 0);
    
    const difficulty = this.song.chart.difficulties[this.song.difficultyIndex];
    
    this.difficultyBanner = game.add.sprite(0, 0, "ui_difficulty_banner", 0);
    this.difficultyBanner.tint = this.getDifficultyColor(difficulty.rating);
    this.hud.addChild(this.difficultyBanner);
    
    this.difficultyTypeText = new Text(5, 1, difficulty.type.substr(0, 7), null, this.difficultyBanner);
    
    const title = this.song.chart.titleTranslit || this.song.chart.title;
    
    this.songTitleText = new Text(34, 1, "", null, this.hud);
    this.songTitleText.write(title, 28);
    
    this.playerName = new Text(4, 8, "", FONTS.shaded, this.hud);
    this.playerName.write(this.currentCharacter ? this.currentCharacter.name : "NONE", 4);
    
    this.playerName.tint = this.currentCharacter ? this.currentCharacter.appearance.hairColor : 0xffffff;
    
    this.skillBar = new SkillBar(6, 15);
    this.hud.addChild(this.skillBar);
    
    if (!this.currentCharacter) this.skillBar.visible = false;
    
    this.scoreText = new Text(22, 12, "0".repeat(9), null, this.hud);
    
    this.lifebarStart = game.add.sprite(21, 8, "ui_lifebar", 0);
    this.lifebarMiddle = game.add.sprite(1, 0, "ui_lifebar", 1);
    this.lifebarMiddle.width = 102;
    this.lifebarEnd = game.add.sprite(103, 0, "ui_lifebar", 2);
    
    this.hud.addChild(this.lifebarStart);
    this.lifebarStart.addChild(this.lifebarMiddle);
    this.lifebarStart.addChild(this.lifebarEnd);
    
    // Autoplay text
    this.autoplayText = new Text(4, 90, this.autoplay ? "AUTOPLAY" : "", FONTS.stroke, this.hud);
    
    this.healthText = new Text(137, 8, "100", FONTS.number, this.hud);
    this.healthText.anchor.x = 1;
    
    this.judgementText = new Text(game.width / 2, 60, "", FONTS.shaded);
    this.judgementText.anchor.set(0.5);
    
    this.accuracyBar = game.add.sprite(41, 108, "ui_accuracy_bar");
    this.hud.addChild(this.accuracyBar);
    
    this.comboText = new Text(191, 106, "0", FONTS.combo);
    this.comboText.anchor.set(1);
    
    this.createVisualizer();
  }
  
  createVisualizer() {
    const visualizerX = 2;
    const visualizerY = 103;
    const visualizerWidth = 36;
    const visualizerHeight = 7;

    // Remove existing visualizer
    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = null;
    }

    // Create new visualizer based on setting
    switch (this.visualizerType) {
      case 'ACCURACY':
        this.visualizer = new AccuracyVisualizer(this, visualizerX, visualizerY, visualizerWidth, visualizerHeight);
        break;
      case 'AUDIO':
        this.visualizer = new AudioVisualizer(this, visualizerX, visualizerY, visualizerWidth, visualizerHeight);
        break;
      case 'BPM':
        this.visualizer = new BPMVisualizer(this, visualizerX, visualizerY, visualizerWidth, visualizerHeight);
        break;
      default:
        this.visualizer = null; // NONE
    }
    
    if (this.visualizer) {
      this.hud.addChild(this.visualizer.graphics);
    }
  }
  
  setupPlayer() {
    this.player = new Player(this);
  }
  
  setupLyrics() {
    if (this.hasLyricsFile) {
      const lrcContent = this.song.chart.lyricsContent; 
      
      // Create lyrics text element
      this.lyricsText = new Text(game.width / 2, 72, "", FONTS.stroke);
      this.lyricsText.anchor.set(0.5);
      
      // Initialize lyrics system
      this.lyrics = new Lyrics({
        textElement: this.lyricsText,
        maxLineLength: 25,
        lrc: lrcContent
      });
    }
  }
  
  getDifficultyColor(value) {
    const max = 11; // The actual maximum considered difficulty
    
    // Ensure the value is within the range [0, max]
    value = Math.max(0, Math.min(max, value));

    // Extract the RGB components of the start and end colors
    var startColor = { r: 25, g: 210, b: 25 };
    var endColor = { r: 210, g: 0, b: 0 };

    // Interpolate between the start and end colors
    var r = Math.floor(startColor.r + (endColor.r - startColor.r) * (value / max));
    var g = Math.floor(startColor.g + (endColor.g - startColor.g) * (value / max));
    var b = Math.floor(startColor.b + (endColor.b - startColor.b) * (value / max));

    // Combine the RGB components into a single tint value
    return (r << 16) | (g << 8) | b;
  }
  
  getDifficultyColorFromType(type) {
    return {
      'Beginner': 0x00ffb2,
      'Easy': 0x00ff4c,
      'Medium': 0xffcc00,
      'Hard': 0xff7f00,
      'Challenge': 0xff4c00,
    }[type];
  }
  
  setInitialBackground() {
    // Set initial background
    if (this.song.chart.backgroundUrl && this.song.chart.backgroundUrl !== "no-media") {
      this.loadBackgroundImage(this.song.chart.background, this.song.chart.backgroundUrl);
    } else {
      this.clearBackground();
    }
  }
  
  songStart() {
    this.setInitialBackground();
    
    const FIXED_DELAY = 2000; 
    
    const chartOffset = this.song.chart.offset || 0;
    
    this.startTime = game.time.now + FIXED_DELAY - chartOffset * 1000;
    
    setTimeout(() => {
      this.audio?.play();
      this.started = true;
      if (window.recordNextGame) game.recorder.start(this.audio, 0);
    }, FIXED_DELAY + this.userOffset);
    
    this.audioEndListener = this.audio.addEventListener("ended", () => this.songEnd(), { once: true });
  }
  
  showCharacterCloseShot(duration) {
    const displayTime = Math.max(500, duration - 400);
    const closeShot = new CharacterCloseShot(2, 103, this.currentCharacter);
    closeShot.visible = false;
    this.overHud.addChild(closeShot);
    
    if (this.visualizer) {
      this.visualizer.graphics.visible = false;
    }

    const noiseSprite = game.add.sprite(2, 103, 'character_noise');
    noiseSprite.animations.add('static', [0, 1, 2, 3, 4, 5, 6, 7], 60, true);
    noiseSprite.animations.play('static');
    this.overHud.addChild(noiseSprite);

    game.time.events.add(200, () => {
      noiseSprite.destroy();
      closeShot.visible = true;
      closeShot.blink(game.rnd.between(0, 200));
    });

    game.time.events.add(displayTime, () => {
      closeShot.visible = false;
      const endNoise = game.add.sprite(2, 103, 'character_noise');
      endNoise.animations.add('static', [0, 1, 2, 3, 4, 5, 6, 7], 60, true);
      endNoise.animations.play('static');
      this.overHud.addChild(endNoise);
      
      game.time.events.add(200, () => {
        if (this.visualizer) {
          this.visualizer.graphics.visible = true;
        }
        endNoise.destroy();
        closeShot.destroy();
      });
    });
  }
  
  showGlitchAnimation(duration = 1000) {
    const glitch = game.add.sprite(0, 0, 'ui_glitch_animation');
    glitch.animations.add('glitch', [0, 1, 2, 3, 4, 5, 6], 12, true);
    glitch.animations.play('glitch');
    glitch.lifespan = duration;
    glitch.blendMode = PIXI.blendModes.ADD;
    this.overHud.addChild(glitch);
  }
  
  drawBackground(element) {
    // Check if element is errored
    if (element && element.__errored) {
      console.warn(`Skipping errored background: ${element.__url}`);
      this.drawFallbackBackground();
      return;
    }
    
    // Also check for naturalWidth/height for images
    if (element && element.__type === "image" && element.naturalWidth === 0) {
      console.warn(`Image has zero dimensions: ${element.__url}`);
      element.__errored = true;
      this.drawFallbackBackground();
      return;
    }
    
    try {
      this.backgroundCtx.drawImage(element, 0, 0, 192, 112);
      this.updateBackgroundTexture();
    } catch (error) {
      console.error("Error drawing background:", error);
      element.__errored = true;
      this.drawFallbackBackground();
    }
  }
  
  drawFallbackBackground() {
    // Use default song bg as fallback
    const element = this.preloadedBackgroundElements[this.song.chart.background];
    
    if (element && !element.__errored) {
      this.drawBackground(element);
    } else {
      this.clearBackground();
    }
  }
  
  clearBackground() {
    this.backgroundCtx.fillStyle = "#000000";
    this.backgroundCtx.fillRect(0, 0, 192, 112);
    this.updateBackgroundTexture();
    this.backgroundGradient.visible = true;
  }  
  
  updateBackgroundTexture() {
    if (this.backgroundSprite && this.backgroundSprite.game) {
      const texture = PIXI.Texture.fromCanvas(this.backgroundCanvas);
      this.backgroundSprite.loadTexture(texture);
    }
  }
  
  loadBackgroundImage(filename, url) {
    // Pause any existing video
    if (this.video) this.video.pause();
    
    // Check if there is already a background preloaded
    if (this.preloadedBackgroundElements[filename]) {
      const element = this.preloadedBackgroundElements[filename];
      
      // Check if element is errored
      if (element.__errored) {
        console.warn(`Preloaded background is errored: ${filename}`);
        this.drawFallbackBackground();
        return;
      }
      
      // Use the preloaded background
      this.drawBackground(element);
    } else {
      // Load the background in real time with error handling
      const img = document.createElement("img");
      img.__errored = false;
      img.__type = "image";
      img.__url = url;
      
      img.onload = () => {
        this.preloadedBackgroundElements[filename] = img;
        this.drawBackground(img);
      };
      
      img.onerror = () => {
        console.warn(`Failed to load background in realtime: ${filename}`);
        img.__errored = true;
        this.preloadedBackgroundElements[filename] = img;
        this.drawFallbackBackground();
      };
      
      img.src = url;
    }
    
    this.backgroundGradient.visible = true;
  }
  
  loadBackgroundVideo(filename, url) {
    // Pause any existing video
    if (this.video && this.video != this.preloadedBackgroundElements[filename]) this.video.pause();
    
    // Check if there is already a background preloaded
    if (this.preloadedBackgroundElements[filename]) {
      const element = this.preloadedBackgroundElements[filename];
      
      // Check if element is errored
      if (element.__errored) {
        console.warn(`Preloaded video is errored: ${filename}`);
        this.drawFallbackBackground();
        return;
      }
      
      // Use the preloaded background
      this.video = element;
    } else {
      // Load the background in real time with error handling
      const video = document.createElement("video");
      video.__errored = false;
      video.__type = "video";
      video.__url = url;
      
      video.src = url;
      video.muted = true;
      video.volume = 0;
      video.loop = true;
      video.autoplay = false;
      
      video.addEventListener("canplaythrough", () => {
        this.preloadedBackgroundElements[filename] = video;
        this.video = video;
        this.video.play();
        this.backgroundGradient.visible = false;
      }, { once: true });
      
      video.onerror = () => {
        console.warn(`Failed to load video in realtime: ${url}`);
        video.__errored = true;
        this.preloadedBackgroundElements[filename] = video;
        this.drawFallbackBackground();
      };
      
      console.warn("Couldn't find video:", filename, "Loading video in real time. This may affect performance");
    }
    
    if (this.video && !this.video.__errored) {
      this.video.currentTime = 0;
      this.video.play();
      this.backgroundGradient.visible = false;
      this.video.addEventListener("error", () => {
        console.warn(`Video playback error: ${filename}`);
        this.video.__errored = true;
        this.backgroundGradient.visible = true;
        this.drawFallbackBackground();
      }, { once: true });
    }
  }
  
  applyBackground(bg) {
    if (bg.file == '-nosongbg-') {
      this.clearBackground();
    } else if (bg.type == 'video') {
      this.loadBackgroundVideo(bg.file, bg.url);
    } else {
      this.loadBackgroundImage(bg.file, bg.url);
    }
    this.currentBackground = bg;
    this.applyBgEffects(bg);
  }
  
  applyBgEffects(bg) {
    if (bg.fadeIn) {
      this.backgroundSprite.alpha = 0;
      game.add.tween(this.backgroundSprite).to({ alpha: parseFloat(bg.opacity) * 0.6 }, 500, "Linear",true);
    } else {
      this.backgroundSprite.alpha = bg.opacity * 0.6;
    }
    
    // TODO: When applying bg effects take in account bg.fadeOut and bg.effect
  }
  
  songEnd() {
    // Return to editor if on playtest mode
    if (this.playtestMode) {
      game.state.start("Editor", true, false, this.song);
      return;
    }
    
    // Update character stats
    const gameResults = {
      score: this.player.score,
      accuracy: this.player.accuracy,
      maxCombo: this.player.maxCombo,
      character: this.currentCharacter,
      complete: !this.autoplay && this.player.accuracy >= 40,
      judgements: { ...this.player.judgementCounts },
      totalNotes: this.song.chart.notes.length,
      skillsUsed: this.skillSystem.getSkillsUsed(),
      difficultyRating: this.song.chart.difficulties[this.song.difficultyIndex].rating
    };
    
    // Calculate experience gain (0 if autoplay is enabled)
    const expGain = this.autoplay ? 0 : this.characterManager.calculateExperienceGain(gameResults);
    
    // Update character with experience and stats
    if (!this.autoplay) {
      // Save last song details
      Object.assign(Account.lastSong, gameResults);
      this.updateUserStats(gameResults);
      this.characterManager.updateCharacterStats(gameResults, expGain);
    }
    
    // Pass game data to Results state
    const gameData = {
      song: this.song,
      difficultyIndex: this.difficultyIndex,
      character: this.currentCharacter,
      autoplay: this.autoplay,
      playtestMode: this.playtestMode,
      player: this.player,
      expGain: expGain,
      gameResults: gameResults
    };
    
    game.state.start("Results", true, false, gameData);
  }
  
  updateUserStats(gameResults) {
    if (!Account.stats) {
      Account.stats = { ...DEFAULT_ACCOUNT.stats };
    }
    
    if (gameResults.complete) {
      Account.stats.totalGamesPlayed++;
      const difficultyType = this.song.chart.difficulties[this.song.difficultyIndex].type;
      Account.stats[`total${difficultyType}GamesPlayed`] += 1;
    }
    Account.stats.totalScore += this.player.score;
    Account.stats.maxCombo = Math.max(Account.stats.maxCombo, this.player.maxCombo);
    
    if (this.player.accuracy >= 100) {
      Account.stats.perfectGames++;
    }
    
    // Update judgement counts
    Account.stats.totalNotesHit += Object.values(this.player.judgementCounts).reduce((a, b) => a + b, 0);
    Account.stats.totalMarvelous += this.player.judgementCounts.marvelous || 0;
    Account.stats.totalPerfect += this.player.judgementCounts.perfect || 0;
    Account.stats.totalGreat += this.player.judgementCounts.great || 0;
    Account.stats.totalGood += this.player.judgementCounts.good || 0;
    Account.stats.totalBoo += this.player.judgementCounts.boo || 0;
    Account.stats.totalMiss += this.player.judgementCounts.miss || 0;
    
    // Update max values
    Account.stats.maxMarvelousInGame = Math.max(
      Account.stats.maxMarvelousInGame, 
      this.player.judgementCounts.marvelous || 0
    );
    
    Account.stats.maxSkillsInGame = Math.max(
      Account.stats.maxSkillsInGame,
      this.skillSystem.getSkillsUsed()
    );
    
    // Update achievements
    const achievementsManager = new AchievementsManager();
    achievementsManager.updateStats(gameResults);
  }
  
  togglePause() {
    if (this.isAnimating) return;
    
    if (!this.isPaused) {
      this.pause();
    } else {
      this.resume();
    }
  }
  
  pause() {
    if (!this.started) return;
    this.isPaused = true;
    this.pauseStartTime = game.time.now;
    this.audio?.pause();
    this.video?.pause();
    this.showPauseMenu();
  }
  
  resume() {
    this.isPaused = false;
    this.totalPausedDuration += game.time.now - this.pauseStartTime;
    this.video?.play();
    this.audio?.play();
    this.hidePauseMenu();
  }
  
  showPauseMenu() {
    const x = 10;
    const y = game.height / 2 - 20;
    const width = 80;
    const height = 60;
    
    this.pauseBg = game.add.graphics(0, 0);
    
    this.pauseBg.beginFill(0x000000, 0.6);
    this.pauseBg.drawRect(0, 0, 192, 112);
    this.pauseBg.endFill();
    
    this.pauseCarousel = new CarouselMenu(x, y, width, height, {
      bgcolor: "brown",
      fgcolor: "#ffffff",
      align: "center",
      animate: true
    });
    
    this.pauseCarousel.addItem("CONTINUE", () => this.resume());
    if (this.autoplay && !this.playtestMode) {
      this.pauseCarousel.addItem("DISABLE AUTOPLAY", () => {
        Account.settings.autoplay = false;
        game.state.start("SongSelect", true, false, null, null, true);
      });
    }
    if (this.playtestMode) {
      if (this.autoplay) {
        this.pauseCarousel.addItem("DISABLE AUTOPLAY", () => game.state.start("Play", true, false, this.song, this.difficultyIndex, true, false));
      } else {
        this.pauseCarousel.addItem("ENABLE AUTOPLAY", () => game.state.start("Play", true, false, this.song, this.difficultyIndex, true, true));
      }
    }
    this.pauseCarousel.addItem("RESTART", () => game.state.start("Play", true, false, this.song, this.difficultyIndex, this.playtestMode, this.autoplay));
    this.pauseCarousel.addItem(this.playtestMode ? "BACK TO EDITOR" : "GIVE UP", () => this.songEnd());
    
    game.onMenuIn.dispatch('pause', this.pauseCarousel);
    
    if (!this.playtestMode) {
      this.pauseCarousel.addItem("QUIT", () => game.state.start("MainMenu"));
    }
    
    this.pauseCarousel.onCancel.add(() => this.resume());
  }
  
  hidePauseMenu() {
    if (this.pauseCarousel) {
      this.pauseBg.destroy();
      this.pauseCarousel.destroy();
      this.pauseCarousel = null;
    }
  }
  
  getCurrentTime() {
    if (this.isPaused) {
      const elapsed = this.pauseStartTime - this.startTime - this.totalPausedDuration + this.userOffset;
      return {
        now: elapsed / 1000,
        beat: this.secToBeat(elapsed / 1000)
      };
    } else {
      const elapsed = game.time.now - this.startTime - this.totalPausedDuration + this.userOffset;
      return {
        now: elapsed / 1000,
        beat: this.secToBeat(elapsed / 1000)
      };
    }
  }
  
  secToBeat(sec) {
    return this.player ? this.player.secToBeat(sec) : 0;
  }
  
  updateBackgrounds() {
    const { beat } = this.getCurrentTime();
    
    // Check for background(s) needed for this beat
    this.song.chart.backgrounds.forEach(bg => {
      if (beat >= bg.beat && !bg.activated) {
        bg.activated = true;
        this.backgroundQueue.push(bg);
      }
    });
    
    // Process the queue
    if (this.backgroundQueue.length > 0) {
      const nextBG = this.backgroundQueue.shift();
      this.applyBackground(nextBG);
    }
    
    // Update video if needed
    this.updateVideo();
  }
  
  updateVideo() {
    if (this.video && 
        !this.video.__errored &&
        this.currentBackground && 
        this.currentBackground.type == "video" && 
        game.time.now - this.lastVideoUpdateTime >= (game.time.elapsedMS * 3)) {
      
      this.lastVideoUpdateTime = game.time.now;
      
      // Check video ready state
      if (this.video.readyState >= 2) { // HAVE_CURRENT_DATA or better
        try {
          this.drawBackground(this.video);
        } catch (error) {
          console.error("Error updating video frame:", error);
          this.video.__errored = true;
          this.drawFallbackBackground();
        }
      }
    }
  }
  
  update() {
    gamepad.update();
        
    if (this.isPaused) return;
    
    // Pause with start button
    if (gamepad.pressed.start && !this.lastStart) {
      this.togglePause();
    }
    this.lastStart = gamepad.pressed.start;
    
    // Update skill system
    if (this.skillSystem) {
      this.skillSystem.update();
    }
    
    // Update lyrics with current time
    if (this.hasLyricsFile && this.lyrics && this.started) {
      const currentTime = this.getCurrentTime().now;
      this.lyrics.move(currentTime);
    }
    
    // Update visualizer
    if (this.visualizer && game.time.now - this.lastVisualizerUpdateTime >= game.time.elapsedMS * 2) {
      this.visualizer.update();
      this.lastVisualizerUpdateTime = game.time.now;
    }
    
    // Handle assist tick toggle with Select button
    if (gamepad.pressed.select && !this.lastSelect) {
      this.metronome.toggle();
    }
    this.lastSelect = gamepad.pressed.select;
    
    // Update assist tick metronome
    if (this.metronome) {
      this.metronome.update();
    }
    
    // Update autoplay text
    let text = "";
    if (this.autoplay) {
      text = this.metronome.enabled ? "AUTOPLAY + METRONOME" : "AUTOPLAY";
    } else if (this.metronome.enabled) {
      text = "METRONOME";
    }
    if (this.autoplayText.text != text) this.autoplayText.write(text);
    
    this.player.update();
    
    if (this.started) this.updateBackgrounds();
    
    this.hud.bringToTop();
    this.hud.alpha = this.player.gameOver ? 0.5 : 1;
    
    this.overHud.bringToTop();
    
    this.judgementText.bringToTop();
    this.comboText.bringToTop();
  }
  
  render() {
    if (this.player) {
      this.player.render();
    }
  }
  
  shutdown() {
    this.shootingDown = true;
    
    this.audio.removeEventListener("ended", this.audioEndListener);
    window.removeEventListener("visibilitychange", this.visibilityChangeListener);
    this.audio.pause();
    this.audio.src = "";
    
    if (this.video) {
      this.video.pause();
      this.video.src = "";
    }
    
    this.song.chart.backgrounds.forEach(bg => bg.activated = false);
    
    // Forget preloaded backgrounds
    Object.entries(this.preloadedBackgroundElements).forEach(element => {
      if (element) {
        element.src = "";
      }
    });
    
    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = null;
    }
    
    if (this.metronome) {
      this.metronome.destroy();
      this.metronome = null;
    }
    
    // Stop recording and show video
    if (window.recordNextGame) {
      game.recorder.stop();
      game.recorder = null;
      window.recordNextGame = false;
    }
  }
}

class Results {
  init(gameData) {
    this.gameData = gameData;
    this.isNewRecord = false;
    this.finalScore = 0;
    this.finalAccuracy = 0;
    this.scoreRating = "";
  }

  create() {
    game.camera.fadeIn(0x000000);
    
    new FuturisticLines();
    
    new BackgroundGradient();
    
    const { song, player } = this.gameData;
    const difficulty = song.chart.difficulties[song.difficultyIndex];
    
    this.finalScore = player.score;
    this.finalAccuracy = player.accuracy;
    this.scoreRating = player.getScoreRating();
    
    this.previewAudio = document.createElement("audio");
    this.previewAudio.volume = [0,25,50,75,100][Account.settings.volume] / 100;
    
    this.visibilityChangeListener = () => {
      if (document.hidden) {
        this.previewAudio?.pause();
      } else {
        this.previewAudio?.play();
      }
    };
    
    window.addEventListener('visibilitychange', this.visibilityChangeListener);

    // Save high score and check if it's a new record
    this.isNewRecord = this.saveHighScore(song, difficulty, player);
    
    this.displayResults();
    if (this.gameData.character) {
      this.showCharacterExp();
    }
    
    this.showMenu();
    
    // Execute addon behaviors for this state
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  saveHighScore(song, difficulty, player) {
    if (this.gameData.autoplay) {
      return false;
    }
    
    const songKey = this.getSongKey(song);
    const difficultyKey = `${difficulty.type}${difficulty.rating}`;
    
    if (!Account.highScores[songKey]) {
      Account.highScores[songKey] = {};
    }
    
    const currentHighScore = Account.highScores[songKey][difficultyKey];
    const newScoreData = {
      score: player.score,
      accuracy: player.accuracy,
      rating: player.getScoreRating(),
      maxCombo: player.maxCombo,
      date: Date.now(),
      judgements: { ...player.judgementCounts }
    };
    
    let isNewRecord = false;
    
    if (!currentHighScore || player.score > currentHighScore.score) {
      Account.highScores[songKey][difficultyKey] = newScoreData;
      saveAccount();
      isNewRecord = true;
    }
    
    return isNewRecord;
  }

  getSongKey(song) {
    // Create unique key for song (for both local and external)
    if (song.chart.folderName) {
      return `local_${song.chart.folderName}`;
    } else if (song.chart.audioUrl) {
      // For external songs, use audio URL hash
      return `external_${this.hashString(song.chart.audioUrl)}`;
    }
    return `unknown_${Date.now()}`;
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  displayResults() {
    const { song, player } = this.gameData;
    const difficulty = song.chart.difficulties[song.difficultyIndex];
    
    // Banner
    this.bannerImg = document.createElement("img");
    
    this.bannerCanvas = document.createElement("canvas");
    this.bannerCtx = this.bannerCanvas.getContext("2d");
    
    this.bannerSprite = game.add.sprite(112, 10);
    
    if (song.chart.audioUrl) {
      // Load and play preview
      this.previewAudio.src = song.chart.audioUrl;
      this.previewAudio.currentTime = song.chart.sampleStart || 0;
      this.previewAudio.play();
    }
    if (song.chart.bannerUrl) {
      this.bannerImg.src = song.chart.bannerUrl;
      this.bannerImg.onload = () => {
        this.bannerCtx.drawImage(this.bannerImg, 0, 0, 72, 28);
        this.bannerSprite.loadTexture(PIXI.Texture.fromCanvas(this.bannerCanvas));
      };
    }
    
    // Song info
    const title = song.chart.titleTranslit || song.chart.title;
    
    this.songText = new Text(8, 10, `${title}`, FONTS.shaded);
    this.diffText = new Text(10, 20, `${difficulty.type} (${difficulty.rating})`);
    this.diffText.tint = new Play().getDifficultyColor(difficulty.rating);
    
    if (title.length > 25) this.songText.scrollwrite(title, 25);
    
    // Don't celebrate if autoplay is enabled
    const autoplay = this.gameData.autoplay;
    
    // Score
    this.scoreText = new Text(10, 30, `SCORE: ${autoplay ? "---" : this.finalScore.toLocaleString()}`, FONTS.default);
    
    // Accuracy
    this.accuracyText = new Text(10, 40, `ACCURACY: ${autoplay ? "---" : `${this.finalAccuracy.toFixed(2)}%`}`, FONTS.default);
    
    // Rating
    this.ratingText = new Text(10, 50, `RATING: ${autoplay ? "AUTO" : this.scoreRating}`, FONTS.shaded);
    this.ratingText.tint = this.getRatingColor(this.scoreRating);
    
    // Combo
    this.comboText = new Text(10, 60, `MAX COMBO: ${autoplay ? "---" : player.maxCombo}`, FONTS.default);
    
    // Judgements
    this.judgementsText = new Text(15, 70, autoplay ? "\nAUTOPLAY ENABLED" : this.getJudgementsText(player.judgementCounts));
    this.judgementsText.tint = autoplay ? 0xff0000 : 0xffffff;
    
    // New record indicator
    if (!autoplay && this.isNewRecord) {
      this.recordText = new Text(this.scoreText.right + 4, this.scoreText.y, "NEW RECORD!", FONTS.shaded);
      this.recordText.anchor.x = 0.5;
      this.recordText.x += this.scoreText.width / 2;
      this.recordText.tint = 0xFFD700; // Gold color
      
      // Pulse animation for new record
      game.add.tween(this.recordText.scale).to({ x: 1.2, y: 1.2 }, 500, "Linear", true).yoyo(true).repeat(-1);
    }
  }
  
  showCharacterExp() {
    const portrait = new CharacterPortrait(112, 41, this.gameData.character || null);
    
    const nameText = new Text(128, 42, "", FONTS.shaded);
    
    const levelText = new Text(0, 42, "");
    
    const expBar = new ExperienceBar(129, 50, 40, 3);
    
    if (this.gameData.character) {
      nameText.write(this.gameData.character.name);
      
      const storyEntry = this.gameData.character.getLastExperienceStoryEntry();
      const expCurve = CHARACTER_SYSTEM.EXPERIENCE_CURVE;
      
      if (storyEntry) {
        let currentExp = storyEntry.expBefore;
        let currentLevel = storyEntry.levelBefore;
        
        levelText.x = nameText.right + 8;
        levelText.write(`Lv. ${currentLevel}`);
        
        expBar.setProgress(currentExp / expCurve(currentLevel));
        
        function animate(currentExp, currentLevel) {
          if (currentExp < expCurve(currentLevel)) {
            currentExp ++;
            ENABLE_EXP_SFX && Audio.play("exp_up", 0.6);
          } else {
            currentExp = 0;
            currentLevel ++;
            levelText.write(`Lv. ${currentLevel}`);
            ENABLE_EXP_SFX && Audio.play("level_up", 0.9);
          }
          expBar.setProgress(currentExp / expCurve(currentLevel));
          if (currentLevel < storyEntry.levelAfter || currentExp < storyEntry.expAfter) {
            game.time.events.add(100, () => animate(currentExp, currentLevel));
          }
        }
        
        if (this.gameData.expGain) game.time.events.add(600, () => animate(currentExp, currentLevel));
      }
    }
  }
  
  showMenu() {
    this.navigationHint = new NavigationHint(1);
    
    const height = this.gameData.character ? 72 : 80;
    const y = this.gameData.character ? 53 : 40;
    
    const menu = new CarouselMenu(108, y, 80, height, {
      bgcolor: 'brown',
      fgcolor: '#ffffff'
    });
    
    menu.addItem("NEXT", () => {
      game.state.start("SongSelect", true, false, null, window.selectStartingIndex + 1, true, "auto");
    });
    menu.addItem("CONTINUE", () => game.state.start("SongSelect"));
    if (Account.settings.autoplay) {
      menu.addItem("DISABLE AUTOPLAY", () => {
        Account.settings.autoplay = false;
        game.state.start("SongSelect");
      });
    }
    menu.addItem("RETRY", () => game.state.start("Play", true, false, this.gameData.song));
    menu.addItem("QUIT", () => game.state.start("MainMenu"));
    
    game.onMenuIn.dispatch('results', menu);
  }
  
  getJudgementsText(judgements) {
    return `MARVELOUS: ${judgements.marvelous}\n` +
           `PERFECT: ${judgements.perfect}\n` +
           `GREAT: ${judgements.great}\n` +
           `GOOD: ${judgements.good}\n` +
           `BOO: ${judgements.boo}\n` +
           `MISS: ${judgements.miss}`;
  }

  getRatingColor(rating) {
    const colors = {
      "SSS+": 0xFFD700, // Gold
      "SSS": 0xFFD700,  // Gold
      "SS": 0xF0F0F0,   // Silver
      "S": 0xF0F0F0,    // Silver
      "A": 0x00FF00,    // Green
      "B": 0x0000FF,    // Blue
      "C": 0xFFFF00,    // Yellow
      "D": 0xFFA500,    // Orange
      "E": 0xFF0000,    // Red
      "F": 0x800080     // Purple
    };
    return colors[rating] || 0xFFFFFF;
  }

  update() {
    gamepad.update();
  }
  
  shutdown() {
    this.previewAudio.pause();
    this.previewAudio.src = null;
    this.previewAudio = null;
    this.bannerImg.src = "";
    this.bannerImg = null;
    this.bannerCanvas = null;
    this.bannerCtx = null;
    window.removeEventListener("visibilitychange", this.visibilityChangeListener);
  }
}

class Jukebox {
  init(songs = null, startIndex = 0) {
    this.songs = songs || (window.localSongs && window.externalSongs ? [...window.localSongs, ...window.externalSongs] : window.localSongs) || [];
    this.currentIndex = startIndex || 0;
    this.currentSong = this.songs[this.currentIndex];
    this.isPlaying = false;
    this.isShuffled = false;
    this.menuVisible = false;
    this.songListMenuVisible = false;
    this.originalSongOrder = [...this.songs];
    this.visualizerMode = 'symmetrical';
    this.seekSpeed = 1; // seconds per key press
    this.lastSeekTime = 0;
    this.seekCooldown = 60; // ms between seek actions
    this.doublePressTimeout = 200; // ms between presses to be considered a double press
    
    // Background system
    this.currentBackground = null;
    this.backgroundQueue = [];
    this.backgroundSprite = null;
    this.videoElement = null;
    
    // Visualizer
    this.visualizer = null;
    
    // LRC system
    this.lyrics = null;
    this.hasLyrics = false;
    
    // Fullscreen mode
    this.fullscreenMode = false;
    
    // Button states and timers
    this.buttonActiveTimers = {};
    this.lastLeftPress = 0;
    this.lastRightPress = 0;
    this.lastSelectPress = 0;
    this.lastBPress = 0;
    
    // Remember playback position
    this.playbackPositions = {};
  }

  create() {
    game.camera.fadeIn(0x000000);
    
    // Setup background
    this.setupBackground();
    
    // Setup audio player
    this.setupAudioPlayer();
    
    // Setup UI
    this.setupUI();
    
    // Setup visualizer
    this.setupVisualizer();
    
    // Setup lyrics
    this.setupLyrics();
    
    // Add navigation hint
    this.navigationHint = new NavigationHint(3);
    
    // Load first song
    this.loadSong(this.currentIndex);
    
    // Execute addon behaviors
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  setupBackground() {
    this.backgroundSprite = game.add.sprite(0, 0);
    this.backgroundSprite.alpha = 0.4;
    
    // Create video element for background videos
    this.videoElement = document.createElement("video");
    this.videoElement.muted = true;
    this.videoElement.loop = true;
  }

  setupAudioPlayer() {
    if (backgroundMusic) {
      backgroundMusic.stop();
    }
    
    this.audioElement = document.createElement("audio");
    this.audioElement.volume = [0,25,50,75,100][Account.settings.volume] / 100;
    
    this.audioElement.addEventListener('timeupdate', () => {
      this.updateProgressBar();
      this.updateTimeDisplay();
    });
    
    this.audioElement.addEventListener('ended', () => {
      this.nextSong(true);
    });
    
    this.audioElement.addEventListener('error', (e) => {
      console.warn("Audio error:", e);
    });
  }

  setupUI() {
    // Background gradient for readability
    this.uiBackground = game.add.graphics(0, 0);
    this.uiBackground.beginFill(0x000000, 0.7);
    this.uiBackground.drawRect(0, 80, game.width, 32);
    this.uiBackground.endFill();
    
    // Song banner
    this.bannerSprite = game.add.sprite(4, 4);
    
    // Song metadata
    this.songTitle = new Text(102, 4, "", FONTS.shaded);
    this.songArtist = new Text(104, 14, "", FONTS.default);
    this.songCredit = new Text(104, 24, "", FONTS.default);
    
    // Playback time displays
    this.currentTimeText = new Text(4, 84, "0:00", FONTS.default);
    this.durationText = new Text(188, 84, "0:00", FONTS.default);
    this.durationText.anchor.x = 1;
    
    // Progress bar
    this.progressBarBg = game.add.graphics(30, 86);
    this.progressBarBg.lineStyle(2, 0x666666, 1);
    this.progressBarBg.moveTo(0, 0);
    this.progressBarBg.lineTo(132, 0);
    
    this.progressBar = game.add.graphics(30, 86);
    
    // Create playback controls
    this.createPlaybackControls();
    
    // Create lyrics display
    this.lyricsText = new Text(game.width / 2, 51, "", FONTS.stroke);
    this.lyricsText.anchor.set(0.5);
    this.lyricsText.visible = true; // Always visible
  }

  createPlaybackControls() {
    const centerX = game.width / 2;
    const yPos = 70;
    const buttonSpacing = 2; // 2px separation between buttons
    
    const buttonWidths = {
        visualization: 8,
        skip: 8,
        seek: 8,
        pause: 12,
        menu: 8
    };
    
    // Calculate total width including buttons and spacing
    const totalWidth = 
        buttonWidths.visualization + buttonSpacing +
        buttonWidths.skip + buttonSpacing +
        buttonWidths.seek + buttonSpacing +
        buttonWidths.pause + buttonSpacing +
        buttonWidths.seek + buttonSpacing +
        buttonWidths.skip + buttonSpacing +
        buttonWidths.menu;
    
    const startX = centerX - (totalWidth / 2);
    let currentX = startX;
    
    // Visualization button (leftmost)
    this.visualizationButton = game.add.sprite(currentX + buttonWidths.visualization/2, yPos, "ui_jukebox_visualization", 0);
    this.visualizationButton.anchor.set(0.5);
    currentX += buttonWidths.visualization + buttonSpacing;
    
    // Left skip button
    this.skipLeftButton = game.add.sprite(currentX + buttonWidths.skip/2, yPos, "ui_jukebox_skip", 0);
    this.skipLeftButton.anchor.set(0.5);
    this.skipLeftButton.scale.x = -1; // Flip horizontally for left arrow
    currentX += buttonWidths.skip + buttonSpacing;
    
    // Left seek button
    this.seekLeftButton = game.add.sprite(currentX + buttonWidths.seek/2, yPos, "ui_jukebox_seek", 0);
    this.seekLeftButton.anchor.set(0.5);
    this.seekLeftButton.scale.x = -1; // Flip horizontally for left arrow
    currentX += buttonWidths.seek + buttonSpacing;
    
    // Pause/Play toggle button (center) - larger button
    this.pauseButton = game.add.sprite(currentX + buttonWidths.pause/2, yPos, "ui_jukebox_pause_toggle", 0);
    this.pauseButton.anchor.set(0.5);
    currentX += buttonWidths.pause + buttonSpacing;
    
    // Right seek button
    this.seekRightButton = game.add.sprite(currentX + buttonWidths.seek/2, yPos, "ui_jukebox_seek", 0);
    this.seekRightButton.anchor.set(0.5);
    currentX += buttonWidths.seek + buttonSpacing;
    
    // Right skip button
    this.skipRightButton = game.add.sprite(currentX + buttonWidths.skip/2, yPos, "ui_jukebox_skip", 0);
    this.skipRightButton.anchor.set(0.5);
    currentX += buttonWidths.skip + buttonSpacing;
    
    // Fullscreen button (rightmost)
    this.menuButton = game.add.sprite(currentX + buttonWidths.menu/2, yPos, "ui_jukebox_menu", 0);
    this.menuButton.anchor.set(0.5);
  }

  setupVisualizer() {
    this.visualizer = new FullScreenAudioVisualizer(this.audioElement, {
      visualizationType: this.visualizerMode,
      barColor: 0x76fcde,
      barWidth: 3,
      barSpacing: 1,
      barBaseHeight: 5,
      barMaxHeight: 40,
      alpha: 0.6,
      fftSize: 512,
      smoothing: 0.7
    });
  }

  setupLyrics() {
    // Check if current song has lyrics
    if (this.currentSong.lyrics) {
      this.loadLyrics(this.currentSong.lyricsContent);
    } else {
      this.lyrics = null;
      this.hasLyrics = false;
    }
  }

  loadLyrics(lrcContent) {
    if (lrcContent && lrcContent != "") {
      this.lyrics = new Lyrics({
        textElement: this.lyricsText,
        maxLineLength: 25,
        lrc: lrcContent
      });
      
      this.hasLyrics = true;
    } else {
      this.lyrics = null;
      this.hasLyrics = false;
    }
  }

  getSongKey(song) {
    // Create unique key for song
    if (song.folderName) {
      return `local_${song.folderName}`;
    } else if (song.audioUrl) {
      let hash = 0;
      for (let i = 0; i < song.audioUrl.length; i++) {
        const char = song.audioUrl.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return `external_${hash.toString(36)}`;
    }
    return `unknown_${Date.now()}`;
  }

  resetPlaybackPosition() {
    if (this.audioElement && this.currentSong) {
      const songKey = this.getSongKey(this.currentSong);
      this.playbackPositions[songKey] = 0;
    }
  }
  
  savePlaybackPosition() {
    if (this.audioElement && this.currentSong) {
      const songKey = this.getSongKey(this.currentSong);
      this.playbackPositions[songKey] = this.audioElement.currentTime;
    }
  }

  loadPlaybackPosition() {
    if (this.currentSong) {
      const songKey = this.getSongKey(this.currentSong);
      const savedPosition = this.playbackPositions[songKey];
      if (savedPosition && savedPosition > 0) {
        return savedPosition;
      }
    }
    return 0;
  }

  loadSong(index, reset) {
    if (index < 0 || index >= this.songs.length) return;
    
    // Save or reset current playback position before switching
    if (reset) {
      this.resetPlaybackPosition();
    } else {
      this.savePlaybackPosition();
    }
    
    // Stop current playback
    this.audioElement.pause();
    this.isPlaying = false;
    
    // Update current index and song
    this.currentIndex = index;
    this.currentSong = this.songs[this.currentIndex];
    
    // Load audio
    this.audioElement.src = this.currentSong.audioUrl;
    
    // Update UI
    this.updateSongDisplay();
    this.updateBackground();
    
    // Load lyrics for new song
    this.setupLyrics();
    
    // Start playback from saved position or beginning
    const startTime = this.loadPlaybackPosition();
    this.audioElement.currentTime = startTime;
    
    this.play();
  }

  updateSongDisplay() {
    const song = this.currentSong;
    
    // Update text displays
    this.songTitle.write(song.titleTranslit || song.title || "Unknown Title", 21);
    this.songArtist.write(song.artistTranslit || song.artist || "Unknown Artist", 21);
    this.songCredit.write(song.credit || "", 21);
    
    // Load banner
    if (song.bannerUrl && song.bannerUrl !== "no-media") {
      const bannerImg = new Image();
      bannerImg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 96;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bannerImg, 0, 0, 96, 32);
        const texture = PIXI.Texture.fromCanvas(canvas);
        this.bannerSprite.loadTexture(texture);
      };
      bannerImg.src = song.bannerUrl;
    } else {
      this.bannerSprite.loadTexture(null);
    }
  }

  updateBackground() {
    // TODO: Implement background videos correctly 
    
    // Clear current background
    this.backgroundSprite.loadTexture(null);
    this.videoElement.src = "";
    
    // Load song background
    if (this.currentSong.backgroundUrl && this.currentSong.backgroundUrl !== "no-media") {
      const bgImg = new Image();
      bgImg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 192;
        canvas.height = 112;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bgImg, 0, 0, 192, 112);
        const texture = PIXI.Texture.fromCanvas(canvas);
        this.backgroundSprite.loadTexture(texture);
      };
      bgImg.src = this.currentSong.backgroundUrl;
    }
    
    // Handle background videos
    if (this.currentSong.videoUrl) {
      this.videoElement.src = this.currentSong.videoUrl;
      this.videoElement.play();
      
      // Update video frame periodically
      this.lastVideoUpdate = game.time.now;
    }
  }

  updateDurationDisplay() {
    const duration = this.audioElement.duration;
    if (isNaN(duration) || duration == Infinity) {
      this.durationText.write("--:--");
      return;
    };
    
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    this.durationText.write(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }

  updateProgressBar() {
    const currentTime = this.audioElement.currentTime;
    const duration = this.audioElement.duration;
    
    if (isNaN(duration) || duration === 0) return;
    
    const progress = currentTime / duration;
    const barWidth = 132 * progress;
    
    this.progressBar.clear();
    this.progressBar.lineStyle(2, 0x76fcde, 1);
    this.progressBar.moveTo(0, 0);
    this.progressBar.lineTo(barWidth, 0);
  }

  updateTimeDisplay() {
    const currentTime = this.audioElement.currentTime;
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    this.currentTimeText.write(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }

  updateFullscreenMode() {
    if (this.fullscreenMode) {
      // Fullscreen mode: background alpha 1, hide UI elements except lyrics
      this.backgroundSprite.alpha = 1;
      this.uiBackground.visible = false;
      this.bannerSprite.visible = false;
      this.songTitle.visible = false;
      this.songArtist.visible = false;
      this.songCredit.visible = false;
      this.currentTimeText.visible = false;
      this.durationText.visible = false;
      this.progressBarBg.visible = false;
      this.progressBar.visible = false;
      this.visualizationButton.visible = false;
      this.skipLeftButton.visible = false;
      this.seekLeftButton.visible = false;
      this.pauseButton.visible = false;
      this.seekRightButton.visible = false;
      this.skipRightButton.visible = false;
      this.menuButton.visible = false;
      this.navigationHint.visible = false;
    } else {
      // Normal mode: restore all UI elements
      this.backgroundSprite.alpha = 0.4;
      this.uiBackground.visible = true;
      this.bannerSprite.visible = true;
      this.songTitle.visible = true;
      this.songArtist.visible = true;
      this.songCredit.visible = true;
      this.currentTimeText.visible = true;
      this.durationText.visible = true;
      this.progressBarBg.visible = true;
      this.progressBar.visible = true;
      this.visualizationButton.visible = true;
      this.skipLeftButton.visible = true;
      this.seekLeftButton.visible = true;
      this.pauseButton.visible = true;
      this.seekRightButton.visible = true;
      this.skipRightButton.visible = true;
      this.menuButton.visible = true;
      this.navigationHint.visible = true;
    }
    
    // Lyrics are always visible in both modes
    this.lyricsText.visible = true;
  }

  toggleFullscreen() {
    this.fullscreenMode = !this.fullscreenMode;
    this.updateFullscreenMode();
  }

  updateButtonStates() {
    const currentTime = game.time.now;
    
    // Update menu button based on active timer
    this.menuButton.frame = this.buttonActiveTimers.menu > currentTime ? 1 : 0;
    
    if (this.menuVisible || this.songListMenuVisible) return;
    
    // Update pause button based on playback state
    const pauseFrame = this.isPlaying ? 0 : 1; // 0 = pause icon, 1 = play icon
    this.pauseButton.frame = pauseFrame;
    
    // Update seek buttons based on held state
    this.seekLeftButton.frame = gamepad.held.left ? 1 : 0;
    this.seekRightButton.frame = gamepad.held.right ? 1 : 0;
    
    // Update skip buttons based on active timers
    this.skipLeftButton.frame = this.buttonActiveTimers.skipLeft > currentTime ? 1 : 0;
    this.skipRightButton.frame = this.buttonActiveTimers.skipRight > currentTime ? 1 : 0;
    
    // Update visualization button based on active timer
    this.visualizationButton.frame = this.buttonActiveTimers.visualization > currentTime ? 1 : 0;
  }

  setButtonActive(buttonName, duration = 100) {
    this.buttonActiveTimers[buttonName] = game.time.now + duration;
  }

  changeVolume(delta) {
    let currentVolume = Account.settings.volume;
    let newVolume = currentVolume + delta;
    
    // Clamp volume between 0 and 4 (0%, 25%, 50%, 75%, 100%)
    newVolume = Phaser.Math.clamp(newVolume, 0, 4);
    
    if (newVolume !== currentVolume) {
      Account.settings.volume = newVolume;
      saveAccount();
      
      // Update audio volume
      this.audioElement.volume = [0,25,50,75,100][newVolume] / 100;
      
      // Show volume feedback
      const volumeLevels = ["MUTE", "25%", "50%", "75%", "100%"];
      notifications.show(`VOLUME: ${volumeLevels[newVolume]}`, 1000);
    }
  }

  play() {
    this.audioElement.play().then(() => {
      this.isPlaying = true;
    }).catch(error => {
      console.warn("Playback failed:", error);
      this.isPlaying = false;
      // On error, try to start from beginning
      this.audioElement.currentTime = 0;
      this.play();
    });
  }

  pause() {
    this.audioElement.pause();
    this.isPlaying = false;
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    
    // Show active frame on pause button
    this.pauseButton.frame = 2; // Active frame
    this.setButtonActive('pause', 100);
  }

  nextSong(reset) {
    let nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.songs.length) {
      nextIndex = 0; // Loop to beginning
    }
    this.loadSong(nextIndex, reset);
  }

  previousSong() {
    let prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.songs.length - 1; // Loop to end
    }
    this.loadSong(prevIndex);
  }

  toggleShuffle() {
    this.isShuffled = !this.isShuffled;
    
    if (this.isShuffled) {
      // Shuffle the playlist (Fisher-Yates algorithm)
      const shuffled = [...this.songs];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      this.songs = shuffled;
    } else {
      // Restore original order
      this.songs = [...this.originalSongOrder];
    }
    
    // Show active frame on visualization button for shuffle
    this.setButtonActive('visualization', 100);
  }

  seekForward() {
    const currentTime = this.audioElement.currentTime;
    const newTime = Math.min(currentTime + this.seekSpeed, this.audioElement.duration || Infinity);
    this.audioElement.currentTime = newTime;
  }

  seekBackward() {
    const currentTime = this.audioElement.currentTime;
    const newTime = Math.max(currentTime - this.seekSpeed, 0);
    this.audioElement.currentTime = newTime;
  }

  changeVisualizerMode() {
    const modes = ['bars', 'symmetrical', 'waveform', 'circular'];
    const currentIndex = modes.indexOf(this.visualizerMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.visualizerMode = modes[nextIndex];
    
    this.visualizer.setVisualizationType(this.visualizerMode);
    
    // Show active frame on visualization button
    this.setButtonActive('visualization', 100);
  }

  showSongList() {
    this.songListMenuVisible = true;
    
    const menuBg = game.add.graphics(0, 0);
    menuBg.beginFill(0x000000, 0.7);
    menuBg.drawRect(0, 0, game.width, game.height);
    menuBg.endFill();
    
    const menu = new CarouselMenu(20, 20, 152, 72, {
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      align: 'left',
      disableScrollBar: false
    });
    
    // Add all songs to the menu
    this.songs.forEach((song, index) => {
      const title = song.titleTranslit || song.title || `Song ${index + 1}`;
      const isCurrent = index === this.currentIndex;
      const displayText = isCurrent ? `> ${title}` : `  ${title}`;
      
      menu.addItem(
        displayText,
        () => {
          if (index !== this.currentIndex) {
            this.loadSong(index);
          }
          menu.destroy();
          menuBg.destroy();
          this.songListMenuVisible = false;
        },
        { 
          song: song, 
          index: index,
          bgcolor: isCurrent ? '#9b59b6' : 'brown'
        }
      );
    });
    
    menu.onCancel.add(() => {
      menu.destroy();
      menuBg.destroy();
      this.songListMenuVisible = false;
    });
    
    // Set initial selection to current song
    menu.selectedIndex = this.currentIndex;
    menu.updateSelection();
  }

  showMenu() {
    this.menuVisible = true;
    
    this.setButtonActive('menu', 100);
    
    const menuBg = game.add.graphics(0, 0);
    menuBg.beginFill(0x000000, 0.7);
    menuBg.drawRect(0, 0, game.width, game.height);
    menuBg.endFill();
    
    const menu = new CarouselMenu(60, 40, 72, 40, {
      bgcolor: 'brown',
      fgcolor: '#ffffff',
      align: 'center'
    });
    
    menu.addItem("Continue", () => {
      menu.destroy();
      menuBg.destroy();
      this.menuVisible = false;
    });
    
    menu.addItem("Song List", () => {
      menu.destroy();
      menuBg.destroy();
      this.menuVisible = false;
      this.showSongList();
    });
    
    menu.addItem("Toggle Shuffle", () => {
      this.toggleShuffle();
      menu.destroy();
      menuBg.destroy();
      this.menuVisible = false;
    });
    
    menu.addItem("Exit Jukebox", () => {
      this.exitJukebox();
    });
    
    menu.onCancel.add(() => {
      menu.destroy();
      menuBg.destroy();
      this.menuVisible = false;
    });
  }

  exitJukebox() {
    // Save current playback position before exiting
    this.savePlaybackPosition();
    
    // Clean up
    this.audioElement.pause();
    this.audioElement.src = "";
    
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = "";
    }
    
    if (this.visualizer) {
      this.visualizer.destroy();
    }
    
    if (this.lyrics) {
      this.lyrics.destroy();
    }
    
    // Return to main menu
    game.state.start("MainMenu");
  }

  update() {
    // Update visualizer
    if (this.visualizer) {
      this.visualizer.update();
    }
    
    this.updateDurationDisplay();
    this.updateButtonStates();
    this.updateLyrics();
    
    // Update video background if playing
    if (this.videoElement.src && this.videoElement.readyState >= 2) {
      const currentTime = game.time.now;
      if (currentTime - this.lastVideoUpdate >= 33) { // ~30fps
        this.lastVideoUpdate = currentTime;
        const canvas = document.createElement('canvas');
        canvas.width = 192;
        canvas.height = 112;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.videoElement, 0, 0, 192, 112);
        const texture = PIXI.Texture.fromCanvas(canvas);
        this.backgroundSprite.loadTexture(texture);
      }
    }
    
    this.handleInput();
  }

  updateLyrics() {
    if (this.hasLyrics && this.lyrics && this.audioElement) {
      const currentTime = this.audioElement.currentTime;
      this.lyrics.move(currentTime);
    } else {
      this.lyricsText.write(""); // Clear lyrics if none available
    }
  }

  handleInput() {
    const currentTime = game.time.now;
    
    // Update gamepad
    gamepad.update();
    
    // Don't trigger actions if menu is visible
    if (this.menuVisible || this.songListMenuVisible) return;
    
    // Volume control (UP/DOWN)
    if (gamepad.pressed.up) {
      this.changeVolume(1); // Increase volume
    }
    
    if (gamepad.pressed.down) {
      this.changeVolume(-1); // Decrease volume
    }
    
    // Play/Pause (A button)
    if (gamepad.pressed.a) {
      this.togglePlayback();
    }
    
    // Fullscreen toggle (B button)
    if (gamepad.pressed.b) {
      this.toggleFullscreen();
    }
    
    // Visualizer mode change (Select button)
    if (gamepad.pressed.select) {
      this.changeVisualizerMode();
    }
    
    // Shuffle toggle (Double press Select)
    if (gamepad.pressed.select && currentTime - this.lastSelectPress < this.doublePressTimeout) {
      this.toggleShuffle();
    }
    
    // Menu (Start button)
    if (gamepad.pressed.start) {
      this.showMenu();
    }
    
    // Seek handling with cooldown
    if (currentTime - this.lastSeekTime > this.seekCooldown) {
      // Single press - seek
      if (gamepad.held.left) {
        this.seekBackward();
        this.lastSeekTime = currentTime;
      }
      
      if (gamepad.held.right) {
        this.seekForward();
        this.lastSeekTime = currentTime;
      }
    }
    
    // Double press detection for song change
    if (gamepad.pressed.left && currentTime - this.lastLeftPress < this.doublePressTimeout) {
      this.previousSong();
      this.setButtonActive('skipLeft', 100);
      this.lastSeekTime = currentTime;
    }
    
    if (gamepad.pressed.right && currentTime - this.lastRightPress < this.doublePressTimeout) {
      this.nextSong();
      this.setButtonActive('skipRight', 100);
      this.lastSeekTime = currentTime;
    }
    
    // Track press times for double press detection
    if (gamepad.pressed.left) {
      this.lastLeftPress = currentTime;
    }
    
    if (gamepad.pressed.right) {
      this.lastRightPress = currentTime;
    }
    
    if (gamepad.pressed.select) {
      this.lastSelectPress = currentTime;
    }
    
    if (gamepad.pressed.b) {
      this.lastBPress = currentTime;
    }
  }

  shutdown() {
    // Save current playback position before shutting down
    this.savePlaybackPosition();
    
    // Clean up resources
    this.audioElement.pause();
    this.audioElement.src = "";
    
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = "";
    }
    
    if (this.visualizer) {
      this.visualizer.destroy();
    }
    
    if (this.lyrics) {
      this.lyrics.destroy();
    }
  }
}

class Editor {
  init(song = null) {
    this.song = song || this.createNewSong();
    this.initializedWithSong = song ? true : false;
    this.currentScreen = "metadata";
    this.currentDifficultyIndex = 0;
    this.snapDivision = 8;
    this.cursorBeat = 0;
    this.cursorColumn = 0;
    this.selectedNotes = [];
    this.isAreaSelecting = false;
    this.areaSelectStart = { beat: 0, column: 0 };
    this.holdAStartTime = 0;
    this.holdBStartTime = 0;
    this.holdADirectionTime = 0;
    this.holdSelectStartTime = 0;
    this.lastSeekTime = 0;
    this.seekCooldown = 72;
    this.isPlaying = false;
    this.isPlayingPreview = false;
    this.previewEndHandler = null;
    this.previewEndTimeoutId = null;
    this.menuVisible = false;
    this.playStartTime = 0;
    this.playOffset = 0;
    this.menuVisible = false;
    this.freezePreview = null;

    this.files = {
      audio: null,
      background: null,
      banner: null,
      lyrics: null,
      extra: {}
    };
    
    // For debugging
    window.e = this;

    this.divisions = [1, 2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 192];

    // File input element
    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
  }

  create() {
    game.camera.fadeIn(0x000000);

    new BackgroundGradient();

    // Background elements
    this.backgroundLayer = game.add.group();
    this.backgroundSprite = game.add.sprite(0, 0, null, 0, this.backgroundLayer);
    this.backgroundSprite.alpha = 0.3;
    
    this.chartRenderer = new ChartRenderer(this, this.song, this.currentDifficultyIndex, {
      enableGameplayLogic: false,
      enableJudgement: false,
      enableInput: false,
      enableHealth: false,
      enableMissChecking: false,
      enableReceptors: true,
      enableBeatLines: true,
      enableSpeedRendering: true,
      enableBGRendering: true,
      judgeLineYFalling: 70,
      judgeLineYRising: 50
    });

    this.homeOverlay = game.add.graphics(0, 0);
    this.homeOverlay.beginFill(0x000000, 0.5);
    this.homeOverlay.drawRect(0, 0, game.width, game.height);
    this.homeOverlay.endFill();
    this.homeOverlay.visible = false;

    this.navigationHint = new NavigationHint(0);

    this.cursorSprite = game.add.graphics(0, 0);
    this.selectionRect = game.add.graphics(0, 0);
    this.freezePreviewSprite = game.add.graphics(0, 0);
    this.updateCursorPosition();
    
    this.lyricsText = new Text(game.width / 2, 85, "", FONTS.stroke);
    this.lyricsText.anchor.set(0.5);
    this.lyricsText.visible = false;
    
    this.bannerSprite = game.add.sprite(8, 56, null);
    
    this.icons = game.add.sprite(8, 90);
    
    this.audioIcon = game.add.sprite(0, 0, "ui_editor_icons", 0);
    this.bgIcon = game.add.sprite(9, 0, "ui_editor_icons", 1);
    this.bnIcon = game.add.sprite(9 + 9, 0, "ui_editor_icons", 2);
    this.lrcIcon = game.add.sprite(9 + 9 + 9, 0, "ui_editor_icons", 3);
    this.extraIcon = game.add.sprite(9 + 9 + 9 + 9, 0, "ui_editor_icons", 4);

    this.icons.addChild(this.audioIcon);
    this.icons.addChild(this.bgIcon);
    this.icons.addChild(this.bnIcon);
    this.icons.addChild(this.lrcIcon);
    this.icons.addChild(this.extraIcon);

    this.infoText = new Text(4, 4, "");
    this.bgInfoText = new Text(0, 90, "", null, this.infoText);
    
    this.updateInfoText();
    
    // Create play/pause audio
    this.audio = document.createElement("audio");
    if (this.song.chart.audioUrl) {
      this.audio.src = this.song.chart.audioUrl;
    }

    this.initalSetup();

    addonManager.executeStateBehaviors(this.constructor.name, this);
  }
  
  async initalSetup() {
    if (this.initializedWithSong) {
      this.showLoadingScreen("Setting up");
      this.files.audio = await FileTools.urlToBase64(this.song.chart.audioUrl);
      this.files.banner = await FileTools.urlToBase64(this.song.chart.bannerUrl);
      this.files.background = await FileTools.urlToBase64(this.song.chart.backgroundUrl);
      this.files.lyrics = this.song.chart.lyricsContent;
      this.song.chart.backgrounds.forEach(async bg => {
        if (bg.file != "" && bg.file != "-nosongbg-") {
          const fileContent = await FileTools.urlToBase64(bg.url);
          if (fileContent && fileContent != "") this.files.extra[bg.file] = fileContent;
        }
      });
      this.updateBanner(this.song.chart.bannerUrl);
      this.updateBackground(this.song.chart.backgroundUrl);
      this.refreshLyrics();
      this.hideLoadingScreen();
    }
    this.showHomeScreen();
  }

  createNewSong() {
    return {
      chart: {
        title: "New Song",
        subtitle: "",
        artist: "Unknown Artist",
        titleTranslit: "",
        subtitleTranslit: "",
        artistTranslit: "",
        genre: "",
        credit: "",
        banner: "no-media",
        bannerUrl: "",
        background: "no-media",
        backgroundUrl: "",
        lyrics: "",
        lyricsContent: null,
        cdtitle: "no-media",
        cdtitleUrl: "",
        audio: "",
        audioUrl: "",
        offset: 0,
        sampleStart: 0,
        sampleLength: 10,
        difficulties: [{ type: "Beginner", rating: "1" }],
        notes: { Beginner1: [] },
        bpmChanges: [{ beat: 0, bpm: 120, sec: 0 }],
        stops: [],
        backgrounds: [],
        videoUrl: null
      }
    };
  }

  showHomeScreen() {
    this.currentScreen = "metadata";
    this.clearUI();
    this.stopPlayback();
    this.navigationHint.change(0);
    this.homeOverlay.visible = true;
    this.bannerSprite.visible = true;
    
    const leftWidth = game.width / 2;
    const rightWidth = game.width / 2;

    // Left side: Main menu
    this.mainCarousel = new CarouselMenu(0, 0, leftWidth, game.height / 2, {
      align: "left",
      bgcolor: "#9b59b6",
      fgcolor: "#ffffff",
      animate: true
    });

    this.mainCarousel.addItem("File", () => this.showFileMenu());
    this.mainCarousel.addItem("Edit", () => this.showEditMenu());
    this.mainCarousel.addItem("Playtest", () => this.playtest());
    this.mainCarousel.addItem("Export", () => this.showExportMenu());
    this.mainCarousel.addItem("< Exit", () => this.exitEditor());

    this.mainCarousel.onCancel.add(() => this.exitEditor());

    game.onMenuIn.dispatch("editorMain", this.mainCarousel);

    // Right side: Song info
    this.songInfoText = new Text(leftWidth + 4, 4, this.getSongInfoText());
    this.songInfoText.wrapPreserveNewlines(rightWidth - 8);

    this.updateInfoText();
  }
  
  updateBanner(url = null) {
    if (url && url !== "no-media") {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 86;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 86, 32);
        const texture = PIXI.Texture.fromCanvas(canvas);
        this.bannerSprite.loadTexture(texture);
        this.bannerSprite.bringToTop();
      };
      img.src = url;
    }
  }
  
  updateBackground(url = null) {
    if (url && url !== "no-media") {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 192;
        canvas.height = 112;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 192, 112);
        const texture = PIXI.Texture.fromCanvas(canvas);
        this.backgroundSprite.loadTexture(texture);
      };
      img.src = url;
    } else {
      this.backgroundSprite.loadTexture(null);
    }
  }
  
  refreshLyrics() {
    this.lyrics = new Lyrics({
      textElement: this.lyricsText,
      maxLineLength: 25,
      lrc: this.files.lyrics || this.song.chart.lyricsContent || ""
    });
  }

  showFileMenu() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#3498db",
      fgcolor: "#ffffff",
      animate: true
    });

    carousel.addItem("Load Audio", () => this.pickFile("audio/*", e => this.loadAudioFile(e.target.files[0]), () => this.showFileMenu()));
    carousel.addItem("Load Background", () => this.pickFile("image/*", e => this.loadBackgroundFile(e.target.files[0]), () => this.showFileMenu()));
    carousel.addItem("Load Banner", () => this.pickFile("image/*", e => this.loadBannerFile(e.target.files[0]), () => this.showFileMenu()));
    carousel.addItem("Load Lyrics", () => this.pickFile(".lrc", e => this.loadLyricsFile(e.target.files[0]), () => this.showFileMenu()));
    if (this.song.chart.backgrounds && this.song.chart.backgrounds.length > 0) {
      carousel.addItem("Edit BG Changes", () => this.editBGChangeFiles());
    }
    carousel.addItem("New Song", () => this.createNewSongAndReload());
    carousel.addItem("Load Song", () => this.loadSong());

    game.onMenuIn.dispatch("editorFile", carousel);

    carousel.addItem("< Back", () => this.showHomeScreen());
    carousel.onCancel.add(() => this.showHomeScreen());
  }
  
  pickFolder(accept = "*", onConfirm, onCancel) {
    this.fileInput.accept = accept;
    this.fileInput.webkitdirectory = true;
    this.fileInput.multiple = true;

    this.fileInput.onchange = (e) => {
      onConfirm?.(e);
      this.fileInput.value = "";
    };

    this.fileInput.oncancel = (e) => {
      onCancel?.(e);
      this.fileInput.value = "";
    };

    this.fileInput.click();
  }
  
  pickFile(accept = "*", onConfirm, onCancel) {
    this.fileInput.accept = accept;
    this.fileInput.webkitdirectory = false;
    this.fileInput.multiple = false;

    this.fileInput.onchange = (e) => {
      onConfirm?.(e);
      this.fileInput.value = "";
    };

    this.fileInput.oncancel = (e) => {
      onCancel?.(e);
      this.fileInput.value = "";
    };

    this.fileInput.click();
  }
  
  showLoadingScreen(text) {
    // Destroy any existing loading screen
    if (this.loadingScreen) {
      this.loadingScreen.destroy();
    }
    
    // Create a new loading screen
    this.loadingScreen = game.add.graphics(0, 0);
    this.loadingScreen.beginFill(0x000000, 1);
    this.loadingScreen.drawRect(0, 0, game.width, game.height);
    this.loadingScreen.endFill();

    // Create loading screen conteng
    this.loadingDots = new LoadingDots();
    this.loadingScreen.addChild(this.loadingDots);
    
    this.progressText = new ProgressText(text);
    this.loadingScreen.addChild(this.progressText);
  }
  
  hideLoadingScreen() {
    this.loadingScreen?.destroy();
  }
  
  loadSong() {
    this.pickFolder("*", e => this.processFiles(e.target.files), e => this.showFileMenu());
    
    Account.stats.totalImportedSongs ++;
  }

  readTextFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  showEditMenu() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#e67e22",
      fgcolor: "#ffffff",
      animate: true
    });

    carousel.addItem("Charts", () => this.showChartsMenu());
    carousel.addItem("Metadata", () => this.showMetadataEdit());

    game.onMenuIn.dispatch("editorEdit", carousel);

    carousel.addItem("< Back", () => this.showHomeScreen());
    carousel.onCancel.add(() => this.showHomeScreen());
  }

  showExportMenu() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#e67e22",
      fgcolor: "#ffffff",
      animate: true
    });

    carousel.addItem("Export StepMania Song", () => this.exportSong());

    game.onMenuIn.dispatch("editorProject", carousel);

    carousel.addItem("< Back", () => this.showHomeScreen());
    carousel.onCancel.add(() => this.showHomeScreen());
  }

  showChartsMenu() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#2ecc71",
      fgcolor: "#ffffff",
      animate: true
    });

    this.song.chart.difficulties.forEach((diff, index) => {
      const noteCount = this.song.chart.notes[diff.type + diff.rating]?.length || 0;
      carousel.addItem(`${diff.type} (${diff.rating}) - ${noteCount} notes`, () => this.showChartOptions(index), { difficulty: diff, index: index });
    });

    carousel.addItem("+ Add Difficulty", () => this.addNewDifficulty());

    game.onMenuIn.dispatch("editorCharts", carousel);

    carousel.addItem("< Back", () => this.showEditMenu());
    carousel.onCancel.add(() => this.showEditMenu());
  }

  showChartOptions(difficultyIndex) {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#f39c12",
      fgcolor: "#ffffff",
      animate: true
    });

    carousel.addItem("Edit Chart", () => this.editChart(difficultyIndex));
    carousel.addItem("Set Difficulty Type", () => this.setDifficultyType(difficultyIndex));
    carousel.addItem("Set Difficulty Rating", () => this.setDifficultyRating(difficultyIndex));
    carousel.addItem("Delete Difficulty", () => this.deleteDifficulty(difficultyIndex));

    game.onMenuIn.dispatch("editorChartOptions", carousel);

    carousel.addItem("< Back", () => this.showChartsMenu());
    carousel.onCancel.add(() => this.showChartsMenu());
  }

  editChart(difficultyIndex) {
    this.currentScreen = "chartEdit";
    this.currentDifficultyIndex = difficultyIndex;
    this.selectedNotes = [];
    this.clearUI();
    this.stopPlayback();
    this.homeOverlay.visible = false;
    this.bannerSprite.visible = false;
    this.navigationHint.change(7);

    this.chartRenderer.load(this.song, this.currentDifficultyIndex);

    this.updateInfoText();
  }
  
  playtest() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#2ecc71",
      fgcolor: "#ffffff",
      animate: true
    });

    this.song.chart.difficulties.forEach((diff, index) => {
      const noteCount = this.song.chart.notes[diff.type + diff.rating]?.length || 0;
      carousel.addItem(`${diff.type} (${diff.rating}) - ${noteCount} notes`, () => this.startPlaytest(index), { difficulty: diff, index: index });
    });

    game.onMenuIn.dispatch("editorPlaytest", carousel);

    carousel.addItem("< Back", () => this.showHomeScreen());
    carousel.onCancel.add(() => this.showHomeScreen());
  }
  
  startPlaytest(difficultyIndex) {
    // Clean up any note sprites before switching to play state
    this.getCurrentChartNotes().forEach(note => this.chartRenderer.killNote(note));

    game.state.start(
      "Play",
      true,
      false,
      {
        chart: this.song.chart,
        difficultyIndex
      },
      0,
      true
    );
  }

  updateInfoText() {
    if (this.currentScreen === "chartEdit") {
      const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
      const noteCount = this.song.chart.notes[diff.type + diff.rating]?.length || 0;
      const currentTime = this.audio.currentTime;
      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60);
      const formatedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      const currentBpm = this.chartRenderer ? this.chartRenderer.getCurrentBPM(this.cursorBeat) : "---";

      const text = this.isPlaying
        ?
          "Playing\n" +
          `TIME: ${formatedTime}\n` +
          `BEAT: ${this.cursorBeat.toFixed(0)}\n` +
          `BPM: ${currentBpm}`
        :
          `EDITING: ${diff.type} (${diff.rating})\n` +
          `SNAP: 1/${this.snapDivision}\n` +
          `TIME: ${formatedTime}\n` +
          `BEAT: ${this.cursorBeat.toFixed(3)}\n` +
          `BPM: ${currentBpm}\n` +
          `NOTES: ${noteCount}\n` +
          `SELECTED: ${this.selectedNotes.length}`;
      
      const bgText = `BG: ${this.getCurrentBgFileName()}`;
      
      if (text != this.infoText.texture.text) this.infoText.write(text);
      if (bgText != this.bgInfoText.texture.text) this.bgInfoText.write(bgText, 45);
      
      this.infoText.visible = true;
    } else {
      this.infoText.visible = false;
    }
  }
  
  getCurrentBgFileName() {
    let filename = this.song.chart.background;
    
    const queue = [];
    
    // Check for background(s) needed for this beat
    this.song.chart.backgrounds.forEach(bg => {
      if (this.cursorBeat >= bg.beat) {
        queue.push(bg.file);
      }
    });
    
    return queue.pop() || filename;
  }

  updateCursorPosition() {
    this.cursorSprite.clear();

    if (!this.isAreaSelecting) {
      const leftOffset = this.chartRenderer.calculateLeftOffset();
      const x = leftOffset + this.cursorColumn * (this.chartRenderer.COLUMN_SIZE + this.chartRenderer.COLUMN_SEPARATION);
      const y = this.chartRenderer.JUDGE_LINE;

      this.cursorSprite.lineStyle(1, 0xffffff, 0.5);
      this.cursorSprite.drawRect(x, y - this.chartRenderer.COLUMN_SIZE / 2, this.chartRenderer.COLUMN_SIZE, this.chartRenderer.COLUMN_SIZE);

      this.cursorSprite.endFill();
    }
  }

  updateSelectionRect() {
    this.selectionRect.clear();

    if (this.isAreaSelecting) {
      const leftOffset = this.chartRenderer.calculateLeftOffset();
      const startX = leftOffset + this.areaSelectStart.column * (this.chartRenderer.COLUMN_SIZE + this.chartRenderer.COLUMN_SEPARATION);
      const endX = leftOffset + this.cursorColumn * (this.chartRenderer.COLUMN_SIZE + this.chartRenderer.COLUMN_SEPARATION);

      const startY = this.chartRenderer.getYPos(this.getCurrentTime().now, this.getCurrentTime().beat, this.areaSelectStart.beat);
      const endY = this.chartRenderer.getYPos(this.getCurrentTime().now, this.getCurrentTime().beat, this.cursorBeat);

      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const width = Math.abs(endX - startX) + this.chartRenderer.COLUMN_SIZE;
      const height = Math.abs(endY - startY);

      this.selectionRect.lineStyle(1, 0x00ffff, 0.8);
      this.selectionRect.drawRect(x, y, width, height);
      this.selectionRect.endFill();
    }
  }

  updateFreezePreview() {
    this.freezePreviewSprite.clear();

    if (!this.isPlaying && gamepad.held.b && this.holdBStartTime !== null) {
      const currentBeat = this.getCurrentTime().beat;
      const startBeat = this.holdBStartTime;
      const duration = currentBeat - startBeat;

      if (Math.abs(duration) > 0.001) {
        const leftOffset = this.chartRenderer.calculateLeftOffset();
        const x = leftOffset + this.cursorColumn * (this.chartRenderer.COLUMN_SIZE + this.chartRenderer.COLUMN_SEPARATION);

        const startY = this.chartRenderer.getYPos(this.getCurrentTime().now, this.getCurrentTime().beat, startBeat);
        const endY = this.chartRenderer.getYPos(this.getCurrentTime().now, this.getCurrentTime().beat, currentBeat);

        const y = Math.min(startY, endY);
        const height = Math.abs(endY - startY);

        const alpha = 0.8 + 0.2 * Math.sin(Date.now() * 0.01);

        this.freezePreviewSprite.lineStyle(4, 0x00ff00, alpha);
        this.freezePreviewSprite.drawRect(x, y, this.chartRenderer.COLUMN_SIZE, height);
        this.freezePreviewSprite.endFill();
      }
    }
  }

  getDivisionSize() {
    return 4 / this.snapDivision;
  }

  getSnappedBeat(beat) {
    const snapped = Phaser.Math.snapToFloor(beat, this.getDivisionSize());
    return Math.max(0, snapped);
  }

  getCurrentTime() {
    const offset = (this.song.chart.offset || 0) + (Account.settings.userOffset || 0);
    if (this.isPlaying) {
      const currentTime = (game.time.now - this.playStartTime) / 1000 + this.playOffset + offset;
      const currentBeat = this.chartRenderer.secToBeat(currentTime);
      return {
        now: currentTime,
        beat: currentBeat
      };
    } else {
      const currentTime = this.chartRenderer.beatToSec(this.cursorBeat) + offset;
      return {
        now: currentTime,
        beat: this.cursorBeat
      };
    }
  }

  handleChartEditInput() {
    if (this.menuVisible) return;

    const { now, beat } = this.getCurrentTime();

    // Handle A button - selection
    if (gamepad.pressed.a) {
      this.holdAStartTime = game.time.now;
      this.startSingleSelect();
    }

    if (gamepad.released.a) {
      const holdDuration = game.time.now - this.holdAStartTime;

      if (holdDuration < 300 && !this.isAreaSelecting) {
        // Single tap - toggle selection
        this.toggleNoteSelection();
      } else if (this.isAreaSelecting) {
        // End area selection
        this.endAreaSelection();
      }
    }

    // Handle B button - placement
    if (gamepad.pressed.b) {
      this.holdBStartTime = beat;
    }

    if (gamepad.released.b) {
      const holdDuration = beat - this.holdBStartTime;

      if (Math.abs(holdDuration) == 0) {
        // Single tap - place note
        this.placeNote();
      } else {
        // Long press - place freeze
        const freezeStart = holdDuration > 0 ? this.holdBStartTime : this.holdBStartTime + holdDuration;

        this.placeFreeze(freezeStart, Math.abs(holdDuration));
      }
    }

    if (gamepad.held.a && (gamepad.pressed.up || gamepad.pressed.down)) {
      if (!this.isAreaSelecting) {
        this.startAreaSelection();
      }
    } else if (gamepad.held.a && (gamepad.pressed.left || gamepad.pressed.right)) {
      if (!this.isAreaSelecting) {
        this.changeSnapDivision(gamepad.pressed.left ? -1 : 1);
        this.holdADirectionTime = game.time.now;
      } else {
        if (gamepad.pressed.left) {
          this.moveCursor(-1, 0);
        }
        if (gamepad.pressed.right) {
          this.moveCursor(1, 0);
        }
      }
    } else {
      if (gamepad.pressed.left) {
        this.moveCursor(-1, 0);
      }
      if (gamepad.pressed.right) {
        this.moveCursor(1, 0);
      }
    }

    // Handle cursor movement
    if (game.time.now - this.lastSeekTime > this.seekCooldown) {
      if (gamepad.held.up) {
        this.moveCursor(0, -this.getDivisionSize() * this.chartRenderer.DIRECTION);
        this.lastSeekTime = game.time.now;
      }
      if (gamepad.held.down) {
        this.moveCursor(0, this.getDivisionSize() * this.chartRenderer.DIRECTION);
        this.lastSeekTime = game.time.now;
      }
    }

    // Toggle playback with SELECT
    if (gamepad.pressed.select && !gamepad.held.start) {
      this.togglePlayback();
    }

    // Handle context menu with START
    if (gamepad.pressed.start && !gamepad.held.select) {
      this.showContextMenu();
    }

    // Update visuals
    this.updateSelectionRect();
    this.updateFreezePreview();
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
    this.updateInfoText();
  }

  startPlayback() {
    this.isPlaying = true;
    this.playStartTime = game.time.now;
    this.playOffset = this.chartRenderer.beatToSec(this.cursorBeat);
    this.navigationHint.visible = false;

    this.getCurrentChartNotes().forEach(note => (note.hitEffectShown = false));

    if (this.audio && this.audio.src) {
      if (this.previewEndTimeoutId) clearTimeout(this.previewEndTimeoutId);
      this.audio.currentTime = this.playOffset;
      this.audio.play().catch(e => console.log("Audio play failed:", e));
    }
  }

  stopPlayback() {
    this.isPlaying = false;
    this.navigationHint.visible = true;

    if (this.audio && this.audio.src) {
      this.audio.pause();
    }

    // Snap cursor to current position
    if (this.playStartTime > 0) {
      this.snapCursor();
      this.updateCursorPosition();
    }
    this.playStartTime = 0;
  }

  abortPreview() {
    if (this.previewEndHandler && this.previewEndTimeoutId) {
      clearTimeout(this.previewEndTimeoutId);
      this.previewEndHandler();
      this.previewEndHandler = null;
      this.previewEndTimeoutId = null;
    }
  }

  playPreview(start, length) {
    if (!this.isPlaying && this.audio && this.audio.src) {
      this.abortPreview();

      this.audio.currentTime = start;

      this.previewEndHandler = () => {
        this.audio.pause();
        this.audio.currentTime = start;
      };

      this.audio.play().then(() => {
        this.previewEndTimeoutId = setTimeout(this.previewEndHandler, length * 1000);
      });
    }
  }

  snapCursor(beat) {
    this.cursorBeat = this.getSnappedBeat(beat || this.cursorBeat);
  }

  moveCursor(deltaX, deltaBeat) {
    this.cursorColumn = Phaser.Math.clamp(this.cursorColumn + deltaX, 0, 3);

    if (deltaBeat !== 0) {
      this.cursorBeat += deltaBeat;
      this.snapCursor();
    }

    this.chartRenderer.cleanupAllLines();
    this.updateCursorPosition();
    this.updateInfoText();
  }

  startSingleSelect() {
    this.isAreaSelecting = false;
  }

  startAreaSelection() {
    this.isAreaSelecting = true;
    this.areaSelectStart.beat = this.cursorBeat;
    this.areaSelectStart.column = this.cursorColumn;
  }

  endAreaSelection() {
    this.isAreaSelecting = false;
    const areaSelectEnd = { beat: this.cursorBeat, column: this.cursorColumn };

    const startBeat = Math.min(this.areaSelectStart.beat, areaSelectEnd.beat);
    const endBeat = Math.max(this.areaSelectStart.beat, areaSelectEnd.beat);
    const startCol = Math.min(this.areaSelectStart.column, areaSelectEnd.column);
    const endCol = Math.max(this.areaSelectStart.column, areaSelectEnd.column);

    const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
    const notes = this.song.chart.notes[diff.type + diff.rating] || [];

    this.selectedNotes = notes.filter(note => note.beat >= startBeat && note.beat <= endBeat && note.column >= startCol && note.column <= endCol);

    this.updateCursorPosition();
    this.updateInfoText();
  }

  toggleNoteSelection() {
    const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
    const notes = this.song.chart.notes[diff.type + diff.rating] || [];

    const noteAtCursor = notes.find(note => note.column === this.cursorColumn && Math.abs(note.beat - this.cursorBeat) < 0.001);

    if (noteAtCursor) {
      const index = this.selectedNotes.indexOf(noteAtCursor);
      if (index > -1) {
        this.selectedNotes.splice(index, 1);
      } else {
        this.selectedNotes.push(noteAtCursor);
      }
    } else {
      this.selectedNotes = [];
    }

    this.updateInfoText();
  }

  previewNote(note) {
    const start = note.sec;
    const duration = note.secLength ? note.secLength : this.chartRenderer.beatToSec(this.getDivisionSize());
    this.playPreview(start, duration);

    if (note.type === "2" || note.type === "4") {
      // TODO: Draw a explosion sprite from freeze start to end
    }
  }

  placeNote() {
    if (this.isPlaying) return;

    const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
    const notes = this.song.chart.notes[diff.type + diff.rating] || [];

    const existingNote = notes.find(note => note.column === this.cursorColumn && Math.abs(note.beat - this.cursorBeat) < 0.001);

    if (existingNote) {
      this.chartRenderer.killNote(existingNote);
      const index = notes.indexOf(existingNote);
      notes.splice(index, 1);

      const selectedIndex = this.selectedNotes.indexOf(existingNote);
      if (selectedIndex > -1) {
        this.selectedNotes.splice(selectedIndex, 1);
      }

      this.playExplosionEffect(this.cursorColumn);
    } else {
      const newNote = {
        type: "1",
        beat: this.cursorBeat,
        sec: this.chartRenderer.beatToSec(this.cursorBeat),
        column: this.cursorColumn
      };
      notes.push(newNote);
      this.playExplosionEffect(this.cursorColumn);
      this.previewNote(newNote);
    }
    
    Account.stats.totalPlacedArrows ++;
    
    this.sortNotes();
    this.updateInfoText();
  }

  placeFreeze(startBeat, duration, type = "2") {
    if (this.isPlaying) return;

    const notes = this.getCurrentChartNotes();

    // Remove any existing notes in the freeze range
    for (let i = notes.length - 1; i >= 0; i--) {
      const note = notes[i];
      if (note.column === this.cursorColumn && note.beat >= startBeat && note.beat <= startBeat + duration) {
        this.chartRenderer.killNote(note);
        notes.splice(i, 1);
      }
    }

    const newNote = {
      type: type,
      beat: startBeat,
      sec: this.chartRenderer.beatToSec(startBeat),
      column: this.cursorColumn,
      beatLength: duration,
      secLength: this.chartRenderer.beatToSec(startBeat + duration) - this.chartRenderer.beatToSec(startBeat),
      beatEnd: startBeat + duration,
      secEnd: this.chartRenderer.beatToSec(startBeat + duration)
    };
    notes.push(newNote);
    this.previewNote(newNote);
    
    Account.stats.totalPlacedFreezes ++;

    this.sortNotes();
    this.updateInfoText();
    this.playExplosionEffect(this.cursorColumn);
  }

  sortNotes() {
    const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
    const notes = this.song.chart.notes[diff.type + diff.rating];
    if (notes) {
      notes.sort((a, b) => a.beat - b.beat);
    }
  }

  placeMine() {
    if (this.isPlaying) return;

    const notes = this.getCurrentChartNotes();

    const newNote = {
      type: "M",
      beat: this.cursorBeat,
      sec: this.chartRenderer.beatToSec(this.cursorBeat),
      column: this.cursorColumn
    };
    notes.push(newNote);
    this.previewNote(newNote);
    
    Account.stats.totalPlacedMines ++;

    this.sortNotes();
    this.updateInfoText();
    this.playExplosionEffect(this.cursorColumn);
  }

  placeQuickHold() {
    this.placeFreeze(this.cursorBeat, 1, "2");
  }

  playExplosionEffect(column) {
    const receptor = this.chartRenderer.receptors[column];
    if (receptor && receptor.explosion) {
      receptor.explosion.visible = true;
      receptor.explosion.alpha = 1;

      game.add
        .tween(receptor.explosion)
        .to({ alpha: 0 }, 200, "Linear", true)
        .onComplete.add(() => {
          receptor.explosion.visible = false;
        });
    }
  }

  changeSnapDivision(direction) {
    const currentIndex = this.divisions.indexOf(this.snapDivision);
    let newIndex = currentIndex + direction;

    if (newIndex < 0) newIndex = this.divisions.length - 1;
    if (newIndex >= this.divisions.length) newIndex = 0;

    this.snapDivision = this.divisions[newIndex];
    this.updateInfoText();
  }

  showContextMenu() {
    if (this.isPlaying || this.menuVisible) return;

    this.menuVisible = true;

    const contextMenu = new CarouselMenu(0, 48, 80, 56, {
      bgcolor: "#34495e",
      fgcolor: "#ffffff",
      align: "left",
      animate: true,
      inactiveAlpha: 0.6,
      activeAlpha: 1
    });

    if (this.selectedNotes.length === 0) {
      contextMenu.addItem("Place Mine", () => this.placeMine());
      contextMenu.addItem("Place Quick Hold", () => this.placeQuickHold());

      if (!this.getBPMChange()) {
        contextMenu.addItem("Add BPM Change", () => this.addBPMChange());
      } else {
        contextMenu.addItem("Edit BPM Value", () => this.editBPMChange());
        contextMenu.addItem("Remove BPM Change", () => this.removeBPMChange());
      }

      if (!this.getStop()) {
        contextMenu.addItem("Add Stop", () => this.addStop());
      } else {
        contextMenu.addItem("Edit Stop Duration", () => this.editStop());
        contextMenu.addItem("Remove Stop", () => this.removeStop());
      }

      if (!this.getBGChange()) {
        contextMenu.addItem("Add BG Change", () => this.addBGChange());
        contextMenu.addItem("Add -nosongbg-", () => this.addNoSongBgChange());
      } else {
        contextMenu.addItem("Edit BG Change", () => this.editBGChange());
        contextMenu.addItem("Remove BG Change", () => this.removeBGChange());
      }
      
      contextMenu.addItem("Detect BPM Here", () => this.detectBPMHere());
    } else if (this.selectedNotes.length === 1) {
      const note = this.selectedNotes[0];
      contextMenu.addItem("Unselect", () => (this.selectedNotes = []));

      if (note.type === "1") {
        contextMenu.addItem("Turn Into Mine", () => this.convertNoteType("M"));
      } else if (note.type === "M") {
        contextMenu.addItem("Turn Into Note", () => this.convertNoteType("1"));
      } else if (note.type === "2" || note.type === "4") {
        contextMenu.addItem("Turn Into Roll", () => this.convertFreezeType("4"));
        contextMenu.addItem("Turn Into Hold", () => this.convertFreezeType("2"));
      }

      contextMenu.addItem("Align To Beat Division", () => this.alignToBeatDivision());
      contextMenu.addItem("Delete", () => this.deleteSelectedNotes());
    } else {
      contextMenu.addItem("Unselect All", () => (this.selectedNotes = []));

      const allNotes = this.selectedNotes.every(n => n.type === "1" || n.type === "M");
      const allFreezes = this.selectedNotes.every(n => n.type === "2" || n.type === "4");

      if (allNotes) {
        contextMenu.addItem("Turn All Into Mines", () => this.convertNotesType("M"));
        contextMenu.addItem("Turn All Into Notes", () => this.convertNotesType("1"));
      } else if (allFreezes) {
        contextMenu.addItem("Turn All Into Rolls", () => this.convertFreezesType("4"));
        contextMenu.addItem("Turn All Into Holds", () => this.convertFreezesType("2"));
      }

      contextMenu.addItem("Align All To Beat Division", () => this.alignAllToBeatDivision());
      contextMenu.addItem("Delete All", () => this.deleteSelectedNotes());
    }

    contextMenu.addItem("Save And Exit", () => this.saveAndExit());

    contextMenu.onConfirm.add(() => {
      contextMenu.destroy();
      this.menuVisible = false;
    });

    contextMenu.onCancel.add(() => {
      contextMenu.destroy();
      this.menuVisible = false;
    });
  }

  convertNoteType(newType) {
    if (this.selectedNotes.length === 1) {
      this.selectedNotes[0].type = newType;
      this.refreshSelectedNotes();
    }
  }

  convertNotesType(newType) {
    this.selectedNotes.forEach(note => {
      note.type = newType;
    });
    this.refreshSelectedNotes();
  }

  convertFreezeType(newType) {
    if (this.selectedNotes.length === 1 && (this.selectedNotes[0].type === "2" || this.selectedNotes[0].type === "4")) {
      this.selectedNotes[0].type = newType;
      this.refreshSelectedNotes();
    }
  }

  convertFreezesType(newType) {
    this.selectedNotes.forEach(note => {
      if (note.type === "2" || note.type === "4") {
        note.type = newType;
      }
    });
    this.refreshSelectedNotes();
  }

  alignToBeatDivision() {
    if (this.selectedNotes.length === 1) {
      const note = this.selectedNotes[0];
      note.beat = this.getSnappedBeat(note.beat);
      note.sec = this.chartRenderer.beatToSec(note.beat);
      this.refreshSelectedNotes();
      this.sortNotes();
    }
  }

  alignAllToBeatDivision() {
    this.selectedNotes.forEach(note => {
      note.beat = this.getSnappedBeat(note.beat);
      note.sec = this.chartRenderer.beatToSec(note.beat);
    });
    this.refreshSelectedNotes();
    this.sortNotes();
  }
  
  refreshSelectedNotes() {
    this.selectedNotes.forEach(note => this.chartRenderer.killNote(note)); // the renderer will automatically recreate the note visuals
  }
  
  deleteSelectedNotes() {
    const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
    const notes = this.song.chart.notes[diff.type + diff.rating] || [];

    this.selectedNotes.forEach(note => {
      const index = notes.indexOf(note);
      this.chartRenderer.killNote(note);
      if (index > -1) {
        notes.splice(index, 1);
      }
    });

    this.selectedNotes = [];
    this.updateInfoText();
  }

  getCurrentChartNotes() {
    const diff = this.song.chart.difficulties[this.currentDifficultyIndex];
    
    if (!diff) return [];
    
    return this.song.chart.notes[diff.type + diff.rating] || [];
  }

  getSongInfoText() {
    const chart = this.song.chart;
    let totalNotes = 0;
    chart.difficulties.forEach(diff => {
      const notes = chart.notes[diff.type + diff.rating];
      if (notes) totalNotes += notes.length;
    });

    return `
TITLE: ${chart.title}
ARTIST: ${chart.artist}
GENRE: ${chart.genre || "Unknown"}
CREDIT: ${chart.credit || "Unknown"}

DIFFICULTIES: ${chart.difficulties.length}
TOTAL NOTES: ${totalNotes}
BPM CHANGES: ${chart.bpmChanges.length}
STOPS: ${chart.stops.length}
BG CHANGES: ${chart.backgrounds.length}

OFFSET: ${chart.offset}
SAMPLE START: ${chart.sampleStart}
SAMPLE LENGTH: ${chart.sampleLength}
    `.trim();
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && this.currentFileCallback) {
      this.currentFileCallback(file);
    }
    this.fileInput.value = "";
  }
  
  async processFiles(files) {
    try {
      const fileMap = {};
      for (let i = 0; i < files.length; i++) {
        fileMap[files[i].name.toLowerCase()] = files[i];
      }

      const packageFileNames = Object.keys(fileMap).filter(name => name.endsWith(".zip") || name.endsWith(".pmz"));
      const chartFileNames = Object.keys(fileMap).filter(name => name.endsWith(".sm"));

      if (packageFileNames.length > 0) {
        const zipFileName = packageFileNames[0];
        const zipFile = fileMap[zipFileName];
        this.importFromZip(zipFile);
        return;
      }

      if (chartFileNames.length === 0) {
        this.showFileMenu();
        notifications.show("No chart files found");
        return;
      }

      const smFileName = chartFileNames[0];
      const content = await this.readTextFileContent(fileMap[smFileName.toLowerCase()]);

      const chart = await new ExternalSMParser().parseSM(fileMap, content);
      chart.folderName = `Single_External_${smFileName}`;
      chart.loaded = true;
      
      this.showLoadingScreen("Processing Files");
      
      // Load main files
      this.files.audio = await FileTools.urlToBase64(chart.audioUrl);
      this.files.banner = await FileTools.urlToBase64(chart.bannerUrl);
      this.files.background = await FileTools.urlToBase64(chart.backgroundUrl);
      this.files.lyrics = chart.lyricsContent;
      
      // Load BG change files
      if (chart.backgrounds) {
        for (const bg of chart.backgrounds) {
          if (bg.file != "" && bg.file != "-nosongbg-") {
            const file = fileMap[bg.file.toLowerCase()] || "";
            this.files.extra[bg.file] = file || "";
          }
        }
      }
      
      this.hideLoadingScreen();
      
      this.audio.src = chart.audioUrl;
      this.updateBanner(chart.bannerUrl);
      this.updateBackground(chart.backgroundUrl);
      this.refreshLyrics();

      this.song = { chart };
      this.showHomeScreen();
    } catch (error) {
      console.error("Error loading song:", error);
      this.showFileMenu();
    }
  }

  async loadAudioFile(file) {
    try {
      const url = URL.createObjectURL(file);
      this.song.chart.audio = file.name;
      this.song.chart.audioUrl = url;
      
      this.showLoadingScreen("Processing Audio");
      
      const reader = new FileReader();
      reader.onload = () => {
        this.files.audio = FileTools.extractBase64(reader.result);
        this.audio.src = url;
        this.hideLoadingScreen();
        this.showHomeScreen();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error loading audio:", error);
      this.showHomeScreen();
    }
  }

  async loadBackgroundFile(file) {
    try {
      const url = URL.createObjectURL(file);
      this.song.chart.background = file.name;
      this.song.chart.backgroundUrl = url;

      this.showLoadingScreen("Processing Background");
      
      const reader = new FileReader();
      reader.onload = () => {
        this.files.background = FileTools.extractBase64(reader.result);
        this.updateBackground(url);
        this.hideLoadingScreen();
        this.showHomeScreen();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error loading background:", error);
      this.showHomeScreen();
    }
  }

  async loadBannerFile(file) {
    try {
      const url = URL.createObjectURL(file);
      this.song.chart.banner = file.name;
      this.song.chart.bannerUrl = url;
      
      this.showLoadingScreen("Processing Banner");
      
      this.updateBanner(url);
      
      const reader = new FileReader();
      reader.onload = () => {
        this.files.banner = FileTools.extractBase64(reader.result);
        this.hideLoadingScreen();
        this.showHomeScreen();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error loading banner:", error);
      this.showHomeScreen();
    }
  }
  
  async loadLyricsFile(file) {
    try {
      this.showLoadingScreen("Processing Lyrics");
      
      const reader = new FileReader();
      reader.onload = () => {
        this.song.chart.lyrics = file.name;
        this.song.chart.lyricsContent = reader.result;
        this.files.lyrics = reader.result;
        this.refreshLyrics();
        this.hideLoadingScreen();
        this.showHomeScreen();
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error loading banner:", error);
      this.showHomeScreen();
    }
  }

  async importFromZip(file) {
    const JSZip = window.JSZip;
    if (!JSZip) {
      this.showHomeScreen();
      throw new Error("JSZip library not loaded");
    }
    
    if (!file) {
      this.showHomeScreen();
      throw new Error("Undefined .zip file");
    }
    
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);

    // Import the project
    await this.importStepManiaSong(zipContent);
    
    this.hideLoadingScreen();
    this.showHomeScreen();
    
    Account.stats.totalImportedSongs ++;
  }

  async importStepManiaSong(zipContent) {
    // Find .sm file
    let smFile = null;
    let smFilename = null;

    zipContent.forEach((relativePath, file) => {
      if (relativePath.toLowerCase().endsWith(".sm") && !smFile) {
        smFile = file;
        smFilename = relativePath;
      }
    });

    if (!smFile) {
      throw new Error("No .sm file found in ZIP");
    }

    // Parse SM file
    const smContent = await smFile.async("text");
    const basePath = smFilename.split("/").slice(0, -1).join("/");
    const chart = await new LocalSMParser().parseSM(smContent, basePath);

    this.song = { chart };
    this.files = {
      audio: null,
      background: null,
      banner: null,
      lyrics: null,
      extra: {}
    };

    // Helper function to find and load file from ZIP
    const loadFileFromZip = async (filename, targetProp) => {
      if (!filename) return null;

      // Try to find the file in ZIP
      let fileEntry = zipContent.file(filename);

      // If not found, try with relative path
      if (!fileEntry && basePath) {
        fileEntry = zipContent.file(basePath + "/" + filename);
      }

      // If still not found, search case-insensitive
      if (!fileEntry) {
        zipContent.forEach((relativePath, file) => {
          if (relativePath.toLowerCase().includes(filename.toLowerCase())) {
            fileEntry = file;
          }
        });
      }

      if (fileEntry) {
        const blob = await fileEntry.async("blob");
        const dataUrl = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        this.files[targetProp] = dataUrl;

        // Create object URL for immediate use
        const objectUrl = URL.createObjectURL(blob);

        if (targetProp === "audio") {
          this.song.chart.audio = filename;
          this.song.chart.audioUrl = objectUrl;
          this.files.audio = FileTools.extractBase64(objectUrl);
          this.audio.src = objectUrl;
        } else if (targetProp === "background") {
          this.song.chart.background = filename;
          this.song.chart.backgroundUrl = objectUrl;
          this.files.background = FileTools.extractBase64(objectUrl);
          this.updateBackground(objectUrl);
        } else if (targetProp === "banner") {
          this.song.chart.banner = filename;
          this.song.chart.bannerUrl = objectUrl;
          this.files.banner = FileTools.extractBase64(objectUrl);
          this.updateBanner(objectUrl);
        } else if (targetProp === "lyrics") {
          this.files.lyrics = await fileEntry.async("text");
          this.song.chart.lyrics = filename;
          this.song.chart.lyricsContent = this.files.lyrics;
          this.refreshLyrics();
        } else if (targetProp === "extra") {
          this.files.extra[filename] = FileTools.extractBase64(objectUrl);
        }

        return dataUrl;
      }

      return null;
    };
    
    this.audio.src = "";

    // Load main files
    await loadFileFromZip(this.song.chart.audio, "audio");
    await loadFileFromZip(this.song.chart.background, "background");
    await loadFileFromZip(this.song.chart.banner, "banner");
    await loadFileFromZip(this.song.chart.lyrics, "lyrics");

    // Load BG change files
    if (this.song.chart.backgrounds) {
      for (const bg of this.song.chart.backgrounds) {
        if (bg.file != "" && bg.file != "-nosongbg-") {
          await loadFileFromZip(bg.file, "extra");
        }
      }
    }

    notifications.show("StepMania song imported!");
  }

  async importSMFile(file) {
    const content = await this.readTextFileContent(file);
    const chart = await new LocalSMParser().parseSM(content);

    this.song = { chart };

    this.files = {
      audio: null,
      background: null,
      banner: null,
      extra: {}
    };
    
    this.updateBackground();
    this.updateBanner();
    this.refreshLyrics();
    this.audio.src = "";
    
    notifications.show("SM file imported! Load audio/background files manually.");
  }

  async exportSong() {
    try {
      this.showLoadingScreen("Exporting song");

      // Prepare song data
      const songData = await FileTools.prepareSongForExport(this.song, this.files);

      // Generate SM content
      const smContent = SMFile.generateSM(songData);

      // Create ZIP file
      const JSZip = window.JSZip;
      if (!JSZip) {
        throw new Error("JSZip library not loaded");
      }

      const zip = new JSZip();

      // Add SM file
      const smFilename = `${songData.title || "song"}.sm`;
      zip.file(smFilename, smContent);

      // Add resources
      this.addSongResourcesToZip(songData, zip);

      // Generate ZIP file
      const blob = await zip.generateAsync({ type: "blob" });

      // Save file
      const fileName = `${songData.title || "song"}.zip`;
      await this.saveFile(blob, fileName);
      
      Account.stats.totalExportedSongs ++;

      this.hideLoadingScreen();
      this.showHomeScreen();
      notifications.show("Song exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      this.hideLoadingScreen();
      this.showHomeScreen();
      notifications.show("Export failed!");
    }
  }

  addSongResourcesToZip(songData, zip) {
    // Add main files
    songData.audio !== "no-media" && zip.file(songData.audio, this.files.audio, { base64: true });
    songData.background !== "no-media" && zip.file(songData.background, this.files.background, { base64: true });
    songData.banner !== "no-media" && zip.file(songData.banner, this.files.banner, { base64: true });
    songData.lyricsContent && zip.file(songData.lyrics, this.files.lyrics);

    // Add BG change files
    if (songData.backgrounds) {
      for (const bg of songData.backgrounds) {
        if (bg.file && this.files.extra[bg.file]) {
          zip.file(bg.file, this.files.extra[bg.file], { base64: true });
        }
      }
    }

    return zip;
  }

  async saveFile(blob, filename) {
    if (CURRENT_ENVIRONMENT === ENVIRONMENT.WEB) {
      // Download in browser
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (CURRENT_ENVIRONMENT === ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT === ENVIRONMENT.NWJS) {
      await this.saveFileToFilesystem(blob, filename);
    }
  }
  
  async saveFileToFilesystem(blob, filename) {
    const fileSystem = new FileSystemTools();
    
    const outputDir = await fileSystem.getDirectory(EXTERNAL_DIRECTORY + EDITOR_OUTPUT_DIRECTORY);
    
    await fileSystem.saveFile(outputDir, blob, filename);
  }
  
  setDifficultyType(difficultyIndex) {
    const types = ["Beginner", "Easy", "Medium", "Hard", "Challenge"];
    const currentType = this.song.chart.difficulties[difficultyIndex].type;

    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#8e44ad",
      fgcolor: "#ffffff",
      animate: true
    });

    types.forEach(type => {
      carousel.addItem(type, () => {
        const oldKey = this.song.chart.difficulties[difficultyIndex].type + this.song.chart.difficulties[difficultyIndex].rating;
        this.song.chart.difficulties[difficultyIndex].type = type;
        const newKey = type + this.song.chart.difficulties[difficultyIndex].rating;

        if (this.song.chart.notes[oldKey]) {
          this.song.chart.notes[newKey] = this.song.chart.notes[oldKey];
          delete this.song.chart.notes[oldKey];
        }

        this.showChartsMenu();
      });
    });

    carousel.addItem("< Back", () => this.showChartOptions(difficultyIndex));
    carousel.onCancel.add(() => this.showChartOptions(difficultyIndex));
  }

  setDifficultyRating(difficultyIndex) {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#8e44ad",
      fgcolor: "#ffffff",
      animate: true
    });

    for (let i = 1; i <= 20; i++) {
      carousel.addItem(i.toString(), () => {
        const oldKey = this.song.chart.difficulties[difficultyIndex].type + this.song.chart.difficulties[difficultyIndex].rating;
        this.song.chart.difficulties[difficultyIndex].rating = i.toString();
        const newKey = this.song.chart.difficulties[difficultyIndex].type + i.toString();

        if (this.song.chart.notes[oldKey]) {
          this.song.chart.notes[newKey] = this.song.chart.notes[oldKey];
          delete this.song.chart.notes[oldKey];
        }

        this.showChartsMenu();
      });
    }

    carousel.addItem("< Back", () => this.showChartOptions(difficultyIndex));
    carousel.onCancel.add(() => this.showChartOptions(difficultyIndex));
  }

  deleteDifficulty(difficultyIndex) {
    const diff = this.song.chart.difficulties[difficultyIndex];
    const key = diff.type + diff.rating;

    this.song.chart.difficulties.splice(difficultyIndex, 1);
    delete this.song.chart.notes[key];

    this.showChartsMenu();
  }

  addNewDifficulty() {
    const newDiff = {
      type: "Medium",
      rating: "1"
    };
    this.song.chart.difficulties.push(newDiff);
    this.song.chart.notes[newDiff.type + newDiff.rating] = [];
    this.showChartsMenu();
  }

  showMetadataEdit() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#16a085",
      fgcolor: "#ffffff",
      animate: true
    });

    carousel.addItem("Edit Title", () => this.editMetadataField("title"));
    carousel.addItem("Edit Artist", () => this.editMetadataField("artist"));
    carousel.addItem("Edit Genre", () => this.editMetadataField("genre"));
    carousel.addItem("Edit Credit", () => this.editMetadataField("credit"));
    carousel.addItem("Edit BPM", () => this.editSongBpm());
    carousel.addItem("Edit Offset", () => this.editSongOffset());
    carousel.addItem("Edit Sample Start", () => this.editSampleStart());
    carousel.addItem("Edit Sample Length", () => this.editSampleLength());

    carousel.addItem("< Back", () => this.showEditMenu());
    carousel.onCancel.add(() => this.showEditMenu());
  }

  editMetadataField(field) {
    const currentValue = this.song.chart[field] || "";
    const textInput = new TextInput(
      currentValue,
      20,
      newValue => {
        this.song.chart[field] = newValue;
        this.showMetadataEdit();
      },
      () => {
        this.showMetadataEdit();
      }
    );
  }

  editSongBpm() {
    const bpm = this.song.chart.bpmChanges[0]?.bpm || 120;
    new ValueInput(
      bpm,
      0,
      1000,
      1,
      value => {
        if (!this.song.chart.bpmChanges[0]) {
          this.song.chart.bpmChanges[0] = { beat: 0, bpm: value, sec: 0 };
        } else {
          this.song.chart.bpmChanges[0].bpm = value;
        }
        this.showMetadataEdit();
      },
      () => {
        this.showMetadataEdit();
      }
    );
  }

  editSongOffset() {
    const offset = this.song.chart.offset || 0;
    new ValueInput(
      offset,
      -32,
      32,
      0.001,
      value => {
        this.song.chart.offset = value;
        this.showMetadataEdit();
      },
      () => {
        this.showMetadataEdit();
      }
    );
  }

  editSampleStart() {
    const sampleStart = this.song.chart.sampleStart || 0;
    new ValueInput(
      sampleStart,
      0,
      this.audio.duration || 100,
      0.1,
      value => {
        this.song.chart.sampleStart = value;

        // Preview the sample
        if (this.audio && this.audio.src) {
          this.playPreview(value, this.song.chart.sampleLength);
        }

        this.showMetadataEdit();
      },
      () => {
        this.showMetadataEdit();
      }
    );
  }

  editSampleLength() {
    const sampleLength = this.song.chart.sampleLength || 10;
    new ValueInput(
      sampleLength,
      1,
      30,
      0.1,
      value => {
        this.song.chart.sampleLength = value;
        this.showMetadataEdit();
      },
      () => {
        this.showMetadataEdit();
      }
    );
  }

  editBGChangeFiles() {
    const carousel = new CarouselMenu(0, 0, game.width / 2, game.height / 2, {
      align: "left",
      bgcolor: "#d35400",
      fgcolor: "#ffffff",
      animate: true
    });

    this.song.chart.backgrounds.forEach((bg, index) => {
      const fileName = bg.file ? bg.file.split("/").pop() : "No file";
      carousel.addItem(`BG ${index + 1}: ${fileName}`, () => {
        this.pickFile("image/*,video/*", async event => {
          const file = event.target.files[0];
          bg.file = file.name;
          this.files.extra[file.name] = FileTools.extractBase64(URL.createObjectURL(file));
          this.editBGChangeFiles();
        }, () => editBGChangeFiles());
      });
    });

    carousel.addItem("< Back", () => this.showFileMenu());
    carousel.onCancel.add(() => this.showFileMenu());
  }

  createNewSongAndReload() {
    this.song = this.createNewSong();
    game.state.start("Editor");
  }

  saveAndExit() {
    this.showHomeScreen();
  }

  clearUI() {
    if (this.mainCarousel) {
      this.mainCarousel.destroy();
      this.mainCarousel = null;
    }
    if (this.songInfoText) {
      this.songInfoText.destroy();
      this.songInfoText = null;
    }
    if (this.bannerSprite) {
      this.bannerSprite.visible = false;
    }
  }

  // BPM/Stop/BG change methods
  calculateBPM(beats) {
    if (beats.length < 3) {
      return 0;
    }

    // Calculate intervals between beats
    const intervals = [];
    for (let i = 1; i < beats.length; i++) {
      intervals.push(beats[i] - beats[i - 1]);
    }

    // Filter out outliers (keep only intervals within 20% of median)
    const median = intervals.sort((a, b) => a - b)[Math.floor(intervals.length / 2)];
    const validIntervals = intervals.filter(interval => Math.abs(interval - median) / median < 0.2);

    if (validIntervals.length === 0) {
      return 0;
    }

    // Calculate average interval and convert to BPM
    const avgInterval = validIntervals.reduce((a, b) => a + b, 0) / validIntervals.length;
    const bpm = Math.round(60 / avgInterval);

    // TODO: Validate BPM range
    return bpm;
  }

  detectBPMHere() {
    const audioElement = document.createElement("audio");
    audioElement.src = this.audio.src;
    audioElement.currentTime = this.chartRenderer.beatToSec(this.cursorBeat);

    this.menuVisible = true;

    // Create background
    const background = game.add.graphics(0, 0);
    background.beginFill(0x000000, 0.8);
    background.drawRect(0, 0, game.width, game.height);
    background.endFill();

    // Create instruction text
    const instructionText = new Text(game.width / 2, game.height / 2 - 20, "TAP TO THE BEAT TO CALCULATE BPM");
    instructionText.anchor.set(0.5);

    // Create offset display text
    const valueText = new Text(game.width / 2, game.height / 2 + 10, "BPM: 0", FONTS.default);
    valueText.tint = 0xffff00;
    valueText.anchor.set(0.5);
    
    const startTime = this.audio.currentTime;

    const beats = [];

    this.stopPlayback();
    audioElement.play();

    const inputHandler = key => {
      if (key == "a") {
        beats.push(audioElement.currentTime);
        valueText.write(`BPM: ${this.calculateBPM(beats)}`);
        game.add.tween(valueText.scale).to({ x: 1.1, y: 1.1 }, 50, Phaser.Easing.Quadratic.Out, true).yoyo(true);
      } else if (key == "b") {
        background.destroy();
        instructionText.destroy();
        valueText.destroy();
        audioElement.pause();
        audioElement.src = "";
        gamepad.signals.pressed.any.remove(inputHandler);
        this.menuVisible = false;
      }
    };

    gamepad.signals.pressed.any.add(inputHandler);
  }

  addBPMChange() {
    this.menuVisible = true;

    new ValueInput(120, 0, 1000, 1,
      value => {
        this.song.chart.bpmChanges.push({
          beat: this.cursorBeat,
          bpm: value,
          sec: this.chartRenderer.beatToSec(this.cursorBeat)
        });
        this.song.chart.bpmChanges.sort((a, b) => a.beat - b.beat);
        this.updateInfoText();
        this.menuVisible = false;
      },
      () => {
        this.menuVisible = false;
      }
    );
  }

  getBPMChange() {
    return this.song.chart.bpmChanges.find(bpm => Math.abs(bpm.beat - this.cursorBeat) < 0.001);
  }

  editBPMChange() {
    const bpmChange = this.getBPMChange();
    if (bpmChange) {
      this.menuVisible = true;
      
      new ValueInput(
        120,
        0,
        1000,
        1,
        bpm => {
          const index = this.song.chart.bpmChanges.indexOf(bpmChange);
          if (index != -1) this.song.chart.bpmChanges[index].bpm = bpm;
          this.updateInfoText();
          this.menuVisible = false;
        },
        () => {
          this.menuVisible = false;
        }
      );
    }
  }
  
  removeBPMChange() {
    const bpmChange = this.getBPMChange();
    if (bpmChange) {
      const index = this.song.chart.bpmChanges.indexOf(bpmChange);
      this.chartRenderer.removeTag(bpmChange.beat, 'bpm');
      this.song.chart.bpmChanges.splice(index, 1);
    }
    this.updateInfoText();
  }

  addStop() {
    this.menuVisible = true;

    new ValueInput(
      1,
      0,
      360,
      0.1,
      length => {
        this.song.chart.stops.push({
          beat: this.cursorBeat,
          len: length,
          sec: this.chartRenderer.beatToSec(this.cursorBeat)
        });
        this.song.chart.stops.sort((a, b) => a.beat - b.beat);
        this.updateInfoText();
        this.menuVisible = false;
      },
      () => {
        this.menuVisible = false;
      }
    );
  }
  
  getStop() {
    return this.song.chart.stops.find(s => Math.abs(s.beat - this.cursorBeat) < 0.001);
  }

  editStop() {
    const stop = this.getStop();
    if (stop) {
      this.menuVisible = true;
      
      new ValueInput(
        1,
        0,
        360,
        0.1,
        length => {
          const index = this.song.chart.stops.indexOf(stop);
          if (index != -1) this.song.chart.stops[index].len = length;
          this.updateInfoText();
          this.menuVisible = false;
        },
        () => {
          this.menuVisible = false;
        }
      );
    }
  }

  removeStop() {
    const stop = this.getStop();
    if (stop) {
      const index = this.song.chart.stops.indexOf(stop);
      this.song.chart.stops.splice(index, 1);
      this.chartRenderer.removeTag(stop.beat, 'stop');
    }
    this.updateInfoText();
  }

  addBGChange() {
    this.pickFile("image/*,video/*", async event => {
      const file = event.target.files[0];
      const fileType = file.type.includes("video") ? "video" : "image";
      const url = URL.createObjectURL(file);
      this.song.chart.backgrounds.push({
        beat: this.cursorBeat,
        file: file.name,
        url: url,
        opacity: 1,
        fadeIn: 0,
        fadeOut: 0,
        effect: 0,
        type: fileType
      });
      this.song.chart.backgrounds.sort((a, b) => a.beat - b.beat);
      this.files.extra[file.name] = FileTools.extractBase64(url);
      this.updateInfoText();
    });
  }
  
  addNoSongBgChange() {
    this.song.chart.backgrounds.push({
      beat: this.cursorBeat,
      file: "-nosongbg-",
      url: "",
      opacity: 1,
      fadeIn: 0,
      fadeOut: 0,
      effect: 0,
      type: "image"
    });
    this.song.chart.backgrounds.sort((a, b) => a.beat - b.beat);
  }

  getBGChange() {
    return this.song.chart.backgrounds.find(bg => Math.abs(bg.beat - this.cursorBeat) < 0.001);
  }
  
  editBGChange() {
    const bgChange = this.getBGChange();
    if (bgChange) {
      this.pickFile("image/*,video/*", async event => {
        const file = event.target.files[0];
        const fileType = file.type.includes("video") ? "video" : "image";
        const url = URL.createObjectURL(file);
        const index = this.song.chart.backgrounds.indexOf(bgChange);
        this.song.chart.backgrounds[index].file = file.name;
        this.song.chart.backgrounds[index].url = url;
        this.files.extra[file.name] = FileTools.extractBase64(url);
        this.updateInfoText();
      });
    }
    this.updateInfoText();
  }
  
  removeBGChange() {
    const bgChange = this.getBGChange();
    if (bgChange) {
      const index = this.song.chart.backgrounds.indexOf(bgChange);
      this.song.chart.backgrounds.splice(index, 1);
      this.chartRenderer.removeTag(bgChange.beat, 'bg');
      delete this.files.extra[bgChange.file];
    }
    this.updateInfoText();
  }

  update() {
    gamepad.update();
    
    const { now, beat } = this.getCurrentTime();
    
    this.chartRenderer.render(now, beat);
    
    if (notifications.notificationWindow) notifications.notificationWindow.bringToTop();

    if (this.currentScreen === "metadata") {
      this.lyricsText.visible = false;
      this.icons.visible = true;
      
      const updateIconTint = (icon, enabled) => icon.tint = enabled ? 0xffffff : 0x888888;
      
      updateIconTint(this.audioIcon, this.files.audio);
      updateIconTint(this.bgIcon, this.files.background && this.files.background !== "");
      updateIconTint(this.bnIcon, this.files.banner && this.files.banner !== "");
      updateIconTint(this.lrcIcon, this.files.lyrics && this.files.lyrics.length);
      updateIconTint(this.extraIcon, this.files.extra && Object.entries(this.files.extra).length);
    } else if (this.currentScreen === "chartEdit") {
      this.handleChartEditInput();
      this.icons.visible = false;
      this.lyricsText.visible = this.isPlaying;
      if (this.lyrics) this.lyrics.move(now);

      if (this.isPlaying) {
        this.cursorBeat = beat;
        this.updateCursorPosition();
        this.updateInfoText();
        
        // Show hit effects when notes reach judge line
        this.showHitEffects(now, beat);
      }

      // Highlight selected notes
      const alpha = 0.8 + 0.2 * Math.sin(Date.now() * 0.01);
      this.getCurrentChartNotes().forEach(note => {
        if (note.sprite) note.sprite.alpha = 1;
        if (note.holdParts) {
          note.holdParts.body.alpha = 1;
          note.holdParts.end.alpha = 1;
        }
      });
      this.selectedNotes.forEach(note => {
        if (note.sprite) note.sprite.alpha = alpha;
        if (note.holdParts) {
          note.holdParts.body.alpha = alpha;
          note.holdParts.end.alpha = alpha;
        }
      });
    }
  }

  showHitEffects(now, beat) {
    const notes = this.getCurrentChartNotes();

    notes.forEach(note => {
      if (!note.hitEffectShown && note.sec - now <= 0 && note.sec - now > -1) {
        this.playExplosionEffect(note.column);
        note.hitEffectShown = true;
      }
    });
  }
  
  exitEditor() {
    game.state.start("MainMenu");
  }

  shutdown() {
    if (this.fileInput) {
      this.fileInput.value = "";
      this.fileInput = null;
    }
    this.stopPlayback();
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
      this.audio = null;
    }
    window.editorSongData = this.song;
  }
}

class Credits {
  init(returnState = 'MainMenu', returnStateParams = {}) {
    this.returnState = returnState;
    this.returnStateParams = returnStateParams;
    this.scrollSpeed = 15; // pixels per second
    this.isWaitingForInput = false;
    this.backgroundInterval = 8000; // Change background every 8 seconds
    this.availableBackgrounds = [];
  }

  create() {
    game.camera.fadeIn(0x000000);
    
    // Create background system
    this.setupBackground();
    
    // Start background music
    this.startBackgroundMusic();
    
    // Create credits container
    this.creditsContainer = game.add.group();
    
    // Base credits content
    const creditsContent = [
      { text: "PADMANIACS", font: FONTS.shaded, tint: 0x76fcde, spacing: 25 },
      { text: "Created by Retora", font: FONTS.default, tint: 0xffffff, spacing: 15 },
      
      // Dynamic song credits section
      { text: "SONG CREDITS", font: FONTS.shaded, tint: 0x76fcde, spacing: 20 }
    ];
    
    // Add credits from local songs
    const songCredits = this.getSongCredits();
    if (songCredits.length > 0) {
      creditsContent.push(...songCredits);
      creditsContent.push({ text: "", font: FONTS.default, tint: 0xffffff, spacing: 15 });
    }
    
    // Continue with remaining credits
    creditsContent.push(
      { text: "Special Thanks", font: FONTS.shaded, tint: 0x76fcde, spacing: 20 },
      { text: "StepMania Team", font: FONTS.default, tint: 0xffffff, spacing: 8 },
      { text: "photonstorm", font: FONTS.default, tint: 0xffffff, spacing: 8 },
      { text: "itch.io", font: FONTS.default, tint: 0xffffff, spacing: 8 },
      { text: "You!", font: FONTS.shaded, tint: 0xffffff, spacing: 25 },
      
      { text: COPYRIGHT, font: FONTS.default, tint: 0x888888, spacing: 40 },
    );
    
    // Create all text elements
    let currentY = game.height + 20; // Start below the screen
    
    creditsContent.forEach((credit, index) => {
      const text = new Text(game.width / 2, currentY, credit.text, credit.font, this.creditsContainer);
      text.anchor.set(0.5);
      text.wrapPreserveNewlines(112);
      text.tint = credit.tint;
      text.creditData = credit; // Store spacing info
      
      currentY += credit.spacing;
    });
    
    // Store total height for scrolling calculation
    this.totalHeight = currentY;
    this.startY = this.creditsContainer.y;
    
    // Setup completion detection
    this.creditsComplete = false;
    
    // Execute addon behaviors
    addonManager.executeStateBehaviors(this.constructor.name, this);
  }

  setupBackground() {
    // Create background sprite
    this.backgroundSprite = game.add.sprite(0, 0);
    this.backgroundSprite.alpha = 0.7;
    
    // Collect all available backgrounds from songs
    this.collectBackgrounds();
    
    // Start background slideshow
    if (this.availableBackgrounds.length > 0) {
      this.showNextBackground();
      this.backgroundTimer = game.time.events.loop(this.backgroundInterval, this.showNextBackground, this);
    } else {
      // Fallback: create gradient background
      this.backgroundSprite.loadTexture("ui_background_gradient");
    }
  }

  collectBackgrounds() {
    this.availableBackgrounds = [];
    
    // Collect from local songs
    if (window.localSongs && Array.isArray(window.localSongs)) {
      window.localSongs.forEach(song => {
        if (song.background && song.background !== "no-media") {
          this.availableBackgrounds.push(song.background);
        }
        if (song.banner && song.banner !== "no-media") {
          this.availableBackgrounds.push(song.banner);
        }
      });
    }
    
    // Collect from external songs
    if (window.externalSongs && Array.isArray(window.externalSongs)) {
      window.externalSongs.forEach(song => {
        if (song.background && song.background !== "no-media") {
          this.availableBackgrounds.push(song.background);
        }
        if (song.banner && song.banner !== "no-media") {
          this.availableBackgrounds.push(song.banner);
        }
      });
    }
    
    // Remove duplicates
    this.availableBackgrounds = [...new Set(this.availableBackgrounds)];
    
    console.log(`Found ${this.availableBackgrounds.length} backgrounds for slideshow`);
  }

  showNextBackground() {
    if (this.availableBackgrounds.length === 0) return;
    
    const nextBackground = game.rnd.pick(this.availableBackgrounds);
    
    // Create temporary image to load and display
    const tempImg = new Image();
    tempImg.onload = () => {
      // Create canvas for the background
      const canvas = document.createElement('canvas');
      canvas.width = 192;
      canvas.height = 112;
      const ctx = canvas.getContext('2d');
      
      // Draw and scale the image to fit
      ctx.drawImage(tempImg, 0, 0, 192, 112);
      
      // Create texture and apply to sprite
      const texture = PIXI.Texture.fromCanvas(canvas);
      this.backgroundSprite.loadTexture(texture);
      
      // Fade in effect
      this.backgroundSprite.alpha = 0;
      game.add.tween(this.backgroundSprite).to({ alpha: 0.4 }, 1000, "Linear", true);
    };
    
    tempImg.src = nextBackground;
  }

  startBackgroundMusic() {
    // Stop any existing background music
    if (backgroundMusic) {
      backgroundMusic.stop();
    }
    
    // Get all available songs
    const allSongs = [];
    
    // Add local songs
    if (window.localSongs && Array.isArray(window.localSongs)) {
      allSongs.push(...window.localSongs);
    }
    
    // Add external songs
    if (window.externalSongs && Array.isArray(window.externalSongs)) {
      allSongs.push(...window.externalSongs);
    }
    
    // Filter songs that have audio
    const songsWithAudio = allSongs.filter(song => song.audioUrl);
    
    if (songsWithAudio.length > 0) {
      // Pick a random song
      const randomSong = game.rnd.pick(songsWithAudio);
      
      // Create audio element for credits music
      this.creditsMusic = document.createElement("audio");
      this.creditsMusic.src = randomSong.audioUrl;
      this.creditsMusic.volume = [0,25,50,75,100][Account.settings.volume] / 100;
      this.creditsMusic.loop = true;
      
      // Start playback
      this.creditsMusic.play().catch(error => {
        console.warn("Could not play credits music:", error);
      });
      
      console.log(`Playing credits music: ${randomSong.title || "Unknown Song"}`);
    }
  }

  getSongCredits() {
    const songCredits = [];
    const seenCredits = new Set();
    
    if (window.localSongs && Array.isArray(window.localSongs)) {
      window.localSongs.forEach(song => {
        // Check if song has credit information
        const credit = song.credit;
        const title = song.titleTranslit || song.title || "Unknown Song";
        
        if (credit && !seenCredits.has(credit.toLowerCase())) {
          seenCredits.add(credit.toLowerCase());
          
          // Add song title and credit
          songCredits.push(
            { text: title, font: FONTS.default, tint: 0xffffff, spacing: 8 },
            { text: `by ${credit}`, font: FONTS.default, tint: 0xe0e0e0, spacing: 12 }
          );
        }
      });
    }
    
    // Also add disclaimer
    songCredits.push(
      { text: "", font: FONTS.default, tint: 0xffffff, spacing: 8 },
      { text: "All songs and charts belong to their respective copyright holders.", font: FONTS.default, tint: 0x888888, spacing: 12 }
    );
    
    return songCredits;
  }

  update() {
    // Update audio visualizer
    if (this.visualizer) {
      this.visualizer.update();
    }
    
    // Update gamepad
    gamepad.update();
    
    if (this.creditsComplete) return;
    
    // Scroll credits upward
    this.creditsContainer.y -= this.scrollSpeed * (gamepad.held.any ? 4 : 1) * (game.time.elapsed / 1000);
    
    // Check if credits have finished scrolling
    const bottomOfCredits = this.creditsContainer.y + this.totalHeight;
    if (bottomOfCredits < 0 && !this.creditsComplete) {
      this.creditsComplete = true;
      this.onCreditsComplete();
    }
  }

  onCreditsComplete() {
    // Show continue prompt
    this.continueText = new Text(game.width / 2, game.height / 2, "Thank you for playing", FONTS.shaded);
    this.continueText.anchor.set(0.5);
    this.continueText.alpha = 0;
    
    game.add.tween(this.continueText).to({ alpha: 1 }, 1000, "Linear", true);
    
    // Wait for input to return
    this.isWaitingForInput = true;
    gamepad.signals.pressed.any.addOnce(() => {
      this.returnToMenu();
    });
  }

  returnToMenu() {
    // Stop background music
    if (this.creditsMusic) {
      this.creditsMusic.pause();
      this.creditsMusic.src = "";
      this.creditsMusic = null;
    }
    
    // Stop background slideshow
    if (this.backgroundTimer) {
      game.time.events.remove(this.backgroundTimer);
    }
    
    // Restore background music if it was playing
    if (backgroundMusic && Account.settings.enableMenuMusic) {
      backgroundMusic.playLastSong();
    }
    
    // Fade out and transition
    game.camera.fade(0x000000, 1000);
    game.camera.onFadeComplete.addOnce(() => {
      game.state.start(this.returnState, true, false, this.returnStateParams);
    });
  }

  shutdown() {
    // Clean up event listeners
    if (this.skipHandler) {
      gamepad.signals.pressed.any.remove(this.skipHandler);
    }
    
    // Clean up music
    if (this.creditsMusic) {
      this.creditsMusic.pause();
      this.creditsMusic.src = "";
    }
    
    // Clean up background timer
    if (this.backgroundTimer) {
      game.time.events.remove(this.backgroundTimer);
    }
  }
}

class ErrorScreen {
  init(message, recoverStateKey) {
    this.message = message || "The causes of this failure are unknown yet";
    this.recoverStateKey = recoverStateKey || "Title";
  }
  create() {
    this.background = game.add.graphics(0, 0);
    this.background.beginFill(0x4428bc, 1);
    this.background.drawRect(0, 0, game.width, game.height);
    this.background.endFill();
    
    const text = new Text(96, 52, "");
    
    text.write(`AN ERROR HAS OCURRED!
    
${this.message}

Please Report The Developer Immediately!

=== Press Any Key To Recover ===`);
    text.wrapPreserveNewlines(188);

    text.anchor.set(0.5);
    
    // TODO: Check if gamepad didn't crashed before using it, fallback to window event listeners
    gamepad.signals.pressed.any.addOnce(() => {
      game.state.start(this.recoverStateKey);
    });
  }
  update() {
    gamepad.update();
  }
}

class ChartRenderer {
  constructor(scene, song, difficultyIndex, options = {}) {
    this.scene = scene;
    
    this.load(song, difficultyIndex);

    this.options = {
      enableGameplayLogic: true,
      enableJudgement: true,
      enableInput: true,
      enableHealth: true,
      enableMissChecking: true,
      enableReceptors: true,
      enableBeatLines: false,
      enableSpeedRendering: false,
      enableBGRendering: false,
      judgeLineYFalling: 90,
      judgeLineYRising: 25,
      ...options
    };

    this.scrollDirection = Account.settings.scrollDirection || "falling";

    // Visual constants
    this.VERTICAL_SEPARATION = 1.25;
    this.SCREEN_CONSTANT = Account.settings.speedMod === "C-MOD" ? 240 / 60 : 1;
    this.NOTE_SPEED_MULTIPLIER = Account.settings.noteSpeedMult + this.SCREEN_CONSTANT;
    this.JUDGE_LINE = this.scrollDirection === "falling" ? this.options.judgeLineYFalling : this.options.judgeLineYRising;
    this.DIRECTION = this.scrollDirection === "falling" ? -1 : 1;
    this.COLUMN_SIZE = 16;
    this.COLUMN_SEPARATION = 4;
    this.INACTIVE_COLOR = 0x888888;

    this.noteSpeedMultiplier = this.NOTE_SPEED_MULTIPLIER;

    this.speedMod = Account.settings.speedMod || "X-MOD";
    
    // Note color option (default to NOTE)
    this.noteColorOption = Account.settings.noteColorOption || "NOTE";

    // Define color constants for spritesheet frames
    const COLORS = {
      // This is how spritesheet frames are colored
      // They are ordered like NOTE color pattern in StepMania
      RED: 0,      // 4th
      BLUE: 1,     // 8th
      PURPLE: 2,   // 12th
      YELLOW: 3,   // 16th
      PINK: 4,     // 24th
      ORANGE: 5,   // 32nd
      CYAN: 6,     // 48th
      GREEN: 7,    // 64th
      WHITE: 8,    // 96th
      SKYBLUE: 9,  // 128th
      OLIVE: 10,   // 192nd
      GRAY: 11     // Anything faster
    };
    
    // Color mappings for different options
    this.colorMappings = {
      NOTE: {
        4: COLORS.RED,
        8: COLORS.BLUE,
        12: COLORS.PURPLE,
        16: COLORS.YELLOW,
        24: COLORS.PINK,
        32: COLORS.ORANGE,
        48: COLORS.CYAN,
        64: COLORS.GREEN,
        96: COLORS.WHITE,
        128: COLORS.SKYBLUE,
        192: COLORS.OLIVE,
        default: COLORS.GRAY
      },
      VIVID: {
        // VIVID: Color cycle per beat (Yellow, Maroon, Blue, Cyan)
        4: COLORS.YELLOW,   // 4th - Yellow
        8: COLORS.RED,      // 8th - Maroon (using RED as closest)
        12: COLORS.BLUE,    // 12th - Blue
        16: COLORS.CYAN,    // 16th - Cyan
        24: COLORS.YELLOW,  // 24th - Yellow (cycle repeats)
        32: COLORS.RED,     // 32nd - Maroon
        48: COLORS.BLUE,    // 48th - Blue
        64: COLORS.CYAN,    // 64th - Cyan
        96: COLORS.YELLOW,  // 96th - Yellow
        128: COLORS.RED,    // 128th - Maroon
        192: COLORS.BLUE,   // 192nd - Blue
        default: COLORS.CYAN // Ultra-fast - Cyan
      },
      FLAT: {
        // FLAT: All notes same color as VIVID 4th notes (Yellow)
        4: COLORS.YELLOW,   // 4th - Yellow
        8: COLORS.YELLOW,   // 8th - Yellow
        12: COLORS.YELLOW,  // 12th - Yellow
        16: COLORS.YELLOW,  // 16th - Yellow
        24: COLORS.YELLOW,  // 24th - Yellow
        32: COLORS.YELLOW,  // 32nd - Yellow
        48: COLORS.YELLOW,  // 48th - Yellow
        64: COLORS.YELLOW,  // 64th - Yellow
        96: COLORS.YELLOW,  // 96th - Yellow
        128: COLORS.YELLOW, // 128th - Yellow
        192: COLORS.YELLOW, // 192nd - Yellow
        default: COLORS.YELLOW // Ultra-fast - Yellow
      },
      RAINBOW: {
        // RAINBOW: Orange, Blue, Purple/Pink with color reuse
        4: COLORS.ORANGE,   // 4th - Orange
        8: COLORS.BLUE,     // 8th - Blue
        12: COLORS.PINK,    // 12th - Purple/Pink
        16: COLORS.PINK,    // 16th - Purple/Pink
        24: COLORS.BLUE,    // 24th - Blue (reused)
        32: COLORS.ORANGE,  // 32nd - Orange (reused)
        48: COLORS.PINK,    // 48th - Purple/Pink
        64: COLORS.BLUE,    // 64th - Blue (reused)
        96: COLORS.PINK,    // 96th - Purple/Pink
        128: COLORS.ORANGE, // 128th - Orange (reused)
        192: COLORS.BLUE,   // 192nd - Blue (reused)
        default: COLORS.PINK // Ultra-fast - Purple/Pink
      }
    };

    this.speedModGraphics = game.add.graphics(0, 0);
    this.bgChangeGraphics = game.add.graphics(0, 0);
    
    this.tags = {};

    // Groups for pooling
    this.linesGroup = new Phaser.SpriteBatch(game);
    this.receptorsGroup = new Phaser.SpriteBatch(game);
    this.freezeBodyGroup = new Phaser.Group(game);
    this.freezeEndGroup = new Phaser.Group(game);
    this.notesGroup = this.options.enableGameplayLogic ? new Phaser.SpriteBatch(game) : new Phaser.Group(game);
    this.minesGroup = new Phaser.Group(game);
    this.explosionsGroup = new Phaser.SpriteBatch(game);
    this.tagsGroup = new Phaser.Group(game);

    this.receptors = [];
    this.initialize();
  }
  
  load(song, difficultyIndex) {
    if (this.notes) {
      this.notes.forEach(note => this.killNote(note));
    }
    this.song = song;
    this.difficultyIndex = difficultyIndex;
    this.chart = song.chart;
    this.difficulty = this.chart.difficulties[difficultyIndex];
    this.notes = this.chart.notes[this.difficulty.type + this.difficulty.rating];
    this.bpmChanges = this.chart.bpmChanges;
    this.stops = this.chart.stops;
    this.backgrounds = this.chart.backgrounds || [];
  }

  initialize() {
    const leftOffset = this.calculateLeftOffset();

    // Create receptors
    for (let i = 0; i < 4; i++) {
      const receptor = game.add.sprite(leftOffset + i * (this.COLUMN_SIZE + this.COLUMN_SEPARATION) + this.COLUMN_SIZE / 2, this.JUDGE_LINE, "receptor", 2);
      receptor.anchor.set(0.5);

      receptor.angle = {0: 90, 1: 0, 2: 180, 3: -90}[i];
      
      if (!this.options.enableReceptors) receptor.visible = false;

      if (this.options.enableInput) {
        receptor.inputEnabled = true;
        receptor.down = false;
      }

      receptor.animations.add("down", [2, 1, 0], 30, false);
      receptor.animations.add("up", [0, 1, 2], 30, false);

      // Add explosion effect for receptors
      const explosion = game.add.sprite(receptor.x, receptor.y, "explosion");
      explosion.anchor.set(0.5);
      explosion.angle = receptor.angle;
      explosion.visible = false;
      receptor.explosion = explosion;

      const duration = 50;
      explosion.visible = false;
      explosion.scale.setTo(1.5);
      game.add.tween(explosion.scale).to({ x: 2, y: 2 }, duration, "Linear", true).yoyo(true).repeat(-1);

      this.receptorsGroup.add(receptor);
      this.receptors.push(receptor);
    }
  }

  calculateLeftOffset() {
    const totalWidth = 4 * this.COLUMN_SIZE + 3 * this.COLUMN_SEPARATION;
    return (192 - totalWidth) / 2;
  }
  
  calculateFullWidth() {
    return this.COLUMN_SIZE * 4 + this.COLUMN_SEPARATION * 3;
  }

  getNoteFrame(note) {
    const beat = note.beat;
    const colorMapping = this.colorMappings[this.noteColorOption];

    const divisions = Object.keys(colorMapping)
      .filter(key => key !== "default")
      .map(Number)
      .sort((a, b) => a - b);

    for (const division of divisions) {
      if (this.isBeatDivision(beat, division)) {
        return colorMapping[division];
      }
    }

    return colorMapping.default;
  }

  isBeatDivision(beat, division) {
    const epsilon = 0.0001;
    const remainder = (beat * division) % 4;
    return Math.abs(remainder) < epsilon || Math.abs(remainder - 4) < epsilon;
  }

  calculateVerticalPosition(note, now, beat) {
    let pastSize;
    let bodyHeight = 0;

    if (this.speedMod === "C-MOD") {
      const constantDeltaNote = note.sec - now;
      pastSize = constantDeltaNote * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.noteSpeedMultiplier;

      if (note.beatLength) {
        const freezeDuration = note.secLength || (note.beatLength * 60) / this.getCurrentBPM(beat);
        bodyHeight = Math.max(this.COLUMN_SIZE, freezeDuration * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.noteSpeedMultiplier);
      }
    } else {
      const deltaNote = note.beat - beat;
      pastSize = deltaNote * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.noteSpeedMultiplier;

      if (note.beatLength) {
        bodyHeight = Math.max(this.COLUMN_SIZE, note.beatLength * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.noteSpeedMultiplier);
      }
    }

    const yPos = this.scrollDirection === "falling" ? this.JUDGE_LINE - pastSize : this.JUDGE_LINE + pastSize;

    return { pastSize, bodyHeight, yPos };
  }

  getCurrentBPM(beat = 0) {
    if (!this.bpmChanges || this.bpmChanges.length === 0) return 120;
    
    let currentBPM = this.bpmChanges[0].bpm;
    for (let i = 1; i < this.bpmChanges.length; i++) {
      if (this.bpmChanges[i].beat <= beat) {
        currentBPM = this.bpmChanges[i].bpm;
      } else {
        break;
      }
    }
    return currentBPM;
  }

  getLastBpm(time, valueType) {
    return this.bpmChanges.find((e, i, a) => i + 1 == a.length || a[i + 1][valueType] >= time);
  }

  beatToSec(beat) {
    if (!this.bpmChanges || this.bpmChanges.length === 0) return beat * 60 / 120;
    
    let b = this.getLastBpm(beat, "beat");
    let x = ((beat - b.beat) / b.bpm) * 60 + b.sec;
    let s = this.stops.filter(({ beat: i }) => i >= b.beat && i < beat).map(i => i.len);
    for (let i in s) x += s[i];
    return x;
  }

  secToBeat(sec) {
    if (!this.bpmChanges || this.bpmChanges.length === 0) return sec * 120 / 60;
    
    let b = this.getLastBpm(sec, "sec");
    let s = this.stops.filter(({ sec: i }) => i >= b.sec && i < sec).map(i => (i.sec + i.len > sec ? sec - i.sec : i.len));
    for (let i in s) sec -= s[i];
    return ((sec - b.sec) * b.bpm) / 60 + b.beat;
  }
  
  render(now, beat) {
    if (this.scrollDirection === "falling") {
      this.renderFalling(now, beat);
    } else {
      this.renderRising(now, beat);
    }

    if (Account.settings.beatLines || this.options.enableBeatLines) {
      this.renderTimeLines(now, beat);
    }
    if (this.options.enableSpeedRendering) {
      this.renderSpeedChanges(now, beat);
    }
    if (this.options.enableBGRendering) {
      this.renderBGChanges(now, beat);
    }
    this.cleanupTags();
  }

  renderFalling(now, beat) {
    const leftOffset = this.calculateLeftOffset();
    const notesToRender = [];

    this.notes.forEach(note => {
      let { pastSize, bodyHeight, yPos } = this.calculateVerticalPosition(note, now, beat);

      const x = leftOffset + note.column * (this.COLUMN_SIZE + this.COLUMN_SEPARATION);

      // Miss checking (only in gameplay)
      if (this.options.enableMissChecking && note.type !== "M" && note.type != "2" && note.type != "4" && !note.hit && !note.miss && yPos > game.height) {
        note.miss = true;
        if (this.options.enableGameplayLogic && this.scene.player && this.scene.player.processJudgement) {
          this.scene.player.processJudgement(note, "miss", note.column);
        }
      }

      // Remove off-screen notes
      if (yPos < -this.COLUMN_SIZE || yPos > game.height + bodyHeight) {
        this.killNote(note);
        return;
      }

      if (note.type === "M") {
        this.renderMine(note, x, yPos);
      } else if (note.type === "2" || note.type === "4") {
        yPos = this.renderHoldNote(note, x, yPos, bodyHeight, now, beat, "falling");
      }

      if (note.type !== "M" && note.type !== "3") {
        this.renderArrow(note, x, yPos);
      }
      
      // Store for sorting
      notesToRender.push({note, yPos});
    });
    
    // Sort notes by Y position (falling: lowest Y first, rising: highest Y first)
    notesToRender.sort((a, b) => {
      if (this.scrollDirection === "falling") {
        return a.yPos - b.yPos; // Lowest Y first
      } else {
        return b.yPos - a.yPos; // Highest Y first
      }
    });
    
    // Reorder sprites based on sorted Y positions
    notesToRender.forEach((item, index) => {
      if (item.note.sprite) {
        this.notesGroup.bringToTop(item.note.sprite);
      }
      if (item.note.holdParts) {
        this.freezeBodyGroup.bringToTop(item.note.holdParts.body);
        this.freezeEndGroup.bringToTop(item.note.holdParts.end);
      }
    });
  }

  renderRising(now, beat) {
    const leftOffset = this.calculateLeftOffset();
    const notesToRender = [];

    this.notes.forEach(note => {
      let { pastSize, bodyHeight, yPos } = this.calculateVerticalPosition(note, now, beat);

      const x = leftOffset + note.column * (this.COLUMN_SIZE + this.COLUMN_SEPARATION);

      // Miss checking (only in gameplay)
      if (this.options.enableMissChecking && note.type !== "M" && note.type != "2" && note.type != "4" && !note.hit && !note.miss && yPos < -this.COLUMN_SIZE) {
        note.miss = true;
        if (this.options.enableGameplayLogic && this.scene.player && this.scene.player.processJudgement) {
          this.scene.player.processJudgement(note, "miss", note.column);
        }
      }

      // Remove off-screen notes
      if (yPos > game.height + this.COLUMN_SIZE || yPos < -bodyHeight) {
        this.killNote(note);
        return;
      }

      if (note.type === "M") {
        this.renderMine(note, x, yPos);
      } else if (note.type === "2" || note.type === "4") {
        yPos = this.renderHoldNote(note, x, yPos, bodyHeight, now, beat, "rising");
      }

      if (note.type !== "M" && note.type !== "3") {
        this.renderArrow(note, x, yPos);
      }
      
      // Store for sorting
      notesToRender.push({note, yPos});
    });
    
    // Sort notes by Y position
    notesToRender.sort((a, b) => {
      if (this.scrollDirection === "falling") {
        return a.yPos - b.yPos;
      } else {
        return b.yPos - a.yPos;
      }
    });
    
    // Reorder sprites
    notesToRender.forEach((item, index) => {
      if (item.note.sprite) {
        this.notesGroup.bringToTop(item.note.sprite);
      }
      if (item.note.holdParts) {
        this.freezeBodyGroup.bringToTop(item.note.holdParts.body);
        this.freezeEndGroup.bringToTop(item.note.holdParts.end);
      }
    });
  }

  renderMine(note, x, yPos) {
    if (!note.sprite) {
      note.sprite = this.minesGroup.getFirstDead() || (() => {
        const sprite = game.add.sprite(x, yPos, "mine");
        this.minesGroup.add(sprite);
        return sprite;
      })();
      note.sprite.reset(0, -32);
      note.sprite.animations.add("blink", [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
      note.sprite.animations.play("blink");
    }
    note.sprite.anchor.set(0.5);
    note.sprite.x = x + this.COLUMN_SIZE / 2;
    note.sprite.y = yPos;
  }

  renderArrow(note, x, yPos) {
    if (!note.sprite) {
      note.sprite = this.notesGroup.getFirstDead() || (() => {
        const sprite = game.add.sprite(0, 0);
        this.notesGroup.add(sprite);
        return sprite;
      })();
      note.sprite.reset(0, -32);
      note.sprite.loadTexture("arrows");
      note.sprite.frame = this.getNoteFrame(note);
      note.sprite.anchor.set(0.5);
      note.sprite.angle = {0: 90, 1: 0, 2: 180, 3: -90}[note.column];
    }
    note.sprite.x = x + this.COLUMN_SIZE / 2;
    note.sprite.y = yPos;
  }

  renderHoldNote(note, x, yPos, bodyHeight, now, beat, direction) {
    if (!note.holdParts) {
      const prefix = note.type === "2" ? "hold" : "roll";

      const getBody = () => {
        const sprite = this.freezeBodyGroup.getFirstDead() || (() => {
          const child = game.add.tileSprite(-64, -64, this.COLUMN_SIZE, 0, `${prefix}_body`);
          if (direction === "rising") {
            child.scale.y = -1;
            child.anchor.y = 1;
          } else {
            child.anchor.y = 1;
          }
          this.freezeBodyGroup.add(child);
          return child;
        })();
        sprite.reset(x, -64);
        sprite.loadTexture(`${prefix}_body`);
        return sprite;
      };

      const getEnd = () => {
        const sprite = this.freezeEndGroup.getFirstDead() || (() => {
          const child = game.add.sprite(0, 0);
          if (direction === "rising") {
            child.scale.y = -1;
            child.anchor.y = 1;
          } else {
            child.anchor.y = 1;
          }
          this.freezeEndGroup.add(child);
          return child;
        })();
        sprite.reset(x, -64);
        sprite.loadTexture(`${prefix}_end`);
        return sprite;
      };

      note.holdParts = { body: getBody(), end: getEnd() };
      note.holdActive = false;
    }

    const isActive = this.options.enableGameplayLogic && !note.finish && !note.miss && this.scene.activeHolds && this.scene.activeHolds[note.column]?.note === note && this.scene.activeHolds[note.column].active;

    let visibleHeightIsSet = typeof note.visibleHeight != "undefined";
    let visibleHeight = visibleHeightIsSet ? note.visibleHeight : bodyHeight;

    if (visibleHeight < 0) visibleHeight = 1;

    if (isActive && this.options.enableGameplayLogic) {
      if (direction === "falling") {
        const holdBottomY = yPos - bodyHeight;
        const judgeLineY = this.JUDGE_LINE;
        note.visibleHeight = Math.max(0, judgeLineY - holdBottomY);
        if (yPos > judgeLineY - this.COLUMN_SIZE / 2) yPos = judgeLineY;
      } else {
        const holdTopY = yPos + bodyHeight;
        const judgeLineY = this.JUDGE_LINE;
        note.visibleHeight = Math.max(0, holdTopY - judgeLineY);
        if (yPos < judgeLineY + this.COLUMN_SIZE / 2) yPos = judgeLineY;
      }
      note.active = true;
    } else if (this.options.enableGameplayLogic && typeof note.visibleHeight != "undefined") {
      if (direction === "falling") {
        yPos -= bodyHeight - note.visibleHeight;
      } else {
        yPos += bodyHeight - note.visibleHeight;
      }
      note.active = false;
    }

    // Miss checking for holds
    if (this.options.enableMissChecking && !note.miss && !note.holdActive) {
      if (direction === "falling" && yPos > this.JUDGE_LINE + this.COLUMN_SIZE) {
        note.miss = true;
        if (this.options.enableGameplayLogic && this.scene.player && this.scene.player.processJudgement) {
          this.scene.player.processJudgement(note, "miss", note.column);
        }
      } else if (direction === "rising" && yPos < this.JUDGE_LINE - this.COLUMN_SIZE) {
        note.miss = true;
        if (this.options.enableGameplayLogic && this.scene.player && this.scene.player.processJudgement) {
          this.scene.player.processJudgement(note, "miss", note.column);
        }
      }
    }

    let spritesVisible = !note.finish;

    let freezeYPos = Math.floor(yPos);
    let freezeHeight = Math.floor(visibleHeight);

    if (direction === "falling") {
      note.holdParts.body.y = freezeYPos;
      note.holdParts.body.height = freezeHeight;
      note.holdParts.end.y = freezeYPos - freezeHeight;
    } else {
      note.holdParts.body.y = freezeYPos;
      note.holdParts.body.height = freezeHeight;
      note.holdParts.end.y = freezeYPos + freezeHeight;
    }

    note.holdParts.body.visible = spritesVisible;
    note.holdParts.end.visible = spritesVisible;

    if (note.sprite) {
      note.sprite.visible = !isActive && spritesVisible;
    }

    const frame = isActive ? 1 : 0;
    const baseColor = note.type === "2" ? 0x00bb00 : 0x00eeee;
    const tint = note.miss ? this.INACTIVE_COLOR : baseColor;
    const alpha = note.miss ? 0.8 : 1;

    note.holdParts.body.frame = frame;
    note.holdParts.end.frame = frame;

    note.holdParts.body.tint = tint;
    note.holdParts.end.tint = tint;

    note.holdParts.body.alpha = alpha;
    note.holdParts.end.alpha = alpha;

    return yPos;
  }

  renderTimeLines(now, beat) {
    const beatsPerMeasure = Account.settings.beatsPerMeasure || 4;
    const startMeasure = Math.floor(beat / beatsPerMeasure);
    const endMeasure = startMeasure + 8;

    const currentVisibleBeats = new Set();

    for (let measure = startMeasure; measure <= endMeasure; measure++) {
      const measureBeat = measure * beatsPerMeasure;
      this.updateTimeLine(measureBeat, 0.9, now, beat);
      currentVisibleBeats.add(measureBeat);

      for (let beatOffset = 1; beatOffset < beatsPerMeasure; beatOffset++) {
        const currentBeat = measureBeat + beatOffset;
        this.updateTimeLine(currentBeat, 0.35, now, beat);
        currentVisibleBeats.add(currentBeat);
      }
    }

    this.cleanupInvisibleLines(currentVisibleBeats);
    this.cleanupStuckLines();
  }
  
  renderSpeedChanges(now, beat) {
    this.speedModGraphics.clear();
    
    const x = this.calculateLeftOffset();
    const width = this.calculateFullWidth();
    
    // Render BPM changes
    this.bpmChanges.forEach(bpmChange => {
      const y = this.getYPos(now, beat, bpmChange.beat);
      
      if (y >= -this.COLUMN_SIZE && y <= game.height + this.COLUMN_SIZE) {
        // BPM change line
        this.speedModGraphics.beginFill(0xFFFF00, 0.8);
        this.speedModGraphics.drawRect(x, y, width, 1);
        this.speedModGraphics.endFill();
        
        // BPM tag
        this.drawTag(bpmChange.beat, 'bpm', `${bpmChange.bpm}`, x + width + 2, y - 3, 0xFFFF00);
      } else {
        this.removeTag(bpmChange.beat, 'bpm');
      }
    });
    
    // Render stops
    this.stops.forEach(stop => {
      const y = this.getYPos(now, beat, stop.beat);
      
      if (y >= -this.COLUMN_SIZE && y <= game.height + this.COLUMN_SIZE) {
        // Stop line
        this.speedModGraphics.beginFill(0xFF0000, 0.8);
        this.speedModGraphics.drawRect(x, y, width, 1);
        this.speedModGraphics.endFill();
        
        // Stop tag
        this.drawTag(stop.beat, 'stop', `${stop.len.toFixed(2)}`, x + width + 2 + 16, y - 3, 0xFF0000);
      } else {
        this.removeTag(stop.beat, 'stop');
      }
    });
  }
  
  renderBGChanges(now, beat) {
    this.bgChangeGraphics.clear();
    
    const x = this.calculateLeftOffset();
    const width = this.calculateFullWidth();
    
    this.backgrounds.forEach(bgChange => {
      const y = this.getYPos(now, beat, bgChange.beat);
      
      if (y >= -this.COLUMN_SIZE && y <= game.height + this.COLUMN_SIZE) {
        // BG change line
        this.bgChangeGraphics.beginFill(0x00FF00, 0.8);
        this.bgChangeGraphics.drawRect(x, y, width, 1);
        this.bgChangeGraphics.endFill();
        
        // BG tag
        const fileName = bgChange.file ? bgChange.file.split('/').pop() : 'No file';
        this.drawTag(bgChange.beat, 'bg', 'BG', x + width + 2 + 16 + 16, y - 3, 0x00FF00);
      } else {
        this.removeTag(bgChange.beat, 'bg');
      }
    });
  }
  
  createTag(beat, type, x, y) {
    const existingChild = this.tagsGroup.getFirstDead();

    const tagText = existingChild || new Text(x, y, "---", {
      font: "font_tiny",
      fontMap: " ABCDEFGHIJKLMNOPQRSTUVWXYZ.,:!¡?¿h+-×*()[]/\\0123456789_'\"`•<>=%",
      fontWidth: 4,
      fontHeight: 6
    }, this.tagsGroup);
    
    if (!tagText.alive) tagText.revive();
    
    this.tags[`${type}_${beat}`] = { beat, text: '', type, color: 0xFFFFFF, x, y, tagText };
  }
  
  removeTag(beat, type) {
    const tag = this.tags[`${type}_${beat}`];
    
    if (tag) {
      tag.tagText.kill();
      this.tags[`${type}_${beat}`] = null;
      delete this.tags[`${type}_${beat}`];
    }
  }
  
  drawTag(beat, type, text, x, y, color) {
    const existingTag = this.tags[`${type}_${beat}`];
    
    if (existingTag) {
      existingTag.x = x;
      existingTag.y = y;
      existingTag.tagText.x = x;
      existingTag.tagText.y = y;
      
      if (existingTag.text != text) existingTag.tagText.write(text);
      if (existingTag.color != color) existingTag.tagText.tint = color;
      
      existingTag.text = text;
      existingTag.color = color;
    } else {
      this.createTag(beat, type, x, y);
    }
  }

  killNote(note, forever) {
    if (note.sprite) {
      note.sprite.kill();
      note.sprite = null;
      if (note.holdParts) {
        note.holdParts.body.kill();
        note.holdParts.end.kill();
        note.holdParts = null;
      }
    }
  }
  
  cleanupTags() {
    // Cleanup tags that lost their purpose
    Object.entries(this.tags).forEach(tag => {
      let shouldRemove = true;
      
      switch (tag.type) {
        case "bpm":
          this.bpmChanges.forEach(bpmChange => {
            if (bpmChange.beat === tag.beat) {
              shouldRemove = false;
            }
          });
          break;
        case "stop":
          this.stops.forEach(stop => {
            if (stop.beat === tag.beat) {
              shouldRemove = false;
            }
          });
          break;
        case "bg":
          this.backgrounds.forEach(bg => {
            if (bg.beat === bg.beat) {
              shouldRemove = false;
            }
          });
          break;
      }
      
      if (shouldRemove) this.removeTag(tag.beat, tag.type)
    });
  }
  
  getXPos(note) {
    return this.calculateLeftOffset() + note.column * (this.COLUMN_SIZE + this.COLUMN_SEPARATION);
  }
  
  getYPos(now, beat, targetBeat) {
    let yPos;
    
    if (this.speedMod === "C-MOD") {
      const targetSec = this.beatToSec(targetBeat);
      const constantDeltaNote = targetSec - now;
      const pastSize = constantDeltaNote * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.noteSpeedMultiplier;
      yPos = this.scrollDirection === "falling" ? this.JUDGE_LINE - pastSize : this.JUDGE_LINE + pastSize;
    } else {
      const deltaBeat = targetBeat - beat;
      const pastSize = deltaBeat * this.COLUMN_SIZE * this.VERTICAL_SEPARATION * this.noteSpeedMultiplier;
      yPos = this.scrollDirection === "falling" ? this.JUDGE_LINE - pastSize : this.JUDGE_LINE + pastSize;
    }
    
    return yPos;
  }

  updateTimeLine(targetBeat, alpha, now, beat) {
    let yPos = this.getYPos(now, beat, targetBeat);

    const isVisible = yPos >= -this.COLUMN_SIZE && yPos <= game.height + this.COLUMN_SIZE;

    if (isVisible) {
      let line = this.findLineForBeat(targetBeat);

      if (!line) {
        line = this.createLine(yPos, alpha);
        if (line) {
          line.targetBeat = targetBeat;
        }
      } else {
        line.y = yPos;
        line.alpha = alpha;
        line.revive();
      }
      
      line.lastUpdateTime = game.time.now;

      return line;
    }

    return null;
  }

  findLineForBeat(targetBeat) {
    const aliveLines = this.linesGroup.getAll("alive", true);

    for (let i = 0; i < aliveLines.length; i++) {
      const line = aliveLines[i];
      if (line.targetBeat === targetBeat) {
        return line;
      }
    }

    return null;
  }

  createExplosion(note, type = "normal") {
    const receptor = this.receptors[note.column];

    const existingChild = this.explosionsGroup.getFirstDead();

    const explosion = existingChild || (() => {
      const child = game.add.sprite(-64, -64);
      child.anchor.set(0.5);
      this.explosionsGroup.add(child);
      return child;
    })();

    explosion.loadTexture(type == "normal" ? "explosion" : "mineexplosion");
    explosion.reset(receptor.x, receptor.y);
    explosion.alpha = 1;
    explosion.scale.set(1);
    explosion.angle = receptor.angle;

    const duration = 200;
    game.add.tween(explosion.scale).to({ x: 2, y: 2 }, duration, "Linear", true);
    game.add
      .tween(explosion)
      .to({ alpha: 0 }, duration, "Linear", true)
      .onComplete.add(() => explosion.kill());
  }

  toggleHoldExplosion(column, visible) {
    const explosion = this.receptors[column].explosion;
    explosion.visible = visible;
    if (visible) {
      explosion.bringToTop();
    }
  }

  cleanupAllLines() {
    const aliveLines = this.linesGroup.getAll("alive", true);

    for (let i = 0; i < aliveLines.length; i++) {
      const line = aliveLines[i];
      line.kill();
    }
  }

  cleanupInvisibleLines(currentVisibleBeats) {
    const aliveLines = this.linesGroup.getAll("alive", true);

    for (let i = 0; i < aliveLines.length; i++) {
      const line = aliveLines[i];
      const buffer = this.COLUMN_SIZE * 2;
      const isOffScreen = line.y < -buffer || line.y > game.height + buffer;

      if (isOffScreen) {
        line.kill();
      }
    }
  }
  
  cleanupStuckLines() {
    const aliveLines = this.linesGroup.getAll("alive", true);

    for (let i = 0; i < aliveLines.length; i++) {
      const line = aliveLines[i];
      if (game.time.now - line.lastUpdateTime > 60) {
        line.kill();
      }
    }
  }

  createLine(y, alpha) {
    const existingChild = this.linesGroup.getFirstDead();

    const line = existingChild || (() => {
      const bmd = game.add.bitmapData(1, 1);
      bmd.fill(255, 255, 255);
      const child = game.add.sprite(this.calculateLeftOffset(), y, bmd);
      child.width = this.calculateFullWidth();
      this.linesGroup.add(child);
      return child;
    })();

    line.y = y;
    line.alpha = alpha;
    line.revive();

    return line;
  }

  destroy() {
    this.linesGroup.destroy(true);
    this.receptorsGroup.destroy(true);
    this.freezeBodyGroup.destroy(true);
    this.freezeEndGroup.destroy(true);
    this.notesGroup.destroy(true);
    this.minesGroup.destroy(true);
    this.explosionsGroup.destroy(true);
    this.tagsGroup.destroy(true);
    this.speedModGraphics.destroy();
    this.bgChangeGraphics.destroy();
  }
}

class Player {
  constructor(scene) {
    this.scene = scene
    
    // Use ChartRenderer for rendering
    this.renderer = new ChartRenderer(scene, JSON.parse(JSON.stringify(scene.song)), scene.song.difficultyIndex, {
      enableGameplayLogic: true,
      enableJudgement: true,
      enableInput: true,
      enableHealth: true,
      enableMissChecking: true
    });
    
    // Copy references from renderer
    this.notes = this.renderer.notes;
    this.bpmChanges = this.renderer.bpmChanges;
    this.stops = this.renderer.stops;
    
    this.autoplay = scene.autoplay;
    this.autoplayActiveHolds = new Set();

    // Gamepad keymap
    this.keymap = {
      left: 0,
      down: 1,
      up: 2,
      right: 3,
      a: 3,
      b: 2
    };

    // Game state
    this.inputStates = [false, false, false, false];
    this.lastInputStates = [false, false, false, false];
    this.activeHolds = {};
    this.heldColumns = new Set();
    this.judgementHistory = [];
    this.lastNoteCheckBeats = [null, null, null, null];
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.previousHealth = this.health;
    this.timingStory = [];

    // Game constants
    this.HOLD_FORGIVENESS = 0.3;
    this.ROLL_FORGIVENESS = 0.3;
    this.ROLL_REQUIRED_INTERVALS = 0.5;
    
    // Accuracy tracking
    this.judgementCounts = {
      marvelous: 0,
      perfect: 0,
      great: 0,
      good: 0,
      boo: 0,
      miss: 0
    };
    this.totalNotes = 0;
    this.accuracy = 0;
    this.gameOver = false;
    
    // Skill system
    this.skillSystem = this.scene.skillSystem;
    this.perfectStreak = 0;
    this.comboShieldActive = false;
    this.skillSystem.onHealthRegen = amount => this.onSkillHpRegen(amount);
    this.skillSystem.onComboShield = () => this.onComboShield();
    
    // Calculate total notes for accuracy
    this.calculateTotalNotes();
    this.updateAccuracy();
    
    // Copy receptors from renderer
    this.receptors = this.renderer.receptors;
    
    // Create UI text elements
    this.judgementText =
      this.scene.judgementText ||
      new Text(96, 20, "", {
        tint: 0xffffff
      });
    
    this.comboText =
      this.scene.comboText ||
      new Text(96, 40, "0", {
        tint: 0xffffff
      });

    this.scoreText =
      this.scene.scoreText ||
      new Text(8, 8, "00000000", {
        tint: 0xffffff
      });

    this.healthText =
      this.scene.healthText ||
      new Text(184, 8, "100%", {
        tint: 0xffffff
      });
  }
  
  calculateTotalNotes() {
    const noteValues = {
      "1": 1,
      "2": 2,
      "4": 2,
      "M": 0
    };
    this.totalNotes = 0;
    this.notes.forEach(note => {
      const value = noteValues[note.type] || 0;
      this.totalNotes += value;
    });
  }
  
  calculateLeftOffset() {
    const totalWidth = 4 * this.COLUMN_SIZE + 3 * this.COLUMN_SEPARATION;
    return (192 - totalWidth) / 2;
  }
  
  findClosestNote(column, beat, noteTypes, searchRangeSeconds = 0.5) {
    // Convert search range from seconds to beats for initial filtering
    const currentTime = this.scene.getCurrentTime().now;
    const searchRangeBeats = searchRangeSeconds * (this.getCurrentBPM(beat) / 60);
    
    const candidateNotes = this.notes.filter(n => 
      !n.hit && 
      n.column === column && 
      noteTypes.includes(n.type) && 
      Math.abs(n.beat - beat) <= searchRangeBeats
    );
  
    if (candidateNotes.length === 0) return null;
  
    // Find closest by time, not beats
    return candidateNotes.reduce((closest, current) => {
      const currentTimeDelta = Math.abs(current.sec - currentTime);
      const closestTimeDelta = Math.abs(closest.sec - currentTime);
      return currentTimeDelta < closestTimeDelta ? current : closest;
    });
  }

  findNotesInJudgeWindow(column, beat, noteTypes, judgeWindow) {
    // Find all notes of specified types within judge window
    return this.notes.filter(n => 
      !n.hit && 
      n.column === column && 
      noteTypes.includes(n.type) && 
      Math.abs(n.beat - beat) <= judgeWindow
    );
  }

  processNoteIfInWindow(note, currentTime, column, callback) {
    // Calculate time delta in seconds
    const noteTime = note.sec;
    const timeDelta = noteTime - currentTime;
    
    // Convert judge window to seconds for comparison
    const maxWindowSeconds = this.scene.JUDGE_WINDOWS.boo / 1000;
    
    if (Math.abs(timeDelta) <= maxWindowSeconds && this.lastNoteCheckBeats[column] !== note.beat) {
      callback(note, timeDelta);
      this.lastNoteCheckBeats[column] = note.beat;
      this.vibrate(REGULAR_VIBRATION_INTENSITY);
      return true;
    }
    return false;
  }

  // AI autolay method
  autoPlay() {
    if (!this.scene.startTime || this.scene.isPaused) return;
    
    const { now, beat } = this.scene.getCurrentTime();
    
    // Process regular notes for auto-play
    for (let column = 0; column < 4; column++) {
      const closestNote = this.findClosestNote(column, beat, "1");
      
      if (closestNote) {
        const delta = closestNote.beat - beat;
        
        // Check if note is within window
        if (delta <= 0 && !this.inputStates[column]) {
          // Simulate perfect input - press and immediately release
          this.handleInput(column, true);
          this.handleInput(column, false);
        }
      }
    }
    
    // Process freezes for auto-play
    for (let column = 0; column < 4; column++) {
      const holdNote = this.findClosestNote(column, beat, ["2", "4"]);
      
      if (holdNote && !this.autoplayActiveHolds.has(column)) {
        const delta = holdNote.beat - beat;
        if (delta <= 0) {
          // Start hold
          this.handleInput(column, true);
          this.autoplayActiveHolds.add(column);
        }
      }
      
      // Check if we should release completed holds
      const activeHold = this.activeHolds[column];
      if (activeHold && activeHold.progress >= activeHold.note.secLength) {
        this.handleInput(column, false);
        this.autoplayActiveHolds.delete(column);
      }
    }
    
    // Clean up any holds that are no longer active but we think they are
    for (let column of this.autoplayActiveHolds) {
      const activeHold = this.activeHolds[column];
      if (!activeHold || activeHold.note.hit) {
        this.handleInput(column, false);
        this.autoplayActiveHolds.delete(column);
      }
    }
  }

  // Input handling
  handleInput(column, isKeyDown) {
    if (!this.scene.startTime || this.scene.isPaused) return;
  
    const { now, beat } = this.scene.getCurrentTime();
    const hold = this.activeHolds[column];
  
    // Update input state
    this.inputStates[column] = isKeyDown;
  
    // Handle key down events
    if (isKeyDown) {
      this.heldColumns.add(column);
  
      // Reactivate inactive holds within forgiveness window
      const holdForgiveness = this.getHoldForgiveness();
      
      // Handle hold note reactivation forgiveness
      if (hold && hold.note.type === "2" && hold.inactive) {
        if (now - hold.lastRelease < this.HOLD_FORGIVENESS) {
          if (isKeyDown) {
            hold.active = true;
            hold.inactive = false;
            hold.lastPress = now;
            this.toggleHoldExplosion(column, true);
          }
        }
      }
      
      // Handle roll note tapping
      if (hold && hold.note.type === "4") {
        hold.tapped++;
        hold.lastTap = now;
        hold.active = true;
        hold.inactive = false;
        this.toggleHoldExplosion(column, true);
        this.vibrate(WEAK_VIBRATION_INTENSITY);
      }
  
      // Check for new holds and regular notes
      const regularNoteHit = this.checkRegularNotes(column, now, beat);
      if (!hold && !regularNoteHit) this.checkHoldStart(column, now, beat);
    }
    // Handle key up events
    else {
      this.heldColumns.delete(column);
      this.checkHoldRelease(column, now);
    }
  }
  
  checkRegularNotes(column, now, beat) {
    const closestNote = this.findClosestNote(column, beat, ["1"]);
    
    if (closestNote) {
      return this.processNoteIfInWindow(closestNote, now, column, (note, timeDelta) => {
        const judgement = this.getJudgement(timeDelta);
  
        this.createExplosion(note);
        note.sprite?.destroy();
        !note.hit && this.processJudgement(note, judgement, column);
        note.hit = true;
      });
    }
    return false;
  }

  checkMines(column, now, beat) {
    // Find mine notes that are very close to the current beat (at judgment line)
    const mineNotes = this.notes.filter(n => 
      !n.hit && 
      n.column === column && 
      n.type === "M" && 
      Math.abs(n.beat - beat) <= 0.1 // Small beat window
    );
  
    let hitMine = false;
    
    for (const mineNote of mineNotes) {
      // Double-check using the renderer's position calculation
      const { yPos } = this.renderer.calculateVerticalPosition(mineNote, now, beat);
      const judgmentLine = this.renderer.JUDGE_LINE;
      
      if (Math.abs(yPos - judgmentLine) <= 12) { // 12 pixel tolerance
        this.triggerMine(mineNote);
        hitMine = true;
      }
    }
    
    return hitMine;
  }
  
  triggerMine(mineNote) {
    this.createExplosion(mineNote, "mine");
    mineNote.hit = true;
    mineNote.sprite?.destroy();
    
    // Apply mine damage reduction from skills
    const mineDamageMultiplier = this.skillSystem ? this.skillSystem.getMineDamageMultiplier() : 1.0;
    const damage = Math.floor(10 * mineDamageMultiplier);
    
    this.health = Math.max(0, this.health - damage);
    this.combo = 0;
    
    // Trigger mine hit skill activation
    if (this.skillSystem) {
      this.skillSystem.checkSkillActivation('on_mine_hit', {});
    }
  }

  checkHoldStart(column, now, beat) {
    const closestHold = this.findClosestNote(column, beat, ["2", "4"]);
    
    if (closestHold) {
      this.processNoteIfInWindow(closestHold, now, column, (note, timeDelta) => {
        const judgement = this.getJudgement(timeDelta);
        
        this.processJudgement(note, judgement, column);
        
        this.activeHolds[column] = {
          note: note,
          startTime: now,
          progress: 0,
          tapped: 0,
          pressCount: 0,
          active: true,
          inactive: false,
          lastPress: now,
          lastRelease: null,
          lastTap: now
        };
        note.holdActive = true;
        
        this.toggleHoldExplosion(column, true);
      });
    }
  }

  checkHoldRelease(column, now) {
    const hold = this.activeHolds[column];
    if (hold) {
      hold.lastRelease = now;

      if (hold.note.type === "2") {
        const holdForgiveness = this.getHoldForgiveness();
        const remaining = hold.note.secLength - (now - hold.startTime);
        if (remaining > holdForgiveness) {
          hold.active = false;
          hold.inactive = true;
          this.toggleHoldExplosion(column, false);
        }
      }
    }
  }
  
  createExplosion(note, type = "normal") {
    this.renderer.createExplosion(note, type);
  }

  toggleHoldExplosion(column, visible) {
    this.renderer.toggleHoldExplosion(column, visible);
  }
  
  vibrate(duration = 25) {
    Account.settings.hapticFeedback && gamepad.vibrate(duration);
  }
  
  getAdjustedJudgementWindows() {
    const baseWindows = { ...this.scene.JUDGE_WINDOWS };
    const multiplier = this.skillSystem ? this.skillSystem.getJudgementWindowMultiplier() : 1.0;
    
    Object.keys(baseWindows).forEach(judgement => {
      baseWindows[judgement] *= multiplier;
    });
    
    return baseWindows;
  }

  getHoldForgiveness() {
    const baseForgiveness = this.HOLD_FORGIVENESS;
    const multiplier = this.skillSystem ? this.skillSystem.getHoldForgivenessMultiplier() : 1.0;
    return baseForgiveness * multiplier;
  }

  getRollForgiveness() {
    const baseForgiveness = this.ROLL_FORGIVENESS;
    const multiplier = this.skillSystem ? this.skillSystem.getRollForgivenessMultiplier() : 1.0;
    return baseForgiveness * multiplier;
  }

  getJudgement(timeDelta) {
    this.timingStory.push(timeDelta);
    
    // Use adjusted judgement windows (now in milliseconds)
    const judgeWindows = this.getAdjustedJudgementWindows();
    
    const absTimeDelta = Math.abs(timeDelta * 1000); // Convert to milliseconds
    
    for (const [judgement, window] of Object.entries(judgeWindows)) {
      if (absTimeDelta <= window) {
        // Update perfect streak
        if (judgement === 'marvelous' || judgement === 'perfect') {
          this.perfectStreak++;
        } else {
          this.perfectStreak = 0;
        }
        return judgement;
      }
    }
    return "miss";
  }
    
  processJudgement(note, judgement, column, type = "normal") {
    // Check for combo shield before processing miss
    if (judgement === "miss" && this.comboShieldActive) {
      judgement = "boo";
      this.comboShieldActive = false;
    }
    
    // Check for skill activation based on judgement
    if (this.skillSystem) {
      this.skillSystem.checkSkillActivation('on_miss', { judgement });
      
      // Check perfect streak
      if (this.perfectStreak > 0) {
        this.skillSystem.checkSkillActivation('on_perfect_streak', { 
          perfectStreak: this.perfectStreak 
        });
      }
    }
    
    // Apply judgement conversion from skills
    if (this.skillSystem) {
      const conversion = this.skillSystem.getJudgementConversion();
      if (conversion && judgement === conversion.from) {
        judgement = conversion.to;
      }
    }
    
    // Filter OK/N.G. judgements
    let judgementKey = "";
    
    switch (judgement) {
      case "ok":
        judgementKey = "marvelous";
        break;
      case "n.g.":
      case "ng":
        judgementKey = "boo";
        judgement = "n.g.";
        break;
      default:
        judgementKey = judgement;
    }

    // Judge marvelous if autoplay
    if (this.autoplay) {
      judgement = type == "normal" ? "marvelous" : "ok";
      judgementKey = "marvelous";
    }
    
    // Apply score multiplier from skills
    const scoreMultiplier = this.skillSystem ? this.skillSystem.getScoreMultiplier(judgementKey) : 1.0;
    const scoreValue = Math.floor(this.scene.SCORE_VALUES[judgementKey] * scoreMultiplier);
    
    if (!this.gameOver) this.score += scoreValue;
    
    // Update judgement counts
    this.judgementCounts[judgementKey]++;

    if (judgement === "miss") {
      this.combo = 0;
      this.health = Math.max(0, this.health - 5);
    } else {
      this.combo++;
      
      // Apply health gain multiplier from skills
      const healthGainMultiplier = this.skillSystem ? this.skillSystem.getHealthGainMultiplier() : 1.0;
      const healthGain = Math.floor(2 * healthGainMultiplier);
      
      if (!this.gameOver) this.health = Math.min(this.getMaxHealth(), this.health + healthGain);
      if (this.combo > this.maxCombo) {
        this.maxCombo = this.combo;
      }
    }

    // Update accuracy
    this.updateAccuracy();

    // Update UI
    this.updateUI();

    // Show judgement text
    this.showJudgementText(judgement, column, type);
  }
  
  getMaxHealth() {
    const baseHealth = this.maxHealth;
    const bonus = this.skillSystem ? this.skillSystem.getMaxHealthBonus() : 0;
    return baseHealth + bonus;
  }
  
  getNoteSpeedMultiplier() {
    const baseMultiplier = this.renderer.NOTE_SPEED_MULTIPLIER;
    const skillMultiplier = this.skillSystem ? this.skillSystem.getNoteSpeedMultiplier() : 1.0;
    return baseMultiplier * skillMultiplier;
  }
  
  updateAccuracy() {
    if (this.gameOver) return;
    
    const weights = {
      marvelous: 1.0,
      perfect: 0.9,
      great: 0.8,
      good: 0.5,
      boo: 0.25,
      miss: 0.0
    };

    let totalWeight = 0;
    let achievedWeight = 0;

    // Calculate weights for all judged notes
    for (const [judgement, count] of Object.entries(this.judgementCounts)) {
      const weight = weights[judgement];
      totalWeight += count * 1.0; // Maximum possible weight for each note
      achievedWeight += count * weight;
    }

    // Add remaining notes as misses (0 weight)
    const judgedNotes = Object.values(this.judgementCounts).reduce((a, b) => a + b, 0);
    const remainingNotes = Math.max(0, this.totalNotes - judgedNotes);
    totalWeight += remainingNotes * 1.0; // Maximum possible weight for remaining notes
    // achievedWeight stays the same for remaining notes (they count as 0)

    // Calculate final accuracy (0-100%)
    this.accuracy = totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 100;
    
    // Clamp to 0-100%
    this.accuracy = Phaser.Math.clamp(this.accuracy, 0, 100);
    
    // Update accuracy bar in HUD if it exists
    if (this.scene.accuracyBar) {
      const accuracyWidth = Math.floor(Math.max(1, (this.accuracy / 100) * 150));
      this.scene.accuracyBar.crop(new Phaser.Rectangle(0, 0, accuracyWidth, 2));
    }
  }

  updateUI() {
    this.comboText.write(this.combo.toString());
    this.comboText.tint = this.getComboColor(this.combo);

    this.scoreText.write(this.score.toString().padStart(8, "0"));
    
    // Pulse combo on increase
    if (this.combo > 0) {
      this.pulseText(this.comboText);
    }
  }
  
  getScoreRating() {
    const acc = this.accuracy;
    
    if (acc >= 98) return "SSS+";
    if (acc >= 95) return "SSS";
    if (acc >= 92.5) return "SS";
    if (acc >= 90) return "S";
    if (acc >= 80) return "A";
    if (acc >= 70) return "B";
    if (acc >= 60) return "C";
    if (acc >= 50) return "D";
    if (acc >= 40) return "E";
    return "F";
  }

  showJudgementText(judgement, column, type) {
    const colors = {
      marvelous: 0x00ffff,
      perfect: 0xffff00,
      great: 0x00ff00,
      good: 0x0000ff,
      boo: 0xffa500,
      miss: 0xff0000,
      ok: 0x00cc00,
      ng: 0x22ffff
    };
    
    let tintColor = colors[judgement.replace("n.g.", "ng")];
    
    if (type == "freeze") {
      const text = new Text(this.renderer.receptors[column].x, this.renderer.JUDGE_LINE + 12 * this.renderer.DIRECTION, judgement, FONTS.stroke);
      text.tint = tintColor;
      text.anchor.setTo(0.5);
      game.add.tween(text).to({ alpha: 0, y: text.y + (8 * this.renderer.DIRECTION) }, 250, "Linear", true, 25).onComplete.addOnce(() => text.destroy());
    } else {
      this.judgementText.write(judgement.toUpperCase());
      this.judgementText.tint = tintColor;
      this.judgementText.alpha = 1;
      this.judgementText.scale.set(1);
  
      game.tweens.removeFrom(this.judgementText);
      game.add.tween(this.judgementText.scale).to({ x: 1.5, y: 1 }, 200, "Linear", true).yoyo(true);
      game.add.tween(this.judgementText).to({ alpha: 0 }, 200, "Linear", true, 200);
      
      if (column !== undefined && judgement !== "miss") {
        const receptor = this.receptors[column];
        this.pulseSprite(receptor);
      }
    }
  }

  pulseText(text) {
    text.scale.set(1);
    game.add.tween(text.scale).to({ x: 1.3, y: 1.3 }, 100, "Linear", true).yoyo(true);
  }

  pulseSprite(sprite) {
    sprite.scale.set(1);
    game.add.tween(sprite.scale).to({ x: 1.2, y: 1.2 }, 50, "Linear", true).yoyo(true);
  }
  
  getComboColor(combo) {
    const max = 100;
    const value = Math.min(max, combo);
    const r = Math.floor(255 + (255 - 255) * (value / max));
    const g = Math.floor(255 + (255 - 255) * (value / max));
    const b = Math.floor(255 + (0 - 255) * (value / max));
    return (r << 16) | (g << 8) | b;
  }
  
  onSkillHpRegen(amount = 0) {
    if (!this.gameOver) {
      this.health = Math.min(this.getMaxHealth(), this.health + amount);
    }
  }
  
  onComboShield() {
    this.comboShieldActive = true;
  }
  
  getCurrentBPM(beat = 0) {
    return this.renderer.getCurrentBPM(beat);
  }
  
  getLastBpm(time, valueType) {
    return this.renderer.getLastBpm(time, valueType);
  }
  
  beatToSec(beat) {
    return this.renderer.beatToSec(beat);
  }
  
  secToBeat(sec) {
    return this.renderer.secToBeat(sec);
  }
  
  render() {
    if (!this.scene.startTime || this.scene.isPaused) return;

    this.renderer.scene.activeHolds = this.activeHolds;

    const { now, beat } = this.scene.getCurrentTime();
    this.renderer.render(now, beat);
  }
  
  update() {
    const { now, beat } = this.scene.getCurrentTime();

    // Input handling
    if (!this.autoplay) {
      Object.keys(this.keymap).forEach(key => {
        if (gamepad.pressed[key]) this.handleInput(this.keymap[key], true);
        else if (gamepad.released[key]) this.handleInput(this.keymap[key], false);
      });
      
      // Check mines for currently pressed columns
      for (let column = 0; column < 4; column++) {
        if (this.inputStates[column]) {
          this.checkMines(column, now, beat);
        }
      }
    } else {
      this.autoPlay();
    }
    
    // Key down/up animation
    for (let i = 0; i < 4; i++) {
      const receptor = this.receptors[i];
      const down = this.inputStates[i];
      if (receptor.down != down) {
        receptor.down = down;
      }
      receptor.frame = down ? 0 : 2;
    }
    
    // Check for skill activations
    if (this.skillSystem) {
      this.skillSystem.update();
      
      if (this.combo > 0) {
        this.skillSystem.checkSkillActivation('on_combo', { combo: this.combo });
        this.skillSystem.checkSkillActivation('on_high_combo', { combo: this.combo });
      }
      
      if (this.health <= 30) {
        this.skillSystem.checkSkillActivation('on_low_health', { health: this.health });
      }
      
      // Check critical health
      if (this.health <= 15) {
        this.skillSystem.checkSkillActivation('on_critical_health', { health: this.health });
      }
    }

    // Update health
    if (this.health != this.previousHealth) {
      this.previousHealth = this.health;
      const tween = game.add.tween(this.scene.lifebarMiddle);
      tween.to({ width: (this.health / this.getMaxHealth()) * 102 }, 100, Phaser.Easing.Quadratic.In, true);
      tween.onUpdateCallback(() => this.scene.lifebarEnd.x = this.scene.lifebarMiddle.width);
      if (this.health <= 0) {
        this.gameOver = true;
        this.health = 0;
      };
      this.healthText.write(this.health.toString());
    }
    this.scene.lifebarEnd.x = this.scene.lifebarMiddle.width;
    if (this.scene.accuracyBar) {
      if (this.accuracy <= 0) {
        this.scene.accuracyBar.visible = false;
      } else {
        this.scene.accuracyBar.visible = true;
      }
    }
    
    // Update rendered note speed
    this.renderer.noteSpeedMultiplier = this.getNoteSpeedMultiplier();

    // Update active holds
    Object.entries(this.activeHolds).forEach(([col, hold]) => {
      const { now } = this.scene.getCurrentTime();
      
      if (this.autoplay || hold.note.type === "2") {
        if (!hold.active) {
          const holdForgiveness = this.getHoldForgiveness();
          const sinceRelease = now - hold.lastRelease;
          if (sinceRelease > holdForgiveness) {
            hold.active = false;
            hold.inactive = true;
            hold.note.miss = true;
            this.toggleHoldExplosion(col, false);
          }
        }
      } else if (hold.note.type === "4") {
        const rollForgiveness = this.getRollForgiveness();
        const sinceLastTap = now - hold.lastTap;
        if (sinceLastTap > rollForgiveness) {
          hold.inactive = true;
          hold.active = false;
          hold.note.miss = true;
          this.toggleHoldExplosion(col, false);
        }
      }

      hold.progress = now - hold.startTime;
      if (hold.progress >= hold.note.secLength) {
        let judgement = "n.g.";

        if (hold.note.type === "2") {
          judgement = !hold.note.miss ? "ok" : "n.g.";
        } else if (hold.note.type === "4") {
          const requiredTaps = Math.ceil(hold.note.beatLength * this.ROLL_REQUIRED_INTERVALS);
          if (hold.note.beatLength <= 0.5) {
            judgement = "ok";
          } else {
            judgement = hold.tapped >= requiredTaps && !hold.note.miss ? "ok" : "n.g.";
          }
        }
      
        hold.note.finish = true;
        
        this.vibrate(REGULAR_VIBRATION_INTENSITY)

        this.processJudgement(hold.note, judgement, Number(col), "freeze");
        hold.note.hit = true;
        this.toggleHoldExplosion(col, false);
        delete this.activeHolds[col];
      }
    });
  }

  destroy() {
    if (this.renderer) {
      this.renderer.destroy();
    }
  }
}

