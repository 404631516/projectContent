import { CustomTileProperties } from '@/views/H5/Helper/PhaserTilemapHelper';
import BaseTilemap, { ObjectLayerConfig, TileLayerConfig } from '@/views/H5/Scripts/Components/Tilemap/BaseTilemap';
import { CombatNumber } from '@/helper/enum/Combat';
import HeroUniverseGameScene from '../Scenes/HeroUniverseGameScene';
import { HeroUniverseString } from '../Data/HeroUniverseConfig';
import HeroUniverseMapObstacle from './HeroUniverseMapObstacle';
import { HeroUniverseHero } from './HeroUniverseHero';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import PhaserHelper from '@/views/H5/Helper/PhaserHelper';
import HeroUniverseNpc from './HeroUniverseNpc';

type OverlapGameObject = Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile;

/** 因雄宇宙專用TileType */
enum HeroUniverseTileType {
  /** 重疊NPC */
  OnOverlapNpc = 'onOverlapNpc',
  /** 點擊NPC */
  OnClickNpc = 'onClickNpc',
  /** 重疊傳送門 */
  OnOverlapPortal = 'onOverlapPortal',
  /** 點擊傳送門 */
  OnClickPortal = 'onClickPortal',
  /** 出生點 */
  SpawnPoint = 'spawnPoint',
  /** 障礙物 */
  Obstacle = 'obstacle',
}

/** Tile事件 */
export enum HeroUniverseEvent {
  // ---NPC---
  /** 戰鬥 */
  Battle = 'battle',
  /** 任務 */
  Quest = 'quest',

  // ---傳送門---
  /** 傳送地圖 */
  Transport = 'transport',
  /** 重導向網頁 */
  Redirect = 'redirect',

  // ---重生點---
  /** 飛船 */
  Ship = 'ship',
  /** 角色 */
  Character = 'character',
}

/** 因雄宇宙Tile客製屬性 */
interface HeroUniverseTileProperties extends CustomTileProperties {
  /** 因雄宇宙專用TileType */
  tileType: HeroUniverseTileType;
  /** 事件 */
  event: HeroUniverseEvent;
  /** 事件ID */
  eventId: number;
  /** ID */
  id: number;
}

export default class HeroUniverseTilemap extends BaseTilemap {
  //#region declare、readonly
  /** 因雄宇宙遊戲場景 */
  public declare scene: HeroUniverseGameScene;
  /** 英雄與NPC對話距離 */
  private readonly interactDistance = 200;
  /** 遊戲緩衝時間 */
  private readonly bufferTimeMillisecond = 1000;
  //#endregion declare、readonly

  //#region 地圖config
  /** 地圖圖層(主要基底) */
  private readonly tileLayerConfig: TileLayerConfig<HeroUniverseString> = {
    tileLayerName: HeroUniverseString.TileLayer,
    tilesetName: HeroUniverseString.Tileset,
    tilesetKey: HeroUniverseString.Tileset,
    properties: {},
  };

  /** 裝飾物圖層 */
  private readonly decorationLayerConfig: ObjectLayerConfig<HeroUniverseString> = {
    objectLayerName: HeroUniverseString.DecorationLayer,
    tilesetName: HeroUniverseString.Tileset,
    objectConfig: {},
    properties: {},
  };

  /** 障礙物圖層 */
  private readonly obstacleLayerConfig: ObjectLayerConfig<HeroUniverseString> = {
    objectLayerName: HeroUniverseString.ObstacleLayer,
    tilesetName: HeroUniverseString.Tileset,
    objectConfig: {},
    properties: { tileType: HeroUniverseString.Obstacle },
  };

  /** 出生點圖層(選擇英雄或飛船及出生位置) */
  private readonly spawnLayerConfig: ObjectLayerConfig<HeroUniverseString> = {
    objectLayerName: HeroUniverseString.SpawnLayer,
    tilesetName: HeroUniverseString.Tileset,
    objectConfig: {},
    properties: { tileType: HeroUniverseString.SpawnPoint },
  };

  /** 傳送門圖層的點擊觸發式傳送門 */
  private readonly onClickPortalLayerConfig: ObjectLayerConfig<HeroUniverseString> = {
    objectLayerName: HeroUniverseString.PortalLayer,
    tilesetName: HeroUniverseString.Tileset,
    objectConfig: {},
    properties: { tileType: HeroUniverseString.OnClickPortal },
  };

