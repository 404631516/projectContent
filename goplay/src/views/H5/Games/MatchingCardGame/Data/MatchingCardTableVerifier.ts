import TableManager from '@/manager/TableManager';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import {
  MatchingCardDifficulty,
  MatchingCardItemFunction,
  MatchingCardNumber,
  MatchingCardObstructType,
} from './MatchingCardConfig';

// 使用說明:
// 檢驗表格時，請在 MatchingCardBackgroundDialog.ts 的 setUI 加入
// MatchingCardTableVerifier.verifyAllTable();
// 執行一次小遊戲，看沒有報錯
// 測試完畢後刪掉verifyAllTable

/** 檢查 翻翻牌 靜態表 */
export default class MatchingCardTableVerifier {
  public static verifyAllTable(): void {
    this.verifySettingTable();
    this.verifyPatternTable();
    this.verifyObstructTable();
    this.verifyBossTable();
    this.verifyItemTable();
  }

  /** 驗證設定表 */
  private static verifySettingTable(): void {
    console.log(`verifySettingTable`);

    const tableID = 1;
    const setting = TableManager.matchingCardSetting.findOne(tableID);
    if (setting == null) {
      console.error(`setting null`);
      return;
    }

    // 分數
    this.checkRange(setting.targetMatchCount, 10, 50, tableID);
    this.checkScore(setting.cardMatchScore, tableID);

    // 能量
    this.checkEnergy(setting.maxEnergyAmount, tableID);
    this.checkEnergyCost(setting.cardNotMatchLossEnergy, tableID);
    this.checkRange(setting.avoidNotMatchPenaltyQuota, 0, 10, tableID);
    this.checkEnergy(setting.baseConsumption, tableID);
    this.checkEnergy(setting.progressiveConsumption, tableID);
    this.checkRange(setting.matchCountGap, 1, 10, tableID);
    this.checkEnergy(setting.cardMatchGainEnergy, tableID);

    this.checkSecond(setting.totalGameTimeSec, tableID);
    this.checkSecond(setting.nextWavePromptSecond, tableID);
    this.checkSecond(setting.notMatchWaitSecond, tableID);
    this.checkSecond(setting.initViewSecond, tableID);
    this.checkSecond(setting.clickCardMinusLockSecond, tableID);
  }

  /** 驗證模式表 */
  private static verifyPatternTable(): void {
    console.log(`verifyPatternTable`);

    const patternList = TableManager.matchingCardPattern.getAll();
    if (patternList == null || patternList.length === 0) {
      console.error(`patternList null`);
      return;
    }

    patternList.forEach((patternTable) => {
      const tableID = patternTable.id;
      console.log(`verifyPatternTable: id=${tableID}`);

      this.checkPositiveNumber(patternTable.id, tableID);
      this.checkRange(
        patternTable.difficulty,
        MatchingCardDifficulty.None + 1,
        MatchingCardDifficulty.Max - 1,
        tableID
      );
      this.checkInArray(patternTable.cardCount, [4, 8, 12, 16], tableID);
      // 2<花色數<總牌數/2
      this.checkRange(patternTable.cardTypeCount, 2, patternTable.cardCount / 2, tableID);

      // 干擾ID清單
      if (patternTable.obstructIDList == null) {
        console.error(`干擾ID清單 ${patternTable.obstructIDList} 為null. id=${patternTable.id}`);
      } else if (Array.isArray(patternTable.obstructIDList) === false) {
        console.error(`干擾ID清單 ${patternTable.obstructIDList} 必須是number[]. id=${patternTable.id}`);
      } else {
        patternTable.obstructIDList.forEach((obstructID) => {
          const obstructData = TableManager.matchingCardObstruct.findOne(obstructID);
          if (obstructData == null) {
            console.error(`找不到干擾ID ${obstructID}. id=${patternTable.id}`);
          }
        });
      }

      this.checkRange(patternTable.obstructRate, 0, 1, tableID);

      //#region 交互影響

      //#endregion 交互影響
    });
  }

