// Cache for localized strings
const __cache = new Map();
let __currentLanguage = -1;

// Pre-compile regex for performance
const __splitRegex = /\|\|/;
const __parenRegex = /\(([^()]+)\)/g;

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

function __processParens(text, lang) {
  // Fast path: if no parentheses, return as-is
  if (text.indexOf('(') === -1) return text;
  
  return text.replace(__parenRegex, (match, inner) => {
    const parts = inner.split('|');
    if (parts.length < 2) return match;
    return parts[lang] || parts[0];
  });
}

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

const __ = window.__;