  /** 傳送門圖層的重疊觸發式傳送門 */
  private readonly onOverlapPortalLayerConfig: ObjectLayerConfig<HeroUniverseString> = {
    objectLayerName: HeroUniverseString.PortalLayer,
    tilesetName: HeroUniverseString.Tileset,
    objectConfig: {},
    properties: { tileType: HeroUniverseString.OnOverlapPortal },
  };

  /** NPC圖層的點擊觸發式NPC */
  private readonly onClickNpcLayerConfig: ObjectLayerConfig<HeroUniverseString> = {
    objectLayerName: HeroUniverseString.NpcLayer,
    tilesetName: HeroUniverseString.Tileset,
    objectConfig: { classType: HeroUniverseNpc },
    properties: { tileType: HeroUniverseString.OnClickNpc },
  };

  /** NPC圖層的重疊觸發式NPC */
  private readonly onOverlapNpcLayerConfig: ObjectLayerConfig<HeroUniverseString> = {
    objectLayerName: HeroUniverseString.NpcLayer,
    tilesetName: HeroUniverseString.Tileset,
    objectConfig: { classType: HeroUniverseNpc },
    properties: { tileType: HeroUniverseString.OnOverlapNpc },
  };
  //#endregion 地圖config

  //#region properties
  /** 地圖圖層 */
  private _layer!: Phaser.Tilemaps.TilemapLayer;
  public get layer(): Phaser.Tilemaps.TilemapLayer {
    return this._layer;
  }
  /** 傳送門上一幀是否與英雄重疊 */
  private isPortalOverlapWithHeroLastFrame = true;
  /** NPC上一幀是否與英雄重疊 */
  private isNpcOverlapWithHeroLastFrame = true;
  /** 遊戲緩衝時間 */
  private currentPastTimeMillisecond = 0;
  // #endregion properties

  //#region 物件群組
  /** 英雄群組 */
  private heroGroup!: Phaser.Physics.Arcade.Group;
  /** 障礙物群組 */
  private obstacleGroup!: Phaser.Physics.Arcade.Group;
  /** 出生點群組 */
  private spawnPointGroup!: Phaser.Physics.Arcade.Group;
  /** 點擊觸發式傳送門群組 */
  private onClickPortalGroup!: Phaser.Physics.Arcade.Group;
  /** 重疊觸發式傳送門群組 */
  private onOverlapPortalGroup!: Phaser.Physics.Arcade.Group;
  /** 點擊觸發式NPC群組 */
  private onClickNpcGroup!: Phaser.Physics.Arcade.Group;
  /** 重疊觸發式NPC群組 */
  private onOverlapNpcGroup!: Phaser.Physics.Arcade.Group;
  // #endregion 物理群組

  public init(): void {
    // 添加基本圖層
    const layer = this.addLayer(this.tileLayerConfig);
    if (layer === undefined) {
      this.scene.scene.stop();
      Helper.assert(ErrorId.TilemapParseFailed, `找不到地圖圖層: ${this.tileLayerConfig.tileLayerName}`);
      return;
    }

    this._layer = layer;
    // 設置基本圖層深度
    this.layer.setDepth(-this.layer.height);

    // 初始化物件群組
    this.initObjectGroups();

    // 調整基本圖層、物件至螢幕正中央
    this.setPositionXY(-this.layer.width / 2, -this.layer.height / 2);

    // 初始化障礙物
    this.initTileLayerObstacle();

    // 獲取場景英雄群組
    const heroGroup = this.scene.groups.getGroup(HeroUniverseHero.name) as Phaser.Physics.Arcade.Group;
    if (heroGroup === undefined) {
      this.scene.scene.stop();
      Helper.assert(ErrorId.TilemapParseFailed, `找不到英雄群組: ${HeroUniverseHero.name}`);
      return;
    }
    this.heroGroup = heroGroup;

    // 設置英雄障礙物碰撞
    this.setColliderObstacleWithHero();
    // 設置傳送門點擊偵測
    this.setClickPortalWithPointer();
    // 設置Npc點擊偵測
    this.setClickNpcWithPointer();

    // 設置物件特效
    this.setObjectsEffect();
  }

