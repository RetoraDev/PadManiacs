#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { BuildSystem } = require('./build.js');

const DOCS_TITLE = 'PadManiaX Modding API Documentation';
const GAME_NAME = 'PadManiaX';
const GAME_VERSION = new BuildSystem().getPackageInfo().version;
const FOOTER_TEXT = '&copy; Retora 2026';

const CATEGORY_ORDER = [
  'Game States',
  'Core Game Classes',
  'UI Classes',
  'Character System Classes',
  'Achievements and Stats Classes',
  'File System Classes',
  'Parser Classes',
  'Addon System Classes',
  'Playlist System Classes',
  'Utility Classes'
];

const INDEX_STATIC = `[heading: "Introduction"]
<p>PadManiaX is a lightweight rhythm game that brings the StepMania experience to web and mobile devices with a retro pixel art aesthetic. The game features core rhythm gameplay mechanics of StepMania, a popular open source rhythm game.</p>

<p><a href="https://github.com/RetoraDev/PadManiacs">Explore Source code</a></p>
<p><a href="https://retora.itch.io/padmaniacs">Play on itch.io</a></p>

<p>PadManiaX supports community-created modifications through an add-on system. Add-ons can:</p>
[list]
* Replace game assets (arrows, backgrounds, UI elements)
* Add new behaviors and gameplay mechanics
* Extend the game with new features
[/list]

[heading: "How addons work"]
<p>An addon is a folder that contains data that the game loads at startup, overwriting the assets and default game behavior.</p>

<p>In order for an addon to be considered valid, it must include the [code: "manifest.json"] file, a file that defines metadata, which parts of the game must be modified or extended, as well as the data and the code that must be loaded.</p>

<p>Add-ons are stored at a subfolder [code: "Addons/"] under local storage folder. All Addons you develop must be inside this folder so you can test them in the game.</p>

<p>You can download working sample add-ons to load in the game from <a href="https://retora.itch.io/padmaniacs/download/eyJleHBpcmVzIjoxNzc2MzA4MjQ4LCJpZCI6Mzk4OTgwNX0=.QIot74UL0TfHP+txH4R4uBGggY4=">itch.io</a>.</p>

[heading: "Tutorials"]
<p>Learn how to create and modify PadManiaX with these step-by-step tutorials.</p>

[list]
* <a href="tutorials/getting_started.html">Getting Started with Modding</a> - Learn the basics of creating your first addon
* <a href="tutorials/manifest_format.html">Understanding the Manifest Format</a> - Complete guide to manifest.json structure
* <a href="tutorials/asset_replacement.html">Asset Replacement Tutorial</a> - How to replace game graphics and sounds
* <a href="tutorials/behavior_scripts.html">Creating Behavior Scripts</a> - Adding custom gameplay logic
* <a href="tutorials/ui_modification.html">UI Modification Guide</a> - Customizing menus and interfaces
* <a href="tutorials/character_system.html">Character System Guide</a> - Understanding characters, skills, and leveling
* <a href="tutorials/achievements.html">Achievements System Guide</a> - Working with achievements and stats
[/list]

[heading: "Global Scope"]
<p>The game exposes a large set of global constants, variables, and functions that are available throughout the game and can be used in addons. These include version and environment information, font configurations, song folders, judgment windows, score values, character and achievement data, input systems, and more. For the complete reference, see the <a href="globals.html">Global Constants, Variables and Functions</a> page.</p>

[heading: "API"]
<p>PadManiaX was built using <a href="https://github.com/photonstorm/phaser-ce">Phaser CE</a>, with Cordova for mobile file access and NW.js for desktop builds. See the documentation: <a href="https://cordova.apache.org/docs/en/latest/">Cordova Docs</a>, <a href="https://nwjs.io/docs/">NW.js Docs</a>, and <a href="https://phaserjs.github.io/phaser-ce/">Phaser CE Docs</a>.</p>

<p>The game code is divided into different classes. All classes are accessible in the scope of addon file. Each of them plays a role, some more important than others. For example game screens visual or abstract elements, data managers, etc.</p>
`;

