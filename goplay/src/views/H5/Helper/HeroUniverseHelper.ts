import { TaskConditionType } from '@/hero-api/entity/base-task.entity';
import Helper, { ErrorId } from './Helper';

export default class HeroUniverseHelper {
  /**
   * 取得宇宙任務完成條件名稱
   * @param detailInformation 任務詳情
   * @returns 完成條件的描述
   */
  public static getUniverseTaskCriteriaText(type: TaskConditionType, progress: string): string {
    switch (type) {
      case TaskConditionType.DialogueAnswer:
        return `完成因雄地圖對話答題 (${progress})`;
      case TaskConditionType.DialogueCombat:
        return `完成因雄地圖對話戰鬥 (${progress})`;
      case TaskConditionType.FinishAnswerGameCount:
        return `完成任意答題遊戲的次數 (${progress})`;
      case TaskConditionType.FinishAnswerGameSuccessCount:
        return `完成任意答題遊戲並且挑戰成功的次數 (${progress})`;
      case TaskConditionType.FinishWorldContestCount:
        return `完成任意魔王挑戰的次數 (${progress})`;
      case TaskConditionType.FinishWorldContestSuccessCount:
        return `完成任魔王挑戰並且挑戰成功的次數 (${progress})`;
      case TaskConditionType.FinishChineseAnswerGameCount:
        return `完成國文答題遊戲的次數 (${progress})`;
      case TaskConditionType.FinishChineseAnswerGameSuccessCount:
        return `完成國文答題遊戲並且挑戰成功的次數 (${progress})`;
      case TaskConditionType.FinishMathAnswerGameCount:
        return `完成數學答題遊戲的次數 (${progress})`;
      case TaskConditionType.FinishMathAnswerGameSuccessCount:
        return `完成數學答題遊戲並且挑戰成功的次數 (${progress})`;
      case TaskConditionType.FinishScienceAnswerGameCount:
        return `完成自然答題遊戲的次數 (${progress})`;
      case TaskConditionType.FinishScienceAnswerGameSuccessCount:
        return `完成自然答題遊戲並且挑戰成功的次數 (${progress})`;
      case TaskConditionType.FinishEnglishAnswerGameCount:
        return `完成英文答題遊戲的次數 (${progress})`;
      case TaskConditionType.FinishEnglishAnswerGameSuccessCount:
        return `完成英文答題遊戲並且挑戰成功的次數 (${progress})`;
      case TaskConditionType.FinishSelfLearningAnswerGameCount:
        return `完成自主學習答題遊戲的次數 (${progress})`;
      case TaskConditionType.FinishSelfLearningAnswerGameSuccessCount:
        return `完成自主學習答題遊戲並且挑戰成功的次數 (${progress})`;
      default:
        Helper.assert(ErrorId.VariableUndefined, `沒有此類型: ${type}`);
        return '';
    }
  }
}
