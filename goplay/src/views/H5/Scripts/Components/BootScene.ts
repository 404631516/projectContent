import { Scene } from 'phaser';
import { ResourceData } from '@/views/H5/Scripts/Components/ResourceData';
import HeroManager from '@/manager/HeroManager';
import { baseSceneResource } from '../Data/BaseSceneResource';
import AttributeHelper from '../../Helper/AttributeHelper';
import InfoBox from './InfoBox';
import config from '@/config/setting';
import PhaserHelper from '../../Helper/PhaserHelper';

/** 加載遊戲資源的初始場景
 *  永遠存在並執行update
 */
export default class BootScene extends Scene {
  /** 通用資源 */
  protected loadUrlDataList: ResourceData[] = [baseSceneResource];

  constructor(urlData: ResourceData, private gameSceneKey: string) {
    // 設定場景key
    super('BootScene');

    // 加入要加載的遊戲資源
    this.loadUrlDataList.push(urlData);
  }

  preload() {
    // 加載資源
    this.loadUrlDataList.forEach((urlData) => {
      this.loadData(urlData);
    });

    // 載入英雄的資源
    HeroManager.loadHeroImages(this);
    // 載入屬性Icon
    AttributeHelper.loadAttributeIcons(this);
  }

  create() {
    // 檢查是否有遊戲場景
    const keys = Object.keys(this.game.scene.keys);
    if (keys.includes(this.gameSceneKey) === false) {
      InfoBox.error([this], `沒有遊戲場景${this.gameSceneKey}`);
      return;
    }

    // 轉跳遊戲場景
    this.scene.launch(this.gameSceneKey);
  }

  /** 載入resource檔案中的資源
   * @param resourceData
   */
  private loadData(resourceData: ResourceData): void {
    // 載入圖片
    resourceData.images.forEach((img) => {
      const url = PhaserHelper.ensureVersionedResourceUrl(img.url);
      this.load.image(img.key, url);
    });

    // 載入動圖
    resourceData.spritesheets?.forEach((sprite) => {
      const url = PhaserHelper.ensureVersionedResourceUrl(sprite.url);
      this.load.spritesheet(sprite.key, url, sprite.frameConfig);
    });

    // 載入動畫Json
    resourceData.animations?.forEach((animation) => {
      const url = PhaserHelper.ensureVersionedResourceUrl(animation.url);
      this.load.animation(animation.key, url);
    });

    // 載入圖集
    resourceData.atlases?.forEach((atlas) => {
      const url = PhaserHelper.ensureVersionedResourceUrl(atlas.url);
      this.load.atlas(atlas.key, url, atlas.textureXhrSetting);
    });

    // 載入Json
    resourceData.jsons?.forEach((json) => {
      const url = PhaserHelper.ensureVersionedResourceUrl(json.url);
      this.load.json(json.key, url);
    });

    // 載入音效
    resourceData.audios?.forEach((audio) => {
      const url = PhaserHelper.ensureVersionedResourceUrl(audio.url);
      this.load.audio(audio.key, url);
    });

    // 載入Tilemap
    resourceData.tilemaps?.forEach((tilemap) => {
      const url = PhaserHelper.ensureVersionedResourceUrl(tilemap.url);
      this.load.tilemapTiledJSON(tilemap.key, url);
    });
  }
}
