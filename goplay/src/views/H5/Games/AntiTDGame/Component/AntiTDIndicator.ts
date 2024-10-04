import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { AntiTDString } from '../Data/AntiTDConfig';
import AntiTDGameScene from '../Scenes/AntiTDGameScene';
import AntiTDHeroSelect from './AntiTDHeroSelect';
import { AntiTDEnemy } from './Battle/AntiTDBattleUnit';

export default abstract class AntiTDIndicator extends Object2D {
  //#region declare、readonly
  /** 逆塔防遊戲場景 */
  public declare scene: AntiTDGameScene;
  /** 縮放 */
  private readonly scaleSize: number = 1.5;
  /** 指標Key */
  protected abstract readonly indicatorKey: AntiTDString;
  //#endregion declare、readonly

  //#region 元件
  /** 指標 */
  private indicator: Phaser.GameObjects.Image;
  /** 指向目標 */
  protected abstract target?: Object2D;
  //#endregion 元件

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    // 設置指標
    this.indicator = this.addImage('', 0, 0);
    // 設置深度
    this.setDepth(this.scene.uiDepth);
    // 設置縮放
    this.setScale(this.scaleSize);
    this.setVisible(false);
  }

  /** 初始化
   * @param target 指向目標
   */
  public init(target: Object2D): void {
    this.target = target;
    this.indicator.setTexture(this.indicatorKey);
    // 顯示並開始更新
    this.setActive(true);
    this.setVisible(false);
  }

  update(): void {
    // 假如目標消失，將自身關閉、停止更新
    if (this.target === undefined || this.target.active === false) {
      this.target = undefined;
      this.setVisible(false);
      this.setActive(false);
      return;
    }

    // 繼承類別特製檢查
    if (this.isVisible() === false) {
      this.setVisible(false);
      return;
    }

    // 定義鏡頭邊緣，加上指標寬高避免指標跑出螢幕外
    const left = this.scene.cameras.main.worldView.left + this.indicator.width;
    const right = this.scene.cameras.main.worldView.right - this.indicator.width;
    const top = this.scene.cameras.main.worldView.top + this.indicator.height;
    const bottom = this.scene.cameras.main.worldView.bottom - this.indicator.height;

    // x超出
    const xClamped = this.target.x > right || this.target.x < left;
    // y超出
    const yClamped = this.target.y > bottom || this.target.y < top;

    // 在視野範圍內不顯示
    if (xClamped === false && yClamped === false) {
      this.setVisible(false);
      return;
    }

    // 取得英雄、目標、鏡頭兩角，用4個點計算線段交點
    let viewCorners: Phaser.Math.Vector2[];

    // 目標在螢幕外界左或右
    if (xClamped === true) {
      viewCorners = [
        new Phaser.Math.Vector2(this.target.x < left ? left : right, top),
        new Phaser.Math.Vector2(this.target.x < left ? left : right, bottom),
      ];
    }
    // 目標在螢幕外界上或下
    else {
      viewCorners = [
        new Phaser.Math.Vector2(left, this.target.y < top ? top : bottom),
        new Phaser.Math.Vector2(right, this.target.y < top ? top : bottom),
      ];
    }

    // 計算交點座標
    this.moveToIntersection(viewCorners, new Phaser.Math.Vector2(this.target.x, this.target.y));

    // 假如畫面寬高不同，導致算出的交點依然在螢幕外，再次計算交點
    if (this.y > bottom || this.y < top) {
      viewCorners = [
        new Phaser.Math.Vector2(left, this.y < top ? top : bottom),
        new Phaser.Math.Vector2(right, this.y < top ? top : bottom),
      ];

      // 計算交點座標
      this.moveToIntersection(viewCorners, new Phaser.Math.Vector2(this.x, this.y));
    }

    // 計算英雄隊長與目標的夾角
    const includedRotation = Phaser.Math.Angle.Between(
      this.scene.heroTeamLeader.x,
      this.scene.heroTeamLeader.y,
      this.target.x,
      this.target.y
    );
    const wrapIncludedRotation = Phaser.Math.Angle.Wrap(includedRotation);
    // 更新指向角度
    this.rotation = wrapIncludedRotation;
    this.setVisible(true);
  }

  /** 移動到交點座標
   * @param viewCorners 鏡頭邊角
   * @param targetPoint 目標點
   */
  private moveToIntersection(viewCorners: Phaser.Math.Vector2[], targetPoint: Phaser.Math.Vector2): void {
    // 英雄隊長
    const startPoint = new Phaser.Math.Vector2(this.scene.heroTeamLeader.x, this.scene.heroTeamLeader.y);

    // a: 英雄隊長, b: 目標, c: viewCorners[0], d: viewCorners[1]
    const ca = startPoint.clone().subtract(viewCorners[0]);
    const cd = viewCorners[1].clone().subtract(viewCorners[0]);
    const ab = targetPoint.clone().subtract(startPoint);

    // 外積算出垂直向量比
    const t = ca.cross(cd) / cd.cross(ab);
    // 依照比例計算交點位置
    const dx = t * (targetPoint.x - startPoint.x);
    const dy = t * (targetPoint.y - startPoint.y);
    // 更新位置到交點
    this.x = startPoint.x + dx;
    this.y = startPoint.y + dy;
  }

  /** 繼承類別特製檢查 */
  protected abstract isVisible(): boolean;
}

/** 指向英雄選角 */
export class AntiTDHeroIndicator extends AntiTDIndicator {
  /** 英雄指標圖 */
  protected indicatorKey: AntiTDString = AntiTDString.HeroIndicator;
  /** 英雄選角元件 */
  protected target?: AntiTDHeroSelect;

  /** 永遠顯示 */
  protected isVisible(): boolean {
    return true;
  }
}

/** 指向剩餘敵人 */
export class AntiTDEnemyIndicator extends AntiTDIndicator {
  /** 敵人指標圖 */
  protected indicatorKey: AntiTDString = AntiTDString.EnemyIndicator;
  /** 敵人元件 */
  protected target?: AntiTDEnemy;

  /** 敵人數量小於一定數量才顯示 */
  protected isVisible(): boolean {
    return this.scene.combatGroups.getTotalAliveEnemyTeam() <= 3;
  }
}
