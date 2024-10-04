const IN_PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
  chainWebpack: (config) => {
    /* disable insertion of assets as data urls b/c Phaser doesn't support it */
    const rules = [
      { name: 'images', dir: 'img' },
      { name: 'media', dir: 'media' },
    ];
    rules.forEach((rule) => {
      const ruleConf = config.module.rule(rule.name);

      ruleConf.uses.clear();

      ruleConf
        .use('file-loader')
        .loader('file-loader')
        .options({
          name: `${rule.dir}/[name].[hash:8].[ext]`,
        });
    });
    IN_PRODUCTION &&
      config.module
        .rule('images')
        .use('image-webpack-loader')
        .loader('image-webpack-loader')
        .options({
          mozjpeg: { progressive: true, quality: 65 },
          optipng: { enabled: false },
          pngquant: { quality: [0.1, 0.9], speed: 4 },
          gifsicle: { interlaced: false },
        })
        .end();
  },
  publicPath: process.env.BASE_URL,
  productionSourceMap: false, // 生產環境是否生成 SourceMap
  devServer: {
    open: true,
    port: 6874,
    hot: false,
  },
  transpileDependencies: ['@esotericsoftware'],
};
