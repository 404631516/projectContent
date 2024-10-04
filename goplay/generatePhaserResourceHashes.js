const crypto = require('crypto');
const fs = require('fs').promises;
const glob = require('glob');

// 定義要計算MD5的目錄
const directories = ['public/img', 'public/audio', 'public/json'];

// 使用glob模塊搜尋檔案，並計算MD5
async function generatePhaserResourceHashes() {
  let resourceHashes = new Map();

  for (const dir of directories) {
    const files = glob.sync(`${dir}/**/*.*`, { nodir: true });

    for (const file of files) {
      const relativePath = file.replace('public/', '');
      if (resourceHashes.has(relativePath)) {
        console.error(`Duplicate file name: ${file}`);
        break;
      }

      const content = await fs.readFile(file);
      const hash = crypto.createHash('md5').update(content).digest('hex');

      resourceHashes.set(relativePath, hash);
    }
  }

  // 將結果寫入JavaScript檔案
  const content = `export const phaserResourceHashes = new Map(${JSON.stringify(
    Array.from(resourceHashes.entries()),
    null,
    2,
  ).replace(/"/g, "'")});\n`;
  await fs.writeFile('src/data/phaserResourceHashes.ts', content);
  console.log('phaserResourceHashes generated and saved.');
}

generatePhaserResourceHashes().catch(console.error);
