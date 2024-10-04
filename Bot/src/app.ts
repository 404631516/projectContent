import BotManager from './BotManager';

// 允許未認證的https連線目標
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// new BotManager
const botManager = new BotManager();

// update botManager
setInterval(() => {
  botManager.update();
}, 30);
