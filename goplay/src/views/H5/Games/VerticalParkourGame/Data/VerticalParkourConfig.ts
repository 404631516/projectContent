export enum VerticalParkourString {
  /** 魔力值圖示 */
  MagicIcon = 'MagicIcon',
  /** 魔力值條 */
  MagicBar = 'MagicBar',
  /** 魔力值背景 */
  MagicBarBg = 'MagicBarBg',
  /** 草地背景 */
  Grass = 'Grass',
  /** 英雄受傷圖 */
  Hurt = 'Hurt',
  /** 英雄解鎖圖 */
  Unlock = 'Unlock',
  /** 英雄死亡圖 */
  Die = 'Die',
  /** 英雄無敵圖 */
  Invincible = 'Invincible',
  /** 英雄炸彈圖 */
  Bomb = 'Bomb',
  /** 障礙物1 */
  Obstacle1 = 'Obstacle1',
  /** 障礙物2 */
  Obstacle2 = 'Obstacle2',
  /** 寶箱 */
  Treasure = 'Treasure',
  /** 鑰匙 */
  Key = 'Key',
  /** 金幣 */
  Coin = 'Coin',
  /** 滑板 */
  Skateboard = 'Skateboard',

  /** 吃金幣音效 */
  AudioCoin = 'AudioCoin',
  /** 吃鑰匙音效 */
  AudioKey = 'AudioKey',
  /** 解鎖寶箱音效 */
  AudioTreasure = 'AudioTreasure',
  /** 受傷音效 */
  AudioHurt = 'AudioHurt',
  /** 使用道具-無敵音效 */
  AudioInvincible = 'AudioInvincible',
  /** 使用道具-炸彈音效 */
  AudioBomb = 'AudioBomb',
  /** 使用道具-分身音效 */
  AudioAvatar = 'AudioAvatar',
  /** 使用道具-磁鐵音效 */
  AudioMagnet = 'AudioMagnet',
}

export enum VerticalParkourAnimation {
  /** 英雄走路動畫 */
  HeroWalk = 'HeroWalk',
  /** 無敵特效動畫 */
  Invincible = 'Invincible',
  /** 炸彈特效動畫 */
  Bomb = 'Bomb',
  /** 解鎖特效 */
  Unlock = 'Unlock',
}

export enum VerticalParkourGroup {
  /** 障礙物群組 */
  ObstacleGroup = 'ObstacleGroup',
  /** 鑰匙群組 */
  KeyGroup = 'KeyGroup',
  /** 寶箱群組 */
  TreasureGroup = 'TreasureGroup',
  /** 金幣群組 */
  CoinGroup = 'CoinGroup',
  /** 分身群組 */
  AvatarGroup = 'AvatarGroup',
}

export enum VerticalParkourItemFunction {
  /** 無敵 */
  Invincible = 0,
  /** 磁鐵 */
  Magnet = 1,
  /** 分身 */
  Avatar = 2,
  /** 炸彈 */
  Bomb = 3,
}

export enum VerticalParkourDepth {
  /** 背景 */
  Background = 0,
  /** 地圖物件 */
  MapObject = 2,
  /** 英雄特效 */
  HeroFx = 2,
  /** 英雄 */
  Hero = 3,
  /** UI */
  UI = 5,
}

export enum VerticalParkourNumber {
  /** 左邊界 */
  LeftEdge = 256,
  /** 右邊界 */
  RightEdge = 768,
  /** 最大魔力值 */
  MaxEnergy = 1000,
  /** 背景移動速度 */
  BackgroundSpeed = 100,
}
