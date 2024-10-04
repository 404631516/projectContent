import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';
import UIDialog from '@/views/H5/Scripts/Components/UIDialog';
import HeroUniverseGameScene from '../Scenes/HeroUniverseGameScene';
import { HeroUniverseNumber, HeroUniverseString } from '../Data/HeroUniverseConfig';
import { Size } from '@/views/H5/Helper/PhaserHelper';

/** 包含所有需要與鼠標互動的UI元件 */
export default class HeroUniverseGuiDialog extends UIDialog {
  //#region declare、readonly、getter
  /** 遊戲場景 */
  public declare scene: HeroUniverseGameScene;

  /** 靜音按鈕位置 */
  private readonly muteIconPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.width - 40, this.height - 40);
  /** 靜音按鈕縮放 */
  private readonly muteIconSize: number = 70;
  /** 靜音按鈕最左緣的螢幕位置X */
  public readonly muteIconScreenLeftEdge: number = this.muteIconPosition.x - this.muteIconSize / 2;
  /** 靜音按鈕最上緣的螢幕位置Y */
  public readonly muteIconScreenTopEdge: number = this.muteIconPosition.y - this.muteIconSize / 2;

  /** 返回按鈕位置 */
  private readonly returnButtonPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(55, 22);
  /** 返回按鈕此尺寸 */
  private readonly returnButtonSize: Size = { width: 102, height: 32 };
  /** 返回按鈕最右緣的螢幕位置X */
  public readonly returnButtonScreenRightEdge: number = this.returnButtonPosition.x + this.returnButtonSize.width;
  /** 返回按鈕最下緣的螢幕位置Y */
  public readonly returnButtonScreenBottomEdge: number = this.returnButtonPosition.y + this.returnButtonSize.height;

  /** 返回按鈕箭頭Icon位置 */
  private readonly returnButtonArrowPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
    this.returnButtonPosition.x + this.returnButtonSize.width / 2 - 75,
    this.returnButtonPosition.y + this.returnButtonSize.height / 2 - 15,
  );
  /** 返回按鈕箭頭Icon尺寸 */
  private readonly returnButtonArrowSize: Size = { width: 26, height: 30 };

  /** 返回按鈕文字 */
  private readonly returnButtonText: string = '返回';
  /** 返回按鈕文字位置 */
  private readonly returnButtonTextPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
    this.returnButtonPosition.x + this.returnButtonSize.width / 2 - 35,
    this.returnButtonPosition.y + this.returnButtonSize.height / 2 - 15,
  );
  /** 返回按鈕文字尺寸 */
  private readonly returnButtonTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: '20px',
    strokeThickness: 0,
  };
  //#endregion declare、readonly、getter

  protected setUI(): void {
    // 靜音按鈕要與鼠標互動，因次一起放在ItemDialog裡
    const muteIcon = this.addImage('', this.muteIconPosition.x, this.muteIconPosition.y, '', MuteIcon);
    muteIcon.setScale(this.muteIconSize / muteIcon.width);

    // 返回按鈕
    const returnButton = this.addImage(
      HeroUniverseString.ReturnButton,
      this.returnButtonPosition.x,
      this.returnButtonPosition.y,
      '',
    );

    // 返回按鈕箭頭Icon
    this.addImage(
      HeroUniverseString.ReturnButtonArrow,
      this.returnButtonArrowPosition.x,
      this.returnButtonArrowPosition.y,
      '',
    );

    // 返回按鈕文字
    this.addText(
      this.returnButtonText,
      this.returnButtonTextPosition.x,
      this.returnButtonTextPosition.y,
      this.returnButtonTextStyle,
    );

    // 返回按鈕點擊互動處理
    returnButton.setInteractive({ useHandCursor: true });
    returnButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.scene.heroUniverseWeb.goBackToPreviousMap();
    });
  }

  /** 判斷pointer是否在UI之上
   * @param pointer pointer
   * @returns 是否在UI之上
   */
  public isPointerAboveUI(pointer: Phaser.Input.Pointer): boolean {
    const isAboveMuteIcon = pointer.y > this.muteIconScreenTopEdge && pointer.x > this.muteIconScreenLeftEdge;

    const isAboveReturnButton =
      pointer.x < this.returnButtonScreenRightEdge && pointer.y < this.returnButtonScreenBottomEdge;

    return isAboveMuteIcon || isAboveReturnButton;
  }

  //#region Phaser function
  update(...args: any[]): void {
    // 英雄位置
    const heroPosition = this.scene.heroPosition;

    // UI一半寬高
    const halfWidth = this.displayWidth / 2;
    const halfHeight = this.displayHeight / 2;

    // 世界寬高
    const worldWidth = this.scene.physics.world.bounds.width;
    const worldHeight = this.scene.physics.world.bounds.height;

    // 世界邊界
    const worldLeft = -worldWidth / 2;
    const worldRight = worldWidth / 2;
    const worldTop = -worldHeight / 2;
    const worldBottom = worldHeight / 2;

    // 是否超出世界邊界
    const isBeyondWorldLeft = heroPosition.x - worldLeft < halfWidth;
    const isBeyondWorldRight = worldRight - heroPosition.x < halfWidth;
    const isBeyondWorldTop = heroPosition.y - worldTop < halfHeight - HeroUniverseNumber.CameraOffsetY;
    const isBeyondWorldBottom = worldBottom - heroPosition.y < halfHeight + HeroUniverseNumber.CameraOffsetY;

    // 當英雄都不超過橫向邊界時，UI跟隨英雄橫向位置移動
    if (isBeyondWorldLeft === false && isBeyondWorldRight === false) {
      this.setX(heroPosition.x - halfWidth);
    }
    // 英雄超過左邊界，因鏡頭被限制在邊界，以左邊界當相對位置
    else if (isBeyondWorldLeft) {
      this.setX(worldLeft);
    }
    // 英雄超過右邊界，因鏡頭被限制在邊界，以右邊界當相對位置
    else if (isBeyondWorldRight) {
      this.setX(worldRight - this.displayWidth);
    }

    // 當英雄都不超過縱向邊界時，UI跟隨英雄縱向位置移動
    if (isBeyondWorldTop === false && isBeyondWorldBottom === false) {
      this.setY(heroPosition.y - halfHeight + HeroUniverseNumber.CameraOffsetY);
    }
    // 英雄超過上邊界，因鏡頭被限制在邊界，以上邊界當相對位置
    else if (isBeyondWorldTop) {
      this.setY(worldTop);
    }
    // 英雄超過下邊界，因鏡頭被限制在邊界，以下邊界當相對位置
    else if (isBeyondWorldBottom) {
      this.setY(worldBottom - this.displayHeight);
    }
  }
  //#endregion Phaser function
}
