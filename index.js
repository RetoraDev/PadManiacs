#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const readline = require('readline');

// Import the build system
const { build, BuildSystem } = require('./build.js');

class InteractiveInterface {
  constructor() {
    this.currentSelection = 0;
    this.busy = false;
    this.menuStack = [];
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Colors for terminal output
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      bgBlack: '\x1b[40m',
      bgRed: '\x1b[41m',
      bgGreen: '\x1b[42m',
      bgYellow: '\x1b[43m',
      bgBlue: '\x1b[44m',
      bgMagenta: '\x1b[45m',
      bgCyan: '\x1b[46m',
      bgWhite: '\x1b[47m'
    };
    
    this.mainMenu = [
      { label: 'Build Options', action: () => this.showBuildMenu() },
      { label: 'Serve Project', action: () => this.serveProject() },
      { label: 'Run Tests', action: () => this.runTests() },
      { label: 'Project Info', action: () => this.showProjectInfo() },
      { label: 'Exit', action: () => this.exit() }
    ];
    
    this.buildMenu = [
      { label: 'Development Build (Debug)', action: () => this.runBuild(['--none', '--debug']) },
      { label: 'Production Build (All Platforms)', action: () => this.runBuild(['--all', '--minify']) },
      { label: 'Web Platform Only', action: () => this.runBuild(['--web']) },
      { label: 'Android Platform Only', action: () => this.runBuild(['--cordova']) },
      { label: 'Windows Platform Only', action: () => this.runBuild(['--nwjs']) },
      { label: 'Custom Build...', action: () => this.showCustomBuildMenu() },
      { label: 'Back to Main Menu', action: () => this.showMainMenu() }
    ];
    
    this.openApkConfirm = [
      { label: 'Install APK', action: () => this.openApk() },
      { label: 'Back to menu', action: () => this.showMainMenu() }
    ];
    
    this.customBuildMenu = [
      { label: 'Platform: All', action: () => this.togglePlatform() },
      { label: 'Minify: Off', action: () => this.toggleMinify() },
      { label: 'Zip Align: Off', action: () => this.toggleZipAlign() },
      { label: 'Debug: Off', action: () => this.toggleDebug() },
      { label: 'Start Build', action: () => this.startCustomBuild() },
      { label: 'Back to Build Menu', action: () => this.showBuildMenu() }
    ];
    
    this.customBuildOptions = {
      platform: 'all',
      minify: false,
      zipalign: false,
      debug: false
    };
    
