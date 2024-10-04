<template>
  <div class="canned-message flex-pos">
    <div class="canned-item" :style="{ backgroundImage: `url(${dotImgPath})` }">
      <div class="title flex-pos">選擇對話</div>
      <div class="content">
        <div class="content-info">
          <img :src="heroImg" />
          <p>做得很好，接下來選擇對話進行回應吧！</p>
        </div>
        <div class="content-select">
          <div class="select-item">
            <el-select :popper-append-to-body="false" v-model="message" placeholder="請選擇你的對話">
              <el-option
                v-for="(item, messageIndex) in messageOptions"
                :key="messageIndex"
                :value="item"
                :label="`${item}`"
              >
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
      <div class="footer flex-pos">
        <button @click="postComment">確定</button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import ImgPath from '@/config/imgPath/imgPath';

@Component({
  components: {},
})
export default class CannedMessage extends Vue {
  private heroImg = ImgPath.fourHeroBaseUrl;
  private dotImgPath: string = ImgPath.dialogDotBaseUrl;
  private message: string = '不用懷疑，這是正確答案!';
  private messageOptions: string[] = [
    '不用懷疑，這是正確答案!',
    '答案很明顯，也可以回因材網看一下影片喔～',
    '我很強吧？',
    '這題我以前也錯過，多做幾次就會了！',
    '的確這題很容易搞錯！',
    '這是陷阱題，可以多想3秒鐘。',
    '真相只有一個！這就是最佳解答！',
    '看仔細！有些選項是唬人的！',
    '正確答案就在這裡！選我正解！',
    '想不到這題這麼有深度！',
  ];
  @Emit('postComment')
  private postComment() {
    return this.message;
  }
}
</script>
<style lang="scss" scoped>
.canned-message {
  z-index: 3000;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  color: #a5a5a5;
  background: #00000080;
  .canned-item {
    width: 540px;
    height: 450px;
    background: #ffffff;
    border-radius: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-repeat: no-repeat;
    background-position: bottom;
    .title {
      color: #666666;
      font-size: 36px;
      width: 90%;
      height: 75px;
      border-bottom: 2px solid #c1c1c1;
    }
    .content {
      width: 90%;
      height: 250px;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      .content-info {
        height: 110px;
        width: 100%;
        border: 1px solid #d1ceb8;
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        margin-top: 15px;
        img {
          display: block;
          width: 90px;
          height: 95px;
          object-fit: contain;
        }
      }
    }
    .footer {
      height: 100px;
      button {
        background: linear-gradient(to bottom, #ffd943, #ff9d5b);
        color: #fff;
        border-radius: 20px;
        width: 200px;
        height: 40px;
        font-size: 24px;
        cursor: pointer;
      }
    }
  }
}
</style>
