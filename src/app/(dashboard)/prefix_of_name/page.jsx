'use client'

import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

export default function PrefixTable() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  // States สำหรับ Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success') // 'success', 'error', 'warning', 'info'

  // States สำหรับ Dialog แก้ไข
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentPrefix, setCurrentPrefix] = useState(null)
  const [newPrefixName, setNewPrefixName] = useState('')

  // States สำหรับ Dialog ยืนยันการลบ
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [prefixToDelete, setPrefixToDelete] = useState(null)

  // States สำหรับ Dialog เพิ่มคำนำหน้า
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newAddPrefixName, setNewAddPrefixName] = useState('')

  // ดึงข้อมูลจาก API เมื่อคอมโพเนนต์ถูก mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/prefix')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching prefix data:', error)
      showSnackbar('เกิดข้อผิดพลาดในการดึงข้อมูล', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ฟังก์ชันแสดง Snackbar
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setSnackbarOpen(true)
  }

  // ฟังก์ชันปิด Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  // ฟังก์ชันเปิด Dialog แก้ไข
  const handleEdit = prefix => {
    setCurrentPrefix(prefix)
    setNewPrefixName(prefix.title) // ใช้ 'title' แทน 'name'
    setEditDialogOpen(true)
  }

  // ฟังก์ชันปิด Dialog แก้ไข
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    setCurrentPrefix(null)
    setNewPrefixName('')
  }

  // ฟังก์ชันบันทึกการแก้ไข
  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/prefix`, {
        // ใช้ endpoint เดียวกันกับ POST
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: currentPrefix.id, title: newPrefixName }) // ส่งทั้ง 'id' และ 'title'
      })

      if (response.ok) {
        // อัปเดตข้อมูลใน frontend
        setData(data.map(item => (item.id === currentPrefix.id ? { ...item, title: newPrefixName } : item)))
        showSnackbar('แก้ไขคำนำหน้าชื่อสำเร็จ', 'success')
        handleCloseEditDialog()
      } else {
        const errorData = await response.json()
        showSnackbar(errorData.message || 'ไม่สามารถแก้ไขคำนำหน้าชื่อได้', 'error')
      }
    } catch (error) {
      console.error('Error updating prefix:', error)
      showSnackbar('เกิดข้อผิดพลาดในการแก้ไขคำนำหน้าชื่อ', 'error')
    }
  }

  // ฟังก์ชันลบ (เปิด Dialog ยืนยันการลบ)
  const handleDelete = prefix => {
    setPrefixToDelete(prefix)
    setDeleteDialogOpen(true)
  }

  // ฟังก์ชันยืนยันการลบ
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/prefix`, {
        // ใช้ endpoint เดียวกันกับ POST และ PUT
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: prefixToDelete.id }) // ส่งเฉพาะ 'id'
      })
      if (response.ok) {
        setData(data.filter(item => item.id !== prefixToDelete.id))
        showSnackbar('ลบคำนำหน้าชื่อสำเร็จ', 'success')
      } else {
        const errorData = await response.json()
        showSnackbar(errorData.message || 'ไม่สามารถลบคำนำหน้าชื่อได้', 'error')
      }
    } catch (error) {
      console.error('Error deleting prefix:', error)
      showSnackbar('เกิดข้อผิดพลาดในการลบคำนำหน้าชื่อ', 'error')
    } finally {
      setDeleteDialogOpen(false)
      setPrefixToDelete(null)
    }
  }

  // ฟังก์ชันเปิด Dialog เพิ่มคำนำหน้า
  const handleOpenAddDialog = () => {
    setAddDialogOpen(true)
  }

  // ฟังก์ชันปิด Dialog เพิ่มคำนำหน้า
  const handleCloseAddDialog = () => {
    setAddDialogOpen(false)
    setNewAddPrefixName('')
  }

  // ฟังก์ชันบันทึกการเพิ่มคำนำหน้า
  const handleSaveAdd = async () => {
    if (!newAddPrefixName.trim()) {
      showSnackbar('กรุณาใส่คำนำหน้าชื่อ', 'warning')
      return
    }

    try {
      const response = await fetch('/api/prefix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newAddPrefixName }) // ใช้ 'title' แทน 'name'
      })

      if (response.ok) {
        const newPrefix = await response.json()
        setData([...data, newPrefix])
        showSnackbar('เพิ่มคำนำหน้าชื่อสำเร็จ', 'success')
        handleCloseAddDialog()
      } else {
        const errorData = await response.json()
        showSnackbar(errorData.message || 'ไม่สามารถเพิ่มคำนำหน้าชื่อได้', 'error')
      }
    } catch (error) {
      console.error('Error adding prefix:', error)
      showSnackbar('เกิดข้อผิดพลาดในการเพิ่มคำนำหน้าชื่อ', 'error')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <CircularProgress />
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* ปุ่มเพิ่มคำนำหน้า */}
      <Button variant='contained' color='primary' onClick={handleOpenAddDialog} style={{ marginBottom: '1rem' }}>
        เพิ่มคำนำหน้าชื่อ
      </Button>

      <TableContainer component={Paper} style={{ marginTop: '2rem' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ลำดับ</TableCell>
              <TableCell>คำนำหน้าชื่อ</TableCell>
              <TableCell>ตัวเลือก</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((prefix, index) => (
              <TableRow key={prefix.id}>
                {' '}
                {/* ใช้ 'id' แทน '_id' */}
                <TableCell>{index + 1}</TableCell>
                <TableCell>{prefix.title}</TableCell> {/* ใช้ 'title' แทน 'name' */}
                <TableCell>
                  <IconButton aria-label='edit' color='primary' onClick={() => handleEdit(prefix)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label='delete' color='error' onClick={() => handleDelete(prefix)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align='center'>
                  ไม่มีข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog แก้ไขคำนำหน้าชื่อ */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>แก้ไขคำนำหน้าชื่อ</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='คำนำหน้าชื่อ'
            type='text'
            fullWidth
            value={newPrefixName}
            onChange={e => setNewPrefixName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color='primary'>
            ยกเลิก
          </Button>
          <Button onClick={handleSaveEdit} color='primary'>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog ยืนยันการลบคำนำหน้าชื่อ */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          คุณแน่ใจหรือไม่ว่าต้องการลบคำนำหน้าชื่อนี้: <strong>{prefixToDelete?.title}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='primary'>
            ยกเลิก
          </Button>
          <Button onClick={handleConfirmDelete} color='error'>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog เพิ่มคำนำหน้าชื่อ */}
      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog}>
        <DialogTitle>เพิ่มคำนำหน้าชื่อ</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='คำนำหน้าชื่อ'
            type='text'
            fullWidth
            value={newAddPrefixName}
            onChange={e => setNewAddPrefixName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} color='primary'>
            ยกเลิก
          </Button>
          <Button onClick={handleSaveAdd} color='primary'>
            เพิ่ม
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar สำหรับแจ้งเตือน */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}
