<template>
  <div>
    <!-- 獎勵列表 -->
    <div
      v-for="(award, index) in awardList"
      :key="index"
      class="p-[20px] mb-[20px] rounded-[5px] border border-[#707070] border-solid border-[1px]"
    >
      <ol>
        <li>
          <span> {{ RewardManager.getTeacherAwardItemName(award) }} * {{ award.count }} </span>
        </li>
      </ol>
    </div>

    <!-- 提示訊息 -->
    <p class="text-[20px] pt-[20px]">
      {{ textData.currentGameAward }}
      <span class="text-[#d69f05]">{{ awardList.length }}</span>
      {{ textData.awardCountTitle }}
    </p>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import RewardManager from '@/manager/RewardManager';
import { Award } from '@/hero-api/dto/award.dto';

@Component
export default class AwardList extends Vue {
  /** 宣告給Vue使用 */
  private readonly RewardManager = RewardManager;
  /** 獎勵列表 */
  @Prop({ type: Array, required: true }) private awardList!: Award[];

  /** 本地化文本數據，用於 UI 顯示 */
  private textData = {
    currentGameAward: '目前已設定',
    awardCountTitle: '項獎勵',
  };
}
</script>
<style lang="scss" scoped></style>