const DOKI_LOADER_JS = `document.body.style.visibility = "hidden";

window.onload = function () {
  // List of possible places to find DokiDocs
  const dokiDocsLocations = ["./", "../", "../", "./lib/", "./js/", "https://cdn.jsdelivr.net/npm/doki-docs@latest/"];

  let currentIndex = 0;

  function tryScript(scriptPath, onSuccess, onError) {
    const minifiedScript = document.createElement("script");
    minifiedScript.src = scriptPath + "doki-docs.min.js";

    window.dokiDocsLocation = scriptPath;
    
    minifiedScript.onload = () => {
      onSuccess && onSuccess(true);
    };
    
    minifiedScript.onerror = () => {
      // If minified fails, try non-minified
      const regularScript = document.createElement("script");
      regularScript.src = scriptPath + "doki-docs.js";

      regularScript.onload = () => {
        onSuccess && onSuccess(false);
      };
      
      regularScript.onerror = () => {
        window.dokiDocsLocation = null;
        
        onError && onError();
      };

      document.head.appendChild(regularScript);
    };

    document.head.appendChild(minifiedScript);
  }

  function tryNext() {
    const target = dokiDocsLocations[currentIndex];
    
    currentIndex ++;
    
    tryScript(target, minified => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = target + (minified ? "doki-docs.min.css" : "doki-docs.css");
      document.head.appendChild(link);
      
      link.onload = () => document.body.style.visibility = "";
    }, () => tryNext());
  }

  tryNext();
};
`;

function isIdentChar(c) {
  return c ? /[A-Za-z0-9_$]/.test(c) : false;
}

function escHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function log(text, type = 'info') {
  const red = '\x1b[31m';
  const yellow = '\x1b[33m';
  const green = '\x1b[32m';
  const cyan = '\x1b[36m';
  const dim = '\x1b[2m';
  const reset = '\x1b[0m';
  const colors = { info: cyan, success: green, warning: yellow, error: red };
  const icons = { info: '→ ', success: '✓ ', warning: '⚠ ', error: '✗ ' };
  const color = colors[type] || '';
  const icon = icons[type] || '';
  if (type === 'success') {
    console.log(color + icon + text + reset);
  } else if (type === 'error') {
    console.error(color + icon + text + reset);
  } else {
    console.log((type === 'info' ? dim : '') + icon + text + reset);
  }
}

function parseJsdoc(rawText) {
  const text = String(rawText || '').replace(/^\s*\/\*+|\*+\/\s*$/g, '');
  const result = {
    description: [],
    tags: {
      type: {},
      params: [],
      returns: null,
      examples: [],
      features: [],
      notes: [],
      warnings: [],
      class: '',
      category: '',
      summary: '',
      constructor: false
    }
  };

  let mode = 'normal';
  let exampleBuffer = [];
  let featureBuffer = [];

  const flushExample = () => {
    if (exampleBuffer.length) {
      let code = exampleBuffer.join('\n').replace(/\s+$/g, '');
      code = code.replace(/^\n+/, '').replace(/\n+$/, '');
      if (code.trim()) result.tags.examples.push(code);
      exampleBuffer = [];
    }
  };

  const flushFeatures = () => {
    if (featureBuffer.length) {
      featureBuffer.forEach(line => {
        const item = line.replace(/^\s*[-*]\s+/, '').trim();
        if (item) result.tags.features.push(item);
      });
      featureBuffer = [];
    }
  };

  const lines = text.split('\n');
  lines.forEach(line => {
    const trimmed = line.replace(/^\s*\*+\s?/, '');

    if (/^@/.test(trimmed)) {
      switch (mode) {
        case 'example': flushExample(); break;
        case 'features': flushFeatures(); break;
      }
      mode = 'normal';

      const tagMatch = /^@([\w-]+)\s*(.*)$/.exec(trimmed);
      if (!tagMatch) return;
      const tag = tagMatch[1];
      const value = tagMatch[2].trim();

      switch (tag) {
        case 'class':
          result.tags.class = value || result.tags.class;
          break;
        case 'category':
          result.tags.category = value || result.tags.category;
          break;
        case 'summary':
          result.tags.summary = value || result.tags.summary;
          break;
        case 'description':
        case 'desc':
          if (value) result.description.push(value);
          break;
        case 'constructor':
          result.tags.constructor = true;
          break;
        case 'type':
          {
            const m = /^\{\s*([^{}]*)\}\s*(.*)$/.exec(value);
            if (m) {
              result.tags.type = { type: m[1].trim() || 'Object', description: m[2].trim() };
            } else {
              result.tags.type = { type: value || 'Object', description: '' };
            }
          }
          break;
        case 'param':
          result.tags.params.push(parseParam(value));
          break;
        case 'returns':
        case 'return':
          {
            const m = /^\{\s*([^{}]*)\}\s*(.*)$/.exec(value);
            if (m) {
              result.tags.returns = { type: m[1].trim() || 'Object', description: m[2].trim() };
            } else {
              result.tags.returns = { type: 'Object', description: value };
            }
          }
          break;
        case 'example':
          mode = 'example';
          break;
        case 'features':
          mode = 'features';
          break;
        case 'note':
          if (value) result.tags.notes.push(value);
          break;
        case 'warning':
          if (value) result.tags.warnings.push(value);
          break;
      }
      return;
    }

    if (mode === 'example') {
      exampleBuffer.push(trimmed);
    } else if (mode === 'features') {
      featureBuffer.push(trimmed);
    } else {
      if (trimmed) result.description.push(trimmed);
    }
  });

  if (mode === 'example') flushExample();
  if (mode === 'features') flushFeatures();

  return result;
}

