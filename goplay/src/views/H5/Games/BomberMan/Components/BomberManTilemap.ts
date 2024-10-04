import BaseTilemap, { TileLayerConfig, GameObject } from '@/views/H5/Scripts/Components/Tilemap/BaseTilemap';
import BomberManGameScene from '../Scenes/BomberManGameScene';
import {
  BomberManString,
  BomberManNumber,
  BomberManDepth,
  TileObjectType,
  BomberManEnemyWaveData,
} from '../Data/BomberManConfig';
import { BomberManItemFunction, MapItemType, BlastType } from '../Data/BomberManConfig';
import DebugConfig from '../Data/BomberManDebugConfig';
import { CustomTileProperties } from '@/views/H5/Helper/PhaserTilemapHelper';
import BomberManHero from './BomberManHero';
import BomberManEnemy from './BomberManEnemy';
import BomberManItem from './BomberManItem';
import TableManager, {
  BomberManSettingData,
  BomberManStageData,
  BomberManEnemyData,
  HeroData,
} from '@/manager/TableManager';
import FileHelper from '@/views/H5/Helper/FileHelper';
import TableData from '@/manager/TableData';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { PathDirectionType } from '@/views/H5/Helper/TileMapPathFinder';
import { TotalProps } from '@/helper/interface/Game';
import BomberItemBtn from './UI/BomberItemBtn';
import BomberManBomb from './BomberManBomb';
import SoundPool from '../../Common/SoundPool';

export type Vector2 = Phaser.Math.Vector2;
export type ArcadeSprite = Phaser.Physics.Arcade.Sprite;
export type ArcadeGroup = Phaser.Physics.Arcade.Group;
export type Sprite = Phaser.GameObjects.Sprite;

type OverlapGameobject = Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile;

/** 炸彈超人-地磚地圖
 * Map格子數: 15x11
 * Tile大小: 48x48
 * Tile的屬性:
 *   type: string (要輸入MapObjectType字串)
 */
export default class BomberManTilemap extends BaseTilemap {
  //#region readonly
  /** 敵人死亡效果-位置 */
  private readonly enemyDeadFxPosition: Vector2 = new Phaser.Math.Vector2(0, 0);
  /** 敵人死亡效果-縮放 */
  private readonly enemyDeadFxScale: number = 0.5;
  /** 敵人死亡效果-秒數 */
  private readonly enemyDeadFxDuration: number = 1;

  /** 上浮字間隔秒數 */
  private readonly popupInterval: number = 0.5;

  //#region readonly

  //#region data
  private gameSetting!: BomberManSettingData;
  private gameScene!: BomberManGameScene;

  /** 敵人靜態表 */
  private enemyTableData!: Readonly<TableData<BomberManEnemyData>>;

  /** 地形圖層Config
   * 可將此遊戲對應的json檔案使用Tiled Editor打開對照參考
   */
  private readonly terrainLayerConfig: TileLayerConfig<BomberManString> = {
    tileLayerName: BomberManString.TileLayerTarrain,
    tilesetName: BomberManString.Tiles,
    tilesetKey: BomberManString.Tiles,
    properties: {},
  };

  /** 目前tile map地圖層級 */
  private _terrainLayer!: Phaser.Tilemaps.TilemapLayer;
  public get terrainLayer(): Phaser.Tilemaps.TilemapLayer {
    return this._terrainLayer;
  }

  /** 取得地圖的格子數(x軸) */
  public get terrainTileCountX(): number {
    return this._terrainLayer.layer.width;
  }
  /** 取得地圖的格子數(y軸) */
  public get terrainTileCountY(): number {
    return this._terrainLayer.layer.height;
  }

  /** 牆 陣列 */
  private _wallSpriteArray: ArcadeSprite[] = [];
  public get wallSpriteArray(): ArcadeSprite[] {
    return this._wallSpriteArray;
  }

  //#region enemy
  /** 敵人物件池 */
  public enemyPool!: Phaser.Physics.Arcade.Group;

  /** 波次計時器 */
  protected waveTimer?: Phaser.Time.TimerEvent;

  /** 敵人波次資料(0base) */
  private enemyWaveDataArray: BomberManEnemyWaveData[] = [];

  /** 波次間隔秒數 */
  private waveIntervalSec: number = 0;

  /** 敵人總波次 */
  public get totalWaveCount(): number {
    return this.enemyWaveDataArray.length;
  }

  /** 敵人目前波次索引 (0:未開始波次) */
  private currentWaveIndex = 0;
  /** 全部波次已清除完畢 */
  public isAllWaveCleared: boolean = false;
  //#endregion enemy

  /** 炸彈 物件池 */
  private bombPool!: Phaser.Physics.Arcade.Group;
  /** 炸彈爆風 物件池 */
  private blastPool!: Phaser.Physics.Arcade.Group;
  /** 效果動畫 物件池 */
  private fxSpritePool!: Phaser.GameObjects.Group;

  // 音效物件池
  /** 炸彈爆炸音效 */
  private bombExplosionSoundPool!: SoundPool;
  /** 撿取道具音效 */
  private gainItemSoundPool!: SoundPool;
  /** 殺敵音效 */
  private killEnemySoundPool!: SoundPool;
  /** 放炸彈音效 */
  private putBombSoundPool!: SoundPool;
  /** 撞敵人音效 */
  private hitEnemyoundPool!: SoundPool;
  /** 開盾撞敵人音效 */
  private shieldHitEnemySoundPool!: SoundPool;

  /** 已放置炸彈數量 */
  private putBombCount = 0;

  //#region 地圖物件map
  /** 已配置地圖物件 map
   * key: 格子座標文字(ex:1_1)
   * 值: 地圖物件類型
   */
  private tileObjectMap: Map<string, TileObjectType[]> = new Map<string, TileObjectType[]>();

  /** 不可走的地圖物件 */
  private readonly unwalkableTileObjectList: TileObjectType[] = [
    TileObjectType.Border,
    TileObjectType.River,
    TileObjectType.Wall,
    TileObjectType.Bomb,
  ];

  /** 敵人不可走的地圖物件 */
  private readonly enemyUnwalkableTileObjectList: TileObjectType[] = [
    ...this.unwalkableTileObjectList,
    TileObjectType.Blast,
  ];

  /** 阻擋爆風的地圖物件 */
  private readonly blockBlastTileObjectList: TileObjectType[] = [TileObjectType.Border, TileObjectType.Wall];
  //#endregion 地圖物件map

  /** 道具 物件池(物理) */
  private itemPool!: Phaser.Physics.Arcade.Group;

  /** 玩家英雄 */
  private _hero!: BomberManHero;
  public get hero(): BomberManHero {
    return this._hero;
  }

  /** 取得英雄的世界座標 */
  public get heroWorldXY(): Vector2 {
    // 未生成英雄時，用英雄出生點
    if (this._hero == null) {
      console.error(`_hero == null`);
      return Phaser.Math.Vector2.ZERO;
    }

    // 目前英雄位置
    return new Phaser.Math.Vector2(this._hero.x, this._hero.y);
  }

