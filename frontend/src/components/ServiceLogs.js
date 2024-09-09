// src/components/ServiceLogs.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './ServiceLogs.css';

const ServiceLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logsQuery = query(collection(db, 'serviceLogs'), where('action', '==', 'delete'));
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
  }, []);

  return (
    <div className="service-logs-container">
      <h1>Logs de Serviços Deletados</h1>
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
