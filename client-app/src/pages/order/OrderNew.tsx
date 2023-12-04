import { useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { ProductItemType } from "../../components/product/ProductListTypeEntry";

import QuantityInput from "../../components/common/QuantityInput";
import { AxiosResponse, AxiosError } from 'axios';
import useCustomAxios from '../../hooks/useCustomAxios';
import { useMutation, useQuery } from "@tanstack/react-query";
import { isError } from "lodash";
import { type ProductResType } from "../product/ProductDetail";
import queryString from "query-string";

interface OrderRes {
  ok: 0 | 1;
  item?: ProductItemType;
  message?: string;
}

interface OrderProduct {
  _id: number;
  quantity: number;
}

interface OrderInfo {
  products: OrderProduct[],
  address: {
    name: string;
    value: string;
  }
}

const OrderNew = function(){
  const location = useLocation();
  const product_id = queryString.parse(location.search).product_id;
  const navigate = useNavigate();
  const quantityRef = useRef<number>(1);

  const setQuantity = (quantity: number) => {
    quantityRef.current = quantity
  };

  const axios = useCustomAxios();

  const {isLoading, data, error} = useQuery({
    queryKey: ['orders/new', product_id], // 쿼리키를 파라미터마다 지정(검색어, 페이지 등)
    queryFn: () => axios.get<ProductResType>(`/products/${product_id}?delay=500&`),
    select: data => data.data.item,
    staleTime: 1000*2,
    refetchOnWindowFocus: false,
    // retry: false
  });

  const createOrder = useMutation<AxiosResponse<OrderRes>, AxiosError<OrderRes>, OrderInfo>({
    mutationFn: (order: OrderInfo) => {
      return axios.post('/orders', order);
    },
    retry: false,
    // retry: 3,
    // retryDelay: 1000,
    onSuccess: (data) => {
      if(data?.data.item){
        alert('주문 완료.');
        navigate(`/orders`);
        // navigate(`/orders/${data.item._id}`);
      }
    },
    onError: (err) => {
      alert(err.response?.data?.message || '주문 실패');
    }
  });

  const handleOrder = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    createOrder.mutate({
      products: [
        {
          _id: data!._id,
          quantity: quantityRef.current
        }
      ],
      address: {
        name: '학교',
        value: '서울시 송파구'
      }
    });
  };


  return (
    <div>
      <h3>상품 구매</h3>

      
      { error && error.message }
      { data && 
      <div className="pcontent">
        <img src={data.mainImages[0]} width="100px" />
        <p>상품명: {data.name}</p>
        <form>
          <QuantityInput max={data.quantity-data.buyQuantity} setter={setQuantity} /> 가능 수량: {data.quantity-data.buyQuantity}
        </form>
        <button onClick={ handleOrder }>결제 하기</button>
      </div>
      }
        

    </div>
  );
};

export default OrderNew;