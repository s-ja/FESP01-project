import { Link } from "react-router-dom";

const Header = function(){
  
  return (
    <div>
      <header>
        <nav>
          <ul>
            <li><Link to="/">오늘의 토이</Link></li>
            <li><Link to="/products?menu=new">신상품</Link></li>
            <li><Link to="/products?menu=kidult">키덜트 존</Link></li>
            <li><Link to="/products?menu=best">베스트</Link></li>
            <li><Link to="/users/login">로그인</Link></li>
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default Header;