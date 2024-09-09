// src/components/ServiceLogs.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './ServiceLogs.css';

const ServiceLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: '',
    user: ''
  });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        let logsQuery = query(collection(db, 'serviceLogs'));

        if (filters.action) {
          logsQuery = query(logsQuery, where('action', '==', filters.action));
        }
        if (filters.user) {
          logsQuery = query(logsQuery, where('user', '>=', filters.user));
          logsQuery = query(logsQuery, where('user', '<=', filters.user + '\uf8ff')); // Adiciona caractere de final para incluir todos os nomes que comecem com a string fornecida
        }
        if (filters.startDate || filters.endDate) {
          const startDate = filters.startDate ? new Date(filters.startDate) : new Date('1970-01-01');
          const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
          endDate.setDate(endDate.getDate() + 1); // Inclusive end date

          logsQuery = query(logsQuery, where('timestamp', '>=', Timestamp.fromDate(startDate)));
          logsQuery = query(logsQuery, where('timestamp', '<', Timestamp.fromDate(endDate)));
        }

        const logsSnapshot = await getDocs(logsQuery);
        const logsList = logsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: new Date(doc.data().timestamp.seconds * 1000).toLocaleString() // Convertendo timestamp para formato legível
        }));
        setLogs(logsList);
      } catch (error) {
        console.error("Error fetching logs: ", error);
      }
    };

    fetchLogs();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      action: '',
      startDate: '',
      endDate: '',
      user: ''
    });
  };

  return (
    <div className="service-logs-container">
      <h1>Logs de Serviços Deletados</h1>
      <div className="filters-container">
        <input
          type="text"
          name="action"
          value={filters.action}
          onChange={handleFilterChange}
          placeholder="Ação"
        />
        <input
          type="text"
          name="user"
          value={filters.user}
          onChange={handleFilterChange}
          placeholder="Usuário"
        />
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          placeholder="Data Início"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          placeholder="Data Fim"
        />     
        <button className="clear-filters-button" onClick={handleClearFilters}>Limpar Filtros</button>
      </div>
      <div className="logs-list">
        {logs.length > 0 ? (
          logs.map(log => (
            <div key={log.id} className="log-item">
              <p><strong>Data e Hora:</strong> {log.timestamp}</p>
              <p><strong>Serviço ID:</strong> {log.serviceId}</p>
              <p><strong>Ação:</strong> {log.action}</p>
              <p><strong>Usuário:</strong> {log.user}</p>
            </div>
          ))
        ) : (
          <p>Nenhum log encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default ServiceLogs;
