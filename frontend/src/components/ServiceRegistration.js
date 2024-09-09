import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './ServiceRegistration.css';

const ServiceRegistration = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [serviceData, setServiceData] = useState({
    client: '',
    value: '',
    date: '',
    observations: '',
  });

  // Carrega a lista de clientes ao carregar a página
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsSnapshot = await getDocs(collection(db, 'clients'));
        const clientsList = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClients(clientsList);
        setFilteredClients(clientsList); // Inicialmente, a lista completa será exibida
      } catch (err) {
        console.error("Erro ao carregar clientes:", err.message);
      }
    };

    fetchClients();
  }, []);

  // Filtra a lista de clientes com base no termo digitado
  const handleClientSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm)
    );
    setFilteredClients(filtered);
    setServiceData({
      ...serviceData,
      client: searchTerm,
    });
  };

  // Manipula a seleção do cliente via combobox
  const handleClientSelect = (e) => {
    const clientId = e.target.value;
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client);
    setServiceData({
      ...serviceData,
      client: client ? client.name : '', // Preenche o campo com o nome do cliente selecionado
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setServiceData({
      ...serviceData,
      [name]: value,
    });
  };

  // Função para salvar o serviço
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClient) {
      alert('Por favor, selecione um cliente.');
      return;
    }

    try {
      // Convertendo a data para o formato YYYY-MM-DD
      const formattedDate = new Date(serviceData.date).toISOString().split('T')[0]; // Formata a data para YYYY-MM-DD

      await addDoc(collection(db, 'services'), {
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        value: parseFloat(serviceData.value) || 0,
        date: formattedDate, // Salvando a data formatada
        observations: serviceData.observations,
      });
      alert('Serviço cadastrado com sucesso!');
      setServiceData({
        client: '',
        value: '',
        date: '',
        observations: '',
      });
      setSelectedClient(null);
    } catch (err) {
      console.error('Erro ao cadastrar serviço:', err.message);
    }
  };

  return (
    <div className="service-registration-container">
      <h1>Cadastro de Serviços</h1>
      <form onSubmit={handleSubmit} className="service-form">
        <div className="form-group">
          <label htmlFor="client">Cliente (Pesquisar):</label>
          <input
            type="text"
            id="client"
            name="client"
            value={serviceData.client}
            onChange={handleClientSearch}
            placeholder="Pesquisar cliente pelo nome"
          />
        </div>

        <div className="form-group">
          <label htmlFor="clientSelect">Selecione o Cliente:</label>
          <select
            id="clientSelect"
            onChange={handleClientSelect}
            value={selectedClient ? selectedClient.id : ''}
          >
            <option value="">Selecione um cliente</option>
            {filteredClients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="value">Valor do Serviço:</label>
          <input
            type="number"
            id="value"
            name="value"
            value={serviceData.value}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Data:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={serviceData.date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="observations">Observações:</label>
          <textarea
            id="observations"
            name="observations"
            value={serviceData.observations}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit" className="submit-button">Cadastrar Serviço</button>
      </form>
    </div>
  );
};

export default ServiceRegistration;
