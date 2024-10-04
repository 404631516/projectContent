import DefaultMap from '@/views/H5/Helper/DefaultMap';

export enum Puzzle2048String {
  /** 背景 */
  Background = 'Background',
  /** 一個數字是一個tile */
  Tile = 'Tile',
  /** 分數icon */
  IconScore = 'IconScore',
  /** 爆炸特效 */
  Bomb = 'Bomb',

  /** 合成音效 */
  AudioUpgrade = 'AudioUpgrade',
  /** 使用道具音效 */
  AudioUseItem = 'AudioUseItem',
  /** 重置音效 */
  AudioReset = 'AudioReset',
}

export enum Puzzle2048Animation {}

export enum Puzzle2048ItemFunction {
  /** 隨機加乘 */
  MultipleRandom = 0,
  /** 指定加乘 */
  MultipleSelect = 1,
}

export enum Puzzle2048Depth {
  /** 背景 */
  Background = -1,
  /** 地圖物件 */
  MapObject = 2,
  /** 英雄特效 */
  HeroFx = 2,
  /** 英雄 */
  Hero = 3,
  /** UI */
  UI = 5,
}

export enum Puzzle2048Number {
  /** Tile大小 */
  TileSize = 72,
  /** Tile最大數值 */
  TileMaxValue = 65536,
  /** Tile tween speed */
  TileTweenSpeed = 50,
  /** Swipe閾值 */
  SwipeThreshold = 50,
  /** 行數 */
  Row = 4,
  /** 列數 */
  Col = 4,
  /** 位置offset */
  PosOffsetX = 277,
  /** 位置offset */
  PosOffsetY = 135,
  /** 目標分數 */
  TargetScore = 800,
}

/** 數字tile的顏色對照表 */
export const puzzle2048TileColorMap: DefaultMap<number, number> = new DefaultMap<number, number>(
  () => 0,
  [
    [0, 0xffffff],
    [2, 0xffffff],
    [4, 0xffeeee],
    [8, 0xffdddd],
    [16, 0xffcccc],
    [32, 0xffbbbb],
    [64, 0xffaaaa],
    [128, 0xff9999],
    [256, 0xff8888],
    [512, 0xff7777],
    [1024, 0xff6666],
    [2048, 0xff5555],
    [4096, 0xff4444],
    [8192, 0xff3333],
    [16384, 0xff2222],
    [32768, 0xff1111],
    [65536, 0xff0000],
  ],
);
