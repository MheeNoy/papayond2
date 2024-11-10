'use client'
import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  TextField,
  styled,
  TableCell,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Snackbar,
  Alert
} from '@mui/material'
import axios from 'axios'
import { useSession } from 'next-auth/react' // เพิ่มการนำเข้า useSession

// Styled table cell for the body, without adjusting font size
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '16px',
  fontWeight: 'bold'
}))

// Styled table cell for the header, maintaining the theme's primary color
const StyledTableHeadCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white
}))

const FileDataTable = () => {
  const { data: session } = useSession() // ใช้ useSession เพื่อดึงข้อมูล session
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUniversity, setSelectedUniversity] = useState(null)
  const [currentPage, setCurrentPage] = useState(1) // สำหรับการควบคุมหน้า
  const [rowsPerPage, setRowsPerPage] = useState(8) // จำนวนรายการต่อหน้าเริ่มต้นเป็น 8

  // เพิ่ม state สำหรับ Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success') // 'success' | 'error' | 'warning' | 'info'

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ดึงข้อมูล selectedUniversity จาก sessionStorage
        const storedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))
        setSelectedUniversity(storedUniversity) // กำหนดค่าให้ selectedUniversity

        if (!storedUniversity || !storedUniversity.uni_id) {
          console.error('Missing selectedUniversity or uni_id in sessionStorage')
          setSnackbarMessage('ไม่พบข้อมูลมหาวิทยาลัย')
          setSnackbarSeverity('error')
          setSnackbarOpen(true)
          return
        }

        // ส่ง uni_id ในการเรียก API
        const response = await axios.post('/api/groupphoto', { uni_id: storedUniversity.uni_id })
        setData(response.data)
      } catch (error) {
        console.error('Error fetching data:', error)
        setSnackbarMessage('เกิดข้อผิดพลาดในการดึงข้อมูล')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // ฟังก์ชันคำนวณรายการในแต่ละหน้า
  const totalPages = Math.ceil(data.length / rowsPerPage)
  const currentRows = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // ฟังก์ชันเปลี่ยนหน้า
  const handlePageChange = (event, value) => {
    setCurrentPage(value)
  }

  // ฟังก์ชันเปลี่ยนจำนวนรายการต่อหน้า
  const handleRowsPerPageChange = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setCurrentPage(1) // รีเซ็ตหน้าไปที่ 1 เมื่อเปลี่ยนจำนวนรายการต่อหน้า
  }

  // ฟังก์ชันอัปเดตข้อมูลเมื่อมีการเปลี่ยนแปลงใน input fields
  const handleInputChange = (rowId, field, value) => {
    // อัปเดตค่าภายใน state ทันทีเพื่อให้ UI ตอบสนองได้เร็ว
    setData(prevData =>
      prevData.map(row =>
        row.id === rowId
          ? {
              ...row,
              [field]: value // อัปเดตฟิลด์ที่เปลี่ยน
            }
          : row
      )
    )

    // เรียกฟังก์ชันสำหรับอัปเดตข้อมูลไปยัง backend
    handleUpdate(rowId, field, value)
  }

  const handleUpdate = async (rowId, field, value) => {
    try {
      // ค้นหาข้อมูลแถวที่ต้องการอัปเดต
      const rowToUpdate = data.find(row => row.id === rowId)
      if (!rowToUpdate) {
        console.error('Row not found')
        setSnackbarMessage('ไม่พบข้อมูลแถวที่ต้องการอัปเดต')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
        return
      }

      // ดึงชื่อผู้ใช้จาก session
      const update_by = session?.user?.name || 'Unknown'

      // สร้างอ็อบเจ็กต์ข้อมูลที่ต้องการอัปเดต
      const updatedRow = {
        id: rowId,
        ...rowToUpdate,
        [field]: value, // อัปเดตฟิลด์ที่เปลี่ยน
        update_by // ใช้ชื่อผู้ใช้จาก session
      }

      console.log('Sending updatedRow:', updatedRow) // เพิ่มการตรวจสอบข้อมูล

      // ส่งข้อมูลไปยัง API สำหรับอัปเดต
      const response = await axios.put('/api/updategroup-photo', updatedRow)

      if (response.data.success) {
        console.log('Update successful')
        setSnackbarMessage('อัปเดตข้อมูลสำเร็จ')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
      } else {
        console.error('Update failed:', response.data.error)
        setSnackbarMessage(`อัปเดตไม่สำเร็จ: ${response.data.error}`)
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      }
    } catch (error) {
      console.error('Error updating data:', error)
      setSnackbarMessage('เกิดข้อผิดพลาดในการอัปเดตข้อมูล')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  // จำนวนแถว Skeleton ที่จะแสดงในขณะโหลด
  const skeletonRows = Array.from({ length: rowsPerPage }, (_, index) => index)

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', margin: 'auto', mt: 4, px: 2 }}>
      {/* ส่วนของ Dropdown และหัวข้อ */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant='h4' gutterBottom>
          {selectedUniversity?.uniname} ปีการศึกษา {selectedUniversity?.uni_year}
        </Typography>
        {/* Dropdown สำหรับเลือกจำนวนรายการต่อหน้า */}
        <FormControl variant='outlined' size='small' sx={{ minWidth: 120 }}>
          <InputLabel id='rows-per-page-label'>Rows per page</InputLabel>
          <Select
            labelId='rows-per-page-label'
            id='rows-per-page'
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            label='Rows per page'
          >
            <MenuItem value={8}>8</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={16}>16</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell></StyledTableHeadCell>
              <StyledTableHeadCell></StyledTableHeadCell>
              <StyledTableHeadCell align='center' colSpan={3}>
                รอบที่ 1
              </StyledTableHeadCell>
              <StyledTableHeadCell align='center' colSpan={3}>
                รอบที่ 2
              </StyledTableHeadCell>
              <StyledTableHeadCell align='center' colSpan={3}>
                รอบที่ 3
              </StyledTableHeadCell>
              <StyledTableHeadCell></StyledTableHeadCell>
              <StyledTableHeadCell></StyledTableHeadCell>
            </TableRow>
            <TableRow>
              <StyledTableHeadCell align='center'>รหัส</StyledTableHeadCell>
              <StyledTableHeadCell>ชื่อ</StyledTableHeadCell>
              {/* ช่องของ รอบที่ 1 */}
              <StyledTableHeadCell align='center'>หมู่</StyledTableHeadCell>
              <StyledTableHeadCell align='center'>แถวที่</StyledTableHeadCell>
              <StyledTableHeadCell align='center'>ลำดับ</StyledTableHeadCell>
              {/* ช่องของ รอบที่ 2 */}
              <StyledTableHeadCell align='center'>หมู่</StyledTableHeadCell>
              <StyledTableHeadCell align='center'>แถวที่</StyledTableHeadCell>
              <StyledTableHeadCell align='center'>ลำดับ</StyledTableHeadCell>
              {/* ช่องของ รอบที่ 3 */}
              <StyledTableHeadCell align='center'>หมู่</StyledTableHeadCell>
              <StyledTableHeadCell align='center'>แถวที่</StyledTableHeadCell>
              <StyledTableHeadCell align='center'>ลำดับ</StyledTableHeadCell>
              <StyledTableHeadCell>เลขฟิล์ม</StyledTableHeadCell>
              <StyledTableHeadCell>update</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? // แสดง Skeleton ขณะที่โหลด
                skeletonRows.map((_, index) => (
                  <TableRow key={index}>
                    <StyledTableCell>
                      <Skeleton variant='text' />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Skeleton variant='text' />
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <Skeleton variant='rectangular' height={30} />
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <Skeleton variant='rectangular' height={30} />
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <Skeleton variant='rectangular' height={30} />
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <Skeleton variant='rectangular' height={30} />
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <Skeleton variant='rectangular' height={30} />
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <Skeleton variant='rectangular' height={30} />
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <Skeleton variant='rectangular' height={30} />
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <Skeleton variant='rectangular' height={30} />
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <Skeleton variant='rectangular' height={30} />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Skeleton variant='text' />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Skeleton variant='text' />
                    </StyledTableCell>
                  </TableRow>
                ))
              : // แสดงข้อมูลจริงเมื่อโหลดเสร็จ
                currentRows.map(row => (
                  <TableRow key={row.id}>
                    <StyledTableCell>{row.id}</StyledTableCell>
                    <StyledTableCell>{`${row.fname} ${row.lname}`}</StyledTableCell>

                    {/* รอบที่ 1 */}
                    <StyledTableCell align='center'>
                      <TextField
                        value={row.posiphoto_1 || ''}
                        onChange={e => handleInputChange(row.id, 'posiphoto_1', e.target.value)}
                        variant='outlined'
                        size='small'
                      />
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <TextField
                        value={row.posiphoto_2 || ''}
                        onChange={e => handleInputChange(row.id, 'posiphoto_2', e.target.value)}
                        variant='outlined'
                        size='small'
                      />
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <TextField
                        value={row.posiphoto_3 || ''}
                        onChange={e => handleInputChange(row.id, 'posiphoto_3', e.target.value)}
                        variant='outlined'
                        size='small'
                      />
                    </StyledTableCell>

                    {/* รอบที่ 2 */}
                    <StyledTableCell align='center'>
                      <TextField
                        value={row.posiphoto_4 || ''}
                        onChange={e => handleInputChange(row.id, 'posiphoto_4', e.target.value)}
                        variant='outlined'
                        size='small'
                      />
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <TextField
                        value={row.posiphoto_5 || ''}
                        onChange={e => handleInputChange(row.id, 'posiphoto_5', e.target.value)}
                        variant='outlined'
                        size='small'
                      />
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <TextField
                        value={row.posiphoto_6 || ''}
                        onChange={e => handleInputChange(row.id, 'posiphoto_6', e.target.value)}
                        variant='outlined'
                        size='small'
                      />
                    </StyledTableCell>

                    {/* รอบที่ 3 */}
                    <StyledTableCell align='center'>
                      <TextField
                        value={row.posiphoto_7 || ''}
                        onChange={e => handleInputChange(row.id, 'posiphoto_7', e.target.value)}
                        variant='outlined'
                        size='small'
                      />
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <TextField
                        value={row.posiphoto_8 || ''}
                        onChange={e => handleInputChange(row.id, 'posiphoto_8', e.target.value)}
                        variant='outlined'
                        size='small'
                      />
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <TextField
                        value={row.posiphoto_9 || ''}
                        onChange={e => handleInputChange(row.id, 'posiphoto_9', e.target.value)}
                        variant='outlined'
                        size='small'
                      />
                    </StyledTableCell>

                    <StyledTableCell>{row.film_no}</StyledTableCell>
                    <StyledTableCell>{`${row.update_by} ${new Date(row.update_date).toLocaleString()}`}</StyledTableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ส่วนของ Pagination แบบวงกลม */}
      <Box mt={2} display='flex' justifyContent='center' alignItems='center'>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color='primary'
          shape='rounded' // ทำให้เป็นแบบวงกลม
          showFirstButton
          showLastButton
        />
      </Box>

      {/* ส่วนของ Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default FileDataTable
