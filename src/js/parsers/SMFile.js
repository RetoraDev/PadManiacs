class SMFile {
  static generateSM(songData) {
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
    smContent += `#OFFSET:${(songData.offset || 0).toFixed(6)};\n`;
    smContent += `#SAMPLESTART:${(songData.sampleStart || 0).toFixed(6)};\n`;
    smContent += `#SAMPLELENGTH:${(songData.sampleLength || 10).toFixed(6)};\n`;
    
    // BPM changes
    if (songData.bpmChanges && songData.bpmChanges.length > 0) {
      smContent += `#BPMS:${songData.bpmChanges.map(bpm => `${bpm.beat.toFixed(6)}=${bpm.bpm.toFixed(6)}`).join(",")};\n`;
    } else {
      smContent += `#BPMS:0.000=120.000;\n`;
    }
    
    // Stops
    if (songData.stops && songData.stops.length > 0) {
      smContent += `#STOPS:${songData.stops.map(stop => `${stop.beat.toFixed(6)}=${stop.len.toFixed(6)}`).join(",")};\n`;
    } else {
      smContent += `#STOPS:;\n`;
    }
    
    // BG changes
    if (songData.backgrounds && songData.backgrounds.length > 0) {
      const bgChanges = songData.backgrounds.map(bg => 
        `${bg.beat.toFixed(6)}=${bg.file || ""}=${bg.opacity || 1}=${bg.fadeIn || 0}=${bg.fadeOut || 0}=${bg.effect || 0}`
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
    const parts = url.split(/[\\/]/);
    return parts[parts.length - 1] || "";
  }
  
  static generateNotesSection(difficulty, notes) {
    // First, process freeze notes to add their tail notes
    const processedNotes = this.processFreezeNotes(notes);
    
    let notesContent = `#NOTES:\n`;
    notesContent += `     dance-single:\n`;
    notesContent += `     :\n`;
    notesContent += `     ${difficulty.type}:\n`;
    notesContent += `     ${difficulty.rating}:\n`;
    notesContent += `     0.000000:\n`;
    
    // Group notes by measure
    const measures = {};
    processedNotes.forEach(note => {
      const measure = Math.floor(note.beat / 4);
      if (!measures[measure]) measures[measure] = [];
      measures[measure].push(note);
    });
    
    // Sort measures
    const measureNumbers = Object.keys(measures).map(Number).sort((a, b) => a - b);
    
    measureNumbers.forEach((measureNum, index) => {
      const measureNotes = measures[measureNum];
      const measureContent = this.convertMeasureToSM(measureNotes, measureNum);
      notesContent += measureContent;
      
      if (index < measureNumbers.length - 1) {
        notesContent += "\n,\n";
      } else {
        notesContent += "\n;\n";
      }
    });
    
    return notesContent;
  }
  
  static processFreezeNotes(notes) {
    const processedNotes = [...notes];
    const freezeTails = [];
    
    // Find freeze starts and create their tails
    notes.forEach((note, index) => {
      if (note.type === "2" || note.type === "4") { // Hold or Roll start
        if (note.beatEnd !== undefined && note.beatLength !== undefined) {
          // Add freeze tail note
          const tailNote = {
            type: "3", // Freeze tail
            beat: note.beatEnd,
            sec: note.secEnd,
            column: note.column
          };
          freezeTails.push(tailNote);
        }
      }
    });
    
    // Add all tails to processed notes
    processedNotes.push(...freezeTails);
    
    // Sort by beat
    processedNotes.sort((a, b) => a.beat - b.beat);
    
    return processedNotes;
  }
  
  static convertMeasureToSM(notes, measureNum) {
    // First, normalize all beat positions to be within [0, 4) range
    const normalizedNotes = notes.map(note => {
      const beatInMeasure = note.beat - (measureNum * 4);
      return {
        ...note,
        beatInMeasure: beatInMeasure
      };
    });
    
    // Find all unique beat positions
    const beatPositions = normalizedNotes.map(n => n.beatInMeasure);
    
    // Calculate the required resolution (subdivisions per beat)
    // First, convert all positions to fractions with a common denominator
    const allFractions = [];
    const positionsSet = new Set();
    
    beatPositions.forEach(pos => {
      // Round to avoid floating point issues
      const roundedPos = Math.round(pos * 1000000) / 1000000;
      positionsSet.add(roundedPos);
    });
    
    // Convert to array and sort
    const uniquePositions = Array.from(positionsSet).sort((a, b) => a - b);
    
    if (uniquePositions.length === 0) {
      // Empty measure, use 4 rows
      return "0000\n0000\n0000\n0000";
    }
    
    // Calculate the smallest interval between positions
    let smallestInterval = 4; // Start with whole measure
    for (let i = 1; i < uniquePositions.length; i++) {
      const interval = uniquePositions[i] - uniquePositions[i - 1];
      if (interval > 0 && interval < smallestInterval) {
        smallestInterval = interval;
      }
    }
    
    // Also check distance from 0 to first position and from last position to 4
    if (uniquePositions[0] > 0 && uniquePositions[0] < smallestInterval) {
      smallestInterval = uniquePositions[0];
    }
    if (4 - uniquePositions[uniquePositions.length - 1] < smallestInterval) {
      smallestInterval = 4 - uniquePositions[uniquePositions.length - 1];
    }
    
    // Determine resolution based on smallest interval
    // We need enough subdivisions to represent the smallest interval
    let requiredRowsPerBeat = Math.ceil(1 / smallestInterval);
    
    // Adjust to standard StepMania resolutions
    const standardResolutions = [
      { rowsPerBeat: 1, totalRows: 4 },    // 4th notes
      { rowsPerBeat: 2, totalRows: 8 },    // 8th notes
      { rowsPerBeat: 3, totalRows: 12 },   // 12th notes (triplets)
      { rowsPerBeat: 4, totalRows: 16 },   // 16th notes
      { rowsPerBeat: 6, totalRows: 24 },   // 24th notes (8th triplets)
      { rowsPerBeat: 8, totalRows: 32 },   // 32nd notes
      { rowsPerBeat: 12, totalRows: 48 },  // 48th notes (16th triplets)
      { rowsPerBeat: 16, totalRows: 64 },  // 64th notes
      { rowsPerBeat: 24, totalRows: 96 },  // 96th notes (32nd triplets)
      { rowsPerBeat: 48, totalRows: 192 }  // 192nd notes
    ];
    
    // Find the smallest standard resolution that can accommodate our required resolution
    let selectedResolution = standardResolutions[0];
    for (const res of standardResolutions) {
      if (res.rowsPerBeat >= requiredRowsPerBeat) {
        selectedResolution = res;
        break;
      }
    }
    
    // If we need more than 192, we'll use custom resolution (though SM typically caps at 192)
    if (requiredRowsPerBeat > 48) {
      // Use custom resolution (StepMania allows up to 999 rows per measure)
      const customRowsPerMeasure = Math.min(999, Math.ceil(4 / smallestInterval));
      return this.generateCustomResolutionMeasure(normalizedNotes, customRowsPerMeasure);
    }
    
    const totalRows = selectedResolution.totalRows;
    const rowsPerBeat = selectedResolution.rowsPerBeat;
    
    // Create empty rows
    const rowArray = new Array(totalRows);
    for (let i = 0; i < totalRows; i++) {
      rowArray[i] = "0000";
    }
    
    // Place notes
    normalizedNotes.forEach(note => {
      // Calculate row index: beatInMeasure * rowsPerBeat
      const exactRow = note.beatInMeasure * rowsPerBeat;
      const rowIndex = Math.round(exactRow);
      
      if (rowIndex >= 0 && rowIndex < totalRows) {
        const rowStr = rowArray[rowIndex];
        const chars = rowStr.split('');
        chars[note.column] = note.type;
        rowArray[rowIndex] = chars.join('');
      }
    });
    
    return rowArray.join("\n");
  }
  
  static generateCustomResolutionMeasure(notes, totalRows) {
    // For resolutions beyond standard StepMania limits
    const rowsPerBeat = totalRows / 4;
    const rowArray = new Array(totalRows);
    
    for (let i = 0; i < totalRows; i++) {
      rowArray[i] = "0000";
    }
    
    notes.forEach(note => {
      const exactRow = note.beatInMeasure * rowsPerBeat;
      const rowIndex = Math.round(exactRow);
      
      if (rowIndex >= 0 && rowIndex < totalRows) {
        const rowStr = rowArray[rowIndex];
        const chars = rowStr.split('');
        chars[note.column] = note.type;
        rowArray[rowIndex] = chars.join('');
      }
    });
    
    return rowArray.join("\n");
  }
  
  
  static parseSM(smContent, baseUrl = "") {
    try {
      // Clean the content
      const cleanContent = smContent
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');
      
      const lines = cleanContent.split('\n');
      const result = {
        title: "",
        subtitle: "",
        artist: "",
        titleTranslit: "",
        subtitleTranslit: "",
        artistTranslit: "",
        genre: "",
        credit: "",
        banner: "",
        background: "",
        lyrics: "",
        cdtitle: "",
        audio: "",
        offset: 0,
        sampleStart: 0,
        sampleLength: 10,
        bpmChanges: [],
        stops: [],
        backgrounds: [],
        difficulties: [],
        notes: {}
      };
      
      let currentNotesSection = null;
      let notesContent = "";
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('//')) continue;
        
        if (line.startsWith('#NOTES:')) {
          // Start of notes section
          currentNotesSection = {
            type: "",
            rating: "",
            meter: "",
            radar: "",
            content: ""
          };
          
          // Read the next 5 lines for notes metadata
          for (let j = 1; j <= 5; j++) {
            if (i + j < lines.length) {
              const metaLine = lines[i + j].trim();
              switch(j) {
                case 1: currentNotesSection.type = metaLine; break;
                case 2: currentNotesSection.rating = metaLine; break;
                case 3: currentNotesSection.meter = metaLine; break;
                case 4: currentNotesSection.radar = metaLine; break;
                case 5: 
                  currentNotesSection.content = metaLine;
                  i += j;
                  break;
              }
            }
          }
          continue;
        }
        
        if (currentNotesSection && line === ';') {
          // End of notes section
          this.processNotesSection(currentNotesSection, result);
          currentNotesSection = null;
          continue;
        }
        
        if (currentNotesSection) {
          // Accumulate notes content
          currentNotesSection.content += line + '\n';
          continue;
        }
        
        // Parse regular tags
        if (line.startsWith('#') && line.includes(':')) {
          const colonIndex = line.indexOf(':');
          const tag = line.substring(1, colonIndex);
          const value = line.substring(colonIndex + 1).replace(/;\s*$/, '').trim();
          
          switch(tag) {
            case 'TITLE': result.title = value; break;
            case 'SUBTITLE': result.subtitle = value; break;
            case 'ARTIST': result.artist = value; break;
            case 'TITLETRANSLIT': result.titleTranslit = value; break;
            case 'SUBTITLETRANSLIT': result.subtitleTranslit = value; break;
            case 'ARTISTTRANSLIT': result.artistTranslit = value; break;
            case 'GENRE': result.genre = value; break;
            case 'CREDIT': result.credit = value; break;
            case 'BANNER': result.banner = this.resolveFileUrl(value, baseUrl); break;
            case 'BACKGROUND': result.background = this.resolveFileUrl(value, baseUrl); break;
            case 'LYRICSPATH': result.lyrics = this.resolveFileUrl(value, baseUrl); break;
            case 'CDTITLE': result.cdtitle = this.resolveFileUrl(value, baseUrl); break;
            case 'MUSIC': 
              result.audio = value;
              result.audioUrl = this.resolveFileUrl(value, baseUrl);
              break;
            case 'OFFSET': result.offset = parseFloat(value) || 0; break;
            case 'SAMPLESTART': result.sampleStart = parseFloat(value) || 0; break;
            case 'SAMPLELENGTH': result.sampleLength = parseFloat(value) || 10; break;
            case 'BPMS': 
              if (value && value.trim()) {
                result.bpmChanges = this.parseBPMs(value);
              }
              break;
            case 'STOPS':
              if (value && value.trim()) {
                result.stops = this.parseStops(value);
              }
              break;
            case 'BGCHANGES':
              if (value && value.trim()) {
                result.backgrounds = this.parseBGChanges(value, baseUrl);
              }
              break;
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error parsing SM file:", error);
      throw error;
    }
  }
  
  static parseBPMs(bpmString) {
    const bpmChanges = [];
    const entries = bpmString.split(',').filter(e => e.trim());
    
    entries.forEach(entry => {
      const [beat, bpm] = entry.split('=').map(Number);
      if (!isNaN(beat) && !isNaN(bpm)) {
        bpmChanges.push({ beat, bpm, sec: 0 });
      }
    });
    
    return bpmChanges;
  }
  
  static parseStops(stopString) {
    const stops = [];
    const entries = stopString.split(',').filter(e => e.trim());
    
    entries.forEach(entry => {
      const [beat, len] = entry.split('=').map(Number);
      if (!isNaN(beat) && !isNaN(len)) {
        stops.push({ beat, len, sec: 0 });
      }
    });
    
    return stops;
  }
  
  static parseBGChanges(bgString, baseUrl) {
    const backgrounds = [];
    const entries = bgString.split(',').filter(e => e.trim());
    
    entries.forEach(entry => {
      const parts = entry.split('=');
      if (parts.length >= 6) {
        const bg = {
          beat: parseFloat(parts[0]) || 0,
          file: parts[1],
          opacity: parseFloat(parts[2]) || 1,
          fadeIn: parseInt(parts[3]) || 0,
          fadeOut: parseInt(parts[4]) || 0,
          effect: parseInt(parts[5]) || 0,
          type: "image",
          url: ""
        };
        
        if (bg.file) {
          const ext = bg.file.split('.').pop().toLowerCase();
          bg.type = ["mp4", "avi", "mov", "webm"].includes(ext) ? "video" : "image";
          bg.url = this.resolveFileUrl(bg.file, baseUrl);
        }
        
        backgrounds.push(bg);
      }
    });
    
    return backgrounds;
  }
  
  static processNotesSection(section, result) {
    if (!section.type || !section.meter) return;
    
    const difficultyKey = section.type + section.meter;
    result.difficulties.push({
      type: section.type,
      rating: section.meter
    });
    
    // Parse notes content
    const notes = this.parseNotesContent(section.content);
    result.notes[difficultyKey] = notes;
  }
  
  static parseNotesContent(content) {
    const notes = [];
    const measures = content.split(',').filter(m => m.trim());
    
    measures.forEach((measure, measureIndex) => {
      const rows = measure.trim().split('\n').filter(r => r.trim());
      const rowsPerMeasure = rows.length;
      
      rows.forEach((row, rowIndex) => {
        if (row.length === 4) {
          for (let col = 0; col < 4; col++) {
            const noteChar = row[col];
            if (noteChar !== '0') {
              const beat = measureIndex * 4 + (rowIndex / rowsPerMeasure) * 4;
              const note = {
                type: noteChar,
                beat: beat,
                sec: 0, // Will be calculated later
                column: col
              };
              
              notes.push(note);
            }
          }
        }
      });
    });
    
    return notes;
  }
  
  static resolveFileUrl(filename, baseUrl) {
    if (!filename) return "";
    if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('//')) {
      return filename;
    }
    if (baseUrl && !filename.startsWith('/')) {
      return baseUrl + '/' + filename;
    }
    return filename;
  }
}
