import { Scene } from 'phaser';
import UIDialog from '../../../Scripts/Components/UIDialog';
import { BubbleDragonNumber, BubbleDragonString } from '../Data/BubbleDragonConfig';
import BubbleDragonGameScene from '../Scenes/BubbleDragonGameScene';

export default class BubbleDragoneFortDialog extends UIDialog {
  /** 遊戲場景 */
  public declare scene: BubbleDragonGameScene;
  /** 射擊按鍵 */
  private readonly shootKey: string = 'SPACE';
  private readonly upArrowKey: string = 'UP';
  private readonly downArrowKey: string = 'DOWN';
  // 設置發射區域
  private mainHitZone: Phaser.GameObjects.Zone;
  /** 線的長度 */
  private readonly shootLineLength: number = 100;
  /** 牆壁上方邊界 */
  private readonly wallTopBorder: number = 90;
  /** 牆壁下方邊界 */
  private readonly wallBottomBorder: number = 418;
  /** 上方反彈邊界 */
  private readonly topBorder: number = this.wallTopBorder + BubbleDragonNumber.BubbleRadius;
  /** 下方反彈邊界 */
  private readonly bottomBorder: number = this.wallBottomBorder - BubbleDragonNumber.BubbleRadius;
  /** 提示背景位置 */
  private readonly hintBgPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(610, 256);
  /** 提示圖案位置 */
  private readonly hintIconPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(610, 230);
  /** 提示文字位置 */
  private readonly hintTextPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(610, 260);
  /** 砲台 */
  private cannonObject: Phaser.GameObjects.Rectangle;
  /** 提示物件群組 */
  public hintGroup: Phaser.GameObjects.Group;

  /** 瞄準線貼圖 */
  private supportLinePath!: Phaser.GameObjects.TileSprite;
  /** 瞄準線尾端 */
  private supportLineArrow = this.addImage(BubbleDragonString.SupportLineEnd, 0, 0);
  /** 瞄準線群組 */
  private supportLineGroup!: Phaser.GameObjects.Group;
  /** 瞄準鏡 */
  private scope = this.addImage(
    BubbleDragonString.Scope,
    BubbleDragonNumber.ScopePositionX,
    BubbleDragonNumber.ScopePositionY
  );
  /** 基本輔助線 */
  private baseSupportLine = new Phaser.Geom.Line(
    BubbleDragonNumber.ShootedBasePositionX,
    BubbleDragonNumber.ShootedBasePositionY,
    BubbleDragonNumber.ShootedBasePositionX + this.shootLineLength,
    BubbleDragonNumber.ShootedBasePositionY
  );

  constructor(scene: Scene) {
    super(scene);
    this.mainHitZone = this.addZone(
      this.scene.canvasWidth / 2,
      this.scene.canvasHeight / 2,
      this.scene.canvasWidth,
      this.scene.canvasHeight
    );
    this.cannonObject = this.scene.add.rectangle(
      BubbleDragonNumber.ShootedBasePositionX,
      BubbleDragonNumber.ShootedBasePositionY,
      60,
      60,
      undefined,
      0
    );
    this.hintGroup = new Phaser.GameObjects.Group(this.scene);
  }

  protected setUI(): void {
    // 設置瞄準線群組
    this.supportLineGroup = this.scene.add.group({
      defaultKey: 'path',
      maxSize: 100,
      classType: Phaser.GameObjects.TileSprite,
    });
    // 設置發射區域
    this.mainHitZone.setInteractive({ useHandCursor: true, draggable: true });
    // 關閉顯示瞄準鏡
    this.showScope(false);
    // 關閉顯示瞄準線尾端
    this.supportLineArrow.setVisible(false);
    // 設置射擊事件
    this.setShootEvent();
    // 設置角度控制事件
    this.setAngleControlEvent();
    // 設置提示
    this.setHint();
  }

  /** 畫基本輔助線 */
  public drawBaseSupportLine(): void {
    this.supportLinePath = this.changeSupportLineTexture(this.baseSupportLine, this.cannonObject.rotation);
    this.setSupportLineArrowPosition(this.baseSupportLine, this.cannonObject.rotation);
  }

  /** 射擊事件 */
  private setShootEvent(): void {
    // 點擊觸發射擊
    this.mainHitZone.on(Phaser.Input.Events.POINTER_UP, () => this.shootCheck());
    // 鍵盤控制射擊
    this.scene.input.keyboard!.on(`keydown-${this.shootKey}`, () => this.shootCheck());
  }

  /** 射擊檢查 */
  private shootCheck(): void {
    // 尚未準備好射擊泡泡
    if (this.scene.isPreparedShootBubble === false) {
      return;
    }
    // 射擊
    this.scene.shoot(this.cannonObject.rotation);
    // 射擊後清空輔助線
    for (const child of this.supportLineGroup.getChildren()) {
      this.supportLineGroup.killAndHide(child);
    }
    this.supportLineArrow.setVisible(false);
  }

