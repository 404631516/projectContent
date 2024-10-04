import { AnswerInfo, QuestionData, QuizData } from '../../NetProtocol/CommonStructure';
import {
  BrickBreakerAvatarData,
  BrickBreakerAvatarState,
  BrickBreakerAvatarUpdateData,
  BrickBreakerAvatarUpdateType,
  BrickBreakerItemType,
  BrickBreakerGridEventType,
  BrickBreakerGridType,
  getBrickBreakerAvatarScore,
} from '../../NetProtocol/BrickBreakerStructure';
import TableManager, { BrickBreakerItemData } from '../Table/TableManager';
import AvatarQuestionComponent from '../../Components/AvatarQuestionComponent';
import BrickBreakerHelper from './BrickBreakerHelper';
import { BrickBreakerPlayerScore } from '../../BrickBreakerMssrAgent';

export default class BrickBreakerAvatar {
  /** 與client端同步的顯示用資料 */
  public avatarData: BrickBreakerAvatarData;

  /** 個人題目、答題狀態管理 */
  private questionComponent: AvatarQuestionComponent;

  /** 當前觸發的事件 */
  private currentGridEventType?: BrickBreakerGridEventType;

  /** 觸發結凍後, 自動解凍時間點 */
  public unfreezeAt: number = 0;

  //#region 結算用參數, call onGameEnd()後才會有值
  /** 綜合分數 */
  public totalScore!: number;
  /** log資料 */
  public playerScore!: BrickBreakerPlayerScore;
  //#endregion

  /** 此玩家的斷線次數 */
  private disconnectCount: number = 0;

  /** 斷線次數超過x次視為不正常, 斷線時回到重生點 */
  private readonly disconnectPunishCount: number = 3;

  /** 結凍秒數 */
  private readonly freezeMilliSec: number = 10000;

  /** 魔王格子答題題數 */
  private readonly bossQuestionNumber: number = 7;

  constructor(avatarData: BrickBreakerAvatarData, questionTotalCount: number) {
    this.avatarData = avatarData;
    this.questionComponent = new AvatarQuestionComponent(avatarData.uid, questionTotalCount);
  }

  /** 玩家斷線 */
  public onDisconnect(): void {
    // 斷線次數大於允許值
    if (this.disconnectCount > this.disconnectPunishCount) {
      // 回重生點
      this.avatarData.currentGridId = this.avatarData.beginGridId;
    } else {
      // 紀錄斷線次數
      this.disconnectCount++;
    }

    // isOnline = false
    this.avatarData.isOnline = false;

    // 清空狀態
    this.clearState();
  }

  /** 觸發格子事件
   * @param eventType 觸發的事件類型
   * @param targetGridId 觸發目標grid id
   */
  public onTriggerGridEvent(
    gridType: BrickBreakerGridType,
    eventType: BrickBreakerGridEventType,
    targetGridId: number
  ): BrickBreakerAvatarUpdateData {
    // 紀錄觸發的事件, 以便答題結束時判斷接下來的動作
    this.currentGridEventType = eventType;
    this.avatarData.targetGridId = targetGridId;

    // 部分格子類型需要紀錄觸發格子數量
    switch (gridType) {
      case BrickBreakerGridType.Treasure:
        this.avatarData.treasureCount++;
        break;
      case BrickBreakerGridType.BreakableBrick1:
      case BrickBreakerGridType.BreakableBrick2:
      case BrickBreakerGridType.BreakableBrick3:
      case BrickBreakerGridType.DisposableBrick:
        this.avatarData.brickBreakCount++;
        break;
    }

    // 取得event table data
    const eventData = TableManager.brickBreakerEvent.findOne(eventType);
    // 防呆, 由於eventType是MapManager傳出來的, 理論上不會有找不到的情況
    if (eventData === undefined) {
      console.error(
        `BrickBreakerAvatar.onTriggerGridEvent() error, event table data not found! eventType = ${eventType}`
      );
      return {
        updateType: BrickBreakerAvatarUpdateType.ShowError,
        itemId: 0,
        activatorUid: this.avatarData.uid,
      };
    }

    // 事件若要答題, 就回傳StartAnswer
    if (eventData.isAnswer) {
      return {
        updateType: BrickBreakerAvatarUpdateType.StartAnswer,
        itemId: 0,
        activatorUid: this.avatarData.uid,
      };
    }

    // 取得更新表演類型
    return this.handleGridEvent(eventType);
  }

