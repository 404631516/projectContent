import BasePopUpNumberTween from '@/views/H5/Scripts/Components/UI/BasePopUpNumberTween';

export default class CombatPopUpNumberTween extends BasePopUpNumberTween {
  /** 能量圖示縮放 */
  protected readonly iconScale: number = 0.5;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      {
        fontSize: '28px',
        color: '#44FF9B',
        stroke: '#3B7707',
        strokeThickness: 3,
      },
      {
        fontSize: '28px',
        color: '#FFDA48',
        stroke: '#FF4106',
        strokeThickness: 3,
      }
    );
  }
}
