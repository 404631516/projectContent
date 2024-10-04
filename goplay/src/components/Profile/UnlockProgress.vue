<template>
  <div class="unlock-progress flex-pos">
    <div class="progress">
      <div class="total-point-item">
        {{ textData.totalPoint }}
        <span text="[#FDC221]">{{ userPoint }}</span>
      </div>
      <!-- 手機版進度條 -->
      <div class="phone-progress">
        <div class="level-ball flex-pos">{{ unlockLevel }}</div>
        <div class="progress">
          <span :style="{ width: `${phoneProgress}%` }"></span>
        </div>
        <div class="level-ball flex-pos">{{ nextUnlockLevel }}</div>
      </div>
      <!-- 電腦版進度條 -->
      <div class="progress-group">
        <div class="progress-item" v-for="(item, index) in progressData" :key="index">
          <div class="progress-level">
            <!-- 提示訊息 -->
            <el-tooltip
              popper-class="progress-tooltip"
              placement="top-start"
              :disabled="isDisableTooltip(item) || lackUserPoint === 0"
              :value="false"
            >
              <div slot="content" class="tooltip-context" text="![#666666] !2xl">
                {{ textData.more }}
                <span>{{ lackUserPoint }}</span> {{ textData.pointToUnlock }}
              </div>
              <span class="level-num flex-pos">{{ item.level }}</span>
            </el-tooltip>
            <!-- 進度條長度 -->
            <div class="progress" v-if="!(index === progressData.length - 1)">
              <span :style="{ width: `${item.progress}%` }"></span>
            </div>
          </div>
          <!-- 解鎖分數 -->
          <p class="progress-point">{{ item.unlockPoint }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import HeroManager from '@/manager/HeroManager';
import TableManager, { HeroUnlockPointData } from '@/manager/TableManager';

/** 等級資料 */
interface LevelData {
  /** 等級 */
  level: number;
  /** 解鎖分數 */
  unlockPoint: number;
  /** 解鎖進度 */
  progress: number;
}

@Component({})
export default class UnlockProgress extends Vue {
  /** 頁面顯示總積分 */
  @Prop() private userPoint!: number;
  /** 英雄分數等級表 */
  @Prop() private heroScoreStep!: HeroUnlockPointData[];
  /** 解鎖等級 */
  @Prop() private unlockLevel!: number;
  /** 手機板進度條 */
  private phoneProgress: number = 0;
  /** 目前進度 */
  private levelDataList: LevelData[] = [];
  /** 顯示數量 */
  private readonly showCount: number = 11;

  /** 文字資料 */
  private textData = {
    totalPoint: '總積分',
    more: `再`,
    pointToUnlock: `分可解鎖`,
  };

  /** 解鎖的下一等級 */
  private get nextUnlockLevel(): number {
    return this.unlockLevel + 1;
  }

  /** 計算出顯示多少百分比的進度 */
  private get progressData(): LevelData[] {
    // 現在等級 > 顯示個數的一半
    if (this.unlockLevel > Math.ceil(this.showCount / 2)) {
      // 取進度區段
      return this.levelDataList.slice(
        this.unlockLevel - Math.floor(this.showCount / 2),
        this.unlockLevel + Math.ceil(this.showCount / 2)
      );
    }
    // 初始進度區段
    return this.levelDataList.slice(0, this.showCount);
  }

  /** 計算出差多少分可以解鎖下一個英雄 */
  private get lackUserPoint(): number {
    return this.getScoreLevelUnLockPoint(this.userPoint);
  }

  created() {
    this.calculateProgressData();
  }

  /** 計算進度 */
  private calculateProgressData(): void {
    for (let i = 0; i < this.heroScoreStep.length; i++) {
      let progress = 0;
      const nextLevel = i + 1;
      if (this.userPoint > this.heroScoreStep[i].UnLockPoint) {
        progress = 100;
        this.phoneProgress = progress;
        // 未達等級計算進度條
        if (this.heroScoreStep[nextLevel].UnLockPoint > this.userPoint) {
          const total = this.heroScoreStep[nextLevel].UnLockPoint - this.heroScoreStep[i].UnLockPoint;
          progress = 100 - (this.lackUserPoint / total) * 100;
          this.phoneProgress = progress;
        }
      }
      this.levelDataList.push({
        level: this.heroScoreStep[i].id,
        unlockPoint: this.heroScoreStep[i].UnLockPoint,
        progress,
      });
    }
  }

  /** 傳傳入使用者積分計算多少分可以到下一等級
   * @param score 使用者積分
   * @returns 差多少分
   */
  private getScoreLevelUnLockPoint(score: number): number {
    const scoreStep = this.heroScoreStep.find((item) => item.id === this.nextUnlockLevel);
    return scoreStep === undefined ? 0 : scoreStep.UnLockPoint - score;
  }

  /** 判斷顯示那個 Tooltip
   * @param item 等級對應資料
   */
  private isDisableTooltip(item: LevelData): boolean {
    return this.nextUnlockLevel !== item.level;
  }
}
</script>

<style lang="scss" scoped>
$yellow: #ffde39;
.unlock-progress {
  background: #fff;
  height: 145px;
  .progress {
    width: 1024px;
    height: 90%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    .total-point-item {
      text-align: left;
      font-size: 25px;
      color: #666666;
      span {
        font-size: 35px;
        color: $yellow;
      }
    }
    .phone-progress {
      display: none;
    }
    .progress-group {
      display: flex;
      margin-left: 12px;
      .progress-item {
        display: flex;
        flex-direction: column;
        .progress-level {
          display: flex;
          align-items: center;
          height: 30px;
          margin-left: -12px;
          .level-num {
            cursor: pointer;
            z-index: 10;
            border-radius: 50%;
            width: 31px;
            height: 31px;
            font-size: 20px;
            background: $yellow;
          }
          .progress {
            width: 75px;
            height: 15px;
            background: #878787;
            position: relative;
            left: -6px;
            text-align: left;
            span {
              display: inline-block;
              background: $yellow;
              height: 100%;
              border-radius: 10px;
            }
          }
        }
        .progress-point {
          width: 30px;
          text-align: center;
          font-size: 20px;
          color: $yellow;
          position: relative;
          left: -10px;
          top: 5px;
        }
      }
    }
  }
}
@media (max-width: 435px) {
  .unlock-progress {
    .progress {
      width: 410px;
      .progress-group {
        display: none;
      }
      .phone-progress {
        display: flex;
        width: 410px;
        height: 50px;
        align-items: center;
        .level-ball {
          cursor: pointer;
          border-radius: 50%;
          width: 31px;
          height: 31px;
          font-size: 20px;
          background: $yellow;
          z-index: 10;
        }
        .progress {
          width: calc(100% - 60px);
          height: 15px;
          background: #878787;
          position: relative;
          span {
            display: inline-block;
            background: $yellow;
            height: 100%;
            border-top-right-radius: 10px;
            border-bottom-right-radius: 10px;
          }
        }
      }
    }
  }
}
</style>
