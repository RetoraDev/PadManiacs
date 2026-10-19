/**
 * @class AviTranscoder
 * @category Utils
 * @summary FFmpeg.wasm wrapper that decodes AVI (MPEG-4 Part 2) backgrounds to H.264 MP4
 * @constructor
 * @features
 * Lazily spawns a classic Web Worker running the ffmpeg-wasm-lite core
 * Converts AVI bytes into an H.264 MP4 Blob using the account's ffmpeg settings
 * Reports encoding progress and supports preset / CRF / scale-to-game-resolution options
 * @description
 * AviTranscoder bridges the game and the bundled FFmpeg.wasm lite build
 * (lib/ffmpeg). Browsers cannot natively decode MPEG-4 Part 2 video stored in
 * .avi containers, so background videos of that kind are transcoded to H.264
 * MP4 blobs before Play loads them. The worker stays alive between conversions.
 * @example
 * const blob = await AviTranscoder.convertToBlob(aviBytes, {
 *   preset: 'ultrafast',
 *   crf: 32,
 *   scaleHeight: game.height
 * });
 * const url = URL.createObjectURL(blob);
 */
class AviTranscoder {
  /**
   * Directory URL that holds the FFmpeg wasm assets.
   * @type {string}
   */
  static get FF_DIR() {
    return CURRENT_ENVIRONMENT == ENVIRONMENT.CORDOVA ? window.ff_bundle_dir || window.ff_dir : window.ff_dir;
  }

  /** @type {Worker|null} Shared ffmpeg worker instance */
  static worker = null;
  /** @type {number} Monotonic message id counter for the worker protocol */
  static msgId = 0;
  /** @type {Map<number, {resolve:Function, reject:Function}>} Pending worker requests */
  static pending = new Map();
  /** @type {Promise|null} Cached LOAD promise so the core initializes once */
  static ready = null;
  /** @type {number} Job counter used to give each conversion unique FS paths */
  static jobCounter = 0;

  /**
   * Session cache of decoded MP4s keyed by song folder + file name.
   * Bounded LRU so returning to SongSelect never re-encodes a video while
   * memory stays capped. Entries are plain references: URLs are never revoked
   * because in-memory song objects may still point at them; eviction only
   * drops our reference so the blob becomes collectable once nothing uses it.
   * @type {Map<string, {blob: Blob, url: string, size: number}>}
   */
  static cache = new Map();
  /** @type {number} Maximum number of decoded videos kept in the cache */
  static CACHE_MAX_ENTRIES = 8;
  /** @type {number} Maximum total bytes kept in the cache (256 MB) */
  static CACHE_MAX_BYTES = 256 * 1024 * 1024;

  /**
   * Builds the cache key for one AVI reference of a song.
   * @param {Object} song - Parsed chart/song object
   * @param {string} fileName - Chart file name (e.g. "bg.avi")
   * @returns {string} Stable cache key
   */
  static cacheKey(song, fileName) {
    const base =
      (song && (song.externalPath || song.baseUrl || song.folderName || song.title)) || "";
    return (base + "::" + fileName).toLowerCase();
  }

  /**
   * Looks up a cached decode and refreshes its recency.
   * @param {string} key - Cache key from cacheKey()
   * @returns {{blob: Blob, url: string, size: number}|null} Cached entry or null
   */
  static getCached(key) {
    const entry = AviTranscoder.cache.get(key);
    if (!entry) return null;
    AviTranscoder.cache.delete(key);
    AviTranscoder.cache.set(key, entry);
    return entry;
  }

  /**
   * Stores a decoded MP4 in the cache and evicts oldest entries when over budget.
   * @param {string} key - Cache key from cacheKey()
   * @param {Blob} blob - Decoded MP4 blob
   * @param {string} url - Object URL of the blob
   */
  static putCached(key, blob, url) {
    AviTranscoder.cache.delete(key);
    AviTranscoder.cache.set(key, { blob, url, size: blob ? blob.size : 0 });
    AviTranscoder.evictCache();
  }

  /**
   * Evicts oldest cache entries until both the entry count and byte budget fit.
   */
  static evictCache() {
    let totalBytes = 0;
    for (const entry of AviTranscoder.cache.values()) totalBytes += entry.size || 0;

    while (
      AviTranscoder.cache.size > AviTranscoder.CACHE_MAX_ENTRIES ||
      (totalBytes > AviTranscoder.CACHE_MAX_BYTES && AviTranscoder.cache.size > 1)
    ) {
      const oldestKey = AviTranscoder.cache.keys().next().value;
      const oldest = AviTranscoder.cache.get(oldestKey);
      AviTranscoder.cache.delete(oldestKey);
      totalBytes -= oldest ? oldest.size || 0 : 0;
    }
  }

