import AlgorithmHelper from './AlgorithmHelper';
import { Tilemap } from '../Scripts/Components/Tilemap/BaseTilemap';

/** 與Tiled編輯器設置相配合 */
export interface CustomTileProperties {
  tileType?: string;
}

/** TileMap ObjectLayer的Object上設定的properties格式 */
export interface TiledObjectProperty {
  name: string;
  type: string;
  value: any;
}

export default class PhaserTilemapHelper {
  /** 抓取當前layer裡含有相同屬性的tile的index
   * @param customProperties Tiled編輯器客製屬性
   */
  public static getIndexByProperties(map: Phaser.Tilemaps.Tilemap, customProperties: CustomTileProperties): number[] {
    const indexArray: number[] = [];

    map.filterTiles((tile: Phaser.Tilemaps.Tile) => {
      // 0 為空tile，要取得正確的gid須加上1
      if (indexArray.includes(tile.index + 1)) {
        return false;
      }

      const tileProperties = tile.properties as CustomTileProperties;
      if (AlgorithmHelper.shallowEqual(tileProperties, customProperties)) {
        indexArray.push(tile.index + 1);
        return true;
      }

      return false;
    });

    return indexArray;
  }

  /** 取得指定名稱的ObjectLayer
   * @param tileMap Tilemap
   * @param objectLayerName 目標ObjectLayer name
   */
  public static getTiledObjects(
    tileMap: Phaser.Tilemaps.Tilemap,
    objectLayerName: string,
  ): Phaser.Types.Tilemaps.TiledObject[] {
    const objectLayer = tileMap.getObjectLayer(objectLayerName);
    return objectLayer!.objects;
  }

  /** 由於tiledObject.properties不方便查找, 將其中的name當成是key, 轉成Map格式輸出
   * @param tiledObject TileMap ObjectLayer的Object
   */
  public static getTiledObjectPropertyMap(tiledObject: Phaser.Types.Tilemaps.TiledObject): Map<string, any> {
    // 回傳格式 Map<property.name, property.value>
    const map = new Map<string, any>();
    // 定義tiledObject.properties型別
    const tiledObjectProperties = (tiledObject?.properties as TiledObjectProperty[]) || [];
    // foreach存入map
    tiledObjectProperties.forEach((tiledObjectProperty) => {
      map.set(tiledObjectProperty.name, tiledObjectProperty.value);
    });

    // 回傳
    return map;
  }
}
