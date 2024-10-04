<template>
  <div class="gift-dialog-model">
    <div class="gift-dialog flex-pos">
      <div class="gift-item">
        <div class="user-state" :style="{ background: giftColor }">
          <img :src="giftImg" />
          <p :style="{ color: textColor }">{{ gift }}</p>
          <span>{{ userAwardNum }}</span>
        </div>
        <div class="gift-content">
          <div class="content-text">
            <p>{{ problem }}</p>
            <span>獲得</span>
          </div>
          <div class="gift">
            <p>{{ gift }} +</p>
            <div>
              <img :src="giftImg" />
              <span :style="{ color: textColor }">{{ awardNum }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import ImgPath from '@/config/imgPath/imgPath';
import { GiftContent } from '@/helper/interface/InterstellarForum';
import { AwardType } from '@/helper/enum/InterstellarForum'; // 獎勵類型
@Component({
  components: {},
})
export default class GiftDialog extends Vue {
  private giftImgPath: { gold: string; crystal: string } = {
    gold: ImgPath.goldBaseUrl,
    crystal: ImgPath.crystalBaseUrl,
  };
  private giftContent: { gold: GiftContent; crystal: GiftContent } = {
    gold: {
      text: '金幣',
      giftText: '問題解決',
      textColor: '#FFDE39',
      color: '#E4C73A80',
    },
    crystal: {
      text: '晶球',
      giftText: '回答正確',
      textColor: '#2CEAEC',
      color: '#44E5EB80',
    },
  };
  private giftColor!: string;
  private giftImg!: string;
  private textColor!: string;
  private problem!: string;
  private gift!: string;

  @Prop() private state!: string;
  @Prop() private awardNum!: number;
  @Prop() private userAwardNum!: number; // 使用者目前獎勵數
  private created() {
    if (this.state === AwardType.gold) {
      this.giftColor = this.giftContent.gold.color;
      this.giftImg = this.giftImgPath.gold;
      this.textColor = this.giftContent.gold.textColor;
      this.problem = this.giftContent.gold.giftText;
      this.gift = this.giftContent.gold.text;
    } else if (this.state === AwardType.crystal) {
      this.giftColor = this.giftContent.crystal.color;
      this.giftImg = this.giftImgPath.crystal;
      this.textColor = this.giftContent.crystal.textColor;
      this.problem = this.giftContent.crystal.giftText;
      this.gift = this.giftContent.crystal.text;
    }
  }
}
</script>
<style lang="scss" scoped>
.gift-dialog-model {
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  z-index: 3000;
  left: 0;
  .gift-dialog {
    position: absolute;
    top: 50%;
    background: #00000080;
    width: 100%;
    height: 175px;
    z-index: 3001;
    .gift-item {
      width: 280px;
      height: 155px;
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      flex-direction: column;
      .user-state {
        width: 200px;
        height: 50px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        img {
          width: 38px;
          height: 38px;
          object-fit: contain;
        }
        p {
          color: #ffdd00;
        }
        span {
          font-size: 24px;
          color: #fff;
        }
      }
      .gift-content {
        display: flex;
        align-items: center;
        width: 90%;
        justify-content: space-evenly;
        .content-text {
          p {
            color: #ffde39;
          }
          span {
            font-size: 40px;
            color: #fff;
          }
        }
        .gift {
          display: flex;
          align-items: center;
          p {
            color: #fff;
          }
          div {
            display: flex;
            align-items: center;
            span {
              font-size: 48px;
            }
          }
        }
      }
    }
  }
}
</style>
