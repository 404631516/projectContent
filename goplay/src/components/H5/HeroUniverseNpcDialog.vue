<template>
  <div v-if="isDialogVisible" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-1000">
    <div v-show="isShowDialog" class="bg-transparent w-full">
      <!-- 英雄聊天功能 -->
      <div class="py-[10px]">
        <!-- 底框 -->
        <div class="bg-[#FFF] relative py-20px <sm:py-5px z-100">
          <!-- 頭像及對話 -->
          <div class="w-full flex mx-auto justify-center">
            <!-- NPC頭像 -->
            <div class="flex flex-col items-center">
              <div class="head-name">
                {{ currentNpc.name }}
              </div>
              <img :src="currentNpc.image" class="head-image" />
            </div>
            <!-- 對話內容 -->
            <div class="w-3/4 flex flex-col h-[250px] mx-4">
              <div class="flex flex-col h-full">
                <!-- 對話內文 -->
                <div
                  ref="dialogContent"
                  class="text-left mb-4 flex-grow overflow-y-auto scrollbar custom-scrollbar relative"
                  @pointerdown="startDrag"
                  @pointermove="drag"
                  @pointerup="stopDrag"
                  @pointerleave="stopDrag"
                  @wheel="handleWheel"
                >
                  <span class="text-[#D69F05] text-[24px] <sm:text-[18px]">
                    <!-- 對話內文 -->
                    {{ talkContent }}
                  </span>
                </div>
                <!-- 顯示箭頭 -->
                <div
                  v-if="isOverflowing && !isScrolledToBottom"
                  class="flex justify-center items-center h-6 text-[#D69F05] -mt-2"
                >
                  <i class="el-icon-d-arrow-right transform rotate-90" font="before:bold"></i>
                </div>
                <!-- 首頁按鈕區 -->
                <div
                  v-if="buttonSectionType === ButtonSectionType.Main"
                  class="flex justify-center gap-4 mt-auto button-area"
                >
                  <!-- 閒聊(抽選對話)按鈕 -->
                  <button class="action-button text-[#D69F05]" @click="onNpcTalkButton">
                    {{ textData.npcTalk }}
                  </button>
                  <!-- 接任務/討論任務/回報任務按鈕 -->
                  <button v-if="hasRelatedTask" class="action-button text-[#D69F05]" @click="onNpcTaskButton">
                    {{ textData.aboutTask }}
                  </button>
                  <!-- 返回按鈕 -->
                  <button class="action-button text-[#D69F05]" @click="isDialogVisible = false">
                    {{ textData.return }}
                  </button>
                </div>
                <!-- 確認按鈕區 -->
                <div
                  v-if="buttonSectionType === ButtonSectionType.Confirm"
                  class="flex justify-center gap-4 mt-auto button-area"
                >
                  <!-- 確認按鈕 -->
                  <button class="action-button text-[#D69F05]" @click="buttonType = ButtonResponseType.Confirm">
                    {{ textData.confirm }}
                  </button>
                </div>
                <!-- 選擇按鈕區 -->
                <div
                  v-if="buttonSectionType === ButtonSectionType.Choice"
                  class="flex justify-center gap-4 mt-auto button-area"
                >
                  <!-- 確認按鈕 -->
                  <button class="action-button text-[#D69F05]" @click="buttonType = ButtonResponseType.Confirm">
                    {{ textData.confirm }}
                  </button>
                  <!-- 取消按鈕 -->
                  <button class="action-button text-[#D69F05]" @click="buttonType = ButtonResponseType.Cancel">
                    {{ textData.cancel }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, ModelSync, Ref, Emit, Prop, Watch } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { randomRange } from '@/views/H5/Helper/MathHelper';
import { ContestGameAward } from '@/helper/interface/Contest';
import TableManager from '@/manager/TableManager';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import { HeroUniverseTaskAPI } from '@/api/heroUniverseTask';
import { TableManager as ServerTableManager } from '@/hero-api/json-entity/table.manager';
import { mapContestAwardToRewardItemKey } from '@/helper/enum/AnswerGame';
import { CurrentTalkingNpc, UniverseTaskRunningInfo } from '@/store/module/HeroUniverse/HeroUniverseModule';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';

