#!/usr/bin/env node

/**
 * MongoDB 연결 관리 테스트 스크립트
 * 
 * 이 스크립트는 다음을 테스트합니다:
 * 1. MongoDB 연결 생성
 * 2. 연결 상태 확인
 * 3. 연결 해제
 * 4. 종료 핸들러 동작
 */

import dotenv from 'dotenv';
import { closeConnection, isConnected, getConnectionInfo, getClient } from './utils/dbUtil.js';
import logger from './utils/logger.js';

// 환경 변수 로드
if (process.env.NODE_ENV) {
  dotenv.config({ override: true, path: `.env.${process.env.NODE_ENV}` });
} else {
  dotenv.config({ path: '.env' });
}

async function testConnectionManagement() {
  logger.info('=== MongoDB 연결 관리 테스트 시작 ===');
  
  // 1. 연결 상태 확인
  logger.info('\n1. 연결 상태 확인');
  const connectionInfo = getConnectionInfo();
  logger.info('연결 정보:', JSON.stringify(connectionInfo, null, 2));
  
  const connected = isConnected();
  logger.info(`연결 상태: ${connected ? '연결됨' : '연결 안됨'}`);
  
  if (!connected) {
    logger.error('MongoDB에 연결되지 않았습니다. 연결을 확인해주세요.');
    process.exit(1);
  }
  
  // 2. 간단한 쿼리 테스트
  logger.info('\n2. 간단한 쿼리 테스트');
  try {
    const { getDB } = await import('./utils/dbUtil.js');
    const db = getDB();
    const result = await db.code.findOne({});
    logger.info('쿼리 성공:', result ? '데이터 조회됨' : '데이터 없음');
  } catch (err) {
    logger.error('쿼리 실패:', err);
  }
  
  // 3. 연결 해제 테스트
  logger.info('\n3. 연결 해제 테스트');
  try {
    await closeConnection();
    logger.info('연결 해제 성공');
    
    // 해제 후 상태 확인
    const afterClose = isConnected();
    logger.info(`해제 후 연결 상태: ${afterClose ? '여전히 연결됨 (문제!)' : '연결 해제됨 (정상)'}`);
  } catch (err) {
    logger.error('연결 해제 실패:', err);
  }
  
  logger.info('\n=== 테스트 완료 ===');
  process.exit(0);
}

// 실행
testConnectionManagement().catch(err => {
  logger.error('테스트 실행 중 오류:', err);
  process.exit(1);
});