  /** 收到封包, 回答上一題並取得下一題
   * @param answerInfo 上一題的答案
   * @returns 回傳格式包含上一題正確與否 & 是否答題結束 & 下一題題目
   */
  public onGetNextQuestion(answerInfo: AnswerInfo): QuestionData {
    return this.questionComponent.onGetNextQuestion(answerInfo);
  }

  /** 答題結束, 根據"當前觸發格子類型"及"答對與否", 決定要做的動作 */
  public onPlayerAnswerFinished(): BrickBreakerAvatarUpdateData {
    // 防呆
    if (this.currentGridEventType === undefined) {
      console.error(`onPlayerAnswerFinished() error, currentGridEventType undefined!`);
      return {
        updateType: BrickBreakerAvatarUpdateType.ShowError,
        itemId: 0,
        activatorUid: this.avatarData.uid,
      };
    }
    if (this.questionComponent.isAnswerFinished() === false) {
      console.error(`onPlayerAnswerFinished() error, is not answer finished!`);
      return {
        updateType: BrickBreakerAvatarUpdateType.ShowError,
        itemId: 0,
        activatorUid: this.avatarData.uid,
      };
    }

    // 更新答題正確數
    this.avatarData.correctCount = this.questionComponent.getLogCorrectCount();
    // 更新總答題數
    this.avatarData.questionCount = this.questionComponent.getLogCount();

    // 答題完成後的下一個事件
    return this.handleGridEvent(this.currentGridEventType);
  }

