import { HeroUniverseTaskCompleteEntity, HeroUniverseTaskRunningEntity } from '../entity/hero-universe-task.entity';
import { HeroUniverseTaskItem } from '../json-entity/hero-universe-task.table';
import { ApiResOkBaseDto } from './api.dto';
import { Award } from './award.dto';

/** 接任務request */
export class HeroUniverseTaskTakeDto {
  /** 承接任務Id */
  dataId: number;
}

/** 接任務response */
export class HeroUniverseTaskTakeResultDto extends ApiResOkBaseDto {
  /** 成功承接的任務 */
  takenTask: HeroUniverseTaskRunningEntity;
}

/** 完成任務request */
export class HeroUniverseTaskCompleteDto {
  /** 要完成的任務uid */
  runningTaskUid: number;
}

/** 完成任務response */
export class HeroUniverseTaskCompleteResultDto extends ApiResOkBaseDto {
  /** 已發放的獎品清單 */
  awardList: Award[];
  /** 自動承接的下一階段任務(沒有則填null) */
  nextTask: HeroUniverseTaskRunningEntity | null;

  /**
   * 建構子
   * @param awardList 任務獎勵清單
   * @param nextTask 下一階段任務
   */
  constructor(awardList: Award[], nextTask: HeroUniverseTaskRunningEntity | null) {
    super();
    this.awardList = awardList;
    this.nextTask = nextTask;
  }
}

/** 取得已完成任務清單response */
export class HeroUniverseGetCompletedTaskListResultDto extends ApiResOkBaseDto {
  /** 已完成任務清單 */
  completedTaskList: HeroUniverseTaskCompleteEntity[];
}

/** 取得進行中任務清單response */
export class HeroUniverseGetRunningTaskListResultDto extends ApiResOkBaseDto {
  /** 進行中任務清單 */
  runningTaskList: HeroUniverseTaskRunningEntity[];
}

/** 開始進行對話答題 request */
export class HeroUniverseTaskStartDialogAnswerDto {
  /** 要開始進行對話答題的任務uid */
  runningTaskUid: number;
}

/**
 * 用於返回問題列表的資料傳輸物件 (DTO)。
 */
export class UploadHeroUniverseTaskExcelResultDto extends ApiResOkBaseDto {
  tasks: HeroUniverseTaskItem[];

  /**
   * 建構子，用於創建一個新的 UploadHeroUniverseTaskExcelResultDto 實例。
   * @param tasks 問題列表。
   */
  constructor(tasks: HeroUniverseTaskItem[]) {
    super();
    this.tasks = tasks;
  }
}
