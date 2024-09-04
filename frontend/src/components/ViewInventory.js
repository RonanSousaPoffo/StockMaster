import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Importar getAuth para obter o usuário autenticado
import './ViewInventory.css';

const ViewInventory = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editedItem, setEditedItem] = useState({});
  const [showTotals, setShowTotals] = useState(false);

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

    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categoriesList = querySnapshot.docs.map(doc => doc.data().name);
        setCategories(categoriesList);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    fetchItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(lowercasedTerm) ||
      item.category.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const openEditModal = (item) => {
    setCurrentItem(item);
    setEditedItem(item);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentItem(null);
    setEditedItem({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedItem({
      ...editedItem,
      [name]: value
    });
  };

  const saveEdit = async () => {
    if (!currentItem) return;
    const itemRef = doc(db, 'items', currentItem.id);
    try {
      await updateDoc(itemRef, editedItem);
      await addDoc(collection(db, 'editLogs'), {
        itemId: currentItem.id,
        changes: editedItem,
        timestamp: new Date()
      });

      const updatedItems = items.map(item =>
        item.id === currentItem.id ? { ...item, ...editedItem } : item
      );
      setItems(updatedItems);
      setFilteredItems(updatedItems);
      closeEditModal();
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza de que deseja excluir este item?')) {
      try {
        // Obter o usuário autenticado
        const auth = getAuth();
        const user = auth.currentUser;

        // Encontrar o item que será excluído
        const itemToDelete = items.find(item => item.id === id);
        
        if (!itemToDelete) {
          throw new Error('Item não encontrado');
        }

        // Excluindo o item do Firestore
        await deleteDoc(doc(db, 'items', id));

        // Adicionando log de exclusão
        await addDoc(collection(db, 'deleteLogs'), {
          itemId: id,
          name: itemToDelete.name,
          quantity: itemToDelete.quantity,
          price: itemToDelete.price,
          category: itemToDelete.category,
          deletedBy: user ? user.email : 'Usuário não autenticado',
          timestamp: new Date()
        });

        // Atualizando a lista de itens após a exclusão
        const updatedItems = items.filter(item => item.id !== id);
        setItems(updatedItems);
        setFilteredItems(updatedItems);
      } catch (error) {
        console.error('Erro ao excluir item:', error);
      }
    }
  };

  const totalStockValue = filteredItems.reduce((total, item) => total + (item.quantity * item.price), 0);

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
      <button onClick={() => setShowTotals(!showTotals)} className="toggle-totals-button">
        {showTotals ? 'Ocultar Totais' : 'Mostrar Totais'}
      </button>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="inventory-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Quantidade</th>
                <th>Preço</th>
                <th>Categoria</th>
                {showTotals && <th>Total em Reais</th>}
                <th>Ações</th>
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
                    {showTotals && <td>{(item.quantity * item.price).toFixed(2)}</td>}
                    <td>
                      <button onClick={() => openEditModal(item)}>Editar</button>
                      <button onClick={() => handleDelete(item.id)} className="delete-item-button">Excluir</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={showTotals ? 7 : 6}>Nenhum item encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
          {showTotals && (
            <div className="total-stock-value">
              <h3>Total Geral do Estoque: R${totalStockValue.toFixed(2)}</h3>
            </div>
          )}
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar Item</h3>
            <label>Nome:</label>
            <input
              type="text"
              name="name"
              value={editedItem.name}
              onChange={handleEditChange}
            />
            <label>Quantidade:</label>
            <input
              type="number"
              name="quantity"
              value={editedItem.quantity}
              onChange={handleEditChange}
              className="quantity-disabled"
              title="Este campo só pode ser editado na tela de movimentações"
              disabled
            />
            <label>Preço:</label>
            <input
              type="number"
              name="price"
              value={editedItem.price}
              onChange={handleEditChange}
            />
            <label>Categoria:</label>
            <select
              name="category"
              value={editedItem.category}
              onChange={handleEditChange}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="button-group">
              <button onClick={saveEdit} className="save-category-button">Salvar</button>
              <button onClick={closeEditModal} className="cancel-edit-button">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewInventory;
