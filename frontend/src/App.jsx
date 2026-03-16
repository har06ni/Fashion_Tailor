import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import AddCustomer from './pages/AddCustomer';
import ReadyToDeliver from './pages/ReadyToDeliver';
import Delivered from './pages/Delivered';
import OrderDetail from './pages/OrderDetail';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-customer/*" element={<AddCustomer />} />
            <Route path="/ready" element={<ReadyToDeliver />} />
            <Route path="/delivered" element={<Delivered />} />
            <Route path="/order/:id" element={<OrderDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
