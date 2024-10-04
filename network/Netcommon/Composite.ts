export abstract class Component {}

/**
 * @template T Component Type
 */
export abstract class Composite<T extends Component> {
  protected components = new Array<T>();

  constructor() {
    // 就算是空的, 也需要有constructor, 否則build時編譯會出問題, 導致new NetApp()失敗
  }

  /**
   * 增加Component
   * @param component 要增加的component
   */
  public addComponent(component: T): T {
    this.components.push(component);
    return component;
  }

  /**
   * 透過類別取得Component
   * @param componentType
   */
  public getComponent(componentType: new () => T): T | null {
    for (const component of this.components) {
      if (component.constructor.name === componentType.name) {
        return component;
      }
    }
    return null;
  }

  /**
   * 尋訪所有Component
   * @param handler Handler
   */
  public visitComponent(handler: (component: T) => void): void {
    this.components.forEach(handler);
  }

  /**
   * 傳送訊息給所有的component
   * @param message 訊息名稱,會對應呼叫的function名稱
   * @param args 參數
   */
  public sendMessage(message: string, ...args: any[]) {
    for (const component of this.components) {
      const fn: (...args: any[]) => void = (component as any)[message];
      if (fn != null && fn instanceof Function) {
        fn.call(component, args);
      }
    }
  }
}
