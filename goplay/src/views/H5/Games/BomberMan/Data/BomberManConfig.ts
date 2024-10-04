/** 地圖物件類型 */
export enum TileObjectType {
  // 地形
  /** 道路 */
  Road = 1,
  /** 邊界 */
  Border,
  /** 河 */
  River,

  // 地圖物件
  /** 牆 */
  Wall,
  // 寶物
  Item,
  /** 炸彈 */
  Bomb,
  /** 炸彈爆風 */
  Blast,
}

/** 敵人移動模式 */
export enum EnemyMoveType {
  /** 隨機決定移動模式(會抽選其他移動模式) */
  Random = 0,
  /** 隨機移動，排除不可走 */
  RandomForWalkable,
  /** 沿著牆走(沿左邊) */
  AlongWall,
  /** 遇牆向右/左轉 */
  TurnWhenHitWall,
  /** 追蹤英雄 */
  SearchHero,
  Max,
}

/** 物品功能類型 */
export enum BomberManItemFunction {
  None,
  /** 爆風加長 */
  Blast,
  /** 炸彈數增加 */
  BombCount,
  /** 輪滑鞋-增加移動速度 */
  MoveSpeed,
  /** 穿越磚塊 */
  ThroughWall,
  /** 穿越炸彈 */
  ThroughBomb,
  /** 爆風護盾 */
  AntiBlast,
  /** 無敵 */
  Invincible,
  Max,
}
/** 炸彈超人-字串常數 */
export enum BomberManString {
  //#region 資源

  //#region images
  // 主畫面ui
  /** 開啟音樂鈕 */
  SoundOnIcon = 'soundOnIcon',
  /** 關閉音樂鈕 */
  SoundOffIcon = 'soundOffIcon',

  /** 放置炸彈按鈕-背景圖 */
  PutBombBtnBg = 'PutBombBtnBg',
  /** 放置炸彈按鈕 (讀取item圖) */
  PutBombBtn = 'bomber_item_bombCount',
  /** 主動技能標籤 */
  ActiveSkillTag = 'ActiveSkillTag',
  /** 被動技能標籤 */
  PassiveSkillTag = 'PassiveSkillTag',
  /** 技能提示-背景圖 */
  SkillTipBg = 'SkillTipBg',
  /** 漸層圖 */
  GradientGrayCenter = 'GradientGrayCenter',
  GradientGrayBottom = 'GradientGrayBottom',
  GradientGrayRight = 'GradientGrayRight',
  GradientPurple = 'GradientPurple',
  GradientRed = 'GradientRed',
  GradientYellow = 'GradientYellow',
  /** 波次提示icon */
  WavePromptIcon = 'WavePromptIcon',
  /** 波次提示-背景圖 */
  WavePromptBG = 'WavePromptBG',

  /** 地圖-地形層 */
  TileLayerTarrain = 'bomber',

  /** 地圖的圖片合圖 */
  Tiles = 'tileset',

  /** 地圖物件-可摧毀的牆 圖片 */
  BrickWallIcon = 'WallIcon',
  /** 地圖物件-玻璃牆 圖片 */
  GlassWallIcon = 'GlassWallIcon',

  /** 穿越牆壁-粒子圖 */
  ImageParticleThroughWall = 'ImageParticleThroughWall',
  /** 穿越炸彈-粒子圖 */
  ImageParticleThroughBomb = 'ImageParticleThroughBomb',
  // /** 爆炸粒子圖 */
  // ImageParticlesExplosion = 'ImageParticlesExplosion',
  /** 防護罩效果-爆風護盾 */
  AntiBlastEffect = 'AntiBlastEffect',
  /** 防護罩效果-無敵 */
  InvincibleEffect = 'InvincibleEffect',
  /** 敵人死亡效果-動畫圖 */
  EnemyDeadFX = 'EnemyDeadFX',
  //#endregion images

  //#region spriteSheet

  //#region 角色

  /** 英雄動畫key-walk */
  HeroSpriteWalkKey = 'HeroSpriteWalk',
  /** 英雄動畫key-idle */
  HeroSpriteIdleKey = 'HeroSpriteIdle',

