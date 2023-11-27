import { useEffect } from "react";
import { useParams } from "react-router";
import { ProductItem } from "../../components/product/ProductListTypeEntry";
import { Link } from "react-router-dom";
import useCustomAxios from '../../hooks/useCustomAxios';
import { useSuspenseQuery } from "@tanstack/react-query";

interface ProductRes {
  ok: 0 | 1,
  item: ProductItem
}

const ProductNew = function(){

  const { _id } = useParams();

  const axios = useCustomAxios();

  useEffect(() => {
    console.log('ProductDetail 마운트');
    return ()=>console.log('ProductDetail 언마운트');
  });

  const {isLoading, data, error} = useSuspenseQuery({
    queryKey: ['products', _id], // 쿼리키를 파라미터마다 지정(검색어, 페이지 등)
    queryFn: () => axios.get<ProductRes>(`/products/${_id}?delay=500&`),
    select: data => data.data.item,
    staleTime: 1000*2,
    refetchOnWindowFocus: false,
  });
  console.log({isLoading, data, error});

  return (
    <div>
      <h3>상품 정보</h3>      
      { error && error.message }
      <div className="pcontent">
        <Link to="/carts/new" state={data}>장바구니에 담기</Link><br />
        <Link to="/orders/new" state={data}>바로 구매</Link><br /><br />
        <img src={`${data.mainImages[0]}`} width="300px" />
        <p>가격: {data.price}</p>
        <p>배송비: {data.shippingFees}</p>
        <div dangerouslySetInnerHTML={{ __html: data.content }}/>
      </div>

    </div>
  );
};

export default ProductNew;