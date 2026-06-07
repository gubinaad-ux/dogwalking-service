import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [tab, setTab] = useState(0);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const handleSubmit = async () => {
  if (!isLogin && form.password !== form.password2) {
    setError('Пароли не совпадают');
    return;
  }

  const endpoint = isLogin 
    ? (tab === 0 ? '/auth/login/client' : '/auth/login/dogwalker')
    : (tab === 0 ? '/auth/register/client' : '/auth/register/dogwalker');
  
  let data = {};
  if (tab === 0) {
    data = { email: form.email, password: form.password };
  } else {
    data = { login: form.login, password: form.password };
  }
  
  try {
    const res = await fetch(`http://localhost:8000/api${endpoint}`, {
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
      // ✅ Правильная обработка ошибки
      if (typeof result.detail === 'string') {
        setError(result.detail);
      } else if (Array.isArray(result.detail)) {
        setError(result.detail[0]?.msg || 'Ошибка');
      } else if (result.detail?.msg) {
        setError(result.detail.msg);
      } else {
        setError('Ошибка при входе');
      }
    }
  } catch (err) {
    setError('Ошибка соединения с сервером');
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Выгул собак</h2>
        
        <div className="login-tabs">
          <button className={tab === 0 ? 'active' : ''} onClick={() => setTab(0)}>Клиент</button>
          <button className={tab === 1 ? 'active' : ''} onClick={() => setTab(1)}>Догволкер</button>
        </div>
        
        <div className="login-form">
          <input 
            type="text" 
            placeholder={tab === 0 ? "Email" : "Логин"} 
            onChange={(e) => setForm({...form, [tab === 0 ? 'email' : 'login']: e.target.value})} 
          />
          <input 
            type="password" 
            placeholder="Пароль" 
            onChange={(e) => setForm({...form, password: e.target.value})} 
          />
          
          {!isLogin && (
            <input 
              type="password" 
              placeholder="Повторите пароль" 
              onChange={(e) => setForm({...form, password2: e.target.value})} 
            />
          )}
          
          {error && <div className="login-error">{error}</div>}
          
          <button className="login-btn" onClick={handleSubmit}>
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
          
          <button className="login-switch" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;