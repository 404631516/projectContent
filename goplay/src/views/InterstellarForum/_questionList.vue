<template>
  <div class="interstellar-forum">
    <GiftDialog
      v-if="giftDialog"
      state="gold"
      :awardNum="awardNum"
      :userAwardNum="userAwardNum"
    />
    <div class="bg-frame">
      <!-- 標題列 -->
      <div class="w-6/10 <lg:w-[98%] flex items-center" m="x-auto" p="y-5">
        <router-link
          to="/InterstellarForum"
          class="shadow-default h-[58px] flex-pos rounded-[15px]"
          p="y-4 x-6"
          m="r-2"
          text="26px [#FFF]"
          bg="[#FF5875]"
          border="2px solid [#FFF]"
          >{{ textData.returnTitle }}</router-link
        >
        <h1 font="bold" text="6xl <sm:5xl [#FDC221]">
          {{ textData.myQuestionTitle }}
        </h1>
      </div>
      <!-- 選擇列 -->
      <FilterBar @handleGrade="handleGrade" @handleSubject="handleSubject" />
      <!-- 麵包屑 -->
      <div class="forum-filter__breadcrumb flex-pos" bg="[#E3DDC2]">
        <el-breadcrumb
          class="w-6/10 <lg:w-[98%]"
          m="x-auto"
          p="y-2"
          text="18px [#D69F05]"
          separator-class="el-icon-arrow-right"
        >
          <el-breadcrumb-item>{{
            textData.myQuestionTitle
          }}</el-breadcrumb-item>
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumbData"
            :key="index"
            >{{ item }}</el-breadcrumb-item
          >
        </el-breadcrumb>
      </div>
      <!-- 問題列表 -->
      <QuestionsList
        :tableData="tableData"
        @goQuestion="goQuestion"
        myQuestion="true"
        @takeGold="getAdlForumGetPostReward"
      />
      <!-- 頁數切換 -->
      <div class="pagination">
        <el-pagination
          @current-change="handleCurrentChange"
          layout="prev, pager, next"
          :page-size="10"
          :total="totalPost"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import FilterBar from '@/components/InterstellarForum/FilterBar/FilterBar.vue';
import QuestionsList from '@/components/InterstellarForum/QuestionsList.vue';
import {
  adlForumUserPostList,
  adlForumGetPostReward,
} from '@/api/InterstellarForum'; // 取的星際論壇資料
import { Message } from '@/helper/class/Common'; // 訊息框
import { ResponseState } from '@/helper/enum/Common';
import { MenuWord } from '@/helper/enum/MenuName';
import { MyForumTable } from '@/helper/interface/InterstellarForum';
import TableManager from '@/manager/TableManager';
import { SubjectData } from '@/manager/TableManager';
import GiftDialog from '@/components/InterstellarForum/GiftDialog.vue';

@Component({
  components: {
    FilterBar,
    QuestionsList,
    GiftDialog,
  },
})
export default class Index extends Vue {
  /** 論壇的全部資料 */
  private tableData: MyForumTable[] = [];
  /** 共有幾則貼文 */
  private totalPost: number = 0;
  /** 獎品 */
  private giftDialog: boolean = false;
  /** 年級 */
  private grade: number = -1;
  /** 科目 */
  private subject: number = -1;
  private awardNum!: number;
  private userAwardNum!: number;

  /** 文字資料 */
  private textData = {
    returnTitle: '返回',
    myQuestionTitle: '我的提問',
  };

  private created() {
    this.handleCurrentChange(1, -1, -1);
  }

  /**
   * 麵包屑資料處理
   */
  private get breadcrumbData() {
    if (this.grade !== -1 && this.subject !== -1) {
      return [
        this.serchSubjectName(this.subject),
        `${this.numTransformChinese(this.grade)}年級`,
      ];
    } else if (this.grade !== -1 || this.subject !== -1) {
      if (this.grade !== -1) {
        return [`${this.numTransformChinese(this.grade)}年級`];
      } else {
        return [this.serchSubjectName(this.subject)];
      }
    }
    return [];
  }

  /**
   * 選擇年級
   */
  private handleGrade(grade: string) {
    this.grade = this.ChineseNumTransformNum(grade);
    this.handleCurrentChange(1, this.subject, this.grade);
  }

  /**
   * 選擇科目
   */
  private handleSubject(subject: string) {
    this.subject = this.serchSubjectID(subject);
    this.handleCurrentChange(1, this.subject, this.grade);
  }

