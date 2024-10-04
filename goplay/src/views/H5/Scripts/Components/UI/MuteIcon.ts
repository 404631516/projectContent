import { BaseSceneString } from '../../Data/BaseSceneConfig';

/** 靜音按鈕Prefab */
export default class MuteIcon extends Phaser.GameObjects.Image {
  /** 建構式: 為了配合Object2D的addImage使用，建構參數必須含有key、frame，但此物件本身不使用
   * @param scene 場景
   * @param x 位置
   * @param y 位置
   * @param frame 不使用，為使建構式能配合 Object2D 的 addImage
   */
  constructor(scene: Phaser.Scene, x: number, y: number, frame: string) {
    super(scene, x, y, frame);
    // 生成時首先判斷是否靜音
    this.setMuteIcon(scene.game.sound.mute);

    // 開始input互動
    this.setInteractive({ useHandCursor: true });
    // 點擊時切換靜音模式
    this.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.scene.game.sound.mute = !this.scene.game.sound.mute;
    });

    // Icon跟隨靜音參數變動
    this.scene.sound.on(
      Phaser.Sound.Events.GLOBAL_MUTE,
      (soundManager: Phaser.Sound.WebAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager, mute: boolean) => {
        this.setMuteIcon(mute);
      }
    );
  }

  /** 設置靜音圖案
   * @param isMute 是否為靜音狀態
   */
  private setMuteIcon(isMute: boolean): void {
    const textureKey = isMute ? BaseSceneString.SoundOffIcon : BaseSceneString.SoundOnIcon;
    this.setTexture(textureKey);
  }
}
