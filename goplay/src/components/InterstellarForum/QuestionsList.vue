<template>
  <div class="questions-list-area">
    <div class="no-post" v-if="forumData.length === 0">目前沒有貼文喔!</div>
    <div class="w-6/10 <lg:w-[98%]" v-else>
      <el-table
        :data="forumData"
        :default-sort="{ prop: 'date', order: 'descending' }"
        @row-click="goQuestion"
      >
        <el-table-column
          align="center"
          prop="grade"
          label="年級"
          sortable
          min-width="100"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="subject"
          label="科目"
          min-width="80"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="questionsSource"
          label="問題來源"
          min-width="150"
        ></el-table-column>
        <el-table-column
          v-if="!myQuestion"
          align="center"
          prop="questioner"
          label="發問人"
          min-width="110"
        >
          <template slot-scope="scope">
            <div text="3xl [#00CCCE]">{{ scope.row.questioner }}</div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="solutionsNumber"
          label="解答數"
          min-width="100"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="questionTime"
          label="發問時間"
          sortable
          min-width="120"
        ></el-table-column>
        <el-table-column
          v-if="myQuestion"
          align="center"
          prop="questionState"
          label="解答"
          min-width="100"
        >
          <template slot-scope="scope">
            <div
              class="rounded-[20px] yellowGradient shadow-default"
              p="x-2 y-1"
              text="[#FFF]"
              bg="gradient-to-r"
              v-if="scope.row.questionState === '領取獎勵'"
              @click.stop="takeGold(scope.row.serialNumber)"
            >
              {{ scope.row.questionState }}
            </div>
            <div v-else>{{ scope.row.questionState }}</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { ForumTable } from '@/helper/interface/InterstellarForum';
import { handleScreen } from '@/helper/fnc/common';
import { ScreenType } from '@/helper/enum/Common';
@Component({
  components: {},
})
export default class QuestionsList extends Vue {
  @Prop() private tableData!: ForumTable[];
  @Prop() private myQuestion!: boolean;

  private get forumData() {
    return this.tableData;
  }
  @Emit('goQuestion')
  private goQuestion(row: any) {
    return row.serialNumber;
  }

  @Emit('takeGold')
  private takeGold(id: number) {
    console.log(id);
    return id;
  }
}
</script>

<style scoped>
.questions-list-area {
  width: 100%;
  display: flex;
  justify-content: center;
}
.no-post {
  width: 100%;
  line-height: 100px;
  font-size: 38px;
  color: #878787;
}
>>> .el-table,
>>> .el-table__cell,
>>> .el-table tr,
>>> .el-table th {
  background-color: transparent;
}
>>> .el-table {
  color: #878787;
  font-size: 18px;
  background-color: transparent;
}
>>> .el-table__body {
  table-layout: auto;
  border-spacing: 2px 8px;
}
>>> .el-table__row {
  outline: 1px solid #828282;
  border-radius: 10px;
  cursor: pointer;
}
>>> .el-table td.el-table__cell,
>>> .el-table th.el-table__cell {
  border-bottom: 0px;
}
>>> .el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: transparent;
}
</style>
