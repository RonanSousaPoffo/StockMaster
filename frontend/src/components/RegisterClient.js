import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './ServiceRegistration.css';

const ServiceRegistration = () => {
  const [serviceData, setServiceData] = useState({
    clientName: '',
    date: '',
    description: '',
    price: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServiceData({
      ...serviceData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convertendo a data para um timestamp em milissegundos
      const localDate = new Date(serviceData.date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const timestamp = new Date(localDate).getTime(); // Obtendo o timestamp em milissegundos

      // Adicionando a transformação para maiúsculas antes de enviar
      const normalizedData = {
        clientName: serviceData.clientName.toUpperCase(),
        date: timestamp, // Salvando o timestamp
        description: serviceData.description.toUpperCase(),
        price: parseFloat(serviceData.price) || 0
      };

      await addDoc(collection(db, 'services'), normalizedData);
      setSuccessMessage('Serviço cadastrado com sucesso!');
      setServiceData({
        clientName: '',
        date: '',
        description: '',
        price: ''
      });
    } catch (err) {
      console.error('Erro ao cadastrar serviço:', err.message);
      setSuccessMessage('Erro ao cadastrar serviço, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="service-registration-container">
      <h2>Cadastrar Serviço</h2>
      <form onSubmit={handleSubmit} className="service-registration-form">
        <label>
          Nome do Cliente:
          <input
            type="text"
            name="clientName"
            value={serviceData.clientName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Data:
          <input
            type="datetime-local"
            name="date"
            value={serviceData.date}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Descrição:
          <input
            type="text"
            name="description"
            value={serviceData.description}
            onChange={handleChange}
          />
        </label>
        <label>
          Preço:
          <input
            type="number"
            name="price"
            value={serviceData.price}
            onChange={handleChange}
            step="0.01"
          />
        </label>
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
};

export default ServiceRegistration;
