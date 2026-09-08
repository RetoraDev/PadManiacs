const COPYRIGHT = "%";

const VERSION = "%";

window.DEBUG = %;

window.LOG_PERSONALITY_STUDY = window.DEBUG;

window.UNLOCK_ALL_CLOTHES = false;

const DEFAULT_FONT_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;¡!¿?()[]{}/\\+-×*\"' <>=%@#$&|~^_•∥▶❤★áéíóúüñÁÉÍÓÚÜÑ";
const TINY_FONT_MAP = " ABCDEFGHIJKLMNOPQRSTUVWXYZ.,:!¡?¿h+-×*()[]/\\0123456789_'\" •<>=%∥▶";

const FONTS = {
  default: {
    credit: __("From TIC-80 tiny computer. Copyright (c) 2017-2023 Vadim Grigoruk @nesbox // grigoruk@gmail.com||De la mini computadora TIC-80. Copyright (c) 2017-2023 Vadim Grigoruk @nesbox // grigoruk@gmail.com"),
    font: "font_default",
    fontMap: DEFAULT_FONT_MAP,
    fontWidth: 4,
    fontHeight: 7,
    autoUpperCase: false
  },
  default_shadow: {
    credit: __("From TIC-80 tiny computer. Copyright (c) 2017-2023 Vadim Grigoruk @nesbox // grigoruk@gmail.com||De la mini computadora TIC-80. Copyright (c) 2017-2023 Vadim Grigoruk @nesbox // grigoruk@gmail.com"),
    font: "font_defaul_shadow",
    fontMap: DEFAULT_FONT_MAP,
    fontWidth: 4,
    fontHeight: 7,
    autoUpperCase: false
  },
  default_stroke: {
    credit: __("From TIC-80 tiny computer. Copyright (c) 2017-2023 Vadim Grigoruk @nesbox // grigoruk@gmail.com||De la mini computadora TIC-80. Copyright (c) 2017-2023 Vadim Grigoruk @nesbox // grigoruk@gmail.com"),
    font: "font_defaul_stroke",
    fontMap: DEFAULT_FONT_MAP,
    fontWidth: 5,
    fontHeight: 8,
    autoUpperCase: false
  },
  bold: {
    credit: __("From TIC-80 tiny computer. Copyright (c) 2017-2023 Vadim Grigoruk @nesbox // grigoruk@gmail.com||De la mini computadora TIC-80. Copyright (c) 2017-2023 Vadim Grigoruk @nesbox // grigoruk@gmail.com"),
    font: "font_bold",
    fontMap: DEFAULT_FONT_MAP,
    fontWidth: 6,
    fontHeight: 7,
    autoUpperCase: false
  },
  bold_shadow: {
    credit: __("From TIC-80 tiny computer. Copyright (c) 2017-2023 Vadim Grigoruk @nesbox // grigoruk@gmail.com||De la mini computadora TIC-80. Copyright (c) 2017-2023 Vadim Grigoruk @nesbox // grigoruk@gmail.com"),
    font: "font_bold_shadow",
    fontMap: DEFAULT_FONT_MAP,
    fontWidth: 6,
    fontHeight: 7,
    autoUpperCase: false
  },
  bold_stroke: {
    credit: __("From TIC-80 tiny computer. Copyright (c) 2017-2023 Vadim Grigoruk @nesbox // grigoruk@gmail.com||De la mini computadora TIC-80. Copyright (c) 2017-2023 Vadim Grigoruk @nesbox // grigoruk@gmail.com"),
    font: "font_bold_stroke",
    fontMap: DEFAULT_FONT_MAP,
    fontWidth: 7,
    fontHeight: 8,
    autoUpperCase: false
  },
  tiny_default: {
    credit: COPYRIGHT,
    font: "font_tiny_default",
    fontMap: TINY_FONT_MAP,
    fontWidth: 4,
    fontHeight: 6,
    autoUpperCase: true 
  },
  tiny_shaded: {
    credit: COPYRIGHT,
    font: "font_tiny_shaded",
    fontMap: TINY_FONT_MAP,
    fontWidth: 4,
    fontHeight: 6,
    autoUpperCase: true
  },
  tiny_stroke: {
    credit: COPYRIGHT,
    font: "font_tiny_stroke",
    fontMap: TINY_FONT_MAP,
    fontWidth: 5,
    fontHeight: 6,
    autoUpperCase: true
  },
  tiny_number: {
    credit: COPYRIGHT,
    font: "font_tiny_number",
    fontMap: "1234567890 ",
    fontWidth: 4,
    fontHeight: 6,
    autoUpperCase: false
  },
  biscuitlocker_combo: {
    credit: __("From 'Pixel GB Block Numbers' by Biscuit Locker 2025 (games@biscuitlocker.com)||De 'Pixel GB Block Numbers' por Biscuit Locker 2025 (games@biscuitlocker.com)"),
    font: "font_combo",
    fontMap: "0123456789 ",
    fontWidth: 8,
    fontHeight: 8,
    autoUpperCase: false
  }
};

