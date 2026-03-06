import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/transactions" element={<Transactions />}/>
        <Route path="/login" element={<Login />}/>

        <Route path='/admin' element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />}/>
          <Route path="/admin/orders" element={<AdminDashboard />}/>
          <Route path="/admin/history" element={<AdminDashboard />}/>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;