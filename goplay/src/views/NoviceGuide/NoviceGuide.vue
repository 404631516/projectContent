<template>
  <div class="!overflow-hidden">
    <GeneralBanner :bannerImg="imgData.banner" :title="textData.title" />
    <router-view />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import imgPath from '@/config/imgPath/imgPath';
import GeneralBanner from '@/components/Public/GeneralBanner.vue';

@Component({
  components: {
    GeneralBanner,
  },
})
export default class NoviceGuide extends Vue {
  /** 圖片資料 */
  private imgData = {
    banner: imgPath.orangeBannerBaseUrl,
  };
  /** 文字資料 */
  private textData = {
    title: '新手引導',
  };
}
</script>
