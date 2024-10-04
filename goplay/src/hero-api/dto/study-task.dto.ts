import { ApiResOkBaseDto } from './api.dto';
import { Award } from './award.dto';
import { StudyTaskCompleteLog, StudyTaskRunning, StudyTaskTeacherDeliveryLog } from '../entity/study-task.entity';
import { MultiDataTaskConditionType, TaskConditionType } from '../entity/base-task.entity';
import { TeacherDeliveryAward } from './teacher-award-inventory.dto';
import { ListDataDto, PagedResultDto } from './core.dto';
import { MssrSimpleUserInfo } from '../module/mssr/bridge/dto/bridge-user.dto';

/**
 * 完成狀態類型
 */
export enum CompleteStatusType {
  /** 進行中 */
  Running = 1,
  /** 完成 */
  Success = 2,
  /** 逾期失敗 */
  ExpiredFail = 3,
}

/** 派任務request */
export class DeliveryStudyTaskDto {
  /** 學生uid清單 */
  studentUidList: number[];

  /** 任務名稱 */
  taskName: string = '學習任務';

  /** 任務描述 */
  taskDescription: string = '學習任務描述';

  /** 任務條件1 類型 */
  conditionType1: TaskConditionType;

  /** 任務條件2 類型 */
  conditionType2: TaskConditionType;

  /** 任務條件3 類型 */
  conditionType3: TaskConditionType;

  /** 任務條件1 要求值 */
  requiredConditionValue1: number;

  /** 任務條件2 要求值 */
  requiredConditionValue2: number;

  /** 任務條件3 要求值 */
  requiredConditionValue3: number;

  /** 多重指定條件 類型 */
  multiDataTaskConditionType: MultiDataTaskConditionType;

  /** 多重指定條件 任務id清單 */
  multiDataTaskDataIds: number[];

  /** 多重指定條件 任務值清單 */
  multiDataTaskValues: number[];

  /** 任務生效時間 */
  effectiveDate: Date;

  /** 任務到期時間 */
  expiryDate: Date;

  /** 任務獎勵清單 */
  teacherDeliveryAwardList: TeacherDeliveryAward[];
}

/** 派任務response */
export class StudyTaskTakeResultDto extends ApiResOkBaseDto {}

/** 查看已派的任務response */
export class GetDeliveredTasksPagedResultDto extends PagedResultDto<StudyTaskTeacherDeliveryLog> {
  /** 已派任務清單 */
  declare entities: StudyTaskTeacherDeliveryLog[];
}

/** 查看已派任務學生完成狀態request */
export class GetStudentCompleteStatusListDataDto extends ListDataDto {
  /** 教師派任務log uid */
  logUid: number;
}

/**
 * 查看已派任務學生完成狀態response
 * 由 StudyTaskRunningEntity 與 StudyTaskCompleteLogEntity 組成
 */
export class GetStudentCompleteStatusPagedResultDto extends PagedResultDto<StudentTaskStatus> {
  /** 學生任務完成狀態清單 */
  declare entities: StudentTaskStatus[];
}

/** 學生任務完成狀態 */
export interface StudentTaskStatus {
  simpleUserInfo: MssrSimpleUserInfo;
  detail: string;
  multiDataTaskValues: number[];
}

/** 完成任務request */
export class StudyTaskCompleteDto {
  /** 要完成的任務uid */
  runningTaskUid: number;
}

/** 完成任務response */
export class StudyTaskCompleteResultDto extends ApiResOkBaseDto {
  /** 已發放的獎勵清單 */
  awardList: Award[];

  /**
   * 建構子
   * @param awardList 任務獎勵清單
   * @param nextTask 下一階段任務
   */
  constructor(awardList: Award[]) {
    super();
    this.awardList = awardList;
  }
}

/** 取得已完成任務清單response */
export class StudyGetCompletedTaskPagedResultDto extends PagedResultDto<TaskCompletionRecord> {
  /** 任務完成紀錄清單 */
  declare entities: TaskCompletionRecord[];
}

/** 任務完成紀錄 */
export interface TaskCompletionRecord {
  /** 已完成任務log */
  studyTaskCompleteLog: StudyTaskCompleteLog;
  /** 教師派任務log */
  studyTaskTeacherDeliveryLog: StudyTaskTeacherDeliveryLog;
}

/** 取得進行中任務清單response */
export class StudyGetRunningTaskListResultDto extends ApiResOkBaseDto {
  /** 進行中任務清單 */
  runningTaskList: StudyTaskRunning[];
}

/** 放棄逾期的任務request */
export class GiveUpExpiredTaskDto {
  /** 要放棄的任務uid */
  runningTaskUid: number;
}

/** 放棄逾期的任務response */
export class GiveUpExpiredTaskResultDto extends ApiResOkBaseDto {}

/** 取得任務完成度response */
export class GetStudyTaskCompletionResultDto extends ApiResOkBaseDto {
  /** 進行中任務數量 */
  runningTaskCount: number;
  /** 已成功完成任務數量 */
  completedTaskCount: number;
  /** 逾期失敗任務數量 */
  expiredFailTaskCount: number;
}
