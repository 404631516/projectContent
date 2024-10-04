<template>
  <div>
    <div
      class="w-6/10 <lg:w-[98%] flex items-center justify-between"
      m="x-auto"
      p="y-5"
    >
      <h1 font="bold" text="6xl <sm:5xl [#FDC221]">{{ textData.title }}</h1>
      <ButtonList />
    </div>
    <FilterBar @handleGrade="handleGrade" @handleSubject="handleSubject" />
    <div bg="[#E3DDC2]">
      <el-breadcrumb
        class="w-6/10 <lg:w-[98%]"
        m="x-auto"
        p="y-2"
        text="18px [#D69F05]"
        separator-class="el-icon-arrow-right"
      >
        <el-breadcrumb-item>{{ textData.questionList }}</el-breadcrumb-item>
        <el-breadcrumb-item
          v-for="(item, index) in breadcrumbData"
          :key="index"
          >{{ item }}</el-breadcrumb-item
        >
      </el-breadcrumb>
    </div>
    <QuestionsList :tableData="tableData" @goQuestion="goQuestion" />
    <el-pagination
      @current-change="handleCurrentChange"
      layout="prev, pager, next"
      :page-size="10"
      :total="totalPost"
    ></el-pagination>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ButtonList from '@/components/InterstellarForum/ButtonList.vue';
import FilterBar from '@/components/InterstellarForum/FilterBar/FilterBar.vue';
import QuestionsList from '@/components/InterstellarForum/QuestionsList.vue';
import {
  adlForumUserPostList,
  adlForumSchoolPostList,
} from '@/api/InterstellarForum'; // 取的星際論壇資料
import { Message } from '@/helper/class/Common'; // 訊息框
import { ResponseState } from '@/helper/enum/Common';

import { ForumTable } from '@/helper/interface/InterstellarForum';
import TableManager from '@/manager/TableManager';
import { SubjectData } from '@/manager/TableManager';

@Component({
  components: {
    ButtonList,
    FilterBar,
    QuestionsList,
  },
})
export default class Index extends Vue {
  private tableData: ForumTable[] = []; // 論壇的全部資料
  private totalPost: number = 0; // 共有幾則貼文
  private grade: number = -1;
  private subject: number = -1;
  /**文字資料 */
  private textData = {
    title: '星際論壇',
    questionList: '提問列表',
  };

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

  private created() {
    this.handleCurrentChange(1, -1, -1);
  }
  private handleGrade(grade: string) {
    this.grade = this.ChineseNumTransformNum(grade);
    this.handleCurrentChange(1, this.subject, this.grade);
  }
  private handleSubject(subject: string) {
    this.subject = this.serchSubjectID(subject);
    this.handleCurrentChange(1, this.subject, this.grade);
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
      const response: any = await adlForumSchoolPostList.fetch({
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
      Message.error(e);
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
      questioner: data.name,
      solutionsNumber: data.commentCount,
      questionTime: this.dateFormat(data.createdAt),
      questionState: this.questionStateFormat(data.commentCount, refer.reward),
      adleduUrl: refer.adleduURL,
    };
  }

  private goQuestion(id: number) {
    this.$router.push({
      name: 'SchoolQuestionContent',
      params: { id: `${id}` },
    });
  }
}
</script>
<style scoped>
>>> .el-pagination .btn-next,
>>> .el-pagination .btn-prev {
  background-color: transparent;
}
>>> .el-pagination button:disabled {
  background-color: transparent;
}
>>> .el-pager li.active {
  color: #fdc221;
}
>>> .el-pager li {
  color: #878787;
  background-color: transparent;
}
>>> .el-breadcrumb__inner {
  color: #d69f05 !important;
  font-size: 18px;
  font-weight: 700 !important;
}
>>> .el-breadcrumb__separator {
  color: #d69f05 !important;
  font-size: 18px;
  font-weight: 700 !important;
}
</style>