  /**
   * Sends a message to the ffmpeg worker and returns its reply.
   * @param {string} type - Worker message type (LOAD, EXEC, WRITE_FILE, ...)
   * @param {Object} data - Payload for the worker
   * @returns {Promise<*>} Resolves with the worker's data payload
   */
  static send(type, data) {
    return new Promise((resolve, reject) => {
      const id = AviTranscoder.msgId++;
      AviTranscoder.pending.set(id, { resolve, reject });
      AviTranscoder.worker.postMessage({ id, type, data });
    });
  }

  /**
   * Spawns the worker and loads the WASM core once per session.
   * @param {Function} [onLog] - Receives each ffmpeg log line ({message})
   * @param {Function} [onProgress] - Receives ffmpeg progress ({progress, time})
   * @returns {Promise<void>} Resolves when the core is ready to exec
   */
  static ensureLoaded(onLog, onProgress) {
    if (AviTranscoder.ready) return AviTranscoder.ready;
  
    AviTranscoder.ready = new Promise((resolve, reject) => {
      // Cordova caches file:// worker scripts aggressively — cache-bust it.
      const workerUrl = AviTranscoder.FF_DIR + "ffmpeg-worker.js?v=" + Date.now();
      console.log("[AviTranscoder] spawning worker at", workerUrl);
  
      AviTranscoder.worker = new Worker(workerUrl);
  
      let workerReachedUs = false;
  
      AviTranscoder.worker.onmessage = ev => {
        const m = ev.data;
        workerReachedUs = true;
  
        // ─── Diagnostic channel from the instrumented worker ───
        if (m.type === "BOOT") {
          console.log(
            "%c[worker " + (m.data && m.data.stage) + "]",
            "color:#0af;font-weight:bold",
            m.data
          );
          // If the worker couldn't even importScripts the core, the pending
          // LOAD promise will be rejected by the ERROR message that follows,
          // but if only BOOT stages arrive with a failure stage and no ERROR,
          // reject here so the UI doesn't hang.
          const stage = m.data && m.data.stage;
          if (
            stage === "importScripts-FAILED" ||
            stage === "factory-MISSING" ||
            stage === "createFFmpegCore-FAILED" ||
            stage === "uncaught-error" ||
            stage === "unhandled-rejection"
          ) {
            // The worker will also send an ERROR with id; this is a fallback
            // in case it was killed before posting it.
            setTimeout(() => {
              if (AviTranscoder.ready && AviTranscoder.pending.size > 0) {
                const pendingLoad = AviTranscoder.pending.get(0);
                if (pendingLoad) {
                  AviTranscoder.pending.delete(0);
                  pendingLoad.reject(
                    new Error(
                      "Worker failed at stage '" + stage + "': " +
                      JSON.stringify(m.data)
                    )
                  );
                }
              }
            }, 0);
          }
          return;
        }
  
        if (m.type === "LOG") {
          if (onLog) onLog(m.data);
          return;
        }
        if (m.type === "PROGRESS") {
          if (onProgress) onProgress(m.data);
          return;
        }
  
        const p = AviTranscoder.pending.get(m.id);
        if (!p) {
          console.warn("[AviTranscoder] stray worker reply:", m);
          return;
        }
        AviTranscoder.pending.delete(m.id);
        if (m.type === "ERROR") p.reject(new Error(m.data));
        else p.resolve(m.data);
      };
  
      AviTranscoder.worker.onerror = e => {
        if (e && e.preventDefault) e.preventDefault();
  
        // Cordova often leaves message/filename empty on file:// workers.
        console.error("[AviTranscoder] WORKER ONERROR:", {
          message: e && e.message,
          filename: e && e.filename,
          lineno: e && e.lineno,
          colno: e && e.colno,
          error: e && e.error,
          type: e && e.type,
          workerReachedUs,
          workerUrl,
        });
  
        if (!workerReachedUs) {
          // No BOOT message ever arrived → the worker script never ran.
          // This is the file:// worker restriction on Android WebView.
          reject(new Error(
            "Worker never executed at " + workerUrl + ". " +
            "This is an origin/CSP/path problem — file:// workers are blocked " +
            "by Android WebView. onerror: " + JSON.stringify({
              message: e && e.message,
              filename: e && e.filename,
            })
          ));
        } else {
          reject(new Error(
            "FFmpeg worker failed: " +
            ((e && e.message) || (e && e.type) || "unknown") +
            (e && e.filename ? " @ " + e.filename + ":" + e.lineno : "")
          ));
        }
      };
  
      AviTranscoder.worker.onmessageerror = e => {
        console.error("[AviTranscoder] WORKER MESSAGEERROR:", e);
      };
  
      AviTranscoder.send("LOAD", {
        coreURL: "./ffmpeg-core.js",
        wasmURL: "./ffmpeg-core.wasm"
      }).then(resolve, reject);
    });
  
    AviTranscoder.ready.catch(() => { AviTranscoder.ready = null; });
    return AviTranscoder.ready;
  }
  