function parseParam(value) {
  let type = '';
  let name = '';
  let description = '';

  const braced = /^\{\s*([^{}]*)\}\s*(.*)$/.exec(value);
  if (braced) {
    type = braced[1].trim();
    const rest = braced[2].trim();
    const named = /^\[([\w$]+)(?:=([^\]]*))?\]\s*(?:-\s*)?(.*)$/.exec(rest);
    if (named) {
      name = named[1] + (named[2] !== undefined ? '=' + named[2].trim() : '');
      description = named[3].trim();
    } else {
      const plain = /^([\w$]+)\s*(?:-\s*)?(.*)$/.exec(rest);
      if (plain) {
        name = plain[1];
        description = plain[2].trim();
      } else {
        description = rest;
      }
    }
  } else {
    const named = /^\[([\w$]+)(?:=([^\]]*))?\]\s*(?:-\s*)?(.*)$/.exec(value);
    if (named) {
      name = named[1] + (named[2] !== undefined ? '=' + named[2].trim() : '');
      description = named[3].trim();
      type = 'Object';
    } else {
      const plain = /^([\w$]+)\s*(?:-\s*)?(.*)$/.exec(value);
      if (plain) {
        name = plain[1];
        description = plain[2].trim();
        type = 'Object';
      } else {
        description = value;
        type = 'Object';
      }
    }
  }

  if (!type) type = 'Object';
  return { type, name, description };
}

function scanSource(code) {
  const comments = [];
  const classDecls = [];
  const n = code.length;
  let braceDepth = 0;
  const open = [];
  let i = 0;

  const skipString = (quote) => {
    i += 1;
    while (i < n) {
      const c = code[i];
      if (c === '\\') { i += 2; continue; }
      if (c === quote) { i += 1; break; }
      i += 1;
    }
  };

  while (i < n) {
    const c = code[i];
    const next = code[i + 1];

    if (c === '"' || c === "'" || c === '`') {
      skipString(c);
      continue;
    }

    if (c === '/' && next === '/') {
      const start = i;
      while (i < n && code[i] !== '\n') i += 1;
      comments.push({ type: 'line', text: code.slice(start + 2, i).trim(), start, end: i });
      continue;
    }

    if (c === '/' && next === '*') {
      const start = i;
      i += 2;
      while (i < n && !(code[i] === '*' && code[i + 1] === '/')) i += 1;
      const end = i < n ? i + 2 : i;
      const raw = code.slice(start + 2, end - 2);
      comments.push({ type: 'block', text: raw.trim(), start, end, isJsdoc: raw.trim().startsWith('*') });
      i = end;
      continue;
    }

    if (c === '{') {
      braceDepth += 1;
      i += 1;
      continue;
    }

    if (c === '}') {
      braceDepth -= 1;
      while (open.length && open[open.length - 1].startDepth === braceDepth) {
        const done = open.pop();
        done.bodyEnd = i;
      }
      i += 1;
      continue;
    }

    if (c === 'c' && code.slice(i, i + 5) === 'class' && !isIdentChar(code[i - 1]) && !isIdentChar(code[i + 5])) {
      let j = i + 5;
      while (j < n && /\s/.test(code[j])) j += 1;
      let name = '';
      while (j < n && /[A-Za-z0-9_$]/.test(code[j])) { name += code[j]; j += 1; }
      if (name) {
        while (j < n && code[j] !== '{') j += 1;
        if (code[j] === '{') {
          const entry = { name, declStart: i, bodyStart: j, bodyEnd: null, startDepth: braceDepth, docComment: null };
          braceDepth += 1;
          classDecls.push(entry);
          open.push(entry);
          i = j + 1;
          continue;
        }
      }
      i += 5;
      continue;
    }

    i += 1;
  }

  for (const cls of classDecls) {
    cls.docComment = findDocComment(code, comments, cls.declStart);
  }

  return { comments, classDecls };
}

