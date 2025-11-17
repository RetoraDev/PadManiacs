#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const { spawn, execSync } = require('child_process');
const readline = require('readline');

// Import the build system
const { BuildSystem, buildProcess } = require('./build.js');

class InteractiveInterface {
  constructor() {
    this.currentSelection = 0;
    this.busy = false;
    this.currentServer = null;
    this.menuStack = [];
    this.cliArgs = this.parseCLIArgs();
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
      { label: 'Serve Project', action: () => this.showServeMenu() },
      { label: 'Run Tests', action: () => this.runTests() },
      { label: 'Code Reminders', action: () => this.showCodeReminders() }, // New option
      { label: 'Project Info', action: () => this.showProjectInfo() },
      { label: 'Exit', action: () => this.exit() }
    ];
    
    this.buildMenu = [
      { label: 'Development Build (Debug)', action: () => this.runBuild(['--none', '--debug']) },
      { label: 'Production Build (All Platforms)', action: () => this.runBuild(['--all', '--minify']) },
      { label: 'Web Platform Only', action: () => this.runBuild(['--web']) },
      { label: 'Android Platform Only', action: () => this.runBuild(['--cordova', '--zipalign']) },
      { label: 'Windows Platform Only', action: () => this.runBuild(['--nwjs']) },
      { label: 'Custom Build...', action: () => this.showCustomBuildMenu() },
      { label: 'Back to Main Menu', action: () => this.showMainMenu() }
    ];
    
    this.openApkConfirm = [
      { label: 'Install APK', action: () => this.openApk() },
      { label: 'Back to menu', action: () => this.showMainMenu() }
    ];
    
