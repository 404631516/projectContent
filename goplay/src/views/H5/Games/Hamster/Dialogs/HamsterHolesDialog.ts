import { HamsterData } from '@/manager/TableManager';
import UIDialog from '../../../Scripts/Components/UIDialog';
import Hamster from '../Components/Hamster';
import Object2D from '../../../Scripts/Components/Object2D';
import TableManager from '@/manager/TableManager';
import { HamsterString } from '../Data/HamsterConfig';
import HamsterGameScene from '../Scenes/HamsterGameScene';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { ParticleEmitterData } from '@/views/H5/Helper/PhaserHelper';

export default class HamsterHolesDialog extends UIDialog {
  /** 攻擊的動畫名稱 */
  private readonly hitAnim: string = 'hitAnimKey';

  /** 地鼠洞 */
  private holeList: Hamster[] = [];

  /** 攻擊地鼠的特效 */
  private hitEffect!: Phaser.GameObjects.Sprite;

  /** 地鼠被擊中的特效particle */
  public explosionParticleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter; // 爆炸效果

  /** 沒有地鼠的洞 */
  private get emptyHoles(): Hamster[] {
    return this.holeList.filter((hole) => false === hole.isAppear);
  }

  /** 有地鼠出現的洞 */
  private get fullHoles(): Hamster[] {
    return this.holeList.filter((hamster) => true === hamster.isAppear);
  }

  /** 目前場上的地鼠數量 */
  public get appearCount(): number {
    return this.fullHoles.length;
  }

  /** 目前場上的空洞數量 */
  public get remaindCount(): number {
    return this.emptyHoles.length;
  }

  protected setUI(): void {
    // 取得地洞位置靜態表
    const holePlaceData: Array<{ x: number; y: number }> = this.scene.cache.json.get(HamsterString.HolePlace);
    // 取得預設地鼠 TODO 預設不用給地鼠資料
    const defaultHamster = TableManager.hamster.findOne(1);

    // 佈置地鼠洞
    for (const hole of holePlaceData) {
      // 建立遮罩
      const hamsterMask = this.createImageMask(HamsterString.HoleMask, hole.x, hole.y);
      // 建立地鼠洞
      const hamster = this.addObject(hole.x, hole.y, Hamster, defaultHamster, hamsterMask);
      // 存入矩陣
      this.holeList.push(hamster);
    }
    // 建立攻擊畫面的圖片
    this.hitEffect = this.addSprite(HamsterString.NormalHit, 0, 0);
    this.hitEffect.setScale(4);
    // 建立擊破效果
    const particleEmitterData: ParticleEmitterData = {
      imageKey: HamsterString.HitEffect,
      name: HamsterString.ParticleEmitterHurt,
      jsonKey: HamsterString.ParticleEmitterConfigs,
    };
    this.explosionParticleEmitter = this.addParticleEmitter(particleEmitterData);
  }

  /** 註冊地鼠消失的回呼
   * @param func
   */
  public setDisappearHurtEvent(func: (hamster: Hamster) => void): void {
    // TODO 回呼機制複雜, 後續優化
    this.holeList.forEach((hamster) => {
      hamster.onDisappearHurt = func;
    });
  }

  /** 註冊地鼠被擊敗的回呼
   * @param func
   */
  public setDieEvent(func: (hamster: Hamster) => void): void {
    // TODO 回呼機制複雜, 後續優化
    this.holeList.forEach((h) => {
      h.onDie = (hamster: Hamster) => {
        func(hamster);
      };
    });
  }

  /** 註冊地鼠攻擊英雄的回呼 */
  public setAttackEvent(
    func: (data: HamsterData) => void,
    target: Object2D | Phaser.GameObjects.Image | Phaser.GameObjects.Sprite
  ): void {
    // TODO 回呼機制複雜, 後續優化
    this.holeList.forEach((hamster) => {
      hamster.onAttack = func;
      // 設置攻擊的目標
      hamster.setTarget(target);
    });
  }

  /** 註冊地鼠被點擊的回呼 */
  public setHitEvent(func: (hamster: Hamster) => { hits: number; hitSpriteKey: string }): void {
    // TODO 回呼機制複雜, 後續優化
    this.holeList.forEach((h) => {
      // 回傳攻擊次數
      h.onHit = (hamster: Hamster) => {
        this.playExploreEffect(hamster.x, hamster.y, HamsterString.HitEffect);
        const res = func(hamster);
        this.setHitAnimation(res.hitSpriteKey, hamster.x, hamster.y - 120);
        return res.hits;
      };
    });
  }

  /** 填入地鼠資料並進行地鼠現身動畫
   * @param hamsterDatas
   */
  public onAppearHamsters(hamsterDataList: HamsterData[]): void {
    // 找出全部空位 (隨機排序)
    const emptyHoleList = Phaser.Math.RND.shuffle(this.emptyHoles);

    // 設置地鼠
    for (const hamsterData of hamsterDataList) {
      // 取得空位
      const hole = emptyHoleList.pop();
      if (hole === undefined) {
        console.error(
          `onAppearHamsters Error: not enough empty holes empty:${emptyHoleList.length} required:${hamsterDataList.length}`
        );
        return;
      }

      // 設置地鼠資料並出現地鼠
      hole.appear(hamsterData);
    }
  }

  /** 重新設定攻擊動畫 */
  private setHitAnimation(spriteKey: string, posX: number, posY: number): void {
    this.hitEffect.anims.remove(this.hitAnim);
    this.hitEffect.anims.create({
      key: this.hitAnim,
      frames: spriteKey,
      frameRate: 48,
      showOnStart: true,
      hideOnComplete: true,
    });
    // 播放動畫
    this.hitEffect.setPosition(posX, posY);
    this.hitEffect.anims.play(this.hitAnim);
  }

  /** 攻擊地鼠效果器 */
  private playExploreEffect(x: number, y: number, key: string): void {
    // 播放音效
    HamsterGameScene.instance.playOnHitHamsterSound();
    // 地鼠被擊中particle表演
    this.explosionParticleEmitter.explode(3, x, y);
  }
}
