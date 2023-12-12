import express from 'express';
import { query } from 'express-validator';
import jwtAuth from '#middlewares/jwtAuth.js';
import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';
import model from '#models/user/post.model.js';
import _ from 'lodash';

const router = express.Router();

// 게시물 목록 조회
router.get('/', async function(req, res, next) {
  try{
    const search = {};
    const keyword = req.query.keyword;

    if(keyword){
      const regex = new RegExp(keyword, 'i');
      search['$or'] = [{ title: regex }, { content: regex }];
    }

    const item = await model.find({ type: req.query.type, search });
    
    res.json({ ok: 1, item });
  }catch(err){
    next(err);
  }
});

// 사용자의 게시물 목록 조회
router.get('/users/:_id', jwtAuth.auth('user'), async function(req, res, next) {
  try{
    const _id = Number(req.params._id);
    if(req.user.type === 'admin' || _id === req.user._id){
      const search = { 'user._id': req.user._id };
      const keyword = req.query.keyword;

      if(keyword){
        const regex = new RegExp(keyword, 'i');
        search['$or'] = [{ title: regex }, { content: regex }];
      }

      const item = await model.find({ type: req.query.type, search });
      res.json({ ok: 1, item });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 판매자의 상품들에 등록된 게시물 목록 조회
router.get('/seller/:_id', jwtAuth.auth('user'), async function(req, res, next) {
  try{

    if(req.user.type === 'seller' || req.params._id === req.user._id){
      const search = { seller_id: req.user._id };
      const keyword = req.query.keyword;

      if(keyword){
        const regex = new RegExp(keyword, 'i');
        search['$or'] = [{ title: regex }, { content: regex }];
      }

      const item = await model.find({ type: req.query.type, search });
      res.json({ ok: 1, item });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 게시물 상세 조회
router.get('/:_id', async function(req, res, next) {
  try{
    const item = await model.findById(Number(req.params._id));
    if(item){
      res.json({ ok: 1, item });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 게시물 등록
router.post('/', jwtAuth.auth('user'), async function(req, res, next) {
  try{
    const item = await model.create({ ...req.body, user: { _id: req.user._id, name: req.user.name } });
    res.json( {ok: 1, item} );
  }catch(err){
    next(err);
  }
});

// 게시물 수정
router.patch('/:_id', jwtAuth.auth('user'), async function(req, res, next) {
  try{
    const _id = Number(req.params._id);
    const post = await model.findById(_id);
    if(post && (req.user.type === 'admin' || post.user._id == req.user._id)){
      const updated = await model.update(_id, req.body);
      res.json({ ok: 1, updated });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 게시물 삭제
router.delete('/:_id', jwtAuth.auth('user'), async function(req, res, next) {
  try{
    const _id = Number(req.params._id);
    const post = await model.findById(_id);
    if(post && (req.user.type === 'admin' || post?.user._id == req.user._id)){
      await model.delete(_id);
      res.json({ ok: 1 });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 댓글 등록
router.post('/:_id/replies', jwtAuth.auth('user'), async function(req, res, next) {
  try{
    const _id = Number(req.params._id);
    const post = await model.findById(_id);
    if(post){
      const reply = req.body;
      reply._id = (_.maxBy(post.replies, '_id')?._id || 0) + 1;
      reply.user = {
        _id: req.user._id,
        name: req.user.name
      };
      // reply.user_id = req.user._id;
      
      const item = await model.createReply(_id, reply);
      res.status(201).json({ok: 1, item});
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 댓글 수정
router.patch('/:_id/replies/:reply_id', jwtAuth.auth('user'), async (req, res, next) => {
  try{
    const _id = Number(req.params._id);
    const reply_id = Number(req.params.reply_id);
    const post = await model.findById(_id);
    const reply = _.find(post?.replies, { _id: reply_id });
    if(post && (req.user.type === 'admin' || reply?.user._id == req.user._id)){
      await model.updateReply(_id, reply_id, req.body);
      res.json({ ok: 1 });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 댓글 삭제
router.delete('/:_id/replies/:reply_id', jwtAuth.auth('user'), async (req, res, next) => {
  try{
    const _id = Number(req.params._id);
    const reply_id = Number(req.params.reply_id);
    const post = await model.findById(_id);
    const reply = _.find(post?.replies, { _id: reply_id });
    if(post && (req.user.type === 'admin' || reply?.user._id == req.user._id)){
      await model.deleteReply(_id, reply_id);
      res.json({ ok: 1 });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});


export default router;
