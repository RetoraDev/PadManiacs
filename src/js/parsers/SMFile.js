class SMFile {
  static generateSMContent(songData) {
    let smContent = "";
    
    // Basic metadata
    smContent += `#TITLE:${songData.title || ""};\n`;
    smContent += `#SUBTITLE:${songData.subtitle || ""};\n`;
    smContent += `#ARTIST:${songData.artist || ""};\n`;
    smContent += `#TITLETRANSLIT:${songData.titleTranslit || ""};\n`;
    smContent += `#SUBTITLETRANSLIT:${songData.subtitleTranslit || ""};\n`;
    smContent += `#ARTISTTRANSLIT:${songData.artistTranslit || ""};\n`;
    smContent += `#GENRE:${songData.genre || ""};\n`;
    smContent += `#CREDIT:${songData.credit || ""};\n`;
    smContent += `#BANNER:${this.getFilename(songData.banner)};\n`;
    smContent += `#BACKGROUND:${this.getFilename(songData.background)};\n`;
    smContent += `#LYRICSPATH:${this.getFilename(songData.lyrics)};\n`;
    smContent += `#CDTITLE:${this.getFilename(songData.cdtitle)};\n`;
    smContent += `#MUSIC:${this.getFilename(songData.audio)};\n`;
    smContent += `#OFFSET:${songData.offset || 0};\n`;
    smContent += `#SAMPLESTART:${songData.sampleStart || 0};\n`;
    smContent += `#SAMPLELENGTH:${songData.sampleLength || 10};\n`;
    
    // BPM changes
    if (songData.bpmChanges && songData.bpmChanges.length > 0) {
      smContent += `#BPMS:${songData.bpmChanges.map(bpm => `${bpm.beat.toFixed(3)}=${bpm.bpm.toFixed(3)}`).join(",")};\n`;
    } else {
      smContent += `#BPMS:;\n`;
    }
    
    // Stops
    if (songData.stops && songData.stops.length > 0) {
      smContent += `#STOPS:${songData.stops.map(stop => `${stop.beat.toFixed(3)}=${stop.len.toFixed(3)}`).join(",")};\n`;
    } else {
      smContent += `#STOPS:;\n`;
    }
    
    // BG changes
    if (songData.backgrounds && songData.backgrounds.length > 0) {
      const bgChanges = songData.backgrounds.map(bg => 
        `${bg.beat.toFixed(3)}=${bg.file || ""}=${bg.opacity || 1}=${bg.fadeIn || 0}=${bg.fadeOut || 0}=${bg.effect || 0}`
      ).join(",");
      smContent += `#BGCHANGES:${bgChanges};\n`;
    } else {
      smContent += `#BGCHANGES:;\n`;
    }
    
    // Notes for each difficulty
    if (songData.difficulties && songData.notes) {
      songData.difficulties.forEach(diff => {
        const diffKey = diff.type + diff.rating;
        const notes = songData.notes[diffKey];
        if (notes) {
          smContent += this.generateNotesSection(diff, notes);
        }
      });
    }
    
    return smContent;
  }
  
  static getFilename(url) {
    if (!url || url === "no-media") return "";
    // Extract filename from URL or path
    const parts = url.split(/[\\/]/);
    return parts[parts.length - 1] || "";
  }
  
  static generateNotesSection(difficulty, notes) {
    let notesContent = `#NOTES:\n`;
    notesContent += `     dance-single:\n`;
    notesContent += `     :\n`;
    notesContent += `     ${difficulty.type}:\n`;
    notesContent += `     ${difficulty.rating}:\n`;
    notesContent += `     0.000000:\n`; // Groove radar values, all zeros
    
    // Group notes by measure and find the highest resolution needed
    const measures = {};
    let highestResolution = 4; // Start with 4th notes
    
    notes.forEach(note => {
      const measure = Math.floor(note.beat / 4);
      if (!measures[measure]) measures[measure] = [];
      measures[measure].push(note);
      
      // Determine required resolution
      const fractionalBeat = note.beat - Math.floor(note.beat);
      if (fractionalBeat > 0) {
        const resolution = this.findRequiredResolution(fractionalBeat);
        highestResolution = Math.max(highestResolution, resolution);
      }
    });
    
    // Convert measures to SM format
    const measureNumbers = Object.keys(measures).map(Number).sort((a, b) => a - b);
    const rowsPerMeasure = highestResolution;
    
    measureNumbers.forEach(measureNum => {
      const measureNotes = measures[measureNum];
      const measureContent = this.convertMeasureToSM(measureNotes, measureNum, rowsPerMeasure);
      notesContent += measureContent;
    });
    
    notesContent += `;\n`;
    return notesContent;
  }
  
  static findRequiredResolution(fractionalBeat) {
    const resolutions = [4, 8, 12, 16, 24, 32, 48, 64, 96, 192];
    for (const resolution of resolutions) {
      const snapped = Math.round(fractionalBeat * resolution) / resolution;
      if (Math.abs(fractionalBeat - snapped) < 0.001) {
        return resolution;
      }
    }
    return 192; // Default to highest resolution
  }
  
  static convertMeasureToSM(notes, measureNum, rowsPerMeasure) {
    const measureContent = [];
    const measureStartBeat = measureNum * 4;
    const rowDuration = 4 / rowsPerMeasure;
    
    // Initialize empty rows
    for (let i = 0; i < rowsPerMeasure; i++) {
      measureContent.push("0000");
    }
    
    // Fill rows with notes
    notes.forEach(note => {
      const positionInMeasure = note.beat - measureStartBeat;
      const rowIndex = Math.round(positionInMeasure / rowDuration);
      
      if (rowIndex >= 0 && rowIndex < rowsPerMeasure) {
        let row = measureContent[rowIndex];
        const chars = row.split('');
        
        // Determine note character
        let noteChar = "0";
        switch (note.type) {
          case "1": noteChar = "1"; break; // Tap
          case "2": noteChar = "2"; break; // Hold start
          case "3": noteChar = "3"; break; // Hold end
          case "4": noteChar = "4"; break; // Roll start
          case "M": noteChar = "M"; break; // Mine
        }
        
        chars[note.column] = noteChar;
        measureContent[rowIndex] = chars.join('');
      }
    });
    
    return measureContent.join(",\n") + ",\n";
  }
  
  static parseSMContent(smContent, baseUrl = "") {
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
      sampleStart: 0,
      sampleLength: 10,
      baseUrl: baseUrl
    };

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
        case "#BANNER":
          if (p[1]) out.banner = this.resolveFileUrl(p[1], baseUrl);
          break;
        case "#BACKGROUND":
          if (p[1]) out.background = this.resolveFileUrl(p[1], baseUrl);
          break;
        case "#MUSIC":
          if (p[1]) {
            out.audio = p[1];
            out.audioUrl = this.resolveFileUrl(p[1], baseUrl);
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

    // Process notes from steps
    for (let key in steps) {
      out.notes[key] = this.parseNotes(steps[key], out.bpmChanges, out.stops);
    }

    return out;
  }
  
  static resolveFileUrl(filename, baseUrl) {
    if (!filename) return null;
    if (filename.startsWith('http') || filename.startsWith('//')) {
      return filename;
    }
    return baseUrl + filename;
  }
  
  static parseNotes(measureData, bpmChanges, stops) {
    const notes = [];
    let measureIndex = 0;
    
    // Helper function to convert measure+position to beat
    const getBeat = (measure, position, totalRows) => {
      return measure * 4 + (position / totalRows) * 4;
    };
    
    // Helper function to convert beat to seconds
    const beatToSec = (beat) => {
      const parser = new LocalSMParser();
      return parser.beatToSec(bpmChanges, stops, beat);
    };
    
    for (let m in measureData) {
      const measure = measureData[m].trim();
      if (!measure) continue;
      
      // Determine rows per measure based on note length
      const totalRows = measure.length / 4;
      
      for (let row = 0; row < totalRows; row++) {
        const rowData = measure.substr(row * 4, 4);
        
        for (let col = 0; col < 4; col++) {
          const noteChar = rowData[col];
          if (noteChar !== '0') {
            const beat = getBeat(measureIndex, row, totalRows);
            const note = {
              type: noteChar,
              beat: beat,
              sec: beatToSec(beat),
              column: col
            };
            
            // Handle hold notes
            if (noteChar === '2' || noteChar === '4') {
              // Find the corresponding end note (3)
              let endFound = false;
              for (let futureRow = row + 1; futureRow < totalRows && !endFound; futureRow++) {
                const futureChar = measure.substr(futureRow * 4 + col, 1);
                if (futureChar === '3') {
                  const endBeat = getBeat(measureIndex, futureRow, totalRows);
                  note.beatLength = endBeat - beat;
                  note.secLength = beatToSec(endBeat) - beatToSec(beat);
                  note.beatEnd = endBeat;
                  note.secEnd = beatToSec(endBeat);
                  endFound = true;
                }
              }
            }
            
            notes.push(note);
          }
        }
      }
      
      measureIndex++;
    }
    
    return notes;
  }
}
