import { MultiDataTaskConditionType, TaskConditionType } from '../entity/base-task.entity';
import { LogQuizSession } from '../entity/quiz.entity';
import { User } from '../entity/user.entity';
import { SignInResultDto } from './auth.dto';
import { TeacherAwardInventorySourceTypeEnum } from './teacher-award-inventory.dto';

export enum EventId {
  UserCreated = 'user.created',
  UserSignIn = 'user.signIn',

  CheckIntegrity = 'check.integrity',

  FlushCache = 'flush.cache',
  SyncCache = 'sync.cache',

  HeroUniverseTaskProgressUpdate = 'heroUniverse.task.progress.update',

  StudyTaskProgressUpdate = 'study.task.progress.update',

  QuizSessionFinalized = 'quiz.session.finalized',

  AddTeacherInventoryAward = 'teacher.inventory.award.added',
}

export interface UserCreatedEvent {
  user: User;
}

export interface UserSignInEvent {
  signResultDto: SignInResultDto;
}

export interface UserEvent {
  uid: number;
}

export interface TaskProgressUpdateEvent {
  /** 使用者uid */
  uid: number;
  /** 要更新進度的任務Id清單 */
  runningTaskUidList: number[];

  /** conditionType1~3之中 完成的任務條件 */
  updateProcessConditions: TaskConditionType[];

  /** 多重指定條件任務 完成的任務條件 */
  multiDataTaskConditionType: MultiDataTaskConditionType;
  /** 多重指定條件任務 要更新任務進度的DataId */
  multiDataTaskDataId: number;

  /** 更新任務進度時, 針對conditionValue要做的操作 */
  conditionValueAction: ConditionValueAction;
  /** 更新任務進度時, 要操作conditionValue的調整值 */
  adjustmentValue: number;
}

/** 更新任務進度時, 針對conditionValue要做的操作 */
export enum ConditionValueAction {
  /** 扣除剩餘要求次數 */
  Decrease = 1,
  /** 比對conditionValue是否通過要求數值 */
  Compare,
}

export interface QuizSessionFinalizedEvent {
  /** quiz session log */
  logQuizSession: LogQuizSession;
}

export interface TeacherInventoryAwardAddedEvent {
  /** 要派發獎勵的教師uid */
  teacherUid: number;
  /** 獎勵來源類型 */
  sourceType: TeacherAwardInventorySourceTypeEnum;
  /** 根據獎勵來源不同而不同的資料 */
  sourceTypeData: string;
}
