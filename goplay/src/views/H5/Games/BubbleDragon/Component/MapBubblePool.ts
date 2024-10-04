import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import SoundPool from '../../Common/SoundPool';
import {
  BubbleDragonDepth,
  BubbleDragonNumber,
  BubbleDragonString,
  BubbleGenerateRule,
  BubbleItemFunction,
  BubblePositionAngle,
  BubblePositionDirection,
} from '../Data/BubbleDragonConfig';
import BubbleDragonGameScene from '../Scenes/BubbleDragonGameScene';
import BaseBubble from './BaseBubble';
import MapBubble from './MapBubble';
import ShootBubble from './ShootBubble';

export default class MapBubblePool {
  /** 小於該數量需生成 */
  private readonly minCountToGenerate: number = 10;
  /** 超過此行數不顯示提示 */
  private readonly hintRow: number = 5;
  /** 當前場景 */
  private scene: BubbleDragonGameScene;
  /** 單次消除泡泡數量 */
  private removeOnceBubbleCount: number = 0;
  /** 畫布 */
  private graphics: Phaser.GameObjects.Graphics;
  /** 泡泡生成規則 */
  private generateRule: BubbleGenerateRule = BubbleGenerateRule.BubbleGenerateOdd;
  /** 清除音效 */
  private cleanSound: SoundPool;
  /** 生成音效 */
  private growUpSound: SoundPool;

  /** 泡泡物件池 */
  private _group!: Phaser.Physics.Arcade.Group;
  public get group(): Phaser.Physics.Arcade.Group {
    return this._group;
  }

  /** 泡泡總消除量 */
  private _removeTotalBubbleCount: number = 0;
  public get removeTotalBubbleCount(): number {
    return this._removeTotalBubbleCount;
  }

  /** 泡泡邊界圓 */
  private _mapBubbleCircle: Phaser.Geom.Circle[] = [];
  public get mapBubbleCircle(): Phaser.Geom.Circle[] {
    return this._mapBubbleCircle;
  }

  /** 是否超過死亡線 */
  public get isOverDeadLine(): boolean {
    return (
      this.canProcessBubbleList.filter(
        (bubble) => this.getMapPosition(bubble.bubbleKey).x === BubbleDragonNumber.MapTotalRow
      ).length > 0
    );
  }

  /** 是否超過續命線 */
  public get isOverReviveLine(): boolean {
    return (
      this.canProcessBubbleList.filter(
        (bubble) => this.getMapPosition(bubble.bubbleKey).x === BubbleDragonNumber.MapTotalRow - 3
      ).length > 0
    );
  }

  /** 是否超過提示線 */
  public get isOverHintLine(): boolean {
    return (
      this.canProcessBubbleList.filter((bubble) => this.getMapPosition(bubble.bubbleKey).x === this.hintRow).length > 0
    );
  }

  /** 可處理的泡泡
   * @returns 泡泡陣列
   */
  private get canProcessBubbleList(): MapBubble[] {
    return this.aliveBubbleList.filter((bubble) => bubble.canProcess);
  }

  /** 活著的泡泡
   * @returns 泡泡陣列
   */
  private get aliveBubbleList(): MapBubble[] {
    return this._group.getMatching('active', true) as MapBubble[];
  }

  constructor(scene: BubbleDragonGameScene) {
    this.scene = scene;
    // 建立畫布
    this.graphics = this.scene.add.graphics({ lineStyle: { width: 4, color: 0xaaaaaa, alpha: 0 } });
    // 建立群組
    this._group = this.scene.physics.add.group({
      defaultKey: 'mapBubble',
      maxSize: 200,
      classType: MapBubble,
      runChildUpdate: true,
    });
    this._group.setDepth(BubbleDragonDepth.Game);
    // 建立音效
    this.cleanSound = new SoundPool(this.scene, BubbleDragonString.SoundCleanBubble);
    this.growUpSound = new SoundPool(this.scene, BubbleDragonString.SoundGrowUpBubble);
    // 建立關卡泡泡
    this.generateMap();
    // 畫泡泡邊界
    this.drawBubbleBorder();
  }

  /** 產生地圖 */
  private generateMap(): void {
    // 依設定大小產生關卡泡泡
    for (let row = 0; row < BubbleDragonNumber.MapMaxRow; row++) {
      // 生成第幾排泡泡
      this.generateMapColumn(row);
    }
  }