  /** 根據格子觸發的eventType決定對應的avatarUpdateType */
  private handleGridEvent(eventType: BrickBreakerGridEventType): BrickBreakerAvatarUpdateData {
    let updateType: BrickBreakerAvatarUpdateType;
    let itemId: number = 0;

    switch (eventType) {
      case BrickBreakerGridEventType.TriggerFailed:
      case BrickBreakerGridEventType.UnbreakableBrick:
        updateType = BrickBreakerAvatarUpdateType.HitWall;
        break;
      case BrickBreakerGridEventType.Move:
        updateType = BrickBreakerAvatarUpdateType.Move;
        break;
      case BrickBreakerGridEventType.Bomb:
        // 若有對應道具, 表演使用道具
        if (this.hasItem(BrickBreakerItemType.Shield)) {
          updateType = BrickBreakerAvatarUpdateType.UseItem;
          itemId = BrickBreakerItemType.Shield;
          break;
        }
        // 沒有對應道具就爆炸
        updateType = BrickBreakerAvatarUpdateType.Bomb;
        break;
      case BrickBreakerGridEventType.Portal:
        updateType = BrickBreakerAvatarUpdateType.Teleport;
        break;
      case BrickBreakerGridEventType.CrossBrickBreak:
        updateType = BrickBreakerAvatarUpdateType.CrossBrickBreak;
        break;
      case BrickBreakerGridEventType.Shuriken:
        updateType = BrickBreakerAvatarUpdateType.Shuriken;
        if (this.hasItem(BrickBreakerItemType.Axe)) {
          itemId = BrickBreakerItemType.Axe;
        }
        break;
      case BrickBreakerGridEventType.Freeze:
        // 若有對應道具, 表演使用道具
        if (this.hasItem(BrickBreakerItemType.FreezePrevent)) {
          updateType = BrickBreakerAvatarUpdateType.UseItem;
          itemId = BrickBreakerItemType.FreezePrevent;
          break;
        }
        // 沒有對應道具就結凍
        updateType = BrickBreakerAvatarUpdateType.Freeze;
        break;
      case BrickBreakerGridEventType.Horn:
        updateType = BrickBreakerAvatarUpdateType.Horn;
        break;
      case BrickBreakerGridEventType.GetShield:
        updateType = BrickBreakerAvatarUpdateType.GetItem;
        itemId = BrickBreakerItemType.Shield;
        break;
      case BrickBreakerGridEventType.GetAxeSelf:
        updateType = BrickBreakerAvatarUpdateType.GetItem;
        itemId = BrickBreakerItemType.Axe;
        break;
      case BrickBreakerGridEventType.GetAxeAround:
        updateType = BrickBreakerAvatarUpdateType.GetItemAround;
        itemId = BrickBreakerItemType.Axe;
        break;
      case BrickBreakerGridEventType.GetAxeAll:
        updateType = BrickBreakerAvatarUpdateType.GetItemAll;
        itemId = BrickBreakerItemType.Axe;
        break;
      case BrickBreakerGridEventType.GetFreezePrevent:
        updateType = BrickBreakerAvatarUpdateType.GetItem;
        itemId = BrickBreakerItemType.FreezePrevent;
        break;

      // 答題完成後才會觸發
      case BrickBreakerGridEventType.Attack:
        if (this.questionComponent.isCorrect()) {
          updateType = BrickBreakerAvatarUpdateType.Attack;
          if (this.hasItem(BrickBreakerItemType.Axe)) {
            itemId = BrickBreakerItemType.Axe;
          }
          break;
        }
        updateType = BrickBreakerAvatarUpdateType.DoNothing;
        break;
      case BrickBreakerGridEventType.Defense:
        // 防禦成功
        if (this.questionComponent.isCorrect()) {
          updateType = BrickBreakerAvatarUpdateType.DefenseSuccess;
          break;
        }
        // 防禦失敗時, 若有盾牌道具, 則使用之
        if (this.hasItem(BrickBreakerItemType.Shield)) {
          updateType = BrickBreakerAvatarUpdateType.DefenseFailedShield;
        } else {
          updateType = BrickBreakerAvatarUpdateType.DefenseFailedBomb;
        }
        break;
      case BrickBreakerGridEventType.AnswerTreasure:
        if (this.questionComponent.isCorrect()) {
          // 紀錄成功打開寶箱次數
          this.avatarData.answerTreasureCount++;
          // 答題寶箱, 隨機骰出要發生的事件
          const answerTreasureEvent = BrickBreakerHelper.instance.getAnswerTreasureRandomEvent();
          return this.handleGridEvent(answerTreasureEvent);
        }
        updateType = BrickBreakerAvatarUpdateType.DoNothing;
        break;
      case BrickBreakerGridEventType.Boss:
        // 是否消耗道具 威力上升
        if (this.hasItem(BrickBreakerItemType.Axe)) {
          itemId = BrickBreakerItemType.Axe;
        }
        // 是否全對
        if (this.questionComponent.isCorrect()) {
          updateType = BrickBreakerAvatarUpdateType.HitBossSuccess;
          break;
        }
        // 是否消耗道具 Shield
        if (this.hasItem(BrickBreakerItemType.Shield)) {
          updateType = BrickBreakerAvatarUpdateType.HitBossFailedShield;
          break;
        }
        updateType = BrickBreakerAvatarUpdateType.HitBossFailedBomb;
        break;
      default:
        console.error(
          'BrickBreakerMapManager.triggerGrid() error, unexpected eventType: ' + BrickBreakerGridEventType[eventType]
        );
        updateType = BrickBreakerAvatarUpdateType.DoNothing;
        break;
    }
    return { updateType, itemId, activatorUid: this.avatarData.uid };
  }

  //#region 道具數量管理
  /** 擁有道具 */
  public hasItem(itemType: BrickBreakerItemType): boolean {
    // 檢查道具數
    const itemCount = this.avatarData.itemList[itemType];
    // 沒對應道具, 表演結凍
    if (itemCount === undefined || itemCount <= 0) {
      return false;
    }
    return true;
  }

