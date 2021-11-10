/* global alias, command */
/* eslint no-undef: "error" */

//import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { basePromise } from "../../utils/detail.js";
import { getID } from "../../utils/id.js";
import { notePromise, signInfoPromise, rewardsPromise, signInPromise, ledgerPromise, setUserCookie } from "./noteDetail.js";

function getTime(s, offset) {
    if (s + offset < 0)
        return [0, 0, 0, 0];
    const sec = parseInt(s + offset);
    const min = parseInt(sec / 60);
    const hour = parseInt(min / 60);
    const day = parseInt(hour / 24);
    return [day, hour % 24, min % 60, sec % 60];
}

async function Plugin(Message) {
    const bot = Message.bot;
    const msg = Message.text;
    const userID = Message.uid;
    const type = Message.type;
    const sendID = Message.sid;
    const dbInfo = await getID(msg, userID); // ������ ID
    let uid, data, region, baseTime;

    //if (!(await hasAuth(userID, "query")) || !(await hasAuth(sendID, "query"))) {
    //  await sendPrompt(sendID, userID, "��ѯ��Ϸ����Ϣ", type, bot);
    //  return;
    //}

    if ("string" === typeof dbInfo) {
        await bot.say(sendID, dbInfo, type, userID);
        return;
    }

    try {
        const baseInfo = await basePromise(dbInfo, userID, bot);
        uid = baseInfo[0];
        region = baseInfo[1];
        if (hasEntrance(msg, "note", "set_user_cookie")) {
            let cookie = msg.slice(9);
            cookie = cookie.replace(new RegExp("'", "gm"), "");
            if (cookie.indexOf("cookie_token") == -1 || cookie.indexOf("account_id") == -1) {
                await bot.say(sendID, `δ�ҵ���¼��Ϣ�����¼�������׹���ͨ��֤ҳ�棬�ٴγ��Ի�ȡCookie��`, type, userID);
                return;
            }
            await setUserCookie(uid, cookie, bot);
            await bot.say(sendID, `������cookie`, type, userID);
            return;
        } else if (hasEntrance(msg, "note", "sign_in")) {
            let signInfo = await signInfoPromise(uid, region, userID, bot);
            if (!signInfo) {
                await bot.say(
                    sendID,
                    `[CQ:at,qq=${userID}] ��ȡǩ����Ϣʧ��`,
                    type,
                    userID
                );
                return;
            }
            if (signInfo.is_sign) {
                await bot.say(
                    sendID,
                    `[CQ:at,qq=${userID}] ������ǩ��,�����ۼ�ǩ��${signInfo.total_sign_day}��`,
                    type,
                    userID
                );
                return;
            }
            if (signInfo.first_bind) {
                await bot.say(
                    sendID,
                    `[CQ:at,qq=${userID}] �����ֶ�ǩ��һ��`,
                    type,
                    userID
                );
                return;
            }
            let sign = await signInPromise(uid, region, userID, bot);
            if (!sign) {
                await bot.say(
                    sendID,
                    `[CQ:at,qq=${userID}] ǩ��ʧ��`,
                    type,
                    userID
                );
                return;
            }
            data = await rewardsPromise(uid, region, userID, bot);
            if (!data) {
                await bot.say(
                    sendID,
                    `[CQ:at,qq=${userID}] ǩ��ʧ��`,
                    type,
                    userID
                );
                return;
            }
            await bot.say(
                sendID,
                `[CQ:at,qq=${userID}]
${data.month}���ۼ�ǩ����${++signInfo.total_sign_day}��
���ս�����${data.awards[signInfo.total_sign_day - 1].name} * ${data.awards[signInfo.total_sign_day - 1].cnt}`,
                type,
                userID
            );
            return;
        } else if (hasEntrance(msg, "note", "ledger") || hasEntrance(msg, "note", "lastledger") || hasEntrance(msg, "note", "lastlastledger")) {
            data = await ledgerPromise(uid, region, userID, bot);
            if (!data) {
                await bot.say(
                    sendID,
                    `[CQ:at,qq=${userID}] ��ȡ����ʧ��`,
                    type,
                    userID
                );
                return;
            }
            if (hasEntrance(msg, "note", "lastledger"))
                data = await ledgerPromise(uid, region, userID, bot, data.data_month == 1 ? 12 : data.data_month - 1);
            else if (hasEntrance(msg, "note", "lastlastledger"))
                data = await ledgerPromise(uid, region, userID, bot, data.data_month > 2 ? data.data_month - 2 : 10 + data.data_month);
            if (!data) {
                await bot.say(
                    sendID,
                    `[CQ:at,qq=${userID}] ��ȡ����ʧ��`,
                    type,
                    userID
                );
                return;
            }
            if (hasEntrance(msg, "note", "ledger"))
                await bot.say(
                    sendID,
                    `[CQ:at,qq=${userID}]
������${data.data_month}������
���¹���ȡ��
ԭʯ��${data.month_data.current_primogems}
Ħ����${data.month_data.current_mora}
�����߽����ѻ�ȡ${data.day_data.current_primogems}ԭʯ��${data.day_data.current_mora}Ħ��������ҲҪ�ú�Ŭ��Ŷ��`,
                    type,
                    userID
                );
            else
                await bot.say(
                    sendID,
                    `[CQ:at,qq=${userID}]
������${data.data_month}������
���¹���ȡ��
ԭʯ��${data.month_data.current_primogems}
Ħ����${data.month_data.current_mora}
ԭʯ����${data.month_data.primogems_rate == 0 ? "���ϸ��²��" : `���ϸ���${data.month_data.primogems_rate > 0 ? `����${data.month_data.primogems_rate}` : `����${-data.month_data.primogems_rate}`}%`},
Ħ������${data.month_data.mora_rate == 0 ? "���ϸ��²��" : `���ϸ���${data.month_data.mora_rate > 0 ? `����${data.month_data.mora_rate}` : `����${-data.month_data.mora_rate}`}%`}��`,
                    type,
                    userID
                );
            return;
        }
        const noteInfo = await notePromise(uid, region, userID, bot);
        data = noteInfo[1];
        baseTime = noteInfo[0];
        if (!data) {
            await bot.say(
                sendID,
                `[CQ:at,qq=${userID}] ��ȡʵʱ���ʧ��`,
                type,
                userID
            );
            return;
        }
    } catch (e) {
        // �׳��մ���ʹ�û���
        if ("" !== e) {
            await bot.say(sendID, `[CQ:at,qq=${userID}] ${e}`, type, userID);
            return;
        }
    }
    //if (hasEntrance(msg, "note", "get_note_pic")) {
    //    await render({ uid, data }, "genshin-note", sendID, type, userID, bot);
    //    return;
    //}
    const nowTime = new Date().valueOf();
    let message = `[CQ:at,qq=${userID}]
��֬${data.current_resin}/${data.max_resin} ί��${data.finished_task_num}/${data.total_task_num} ��ǲ${data.current_expedition_num}/${data.max_expedition_num}`;
    let [day, hour, min, sec] = getTime(parseInt(data.resin_recovery_time), (baseTime - nowTime) / 1000);
    message += `
��֬����ʱ�䣺${hour}ʱ${min}��${sec}��`;
    message += `
[ÿ��ί��]����${data.is_extra_task_reward_received ? "����ȡ" : "δ��ȡ"}`;
    message += `
����ʣ�����ļ������${data.remain_resin_discount_num}/${data.resin_discount_num_limit}`;
    let num = 1;
    for (var expedition of data.expeditions) {
        if (expedition)
            if (expedition.status == "Ongoing") {
                [day, hour, min, sec] = getTime(parseInt(expedition.remained_time), (baseTime - nowTime) / 1000);
                message += `
��ǲ${num}��${hour}ʱ${min}��${sec}��`;
            } else if (expedition.status == "Finished") {
                message += `
��ǲ${num}�������`;
            }
        num++;
    }
    await bot.say(sendID, message, type, userID);
}

async function Wrapper(Message, bot) {
    try {
        await Plugin(Message, bot);
    } catch (e) {
        bot.logger.error(e);
    }
}

export { Wrapper as run };
