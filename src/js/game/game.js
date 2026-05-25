let game, backgroundMusic, notifications, addonManager, achievementsManager, mouse;

let Account = {
  ...DEFAULT_ACCOUNT,
  ...JSON.parse(localStorage.getItem("Account") || "{}")
};

const saveAccount = () => localStorage.setItem("Account", JSON.stringify(Account));

const bootGame = () => {
  if (game) game.destroy();
  game = new Phaser.Game({
    width: 240,
    height: 140,
    renderer: Account.settings.renderer,
    scaleMode: Phaser.ScaleManager.SHOW_ALL,
    crisp: Account.settings.pixelated,
    antialias: false,
    alignV: false,
    alignH: true,
    enableDebug: false,
    failIfMajorPerformanceCaveat: false,
    forceSetTimeOut: false,
    clearBeforeRender: true,
    forceSingleUpdate: false,
    maxPointers: Account.settings.enableTouch || Account.settings.enableMouse ? 2 : 0,
    keyboard: true,
    mouse: !!Account.settings.enableMouse,
    mouseWheel: !!Account.settings.enableMouse,
    mspointer: false,
    multiTexture: false,
    pointerLock: false,
    preserveDrawingBuffer: false,
    roundPixels: true,
    touch: Account.settings.enableTouch,
    transparent: false,
    parent: "canvas_parent",
    state: {
      create() {
        game.state.add('Boot', Boot);
        game.state.start('Boot');
        game.recorder = new ScreenRecorder(game);
      }
    },
    ...(window.GameConfig || {})
  });
};

window.onload = bootGame;

const addFpsText = () => {
  const text = new Text(238, 2, "");
  text.anchor.x = 1;
  game.time.events.loop(100, () => text.write(`${game.time.fps} (${game.renderer.renderSession.drawCount - 1})`));
  return text;
};

const openExternalUrl = url => {
  // Ensure URL is properly encoded
  const encodedUrl = encodeURI(url);
  
  switch (CURRENT_ENVIRONMENT) {
    case ENVIRONMENT.CORDOVA:
      navigator.app.loadUrl(encodedUrl, { openExternal: true });
      break;
    case ENVIRONMENT.NWJS:
      nw.Shell.openExternal(encodedUrl);
      break;
    case ENVIRONMENT.WEB:
    default:
      const a = document.createElement('a');
      a.href = encodedUrl;
      a.target = '_blank';
      a.click();
      break;
  }
};

const Audio = {
  pool: {},
  add: function (key, volume = 1, loop = false, reset = true) {
    if (!reset || !this.pool[key]) {
      this.pool[key] = game.add.audio(key);
    }
    return this.pool[key];
  },
  play: function (key, volume = 1, loop = false, reset = true) {
    if (game) {
      if (!reset || !this.pool[key]) {
        this.pool[key] = game.add.audio(key);
      }
      return this.pool[key].play(null, 0, volume, loop, reset);
    }
  },
  stop: function (key, fadeOut) {
    if (game) {
      const audio = this.pool[key];
      if (audio) {
        if (fadeOut) {
          audio.stop();
        } else {
          audio.fadeOut();
          audio.onFadeComplete.addOnce(() => audio.stop());
        }
      }
      return;
    }
  }
};

const createGradientBackground = (x, y, width, height, color) => {
  const bitmap = game.add.bitmapData(width, height);
    
  const gradient = bitmap.context.createLinearGradient(width, 0, 0, 0);
    
  const bgcolor = color || "rgba(44, 90, 198, 0.6)";
    
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.3, bgcolor);
  gradient.addColorStop(0.7, bgcolor);
  gradient.addColorStop(1, 'transparent');
    
  bitmap.context.fillStyle = gradient;
  bitmap.context.fillRect(0, 0, width, height);
    
  const sprite = game.add.sprite(x, y, bitmap);
  return sprite;
};

// Register recovery listener
// TODO: Implement recovery from JavaScript freeze correctly
(() => {
  const script = document.createElement("script");
  script.text = `
    window.onerror = (details, file, line) => {
      localStorage.setItem('gameLastCrashed', 'true');
      if (!window.DEBUG && typeof window.eruda !== "undefined") eruda.init(); 
      const filename = file ? file.split('/').pop() : 'unknown file';
      const message = details + " On Line " + line + " of " + filename;
      console.error(message);
      game.state.add('ErrorScreen', ErrorScreen);
      game.state.start('ErrorScreen', false, false, message, 'Boot');
    };
  `;
  document.head.appendChild(script);
})();

// Multiplayer settings
const DEFAULT_PLAYER_SETTINGS = {
  autoplay: Account.settings.autoplay,
  scrollDirection: Account.settings.scrollDirection,
  noteColorOption: Account.settings.noteColorOption,
  noteSpeedMult: Account.settings.noteSpeedMult,
  speedMod: Account.settings.speedMod
};

window.multiplayerState = {
  song: null,
  difficultyIndex: 0,
  player1: {
    settings: { ...DEFAULT_PLAYER_SETTINGS },
    ready: false
  },
  player2: {
    settings: { ...DEFAULT_PLAYER_SETTINGS },
    joined: false,
    ready: false
  },
  counter: {
    player1: 0,
    player2: 0,
    draw: 0
  }
};
