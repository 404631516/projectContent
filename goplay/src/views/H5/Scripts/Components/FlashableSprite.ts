import { Scene } from 'phaser';
import Object2D from './Object2D';

/** 有進階閃爍功能的Sprite
 * 因 Phaser 原生 setTint 的 Blend 方式為 Additive
 * 所以此 Class 透過將第二張同步 Sprite setTintFill後疊圖，創造出 setTintAdd 的錯覺
 *
 * Class 本身為 Object2D 模擬成一般 Sprite
 * 大部分時候直接將 FlashableSprite 當成 Phaser.GameObjects.Sprite 操作即可
 * 特色功能為 flashing，給定顏色即可模擬 setTintAdd 閃爍動畫
 */
export default class FlashableSprite extends Object2D {
  /** 主要Sprite */
  private sprite: Phaser.GameObjects.Sprite;
  /** 表演閃爍用Sprite */
  private flashingSprite: Phaser.GameObjects.Sprite;
  /** 全部Sprite清單 */
  private allSprite: Phaser.GameObjects.Sprite[];
  /** Tween */
  private tween?: Phaser.Tweens.Tween;

  //#region 模擬 Phaser.GameObjects.Sprite getters
  /** 動畫是否處於暫停狀態 */
  public get isAnimsPaused(): boolean {
    return this.sprite.anims.isPaused;
  }
  /** 圖片是否處於翻轉狀態 */
  public get flipX(): boolean {
    return this.sprite.flipX;
  }
  //#endregion

  constructor(scene: Scene, x: number, y: number, key: string) {
    super(scene, x, y);

    // 初始化Sprite
    this.sprite = this.addSprite(key, 0, 0);
    // 初始化閃爍Sprite
    this.flashingSprite = this.addSprite(key, 0, 0);
    this.flashingSprite.setVisible(false);
    this.flashingSprite.setAlpha(0);
    // 初始化清單
    this.allSprite = [this.sprite, this.flashingSprite];
  }

  //#region 特色功能
  /** 模擬 setTintAdd 閃爍動畫
   * @param color 閃爍顏色
   */
  public flashing(color: number): void {
    // 將原先Tween關閉
    if (this.tween) {
      this.scene.tweens.remove(this.tween);
    }

    // 設定閃爍動畫
    this.tween = this.scene.tweens.add({
      onStart: () => {
        this.flashingSprite.setAlpha(0);
        this.flashingSprite.setTintFill(color);
        this.flashingSprite.setVisible(true);
      },

      targets: this.flashingSprite,
      alpha: 0.75,
      ease: 'Cubic.easeOut',
      duration: 250,
      yoyo: true,

      onComplete: () => {
        this.flashingSprite.setVisible(false);
      },
    });
  }
  //#endregion

  //#region 模擬 Phaser.GameObjects.Sprite functions
  /** 設定Texture
   * @param key Texture Key
   */
  public setTexture(key: string): void {
    this.allSprite.forEach((sprite: Phaser.GameObjects.Sprite) => {
      sprite.setTexture(key);
    });
  }

  /** 設定水平翻轉
   * @param isFlip 是否翻轉
   */
  public setFlipX(isFlip: boolean): void {
    this.allSprite.forEach((sprite: Phaser.GameObjects.Sprite) => {
      sprite.setFlipX(isFlip);
    });
  }

  /** 播放動畫
   * @param key 動畫Key
   */
  public playAnims(key: string): void {
    this.allSprite.forEach((sprite: Phaser.GameObjects.Sprite) => {
      sprite.anims.play(key);
    });
  }

  /** 暫停動畫並回復第x幀
   *  @param frameIndex 停在第幾幀
   */
  public pauseAnimsAtFrame(frameIndex?: number): void {
    this.allSprite.forEach((sprite: Phaser.GameObjects.Sprite) => {
      // 暫停在frameIndex的幀數
      if (frameIndex !== undefined) {
        sprite.anims.pause(sprite.anims.currentAnim!.frames[frameIndex]);
      }
      // 如果沒給Index暫停在當前幀數
      else {
        sprite.anims.pause();
      }
    });
  }

  /** 繼續動畫 */
  public resumeAnims(): void {
    this.allSprite.forEach((sprite: Phaser.GameObjects.Sprite) => {
      sprite.anims.resume();
    });
  }
  //#endregion
}
