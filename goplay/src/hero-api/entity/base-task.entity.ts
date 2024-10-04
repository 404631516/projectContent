import { StringHelper } from '../dto/string.helper';
import { UserOwnedEntity } from './base.entity';

/** 因雄宇宙任務條件類型 */
export enum TaskConditionType {
  /** 無任務條件 */
  None = 0,
  /** 完成因雄地圖對話答題 */
  DialogueAnswer = 1,
  /** 完成因雄地圖對話戰鬥 */
  DialogueCombat = 2,
  /** 完成任意答題遊戲 的次數 */
  FinishAnswerGameCount = 3,
  /** 完成任意答題遊戲並且挑戰成功 的次數 */
  FinishAnswerGameSuccessCount = 4,
  /** 完成任意魔王挑戰 的次數 */
  FinishWorldContestCount = 5,
  /** 完成任魔王挑戰並且挑戰成功 的次數 */
  FinishWorldContestSuccessCount = 6,
  /** 完成國文答題遊戲 的次數 */
  FinishChineseAnswerGameCount = 7,
  /** 完成國文答題遊戲並且挑戰成功 的次數 */
  FinishChineseAnswerGameSuccessCount = 8,
  /** 完成數學答題遊戲 的次數 */
  FinishMathAnswerGameCount = 9,
  /** 完成數學答題遊戲並且挑戰成功 的次數 */
  FinishMathAnswerGameSuccessCount = 10,
  /** 完成自然答題遊戲 的次數 */
  FinishScienceAnswerGameCount = 11,
  /** 完成自然答題遊戲並且挑戰成功 的次數 */
  FinishScienceAnswerGameSuccessCount = 12,
  /** 完成英文答題遊戲 的次數 */
  FinishEnglishAnswerGameCount = 13,
  /** 完成英文答題遊戲並且挑戰成功 的次數 */
  FinishEnglishAnswerGameSuccessCount = 14,
  /** 完成自主學習答題遊戲 的次數 */
  FinishSelfLearningAnswerGameCount = 15,
  /** 完成自主學習答題遊戲並且挑戰成功 的次數 */
  FinishSelfLearningAnswerGameSuccessCount = 16,
}

/** 多重指定條件 的任務條件類型 */
export enum MultiDataTaskConditionType {
  None = 0,
  /** 完成指定答題遊戲x次,
   * dataId array為contestId,
   * value array為要求完成次數 */
  FinishMultiContestWebGame = 1,
}

/** 任務條件相關參數 */
export interface TaskConditionDetails {
  conditionType1?: TaskConditionType;
  conditionType2?: TaskConditionType;
  conditionType3?: TaskConditionType;
  requiredConditionValue1?: number;
  requiredConditionValue2?: number;
  requiredConditionValue3?: number;
  multiDataTaskConditionType?: MultiDataTaskConditionType;
  multiDataTaskDataIds?: number[];
  multiDataTaskValues?: number[];
}

/** 學習任務詳細資訊 */
export interface StudyTaskDetail {
  /** 賽事詳細資訊列表 */
  contestWebGameTaskDetails: ContestWebGameTaskDetail[];
  // 如果有其他項目需增加,可以在這裡新增
}

/** 賽事詳細資訊 */
export interface ContestWebGameTaskDetail {
  contestId: number;
  gamePlayerLogId: number;
  quizCorrectCount: number;
  quizAnswerCount: number;
  gameScore: number;
}

/** 此表格列出當前正在進行的任務。每條記錄代表一個進行中的任務，紀錄任務 ID 以及完成狀況。 */
export class BaseTaskRunningEntity extends UserOwnedEntity {
  /**
   * unique id
   */
  runningTaskUid: number;

  /**
   * 資料id, 視繼承的TaskRunningEntity而做不同用途,
   * 例如: HeroUniverseTaskRunningEntity.dataId 代表任務id、StudyTaskRunningEntity.dataId 代表教師uid
   */
  dataId: number;

  /**
   * 資料log id, 視繼承的TaskRunningEntity而做不同用途,
   * 例如: StudyTaskRunningEntity.dataLogId 代表教師派任務log id
   */
  dataLogId: number;

  /**
   * 任務條件1 類型
   */
  conditionType1: TaskConditionType;

  /**
   * 任務條件2 類型
   */
  conditionType2: TaskConditionType;