const WINDOW_PANELS = ["1", "2", "3", "4", "5"];

const NAVIGATION_HINT_PRESETS = {
  general: [
    {
      position: "right",
      icon: "d-pad",
      text: __("NAVIGATE||NAVEGAR")
    },
    {
      position: "right",
      icon: "a",
      text: __("OK||OK")
    },
    {
      position: "right",
      icon: "b",
      text: __("BACK||VOLVER")
    }
  ],
  general_no_a: [
    {
      position: "right",
      icon: "d-pad",
      text: __("NAVIGATE||NAVEGAR")
    },
    {
      position: "right",
      icon: "b",
      text: __("BACK||VOLVER")
    }
  ],
  general_no_b: [
    {
      position: "right",
      icon: "d-pad",
      text: __("NAVIGATE||NAVEGAR")
    },
    {
      position: "right",
      icon: "b",
      text: __("BACK||VOLVER")
    }
  ],
  song_select: [
    {
      position: "right",
      icon: "d-pad",
      text: __("NAVIGATE||NAVEGAR")
    },
    {
      position: "right",
      icon: "a",
      text: __("OK||OK")
    },
    {
      position: "right",
      icon: "b",
      text: __("BACK||VOLVER")
    },
    {
      position: "right",
      icon: "start",
      text: __("OPTION||OPCIÓN")
    },
    {
      position: "right",
      icon: "select",
      text: __("AUTO||AUTO")
    }
  ],
  jukebox: [
    {
      position: "left",
      icon: "d-pad",
      text: __("NAVIGATE||NAVEGAR")
    },
    {
      position: "center",
      icon: "a",
      text: __("∥/▶||∥/▶") 
    },
    {
      position: "right",
      icon: "b",
      text: __("FULL||COMPLETO")
    }
  ],
  color_input: [
    {
      position: "left",
      icon: "d-pad",
      text: __(" /|| /")
    },
    {
      position: "left",
      icon: "a",
      text: __(" /|| /")
    },
    {
      position: "left",
      icon: "b",
      text: __(" COLOR||COLOR")
    },
    {
      position: "right",
      icon: "start",
      text: __("OK||OK")
    }
  ],
  text_input: [
    {
      position: "left",
      icon: "d-pad",
      text: __(" /|| /")
    },
    {
      position: "left",
      icon: "a",
      text: __(" /|| /")
    },
    {
      position: "left",
      icon: "b",
      text: __(" TEXT||TEXTO")
    },
    {
      position: "right",
      icon: "start",
      text: __("OK||OK")
    }
  ],
  achievements: [
    {
      position: "left",
      icon: "d-pad",
      text: __("NAVIGATE||NAVEGAR")
    },
    {
      position: "right",
      icon: "select",
      text: __("DISPLAY||MOSTRAR")
    },
    {
      position: "right",
      icon: "b",
      text: __("BACK||VOLVER")
    }
  ],
  editor: [
    {
      position: "left",
      icon: "d-pad",
      text: __("NAVIGATE||NAVEGAR")
    },
    {
      position: "left",
      icon: "start",
      text: __("MENU||MENÚ")
    },
    {
      position: "left",
      icon: "select",
      text: __("∥/▶||∥/▶")
    },
    {
      position: "right",
      icon: "a",
      text: __("SELECT||SELECCIONAR")
    },
    {
      position: "right",
      icon: "b",
      text: __("NOTE||NOTA")
    }
  ],
  song_stats: [
    { position: "left", icon: "d-pad", text: __("NAVIGATE||NAVEGAR") },
    { position: "right", icon: "b", text: __("BACK||VOLVER") }
  ],
  song_stats_song_preview: [
    { position: "left", icon: "d-pad", text: __("NAVIGATE||NAVEGAR") },
    { position: "right", icon: "select", text: __("DIFFICULTY||DIFICULTAD") },
    { position: "right", icon: "b", text: __("BACK||VOLVER") }
  ],
  multiplayer_room_list: [
    { position: "left", icon: "d-pad", text: __("NAVIGATE||NAVEGAR") },
    { position: "left", icon: "select", text: __("REFRESH||REFRESCAR") },
    { position: "right", icon: "start", text: __("CREATE||CREAR") },
    { position: "right", icon: "a", text: __("JOIN||UNIRSE") },
    { position: "right", icon: "b", text: __("BACK||VOLVER") }
  ],
};

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
  marvelous: 55,
  perfect: 75,
  great: 99,
  good: 140,
  boo: 180
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

