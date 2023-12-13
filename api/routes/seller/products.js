import express from 'express';
import { query, body } from 'express-validator';

import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';
import model from '#models/user/product.model.js';

const router = express.Router();

// 판매 상품 목록 조회
router.get('/', [
    query('extra').optional().isJSON().withMessage('extra 값은 JSON 형식의 문자열이어야 합니다.'),
    query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
  ], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.auto = false

    #swagger.tags = ['상품']
    #swagger.summary  = '판매 상품 목록 조회 - 1차'
    #swagger.description = '자신의 판매 상품 목록을 조회한다.'

    #swagger.security = [{
      "Access Token": []
    }]

  */

  try{
    logger.trace(req.query);

    // 검색 옵션
    let search = {
      price: {},
      shippingFees: {}
    };

    const minPrice = Number(req.query.minPrice) || 0;
    const maxPrice = Number(req.query.maxPrice) || 99999999999;
    const minShippingFees = Number(req.query.minShippingFees) || 0;    
    const maxShippingFees = Number(req.query.maxShippingFees) || 99999999999;    
    const seller = Number(req.query.seller_id);
    const keyword = req.query.keyword;
    const extra = req.query.extra;

    search.price['$gte'] = minPrice;
    search.price['$lte'] = maxPrice;
    search.shippingFees['$gte'] = minShippingFees;
    search.shippingFees['$lte'] = maxShippingFees;

    if(seller){
      search['seller_id'] = seller;
    }

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

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 0);
  
    const result = await model.findBy({ sellerId: req.user._id, search, sortBy, page, limit });
    
    res.json({ ok: 1, ...result });
  }catch(err){
    next(err);
  }
});

// 판매 상품 상세 조회
router.get('/:_id', async function(req, res, next) {

  /*
    #swagger.tags = ['상품']
    #swagger.summary  = '판매 상품 상세 조회 - 1차'
    #swagger.description = '자신의 판매 상품 정보를 조회한다.'

    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['_id'] = {
      description: "상품 id",
      in: 'path',
      type: 'number',
      example: 6
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/productInfoRes" }
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
    const result = await model.findById({ _id: Number(req.params._id), seller_id: req.user._id });
    if(result && (result.seller_id == req.user._id || req.user.type === 'admin')){
        res.json({ok: 1, item: result});
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 상품 등록
router.post('/', [
  body('price').isInt().withMessage('상품 가격은 정수만 입력 가능합니다.'),
  body('shippingFees').isInt().withMessage('배송비는 정수만 입력 가능합니다.'),
  body('name').trim().isLength({ min: 2 }).withMessage('상품명은 2글자 이상 입력해야 합니다.'),
  body('mainImages').isArray().withMessage('메인 이미지는 배열로 전달해야 합니다.'),
  body('content').trim().isLength({ min: 10 }).withMessage('상품 설명은 10글자 이상 입력해야 합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.auto = false

    #swagger.tags = ['상품']
    #swagger.summary  = '상품 등록 - 1차'
    #swagger.description = '상품을 등록합니다.<br>상품 등록 후 상품 정보를 반환합니다.'

    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.requestBody = {
      description: "상품 정보",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/productCreate' }
        }
      }
    },
    #swagger.responses[201] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/productCreateRes" }
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
    const newProduct = req.body;
    newProduct.seller_id = req.user._id;
    const item = await model.create(newProduct);
    res.json({ok: 1, item});
  }catch(err){
    next(err);
  }
});

// 상품 수정
router.patch('/:_id', [
  body('price').optional().isInt().withMessage('상품 가격은 정수만 입력 가능합니다.'),
  body('shippingFees').optional().isInt().withMessage('배송비는 정수만 입력 가능합니다.'),
  body('name').optional().trim().isLength({ min: 2 }).withMessage('상품명은 2글자 이상 입력해야 합니다.'),
  body('mainImages').optional().isArray().withMessage('메인 이미지는 배열로 전달해야 합니다.'),
  body('content').optional().trim().isLength({ min: 10 }).withMessage('상품 설명은 10글자 이상 입력해야 합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['상품']
    #swagger.summary  = '상품 수정 - 1차'
    #swagger.description = '상품을 수정한다.'

    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['_id'] = {
      description: "상품 id",
      in: 'path',
      type: 'number',
      example: '6'
    }

    #swagger.requestBody = {
      description: "수정할 상품 정보",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/productUpdate' }
        }
      }
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/productUpdateRes" }
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
    #swagger.responses[404] = {
      description: '상품이 존재하지 않거나 접근 권한 없음',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/error404" }
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
    const _id = Number(req.params._id);
    const product = await model.findAttrById({ _id, attr: 'seller_id', seller_id: req.user._id });
    if(req.user.type === 'admin' || product?.seller_id == req.user._id){
      const result = await model.update(_id, req.body);
      res.json({ok: 1, updated: result});
    }else{
      next(); // 404
    }
  }catch(err){
    next(err);
  }
});

// 상품 삭제
router.delete('/:_id', async function(req, res, next) {

  /*
    #swagger.tags = ['상품']
    #swagger.summary  = '상품 삭제 - 1차'
    #swagger.description = '상품을 삭제한다.'

    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['_id'] = {
      description: "상품 id",
      in: 'path',
      type: 'number',
      example: '6'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/simpleOK" }
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
    #swagger.responses[404] = {
      description: '상품이 존재하지 않거나 접근 권한 없음',
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
    const _id = Number(req.params._id);
    const product = await model.findAttrById({ _id, attr: 'seller_id', seller_id: req.user._id });
    if(req.user.type === 'admin' || product?.seller_id == req.user._id){
      const result = await model.delete(_id);
      res.json({ ok: 1 });
    }else{
      next(); // 404
    }
  }catch(err){
    next(err);
  }
});

export default router;
