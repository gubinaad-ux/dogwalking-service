import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Paper, Button, TextField, Select, MenuItem, FormControl, TablePagination } from '@mui/material';

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const res = await fetch('http://localhost:8000/api/bookings/admin/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
  };

  const handleEdit = (booking) => {
    setEditingId(booking.booking_id);
    setEditData(booking);
  };

  const handleSave = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      setEditingId(null);
      loadBookings();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить бронирование?')) {
      await fetch(`http://localhost:8000/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadBookings();
    }
  };

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <h2>Бронирования выгула собак</h2>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Клиент</TableCell>
            <TableCell>Собака</TableCell>
            <TableCell>Услуга</TableCell>
            <TableCell>Дата</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">Нет данных</TableCell>
            </TableRow>
          ) : (
            bookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((booking) => (
              <TableRow key={booking.booking_id}>
                <TableCell>
                  {editingId === booking.booking_id ? (
                    <TextField size="small" value={editData.client_fio || ''} onChange={(e) => handleChange('client_fio', e.target.value)} />
                  ) : (
                    booking.client_fio
                  )}
                </TableCell>
                <TableCell>
                  {editingId === booking.booking_id ? (
                    <TextField size="small" value={editData.dog_name || ''} onChange={(e) => handleChange('dog_name', e.target.value)} />
                  ) : (
                    booking.dog_name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === booking.booking_id ? (
                    <FormControl size="small" fullWidth>
                      <Select value={editData.service_name || ''} onChange={(e) => handleChange('service_name', e.target.value)}>
                        <MenuItem value="Прогулка">Прогулка</MenuItem>
                        <MenuItem value="Дрессировка">Дрессировка</MenuItem>
                        <MenuItem value="Уход">Уход</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    booking.service_name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === booking.booking_id ? (
                    <TextField size="small" type="datetime-local" value={editData.datetime || ''} onChange={(e) => handleChange('datetime', e.target.value)} />
                  ) : (
                    booking.datetime?.replace('T', ' ').slice(0, 16)
                  )}
                </TableCell>
                <TableCell>
                  {editingId === booking.booking_id ? (
                    <FormControl size="small" fullWidth>
                      <Select value={editData.book_status || ''} onChange={(e) => handleChange('book_status', e.target.value)}>
                        <MenuItem value="В ожидании">В ожидании</MenuItem>
                        <MenuItem value="Подтверждено">Подтверждено</MenuItem>
                        <MenuItem value="Выполнено">Выполнено</MenuItem>
                        <MenuItem value="Отменено">Отменено</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    booking.book_status
                  )}
                </TableCell>
                <TableCell>
                  {editingId === booking.booking_id ? (
                    <>
                      <Button size="small" onClick={() => handleSave(booking.booking_id)}>Save</Button>
                      <Button size="small" onClick={() => setEditingId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button size="small" onClick={() => handleEdit(booking)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleDelete(booking.booking_id)}>Delete</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={bookings.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />
    </Paper>
  );
}

export default BookingsPage;