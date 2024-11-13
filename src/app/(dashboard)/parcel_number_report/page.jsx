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
  Box,
  Select,
  MenuItem,
  styled,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  TextField
} from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { parseISO } from 'date-fns'

// Styled Table Cells
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
  const itemsPerPage = 8
  const [isLoading, setIsLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [filters, setFilters] = useState({
    name: '',
    filmOrBookingNo: '',
    sendCount: '',
    startDate: null,
    endDate: null
  })
  const [sendCounts, setSendCounts] = useState([]) // State สำหรับเก็บค่า number_send

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post('/api/parcel_report', {
        uni_id: 23 // Specify uni_id here
      })
      setRows(response.data)
      setFilteredRows(response.data)

      // ดึงค่า number_send ที่ไม่ซ้ำกันและจัดเรียง
      const uniqueSendCounts = [...new Set(response.data.map(row => row.number_send).filter(Boolean))].sort(
        (a, b) => a - b
      )
      setSendCounts(uniqueSendCounts)
    } catch (error) {
      setSnackbarMessage('Error fetching data')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter function
  const applyFilters = () => {
    const filtered = rows.filter(row => {
      const matchesName = filters.name ? row.name_for_rec && row.name_for_rec.includes(filters.name) : true

      const matchesFilmOrBookingNo = filters.filmOrBookingNo
        ? (row.film_no && row.film_no.includes(filters.filmOrBookingNo)) ||
          (row.booking_no && row.booking_no.includes(filters.filmOrBookingNo))
        : true

      const matchesSendCount = filters.sendCount ? row.number_send == filters.sendCount : true

      // แปลง row.send_date จากสตริงเป็น Date object
      const rowDate = parseISO(row.senddate)

      const matchesStartDate = filters.startDate ? rowDate >= filters.startDate : true
      const matchesEndDate = filters.endDate ? rowDate <= filters.endDate : true

      return matchesName && matchesFilmOrBookingNo && matchesSendCount && matchesStartDate && matchesEndDate
    })
    setFilteredRows(filtered)
    setCurrentPage(1) // รีเซ็ตไปยังหน้าที่ 1 หลังจากกรองข้อมูล
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters])

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
  }

  const handlePageChange = (event, value) => {
    setCurrentPage(value)
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem)

  const handlePrintReport = () => {
    const printContent = `
      <h2 style="text-align: center;">รายงานการส่งพัสดุ</h2>
      <p style="text-align: center;">ช่างการไฟฟ้าสวนภูมิภาค 67</p>
      <p style="text-align: center;">(${filteredRows.length} record)</p>
      <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="text-align: center; padding: 8px;">ลำดับที่</th>
            <th style="text-align: center; padding: 8px;">เลขฟิล์ม</th>
            <th style="text-align: center; padding: 8px;">ชื่อ-สกุล ผู้รับพัสดุ</th>
            <th style="text-align: center; padding: 8px;">เลขใบจอง</th>
            <th style="text-align: center; padding: 8px;">ปณ.นำหน้า</th>
            <th style="text-align: center; padding: 8px;">เลข ปณ.</th>
            <th style="text-align: center; padding: 8px;">วันที่ส่ง</th>
            <th style="text-align: center; padding: 8px;">น้ำหนัก</th>
            <th style="text-align: center; padding: 8px;">ราคา</th>
            <th style="text-align: center; padding: 8px;">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          ${filteredRows
            .map(
              (row, index) => `
              <tr>
                <td style="text-align: center; padding: 8px;">${index + 1}</td>
                <td style="text-align: center; padding: 8px;">${row.film_no || '-'}</td>
                <td style="text-align: left; padding: 8px;">${row.name_for_rec || '-'}</td>
                <td style="text-align: center; padding: 8px;">${row.booking_no || '-'}</td>
                <td style="text-align: center; padding: 8px;">${row.tacking_first || '-'}</td>
                <td style="text-align: center; padding: 8px;">${row.tacking_no || '-'}</td>
                <td style="text-align: center; padding: 8px;">${row.senddate || '-'}</td>
                <td style="text-align: center; padding: 8px;">${row.weight || '-'}</td>
                <td style="text-align: center; padding: 8px;">${row.send_price || '-'}</td>
                <td style="text-align: center; padding: 8px;">${row.send_status === 1 ? 'จัดส่งเรียบร้อยแล้ว' : '-'}</td>
              </tr>
            `
            )
            .join('')}
        </tbody>
      </table>
    `

    const printWindow = window.open('', '_blank')
    printWindow.document.open()
    printWindow.document.write(`
      <html>
        <head>
          <title>รายงานการส่งพัสดุ</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2, p { text-align: center; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; font-weight: bold; }
            @page { margin: 20mm; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContent}
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div>
      <Typography variant='h5' gutterBottom>
        รายงานการส่งพัสดุ
      </Typography>

      {/* Filter Fields */}
      <Box
        display='flex'
        flexWrap='wrap'
        alignItems='center'
        gap={2}
        mb={2}
        sx={{ width: '100%', justifyContent: 'space-between' }}
      >
        <TextField
          label='ชื่อ-นามสกุล'
          name='name'
          variant='outlined'
          size='small'
          value={filters.name}
          onChange={handleFilterChange}
          sx={{ flex: '1', minWidth: '200px', maxWidth: '300px', mb: 2 }}
        />
        <TextField
          label='เลขฟิล์ม-ใบจอง'
          name='filmOrBookingNo'
          variant='outlined'
          size='small'
          value={filters.filmOrBookingNo}
          onChange={handleFilterChange}
          sx={{ flex: '1', minWidth: '200px', maxWidth: '300px', mb: 2 }}
        />
        <FormControl sx={{ flex: '1', minWidth: '200px', maxWidth: '300px', mb: 2 }}>
          <InputLabel>ครั้งที่ส่ง</InputLabel>
          <Select
            name='sendCount'
            value={filters.sendCount}
            onChange={handleFilterChange}
            label='ครั้งที่ส่ง'
            size='small'
          >
            <MenuItem value=''>---ดูทั้งหมด---</MenuItem>
            {sendCounts.map(count => (
              <MenuItem key={count} value={count}>
                {count}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label='วันที่ส่ง จาก'
            value={filters.startDate}
            onChange={date => setFilters({ ...filters, startDate: date })}
            renderInput={params => <TextField {...params} size='small' sx={{ minWidth: '200px', mb: 2 }} />}
          />
          <DatePicker
            label='ถึง'
            value={filters.endDate}
            onChange={date => setFilters({ ...filters, endDate: date })}
            renderInput={params => <TextField {...params} size='small' sx={{ minWidth: '200px', mb: 2 }} />}
          />
        </LocalizationProvider>

        <Button variant='contained' color='primary' onClick={handlePrintReport} sx={{ height: '40px', mb: 2 }}>
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
          {/* Report Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>ครั้งที่ส่ง</StyledTableHeadCell>
                  <StyledTableHeadCell>เลขฟิล์ม</StyledTableHeadCell>
                  <StyledTableHeadCell>ชื่อ-สกุล ผู้รับพัสดุ</StyledTableHeadCell>
                  <StyledTableHeadCell>เลขใบจอง</StyledTableHeadCell>
                  <StyledTableHeadCell>ปณ.นำหน้า</StyledTableHeadCell>
                  <StyledTableHeadCell>เลข ปณ.</StyledTableHeadCell>
                  <StyledTableHeadCell>วันที่ส่ง</StyledTableHeadCell>
                  <StyledTableHeadCell>น้ำหนัก</StyledTableHeadCell>
                  <StyledTableHeadCell>ราคา</StyledTableHeadCell>
                  <StyledTableHeadCell>สถานะ</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((row, index) => (
                  <TableRow key={index}>
                    <StyledTableCell>{row.number_send || '-'}</StyledTableCell>
                    <StyledTableCell>{row.film_no || '-'}</StyledTableCell>
                    <StyledTableCell>{row.name_for_rec || '-'}</StyledTableCell>
                    <StyledTableCell>{row.booking_no || '-'}</StyledTableCell>
                    <StyledTableCell>{row.tacking_first || '-'}</StyledTableCell>
                    <StyledTableCell>{row.tacking_no || '-'}</StyledTableCell>
                    <StyledTableCell>{row.senddate || '-'}</StyledTableCell>
                    <StyledTableCell>{row.weight || '-'}</StyledTableCell>
                    <StyledTableCell>{row.send_price || '-'}</StyledTableCell>
                    <StyledTableCell>{row.send_status === 1 ? 'จัดส่งเรียบร้อยแล้ว' : '-'}</StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box display='flex' justifyContent='center' mt={2}>
            <Pagination
              count={Math.ceil(filteredRows.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color='primary'
            />
          </Box>
        </>
      )}

      {/* Snackbar for Notifications */}
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
    </div>
  )
}
