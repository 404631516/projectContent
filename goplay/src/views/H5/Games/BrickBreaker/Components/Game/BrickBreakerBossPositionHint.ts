import bossImgPath from '@/config/imgPath/_boss';
import TableManager from '@/manager/TableManager';
import { clamp } from '@/views/H5/Helper/MathHelper';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { BrickBreakerString } from '../../Data/BrickBreakerConfig';

export default class BrickBreakerBossPositionHint extends Object2D {
  /** 會旋轉的背景箭頭 */
  private bgArrow: Phaser.GameObjects.Image;
  /** 魔王icon */
  private bossIcon: Phaser.GameObjects.Image;

  /** 對應攝影機 */
  private camera!: Phaser.Cameras.Scene2D.Camera;
  /** 追蹤目標 */
  private target!: Object2D;

  /** 提示圖案大小(的一半), 用於計算圖案在畫面上的移動範圍 */
  private readonly arrowImgHalfSize: number = 50;

  /** constructor
   * @param scene Phaser.Scene
   * @param bossId bossId
   * @param camera map camera
   * @param target 跟隨目標(魔王)
   */
  constructor(scene: Phaser.Scene, bossId: number, camera: Phaser.Cameras.Scene2D.Camera, target: Object2D) {
    super(scene);
    this.camera = camera;
    this.target = target;

    this.bgArrow = this.addImage(BrickBreakerString.BossHintIcon, 0, 0);
    // bossIcon先給預設圖, 實際魔王頭像load好後再換掉
    this.bossIcon = this.addImage(BrickBreakerString.BossIcon, 0, 0);

    // 設定魔王圖片
    const bossTableData = TableManager.boss.findOne(bossId);
    if (bossTableData === undefined) {
      console.error('gameDialog.setBoss() error, bossTableData is null! bossId = ' + bossId);
      return;
    }
    const imgKey = `${bossTableData.bossNameKey}_head`;
    const imgUrl = `${bossImgPath.bossBaseUrl}${bossTableData.imgUrl}_head.png`;
    // 載入資源
    this.scene.load.image(imgKey, imgUrl);
    this.scene.load.start();
    this.scene.load.once(
      'complete',
      () => {
        // 資源載好後設定圖片
        this.bossIcon.setTexture(imgKey);
      },
      this
    );
  }

  /** update */
  public update(): void {
    // 當前攝影機照射範圍
    const cameraView = this.camera.worldView;
    // 圖案縮放比
    const imgScale = 1 / this.camera.zoom;

    // 圖案移動範圍左上
    const cameraRangeUpperLeft = new Phaser.Math.Vector2(
      cameraView.x + this.arrowImgHalfSize * imgScale,
      cameraView.y + this.arrowImgHalfSize * imgScale
    );
    // 圖案移動範圍右下
    const cameraRangeBottomRight = new Phaser.Math.Vector2(
      cameraView.x + cameraView.width - this.arrowImgHalfSize * imgScale,
      cameraView.y + cameraView.height - this.arrowImgHalfSize * imgScale
    );
    // clamp後取得圖案位置
    const iconPos = new Phaser.Math.Vector2(
      clamp(this.target.x, cameraRangeBottomRight.x, cameraRangeUpperLeft.x),
      clamp(this.target.y, cameraRangeBottomRight.y, cameraRangeUpperLeft.y)
    );

    // 若魔王在畫面內, 隱藏圖案
    if (this.target.x === iconPos.x && this.target.y === iconPos.y) {
      this.bgArrow.setVisible(false);
      this.bossIcon.setVisible(false);
      return;
    }

    // 若魔王在畫面外, 顯示圖案
    this.bgArrow.setVisible(true);
    this.bossIcon.setVisible(true);
    // 設定圖案大小
    this.bgArrow.setScale(imgScale);
    this.bossIcon.setScale(imgScale);
    // 設定圖案位置
    this.bgArrow.setPosition(iconPos.x, iconPos.y);
    this.bossIcon.setPosition(iconPos.x, iconPos.y);
    // 計算向量(與水平線之間的)弧度
    const radian = Phaser.Math.Angle.BetweenPoints(iconPos, this.target);
    // 旋轉圖片
    this.bgArrow.setRotation(radian);
  }
}
