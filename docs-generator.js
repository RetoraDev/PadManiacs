#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { BuildSystem } = require('./build.js');

const DOCS_TITLE = 'PadManiaX Modding API Documentation';
const GAME_NAME = 'PadManiaX';
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
<p>PadManiaX was built using <a href="https://github.com/photonstorm/phaser-ce">Phaser CE</a>, with Cordova for mobile file access and NW.js for desktop builds. See the documentation: <a href="https://cordova.apache.org/docs/en/latest/">Cordova Docs</a>, <a href="https://nwjs.io/docs/">NW.js Docs</a>, and <a href="https://github.com/photonstorm/phaser-ce">Phaser CE Docs</a>.</p>

<p>The game code is divided into different classes. All classes are accessible in the scope of addon file. Each of them plays a role, some more important than others. For example game screens visual or abstract elements, data managers, etc.</p>
`;

const DOKI_LOADER_JS = `document.body.style.visibility = "hidden";

window.onload = function () {
  // List of possible places to find DokiDocs
  const dokiDocsLocations = ["./", "../", "../", "https://cdn.jsdelivr.net/npm/doki-docs@latest/"];

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
    const named = /^([\w$.\[]+)\]?\s*(?:-\s*)?(.*)$/.exec(rest);
    if (named) {
      name = named[1].replace(/^\[|\]$/g, '');
      description = named[2].trim();
    } else {
      description = rest;
    }
  } else {
    const named = /^([\w$.\[]+)\]?\s*(?:-\s*)?(.*)$/.exec(value);
    if (named) {
      name = named[1].replace(/^\[|\]$/g, '');
      description = named[2].trim();
      type = 'Object';
    } else {
      description = value;
      type = 'Object';
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
  const modMatch = /^(?:(?:static|async)\s+)?(?:get|set\s+)?([\w$]+)$/.exec(slice);

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

  const body = sections.join('\n    ');
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

  const body = sections.join('\n    ');
  return htmlHead('Global Scope', '../') + body + htmlFoot();
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

  sections.push(`<p>This website provides detailed information about all core classes in ${GAME_NAME}. Use this reference when creating addons to understand available APIs and modification points.</p>\n`);

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

  const body = sections.join('\n    ');
  return htmlHead(GAME_NAME + ' Modding API Documentation', './') + body + htmlFoot();
}

const TUTORIALS = {
  'getting_started.html': `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width">
    <meta charset="UTF-8">
    <title>Getting Started with Modding - PadManiaX Modding API Documentation</title>
</head>
<body class="doki-hidden">
    <script src="../doki-loader.js"></script>
  
    [title: "Getting Started with Modding"]
    <a href="../">← Back to index</a>
    
    <p>Learn how to create your first PadManiaX addon from scratch.</p>
    
    [heading: "Prerequisites"]
    <p>Before you begin modding PadManiaX, you should have:</p>
    [list]
    * Basic understanding of JavaScript
    * Text editor or code editor
    * PadManiaX installed on your device
    * File manager app (for mobile development)
    [/list]
    
    [heading: "Development Tools"]
    
    [subheading: "Mobile Development with Acode"]
    <p>If you're developing on mobile, we recommend using <strong>Acode</strong> - a powerful mobile code editor.</p>
    
    [subheading: "Desktop Development"]
    <p>For desktop development, any code editor works: Visual Studio Code (recommended), Sublime Text, or Atom.</p>
    
    [heading: "Your First Addon"]
    
    [subheading: "Step 1: Create Addon Directory"]
    <p>Navigate to your PadManiaX data directory and create a new folder in the <code>"Addons"</code> folder:</p>
    [list]
    * Path on desktop: [code: "[Game Folder]/data/Addons/MyFirstAddon/"]
    * Path on mobile: [code: "/storage/emulated/0/PadManiacs/Addons/MyFirstAddon/"]
    [/list]
    
    [subheading: "Step 2: Create Manifest File"]
    <p>Create a <code>manifest.json</code> file with basic information:</p>
    [codeblock json]
{
  "id": "my-first-addon",
  "name": "My First Addon",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "My very first PadManiaX addon!"
}
    [/codeblock]
    
    [subheading: "Step 3: Test Your Addon"]
    <p>Launch PadManiaX and check if your addon appears in the Addon Manager:</p>
    [list]
    * Go to Main Menu → Extras → Addon Manager
    * Your addon should appear in the list
    * Enable it if it's disabled
    [/list]
    
    [heading: "Understanding the Basics"]
    
    [subheading: "Addon Structure"]
    [codeblock]
MyFirstAddon/
├── manifest.json     # Required: Addon metadata
├── icon.png          # Optional: Addon icon
├── assets/           # Optional: Game assets to replace
└── behaviors/        # Optional: JavaScript code files
    ├── global.js     # Runs when addon loads
    └── menu.js       # Runs in MainMenu state
    [/codeblock]
    
    [subheading: "Required JavaScript Knowledge"]
    <p>You'll need basic JavaScript knowledge for modding:</p>
    [list]
    * Variables and functions
    * Objects and arrays
    * Event handling
    * Basic DOM manipulation (for web concepts)
    [/list]
    
    <p>Recommended JavaScript learning resources:</p>
    [list]
    * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide">MDN JavaScript Guide</a>
    * <a href="https://javascript.info/">The Modern JavaScript Tutorial</a>
    * <a href="https://www.w3schools.com/js/">W3Schools JavaScript Tutorial</a>
    [/list]
    
    [heading: "Development Tips"]
    
    [subheading: "Enable Debug Console"]
    <p>PadManiaX has a hidden developer console using Eruda. To enable it:</p>
    [codeblock js]
// Add this in any file of your addon
eruda.init();
    [/codeblock]
    
    <p><strong>Eruda</strong> is a mobile web debugger that provides console, elements inspection, and network monitoring. <a href="https://github.com/liriliri/eruda">Learn more about Eruda</a>.</p>
    
    [subheading: "Restart the Game"]
    <p>You can restart the game programmatically:</p>
    [codeblock js]
bootGame(); // Restarts the entire game
    [/codeblock]
    
    [heading: "Examples"]
    
    [subheading: "Hello World"]
    [codeblock js]
eruda.init(); // To initialize the console

this.helloWorldText = new Text(2, 2, "Hello World");

console.log("Hello World");
    [/codeblock]
    
    [subheading: "Simple Character Mod"]
    [codeblock js]
// behaviors/global.js
console.log("My character mod loaded!");

// Add a custom skill
CHARACTER_SKILLS.push({
  id: "mod_skill",
  name: "Modder's Touch",
  description: "A custom skill from an addon",
  activationCondition: "on_combo",
  effect: "modify_score_gain",
  effectParams: { multiplier: 1.2, judgement: "marvelous", threshold: 50 },
  duration: 10000,
  cooldown: 45000
});

// Add a custom achievement
ACHIEVEMENT_DEFINITIONS.push({
  id: "mod_achievement",
  name: "Mod User",
  category: ACHIEVEMENT_CATEGORIES.MISC,
  description: {
    unachieved: "Use a modded skill",
    achieved: "You used a modded skill!"
  },
  expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.COMMON,
  condition: (stats, lastSong) => lastSong.skillsUsed > 0,
  hidden: false
});
    [/codeblock]
    
    <p>You can download working sample add-ons to load in the game from <a href="https://retora.itch.io/padmaniacs/download/eyJleHBpcmVzIjoxNzc2MzA4MjQ4LCJpZCI6Mzk4OTgwNX0=.QIot74UL0TfHP+txH4R4uBGggY4=">itch.io</a>.</p>

    [heading: "Next Steps"]
    <p>Now that you've created your first addon, check out these tutorials:</p>
    [list]
    * <a href="manifest_format.html">Understanding the Manifest Format</a>
    * <a href="asset_replacement.html">Asset Replacement Tutorial</a>
    * <a href="behavior_scripts.html">Creating Behavior Scripts</a>
    [/list]
    
    [footer: "&copy; Retora 2026"]
</body>
</html>
`,
  'manifest_format.html': `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width">
    <meta charset="UTF-8">
    <title>Understanding the Manifest Format - PadManiaX Modding API Documentation</title>
</head>
<body class="doki-hidden">
    <script src="../doki-loader.js"></script>
  
    [title: "Understanding the Manifest Format"]
    <a href="../">← Back to index</a>
    
    <p>Complete guide to the manifest.json file structure and all available options.</p>
    
    [heading: "What is the Manifest?"]
    <p>The <code>manifest.json</code> file is the heart of your addon. It tells PadManiaX:</p>
    [list]
    * Basic information about your addon
    * What assets to load and replace
    * What behavior scripts to execute
    [/list]
    
    [heading: "Basic Manifest Structure"]
    
    [codeblock json]
    {
      "id": "unique-addon-id",
      "name": "Display Name",
      "version": "1.0.0",
      "author": "Your Name",
      "description": "What this addon does",
      "icon": "icon.png"
    }
    [/codeblock]
    
    [heading: "Required Fields"]
    
    [table header]
    [ Field | Type | Description | Example ]
    [ id | String | Unique identifier for your addon | "my-custom-theme" ]
    [ name | String | Display name shown in Addon Manager | "Custom Theme Pack" ]
    [ version | String | Version number using semantic versioning | "1.0.0" ]
    [/table]
    
    [heading: "Optional Fields"]
    
    [table header]
    [ Field | Type | Description | Example ]
    [ author | String | Addon creator name | "Your Name" ]
    [ description | String | Short description of addon | "Adds new arrow skins" ]
    [ icon | String | Path to addon icon image | "assets/icon.png" ]
    [ assets | Object | Asset replacement mappings | { "arrows": "assets/new_arrows.png" } ]
    [ behaviors | Object | Behavior script mappings | { "MainMenu": "behaviors/menu.js" } ]
    [/table]
    
    [heading: "Complete Example"]
    
    [codeblock json]
    {
      "id": "custom-arrow-pack",
      "name": "Custom Arrow Pack",
      "version": "2.1.0",
      "author": "Arrow Designer",
      "description": "Replaces all arrow graphics with custom designs",
      "icon": "icon.png",
      
      "assets": {
        "arrows": "assets/custom_arrows.png",
        "receptor": "assets/custom_receptor.png",
        "explosion": "assets/custom_explosion.png"
      },
      
      "behaviors": {
        "Global": "behaviors/global.js",
        "MainMenu": "behaviors/menu.js",
        "Play": "behaviors/gameplay.js"
      }
    }
    [/codeblock]
    
    [heading: "Assets Field Explained"]
    <p>The <code>assets</code> field maps game asset keys to your custom files:</p>
    
    [codeblock json]
    "assets": {
      "game_asset_key": "path/to/your/file.png"
    }
    [/codeblock]
    
    [subheading: "Common Asset Keys"]
    [table header]
    [ Key | Description | Default File ]
    [ arrows | Note arrows spritesheet | chart/arrows.png ]
    [ receptor | Receptor spritesheet | chart/receptor.png ]
    [ explosion | Note explosion effect | chart/explosion.png ]
    [ ui_window_1 | Brown window skin | ui/window_1.png ]
    [ ui_background_gradient | Background gradient | ui/background_gradient.png ]
    [ ui_logo_shape | Logo shape | ui/logo_shape.png ]
    [/table]
    
    [heading: "Behaviors Field Explained"]
    <p>The <code>behaviors</code> field maps game states to your JavaScript files:</p>
    
    [codeblock json]
    "behaviors": {
      "StateName": "path/to/behavior.js"
    }
    [/codeblock]
    
    [subheading: "Available Game States"]
    [table header]
    [ State | Description | When Executed ]
    [ Global | Global scope | When addon is loaded ]
    [ Boot | Initial loading | Game startup ]
    [ Title | Title screen | When title screen loads ]
    [ MainMenu | Main menu | When main menu loads ]
    [ SongSelect | Song selection | When selecting songs ]
    [ Play | Gameplay | During rhythm gameplay ]
    [ Results | Results screen | After song completion ]
    [/table]
    
    [heading: "Dependencies and Compatibility"]
    
    [subheading: "Dependencies"]
    <p>Specify other addons your addon requires:</p>
    [codeblock json]
    "dependencies": {
      "required-addon-id": "minimum-version",
      "optional-addon-id": "1.0.0"
    }
    [/codeblock]
    
    [subheading: "Compatibility"]
    <p>Define which game versions your addon works with:</p>
    [codeblock json]
    "compatibility": {
      "minVersion": "0.0.5",  // Minimum game version
      "maxVersion": "2.0.0"   // Maximum game version (optional)
    }
    [/codeblock]
    
    [heading: "Best Practices"]
    
    [subheading: "ID Naming Convention"]
    [list]
    * Use lowercase letters, numbers, and hyphens
    * Make it unique and descriptive
    * Include your username if possible
    * Examples: <code>"johns-arrow-pack"</code>, <code>"custom-ui-theme"</code>
    [/list]
    
    [subheading: "Versioning"]
    [list]
    * Use semantic versioning: MAJOR.MINOR.PATCH
    * MAJOR: Breaking changes
    * MINOR: New features, backward compatible
    * PATCH: Bug fixes
    [/list]
    
    [subheading: "File Organization"]
    [codeblock]
    MyAddon/
    ├── manifest.json
    ├── icon.png
    ├── assets/
    │   ├── arrows.png
    │   ├── receptor.png
    │   └── explosion.png
    └── behaviors/
        ├── global.js
        ├── menu.js
        └── gameplay.js
    [/codeblock]
    
    [heading: "Troubleshooting"]
    
    [subheading: "Common Errors"]
    [table header]
    [ Error | Cause | Solution ]
    [ Addon not appearing | Invalid manifest.json | Check JSON syntax ]
    [ Assets not loading | Wrong asset key | Verify asset key names ]
    [ Script errors | JavaScript syntax error | Check console, then fix errors ]
    [/table]
    
    [subheading: "Debugging Tips"]
    <p>Enable the developer console to see errors:</p>
    [codeblock js]
    eruda.init(); // Enable debug console
    console.log("Addon loaded!"); // Log messages
    [/codeblock]
    
    [heading: "Next Steps"]
    <p>Now that you've understood manifest format, check out these tutorials:</p>
    [list]
    * <a href="asset_replacement.html">Asset Replacement Tutorial</a>
    * <a href="behavior_scripts.html">Creating Behavior Scripts</a>
    [/list]
    
    [footer: "&copy; Retora 2026"]
</body>
</html>
`,
  'asset_replacement.html': `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width">
    <meta charset="UTF-8">
    <title>Asset Replacement Tutorial - PadManiaX Modding API Documentation</title>
</head>
<body class="doki-hidden">
    <script src="../doki-loader.js"></script>
  
    [title: "Asset Replacement Tutorial"]
    <a href="../">← Back to index</a>
    
    <p>Learn how to replace game graphics, sounds, and other assets with your custom creations.</p>
    
    [heading: "Understanding Asset Replacement"]
    <p>Asset replacement allows you to modify the game's visual and audio elements without changing the game code. You can replace:</p>
    [list]
    * Images and spritesheets
    * Sound effects
    * UI elements
    * Fonts and text graphics
    [/list]
    
    [heading: "Basic Asset Replacement"]
    
    [subheading: "Step 1: Prepare Your Assets"]
    <p>Create your custom assets with the same dimensions and format as the originals:</p>
    [table header]
    [ Asset Type | Format | Dimensions | Notes ]
    [ Spritesheets | PNG | Varies | Maintain frame sizes ]
    [ UI Elements | PNG | 8x8 multiples | Pixel art style ]
    [ Audio | OGG | - | OGG format recommended ]
    [/table]
    
    [subheading: "Step 2: Configure Manifest"]
    <p>Add asset mappings to your <code>manifest.json</code>:</p>
    [codeblock json]
    {
      "id": "custom-arrows",
      "name": "Custom Arrows",
      "version": "1.0.0",
      "assets": {
        "arrows": "assets/my_arrows.png",
        "receptor": "assets/my_receptor.png"
      }
    }
    [/codeblock]
    
    [subheading: "Step 3: File Structure"]
    [codeblock plaintext]
    CustomArrows/
    ├── manifest.json
    └── assets/
        ├── my_arrows.png
        └── my_receptor.png
    [/codeblock]
    
    [heading: "Available Asset Keys"]
    
    [subheading: "Gameplay Assets"]
    [table header]
    [ Key | Description | Default File | Dimensions ]
    [ arrows | Note arrows | chart/arrows.png | 16x16 per frame ]
    [ receptor | Receptor graphics | chart/receptor.png | 16x16 per frame ]
    [ explosion | Note explosion | chart/explosion.png | Single image ]
    [ mine | Mine notes | chart/mine.png | 16x16 per frame ]
    [ hold_body | Hold body | chart/hold_body.png | 16x112 ]
    [ hold_end | Hold ends | chart/hold_end.png | 16x8 ]
    [ roll_body | Roll body | chart/roll_body.png | 16x16 ]
    [ roll_end | Roll ends | chart/roll_end.png | 16x8 ]
    [/table]
    
    [subheading: "UI Assets"]
    [table header]
    [ Key | Description | Default File | Dimensions ]
    [ ui_window_1 | Brown window | ui/window_1.png | 8x8 per frame ]
    [ ui_background_gradient | Gradient bg | ui/background_gradient.png | Full screen ]
    [ ui_logo_shape | Logo | ui/logo_shape.png | Logo dimensions ]
    [ ui_loading_dots | Loading animation | ui/loading_dots.png | 26x6 per frame ]
    [ ui_hud_background | HUD background | ui/hud_background.png | 192x112 ]
    [ ui_difficulty_banner | Difficulty banner | ui/difficulty_banner.png | Small banner ]
    [ ui_lifebar | Life bar | ui/lifebar.png | 1x5 per frame ]
    [ ui_acurracy_bar | Accuracy bar | ui/acurracy_bar.png | Bar graphic ]
    [/table]
    
    [subheading: "Font Assets"]
    [table header]
    [ Key | Description | Default File | Characters ]
    [ font_tiny | Default font | fonts/tiny.png | A-Z, 0-9, symbols ]
    [ font_shaded | Shaded font | fonts/shaded.png | With drop shadow ]
    [ font_stroke | Outlined font | fonts/stroke.png | Better visibility ]
    [ font_number | Number font | fonts/number.png | Optimized numbers ]
    [ font_combo | Combo font | fonts/combo.png | Large combo display ]
    [/table]
    
    [heading: "Advanced Asset Techniques"]
    
    [subheading: "Spritesheet Frame Order"]
    <p>Arrows spritesheet has specific frame order for note colors:</p>
    [codeblock plaintext]
    Frame 0: Red (4th notes)
    Frame 1: Blue (8th notes) 
    Frame 2: Purple (12th notes)
    Frame 3: Yellow (16th notes)
    Frame 4: Pink (24th notes)
    Frame 5: Orange (32nd notes)
    Frame 6: Cyan (48th notes)
    Frame 7: Green (64th notes)
    Frame 8: White (96th notes)
    Frame 9: Sky Blue (128th notes)
    Frame 10: Olive (192nd notes)
    Frame 11: Gray (Ultra-fast notes)
    [/codeblock]
    
    [subheading: "Receptor Animation Frames"]
    <p>Receptor spritesheet has 3 frames:</p>
    [codeblock plaintext]
    Frame 0: Pressed state
    Frame 1: Transition frame  
    Frame 2: Default state
    [/codeblock]
    
    [subheading: "Window Frame System"]
    <p>Window spritesheets use a 3x3 grid system:</p>
    [codeblock]
    [0] [1] [2]  - Top row (corners and top edge)
    [3] [4] [5]  - Middle row (sides and fill)
    [6] [7] [8]  - Bottom row (corners and bottom edge)
    [/codeblock]
    
    [heading: "Creating Custom Assets"]
    
    [subheading: "Tools for Asset Creation"]
    [list]
    * <strong>Aseprite</strong> - Professional pixel art tool
    * <strong>Piskel</strong> - Free online pixel art editor
    * <strong>GIMP</strong> - Free image editor with pixel tools
    * <strong>Acode</strong> - Mobile file management for testing
    [/list]
    
    [subheading: "Color Palette"]
    <p>PadManiaX uses a retro color palette. Recommended colors:</p>
    [codeblock plaintext]
    Primary colors:
    - Brown: #8B4513 (UI windows)
    - Cyan: #76FCFF (Text highlights)
    - White: #FFFFFF (Text)
    
    Note colors (see frame order above)
    Game uses various colors for different note speeds
    [/codeblock]
    
    [heading: "Testing Your Assets"]
    
    [subheading: "Enable Debug Mode"]
    <p>Use the developer console to verify asset loading:</p>
    [codeblock js]
    eruda.init(); // Enable console
    console.log("Testing custom assets...");
    [/codeblock]
    
    [subheading: "Common Issues"]
    [table header]
    [ Issue | Cause | Solution ]
    [ Asset not loading | Wrong file path | Check manifest paths ]
    [ Wrong colors | Incorrect frame order | Verify spritesheet order ]
    [ Performance issues | Large file size | Optimize image size ]
    [ Missing frames | Wrong dimensions | Match original dimensions ]
    [/table]
    
    [heading: "Example: Custom Arrow Pack"]
    
    [subheading: "Manifest"]
    [codeblock json]
    {
      "id": "neon-arrows",
      "name": "Neon Arrow Pack", 
      "version": "1.0.0",
      "author": "Your Name",
      "description": "Glowing neon-style arrows",
      "assets": {
        "arrows": "assets/neon_arrows.png",
        "receptor": "assets/neon_receptor.png",
        "explosion": "assets/neon_explosion.png",
        "mine": "assets/neon_mine.png"
      }
    }
    [/codeblock]
    
    [subheading: "File Structure"]
    [codeblock plaintext]
    NeonArrows/
    ├── manifest.json
    └── assets/
        ├── neon_arrows.png     (16x192 - 12 frames of 16x16)
        ├── neon_receptor.png   (16x48 - 3 frames of 16x16)
        ├── neon_explosion.png  (Single image)
        └── neon_mine.png       (16x128 - 8 frames of 16x16)
    [/codeblock]
    
    [heading: "Best Practices"]
    [list]
    * Maintain original dimensions and frame counts
    * Use PNG format for transparency
    * Optimize file sizes for mobile performance
    * Test on different devices and screen sizes
    * Provide preview images for your addon
    [/list]
    
    [heading: "Next Steps"]
    <p>Now that you've understood how to replace game assets, check out these tutorials:</p>
    [list]
    * <a href="behavior_scripts.html">Creating Behavior Scripts</a>
    * <a href="ui_modification.html">Modifying UI</a>
    [/list]
    
    [footer: "&copy; Retora 2026"]
</body>
</html>
`,
  'behavior_scripts.html': `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width">
    <meta charset="UTF-8">
    <title>Creating Behavior Scripts - PadManiaX Modding API Documentation</title>
</head>
<body class="doki-hidden">
    <script src="../doki-loader.js"></script>
  
    [title: "Creating Behavior Scripts"]
    <a href="../">← Back to index</a>
    
    <p>Learn how to add custom gameplay logic and modify game behavior using JavaScript.</p>
    
    [heading: "What are Behavior Scripts?"]
    <p>Behavior scripts are JavaScript files that run at specific times during the game. They allow you to:</p>
    [list]
    * Modify game mechanics
    * Add new features
    * Change UI behavior
    * Create custom game modes
    * Hook into game events
    [/list]
    
    [heading: "JavaScript Requirements"]
    <p>You should understand these JavaScript concepts:</p>
    [list]
    * Variables (<code>let</code>, <code>const</code>)
    * Functions and arrow functions
    * Objects and arrays
    * Event listeners
    * Basic DOM manipulation
    [/list]
    
    <p>Recommended learning resources:</p>
    [list]
    * <a href="https://javascript.info/">Modern JavaScript Tutorial</a>
    * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">MDN JavaScript Docs</a>
    [/list]
    
    [heading: "Basic Behavior Script Structure"]
    
    [subheading: "Global Behavior"]
    <p>Runs when your addon is loaded. Use for initialization:</p>
    [codeblock js]
    // behaviors/global.js
    console.log("My addon loaded!");
    
    // Add global variables or functions
    window.myAddon = {
      version: "1.0.0",
      sayHello: function() {
        console.log("Hello from my addon!");
      }
    };
    
    // Modify global game settings
    if (Account && Account.settings) {
      Account.settings.myCustomSetting = true;
    }
    [/codeblock]
    
    [subheading: "State-Specific Behavior"]
    <p>Runs when a specific game state is active:</p>
    [codeblock js]
    // behaviors/menu.js (for MainMenu state)
    console.log("MainMenu state loaded!");
    
    // Access the state instance
    if (state && state.menu) {
      console.log("Menu function available:", state.menu);
    }
    
    // Access the game instance
    if (game) {
      console.log("Game width:", game.width);
    }
    [/codeblock]
    
    [heading: "Available Context Variables"]
    
    [subheading: "Global Context"]
    [table header]
    [ Variable | Type | Description ]
    [ game | Phaser.Game | Main game instance ]
    [ gamepad | Gamepad | Input system ]
    [ backgroundMusic | BackgroundMusic | Music player ]
    [ notifications | NotificationSystem | Notification system ]
    [ addonManager | AddonManager | Addon management ]
    [ Account | Object | User account data ]
    [/table]
    
    [subheading: "State Context"]
    [table header]
    [ Variable | Type | Description ]
    [ state | Object | Current state instance ]
    [ stateName | String | Name of current state ]
    [ game | Phaser.Game | Game instance (also available globally) ]
    [ global | Object | Global scope reference ]
    [/table]
    
    [heading: "Common Use Cases"]
    
    [subheading: "Modifying Menus with game.onMenuIn"]
    <p>The <code>game.onMenuIn</code> signal is fired when menus are created. You can use it to modify menu behavior:</p>
    [codeblock js]
    // behaviors/menu.js
    game.onMenuIn.add(function(menuName, menuInstance) {
      console.log("Menu created:", menuName);
      
      if (menuName === 'home') {
        // Modify the home menu
        console.log("Home menu instance:", menuInstance);
        
        // Add custom menu items
        if (menuInstance.addItem) {
          menuInstance.addItem("Custom Option", function() {
            notifications.show("Custom option clicked!");
          });
        }
      }
    });
    [/codeblock]
    
    [subheading: "Adding Custom Settings"]
    [codeblock js]
    // behaviors/menu.js
    game.onMenuIn.add(function(menuName, menuInstance) {
      if (menuName === 'settings') {
        // Add custom setting to settings window
        menuInstance.addSettingItem(
          "My Custom Setting",
          ["OFF", "ON"],
          0, // Default index
          function(index, value) {
            // Save setting
            Account.settings.myCustomSetting = index === 1;
            saveAccount();
            notifications.show("Custom setting saved!");
          }
        );
      }
    });
    [/codeblock]
    
    [subheading: "Modifying Gameplay"]
    [codeblock js]
    // behaviors/gameplay.js (Play state)
    if (state && state.player) {
      console.log("Player instance:", state.player);
      
      // Modify scoring
      const originalProcessJudgement = state.player.processJudgement;
      state.player.processJudgement = function(note, judgement, column) {
        // Double all scores
        if (judgement !== "miss") {
          this.score += 1000; // Bonus points
        }
        
        // Call original function
        originalProcessJudgement.call(this, note, judgement, column);
      };
    }
    [/codeblock]
    
    [heading: "Advanced Techniques"]
    
    [subheading: "Event Hooking"]
    <p>Hook into game events to add custom behavior:</p>
    [codeblock js]
    // behaviors/global.js
    if (game && game.onMenuIn) {
      // Store original signal
      const originalOnMenuIn = game.onMenuIn;
      
      // Create new signal with custom behavior
      game.onMenuIn = new Phaser.Signal();
      game.onMenuIn.add(function(menuName, menuInstance) {
        console.log("Custom menu handler:", menuName);
        
        // Call original handlers
        originalOnMenuIn.dispatch(menuName, menuInstance);
        
        // Add custom behavior
        if (menuName === 'songList') {
          // Modify song list behavior
        }
      });
    }
    [/codeblock]
    
    [subheading: "Creating Custom UI Elements"]
    [codeblock js]
    // behaviors/menu.js
    game.onMenuIn.add(function(menuName, menuInstance) {
      if (menuName === 'home') {
        // Create custom text element
        const customText = new Text(
          game.width / 2, 
          20, 
          "Welcome to my mod!",
          FONTS.shaded
        );
        customText.anchor.set(0.5);
        
        // Add to game world
        game.world.add(customText);
      }
    });
    [/codeblock]
    
    [heading: "Debugging Behavior Scripts"]
    
    [subheading: "Enable Developer Console"]
    <p>Use Eruda for mobile debugging:</p>
    [codeblock js]
    eruda.init(); // Enable console
    console.log("Behavior script loaded");
    console.log("Game state:", game.state.getCurrentState());
    [/codeblock]
    
    [subheading: "Error Handling"]
    [codeblock js]
    try {
      // Your behavior code here
      if (someCondition) {
        // Do something
      }
    } catch (error) {
      console.error("Error in behavior script:", error);
      notifications.show("Addon error occurred");
    }
    [/codeblock]
    
    [heading: "Example: Custom Game Mode"]
    
    [subheading: "Manifest Configuration"]
    [codeblock json]
    {
      "id": "custom-game-mode",
      "name": "Custom Game Mode",
      "version": "1.0.0",
      "behaviors": {
        "Global": "behaviors/global.js",
        "MainMenu": "behaviors/menu.js",
        "Play": "behaviors/gameplay.js"
      }
    }
    [/codeblock]
    
    [subheading: "Gameplay Behavior"]
    [codeblock js]
    // behaviors/gameplay.js
    console.log("Custom game mode activated!");
    
    if (state && state.player) {
      // Modify judgment windows
      state.JUDGE_WINDOWS = {
        marvelous: 0.10, // Tighter windows
        perfect: 0.15,
        great: 0.20,
        good: 0.25,
        boo: 0.35
      };
      
      // Add custom scoring
      state.player.customMultiplier = 2.0;
      
      const originalProcessJudgement = state.player.processJudgement;
      state.player.processJudgement = function(note, judgement, column) {
        // Apply custom multiplier
        this.score = Math.floor(this.score * this.customMultiplier);
        
        // Call original function
        originalProcessJudgement.call(this, note, judgement, column);
      };
    }
    [/codeblock]
    
    [heading: "Best Practices"]
    [list]
    * Use try-catch blocks for error handling
    * Check if objects exist before using them
    * Clean up your modifications when possible
    * Use console.log for debugging
    * Test on different devices and game versions
    * Document your behavior scripts
    [/list]
    
    [heading: "Security Considerations"]
    [list]
    * Never modify core game files directly
    * Use the provided API methods
    * Be careful with user data and settings
    * Test thoroughly before distribution
    [/list]
    
    [heading: "Next Steps"]
    <p>Now that you've understood how to make custom behaviors, check out these tutorials:</p>
    [list]
    * <a href="asset_replacement.html">Asset Replacement Tutorial</a>
    * <a href="ui_modification.html">Modifying UI</a>
    [/list]
    
    [footer: "&copy; Retora 2026"]
</body>
</html>
`,
  'ui_modification.html': `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width">
    <meta charset="UTF-8">
    <title>UI Modification Guide - PadManiaX Modding API Documentation</title>
</head>
<body class="doki-hidden">
    <script src="../doki-loader.js"></script>
  
    [title: "UI Modification Guide"]
    <a href="../">← Back to index</a>
    
    <p>Learn how to customize menus, interfaces, and user experience in PadManiaX.</p>
    
    [heading: "Understanding the UI System"]
    <p>PadManiaX uses several UI systems that you can modify:</p>
    [list]
    * <strong>Window System</strong> - Modal dialogs and settings
    * <strong>CarouselMenu</strong> - Vertical scrolling menus
    * <strong>Text System</strong> - Retro font rendering
    * <strong>Notification System</strong> - Temporary messages
    * <strong>HUD Elements</strong> - Gameplay interface
    [/list]
    
    [heading: "Basic UI Modification"]
    
    [subheading: "Modifying Menus with game.onMenuIn"]
    <p>The most powerful way to modify UI is using the <code>game.onMenuIn</code> signal:</p>
    [codeblock js]
    // behaviors/menu.js
    game.onMenuIn.add(function(menuName, menuInstance) {
      console.log("Menu created:", menuName);
      
      // Different menus have different instances
      switch(menuName) {
        case 'home':
          modifyHomeMenu(menuInstance);
          break;
        case 'settings':
          modifySettings(menuInstance);
          break;
        case 'songList':
          modifySongList(menuInstance);
          break;
      }
    });
    
    function modifyHomeMenu(menu) {
      // menu is a CarouselMenu instance
      console.log("Home menu items:", menu.items);
      
      // Add custom menu item
      menu.addItem("Custom Option", function() {
        notifications.show("Custom option selected!");
      });
    }
    [/codeblock]
    
    [subheading: "Available Menu Names"]
    [table header]
    [ Menu Name | Description | Instance Type ]
    [ home | Main home menu | CarouselMenu ]
    [ startGame | Game mode selection | CarouselMenu ]
    [ extraSongs | Additional songs menu | CarouselMenu ]
    [ settings | Settings window | Window ]
    [ addons | Addon manager | CarouselMenu ]
    [ addonDetails | Addon details | CarouselMenu ]
    [ songList | Song selection | CarouselMenu ]
    [ difficulty | Difficulty selection | CarouselMenu ]
    [ results | Results screen | CarouselMenu ]
    [ pause | Pause menu | CarouselMenu ]
    [/table]
    
    [heading: "Working with CarouselMenu"]
    
    [subheading: "Adding Menu Items"]
    [codeblock js]
    game.onMenuIn.add(function(menuName, menu) {
      if (menuName === 'home') {
        // Add simple menu item
        menu.addItem("My Feature", function() {
          notifications.show("My feature activated!");
        });
        
        // Add item with custom data
        menu.addItem(
          "Styled Item", 
          function() { /* callback */ },
          { 
            bgcolor: "#ff0000",  // Red background
            fgcolor: "#ffffff"   // White text
          }
        );
      }
    });
    [/codeblock]
    
    [subheading: "Modifying Existing Items"]
    [codeblock js]
    game.onMenuIn.add(function(menuName, menu) {
      if (menuName === 'home') {
        // Wait for menu to be fully created
        setTimeout(() => {
          // Modify existing items
          menu.items.forEach((item, index) => {
            if (item.textContent === "Rhythm Game") {
              item.setText("Let's Rock!"); // Customize text
            }
          });
        }, 100);
      }
    });
    [/codeblock]
    
    [heading: "Working with Window System"]
    
    [subheading: "Creating Custom Windows"]
    [codeblock js]
    function showCustomWindow() {
      // Create window using WindowManager
      const windowManager = new WindowManager();
      const customWindow = windowManager.createWindow(5, 5, 10, 8, "1");
      
      // Add content to window
      customWindow.addItem("Option 1", function() {
        notifications.show("Option 1 selected");
        windowManager.remove(customWindow, true);
      });
      
      customWindow.addItem("Option 2", function() {
        notifications.show("Option 2 selected");
        windowManager.remove(customWindow, true);
      });
      
      customWindow.addItem("Close", function() {
        windowManager.remove(customWindow, true);
      }, true); // true makes this a back button
    }
    [/codeblock]
    
    [subheading: "Adding Settings"]
    [codeblock js]
    game.onMenuIn.add(function(menuName, menu) {
      if (menuName === 'settings' && menu.addSettingItem) {
        // Add custom setting
        menu.addSettingItem(
          "My Custom Setting",      // Display name
          ["Disabled", "Enabled"],  // Options
          0,                        // Default index
          function(index, value) {  // Callback
            Account.settings.mySetting = index === 1;
            saveAccount();
            notifications.show("Setting saved: " + value);
          }
        );
      }
    });
    [/codeblock]
    
    [heading: "Custom Text and Graphics"]
    
    [subheading: "Creating Text Elements"]
    [codeblock js]
    function addCustomText() {
      // Create text with different fonts
      const text1 = new Text(50, 30, "Welcome!", FONTS.default);
      const text2 = new Text(50, 50, "Shaded Text", FONTS.shaded);
      const text3 = new Text(50, 70, "Outlined", FONTS.stroke);
      
      // Customize text
      text1.tint = 0xff0000; // Red color
      text2.anchor.set(0.5); // Center anchor
      
      // Add to game world
      game.world.add(text1);
      game.world.add(text2);
      game.world.add(text3);
    }
    [/codeblock]
    
    [subheading: "Creating Custom Graphics"]
    [codeblock js]
    function addCustomGraphics() {
      // Create graphics object
      const graphics = game.add.graphics(0, 0);
      
      // Draw rectangle
      graphics.beginFill(0x00ff00, 0.5); // Green, 50% opacity
      graphics.drawRect(50, 50, 100, 50);
      graphics.endFill();
      
      // Draw line
      graphics.lineStyle(2, 0xff0000, 1.0); // Red, 2px width
      graphics.moveTo(0, 0);
      graphics.lineTo(100, 100);
    }
    [/codeblock]
    
    [heading: "Advanced UI Techniques"]
    
    [subheading: "Modal Dialogs"]
    [codeblock js]
    function showConfirmationDialog(message, onConfirm, onCancel) {
      const windowManager = new WindowManager();
      const dialog = windowManager.createWindow(5, 5, 15, 6, "1");
      
      // Add message text
      const text = new Text(8, 8, message, FONTS.default);
      dialog.addChild(text);
      
      // Add buttons
      dialog.addItem("Yes", function() {
        windowManager.remove(dialog, true);
        onConfirm && onConfirm();
      });
      
      dialog.addItem("No", function() {
        windowManager.remove(dialog, true);
        onCancel && onCancel();
      }, true);
    }
    
    // Usage:
    showConfirmationDialog(
      "Are you sure?",
      function() { notifications.show("Confirmed!"); },
      function() { notifications.show("Cancelled!"); }
    );
    [/codeblock]
    
    [subheading: "Dynamic Menu Creation"]
    [codeblock js]
    function createDynamicMenu(items) {
      const carousel = new CarouselMenu(0, 30, 100, 80, {
        bgcolor: "#3498db",
        fgcolor: "#ffffff",
        align: 'left'
      });
      
      // Add items dynamically
      items.forEach(item => {
        carousel.addItem(item.name, item.callback, item.data);
      });
      
      // Handle selection
      carousel.onSelect.add(function(index, item) {
        console.log("Selected:", item.textContent);
      });
      
      return carousel;
    }
    
    // Usage:
    const menuItems = [
      { name: "Item 1", callback: () => console.log("1") },
      { name: "Item 2", callback: () => console.log("2") },
      { name: "Item 3", callback: () => console.log("3") }
    ];
    
    const dynamicMenu = createDynamicMenu(menuItems);
    [/codeblock]
    
    [heading: "Gameplay HUD Modification"]
    
    [subheading: "Modifying Play State UI"]
    [codeblock js]
    // behaviors/gameplay.js
    if (state && state.createHud) {
      // Store original method
      const originalCreateHud = state.createHud;
      
      // Override with custom HUD
      state.createHud = function() {
        // Call original to create standard HUD
        originalCreateHud.call(this);
        
        // Add custom HUD elements
        this.customScoreText = new Text(10, 10, "Custom: 0", FONTS.default);
        this.hud.addChild(this.customScoreText);
      };
    }
    [/codeblock]
    
    [subheading: "Real-time HUD Updates"]
    [codeblock js]
    // behaviors/gameplay.js  
    if (state && state.player) {
      // Hook into player update
      const originalUpdate = state.player.update;
      state.player.update = function() {
        // Call original update
        originalUpdate.call(this);
        
        // Update custom HUD
        if (state.customScoreText) {
          state.customScoreText.write("Custom: " + this.score);
        }
      };
    }
    [/codeblock]
    
    [heading: "Best Practices"]
    
    [subheading: "UI Design Guidelines"]
    [list]
    * Maintain consistent styling with the game
    * Use the retro pixel art aesthetic
    * Keep text readable and concise
    * Test on different screen sizes
    * Consider mobile touch targets
    [/list]
    
    [subheading: "Performance Considerations"]
    [list]
    * Avoid creating too many UI elements
    * Clean up elements when not needed
    * Use appropriate update frequencies
    * Test on target devices
    [/list]
    
    [subheading: "User Experience"]
    [list]
    * Provide clear feedback for user actions
    * Use familiar interaction patterns
    * Include accessibility considerations
    * Test with actual users
    [/list]
    
    [heading: "Debugging UI Modifications"]
    
    [subheading: "Enable Debug Console"]
    [codeblock js]
    eruda.init(); // Enable developer console
    
    // Log UI events
    game.onMenuIn.add(function(menuName, menu) {
      console.log("Menu created:", menuName, menu);
    });
    [/codeblock]
    
    [subheading: "Common Issues"]
    [table header]
    [ Issue | Cause | Solution ]
    [ UI not appearing | Wrong menu name | Check game.onMenuIn logs ]
    [ Elements misaligned | Wrong coordinates | Use game.width/game.height ]
    [ Performance issues | Too many elements | Optimize or remove elements ]
    [ Crashes | Invalid operations | Use try-catch blocks ]
    [/table]
    
    [heading: "Example: Complete UI Mod"]
    
    [subheading: "Manifest"]
    [codeblock json]
    {
      "id": "custom-ui-theme",
      "name": "Custom UI Theme",
      "version": "1.0.0",
      "behaviors": {
        "Global": "behaviors/global.js",
        "MainMenu": "behaviors/menu.js"
      },
      "assets": {
        "ui_window_1": "assets/custom_window.png"
      }
    }
    [/codeblock]
    
    [subheading: "Menu Behavior"]
    [codeblock js]
    // behaviors/menu.js
    game.onMenuIn.add(function(menuName, menu) {
      console.log("Custom UI: Menu created -", menuName);
      
      if (menuName === 'home') {
        // Add welcome message
        const welcomeText = new Text(
          game.width / 2,
          20,
          "Welcome to Custom UI!",
          FONTS.shaded
        );
        welcomeText.anchor.set(0.5);
        welcomeText.tint = 0x76fcde; // Cyan color
        game.world.add(welcomeText);
        
        // Modify menu appearance
        menu.config.bgcolor = "#9b59b6"; // Purple
        menu.config.fgcolor = "#ffffff"; // White
        
        // Add custom menu item
        menu.addItem("Custom Music Player", function() {
          notifications.show("Music player launched!");
        });
      }
    });
    [/codeblock]
    
    [heading: "Next Steps"]
    <p>Now that you've understood how to modify UI, check out these tutorials:</p>
    [list]
    * <a href="asset_replacement.html">Asset Replacement Tutorial</a>
    * <a href="behavior_scripts.html">Creating Behavior Scripts</a>
    [/list]
    
    [footer: "&copy; Retora 2026"]
</body>
</html>
`,
  'character_system.html': `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <title>Character System Guide - PadManiaX Modding API Documentation</title>
</head>
<body class="doki-hidden">
    <script src="../doki-loader.js"></script>
    
    [title: "Character System Guide"]
    <a href="../">← Back to index</a>
    
    <p>Learn how to work with the character system, including leveling, skills, and customization.</p>
    
    [heading: "Overview"]
    <p>The character system in PadManiaX allows players to create and level up characters that gain experience from gameplay. Characters can unlock skills, hair styles, and cosmetic items as they progress.</p>
    
    [heading: "Character Basics"]
    
    [subheading: "Creating a Character"]
    <p>Characters can be created from the Character Select menu:</p>
    [list]
    * Navigate to Main Menu → Character Select
    * Select "+ ADD CHARACTER"
    * Customize appearance (skin tone, hair color, hair style, clothing, accessory)
    * Enter a name (max 6 characters)
    [/list]
    
    [subheading: "Character Data Structure"]
    [codeblock json]
    {
      "name": "EIRI",
      "level": 1,
      "experience": 0,
      "skillLevel": 1,
      "unlockedSkills": ["focus_boost"],
      "selectedSkill": "focus_boost",
      "appearance": {
        "skinTone": 0,
        "hairColor": 0xa8705a,
        "frontHair": "1",
        "backHair": "1",
        "clothing": "school_uniform",
        "accessory": null
      },
      "stats": {
        "gamesPlayed": 0,
        "totalScore": 0,
        "maxCombo": 0,
        "perfectGames": 0,
        "skillsUsed": 0
      }
    }
    [/codeblock]
    
    [heading: "Leveling and Experience"]
    
    [subheading: "Gaining Experience"]
    <p>Experience is earned by playing songs with a character selected. Factors affecting experience gain:</p>
    [table header]
    [ Factor | Bonus Range | Requirement ]
    [ Completion | 0-2 XP | Minimum 70% accuracy ]
    [ Accuracy | 1-8 XP | Based on final accuracy ]
    [ Max Combo | 2-8 XP | Based on highest combo ]
    [ Full Combo | 8 XP | Zero misses throughout song ]
    [ Perfect Game | 4 XP | All marvelous/perfect judgments ]
    [ Difficulty | 1-3 XP | Higher difficulty = more XP ]
    [ Skill Usage | 1-5 XP | Per skill used during gameplay ]
    [/table]
    
    [subheading: "Level Up Rewards"]
    <p>When a character levels up, they may receive:</p>
    [list]
    * <strong>New Skills</strong> - 60% chance every level after level 4
    * <strong>New Hair Styles</strong> - 50% chance every 2 levels after level 2
    * <strong>New Items</strong> - 40% chance every 2 levels after level 3
    * <strong>Skill Level Increase</strong> - 40% chance every level (max level 5)
    [/list]
    
    [heading: "Skills System"]
    
    [subheading: "Skill Types"]
    <p>Skills are categorized by their effect type:</p>
    [table header]
    [ Type | Description | Example ]
    [ Conversion | Changes judgment types | Safety Net (Miss → Boo) ]
    [ Boost | Increases stats temporarily | Focus Boost (wider judgment windows) ]
    [ Regen | Restores health over time | Health Regeneration ]
    [ Protection | Prevents negative effects | Combo Shield ]
    [ Modifier | Changes game mechanics | Time Dilation (slower notes) ]
    [/table]
    
    [subheading: "Skill Activation Conditions"]
    [codeblock javascript]
    // Skills activate automatically when conditions are met:
    on_miss           // When you get a Miss
    on_combo          // When combo reaches threshold (e.g., 50)
    on_low_health     // When health drops below threshold (e.g., 30%)
    on_high_combo     // When combo reaches high threshold (e.g., 100)
    on_perfect_streak // After consecutive perfects (e.g., 10)
    on_mine_hit       // Before hitting a mine
    on_critical_health // When health is critically low (e.g., 15%)
    [/codeblock]
    
    [subheading: "Adding Custom Skills"]
    <p>Modders can add custom skills by extending the CHARACTER_SKILLS array:</p>
    [codeblock javascript]
    // In your addon's global behavior
    CHARACTER_SKILLS.push({
      id: "my_custom_skill",
      name: "My Custom Skill",
      description: "Does something awesome",
      activationCondition: "on_combo",
      effect: "modify_score_gain",
      effectParams: { multiplier: 1.5, judgement: "marvelous", threshold: 100 },
      duration: 8000,
      cooldown: 30000
    });
    [/codeblock]
    
    [heading: "Character Customization"]
    
    [subheading: "Appearance Options"]
    [table header]
    [ Category | Options | Unlock Method ]
    [ Skin Tone | Light, Dark | Default ]
    [ Hair Color | Any RGB color | Default ]
    [ Front Hair | 8+ styles | Level up / Achievements ]
    [ Back Hair | 8+ styles | Level up / Achievements ]
    [ Clothing | 10+ items | Level up / Achievements ]
    [ Accessories | 5+ items | Level up / Achievements ]
    [/table]
    
    [subheading: "Modifying Character Appearance in Code"]
    [codeblock javascript]
    // Get current character
    const characterManager = new CharacterManager();
    const character = characterManager.getCurrentCharacter();
    
    // Change appearance
    character.appearance.hairColor = 0xFF6699;
    character.appearance.frontHair = "3";
    character.appearance.clothing = "daring_clothing";
    
    // Save changes
    characterManager.saveToAccount();
    
    // Update display
    characterDisplay.updateAppearance(character.appearance);
    [/codeblock]
    
    [heading: "Character API Reference"]
    
    [subheading: "CharacterManager Methods"]
    [table header]
    [ Method | Description ]
    [ getCurrentCharacter() | Returns the active character or null ]
    [ getCharacterList() | Returns array of all characters ]
    [ createCharacter(name, appearance) | Creates a new character ]
    [ deleteCharacter(name) | Deletes a character ]
    [ updateCharacterStats(gameResults) | Updates stats and awards XP ]
    [/table]
    
    [subheading: "Character Methods"]
    [table header]
    [ Method | Description ]
    [ addExperience(amount) | Adds XP and triggers level-ups ]
    [ getRequiredExperience() | Returns XP needed for next level ]
    [ getExperienceProgress() | Returns progress (0-1) toward next level ]
    [ canUseSkill() | Returns whether character has skills ]
    [/table]
    
    [heading: "Example: Character Info Display"]
    [codeblock javascript]
    // Create a character info display in your addon
    function showCharacterInfo() {
      const characterManager = new CharacterManager();
      const character = characterManager.getCurrentCharacter();
      
      if (!character) {
        notifications.show("No character selected!");
        return;
      }
      
      const info = \`\${character.name} (Lv.\${character.level})
      XP: \${character.experience}/\${character.getRequiredExperience()}
      Skill Level: \${character.skillLevel}
      Skills: \${character.unlockedSkills.length}
      Games: \${character.stats.gamesPlayed}
      Max Combo: \${character.stats.maxCombo}\`;
      
      notifications.show(info, 5000);
    }
    [/codeblock]
    
    [heading: "Best Practices"]
    [list]
    * Always use CharacterManager methods instead of modifying Account directly
    * Check if a character exists before accessing properties
    * Save character data after modifications using saveToAccount()
    * Test skill effects thoroughly as they can impact game balance
    * Consider skill cooldowns when designing custom skills
    [/list]
    
    [heading: "Next Steps"]
    <p>Now that you've understood the character system, check out:</p>
    [list]
    * <a href="achievements.html">Achievements System Guide</a>
    * <a href="behavior_scripts.html">Creating Behavior Scripts</a>
    [/list]
    
    [footer: "&copy; Retora 2026"]
</body>
</html>
`,
  'achievements.html': `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <title>Achievements System Guide - PadManiaX Modding API Documentation</title>
</head>
<body class="doki-hidden">
    <script src="../doki-loader.js"></script>
    
    [title: "Achievements System Guide"]
    <a href="../">← Back to index</a>
    
    <p>Learn how to work with the achievements system, including adding custom achievements and tracking player stats.</p>
    
    [heading: "Overview"]
    <p>The achievements system tracks player progress across multiple categories, unlocks achievements when conditions are met, and awards experience points to the current character.</p>
    
    [heading: "Achievement Categories"]
    [table header]
    [ Category | Description | Example Achievements ]
    [ Gameplay | Core gameplay milestones | First game, Combo 100, Perfect game ]
    [ Character | Character progression | First character, Level 50, Skill collector ]
    [ Progression | Overall progress | Games played, Total score, High scores ]
    [ Mastery | Difficulty mastery | All difficulties, Rating 15+ songs ]
    [ Time | Time-based milestones | 1 hour played, Night owl, Weekly streak ]
    [ Holidays | Holiday-specific | Play on holidays ]
    [ Editor | Chart editor | First arrow, Chart creator, Export songs ]
    [ Misc | Miscellaneous | Bug reports, Game rating ]
    [/table]
    
    [heading: "Achievement Structure"]
    [codeblock json]
    {
      "id": "combo_1000",
      "name": "Chain Master",
      "category": "Gameplay",
      "description": {
        "unachieved": "Reach 1000 combo",
        "achieved": "You reached 1000 combo!"
      },
      "expReward": 10,
      "condition": "stats => stats.maxCombo >= 1000",
      "hidden": false
    }
    [/codeblock]
    
    [heading: "Adding Custom Achievements"]
    <p>Modders can add custom achievements by extending the ACHIEVEMENT_DEFINITIONS array:</p>
    [codeblock javascript]
    // In your addon's global behavior
    ACHIEVEMENT_DEFINITIONS.push({
      id: "my_custom_achievement",
      name: "My Custom Achievement",
      category: ACHIEVEMENT_CATEGORIES.MISC,
      description: {
        unachieved: "Complete my custom challenge",
        achieved: "You completed my custom challenge!"
      },
      expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
      condition: (stats, lastSong) => {
        // Custom condition logic
        return stats.totalGamesPlayed >= 50 && lastSong.accuracy >= 95;
      },
      hidden: false
    });
    [/codeblock]
    
    [heading: "Achievement Experience Rewards"]
    [table header]
    [ Rarity | Value | Use Case ]
    [ COMMON | 5 XP | Easy achievements ]
    [ UNCOMMON | 10 XP | Medium difficulty ]
    [ RARE | 20 XP | Challenging achievements ]
    [ EPIC | 35 XP | Very difficult ]
    [ LEGENDARY | 64 XP | Extremely rare/grindy ]
    [/table]
    
    [heading: "Player Statistics"]
    
    [subheading: "Gameplay Stats"]
    [codeblock javascript]
    Account.stats = {
      totalGamesPlayed: 0,
      totalTimePlayed: 0,
      totalScore: 0,
      maxCombo: 0,
      perfectGames: 0,
      totalNotesHit: 0,
      totalMarvelous: 0,
      totalPerfect: 0,
      totalGreat: 0,
      totalGood: 0,
      totalBoo: 0,
      totalMiss: 0
    };
    [/codeblock]
    
    [subheading: "Progression Stats"]
    [codeblock javascript]
    Account.stats = {
      currentStreak: 0,
      longestStreak: 0,
      highScoresSet: 0,
      charactersCreated: 0,
      maxCharacterLevel: 1,
      skillsUnlocked: 0
    };
    [/codeblock]
    
    [subheading: "Time-Based Stats"]
    [codeblock javascript]
    Account.stats = {
      playedAtNight: false,
      playedEarlyMorning: false,
      playedWeekend: false,
      playedHoliday: false,
      totalPlaySessions: 0,
      averageSessionTime: 0,
      longestSession: 0
    };
    [/codeblock]
    
    [heading: "Working with AchievementsManager"]
    
    [subheading: "Checking Achievements"]
    [codeblock javascript]
    // Achievements are automatically checked after each game
    // But you can also check manually:
    const achievementsManager = new AchievementsManager();
    const newAchievements = achievementsManager.checkAchievements();
    
    if (newAchievements.length > 0) {
      newAchievements.forEach(achievement => {
        console.log(\`Unlocked: \${achievement.name}\`);
        notifications.showAchievement(achievement);
      });
    }
    [/codeblock]
    
    [subheading: "Getting Achievement Lists"]
    [codeblock javascript]
    const achievementsManager = new AchievementsManager();
    
    // Get all unlocked achievements
    const unlocked = achievementsManager.getUnlockedAchievements();
    
    // Get locked achievements (not hidden)
    const locked = achievementsManager.getLockedAchievements();
    
    // Get hidden locked achievements
    const hidden = achievementsManager.getHiddenAchievements();
    
    // Get completion percentage
    const percent = achievementsManager.getCompletionPercentage();
    [/codeblock]
    
    [subheading: "Tracking Custom Stats"]
    <p>You can add custom statistics to track in your addon:</p>
    [codeblock javascript]
    // Add custom stat to Account
    if (!Account.stats.myCustomStat) {
      Account.stats.myCustomStat = 0;
    }
    
    // Update stat
    Account.stats.myCustomStat++;
    saveAccount();
    
    // Create achievement that uses custom stat
    ACHIEVEMENT_DEFINITIONS.push({
      id: "custom_stat_achievement",
      name: "Custom Stat Master",
      category: ACHIEVEMENT_CATEGORIES.MISC,
      description: {
        unachieved: "Reach 100 in custom stat",
        achieved: "You reached 100 in custom stat!"
      },
      expReward: ACHIEVEMENTS.EXPERIENCE_VALUES.RARE,
      condition: stats => stats.myCustomStat >= 100,
      hidden: false
    });
    [/codeblock]
    
    [heading: "Session and Time Tracking"]
    
    [subheading: "Play Session Management"]
    <p>The AchievementsManager automatically tracks play sessions:</p>
    [codeblock javascript]
    // Get current session duration
    const currentSession = achievementsManager.getCurrentSessionTime();
    
    // Get formatted total play time
    const totalTime = achievementsManager.getTimePlayedFormatted();
    // Returns: "5h 23m 45s"
    [/codeblock]
    
    [subheading: "Play Streaks"]
    <p>Daily play streaks are automatically tracked:</p>
    [list]
    * Streak updates when player plays on consecutive days
    * Longest streak is recorded separately
    * Streak-based achievements (3, 7, 14, 30, 90 days)
    [/list]
    
    [heading: "Holiday Achievements"]
    <p>The game includes automatic holiday detection. Holidays are defined in the getHolidays() method:</p>
    [codeblock javascript]
    // Check if today is a holiday
    const { month, date } = achievementsManager.getDate();
    const isHoliday = achievementsManager.isHoliday(month, date);
    
    if (isHoliday) {
      const holidayName = achievementsManager.getHolidayName(month, date);
      console.log(\`Today is \${holidayName}!\`);
    }
    [/codeblock]
    
    [heading: "Example: Custom Achievement Display"]
    [codeblock javascript]
    // Create a custom achievement display in your addon
    function showAchievementProgress() {
      const achievementsManager = new AchievementsManager();
      const unlocked = achievementsManager.getTotalUnlockedCount();
      const total = achievementsManager.getTotalAchievementsCount();
      const percent = achievementsManager.getCompletionPercentage();
      
      const message = \`ACHIEVEMENTS: \${unlocked}/\${total} (\${percent}%)
      
      RECENT UNLOCKS:\`;
      
      const recent = achievementsManager.newAchievements.slice(-3);
      recent.forEach(ach => {
        message += \`\\n- \${ach.name}\`;
      });
      
      notifications.show(message, 5000);
    }
    [/codeblock]
    
    [heading: "Best Practices"]
    [list]
    * Always call saveAccount() after updating stats
    * Use existing stat categories when possible
    * Test achievement conditions thoroughly
    * Consider performance when checking conditions frequently
    * Use appropriate experience rewards for achievement difficulty
    * Document custom achievements for users
    [/list]
    
    [heading: "Next Steps"]
    <p>Now that you've understood the achievements system, check out:</p>
    [list]
    * <a href="character_system.html">Character System Guide</a>
    * <a href="behavior_scripts.html">Creating Behavior Scripts</a>
    [/list]
    
    [footer: "&copy; Retora 2026"]
</body>
</html>
`
};

function generateTutorialFiles(outputDir) {
  Object.keys(TUTORIALS).forEach(name => {
    const target = path.join(outputDir, 'tutorials', name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, TUTORIALS[name], 'utf8');
  });
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

  generateTutorialFiles(outputDir);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`Documentation generated into ${path.relative(__dirname, outputDir)}/ (${classes.length} class pages, ${globals.constants.length} constants, ${globals.variables.length} variables, ${globals.functions.length} functions, 7 tutorials) in ${elapsed}s`, 'success');

  return { classes: classes.length, globals, elapsed };
}

if (require.main === module) {
  generateDocs();
}

module.exports = { generateDocs, parseAllSources, scanSource, parseJsdoc };