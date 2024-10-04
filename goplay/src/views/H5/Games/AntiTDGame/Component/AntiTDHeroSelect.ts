import { CharacterAnimType } from '@/helper/enum/PhaserGame';
import { Size } from '@/views/H5/Helper/PhaserHelper';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { AntiTDString } from '../Data/AntiTDConfig';
import AntiTDGameScene, { AntiTDHeroUnitData } from '../Scenes/AntiTDGameScene';
import { AntiTDHero } from './Battle/AntiTDBattleUnit';

/** 角色單位，場上每一隻角色都繼承此Class */
export default class AntiTDHeroSelect extends Object2D {
  /** 逆塔防遊戲場景 */
  public declare scene: AntiTDGameScene;
  /** battleUnit */
  private readonly battleUnitSize: Size = { width: 64, height: 96 };
  /** 提示箭頭位置 */
  private readonly hintArrowPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, -70);

  /** 角色圖檔 */
  private character!: Phaser.GameObjects.Sprite;
  /** 英雄資料 */
  private heroUnitData!: AntiTDHeroUnitData;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // 初始化身體尺寸
    this.setSize(this.battleUnitSize.width, this.battleUnitSize.height);
    // 初始化角色圖
    this.character = this.addSprite('', 0, 0);
    // 初始化提示箭頭
    this.addSprite(AntiTDString.TeamIcon, this.hintArrowPosition.x, this.hintArrowPosition.y);
  }

  /** 初始化
   * @param heroUnitData 英雄角色資料
   */
  public init(heroUnitData: AntiTDHeroUnitData): void {
    // 要追蹤的英雄角色
    this.heroUnitData = heroUnitData;
    // 設置英雄角色圖
    this.character.setTexture(heroUnitData.data.nameKey + CharacterAnimType.Idle);
    this.character.anims.play(heroUnitData.data.nameKey + CharacterAnimType.Idle);
    // 設置英雄角色比例
    this.character.setScale(0.5);
    // 啟動
    this.setActive(true);
    this.setVisible(true);
  }

  update(...args: any[]): void {
    // 偵測英雄是否靠近
    const bodies = this.scene.physics.overlapCirc(this.x, this.y, this.width / 2) as Phaser.Physics.Arcade.Body[];
    for (const body of bodies) {
      // 假如被英雄碰到，且該英雄為英雄隊長，則判定為選擇此角色
      if (body.gameObject instanceof AntiTDHero === true) {
        const hero = body.gameObject as AntiTDHero;
        if (hero === hero.battleTeam.leader) {
          // 選擇此英雄
          this.scene.onHeroSelect(this.heroUnitData);
          break;
        }
      }
    }
  }
}
