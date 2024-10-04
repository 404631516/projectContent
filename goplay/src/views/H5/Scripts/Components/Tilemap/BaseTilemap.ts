import { Scene } from 'phaser';
import Object2D from '../Object2D';
import PhaserTilemapHelper, { CustomTileProperties } from '@/views/H5/Helper/PhaserTilemapHelper';
import { Vector2 } from '@/views/H5/Games/BomberMan/Components/BomberManTilemap';

export type Tilemap = Phaser.Tilemaps.Tilemap;
export type TilemapLayer = Phaser.Tilemaps.TilemapLayer;
export type Tileset = Phaser.Tilemaps.Tileset;
export type TileObject = Phaser.GameObjects.GameObject | Phaser.Physics.Arcade.Group;
export type Group = Phaser.Physics.Arcade.Group;
export type GameObject = Phaser.GameObjects.GameObject;
export type Collider = Phaser.Physics.Arcade.Collider;
export type Callback = Phaser.Types.Physics.Arcade.ArcadePhysicsCallback;
export type CreateFromObjectLayerConfig = Phaser.Types.Tilemaps.CreateFromObjectLayerConfig;
export type PhysicsGroupConfig = Phaser.Types.Physics.Arcade.PhysicsGroupConfig;

type OverlapGameobject = Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile;

/** 地圖規格
 * 使用Tiled編輯地圖，地圖建議只用單一TilemapLayer與單一Tileset較單純
 * (Tiled載入Tileset時請勾選Embeded in map，匯出時才不會有多餘的檔案)
 *
 * 客製屬性:
 * 編輯Tileset中Tile的客製屬性，創建string類別屬性，名稱為'type'，內容自訂，用以過濾不同type的事件
 * 例如: type: wall 來判定屬性內容為wall的Tile為牆面，會與玩家做物理碰撞
 *
 * 物理偵測:
 * 建議每一個Tile Layer或每一個Object Layer都只使用一項客製屬性
 */

/** Tiled Editor 中的 Tile Layer Config */
export interface TileLayerConfig<T extends string> {
  /** 對應到Tiled Editor的Tile Layer圖層名稱 */
  tileLayerName: T;
  /** 對應到Tiled Editor的圖集名稱 */
  tilesetName: T;
  /** 圖集的Key，供Phaser載入圖集資源 */
  tilesetKey: T;
  /** 對應到Tiled Editor的客製屬性 */
  properties: CustomTileProperties;
}

/** Tiled Editor 中的 Object Layer Config */
export interface ObjectLayerConfig<T extends string> {
  /** 對應到Tiled Editor的Object Layer圖層名稱 */
  objectLayerName: T;
  /** 對應到Tiled Editor的圖集名稱 */
  tilesetName: T;
  /** Phaser內建，用來從Object Layer創建物品的Config，可客製Class Type
   * Config中的Key可隨意做替換(創建出的物件不一定與原本圖案相同)，需手動從圖集中拆分出來使用
   */
  objectConfig: CreateFromObjectLayerConfig;
  /** 對應到Tiled Editor的客製屬性 */
  properties: CustomTileProperties;
}

/** 使用到Tilemap的遊戲都須繼承此類別 */
export default abstract class BaseTilemap extends Object2D {
  //#region data
  /** 暫存生成的tilemap */
  protected tilemap: Tilemap;
  /** 管理Tile Layer產生出的所有圖層 */
  protected layers: Map<string, TilemapLayer> = new Map<string, TilemapLayer>();
  /** 管理Object Layer產生的所有Group */
  protected objectGroups: Map<string, Group> = new Map<string, Group>();
  /** 管理場景中所有與Tilemap互動的物理偵測 */
  protected colliders: Map<string, Collider> = new Map<string, Collider>();
  //#endregion data

  /** 建構式
   * @param scene 遊戲場景
   * @param x 位置x
   * @param y 位置y
   * @param tilemapKey 用以創建預設tilemap
   */
  constructor(scene: Scene, x: number, y: number, tilemapKey: string) {
    super(scene, x, y);
    this.tilemap = this.scene.make.tilemap({ key: tilemapKey });
  }

  /** 地圖初始化都由這裡完成:
   * 創建Layer(addLayer)、創建Group(addObjectGroup)、設定Collider(addCollider)、設定Overlap(addOverlap)
   */
  public abstract init(): void;

  /** 清除所有生成的資料後(圖層、碰撞群組等等)，重置tilemap並初始化
   * @param tilemapKey 要替換的tilemap key
   */
  public resetTilemap(tilemapKey: string): void {
    // 先清除所有生成的資料(圖層、碰撞群組等等)
    this.clear();
    // 清除原本tilemap
    this.tilemap.destroy();
    // 重新設定tilemap
    this.tilemap = this.scene.make.tilemap({ key: tilemapKey });
    // 初始化tilemap
    this.init();
  }

