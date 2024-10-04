import UIManager from '../../../Scripts/Manager/UIManager';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import TableManager, {
  EffectData,
  HeroData,
  HeroUniverseNpcData,
  HeroUniversePortalRedirectData,
  HeroUniverseTileMapData,
} from '@/manager/TableManager';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { CharacterAnimType, CharacterType } from '@/helper/enum/PhaserGame';
import { HeroUniverseGameData } from '@/helper/interface/Game';
import { IHeroUniverseWeb } from '../../Common/PhaserGameStrategy';
import { heroUniverseImgUrl, heroUniverseJsonUrl } from '../Data/HeroUniverseResourceData';
import { HeroUniverseHero } from '../Component/HeroUniverseHero';
import HeroUniverseGroups from '../Component/HeroUniverseGroups';
import HeroUniverseTilemap from '../Component/HeroUniverseTilemap';
import { HeroUniverseNumber, HeroUniverseString } from '../Data/HeroUniverseConfig';
import HeroUniverseBackgroundDialog from '../Dialogs/HeroUniverseBackgroundDialog';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import HeroUniverseGuiDialog from '../Dialogs/HeroUniverseGuiDialog';
import PhaserHelper from '@/views/H5/Helper/PhaserHelper';

export default class HeroUniverseGameScene extends BaseGameScene {
  //#region readonly
  /** 使用到的英雄動畫類別 */
  private readonly heroAnimTypes = [CharacterAnimType.Idle, CharacterAnimType.Walk];
  /** UI縮放 */
  public readonly uiScale = 1 / HeroUniverseNumber.CameraZoom;
  //#endregion readonly

  //#region 串接網路端資料/靜態表資料
  /** 英雄靜態資料 */
  private heroData!: HeroData;
  /** 地圖靜態資料 */
  private tileMapData!: HeroUniverseTileMapData;
  /** 地圖傳送門特效靜態資料Map */
  private portalEffectDataMap!: Map<number, EffectData>;
  /** 地圖傳送門重新導向靜態資料Map */
  private portalRedirectDataMap!: Map<number, HeroUniversePortalRedirectData>;
  /** 地圖NPC特效靜態資料Map */
  private npcEffectDataMap!: Map<number, EffectData>;
  /** 地圖NPC靜態資料Map */
  private npcDataMap!: Map<number, HeroUniverseNpcData>;
  //#endregion 串接網路端資料/靜態表資料

