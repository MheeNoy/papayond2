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

// Import CheckIcon for tick marks
import CheckIcon from '@mui/icons-material/Check'

// Function to format date (if needed)
const formatDate = isoDateString => {
  if (!isoDateString || isoDateString === '-') return '-'
  const date = new Date(isoDateString)
  if (isNaN(date.getTime())) return '-'
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${date.getFullYear()}`
}

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
  const itemsPerPage = 10
  const [isLoading, setIsLoading] = useState(false)

  // Snackbar state variables
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  // Function to get uni_id from sessionStorage
  const getUniIdFromSession = () => {
    const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))
    return selectedUniversity ? selectedUniversity.uni_id : null
  }

  // Fetch data when the page loads
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

  // Search functionality
  const [searchData, setSearchData] = useState({
    booking_status: 'ดูทั้งหมด',
    booking_set: 'ทุกชุดที่สั่งจอง',
    additional: 'ทั้งหมด'
  })

  // Update handleSearch to accept search data as an argument
  const handleSearch = updatedSearchData => {
    if (!Array.isArray(rows)) {
      console.error('rows is not an array')
      setSnackbarMessage('เกิดข้อผิดพลาดในการค้นหา')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return
    }

    const filtered = rows.filter(row => {
      // Filter by booking set
      let matchesBookingSet = true
      if (updatedSearchData.booking_set !== 'ทุกชุดที่สั่งจอง') {
        matchesBookingSet = row.booking_set == updatedSearchData.booking_set
      }

      // Filter by additional options
      let matchesAdditional = true
      if (updatedSearchData.additional === 'เฉพาะชุด') {
        // สำหรับ "เฉพาะชุด" ไม่ต้องกรองเพิ่มเติม
        matchesAdditional = true
      } else if (updatedSearchData.additional === 'เฉพาะภาพหมู่กรอบ') {
        matchesAdditional = row.add_ademgo == 1
      } else if (updatedSearchData.additional === 'เฉพาะงาช้าง') {
        matchesAdditional = row.chang_eleph == 1
      }

      return matchesBookingSet && matchesAdditional
    })

    // Additional filter by booking_status
    let statusFiltered = filtered
    if (updatedSearchData.booking_status === 'มีการจอง') {
      statusFiltered = filtered.filter(row => row.booking_no != null && row.booking_no !== '')
    } else if (updatedSearchData.booking_status === 'ไม่มีการจอง') {
      statusFiltered = filtered.filter(row => row.booking_no == null || row.booking_no === '')
    }

    setFilteredRows(statusFiltered)
    setCurrentPage(1)
  }

  // Function to handle dropdown change and trigger search immediately
  const handleInputChange = e => {
    const { name, value } = e.target
    const updatedSearchData = { ...searchData, [name]: value }
    setSearchData(updatedSearchData)

    // Trigger handleSearch whenever any filter changes
    handleSearch(updatedSearchData)
  }

  // Calculate items to display per page
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = Array.isArray(filteredRows) ? filteredRows.slice(indexOfFirstItem, indexOfLastItem) : []

  // Function to change pages
  const handlePageChange = (event, value) => {
    setCurrentPage(value)
  }

  // Function to print the report with custom content
  const handlePrintReport = () => {
    // ดึงข้อมูลจาก sessionStorage
    const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))
    const universityName = selectedUniversity ? selectedUniversity.uniname : 'ไม่พบข้อมูลมหาวิทยาลัย'
    const universityYear = selectedUniversity ? selectedUniversity.uni_year : 'ไม่พบปีการศึกษา'

    // ตรวจสอบค่าของ searchData.booking_set
    const bookingSetText = searchData.booking_set === 'ทุกชุดที่สั่งจอง' ? 'ทุกชุด' : `ชุดที่ ${searchData.booking_set}`

    // กรองข้อมูลสำหรับพิมพ์รายงาน โดยรวมการกรอง booking_status
    const printItems = rows.filter(row => {
      let matchesBookingStatus = true
      if (searchData.booking_status === 'มีการจอง') {
        matchesBookingStatus = row.booking_no != null && row.booking_no !== ''
      } else if (searchData.booking_status === 'ไม่มีการจอง') {
        matchesBookingStatus = row.booking_no == null || row.booking_no === ''
      }

      let matchesBookingSet = true
      if (searchData.booking_set !== 'ทุกชุดที่สั่งจอง') {
        matchesBookingSet = row.booking_set == searchData.booking_set
      }

      let matchesAdditional = true
      if (searchData.additional === 'เฉพาะชุด') {
        matchesAdditional = true
      } else if (searchData.additional === 'เฉพาะภาพหมู่กรอบ') {
        matchesAdditional = row.add_ademgo == 1
      } else if (searchData.additional === 'เฉพาะงาช้าง') {
        matchesAdditional = row.chang_eleph == 1
      }

      return matchesBookingStatus && matchesBookingSet && matchesAdditional
    })

    // สร้างส่วนหัวของตารางตามค่าที่เลือกใน searchData.additional
    let tableHeaders = `
      <tr>
        <th>ลำดับที่</th>
        <th>เลขฟิล์ม</th>
        <th>เลขใบจอง</th>
        <th>ชุดที่จอง</th>
    `

    if (searchData.additional === 'เฉพาะชุด') {
      // ถ้าเลือก "เฉพาะชุด" แสดงแค่ "ลำดับที่", "เลขฟิล์ม", "เลขใบจอง", "ชุดที่จอง"
      tableHeaders += `</tr>`
    } else if (searchData.additional === 'เฉพาะภาพหมู่กรอบ') {
      // ถ้าเลือก "เฉพาะภาพหมู่กรอบ" แสดงคอลัมน์ "หมู่กรอบ" เพิ่มเติม
      tableHeaders += `<th>หมู่กรอบ</th></tr>`
    } else if (searchData.additional === 'เฉพาะงาช้าง') {
      // ถ้าเลือก "เฉพาะงาช้าง" แสดงคอลัมน์ "สีงาช้าง" เพิ่มเติม
      tableHeaders += `<th>สีงาช้าง</th></tr>`
    } else {
      // แสดงทุกคอลัมน์
      tableHeaders += `<th>หมู่กรอบ</th><th>สีงาช้าง</th></tr>`
    }

    // สร้างเนื้อหาของตารางตามค่าที่เลือกใน searchData.additional
    const tableRows = printItems
      .map((row, index) => {
        let rowContent = `
          <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td style="text-align: center;">${row.film_no || '-'}</td>
            <td style="text-align: center;">${row.booking_no || '-'}</td>
            <td style="text-align: center;">${row.booking_set || '-'}</td>
        `

        if (searchData.additional === 'เฉพาะภาพหมู่กรอบ' || searchData.additional === 'ทั้งหมด') {
          rowContent += `<td style="text-align: center;">${row.add_ademgo == 1 ? '✔️' : '-'}</td>`
        }

        if (searchData.additional === 'เฉพาะงาช้าง' || searchData.additional === 'ทั้งหมด') {
          rowContent += `<td style="text-align: center;">${row.chang_eleph == 1 ? '✔️' : '-'}</td>`
        }

        rowContent += `</tr>`
        return rowContent
      })
      .join('')

    const printContent = `
      <h2 style="text-align: center;">รายงานชุดและเลขฟิล์ม</h2>
      <p style="text-align: center;">ปีการศึกษา: ${universityYear}</p>
      <p style="text-align: center;">${universityName}</p>
      <p style="text-align: center;">เลขชุดที่สั่งจอง: ${bookingSetText}</p>
      <p style="text-align: center;">(${printItems.length} รายการ)</p>
      <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          ${tableHeaders}
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `

    const printWindow = window.open('', '_blank')
    printWindow.document.open()
    printWindow.document.write(`
      <html>
        <head>
          <title>รายงานหมายเลขพัสดุ</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2, p { text-align: center; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
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
        รายงานหมายเลขพัสดุ
      </Typography>

      {/* Search Fields */}
      <Box display='flex' flexWrap='wrap' alignItems='center' mb={2}>
        {/* Booking Status */}
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
        {/* Booking Set */}
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
            <MenuItem value='ทุกชุดที่สั่งจอง'>ทุกชุดที่สั่งจอง</MenuItem>
            {[...Array(15)].map((_, index) => (
              <MenuItem key={index + 1} value={index + 1}>
                ชุดที่ {index + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Additional Options */}
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
        {/* Print Report Button */}
        <Button variant='contained' color='primary' onClick={handlePrintReport} sx={{ mb: 2, mr: 2 }}>
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
                  <StyledTableHeadCell>ลำดับ</StyledTableHeadCell>
                  <StyledTableHeadCell>เลขฟิล์ม</StyledTableHeadCell>
                  <StyledTableHeadCell>เลขใบจอง</StyledTableHeadCell>
                  <StyledTableHeadCell>ชุดที่จอง</StyledTableHeadCell>
                  {/* แสดงคอลัมน์ "หมู่กรอบ" เมื่อไม่ใช่ "เฉพาะชุด" และไม่ใช่ "เฉพาะงาช้าง" */}
                  {searchData.additional !== 'เฉพาะชุด' && searchData.additional !== 'เฉพาะงาช้าง' && (
                    <StyledTableHeadCell>หมู่กรอบ</StyledTableHeadCell>
                  )}
                  {/* แสดงคอลัมน์ "สีงาช้าง" เมื่อเลือกเป็น "ทั้งหมด" หรือ "เฉพาะงาช้าง" */}
                  {(searchData.additional === 'ทั้งหมด' || searchData.additional === 'เฉพาะงาช้าง') && (
                    <StyledTableHeadCell>สีงาช้าง</StyledTableHeadCell>
                  )}
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
                      {/* แสดงคอลัมน์ "หมู่กรอบ" เมื่อไม่ใช่ "เฉพาะชุด" และไม่ใช่ "เฉพาะงาช้าง" */}
                      {searchData.additional !== 'เฉพาะชุด' && searchData.additional !== 'เฉพาะงาช้าง' && (
                        <StyledTableCell>{row.add_ademgo == 1 ? <CheckIcon color='success' /> : '-'}</StyledTableCell>
                      )}
                      {/* แสดงคอลัมน์ "สีงาช้าง" เมื่อเลือกเป็น "ทั้งหมด" หรือ "เฉพาะงาช้าง" */}
                      {(searchData.additional === 'ทั้งหมด' || searchData.additional === 'เฉพาะงาช้าง') && (
                        <StyledTableCell>{row.chang_eleph == 1 ? <CheckIcon color='success' /> : '-'}</StyledTableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <StyledTableCell
                      colSpan={
                        searchData.additional === 'ทั้งหมด'
                          ? 5
                          : searchData.additional === 'เฉพาะงาช้าง'
                            ? 5
                            : searchData.additional === 'เฉพาะชุด'
                              ? 4
                              : 5
                      }
                      align='center'
                    >
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

      {/* Custom Print Styles */}
      <style jsx>{`
        @media print {
          /* Hide non-printable elements */
          button,
          input,
          select,
          .MuiPagination-root,
          .MuiSnackbar-root {
            display: none;
          }

          /* Adjust page margins */
          @page {
            margin: 20mm;
          }

          /* Adjust table styles for print */
          .MuiTableContainer-root {
            box-shadow: none;
          }

          /* Ensure table headers repeat on each page */
          thead {
            display: table-header-group;
          }

          /* Adjust font sizes for print */
          .MuiTableCell-root {
            font-size: 12pt;
          }

          /* Adjust styles for printing the title */
          .MuiTypography-root {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  )
}
