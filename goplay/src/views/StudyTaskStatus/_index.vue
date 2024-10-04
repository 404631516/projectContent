<template>
  <div bg="[#FFF]">
    <!-- banner -->
    <GeneralBanner :bannerImg="imgData.banner" :title="textData.StudyTaskStatus" />
    <DeliveredTaskListDataGrid />
  </div>
</template>
<script lang="ts">
import GeneralBanner from '@/components/Public/GeneralBanner.vue';
import imgPath from '@/config/imgPath/imgPath';
import { Component, Vue } from 'vue-property-decorator';
import DeliveredTaskListDataGrid from './DeliveredTaskListDataGrid.vue';

@Component({
  components: {
    GeneralBanner,
    DeliveredTaskListDataGrid,
  },
})
export default class TeacherAdmin extends Vue {
  /** 圖表資料 */
  protected imgData = {
    banner: imgPath.orangeBannerBaseUrl,
  };
  /** 文字資料 */
  protected textData = {
    StudyTaskStatus: '任務完成度查詢',
  };
}
</script>