    this.serveMenu = [
      { label: 'Serve Development (src/)', action: () => this.serveProject('src') },
      { label: 'Serve Production (dist/)', action: () => this.serveProject('dist') },
      { label: 'Back to Main Menu', action: () => this.showMainMenu() }
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
  
  parseCLIArgs() {
    const args = process.argv.slice(2);
    const parsed = {
      serve: false,
      serveSrc: false,
      build: false,
      cordova: false,
      nwjs: false,
      noInstall: false,
      none: false,
      web: false,
      all: false,
      minify: false,
      debug: false,
      zipalign: false,
      headless: false,
      help: false
    };

    args.forEach(arg => {
      switch (arg) {
        case '--serve':
          parsed.serve = true;
          parsed.build = false;
          break;
        case '--serve-src':
          parsed.serveSrc = true;
          parsed.build = false;
          break;
        case '--none':
          parsed.none = true;
          parsed.build = true;
          break;
        case '--cordova':
          parsed.cordova = true;
          parsed.build = true;
          break;
        case '--nwjs':
          parsed.nwjs = true;
          parsed.build = true;
          break;
        case '--web':
          parsed.web = true;
          parsed.build = true;
          break;
        case '--all':
          parsed.all = true;
          parsed.build = true;
          break;
        case '--minify':
          parsed.minify = true;
          break;
        case '--debug':
          parsed.debug = true;
          break;
        case '--zipalign':
          parsed.zipalign = true;
          break;
        case '--no-install':
          parsed.noInstall = true;
          break;
        case '--headless':
          parsed.headless = true;
          break;
        case '--help':
        case '-h':
          parsed.help = true;
          break;
      }
    });

    return parsed;
  }
  
  handleCLIArgs() {
    if (this.cliArgs.help) {
      this.showHelp();
      return true;
    }

    if (this.cliArgs.headless) {
      // Disable interactive features for headless mode
      this.rl.close();
      process.stdin.pause();
    }

    if (this.cliArgs.build) {
      this.executeCLIBuild();
      return true;
    }

    if (this.cliArgs.serveSrc) {
      this.executeCLIServe('src');
      return true;
    }

    if (this.cliArgs.serve) {
      this.executeCLIServe('dist');
      return true;
    }

    return false; // No CLI args handled, show interactive menu
  }
  
  showHelp() {
    this.clearScreen();
    this.drawLogo();
    
    console.log(this.color('PadManiacs Build System - Command Line Interface\n', 'yellow'));
    console.log(this.color('Usage:', 'cyan'));
    console.log('  node index.js [options]');
    console.log('  npm start [options]');
    console.log('');
    
    console.log(this.color('Build Options:', 'yellow'));
    console.log('  --cordova        Build Android platform only');
    console.log('  --nwjs           Build Windows platform only');
    console.log('  --web            Build web platform only');
    console.log('  --all            Build all platforms (default)');
    console.log('  --minify         Enable minification');
    console.log('  --debug          Enable debug mode');
    console.log('  --zipalign       Enable APK zip alignment');
    console.log('');
    
    console.log(this.color('Serve Options:', 'yellow'));
    console.log('  --serve          Serve dist/ directory');
    console.log('  --serve-src      Serve src/ directory (development mode)');
    console.log('');
    
    console.log(this.color('Other Options:', 'yellow'));
    console.log('  --headless       Run without interactive menu');
    console.log('  --help, -h       Show this help message');
    console.log('');
    
    console.log(this.color('Examples:', 'cyan'));
    console.log('  node index.js --cordova --debug');
    console.log('  node index.js --serve-src');
    console.log('  node index.js --all --minify --headless');
    console.log('  npm start -- --serve');
    console.log('');
    
    process.exit(0);
  }

  executeCLIBuild() {
    const args = [];
    
    // Determine platform
    if (this.cliArgs.cordova) {
      args.push('--cordova');
    } else if (this.cliArgs.nwjs) {
      args.push('--nwjs');
    } else if (this.cliArgs.web) {
      args.push('--web');
    } else if (this.cliArgs.none) {
      args.push('--none');
    } else {
      args.push('--all');
    }
    
    // Add flags
    if (this.cliArgs.minify) {
      args.push('--minify');
    }
    if (this.cliArgs.debug) {
      args.push('--debug');
    }
    if (this.cliArgs.noInstall) {
      args.push('--no-install');
    }
    if (this.cliArgs.zipalign) {
      args.push('--zipalign');
    }
    
    // Flag should exit when it ends
    this.executingCliBuild = true;

    if (this.cliArgs.headless) {
      // Run build directly without interactive output
      this.runBuildHeadless(args);
    } else {
      // Run build with interactive output
      this.runBuild(args);
    }
  }
  
  async runBuildHeadless(args) {
    try {
      process.argv = ['node', 'build.js', ...args];
      process.exit(0);
    } catch (error) {
      console.error(this.color('Build failed:', 'red'), error.message);
      process.exit(1);
    }
  }

  executeCLIServe(mode) {
    const port = 8080;
    
    if (this.cliArgs.headless) {
      console.log(this.color(`Starting ${mode} server on port ${port}...`, 'yellow'));
    } else {
      this.clearScreen();
      this.drawLogo();
      console.log(this.color(`Starting ${mode} server...\n`, 'yellow'));
    }
    
    console.log(this.color('Server:', 'cyan'), `http://localhost:${port}`);
    console.log(this.color('Directory:', 'cyan'), mode === 'src' ? 'src/' : 'dist/');
    
    if (this.cliArgs.headless) {
      console.log(this.color('Press Ctrl+C to stop', 'dim'));
    }
    
    this.startNodeServer(mode === 'src' ? './' : 'dist', port, mode);
    
    // For headless mode, keep the process running
    if (this.cliArgs.headless) {
      // Keep process alive
      process.on('SIGINT', () => {
        console.log(this.color('\nServer stopped.', 'green'));
        process.exit(0);
      });
    }
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
        if (this.currentServer) {
          this.currentServer.close(() => {
            this.currentServer = null;
            this.busy = false;
          });
        }
        if (this.menuStack.length > 0) {
          this.currentMenu = this.menuStack.pop();
          this.currentSelection = 0;
          this.drawMenu();
        } else {
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
  
  showBuildMenu() {
    this.currentMenu = this.buildMenu;
    this.currentSelection = 0;
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
  
  showServeMenu() {
    this.currentMenu = this.serveMenu;
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
  
  showCodeReminders() {
    this.clearScreen();
    this.drawLogo();
    
    console.log(this.color('Scanning for code reminders...\n', 'yellow'));
    
    const reminders = this.scanCodeReminders();
    
    if (reminders.length === 0) {
      console.log(this.color('✓ No code reminders found!', 'green'));
      console.log(this.color('\nPress any key to return to menu...', 'dim'));
      this.rl.input.once('data', () => this.showMainMenu());
      return;
    }
    
    this.displayReminders(reminders);
  }

  scanCodeReminders() {
    const buildSystem = new BuildSystem();
    const reminders = [];
    const reminderPatterns = {
      'TODO': { color: 'yellow', symbol: '●' },
      'BUG': { color: 'red', symbol: '⚠' },
      'FIXME': { color: 'red', symbol: '⚠' },
      'HACK': { color: 'magenta', symbol: '⚡' },
      'NOTE': { color: 'blue', symbol: 'ℹ' },
      'OPTIMIZE': { color: 'cyan', symbol: '⚙' },
      'REVIEW': { color: 'yellow', symbol: '👁' },
      'XXX': { color: 'red', symbol: '❌' },
      'WARNING': { color: 'yellow', symbol: '⚠' }
    };

    // Scan all source files in the file order
    buildSystem.fileOrder.forEach(filePath => {
      if (filePath.startsWith('js/')) {
        const fullPath = path.join(buildSystem.config.srcDir, filePath);
        this.scanFileForReminders(fullPath, filePath, reminderPatterns, reminders);
      }
    });

    // Also scan root JS files
    const rootFiles = ['build.js', 'index.js'];
    rootFiles.forEach(fileName => {
      const fullPath = path.join('.', fileName);
      if (fs.existsSync(fullPath)) {
        this.scanFileForReminders(fullPath, fileName, reminderPatterns, reminders);
      }
    });

    return reminders.sort((a, b) => {
      // Sort by priority: BUG/FIXME first, then TODO, then others
      const priority = { 'BUG': 1, 'FIXME': 1, 'XXX': 1, 'TODO': 2, 'HACK': 3, 'WARNING': 4, 'OPTIMIZE': 5, 'REVIEW': 6, 'NOTE': 7 };
      const aPriority = priority[a.type] || 8;
      const bPriority = priority[b.type] || 8;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Then by file name
      return a.file.localeCompare(b.file);
    });
  }

  scanFileForReminders(filePath, relativePath, patterns, reminders) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const trimmedLine = line.trim();
        
        // Only process lines with // comments
        const commentIndex = trimmedLine.indexOf('//');
        if (commentIndex === -1) return;
        
        // Extract just the comment part (after //)
        const commentText = trimmedLine.substring(commentIndex + 2).trim();
        
        // Look for reminder patterns at the START of the comment (case-sensitive)
        Object.keys(patterns).forEach(type => {
          // Exact match at start of comment (case-sensitive)
          const exactPattern = new RegExp(`^${type}\\b\\s*:?\\s*(.*?)(?:\\s+by\\s+([\\w\\s]+))?$`);
          const match = commentText.match(exactPattern);
          
          if (match) {
            const comment = match[1]?.trim() || '';
            const author = match[2]?.trim();
            
            reminders.push({
              type: type,
              comment: comment,
              author: author,
              file: relativePath,
              line: lineNumber,
              pattern: patterns[type]
            });
            return; // Stop checking other patterns for this line
          }
        });
      });
      
    } catch (error) {
      console.log(this.color(`✗ Could not read file: ${filePath}`, 'red'));
    }
  }  
  
  displayReminders(reminders) {
    console.log(this.color(`Found ${reminders.length} code reminder(s):\n`, 'cyan'));
    
    let currentFile = '';
    
    reminders.forEach((reminder, index) => {
      // Show file header if it changed
      if (reminder.file !== currentFile) {
        if (currentFile !== '') console.log('');
        console.log(this.color(`📁 ${reminder.file}`, 'bright'));
        currentFile = reminder.file;
      }
      
      // Format the reminder line
      const symbol = this.color(reminder.pattern.symbol, reminder.pattern.color);
      const type = this.color(reminder.type, reminder.pattern.color);
      const author = reminder.author ? this.color(` by ${reminder.author}`, 'dim') : '';
      const comment = reminder.comment ? `: ${reminder.comment}` : '';
      
      console.log(`  ${symbol} ${type}${author}${comment}`);
      console.log(`    ${this.color('on line', 'dim')} ${this.color(reminder.line.toString(), 'white')}`);
    });
    
    // Show summary
    const summary = this.generateRemindersSummary(reminders);
    console.log(`\n${this.color('Summary:', 'yellow')}`);
    Object.keys(summary).forEach(type => {
      console.log(`  ${this.color(type, summary[type].color)}: ${summary[type].count}`);
    });
    
    console.log(this.color('\nPress any key to return to menu...', 'dim'));
    this.rl.input.once('data', () => this.showMainMenu());
  }

  generateRemindersSummary(reminders) {
    const summary = {};
    const colors = {
      'BUG': 'red',
      'FIXME': 'red', 
      'XXX': 'red',
      'TODO': 'yellow',
      'HACK': 'magenta',
      'WARNING': 'yellow',
      'OPTIMIZE': 'cyan',
      'REVIEW': 'yellow',
      'NOTE': 'blue'
    };
    
    reminders.forEach(reminder => {
      if (!summary[reminder.type]) {
        summary[reminder.type] = {
          count: 0,
          color: colors[reminder.type] || 'white'
        };
      }
      summary[reminder.type].count++;
    });
    
    return summary;
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
      this.currentBuild = new BuildSystem();
      
      await this.currentBuild.build(args);
      
      this.currentBuild = null;
      
      console.log(`\n${this.color('Build completed successfully!', 'green')}`);
      
      if (this.executingCliBuild) {
        this.exit();
        return;
      }
      
      console.log(this.color('Press any key to return to menu...', 'dim'));
      
      if (this.isTermux() && !args.includes("--no-install") && args.includes("--cordova")) {
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

  serveProject(mode) {
    this.clearScreen();
    this.drawLogo();
    
    const serveDir = mode === 'src' ? './' : 'dist';
    const port = 8080;
    
    console.log(this.color(`Starting ${mode} development server...\n`, 'yellow'));
    console.log(this.color('Server will be available at:', 'cyan'), this.color(`http://localhost:${port}`, 'bright'));
    console.log(this.color('Serving from:', 'cyan'), this.color(serveDir, 'bright'));
    
    if (mode === 'src') {
      console.log(this.color('Development mode: Loading individual source files', 'green'));
    } else {
      console.log(this.color('Production mode: Loading bundled game.js', 'green'));
    }
    
    console.log(this.color('Press Ctrl+C to stop the server', 'dim'));
    console.log(this.color('─'.repeat(50), 'dim') + '\n');
    
    this.startNodeServer(serveDir, port, mode);
  }
  
  async findAvailablePort(startPort = 8080, maxAttempts = 10) {
    const net = require('net');
    
    for (let port = startPort; port <= startPort + maxAttempts; port++) {
      const isAvailable = await new Promise((resolve) => {
        const tester = net.createServer()
          .once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
              resolve(false);
            } else {
              resolve(false); // Other errors also mean port is not available
            }
          })
          .once('listening', () => {
            tester.once('close', () => resolve(true)).close();
          })
          .listen(port);
      });
      
      if (isAvailable) {
        return port;
      }
    }
    
    throw new Error(`No available ports found between ${startPort} and ${startPort + maxAttempts}`);
  }
  
