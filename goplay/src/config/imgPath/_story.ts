import Config from '../setting';
const baseUrl = `${Config.imgUrl}/img/h5/defense/weapons`;
const storyImgPath = {
    // banner
    firstStoryBaseUrl: `${require('@/assets/images/story/first_story.jpg')}`,
    secondStoryBaseUrl: `${require('@/assets/images/story/second_story.jpg')}`,
    thirdStoryBaseUrl: `${require('@/assets/images/story/third_story.jpg')}`,
    // innerWar
    innerWar1: `${require('@/assets/images/story/innerWar1.jpg')}`,
    /** 英雄背景板 */
    storyHeroCard: `${require('@/assets/images/story/storyHeroCard.png')}`,
    oneHeroBaseUrl: `${baseUrl}/weapon_01.png`,
    twoHeroBaseUrl: `${baseUrl}/weapon_64.png`,
    threeHeroBaseUrl: `${baseUrl}/weapon_16.png`,
    fourHeroBaseUrl: `${baseUrl}/weapon_12.png`,
    fiveHeroBaseUrl: `${baseUrl}/weapon_53.png`,
    sixHeroBaseUrl: `${baseUrl}/weapon_23.png`,
    sevenHeroBaseUrl: `${baseUrl}/weapon_35.png`,
    eightHeroBaseUrl: `${baseUrl}/weapon_37.png`,
    nineHeroBaseUrl: `${baseUrl}/weapon_43.png`,
    tenHeroBaseUrl: `${baseUrl}/weapon_26.png`,
    elevenHeroBaseUrl: `${baseUrl}/weapon_58.png`,
  };
export default storyImgPath;