enum ButtonSectionType {
  Main = 'main',
  Confirm = 'confirm',
  Choice = 'choice',
}

enum ButtonResponseType {
  None = 'none',
  Confirm = 'confirm',
  Cancel = 'cancel',
}

@Component({
  components: {},
})
export default class HeroUniverseNpcDialog extends Vue {
  /** 按鈕區塊類型Enum */
  protected readonly ButtonSectionType = ButtonSectionType;
  /** 按鈕回應類型Enum */
  protected readonly ButtonResponseType = ButtonResponseType;

  /** 顯示dialog */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;

  /** 觸發位置 */
  @Prop({ type: Object, required: true })
  triggerLocation!: Phaser.Math.Vector2;

  /** 任務自動觸發函數 */
  @Prop({ type: Function, required: true })
  handleTaskAutoTrigger!: (taskInformation: UniverseTaskRunningInfo, location: Phaser.Math.Vector2) => Promise<void>;

  /** 對話內文Element */
  @Ref('dialogContent') readonly dialogContent!: HTMLElement;

  /**圖片資料*/
  protected imgData = {
    exclamationMark: imgPath.noticeUrl,
    backButtom: imgPath.backButtom,
    heroBaseUrl: imgPath.heroBaseUrl,
    dotIcon: imgPath.taskRightDot,
  };

  /**文字資料 */
  protected textData = {
    npcTalk: '閒聊',
    return: '返回',
    aboutTask: '關於任務',
    confirm: '確認',
    cancel: '取消',
  };

  /** 目前對話的NPC */
  protected currentNpc: CurrentTalkingNpc = {
    id: 0,
    name: '',
    image: '',
  };

  /** 是否顯示對話框 */
  protected isShowDialog: boolean = true;
  /** 按鈕區塊類型 */
  protected buttonSectionType: ButtonSectionType = ButtonSectionType.Main;
  /** 按鈕類型 */
  protected buttonType: ButtonResponseType = ButtonResponseType.None;
  /** 對話內文數量 */
  protected readonly npcTalkContentCount: number = 10;
  /** 對話內文key */
  protected readonly npcTalkContentKey: string = 'npc_talk_content_';
  /** 取得對話內文 */
  protected talkContent: string = '';

  /** 是否正在拖曳 */
  protected isDragging: boolean = false;
  /** 拖曳起始Y座標 */
  protected startY: number = 0;
  /** 捲動位置 */
  protected scrollTop: number = 0;
  /** 是否溢出 */
  protected isOverflowing: boolean = false;
  /** 是否捲到底 */
  protected isScrolledToBottom: boolean = false;

  /** 是否有相關任務 */
  protected get hasRelatedTask(): boolean {
    return (
      // 有可完成任務
      (this.$$store.getters.npcCompletableTaskMap.has(this.currentNpc.id) &&
        this.$$store.getters.npcCompletableTaskMap.get(this.currentNpc.id)!.length > 0) ||
      // 有進行中任務
      (this.$$store.getters.npcInProgressTaskMap.has(this.currentNpc.id) &&
        this.$$store.getters.npcInProgressTaskMap.get(this.currentNpc.id)!.length > 0) ||
      // 有可接受任務
      (this.$$store.getters.npcAcceptableTaskMap.has(this.currentNpc.id) &&
        this.$$store.getters.npcAcceptableTaskMap.get(this.currentNpc.id)!.length > 0)
    );
  }

