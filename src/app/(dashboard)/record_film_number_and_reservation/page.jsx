'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Button,
  styled,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  IconButton,
  Link,
  Snackbar,
  Alert,
  CircularProgress as MuiCircularProgress
} from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.1rem'
}))

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
  fontSize: '1.3rem',
  cursor: 'pointer'
}))

const UpdateByCell = styled(TableCell)(({ theme }) => ({
  maxWidth: '150px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontWeight: 'bold',
  fontSize: '1.1rem'
}))

const RecordFilmAndReservation = () => {
  const [universities, setUniversities] = useState([])
  const [filteredUniversities, setFilteredUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchParams = useSearchParams()
  const uni_id = searchParams.get('uni_id')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'fname', direction: 'ascending' })
  const router = useRouter()
  const [originalData, setOriginalData] = useState({})
  const [editedUniversities, setEditedUniversities] = useState({}) // State for tracking edits
  const [savingKeys, setSavingKeys] = useState([]) // State to track which rows are saving
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }) // Snackbar for feedback

  // Initialize originalData when universities data changes
  useEffect(() => {
    const initialData = {}
    universities.forEach(university => {
      const uniqueKey = `${university.id}-${university.booking_no}`
      initialData[uniqueKey] = {
        film_no: university.film_no,
        booking_no: university.booking_no
      }
    })
    setOriginalData(initialData)
  }, [universities])

  // Fetch universities data from API
  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true)
      try {
        let response = { data: { data: [] } }

        if (uni_id) {
          response = await axios.get(`/api/film-reservation`, {
            params: { uni_id: uni_id }
          })
          console.log('API GET response:', response.data) // เพิ่ม log เพื่อตรวจสอบข้อมูล
        }

        if (response.data.data.length === 0) {
          const storedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))

          if (storedUniversity && (!uni_id || storedUniversity.uni_id === parseInt(uni_id))) {
            response = await axios.get(`/api/film-reservation`, {
              params: { uni_id: storedUniversity.uni_id }
            })
          }
        }

        if (response.data.data && response.data.data.length > 0) {
          try {
            // เนื่องจาก API ตอนนี้ JOIN address กับ address_booking แล้ว แต่ละแถวมี booking_no เดียว
            // จึงไม่ต้องทำ flatMap หรือ split
            const processedData = response.data.data.map(university => ({
              ...university
            }))
            setUniversities(processedData)
            setFilteredUniversities(processedData)
            setTotalPages(Math.ceil(processedData.length / itemsPerPage))
          } catch (error) {
            console.error('Error processing data:', error)
            throw error // ให้ catch block ดักจับต่อไป
          }
        } else {
          setUniversities([])
          setFilteredUniversities([])
          setTotalPages(1)
        }

        setLoading(false)
      } catch (err) {
        console.error('Error in fetchUniversities:', err) // เพิ่ม log เพื่อตรวจสอบข้อผิดพลาด
        setError('Failed to fetch universities')
        setLoading(false)
      }
    }

    fetchUniversities()
  }, [uni_id, itemsPerPage])

  // Filter and sort universities based on searchTerm and sortConfig
  useEffect(() => {
    let results = universities.filter(university =>
      Object.values(university).some(
        value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )

    // Apply sorting
    results.sort((a, b) => {
      if (sortConfig.direction === 'ascending') {
        return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1
      } else {
        return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1
      }
    })

    setFilteredUniversities(results)
    setTotalPages(Math.ceil(results.length / itemsPerPage))
    setPage(1)
  }, [searchTerm, universities, sortConfig])

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleItemsPerPageChange = event => {
    setItemsPerPage(event.target.value)
    setPage(1)
  }

  const handleDeleteReservation = async (id, booking_no) => {
    try {
      await axios.delete(`/api/film-reservation`, {
        data: { id, booking_no } // Send as part of request body
      })
      console.log('Deleted successfully')
      // After successful deletion, refresh the data
      setUniversities(prev =>
        prev.filter(university => !(university.id === id && university.booking_no === booking_no))
      )
      setFilteredUniversities(prev =>
        prev.filter(university => !(university.id === id && university.booking_no === booking_no))
      )
      // Remove from editedUniversities if present
      const uniqueKey = `${id}-${booking_no}`
      setEditedUniversities(prev => {
        const updated = { ...prev }
        delete updated[uniqueKey]
        return updated
      })
      // Show success snackbar
      setSnackbar({ open: true, message: 'Reservation deleted successfully.', severity: 'success' })
    } catch (error) {
      console.error('Error deleting reservation:', error.response ? error.response.data : error.message)
      // Show error snackbar
      setSnackbar({ open: true, message: 'Failed to delete reservation.', severity: 'error' })
    }
  }

  const handleSearchChange = event => {
    setSearchTerm(event.target.value)
  }

  const handleSort = key => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }))
  }

  const handleEditChange = (uniqueKey, field, value) => {
    setEditedUniversities(prev => ({
      ...prev,
      [uniqueKey]: {
        ...prev[uniqueKey],
        [field]: value
      }
    }))
  }

  const handleSave = async uniqueKey => {
    const edited = editedUniversities[uniqueKey]
    if (!edited) return // Nothing to save

    setSavingKeys(prev => [...prev, uniqueKey]) // Add uniqueKey to savingKeys

    try {
      const [id, original_booking_no] = uniqueKey.split('-')

      const session = await getSession()
      const update_by = session?.user?.name || 'Unknown'

      // Get uni_id from sessionStorage or searchParams
      const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))
      const uni_id = selectedUniversity?.uni_id || searchParams.get('uni_id')

      // Find the current university data
      const currentUniversity = universities.find(u => u.id.toString() === id && u.booking_no === original_booking_no)
      if (!currentUniversity) {
        throw new Error('University not found')
      }

      // Merge edited data with existing data
      const film_no = edited.film_no !== undefined ? edited.film_no : currentUniversity.film_no
      const booking_no_new = edited.booking_no !== undefined ? edited.booking_no : currentUniversity.booking_no

      // Send both original_booking_no and new booking_no
      await axios.put('/api/film-reservation', {
        id: parseInt(id),
        original_booking_no,
        film_no,
        booking_no: booking_no_new,
        update_by,
        uni_id
      })
      console.log('Updated successfully')

      // Update the universities state with the new values
      setUniversities(prev =>
        prev.map(university =>
          university.id.toString() === id && university.booking_no === original_booking_no
            ? { ...university, film_no, booking_no: booking_no_new, update_by, update_date: new Date().toISOString() }
            : university
        )
      )

      // Remove the edited entry from editedUniversities
      setEditedUniversities(prev => {
        const updated = { ...prev }
        delete updated[uniqueKey]
        return updated
      })

      // Show success snackbar
      setSnackbar({ open: true, message: 'Reservation updated successfully.', severity: 'success' })
    } catch (error) {
      console.error('Error updating reservation:', error.response ? error.response.data : error.message)
      // Show error snackbar
      setSnackbar({ open: true, message: 'Failed to update reservation.', severity: 'error' })
    } finally {
      setSavingKeys(prev => prev.filter(savingKey => savingKey !== uniqueKey)) // Remove uniqueKey from savingKeys
    }
  }

  const handleViewDetails = id => {
    router.push(`/reservation_information?id=${id}`)
  }

  const paginatedUniversities = filteredUniversities.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto', p: 2 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Order List
      </Typography>
      {error && (
        <Typography color='error' align='center'>
          {error}
        </Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          label='Search'
          variant='outlined'
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: '300px' }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id='items-per-page-label'>Items per page</InputLabel>
          <Select
            labelId='items-per-page-label'
            value={itemsPerPage}
            label='Items per page'
            onChange={handleItemsPerPageChange}
          >
            {[8, 16, 24, 32].map(value => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='university table'>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell onClick={() => handleSort('fname')}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  ชื่อ-นามสกุล
                  <IconButton size='small' sx={{ color: 'white', ml: 1 }}>
                    {sortConfig.key === 'fname' &&
                      (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                  </IconButton>
                </Box>
              </StyledTableHeadCell>
              <StyledTableHeadCell onClick={() => handleSort('film_no')}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  เลขฟิล์ม
                  <IconButton size='small' sx={{ color: 'white', ml: 1 }}>
                    {sortConfig.key === 'film_no' &&
                      (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                  </IconButton>
                </Box>
              </StyledTableHeadCell>
              <StyledTableHeadCell onClick={() => handleSort('booking_no')}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  เลขใบจอง
                  <IconButton size='small' sx={{ color: 'white', ml: 1 }}>
                    {sortConfig.key === 'booking_no' &&
                      (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                  </IconButton>
                </Box>
              </StyledTableHeadCell>
              <StyledTableHeadCell onClick={() => handleSort('update_by')}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  Update By
                  <IconButton size='small' sx={{ color: 'white', ml: 1 }}>
                    {sortConfig.key === 'update_by' &&
                      (sortConfig.direction === 'ascending' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
                  </IconButton>
                </Box>
              </StyledTableHeadCell>
              <StyledTableHeadCell>จัดการ</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUniversities.length > 0 ? (
              paginatedUniversities.map(university => {
                const uniqueKey = `${university.id}-${university.booking_no}`
                const isEdited = editedUniversities[uniqueKey] !== undefined
                const editedData = editedUniversities[uniqueKey] || {}
                const isSaving = savingKeys.includes(uniqueKey)
                return (
                  <TableRow key={uniqueKey} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <StyledTableCell component='th' scope='row'>
                      <Link
                        href='#'
                        onClick={() => handleViewDetails(university.id)}
                        sx={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {`${university.fname || ''} ${university.lname || ''}`}
                      </Link>
                    </StyledTableCell>
                    <StyledTableCell>
                      <TextField
                        variant='outlined'
                        size='small'
                        value={editedData.film_no !== undefined ? editedData.film_no : university.film_no || ''}
                        onChange={e => handleEditChange(uniqueKey, 'film_no', e.target.value)}
                        onBlur={() => handleSave(uniqueKey)}
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} // Allow only numbers
                        fullWidth
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <TextField
                        variant='outlined'
                        size='small'
                        value={
                          editedData.booking_no !== undefined ? editedData.booking_no : university.booking_no || ''
                        }
                        onChange={e => handleEditChange(uniqueKey, 'booking_no', e.target.value)}
                        onBlur={() => handleSave(uniqueKey)}
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} // Allow only numbers
                        fullWidth
                      />
                    </StyledTableCell>

                    <UpdateByCell>{`${university.update_by || ''} ${
                      university.update_date ? new Date(university.update_date).toLocaleString() : ''
                    }`}</UpdateByCell>
                    <StyledTableCell>
                      {/* Optionally, show a loading spinner when saving */}
                      {isSaving && <MuiCircularProgress size={24} />}
                      <Button
                        variant='contained'
                        color='secondary'
                        onClick={() => handleDeleteReservation(university.id, university.booking_no)}
                        sx={{ ml: isSaving ? 1 : 0 }} // Add margin if spinner is present
                      >
                        ลบใบจอง
                      </Button>
                    </StyledTableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align='center'>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color='primary' />
      </Box>

      {/* Snackbar for user feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default RecordFilmAndReservation
