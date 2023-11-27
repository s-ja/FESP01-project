import { useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { ProductItem } from "../../components/product/ProductListTypeEntry";

import QuantityInput from "../../components/common/QuantityInput";
import { AxiosError } from 'axios';
import useCustomAxios from '../../hooks/useCustomAxios';
import { useMutation } from "@tanstack/react-query";

interface OrderRes {
  ok: 0 | 1,
  item: ProductItem
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
    console.log(quantity);
    quantityRef.current = quantity
  };

  const axios = useCustomAxios();


  const createOrder = useMutation<OrderRes, AxiosError, OrderInfo>({
    mutationFn: (order: OrderInfo) => {
      return axios.post('/orders', order);
    },
    onSuccess: (data: OrderRes) => {
      console.log(data);
      if(data){
        alert('주문 완료.');
        navigate(`/orders/${data.item._id}`);
      }
    },
    onError: (err: AxiosError) => {
      console.log(err, '에러.');
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
        <img src={`${info.mainImages[0]}`} width="100px" />
        <p>상품명: ${info.name}</p>
        <form>
          <QuantityInput max={3} setter={setQuantity} />
        </form>
        <button onClick={ handleOrder }>결제 하기</button>
      </div>

    </div>
  );
};

export default OrderNew;