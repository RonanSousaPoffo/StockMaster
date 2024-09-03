import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Para navegação
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import './Login.css';
import { auth } from '../firebaseConfig'; // Certifique-se de que o caminho está correto

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Verifica se o usuário já está logado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/home');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home'); // Redirecionar após o login
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/home'); // Redirecionar após o login
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Por favor, insira seu e-mail.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('E-mail de redefinição enviado.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignUp = () => {
    navigate('/signup'); // Redirecionar para a página de criação de conta
  };

  return (
    <div className="login-container">
      <h2>Logar em StockMaster</h2>
      <form onSubmit={handleLogin}>
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
        {error && <p className="error-message">{error}</p>}
        <p className="forgot-password" onClick={handleForgotPassword}>Esqueceu a senha?</p>
        <button type="submit" className="login-button">Entrar</button>
        {/*<button type="button" onClick={handleGoogleLogin} className="google-login-button">
          <i className="fab fa-google"></i>
          Entrar com Google
        </button>*/}
        <p className="create-account-text">
          Não tem uma conta? <span className="create-account-link" onClick={handleSignUp}>Crie sua conta</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
