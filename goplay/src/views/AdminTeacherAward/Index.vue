<template>
  <div bg="[#FFF]">
    <!-- banner -->
    <GeneralBanner :bannerImg="bannerImg" :title="textData.adminTeacherAward" />
    <!-- 教師派獎管理 -->
    <el-tabs value="weekAward">
      <!-- 每周發給教師的物品 -->
      <el-tab-pane :label="textData.weeklyTeacherItems" name="weekAward">
        <!-- 目前每周發給教師的物品 -->
        <div class="AwardList bg-gray-100">
          <span>{{ textData.weeklyTeacherItems }}</span>
          <span class="mb-1">{{ textData.weeklyDistribution }}</span>
          <AwardList :awardList="weekAwardList" />
        </div>
        <!-- 更改固定派獎設定 -->
        <div class="AwardList bg-yellow-50">
          <span class="mb-1">{{ textData.changeFixedAwardSettings }}</span>
          <AwardList :awardList="editingWeekAwardList" />
        </div>
        <!-- 設定獎勵 -->
        <el-button type="info" @click="isWeekAwardSetVisible = true" style="margin-bottom: 60px">
          {{ textData.settingAward }}
        </el-button>
        <!-- 確定更改 -->
        <el-button type="primary" @click="updateWeekAwardList" style="margin-bottom: 60px">
          {{ textData.confirmChange }}
        </el-button>
        <!-- 設定獎勵介面 -->
        <AwardSet
          v-if="isWeekAwardSetVisible"
          :awardList="editingWeekAwardList"
          :planetCrystalMax="planetCrystalMax"
          @onSave="onSaveAwardList"
          @onCancel="isWeekAwardSetVisible = false"
        />
      </el-tab-pane>
      <!-- 教師每完成一場班級賽事給予的額外獎勵 -->
      <el-tab-pane :label="textData.contestAward" name="contestAward">
        <!-- 目前教師每完成一場班級賽事給予的額外獎勵 -->
        <div class="AwardList bg-gray-100">
          <span>{{ textData.contestAward }}</span>
          <AwardList :awardList="contestAwardList" />
        </div>
        <!-- 更改固定派獎設定 -->
        <div class="AwardList bg-yellow-50">
          <span class="mb-1">{{ textData.changeFixedAwardSettings }}</span>
          <AwardList :awardList="editingContestAwardList" />
        </div>
        <!-- 設定獎勵 -->
        <el-button type="info" @click="isContestAwardSetVisible = true" style="margin-bottom: 60px">
          {{ textData.settingAward }}
        </el-button>
        <!-- 確定更改 -->
        <el-button type="primary" @click="updateConteseAwardList" style="margin-bottom: 60px">
          {{ textData.confirmChange }}
        </el-button>
        <!-- 設定獎勵介面 -->
        <AwardSet
          v-if="isContestAwardSetVisible"
          :awardList="editingContestAwardList"
          :planetCrystalMax="planetCrystalMax"
          @onSave="onSaveContestAwardList"
          @onCancel="isWeekAwardSetVisible = false"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GeneralBanner from '@/components/Public/GeneralBanner.vue';
import AwardList from './AwardList.vue';
import { AdminWeekDeliveryAwardAPI } from '@/api/TeacherAwardAdmin';
import RewardManager from '@/manager/RewardManager';
import { Message } from '@/helper/class/Common';
import { Award } from '@/hero-api/dto/award.dto';
import imgPath from '@/config/imgPath/imgPath';
import { AwardTypeEnum } from '@/hero-api/dto/admin-award-settings.dto';
import AwardSet from './AwardSet.vue';

@Component({
  components: {
    GeneralBanner,
    AwardList,
    AwardSet,
  },
})
export default class AdminTeacherAward extends Vue {
  /** 宣告給Vue的變數 */
  private readonly RewardManager = RewardManager;
  private bannerImg: string = imgPath.orangeBannerBaseUrl;

  // 星球水晶最大值
  private readonly planetCrystalMax: number = 5;

  // 每周發給教師的物品
  private weekAwardList: Award[] = [];
  private editingWeekAwardList: Award[] = [];
  private isWeekAwardSetVisible: boolean = false;

  // 教師每完成一場班級賽事給予的額外獎勵
  private contestAwardList: Award[] = [];
  private editingContestAwardList: Award[] = [];
  private isContestAwardSetVisible: boolean = false;

  // 文字資料
  private textData = {
    adminTeacherAward: '教師派獎管理',
    weeklyTeacherItems: '目前每周發給教師的物品',
    weeklyDistribution: '每周日凌晨12點發放至所有教師帳號',
    contestAward: '目前教師每完成一場班級賽事給予的額外獎勵',
    changeFixedAwardSettings: '更改固定派獎設定',
    confirmChange: '確定更改',
    settingAward: '設定獎勵',
  };

  async created() {
    await this.fetchWeekAwardList();
    await this.fetchContestAwardList();
  }

  // 每周發給教師的物品
  private async fetchWeekAwardList(): Promise<void> {
    const response = await AdminWeekDeliveryAwardAPI.getWeekDeliveryAward({
      awardType: AwardTypeEnum.Week,
    });
    this.weekAwardList = response.awardItems;
    this.editingWeekAwardList = response.awardItems.map((item) => ({ ...item }));
  }

  // 教師每完成一場班級賽事給予的額外獎勵
  private async fetchContestAwardList(): Promise<void> {
    const response = await AdminWeekDeliveryAwardAPI.getWeekDeliveryAward({
      awardType: AwardTypeEnum.RoomContest,
    });
    this.contestAwardList = response.awardItems;
    this.editingContestAwardList = response.awardItems.map((item) => ({ ...item }));
  }

  // 更新每周發給教師的物品
  private async updateWeekAwardList(): Promise<void> {
    this.weekAwardList = this.editingWeekAwardList;
    await AdminWeekDeliveryAwardAPI.postWeekDeliveryAward({
      awardType: AwardTypeEnum.Week,
      items: this.weekAwardList,
    });
    Message.info('更新成功');
  }

  // 更新教師每完成一場班級賽事給予的額外獎勵
  private async updateConteseAwardList(): Promise<void> {
    this.contestAwardList = this.editingContestAwardList;
    await AdminWeekDeliveryAwardAPI.postWeekDeliveryAward({
      awardType: AwardTypeEnum.RoomContest,
      items: this.contestAwardList,
    });
    Message.info('更新成功');
  }

  // 保存每周發給教師的物品
  private onSaveAwardList(newAwardList: Award[]): void {
    this.editingWeekAwardList = newAwardList;
    this.isWeekAwardSetVisible = false;
  }

  // 保存教師每完成一場班級賽事給予的額外獎勵
  private onSaveContestAwardList(newAwardList: Award[]): void {
    this.editingContestAwardList = newAwardList;
    this.isContestAwardSetVisible = false;
  }
}
</script>

<style scoped>
.AwardList {
  display: flex;
  flex-direction: column;
  border: 1px solid #000;
  margin: 10px auto;
  padding: 10px;
  font-size: 20px;
  width: 600px;
}
</style>