  /** 對話框開啟時初始化 */
  @Watch('isDialogVisible')
  protected async onVisibilityChange(newValue: boolean) {
    if (newValue === false) {
      return;
    }
    // 設定對話的NPC
    this.currentNpc = this.$$store.getters.currentTalkingNpc;

    // 有相關任務
    if (this.hasRelatedTask) {
      // 顯示任務對話
      await this.onNpcTaskButton();
    } else {
      // 顯示隨機對話
      this.onNpcTalkButton();
    }

    // 切換到一般按鈕區塊
    this.buttonSectionType = ButtonSectionType.Main;
    // 清除按鈕回應
    this.buttonType = ButtonResponseType.None;
    // 顯示對話框
    this.isShowDialog = true;
  }

  /** 更新執行 */
  protected updated(): void {
    this.checkOverflow();
  }

  /** 按下一般對話按鈕, 更新對話內容 */
  protected onNpcTalkButton(): void {
    // 顯示隨機對話
    const randomDialogId = this.currentNpc.id * 100 + randomRange(1, 11);
    this.talkContent = TableManager.heroUniverseNpcDialog.findOne(randomDialogId)?.dialog ?? '';
  }

  /** 按下任務按鈕, 更新對話內容 */
  protected async onNpcTaskButton(): Promise<void> {
    // 任務處理順序
    // 1. 可完成任務
    // 2. 進行中任務
    // 3. 可接受任務
    (await this.handleCompletableTask(this.currentNpc.id, this.currentNpc.name, this.triggerLocation)) ||
      (await this.handleInProgressTask(this.currentNpc.id, this.currentNpc.name, this.triggerLocation)) ||
      (await this.handleAcceptableTask(this.currentNpc.id, this.currentNpc.name, this.triggerLocation));
  }

  /** 處理可完成任務
   * @param npcId NPC id
   * @param npcName NPC名稱
   * @returns 是否處理成功
   */
  private async handleCompletableTask(npcId: number, npcName: string, location: Phaser.Math.Vector2): Promise<boolean> {
    // 沒有可以完成的任務
    if (
      this.$$store.getters.npcCompletableTaskMap.has(npcId) === false ||
      this.$$store.getters.npcCompletableTaskMap.get(npcId)!.length === 0
    ) {
      return false;
    }

    // 查找可完成的任務資料
    const taskItem = this.$$store.getters.npcCompletableTaskMap.get(npcId)![0];
    const taskInformation = this.$$store.getters.universeTaskRunningInfoList.find(
      (task) => task.taskItem.id === taskItem.id,
    );
    if (taskInformation === undefined) {
      Helper.assert(ErrorId.TableDataNotFound, `找不到對應的進行中任務資料，id:${taskItem.id}`);
      return false;
    }

    // 顯示完成任務對話框
    this.talkContent = await this.displayTalkContentByLine(taskItem.completeTaskDialog, true);

    // 切換到確認按鈕區塊
    this.buttonSectionType = ButtonSectionType.Choice;

    // 等待按下按鈕
    await AsyncHelper.pendingUntil(() => this.buttonType !== ButtonResponseType.None);
    if (this.buttonType !== ButtonResponseType.Confirm) {
      // 關閉對話框
      this.isDialogVisible = false;
      return true;
    }
    this.buttonType = ButtonResponseType.None;

    // 向伺服器完成任務
    const completeTaskResult = await HeroUniverseTaskAPI.completeTask(taskInformation.runningEntity.runningTaskUid);

    // 顯示獲得獎勵
    if (completeTaskResult.awardList.length > 0) {
      const awardList: ContestGameAward[] = [];
      for (const award of completeTaskResult.awardList) {
        const itemType = mapContestAwardToRewardItemKey(award.itemType);
        if (itemType === undefined) {
          Helper.assert(
            ErrorId.VariableUndefined,
            `mapContestAwardToRewardItemKey: itemType == undefined, id=${award.itemType}`,
          );
          continue;
        }

        awardList.push({
          /** 獎勵類別 */
          itemType,
          itemId: award.itemId,
          count: award.count,
          rate: 1,
        });
      }
      this.onReceiveTaskReward(awardList);
    }

    // 有自動接續的任務
    if (completeTaskResult.nextTask !== null) {
      // 查找對應接續任務
      const nextTaskItem = ServerTableManager.heroUniverseTaskTable.getItem(completeTaskResult.nextTask.dataId);
      if (nextTaskItem === undefined) {
        Helper.assert(ErrorId.TableDataNotFound, `找不到對應的任務資料，id:${completeTaskResult.nextTask.dataId}`);
        return false;
      }
      const nextTaskInformation: UniverseTaskRunningInfo = {
        taskItem: nextTaskItem,
        runningEntity: completeTaskResult.nextTask,
      };

      // 一句一句顯示對話
      await this.displayTalkContentByLine(nextTaskItem.takeTaskDialog);

      // 處理任務自動觸發的事件
      this.isShowDialog = false;
      await this.handleTaskAutoTrigger(nextTaskInformation, location);
    }

    // 更新任務狀態
    await this.$$store.dispatch('refreshUniverseTasksStatus');

    // 關閉對話框
    this.isDialogVisible = false;
    return true;
  }