  async startNodeServer(serveDir, preferredPort, mode) {
    try {
      // Check if preferred port is available, if not find another one
      const actualPort = await this.findAvailablePort(preferredPort);
      
      if (actualPort !== preferredPort) {
        console.log(this.color(`Port ${preferredPort} is busy, using port ${actualPort} instead`, 'yellow'));
      }
      
      this.busy = true;
      
      const server = http.createServer((req, res) => {
        const startTime = Date.now();
        const requestId = Math.random().toString(36).substr(2, 9);
        
        // Log request details based on mode
        console.log(this.color(`${req.method} → ${req.url}`, 'cyan'));
        
        // Parse the URL
        const parsedUrl = url.parse(req.url);
        let pathname = parsedUrl.pathname;
        
        // Default to index.html
        if (pathname === '/') {
          pathname = '/index.html';
          if (mode === 'src') {
            console.log(this.color(`→ Rewrote / to /index.html`, 'gray'));
          }
        }
        
        // Build the file path
        let filePath = path.join(process.cwd(), serveDir, pathname);
        
        // Special handling for src mode index.html
        if (mode === 'src' && pathname === '/index.html') {
          try {
            const devHtml = this.generateDevIndexHtml();
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(devHtml);
            const duration = Date.now() - startTime;
            console.log(this.color(`200 OK (${duration}ms) - Generated dev index.html`, 'green'));
            return;
          } catch (error) {
            console.log(this.color(`✗ Error generating dev index.html:`, 'red'), error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error generating development index.html');
            const duration = Date.now() - startTime;
            console.log(this.color(`500 Internal Server Error (${duration}ms)`, 'red'));
            return;
          }
        }
        
        // Handle assets route - redirect /assets/ to ./src/assets/
        if (mode === 'src' && pathname.startsWith('/assets/')) {
          console.log(this.color(`Redirecting: ${pathname} → /src${pathname}`, 'cyan'));
          // Replace /assets/ with /src/assets/ in the file path
          filePath = path.join(process.cwd(), 'src', 'assets', pathname.substring('/assets/'.length));
        }

        // Check if file exists
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            // File not found
            const duration = Date.now() - startTime;
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            console.log(this.color(`404 Not Found (${duration}ms) - ${filePath}`, 'yellow'));
            return;
          }
          
          // Read and serve the file
          fs.readFile(filePath, (err, data) => {
            const duration = Date.now() - startTime;
            
            if (err) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('500 Internal Server Error');
              console.log(this.color(`500 Internal Server Error (${duration}ms)`, 'red'));
              return;
            }
            
            let content = data;
            
            // For binary files (images, audio), don't convert to string
            const ext = path.extname(filePath).toLowerCase();
            const textExtensions = ['.html', '.css', '.js', '.json', '.sm', '.lrc', '.txt'];
            
            if (textExtensions.includes(ext)) {
              content = data.toString();
              // Dynamic replacements based on file type for development mode
              content = this.processDynamicContent(filePath, content, mode);
            }
            
            // Set content type based on file extension
            const contentTypes = {
              '.html': 'text/html',
              '.css': 'text/css',
              '.js': 'application/javascript',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.gif': 'image/gif',
              '.svg': 'image/svg+xml',
              '.json': 'application/json',
              '.ogg': 'audio/ogg',
              '.mp3': 'audio/mpeg',
              '.wav': 'audio/wav',
              '.sm': 'text/plain',
              '.lrc': 'text/plain',
              '.txt': 'text/plain'
            };
            
            const contentType = contentTypes[ext] || 'text/plain';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
            
            console.log(this.color(`200 OK (${duration}ms) - ${filePath}`, 'green'));
          });
        });
      });
      
      // Store server reference for graceful shutdown
      this.currentServer = server;
      
      // Add comprehensive event listeners based on mode
      server.on('listening', () => {
        console.log(this.color(`✓ Server running!`, 'green'));
      });
      
      server.on('connection', (socket) => {
        if (mode === 'src') {
          console.log(this.color(`→ New connection from ${socket.remoteAddress}:${socket.remotePort}`, 'blue'));
        }
      });
      
      server.on('close', () => {
        console.log(this.color(' → Server connection closed', 'cyan'));
      });
      
      server.on('checkContinue', (request, response) => {
        if (mode === 'src') {
          console.log(this.color(`→ Expect: 100-continue for ${request.url}`, 'magenta'));
        }
      });
      
      // Handle server errors
      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.log(this.color(`✗ Port ${actualPort} is already in use!`, 'red'));
          console.log(this.color('  Please close other servers or try a different port.', 'yellow'));
        } else {
          console.log(this.color('✗ Server error:', 'red'), error.message);
          if (mode === 'src') {
            console.log(this.color(`  Error details: ${error.stack}`, 'gray'));
          }
        }
        
        this.returnToMenuAfterError();
      });
      
      server.on('clientError', (error, socket) => {
        if (mode === 'src') {
          console.log(this.color(`⚠ Client error: ${error.message}`, 'yellow'));
        }
        
        if (socket.writable) {
          socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        }
      });
      
      server.listen(actualPort, () => {
        // Listening message is handled by the 'listening' event
      });
      
      // Handle graceful shutdown
      const shutdownHandler = () => {
        server.close(() => {
          console.log(this.color('✓ Server stopped gracefully', 'green'));
          this.currentServer = null;
          this.exit();
        });
        
        // Force close after 5 seconds if graceful shutdown fails
        setTimeout(() => {
          console.log(this.color('⚠ Forcing server shutdown', 'yellow'));
          process.exit(0);
        }, 5000);
      };
      
      process.on('SIGINT', shutdownHandler);
      
      // Store the handler so we can remove it later
      this.currentShutdownHandler = shutdownHandler;
      
    } catch (error) {
      console.log(this.color('✗ Failed to start server:', 'red'), error.message);
      if (mode === 'src') {
        console.log(this.color(`  Error stack: ${error.stack}`, 'gray'));
      }
      this.returnToMenuAfterError();
    }
  }

  returnToMenuAfterError() {
    console.log(this.color('Press any key to return to menu...', 'dim'));
    
    this.rl.input.once('data', () => {
      this.cleanupServer();
      this.showMainMenu();
    });
  }

  generateDevIndexHtml() {
    const buildSystem = new BuildSystem();
    let htmlContent = fs.readFileSync('./src/index.html', 'utf8');
    
    // Replace stylesheet url
    htmlContent = htmlContent.replace(
      /<link[^>]*href=["'][^"']*style\.css["'][^>]*>/gi,
      '<link rel="stylesheet" href="./src/css/style.css">'
    );
    
    // Remove existing script tags if any
    htmlContent = htmlContent.replace(/<script src="[^"]*"><\/script>\s*/g, '');
    
    // Build head content (libraries and CSS)
    let headContent = '';
    
    // Add lib files to head
    headContent += '  <script src="./lib/phaser.min.js"></script>\n';
    headContent += '  <script src="./lib/eruda.js"></script>\n';
    
    // Build body content (source code)
    let bodyContent = '\n';
    
    // Add all source JS files in order to body
    buildSystem.fileOrder.forEach(filePath => {
      if (filePath.startsWith('js/')) {
        bodyContent += `  <script src="./src/${filePath}"></script>\n`;
      }
    });
    
    // Add debug initialization to body (after source files)
    bodyContent += `
    <script>
      // Auto-enable debug mode for development
      window.DEBUG = true;
      
      // Initialize eruda for development
      if (typeof window.eruda !== 'undefined') {
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
        
        console.log('PadManiacs Development Mode Active');
      }
    </script>`;
    
    // Insert libraries in head
    htmlContent = htmlContent.replace('</head>', headContent + '\n</head>');
    
    // Insert source code in body
    htmlContent = htmlContent.replace('</body>', bodyContent + '\n</body>');
    
    return htmlContent;
  }
  
  processDynamicContent(filePath, content, mode) {
    if (mode !== 'src') return content;
    
    const filename = path.basename(filePath);
    
    const buildSystem = new BuildSystem();
    buildSystem.config.flags.platform = 'none';
    buildSystem.setInfo();
    
    // Handle constants.js
    if (filePath.includes('constants.js')) {
      return content
        .replace('const COPYRIGHT = "%";', `const COPYRIGHT = "${buildSystem.copyright}";`)
        .replace('const VERSION = "%";', `const VERSION = "${buildSystem.versionName}";`)
        .replace('window.DEBUG = %;', 'window.DEBUG = true;');
    }
    
    // Handle environment.js
    if (filePath.includes('environment.js')) {
      return content.replace(
        'const CURRENT_ENVIRONMENT = %;',
        'const CURRENT_ENVIRONMENT = ENVIRONMENT.WEB;'
      );
    }
    
    return content;
  }
  
  cleanupServer() {
    // Remove SIGINT handler
    if (this.currentShutdownHandler) {
      process.removeListener('SIGINT', this.currentShutdownHandler);
      this.currentShutdownHandler = null;
    }
    
    // Close server if it's running
    if (this.currentServer) {
      this.currentServer.close();
      this.currentServer = null;
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
    this.cleanupServer();
    this.rl.close();
    process.exit(0);
  }

  start() {
    // Handle CLI arguments first
    if (this.handleCLIArgs()) {
      return; // CLI command handled, don't show interactive menu
    }
    
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
    
    process.on('SIGINT', () => this.exit());

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
  const interface = new InteractiveInterface();
  
  // Check if we should run in CLI mode
  const hasCLIArgs = process.argv.length > 2;
  
  if (hasCLIArgs) {
    // CLI mode - handle arguments and execute commands
    interface.start();
  } else {
    // Interactive mode - start the menu interface
    startInteractive();
  }
}