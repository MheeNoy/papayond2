// pages/parcel_number_report.js

'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
  Select,
  MenuItem,
  styled,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material'

// นำเข้าไอคอนเครื่องหมายติ๊กถูก
import CheckIcon from '@mui/icons-material/Check'

// ฟังก์ชันแปลงวันที่
const formatDate = isoDateString => {
  if (!isoDateString || isoDateString === '-') return '-'
  const date = new Date(isoDateString)
  if (isNaN(date.getTime())) return '-'
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${date.getFullYear()}`
}

// สร้างธีมสำหรับตาราง
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '1rem'
}))

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontSize: '1rem',
  fontWeight: 'bold'
}))

export default function ParcelNumberReport() {
  const [rows, setRows] = useState([])
  const [filteredRows, setFilteredRows] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [isLoading, setIsLoading] = useState(false)

  // ตัวแปรสถานะสำหรับ Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  // ฟังก์ชันสำหรับดึง uni_id จาก sessionStorage
  const getUniIdFromSession = () => {
    const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))
    return selectedUniversity ? selectedUniversity.uni_id : null
  }

  // ดึงข้อมูลทันทีที่หน้าโหลด
  useEffect(() => {
    const uni_id = getUniIdFromSession()

    if (uni_id) {
      setIsLoading(true)
      axios
        .post('/api/bookingfw', { uni_id })
        .then(response => {
          if (Array.isArray(response.data)) {
            setRows(response.data)
            setFilteredRows(response.data)
          } else {
            console.error('API did not return an array:', response.data)
            setSnackbarMessage('เกิดข้อผิดพลาดในการดึงข้อมูล')
            setSnackbarSeverity('error')
            setSnackbarOpen(true)
          }
        })
        .catch(error => {
          console.error('Error fetching data:', error)
          setSnackbarMessage('เกิดข้อผิดพลาดในการดึงข้อมูล')
          setSnackbarSeverity('error')
          setSnackbarOpen(true)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      console.error('uni_id is null')
      setSnackbarMessage('ไม่พบข้อมูลมหาวิทยาลัย')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }, [])

  // ฟังก์ชันการค้นหาในตาราง
  const [searchData, setSearchData] = useState({
    booking_status: 'ดูทั้งหมด',
    booking_set: 'เลือกทุกชุดที่สั่งจอง',
    additional: 'ทั้งหมด'
  })

  const handleSearch = () => {
    if (!Array.isArray(rows)) {
      console.error('rows is not an array')
      setSnackbarMessage('เกิดข้อผิดพลาดในการค้นหา')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return
    }

    const filtered = rows.filter(row => {
      // กรองตามสถานะการจอง
      let matchesBookingStatus = true
      if (searchData.booking_status === 'มีการจอง') {
        matchesBookingStatus = row.booking_status === 'reserved'
      } else if (searchData.booking_status === 'ไม่มีการจอง') {
        matchesBookingStatus = row.booking_status !== 'reserved'
      }

      // กรองตามชุดที่จอง
      let matchesBookingSet = true
      if (searchData.booking_set !== 'เลือกทุกชุดที่สั่งจอง') {
        matchesBookingSet = row.booking_set == searchData.booking_set
      }

      // กรองตามเพิ่มเติม
      let matchesAdditional = true
      if (searchData.additional === 'เฉพาะชุด') {
        matchesAdditional = row.type === 'set'
      } else if (searchData.additional === 'เฉพาะภาพหมู่กรอบ') {
        matchesAdditional = row.type === 'group_frame'
      } else if (searchData.additional === 'เฉพาะงาช้าง') {
        matchesAdditional = row.type === 'ivory'
      }

      return matchesBookingStatus && matchesBookingSet && matchesAdditional
    })

    setFilteredRows(filtered)
    setCurrentPage(1) // รีเซ็ตหน้าปัจจุบันเมื่อทำการค้นหาใหม่
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setSearchData({ ...searchData, [name]: value })
  }

  // คำนวณรายการที่จะต้องแสดงในแต่ละหน้า
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = Array.isArray(filteredRows) ? filteredRows.slice(indexOfFirstItem, indexOfLastItem) : []

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const handlePageChange = (event, value) => {
    setCurrentPage(value)
  }

  // ฟังก์ชันสำหรับพิมพ์รายงาน
  const handlePrintReport = () => {
    window.print()
  }

  return (
    <div>
      <Typography variant='h5' gutterBottom>
        รายงานหมายเลขพัสดุ
      </Typography>

      {/* ฟิลด์ค้นหา */}
      <Box display='flex' flexWrap='wrap' alignItems='center' mb={2}>
        {/* สถานะการจอง */}
        <FormControl sx={{ maxWidth: '200px', mr: 2, mb: 2 }}>
          <InputLabel id='booking-status-label'>สถานะการจอง</InputLabel>
          <Select
            labelId='booking-status-label'
            name='booking_status'
            value={searchData.booking_status}
            onChange={handleInputChange}
            size='small'
            label='สถานะการจอง'
          >
            <MenuItem value='ดูทั้งหมด'>ดูทั้งหมด</MenuItem>
            <MenuItem value='มีการจอง'>มีการจอง</MenuItem>
            <MenuItem value='ไม่มีการจอง'>ไม่มีการจอง</MenuItem>
          </Select>
        </FormControl>

        {/* ชุดที่จอง */}
        <FormControl sx={{ maxWidth: '200px', mr: 2, mb: 2 }}>
          <InputLabel id='booking-set-label'>ชุดที่จอง</InputLabel>
          <Select
            labelId='booking-set-label'
            name='booking_set'
            value={searchData.booking_set}
            onChange={handleInputChange}
            size='small'
            label='ชุดที่จอง'
          >
            <MenuItem value='เลือกทุกชุดที่สั่งจอง'>เลือกทุกชุดที่สั่งจอง</MenuItem>
            {[...Array(15)].map((_, index) => (
              <MenuItem key={index + 1} value={index + 1}>
                ชุดที่ {index + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* เพิ่มเติม */}
        <FormControl sx={{ maxWidth: '200px', mr: 2, mb: 2 }}>
          <InputLabel id='additional-label'>เพิ่มเติม</InputLabel>
          <Select
            labelId='additional-label'
            name='additional'
            value={searchData.additional}
            onChange={handleInputChange}
            size='small'
            label='เพิ่มเติม'
          >
            <MenuItem value='ทั้งหมด'>ทั้งหมด</MenuItem>
            <MenuItem value='เฉพาะชุด'>เฉพาะชุด</MenuItem>
            <MenuItem value='เฉพาะภาพหมู่กรอบ'>เฉพาะภาพหมู่กรอบ</MenuItem>
            <MenuItem value='เฉพาะงาช้าง'>เฉพาะงาช้าง</MenuItem>
          </Select>
        </FormControl>

        {/* ปุ่มค้นหา */}
        <Button variant='contained' color='primary' onClick={handleSearch} sx={{ mb: 2, mr: 2 }}>
          ค้นหา
        </Button>

        {/* ปุ่มพิมพ์รายงาน */}
        <Button variant='contained' color='secondary' onClick={handlePrintReport} sx={{ mb: 2 }}>
          พิมพ์รายงาน
        </Button>
      </Box>

      {/* Loading Spinner */}
      {isLoading ? (
        <Box display='flex' justifyContent='center'>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* ตารางแสดงข้อมูล */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>ลำดับ</StyledTableHeadCell>
                  <StyledTableHeadCell>เลขฟิล์ม</StyledTableHeadCell>
                  <StyledTableHeadCell>เลขใบจอง</StyledTableHeadCell>
                  <StyledTableHeadCell>ชุดที่จอง</StyledTableHeadCell>
                  <StyledTableHeadCell>หมู่กรอบ</StyledTableHeadCell>
                  <StyledTableHeadCell>สีงาช้าง</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(currentItems) && currentItems.length > 0 ? (
                  currentItems.map((row, index) => (
                    <TableRow key={index}>
                      <StyledTableCell>{indexOfFirstItem + index + 1}</StyledTableCell>
                      <StyledTableCell>{row.film_no || '-'}</StyledTableCell>
                      <StyledTableCell>{row.booking_no || '-'}</StyledTableCell>
                      <StyledTableCell>{row.booking_set || '-'}</StyledTableCell>
                      <StyledTableCell>{row.add_ademgo == 1 ? <CheckIcon color='success' /> : '-'}</StyledTableCell>
                      <StyledTableCell>{row.chang_eleph == 1 ? <CheckIcon color='success' /> : '-'}</StyledTableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <StyledTableCell colSpan={6} align='center'>
                      ไม่มีข้อมูล
                    </StyledTableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box display='flex' justifyContent='center' mt={2}>
            <Pagination
              count={Math.ceil((filteredRows && filteredRows.length) / itemsPerPage) || 1}
              page={currentPage}
              onChange={handlePageChange}
              color='primary'
            />
          </Box>
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* สไตล์พิเศษสำหรับการพิมพ์ */}
      <style jsx>{`
        @media print {
          button,
          input,
          select {
            display: none;
          }
          @page {
            margin: 20mm;
          }
        }
      `}</style>
    </div>
  )
}
