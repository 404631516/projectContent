<template>
  <div class="stats">
    <div class="stat-item" v-for="(value, index) in stats" :key="index">
      <div class="stat-title">{{ value.title }}</div>
      <div class="stat-value">{{ value.value }} {{ value.unit }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

export interface Stat {
  title: string;
  value: number;
  unit: string;
}

@Component({})
export default class Stats extends Vue {
  /** 傳入統計資料 */
  @Prop({ required: true }) stats: Stat[] = [];
}
</script>

<style scoped>
.stats {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-left: 40px;
}

.stat-item {
  color: white;
  width: 320px;
  border-radius: 5px;
  box-shadow: 1px 1px 5px #888888;
  text-align: center;
}

.stat-title {
  font-size: 1.5em;
  background: #638bdc;
  padding: 5px 10px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.stat-value {
  font-size: 2em;
  font-weight: bold;
  color: black;
  padding: 20px 20px;
}

.subjectChart-title {
  font-size: 1.2em;
  font-weight: bold;
  text-align: center;
  background-color: #007bff; /* 藍色背景 */
  color: white; /* 白色字體 */
  padding: 2px 25px;
  border-radius: 5px;
  margin-bottom: 10px;
  position: absolute; /* 固定位置 */
  top: 50px;
  left: 33%; /* 水平居中 */
  transform: translateX(-50%);
}

.gameChart-title {
  font-size: 1.2em;
  font-weight: bold;
  text-align: center;
  background-color: #007bff; /* 藍色背景 */
  color: white; /* 白色字體 */
  padding: 2px 25px;
  border-radius: 5px;
  margin-bottom: 10px;
  position: absolute; /* 固定位置 */
  top: 50px;
  left: 67%; /* 水平居中 */
  transform: translateX(-50%);
}

.regression {
  display: grid;
  padding: 10px;
  height: 100%;
}

::v-deep .el-table thead {
  color: #fff;
}

::v-deep.el-table th.el-table__cell {
  background: #007bff;
}

@media (max-width: 1568px) {
  .stats {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 0px;
  }

  .stat-item {
    width: 100%;
  }
}
</style>
