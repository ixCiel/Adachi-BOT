import db from "../../utils/database.js";
import { filterWordsByRegex, getWordByRegex } from "../../utils/tools.js";
import { init } from "./init.js";

function doPool(msg) {
  const [cmd] = getWordByRegex(filterWordsByRegex(msg.text, ...global.command.functions.entrance.pool), /\S+/);
  let choice = 301;

  switch (cmd) {
    case global.all.functions.options.pool[200]:
      choice = 200;
      break;
    case global.all.functions.options.pool[301]:
      choice = 301;
      break;
    case global.all.functions.options.pool[302]:
      choice = 302;
      break;
    case global.all.functions.options.pool[999]:
      choice = 999;
      break;
    default:
      return;
  }

  init(msg.uid);
  db.update("gacha", "user", { userID: msg.uid }, { choice });
  msg.bot.say(msg.sid, `您的卡池已切换至：${global.all.functions.options.pool[choice]}。`, msg.type, msg.uid, true);
}

export { doPool };
