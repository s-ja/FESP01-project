import express from 'express';
import { query } from 'express-validator';
import _ from 'lodash';

import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';
import model from '#models/code/code.model.js';
import jwtAuth from '#middlewares/jwtAuth.js';

const router = express.Router();

// 코드 등록
router.post('/', async function(req, res, next) {
  /*
    #swagger.tags = ['코드']
    #swagger.summary  = '코드 등록 - 2차'
    #swagger.description = '코드를 등록합니다.<br>코드 등록을 완료한 후 코드 정보를 반환합니다.'

    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.requestBody = {
      description: "코드 정보",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/createCode' },
          examples: {
            "회원 등급 코드": { $ref: "#/components/examples/createUserLevelCode" },
            "카테고리 코드": { $ref: "#/components/examples/createCategoryCode" }
          }
        }
      }
    }
    #swagger.responses[201] = {
      description: '성공',
      content: {
        "application/json": {
          examples: {
            "회원 등급 코드": { $ref: "#/components/examples/createCodeRes" }
          }
        }
      }
    }
    #swagger.responses[401] = {
      description: '인증 실패',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/error401" }
        }
      }
    }
    #swagger.responses[409] = {
      description: '이미 등록된 리소스',
      content: {
        "application/json": {
          schema: { $ref: '#/components/schemas/error409' }
        }
      }
    }
    #swagger.responses[422] = {
      description: '입력값 검증 오류',
      content: {
        "application/json": {
          schema: { $ref: '#/components/schemas/error422' }
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
    const item = await model.create(req.body);
    res.status(201).json({ok: 1, item});
  }catch(err){
    next(err);
  }
});

// 코드 수정
router.put('/:_id', async function(req, res, next) {
  /*
    #swagger.tags = ['코드']
    #swagger.summary  = '코드 수정 - 2차'
    #swagger.description = '코드를 수정한다.'

    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['_id'] = {
      description: "회원 id",
      in: 'path',
      type: 'string',
      example: 'userLevel'
    }

    #swagger.requestBody = {
      description: "수정할 코드 정보",
      required: true,
      content: {
        "application/json": {
          examples: {
            "기본 속성": { $ref: "#/components/examples/createUserLevelCode" },
            "extra 속성": { $ref: "#/components/examples/updateUserWithExtra" }
          }
        }
      }
    }
    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          examples: {
            "기본 속성": { $ref: "#/components/examples/updateeUserLevelCode" }
          }
        }
      }
    },
    #swagger.responses[401] = {
      description: '인증 실패',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/error401" }
        }
      }
    },
    #swagger.responses[404] = {
      description: '코드가 존재하지 않거나 접근 권한 없음',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/error404" }
        }
      }
    },
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
    const result = await model.update(req.params._id, req.body);
    if(!result){
      
    }
    res.json({ok: 1, updated: result});
  }catch(err){
    next(err);
  }
});

// 코드 삭제
router.delete('/:_id', async function(req, res, next) {
  try{
    const result = await model.delete(req.params._id);
    res.json({ok: 1, deleted: result});
  }catch(err){
    next(err);
  }
});


export default router;