  update(time: number, delta: number): void {
    // 遊戲緩衝時間未到，不執行互動
    if (this.currentPastTimeMillisecond < this.bufferTimeMillisecond) {
      this.currentPastTimeMillisecond += delta;
      return;
    }

    // 處理傳送門與英雄重疊事件
    this.isPortalOverlapWithHeroLastFrame = PhaserHelper.updateOnOverlapEnter(
      this.scene,
      this.heroGroup,
      this.onOverlapPortalGroup,
      this.isPortalOverlapWithHeroLastFrame,
      this.onOverlapPortalWithHero.bind(this),
    );

    // 處理NPC與英雄重疊事件
    this.isNpcOverlapWithHeroLastFrame = PhaserHelper.updateOnOverlapEnter(
      this.scene,
      this.heroGroup,
      this.onOverlapNpcGroup,
      this.isNpcOverlapWithHeroLastFrame,
      this.onOverlapNpcWithHero.bind(this),
    );
  }

  /** 初始化全部物件群組 */
  private initObjectGroups(): void {
    // 創建裝飾物
    this.addObjectGroup(HeroUniverseString.DecorationLayer, [this.decorationLayerConfig]);
    // 創建障礙物
    this.obstacleGroup = this.addObjectGroup(HeroUniverseString.ObstacleLayer, [this.obstacleLayerConfig]);
    this.obstacleGroup.getChildren().forEach((obstacle: Phaser.GameObjects.GameObject) => {
      const body = obstacle.body as Phaser.Physics.Arcade.Body;
      // 障礙物不可移動
      body.setImmovable(true);
      // 障礙物表面光滑
      body.setFriction(0, 0);
    });

    // 創建出生點
    this.spawnPointGroup = this.addObjectGroup(HeroUniverseString.SpawnPoint, [this.spawnLayerConfig]);
    if (this.spawnPointGroup.getLength() !== 1) {
      this.scene.scene.stop();
      Helper.assert(ErrorId.TilemapParseFailed, `出生點數量不正確，地圖創建失敗.`);
      return;
    }

    // 創建OnClickPortal
    this.onClickPortalGroup = this.addObjectGroup(HeroUniverseString.OnClickPortal, [this.onClickPortalLayerConfig]);

    // 創建OnOverlapPortal
    this.onOverlapPortalGroup = this.addObjectGroup(HeroUniverseString.OnOverlapPortal, [
      this.onOverlapPortalLayerConfig,
    ]);

    // 創建OnClickNpc
    this.onClickNpcGroup = this.addObjectGroup(HeroUniverseString.OnClickNpc, [this.onClickNpcLayerConfig]);
    this.onClickNpcGroup.runChildUpdate = true;

    // 創建OnOverlapNpc
    this.onOverlapNpcGroup = this.addObjectGroup(HeroUniverseString.OnOverlapNpc, [this.onOverlapNpcLayerConfig]);
    this.onOverlapNpcGroup.runChildUpdate = true;

    // 調整顯示深度
    this.objectGroups.forEach((objectGroup: Phaser.GameObjects.Group) => {
      objectGroup.setDepth(-this.layer.height);
    });
  }

  /** 初始化基本圖層障礙物 */
  private initTileLayerObstacle(): void {
    // 創建障礙物
    this.layer.getTilesWithin().forEach((tile: Phaser.Tilemaps.Tile) => {
      // 獲取tileType
      const tileProperties = tile.properties as CustomTileProperties;
      const tileType = tileProperties.tileType;
      // 獲取不到tileType，不創建
      if (tileType == null) {
        return;
      }
      // tileType不符合障礙物類型，不創建
      if (tileType !== HeroUniverseString.Obstacle) {
        return;
      }
      // 從現有障礙物群組創建障礙物
      const obstacle = this.scene.groups.createMemberFromGroup<HeroUniverseMapObstacle>(HeroUniverseMapObstacle.name);
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
      if (upContactTile && upContactTile.properties.tileType === HeroUniverseString.Obstacle) {
        // 移除上緣collision
        obstacle.body.checkCollision.up = false;
      }
      // 檢查下接點是否有相連障礙物
      const downContactTile = this.layer.getTileAtWorldXY(obstacle.x, obstacle.y + CombatNumber.TileSize);
      if (downContactTile && downContactTile.properties.tileType === HeroUniverseString.Obstacle) {
        // 移除下緣collision
        obstacle.body.checkCollision.down = false;
      }
      // 檢查左接點是否有相連障礙物
      const leftContactTile = this.layer.getTileAtWorldXY(obstacle.x - CombatNumber.TileSize, obstacle.y);
      if (leftContactTile && leftContactTile.properties.tileType === HeroUniverseString.Obstacle) {
        // 移除左緣collision
        obstacle.body.checkCollision.left = false;
      }
      // 檢查右接點是否有相連障礙物
      const rightContactTile = this.layer.getTileAtWorldXY(obstacle.x + CombatNumber.TileSize, obstacle.y);
      if (rightContactTile && rightContactTile.properties.tileType === HeroUniverseString.Obstacle) {
        // 移除右緣collision
        obstacle.body.checkCollision.right = false;
      }
    });
  }

