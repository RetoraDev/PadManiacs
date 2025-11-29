const COPYRIGHT = "%";

const VERSION = "%";

window.DEBUG = %;

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

const FEEDBACK_REVIEW_URL = "https://retora.itch.io/padmaniacs/rate";
const FEEDBACK_FEATURE_REQUEST_URL = "https://itch.io/t/5585472/feature-requests";
const FEEDBACK_BUG_REPORT_URL = "https://itch.io/t/5585499/bug-reports";

const RATING_PROMPT_MIN_PLAYTIME = 15 * 60;
const FEATURE_REQUEST_MIN_PLAYTIME = 30 * 60;
