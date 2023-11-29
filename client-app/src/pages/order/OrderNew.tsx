import { useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { ProductItemType } from "../../components/product/ProductListTypeEntry";

import QuantityInput from "../../components/common/QuantityInput";
import { AxiosResponse, AxiosError } from 'axios';
import useCustomAxios from '../../hooks/useCustomAxios';
import { useMutation } from "@tanstack/react-query";

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
  const { state: info } = useLocation();
  const navigate = useNavigate();
  const quantityRef = useRef<number>(1);

  const setQuantity = (quantity: number) => {
    quantityRef.current = quantity
  };

  const axios = useCustomAxios();


  const createOrder = useMutation<AxiosResponse<OrderRes>, AxiosError<OrderRes>, OrderInfo>({
    mutationFn: (order: OrderInfo) => {
      return axios.post('/orders', order);
    },
    retry: false,
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
          _id: info._id,
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

      <div className="pcontent">
        <img src={info.mainImages[0]} width="100px" />
        <p>상품명: {info.name}</p>
        <form>
          <QuantityInput max={info.quantity-info.buyQuantity} setter={setQuantity} /> 가능 수량: {info.quantity-info.buyQuantity}
        </form>
        <button onClick={ handleOrder }>결제 하기</button>
      </div>

    </div>
  );
};

export default OrderNew;