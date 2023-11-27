import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/layout';
import Home from './pages/home';
import NotFound from './pages/NotFound';
import Signup from './pages/user/Signup';
import ProductList from './pages/product/ProductList';
import ProductDetail from './pages/product/ProductDetail';
import ProductNew from './pages/product/ProductNew';
import User from './pages/user';
import Login from './pages/user/Login';
import Product from './pages/product';
import Order from './pages/order';
import OrderNew from './pages/order/OrderNew';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RecoilRoot } from 'recoil';
import { Suspense } from 'react';
import Loading from './components/common/Loading';

const queryClient = new QueryClient();
axios.defaults.baseURL = import.meta.env.VITE_API_SERVER;

function App() {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<Loading />}>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />

                <Route path="/products" element={<Product />}>
                  <Route index element={<ProductList />} />
                  <Route path="new" element={<ProductNew />} />
                  <Route path=":_id" element={<ProductDetail />} />
                </Route>

                <Route path="/orders" element={<Order />}>
                  <Route index element={<ProductList />} />
                  <Route path="new" element={<OrderNew />} />
                  <Route path=":_id" element={<ProductDetail />} />
                </Route>

                <Route path="/users" element={<User />}>
                  <Route path="new" element={<Signup />} />
                  <Route
                    path="login"
                    element={<Login />}
                  />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Router>
        </Suspense>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </RecoilRoot>
  );
}

export default App;
