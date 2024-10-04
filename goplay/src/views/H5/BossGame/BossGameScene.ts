import Config from '@/config/setting';
import TableManager, { BossTalkInfo, BossTalkInfoType } from '@/manager/TableManager';
import { BossString } from './BossConfig';
import BossGameDialog from './Dialogs/BossGameDialog';
import BossGameTalkDialog from './Dialogs/BossGameTalkDialog';
import UIManager from '../Scripts/Manager/UIManager';
import bossImgPath from '@/config/imgPath/_boss';
import HeroManager from '@/manager/HeroManager';
import InfoBox from '../Scripts/Components/InfoBox';
import { BossGameHeroData } from './Components/BossGameHeroComponent';
import Localization, { LocalKeyType } from '../Scripts/Components/Localization';
import { AsyncHelper } from '../Helper/AsyncHelper';
import { randomNumber } from '../Helper/MathHelper';
import BaseGameScene from '../Scripts/Components/BaseGameScene';
import { BossGameData } from '@/helper/interface/Game';
import BossGameFSM from './BossGameFSM';
import AnimationHelper from '../Helper/AnimationHelper';
import { CharacterAnimType, CharacterType } from '@/helper/enum/PhaserGame';

/** BossGame, 在魔王賽時, 遊戲上方顯示的攻擊魔王表演 */
export default class BossGameScene extends BaseGameScene {
  /** 魔王表演狀態機 */
  private gameFSM!: BossGameFSM;

  /** BossGameDialog */
  private gameDialog!: BossGameDialog;
  /** BossGameTalkDialog */
  private talkDialog!: BossGameTalkDialog;

  /** 魔王圖片位置 */
  private readonly bossPosition = new Phaser.Math.Vector2(1310, 170);
  /** 英雄圖片位置 */
  private readonly heroPosition = new Phaser.Math.Vector2(870, 210);
  /** 隊員圖片位置, 順序照render順序由後而前 */
  private readonly teammatePositionList = [
    new Phaser.Math.Vector2(820, 180),
    new Phaser.Math.Vector2(670, 180),
    new Phaser.Math.Vector2(770, 200),
    new Phaser.Math.Vector2(610, 210),
    new Phaser.Math.Vector2(720, 220),
    new Phaser.Math.Vector2(810, 250),
    new Phaser.Math.Vector2(650, 250),
  ];

  /** 玩家英雄資料 */
  private playerBossGameHeroData!: BossGameHeroData;
  /** 英雄隊伍資料 */
  private teammateBossGameHeroDataList: BossGameHeroData[] = [];

  /** 對戰中的對話 */
  private commonTalkInfoArray: BossTalkInfo[] = [];

  /** 下一次的隊員攻擊時間點 */
  private teammateAttackAt: number = 0;
  /** 隊員攻擊間隔時間max */
  private readonly teammateAttackIntervalMax: number = 5;

  /** 魔王表演是否進入遊戲狀態 */
  public get isGameState(): boolean {
    return this.gameFSM.isGameState;
  }

  /** 魔王表演是否結束 */
  public isGameEnd: boolean = false;

  constructor(private gameData: BossGameData) {
    super({ key: 'BossGameScene' });
    this.gameFSM = new BossGameFSM(this);
  }

  preload() {
    // 載入魔王圖片資源
    this.load.image(BossString.BossImgKey, `${bossImgPath.bossBaseUrl}${this.gameData.bossTableData.imgUrl}.png`);

    // 取得所有英雄資料
    const allHeroData = TableManager.hero.getAll();

    // 取得玩家英雄資料
    const heroId = this.gameData.playerHeroData.heroId;
    const playerHeroIndex = allHeroData.findIndex((heroData) => heroData.id === heroId);
    if (playerHeroIndex === -1) {
      console.error('heroData undefined! playerHeroId = ' + heroId);
      this.scene.stop();
      return;
    }
    const playerHeroData = allHeroData.splice(playerHeroIndex, 1)[0];

    // 取得砲彈資源
    const heroLevel = this.gameData.playerHeroData.level;
    const heroWeaponData = HeroManager.getHeroWeaponData(playerHeroData, heroLevel);
    if (heroWeaponData === undefined) {
      console.error(`heroWeaponData is null! heroId = ${heroId}, heroLevel = ${heroLevel}`);
      InfoBox.defaultMessage([this], `英雄砲塔讀取失敗! 英雄ID: ${heroId}, 等級: ${heroLevel}`);
      this.scene.stop();
      return;
    }

    // 設定玩家英雄資料
    this.playerBossGameHeroData = {
      heroData: playerHeroData,
      bombImgKey: heroWeaponData.bombId.toString(),
      name: '',
      position: this.heroPosition,
    };
    this.loadImage(this.playerBossGameHeroData, heroWeaponData.bombId);

    // 設定隊友英雄清單資料
    const shuffleHeroList = Phaser.Math.RND.shuffle(allHeroData);
    for (const position of this.teammatePositionList) {
      // 取隨機最後一個英雄
      const heroData = shuffleHeroList.pop();
      if (heroData == null) {
        return;
      }

      // 創建隊友英雄資料
      const teammateBossGameHeroData: BossGameHeroData = {
        heroData,
        bombImgKey: heroData.defenseWeaponId.toString(),
        name: this.gameData.teammateName.pop() ?? Localization.getText(LocalKeyType.Common, heroData.nameKey),
        position,
      };
      this.loadImage(teammateBossGameHeroData, heroData.defenseWeaponId);

      // 隊友英雄清單
      this.teammateBossGameHeroDataList.push(teammateBossGameHeroData);
    }

    // 載入玩家英雄閒置動畫
    AnimationHelper.loadCharacterSprite(
      this,
      this.playerBossGameHeroData.heroData,
      CharacterType.Hero,
      CharacterAnimType.Idle
    );
    // 載入隊友英雄閒置動畫
    this.teammateBossGameHeroDataList.forEach((bossGameHeroData: BossGameHeroData) =>
      AnimationHelper.loadCharacterSprite(this, bossGameHeroData.heroData, CharacterType.Hero, CharacterAnimType.Idle)
    );
    // 取得全部common對話組
    this.commonTalkInfoArray = TableManager.bossTalk.where((talkInfo) => talkInfo.type === BossTalkInfoType.Common);
  }

