import TableManager from '@/manager/TableManager';
import { ShootString } from '../Data/ShooterConfig';
import { shooterImgUrl } from '../Data/ShooterResource';
import UIManager from '../../../Scripts/Manager/UIManager';
import ShootCannonDialog from '../Dialogs/ShootCannonDialog';
import ShootTargetsDialog from '../Dialogs/ShootTargetsDialog';
import ShootMenuDialog from '../Dialogs/ShootMenuDialog';
import InfoBox from '../../../Scripts/Components/InfoBox';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import SoundPool from '../../Common/SoundPool';
import { ShooterGameLog, TotalProps, ContestPlayerData, ShooterGameData } from '@/helper/interface/Game';
import { GameType } from '@/helper/enum/Common';
import { HeroListData } from '@/helper/interface/Hero';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import ShootBackgroundDialog from '../Dialogs/ShootBackgroundDialog';
import AnswerGameFSM, { IAnswerGame, IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';
import { BossGame } from '../../Common/PhaserGameStrategy';
import ItemDialog from '../../UIHelper/ItemDialog';
import ShootBombOption from '../Components/ShootBombOption';
import { Align } from '@/views/H5/Helper/MathHelper';
import ShootBomb from '../Components/ShootBomb';
import ShootTarget from '../Components/ShootTarget';
import Object2D from '@/views/H5/Scripts/Components/Object2D';

type OverlapGameobject = Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile;

export default class ShooterGameScene extends BaseGameScene implements IAnswerGame {
  /** singleton */
  private static _instance: ShooterGameScene;
  public static get instance(): ShooterGameScene {
    return this._instance;
  }

  /** 遊戲狀態機 */
  private gameFSM!: AnswerGameFSM;

  /** 顯示砲彈選項 */
  public itemDialog!: ItemDialog<ShootBombOption>;

  /** 放置射擊目標以及平台、顯示目標總血量的Dialog */
  private targetsDialog!: ShootTargetsDialog;
  /** 砲台畫面 */
  private cannonDialog!: ShootCannonDialog;

  /** 爆炸效果 */
  public explosionParticleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  /** 音效 */
  private onHitSoundPool!: SoundPool;
  private onShootSoundPool!: SoundPool;

  /** 是否到計時結束 */
  private isTimeOut: boolean = false;
  /** 是否到續命時間 */
  private isReviveTime: boolean = false;

  /** 出戰英雄資料 */
  private heroListData!: HeroListData;

  /** 當前所選砲彈 */
  private currentBombItem?: ShootBombOption;
  /** 砲彈總數 */
  private totalBombCount: number = 0;

  /** 砲彈物件池 */
  private bombPool!: Phaser.GameObjects.Group;
  /** 砲彈Index(用以避免重複攻擊) */
  private bombIndex: number = 0;

  /** 檢查遊戲是否結束
   * @returns true = 結束
   */
  public get isGameEnd(): boolean {
    return this.totalBombCount <= 0 || this.isTimeOut;
  }
  /** 判斷遊戲是否該續命 */
  public get isGameRevive(): boolean {
    return this.isGameEnd || this.isReviveTime;
  }

  constructor(private gameData: ShooterGameData, private gameWeb: IAnswerWeb, private bossGame?: BossGame) {
    super({ key: 'ShootGameScene' });
    ShooterGameScene._instance = this;
    this.gameFSM = new AnswerGameFSM(this, gameWeb);
  }

  preload() {
    // 開啟loading dialog
    UIManager.instance.openDialog(LoadingDialog, this);

    TableManager.shootBomb.getAll().forEach((data) => {
      this.load.image(data.nameKey, `${shooterImgUrl}/${data.url}`);
      this.load.spritesheet(data.sprite, `${shooterImgUrl}/${data.url}`, {
        frameHeight: data.height,
        frameWidth: data.width,
      });
    });

    // 設定音效
    this.onHitSoundPool = new SoundPool(this, ShootString.OnHitSound);
    this.onShootSoundPool = new SoundPool(this, ShootString.OnShootSound);
  }

  async create() {
    // 背景
    UIManager.instance.openDialog(ShootBackgroundDialog, this);
    // 目標初始化
    this.targetsDialog = UIManager.instance.openDialog(ShootTargetsDialog, this);
    // 射擊台初始化
    this.cannonDialog = UIManager.instance.openDialog(ShootCannonDialog, this);
    // 選單初始化
    UIManager.instance.openDialog(ShootMenuDialog, this);
    // 道具介面初始化
    this.itemDialog = UIManager.instance.openDialog<ItemDialog<ShootBombOption>>(ItemDialog, this);
    this.itemDialog.init(
      TableManager.shootBomb.getAll(),
      { width: 60, height: 60 },
      new Phaser.Math.Vector2(this.itemDialog.width * 0.4, this.itemDialog.height * 0.88),
      Align.Center
    );

    // 倒數計時初始化
    this.setTimerDialog(180, 0);
    this.setTimerEvent(
      () => {
        this.isTimeOut = true;
      },
      new Map([
        // 剩餘30秒強制續命
        [
          30,
          () => {
            this.isReviveTime = true;
          },
        ],
      ])
    );

    // 防呆, 沒有道具則結束遊戲
    if (this.gameData.totalProps.length === 0) {
      await InfoBox.defaultMessage([this], '沒有任何砲彈道具');
      this.scene.stop();
      return;
    }

    // 計算初始砲彈數量
    this.gameData.totalProps.forEach((prop: TotalProps) => {
      this.totalBombCount += prop.count;
    });
    // 設定砲彈道具
    await this.itemDialog.addItems(this.gameData.totalProps, ShootBombOption, this.useItem.bind(this));

    // 設置英雄
    this.heroListData = this.gameData.heroListData;
    this.cannonDialog.setHero(this.heroListData.heroId);

    // 設置砲彈物件池
    this.bombPool = this.physics.add.group({
      classType: ShootBomb,
    });
    // 取得目標物並與砲彈物件池建立overlap事件
    this.physics.add.overlap(
      this.targetsDialog.targets,
      this.bombPool,
      (obj1: OverlapGameobject, obj2: OverlapGameobject) => {
        const target = obj1 as ShootTarget;
        const bomb = obj2 as ShootBomb;
        target.getDamage(bomb);
      }
    );

    // 設置爆炸特效
    this.explosionParticleEmitter = this.add.particles(0, 0, 'explosion', {
      emitting: false,
      alpha: { start: 0.4, end: 0 },
      scale: { start: 1.5, end: 0.4 },
      speed: 10,
      accelerationY: -20,
      angle: { min: -180, max: 180 },
      rotate: { min: -180, max: 180 },
      lifespan: { min: 1000, max: 3000 },
      blendMode: Phaser.BlendModes.NORMAL,
      frequency: 100,
    });

    // 關閉loading dialog
    UIManager.instance.closeDialog(LoadingDialog, this);
  }

  fixedUpdate(time: number, delta: number) {
    // 更新遊戲狀態機
    this.gameFSM.update(delta);
  }

  /** 使用道具
   * @param item 砲彈道具
   */
  public useItem(item: ShootBombOption): void {
    // 不在遊戲狀態不給使用(防呆續命失敗會按到按鈕的問題)
    if (this.gameFSM.isGameState === false) {
      return;
    }

    // 設定點擊的炸彈
    this.currentBombItem = item;
    // 通知ShootMenuDialog設置high light
    this.itemDialog.setOnlyHighlight(item);
  }

  //#region 狀態機
  /** 遊戲開場，播放遊戲動畫 */
  public async onOpeningEnter(): Promise<void> {
    // 射擊沒有開場表演
  }

  /** 遊戲啟動 */
  public onGameEnter(): void {
    // 射擊沒有啟動需要做的事
  }

  /** 遊戲進行中update
   * @param delta
   */
  public onGameUpdate(delta: number): void {
    // 射擊沒有進行中的update需要做的事
  }

  /** 當觸發續命 */
  public onReviveEnter(): void {
    // 停止選擇任何炸彈
    this.currentBombItem = undefined;
    // 通知ShootMenuDialog設置high light
    this.itemDialog.setAllHighlight(false);
    // 暫停背景音樂
    this.bgm?.pause();
    // 暫停場景
    this.pauseScene();
  }

  /** 續命完成
   * @param rewardProp
   */
  public async onReviveEnd(rewardProp: TotalProps[]): Promise<void> {
    // 更新總砲彈數量
    rewardProp.forEach((prop: TotalProps) => {
      this.totalBombCount += prop.count;
    });
    // 獲得道具獎勵
    await this.itemDialog.addItems(rewardProp, ShootBombOption, this.useItem.bind(this));

    // 恢復背景音樂
    this.bgm?.resume();
    // 所有場景暫停繼續
    this.resumeScene();
  }

  /** 遊戲結束 */
  public onEndingEnter(): ContestPlayerData {
    // 得分
    const shooterGameScore = this.targetsDialog.score;

    // 紀錄遊戲結果
    const gameLog: ShooterGameLog = {
      gameScore: shooterGameScore,
      gameMode: GameType.WebShooter,
      browser: navigator.userAgent,
      shootHp: shooterGameScore,
    };
    return {
      hid: this.gameData.heroListData.hid,
      isSurvivor: this.targetsDialog.goal,
      webGameLog: gameLog,
    };
  }
  //#endregion

  /** 發射砲彈
   * @param barrel 槍管(取位置及角度)
   */
  public shoot(barrel: Object2D): void {
    // 防呆續命失敗會按到按鈕的問題
    if (this.gameFSM.isGameState === false) {
      return;
    }

    // 檢查所選子彈類型
    if (this.currentBombItem === undefined) {
      InfoBox.warn([this], '尚未選擇子彈類型');
      return;
    }

    // 檢查剩餘子彈數
    if (this.currentBombItem.isLackItem) {
      InfoBox.warn([this], '沒有子彈囉');
      // 取消選擇子彈
      this.currentBombItem = undefined;
      this.itemDialog.setAllHighlight(false);
      return;
    }

    // 發射砲彈
    this.bombPool.get(barrel.x, barrel.y)?.shoot(this.currentBombItem.itemData, this.bombIndex++, barrel.angle);

    // 發射音效
    this.onShootSoundPool.play();
    // 通知魔王表演
    this.bossGame?.onAttackBoss();

    // 通知UI update, 砲彈數量減一
    this.currentBombItem.useItem();
  }

  /** 砲彈射擊完成 */
  public bombShootComplete(): void {
    // 更新砲彈總數
    this.totalBombCount -= 1;
  }

  /** 播放爆炸特效 */
  public playExploreEffect(x: number, y: number): void {
    // 音效
    this.onHitSoundPool.play();
    // 粒子特效
    this.explosionParticleEmitter?.explode(2, x, y);
  }
}
