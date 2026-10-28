#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');

class BuildSystem {
  constructor(flags = {}) {
    this.config = {
      srcDir: './src',
      distDir: './dist',
      libDir: './lib',
      flags: {
        debug: false,
        platform: 'all', // 'web', 'cordova', 'neutralino', 'all', 'none'
        minify: false,
        zipalign: false,
        noPack: false, // skip archive/packaging steps (zip/7z/apk/neu build)
        noWebBase: false, // don't re-stage dist/ as web after a platform build
        ...flags
      }
    };
    
    // File order for concatenation
    this.fileOrder = [
      // Core modules
      'js/core/lang.js',
      'js/core/constants.js',
      'js/core/environment.js', 
      'js/core/character.js',
      'js/core/account.js',
      'js/core/achievements.js',
      
      // Character System
      'js/character/Character.js',
      'js/character/CharacterDisplay.js',
      'js/character/CharacterCroppedDisplay.js',
      'js/character/CharacterPortrait.js',
      'js/character/CharacterCloseShot.js',
      'js/character/CharacterManager.js',
      'js/character/CharacterSkillSystem.js',
      
      // Achievements System
      'js/achievements/AchievementsManager.js',
      
      // Playlist Manager
      'js/playlist/PlaylistManager.js',
      
      // UI Components
      'js/ui/Text.js',
      'js/ui/Window.js',
      'js/ui/WindowManager.js',
      'js/ui/DialogWindow.js',
      'js/ui/CarouselMenu.js',
      'js/ui/Background.js',
      'js/ui/BackgroundGradient.js',
      'js/ui/CanvasBackground.js',
      'js/ui/FuturisticLines.js',
      'js/ui/LoadingDots.js',
      'js/ui/Logo.js',
      'js/ui/NavigationHint.js',
      'js/ui/ProgressText.js',
      'js/ui/ExperienceBar.js',
      'js/ui/SkillBar.js',
      'js/ui/TextInput.js',
      'js/ui/NumberInput.js',
      'js/ui/NotificationSystem.js',
      'js/ui/Lyrics.js',
      'js/ui/OffsetAssistant.js',
      'js/ui/MouseCursor.js',
      'js/ui/BarChart.js',
      'js/ui/LineChart.js',
      
      // Filesystem
      'js/filesystem/filesystem.js',
      'js/filesystem/neutralino-filesystem.js',
      'js/filesystem/cordova-filesystem.js',
      'js/filesystem/fallback-filesystem.js',
      
      // Game main
      'js/game/game.js',
      
      // Utils
      'js/utils/ScreenRecorder.js',
      'js/utils/Metronome.js',
      'js/utils/TimeUtils.js',
      'js/utils/AviTranscoder.js',
      
      // Input
      'js/input/GamepadListener.js',
      'js/input/KeyboardListener.js',
      'js/input/InputManager.js',
      'js/input/Gamepad.js',
      'js/input/AllPads.js',
      'js/input/OnScreenKeyboard.js',
      'js/input/NumericTypeOnScreenKeyboard.js',
      
      // Audio
      'js/audio/BackgroundMusic.js',
      
      // Visualizers
      'js/visualizers/Visualizer.js',
      'js/visualizers/AccurracyVisualizer.js',
      'js/visualizers/AudioVisualizer.js',
      'js/visualizers/BPMVisualizer.js',
      'js/visualizers/FullScreenAudioVisualizer.js',
      
      // Parsers
      'js/parsers/SMFile.js',
      'js/parsers/FileTools.js',
      'js/parsers/LocalSMParser.js',
      'js/parsers/ExternalSMParser.js',
      
      // Addons
      'js/addons/AddonManager.js',
      
      // Game states
      'js/game/states/Boot.js',
      'js/game/states/Load.js',
      'js/game/states/LoadPlatform.js',
      'js/game/states/LoadAddons.js',
      'js/game/states/LoadLocalSongs.js',
      'js/game/states/LoadExternalSongs.js',
      'js/game/states/LoadSongFolder.js',
      'js/game/states/LoadExternalSongFile.js',
      'js/game/states/Title.js',
      'js/game/states/MainMenu.js',
      'js/game/states/Addons.js',
      'js/game/states/Settings.js',
      'js/game/states/ChartModifiers.js',
      'js/game/states/Keybindings.js',
      'js/game/states/AviSettings.js',
      'js/game/states/TouchSettings.js',
      'js/game/states/FileSelect.js',
      'js/game/states/SongSelect.js',
      'js/game/states/DecodeAvi.js',
      'js/game/states/SongStats.js',
      'js/game/states/CharacterSelect.js',
      'js/game/states/AchievementsMenu.js',
      'js/game/states/StatsMenu.js',
      'js/game/states/Play.js',
      'js/game/states/PlayMulti.js',
      'js/game/states/Results.js',
      'js/game/states/ResultsMulti.js',
      'js/game/states/Playlists.js',
      'js/game/states/Jukebox.js',
      'js/game/states/Editor.js',
      'js/game/states/Credits.js',
      'js/game/states/ErrorScreen.js',

      // Note Rendering and Player
      'js/game/player/ChartRenderer.js',
      'js/game/player/AudioTemperatureMeter.js',
      'js/game/player/Player.js',
      'js/game/player/FirstPlayer.js',
      'js/game/player/SecondPlayer.js',
    ];
  }
  
  log(text, type, error = null) {
    // Colors
    const red = '\x1b[31m';
    const yellow = '\x1b[33m';
    const green = '\x1b[32m';
    const cyan = '\x1b[36m';
    const reset = '\x1b[0m';

    let color = type ? {
      info: cyan,
      success: green,
      warning: yellow,
      error: red
    }[type] : "";
    
    let icon = type ? {
      info: '→ ',
      success: '✓ ',
      warning: '⚠ ',
      error: '✗ '
    }[type] : "";
    
    if (type === 'error' && error) {
      console.error(color + icon + text + reset, error);
    } else {
      console.log(color + icon + text + reset);
    }
  }

  getPackageInfo() {
    try {
      const packagePath = './package.json';
      if (fs.existsSync(packagePath)) {
        return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      }
    } catch (error) {
      this.log('Could not read package.json, using defaults', 'warning');
    }
    
    return {
      version: '1.0.0',
      name: 'padmaniacs'
    };
  }

