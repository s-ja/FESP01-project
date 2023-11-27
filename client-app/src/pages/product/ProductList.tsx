import { useLocation } from "react-router";
import ProductEntry, { ProductItem } from "../../components/product/ProductListTypeEntry";
import queryString from "query-string";
import { useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import useCustomAxios from '../../hooks/useCustomAxios';

interface ProductRes {
  ok: 0 | 1,
  item: [
    ProductItem
  ]
}

const ProductList = function(){
  const location = useLocation();
  const menu = queryString.parse(location.search).menu;
  let menuSearch = {};
  switch(menu){
    case 'new':
      menuSearch = {"extra.isNew": true};
      break;
    case 'kidult':
      menuSearch = {"extra.category.0": "PC03"};
      break;
    case 'best':
      menuSearch = {"extra.isBest": true};
      break;
  }

  const axios = useCustomAxios();

  useEffect(() => {
    console.log('ProductList 마운트');
    return ()=>console.log('ProductList 언마운트');
  });

  const {isLoading, data, error} = useSuspenseQuery({
    queryKey: ['products', menuSearch], // 쿼리키를 파라미터마다 지정(검색어, 페이지 등)
    queryFn: () => axios.get<ProductRes>(`/products?delay=1000`, {params: {extra: JSON.stringify(menuSearch)}}),
    select: data => data.data.item,
    staleTime: 1000*2,
    refetchOnWindowFocus: false,
  });
  console.log({isLoading, data, error});

  const itemList = data.map(product => {
    return <ProductEntry key={product._id} product={product} />;
  });
  
  return (
    <div>
      { error && error.message }
    <ul>
      { itemList }
    </ul>
    </div>    
  );
};

export default ProductList;