import React, { useState } from 'react';
import './LoginPage.css';

function AdminLoginPage({ onLogin }) {
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const data = { login: form.login, password: form.password };
    
    try {
      const res = await fetch(`http://localhost:8000/api/auth/login/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('role', result.role);
        localStorage.setItem('userId', result.user_id);
        onLogin(result.role);
      } else {
        setError(result.detail || 'Неверный логин или пароль');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Администратор</h2>
        
        <div className="login-form">
          <input 
            type="text" 
            placeholder="Логин" 
            onChange={(e) => setForm({...form, login: e.target.value})} 
          />
          <input 
            type="password" 
            placeholder="Пароль" 
            onChange={(e) => setForm({...form, password: e.target.value})} 
          />
          
          {error && <div className="login-error">{error}</div>}
          
          <button className="login-btn" onClick={handleSubmit}>
            Войти
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;