  /** Phaser.GameObjects.Container的功能並不完整，導致TilemapLayer、Group不會跟隨移動
   * 因此需直接對TilemapLayer、Group的x軸做操控
   * @param targetX 目標X
   * @param targetY 目標Y
   */
  public setPositionXY(targetX: number, targerY: number = this.y): void {
    // 計算變化量delatX
    const delatX = targetX - this.x;
    const delatY = targerY - this.y;
    // 將Container(Object2D)的x設至目標位置
    this.x = targetX;
    this.y = targerY;
    // 依照變化量移動圖層
    this.layers.forEach((layer: Phaser.Tilemaps.TilemapLayer, key: string) => {
      layer.x += delatX;
      layer.y += delatY;
    });
    // 依照變化量移動物件群組
    this.objectGroups.forEach((group: Phaser.Physics.Arcade.Group, key: string) => {
      group.incXY(delatX, delatY);
    });
  }

  /** 清除運作中的圖層與物理碰撞群組 */
  public clear(): void {
    this.removeColliders();
    this.destroyObjectGroups();
    this.destroyLayers();
    // 重置Container(Object2D)的x
    this.x = 0;
  }

  /** 創建圖層至遊戲場景中
   * @param tilemap 地圖資料結構
   * @param layerConfig 自訂Config
   * @returns
   */
  protected addLayer(layerConfig: TileLayerConfig<string>): TilemapLayer | undefined {
    // 防呆
    let layer = this.layers.get(layerConfig.tileLayerName);
    if (layer !== undefined) {
      return layer;
    }
    // 導入圖集資料供Tilemap生成圖層
    const tileset = this.tilemap.addTilesetImage(layerConfig.tilesetName, layerConfig.tilesetKey);
    if (tileset == null) {
      console.error(`BaseTilemap.addLayer() error, tileset is null, 創建 ${layerConfig.tileLayerName} 圖層失敗`);
      return undefined;
    }
    // create layer
    layer = this.tilemap.createLayer(layerConfig.tileLayerName, tileset) ?? undefined;
    if (layer === undefined) {
      console.error(`BaseTilemap.addLayer() error, layer is undefined, 創建 ${layerConfig.tileLayerName} 圖層失敗`);
      return undefined;
    }
    // 依照客製屬性手動開啟物理特性，供碰撞偵測使用
    layer.setCollisionByProperty(layerConfig.properties as object, true);
    // 加入layers以便管理
    this.layers.set(layerConfig.tileLayerName, layer);
    // 回傳
    return layer;
  }

  /** 創建Group至遊戲場景中
   * @param groupName 群組名稱
   * @param groupConfigs 自訂Config，可使用多個config創建成同一個Group
   * @returns
   */
  protected addObjectGroup(groupName: string, groupConfigs: Array<ObjectLayerConfig<string>>): Group {
    // 防呆
    let objectGroup = this.objectGroups.get(groupName);
    if (objectGroup !== undefined) {
      return objectGroup;
    }

    const objects: Phaser.GameObjects.GameObject[] = [];
    for (const groupConfig of groupConfigs) {
      // 嘗試獲取tileset資料
      const tileset = this.tilemap.getTileset(groupConfig.tilesetName);
      // 嘗試獲取objectLayer資料
      const objectLayer = this.tilemap.getObjectLayer(groupConfig.objectLayerName);

      // 無資料則返回
      if (tileset === null || objectLayer === null) {
        console.error(`創建 ${groupConfig.properties.tileType} 地圖物件失敗`);
        continue;
      }

      // 獲取客製化參數
      const tileProperties = tileset.tileProperties as CustomTileProperties[];
      // 用tileType將obj的名稱替換，方便辨別要創建的物件
      objectLayer.objects.forEach((obj: Phaser.Types.Tilemaps.TiledObject) => {
        // 若有客製指定tileType，使用客製的tileType將obj的名稱替換
        const propertyMap = PhaserTilemapHelper.getTiledObjectPropertyMap(obj);
        if (propertyMap.get('tileType') && propertyMap.get('tileType') !== '') {
          obj.name = propertyMap.get('tileType');
          return;
        }

        // 若無，使用gid查找預設的tileType
        if (obj.gid === undefined) {
          return;
        }

        // 使用預設的tileType設置名稱，供BaseTilemap辨別要創建的物件
        obj.name = tileProperties[obj.gid - 1]?.tileType ?? '';
      });

      // 使用名稱指定要創建的物件
      groupConfig.objectConfig.name = groupConfig.properties.tileType;
      // 紀錄創建出的object
      objects.push(...this.tilemap.createFromObjects(groupConfig.objectLayerName, groupConfig.objectConfig));
    }

    // 將物件加至物理群組中方便管理
    objectGroup = this.scene.physics.add.group(objects);

    this.objectGroups.set(groupName, objectGroup);

    return objectGroup;
  }

