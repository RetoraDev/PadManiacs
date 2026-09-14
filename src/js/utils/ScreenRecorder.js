/**
 * @class ScreenRecorder
 * @category Core Game Classes
 * @summary Video recording and screenshot functionality
 * @constructor
 * @param {Object} game - The Phaser game instance
 * @features
 * WebM video recording via MediaRecorder at scaled resolution
 * Optional audio capture from the game audio element or microphone
 * High-resolution PNG screenshot capture
 * File saving for Cordova, NWjs, and browser environments
 * @description
 * Records video and captures screenshots of the Phaser game canvas. Uses a scaled
 * offscreen canvas for higher quality output and merges audio from the game source
 * or fallback microphone when available.
 * @example
 * // Modding usage example
 * const recorder = new ScreenRecorder(game);
 * await recorder.start(audioElement, 0);
 * recorder.pause();
 * recorder.resume();
 * recorder.stop();
 * recorder.screenshot();
 */
class ScreenRecorder {
  constructor(game) {
    /** @type {Object} The Phaser game instance */
    this.game = game;
    /** @type {MediaRecorder|null} Active MediaRecorder instance */
    this.mediaRecorder = null;
    /** @type {Array} Blobs collected during the current recording */
    this.recordedBlobs = [];
    /** @type {boolean} Whether recording is currently active */
    this.isRecording = false;
    /** @type {MediaStream|null} The captured output stream */
    this.stream = null;
    /** @type {number} Target bitrate for recorded video */
    this.videoBitsPerSecond = 1100000;
    /** @type {number} Frame rate captured from the scaled canvas */
    this.videoFrameRate = 25;
    /** @type {number} Scale factor for videos TODO: rename it to videoScale */
    this.scale = 1; // Scale factor for videos TODO: rename it to videoScale
    /** @type {number} Scale factor applied to screenshots */
    this.imageScale = 7;

    /** @type {HTMLCanvasElement} Phaser CE game canvas element */
    this.canvas = game.canvas;  // Phaser CE game canvas element

    // Check if canvas.captureStream is supported
    if (!this.canvas.captureStream) {
      console.error('Canvas captureStream is not supported in this browser');
      return;
    }
  }

