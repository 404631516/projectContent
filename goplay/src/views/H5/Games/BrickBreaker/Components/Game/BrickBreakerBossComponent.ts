import bossImgPath from '@/config/imgPath/_boss';
import TableManager from '@/manager/TableManager';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { BrickBreakerBossData } from '@/views/H5/Net/NetProtocol/BrickBreakerStructure';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import Slider from '@/views/H5/Scripts/Components/Slider';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { BrickBreakerNumber, BrickBreakerString } from '../../Data/BrickBreakerConfig';
import BrickBreakerGameScene from '../../Scenes/BrickBreakerGameScene';

export default class BrickBreakerBossComponent extends Object2D {
  /** 指定為BrickBreakerGameScene使用 */
  public declare scene: BrickBreakerGameScene;

  /** 魔王資訊 魔王圖案 */
  private bossIcon!: Phaser.GameObjects.Image;
  /** 魔王資訊 hp slider */
  private bossHpSlider!: Slider;

  /** init
   * @param bossData 魔王資訊
   */
  public init(bossData: BrickBreakerBossData): void {
    // 預設圖片
    this.bossIcon = this.addImage(BaseSceneString.EnergyIcon, 0, -25);
    this.bossIcon.setScale(0.26);
    // bossTag
    const bossTag = this.addImage(BrickBreakerString.BossTag, 0, -60);
    bossTag.setScale(0.7);

    // 血條
    this.bossHpSlider = this.addObject(0, 28, Slider, 1000);
    this.bossHpSlider.setBarSize(60, 18);
    // 血條加到effectLayer
    this.scene.effectLayer.addObjectToEffectLayer(this.bossHpSlider, this.x, this.y + 28);
    // bossIcon
    const bossIcon = this.addImage(BrickBreakerString.BossIcon, 0, 0);
    bossIcon.setScale(0.7);
    // bossIcon加到effectLayer
    this.scene.effectLayer.addObjectToEffectLayer(bossIcon, this.x - 42, this.y + 26);

    // 設定魔王圖片
    const bossTableData = TableManager.boss.findOne(bossData.bossId);
    if (bossTableData === undefined) {
      console.error('gameDialog.setBoss() error, bossTableData is null! bossId = ' + bossData.bossId);
      return;
    }
    // 載入資源
    this.scene.load.image(bossTableData.bossNameKey, `${bossImgPath.bossBaseUrl}${bossTableData.imgUrl}.png`);
    this.scene.load.start();
    this.scene.load.once(
      'complete',
      () => {
        // 資源載好後設定圖片
        this.bossIcon.setTexture(bossTableData.bossNameKey);
      },
      this
    );

    this.update(bossData);
  }

  /** 更新魔王資訊
   * @param bossData 魔王資訊
   */
  public update(bossData: BrickBreakerBossData): void {
    this.bossHpSlider.setValue(bossData.hp, bossData.totalHp);
  }

  /** 播放魔王死亡動畫 */
  public async playBossDead(): Promise<void> {
    // 鏡頭轉向魔王
    this.scene.mapViewCamera.setZoom(BrickBreakerNumber.MapViewMaxZoom);
    this.scene.mapViewCamera.pan(this.x, this.y, 1000);
    await AsyncHelper.sleep(1);

    // 搖一搖
    this.scene.add.tween({
      targets: this,
      angle: {
        from: -5,
        to: 5,
      },
      yoyo: true,
      repeat: 8,
      duration: 100,
      onComplete: () => {
        this.angle = 0;
      },
    });
    await AsyncHelper.sleep(4);

    // 飛走
    // 目標位置
    const targetPos = new Phaser.Math.Vector2(this.x, -1000);
    // 創建曲線
    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(this.x, this.y),
      new Phaser.Math.Vector2((this.x + targetPos.x) / 2, this.y - 1000),
      new Phaser.Math.Vector2(targetPos.x, targetPos.y)
    );
    // 曲線上的路徑點
    const path = { t: 0, vec: new Phaser.Math.Vector2() };
    this.scene.add.tween({
      targets: path,
      t: 1,
      ease: 'Sine.easeInOut',
      duration: BrickBreakerNumber.TeleportTweenSec * 1000,
      onUpdate: () => {
        // 抓到路徑點並移動
        curve.getPoint(path.t, path.vec);
        this.x = path.vec.x;
        this.y = path.vec.y;
      },
    });
    // 魔王旋轉圈數
    const circleCount = 5;
    // 魔王旋轉
    this.scene.add.tween({
      targets: this,
      angle: {
        from: 0,
        to: 360,
      },
      repeat: circleCount,
      duration: (BrickBreakerNumber.TeleportTweenSec * 1000) / circleCount,
    });
    // 等瞬移完畢
    await AsyncHelper.sleep(BrickBreakerNumber.TeleportTweenSec);
  }
}
