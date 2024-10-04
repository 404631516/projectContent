<template>
  <div class="grid grid-cols-4 max-w-1057px <sm:grid-cols-2 justify-items-center" m="x-auto <sm:x-0">
    <!-- 新增賽事按鈕 -->
    <div class="add-card" border="rounded-15px" v-show="isAddCard" @click="onAddContest">
      <span>+</span>
      <p>{{ textData.addContest }}</p>
    </div>
    <!-- 卡片列表 -->
    <WorldGameCard
      v-for="(contest, index) in contestDataList"
      :key="index"
      :contestListData="contest"
      :cardType="cardType"
      :hideContestType="hideContestType"
      @onClickTaskAdd="onClickTaskAdd(contest.id)"
      @onClickView="onClickView(contest.id)"
      @onClickEdit="onClickEdit(contest.id)"
      @onCreateRoom="onCreateRoom(contest.id)"
      @onManageRoom="onManageRoom(contest.id)"
      @onSwitchPublic="onSwitchPublic(contest.id)"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import WorldGameCard from '@/components/WorldContest/WorldGameCard.vue';
import { ContestListData } from '../../helper/interface/Contest';
import { ContestCardType } from '@/helper/enum/Common';

@Component({
  components: {
    WorldGameCard,
  },
})
export default class GameCardList extends Vue {
  /** 賽事資訊 */
  @Prop(Array) private contestDataList!: ContestListData[];
  /** 不想顯示的賽事類型 */
  @Prop(Number) private hideContestType!: number;

  /** 是否開啟新增賽事按鈕 */
  @Prop(Boolean) private isAddCard!: boolean;
  /** 賽事卡片種類 */
  @Prop() private cardType!: ContestCardType;

  /** 文字資料 */
  private textData = {
    addContest: '新增賽事',
  };

  /** 查看按鈕(路由跳轉) */
  @Emit('onClickTaskAdd')
  private onClickTaskAdd(contestId: number): void {
    return;
  }

  /** 查看按鈕(路由跳轉) */
  @Emit('onClickView')
  private onClickView(contestId: number): void {
    return;
  }

  /** 查看按鈕(路由跳轉) */
  @Emit('onClickEdit')
  private onClickEdit(contestId: number): void {
    return;
  }

  /** 創建房間按鈕 */
  @Emit('onCreateRoom')
  private onCreateRoom(contestId: number): void {
    return;
  }

  /** 管理房間按鈕 */
  @Emit('onManageRoom')
  private onManageRoom(contestId: number): void {
    return;
  }

  /** 切換公開隱藏按鈕 */
  @Emit('onSwitchPublic')
  private onSwitchPublic(contestId: number): void {
    return;
  }

  /** 添加按鈕(路由跳轉) */
  @Emit('onAddContest')
  private onAddContest(): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
.bg-gary {
  background-color: #fff;
}
.add-card {
  cursor: pointer;
  outline: 5px dashed #a5a5a5;
  margin: 20px;
  color: #666666;
  font-size: 40px;
  width: 215px;
  height: 340px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  &:hover {
    color: #ffffff;
    background-color: #555;
  }
}
.game-card-wrapper {
  display: flex;
  flex-wrap: wrap;
  @media (max-width: 435px) {
    width: 425px;
  }
}

@media (max-width: 435px) {
  .card-wrapper {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
