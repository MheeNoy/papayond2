'use client'
import React, { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import axios from 'axios'
import { useSession } from 'next-auth/react'
import {
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SettingsIcon from '@mui/icons-material/Settings'
import { green } from '@mui/material/colors'
import { styled } from '@mui/material/styles'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '1.1rem',
  padding: '16px'
}))

const StyledTableHeadCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
  fontSize: '1.2rem'
}))

const StyledButton = styled(Button)(({ theme }) => ({
  fontSize: '1rem',
  padding: '8px 16px'
}))

export default function Page() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [universities, setUniversities] = useState([])

  const itemsPerPage = 8

  const [openModal, setOpenModal] = useState(false)
  const [newUniversity, setNewUniversity] = useState({
    unino: '',
    uniname: '',
    location: '',
    uni_year: ''
  })

  const [openUpdateModal, setOpenUpdateModal] = useState(false)
  const [currentUniversity, setCurrentUniversity] = useState(null)

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUniversities()
  }, [])

  useEffect(() => {
    console.log('Universities Updated:', universities)
  }, [universities])

  const fetchUniversities = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/university')
      setUniversities(Array.isArray(response.data.universities) ? response.data.universities : [])
    } catch (error) {
      console.error('Error fetching universities:', error)
      setUniversities([]) // ตั้งค่าเป็นอาร์เรย์ว่างในกรณีเกิดข้อผิดพลาด
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil((universities?.length ?? 0) / itemsPerPage)

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const paginatedUniversities = universities.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  // ฟังก์ชันสำหรับเปิด Add Modal
  const handleOpenModal = () => {
    setOpenModal(true)
  }

  // ฟังก์ชันสำหรับปิด Add Modal
  const handleCloseModal = () => {
    setOpenModal(false)
    setNewUniversity({
      unino: '',
      uniname: '',
      location: '',
      uni_year: ''
    })
  }

  // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงในฟอร์มเพิ่มมหาวิทยาลัย
  const handleInputChange = e => {
    const { name, value } = e.target
    setNewUniversity(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  // ฟังก์ชันสำหรับการส่งฟอร์มเพิ่มมหาวิทยาลัย
  const handleSubmit = async () => {
    const { unino, uniname, location, uni_year } = newUniversity

    // ตรวจสอบว่าข้อมูลจำเป็นครบถ้วน
    if (!unino || !uniname || !uni_year) {
      setSnackbar({
        open: true,
        message: 'กรุณากรอกข้อมูลที่จำเป็นทั้งหมด',
        severity: 'warning'
      })
      return
    }

    try {

      
      const response = await axios.post('/api/university', {
        unino:unino,
        uniname:uniname,
        location:location,
        uni_year:uni_year
      })

      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: 'เพิ่มมหาวิทยาลัยสำเร็จ',
          severity: 'success'
        })
        handleCloseModal()
        // รีเฟรชข้อมูลมหาวิทยาลัย
        await fetchUniversities()
      }
    } catch (error) {
      console.error('Error adding university:', error)
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'เกิดข้อผิดพลาดในการเพิ่มมหาวิทยาลัย',
        severity: 'error'
      })
    }
  }

  // ฟังก์ชันสำหรับเปิด Update Modal
  const handleOpenUpdateModal = university => {
    setCurrentUniversity(university)
    setOpenUpdateModal(true)
  }

  // ฟังก์ชันสำหรับปิด Update Modal
  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false)
    setCurrentUniversity(null)
  }

  // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงในฟอร์มอัปเดตมหาวิทยาลัย
  const handleUpdateInputChange = e => {
    const { name, value } = e.target
    setCurrentUniversity(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  // ฟังก์ชันสำหรับการส่งฟอร์มอัปเดตมหาวิทยาลัย
  const handleUpdateSubmit = async () => {
    const { id, unino, uniname, location, uni_year } = currentUniversity

    // ตรวจสอบว่าข้อมูลจำเป็นครบถ้วน
    if (!id || !unino || !uniname || !uni_year) {
      setSnackbar({
        open: true,
        message: 'กรุณาระบุ id และกรอกข้อมูลที่จำเป็นทั้งหมด',
        severity: 'warning'
      })
      return
    }

    try {
      const response = await axios.put('/api/university', {
        id,
        unino,
        uniname,
        location,
        uni_year
      })

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'อัปเดตมหาวิทยาลัยสำเร็จ',
          severity: 'success'
        })
        handleCloseUpdateModal()
        // รีเฟรชข้อมูลมหาวิทยาลัย
        await fetchUniversities()
      }
    } catch (error) {
      console.error('Error updating university:', error)
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'เกิดข้อผิดพลาดในการอัปเดตมหาวิทยาลัย',
        severity: 'error'
      })
    }
  }

  // ฟังก์ชันสำหรับการลบมหาวิทยาลัย
  const handleDelete = async id => {
    if (!confirm('คุณแน่ใจที่จะลบมหาวิทยาลัยนี้?')) {
      return
    }

    try {
      const response = await axios.delete('/api/university', {
        data: { id } // ส่ง id ผ่าน Request Body
      })

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'ลบมหาวิทยาลัยสำเร็จ',
          severity: 'success'
        })
        // รีเฟรชข้อมูลมหาวิทยาลัย
        await fetchUniversities()
      }
    } catch (error) {
      console.error('Error deleting university:', error)
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'เกิดข้อผิดพลาดในการลบมหาวิทยาลัย',
        severity: 'error'
      })
    }
  }

  // ฟังก์ชันสำหรับปิด Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    status === 'authenticated' &&
    session.user && (
      <Box className='container mx-auto p-4'>
        <Box className='flex justify-between items-center mb-4'>
          <div>
            <Typography variant='h4' component='h2' gutterBottom>
              หน้าจัดการรายชื่อมหาวิทยาลัย
            </Typography>
          </div>
          <StyledButton variant='contained' onClick={handleOpenModal}>
            เพิ่มมหาวิทยาลัย
          </StyledButton>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} className='shadow-lg rounded-lg'>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>รหัส</StyledTableHeadCell>
                  <StyledTableHeadCell className='hidden md:table-cell'>ชื่อมหาวิทยาลัย</StyledTableHeadCell>
                  <StyledTableHeadCell className='hidden md:table-cell'>ชื่อย่อ</StyledTableHeadCell>
                  <StyledTableHeadCell className='hidden md:table-cell'>ปีการศึกษา</StyledTableHeadCell>
                  <StyledTableHeadCell>ตัวเลือก</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUniversities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align='center'>
                      ไม่มีข้อมูลที่จะแสดง
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUniversities.map(university => (
                    <TableRow key={university.id} className='bg-white'>
                      <StyledTableCell>{university.id}</StyledTableCell>
                      <StyledTableCell className='hidden md:table-cell'>{university.uniname}</StyledTableCell>
                      <StyledTableCell className='hidden md:table-cell'>{university.location}</StyledTableCell>
                      <StyledTableCell className='hidden md:table-cell'>{university.uni_year}</StyledTableCell>
                      <StyledTableCell>
                        <IconButton onClick={() => handleOpenUpdateModal(university)}>
                          <SettingsIcon sx={{ color: green[500] }} />
                        </IconButton>
                        <IconButton aria-label='delete' onClick={() => handleDelete(university.id)}>
                          <DeleteIcon color='error' />
                        </IconButton>
                      </StyledTableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color='primary' size='large' />
        </Box>

        {/* Modal สำหรับเพิ่มมหาวิทยาลัยใหม่ */}
        <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth='sm'>
          <DialogTitle>เพิ่มมหาวิทยาลัยใหม่</DialogTitle>
          <DialogContent>
            <Box component='form' sx={{ mt: 2 }}>
              <TextField
                margin='normal'
                label='รหัสมหาวิทยาลัย'
                name='unino'
                fullWidth
                value={newUniversity.unino}
                onChange={handleInputChange}
              />
              <TextField
                margin='normal'
                label='ชื่อมหาวิทยาลัย'
                name='uniname'
                fullWidth
                value={newUniversity.uniname}
                onChange={handleInputChange}
              />
              <TextField
                margin='normal'
                label='ชื่อย่อ'
                name='location'
                fullWidth
                value={newUniversity.location}
                onChange={handleInputChange}
              />
              <TextField
                margin='normal'
                label='ปีการศึกษา'
                name='uni_year'
                fullWidth
                value={newUniversity.uni_year}
                onChange={handleInputChange}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color='secondary'>
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit} variant='contained' color='primary'>
              บันทึก
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal สำหรับอัปเดตมหาวิทยาลัย */}
        <Dialog open={openUpdateModal} onClose={handleCloseUpdateModal} fullWidth maxWidth='sm'>
          <DialogTitle>อัปเดตมหาวิทยาลัย</DialogTitle>
          <DialogContent>
            {currentUniversity && (
              <Box component='form' sx={{ mt: 2 }}>
                <TextField
                  margin='normal'
                  label='รหัสมหาวิทยาลัย'
                  name='unino'
                  fullWidth
                  value={currentUniversity.unino}
                  onChange={handleUpdateInputChange}
                />
                <TextField
                  margin='normal'
                  label='ชื่อมหาวิทยาลัย'
                  name='uniname'
                  fullWidth
                  value={currentUniversity.uniname}
                  onChange={handleUpdateInputChange}
                />
                <TextField
                  margin='normal'
                  label='ชื่อย่อ'
                  name='location'
                  fullWidth
                  value={currentUniversity.location}
                  onChange={handleUpdateInputChange}
                />
                <TextField
                  margin='normal'
                  label='ปีการศึกษา'
                  name='uni_year'
                  fullWidth
                  value={currentUniversity.uni_year}
                  onChange={handleUpdateInputChange}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUpdateModal} color='secondary'>
              ยกเลิก
            </Button>
            <Button onClick={handleUpdateSubmit} variant='contained' color='primary'>
              อัปเดต
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar สำหรับแสดงข้อความแจ้งเตือน */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    )
  )
}