function isBlankishExceptComments(code, from, to) {
  let i = from;
  while (i < to) {
    const c = code[i];
    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') { i += 1; continue; }
    if (c === '/' && code[i + 1] === '/') {
      while (i < to && code[i] !== '\n') i += 1;
      continue;
    }
    return false;
  }
  return true;
}

function findDocComment(code, comments, declStart) {
  let best = null;
  for (const comment of comments) {
    if (comment.type !== 'block' || !comment.isJsdoc) continue;
    if (!comment.text.trim()) continue;
    if (comment.end > declStart) continue;
    if (!isBlankishExceptComments(code, comment.end, declStart)) continue;
    if (!best || comment.end > best.end) best = comment;
  }
  return best;
}

function getStatementSlice(code, index) {
  const n = code.length;
  let i = index;
  while (i < n) {
    const c = code[i];
    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') { i += 1; continue; }
    if (c === '/' && code[i + 1] === '/') {
      while (i < n && code[i] !== '\n') i += 1;
      continue;
    }
    break;
  }
  let slice = '';
  let j = i;
  while (j < n) {
    const c = code[j];
    if (c === ';' || c === '(' || c === '=' || c === '{' || c === '}') break;
    slice += c;
    j += 1;
  }
  return { slice: slice.trim(), delimiter: code[j] || '', next: j };
}

const RESERVED_WORDS = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'do', 'else',
  'finally', 'with', 'case', 'default', 'typeof', 'new', 'instanceof', 'in', 'of',
  'class', 'delete', 'void', 'throw', 'try', 'yield', 'await', 'var', 'let', 'const',
  'this', 'super', 'extends', 'static', 'get', 'set', 'import', 'export'
]);

function isMethodDeclaration(code, openIndex) {
  let i = openIndex;
  const n = code.length;
  let depth = 0;
  while (i < n) {
    const c = code[i];
    if (c === '(') depth += 1;
    else if (c === ')') {
      depth -= 1;
      if (depth === 0) {
        i += 1;
        while (i < n && /\s/.test(code[i])) i += 1;
        return code[i] === '{';
      }
    } else if (c === ';' || c === '}') {
      if (depth === 0) return false;
    }
    i += 1;
  }
  return false;
}

function classifySlice(slice, delimiter, inClass) {
  const classMatch = /^class\s+([\w$]+)\s*$/.exec(slice);
  const fnMatch = /^function\s+([\w$]+)\s*$/.exec(slice);
  const declMatch = /^(const|let|var)\s+([\w$]+)/.exec(slice);
  const thisMatch = /^this\.([\w$]+)/.exec(slice);
  const winMatch = /^window\.([\w$]+)/.exec(slice);
  const modMatch = /^(?:(?:static|async)\s+)?(?:get\s+|set\s+)?([\w$]+)$/.exec(slice);

  if (classMatch) return { type: 'class', name: classMatch[1] };
  if (fnMatch && delimiter === '(') return { type: 'function', name: fnMatch[1] };

  if (declMatch) {
    return { type: declMatch[1] === 'const' ? 'constant' : 'variable', name: declMatch[2] };
  }

  if (thisMatch && (delimiter === '=' || delimiter === ':' || delimiter === ';')) {
    return { type: 'property', name: thisMatch[1] };
  }

  if (winMatch && delimiter === '=') {
    return { type: 'globalvar', name: winMatch[1] };
  }

  if (delimiter === '(') {
    if (inClass && modMatch && !RESERVED_WORDS.has(modMatch[1])) {
      return { type: 'method', name: modMatch[1] };
    }
    return { type: 'unknown', name: '' };
  }

  if (delimiter === '=') {
    if (modMatch) return { type: 'globalvar', name: modMatch[1] };
    return { type: 'unknown', name: '' };
  }

  if (delimiter === ';') {
    if (modMatch) return { type: 'declare', name: modMatch[1] };
  }

  return { type: 'unknown', name: '' };
}

function findOwningClass(classDecls, position) {
  let owner = null;
  for (const cls of classDecls) {
    if (cls.bodyStart < position && (cls.bodyEnd === null || position <= cls.bodyEnd)) {
      if (!owner || cls.bodyStart > owner.bodyStart) owner = cls;
    }
  }
  return owner;
}

