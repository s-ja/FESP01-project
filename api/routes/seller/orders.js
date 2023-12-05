import express from 'express';
import { query, body } from 'express-validator';

import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';
import model from '#models/user/order.model.js';
import sellerModel from '#models/seller/order.model.js';
import _ from 'lodash';
import moment from 'moment';

const router = express.Router();

// 판매자의 모든 주문 내역 조회
router.get('/', async function(req, res, next) {
  try{
    const item = await sellerModel.findBy({seller_id: req.user._id, query: {}, sortBy: {_id: -1}});
    res.json({ ok: 1, item });

  }catch(err){
    next(err);
  }
});

// 주문 상태 수정
router.patch('/:_id', async function(req, res, next) {
  try{
    const _id = Number(req.params._id);
    const product_id = req.body.product_id;
    const order = await model.findById(_id);
    // 주문 내역 중 내 상품만 조회
    const orderProducts = _.filter(order.products, { _id: product_id, seller_id: req.user._id });

    if(req.user.type === 'admin' || orderProducts.length > 0){
      const history = {
        actor: req.user._id,
        updated: { ...req.body },
        createdAt: moment().format('YYYY.MM.DD HH:mm:ss')
      };
      const result = await model.updateState(_id, req.body, history);
      res.json({ok: 1, updated: result});
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

export default router;
