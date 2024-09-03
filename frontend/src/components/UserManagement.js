import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig"; 
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Função para obter o ID do administrador
  const getAdminId = () => {
    const adminUser = auth.currentUser;
    return adminUser ? adminUser.uid : null;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const adminId = getAdminId(); // Pega o ID do administrador
        if (!adminId) {
          setError("Usuário não autenticado.");
          return;
        }

        // Consulta para pegar apenas os usuários secundários
        const usersQuery = query(collection(db, "users"), where("isSecondary", "==", true), where("adminId", "==", adminId));
        const querySnapshot = await getDocs(usersQuery);
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(usersList);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        setError("Erro ao carregar usuários.");
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!newUserEmail) {
      setError("Por favor, insira o e-mail do novo usuário.");
      setLoading(false);
      return;
    }

    try {
      const adminId = getAdminId(); // Pega o ID do administrador
      if (!adminId) {
        setError("Não foi possível identificar o administrador.");
        setLoading(false);
        return;
      }

      // Cria uma nova conta no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, newUserEmail, "senha-padrao123"); // Senha padrão

      // Adiciona o novo usuário no Firestore como uma conta secundária
      await addDoc(collection(db, "users"), {
        email: newUserEmail,
        isSecondary: true,
        adminId: adminId, // Relaciona com o administrador
      });

      setUsers([...users, { id: userCredential.user.uid, email: newUserEmail, isSecondary: true }]);
      setNewUserEmail("");
    } catch (error) {
      console.error("Erro ao adicionar novo usuário:", error);
      setError("Erro ao adicionar novo usuário.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setDeleteError("");
    try {
      // Obtém o e-mail do usuário a ser excluído
      const userToDelete = users.find(user => user.id === userId);
      if (!userToDelete) {
        setDeleteError("Erro: Usuário não encontrado.");
        return;
      }

      // Exclui o documento do Firestore
      const userQuery = query(collection(db, "users"), where("email", "==", userToDelete.email));
      const querySnapshot = await getDocs(userQuery);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Exclui o usuário do Firebase Auth
      const authUser = auth.currentUser;
      if (authUser && authUser.uid === userId) {
        await deleteUser(authUser);
      } else {
        setDeleteError("Erro: Não foi possível encontrar o usuário para exclusão.");
        return;
      }

      // Atualiza a lista de usuários localmente
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      setDeleteError(`Erro ao excluir usuário: ${error.message}`);
    }
  };

  return (
    <div className="user-management-container">
      <h2>Gerenciamento de Usuários Secundários</h2>
      <form onSubmit={handleAddUser}>
        <div>
          <label>E-mail do Novo Usuário:</label>
          <input
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="add-user-button" disabled={loading}>
          {loading ? "Adicionando..." : "Adicionar Usuário"}
        </button>
      </form>
      {deleteError && <p className="error-message">{deleteError}</p>}
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.email}
            <button onClick={() => handleDeleteUser(user.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;
