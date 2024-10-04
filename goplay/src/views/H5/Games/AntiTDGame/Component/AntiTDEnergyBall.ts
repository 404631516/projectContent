import { Size } from '@/views/H5/Helper/PhaserHelper';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { AntiTDString } from '../Data/AntiTDConfig';
import AntiTDGameScene from '../Scenes/AntiTDGameScene';
import { AntiTDHero } from './Battle/AntiTDBattleUnit';

/** 英雄碰到魔力球 */
export default class AntiTDEnergyBall extends Object2D {
  /** 逆塔防遊戲場景 */
  public declare scene: AntiTDGameScene;
  /** 物件寬高 */
  private readonly size: Size = { width: 64, height: 64 };
  /** 魔力值 */
  private energy: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    // 初始化尺寸
    this.setSize(this.size.width, this.size.height);
    // 魔力球圖案
    this.addImage(AntiTDString.EnergyBall, 0, 0);
  }

  /** 初始化
   * @param energy 魔力值
   */
  public init(energy: number): void {
    this.energy = energy;
    // 啟動元件
    this.setActive(true);
    this.setVisible(true);
  }

  update(): void {
    // 偵測英雄是否靠近
    const bodies = this.scene.physics.overlapCirc(this.x, this.y, this.width / 2) as Phaser.Physics.Arcade.Body[];
    for (const body of bodies) {
      if (body.gameObject instanceof AntiTDHero === true) {
        // 偵測到英雄靠近，增加魔力值
        this.scene.updateEnergy(this.energy);
        // 將自己回收
        this.scene.combatGroups.hideMemberFromGroup(AntiTDEnergyBall.name, this);
        break;
      }
    }
  }
}
