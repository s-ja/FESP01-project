import { Link } from "react-router-dom";

export interface ProductItem {
  _id: number;
  price: number;
  shippingFees: number;
  show?: boolean;
  active?: boolean;
  name: string;
  mainImages: string[];
  content: string;
  createdAt?: string;
  updatedAt?: string;
  extra?: object;
}

type Props = {
  product: ProductItem
};

const ProductEntry = function({ product }: Props){
  return (
    <li><Link to={`/products/${product._id}`}>{product._id} {product.name}</Link></li>
  );
};

export default ProductEntry;