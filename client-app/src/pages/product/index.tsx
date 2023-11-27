import { Outlet, useLocation } from "react-router-dom";
import queryString from 'query-string';

const Product = function(){
  const location = useLocation();
  const menu = queryString.parse(location.search).menu;
  let title = '상품 메뉴';
  switch(menu){
    case 'new':
      title = '신상품';
      break;
    case 'kidult':
      title = '키덜트 존';
      break;
    case 'best':
      title = '베스트';
      break;
  }

  return (
    <main>
      <h1>{title}</h1>
      <Outlet />
    </main>
  );
};

export default Product;