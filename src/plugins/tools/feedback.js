async function feedback(msg) {
  const info = msg.text.split(/(?<=^\S+)\s/).slice(1);
  const text = `我这就去给主人带个话！如果有重要的反馈和建议可以到这里留言哦：
https://github.com/Arondight/Adachi-BOT/issues`;
  const textMaster =
    (msg.sid == msg.uid ? "" : `${msg.group_name}（${msg.sid}）中的`) +
    `${msg.name}（${msg.uid}）给主人带个话：\n${info}`;

  // 私聊无法 @
  await msg.bot.sayMaster(msg.sid, textMaster, msg.type, msg.uid);
  await msg.bot.say(msg.sid, text, msg.type, msg.uid);
}

export { feedback };
