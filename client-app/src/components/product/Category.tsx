import type { CategoryCodeType, CodeListType } from "../../recoil/code/atoms";
import { codeState } from "../../recoil/code/atoms";
import { useRecoilValue } from "recoil";
import { Link } from "react-router-dom";

// 중첩 구조의 카테고리 목록 생성
function generateNestedList(category: CategoryCodeType[]) {
  const nestedElements = category.map(item => (
    <li key={ item.code }>
      <Link to={`/products?category=${ item.code }`}>{ item.value }</Link>      
      { item.sub && item.sub.length > 0 && generateNestedList(item.sub) }
    </li>
  ));
  return <ul>{ nestedElements }</ul>;
}

const Category = function(){
  const codeList = useRecoilValue(codeState) as CodeListType;
  const category = generateNestedList(codeList.productCategory.nestedCodes!);

  return (
    <div>
      <h3>상품 카테고리</h3>
      { category }      
    </div>
  );
};

export default Category;