// Keyboard key names
const KEYBOARD_KEY_NAMES = {
  "Unidentified": "???",
  "Alt": "ALT",
  "AltGraph": "ALT GR",
  "CapsLock": "CAPS LOCK",
  "Control": "CTRL",
  "Fn": "FN",
  "FnLock": "FN LOCK",
  "Hyper": "HYPER",
  "OS": "OS/META",
  "Meta": "META",
  "NumLock": "NUM LOCK",
  "ScrollLock": "SCROLL LOCK",
  "Shift": "SHIFT",
  "Super": "SUPER",
  "Symbol": "SYMBOL",
  "SymbolLock": "SYMBOL LOCK",
  "Enter": "ENTER",
  "Tab": "TAB",
  " ": "SPACE",
  "ArrowUp": "UP",
  "ArrowDown": "DOWN", 
  "ArrowLeft": "LEFT",
  "ArrowRight": "RIGHT",
  "Home": "HOME",
  "End": "END",
  "PageUp": "PAGE UP",
  "PageDown": "PAGE DOWN",
  "Backspace": "BACKSPACE",
  "Clear": "CLEAR",
  "Copy": "COPY",
  "CrSel": "CR SELECT",
  "Cut": "CUT",
  "Delete": "DELETE",
  "EraseEof": "ERASE EOF",
  "ExSel": "EX SEL",
  "Insert": "INSERT",
  "Paste": "PASTE",
  "Redo": "REDO",
  "Undo": "UNDO",
  "Accept": "ACCEPT",
  "Again": "AGAIN",
  "Attn": "ATTN",
  "Cancel": "CANCEL",
  "ContextMenu": "MENU",
  "Apps": "MENU",
  "Escape": "ESC",
  "Esc": "ESC",
  "Execute": "EXEC",
  "Find": "FIND",
  "Finish": "FINISH",
  "Help": "HELP",
  "Pause": "PAUSE",
  "Play": "PLAY",
  "Props": "PROPS",
  "Select": "SELECT",
  "ZoomIn": "ZOOM +",
  "ZoomOut": "ZOOM -",
  "BrightnessDown": "BRIGHTNESS -",
  "BrightnessUp": "BRIGHTNESS +",
  "Eject": "EJECT",
  "LogOff": "LOG OFF",
  "Power": "POWER",
  "PowerOff": "SHUTDOWN",
  "PrintScreen": "PRINT SCREEN",
  "Hibernate": "HIBERNATE",
  "Standby": "Suspend",
  "WakeUp": "WAKE UP",
  "AllCandidates": "ALL CANDIDATES",
  "Alphanumeric": "ALPHANUMERIC",
  "CodeInput": "CODE INPUT",
  "Compose": "COMPOSE",
  "Multi": "MULTI",
  "Convert": "CONVERT",
  "Dead": "DEAD",
  "FinalMode": "FINAL",
  "GroupFirst": "GROUP FIRST",
  "GroupLast": "GROUP LAST",
  "GroupNext": "GROUP NEXT",
  "GroupPrevious": "GROUP PREVIOUS",
  "ModeChange": "MODE",
  "NextCandidate": "NEXT CANDIDATE",
  "NonConvert": "NON CONVERT",
  "Nonconvert": "NON CONVERT",
  "PreviousCandidate": "PREVIOUS CANDIDATE",
  "Process": "PROCESS",
  "SingleCandidate": "SINGLE CANDIDATE",
  "F1": "F1",
  "F2": "F2",
  "F3": "F3", 
  "F4": "F4",
  "F5": "F5",
  "F6": "F6",
  "F7": "F7",
  "F8": "F8",
  "F9": "F9",
  "F10": "F10",
  "F11": "F11",
  "F12": "F12",
  "F13": "F13",
  "F14": "F14",
  "F15": "F15",
  "F16": "F16",
  "F17": "F17",
  "F18": "F18",
  "F19": "F19",
  "F20": "F20",
  "F21": "F21",
  "F22": "F22",
  "F23": "F23",
  "F24": "F24",
  "Soft1": "SOFT 1",
  "Soft2": "SOFT 1",
  "Soft3": "SOFT 3",
  "Soft4": "SOFT 4",
  "AppSwitch": "APP SWITCH",
  "Call": "CALL",
  "Camera": "CAMERA",
  "CameraFocus": "CAMERA FOCUS",
  "EndCall": "END CALL",
  "GoBack": "BACK",
  "GoHome": "HOME",
  "HeadsetHook": "HEADSET HOOK",
  "LastNumberRedial": "REDIAL",
  "Notification": "NOTIFICATION",
  "MannerMode": "MODE",
  "VoiceDial": "VOICE DIAL",
  "ChannelDown": "CH DOWN",
  "ChannelUp": "CH UP",
  "MediaFastForward": "FAST FORWARD",
  "MediaPause": "PAUSE",
  "MediaPlayPause": "PAUSE/PLAY",
  "MediaRecord": "RECORD",
  "MediaRewind": "REWIND",
  "MediaStop": "STOP",
  "MediaTrackNext": "NEXT",
  "MediaNextTrack": "NEXT",
  "MediaTrackPrevious": "PREVIOUS",
  "MediaPreviousTrack": "PREVIOUS",
  "Numpad0": "NUM 0",
  "Numpad1": "NUM 1",
  "Numpad2": "NUM 2",
  "Numpad3": "NUM 3",
  "Numpad4": "NUM 4",
  "Numpad5": "NUM 5",
  "Numpad6": "NUM 6",
  "Numpad7": "NUM 7",
  "Numpad8": "NUM 8",
  "Numpad9": "NUM 9",
  "NumpadAdd": "NUM +",
  "NumpadSubtract": "NUM -",
  "NumpadMultiply": "NUM *",
  "NumpadDivide": "NUM /",
  "NumpadDecimal": "NUM .",
  "NumpadEnter": "NUM ENTER",
  "NumpadComma": "NUM ,",
  "NumpadEqual": "NUM =",
  "Decimal": "DECIMAL",
  "Key11": "11",
  "Key12": "12",
  "Multiply": "MULTIPLY",
  "*": "MULTIPLY",
  "Add": "ADD",
  "+": "ADD",
  "Clear": "CLEAR",
  "Divide": "DIVIDE",
  "/": "DIVIDE",
  "Subtract": "SUBTRACT",
  "-": "-",
  "Separator": "SEPARATOR",
  "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
  "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
  "A": "A", "B": "B", "C": "C", "D": "D", "E": "E", "F": "F", "G": "G",
  "H": "H", "I": "I", "J": "J", "K": "K", "L": "L", "M": "M", "N": "N",
  "O": "O", "P": "P", "Q": "Q", "R": "R", "S": "S", "T": "T", "U": "U",
  "V": "V", "W": "W", "X": "X", "Y": "Y", "Z": "Z"
};

