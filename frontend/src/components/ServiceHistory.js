import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './ServiceHistory.css';
import { getAuth } from 'firebase/auth'; // Importar getAuth para obter o usuário autenticado

const ServiceHistory = () => {
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [filters, setFilters] = useState({
    client: '',
    date: '',
    observations: '',
    clientSearch: ''
  });

  useEffect(() => {
    const fetchServices = async () => {
      const servicesQuery = query(collection(db, 'services'));
      const servicesSnapshot = await getDocs(servicesQuery);
      const servicesList = servicesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date // Preserva a data no formato YYYY-MM-DD
        };
      });
      setServices(servicesList);
    };

    const fetchClients = async () => {
      const clientsQuery = query(collection(db, 'clients'));
      const clientsSnapshot = await getDocs(clientsQuery);
      const clientsList = clientsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      setClients(clientsList);
      setFilteredClients(clientsList); // Inicialmente, todos os clientes são exibidos
    };

    fetchServices();
    fetchClients();
  }, []);

  useEffect(() => {
    // Filtrar clientes com base no campo de pesquisa
    const newFilteredClients = clients.filter(client =>
      client.name.toLowerCase().includes(filters.clientSearch.toLowerCase())
    );
    setFilteredClients(newFilteredClients);
  }, [filters.clientSearch, clients]);

  // Função para formatar a data para exibição (dd/mm/yyyy)
  const formatDate = (date) => {
    if (!date) return '';

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  // Função para converter data do formato dd/mm/yyyy para yyyy-mm-dd
  const formatDateForFilter = (date) => {
    if (!date) return '';

    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: name === 'date' ? formatDateForFilter(value) : value
    }));
  };

  const filteredServices = services.filter((service) => {
    const clientMatch = filters.client ? service.clientName === filters.client : true;
    const dateMatch = filters.date ? service.date === formatDateForFilter(filters.date) : true; // Ajuste na comparação de data
    const observationsMatch = filters.observations
      ? (service.observations || '').toLowerCase().includes(filters.observations.toLowerCase())
      : true;
    return clientMatch && dateMatch && observationsMatch;
  });

  const handleDeleteService = async (id) => {
    const auth = getAuth();
    const user = auth.currentUser;

    const serviceDocRef = doc(db, 'services', id);
    await deleteDoc(serviceDocRef);

    // Adicionar ao log
    await addDoc(collection(db, 'serviceLogs'), {
      action: 'delete',
      serviceId: id,
      timestamp: new Date(),
      user: user ? user.email : 'Usuário não autenticado',
    });

    alert('Serviço excluído com sucesso!');
    setServices(services.filter(service => service.id !== id));
  };

  return (
    <div className="service-history-container">
      <h1>Histórico de Serviços</h1>

      <div className="filters-container">
        <input
          type="text"
          name="clientSearch"
          value={filters.clientSearch}
          onChange={handleFilterChange}
          placeholder="Buscar cliente"
        />
        <select
          name="client"
          value={filters.client}
          onChange={handleFilterChange}
        >
          <option value="">Selecione um cliente</option>
          {filteredClients.map(client => (
            <option key={client.id} value={client.name}>
              {client.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          placeholder="Data (dd/mm/yyyy)"
        />
        <input
          type="text"
          name="observations"
          value={filters.observations}
          onChange={handleFilterChange}
          placeholder="Observações"
        />
      </div>

      <div className="service-list">
        {filteredServices.length > 0 ? (
          filteredServices.map(service => (
            <div key={service.id} className="service-item">
              <p><strong>Cliente:</strong> {service.clientName}</p>
              <p><strong>Data:</strong> {formatDate(service.date)}</p>
              <p><strong>Observação:</strong> {service.observations || 'Sem observação'}</p>
              <p><strong>Valor:</strong> R${service.value}</p>
              <div className="actions">
                <button onClick={() => handleDeleteService(service.id)}>Excluir</button>
              </div>
            </div>
          ))
        ) : (
          <p>Nenhum serviço encontrado com os filtros aplicados.</p>
        )}
      </div>
    </div>
  );
};

export default ServiceHistory;