  /** 驗證模式表 */
  private static verifyObstructTable(): void {
    console.log(`verifyObstructTable`);

    const obstructList = TableManager.matchingCardObstruct.getAll();
    if (obstructList == null || obstructList.length === 0) {
      console.error(`obstructList null`);
      return;
    }

    obstructList.forEach((obstructTable) => {
      const tableID = obstructTable.id;
      console.log(`verifyObstructTable: id=${tableID}`);

      this.checkPositiveNumber(obstructTable.id, tableID);
      this.checkRange(
        obstructTable.obstructType,
        MatchingCardObstructType.None + 1,
        MatchingCardObstructType.Max - 1,
        tableID
      );

      // 秒數
      if (obstructTable.obstructType === MatchingCardObstructType.Lock) {
        this.checkSecond(obstructTable.obstructDurationSec, tableID);
      }
      // 不填
      else {
        this.checkFixNumber(obstructTable.obstructDurationSec, 0, tableID);
      }

      this.checkCardCount(obstructTable.obstructCardCount, tableID);
    });
  }

  /** 驗證敵人表 */
  private static verifyBossTable(): void {
    console.log(`verifyBossTable`);

    const bossList = TableManager.boss.getAll();
    if (bossList == null || bossList.length === 0) {
      console.error(`bossList null`);
      return;
    }

    bossList.forEach((bossTable) => {
      const tableID = bossTable.id;
      console.log(`verifyBossTable: id=${tableID}`);

      this.checkPositiveNumber(bossTable.id, tableID);
      this.checkString(bossTable.bossName, tableID);
      this.checkString(bossTable.bossNameKey, tableID);
      this.checkString(bossTable.imgUrl, tableID);

      this.checkRange(bossTable.matchingCardScale, 0.1, 2, tableID);
      this.checkOffsetPosition(bossTable.matchingCardLeft, tableID);
      this.checkOffsetPosition(bossTable.matchingCardTop, tableID);
    });
  }

  /** 驗證道具表 */
  private static verifyItemTable(): void {
    console.log(`verifyItemTable`);

    const itemList = TableManager.matchingCardItem.getAll();
    if (itemList == null || itemList.length === 0) {
      console.error(`itemList null`);
      return;
    }

    itemList.forEach((itemTable) => {
      const tableID = itemTable.id;
      console.log(`verifyItemTable: id=${tableID}`);
      this.checkLocalization(itemTable.nameKey, tableID);
      this.checkLocalization(itemTable.contentKey, tableID);
      this.checkString(itemTable.url, tableID);

      // 價格
      this.checkEnergy(itemTable.energy, tableID);

      this.checkRange(
        itemTable.itemFunction,
        MatchingCardItemFunction.None + 1,
        MatchingCardItemFunction.Max - 1,
        itemTable.id
      );

      switch (itemTable.itemFunction) {
        // 卡牌數
        case MatchingCardItemFunction.Unlock:
        case MatchingCardItemFunction.SeeThrough:
          this.checkCardCount(itemTable.value, tableID);
          break;

        // 秒數
        case MatchingCardItemFunction.FlipSpeedUp:
          // 不超出翻牌秒數
          this.checkRange(itemTable.value, -1 * MatchingCardNumber.FlipCardSecond, 0.001, tableID);
          break;

        // 填0
        case MatchingCardItemFunction.ExileEnemy:
        case MatchingCardItemFunction.FrozenEnemy:
          this.checkFixNumber(itemTable.value, 0, tableID);
          break;
        default:
          break;
      }

      switch (itemTable.itemFunction) {
        // 立即型
        case MatchingCardItemFunction.Unlock:
        case MatchingCardItemFunction.ExileEnemy:
          this.checkFixNumber(itemTable.duration, 0, tableID);

          break;
        // buff型
        case MatchingCardItemFunction.SeeThrough:
        case MatchingCardItemFunction.FrozenEnemy:
        case MatchingCardItemFunction.FlipSpeedUp:
          this.checkSecond(itemTable.duration, tableID);
          this.checkInteger(itemTable.duration, tableID);
          break;

        default:
          break;
      }

      this.checkSecond(itemTable.cooldownSec, tableID);
      this.checkInteger(itemTable.cooldownSec, tableID);
    });
  }

