import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { getRandomObjectByProbabilityArray } from '@/views/H5/Helper/MathHelper';
import {
  BrickBreakerEffectKey,
  BrickBreakerGrid,
  BrickBreakerGridEventType,
  BrickBreakerGridType,
} from '@/views/H5/Net/NetProtocol/BrickBreakerStructure';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import {
  BrickBreakerGridImgType as BrickBreakerGridImgKey,
  BrickBreakerNumber,
  BrickBreakerString,
} from '../../Data/BrickBreakerConfig';
import BrickBreakerGameScene from '../../Scenes/BrickBreakerGameScene';

export default class GridComponent extends Object2D {
  /** 指定為BrickBreakerGameScene使用 */
  public declare scene: BrickBreakerGameScene;

  /** 格子圖片 */
  private gridImage!: Phaser.GameObjects.Image;

  /** 格子上的額外物品圖片 */
  private itemSprite?: Phaser.GameObjects.Sprite;
  /** 格子上的額外物品說明(背景) */
  private itemTextBG?: Phaser.GameObjects.Sprite;
  /** 格子上的額外物品說明 */
  private itemText?: Phaser.GameObjects.Text;

  /** 對應格子位置Id */
  private gridId!: number;

  /** 鼠標是否在此格點擊 */
  private isPointerDownHere: boolean = false;
  /** 鼠標在此格點擊時的位置 */
  private pointDownPos?: Phaser.Math.Vector2;

  /** 更新前的重生狀態 */
  private lastGridData!: BrickBreakerGrid;

  /** 預設圖片key(空地) */
  private readonly defaultGridImgKey = BrickBreakerString.GridImgKey + BrickBreakerGridType.Empty;

  /** Attack格子, 圖片offset Y */
  private readonly attackImageOffestY = -16;

  /** 答題寶箱打開的表演秒數 */
  private readonly answerTreasureShakingSec = 0.7;
  private readonly answerTreasureOpenSec = 0.5;

  /** 滑鼠拖動最小距離(pixel), 若拖動距離大於此值, 則視為拖動 */
  private readonly dragDistance: number = 10;

  /** scene 限定為BrickBreakerGameScene */
  constructor(scene: BrickBreakerGameScene, x: number, y: number) {
    super(scene, x, y);
  }

