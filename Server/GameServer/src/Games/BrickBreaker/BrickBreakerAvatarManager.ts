import { BrickBreakerLogMvpList, BrickBreakerPlayerScore, UserAnswerLogData } from '../../BrickBreakerMssrAgent';
import {
  BrickBreakerAvatarData,
  BrickBreakerAvatarState,
  BrickBreakerItemType,
  BrickBreakerRankData,
  BrickBreakerRankType,
  BrickBreakerVueUserAnswerData,
} from '../../NetProtocol/BrickBreakerStructure';
import { ServiceUserInfo } from '../../NetProtocol/CommonStructure';
import BrickBreakerAvatar from './BrickBreakerAvatar';

/** 效果影響範圍類型 */
export enum EffectRangeType {
  /** 效果影響九宮格內玩家 */
  Around,
  /** 效果影響全體玩家 */
  All,
}

export default class BrickBreakerAvatarManager {
  /** 玩家資料 */
  private allPlayerAvatar: Map<number, BrickBreakerAvatar> = new Map<number, BrickBreakerAvatar>();

  private rpcRankData!: BrickBreakerRankData[];
  public getRpcRankData(): BrickBreakerRankData[] {
    return this.rpcRankData;
  }

  private logMvpList!: BrickBreakerLogMvpList;
  public getLogMvpList(): BrickBreakerLogMvpList {
    return this.logMvpList;
  }

  public getVueUserAnswerData(): BrickBreakerVueUserAnswerData[] {
    const userAnswerDatas: BrickBreakerVueUserAnswerData[] = [];
    // avatar清單 轉成array
    const allAvatarArray = Array.from(this.allPlayerAvatar.values());

    allAvatarArray.forEach((avatar) => {
      const totalAnswerCount = avatar.avatarData.questionCount;
      const correctAnswerCount = avatar.avatarData.correctCount;
      // 答題正確率 = 答對數/總答題數, 但須注意排除總答題數為0的情況
      const correctAnswerRate = totalAnswerCount === 0 ? 0 : correctAnswerCount / totalAnswerCount;

      const userAnswerData: BrickBreakerVueUserAnswerData = {
        // BrickBreakerVueMvpData
        playerId: avatar.avatarData.uid,
        school: avatar.avatarData.school,
        name: avatar.avatarData.name,
        heroId: avatar.avatarData.heroId,
        hid: avatar.avatarData.hid,
        count: -1, // mvp專用, 答題排行沒用到
        // BrickBreakerAnswerStatisticsData
        totalAnswerCount,
        correctAnswerCount,
        correctAnswerRate,
      };
      userAnswerDatas.push(userAnswerData);
    });

    return userAnswerDatas;
  }

  public getUserAnswerLogDatas(): UserAnswerLogData[] {
    const userAnswerDatas: UserAnswerLogData[] = [];
    // avatar清單 轉成array
    const allAvatarArray = Array.from(this.allPlayerAvatar.values());

    allAvatarArray.forEach((avatar) => {
      const totalAnswerCount = avatar.avatarData.questionCount;
      const correctAnswerCount = avatar.avatarData.correctCount;
      // 答題正確率 = 答對數/總答題數, 但須注意排除總答題數為0的情況
      const correctAnswerRate = totalAnswerCount === 0 ? 0 : correctAnswerCount / totalAnswerCount;

      const userAnswerData: UserAnswerLogData = {
        playerId: avatar.avatarData.uid,
        totalAnswerCount,
        correctAnswerCount,
        correctAnswerRate,
      };
      userAnswerDatas.push(userAnswerData);
    });

    return userAnswerDatas;
  }

  /** 取得指定uid的BrickBreakerAvatar */
  public getAvatar(uid: number): BrickBreakerAvatar | undefined {
    return this.allPlayerAvatar.get(uid);
  }

  /** 取得當前所有avatar */
  public getAllAvatar(): BrickBreakerAvatar[] {
    return Array.from(this.allPlayerAvatar.values());
  }

  /** 取得當前所有avatar的avatarData */
  public getAllAvatarData(): BrickBreakerAvatarData[] {
    const allAvatarData: BrickBreakerAvatarData[] = [];
    this.allPlayerAvatar.forEach((avatar) => {
      allAvatarData.push(avatar.avatarData);
    });
    return allAvatarData;
  }

  /** 取得當前avatar數量 */
  public getAllAvatarCount(): number {
    return this.allPlayerAvatar.size;
  }