  /** 設置角度控制事件 */
  private setAngleControlEvent(): void {
    this.mainHitZone.on(Phaser.Input.Events.GAMEOBJECT_DRAG, (pointer: any) => {
      // 尚未準備好射擊泡泡
      if (this.scene.isPreparedShootBubble === false) {
        return;
      }
      // 點擊後關閉顯示
      this.hintGroup.setVisible(false);

      // 計算角度
      const degree =
        pointer.y >= BubbleDragonNumber.ShootedBasePositionY
          ? // (現在位置 - 原點) / (下邊界 - 原點) * 60
            ((pointer.y - BubbleDragonNumber.ShootedBasePositionY) /
              (this.wallBottomBorder - BubbleDragonNumber.ShootedBasePositionY)) *
            BubbleDragonNumber.ShootAngleLimit
          : // (原點 - 現在位置) / (原點 - 上邊界) * -60
            ((BubbleDragonNumber.ShootedBasePositionY - pointer.y) /
              (BubbleDragonNumber.ShootedBasePositionY - this.wallTopBorder)) *
            -BubbleDragonNumber.ShootAngleLimit;

      // 旋轉砲台
      this.rotateCannon(degree);
    });

    // 上鍵控制角度
    this.scene.input.keyboard!.on(`keydown-${this.upArrowKey}`, () => {
      // 尚未準備好射擊泡泡
      if (this.scene.isPreparedShootBubble === false) {
        return;
      }

      let degree = this.cannonObject.angle;
      degree -= 1;

      // 旋轉砲台
      this.rotateCannon(degree);
    });

    // 下鍵控制角度
    this.scene.input.keyboard!.on(`keydown-${this.downArrowKey}`, () => {
      // 尚未準備好射擊泡泡
      if (this.scene.isPreparedShootBubble === false) {
        return;
      }

      let degree = this.cannonObject.angle;
      degree += 1;

      // 旋轉砲台
      this.rotateCannon(degree);
    });
  }

  /** 旋轉砲台
   * @param degree 角度
   */
  private rotateCannon(degree: number): void {
    // 砲台角度不能超過限制範圍
    if (Math.abs(degree) > BubbleDragonNumber.ShootAngleLimit) {
      return;
    }
    // 更改砲台角度
    this.cannonObject.angle = degree;
    // 更改輔助線角度
    this.supportLinePath.rotation = this.cannonObject.rotation;
    if (this.supportLinePath.visible) {
      // 重新定位輔助線尾端位置
      this.setSupportLineArrowPosition(this.baseSupportLine, this.cannonObject.rotation);
    }
    // 設置軌跡槍輔助線
    this.drawSupportLine();
  }

  /** 畫輔助線 */
  public drawSupportLine(): void {
    // 判斷是否要畫輔助線
    if (this.scene.isShowSupportLine) {
      for (const child of this.supportLineGroup.getChildren()) {
        this.supportLineGroup.killAndHide(child);
      }

      // 計算輔助線
      const lineList = this.getSupportLine();
      for (let i = 0; i < lineList.length; i++) {
        this.changeSupportLineTexture(lineList[i], i % 2 ? -this.cannonObject.rotation : this.cannonObject.rotation);
      }
      // 畫輔助線尾端
      this.setSupportLineArrowPosition(
        lineList[lineList.length - 1],
        (lineList.length - 1) % 2 ? -this.cannonObject.rotation : this.cannonObject.rotation
      );
    }
  }

  /** 依線條替換貼圖
   * @param line 線
   * @param rotation 角度
   */
  private changeSupportLineTexture(line: Phaser.Geom.Line, rotation: number): Phaser.GameObjects.TileSprite {
    const supportLinePath = this.supportLineGroup.get(line.x1, line.y1) as Phaser.GameObjects.TileSprite;
    supportLinePath.setActive(true);
    supportLinePath.setVisible(true);
    supportLinePath.setTexture(BubbleDragonString.SupportLinePath);
    supportLinePath.setSize(Phaser.Geom.Line.Length(line), 25);
    supportLinePath.setOrigin(0, 0.5);
    supportLinePath.rotation = rotation;

    return supportLinePath;
  }

  /** 設置瞄準線尾端位置
   * @param line 線
   * @param rotation 角度
   */
  private setSupportLineArrowPosition(line: Phaser.Geom.Line, rotation: number) {
    this.supportLineArrow.setVisible(true);
    const x2 = line.x1 + Math.cos(rotation) * Phaser.Geom.Line.Length(line);
    const y2 = line.y1 + Math.sin(rotation) * Phaser.Geom.Line.Length(line);
    this.supportLineArrow.setPosition(x2, y2);
    this.supportLineArrow.rotation = rotation;
  }

