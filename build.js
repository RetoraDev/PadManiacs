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
        platform: 'all', // 'web', 'cordova', 'nwjs', 'all', 'none'
        minify: false,
        zipalign: false,
        ...flags
      }
    };
    
    // File order for concatenation
    this.fileOrder = [
      // Core modules
      'js/core/constants.js',
      'js/core/environment.js', 
      'js/core/account.js',
      'js/core/character.js',
      
      // Character System
      'js/character/Character.js',
      'js/character/CharacterDisplay.js',
      'js/character/CharacterCroppedDisplay.js',
      'js/character/CharacterPortrait.js',
      'js/character/CharacterCloseShot.js',
      'js/character/CharacterManager.js',
      'js/character/CharacterSkillSystem.js',
      
      // UI Components
      'js/ui/Text.js',
      'js/ui/Window.js',
      'js/ui/WindowManager.js',
      'js/ui/CarouselMenu.js',
      'js/ui/BackgroundGradient.js',
      'js/ui/Background.js',
      'js/ui/FuturisticLines.js',
      'js/ui/LoadingDots.js',
      'js/ui/Logo.js',
      'js/ui/NavigationHint.js',
      'js/ui/ProgressText.js',
      'js/ui/ExperienceBar.js',
      
      // Filesystem
      'js/filesystem/filesystem.js',
      'js/filesystem/node-filesystem.js',
      'js/filesystem/cordova-filesystem.js',
      'js/filesystem/fallback-filesystem.js',
      
      // Game main
      'js/game/game.js',
      
      // Utils
      'js/utils/Gamepad.js',
      'js/utils/ScreenRecorder.js',
      'js/utils/NotificationSystem.js',
      'js/utils/Lyrics.js',
      'js/utils/Metronome.js',
      'js/utils/OffsetAssistant.js',
      
      // Audio
      'js/audio/BackgroundMusic.js',
      
      // Visualizers
      'js/visualizers/Visualizer.js',
      'js/visualizers/AccurracyVisualizer.js',
      'js/visualizers/AudioVisualizer.js',
      'js/visualizers/BPMVisualizer.js',
      'js/visualizers/FullScreenAudioVisualizer.js',
      
      // Parsers
      'js/parsers/LocalSMParser.js',
      'js/parsers/ExternalSMParser.js',
      
      // Addons
      'js/addons/AddonManager.js',
      
      // Game states
      'js/game/states/Boot.js',
      'js/game/states/Load.js',
      'js/game/states/Title.js',
      'js/game/states/MainMenu.js',
      'js/game/states/CharacterSelect.js',
      'js/game/states/CharacterCustomize.js',
      'js/game/states/SongSelect.js',
      'js/game/states/Play.js',
      'js/game/states/Results.js',
      'js/game/states/Jukebox.js',
      'js/game/states/Credits.js',
      
      // Player
      'js/game/player/Player.js'
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
      version: '0.0.6',
      name: 'padmaniacs'
    };
  }

  getLicenseHeader(platform) {
    return `/**
PadManiacs Rhythm Game
Copyright ${this.copyright}
https://github.com/RetoraDev/PadManiacs
Version: ${this.versionName}
Build: ${new Date().toLocaleString()}
Platform: ${this.getPlatformDisplayName(platform)}
Debug: ${this.config.flags.debug}
Minified: ${this.config.flags.minify}
*/`;
  }
  
  getLicenseHeader(platform) {
    return `/**
 * PadManiacs Rhythm Game
 * Copyright ${this.copyright}
 * Licensed under the PadManiacs License (see LICENSE file for full terms)
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
      'nwjs': 'Windows (NW.js)',
      'all': 'All Platforms'
    };
    return platformMap[platform] || platform;
  }
  
  setInfo() {
    this.packageInfo = this.getPackageInfo();
    this.versionName = `v${this.packageInfo.version + (this.config.flags.platform === 'none' ? " dev" : "")}`;
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
      if (arg === '--nwjs') this.config.flags.platform = 'nwjs';
      if (arg === '--web') this.config.flags.platform = 'web';
      if (arg === '--all') this.config.flags.platform = 'all';
      if (arg === '--minify') this.config.flags.minify = true;
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
        'nwjs': 'ENVIRONMENT.NWJS'
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

  copyLibFiles() {
    this.log('Copying lib files...', 'info');
    
    const libDest = path.join(this.config.distDir, 'lib');
    this.ensureDir(libDest);
    
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
  }

  copyStaticFiles() {
    this.log('Copying static files...', 'info');
    
    // Copy favicon from src
    const faviconSrc = path.join(this.config.srcDir, 'favicon.png');
    const faviconDest = path.join(this.config.distDir, 'favicon.png');
    if (fs.existsSync(faviconSrc)) {
      fs.copyFileSync(faviconSrc, faviconDest);
    }
    
    // Copy root favicon as fallback
    const rootFavicon = './favicon.png';
    if (fs.existsSync(rootFavicon) && !fs.existsSync(faviconDest)) {
      fs.copyFileSync(rootFavicon, faviconDest);
    }
    
    this.log('Static files copied', 'success');
  }

  processIndexHTML(platform) {
    this.log(`Processing index.html for ${this.getPlatformDisplayName(platform)}...`, 'info');
    
    const htmlSrc = path.join(this.config.srcDir, 'index.html');
    const htmlDest = path.join(this.config.distDir, 'index.html');
    
    if (fs.existsSync(htmlSrc)) {
      let htmlContent = fs.readFileSync(htmlSrc, 'utf8');
      
      // Remove ALL existing script tags and replace with single game.js
      htmlContent = htmlContent.replace(/<script src="[^"]*"><\/script>\s*/g, '');
      
      // Build the proper script tags in correct order
      let scriptTags = '';
      
      // Add phaser from lib (always first)
      scriptTags += `  <script src="./lib/${this.config.flags.debug ? 'phaser.js' : 'phaser.min.js'}"></script>\n`;
      
      // Add eruda too
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
        const debugScript = `
  <script>
    // Auto-enable debug mode if URL has debug parameter
    if (location.search.includes('debug')) {
      window.DEBUG = true;
    }
    
    // Debug initialization
    if (typeof window.eruda !== 'undefined' && (window.DEBUG || location.search.includes('debug'))) {
      eruda.init({
        tool: ['console', 'elements', 'resources', 'snippets']
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
      
      snippets.add("Reload Game", () => {
        location.reload();
      }, "Reload the game");
      
      snippets.add("Destroy Eruda", () => {
        eruda.destroy();
      }, "Remove debug panel");
      
      console.log('PadManiacs Debug Mode Active');
      console.log('Platform:', CURRENT_ENVIRONMENT);
    }
  </script>`;
        
        // Insert before closing body tag
        htmlContent = htmlContent.replace('</body>', debugScript + '\n</body>');
      }
      
      fs.writeFileSync(htmlDest, htmlContent);
      this.log('index.html processed', 'success');
    } else {
      // Create minimal index.html if source doesn't exist
      const minimalHTML = `<!DOCTYPE html>
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
      fs.writeFileSync(htmlDest, minimalHTML);
      this.log('Created minimal index.html', 'success');
    }
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
    
    // Create temporary web build directory
    const tempWebDir = path.join(this.config.distDir, 'temp', 'web');
    this.ensureDir(tempWebDir);
    
    // Copy only web files to temp directory (no cordova, no platform builds)
    this.copyDir(this.config.distDir, tempWebDir, ['www.zip', 'padmaniacs-*.zip', '*.apk', 'temp', 'cordova']);
    
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
  
  async buildNWJS() {
    this.log('Building NW.js Windows platform...', 'info');
    
    const nwStatic = path.join(this.config.srcDir, 'static/nw');
    if (fs.existsSync(nwStatic)) {
      // Create temporary NW.js build directory
      const tempNwDir = path.join(this.config.distDir, 'temp', 'nw');
      this.ensureDir(tempNwDir);
      
      // Copy NW.js binaries to temp directory
      this.copyDir(nwStatic, tempNwDir, [".placeholder"]);
      
      // Replace version in temp package.json by current version
      const packageJsonPath = path.join(tempNwDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageContent = fs.readFileSync(packageJsonPath, 'utf8');
          const updatedContent = packageContent.replace('"version": "%"', `"version": "${this.packageInfo.version}"`);
          fs.writeFileSync(packageJsonPath, updatedContent);
          this.log(`Set NW.js package.json version to: ${this.packageInfo.version}`, 'success');
        } catch (error) {
          this.log('Failed to set NW.js package.json version', 'warning');
          console.error(error);
        }
      }
      
      // Create platform-specific game.js for NW.js
      const jsDest = path.join(tempNwDir, 'www/js');
      this.ensureDir(jsDest);
      const nwjsGameJS = await this.concatenateFiles('nwjs');
      fs.writeFileSync(path.join(jsDest, 'game.js'), nwjsGameJS);
      
      // Copy other web files to NW.js www folder (no cordova)
      this.copyDir(this.config.distDir, path.join(tempNwDir, 'www'), ['www.zip', 'padmaniacs-*.zip', '*.apk', 'temp', 'cordova', 'js']);
      
      // Create 7z archive for NW.js from temp directory
      const nwZipName = `padmaniacs-v${this.packageInfo.version}-nwjs-win-x64.zip`;
      const nwZipPath = path.join('../../', nwZipName);
      if (this.create7zArchive(tempNwDir, nwZipPath)) {
        this.log('NW.js platform build complete', 'success');
      } else {
        this.log('NW.js platform build failed - 7z command unavailable', 'warning');
      }
      
      // Clean up temp directory
      fs.rmSync(path.join(this.config.distDir, 'temp'), { recursive: true });
    } else {
      this.log('NW.js static files not found at: ' + nwStatic, 'warning');
    }
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
      this.copyDir(this.config.distDir, wwwDest, ['www.zip', 'padmaniacs-*.zip', '*.apk', 'temp', 'js']);
      
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
  
  async buildForPlatform() {
    const platform = this.config.flags.platform;
    
    if (platform === 'all') {
      // Build base files first
      await this.buildBaseFiles('web');
      
      // Then build each platform with their specific environment
      await this.buildWeb();
      await this.buildNWJS();
      await this.buildAndroid();
    } else if (platform === 'web') {
      await this.buildBaseFiles('web');
      await this.buildWeb();
    } else if (platform === 'nwjs') {
      await this.buildBaseFiles('nwjs');
      await this.buildNWJS();
    } else if (platform === 'cordova') {
      await this.buildBaseFiles('cordova');
      await this.buildAndroid();
    } else if (platform === 'none') {
      await this.buildBaseFiles('none');
      this.log('Development build complete - no platform packaging', 'success');
    }
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
    this.copyLibFiles();
    this.copyStaticFiles();
    this.processIndexHTML(platform);
  }

  async build(args) {
    this.parseFlags(args);
    
    this.setInfo();
    
    this.log('Starting build process...', 'info');
    this.log(`Platform: ${this.config.flags.platform}`, 'info');
    this.log(`Minify: ${this.config.flags.minify}`, 'info');
    this.log(`Debug: ${this.config.flags.debug}\n`, 'info');
    
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

module.exports = {
  build,
  execSync,
  BuildSystem,
  buildProcess: process
};