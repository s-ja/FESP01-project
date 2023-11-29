import { Link } from "react-router-dom";
import type { ReplyItemType } from "../reply/ReplyListTypeEntry";

interface OrderProductType {
  _id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
  reply_id?: number;
  reply?: ReplyItemType;
}


export interface OrderItemType {
  _id: number;
  user_id: number;
  state: string;
  products: [ OrderProductType ];
  cost: {
    products: number;
    shippingFees: number;
    total: number;
  };
  address: object;
  createdAt: string;
  updatedAt: string;
}

type Props = {
  order: OrderItemType
};

const OrderEntry = function({ order }: Props){
  const products = order.products.map(product => {
    return (
      <li key={product._id}>
        <Link to={`/products/${product._id}`}>{product.name}</Link> x {product.quantity}개, 금액: {product.price}
      </li>
    );
  });
  return (
    <li>
      <p>구매 날짜: {order.createdAt}</p>
      <p>주문 상태: {order.state}</p>
      <ul>
        { products }
      </ul>
      <p>상품 가격 합계: { order.cost.products }</p>
      <p>배송비 합계: { order.cost.shippingFees }</p>
    </li>
  );
};

export default OrderEntry;