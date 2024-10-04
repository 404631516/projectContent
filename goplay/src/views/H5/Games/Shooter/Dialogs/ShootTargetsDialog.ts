import UIDialog from '../../../Scripts/Components/UIDialog';
import { ShootNumber } from '../Data/ShooterConfig';
import ShootTarget from '../Components/ShootTarget';
import TableManager from '@/manager/TableManager';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import ScoreLayout from '@/views/H5/Scripts/Components/UI/ScoreLayout';

export default class ShootTargetsDialog extends UIDialog {
  /** 射擊目標大小, 為原圖大小乘上一個scale值 */
  private readonly targetScale: number = 0.5;
  /** 計算目標物可放置平台的範圍 */
  private readonly targetRange = {
    top: this.height * 0.2,
    left: this.width * 0.3,
    bottom: this.height * 0.8,
    right: this.width * 0.95,
  };
  /** 分數元件位置 */
  private readonly scoreLayoutPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.width - 125, 30);

  /** 分數顯示 */
  private scoreLayout!: ScoreLayout;
  /** 目標物 */
  private targetArray: ShootTarget[] = [];
  /** 完成階段數 */
  private stageCompleteCounts: number = -1;
  /** 擊破分數 */
  public score: number = 0;
  /** 敵人總血量 */
  public targetsTotalHp: number = 0;

  /** 射擊目標物件 */
  public get targets() {
    return this.targetArray;
  }
  /** 是否達到目標分數 */
  public get goal(): boolean {
    return this.score >= ShootNumber.GoalScore;
  }

  /** 減少能量值 */
  public reduceHp(value: number): void {
    if (value < 0) {
      console.error('reduceHp 只接受 >0 的參數');
      return;
    }
    // 更新分數
    this.score += value;
    this.scoreLayout.setScoreText(`${this.score} / ${ShootNumber.GoalScore}`);

    // 更新血量
    this.targetsTotalHp -= value;
    // 當血量清空則重置目標
    if (this.targetsTotalHp <= 0) {
      this.resetTargets();
    }
  }

  protected setUI(): void {
    // 建立分數元件
    this.scoreLayout = this.addObject(this.scoreLayoutPosition.x, this.scoreLayoutPosition.y, ScoreLayout);
    this.scoreLayout.setScoreText(`0 / ${ShootNumber.GoalScore}`);

    // 重置目標、目標總血量
    this.resetTargets();
  }

  /** 重置目標、目標總血量 */
  public async resetTargets(): Promise<void> {
    // 如果不是第一個階段
    if (this.stageCompleteCounts >= 0) {
      // 等待砲彈墜落
      await AsyncHelper.sleep(2);
    }
    this.stageCompleteCounts += 1;
    // 取得單階段射擊目標總血量
    let totalTargetHp = ShootNumber.StageTargetHp;

    // 重置總血量
    this.targetsTotalHp = totalTargetHp;

    // 取得全部的射擊目標 靜態表資料
    const allShootTargetTableData = TableManager.shootTarget.getAll();

    // while迴圈骰射擊目標,
    while (totalTargetHp > 0) {
      // 防呆, 剩餘血量無法整除的情況
      if (allShootTargetTableData.length === 0) {
        console.error('ShootTargetsDialog.setUI() error, totalTargetHp not match to shootTarget TableData!');
        console.error('left totalTargetHp = ' + totalTargetHp);
        break;
      }

      // 從靜態表中隨機抽出一個射擊目標
      const index = Math.floor(Math.random() * allShootTargetTableData.length);
      const targetTableData = allShootTargetTableData[index];

      // 若射擊目標血量大於目前要湊的剩餘血量, 則重抽一個(並從清單中排除當前所選的射擊目標)
      if (totalTargetHp < targetTableData.hp) {
        allShootTargetTableData.splice(index, 1);
        continue;
      }

      // 總血量 扣除 當前目標血量
      totalTargetHp -= targetTableData.hp;

      // 根據放置範圍產生隨機的位置
      const pos = {
        x: Math.random() * (this.targetRange.right - this.targetRange.left) + this.targetRange.left,
        y: Math.random() * (this.targetRange.top - this.targetRange.bottom) + this.targetRange.bottom,
      };
      // 生成射擊目標
      const target = this.addPhysicsObject(pos.x, pos.y, true, ShootTarget, targetTableData);
      target.onDamage = (damage: number) => {
        this.reduceHp(damage);
      };
      target.setScale(this.targetScale);
      this.targetArray.push(target);
    }

    // 調整目標物的y軸順序
    this.targetArray.sort((target1: ShootTarget, target2: ShootTarget) => {
      return target1.y - target2.y;
    });
    this.targetArray.forEach((target) => {
      this.bringToTop(target);
    });
  }
}