  /** 生成某一直排的泡泡
   * @param row 第幾排
   */
  private generateMapColumn(row: number): void {
    // 生成第一列泡泡，依row%2判斷奇偶數行，比對現在生成規則，如果一樣則少一顆
    for (
      let col = 0;
      col < BubbleDragonNumber.MapMaxColumn - (Math.abs(row % 2) === this.generateRule ? 1 : 0);
      col++
    ) {
      const bubblePos = this.getBubbleScreenPosition(row, col);
      const bubbleKey = `${row}_${col}`;
      const bubble = this._group.get(bubblePos.x, bubblePos.y) as BaseBubble;
      bubble.initialBaseBubble(bubblePos.x, bubblePos.y, bubbleKey);
    }
  }

  /** 處理泡泡撞牆
   * @param shootBubble 射擊泡泡
   */
  public async processBubbleWithWall(shootBubble: ShootBubble): Promise<void> {
    // 計算撞隱形牆的位置
    // 泡泡左上角的物理碰撞點Y-排列時的上方偏移量+半顆泡泡的高度
    const basePosition =
      shootBubble.y -
      BubbleDragonNumber.BubblePositionTopOffset -
      (this.generateRule === BubbleGenerateRule.BubbleGenerateEven ? BubbleDragonNumber.BubbleHeight / 2 : 0);
    // 位置除以泡泡高度計算第幾顆
    let col = Math.floor(basePosition / BubbleDragonNumber.BubbleHeight);
    // 取得餘數
    const offset = basePosition % BubbleDragonNumber.BubbleHeight;
    // 餘數如果大於半顆泡泡高度則往下推一個
    col = offset > BubbleDragonNumber.BubbleHeight / 2 ? col + 1 : col;

    await this.refreshMapBubble(shootBubble, new Phaser.Math.Vector2(0, col));
  }

  /** 處理射擊泡泡撞關卡泡泡
   * @param shootBubble 射擊泡泡
   * @param mapBubble 關卡泡泡
   */
  public async processBubbleWithBubble(shootBubble: ShootBubble, mapBubble: MapBubble): Promise<void> {
    // 計算向量
    const vector = new Phaser.Math.Vector2(
      shootBubble.body.x - mapBubble.body.x,
      shootBubble.body.y - mapBubble.body.y
    );

    // 計算角度
    let angle = (Math.acos(vector.normalize().x) * 180) / Math.PI;
    angle = shootBubble.body.y - mapBubble.body.y > 0 ? -angle : angle;

    // 抓到撞到的關卡泡泡位置
    const mapPosition = this.getMapPosition(mapBubble.bubbleKey);

    // 判斷撞擊角度設定泡泡位置
    if (angle < BubblePositionAngle.TopRight && angle >= BubblePositionAngle.Right) {
      mapPosition.y = mapPosition.x % 2 === this.generateRule ? mapPosition.y : mapPosition.y - 1;
      mapPosition.x -= 1;
      mapPosition.y = Math.max(mapPosition.y, 0);
    } else if (angle < BubblePositionAngle.TopLeft && angle >= BubblePositionAngle.TopRight) {
      mapPosition.y -= 1;
      mapPosition.y = Math.max(mapPosition.y, 0);
    } else if (angle < BubblePositionAngle.Left && angle >= BubblePositionAngle.TopLeft) {
      mapPosition.y = mapPosition.x % 2 === this.generateRule ? mapPosition.y : mapPosition.y - 1;
      mapPosition.x += 1;
      mapPosition.y = Math.max(mapPosition.y, 0);
    } else if (angle < BubblePositionAngle.BottomLeft && angle >= BubblePositionAngle.MinusLeft) {
      mapPosition.y = mapPosition.x % 2 === this.generateRule ? mapPosition.y + 1 : mapPosition.y;
      mapPosition.x += 1;
      mapPosition.y = this.getMapPositionYLimit(mapPosition);
    } else if (angle < BubblePositionAngle.BottomRight && angle >= BubblePositionAngle.BottomLeft) {
      mapPosition.y += 1;
      mapPosition.y = this.getMapPositionYLimit(mapPosition);
    } else if (angle < BubblePositionAngle.Right && angle >= BubblePositionAngle.BottomRight) {
      mapPosition.y = mapPosition.x % 2 === this.generateRule ? mapPosition.y + 1 : mapPosition.y;
      mapPosition.x -= 1;
      mapPosition.y = this.getMapPositionYLimit(mapPosition);
    }

    await this.refreshMapBubble(shootBubble, mapPosition);
  }

