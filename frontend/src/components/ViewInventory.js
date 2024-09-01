// src/components/ViewInventory.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig'; // Importa o Firestore
import { collection, getDocs } from 'firebase/firestore'; // Importa funções para obter documentos
import './ViewInventory.css'; // Adicione um arquivo CSS para estilização

const ViewInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'items'));
        const itemsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setItems(itemsList);
        setFilteredItems(itemsList);
      } catch (error) {
        console.error('Erro ao carregar itens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(lowercasedTerm) ||
      item.category.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  return (
    <div className="view-inventory-container">
      <h2>Visualizar Estoque</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Pesquisar por nome ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Quantidade</th>
              <th>Preço</th>
              <th>Categoria</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price.toFixed(2)}</td>
                  <td>{item.category}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">Nenhum item encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewInventory;
