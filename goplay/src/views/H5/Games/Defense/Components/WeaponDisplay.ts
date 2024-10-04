import { Scene } from 'phaser';
import Object2D from '../../../Scripts/Components/Object2D';
import { Weapon } from '@/manager/data/Weapon';
import { DefenseWeaponData } from '@/manager/TableManager';

/** 生物兵器實際在遊戲中的畫面
 *  由底部砲台以及頂部的炮管組成
 */
export default class WeaponDisplay extends Object2D {
  // 砲台資料
  protected weapon: Readonly<Weapon>; // 砲台靜態資料
  protected turret: Phaser.GameObjects.Image; // 砲台基底
  protected barrel: Phaser.GameObjects.Image; // 炮管

  constructor(scene: Scene, x: number, y: number, defenseWeaponData: DefenseWeaponData) {
    super(scene, x, y);

    // 置入靜態資料
    this.weapon = new Weapon(defenseWeaponData);

    // 建立砲台
    this.turret = this.addImage(defenseWeaponData.nameKey, 0, 0);

    // 建立槍管
    this.barrel = this.addImage(this.weapon.barrelKey, 0, 0);
    if (this.weapon.barrelKey === '') {
      this.barrel.setVisible(false);
    }
  }
}