  /** 取得直列的極限值
   * @param mapPosition 關卡上位置
   * @returns 直列位置
   */
  private getMapPositionYLimit(mapPosition: Phaser.Math.Vector2): number {
    return Math.min(
      mapPosition.y,
      mapPosition.x % 2 === this.generateRule
        ? BubbleDragonNumber.MapMaxColumn - 2
        : BubbleDragonNumber.MapMaxColumn - 1
    );
  }

  /** 處理穿甲泡泡 */
  public async processPenetrateBubble() {
    await this.afterRemove();
  }

  /** 移除泡泡時要做的事 */
  public onRemoveBubble(): void {
    // 移除地圖代號陣列的值
    this._removeTotalBubbleCount += 1;
    this.removeOnceBubbleCount += 1;
  }

  /** 刷新關卡泡泡
   * @param shootBubble 射擊泡泡
   * @param mapPosition 射擊泡泡位置
   */
  private async refreshMapBubble(shootBubble: ShootBubble, mapPosition: Phaser.Math.Vector2): Promise<void> {
    // 塞進關卡泡泡池
    const copyBubble = this.insertBubble(shootBubble, mapPosition);

    // 道具泡泡
    if (shootBubble.bubbleItem) {
      switch (shootBubble.bubbleItem.itemData.itemFunction) {
        case BubbleItemFunction.Rainbow:
          this.processRainbowBubble(copyBubble);
          break;
        case BubbleItemFunction.BombLv1:
        case BubbleItemFunction.BombLv2:
          this.removeBombBubble(copyBubble, shootBubble.bubbleItem.itemData.itemLevel);
          break;
      }
    }
    // 一般泡泡
    else {
      // 消除同色泡泡
      this.removeSameColorBubble(copyBubble, copyBubble.bubbleColor);
    }

    await this.afterRemove();
  }

  /** 消除泡泡後做的事 */
  private async afterRemove(): Promise<void> {
    // 消除邊緣群組泡泡
    this.removeAloneBubble();

    // 確認生成規則
    if (this.checkGenerateRule()) {
      // 生成泡泡
      await this.autoGenerateBubble();
    }
    this.removeOnceBubbleCount = 0;
    // 畫泡泡邊界
    this.drawBubbleBorder();
  }

  /** 塞泡泡進關卡物件池
   * @param shootBubble 射擊泡泡
   * @param mapPosition 泡泡位置
   */
  private insertBubble(shootBubble: ShootBubble, mapPosition: Phaser.Math.Vector2): MapBubble {
    // 依位置取得標籤
    const bubbleKey = `${mapPosition.x}_${mapPosition.y}`;
    // 依地圖位置取得螢幕位置
    const position = this.getBubbleScreenPosition(mapPosition.x, mapPosition.y);
    // 建立新的泡泡
    const newBubble = this._group.get() as MapBubble;

    // 使用道具且道具不為彩色球
    if (shootBubble.bubbleItem && shootBubble.bubbleItem.itemData.itemFunction !== BubbleItemFunction.Rainbow) {
      // 初始化泡泡
      newBubble.initialItemBubble(position.x, position.y, bubbleKey, shootBubble.bubbleItem);
    } else {
      // 初始化泡泡
      newBubble.initialColorBubble(position.x, position.y, bubbleKey, shootBubble.bubbleColor);
    }

    return newBubble;
  }

  /** 處理彩色泡泡
   * @param shootBubble 射擊泡泡
   */
  private processRainbowBubble(shootBubble: MapBubble): void {
    // 建立各顏色消除群組列表
    const removeGroupList: Array<Set<MapBubble>> = [];
    for (const color of this.scene.bubbleTypePool) {
      // 建立消除群組
      const removeGroup: Set<MapBubble> = new Set();
      // 取得要消除的群組
      this.getRemoveGroup(shootBubble, color, removeGroup);
      // 加入列表
      removeGroupList.push(removeGroup);
    }
    for (const group of removeGroupList) {
      // 消除泡泡
      this.removeBubble(group);
    }
  }

