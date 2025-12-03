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
    smContent += `#BANNER:${FileTools.getFilename(songData.banner)};\n`;
    smContent += `#BACKGROUND:${FileTools.getFilename(songData.background)};\n`;
    smContent += `#LYRICSPATH:${FileTools.getFilename(songData.lyrics)};\n`;
    smContent += `#CDTITLE:${FileTools.getFilename(songData.cdtitle)};\n`;
    smContent += `#MUSIC:${FileTools.getFilename(songData.audio)};\n`;
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
