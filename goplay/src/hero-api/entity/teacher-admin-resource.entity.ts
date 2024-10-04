import { UserOwnedUniqueEntity } from './base.entity';

/** 用於存放教師相關的管理資源 */
export class TeacherAdminResource extends UserOwnedUniqueEntity {
  /** 在每次教師指派任務後增加 */
  studyTaskCount: number;

  studyTaskResetDate: Date;
}
