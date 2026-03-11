import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminMenu from './pages/AdminMenu';
import AdminLayout from './components/AdminLayout';
import AdminOrders from './pages/AdminOrders';
import AdminHistory from './pages/AdminHistory';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position='top-right' reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/transactions" element={<Transactions />}/>
        <Route path="/login" element={<Login />}/>

        <Route path='/admin' element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />}/>
          <Route path="/admin/menu" element={<AdminMenu />}/>
          <Route path="/admin/orders" element={<AdminOrders />}/>
          <Route path="/admin/history" element={<AdminHistory />}/>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;