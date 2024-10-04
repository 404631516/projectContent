export enum BejeweledString {
  // images
  BG = 'bg',
  GemBombs = 'GemBombs',
  EnergyIcon = 'energyIcon',
  ItemHighLight = 'itemHighLight',
  ThrowBossObject = 'throwBossObject',
  GradientOverlay = 'gradientOverlay',
  SoundOffIcon = 'soundOffIcon',
  SoundOnIcon = 'soundOnIcon',
  // spritesheets
  Gems = 'gems',
  EnemyDamageEffect = 'enemyDamageEffect',
  // atlases
  Flares = 'flares',
  // audios
  DestroyGemsSound = 'destroyGemsSound',
  // particle emitter
  ParticleEmitterGem = 'ParticleEmitterGem',
  ParticleEmitterGemBomb = 'ParticleEmitterGemBomb',
  // json
  ParticleEmitterConfigs = 'ParticleEmitterConfigs',

  MagicPower = 'magicPower',
}

export enum BejeweledNumber {
  // 能量
  MaxEnergy = 1000,
  // 補充能量值/每個方塊可換取能量值
  PlusEnergy = 30,
  // 耗損能量值方塊數
  GemsNum = 15,
  // 每秒消耗能量值
  PerSecEnergy = 10,
  // 達方塊數增加消耗能量值
  MinusEnergy = 5,

  // 遊戲時間
  GameSec = 300,
  // 剩餘能量小於此值時進續續命題
  ReviveEnergy = 250,

  // 寶石相關
  FieldSizeHeight = 7,
  FieldSizeWidth = 8,
  GemSize = 66,
  GemPoolSize = 18,
  BombSize = 55,
  GemColors = 6,
  GemBombTypeCount = 5,

  // 寶石炸彈顯示速度
  ShowBombSpeed = 400,
  // 寶石交換速度
  SwapSpeed = 200,
  // 寶石消除速度
  DestroySpeed = 200,
  // 新寶石掉落速度
  FallSpeed = 100,

  // 上方留白
  MarginTop = 40,
  // 左邊留白
  MarginLeft = 27,
}

/** 畫面深度 */
export enum BejeweledDepth {
  /** 背景 */
  Background = -1,
  /** UI */
  UI = 2,
}
