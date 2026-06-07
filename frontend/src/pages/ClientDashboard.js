import React, { useState, useEffect } from 'react';
import './ClientDashboard.css';

function ClientDashboard() {
  const [client, setClient] = useState(null);
  const [services, setServices] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDog, setSelectedDog] = useState(null);
  const [orderData, setOrderData] = useState({
    address: '',
    datetime: '',
    book_lasting: '01:00:00'
  });
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDogModal, setShowDogModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    score: 5,
    text: ''
  });
  const [newDog, setNewDog] = useState({
    dog_name: '',
    dog_breed: '',
    age: '',
    weight: '',
    features: ''
  });
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const resClient = await fetch('http://localhost:8000/api/clients/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const clientsData = await resClient.json();
      const foundClient = clientsData.find(c => c.client_id == userId);
      setClient(foundClient);
      setEditForm(foundClient || {});

      const resServices = await fetch('http://localhost:8000/api/services/with-walkers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const servicesData = await resServices.json();
      setServices(Array.isArray(servicesData) ? servicesData : []);

      const resDogs = await fetch(`http://localhost:8000/api/clients/${userId}/dogs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dogsData = await resDogs.json();
      setDogs(Array.isArray(dogsData) ? dogsData : []);

      const resBookings = await fetch(`http://localhost:8000/api/bookings/client/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookingsData = await resBookings.json();
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);

      const resFeedbacks = await fetch(`http://localhost:8000/api/feedback/client/${userId}`, {
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

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/clients/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      const result = await response.json();
      if (response.ok) {
        setClient(editForm);
        setEditing(false);
        alert('Данные сохранены');
      } else {
        alert(result.detail || 'Ошибка сохранения');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка сохранения');
    }
  };

  const handleAddDog = async () => {
    if (!newDog.dog_name || !newDog.dog_breed || !newDog.age || !newDog.weight) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/clients/${userId}/dogs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDog)
      });
      if (response.ok) {
        setShowDogModal(false);
        setNewDog({ dog_name: '', dog_breed: '', age: '', weight: '', features: '' });
        loadData();
        alert('Собака добавлена');
      } else {
        alert('Ошибка при добавлении собаки');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при добавлении собаки');
    }
  };

  const handleDeleteDog = async (dogId) => {
    if (!window.confirm('Удалить собаку?')) return;
    try {
      const response = await fetch(`http://localhost:8000/api/clients/${userId}/dogs/${dogId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        loadData();
      } else {
        alert('Ошибка при удалении');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при удалении');
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
        booking_id: selectedBooking.booking_id,
        client_id: userId,
        d_walker_id: selectedBooking.d_walker_id,
        score: feedbackData.score,
        text: feedbackData.text,
        author_role: 'client'
      })
    });
    if (response.ok) {
      setShowFeedbackModal(false);
      setFeedbackData({ score: 5, text: '' });
      loadData();
      alert('Отзыв оставлен');
    } else {
      alert('Ошибка при отправке отзыва');
    }
  } catch (error) {
    console.error('Ошибка:', error);
  }
};

  const handleCreateOrder = async () => {
    if (!selectedDog) {
      alert('Выберите собаку');
      return;
    }
    if (!orderData.address || !orderData.datetime) {
      alert('Заполните все поля');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/bookings/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          client_id: userId,
          dog_id: selectedDog,
          service_id: selectedService.service_id,
          d_walker_id: selectedService.d_walker_id,
          address: orderData.address,
          datetime: orderData.datetime,
          book_lasting: orderData.book_lasting,
          full_cost: selectedService.serv_base_cost
        })
      });
      if (response.ok) {
        setShowOrderModal(false);
        setSelectedDog(null);
        setOrderData({ address: '', datetime: '', book_lasting: '01:00:00' });
        loadData();
        alert('Заказ создан');
      } else {
        const error = await response.json();
        alert(error.detail || 'Ошибка при создании заказа');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при создании заказа');
    }
  };

  const getSortedServices = () => {
    let sorted = [...services];
    if (sortBy === 'rating') {
      sorted.sort((a, b) => (b.walker_rating || 0) - (a.walker_rating || 0));
    } else if (sortBy === 'price_asc') {
      sorted.sort((a, b) => (a.serv_base_cost || 0) - (b.serv_base_cost || 0));
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => (b.serv_base_cost || 0) - (a.serv_base_cost || 0));
    }
    return sorted;
  };

  const paginatedServices = getSortedServices().slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return <div className="dashboard-container">Загрузка...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Личный кабинет клиента</h2>
        <div className="dashboard-tabs">
          <button className={activeTab === 'profile' ? 'tab active' : 'tab'} onClick={() => setActiveTab('profile')}>Профиль</button>
          <button className={activeTab === 'dogs' ? 'tab active' : 'tab'} onClick={() => setActiveTab('dogs')}>Мои собаки</button>
          <button className={activeTab === 'services' ? 'tab active' : 'tab'} onClick={() => setActiveTab('services')}>Услуги</button>
          <button className={activeTab === 'orders' ? 'tab active' : 'tab'} onClick={() => setActiveTab('orders')}>Мои заказы</button>
          <button className={activeTab === 'feedbacks' ? 'tab active' : 'tab'} onClick={() => setActiveTab('feedbacks')}>Мои отзывы</button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Профиль */}
        {activeTab === 'profile' && (
          <div className="info-card">
            <h3>Мои данные</h3>
            {editing ? (
              <div>
                <label>ФИО:</label>
                <input 
                  type="text" 
                  value={editForm.client_fio || ''} 
                  onChange={(e) => setEditForm({...editForm, client_fio: e.target.value})}
                  placeholder="Введите ФИО"
                />
                <label>Телефон:</label>
                <input 
                  type="text" 
                  value={editForm.client_phone || ''} 
                  onChange={(e) => setEditForm({...editForm, client_phone: e.target.value})}
                  placeholder="Введите телефон"
                />
                <label>Email:</label>
                <input 
                  type="email" 
                  value={editForm.client_email || ''} 
                  onChange={(e) => setEditForm({...editForm, client_email: e.target.value})}
                  placeholder="Введите email"
                />
                <button onClick={handleSaveProfile}>Сохранить</button>
                <button onClick={() => setEditing(false)}>Отмена</button>
              </div>
            ) : (
              <div>
                <p><strong>ФИО:</strong> {client?.client_fio}</p>
                <p><strong>Телефон:</strong> {client?.client_phone}</p>
                <p><strong>Email:</strong> {client?.client_email}</p>
                <p><strong>Рейтинг:</strong> {client?.client_rating}</p>
                <button onClick={handleEditProfile}>Редактировать</button>
              </div>
            )}
          </div>
        )}

        {/* Мои собаки */}
        {activeTab === 'dogs' && (
          <div className="info-card">
            <div className="dogs-header">
              <h3>Мои собаки</h3>
              <button onClick={() => setShowDogModal(true)}>+ Добавить собаку</button>
            </div>
            {dogs.length === 0 ? (
              <p>У вас пока нет собак</p>
            ) : (
              <table className="dogs-table">
                <thead>
                  <tr>
                    <th>Кличка</th>
                    <th>Порода</th>
                    <th>Возраст (лет)</th>
                    <th>Вес (кг)</th>
                    <th>Особенности</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {dogs.map((dog) => (
                    <tr key={dog.dog_id}>
                      <td>{dog.dog_name}</td>
                      <td>{dog.dog_breed}</td>
                      <td>{dog.age}</td>
                      <td>{dog.weight}</td>
                      <td>{dog.features || '-'}</td>
                      <td>
                        <button className="delete-btn" onClick={() => handleDeleteDog(dog.dog_id)}>Удалить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Услуги */}
        {activeTab === 'services' && (
          <div className="services-section">
            <div className="services-header">
              <h3>Услуги выгульщиков</h3>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="rating">По рейтингу выгульщика</option>
                <option value="price_asc">По цене (сначала дешевые)</option>
                <option value="price_desc">По цене (сначала дорогие)</option>
              </select>
            </div>

            {paginatedServices.length === 0 ? (
              <p>Нет доступных услуг</p>
            ) : (
              <>
                <table className="services-table">
                  <thead>
                    <tr>
                      <th>Услуга</th>
                      <th>Описание</th>
                      <th>Цена</th>
                      <th>Выгульщик</th>
                      <th>Рейтинг выгульщика</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedServices.map((service) => (
                      <tr key={service.service_id}>
                        <td>{service.serv_name}</td>
                        <td>{service.serv_discrib || '-'}</td>
                        <td>{service.serv_base_cost} руб.</td>
                        <td>{service.walker_login}</td>
                        <td>{service.walker_rating || 0}</td>
                        <td>
                          <button onClick={() => {
                            setSelectedService(service);
                            setShowOrderModal(true);
                          }}>
                            Создать заказ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {Math.ceil(getSortedServices().length / rowsPerPage) > 1 && (
                  <div className="pagination">
                    <button disabled={page === 0} onClick={() => setPage(page - 1)}>Назад</button>
                    <span>Страница {page + 1} из {Math.ceil(getSortedServices().length / rowsPerPage)}</span>
                    <button disabled={page >= Math.ceil(getSortedServices().length / rowsPerPage) - 1} onClick={() => setPage(page + 1)}>Вперед</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Мои заказы */}
        {activeTab === 'orders' && (
          <div className="info-card">
            <h3>Мои заказы</h3>
            {bookings.length === 0 ? (
              <p>У вас пока нет заказов</p>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Услуга</th>
                    <th>Выгульщик</th>
                    <th>Адрес</th>
                    <th>Дата</th>
                    <th>Статус</th>
                    <th>Стоимость</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.booking_id}>
                      <td>{booking.service_name}</td>
                      <td>{booking.walker_login}</td>
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
                        {booking.book_status === 'completed' && !booking.has_feedback && (
                          <button onClick={() => {
                            setSelectedBooking(booking);
                            setShowFeedbackModal(true);
                          }}>
                            Оставить отзыв
                          </button>
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

      {/* Модальное окно создания заказа */}
      {showOrderModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Создание заказа</h3>
            <p><strong>Услуга:</strong> {selectedService?.serv_name}</p>
            <p><strong>Выгульщик:</strong> {selectedService?.walker_login}</p>
            
            <label>Выберите собаку:*</label>
            <select value={selectedDog || ''} onChange={(e) => setSelectedDog(e.target.value)}>
              <option value="">Выберите собаку</option>
              {dogs.map((dog) => (
                <option key={dog.dog_id} value={dog.dog_id}>
                  {dog.dog_name} ({dog.dog_breed}, {dog.age} лет)
                </option>
              ))}
            </select>
            
            <label>Адрес:</label>
            <input 
              type="text" 
              placeholder="Введите адрес" 
              value={orderData.address}
              onChange={(e) => setOrderData({...orderData, address: e.target.value})}
            />
            <label>Дата и время:</label>
            <input 
              type="datetime-local" 
              value={orderData.datetime}
              onChange={(e) => setOrderData({...orderData, datetime: e.target.value})}
            />
            <div className="modal-buttons">
              <button onClick={handleCreateOrder}>Создать</button>
              <button onClick={() => setShowOrderModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления собаки */}
      {showDogModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Добавить собаку</h3>
            <label>Кличка:*</label>
            <input 
              type="text" 
              value={newDog.dog_name}
              onChange={(e) => setNewDog({...newDog, dog_name: e.target.value})}
            />
            <label>Порода:*</label>
            <input 
              type="text" 
              value={newDog.dog_breed}
              onChange={(e) => setNewDog({...newDog, dog_breed: e.target.value})}
            />
            <label>Возраст (лет):*</label>
            <input 
              type="number" 
              value={newDog.age}
              onChange={(e) => setNewDog({...newDog, age: e.target.value})}
            />
            <label>Вес (кг):*</label>
            <input 
              type="number" 
              step="0.1"
              value={newDog.weight}
              onChange={(e) => setNewDog({...newDog, weight: e.target.value})}
            />
            <label>Особенности:</label>
            <textarea 
              value={newDog.features}
              onChange={(e) => setNewDog({...newDog, features: e.target.value})}
              placeholder="Агрессивный, боится громких звуков и т.д."
            />
            <div className="modal-buttons">
              <button onClick={handleAddDog}>Добавить</button>
              <button onClick={() => setShowDogModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно отзыва */}
      {showFeedbackModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Оставить отзыв</h3>
            <p><strong>Выгульщик:</strong> {selectedBooking?.walker_login}</p>
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

export default ClientDashboard;