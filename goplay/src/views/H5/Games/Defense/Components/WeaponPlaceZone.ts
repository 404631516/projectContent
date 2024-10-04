import Object2D from '../../../Scripts/Components/Object2D';
import { Scene } from 'phaser';
import { DefenseString } from '../Data/DefenseConfig';

export default class WeaponPlaceZone extends Object2D {
  private zoneImage: Phaser.GameObjects.Image;

  constructor(scene: Scene, x: number, y: number, width?: number, height?: number) {
    super(scene, x, y);

    // 繪製可放置地圖
    this.zoneImage = this.addImage(DefenseString.Zone, 0, 0);
    this.zoneImage.setDisplaySize(
      width ? width : this.zoneImage.displayWidth,
      height ? height : this.zoneImage.displayHeight
    );

    // 放置標籤
    const arrow = this.addImage(DefenseString.Arrow, 0, -this.zoneImage.height * 0.6);
    this.scene.add.tween({
      targets: arrow,
      y: `-=10`,
      duration: 300,
      repeat: -1,
      yoyo: true,
    });

    // 放置文字標籤
    const putText = this.addText('PUT', 0, -this.zoneImage.height * 1.1, {
      color: '#2CEAEC',
      fontSize: '30px',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.scene.add.tween({
      targets: putText,
      y: `-=10`,
      duration: 300,
      repeat: -1,
      yoyo: true,
    });
  }
}
