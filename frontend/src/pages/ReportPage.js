import React, { useState, useEffect } from 'react';
import './ReportPage.css';

function ReportPage() {
  const [activeReport, setActiveReport] = useState('activity');
  const [activityData, setActivityData] = useState([]);
  const [dogwalkerData, setDogwalkerData] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const loadActivityReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/reports/activity?year=${year}${month ? `&month=${month}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setActivityData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка:', error);
    }
    setLoading(false);
  };

  const loadDogwalkerReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/reports/dogwalker-rating', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDogwalkerData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка:', error);
    }
    setLoading(false);
  };

  const loadClientReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/reports/client-rating', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setClientData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeReport === 'activity') {
      loadActivityReport();
    } else if (activeReport === 'dogwalker') {
      loadDogwalkerReport();
    } else if (activeReport === 'client') {
      loadClientReport();
    }
  }, [activeReport]);

  const handleRefreshActivity = () => {
    loadActivityReport();
  };

  const exportPDF = async (type) => {
    try {
      const res = await fetch(`http://localhost:8000/api/reports/${type}-rating/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_rating_report.pdf`;
      a.click();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  return (
    <div className="reports-container">
      <h2>Отчёты</h2>
      
      <div className="report-tabs">
        <button className={activeReport === 'activity' ? 'active' : ''} onClick={() => setActiveReport('activity')}>
          По бронированиям
        </button>
        <button className={activeReport === 'dogwalker' ? 'active' : ''} onClick={() => setActiveReport('dogwalker')}>
          По рейтингу выгульщиков
        </button>
        <button className={activeReport === 'client' ? 'active' : ''} onClick={() => setActiveReport('client')}>
          По рейтингу клиентов
        </button>
      </div>

      <div className="report-content">
        {activeReport === 'activity' && (
          <div>
            <div className="filters">
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              <select value={month} onChange={(e) => setMonth(e.target.value)}>
                <option value="">Все месяцы</option>
                <option value="1">Январь</option>
                <option value="2">Февраль</option>
                <option value="3">Март</option>
                <option value="4">Апрель</option>
                <option value="5">Май</option>
                <option value="6">Июнь</option>
                <option value="7">Июль</option>
                <option value="8">Август</option>
                <option value="9">Сентябрь</option>
                <option value="10">Октябрь</option>
                <option value="11">Ноябрь</option>
                <option value="12">Декабрь</option>
              </select>
              <button onClick={handleRefreshActivity}>Обновить</button>
            </div>
            
            {loading && activeReport === 'activity' ? <p>Загрузка...</p> : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Месяц</th>
                    <th>Количество заказов</th>
                    <th>Выручка</th>
                  </tr>
                </thead>
                <tbody>
                  {activityData.length === 0 ? (
                    <tr><td colSpan="3">Нет данных</td></tr>
                  ) : (
                    activityData.map((row) => (
                      <tr key={row.month}>
                        <td>Месяц {row.month}</td>
                        <td>{row.count}</td>
                        <td>{row.income} руб.</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeReport === 'dogwalker' && (
          <div>
            <button className="export-btn" onClick={() => exportPDF('dogwalker')}>Экспорт в PDF</button>
            {loading && activeReport === 'dogwalker' ? <p>Загрузка...</p> : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Выгульщик</th>
                    <th>Средний рейтинг</th>
                    <th>Количество отзывов</th>
                  </tr>
                </thead>
                <tbody>
                  {dogwalkerData.length === 0 ? (
                    <tr><td colSpan="3">Нет данных</td></tr>
                  ) : (
                    dogwalkerData.map((row) => (
                      <tr key={row.walker_id}>
                        <td>{row.walker_login}</td>
                        <td>{row.avg_rating} ★</td>
                        <td>{row.feedback_count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeReport === 'client' && (
          <div>
            <button className="export-btn" onClick={() => exportPDF('client')}>Экспорт в PDF</button>
            {loading && activeReport === 'client' ? <p>Загрузка...</p> : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Клиент</th>
                    <th>Средний рейтинг</th>
                    <th>Количество отзывов</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.length === 0 ? (
                    <tr><td colSpan="3">Нет данных</td></tr>
                  ) : (
                    clientData.map((row) => (
                      <tr key={row.client_id}>
                        <td>{row.client_fio}</td>
                        <td>{row.avg_rating} ★</td>
                        <td>{row.feedback_count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportPage;