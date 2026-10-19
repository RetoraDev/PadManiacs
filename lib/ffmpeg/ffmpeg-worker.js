/// Classic web worker for FFmpeg — fully instrumented for Cordova debugging.
/// Drop-in replacement: contains FFMessageType, describeError, resolveUrl,
/// boot(), load(), exec(), ffprobe(), all FS ops, and the dispatcher.
/// Every stage posts a BOOT message with the exact resolved URL.

// ─────────────────────────────────────────────────────────────────────────────
// Stage 0: prove the worker script actually executed, and report its URL.
// If the main thread never sees this BOOT message, the worker never started
// (origin/CSP/path problem — nothing below this line can run).
// ─────────────────────────────────────────────────────────────────────────────
(function boot0() {
  let href = "(unknown)", origin = "(unknown)";
  try { href = self.location && self.location.href || String(self.location); } catch (e) {}
  try { origin = self.location && self.location.origin || "(empty)"; } catch (e) {}
  self.postMessage({
    type: "BOOT",
    data: {
      stage: "script-start",
      workerHref: href,
      workerOrigin: origin,
      userAgent: (navigator && navigator.userAgent) || "(none)",
      isSecureContext: self.isSecureContext,
      hasFetch: typeof self.fetch === "function",
      hasImportScripts: typeof self.importScripts === "function",
      hasCreateFFmpegCore: typeof self.createFFmpegCore === "function",
    },
  });
})();

