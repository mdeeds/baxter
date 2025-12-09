/**
 * A class to manage and speak a queue of words using the Web Speech API.
 */
export class TextToSpeechQueue {
  /**
   * Constructs an instance of the TextToSpeechQueue.
   */
  constructor() {
    if (!TextToSpeechQueue.isSupported()) {
      throw new Error("SpeechSynthesis API is not supported in this browser.");
    }

    this.wordQueue = [];
    this.isSpeaking = false;
    /** @type {SpeechSynthesisVoice | null} */
    this.voice = null;

    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log("Available TTS voices:", voices);
      const ziraVoice = voices.find(voice => voice.name.includes('Zira'));
      if (ziraVoice) {
        this.voice = ziraVoice;
        console.log("Set TTS voice to Zira:", ziraVoice);
        this._speakText('Hello.  My name is Zira.');
      }
    };

    // The 'voiceschanged' event fires when the list of synthesis voices is ready.
    window.speechSynthesis.onvoiceschanged = setVoice;

    // The voices may already be loaded on some browsers, so call it directly.
    // If the list is empty, the 'voiceschanged' event will populate it later.
    setVoice();
  }

  /**
   * Checks if the SpeechSynthesis API is supported by the browser.
   * @returns {boolean} True if supported, false otherwise.
   */
  static isSupported() {
    return 'speechSynthesis' in window;
  }

  /**
   * Adds a word to the speech queue. If the queue was empty, it starts the speech process.
   * @param {string} text - The text to be spoken.
   */
  async addText(text) {
    if (typeof text !== 'string' || text === '') {
      return;
    }
    this.wordQueue.push(text);
    if (!this.isSpeaking) {
      this._processQueue(); // Don't await this, let it run in the background
    }
  }

  /**
   * Processes the word queue, speaking one word at a time.
   * @private
   */
  async _processQueue() {
    if (this.isSpeaking || this.wordQueue.length === 0) {
      return;
    }

    this.isSpeaking = true;

    // Concatenate all text in the queue and clear it.
    const textToSpeak = this.wordQueue.join(' ');
    this.wordQueue.length = 0; // Efficiently clear the array

    try {
      await this._speakText(textToSpeak);
    } catch (error) {
      console.error(`Error speaking text "${textToSpeak}":`, error);
    } finally {
      // After speaking, check if new words have been added and process them.
      this.isSpeaking = false;
      this._processQueue();
    }
  }

  /**
   * Speaks a single piece of text and returns a promise that resolves when speech is finished.
   * @param {string} text - The text to speak.
   * @returns {Promise<void>}
   * @private
   */
  _speakText(text) {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        utterance.voice = this.voice;
        utterance.rate = 1.8;
        utterance.pitch = 1.05;
      }
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event);
      window.speechSynthesis.speak(utterance);
    });
  }
}
