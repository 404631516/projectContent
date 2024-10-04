export default class SoundPool {
  /** Sound Array */
  private soundPool: Phaser.Sound.BaseSound[] = [];

  /** 當前場景 */
  private scene: Phaser.Scene;

  /** Sound 的key, 注意要記得事前load好這個Audio */
  private soundKey?: string;

  /** constructor */
  constructor(scene: Phaser.Scene, soundKey: string) {
    this.scene = scene;
    this.soundKey = soundKey;
  }

  /** 播放音效, 若物件池中的Sound都還沒播放結束, 就生成新的Sound加進物件池 */
  public play(): void {
    if (this.soundKey == null) {
      console.error('沒有設置正確的soundKey，play失敗。');
      return;
    }

    // 計算當前撥放的音效
    let currentPlayingCount = 1;
    this.soundPool.forEach((sound: Phaser.Sound.BaseSound) => {
      if (sound.isPlaying === false) {
        return;
      }

      currentPlayingCount++;
    });

    // 檢查當前有沒有空閒的Sound
    for (const sound of this.soundPool) {
      // 找到空閒的Sound
      if (sound.isPlaying === false) {
        // 播放音效
        sound.play(undefined, { volume: 1 / currentPlayingCount });
        return;
      }
    }
    // 若沒有空閒的Sound, new一個Sound, 存進pool裡
    this.soundPool.push(this.scene.sound.add(this.soundKey));
    // 播放音效
    const lastIndex = this.soundPool.length - 1;
    this.soundPool[lastIndex].play(undefined, { volume: 1 / currentPlayingCount });
  }
}
