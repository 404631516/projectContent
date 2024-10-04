import { Scene } from 'phaser';
import DragCameraComponent from './DragCameraComponent';
import WheelCameraComponent from './WheelCameraComponent';

export default class EnhancedCamera extends Phaser.Cameras.Scene2D.Camera {
    /** 拖拉元件 */
    public dragComponent: DragCameraComponent;
    /** 滾輪縮放元件 */
    public wheelComponent: WheelCameraComponent;

    /** 創建加強版攝影機，創建完後須
     * @param scene 遊戲場景
     * @param x 水平位置，預設0
     * @param y 垂直位置，預設0
     * @param width 攝影機可視區域寬度，預設遊戲canvas寬
     * @param height 攝影機可視區域高度，預設遊戲canvas高
     * @param makeMain 是否將此設為主要攝影機，true將會使此攝影機取代scene.cameras.main，預設false
     */
    constructor(
        scene: Scene,
        x: number = 0,
        y: number = 0,
        width: number = scene.game.canvas.width,
        height: number = scene.game.canvas.height,
        makeMain: boolean = false,
    ) {
        super(x, y, width, height);
        scene.cameras.addExisting(this, makeMain);
        // 設置拖拉元件
        this.dragComponent = new DragCameraComponent(scene, this);
        this.dragComponent.setLock(true);
        // 設置滾輪縮放元件
        this.wheelComponent = new WheelCameraComponent(scene, this);
        this.wheelComponent.setLock(true);
    }
}