  /** 處理進行中任務
   * @param npcId NPC id
   * @param npcName NPC名稱
   * @param location 觸發位置
   * @returns 是否處理成功
   */
  private async handleInProgressTask(npcId: number, npcName: string, location: Phaser.Math.Vector2): Promise<boolean> {
    if (
      this.$$store.getters.npcInProgressTaskMap.has(npcId) === false ||
      this.$$store.getters.npcInProgressTaskMap.get(npcId)!.length === 0
    ) {
      return false;
    }

    // 查找進行中任務資料
    const taskItem = this.$$store.getters.npcInProgressTaskMap.get(npcId)![0];
    const taskInformation = this.$$store.getters.universeTaskRunningInfoList.find(
      (task) => task.taskItem.id === taskItem.id,
    );
    if (taskInformation === undefined) {
      Helper.assert(ErrorId.TableDataNotFound, `找不到對應的進行中任務資料，id:${taskItem.id}`);
      return false;
    }

    // 一句一句顯示對話
    await this.displayTalkContentByLine(taskItem.progressTaskDialog);

    // 處理任務自動觸發的事件
    this.isShowDialog = false;
    await this.handleTaskAutoTrigger(taskInformation, location);

    // 更新任務狀態
    await this.$$store.dispatch('refreshUniverseTasksStatus');

    // 關閉對話框
    this.isDialogVisible = false;
    return true;
  }

  /** 處理可接受任務
   * @param npcId NPC id
   * @param npcName NPC名稱
   * @param location 觸發位置
   * @returns 是否處理成功
   */
  private async handleAcceptableTask(npcId: number, npcName: string, location: Phaser.Math.Vector2): Promise<boolean> {
    if (
      this.$$store.getters.npcAcceptableTaskMap.has(npcId) === false ||
      this.$$store.getters.npcAcceptableTaskMap.get(npcId)!.length === 0
    ) {
      return false;
    }

    // 接任務
    const taskItem = this.$$store.getters.npcAcceptableTaskMap.get(npcId)![0];

    // 等待使用者按下接受任務按鈕
    this.talkContent = await this.displayTalkContentByLine(taskItem.takeTaskDialog, true);
    // 切換到確認按鈕區塊
    this.buttonSectionType = ButtonSectionType.Choice;
    // 等待按下按鈕
    await AsyncHelper.pendingUntil(() => this.buttonType !== ButtonResponseType.None);
    if (this.buttonType !== ButtonResponseType.Confirm) {
      // 關閉對話框
      this.isDialogVisible = false;
      return true;
    }

    // 向伺服器接任務
    const takeTaskResult = await HeroUniverseTaskAPI.takeTask(taskItem.id);
    if (takeTaskResult.takenTask === null) {
      Helper.assert(ErrorId.TaskAcceptFailed, `任務接取失敗，任務id:${taskItem.id}`);
      return false;
    }

    // 接任務時自動觸發事件
    if (taskItem.autoTriggerOnTake) {
      const taskInformation: UniverseTaskRunningInfo = {
        taskItem,
        runningEntity: takeTaskResult.takenTask,
      };
      this.isShowDialog = false;
      await this.handleTaskAutoTrigger(taskInformation, location);
    }

    // 更新任務狀態
    await this.$$store.dispatch('refreshUniverseTasksStatus');

    // 關閉對話框
    this.isDialogVisible = false;
    return true;
  }

