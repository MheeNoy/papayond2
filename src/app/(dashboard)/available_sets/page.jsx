'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Select,
  Checkbox,
  FormControlLabel
} from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '1rem'
}))

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontSize: '1rem',
  cursor: 'pointer'
}))

const UpdateByCell = styled(TableCell)(({ theme }) => ({
  maxWidth: '150px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: '1rem'
}))

export default function AvailableSetsPage() {
  const [selectedSet, setSelectedSet] = useState(1)
  const [selectedOption, setSelectedOption] = useState('ราคาชุด')
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [frame, setFrame] = useState('')
  const [rows, setRows] = useState([])
  const [sizeOptions, setSizeOptions] = useState([])
  const [colorOptions, setColorOptions] = useState([])
  const [frameOptions, setFrameOptions] = useState([])
  const sets = Array.from({ length: 15 }, (_, index) => ({ id: index + 1, value: '' }))
  const [quantity, setQuantity] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isGroupActive, setIsGroupActive] = useState(false)
  const [formControlData, setFormControlData] = useState(null)

  const handleSetSelect = setId => {
    setSelectedSet(setId)
  }

  const handleFileChange = event => {
    const file = event.target.files[0]
    if (file && file.size <= 2 * 1024 * 1024) {
      // ตรวจสอบขนาดไฟล์ไม่เกิน 2MB
      setSelectedFile(file)
    } else {
      alert('ขนาดไฟล์ต้องไม่เกิน 2MB')
    }
  }

  const handleValueChange = async (event, setof) => {
    const newValue = event.target.value
    const storedUni = JSON.parse(sessionStorage.getItem('selectedUniversity'))
    const uni_id = storedUni?.uni_id || 0
    const type = selectedOption === 'ค่าส่ง' ? 'trx' : selectedOption === 'ราคาชุด' ? 'pset' : 'wegh'

    try {
      const response = await fetch('/api/get-formcontrol-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uni_id,
          type,
          setof,
          valueof: newValue
        })
      })

      const result = await response.json()
      if (result.success) {
        alert(result.message)
        // อัปเดตข้อมูลในฟังก์ชันเพื่อให้แสดงข้อมูลที่อัปเดตล่าสุด
        setFormControlData(prevData => ({
          ...prevData,
          [type]: {
            ...prevData[type],
            [setof]: newValue
          }
        }))
      } else {
        alert(`การบันทึกหรืออัปเดตข้อมูลล้มเหลว: ${result.message}`)
      }
    } catch (error) {
      console.error('Error updating form control data:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกหรืออัปเดตข้อมูล')
    }
  }

  // ฟังก์ชันสำหรับการอัปโหลดไฟล์
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('กรุณาเลือกไฟล์ก่อน')
      return
    }

    const storedUni = JSON.parse(sessionStorage.getItem('selectedUniversity'))
    const uni_id = storedUni?.uni_id || 0
    const group_id = selectedSet // ใช้ selectedSet เป็น group_id

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('uni_id', uni_id) // ส่ง uni_id ไปด้วย
    formData.append('group_id', group_id) // ส่ง group_id ไปด้วย

    try {
      const response = await fetch('/api/upload-frameimage-to-ftp', {
        method: 'POST',
        body: formData
      })
      const result = await response.json()

      if (result.success) {
        alert('อัปโหลดรูปภาพสำเร็จ')
      } else {
        alert(`การอัปโหลดล้มเหลว: ${result.message}`)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ')
    }
  }

  const handleCheckboxChange = async event => {
    const isActive = event.target.checked
    const storedUni = JSON.parse(sessionStorage.getItem('selectedUniversity'))
    const uni_id = storedUni?.uni_id || 0
    const group_id = selectedSet

    try {
      const response = await fetch('/api/group_active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uni_id, group_id, updateActive: isActive })
      })
      const result = await response.json()

      if (result.success) {
        setIsGroupActive(isActive)
        alert('สถานะการใช้งานถูกอัปเดตสำเร็จ')
      } else {
        alert(`การอัปเดตล้มเหลว: ${result.message}`)
      }
    } catch (error) {
      console.error('Error updating group active status:', error)
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะการใช้งาน')
    }
  }

  useEffect(() => {
    const fetchFormControlData = async () => {
      const storedUni = JSON.parse(sessionStorage.getItem('selectedUniversity'))
      const uni_id = storedUni?.uni_id || 0

      try {
        const response = await fetch('/api/get-formcontrol-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uni_id })
        })
        const result = await response.json()

        if (result.success) {
          setFormControlData(result.data)
        } else {
          alert(`Failed to fetch data: ${result.message}`)
        }
      } catch (error) {
        console.error('Error fetching form control data:', error)
      }
    }

    fetchFormControlData()
  }, [])

  useEffect(() => {
    const fetchGroupActiveStatus = async () => {
      const storedUni = JSON.parse(sessionStorage.getItem('selectedUniversity'))
      const uni_id = storedUni?.uni_id || 0
      const group_id = selectedSet

      try {
        const response = await fetch('/api/group_active', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ uni_id, group_id })
        })
        const result = await response.json()

        if (result.success) {
          setIsGroupActive(result.group_active === 1)
        } else {
          setIsGroupActive(false)
        }
      } catch (error) {
        console.error('Error fetching group active status:', error)
      }
    }

    fetchGroupActiveStatus()
  }, [selectedSet]) // ตรวจสอบทุกครั้งที่ selectedSet เปลี่ยนแปลง

  // เรียกข้อมูลจาก API ด้วย useEffect
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/get-frame')
        const data = await response.json()
        setSizeOptions(data.sizes)
        setColorOptions(data.colors)
        setFrameOptions(data.frames)
      } catch (error) {
        console.error('Error fetching options:', error)
      }
    }

    fetchOptions()
  }, [])

  useEffect(() => {
    const fetchSavedFrames = async () => {
      const storedUni = JSON.parse(sessionStorage.getItem('selectedUniversity'))
      const uni_id = storedUni?.uni_id || 0

      try {
        const response = await fetch('/api/get-saved-frames', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uni_id,
            groupset_id: selectedSet
          })
        })

        const data = await response.json()
        setRows(data)
      } catch (error) {
        console.error('Error fetching saved frames:', error)
      }
    }

    fetchSavedFrames()
  }, [selectedSet]) // ดึงข้อมูลใหม่ทุกครั้งที่เปลี่ยน selectedSet

  const handleSave = async () => {
    const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))
    const uni_id = selectedUniversity?.uni_id || null // ดึง uni_id จาก sessionStorage

    if (!uni_id || !size || !color || !frame || !quantity) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    const selectedSize = sizeOptions.find(option => option.setsizename === size)
    const selectedColor = colorOptions.find(option => option.setcolorname === color)
    const selectedFrame = frameOptions.find(option => option.framesetname === frame)

    const data = {
      sizeset_id: selectedSize ? selectedSize.id : null,
      colorset_id: selectedColor ? selectedColor.id : null,
      frameset_id: selectedFrame ? selectedFrame.id : null,
      groupset_id: selectedSet, // ใช้ selectedSet เป็น groupset_id
      uni_id: uni_id,
      set_amount: quantity
    }

    try {
      const response = await fetch('/api/save-frameset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        alert('บันทึกข้อมูลสำเร็จ')
        handleAddRow()
      } else {
        alert('การบันทึกข้อมูลล้มเหลว')
      }
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  const handleOptionChange = (event, newOption) => {
    if (newOption) {
      setSelectedOption(newOption)
    }
  }

  const handleAddRow = () => {
    if (size && color && frame && quantity) {
      setRows([...rows, { size, color, frame, quantity }])
      setSize('')
      setColor('')
      setFrame('')
      setQuantity('') // รีเซ็ตหลังจากเพิ่ม
    }
  }

  const handleRemoveRow = index => {
    setRows(rows.filter((_, i) => i !== index))
  }

  const getBackgroundColor = () => {
    switch (selectedOption) {
      case 'ค่าส่ง':
        return '#009688'
      case 'ราคาชุด':
        return '#1976d2'
      case 'น้ำหนัก':
        return '#d32f2f'
      default:
        return '#1976d2'
    }
  }

  return (
    <Box padding={3}>
      <Typography variant='h4' gutterBottom>
        Form Control (กำหนดชุดที่สามารถใช้ได้)
      </Typography>

      <ToggleButtonGroup
        value={selectedOption}
        exclusive
        onChange={handleOptionChange}
        style={{ marginBottom: '20px' }}
      >
        <ToggleButton value='ค่าส่ง'>ค่าส่ง</ToggleButton>
        <ToggleButton value='ราคาชุด'>ราคาชุด</ToggleButton>
        <ToggleButton value='น้ำหนัก'>น้ำหนัก</ToggleButton>
      </ToggleButtonGroup>

      <Grid container spacing={3} marginTop={2}>
        <Grid item xs={4}>
          <Box
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #ccc',
              padding: 2,
              borderRadius: 1,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Typography variant='h5' gutterBottom>
              กำหนดค่า
            </Typography>
            <Grid container spacing={2}>
              {sets.map(set => (
                <Grid item xs={6} key={set.id}>
                  <Box
                    bgcolor={getBackgroundColor}
                    color={theme => theme.palette.common.white}
                    padding={2}
                    borderRadius={1}
                    textAlign='center'
                  >
                    ชุดที่ {set.id}{' '}
                    {selectedOption === 'ค่าส่ง' ? '(บาท)' : selectedOption === 'น้ำหนัก' ? 'กรัม' : '(บาท)'}
                    <TextField
                      fullWidth
                      placeholder={selectedOption}
                      variant='outlined'
                      size='small'
                      margin='normal'
                      InputProps={{ style: { backgroundColor: '#fff' } }}
                      value={
                        (formControlData &&
                          formControlData[
                            selectedOption === 'ค่าส่ง' ? 'trx' : selectedOption === 'ราคาชุด' ? 'pset' : 'wegh'
                          ]?.[set.id]) ||
                        ''
                      }
                      onChange={e => handleValueChange(e, set.id)} // เพิ่มการจัดการเมื่อมีการเปลี่ยนแปลงค่า
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={8}>
          <Box
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid #ccc',
              padding: 2,
              borderRadius: 1,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            display='flex'
            flexDirection='row'
            justifyContent='space-between'
            alignItems='flex-start'
          >
            <Box flex='3' marginRight={2}>
              <Typography variant='h5' gutterBottom>
                รายละเอียดของชุดที่ {selectedSet}
              </Typography>
              <FormControlLabel
                control={<Checkbox checked={isGroupActive} onChange={handleCheckboxChange} />}
                label={`set นำไปใช้งานในชุดที่ ${selectedSet}`} // ใช้ backticks เพื่อสร้าง template literals
                sx={{ marginBottom: 2 }}
              />

              {/* ปุ่มเพิ่มรูปภาพ */}
              <input
                type='file'
                accept='image/*'
                style={{ display: 'none' }}
                id='upload-image'
                onChange={handleFileChange}
              />
              <label htmlFor='upload-image'>
                <Button variant='contained' color='primary' component='span' sx={{ marginTop: 2 }}>
                  เลือกรูปภาพของชุด
                </Button>
              </label>
              <Button
                variant='contained'
                color='primary'
                onClick={handleUpload}
                sx={{ marginTop: 2 }}
                disabled={!selectedFile} // ปุ่มจะไม่ทำงานถ้าไม่มีไฟล์ถูกเลือก
              >
                เพิ่มรูปภาพของชุด
              </Button>
              <TextField
                fullWidth
                value={`ชุดที่ ${selectedSet}`} // ใช้เครื่องหมาย backticks เพื่อทำ template literals
                InputProps={{ readOnly: true, style: { textAlign: 'center' } }}
                margin='normal'
              />

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ขนาด</TableCell>
                      <TableCell>สี</TableCell>
                      <TableCell>กรอบ</TableCell>
                      <TableCell>จำนวน</TableCell>
                      <TableCell>เพิ่ม</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Select
                          fullWidth
                          variant='outlined'
                          size='small'
                          value={size}
                          onChange={e => setSize(e.target.value)}
                        >
                          {sizeOptions.map(option => (
                            <MenuItem key={option.id} value={option.setsizename}>
                              {option.setsizename}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          fullWidth
                          variant='outlined'
                          size='small'
                          value={color}
                          onChange={e => setColor(e.target.value)}
                        >
                          {colorOptions.map(option => (
                            <MenuItem key={option.id} value={option.setcolorname}>
                              {option.setcolorname}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          fullWidth
                          variant='outlined'
                          size='small'
                          value={frame}
                          onChange={e => setFrame(e.target.value)}
                        >
                          {frameOptions.map(option => (
                            <MenuItem key={option.id} value={option.framesetname}>
                              {option.framesetname}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField
                          variant='outlined'
                          size='small'
                          placeholder='จำนวน'
                          style={{ width: '80px' }}
                          value={quantity} // กำหนดค่าให้ quantity
                          onChange={e => setQuantity(e.target.value)} // อัปเดตค่าเมื่อเปลี่ยนแปลง
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant='contained' color='success' onClick={handleSave}>
                          เพิ่ม
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableHeadCell>ขนาด</StyledTableHeadCell>
                      <StyledTableHeadCell>สี</StyledTableHeadCell>
                      <StyledTableHeadCell>กรอบ</StyledTableHeadCell>
                      <StyledTableHeadCell>จำนวน</StyledTableHeadCell>
                      <StyledTableHeadCell>จัดการ</StyledTableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, index) => (
                      <TableRow key={index}>
                        <StyledTableCell>{row.size}</StyledTableCell>
                        <StyledTableCell>{row.color}</StyledTableCell>
                        <StyledTableCell>{row.frame}</StyledTableCell>
                        <StyledTableCell>{row.quantity}</StyledTableCell>
                        <UpdateByCell>
                          <Button
                            variant='contained'
                            color='secondary'
                            size='small'
                            onClick={() => handleRemoveRow(index)}
                          >
                            ลบ
                          </Button>
                        </UpdateByCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box
              flex='1'
              textAlign='center'
              sx={{
                backgroundColor: '#ffffff',
                border: '1px solid #ccc',
                padding: 2,
                borderRadius: 1,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Typography variant='h5' gutterBottom>
                ชุดที่เลือก
              </Typography>
              {sets.map(set => (
                <Box
                  key={set.id}
                  onClick={() => handleSetSelect(set.id)}
                  sx={{
                    cursor: 'pointer',
                    color: selectedSet === set.id ? '#2196F3' : '#000',
                    marginBottom: '5px',
                    paddingBottom: '5px',
                    borderBottom: '1px solid #ddd',
                    '&:hover': {
                      color: '#1976d2',
                      backgroundColor: '#f0f0f0'
                    }
                  }}
                >
                  ชุดที่ {set.id}
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