  getLicenseHeader(platform) {
    return `/**
 * PadManiacs Rhythm Game
 * Copyright ${this.copyright}
 * Licensed under the GNU GPL v3+ with attribution (see LICENSE file for full terms)
 * 
 * Source: https://github.com/RetoraDev/PadManiacs
 * Version: ${this.versionName}
 * Build: ${new Date().toLocaleString()}
 * Platform: ${this.getPlatformDisplayName(platform)}
 * Debug: ${this.config.flags.debug}
 * Minified: ${this.config.flags.minify}
 */`;
  }

  getPlatformDisplayName(platform) {
    const platformMap = {
      'none': 'Development',
      'web': 'Web',
      'cordova': 'Android (Cordova)',
      'neutralino': 'Desktop (Neutralino.js)',
      'all': 'All Platforms'
    };
    return platformMap[platform] || platform;
  }
  
  setInfo() {
    this.packageInfo = this.getPackageInfo();
    this.versionName = `v${this.packageInfo.version + (this.config.flags.platform === 'none' || this.config.flags.debug ? " dev" : "")}`;
    this.copyright = `(C) RETORA ${new Date().getFullYear()}`;
  }

  parseFlags(args) {
    if (!args) args = process.argv.slice(2);
    args.forEach(arg => {
      if (arg === '--debug') this.config.flags.debug = true;
      if (arg === '--dev') this.config.flags.platform = 'none';
      if (arg === '--none') this.config.flags.platform = 'none';
      if (arg === '--cordova') this.config.flags.platform = 'cordova';
      if (arg === '--zipalign') this.config.flags.zipalign = true;
      if (arg === '--neutralino') this.config.flags.platform = 'neutralino';
      if (arg === '--web') this.config.flags.platform = 'web';
      if (arg === '--all') this.config.flags.platform = 'all';
      if (arg === '--minify') this.config.flags.minify = true;
      if (arg === '--no-pack' || arg === '--no-pack=' || arg === '--nopack') this.config.flags.noPack = true;
      if (arg === '--no-web-base') this.config.flags.noWebBase = true;
    });
  }

  ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  readFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      this.log(`Could not read ${filePath}`, 'warning');
      return '';
    }
  }

  processFileContent(content, filePath, platform) {
    // Dynamic replacements based on file type
    if (filePath === 'js/core/constants.js') {
      // Replace version with package.json version
      content = content
        .replace(
          'const COPYRIGHT = "%";',
          `const COPYRIGHT = "${this.copyright}";`
        )
        .replace(
          'const VERSION = "%";',
          `const VERSION = "${this.versionName}";`
        )
        .replace(
          'window.DEBUG = %;',
          `window.DEBUG = ${this.config.flags.debug};`
        );
    } else if (filePath === 'js/core/environment.js') {
      // Replace environment based on build platform
      const envMap = {
        'none': 'ENVIRONMENT.UNKNOWN',
        'web': 'ENVIRONMENT.WEB',
        'cordova': 'ENVIRONMENT.CORDOVA', 
        'neutralino': 'ENVIRONMENT.NEUTRALINO'
      };
      const currentEnv = envMap[platform] || 'ENVIRONMENT.WEB';
      content = content.replace(
        'const CURRENT_ENVIRONMENT = %;',
        `const CURRENT_ENVIRONMENT = ${currentEnv};`
      );
    }
    
    // Add file header comment for debugging
    if (this.config.flags.debug) {
      content = `\n\n// ======== ${filePath} ========\n` + content;
    }
    
    return content;
  }

  async minifyCode(code, platform) {
    if (!this.config.flags.minify) {
      return code;
    }

    try {
      // Import terser from lib folder
      const terser = require(this.config.libDir + '/terser.js');

      const minified = await terser.minify(code, {
        mangle: {
          toplevel: false,
          properties: false,
          keep_fnames: false,
          keep_classnames: false
        }
      });
      
      if (minified.error) {
        this.log('Minification error:', 'warning', minified.error);
        return this.getLicenseHeader(platform) + '\n\n' + code;
      }
      
      return this.getLicenseHeader(platform) + '\n\n' + minified.code;
    } catch (error) {
      this.log('Minification failed, using original code:', 'warning', error.message);
      return this.getLicenseHeader(platform) + '\n\n' + code;
    }
  }

  async concatenateFiles(platform) {
    this.log(`Concatenating JavaScript files for ${this.getPlatformDisplayName(platform)}...`, 'info');
    
    let output = '';
    
    // Process all files in order
    for (const relativePath of this.fileOrder) {
      let fullPath;
      
      // Check if file is in lib or src
      if (relativePath.startsWith('lib/')) {
        fullPath = path.join(this.config.libDir, relativePath.replace('lib/', ''));
      } else {
        fullPath = path.join(this.config.srcDir, relativePath);
      }
      
      if (fs.existsSync(fullPath)) {
        const content = this.readFile(fullPath);
        const processedContent = this.processFileContent(content, relativePath, platform);
        const newLine = processedContent.endsWith('\n') ? '\n' : '\n\n';
        output += processedContent + newLine;
        this.log(`Processed ${relativePath}`, 'success');
      } else {
        this.log(`File not found: ${fullPath}`, 'warning');
      }
    }
    
    if (this.config.flags.minify) {
      this.log('Minifying code...', 'info');
      return await this.minifyCode(output, platform);
    } else {
      return this.getLicenseHeader(platform) + '\n\n' + output;
    }
  }

  copyAssets() {
    this.log('Copying assets...', 'info');
    
    const assetsSrc = path.join(this.config.srcDir, 'assets');
    const assetsDest = path.join(this.config.distDir, 'assets');
    
    if (fs.existsSync(assetsSrc)) {
      this.copyDir(assetsSrc, assetsDest);
      this.log('Assets copied', 'success');
    }
  }

  copyCSS() {
    this.log('Copying CSS...', 'info');
    
    const cssSrc = path.join(this.config.srcDir, 'css');
    const cssDest = path.join(this.config.distDir, 'css');
    
    if (fs.existsSync(cssSrc)) {
      this.copyDir(cssSrc, cssDest);
      this.log('CSS copied', 'success');
    }
  }

  copyLibFiles(platform, destDir = this.config.distDir) {
    this.log('Copying lib files...', 'info');
    
    const libDest = path.join(destDir, 'lib');
    this.ensureDir(libDest);
    
    // Copy the Neutralino client library when targeting the desktop build
    if (platform === 'neutralino') {
      const nlClientSrc = path.join(this.config.srcDir, 'static/neutralino/resources/js/neutralino.js');
      const nlClientDest = path.join(libDest, 'neutralino.js');
      if (fs.existsSync(nlClientSrc)) {
        fs.copyFileSync(nlClientSrc, nlClientDest);
        this.log('neutralino.js copied to lib/', 'success');
      }
    }
    
    // Copy Phaser to lib folder
    const phaserLib = this.config.flags.debug ? 'phaser.js' : 'phaser.min.js';
    const phaserSrc = path.join(this.config.libDir, phaserLib);
    const phaserDest = path.join(libDest, phaserLib);
    if (fs.existsSync(phaserSrc)) {
      fs.copyFileSync(phaserSrc, phaserDest);
      this.log(`${phaserLib} copied to lib/`, 'success');
    }
    
    // Copy eruda.js to lib folder
    const erudaSrc = path.join(this.config.libDir, 'eruda.js');
    const erudaDest = path.join(libDest, 'eruda.js');
    if (fs.existsSync(erudaSrc)) {
      fs.copyFileSync(erudaSrc, erudaDest);
      this.log('eruda.js copied to lib/', 'success');
    }
    
    // Copy jszip.js
    const jszipSrc = path.join(this.config.libDir, 'jszip.js');
    const jszipDest = path.join(libDest, 'jszip.js');
    if (fs.existsSync(jszipSrc)) {
      fs.copyFileSync(jszipSrc, jszipDest);
      this.log('jszip.js copied to lib/', 'success');
    }
    
    // Copy FFmpeg.wasm lite (AVI bgvideo decoding) to lib/ffmpeg
    const ffmpegSrc = path.join(this.config.libDir, 'ffmpeg');
    const ffmpegDest = path.join(libDest, 'ffmpeg');
    if (fs.existsSync(ffmpegSrc)) {
      this.copyDir(ffmpegSrc, ffmpegDest);
      this.log('ffmpeg copied to lib/ffmpeg', 'success');
    }
  }

  copyStaticFiles() {
    this.log('Copying static files...', 'info');
    
    // Copy favicon.png from src
    const faviconPngSrc = path.join(this.config.srcDir, 'favicon.png');
    const faviconPngDest = path.join(this.config.distDir, 'favicon.png');
    if (fs.existsSync(faviconPngSrc)) {
      fs.copyFileSync(faviconPngSrc, faviconPngDest);
      this.log('favicon.png copied', 'success');
    }
    
    // Copy favicon.ico from src
    const faviconIcoSrc = path.join(this.config.srcDir, 'favicon.ico');
    const faviconIcoDest = path.join(this.config.distDir, 'favicon.ico');
    if (fs.existsSync(faviconIcoSrc)) {
      fs.copyFileSync(faviconIcoSrc, faviconIcoDest);
      this.log('favicon.ico copied', 'success');
    }
    
    // Copy icon.png from src (para PWA y NW.js)
    const iconPngSrc = path.join(this.config.srcDir, 'icon.png');
    const iconPngDest = path.join(this.config.distDir, 'icon.png');
    if (fs.existsSync(iconPngSrc)) {
      fs.copyFileSync(iconPngSrc, iconPngDest);
      this.log('icon.png copied', 'success');
    }
    
    // También copiar a la carpeta icons/ si existe para PWA
    const iconsDestDir = path.join(this.config.distDir, 'icons');
    if (fs.existsSync(iconPngSrc) && !fs.existsSync(iconPngDest)) {
      this.ensureDir(iconsDestDir);
      fs.copyFileSync(iconPngSrc, path.join(iconsDestDir, 'icon-192.png'));
      fs.copyFileSync(iconPngSrc, path.join(iconsDestDir, 'icon-512.png'));
      this.log('icon.png copied to icons/ for PWA', 'success');
    }
    
    // Fallback: copy root favicon if exists and src ones don't
    const rootFaviconPng = './favicon.png';
    if (fs.existsSync(rootFaviconPng) && !fs.existsSync(faviconPngDest)) {
      fs.copyFileSync(rootFaviconPng, faviconPngDest);
      this.log('fallback favicon.png copied from root', 'success');
    }
    
    const rootFaviconIco = './favicon.ico';
    if (fs.existsSync(rootFaviconIco) && !fs.existsSync(faviconIcoDest)) {
      fs.copyFileSync(rootFaviconIco, faviconIcoDest);
      this.log('fallback favicon.ico copied from root', 'success');
    }
    
    const rootIconPng = './icon.png';
    if (fs.existsSync(rootIconPng) && !fs.existsSync(iconPngDest)) {
      fs.copyFileSync(rootIconPng, iconPngDest);
      this.log('fallback icon.png copied from root', 'success');
    }
  }
  
  processIndexHTML(platform, destDir = this.config.distDir) {
    this.log(`Processing index.html for ${this.getPlatformDisplayName(platform)}...`, 'info');
    
    const htmlSrc = path.join(this.config.srcDir, 'index.html');
    const htmlDest = path.join(destDir, 'index.html');
    
    if (fs.existsSync(htmlSrc)) {
      let htmlContent = fs.readFileSync(htmlSrc, 'utf8');
      
      // Remove ALL existing script tags and replace with single game.js
      htmlContent = htmlContent.replace(/<script src="[^"]*"><\/script>\s*/g, '');
      
      // Build the proper script tags in correct order
      let scriptTags = '';
      
      // Neutralino's server prepends the globals (NL_TOKEN, NL_PORT, ...) to
      // the response of the script whose path ends in "neutralino.js". With
      // tokenSecurity "one-time" the token is returned ONLY on the first such
      // request, so this script must be the single one that fetches it: do NOT
      // also load __neutralino_globals.js, or the client gets an empty token
      // (connectToken=undefined) and dies with NE_CL_IVCTOKN.
      // Neutralino.init() is called by LoadPlatform once the game boots.
      if (platform === 'neutralino') {
        scriptTags += '  <script src="./lib/neutralino.js"></script>\n';
      }

      // Add phaser from lib (always first)
      scriptTags += `  <script src="./lib/${this.config.flags.debug ? 'phaser.js' : 'phaser.min.js'}"></script>\n`;
      
      // Add eruda too and jszip
      scriptTags += '  <script src="./lib/jszip.js"></script>\n';
      scriptTags += '  <script src="./lib/eruda.js"></script>\n';
      
      // Add the concatenated game.js
      scriptTags += '  <script src="./js/game.js"></script>\n';
      
      // Replace the head section to include scripts
      htmlContent = htmlContent.replace(
        /(<head>[\s\S]*?)(<\/head>)/,
        `$1\n${scriptTags}$2`
      );
      
      // Add debug initialization script if needed
      if (this.config.flags.debug) {
        const debugScript = this.getDebugScript();
        
        // Insert before closing body tag
        htmlContent = htmlContent.replace('</body>', debugScript + '\n</body>');
      }
      
      fs.writeFileSync(htmlDest, htmlContent);
      this.log('index.html processed', 'success');
    } else {
      // Create minimal index.html if source doesn't exist
      const minimalHTML = getMinimalIndexHtml();
      fs.writeFileSync(htmlDest, minimalHTML);
      this.log('Created minimal index.html', 'success');
    }
  }
  
  getDebugScript(forceDebug) {
    return `
  <script>
    ${forceDebug ? `window.DEBUG = true; // Forced debug mode` : `
    // Auto-enable debug mode if URL has debug parameter
    if (location.search.includes('debug')) {
      window.DEBUG = true;
    }`}
    
    // Debug initialization
    if (typeof window.eruda !== 'undefined' && (window.DEBUG || location.search.includes('debug'))) {
      eruda.init({
        tool: ['console', 'elements', 'resources', 'network', 'snippets']
      });
      
      const snippets = eruda.get('snippets');
      snippets.clear();
      
      // Debug utilities
      snippets.add("Start Recording", () => {
        if (window.game && game.recorder) {
          game.recorder.start();
        } else {
          console.warn('Game not initialized yet');
        }
      }, "Start recording the game");
      
      snippets.add("Stop Recording", () => {
        if (window.game && game.recorder) {
          game.recorder.stop();
        }
      }, "Stop recording and save video");
      
      snippets.add("Record Next Game", () => {
        window.recordNextGame = true;
        console.log('Recording will start on next game');
      }, "Start recording next song, stop when it ends");
      
      snippets.add("Take Screenshot", () => {
        if (window.game && game.recorder) {
          game.recorder.screenshot();
        }
      }, "Take a screenshot");
      
      snippets.add("Auto Screenshots", () => {
        const screenshot = () => {
          if (window.game && game.recorder) {
            game.recorder.screenshot();
            setTimeout(screenshot, Phaser.Math.between(5000, 20000));
          }
        };
        screenshot();
      }, "Take screenshots randomly every 5-20 seconds");
      
      snippets.add("Add FPS Counter", () => {
        if (window.game) {
          addFpsText();
        }
      }, "Displays performance information");

      snippets.add("Toggle UNLOCK_ALL_CLOTHES", () => {
        window.UNLOCK_ALL_CLOTHES = !window.UNLOCK_ALL_CLOTHES;
        notifications.show(window.UNLOCK_ALL_CLOTHES ? "All clothes unlocked!" : "Unlock status back to normal", 1000);
      }, "Toggles the state of temporary clothes unlock");
      
      snippets.add("Reload Game", () => {
        location.reload();
      }, "Reload the game");
      
      snippets.add("Destroy Eruda", () => {
        eruda.destroy();
      }, "Remove debug panel");
      
      if (typeof window.Neutralino != 'undefined') {
        console._log = console.log;
        console.log = function(...args) {
          console._log(...args);
          window.Neutralino.debug.log(args.join(" "), "INFO");
        };
        
        console._warn = console.warn;
        console.warn = function(...args) {
          console._warn(...args);
          window.Neutralino.debug.log(args.join(" "), "WARNING");
        };
        
        window.onerror = function(details, file, line) {
	        var path = file.split("/");
		      var filename = path[path.length-1];
		      var message = path + "<br>Line " + line + " of " + file + "(" + filename + ")";
		      window.Neutralino.debug.log(message, "ERROR");
        };
      }
      
      console.log('PadManiacs Debug Mode Active');
    }
  </script>`;
  }
  
  getMinimalIndexHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>PadManiacs</title>
  <script src="./lib/${this.config.flags.debug ? 'phaser.js' : 'phaser.min.js'}"></script>
  <script src="./js/game.js"></script>
  <link rel="stylesheet" href="./css/style.css">
  <link rel="icon" href="./favicon.png">
