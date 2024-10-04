import {
  BrickBreakerBossData,
  BrickBreakerEffectKey,
  BrickBreakerGrid,
  BrickBreakerGridType,
} from '@/views/H5/Net/NetProtocol/BrickBreakerStructure';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { BrickBreakerGridImgType, BrickBreakerNumber, BrickBreakerString } from '../../Data/BrickBreakerConfig';
import BrickBreakerGameScene from '../../Scenes/BrickBreakerGameScene';
import BrickBreakerBossComponent from './BrickBreakerBossComponent';
import GridComponent from './GridComponent';

export default class GridManager extends Object2D {
  /** 指定為BrickBreakerGameScene使用 */
  public declare scene: BrickBreakerGameScene;

  /** 路徑component array */
  private gridComponents: GridComponent[] = new Array<GridComponent>();

  /** 魔王GridComponent */
  private bossComponent!: BrickBreakerBossComponent;

  /** 格子highlight圖片 */
  private highlightImgs: Phaser.GameObjects.Image[] = [];
  /** 格子highlight圖片tween */
  private highlightImgTweens: Phaser.Tweens.Tween[] = [];

  /** 地圖高(格數) */
  private _mapHeight: number = 0;
  /** 地圖高(像素) */
  public get mapHeight(): number {
    return this._mapHeight;
  }
  /** 地圖寬(格數) */
  private _mapWidth: number = 0;
  /** 地圖寬(像素) */
  public get mapWidth(): number {
    return this._mapWidth;
  }

  constructor(scene: BrickBreakerGameScene) {
    super(scene);
  }

  /** init
   * @param grids 所有格子資料array
   * @param mapHeight 地圖高(格)
   * @param mapWidth 地圖寬(格)
   * @param bossData 魔王資料
   */
  public async init(
    grids: BrickBreakerGrid[],
    mapHeight: number,
    mapWidth: number,
    bossData: BrickBreakerBossData
  ): Promise<void> {
    // 紀錄地圖寬高
    this._mapHeight = mapHeight;
    this._mapWidth = mapWidth;
    // 尋找魔王格子
    const bossGrid = grids.find((grid) => grid.gridType === BrickBreakerGridType.Boss);
    if (bossGrid === undefined) {
      console.error('GridManager.init() error, bossGrid undefined!');
      return;
    }
    // 生成bossComponent
    const bossGridPosition = this.getGridPositionByGridId(bossGrid.gridId);
    this.bossComponent = new BrickBreakerBossComponent(this.scene, bossGridPosition.x, bossGridPosition.y);
    this.bossComponent.init(bossData);
    // bossComponent加進playerLayer
    this.scene.playerManager.addObjectToPlayerLayer(this.bossComponent, bossGridPosition.x, bossGridPosition.y);

    // 生成gridComponent, 設定squireMap
    for (const grid of grids) {
      // 計算grid位置
      const gridPosition = this.getGridPositionByGridId(grid.gridId);
      // 生成gridComponent
      const gridComponent = new GridComponent(this.scene, gridPosition.x, gridPosition.y);
      // 將gridComponent加入GridManager底下, 確保render順序
      this.addAt(gridComponent);
      gridComponent.init(grid);
      this.gridComponents.push(gridComponent);
    }

    // 地圖四周加上顯示用假格子
    this.setRoundGridImgs();

    // 生成highlight圖片
    for (let i = 0; i < 4; ++i) {
      const highlightImg = this.addImage(BrickBreakerString.GridHighlight, 0, 0);
      highlightImg.setAlpha(0);
      // 雖然由gridManager管理, 但顯示在effectLayer
      this.scene.effectLayer.add(highlightImg);
      this.highlightImgs.push(highlightImg);
      const highlightImgTween = this.scene.add.tween({
        targets: highlightImg,
        alpha: {
          from: 0.2,
          to: 1,
        },
        yoyo: true,
        repeat: -1,
        duration: 1500,
      });
      highlightImgTween.stop();
      this.highlightImgTweens.push(highlightImgTween);
    }
  }

  /** 根據行列計算對應grid位置
   * @param col
   * @param row
   */
  private getGridPosition(col: number, row: number): Phaser.Math.Vector2 {
    const x = (col + 0.5) * BrickBreakerNumber.GridWidth;
    const y = (row + 0.5) * BrickBreakerNumber.GridHeight;
    return new Phaser.Math.Vector2(x, y);
  }

  /** 根據gridId計算對應grid位置
   * @param gridId
   */
  private getGridPositionByGridId(gridId: number): Phaser.Math.Vector2 {
    const row = Math.floor(gridId / this._mapWidth);
    const col = gridId % this._mapWidth;
    return this.getGridPosition(col, row);
  }

