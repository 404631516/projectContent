import { AdminAwardSettings } from '../entity/admin-award-settings.entity';
import { TeacherAwardInventory } from '../entity/teacher-award-inventory.entity';

/**
 * 遊戲設定 DTO。
 */

export class GameConfigDto {
  constructor(json: object) {
    Object.assign(this, json);
  }

  // 遊戲初始化金錢
  initMoney: number = 0;
  // 遊戲初始化鑽石
  initCrystal: number = 0;
  // 遊戲初始化能量
  initEnergy: number = 0;

  // 能量恢復時間(秒)
  energyRecoverTime: number = 0;
  // 能量恢復數量
  energyRecoverNum: number = 0;
  // 初始能量上限值 (能量最大數量 = 初始能量上限值 + 所有擁有 女孩職業等級)
  energyMaxNum: number = 0;

  // 學習任務的固定獎勵-金幣
  studyTaskAwardCoins: number = 50;

  // 管理員獎勵設定-預設值
  adminAwardSettings: AdminAwardSettings;

  // 教師庫存中的獎勵-預設值
  teacherAwardInventory: TeacherAwardInventory;
}
