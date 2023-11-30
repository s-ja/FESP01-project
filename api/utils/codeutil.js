import _ from 'lodash';
import logger from '#utils/logger.js';

const codeutil = {
  // 트리 구조의 코드일 경우 자식 코드를 포함하는 중첩 구조로 변경
  createNestedStructure(data) {
    const sortedData = _.sortBy(data, ['depth', 'sort']);
    const nestedData = _.filter(sortedData, { depth: 1 });
  
    function addChild(parent) {
      const children =  _.filter(sortedData, { parent: parent.code });
      if(children.length > 0){
        parent.sub = children;
      }
    }

    for (const item of sortedData) {
      addChild(item);
    }
  
    return nestedData;
  },

  getCodeObj(codeArray) {
    const codeObj = {};
    codeArray.map(code => {
      codeObj[code._id] = code;
      if(code.codes[0].depth){
        code.nestedCodes = this.createNestedStructure(_.cloneDeep(code.codes));
      }
    });
    return codeObj;
  }
};

export default codeutil;