    this.currentMenu = this.mainMenu;
  }

  color(text, color) {
    return `${this.colors[color]}${text}${this.colors.reset}`;
  }

  clearScreen() {
    process.stdout.write('\x1b[2J\x1b[0f');
  }

  drawLogo() {
    const logo = [
      "   ___          ____  ___          _      _  __",
      "  / _ \\___ ____/ /  |/  /__ ____  (_)__ _| |/_/",
      " / ___/ _ `/ _  / /|_/ / _ `/ _ \\/ / _ `/>  <  ",
      "/_/   \\_,_/\\_,_/_/  /_/\\_,_/_//_/_/\\_,_/_/|_|  ",
      "",
    ]
    .map(line => this.color(line, 'cyan'))
    .join('\n');
    
    console.log(logo);
  }

  drawMenu() {
    this.clearScreen();
    this.drawLogo();
    
    console.log(this.color('Use arrow keys to navigate, Enter to select, Ctrl+C to exit\n', 'dim'));
    
    this.currentMenu.forEach((item, index) => {
      const isSelected = index === this.currentSelection;
      const prefix = isSelected ? this.color('❯ ', 'green') + this.color('', 'bgGreen') : '  ';
      const label = isSelected ? this.color(item.label, 'bright') : item.label;
      console.log(`${prefix}${label}${isSelected ? this.colors.reset : ''}`);
    });
  }

  handleInput(key) {
    switch (key) {
      case 'up':
        this.currentSelection = (this.currentSelection - 1 + this.currentMenu.length) % this.currentMenu.length;
        this.drawMenu();
        break;
      case 'down':
        this.currentSelection = (this.currentSelection + 1) % this.currentMenu.length;
        this.drawMenu();
        break;
      case 'return':
        this.executeSelection();
        break;
      case 'escape':
        if (this.menuStack.length > 0) {
          this.currentMenu = this.menuStack.pop();
          this.currentSelection = 0;
          this.drawMenu();
        }
        break;
    }
  }

  executeSelection() {
    if (this.busy) return;
    const item = this.currentMenu[this.currentSelection];
    if (item.action) {
      this.menuStack.push(this.currentMenu);
      item.action();
    }
  }

  showMainMenu() {
    this.currentMenu = this.mainMenu;
    this.currentSelection = 0;
    this.busy = false;
    this.drawMenu();
  }
  
  showOpenApkConfirm() {
    this.currentMenu = this.openApkConfirm;
    this.currentSelection = 0;
    this.busy = false;
    this.drawMenu();
  }
  
  openApk() {
    if (this.isTermux()) {
      let distDir = new BuildSystem().config.distDir;
      execSync(`termux-open ${distDir}/*.apk`, { stdio: "ignore" });
    }
    this.showMainMenu();
  }

  showBuildMenu() {
    this.currentMenu = this.buildMenu;
    this.currentSelection = 0;
    this.drawMenu();
  }

  showCustomBuildMenu() {
    this.currentMenu = this.customBuildMenu;
    this.currentSelection = 0;
    this.updateCustomBuildLabels();
    this.drawMenu();
  }

  updateCustomBuildLabels() {
    this.customBuildMenu[0].label = `Platform: ${this.color(this.customBuildOptions.platform, 'cyan')}`;
    this.customBuildMenu[1].label = `Minify: ${this.color(this.customBuildOptions.minify ? 'ON' : 'OFF', this.customBuildOptions.minify ? 'green' : 'red')}`;
    this.customBuildMenu[2].label = `Zip Align: ${this.color(this.customBuildOptions.zipalign ? 'ON' : 'OFF', this.customBuildOptions.zipalign ? 'green' : 'red')}`;
    this.customBuildMenu[3].label = `Debug: ${this.color(this.customBuildOptions.debug ? 'ON' : 'OFF', this.customBuildOptions.debug ? 'green' : 'red')}`;
  }

  togglePlatform() {
    const platforms = ['all', 'web', 'cordova', 'nwjs', 'none'];
    const currentIndex = platforms.indexOf(this.customBuildOptions.platform);
    this.customBuildOptions.platform = platforms[(currentIndex + 1) % platforms.length];
    this.updateCustomBuildLabels();
    this.drawMenu();
  }

  toggleMinify() {
    this.customBuildOptions.minify = !this.customBuildOptions.minify;
    this.updateCustomBuildLabels();
    this.drawMenu();
  }

  toggleZipAlign() {
    this.customBuildOptions.zipalign = !this.customBuildOptions.zipalign;
    this.updateCustomBuildLabels();
    this.drawMenu();
  }
  
  toggleDebug() {
    this.customBuildOptions.debug = !this.customBuildOptions.debug;
    this.updateCustomBuildLabels();
    this.drawMenu();
  }

  startCustomBuild() {
    const args = [];
    if (this.customBuildOptions.platform !== 'all') {
      args.push(`--${this.customBuildOptions.platform}`);
    }
    if (this.customBuildOptions.minify) {
      args.push('--minify');
    }
    if (this.customBuildOptions.zipalign) {
      args.push('--zipalign');
    }
    if (this.customBuildOptions.debug) {
      args.push('--debug');
    }
    this.runBuild(args);
  }

  async runBuild(args) {
    this.clearScreen();
    this.drawLogo();
    
    this.busy = true;
    
    console.log(this.color('Starting build process...\n', 'yellow'));
    console.log(this.color('Build Arguments:', 'cyan'), args.join(' '));
    console.log(this.color('─'.repeat(50), 'dim') + '\n');
    
    try {
      // Run the build process
      process.argv = ['node', 'build.js', ...args];
      await build();
      
      console.log(`\n${this.color('Build completed successfully!', 'green')}`);
      console.log(this.color('Press any key to return to menu...', 'dim'));
      
      if (this.isTermux() && args.includes("--cordova")) {
        this.rl.input.once('data', () => this.showOpenApkConfirm());
      } else {
        this.rl.input.once('data', () => this.showMainMenu());
      }
    } catch (error) {
      console.log(`\n${this.color('Build failed!', 'red')}`);
      console.log(this.color('Press any key to return to menu...', 'dim'));
      
      this.rl.input.once('data', () => this.showMainMenu());
    }
  }

  serveProject() {
    this.clearScreen();
    this.drawLogo();
    
    this.busy = true;
    
    console.log(this.color('Starting development server...\n', 'yellow'));
    console.log(this.color('Server will be available at:', 'cyan'), this.color('http://localhost:8080', 'bright'));
    console.log(this.color('Press Ctrl+C to stop the server', 'dim'));
    console.log(this.color('─'.repeat(50), 'dim') + '\n');
    
    try {
      const server = spawn('python', ['-m', 'http.server', '8080', '-d', 'dist/'], {
        stdio: 'inherit',
        shell: true
      });
      
      server.on('close', (code) => {
        console.log(`\n${this.color('Server stopped.', 'yellow')}`);
        console.log(this.color('Press any key to return to menu...', 'dim'));
        
        this.rl.input.once('data', () => this.showMainMenu());
      });
      
    } catch (error) {
      console.log(`${this.color('Failed to start server:', 'red')} ${error.message}`);
      console.log(this.color('Press any key to return to menu...', 'dim'));
      
      this.rl.input.once('data', () => this.showMainMenu());
    }
  }

  runTests() {
    this.clearScreen();
    this.drawLogo();
    
    this.busy = true;
    
    console.log(this.color('Running tests...\n', 'yellow'));
    console.log(this.color('─'.repeat(50), 'dim') + '\n');
    
    try {
      execSync('npm test', { stdio: 'inherit' });
      console.log(`\n${this.color('Tests completed successfully!', 'green')}`);
    } catch (error) {
      console.log(`\n${this.color('Tests failed or no tests implemented.', 'red')}`);
    }
    
    console.log(this.color('Press any key to return to menu...', 'dim'));
    
    this.rl.input.once('data', () => this.showMainMenu());
  }

  showProjectInfo() {
    this.clearScreen();
    this.drawLogo();
    
    try {
      const packageInfo = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      const buildSystem = new BuildSystem();
      
      console.log(this.color('Project Information:\n', 'yellow'));
      console.log(`${this.color('Name:', 'cyan')} ${packageInfo.name}`);
      console.log(`${this.color('Version:', 'cyan')} ${packageInfo.version}`);
      console.log(`${this.color('Description:', 'cyan')} ${packageInfo.description}`);
      console.log(`${this.color('Author:', 'cyan')} ${packageInfo.author}`);
      console.log(`${this.color('License:', 'cyan')} ${packageInfo.license}`);
      console.log(`${this.color('Repository:', 'cyan')} ${packageInfo.repository.url}`);
      
      console.log(`\n${this.color('Build System:', 'yellow')}`);
      console.log(`${this.color('Source Directory:', 'cyan')} ${buildSystem.config.srcDir}`);
      console.log(`${this.color('Distribution Directory:', 'cyan')} ${buildSystem.config.distDir}`);
      console.log(`${this.color('Library Directory:', 'cyan')} ${buildSystem.config.libDir}`);
      
      const testSystem = new BuildSystem();
      
      const platforms = [
        {
          name: "Web",
          description: "Standard web build (www.zip)",
          supported: testSystem.hasZip(),
          requires: "zip command to build www.zip"
        },
        {
          name: "Windows",
          description: "NW.JS Package for Windows",
          supported: testSystem.hasZip(),
          requires: "7-zip command to package nw.js"
        },
        {
          name: "Android",
          description: "Cordova-based APK",
          supported: testSystem.hasZip() && testSystem.hasApkSigner(),
          requires: "zip command and apksigner from Android SDK Build Tools to build zip file and sign it"
        }
      ];
      
      console.log(`\n${this.color('Available Platforms:', 'yellow')}`);

      platforms.forEach(platform => {
        console.log(this.color(`→ ${platform.name}: `, 'bright') + this.color(platform.description, 'cyan'));
        if (!platform.supported) console.log(this.color(`  ⚠ Requires ${platform.requires}`, 'yellow'));
        console.log(this.color(`  ${platform.supported ? '✓ Supported' : '✗ Not Supported'}`, platform.supported ? "green" : "red"));
        console.log("");
      });
    } catch (error) {
      console.log(`${this.color('Error reading project information:', 'red')} ${error.message}`);
    }
    
    console.log(`\n${this.color('Press any key to return to menu...', 'dim')}`);
    
    this.rl.input.once('data', () => {
      this.showMainMenu();
    });
  }

  exit() {
    this.rl.close();
    process.exit(0);
  }

  start() {
    // Set up raw mode for keypress events
    this.rl.input.setRawMode(true);
    this.rl.input.resume();
    this.rl.input.setEncoding('utf8');

    // Handle keypress events
    this.rl.input.on('data', (key) => {
      if (key === '\u0003') { // Ctrl+C
        this.exit();
      } else if (key === '\u001b[A') { // Up arrow
        this.handleInput('up');
      } else if (key === '\u001b[B') { // Down arrow
        this.handleInput('down');
      } else if (key === '\r' || key === '\n') { // Enter
        this.handleInput('return');
      } else if (key === '\u001b') { // Escape
        this.handleInput('escape');
      }
    });

    this.showMainMenu();
  }
  
  isTermux() {
    return process.execPath.includes("com.termux");
  }
}

// Start the interactive interface
function startInteractive() {
  const interface = new InteractiveInterface();
  interface.start();
}

// Export for testing
module.exports = { InteractiveInterface, startInteractive };

// Start if run directly
if (require.main === module) {
  startInteractive();
}