  /** 取得英雄的格子座標 */
  public get heroTileXY(): Vector2 {
    // 未生成英雄時，用英雄出生點
    if (this._hero == null) {
      return new Phaser.Math.Vector2(this.gameSetting.heroSpawnTileX, this.gameSetting.heroSpawnTileY);
    }

    // 目前英雄位置
    return this.worldXYToTileXY(this.heroWorldXY);
  }
  //#endregion data

  /** 建立地形地圖
   * @param stageData 關卡表
   * @param newGameSetting 遊戲設定
   */
  public create(heroData: HeroData, stageData: BomberManStageData, newGameSetting: BomberManSettingData): void {
    // 記錄遊戲設定
    this.gameSetting = newGameSetting;
    // 初始化
    this.init();

    // 記錄地圖上的物件
    this.initTileObjectMap();

    // 生成全部道具
    this.spawnAllItem(stageData.bonusItemIDList);

    // 生成牆
    this.spawnAllWall(stageData.wallDensity);

    // 建立英雄
    this.spawnHero(heroData);

    // 建立 炸彈物件池
    this.bombPool = this.gameScene.physics.add.group({
      classType: BomberManBomb,
      runChildUpdate: true,
    });

    // 建立 炸彈爆風物件池
    this.blastPool = this.gameScene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      runChildUpdate: true,
    });

    // 建立敵人物件池
    this.enemyPool = this.gameScene.physics.add.group({
      classType: BomberManEnemy,
      runChildUpdate: false,
    });

    // 建立 效果動畫物件池
    this.fxSpritePool = this.gameScene.add.group({
      classType: Phaser.GameObjects.Sprite,
      runChildUpdate: false,
    });

    /** 敵人靜態表 */
    this.enemyTableData = TableManager.bomberManEnemy;

    // 初始化波次資料
    this.initEnemyWaveData(stageData);

    // 註冊波次計時器
    this.registerWaveTimer();

    // 下一波次
    this.nextWave();

    // 註冊物理事件
    this.registerPhysicEvent();

    // 初始化音效
    this.initSoundPool();
  }

  /** 地圖初始化 */
  public init(): void {
    this.gameScene = this.scene as BomberManGameScene;
    if (this.gameScene === undefined) {
      console.error('BomberManGameScene.instance not exist!');
      return;
    }

    // 創建地形圖層
    const terrainLayer = this.addLayer(this.terrainLayerConfig);
    if (terrainLayer == null) {
      console.error(`terrainLayer == null`);
      return;
    }

    this._terrainLayer = terrainLayer;
    // 深度
    this._terrainLayer.depth = BomberManDepth.tarrainLayer;
    this.depth = BomberManDepth.tileMapContainer;
    // 縮放
    this._terrainLayer.setScale(BomberManNumber.mapScale);
  }

  //#region 物理
  /** 註冊物理事件 */
  public registerPhysicEvent(): void {
    // 檢查重疊: 玩家 vs 地圖物件-道具
    this.scene.physics.add.overlap(this._hero, this.itemPool, this.heroHitItem.bind(this));

    // 檢查重疊: 玩家 vs 敵人
    this.scene.physics.add.overlap(this._hero, this.enemyPool, this.heroHitEnemy.bind(this));

    // 檢查重疊: 玩家 vs 爆風
    this.scene.physics.add.overlap(this._hero, this.blastPool, this.heroHitBlast.bind(this));

    // 檢查重疊: 敵人 vs 爆風
    this.scene.physics.add.overlap(this.blastPool, this.enemyPool, this.enemyHitBlast.bind(this));

    // 檢查重疊: 爆風 vs 牆
    this.scene.physics.add.overlap(this.wallSpriteArray, this.blastPool, this.blastHitWall.bind(this));

    // 檢查重疊: 爆風 vs 炸彈
    this.scene.physics.add.overlap(this.blastPool, this.bombPool, this.blastHitBomb.bind(this));
  }

  /** 玩家 碰撞到 地圖物件-道具
   * @param heroObj 玩家
   * @param itemObj 道具
   */
  public heroHitItem(heroObj: OverlapGameobject, itemObj: OverlapGameobject): void {
    // 取得道具
    let item: BomberManItem | null = null;
    if (itemObj instanceof BomberManItem) {
      item = itemObj as BomberManItem;
    }
    if (item == null) {
      console.error(`heroHitItem: item is null`);
      return;
    }

    // 取得道具世界座標
    const itemWorldXY = new Phaser.Math.Vector2(item.x, item.y);
    // 計算道具格子座標
    const itemTileXY = this.worldXYToTileXY(itemWorldXY);

    // 若牆還在的話，就不能撿道具
    if (this.hasTileObjectInMap(itemTileXY, TileObjectType.Wall)) {
      return;
    }

    // 加入撿取的道具
    this.gameScene.passiveItemDialog.addItems(
      [
        {
          id: item.itemTableData.id,
          count: 1,
        } as TotalProps,
      ],
      BomberItemBtn,
      () => {
        return;
      } // 被動型item不會useitem
    );

    // 獲得道具被動能力
    this._hero.plusHeroItemLv(item.itemTableData.itemFunction, item.itemTableData.plusItemLv);

    // 增加分數
    this.gameScene.gainScore(this.gameSetting.pickItemScore, itemWorldXY);
    // 播放音效
    this.gainItemSoundPool.play();

    // 刪除地圖物件
    this.deleteTileObject(item, this.itemPool);

    // 刪除 已配置的地圖物件
    this.deleteTileObjectInMap(itemTileXY, TileObjectType.Item);
  }

  /** 玩家 碰撞到 敵人
   * @param heroObj 玩家
   * @param enemyObj 敵人
   */
  public heroHitEnemy(heroObj: OverlapGameobject, enemyObj: OverlapGameobject): void {
    if (DebugConfig.isLogHero) {
      console.log('heroHitEnemy');
    }

    // 敵人class轉型
    let enemy: BomberManEnemy | null = null;
    if (enemyObj instanceof BomberManEnemy) {
      enemy = enemyObj as BomberManEnemy;
    }
    if (enemy == null) {
      console.error(`heroHitBomb: enemy is null`);
      return;
    }

    // 殺死敵人
    this.destroyEnemy(enemy);

    // (計時道具)無敵 - buff
    if (this._hero.hasHeroBuff(BomberManItemFunction.Invincible)) {
      // 播放音效-開盾撞敵人
      this.shieldHitEnemySoundPool.play();
      return;
    }

    // 播放音效-撞敵人
    this.hitEnemyoundPool.play();

    // 已造成傷害，一定時間內不再造成傷害
    if (this._hero.isDamaged) {
      return;
    }

    // 當英雄受傷
    this.onHeroDamaged(this.gameSetting.heroHitEnemyDamage);
  }

  /** 玩家 碰撞到 爆風
   * @param heroObj 玩家
   * @param blastObj 爆風
   */
  public heroHitBlast(heroObj: OverlapGameobject, blastObj: OverlapGameobject): void {
    // (計時道具)爆風護盾-buff
    // (計時道具)無敵-buff
    // 已造成傷害，一定時間內不再造成傷害
    if (
      this._hero.hasHeroBuff(BomberManItemFunction.AntiBlast) ||
      this._hero.hasHeroBuff(BomberManItemFunction.Invincible) ||
      this._hero.isDamaged
    ) {
      return;
    }

    // 當英雄受傷
    this.onHeroDamaged(this.gameSetting.heroHitBlastDamage);
  }

  /** 敵人 碰撞到 爆風
   * @param blastObj 爆風
   * @param enemyObj 敵人
   */
  public async enemyHitBlast(blastObj: OverlapGameobject, enemyObj: OverlapGameobject): Promise<void> {
    // 取得敵人
    let enemy: BomberManEnemy | null = null;
    if (enemyObj instanceof BomberManEnemy) {
      enemy = enemyObj as BomberManEnemy;
    }
    if (enemy == null) {
      console.error(`enemyHitBlast: enemy is null`);
      return;
    }

    // 取得敵人世界座標
    const enemyWorldXY = new Phaser.Math.Vector2(enemy.x, enemy.y);

    // 殺死敵人
    this.destroyEnemy(enemy);

    // 加殺敵數
    this.gameScene.killEnemyCount++;

    // 增加分數
    this.gameScene.gainScore(enemy.enemyTableData.killEnemyScore, enemyWorldXY);
    // 播放音效
    this.killEnemySoundPool.play();

    // 暫停，讓tween分開
    await AsyncHelper.sleep(this.popupInterval);

    // 回復能量
    this.gameScene.updateEnergy(this.gameSetting.killEnemyGainEnergy, true, enemyWorldXY);
  }

  /** 地圖物件-爆風 重疊到 可摧毀牆
   * @param wallObj 牆
   * @param blastObj 爆風
   */
  public async blastHitWall(wallObj: OverlapGameobject, blastObj: OverlapGameobject): Promise<void> {
    // 取得牆物件
    let wallSprite: ArcadeSprite | null = null;
    if (wallObj instanceof Phaser.Physics.Arcade.Sprite) {
      wallSprite = wallObj as ArcadeSprite;
    }
    if (wallSprite == null) {
      console.error(`blastHitWall: wallSprite is null`);
      return;
    }

    // 計算世界座標
    const wallWorldPosition = new Phaser.Math.Vector2(wallSprite.x, wallSprite.y);

    // 計算格子座標
    const wallTilePosition = this.worldXYToTileXY(wallWorldPosition);

    // 用圖片判斷牆類型
    const isBrick = wallSprite.texture.key === BomberManString.BrickWallIcon;

    // 摧毀牆
    wallSprite.destroy();

    // 清除map中的物件記錄
    this.deleteTileObjectInMap(wallTilePosition, TileObjectType.Wall);

    // 生成炸毀磚牆動畫
    this.spawnDestroyWall(wallWorldPosition, isBrick);

    // 增加分數
    this.gameScene.gainScore(this.gameSetting.destroyWallScore, wallWorldPosition);

    // 暫停，讓tween分開
    await AsyncHelper.sleep(this.popupInterval);

    // 回復能量
    this.gameScene.updateEnergy(this.gameSetting.destroyWallGainEnergy, true, wallWorldPosition);
  }

  /** 爆風 重疊到 炸彈
   * @param blastObj 爆風
   * @param bombObj 炸彈
   */
  public blastHitBomb(blastObj: OverlapGameobject, bombObj: OverlapGameobject): void {
    // 取得炸彈
    let bomb: BomberManBomb | null = null;
    if (bombObj instanceof BomberManBomb) {
      bomb = bombObj as BomberManBomb;
    }
    if (bomb == null) {
      console.error(`blastHitBomb: bomb is null`);
      return;
    }

    // 計算格子座標
    const tilePosition = this.worldXYToTileXY(new Phaser.Math.Vector2(bomb.x, bomb.y));

    // 引爆炸彈
    this.onBombExplosion(bomb, tilePosition);
  }
  //#endregion 物理

  //#region 地圖物件
  /** 記錄地圖上的物件 */
  private initTileObjectMap(): void {
    // 找每一個格子，記錄物件
    for (let tileY = 0; tileY < this.terrainTileCountY; tileY++) {
      for (let tileX = 0; tileX < this.terrainTileCountX; tileX++) {
        // 取得地磚
        const tile = this._terrainLayer.getTileAt(tileX, tileY);
        // 防呆
        if (tile == null) {
          console.error(`initTileObjectMap: tile == null, x,y=${tileX}_${tileY}`);
          return;
        }
        if (tile.properties == null) {
          console.error(`initTileObjectMap: properties == null, x,y=${tileX}_${tileY}`);
          return;
        }

        // 地磚屬性存在
        if (tile && tile.properties) {
          // 取得屬性資料
          const tileProperty: CustomTileProperties = tile.properties as CustomTileProperties;
          // 將type字串轉型為enum
          const tileTypeText = tileProperty.tileType as keyof typeof TileObjectType;
          const tileTypeEnum = TileObjectType[tileTypeText];

          // 記錄地形到map
          this.setTileObjectInMap(new Phaser.Math.Vector2(tileX, tileY), tileTypeEnum);
        }
      }
    }
  }

  /** 生成地圖物件
   * @param config config
   */
  private spawnTileObject<T extends ArcadeSprite>(
    tileObject: T,
    depth: number,
    spriteScale: number = BomberManNumber.tileSpriteShowScale,
    colliderOffset: number = BomberManNumber.tileColliderOffset,
    colliderSize: number = BomberManNumber.tileColliderSize
  ): void {
    // 顯示圖片
    tileObject.setActive(true);
    tileObject.setVisible(true);
    // 不透明
    tileObject.alpha = 1;
    // 深度
    tileObject.setDepth(depth);

    // 設定物理參數
    if (tileObject.body) {
      // 啟用物理性質
      tileObject.body.enable = true;
      // 無重量
      tileObject.body.mass = 0;
      // 不移動
      tileObject.body.velocity.x = 0;
      tileObject.body.velocity.y = 0;
      // 碰撞區大小
      tileObject.body.setSize(colliderSize, colliderSize);
      // 碰撞區偏移
      tileObject.body.setOffset(colliderOffset, colliderOffset);
    }

    // 縮放
    tileObject.scale = spriteScale;
  }

  /** 刪除地圖物件
   * @param tileObject 地圖物件
   * @param pool 物件池
   */
  private deleteTileObject<T extends ArcadeSprite>(tileObject: T, pool: ArcadeGroup): void {
    // 返回物件池
    pool.killAndHide(tileObject);
    // 停止tween
    this.gameScene.tweens.killTweensOf(tileObject);

    // 停用物件
    tileObject.active = false;
    // 透明
    tileObject.alpha = 0;

    // 關掉物理性質
    if (tileObject.body) {
      tileObject.body.enable = false;
    }
  }

  /** 格子座標轉換成格子座標文字
   * @param tilePosition
   */
  private toTileMapObjectKey(tilePosition: Vector2): string {
    return `${tilePosition.x}_${tilePosition.y}`;
  }

  /** 格子座標文字轉換成格子座標
   * @param tileKey
   */
  private toTileXY(tileKey: string): Vector2 {
    const numberArray = tileKey.split('_');
    if (numberArray.length === 2) {
      return new Phaser.Math.Vector2(+numberArray[0], +numberArray[1]);
    }
    console.error(`numberArray.length !== 2`);
    return Phaser.Math.Vector2.ZERO;
  }

  /** 取得指定格子上的地圖物件
   * @param tilePosition
   */
  private getTileObject(tilePosition: Vector2): TileObjectType[] | undefined {
    const key = this.toTileMapObjectKey(tilePosition);
    return this.tileObjectMap.get(key);
  }

  /** 設定指定格子上的地圖物件
   * @param tilePosition
   * @param tileObject
   */
  private setTileObject(tilePosition: Vector2, tileObject: TileObjectType[]): void {
    const key = this.toTileMapObjectKey(tilePosition);
    this.tileObjectMap.set(key, tileObject);
  }

  /** 設定 已配置的地圖物件
   * @param tilePosition 格子座標
   * @param type 物件type
   */
  public setTileObjectInMap(tilePosition: Vector2, type: TileObjectType): void {
    // 防呆
    if (type === undefined) {
      console.error(`setTileObjectInMap: type === undefined, type=${type}`);
      return;
    }

    // 取得已有資料
    const list = this.getTileObject(tilePosition);
    // 新建一個陣列
    if (list == null) {
      this.setTileObject(tilePosition, [type]);
    }
    // 加入陣列
    else {
      // 檢查type已存在陣列中
      if (list.includes(type)) {
        console.error(`setObjectInMap: duplicate type=${type}, key=${JSON.stringify(tilePosition)}`);
        return;
      }

      // 將type加入陣列
      list.push(type);

      if (DebugConfig.isLogMapObj) {
        console.log(`setObjectInMap: type=${type}, key=${JSON.stringify(tilePosition)}, list=${JSON.stringify(list)}`);
      }

      // 更新map
      this.setTileObject(tilePosition, list);
    }
  }

  /** 刪除 已配置的地圖物件
   * @param tilePosition 格子座標
   * @param type 物件type
   */
  public deleteTileObjectInMap(tilePosition: Vector2, type: TileObjectType): void {
    // console.log(`deleteTileObjectInMap, type=${type}, pos=${JSON.stringify(tilePosition)}`);

    // 取得已有資料
    const tileObjectArray = this.getTileObject(tilePosition);
    // 沒有資料，回報error
    if (tileObjectArray == null) {
      console.error(`delObjectInMap: key=${JSON.stringify(tilePosition)} not found, type=${type}`);
      return;
    }

    // 檢查type已存在陣列中
    const tileIndex = tileObjectArray.indexOf(type);
    if (tileIndex === -1) {
      console.error(`delObjectInMap: type=${type} not found, key=${JSON.stringify(tilePosition)}`);
      return;
    }

    // 將type從陣列刪除
    tileObjectArray.splice(tileIndex, 1);
  }

  /** 取得 已配置的地圖物件
   * @param tileX 格子座標
   * @param tileY 格子座標
   */
  public getTileObjectInMap(tilePosition: Vector2): TileObjectType[] {
    // 取得已有資料
    return this.getTileObject(tilePosition) ?? [];
  }

  /** 檢查 某個座標上的地圖物件
   * @param tilePosition 格子座標
   * @param type 物件類型
   */
  public hasTileObjectInMap(tilePosition: Vector2, type: TileObjectType): boolean {
    // 取得已有資料
    const list = this.getTileObject(tilePosition);
    // 沒有資料就新建一個陣列
    if (list == null) {
      return false;
    }
    // 物件存在map中
    return list.includes(type);
  }

  /** 檢查格子是否可走
   * @param tileObjectList 檢查的格子的地圖物件類型
   * @param ignoreObjectList 忽略的地圖物件類型
   */
  public isTileWalkable(tileObjectList: TileObjectType[], ignoreObjectList: TileObjectType[] = []): boolean {
    // 檢查是否有不可走地圖物件類型，但不包含在忽略的清單中
    return (
      tileObjectList.findIndex((tileObject) => {
        return this.unwalkableTileObjectList.includes(tileObject) && ignoreObjectList.includes(tileObject) === false;
      }) < 0
    );
  }

  /** 檢查英雄是否可走到格子上
   * @param tilePosition 格子座標
   */
  public isTileWalkableByHero(tilePosition: Vector2): boolean {
    // 取得該格子的地圖物件陣列
    const tileObjectList = this.getTileObjectInMap(tilePosition);

    // 用英雄的buff。決定要忽略的地圖物件
    const ignoreObjectList: TileObjectType[] = [];

    // 在hero的格子上有牆
    const wallOnHero =
      this.heroTileXY.equals(tilePosition) && this.hasTileObjectInMap(this.heroTileXY, TileObjectType.Wall);

    // 若有穿牆buff
    if (
      this.hero.hasHeroBuff(BomberManItemFunction.ThroughWall) ||
      // 或 在hero的格子上有牆，
      wallOnHero
    ) {
      // 就忽略牆
      ignoreObjectList.push(TileObjectType.Wall);
    }

    // 若有穿彈item，就忽略炸彈
    if (this.hero.hasHeroBuff(BomberManItemFunction.ThroughBomb)) {
      ignoreObjectList.push(TileObjectType.Bomb);
    }

    // 檢查格子是否可走
    return this.isTileWalkable(tileObjectList, ignoreObjectList);
  }

  /** 檢查是牆的格子
   * @param tilePosition 格子座標
   */
  public isWallTile(tilePosition: Vector2): boolean {
    // 取得該格子的地圖物件陣列
    const tileObjectList = this.getTileObjectInMap(tilePosition);
    return tileObjectList.includes(TileObjectType.Wall);
  }

  /** 檢查是否可走到指定座標的格子上
   * @param tilePosition 格子座標
   */
  public isTileWalkableByEnemy(tilePosition: Vector2): boolean {
    // 取得該格子的地圖物件陣列
    const tileObjectList = this.getTileObjectInMap(tilePosition);

    // 檢查是否有不可走地圖物件類型，但不包含在忽略的清單中
    return (
      tileObjectList.findIndex((tileObject) => {
        return this.enemyUnwalkableTileObjectList.includes(tileObject);
      }) < 0
    );
  }

  /** 檢查格子是否阻擋爆風
   * @param tileObjectList 檢查的格子的地圖物件類型
   */
  public isTileBlockBlast(tileObjectList: TileObjectType[]): boolean {
    // 檢查是否有阻擋爆風的地圖物件類型
    return (
      tileObjectList.findIndex((tileObject) => {
        return this.blockBlastTileObjectList.includes(tileObject);
      }) !== -1
    );
  }

  /** 取得某節點在地圖上的鄰點格子座標(順時鐘)
   * @param currentTileXY 目前格子座標
   */
  public getNeighborTileXYArray(currentTileXY: Phaser.Math.Vector2): Phaser.Math.Vector2[] {
    return [
      this.getNeighborTileXY(currentTileXY, PathDirectionType.Up),
      this.getNeighborTileXY(currentTileXY, PathDirectionType.Right),
      this.getNeighborTileXY(currentTileXY, PathDirectionType.Down),
      this.getNeighborTileXY(currentTileXY, PathDirectionType.Left),
    ];
  }

  /** 取得指定方向的格子座標
   * @param currentTileXY 目前格子座標
   * @param moveDirection 方向
   */
  public getNeighborTileXY(currentTileXY: Vector2, moveDirection: PathDirectionType): Vector2 {
    switch (moveDirection) {
      case PathDirectionType.Up:
        return new Phaser.Math.Vector2(currentTileXY.x, currentTileXY.y - 1);
      case PathDirectionType.Down:
        return new Phaser.Math.Vector2(currentTileXY.x, currentTileXY.y + 1);
      case PathDirectionType.Left:
        return new Phaser.Math.Vector2(currentTileXY.x - 1, currentTileXY.y);
      case PathDirectionType.Right:
        return new Phaser.Math.Vector2(currentTileXY.x + 1, currentTileXY.y);
      case PathDirectionType.DownLeft:
        return new Phaser.Math.Vector2(currentTileXY.x - 1, currentTileXY.y + 1);
      case PathDirectionType.DownRight:
        return new Phaser.Math.Vector2(currentTileXY.x + 1, currentTileXY.y + 1);
      case PathDirectionType.UpLeft:
        return new Phaser.Math.Vector2(currentTileXY.x - 1, currentTileXY.y - 1);
      case PathDirectionType.UpRight:
        return new Phaser.Math.Vector2(currentTileXY.x + 1, currentTileXY.y - 1);
      default:
        console.error(`getNeighborTileXY: invalid direction=${moveDirection}`);
        return currentTileXY;
    }
  }

  /** 檢查兩格子的距離在 在指定範圍內
   * @param originTileIndex 起點格子
   * @param targetTileIndex 終點格子
   * @param distance 距離
   */
  private isTileInDistance(originTileIndex: Vector2, targetTileIndex: Vector2, distance: number): boolean {
    // 計算差值，並取絕對值
    const distanceX = Phaser.Math.Difference(targetTileIndex.x, originTileIndex.x);
    const distanceY = Phaser.Math.Difference(targetTileIndex.y, originTileIndex.y);
    // x及y軸在範圍內(正方形)
    return distanceX <= distance && distanceY <= distance;
  }

  /** 找出未使用格子
   * @param distance 與玩家距離
   */
  private findEmptyTile(distance: number): Vector2[] {
    // 空格陣列，代表未使用格子 (MAX=牆數量)
    const emptyTilePositionArray: Phaser.Math.Vector2[] = [];

    // 找每一個格子
    this.tileObjectMap.forEach((value, key) => {
      const tileXY = this.toTileXY(key);
      // 可走 && 不是玩家的鄰近格子
      if (this.isTileWalkable(value) && false === this.isTileInDistance(this.heroTileXY, tileXY, distance)) {
        // 加入陣列
        emptyTilePositionArray.push(tileXY);
      }
    });

    return emptyTilePositionArray;
  }

  /** 世界座標 轉 格子座標
   * @param worldXY 世界座標
   */
  public worldXYToTileXY(worldXY: Vector2): Vector2 {
    return this.terrainLayer.worldToTileXY(worldXY.x, worldXY.y);
  }

  /** 用格子索引，計算格子中央的像素座標x
   * @param tileXY 格子座標
   */
  public tileXYToWorldXYByScale(tileXY: Vector2): Vector2 {
    return super.tileXYToWorldXYByScale(tileXY, BomberManNumber.mapScale);
  }
  //#endregion 地圖物件

  //#region 牆
  /** 生成全部牆
   * 1.抽選可走格子，放牆
   * 2.道具的位置要放玻璃牆
   * @param stageData 關卡表
   */
  public spawnAllWall(wallDensity: number): void {
    if (DebugConfig.isLogMapObj) {
      console.log(`spawnAllWall`);
    }

    // 準備生成玻璃牆
    // 道具格子清單
    const itemPositionList: Vector2[] = [];

    // 找道具格子
    this.tileObjectMap.forEach((value, key) => {
      const tileXY = this.toTileXY(key);
      // 檢查格子類型
      if (value.includes(TileObjectType.Item)) {
        // 加入位置陣列
        itemPositionList.push(tileXY);
      }
    });

    // 依照位置，生成玻璃牆
    itemPositionList.forEach((itemPosition) => {
      this.spawnWall(itemPosition, false);
    });

    // 準備生成磚牆
    // 找出未使用格子
    const emptyTilePositionArray = this.findEmptyTile(this.gameSetting.spawnMapObjectDistance);

    // 依照密度 計算 牆的數量
    const wallCount = Math.round(emptyTilePositionArray.length * wallDensity);
    // 防呆
    if (wallCount > emptyTilePositionArray.length) {
      console.error(
        `spawnAllWall: space not enough! wallCount=${wallCount}, emptyTilePositionArray.length=${emptyTilePositionArray.length}`
      );
      return;
    }

    // 打亂順序
    Phaser.Utils.Array.Shuffle(emptyTilePositionArray);

    // 依照位置，生成磚牆
    for (let index = 0; index < wallCount; index++) {
      // 取得格子座標
      const tileXY = emptyTilePositionArray[index];
      // 生成磚牆
      this.spawnWall(tileXY, true);
    }
  }

  /** 生成牆
   * @param tilePosition 格子座標
   * @param isBrick true:磚牆, false:玻璃牆
   */
  private spawnWall(tilePosition: Vector2, isBrick: boolean): void {
    // 分為磚牆/玻璃牆
    const spriteName = isBrick ? BomberManString.BrickWallIcon : BomberManString.GlassWallIcon;

    // 計算像素座標
    const worldXY = this.tileXYToWorldXYByScale(tilePosition);

    // 加入物理連續圖(加入場景/物理清單)
    const wallTileObject = this.scene.physics.add.sprite(worldXY.x, worldXY.y, spriteName);
    if (wallTileObject == null) {
      console.error(`spawnWall: wallTileObject == null`);
      return;
    }
    // 加入 牆陣列
    this._wallSpriteArray.push(wallTileObject);

    // 生成地圖物件(只生成物理動畫)
    this.spawnTileObject(wallTileObject, BomberManDepth.wall);

    // 記錄物件到map
    this.setTileObjectInMap(tilePosition, TileObjectType.Wall);
  }

  /** 生成炸毀牆動畫
   * @param worldPosition 世界座標
   * @param isBrick true:磚牆, false:玻璃牆
   */
  private async spawnDestroyWall(worldPosition: Vector2, isBrick: boolean): Promise<void> {
    // 分為磚牆/玻璃牆
    const spriteName = isBrick ? BomberManString.DestroyBrickWall : BomberManString.DestroyGlassWall;

    // 加入物理連續圖(加入場景/物理清單)
    const destroyWallTileObject = this.scene.physics.add.sprite(worldPosition.x, worldPosition.y, spriteName);
    if (destroyWallTileObject == null) {
      console.error(`spawnDestroyWall: destroyWallTileObject == null`);
      return;
    }

    // 生成地圖物件(只生成物理動畫)
    this.spawnTileObject(destroyWallTileObject, BomberManDepth.wall);

    // 播放動畫
    destroyWallTileObject.anims.play(spriteName);

    // 等待播放秒數
    await AsyncHelper.sleep(BomberManNumber.destroyWallAnimSec);

    // 摧毀
    destroyWallTileObject.destroy();
  }
  //#endregion 牆

  //#region enemy
  /** 初始化波次資料 */
  private initEnemyWaveData(stageData: BomberManStageData): void {
    // 各波敵人id 轉數值陣列
    const enemyIDArray = stageData.waveEnemyIDList;
    // 各波敵人數量 轉數值陣列
    const enemyCountArray = stageData.waveEnemyCountList;

    // 陣列長度防呆
    if (enemyIDArray.length !== enemyCountArray.length) {
      console.error(`initEnemyWaveData: enemy id/count is different`);
      return;
    }

    // 存入波次陣次
    for (let index = 0; index < enemyIDArray.length; index++) {
      this.enemyWaveDataArray.push({
        enemyID: enemyIDArray[index],
        amount: enemyCountArray[index],
      } as BomberManEnemyWaveData);
    }

    // 波次間隔秒數
    this.waveIntervalSec = stageData.waveIntervalSec;
  }

  /** 註冊波次計時器
   * @param stageData 關卡表
   */
  private registerWaveTimer(): void {
    // 波次間隔時間填-1時，不處理
    if (this.waveIntervalSec === BomberManNumber.invalidId) {
      return;
    }

    // 定時設定移動目標
    this.waveTimer = this.gameScene.time.addEvent({
      loop: true,
      // 下一波次秒數 = 每一波的秒數 + 提示波次的秒數
      delay: (this.waveIntervalSec + this.gameSetting.nextWavePromptSec) * 1000,
      callback: () => {
        // 下一波次
        this.nextWave();
      },
    });
  }

  /** 下一波次 */
  private async nextWave(): Promise<void> {
    // 第二次後，要顯示波次提示, 播放完畢後生怪
    if (this.currentWaveIndex > 0) {
      await this.gameScene.showWavePrompt(this.gameSetting.nextWavePromptSec);
    }

    // 顯示波次提示
    this.gameScene.mainDialog.showWavePrompt(this.currentWaveIndex);

    // 產生敵人
    this.spawnAllEnemy();

    // 累加波次
    this.currentWaveIndex++;

    // 最後一波，不要使用波數timer，以使遊戲持續到time out
    if (this.currentWaveIndex >= this.totalWaveCount) {
      if (this.waveTimer) {
        this.gameScene.time.removeEvent(this.waveTimer);
        this.waveTimer.destroy();
        this.waveTimer = undefined;
      }
    }
  }

  /** 生成全部敵人 */
  private spawnAllEnemy(): void {
    // 防呆
    if (this.currentWaveIndex >= this.totalWaveCount) {
      console.error(`spawnAllEnemy: wave out of range, wave=${this.currentWaveIndex}`);
      return;
    }
    // 取得某波次的敵人
    const enemyData = this.enemyWaveDataArray[this.currentWaveIndex];

    // 找出未使用格子
    const emptyTilePositionArray = this.findEmptyTile(this.gameSetting.spawnEnemyDistance);

    // 打亂順序
    Phaser.Utils.Array.Shuffle(emptyTilePositionArray);

    // 依照位置，生成敵人
    for (let index = 0; index < enemyData.amount; index++) {
      // 取得格子座標
      const tileXY = emptyTilePositionArray[index];
      // 生成敵人
      this.spawnEnemy(tileXY, enemyData.enemyID);
    }
  }

  /** 生成敵人
   * @param tilePosition 格子座標
   * @param enemyID 敵人id
   */
  private spawnEnemy(tilePosition: Vector2, enemyID: number): void {
    // 取得敵人表
    const enemyData = this.enemyTableData.findOne(enemyID);
    if (enemyData == null) {
      console.error(`spawnEnemy: enemyTableData == null, id=${enemyID}`);
      return;
    }

    // 計算像素座標
    const worldXY = this.tileXYToWorldXYByScale(tilePosition);

    // 從物件池取出物件
    const enemyTileObject: BomberManEnemy = this.enemyPool.get(worldXY.x, worldXY.y, enemyData.url);
    if (enemyTileObject == null) {
      console.error(`spawnEnemy: enemyTileObject == null`);
      return;
    }

    // 設定敵人資料
    enemyTileObject.initEnemy(enemyData, this);
  }

  /** 殺死敵人
   * @param enemy 敵人
   */
  public destroyEnemy(enemy: BomberManEnemy): void {
    // 返回物件池
    this.enemyPool.killAndHide(enemy);
    // 停止tween
    this.gameScene.tweens.killTweensOf(enemy);

    // 播放敵人死亡效果
    this.playEnemyDeadFx(enemy);

    // 當敵人死亡
    enemy.onDestroy();

    // 若 是計時的波次 不處理
    if (this.waveTimer != null) {
      return;
    }

    // 若還有敵人, 不處理
    const childArray = this.enemyPool.getChildren();
    if (childArray.findIndex((child) => child.active) !== -1) {
      return;
    }

    // 若 是計算數量的波次 且 是最後一次，遊戲結束
    if (this.currentWaveIndex >= this.totalWaveCount) {
      // 全部波次已清除完畢
      this.isAllWaveCleared = true;
    }
    // 就進下一波
    else {
      this.nextWave();
    }
  }

  /** 設置死亡效果元件 */
  private async playEnemyDeadFx(enemy: BomberManEnemy): Promise<void> {
    // 取得效果動畫
    const fxSprite: Sprite = this.fxSpritePool.get();

    // 顯示物件
    fxSprite.setActive(true);
    fxSprite.setVisible(true);
    // 位置
    fxSprite.setPosition(enemy.x + this.enemyDeadFxPosition.x, enemy.y + this.enemyDeadFxPosition.y);
    // 縮放
    fxSprite.setScale(this.enemyDeadFxScale);
    // 深度
    fxSprite.setDepth(BomberManDepth.enemyDeadFx);
    // 播放動作
    fxSprite.play(BomberManString.EnemyDeadAnim);

    // 等待播完
    await AsyncHelper.sleep(this.enemyDeadFxDuration);

    // 返回物件池
    this.fxSpritePool.killAndHide(fxSprite);
  }
  //#endregion enemy

  //#region bomb
  /** 放置炸彈 */
  public putBomb(): void {
    // 沒有 超出可同時放置炸彈的數量上限 ，才能放置
    if (this.putBombCount >= this.hero.getHeroItemLv(BomberManItemFunction.BombCount)) {
      return;
    }

    // 不可走或爆風 不可放置炸彈
    const currentTileObject = this.getTileObjectInMap(this.heroTileXY);
    if (false === this.isTileWalkable(currentTileObject) || currentTileObject.includes(TileObjectType.Blast)) {
      return;
    }

    // 放炸彈扣除能量
    this.gameScene.updateEnergy(this.gameSetting.heroPutBombCost, true, this.heroWorldXY);

    // 生成炸彈
    this.spawnBomb(this.heroTileXY);
  }

  /** 生成炸彈
   * @param tilePosition 格子座標
   */
  private spawnBomb(tilePosition: Vector2): void {
    // 計算像素座標
    const worldXY = this.tileXYToWorldXYByScale(tilePosition);

    // 從物件池取出物件
    const bombTileObject: BomberManBomb = this.bombPool.get(worldXY.x, worldXY.y, BomberManString.BombSprite);
    if (bombTileObject == null) {
      console.error(`spawnBomb: bombTileObject == null`);
      return;
    }

    // 記錄這次的爆炸次數
    const lastExplosionCount = bombTileObject.explosionCount;

    // 生成地圖物件
    this.spawnTileObject(bombTileObject, BomberManDepth.bomb);

    // 已放置炸彈數量++
    this.putBombCount++;
    // 播放音效
    this.putBombSoundPool.play();

    // 播放動畫
    bombTileObject.anims.play(BomberManString.BombIdleAnim);

    // 記錄物件到map
    this.setTileObjectInMap(tilePosition, TileObjectType.Bomb);

    // 等待幾秒引爆
    const timeEvent = this.scene.time.addEvent({
      delay: this.gameSetting.bombExplosionSec * 1000,
      callback: () => {
        // 只有本次的爆炸要執行
        if (lastExplosionCount !== bombTileObject.explosionCount) {
          return;
        }

        // 已爆炸的炸彈
        if (bombTileObject.active === false) {
          return;
        }

        // 引爆炸彈
        this.onBombExplosion(bombTileObject, tilePosition);
        // 移除timeEvent
        this.scene.time.removeEvent(timeEvent);
      },
    });
  }

  /** 引爆炸彈
   * @param bomb 炸彈
   * @param bombPosition 格子座標
   */
  public onBombExplosion(bomb: BomberManBomb, bombPosition: Vector2): void {
    // 播放音效
    this.bombExplosionSoundPool.play();

    // 已放置炸彈數量--
    if (this.putBombCount > 0) {
      this.putBombCount--;
    }

    // 累加爆炸次數
    bomb.explosionCount++;

    // 刪除地圖物件
    this.deleteTileObject(bomb, this.bombPool);

    // 刪除 已配置的地圖物件
    this.deleteTileObjectInMap(bombPosition, TileObjectType.Bomb);

    // 生成爆風
    this.spawnBlastSet(bombPosition);
  }
  //#endregion bomb

  //#region 爆風
  /** 生成完整爆風
   * @param explodePosition 爆炸中心格子座標
   */
  public spawnBlastSet(explodePosition: Vector2): void {
    // 沒有爆風時，生成中央十字爆風
    if (false === this.hasTileObjectInMap(explodePosition, TileObjectType.Blast)) {
      // 生成圖片-中央十字
      this.spawnBlast(explodePosition, BlastType.Center, PathDirectionType.None);
    }

    const directionArray: PathDirectionType[] = [
      PathDirectionType.Up,
      PathDirectionType.Down,
      PathDirectionType.Left,
      PathDirectionType.Right,
    ];

    // 取得 英雄爆風加長lv
    const heroBlastLv = this.hero.getHeroItemLv(BomberManItemFunction.Blast);

    // 對4個方向生成爆風
    directionArray.forEach((direction) => {
      let spawnPostion = explodePosition;
      for (let i = 0; i < heroBlastLv; i++) {
        // 計算指定方向，前方一格的座標
        spawnPostion = this.getNeighborTileXY(spawnPostion, direction);

        // 檢查會阻擋爆風的地形，然後中止生成此方向的爆風
        if (this.hasTileObjectInMap(spawnPostion, TileObjectType.Border)) {
          break;
        }

        // 檢查已有爆風存在時，不生成該爆風，但可以生成後續爆風
        if (this.hasTileObjectInMap(spawnPostion, TileObjectType.Blast)) {
          continue;
        }

        // 預設為連接線
        let spriteType = BlastType.Link;
        // 端點圖
        if (i === heroBlastLv - 1) {
          spriteType = BlastType.EndPoint;
        }
        // 爆風重疊炸彈時，顯示中央十字圖
        else if (this.hasTileObjectInMap(spawnPostion, TileObjectType.Bomb)) {
          spriteType = BlastType.Center;
        }

        // 生成爆風圖片
        this.spawnBlast(spawnPostion, spriteType, direction);

        // 爆風炸到牆時: 可以生成爆風，並炸毀牆; 然後中止生成此方向的爆風
        if (this.hasTileObjectInMap(spawnPostion, TileObjectType.Wall)) {
          break;
        }
      }
    });
  }

  /** 生成爆風
   * @param blastTileXY 格子座標
   * @param spriteType 爆風圖類型
   * @param direction 方向
   */
  private async spawnBlast(blastTileXY: Vector2, spriteType: BlastType, direction: PathDirectionType): Promise<void> {
    // 取得爆風圖片
    const spriteName = this.getBlastSprite(spriteType);

    // 計算像素座標
    const worldXY = this.tileXYToWorldXYByScale(blastTileXY);

    // 從物件池取出物件
    const blastTileObject: ArcadeSprite = this.blastPool.get(worldXY.x, worldXY.y, spriteName);
    if (blastTileObject == null) {
      console.error(`spawnBlast: blastTileObject == null`);
      return;
    }

    // 生成地圖物件
    this.spawnTileObject(blastTileObject, BomberManDepth.blast);

    // 各方向旋轉角度
    switch (direction) {
      case PathDirectionType.None:
      case PathDirectionType.Left:
        blastTileObject.angle = 0;
        break;
      case PathDirectionType.Up:
        blastTileObject.angle = 90;
        break;
      case PathDirectionType.Right:
        blastTileObject.angle = 180;
        break;
      case PathDirectionType.Down:
        blastTileObject.angle = 270;
        break;
      default:
        console.error(`direction=${direction}`);
        break;
    }

    // 記錄物件到map
    this.setTileObjectInMap(blastTileXY, TileObjectType.Blast);

    // 取得動作key
    const aniKey = this.getBlastAnimKey(spriteType);
    // 播放動畫
    blastTileObject.anims.play(aniKey);

    // 倒數幾秒後刪除
    await AsyncHelper.sleep(BomberManNumber.blastDurationSec);

    // 刪除地圖物件
    this.deleteTileObject(blastTileObject, this.blastPool);

    // 刪除 已配置的地圖物件
    this.deleteTileObjectInMap(blastTileXY, TileObjectType.Blast);
  }

  /** 取得爆風圖片 */
  private getBlastSprite(spriteType: BlastType): string {
    switch (spriteType) {
      case BlastType.Center:
        return BomberManString.BlastCenterSprite;
      case BlastType.Link:
        return BomberManString.BlastLinkSprite;
      case BlastType.EndPoint:
        return BomberManString.BlastEndSprite;
      default:
        console.error(`getBlastSprite: undefine, spriteType=${spriteType}`);
        break;
    }
    return '';
  }

  /** 取得爆風動作 */
  private getBlastAnimKey(spriteType: BlastType): string {
    switch (spriteType) {
      case BlastType.Center:
        return BomberManString.BlastCenterIdleAnim;
      case BlastType.Link:
        return BomberManString.BlastLinkIdleAnim;
      case BlastType.EndPoint:
        return BomberManString.BlastEndIdleAnim;
      default:
        console.error(`getBlastAnimKey: undefine, spriteType=${spriteType}`);
        break;
    }
    return '';
  }

  /** 格子是否在爆風半徑中
   * @param tilePosition 格子座標
   */
  public isInBlastRadius(tilePosition: Vector2): boolean {
    // 爆風加長lv
    const blastLv = this.hero.getHeroItemLv(BomberManItemFunction.Blast);

    // 檢查4方向
    for (let arrow = PathDirectionType.Left; arrow <= PathDirectionType.Down; arrow++) {
      // 從起點開始找
      let forwardTile = tilePosition;

      // 檢查視野內的格子 (角色位置+爆風lv)
      for (let tileCount = 0; tileCount <= blastLv; tileCount++) {
        // 取得該格子的地圖物件陣列
        const forwardTileObject = this.getTileObjectInMap(forwardTile);
        // 該格子會阻擋爆風, 這個方向不會被炸到
        if (this.isTileBlockBlast(forwardTileObject)) {
          break;
        }
        // 該格子若是炸彈，會被炸到
        if (forwardTileObject.includes(TileObjectType.Bomb)) {
          return true;
        }
        // 取得前進的格子座標
        forwardTile = this.getNeighborTileXY(forwardTile, arrow);
      }
    }

    // 找不到炸彈
    return false;
  }
  //#endregion 爆風

  //#region item
  /** 生成全部道具
   * @param bonusItemIDList 地圖專用道具id清單
   */
  private spawnAllItem(bonusItemIDList: number[]): void {
    if (DebugConfig.isLogItem) {
      console.log(`spawnAllItem`);
    }

    // 建立 道具物件池
    this.itemPool = this.gameScene.physics.add.group({
      classType: BomberManItem,
      runChildUpdate: true,
    });

    // 找出未使用格子
    const emptyTilePositionArray = this.findEmptyTile(this.gameSetting.spawnMapObjectDistance);

    // 道具數 不能超過 可放道具格子數量
    if (bonusItemIDList.length > emptyTilePositionArray.length) {
      console.error(`spawnAllItem: out of empty tile`);
      return;
    }

    // 打亂順序
    Phaser.Utils.Array.Shuffle(emptyTilePositionArray);

    // 依預定生成道具的陣列，生成道具
    for (let index = 0; index < bonusItemIDList.length; index++) {
      // 取得格子座標
      const tileXY = emptyTilePositionArray[index];
      // 生成道具
      this.spawnItem(tileXY, bonusItemIDList[index]);
    }
  }

  /** 生成 道具
   * @param tilePosition 格子座標
   * @param itemID 道具id
   */
  private spawnItem(tilePosition: Vector2, itemID: number): void {
    if (DebugConfig.isLogItem) {
      console.log(`spawnItem: pos=${tilePosition.x},${tilePosition.y}`);
    }

    // 取得道具靜態表
    const itemTableData = TableManager.bomberManItem.findOne(itemID);
    if (itemTableData == null) {
      console.error(`spawnItem: itemTableData == null, id=${itemID}`);
      return;
    }

    // 只能生成地圖專用的道具
    if (itemTableData.isMapItem !== MapItemType.MapItem) {
      console.error(`spawnItem: isMapItem fail, itemID=${itemID}`);
      return;
    }

    if (DebugConfig.isLogItem) {
      console.log(`spawnItem: itemID=${itemID}`);
    }

    // 取得道具圖片KEY
    const spriteName = itemTableData.nameKey;

    // 計算像素座標
    const worldXY = this.tileXYToWorldXYByScale(tilePosition);

    // 從物件池取出物件
    const itemTileObject: BomberManItem = this.itemPool.get(worldXY.x, worldXY.y, spriteName);
    if (itemTileObject == null) {
      console.error(`spawnItem: itemTileObject == null`);
      return;
    }

    // 建立 道具
    itemTileObject.itemTableData = itemTableData;

    // 生成地圖物件
    this.spawnTileObject(
      itemTileObject,
      BomberManDepth.item,
      BomberManNumber.itemSpriteShowScale,
      BomberManNumber.itemColliderOffset,
      BomberManNumber.itemColliderSize
    );

    // 記錄物件到map
    this.setTileObjectInMap(tilePosition, TileObjectType.Item);
  }
  //#endregion item

  //#region 英雄
  /** 生成英雄 */
  private spawnHero(heroData: HeroData): void {
    if (DebugConfig.isLogHero) {
      console.log(`spawnHero`);
    }

    // 英雄出生點
    const heroSpawnTileXY = new Phaser.Math.Vector2(this.gameSetting.heroSpawnTileX, this.gameSetting.heroSpawnTileY);

    // 計算像素座標
    const worldXY = this.tileXYToWorldXYByScale(heroSpawnTileXY);

    // 新增物件
    this._hero = new BomberManHero(this.scene, worldXY.x, worldXY.y, BomberManString.HeroSpriteWalkKey);
    if (this._hero == null) {
      console.error(`spawnHero: hero == null`);
      return;
    }

    // 設置英雄資料
    this._hero.initHero(heroData, this.gameSetting, this);
  }

  /** 當英雄受傷
   * @param damageAmount 傷害值
   */
  private onHeroDamaged(damageAmount: number): void {
    // 記錄傷害，並在一段時間內阻擋傷害
    this.hero.setBlockDamage();

    // 扣能量
    this.gameScene.updateEnergy(damageAmount, true, this.heroWorldXY);

    // 播放閃爍效果
    this.hero.playFlickerTween();
  }
  //#endregion 英雄

  /** 初始化音效 */
  private initSoundPool(): void {
    // 設置音效
    this.bombExplosionSoundPool = new SoundPool(this.gameScene, BomberManString.AudioBombExplosion);
    if (this.bombExplosionSoundPool == null) {
      console.error('bombExplosionSoundPool == null');
      return;
    }
    this.gainItemSoundPool = new SoundPool(this.gameScene, BomberManString.AudioGainItem);
    if (this.gainItemSoundPool == null) {
      console.error('gainItemSoundPool == null');
      return;
    }
    this.killEnemySoundPool = new SoundPool(this.gameScene, BomberManString.AudioKillEnemy);
    if (this.killEnemySoundPool == null) {
      console.error('killEnemySoundPool == null');
      return;
    }
    this.putBombSoundPool = new SoundPool(this.gameScene, BomberManString.AudioPutBomb);
    if (this.putBombSoundPool == null) {
      console.error('putBombSoundPool == null');
      return;
    }

    this.hitEnemyoundPool = new SoundPool(this.scene, BomberManString.AudioHitEnemy);
    if (this.hitEnemyoundPool == null) {
      console.error('hitEnemyoundPool == null');
      return;
    }
    this.shieldHitEnemySoundPool = new SoundPool(this.scene, BomberManString.AudioShieldHitEnemy);
    if (this.shieldHitEnemySoundPool == null) {
      console.error('shieldHitEnemySoundPool == null');
      return;
    }
  }
}
