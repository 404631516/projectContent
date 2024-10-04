import { ContestAwardItemTypeEnum } from '../dto/award.dto';
import { TaskConditionType } from '../entity/base-task.entity';
import { JsonTable, TableItem } from '../json-table/json.table';

enum HeroUniverseTaskType {
  MainStory = 1,
  SideStory,
  Event,
  Daily,
  Special,
}

/**
 * HeroUniverseTaskItem 類別，表示一個因雄宇宙任務項目。
 */
export class HeroUniverseTaskItem extends TableItem {
  /**
   * 任務unique id
   */
  id: number;

  /**
   * 任務代碼, 同個任務代碼可能分成多個階段的任務
   */
  taskCode: number;

  /**
   * 任務階段
   */
  stage: number;

  /**
   * 是否為最終階段
   */
  isFinalStage: boolean;

  /**
   * 前置條件:任務id
   */
  prerequisiteTaskId: number;

  /**
   * 前置條件:已解鎖英雄數量
   */
  prerequisiteUnlockHeroCount: number;

  /**
   * UI顯示用分類, 主線任務、支線任務、活動任務之類的
   */
  taskType: HeroUniverseTaskType;

  /**
   * 任務名稱
   */
  taskName: string;

  /**
   * 任務描述
   */
  taskDescription: string;

  /**
   * 接取任務的對象npc id
   */
  npcId: number;

  /**
   * 交付任務的對象npc id, 與完成任務對話綁定
   */
  turnInNpcId: number;

  /**
   * 若為對話戰鬥或對話答題等宇宙地圖事件任務, 是否在接取任務對話後就馬上觸發一次事件
   */
  autoTriggerOnTake: boolean;

  /**
   * 任務條件1 類型
   */
  conditionType1: TaskConditionType;

  /**
   * 任務條件1 完成進度
   */
  conditionValue1: number;

  /**
   * 任務條件2 類型
   */
  conditionType2: TaskConditionType;

  /**
   * 任務條件2 完成進度
   */
  conditionValue2: number;

  /**
   * 任務條件3 類型
   */
  conditionType3: TaskConditionType;

  /**
   * 任務條件3 完成進度
   */
  conditionValue3: number;

  /**
   * 承接任務對話
   */
  takeTaskDialog: string;

  /**
   * 任務進行中對話
   */
  progressTaskDialog: string;

  /**
   * 完成任務對話
   */
  completeTaskDialog: string;

  /**
   * 若為對話答題事件才填此值, 題庫key
   */
  quizSetKey: string;

  /**
   * 若為對話答題事件才填此值, 答題題數
   */
  questionsNumber: number;

  /**
   * 若為對話答題事件才填此值, 是否隨機題目順序
   */
  isRandomQuestionOrder: boolean;

  /**
   * 若為對話答題事件才填此值, 合格答對題數
   */
  requiredCorrectAnswers: number;

  /**
   * 若為對話戰鬥事件才填此值, 戰鬥場景id
   */
  combatStageId: number;

  /**
   * 若為對話戰鬥事件才填此值, 戰鬥通關要求星數
   */
  requiredCombatStarNumber: number;

  /**
   * 任務完成獎勵1 物品類型
   */
  awardItemType1: ContestAwardItemTypeEnum;

  /**
   * 任務完成獎勵1 物品id
   */
  awardItemId1: number;

  /**
   * 任務完成獎勵1 物品數量
   */
  awardItemCount1: number;

  /**
   * 任務完成獎勵2 物品類型
   */
  awardItemType2: ContestAwardItemTypeEnum;

  /**
   * 任務完成獎勵2 物品id
   */
  awardItemId2: number;

  /**
   * 任務完成獎勵2 物品數量
   */
  awardItemCount2: number;

  /**
   * 任務完成獎勵3 物品類型
   */
  awardItemType3: ContestAwardItemTypeEnum;

  /**
   * 任務完成獎勵3 物品id
   */
  awardItemId3: number;

  /**
   * 任務完成獎勵3 物品數量
   */
  awardItemCount3: number;
}

/**
 * ShopItemTable 類別，繼承自 JsonTable。
 * @extends {JsonTable<HeroUniverseTaskItem>}
 */
export class HeroUniverseTaskTable extends JsonTable<HeroUniverseTaskItem> {
  /**
   * ShopItemTable 類別的建構子。
   * @constructor
   */
  constructor() {
    super(HeroUniverseTaskItem);
  }
}
