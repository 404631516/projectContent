import { Scene } from 'phaser';
import { ParkourDepth, ParkourNumber, ParkourString } from '../Data/ParkourConfig';
import { ParkourItemData } from '@/manager/TableManager';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import SoundPool from '../../Common/SoundPool';

// Magnet prefab
export default class ParkourMagnet extends Phaser.Physics.Arcade.Image {
  /** 表演磁鐵得分動畫時間長度 */
  private readonly magnetFxDuration: number = 1000;

  /** 物理Body寬度 */
  private readonly magnetBodyWidth = 32;
  /** 物理Body高度 */
  private readonly magnetBodyHeight = 512;
  /** 物件Scale */
  private readonly magnetScale = 1;

  /** 磁鐵音效 */
  private magnetSoundPool?: SoundPool;

  constructor(scene: Scene, position: Phaser.Math.Vector2, key: string) {
    // 初始化磁鐵本身
    super(scene, position.x, position.y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    // 加大物理y軸碰撞區，減少物理x軸碰撞區
    this.setBodySize(this.magnetBodyWidth, this.magnetBodyHeight);
    // 加大圖案大小
    this.setScale(this.magnetScale);
    // 顯示最上層
    this.setDepth(ParkourDepth.MagnetFx);
    // 預設隱藏磁鐵道具
    this.setVisible(false);

    // 設置音效
    this.magnetSoundPool = new SoundPool(this.scene, ParkourString.AudioMagnet);
  }

  /** 開啟磁鐵道具 */
  public async activate(itemData: ParkourItemData): Promise<void> {
    this.setTexture(itemData.nameKey);
    this.setVisible(true);

    // 播放音效
    this.magnetSoundPool?.play();

    const timeEvent = this.scene.time.addEvent({
      delay: itemData.duration * 1000,
      callback: () => {
        // 將磁鐵道具顯示關閉
        this.setVisible(false);
        this.scene.time.removeEvent(timeEvent);
      },
    });

    // 等待事件完成
    await AsyncHelper.pendingUntil(() => this.visible === false);
  }

  /** 播放鑽石被磁鐵收集的動畫
   * @param diamondX 鑽石起始位置x
   * @param diamondY 鑽石起始位置y
   * @returns
   */
  public async playDiamonCollectAnim(
    diamond: Phaser.Physics.Arcade.Image,
    diamondGroup: Phaser.Physics.Arcade.Group
  ): Promise<void> {
    // 將此鑽石從物理群組中移除
    diamondGroup.remove(diamond);

    // 鑽石飛到螢幕右上方計分處
    const tween = this.scene.tweens.add({
      targets: diamond,
      x: ParkourNumber.ScoreIconX,
      y: ParkourNumber.ScoreIconY,
      duration: this.magnetFxDuration,
    });

    // 等待動畫完成
    await AsyncHelper.pendingUntil(() => tween.progress === 1);
    // 摧毀物件
    diamond.destroy(true);
    // 移除動畫
    this.scene.tweens.remove(tween);
  }
}
