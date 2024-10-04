<template>
  <div class="w-1/2 flex justify-start <lg:w-full <xl:w-955px <sm:(flex-col items-center)">
    <p font="bold" text="2xl [#666666]" m="x-2">{{ textData.gradeTitle }}</p>
    <!-- 選項清單 -->
    <div class="grid label-group gap-y-5 <sm:gap-y-2" grid="cols-7 <sm:cols-4">
      <label
        v-for="(gradeType, index) in gradeFilterList"
        :key="index"
        class="flex items-center"
        text="2xl [#666666]"
        m="r-2"
      >
        <input
          :class="{ 'bg-[#ebca28]': selectGradeType === gradeType }"
          class="appearance-none rounded w-5 h-5"
          m="r-2"
          border="1 solid [#A5A5A5]"
          type="radio"
          name="grade"
          :value="gradeType"
          @change="onSelectGradeType(gradeType)"
        />
        {{ getGradeName(gradeType) }}
      </label>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator';
import { GradeType, GradeTypeName } from '@/helper/enum/Common';

@Component({})
export default class GradeFilter extends Vue {
  /** 選中年級類別 */
  @Prop() private selectGradeType!: GradeType;

  /** 給Vue用於判別遊戲類型 */
  private gradeTypeName: typeof GradeType = GradeType;

  /** 年級選項 */
  private readonly gradeFilterList: GradeType[] = [
    GradeType.g0,
    GradeType.g1,
    GradeType.g2,
    GradeType.g3,
    GradeType.g4,
    GradeType.g5,
    GradeType.g6,
    GradeType.g7,
    GradeType.g8,
    GradeType.g9,
    GradeType.g10,
    GradeType.g11,
    GradeType.g12,
  ];

  /** 文字資料 */
  private textData = {
    gradeTitle: '年級',
    allGrade: '全部',
  };

  /** 取得年級類別名稱
   * @param
   */
  private getGradeName(gradeType: GradeType): string {
    const nameKey = GradeType[gradeType];
    return Object.entries(GradeTypeName).find(([key, val]) => key === nameKey)?.[1] ?? '錯誤類別';
  }

  @Emit('onSelectGradeType')
  private onSelectGradeType(gradeType: GradeType): void {
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
