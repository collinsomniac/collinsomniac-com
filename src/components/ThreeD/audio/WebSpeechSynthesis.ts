import * as Tone from 'tone';

/**
 * WebSpeechSynthesis class encapsulates the browser's SpeechSynthesis API
 * and integrates it with Tone.js to allow audio manipulation and visualization.
 */
export class WebSpeechSynthesis {
  private synth: SpeechSynthesis | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private player: Tone.Player | null = null;
  private analyser: Tone.Analyser | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStreamDestination: MediaStreamAudioDestinationNode | null = null;
  private isGenerating: boolean = false;
  private isCancelled: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeBrowserComponents();
    }
  }

  private initializeBrowserComponents() {
    this.synth = window.speechSynthesis;
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    this.mediaStreamDestination =
      this.audioContext.createMediaStreamDestination();
    this.analyser = new Tone.Analyser('waveform', 256);
  }

  /**
   * Generates speech audio from the provided text.
   * @param text The text to convert to speech.
   */
  async generateSpeech(text: string): Promise<{
    player: Tone.Player;
    analyser: Tone.Analyser;
    duration: number;
  }> {
    if (typeof window === 'undefined') {
      throw new Error('Speech generation is not available on the server side.');
    }

    if (this.isGenerating) {
      throw new Error('Speech generation already in progress');
    }

    this.isGenerating = true;
    this.isCancelled = false;

    return new Promise((resolve, reject) => {
      if (!this.synth || !this.audioContext || !this.mediaStreamDestination) {
        reject(new Error('Speech synthesis components are not initialized.'));
        return;
      }

      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.onend = () => {
        this.isGenerating = false;
        if (this.isCancelled) {
          reject(new Error('Speech generation was cancelled'));
        }
      };
      this.utterance.onerror = (event) => {
        this.isGenerating = false;
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };

      // Connect the audio output to the MediaStreamAudioDestinationNode
      const source = this.audioContext.createMediaStreamSource(
        this.mediaStreamDestination.stream,
      );
      const dest = Tone.getDestination();

      // Create a new Tone.Player from the MediaStream
      this.player = new Tone.Player({
        playbackRate: 1,
        loop: false,
        onload: () => {
          if (!this.player || !this.analyser) {
            reject(new Error('Player or analyser not initialized.'));
            return;
          }

          this.player.connect(this.analyser);
          this.player.toDestination();

          // Estimate duration (simplistic approach)
          const estimatedDuration = text.length / 5; // Modify as needed

          resolve({
            player: this.player,
            analyser: this.analyser,
            duration: estimatedDuration,
          });
        },
      });

      // Connect SpeechSynthesizer to AudioContext
      this.synth.onvoiceschanged = () => {
        const voices = this.synth!.getVoices();
        if (voices.length > 0) {
          this.utterance!.voice = voices[0]; // Choose a default voice
          this.synth!.speak(this.utterance!);
        }
      };

      // Attempt to route audio to the MediaStreamDestination
      try {
        this.audioContext.resume().then(() => {
          this.synth!.speak(this.utterance!);
        });
      } catch (error) {
        reject(
          new Error('Failed to set up audio routing for SpeechSynthesis.'),
        );
      }
    });
  }

  /**
   * Retrieves the Tone.Player instance.
   */
  getPlayer(): Tone.Player | null {
    return this.player;
  }

  /**
   * Retrieves the Tone.Analyser instance.
   */
  getAnalyser(): Tone.Analyser | null {
    return this.analyser;
  }

  /**
   * Seeks to a specific time in the playback.
   * @param time The time in seconds to seek to.
   */
  seek(time: number) {
    this.player?.seek(time);
  }

  /**
   * Stops the speech generation and playback.
   */
  stop() {
    if (this.isGenerating) {
      this.isCancelled = true;
      this.synth.cancel();
    }
    if (this.player) {
      this.player.stop();
    }
  }

  /**
   * Retrieves waveform data from the analyser.
   */
  getWaveformData(): Float32Array {
    return this.analyser.getValue() as Float32Array;
  }

  /**
   * Sets the pitch of the speech.
   * Note: Web Speech API doesn't directly support pitch adjustment.
   * This method can manipulate the AudioContext's playbackRate for pitch shifting.
   * @param pitch The pitch value.
   */
  setPitch(pitch: number) {
    if (this.player) {
      this.player.playbackRate = Math.max(0.5, Math.min(2, 1 + pitch / 12));
    }
  }

  /**
   * Sets the playback rate of the speech.
   * @param rate The playback rate.
   */
  setPlaybackRate(rate: number) {
    if (this.player) {
      this.player.playbackRate = Math.max(0.1, Math.min(10, rate));
    }
    if (this.utterance) {
      this.utterance.rate = Math.max(0.1, Math.min(10, rate));
    }
  }

  /**
   * Disposes of all resources.
   */
  dispose() {
    this.stop();
    if (this.player) {
      this.player.dispose();
    }
    this.analyser.dispose();
    this.audioContext.close();
  }
}

export const webSpeechSynthesis = new WebSpeechSynthesis();