  /** 新增碰撞偵測，兩個對象不會重疊，互相推擠
   * @param colliderName 自訂名稱
   * @param target 互動目標
   * @param tile 對應到的Tile Layer
   * @param onCollide 碰撞時執行的函式
   * @param onProcess 判斷是否執行 onCollide，依回傳結果決定，return true 時執行
   * @tutorial Phaser已知Bug 如果物理互動對象為 Group vs. Sprite, Sprite 總是會出現在Callback第一個參數位置
   * @returns
   */
  protected addCollider(
    colliderName: string,
    target: GameObject[] | Group[],
    tile: TileObject | Group[],
    onCollide: Callback,
    onProcess: Callback,
  ): Collider {
    // 防呆
    let collider = this.colliders.get(colliderName);
    if (collider !== undefined) {
      console.error(`BaseTilemap.addCollider() error, ${colliderName} 已存在`);
      return collider;
    }

    collider = this.scene.physics.add.collider(target, tile, onCollide, onProcess);

    this.colliders.set(colliderName, collider);
    return collider;
  }

  /** 新增重疊偵測，兩個對象不會碰撞，互相穿透
   * @param colliderName 自訂名稱
   * @param target 互動目標
   * @param group 對應到的Object Group
   * @param onCollide 重疊時執行的函式
   * @param onProcess 判斷是否執行 onCollide，依回傳結果決定，return true 時執行
   * @tutorial Phaser已知Bug 如果物理互動對象為 Group vs. Sprite, Sprite 總是會出現在Callback第一個參數位置
   * @returns
   */
  protected addOverlap(
    colliderName: string,
    target: GameObject | Group[],
    group: Group[],
    onCollide: Callback,
    onProcess: Callback,
  ): Collider {
    // 防呆
    let collider = this.colliders.get(colliderName);
    if (collider !== undefined) {
      console.error(`BaseTilemap.addOverlap() error, ${colliderName} 已存在`);
      return collider;
    }

    collider = this.scene.physics.add.overlap(target, group, onCollide, onProcess);

    this.colliders.set(colliderName, collider);
    return collider;
  }

  /** 移除所有與本地圖相關的物理碰撞偵測 */
  protected removeColliders(): void {
    this.colliders.forEach((collider: Phaser.Physics.Arcade.Collider, key: string) => {
      this.scene.physics.world.removeCollider(collider);
    });

    this.colliders.clear();
  }

  /** 移除所有與本地圖相關的圖層 */
  protected destroyLayers(): void {
    this.layers.forEach((layer: Phaser.Tilemaps.TilemapLayer, key: string) => {
      // layer.destroy(true)會把make出的地圖資料結構刪除，導致無法再次addLayer，所以此處使用layer.destroy(false)
      layer.destroy(false);
    });

    this.layers.clear();
  }

  /** 移除所有與本地圖相關的物理群組 */
  protected destroyObjectGroups(): void {
    this.objectGroups.forEach((group: Phaser.Physics.Arcade.Group, key: string) => {
      group.destroy(true, true);
    });

    this.objectGroups.clear();
  }

  /** 若addCollider、addOverlap時，無須設定onProcess，可用nullProcess代替，表示不需執行任何舉動
   * @param target 不需設置
   * @param other 不需設置
   * @returns 永遠回傳True
   */
  protected nullProcess(target: OverlapGameobject, other: OverlapGameobject): boolean {
    return true;
  }

  /** 用格子索引，計算格子中央的像素座標x
   * @param tileXY 格子座標
   * @param scale 地圖縮放比率
   */
  public tileXYToWorldXYByScale(tileXY: Vector2, scale: number = 1): Vector2 {
    // 先算出指定格子的左上角像素座標
    let resultWorldX = this.tilemap.tileToWorldX(tileXY.x);
    let resultWorldY = this.tilemap.tileToWorldY(tileXY.y);
    // 防呆
    if (resultWorldX === null || resultWorldY === null) {
      console.error('BaseTilemap.tileXYToWorldXYByScale() error, 無法取得指定格子的像素座標');
      return new Phaser.Math.Vector2(0, 0);
    }
    // 再加上半格，就是圖片的中心點, 再縮放比率
    resultWorldX += (this.tilemap.tileWidth / 2) * scale;
    resultWorldY += (this.tilemap.tileHeight / 2) * scale;
    return new Phaser.Math.Vector2(resultWorldX, resultWorldY);
  }
}
