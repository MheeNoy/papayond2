'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { getSession } from 'next-auth/react'
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  OutlinedInput,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TextField,
  Alert,
  Snackbar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { styled } from '@mui/material/styles'
import PhotoIcon from '@mui/icons-material/Photo'
import ColorLensIcon from '@mui/icons-material/ColorLens'

// การสร้าง Styled Components
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

const FacultyCell = styled(TableCell)(({ theme }) => ({
  maxWidth: '150px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontWeight: 'bold',
  fontSize: '1.1rem'
}))

const ReservationInformation = () => {
  const searchParams = useSearchParams()
  const idFromUrl = searchParams.get('id') // This is address_id
  const [addressData, setAddressData] = useState({})
  const [bookingResponse, setBookingResponse] = useState({})
  const [signsData, setSignsData] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchFilm, setSearchFilm] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [bookingNumbers, setBookingNumbers] = useState([])
  const [selectedBookingNo, setSelectedBookingNo] = useState('')
  const [openSnackbar, setOpenSnackbar] = useState(false) // สถานะการเปิด Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState('') // ข้อความ Snackbar
  const [snackbarSeverity, setSnackbarSeverity] = useState('success') // ระดับการแจ้งเตือน
  const [isAddingNewBooking, setIsAddingNewBooking] = useState(false) // state สำหรับการเพิ่มใบจองใหม่
  const [newBookingNo, setNewBookingNo] = useState('')

  const [sets, setSets] = useState(
    Array.from({ length: 15 }, (_, index) => ({
      name: `ชุดที่ ${index + 1}`,
      quantity: 0,
      addon1: false,
      addon2: false,
      disabled: true // เริ่มต้นด้วย disabled ทั้งหมด
    }))
  )

  const [activeTab, setActiveTab] = useState('address')

  // New states for dropdown data
  const [provinces, setProvinces] = useState([])
  const [amphurs, setAmphurs] = useState([])
  const [districts, setDistricts] = useState([])
  const [postcodes, setPostcodes] = useState([])

  const [orderid, setOrderid] = useState(0) // เพิ่ม state สำหรับ orderid

  const router = useRouter() // ใช้ useRouter จาก 'next/navigation'

  // Function สำหรับดึงชื่อผู้ใช้จาก session
  const getSessionUser = async () => {
    const session = await getSession()
    return session?.user?.name || 'Unknown'
  }

  // ฟังก์ชันสำหรับแสดง Snackbar
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setOpenSnackbar(true)
  }

  // ฟังก์ชันสำหรับปิด Snackbar
  const handleSnackbarClose = () => {
    setOpenSnackbar(false)
  }

  // ฟังก์ชัน handleSearch ถูกประกาศก่อนการใช้งาน
  const handleSearch = async () => {
    console.log('Searching for:', searchFilm)
    if (!searchFilm.trim()) {
      showSnackbar('กรุณากรอกเลขฟิล์มที่ต้องการค้นหา', 'warning')
      return
    }

    try {
      // ดึงข้อมูล selectedUniversity จาก sessionStorage
      const selectedUniversityString = sessionStorage.getItem('selectedUniversity')
      if (!selectedUniversityString) {
        showSnackbar('ไม่พบข้อมูล selectedUniversity ใน session', 'error')
        return
      }

      const selectedUniversity = JSON.parse(selectedUniversityString)
      const uni_id = selectedUniversity.uni_id

      if (!uni_id) {
        showSnackbar('ไม่พบ uni_id ที่จำเป็นใน selectedUniversity', 'error')
        return
      }

      // เรียกใช้ API สำหรับการค้นหา address
      const response = await axios.get('/api/reservation/address/search', {
        params: { film_no: searchFilm.trim(), uni_id }
      })

      const newId = response.data.id

      if (newId) {
        // นำทางไปยัง URL ใหม่ที่มี address.id ใหม่
        router.push(`/reservation_information?id=${newId}`)
      } else {
        showSnackbar('ไม่พบข้อมูลที่ต้องการ', 'error')
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          showSnackbar('ไม่พบเลขฟิล์มที่ตรงกับมหาวิทยาลัยนี้', 'error')
        } else if (error.response.status === 400) {
          showSnackbar('พารามิเตอร์ไม่ถูกต้อง', 'error')
        } else {
          showSnackbar('เกิดข้อผิดพลาดในการค้นหา', 'error')
        }
      } else {
        showSnackbar('เกิดข้อผิดพลาดในการค้นหา', 'error')
      }
    }
  }

  // Function to fetch booking numbers via API
  const fetchBookingNumbers = async address_id => {
    try {
      const response = await axios.post('/api/reservation/booking', { address_id })
      return response.data.booking_numbers
    } catch (error) {
      console.error('Error fetching booking numbers:', error)
      throw error
    }
  }

  // ฟังก์ชัน fetchSelectedSets ที่ปรับปรุงแล้ว
  const fetchSelectedSets = async booking_no => {
    try {
      const resservationData = JSON.parse(sessionStorage.getItem('resservationData'))
      const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))

      const id = resservationData?.id
      const uni_id = selectedUniversity?.uni_id

      if (!id || !uni_id || !booking_no) {
        console.error('Missing required data: id, uni_id, or booking_no')
        setOrderid(0)
        setSets(prevSets => prevSets.map(set => ({ ...set, quantity: 0, addon1: false, addon2: false })))
        return
      }

      setOrderid(id) // เซ็ตค่า orderid จาก resservationData.id

      const response = await axios.post('/api/get-selected-sets', {
        id,
        uni_id,
        booking_no
      })

      console.log('Response from get-selected-sets:', response.data)

      const selectedSetsData = response.data

      setSets(prevSets =>
        prevSets.map((set, index) => {
          const matchingSet = selectedSetsData.find(item => parseInt(item.booking_set) === index + 1)

          if (matchingSet) {
            return {
              ...set,
              quantity: matchingSet.amount,
              addon1: matchingSet.add_ademgo === 1,
              addon2: matchingSet.chang_eleph === 1
              // ไม่เปลี่ยนแปลง disabled จาก fetchGroupData
            }
          }
          // ถ้าไม่มีชุดที่ตรงกันสำหรับ booking_no นี้ ให้ตั้งค่าด้วย 0 และไม่เปลี่ยนแปลง disabled
          return { ...set, quantity: 0, addon1: false, addon2: false }
        })
      )
    } catch (error) {
      console.error('Error fetching selected sets:', error)
      // ในกรณีเกิดข้อผิดพลาด ให้ตั้งค่าชุดทั้งหมดเป็น disabled
      setOrderid(0)
      setSets(prevSets => prevSets.map(set => ({ ...set, quantity: 0, addon1: false, addon2: false })))
    }
  }

  // ฟังก์ชันสำหรับดึงข้อมูลที่อยู่การจัดส่ง
  const fetchAddressData = useCallback(async () => {
    if (!idFromUrl) {
      setAddressData({})
      setBookingResponse({})
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await axios.get(`/api/reservation/address?id=${idFromUrl}`)
      setAddressData(response.data.addressData || {})
      setFaculties(response.data.addressData.faculties || [])
      setSelectedFaculty(response.data.addressData.facid || '')
      setSearchFilm(response.data.addressData.film_no || '')
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [idFromUrl])

  // ฟังก์ชันสำหรับดึงข้อมูลกลุ่มชุดและชุดที่เลือก
  const fetchGroupAndSelectedSets = useCallback(async () => {
    await fetchGroupData()
    await fetchSelectedSetsInitial()
  }, [])

  // ฟังก์ชัน fetchGroupData
  const fetchGroupData = async () => {
    const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))
    const uni_id = selectedUniversity?.uni_id

    if (!uni_id) return

    try {
      const response = await axios.post('/api/pricegroup', { uni_id })
      const groupData = response.data

      setSets(prevSets =>
        prevSets.map((set, index) => {
          const group = groupData.find(g => g.group_id === index + 1)
          return {
            ...set,
            disabled: !(group && group.group_active === 1)
          }
        })
      )
    } catch (error) {
      console.error('Error fetching group data:', error)
    }
  }

  // ฟังก์ชัน fetchSelectedSetsInitial
  const fetchSelectedSetsInitial = async () => {
    try {
      const resservationData = JSON.parse(sessionStorage.getItem('resservationData'))
      const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))

      const id = resservationData?.id
      const booking_no = resservationData?.booking_no
      const uni_id = selectedUniversity?.uni_id

      if (!id || !uni_id || !booking_no) {
        console.error('Missing required data from sessionStorage')
        return
      }

      // Initial fetchSelectedSets with booking_no from sessionStorage
      await fetchSelectedSets(booking_no)
    } catch (error) {
      console.error('Error fetching selected sets:', error)
    }
  }

  // ฟังก์ชันสำหรับดึง signsData แยกต่างหาก
  const fetchSignsData = async () => {
    try {
      const response = await axios.get('/api/reservation/signs') // เปลี่ยน URL ให้ตรงกับ API ของคุณ
      setSignsData(response.data.signs || [])
    } catch (error) {
      console.error('Error fetching signs data:', error)
      setError('Failed to fetch signs data')
    }
  }

  useEffect(() => {
    fetchGroupAndSelectedSets()
  }, [fetchGroupAndSelectedSets])

  useEffect(() => {
    fetchAddressData()
  }, [fetchAddressData])

  // ใช้ useEffect เพื่อดึง signsData เมื่อคอมโพเนนต์ถูก mount
  useEffect(() => {
    fetchSignsData()
  }, [])

  // เพิ่ม useEffect สำหรับการดึง bookingNumbers หลังจาก fetchData เรียบร้อย
  useEffect(() => {
    const getBookingNumbers = async () => {
      try {
        const bookingNumbersFromAPI = await fetchBookingNumbers(idFromUrl)
        setBookingNumbers(bookingNumbersFromAPI)
        if (bookingNumbersFromAPI.length > 0) {
          setSelectedBookingNo(bookingNumbersFromAPI[0]) // ตั้งค่าเริ่มต้นเป็นค่าแรก
        }
      } catch (error) {
        setError('Failed to fetch booking numbers')
      }
    }

    if (idFromUrl) {
      getBookingNumbers()
    }
  }, [idFromUrl])

  // เมื่อ selectedBookingNo เปลี่ยนแปลง ให้เรียก API เพื่อดึง bookingResponse
  useEffect(() => {
    const fetchBookingResponse = async () => {
      if (!selectedBookingNo) return

      try {
        // เรียก API เพื่อดึง bookingResponse ตาม address_id และ booking_no
        const response = await axios.post('/api/reservation/booking', {
          address_id: idFromUrl,
          booking_no: selectedBookingNo
        })

        setBookingResponse(response.data[0] || {})
      } catch (error) {
        console.error('Failed to fetch booking data:', error)
        setBookingResponse({})
      }
    }

    fetchBookingResponse()
  }, [selectedBookingNo, idFromUrl])

  // เพิ่มการสร้างฟังก์ชัน actionPriceGroup
  const actionPriceGroup = async (action, data) => {
    try {
      console.log('Sending to API:', { action, ...data }) // เพิ่มการล็อกข้อมูลที่ส่งไปยัง API
      const response = await axios.post('/api/action-price-group', { action, ...data })
      return response.data
    } catch (error) {
      console.error(`Error during ${action}:`, error)
      throw error
    }
  }

  const handleSetChange = async (index, field, value) => {
    setSets(prevSets => prevSets.map((set, i) => (i === index ? { ...set, [field]: value } : set)))

    const currentSet = sets[index]
    const booking_no = selectedBookingNo
    const booking_set = index + 1
    const amount = field === 'quantity' ? value : currentSet.quantity
    const add_ademgo = field === 'addon1' ? (value ? 1 : 0) : currentSet.addon1 ? 1 : 0
    const chang_eleph = field === 'addon2' ? (value ? 1 : 0) : currentSet.chang_eleph ? 1 : 0
    const uni_id = addressData.uni_id
    const film_no = searchFilm

    try {
      if (field === 'quantity') {
        if (value > 0) {
          // เช็คว่าชุดมีอยู่แล้วหรือไม่
          const checkResponse = await actionPriceGroup('check', { booking_no, booking_set })
          const exists = checkResponse.exists

          if (exists) {
            // อัปเดตชุดที่มีอยู่
            const updateData = { booking_no, booking_set, amount, add_ademgo, chang_eleph }
            const updateResponse = await actionPriceGroup('update', updateData)
            if (updateResponse.success) {
              showSnackbar('อัปเดตชุดสำเร็จ', 'success')
            } else {
              showSnackbar(updateResponse.message || 'อัปเดตชุดไม่สำเร็จ', 'error')
            }
          } else {
            // เพิ่มชุดใหม่
            const addData = {
              booking_no,
              booking_set,
              amount,
              typeofsend: bookingResponse.typeofsend, // เปลี่ยนจาก send_type เป็น typeofsend ตามข้อมูลที่มี
              uni_id,
              orderid: orderid || 0, // ใช้ orderid จาก state
              add_ademgo,
              chang_eleph,
              film_no
            }
            const addResponse = await actionPriceGroup('add', addData)
            if (addResponse.success) {
              showSnackbar('เพิ่มชุดสำเร็จ', 'success')
            } else {
              showSnackbar(addResponse.message || 'เพิ่มชุดไม่สำเร็จ', 'error')
            }
          }
        } else {
          // ลบชุดถ้าปริมาณเป็น 0
          const deleteData = { booking_no, booking_set }
          const deleteResponse = await actionPriceGroup('delete', deleteData)
          if (deleteResponse.success) {
            showSnackbar('ลบชุดสำเร็จ', 'success')
          } else {
            showSnackbar(deleteResponse.message || 'ลบชุดไม่สำเร็จ', 'error')
          }
        }
      } else if (field === 'addon1' || field === 'addon2') {
        if (sets[index].quantity === 0) {
          // หากไม่มีจำนวน ไม่อนุญาตให้เพิ่มอแด็ม
          showSnackbar('ต้องมีจำนวนก่อนเพิ่มอแด็ม', 'warning')
          return
        }
        // อัปเดตอแด็ม
        const updateData = { booking_no, booking_set, amount, add_ademgo, chang_eleph }
        const updateResponse = await actionPriceGroup('update', updateData)
        if (updateResponse.success) {
          showSnackbar('อัปเดตอแด็มสำเร็จ', 'success')
        } else {
          showSnackbar(updateResponse.message || 'อัปเดตอแด็มไม่สำเร็จ', 'error')
        }
      }
    } catch (error) {
      console.error('Error handling set change:', error)
      showSnackbar('เกิดข้อผิดพลาดในการอัปเดตชุด', 'error')
    }
  }

  const handleTabChange = tab => {
    setActiveTab(tab)
  }

  const handleAddressChange = (field, value) => {
    setAddressData(prev => ({ ...prev, [field]: value }))
  }

  const handleBookingChange = (field, value) => {
    if (field === 'province') {
      setBookingResponse(prev => ({ ...prev, [field]: value, amphur: '', tumbol: '', zip: '' }))
    } else if (field === 'amphur') {
      setBookingResponse(prev => ({ ...prev, [field]: value, tumbol: '', zip: '' }))
    } else if (field === 'tumbol') {
      setBookingResponse(prev => ({ ...prev, [field]: value, zip: '' }))
    } else {
      setBookingResponse(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSaveNewBooking = async () => {
    if (newBookingNo) {
      try {
        const response = await axios.post('/api/reservation/booking/create', {
          address_id: idFromUrl,
          uni_id: addressData.uni_id, // เพิ่ม uni_id จากข้อมูล addressData
          film_no: searchFilm, // เพิ่ม film_no จากข้อมูล searchFilm
          booking_no: newBookingNo
        })

        if (response.data.success) {
          setBookingNumbers(prev => [...prev, newBookingNo])
          setSelectedBookingNo(newBookingNo)
          setIsAddingNewBooking(false)
          setNewBookingNo('')
          showSnackbar('บันทึกใบจองใหม่สำเร็จ', 'success')
        } else {
          showSnackbar('บันทึกใบจองใหม่ล้มเหลว', 'error')
        }
      } catch (error) {
        console.error('Failed to save new booking:', error)
        showSnackbar('เกิดข้อผิดพลาดในการบันทึกใบจองใหม่', 'error')
      }
    }
  }

  const handleCancelAddBooking = () => {
    setIsAddingNewBooking(false)
    setNewBookingNo('')
  }

  const handleAddNewBooking = () => {
    setIsAddingNewBooking(true)
  }

  const handleSaveBooking = async () => {
    try {
      const update_by = await getSessionUser()
      const bookingData = {
        ...bookingResponse,
        id: idFromUrl,
        booking_no: selectedBookingNo, // เพิ่ม booking_no
        update_by,
        update_date: new Date().toISOString()
      }

      const response = await axios.post('/api/reservation/booking/updateBooking', bookingData)

      if (response.data.success) {
        showSnackbar('Booking data saved successfully', 'success')
      } else {
        showSnackbar(response.data.error || 'Failed to save booking data', 'error')
      }
    } catch (error) {
      console.error('Error saving booking data:', error)
      showSnackbar('Error saving booking data:', 'error')
    }
  }

  const handleLogData = async () => {
    console.log('Search Film:', searchFilm) // ตรวจสอบค่า
    try {
      const update_by = await getSessionUser()
      const addressDataToSend = {
        id: idFromUrl,
        ...addressData,
        film_no: searchFilm,
        update_by,
        update_date: new Date().toISOString()
      }

      console.log('Address Data to Send:', addressDataToSend) // ตรวจสอบ payload
      const response = await axios.post('/api/reservation/address/updateAddress', addressDataToSend)

      if (response.data.success) {
        showSnackbar('Address data saved successfully', 'success')
      } else {
        showSnackbar('Failed to save address data', 'error')
      }
    } catch (error) {
      console.error('Error saving address data:', error)
      showSnackbar('Error saving address data:', 'error')
    }
  }

  const handleEducationChange = field => {
    setAddressData(prev => ({
      ...prev,
      educ1: field === 'educ1' ? 'Y' : 'N',
      educ2: field === 'educ2' ? 'Y' : 'N',
      educ3: field === 'educ3' ? 'Y' : 'N',
      educ4: field === 'educ4' ? 'Y' : 'N'
    }))
  }

  const renderAddressForm = () => (
    <Paper elevation={3} sx={{ p: 2, mb: 2, width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth variant='outlined'>
            <InputLabel>Search Film</InputLabel>
            <OutlinedInput
              value={searchFilm}
              onChange={e => setSearchFilm(e.target.value)}
              endAdornment={
                <Button variant='contained' onClick={handleSearch}>
                  Search
                </Button>
              }
              label='Search Film'
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant='outlined'>
            <InputLabel>คำนำหน้าชื่อ</InputLabel>
            <Select
              value={addressData.signs_id || ''}
              onChange={e => handleAddressChange('signs_id', e.target.value)}
              label='คำนำหน้าชื่อ'
            >
              {signsData.map(sign => (
                <MenuItem key={sign.id} value={sign.id}>
                  {sign.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='ชื่อ (ผู้รับปริญญา)'
            value={addressData.fname || ''}
            onChange={e => handleAddressChange('fname', e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='สกุล'
            value={addressData.lname || ''}
            onChange={e => handleAddressChange('lname', e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography>ปริญญา</Typography>
          <FormControlLabel
            control={<Checkbox checked={addressData.educ1 === 'Y'} onChange={() => handleEducationChange('educ1')} />}
            label='ตรี'
          />
          <FormControlLabel
            control={<Checkbox checked={addressData.educ2 === 'Y'} onChange={() => handleEducationChange('educ2')} />}
            label='โท'
          />
          <FormControlLabel
            control={<Checkbox checked={addressData.educ3 === 'Y'} onChange={() => handleEducationChange('educ3')} />}
            label='เอก'
          />
          <FormControlLabel
            control={<Checkbox checked={addressData.educ4 === 'Y'} onChange={() => handleEducationChange('educ4')} />}
            label='อื่นๆ'
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>คณะ</InputLabel>
            <Select
              value={selectedFaculty}
              onChange={e => {
                setSelectedFaculty(e.target.value)
                handleAddressChange('facid', e.target.value)
              }}
              label='คณะ'
            >
              {faculties.map(faculty => (
                <MenuItem key={faculty.facid} value={faculty.facid}>
                  {faculty.facuname}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='เบอร์โทร'
            value={addressData.tel || ''}
            onChange={e => handleAddressChange('tel', e.target.value)}
            onInput={e => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography className='mb-2'>ตำแหน่งรูปหมู่</Typography>
          {[1, 2, 3].map(row => (
            <Grid container spacing={2} alignItems='center' key={row} sx={{ mb: 1 }}>
              {/* แสดงข้อความรอบ */}
              <Grid item xs={1.5}>
                <Typography variant='subtitle2' color='textSecondary'>{`รอบที่${row}`}</Typography>
              </Grid>
              {/* แสดง TextField 3 ช่องสำหรับแต่ละรอบ */}
              {[1, 2, 3].map(col => (
                <Grid item xs={3.5} key={`${row}-${col}`}>
                  <TextField
                    fullWidth
                    value={addressData[`posiphoto_${(row - 1) * 3 + col}`] || ''}
                    onChange={e => handleAddressChange(`posiphoto_${(row - 1) * 3 + col}`, e.target.value)}
                  />
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
        <Grid item xs={12}>
          <Button onClick={handleLogData} variant='contained' color='primary' fullWidth>
            บันทึกข้อมูล
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='caption' color='textSecondary' align='center' display='block'>
            เลขฟิล์ม Update by: {addressData.update_by}{' '}
            {addressData.update_date &&
              new Date(addressData.update_date).toLocaleString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  )

  const renderBookingForm = () => (
    <Paper elevation={3} sx={{ p: 2, mb: 2, width: '100%' }}>
      <Typography variant='h5' gutterBottom>
        ข้อมูลการจอง
      </Typography>
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='ชื่อผู้รับของ'
              value={bookingResponse.name_for_rec || ''}
              onChange={e => handleBookingChange('name_for_rec', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label='บ้านเลขที่/หมู่บ้าน'
              value={bookingResponse.addno || ''}
              onChange={e => handleBookingChange('addno', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='หมู่ที่'
              value={bookingResponse.moo || ''}
              onChange={e => handleBookingChange('moo', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='ซอย'
              value={bookingResponse.soi || ''}
              onChange={e => handleBookingChange('soi', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='ถนน'
              value={bookingResponse.road || ''}
              onChange={e => handleBookingChange('road', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>จังหวัด</InputLabel>
              <Select
                value={bookingResponse.province || ''}
                onChange={e => handleBookingChange('province', e.target.value)}
                label='จังหวัด'
              >
                {provinces.map(province => (
                  <MenuItem key={province.PROVINCE_ID} value={province.PROVINCE_ID}>
                    {province.PROVINCE_NAME}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth disabled={!bookingResponse.province}>
              <InputLabel>อำเภอ/เขต</InputLabel>
              <Select
                value={bookingResponse.amphur || ''}
                onChange={e => handleBookingChange('amphur', e.target.value)}
                label='อำเภอ/เขต'
              >
                {amphurs.map(amphur => (
                  <MenuItem key={amphur.AMPHUR_ID} value={amphur.AMPHUR_ID}>
                    {amphur.AMPHUR_NAME}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth disabled={!bookingResponse.amphur}>
              <InputLabel>ตำบล/แขวง</InputLabel>
              <Select
                value={bookingResponse.tumbol || ''}
                onChange={e => handleBookingChange('tumbol', e.target.value)}
                label='ตำบล/แขวง'
              >
                {districts.map(district => (
                  <MenuItem key={district.DISTRICT_ID} value={district.DISTRICT_ID}>
                    {district.DISTRICT_NAME}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth disabled={!bookingResponse.tumbol}>
              <InputLabel>รหัสไปรษณีย์</InputLabel>
              <Select
                value={bookingResponse.zip || ''}
                onChange={e => handleBookingChange('zip', e.target.value)}
                label='รหัสไปรษณีย์'
              >
                {postcodes.map(postcode => (
                  <MenuItem key={postcode.POST_CODE} value={postcode.POST_CODE}>
                    {postcode.POST_CODE}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='โทร'
              value={bookingResponse.tel || ''}
              onChange={e => handleBookingChange('tel', e.target.value)}
              onInput={e => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='Email'
              value={bookingResponse.email || ''}
              onChange={e => handleBookingChange('email', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='Line ID'
              value={bookingResponse.lineid || ''}
              onChange={e => handleBookingChange('lineid', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>จัดส่งหรือรับเอง</InputLabel>
              <Select
                value={bookingResponse.typeofsend || ''}
                onChange={e => handleBookingChange('typeofsend', e.target.value)}
                label='จัดส่งหรือรับเอง'
              >
                <MenuItem value={2}>จัดส่ง</MenuItem>
                <MenuItem value={1}>รับเอง</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button onClick={handleSaveBooking} variant='contained' color='primary' fullWidth>
              บันทึกข้อมูลที่อยู่การจัดส่ง
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='caption' color='textSecondary' align='center' display='block'>
              เลขใบจอง Update by: {bookingResponse.update_by}{' '}
              {bookingResponse.update_date &&
                new Date(bookingResponse.update_date).toLocaleString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
            </Typography>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )

  const renderSetForm = () => (
    <Paper elevation={3} sx={{ p: 2, mb: 2, width: '100%' }}>
      <Typography variant='h5' gutterBottom>
        แบบชุด
      </Typography>
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={3}>
          <Typography variant='subtitle1' fontWeight='bold'>
            เลือกชุด
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant='subtitle1' fontWeight='bold'>
            จำนวน
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography variant='subtitle1' fontWeight='bold'>
            หน่วย
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography variant='subtitle1' fontWeight='bold'>
            กรอบอเด็มโก้
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography variant='subtitle1' fontWeight='bold'>
            กรอบงาช้าง
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        {sets.map((set, index) => (
          <Grid container item spacing={2} alignItems='center' key={index}>
            <Grid item xs={3}>
              <Checkbox
                checked={set.quantity > 0}
                onChange={e => handleSetChange(index, 'quantity', e.target.checked ? 1 : 0)}
                disabled={set.disabled} // ปิดการใช้งานตามสถานะจาก API
              />
              <Typography>{set.name}</Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                type='number'
                inputProps={{ min: 0 }}
                value={set.quantity}
                onChange={e => handleSetChange(index, 'quantity', parseInt(e.target.value) || 0)}
                disabled={set.disabled}
              />
            </Grid>
            <Grid item xs={2}>
              <Typography>ชุด</Typography>
            </Grid>
            <Grid item xs={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={set.addon1}
                    onChange={e => handleSetChange(index, 'addon1', e.target.checked)}
                    disabled={set.disabled || set.quantity === 0}
                  />
                }
                label={<PhotoIcon />}
              />
            </Grid>
            <Grid item xs={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={set.addon2}
                    onChange={e => handleSetChange(index, 'addon2', e.target.checked)}
                    disabled={set.disabled || set.quantity === 0}
                  />
                }
                label={<ColorLensIcon />}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )

  const renderBookedSets = () => (
    <Paper elevation={3} sx={{ p: 2, mb: 2, width: '100%' }}>
      <Typography variant='h5' gutterBottom>
        ชุดที่จองแล้ว
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>เลขใบจอง</StyledTableHeadCell>
              <StyledTableHeadCell>ชุดที่</StyledTableHeadCell>
              <StyledTableHeadCell>จำนวน</StyledTableHeadCell>
              <StyledTableHeadCell>กรอบอเด็มโก้</StyledTableHeadCell>
              <StyledTableHeadCell>กรอบงาช้าง</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sets.map((set, index) => (
              <TableRow key={index}>
                <TableCell>{selectedBookingNo}</TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{set.quantity}</TableCell>
                <TableCell>{set.addon1 ? 'Yes' : 'No'}</TableCell>
                <TableCell>{set.addon2 ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )

  const renderTopControls = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Grid container spacing={2} alignItems='center'>
        <Grid item>
          <Button
            variant={activeTab === 'address' ? 'contained' : 'outlined'}
            onClick={() => handleTabChange('address')}
          >
            ที่อยู่สำหรับจัดส่ง
          </Button>
        </Grid>
        <Grid item>
          <Button variant={activeTab === 'set' ? 'contained' : 'outlined'} onClick={() => handleTabChange('set')}>
            แบบชุด
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant={activeTab === 'additional' ? 'contained' : 'outlined'}
            onClick={() => handleTabChange('additional')}
          >
            เพิ่มเติม
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isAddingNewBooking ? (
              <>
                <TextField
                  fullWidth
                  variant='outlined'
                  label='เพิ่มเลขใบจอง'
                  value={newBookingNo}
                  onChange={e => setNewBookingNo(e.target.value)}
                />
                <Button variant='contained' color='primary' onClick={handleSaveNewBooking} sx={{ ml: 2 }}>
                  บันทึก
                </Button>
                <Button variant='contained' color='secondary' onClick={handleCancelAddBooking} sx={{ ml: 2 }}>
                  ยกเลิก
                </Button>
              </>
            ) : (
              <>
                <FormControl fullWidth variant='outlined' sx={{ flexGrow: 1, marginRight: '10px' }}>
                  <InputLabel>เลขใบจอง</InputLabel>
                  <Select
                    value={selectedBookingNo}
                    onChange={e => setSelectedBookingNo(e.target.value)}
                    label='เลขใบจอง'
                  >
                    {bookingNumbers.map((bookingNo, index) => (
                      <MenuItem key={index} value={bookingNo}>
                        {bookingNo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant='contained' color='primary' onClick={handleAddNewBooking} sx={{ ml: 2 }}>
                  เพิ่มใบจอง
                </Button>
              </>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  )

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <Typography variant='h6' color='error'>
          {error}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', margin: 'auto', mt: 4 }}>
      {renderTopControls()}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          {renderAddressForm()}
        </Grid>
        <Grid item xs={12} md={6}>
          {activeTab === 'address' && renderBookingForm()}
          {activeTab === 'set' && renderSetForm()}
          {activeTab === 'additional' && renderBookedSets()}
        </Grid>
      </Grid>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000} // ตั้งเวลาเป็น 3 วินาที
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // มุมขวาบน
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ReservationInformation
