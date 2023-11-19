import express from 'express';
import { query } from 'express-validator';

import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';
import model from '#models/user/reply.model.js';

const router = express.Router();

// 후기 등록
router.post('/', async function(req, res, next) {  
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

export default router;