  create() {
    // 創建隊友英雄閒置動畫
    AnimationHelper.createCharacterAnim(this, this.playerBossGameHeroData.heroData, CharacterAnimType.Idle);
    // 創建隊友英雄閒置動畫
    this.teammateBossGameHeroDataList.forEach((bossGameHeroData: BossGameHeroData) =>
      AnimationHelper.createCharacterAnim(this, bossGameHeroData.heroData, CharacterAnimType.Idle)
    );
    // new BossGameDialog
    this.gameDialog = UIManager.instance.openDialog(BossGameDialog, this, false);
    this.gameDialog.init(this.bossPosition);
    // new BossGameTalkDialog
    this.talkDialog = UIManager.instance.openDialog(BossGameTalkDialog, this, false);
    this.talkDialog.init(this.heroPosition, this.bossPosition);
  }

  fixedUpdate(time: number, delta: number) {
    // 更新遊戲狀態機
    this.gameFSM.update(delta);
  }

  /** 加載圖片
   * @param bossGameHeroData
   * @param bombId
   */
  private loadImage(bossGameHeroData: BossGameHeroData, bombId: number): void {
    // 加載砲彈圖片
    this.load.image(bossGameHeroData.bombImgKey, `${Config.imgUrl}/img/h5/defense/bombs/bomb_${bombId}.png`);
  }

  /** 魔王表演開場 */
  public async onOpeningEnter(): Promise<void> {
    // 進場表演
    await AsyncHelper.sleep(0.5);

    // 玩家 & 隊員進場
    this.gameDialog.setHeroTeam(this.playerBossGameHeroData, this.teammateBossGameHeroDataList);
    await AsyncHelper.sleep(1);

    // 魔王進場
    this.gameDialog.setBoss();
    await AsyncHelper.sleep(1);

    // 取得開場對話
    const openingTalkInfo = TableManager.bossTalk.first((talkInfo) => {
      return talkInfo.type === BossTalkInfoType.Opening;
    });
    // 防呆
    if (openingTalkInfo === undefined) {
      console.error('OpeningState.onEnter() error, openingTalkInfo not found!');
      return;
    }

    // 設定新對話組, 等待對話結束
    await this.talkDialog.startTalk(openingTalkInfo);

    // 背景音樂停止
    this.bgm?.stop();
  }

  /** 遊戲進行中的表演 */
  public onGameUpdate(): void {
    // 檢查隊員攻擊時間點
    if (this.teammateAttackAt < Date.now()) {
      // 隊員攻擊魔王
      this.gameDialog.teammateAttackBoss();
      // 重置攻擊時間點
      const waitMilliSec = Math.random() * this.teammateAttackIntervalMax * 1000;
      this.teammateAttackAt = Date.now() + waitMilliSec;
    }

    // 若對話組播放結束了, 設定下組對話組
    if (this.talkDialog.isTalkFinished) {
      // 骰出隨機一組common對話組
      const currentTalkIndex = randomNumber(this.commonTalkInfoArray.length);
      // 設定新對話組
      this.talkDialog.startTalk(this.commonTalkInfoArray[currentTalkIndex]);
    }
  }

  /** 開始表演魔王結束
   * @param totalDamage
   */
  public async onBossEnding(totalDamage: number): Promise<void> {
    // 隱藏對話框
    this.talkDialog.stopTalk();

    // 播放背景音樂
    this.bgm?.play({ loop: true });

    // 停止狀態機
    this.gameFSM.end();

    // 等待GameEnd表演結束
    await this.gameDialog.playEnding(totalDamage);

    // 取得結束對話
    const endingTalkInfo = TableManager.bossTalk.first((talkInfo) => {
      return talkInfo.type === BossTalkInfoType.Ending;
    });
    // 防呆
    if (endingTalkInfo === undefined) {
      console.error('BossGameDialog.playEnding() error, endingTalkInfo not found!');
      return;
    }

    // 設定新對話組, 等待對話結束
    await this.talkDialog.startTalk(endingTalkInfo);

    // 背景音樂停止
    this.bgm?.stop();
  }

  /** 表演攻擊魔王 */
  public onAttackBoss(): void {
    this.gameDialog.playerAttackBoss();
  }
}
