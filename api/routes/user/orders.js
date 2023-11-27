import express from 'express';
import { query, body } from 'express-validator';

import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';
import model from '#models/user/order.model.js';

const router = express.Router();

// 상품 구매
router.post('/', [
  body('products').isArray().withMessage('상품 목록은 배열로 전달해야 합니다.'),
  body('products.*._id').isInt().withMessage('상품 id는 정수만 입력 가능합니다.'),
  body('products.*.quantity').isInt().withMessage('상품 수량은 정수만 입력 가능합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['구매']
    #swagger.summary  = '상품 구매 - 1차'
    #swagger.description = '상품을 구매한다.'

    #swagger.security = [{
      "Access Token": []
    }]
    
    #swagger.requestBody = {
      description: "구매 정보",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/orderCreate' }
        }
      }
    },
    #swagger.responses[201] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/orderCreateRes" }
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
    const item = await model.create({ ...req.body, user_id: req.user._id });
    res.json({ok: 1, item});
  }catch(err){
    next(err);
  }
});

// 구매 목록 조회
router.get('/', [
  query('extra').optional().isJSON().withMessage('extra 값은 JSON 형식의 문자열이어야 합니다.'),
  query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.auto = false

    #swagger.tags = ['구매']
    #swagger.summary  = '구매 목록 조회 - 1차'
    #swagger.description = '구매 목록을 조회한다.'
    
    #swagger.security = [{
      "Access Token": []
    }]

  */

try{
  logger.trace(req.query);

  // 검색 옵션
  let search = {};

  const keyword = req.query.keyword;
  const extra = req.query.extra;

  if(keyword){
    const regex = new RegExp(keyword, 'i');
    search['name'] = { '$regex': regex };
  }
  
  if(extra){
    search = { ...search, ...JSON.parse(extra) };
  }

  // 정렬 옵션
  let sortBy = {};
  const sort = req.query.sort;

  if(sort){
    const parseOrder = JSON.parse(sort);
    sortBy = parseOrder;
  }

  // 기본 정렬 옵션은 등록일의 내림차순
  sortBy['createdAt'] = sortBy['createdAt'] || -1; // 내림차순

  const item = await model.findBy({ user_id: req.user._id, search, sortBy });
  
  res.json({ ok: 1, item });
}catch(err){
  next(err);
}
});

export default router;
