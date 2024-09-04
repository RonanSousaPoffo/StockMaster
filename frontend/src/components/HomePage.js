import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig'; 
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import './HomePage.css';

const HomePage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [deleteLogs, setDeleteLogs] = useState([]);
  const [filters, setFilters] = useState({
    date: '',
    itemName: '',
    value: '',
    category: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().isAdmin) {
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

  const handleOpenLogsMenu = () => {
    setIsMenuModalOpen(true);
  };

  const handleOpenDeleteLogs = async () => {
    try {
      const q = query(collection(db, 'deleteLogs'), ...buildFilters());
      const logsSnapshot = await getDocs(q);
      const logsList = logsSnapshot.docs.map((doc) => doc.data());
      setDeleteLogs(logsList);
      setIsLogsModalOpen(true);
    } catch (err) {
      console.error("Erro ao carregar logs de exclusão:", err.message);
    }
  };

  const buildFilters = () => {
    const filterQueries = [];
    if (filters.date) {
      filterQueries.push(where('timestamp', '>=', new Date(filters.date)));
    }
    if (filters.itemName) {
      filterQueries.push(where('name', '==', filters.itemName));
    }
    if (filters.value) {
      filterQueries.push(where('price', '==', Number(filters.value)));
    }
    if (filters.category) {
      filterQueries.push(where('category', '==', filters.category));
    }
    return filterQueries;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
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
          <button className="option-button" onClick={handleOpenLogsMenu}>Ver Logs</button>
        )}
        <button className="logout-button" onClick={handleLogout}>Deslogar</button>
      </div>

      {/* Modal de Menu de Logs */}
      {isMenuModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Menu de Logs</h2>
            <button className="menu-button" onClick={handleOpenDeleteLogs}>Itens Excluídos</button>
            <button onClick={() => setIsMenuModalOpen(false)}>Fechar</button>
          </div>
        </div>
      )}

      {/* Modal de Logs de Itens Excluídos */}
      {isLogsModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Logs de Itens Excluídos</h2>
            <div className="filter-container">
              <h3>Filtros</h3>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                placeholder="Data"
              />
              <input
                type="text"
                name="itemName"
                value={filters.itemName}
                onChange={handleFilterChange}
                placeholder="Nome do Item"
              />
              <input
                type="number"
                name="value"
                value={filters.value}
                onChange={handleFilterChange}
                placeholder="Valor"
              />
              <input
                type="text"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder="Categoria"
              />
              <button className="apply-filters-button" onClick={handleOpenDeleteLogs}>Aplicar Filtros</button>
            </div>
            <div className="log-content">
              <ul>
                {deleteLogs.length > 0 ? (
                  deleteLogs.map((log, index) => (
                    <li key={index}>
                      <strong>Item:</strong> {log.name} | <strong>Data:</strong> {new Date(log.timestamp.seconds * 1000).toLocaleString()} | <strong>Usuário:</strong> {log.deletedBy} | <strong>Valor:</strong> {log.price} | <strong>Categoria:</strong> {log.category} | <strong>Quantidade:</strong> {log.quantity}
                    </li>
                  ))
                ) : (
                  <p>Nenhum log de exclusão encontrado.</p>
                )}
              </ul>
              <button onClick={() => setIsLogsModalOpen(false)} className="close-modal-button">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
