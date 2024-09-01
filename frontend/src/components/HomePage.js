// src/components/HomePage.js
import React from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig'; // Certifique-se de que o caminho está correto
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error("Erro ao deslogar:", err.message);
    }
  };

  return (
    <div className="home-container">
      <h1>Bem-vindo ao StockMaster</h1>
      <div className="options-container">
        <button className="option-button" onClick={() => navigate('/add-item')}>Adicionar Item</button>
        <button className="option-button" onClick={() => navigate('/view-inventory')}>Visualizar Estoque</button>
        <button className="option-button" onClick={() => navigate('/manage-categories')}>Gerenciar Categorias</button>
        <button className="logout-button" onClick={handleLogout}>Deslogar</button>
      </div>
    </div>
  );
};

export default HomePage;
