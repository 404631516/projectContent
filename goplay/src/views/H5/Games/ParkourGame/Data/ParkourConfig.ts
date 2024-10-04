export enum ParkourString {
  //#region Image
  /** 背景圖 */
  Background0 = 'Background0',
  /** 背景圖 */
  Background1 = 'Background1',
  /** 背景圖 */
  Background2 = 'Background2',
  /** 背景圖 */
  Foreground0 = 'Foreground0',
  /** 背景圖 */
  Foreground1 = 'Foreground1',

  /** 分數圖示 */
  IconScore = 'IconScore',
  /** 爆炸特效圖 */
  BoomFX = 'BoomFX',

  /** 藍色粒子圖 */
  ImageParticlesBlue = 'ImageParticlesBlue',
  /** 紅色粒子圖 */
  ImageParticlesRed = 'ImageParticlesRed',
  /** 黃色粒子圖 */
  ImageParticlesYellow = 'ImageParticlesYellow',
  //#endregion
  //#region Tilemap
  /** 地圖Json檔 */
  LevelForest0 = 'LevelForest0',
  /** 地圖Json檔 */
  LevelForest1 = 'LevelForest1',
  /** 地圖Json檔 */
  LevelForest2 = 'LevelForest2',
  /** 地圖Json檔 */
  LevelForest3 = 'LevelForest3',
  /** 地圖Json檔 */
  LevelForest4 = 'LevelForest4',
  /** 地圖Json檔 */
  LevelForest5 = 'LevelForest5',
  /** 地圖Json檔 */
  LevelForest6 = 'LevelForest6',
  /** 地圖Json檔 */
  LevelForest7 = 'LevelForest7',
  /** 地圖Json檔 */
  LevelForest8 = 'LevelForest8',
  /** 地圖Json檔 */
  LevelForest9 = 'LevelForest9',

  /** 地圖土地Layer名稱 */
  TileLayerLevelForestLand = 'LevelForestLandLayer',
  /** 地圖鑽石Layer名稱 */
  ObjectLayerLevelForest = 'LevelForestObjectLayer',

  /** 土地類型Tile */
  TileTypeLand = 'Land',
  /** 鑽石類型Tile */
  TileTypeDiamond = 'Diamond',
  /** 障礙物類型Tile */
  TileTypeObstacle = 'Obstacle',
  /** 怪物類型Tile */
  TileTypeMonster = 'Monster',
  /** 可破壞牆類型Tile */
  TileTypeBreakWall = 'BreakableWall',

  /** 地圖Tileset */
  TilesetLevelForest = 'LevelForestTileset',
  //#endregion
  //#region 動畫
  /** 飛行動畫Key */
  AnimHeroFly = 'AnimHeroFly',
  /** 動畫設定 */
  JsonAnims = 'JsonAnims',
  /** 受傷動畫，需對應Json檔資料 */
  AnimHurt = 'AnimHurt',
  //#endregion

  //#region Particle
  /** 發射器Configs: 儲存所有小遊戲中使用到的發射器Config資料 */
  ParticleEmitterConfigs = 'ParticleEmitterConfigs',

  /** 英雄飛行Particle Emitter，對應Config 資料 */
  ParticleEmitterFly = 'ParticleEmitterFly',
  /** 英雄加速Particle Emitter，對應Config 資料 */
  ParticleEmitterSpeedUp = 'ParticleEmitterSpeedUp',
  /** 英雄受傷Particle Emitter，對應Config 資料 */
  ParticleEmitterHurt = 'ParticleEmitterHurt',

  //#endregion
  //#region 物理碰撞
  /** 英雄與鑽石碰撞 */
  ColliderHeroDiamond = 'ColliderHeroDiamond',
  /** 磁鐵與鑽石碰撞 */
  ColliderMagnetDiamond = 'ColliderMagnetDiamond',
  /** 英雄與地圖物件碰撞 */
  ColliderHeroMapObject = 'ColliderHeroObstacle',
  /** 英雄與地板碰撞 */
  ColliderHeroGround = 'ColliderHeroGround',

  /** 鑽石遊戲物件群組 */
  GroupDiamond = 'GroupDiamond',
  /** 地圖物件群組 */
  GroupMapObjects = 'GroupMapObjects',
  //#endregion
  //#region 音樂
  /** 跳躍音效 */
  AudioJump = 'AudioJump',
  /** 吃鑽石音效 */
  AudioDiamond = 'AudioDiamond',
  /** 撞飛物件音效 */
  AudioObjectFly = 'AudioObjectFly',
  /** 受傷音效 */
  AudioHurt = 'AudioHurt',
  /** 磁鐵音效 */
  AudioMagnet = 'AudioMagnet',
  /** 飛行音效 */
  AudioFly = 'AudioFly',
  /** 巨大化音效 */
  AudioGiant = 'AudioGiant',
  /** 加速音效 */
  AudioSpeedUp = 'AudioSpeedUp',
  //#endregion
}

export enum ParkourNumber {
  /** 分數圖示位置X */
  ScoreIconX = 815,
  /** 分數圖示位置Y */
  ScoreIconY = 30,
  /** 地圖寬度 */
  MapWidth = 1024,
}

export enum ParkourDepth {
  /** 背景 */
  Background = 0,
  /** Tilemap土地 */
  LayerForest = 1,
  /** Tilemap物件 */
  LayerMapObject = 2,
  /** 英雄特效 */
  HeroFx = 2,
  /** 磁鐵特效 */
  MagnetFx = 3,
  /** 英雄 */
  Hero = 3,
  /** 前景 */
  Foreground = 4,
  /** UI */
  UI = 5,
}

export enum ParkourItemFunction {
  /** 磁鐵 */
  Magnet = 0,
  /** 飛行 */
  Fly,
  /** 巨大化 */
  Giant,
  /** 加速 */
  SpeedUp,
}
