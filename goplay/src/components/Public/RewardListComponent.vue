<template>
  <!-- 控制外層超出有滑桿 -->
  <div class="w-[95%] flex rounded-[10px] overflow-auto scrollbar" m="b-3">
    <!-- 內層排列傳參數控制置中 -->
    <div class="flex space-x-2" p="b-1" :class="isCenter ? 'mx-auto' : ''">
      <!-- 獎勵道具名字 -->
      <el-tooltip effect="dark" placement="top" v-for="(reward, index) in rewardList" :key="index">
        <div slot="content" text="center" m="y-3 x-2">
          <span text="base [#FFFFFF]">{{ getItemName(reward) }}</span>
        </div>
        <div
          class="h-18 aspect-square flex flex-col items-center"
          p="y-2"
          :style="{ backgroundImage: `url(${imgData.rewardFrame})` }"
          bg="cover"
        >
          <img :src="getItemImg(reward)" class="w-10 aspect-square object-contain" />
          <span text="base [#FFFFFF]">{{ `x${reward.count}` }}</span>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import { ContestGameAward } from '@/helper/interface/Contest';
import RewardManager from '@/manager/RewardManager';

@Component({
  components: {},
})
export default class RewardListComponent extends Vue {
  /** 獎勵列表 */
  @Prop() private rewardList!: ContestGameAward[];
  /** 是否要置中 */
  @Prop(Boolean) private isCenter!: boolean;

  /** 圖片資料 */
  private imgData = {
    rewardFrame: imgPath.rewardFrame,
  };

  /** 抓取道具圖片
   *  @param rewardItem 獎勵道具
   */
  private getItemImg(rewardItem: ContestGameAward): string {
    return RewardManager.getRewardItemImg(rewardItem);
  }

  /** 抓取道具名字
   *  @param rewardItem 獎勵道具
   */
  private getItemName(rewardItem: ContestGameAward): string {
    return RewardManager.getRewardItemName(rewardItem);
  }
}
</script>
<style scoped>
.scrollbar::-webkit-scrollbar {
  height: 7px;
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-track {
  background-color: #ffffff;
  border: 1px solid #fdc221;
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-thumb {
  background-color: #fdc221;
  border-radius: 30px;
}
</style>
