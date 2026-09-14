/**
 * Global localization helpers for the game.
 *
 * The public entry point is `window.__`, which translates a source string
 * into the currently selected language. Strings follow two syntaxes:
 *
 * - `"English||Español"` splits alternatives with `||` and picks the one
 *   matching the active language index (0 = English, 1 = Español).
 * - `"(Confirm|Confirmar)"` wraps per-phrase alternatives in parentheses,
 *   which are resolved based on the active language index.
 *
 * Both forms can be mixed in the same string, and results are cached in a
 * `Map` that is cleared automatically whenever the language changes.
 *
 * Calling `__` also sets a truthy `_localized` marker on the returned string
 * so UI code can avoid re-translating already-localized text.
 */
/** @type {Map} Cache of previously resolved translations keyed by string and language */
const __cache = new Map();
/** @type {number} Language index of the most recent translation (-1 before the first lookup) */
let __currentLanguage = -1;

// Pre-compile regex for performance
/** @type {RegExp} Splits the `English||Español` alternatives in a string */
const __splitRegex = /\|\|/;
/** @type {RegExp} Matches a `(This|Esto)` phrase with its alternatives */
const __parenRegex = /\(([^()]+)\)/g;

/**
 * Returns the currently selected language index, clearing the translation
 * cache whenever the language changed since the last call.
 * @returns {number} Language index in use (0 = English, 1 = Español)
 */
function __getLanguage() {
  let lang = 0;
  try {
    lang = Account?.settings?.language ?? 0;
  } catch (_) {
    lang = JSON.parse(localStorage.getItem("Account") || "{}").settings?.language || 0;
  }
  if (lang !== __currentLanguage) {
    __currentLanguage = lang;
    __cache.clear(); // clear cache on language change
  }
  return lang;
}

/**
 * Resolves `(This|Esto)` parenthesized alternatives inside a string, keeping
 * the text as-is when no parentheses are present.
 * @param {string} text - The string possibly containing parenthesized alternatives
 * @param {number} lang - Language index used to pick the alternative
 * @returns {string} Text with parenthesized alternatives resolved
 */
function __processParens(text, lang) {
  // Fast path: if no parentheses, return as-is
  if (text.indexOf('(') === -1) return text;
  
  return text.replace(__parenRegex, (match, inner) => {
    const parts = inner.split('|');
    if (parts.length < 2) return match;
    return parts[lang] || parts[0];
  });
}

/**
 * Localizes a source string into the active language.
 *
 * Supports `English||Español` and `(This|Esto)` syntaxes, caches the
 * resolved result, and marks the string as localized via a truthy
 * `_localized` property so it is not translated a second time.
 * @param {string} text - Source string to translate
 * @returns {string} The localized string
 */
window.__ = function(text) {
  if (typeof text !== 'string') return text;
  
  const lang = __getLanguage();
  const cacheKey = text + '\x00' + lang;
  
  // Check cache
  const cached = __cache.get(cacheKey);
  if (cached !== undefined) return cached;
  
  // Fast path: if no special characters, return as-is and cache
  if (text.indexOf('||') === -1 && text.indexOf('(') === -1) {
    text._localized = true;
    __cache.set(cacheKey, text);
    return text;
  }
  
  // Process
  const mainParts = text.split(__splitRegex);
  let result;
  if (mainParts.length === 1) {
    result = __processParens(text, lang);
  } else {
    const selected = mainParts[lang] || mainParts[0];
    result = __processParens(selected, lang);
  }
  
  result._localized = true;
  
  __cache.set(cacheKey, result);
  return result;
};

/** @type {Function} Module-local alias for the global localization function */
const __ = window.__;