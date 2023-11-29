import _ from 'lodash';
import moment from 'moment';
import createError from 'http-errors';

import logger from '#utils/logger.js';
import db from '#utils/dbutil.js';

const code = {
  // 코드 등록
  async create(codeInfo){
    logger.trace(arguments);

    try{
      if(!codeInfo.dryRun){
        await db.code.insertOne(codeInfo);
        return codeInfo;
      }
    }catch(err){
      logger.error(err);
      if(err.code === 11000){
        throw createError(409, '이미 등록된 코드입니다.', { cause: err });
      }else{
        throw err;
      }
    }
    
   
  },

  // 코드 목록 조회
  async find(){
    logger.trace(arguments);

    const sortBy = {
      sort: 1
    };

    const list = await db.code.find().sort(sortBy).toArray();

    for(const code of list){
      
    }

    logger.debug(list.length, list);
    return list;
  },

  // 코드 상세 조회
  async findById(_id, search){
    logger.trace(arguments);
    let item = await db.code.findOne({ _id });
    if(item){
      item.codes = _.chain(item.codes).filter(search).sortBy(['sort']).value();
    }
    
    logger.debug(item);
    return item;
  },

  // 코드 수정
  async update(_id, code){
    logger.trace(arguments);
    const result = await db.code.updateOne({ _id }, { $set: code });
    logger.debug(result);
    const item = { _id, ...code };
    return item;
  },

  // 코드 삭제
  async delete(_id){
    logger.trace(arguments);
    
  },
};

export default code;