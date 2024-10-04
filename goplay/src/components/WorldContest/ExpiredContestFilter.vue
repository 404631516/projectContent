<template>
  <div class="w-1/2 flex justify-start <lg:w-full <xl:w-955px <sm:(flex-col items-center)">
    <p font="bold" text="2xl [#666666]" m="x-2">{{ textData.option }}</p>
    <label class="flex items-center" text="2xl [#666666]" m="r-2">
      <input
        :class="{ 'bg-[#ebca28]': isHidingExpiredContest === true }"
        v-model="isHidingExpiredContest"
        class="appearance-none rounded w-5 h-5 cursor-pointer"
        m="r-2"
        border="1 solid [#A5A5A5]"
        type="checkbox"
        @change="onHideExpiredContestChange(isHidingExpiredContest)"
      />
      {{ textData.hideExpiredContest }}
    </label>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator';

@Component({})
export default class ExpiredContestFilter extends Vue {
  /** 是否隱藏過期賽事 */
  private isHidingExpiredContest: boolean = true;

  /** 文字資料 */
  private textData = {
    option: '選項',
    hideExpiredContest: '隱藏過期賽事',
  };

  /** 隱藏過期賽事 */
  @Emit('onHideExpiredContestChange')
  private onHideExpiredContestChange(isHidingExpiredContest: boolean): void {
    return;
  }
}
</script>
<style scoped>
label:nth-child(8) {
  grid-column-start: 2;
}
@media (max-width: 435px) {
  label:nth-child(5) {
    grid-column-start: 2;
  }
  label:nth-child(11) {
    grid-column-start: 2;
  }
}
</style>
