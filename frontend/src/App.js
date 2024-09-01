// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import HomePage from './components/HomePage';
// Importe as novas páginas
import AddItem from './components/AddItem';
import ViewInventory from './components/ViewInventory';
import ManageCategories from './components/ManageCategories';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/view-inventory" element={<ViewInventory />} />
        <Route path="/manage-categories" element={<ManageCategories />} />
      </Routes>
    </Router>
  );
};

export default App;
