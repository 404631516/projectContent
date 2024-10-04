<template>
  <div>
    <CourseSelect :subjectId="defaultSubject" @onSelectCourse="getAdlEduApi" :buttonType="buttonType" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Message, Load } from '@/helper/class/Common'; // 訊息框
import { CourseDetail } from '@/helper/interface/CourseMenu';
import { adlEduAPI } from '@/api/login';
import { ResponseState, SubjectType } from '@/helper/enum/Common';
import { MenuName } from '@/helper/enum/MenuName';
import { handleAPIError } from '../../helper/fnc/common';
import CourseSelect from './CourseSelect.vue';
import { ButtonType } from '@/components/CourseMenu/CourseBtnList.vue';

@Component({
  components: {
    CourseSelect,
  },
})
export default class Index extends Vue {
  /** 初始科目 */
  private defaultSubject: string | SubjectType = SubjectType.Chinese;

  /** 答題遊戲類型 */
  private buttonType: ButtonType = ButtonType.Arrow;

  /** 取得科目清單 */
  private get subjectLists(): Array<string | SubjectType> {
    const subjectTypeList = Object.values(SubjectType);
    return subjectTypeList.slice(subjectTypeList.length / 2);
  }

  created() {
    // 判斷是否登入狀態(否導回首頁)
    if (this.$$store.getters.isLogin === false) {
      this.$router.push('/');
    }
    // 沒指定科目id時，隨機抽選科目
    if (this.$route.params.id == null) {
      this.defaultSubject = this.subjectLists[Math.floor(Math.random() * this.subjectLists.length)];
    }
    // 有指定科目id時，跳到指定科目
    else {
      // 用科目ID取得科目索引
      this.defaultSubject = +this.$route.params.id;
    }
  }

  /** 前往遊戲頁
   * @param newSelectedCourse
   */
  private async getAdlEduApi(newSelectedCourse: CourseDetail): Promise<void> {
    // 組成封包
    const data = {
      game_link_id: newSelectedCourse.course.game_link_id,
    };
    try {
      // API 取得因材網課程單元遊戲點對應的賽事編號
      const response: any = await adlEduAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }

      // 轉跳賽事
      this.$router.replace({
        name: `${MenuName.ContestInfoDetail}`,
        params: { id: `${response.contestId}` },
      });

      Load.use(false);
    } catch (e) {
      Load.use(false);
      Message.error(`${e}`);
    }
  }
}
</script>
<style lang="scss" scoped>
.course-menu {
  .content-area {
    width: 100%;
    font-size: 30px;
    display: flex;
    justify-content: center;
    background-color: #f9f8f4;
    .tab-content {
      min-height: 100vh;
      border-radius: 5px;
      color: #666666;
      @media (max-width: 435px) {
        width: 80%;
      }
      .self-start {
        align-self: start;
      }
      .course-list {
        margin-bottom: 100px;
        .icon {
          margin-right: 5px;
          width: 20px;
          height: 30px;
          object-fit: contain;
        }
        .semester {
          width: 996px;
          @media (max-width: 435px) {
            width: 100%;
          }
          margin: 20px auto 10px auto;
          h2 {
            font-size: 22px;
          }
        }
      }
    }
  }
}
</style>
