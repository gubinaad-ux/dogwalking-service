import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import BookingsPage from './pages/BookingsPage';
import ClientsPage from './pages/ClientsPage';
import DogwalkersPage from './pages/DogwalkersPage';
import ReportPage from './pages/ReportPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import DogwalkerDashboard from './pages/DogwalkerDashboard';
import DogwalkerServices from './pages/DogwalkerServices';
import ClientDashboard from './pages/ClientDashboard';
import AdminForms from './pages/AdminForms';
function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    if (token && userRole) {
      setIsAuth(true);
      setRole(userRole);
    }
  }, []);

  const handleLogin = (userRole) => {
    setIsAuth(true);
    setRole(userRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setIsAuth(false);
    setRole(null);
  };

  if (isAuth) {
    return (
      <BrowserRouter>
        <div className="app">
          <nav className="navbar">
            <div className="nav-container">
              <div className="nav-brand">Выгул собак</div>
              <div className="nav-menu">
                {role === 'admin' && (
                  <>
                    <Link to="/" className="nav-link">Бронирования</Link>
                    <Link to="/clients" className="nav-link">Клиенты</Link>
                    <Link to="/dogwalkers" className="nav-link">Выгульщики</Link>
                    <Link to="/report" className="nav-link">Отчёт</Link>
                    <Link to="/admin-forms" className="nav-link">Анкеты</Link>
                  </>
                )}
                
                {role === 'dogwalker' && (
                  <Link to="/dashboard" className="nav-link">Мой профиль</Link>
                )}
                
                {role === 'client' && (
                  <Link to="/dashboard" className="nav-link">Мой профиль</Link>
                )}
                
                <span className="nav-role">
                  {role === 'client' ? 'Клиент' : role === 'dogwalker' ? 'Выгульщик' : 'Админ'}
                </span>
                <button onClick={handleLogout} className="nav-link logout-btn">Выйти</button>
              </div>
            </div>
          </nav>
          <div className="container">
            <Routes>
              {role === 'admin' && (
                <>
                  <Route path="/" element={<BookingsPage />} />
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/dogwalkers" element={<DogwalkersPage />} />
                  <Route path="/report" element={<ReportPage />} />
                  <Route path="/admin-forms" element={<AdminForms />} />
                </>
              )}
              
             {role === 'dogwalker' && (
                <>
                  <Route path="/dashboard" element={<DogwalkerDashboard />} />
                  <Route path="/dashboard/services" element={<DogwalkerServices />} />
                </>
              )}
              
              {role === 'client' && (
                <Route path="/dashboard" element={<ClientDashboard />} />
              )}
              
              <Route path="*" element={<Navigate to="/dashboard" />} />
              <Route path="/admin-login" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin-login" element={<AdminLoginPage onLogin={handleLogin} />} />
        <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;