  /** 玩家動畫-左(右)/上/下 */
  HeroSprite = 'hero',

  /** 敵人動畫 */
  EnemySprite = 'enemy',

  //#endregion 角色

  //#region bomb
  /** 炸彈動畫 */
  BombSprite = 'BombSprite',
  /** 炸彈動畫JSON */
  BombAnimsJson = 'BombAnimsJson',
  /** 炸彈動作 */
  BombIdleAnim = 'BombIdle',
  //#endregion bomb

  //#region blast
  /** 炸彈爆風動畫-末端 */
  BlastEndSprite = 'BlastEndSprite',
  /** 炸彈爆風動畫-連接線 */
  BlastLinkSprite = 'BlastLinkSprite',
  /** 炸彈爆風動畫-中央十字 */
  BlastCenterSprite = 'BlastCenterSprite',

  /** 炸彈爆風動畫JSON */
  BlastAnimsJson = 'BlastAnimsJson',
  /** 炸彈爆風動作-末端 */
  BlastEndIdleAnim = 'BlastEndIdle',
  /** 炸彈爆風動作炸彈爆風動作-連接線 */
  BlastLinkIdleAnim = 'BlastLinkIdle',
  /** 炸彈爆風動畫-中央十字 */
  BlastCenterIdleAnim = 'BlastCenterIdle',
  //#endregion blast

  //#region 炸毀牆
  /** 炸毀磚牆 */
  DestroyBrickWall = 'DestroyBrickWall',
  /** 炸毀玻璃牆 */
  DestroyGlassWall = 'DestroyGlassWall',
  //#endregion 炸毀牆

  /** 敵人死亡動畫，需對應Json檔資料 */
  EnemyDeadAnim = 'EnemyDeadAnim',
  /** 其他動畫 */
  AnimsJson = 'AnimsJson',
  //#endregion spriteSheet

  //#region audio
  /** 炸彈爆炸音效 */
  AudioBombExplosion = 'AudioBombExplosion',
  /** 撿取道具音效 */
  AudioGainItem = 'AudioGainItem',
  /** 殺敵音效 */
  AudioKillEnemy = 'AudioKillEnemy',
  /** 放炸彈音效 */
  AudioPutBomb = 'AudioPutBomb',
  /** 撞敵人音效 */
  AudioHitEnemy = 'AudioHitEnemy',
  /** 開盾撞敵人音效 */
  AudioShieldHitEnemy = 'AudioShieldHitEnemy',

  /** 使用道具音效-穿牆 */
  AudioThroughWall = 'AudioThroughWall',
  /** 使用道具音效-穿越炸彈 */
  AudioThroughBomb = 'AudioThroughBomb',
  /** 使用道具音效-爆風護盾 */
  AudioAntiBlast = 'AudioAntiBlast',
  /** 使用道具音效-無敵 */
  AudioInvincible = 'AudioInvincible',
  //#endregion audio

  //#region json
  /** 地圖的json檔名 = (前置) + 地圖編號(mapJsonId)
   * ex: TileMap1
   */
  TileMap = 'TileMap',
  //#endregion json

  //#region Particle
  /** 噴酒粒子特效 Particle Manager */
  ParticleEmitterSpray = 'ParticleEmitterSpray',
  /** 發射器Configs: 儲存所有小遊戲中使用到的發射器Config資料 */
  ParticleEmitterConfigs = 'ParticleEmitterConfigs',
  //#endregion Particle

  //#endregion 資源

  //#region 地圖物件
  /** 牆動畫JSON */
  WallAnimsJson = 'WallAnimsJson',
  //#endregion 地圖物件
}

/** 炸彈超人-數值常數 */
export enum BomberManNumber {
  //#region common
  invalidId = -1,
  /** 格子大小 */
  tileSize = 64,
  /** 傷害間隔的秒數
   * PS: 要超過爆風的持續時間 blastDurationSec
   */
  damageIntervalSec = 0.5,
  /** 地圖縮放比 */
  mapScale = 0.72,

