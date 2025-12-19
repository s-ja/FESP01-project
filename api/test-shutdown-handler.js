#!/usr/bin/env node

/**
 * 서버 종료 핸들러 테스트 스크립트
 * 
 * 이 스크립트는 종료 핸들러가 제대로 동작하는지 테스트합니다.
 * 
 * 사용법:
 * 1. 이 스크립트를 실행합니다: node test-shutdown-handler.js
 * 2. 다른 터미널에서 다음 명령으로 종료 신호를 보냅니다:
 *    - SIGTERM: kill -TERM <PID>
 *    - SIGINT: Ctrl+C
 */

import http from 'node:http';
import logger from './utils/logger.js';
import { closeConnection } from './utils/dbUtil.js';

// 간단한 HTTP 서버 생성
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK\n');
});

const port = 3001;
server.listen(port, () => {
  logger.info(`테스트 서버가 포트 ${port}에서 실행 중입니다.`);
  logger.info(`프로세스 ID: ${process.pid}`);
  logger.info('종료 테스트를 위해 다음 중 하나를 시도하세요:');
  logger.info(`  - 다른 터미널에서: kill -TERM ${process.pid}`);
  logger.info(`  - 또는: kill -INT ${process.pid}`);
  logger.info('  - 또는 이 터미널에서: Ctrl+C');
});

// 우아한 종료 처리
const gracefulShutdown = async (signal) => {
  logger.info(`\n${signal} 신호를 받았습니다. 서버를 종료합니다...`);
  
  server.close(async () => {
    logger.info('HTTP 서버가 종료되었습니다.');
    
    // MongoDB 연결 종료
    try {
      await closeConnection();
      logger.info('MongoDB 연결이 종료되었습니다.');
    } catch (err) {
      logger.error('MongoDB 연결 종료 중 오류:', err);
    }
    
    logger.info('모든 리소스가 정리되었습니다.');
    process.exit(0);
  });
  
  // 강제 종료 타임아웃 (10초)
  setTimeout(() => {
    logger.error('강제 종료: 모든 연결을 닫지 못했습니다.');
    process.exit(1);
  }, 10000);
};

// 종료 신호 핸들러 등록
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 예기치 않은 오류 처리
process.on('uncaughtException', (err) => {
  logger.error('예기치 않은 오류:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('처리되지 않은 Promise 거부:', reason);
  gracefulShutdown('unhandledRejection');
});

