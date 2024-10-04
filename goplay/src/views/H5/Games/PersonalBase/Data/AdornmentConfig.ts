export enum AdornmentString {
  // images
  // 房間佈置-主畫面ui
  /** 全透明圖 */
  transparentFrame = 'transparentFrame',
  /** 背包鈕 */
  backpackButton = 'BackpackButton',
  /** 同學列表鈕 */
  classmateButton = 'classmateListButton',
  /** 主畫面鈕黑底 */
  blackFrame = 'blackFrame',
  /** 主畫面鈕黑底(長) */
  blackFrame2 = 'blackFrame2',

  // 裝飾積分
  /** 裝飾積分圖示 */
  adornmentScoreIcon = 'BowtieIcon',

  // 佈置模式的背包
  /** 背包容器底框 */
  backpackContainerBg = 'backpackContainerBg',
  /** 背包裝飾物類型頁籤底框 */
  backpackTypeTab = 'backpackTypeTab',
  /** 背包翻頁箭頭鈕 */
  backpackPageBtn = 'backpackPageBtn',
  /** 背包物品cell底框 */
  backpackCellBg = 'backpackCellBg',
  /** 背包物品積分底框 */
  backpackItemScoreBg = 'backpackItemScoreBg',
  /** 背包物品大小底框 */
  backpackItemSizeBg = 'backpackItemSizeBg',
  /** 背包物品數量底框 */
  backpackItemCountBg = 'backpackItemCountBg',
  /** 背包物品數量圖示 */
  backpackItemCount = 'backpackItemCount',
  /** 背包無物品的跳轉按鈕 */
  backpackEmptyBtn = 'backpackEmptyBtn',
  /** 背包拖拉物品的選取框 */
  backpackCellDragFrame = 'backpackCellDragFrame',
  /** 存在zone物件中，可拖放裝飾物的資料 */
  ItemDropInfo = 'ItemDropInfo',
  /** 拆缷裝飾物-底框 */
  adornmentTearDownFrame = 'adornmentTearDownFrame',
  /** 拆缷裝飾物-回收鈕 */
  adornmentTearDownBtn = 'adornmentTearDownBtn',

  /** 佈置完成鈕 */
  exitEditModeButton = 'exitEditModeButton',
  /** 佈置模式鈕 */
  editModeButton = 'editModeButton',
  /** 我的房間鈕 */
  selfRoomButton = 'selfRoomButton',
  /** 商店鈕 */
  storeButton = 'storeButton',

  // 等級解鎖
  /** 可解鎖的黃底 */
  canUnlockBg = 'canUnlockBg',
  /** 可解鎖的鎖頭Icon及光芒 */
  canUnlock = 'canUnlock',
  /** 不可解鎖的黑底 */
  noUnlockHintBg = 'noUnlockHintBg',
  /** 不可解鎖的鎖頭 */
  noUnlock = 'noUnlock',
  /** 已解鎖動畫黑底 */
  unlockAnimatBg = 'unlockAnimatBg',

  // UI ATLAS
  /** 裝飾物合圖 */
  adornmentAtlas = 'adornmentAtlas',

  // 房間建築物圖片
  // 建築物圖片
  /** 房間隔間牆 */
  partitionWall = 'partitionWall',
  /** 房間樓板 */
  floorSlab = 'floorSlab',
  /** 最底層樓層-背景 */
  bottomFloorBg = 'emptyFloorBG',
  // 裝飾物圖片
  /** 預設背景圖片(毛胚屋)-牆 */
  defaultWallImage = 'defaultWallImage',
  /** 預設背景圖片(毛胚屋)-地板 */
  defaultFloorImage = 'defaultFloorImage',
  /** 背包裝飾物(牆/地板)的發亮效果圖 */
  backgroundAdornmentLight = 'backgroundAdornmentLight',

  /** 可拖放傢俱裝飾物的格子 */
  canPutFurnitureIcon = 'canPutFurnitureIcon',
  /** 可拖放裝飾物的加號 */
  canPutFurniturePlus = 'canPutFurniturePlus',
  /** 可拖放背景裝飾物的大綠框 */
  canPutBackgroundIcon = 'canPutBackgroundIcon',
  /** 不可拖放傢俱裝飾物的格子 */
  noPutFurnitureIcon = 'noPutFurnitureIcon',
  /** 拖放傢俱提示圖 */
  dropFurnitureIcon = 'dropFurnitureIcon',
  /** 拖放背景提示圖 */
  dropBackgroundImage = 'dropBackgroundImage',

  // 角色
  /** 英雄對話框 */
  heroTalkFrame = 'heroTalkFrame',
  /** 英雄對話key */
  heroTalkContentKey = 'AdornmentHeroTalkContent_',

  /** 拜訪標題底圖 */
  visitTitleBg = 'visitTitleBg',
  /** 拜訪提示-黑底 */
  visitHintBlackFrame = 'visitHintBlackFrame',
  /** 拜訪提示-綠底 */
  visitHintGreenFrame = 'visitHintGreenFrame',
  /** 拜訪提示-白線 */
  visitHintWhiteLine = 'visitHintWhiteLine',
  /** 拜訪提示-圖示 */
  visitHintIcon = 'visitClassmateHintIcon',
  /** 拜訪排行按鈕底圖 */
  visitRankBtnBg = 'visitRankBtnBg',
  /** 拜訪排行按鈕箭頭 */
  visitRankBtnArrow = 'visitRankBtnArrow',

  // 音效
  /** 放置裝飾物音效 */
  onPutAdornmentSound = 'onPutAdornmentSound',
  /** 拆缷裝飾物音效 */
  onTearDownAdornmentSound = 'onTearDownAdornmentSound',
  /** 解鎖房間音效 */
  onUnlockRoomSound = 'onUnlockRoomSound',
  /** 按鈕音效 */
  onClickButtonSound = 'onClickButtonSound',
}

export enum AdornmentNumber {
  invalidID = -1,

  // PHASER遊戲寬高(pixel)
  phaserGameWidth = 1920,
  phaserGameHeight = 920,

  /** 無限捲軸元件寬度 */
  scrollWidth = phaserGameWidth,
  /** 無限捲軸元件高度 */
  scrollHeight = phaserGameHeight,

  /** 房間背景高度 */
  roomBackgroundHeight = 354,
  /** 房間背景一半高度 */
  roomBackgroundHalfHeight = roomBackgroundHeight / 2,

  /** 房間背景原始圖片大小 */
  roomBackgroundOriginSize = 96,

  /** 牆壁圖片TileSprite高度 */
  wallHeight = roomBackgroundHalfHeight,
  /** 地板圖片TileSprite高度 */
  floorHeight = roomBackgroundHalfHeight,

  /** 原始圖片縮放比 */
  originImageScale = roomBackgroundHalfHeight / roomBackgroundOriginSize,

  /** 房間樓板厚度(高度) */
  floorSlabThickness = 78,
  /** 房間高度 */
  roomHeight = wallHeight + floorHeight + floorSlabThickness,

  /** 最下層樓層高度 */
  bottomFloorHeight = 300,
  /** 大房間寬度 */
  largeRoomWidth = 1020,
  /** 小房間寬度 */
  smallRoomWidth = 450,

  /** 房間樓板位置Y */
  floorSlabPosY = (roomHeight - floorSlabThickness) / 2,

  /** 房間隔間牆寬度 */
  partitionWallWidth = 13,
  /** 房間隔間牆高度 */
  partitionWallHeight = roomHeight - floorSlabThickness,
  /** 房間隔間牆位置Y */
  partitionPosY = (partitionWallHeight - roomHeight) / 2,

  /** 空樓層背景位置X */
  bottomFloorBGPosX = scrollWidth / 2,

  /** 樓層位置會置中於容器，但房間0,0對準樓層左上角，裝飾物0,0對準房間左上角 */
  /** 房間內座標Y軸偏移 */
  roomCoordinateOffsetY = roomHeight / 2,

  /** 地圖索引 的 每個類型物品預留空間 */
  mapIndexInterval = 1000,

  /** 裝飾物原始圖高度上限 */
  adornmentOriginHeightMax = 48,
  /** 裝飾物原始圖寬度上限 */
  adornmentOriginWidthMax = 48,

  /** 牆壁圖片y軸偏移 (將座標原點移到房間左上角) */
  wallOffsetY = wallHeight / 2 - roomCoordinateOffsetY,

  /** 地板圖片y軸偏移 (將座標原點移到房間左上角) */
  floorOffsetY = wallHeight + floorHeight / 2 - roomCoordinateOffsetY,

  /** 傢俱裝飾物放置格子間隔x */
  furniturePutGridGapX = 56,

  /** 後排物品(門/窗)y軸偏移 (將座標原點移到房間左上角) */
  backItemOffsetY = 88 - roomCoordinateOffsetY,
  /** 中間物品(牆上物)y軸偏移 (將座標原點移到房間左上角) */
  middleItemOffsetY = 102 - roomCoordinateOffsetY,
  /** 前排(上)(地上物)物品y軸偏移 (將座標原點移到房間左上角) */
  frontUpItemOffsetY = 159 - roomCoordinateOffsetY,
  /** 前排(下)(地上物)物品y軸偏移 (將座標原點移到房間左上角) */
  frontDownItemOffsetY = 250 - roomCoordinateOffsetY,

  /** 小房間-後排物品數量 */
  SmallRoomBackItemCount = 6,
  /** 小房間-中間物品數量 */
  SmallRoomMiddleItemCount = SmallRoomBackItemCount,
  /** 小房間-前排物品數量 */
  SmallRoomFrontItemCount = SmallRoomBackItemCount * 2,

  /** 大房間-後排物品數量 */
  BigRoomBackItemCount = 16,
  /** 大房間-中間物品數量 */
  BigRoomMiddleItemCount = BigRoomBackItemCount,
  /** 大房間-前排物品數量 */
  BigRoomFrontItemCount = BigRoomBackItemCount * 2,

  // 佈置模式的背包
  /** 背包dialog位置X */
  itemDialogPositionX = 492,
  /** 背包dialog位置Y */
  itemDialogPositionY = 575,

  /** 背包dialo裝飾物CELL 開始位置X */
  itemDialogMenuPositionX = 45,
  /** 背包dialo裝飾物CELL 開始位置Y */
  itemDialogMenuPositionY = 109,

  /** 道具cell寬度 */
  itemCellWidth = 106,
  /** 道具cell高度 */
  itemCellHeight = 136,
  /** 道具cell-道具圖片可顯示區域寬度 */
  itemCellItemIconAreaWidth = itemCellWidth - 8,

  /** 房間佈置-英雄位置(後) */
  heroPositionYBack = frontUpItemOffsetY - 46.5,
  /** 房間佈置-英雄位置(中) */
  heroPositionYMiddle = frontUpItemOffsetY + 33.5,
  /** 房間佈置-英雄位置(前) */
  heroPositionYFront = frontDownItemOffsetY + 15,
  /** 英雄移動的邊界，從房間邊緣內縮的距離 */
  moveMarginIndent = 80,
  /** 每一間房間英雄數量上限 */
  heroMaxCountPerRoom = 3,
  /** 英雄縮放倍率 */
  heroSpriteScale = 0.8,
  /** 英雄對話數量 */
  heroTalkContentCount = 10,
}

/** 深度定義 */
export enum AdornmentDepth {
  /** 上浮提示字動畫 */
  popupTextTween = 25,
  /** 拆缷裝飾物ui */
  tearDownDialog = 21,
  /** 主畫面ui(container)(含進場字/分數) */
  mainDialog = 20,
  /** 道具ui */
  itemDialog = 20,
}

/** 方向類型 */
export enum DirectionType {
  /** 左 */
  Left = 1,
  /** 右 */
  Right = 2,
}

/** 房間佈置-房間 */
export enum AdornmentRoomSizeType {
  /** 靜態表的無效值 */
  None = 0,
  /** 大房間 */
  Big,
  /** 小房間 */
  Small,
}

/** 房間解鎖狀態 */
export enum AdornmentRoomUnlockType {
  /** 不可解鎖 */
  NoUnlock,
  /** 可解鎖 */
  CanUnlock,
  /** 已解鎖 */
  Unlock,
}
