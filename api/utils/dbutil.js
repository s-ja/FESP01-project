import logger from "./logger.js";
import { db as DBConfig } from "../config/index.js";
import { MongoClient } from "mongodb";
import _ from "lodash";
import codeUtil from "#utils/codeutil.js";

var db;

// Connection URL
var url;
if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "development"
) {
  // url = `mongodb://${DBConfig.user}:${DBConfig.password}@${DBConfig.host}:${DBConfig.port}/${DBConfig.database}`;
  url = `mongodb+srv://edutube:SPdF1uUQ0FvtHzN7@edutube.ckbnxyg.mongodb.net/edutube`;
} else {
  url = `mongodb://${DBConfig.host}:${DBConfig.port}`;
}

logger.log(`DB 접속: ${url}`);
const client = new MongoClient(url);

try {
  await client.connect();
  logger.info(`DB 접속 성공: ${url}`);
  db = client.db(DBConfig.database);
  db.user = db.collection("user");
  db.product = db.collection("product");
  db.cart = db.collection("cart");
  db.order = db.collection("order");
  db.reply = db.collection("reply");
  db.seq = db.collection("seq");
  db.code = db.collection("code");
  db.bookmark = db.collection("bookmark");
  db.config = db.collection("config");

  await codeUtil.initCode(db);

  await codeUtil.initConfig(db);
} catch (err) {
  logger.error(err);
}

export const getDB = () => db;

export const getClient = () => client;

export const nextSeq = async (_id) => {
  let result = await db.seq.findOneAndUpdate({ _id }, { $inc: { no: 1 } });
  logger.debug(_id, result.no);
  return result.no;
};

export default db;
