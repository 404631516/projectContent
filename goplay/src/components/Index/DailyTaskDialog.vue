<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    :destroy-on-close="true"
    :fullscreen="true"
    @open="openDialog"
    @close="closeDialog"
  >
    <!-- 任務標題 -->
    <div slot="title" class="pt-10px">
      <div text="32px [#FDC221]">{{ textData.title }}</div>
      <div text="xl [#FDC221]">
        {{ textData.remainAcceptCount }}
        <!-- 任務目前接的數量 -->
        <span class="tracking-5px" m="l-2">{{ remainAcceptCount }} / {{ maxAcceptCount }}</span>
      </div>
      <!-- 任務通用提示文字 -->
      <div
        class="flex items-center justify-center tracking-2px from-transparent via-[#FF4D4DCB] to-transparent"
        m="x-auto y-10px"
        p="y-10px"
        w="[50%] <sm:full"
        bg="gradient-to-r"
        text="[#FFF] 18px <sm:16px"
      >
        {{ textData.taskCommonTip }}
      </div>
      <!-- 下次刷新時間 -->
      <div
        class="flex items-center justify-center tracking-2px from-transparent via-[#52D03DCB] to-transparent"
        m="x-auto y-10px"
        w="[40%] <sm:full"
        bg="gradient-to-r"
        text="[#FFF] 30px <sm:16px"
      >
        <img class="w-50px <sm:w-28px" :src="imgData.exclamationMark" />
        {{ textData.nextRefreshTime }} {{ countDownTimer }}
      </div>
    </div>
    <!-- 頁面1: 顯示可承接任務列表 -->
    <template v-if="isTaskDetailPage === false">
      <!-- 取得server端的任務資料後, 沒有可承接任務時，顯示提示文字 -->
      <div v-if="intervalId !== 0 && canAcceptTaskList.length === 0" class="pt-180px" text="[#FDC221] 36px">
        {{ textData.noCanAcceptTaskHint }}
      </div>
      <div v-else class="mb-10px pb-5 w-4/5 flex max-w-[1500px] overflow-auto gap-4 scrollbar" m="x-auto">
        <!-- 水平捲軸式清單 -->
        <TaskCard
          v-for="(taskData, index) in canAcceptTaskList"
          :key="index"
          :taskData="taskData"
          :reqKey="getTaskReqKey(taskData.reqKey)"
          :isShowSaveButton="true"
          class="flex-shrink-0"
          @onCatchButton="onCatchButton"
        />
      </div>
    </template>
    <!-- 頁面2: 顯示已承接任務列表  -->
    <template>
      <div v-show="isTaskDetailPage" class="mt-0px mb-5px flex max-w-[448px] items-center relative" m="x-auto">
        <!-- 輪播圖 -->
        <div ref="swiper" class="swiper swiper-container">
          <div class="swiper-wrapper">
            <!-- 輪播物件 -->
            <div class="swiper-slide" v-for="taskData in acceptTaskList" :key="taskData.questGroupId">
              <TaskCard
                :taskData="taskData"
                :reqKey="getTaskReqKey(taskData.reqKey)"
                :isShowSaveButton="isShowUrlButton(taskData)"
                m="x-auto"
                @onCatchButton="onCatchButton"
              />
            </div>
          </div>
        </div>
        <!-- 方向箭頭 -->
        <div class="swiper-button-next"></div>
        <div class="swiper-button-prev"></div>
      </div>
    </template>
    <!-- 英雄聊天功能 -->
    <div slot="footer">
      <!-- 底框 -->
      <div class="bg-[#FFF] relative py-20px <sm:py-5px z-100">
        <img :src="imgData.dotIcon" class="absolute right-0 bottom-0 -z-1 pointer-events-none" />
        <!-- (彈性容器)表格排版-頭像及對話 -->
        <div class="w-[80%] <sm:w-full flex mx-auto justify-center">
          <!-- 表格排版-英雄頭像(改到容器外顯示) -->
          <img
            :src="imgData.npcImg"
            class="h-full <sm:h-100px object-cover left-[10%] <sm:left-0 absolute bottom-0 <sm:bottom-[30%]"
          />

          <!-- 表格排版-對話內容 -->
          <div class="ml-25vh <sm:ml-[25%] w-[75%] grid grid-rows-[40px,120px,40px] <sm:grid-rows-[30px,120px,40px]">
            <!-- 底框-npc名稱 -->
            <div class="text-left">
              <span class="rounded-xl px-80px <sm:px-20px" bg="[#FFE282]" text="30px <sm:22px  [#D69F05]">
                <!-- npc名稱 -->
                {{ textData.npcName }}
              </span>
            </div>
            <!-- 底框-對話內文 -->
            <div class="text-left ml-20px">
              <span text="24px <sm:18px [#D69F05]">
                <!-- 對話內文 -->
                {{ talkContent }}
              </span>
            </div>
            <!-- 底框-按鈕區(可承接任務頁) -->
            <span v-if="isTaskDetailPage === false" class="gap-10px grid grid-cols-2" text="[#D69F05] 26px <sm:20px">
              <!-- 閒聊(抽選對話)按鈕 -->
              <button
                class="max-w-376px shadow-default rounded-[20px]"
                bg="[#FFF]"
                p="y-4px"
                border="1px solid [#D8B02C]"
                @click="onNpcTalkButton"
              >
                {{ textData.npcTalk }}
              </button>
              <!-- 關於任務按鈕(顯示已承接任務): 有已承接任務 且 在可承接任務頁時，才顯示 -->
              <button
                v-if="acceptTaskList.length > 0"
                class="max-w-376px shadow-default rounded-[20px]"
                bg="[#FFF]"
                p="y-4px"
                border="1px solid [#D8B02C]"
                @click="onTaskDetailButton"
              >
                {{ textData.aboutTasks }}
              </button>
            </span>
            <!-- 底框-按鈕區(已承接任務頁) -->
            <span v-else class="gap-10px" text="[#D69F05] 26px <sm:20px">
              <!-- 返回按鈕(顯示可承接任務) -->
              <button
                class="shadow-default rounded-[20px] flex justify-center relative"
                bg="[#FFF]"
                w="376px <sm:auto"
                p="y-2 <sm:x-40px"
                border="1px solid [#D8B02C]"
                @click="onReturnChitChatButton"
              >
                <img class="w-29px h-28px object-contain absolute left-10px top-6px" :src="imgData.backButtom" />
                {{ textData.showCanAcceptButton }}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, ModelSync, Ref, Emit } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import TaskCard from '@/components/Index/TaskCard.vue';