  //#region 遊戲內元件
  /** 英雄 */
  private hero!: HeroUniverseHero;
  /** 英雄位置 */
  public get heroPosition(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.hero.x, this.hero.y);
  }
  /** 地圖 */
  private tilemap!: HeroUniverseTilemap;
  /** 群組管理 */
  private _groups!: HeroUniverseGroups;
  public get groups(): HeroUniverseGroups {
    return this._groups;
  }
  /** GUI */
  private guiDialog!: HeroUniverseGuiDialog;
  public get gui(): HeroUniverseGuiDialog {
    return this.guiDialog;
  }
  //#endregion 遊戲內元件

  //#region 動態世界寬高、顯示深度
  /** 世界上邊緣Y */
  public get worldTopEdgeY(): number {
    return -this.physics.world.bounds.height / 2;
  }
  /** 世界下邊緣Y */
  public get worldBottomEdgeY(): number {
    return this.physics.world.bounds.height / 2;
  }
  /** 世界左邊緣X */
  public get worldLeftEdgeX(): number {
    return -this.physics.world.bounds.width / 2;
  }
  /** 世界右邊緣X */
  public get worldRightEdgeX(): number {
    return this.physics.world.bounds.width / 2;
  }
  /** UI顯示深度 */
  public get uiDepth(): number {
    return this.physics.world.bounds.height;
  }
  //#endregion 動態世界寬高、顯示深度

  /** 遊戲是否要結束 */
  public get isGameEnd(): boolean {
    return false;
  }

  //#region constructor、Phaser function
  constructor(private readonly gameData: HeroUniverseGameData, public readonly heroUniverseWeb: IHeroUniverseWeb) {
    super({ key: 'HeroUniverseGameScene' + gameData.mapId });
  }

  async preload() {
    // 開啟loading dialog
    UIManager.instance.openDialog(LoadingDialog, this);
    // 載入地圖
    this.initMapData();
    // 載入英雄資料
    await this.initHeroData();
  }

  create() {
    // 設定特效
    this.setEffect();
    // 設定群組
    this.setGroups();
    // 設定英雄
    this.setHero();
    // 設定地圖、世界大小、邊界碰撞
    this.setMap();
    // 關閉loading dialog
    UIManager.instance.closeDialog(LoadingDialog, this);
  }

  protected fixedUpdate(time: number, delta: number) {
    this.tilemap.update(time, delta);
  }
  //#endregion constructor、Phaser function

  //#region init data
  /** 載入地圖 */
  private initMapData(): void {
    // 取得地圖靜態資料
    const tileMapData = TableManager.heroUniverseMap.findOne(this.gameData.mapId);
    if (tileMapData === undefined) {
      this.scene.stop();
      Helper.assert(ErrorId.TableNotFound, `無法載入地圖，地圖id:${this.gameData.mapId}`);
      return;
    }

    // 儲存地圖靜態資料
    this.tileMapData = tileMapData;

    // 取得地圖NPC靜態資料
    const npcDataList = TableManager.heroUniverseNpc.getAll();
    if (npcDataList === undefined) {
      this.scene.stop();
      Helper.assert(ErrorId.TableNotFound, `無法載入NPC靜態資料`);
      return;
    }

    // 儲存地圖NPC靜態資料map
    this.npcDataMap = new Map(npcDataList.map((value: HeroUniverseNpcData) => [value.id, value]));

    // 取得地圖傳送門特效靜態資料
    const portalEffectDataList = TableManager.heroUniversePortalEffect.getAll();
    if (portalEffectDataList === undefined) {
      this.scene.stop();
      Helper.assert(ErrorId.TableNotFound, `無法載入傳送門特效靜態資料`);
      return;
    }

    // 載入地圖傳送門特效
    portalEffectDataList.forEach((effectData: EffectData) => {
      const effectDataUrl = `${heroUniverseImgUrl}/portalEffect/${effectData.url}`;

      this.load.spritesheet(effectData.nameKey, PhaserHelper.ensureVersionedResourceUrl(effectDataUrl), {
        frameWidth: effectData.frameSize,
        frameHeight: effectData.frameSize,
      });
    });
    // 儲存地圖傳送門特效資料map
    this.portalEffectDataMap = new Map(portalEffectDataList.map((value: EffectData) => [value.id, value]));

    // 取得地圖傳送門重新導向靜態資料
    const portalRedirectDataList = TableManager.heroUniversePortalRedirect.getAll();
    if (portalRedirectDataList === undefined) {
      this.scene.stop();
      Helper.assert(ErrorId.TableNotFound, `無法載入傳送門重新導向靜態資料`);
      return;
    }

    // 儲存地圖傳送門重新導向資料map
    this.portalRedirectDataMap = new Map(
      portalRedirectDataList.map((value: HeroUniversePortalRedirectData) => [value.id, value]),
    );

    // 取得地圖NPC特效靜態資料
    const npcEffectDataList = TableManager.heroUniverseNpcEffect.getAll();
    if (npcEffectDataList === undefined) {
      this.scene.stop();
      Helper.assert(ErrorId.TableNotFound, `無法載入NPC特效靜態資料`);
      return;
    }

    // 載入地圖NPC特效
    npcEffectDataList.forEach((effectData: EffectData) => {
      const effectDataUrl = `${heroUniverseImgUrl}/npcEffect/${effectData.url}`;

      this.load.spritesheet(effectData.nameKey, PhaserHelper.ensureVersionedResourceUrl(effectDataUrl), {
        frameWidth: effectData.frameSize,
        frameHeight: effectData.frameSize,
      });
    });
    // 儲存地圖NPC特效資料map
    this.npcEffectDataMap = new Map(npcEffectDataList.map((value: EffectData) => [value.id, value]));

    // 將地圖載入Phaser備用
    this.load.tilemapTiledJSON(
      this.tileMapData.nameKey,
      PhaserHelper.ensureVersionedResourceUrl(`${heroUniverseJsonUrl}/${this.tileMapData.url}`),
    );

    // 將地圖背景載入Phaser備用
    if (this.tileMapData.backgroundUrl !== HeroUniverseString.None) {
      this.load.image(
        this.tileMapData.backgroundUrl,
        PhaserHelper.ensureVersionedResourceUrl(`${heroUniverseImgUrl}/${this.tileMapData.backgroundUrl}`),
      );
    }

    // 將地圖Tileset載入Phaser備用
    this.load.spritesheet(
      HeroUniverseString.Tileset,
      PhaserHelper.ensureVersionedResourceUrl(`${heroUniverseImgUrl}/${this.tileMapData.tilesetUrl}`),
      {
        frameWidth: HeroUniverseNumber.TileSize,
        frameHeight: HeroUniverseNumber.TileSize,
      },
    );
  }

  /** 載入英雄 */
  private async initHeroData(): Promise<void> {
    // 儲存英雄靜態資料
    this.heroData = this.heroUniverseWeb.heroData;

    // 動態載入英雄動畫
    this.heroAnimTypes.forEach((animType: CharacterAnimType) => {
      AnimationHelper.loadCharacterSprite(this, this.heroData, CharacterType.Hero, animType);
    });
  }
  //#endregion init data

  //#region create
  /** 設定特效動畫 */
  private setEffect(): void {
    // 創建特效動畫以供後續使用
    for (const effectDataMap of [this.portalEffectDataMap, this.npcEffectDataMap]) {
      effectDataMap.forEach((effectData: EffectData) => {
        AnimationHelper.createSpriteAnimFromEffectData(this, effectData);
      });
    }
  }

  /** 設定群組管理 */
  private setGroups(): void {
    // 創建群組管理
    this._groups = new HeroUniverseGroups(this);
    this.groups.init();
  }

  /** 設定英雄 */
  private setHero(): void {
    // 設置英雄動畫
    this.heroAnimTypes.forEach((animType: CharacterAnimType) =>
      AnimationHelper.createCharacterAnim(this, this.heroData, animType),
    );

    // 創建英雄Instance
    const hero = this.groups.createMemberFromGroup<HeroUniverseHero>(HeroUniverseHero.name);
    if (hero === undefined) {
      console.error(`HeroUniverseGameScene.setHero 無法創建英雄Instance.`);
      return undefined;
    }
    this.hero = hero;
    // 初始化英雄
    this.hero.init(this.heroData);
  }

  /** 設定地圖及遊戲世界大小 */
  private setMap(): void {
    // 創建地圖
    this.tilemap = new HeroUniverseTilemap(this, 0, 0, this.tileMapData.nameKey);
    this.tilemap.init();

    // 依照地圖調整遊戲世界大小
    this.physics.world.setBounds(
      -this.tilemap.layer.width / 2,
      -this.tilemap.layer.height / 2,
      this.tilemap.layer.width,
      this.tilemap.layer.height,
    );
    // 設置遊戲世界邊界碰撞(防止角色超出遊戲邊界)
    this.physics.world.setBoundsCollision();
    // 設置英雄邊界碰撞
    this.hero.body.collideWorldBounds = true;
    this.hero.body.onWorldBounds = true;

    // 設置鏡頭跟隨玩家操控的英雄
    this.cameras.main.setZoom(HeroUniverseNumber.CameraZoom);
    this.cameras.main.startFollow(this.hero);
    this.cameras.main.setFollowOffset(0, -HeroUniverseNumber.CameraOffsetY);

    // 設置鏡頭邊界
    this.cameras.main.setBounds(
      -this.tilemap.layer.width / 2,
      -this.tilemap.layer.height / 2,
      this.tilemap.layer.width,
      this.tilemap.layer.height,
    );

    // 設定地圖背景
    const backgroundDialog = UIManager.instance.openDialog(HeroUniverseBackgroundDialog, this);
    backgroundDialog.setDepth(-this.tilemap.layer.height - 1);
    backgroundDialog.setSize(this.physics.world.bounds.width, this.physics.world.bounds.height);
    backgroundDialog.setPosition(-backgroundDialog.width / 2, -backgroundDialog.height / 2);
    backgroundDialog.setBG(this.tileMapData.backgroundUrl);

    // 設定Gui
    this.guiDialog = UIManager.instance.openDialog(HeroUniverseGuiDialog, this);
    this.guiDialog.setDepth(this.uiDepth);
    this.guiDialog.setScale(this.uiScale);
    this.guiDialog.setPosition(
      (1 - this.uiScale) * (this.guiDialog.width / 2),
      (1 - this.uiScale) * (this.guiDialog.height / 2),
    );
    // 顯示當前地圖名稱
    this.guiDialog.addText(this.tileMapData.name, this.guiDialog.width / 2, 20, {
      fontSize: '30px',
    });

    // 設置英雄要顯示成飛船或是角色
    this.hero.setHeroType(this.tilemap.getHeroType());

    // 假如有指定英雄出生位置，從指定點出生，沒有指定的話從地圖重生點出生
    const spawnPosition = this.gameData.location || this.tilemap.getHeroSpawnPosition();
    this.hero.setX(spawnPosition.x);
    this.hero.setY(spawnPosition.y);
  }
  //#endregion create

  //#region function
  /**
   * 取得傳送門對應特效資料
   * @param id 傳送門特效ID
   * @returns 傳送門對應特效資料
   */
  public getPortalEffectData(id: number): EffectData | undefined {
    return this.portalEffectDataMap.get(id);
  }

  /**
   * 取得傳送門重新導向資料
   * @param id 傳送門重新導向ID
   * @returns 傳送門重新導向資料
   */
  public getPortalRedirectData(id: number): HeroUniversePortalRedirectData | undefined {
    return this.portalRedirectDataMap.get(id);
  }

  /**
   * 取得NPC特效資料
   * @param id NPC特效ID
   * @returns NPC特效資料
   */
  public getNpcEffectData(id: number): EffectData | undefined {
    return this.npcEffectDataMap.get(id);
  }

  /**
   * 取得NPC資料
   * @param id NPC ID
   * @returns NPC資料
   */
  public getNpcData(id: number): HeroUniverseNpcData | undefined {
    return this.npcDataMap.get(id);
  }
  //#endregion function
}
