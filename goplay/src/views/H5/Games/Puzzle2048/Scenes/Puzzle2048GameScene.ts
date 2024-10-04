import UIManager from '../../../Scripts/Manager/UIManager';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import Puzzle2048GuiDialog from '../Dialogs/Puzzle2048GuiDialog';
import InfoBox from '@/views/H5/Scripts/Components/InfoBox';
import { TotalProps, ContestPlayerData, Puzzle2048GameLog, Puzzle2048GameData } from '@/helper/interface/Game';
import { GameType } from '@/helper/enum/Common';
import HeroManager from '@/manager/HeroManager';
import AnswerGameFSM, { IAnswerGame, IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';
import TableManager, { HeroData, Puzzle2048ItemData } from '@/manager/TableManager';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import Puzzle2048BackgroundDialog from '../Dialogs/Puzzle2048BackgroundDialog';
import Puzzle2048Item from '../Components/Puzzle2048Item';
import {
  Puzzle2048Depth,
  Puzzle2048ItemFunction,
  Puzzle2048Number,
  Puzzle2048String,
  puzzle2048TileColorMap,
} from '../Data/Puzzle2048Config';
import DefaultMap from '@/views/H5/Helper/DefaultMap';
import Puzzle2048Tile from '../Components/Puzzle2048Tile';
import {
  JoystickDirectionMode,
  JoystickEvent,
  VirtualJoystick,
} from '@/views/H5/Scripts/Components/UserInput/VirtualJoystick';
import { Align, CompassRad } from '@/views/H5/Helper/MathHelper';
import ItemDialog from '../../UIHelper/ItemDialog';
import { puzzle2048ImgUrl } from '../Data/Puzzle2048Resource';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';

export default class Puzzle2048GameScene extends BaseGameScene implements IAnswerGame {
  /** 遊戲狀態機 */
  private gameFSM!: AnswerGameFSM;

  //#region 靜態表資料
  /** 道具資料 */
  private itemDataList: Puzzle2048ItemData[];
  //#endregion

  //#region Dialog
  private backgroundDialog!: Puzzle2048BackgroundDialog;
  /** 介面Dialog : 分數、生命、道具數量 */
  private guiDialog!: Puzzle2048GuiDialog;
  /** 道具介面 */
  private itemDialog!: ItemDialog<Puzzle2048Item>;
  //#endregion

  //#region variables and properties
  /** 英雄資料 */
  private heroData!: HeroData;

  /** 鍵盤操控 */
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  /** 虛擬搖桿 */
  private virtualJoystick: VirtualJoystick;
  /** Tile列表 */
  private tileList: Puzzle2048Tile[][];
  /** 是否可移動 */
  private canMove: boolean;
  /** 移動中的Tile數量 */
  private movingTiles: number;
  /** 爆炸特效 */
  private bombEffect: Phaser.GameObjects.Sprite;

  /** 分數累計 */
  private scoreCount: number = 0;

  /** 是否到計時結束 */
  // TODO: 跟企劃確認細節
  private isTimeOut: boolean = false;
  /** 是否到續命時間 */
  private isReviveTime: boolean = false;

  /** 使用道具紀錄, key是道具ID, value是使用次數 */
  private usePropsMap: DefaultMap<number, number> = new DefaultMap(() => 0);

  /** 檢查遊戲是否結束
   * @returns true = 結束
   */
  public get isGameEnd(): boolean {
    return this.isTimeOut;
  }
  /** 判斷遊戲是否該續命 */
  public get isGameRevive(): boolean {
    // 到續命時間
    return this.isReviveTime;
  }
  //#endregion variables and properties

  //#region constructor、Phaser function
  constructor(private gameData: Puzzle2048GameData, private gameWeb: IAnswerWeb) {
    super({ key: 'VerticalParkourGameScene' });
    this.gameFSM = new AnswerGameFSM(this, gameWeb);
  }

  async preload() {
    // 開啟loading dialog
    UIManager.instance.openDialog(LoadingDialog, this);

    // 獲取英雄資料
    const heroData = HeroManager.getHeroData(this.gameData.heroListData.heroId);
    // 檢查資料並顯示錯誤
    if (heroData === undefined) {
      await InfoBox.defaultMessage([this], `英雄資料讀取失敗! 英雄ID: ${this.gameData.heroListData.heroId}`);
      this.scene.stop();
      return;
    }
    this.heroData = heroData;

    // 抓取道具靜態表
    this.itemDataList = TableManager.puzzle2048Item.getAll();
    // 載入道具圖片
    this.itemDataList.forEach((data) => {
      this.load.image(data.nameKey, `${puzzle2048ImgUrl}/${data.url}`);
    });
  }

  async create() {
    // 初始化tile
    this.tileList = [];
    for (let i = 0; i < Puzzle2048Number.Row; i++) {
      this.tileList[i] = [];
      for (let j = 0; j < Puzzle2048Number.Col; j++) {
        const tile = new Puzzle2048Tile(
          this,
          Puzzle2048Number.PosOffsetX + j * Puzzle2048Number.TileSize + Puzzle2048Number.TileSize / 2,
          Puzzle2048Number.PosOffsetY + i * Puzzle2048Number.TileSize + Puzzle2048Number.TileSize / 2,
        );
        tile.init();
        this.tileList[i][j] = tile;
      }
    }

    // 設置方向鍵操控
    this.cursorKeys = this.input.keyboard!.createCursorKeys();
    // 設置方向鍵事件
    this.input.keyboard?.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, () => {
      if (this.canMove === false) {
        return;
      }

      if (this.cursorKeys.up.isDown) {
        this.tileList.forEach((row) => row.forEach((tile) => (tile.depth = tile.y)));
        this.handleMove(Phaser.Math.Vector2.UP);
      } else if (this.cursorKeys.down.isDown) {
        this.tileList.forEach((row) => row.forEach((tile) => (tile.depth = this.cameras.main.width - tile.y)));
        this.handleMove(Phaser.Math.Vector2.DOWN);
      } else if (this.cursorKeys.left.isDown) {
        this.tileList.forEach((row) => row.forEach((tile) => (tile.depth = tile.x)));
        this.handleMove(Phaser.Math.Vector2.LEFT);
      } else if (this.cursorKeys.right.isDown) {
        this.tileList.forEach((row) => row.forEach((tile) => (tile.depth = this.cameras.main.width - tile.x)));
        this.handleMove(Phaser.Math.Vector2.RIGHT);
      }
    });

    // 設置虛擬搖桿
    const canvas = this.game.canvas;
    this.virtualJoystick = new VirtualJoystick(
      this,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width,
      canvas.height,
      JoystickDirectionMode.Four,
      false,
    ).setDepth(Puzzle2048Depth.Background);
    // 設置虛擬搖桿事件
    this.virtualJoystick.onUpdateDirection(JoystickEvent.Move, (direction: CompassRad) => {
      if (this.canMove === false) {
        return;
      }

      switch (direction) {
        case CompassRad.Up:
          this.tileList.forEach((row) => row.forEach((tile) => (tile.depth = tile.y)));
          this.handleMove(Phaser.Math.Vector2.UP);
          break;
        case CompassRad.Down:
          this.tileList.forEach((row) => row.forEach((tile) => (tile.depth = this.cameras.main.width - tile.y)));
          this.handleMove(Phaser.Math.Vector2.DOWN);
          break;
        case CompassRad.Left:
          this.tileList.forEach((row) => row.forEach((tile) => (tile.depth = tile.x)));
          this.handleMove(Phaser.Math.Vector2.LEFT);
          break;
        case CompassRad.Right:
          this.tileList.forEach((row) => row.forEach((tile) => (tile.depth = this.cameras.main.width - tile.x)));
          this.handleMove(Phaser.Math.Vector2.RIGHT);
          break;
      }
    });

    // 設置爆炸特效
    this.bombEffect = this.add
      .sprite(
        Puzzle2048Number.PosOffsetX + Puzzle2048Number.TileSize * 2,
        Puzzle2048Number.PosOffsetY + Puzzle2048Number.TileSize * 2,
        Puzzle2048String.Bomb,
      )
      .setDisplaySize(Puzzle2048Number.TileSize * 8, Puzzle2048Number.TileSize * 8)
      .setDepth(this.game.canvas.height + 1)
      .setVisible(false);
    this.bombEffect.anims.create({
      key: Puzzle2048String.Bomb,
      frames: Puzzle2048String.Bomb,
      frameRate: 16,
      hideOnComplete: true,
      showOnStart: true,
    });

    this.canMove = false;
    this.addTile();
    this.addTile();

    // 設置Dialog
    await this.setDialog();
  }

  fixedUpdate(time: number, delta: number) {
    // 更新遊戲狀態機
    this.gameFSM.update(delta);
  }
  //#endregion

  //#region 初始化 function
  /** 初始化所有Dialog顯示 */
  private async setDialog(): Promise<void> {
    // 開啟背景 Dialog
    this.backgroundDialog = UIManager.instance.openDialog(Puzzle2048BackgroundDialog, this);
    this.backgroundDialog.setDepth(Puzzle2048Depth.Background);

    // 開啟Gui Dialog
    this.guiDialog = UIManager.instance.openDialog(Puzzle2048GuiDialog, this);
    this.guiDialog.setDepth(Puzzle2048Depth.UI);
    this.guiDialog.updateScoreCount(this.scoreCount, Puzzle2048Number.TargetScore);

    // 開啟道具 Dialog
    this.itemDialog = UIManager.instance.openDialog<ItemDialog<Puzzle2048Item>>(ItemDialog, this);
    this.itemDialog.setDepth(Puzzle2048Depth.UI);
    this.itemDialog.init(
      this.itemDataList,
      { width: 60, height: 60 },
      new Phaser.Math.Vector2(this.itemDialog.width - 94, this.itemDialog.height - 48),
      Align.RightCenter,
    );
    await this.itemDialog.addItems(this.gameData.totalProps, Puzzle2048Item, this.useItem.bind(this));

    // 關閉載入場景
    UIManager.instance.closeDialog(LoadingDialog, this);
  }
  //#endregion 初始化 function

  //#region 狀態機
  /** 遊戲開場，播放遊戲動畫 */
  public async onOpeningEnter(): Promise<void> {
    // 暫停時間事件
    this.time.paused = true;
    // 暫停動畫事件
    this.tweens.pauseAll();

    // 播放開場動畫
    await this.guiDialog.showOpeningGameText();
  }

  /** 遊戲啟動 */
  public onGameEnter(): void {
    // 暫停時間事件
    this.time.paused = false;
    // 暫停動畫事件
    this.tweens.resumeAll();

    // 設置Timer計時
    this.setTimerDialog(180, Puzzle2048Depth.UI);
    // 設置TimerUI
    this.timerDialog?.layoutBackground.setVisible(false);
    this.timerDialog?.layoutTitle.setPosition(104, 30);
    this.timerDialog?.layout.container.setPosition(160, 30);
    this.timerDialog?.timeText.setColor(UIHelper.whiteString);
    this.setTimerEvent(
      () => {
        // 時間到
        this.isTimeOut = true;
      },

      // 剩餘30秒強制續命
      new Map([
        [
          30,
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
  public onGameUpdate(delta: number): void {
    /**  */
  }

  /** 當觸發續命 */
  public onReviveEnter(): void {
    // 暫停背景音樂
    this.bgm?.pause();
    this.pauseScene();
  }

  /** 續命完成
   * @param rewardProp
   */
  public async onReviveEnd(rewardProp: TotalProps[]): Promise<void> {
    // TODO: 將道具加到itemDialog

    // 播放開場動畫
    await this.guiDialog.showOpeningGameText();

    // 繼續背景音樂
    this.bgm?.resume();
    // 所有場景暫停繼續
    this.resumeScene();
  }

  /** 遊戲結束 */
  public onEndingEnter(): ContestPlayerData {
    // 設定結算資料
    const gameLog: Puzzle2048GameLog = {
      gameScore: this.scoreCount,
      gameMode: GameType.WebParkour,
      browser: navigator.userAgent,
      // 使用道具次數
      useProps: Array.from(this.usePropsMap, ([id, count]) => ({ id, count })).sort((a, b) => a.id - b.id),
    };
    return {
      hid: this.gameData.heroListData.hid,
      isSurvivor: this.scoreCount >= Puzzle2048Number.TargetScore,
      webGameLog: gameLog,
    };
  }
  //#endregion 狀態機

  //#region 遊戲邏輯
  /** 增加分數
   * @param value 增加分數
   */
  private increaseScore(value: number): void {
    this.scoreCount += value;
    this.guiDialog.updateScoreCount(this.scoreCount, Puzzle2048Number.TargetScore);
  }

  /** 使用道具
   * @param item 道具
   */
  public async useItem(item: Puzzle2048Item): Promise<void> {
    // 遊戲中才可使用
    if (this.gameFSM.isGameState === false || this.canMove === false) {
      return;
    }

    let isItemUsed = false;

    switch (item.itemData.itemFunction) {
      // 隨機加乘
      case Puzzle2048ItemFunction.MultipleRandom:
        if (this.multipleRandom(item.itemData.value)) {
          isItemUsed = true;
          item.useItem();
        }
        break;
      // 指定加乘
      case Puzzle2048ItemFunction.MultipleSelect:
        if (await this.multipleSelect(item)) {
          isItemUsed = true;
          item.useItem();
        }
        break;
      default:
        Helper.assert(ErrorId.VariableUndefined, '未定義的道具功能: ' + item.itemData.itemFunction);
        break;
    }

    // 道具使用音效
    this.sound.play(Puzzle2048String.AudioUseItem);

    // 紀錄使用道具
    if (isItemUsed) {
      const usedCount = this.usePropsMap.get(item.itemData.id);
      this.usePropsMap.set(item.itemData.id, usedCount + 1);
    }
  }

  /**
   * 隨機加乘一個Tile的值
   * @param multiplier 倍數
   * @returns 是否成功
   */
  private multipleRandom(multiplier: number): boolean {
    this.canMove = false;

    // 隨機選擇一個 tile
    const chosenTile = Phaser.Math.RND.pick(
      this.tileList
        .flat()
        .filter((tile) => tile.value !== 0 && tile.value * multiplier <= Puzzle2048Number.TileMaxValue),
    );

    if (chosenTile === undefined) {
      this.canMove = true;
      return false;
    }
    chosenTile.multiply(multiplier);

    this.canMove = true;
    return true;
  }

  /**
   * 指定加乘一個Tile的值
   * @param multiplier 倍數
   * @returns 是否成功
   */
  private async multipleSelect(item: Puzzle2048Item): Promise<boolean> {
    this.canMove = false;
    const multiplier = item.itemData.value;
    let isItemUsed = false;

    this.tileList.forEach((row) =>
      row.forEach((tile) => {
        tile.setInteractive({ useHandCursor: true }).on(
          Phaser.Input.Events.POINTER_UP,
          () => {
            if (tile.value * multiplier <= Puzzle2048Number.TileMaxValue) {
              tile.multiply(multiplier);
              isItemUsed = true;
            }

            // 取消滑鼠事件註冊
            this.tileList.forEach((inRow) =>
              inRow.forEach((inTile) => inTile.disableInteractive().off(Phaser.Input.Events.POINTER_UP)),
            );
            this.canMove = true;
          },
          this,
        );
      }),
    );

    // 道具使用中Highlight
    await this.itemDialog.setHighlightPendingUntil(
      item,
      AsyncHelper.pendingUntil(() => this.canMove === true),
    );
    return isItemUsed;
  }

  /** 新增一個tile到場景中 */
  private addTile(): void {
    const emptyTiles: Array<{ row: number; col: number }> = [];
    // 找出所有空的tile
    for (let i = 0; i < Puzzle2048Number.Row; i++) {
      for (let j = 0; j < Puzzle2048Number.Col; j++) {
        if (this.tileList[i][j].value === 0) {
          emptyTiles.push({ row: i, col: j });
        }
      }
    }

    // 隨機選擇一個空的tile
    const chosenTile = Phaser.Math.RND.pick(emptyTiles);
    // 設置tile初始值
    this.tileList[chosenTile.row][chosenTile.col].value = 2;
    this.tileList[chosenTile.row][chosenTile.col].setText('2');
    // 顯示tile
    this.tweens.add({
      targets: this.tileList[chosenTile.row][chosenTile.col],
      alpha: 1,
      duration: Puzzle2048Number.TileTweenSpeed,
      onComplete: (tween: Phaser.Tweens.Tween) => {
        this.canMove = true;
      },
    });
  }

  /**
   * 處理移動事件
   * @param delta 移動的方向
   */
  private async handleMove(delta: Phaser.Math.Vector2): Promise<void> {
    // 轉換成移動的列跟欄
    const deltaRow = delta.y;
    const deltaCol = delta.x;

    // 移動中不可再次移動
    this.canMove = false;

    // 標記是否有成功移動的標誌
    let somethingMoved = false;

    // 標記是否有成功合併的標誌
    let somethingUpgraded = false;

    // 清空移動中的 tile 數量
    this.movingTiles = 0;

    // 遍歷每個 tile
    for (let i = 0; i < Puzzle2048Number.Row; i++) {
      for (let j = 0; j < Puzzle2048Number.Col; j++) {
        // 設定觀察行和列，確保遍歷的順序正確
        const rowToWatch = deltaRow === 1 ? Puzzle2048Number.Row - 1 - i : i;
        const colToWatch = deltaCol === 1 ? Puzzle2048Number.Col - 1 - j : j;
        const value = this.tileList[rowToWatch][colToWatch].value;

        // 當前 tile 有值時處理
        if (value !== 0) {
          let colSteps = deltaCol;
          let rowSteps = deltaRow;

          // 找到可以移動到的位置
          while (
            this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) &&
            this.tileList[rowToWatch + rowSteps][colToWatch + colSteps].value === 0
          ) {
            colSteps += deltaCol;
            rowSteps += deltaRow;
          }

          // 檢查是否可以合併
          if (
            this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) &&
            this.tileList[rowToWatch + rowSteps][colToWatch + colSteps].value === value &&
            this.tileList[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade &&
            this.tileList[rowToWatch][colToWatch].canUpgrade
          ) {
            somethingUpgraded = true;
            // 合併兩個相同的 tile
            this.tileList[rowToWatch + rowSteps][colToWatch + colSteps].value = value * 2;
            this.tileList[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade = false;
            this.tileList[rowToWatch][colToWatch].value = 0;
            // 增加分數
            this.increaseScore(Math.log2(this.tileList[rowToWatch + rowSteps][colToWatch + colSteps].value));

            // 移動並合併 tile
            this.moveTile(
              this.tileList[rowToWatch][colToWatch],
              rowToWatch + rowSteps,
              colToWatch + colSteps,
              Math.abs(rowSteps + colSteps),
              true,
            );
            somethingMoved = true;
          } else {
            // 如果不能合併，將 tile 移動到新的位置
            colSteps -= deltaCol;
            rowSteps -= deltaRow;
            if (colSteps !== 0 || rowSteps !== 0) {
              this.tileList[rowToWatch + rowSteps][colToWatch + colSteps].value = value;
              this.tileList[rowToWatch][colToWatch].value = 0;
              this.moveTile(
                this.tileList[rowToWatch][colToWatch],
                rowToWatch + rowSteps,
                colToWatch + colSteps,
                Math.abs(rowSteps + colSteps),
                false,
              );
              somethingMoved = true;
            }
          }
        }
      }
    }

    // 如果有成功合併，播放音效
    if (somethingUpgraded) {
      this.sound.play(Puzzle2048String.AudioUpgrade);
    }

    // 如果沒有成功移動，允許再次嘗試移動
    if (!somethingMoved) {
      let isMovePossible = false;

      // 判斷是否還能移動
      outerLoop: for (let i = 0; i < Puzzle2048Number.Row; i++) {
        for (let j = 0; j < Puzzle2048Number.Col; j++) {
          if (this.tileList[i][j].value === 0) {
            isMovePossible = true;
            break outerLoop;
          }

          if (i < Puzzle2048Number.Row - 1 && this.tileList[i][j].value === this.tileList[i + 1][j].value) {
            isMovePossible = true;
            break outerLoop;
          }

          if (j < Puzzle2048Number.Col - 1 && this.tileList[i][j].value === this.tileList[i][j + 1].value) {
            isMovePossible = true;
            break outerLoop;
          }
        }
      }

      if (isMovePossible === false) {
        // 播放重置音效
        this.sound.play(Puzzle2048String.AudioReset);
        // 表演爆炸特效並扣除能量後重置場景
        this.bombEffect.play(Puzzle2048String.Bomb);
        await AsyncHelper.pendingUntil(() => this.bombEffect.anims.getProgress() >= 0.5);
        this.tileList.flat().forEach((tile) => tile.reset());
        await AsyncHelper.pendingUntil(() => this.bombEffect.anims.getProgress() >= 1);

        this.addTile();
        this.addTile();
      }

      this.canMove = true;
    }
  }

  /**
   * 移動 tile 到指定位置
   * @param tile 要移動的 tile
   * @param row 目標行
   * @param col 目標列
   * @param distance 移動的距離
   * @param changeNumber 是否改變 tile 的數字
   */
  private moveTile(tile: Puzzle2048Tile, row: number, col: number, distance: number, changeNumber: boolean): void {
    // 增加移動中的 tile 計數
    this.movingTiles++;

    // 使用 tweens 進行 tile 的動畫移動
    this.tweens.add({
      targets: [tile],
      x: Puzzle2048Number.PosOffsetX + col * Puzzle2048Number.TileSize + Puzzle2048Number.TileSize / 2,
      y: Puzzle2048Number.PosOffsetY + row * Puzzle2048Number.TileSize + Puzzle2048Number.TileSize / 2,
      duration: Puzzle2048Number.TileTweenSpeed * distance,
      onComplete: (tween: Phaser.Tweens.Tween) => {
        // 動畫完成時的回調函數
        this.movingTiles--;
        if (changeNumber) {
          // 如果需要改變數字，調用 transformTile 方法
          this.transformTile(tile, row, col);
        }
        if (this.movingTiles === 0) {
          // 如果沒有移動中的 tile，重置並新增 tile
          this.resetTiles();
          this.addTile();
        }
      },
    });
  }

  /**
   * 轉換 tile 的數字和顏色，並進行動畫效果
   * @param tile 要轉換的 tile，包含 sprite 和 text 屬性
   * @param row tile 所在的行
   * @param col tile 所在的列
   */
  private transformTile(tile: Puzzle2048Tile, row: number, col: number): void {
    // 增加移動中的 tile 計數
    this.movingTiles++;

    // 更新 tile 的文本顯示為新數值
    tile.setText(this.tileList[row][col].value.toString());

    // 設定 tile 的顏色
    tile.sprite.setTint(puzzle2048TileColorMap.get(this.tileList[row][col].value));

    // 使用 tweens 進行 tile 的縮放動畫
    this.tweens.add({
      targets: [tile.sprite],
      scale: 1.1,
      duration: Puzzle2048Number.TileTweenSpeed,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        // 動畫完成時的回調函數
        this.movingTiles--;
        if (this.movingTiles === 0) {
          // 如果沒有移動中的 tile，重置並新增 tile
          this.resetTiles();
          this.addTile();
        }
      },
    });
  }

  /**
   * 重置所有的 tiles 狀態和位置
   */
  private resetTiles(): void {
    // 遍歷每個 tile
    for (let i = 0; i < Puzzle2048Number.Row; i++) {
      for (let j = 0; j < Puzzle2048Number.Col; j++) {
        // 允許 tile 可以合併
        this.tileList[i][j].canUpgrade = true;

        // 重置 tile 的位置
        this.tileList[i][j].setPosition(
          Puzzle2048Number.PosOffsetX + j * Puzzle2048Number.TileSize + Puzzle2048Number.TileSize / 2,
          Puzzle2048Number.PosOffsetY + i * Puzzle2048Number.TileSize + Puzzle2048Number.TileSize / 2,
        );

        if (this.tileList[i][j].value > 0) {
          // 當前 tile 有值，顯示並更新文本
          this.tileList[i][j].alpha = 1;
          this.tileList[i][j].setText(this.tileList[i][j].value.toString());
        } else {
          // 當前 tile 無值，隱藏並重置值
          this.tileList[i][j].value = 0;
          this.tileList[i][j].alpha = 0;
        }

        // 更新 tile 的顏色
        this.tileList[i][j].sprite.setTint(puzzle2048TileColorMap.get(this.tileList[i][j].value));
      }
    }
  }

  /**
   * row、col是否超出範圍
   * @param row 行
   * @param col 列
   * @returns 是否超出範圍
   */
  private isInsideBoard(row: number, col: number): boolean {
    return row >= 0 && col >= 0 && row < Puzzle2048Number.Row && col < Puzzle2048Number.Col;
  }
  //#endregion
}