  /** 新玩家加入, 創建avatar, 解鎖地圖, 增加魔王血量
   * @param playerInfo 新玩家資料
   * @param beginGridId 出生點格子id
   * @param questionTotalCount 題庫總題數
   */
  public createAvatar(
    playerInfo: ServiceUserInfo,
    beginGridId: number,
    questionTotalCount: number
  ): BrickBreakerAvatar {
    // 本玩家是第幾個加入遊戲的(0 base)
    const playerIndex = this.allPlayerAvatar.size;

    // 生成新的玩家資料
    const newAvatarData: BrickBreakerAvatarData = {
      // playerInfo
      uid: playerInfo.uid,
      name: playerInfo.name,
      school: playerInfo.school,
      heroId: playerInfo.heroId,
      hid: playerInfo.hid,
      memberType: playerInfo.memberType,
      isOnline: true,
      // game data
      playerIndex,
      beginGridId,
      currentGridId: beginGridId,
      targetGridId: -1,
      userState: BrickBreakerAvatarState.Idle,
      itemList: [],
      // 顯示用資料
      bossDamage: 0,
      bossHitSuccessCount: 0,
      hornCount: 0,
      defenseCount: 0,
      answerTreasureCount: 0,
      treasureCount: 0,
      brickBreakCount: 0,
      correctCount: 0,
      questionCount: 0,
    };
    // 設定各道具初始數量為0
    for (let i = 0; i < BrickBreakerItemType.Max; ++i) {
      newAvatarData.itemList.push(0);
    }
    // 存入玩家清單
    const newAvatar = new BrickBreakerAvatar(newAvatarData, questionTotalCount);
    this.allPlayerAvatar.set(playerInfo.uid, newAvatar);
    return newAvatar;
  }

  /** 取得所有上面有站人的格子 */
  public getAllPlayerStandingGrid(): number[] {
    const rtn: number[] = [];
    this.allPlayerAvatar.forEach((avatar) => {
      // 排除重複的格子
      if (rtn.includes(avatar.avatarData.currentGridId) === false) {
        rtn.push(avatar.avatarData.currentGridId);
      }
    });
    return rtn;
  }

  /** 取得解凍時間到的avatar清單 */
  public getUnfreezeTimeupAvatars(): BrickBreakerAvatar[] {
    // 將重複利用參數存起來
    const now = Date.now();
    // 檢查是否解凍
    const unfreezeAvatars: BrickBreakerAvatar[] = [];
    this.allPlayerAvatar.forEach((avatar) => {
      if (avatar.avatarData.userState === BrickBreakerAvatarState.Freeze && now > avatar.unfreezeAt) {
        unfreezeAvatars.push(avatar);
      }
    });
    return unfreezeAvatars;
  }

  /** 全員解凍 */
  public getFreezeAvatars(): BrickBreakerAvatar[] {
    // 找出結凍的人並更新avatarData
    const freezeAvatars: BrickBreakerAvatar[] = [];
    this.allPlayerAvatar.forEach((avatar, uid) => {
      // 找出結凍的人
      if (avatar.avatarData.userState === BrickBreakerAvatarState.Freeze) {
        freezeAvatars.push(avatar);
      }
    });
    return freezeAvatars;
  }

  /** 找出指定範圍內的avatar清單
   * @param rangeGridIds 指定範圍grid id array
   * @returns
   */
  public getRangeAvatars(rangeGridIds: number[]): BrickBreakerAvatar[] {
    const effectRangeAvatars: BrickBreakerAvatar[] = [];
    // 找出站在指定格子上的人們
    this.allPlayerAvatar.forEach((avatar) => {
      if (rangeGridIds.includes(avatar.avatarData.currentGridId)) {
        effectRangeAvatars.push(avatar);
      }
    });
    return effectRangeAvatars;
  }

  /** 遊戲結束, 統計各種結算用資料 */
  public onGameEnd() {
    this.allPlayerAvatar.forEach((avatar) => {
      avatar.onGameEnd();
    });
    this.setRankData();
  }