import { TaskData } from '@/helper/interface/Task';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Load, Message } from '@/helper/class/Common';
import { GradeType, ResponseState } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';
import { giveUpTaskAPI, reapTaskAPI, takeTaskAPI, userTotalTaskAPI } from '@/api/Task';
import { TaskReqKey, TaskState } from '@/helper/enum/Task';
import HeroManager, { HeroImgType } from '@/manager/HeroManager';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import { randomNumber, randomRange } from '@/views/H5/Helper/MathHelper';
import { ContestGameAward } from '@/helper/interface/Contest';
import TableManager from '@/manager/TableManager';
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import Swiper, { Navigation } from 'swiper';
import Config from '@/config/setting';
import 'swiper/swiper-bundle.min.css';
import { toDayjs } from '../../manager/TimeSyncManager';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
Swiper.use([Navigation]);

@Component({
  components: {
    TaskCard,
  },
})
export default class DailyTaskDialog extends Vue {
  protected readonly contentKeyBase = 'daily_npc_talk_content_';
  protected readonly contentRange = 10;

  /** 顯示dialog */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;

  /** 任務卡片Swiper清單 的 父層Div區塊 */
  @Ref('swiper') private swiperDiv!: HTMLDivElement;

  /**圖片資料*/
  private imgData = {
    exclamationMark: imgPath.noticeUrl,
    backButtom: imgPath.backButtom,
    heroBaseUrl: imgPath.heroBaseUrl,
    dotIcon: imgPath.taskRightDot,
    npcImg: `${Config.imgUrl}/img/h5/heroUniverse/npcEffect/NPC9999.png`,
  };

