import {
  BaseTaskCompleteLogEntity,
  BaseTaskRunningEntity,
  ContestWebGameTaskDetail,
  TaskConditionDetails,
} from './base-task.entity';
import { Award } from '../dto/award.dto';
import { UserOwnedEntity } from './base.entity';
import { CompleteStatusType } from '../dto/study-task.dto';
import { JsonHelper } from '../dto/json.helper';
import { StringHelper } from '../dto/string.helper';

/** 此表格列出當前正在進行的任務。每條記錄代表一個進行中的任務，紀錄任務 ID 以及完成狀況。 */
export class StudyTaskRunning extends BaseTaskRunningEntity {
  taskName: string;

  taskDescription: string;

  effectiveDate: Date;

  expiryDate: Date;

  awardList: string;

  /**
   * 取得獎勵清單
   * @returns 獎勵清單
   */
  public getAwardList(): Award[] {
    return JsonHelper.parseFromJson(this.awardList) || [];
  }

  /**
   * 設定獎勵清單
   * @param awardList 獎勵清單
   */
  public setAwardList(awardList: Award[]) {
    this.awardList = JsonHelper.stringifyToJson(awardList);
  }

  /**
   * 取得學習任務詳細
   * @returns 學習任務詳細
   */
  public getDetail(): StudyTaskDetail {
    return JsonHelper.parseFromJson(this.detail) || { contestWebGameTaskDetails: [] };
  }

  /**
   * 設定學習任務詳細
   * @param detail 學習任務詳細
   */
  public setDetail(detail: StudyTaskDetail): void {
    this.detail = JsonHelper.stringifyToJson(detail);
  }
}

/** 學習任務完成日誌 */
export class StudyTaskCompleteLog extends BaseTaskCompleteLogEntity {
  completeStatusType: CompleteStatusType;

  /**
   * 取得學習任務詳細
   * @returns 學習任務詳細
   */
  public getDetail(): StudyTaskDetail {
    return JsonHelper.parseFromJson(this.detail) || { contestWebGameTaskDetails: [] };
  }

  /**
   * 設定學習任務詳細
   * @param detail 學習任務詳細
   */
  public setDetail(detail: StudyTaskDetail): void {
    this.detail = JsonHelper.stringifyToJson(detail);
  }
}

/** 教師派學習任務日誌 */
export class StudyTaskTeacherDeliveryLog extends UserOwnedEntity {
  logUid: number;

  taskName: string;

  taskDescription: string;

  studentUidList: string;

  taskConditionDetails: string;

  effectiveDate: Date;

  expiryDate: Date;

  awardList: string;

  /**
   * 取得學生uid清單
   * @returns 學生uid清單
   */
  public getStudentUidList(): number[] {
    return StringHelper.commaStringToNumberArray(this.studentUidList);
  }

  /**
   * 設定學生uid清單
   * @param studentUidList 學生uid清單
   */
  public setStudentUidList(studentUidList: number[]) {
    this.studentUidList = StringHelper.numberArrayToCommaString(studentUidList);
  }

  /**
   * 取得任務條件內容
   * @returns 任務條件內容
   */
  public getTaskConditionDetails(): TaskConditionDetails {
    return JsonHelper.parseFromJson(this.taskConditionDetails) || {};
  }

  /**
   * 設定任務條件內容
   * @param taskConditionDetails 任務條件內容
   */
  public setTaskConditionDetails(taskConditionDetails: TaskConditionDetails) {
    this.taskConditionDetails = JsonHelper.stringifyToJson(taskConditionDetails);
  }

  /**
   * 取得獎勵清單
   * @returns 獎勵清單
   */
  public getAwardList(): Award[] {
    return JsonHelper.parseFromJson(this.awardList) || [];
  }
  /**
   * 設定獎勵清單
   * @param awardList 獎勵清單
   */
  public setAwardList(awardList: Award[]) {
    this.awardList = JsonHelper.stringifyToJson(awardList);
  }
}

/** 學習任務詳細資訊 */
export interface StudyTaskDetail {
  /** 答題遊戲/魔王挑戰賽相關任務詳細資訊列表 */
  contestWebGameTaskDetails: ContestWebGameTaskDetail[];
  // 如果有其他項目需增加,可以在這裡新增
}
