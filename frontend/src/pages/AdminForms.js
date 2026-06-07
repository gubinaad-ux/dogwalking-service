import React, { useState, useEffect } from 'react';
import './AdminForms.css';

function AdminForms() {
  const [forms, setForms] = useState([]);

  const fetchForms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/auth/admin/forms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setForms(data);
    } catch (error) {
      console.error('Ошибка загрузки анкет:', error);
    }
  };

  const handleApprove = async (formId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/auth/admin/forms/${formId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchForms();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const handleReject = async (formId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/auth/admin/forms/${formId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchForms();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  useEffect(() => {
    fetchForms();
    const interval = setInterval(fetchForms, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="forms-container">
      <h2>Непроверенные анкеты</h2>
      {forms.length === 0 ? (
        <div className="empty-message">Нет новых анкет</div>
      ) : (
        <table className="forms-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ФИО</th>
              <th>Паспорт</th>
              <th>Телефон</th>
              <th>Email</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form.form_id}>
                <td>{form.form_id}</td>
                <td>{form.fio}</td>
                <td>{form.passport}</td>
                <td>{form.phone}</td>
                <td>{form.email}</td>
                <td>
                    <div className="action-buttons">
                        <button 
                        className="approve-btn"
                        onClick={() => handleApprove(form.form_id)}
                        >
                        Одобрить
                        </button>
                        <button 
                        className="reject-btn"
                        onClick={() => handleReject(form.form_id)}
                        >
                        Отказать
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminForms;