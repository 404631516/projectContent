import { Scene } from 'phaser';
import ParkourGameScene from '../Scenes/ParkourGameScene';
import ParkourEnemy from './MapObject/ParkourEnemy';
import ParkourDiamond from './MapObject/ParkourDiamond';
import ParkourObstacle from './MapObject/ParkourObstacle';
import ParkourBreakableWall from './MapObject/ParkourBreakableWall';
import ParkourMapObject from './MapObject/ParkourMapObject';
import TableManager, { ParkourMapObjectData } from '@/manager/TableManager';
import { ParkourDepth, ParkourString } from '@/views/H5/Games/ParkourGame/Data/ParkourConfig';
import BaseTilemap, {
  TileLayerConfig,
  GameObject,
  ObjectLayerConfig,
} from '@/views/H5/Scripts/Components/Tilemap/BaseTilemap';

type OverlapGameobject = Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile;

/** 地圖物件狀態 */
enum mapObjectState {
  untrigger = 0,
  triggered,
}

/** 地圖物件群組config */
interface MapObjectGroupConfig {
  /** 要創建的tileType，對應到tiled地圖 */
  tileType: ParkourString;
  /** 客製化的class */
  classType: new (scene: Scene) => Phaser.GameObjects.GameObject;
}

export default class ParkourTilemap extends BaseTilemap {
  /** 跳躍平台圖層Config
   * 可將此遊戲對應的Tilemap.json檔案使用Tiled Editor打開對照參考
   */
  private readonly forestLayerConfig: TileLayerConfig<ParkourString> = {
    tileLayerName: ParkourString.TileLayerLevelForestLand,
    tilesetName: ParkourString.TilesetLevelForest,
    tilesetKey: ParkourString.TilesetLevelForest,
    properties: { tileType: ParkourString.TileTypeLand },
  };

  /** 主場景Instance */
  private gameScene!: ParkourGameScene;
  /** 暫存鑽石物件群組 */
  private diamondGroup!: Phaser.Physics.Arcade.Group;
  /** 暫存障礙物物件群組 */
  private mapObjectGroup!: Phaser.Physics.Arcade.Group;

  /** 地圖初始化 */
  public init(): void {
    // 獲取主場景Instance
    this.gameScene = this.scene as ParkourGameScene;
    if (this.gameScene === undefined) {
      console.error('ParkourGameScene.instance not exist!');
      return;
    }

    // 地圖靜態表資料List
    const mapObjectDataList = TableManager.parkourMapObject.getAll();
    if (mapObjectDataList === undefined) {
      console.error('無法獲取 TableManager.parkourMapObject 表格資料');
      return;
    }

    // 創建跳躍平台圖層
    const forest = this.addLayer(this.forestLayerConfig);
    if (forest) {
      forest.setDepth(ParkourDepth.LayerForest);
      // 註冊玩家與跳躍平台物理碰撞偵測
      this.addCollider(
        ParkourString.ColliderHeroGround,
        [this.gameScene.hero],
        forest,
        this.nullProcess,
        this.nullProcess
      );
    }

    // 創建鑽石群組
    this.diamondGroup = this.addMapObjectGroup(ParkourString.GroupDiamond, mapObjectDataList, [
      { tileType: ParkourString.TileTypeDiamond, classType: ParkourDiamond },
    ]);
    // 註冊玩家與鑽石物理重疊偵測
    this.addOverlap(
      ParkourString.ColliderHeroDiamond,
      this.gameScene.hero,
      [this.diamondGroup],
      this.onDiamondOverlapHero.bind(this),
      this.nullProcess
    );
    // 註冊磁鐵道具與鑽石物理重疊偵測
    this.addOverlap(
      ParkourString.ColliderMagnetDiamond,
      this.gameScene.magnet,
      [this.diamondGroup],
      this.onDiamondOverlapMagnet.bind(this),
      this.onDiamondProcessMagnet.bind(this)
    );

    // 創建地圖物件群組(障礙物、怪物、可破壞牆)
    this.mapObjectGroup = this.addMapObjectGroup(ParkourString.GroupMapObjects, mapObjectDataList, [
      { tileType: ParkourString.TileTypeObstacle, classType: ParkourObstacle },
      { tileType: ParkourString.TileTypeMonster, classType: ParkourEnemy },
      { tileType: ParkourString.TileTypeBreakWall, classType: ParkourBreakableWall },
    ]);

    // 微調縮放比例
    this.mapObjectGroup.getMatching('visible', true).forEach((object: ParkourMapObject) => {
      object.setScale(object.adjustScale);
    });

    // 註冊玩家與地圖物件物理重疊偵測
    this.addOverlap(
      ParkourString.ColliderHeroMapObject,
      this.gameScene.hero,
      [this.mapObjectGroup],
      this.onMapObjectOverlapHero.bind(this),
      this.onMapObjectProcessHero.bind(this)
    );
  }

  /** 玩家與鑽石重疊事件
   * 將鑽石從遊戲場景中隱藏，並增加分數
   * @param hero 玩家
   * @param diamond 鑽石物件
   */
  private onDiamondOverlapHero(hero: OverlapGameobject, diamond: OverlapGameobject): void {
    const parkourDiamond = diamond as ParkourDiamond;
    const score = parkourDiamond.score;
    const energy = parkourDiamond.energy;

    // 將此鑽石從物理群組中移除
    parkourDiamond.onHit(this.diamondGroup);

    // 得分
    this.gameScene.gainDiamondCount();
    this.gameScene.updateScore(score);
    this.gameScene.updateEnergy(energy, true);
  }

  /** 磁鐵與鑽石重疊事件
   * 將鑽石從遊戲場景中隱藏，並播放磁鐵收集動畫，然後增加分數
   * @param magnet 磁鐵
   * @param diamond 鑽石物件
   */
  private async onDiamondOverlapMagnet(magnet: OverlapGameobject, diamond: OverlapGameobject): Promise<void> {
    const parkourDiamond = diamond as ParkourDiamond;
    const score = parkourDiamond.score;
    const energy = parkourDiamond.energy;

    // 播放磁鐵收集動畫，並等待播放完畢
    await this.gameScene.magnet.playDiamonCollectAnim(parkourDiamond, this.diamondGroup);

    // 得分
    this.gameScene.gainDiamondCount();
    this.gameScene.updateScore(score);
    this.gameScene.updateEnergy(energy, true);
  }

  /** 判斷是否處理磁鐵與鑽石重疊事件
   * @param magnet 磁鐵
   * @param diamond 鑽石物件
   * @returns 若磁鐵道具開啟中，且鑽石尚未被隱藏，回傳True執行
   */
  private onDiamondProcessMagnet(magnet: OverlapGameobject, diamond: OverlapGameobject): boolean {
    // 檢查磁鐵是否為開啟狀態
    const magnetImage = magnet as Phaser.Physics.Arcade.Image;
    return magnetImage.visible;
  }

  /** 英雄與地圖物件重疊事件
   * @param hero 英雄
   * @param mapObject 地圖物件
   */
  private onMapObjectOverlapHero(hero: OverlapGameobject, mapObject: OverlapGameobject): void {
    // 遊戲表現
    this.gameScene.onHeroHitByMapObject(mapObject as ParkourMapObject, this.mapObjectGroup);
  }

  /** 判斷是否觸發英雄與地圖物件重疊事件
   * @param hero 英雄
   * @param mapObject 地圖物件
   * @returns true = 觸發
   */
  private onMapObjectProcessHero(hero: OverlapGameobject, mapObject: OverlapGameobject): boolean {
    const mapGameObject = mapObject as Phaser.GameObjects.GameObject;
    if (mapGameObject.state !== mapObjectState.triggered) {
      // 標記已觸發
      mapGameObject.setState(mapObjectState.triggered);
      return true;
    }
    return false;
  }

  /** 針對跑酷地圖物件資料來創建物件群組 group
   * @param groupName 自訂群組名稱，不可重複
   * @param mapObjectGroupConfigs Configs 包含要生成的類型、類別
   * @returns 物件群組 group
   */
  private addMapObjectGroup(
    groupName: ParkourString,
    mapObjectDataList: ParkourMapObjectData[],
    mapObjectGroupConfigs: MapObjectGroupConfig[]
  ): Phaser.Physics.Arcade.Group {
    const configs: Array<ObjectLayerConfig<ParkourString>> = [];
    for (const mapObjectGroupConfig of mapObjectGroupConfigs) {
      // 獲取與tileType對應的靜態表
      const datas = mapObjectDataList.filter((value: ParkourMapObjectData) => {
        // 以_切分成typeString，看第一段是否與tileType相同
        const typeString = value.tileType.split('_', 1);
        return typeString.length > 0 ? typeString[0] === mapObjectGroupConfig.tileType : false;
      });

      // 將靜態表轉換成ObjectLayerConfig
      for (const data of datas) {
        const config: ObjectLayerConfig<ParkourString> = {
          objectLayerName: ParkourString.ObjectLayerLevelForest,
          tilesetName: ParkourString.TilesetLevelForest,
          objectConfig: { key: data.nameKey, classType: mapObjectGroupConfig.classType },
          properties: { tileType: data.tileType },
        };
        configs.push(config);
      }
    }

    // 創建ObjectGroup
    const group = this.addObjectGroup(groupName, configs);
    // 設定深度
    group.setDepth(ParkourDepth.LayerMapObject);
    // 初始化地圖物件資料
    group.getChildren().forEach((mapObject: Phaser.GameObjects.GameObject) => {
      const data = mapObjectDataList.find(
        (mapObjectData: ParkourMapObjectData) => mapObjectData.tileType === mapObject.getData('tileType')
      );

      if (data) {
        (mapObject as ParkourMapObject).initData(data);
      }
    });
    return group;
  }
}
