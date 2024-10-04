import StateMachine from './StateMachine';

/** 一個state的基底類別 */
export default class State<T> {
    public _stateMachine!: StateMachine<T>;
    public getTarget(): T {
        return this._stateMachine.getTarget();
    }
    public onEnter() { /** */ }
    public onUpdate(time?: number, delta?: number) { /** */ }
    public onLeave() { /** */ }
    public triggerEvent(eventID: number) {
        this._stateMachine.triggerEvent(eventID);
    }
}
