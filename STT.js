/**
 * A class to provide continuous speech recognition that restarts on timeout.
 */
export class ContinuousSpeech {
  /**
   * @param {function(string): void} onWord - Callback function to be invoked with each recognized word.
   */
  constructor(onWord) {
    if (!ContinuousSpeech.isSupported()) {
      console.error("SpeechRecognition API is not supported in this browser.");
      return;
    }

    this.onWord = onWord;
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.isListening = false;
    this.lastResultIndex = 0;

    this.recognition.interimResults = true;
    this.recognition.continuous = true; // Keep listening even after a pause in speech
    this.recognition.lang = 'en-US';

    this._bindEvents();
    this.start();
  }

  /**
   * Checks if the SpeechRecognition API is supported by the browser.
   * @returns {boolean} True if supported, false otherwise.
   */
  static isSupported() {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * Binds the necessary events to the recognition instance.
   * @private
   */
  _bindEvents() {
    this.recognition.onresult = this._handleResult.bind(this);
    this.recognition.onend = this._handleEnd.bind(this);
    this.recognition.onerror = this._handleError.bind(this);
  }

  /**
   * Handles the 'result' event from the SpeechRecognition API.
   * @param {SpeechRecognitionEvent} event - The event object.
   * @private
   */
  _handleResult(event) {
    console.log("Speech recognition result:", event);
    const results = event.results;
    const result = results[event.resultIndex];
    if (result.isFinal) {
      const transcript = result[0].transcript.trim();
      const words = transcript.split(/\s+/);
      words.forEach(word => this.onWord(word));
    }
    // this.lastResultIndex = results.length;
  }

  /**
   * Handles the 'end' event. If listening should continue, it restarts recognition.
   * @private
   */
  _handleEnd() {
    // The 'end' event can fire unexpectedly.
    // If we are still supposed to be listening, restart recognition.
    if (this.isListening) {
      console.log("Speech recognition ended, restarting...");
      this.lastResultIndex = 0; // Reset for the new session
      this.recognition.start();
    } else {
      console.log("Speech recognition stopped.");
    }
  }

  /**
   * Handles errors from the SpeechRecognition API.
   * @param {SpeechRecognitionErrorEvent} event - The error event object.
   * @private
   */
  _handleError(event) {
    console.error("Speech recognition error:", event.error);
    // On some errors, like 'no-speech', the service stops.
    // The 'onend' event will handle the restart logic.
  }

  /**
   * Starts the speech recognition service.
   */
  start() {
    if (!this.isListening) {
      console.log("Starting speech recognition...");
      this.isListening = true;
      this.lastResultIndex = 0;
      this.recognition.start();
    }
  }

  /**
   * Stops the speech recognition service.
   */
  stop() {
    if (this.isListening) {
      console.log("Stopping speech recognition...");
      this.isListening = false;
      this.recognition.stop();
    }
  }
}
