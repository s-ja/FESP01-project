#!/usr/bin/env node

/**
 * Module dependencies.
 */

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import socketServer from './socketServer.js';
import { Server }  from 'socket.io';
import app from '../app.js';
import logger from '../utils/logger.js';
import config from '#config/index.js';

import greenlock from 'greenlock-express';

greenlock.init({
  packageRoot: '.',
  configDir: './greenlock.d',
  maintainerEmail: "uzoolove@gmail.com",
  cluster: false,
}).ready(glx => {
  // socket.io 서버 구동
  // const io = 
  // socketServer(io);

  const server = glx.httpsServer();
  const io = new Server(server, { cors: { origin: config.cors.origin } } );
  socketServer(io);

  glx.serveApp(app);

  // 우아한 종료 처리
  const gracefulShutdown = async (signal) => {
    logger.info(`${signal} 신호를 받았습니다. 서버를 종료합니다...`);
    
    // Socket.IO 서버 종료
    io.close(() => {
      logger.info('Socket.IO 서버가 종료되었습니다.');
    });
    
    // HTTPS 서버 종료
    server.close(async () => {
      logger.info('HTTPS 서버가 종료되었습니다.');
      
      // MongoDB 연결 종료
      try {
        const { closeConnection } = await import('../utils/dbUtil.js');
        await closeConnection();
      } catch (err) {
        logger.error('MongoDB 연결 종료 중 오류:', err);
      }
      
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
});