  /** 取得排行榜資料 */
  public setRankData(): void {
    // avatar清單 轉成array
    const allAvatarArray = Array.from(this.allPlayerAvatar.values());
    // 找出各種排名的最高分
    let scoreMax = -1;
    let questionCorrectMax = -1;
    let bossHitSuccessMax = -1;
    let bossDamageMax = -1;
    let hornCountMax = -1;
    let defenseCountMax = -1;
    let answerTreasureCountMax = -1;
    let treasureCountMax = -1;
    let brickBreakCountMax = -1;
    allAvatarArray.forEach((avatar) => {
      const avatarData = avatar.avatarData;
      if (scoreMax < avatar.totalScore) {
        scoreMax = avatar.totalScore;
      }
      if (questionCorrectMax < avatarData.correctCount) {
        questionCorrectMax = avatarData.correctCount;
      }
      if (bossHitSuccessMax < avatarData.bossHitSuccessCount) {
        bossHitSuccessMax = avatarData.bossHitSuccessCount;
      }
      if (bossDamageMax < avatarData.bossDamage) {
        bossDamageMax = avatarData.bossDamage;
      }
      if (hornCountMax < avatarData.hornCount) {
        hornCountMax = avatarData.hornCount;
      }
      if (defenseCountMax < avatarData.defenseCount) {
        defenseCountMax = avatarData.defenseCount;
      }
      if (answerTreasureCountMax < avatarData.answerTreasureCount) {
        answerTreasureCountMax = avatarData.answerTreasureCount;
      }
      if (treasureCountMax < avatarData.treasureCount) {
        treasureCountMax = avatarData.treasureCount;
      }
      if (brickBreakCountMax < avatarData.brickBreakCount) {
        brickBreakCountMax = avatarData.brickBreakCount;
      }
    });
    // 找出各種排名最高分的人array(包含同分者)
    const scoreMvpList = allAvatarArray.filter((avatar) => avatar.totalScore === scoreMax);
    const questionCorrectMvpList = allAvatarArray.filter(
      (avatar) => avatar.avatarData.correctCount === questionCorrectMax
    );
    const bossHitSuccessMvpList = allAvatarArray.filter(
      (avatar) => avatar.avatarData.bossHitSuccessCount === bossHitSuccessMax
    );
    const bossDamageMvpList = allAvatarArray.filter((avatar) => avatar.avatarData.bossDamage === bossDamageMax);
    const hornCountMvpList = allAvatarArray.filter((avatar) => avatar.avatarData.hornCount === hornCountMax);
    const defenseCountMvpList = allAvatarArray.filter((avatar) => avatar.avatarData.defenseCount === defenseCountMax);
    const answerTreasureCountMvpList = allAvatarArray.filter(
      (avatar) => avatar.avatarData.answerTreasureCount === answerTreasureCountMax
    );
    const treasureCountMvpList = allAvatarArray.filter(
      (avatar) => avatar.avatarData.treasureCount === treasureCountMax
    );
    const brickBreakCountMvpList = allAvatarArray.filter(
      (avatar) => avatar.avatarData.brickBreakCount === brickBreakCountMax
    );
    // 決定各種排名MVP
    // 各項MVP, 同分者比答對題數, 答對題數相同者比答題正確率
    const scoreMvp = this.getMvp(scoreMvpList);
    const questionCorrectMvp = this.getMvp(questionCorrectMvpList);
    const bossHitSuccessMvp = this.getMvp(bossHitSuccessMvpList);
    const bossDamageMvp = this.getMvp(bossDamageMvpList);
    const hornCountMvp = this.getMvp(hornCountMvpList);
    const defenseCountMvp = this.getMvp(defenseCountMvpList);
    const answerTreasureCountMvp = this.getMvp(answerTreasureCountMvpList);
    const treasureCountMvp = this.getMvp(treasureCountMvpList);
    const brickBreakCountMvp = this.getMvp(brickBreakCountMvpList);

    // client端表演用資料格式
    this.rpcRankData = [
      this.getRankData(BrickBreakerRankType.GameScore, scoreMvp, scoreMax),
      this.getRankData(BrickBreakerRankType.QuestionCorrect, questionCorrectMvp, questionCorrectMax),
      this.getRankData(BrickBreakerRankType.BossHitSuccess, bossHitSuccessMvp, bossHitSuccessMax),
      this.getRankData(BrickBreakerRankType.BossDamage, bossDamageMvp, bossDamageMax),
      this.getRankData(BrickBreakerRankType.HornCount, hornCountMvp, hornCountMax),
      this.getRankData(BrickBreakerRankType.DefenseCount, defenseCountMvp, defenseCountMax),
      this.getRankData(BrickBreakerRankType.AnswerTreasureCount, answerTreasureCountMvp, answerTreasureCountMax),
      this.getRankData(BrickBreakerRankType.TreasureCount, treasureCountMvp, treasureCountMax),
      this.getRankData(BrickBreakerRankType.BrickBreakCount, brickBreakCountMvp, brickBreakCountMax),
    ];

    // gameLog用資料格式
    this.logMvpList = {
      gameScore: {
        playerId: scoreMvp.avatarData.uid,
        count: scoreMax,
      },
      questionCorrect: {
        playerId: questionCorrectMvp.avatarData.uid,
        count: questionCorrectMax,
      },
      bossHitSuccess: {
        playerId: bossHitSuccessMvp.avatarData.uid,
        count: bossHitSuccessMax,
      },
      bossDamage: {
        playerId: bossDamageMvp.avatarData.uid,
        count: bossDamageMax,
      },
      hornCount: {
        playerId: hornCountMvp.avatarData.uid,
        count: hornCountMax,
      },
      defenseCount: {
        playerId: defenseCountMvp.avatarData.uid,
        count: defenseCountMax,
      },
      answerTreasureCount: {
        playerId: answerTreasureCountMvp.avatarData.uid,
        count: answerTreasureCountMax,
      },
      treasureCount: {
        playerId: treasureCountMvp.avatarData.uid,
        count: treasureCountMax,
      },
      brickBreakCount: {
        playerId: brickBreakCountMvp.avatarData.uid,
        count: brickBreakCountMax,
      },
    };
  }

