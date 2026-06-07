import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Paper, Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, TablePagination } from '@mui/material';

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const res = await fetch('http://localhost:8000/api/clients/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setClients(Array.isArray(data) ? data : []);
  };

  const handleEdit = (client) => {
    setEditingId(client.client_id);
    setEditData(client);
  };

  const handleSave = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/clients/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      setEditingId(null);
      loadClients();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить клиента?')) {
      await fetch(`http://localhost:8000/api/clients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadClients();
    }
  };

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <h2>Клиенты</h2>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ФИО</TableCell>
            <TableCell>Телефон</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Рейтинг</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">Нет данных</TableCell>
            </TableRow>
          ) : (
            clients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((client) => (
              <TableRow key={client.client_id}>
                <TableCell>
                  {editingId === client.client_id ? (
                    <TextField size="small" value={editData.client_fio || ''} onChange={(e) => handleChange('client_fio', e.target.value)} />
                  ) : (
                    client.client_fio
                  )}
                </TableCell>
                <TableCell>
                  {editingId === client.client_id ? (
                    <TextField size="small" value={editData.client_phone || ''} onChange={(e) => handleChange('client_phone', e.target.value)} />
                  ) : (
                    client.client_phone
                  )}
                </TableCell>
                <TableCell>
                  {editingId === client.client_id ? (
                    <TextField size="small" value={editData.client_email || ''} onChange={(e) => handleChange('client_email', e.target.value)} />
                  ) : (
                    client.client_email
                  )}
                </TableCell>
                <TableCell>
                  {editingId === client.client_id ? (
                    <TextField size="small" type="number" step="0.1" value={editData.client_rating || 0} onChange={(e) => handleChange('client_rating', e.target.value)} />
                  ) : (
                    client.client_rating
                  )}
                </TableCell>
                <TableCell>
                  {editingId === client.client_id ? (
                    <>
                      <Button size="small" onClick={() => handleSave(client.client_id)}>Save</Button>
                      <Button size="small" onClick={() => setEditingId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button size="small" onClick={() => handleEdit(client)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleDelete(client.client_id)}>Delete</Button>
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
        count={clients.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />
    </Paper>
  );
}

export default ClientsPage;