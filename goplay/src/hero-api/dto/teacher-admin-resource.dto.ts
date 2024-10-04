import { ApiResOkBaseDto } from './api.dto';

/** 取得學習任務次數資訊 response */
export class GetStudyTaskCountInfoResultDto extends ApiResOkBaseDto {
  /** 已使用的學習任務次數 */
  usedStudyTaskCount: number;
  /** 教師可派的任務次數最大值 */
  maxTaskCount: number;

  /**
   * 建構子
   * @param studyTaskCount 學習任務次數
   * @param maxTaskCount 教師可派的任務次數最大值
   */
  constructor(studyTaskCount: number, maxTaskCount: number) {
    super();
    this.usedStudyTaskCount = studyTaskCount;
    this.maxTaskCount = maxTaskCount;
  }
}
