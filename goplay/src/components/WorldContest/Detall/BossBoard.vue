<template>
  <div class="rounded-[30px] grid grid-cols-2 gap-y-5" bg="[#F9F8F4]" p="y-3 x-8">
    <!-- 總累積打點 -->
    <div class="col-span-2" text="4xl [#666666]" p="y-3" border="b-1 solid [#B2B2B2]">
      {{ textData.cumulatedDamageTitle }}
      <span text="7xl [#00CCCE]">{{ bossData.cumulateDamage }}</span>
    </div>
    <!-- 擊退魔王數 -->
    <div class="col-span-1">
      <div text="3xl [#D69F05]">{{ textData.defeatedTitle }}</div>
      <div text="9xl [#FDC221]">
        {{ deathBossCount }}<span text="3xl [#878787]">{{ textData.bossCountTitle }}</span>
      </div>
    </div>
    <!-- 魔王資訊 -->
    <div class="col-span-1 grid grid-cols-5 gap-x-3">
      <div class="col-span-5" text="3xl [#D69F05] ">{{ textData.currentBossTitle }}</div>
      <div class="w-35 h-35 col-span-2 justify-self-end rounded-full <sm:hidden" bg="[#d8d8d8]">
        <img class="w-full h-full object-contain" :src="bossImg" />
      </div>
      <div class="grid grid-cols-5 col-span-3 <sm:col-span-5 items-center" text="[#878787] left">
        <span class="col-span-5 self-end" text="3xl <sm:2xl">{{ bossName }}</span>
        <span class="col-span-5" text="2xl">
          {{ textData.bossHPTitle }} <span text="[#FF6A6A]">{{ bossHp }}</span> / {{ bossTotalHp }}
        </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { BossData } from '../../../helper/interface/Boss';
import TableManager, { BossItemData } from '../../../manager/TableManager';
import ImgPath from '@/config/imgPath/imgPath';

@Component({})
export default class BossBoard extends Vue {
  /** 魔王資訊 */
  @Prop() private bossData!: BossData;

  /** 死亡魔王數量 */
  private deathBossCount: number = 0;

  /** 魔王靜態資料 (給外部取用) */
  public bossTableData!: BossItemData;
  /** 當前魔王圖像 */
  private bossImg: string = '';
  /** 當前魔王名稱 */
  private bossName: string = '';
  /** 魔王當前血量 */
  private bossHp: number = 0;
  /** 魔王總血量 */
  private bossTotalHp: number = 0;

  /** 文字資料 */
  private textData = {
    cumulatedDamageTitle: '總累積打點',
    defeatedTitle: '已擊退',
    bossCountTitle: '隻',
    currentBossTitle: '目前魔王',
    bossHPTitle: '血量',
  };

  created() {
    // 取得魔王清單
    const bossDetail = JSON.parse(this.bossData.bossDetail.toString());
    if (bossDetail.length === 0) {
      console.error(`bossDetail length = 0`);
      return;
    }

    // 找出現在打到哪一隻魔王
    const cumulateDamage = this.bossData.cumulateDamage;
    let cumulateBossHp = 0;
    for (let i = 0; i < bossDetail.length; i++) {
      cumulateBossHp += bossDetail[i].hp;
      if (cumulateDamage >= cumulateBossHp) {
        this.deathBossCount = i + 1;
      }
    }

    // 取得當前魔王資料,總隻數=BOSS數取最後一隻
    const bossIndex = Math.min(this.deathBossCount, bossDetail.length - 1);
    const currentBossData = bossDetail[bossIndex];

    // 取得魔王靜態資料
    const bossTableData = TableManager.boss.findOne(currentBossData.bossId);
    if (bossTableData == null) {
      console.error(`BossBoardError: invalid bossId ${currentBossData.bossId}`);
      return;
    }

    // 設定魔王資訊
    this.bossTableData = bossTableData;
    this.bossImg = `${ImgPath.bossBaseUrl}${bossTableData.imgUrl}.png`;
    this.bossName = bossTableData.bossName;
    this.bossHp = Math.max(cumulateBossHp - cumulateDamage, 0);
    this.bossTotalHp = currentBossData.hp;
  }
}
</script>
