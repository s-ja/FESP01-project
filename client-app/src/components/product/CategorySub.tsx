import { CategoryCodeType, CodeListType, codeState } from "../../recoil/code/atoms";
import { useRecoilValue } from "recoil";
import _ from 'lodash';
import { Link } from "react-router-dom";

type Props = {
  parent: string;
};

const CategorySub = function({ parent }: Props){
  const codeList = useRecoilValue(codeState) as CodeListType;
  const categoryList = _.chain(codeList.productCategory.codes).filter({depth: 2, parent }).sortBy('sort').value().map((category: CategoryCodeType, i) => {
    return (
      <li key={i}>
        <Link to={`/products?subCategory=${category.code}`}>{category.value}</Link>
      </li>
    );
  });
  return (
    <>
      { categoryList }
    </>    
  );
};

export default CategorySub;