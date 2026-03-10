import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Layout from './components/Layout/Layout';

// Placeholder Pages
import Dashboard from './pages/Dashboard';
import ProductList from './pages/Products/ProductList';

import POS from './pages/POS/POS';

import DebtList from './pages/Debts/DebtList';

import DemandList from './pages/Demands/DemandList';
import Users from './pages/Users';
import Register from './pages/Register';

import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const HomeRedirect = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" />;

  if (user.role === 'superadmin') {
    return <Dashboard />;
  } else if (user.role === 'admin') {
    return <Navigate to="/pos" />;
  } else {
    // defaults to user role
    return <Navigate to="/products" />;
  }
};

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/debts" element={<DebtList />} />
            <Route path="/demands" element={<DemandList />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
