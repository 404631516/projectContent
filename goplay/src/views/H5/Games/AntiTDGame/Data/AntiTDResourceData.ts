import Config from '@/config/setting';
import { AntiTDItemType } from '@/helper/enum/AntiTD';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import { ResourceData } from '../../../Scripts/Components/ResourceData';
import { AntiTDString } from './AntiTDConfig';

/** 圖片資源的資料夾路徑 */
export const antiTDImgUrl = `${Config.imgUrl}/img/h5/antiTD`;

/** json資源的資料夾路徑 */
export const antiTDJsonUrl = `${Config.imgUrl}/json/antiTD`;

/** 音樂資源的資料夾路徑 */
export const antiTDAudioUrl = `${Config.imgUrl}/audio/antiTD`;

/** 各資源的路徑及預設位置 */
export const antiTDResourceData: ResourceData = {
  images: [
    { key: AntiTDString.Tileset, url: `${antiTDImgUrl}/tileset.png` },
    { key: AntiTDString.EnergyBall, url: `${antiTDImgUrl}/energyBall.png` },
    { key: AntiTDString.TeamIcon, url: `${antiTDImgUrl}/teamIcon.png` },
    { key: AntiTDString.HeroIndicator, url: `${antiTDImgUrl}/heroIndicator.png` },
    { key: AntiTDString.EnemyIndicator, url: `${antiTDImgUrl}/enemyIndicator.png` },
    { key: AntiTDString.SwitchKeyIcon, url: `${antiTDImgUrl}/switchKeyIcon.png` },
    { key: AntiTDString.SwitchKeyBg, url: `${antiTDImgUrl}/switchKeyBg.png` },
    { key: AntiTDString.EnemyIcon, url: `${antiTDImgUrl}/enemyIcon.png` },
    { key: AntiTDString.WarningIcon, url: `${antiTDImgUrl}/warningIcon.png` },
    { key: AntiTDString.FramePurple, url: `${antiTDImgUrl}/framePurple.png` },
    { key: AntiTDString.Line, url: `${antiTDImgUrl}/line.png` },
    { key: `${AntiTDString.ItemKey}ONE`, url: `${antiTDImgUrl}/itemKey1.png` },
    { key: `${AntiTDString.ItemKey}TWO`, url: `${antiTDImgUrl}/itemKey2.png` },
    { key: `${AntiTDString.ItemKey}THREE`, url: `${antiTDImgUrl}/itemKey3.png` },
    { key: `${AntiTDString.ItemKey}FOUR`, url: `${antiTDImgUrl}/itemKey4.png` },
    { key: `${AntiTDString.ItemKey}FIVE`, url: `${antiTDImgUrl}/itemKey5.png` },
    {
      key: `${AntiTDString.ItemTypeIcon}${AntiTDItemType.Physics}`,
      url: `${antiTDImgUrl}/Item/iconPhysics.png`,
    },
    {
      key: `${AntiTDString.ItemTypeIcon}${AntiTDItemType.Curse}`,
      url: `${antiTDImgUrl}/Item/iconCurse.png`,
    },
    {
      key: `${AntiTDString.ItemTypeIcon}${AntiTDItemType.Buff}`,
      url: `${antiTDImgUrl}/Item/iconBuff.png`,
    },
    {
      key: `${AntiTDString.ItemTypeIcon}${AntiTDItemType.Element}`,
      url: `${antiTDImgUrl}/Item/iconElement.png`,
    },
    {
      key: `${AntiTDString.ItemTypeIcon}${AntiTDItemType.Miracle}`,
      url: `${antiTDImgUrl}/Item/iconMiracle.png`,
    },
    {
      key: `${AntiTDString.ItemTypeIcon}${AntiTDItemType.Healing}`,
      url: `${antiTDImgUrl}/Item/iconHealing.png`,
    },
    {
      key: `${AntiTDString.ItemTypeIcon}${AntiTDItemType.Summon}`,
      url: `${antiTDImgUrl}/Item/iconSummon.png`,
    },
    {
      key: `${AntiTDString.ItemTypeIcon}${AntiTDItemType.Projectile}`,
      url: `${antiTDImgUrl}/Item/iconProjectile.png`,
    },
    { key: AntiTDString.Lock, url: `${antiTDImgUrl}/lock.png` },
    { key: AntiTDString.EnemySpawnPoint, url: `${antiTDImgUrl}/enemySpawnPoint.png` },
  ],
  audios: [{ key: BaseSceneString.BGM, url: `${antiTDAudioUrl}/bgm.mp3` }],
};
