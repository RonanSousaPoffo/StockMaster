// src/components/AddItem.js

import React, { useState } from 'react';
import './AddItem.css';
import { db } from '../firebaseConfig'; // Importa o Firestore
import { collection, addDoc } from 'firebase/firestore'; // Importa funções para adicionar documentos

const AddItem = () => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState(['Categoria 1', 'Categoria 2']); // Categorias existentes
  const [showModal, setShowModal] = useState(false); // Controle do modal

  const handleAddCategory = () => {
    if (newCategory) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
      setShowModal(false); // Fechar o modal após adicionar a categoria
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'items'), { // Adiciona um novo documento na coleção 'items'
        name: itemName,
        quantity: parseInt(quantity, 10),
        price: parseFloat(price),
        category,
      });
      alert('Item salvo com sucesso!');
      // Limpar os campos após salvar
      setItemName('');
      setQuantity('');
      setPrice('');
      setCategory('');
    } catch (err) {
      alert('Erro ao salvar item: ' + err.message);
    }
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

        <label>Quantidade:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
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
            onClick={() => setShowModal(true)}
          >
            +
          </button>
        </div>

        <div className="form-actions">
          <button type="button" className="back-button" onClick={() => window.history.back()}>
            Voltar
          </button>
          <button type="submit" className="save-item-button">
            Salvar Item
          </button>
        </div>
      </form>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Adicionar Nova Categoria</h3>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nova categoria"
            />
            <div className="button-group">
              <button
                type="button"
                className="save-category-button"
                onClick={handleAddCategory}
              >
                Adicionar Categoria
              </button>
              <button
                type="button"
                className="cancel-edit-button"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddItem;
