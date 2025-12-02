class ExternalSMParser {
  // TODO: Make this class use SMFile
  parseSM(files, smContent) {
    let out = {};
    let isSSC = smContent.includes("#VERSION:");

    if (isSSC) {
      return this.parseSSC(files, smContent);
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
                bgEntry.type = ["mp4", "avi", "mov"].includes(ext) ? "video" : "image";
                // Create URL for the file if it exists
                if (files[bgEntry.file.toLowerCase()]) {
                  const file = files[bgEntry.file.toLowerCase()];
                  bgEntry.url = file.localURL ? file.localURL : URL.createObjectURL(file);
                  bgEntry.url = bgEntry.url
                    .replace('cdvfile://', 'file://')
                    .replace('localhost/persistent/', '/storage/emulated/0/');
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
            out.bannerUrl = file.localURL ? file.localURL : URL.createObjectURL(file);
            out.bannerUrl = out.bannerUrl
              .replace('cdvfile://', 'file://')
              .replace('localhost/persistent/', '/storage/emulated/0/');
          }
          break;
        case "#CDTITLE":
          if (p[1] && files[p[1].toLowerCase()]) {
            const file = files[p[1].toLowerCase()];
            out.cdtitle = p[1];
            out.cdtitleUrl = file.localURL ? file.localURL : URL.createObjectURL(file);
            out.cdtitleUrl = out.cdtitleUrl
              .replace('cdvfile://', 'file://')
              .replace('localhost/persistent/', '/storage/emulated/0/');
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
            out.backgroundUrl = file.localURL ? file.localURL : URL.createObjectURL(file);
            out.backgroundUrl = out.backgroundUrl
              .replace('cdvfile://', 'file://')
              .replace('localhost/persistent/', '/storage/emulated/0/');
          }
          break;
        case "#LYRICSPATH":
          if (p[1] && files[p[1].toLowerCase()]) {
            const file = files[p[1].toLowerCase()];
            out.lyrics = file.localURL ? file.localURL : URL.createObjectURL(file);
            out.lyrics = out.lyrics
              .replace('cdvfile://', 'file://')
              .replace('localhost/persistent/', '/storage/emulated/0/');
          }
          break;
        case "#MUSIC":
          if (p[1]) {
            out.audio = p[1];
            if (files[p[1].toLowerCase()]) {
              const file = files[p[1].toLowerCase()];
              out.audioUrl = file.localURL ? file.localURL : URL.createObjectURL(file);
              out.audioUrl = out.audioUrl
                .replace('cdvfile://', 'file://')
                .replace('localhost/persistent/', '/storage/emulated/0/');
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
        if (steps[key][m].length % 4) throw `Invalid length on measure ${m}, length is ${steps[key][m].length}`;
        steps[key][m] = steps[key][m].match(/(.{4})/g);

        let t = steps[key][m].length;
        for (let l in steps[key][m]) {
          let nt = steps[key][m][l];
          let note = [{}, {}, {}, {}];
          let b = m * 4 + (l / t) * 4;
          for (let c = 0; c < note.length; c++) {
            switch (nt[c]) {
              case "3": // Hold end
                if (unfinHolds[c] == null) throw `hold end without any hold before`;
                {
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
                if (unfinHolds[c]) throw `new hold started before last ended`;
                unfinHolds[c] = out.notes[key].length + c;
              case "1": // Regular note
              case "M": // Mine
                note[c].type = nt[c];
                break;
              default:
                throw `invalid note type ${nt[c]}`;
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

  parseSSC(files, sscContent) {
    const sections = sscContent.split(/\/\/-+/);
    const headerSection = sections[0];
    const chartSections = sections.slice(1);

    const out = {
      bpmChanges: [],
      stops: [],
      notes: {},
      backgrounds: [],
      banner: "no-media",
      difficulties: [],
      background: "no-media",
      cdtitle: null,
      audioUrl: null,
      videoUrl: null,
      files: files,
      sampleStart: 0,
      sampleLength: 10
    };

    // Parse global metadata
    const headerTags = {};
    headerSection
      .split("\n")
      .filter(line => line.trim().startsWith("#"))
      .forEach(line => {
        const [key, ...rest] = line.slice(1).split(":");
        let value = rest.join(":").trim().replace(/;+$/, "");
        if (["BPMS", "STOPS", "BGCHANGES"].includes(key)) {
          value = value
            .split(",")
            .map(v => v.trim())
            .join(",");
        }
        headerTags[key] = value;
      });

    // Get audio file URL
    if (headerTags.MUSIC && files[headerTags.MUSIC.toLowerCase()]) {
      const audioFile = files[headerTags.MUSIC.toLowerCase()];
      out.audioUrl = audioFile.localURL ? audioFile.localURL : URL.createObjectURL(audioFile);
      out.audio = headerTags.MUSIC;
    }

    Object.assign(out, {
      title: headerTags.TITLE || "",
      subtitle: headerTags.SUBTITLE || "",
      artist: headerTags.ARTIST || "",
      titleTranslit: headerTags.TITLETRANSLIT || "",
      subtitleTranslit: headerTags.SUBTITLETRANSLIT || "",
      artistTranslit: headerTags.ARTISTTRANSLIT || "",
      genre: headerTags.GENRE || "",
      credit: headerTags.CREDIT || "",
      offset: Number(headerTags.OFFSET) || 0,
      sampleStart: Number(headerTags.SAMPLESTART) || 0,
      sampleLength: Number(headerTags.SAMPLELENGTH) || 10
    });

    // Get banner
    if (headerTags.BANNER && files[headerTags.BANNER.toLowerCase()]) {
      const bannerFile = files[headerTags.BANNER.toLowerCase()];
      out.banner = bannerFile.name;
      out.bannerUrl = bannerFile.localURL ? bannerFile.localURL : URL.createObjectURL(bannerFile);
    }

    // Get background
    if (headerTags.BACKGROUND && files[headerTags.BACKGROUND.toLowerCase()]) {
      const bgFile = files[headerTags.BACKGROUND.toLowerCase()];
      out.background = bgFile.name;
      out.backgroundUrl = bgFile.localURL ? bgFile.localURL : URL.createObjectURL(bgFile);
    }

    // Parse BPMs
    if (headerTags.BPMS) {
      const bpmList = headerTags.BPMS.split(",").map(entry => {
        const [beat, bpm] = entry.split("=");
        return { beat: Number(beat), bpm: Number(bpm) };
      });
      out.bpmChanges = bpmList;
    }

    // Parse stops
    if (headerTags.STOPS) {
      const stopList = headerTags.STOPS.split(",").map(entry => {
        const [beat, len] = entry.split("=");
        return { beat: Number(beat), len: Number(len) };
      });
      out.stops = stopList;
    }

    // Process BPM changes and stops timing
    if (out.bpmChanges.length > 0) {
      out.bpmChanges.sort((a, b) => a.beat - b.beat);
      out.bpmChanges[0].sec = 0;
      for (let i = 1; i < out.bpmChanges.length; i++) {
        out.bpmChanges[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.bpmChanges[i].beat);
      }
      for (let i = 0; i < out.stops.length; i++) {
        out.stops[i].sec = this.beatToSec(out.bpmChanges, out.stops, out.stops[i].beat);
      }
    }

    // Parse chart sections (simplified - you may want to expand this)
    chartSections.forEach(section => {
      const lines = section.split("\n").filter(line => line.trim() !== "");
      const chartTags = {};
      let inNotes = false;
      let noteData = [];

      lines.forEach(line => {
        if (line.startsWith("#")) {
          if (line.startsWith("#NOTES")) {
            inNotes = true;
          } else if (!line.startsWith("#NOTEDATA") && !line.startsWith("#CHARTNAME")) {
            const [key, ...rest] = line.slice(1).split(":");
            const value = rest.join(":").trim().replace(/;+$/, "");
            chartTags[key] = value;
          }
        } else if (inNotes) {
          if (line.trim() === ";") {
            inNotes = false;
          } else {
            noteData.push(line.trim());
          }
        }
      });

      if (chartTags.DIFFICULTY && chartTags.METER) {
        const difficultyKey = `${chartTags.DIFFICULTY}${chartTags.METER}`;
        out.difficulties.push({
          type: chartTags.DIFFICULTY,
          rating: chartTags.METER
        });

        // Convert note data to our format (simplified)
        out.notes[difficultyKey] = this.convertSSCNotes(noteData, out.bpmChanges, out.stops);
      }
    });

    return out;
  }

  convertSSCNotes(noteData, bpmChanges, stops) {
    const notes = [];
    let measureIndex = 0;

    noteData.forEach(measure => {
      const rows = measure.split("\n").filter(row => row.trim() !== "");
      const rowsPerMeasure = rows.length;

      rows.forEach((row, rowIndex) => {
        const beat = measureIndex * 4 + (rowIndex / rowsPerMeasure) * 4;

        for (let column = 0; column < 4 && column < row.length; column++) {
          const noteChar = row[column];
          if (noteChar !== "0" && noteChar !== "3") {
            // Skip empty and hold ends
            const note = {
              type: noteChar,
              beat: beat,
              sec: this.beatToSec(bpmChanges, stops, beat),
              column: column
            };
            notes.push(note);
          }
        }
      });

      measureIndex++;
    });

    return notes;
  }

  getLastBpm(bpmChanges, time, valueType) {
    return bpmChanges.find((e, i, a) => i + 1 == a.length || a[i + 1][valueType] >= time);
  }

  beatToSec(bpmChanges, stops, beat) {
    if (!bpmChanges || bpmChanges.length === 0) return beat;

    let b = this.getLastBpm(bpmChanges, beat, "beat");
    let x = ((beat - b.beat) / b.bpm) * 60 + b.sec;
    let s = stops.filter(({ beat: i }) => i >= b.beat && i < beat).map(i => i.len);
    for (let i in s) x += s[i];
    return x;
  }
}