  /**
   * Starts recording the game canvas, optionally adding audio to the stream.
   * @param {HTMLAudioElement} [audioElement] - Audio element to record along with the video
   * @param {number} [audioDelay=0] - Delay in milliseconds applied to audio capture
   */
  async start(audioElement = null, audioDelay = 0) {
    if (this.isRecording) {
      console.warn('Already recording');
      return;
    }

    if (!this.canvas.captureStream) {
      console.error('Screen recording not supported in this browser');
      return;
    }

    try {
      // Create a scaled canvas for high-resolution recording
      /** @type {HTMLCanvasElement} Canvas rendered at the scaled recording resolution */
      this.scaledCanvas = document.createElement('canvas');
      this.scaledCanvas.width = this.canvas.width * this.scale;
      this.scaledCanvas.height = this.canvas.height * this.scale;
      /** @type {CanvasRenderingContext2D} 2D context of the scaled recording canvas */
      this.scaledContext = this.scaledCanvas.getContext('2d');
      
      // Set scaling quality
      this.scaledContext.imageSmoothingEnabled = false;
      this.scaledContext.webkitImageSmoothingEnabled = false;
      this.scaledContext.mozImageSmoothingEnabled = false;

      // Capture scaled canvas stream
      this.stream = this.scaledCanvas.captureStream(this.videoFrameRate);

      // Add audio to stream BEFORE starting the recorder
      if (audioElement) {
        await this.addAudioToStream(audioElement, audioDelay);
      }

      let options = {
        mimeType: 'video/webm; codecs=vp9',
        videoBitsPerSecond: this.videoBitsPerSecond
      };

      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = {
          mimeType: 'video/webm; codecs=vp8',
          videoBitsPerSecond: this.videoBitsPerSecond
        };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = {
            mimeType: 'video/webm',
            videoBitsPerSecond: this.videoBitsPerSecond
          };
        }
      }

      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.recordedBlobs = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedBlobs.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.save();
        this.cleanup();
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        this.isRecording = false;
        this.cleanup();
      };

      // Start recording with timeslice for better memory management
      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;
      
      // Start rendering loop for scaled recording
      this.startRenderingLoop();
      
      console.log(`Started recording with MIME type: ${options.mimeType}, audio delay: ${audioDelay}ms`);

    } catch (e) {
      console.error('MediaRecorder init failed:', e);
      this.cleanup();
    }
  }

  /**
   * Continuously draws the game canvas onto the scaled recording canvas each frame.
   */
  startRenderingLoop() {
    const renderFrame = () => {
      if (this.isRecording && this.scaledCanvas && this.scaledContext) {
        // Fill with solid black background first to avoid transparent holes
        this.scaledContext.fillStyle = '#000000';
        this.scaledContext.fillRect(0, 0, this.scaledCanvas.width, this.scaledCanvas.height);
        
        // Draw scaled version of the game canvas
        this.scaledContext.drawImage(
          this.canvas,
          0, 0, this.canvas.width, this.canvas.height,
          0, 0, this.scaledCanvas.width, this.scaledCanvas.height
        );
        
        // Continue the loop
        requestAnimationFrame(renderFrame);
      }
    };
    
    // Start the rendering loop
    renderFrame();
  }

  /**
   * Stops the active recording session and triggers saving and cleanup.
   */
  stop() {
    if (!this.isRecording || !this.mediaRecorder) {
      console.warn('Not recording');
      return;
    }

    try {
      this.mediaRecorder.stop();
      this.isRecording = false;
      console.log('Stopped recording');
    } catch (e) {
      console.error('Error stopping recorder:', e);
      this.cleanup();
    }
  }

  /**
   * Pauses the recording if one is in progress.
   */
  pause() {
    if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      console.log('Recording paused');
    }
  }

  /**
   * Resumes a paused recording.
   */
  resume() {
    if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      console.log('Recording resumed');
    }
  }
  
  /**
   * Captures a scaled PNG screenshot of the current game world and saves it to a file.
   */
  screenshot() {
    // Create a scaled canvas for high-resolution screenshot
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = this.game.width * this.imageScale
    scaledCanvas.height = this.game.height * this.imageScale;
    const scaledContext = scaledCanvas.getContext('2d');
    
    // Set scaling quality
    scaledContext.imageSmoothingEnabled = false;
    scaledContext.webkitImageSmoothingEnabled = false;
    scaledContext.mozImageSmoothingEnabled = false;
    
    // Fill with solid black background first
    scaledContext.fillStyle = '#000000';
    scaledContext.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
    
    // Create a temporary render texture at original size
    const renderTexture = this.game.add.renderTexture(this.game.width, this.game.height, 'screenshotTemp');
    renderTexture.renderXY(this.game.world, 0, 0, true);
    
    // Get the image and draw it scaled
    const tempCanvas = renderTexture.getCanvas();
    
    // Draw the scaled version
    scaledContext.drawImage(
      tempCanvas,
      0, 0, this.game.width, this.game.height,
      0, 0, scaledCanvas.width, scaledCanvas.height
    );
    
    // Convert to blob and save
    scaledCanvas.toBlob(async (blob) => {
      const filename = `screenshot-${Date.now()}.png`;
      await this.saveFile(filename, blob);
      console.log('Screenshot saved:', filename);
    }, 'image/png');
    
    // Clean up
    renderTexture.destroy();
  }

  /**
   * Bundles recorded blobs into a WebM file and saves it.
   * @param {string} [filename] - Optional filename; defaults to a timestamped name
   */
  async save(filename) {
    if (this.recordedBlobs.length === 0) {
      console.warn('No recording data available');
      return;
    }

    const blob = new Blob(this.recordedBlobs, { type: 'video/webm' });
    
    if (!filename) filename = `recording_${Date.now()}.webm`;
    
    await this.saveFile(filename, blob);

    console.log('Recording saved as:', filename);
  }
  
  /**
   * Writes a blob to disk using the file system tools on Cordova/NWjs or a download link in browsers.
   * @param {string} filename - Name of the output file
   * @param {Blob} blob - Data blob to save
   */
  async saveFile(filename, blob) {
    if (CURRENT_ENVIRONMENT === ENVIRONMENT.CORDOVA || CURRENT_ENVIRONMENT === ENVIRONMENT.NWJS) {
      const fileSystem = new FileSystemTools();
      
      // Make sure SCREENSHOTS_DIRECTORY is defined, or use a default
      const screenshotsDir = typeof SCREENSHOTS_DIRECTORY !== 'undefined' ? SCREENSHOTS_DIRECTORY : 'Screenshots';
      const directory = await fileSystem.getDirectory(EXTERNAL_DIRECTORY + screenshotsDir);
      
      await fileSystem.saveFile(directory, blob, filename);
    } else {
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
  
      document.body.appendChild(a);
      a.click();
  
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    }
  }

  // Add audio to the stream
  /**
   * Attaches audio tracks to the recording stream from the audio element or microphone.
   * @param {HTMLAudioElement} [audioElement] - Audio element to capture
   * @param {number} [audioDelay=0] - Delay in milliseconds applied before capture
   * @returns {Promise<boolean>} Whether audio was successfully added
   */
  async addAudioToStream(audioElement = null, audioDelay = 0) {
    try {
      if (audioElement && audioElement.src) {
        // Apply audio delay if specified
        if (audioDelay > 0) {
          console.log(`Applying audio delay: ${audioDelay}ms`);
          
          // Create a delay by setting currentTime back
          if (audioElement.currentTime > 0) {
            audioElement.currentTime = Math.max(0, audioElement.currentTime - (audioDelay / 1000));
          }
          
          // Wait for the delay period
          await new Promise(resolve => setTimeout(resolve, audioDelay));
        }
        
        // Ensure audio element is playing and has a valid source
        if (audioElement.paused) {
          console.warn('Audio element is paused, attempting to play it');
          try {
            await audioElement.play();
          } catch (playError) {
            console.warn('Could not play audio element:', playError);
          }
        }
        
        // Check if captureStream is supported for this audio element
        if (audioElement.captureStream) {
          const audioStream = audioElement.captureStream();
          
          // Wait a bit for the stream to initialize
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (audioStream && audioStream.getAudioTracks().length > 0) {
            audioStream.getAudioTracks().forEach(track => {
              console.log('Adding audio track:', track);
              this.stream.addTrack(track);
            });
            console.log('Game audio added to recording');
            return true;
          } else {
            console.warn('Audio stream has no audio tracks');
          }
        } else {
          console.warn('Audio element does not support captureStream');
        }
      }
      
      // Fall back to user microphone if audio element failed or not provided
      console.log('Falling back to microphone audio');
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.getAudioTracks().forEach(track => {
        this.stream.addTrack(track);
      });
      console.log('Microphone audio added to recording');
      return true;
      
    } catch (e) {
      console.warn('Could not add audio to recording:', e);
      return false;
    }
  }

  // Method to add audio after recording has started (experimental)
  /**
   * Adds audio tracks to an already-started recording by pausing, modifying, and resuming.
   * @param {HTMLAudioElement} [audioElement] - Audio element to capture
   * @param {number} [audioDelay=0] - Delay in milliseconds applied before capture
   * @returns {Promise<boolean>} Whether audio was successfully added
   */
  async addAudioAfterStart(audioElement = null, audioDelay = 0) {
    if (!this.isRecording || !this.mediaRecorder) {
      console.warn('Cannot add audio - recording not started');
      return false;
    }
    
    // Pause recording to modify the stream
    this.mediaRecorder.pause();
    
    try {
      const success = await this.addAudioToStream(audioElement, audioDelay);
      
      // Resume recording
      this.mediaRecorder.resume();
      
      return success;
    } catch (e) {
      console.error('Error adding audio after start:', e);
      this.mediaRecorder.resume(); // Always resume even if audio fails
      return false;
    }
  }

  /**
   * Stops stream tracks and releases the scaled canvas and recorder references.
   */
  cleanup() {
    // Stop the rendering loop
    this.isRecording = false;
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    // Clean up scaled canvas
    if (this.scaledCanvas) {
      this.scaledCanvas = null;
      this.scaledContext = null;
    }
    
    this.mediaRecorder = null;
  }

  // Check if recording is supported
  /**
   * Checks whether canvas capture streaming and MediaRecorder are supported by the browser.
   * @returns {boolean} True if recording is supported
   */
  static isSupported() {
    return !!(HTMLCanvasElement.prototype.captureStream && window.MediaRecorder);
  }

  // Get recording state
  /**
   * Returns the current MediaRecorder state.
   * @returns {string} State like 'inactive', 'recording', or 'paused'
   */
  getState() {
    return this.mediaRecorder ? this.mediaRecorder.state : 'inactive';
  }
  
  // Method to change scale factor
  /**
   * Changes the scale factor applied to recorded videos.
   * @param {number} newScale - New scale factor
   */
  setScale(newScale) {
    this.scale = newScale;
    console.log(`Scale factor set to: ${this.scale}`);
  }
  
  // Method to get current scale factor
  /**
   * Returns the current video scale factor.
   * @returns {number} The active scale factor
   */
  getScale() {
    return this.scale;
  }
}
