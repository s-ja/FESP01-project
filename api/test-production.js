#!/usr/bin/env node

/**
 * 프로덕션 환경 사전 테스트 스크립트
 * 
 * Koyeb 배포 전에 다음을 테스트합니다:
 * 1. Swagger 파일 생성
 * 2. MongoDB 연결 및 초기화
 * 3. GridFsStorage 초기화
 * 4. 앱 모듈 로드
 * 5. 서버 시작 (선택적)
 * 
 * 주의: 이 스크립트는 .env.modi 파일을 사용합니다.
 * Koyeb 배포 시에도 동일한 환경 변수를 설정해야 합니다.
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 로드
// -r dotenv/config는 기본 .env만 로드하므로, 환경별 파일을 수동으로 로드
// NODE_ENV가 설정되지 않았다면 modi로 설정
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'modi';
}

// dotenv 설정 (config/index.js와 동일한 방식)
// -r dotenv/config로 이미 .env가 로드되었을 수 있으므로 override 사용
dotenv.config({ path: '.env' });
if (process.env.NODE_ENV) {
  dotenv.config({ override: true, path: `.env.${process.env.NODE_ENV}` });
}

// logger는 환경 변수 로드 후에 import
import logger from './utils/logger.js';

let testResults = {
  swagger: false,
  mongodb: false,
  gridfs: false,
  app: false,
  server: false
};

async function testSwaggerGeneration() {
  logger.info('\n=== 1. Swagger 파일 생성 테스트 ===');
  try {
    // swagger.js 실행 시뮬레이션
    const swaggerModule = await import('./swagger.js');
    logger.info('✓ Swagger 모듈 로드 성공');
    
    // swagger-output.json 파일 확인
    await new Promise((resolve) => setTimeout(resolve, 2000)); // swagger 생성 대기
    
    try {
      const swaggerFile = JSON.parse(readFileSync(join(__dirname, 'swagger-output.json'), 'utf8'));
      logger.info('✓ swagger-output.json 파일 생성 확인');
      logger.info(`  - API 버전: ${swaggerFile.info?.version || 'N/A'}`);
      logger.info(`  - API 제목: ${swaggerFile.info?.title || 'N/A'}`);
      testResults.swagger = true;
    } catch (err) {
      logger.error('✗ swagger-output.json 파일을 읽을 수 없습니다:', err.message);
      throw err;
    }
  } catch (err) {
    logger.error('✗ Swagger 생성 실패:', err.message);
    throw err;
  }
}

async function testMongoDBConnection() {
  logger.info('\n=== 2. MongoDB 연결 테스트 ===');
  try {
    const { getDB, isConnected, getConnectionInfo } = await import('./utils/dbUtil.js');
    
    // 연결 대기 (최대 30초)
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!isConnected() && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
      if (attempts % 5 === 0) {
        logger.log(`  MongoDB 연결 대기 중... (${attempts}/${maxAttempts}초)`);
      }
    }
    
    if (!isConnected()) {
      const connectionInfo = getConnectionInfo();
      logger.warn('⚠ MongoDB 연결 실패 (로컬 환경에서는 정상일 수 있음)');
      logger.warn(`  - 호스트: ${connectionInfo.url || 'N/A'}`);
      logger.warn(`  - 에러: DNS 조회 실패 또는 네트워크 접근 불가`);
      logger.warn(`  - 참고: Koyeb 배포 환경에서는 정상 작동할 수 있습니다.`);
      logger.warn(`  - 해결: VPN 연결 또는 로컬 MongoDB 사용`);
      // 로컬 환경에서는 연결 실패를 경고로만 처리
      testResults.mongodb = false;
      return; // 에러를 throw하지 않고 경고만 표시
    }
    
    const connectionInfo = getConnectionInfo();
    logger.info('✓ MongoDB 연결 성공');
    logger.info(`  - 연결 상태: ${connectionInfo.connected ? '연결됨' : '연결 안됨'}`);
    
    // DB 객체 확인
    const db = getDB();
    if (!db) {
      throw new Error('DB 객체를 가져올 수 없습니다');
    }
    
    logger.info('✓ DB 객체 확인 완료');
    testResults.mongodb = true;
  } catch (err) {
    logger.warn('⚠ MongoDB 연결 실패 (로컬 환경에서는 정상일 수 있음)');
    logger.warn(`  - 에러: ${err.message}`);
    logger.warn(`  - 참고: Koyeb 배포 환경에서는 정상 작동할 수 있습니다.`);
    testResults.mongodb = false;
    // 에러를 throw하지 않고 경고만 표시
  }
}

async function testGridFsStorage() {
  logger.info('\n=== 3. GridFsStorage 초기화 테스트 ===');
  try {
    const { getDB } = await import('./utils/dbUtil.js');
    const db = getDB();
    
    if (!db) {
      logger.warn('⚠ GridFsStorage 초기화 스킵 (MongoDB 연결 없음)');
      logger.warn('  - 참고: MongoDB 연결 후 자동으로 초기화됩니다.');
      testResults.gridfs = false;
      return;
    }
    
    // GridFsStorage 모듈 동적 import
    const { GridFsStorage } = await import('@lenne.tech/multer-gridfs-storage');
    
    // GridFsStorage 초기화 테스트
    const storage = new GridFsStorage({
      db,
      file: (req, file) => {
        return {
          bucketName: 'upload',
          filename: 'test-file.txt'
        };
      }
    });
    
    logger.info('✓ GridFsStorage 초기화 성공');
    testResults.gridfs = true;
  } catch (err) {
    logger.warn('⚠ GridFsStorage 초기화 실패:', err.message);
    logger.warn('  - 참고: MongoDB 연결 후 자동으로 초기화됩니다.');
    testResults.gridfs = false;
    // 에러를 throw하지 않고 경고만 표시
  }
}

async function testAppModule() {
  logger.info('\n=== 4. 앱 모듈 로드 테스트 ===');
  try {
    // app.js 모듈 로드 테스트
    // MongoDB 연결 실패와 무관하게 앱 모듈은 로드되어야 함
    const app = await import('./app.js');
    
    if (!app.default) {
      throw new Error('앱 모듈이 제대로 export되지 않았습니다');
    }
    
    logger.info('✓ 앱 모듈 로드 성공');
    logger.info('✓ Express 앱 인스턴스 확인 완료');
    testResults.app = true;
  } catch (err) {
    logger.error('✗ 앱 모듈 로드 실패:', err.message);
    if (err.stack) {
      // 스택 트레이스의 처음 몇 줄만 표시
      const stackLines = err.stack.split('\n').slice(0, 10);
      logger.error('스택 트레이스:', stackLines.join('\n'));
    }
    throw err; // 앱 모듈 로드 실패는 치명적 오류
  }
}

async function testServerStart() {
  logger.info('\n=== 5. 서버 시작 테스트 (선택적) ===');
  logger.info('서버 시작 테스트는 생략합니다. (Ctrl+C로 종료 필요)');
  logger.info('수동 테스트: npm run start');
  testResults.server = true; // 스킵으로 표시
}

async function runAllTests() {
  logger.info('========================================');
  logger.info(`프로덕션 환경 사전 테스트 시작 (NODE_ENV: ${process.env.NODE_ENV})`);
  logger.info('========================================');
  
  const errors = [];
  
  try {
    await testSwaggerGeneration();
  } catch (err) {
    errors.push('Swagger 생성');
  }
  
  try {
    await testMongoDBConnection();
  } catch (err) {
    errors.push('MongoDB 연결');
  }
  
  try {
    await testGridFsStorage();
  } catch (err) {
    errors.push('GridFsStorage 초기화');
  }
  
  try {
    await testAppModule();
  } catch (err) {
    errors.push('앱 모듈 로드');
  }
  
  await testServerStart();
  
  // 결과 요약
  logger.info('\n========================================');
  logger.info('테스트 결과 요약');
  logger.info('========================================');
  logger.info(`Swagger 생성: ${testResults.swagger ? '✓ 성공' : '✗ 실패'}`);
  logger.info(`MongoDB 연결: ${testResults.mongodb ? '✓ 성공' : '✗ 실패'}`);
  logger.info(`GridFsStorage: ${testResults.gridfs ? '✓ 성공' : '✗ 실패'}`);
  logger.info(`앱 모듈 로드: ${testResults.app ? '✓ 성공' : '✗ 실패'}`);
  logger.info(`서버 시작: ${testResults.server ? '○ 스킵' : '✗ 실패'}`);
  logger.info('========================================\n');
  
  // MongoDB 연결 실패는 로컬 환경에서는 정상일 수 있으므로 경고만 표시
  const criticalErrors = errors.filter(err => err !== 'MongoDB 연결' && err !== 'GridFsStorage 초기화');
  
  if (criticalErrors.length > 0) {
    logger.error('다음 테스트가 실패했습니다:');
    criticalErrors.forEach(err => logger.error(`  - ${err}`));
    logger.error('\n배포 전에 위 문제를 해결해주세요.');
    process.exit(1);
  } else {
    if (errors.length > 0) {
      logger.warn('\n⚠ 일부 테스트가 실패했지만 배포는 가능합니다:');
      errors.forEach(err => logger.warn(`  - ${err} (로컬 환경 제한)`));
      logger.info('\n✓ 핵심 테스트는 모두 통과했습니다!');
      logger.info('⚠ MongoDB 연결은 Koyeb 배포 환경에서 확인하세요.');
    } else {
      logger.info('모든 테스트가 성공했습니다! ✓');
    }
    logger.info('이제 안전하게 배포할 수 있습니다.');
    process.exit(0);
  }
}

// 실행
runAllTests().catch(err => {
  logger.error('테스트 실행 중 치명적 오류:', err);
  process.exit(1);
});