  /**
   * 任務條件3 類型
   */
  conditionType3: TaskConditionType;

  /**
   * 任務條件1 剩餘要求值
   */
  conditionValue1: number = 0;

  /**
   * 任務條件2 剩餘要求值
   */
  conditionValue2: number = 0;

  /**
   * 任務條件3 剩餘要求值
   */
  conditionValue3: number = 0;

  /**
   * 多重指定條件 任務條件類型
   */
  multiDataTaskConditionType: MultiDataTaskConditionType;

  /**
   * 多重指定條件 任務條件DataId array, 用逗點分割的字串, 請使用get、set function做存取
   */
  multiDataTaskDataIds: string;

  /**
   * 多重指定條件 任務要求數值, 對應條件DataId array, 用逗點分割的字串, 請使用get、set function做存取
   */
  multiDataTaskValues: string;

  /**
   * 詳細資訊, 視繼承的TaskRunningEntity而做不同用途。
   * - 例如: 學習任務, 儲存多筆ContestWebGameTaskDetail的json字串。
   * - 其內容包括 contestId、gamePlayerLogId、quizCorrectCount、quizAnswerCount 和 gameScore。
   */
  detail: string;

  /**
   * 接取時間
   */
  takeAt: Date;

  /** 設定multiDataTaskDataIds */
  public setMultiDataTaskDataIds(ids: number[]): void {
    this.multiDataTaskDataIds = StringHelper.numberArrayToCommaString(ids);
  }

  /** 取得multiDataTaskDataIds */
  public getMultiDataTaskDataIds(): number[] {
    if (!this.multiDataTaskDataIds) {
      return [];
    }
    return StringHelper.commaStringToNumberArray(this.multiDataTaskDataIds);
  }

  /** 設定multiDataTaskValues */
  public setMultiDataTaskValues(values: number[]): void {
    this.multiDataTaskValues = StringHelper.numberArrayToCommaString(values);
  }

  /** 取得multiDataTaskValues */
  public getMultiDataTaskValues(): number[] {
    if (!this.multiDataTaskValues) {
      return [];
    }
    return StringHelper.commaStringToNumberArray(this.multiDataTaskValues);
  }

  /**
   * 檢查進行中任務的條件是否皆已完成，包含任務條件、多重指定條件。
   * @param runningTask 進行中任務的資料
   * @returns 是否完成
   */
  public isTaskCompleted(runningTask: BaseTaskRunningEntity): boolean {
    // 檢查任務條件是否皆已完成
    const maxConditionCount = 3;
    for (let i = 1; i <= maxConditionCount; i++) {
      const conditionValue = runningTask[`conditionValue${i}` as keyof BaseTaskRunningEntity] as number;
      // 若 conditionValue 大於 0 代表未完成
      if (conditionValue > 0) {
        return false;
      }
    }

    // 檢查多重指定條件是否皆已完成
    const multiDataTaskValues = runningTask.getMultiDataTaskValues();
    for (const multiDataTaskValue of multiDataTaskValues) {
      // 若 multiDataTaskValue 大於 0 代表未完成
      if (multiDataTaskValue > 0) {
        return false;
      }
    }
    return true;
  }
}

/** 因雄宇宙任務完成日誌 */
export class BaseTaskCompleteLogEntity extends UserOwnedEntity {
  /**
   * unique id
   */
  taskLogUid: number;

  /**
   * 資料id, 視繼承的TaskCompleteLogEntity而做不同用途,
   * 例如: HeroUniverseTaskCompleteLogEntity.dataId 代表任務id、StudyTaskCompleteLogEntity.dataId 代表教師uid
   */
  dataId: number;

  /**
   * 資料log id, 視繼承的TaskCompleteLogEntity而做不同用途,
   * 例如: StudyTaskCompleteLogEntity.dataLogId 代表教師派任務log id
   */
  dataLogId: number;

  /**
   * 詳細資訊, 視繼承的TaskCompleteLogEntity而做不同用途。
   * - 例如: 學習任務, 儲存多筆ContestWebGameTaskDetail的json字串。
   * - 其內容包括 contestId、gamePlayerLogId、quizCorrectCount、quizAnswerCount 和 gameScore。
   */
  detail: string;

  /**
   * 任務接取時間
   */
  takeAt: Date;

  /**
   * 任務完成時間
   */
  finishedAt: Date;
}
