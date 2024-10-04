import { GameGem, GemBombType } from '../Components/GemsManager';
import UIDialog from '../../../Scripts/Components/UIDialog';
import { BejeweledNumber, BejeweledString } from '../Data/BejeweledConfig';
import BejeweledGameScene from '../Scenes/BejeweledGameScene';
import { ParticleEmitterData, ParticleEmitter } from '@/views/H5/Helper/PhaserHelper';

export default class BejeweledGemsDialog extends UIDialog {
  /** 寶石消除特效粒子資料 */
  private readonly gemParticleEmitterData: ParticleEmitterData = {
    imageKey: BejeweledString.Flares,
    name: BejeweledString.ParticleEmitterGem,
    jsonKey: BejeweledString.ParticleEmitterConfigs,
  };

  private readonly gemBombParticleEmitterData: ParticleEmitterData = {
    imageKey: BejeweledString.Flares,
    name: BejeweledString.ParticleEmitterGemBomb,
    jsonKey: BejeweledString.ParticleEmitterConfigs,
  };

  /** 寶石消除特效粒子 */
  private gemParticleEmitter?: ParticleEmitter;
  /** 寶石消除特效粒子 */
  private gemBombParticleEmitter?: ParticleEmitter;

  /** 點選處產生寶石炸彈
   * @param gemBombType 序號
   * @param col 欄
   * @param row 列
   */
  public createGemsBomb(gemBombType: GemBombType, targetGem: GameGem): void {
    // 點選處產生寶石炸彈Tweens
    const gemsBombPosX = targetGem.gemSprite.x;
    const gemsBombPosY = targetGem.gemSprite.y;
    const gemsBomb = this.addSprite('gemsBomb' + [gemBombType], gemsBombPosX, gemsBombPosY - BejeweledNumber.BombSize);
    gemsBomb.setScale(0.4).setDepth(1);
    // TODO addShowTweens() 整合進 createGemsBomb()
    this.addShowTweens(gemsBomb, gemsBombPosX, gemsBombPosY, BejeweledNumber.ShowBombSpeed);
  }

  /** 粒子效果
   * @param blockX X軸位置
   * @param blockY Y軸位置
   */
  public gemParticleEffect(gemX: number, gemY: number): void {
    this.gemParticleEmitter?.explode(20, gemX, gemY);
  }

  /** 粒子效果
   * @param blockX X軸位置
   * @param blockY Y軸位置
   */
  public gemBombParticleEffect(gemX: number, gemY: number): void {
    this.gemBombParticleEmitter?.explode(20, gemX, gemY);
  }

  /** 初始化UI */
  protected setUI(): void {
    // 創建粒子
    this.gemParticleEmitter = this.addParticleEmitter(this.gemParticleEmitterData);
    this.gemBombParticleEmitter = this.addParticleEmitter(this.gemBombParticleEmitterData);

    // 生成寶石觸控偵測區域
    for (let row = 0; row < BejeweledNumber.FieldSizeHeight; row++) {
      for (let col = 0; col < BejeweledNumber.FieldSizeWidth; col++) {
        const gemZonePosX = BejeweledNumber.GemSize * col + BejeweledNumber.GemSize / 2 + BejeweledNumber.MarginLeft;
        const gemZonePosY = BejeweledNumber.GemSize * row + BejeweledNumber.GemSize / 2 + BejeweledNumber.MarginTop;
        // 生成觸控範圍
        const gemDetectZone = this.addZone(gemZonePosX, gemZonePosY, BejeweledNumber.GemSize, BejeweledNumber.GemSize);

        // 觸控範圍內, 滑鼠顯示手指
        gemDetectZone.setInteractive({ useHandCursor: true });
        // 點擊寶石觸控區域時, 通知BejeweledGameScene點擊目標的row & column
        gemDetectZone.on(Phaser.Input.Events.POINTER_DOWN, () => {
          BejeweledGameScene.instance.onGemSelect(row, col);
        });
        // 進入寶石觸控區域時, 通知BejeweledGameScene目標的row & column
        gemDetectZone.on(Phaser.Input.Events.POINTER_OVER, () => {
          BejeweledGameScene.instance.onGemPointOver(row, col);
        });
        // 離開寶石觸控區域時, 通知BejeweledGameScene目標的row & column
        gemDetectZone.on(Phaser.Input.Events.POINTER_OUT, () => {
          BejeweledGameScene.instance.onGemPointOut(row, col);
        });
        // 點擊結束時, 通知BejeweledGameScene
        gemDetectZone.on(Phaser.Input.Events.POINTER_UP, () => {
          BejeweledGameScene.instance.onStopSwipe();
        });
      }
    }
  }

  /** Tweens 出現效果
   * @param item 陣列位置
   * @param x x軸位置
   * @param y y軸位置
   * @param duration 時間
   * @param ease 特效
   */
  private addShowTweens(item: any, x: number, y: number, speed: number): void {
    this.scene.tweens.add({
      targets: item,
      x: {
        getStart: (target: any, key: any, value: any) => {
          return x;
        },
      },
      y: {
        getEnd: (target: any, key: any, value: any) => {
          return y;
        },
      },
      duration: speed,
      alpha: 0,
      callbackScope: this,
      ease: Phaser.Math.Easing.Sine.Out,
      // tween完成時執行
      onComplete: (tween: any) => {
        item.destroy();
      },
    });
  }
}
