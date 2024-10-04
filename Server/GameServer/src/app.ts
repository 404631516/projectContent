import { GameManager } from './GameManager';
import config from '../gameServerConfig.json';
import { NetApp } from './Netcommon/NetApp';
import JwtValidator from './JwtValidator';
import ProfilerSystem from './Netservice/ProfilerSystem';
import { ISessionSSEServerOption } from './Netservice/ServerSessionProvider';
import { getSessionProvider } from './Netservice/SessionSSEServer';
import profilerSystemConfig from '../ProfilerSystemConfig.json';

// 預設port為8081
let gameServerPort: number = 8081;
// 取得command line輸入參數, 更新指定port
if (process.argv[2]) {
  gameServerPort = +process.argv[2];
}

const option: ISessionSSEServerOption = {
  uidDecoder: (token: string) => {
    const userInfo = JwtValidator.verify(token);
    if (userInfo === undefined) {
      return NaN;
    }
    return userInfo.uid;
  },
  path: '/sse',
  port: gameServerPort,
};

const netApp = new NetApp(getSessionProvider().createServer(option));

// 監聽 /getGameServerLocation
if (option.app) {
  // client端一律連'/getSSE/getGameServerLocation'
  // 其中'/getSSE'這層是nginx跳轉的location
  const getGameServerLocation = config.isUseNginx ? '/getGameServerLocation' : '/getSSE/getGameServerLocation';
  // 監聽 /getGameServerLocation
  option.app.get(getGameServerLocation, (req, res) => {
    // 防呆
    if (req.query === undefined) {
      return res.json({ success: false });
    }

    const token = req.query.token as string;
    // 防呆
    if (token === undefined) {
      return res.json({ success: false });
    }

    const contestRoomUserInfo = JwtValidator.verify(token);
    // 防呆
    if (contestRoomUserInfo === undefined) {
      return res.json({ success: false });
    }

    // 取得玩家房間的對應GameServer location,
    // 若沒有使用nginx轉跳location, 就直接回傳空字串, 讓client端組合字串後直接連到'/sse'
    let targetGameServerLocation: string = '';
    if (config.isUseNginx) {
      // 算出gameRoomId對應的location
      const targetGameServerIndex = contestRoomUserInfo.contestRoomId % config.gameServerCount;
      // 組成指定location名稱: 'sse1', 'sse2', ......'sse10'
      targetGameServerLocation = '/sse' + (targetGameServerIndex + 1).toString();
    }

    // 回傳
    return res.json({ success: true, url: targetGameServerLocation });
  });
} else {
  console.error('new NetApp error, option.app undefined!');
}

netApp.addComponent(new GameManager());

netApp.start();

if (profilerSystemConfig.isEnable) {
  // new ProfilerSystem
  const profiler = new ProfilerSystem(profilerSystemConfig.outputPeriodInSec);
}

// netApp update
setInterval(() => {
  netApp.update();
  if (profilerSystemConfig.isEnable) {
    ProfilerSystem.update();
  }
}, 30);
