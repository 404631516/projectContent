<template>
  <div class="backend-wrapper">
    <div class="top-area top-mid-1">{{ textData.backendManagementTitle }}</div>
    <ContestEdit />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ContestEdit from '@/views/BackEndManagement/Contest/ContestEdit.vue';

@Component({
  components: {
    ContestEdit,
  },
})
export default class Index extends Vue {
  /** 文字資料 */
  private textData = {
    backendManagementTitle: '導師專區',
  };

  created() {
    // 判斷是否登入狀態(否導回首頁)
    if (this.$$store.getters.isLogin === false) {
      this.$router.push('/');
    }
  }
}
</script>
<style lang="scss">
.backend-wrapper {
  .top-area {
    background-color: #616365;
    color: #fff;
    font-size: 32px;
    line-height: 160px;
    text-align: left;
    padding-left: 2vw;
  }
  .page-box {
    height: 10vw;
    color: #000;
  }
}
.tab-area {
  // margin: 2vw 18vw;
  font-size: 24px;
  .tab-content {
    color: #fff;
    .game-card-wrapper {
      padding: 0;
      font-size: 16px;
    }
  }
}
</style>
