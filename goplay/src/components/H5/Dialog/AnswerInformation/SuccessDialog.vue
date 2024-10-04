<template>
  <el-dialog :show-close="false" :visible.sync="isDialogVisible" width="400px" append-to-body destroy-on-close>
    <div slot="title" class="relative">
      <i
        class="el-icon-close absolute right-[5%] top-[7%] cursor-pointer"
        font="before:bold"
        text="4xl [#BFBFBF]"
        @click="closeDialog"
      ></i>
      <h2 text="4xl [#666666] center">{{ textData.title }}</h2>
    </div>
    <div>
      <div class="w-9/12" m="x-auto y-5" text="24px [#A5A5A5] left">{{ textData.info1 }}<br />{{ textData.info2 }}</div>
    </div>
    <!-- 按鈕區 -->
    <div slot="footer" class="grid grid-rows-3 gap-y-2 justify-center">
      <button class="w-50 rounded-[20px] shadow-default blueGradient" p="y-1" text="2xl [#FFF]" @click="goHome">
        {{ textData.backHome }}
      </button>
      <button class="w-50 rounded-[20px] shadow-default blueGradient" p="y-1" text="2xl [#FFF]" @click="goLeaderboard">
        {{ textData.backRank }}
      </button>
      <button class="w-50 rounded-[20px] shadow-default yellowGradient" p="y-1" text="2xl [#FFF]" @click="goForum">
        {{ textData.goForum }}
      </button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Emit, ModelSync, Vue } from 'vue-property-decorator';
@Component({
  components: {},
})
export default class SuccessDialog extends Vue {
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;

  /** 文字資料 */
  private textData = {
    title: '發布成功',
    info1: '可以在星際論壇的我的提問',
    info2: '找到你剛剛發佈的問題喔！',
    backHome: '回首頁',
    backRank: '回排行榜',
    goForum: '前往星際論壇',
  };

  private goHome() {
    this.$router.replace('/');
  }

  @Emit('goLeaderboard')
  private goLeaderboard() {
    return;
  }

  @Emit('closeDialog')
  private closeDialog() {
    return;
  }

  private goForum() {
    this.$router.replace('/InterstellarForum');
  }
}
</script>
<style scoped>
>>> .el-dialog {
  border-radius: 30px;
}
>>> .el-dialog__header {
  padding: 0px;
}
</style>
