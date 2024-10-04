import { UserOwnedEntity } from './base.entity';
import { BaseTaskCompleteLogEntity, BaseTaskRunningEntity } from './base-task.entity';
import { ErrorId } from '../dto/error-id';
import { Helper } from '../core/helper';
import { TaskHelper } from '../core/hero-universe-task.helper';

interface GetBitFlagPositionResult {
  flag: 'bitFlag1' | 'bitFlag2' | 'bitFlag3' | 'bitFlag4';
  position: number;
}

/** 此表格列出當前正在進行的任務。每條記錄代表一個進行中的任務，紀錄任務 ID 以及完成狀況。 */
export class HeroUniverseTaskRunningEntity extends BaseTaskRunningEntity {}

/** 因雄宇宙任務完成日誌 */
export class HeroUniverseTaskCompleteLogEntity extends BaseTaskCompleteLogEntity {}

/**
 * 此表格列出已完成的任務。
 * 每條記錄包含 128 個任務，通過 pageId 進行分頁。
 * 例如，從 taskId 0 到 taskId 127 的任務在 pageId = 1，從 taskId 128 到 taskId 255 的任務在 pageId = 2。
 */
export class HeroUniverseTaskCompleteEntity extends UserOwnedEntity {
  /**
   * unique id
   */
  bitFlagUid: number;

  /**
   * 用於分頁的頁碼
   */
  pageId: number;

  /**
   * 任務列表 Bit flags
   */
  bitFlag1: number = 0;

  /**
   * 任務列表 Bit flags
   */
  bitFlag2: number = 0;

  /**
   * 任務列表 Bit flags
   */
  bitFlag3: number = 0;

  /**
   * 任務列表 Bit flags
   */
  bitFlag4: number = 0;

  /**
   * 獲取指定任務的完成狀態。
   * 根據全局任務索引解析對應的位元標誌及位置，然後返回該位置的位元值。
   * @param taskGlobalIndex 全局任務索引，表示所查詢的任務索引。
   * @returns 表示任務是否完成（true 為已完成，false 為未完成）。
   */
  getBit(taskGlobalIndex: number): boolean {
    const flagInfo = this.getBitFlagPosition(taskGlobalIndex);
    return Helper.getBit(this[flagInfo.flag], flagInfo.position);
  }

  /**
   * 設定指定任務的完成狀態。
   * 根據全局任務索引解析位元標誌及位置，並設定該位置的位元值。
   * @param taskGlobalIndex 全局任務索引，表示所要更新的任務索引。
   * @param value 要設置的值，`true` 表示任務完成，`false` 表示未完成。
   */
  setBit(taskGlobalIndex: number, value: boolean): void {
    const flagInfo = this.getBitFlagPosition(taskGlobalIndex);
    this[flagInfo.flag] = Helper.setBit(this[flagInfo.flag], flagInfo.position, value);
  }

  /**
   * 取得對應的任務 Bit flag 和位置。
   * @param taskGlobalIndex 全局任務索引，必須是正整數。
   * @returns {flag: 'bitFlag1' | 'bitFlag2' | 'bitFlag3' | 'bitFlag4', position: number}
   * 返回包含 Bit flag 的名稱和對應位置的物件。
   */
  private getBitFlagPosition(taskGlobalIndex: number): GetBitFlagPositionResult {
    Helper.ensure(taskGlobalIndex > 0, ErrorId.InvalidArgument, 'taskGlobalIndex 必須為正整數');

    // 確保索引在 0 到 127 之間。
    const groupedIndex = taskGlobalIndex % TaskHelper.tasksPerPage;

    // 每個 bitFlag 包含 32 個位元，確定任務位於哪一個 bitFlag（bitFlag1 到 bitFlag4）。
    const flagIndex = Math.floor(groupedIndex / 32) + 1;

    // 在 bitFlag 中，具體的位元位置 (0 ~ 31)。
    const bitPosition = groupedIndex % 32;

    // 返回對應的 flagIndex 和位置。
    switch (flagIndex) {
      case 1:
        return { flag: 'bitFlag1', position: bitPosition };
      case 2:
        return { flag: 'bitFlag2', position: bitPosition };
      case 3:
        return { flag: 'bitFlag3', position: bitPosition };
      case 4:
        return { flag: 'bitFlag4', position: bitPosition };
      default:
        Helper.ensure(false, ErrorId.InvalidArgument, 'flagIndex 超出範圍');
        return { flag: 'bitFlag1', position: 0 };
    }
  }
}
