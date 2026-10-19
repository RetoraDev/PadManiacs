/**
 * @class DecodeAvi
 * @category Game States
 * @summary Decodes AVI background videos to H.264 MP4 with FFmpeg.wasm
 * @constructor
 * @features
 * Decodes every AVI background (#BACKGROUND, #BGCHANGES, #BGVIDEO) of a song
 * Decode & Play mode swaps the in-memory URLs with MP4 blob URLs, then starts the target state
 * Decode & Replace mode also writes ${name}.mp4 next to the chart and patches the .SM file
 * Honors Account.settings.aviSettings (preset, CRF, scale to game resolution, delete original)
 * @description
 * Browsers cannot play MPEG-4 Part 2 video stored in .avi containers. DecodeAvi
 * runs before Play when a song references AVI backgrounds: it transcodes each
 * AVI into an H.264 MP4 via the bundled FFmpeg.wasm lite build, then either
 * continues to the target state with blob URLs (Decode & Play) or persists the
 * MP4 files and rewrites the chart on disk first (Decode & Replace).
 * @example
 * // Decode & play a song that has AVI backgrounds
 * game.state.start("DecodeAvi", true, false, {
 *   mode: "play",
 *   song,
 *   targetState: "Play",
 *   targetParams: [{ chart: song, difficultyIndex: 0 }, 0, undefined, undefined, null]
 * });
 */
class DecodeAvi {
  /**
   * Stores the decode job description.
   * @param {Object} options - Job options
   * @param {string} [options.mode='play'] - 'play' (transient) or 'replace' (write MP4 + patch chart)
   * @param {Object} options.song - The parsed song/chart whose AVI backgrounds should be decoded
   * @param {string} [options.targetState='SongSelect'] - State to start when decoding finishes
   * @param {Array} [options.targetParams=[]] - Parameters forwarded to the target state
   * @param {string} [options.backState='MainMenu'] - State to return to when decoding fails
   * @param {Array} [options.backParams=[]] - Parameters forwarded to the back state
   */
  init(options = {}) {
    /** @type {string} Decode mode: 'play' or 'replace' */
    this.mode = options.mode === "replace" ? "replace" : "play";
    /** @type {Object} The song whose AVI backgrounds are being decoded */
    this.song = options.song;
    /** @type {string} Game state to start once decoding finishes */
    this.targetState = options.targetState || "SongSelect";
    /** @type {Array} Parameters forwarded to the target state */
    this.targetParams = options.targetParams || [];
    /** @type {string} Game state to return to when decoding fails */
    this.backState = options.backState || "MainMenu";
    /** @type {Array} Parameters forwarded to the back state on failure */
    this.backParams = options.backParams || [];
    /** @type {boolean} Set when the player cancelled decoding with SELECT + B */
    this.canceled = false;
    /** @type {boolean} Set once run() has settled (finished, failed or cancelled) */
    this.runSettled = false;
    /** @type {boolean} Set once a game state has been started from this screen */
    this.exited = false;
  }

  /**
   * Phaser state hook that builds the decode screen and starts the conversion.
   */
  create() {
    game.camera.fadeIn(0x000000);

    /** @type {FuturisticLines} Decorative animated background line effect */
    this.futuristicLines = new FuturisticLines();
    /** @type {BackgroundGradient} Ambient gradient overlay for the loading background */
    this.backgroundGradient = new BackgroundGradient();
    /** @type {NavigationHint} On-screen hint bar showing the SELECT + B cancel combo */
    this.navigationHint = new NavigationHint("decode_avi");
    /** @type {WindowManager} Manages the status window */
    this.windowManager = new WindowManager();

    gamepad.releaseAll();

    const statusWindow = this.windowManager.createWindow(3, 4, 22, 9, "1");
    statusWindow.fontTint = 0x76fcde;
    /** @type {Window} Status window showing the current decode step */
    this.statusWindow = statusWindow;

    /** @type {Text} Title line inside the status window */
    this.titleText = new Text(8, 8, __("Decoding AVI Backgrounds||Decodificando Fondos AVI"), {
      ...FONTS.default,
      tint: 0x76fcde
    });
    statusWindow.addChild(this.titleText);

    /** @type {Text} Current file / stage line */
    this.statusText = new Text(8, 18, "", { ...FONTS.default });
    statusWindow.addChild(this.statusText);

    /** @type {Phaser.Graphics} Progress bar backing shape */
    this.progressBack = game.add.graphics(8, 30);
    this.progressBack.beginFill(0x22272e, 1);
    this.progressBack.drawRect(0, 0, 160, 6);
    this.progressBack.endFill();
    statusWindow.addChild(this.progressBack);

    /** @type {Phaser.Graphics} Progress bar fill */
    this.progressFill = game.add.graphics(8, 30);
    this.progressFill.beginFill(0x76fcde, 1);
    this.progressFill.drawRect(0, 0, 0, 6);
    this.progressFill.endFill();
    statusWindow.addChild(this.progressFill);

    this.run().catch(error => {
      this.runSettled = true;
      if (this.canceled) {
        this.goBack();
      } else {
        this.showError(error);
      }
    });
  }

