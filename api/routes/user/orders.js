import express from 'express';
import { query } from 'express-validator';

import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';
import model from '#models/user/order.model.js';

const router = express.Router();

// 상품 구매
router.post('/', async function(req, res, next) {  
  try{
    const item = await model.create({ ...req.body, user_id: req.user._id });
    res.json({ok: 1, item});
  }catch(err){
    next(err);
  }
});

// 구매 내역 검색
router.get('/', [
  query('extra').optional().isJSON().withMessage('extra 값은 JSON 형식의 문자열이어야 합니다.'),
  query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
], validator.checkResult, async function(req, res, next) {
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
