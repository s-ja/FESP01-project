import { CategoryCodeType, CodeListType, codeState } from "../../recoil/code/atoms";
import { useRecoilValue } from "recoil";
import _ from 'lodash';
import { Link } from "react-router-dom";
import CategorySub from './CategorySub';

const Category = function(){
  const codeList = useRecoilValue(codeState) as CodeListType;
  const categoryList = _.chain(codeList.productCategory.codes).sortBy('sort').filter({depth: 1}).value().map((category: CategoryCodeType, i) => {
    return (
      <li key={i}>
        <Link to={`/products?category=${category.code}`}>{category.value}</Link>
        <ul>
          <CategorySub parent={category.code} />
        </ul>
      </li>
    );
  });
  return (
    <div>
      <h3>상품 카테고리</h3>
      <ul>
        { categoryList }
      </ul>
    </div>
  );
};

export default Category;