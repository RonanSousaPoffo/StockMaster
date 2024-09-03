import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig'; 
import { doc, getDoc } from 'firebase/firestore';
import './HomePage.css';

const HomePage = () => {
  const [isAdmin, setIsAdmin] = useState(false); // Para verificar se o usuário é um administrador
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().isAdmin) { // Supondo que você tenha um campo 'isAdmin' no documento do usuário
            setIsAdmin(true);
          }
        } catch (err) {
          console.error("Erro ao verificar status de administrador:", err.message);
        }
      }
    };

    checkAdminStatus();
  }, []);

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
      <h1>StockMaster</h1>
      <div className="options-container">
        <button className="option-button" onClick={() => navigate('/add-item')}>Adicionar Item</button>
        <button className="option-button" onClick={() => navigate('/view-inventory')}>Visualizar Estoque</button>
        <button className="option-button" onClick={() => navigate('/manage-categories')}>Gerenciar Categorias</button>
        <button className="option-button" onClick={() => navigate('/stock-movement')}>Controle de Entrada/Saída</button>
        {isAdmin && (
          <button className="option-button" onClick={() => navigate('/user-management')}>Gerenciar Usuários</button>
        )}
        <button className="logout-button" onClick={handleLogout}>Deslogar</button>
      </div>
    </div>
  );
};

export default HomePage;
