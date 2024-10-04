<template>
  <div class="flex justify-center items-center" m="t-1" p="y-5" bg="[#F9F8F4]">
    <div class="w-1/2 <xl:w-3/4 <lg:w-11/12">
      <p font="bold" text="[#FDC221] 3xl">{{ textData.contactMethod }}</p>
      <div
        class="flex justify-center space-x-4 <sm:flex-col"
        p="b-5"
        m="t-5"
        font="bold"
        text="[#A5A5A5] xl"
        border="b-1 solid [#D2D2D2]"
      >
        <span>{{ textData.phone }}</span> <span>{{ textData.email }}</span>
      </div>
      <div class="flex justify-center space-x-4 <sm:flex-col" m="y-5">
        <div class="flex justify-center items-center" font="bold" text="2xl [#878787]">
          <img m="r-2" :src="imgData.ministryOfEducation" />
          {{ textData.ministryOfEducation }}
        </div>
        <div class="flex justify-center items-center <sm:(flex-col)" m="<sm:t-2" font="bold" text="2xl [#878787]">
          <img m="r-2" :src="imgData.tainanLogo" />
          {{ textData.tainan }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import imgPath from '@/config/imgPath/imgPath';
import { Component, Vue } from 'vue-property-decorator';
@Component({})
export default class TheFooter extends Vue {
  /**文字資料 */
  private textData = {
    contactMethod: '聯絡方式',
    phone: '客服電話：06-2130669 #234、265',
    email: '客服信箱: heroj7@mail.moe.gov.tw',
    ministryOfEducation: '教育部資訊及科技教育司',
    tainan: '臺南市政府教育局',
  };
  /** 圖片資料 */
  private imgData = {
    ministryOfEducation: imgPath.ministryOfEducation,
    tainanLogo: imgPath.tainanLogo,
  };
}
</script>
