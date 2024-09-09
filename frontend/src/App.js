// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import HomePage from './components/HomePage';
// Importe as novas páginas
import AddItem from './components/AddItem';
import ViewInventory from './components/ViewInventory';
import ManageCategories from './components/ManageCategories';
import StockMovement from './components/StockMovement';
import UserManagement from './components/UserManagement';
import RegisterClient from './components/RegisterClient';
import ConsultClients from './components/ConsultClients';
import ServiceRegistration from './components/ServiceRegistration';
import ServiceHistory from './components/ServiceHistory';
import ServiceLogs from './components/ServiceLogs';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/view-inventory" element={<ViewInventory />} />
        <Route path="/manage-categories" element={<ManageCategories />} />
        <Route path="/stock-movement" element={<StockMovement />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/register-client" element={<RegisterClient />} />
        <Route path="/consult-clients" element={<ConsultClients />} />
        <Route path="/service-registration" element={<ServiceRegistration />} />
        <Route path="/service-history" element={<ServiceHistory />} />
        <Route path="/service-logs" element={<ServiceLogs />} />
      </Routes>
    </Router>
  );
};

export default App;
