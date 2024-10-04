import { HamsterData, HamsterEquipData, HamsterAttackData } from '@/manager/TableManager';
import Object2D from '../../../Scripts/Components/Object2D';
import { Scene } from 'phaser';
import TableManager from '@/manager/TableManager';
import ElementSlider from '@/views/H5/Scripts/Components/ElementSlider';
import { HamsterString } from '../Data/HamsterConfig';

export default class HamsterDisplay extends Object2D {
  /** 地鼠資料 */
  public hamsterData!: Readonly<HamsterData>;
  /** 地鼠裝備的資料 */
  public equipData?: Readonly<HamsterEquipData>;
  /** 地鼠攻擊的資料 */
  public attackData?: Readonly<HamsterAttackData>;
  /** 擊殺次數的血條, 若血量只有1, 就不顯示血條 */
  private hitBar?: ElementSlider;

  // 圖片物件
  private eqipImage: Phaser.GameObjects.Image;
  private hamsterImage: Phaser.GameObjects.Image;
  private attackImage: Phaser.GameObjects.Image;

  constructor(scene: Scene, x: number, y: number, data: HamsterData) {
    super(scene, x, y);
    // 設置點擊範圍
    this.setSize(100, 100);
    // 設置地鼠本體並預設隱藏
    this.hamsterImage = this.addImage('', 0, 0);
    this.hamsterImage.setVisible(false);
    // 設置裝備並預設隱藏
    this.eqipImage = this.addImage('', 0, 0);
    this.eqipImage.setVisible(false);
    // 設置攻擊圖片並預設隱藏
    this.attackImage = this.addImage('', 0, 0);
    this.attackImage.setVisible(false);
    // 根據資料更新地鼠外型
    this.setHamster(data);
  }

  /** 設置地鼠  */
  public setHamster(data: HamsterData): void {
    // 設置地鼠裝備
    if (this.hamsterData === undefined || data.equipId !== this.hamsterData.equipId) {
      this.setEqipImage(data.equipId, data.equipPosX, data.equipPosY);
    }
    // 設置地鼠攻擊
    if (this.hamsterData === undefined || data.attackId !== this.hamsterData.attackId) {
      this.setAttackImage(data.attackId);
    }
    // 設置靜態資料
    this.hamsterData = data;
    // 設置地鼠圖片
    this.setHamsterImage(data.displayKey);
    // 設置地鼠血條
    this.hitBar?.destroy();
    this.hitBar = undefined;
    if (data.hits > 1) {
      this.hitBar = this.addObject(0, 20, ElementSlider, HamsterString.HeartIcon, data.hits);
      this.hitBar.setElementSize(22, 22);
    }
  }

  /** 設置地鼠圖片 */
  public setHamsterImage(key: string): void {
    this.hamsterImage.setTexture(key);
    this.setSize(this.hamsterImage.width, this.hamsterImage.height);
    this.hamsterImage.setVisible(true);
  }

  /** 血條更新
   * @param hitCount 本次被扣除的血量
   */
  public updateHp(hitCount: number): void {
    this.hitBar?.addValue(-hitCount);
  }

  /** 設置地鼠的裝備 */
  private setEqipImage(equipId: number, x: number = 0, y: number = 0): void {
    // 暫時隱藏裝備圖片
    this.eqipImage.setVisible(false);
    // 若id <= 0則不顯示裝備
    if (equipId <= 0) {
      this.equipData = undefined;
      return;
    }
    // 找到裝備的靜態資料
    this.equipData = TableManager.hamsterEquip.findOne(equipId);
    if (this.equipData === undefined) {
      console.error(`找不到id = ${equipId}的地鼠裝備資料`);
      return;
    }
    // 設置圖片
    this.eqipImage.setTexture(this.equipData.nameKey);
    this.eqipImage.setVisible(true);
    // 設置裝備位置
    this.eqipImage.setPosition(x, y);
  }

  /** 設置地鼠的攻擊(飛行道具)圖片 */
  private setAttackImage(attackId: number): void {
    // 暫時隱藏攻擊圖片
    this.attackImage.setVisible(false);
    // 若id <= 0則不顯示攻擊
    if (attackId <= 0) {
      this.attackData = undefined;
      return;
    }
    // 找到攻擊的靜態資料
    this.attackData = TableManager.hamsterAttack.findOne(attackId);
    if (this.attackData === undefined) {
      console.error(`找不到id = ${attackId}的地鼠攻擊資料`);
      return;
    }
    // 設置圖片
    this.attackImage.setTexture(this.attackData.nameKey);
    this.attackImage.setVisible(true);
  }
}
