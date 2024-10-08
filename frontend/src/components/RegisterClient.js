import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./RegisterClient.css";

const RegisterClient = () => {
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    cpfCnpj: "", // Novo campo para CPF/CNPJ
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData({
      ...clientData,
      [name]: value.toUpperCase(), // Convertendo para maiúsculas
    });
  };

  const handleCpfCnpjChange = (e) => {
    let { value } = e.target;
    value = value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos
    if (value.length <= 11) {
      // Formatação para CPF
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      // Formatação para CNPJ
      value = value.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }
    setClientData({
      ...clientData,
      cpfCnpj: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Adicionando a transformação para maiúsculas antes de enviar
      const normalizedData = {
        name: clientData.name.toUpperCase(),
        email: clientData.email.toUpperCase(),
        phone: clientData.phone.toUpperCase(),
        address: clientData.address.toUpperCase(),
        cpfCnpj: clientData.cpfCnpj, // Não aplicar toUpperCase para CPF/CNPJ
      };
      await addDoc(collection(db, "clients"), normalizedData);
      setSuccessMessage("Cliente cadastrado com sucesso!");
      setClientData({
        name: "",
        email: "",
        phone: "",
        address: "",
        cpfCnpj: "", // Resetar campo CPF/CNPJ
      });
    } catch (err) {
      console.error("Erro ao cadastrar cliente:", err.message);
      setSuccessMessage("Erro ao cadastrar cliente, tente novamente.");
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
        <label>
          CPF/CNPJ:
          <input
            type="text"
            name="cpfCnpj"
            value={clientData.cpfCnpj}
            onChange={handleCpfCnpjChange}
          />
        </label>
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
};

export default RegisterClient;
