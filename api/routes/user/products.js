import express from 'express';
import { query } from 'express-validator';

import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';
import model from '#models/user/product.model.js';

const router = express.Router();

// 상품 검색
router.get('/', [
    query('extra').optional().isJSON().withMessage('extra 값은 JSON 형식의 문자열이어야 합니다.'),
    query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
  ], validator.checkResult, async function(req, res, next) {
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
