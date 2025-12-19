import logger from "./logger.js";
import { db as DBConfig } from "../config/index.js";
import { MongoClient } from "mongodb";
import _ from "lodash";
import codeUtil from "#utils/codeUtil.js";

var db;

// Connection URL
var url;
if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "development" ||
  process.env.DB_HOST.endsWith(".aws2.store")
) {
  if (DBConfig.protocol === "mongodb+srv") {
    // mongodb atlas
    url = `${DBConfig.protocol}://${DBConfig.user}:${DBConfig.password}@${DBConfig.host}`;
  } else {
    url = `${DBConfig.protocol}://${DBConfig.user}:${DBConfig.password}@${DBConfig.host}:${DBConfig.port}/${DBConfig.database}`;
  }
} else {
  url = `${DBConfig.protocol}://${DBConfig.host}:${DBConfig.port}`;
}

logger.log(`DB 접속: ${url}`);
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // 45 seconds
  serverSelectionTimeoutMS: 10000, // 서버 선택 타임아웃
  maxPoolSize: 20, // 커넥션 풀 최대 크기 설정
  minPoolSize: 5, // 커넥션 풀 최소 크기 설정
  maxIdleTimeMS: 30000, // 유휴 연결 자동 해제 시간 (30초)
});

// MongoDB 연결 시도 (재시도 로직 포함)
const connectWithRetry = async (maxRetries = 3, retryDelay = 5000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.log(`MongoDB 연결 시도 중... (${attempt}/${maxRetries})`);
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
      db.post = db.collection("post");

      await codeUtil.initCode(db);
      await codeUtil.initConfig(db);
      
      logger.info('MongoDB 컬렉션 초기화 완료');
      return;
    } catch (err) {
      logger.error(`MongoDB 연결 실패 (시도 ${attempt}/${maxRetries}):`, err);
      
      if (attempt < maxRetries) {
        logger.log(`${retryDelay / 1000}초 후 재시도합니다...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        logger.error('MongoDB 연결에 최종 실패했습니다.');
        throw err;
      }
    }
  }
};

try {
  await connectWithRetry();
} catch (err) {
  logger.error('MongoDB 연결 초기화 실패:', err);
  // 연결 실패 시에도 프로세스는 계속 실행되도록 함 (선택적)
}

export const getDB = () => db;

export const getClient = () => client;

// 연결 상태 확인 함수
export const isConnected = () => {
  try {
    return client && client.topology && client.topology.isConnected();
  } catch (err) {
    logger.debug('연결 상태 확인 중 오류:', err);
    return false;
  }
};

// 연결 상태 모니터링 (디버깅 및 모니터링용)
export const getConnectionInfo = () => {
  try {
    if (!client) {
      return { connected: false, message: 'MongoDB 클라이언트가 초기화되지 않았습니다.' };
    }
    
    const connected = isConnected();
    const topology = client.topology;
    
    return {
      connected,
      url: url.replace(/\/\/.*@/, '//***:***@'), // 비밀번호 마스킹
      topology: topology ? {
        isConnected: topology.isConnected(),
        servers: topology.s?.servers ? Object.keys(topology.s.servers).length : 0,
      } : null,
    };
  } catch (err) {
    logger.error('연결 정보 조회 중 오류:', err);
    return { connected: false, error: err.message };
  }
};

// MongoDB 연결 종료 함수
export const closeConnection = async () => {
  try {
    if (client) {
      // 연결 상태 확인
      if (isConnected()) {
        await client.close();
        logger.info('MongoDB 연결이 정상적으로 종료되었습니다.');
      } else {
        logger.log('MongoDB 연결이 이미 종료되었거나 연결되지 않았습니다.');
      }
    }
  } catch (err) {
    logger.error('MongoDB 연결 종료 중 오류:', err);
    throw err;
  }
};

export const nextSeq = async (_id) => {
  let result = await db.seq.findOneAndUpdate({ _id }, { $inc: { no: 1 } });
  if (!result) {
    result = { _id, no: 1 };
    await db.seq.insertOne({ _id, no: 2 });
  }
  return result.no;
};

export default db;