  private async getAdlForumGetPostReward(id: number) {
    try {
      const response: any = await adlForumGetPostReward.fetch({
        postId: id,
      });
      if (response.result === ResponseState.Success) {
        this.awardNum = response.awardInfo.awardGold;
        this.userAwardNum = response.awardInfo.currCoin;
        this.giftDialog = true;
        setTimeout(() => {
          this.giftDialog = false;
        }, 5000);
        this.tableData.forEach((item) => {
          if (item.serialNumber === id) {
            item.questionState = '有解答';
          }
        });
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  }
  /**
   * 選擇第幾頁
   * @param {number} - 選擇第幾頁 index
   */
  private handleCurrentChange(
    index: number,
    subjectId: number,
    gradeNum: number
  ) {
    this.getSchoolPostList(--index, subjectId, gradeNum);
  }
  /**
   * 取同學校的問題列表
   * @param {number} - 選擇第幾頁 page
   */
  private async getSchoolPostList(
    nowPage: number,
    subjectId: number,
    gradeNum: number
  ) {
    try {
      const response: any = await adlForumUserPostList.fetch({
        subjectNum: subjectId,
        gradeNum,
        page: nowPage,
        pageSize: 10,
        sortType: 1,
      });
      if (response.result === ResponseState.Success) {
        const data = response.results;
        this.tableData = data.map((item: any) => {
          return this.postListFormat(item);
        });
        this.totalPost = response.total;
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  }
  /**
   * 把阿拉伯數字轉換成中文數字(到十三)
   * @param {number} - 要轉換的數字
   */
  private numTransformChinese(num: number) {
    const chineseNum = [
      '一',
      '二',
      '三',
      '四',
      '五',
      '六',
      '七',
      '八',
      '九',
      '十',
      '十一',
      '十二',
      '十三',
    ];
    return chineseNum[--num];
  }
  /**
   * 把中文數字轉換成阿拉伯數字(到十三)
   * @param {string} - 要轉換的中文數字
   */
  private ChineseNumTransformNum(chineseNumber: string) {
    const chineseNum = [
      '一',
      '二',
      '三',
      '四',
      '五',
      '六',
      '七',
      '八',
      '九',
      '十',
      '十一',
      '十二',
      '十三',
    ];
    let num: number = chineseNum.indexOf(chineseNumber);
    return ++num;
  }
  /**
   * 傳入科目名稱轉換成科目ID
   * @param {string} - 科目名稱
   */
  private serchSubjectID(subjectName: string) {
    const data = TableManager.subject.getAll();
    let subject: SubjectData[];
    subject = data.filter((item: SubjectData) => {
      return subjectName === item.subject_groupings_name;
    });
    return subject[0].subject_groupings_id;
  }
  /**
   * 傳入科目ID轉換成科目名稱
   * @param {number} - 科目ID
   */
  private serchSubjectName(id: number) {
    const data = TableManager.subject.getAll();
    let subject: SubjectData[];
    subject = data.filter((item: SubjectData) => {
      return id === item.subject_groupings_id;
    });
    return subject.length > 0 ? subject[0].subject_groupings_name : id;
  }
  /**
   * 傳入正確解答數跟是否有獎勵回傳我的提問解答顯示字串
   * @param {number} - 解答數
   * @param {boolean} - 是否有獎勵
   */
  private questionStateFormat(isSolution: number, reward: boolean) {
    if (isSolution !== 0 && reward === false) {
      return '領取獎勵';
    }
    if (isSolution !== 0 && reward === true) {
      return '有解答';
    }
    if (isSolution === 0) {
      return '未解答';
    }
  }
  /**
   * 整理後端傳過來的時間格式轉成(yyyy-mm-dd)
   * @param {string} - 後端過來的時間
   */
  private dateFormat(dateString: string) {
    const date = dateString.split(' ');
    const newDate = new Date(date[0]);
    const month = newDate.getMonth() + 1;
    return `${newDate.getFullYear()}-${month
      .toString()
      .padStart(2, '0')}-${newDate.getDate().toString().padStart(2, '0')}`;
  }
  /**
   * 整理後端資料
   * @param {Object} - 後端傳過來的資料
   */
  private postListFormat(data: any) {
    const chineseNum = this.numTransformChinese(data.gradeNum);
    const chineseSubjectName = this.serchSubjectName(data.subjectNum);
    const refer = JSON.parse(data.refer);
    return {
      serialNumber: data.postId,
      grade: chineseNum,
      subject: chineseSubjectName,
      questionsSource: data.title,
      solutionsNumber: data.commentCount,
      questionTime: this.dateFormat(data.createdAt),
      questionState: this.questionStateFormat(data.commentCount, refer.reward),
      adleduUrl: refer.adleduURL,
    };
  }

  private goQuestion(id: number) {
    this.$router.push({
      name: `${MenuWord.MyQuestionContent}`,
      params: { id: `${id}` },
    });
  }
}
</script>
<style scoped>
::v-deep .el-pagination .btn-next,
::v-deep .el-pagination .btn-prev {
  background-color: transparent;
}
::v-deep .el-pagination button:disabled {
  background-color: transparent;
}
::v-deep .el-pager li.active {
  color: #fdc221;
}
::v-deep .el-pager li {
  color: #878787;
  background-color: transparent;
}
::v-deep .el-breadcrumb__inner {
  color: #d69f05 !important;
  font-size: 18px;
  font-weight: 700 !important;
}
::v-deep .el-breadcrumb__separator {
  color: #d69f05 !important;
  font-size: 18px;
  font-weight: 700 !important;
}
</style>
