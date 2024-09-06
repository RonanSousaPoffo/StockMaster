import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './RegisterClient.css';

const RegisterClient = () => {
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData({
      ...clientData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'clients'), clientData);
      setSuccessMessage('Cliente cadastrado com sucesso!');
      setClientData({
        name: '',
        email: '',
        phone: '',
        address: ''
      });
    } catch (err) {
      console.error('Erro ao cadastrar cliente:', err.message);
      setSuccessMessage('Erro ao cadastrar cliente, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-client-container">
      <h2>Cadastrar Cliente</h2>
      <form onSubmit={handleSubmit} className="register-client-form">
        <label>
          Nome:
          <input
            type="text"
            name="name"
            value={clientData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={clientData.email}
            onChange={handleChange}
          />
        </label>
        <label>
          Telefone:
          <input
            type="tel"
            name="phone"
            value={clientData.phone}
            onChange={handleChange}
          />
        </label>
        <label>
          Endereço:
          <input
            type="text"
            name="address"
            value={clientData.address}
            onChange={handleChange}
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

export default RegisterClient;
