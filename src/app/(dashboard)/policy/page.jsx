'use client'
import React, { useState, useEffect } from 'react'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import DeleteIcon from '@mui/icons-material/Delete' // เพิ่มการนำเข้า DeleteIcon

import { getSession } from 'next-auth/react'
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Snackbar,
  Alert,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Typography,
  Pagination,
  IconButton,
  InputAdornment
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import axios from 'axios'
import SettingsIcon from '@mui/icons-material/Settings'
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
  padding: '8px 16px',
  minWidth: 'auto'
}))

const UserManagementPage = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [status, setStatus] = useState('unauthenticated')
  const [session, setSession] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', username: '', password: '', confirmPassword: '' })
  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'info' })
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false) // เพิ่มสถานะสำหรับ Dialog ยืนยันการลบ
  const [userToDelete, setUserToDelete] = useState(null) // เพิ่มสถานะสำหรับผู้ใช้ที่จะลบ
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [allMenus, setAllMenus] = useState([])
  const itemsPerPage = 8

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const sessionData = await getSession()
      if (sessionData && sessionData.user) {
        setStatus('authenticated')
        setSession(sessionData)

        const response = await axios.get('/api/permission')
        setUsers(response.data.users || [])
        setAllMenus(response.data.allMenus || [])
      } else {
        setStatus('unauthenticated')
      }
    } catch (error) {
      setAlertInfo({ open: true, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', severity: 'error' })
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalPages = Math.ceil(users.length / itemsPerPage)

  const handlePageChange = (event, page) => {
    setCurrentPage(page)
  }

  const handlePermissionChange = menuName => {
    setSelectedUser(prevUser => {
      const newPermissions = prevUser.permissions.includes(menuName)
        ? prevUser.permissions.filter(p => p !== menuName)
        : [...prevUser.permissions, menuName]
      return { ...prevUser, permissions: newPermissions }
    })
  }

  const handleClickShowPassword = () => {
    setShowPassword(prev => !prev)
  }

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(prev => !prev)
  }

  const handleMouseDownPassword = event => {
    event.preventDefault()
  }

  const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleEditPermissions = user => {
    setSelectedUser(user)
    setIsPermissionModalOpen(true)
  }

  const handleClosePermissionModal = () => {
    setIsPermissionModalOpen(false)
    setSelectedUser(null)
  }

  const handleSavePermissions = async () => {
    try {
      if (!selectedUser || !selectedUser.id) {
        // เปลี่ยนจาก user_id เป็น id
        console.error('selectedUser or userId is missing')
        return
      }

      const response = await axios.put(`/api/permission/${selectedUser.id}`, {
        permissions: selectedUser.permissions
      })

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === selectedUser.id ? { ...user, permissions: response.data.permissions } : user
        )
      )
      setAlertInfo({ open: true, message: 'บันทึกสิทธิ์เรียบร้อยแล้ว', severity: 'success' })
      handleClosePermissionModal()
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการบันทึกสิทธิ์:', error)
      setAlertInfo({ open: true, message: 'เกิดข้อผิดพลาดในการบันทึกสิทธิ์', severity: 'error' })
    }
  }

  const handleAddUser = async () => {
    const { name, email, username, password, confirmPassword } = newUser

    // การตรวจสอบข้อมูลพื้นฐาน
    if (!name || !email || !username || !password || !confirmPassword) {
      setAlertInfo({ open: true, message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง', severity: 'error' })
      return
    }

    if (password !== confirmPassword) {
      setAlertInfo({ open: true, message: 'รหัสผ่านไม่ตรงกัน', severity: 'error' })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setAlertInfo({ open: true, message: 'กรุณากรอกอีเมลให้ถูกต้อง', severity: 'error' })
      return
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
    if (!usernameRegex.test(username)) {
      setAlertInfo({
        open: true,
        message: 'ชื่อผู้ใช้ไม่ถูกต้อง กรุณาใช้ 3-30 อักขระ: ตัวอักษร, ตัวเลข, หรือ _',
        severity: 'error'
      })
      return
    }

    try {
      const response = await axios.post('/api/users', { name, email, username, password, confirmPassword })
      const userWithPermissions = { ...response.data, permissions: response.data.permissions || [] }
      setUsers(prevUsers => [...prevUsers, userWithPermissions])
      setIsModalOpen(false)
      setNewUser({ name: '', email: '', username: '', password: '', confirmPassword: '' }) // รวม username
      setAlertInfo({ open: true, message: 'เพิ่มผู้ใช้สำเร็จ', severity: 'success' })
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มผู้ใช้:', error.response ? error.response.data : error.message)
      if (error.response && error.response.data.message) {
        setAlertInfo({ open: true, message: error.response.data.message, severity: 'error' })
      } else {
        setAlertInfo({ open: true, message: 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้ กรุณาลองใหม่อีกครั้ง', severity: 'error' })
      }
    }
  }

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setAlertInfo({ ...alertInfo, open: false })
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setNewUser(prevUser => ({ ...prevUser, [name]: value }))
  }

  // ฟังก์ชันสำหรับเปิด Dialog ยืนยันการลบ
  const handleDeleteUser = user => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  // ฟังก์ชันสำหรับปิด Dialog ยืนยันการลบ
  const handleCloseDeleteDialog = () => {
    setUserToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  // ฟังก์ชันสำหรับลบผู้ใช้จริง
  const handleConfirmDeleteUser = async () => {
    try {
      if (!userToDelete || !userToDelete.user_id) {
        // เปลี่ยนจาก id เป็น user_id

        setAlertInfo({ open: true, message: 'ไม่พบ ID ของผู้ใช้', severity: 'error' })
        return
      }

      const response = await axios.delete('/api/users', {
        data: { id: userToDelete.user_id } // ส่ง id ใน body ของคำขอ DELETE
      })

      if (response.status === 200) {
        setUsers(prevUsers => prevUsers.filter(u => u.user_id !== userToDelete.user_id)) // ใช้ user_id
        setAlertInfo({ open: true, message: 'ลบผู้ใช้สำเร็จ', severity: 'success' })
      }
    } catch (error) {
      setAlertInfo({ open: true, message: 'เกิดข้อผิดพลาดในการลบผู้ใช้', severity: 'error' })
    } finally {
      handleCloseDeleteDialog()
    }
  }

  const renderSkeletonTable = () => (
    <TableContainer component={Paper} className='shadow-lg rounded-lg'>
      <Table>
        <TableHead>
          <TableRow>
            {['ชื่อ', 'อีเมล', 'บทบาท', 'จำนวนสิทธิ์', 'ตัวเลือก'].map((header, index) => (
              <StyledTableHeadCell key={index}>
                <Skeleton animation='wave' height={24} />
              </StyledTableHeadCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(8)].map((_, index) => (
            <TableRow key={index}>
              <StyledTableCell>
                <Skeleton animation='wave' height={24} />
              </StyledTableCell>
              <StyledTableCell>
                <Skeleton animation='wave' height={24} />
              </StyledTableCell>
              <StyledTableCell>
                <Skeleton animation='wave' height={24} />
              </StyledTableCell>
              <StyledTableCell>
                <Skeleton animation='wave' height={24} />
              </StyledTableCell>
              <StyledTableCell>
                <Skeleton animation='wave' height={36} width={100} />
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  if (isLoading) {
    return (
      <Box className='container mx-auto p-4'>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Skeleton animation='wave' height={32} width={200} />
            <Skeleton animation='wave' height={24} width={300} />
          </Box>
          <Skeleton animation='wave' variant='rectangular' width={120} height={36} />
        </Box>
        {renderSkeletonTable()}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} animation='wave' variant='circular' width={36} height={36} sx={{ mx: 0.5 }} />
          ))}
        </Box>
      </Box>
    )
  }

  if (status !== 'authenticated' || !session?.user) {
    return <Typography>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</Typography>
  }

  return (
    <Box className='container mx-auto p-4'>
      <Box className='flex justify-between items-center mb-4'>
        <div>
          <Typography variant='h4' component='h2' gutterBottom>
            การจัดการผู้ใช้
          </Typography>
          <Typography variant='body1' className='text-gray-600'>
            เพิ่ม ลบ แก้ไข ผู้ใช้ และจัดการสิทธิ์ของแต่ละผู้ใช้
          </Typography>
        </div>
        <StyledButton variant='contained' onClick={() => setIsModalOpen(true)}>
          เพิ่มผู้ใช้
        </StyledButton>
      </Box>

      <Snackbar
        open={alertInfo.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertInfo.severity}
          sx={{
            width: '100%',
            backgroundColor: theme => theme.palette[alertInfo.severity].main,
            color: theme => theme.palette[alertInfo.severity].contrastText
          }}
          variant='filled'
        >
          {alertInfo.message}
        </Alert>
      </Snackbar>

      <TableContainer component={Paper} className='shadow-lg rounded-lg'>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>ชื่อ</StyledTableHeadCell>
              <StyledTableHeadCell>อีเมล</StyledTableHeadCell>
              <StyledTableHeadCell>บทบาท</StyledTableHeadCell>
              <StyledTableHeadCell>จำนวนสิทธิ์</StyledTableHeadCell>
              <StyledTableHeadCell>ตัวเลือก</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user, index) => (
              <TableRow key={user.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <StyledTableCell>{user.name}</StyledTableCell>
                <StyledTableCell>{user.email}</StyledTableCell>
                <StyledTableCell>{user.role}</StyledTableCell>
                <StyledTableCell>{user.permissions?.length || 0}</StyledTableCell>
                <StyledTableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <StyledButton variant='contained' color='primary' onClick={() => handleEditPermissions(user)}>
                      <SettingsIcon />
                    </StyledButton>
                    <StyledButton
                      variant='contained'
                      color='error'
                      onClick={() => handleDeleteUser(user)} // ใช้ handleDeleteUser
                    >
                      <DeleteIcon />
                    </StyledButton>
                  </Box>
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color='primary' size='large' />
      </Box>

      {/* Dialog สำหรับแก้ไขสิทธิ์ */}
      <Dialog open={isPermissionModalOpen} onClose={handleClosePermissionModal}>
        <DialogTitle>แก้ไขสิทธิ์สำหรับ {selectedUser?.name}</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>สิทธิ์</StyledTableHeadCell>
                  <StyledTableHeadCell align='center'>เปิดใช้งาน</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allMenus.map((menuName, index) => (
                  <TableRow key={index}>
                    <StyledTableCell>{menuName}</StyledTableCell>
                    <StyledTableCell align='center'>
                      <Checkbox
                        checked={selectedUser?.permissions.includes(menuName)}
                        onChange={() => handlePermissionChange(menuName)}
                      />
                    </StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleClosePermissionModal}>ยกเลิก</StyledButton>
          <StyledButton onClick={handleSavePermissions} variant='contained'>
            บันทึกสิทธิ์
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Dialog สำหรับเพิ่มผู้ใช้ใหม่ */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>เพิ่มผู้ใช้ใหม่</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            name='name'
            label='ชื่อผู้ใช้'
            type='text'
            fullWidth
            variant='outlined'
            value={newUser.name}
            onChange={handleInputChange}
          />
          <TextField
            margin='dense'
            name='username'
            label='Username (สำหรับเข้าสู่ระบบ)'
            type='text'
            fullWidth
            variant='outlined'
            value={newUser.username}
            onChange={handleInputChange}
          />
          <TextField
            margin='dense'
            name='email'
            label='อีเมล'
            type='email'
            fullWidth
            variant='outlined'
            value={newUser.email}
            onChange={handleInputChange}
          />
          <TextField
            margin='dense'
            name='password'
            label='รหัสผ่าน'
            type={showPassword ? 'text' : 'password'}
            fullWidth
            variant='outlined'
            value={newUser.password}
            onChange={handleInputChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge='end'
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            margin='dense'
            name='confirmPassword'
            label='ยืนยันรหัสผ่าน'
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            variant='outlined'
            value={newUser.confirmPassword}
            onChange={handleInputChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle confirm password visibility'
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge='end'
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => setIsModalOpen(false)}>ยกเลิก</StyledButton>
          <StyledButton onClick={handleAddUser} variant='contained'>
            เพิ่มผู้ใช้
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Dialog สำหรับยืนยันการลบผู้ใช้ */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>ยืนยันการลบผู้ใช้</DialogTitle>
        <DialogContent>
          <Typography>คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "{userToDelete?.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>ยกเลิก</Button>
          <Button onClick={handleConfirmDeleteUser} variant='contained' color='error'>
            ลบผู้ใช้
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserManagementPage
