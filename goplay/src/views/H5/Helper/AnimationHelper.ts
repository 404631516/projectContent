import Config from '@/config/setting';
import {
  characterAnimConfigMap,
  CharacterAnimType,
  CharacterColorType,
  characterDefaultAnimConfig,
  CharacterType,
} from '@/helper/enum/PhaserGame';
import { ImageFrameConfig } from '@/manager/HeroManager';
import TableManager, { BaseCharacterData, EffectData } from '@/manager/TableManager';
import { Scene } from 'phaser';
import Localization, { LocalKeyType } from '../Scripts/Components/Localization';
import UIDialog from '../Scripts/Components/UIDialog';
import { AsyncHelper } from './AsyncHelper';
import PhaserHelper from './PhaserHelper';

export default class AnimationHelper {
  /** 角色動畫圖FrameConfig */
  private static readonly characterFrameConfig: ImageFrameConfig = { frameWidth: 256, frameHeight: 256 };

  /** 載入角色動畫圖片(Sprite)
   * @param scene 遊戲場景
   * @param data 角色資料
   * @param characterType 角色類別
   * @param animType 動畫類別
   */
  public static loadCharacterSprite(
    scene: Scene,
    data: BaseCharacterData,
    characterType: CharacterType,
    animType: CharacterAnimType,
  ): void {
    // 用統一Key載入圖片(Sprite與Anim使用相同的Key)
    scene.load.spritesheet(
      this.getCharacterAnimKey(data, animType),
      `${this.getCharacterSpriteUrl(data, characterType, animType)}`,
      this.characterFrameConfig,
    );
  }

  /** 取得該角色的某動畫類別AnimKey(Sprite與Anim使用相同的Key)
   * @param data 角色資料
   * @param animType 動畫類別
   * @returns AnimKey
   */
  public static getCharacterAnimKey(data: BaseCharacterData, animType: CharacterAnimType): string {
    return `${data.nameKey}${animType}`;
  }

  /** 獲取角色動畫圖路徑
   * @param data 角色資料
   * @param characterType 角色類別
   * @param animType 角色動畫類別
   * @returns 動畫圖路徑
   */
  private static getCharacterSpriteUrl(
    data: BaseCharacterData,
    characterType: CharacterType,
    animType: CharacterAnimType,
  ): string {
    const colorTypeSuffix: string = data.colorType === CharacterColorType.Default ? '' : data.colorType;
    return PhaserHelper.ensureVersionedResourceUrl(
      `${Config.imgUrl}/img/${characterType}/${data.url}/${data.url}_${animType}${colorTypeSuffix}.png`,
    );
  }

  /** 創建角色動畫(Anim)
   * @param scene 遊戲場景
   * @param data 角色資料
   * @param animType 動畫類別
   */
  public static createCharacterAnim(
    scene: Scene,
    data: BaseCharacterData,
    animType: CharacterAnimType,
  ): false | Phaser.Animations.Animation {
    let config = characterAnimConfigMap.get(animType);
    if (config == null) {
      console.error(`尚未在characterAnimConfigMap中設置動畫類別: ${animType} 的動畫Config`);
      config = characterDefaultAnimConfig;
    }

    // 用統一Key創建動畫(Sprite與Anim使用相同的Key)
    config.key = this.getCharacterAnimKey(data, animType);
    config.frames = config.key;
    return scene.anims.create(config);
  }

  /** 載入所有英雄的某個AnimType資源, 在preload()呼叫
   * @param scene 場景
   * @param animType 動畫類型
   */
  public static loadAllHeroSprite(scene: Scene, animType: CharacterAnimType): void {
    TableManager.hero
      .getAll()
      .forEach((heroData) => this.loadCharacterSprite(scene, heroData, CharacterType.Hero, animType));
  }

  /** 在中心顯示倒數動畫
   * @description 倒數前顯示 readyText 1秒，倒數後顯示 startText 1秒。動畫執行總秒數為 countDownSecond + 2 秒。
   * @param countDownSecond 倒數秒數
   * @param readyTextKey 倒數前顯示文字
   * @param startTextKey 倒數後顯示文字
   * @param textStyle 字型風格
   * @param offsetX 偏移位置
   * @param offsetY 偏移位置
   * @example 如 countDownSecond = 3，則動畫時長為5秒
   */
  public static async playOpeningCountDown(
    uiDialog: UIDialog,
    countDownSecond: number,
    readyTextKey: string,
    startTextKey: string,
    textStyle: Phaser.Types.GameObjects.Text.TextStyle,
    offsetX: number = 0,
    offsetY: number = 0,
  ): Promise<void> {
    // 顯示準備文字
    let text = uiDialog.addTextToCenter(Localization.getText(LocalKeyType.Common, readyTextKey), textStyle);
    text.setPosition(text.x + offsetX, text.y + offsetY);
    // 設置倒數動畫
    for (let i = countDownSecond; i >= 0; i--) {
      await AsyncHelper.sleep(1);
      // 將先前文字清除
      text.destroy();
      // 顯示倒數數字
      if (i > 0) {
        text = uiDialog.addTextToCenter(`${i}`, textStyle);
        text.setPosition(text.x + offsetX, text.y + offsetY);
      } else if (i === 0) {
        // 倒數到0時顯示出發文字1秒
        text = uiDialog.addTextToCenter(Localization.getText(LocalKeyType.Common, startTextKey), textStyle);
        text.setPosition(text.x + offsetX, text.y + offsetY);
        await AsyncHelper.sleep(1);
      }
    }

    text.destroy();
  }

  /** 載入特效圖片後，需在使用Tween動畫前(例: Create階段)先呼叫此函式初始化特效
   * @description 在使用setTweenFromEffectData前必須先使用此方法初始化動畫
   * @param effectData 特效資料
   */
  public static createSpriteAnimFromEffectData(scene: Phaser.Scene, effectData: EffectData): void {
    // 創建Sprite動畫
    scene.anims.create({
      key: effectData.nameKey,
      frames: effectData.nameKey,
      frameRate: effectData.frameRate,
      repeat: -1,
    });
  }

  /** 設置Tween動畫
   * @description 使用前須先使用createSpriteAnimFromEffectData初始化特效
   * @param targetSprite 目標Sprite元件
   * @param effectData 特效資料
   * @param pendingUntilKeyTime 是否等到關鍵時間
   * @returns Tween動畫
   */
  public static async setTweenFromEffectData(
    targetSprite: Phaser.GameObjects.Sprite,
    effectData: EffectData,
    pendingUntilKeyTime: boolean,
  ): Promise<Phaser.Tweens.Tween> {
    return await this.setTween(targetSprite, effectData, pendingUntilKeyTime, false);
  }

  /** 設置Tween動畫
   * @description 使用前須先使用createSpriteAnimFromEffectData初始化特效
   * @param targetSprite 目標Sprite元件
   * @param effectData 特效資料
   * @param pendingUntilKeyTime 是否等到關鍵時間
   * @param yoyoAlphaScale yoyo Scale 跟 Alpha
   * @returns Tween動畫
   */
  public static async setTween(
    targetSprite: Phaser.GameObjects.Sprite,
    effectData: EffectData,
    pendingUntilKeyTime: boolean,
    yoyoAlphaScale: boolean,
  ): Promise<Phaser.Tweens.Tween> {
    const scene = targetSprite.scene;

    // 暫存原本數值
    const originalTint = targetSprite.tint;
    const originalAngle = targetSprite.angle;
    const originalAlpha = targetSprite.alpha;
    const originalX = targetSprite.x;
    const originalY = targetSprite.y;
    const originalScale = targetSprite.scale;

    // 創建TweenConfig
    const tweenConfig = {
      targets: targetSprite,
      angle: {
        from: originalAngle + effectData.fromAngle,
        to: originalAngle + effectData.toAngle,
      },
      alpha: {
        from: originalAlpha * effectData.fromAlpha,
        to: originalAlpha * effectData.toAlpha,
        yoyo: false,
        duration: effectData.duration * 1000,
        ease: 'Linear',
      },
      x: {
        from: originalX + effectData.fromX,
        to: originalX + effectData.toX,
      },
      y: {
        from: originalY + effectData.fromY,
        to: originalY + effectData.toY,
      },
      scale: {
        from: originalScale * effectData.fromScale,
        to: originalScale * effectData.toScale,
        yoyo: false,
        duration: effectData.duration * 1000,
        ease: 'Linear',
      },
      // 秒單位轉換成ms
      duration: effectData.duration * 1000,
      yoyo: effectData.yoyo,
      repeat: effectData.repeat,
      onStart: () => {
        targetSprite.setActive(true);
        targetSprite.setVisible(true);
      },
      onComplete: () => {
        // 重置原本參數
        targetSprite.stop();
        targetSprite.setActive(false);
        targetSprite.setVisible(false);
        targetSprite.setTint(originalTint);
        targetSprite.setAngle(originalAngle);
        targetSprite.setAlpha(originalAlpha);
        targetSprite.setPosition(originalX, originalY);
        targetSprite.setScale(originalScale);
        scene.tweens.remove(tween);
      },
    };

    // 假如alpha跟scale要yoyo，覆寫設定
    if (yoyoAlphaScale) {
      tweenConfig.alpha = {
        from: originalAlpha * effectData.fromAlpha,
        to: originalAlpha * effectData.toAlpha,
        yoyo: true,
        // yoyo時間會變原本2倍
        duration: effectData.duration * 500,
        ease: 'Sine.easeOut',
      };

      tweenConfig.scale = {
        from: originalScale * effectData.fromScale,
        to: originalScale * effectData.toScale,
        yoyo: true,
        // yoyo時間會變原本2倍
        duration: effectData.duration * 500,
        ease: 'Sine.easeOut',
      };
    }

    // 設置Tween
    targetSprite.play(`${effectData.nameKey}`);
    targetSprite.setTint(effectData.tint);
    const tween = scene.tweens.add(tweenConfig);

    // 是否等到關鍵時間
    if (pendingUntilKeyTime) {
      const keyTimeMs = effectData.keyTime * 1000;
      // 等待到關鍵時間
      await AsyncHelper.pendingUntil(() => tween.totalElapsed >= keyTimeMs || tween.totalProgress === 1);
    }

    return tween;
  }
}