  static ensureLoaded_old(onLog, onProgress) {
    if (AviTranscoder.ready) return AviTranscoder.ready;

    AviTranscoder.ready = new Promise((resolve, reject) => {
      AviTranscoder.worker = new Worker(AviTranscoder.FF_DIR + "ffmpeg-worker.js");
      AviTranscoder.worker.onmessage = ev => {
        const m = ev.data;
        if (m.type === "LOG") {
          if (onLog) onLog(m.data);
          return;
        }
        if (m.type === "PROGRESS") {
          if (onProgress) onProgress(m.data);
          return;
        }
        const p = AviTranscoder.pending.get(m.id);
        if (!p) return;
        AviTranscoder.pending.delete(m.id);
        if (m.type === "ERROR") p.reject(new Error(m.data));
        else p.resolve(m.data);
      };
      AviTranscoder.worker.onerror = e => {
        reject(new Error("FFmpeg worker failed: " + (e.message || e.data || "unknown")));
      };
      AviTranscoder.send("LOAD", {
        coreURL: "./ffmpeg-core.js",
        wasmURL: "./ffmpeg-core.wasm"
      }).then(resolve, reject);
    });

    AviTranscoder.ready.catch(() => { AviTranscoder.ready = null; });
    return AviTranscoder.ready;
  }


  /**
   * Transcodes raw AVI (or any ffmpeg-readable) bytes into an H.264 MP4 Blob.
   * @param {Uint8Array} inputBytes - Raw video file bytes
   * @param {Object} [options] - Encoding options
   * @param {string} [options.preset='ultrafast'] - libx264 preset
   * @param {number} [options.crf=32] - Constant rate factor (18 near-lossless .. 32 tiny)
   * @param {number} [options.scaleHeight=0] - When > 0, scale output to this height (even width kept)
   * @param {string} [options.inputExt='.avi'] - Input extension hint for the virtual input path
   * @param {Function} [options.onProgress] - Receives 0..1 progress
   * @param {Function} [options.onLog] - Receives ffmpeg log lines
   * @returns {Promise<Blob>} The encoded video/mp4 blob
   */
  static async convertToBlob(inputBytes, options = {}) {
    const {
      preset = "ultrafast",
      crf = 32,
      scaleHeight = 0,
      inputExt = ".avi",
      onProgress,
      onLog,
    } = options;
    
    await AviTranscoder.ensureLoaded(onLog, onProgress);

    const jobId = ++AviTranscoder.jobCounter;
    const inName = `/input_${jobId}${inputExt}`;
    const outName = `/output_${jobId}.mp4`;

    try {
      console.log('Writing input file...');
      await AviTranscoder.send("WRITE_FILE", { path: inName, data: new Uint8Array(inputBytes) });

      const args = ["-hide_banner", "-nostdin", "-i", inName];
      if (scaleHeight > 0) {
        args.push("-vf", `scale=-2:${Math.round(scaleHeight)}:flags=bicubic`);
      }
      args.push(
        "-c:v", "libx264",
        "-preset", String(preset),
        "-crf", String(crf),
        "-pix_fmt", "yuv420p",
        "-an",
        "-movflags", "+faststart",
        "-y", outName
      );

      console.log('Executing conversion...');
      const ret = await AviTranscoder.send("EXEC", { args, timeout: -1 });
      if (ret !== 0) {
        throw new Error(`FFmpeg exited with code ${ret} while converting ${inName}`);
      }

      const data = await AviTranscoder.send("READ_FILE", { path: outName, encoding: "binary" });
      return new Blob([data], { type: "video/mp4" });
    } finally {
      AviTranscoder.send("DELETE_FILE", { path: inName }).catch(() => {});
      AviTranscoder.send("DELETE_FILE", { path: outName }).catch(() => {});
    }
  }

