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

        const uniqueCategories = Array.from(new Set(data.map(item => item.category).filter(cat => cat)));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Erro ao carregar itens:', error);
      }
    };

    fetchItems();
  }, []);

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
          const categoryItems = items.filter(item => item.category === filters.category).map(item => item.name);
          q = query(q, where('item', 'in', categoryItems));
        }

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

      // Adiciona movimentação
      await addDoc(collection(db, 'movements'), {
        item,
        quantity,
        type,
        timestamp: new Date()
      });

      // Atualiza a quantidade do item
      const itemDoc = await getDocs(query(collection(db, 'items'), where('name', '==', item)));
      const itemData = itemDoc.docs[0]?.data();
      if (itemData) {
        const currentQuantity = itemData.quantity || 0;
        const newQuantity = type === 'entrada' ? currentQuantity + quantity : currentQuantity - quantity;
        await updateDoc(doc(db, 'items', itemDoc.docs[0].id), { quantity: newQuantity });
        
        // Atualiza a lista de movimentações e limpa os campos
        setItem('');
        setQuantity(0);
        setType('entrada');
        setMovements([{ item, quantity, type, timestamp: new Date() }, ...movements]);
      } else {
        // Item não encontrado, pode ser necessário adicionar uma lógica para lidar com isso
        console.error('Item não encontrado na atualização');
      }
    } catch (error) {
      console.error("Erro ao adicionar movimentação:", error.message);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = items.filter(item => item.name.toLowerCase().includes(query));
    setFilteredItems(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleItemChange = (e) => {
    const selectedItem = e.target.value;
    setItem(selectedItem);
    const itemCategory = items.find(i => i.name === selectedItem)?.category || '';
    setFilters(prevFilters => ({
      ...prevFilters,
      category: itemCategory
    }));
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

  const handleQuantityChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setQuantity(value);
    } else {
      setQuantity(0);
    }
  };

  return (
    <div className="stock-movement-container">
      <h1>Controle de Entrada e Saída de Itens</h1>
      <form onSubmit={handleAddMovement} className="movement-form">
        <input
          type="text"
          placeholder="Pesquisar Item"
          onChange={handleSearch}
        />
        <select
          value={item}
          onChange={handleItemChange}
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
          onChange={handleQuantityChange}
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
          placeholder="Data de Início"
          value={filters.startDate}
          onChange={handleFilterChange}
        />
        <label>Data Final:</label>
        <input
          type="date"
          name="endDate"
          placeholder="Data de Fim"
          value={filters.endDate}
          onChange={handleFilterChange}
        />
        <select
          name="category"
          className="category-select"
          value={filters.category}
          onChange={handleFilterChange}
        >
       <option value="">Categoria</option>
       {categories.map((cat, index) => (
       <option key={index} value={cat}>{cat}</option>
  ))}
</select>
        <div className="Limpa-Filtros">
        <button onClick={handleClearFilters}>Limpar Filtros</button>
        </div>
      </div>
      
      <div className="movement-list">
        <h2>Histórico de Movimentações</h2>
        <ul>
          {movements.length > 0 ? (
            movements.map(movement => (
              <li key={movement.id}>
                <span>{new Date(movement.timestamp.seconds * 1000).toLocaleString()} - </span>
                <span>{movement.item} - </span>
                <span>{isNaN(movement.quantity) ? 'Quantidade inválida' : `${movement.quantity} unidades`} - </span>
                <span>{movement.type === 'entrada' ? 'Entrada' : 'Saída'}</span>
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
