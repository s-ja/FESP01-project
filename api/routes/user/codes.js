import express from 'express';
import _ from 'lodash';

import logger from '#utils/logger.js';
import model from '#models/code/code.model.js';
import codeutil from '#utils/codeutil.js';
import querystring from 'querystring';

const router = express.Router();

// 코드 목록 조회
router.get('/', async function(req, res, next) {
  /*
    #swagger.auto = false

    #swagger.tags = ['코드']
    #swagger.summary  = '코드 목록 조회 - 선택'
    #swagger.description = '코드 목록을 조회한다.'

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/codeListRes" }
        }
      }
    }
    #swagger.responses[500] = {
      description: '서버 에러',
      content: {
        "application/json": {
          schema: { $ref: '#/components/schemas/error500' }
        }
      }
    }
  */

  try{
    // let item = await model.find();
    // logger.debug('code', item);
    // if(item.length > 0){
      const item = {
        nested: codeutil.getCodeObj(),
        flatten: codeutil.getCodeFlatten()
      };
    // }
    res.json({ ok: 1, item });
  }catch(err){
    next(err);
  }
});

// 코드 한건 조회
router.get('/:_id', async function(req, res, next) {
  /*
    #swagger.tags = ['코드']
    #swagger.summary  = '코드 한건 조회 - 2차'
    #swagger.description = '코드 한건을 조회한다.'

    #swagger.parameters['_id'] = {
      description: "코드 id",
      in: 'path',
      type: 'string',
      example: 'userLevel'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/codeDetailRes" }
        }
      }
    }
    #swagger.responses[404] = {
      description: '리소스가 존재하지 않음',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/error404" }
        }
      }
    }
    #swagger.responses[500] = {
      description: '서버 에러',
      content: {
        "application/json": {
          schema: { $ref: '#/components/schemas/error500' }
        }
      }
    }
  */

  try{
    // 검색어 포함
    let item = await model.findById(req.params._id, req.query);
    if(item){
      // 검색 조건이 없을 경우 중첩 객체로 변환
      if(Object.keys(req.query).length === 0 ) {
        item = codeutil.generateCodeObj([item]);
      }
      res.json({ ok: 1, item });
    }else{
      next();
    }    
  }catch(err){
    next(err);
  }
});

export default router;
