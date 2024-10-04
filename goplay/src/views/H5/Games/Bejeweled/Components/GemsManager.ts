import { BejeweledNumber, BejeweledString } from '../Data/BejeweledConfig';
import { BejeweledHelper } from '../Helper/BejeweledHelper';
import BejeweledGameScene from '../Scenes/BejeweledGameScene';

export interface GameGem {
  /** 當前顏色 */
  gemColor: number;
  /** 圖片 */
  gemSprite: Phaser.GameObjects.Sprite;
  /** 是否已被消除 */
  isEmpty: boolean;
}

/** 炸彈類型 */
export enum GemBombType {
  None = 0,
  /** 基礎炸彈 */
  Basical,
  /** 彩色炸彈 */
  Colorful,
  /** 怪獸炸彈 */
  Monster,
  /** 飛彈 */
  Missile,
  /** 魔法爐 */
  Magic,
}

export class GemsManager {
  /** 寶石列表 */
  private gameGemMap: GameGem[][] = [];
  /** 移除寶石列表 */
  private removeMap: boolean[][] = [];
  /** 寶石Sprite array(暫存用) */
  private poolArray: Phaser.GameObjects.Sprite[] = [];
  /** 這次使用的寶石ICON */
  private gemPool: number[] = [];

  /** 上次已選取的寶石 */
  private lastSelectedGem?: GameGem;
  /** 使用者是否可選取寶石, 若在消珠表演期間則為false */
  public isUserOperable: boolean = true;
  /** 是否可移動寶石 */
  private isDragging: boolean = false;
  /** 移動寶石數量 */
  private swappingGemCount: number = 0;
  /** 是否要計算分數 */
  private isCalculatePoint: boolean = true;

  /** 當前場景 */
  private scene: BejeweledGameScene;

  constructor(scene: BejeweledGameScene) {
    this.scene = scene;
  }

  /** 產生寶石群 */
  public drawField(): void {
    // 隨機選取寶石Icon
    const gemTotalPool: number[] = [];
    for (let i = 0; i < BejeweledNumber.GemPoolSize; i++) {
      gemTotalPool.push(i);
    }
    this.gemPool = Phaser.Math.RND.shuffle(gemTotalPool);
    this.gemPool.splice(BejeweledNumber.GemColors);

    this.gameGemMap = [];
    this.poolArray = [];

    for (let i = 0; i < BejeweledNumber.FieldSizeHeight; i++) {
      this.gameGemMap[i] = [];
      for (let j = 0; j < BejeweledNumber.FieldSizeWidth; j++) {
        // 生成寶石圖案
        const gemPos = this.getGemSpritePosition(i, j);
        const gemSprite = this.scene.add.sprite(gemPos.x, gemPos.y, BejeweledString.Gems);
        // 骰顏色
        do {
          const colorIndex = this.getRandomColor();
          gemSprite.setFrame(colorIndex);
          this.gameGemMap[i][j] = {
            gemColor: colorIndex,
            gemSprite,
            isEmpty: false,
          };
        } while (this.isMatch(i, j));
      }
    }
  }

  /** 取得隨機的寶石顏色 */
  private getRandomColor(): number {
    const randomColor = Phaser.Math.Between(0, this.gemPool.length - 1);
    return this.gemPool[randomColor];
  }
  //#endregion

  //#region 外部呼叫