// Keyboard key codes
const KEYBOARD_KEY_CODES = {
  A: 'A'.charCodeAt(0),
  B: 'B'.charCodeAt(0),
  C: 'C'.charCodeAt(0),
  D: 'D'.charCodeAt(0),
  E: 'E'.charCodeAt(0),
  F: 'F'.charCodeAt(0),
  G: 'G'.charCodeAt(0),
  H: 'H'.charCodeAt(0),
  I: 'I'.charCodeAt(0),
  J: 'J'.charCodeAt(0),
  K: 'K'.charCodeAt(0),
  L: 'L'.charCodeAt(0),
  M: 'M'.charCodeAt(0),
  N: 'N'.charCodeAt(0),
  O: 'O'.charCodeAt(0),
  P: 'P'.charCodeAt(0),
  Q: 'Q'.charCodeAt(0),
  R: 'R'.charCodeAt(0),
  S: 'S'.charCodeAt(0),
  T: 'T'.charCodeAt(0),
  U: 'U'.charCodeAt(0),
  V: 'V'.charCodeAt(0),
  W: 'W'.charCodeAt(0),
  X: 'X'.charCodeAt(0),
  Y: 'Y'.charCodeAt(0),
  Z: 'Z'.charCodeAt(0),
  '0': '0'.charCodeAt(0),
  '1': '1'.charCodeAt(0),
  '2': '2'.charCodeAt(0),
  '3': '3'.charCodeAt(0),
  '4': '4'.charCodeAt(0),
  '5': '5'.charCodeAt(0),
  '6': '6'.charCodeAt(0),
  '7': '7'.charCodeAt(0),
  '8': '8'.charCodeAt(0),
  '9': '9'.charCodeAt(0),
  'NUM 0': 96,
  'NUM 1': 97,
  'NUM 2': 98,
  'NUM 3': 99,
  'NUM 4': 100,
  'NUM 5': 101,
  'NUM 6': 102,
  'NUM 7': 103,
  'NUM 8': 104,
  'NUM 9': 105,
  'NUM *': 106,
  'NUM +': 107,
  'NUM ENTER': 108,
  'NUM -': 109,
  'NUM .': 110,
  'NUM /': 111,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  F13: 124,
  F14: 125,
  F15: 126,
  BACK: 8,
  TAB: 9,
  CLEAR: 12,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  CAPS: 20,
  ESC: 27,
  SPACE: 32,
  PGUP: 33,
  PGDN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  INS: 45,
  DEL: 46,
  HELP: 47,
  NUM: 144,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '~': 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  "'": 222,
  PLAY: 179,
  PAUSE: 179,
  NEXT: 176,
  PREV: 177,
  STOP: 178,
  VOL_UP: 175,
  VOL_DOWN: 174,
  VOL_MUTE: 173
};

