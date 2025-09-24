import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private playSound(sound: string) {
    const audio = new Audio(`assets/sounds/${sound}.mp3`);
    audio.play();
  }

  playMove() {
    this.playSound('move');
  }

  playRotate() {
    this.playSound('rotate');
  }

  playHardDrop() {
    this.playSound('hard-drop');
  }

  playHold() {
    this.playSound('hold');
  }

  playLineClear() {
    this.playSound('line-clear');
  }

  playLock() {
    this.playSound('lock');
  }

  playGameOver() {
    this.playSound('game-over');
  }

  playStartGame() {
    this.playSound('start-game');
  }

  playPowerUp() {
    this.playSound('powerup');
  }
}
