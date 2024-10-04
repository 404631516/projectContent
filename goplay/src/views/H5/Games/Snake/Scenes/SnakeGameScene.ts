import { TotalProps, ContestPlayerData, SnakeGameData, SnakeGameLog } from '@/helper/interface/Game';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import AnswerGameFSM, { IAnswerGame, IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';
import { SnakeDepth, SnakeFoodFunctionType, SnakeMovePeriod, SnakeNumber, SnakeString } from '../Data/SnakeConfig';
import Snake from '../Component/Snake';
import SnakeFood from '../Component/SnakeFood';
import { BossGame } from '../../Common/PhaserGameStrategy';
import SnakeGuiDialog from '../Dialogs/SnakeGuiDialog';
import UIManager from '@/views/H5/Scripts/Manager/UIManager';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import SnakeBackgroundDialog from '../Dialogs/SnakeBackgroundDialog';
import ItemDialog from '../../UIHelper/ItemDialog';
import SnakeItem from '../Component/SnakeItem';
import { Align, CompassRad } from '@/views/H5/Helper/MathHelper';
import { GameType } from '@/helper/enum/Common';
import TableManager, { SnakeFoodData, SnakeItemData } from '@/manager/TableManager';
import { snakeImgUrl } from '../Data/SnakeResource';
import { SnakeGridManager } from '../Component/SnakeGridManager';
import { JoystickDirectionMode, VirtualJoystick } from '@/views/H5/Scripts/Components/UserInput/VirtualJoystick';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import { AnimationType, SnakeAnimationFactory } from '../Component/SnakeAnimationFactory';
import UIHelper from '@/views/H5/Helper/UIHelper';

export default class SnakeGameScene extends BaseGameScene implements IAnswerGame {
  /** 遊戲狀態機 */
  private gameFSM!: AnswerGameFSM;

  /** 道具資料 */
  private itemDataList!: SnakeItemData[];

  /** 貪食蛇本體 */
  public snake!: Snake;
  /** 食物array */
  public foods: SnakeFood[] = [];
  /** 貪食蛇地圖 */
  private gridManager!: SnakeGridManager;
  /** 偵測輸入 */
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  /** 虛擬搖桿 */
  private virtualJoystick: VirtualJoystick;
  /** 吃食物音效 */
  private eatSound: Phaser.Sound.BaseSound;
  /** 受傷音效 */
  private hitSound: Phaser.Sound.BaseSound;
  /** 使用道具音效 */
  private useItemSound: Phaser.Sound.BaseSound;

  //#region variable
  /** 介面Dialog : 分數、生命、道具數量 */
  private guiDialog!: SnakeGuiDialog;
  /** 道具介面 */
  private itemDialog!: ItemDialog<SnakeItem>;

  /** 當前遊戲時間(毫秒) */
  private currentTime: number = 0;

  /** 分數累計 */
  private scoreCount: number = 0;
  /** 是否到計時結束 */
  private isTimeOut: boolean = false;
  /** 是否到續命時間 */
  private isReviveTime: boolean = false;

  /** 地圖寬度(格子數) */
  public gridWidth: number;
  /** 地圖高度(格子數) */
  public gridHeight: number;

  /** 吃食物次數紀錄 */
  private eatFoods: Map<number, number> = new Map();
  /** 使用道具紀錄, key是道具ID, value是使用次數 */
  private usePropsMap: Map<number, number> = new Map();

  /** 判斷遊戲是否該結束 */
  public get isGameEnd(): boolean {
    return this.isTimeOut || this.snake.isAlive() === false;
  }
  /** 判斷遊戲是否該續命 */
  public get isGameRevive(): boolean {
    return this.isReviveTime || this.snake.isAlive() === false;
  }
  //#endregion

  constructor(private gameData: SnakeGameData, private gameWeb: IAnswerWeb, private bossGame?: BossGame) {
    super({ key: 'SnakeGameScene' });
    this.gameFSM = new AnswerGameFSM(this, gameWeb);
  }

  preload() {
    // 抓取道具靜態表
    this.itemDataList = TableManager.snakeItem.getAll();
    // 載入道具圖片
    this.itemDataList.forEach((data) => {
      this.load.image(data.nameKey, `${snakeImgUrl}/${data.url}`);
    });
    // 載入食物圖片
    TableManager.snakeFood.getAll().forEach((data) => {
      this.load.image(data.nameKey, `${snakeImgUrl}/${data.url}`);
    });
    // 載入音效
    this.eatSound = this.sound.add(SnakeString.AudioEat);
    this.hitSound = this.sound.add(SnakeString.AudioHurt);
    this.useItemSound = this.sound.add(SnakeString.AudioUseItem);
    // 計算地圖寬高格子數
    this.gridWidth = Math.floor(
      (SnakeNumber.GameRangeRightBottomX - SnakeNumber.GameRangeLeftTopX) / SnakeNumber.GridSize,
    );
    this.gridHeight = Math.floor(
      (SnakeNumber.GameRangeRightBottomY - SnakeNumber.GameRangeLeftTopY) / SnakeNumber.GridSize,
    );
    // new snake map
    this.gridManager = new SnakeGridManager(this, this.gridWidth, this.gridHeight);
    // 設置虛擬搖桿
    const canvas = this.game.canvas;
    this.virtualJoystick = new VirtualJoystick(
      this,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width,
      canvas.height,
      JoystickDirectionMode.Four,
      true,
    );
  }

  async create() {
    // 設定animationFactory
    const animationFactory = new SnakeAnimationFactory(this);
    // 生成蛇, 輸入起始位置(格子數)
    this.snake = new Snake(this, 8, 4);
    // 生成食物
    this.generateFood();
    // 設定輸入
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }
    // 設置Dialog
    await this.setDialog();
  }

  protected fixedUpdate(time: number, delta: number): void {
    // 更新遊戲狀態機
    this.gameFSM.update(delta);
    // 更新遊戲時間
    this.currentTime = time;
  }

  /** 設定背景、Gui等Dialog */
  private async setDialog(): Promise<void> {
    // 開啟背景
    const bgDialog = UIManager.instance.openDialog(SnakeBackgroundDialog, this);
    bgDialog.setDepth(SnakeDepth.Background);

    // 開啟Gui
    this.guiDialog = UIManager.instance.openDialog(SnakeGuiDialog, this);
    this.guiDialog.setDepth(SnakeDepth.UI);
    this.guiDialog.updateScoreCount(this.scoreCount, SnakeNumber.TargetScore);

    // 開啟道具介面
    this.itemDialog = UIManager.instance.openDialog<ItemDialog<SnakeItem>>(ItemDialog, this);
    this.itemDialog.setDepth(SnakeDepth.UI);
    this.itemDialog.init(
      this.itemDataList,
      { width: 60, height: 60 },
      new Phaser.Math.Vector2(this.itemDialog.width - 150, this.itemDialog.height - 40),
      Align.RightCenter,
    );
    await this.itemDialog.addItems(this.gameData.totalProps, SnakeItem, this.useItem.bind(this));

    // 關閉loading dialog
    UIManager.instance.closeDialog(LoadingDialog, this);
  }

  //#region 狀態機
  /** 遊戲開場，播放遊戲動畫 */
  public async onOpeningEnter(): Promise<void> {
    // 播放開場動畫
    await this.guiDialog.showOpeningGameText();
  }

  /** 遊戲啟動 */
  public onGameEnter(): void {
    // 開啟Timer計時，以波數總時間為準
    this.setTimerDialog(SnakeNumber.TotalGameTime, SnakeDepth.UI);
    // 設置TimerUI
    this.timerDialog?.layoutBackground.setVisible(false);
    this.timerDialog?.layoutTitle.setPosition(780, 30);
    this.timerDialog?.layout.container.setPosition(840, 30);
    this.timerDialog?.timeText.setColor(UIHelper.whiteString);
    // 設置Timer事件
    this.setTimerEvent(
      () => {
        // 時間到
        this.isTimeOut = true;
      },
      // 剩餘30秒強制續命
      new Map([
        [
          SnakeNumber.ReviveTime,
          () => {
            this.isReviveTime = true;
          },
        ],
      ]),
    );
  }

  /** 遊戲進行中
   * @param delta 每一幀的間隔
   */
  onGameUpdate(delta: number): void {
    // 處理輸入
    this.handleInput();
    // 貪食蛇更新
    if (this.snake.update(this.currentTime)) {
      this.checkCollision();
    }
    // 食物更新
    this.foods.forEach((food) => {
      if (food.isDestroyTime(this.currentTime)) {
        this.removeFood(food);
      }
    });
  }

  /** 當觸發續命 */
  public onReviveEnter(): void {
    // 停止虛擬搖桿
    this.virtualJoystick.stopDrag();
    // 暫停背景音樂
    this.bgm?.pause();
    this.pauseScene();
  }

  /** 續命完成
   * @param rewardProp
   */
  public async onReviveEnd(rewardProp: TotalProps[]): Promise<void> {
    // 將道具加到itemDialog
    await this.itemDialog.addItems(rewardProp, SnakeItem, this.useItem.bind(this));
    // 續命後蛇復活
    this.snake.revive();
    // 清空場上食物
    this.foods.forEach((food) => food.destroy());
    this.foods = [];
    // 播放開場動畫
    await this.guiDialog.showOpeningGameText();
    // 繼續背景音樂
    this.bgm?.resume();
    // 所有場景暫停繼續
    this.resumeScene();
    // 下一幀
    this.events.once(Phaser.Scenes.Events.UPDATE, () => {
      // 生成食物: 因為在遊戲暫停狀態時, 取得食物空位的碰撞偵測不會偵測到重生的蛇身, 所以要隔一幀再生成食物
      this.generateFood();
    });
  }

  /** 結束遊戲 */
  public onEndingEnter(): ContestPlayerData {
    // 停止虛擬搖桿
    this.virtualJoystick.stopDrag();

    // 設定結算資料
    const gameLog: SnakeGameLog = {
      gameScore: this.scoreCount,
      gameMode: GameType.WebSnake,
      browser: navigator.userAgent,
      // 吃食物次數
      eatFoods: Array.from(this.eatFoods, ([id, count]) => ({ id, count })).sort((a, b) => a.id - b.id),
      // 蛇長度
      snakeLength: this.snake.body.length,
      // 使用道具次數
      useProps: Array.from(this.usePropsMap, ([id, count]) => ({ id, count })).sort((a, b) => a.id - b.id),
    };
    // 回傳結算資料
    return {
      hid: this.gameData.heroListData.hid,
      isSurvivor: this.scoreCount >= SnakeNumber.TargetScore,
      webGameLog: gameLog,
    };
  }
  //#endregion 狀態機

  /** 處理使用者輸入 */
  private handleInput(): void {
    // 定義方向與動畫對應
    const directionMappings: { [key: string]: { direction: Phaser.Math.Vector2; compassRad: CompassRad } } = {
      left: { direction: Phaser.Math.Vector2.LEFT, compassRad: CompassRad.Left },
      right: { direction: Phaser.Math.Vector2.RIGHT, compassRad: CompassRad.Right },
      up: { direction: Phaser.Math.Vector2.UP, compassRad: CompassRad.Up },
      down: { direction: Phaser.Math.Vector2.DOWN, compassRad: CompassRad.Down },
    };

    // for each 上、下、左、右, 若有按下則設定方向
    for (const [key, { direction, compassRad }] of Object.entries(directionMappings)) {
      // 鍵盤輸入
      if (this.cursors[key as keyof Phaser.Types.Input.Keyboard.CursorKeys]?.isDown) {
        this.snake.faceDirection(direction);
      }
      // 虛擬搖桿輸入
      else if (this.virtualJoystick.getDirection() === compassRad) {
        this.snake.faceDirection(direction);
      }
    }
  }

  /** 確認蛇頭是否碰到食物 */
  private checkCollision(): void {
    // 確認蛇頭是否碰到食物
    const eatenFood = this.foods.find((food) => this.physics.overlap(this.snake.body[0], food));
    // 若蛇頭碰到食物
    if (eatenFood) {
      this.handleFoodCollision(eatenFood);
    }
  }

  /** 處理食物碰撞 */
  private handleFoodCollision(food: SnakeFood): void {
    // 觸發食物效果、增加分數、蛇身成長
    this.onEatFood(food);
    // 移除食物
    this.removeFood(food);
  }

  /** 觸發食物效果、增加分數、蛇身成長
   * @param food 被吃掉的食物
   */
  private onEatFood(food: SnakeFood): void {
    const foodData = food.getFoodData();
    // 觸發食物功能
    switch (foodData.functionType) {
      case SnakeFoodFunctionType.None:
        // 無功能, 不做任何事
        break;
      case SnakeFoodFunctionType.SpeedUp:
        this.snake.setMovePeriod(SnakeMovePeriod.SpeedUp, this.currentTime, SnakeNumber.SpeedItemEffectDuration);
        break;
      case SnakeFoodFunctionType.SpeedDown:
        this.snake.setMovePeriod(SnakeMovePeriod.SpeedDown, this.currentTime, SnakeNumber.SpeedItemEffectDuration);
        break;
      case SnakeFoodFunctionType.Shrink:
        this.snake.shrink();
        break;
      case SnakeFoodFunctionType.ClearJunkFood:
        this.clearJunkFood();
        break;
      default:
        Helper.assert(ErrorId.VariableUndefined, 'unexpected food function type: ' + foodData.functionType);
        break;
    }

    // 紀錄吃食物次數
    const eatCount = this.eatFoods.get(foodData.id) || 0;
    this.eatFoods.set(foodData.id, eatCount + 1);
    // 更新分數
    this.updateScore(foodData.score);
    // 蛇身成長(吃到縮短道具時不用)
    if (foodData.functionType !== SnakeFoodFunctionType.Shrink) {
      this.snake.grow();
    }
    // 播放吃食物音效
    this.eatSound.play();
    // 播放吃食物特效表演
    const eatFx = this.add.sprite(food.x, food.y, SnakeString.EatEffect);
    eatFx.play(AnimationType.Eat);
    eatFx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      eatFx.destroy();
    });

    // 隨機生成數個食物
    const foodCount = Phaser.Math.Between(1, 2);
    for (let i = 0; i < foodCount; i++) {
      this.generateFood();
    }
  }

  /** 更新分數 */
  private updateScore(score: number): void {
    // 增/減健康分數並確保分數不低於0
    this.scoreCount = Math.max(this.scoreCount + score, 0);
    // 更新分數
    this.guiDialog.updateScoreCount(this.scoreCount, SnakeNumber.TargetScore);
  }

  /** 清除垃圾食物 */
  private clearJunkFood(): void {
    this.foods = this.foods.filter((food) => {
      if (food.getFoodData().isJunkFood) {
        food.destroy();
        return false;
      }
      return true;
    });
  }

  /** 移除食物 */
  private removeFood(food: SnakeFood): void {
    this.foods = this.foods.filter((item) => item !== food);
    food.destroy();
    // 若場上沒有食物
    if (this.foods.length === 0) {
      // 隨機生成數個食物
      const foodCount = Phaser.Math.Between(1, 2);
      for (let i = 0; i < foodCount; i++) {
        this.generateFood();
      }
    }
  }

  /** 生成食物 */
  private generateFood(foodData?: SnakeFoodData): void {
    // 取得隨機空格位置
    const emptyPosition = this.gridManager.getRandomEmptyPosition();
    // 若沒有空位, 不生成食物
    if (emptyPosition === undefined) {
      return;
    }
    // 若沒有指定食物資料, 隨機生成食物
    if (foodData === undefined) {
      // 生成垃圾食物的機率為1/3
      const isJunkFood = Phaser.Math.Between(0, 2) === 2;
      const foodDataList = TableManager.snakeFood.where((data) => data.isJunkFood === isJunkFood);
      const randomIndex = Phaser.Math.Between(0, foodDataList.length - 1);
      foodData = foodDataList[randomIndex];
    }
    // 生成食物
    const food = new SnakeFood(this, emptyPosition.x, emptyPosition.y, foodData, this.currentTime);
    this.foods.push(food);
  }

  /** 當蛇撞到牆或撞到身體 */
  public onSnakeHit(): void {
    this.hitSound.play();
  }

  //#region 操控
  /** 使用道具
   * @param item 道具
   */
  public useItem(item: SnakeItem): void {
    // 遊戲中才可使用
    if (this.gameFSM.isGameState === false) {
      return;
    }
    // 取得對應食物資料
    const foodData = TableManager.snakeFood.findOne(item.itemData.generateSnakeFoodId);
    // 生成食物
    this.generateFood(foodData);
    // 播放使用道具音效
    this.useItemSound.play();
    // 使用道具後扣除道具數量
    item.useItem();
    // 紀錄使用道具
    const usedCount = this.usePropsMap.get(item.itemData.id) || 0;
    this.usePropsMap.set(item.itemData.id, usedCount + 1);
  }
  //#endregion
}
