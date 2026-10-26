/**
 * @class ExternalSMParser
 * @category Parser Classes
 * @summary Parses .SM files for external songs
 * @constructor
 * @description
 * ExternalSMParser handles user-imported songs stored in an external
 * directory. Unlike LocalSMParser it works entirely from an in-memory
 * file map and creates blob/object URLs for media playback. It supports
 * both the classic .SM format which allows per-chart BPM overrides and
 * additional metadata.
 * @example
 * // Parsing an externally imported .SM file
 * const parser = new ExternalSMParser();
 * const files = {}; // map of lowercase filenames to File objects
 * const smText = await FileTools.readTextFile(smFileObject);
 * const songData = await parser.parseSM(files, smText);
 * console.log(songData.title, Object.keys(songData.notes).length, 'charts');
 */
class ExternalSMParser {
  // TODO: Make this class use SMFile
  /**
   * Parses raw .SM content and returns a song object
   * @param {Object} files - A map of lowercase filenames to File objects
   * @param {string} smContent - The raw text content of the file
   * @returns {Promise<Object>} The parsed song data object
   */
  async parseSM(files, smContent) {
    let out = {};
    let isSSC = smContent.includes("#VERSION:");

    if (isSSC) {
      throw "SSC format is not supported yet"
    }

    // Clean and parse SM content
    let sm = smContent
      .replace(/\/\/.*/g, "")
      .replace(/\r?\n|\r/g, "")
      .split(";");

    for (let i = sm.length - 1; i >= 0; i -= 1) {
      if (sm[i]) {
        sm[i] = sm[i].split(/:/g);
        for (let p in sm[i]) sm[i][p] = sm[i][p].trim();
      } else sm.splice(i, 1);
    }

    let steps = {};
    out.bpmChanges = [];
    out.stops = [];
    out.notes = {};
    out.backgrounds = [];
    out.banner = "no-media";
    out.bannerUrl = "";
    out.difficulties = [];
    out.background = "no-media";
    out.backgroundUrl = "";
    out.cdtitle = "no-media";
    out.cdtitleUrl = "";
    out.lyrics = "";
    out.lyricsContent = null;
    out.audioUrl = null;
    out.videoUrl = null;
    out.files = files;
    out.sampleStart = 0;
    out.sampleLength = 10;

    for (let i in sm) {
      let p = sm[i];
      switch (p[0]) {
        case "#TITLE":
          out.title = p[1];
          break;
        case "#SUBTITLE":
          out.subtitle = p[1];
          break;
        case "#ARTIST":
          out.artist = p[1];
          break;
        case "#TITLETRANSLIT":
          out.titleTranslit = p[1];
          break;
        case "#SUBTITLETRANSLIT":
          out.subtitleTranslit = p[1];
          break;
        case "#ARTISTTRANSLIT":
          out.artistTranslit = p[1];
          break;
        case "#GENRE":
          out.genre = p[1];
          break;
        case "#CREDIT":
          out.credit = p[1];
          break;
        case "#BGCHANGES":
          if (p[1]) {
            p[1].split(",").forEach(entry => {
              entry = entry.trim();
              if (!entry) return;

              const parts = entry.split("=").filter(x => x !== "");
              if (parts.length < 6) return;

              const bgEntry = {
                beat: parseFloat(parts[0]),
                file: parts[1],
                opacity: parseFloat(parts[2]),
                fadeIn: parseInt(parts[3]) || 0,
                fadeOut: parseInt(parts[4]) || 0,
                effect: parseInt(parts[5]) || 0,
                type: "image",
                startTime: 0,
                duration: 0
              };

              if (bgEntry.file) {
                const ext = bgEntry.file.split(".").pop().toLowerCase();
                bgEntry.type = VIDEO_EXTENSIONS.includes(ext) ? "video" : "image";
                // Create URL for the file if it exists
            if (files[bgEntry.file.toLowerCase()]) {
              const file = files[bgEntry.file.toLowerCase()];
              if (file.localURL) {
                bgEntry.url = file.localURL;
              } else if (file.nativeURL) {
                bgEntry.url = file.nativeURL;
              } else {
                try {
                  bgEntry.url = URL.createObjectURL(file);
                } catch (e) {
                  bgEntry.url = file.localURL || file.nativeURL || '';
                }
              }
              if (typeof bgEntry.url === 'string') {
                bgEntry.url = bgEntry.url
                  .replace('cdvfile://', 'file://')
                  .replace('localhost/persistent/', '/storage/emulated/0/');
              }
            }
              }

              if (parts.length > 6) {
                bgEntry.duration = parseFloat(parts[6]) || 0;
                bgEntry.startTime = parseFloat(parts[7]) || 0;
              }

              out.backgrounds.push(bgEntry);
            });
          }
          break;
        case "#BANNER":
          if (p[1] && files[p[1].toLowerCase()]) {
            const file = files[p[1].toLowerCase()];
            out.banner = p[1];
            if (file.localURL) {
              out.bannerUrl = file.localURL;
            } else if (file.nativeURL) {
              out.bannerUrl = file.nativeURL;
            } else {
              try {
                out.bannerUrl = URL.createObjectURL(file);
              } catch (e) {
                out.bannerUrl = file.localURL || file.nativeURL || '';
              }
            }
            if (typeof out.bannerUrl === 'string') {
              out.bannerUrl = out.bannerUrl
                .replace('cdvfile://', 'file://')
                .replace('localhost/persistent/', '/storage/emulated/0/');
            }
          }
          break;
        case "#CDTITLE":
          if (p[1] && files[p[1].toLowerCase()]) {
            const file = files[p[1].toLowerCase()];
            out.cdtitle = p[1];
            if (file.localURL) {
              out.cdtitleUrl = file.localURL;
            } else if (file.nativeURL) {
              out.cdtitleUrl = file.nativeURL;
            } else {
              try {
                out.cdtitleUrl = URL.createObjectURL(file);
              } catch (e) {
                out.cdtitleUrl = file.localURL || file.nativeURL || '';
              }
            }
            if (typeof out.cdtitleUrl === 'string') {
              out.cdtitleUrl = out.cdtitleUrl
                .replace('cdvfile://', 'file://')
                .replace('localhost/persistent/', '/storage/emulated/0/');
            }
          }
          break;
        case "#SAMPLESTART":
          if (p[1]) out.sampleStart = parseFloat(p[1]);
          break;
        case "#SAMPLELENGTH":
          if (p[1]) out.sampleLength = parseFloat(p[1]);
          break;
        case "#BACKGROUND":
          if (p[1] && files[p[1].toLowerCase()]) {
            const file = files[p[1].toLowerCase()];
            out.background = p[1];
            if (file.localURL) {
              out.backgroundUrl = file.localURL;
            } else if (file.nativeURL) {
              out.backgroundUrl = file.nativeURL;
            } else {
              try {
                out.backgroundUrl = URL.createObjectURL(file);
              } catch (e) {
                out.backgroundUrl = file.localURL || file.nativeURL || '';
              }
            }
            if (typeof out.backgroundUrl === 'string') {
              out.backgroundUrl = out.backgroundUrl
                .replace('cdvfile://', 'file://')
                .replace('localhost/persistent/', '/storage/emulated/0/');
            }
          }
          break;
        case "#LYRICSPATH":
          if (p[1] && files[p[1].toLowerCase()]) {
            const file = files[p[1].toLowerCase()];
            out.lyrics = p[1];
            out.lyricsContent = await this.readFileContent(file);
          }
          break;
        case "#MUSIC":
          if (p[1]) {
            out.audio = p[1];
            if (files[p[1].toLowerCase()]) {
              const file = files[p[1].toLowerCase()];
              if (file.localURL) {
                out.audioUrl = file.localURL;
              } else if (file.nativeURL) {
                out.audioUrl = file.nativeURL;
              } else {
                try {
                  out.audioUrl = URL.createObjectURL(file);
                } catch (e) {
                  out.audioUrl = file.localURL || file.nativeURL || '';
                }
              }
              if (typeof out.audioUrl === 'string') {
                out.audioUrl = out.audioUrl
                  .replace('cdvfile://', 'file://')
                  .replace('localhost/persistent/', '/storage/emulated/0/');
              }
            }
          }
          break;
        case "#OFFSET":
          out.offset = Number(p[1]);
          break;
        case "#BPMS": {
          let bx = p[1].split(",");
          bx = bx.filter(i => /=/.exec(i));
          for (let i in bx) {
            let v = bx[i].split("=");
            bx[i] = { beat: Number(v[0]), bpm: Number(v[1]) };
          }
          out.bpmChanges = out.bpmChanges.concat(bx);
          break;
        }
        case "#STOPS": {
          let bx = p[1].split(",");
          bx = bx.filter(i => i.includes("="));
          for (let i in bx) {
            let v = bx[i].split("=");
            bx[i] = { beat: Number(v[0]), len: Number(v[1]) };
          }
          out.stops = out.stops.concat(bx);
          break;
        }
        case "#NOTES":
          steps[p[3] + p[4]] = p[6].split(",");
          out.difficulties.push({
            type: p[3],
            rating: p[4]
          });
          break;
      }
    }

    // Process BPM changes and stops
    out.bpmChanges.sort((a, b) => a.beat - b.beat);
    if (out.bpmChanges.length === 0 || out.bpmChanges[0].beat !== 0) {
      throw "No starting bpm";
    }
    out.bpmChanges[0].sec = 0;
    for (let i = 1; i < out.bpmChanges.length; i++) {
      out.bpmChanges[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.bpmChanges[i].beat);
    }
    for (let i = 0; i < out.stops.length; i++) {
      out.stops[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.stops[i].beat);
    }

    // Process notes
    for (let key in steps) {
      let unfinHolds = [null, null, null, null];
      out.notes[key] = [];
      for (let m in steps[key]) {
        steps[key][m] = steps[key][m].trim();
        if (steps[key][m].length % 4) {
          throw `Invalid length on measure ${m}, length is ${steps[key][m].length}`;
        }
        steps[key][m] = steps[key][m].match(/(.{4})/g);

        let t = steps[key][m].length;
        for (let l in steps[key][m]) {
          let nt = steps[key][m][l];
          let note = [{}, {}, {}, {}];
          let b = m * 4 + (l / t) * 4;
          for (let c = 0; c < note.length; c++) {
            switch (nt[c]) {
              case "3": // Hold end
                if (unfinHolds[c] == null) {
                  console.warn(`hold end without any hold before`);
                } else {
                  let i = out.notes[key][unfinHolds[c]];
                  i.beatEnd = b;
                  i.beatLength = b - i.beat;
                  i.secEnd = this.beatToSec(out.bpmChanges, out.stops, b);
                  i.secLength = this.beatToSec(out.bpmChanges, out.stops, b) - this.beatToSec(out.bpmChanges, out.stops, i.beat);
                }
                unfinHolds[c] = null;
              case "0": // Empty
                note[c] = null;
                continue;
              case "4": // Roll start
              case "2": // Hold start
                if (unfinHolds[c]) {
                  console.warn(`new hold started before last ended`);
                }
                unfinHolds[c] = out.notes[key].length + c;
              case "1": // Regular note
              case "M": // Mine
                note[c].type = nt[c];
                break;
              default:
                console.warn(`invalid note type ${nt[c]}`);
            }
            note[c].beat = b;
            note[c].sec = this.beatToSec(out.bpmChanges, out.stops, b);
            note[c].column = c;
          }
          out.notes[key] = out.notes[key].concat(note);
        }
      }
      out.notes[key] = out.notes[key].filter(i => i !== null);
    }

    return out;
  }
  
