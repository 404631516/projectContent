<template>
  <el-dialog
    width="100%"
    top="60vh"
    :visible="isShowResult"
    :show-close="false"
    :destroy-on-close="true"
    :lock-scroll="true"
    :modal="false"
  >
    <!-- 答對答錯顯示 -->
    <div
      slot="title"
      class="from-transparent to-transparent"
      :class="answerResult.status === QuizAnswerStatus.Correct ? 'via-[#47C931CB]' : 'via-[#E83636CC]'"
      font="bold"
      text="6xl [#FFF] stroke-2 stroke-black"
      p="y-7"
      bg="gradient-to-r"
    >
      {{ resultMessage }}
    </div>
    <!-- 獎勵顯示 -->
    <div
      v-if="isShowAward"
      class="flex justify-center items-center from-transparent via-[#000] to-transparent"
      m="t-5"
      p="y-2"
      bg="gradient-to-r"
    >
      <img class="w-18 h-18 object-contain" m="r-2" :src="awardData.imageUrl" />
      <div>
        <p text="xl [#FFF]">{{ awardData.title }}</p>
        <p text="2xl [#f7e735]">{{ awardData.name }}</p>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, ModelSync } from 'vue-property-decorator';
import { AsyncHelper } from '../../views/H5/Helper/AsyncHelper';
import { QuizAnswerResult } from '@/hero-api/dto/quiz.dto';
import { QuizAnswerStatus } from '@/hero-api/entity/quiz.entity';

/** 隨機道具獎勵格式 */
export interface AwardData {
  /** 獎勵標題 */
  title: string;
  /** 獎勵道具名稱 */
  name: string;
  /** 獎勵道具圖片路徑 */
  imageUrl: string;
}

@Component({})
export default class HeroApiQuizResult extends Vue {
  /** 顯示彈窗 */
  @ModelSync('syncIsShowResult', 'change', { type: Boolean })
  public isShowResult!: boolean;
  /** 是否顯示獎勵訊息 */
  @Prop(Boolean) public isShowAward: boolean;
  /** 答題結果 */
  @Prop() private answerResult: QuizAnswerResult;
  /** 獎勵道具資料 */
  @Prop() private awardData: AwardData;

  /** 答題狀態(讓Vue辨認) */
  private QuizAnswerStatus = QuizAnswerStatus;

  /** 取得答題結果字串 */
  private get resultMessage(): string {
    switch (this.answerResult.status) {
      case QuizAnswerStatus.Correct:
        return '正確答案!';
      case QuizAnswerStatus.NotAnswered:
      case QuizAnswerStatus.TimesUp:
        return '答題時間到了！';
      default:
        return '錯誤答案';
    }
  }

  async created() {
    // 展示時間
    let showTime: number = 0;

    // 答題正確, 顯示獲得道具
    if (this.isShowAward) {
      // 顯示獲得道具會久一點
      showTime = 1.2;
    }
    // 答題正確
    else if (this.answerResult.status === QuizAnswerStatus.Correct) {
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
  private onClose(): void {
    this.isShowResult = false;
  }
}
</script>
<style scoped>
::v-deep .el-dialog {
  background: transparent;
  box-shadow: 0px;
}
::v-deep .el-dialog__header {
  padding: 0;
}
::v-deep .el-dialog__body {
  padding: 0;
}
</style>
