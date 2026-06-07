import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DogwalkerDashboard.css';

function DogwalkerServices() {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [description, setDescription] = useState('');
  const [baseCost, setBaseCost] = useState('');
  const [loading, setLoading] = useState(true);
  const [walkerStatus, setWalkerStatus] = useState(null);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadWalkerStatus();
    loadData();
  }, []);

  const loadWalkerStatus = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/dogwalkers/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const walker = data.find(w => w.d_walker_id == userId);
      setWalkerStatus(walker?.d_walker_status);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const loadData = async () => {
    try {
      const resProvided = await fetch(`http://localhost:8000/api/auth/dogwalkers/${userId}/services`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const providedData = await resProvided.json();
      setServices(Array.isArray(providedData) ? providedData : []);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка:', error);
      setServices([]);
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!selectedService) {
      alert('Выберите тип услуги');
      return;
    }
    if (!baseCost || baseCost <= 0) {
      alert('Введите корректную стоимость');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/auth/dogwalkers/${userId}/add-service`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          service_name: selectedService,
          description: description,
          base_cost: baseCost
        })
      });
      
      if (response.ok) {
        setShowForm(false);
        setSelectedService('');
        setDescription('');
        setBaseCost('');
        loadData();
      } else {
        alert('Ошибка при добавлении услуги');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при добавлении услуги');
    }
  };

  const handleRemoveService = async (serviceId) => {
    try {
      await fetch(`http://localhost:8000/api/auth/services/${serviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadData();
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при удалении услуги');
    }
  };

  const handleDescriptionChange = (e) => {
    if (e.target.value.length <= 255) {
      setDescription(e.target.value);
    }
  };

  if (loading) {
    return <div className="dashboard-container">Загрузка...</div>;
  }

  if (walkerStatus === 'R') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Панель выгульщика</h2>
          <div className="dashboard-tabs">
            <Link to="/dashboard" className="tab">Профиль</Link>
            <Link to="/dashboard/services" className="tab active">Услуги</Link>
          </div>
        </div>
        <div className="dashboard-content">
          <div className="info-card">
            <h3>Анкета отклонена</h3>
            <p>Вы не можете создавать услуги. Свяжитесь с администратором: dogwalking.help@gmail.com</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Панель выгульщика</h2>
        <div className="dashboard-tabs">
          <Link to="/dashboard" className="tab">Профиль</Link>
          <Link to="/dashboard/services" className="tab active">Услуги</Link>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="services-header">
          <h3>Мои услуги</h3>
          <button className="add-service-btn" onClick={() => setShowForm(!showForm)}>
            + Создать услугу
          </button>
        </div>
        
        {showForm && (
          <div className="add-service-form">
            <select 
              value={selectedService} 
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">Выберите тип услуги</option>
              <option value="Выгул">Выгул</option>
              <option value="Дрессировка">Дрессировка</option>
              <option value="Передержка">Передержка</option>
            </select>
            <input
              type="text"
              placeholder="Описание услуги (максимум 255 символов)"
              value={description}
              onChange={handleDescriptionChange}
            />
            <input
              type="number"
              placeholder="Базовая стоимость (руб)"
              value={baseCost}
              onChange={(e) => setBaseCost(e.target.value)}
            />
            <button onClick={handleAddService}>Добавить</button>
            <button onClick={() => setShowForm(false)}>Отмена</button>
          </div>
        )}
        
        {services.length === 0 ? (
          <p className="empty-services">У вас пока нет услуг</p>
        ) : (
          <table className="services-table">
            <thead>
              <tr>
                <th>Название услуги</th>
                <th>Описание</th>
                <th>Стоимость</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.service_id}>
                  <td>{service.serv_name}</td>
                  <td>{service.serv_discrib || '-'}</td>
                  <td>{service.serv_base_cost} руб.</td>
                  <td>
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveService(service.service_id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DogwalkerServices;