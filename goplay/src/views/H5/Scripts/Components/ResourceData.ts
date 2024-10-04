/** 總素材表 */
export interface ResourceData {
  /** 圖片資料 */
  images: BaseFileData[];
  /** 動圖資料 */
  spritesheets?: SpriteData[];
  /** 動畫資料，Json格式 */
  animations?: BaseFileData[];
  /** 圖集資料 */
  atlases?: AtlasData[];
  /** Json資料 */
  jsons?: BaseFileData[];
  /** 音檔資料 */
  audios?: BaseFileData[];
  /** Tilemap資料 */
  tilemaps?: BaseFileData[];
}

/** 基本資料格式 */
interface BaseFileData {
  /** 在遊戲中使用此資料時，所對應的Key */
  key: string;
  /** 檔案所在位置 */
  url: string;
}

/** 動圖資料 */
export interface SpriteData extends BaseFileData {
  /** 用以指定動圖的寬高等 */
  frameConfig?: Phaser.Types.Loader.FileTypes.ImageFrameConfig;
}

/** 圖集資料 */
export interface AtlasData extends BaseFileData {
  /** 圖集對應的Json設定檔 */
  textureXhrSetting: string;
}
