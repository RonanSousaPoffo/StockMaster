import React, { useState, useEffect } from 'react';
import './AddItem.css';
import { db } from '../firebaseConfig'; // Importa o Firestore
import { collection, addDoc, getDocs } from 'firebase/firestore'; // Importa funções para adicionar documentos e obter documentos

const AddItem = () => {
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState([]); // Categorias existentes
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carrega as categorias do Firestore
  useEffect(() => {
    const loadCategories = async () => {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoriesList = querySnapshot.docs.map(doc => doc.data().name);
      setCategories(categoriesList);
    };
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    if (newCategory) {
      try {
        await addDoc(collection(db, 'categories'), { name: newCategory });
        setCategories([...categories, newCategory]);
        setNewCategory('');
        setShowNewCategoryInput(false);
        setIsModalOpen(false); // Fecha o modal após salvar a categoria
      } catch (err) {
        alert('Erro ao adicionar categoria: ' + err.message);
      }
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'items'), { // Adiciona um novo documento na coleção 'items'
        name: itemName,
        price: parseFloat(price),
        category,
        quantity:0,
      });
      alert('Item salvo com sucesso!');
      // Limpar os campos após salvar
      setItemName('');
      setPrice('');
      setCategory('');
    } catch (err) {
      alert('Erro ao salvar item: ' + err.message);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="add-item-container">
      <h2>Adicionar Novo Item</h2>
      <form onSubmit={handleSaveItem}>
        <label>Nome do Item:</label>
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />

        <label>Preço:</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <label>Categoria:</label>
        <div className="category-selection">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="add-category-button"
            onClick={() => setIsModalOpen(true)}
          >
           +
          </button>
        </div>

        <div className="form-actions">
          <button type="button" className="back-button" onClick={handleBack}>
            Voltar (Cancelar)
          </button>
          <button type="submit" className="save-item-button">
            Salvar Item
          </button>
        </div>
      </form>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Adicionar Nova Categoria</h2>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nova categoria"
              required
            />
            <div className="button-group">
              <button
                type="button"
                className="cancel-edit-button"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="save-category-button"
                onClick={handleAddCategory}
              >
                Adicionar Categoria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddItem;
