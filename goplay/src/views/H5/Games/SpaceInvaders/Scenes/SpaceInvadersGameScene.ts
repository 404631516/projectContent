import { TotalProps, ContestPlayerData, SpaceInvadersGameData, SpaceInvadersGameLog } from '@/helper/interface/Game';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import AnswerGameFSM, { IAnswerGame, IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';
import {
  SpaceInvadersDepth,
  SpaceInvadersItemFunctionType,
  SpaceInvadersNumber,
  SpaceInvadersString,
} from '../Data/SpaceInvadersConfig';
import { BossGame } from '../../Common/PhaserGameStrategy';
import SpaceInvadersGuiDialog from '../Dialogs/SpaceInvadersGuiDialog';
import UIManager from '@/views/H5/Scripts/Manager/UIManager';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import SpaceInvadersBackgroundDialog from '../Dialogs/SpaceInvadersBackgroundDialog';
import ItemDialog from '../../UIHelper/ItemDialog';
import SpaceInvadersItem from '../Component/SpaceInvadersItem';
import { Align, CompassRad } from '@/views/H5/Helper/MathHelper';
import { GameType } from '@/helper/enum/Common';
import TableManager, { SpaceInvadersItemData, SpaceInvadersSettingData } from '@/manager/TableManager';
import { JoystickDirectionMode, VirtualJoystick } from '@/views/H5/Scripts/Components/UserInput/VirtualJoystick';
import { spaceInvadersImgUrl } from '../Data/SpaceInvadersResource';
import { SpaceInvadersGroupManager } from '../Component/Manager/SpaceInvadersGroupManager';
import { AnimationType, SpaceInvadersAnimationFactory } from '../Component/Manager/SpaceInvadersAnimationFactory';
import { SpaceInvadersEnemyManager } from '../Component/Manager/SpaceInvadersEnemyManager';
import { SpaceInvadersShip } from '../Component/SpaceInvadersShip';
import { SpaceInvadersPlayerBullet } from '../Component/Bullets/SpaceInvadersPlayerBullet';
import { SpaceInvadersEnemy } from '../Component/SpaceInvadersEnemy';
import { SpaceInvadersEnemyBullet } from '../Component/Bullets/SpaceInvadersEnemyBullet';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { SpaceInvadersPlayerBulletCircle } from '../Component/Bullets/SpaceInvadersPlayerBulletCircle';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import DefaultMap from '@/views/H5/Helper/DefaultMap';
import PhaserHelper from '@/views/H5/Helper/PhaserHelper';
import { SpaceInvadersObstacle } from '../Component/SpaceInvadersObstacle';
import UIHelper from '@/views/H5/Helper/UIHelper';

type OverlapGameObject = Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile;

export default class SpaceInvadersGameScene extends BaseGameScene implements IAnswerGame {
  /** 遊戲狀態機 */
  private gameFSM!: AnswerGameFSM;

  /** 遊戲設定 */
  public gameSetting!: SpaceInvadersSettingData;

  /** 道具資料 */
  private itemDataList!: SpaceInvadersItemData[];

  /** 遊戲資源管理器 */
  private groupManager: SpaceInvadersGroupManager;
  /** 遊戲動畫管理器 */
  private animationFactory: SpaceInvadersAnimationFactory;
  /** 敵人管理器 */
  private enemyManager: SpaceInvadersEnemyManager;
  /** 玩家 */
  public player: SpaceInvadersShip;

  /** 偵測輸入 */
  private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  /** 虛擬搖桿 */
  private virtualJoystick: VirtualJoystick;

  //#region variable
  /** 介面Dialog : 分數、生命、道具數量 */
  private guiDialog!: SpaceInvadersGuiDialog;
  /** 道具介面 */
  private itemDialog!: ItemDialog<SpaceInvadersItem>;

  /** 剩餘血量 */
  private health: number = 0;
  /** 當前遊戲時間(毫秒) */
  private currentTime: number = 0;

  /** 是否正在減慢敵人移動 的期間 */
  private isSlowDownActive: boolean = false;
  /** 是否正在減慢敵人移動 的期間 */
  public get isSlowDown(): boolean {
    return this.isSlowDownActive;
  }
  /** 減慢敵人移動的結束時間 */
  private slowDownEndTime: number = 0;

  /** 分數累計 */
  private score: number = 0;
  /** 是否到計時結束 */
  private isTimeOut: boolean = false;
  /** 是否到續命時間 */
  private isReviveTime: boolean = false;

  /** 擊殺敵人數 */
  private killCount: number = 0;
  /** 使用道具紀錄, key是道具ID, value是使用次數 */
  private usedPropsMap: DefaultMap<number, number> = new DefaultMap(() => 0);

  /** 障礙物 */
  private obstacles: SpaceInvadersObstacle[];
  /** 玩家正在碰撞障礙物的期間 */
  private hasPlayerHitObstacles: boolean = false;

  /** 判斷遊戲是否該結束 */
  public get isGameEnd(): boolean {
    return this.isTimeOut || this.health <= 0;
  }
  /** 判斷遊戲是否該續命 */
  public get isGameRevive(): boolean {
    return this.isReviveTime || this.health <= 1;
  }
  //#endregion

  constructor(private gameData: SpaceInvadersGameData, private gameWeb: IAnswerWeb, private bossGame?: BossGame) {
    super({ key: 'SpaceInvadersGameScene' });
    this.gameFSM = new AnswerGameFSM(this, gameWeb);
  }

  preload() {
    // 抓取道具靜態表
    this.itemDataList = TableManager.spaceInvadersItem.getAll();
    // 載入道具圖片
    this.itemDataList.forEach((data) => {
      this.load.image(data.nameKey, `${spaceInvadersImgUrl}/${data.url}`);
    });
    // 設置虛擬搖桿
    const canvas = this.game.canvas;
    this.virtualJoystick = new VirtualJoystick(
      this,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width,
      canvas.height,
      JoystickDirectionMode.Eight,
      true,
    );
  }

  async create() {
    // 載入遊戲設定
    const gameSetting = TableManager.spaceInvadersSetting.findOne(1);
    if (gameSetting === undefined) {
      console.error('SpaceInvadersSettingTableData 載入失敗');
      return;
    }
    this.gameSetting = gameSetting;
    // 載入遊戲波數參數;
    const waveData = TableManager.spaceInvadersWave.getAll();
    if (waveData === undefined) {
      console.error('SpaceInvadersWaveTableData 載入失敗');
      return;
    }
    // 載入敵人移動模式參數
    const enemyMovementPatternData = TableManager.spaceInvadersMovementPattern.getAll();
    if (enemyMovementPatternData === undefined) {
      console.error('SpaceInvadersWaveTableData 載入失敗');
      return;
    }
    // 載入敵人資料
    const enemyData = TableManager.spaceInvadersEnemy.getAll();
    if (enemyData === undefined) {
      console.error('SpaceInvadersEnemyTableData 載入失敗');
      return;
    }

    // 設定groupManager
    this.groupManager = new SpaceInvadersGroupManager(this);
    // 設定animationFactory
    this.animationFactory = new SpaceInvadersAnimationFactory(this);
    // 設定enemyManager
    this.enemyManager = new SpaceInvadersEnemyManager(
      this,
      this.groupManager,
      waveData,
      enemyMovementPatternData,
      enemyData,
    );
    // 設定輸入
    if (this.input.keyboard) {
      this.cursorKeys = this.input.keyboard.createCursorKeys();
    }
    // 設定player
    this.player = new SpaceInvadersShip(this, this.groupManager);
    // 設定血量
    this.health = this.gameSetting.playerDefaultHealth;
    // 設置Dialog
    await this.setDialog();
    // 設定世界範圍(飛機移動範圍)
    this.physics.world.setBounds(0, 0, this.game.canvas.width, this.game.canvas.height - 128);
    // 新增障礙物
    this.obstacles = [
      new SpaceInvadersObstacle(this),
      new SpaceInvadersObstacle(this),
      new SpaceInvadersObstacle(this),
    ];
    // 障礙物初始化
    this.obstacles.forEach((obstacle, index) => {
      obstacle.init(index);
    });
  }

  protected fixedUpdate(time: number, delta: number): void {
    // 更新遊戲狀態機
    this.gameFSM.update(delta);
    // 更新遊戲時間
    this.currentTime += delta;
  }

  /** 設定背景、Gui等Dialog */
  private async setDialog(): Promise<void> {
    // 開啟背景
    const bgDialog = UIManager.instance.openDialog(SpaceInvadersBackgroundDialog, this);
    bgDialog.setDepth(SpaceInvadersDepth.Background);

    // 開啟Gui
    this.guiDialog = UIManager.instance.openDialog(SpaceInvadersGuiDialog, this);
    this.guiDialog.setDepth(SpaceInvadersDepth.UI);
    this.guiDialog.updateScoreCount(this.score, this.gameSetting.targetScore);
    this.guiDialog.updateHealthCount(this.health);

    // 開啟道具介面
    this.itemDialog = UIManager.instance.openDialog<ItemDialog<SpaceInvadersItem>>(ItemDialog, this);
    this.itemDialog.setDepth(SpaceInvadersDepth.UI);
    this.itemDialog.init(
      this.itemDataList,
      { width: 60, height: 60 },
      new Phaser.Math.Vector2(this.itemDialog.width - 110, this.itemDialog.height - 52),
      Align.RightCenter,
    );
    await this.itemDialog.addItems(this.gameData.totalProps, SpaceInvadersItem, this.useItem.bind(this));

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
    this.setTimerDialog(SpaceInvadersNumber.TotalGameTime, SpaceInvadersDepth.UI);
    // 設置TimerUI
    this.timerDialog?.layoutBackground.setVisible(false);
    this.timerDialog?.layoutTitle.setPosition(414, this.game.canvas.height - 40);
    this.timerDialog?.layout.container.setPosition(464, this.game.canvas.height - 40);
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
          SpaceInvadersNumber.ReviveTime,
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
    // 處理輸入
    this.handleInput();
    // 玩家更新
    this.player.onUpdate(this.currentTime, delta);
    // 敵人更新
    this.enemyManager.update(this.currentTime);
    // 處理碰撞事件
    this.handleCollision();
    // 減速結束
    if (this.isSlowDown && this.currentTime >= this.slowDownEndTime) {
      this.setEnemiesTimeScale(1);
      this.isSlowDownActive = false;
    }
    // 障礙物更新
    this.obstacles.forEach((obstacle) => {
      obstacle.update(delta);
    });
  }

  /**
   * 碰撞事件處理
   */
  private handleCollision(): void {
    // 玩家子彈擊中敵人
    this.physics.overlap(
      this.groupManager.playerBullets,
      this.enemyManager.enemies,
      this.onBulletHitEnemies,
      undefined,
      this,
    );
    // 玩家圓形爆炸子彈擊中敵人
    this.physics.overlap(
      this.groupManager.playerBulletCircles,
      this.enemyManager.enemies,
      this.onBulletCircleHitEnemies,
      undefined,
      this,
    );
    // 敵人子彈擊中玩家
    this.physics.overlap(this.groupManager.enemyBullets, this.player, this.onEnemyBulletHitPlayer, undefined, this);
    // 敵人撞到玩家
    this.physics.overlap(this.enemyManager.enemies, this.player, this.onEnemyHitPlayer, undefined, this);
    // 玩家子彈擊中障礙物
    this.physics.overlap(this.groupManager.playerBullets, this.obstacles, this.onBulletHitObstacles, undefined, this);
    // 玩家圓形爆炸子彈擊中障礙物
    this.physics.overlap(
      this.groupManager.playerBulletCircles,
      this.obstacles,
      this.onBulletCircleHitObstacles,
      undefined,
      this,
    );
    // 玩家撞到障礙物
    if (this.physics.overlap(this.obstacles, this.player, this.onPlayerHitObstacles, undefined, this) === false) {
      this.hasPlayerHitObstacles = false;
    }
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
    await this.itemDialog.addItems(rewardProp, SpaceInvadersItem, this.useItem.bind(this));
    // 血量+1
    this.updateHealth(1);
    // 播放開場動畫
    await this.guiDialog.showOpeningGameText();
    // 繼續背景音樂
    this.bgm?.resume();
    // 所有場景暫停繼續
    this.resumeScene();
  }

  /** 結束遊戲 */
  public onEndingEnter(): ContestPlayerData {
    // 停止虛擬搖桿
    this.virtualJoystick.stopDrag();

    // 設定結算資料
    const gameLog: SpaceInvadersGameLog = {
      gameScore: this.score,
      gameMode: GameType.WebSpaceInvaders,
      browser: navigator.userAgent,
      killCount: this.killCount,
      // 使用道具次數
      useProps: Array.from(this.usedPropsMap, ([id, count]) => ({ id, count })).sort((a, b) => a.id - b.id),
    };
    // 回傳結算資料
    return {
      hid: this.gameData.heroListData.hid,
      isSurvivor: this.score >= this.gameSetting.targetScore,
      webGameLog: gameLog,
    };
  }
  //#endregion 狀態機

  /** 處理使用者輸入 */
  private handleInput(): void {
    // 預設停止
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setVelocity(0);
    // 取得方向鍵輸入
    const cursorKeyDirection = PhaserHelper.getCursorKeyDirectionRad(this.cursorKeys);
    if (cursorKeyDirection !== CompassRad.None) {
      playerBody.velocity = this.physics.velocityFromRotation(cursorKeyDirection, this.gameSetting.playerVelocity);
      return;
    }
    // 取得虛擬搖桿輸入
    const joystickDirection = this.virtualJoystick.getDirection();
    if (joystickDirection !== CompassRad.None) {
      playerBody.velocity = this.physics.velocityFromRotation(joystickDirection, this.gameSetting.playerVelocity);
      return;
    }
  }

  /** 更新分數 */
  private updateScore(score: number): void {
    // 增/減分數並確保分數不低於0
    this.score = Math.max(this.score + score, 0);
    // 更新分數
    this.guiDialog.updateScoreCount(this.score, this.gameSetting.targetScore);
  }

  /**
   * 更新血量
   * @param healthChange 血量變化
   */
  private updateHealth(healthChange: number): void {
    this.health += healthChange;
    // 更新血量UI
    this.guiDialog.updateHealthCount(this.health);
  }

  //#region 碰撞事件處理
  /**
   * 玩家子彈擊中敵人
   * @param bullet 玩家子彈
   * @param enemy 被擊中的敵人
   */
  private onBulletHitEnemies(bullet: OverlapGameObject, enemy: OverlapGameObject): void {
    (bullet as SpaceInvadersPlayerBullet).kill();
    // 是否消滅敵人
    const isEnemyDestroyed = (enemy as SpaceInvadersEnemy).onHit(1);
    // 若成功消滅敵人
    if (isEnemyDestroyed) {
      this.killCount++;
      // 更新分數
      this.updateScore(this.gameSetting.scorePerEnemy);
    }
  }

  /**
   * 玩家圓形爆炸子彈擊中敵人
   * @param circleBulletGO 玩家圓形爆炸子彈
   * @param enemy 被擊中的敵人
   */
  private onBulletCircleHitEnemies(circleBulletGO: OverlapGameObject, enemy: OverlapGameObject): void {
    const circleBullet = circleBulletGO as SpaceInvadersPlayerBulletCircle;
    // 消滅圓形子彈, 由圓形子彈的kill()觸發圓形爆炸
    circleBullet.kill();
  }

  /**
   * 敵人子彈擊中玩家
   * @param ship 玩家
   * @param enemyBullet 敵人子彈
   */
  private onEnemyBulletHitPlayer(ship: OverlapGameObject, enemyBullet: OverlapGameObject): void {
    // 消滅子彈
    (enemyBullet as SpaceInvadersEnemyBullet).kill();
    // player檢查是否受傷
    const isHurt = this.player.onHit(this.currentTime);
    if (isHurt === false) {
      return;
    }
    // 扣血
    this.updateHealth(-1);
  }

  /**
   * 敵人撞到玩家
   * @param player 玩家
   * @param enemy 敵人
   */
  private onEnemyHitPlayer(player: OverlapGameObject, enemy: OverlapGameObject): void {
    // 是否消滅敵人
    const isEnemyDestroyed = (enemy as SpaceInvadersEnemy).onHit(0, true);
    // 若成功消滅敵人
    if (isEnemyDestroyed) {
      this.killCount++;
      // 加分
      this.updateScore(this.gameSetting.scorePerEnemy);
    }
    // player檢查是否受傷
    const isHurt = this.player.onHit(this.currentTime);
    if (isHurt) {
      // 扣血
      this.updateHealth(-1);
    }
  }

  /**
   * 玩家子彈擊中障礙物
   * @param bullet 玩家子彈
   * @param obstacle 障礙物
   */
  private onBulletHitObstacles(obstacle: OverlapGameObject, bullet: OverlapGameObject): void {
    (bullet as SpaceInvadersPlayerBullet).kill();
  }

  /**
   * 玩家圓形爆炸子彈擊中障礙物
   * @param circleBulletGO 玩家圓形爆炸子彈
   * @param obstacle 障礙物
   */
  private onBulletCircleHitObstacles(obstacle: OverlapGameObject, circleBulletGO: OverlapGameObject): void {
    (circleBulletGO as SpaceInvadersPlayerBulletCircle).kill();
  }

  /**
   * 玩家撞到障礙物
   * @param player 玩家
   * @param obstacle 障礙物
   */
  private onPlayerHitObstacles(player: OverlapGameObject, obstacle: OverlapGameObject): void {
    if (this.hasPlayerHitObstacles) {
      return;
    }
    this.hasPlayerHitObstacles = true;
    // player檢查是否受傷
    const isHurt = this.player.onHit(this.currentTime);
    if (isHurt) {
      // 扣血
      this.updateHealth(-1);
    }
  }
  //#endregion

  //#region 操控
  /** 使用道具
   * @param item 道具
   */
  public useItem(item: SpaceInvadersItem): void {
    // 遊戲中才可使用
    if (this.gameFSM.isGameState === false) {
      return;
    }

    // 使用道具後扣除道具數量
    if (item.useItem() === false) {
      return;
    }

    // 觸發道具效果
    const functionType = item.itemData.functionType;
    // 預設鎖上道具1秒
    let itemLockSecs = 1;
    let itemLockPendingFunc: Promise<void> = AsyncHelper.sleep(1);
    switch (functionType) {
      case SpaceInvadersItemFunctionType.ExplodeFullScreen:
        // 消滅全部敵人及子彈
        this.explodeFullScreen();
        break;
      case SpaceInvadersItemFunctionType.ExplodeLine:
        // 消滅直線範圍內的敵人及子彈
        this.explodeLine();
        break;
      case SpaceInvadersItemFunctionType.ExplodeCircle:
        // 玩家發射圓形爆炸子彈
        this.player.shootBulletCircle();
        break;
      case SpaceInvadersItemFunctionType.SlowDownEnemies:
        // 所有敵人及敵人子彈速度減半, 持續x秒
        this.slowDown(this.gameSetting.slowDownEnemiesSeconds);
        // 設定鎖道具時間
        itemLockSecs = this.gameSetting.slowDownEnemiesSeconds;
        itemLockPendingFunc = AsyncHelper.pendingUntil(() => this.isSlowDown === false);
        break;
      case SpaceInvadersItemFunctionType.Invincible:
        // 玩家無敵x秒
        const invincibleTime = this.gameSetting.invincibleTimeUseItem;
        this.player.setInvincible(this.currentTime, invincibleTime);
        itemLockSecs = invincibleTime;
        itemLockPendingFunc = AsyncHelper.sleep(invincibleTime);
        // 播放音效
        this.sound.play(SpaceInvadersString.AudioInvincible);
        break;
      default:
        Helper.assert(ErrorId.VariableUndefined, '未定義的道具效果:' + functionType);
        break;
    }

    // 鎖住道具操作x秒
    this.itemDialog.setCountDownPendingUntil(item, itemLockSecs, itemLockPendingFunc);

    // 紀錄使用道具
    const usedCount = this.usedPropsMap.get(item.itemData.id);
    this.usedPropsMap.set(item.itemData.id, usedCount + 1);
  }
  //#endregion

  //#region 敵人速度設定
  /** 敵人速度減半
   * @param seconds 持續秒數
   */
  private slowDown(seconds: number): void {
    // 敵人速度減半
    this.setEnemiesTimeScale(this.gameSetting.slowDownTimeScale);
    // 設定狀態
    this.isSlowDownActive = true;
    // 設定結束時間
    this.slowDownEndTime = this.currentTime + seconds * 1000;
    // 播放特效
    const anim = this.groupManager.animSlowDownEnemies.get();
    if (anim) {
      // 特效數值調整
      anim.setActive(true);
      anim.setScale(0.5);
      anim.alpha = 0.5;
      anim.setPosition(this.game.canvas.width / 2, this.game.canvas.height / 2);
      anim.play(AnimationType.SlowDownEnemies);
      anim.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        anim.setActive(false);
      });
      // 播放音效
      this.sound.play(SpaceInvadersString.AudioSlowDown);
    }
  }

  /** 設定敵人移動速度 & 敵人子彈速度
   * @param timeScale 時間縮放倍率
   */
  private setEnemiesTimeScale(timeScale: number): void {
    // 更改敵人移動速度
    this.enemyManager.enemies.children.iterate((enemy) => {
      (enemy as SpaceInvadersEnemy).setMovingTimeScale(timeScale);
      return true;
    });
    // 更改敵人子彈速度
    this.groupManager.enemyBullets.children.iterate((bullet) => {
      (bullet as SpaceInvadersEnemyBullet).setMovingTimeScale(timeScale);
      return true;
    });
  }
  //#endregion

  //#region 範圍攻擊偵測及處理
  /** 消滅圓形範圍內的敵人及子彈
   * @param centerX
   * @param centerY
   */
  public explodeCircle(centerX: number, centerY: number): void {
    const explodeRange = this.gameSetting.circleExplodeRange;
    // 清除所有在圓形範圍內的子彈
    this.groupManager.clearRangeEnemyBullets(
      (bullet) => Phaser.Math.Distance.Between(bullet.x, bullet.y, centerX, centerY) <= explodeRange,
    );
    // 清除所有在圓形範圍內的敵人
    const killCount = this.enemyManager.killRangeEnemies(
      (enemy) => Phaser.Math.Distance.Between(enemy.x, enemy.y, centerX, centerY) <= explodeRange && enemy.isInScene(),
      1,
    );
    this.killCount += killCount;
    // 加分
    this.updateScore(this.gameSetting.scorePerEnemy * killCount);
    // 播放爆炸特效
    const explosion = this.groupManager.animCircle.get();
    if (explosion) {
      explosion.setActive(true);
      explosion.setScale(2);
      explosion.setPosition(centerX, centerY);
      explosion.play(AnimationType.CircleExplode);
      explosion.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        explosion.setActive(false);
      });
    }
    // 播放音效
    this.sound.play(SpaceInvadersString.AudioExplodeCircle);
  }

  /** 消滅直線範圍內的敵人及子彈 */
  private explodeLine(): void {
    // 清除所有在主角前方長方形範圍內的子彈
    this.groupManager.clearRangeEnemyBullets((bullet) => this.isWithinLineRange(bullet));
    // 清除所有在主角前方長方形範圍內的敵人
    const killCount = this.enemyManager.killRangeEnemies((enemy) => this.isWithinLineRange(enemy) && enemy.y > 0, 1);
    this.killCount += killCount;
    // 加分
    this.updateScore(this.gameSetting.scorePerEnemy * killCount);
    // 播放爆炸特效
    const explosion = this.groupManager.animLine.get();
    if (explosion) {
      explosion.setActive(true);
      explosion.setPosition(this.player.x, this.player.y - this.game.canvas.height / 2);
      explosion.play(AnimationType.LineExplode);
      explosion.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        explosion.setActive(false);
      });
    }
    // 播放音效
    this.sound.play(SpaceInvadersString.AudioExplodeLine);
  }

  /**
   * 判斷物件是否在直線攻擊範圍內
   * @param obj
   */
  private isWithinLineRange(obj: { x: number; y: number }): boolean {
    const lineExplodeWidthHalf = this.gameSetting.lineExplodeWidth / 2;
    // 玩家上方, 左右各lineExplodeWidth寬度
    return (
      obj.x > this.player.x - lineExplodeWidthHalf &&
      obj.x < this.player.x + lineExplodeWidthHalf &&
      obj.y < this.player.y
    );
  }

  /** 消滅全部敵人 */
  private explodeFullScreen(): void {
    // 清除所有敵人子彈
    this.groupManager.enemyBullets.clear(true, true);
    // 摧毀所有場內敵人
    const killCount = this.enemyManager.killRangeEnemies((enemy) => enemy.isInScene(), 0, true);
    this.killCount += killCount;
    // 加分
    this.updateScore(this.gameSetting.scorePerEnemy * killCount);
    // 播放全畫面爆炸特效
    const explosion = this.groupManager.animFullScreen.get();
    if (explosion) {
      // 特效數值調整
      explosion.setActive(true);
      explosion.setScale(2);
      explosion.setDepth(SpaceInvadersDepth.UI);
      explosion.setPosition(this.game.canvas.width / 2, this.game.canvas.height / 2);
      explosion.play(AnimationType.FullScreenExplode);
      explosion.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        explosion.setActive(false);
      });
    }
    // 播放音效
    this.sound.play(SpaceInvadersString.AudioExplodeFullScreen);
  }
  //#endregion
}
