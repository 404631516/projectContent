import { HeroData } from '@/manager/TableManager';
import { CustomTileProperties } from '@/views/H5/Helper/PhaserTilemapHelper';
import BattleUnit from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnit';
import BaseTilemap, { ObjectLayerConfig, TileLayerConfig } from '@/views/H5/Scripts/Components/Tilemap/BaseTilemap';
import { AntiTDString } from '../Data/AntiTDConfig';
import AntiTDGameScene from '../Scenes/AntiTDGameScene';
import AntiTDEnemySpawnPoint from './AntiTDEnemySpawnPoint';
import MapObstacle from '../../../Scripts/Components/Combat/Component/MapObstacle';
import { AntiTDEnemy, AntiTDHero } from './Battle/AntiTDBattleUnit';
import { CombatNumber } from '@/helper/enum/Combat';

type OverlapGameobject = Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile;

export default class AntiTDTilemap extends BaseTilemap {
  //#region declare、readonly
  /** 逆塔防遊戲場景 */
  public declare scene: AntiTDGameScene;
  /** 地圖config */
  private readonly tileLayerConfig: TileLayerConfig<AntiTDString> = {
    tileLayerName: AntiTDString.TileLayer,
    tilesetName: AntiTDString.Tileset,
    tilesetKey: AntiTDString.Tileset,
    properties: {},
  };
  /** 敵人生成物件config */
  private readonly objectLayerConfig: ObjectLayerConfig<AntiTDString> = {
    objectLayerName: AntiTDString.ObjectLayer,
    tilesetName: AntiTDString.Tileset,
    objectConfig: { key: AntiTDString.EnemySpawnPoint, classType: AntiTDEnemySpawnPoint },
    properties: { tileType: AntiTDString.ObjectTypeEnemySpawnPoint },
  };
  //#endregion declare、readonly

  //#region properties
  /** 地圖圖層 */
  private _layer!: Phaser.Tilemaps.TilemapLayer;
  public get layer(): Phaser.Tilemaps.TilemapLayer {
    return this._layer;
  }
  /** 可生成敵人地點 */
  private enemySpawnPoints: AntiTDEnemySpawnPoint[] = [];

  /** 可生成英雄的地點 */
  private _heroSpawnTiles!: Phaser.Tilemaps.Tile[];
  public get heroSpawnTiles(): Phaser.Tilemaps.Tile[] {
    return this._heroSpawnTiles;
  }
  //#endregion properties

