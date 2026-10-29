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
   * Replaces AVI file names inside raw .SM chart text with their MP4 counterparts.
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
    const parts = fileName.split('.');
    parts.pop();
    const noExt = parts.join('.');
    
    return `${noExt}.mp4`;
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
