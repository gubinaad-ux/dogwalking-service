import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DogwalkerForm from './DogwalkerForm';
import './DogwalkerDashboard.css';

function DogwalkerDashboard() {
  const [walker, setWalker] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [extraCost, setExtraCost] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedBookingForFeedback, setSelectedBookingForFeedback] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ score: 5, text: '' });
  const [activeTab, setActiveTab] = useState('profile');
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const resWalker = await fetch('http://localhost:8000/api/dogwalkers/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const walkersData = await resWalker.json();
      const foundWalker = walkersData.find(w => w.d_walker_id == userId);
      setWalker(foundWalker);

      const resForm = await fetch(`http://localhost:8000/api/auth/form/info/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const formData = await resForm.json();
      setForm(formData);

      const resBookings = await fetch(`http://localhost:8000/api/bookings/walker/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookingsData = await resBookings.json();
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);

      const resFeedbacks = await fetch(`http://localhost:8000/api/feedback/walker/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const feedbacksData = await resFeedbacks.json();
      setFeedbacks(Array.isArray(feedbacksData) ? feedbacksData : []);
      
      setLoading(false);
    } catch (error) {
      console.error('Ошибка:', error);
      setLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${selectedBooking.booking_id}/accept?extra_cost=${extraCost}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setShowAcceptModal(false);
        setExtraCost(0);
        loadData();
        alert('Заказ принят');
      } else {
        alert('Ошибка');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const handleCompleteOrder = async (bookingId) => {
    if (!window.confirm('Отметить заказ как выполненный?')) return;
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        loadData();
        alert('Заказ выполнен');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const handleCancelOrder = async (bookingId) => {
    if (!window.confirm('Отменить заказ?')) return;
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        loadData();
        alert('Заказ отменён');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

 const handleSubmitFeedback = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/feedback/create', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        booking_id: selectedBookingForFeedback.booking_id,
        client_id: selectedBookingForFeedback.client_id,
        d_walker_id: userId,
        score: feedbackData.score,
        text: feedbackData.text,
        author_role: 'dogwalker'
      })
    });
    if (response.ok) {
      setShowFeedbackModal(false);
      setFeedbackData({ score: 5, text: '' });
      loadData();
      alert('Отзыв оставлен');
    } else {
      const error = await response.json();
      alert(error.detail || 'Ошибка при отправке отзыва');
    }
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Ошибка при отправке отзыва');
  }
};

  if (loading) {
    return <div className="dashboard-container">Загрузка...</div>;
  }

  if (!walker) {
    return <div className="dashboard-container">Данные не найдены</div>;
  }

  if (walker.d_walker_status === 'P' || !form || Object.keys(form).length === 0) {
    return <DogwalkerForm userId={userId} />;
  }

  if (walker.d_walker_status === 'W') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Панель выгульщика</h2>
        </div>
        <div className="dashboard-content">
          <div className="info-card">
            <h3>Анкета на проверке</h3>
            <p>Ваша анкета отправлена администратору. Ожидайте решения.</p>
          </div>
        </div>
      </div>
    );
  }

  if (walker.d_walker_status === 'A') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Панель выгульщика</h2>
          <div className="dashboard-tabs">
            <button className={activeTab === 'profile' ? 'tab active' : 'tab'} onClick={() => setActiveTab('profile')}>Профиль</button>
            <button className={activeTab === 'orders' ? 'tab active' : 'tab'} onClick={() => setActiveTab('orders')}>Заказы</button>
            <button className={activeTab === 'feedbacks' ? 'tab active' : 'tab'} onClick={() => setActiveTab('feedbacks')}>Отзывы</button>
            <Link to="/dashboard/services" className="tab">Услуги</Link>
          </div>
        </div>

        <div className="dashboard-content">
          {activeTab === 'profile' && (
            <div className="info-card">
              <h3>Информация из анкеты</h3>
              <p><strong>ФИО:</strong> {form?.fio || '-'}</p>
              <p><strong>Паспортные данные:</strong> {form?.passport || '-'}</p>
              <p><strong>Телефон:</strong> {form?.phone || '-'}</p>
              <p><strong>Email:</strong> {form?.email || '-'}</p>
              <p><strong>Статус:</strong> <span className="status-active">Активен</span></p>
              <p><strong>Рейтинг:</strong> {walker?.d_walker_rating}</p>
              <p><strong>Логин:</strong> {walker?.d_walker_login}</p>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="info-card">
              <h3>Мои заказы</h3>
              {bookings.length === 0 ? (
                <p>Нет заказов</p>
              ) : (
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Услуга</th>
                      <th>Клиент</th>
                      <th>Рейтинг клиента</th>
                      <th>Телефон</th>
                      <th>Адрес</th>
                      <th>Дата</th>
                      <th>Статус</th>
                      <th>Стоимость</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.booking_id}>
                        <td>{booking.service_name}</td>
                        <td>{booking.client_fio}</td>
                        <td>{booking.client_rating || 0} ★</td>
                        <td>{booking.client_phone}</td>
                        <td>{booking.address}</td>
                        <td>{new Date(booking.datetime).toLocaleString()}</td>
                        <td>
                          <span className={`status ${booking.book_status}`}>
                            {booking.book_status === 'pending' ? 'Ожидает' :
                            booking.book_status === 'accepted' ? 'Принят' :
                            booking.book_status === 'completed' ? 'Выполнен' :
                            booking.book_status === 'cancelled' ? 'Отменён' : booking.book_status}
                          </span>
                        </td>
                        <td>{booking.full_cost} руб.</td>
                        <td>
                          {booking.book_status === 'pending' && (
                            <>
                              <button onClick={() => {
                                setSelectedBooking(booking);
                                setShowAcceptModal(true);
                              }}>Принять</button>
                              <button className="cancel-btn" onClick={() => handleCancelOrder(booking.booking_id)}>Отклонить</button>
                            </>
                          )}
                          {booking.book_status === 'accepted' && (
                            <button onClick={() => handleCompleteOrder(booking.booking_id)}>Выполнен</button>
                          )}
                          {booking.book_status === 'completed' && !booking.has_feedback_from_walker && (
                            <button onClick={() => {
                              setSelectedBookingForFeedback(booking);
                              setShowFeedbackModal(true);
                            }}>Оставить отзыв</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'feedbacks' && (
          <div className="info-card">
            <h3>Мои отзывы</h3>
            {feedbacks.length === 0 ? (
              <p>У вас пока нет отзывов</p>
            ) : (
              <table className="feedbacks-table">
                <thead>
                  <tr>
                    <th>От кого</th>
                    <th>Кому</th>
                    <th>Услуга</th>
                    <th>Дата прогулки</th>
                    <th>Оценка</th>
                    <th>Комментарий</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((fb) => (
                    <tr key={fb.feedback_id}>
                      <td>{fb.from}</td>
                      <td>{fb.to}</td>
                      <td>{fb.service_name}</td>
                      <td>{fb.booking_date}</td>
                      <td><span className="rating">{fb.feedback_score} ★</span></td>
                      <td>{fb.text || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        </div>

        {showAcceptModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Принять заказ</h3>
              <p><strong>Услуга:</strong> {selectedBooking?.service_name}</p>
              <p><strong>Клиент:</strong> {selectedBooking?.client_fio}</p>
              <p><strong>Телефон:</strong> {selectedBooking?.client_phone}</p>
              <p><strong>Адрес:</strong> {selectedBooking?.address}</p>
              <p><strong>Дата:</strong> {new Date(selectedBooking?.datetime).toLocaleString()}</p>
              <label>Дополнительная стоимость за выезд (руб):</label>
              <input 
                type="number" 
                value={extraCost}
                onChange={(e) => setExtraCost(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
              <div className="modal-buttons">
                <button onClick={handleAcceptOrder}>Подтвердить</button>
                <button onClick={() => setShowAcceptModal(false)}>Отмена</button>
              </div>
            </div>
          </div>
        )}

        {showFeedbackModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Оставить отзыв</h3>
              <p><strong>Клиент:</strong> {selectedBookingForFeedback?.client_fio}</p>
              <label>Оценка:</label>
              <select value={feedbackData.score} onChange={(e) => setFeedbackData({...feedbackData, score: parseInt(e.target.value)})}>
                <option value="5">5 - Отлично</option>
                <option value="4">4 - Хорошо</option>
                <option value="3">3 - Нормально</option>
                <option value="2">2 - Плохо</option>
                <option value="1">1 - Ужасно</option>
              </select>
              <label>Комментарий:</label>
              <textarea 
                value={feedbackData.text}
                onChange={(e) => setFeedbackData({...feedbackData, text: e.target.value})}
                placeholder="Напишите ваш отзыв..."
                rows="4"
              />
              <div className="modal-buttons">
                <button onClick={handleSubmitFeedback}>Отправить</button>
                <button onClick={() => setShowFeedbackModal(false)}>Отмена</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (walker.d_walker_status === 'R') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Панель выгульщика</h2>
        </div>
        <div className="dashboard-content">
          <div className="info-card">
            <h3>Анкета отклонена</h3>
            <p>Свяжитесь с администратором: dogwalking.help@gmail.com</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default DogwalkerDashboard;