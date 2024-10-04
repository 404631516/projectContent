<template>
  <div class="max-w-7xl w-11/12 mt-[40px]">
    <h3 class="awardTitle">{{ textData['availablePrizeList'] }}</h3>
    <div m="t-3" p="t-3" border="t-1px solid #b2b2b2"></div>
    <div>
      <div v-if="isAwardListEmpty">
        <p>{{ textData.noAwardsAvailable }}</p>
      </div>
      <div v-else class="award-container">
        <div v-for="(awardGroup, index) in teacherWeekAwardList" :key="index" class="award-item-wrapper">
          <div v-if="awardGroup.awardItems.length > 0">
            <div class="awardItemContainer">
              <div class="warningDate">
                {{ textData.itemExpiryDates }}{{ awardGroup.effectiveDate }}~{{ awardGroup.expiryDate }}
              </div>
              <div v-for="(testContent, contentIndex) in awardGroup.awardItems" :key="contentIndex" class="award">
                <div class="flex-col m-1">
                  <div class="awardItem">
                    <div class="awardName">{{ textData.awardName }}</div>
                    <div class="awardCount">{{ getAwardName(testContent) }}* {{ testContent.count }}</div>
                  </div>

                  <div class="flex flex-row mb-3">
                    <div class="selectItem">{{ textData.selectQuantity }}</div>
                    <el-input-number
                      type="number"
                      class="custom-input-number"
                      :max="testContent.count"
                      :min="0"
                      :step="1"
                      :step-strictly="true"
                      size="mini"
                      v-model.number="managedAwardList[index].items[contentIndex].count"
                    />
                  </div>

                  <div class="flex flex-row">
                    <div class="w-[100px]">{{ textData.total }}</div>
                    <div class="totalCount w-[130px] mb-[10px]">
                      {{ managedAwardList[index].items[contentIndex].count * chosenStudentList.length }}
                    </div>
                  </div>
                  <span
                    v-if="
                      managedAwardList[index].items[contentIndex].count * chosenStudentList.length > testContent.count
                    "
                    class="warning"
                  >
                    {{ textData.quantityCannotExceedRemaining }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { TeacherWeekDeliveryAwardAPI } from '@/api/TeacherAward';
import { Award } from '@/hero-api/dto/award.dto';
import { TeacherDeliveryAward, AwardInventory } from '@/hero-api/dto/teacher-award-inventory.dto';
import RewardManager from '@/manager/RewardManager';
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';

@Component({})
export default class AwardList extends Vue {
  // 接收欲發放獎品學生列表
  @Prop() private chosenStudentList!: string[];

  /** 教師派獎系統的每周獎品清單 */
  private teacherWeekAwardList: AwardInventory[] = [];
  /** 選擇獎品清單 */
  private managedAwardList: TeacherDeliveryAward[] = [];
  /** 是否有獎勵 */
  private isAwardListEmpty: Boolean = true;

  /** 文字資料 */
  private readonly textData = {
    availablePrizeList: '目前可發放獎品清單',
    noAwardsAvailable: '目前無可發放獎品',
    itemExpiryDates: '以下物品使用期限：',
    awardName: '名稱',
    selectQuantity: '選擇數量：',
    total: '發放總數： ',
    quantityCannotExceedRemaining: '數量不能超過剩餘數量！',
  };

  mounted() {
    this.getTeacherAwardInventoryData();
  }

  /** 取得教師獎品庫存資料 */
  private async getTeacherAwardInventoryData(): Promise<void> {
    // API 取得後端數據
    const responses = await TeacherWeekDeliveryAwardAPI.getTeacherAwardInventory();
    // 設定結果
    this.teacherWeekAwardList = responses.awardInventoryList;
    // 判斷是否有獎品
    this.isAwardListEmpty = this.checkIfAwardListIsEmpty();
    // 轉換資料格式
    this.convertToManagedAwardFormat(responses.awardInventoryList);
  }

  /** 檢查獎品清單是否為空 */
  private checkIfAwardListIsEmpty(): boolean {
    return (
      this.teacherWeekAwardList.length === 0 || this.teacherWeekAwardList.every((list) => list.awardItems.length === 0)
    );
  }
  /**
   * 轉換後端獎品數據為管理界面所需格式。
   * @param teacherWeekAwardList 從後端獲得的周獎品數據列表。
   */
  private convertToManagedAwardFormat(teacherWeekAwardList: AwardInventory[]): void {
    this.managedAwardList = teacherWeekAwardList.map((weekAward) => ({
      index: weekAward.index,
      items: weekAward.awardItems.map((item) => ({
        itemType: item.itemType,
        itemId: item.itemId,
        count: 0, // 初始化數量為0，準備後續操作
      })),
      sourceType: weekAward.sourceType,
    }));
  }

  /**
   * 過濾並格式化獎品數據，移除數量為零的獎品並確保數量為整數。
   * @param awards 要處理的獎品數據列表
   * @returns 處理後的獎品數據列表，只包含數量非零的獎品
   */
  private filterAndFormatAwardList(awards: TeacherDeliveryAward[]): TeacherDeliveryAward[] {
    // 過濾並格式化獎品數據
    return awards
      .map((award) => ({
        ...award,
        items: award.items.filter((item) => item.count > 0), // 直接過濾出數量非零的獎品，省略了多餘的映射步驟
      }))
      .filter((award) => award.items.length > 0); // 只保留有獎品的週次
  }

  /** 取得獎勵名稱
   *  @param award 獎勵物品
   */
  private getAwardName(award: Award): string {
    return RewardManager.getTeacherAwardItemName(award);
  }

  /** 組件更新後，將處理過的獎勵列表傳遞給父組件。 */
  updated() {
    // 將處理後的獎品列表傳遞給父組件
    this.updateAwardList(this.filterAndFormatAwardList(this.managedAwardList));
  }

  /**
   * 更新獎品數量。
   * @param updateAwardList 更新後的獎品數據列表
   */
  @Emit('updateAwardList')
  private updateAwardList(updateAwardList: TeacherDeliveryAward[]): void {
    return;
  }
}
</script>

<style scoped>
.awardTitle {
  display: flex;
  justify-content: flex-start;
  color: #fdb42d;
  font-size: 24px;
  font-weight: bold;
}
.award-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.award-item-wrapper {
  width: calc(33.333% - 40px); /* 每行三個，減去左右間距 */
  margin: 20px; /* 每個項目之間的間距 */
}
.awardItemContainer {
  box-shadow: 0 0 3px gray;
  border-radius: 10px 10px 0px 0px;
  height: 600px; /* 固定高度 */
  overflow-y: auto; /* 垂直滾動 */
}
.awardItem {
  display: flex;
  width: 90%;
  border: 1px solid #000;
  border-radius: 5px;
  margin-bottom: 15px;
  margin-top: 15px;
}
.awardName {
  line-height: 30px;
  text-align: center;
  background: #828282;
  color: #fff;
  padding: 10px;
}
.awardCount {
  margin-left: 10px;
  line-height: 50px;
  text-align: center;
}
.totalCount {
  border: 1px solid #000;
  border-radius: 5px;
}
.selectItem {
  width: 100px;
  margin-top: 10px;
}
.warningDate {
  border-radius: 10px 10px 0px 0px;
  box-shadow: 0 0 3px gray;
  padding: 10px;
  color: #fff;
  background: #4599fc;
}
.send {
  background: gray;
}
.warning {
  color: red;
}
input[type='number'] {
  width: 50px; /* 設置寬度 */
  text-align: center; /* 文字置中 */
}
.custom-input-number ::v-deep .el-input-number__increase {
  background: #fdb42d;
  color: #fff;
  border-radius: 0px 5px 5px 0px;
}
.custom-input-number ::v-deep .el-input-number__decrease {
  background: #fdb42d;
  color: #fff;
  border-radius: 5px 0px 0px 5px;
}
.custom-input-number ::v-deep .el-input__inner {
  color: black;
  border: 1px solid #fdb42d;
}
</style>
