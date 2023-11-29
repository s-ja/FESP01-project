import express from 'express';
import _ from 'lodash';

import logger from '#utils/logger.js';
import model from '#models/code/code.model.js';

const router = express.Router();

// 코드 목록 조회
router.get('/', async function(req, res, next) {
  try{
    let item = await model.find();
    // 배열을 객체로 변경
    item = _.keyBy(item, '_id');
    console.log(item);
    res.json({ ok: 1, item });
  }catch(err){
    next(err);
  }
});

// 코드 한건 조회
router.get('/:_id', async function(req, res, next) {
  try{
    const search = {};

    if(req.query.depth){
      search.depth = Number(req.query.depth);
    }
    if(req.query.parent){
      search.parent = req.query.parent;
    }
    const item = await model.findById(req.params._id, search);
    res.json({ ok: 1, item });
  }catch(err){
    next(err);
  }
});

export default router;