  /** 得到道具, 道具數量+1
   * @param itemId 道具Id
   */
  public addItem(itemData: Readonly<BrickBreakerItemData>): boolean {
    // 更新道具map
    const currentItemCount = this.avatarData.itemList[itemData.id];
    let newItemCount;
    // 防呆, 找不到道具type
    if (currentItemCount === undefined) {
      console.error(`BrickBreakerAvatar.addItem() error, unexpected item type ${itemData.id}`);
      return false;
    }
    newItemCount = currentItemCount + 1;
    // 道具數量限制
    if (newItemCount > itemData.numberMax) {
      return false;
    }
    // 更新道具map
    this.avatarData.itemList[itemData.id] = newItemCount;
    return true;
  }

  /** 使用道具
   * @param itemType 道具類型
   * @returns 是否使用成功(道具數量是否足夠)
   */
  public useItem(itemType: BrickBreakerItemType): boolean {
    let itemCount = this.avatarData.itemList[itemType];
    // 防呆, 找不到道具type
    if (itemCount === undefined) {
      console.error(`BrickBreakerAvatar.useItem() error, unexpected item type ${itemType}`);
    }
    // 道具數量不足
    if (itemCount <= 0) {
      this.avatarData.itemList[itemType] = 0;
      return false;
    }
    // 扣道具數
    itemCount--;
    this.avatarData.itemList[itemType] = itemCount;
    return true;
  }
  //#endregion

  /** 移動, 設定位置 */
  public setPosition(gridId: number): void {
    this.avatarData.currentGridId = gridId;
  }

  /** 更新顯示狀態 */
  public setUserState(userState: BrickBreakerAvatarState): void {
    this.avatarData.userState = userState;
  }

  /** 結凍 */
  public freeze(): void {
    this.avatarData.userState = BrickBreakerAvatarState.Freeze;
    this.unfreezeAt = Date.now() + this.freezeMilliSec;
  }

  //#region questionComponent相關
  /** 取得題目index, 以便拿這些index去questionManager要題目 */
  public getQuestionIndices(): number[] {
    const questionCount = this.getQuestionNumber(this.currentGridEventType);
    return this.questionComponent.getNextQuestionIndices(questionCount);
  }

  /** 要回答的題目數, 根據事件類型有所不同 */
  private getQuestionNumber(currentGridEventType: BrickBreakerGridEventType | undefined): number {
    if (currentGridEventType === undefined) {
      return 0;
    }
    if (currentGridEventType === BrickBreakerGridEventType.Boss) {
      return this.bossQuestionNumber;
    }
    return 1;
  }

  /** 設定題目 */
  public initQuestions(questions: QuizData[]): void {
    this.questionComponent.initQuestions(questions);
  }

  /** 取得答對題數 */
  public getCorrectCount(): number {
    return this.questionComponent.getCorrectCount();
  }
  //#endregion

  /** 對boss造成傷害, 記錄總傷害量 */
  public onBossDamage(damage: number): void {
    this.avatarData.bossDamage += damage;
  }

  /** 清空狀態 */
  public clearState(): void {
    // 清空答題狀態
    this.questionComponent.clearAnswerState();
    // 清空觸發格子狀態
    this.currentGridEventType = undefined;
    this.avatarData.targetGridId = -1;
    // 更新狀態
    this.avatarData.userState = BrickBreakerAvatarState.Idle;
  }

  /** 遊戲結束, 算好各種結算用資料 */
  public onGameEnd(): void {
    // 依據公式計算綜合分數
    this.totalScore = getBrickBreakerAvatarScore(this.avatarData);

    // 結算用個人log資料
    this.playerScore = {
      playerId: this.avatarData.uid,
      score: this.totalScore,
      /** 使用平台, Unity enum RuntimePlatform */
      platform: 0,
      isSurvivor: true,
      hid: this.avatarData.hid,
      teamId: 0,
      quizAnswer: this.questionComponent.getQuizAnswer(),
      brickBreakerLog: {
        hitBossSuccessCount: this.avatarData.bossHitSuccessCount,
        bossDamage: this.avatarData.bossDamage,
        hornCount: this.avatarData.hornCount,
        defenseSuccessCount: this.avatarData.defenseCount,
        gridAnswerTreasureCount: this.avatarData.answerTreasureCount,
        gridTreasureCount: this.avatarData.treasureCount,
        gridBreakableBrickCount: this.avatarData.brickBreakCount,
      },
    };
  }
}
