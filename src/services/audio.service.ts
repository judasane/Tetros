import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext | null = null;
  private sfxGainNode: GainNode | null = null;
  private musicGainNode: GainNode | null = null;
  private musicScheduler: any = null;

  private initializeAudioContext(): void {
    if (this.audioContext) return;
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      this.sfxGainNode = this.audioContext.createGain();
      this.sfxGainNode.gain.value = 0.5; // Default volume
      this.sfxGainNode.connect(this.audioContext.destination);

      this.musicGainNode = this.audioContext.createGain();
      this.musicGainNode.gain.value = 0.2; // Default volume
      this.musicGainNode.connect(this.audioContext.destination);
    } catch (e) {
      console.error('Web Audio API is not supported in this browser');
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', gain: number = 1, destination: AudioNode | null = this.sfxGainNode): void {
    if (!this.audioContext || !destination) return;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // --- Public Methods ---

  public init(): void {
    this.initializeAudioContext();
  }

  public setSfxVolume(volume: number): void {
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }

  public setMusicVolume(volume: number): void {
    if (this.musicGainNode) {
      this.musicGainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }

  public playMove(): void {
    this.playTone(200, 0.05, 'square', 0.5);
  }

  public playRotate(): void {
    this.playTone(300, 0.05, 'sawtooth', 0.5);
  }

  public playHardDrop(): void {
    this.playTone(100, 0.1, 'triangle', 0.8);
  }

  public playHold(): void {
    this.playTone(440, 0.1, 'sine');
  }

  public playLineClear(): void {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;
    this.playTone(523.25, 0.1, 'sine', 0.5); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.5), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.1, 'sine', 0.5), 200); // G5
  }

  public playLock(): void {
    this.playTone(150, 0.05, 'sine', 0.3);
  }

  public playGameOver(): void {
    if (!this.audioContext) return;
    this.playTone(400, 0.5, 'sawtooth');
    setTimeout(() => this.playTone(200, 0.5, 'sawtooth'), 150);
    setTimeout(() => this.playTone(100, 0.8, 'sawtooth'), 300);
  }

  public playStartGame(): void {
    if (!this.audioContext) return;
    this.playTone(261.63, 0.1, 'sine'); // C4
    setTimeout(() => this.playTone(329.63, 0.1, 'sine'), 100); // E4
    setTimeout(() => this.playTone(392.00, 0.2, 'sine'), 200); // G4
  }

  public playPowerUp(): void {
    this.playTone(600, 0.3, 'triangle');
  }

  public startMusic(): void {
    if (this.musicScheduler || !this.audioContext) return;
    const melody = [
      { note: 261.63, duration: 0.2 }, { note: 293.66, duration: 0.2 }, { note: 329.63, duration: 0.2 },
      { note: 293.66, duration: 0.2 }, { note: 261.63, duration: 0.4 },
    ];
    let currentTime = 0;
    const playNextNote = () => {
        const noteInfo = melody.shift();
        if (noteInfo) {
            this.playTone(noteInfo.note, noteInfo.duration, 'sine', 0.3, this.musicGainNode);
            currentTime += noteInfo.duration;
            melody.push(noteInfo);
            this.musicScheduler = setTimeout(playNextNote, noteInfo.duration * 1000);
        }
    };
    playNextNote();
  }

  public stopMusic(): void {
    if (this.musicScheduler) {
      clearTimeout(this.musicScheduler);
      this.musicScheduler = null;
    }
  }
}