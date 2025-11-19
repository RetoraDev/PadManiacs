// Character system constants
const CHARACTER_SYSTEM = {
  MAX_NAME_LENGTH: 4,
  DEFAULT_CHARACTER: "EIRI",
  MAX_SKILL_LEVEL: 5,
  EXPERIENCE_CURVE: (level) => Math.floor(level * level * 10),
  SKILL_UNLOCK_CHANCE: 0.25,
  SKILL_LEVEL_UP_CHANCE: 0.6,
  MIN_LEVEL_FOR_SKILL: 5,
  SKILL_COOLDOWN_LEVELS: 5,
  PORTRAIT_CROP: { x: 43, y: 11, w: 15, h: 15 },
  CLOSE_SHOT_CROP: { x: 32, y: 15, w: 36, h: 7 },
  HAIR_STYLES: {
    front: 3,  // 3 front hair styles
    back: 3    // 3 back hair styles
  }
};

// Character skills with modular effects
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
    effectParams: { threshold: 50 },
    effect: "modify_judgement_window",
    effectParams: { multiplier: 1.2 },
    duration: 5000,
    cooldown: 30000
  },
  {
    id: "health_regen",
    name: "Health Regeneration",
    description: "Regenerates 1 health per second for 10 seconds",
    activationCondition: "on_low_health",
    effectParams: { threshold: 30 },
    effect: "health_regen",
    effectParams: { amount: 1, interval: 1000 },
    duration: 10000,
    cooldown: 45000
  },
  {
    id: "max_health_boost",
    name: "Max Health Boost",
    description: "Increases maximum health by 20 for 15 seconds",
    activationCondition: "on_high_combo",
    effectParams: { threshold: 100 },
    effect: "modify_max_health",
    effectParams: { amount: 20 },
    duration: 15000,
    cooldown: 60000
  },
  {
    id: "time_dilation",
    name: "Time Dilation",
    description: "Slows down note speed by 15% for 8 seconds",
    activationCondition: "on_perfect_streak",
    effectParams: { threshold: 10 },
    effect: "modify_note_speed",
    effectParams: { multiplier: 0.85 },
    duration: 8000,
    cooldown: 40000
  }
];

// Character items
const CHARACTER_ITEMS = {
  clothing: [
    {
      id: "school_uniform",
      name: "School Uniform",
      description: "Standard school uniform",
      type: "clothing",
      unlocksAtLevel: 0
    }
  ],
  accessories: [
    {
      id: "headphones",
      name: "Headphones", 
      description: "Music listening headphones",
      type: "accessory",
      unlocksAtLevel: 0
    }
  ]
};