<template>
  <div>
    <el-dialog
      :visible.sync="isDialogVisible"
      :modal-append-to-body="false"
      :destroy-on-close="true"
      fullscreen
      :show-close="false"
      @open="onOpenDialog"
      :before-close="onCloseDialog"
    >
      <!-- 標題 -->
      <div
        slot="title"
        class="w-2/3 flex items-center justify-center tracking-2px gradient_color"
        m="x-auto y-3"
        p="y-5"
        bg="gradient-to-r "
        text="[#FFF] 30px"
      >
        {{ textData.title }}
      </div>
      <!-- 內文 -->
      <div class="w-full flex flex-col items-center bg-[#000000CC]" p="b-8">
        <div class="w-2/3 flex flex-col items-center" p="t-4" border="b-1 solid #FFF" text="24px [#FFF]">
          {{ textData.countdown }}
          <!-- 倒數 -->
          <div class="w-63 rounded-[30px] flex justify-center items-center" border="2px solid [#F7E735]" m="t-4 b-3">
            <img :src="imgData.clock" class="h-11 inline-block object-contain" />
            <span text="[#F7E735]">{{ countDownTimer }}</span>
          </div>
        </div>
        <!-- 等候人數 -->
        <span text="20px [#00CCCE]" m="y-7">
          {{ textData.waitingTeamText }}
          {{ contestPlayerList.length }}/{{ maxParticipateMember }}
        </span>
        <!-- 玩家列表 -->
        <div class="w-2/3 grid sm:(grid-cols-5 grid-rows-6 gap-4) <sm:(grid-cols-1 gap-y-4)" text="16px [#FFF] left">
          <!-- 玩家 -->
          <div v-for="(player, index) in contestPlayerList" :key="index" class="flex justify-start items-center p-5px">
            <!-- 頭像 -->
            <div class="w-12.5 aspect-square rounded-[20px]" bg="[#D8D8D8]">
              <img :src="getHeroImgUrl(player.heroId)" class="block object-contain" />
            </div>
            <!-- 學校和名字 -->
            <div class="space-y-1" p="l-2">
              <p>{{ player.school }}</p>
              <p>{{ player.name }}</p>
            </div>
          </div>
        </div>
        <!-- 提示訊息 -->
        <div class="flex items-center rounded-[30px]" p="l-5 r-2.5 y-1" bg="[#2EA145CC]" text="lg [#FFFFFF]">
          {{ textData.tipsText }}
          <button
            class="flex items-center relative rounded-[30px]"
            p="x-5 y-1"
            border="2px solid [#FFFFFF]"
            bg="[#000000CC]"
            @click="onOpenExplainDialog"
          >
            <img class="w-10 object-contain absolute left-0" :src="imgData.questionMark" />
            <p m="l-5">{{ textData.hintText }}</p>
          </button>
        </div>
      </div>
    </el-dialog>
    <BrickBreakerExplainDialog v-model="isOpenExplainDialog" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, ModelSync } from 'vue-property-decorator';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { ServiceUserInfo } from '@/views/H5/Net/NetProtocol/CommonStructure';
import HeroManager, { HeroImgType } from '@/manager/HeroManager';
import Config from '@/config/setting';
import BrickBreakerExplainDialog from './BrickBreaker/BrickBreakExplainDialog.vue';

@Component({
  components: {
    BrickBreakerExplainDialog,
  },
})
export default class WaitingRoomDialog extends Vue {
  /** 顯示dialog */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  /** 下次刷新時間 */
  private countDownTimer: string = '';
  /** 計時器id */
  private intervalId: number = 0;
  /** 計時器剩餘秒數 */
  private countDownSecond: number = 0;

  /** 文字資料 */
  private textData = {
    title: '敲敲答答GO!',
    countdown: '開始遊戲倒數',
    waitingTeamText: '等待隊列...',
    tipsText: 'Tips:破壞磚塊或打開寶箱有機率獲得道具喔！',
    hintText: '磚塊及道具說明',
  };

  /** 圖片資料 */
  private imgData = {
    clock: `${Config.imgUrl}/img/h5/brickBreaker/timerIcon.png`,
    questionMark: `${Config.imgUrl}/img/h5/brickBreaker/questionMarkIcon.png`,
  };

  /** 最大參加人數 */
  private get maxParticipateMember(): number {
    return this.$$store.state.RoomModule.maxPlayerInRoom;
  }

  /** 抓出玩家列表 */
  private get contestPlayerList(): ServiceUserInfo[] {
    return this.$$store.state.RoomModule.contestPlayerList;
  }

  /** 是否開啟說明視窗 */
  private get isOpenExplainDialog(): boolean {
    return this.$$store.state.BrickBreakerModule.isShowExplainDialog;
  }

  /** 玩家使用英雄的頭像 */
  private getHeroImgUrl(heroId: number): string {
    return HeroManager.getHeroImgUrlByHeroId(heroId, HeroImgType.Head);
  }

  /** 開啟彈窗 */
  onOpenDialog() {
    // 抓取遊戲開始剩餘秒數
    this.countDownSecond = Math.floor(this.$$store.state.RoomModule.gameStartCountDown / 1000);

    // 設定倒數計時器
    this.setCountDownTimer();
  }

  /** 關掉dialog */
  onCloseDialog() {
    // 刪除間隔計時器
    clearInterval(this.intervalId);
    this.intervalId = 0;
    this.$$store.commit('setShowWaitingRoom', false);
    this.$$store.commit('setShowBrickBreakerExplainDialog', false);
  }

  /** 設定倒數計時器 */
  private setCountDownTimer(): void {
    // 擴展插件
    dayjs.extend(duration);

    // 建立間隔計時器
    this.intervalId = setInterval(() => {
      // 將秒數放入時間物件，組成字串
      this.countDownTimer = dayjs.duration(this.countDownSecond, 'seconds').format('HH:mm:ss');

      if (this.countDownSecond < 0) {
        return;
      }

      // 倒數結束
      if (this.countDownSecond === 0) {
        this.countDownSecond = -1;
        this.onCloseDialog();
        return;
      }

      // 減1秒
      --this.countDownSecond;
    }, 1000);
  }

  /** 開啟說明視窗 */
  private onOpenExplainDialog(): void {
    this.$$store.commit('setShowBrickBreakerExplainDialog', true);
  }
}
</script>

<style scoped>
::v-deep .el-dialog {
  background: transparent;
  background-color: #00000080;
}
::v-deep .el-dialog__header {
  padding: 20px 0px 20px 0px;
}
::v-deep .el-dialog__body {
  padding: 0px 0px 0px 0px;
}
::v-deep .el-dialog__footer {
  padding: 10px 0px 10px 0px;
}
::v-deep .gradient_color {
  --tw-gradient-from: transparent;
  --tw-gradient-stops: var(--tw-gradient-from), rgba(0, 198, 13, 0.8), var(--tw-gradient-to, rgba(255, 255, 255, 0));
  --tw-gradient-to: transparent;
}
</style>