  /**
   * Terminates the worker and forgets the loaded core (frees the ~7 MB WASM heap).
   */
  static shutdown() {
    if (AviTranscoder.worker) {
      AviTranscoder.worker.terminate();
      AviTranscoder.worker = null;
    }
    AviTranscoder.pending.forEach(p => p.reject(new Error("FFmpeg worker shut down")));
    AviTranscoder.pending.clear();
    AviTranscoder.ready = null;
  }
}

/**
 * @class AviTools
 * @category Utils
 * @summary Song-level helpers for detecting, decoding and rewriting AVI backgrounds
 * @constructor
 * @features
 * Detects AVI references in a song (#BACKGROUND, #BGCHANGES video entries, videoUrl)
 * Reads AVI bytes from external song file maps or by fetching resolved URLs
 * Applies in-memory replacements so Play uses the decoded MP4 blob URLs
 * Patches .SM chart text so Decode & Replace updates the chart on disk
 * @description
 * AviTools works on the parsed song data structures produced by LocalSMParser
 * and ExternalSMParser. It never touches the filesystem itself; persistence is
 * handled by the DecodeAvi state through FileSystemTools.
 * @example
 * if (AviTools.songHasAvi(song)) {
 *   game.state.start("DecodeAvi", true, false, { mode: 'play', song });
 * }
 */
class AviTools {
  /**
   * Checks whether a file name refers to an AVI video.
   * @param {string} name - File name to test
   * @returns {boolean} True when the name ends with .avi
   */
  static isAviFileName(name) {
    return typeof name === "string" && /\.avi$/i.test(name.trim());
  }

  /**
   * Collects every AVI reference inside a parsed song.
   * References already swapped for a decoded MP4 (session-marked) are skipped.
   * @param {Object} song - Parsed chart/song object
   * @returns {Array<Object>} References: {kind, fileName, [index]} kind is 'background' (#BACKGROUND) or 'bgchange' (#BGCHANGES entry)
   */
  static getAviRefs(song) {
    const refs = [];
    if (!song) return refs;

    const alreadyDecoded = name =>
      !!(song.__decodedAvi && song.__decodedAvi[String(name).toLowerCase()]);

    if (AviTools.isAviFileName(song.background) && !alreadyDecoded(song.background)) {
      refs.push({ kind: "background", fileName: song.background });
    }

    if (Array.isArray(song.backgrounds)) {
      song.backgrounds.forEach((bg, index) => {
        if (bg && AviTools.isAviFileName(bg.file) && !alreadyDecoded(bg.file)) {
          refs.push({ kind: "bgchange", fileName: bg.file, index });
        }
      });
    }

    if (AviTools.isAviFileName(song.video) && !alreadyDecoded(song.video)) {
      refs.push({ kind: "video", fileName: song.video });
    }

    return refs;
  }

  /**
   * Lists the unique AVI file names referenced by a song.
   * @param {Object} song - Parsed chart/song object
   * @returns {Array<string>} Unique lowercased-preserving file names
   */
  static getAviFileNames(song) {
    const names = AviTools.getAviRefs(song).map(r => r.fileName);
    return names.filter((name, i) => names.indexOf(name) === i);
  }

  /**
   * Checks whether a song contains any AVI background/video reference that
   * still needs decoding. Already-decoded references are reclaimed from the
   * session cache first, so songs rescanned after Results (or reloaded from
   * disk) jump straight to Play without prompting or re-encoding.
   * @param {Object} song - Parsed chart/song object
   * @returns {boolean} True when at least one undecoded AVI reference exists
   */
  static songHasAvi(song) {
    AviTools.reclaimDecoded(song);
    return AviTools.getAviRefs(song).length > 0;
  }

  /**
   * Re-attaches cached decoded MP4s to a (possibly freshly parsed) song object.
   * For every AVI reference whose decode is still in the session cache, the
   * song's URL/filename fields are swapped in memory and the reference is
   * marked decoded. Uncached references are left untouched.
   * @param {Object} song - Parsed chart/song object
   */
  static reclaimDecoded(song) {
    if (!song || typeof AviTranscoder === "undefined" || !AviTranscoder.cache) return;

    AviTools.getAviRefs(song).forEach(ref => {
      const entry = AviTranscoder.getCached(AviTranscoder.cacheKey(song, ref.fileName));
      if (entry) {
        AviTools.applyReplacement(song, ref.fileName, entry.url, null, entry.blob);
      }
    });
  }