  public init(): void {
    // 添加圖層
    const layer = this.addLayer(this.tileLayerConfig);
    if (layer == null) {
      console.error(`layer == null`);
      return;
    }

    this._layer = layer;

    // 添加敵人生成點物件
    const enemySpawnPointGroup = this.addObjectGroup(AntiTDString.EnemySpawnPointGroup, [this.objectLayerConfig]);
    // 轉換格式儲存
    this.enemySpawnPoints = enemySpawnPointGroup.getChildren().map((gameObject: Phaser.GameObjects.GameObject) => {
      const enemySpawnPoint = gameObject as AntiTDEnemySpawnPoint;
      enemySpawnPoint.init();
      return enemySpawnPoint;
    });

    // 調整圖層、物件至螢幕正中央
    this.setPositionXY(-this.layer.width / 2, -this.layer.height / 2);
    // 設置深度
    this.layer.setDepth(-this.layer.height);
    this.enemySpawnPoints.forEach((enemySpawnPoint: AntiTDEnemySpawnPoint) => {
      enemySpawnPoint.setDepth(-this.layer.height);
    });
    // 創建障礙物
    this.layer.getTilesWithin().forEach((tile: Phaser.Tilemaps.Tile) => {
      // 獲取tileType
      const tileProperties = tile.properties as CustomTileProperties;
      const tileType = tileProperties.tileType;
      // 獲取不到tileType，不創建
      if (tileType == null) {
        return;
      }
      // tileType不符合現有障礙物類型，不創建
      if (this.scene.combatGroups.mapObstacleKeys.includes(tileType) === false) {
        return;
      }
      // 從現有障礙物群組創建障礙物
      const obstacle = this.scene.combatGroups.createMemberFromGroup<MapObstacle>(tileType);
      if (obstacle == null) {
        return;
      }

      // 初始化位置
      obstacle.setPosition(tile.getCenterX(), tile.getCenterY());
      // 障礙物不可移動
      obstacle.body.setImmovable(true);
      // 障礙物表面光滑
      obstacle.body.setFriction(0, 0);
      // 檢查上接點是否有相連障礙物
      const upContactTile = this.layer.getTileAtWorldXY(obstacle.x, obstacle.y - CombatNumber.TileSize);
      if (upContactTile && this.scene.combatGroups.mapObstacleKeys.includes(upContactTile.properties.tileType)) {
        // 移除上緣collision
        obstacle.body.checkCollision.up = false;
      }
      // 檢查下接點是否有相連障礙物
      const downContactTile = this.layer.getTileAtWorldXY(obstacle.x, obstacle.y + CombatNumber.TileSize);
      if (downContactTile && this.scene.combatGroups.mapObstacleKeys.includes(downContactTile.properties.tileType)) {
        // 移除下緣collision
        obstacle.body.checkCollision.down = false;
      }
      // 檢查左接點是否有相連障礙物
      const leftContactTile = this.layer.getTileAtWorldXY(obstacle.x - CombatNumber.TileSize, obstacle.y);
      if (leftContactTile && this.scene.combatGroups.mapObstacleKeys.includes(leftContactTile.properties.tileType)) {
        // 移除左緣collision
        obstacle.body.checkCollision.left = false;
      }
      // 檢查右接點是否有相連障礙物
      const rightContactTile = this.layer.getTileAtWorldXY(obstacle.x + CombatNumber.TileSize, obstacle.y);
      if (rightContactTile && this.scene.combatGroups.mapObstacleKeys.includes(rightContactTile.properties.tileType)) {
        // 移除右緣collision
        obstacle.body.checkCollision.right = false;
      }
    });

    // 設置英雄生成點
    this._heroSpawnTiles = this.layer.getTilesWithin().filter((tile: Phaser.Tilemaps.Tile) => {
      const tileProperties = tile.properties as CustomTileProperties;
      return tileProperties.tileType === AntiTDString.TileTypeHeroSpawnPoint;
    });

    // 獲取英雄、敵人群組
    const heroGroup = this.scene.combatGroups.getGroup(AntiTDHero.name) as Phaser.Physics.Arcade.Group;
    const enemyGroup = this.scene.combatGroups.getGroup(AntiTDEnemy.name) as Phaser.Physics.Arcade.Group;
    if (heroGroup === undefined || enemyGroup === undefined) {
      return;
    }

    // 英雄、敵人與障礙物做碰撞
    this.addCollider(
      AntiTDString.ColliderObstacleWithUnit,
      [heroGroup, enemyGroup],
      this.scene.combatGroups.getMapObstacleGroups(),
      this.nullProcess,
      this.onUnitProcessObstacle
    );
  }

  /** 英雄、敵人與障礙物是否執行碰撞
   * @param battleUnit 英雄、敵人
   * @param obstacle
   * @returns 是否執行碰撞
   */
  private onUnitProcessObstacle(battleUnit: OverlapGameobject, obstacle: OverlapGameobject): boolean {
    const unit = battleUnit as BattleUnit<HeroData>;
    return unit.ignoreObstacle === false;
  }

  /** 獲取敵人隊伍生成地點
   * @param spawnPointIds 敵人隊伍可以在那些Id的出生點生成
   * @returns 生成地點
   */
  public getEnemyTeamSpawnPoint(spawnPointIds: number[]): AntiTDEnemySpawnPoint {
    // 過濾出所有可出生點
    const spawnPoints = this.enemySpawnPoints.filter((enemySpawnPoint: AntiTDEnemySpawnPoint) =>
      spawnPointIds.includes(enemySpawnPoint.getData('id'))
    );
    // 依照出生點上活動敵人隊伍數量排序
    spawnPoints.sort(
      (a: AntiTDEnemySpawnPoint, b: AntiTDEnemySpawnPoint) => a.spawnedLivingEnemyCount - b.spawnedLivingEnemyCount
    );
    // 只取活動敵人隊伍數量最小的出生點
    const lowestEnemyCountSpawnPoint = spawnPoints.filter(
      (enemySpawnPoint: AntiTDEnemySpawnPoint) =>
        enemySpawnPoint.spawnedLivingEnemyCount === spawnPoints[0].spawnedLivingEnemyCount
    );
    // 假如查找不到，可能為企劃填表失誤，報錯並隨機選擇一個出生點
    if (lowestEnemyCountSpawnPoint.length === 0) {
      console.error(`Do not have any spawn point id match spawnPointIds: ${spawnPointIds} `);
      return Phaser.Math.RND.pick(this.enemySpawnPoints);
    }
    // 返回符合資格的出生點
    return Phaser.Math.RND.pick(lowestEnemyCountSpawnPoint);
  }
}