  /** 地圖四周加上顯示用假格子 */
  private setRoundGridImgs(): void {
    // 四角
    this.addRoundGridImg(BrickBreakerGridImgType.FrameTopLeft, -1, -1);
    this.addRoundGridImg(BrickBreakerGridImgType.FrameTopRight, this._mapWidth, -1);
    this.addRoundGridImg(BrickBreakerGridImgType.FrameBottomLeft, -1, this._mapHeight);
    this.addRoundGridImg(BrickBreakerGridImgType.FrameBottomRight, this._mapWidth, this._mapHeight);
    // 上下
    for (let i = 0; i < this._mapWidth; ++i) {
      this.addRoundGridImg(BrickBreakerGridImgType.FrameTop, i, -1);
      this.addRoundGridImg(BrickBreakerGridImgType.FrameBottom, i, this._mapHeight);
    }
    // 左右
    for (let i = 0; i < this._mapHeight; ++i) {
      this.addRoundGridImg(BrickBreakerGridImgType.FrameLeft, -1, i);
      this.addRoundGridImg(BrickBreakerGridImgType.FrameRight, this._mapWidth, i);
    }
  }

  /** 增加一個邊界格子圖片
   * @param gridImgKey GridImgType enum
   * @param col 地圖col
   * @param row 地圖row
   */
  private addRoundGridImg(gridImgKey: BrickBreakerGridImgType, col: number, row: number): void {
    const gridPos = this.getGridPosition(col, row);
    this.addImage(BrickBreakerString.GridImgKey + gridImgKey, gridPos.x, gridPos.y);
  }

  /** 收到土地資訊更新
   * @param grid
   */
  public onGridUpdate(grid: BrickBreakerGrid): void {
    const gridComponent = this.gridComponents[grid.gridId];
    if (gridComponent === undefined) {
      console.error('GridManager.onGridUpdate() error, ' + 'gridComponent undefined, squireId = ' + grid.gridId);
      return;
    }
    // 更新gridComponent
    gridComponent.updateGrid(grid);
  }

  /** 取得路徑節點座標
   * @param gridId 路徑編號
   */
  public getGridComponent(gridId: number): GridComponent {
    return this.gridComponents[gridId];
  }

  /** 取得魔王component */
  public getBossComponent(): BrickBreakerBossComponent {
    return this.bossComponent;
  }

  /** 取得魔王格子位置 */
  public getBossPosition(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.bossComponent.x, this.bossComponent.y);
  }

  /** 更新魔王資訊
   * @param bossData 魔王資訊
   */
  public onBossUpdate(bossData: BrickBreakerBossData): void {
    this.bossComponent.update(bossData);
  }

  /** 表演魔王死亡 */
  public async playBossDead(): Promise<void> {
    return this.bossComponent.playBossDead();
  }

  /** 目標前進格子highlight, 並回傳該gridComponent
   * @param targetGridId
   */
  public onPlayerMove(targetGridId: number): GridComponent {
    // 停止當前所有highlightImgs
    this.stopHighlightImgs();
    // 目標格子恆亮
    this.highlightImgs[0].setAlpha(1);
    // 移動highlight圖片到指定位置
    return this.setHighlightImgPos(targetGridId, this.highlightImgs[0]);
  }

  /** 設定要highlight的格子
   * @param gridIds highlight格子Id array
   */
  public setHighlightGrids(gridIds: number[]): void {
    // 停止當前所有highlightImgs
    this.stopHighlightImgs();
    // 設定要highlight的格子
    for (let i = 0; i < gridIds.length; ++i) {
      // 移動highlight圖片到指定位置
      this.setHighlightImgPos(gridIds[i], this.highlightImgs[i]);
      // 表演淡入淡出
      this.highlightImgTweens[i].play();
    }
  }

  /** 停止當前所有highlightImgs */
  private stopHighlightImgs(): void {
    for (let i = 0; i < this.highlightImgs.length; ++i) {
      this.highlightImgs[i].alpha = 0;
      this.highlightImgTweens[i].stop();
    }
  }

  /** 移動highlight圖片到指定位置
   * @param gridId
   * @param highlightImg
   */
  private setHighlightImgPos(gridId: number, highlightImg: Phaser.GameObjects.Image): GridComponent {
    // 找出對應格子
    const gridComponent = this.getGridComponent(gridId);
    // 設定highlightImg位置
    highlightImg.setPosition(gridComponent.x, gridComponent.y);
    return gridComponent;
  }

  /** 使中心格子的九宮格周遭表演特效(包含中心格子)
   * @param centerGridId 中心格子Id
   * @param effectKey 表演特效Key
   */
  public async playEffectAroundGrid(centerGridId: number, effectKey: BrickBreakerEffectKey): Promise<void> {
    // 從Id轉換成GridComponent
    const centerGrid = this.getGridComponent(centerGridId);

    // 獲取3*3的九宮格位置
    const aroundGridPositions: Phaser.Math.Vector2[] = [];
    for (
      let y = centerGrid.y - BrickBreakerNumber.GridHeight;
      y <= centerGrid.y + BrickBreakerNumber.GridHeight;
      y += BrickBreakerNumber.GridHeight
    ) {
      for (
        let x = centerGrid.x - BrickBreakerNumber.GridWidth;
        x <= centerGrid.x + BrickBreakerNumber.GridWidth;
        x += BrickBreakerNumber.GridWidth
      ) {
        aroundGridPositions.push(new Phaser.Math.Vector2(x, y));
      }
    }

    // 在每一個格子上播放特效
    aroundGridPositions.forEach((position: Phaser.Math.Vector2) => {
      this.scene.effectLayer.playEffectTween(effectKey, position.x, position.y);
    });
  }
}