  /** 設置輔助線 */
  private getSupportLine(): Phaser.Geom.Line[] {
    // 輔助線列表
    const supportLineList: Phaser.Geom.Line[] = [];
    // 以射擊點為起始點
    const startPoint = new Phaser.Math.Vector2(
      BubbleDragonNumber.ShootedBasePositionX,
      BubbleDragonNumber.ShootedBasePositionY
    );
    // > 0 角度往下
    let borderY: number;
    if (this.cannonObject.angle > 0) {
      borderY = this.bottomBorder;
    } else {
      borderY = this.topBorder;
    }

    // 依公式( y = tanθ * x + b )取得二元一次方程式常數b
    const intercept = startPoint.y - startPoint.x * Math.tan(this.cannonObject.rotation);

    this.calculateSupportLine(startPoint, intercept, borderY, supportLineList);

    return supportLineList;
  }

  /** 計算輔助線
   * @param startPoint 起始點
   * @param intercept 截距
   * @param borderY 邊界
   * @param supportLineList 輔助線列表
   */
  private calculateSupportLine(
    startPoint: Phaser.Math.Vector2,
    intercept: number,
    borderY: number,
    supportLineList: Phaser.Geom.Line[]
  ): void {
    // X軸距離 = Y軸距離/tanθ
    const distanceX = Math.abs(borderY - startPoint.y) / Math.tan(Math.abs(this.cannonObject.rotation));
    // Infinity造成無法判斷線跟圓交會,給一個基本長度
    const lineEndPointX =
      startPoint.x + distanceX === Infinity ? BubbleDragonNumber.CanvasWidth : startPoint.x + distanceX;
    // 先劃一條到邊界的線
    const supportLine = new Phaser.Geom.Line(
      startPoint.x,
      startPoint.y,
      lineEndPointX,
      // 角度為0,輔助線應為水平,線的結束點與射擊點同一水平線上
      this.cannonObject.angle === 0 ? BubbleDragonNumber.ShootedBasePositionY : borderY
    );
    // 宣告暫存圓跟距離
    let tmpCircle!: Phaser.Geom.Circle;
    let tmpDistance: number = Infinity;
    // 取得地圖泡泡的圓跟線最近交會的圓
    this.scene.mapBubblePool.mapBubbleCircle.forEach((circle: Phaser.Geom.Circle) => {
      if (Phaser.Geom.Intersects.LineToCircle(supportLine, circle)) {
        // 取得圓心與射擊點的距離
        const p2pDistance = Phaser.Math.Distance.Between(circle.x, circle.y, startPoint.x, startPoint.y);
        // 最短則紀錄
        if (p2pDistance < tmpDistance) {
          tmpCircle = circle;
          tmpDistance = p2pDistance;
        }
      }
    });

    // 碰到泡泡不繼續畫線
    if (tmpCircle) {
      // 依照第幾條線給予正負值
      const shootRadians = supportLineList.length % 2 === 0 ? this.cannonObject.rotation : -this.cannonObject.rotation;
      // X座標 = 泡泡中心 - 泡泡半徑
      supportLine.x2 = tmpCircle.x - BubbleDragonNumber.BubbleRadius;
      // 線上距圓中心最近的一點, 依公式( y = tanθ * x + b )取得Y
      supportLine.y2 = Math.tan(shootRadians) * supportLine.x2 + intercept;
      supportLineList.push(supportLine);
    }
    // 計算下一條反射線
    else {
      supportLineList.push(supportLine);
      // 下一條線的起始點
      const nextStartPoint = new Phaser.Math.Vector2(startPoint.x + distanceX, borderY);
      // 超出螢幕不繼續畫線
      if (nextStartPoint.x >= BubbleDragonNumber.CanvasWidth) {
        return;
      }
      // 依照第幾條線給予正負值
      const shootRadians = supportLineList.length % 2 === 0 ? this.cannonObject.rotation : -this.cannonObject.rotation;
      // 依公式( y = tanθ * x + b )取得二元一次方程式常數b
      const nextIntercept = nextStartPoint.y - nextStartPoint.x * Math.tan(shootRadians);
      // 依反彈次數替換邊界Y座標
      const nextBorderY = borderY === this.topBorder ? this.bottomBorder : this.topBorder;
      this.calculateSupportLine(nextStartPoint, nextIntercept, nextBorderY, supportLineList);
    }
  }

  /** 是否顯示瞄準鏡
   * @param isShow 顯示
   */
  public showScope(isShow: boolean): void {
    this.scope.setVisible(isShow);
  }

  /** 設置提示 */
  private setHint(): void {
    const hintBg = this.addImage(BubbleDragonString.HintBackground, this.hintBgPosition.x, this.hintBgPosition.y);
    this.hintGroup.add(hintBg);
    const hintIcon = this.addImage(BubbleDragonString.HintImage, this.hintIconPosition.x, this.hintIconPosition.y);
    this.hintGroup.add(hintIcon);
    const hintText = this.addText(
      '點押拖曳控制瞄準方向,放開發射氣泡',
      this.hintTextPosition.x,
      this.hintTextPosition.y
    );
    this.hintGroup.add(hintText);

    this.scene.tweens.add({
      targets: this.hintGroup.getChildren(),
      alpha: 0,
      duration: 2000,
      loop: -1,
      yoyo: true,
    });
  }
}