  /** 點擊寶石
   * @param row 寶石座標row
   * @param col 寶石座標column
   */
  public onGemSelect(row: number, col: number): void {
    // 防呆, 表演期間使用者不可操作
    if (this.isUserOperable === false) {
      return;
    }

    this.isDragging = true;
    const currentSelectGem = this.gemAt(row, col);
    if (currentSelectGem === undefined) {
      this.isDragging = false;
      console.error(`onGemSelect() error, gameGem not found! position: (${row},${col})`);
      return;
    }

    // 若有選取炸彈, 則炸彈爆炸
    if (this.scene.currentItem != null) {
      this.isUserOperable = false;
      this.isDragging = false;
      this.lastSelectedGem = undefined;
      this.useGemBomb(this.scene.currentItem.itemData.itemFunction, col, row, currentSelectGem);
      this.scene.useItem(this.scene.currentItem);
    }
    // 點第一顆寶石
    else if (this.lastSelectedGem === undefined) {
      this.gemSelectStyle(currentSelectGem);
    }
    // 重複點擊第一顆寶石, 視作取消點擊
    else if (BejeweledHelper.isSameGem(currentSelectGem, this.lastSelectedGem)) {
      this.lastSelectedGem.gemSprite.setScale(1);
      this.lastSelectedGem = undefined;
    }
    // 與第一顆相鄰, 兩顆交換
    else if (BejeweledHelper.areNext(currentSelectGem, this.lastSelectedGem)) {
      this.lastSelectedGem.gemSprite.setScale(1);
      this.swapGems(this.lastSelectedGem, currentSelectGem, true);
    }
    // 與第一顆不相鄰, 之前的第一顆取消, 現在點擊的寶石視作下次的第一顆
    else {
      this.lastSelectedGem.gemSprite.setScale(1);
      this.gemSelectStyle(currentSelectGem);
    }
  }

  /** 滑鼠進入某寶石的觸控區域
   * @param row 寶石座標row
   * @param col 寶石座標column
   */
  public onPointOver(row: number, col: number): void {
    // 找出被指到的寶石
    const currentGem = this.gemAt(row, col);
    if (currentGem === undefined) {
      console.error(`GemManager.onPointOver() error, gameGem not found! position: (${row},${col})`);
      return;
    }

    // 寶石scale放大
    currentGem.gemSprite.setScale(1.1);

    // 若在拖動中且已經有選過第一顆寶石, 則兩個寶石互換
    if (this.isDragging && this.lastSelectedGem !== undefined) {
      if (BejeweledHelper.isSameGem(this.lastSelectedGem, currentGem) === false) {
        this.lastSelectedGem.gemSprite.setScale(1);
        this.swapGems(this.lastSelectedGem, currentGem, true);
      }
    }
  }

  /** 滑鼠離開某寶石的觸控區域
   * @param row 寶石座標row
   * @param col 寶石座標column
   */
  public onPointOut(row: number, col: number): void {
    // 找出被指到的寶石
    const currentGem = this.gemAt(row, col);
    if (currentGem === undefined) {
      console.error(`GemManager.onPointOut() error, gameGem not found! position: (${row},${col})`);
      return;
    }

    // 寶石scale還原
    currentGem.gemSprite.setScale(1);
  }

  /** 滑鼠結束滑動 */
  public onStopSwipe(): void {
    this.isDragging = false;
  }

  public onGameFinish(): void {
    // 不能選取寶石 & 炸彈
    this.isUserOperable = false;
  }