  /** 一句一句顯示對話
   * @param content 對話內容
   * @param untilLastLine 是否保留最後一行不顯示
   * @returns 如果 untilLastLine 為 true，返回最後一行；否則返回 undefined
   */
  private async displayTalkContentByLine(content: string, untilLastLine: boolean = false): Promise<string> {
    // 將對話內容按換行符分割成多行
    const lines = content
      // 先按換行符分割
      .split('\n')
      // 再按中文句號分割
      .flatMap((line) => line.split('。'))
      // 去除每行前後的空白
      .map((line) => line.trim())
      // 過濾掉空行
      .filter((line) => line !== '');

    // 如果保留最後一行不顯示，則返回最後一行
    const lastLineIndex = untilLastLine ? lines.length - 1 : lines.length;

    // 一句一句顯示對話
    for (let i = 0; i < lastLineIndex; i++) {
      this.talkContent = lines[i];
      this.buttonSectionType = ButtonSectionType.Confirm;
      await AsyncHelper.pendingUntil(() => this.buttonType === ButtonResponseType.Confirm);
      this.buttonType = ButtonResponseType.None;
    }

    // 如果保留最後一行不顯示，則返回最後一行
    return untilLastLine ? lines[lines.length - 1] : '';
  }

  /** 接收任務獎勵 */
  @Emit('onReceiveTaskReward')
  protected onReceiveTaskReward(rewardItemList: ContestGameAward[]): void {
    /** */
  }

  /** 開始拖曳 */
  protected startDrag(event: PointerEvent): void {
    this.isDragging = true;
    this.startY = event.clientY;
    this.scrollTop = this.dialogContent.scrollTop;
  }

  /** 拖曳中 */
  protected drag(event: PointerEvent): void {
    if (!this.isDragging) return;
    event.preventDefault();
    const currentY = event.clientY;
    const walk = (this.startY - currentY) * 2;
    this.dialogContent.scrollTop = this.scrollTop + walk;
    this.checkOverflow();
  }

  /** 停止拖曳 */
  protected stopDrag(): void {
    this.isDragging = false;
  }

  /** 滾輪事件 */
  protected handleWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY || event.detail;
    this.dialogContent.scrollTop += delta;
    this.checkOverflow();
  }

  /** 檢查對話是否溢出 */
  protected checkOverflow(): void {
    if (this.dialogContent === undefined) {
      return;
    }

    this.isOverflowing = this.dialogContent.scrollHeight > this.dialogContent.clientHeight;
    this.isScrolledToBottom =
      this.dialogContent.scrollHeight - this.dialogContent.scrollTop <= this.dialogContent.clientHeight + 1;
  }
}
</script>

<style scoped>
.scrollbar::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar::-webkit-scrollbar-thumb {
  background-color: transparent;
}

.scrollbar {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.custom-scrollbar {
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  touch-action: pan-y;
}

.custom-scrollbar:active {
  cursor: grabbing;
}

.head-name {
  font-size: 30px;
  color: #d69f05;
  margin-bottom: 0.5rem;
  background-color: #ffe282;
  border-radius: 0.75rem;
  padding: 0 0.5rem;
}

@media (max-width: 640px) {
  .head-name {
    font-size: 22px;
  }
}

.head-image {
  height: 100%;
  object-fit: cover;
  width: 256px;
  height: 256px;
}

.button-area {
  color: #d69f05;
  font-size: 20px;
}

@media (max-width: 640px) {
  .button-area {
    font-size: 16px;
  }
}

.action-button {
  flex: 1;
  max-width: 120px;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  background-color: #fff;
  border-radius: 9999px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #d8b02c;
}

.ellipsis {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  color: #d69f05;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 0 10px;
}
</style>
