import { ParkourMapObjectData } from '@/manager/TableManager';

export default abstract class ParkourMapObject extends Phaser.Physics.Arcade.Sprite {
    /** 微調縮放比例 */
    public abstract get adjustScale(): number

    /** 分數 */
    private _score: number = 0;
    public get score(): number {
        return this._score;
    }

    /** 魔力值 */
    private _energy: number = 0;
    public get energy(): number {
        return this._energy;
    }

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0, '');
    }

    /** 地圖物件與玩家相撞事件
     * @param objectGroup 地圖物件所屬群組
     */
    public abstract onHit(objectGroup: Phaser.Physics.Arcade.Group): void;

    /** 初始化地圖物件參數
     * @param data 地圖物件參數
     */
    public initData(data: ParkourMapObjectData): void {
        this._score = data.score;
        this._energy = data.energy;
    }
}
