import ParkourMapObject from './ParkourMapObject';

export default class ParkourBreakableWall extends ParkourMapObject {
    /** 微調縮放比例 */
    public get adjustScale(): number {
        return 1;
    }

    public onHit(objectGroup: Phaser.Physics.Arcade.Group): void {
        objectGroup.remove(this, true, true);
    }
}
