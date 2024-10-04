export default class SessionHelper {
  /** 取得PTCL內容字串加總, 拿來做md5 hash用
   * @param body
   * @param connectionId
   */
  public static getPTCLSignString(body: any, connectionId: number): string {
    // 要產生簽名的字串
    let signString = connectionId.toString();

    // 依照物件屬性名稱排序
    const sortedKeys = Object.keys(body).sort((a, b) => {
      return a.localeCompare(b);
    });
    // 串聯字串
    sortedKeys.forEach((sortedKey) => {
      signString = signString.concat(sortedKey.toString());
      let value = body[sortedKey];
      if (value === undefined) {
        value = 'undefined';
      } else {
        value = typeof value === 'object' ? JSON.stringify(value) : value.toString();
      }
      signString = signString.concat(value);
    });

    return signString;
  }
}
