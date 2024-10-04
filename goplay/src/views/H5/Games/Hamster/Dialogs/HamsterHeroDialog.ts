import UIDialog from '../../../Scripts/Components/UIDialog';
import HorizontalLayout from '../../../Scripts/Components/HorizontalLayout';
import Localization, { LocalKeyType } from '../../../Scripts/Components/Localization';
import { HeroData } from '@/manager/TableManager';
import { HamsterString } from '../Data/HamsterConfig';
import { ParticleEmitterData } from '@/views/H5/Helper/PhaserHelper';

export default class HamsterHeroDialog extends UIDialog {
  /** 英雄圖片 */
  public heroImg!: Readonly<Phaser.GameObjects.Image>;
  /** 英雄圖片下方的文字資訊的layout */
  private heroInfoLayout!: HorizontalLayout;
  /** 英雄名稱 */
  private heroName!: Phaser.GameObjects.Text;
  /** 英雄等級 */
  private heroLevel!: Phaser.GameObjects.Text;
  /** 英雄受傷particle特效 */
  public damageParticleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  /** 英雄位置x */
  private readonly heroX: number = 50;

  protected setUI(): void {
    // 英雄圖片
    this.heroImg = this.addImage('', this.heroX, 400);
    this.heroImg.setScale(-0.7, 0.7);
    // 顯示英雄的基本資料
    this.heroName = this.addText('', 0, 0);
    this.heroLevel = this.addText(`Level 0`, 0, 0);
    this.heroInfoLayout = new HorizontalLayout(this.addObject(100, this.height - 20));
    this.heroInfoLayout.fitElements = true;
    this.heroInfoLayout.setSpacing(10);
    this.heroInfoLayout.addElements([this.heroName, this.heroLevel]);
    // 重算容器範圍及背景，排列容器內元件
    this.heroInfoLayout.draw();

    // 建立傷害特效
    const particleEmitterData: ParticleEmitterData = {
      imageKey: HamsterString.HitEffect,
      name: HamsterString.ParticleEmitterHurt,
      jsonKey: HamsterString.ParticleEmitterConfigs,
    };
    this.damageParticleEmitter = this.addParticleEmitter(particleEmitterData);
  }

  /** 設置英雄
   * @param heroData 英雄資料
   * @param level 英雄等級
   */
  public setHero(heroData: HeroData, level: number = 0): void {
    // 英雄圖片
    this.heroImg.setTexture(heroData.nameKey);
    // 英雄資訊
    this.heroName.setText(Localization.getText(LocalKeyType.Common, heroData.nameKey));
    this.heroLevel.setText(`Level ${level}`);
    this.heroInfoLayout.draw();
  }

  /** 英雄受到傷害 */
  public playDamage(): void {
    // 執行傷害Particle特效
    this.damageParticleEmitter.explode(3, this.heroImg.x, this.heroImg.y);
    // 英雄搖動
    this.scene.add.tween({
      targets: this.heroImg,
      x: {
        from: this.heroX - 5,
        to: this.heroX + 5,
      },
      yoyo: true,
      repeat: 1,
      duration: 80,
      onComplete: () => {
        this.heroImg.setX(this.heroX);
      },
    });
  }
}
