import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import './ManageCategories.css';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categoriesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesList);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (newCategory.trim() === '') {
      alert('O nome da categoria não pode estar vazio.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'categories'), { name: newCategory });
      setCategories([...categories, { id: docRef.id, name: newCategory }]);
      setNewCategory('');
      console.log('Categoria adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
  };

  const handleSaveCategory = async () => {
    if (editCategoryName.trim() === '' || !editingCategory) {
      alert('O nome da categoria não pode estar vazio.');
      return;
    }

    try {
      const categoryRef = doc(db, 'categories', editingCategory.id);
      await updateDoc(categoryRef, { name: editCategoryName });
      setCategories(categories.map(cat =>
        cat.id === editingCategory.id ? { ...cat, name: editCategoryName } : cat
      ));
      setEditingCategory(null);
      setEditCategoryName('');
      console.log('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao editar categoria:', error);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      // Verifica se a categoria está associada a algum item
      const itemsQuery = query(collection(db, 'items'), where('categoryID', '==', id));
      const querySnapshot = await getDocs(itemsQuery);

      if (!querySnapshot.empty) {
        alert('Não é possível excluir esta categoria porque ela está associada a um ou mais itens.');
        return;
      }

      await deleteDoc(doc(db, 'categories', id));
      setCategories(categories.filter(cat => cat.id !== id));
      console.log('Categoria excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName('');
  };

  return (
    <div className="manage-categories-container">
      <h2>Gerenciar Categorias</h2>

      <div className="add-category-container">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nova categoria"
        />
        <button
          type="button"
          className="add-category-button"
          onClick={handleAddCategory}
        >
          Adicionar Categoria
        </button>
      </div>

      <div className="categories-list">
        {categories.length > 0 ? (
          <ul>
            {categories.map(cat => (
              <li key={cat.id}>
                {editingCategory && editingCategory.id === cat.id ? (
                  <div className="edit-category-container">
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      placeholder="Nome da categoria"
                    />
                    <button
                      type="button"
                      className="save-category-button"
                      onClick={handleSaveCategory}
                    >
                      Salvar Alterações
                    </button>
                    <button
                      type="button"
                      className="cancel-edit-button"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <span
                      className={editingCategory && editingCategory.id === cat.id ? 'editable' : ''}
                      contentEditable={editingCategory && editingCategory.id === cat.id}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        if (editingCategory && e.currentTarget.textContent !== cat.name) {
                          setEditCategoryName(e.currentTarget.textContent);
                          handleSaveCategory();
                        }
                      }}
                      onClick={() => handleEditCategory(cat)}
                    >
                      {cat.name}
                    </span>
                    <div className="button-group">
                      <button
                        type="button"
                        className="edit-category-button"
                        onClick={() => handleEditCategory(cat)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="delete-category-button"
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>Não há categorias disponíveis.</p>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;