// Gamepad key names
const GAMEPAD_KEY_NAMES = {
  0: "BUTTON A",
  1: "BUTTON B",
  2: "BUTTON X",
  3: "BUTTON Y",
  4: "LEFT BUMPER",
  5: "RIGHT BUMPER",
  6: "LEFT TRIGGER",
  7: "RIGHT TRIGGER",
  8: "SELECT/BACK",
  9: "START",
  12: "DPAD UP",
  13: "DPAD DOWN",
  14: "DPAD LEFT",
  15: "DPAD RIGHT"
};

// Keyboard button mapping
const DEFAULT_KEYBOARD_MAPPING = {
  player1: {
    up: [Phaser.KeyCode.W,],
    down: [Phaser.KeyCode.S],
    left: [Phaser.KeyCode.A],
    right: [Phaser.KeyCode.D],
    a: [Phaser.KeyCode.K],
    b: [Phaser.KeyCode.J],
    select: [Phaser.KeyCode.SHIFT],
    start: [Phaser.KeyCode.ENTER]
  },
  player2: {
    up: [Phaser.KeyCode.UP],
    down: [Phaser.KeyCode.DOWN],
    left: [Phaser.KeyCode.LEFT],
    right: [Phaser.KeyCode.RIGHT],
    a: [Phaser.KeyCode.NUMPAD_2],
    b: [Phaser.KeyCode.NUMPAD_1],
    select: [Phaser.KeyCode.NUMPAD_ADD],
    start: [Phaser.KeyCode.NUMPAD_SUBTRACT]
  }
};

const DEFAULT_GAMEPAD_MAPPING = {
  player1: {
    up: 12,
    down: 13,
    left: 14,
    right: 15,
    a: 1,
    b: 0,
    select: 8,
    start: 9
  },
  player2: {
    up: 12,
    down: 13,
    left: 14,
    right: 15,
    a: 1,
    b: 0,
    select: 8,
    start: 9
  }
};

const VIDEO_EXTENSIONS =  ["mp4", "avi", "av1", "mkv", "3gp", "mov", "webm", "mpg", "mpeg"];