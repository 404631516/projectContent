module.exports = {
  plugins: {
    autoprefixer: {
      overrideBrowserslists: [
        "android > = 4.0",
        "ios > 7",
        "Firefox >= 20",
        "ie >= 8",
      ],
    },
    'postcss-pxtorem': {
      rootValue: 16, // 基準大小
      unitPrecision: 5,
      propList: ["*"], // 全部尺寸px轉rem
      selectorBlackList: [],
      replace: true,
      mediaQuery: false,
      minPixelValue: 0,
      exclude: /node_modules/i,
    },
  },
};