  /** 根據row & column計算寶石座標 */
  private getGemSpritePosition(row: number, col: number): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      BejeweledNumber.GemSize * col + BejeweledNumber.GemSize / 2 + BejeweledNumber.MarginLeft,
      BejeweledNumber.GemSize * row + BejeweledNumber.GemSize / 2 + BejeweledNumber.MarginTop
    );
  }

  /** 滑動寶石
   * @param gem1 寶石1
   * @param gem2 寶石2
   * @param isSwapBack 交換回去
   */
  private swapGems(gem1: GameGem, gem2: GameGem, isSwapBack: boolean): void {
    this.swappingGemCount = 2;
    this.isUserOperable = false;
    this.isDragging = false;
    // 資料顏色互換
    const bufferColor = gem1.gemColor;
    const bufferSprite = gem1.gemSprite;
    gem1.gemColor = gem2.gemColor;
    gem1.gemSprite = gem2.gemSprite;
    gem2.gemColor = bufferColor;
    gem2.gemSprite = bufferSprite;
    // 位置互換tween
    this.tweenGem(gem1, gem2, isSwapBack);
    this.tweenGem(gem2, gem1, isSwapBack);
  }

  /** 交換寶石
   * @param gem1 寶石1
   * @param gem2 寶石2
   * @param isSwapBack 交換回去
   */
  private async tweenGem(gem1: GameGem, gem2: GameGem, isSwapBack: boolean): Promise<void> {
    // gem1 移至 gem2的位置
    this.scene.tweens.add({
      targets: gem1.gemSprite,
      x: gem2.gemSprite.x,
      y: gem2.gemSprite.y,
      duration: BejeweledNumber.SwapSpeed,
      callbackScope: this,
      onComplete: () => {
        // 寶石移動完畢, 移動中寶石計數-1
        this.swappingGemCount--;
        // 若兩個寶石都移動完畢
        if (this.swappingGemCount === 0) {
          // 成功消掉寶石, 執行消寶石表演
          if (this.matchInBoard()) {
            this.handleMatches();
          } else if (isSwapBack) {
            this.swapGems(gem2, gem1, false);
          } else {
            this.isUserOperable = true;
            this.lastSelectedGem = undefined;
          }
        }
      },
    });
  }

  /** 檢查所有寶石 */
  private matchInBoard(): boolean {
    for (let i = 0; i < BejeweledNumber.FieldSizeHeight; i++) {
      for (let j = 0; j < BejeweledNumber.FieldSizeWidth; j++) {
        if (this.isMatch(i, j)) {
          return true;
        }
      }
    }
    return false;
  }

  /** 檢查上下左右三個不重覆
   * @param row 列
   * @param col 欄
   */
  private isMatch(row: number, col: number): boolean {
    // TODO isHorizontalMatch & isVerticalMatch 考慮整合進isMatch
    return this.isHorizontalMatch(row, col) || this.isVerticalMatch(row, col);
  }
  private isHorizontalMatch(row: number, col: number): boolean {
    // 防呆
    const targetGem = this.gemAt(row, col);
    if (targetGem === undefined) {
      console.error('isHorizontalMatch() error, targetGem is undefined!');
      return false;
    }
    // 比較同色
    const targetGemColor = targetGem.gemColor;
    return (
      targetGemColor === this.gemAt(row, col - 1)?.gemColor && targetGemColor === this.gemAt(row, col - 2)?.gemColor
    );
  }
  private isVerticalMatch(row: number, col: number): boolean {
    // 防呆
    const targetGem = this.gemAt(row, col);
    if (targetGem === undefined) {
      console.error('isVerticalMatch() error, targetGem is undefined!');
      return false;
    }
    // 比較同色
    const targetGemColor = targetGem.gemColor;
    return (
      targetGemColor === this.gemAt(row - 1, col)?.gemColor && targetGemColor === this.gemAt(row - 2, col)?.gemColor
    );
  }

  /** 處理符合三消規定寶石 */
  private handleMatches(): void {
    this.resetRemoveMap(false);
    this.markMatchesRow();
    this.markMatchesCol();
    this.destroyGems();
  }

  /** removeMap預設空陣列
   * @param isRemove
   */
  private resetRemoveMap(isRemove: boolean): void {
    this.removeMap = [];
    for (let i = 0; i < BejeweledNumber.FieldSizeHeight; i++) {
      this.removeMap[i] = [];
      for (let j = 0; j < BejeweledNumber.FieldSizeWidth; j++) {
        this.removeMap[i].push(isRemove);
      }
    }
  }

  /** 標記符合三消規定寶石(列) */
  private markMatchesRow(): void {
    for (let i = 0; i < BejeweledNumber.FieldSizeHeight; i++) {
      let colorStreak = 1;
      let currentColor = -1;
      let startStreak = 0;
      let colorToWatch = 0;
      for (let j = 0; j < BejeweledNumber.FieldSizeWidth; j++) {
        // 找出待檢查的寶石
        const targetGem = this.gemAt(i, j);
        if (targetGem === undefined) {
          console.error(`markMatchesRow() error gem not found! ${i}, ${j}`);
          continue;
        }
        // 待檢查寶石顏色
        colorToWatch = targetGem.gemColor;
        // 檢查是否同色
        if (colorToWatch === currentColor) {
          // 連續同色數++
          colorStreak++;
        }
        // 不同色或到達邊界
        if (colorToWatch !== currentColor || j === BejeweledNumber.FieldSizeWidth - 1) {
          // 檢查連續同色數是否超過3
          if (colorStreak >= 3) {
            // 符合三消者標記為"待移除之寶石"
            for (let k = 0; k < colorStreak; k++) {
              this.removeMap[i][startStreak + k] = true;
            }
          }
          startStreak = j;
          colorStreak = 1;
          currentColor = colorToWatch;
        }
      }
    }
  }

  /** 標記符合三消規定寶石(欄) */
  private markMatchesCol(): void {
    for (let i = 0; i < BejeweledNumber.FieldSizeWidth; i++) {
      let colorStreak = 1;
      let currentColor = -1;
      let startStreak = 0;
      let colorToWatch = 0;
      for (let j = 0; j < BejeweledNumber.FieldSizeHeight; j++) {
        // 找出待檢查的寶石
        const targetGem = this.gemAt(j, i);
        if (targetGem === undefined) {
          console.error(`markMatchesCol() error gem not found! ${i}, ${j}`);
          continue;
        }
        // 待檢查寶石顏色
        colorToWatch = targetGem.gemColor;
        // 檢查是否同色
        if (colorToWatch === currentColor) {
          // 連續同色數++
          colorStreak++;
        }
        // 不同色或到達邊界
        if (colorToWatch !== currentColor || j === BejeweledNumber.FieldSizeHeight - 1) {
          // 檢查連續同色數是否超過3
          if (colorStreak >= 3) {
            // 符合三消者標記為"待移除之寶石"
            for (let k = 0; k < colorStreak; k++) {
              this.removeMap[startStreak + k][i] = true;
            }
          }
          startStreak = j;
          colorStreak = 1;
          currentColor = colorToWatch;
        }
      }
    }
  }

  /** 消除符合三消規定寶石 */
  private destroyGems(): void {
    // 播放音效
    this.scene.playDestroyGemsSound();

    // 播放魔王受傷特效
    this.scene.infoDialog.playAttackBossAnimation();

    // TODO destroyCount的替代方案?
    let destroyCount = 0;
    for (let i = 0; i < BejeweledNumber.FieldSizeHeight; i++) {
      for (let j = 0; j < BejeweledNumber.FieldSizeWidth; j++) {
        if (this.removeMap[i][j] === true) {
          // 消除目標
          const destroyTargetGem = this.gemAt(i, j);
          if (destroyTargetGem === undefined) {
            console.error(`destroyGems() error, destroyTargetGem not found! position = (${i},${j})`);
            continue;
          }
          // 寶石標記為已清除
          destroyTargetGem.isEmpty = true;
          // 消除寶石數++
          destroyCount++;
          // 寶石消除動畫
          this.scene.tweens.add({
            targets: destroyTargetGem.gemSprite,
            alpha: 0.5,
            duration: BejeweledNumber.DestroySpeed,
            callbackScope: this,
            onComplete: () => {
              // 寶石消除完畢, 消除寶石數--
              destroyCount--;

              // 取得寶石圖片
              const gemItem = destroyTargetGem.gemSprite;
              // 爆炸特效
              if (this.scene.currentItem != null) {
                // 炸彈消除特效
                this.scene.gemsDialog.gemBombParticleEffect(gemItem.x, gemItem.y);
              } else {
                // 一般消除特效
                this.scene.gemsDialog.gemParticleEffect(gemItem.x, gemItem.y);
              }
              // 圖片回收再利用
              this.poolArray.push(gemItem);

              // 通知GameScene有寶石被摧毀
              if (this.isCalculatePoint) {
                this.scene.onGemDestroy();
              }

              // 若所有寶石消除完畢
              if (destroyCount === 0) {
                // 現有寶石往下掉
                this.makeGemsFall();
                // 掉落新寶石並檢查是否符合三消規定
                this.replenishFields();
              }
            },
          });
        }
      }
    }
  }

  /** 現有寶石往下掉 */
  private makeGemsFall(): void {
    for (let i = BejeweledNumber.FieldSizeHeight - 2; i >= 0; i--) {
      for (let j = 0; j < BejeweledNumber.FieldSizeWidth; j++) {
        // 取得targetGem
        const targetGem = this.gemAt(i, j);
        if (targetGem === undefined) {
          console.error(`makeGemsFall() error, targetGem not found! position = (${i},${j})`);
          continue;
        }
        // targetGem不為空洞
        if (targetGem.isEmpty === false) {
          // 取得targetGem往下到底部的總空洞數
          const fallTiles = this.holesBelow(i, j);
          if (fallTiles > 0) {
            // targetGem往下掉落x格動畫
            this.scene.tweens.add({
              targets: targetGem.gemSprite,
              y: targetGem.gemSprite.y + fallTiles * BejeweledNumber.GemSize,
              duration: BejeweledNumber.FallSpeed * fallTiles,
            });
            // 掉落目標位置, 指定寶石顏色, 並標記為not empty
            this.gameGemMap[i + fallTiles][j] = {
              gemSprite: targetGem.gemSprite,
              gemColor: targetGem.gemColor,
              isEmpty: false,
            };
            // 掉落前的寶石位置標記為empty, 等待生成的新寶石掉落
            targetGem.isEmpty = true;
          }
        }
      }
    }
  }

  /** 找出targetGem下方共有幾格空洞
   * @param row 列
   * @param col 欄
   */
  private holesBelow(row: number, col: number): number {
    let result = 0;
    for (let i = row + 1; i < BejeweledNumber.FieldSizeHeight; i++) {
      if (this.gameGemMap[i][col].isEmpty) {
        result++;
      }
    }
    return result;
  }

  /** 計算某一欄的寶石空位總數量
   * @param col 欄
   */
  private holesInCol(col: number): number {
    let result = 0;
    for (let i = 0; i < BejeweledNumber.FieldSizeHeight; i++) {
      if (this.gameGemMap[i][col].isEmpty) {
        result++;
      }
    }
    return result;
  }

  /** 掉落新寶石並檢查是否符合三消規定 */
  private replenishFields(): void {
    // 新生成的補充寶石個數
    let replenished = 0;
    for (let col = 0; col < BejeweledNumber.FieldSizeWidth; col++) {
      // 本col(直排)總共有幾個空洞
      const emptySpots = this.holesInCol(col);
      if (emptySpots > 0) {
        for (let i = 0; i < emptySpots; i++) {
          // 取得對應空格的gameGem
          const emptyGem = this.gemAt(i, col);
          if (emptyGem === undefined) {
            console.error(`GemManager.replenishField() error, emptyGem not found! position = (${i},${col})`);
            continue;
          }
          replenished++;
          // 取得被消除的寶石圖片再利用
          const sprite = this.poolArray.pop();
          if (sprite) {
            emptyGem.gemSprite = sprite;
          }
          // 由於是取用被消除的寶石圖片, 記得要把透明度調回來
          emptyGem.gemSprite.alpha = 1;
          // 骰新的顏色
          const randomColor = this.getRandomColor();
          emptyGem.gemColor = randomColor;
          emptyGem.gemSprite.setFrame(randomColor);
          // 設定寶石位置, 放在寶石地圖上方(emptySpots - i)格, 準備做掉落表演
          const emptyGemPos = this.getGemSpritePosition(-(emptySpots - i), col);
          emptyGem.gemSprite.setPosition(emptyGemPos.x, emptyGemPos.y);
          // 本gameGem不再是空格, isEmpty = false
          emptyGem.isEmpty = false;
          // 新寶石掉落表演
          this.scene.tweens.add({
            targets: emptyGem.gemSprite,
            y: BejeweledNumber.GemSize * i + BejeweledNumber.GemSize / 2 + BejeweledNumber.MarginTop,
            duration: BejeweledNumber.FallSpeed * emptySpots,
            callbackScope: this,
            onComplete: () => {
              replenished--;
              // 若所有新生成的寶石掉落完畢
              if (replenished === 0) {
                // 若新掉下來的又符合三消條件, 則回到handleMatches()繼續消珠表演
                if (this.matchInBoard()) {
                  this.scene.time.addEvent({
                    delay: 250,
                    callback: this.handleMatches,
                    callbackScope: this,
                  });
                }
                // 三消表演完畢, 回復玩家操作
                else {
                  // TODO 回復玩家操作另外做成一個function
                  this.isUserOperable = true;
                  this.lastSelectedGem = undefined;
                  this.isCalculatePoint = true;
                  // 檢查如果版面已經不能消除則摧毀整版
                  if (this.isCanDestroyGem() === false) {
                    this.isCalculatePoint = false;
                    this.resetRemoveMap(true);
                    this.destroyGems();
                  }
                }
              }
            },
          });
        }
      }
    }
  }

  /** 判斷寶石炸彈類型
   * @param gemsBombType 炸彈類型
   * @param col 欄
   * @param row 列
   */
  private useGemBomb(gemsBombType: GemBombType, col: number, row: number, currentSelectGem: GameGem): void {
    // TODO 避免直接取得dialog
    // 通知gemsDialog在指定位置顯示炸彈
    this.scene.gemsDialog.createGemsBomb(gemsBombType, this.gameGemMap[row][col]);

    this.resetRemoveMap(false);
    switch (gemsBombType) {
      case GemBombType.Basical:
        // 基礎炸彈：消➕號橫直三
        this.setBasicalBombRemoveMap(col, row);
        break;
      case GemBombType.Colorful:
        // 彩色炸彈：消米字所有方塊
        this.setColorfulBombRemoveMap(col, row);
        break;
      case GemBombType.Monster:
        // 怪獸炸彈：消米字周圍兩顆
        this.setMonsterBombRemoveMap(col, row);
        break;
      case GemBombType.Missile:
        // 飛彈：消隨機橫向或直向一排
        this.setMissileBombRemoveMap(col, row);
        break;
      case GemBombType.Magic:
        // 魔法爐：消隨機一顏色所有方塊
        this.setMagicRemoveMap(currentSelectGem);
        break;
    }
    this.destroyGems();
  }

  /** 寶石位置
   * @param row 列
   * @param col 欄
   */
  private gemAt(row: number, col: number): GameGem | undefined {
    if (row < 0 || row >= BejeweledNumber.FieldSizeHeight || col < 0 || col >= BejeweledNumber.FieldSizeWidth) {
      return undefined;
    }
    return this.gameGemMap[row][col];
  }

  /** 選取寶石樣式
   * @param pickedGem 選取寶石
   */
  private gemSelectStyle(pickedGem: GameGem): void {
    pickedGem.gemSprite.setDepth(1);
    this.lastSelectedGem = pickedGem;
  }

  //#region 炸彈相關處理
  /**使用基礎炸彈(消➕號橫直三，周圍一顆), 準備清除指定寶石 */
  private setBasicalBombRemoveMap(col: number, row: number): void {
    const length = 1;
    // 直橫一顆方塊
    this.colStraightMap(col, row, length);
    this.rowStraightMap(row, col, length);
  }

  /** 使用彩色炸彈(消米字所有方塊), 準備清除指定寶石 */
  private setColorfulBombRemoveMap(col: number, row: number): void {
    const length = 6;
    // 直橫全部方塊
    this.colStraightMap(col, row, length);
    this.rowStraightMap(row, col, length);
    // 交叉全部方塊
    this.crossMap(col, row, length);
  }

  /** 使用怪獸炸彈(消米字周圍兩顆), 準備清除指定寶石 */
  private setMonsterBombRemoveMap(col: number, row: number): void {
    const length = 2;
    // 直橫排兩顆方塊
    this.colStraightMap(col, row, length);
    this.rowStraightMap(row, col, length);
    // 交叉兩顆方塊
    this.crossMap(col, row, length);
  }

  /** 使用飛彈(隨機一整排方塊), 準備清除指定寶石 */
  private setMissileBombRemoveMap(col: number, row: number): void {
    const rowOrCol = Math.round(Math.random() * 1);
    const length = 6;
    if (rowOrCol > 0) {
      this.colStraightMap(col, row, length);
    } else {
      this.rowStraightMap(row, col, length);
    }
  }

  /** 使用魔法爐(指定顏色所有方塊), 準備清除指定寶石 */
  private setMagicRemoveMap(currentSelectGem: GameGem): void {
    const targetColor = currentSelectGem.gemColor;
    for (let i = 0; i < BejeweledNumber.FieldSizeHeight; i++) {
      for (let j = 0; j < BejeweledNumber.FieldSizeWidth; j++) {
        const gem = this.gameGemMap[i][j];
        if (gem.gemColor === targetColor) {
          this.removeMap[i][j] = true;
        }
      }
    }
  }

  /** 設定removeMap, 清除指定寶石(垂直直線)
   * @param col 欄
   * @param row 列
   * @param length 周圍幾顆
   */
  private rowStraightMap(row: number, col: number, length: number): void {
    for (let i = row - length; i < row + length + 1; i++) {
      if (i < 0 || i > BejeweledNumber.FieldSizeHeight - 1) {
        continue;
      } else {
        this.removeMap[i][col] = true;
      }
    }
  }

  /** 設定removeMap, 清除指定寶石(水平直線)
   * @param col 欄
   * @param row 列
   * @param length 周圍幾顆
   */
  private colStraightMap(col: number, row: number, length: number): void {
    for (let j = col - length; j < col + length + 1; j++) {
      if (j < 0 || j > BejeweledNumber.FieldSizeWidth - 1) {
        continue;
      } else {
        this.removeMap[row][j] = true;
      }
    }
  }

  /** 設定removeMap, 清除指定寶石(交叉)
   * @param col 欄
   * @param row 列
   * @param length 周圍幾顆
   */
  private crossMap(col: number, row: number, length: number): void {
    for (let n = 0; n < length + 1; n++) {
      if (col - n >= 0 && row + n < BejeweledNumber.FieldSizeHeight) {
        this.removeMap[row + n][col - n] = true;
      }
      if (col + n < BejeweledNumber.FieldSizeWidth && row - n >= 0) {
        this.removeMap[row - n][col + n] = true;
      }
      if (col + n < BejeweledNumber.FieldSizeWidth && row + n < BejeweledNumber.FieldSizeHeight) {
        this.removeMap[row + n][col + n] = true;
      }
      if (col - n >= 0 && row - n >= 0) {
        this.removeMap[row - n][col - n] = true;
      }
    }
  }
  //#endregion

  /** 檢查版面是否存在可消除寶石 */
  private isCanDestroyGem(): boolean {
    /** 第一次檢查的四方向 */
    const onceNeighborCheck: Phaser.Math.Vector2[] = [
      new Phaser.Math.Vector2(-1, 0),
      new Phaser.Math.Vector2(1, 0),
      new Phaser.Math.Vector2(0, -1),
      new Phaser.Math.Vector2(0, 1),
    ];

    const topNeighborCheck: Phaser.Math.Vector2[] = [
      new Phaser.Math.Vector2(-3, 0),
      new Phaser.Math.Vector2(-2, -1),
      new Phaser.Math.Vector2(-2, 1),
      new Phaser.Math.Vector2(2, 0),
      new Phaser.Math.Vector2(1, -1),
      new Phaser.Math.Vector2(1, 1),
    ];
    const bottomNeighborCheck: Phaser.Math.Vector2[] = [
      new Phaser.Math.Vector2(3, 0),
      new Phaser.Math.Vector2(2, -1),
      new Phaser.Math.Vector2(2, 1),
      new Phaser.Math.Vector2(-2, 0),
      new Phaser.Math.Vector2(-1, -1),
      new Phaser.Math.Vector2(-1, 1),
    ];
    const leftNeighborCheck: Phaser.Math.Vector2[] = [
      new Phaser.Math.Vector2(0, -3),
      new Phaser.Math.Vector2(-1, -2),
      new Phaser.Math.Vector2(1, -2),
      new Phaser.Math.Vector2(0, 2),
      new Phaser.Math.Vector2(1, -1),
      new Phaser.Math.Vector2(1, 1),
    ];
    const rightNeighborCheck: Phaser.Math.Vector2[] = [
      new Phaser.Math.Vector2(0, 3),
      new Phaser.Math.Vector2(1, 2),
      new Phaser.Math.Vector2(-1, 2),
      new Phaser.Math.Vector2(0, -2),
      new Phaser.Math.Vector2(-1, 1),
      new Phaser.Math.Vector2(-1, -1),
    ];
    const twiceNeighborCheck: Phaser.Math.Vector2[][] = [
      topNeighborCheck,
      bottomNeighborCheck,
      leftNeighborCheck,
      rightNeighborCheck,
    ];

    /** 第一次檢查的四方向 */
    const onceJumpCheck: Phaser.Math.Vector2[] = [
      new Phaser.Math.Vector2(-2, 0),
      new Phaser.Math.Vector2(2, 0),
      new Phaser.Math.Vector2(0, -2),
      new Phaser.Math.Vector2(0, 2),
    ];

    const topJumpCheck: Phaser.Math.Vector2[] = [
      new Phaser.Math.Vector2(-3, 0),
      new Phaser.Math.Vector2(-1, -1),
      new Phaser.Math.Vector2(-1, 1),
      new Phaser.Math.Vector2(1, 0),
    ];
    const bottomJumpCheck: Phaser.Math.Vector2[] = [
      new Phaser.Math.Vector2(3, 0),
      new Phaser.Math.Vector2(1, -1),
      new Phaser.Math.Vector2(1, 1),
      new Phaser.Math.Vector2(-1, 0),
    ];
    const leftJumpCheck: Phaser.Math.Vector2[] = [
      new Phaser.Math.Vector2(0, -3),
      new Phaser.Math.Vector2(-1, -1),
      new Phaser.Math.Vector2(1, -1),
      new Phaser.Math.Vector2(0, 1),
    ];
    const rightJumpCheck: Phaser.Math.Vector2[] = [
      new Phaser.Math.Vector2(0, 3),
      new Phaser.Math.Vector2(1, 1),
      new Phaser.Math.Vector2(-1, 1),
      new Phaser.Math.Vector2(0, -1),
    ];
    const twiceJumpCheck: Phaser.Math.Vector2[][] = [topJumpCheck, bottomJumpCheck, leftJumpCheck, rightJumpCheck];

    for (let i = 0; i < BejeweledNumber.FieldSizeHeight; i++) {
      for (let j = 0; j < BejeweledNumber.FieldSizeWidth; j++) {
        if (this.checkAroundGem(i, j, onceNeighborCheck, twiceNeighborCheck)) {
          return true;
        }
        if (this.checkAroundGem(i, j, onceJumpCheck, twiceJumpCheck)) {
          return true;
        }
      }
    }
    return false;
  }

  /** 檢查周圍寶石
   *  @param row 橫排
   *  @param col 直排
   *  @param onceCheck 第一次檢查點
   *  @param twiceCheck 第二次檢查點
   */
  private checkAroundGem(
    row: number,
    col: number,
    onceCheck: Phaser.Math.Vector2[],
    twiceCheck: Phaser.Math.Vector2[][]
  ): boolean {
    /** 第一顆 */
    const currentGem = this.gemAt(row, col);
    if (currentGem === undefined) {
      return false;
    }

    // 依照四方向檢查第二顆
    for (let i = 0; i < onceCheck.length; i++) {
      // 取出第二顆的Gem
      const secondGem = this.gemAt(row + onceCheck[i].x, col + onceCheck[i].y);
      // 如果是undefined跳過
      if (secondGem === undefined) {
        continue;
      }
      // 判斷第一顆與鄰居是否同顏色
      else if (currentGem.gemColor === secondGem.gemColor) {
        // 依照位置檢查第三顆
        for (const position of twiceCheck[i]) {
          // 取出第三顆的Gem
          const thirdGem = this.gemAt(row + position.x, col + position.y);
          // 如果是undefined跳過
          if (thirdGem === undefined) {
            continue;
          }
          // 如果第三顆同顏色,回傳還可消除
          else if (thirdGem.gemColor === secondGem.gemColor) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
