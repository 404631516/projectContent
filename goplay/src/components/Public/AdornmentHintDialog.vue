<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    :destroy-on-close="true"
    :modal="false"
    :before-close="onCloseDialog"
    @open="onOpenDialog"
    top="8vh"
  >
    <!-- 標題 -->
    <div slot="title" class="flex justify-center items-center" text="xl [#666666]">
      {{ textData.dialogTitle }}
    </div>
    <!-- 內文 -->
    <div m="x-auto" text="lg [#666666]">
      <div class="grid grid-rows-2" p="y-2" border="b-2px t-2px solid [#D4D4D4]">
        <!-- 當前階段 -->
        <p>{{ textData.currentText }}{{ textData.indexText }}{{ currentLevel }}{{ textData.levelText }}</p>
        <!-- 下一階段 -->
        <p v-if="nextPoint !== -1">
          {{ textData.remainText }}
          <span text="[#FDC221]">{{ nextPoint }}</span>
          {{ textData.point }}
          {{ textData.arriveNextLevel }}
        </p>
        <!-- 如果已達到最高階段 -->
        <p v-else>
          {{ textData.maxLevelPoint }}
          <span text="[#FDC221]">{{ currentPoint }}</span>
          {{ textData.point }}
        </p>
      </div>
      <!-- 下一階段可解鎖房間類型 -->
      <p p="y-3">
        <img :src="imgData.noticeMark" class="w-7.5 aspect-square object-contain inline-block" />
        <span v-if="nextUnlockRoom !== ''">{{ textData.nextUnlock }}{{ nextUnlockRoom }}</span>
        <span v-else>{{ textData.unlockToMaxLevel }}</span>
      </p>
      <!-- 當前可解鎖房間數 -->
      <div class="grid grid-cols-[4fr,2fr,1fr] grid-rows-2 items-center rounded-10px" m="x-4" p="4" bg="[#E2E2E27D]">
        <div class="row-span-2 flex justify-center items-start">
          <img :src="imgData.homeUrl" class="w-6 aspect-square object-contain inline-block" />
          {{ textData.currentUnlockRoomCount }}
        </div>
        {{ textData.smallRoom }}
        <span text="[#00C4C7]">{{ unlockedSmallRoom }}</span>
        {{ textData.bigRoom }}
        <span text="[#00C4C7]">{{ unlockedBigRoom }}</span>
      </div>
      <!-- 階段解鎖獎勵 -->
      <div p="y-2.5" m="t-5" border="t-2px solid [#D4D4D4]">{{ textData.unlockBonus }}</div>
      <!-- 階段列表 -->
      <div class="h-110 space-y-2 scrollbar overflow-auto" m="l-6 r-2">
        <div v-for="(level, index) in adornmentLevelList" :key="index" class="grid grid-cols-[1.5fr,2fr,1.5fr] gap-x-2">
          <p text="left">{{ textData.indexText }}{{ level.id }}{{ textData.levelText }}</p>
          <p text="right">
            <span text="[#FDC221]">{{ level.nextLevelPoint }}</span>
            {{ textData.point }}
          </p>
          <span text="left">{{ getRoomType(level) }}</span>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Emit, ModelSync, Vue } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { AdornmentGameData } from '@/helper/interface/Game';
import TableManager, { AdornmentLevelData } from '@/manager/TableManager';

@Component({})
export default class AdornmentHintDialog extends Vue {
  /**此頁面彈窗開關 */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;

  /** 使用者當前積分 */
  // private userPoint: number = 0;
  /** 當前階段 */
  private currentLevel: number = 0;
  private currentPoint: number = 0;
  /** 距離下一階段所剩積分 */
  private nextPoint: number = 0;
  /** 下一階段解鎖房間類型 */
  private nextUnlockRoom: string = '';

  /** 文字資料 */
  private textData = {
    dialogTitle: '擴張房間說明',
    currentText: '當前為',
    indexText: '第',
    levelText: '階段',
    remainText: '尚餘',
    point: '積分',
    arriveNextLevel: '到達下一階段',
    maxLevelPoint: '目前已累積',
    nextUnlock: '下一階段可解鎖',
    unlockToMaxLevel: '目前已解鎖至最高等級',
    currentUnlockRoomCount: '當前可解鎖房間數',
    unlockBonus: '階段解鎖獎勵',
    defaultRoom: '預設大房間',
    roomUnit: '間',
    bigRoom: '大房間',
    smallRoom: '小房間',
  };

  /** 圖片資料 */
  private imgData = {
    noticeMark: imgPath.noticeGreenUrl,
    homeUrl: imgPath.homeBlueUrl,
  };

  /** 階段列表 */
  private get adornmentLevelList(): AdornmentLevelData[] {
    return TableManager.adornmentLevel.getAll();
  }

  /** 可解鎖的小房間數 */
  private get unlockedSmallRoom(): number {
    return this.$$store.state.AdornmentModule.unlockSmallRoomQuota;
  }

  /** 可解鎖的大房間數 */
  private get unlockedBigRoom(): number {
    return this.$$store.state.AdornmentModule.unlockBigRoomQuota;
  }

  /** 使用者當前遊戲資料 */
  private get adornmentGameData(): AdornmentGameData | undefined {
    return this.$$store.state.AdornmentModule.gameData;
  }

  onOpenDialog() {
    this.getCurrentState();
  }

  /** 取得當前狀態 */
  private getCurrentState(): void {
    if (this.adornmentGameData == null) {
      return;
    }
    this.currentPoint = this.adornmentGameData.heroTotalPoint;
    this.currentLevel = this.adornmentGameData.adornmentLevelData.id;
    const nextLevelData = TableManager.adornmentLevel.findOne(this.currentLevel + 1);
    // 找不到代表積分超過靜態表最大值
    if (nextLevelData == null) {
      this.nextPoint = -1;
      this.nextUnlockRoom = '';
    } else {
      this.nextPoint = nextLevelData.nextLevelPoint - this.adornmentGameData.heroTotalPoint;
      this.nextUnlockRoom = this.getRoomType(nextLevelData);
    }
  }

  /** 判斷解鎖房間類型 */
  private getRoomType(level: AdornmentLevelData): string {
    if (level.id === 1) {
      return this.textData.defaultRoom;
    } else if (level.unlockBigRoomQuota > 0) {
      return `${level.unlockBigRoomQuota}${this.textData.roomUnit}${this.textData.bigRoom}`;
    } else {
      return `${level.unlockSmallRoomQuota}${this.textData.roomUnit}${this.textData.smallRoom}`;
    }
  }

  @Emit('onCloseDialog')
  /** 關掉dialog */
  private onCloseDialog(): void {
    return;
  }
}
</script>

<style scoped>
::v-deep .el-dialog {
  max-width: 26rem;
  width: 95%;
  border-radius: 30px;
}
::v-deep .el-dialog__header {
  padding: 10px 0px 10px 0px;
}
::v-deep .el-dialog__headerbtn {
  top: 10px;
}

::v-deep .el-dialog__body {
  padding: 0px 20px 20px 20px;
}
::v-deep .el-icon-close:before {
  font-size: 32px;
  font-weight: 700;
}

.scrollbar::-webkit-scrollbar {
  padding: 0px 0px 10px 0px;
  width: 10px;
  border: 1px solid #fdc221;
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-track {
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-thumb {
  background-color: #fdc221;
  border-radius: 30px;
}
</style>
