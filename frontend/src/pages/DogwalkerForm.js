import React, { useState, useEffect } from 'react';
import './DogwalkerForm.css';

function DogwalkerForm({ userId }) {
  const [formData, setFormData] = useState({
    fio: '',
    passport: '',
    phone: '',
    email: ''
  });
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/auth/form/status/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.status === 'waiting') {
        setSubmitted(true);
        setMessage('Анкета уже отправлена и находится на проверке');
      } else if (data.status === 'approved') {
        setSubmitted(true);
        setMessage('Анкета одобрена');
      } else if (data.status === 'rejected') {
        setSubmitted(true);
        setMessage('Анкета отклонена. Свяжитесь с администратором: dogwalking.help@gmail.com');
      }
      setStatus(data.status);
    } catch (err) {
      console.error('Ошибка проверки статуса:', err);
    }
  };

  const validateForm = () => {
    if (formData.fio.length < 5) {
      setMessage('ФИО должно содержать минимум 5 символов');
      return false;
    }
    if (formData.passport.length < 8) {
      setMessage('Паспортные данные должны содержать минимум 8 символов');
      return false;
    }
    if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
      setMessage('Телефон должен содержать 10 цифр (без +7, 8 или скобок)');
      return false;
    }
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setMessage('Введите корректный email');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setMessage('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/auth/form/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          walker_id: Number(userId),
          fio: formData.fio,
          passport: formData.passport,
          phone: formData.phone,
          email: formData.email
        })
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setSubmitted(true);
        setMessage('Анкета отправлена на проверку');
      } else {
        setMessage(result.detail || 'Ошибка при отправке');
      }
    } catch (err) {
      setMessage('Ошибка соединения');
    }
  };

  if (submitted) {
    return (
      <div className="form-container">
        <h3>Анкета</h3>
        <p>{message}</p>
      </div>
    );
  }

  if (status === 'loading') {
    return <div className="form-container">Загрузка...</div>;
  }

  return (
    <div className="form-container">
      <h3>Заполните анкету для подтверждения</h3>
      <div className="form-group">
        <input
          type="text"
          placeholder="ФИО"
          value={formData.fio}
          onChange={(e) => setFormData({...formData, fio: e.target.value})}
        />
        <input
          type="text"
          placeholder="Паспортные данные"
          value={formData.passport}
          onChange={(e) => setFormData({...formData, passport: e.target.value})}
        />
        <input
          type="tel"
          placeholder="Телефон (10 цифр, например: 8912345789)"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <button onClick={handleSubmit}>Отправить анкету</button>
        {message && <div className={`message ${message.includes('ошибка') ? 'error' : 'success'}`}>{message}</div>}
      </div>
    </div>
  );
}

export default DogwalkerForm;