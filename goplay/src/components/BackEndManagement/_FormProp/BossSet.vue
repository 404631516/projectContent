<template>
  <div>
    <div
      class="pt-[20px] mb-[20px] rounded-[5px]"
      border="1px solid [#707070]"
      v-for="(bossItem, bossIndex) in bossList"
      :key="bossIndex"
    >
      <!-- 魔王清單 -->
      <el-form-item>
        <!-- 魔王標題 -->
        <div>{{ textData.bossTitle }}{{ bossIndex + 1 }}</div>
        <!-- 魔王ID -->
        <el-col :span="10">
          <SelectList
            :selectItemList="bossOptions"
            :selectedItem="bossItem.bossId"
            :placeholder="textData.bossPlaceholder"
            :isLock="false"
            @onSelect="bossItem.bossId = $event"
          />
        </el-col>
        <!-- 魔王血量 -->
        <el-col :span="10">
          <div class="ml-[40px] mr-[20px]">
            <el-input v-model.number="bossItem.hp" type="Number" :min="0" :placeholder="textData.bossHpPlaceholder" />
          </div>
        </el-col>
        <!-- 移除按鈕 -->
        <el-button type="danger" @click="onRemoveBoss(bossIndex)">
          {{ textData.removeTitle }}
        </el-button>
      </el-form-item>
    </div>
    <!-- 操作按鈕 -->
    <SettingButton
      :isShowSaveButton="true"
      :addTitle="textData.addBossTitle"
      @onAdd="onAddBoss"
      @onSave="onSaveBossSetting(bossList)"
      @onReset="bossList = []"
    />
    <!-- 提示訊息 -->
    <p text="20px" class="pt-[20px]" v-show="bossList.length > 0">
      {{ textData.currentBossTitle }}
      <span text="[#d69f05]">{{ bossList.length }}</span>
      {{ textData.bossCountTitle }}
      <span class="ml-[20px]" text="16px [#d69f05]">{{ textData.saveHint }}</span>
    </p>
    <span class="font-bold text-[#F56C6C]" v-if="isUnsaved">{{ textData.unsaved }}</span>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import SelectList from '@/components/BackEndManagement/_FormProp/SelectList.vue';
import { BossDetail } from '@/helper/interface/Boss';
import SettingButton from '@/components/BackEndManagement/_FormProp/SettingButton.vue';
import { SelectOption } from '@/helper/interface/BackEndManagement';

@Component({
  components: {
    SelectList,
    SettingButton,
  },
})
export default class BossSet extends Vue {
  /** 魔王波次清單 */
  @Prop(Array) private bossDetail!: BossDetail[];

  /** 魔王選項 */
  @Prop(Array) private bossOptions!: SelectOption[];

  /** 編輯中魔王清單 */
  private bossList: BossDetail[] = [];

  /** 文字資料 */
  private textData = {
    bossTitle: '魔王',
    bossPlaceholder: '請選擇魔王',
    bossHpPlaceholder: '請設定魔王血量',
    removeTitle: '移除',
    addBossTitle: '+添加魔王',
    saveHint: '(記得[儲存]否則設定無效)',
    currentBossTitle: '目前已設置',
    bossCountTitle: '隻魔王',
    unsaved: '尚未儲存',
  };

  /** 未儲存 */
  private isUnsaved: boolean = false;

  mounted() {
    this.bossDetail.forEach((boss) => {
      this.bossList.push(Object.assign({}, boss));
    });
  }

  /** 添加魔王 */
  private onAddBoss(): void {
    this.bossList.push({
      bossId: -1,
      hp: 0,
    });
  }

  /** 移除魔王
   * @param bossIndex
   */
  private onRemoveBoss(bossIndex: number): void {
    this.bossList.splice(bossIndex, 1);
  }

  /** 檢查是否未儲存
   * @param bossDetail
   */
  public checkNeedSave(bossDetail: BossDetail[]): boolean {
    // 設定是否未儲存
    this.isUnsaved = JSON.stringify(this.bossList) !== JSON.stringify(bossDetail);
    return this.isUnsaved;
  }

  /** 儲存 */
  @Emit('onSave')
  private onSaveBossSetting(bossList: BossDetail[]): void {
    this.isUnsaved = false;
    return;
  }
}
</script>
<style lang="scss" scoped></style>