  /** 碰撞區縮減值，以免重疊鄰居格子 */
  tileColliderReduceSize = 2,
  /** 一般地圖物件-動畫縮放 */
  tileSpriteScale = 1,
  /** 一般地圖物件-顯示時動畫縮放 */
  tileSpriteShowScale = tileSpriteScale * mapScale,
  /** 一般地圖物件-碰撞區偏移 */
  tileColliderOffset = 0,
  /** 一般地圖物件-碰撞區範圍 */
  tileColliderSize = tileSize / tileSpriteScale - tileColliderReduceSize,
  //#endregion common

  //#region item
  /** 道具-動畫縮放 */
  itemSpriteScale = 0.5,
  /** 道具-顯示時動畫縮放 */
  itemSpriteShowScale = itemSpriteScale * mapScale,
  /** 道具-碰撞區偏移 */
  itemColliderOffset = 0,
  /** 道具-碰撞區範圍 */
  itemColliderSize = tileSize / itemSpriteScale - tileColliderReduceSize,
  //#endregion item

  //#region hero
  /** 角色-動畫縮放 */
  heroSpriteScale = 0.4,
  /** 角色-顯示時動畫縮放 */
  heroSpriteShowScale = heroSpriteScale * mapScale,
  /** 角色-圖片偏移 */
  heroSpriteOffsetY = -7,
  /** 角色-碰撞區範圍 (要稍微縮小以免重疊鄰居格子) */
  heroColliderSize = tileSize * mapScale - 16,
  //#endregion hero

  //#region enemy
  /** 角色-動畫縮放 */
  enemySpriteScale = 0.55,
  /** 角色-顯示時動畫縮放 */
  enemySpriteShowScale = enemySpriteScale * mapScale,
  /** 角色-圖片偏移 */
  enemySpriteOffsetY = 3,
  /** 角色-碰撞區範圍 (要稍微縮小以免重疊鄰居格子) */
  enemyColliderSize = tileSize * mapScale - tileColliderReduceSize,

  /** 敵人移動時，每走幾格，就強制尋找英雄進行移動 */
  enemyForceSearchHeroIntervalTile = 3,
  //#endregion enemy

  /** 走路動畫FrameRate */
  walkFrameRate = 5,

  /** 炸彈爆風持續秒數 */
  blastDurationSec = 0.5,

  /** 炸牆動畫秒數 */
  destroyWallAnimSec = 1,
}

/** 深度定義 */
export enum BomberManDepth {
  /** 偵錯 */
  debug = 100,
  /** 計時器ui */
  timerDialog = 30,
  /** 主畫面ui(container)(含進場字/分數) */
  mainDialog = 20,
  /** hp bar */
  hpBar = 20,
  /** 道具ui */
  itemDialog = 20,
  /** 地磚地圖容器 */
  tileMapContainer = 10,
  /** 上浮提示字動畫 */
  popupTextTween = 10,
  /** 敵人死亡特效 */
  enemyDeadFx = 10,
  /** 玩家英雄(map/container) */
  hero = 10,
  /** 敵人(map/container)(pool.add)(含hpbar) */
  enemy = 10,
  /** 炸彈(map/container) */
  bomb = 9,
  /** 爆風(map/container) */
  blast = 9,
  /** 牆(sprite) */
  wall = 8,
  /** 道具(gamescene/container)(pool.get) */
  item = 7,
  /** 地磚地圖-地表 */
  tarrainLayer = 0,
  /** 背景UI(container)(含bg圖) */
  background = 0,
}

/** 各方向旋轉角度 */
export enum ArrowDegree {
  /** 上 */
  Up = 90,
  /** 點擊畫面位置 */
  Right = 180,
  /** 點擊畫面拖曳 */
  Down = 270,
  /** 自動尋路前往點擊位置 */
  Left = 0,
}

/** 敵人波次資料 */
export interface BomberManEnemyWaveData {
  /** 敵人id */
  enemyID: number;
  /** 敵人數 */
  amount: number;
}

/** 地圖道具類型 */
export enum MapItemType {
  /** 快閃店兌換道具 */
  StoreItem = 0,
  /** 地圖專用道具 */
  MapItem,
}

/** 爆風圖片類型 */
export enum BlastType {
  None = 0,
  /** 末端 */
  EndPoint,
  /** 連接線 */
  Link,
  /** 中央十字 */
  Center,
  Max,
}
