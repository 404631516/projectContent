import Object2D from '@/views/H5/Scripts/Components/Object2D';
import HeroUniverseGameScene from '../Scenes/HeroUniverseGameScene';
import { HeroUniverseNumber } from '../Data/HeroUniverseConfig';

/** 因雄宇宙地圖障礙物 */
export default abstract class HeroUniverseMapObstacle extends Object2D {
  /** 遊戲場景 */
  public declare scene: HeroUniverseGameScene;

  /** 將原先body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody 強制定義型別 */
  public declare body: Phaser.Physics.Arcade.Body;

  constructor(scene: HeroUniverseGameScene, x?: number | undefined, y?: number | undefined) {
    super(scene, x, y);
    // 設置尺寸符合Tile大小
    this.setSize(HeroUniverseNumber.TileSize, HeroUniverseNumber.TileSize);
  }
}