  /**文字資料 */
  private textData = {
    title: '任務懸賞',
    noCanAcceptTaskHint: '今日已無可承接任務',
    remainAcceptCount: '剩餘可接任務數',
    reachAcceptCountLimit: '可接任務已達上限，先完成手上的任務唷',
    nextRefreshTime: '任務進度更新時間',
    aboutTasks: '關於任務',
    npcTalk: '閒聊',
    showCanAcceptButton: '返回聊其他的',
    taskCommonTip: '一次最多只能接5個任務喔！有完成才能再接入新任務，到期未完成的任務記得要手動放棄',
    npcName: '每日任務小精靈',
  };

  /** 可承接任務資料 */
  private canAcceptTaskList: TaskData[] = [];
  /** 已承接任務資料 */
  private acceptTaskList: TaskData[] = [];
  /** 任務卡片Swiper清單 */
  private swiper!: Swiper;
  /** 是否顯示全部任務 */
  private isTaskDetailPage: boolean = false;
  /** 已承接任務頁面中，目前顯示的任務索引 */
  private currentTaskIndex: number = 0;
  /** 最新承接任務Id */
  private newTaskQuestGroupId: number = -1;

  /** 下次刷新時間 */
  private countDownTimer: string = '';
  /** 計時器id */
  private intervalId: number = 0;
  /** 計時器剩餘秒數 */
  private countDownSecond: number = 0;

  /** 可承接任務上限 */
  private maxAcceptCount: number = 0;
  /** 剩餘可承接任務數 */
  private remainAcceptCount: number = 0;

  /** 對話內文數量 */
  private readonly npcTalkContentCount: number = 10;
  /** 對話內文key */
  private readonly npcTalkContentKey: string = 'npc_talk_content_';
  /** 取得對話內文 */
  private talkContent: string = '';

  /**打開彈窗會執行的函式 */
  async openDialog() {
    // 開啟dialog時，預設顯示全部任務
    this.isTaskDetailPage = false;

    // 拿取任務所有資料
    await this.onUserTotalTaskAPI();

    // 防呆封包回來太慢, 介面關閉後設定倒數
    if (this.isDialogVisible === false) {
      return;
    }

    // 設定倒數計時器
    this.setCountDownTimer();

    // 顯示開場白
    this.talkContent = Localization.getText(LocalKeyType.Common, 'npc_talk_prologue');

    // 等html render
    await this.$nextTick();

    // 創建Swiper
    this.swiper = new Swiper(this.swiperDiv, {
      slidesPerView: 1, // 每次顯示的cell數
      loop: false, // 非無限循環
      // 向左與向右箭頭
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      initialSlide: 0, // 預設捲動位置
      observer: true, // 偵測資料更新元件
    });

    // 設定Swiper事件
    this.swiper.on('slideChange', this.onSlideChange);
  }

  /**關閉彈窗執行函式 */
  closeDialog() {
    // 刪除間隔計時器
    clearInterval(this.intervalId);
    this.intervalId = 0;

    // 顯示開場白
    this.talkContent = Localization.getText(LocalKeyType.Common, 'npc_talk_prologue');
  }

  /** 設定倒數計時器 */
  private setCountDownTimer(): void {
    // 擴展插件
    dayjs.extend(duration);

    // 建立間隔計時器
    const that = this;
    this.intervalId = setInterval(() => {
      // 已送出api，不要重覆送出
      if (that.countDownSecond < 0) {
        return;
      }

      // 倒數結束
      if (that.countDownSecond === 0) {
        // 記錄已送出api
        that.countDownSecond = -1;
        // 倒數完畢，強制刷新任務資料
        that.onUserTotalTaskAPI();
        return;
      }

      // 將秒數放入時間物件，組成字串
      that.countDownTimer = dayjs.duration(that.countDownSecond, 'seconds').format('HH:mm:ss');

      // 減1秒
      --that.countDownSecond;
    }, 1000);
  }

