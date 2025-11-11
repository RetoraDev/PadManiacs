const COPYRIGHT = "(C) RETORA 2025";

const VERSION = "v0.0.6";

window.DEBUG = true;

// Environment detection constants
const ENVIRONMENT = {
  UNKNOWN: 'UNKNOWN',
  NWJS: 'NWJS',
  CORDOVA: 'CORDOVA',
  WEB: 'WEB'
};

// Detect environment
const detectEnvironment = () => {
  // Check for NWJS
  if (typeof nw !== 'undefined' && nw.process && nw.process.versions && nw.process.versions['node-webkit']) {
    return ENVIRONMENT.NWJS;
  }
  
  // Check for Cordova (file protocol or explicit cordova object)
  if (window.location.protocol === 'file:' || typeof window.cordova !== 'undefined') {
    return ENVIRONMENT.CORDOVA;
  }
  
  // Default to web
  return ENVIRONMENT.WEB;
};

const CURRENT_ENVIRONMENT = detectEnvironment();

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
    drawTimeLines: true,
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

const FONTS = {
  default: { font: "font_tiny" },
  tiny: { font: "font_tiny" },
  shaded: { font: "font_tiny_shaded" },
  stroke: { font: "font_tiny_stroke", fontWidth: 5 },
  number: { font: "font_tiny_number", fontMap: "1234567890 " },
  combo: { font: "font_combo", fontMap: "0123456789 ", fontWidth: 8, fontHeight: 8 }
};

const WINDOW_PANELS = ["1"];

const CORDOVA_EXTERNAL_DIRECTORY = "PadManiacs/";
const NWJS_EXTERNAL_DIRECTORY = "data/";

const EXTERNAL_DIRECTORY = CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA ? CORDOVA_EXTERNAL_DIRECTORY : NWJS_EXTERNAL_DIRECTORY;

const ADDONS_DIRECTORY = "Addons";
const SONGS_DIRECTORY = "Songs";

const ENABLE_PARALLEL_LOADING = false;
const MAX_PARALLEL_DOWNLOADS = 16;

const MAX_PARALLEL_ADDON_LOADS = 3;
const ENABLE_ADDON_SAFE_MODE = true;

const ENABLE_UI_SFX = false;

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

let JUDGE_WINDOWS = {
  marvelous: 0.20,
  perfect: 0.25,
  great: 0.30,
  good: 0.35,
  boo: 0.45
};

let SCORE_VALUES = {
  marvelous: 1000,
  perfect: 800,
  great: 500,
  good: 200,
  boo: 50,
  miss: 0
};