function readInitializerValue(code, afterEquals) {
  const n = code.length;
  let i = afterEquals + 1;
  while (i < n && /\s/.test(code[i])) i += 1;
  let depthParen = 0;
  let depthBracket = 0;
  let depthBrace = 0;
  let out = '';
  let quote = '';
  while (i < n) {
    const c = code[i];
    if (quote) {
      out += c;
      if (c === '\\') { out += code[i + 1] || ''; i += 2; continue; }
      if (c === quote) quote = '';
      i += 1;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; out += c; i += 1; continue; }
    if (c === ';' && depthParen === 0 && depthBracket === 0 && depthBrace === 0) break;
    if (c === '{') depthBrace += 1;
    if (c === '}') depthBrace -= 1;
    if (c === '[') depthBracket += 1;
    if (c === ']') depthBracket -= 1;
    if (c === '(') depthParen += 1;
    if (c === ')') depthParen -= 1;
    if (c === '\n') out += ' ';
    else out += c;
    i += 1;
  }
  out = out.trim();
  if (out.startsWith('{') && depthBrace < 0) out = out + '}';
  if (out.length > 40) {
    if (out.startsWith('{')) out = '{...}';
    else if (out.startsWith('[')) out = '[...]';
    else out = out.slice(0, 37) + '...';
  }
  return out;
}

function collectFeatureEntries(logResult) { return logResult; }

function parseAllSources(buildSystem) {
  const classes = [];
  const globals = { constants: [], variables: [], functions: [] };
  const globalMap = { constants: {}, variables: {}, functions: {} };

  const addGlobal = (bucket, entry) => {
    const map = globalMap[bucket];
    const existing = map[entry.name];
    if (!existing) {
      map[entry.name] = entry;
      return;
    }
    if (!existing.description && entry.description) {
      existing.description = entry.description;
    }
    if (!existing.params.length && entry.params.length) {
      existing.params = entry.params;
    }
    if (!existing.type || existing.type === 'Object') {
      existing.type = entry.type || existing.type;
    }
  };

  buildSystem.fileOrder.forEach((filePath, fileIndex) => {
    if (!filePath.startsWith('js/')) return;
    const fullPath = path.join(buildSystem.config.srcDir, filePath);
    let code = '';
    try {
      code = fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
      log(`Could not read ${filePath}`, 'warning');
      return;
    }

    const { comments, classDecls } = scanSource(code);
    const docComments = new Set();

    classDecls.forEach(decl => {
      if (decl.docComment) {
        const parsed = parseJsdoc(decl.docComment.text);
        const name = parsed.tags.class || decl.name;
        const record = {
          name,
          declarationName: decl.name,
          sourceFile: filePath,
          sourceOrder: fileIndex,
          category: parsed.tags.category || 'Uncategorized',
          summary: parsed.tags.summary || '',
          description: parsed.description.length ? parsed.description.join(' ') : (parsed.tags.summary || ''),
          constructorParams: parsed.tags.params,
          hasConstructorTag: parsed.tags.constructor,
          properties: [],
          methods: [],
          example: parsed.tags.examples.length ? parsed.tags.examples[0] : null,
          features: parsed.tags.features,
          notes: parsed.tags.notes,
          warnings: parsed.tags.warnings
        };
        decl.record = record;
        classes.push(record);
        docComments.add(decl.docComment);
      }
    });

    comments.forEach(comment => {
      if (docComments.has(comment)) return;
      if (comment.type !== 'block' || !comment.isJsdoc) return;
      if (!comment.text.trim()) return;

      const sliceInfo = getStatementSlice(code, comment.end);
      if (!sliceInfo.slice) return;

      const owner = findOwningClass(classDecls, comment.start);
      const classification = classifySlice(sliceInfo.slice, sliceInfo.delimiter, owner !== null);

      switch (classification.type) {
        case 'property':
          if (owner && owner.record) {
            const doc = parseJsdoc(comment.text);
            owner.record.properties.push({
              name: classification.name,
              type: doc.tags.type.type || 'Object',
              description: doc.tags.type.description || doc.description.join(' ') || ''
            });
          }
          break;
        case 'method':
          if (owner && owner.record) {
            if (!isMethodDeclaration(code, sliceInfo.next)) return;
            const doc = parseJsdoc(comment.text);
            const name = classification.name;
            if (name === 'constructor') {
              owner.record.constructorParams = doc.tags.params.length ? doc.tags.params : owner.record.constructorParams;
              owner.record.hasConstructorDoc = true;
              return;
            }
            owner.record.methods.push({
              name,
              params: doc.tags.params,
              returns: doc.tags.returns,
              description: doc.description.length ? doc.description.join(' ') : ''
            });
          }
          break;
        case 'constant':
        case 'variable':
        case 'globalvar':
        case 'declare': {
          const doc = parseJsdoc(comment.text);
          let bucket = 'variables';
          let isFunction = false;
          if (classification.type === 'constant') {
            bucket = 'constants';
          }
          if (code[sliceInfo.next] === '=') {
            const probe = readInitializerValue(code, sliceInfo.next);
            if (/^\([\s\S]*=>/.test(probe) || /^[\w$]+\s*=>/.test(probe) || /^function\b/.test(probe)) {
              isFunction = true;
              bucket = 'functions';
            }
          }
          if (classification.type === 'declare') {
            if (doc.description.length || doc.tags.type.type) {
              bucket = 'variables';
            } else {
              return;
            }
          }
          const params = doc.tags.params;
          if (isFunction && !params.length && code[sliceInfo.next] === '=') {
            const probe = code.slice(sliceInfo.next + 1, sliceInfo.next + 220);
            const arrow = /^(?:async\s+)?(?:\(([^)]*)\)|([\w$]+))\s*=>/.exec(probe);
            if (arrow) {
              const raw = arrow[1] !== undefined ? arrow[1] : arrow[2];
              (raw ? raw.split(',') : []).forEach(p => {
                const pn = p.trim().replace(/^[^$\w]+|[^$\w]+$/g, '');
                if (pn) params.push({ name: pn, type: '', description: '' });
              });
            }
          }
          addGlobal(bucket, {
            name: classification.name,
            type: doc.tags.type.type || (bucket === 'functions' ? 'Function' : 'Object'),
            description: doc.tags.type.description || doc.description.join(' '),
            value: (classification.type === 'constant' || classification.type === 'globalvar') && code[sliceInfo.next] === '=' ? readInitializerValue(code, sliceInfo.next) : '',
            params: bucket === 'functions' ? params : [],
            returns: doc.tags.returns
          });
          break;
        }
        case 'function': {
          const doc = parseJsdoc(comment.text);
          addGlobal('functions', {
            name: classification.name,
            type: 'Function',
            description: doc.description.join(' '),
            params: doc.tags.params,
            returns: doc.tags.returns
          });
          break;
        }
      }
    });
  });

  globals.constants = Object.values(globalMap.constants).sort((a, b) => a.name.localeCompare(b.name));
  globals.variables = Object.values(globalMap.variables).sort((a, b) => a.name.localeCompare(b.name));
  globals.functions = Object.values(globalMap.functions).sort((a, b) => a.name.localeCompare(b.name));

  return { classes, globals };
}

