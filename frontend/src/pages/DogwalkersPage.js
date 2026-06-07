import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Paper, Button, TextField, Select, MenuItem, FormControl, TablePagination } from '@mui/material';

function DogwalkersPage() {
  const [walkers, setWalkers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadWalkers();
  }, []);

  const loadWalkers = async () => {
    const res = await fetch('http://localhost:8000/api/dogwalkers/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setWalkers(Array.isArray(data) ? data : []);
  };

  const handleEdit = (walker) => {
    setEditingId(walker.d_walker_id);
    setEditData(walker);
  };

  const handleSave = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/dogwalkers/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      setEditingId(null);
      loadWalkers();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить выгульщика?')) {
      await fetch(`http://localhost:8000/api/dogwalkers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadWalkers();
    }
  };

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <h2>Выгульщики</h2>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Логин</TableCell>
            <TableCell>Рейтинг</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {walkers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">Нет данных</TableCell>
            </TableRow>
          ) : (
            walkers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((walker) => (
              <TableRow key={walker.d_walker_id}>
                <TableCell>
                  {editingId === walker.d_walker_id ? (
                    <TextField size="small" value={editData.d_walker_login || ''} onChange={(e) => handleChange('d_walker_login', e.target.value)} />
                  ) : (
                    walker.d_walker_login
                  )}
                </TableCell>
                <TableCell>
                  {editingId === walker.d_walker_id ? (
                    <TextField size="small" type="number" step="0.1" value={editData.d_walker_rating || 0} onChange={(e) => handleChange('d_walker_rating', e.target.value)} />
                  ) : (
                    walker.d_walker_rating
                  )}
                </TableCell>
                <TableCell>
                  {editingId === walker.d_walker_id ? (
                    <FormControl size="small" fullWidth>
                      <Select value={editData.d_walker_status || ''} onChange={(e) => handleChange('d_walker_status', e.target.value)}>
                        <MenuItem value="P">Не заполнена</MenuItem>
                        <MenuItem value="W">На проверке</MenuItem>
                        <MenuItem value="A">Активен</MenuItem>
                        <MenuItem value="R">Отказано</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    walker.d_walker_status === 'P' ? 'Не заполнена' :
                    walker.d_walker_status === 'W' ? 'На проверке' :
                    walker.d_walker_status === 'A' ? 'Активен' :
                    walker.d_walker_status === 'R' ? 'Отказано' : walker.d_walker_status
                  )}
                </TableCell>
                <TableCell>
                  {editingId === walker.d_walker_id ? (
                    <>
                      <Button size="small" onClick={() => handleSave(walker.d_walker_id)}>Save</Button>
                      <Button size="small" onClick={() => setEditingId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button size="small" onClick={() => handleEdit(walker)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleDelete(walker.d_walker_id)}>Delete</Button>
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
        count={walkers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />
    </Paper>
  );
}

export default DogwalkersPage;