  /** 消除同色泡泡
   *  @param shootBubble 射擊泡泡
   *  @param bubbleColor 泡泡顏色
   */
  private removeSameColorBubble(shootBubble: MapBubble, bubbleColor: number): void {
    // 建立消除群組
    const removeGroup: Set<MapBubble> = new Set();
    // 取得要消除的群組
    this.getRemoveGroup(shootBubble, bubbleColor, removeGroup);
    // 消除泡泡
    this.removeBubble(removeGroup);
  }

  /** 消除泡泡
   * @param removeGroup 要消除的泡泡群組
   */
  private removeBubble(removeGroup: Set<MapBubble>): void {
    // 群組大於設定顆數即消除
    if (removeGroup.size >= BubbleDragonNumber.BubbleRemoveCount) {
      // 播放音效
      this.cleanSound.play();
      // 消除泡泡
      removeGroup.forEach((bubble) => {
        bubble.death();
        this.onRemoveBubble();
      });
    }
  }

  /** 移除炸彈泡泡
   * @param shootBubble 射擊泡泡
   * @param bombRange 炸彈範圍
   */
  private removeBombBubble(shootBubble: MapBubble, bombRange: number): void {
    // 建立要消除的泡泡標籤群組
    const removeBubbleKeyGroup: Set<string> = new Set();
    const removeGroup: Set<MapBubble> = new Set();

    // 依照爆炸範圍取得消除群組
    this.getBombRemoveGroup(shootBubble.bubbleKey, removeBubbleKeyGroup, removeGroup, bombRange);

    // 播放音效
    this.cleanSound.play();

    // 消除泡泡
    removeGroup.forEach((bubble) => {
      bubble.death();
      this.onRemoveBubble();
    });
  }

  /** 取得炸彈炸毀的泡泡群組
   * @param centerBubbleKey 中心點泡泡
   * @param bubbleKeyGroup 泡泡標籤群組
   * @param removeGroup 要消除的泡泡
   * @param bombRange 泡泡爆炸範圍
   * @returns 泡泡標籤
   */
  private getBombRemoveGroup(
    centerBubbleKey: string,
    bubbleKeyGroup: Set<string>,
    removeGroup: Set<MapBubble>,
    bombRange: number
  ): void {
    // 沒加過才加泡泡
    if (bubbleKeyGroup.has(centerBubbleKey) === false) {
      // 加入中間泡泡
      bubbleKeyGroup.add(centerBubbleKey);
      // 依泡泡標籤取得泡泡
      const centerBubble = this.aliveBubbleList.find((bubble) => bubble.bubbleKey === centerBubbleKey);
      if (centerBubble != null) {
        removeGroup.add(centerBubble);
      }
    }

    // 到邊界
    if (bombRange <= 0) {
      return;
    }

    // 取得地圖位置
    const centerBubbleMapPosition = this.getMapPosition(centerBubbleKey);
    for (let i = BubblePositionDirection.Top; i < BubblePositionDirection.Max; i++) {
      const neighborBubbleKey = this.getNeighborBubbleKey(centerBubbleMapPosition, i);
      this.getBombRemoveGroup(neighborBubbleKey, bubbleKeyGroup, removeGroup, bombRange - 1);
    }
  }

  /** 消除邊緣群組泡泡 */
  private removeAloneBubble(): void {
    // 取得邊緣群組
    const aloneGroup = this.getAloneGroup();
    aloneGroup.forEach((bubble) => {
      // 播放掉落
      bubble.fall();
      this.onRemoveBubble();
    });
  }

  /** 取得移除群組
   * @param targetBubble 目標泡泡
   * @param targetBubbleColor 目標泡泡顏色
   * @param removeGroup 要消除的泡泡群組
   */
  private getRemoveGroup(targetBubble: MapBubble, targetBubbleColor: number, removeGroup: Set<MapBubble>): void {
    // 加進消除群組
    removeGroup.add(targetBubble);

    // 取得地圖位置
    const mapPosition = this.getMapPosition(targetBubble.bubbleKey);
    // 依照地圖位置取得鄰居並篩選不存在消除群組裡的泡泡
    let neighborList = this.getNeighborList(mapPosition).filter((bubble) => !removeGroup.has(bubble));
    // 再篩選相同顏色
    neighborList = neighborList.filter(
      (bubble) => bubble.bubbleColor === targetBubbleColor || bubble.bubbleColor === BubbleDragonNumber.RainbowBubble
    );
    // 再依鄰居繼續尋找
    for (const neighbor of neighborList) {
      this.getRemoveGroup(neighbor, targetBubbleColor, removeGroup);
    }
  }

