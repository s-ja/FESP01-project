import { useLocation } from "react-router";
import ProductEntry, { ProductItemType } from "../../components/product/ProductListTypeEntry";
import queryString from "query-string";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useCustomAxios from '../../hooks/useCustomAxios';
import Category from "../../components/product/Category";

interface ProductResType {
  ok: 0 | 1;
  item?: [
    ProductItemType
  ];
  message?: string;
}

const ProductList = function(){
  const location = useLocation();
  const menu = queryString.parse(location.search).menu;
  const category = queryString.parse(location.search).category;
  const subCategory = queryString.parse(location.search).subCategory;
  let filter = {};
  switch(menu){
    case 'new':
      filter = {"extra.isNew": true};
      break;
    case 'kidult':
      filter = {"extra.category.0": "PC03"};
      break;
    case 'best':
      filter = {"extra.isBest": true};
      break;
  }

  if(category){
    filter = {"extra.category.0": category};
  }

  if(subCategory){
    filter = {"extra.category.1": subCategory};
  }

  const axios = useCustomAxios();

  useEffect(() => {
    console.log('ProductList 마운트');
    return ()=>console.log('ProductList 언마운트');
  });

  const {isLoading, data, error} = useQuery({
    queryKey: ['products', filter], // 쿼리키를 파라미터마다 지정(검색어, 페이지 등)
    queryFn: () => axios.get<ProductResType>(`/products?delay=1000`, {params: {extra: JSON.stringify(filter)}}),
    select: data => data.data.item,
    staleTime: 1000*2,
    refetchOnWindowFocus: false,
    retry: false
  });
  console.log({isLoading, data, error});

  const itemList = data?.map(product => {
    return <ProductEntry key={product._id} product={product} />;
  });
  
  return (
    <div>
      <div>
        <Category />
      </div>
      <h3>상품 목록</h3>
      <div>
        { error && error.message }
        <ul>
          { itemList }
        </ul>
      </div>   
    </div>
     
  );
};

export default ProductList;