</head>
<body>
  <div id="game"></div>
  <div id="controller" style="display: none;">
    <div id="controller_dpad">
      <div id="controller_left"></div>
      <div id="controller_right"></div>
      <div id="controller_up"></div>
      <div id="controller_down"></div>
    </div>
    <div id="controller_rhythm_pad">
      <div id="controller_rhythm_left" class="capsuleBtn rhythm"></div>
      <div id="controller_rhythm_down" class="capsuleBtn rhythm"></div>
      <div id="controller_rhythm_up" class="capsuleBtn rhythm"></div>
      <div id="controller_rhythm_right" class="capsuleBtn rhythm"></div>
    </div>
    <div id="controller_select" class="capsuleBtn">Select</div>
    <div id="controller_start" class="capsuleBtn">Start</div>
    <div id="controller_b" class="roundBtn">B</div>
    <div id="controller_a" class="roundBtn">A</div>
  </div>
  <div id="debug"></div>
</body>
</html>`;
  }

  copyDir(src, dest, exclude = []) {
    this.ensureDir(dest);
    
    const items = fs.readdirSync(src);
    
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      // Check if item should be excluded using wildcard matching
      let shouldExclude = false;
      
      for (const pattern of exclude) {
        if (pattern.includes('*')) {
          // Convert wildcard pattern to regex
          const regexPattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
          const regex = new RegExp(`^${regexPattern}$`);
          
          if (regex.test(item)) {
            shouldExclude = true;
            break;
          }
        } else {
          // Exact match
          if (item === pattern) {
            shouldExclude = true;
            break;
          }
        }
      }
      
      if (!shouldExclude) {
        if (fs.statSync(srcPath).isDirectory()) {
          this.copyDir(srcPath, destPath, exclude);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    });
  }

  hasZip() {
    try {
      execSync('zip --help', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  has7Zip() {
    try {
      execSync('7z --help', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  hasNeu() {
    try {
      execSync('neu --help', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  hasApkSigner() {
    try {
      execSync('apksigner --help', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
  
  hasZipAlign() {
    try {
      exec('zipalign', { stdio: 'ignore' });
      return true;
    } catch (err) {
      return false;
    }
  }

  createZipArchive(sourceDir, outputFile) {
    if (this.config.flags.noPack) {
      this.log(`Skipping zip (--no-pack): ${sourceDir}`, 'info');
      return true;
    }
    this.log(`Creating zip: ${sourceDir} → ${outputFile}`, 'info');
    try {
      if (this.hasZip()) {
        execSync(`zip -r -9 "${outputFile}" .`, { cwd: sourceDir, stdio: 'inherit' });
        this.log(`Created ${outputFile}`, 'success');
        return true;
      } else {
        this.log('zip command not available', 'warning');
        return false;
      }
    } catch (error) {
      this.log(`Failed to create zip: ${error.message}`, 'warning');
      return false;
    }
  }

  create7zArchive(sourceDir, outputFile) {
    if (this.config.flags.noPack) {
      this.log(`Skipping 7z archive (--no-pack): ${sourceDir}`, 'info');
      return true;
    }
    this.log(`Creating 7z archive: ${sourceDir} → ${outputFile}`, 'info');
    try {
      if (this.has7Zip()) {
        execSync(`7z a -t7z -m0=lzma2 -mx=9 -mfb=64 -md=32m -ms=on -mmt=on "${outputFile}" .`, { 
          cwd: sourceDir, 
          stdio: 'inherit' 
        });
        this.log(`Created ${outputFile}`, 'success');
        return true;
      } else {
        this.log('7z command not available', 'warning');
        return false;
      }
    } catch (error) {
      this.log(`Failed to create 7z archive: ${error.message}`, 'warning');
      return false;
    }
  }

  zipAlignAndroidAPK(apkPath, outputPath) {
    this.log(`Applying Zip alignment: ${apkPath} → ${outputPath}`, 'info');
    
    try {
      if (this.hasZipAlign()) {
        execSync(`zipalign -f '4' ${apkPath} ${outputPath}`, {
          stdio: 'inherit'
        });
        this.log(`Zip alignment success: ${outputPath}`, 'success');
        return true;
      } else {
        this.log('zipalign not available. Please install Android SDK Build Tools.', 'error');
        return false;
      }
    } catch (error) {
      this.log(`Failed to zipalign APK: ${error.message}`, 'error');
      return false;
    }
  }
  
  signAndroidAPK(apkPath, outputPath) {
    this.log(`Signing Android APK: ${apkPath} → ${outputPath}`, 'info');
    
    const signkeyPath = path.join(this.config.srcDir, 'static/android_app/signkey.keystore');
    if (!fs.existsSync(signkeyPath)) {
      this.log('Signkey not found at: ' + signkeyPath, 'error');
      return false;
    }

    try {
      if (this.hasApkSigner()) {
        execSync(`apksigner sign --ks "${signkeyPath}" --ks-pass pass:ProjectHarmony --ks-key-alias retora --out "${outputPath}" "${apkPath}"`, {
          stdio: 'inherit'
        });
        this.log(`Signed APK: ${outputPath}`, 'success');
        return true;
      } else {
        this.log('apksigner not available. Please install Android SDK Build Tools.', 'error');
        return false;
      }
    } catch (error) {
      this.log(`Failed to sign APK: ${error.message}`, 'error');
      return false;
    }
  }

  async buildWeb() {
    this.log('Building web platform...', 'info');

    if (this.config.flags.noPack) {
      this.log('Skipping web packaging (--no-pack); dist/ contains the web build', 'info');
      return;
    }

    // Create temporary web build directory
    const tempWebDir = path.join(this.config.distDir, 'temp', 'web');
    this.ensureDir(tempWebDir);
    
    // Copy only web files to temp directory (no cordova, no platform builds)
    this.copyDir(this.config.distDir, tempWebDir, ['www.zip', 'padmaniacs-*.zip', '*.apk', '*.apk.idsig', 'temp', 'cordova']);
    
    // Create www.zip from temp web build
    const webZipPath = '../../www.zip';
    if (this.createZipArchive(tempWebDir, webZipPath)) {
      this.log('Web platform build complete', 'success');
    } else {
      this.log('Web platform build failed - zip command unavailable', 'warning');
    }
    
    // Clean up temp directory
    fs.rmSync(path.join(this.config.distDir, 'temp'), { recursive: true });
  }
  
  async buildNeutralino() {
    this.log('Building Desktop (Neutralino.js) platform...', 'info');

    const neutralinoStatic = path.join(this.config.srcDir, 'static/neutralino');
    if (!fs.existsSync(neutralinoStatic)) {
      this.log('Neutralino static files not found at: ' + neutralinoStatic, 'warning');
      return;
    }

    // Neutralino binaries are committed read-only on some filesystems and the
    // shared-storage fuse mount drops the +x bit, so always stage into the
    // writable temp dir and set the executable bit there.
    const tempRoot = path.join(require('os').tmpdir(), `padmaniacs-neutralino-${process.pid}`);
    const tempNlDir = path.join(tempRoot, 'neutralino');
    this.ensureDir(tempNlDir);

    try {
      // Copy Neutralino binaries + client library
      this.copyDir(path.join(neutralinoStatic, 'bin'), path.join(tempNlDir, 'bin'));
      this.copyDir(path.join(neutralinoStatic, 'resources'), path.join(tempNlDir, 'resources'));

      // Restore executable bits on unix binaries
      const binDir = path.join(tempNlDir, 'bin');
      fs.readdirSync(binDir).forEach(file => {
        if (file.startsWith('neutralino-linux') || file.startsWith('neutralino-mac')) {
          try { fs.chmodSync(path.join(binDir, file), 0o755); } catch (e) {}
        }
      });

      // Copy the Neutralino project config template
      const configTemplate = path.join(neutralinoStatic, 'neutralino.config.json');
      const configPath = path.join(tempNlDir, 'neutralino.config.json');
      if (fs.existsSync(configTemplate)) {
        fs.copyFileSync(configTemplate, configPath);
      }

      // Patch the config version placeholder
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const updatedConfig = configContent
          .replace('"version": "%"', `"version": "${this.packageInfo.version}"`)
          .replace('"enableInspector": %', `"enableInspector": ${this.config.flags.debug}`);
        fs.writeFileSync(configPath, updatedConfig);
        this.log(`Set Neutralino version to: ${this.packageInfo.version}`, 'success');
      }

      // Create platform-specific game.js (Neutralino environment)
      const resourcesRoot = path.join(tempNlDir, 'resources');
      const jsDest = path.join(resourcesRoot, 'js');
      this.ensureDir(jsDest);
      const neutralinoGameJS = await this.concatenateFiles('neutralino');
      fs.writeFileSync(path.join(jsDest, 'game.js'), neutralinoGameJS);

      // Copy the already-processed web assets into the Neutralino resources dir
      this.copyDir(this.config.distDir, resourcesRoot,
        ['www.zip', 'padmaniacs-*.zip', 'padmaniacs-*.apk', 'padmaniacs-*.apk.idsig', 'temp', 'cordova', 'js', 'lib', 'index.html']);

      // Copy shared libs (phaser, jszip, eruda, ffmpeg, neutralino client)
      this.copyDir(path.join(this.config.distDir, 'lib'), path.join(resourcesRoot, 'lib'));
      this.copyLibFiles('neutralino', resourcesRoot);

      // Generate the Neutralino-specific index.html (adds the neutralino.js
      // client + Neutralino.init() before the game). dist/ stays web, so this
      // must be produced here rather than copied from dist.
      this.processIndexHTML('neutralino', resourcesRoot);

      // Neutralino keeps app metadata + favicon at the resource root
      const iconSrc = path.join(this.config.srcDir, 'icon.png');
      const iconsDir = path.join(tempNlDir, 'resources', 'icons');
      this.ensureDir(iconsDir);
      if (fs.existsSync(iconSrc)) {
        fs.copyFileSync(iconSrc, path.join(iconsDir, 'appIcon.png'));
      }

      // Split the built resources.neu per platform, one zip each.
      // `neu build` (or an equivalent pack step) is run by the caller; here we
      // simply package the staged neutralino project plus resources.neu.
      if (this.config.flags.noPack) {
        // Keep an exploded, inspectable copy in dist/ instead of a resources.neu
        // bundle; skip `neu build` and the per-platform zips entirely.
        const explodedDir = path.join(this.config.distDir, 'neutralino');
        this.copyDir(tempNlDir, explodedDir);
        this.log('Skipping Neutralino packaging (--no-pack); staged to dist/neutralino/', 'info');
      } else {
        this.packageNeutralinoPlatforms(tempNlDir);
      }

      this.log('Neutralino platform build complete', 'success');
    } catch (error) {
      this.log(`Neutralino build failed: ${error.message}`, 'error', error);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }

  /**
   * Generates resources.neu and produces one distributable zip per platform.
   * Neutralino's resources.neu is a platform-independent ASAR-style bundle, so a
   * single bundle is shared by every binary; only the executable differs.
   * @param {string} tempNlDir - Staged Neutralino project directory
   */
  packageNeutralinoPlatforms(tempNlDir) {
    // Bundle the resources with the Neutralino CLI (writes resources.neu and
    // patches windows executables). Requires the `neu` CLI on PATH.
    let resourcesNeu = path.join(tempNlDir, 'resources.neu');
    try {
      execSync('neu build', { cwd: tempNlDir, stdio: 'inherit' });
    } catch (error) {
      this.log('Neu CLI failed; attempting to reuse an existing resources.neu', 'warning');
    }

    // Locate resources.neu (neu build writes it under the project's dist dir)
    if (!fs.existsSync(resourcesNeu)) {
      resourcesNeu = this.findFile(tempNlDir, 'resources.neu');
    }
    if (!resourcesNeu) {
      this.log('Could not locate resources.neu; aborting platform packaging', 'error');
      return;
    }

    const platforms = [
      { bin: 'neutralino-linux_arm64',     out: `padmaniacs-v${this.packageInfo.version}-neutralino-linux-arm64.zip` },
      { bin: 'neutralino-linux_armhf',     out: `padmaniacs-v${this.packageInfo.version}-neutralino-linux-armhf.zip` },
      { bin: 'neutralino-linux_x64',       out: `padmaniacs-v${this.packageInfo.version}-neutralino-linux-x64.zip` },
      { bin: 'neutralino-win_x64.exe',     out: `padmaniacs-v${this.packageInfo.version}-neutralino-win-x64.zip` },
      { bin: 'neutralino-mac_x64',         out: `padmaniacs-v${this.packageInfo.version}-neutralino-mac-x64.zip` },
      { bin: 'neutralino-mac_arm64',       out: `padmaniacs-v${this.packageInfo.version}-neutralino-mac-arm64.zip` },
      { bin: 'neutralino-mac_universal',   out: `padmaniacs-v${this.packageInfo.version}-neutralino-mac-universal.zip` },
    ];

    const binDir = path.join(tempNlDir, 'bin');
    const neuDistDir = path.join(tempNlDir, 'dist');
    const configPath = path.join(tempNlDir, 'neutralino.config.json');
    const binaryName = this.packageInfo.name || 'padmaniacs';

    for (const { bin, out } of platforms) {
      // Prefer the renamed + patched binaries that `neu build` emits, falling
      // back to the raw staged binaries when the CLI was unavailable.
      const neuName = bin.replace(/^neutralino-/, binaryName + '-');
      const neuCandidate = neuDistDir ? this.findFile(neuDistDir, neuName) : null;
      const sourceBin = neuCandidate || path.join(binDir, bin);
      if (!sourceBin || !fs.existsSync(sourceBin)) {
        this.log(`Skipping missing binary: ${bin}`, 'warning');
        continue;
      }

      // Build a per-platform staging dir: <binaryName><ext>, resources.neu, config
      const stageDir = path.join(tempNlDir, 'stage', out.replace(/\.zip$/, ''));
      this.ensureDir(stageDir);

      const isExe = bin.endsWith('.exe');
      const targetBin = path.join(stageDir, binaryName + (isExe ? '.exe' : ''));
      fs.copyFileSync(sourceBin, targetBin);
      if (!isExe) {
        try { fs.chmodSync(targetBin, 0o755); } catch (e) {}
      }
      fs.copyFileSync(resourcesNeu, path.join(stageDir, 'resources.neu'));
      fs.copyFileSync(configPath, path.join(stageDir, 'neutralino.config.json'));

      const zipPath = path.resolve(this.config.distDir, out);
      this.createZipArchive(stageDir, zipPath);

      fs.rmSync(stageDir, { recursive: true, force: true });
    }
  }

  /**
   * Recursively finds the first file with the given name under a directory.
   * @param {string} dir - Directory to search
   * @param {string} name - File name to look for
   * @returns {string|null} The full path or null
   */
  findFile(dir, name) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = this.findFile(full, name);
        if (found) return found;
      } else if (entry.name === name) {
        return full;
      }
    }
    return null;
  }
  
  async buildAndroid() {
    this.log('Building Android platform...', 'info');
    
    const androidStatic = path.join(this.config.srcDir, 'static/android_app');
    if (fs.existsSync(androidStatic)) {
      // Create temporary Android build directory
      const tempAndroidDir = path.join(this.config.distDir, 'temp', 'android');
      this.ensureDir(tempAndroidDir);
      
      // Copy Android app structure to temp directory
      this.copyDir(androidStatic, tempAndroidDir, [".placeholder", 'signkey.keystore']);
      
      // Create platform-specific game.js for Android
      const wwwDest = path.join(tempAndroidDir, 'assets/www');
      this.ensureDir(wwwDest);
      const jsDest = path.join(wwwDest, 'js');
      this.ensureDir(jsDest);
      const androidGameJS = await this.concatenateFiles('cordova');
      fs.writeFileSync(path.join(jsDest, 'game.js'), androidGameJS);
      
      // Copy other web files to Android www folder
      this.copyDir(this.config.distDir, wwwDest, ['www.zip', 'padmaniacs-*.zip', '*.apk', '*.apk.idsig', 'temp', 'js']);
      
      // Copy cordova files specifically for Android
      const cordovaStatic = path.join(this.config.srcDir, 'static/cordova');
      const cordovaDest = path.join(wwwDest, 'cordova');
      if (fs.existsSync(cordovaStatic)) {
        this.copyDir(cordovaStatic, cordovaDest);
        this.log('Cordova files copied for Android build', 'success');
      }
      
      // First create unsigned APK using zip from temp directory
      const unsignedUnalignedApkName = `padmaniacs-v${this.packageInfo.version}-android-unsigned-unaligned.apk`;
      const unsignedUnalignedApkPath = path.join(this.config.distDir, unsignedUnalignedApkName);

      if (this.config.flags.noPack) {
        // Keep an exploded, inspectable Android project in dist/android/
        // instead of producing (and signing) an APK.
        const explodedDir = path.join(this.config.distDir, 'android');
        this.copyDir(tempAndroidDir, explodedDir);
        fs.rmSync(path.join(this.config.distDir, 'temp'), { recursive: true });
        this.log('Skipping Android packaging (--no-pack); staged to dist/android/', 'info');
        this.log('Android platform build complete', 'success');
        return;
      }

      if (this.createZipArchive(tempAndroidDir, '../../' + unsignedUnalignedApkName)) {
        // Apply zipalign
        let unsignedApkName = `padmaniacs-v${this.packageInfo.version}-android-unsigned.apk`;
        let unsignedApkPath  = path.join(this.config.distDir, unsignedApkName);
        
        if (this.config.flags.zipalign) {
          if (this.zipAlignAndroidAPK(unsignedUnalignedApkPath, unsignedApkPath)) {
            // Clean up build artifacts
            fs.unlinkSync(unsignedUnalignedApkPath);
          } else {
            this.log('Could not apply zipalign to APK', 'warning');
          }
        } else {
          unsignedApkName = unsignedUnalignedApkName;
          unsignedApkPath = unsignedUnalignedApkPath;
        }
        
        // Sign the APK
        const signedApkName = `padmaniacs-v${this.packageInfo.version}-android.apk`;
        const signedApkPath = path.join(this.config.distDir, signedApkName);

        if (this.signAndroidAPK(unsignedApkPath, signedApkPath)) {
          // Clean up build artifacts
          fs.unlinkSync(unsignedApkPath);
        } else {
          this.log('Could not apply signature to APK', 'warning');
        }
        
        this.log('Android platform build complete', 'success');
      } else {
        this.log('Android platform build failed - zip command unavailable', 'warning');
      }
      
      // Clean up temp directory
      fs.rmSync(path.join(this.config.distDir, 'temp'), { recursive: true });
    } else {
      this.log('Android static files not found at: ' + androidStatic, 'warning');
    }
  }
  
  async buildNWJS() {
    this.log('Building Desktop (NW.js) platform...', 'info');

    const nwjsStatic = path.join(this.config.srcDir, 'static/nw');
    if (!fs.existsSync(nwjsStatic)) {
      this.log('NW.js static files not found at: ' + nwjsStatic, 'warning');
      this.log('Download NW.js v0.88.0 and place files in src/static/nw/ (keep locales/, www/, padmaniacs.exe, package.json)', 'warning');
      return;
    }

    const distDir = this.config.distDir;
    const nwDir = path.join(distDir, 'nwjs');
    this.ensureDir(nwDir);

    try {
      this.copyDir(nwjsStatic, nwDir, ['.gitkeep']);
      const wwwDir = path.join(nwDir, 'www');
      this.ensureDir(wwwDir);
      ['js', 'lib', 'index.html', 'css', 'assets', 'resources'].forEach(item => {
        const srcPath = path.join(distDir, item);
        const dstPath = path.join(wwwDir, item);
        if (fs.existsSync(srcPath)) {
          if (fs.statSync(srcPath).isDirectory()) {
            this.copyDir(srcPath, dstPath);
          } else {
            this.ensureDir(path.dirname(dstPath));
            fs.copyFileSync(srcPath, dstPath);
          }
        }
      });

      if (fs.existsSync(path.join(nwjsStatic, 'package.json'))) {
        const pkgContent = fs.readFileSync(path.join(nwjsStatic, 'package.json'), 'utf8');
        const updatedPkg = pkgContent.replace('"version": "1.1.0"', `"version": "${this.packageInfo.version}"`);
        fs.writeFileSync(path.join(nwDir, 'package.json'), updatedPkg);
      }

      if (fs.existsSync(path.join(nwjsStatic, 'padmaniacs.exe'))) {
        fs.copyFileSync(path.join(nwjsStatic, 'padmaniacs.exe'), path.join(nwDir, 'padmaniacs.exe'));
      }

      if (fs.existsSync(path.join(nwjsStatic, 'locales'))) {
        this.copyDir(path.join(nwjsStatic, 'locales'), path.join(nwDir, 'locales'));
      }

      if (!this.config.flags.noPack) {
        const nwZipName = `padmaniacs-v${this.packageInfo.version}-nwjs-win-x64.zip`;
        this.log(`Packaging NW.js build as ${nwZipName}...`, 'info');
        if (this.createZipArchive(nwDir, '../../' + nwZipName)) {
          this.log('NW.js platform build complete', 'success');
        } else {
          this.log('NW.js packaging failed - zip command unavailable', 'warning');
        }
      } else {
        this.log('NW.js platform staged to dist/nwjs/ (--no-pack)', 'success');
      }
    } catch (error) {
      this.log('NW.js build failed:', 'error', error);
    }
  }
  
  async buildForPlatform() {
    const platform = this.config.flags.platform;

    if (platform === 'all') {
      // Build the web base into dist/ first: platform targets read from dist/.
      await this.buildBaseFiles('web');

      // Then build each platform into its own temp/output. dist/ stays web.
      await this.buildAndroid();
      await this.buildNWJS();

      // Optionally package the web build (www.zip) from the web dist/.
      await this.buildWeb();
    } else if (platform === 'web') {
      await this.buildBaseFiles('web');
      await this.buildWeb();
    } else if (platform === 'nwjs') {
      await this.buildBaseFiles('web');
      await this.buildNWJS();
      await this.finalizeWebDist('nwjs');
    } else if (platform === 'neutralino') {
      await this.buildBaseFiles('web');
      await this.buildNeutralino();
      await this.finalizeWebDist('neutralino');
    } else if (platform === 'cordova') {
      await this.buildBaseFiles('web');
      await this.buildAndroid();
      await this.finalizeWebDist('cordova');
    } else if (platform === 'none') {
      await this.buildBaseFiles('none');
      this.log('Development build complete', 'success');
    }
  }

  /**
   * Re-stages dist/ after a non-web platform build. By default dist/ is set
   * back to the plain web platform so opening dist/ (e.g. github.io/dist)
   * always works. When noWebBase is set, dist/ is instead re-staged as the
   * platform that was just built, so the exploded output reflects it.
   * @param {string} platform - The non-web platform that was built
   */
  async finalizeWebDist(platform) {
    if (this.config.flags.noWebBase) {
      this.log(`Re-staging dist/ as ${this.getPlatformDisplayName(platform)} (--no-web-base)`, 'info');
      await this.buildBaseFiles(platform);
      return;
    }
    await this.buildBaseFiles('web');
    this.log('dist/ restored to the web platform build', 'success');
  }

  async buildBaseFiles(platform) {
    this.log(`Building base files for ${this.getPlatformDisplayName(platform)}...`, 'info');
    
    // Create JS directory in dist
    const jsDistDir = path.join(this.config.distDir, 'js');
    this.ensureDir(jsDistDir);
    
    // Concatenate all JavaScript files with platform-specific environment
    const concatenatedJS = await this.concatenateFiles(platform);
    fs.writeFileSync(path.join(jsDistDir, 'game.js'), concatenatedJS);
    
    // Copy other files to base dist
    this.copyAssets();
    this.copyCSS();
    this.copyLibFiles(platform);
    this.copyStaticFiles();
    this.processIndexHTML(platform);
  }

  async build(args) {
    this.parseFlags(args);
    
    this.setInfo();
    
    this.log('Starting build process...', 'info');
    this.log(`Platform: ${this.config.flags.platform}`, 'info');
    this.log(`Minify: ${this.config.flags.minify}`, 'info');
    this.log(`Debug: ${this.config.flags.debug}`, 'info');
    this.log(`Packaging: ${this.config.flags.noPack ? 'disabled (--no-pack)' : 'enabled'}\n`, 'info');
    
    // Clean and create dist directory
    if (fs.existsSync(this.config.distDir)) {
      this.log(`Cleaning ${this.config.distDir} folder`, 'info');
      fs.rmSync(this.config.distDir, { recursive: true });
    }
    this.ensureDir(this.config.distDir);
    
    try {
      // Platform-specific builds
      await this.buildForPlatform();
      
      this.log('\nBuild completed successfully!', 'success');
      this.log(`Output directory: ${this.config.distDir}`, 'info');
      
      // List generated files
      const files = fs.readdirSync(this.config.distDir);
      const outputFiles = files.filter(file => 
        file.endsWith('.zip') || file.endsWith('.apk')
      );
      if (outputFiles.length > 0) {
        this.log('Generated files:', 'info');
        outputFiles.forEach(file => {
          const filePath = path.join(this.config.distDir, file);
          const stats = fs.statSync(filePath);
          this.log(`  - ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`, 'info');
        });
      } else if (this.config.flags.noPack) {
        const staged = files.filter(file => {
          const full = path.join(this.config.distDir, file);
          return fs.existsSync(full) && fs.statSync(full).isDirectory() && file !== 'temp';
        });
        this.log('Packaging disabled (--no-pack). Staged output:', 'info');
        this.log(`  - ${this.config.distDir}/ (${files.length} entries)`, 'info');
        staged.forEach(dir => this.log(`  - ${this.config.distDir}/${dir}/`, 'info'));
      }
      
    } catch (error) {
      this.log('\nBuild failed:', 'error', error);
      process.exit(1);
    }
  }

  exit() {
    process.exit(0);
  }
}

async function build(args) {
  const builder = new BuildSystem();
  await builder.build(args);
}

// Run build if this script is executed directly
if (require.main === module) {
  build();
}

async function build(args) {
  const builder = new BuildSystem();
  await builder.build(args);
}

// Run build if this script is executed directly
if (require.main === module) {
  build();
}

module.exports = {
  build,
  execSync,
  BuildSystem,
  buildProcess: process
};
