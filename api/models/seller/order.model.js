import _ from 'lodash';
import moment from 'moment';
import createError from 'http-errors';

import logger from '#utils/logger.js';
import db, { nextSeq } from '#utils/dbUtil.js';


const buying = {
  // 판매자에게 주문한 모든 주문 목록 조회
  async findBy({ seller_id, search, sortBy }){
    logger.trace(arguments);
    const query = { seller_id, ...search };
    logger.log(query);

    const list = await db.order.find({ products: { $elemMatch: { seller_id } } }).sort(sortBy).toArray();
    list.forEach(order => {
      order.products = order.products.filter(product => product.seller_id === seller_id);
    });
    
    logger.debug(list.length, list);
    return list;
  },
};

export default buying;