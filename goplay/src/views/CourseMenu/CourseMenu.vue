<template>
  <div>
    <GeneralBanner :bannerImg="imgData.banner" :title="textData.title" />
    <router-view />
  </div>
</template>
<script lang="ts">
import imgPath from '@/config/imgPath/imgPath';
import { Component, Vue } from 'vue-property-decorator';
import GeneralBanner from '@/components/Public/GeneralBanner.vue';
@Component({
  components: {
    GeneralBanner,
  },
})
export default class CourseMenu extends Vue {
  /** 圖片資料 */
  private imgData = {
    banner: imgPath.orangeBannerBaseUrl,
  };
  /** 文字資料 */
  private textData = {
    title: '答題遊戲',
  };
}
</script>