  /** 取得鄰居泡泡列表
   * @param mapPosition 地圖位置
   * @returns 泡泡陣列
   */
  private getNeighborList(mapPosition: Phaser.Math.Vector2): MapBubble[] {
    const neighborList: MapBubble[] = [];

    // 依六方位取得鄰居泡泡標籤
    for (let i = BubblePositionDirection.Top; i < BubblePositionDirection.Max; i++) {
      const neighborBubbleKey = this.getNeighborBubbleKey(mapPosition, i);
      neighborList.push(...this.canProcessBubbleList.filter((bubble) => bubble.bubbleKey === neighborBubbleKey));
    }

    return neighborList;
  }

  /** 取得鄰居泡泡標籤
   * @param mapPosition 地圖位置
   * @param position 六方位
   * @returns 地圖位置
   */
  private getNeighborBubbleKey(mapPosition: Phaser.Math.Vector2, position: BubblePositionDirection): string {
    switch (position) {
      case BubblePositionDirection.Top:
        return `${mapPosition.x}_${mapPosition.y - 1}`;
      case BubblePositionDirection.TopLeft:
        return mapPosition.x % 2 === this.generateRule
          ? `${mapPosition.x + 1}_${mapPosition.y}`
          : `${mapPosition.x + 1}_${mapPosition.y - 1}`;
      case BubblePositionDirection.TopRight:
        return mapPosition.x % 2 === this.generateRule
          ? `${mapPosition.x - 1}_${mapPosition.y}`
          : `${mapPosition.x - 1}_${mapPosition.y - 1}`;
      case BubblePositionDirection.Bottom:
        return `${mapPosition.x}_${mapPosition.y + 1}`;
      case BubblePositionDirection.BottomLeft:
        return mapPosition.x % 2 === this.generateRule
          ? `${mapPosition.x + 1}_${mapPosition.y + 1}`
          : `${mapPosition.x + 1}_${mapPosition.y}`;
      case BubblePositionDirection.BottomRight:
        return mapPosition.x % 2 === this.generateRule
          ? `${mapPosition.x - 1}_${mapPosition.y + 1}`
          : `${mapPosition.x - 1}_${mapPosition.y}`;
      default:
        return '';
    }
  }

  /** 找到邊緣群組
   * @returns 邊緣集合
   */
  private getAloneGroup(): MapBubble[] {
    // 找有連接支撐點的群組
    const firstRowBubble = this.canProcessBubbleList.filter((bubble) => {
      return this.getMapPosition(bubble.bubbleKey).x === 0;
    });

    // 取得連結泡泡群組
    const linkGroup: Set<string> = new Set();
    for (const bubble of firstRowBubble) {
      this.getLinkGroup(bubble.bubbleKey, linkGroup);
    }

    // 取得落單的泡泡們
    return this.canProcessBubbleList.filter((bubble) => linkGroup.has(bubble.bubbleKey) === false);
  }

  /** 找關卡上連接的泡泡群組
   * @param bubbleKey 泡泡代號
   * @param linkGroup 連接群組
   */
  private getLinkGroup(bubbleKey: string, linkGroup: Set<string>): void {
    // 如果泡泡標籤為空則不尋找
    if (bubbleKey === '') {
      return;
    }
    // 把泡泡標籤加入連接群組
    linkGroup.add(bubbleKey);

    // 取得地圖位置
    const mapPosition = this.getMapPosition(bubbleKey);
    // 取得鄰居並篩選不存在連接群組中的泡泡標籤
    const neighborList = this.getNeighborList(mapPosition).filter((bubble) => !linkGroup.has(bubble.bubbleKey));
    // 再依鄰居繼續尋找
    for (const neighbor of neighborList) {
      this.getLinkGroup(neighbor.bubbleKey, linkGroup);
    }
  }

