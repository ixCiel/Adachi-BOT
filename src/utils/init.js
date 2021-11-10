/* global bots, rootdir */
/* eslint no-undef: "error" */

import schedule from "node-schedule";
import puppeteer from "puppeteer";
import express from "express";
import db from "./database.js";
import { gachaUpdate as updateGachaJob } from "./update.js";

function initDB() {
  db.init("aby");
  db.init("artifact");
  db.init("authority");
  db.init("character");
  db.init("cookies", { cookie: [], uid: [] });
  db.init("cookies_invalid", { cookie: [] });
  db.init("gacha", { user: [], data: [] });
  db.init("info");
  db.init("map");
  db.init("music", { source: [] });
  db.init("time");
  db.init("note", { user: [], cookie: [] });
}

async function initBrowser() {
  global.browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

function cleanDB(name) {
  let nums = db.clean(name);

  // 只打印一次日志
  bots[0] && bots[0].logger.debug(`清理：删除数据库 ${name} 中 ${nums} 条无用记录。`);
  return nums;
}

function cleanDBJob() {
  let nums = 0;
  nums += cleanDB("aby");
  nums += cleanDB("cookies");
  nums += cleanDB("cookies_invalid");
  nums += cleanDB("info");
  return nums;
}

function serve(port = 9934) {
  const server = express();
  server.use(express.static(rootdir));
  server.listen(port, "localhost");
}

async function init() {
  await initBrowser();
  serve(9934);
  initDB();
  updateGachaJob();
  cleanDBJob();

  schedule.scheduleJob("1 */1 * * *", async () => updateGachaJob());
  schedule.scheduleJob("1 */1 * * *", async () => cleanDBJob());
}

export { init };
