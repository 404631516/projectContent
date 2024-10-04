import Config from '../setting';
/** 遊戲說明路徑 */
const gameHelpBaseUrl = `${Config.imgUrl}/img/h5/gamehelp/`;

/** 賽事圖片 */
const contestImgPath = {
  /** 答題賽事 (小遊戲背景) */
  answerDefenseBg: `${require('@/assets/images/contest/answerDefenseBg.png')}`,
  answerHamsterBg: `${require('@/assets/images/contest/answerHamsterBg.png')}`,
  answerBejeweledBg: `${require('@/assets/images/contest/answerBejeweledBg.png')}`,
  answerShooterBg: `${require('@/assets/images/contest/answerShooterBg.png')}`,
  answerParkourBg: `${require('@/assets/images/contest/answerParkourBg.png')}`,
  answerFishingBg: `${require('@/assets/images/contest/answerFishingBg.png')}`,
  answerBomberManBg: `${require('@/assets/images/contest/answerBomberManBg.png')}`,
  answerBubbleDragonBg: `${require('@/assets/images/contest/answerBubbleDragonBg.png')}`,
  answerMatchingCardBg: `${require('@/assets/images/contest/answerMatchingCardBg.png')}`,
  answerPiggyBg: `${require('@/assets/images/contest/answerPiggyBg.png')}`,
  answerSnakeBg: `${require('@/assets/images/contest/answerSnakeBg.png')}`,
  answerVerticalParkourBg: `${require('@/assets/images/contest/answerVerticalParkourBg.png')}`,
  answerSpaceInvadersBg: `${require('@/assets/images/contest/answerSpaceInvadersBg.png')}`,
  answerPuzzle2048Bg: `${require('@/assets/images/contest/answerPuzzle2048Bg.png')}`,
  /** 小遊戲說明 */
  gameHelpDefenseBg: `${gameHelpBaseUrl}defenseHelp.png`,
  gameHelpHamsterBg: `${gameHelpBaseUrl}hamsterHelp.png`,
  gameHelpBejeweledBg: `${gameHelpBaseUrl}bejeweledHelp.png`,
  gameHelpBejeweledBossBg: `${gameHelpBaseUrl}bejeweledBossHelp.png`,
  gameHelpShooterBg: `${gameHelpBaseUrl}shooterHelp.png`,
  gameHelpParkourBg: `${gameHelpBaseUrl}parkourHelp.png`,
  gameHelpFishingBg: `${gameHelpBaseUrl}fishingHelp.png`,
  gameHelpBomberManBg: `${gameHelpBaseUrl}bomberManHelp.png`,
  gameHelpAntiTDBg: `${gameHelpBaseUrl}antiTDHelp.png`,
  gameHelpBubbleDragonBg: `${gameHelpBaseUrl}bubbleDragonHelp.png`,
  gameHelpBubbleDragon2Bg: `${gameHelpBaseUrl}bubbleDragon2Help.png`,
  gameHelpMatchingCardBg: `${gameHelpBaseUrl}matchingCardHelp.png`,
  gameHelpMatchingCard2Bg: `${gameHelpBaseUrl}matchingCard2Help.png`,
  gameHelpPiggyBg: `${gameHelpBaseUrl}piggyHelp.png`,
  gameHelpPiggy2Bg: `${gameHelpBaseUrl}piggy2Help.png`,
  gameHelpSnakeBg: `${gameHelpBaseUrl}snakeHelp.png`,
  gameHelpSnake2Bg: `${gameHelpBaseUrl}snake2Help.png`,
  gameHelpVerticalParkourBg: `${gameHelpBaseUrl}parkourVerticalHelp.png`,
  gameHelpSpaceInvadersBg: `${gameHelpBaseUrl}spaceInvadersHelp.png`,
  gameHelpPuzzle2048Bg: `${gameHelpBaseUrl}puzzle2048Help.png`,
  /** 小遊戲輪盤 */
  gameWheelDefenseImg: `${require(`@/assets/images/contest/TowerDefense.png`)}`,
  gameWheelHamsterImg: `${require(`@/assets/images/contest/Hamster.png`)}`,
  gameWheelBejeweledImg: `${require(`@/assets/images/contest/Bejeweled.png`)}`,
  gameWheelShooterImg: `${require(`@/assets/images/contest/Shooter.png`)}`,
  gameWheelParkourImg: `${require(`@/assets/images/contest/Parkour.png`)}`,
  gameWheelFishingImg: `${require(`@/assets/images/contest/Fishing.png`)}`,
  gameWheelBomberManImg: `${require(`@/assets/images/contest/BomberMan.png`)}`,
  gameWheelBubbleDragonImg: `${require(`@/assets/images/contest/BubbleDragon.png`)}`,
  gameWheelMatchingCardImg: `${require(`@/assets/images/contest/MatchingCard.png`)}`,
  gameWheelPiggyImg: `${require(`@/assets/images/contest/Piggy.png`)}`,
  gameWheelSnakeImg: `${require(`@/assets/images/contest/Snake.png`)}`,
  gameWheelVerticalParkourImg: `${require(`@/assets/images/contest/VerticalParkour.png`)}`,
  gameWheelSpaceInvadersImg: `${require(`@/assets/images/contest/SpaceInvaders.png`)}`,
  gameWheelPuzzle2048Img: `${require(`@/assets/images/contest/Puzzle2048.png`)}`,
  /** 答題賽事 (小遊戲輪盤背景) */
  answerGameWheelBg: `${require('@/assets/images/contest/gameWheelBg.png')}`,
  /** 答題賽事 (小遊戲輪盤紅色背景點綴圖) */
  answerGameWheelRedImg: `${require('@/assets/images/contest/gameWheelRedImg.png')}`,
  /** 答題賽事 (小遊戲輪盤標題背景) */
  answerGameWheelNameBg: `${require('@/assets/images/contest/gameWheelNameBg.png')}`,
  /** 答題賽事 (小遊戲輪盤固定圖) */
  answerGameWheelGoStraightImg: `${require('@/assets/images/contest/answerGameWheelGoStraightImg.png')}`,
  /** 答題賽事 (小遊戲輪盤開始按鈕) */
  answerGameWheelStartBtn: `${require('@/assets/images/contest/answerGameWheelStartBtn.png')}`,
  /** 小遊戲背景模糊圖 */
  gameHelpBlur: `${gameHelpBaseUrl}gradientOverlay.png`,
  /** 賽事預設 banner */
  contestDefaultBanner: `${require('@/assets/images/contest/contestDefaultBanner.jpg')}`,
  /** 賽事獎勵領取按鈕 */
  receiveBtnUrl: `${require('@/assets/images/contestInfoDetail/receiveBtn.png')}`,
  /** 賽事獎勵已領取按鈕 */
  alreadyReceiveBtnUrl: `${require('@/assets/images/contestInfoDetail/alreadyReceiveBtn.png')}`,
  /** 按鈕圖片 */
  roomButton: `${require('@/assets/images/contest/btn.png')}`,
  /** 綠色對話框 */
  greenFrame: `${require('@/assets/images/contest/green_frame.png')}`,
  /** 加入校園賽事按鈕圖 */
  roomContestBtn: `${require('@/assets/images/contestInfoDetail/roomContestBtn.png')}`,
  /** 加入校園賽事文字 */
  roomContestText: `${require('@/assets/images/contestInfoDetail/roomContestText.png')}`,
  /** 校園賽事參加說明 */
  roomContestExplain: `${require('@/assets/images/contestInfoDetail/roomContestExplain.png')}`,
};
export default contestImgPath;
