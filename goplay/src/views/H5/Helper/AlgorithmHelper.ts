export default class AlgorithmHelper {
    /** 比對兩物件是否相同，此方法不適用含有巢狀結構的物件 */
    public static shallowEqual(object1: any, object2: any) {
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (const key of keys1) {
            if (object1[key] !== object2[key]) {
                return false;
            }
        }

        return true;
    }
}
