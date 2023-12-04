import express from 'express';
import { query } from 'express-validator';
import jwtAuth from '#middlewares/jwtAuth.js';

import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';
import model from '#models/user/reply.model.js';

const router = express.Router();

// 구매 후기 등록
router.post('/', jwtAuth.auth('user'), async function(req, res, next) {

  /*
    #swagger.tags = ['구매 후기']
    #swagger.summary  = '구매 후기 등록 - 1차'
    #swagger.description = '구매 후기를 등록한다.'
    
    #swagger.security = [{
      "Access Token": []
    }]
    
  */


  try{
    try{
      const item = await model.create({ ...req.body, user_id: req.user._id });
      res.json({ok: 1, item});
    }catch(err){
      next(err);
    }
  }catch(err){
    next(err);
  }
});

// 내 후기 목록 조회
router.get('/', jwtAuth.auth('user'), async function(req, res, next) {
  try{
    const user_id = req.user._id;
    const item = await model.findByUser(user_id);
    res.json({ok: 1, item});
  }catch(err){
    next(err);
  }
});

// 판매자 후기 목록 조회
router.get('/seller/:seller_id', async function(req, res, next) {
  try{
    const seller_id = Number(req.params.seller_id);
    const item = await model.findBySeller(seller_id);
    res.json({ok: 1, item});
  }catch(err){
    next(err);
  }
});

export default router;
