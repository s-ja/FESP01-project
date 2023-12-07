import _ from 'lodash';
import moment from 'moment';
import createError from 'http-errors';

import logger from '#utils/logger.js';
import db, { nextSeq } from '#utils/dbUtil.js';
import productModel from '#models/user/product.model.js';
import replyModel from '#models/user/reply.model.js';
import userModel from '#models/user/user.model.js';
import cartModel from '#models/user/cart.model.js';
import codeUtil from '#utils/codeUtil.js';
import priceUtil from '#utils/priceUtil.js';

const buying = {
  // 주문 등록
  async create(orderInfo){
    logger.trace(arguments);
    orderInfo._id = await nextSeq('order');
    orderInfo.updatedAt = orderInfo.createdAt = moment().format('YYYY.MM.DD HH:mm:ss');

    const products = [];

    for(let {_id, quantity} of orderInfo.products){
      const product = await productModel.findById({ _id });
      if(product){
        if(product.quantity-product.buyQuantity >= quantity){
          // 상품의 구매된 수량 수정
          if(!orderInfo.dryRun){
            db.product.updateOne({ _id }, { $set: { buyQuantity: product.buyQuantity+quantity } });
          }
          products.push({
            _id,
            quantity,
            seller_id: product.seller_id,
            name: product.name,
            image: product.mainImages[0],
            price: product.price * quantity
          });
        }else{
          throw createError(422, `[${product._id} ${product.name}] 상품의 구매 가능한 수량은 ${product.quantity-product.buyQuantity}개 입니다.`);
        }
      }else{
        throw createError(422, `상품번호 ${_id}인 상품이 존재하지 않습니다.`);
      }
    }

    orderInfo.products = products;
    const cost = await priceUtil.getCost(orderInfo.user_id, orderInfo.products, orderInfo.discount);
    delete orderInfo.discount;
    orderInfo = { ...orderInfo, cost };

    if(!orderInfo.dryRun){
      await db.order.insertOne(orderInfo);
    }
    
    // 장바구니 상품 구매시 구매한 상품은 장바구니 목록에서 제거
    if(orderInfo.type == 'cart'){
      const cartList = await cartModel.findByUser(orderInfo.user_id);
      const deleteIdList = _.chain(cartList)
        .filter(cart => _.find(orderInfo.products, { '_id': cart.product_id }))
        .map('_id')
        .value();
      if(!orderInfo.dryRun){
        await cartModel.deleteMany(deleteIdList);
      }
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
          delete reply.user_id;
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

  // 주문 상태 수정
  async updateState(_id, order, history){
    logger.trace(arguments);

    order.updatedAt = moment().format('YYYY.MM.DD HH:mm:ss');

    const set = { 'products.$[elem].state': order.state };
    if(order.delivery){
      set['products.$[elem].delivery'] = order.delivery;
    }

    logger.log(set);

    const result = await db.order.updateOne(
      { _id }, 
      { $set: set, $push: { 'products.$[elem].history': history } }, 
      { arrayFilters: [{ 'elem._id': order.product_id }] }
    );

    logger.debug(result);
    const item = { _id, ...order };
    return item;
  }

};

export default buying;