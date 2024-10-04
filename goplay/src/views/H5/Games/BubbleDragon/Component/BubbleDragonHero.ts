import { Scene } from 'phaser';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import BubbleDragonHeroFSM from './BubbleDragonHeroFSM';
import { HeroData } from '@/manager/TableManager';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { CharacterAnimType } from '@/helper/enum/PhaserGame';

export default class BubbleDragonHero extends Object2D {
  /** Hero狀態機 */
  private heroFSM: BubbleDragonHeroFSM;
  /** HeroSprite */
  private heroSprite: Phaser.GameObjects.Sprite;
  /** 英雄資料 */
  private heroData: HeroData;

  constructor(scene: Scene, position: Phaser.Math.Vector2, heroData: HeroData) {
    super(scene, position.x, position.y);

    // 紀錄英雄資料
    this.heroData = heroData;
    // 加入英雄動畫圖
    this.heroSprite = this.addSprite(heroData.nameKey, 0, 0);
    this.heroSprite.play(AnimationHelper.getCharacterAnimKey(heroData, CharacterAnimType.Idle));
    // 設置英雄定位點為中間底部
    this.heroSprite.setOrigin(0.5, 1);
    // 縮放
    this.heroSprite.setScale(0.5);
    // 面向右邊
    this.heroSprite.setFlip(true, false);

    // 啟動狀態機
    this.heroFSM = new BubbleDragonHeroFSM(this);
    this.heroFSM.start();
  }

  /** 更新英雄狀態 */
  public update(time: number, delta: number): void {
    this.heroFSM.update(time, delta);
  }

  /** 播放閒置動畫 */
  public onIdleEnter(): void {
    this.heroSprite.anims.play(AnimationHelper.getCharacterAnimKey(this.heroData, CharacterAnimType.Idle));
  }
}
