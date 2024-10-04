<template>
  <el-row class="list-temp">
    <el-col :span="24">
      <div class="list-box">
        <el-table :data="listData"
                  empty-text='暫無數據'
                  style="width: 100%">                
          <!-- <el-table-column type="selection"
                           width="55">
          </el-table-column> -->
         <el-table-column :label="listLabel.pointId" prop="pointId" align='center'> 

         </el-table-column>
          <el-table-column prop="pointName"
          align='center'
                           :label="listLabel.pointName">
          </el-table-column>
          <el-table-column prop="content"
          align='left'
                           :label="listLabel.content">
          </el-table-column>
          <el-table-column prop="map"
          align='center'
                           :label="listLabel.map">
          </el-table-column>
          <el-table-column
          prop="stage"
          align='center'
          :label="listLabel.stage">
          </el-table-column>          
          <!-- <el-table-column prop="gameTime"
                           :label="listLabel.gameTime">
          </el-table-column> -->
          <!-- <el-table-column prop="enemyType"
                           :label="listLabel.enemyType">
          </el-table-column> -->
          <el-table-column align='center' :label="listLabel.operate">
            <template slot-scope="scope">
              <el-button @click="handleClick(scope.row)"
                         type="text"
                         size="small">查看更多</el-button>
              <el-button @click="handleEdit(scope.row)"
                         type="text"
                         size="small">編輯</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
@Component
export default class ListTemplet extends Vue {
  // @Prop() private listTitle!: string; // 標題
  // @Prop() private listData!: []; // 資料
  private listData: Array<{}> = [
    {
      pointId: '1',
      pointName: '開局',
      content: '內容',
      map: '地圖一',
      stage: 4,
      stageTime: 100,
      enemySpawTime: 3,
      enemyType: '公主、高跟鞋',
      enemySpeed: '3',
    },
    {
      pointId: '2',
      pointName: '關卡二',
      content: '測試測試02',
      map: '地圖二',
      stage: 2,
      stageTime: 100,
      enemySpawTime: 3,
      enemyType: '公主、高跟鞋',
      enemySpeed: '3',
    },
    {
      pointId: '3',
      pointName: '關卡三',
      content: '測試03',
      map: '地圖一',
      stage: 2,
      stageTime: 100,
      enemySpawTime: 3,
      enemyType: '公主、高跟鞋',
      enemySpeed: '3',
    },
  ];
  private listLabel: {} = {
    pointId: '關卡',
    pointName: '關卡名稱',
    map: '選擇地圖',
    stage: '階段設定',
    enemyType: '敵人類型',
    enemySpeed: '敵人速度',
    enemySpawTime: '下一個敵人出現時間',
    content: '關卡描述',
    operate: '操作',
  };
  // @Emit('handleClick') private send(id: any) { return; }
  // public handleClick(id: number) {
  //   this.send(id);
  // }
  @Emit('handleEdit') private send(id: number) { return; }
  private handleEdit(id: number) {
    this.send(id);
  }
}
</script>
<style lang="scss" scoped>
// .list-temp {
//   padding: 2vw;
// }
</style>
