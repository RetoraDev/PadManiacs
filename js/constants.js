const DEFAULT_ACCOUNT = {
  settings: {
    volume: 3,
    autoplay: false,
    enableMenuMusic: true,
    randomSong: false,
    renderer: 0,
    pixelated: true,
    framerate: 6,
    noteColorOption: 'NOTE',
    noteSpeedMult: 1,
    userOffset: 0
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

const EXTERNAL_DIRECTORY = "PadManiacs/";

const ENABLE_PARALLEL_LOADING = true;
const MAX_PARALLEL_DOWNLOADS = 32;

const DEFAULT_SONG_FOLDERS = [
  "Miki Miki Romantic Night",
  "Thousand Cherry Blossoms",
  "Undead Enemy",
  "Hatsune Miku - Melt",
  "Kagamine Rin - Love Is War(R184mm Remix)",
  "Kasane Territory - Kasane Teto",
  "A New World",
  "39",
  "Asu No Hikari",
  "The Dubstep Soldiers at the Front",
  "Just Be Friends",
  "Gentle Despair",
  "Palette",
  "Gigantic Girl",
  "melody_2.exe"
];

const FRAMERATES = [15, 20, 25, 30, 50, 55, 60];