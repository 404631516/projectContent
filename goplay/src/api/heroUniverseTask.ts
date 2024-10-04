import {
  HeroUniverseGetCompletedTaskListResultDto,
  HeroUniverseGetRunningTaskListResultDto,
  HeroUniverseTaskCompleteDto,
  HeroUniverseTaskCompleteResultDto,
  HeroUniverseTaskStartDialogAnswerDto,
  HeroUniverseTaskTakeDto,
  HeroUniverseTaskTakeResultDto,
} from '@/hero-api/dto/hero-universe-task.dto';
import { fetchV2 } from './http-server';
import { QuizStartResultDto } from '@/hero-api/dto/quiz.dto';

export class HeroUniverseTaskAPI {
  /**
   * 接任務
   * @param taskId 任務ID
   * @returns Promise<HeroUniverseTaskTakeResultDto>
   */
  public static takeTask(taskId: number): Promise<HeroUniverseTaskTakeResultDto> {
    const dto = new HeroUniverseTaskTakeDto();
    dto.dataId = taskId;

    return fetchV2<HeroUniverseTaskTakeResultDto>(
      '/v2/hero-universe-task/take-task',
      dto,
      new HeroUniverseTaskTakeResultDto(),
    );
  }

  /**
   * 完成任務
   * @param taskId 任務ID
   * @returns Promise<HeroUniverseTaskCompleteResultDto>
   */
  public static completeTask(taskId: number): Promise<HeroUniverseTaskCompleteResultDto> {
    const dto = new HeroUniverseTaskCompleteDto();
    dto.runningTaskUid = taskId;

    return fetchV2<HeroUniverseTaskCompleteResultDto>(
      '/v2/hero-universe-task/complete-task',
      dto,
      new HeroUniverseTaskCompleteResultDto([], null),
    );
  }

  /**
   * 取得已完成任務清單 Id set
   * @returns Promise<Set<number>>
   */
  public static async getCompletedTaskIdSet(): Promise<Set<number>> {
    // 已完成任務 ID Set
    const completedTaskIdSet = new Set<number>();

    // 取得已完成任務列表
    const completedTaskListDto = await HeroUniverseTaskAPI.getCompletedTaskList();
    completedTaskListDto.completedTaskList.forEach((task) => {
      // 計算起始任務 ID
      const baseTaskId = task.pageId * 128;

      // 逐一檢查每個 bitFlag，如果為 1，則將對應的任務 ID 添加到列表中
      for (let i = 0; i < 32; i++) {
        if (task.bitFlag1 & (1 << i)) {
          completedTaskIdSet.add(baseTaskId + i);
        }
        if (task.bitFlag2 & (1 << i)) {
          completedTaskIdSet.add(baseTaskId + 32 + i);
        }
        if (task.bitFlag3 & (1 << i)) {
          completedTaskIdSet.add(baseTaskId + 64 + i);
        }
        if (task.bitFlag4 & (1 << i)) {
          completedTaskIdSet.add(baseTaskId + 96 + i);
        }
      }
    });

    return completedTaskIdSet;
  }

  /**
   * 取得已完成任務清單
   * @returns Promise<HeroUniverseGetCompletedTaskListResultDto>
   */
  public static getCompletedTaskList(): Promise<HeroUniverseGetCompletedTaskListResultDto> {
    return fetchV2<HeroUniverseGetCompletedTaskListResultDto>(
      '/v2/hero-universe-task/completed-task-list',
      {},
      new HeroUniverseGetCompletedTaskListResultDto(),
    );
  }

  /**
   * 取得進行中任務清單
   * @returns Promise<HeroUniverseGetRunningTaskListResultDto>
   */
  public static getRunningTaskList(): Promise<HeroUniverseGetRunningTaskListResultDto> {
    return fetchV2<HeroUniverseGetRunningTaskListResultDto>(
      '/v2/hero-universe-task/running-task-list',
      {},
      new HeroUniverseGetRunningTaskListResultDto(),
    );
  }

  /**
   * 開始進行對話答題
   */
  public static startDialogAnswer(taskId: number): Promise<QuizStartResultDto> {
    const dto = new HeroUniverseTaskStartDialogAnswerDto();
    dto.runningTaskUid = taskId;

    return fetchV2<QuizStartResultDto>(
      '/v2/hero-universe-task/start-dialog-answer',
      dto,
      new QuizStartResultDto('', 0),
    );
  }
}
