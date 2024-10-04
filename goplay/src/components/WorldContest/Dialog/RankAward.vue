<template>
  <div>
    <el-dialog :visible="msgVisible" :show-close="false" :destroy-on-close="false" :lock-scroll="true" width="100%">
      <div slot="title" text="[#FDC221] 54px">
        {{ textData.rankAwardTitle }}
      </div>
      <!-- 獎勵列表 -->
      <div class="w-800px award-list-box" border="t-1px solid [#FFF]" m="x-auto" p="t-5">
        <div class="h-450px overflow-auto scrollbar">
          <ol
            class="w-[90%] flex flex-col items-start"
            p="l-100px"
            m="x-auto"
            bg="[#FFF] opacity-30"
            border="rounded-10px"
          >
            <li
              :class="getRewardClass(rewardItem)"
              v-for="(rewardItem, rewardIndex) in rewardDataList"
              :key="rewardIndex"
            >
              <!-- 獎勵 -->
              <template>
                <div class="flex items-center h-90px" p="l-10px">
                  <img class="aspect-square object-contain" :src="getRewardImg(rewardItem)" />
                  <span m="l-2" text="36px">{{ getRewardName(rewardItem) }} * {{ rewardItem.count }}</span>
                </div>
              </template>
            </li>
          </ol>
        </div>
      </div>
      <!-- 確認按鈕 -->
      <div slot="footer" class="flex-pos">
        <button
          class="shadow-default yellowGradient"
          m="l-15px"
          p="x-90px y-3"
          border="rounded-60px"
          text="[#FFFFFF]"
          @click="onConfirm"
        >
          {{ textData.confirmTitle }}
        </button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import ImgPath from '@/config/imgPath/imgPath';
import { RewardItemKey } from '@/helper/enum/AnswerGame';
import { ContestGameAward } from '@/helper/interface/Contest';
import RewardManager from '@/manager/RewardManager';

@Component({})
export default class RankAward extends Vue {
  @Prop(Boolean) public msgVisible!: boolean;
  @Prop() private rewardDataList!: ContestGameAward[];

  /** 給Vue用於判別獎勵類型 */
  private rewardItemKey: typeof RewardItemKey = RewardItemKey;

  /** 生物兵器圖片位置 */
  private weaponBaseUrl: string = ImgPath.weaponBaseUrl;

  /** 文字資料 */
  private textData = {
    rankAwardTitle: '排行獎勵',
    awardGoldTitle: '獲得金幣',
    awardCrystalTitle: '獲得晶球',
    confirmTitle: '確定',
  };

  /** 取得獎勵
   * @param reward
   */
  private getRewardClass(reward: ContestGameAward): string {
    switch (reward.itemType) {
      case RewardItemKey.PlanetAntiTDItem:
      case RewardItemKey.AdornmentItem:
        return 'blue-big';
      case RewardItemKey.Weapon:
        return 'blue';
      case RewardItemKey.PlanetCrystal:
        return 'blue-small';
      case RewardItemKey.PlanetGold:
        return 'yellow-small';
      default:
        return '';
    }
  }

  /** 取得獎勵名稱
   *  @param reward
   */
  private getRewardName(reward: ContestGameAward): string {
    return RewardManager.getRewardItemName(reward);
  }

  /** 篩選對應生物兵器圖片
   * @param reward
   */
  private getRewardImg(reward: ContestGameAward): string {
    return RewardManager.getRewardItemImg(reward);
  }

  /** 確認按鈕 */
  @Emit('onConfirm')
  private onConfirm(): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
.award-list-box {
  ol {
    z-index: 10;
    li {
      &.yellow-small {
        img {
          width: 40px;
        }
        span {
          color: #ffde39 !important;
        }
      }
      &.blue-big {
        img {
          width: 70px;
        }
        span {
          color: #2ceaec !important;
        }
      }
      &.blue-small {
        img {
          width: 40px;
        }
        span {
          color: #2ceaec !important;
        }
      }
      &.blue {
        img {
          width: 90px;
        }
        span {
          color: #2ceaec !important;
        }
      }
    }
  }
}
::v-deep .el-dialog {
  background: black;
  opacity: 0.8;
}

.scrollbar::-webkit-scrollbar {
  padding: 100px;
  width: 15px;
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
