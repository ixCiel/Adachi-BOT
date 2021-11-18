import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { basePromise, detailPromise, characterPromise, handleDetailError } from "../../utils/detail.js";
import { getID } from "../../utils/id.js";

async function doPackage(msg) {
  let dbInfo = getID(msg.text, msg.uid, false); // UID

  if ("string" === typeof dbInfo) {
    msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid);
    return;
  }

  try {
    // 这里处理 undefined 返回值，如果没有给出 UID，通过 QQ 号查询 UID
    if (undefined === dbInfo) {
      dbInfo = getID(msg.text, msg.uid); // 米游社 ID

      if ("string" === typeof dbInfo) {
        msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid);
        return;
      }

      const baseInfo = await basePromise(dbInfo, msg.uid, msg.bot);
      const uid = baseInfo[0];
      dbInfo = getID(uid, msg.uid, false); // UID

      if ("string" === typeof dbInfo) {
        msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid);
        return;
      }
    }

    const detailInfo = await detailPromise(...dbInfo, msg.uid, msg.bot);
    await characterPromise(...dbInfo, detailInfo, msg.bot);
  } catch (e) {
    const ret = handleDetailError(e);

    if (!ret) {
      msg.bot.sayMaster(msg.sid, e, msg.type, msg.uid);
      return;
    }

    if (Array.isArray(ret)) {
      ret[0] && msg.bot.say(msg.sid, ret[0], msg.type, msg.uid);
      ret[1] && msg.bot.sayMaster(msg.sid, ret[1], msg.type, msg.uid);
      return;
    }
  }

  const data = db.get("info", "user", { uid: dbInfo[0] });
  render(msg, data, "genshin-info", 1.5, true);
}

export { doPackage };
