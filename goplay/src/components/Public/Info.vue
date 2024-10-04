<template>
  <div class="info">
    <div class="button">
      <p @click="infoOpen">{{ $t('common.QuizInfo') }}</p>
    </div>
    <div v-if="showInfo" name="modal">
      <div class="modal-mask flex-pos">
        <div class="modal-wrapper">
          <div class="modal-container">
            <div class="modal-header">
              <h2>{{ title }}</h2>
              <h3>{{ subtitle }}</h3>
            </div>
            <div class="modal-body">
              <div class="content">
                {{ content }}
              </div>
            </div>
            
            <div class="modal-footer">
              <button
                class="button"
                @click="infoClose"
              >
                {{ $t('common.Close') }}
              </button>            
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
@Component({})
export default class Info extends Vue {
  @Prop(String) public title!: string;
  @Prop(String) public subtitle!: string;
  @Prop(String) public content!: string;

  // 資訊彈窗
  public showInfo: boolean = false;
  // 彈窗開啟
  public infoOpen() {
    this.showInfo = true;
  }
  // 彈窗關閉
  public infoClose() {
    this.showInfo = false;
  }
}
</script>
<style lang="scss" scoped>
.button {
  display: flex;
  justify-content: flex-end;
  cursor: pointer;
  p {
    width: 15%;
    min-width: 8rem;
    padding: 0.2em;
    margin: 0.2rem;
    text-align: center;
    color: #fff;
    background-color: #c24753;
    border: 2px solid rgb(92, 28, 28);
    box-shadow: 3px 5px 5px rgba(0, 0, 0, 0.2);
  }
}

.modal-mask {
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s ease;

  .modal-container {
    width: 90vw;
    max-width: 650px;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;

    .modal-header {
      text-align: center;
      h2 {
        padding: 5px 0;
        color: #006bb2;
      }
      h3 {
        padding: 5px 0;
        color: #006bb2;
      }
    }

    .modal-body {
      display: flex;
      flex-direction: column;
      margin: 20px 0;
      line-height: 3rem;
      .content {
        background-color: #d2c8c8;
        border-radius: 5px;
        box-shadow: 2px 3px 9px gray;
      }
    }

    .modal-footer {
      display: flex;
      justify-content: center;
      .button {
        cursor: pointer;
        padding: 1rem 2rem;
        background-color: #df7341;
        border-radius: 7px;
        border: none;
        &:hover {
          transform: scale(1.02);
        }
      }
    }
  }
}
</style>