  /** 將map資料填成BrickBreakerRankData格式
   * @param rankType rank類型
   * @param mvp mvp資料
   * @param countMax 此mvp在該項rank類型的得分
   */
  private getRankData(rankType: BrickBreakerRankType, mvp: BrickBreakerAvatar, countMax: number): BrickBreakerRankData {
    return {
      rankType,
      vueMvpData: {
        playerId: mvp.avatarData.uid,
        school: mvp.avatarData.school,
        name: mvp.avatarData.name,
        heroId: mvp.avatarData.heroId,
        hid: mvp.avatarData.hid,
        count: countMax,
      },
    };
  }

  /** 取得答對題數最高的玩家, 答對題數相同者比答題正確率
   * @param avatars 要比較的玩家名單
   * @returns 答對題數最多、答題正確率最高的玩家
   */
  private getMvp(avatars: BrickBreakerAvatar[]): BrickBreakerAvatar {
    // array裡只有一人, 直接回傳
    if (avatars.length === 1) {
      return avatars[0];
    }

    // 比答對題數
    let highestCorrectCount = -1;
    let highestCorrectCountAvatars: BrickBreakerAvatar[] = [];
    avatars.forEach((avatar) => {
      const avatarTotalCorrectCount = avatar.avatarData.correctCount;
      if (highestCorrectCount < avatarTotalCorrectCount) {
        highestCorrectCount = avatarTotalCorrectCount;
        highestCorrectCountAvatars = [avatar];
      }
      if (highestCorrectCount === avatarTotalCorrectCount) {
        highestCorrectCountAvatars.push(avatar);
      }
    });
    // 答對題數最高者只有一人, 回傳
    if (highestCorrectCountAvatars.length === 1) {
      return highestCorrectCountAvatars[0];
    }

    // 多人答對題數相同, 比答題正確率
    let fewestQuestionCount = highestCorrectCountAvatars[0].avatarData.questionCount;
    let fewestQuestionCountAvatars: BrickBreakerAvatar[] = [];
    highestCorrectCountAvatars.forEach((avatar) => {
      const avatarTotalQuestionCount = avatar.avatarData.questionCount;
      if (fewestQuestionCount > avatarTotalQuestionCount) {
        fewestQuestionCount = avatarTotalQuestionCount;
        fewestQuestionCountAvatars = [avatar];
      }
      if (fewestQuestionCount === avatarTotalQuestionCount) {
        fewestQuestionCountAvatars.push(avatar);
      }
    });
    // 答題正確率最高者只有一人, 回傳
    if (fewestQuestionCountAvatars.length === 1) {
      return fewestQuestionCountAvatars[0];
    }

    // 答對題數相同、答題正確率相同, 隨機骰一個回傳
    const randomIndex = Math.floor(Math.random() * fewestQuestionCountAvatars.length);
    return fewestQuestionCountAvatars[randomIndex];
  }

  /** 取得玩家結算資料 */
  public getPlayerScoreList(): BrickBreakerPlayerScore[] {
    const playerScoreList: BrickBreakerPlayerScore[] = [];
    this.allPlayerAvatar.forEach((avatar) => {
      playerScoreList.push(avatar.playerScore);
    });
    return playerScoreList;
  }
}
