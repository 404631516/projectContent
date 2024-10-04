import { Scene } from 'phaser';
import Object2D from '../../../Scripts/Components/Object2D';
import Slider from '../../../Scripts/Components/Slider';
import ShootBomb from './ShootBomb';
import ShooterGameScene from '../Scenes/ShooterGameScene';
import { ShootTargetData } from '@/manager/TableManager';
import { ShootString } from '../Data/ShooterConfig';

export default class ShootTarget extends Object2D {
  // 目標被攻擊的回呼
  public onDamage?: (damage: number, data?: ShootTargetData) => void;
  private targetData: ShootTargetData; // 目標物資料
  private hpBar: Slider; // 血條

  // 紀錄給予損傷的砲彈
  private bombIndexs: number[] = [];

  constructor(scene: Scene, x: number, y: number, data: ShootTargetData) {
    super(scene, x, y);
    this.targetData = data;

    // 設置圖片, 由於是多張圖合在同一張大圖裡, 所以需要給"frame"值
    this.addImage(ShootString.ShootTargets, 0, 0, data.url);
    this.setSize(60, 60);

    // 設置血條
    this.hpBar = this.addObject(0, -40, Slider, data.hp);
    this.hpBar.setBarSize(60, 15);
  }

  /** 計算扣生命值
   * @param bomb 造成傷害的砲彈
   */
  public getDamage(bomb: ShootBomb) {
    if (this.hpBar.isEmpty) {
      return;
    }

    // 若砲彈沒有靜態資料則返回
    if (bomb.bombData === undefined) {
      return;
    }

    // 不重複得到同樣炸彈的傷害
    if (this.bombIndexs.includes(bomb.index)) {
      return;
    }

    // 計算傷害
    const damage = Math.min(Math.abs(bomb.bombData.attack), this.hpBar.value);
    this.hpBar.addValue(-damage);

    // 執行傷害的回呼, 更新總血量
    if (this.onDamage) {
      this.onDamage(damage);
    }

    // 爆破效果
    const gameScene = this.scene as ShooterGameScene;
    gameScene.playExploreEffect(this.x, this.y);

    // 若血量空時則進行摧毀的回呼
    if (this.hpBar.value <= 0) {
      this.destroy();
    }

    // 紀錄砲彈索引
    this.bombIndexs.push(bomb.index);
  }
}
