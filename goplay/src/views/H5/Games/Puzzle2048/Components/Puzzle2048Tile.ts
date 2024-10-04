import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { Puzzle2048Number, Puzzle2048String, puzzle2048TileColorMap } from '../Data/Puzzle2048Config';

/** 2048數字tile */
export default class Puzzle2048Tile extends Object2D {
  /** 字體基礎大小 */
  private readonly baseFontSize = 64;
  /** 字體縮小參數 */
  private readonly fontSizeReductionFactor = 8;

  /** 底圖 */
  public sprite: Phaser.GameObjects.Sprite;
  /** 顯示文字 */
  private text: Phaser.GameObjects.Text;
  /** 數值 */
  public value: number = 0;
  /** 是否能升級 */
  public canUpgrade: boolean = true;

  public init() {
    this.scene.add.existing(this);

    this.setSize(Puzzle2048Number.TileSize, Puzzle2048Number.TileSize);

    this.sprite = this.addSprite(Puzzle2048String.Tile, 0, 0);
    this.sprite.setDisplaySize(Puzzle2048Number.TileSize, Puzzle2048Number.TileSize);

    this.text = this.addText('0', 0, 0, {
      fontSize: '64px',
      color: 'black',
      align: 'center',
    }).setOrigin(0.5);

    this.alpha = 0;
  }

  /**
   * 依照文字長度動態調整大小
   * @param text 要顯示的內容
   */
  public setText(text: string): void {
    // 計算字體大小
    const textSize = this.baseFontSize - text.length * this.fontSizeReductionFactor;

    // 設定字體大小
    this.text.setFontSize(textSize);
    this.text.setText(text);
  }

  /**
   * Tile的值乘上一個倍數
   * @param multiplier
   */
  public multiply(multiplier: number): void {
    this.value *= multiplier;
    this.setText(this.value.toString());
    this.sprite.setTint(puzzle2048TileColorMap.get(this.value));
  }

  /**
   * 重置Tile
   */
  public reset() {
    this.multiply(0);
    this.alpha = 0;
  }
}
