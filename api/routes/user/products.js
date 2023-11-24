import express from 'express';
import { query } from 'express-validator';

import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';
import model from '#models/user/product.model.js';

const router = express.Router();

// 상품 목록 조회
router.get('/', [
    query('extra').optional().isJSON().withMessage('extra 값은 JSON 형식의 문자열이어야 합니다.'),
    query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
  ], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.auto = false

    #swagger.tags = ['상품']
    #swagger.summary  = '상품 목록 조회 - 1차'
    #swagger.description = '상품 목록을 조회한다.'

    #swagger.parameters['minPrice'] = {
      description: "최저 가격",
      in: 'query',
      type: 'number',
      default: 0
    }
    #swagger.parameters['maxPrice'] = {
      description: "최고 가격",
      in: 'query',
      type: 'number',
      default: 99999999999
    }
    #swagger.parameters['minShippingFees'] = {
      description: "최저 배송비",
      in: 'query',
      type: 'number',
      default: 0
    }
    #swagger.parameters['maxShippingFees'] = {
      description: "최고 배송비",
      in: 'query',
      type: 'number',
      default: 99999999999
    }
    #swagger.parameters['keyword'] = {
      description: "상품명 검색어",
      in: 'query',
      type: 'string'
    }
    #swagger.parameters['seller_id'] = {
      description: "판매자 id",
      in: 'query',
      type: 'number'
    }
    #swagger.parameters['extra'] = {
      description: "extra 데이터 예시: {\&quot;extra.isNew\&quot;: true}",
      in: 'query',
      type: 'string'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/productListRes" }
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
  
    const item = await model.findBy({ search, sortBy });
    
    res.json({ ok: 1, item });
  }catch(err){
    next(err);
  }
});

// 상품 상세 조회
router.get('/:_id', async function(req, res, next) {

  /*
    #swagger.tags = ['상품']
    #swagger.summary  = '상품 상세 조회 - 1차'
    #swagger.description = '상품 상세 정보를 조회한다.'
    
    #swagger.parameters['_id'] = {
      description: "상품 id",
      in: 'path',
      type: 'number',
      example: 4
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
    const result = await model.findById(Number(req.params._id));
    if(result){
      res.json({ok: 1, item: result});
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

export default router;
