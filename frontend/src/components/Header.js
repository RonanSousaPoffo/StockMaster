// src/components/Header.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const Header = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate("/home");
  };

  return (
    <header style={styles.header}>
      <div onClick={goToHome} style={styles.iconContainer}>
        <FaHome style={styles.icon} />
      </div>
    </header>
  );
};

const styles = {
  header: {
    position: "fixed", // Fixa o header no canto superior esquerdo
    top: 0,
    left: 0,
    padding: "10px", // Adiciona um pouco de espaçamento em torno do ícone
    backgroundColor: "#333", // Cor de fundo para melhorar a visibilidade
    zIndex: 1000, // Mantém o header sobre outros elementos
  },
  iconContainer: {
    cursor: "pointer",
  },
  icon: {
    fontSize: "24px", // Ajuste o tamanho do ícone conforme necessário
    color: "#fff", // Cor do ícone
  },
};

export default Header;
