let game, gamepad, backgroundMusic, notifications, addonManager, sidebarNotifications, achievementsManager;

let Account = {
  ...DEFAULT_ACCOUNT,
  ...JSON.parse(localStorage.getItem("Account") || "{}")
};

const saveAccount = () => localStorage.setItem("Account", JSON.stringify(Account));

const bootGame = () => {
  if (game) game.destroy();
  game = new Phaser.Game({
    width: 192,
    height: 112,
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
    maxPointers: 0,
    keyboard: true,
    mouse: false,
    mouseWheel: false,
    mspointer: false,
    multiTexture: false,
    pointerLock: false,
    preserveDrawingBuffer: false,
    roundPixels: true,
    touch: false,
    transparent: false,
    parent: "game",
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
  const text = new Text(190, 2, "");
  text.anchor.x = 1;
  game.time.events.loop(100, () => text.write(`${game.time.fps} (${game.renderer.renderSession.drawCount - 1})`));
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

// Register recovery listener
// TODO: Implement recovery from JavaScript freeze correctly
const script = document.createElement("script");
script.text = `
window.onerror = (details, file, line) => {
  localStorage.setItem('gameLastCrashed', 'true');
  if (typeof window.eruda !== "undefined") eruda.init(); 
  const filename = file ? file.split('/').pop() : 'unknown file';
  const message = details + " On Line " + line + " of " + filename;
  console.error(message);
  game.state.add('ErrorScreen', ErrorScreen);
  game.state.start('ErrorScreen', false, false, message, 'Boot');
};`;
document.head.appendChild(script);