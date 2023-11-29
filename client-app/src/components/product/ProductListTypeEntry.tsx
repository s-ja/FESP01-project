import { Link } from "react-router-dom";

export interface ProductItemType {
  _id: number;
  price: number;
  shippingFees: number;
  show?: boolean;
  active?: boolean;
  name: string;
  quantity: number;
  buyQuantity: number;
  mainImages: string[];
  content: string;
  createdAt?: string;
  updatedAt?: string;
  extra?: object;
}

type Props = {
  product: ProductItemType
};

const ProductEntry = function({ product }: Props){
  return (
    <li><Link to={`/products/${product._id}`}>{product._id} {product.name}</Link></li>
  );
};

export default ProductEntry;