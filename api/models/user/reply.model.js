import _ from 'lodash';
import moment from 'moment';
import logger from '#utils/logger.js';
import db, { nextSeq, getClient } from '#utils/dbutil.js';
import orderModel from '#models/user/order.model.js';

const reply = {
  // 후기 등록
  async create(replyInfo){
    logger.trace(arguments);
    replyInfo._id = await nextSeq('reply');
    replyInfo.createdAt = moment().format('YYYY.MM.DD HH:mm:ss');
    
    if(!replyInfo.dryRun){

      await db.reply.insertOne(replyInfo);
      await orderModel.updateReplyId(replyInfo.order_id, replyInfo.product_id, replyInfo._id);

      // TODO: 트랜젝션 처리
      // getClient().withSession(async session => {
      //   session.withTransaction(async session => {
      //     await db.reply.insertOne(replyInfo, { session });
      //     await orderModel.updateReplyId(replyInfo.order_id, replyInfo.product_id, replyInfo._id, session);
      //   });
      // }); 
    }    
    return replyInfo;
  },

  // 후기 상세 조회
  async findById(_id){
    logger.trace(arguments);
    // const item = await db.reply.findOne({ _id });
    const item = await db.reply.aggregate([
      { $match: { _id } },
      {
        $lookup: {
          from: 'user',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      }, 
      { 
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
       }, 
      {
        $project: {
          _id: 1,
          userName: '$user.name',
          rating: 1,
          content: 1,
          createdAt: 1
        }
      }
    ]).next();
    logger.debug(item);
    return item;
  },

  // 상품 후기 조회
  async findByProductId(product_id){
    logger.trace(arguments);
    const list = await db.reply.aggregate([
      { $match: { product_id } },
      {
        $lookup: {
          from: 'user',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      }, 
      { $unwind: '$user' }, 
      {
        $project: {
          _id: 1,
          userName: '$user.name',
          rating: 1,
          content: 1,
          createdAt: 1
        }
      }
    ]).toArray();

    
    logger.debug(list);    
    return list;
  },

  // 내 후기 목록 조회
  async findByUser(user_id){
    logger.trace(arguments);

    const list = await db.reply.aggregate([
      { $match: {user_id } },
      {
        $lookup: {
          from: 'product',
          localField: 'product_id',
          foreignField: '_id',
          as: 'product'
        }
      }, 
      { 
        $unwind: {
          path: '$product'
        }
        }, 
      {
        $project: {
          _id: 1,
          product_id: 1,
          rating: 1,
          content: 1,
          createdAt: 1,
          'product.name': '$product.name',
          'product.price': '$product.price',
          'product.image': { $arrayElemAt: ['$product.mainImages', 0] }
        }
      }
    ]).sort({ _id: -1 }).toArray();


    logger.debug(list);
    return list;
  },

  // 판매자 후기 목록 조회
  async findBySeller(seller_id){
    logger.trace(arguments);

    const list = await db.product.aggregate([
      { $match: { seller_id } },
      {
        $lookup: {
          from: 'reply',
          localField: '_id',
          foreignField: 'product_id',
          as: 'reply'
        }
      },
      { $unwind: '$reply' }, 
      {
        $lookup: {
          from: 'user',
          localField: 'reply.user_id',
          foreignField: '_id',
          as: 'user'
        }
      }, 
      { $unwind: '$user' }, 
      {
        $project: {
          // _id: 0,
          product_id: '$_id',
          price: 1,
          name: 1,
          'image': { $arrayElemAt: ['$mainImages', 0] },
          'reply._id': '$reply._id',
          'reply.user_name': '$user.name',
          'reply.rating': '$reply.rating',
          'reply.content': '$reply.content',
          'reply.createdAt': '$reply.createdAt',
        }
      },
      {
        $group: {
          _id: '$_id',
          product_id: { $first: '$product_id' },
          price: { $first: '$price' },
          name: { $first: '$name' },
          image: { $first: '$image' },
          replies: { $push: '$reply' }
        }
      }
    ]).sort({ _id: -1 }).toArray();


    logger.debug(list);
    return list;
  },
};

export default reply;