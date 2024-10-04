<template>
  <el-dialog
    width="100%"
    top="60vh"
    :visible="msgVisible"
    :show-close="false"
    :destroy-on-close="true"
    :lock-scroll="true"
    :modal="false"
  >
    <!-- 答對答錯顯示 -->
    <div
      slot="title"
      class="from-transparent to-transparent"
      :class="answerSwitch.isCorrect ? 'via-[#47C931CB]' : 'via-[#E83636CC]'"
      font="bold"
      text="6xl [#FFF] stroke-2 stroke-black"
      p="y-7"
      bg="gradient-to-r"
    >
      {{ dialogTitle }}
    </div>
    <!-- 獎勵顯示 -->
    <div
      v-if="isShowAward"
      class="flex justify-center items-center from-transparent via-[#000] to-transparent"
      m="t-5"
      p="y-2"
      bg="gradient-to-r"
    >
      <img class="w-18 h-18 object-contain" m="r-2" :src="randomAwardData.itemImage" />
      <div>
        <p text="xl [#FFF]">{{ randomAwardData.awardTitle }}</p>
        <p text="2xl [#f7e735]">{{ randomAwardData.itemName }}</p>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { AsyncHelper } from '../../views/H5/Helper/AsyncHelper';
import { AnswerSwitch } from '@/helper/interface/AnswerGame';

/** 隨機道具獎勵格式 */
export interface RandomAwardData {
  /** 獎勵標題 */
  awardTitle: string;
  /** 獎勵道具名稱 */
  itemName: string;
  /** 獎勵道具圖片路徑 */
  itemImage: string;
}

@Component({})
export default class RandomTMP extends Vue {
  /** 顯示彈窗 */
  @Prop(Boolean) public msgVisible!: boolean;
  /** 答題結果 */
  @Prop() public answerSwitch!: AnswerSwitch;
  /** 是否顯示獎勵訊息 */
  @Prop(Boolean) public isShowAward!: boolean;
  /** 隨機獎勵道具資料 */
  @Prop() private randomAwardData!: RandomAwardData;

  /** 取得答題結果標題名稱 */
  private get dialogTitle(): string {
    // 答對
    if (this.answerSwitch.isCorrect) {
      return '正確答案!';
    }
    // 時間到
    else if (this.answerSwitch.isPass) {
      return '答題時間到了！';
    }
    // 答錯
    else {
      return '錯誤答案';
    }
  }

  created() {
    this.init();
  }

  /** 初始化 */
  private async init(): Promise<void> {
    // 展示時間
    let showTime: number = 0;

    // 答題正確, 顯示獲得道具
    if (this.isShowAward) {
      // 顯示獲得道具會久一點
      showTime = 1.2;
    }
    // 答題正確
    else if (this.answerSwitch.isCorrect) {
      showTime = 1;
    }
    // 答題錯誤
    else {
      showTime = 0.5;
    }

    // 顯示一段時間後關閉
    await AsyncHelper.sleep(showTime);
    this.onClose();
  }

  /** 關閉顯示 */
  @Emit('onClose')
  private onClose(): void {
    return;
  }
}
</script>
<style scoped>
>>> .el-dialog {
  background: transparent;
  box-shadow: 0px;
}
>>> .el-dialog__header {
  padding: 0;
}
>>> .el-dialog__body {
  padding: 0;
}
</style>
