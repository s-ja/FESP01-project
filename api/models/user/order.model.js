import _ from 'lodash';
import moment from 'moment';
import createError from 'http-errors';

import logger from '#utils/logger.js';
import db, { nextSeq } from '#utils/dbutil.js';
import productModel from '#models/user/product.model.js';
import replyModel from '#models/user/reply.model.js';

const buying = {
  // 주문 등록
  async create(orderInfo){
    logger.trace(arguments);
    orderInfo._id = await nextSeq('order');
    orderInfo.updatedAt = orderInfo.createdAt = moment().format('YYYY.MM.DD HH:mm:ss');

    const sellerBaseShippingFees = {};
    const products = [];

    for(let {_id, quantity} of orderInfo.products){
      const product = await productModel.findById(_id);
      if(product){
        if(product.quantity-product.buyQuantity >= quantity){
          // 상품의 구매된 수량 수정
          db.product.updateOne({ _id }, { $set: { buyQuantity: product.buyQuantity+quantity } });
          const beforeShippingFees = sellerBaseShippingFees[product.seller_id];
          if(beforeShippingFees === undefined){
            sellerBaseShippingFees[product.seller_id] = product.shippingFees;
          }else{
            sellerBaseShippingFees[product.seller_id] = Math.max(beforeShippingFees, product.shippingFees);
          }
          products.push({
            _id,
            quantity,
            name: product.name,
            image: product.mainImages[0],
            price: product.price * quantity
          });
        }else{
          throw createError(422, `[${product.name}] 상품의 구매 가능한 수량은 ${product.quantity-product.buyQuantity}개 입니다.`);
        }
      }else{
        throw createError(422, `상품번호 ${_id}인 상품이 존재하지 않습니다.`);
      }
    }

    orderInfo.products = products;
    orderInfo.cost = {
      products: _.sumBy(orderInfo.products, 'price'),
      shippingFees: _.sum(Object.values(sellerBaseShippingFees))
    };

    orderInfo.cost.total = orderInfo.cost.products + orderInfo.cost.shippingFees;
    
    logger.log(orderInfo);

    if(!orderInfo.dryRun){
      await db.order.insertOne(orderInfo);
    }
    return orderInfo;
  },

  // 주문 목록 검색
  async findBy({ user_id, search, sortBy }){
    logger.trace(arguments);
    const query = { user_id, ...search };
    logger.log(query);


    const list = await db.order.find(query).sort(sortBy).toArray();

    for(const order of list){
      for(const product of order.products){
        const reply = await replyModel.findById(product.reply_id);
        if(reply){
          delete reply._id;
          delete reply.order_id;
          delete reply.product_id;
          product.reply = reply;
        }
      }
    }

    logger.debug(list.length, list);
    return list;
  },

  // 주문 내역 상세 조회
  async findById(_id){
    logger.trace(arguments);
    const item = await db.order.findOne({ _id });
    logger.debug(item);
    return item;
  },

  // 주문 내역에 후기 추가
  async updateReplyId(_id, product_id, reply_id){
    logger.trace(arguments);
    const result = await db.order.updateOne(
      {
        _id,
        products: {
          $elemMatch: {
            _id: product_id
          }
        }
      },
      { 
        $set: { ['products.0.reply_id']: reply_id }
      }
    );
    logger.debug(result);
    return result;
  },
};

export default buying;