  /**
   * Phaser lifecycle hook called every frame to poll gamepad input
   * and watch for the SELECT + B cancel combo.
   */
  update() {
    gamepad.update();
    this.windowManager.update();

    if (this.canceled || this.exited) return;

    const held = gamepad.held || {};
    const pressed = gamepad.pressed || {};
    const cancelCombo =
      (held.select && pressed.b) ||
      (held.b && pressed.select);
    if (cancelCombo) this.cancel();
  }

  /**
   * Cancels decoding instantly: kills the FFmpeg worker so the in-flight
   * conversion rejects immediately, then returns to the back state.
   */
  cancel() {
    if (this.canceled) return;
    this.canceled = true;

    // run() already settled (error dialog on screen) — leave right away.
    if (this.runSettled) {
      this.goBack();
      return;
    }

    this.setStatus(__("Cancelling...||Cancelando..."));
    AviTranscoder.shutdown();
  }

  /**
   * Throws when the player has cancelled, so pending awaits stop promptly.
   */
  throwIfCanceled() {
    if (this.canceled) {
      throw new Error("canceled");
    }
  }

  /**
   * Updates the status line and progress bar.
   * @param {string} message - Status text to display
   * @param {number} [fraction=0] - Progress fraction from 0 to 1
   */
  setStatus(message, fraction = null) {
    if (this.statusText) this.statusText.text = message;
    if (fraction !== null && this.progressFill) {
      const width = Math.max(0, Math.min(160, Math.round(fraction * 160)));
      this.progressFill.clear();
      this.progressFill.beginFill(0x76fcde, 1);
      this.progressFill.drawRect(0, 0, width, 6);
      this.progressFill.endFill();
    }
  }

  /**
   * Decodes every AVI reference of the song, persists replacements when needed,
   * then starts the target state.
   * @returns {Promise<void>} Resolves once the target state has been started
   */
  async run() {
    if (!this.song) {
      throw new Error("DecodeAvi started without a song");
    }

    const fileNames = AviTools.getAviFileNames(this.song);
    if (fileNames.length === 0) {
      // Nothing to decode — bail out gracefully into the target state.
      this.finish();
      return;
    }

    const aviSettings = Object.assign(
      {},
      DEFAULT_ACCOUNT.settings.aviSettings,
      Account.settings.aviSettings || {}
    );

    /** @type {boolean} Whether the MP4 files should be written back to the song folder */
    const persist = this.mode === "replace" && AviTools.canPersist(this.song);
    /** @type {Object} Map of old AVI chart names to new MP4 chart names */
    const nameMap = {};

    let done = 0;
    for (const fileName of fileNames) {
      this.throwIfCanceled();
      this.setStatus(
        __("Decoding||Decodificando") + ` ${fileName} (${done + 1}/${fileNames.length})`,
        done / fileNames.length
      );

      const cacheKey = AviTranscoder.cacheKey(this.song, fileName);
      const cached = AviTranscoder.getCached(cacheKey);

      let blob;
      let blobUrl;
      if (cached) {
        // Already decoded earlier this session — reuse it instantly.
        blob = cached.blob;
        blobUrl = cached.url;
        this.setStatus(
          __("Decoded (cached)||Decodificado (en caché)") + ` ${fileName} (${done + 1}/${fileNames.length})`,
          (done + 1) / fileNames.length
        );
      } else {
        let bytes;
        
        if (this.song.files) {
          bytes = new Uint8Array(await FileTools.readAsArrayBuffer(this.song.files[fileName.toLowerCase()]));
        } else {
          throw new Error("No way to get the video file");
        }
        
        this.throwIfCanceled();

        blob = await AviTranscoder.convertToBlob(bytes, {
          preset: aviSettings.ffmpegPreset,
          crf: aviSettings.crf,
          scaleHeight: aviSettings.scaleToGameRes ? game.height : 0,
          inputExt: ".avi",
          onLog: data => console.log(data.message),
          onProgress: p => {
            if (p && typeof p.progress === "number") {
              const overall = (done + Math.max(0, Math.min(1, p.progress))) / fileNames.length;
              this.setStatus(
                __("Decoding||Decodificando") + ` ${fileName} (${done + 1}/${fileNames.length})`,
                overall
              );
            }
          }
        });
        this.throwIfCanceled();

        blobUrl = URL.createObjectURL(blob);
        AviTranscoder.putCached(cacheKey, blob, blobUrl);
      }

      if (persist) {
        const newFileName = AviTools.toMp4Name(fileName);
        const written = await this.persistFile(newFileName, blob);
        if (written) {
          nameMap[fileName] = newFileName;
          AviTools.applyReplacement(this.song, fileName, blobUrl, newFileName, blob);
          if (aviSettings.deleteOriginal) {
            await this.deleteOriginal(fileName);
          }
        } else {
          // Could not write next to the chart — fall back to a transient swap.
          AviTools.applyReplacement(this.song, fileName, blobUrl, null, blob);
        }
      } else {
        AviTools.applyReplacement(this.song, fileName, blobUrl, null, blob);
      }

      done++;
    }

    if (persist && Object.keys(nameMap).length > 0) {
      this.throwIfCanceled();
      this.setStatus(__("Updating Chart...||Actualizando Chart..."), 1);
      await this.patchChartFile(nameMap);
      this.throwIfCanceled();
    }

    this.setStatus(__("Done||Listo"), 1);
    this.finish();
  }

