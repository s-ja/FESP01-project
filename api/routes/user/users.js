import express from 'express';
import { body } from 'express-validator';

import validator from '#middlewares/validator.js';
import logger from '#utils/logger.js';
import model from '#models/user/user.model.js';
import userService from '#services/user.service.js';
import authService from '#services/auth.service.js';
import jwtAuth from '#middlewares/jwtAuth.js';

const router = express.Router();

// 회원 가입
router.post('/', [
  body('email').isEmail().withMessage('이메일 형식에 맞지 않습니다.'),
  body('password').trim().isLength({ min: 8 }).withMessage('8자리 이상 입력해야 합니다.'),
  body('name').trim().notEmpty().withMessage('이름은 필수로 입력해야 합니다.'),
  body('phone').optional().matches(/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/).withMessage('휴대폰 형식에 맞지 않습니다.'),
  body('type').matches(/(user|seller)/).withMessage('회원 구분은 user 또는 seller로 보내야 합니다.')
], validator.checkResult, async function(req, res, next) {
  /*
    #swagger.tags = ['회원']
    #swagger.summary  = '회원 가입'
    #swagger.description = '회원 가입을 합니다.<br>회원 가입을 완료한 후 회원 정보를 반환합니다.'
  */
  /* 
    #swagger.parameters['body'] = {
      description: '가입할 회원 정보',
      in: 'body',
      required: true,
      schema: {
        $ref: '#/definitions/UserInfo'
      }      
    },
    #swagger.responses[200] = {
      description: '성공',
      schema: { $ref: '#/definitions/ItemResponse' }
    },
    #swagger.responses[422] = {
      description: '파라미터 검증 실패',
      schema: { $ref: '#/definitions/Error422' }
    },
    #swagger.responses[500] = {
      description: '서버 에러',
      schema: { $ref: '#/definitions/Error500' }
    }
  */

  try{
    const item = await userService.signup(req.body);
    res.json({ok: 1, item});
  }catch(err){
    next(err);
  }
});

// 이메일 중복 체크
router.get('/email', async function(req, res, next) {
  /*
    #swagger.tags = ['회원']
    #swagger.summary  = '이메일 중복 체크'
    #swagger.description = '이메일 중복을 체크 합니다.'
  */
  /* 
    #swagger.parameters['email'] = {
      description: '가입할 회원 정보',
      in: 'body',
      required: true,
      schema: {
        $ref: '#/definitions/UserInfo'
      }      
    }
  */

  try{
    const user = await model.findBy({ email: req.query.email });
    res.json({ok: 1, duplicate: user ? true : false});
  }catch(err){
    next(err);
  }
});

// 로그인
router.post('/login', async function(req, res, next) {
  /*
    #swagger.tags = ['회원']
    #swagger.summary  = '로그인'
    #swagger.description = ''
  */
  /* 
    #swagger.parameters['email'] = {
      description: '가입할 회원 정보',
      in: 'body',
      required: true,
      schema: {
        $ref: '#/definitions/UserInfo'
      }
    }
  */
  try{
    const user = await userService.login(req.body);
    res.json({ ok: 1, item: user });
  }catch(err){
    next(err);
  }
});

// Access Token 재발행
router.get('/refresh', async (req, res, next) => {
  try{
    const refreshToken = req.headers.authorization && req.headers.authorization.split('Bearer ')[1];
    const accessToken = await authService.refresh(refreshToken);
  
    res.json({ ok: 1, accessToken });
  }catch(err){
    next(err);
  }
});

// 회원 조회(단일 속성)
router.get('/:_id/*', jwtAuth.auth('user'), async function(req, res, next) {
  try{
    if(req.user.type === 'admin' || req.params._id == req.user._id){
      logger.trace(req.params);
      const attr = req.params[0].replaceAll('/', '.');
      logger.log(attr);
      const item = await model.findAttrById(Number(req.params._id), attr);
      res.json({ok: 1, item});
    }else{
      next(); // 404
    }
  }catch(err){
    next(err);
  }
});

// 회원 조회(모든 속성)
router.get('/:_id', jwtAuth.auth('user'), async function(req, res, next) {
  try{
    if(req.user.type === 'admin' || req.params._id == req.user._id){
      const result = await model.findById(Number(req.params._id));
      res.json({ok: 1, item: result});
    }else{
      next(); // 404
    }
  }catch(err){
    next(err);
  }
});

// 회원 수정
router.patch('/:_id', jwtAuth.auth('user'), async function(req, res, next) {
  try{
    if(req.user.type === 'admin' || req.params._id == req.user._id){
      const result = await model.update(Number(req.params._id), req.body);
      res.json({ok: 1, updated: result});
    }else{
      next(); // 404
    }
  }catch(err){
    next(err);
  }
});

export default router;