  /**
   * Reads a File object as text via FileTools.
   * @param {File} file - The File object to read
   * @returns {Promise<string>} The text content of the file
   */
  readFileContent(file) {
    return FileTools.readTextFile(file);
  }

  /**
   * Finds the BPM change entry active at a given time value.
   * @param {Array} bpmChanges - Sorted array of BPM change objects
   * @param {number} time - The beat or second value to search for
   * @param {string} valueType - The property name to compare ('beat' or 'sec')
   * @returns {Object} The BPM change entry active at the given time
   */
  getLastBpm(bpmChanges, time, valueType) {
    return bpmChanges.find((e, i, a) => i + 1 == a.length || a[i + 1][valueType] >= time);
  }

  /**
   * Converts a beat position to seconds accounting for BPM changes and stops.
   * @param {Array} bpmChanges - Sorted BPM change entries with sec values
   * @param {Array} stops - Stop entries with beat and len values
   * @param {number} beat - The beat position to convert
   * @returns {number} The equivalent time in seconds
   */
  beatToSec(bpmChanges, stops, beat) {
    if (!bpmChanges || bpmChanges.length === 0) return beat;

    let b = this.getLastBpm(bpmChanges, beat, "beat");
    let x = ((beat - b.beat) / b.bpm) * 60 + b.sec;
    let s = stops.filter(({ beat: i }) => i >= b.beat && i < beat).map(i => i.len);
    for (let i in s) x += s[i];
    return x;
  }
}
