import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import './StockMovement.css';

const StockMovement = () => {
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [type, setType] = useState('entrada');
  const [movements, setMovements] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filters, setFilters] = useState({
    itemName: '',
    startDate: '',
    endDate: '',
    category: ''
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(collection(db, 'items'), orderBy('name'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(data);
        setFilteredItems(data);

        const categoryDocs = await getDocs(collection(db, 'categories'));
        const categoryData = categoryDocs.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().name;
          return acc;
        }, {});

        setCategories(categoryData);
      } catch (error) {
        console.error('Erro ao carregar itens:', error);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    if (filters.category) {
      const categoryItems = items.filter(item => item.categoryID === filters.category);
      setFilteredItems(categoryItems);
    } else {
      setFilteredItems(items);
    }
  }, [filters.category, items]);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        let q = query(collection(db, 'movements'), orderBy('timestamp', 'desc'));

        if (filters.itemName) {
          q = query(q, where('item', '>=', filters.itemName), where('item', '<=', filters.itemName + '\uf8ff'));
        }
        if (filters.startDate) {
          q = query(q, where('timestamp', '>=', new Date(filters.startDate)));
        }
        if (filters.endDate) {
          q = query(q, where('timestamp', '<=', new Date(filters.endDate)));
        }
        if (filters.category) {
          const categoryItems = items.filter(item => item.categoryID === filters.category).map(item => item.name);
          q = query(q, where('item', 'in', categoryItems));
        }

        const querySnapshot = await getDocs(q);
        const data = await Promise.all(querySnapshot.docs.map(async doc => {
          const movement = { id: doc.id, ...doc.data() };

          // Fetch the category name using itemID
          const itemDoc = await getDocs(query(collection(db, 'items'), where('name', '==', movement.item)));
          if (!itemDoc.empty) {
            const itemData = itemDoc.docs[0].data();
            const categoryID = itemData.categoryID;
            const categoryDoc = await getDocs(query(collection(db, 'categories'), where('__name__', '==', categoryID)));
            movement.category = categoryDoc.docs[0]?.data()?.name || 'Categoria não encontrada';
          } else {
            movement.category = 'Categoria não encontrada';
          }

          return movement;
        }));
        setMovements(data);
      } catch (error) {
        console.error('Erro ao carregar movimentações:', error);
      }
    };

    fetchMovements();
  }, [filters, items]);

  const handleAddMovement = async (e) => {
    e.preventDefault();
    try {
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error("Quantidade inválida");
      }

      const itemDoc = await getDocs(query(collection(db, 'items'), where('name', '==', item)));
      const itemData = itemDoc.docs[0]?.data();
      if (itemData) {
        const itemID = itemDoc.docs[0].id;
        const currentQuantity = itemData.quantity || 0;
        const newQuantity = type === 'entrada' ? currentQuantity + quantity : currentQuantity - quantity;

        await addDoc(collection(db, 'movements'), {
          item,
          itemID,
          quantity,
          type,
          timestamp: new Date()
        });

        await updateDoc(doc(db, 'items', itemID), { quantity: newQuantity });
        
        setItem('');
        setQuantity(0);
        setType('entrada');
        setMovements([{ item, itemID, quantity, type, timestamp: new Date(), category: categories[itemData.categoryID] }, ...movements]);
      } else {
        console.error('Item não encontrado na atualização');
      }
    } catch (error) {
      console.error("Erro ao adicionar movimentação:", error.message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleClearFilters = () => {
    setFilters({
      itemName: '',
      startDate: '',
      endDate: '',
      category: ''
    });
    setItem('');
    setFilteredItems(items);
  };

  return (
    <div className="stock-movement-container">
      <h1>Controle de Entrada e Saída de Itens</h1>
      <form onSubmit={handleAddMovement} className="movement-form">
        {/* Campo de Categoria */}
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          required
        >
          <option value="">Selecione uma Categoria</option>
          {Object.keys(categories).map(categoryID => (
            <option key={categoryID} value={categoryID}>{categories[categoryID]}</option>
          ))}
        </select>

        {/* Campo de Item */}
        <select
          value={item}
          onChange={(e) => setItem(e.target.value)}
          required
        >
          <option value="">Selecione um Item</option>
          {filteredItems.map(i => (
            <option key={i.id} value={i.name}>{i.name}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantidade"
          value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="entrada">Entrada</option>
          <option value="saída">Saída</option>
        </select>
        <button type="submit">Adicionar Movimentação</button>
      </form>

      <div className="filter-container">
        <h2>Filtros</h2>
        <input
          type="text"
          name="itemName"
          placeholder="Nome do Item"
          value={filters.itemName}
          onChange={handleFilterChange}
        />
        <label>Data Inicial:</label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
        />
        <label>Data Final:</label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
        />
        <button onClick={handleClearFilters}>Limpar Filtros</button>
      </div>

      <div className="movement-list">
        <h2>Histórico de Movimentações</h2>
        <ul>
          {movements.length > 0 ? (
            movements.map(movement => (
              <li key={movement.id}>
                <strong>Item:</strong> {movement.item}
                <strong>Categoria:</strong> {movement.category}
                <strong>Quantidade:</strong> {movement.quantity}
                <strong>Tipo:</strong> {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                <strong>Data/Hora:</strong> {new Date(movement.timestamp.seconds * 1000).toLocaleString()}
              </li>
            ))
          ) : (
            <li>Nenhuma movimentação encontrada</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default StockMovement;