  /**
   * Finds the resolved URL currently backing a song file name, if any.
   * @param {Object} song - Parsed chart/song object
   * @param {string} fileName - Chart file name (e.g. "bg.avi")
   * @returns {string|null} A playable URL or null when unknown
   */
  static findUrlFor(song, fileName) {
    if (!song || !fileName) return null;
    const lower = fileName.toLowerCase();

    if (song.background && song.background.toLowerCase() === lower && song.backgroundUrl) {
      return song.backgroundUrl;
    }

    if (Array.isArray(song.backgrounds)) {
      for (const bg of song.backgrounds) {
        if (bg && bg.file && bg.file.toLowerCase() === lower && bg.url) {
          return bg.url;
        }
      }
    }

    if (song.video && song.video.toLowerCase() === lower && song.videoUrl) {
      return song.videoUrl;
    }

    return null;
  }

  /**
   * Rewrites every in-memory reference from an AVI file to its decoded replacement.
   * Keeps the original chart file names when newFileName is not given, so the
   * transient Decode & Play flow never desyncs from the chart on disk.
   * @param {Object} song - Parsed chart/song object
   * @param {string} fileName - Original AVI chart file name
   * @param {string} newUrl - Blob URL of the decoded MP4
   * @param {string} [newFileName] - New chart file name (e.g. "bg.mp4") when replacing on disk
   * @param {Blob} [blob] - Decoded MP4 blob, registered in the song's file map when given
   */
  static applyReplacement(song, fileName, newUrl, newFileName = null, blob = null) {
    if (!song || !fileName) return;
    const lower = fileName.toLowerCase();
    const resolvedName = newFileName || fileName;

    // Mark the original AVI name as decoded so detection stops reporting it
    // (transient Decode & Play keeps the .avi chart name but plays the MP4).
    song.__decodedAvi = song.__decodedAvi || {};
    song.__decodedAvi[lower] = newUrl;

    if (song.background && song.background.toLowerCase() === lower) {
      song.background = resolvedName;
      song.backgroundUrl = newUrl;
    }

    if (Array.isArray(song.backgrounds)) {
      song.backgrounds.forEach(bg => {
        if (bg && bg.file && bg.file.toLowerCase() === lower) {
          bg.file = resolvedName;
          bg.url = newUrl;
          bg.type = "video";
        }
      });
    }

    if (song.video && song.video.toLowerCase() === lower) {
      song.video = resolvedName;
      song.videoUrl = newUrl;
    }

    if (song.files && blob) {
      song.files[resolvedName.toLowerCase()] = new File([blob], resolvedName, { type: "video/mp4" });
    }
  }

  /**
   * Replaces AVI file names inside raw .SM/.SSC chart text with their MP4 counterparts.
   * @param {string} content - Raw chart text
   * @param {Object} nameMap - Map of old file name (key) to new file name
   * @returns {string} Patched chart text
   */
  static patchSMContent(content, nameMap) {
    if (!content || !nameMap) return content;
    let out = content;
    Object.keys(nameMap).forEach(oldName => {
      const newName = nameMap[oldName];
      if (!oldName || !newName || oldName === newName) return;
      // Chart file names are plain tokens; replace case-insensitively as whole names.
      const escaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      out = out.replace(new RegExp(escaped, "gi"), newName);
    });
    return out;
  }

  /**
   * Builds the MP4 counterpart name for an AVI chart file name.
   * @param {string} fileName - Original AVI file name
   * @returns {string} File name with the .avi extension swapped for .mp4
   */
  static toMp4Name(fileName) {
    return fileName.replace(/\.avi$/i, ".mp4");
  }

  /**
   * Whether the current runtime can write back into an external song folder.
   * @param {Object} song - Parsed chart/song object
   * @returns {boolean} True for storage-backed external songs on NW.js/Cordova
   */
  static canPersist(song) {
    return !!(
      song &&
      song.isExternal &&
      song.externalPath &&
      (CURRENT_ENVIRONMENT === ENVIRONMENT.NWJS || CURRENT_ENVIRONMENT === ENVIRONMENT.CORDOVA)
    );
  }
}