  /** 檢查是否要生成 */
  private checkGenerateRule(): boolean {
    // 場上剩餘泡泡<10個要生成
    if (this.canProcessBubbleList.length < this.minCountToGenerate) {
      return true;
    }

    // 依公式判斷是否要生成m = (n / 一排泡泡總數) * (random 1.0 ~ 2.0 )
    const num = Math.round(
      (this.removeOnceBubbleCount / BubbleDragonNumber.MapMaxColumn) * (1 + Phaser.Math.Between(0, 10) / 10)
    );

    return num > 0;
  }

  /** 自動生成泡泡 */
  private async autoGenerateBubble(): Promise<void> {
    // 生成第-1排
    this.generateMapColumn(-1);
    // 等到生成/表演完畢
    await AsyncHelper.pendingUntil(() => this.aliveBubbleList.every((bubble) => bubble.canProcess));
    // 先移動場上存在的泡泡
    for (const bubble of this.canProcessBubbleList) {
      bubble.move(
        new Phaser.Math.Vector2(
          bubble.x - BubbleDragonNumber.BubbleWidth + BubbleDragonNumber.BubblePositionRowOffset,
          bubble.y
        )
      );

      // 找到地圖位置
      const currentBubbleKey = this.getMapPosition(bubble.bubbleKey);
      // 更改泡泡標籤
      bubble.changeBubbleKey(`${currentBubbleKey.x + 1}_${currentBubbleKey.y}`);
    }

    // 播放音效
    this.growUpSound.play();

    // 等到移動完畢
    await AsyncHelper.pendingUntil(() => this.aliveBubbleList.every((bubble) => bubble.canProcess));

    // 變更生成規則
    this.generateRule =
      this.generateRule === BubbleGenerateRule.BubbleGenerateOdd
        ? BubbleGenerateRule.BubbleGenerateEven
        : BubbleGenerateRule.BubbleGenerateOdd;
  }

  /** 取得圖片在螢幕中位置
   *  @param row 地圖直排第幾排
   *  @param col 直排中第幾個
   *  @returns 螢幕中位置
   */
  private getBubbleScreenPosition(row: number, col: number): Phaser.Math.Vector2 {
    // 畫布寬度-(泡泡寬度-每行間偏移量)*(行+1)+整體偏移量
    const locationX: number =
      BubbleDragonNumber.CanvasWidth -
      (BubbleDragonNumber.BubbleWidth - BubbleDragonNumber.BubblePositionRowOffset) * (row + 1) +
      BubbleDragonNumber.BubbleWidth / 2;

    // 泡泡高度*第幾列+上方偏移量+(依row%2判斷奇偶數行，比對現在生成規則，如果一樣則多推半顆高度)
    const locationY: number =
      BubbleDragonNumber.BubbleHeight * col +
      BubbleDragonNumber.BubblePositionTopOffset +
      (Math.abs(row % 2) === this.generateRule ? BubbleDragonNumber.BubbleHeight / 2 : 0);

    return new Phaser.Math.Vector2(locationX, locationY);
  }

  /** 取得在地圖中第幾排第幾個
   *  @param bubbleKey 泡泡代號
   *  @returns 地圖位置
   */
  private getMapPosition(bubbleKey: string): Phaser.Math.Vector2 {
    const splitPosition = bubbleKey.indexOf('_');
    const row: number = parseInt(bubbleKey.slice(0, splitPosition + 1), 10);
    const col: number = parseInt(bubbleKey.slice(splitPosition + 1, bubbleKey.length), 10);

    return new Phaser.Math.Vector2(row, col);
  }

  // 畫泡泡邊界
  private drawBubbleBorder(): void {
    // 清除畫布
    this.graphics.clear();
    // 清除陣列
    this._mapBubbleCircle = [];
    // 抓到目前全部活著的泡泡
    for (const aliveBubble of this.aliveBubbleList) {
      // 建立圓圈
      const circle = new Phaser.Geom.Circle(aliveBubble.x, aliveBubble.y, BubbleDragonNumber.BubbleCircleRadius);
      // 存進陣列
      this._mapBubbleCircle.push(circle);
      // 畫圓
      this.graphics.strokeCircleShape(circle);
    }
  }
}
