<template>
  <el-dialog :visible.sync="isDialogVisible" top="8vh" width="95%">
    <div
      slot="title"
      font="bold"
      text="32px [#666666]"
      p="b-4"
      border="b-3 solid [#C1C1C1]"
    >
      {{ textData.title }}
    </div>
    <div
      class="h-160 overflow-auto scrollbar"
      text="left [#A5A5A5] 20px"
      p="x-[5%]"
    >
      <h3 text="25px [#00CCCE] center">{{ textData.title1 }}</h3>
      <h4 text="22px" m="b-1">{{ textData.info1 }}</h4>
      <p>
        {{ textData.info2 }}
      </p>
      <img
        class="w-[95%] object-contain aspect-video"
        m="y-1 x-auto"
        src="@/assets/images/instructionsDialog/picture1.png"
      />
      <img
        class="w-[95%] object-contain aspect-video"
        m="y-1 x-auto"
        src="@/assets/images/instructionsDialog/picture2.png"
      />
      <h4 text="22px" m="b-1">{{ textData.info3 }}</h4>
      <p>{{ textData.info4 }}</p>
      <img
        class="w-[95%] object-contain aspect-video"
        m="y-1 x-auto"
        src="@/assets/images/instructionsDialog/picture3.png"
      />
      <p>
        {{ textData.info5 }}<br />
        {{ textData.info6 }}<b bg="[#ff0]">{{ textData.info7 }}</b
        >{{ textData.info8 }}<br />
        {{ textData.info9 }}<br />
        {{ textData.info10 }}
      </p>
      <h4 bg="[#ff0]">
        <i class="el-icon-star-on" />
        <i class="el-icon-star-on" />
        {{ textData.info11 }}
        <i class="el-icon-star-on" />
        <i class="el-icon-star-on" />
      </h4>
      <h4>
        <i class="el-icon-star-on" />
        {{ textData.info12 }}
      </h4>
      <img
        class="w-[95%] object-contain aspect-video"
        m="y-1 x-auto"
        src="@/assets/images/instructionsDialog/picture4.png"
      />
      <h4 text="22px" m="b-1">{{ textData.info13 }}</h4>
      <p>
        <i class="el-icon-star-off" />
        {{ textData.info14 }}<br />
        {{ textData.info15 }}
      </p>
      <img
        class="w-[95%] object-contain aspect-video"
        m="y-1 x-auto"
        src="@/assets/images/instructionsDialog/picture5.png"
      />
      <img
        class="w-[95%] object-contain aspect-video"
        m="y-1 x-auto"
        src="@/assets/images/instructionsDialog/picture6.png"
      />
      <p>
        {{ textData.info16 }}
      </p>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, ModelSync } from 'vue-property-decorator';

/** 共用 訊息面板 */
@Component({
  components: {},
})
export default class InstructionsDialog extends Vue {
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  /**文字資料 */
  private textData = {
    title: '獲得晶球的方法',
    title1: '晶球獲得方式',
    info1: '【代幣兌換】',
    info2:
      '遊戲畫面的右上角，可以將自己擁有的因材網代幣兌換成解鎖生物兵器所需的晶球',
    info3: '【要如何取得因材網代幣呢？】',
    info4: '因材網代幣可以在因材網的左側列表→獎勵→代幣記錄查看',
    info5: '因材網代幣分為《系統幣》及《教師幣》',
    info6: '《系統幣》獲得方式：',
    info7: '學生自行到因材網看影片、做題目',
    info8: '後獲得',
    info9:
      '《教師幣》獲得方式：完成老師派發的任務會獲得教師幣（只要是在做任務過程中得到的都算是教師幣）',
    info10: '已獲得的系統幣會自動匯入遊戲中，可以直接兌換成晶球。',
    info11: '只有《系統幣》可以在遊戲中兌換成晶球唷！',
    info12: '系統幣與教師幣範例：',
    info13: '【星際論壇】',
    info14: '星際論壇有能有機會獲得金幣及晶球唷！',
    info15: '在答題資訊頁發出的求救，可以在遊戲首頁的《星際論壇》查看',
    info16:
      '在星際論壇可以看到同學提出的問題並幫忙解答，也可以看到有沒有人來解答自己的提問，提問和解答都能個別獲得金幣或晶球獎勵哦！',
  };
}
</script>
<style scoped>
>>> .el-dialog {
  max-width: 830px;
  border-radius: 30px;
}
>>> .el-dialog__body {
  padding: 0px 20px 30px 20px;
}
>>> .el-icon-close:before {
  font-size: 32px;
  font-weight: 700;
}
.scrollbar::-webkit-scrollbar {
  width: 7px;
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