  /** init
   * @param grid 對應格子資料
   */
  public init(grid: BrickBreakerGrid): void {
    // gridId
    this.gridId = grid.gridId;

    // 紀錄格子狀態, 用以比對狀態變化
    this.lastGridData = grid;

    // 底部預設圖片
    this.addImage(this.defaultGridImgKey, 0, 0);
    // 地上物預設圖片
    this.gridImage = this.addImage(this.defaultGridImgKey, 0, 0);

    // 點擊範圍
    const clickZone = this.addZone(0, 0, BrickBreakerNumber.GridWidth, BrickBreakerNumber.GridHeight);
    clickZone.setInteractive({ useHandCursor: true });
    // 紀錄滑鼠在此格點擊
    clickZone.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.isPointerDownHere = true;
      this.pointDownPos = new Phaser.Math.Vector2(
        this.scene.game.input.mousePointer!.x,
        this.scene.game.input.mousePointer!.y
      );
    });
    // 當滑鼠持續按著並移開此格，清除flag
    clickZone.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.isPointerDownHere = false;
    });
    // 滑鼠點擊與釋放都在此格進行才觸發
    clickZone.on(Phaser.Input.Events.POINTER_UP, () => {
      if (this.isPointerDownHere === false) {
        return;
      }
      if (this.pointDownPos === undefined) {
        return;
      }
      const pointUpPos = new Phaser.Math.Vector2(
        this.scene.game.input.mousePointer!.x,
        this.scene.game.input.mousePointer!.y
      );
      // 計算POINTER_DOWN跟POINTER_UP, 滑鼠移動的距離
      const mouseMoveDistance = Phaser.Math.Distance.BetweenPoints(this.pointDownPos, pointUpPos);
      // 滑鼠移動的距離大於一定距離, 視作是拖動, return
      if (mouseMoveDistance > this.dragDistance) {
        return;
      }

      // 觸發點擊事件
      this.scene.onClickGrid(this.gridId);
    });

    // 設定初始外型
    this.updateGrid(grid);
  }

  /** 敲磚時, 判斷Grid有沒有可被破壞的磚塊，來決定要不要表演 */
  public isPlayPlayerBreakAnim(): boolean {
    // 格子未開放或已破壞, 視作空地, 不需播敲磚動畫
    if (
      this.lastGridData.isUnlock === false ||
      this.lastGridData.isDestroyPermenantly ||
      this.lastGridData.isWaitForRegenerate
    ) {
      return false;
    }
    // 格子依類型決定是否需要表演敲磚動畫
    switch (this.lastGridData.gridType) {
      // 磚塊、怪爪、寶箱、魔王
      case BrickBreakerGridType.BreakableBrick1:
      case BrickBreakerGridType.BreakableBrick2:
      case BrickBreakerGridType.BreakableBrick3:
      case BrickBreakerGridType.DisposableBrick:
      case BrickBreakerGridType.Defense:
      case BrickBreakerGridType.AnswerTreasure:
      case BrickBreakerGridType.Boss:
        return true;
      default:
        return false;
    }
  }

  //#region 決定grid外型

  /** 根據gridData決定顯示外觀
   * @param grid 新的grid資料
   */
  public updateGrid(grid: BrickBreakerGrid): void {
    // 是否顯示戰爭迷霧
    if (grid.isUnlock === false) {
      this.gridImage.setTexture(BrickBreakerString.GridImgKey + BrickBreakerGridImgKey.FogOfWar);
      return;
    }
    // 顯示是否永久摧毀
    if (grid.isDestroyPermenantly) {
      // 顯示永久摧毀空地
      this.gridImage.setTexture(BrickBreakerString.GridImgKey + BrickBreakerGridImgKey.Destroyed);
      // 若狀態改變, 播破壞動畫
      if (this.lastGridData.isDestroyPermenantly === false) {
        this.playGridDestroy(grid);
      }
      // 更新lastGridData
      this.lastGridData = grid;
      return;
    }
    // 重生狀態
    if (grid.isWaitForRegenerate) {
      this.gridImage.setTexture(BrickBreakerString.GridImgKey + BrickBreakerGridImgKey.Empty);
    } else {
      this.setGridImg(grid);
    }
    // 若重生狀態改變
    if (this.lastGridData.isWaitForRegenerate !== grid.isWaitForRegenerate) {
      // 由false變為true, 表示被破壞
      if (grid.isWaitForRegenerate) {
        // 播破壞動畫
        this.playGridDestroy(grid);
      } else {
        // 播重新生成動畫, gridImage從上往下掉
        this.scene.effectLayer.playGridRegenerate(this.gridImage, this);
      }
    }
    // 更新lastGridData
    this.lastGridData = grid;
  }

  /** 取得GridType的對應GridImgType
   * @param grid BrickBreakerGrid
   */
  private setGridImg(grid: BrickBreakerGrid): void {
    switch (grid.gridType) {
      // 空地
      case BrickBreakerGridType.Empty:
        this.setGridTexture(BrickBreakerGridImgKey.Empty);
        return;
      // 可破壞磚塊
      case BrickBreakerGridType.BreakableBrick1:
      case BrickBreakerGridType.BreakableBrick2:
      case BrickBreakerGridType.BreakableBrick3:
      case BrickBreakerGridType.DisposableBrick:
        // 可破壞磚塊從三種外型隨機骰出
        const brickTypeArray = [
          BrickBreakerGridImgKey.BreakableBrick1,
          BrickBreakerGridImgKey.BreakableBrick2,
          BrickBreakerGridImgKey.BreakableBrick3,
        ];
        let brickType = getRandomObjectByProbabilityArray(brickTypeArray, [0.33, 0.33, 0.34]);
        // 防呆
        if (brickType === undefined) {
          brickType = BrickBreakerGridImgKey.BreakableBrick1;
        }
        this.setGridTexture(brickType);
        return;
      // 不可破壞磚塊
      case BrickBreakerGridType.UnbreakableBrick1:
        this.setGridTexture(BrickBreakerGridImgKey.UnbreakableBrick1);
        return;
      case BrickBreakerGridType.UnbreakableBrick2:
        this.setGridTexture(BrickBreakerGridImgKey.UnbreakableBrick2);
        return;
      case BrickBreakerGridType.UnbreakableBrick3:
        this.setGridTexture(BrickBreakerGridImgKey.UnbreakableBrick3);
        return;
      // 遠程武器
      case BrickBreakerGridType.Attack:
        this.setGridTexture(BrickBreakerGridImgKey.Attack_Stage);
        // set arrow
        this.setItemTexture(BrickBreakerGridImgKey.Attack_Arrow);
        if (this.itemSprite === undefined) {
          console.error(`setGridImg() error, itemImage is undefined! gridId ${this.lastGridData.gridId}`);
          return;
        }
        // 旋轉圖片
        const thisPosition = new Phaser.Math.Vector2(this.x, this.y);
        const bossPosition = this.scene.gridManager.getBossPosition();
        // 計算向量(與水平線之間的)弧度
        let radian = Phaser.Math.Angle.BetweenPoints(thisPosition, bossPosition);
        // 由於圖片的arrow是指向上方, 所以要旋轉的量要再加上90度
        radian += Phaser.Math.PI2 / 4;
        this.itemSprite.setRotation(radian);
        // y值移動
        this.gridImage.y = this.attackImageOffestY;
        this.itemSprite.y = this.y + this.attackImageOffestY;
        return;
      // 魔王怪爪
      case BrickBreakerGridType.Defense:
        // 設置怪爪動圖
        this.setItemTexture(BrickBreakerGridImgKey.Defense);
        if (this.itemSprite === undefined) {
          console.error(
            `setGridImg() error, itemSprite undefined! gridType ${BrickBreakerGridType[BrickBreakerGridType.Defense]}`
          );
          return;
        }
        // 獲取特效資料
        const effectData = this.scene.effectDataMap.get(BrickBreakerEffectKey.GridTentacleDefense);
        if (effectData === undefined) {
          console.error(
            `setGridImg() error, effectData undefined! gridType ${BrickBreakerGridType[BrickBreakerGridType.Defense]}`
          );
          return;
        }
        // 依照給予的特效資料設置Tween
        AnimationHelper.setTweenFromEffectData(this.itemSprite, effectData, true);
        return;
      // 寶物
      case BrickBreakerGridType.Treasure:
        // 根據事件類型決定外觀
        switch (grid.eventType) {
          case BrickBreakerGridEventType.Shuriken:
            // 手裏劍超出框框, 故改以item texture處理
            this.setItemTexture(BrickBreakerGridImgKey.Treasure_Shuriken);
            this.setItemText(Localization.getText(LocalKeyType.Common, 'brickBreaker_mapItem_shuriken'));
            return;
          case BrickBreakerGridEventType.Horn:
            this.setGridTexture(BrickBreakerGridImgKey.Treasure_Horn);
            this.setItemText(Localization.getText(LocalKeyType.Common, 'brickBreaker_mapItem_horn'));
            return;
          case BrickBreakerGridEventType.GetShield:
            this.setGridTexture(BrickBreakerGridImgKey.Treasure_Shield);
            this.setItemText(Localization.getText(LocalKeyType.Common, 'brickBreaker_mapItem_teleportProtect'));
            return;
          case BrickBreakerGridEventType.GetAxeSelf:
            this.setGridTexture(BrickBreakerGridImgKey.Treasure_AxeSelf);
            this.setItemText(Localization.getText(LocalKeyType.Common, 'brickBreaker_mapItem_powerUp'));
            return;
          case BrickBreakerGridEventType.GetAxeAround:
            this.setGridTexture(BrickBreakerGridImgKey.Treasure_AxeAround);
            this.setItemText(Localization.getText(LocalKeyType.Common, 'brickBreaker_mapItem_powerUp'));
            return;
          case BrickBreakerGridEventType.GetAxeAll:
            this.setGridTexture(BrickBreakerGridImgKey.Treasure_AxeAll);
            this.setItemText(Localization.getText(LocalKeyType.Common, 'brickBreaker_mapItem_powerUp'));
            return;
          case BrickBreakerGridEventType.GetFreezePrevent:
            this.setGridTexture(BrickBreakerGridImgKey.Treasure_FreezePrevent);
            this.setItemText(Localization.getText(LocalKeyType.Common, 'brickBreaker_mapItem_freezeProtect'));
            return;
          default:
            console.error(
              `getGridImgKey() error, treasure grid ${this.gridId}, eventType = ${
                BrickBreakerGridEventType[grid.eventType]
              }, gridId = ${grid.gridId}`
            );
            return;
        }
      // 答題寶箱
      case BrickBreakerGridType.AnswerTreasure:
        this.setGridTexture(BrickBreakerGridImgKey.AnswerTreasure_Close);
        return;
      // 出生點
      case BrickBreakerGridType.RespawnPoint:
        this.setGridTexture(BrickBreakerGridImgKey.RespawnPoint);
        return;
      // 魔王
      case BrickBreakerGridType.Boss:
        this.setGridTexture(BrickBreakerGridImgKey.Empty);
        return;
      default:
        console.error(
          `getGridImgType() error, unexpected GridType: ${BrickBreakerGridType[grid.gridType]}, gridId: ${grid.gridId}`
        );
        return;
    }
  }

  /** 設定gridImage
   * @param gridImgType 圖片key
   */
  private setGridTexture(gridImgType: BrickBreakerGridImgKey): void {
    this.gridImage.setTexture(BrickBreakerString.GridImgKey + gridImgType);
  }

  /** 設定gridItemImage
   * @param gridImgType 圖片key
   */
  private setItemTexture(gridImgType: BrickBreakerGridImgKey | undefined): void {
    // 若gridImgType為undefined表示要消滅gridItemImage
    if (gridImgType === undefined) {
      if (this.itemSprite) {
        this.itemSprite.destroy();
      }
      return;
    }

    // 若沒有設定過gridItemImage, 就addImage
    if (this.itemSprite === undefined) {
      // 為了render順序, 加到playerLayer底下
      this.itemSprite = this.scene.playerManager.addSprite(BrickBreakerString.GridImgKey + gridImgType, this.x, this.y);
      this.remove(this.itemSprite);
      return;
    }
    // 否則setTexture
    this.itemSprite.setTexture(BrickBreakerString.GridImgKey + gridImgType);
  }

  /** 設定道具文字
   * @param content 道具文字
   */
  private setItemText(content: string | undefined): void {
    // 若content為undefined表示要消滅itemText
    if (content === undefined) {
      this.itemTextBG?.destroy();
      this.itemText?.destroy();
      return;
    }

    // 若沒有設定過itemTextBG, 就addImage
    if (this.itemTextBG === undefined) {
      // 為了render順序, 加到playerLayer底下
      this.itemTextBG = this.scene.playerManager.addSprite(BrickBreakerString.NameFrame, this.x, this.y + 19);
      this.itemTextBG.setScale(0.52);
    }
    // 若沒有設定過itemText, 就addText
    if (this.itemText === undefined) {
      // 為了render順序, 加到playerLayer底下
      this.itemText = this.scene.playerManager.addText(content, this.x, this.y + 20, {
        strokeThickness: 0,
      });
      this.itemText.setScale(0.5);
      this.itemText.setAlpha(0.8);
    }
    // 若有設定過itemText, 直接換字即可
    else {
      this.itemText?.setText(content);
    }
  }
  //#endregion

  /** 播grid破壞動畫
   * @param grid 目標grid
   */
  private async playGridDestroy(grid: BrickBreakerGrid): Promise<void> {
    // 圖片歸位
    this.gridImage.y = 0;
    // 道具圖片清空
    this.setItemTexture(undefined);
    // 道具文字清空
    this.setItemText(undefined);
    switch (grid.gridType) {
      // 破壞磚塊, 碎石噴發
      case BrickBreakerGridType.BreakableBrick1:
      case BrickBreakerGridType.BreakableBrick2:
      case BrickBreakerGridType.BreakableBrick3:
      case BrickBreakerGridType.DisposableBrick:
        this.scene.effectLayer.playBrickDestroyEffect(this.x, this.y);
        break;
      // 開寶箱
      case BrickBreakerGridType.AnswerTreasure:
        // 關著的寶箱 來回搖3下
        this.setItemTexture(BrickBreakerGridImgKey.AnswerTreasure_Close);
        this.scene.add.tween({
          targets: this.itemSprite,
          angle: {
            from: -15,
            to: 15,
          },
          repeat: 3,
          yoyo: true,
          duration: 100,
          onComplete: () => {
            if (this.itemSprite === undefined) {
              return;
            }
            this.itemSprite.angle = 0;
          },
        });
        await AsyncHelper.sleep(this.answerTreasureShakingSec);
        // 寶箱打開
        this.setItemTexture(BrickBreakerGridImgKey.AnswerTreasure_Open);
        await AsyncHelper.sleep(this.answerTreasureOpenSec);
        // 寶箱消失
        this.setItemTexture(undefined);
        break;
      // 其他類型的格子不用表演
      default:
        break;
    }
  }
}
