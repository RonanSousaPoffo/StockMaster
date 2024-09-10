import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './ConsultClients.css';

const ConsultClients = () => {
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cpfCnpj: '' // Novo campo para CPF/CNPJ no filtro
  });
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const q = query(collection(db, 'clients'), ...buildFilters());
        const querySnapshot = await getDocs(q);
        const clientsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setClients(clientsList);
      } catch (err) {
        console.error("Erro ao carregar clientes:", err.message);
      }
    };

    fetchClients();
  }, [filters]);

  const buildFilters = () => {
    const filterQueries = [];
    if (filters.name) {
      filterQueries.push(where('name', '>=', filters.name.toUpperCase()));
      filterQueries.push(where('name', '<=', filters.name.toUpperCase() + '\uf8ff'));
    }
    if (filters.email) {
      filterQueries.push(where('email', '>=', filters.email.toUpperCase()));
      filterQueries.push(where('email', '<=', filters.email.toUpperCase() + '\uf8ff'));
    }
    if (filters.phone) {
      filterQueries.push(where('phone', '>=', filters.phone.toUpperCase()));
      filterQueries.push(where('phone', '<=', filters.phone.toUpperCase() + '\uf8ff'));
    }
    if (filters.address) {
      filterQueries.push(where('address', '>=', filters.address.toUpperCase()));
      filterQueries.push(where('address', '<=', filters.address.toUpperCase() + '\uf8ff'));
    }
    if (filters.cpfCnpj) {
      filterQueries.push(where('cpfCnpj', '>=', filters.cpfCnpj));
      filterQueries.push(where('cpfCnpj', '<=', filters.cpfCnpj + '\uf8ff'));
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

  const handleEditClick = (client) => {
    setEditingClient(client);
  };

  const handleDeleteClick = async (clientId) => {
    try {
      await deleteDoc(doc(db, 'clients', clientId));
      setClients(prevClients => prevClients.filter(client => client.id !== clientId));
    } catch (err) {
      console.error("Erro ao deletar cliente:", err.message);
    }
  };

  const handleSaveChanges = async () => {
    if (editingClient) {
      try {
        const updatedClient = {
          ...editingClient,
          name: editingClient.name.toUpperCase(),
          email: editingClient.email.toUpperCase(),
          phone: editingClient.phone.toUpperCase(),
          address: editingClient.address.toUpperCase(),
          cpfCnpj: editingClient.cpfCnpj // Mantendo o CPF/CNPJ no formato atual
        };
        await updateDoc(doc(db, 'clients', editingClient.id), updatedClient);
        setEditingClient(null);
        const q = query(collection(db, 'clients'), ...buildFilters());
        const querySnapshot = await getDocs(q);
        const clientsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setClients(clientsList);
      } catch (err) {
        console.error("Erro ao atualizar cliente:", err.message);
      }
    }
  };

  return (
    <div className="consult-clients">
      <h1>Consultar Clientes</h1>
      <div className="filter-container">
        <input
          type="text"
          name="name"
          value={filters.name}
          onChange={handleFilterChange}
          placeholder="Nome"
        />
        <input
          type="text"
          name="email"
          value={filters.email}
          onChange={handleFilterChange}
          placeholder="Email"
        />
        <input
          type="text"
          name="phone"
          value={filters.phone}
          onChange={handleFilterChange}
          placeholder="Telefone"
        />
        <input
          type="text"
          name="address"
          value={filters.address}
          onChange={handleFilterChange}
          placeholder="Endereço"
        />
        <input
          type="text"
          name="cpfCnpj"
          value={filters.cpfCnpj}
          onChange={handleFilterChange}
          placeholder="CPF/CNPJ"
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Endereço</th>
            <th>CPF/CNPJ</th> 
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td>{client.name}</td>
              <td>{client.email}</td>
              <td>{client.phone}</td>
              <td>{client.address}</td>
              <td>{client.cpfCnpj}</td> 
              <td>
                <button className="action-button edit" onClick={() => handleEditClick(client)}>Editar</button>
                <button className="action-button delete" onClick={() => handleDeleteClick(client.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de Edição de Cliente */}
      {editingClient && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Editar Cliente</h2>
            <input
              type="text"
              value={editingClient.name}
              onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value.toUpperCase() })}
              placeholder="Nome"
            />
            <input
              type="text"
              value={editingClient.email}
              onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value.toUpperCase() })}
              placeholder="Email"
            />
            <input
              type="text"
              value={editingClient.phone}
              onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value.toUpperCase() })}
              placeholder="Telefone"
            />
            <input
              type="text"
              value={editingClient.address}
              onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value.toUpperCase() })}
              placeholder="Endereço"
            />
            <input
              type="text"
              value={editingClient.cpfCnpj}
              onChange={(e) => setEditingClient({ ...editingClient, cpfCnpj: e.target.value })}
              placeholder="CPF/CNPJ"
            />
            <button onClick={handleSaveChanges}>Salvar</button>
            <button onClick={() => setEditingClient(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultClients;