  /** 設置英雄與障礙物碰撞 */
  private setColliderObstacleWithHero(): void {
    // 取得英雄與障礙物群組
    const heroGroup = this.scene.groups.getGroup(HeroUniverseHero.name) as Phaser.Physics.Arcade.Group;
    const obstacleGroup = this.scene.groups.getGroup(HeroUniverseMapObstacle.name) as Phaser.Physics.Arcade.Group;

    // 英雄與障礙物做碰撞
    this.addCollider(
      HeroUniverseString.ColliderObstacleWithHero,
      [heroGroup],
      [obstacleGroup, this.obstacleGroup],
      this.nullProcess,
      this.nullProcess,
    );
  }

  /** 英雄與傳送門重疊時執行
   * @param hero 英雄
   * @param portal 傳送門
   */
  private onOverlapPortalWithHero(hero: OverlapGameObject, portal: OverlapGameObject): void {
    this.interactWithPortal(portal);
  }

  /** 傳送門點擊偵測 */
  private setClickPortalWithPointer(): void {
    this.onClickPortalGroup.getChildren().forEach((portal: Phaser.GameObjects.GameObject) => {
      // 開啟與pointer互動
      portal.setInteractive({ useHandCursor: true });
      // 綁定點擊事件
      portal.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer, x: number, y: number) => {
        const isInteractingWithDOM = pointer.event.target !== this.scene.game.canvas;
        if (isInteractingWithDOM) {
          return;
        }

        this.interactWithPortal(portal);
      });
    });
  }

  /** 與傳送門互動
   * @param portal 傳送門
   */
  private async interactWithPortal(portal: Phaser.GameObjects.GameObject | OverlapGameObject): Promise<void> {
    const portalSprite = portal as Phaser.Physics.Arcade.Sprite;
    const properties = portalSprite.data.getAll() as HeroUniverseTileProperties;

    // 重新導向到別的網頁路由 或 傳送到其他張地圖
    if (properties.event === HeroUniverseEvent.Redirect) {
      const portalRedirectData = this.scene.getPortalRedirectData(properties.eventId);
      if (portalRedirectData === undefined) {
        Helper.assert(ErrorId.TableDataNotFound, `找不到對應的傳送門重定向資料: ${properties.eventId}`);
        return;
      }

      this.scene.pauseScene();
      await this.scene.heroUniverseWeb.redirect(portalRedirectData.url);
      this.scene.resumeScene();
    } else if (properties.event === HeroUniverseEvent.Transport) {
      this.scene.pauseScene();
      this.scene.heroUniverseWeb.transport(properties.eventId, portalSprite.getCenter());
    }
  }

  /** 設置英雄與Npc重疊偵測 */
  private setOverlapNpcWithHero(): void {
    // 取得英雄群組
    const heroGroup = this.scene.groups.getGroup(HeroUniverseHero.name) as Phaser.Physics.Arcade.Group;

    // 重疊偵測
    this.addOverlap(
      HeroUniverseString.OverlapNpcWithHero,
      [heroGroup],
      [this.onOverlapNpcGroup],
      this.onOverlapNpcWithHero.bind(this),
      this.nullProcess,
    );
  }

  /** 英雄與npc重疊時執行
   * @param hero 英雄
   * @param npc npc
   */
  private onOverlapNpcWithHero(hero: OverlapGameObject, npc: OverlapGameObject): void {
    const heroUniverseNpc = npc as HeroUniverseNpc;
    this.interactWithNpc(heroUniverseNpc);
  }

  /** NPC點擊偵測 */
  private setClickNpcWithPointer(): void {
    this.onClickNpcGroup.getChildren().forEach((npcGameObject: Phaser.GameObjects.GameObject) => {
      // 設置深度隨y軸變化
      const npc = npcGameObject as HeroUniverseNpc;
      npc.setDepth(npc.y);
      // 開啟與pointer互動
      npc.setInteractive({ useHandCursor: true });
      // 綁定點擊事件
      npc.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer, x: number, y: number) => {
        // 計算npc與玩家之間的距離
        const distance = Phaser.Math.Distance.Between(
          npc.x,
          npc.y,
          this.scene.heroPosition.x,
          this.scene.heroPosition.y,
        );

        // 距離過遠不處理
        if (distance > this.interactDistance) {
          return;
        }

        // 與網頁DOM互動不處理
        const isInteractingWithDOM = pointer.event.target !== this.scene.game.canvas;
        if (isInteractingWithDOM) {
          return;
        }

        this.interactWithNpc(npc);
      });
    });
  }

  /** 與NPC互動
   * @param npc npc sprite
   */
  private async interactWithNpc(npc: HeroUniverseNpc): Promise<void> {
    this.scene.pauseScene();

    // 開啟網頁對話框
    await this.scene.heroUniverseWeb.openNpcDialog(npc.npcId, this.scene.heroPosition);

    this.scene.resumeScene();

    // 下一幀更新狀態
    this.scene.events.once(Phaser.Scenes.Events.UPDATE, () => {
      for (const group of [this.onClickNpcGroup, this.onOverlapNpcGroup]) {
        group.getChildren().forEach((npcGameObject: Phaser.GameObjects.GameObject) => {
          const heroUniverseNpc = npcGameObject as HeroUniverseNpc;
          // 更新狀態
          heroUniverseNpc.updateStatus();
        });
      }
    });
  }

  /** 設置物件特效 */
  private setObjectsEffect(): void {
    // 設置傳送門特效
    for (const group of [this.onClickPortalGroup, this.onOverlapPortalGroup]) {
      group.getChildren().forEach((portal: Phaser.GameObjects.GameObject) => {
        const portalSprite = portal as Phaser.Physics.Arcade.Sprite;
        const properties = portal.data.getAll() as HeroUniverseTileProperties;
        // 沒有特效ID，不設置特效
        if (properties.id === 0 || properties.id === undefined) {
          return;
        }

        const effectData = this.scene.getPortalEffectData(properties.id);
        if (effectData === undefined) {
          this.scene.scene.stop();
          Helper.assert(ErrorId.TableDataNotFound, `找不到對應的傳送門效果資料: ${properties.id}`);
          return;
        }

        // 計算特效大小以符合原Tile大小
        effectData.fromScale = portalSprite.height / effectData.frameSize;
        effectData.toScale = portalSprite.height / effectData.frameSize;

        // 播放特效
        AnimationHelper.setTweenFromEffectData(portalSprite, effectData, false);
        // 替換特效後須手動重整body大小
        portalSprite.body?.setSize(portalSprite.width, portalSprite.height, true);
      });
    }

    // 設置NPC特效
    for (const group of [this.onClickNpcGroup, this.onOverlapNpcGroup]) {
      group.getChildren().forEach((npcGameObject: Phaser.GameObjects.GameObject) => {
        // 設置深度隨y軸變化
        const npc = npcGameObject as HeroUniverseNpc;
        npc.setDepth(npc.y);

        const npcId: number = npc.getData('id');
        // 沒有設置ID，不做任何處理
        if (npcId === 0) {
          return;
        }

        const npcData = this.scene.getNpcData(npcId);
        if (npcData === undefined) {
          this.scene.scene.stop();
          Helper.assert(ErrorId.TableDataNotFound, `找不到對應的NPC資料: ${npcId}`);
          return;
        }

        const effectData = this.scene.getNpcEffectData(npcData.effectId);
        if (effectData === undefined) {
          this.scene.scene.stop();
          Helper.assert(ErrorId.TableDataNotFound, `找不到對應的NPC效果資料: ${npcId}`);
          return;
        }

        npc.setEffect(effectData);
        npc.setDisplayName(npcData.name);
        // 下一幀更新狀態
        this.scene.events.once(Phaser.Scenes.Events.UPDATE, () => {
          npc.updateStatus();
        });
      });
    }
  }

  /** 取得英雄的類型，用來判斷是飛船還是角色 */
  public getHeroType(): HeroUniverseEvent {
    const tileProperties = this.spawnPointGroup.getFirstAlive().data.getAll() as HeroUniverseTileProperties;
    return tileProperties.event as HeroUniverseEvent;
  }

  /** 取得英雄出生位置 */
  public getHeroSpawnPosition(): Phaser.Types.Math.Vector2Like {
    return this.spawnPointGroup.getFirstAlive().getCenter();
  }
}
