import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import './SignUp.css';
import { auth } from '../firebaseConfig'; // Certifique-se de que o caminho está correto

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Instanciar useNavigate

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/home'); // Redirecionar para a página principal
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/home'); // Redirecionar para a página principal
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-container">
      <h2>Criar Conta no StockMaster</h2>
      <form onSubmit={handleSignUp}>
        <div>
          <label>E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirme a Senha:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Criar Conta</button>
        <button type="button" onClick={handleGoogleSignUp} className="google-signup-button">
          <i className="fab fa-google"></i>
          Cadastrar com Google
        </button>
        <p className="login-link">Já tem uma conta? <a href="./">Faça login</a></p>
      </form>
    </div>
  );
};

export default SignUp;
