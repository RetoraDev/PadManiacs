class Lyrics {
  constructor(options = {}) {
    this.textElement = options.textElement || null; // Text instance to display lyrics
    this.maxLineLength = options.maxLineLength || 30; // Maximum characters per line
    this.currentTime = 0;
    this.lrcData = [];
    this.rangeLrc = [];
    this.currentLineIndex = -1;
    this.currentColor = 0xffffff; // Default white color
    
    // Parse LRC data
    if (options.lrc) {
      this.setLrc(options.lrc);
    }
  }

  setLrc(rawLrc) {
    this.tags = {};
    this.lrcData = [];
    this.rangeLrc = [];
    this.currentLineIndex = -1;
    this.currentColor = 0xffffff; // Reset to default white

    const tagRegex = /\[([a-z]+):(.*)\].*/;
    const lrcAllRegex = /(\[[0-9.:\[\]]*\])+(.*)/;
    const timeRegex = /\[([0-9]+):([0-9.]+)\]/;
    const colorRegex = /\[COLOUR\]0x([0-9a-fA-F]{6})/;
    const rawLrcArray = rawLrc.split(/[\r\n]/);
    
    for (let i = 0; i < rawLrcArray.length; i++) {
      // Handle color tags
      const colorMatch = colorRegex.exec(rawLrcArray[i]);
      if (colorMatch && colorMatch[0]) {
        const hexColor = colorMatch[1];
        // Convert hex string to integer (0xRRGGBB)
        this.currentColor = parseInt(hexColor, 16);
        continue;
      }
      
      // Handle other tags (artist, title, etc.)
      const tag = tagRegex.exec(rawLrcArray[i]);
      if (tag && tag[0]) {
        this.tags[tag[1]] = tag[2];
        continue;
      }
      
      // Handle lyrics with timestamps
      const lrc = lrcAllRegex.exec(rawLrcArray[i]);
      if (lrc && lrc[0]) {
        const times = lrc[1].replace(/\]\[/g,"],[").split(",");
        const lineText = lrc[2].trim();
        
        for (let j = 0; j < times.length; j++) {
          const time = timeRegex.exec(times[j]);
          if (time && time[0]) {
            const startTime = parseInt(time[1], 10) * 60 + parseFloat(time[2]);
            this.lrcData.push({ 
              startTime: startTime, 
              line: lineText,
              color: this.currentColor // Store current color with the line
            });
          }
        }
      }
    }

    // Sort by start time
    this.lrcData.sort((a, b) => a.startTime - b.startTime);

    // Create range-based LRC data for easier lookup
    let startTime = 0;
    let line = "";
    let color = 0xffffff; // Default white
    
    for (let i = 0; i < this.lrcData.length; i++) {
      const endTime = this.lrcData[i].startTime;
      this.rangeLrc.push({ 
        startTime: startTime, 
        endTime: endTime, 
        line: line,
        color: color
      });
      startTime = endTime;
      line = this.lrcData[i].line;
      color = this.lrcData[i].color;
    }
    
    // Add final segment
    this.rangeLrc.push({ 
      startTime: startTime, 
      endTime: Number.MAX_SAFE_INTEGER, 
      line: line,
      color: color
    });
  }

  move(time) {
    this.currentTime = time;
    
    // Find the current line based on time
    for (let i = 0; i < this.rangeLrc.length; i++) {
      if (time >= this.rangeLrc[i].startTime && time < this.rangeLrc[i].endTime) {
        if (this.currentLineIndex !== i && this.textElement) {
          this.currentLineIndex = i;
          this.displayCurrentLine();
        }
        return;
      }
    }
    
    // If no line found, clear display
    if (this.currentLineIndex !== -1 && this.textElement) {
      this.currentLineIndex = -1;
      this.textElement.write("");
    }
  }

  displayCurrentLine() {
    if (!this.textElement || this.currentLineIndex < 0) return;

    const currentLineData = this.rangeLrc[this.currentLineIndex];
    const lineText = currentLineData.line.trim();
    
    if (!lineText) {
      this.textElement.write("");
      return;
    }

    // Stop any existing scrolling
    if (this.textElement.isScrolling && this.textElement.stopScrolling) {
      this.textElement.stopScrolling();
    }

    // Set text tint to the stored color
    this.textElement.tint = currentLineData.color;
    this.textElement.write(lineText);
    
    // Warp if text too long
    if (lineText.length > this.maxLineLength) {
      this.textElement.wrap(this.maxLineLength * 5);
    }
  }

  // Get current line text
  getCurrentLine() {
    if (this.currentLineIndex >= 0 && this.currentLineIndex < this.rangeLrc.length) {
      return this.rangeLrc[this.currentLineIndex].line;
    }
    return "";
  }

  // Get current line color
  getCurrentColor() {
    if (this.currentLineIndex >= 0 && this.currentLineIndex < this.rangeLrc.length) {
      return this.rangeLrc[this.currentLineIndex].color;
    }
    return 0xffffff; // Default white
  }

  // Get next line text (for preview)
  getNextLine() {
    const nextIndex = this.currentLineIndex + 1;
    if (nextIndex < this.rangeLrc.length) {
      return this.rangeLrc[nextIndex].line;
    }
    return "";
  }

  // Check if lyrics are loaded
  hasLyrics() {
    return this.lrcData.length > 0;
  }

  // Clear lyrics display
  clear() {
    if (this.textElement) {
      this.textElement.write("");
    }
    this.currentLineIndex = -1;
    this.lrcData = [];
    this.rangeLrc = [];
    this.currentColor = 0xffffff;
  }

  // Destroy and cleanup
  destroy() {
    this.clear();
    this.textElement = null;
  }
}