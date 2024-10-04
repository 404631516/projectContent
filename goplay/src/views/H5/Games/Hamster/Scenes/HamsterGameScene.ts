import TableManager from '@/manager/TableManager';
import { HamsterString, HamsterNumber } from '../Data/HamsterConfig';
import { hamsterImgUrl } from '../Data/HamsterResource';
import UIManager from '../../../Scripts/Manager/UIManager';
import HamsterHolesDialog from '../Dialogs/HamsterHolesDialog';
import HamsterMainDialog from '../Dialogs/HamsterMainDialog';
import InfoBox from '../../../Scripts/Components/InfoBox';
import HamsterHeroDialog from '../Dialogs/HamsterHeroDialog';
import { HamsterStateData, HamsterData } from '@/manager/TableManager';
import HamsterAttack from '../Components/HamsterAttack';
import Hamster from '../Components/Hamster';
import FadeText from '../Components/FadeText';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import SoundPool from '../../Common/SoundPool';
import { TotalProps, HamsterGameLog, HamsterGameData, ContestPlayerData } from '@/helper/interface/Game';
import { GameType } from '@/helper/enum/Common';
import { HeroListData } from '@/helper/interface/Hero';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import HamsterBackgroundDialog from '../Dialogs/HamsterBackgroundDialog';
import AnswerGameFSM, { IAnswerGame, IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';
import { randomRange, clamp, randomNumber } from '@/views/H5/Helper/MathHelper';
import { BossGame } from '../../Common/PhaserGameStrategy';

/** 地鼠類別 */
export enum HamsterType {
  None = 0,
  Normal = 1, // 一般地鼠
  Rare = 2, // 稀有地鼠, 與一般地鼠只差在出場的分類不同
  Enemy = 3, // 不可攻擊地鼠
}

/** 地鼠波次資料 */
interface HamsterEvent {
  /** 地鼠資料 */
  hamsters: HamsterData[];
  /** 跟上次波次的間隔 */
  intervalTime: number;
}

export default class HamsterGameScene extends BaseGameScene implements IAnswerGame {
  /** singleton */
  private static _instance: HamsterGameScene;
  public static get instance(): HamsterGameScene {
    return this._instance;
  }

  /** 遊戲狀態機 */
  private gameFSM!: AnswerGameFSM;

  /** 各階段的資料 */
  private states: HamsterStateData[] = [];

  /** 地鼠靜態資料表 */
  private hamsterMap: Map<number, HamsterData[]> = new Map();

  /** 目前階段的所有地鼠出現時間事件 */
  private hamsterEventList: HamsterEvent[] = [];

  /** 攻擊物件池 */
  private attackPool!: Phaser.GameObjects.Group;
  /** 文字特效物件池 */
  private fadeTextPool: FadeText[] = [];

  /** 音效 */
  private onHitHamsterSoundPool!: SoundPool;
  private onHamsterAttackSoundPool!: SoundPool;

  /** 出戰英雄 */
  private heroListData!: HeroListData;

  /** 顯示道具清單、時間條、分數的Dialog */
  private mainDialog!: HamsterMainDialog;
  /** 地鼠洞及地鼠動畫顯示的Dialog */
  private holeDialog!: HamsterHolesDialog;
  /** 顯示英雄的Dialog */
  private heroDialog!: HamsterHeroDialog;

  /** 觸發續命題魔力值 */
  private readonly reviveEnergy: number = 250;

  /** 當前魔力 */
  private currentEnergy: number = 0;
  /** 每秒update計時 */
  private secondTimer: number = 0;
  /** 地鼠出現倒數 */
  private hamsterTimer: number = 0;
  /** 全部地鼠波次完畢 */
  private isHamsterOver: boolean = false;
  /** 是否到計時結束 */
  private isTimeOut: boolean = false;
  /** 是否到續命時間 */
  private isReviveTime: boolean = false;

  /** 檢查遊戲是否結束
   * @returns true = 結束
   */
  public get isGameEnd(): boolean {
    return this.currentEnergy <= 0 || this.isHamsterOver || this.isTimeOut;
  }
  /** 判斷遊戲是否該續命 */
  public get isGameRevive(): boolean {
    return this.currentEnergy <= this.reviveEnergy || this.isReviveTime;
  }

  constructor(private gameData: HamsterGameData, private gameWeb: IAnswerWeb, private bossGame?: BossGame) {
    super({ key: 'HamsterGameScene' });
    HamsterGameScene._instance = this;
    this.gameFSM = new AnswerGameFSM(this, gameWeb);
  }

  preload() {
    // 開啟loading dialog
    UIManager.instance.openDialog(LoadingDialog, this);

    // 取得狀態資料
    this.states = TableManager.hamsterState.getAll();
    if (this.states.length <= 0) {
      InfoBox.error([this], '遊戲資料匯入錯誤: state data are empty');
      return;
    }

    // 依照流水號排序狀態階段
    this.states.sort((a: HamsterStateData, b: HamsterStateData) => {
      return a.id - b.id;
    });

    // 建立地鼠靜態資料的查表
    TableManager.hamster.getAll().forEach((hamsterData) => {
      const hamsterDataList = this.hamsterMap.get(hamsterData.type);
      // 某種類地鼠第一隻
      if (hamsterDataList === undefined) {
        this.hamsterMap.set(hamsterData.type, [hamsterData]);
      }
      // 後續的地鼠資料
      else {
        hamsterDataList.push(hamsterData);
      }
    });

    // 匯入地鼠圖片
    TableManager.hamsterDisplay.getAll().forEach((data) => {
      this.load.image(data.nameKey, `${hamsterImgUrl}/${data.url}`);
      this.load.image(data.dieNameKey, `${hamsterImgUrl}/${data.dieUrl}`);
    });
    // TODO 地鼠裝備功能目前無用, 註解之, 以免讀不到對應圖片報錯
    // // 匯入地鼠裝備圖片
    // TableManager.hamsterEquip.getAll().forEach(data => {
    //     this.load.image(data.nameKey, `${hamsterImgUrl}/${data.url}`);
    // });
    // 匯入地鼠攻擊圖示
    TableManager.hamsterAttack.getAll().forEach((data) => {
      this.load.image(data.nameKey, `${hamsterImgUrl}/${data.url}`);
    });
    // 匯入防禦地鼠道具圖示
    TableManager.hamsterDefense.getAll().forEach((data) => {
      this.load.image(data.nameKey, `${hamsterImgUrl}/shop/${data.url}`);
    });
    // 匯入攻擊地鼠道具圖片
    TableManager.hamsterHit.getAll().forEach((data) => {
      this.load.image(data.nameKey, `${hamsterImgUrl}/shop/${data.url}`);
    });

    // 設定音效
    this.onHitHamsterSoundPool = new SoundPool(this, HamsterString.OnHitHamsterSound);
    this.onHamsterAttackSoundPool = new SoundPool(this, HamsterString.OnHamsterAttackSound);
  }

  create() {
    // 依照render順序生成
    UIManager.instance.openDialog(HamsterBackgroundDialog, this);
    this.holeDialog = UIManager.instance.openDialog(HamsterHolesDialog, this);
    this.heroDialog = UIManager.instance.openDialog(HamsterHeroDialog, this);
    this.mainDialog = UIManager.instance.openDialog(HamsterMainDialog, this);
    // 建立攻擊物件池, render順序在heroDialog之後
    this.attackPool = this.physics.add.group({
      classType: HamsterAttack,
      runChildUpdate: false,
      allowGravity: true,
    });
    // 設置TimerDialog並設定TimerEvent
    this.setTimerDialog(HamsterNumber.GameSec, 0);
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

    // 顯示英雄
    this.heroListData = this.gameData.heroListData;
    const heroData = TableManager.hero.findOne(this.heroListData.heroId);
    if (heroData === undefined) {
      console.error(`無法取得heroData ${this.heroListData.heroId}`);
      this.scene.stop();
      return;
    }
    this.heroDialog.setHero(heroData, this.heroListData.level);

    // 設定防禦道具
    this.gameData.totalProps.defense.forEach((item) => {
      this.mainDialog.addDefenseItem(item.id, item.count);
    });
    // 設定攻擊道具
    this.gameData.totalProps.attack.forEach((item) => {
      this.mainDialog.addHitItem(item.id, item.count);
    });

    // 建立地鼠消失的事件
    this.holeDialog.setDisappearHurtEvent((hamster: Hamster) => {
      if (hamster.hamsterData.type !== HamsterType.Enemy) {
        this.onAddEnergy(HamsterNumber.DisappearHurt);
        this.getFadeText().fadeUp(`${HamsterNumber.DisappearHurt}`, '#EF2A19', hamster.x + 50, hamster.y - 50);
      }
    });

    // 建立地鼠死亡事件
    this.holeDialog.setDieEvent((hamster: Hamster) => {
      // 顯示加分或扣分的特效
      const fadeText = this.getFadeText();

      // 根據攻擊的地鼠加分或扣分
      if (hamster.hamsterData.type === HamsterType.Enemy) {
        this.onAddEnergy(HamsterNumber.ErrHurt);
        fadeText.fadeUp(`${HamsterNumber.ErrHurt}`, '#EF2A19', hamster.x + 50, hamster.y - 50);
      } else {
        this.onAddEnergy(HamsterNumber.KillBonus);
        this.mainDialog.addKillCount(1);
        fadeText.fadeUp(`+${HamsterNumber.KillBonus}`, '#21FD1A', hamster.x + 50, hamster.y - 50);
      }
    });

    // 建立地鼠攻擊的回呼
    this.holeDialog.setAttackEvent((data: HamsterData) => {
      // 進行防禦, 確認是否持有對應防禦道具,
      // 若有對應防禦道具就扣除道具數量, 否則視作防禦失敗
      const isDefenseSuccess = this.mainDialog.tryUseDefenseItem(data.defenseId);
      if (isDefenseSuccess === false) {
        // 攻擊後扣除能量
        this.onAddEnergy(HamsterNumber.AttackHurt);
        // 顯示扣除的特效
        this.getFadeText().fadeUp(`${HamsterNumber.AttackHurt}`, '#EF2A19', 100, this.heroDialog.height - 200);
        // 播放音效
        this.onHamsterAttackSoundPool.play();
      }

      // 不論防禦成功或失敗, 都表演英雄受傷動畫
      // TODO 防禦成功跟失敗做不一樣的表演, 包進if(isDefenseSuccess)裡面
      this.heroDialog.playDamage();
    }, this.heroDialog.heroImg);

    // 建立點擊地鼠
    this.holeDialog.setHitEvent((hamster: Hamster) => {
      return this.mainDialog.tryUseHitItem(hamster.currentHp);
    });

    // 設定初始魔力值
    this.onAddEnergy(HamsterNumber.BaseEnergy);

    // 關閉loading dialog
    UIManager.instance.closeDialog(LoadingDialog, this);
  }

  fixedUpdate(time: number, delta: number) {
    this.gameFSM.update(delta);
  }

  //#region 狀態機

  //#endregion
  /** 遊戲開場，播放遊戲動畫 */
  public async onOpeningEnter(): Promise<void> {
    // 打地鼠沒有開場表演
  }

  /** 遊戲啟動 */
  public onGameEnter(): void {
    // 打地鼠沒有啟動需要做的事
  }

  /** 遊戲進行中update
   * @param delta
   */
  public onGameUpdate(delta: number): void {
    // 計時
    this.secondTimer += delta;

    // 過了一秒
    if (this.secondTimer >= 1000) {
      while (this.secondTimer >= 1000) {
        // 扣除累計時間
        this.secondTimer = Math.max(0, this.secondTimer - 1000);
        // 扣除隨時間流逝能量
        this.onAddEnergy(HamsterNumber.TimeDecrease);
      }
    }

    // 沒有地鼠波次了, 生下一階段的地鼠
    if (this.hamsterEventList.length === 0) {
      // 取得下一階段
      const nextState = this.states.shift();

      // 若沒有下一階段, 結束遊戲
      if (nextState === undefined) {
        this.isHamsterOver = true;
        return;
      }

      // 設定下一階段的地鼠波次
      this.hamsterEventList = this.getNextHamsterEvents(nextState);
    }
    // 生成地鼠
    else {
      // 當前地鼠波次
      const hamsterEvent = this.hamsterEventList[0];

      // 還沒有足夠的洞可以生地鼠
      if (hamsterEvent.hamsters.length > this.holeDialog.remaindCount) {
        return;
      }

      // 波次之間的間隔還沒過
      if (this.hamsterTimer < hamsterEvent.intervalTime * 1000) {
        // 計時
        this.hamsterTimer += delta;
        return;
      }

      // 生成地鼠
      this.holeDialog.onAppearHamsters(hamsterEvent.hamsters);
      // 移除資料
      this.hamsterEventList.shift();
      // 重新計時
      this.hamsterTimer = 0;
    }
  }

  /** 當觸發續命 */
  public onReviveEnter(): void {
    // 暫停背景音樂
    this.bgm?.pause();
    // 暫停場景
    this.pauseScene();
  }

  /** 續命完成
   * @param rewardProp
   */
  public async onReviveEnd(rewardProp: TotalProps[]): Promise<void> {
    // 取得打地鼠道具靜態表
    const defenseItemList = TableManager.hamsterDefense.getAll();
    const attackItemList = TableManager.hamsterHit.getAll();

    // 分別攻擊與防禦道具
    const newDefenseItems: TotalProps[] = [];
    const newHitItems: TotalProps[] = [];
    rewardProp.forEach((itemData) => {
      // 判斷防禦或是攻擊道具, 塞到相應的道具清單
      if (defenseItemList.find((defenseItem) => itemData.id === defenseItem.id)) {
        newDefenseItems.push(itemData);
      } else if (attackItemList.find((attackItem) => itemData.id === attackItem.id)) {
        newHitItems.push(itemData);
      }
    });

    // 獲得道具獎勵
    newHitItems.forEach((itemData) => {
      this.mainDialog.addHitItem(itemData.id, itemData.count);
    });
    // 獲得道具獎勵
    newDefenseItems.forEach((itemData) => {
      this.mainDialog.addDefenseItem(itemData.id, itemData.count);
    });

    // 恢復背景音樂
    this.bgm?.resume();
    // 所有場景暫停繼續
    this.resumeScene();
  }

  /** 遊戲結束 */
  public onEndingEnter(): ContestPlayerData {
    // 取得擊殺數
    const hamsterKillCount = this.mainDialog.killCount;

    // 紀錄遊戲結果
    const gameLog: HamsterGameLog = {
      gameScore: hamsterKillCount,
      gameMode: GameType.WebHamster,
      browser: navigator.userAgent,
      hamsterKills: hamsterKillCount,
    };
    return {
      hid: this.gameData.heroListData.hid,
      isSurvivor: hamsterKillCount >= HamsterNumber.TargetKillCount,
      webGameLog: gameLog,
    };
  }

  /** 播放打地鼠音效 */
  public playOnHitHamsterSound(): void {
    // 播放打地鼠音效
    this.onHitHamsterSoundPool.play();
    // 通知BossGame表演
    this.bossGame?.onAttackBoss();
  }

  /** 取得炮彈 */
  public getAttack(key: string): HamsterAttack {
    const attack = this.attackPool.get() as HamsterAttack;

    // TODO HamsterAttack改成GameObject, 呼叫HamsterAttack的function來設定
    // 建立子彈摧毀的事件
    attack.onDestroy = () => {
      this.attackPool.killAndHide(attack);
      this.tweens.killTweensOf(attack);
    };
    // 設定子彈圖片
    attack.setTexture(key);
    attack.setScale(1);

    return attack;
  }

  /** 取得文字特效 */
  public getFadeText(): FadeText {
    let fadeText = this.fadeTextPool.find((text: FadeText) => {
      return text.visible === false;
    });

    if (fadeText === undefined) {
      fadeText = this.add.existing(new FadeText(this, 0, 0, ''));
      this.fadeTextPool.push(fadeText);
    }

    // 建立子彈摧毀的事件
    fadeText.onFadeEnd = (text: FadeText) => {
      text.setVisible(false);
      this.tweens.killTweensOf(text);
    };

    return fadeText as FadeText;
  }

  /** 檢查並進入下一個階段
   * @param nextState
   */
  private getNextHamsterEvents(nextState: HamsterStateData): HamsterEvent[] {
    // 取得出現地鼠資料
    const hamsterDataList = this.setHamsterData(nextState);

    // 轉換成地鼠波次
    return this.createHamsterEvents(nextState, hamsterDataList);
  }

  /** 設置目前狀態的地鼠資料
   * @param stateData
   */
  private setHamsterData(stateData: HamsterStateData): HamsterData[] {
    // 出現地鼠資料
    const hamsterDatas: HamsterData[] = [];

    // 檢查一般地鼠資料
    const normalHamsterDatas = this.hamsterMap.get(HamsterType.Normal);
    if (normalHamsterDatas === undefined || normalHamsterDatas.length <= 0) {
      InfoBox.error([this], '沒有一般地鼠的靜態資料');
      return [];
    }

    // 塞入一般地鼠個數
    for (let i = 0; i < stateData.normalCount; ++i) {
      // 隨機選一個一般地鼠
      hamsterDatas.push(normalHamsterDatas[randomNumber(normalHamsterDatas.length)]);
    }

    // 檢查特殊地鼠資料
    const raidHamsterDatas = this.hamsterMap.get(HamsterType.Rare);
    if (raidHamsterDatas === undefined || raidHamsterDatas.length <= 0) {
      InfoBox.error([this], '沒有特殊地鼠的靜態資料');
      return [];
    }

    // 塞入特殊地鼠個數
    for (let i = 0; i < stateData.raidCount; ++i) {
      // 隨機選一個特殊地鼠
      hamsterDatas.push(raidHamsterDatas[randomNumber(raidHamsterDatas.length)]);
    }

    // 檢查反派角色資料
    const partnerHamsterDatas = this.hamsterMap.get(HamsterType.Enemy);
    if (partnerHamsterDatas === undefined || partnerHamsterDatas.length <= 0) {
      InfoBox.error([this], '沒有反派角色的靜態資料');
      return [];
    }

    // 塞入反派角色個數
    for (let i = 0; i < stateData.enemyCount; ++i) {
      // 隨機選一個反派角色
      hamsterDatas.push(partnerHamsterDatas[randomNumber(partnerHamsterDatas.length)]);
    }

    // 隨機打亂
    return Phaser.Math.RND.shuffle(hamsterDatas);
  }

  /** 設置該狀態的所有地鼠出現的階段
   * @param state
   * @param allHamsters
   */
  private createHamsterEvents(state: HamsterStateData, allHamsters: HamsterData[]): HamsterEvent[] {
    // 檢查是否有地鼠資料
    if (allHamsters.length <= 0) {
      return [];
    }

    // 建立地鼠出現事件
    const hamsterEvents: HamsterEvent[] = [];
    while (allHamsters.length > 0) {
      // 隨機產生數量
      const hamsterCount = randomRange(state.countMin, state.countMax);

      // 隨機產生出現下一波地鼠的時間間隔
      const intervalTime = randomRange(state.appearMin, state.appearMax);

      // 根據數量塞入對應的地鼠資料
      const hamsters: HamsterData[] = allHamsters.splice(0, hamsterCount);

      // 建立事件
      hamsterEvents.push({ hamsters, intervalTime });
    }

    return hamsterEvents;
  }

  /** 增加能量
   * @param addAmount
   */
  public onAddEnergy(addAmount: number): void {
    this.currentEnergy = clamp(this.currentEnergy + addAmount, HamsterNumber.BaseEnergy, 0);
    this.mainDialog.setEnergy(this.currentEnergy);
  }
}
