<template>
  <div class="select-bar">
    <div class="select-item">
      <p class="title">科目</p>
      <div class="subject-select">
        <el-select @change="handleSubject" :popper-append-to-body="false" v-model="subject" placeholder="科目">
          <el-option
            v-for="(item, subjectIndex) in subjectOptions"
            :key="subjectIndex"
            :value="item"
            :label="`${item}`"
          ></el-option>
        </el-select>
      </div>
    </div>
    <div class="select-item grade">
      <p class="title">年級</p>
      <div class="grade-select">
        <el-select @change="handleGrade" :popper-append-to-body="false" v-model="grade" placeholder="年級">
          <el-option
            v-for="(item, gradeIndex) in gradeOptions"
            :key="gradeIndex"
            :value="item"
            :label="`${item}`"
          ></el-option>
        </el-select>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator';
import TableManager from '@/manager/TableManager';
import { SubjectData } from '@/manager/TableManager';
@Component({
  components: {},
})
export default class SelectBar extends Vue {
  private subject: string = '';
  private grade: string = '';
  private gradeOptions: string[] = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三'];
  private get subjectOptions() {
    const data = TableManager.subject.getAll();
    return data.map((item: SubjectData) => {
      return item.subject_groupings_name;
    });
  }
  @Emit('handleGrade')
  private handleGrade() {
    return this.grade;
  }
  @Emit('handleSubject')
  private handleSubject() {
    return this.subject;
  }
}
</script>

<style lang="scss" scoped>
.select-bar {
  display: flex;
}
.title {
  text-align: left;
  font-size: 22px;
  color: #707070;
  width: 65px;
}
.select-item {
  display: flex;
  align-items: center;
}
.grade {
  margin-left: 10px;
}
.subject-select {
  width: 250px;
  @media (max-width: 435px) {
    width: 150px;
  }
}
.grade-select {
  width: 100px;
}
</style>