// ─────────────────────────────────────────────────────────────────────────────
// Robust error serializer (Cordova sanitizes Error.toString()).
// ─────────────────────────────────────────────────────────────────────────────
function describeError(err) {
  if (err == null) return "unknown (null/undefined)";
  if (typeof err === "string") return err;
  const out = [];
  try { if (err.name) out.push("name=" + err.name); } catch (e) {}
  try { if (err.message) out.push("message=" + err.message); } catch (e) {}
  try { if (err.code != null) out.push("code=" + err.code); } catch (e) {}
  try { if (err.stack) out.push("stack=" + err.stack); } catch (e) {}
  if (out.length === 0) {
    try {
      const j = JSON.stringify(err);
      if (j && j !== "{}") return j;
    } catch (e) {}
    try { return Object.prototype.toString.call(err) + " " + String(err); }
    catch (e) { return "(unserializable error)"; }
  }
  return out.join(" | ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Global safety nets — surface anything that escapes try/catch.
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener("error", (e) => {
  self.postMessage({
    type: "BOOT",
    data: {
      stage: "uncaught-error",
      message: e && e.message,
      filename: e && e.filename,
      lineno: e && e.lineno,
      colno: e && e.colno,
      error: describeError(e && e.error),
    },
  });
  if (e && e.preventDefault) e.preventDefault();
});
self.addEventListener("unhandledrejection", (e) => {
  self.postMessage({
    type: "BOOT",
    data: { stage: "unhandled-rejection", reason: describeError(e && e.reason) },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BOOT channel helper — every stage goes through this.
// ─────────────────────────────────────────────────────────────────────────────
function boot(stage, extra) {
  const payload = Object.assign({ stage }, extra || {});
  try { self.postMessage({ type: "BOOT", data: payload }); } catch (e) {
    // If postMessage itself fails, we can't tell the main thread — best effort
    try { console.error("[worker BOOT-postMessage-failed]", stage, describeError(e)); } catch (_) {}
  }
  try { console.log("[worker:" + stage + "]", JSON.stringify(payload)); } catch (e) {}
}

// ─────────────────────────────────────────────────────────────────────────────
// Absolute-URL resolver — the "working url" reporter.
// ─────────────────────────────────────────────────────────────────────────────
function resolveUrl(url) {
  if (!url) return url;
  try {
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url; // already absolute
    return new URL(url, self.location.href).href;
  } catch (e) {
    return self.location.href.replace(/[^/]*$/, "") + url;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Protocol constants (must match the main thread exactly).
// ─────────────────────────────────────────────────────────────────────────────
const FFMessageType = {
  LOAD: "LOAD", EXEC: "EXEC", FFPROBE: "FFPROBE",
  WRITE_FILE: "WRITE_FILE", READ_FILE: "READ_FILE", DELETE_FILE: "DELETE_FILE",
  RENAME: "RENAME", CREATE_DIR: "CREATE_DIR", LIST_DIR: "LIST_DIR", DELETE_DIR: "DELETE_DIR",
  ERROR: "ERROR", DOWNLOAD: "DOWNLOAD", PROGRESS: "PROGRESS", LOG: "LOG",
  MOUNT: "MOUNT", UNMOUNT: "UNMOUNT",
};

let ffmpeg = null;

// ─────────────────────────────────────────────────────────────────────────────
// LOAD — heavily instrumented, reports every resolved asset URL.
// ─────────────────────────────────────────────────────────────────────────────
const load = async ({ coreURL, wasmURL, workerURL }) => {
  const first = !ffmpeg;

  const absCore   = resolveUrl(coreURL);
  const absWasm   = resolveUrl(wasmURL || String(coreURL || "").replace(/\.js$/g, ".wasm"));
  const absWorker = resolveUrl(workerURL || String(coreURL || "").replace(/\.js$/g, ".worker.js"));

  boot("load-begin", {
    workerHref: self.location.href,
    coreURL_in: coreURL,
    coreURL_resolved: absCore,
    wasmURL_in: wasmURL,
    wasmURL_resolved: absWasm,
    workerURL_resolved: absWorker,
  });

  // 1) importScripts the core
  boot("importScripts-begin", { url: absCore });
  try {
    importScripts(absCore);
  } catch (e) {
    const detail = describeError(e);
    boot("importScripts-FAILED", { url: absCore, error: detail });
    throw new Error("importScripts(" + absCore + ") failed: " + detail);
  }
  boot("importScripts-ok", {
    url: absCore,
    createFFmpegCoreType: typeof self.createFFmpegCore,
  });

  // 2) Verify the factory got defined
  if (typeof self.createFFmpegCore !== "function") {
    boot("factory-MISSING", {
      url: absCore,
      globalKeys: Object.keys(self).filter(k => /ffmpeg|create/i.test(k)),
    });
    throw new Error(
      "createFFmpegCore is not a function after importScripts(" + absCore + "). " +
      "Script loaded but did not define the factory (CSP? wrong file? truncated?)."
    );
  }

  // 3) Instantiate the wasm core
  const mainScriptUrlOrBlob =
    absCore + "#" + btoa(JSON.stringify({ wasmURL: absWasm, workerURL: absWorker }));

  boot("createFFmpegCore-begin", { mainScriptUrlOrBlob, wasmURL: absWasm });

  try {
    ffmpeg = await self.createFFmpegCore({ mainScriptUrlOrBlob });
  } catch (e) {
    const detail = describeError(e);
    boot("createFFmpegCore-FAILED", { wasmURL: absWasm, error: detail });
    const hint =
      /fetch|network|failed to load|status/i.test(detail)
        ? " (wasm fetch failed — check wasm URL / CSP / file:// restrictions)"
        : /memory|abort|rangeerror/i.test(detail)
        ? " (wasm init aborted — likely OOM or wrong binary)"
        : /instantiate|compile/i.test(detail)
        ? " (wasm compile failed — wrong MIME type or missing .wasm)"
        : "";
    throw new Error("createFFmpegCore failed for wasm=" + absWasm + ": " + detail + hint);
  }

  boot("createFFmpegCore-ok", {
    hasFS: !!(ffmpeg && ffmpeg.FS),
    hasExec: !!(ffmpeg && typeof ffmpeg.exec === "function"),
  });

  try {
    ffmpeg.setLogger((data) => self.postMessage({ type: FFMessageType.LOG, data }));
    ffmpeg.setProgress((data) => self.postMessage({ type: FFMessageType.PROGRESS, data }));
  } catch (e) {
    boot("setLogger-FAILED", { error: describeError(e) });
    throw e;
  }

  boot("load-done", {});
  return first;
};

// ─────────────────────────────────────────────────────────────────────────────
// exec / ffprobe / FS operations.
// ─────────────────────────────────────────────────────────────────────────────
const exec = ({ args, timeout = -1 }) => {
  ffmpeg.setTimeout(timeout);
  ffmpeg.exec(...args);
  const ret = ffmpeg.ret;
  ffmpeg.reset();
  return ret;
};

const ffprobe = ({ args, timeout = -1 }) => {
  ffmpeg.setTimeout(timeout);
  ffmpeg.ffprobe(...args);
  const ret = ffmpeg.ret;
  ffmpeg.reset();
  return ret;
};

const writeFile  = ({ path, data }) => { ffmpeg.FS.writeFile(path, data); return true; };
const readFile   = ({ path, encoding }) => ffmpeg.FS.readFile(path, { encoding });
const deleteFile = ({ path }) => { ffmpeg.FS.unlink(path); return true; };
const rename     = ({ oldPath, newPath }) => { ffmpeg.FS.rename(oldPath, newPath); return true; };
const createDir  = ({ path }) => { ffmpeg.FS.mkdir(path); return true; };
const listDir    = ({ path }) => {
  const names = ffmpeg.FS.readdir(path);
  const nodes = [];
  for (const name of names) {
    const stat = ffmpeg.FS.stat(path + "/" + name);
    nodes.push({ name, isDir: ffmpeg.FS.isDir(stat.mode) });
  }
  return nodes;
};
const deleteDir = ({ path }) => { ffmpeg.FS.rmdir(path); return true; };
const mount = ({ fsType, options, mountPoint }) => {
  const fs = ffmpeg.FS.filesystems[fsType];
  if (!fs) return false;
  ffmpeg.FS.mount(fs, options, mountPoint);
  return true;
};
const unmount = ({ mountPoint }) => { ffmpeg.FS.unmount(mountPoint); return true; };

// ─────────────────────────────────────────────────────────────────────────────
// Dispatcher — logs every message in and every error out.
// ─────────────────────────────────────────────────────────────────────────────
self.onmessage = async (event) => {
  const msg = event && event.data;
  if (!msg || typeof msg !== "object") {
    boot("bad-message", { received: String(msg) });
    return;
  }

  const { id, type, data: _data } = msg;
  boot("message-received", { id, type });

  const trans = [];
  let data;
  const started = (typeof performance !== "undefined" && performance.now)
    ? performance.now() : Date.now();

  try {
    if (type !== FFMessageType.LOAD && !ffmpeg) {
      throw new Error("ffmpeg is not loaded, call LOAD first (got " + type + ")");
    }

    switch (type) {
      case FFMessageType.LOAD:        data = await load(_data); break;
      case FFMessageType.EXEC:        data = exec(_data); break;
      case FFMessageType.FFPROBE:     data = ffprobe(_data); break;
      case FFMessageType.WRITE_FILE:  data = writeFile(_data); break;
      case FFMessageType.READ_FILE:   data = readFile(_data); break;
      case FFMessageType.DELETE_FILE: data = deleteFile(_data); break;
      case FFMessageType.RENAME:      data = rename(_data); break;
      case FFMessageType.CREATE_DIR:  data = createDir(_data); break;
      case FFMessageType.LIST_DIR:    data = listDir(_data); break;
      case FFMessageType.DELETE_DIR:  data = deleteDir(_data); break;
      case FFMessageType.MOUNT:       data = mount(_data); break;
      case FFMessageType.UNMOUNT:     data = unmount(_data); break;
      default:
        throw new Error("unknown message type: " + type);
    }

    const elapsed = ((typeof performance !== "undefined" && performance.now)
      ? performance.now() : Date.now()) - started;
    boot("message-ok", { id, type, elapsedMs: Math.round(elapsed) });
  } catch (e) {
    const detail = describeError(e);
    boot("message-FAILED", { id, type, error: detail });
    try {
      self.postMessage({ id, type: FFMessageType.ERROR, data: detail });
    } catch (pe) {
      try { console.error("[worker] could not post ERROR:", describeError(pe)); } catch (_) {}
    }
    return;
  }

  if (data instanceof Uint8Array) trans.push(data.buffer);
  try {
    self.postMessage({ id, type, data }, trans);
  } catch (e) {
    const detail = describeError(e);
    boot("postMessage-FAILED", { id, type, error: detail });
    try {
      self.postMessage({ id, type: FFMessageType.ERROR, data: "postMessage failed: " + detail });
    } catch (_) {}
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Final stage marker
// ─────────────────────────────────────────────────────────────────────────────
boot("dispatcher-ready", { workerHref: self.location.href });