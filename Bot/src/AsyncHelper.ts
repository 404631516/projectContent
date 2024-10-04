export class AsyncHelper {
  /** async wait for given seconds
   * @param seconds sleep seconds
   */
  public static sleep(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  /** pending a promise until the given function returns true
   * @param func function to determine resolve
   * @param thisArg object as parameter (optional)
   */
  public static async pendingUntil(func: (this: void) => boolean, thisArg?: undefined): Promise<void> {
    while (true) {
      await this.sleep(0.1);

      if (func.call(thisArg)) {
        return Promise.resolve();
      }
    }
  }
}

/** builtin async in cocos component:
 * - this.scheduleOnce
 * this.schedule
 *
 * ex.  component.schedule(function() {
 *          // 这里的 this 指向 component
 *          this.doSomething();
 *      }, 5);
 */
