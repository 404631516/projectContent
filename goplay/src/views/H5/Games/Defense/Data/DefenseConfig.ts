export enum DefenseString {
  // images
  EnemyDamageEffect = 'enemyDamageEffect',
  MagicIcon = 'energy',
  Arrow = 'arrow',
  Zone = 'zone',
  StageTag = 'stageTag',
  SoundOnIcon = 'soundOnIcon',
  SoundOffIcon = 'soundOffIcon',

  // data
  TilePos = 'tilePos',

  // json
  DefaultMapData = 'defaultMapData',
  DefaultEnemyData = 'defaultEnemyData',

  // audio
  OnShootSound = 'onShootSound',
}

/** 畫面深度 */
export enum DefenseDepth {
  /** 背景 */
  Background = -1,
  /** 砲塔可設置區域 */
  MapDialog = 0,
  /** 場上敵人 */
  Enemy = 1,
  /** 補丁UI */
  PatchDialog = 2,
  /** 砲塔UI & 場上砲塔 */
  Weapon = 3,
  /** 血條 */
  HpBar = 4,
  /** 計時器UI */
  Timer = 5,
  /** 波數顯示UI */
  StateDialog = 6,
}

export enum DefenseNumber {
  BaseMagic = 1000,
  MaxMagic = 10000,
  // 實際上的長寬
  sceneSizeX = 1024,
  sceneSizeY = 512,
  // 圖片設計時的長寬
  mapBGSizeX = 1200,
  mapBGSizeY = 600,
  // 一格的實際長寬
  TileSizeX = 51.2,
  TileSizeY = 34.133333,
  OffsetX = 0,
  OffsetY = -21,
  // 英雄砲塔因為站得較高, 另外校正Y值
  HeroTowerOffset = -60,
  Gravity = 980,
  EnemyNext = 2500,
  /** 砲彈飛行時間(毫秒) */
  BombHitTime = 1000,
}