  /** 拿取任務所有資料 */
  private async onUserTotalTaskAPI(): Promise<void> {
    // 開啟讀取中
    Load.use(true);

    try {
      // API 用戶取得所有自身任務資料
      const response: any = await userTotalTaskAPI.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 關閉讀取
      Load.use(false);

      // 記錄倒數秒數
      this.countDownSecond = response.cdSeconds;

      // 可承接上限
      this.maxAcceptCount = response.maxTakeCount;

      // 更新全部任務
      this.updateAllTask(response.questList, response.questCanAcceptList);
    } catch (e) {
      Message.error(`${e}`);
      // 關閉讀取中
      Load.use(false);
    }
  }

  /** 用戶接取新任務
   * @param taskData 任務資料
   */
  private async onTakeTaskAPI(taskData: TaskData): Promise<void> {
    // 用完可承接任務數量時，不能再承接
    if (this.remainAcceptCount === 0) {
      Message.warn(`${this.textData.reachAcceptCountLimit}`);
      return;
    }

    const data = {
      questGroupId: taskData.questGroupId,
    };

    // 開啟讀取中
    Load.use(true);

    try {
      // API 用戶接取新任務
      const response: any = await takeTaskAPI.post(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 訊息: 成功接取任務
      Message.success(Localization.getText(LocalKeyType.Common, `take_task_success`));

      // 設定最新承接任務Id
      this.newTaskQuestGroupId = taskData.questGroupId;

      // 更新全部任務
      this.updateAllTask(response.questList, response.questCanAcceptList);

      // 關閉讀取
      Load.use(false);
    } catch (e) {
      Message.error(`${e}`);
      // 關閉讀取中
      Load.use(false);
    }
  }

  /** 用戶領取任務獎勵
   * @param taskData 任務資料
   */
  private async onReapTaskAPI(taskData: TaskData): Promise<void> {
    const data = {
      questGroupId: taskData.questGroupId,
    };

    // 開啟讀取中
    Load.use(true);

    try {
      // API 用戶取得所有自身任務資料
      const response: any = await reapTaskAPI.post(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 更新全部任務
      this.updateAllTask(response.questList, response.questCanAcceptList);

      const rewardList = response.questAward.itemDatas;
      // 防呆
      if (rewardList.length === 0) {
        console.error(`沒有獎勵資料, questGroupId=${taskData.questGroupId}`);
      } else {
        // 用emit打開獎勵彈窗，並傳入獎勵內容
        this.onOpenRewardDialog(rewardList);
      }

      // 關閉讀取
      Load.use(false);
    } catch (e) {
      Message.error(`${e}`);
      // 關閉讀取中
      Load.use(false);
    }
  }

  /** 用戶放棄已失敗任務
   * @param taskData 任務資料
   */
  private async onGiveUpTaskAPI(taskData: TaskData): Promise<void> {
    const data = {
      questGroupId: taskData.questGroupId,
    };

    // 開啟讀取中
    Load.use(true);

    try {
      // API 用戶放棄已失敗任務
      const response: any = await giveUpTaskAPI.post(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤訊息
        handleAPIError(response.result, response.resMessage);
      }

      // 訊息: 已放棄任務
      Message.info(Localization.getText(LocalKeyType.Common, `give_up_task_success`));

      // 更新全部任務
      this.updateAllTask(response.questList, response.questCanAcceptList);

      // 關閉讀取
      Load.use(false);
    } catch (e) {
      Message.error(`${e}`);
      // 關閉讀取中
      Load.use(false);
    }
  }

  /** 更新全部任務
   * @param acceptTaskList 已承接任務清單
   * @param canAcceptTaskList 可承接任務清單
   */
  private updateAllTask(acceptTaskList: TaskData[], canAcceptTaskList: TaskData[]): void {
    // 用戶若沒有學校時，排除因材網老師指派任務
    if (this.$$store.getters.hasSchool === false) {
      this.canAcceptTaskList = canAcceptTaskList.filter((task) => task.reqKey !== TaskReqKey.adl_mission_record);
    }
    // 否則有學校時，可承接任務清單 包含 因材網老師指派任務
    else {
      this.canAcceptTaskList = canAcceptTaskList;
    }

    // 儲存已承接任務清單
    this.acceptTaskList.splice(0, this.acceptTaskList.length, ...acceptTaskList);
    // 排序已承接任務清單
    this.acceptTaskList.sort(this.compareTask);

    // 目前已承接任務數 = 進行中 + 可領獎 + 失敗
    const acceptCount = this.acceptTaskList.filter(
      (task) => task.flag === TaskState.Running || task.flag === TaskState.Passed || task.flag === TaskState.Fail,
    ).length;

    // 防呆
    if (this.maxAcceptCount < acceptCount) {
      this.remainAcceptCount = 0;
      console.error(`updateAllTask: max < accept, max=${this.maxAcceptCount}, accept=${acceptCount}`);
    }
    // 剩餘可承接任務數 = 可承接任務上限 - 目前已承接任務數
    else {
      this.remainAcceptCount = this.maxAcceptCount - acceptCount;
    }

    // 若沒有已承接任務時，返回可承接任務頁
    if (this.acceptTaskList.length === 0) {
      this.onReturnChitChatButton();
      return;
    }

    // 刷新任務提示(若顯示已承接頁面時)
    if (this.isTaskDetailPage) {
      this.onSlideChange();
    }
  }

  /** 任務排序的比較函式(order: 可領獎2 進行中1 未承接0 失敗4 已完成3)
   * @param info1 陣列元素1
   * @param info2 陣列元素2
   */
  private compareTask(task1: TaskData, task2: TaskData): number {
    // 最新承接任務排最前面
    if (task1.questGroupId === this.newTaskQuestGroupId) {
      return -1;
    }

    // 各flag的對應順序
    const flagOrder: number[] = [2, 1, 0, 4, 3];
    const order1 = flagOrder[task1.flag];
    const order2 = flagOrder[task2.flag];

    // order相同，不交換; 回傳-1，task1會排在前面; 回傳1，task1會排在後面
    return order1 - order2;
  }

  /** 開啟學習鏈結
   * @param taskData 任務資料
   */
  private openWebLink(taskData: TaskData): void {
    // 有填link url時，就跳到指定網頁
    if (taskData.webLink.length > 0) {
      window.open(`${taskData.webLink}`);
      return;
    }

    // 取得任務要求條件文字(不含科目)
    const taskReqKey = this.getTaskReqKey(taskData.reqKey);

    // 沒填link，但任務條件需要顯示link按鈕時，就顯示按鈕，並自動組link
    switch (taskReqKey) {
      // 學創任務
      // 每天魔王賽開啟次數
      case TaskReqKey.gameTimes:
        // 跳轉到魔王賽頁
        this.$router.push(`/${MenuName.WorldContest}`);
        break;
      // 每天各科目學習總次數
      case TaskReqKey.allSubject:
        // 跳轉到答題遊戲頁
        this.$router.push(`/${MenuName.CourseMenu}`);
        break;
      // 每天科目學習次數(後接科目id)
      case TaskReqKey.subject:
        // 跳轉到答題遊戲頁，指定科目ID
        this.$router.push({
          name: `${MenuWord.CourseMenu}`,
          params: { id: `${this.getTaskReqID(taskData.reqKey)}` },
        });
        break;
      // 每天星球大戰次數
      case TaskReqKey.learning:
        // 跳轉到星球大戰頁
        this.$router.push(`/${MenuName.PlanetWar}`);
        break;

      // 因材網任務
      case TaskReqKey.video_time:
      case TaskReqKey.prac_time:
      case TaskReqKey.da_time:
      case TaskReqKey.unit_time:
      case TaskReqKey.idct_time:
        this.openAdlWebLink(taskData);
        break;
      case TaskReqKey.adl_mission_record:
        // 開啟因材網任務網頁
        const adlUrlMission = 'https://adl.edu.tw/modules_new.php?op=modload&name=dashboard&file=modules_student';
        window.open(`${adlUrlMission}`);
        break;

      default:
        // 防呆
        console.error(`openWebLink undefine taskReqKey=${taskReqKey}`);
        break;
    }
  }

  /** 開啟因材網教材網址
   * @param taskData 任務資料
   */
  private openAdlWebLink(taskData: TaskData): void {
    // 取得學生年級
    let userGradeNum = this.$$store.getters.userGradeNumber;

    // 沒有年級, 導向1年級
    if (userGradeNum === GradeType.g0) {
      userGradeNum = GradeType.g1;
    }

    // 取得科目id
    const subjectID = this.getTaskReqID(taskData.reqKey);

    // 取得科目
    const subjectData = TableManager.subject.findOne(subjectID);
    if (subjectData == null) {
      console.error(`subjectData is null, subjectID=${subjectID}`);
      return;
    }

    const adlUrlSubject = 'https://adl.edu.tw/modules_new.php?op=modload&name=assignMission&file=ks_viewlist_new&sub=';

    // url+科目中文+科目id+年級
    const url = `${adlUrlSubject}${subjectData.subject_groupings_name}&subjectG=${subjectID}&grade=${userGradeNum}`;

    // 開啟網頁
    window.open(`${url}`);
  }

  /** 檢查此任務需要顯示[立即前往]鈕
   * @param taskData 任務資料
   */
  private isShowUrlButton(taskData: TaskData): boolean {
    // 有填link url時，就跳到指定網頁
    if (taskData.webLink.length > 0) {
      return true;
    }

    // 取得任務要求條件文字(不含科目)
    const taskReqKey = this.getTaskReqKey(taskData.reqKey);

    // 沒填link，但任務條件需要顯示link按鈕時，就顯示按鈕，並自動組link
    switch (taskReqKey) {
      // 學創任務
      case TaskReqKey.gameTimes:
      case TaskReqKey.allSubject:
      case TaskReqKey.subject:
      case TaskReqKey.learning:
        return true;

      // 因材網任務
      case TaskReqKey.video_time:
      case TaskReqKey.prac_time:
      case TaskReqKey.da_time:
      case TaskReqKey.unit_time:
      case TaskReqKey.idct_time:
      case TaskReqKey.adl_mission_record:
        return true;

      default:
        break;
    }

    // 沒填link，且任務條件不需要顯示link按鈕時，就隱藏按鈕
    return false;
  }

  /** 取得任務要求條件文字(不含科目)
   * @param reqKey 要求條件
   */
  private getTaskReqKey(reqKey: string): string {
    // 不含科目的條件
    switch (reqKey) {
      case TaskReqKey.gameTimes:
      case TaskReqKey.allSubject:
      case TaskReqKey.learning:
      case TaskReqKey.adl_mission_record:
        return reqKey;

      default:
        break;
    }

    // 含科目時，刪掉最後一個_後的字
    const lastPos = reqKey.lastIndexOf('_');
    if (lastPos !== -1) {
      return reqKey.substring(0, lastPos + 1);
    }
    return reqKey;
  }

  /** 取得任務要求條件的科目id
   * @param reqKey 要求條件
   */
  private getTaskReqID(reqKey: string): number {
    // 取得最後一個_後的字
    const lastPos = reqKey.lastIndexOf('_');
    // 找不到
    if (lastPos === -1) {
      console.error(`getTaskReqID: not found _, reqKey=${reqKey}`);
      return 0;
    }

    // 取得_後面的文字
    return +reqKey.substring(lastPos + 1);
  }

  /** 取得任務提示 */
  private getTaskHint(): string {
    // 防呆
    if (this.currentTaskIndex < 0 || this.currentTaskIndex >= this.acceptTaskList.length) {
      console.error(`getTaskHint: out of range, currentTaskIndex=${this.currentTaskIndex}`);
      return '';
    }

    // 取得目前任務
    const taskData = this.acceptTaskList[this.currentTaskIndex];

    switch (taskData.flag) {
      // 進行中
      case TaskState.Running:
        {
          // 取得多國字
          const hint1 = Localization.getText(LocalKeyType.Common, 'task_running_hint1');
          const hint2 = Localization.getText(LocalKeyType.Common, 'task_running_hint2');

          // 取得日期格式文字
          const dateFormat = Localization.getText(LocalKeyType.Common, 'chinestDateFormat');
          const dateString = toDayjs(`${taskData.expiredDayId}`).format(dateFormat);

          return hint1 + dateString + hint2;
        }
        break;

      // 可領取
      case TaskState.Passed:
        return Localization.getText(LocalKeyType.Common, 'task_passed_hint');

      // 已完成
      case TaskState.End:
        return Localization.getText(LocalKeyType.Common, 'task_end_hint');

      // 失敗
      case TaskState.Fail:
        return Localization.getText(LocalKeyType.Common, 'task_fail_hint');

      default:
        console.error(`taskHintString: undefine type, flag=${taskData.flag}`);
        break;
    }
    return '';
  }

  /** 已承接任務的捲軸位置更新 */
  private onSlideChange(): void {
    // 記錄捲軸位置(0 ~ Count-1) = (0 ~ Count*N) 取 Count的餘數
    this.currentTaskIndex = this.swiper.realIndex % this.acceptTaskList.length;

    // 顯示任務提示
    this.talkContent = this.getTaskHint();
  }

  /** 按下主要按鈕(承接/領獎/前往/放棄)
   * @param taskData 任務資料
   */
  private async onCatchButton(taskData: TaskData): Promise<void> {
    switch (taskData.flag) {
      // 可承接
      case TaskState.CanAccept:
        await this.onTakeTaskAPI(taskData);
        // 轉跳已承接任務頁
        this.onTaskDetailButton();
        break;
      // 進行中
      case TaskState.Running:
        // 開啟學習鏈結
        this.openWebLink(taskData);
        break;
      // 可領取
      case TaskState.Passed:
        this.onReapTaskAPI(taskData);
        break;
      // 已完成
      case TaskState.End:
        break;
      // 失敗
      case TaskState.Fail:
        this.onGiveUpTaskAPI(taskData);
        break;
      default:
        console.error(`undefine flag=${taskData.flag}`);
        break;
    }
  }

  /** 按下一般對話按鈕, 更新對話內容 */
  private onNpcTalkButton(): void {
    const contentKey = `${this.contentKeyBase}${randomRange(1, this.contentRange + 1)}`;
    // 取得對話
    this.talkContent = Localization.getText(LocalKeyType.Common, contentKey);

    // 未填寫對話時
    if (this.talkContent === contentKey) {
      Helper.assert(ErrorId.VariableUndefined, `talkContent is empty, contentKey=${contentKey}`);
    }
  }

  /** 按下 關於任務 按鈕 */
  private onTaskDetailButton(): void {
    // 顯示已承接任務頁
    this.isTaskDetailPage = true;

    // 顯示任務提示
    this.talkContent = this.getTaskHint();
  }

  /** 按下 返回聊其他的 按鈕 */
  private onReturnChitChatButton(): void {
    // 顯示可承接任務頁面
    this.isTaskDetailPage = false;

    // 重置最新任務顯示回一般顯示順序
    if (this.newTaskQuestGroupId > 0) {
      this.newTaskQuestGroupId = -1;
      this.acceptTaskList.sort(this.compareTask);
    }

    // 顯示開場白
    this.talkContent = Localization.getText(LocalKeyType.Common, 'npc_talk_prologue');
  }

  /**打開獎勵彈窗
   * @param rewardItemList 獎勵內容
   */
  @Emit('onOpenRewardDialog')
  private onOpenRewardDialog(rewardItemList: ContestGameAward[]): void {
    return;
  }
}
</script>

<style scoped>
::v-deep .el-dialog {
  background: transparent;
  background-color: #00000080;
}
::v-deep .el-dialog__header {
  padding: 20px 0px 0px 0px;
}
::v-deep .el-dialog__headerbtn {
  right: 10%;
}
::v-deep .el-dialog__body {
  padding: 0px 20px 0px 20px;
  height: 480px;
}
::v-deep .el-dialog__footer {
  padding: 10px 0px 10px 0px;
}
::v-deep .el-icon-close:before {
  font-size: 30px;
  font-weight: 700;
  color: #fff;
}
::v-deep .scrollbar::-webkit-scrollbar {
  padding: 0px 0px 20px 0px;
  height: 10px;
  border: 1px solid #fdc221;
  border-radius: 30px;
}
::v-deep .scrollbar::-webkit-scrollbar-track {
  border-radius: 30px;
}
::v-deep .scrollbar::-webkit-scrollbar-thumb {
  background-color: #fdc221;
  border-radius: 30px;
}
.swiper-button-next {
  color: white;
}
.swiper-button-prev {
  color: white;
}
</style>
