// Environment detection constants
/** @type {Object} Environment type definitions (UNKNOWN, NWJS, CORDOVA, WEB) */
const ENVIRONMENT = {
  UNKNOWN: 'WEB',
  NWJS: 'NWJS',
  CORDOVA: 'CORDOVA',
  WEB: 'WEB'
};

// Build-time environment setting
/** @type {string} Current runtime environment */
const CURRENT_ENVIRONMENT = %;

/** @type {string} External directory path for Cordova */
const CORDOVA_EXTERNAL_DIRECTORY = "PadManiacs/";
/** @type {string} External directory path for NW.js */
const NWJS_EXTERNAL_DIRECTORY = "data/";

/** @type {string} Current external directory path */
const EXTERNAL_DIRECTORY = CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA ? CORDOVA_EXTERNAL_DIRECTORY : NWJS_EXTERNAL_DIRECTORY;

/** @type {string} Addons directory name */
const ADDONS_DIRECTORY = "Addons";
/** @type {string} Screenshots directory name */
const SCREENSHOTS_DIRECTORY = "Screenshots";
/** @type {string} Songs directory name */
const SONGS_DIRECTORY = "Songs";
/** @type {string} Editor output directory name */
const EDITOR_OUTPUT_DIRECTORY = "Edits";
/** @type {string} Backups directory name */
const BACKUPS_DIRECTORY = "Backups";

/** @type {boolean} Enable parallel asset loading */
const ENABLE_PARALLEL_LOADING = true;
/** @type {number} Maximum parallel downloads */
const MAX_PARALLEL_DOWNLOADS = 16;

/** @type {number} Maximum parallel addon loads */
const MAX_PARALLEL_ADDON_LOADS = 3;

/** @type {boolean} Enable UI sound effects */
const ENABLE_UI_SFX = true;
/** @type {boolean} Enable experience sound effects */
const ENABLE_EXP_SFX = true;

/** @type {number} Vibration duration in MS for regular hits */
const REGULAR_VIBRATION_INTENSITY = 75;
/** @type {number} Vibration duration in MS for weak hits */
const WEAK_VIBRATION_INTENSITY = 50;
/** @type {number} Vibration duration in MS for strong hits */
const STRONG_VIBRATION_INTENSITY = 50;