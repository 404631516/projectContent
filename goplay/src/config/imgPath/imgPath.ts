import heroImgPath from './_hero';
import weaponImgPath from './_weapon';
import iconImgPath from './_icon';
import courseMenuImgPath from './_courseMenu';
import homeImgPath from './_home';
import planetWarImgPath from './_planetWar';
import contestImgPath from './_contest';
import bannerImgPath from './_banner';
import storyImgPath from './_story';
import bossImgPath from './_boss';
import interstellarForumImgPath from './_interstellarForum';
import noviceGuide from './_noviceGuide';
import profile from './_profile';
import antiTDImgPath from './_antiTD';
import adornmentImgPath from './_adornment';
import brickBreakerImgPath from './_brickBreaker';
import dialogImgPath from './_dialog';
import questionnaireImgPath from './_questionnaire';
import anniversaryImgPath from './_anniversary';
import heroUniverseImgPath from './_heroUniverse';

// 圖片路徑管理
const imgPath = {
  ...contestImgPath, // 世界大賽相關
  ...courseMenuImgPath, // 科目選單相關
  ...weaponImgPath, // 生物兵器
  ...heroImgPath, // 英雄
  ...iconImgPath, // 內頁icon
  ...dialogImgPath, // 彈窗常用
  ...homeImgPath, // 首頁
  ...planetWarImgPath, // 星球大戰
  ...bannerImgPath, // banner
  ...storyImgPath, // 故事
  ...bossImgPath, // 魔王相關
  ...interstellarForumImgPath, // 星際論壇
  ...noviceGuide, // 新手引導
  ...profile, // 個人頁
  ...antiTDImgPath, // 逆塔防
  ...adornmentImgPath, // 個人基地布置
  ...brickBreakerImgPath, // 坦克大戰
  ...questionnaireImgPath, // 問卷
  ...anniversaryImgPath, // 周年慶
  ...heroUniverseImgPath, // 因雄宇宙
};
export default imgPath;
