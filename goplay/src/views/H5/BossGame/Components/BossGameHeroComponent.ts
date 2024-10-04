import { CharacterAnimType } from '@/helper/enum/PhaserGame';
import { HeroData } from '@/manager/TableManager';
import AnimationHelper from '../../Helper/AnimationHelper';
import { AsyncHelper } from '../../Helper/AsyncHelper';
import Object2D from '../../Scripts/Components/Object2D';
import { BossNumber } from '../BossConfig';

/** 魔王表演英雄資料 */
export interface BossGameHeroData {
  /** 圖片Key */
  heroData: HeroData;
  /** 砲彈圖片Key */
  bombImgKey: string;
  /** 英雄名稱 */
  name: string;
  /** 英雄站位 */
  position: Phaser.Math.Vector2;
}

export default class BossGameHeroComponent extends Object2D {
  /** 英雄圖縮放比例 */
  private readonly heroSpriteScale: number = 0.44;

  /** 生成砲彈圖片key */
  private bombImgKey!: string;

  /** Init
   * @param bossGameHeroData
   */
  public init(bossGameHeroData: BossGameHeroData) {
    // 設定砲彈圖片key
    this.bombImgKey = bossGameHeroData.bombImgKey;

    // 設定英雄圖像及動畫
    const animKey: string = AnimationHelper.getCharacterAnimKey(bossGameHeroData.heroData, CharacterAnimType.Idle);
    const heroSprite = this.addSprite(animKey, 0, 0);
    heroSprite.anims.play(animKey);
    heroSprite.setScale(this.heroSpriteScale);
    heroSprite.setFlipX(true);

    // 設定顯示名稱
    this.addText(bossGameHeroData.name, 0, -45);
  }

  /** 英雄攻擊, 丟砲彈, 拋物線砸中魔王
   * @param bossPosition
   */
  public async fire(bossPosition: Phaser.Math.Vector2): Promise<void> {
    const tweenSec = 0.8;

    // 丟砲彈高度差, 由低處丟到高處
    const startPosY = this.y + 30;
    const targetPosY = bossPosition.y - 20;
    // 生成砲彈
    const heroBomb = this.scene.add.image(this.x, startPosY, this.bombImgKey);
    heroBomb.setScale(BossNumber.BombScale);

    // 移動砲彈X 並帶旋轉
    this.scene.add.tween({
      targets: heroBomb,
      x: bossPosition.x,
      rotation: `+=${Phaser.Math.PI2}`,
      duration: tweenSec * 1000,
      // 炮彈擊中後
      onComplete: () => {
        // 摧毀砲彈
        heroBomb.destroy();
      },
    });
    // 移動Y軸(拋物線)
    this.scene.add.tween({
      targets: heroBomb,
      y: targetPosY,
      ease: (t: number) => {
        return Math.sin(t * 3) * 2;
      },
      duration: tweenSec * 1000,
    });

    return await AsyncHelper.sleep(tweenSec);
  }
}
