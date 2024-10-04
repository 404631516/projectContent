export enum SpaceInvadersString {
  //#region 圖片
  /** 背景 */
  Background = 'Background',
  /** 背景星球 */
  BackgroundPlanet = 'BackgroundPlanet',
  /** UI遮罩 */
  UiCover = 'UiCover',
  /** 血量背景 */
  HpBg = 'HpBg',
  /** 血量圖示 */
  HpIcon = 'HpIcon',
  /** 分數圖示 */
  IconScore = 'IconScore',
  /** 玩家子彈 */
  PlayerBullet = 'playerBullet',
  /** 玩家圓形爆炸子彈 */
  PlayerBulletCircle = 'playerBulletCircle',
  /** 敵人子彈 */
  EnemyBullet = 'enemyBullet',
  /** 玩家 */
  Ship = 'ship',
  /** 受傷特效 */
  Hurt = 'hurt',
  /** 玩家血量 */
  PlayerHp = 'playerHp',
  /** 敵人血量 */
  EnemyHp = 'enemyHp',
  /** 玩家防護罩 */
  ShipShield = 'shipShield',
  /** 障礙物 */
  Obstacle1 = 'Obstacle1',
  /** 障礙物 */
  Obstacle2 = 'Obstacle2',
  /** 障礙物 */
  Obstacle3 = 'Obstacle3',
  //#endregion

  //#region 音效
  /** 發射子彈音效 */
  AudioShoot = 'AudioShoot',
  /** 玩家受傷音效 */
  AudioPlayerHurt = 'AudioPlayerHurt',
  /** 玩家無敵時受擊音效 */
  AudioPlayerOnHitInvincible = 'AudioPlayerOnHitInvincible',
  /** 敵人受傷音效 */
  AudioEnemyHurt = 'AudioEnemyHurt',
  /** 敵人死亡音效 */
  AudioEnemyKilled = 'AudioEnemyKilled',
  /** 道具圓形爆炸音效 */
  AudioExplodeCircle = 'AudioExplodeCircle',
  /** 道具直線爆炸音效 */
  AudioExplodeLine = 'AudioExplodeLine',
  /** 道具全畫面爆炸音效 */
  AudioExplodeFullScreen = 'AudioExplodeFullScreen',
  /** 道具敵人速度減慢音效 */
  AudioSlowDown = 'AudioSlowDown',
  /** 道具無敵音效 */
  AudioInvincible = 'AudioInvincible',
  //#endregion
}

/** 動畫key */
export enum AnimationTextureKey {
  /** 機體摧毀 特效 */
  AnimDestroy = 'animDestroy',
  /** 玩家直線爆炸道具 特效 */
  AnimLine = 'animLine',
  /** 玩家圓形爆炸道具 特效 */
  AnimCircle = 'animCircle',
  /** 玩家全畫面爆炸道具 特效 */
  AnimFullScreen = 'animFullScreen',
  /** 使用時間減半道具 特效 */
  AnimSlowDownEnemies = 'animSlowDownEnemies',
  /** 敵人1 */
  AnimEnemy1 = 'animEnemy1',
  /** 敵人2 */
  AnimEnemy2 = 'animEnemy2',
  /** 敵人3 */
  AnimEnemy3 = 'animEnemy3',
  /** 敵人4 */
  AnimEnemy4 = 'animEnemy4',
  /** 敵人5 */
  AnimEnemy5 = 'animEnemy5',
  /** 敵人6 */
  AnimEnemy6 = 'animEnemy6',
}

export enum SpaceInvadersNumber {
  /** 遊戲總時間 */
  TotalGameTime = 180,
  /** 續命題觸發時間 */
  ReviveTime = 30,
}

/** 畫面深度 */
export enum SpaceInvadersDepth {
  /** 背景 */
  Background = -1,
  /** UI */
  UI = 3,
}

/** 道具功能 */
export enum SpaceInvadersItemFunctionType {
  /** 全畫面爆破 */
  ExplodeFullScreen = 1,
  /** 直線爆破 */
  ExplodeLine = 2,
  /** 圓形爆破 */
  ExplodeCircle = 3,
  /** 時間緩慢 */
  SlowDownEnemies = 4,
  /** 無敵 */
  Invincible = 5,
}

/** 敵人移動模式 */
export enum SpaceInvadersEnemyMovementPattern {
  /** 從上左到下右 */
  TopLeftToBottomRight = 1,
  /** 從上右到下左 */
  TopRightToBottomLeft = 2,
  /** 從上方到中間巡邏 */
  TopToMiddlePatrol = 3,
  /** 從上方Z字到下方離開 */
  TopToDownZigzag = 4,
  /** 從左上到右下 */
  LeftTopToRightBottom = 5,
  /** 從右上到左下 */
  RightTopToLeftBottom = 6,
}

/** 敵人在巡邏階段的巡邏方式 */
export enum SpaceInvadersEnemyPatrolType {
  /** 原地靜止不動 */
  None = 0,
  /** 左右平移 */
  LeftRight = 1,
  /** 左右動, 帶有上下波浪 */
  LeftRightZigzag = 2,
}
