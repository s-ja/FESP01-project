#!/usr/bin/env node

/**
 * Module dependencies.
 */

import http from 'node:http';
import socketServer from './socketServer.js';
import { Server }  from 'socket.io';
import app from '../app.js';
import logger from '../utils/logger.js';
import config from '#config/index.js';
import { waitForConnection } from '../utils/dbUtil.js';


// require('http').createServer(function(req, res){
//   res.writeHead(301, {Location: 'https://localhost' + req.url}).end();
// }).listen(80);

/**
 * MongoDB 연결 대기 후 서버 시작
 */
async function startServer() {
  try {
    // MongoDB 연결이 완료될 때까지 대기
    logger.info('MongoDB 연결 확인 중...');
    await waitForConnection(30000); // 30초 타임아웃
    logger.info('MongoDB 연결 확인 완료. 서버를 시작합니다.');
  } catch (err) {
    logger.error('MongoDB 연결 실패로 서버를 시작할 수 없습니다:', err);
    logger.error('프로세스를 종료합니다.');
    process.exit(1);
  }

  /**
   * Get port from environment and store in Express.
   */
  var port = normalizePort(process.env.PORT || '3000');
  app.set('port', port);

  /**
   * Create HTTP server.
   */
  var server = http.createServer(app);

  /**
   * Listen on provided port, on all network interfaces.
   */
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

  // socket.io 서버 구동
  const io = new Server(server, { cors: { origin: config.cors.origin } } );
  socketServer(io);

  // 우아한 종료 처리
  const gracefulShutdown = async (signal) => {
    logger.info(`${signal} 신호를 받았습니다. 서버를 종료합니다...`);
    
    // Socket.IO 서버 종료
    io.close(() => {
      logger.info('Socket.IO 서버가 종료되었습니다.');
    });
    
    // HTTP 서버 종료
    server.close(async () => {
      logger.info('HTTP 서버가 종료되었습니다.');
      
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
}

// 서버 시작
startServer();

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  logger.info(`API 서버 구동 완료. ${process.env.API_HOST}`);
}