  //#region check
  /** 檢查多國字
   * @param key 多國字key
   * @param tableID 表格id
   */
  private static checkLocalization(key: string, tableID: number): void {
    if (key.length === 0 || key === Localization.getText(LocalKeyType.Common, key)) {
      console.error(`多國字 key=${key}, tableID=${tableID}`);
    }
  }

  /** 檢查字串
   * @param text 字串
   * @param tableID 表格id
   */
  private static checkString(text: string, tableID: number): void {
    if (text.length === 0) {
      console.error(`字串=${text}, tableID=${tableID}`);
    }
  }

  /** 檢查正數
   * @param value 檢查的數值
   * @param tableID 表格id
   */
  private static checkPositiveNumber(value: number, tableID: number): void {
    if (value <= 0) {
      console.error(`正數=${value}, tableID=${tableID}`);
    }
  }

  /** 檢查整數
   * @param value 檢查的數值
   * @param tableID 表格id
   */
  private static checkInteger(value: number, tableID: number): void {
    if (value % 1 !== 0) {
      console.error(`必需為整數=${value}, tableID=${tableID}`);
    }
  }

  /** 檢查固定數值
   * @param value 檢查的數值
   * @param fix 固定數值
   * @param tableID 表格id
   */
  private static checkFixNumber(value: number, fix: number, tableID: number): void {
    if (value !== fix) {
      console.error(`固定數值, value=${value}, tableID=${tableID}`);
    }
  }

  /** 檢查在陣列中的數
   * @param value 檢查的數值
   * @param tableID 表格id
   */
  private static checkInArray(value: number, targetList: number[], tableID: number): void {
    if (targetList.includes(value) === false) {
      console.error(`數 ${value} 不在陣列 ${targetList} 中, tableID=${tableID}`);
    }
  }

  /** 檢查分數
   * @param score 分數
   * @param tableID 表格id
   */
  private static checkScore(score: number, tableID: number): void {
    if (score <= 0 || score >= 10000) {
      console.error(`分數=${score}, tableID=${tableID}`);
    }
  }

  /** 檢查卡牌數
   * @param cardCount 卡牌數
   * @param tableID 表格id
   */
  private static checkCardCount(cardCount: number, tableID: number): void {
    if (cardCount <= 0 || cardCount >= 100) {
      console.error(`卡牌數=${cardCount}, tableID=${tableID}`);
    }
  }

  /** 檢查能量
   * @param energy 能量
   * @param tableID 表格id
   */
  private static checkEnergy(energy: number, tableID: number): void {
    if (energy <= 0 || energy > 1000) {
      console.error(`能量=${energy}, tableID=${tableID}`);
    }
  }

  /** 檢查偏移位置
   * @param offset 偏移x
   * @param tableID 表格id
   */
  private static checkOffsetPosition(offset: number, tableID: number): void {
    if (offset <= -1000 || offset >= 1000) {
      console.error(`偏移位置=${offset} 超出範圍, tableID=${tableID}`);
    }
  }

  /** 檢查能量消耗
   * @param minus 能量消耗
   * @param tableID 表格id
   */
  private static checkEnergyCost(minus: number, tableID: number): void {
    if (minus >= 0 || minus <= -1000) {
      console.error(`能量消耗=${minus}, tableID=${tableID}`);
    }
  }

  /** 檢查秒數
   * @param second 秒數
   * @param tableID 表格id
   */
  private static checkSecond(second: number, tableID: number): void {
    if (second <= 0 || second >= 600) {
      console.error(`秒數=${second}, tableID=${tableID}`);
    }
  }

  /** 檢查範圍的數字
   * @param value 檢查的數值
   * @param min 最小值
   * @param max 最大值
   * @param tableID 表格id
   */
  private static checkRange(value: number, min: number, max: number, tableID: number): void {
    if (value < min || value > max) {
      console.error(`範圍的數字=${value}, 超出範圍 ${min}~${max}, tableID=${tableID}`);
    }
  }
  //#endregion check
}
