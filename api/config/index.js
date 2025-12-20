import logger from "../utils/logger.js";
import dotenv from "dotenv";

// 환경 변수가 이미 설정되어 있는지 확인 (배포 환경에서 Koyeb 등이 설정한 경우)
// DB_HOST와 DB_DATABASE가 모두 설정되어 있으면 .env 파일을 로드하지 않음
const envVarAlreadySet = process.env.DB_HOST && process.env.DB_DATABASE;

if (!envVarAlreadySet) {
  // 환경 변수가 설정되지 않은 경우에만 .env 파일 로드 (로컬/개발 환경)
  // 기본 .env 파일 로딩(package.json에서 로딩함)
  dotenv.config({ path: ".env" });
  // 환경별 .env 파일 로딩
  if (process.env.NODE_ENV) {
    dotenv.config({ override: true, path: `.env.${process.env.NODE_ENV}` });
  }
  logger.log("환경 변수 파일(.env)에서 설정을 로드했습니다.");
} else {
  logger.log("환경 변수가 이미 설정되어 있습니다. .env 파일을 로드하지 않습니다.");
}

logger.log("NODE_ENV", process.env.NODE_ENV);

export const db = {
  protocol: process.env.DB_PROTOCOL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

export const jwt = {
  access: {
    secretKey: "ShoppingAccessToken", // 암호키
    options: {
      algorithm: "HS256", // 대칭키 방식
      expiresIn: "2h", // 2시간
      // expiresIn: '10m', // 10분
      // expiresIn: "3m", // 3분
      // expiresIn: "10s", // 10초
      issuer: "FESP01", // 발행자
    },
  },
  refresh: {
    secretKey: "ShoppingRefreshToken",
    options: {
      algorithm: "HS256",
      expiresIn: "30d",
      // expiresIn: "30s",
      issuer: "FESP01",
    },
  },
};

export const cors = {
  origin: [
    /^https?:\/\/localhost/,
    /^https?:\/\/127.0.0.1/,
    /netlify.app$/,
    /vercel.app$/,
    /aws2.store$/,
    new RegExp(process.env.APP_HOST),
  ],
};

export default { db, jwt, cors };