function htmlHead(title, prefix) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <title>${title === DOCS_TITLE ? DOCS_TITLE : title + ' - ' + DOCS_TITLE}</title>
</head>
<body class="doki-hidden">
    <script src="${prefix}doki-loader.js"></script>
`;
}

function htmlFoot() {
  return `
    [footer: "${FOOTER_TEXT}"]
</body>
</html>
`;
}

function dokiTable(rows) {
  if (!rows || !rows.length) return '';
  let out = '[table header]\n';
  rows.forEach(row => {
    out += `[ ${row.join(' | ')} ]\n`;
  });
  out += '[/table]\n';
  return out;
}

/**
 * Joins DokiDocs sections into a body string with consistent indentation.
 * Every non-code line is indented 4 spaces to match the hand-written tutorial
 * pages, while the inner content of [codeblock] blocks stays verbatim at
 * column 0 so code samples are not mangled.
 * @param {Array<string>} sections - Raw section strings
 * @returns {string} The assembled, indented body
 */
function assembleSections(sections) {
  const parts = [];
  for (const section of sections) {
    const lines = section.split('\n');
    let inCode = false;
    const out = [];
    for (const raw of lines) {
      const line = raw.replace(/\s+$/, '');
      const trimmed = line.trim();
      if (!inCode && /^\[codeblock(?:[ \t]|\])/.test(trimmed)) {
        inCode = true;
        out.push('    ' + trimmed);
        continue;
      }
      if (inCode && /^\[\/codeblock\]/.test(trimmed)) {
        inCode = false;
        out.push('    ' + trimmed);
        continue;
      }
      if (inCode) {
        out.push(line);
      } else {
        out.push(trimmed ? '    ' + trimmed : '');
      }
    }
    parts.push(out.join('\n'));
  }
  return parts.join('\n');
}

function formatParams(params) {
  const names = params.map(p => p.name).filter(Boolean);
  return names.length ? `(${names.join(', ')})` : '()';
}

function generateClassPage(record, categoriesRef) {
  const sections = [];
  sections.push(`[title: "${record.name} Class"]\n`);
  sections.push(`<a href="../">← Back to index</a>\n`);
  if (record.summary) sections.push(`<p>${escHtml(record.summary)}</p>\n`);

  if (record.description) {
    sections.push(`[heading: "Description"]`);
    sections.push(`<p>${escHtml(record.description)}</p>\n`);
  }

  if (record.features.length) {
    sections.push(`[heading: "Key Features"]`);
    let list = '[list]\n';
    record.features.forEach(f => { list += `* ${escHtml(f)}\n`; });
    list += '[/list]\n';
    sections.push(list);
  }

  if (record.constructorParams.length) {
    sections.push(`[heading: "Constructor"]`);
    const rows = [['Parameter', 'Type', 'Description']];
    record.constructorParams.forEach(p => {
      rows.push([escHtml(p.name), escHtml(p.type), escHtml(p.description)]);
    });
    sections.push(dokiTable(rows));
    sections.push('');
  }

  if (record.properties.length) {
    sections.push(`[heading: "Properties"]`);
    const rows = [['Property', 'Type', 'Description']];
    record.properties.forEach(p => {
      rows.push([escHtml(p.name), escHtml(p.type), escHtml(p.description)]);
    });
    sections.push(dokiTable(rows));
    sections.push('');
  }

  if (record.methods.length) {
    sections.push(`[heading: "Methods"]`);
    const rows = [['Method', 'Parameters', 'Description']];
    record.methods.forEach(m => {
      rows.push([escHtml(m.name), formatParams(m.params), escHtml(m.description)]);
    });
    sections.push(dokiTable(rows));
    sections.push('');
  }

  if (record.warnings.length) {
    record.warnings.forEach(w => {
      sections.push(`[warning: "${escHtml(w)}"]\n`);
    });
  }

  if (record.notes.length) {
    sections.push(`[heading: "Notes for Modders"]`);
    record.notes.forEach(n => {
      sections.push(`<p>${escHtml(n)}</p>`);
    });
    sections.push('');
  }

  if (record.example) {
    sections.push(`[heading: "Example Usage (Modding)"]`);
    sections.push(`[codeblock javascript]\n${record.example}\n[/codeblock]`);
    sections.push('');
  }

  const body = assembleSections(sections);
  return htmlHead(record.name, '../') + body + htmlFoot();
}

function generateGlobalsPage(globals) {
  const sections = [];
  sections.push(`[title: "Global Scope"]\n`);
  sections.push(`<a href="../">← Back to index</a>\n`);
  sections.push(`<p>Global constants, variables and functions available throughout the game and usable in addons. These cover settings, environment detection, song and chart data, character and achievement systems, and core game services.</p>\n`);

  sections.push(`[heading: "Global Constants"]`);
  if (globals.constants.length) {
    const rows = [['Name', 'Type', 'Value', 'Description']];
    globals.constants.forEach(c => {
      rows.push([escHtml(c.name), escHtml(c.type), escHtml(c.value), escHtml(c.description)]);
    });
    sections.push(dokiTable(rows));
  } else {
    sections.push(`<p>No constants documented.</p>`);
  }
  sections.push('');

  sections.push(`[heading: "Global Variables"]`);
  if (globals.variables.length) {
    const rows = [['Name', 'Type', 'Description']];
    globals.variables.forEach(v => {
      rows.push([escHtml(v.name), escHtml(v.type), escHtml(v.description)]);
    });
    sections.push(dokiTable(rows));
  } else {
    sections.push(`<p>No variables documented.</p>`);
  }
  sections.push('');

  sections.push(`[heading: "Global Functions"]`);
  if (globals.functions.length) {
    const rows = [['Name', 'Parameters', 'Description']];
    globals.functions.forEach(f => {
      rows.push([escHtml(f.name), formatParams(f.params), escHtml(f.description)]);
    });
    sections.push(dokiTable(rows));
  } else {
    sections.push(`<p>No functions documented.</p>`);
  }
  sections.push('');

  const body = assembleSections(sections);
  return htmlHead('Global Scope', './') + body + htmlFoot();
}

function generateIndexPage(classes, globals) {
  const byCategory = {};
  const categoryNames = [];
  classes.forEach(cls => {
    if (!byCategory[cls.category]) {
      byCategory[cls.category] = [];
      categoryNames.push(cls.category);
    }
    byCategory[cls.category].push(cls);
  });

  const ordered = CATEGORY_ORDER.filter(cat => byCategory[cat]);
  const extras = categoryNames.filter(cat => !CATEGORY_ORDER.includes(cat)).sort();
  const finalOrder = ordered.concat(extras);

  const sections = [];
  sections.push(`[title: "${GAME_NAME} Modding API Documentation"]\n`);

  sections.push(`<p>This website provides detailed information about all core classes in ${GAME_NAME} <strong>${GAME_VERSION}</strong>. Use this reference when creating addons to understand available APIs and modification points.</p>\n`);

  const staticLines = INDEX_STATIC.trim().split('\n');
  staticLines.forEach(line => sections.push(line));
  sections.push('');

  finalOrder.forEach(category => {
    const cats = byCategory[category].slice().sort((a, b) => a.name.localeCompare(b.name));
    sections.push(`[subheading: "${category}"]`);
    const rows = [['Name', 'Description']];
    cats.forEach(cls => {
      rows.push([`<a href="classes/${encodeURIComponent(cls.name)}.html">${escHtml(cls.name)}</a>`, escHtml(cls.summary || cls.description)]);
    });
    sections.push(dokiTable(rows));
    sections.push('');
  });

  const body = assembleSections(sections);
  return htmlHead(GAME_NAME + ' Modding API Documentation', './') + body + htmlFoot();
}

function generateTutorialFiles(outputDir) {
  const tutorialsDir = path.join(__dirname, 'tutorials');
  const files = fs.readdirSync(tutorialsDir).filter(name => name.endsWith('.html'));
  fs.mkdirSync(path.join(outputDir, 'tutorials'), { recursive: true });
  files.forEach(name => fs.copyFileSync(path.join(tutorialsDir, name), path.join(outputDir, 'tutorials', name)));
  return files.length;
}

function generateDocs(options = {}) {
  const startTime = Date.now();
  const outputDir = options.outputDir || path.join(__dirname, 'docs');
  const buildSystem = options.buildSystem || new BuildSystem();

  log('Parsing JSDoc from ' + buildSystem.fileOrder.length + ' source files...');
  const { classes, globals } = parseAllSources(buildSystem);

  log(`Found ${classes.length} documented classes and ${globals.constants.length + globals.variables.length + globals.functions.length} globals`);

  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(outputDir, 'classes'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'tutorials'), { recursive: true });

  fs.copyFileSync(path.join('./lib/', 'doki-docs.js'), path.join(outputDir, 'doki-docs.js'));
  fs.copyFileSync(path.join('./lib/', 'doki-docs.css'), path.join(outputDir, 'doki-docs.css'));
  fs.copyFileSync(path.join('./lib/', 'highlight.min.js'), path.join(outputDir, 'highlight.min.js'));
  
  fs.writeFileSync(path.join(outputDir, 'doki-loader.js'), DOKI_LOADER_JS, 'utf8');

  classes.forEach(cls => {
    const fileName = cls.name + '.html';
    const page = generateClassPage(cls, classes);
    fs.writeFileSync(path.join(outputDir, 'classes', fileName), page, 'utf8');
  });

  fs.writeFileSync(path.join(outputDir, 'globals.html'), generateGlobalsPage(globals), 'utf8');
  fs.writeFileSync(path.join(outputDir, 'index.html'), generateIndexPage(classes, globals), 'utf8');

  fs.writeFileSync(
    path.join(outputDir, 'README.md'),
    `# ${GAME_NAME} Modding API Documentation\n\nThis site is automatically generated from the JSDoc comments in the game source code.\nRun \`node docs-generator.js\` (or \`node index.js --docs\`) to regenerate it into the \`docs/\` folder.\n`,
    'utf8'
  );

  const tutorialCount = generateTutorialFiles(outputDir);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`Documentation generated into ${path.relative(__dirname, outputDir)}/ (${classes.length} class pages, ${globals.constants.length} constants, ${globals.variables.length} variables, ${globals.functions.length} functions, ${tutorialCount} tutorials) in ${elapsed}s`, 'success');

  return { classes: classes.length, globals, elapsed };
}

if (require.main === module) {
  generateDocs();
}

module.exports = { generateDocs, parseAllSources, scanSource, parseJsdoc };