  /**
   * Writes the decoded MP4 into the song's folder on external storage.
   * @param {string} fileName - Video file name
   * @param {Blob} blob - Decoded MP4 blob
   * @returns {Promise<boolean>} True when the file was written successfully
   */
  async persistFile(fileName, blob) {
    try {
      const fileSystem = new FileSystemTools();
      if (fileSystem.platform === "fallback") return false;
      const dirEntry = await fileSystem.getDirectory(this.song.externalPath);
      const file = await fileSystem.saveFile(dirEntry, blob, fileName);
      return true;
    } catch (error) {
      console.warn(`Couldn't write ${newFileName} next to the chart:`, error);
      return false;
    }
  }

  /**
   * Deletes the original AVI file from the song folder when the setting is enabled.
   * @param {string} fileName - Original AVI chart file name
   * @returns {Promise<boolean>} True when the file was deleted
   */
  async deleteOriginal(fileName) {
    try {
      const fileSystem = new FileSystemTools();
      if (fileSystem.platform === "fallback") return false;

      const dirEntry = await fileSystem.getDirectory(this.song.externalPath);
      const entries = await fileSystem.listFiles(dirEntry);
      const target = entries.find(e => e.name && e.name.toLowerCase() === fileName.toLowerCase());
      if (!target) return false;

      await fileSystem.deleteFile(target);
      return true;
    } catch (error) {
      console.warn(`Couldn't delete original AVI ${fileName}:`, error);
      return false;
    }
  }

  /**
   * Rewrites the song's .SM chart text so AVI references point at the MP4s.
   * @param {Object} nameMap - Map of old AVI chart names to new MP4 chart names
   * @returns {Promise<void>} Resolves once the chart has been rewritten (or skipped)
   */
  async patchChartFile(nameMap) {
    try {
      const fileSystem = new FileSystemTools();
      if (fileSystem.platform === "fallback") return;

      const dirEntry = await fileSystem.getDirectory(this.song.externalPath);
      const entries = await fileSystem.listFiles(dirEntry);
      const chartEntry = entries.find(e => {
        if (!e.name) return false;
        const lower = e.name.toLowerCase();
        return lower.endsWith(".sm")
      });
      if (!chartEntry) return;

      const chartFile = await fileSystem.getFile(chartEntry);
      
      const content = await fileSystem.readFileContent(chartFile);
      const patched = AviTools.patchSMContent(content, nameMap);

      if (patched !== content) {
        await fileSystem.writeFile(chartEntry, patched);
      }
    } catch (error) {
      console.warn("Couldn't patch the chart file:", error);
    }
  }

  /**
   * Starts the target state with the (possibly patched) song parameters.
   */
  finish() {
    if (this.canceled || this.exited) return;
    this.exited = true;
    game.state.start(this.targetState, true, false, ...this.targetParams);
  }

  /**
   * Returns to the back state (used after cancelling a decode run).
   */
  goBack() {
    if (this.exited) return;
    this.exited = true;
    game.state.start(this.backState, true, false, ...this.backParams);
  }

  /**
   * Shows a decode error and offers to return to song select.
   * @param {Error} error - The failure that aborted decoding
   */
  showError(error) {
    if (this.exited) return;
    console.error("AVI decoding failed:", error);
    if (this.statusText) {
      this.statusText.text = __("AVI decoding failed:||Falló la decodificación AVI:") + " " + (error && error.message ? error.message : error);
    }

    const dialog = new DialogWindow(
      __("AVI decoding failed. Return to song select?||La decodificación AVI falló. ¿Volver a selección de canción?"),
      { buttons: [__("Yes||Sí"), __("No||No")] }
    );
    dialog.onConfirm.add(buttonIndex => {
      dialog.destroy();
      if (buttonIndex === 0) {
        this.goBack();
      }
    });
  }
}
