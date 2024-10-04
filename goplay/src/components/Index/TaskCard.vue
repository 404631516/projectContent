<template>
  <div class="w-80 <sm:w-76 rounded-[10px]" p="y-8px x-16px" bg="[#FFF]">
    <!-- 任務名稱 -->
    <div class="rounded-[30px]" text="[#FFF] 2xl" p="y-4px" bg="[#FFAA2C]">
      {{ taskData.questName }}
    </div>
    <!-- 任務內容 -->
    <div class="h-160px rounded-[10px] relative" m="t-8px" p="y-10px x-10px" border="1 solid [#A7A7A7]">
      <div class="">
        <!-- 任務描述 -->
        <div text="left [26px]">
          <span v-for="(text, index) in descriptionTextList" :key="index" text="left [26px]">
            <span v-if="index % 2 === 0" text="[#777777]">{{ text }}</span>
            <span v-else text="[#FFA856]">{{ text }}</span>
          </span>
        </div>

        <!-- 任務進度 -->
        <div text="left [26px] [#666666]">
          {{ progressText }}
        </div>
      </div>

      <!-- 任務已完成提示 -->
      <template v-if="taskData.flag === TaskState.End">
        <!-- icon -->
        <img class="w-124px h-124px absolute left-80px top-10px" :src="imgData.taskComplete" />
        <!-- 文字 -->
        <div class="absolute left-115px top-85px" text="18px [#106524]">
          {{ textData.complete }}
        </div>
      </template>

      <!-- 任務可領取提示 -->
      <div
        v-if="taskData.flag === TaskState.Passed"
        class="rounded-[10px] absolute left-12px bottom-4px p-4px w-[90%]"
        text="2xl [#008F18]"
        bg="[#72FF37]"
      >
        {{ textData.missionComplete }}
      </div>
    </div>
    <!-- 任務完成期限 -->
    <div text="[18px] [#D69F05]" m="t-8px">
      {{ textData.deadLines }}
      <div class="rounded-[10px]" m="t-[5px]" text="[26px]" p="y-2" bg="[#E8E8E8]">
        <!-- 過期任務，顯示提示文字 -->
        <span v-if="taskData.flag === TaskState.Fail" text="[#FF6060]">
          {{ textData.expiredTask }}
        </span>
        <!-- 未過期任務，顯示期限 -->
        <span v-else text="[#666666]">
          {{ expiredDateText }}
        </span>
      </div>
    </div>
    <!-- 任務獎勵內容 -->
    <div text="[18px] [#D69F05]" m="t-8px">
      {{ textData.earnRewards }}
      <div
        class="flex justify-center items-center relative rounded-[10px]"
        m="t-[5px]"
        text="[26px] [#666666]"
        p="y-1 x-3"
        bg="[#E8E8E8]"
      >
        <!-- 任務禮包 -->
        <img class="w-9 h-9 object-contain" m="r-1" :src="giftPackImg" />X 1
        <!-- 任務禮包提示 -->
        <el-tooltip effect="dark" placement="top" :hide-after="3000">
          <div slot="content" text="center" m="y-3 x-2">
            <div text="[#D69F05] 20px">{{ textData.giftBag }}</div>
            <div p="t-1 b-2 x-1" border="b-1 solid [#FFF]" text="20px">
              {{ rewardTipText }}
            </div>
            <ul>
              <!-- 任務獎勵詳細內容 -->
              <li
                v-for="(giftItem, index) in taskData.itemDatas"
                :key="index"
                class="flex items-center"
                text="20px"
                m="y-1"
              >
                <!-- 道具icon 道具名稱*數量 -->
                <img class="w-6 h-6 object-contain" m="r-1" :src="getItemImg(giftItem)" />
                {{ getItemName(giftItem) }} *
                {{ giftItem.count }}
              </li>
            </ul>
          </div>
          <!-- 任務禮包說明按鈕 -->
          <button
            class="rounded-[30px] absolute right-3 shadow-default"
            p="x-5 y-2"
            bg="[#F5A300DB]"
            border="1 solid [#FFF]"
            text="[18px] [#FFF]"
          >
            {{ textData.directions }}
          </button>
        </el-tooltip>
      </div>
    </div>

    <div class="h-68px">
      <!-- 任務 Button (已完成時不顯示任務按鈕) -->
      <!-- 目前背景色是上到下漸層 gradient-to-b -->
      <button
        v-if="isShowCatchButton"
        class="w-1/2 rounded-[80px] shadow-default"
        m="t-4"
        p="y-8px"
        text="[#FFF] xl"
        :class="buttonState.style"
        bg="gradient-to-b"
        @click="onCatchButton(taskData)"
      >
        {{ buttonState.stateName }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import imgPath from '@/config/imgPath/imgPath';
import { Component, Prop, Emit, Vue } from 'vue-property-decorator';
import { TaskReqKey, TaskState } from '@/helper/enum/Task';
import { TaskData } from '@/helper/interface/Task';
import { ContestGameAward } from '@/helper/interface/Contest';
import RewardManager from '@/manager/RewardManager';
import { toDayjs } from '../../manager/TimeSyncManager';

/** 任務按鈕資料 */
interface TaskButtonData {
  /** 按鈕樣式 */
  style: string;
  /** 按鈕文字 */
  stateName: string;
}

@Component({
  components: {},
})
export default class TaskCard extends Vue {
  /** 任務資料 */
  @Prop() private taskData!: TaskData;

  /** 任務需求條件 */
  @Prop(String) private reqKey!: string;

  /** 需要顯示任務按鈕 */
  @Prop(Boolean) private isShowSaveButton!: boolean;

  /** 任務狀態enum */
  private TaskState = TaskState;

  /**圖片資料*/
  private imgData = {
    exclamationMark: imgPath.noticeUrl,
    crystal: imgPath.crystalBaseUrl,
    coin: imgPath.goldBaseUrl,
    weaponBaseUrl: imgPath.weaponBaseUrl,
    taskComplete: imgPath.taskComplete,
  };

  /**文字資料 */
  private textData = {
    missionComplete: '任務條件已達成！',
    conditionUnitTimes: '次',
    conditionUnitMinute: '分鐘',
    deadLines: '完成期限',
    expiredTask: '此任務已過期',
    earnRewards: '獲得獎勵',
    directions: '說明',
    giftBag: '獎勵禮包',
    tooltipRandomReward: '會隨機抽到下列獎品',
    tooltipReward: '會獲得下列獎品',
    complete: '已完成',
  };

  /** 取得任務按鈕狀態 */
  private get buttonState(): TaskButtonData {
    switch (this.taskData.flag) {
      // 可承接
      case TaskState.CanAccept:
        return {
          style: 'from-[#2FF994] to-[#15CE00]',
          stateName: '接取',
        };
        break;
      // 進行中
      case TaskState.Running:
        return {
          style: 'from-[#1AE5DE] to-[#2FAFF9]',
          stateName: '立即前往',
        };
        break;
      // 可領取
      case TaskState.Passed:
        return {
          style: 'from-[#FFB92D] to-[#FF8330]',
          stateName: '領取',
        };
        break;
      // 已完成，過期後server會刪掉任務
      case TaskState.End:
        return {
          style: '',
          stateName: '',
        };
        break;
      // 失敗
      case TaskState.Fail:
        return {
          style: 'from-[#FF9191] to-[#FF5169]',
          stateName: '放棄',
        };
        break;
      default:
        return {
          style: '',
          stateName: '錯誤',
        };
    }
  }

  /** 取得禮包圖片 */
  private get giftPackImg(): string {
    // api回傳禮包靜態表，其中包含禮包圖片名稱
    // EX: /assets/images/icon/gift01.png
    return require(`@/assets/images/icon/${this.taskData.giftPackIconName}.png`);
  }

  /** 取得完成期限 */
  private get expiredDateText(): string {
    // 無效日期id，回傳空字串
    if (this.taskData.expiredDayId === 0) {
      console.error(`taskData.expiredDayId = 0, questGroupId=${this.taskData.questGroupId}`);
      return '';
    }

    // 套用格式 EX: 2022/01/01
    return `${toDayjs(`${this.taskData.expiredDayId}`).format('YYYY-MM-DD')} 23:59`;
  }

  /** 取得任務描述文字
   * @param filedIndex 欄位索引
   */
  private get descriptionTextList(): string[] {
    // 先切割欄位
    return this.taskData.description.split('*');
  }

  /** 取得任務進度文字 */
  private get progressText(): string {
    // 單位-次數
    let unitText = '';
    switch (this.reqKey) {
      // 單位-次數
      case TaskReqKey.gameTimes:
      case TaskReqKey.allSubject:
      case TaskReqKey.subject:
      case TaskReqKey.learning:
      case TaskReqKey.adl_mission_record:
        unitText = this.textData.conditionUnitTimes;
        break;
      // 單位-分鐘
      case TaskReqKey.video_time:
      case TaskReqKey.prac_time:
      case TaskReqKey.da_time:
      case TaskReqKey.unit_time:
      case TaskReqKey.idct_time:
        unitText = this.textData.conditionUnitMinute;
        break;
      default:
        console.error(`progressText: undefine reqKey=${this.reqKey}`);
        break;
    }

    // ex: 1/100次 或 10/60分鐘
    return `${this.taskData.userValue} / ${this.taskData.reqValue}${unitText}`;
  }

  /** 是否顯示主要按鈕 */
  private get isShowCatchButton(): boolean {
    // 領獎後不顯示按鈕
    if (this.taskData.flag === TaskState.End) {
      return false;
    }

    // 進行中，且任務是不需要提供連結時，隱藏按鈕
    if (this.taskData.flag === TaskState.Running) {
      return this.isShowSaveButton;
    }

    // 顯示按鈕
    return true;
  }

  /** 是否為隨機獎勵 */
  private get rewardTipText(): string {
    // 若不是必得的獎勵，就回傳隨機文字
    if (this.taskData.itemDatas.find((item) => item.rate < 100)) {
      return this.textData.tooltipRandomReward;
    }
    // 都是必得獎勵，就回傳獎勵文字
    else {
      return this.textData.tooltipReward;
    }
  }

  /** 取得任務獎勵圖片
   * @param giftItem 獎勵資料
   */
  private getItemImg(giftItem: ContestGameAward): string {
    return RewardManager.getRewardItemImg(giftItem);
  }

  /** 取得任務獎勵名稱
   * @param giftItem 獎勵資料
   */
  private getItemName(giftItem: ContestGameAward): string {
    return RewardManager.getRewardItemName(giftItem);
  }

  /** 按下主要按鈕(承接/領獎/前往/放棄)
   * @param taskData 任務資料
   */
  @Emit('onCatchButton')
  private onCatchButton(taskData: TaskData): void {
    return;
  }
}
</script>
