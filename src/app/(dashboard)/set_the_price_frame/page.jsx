'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { styled } from '@mui/material/styles'
import SettingsIcon from '@mui/icons-material/Settings'

// Styled components
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

export default function SetFramePrice() {
  const [sizes, setSizes] = useState([])
  const [colors, setColors] = useState([])
  const [frames, setFrames] = useState([])
  const [sets, setSets] = useState([])
  const [activeSection, setActiveSection] = useState('size')
  const [isLoading, setIsLoading] = useState(true)

  const [openModal, setOpenModal] = useState({
    size: false,
    color: false,
    category: false,
    set: false
  })

  const [formData, setFormData] = useState({
    size: '',
    color: '',
    category: '',
    set: {
      sizeId: '',
      colorId: '',
      categoryId: ''
    }
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    console.log('fetchData function called')
    setIsLoading(true)

    try {
      const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))
      const uni_id = selectedUniversity?.uni_id || ''
      console.log('Selected University:', selectedUniversity)
      console.log('University ID:', uni_id)

      const sizeResponse = await axios.get(`/api/f_sizeset`)
      console.log('Size response data:', sizeResponse.data)
      setSizes(sizeResponse.data.FrameCategory || [])

      const colorResponse = await axios.get(`/api/f_colorset`)
      console.log('Color response data:', colorResponse.data)
      setColors(colorResponse.data.FrameColor || [])

      const frameResponse = await axios.get(`/api/f_frameset`)
      console.log('Frame response data:', frameResponse.data)
      setFrames(frameResponse.data.FrameCategory || [])

      const setsResponse = await axios.post(`/api/f_priceset?uni_id=${uni_id}`)
      console.log('Sets response data:', setsResponse.data)
      setSets(setsResponse.data.FrameSet || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getNameById = (array, id, fieldName) => {
    const item = array.find(item => item.id === id)
    return item ? item[fieldName] : 'Unknown'
  }

  const handleAdd = type => {
    console.log(`Add new ${type}`)
    handleOpenModal(type)
  }

  const handleEdit = id => {
    console.log(`Edit item with id: ${id}`)
    // Implement edit functionality here
  }

  const handleDelete = id => {
    console.log(`Delete item with id: ${id}`)
    // Implement delete functionality here
  }

  const renderActionButtons = id => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
      <StyledButton variant='contained' color='primary' onClick={() => handleEdit(id)}>
        <SettingsIcon />
      </StyledButton>
      <StyledButton variant='contained' color='error' onClick={() => handleDelete(id)}>
        Delete
      </StyledButton>
    </Box>
  )

  const renderSkeletonRows = count => {
    return Array(count)
      .fill(0)
      .map((_, index) => (
        <TableRow key={index}>
          <StyledTableCell>
            <Skeleton animation='wave' />
          </StyledTableCell>
          <StyledTableCell>
            <Skeleton animation='wave' />
          </StyledTableCell>
          <StyledTableCell align='right'>
            <Skeleton animation='wave' width={100} />
          </StyledTableCell>
        </TableRow>
      ))
  }

  const handleOpenModal = type => {
    setOpenModal(prev => ({ ...prev, [type]: true }))
  }

  const handleCloseModal = type => {
    setOpenModal(prev => ({ ...prev, [type]: false }))
    setFormData(prev => ({
      ...prev,
      [type]: type !== 'set' ? '' : { sizeId: '', colorId: '', categoryId: '' }
    }))
  }

  const handleInputChange = (type, value) => {
    if (type === 'set') {
      setFormData(prev => ({
        ...prev,
        set: { ...prev.set, ...value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [type]: value }))
    }
  }

  const submitAddSize = async () => {
    try {
      const response = await axios.post('/api/f_sizeset', { setsizename: formData.size })
      console.log('Size added:', response.data)
      setSizes(prev => [...prev, response.data.FrameCategory])
      handleCloseModal('size')
    } catch (error) {
      console.error('Error adding size:', error)
    }
  }

  const submitAddColor = async () => {
    try {
      const response = await axios.post('/api/f_colorset', { setcolorname: formData.color })
      console.log('Color added:', response.data)
      setColors(prev => [...prev, response.data.FrameColor])
      handleCloseModal('color')
    } catch (error) {
      console.error('Error adding color:', error)
    }
  }

  const submitAddCategory = async () => {
    try {
      const response = await axios.post('/api/f_frameset', { framesetname: formData.category })
      console.log('Category added:', response.data)
      setFrames(prev => [...prev, response.data.FrameCategory])
      handleCloseModal('category')
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const submitAddSet = async () => {
    try {
      const { sizeId, colorId, categoryId } = formData.set
      const response = await axios.post('/api/f_priceset', {
        frameSizeId: sizeId,
        frameColorId: colorId,
        frameCategoryId: categoryId,
        uni_id: JSON.parse(sessionStorage.getItem('selectedUniversity'))?.uni_id || ''
      })
      console.log('Set added:', response.data)
      setSets(prev => [...prev, response.data.FrameSet])
      handleCloseModal('set')
    } catch (error) {
      console.error('Error adding set:', error)
    }
  }

  const renderSection = () => {
    if (isLoading) {
      return (
        <>
          <Skeleton variant='rectangular' width={120} height={36} style={{ marginBottom: '20px' }} />
          <TableContainer component={Paper} className='shadow-lg rounded-lg'>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>
                    <Skeleton animation='wave' />
                  </StyledTableHeadCell>
                  <StyledTableHeadCell>
                    <Skeleton animation='wave' />
                  </StyledTableHeadCell>
                  <StyledTableHeadCell align='right'>
                    <Skeleton animation='wave' />
                  </StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderSkeletonRows(5)}</TableBody>
            </Table>
          </TableContainer>
        </>
      )
    }

    switch (activeSection) {
      case 'size':
        return (
          <>
            <StyledButton
              variant='contained'
              color='primary'
              onClick={() => handleAdd('size')}
              style={{ marginBottom: '20px' }}
            >
              Add Size
            </StyledButton>
            <TableContainer component={Paper} className='shadow-lg rounded-lg'>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell>No</StyledTableHeadCell>
                    <StyledTableHeadCell>Size</StyledTableHeadCell>
                    <StyledTableHeadCell align='right'>Action</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sizes.map((size, index) => (
                    <TableRow key={size.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <StyledTableCell>{index + 1}</StyledTableCell>
                      <StyledTableCell>{size.setsizename}</StyledTableCell>
                      <StyledTableCell align='right'>{renderActionButtons(size.id)}</StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )
      case 'color':
        return (
          <>
            <StyledButton
              variant='contained'
              color='primary'
              onClick={() => handleAdd('color')}
              style={{ marginBottom: '20px' }}
            >
              Add Color
            </StyledButton>
            <TableContainer component={Paper} className='shadow-lg rounded-lg'>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell>No</StyledTableHeadCell>
                    <StyledTableHeadCell>Color</StyledTableHeadCell>
                    <StyledTableHeadCell align='right'>Action</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {colors.map((color, index) => (
                    <TableRow key={color.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <StyledTableCell>{index + 1}</StyledTableCell>
                      <StyledTableCell>{color.setcolorname}</StyledTableCell>
                      <StyledTableCell align='right'>{renderActionButtons(color.id)}</StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )
      case 'category':
        return (
          <>
            <StyledButton
              variant='contained'
              color='primary'
              onClick={() => handleAdd('category')}
              style={{ marginBottom: '20px' }}
            >
              Add Category
            </StyledButton>
            <TableContainer component={Paper} className='shadow-lg rounded-lg'>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell>No</StyledTableHeadCell>
                    <StyledTableHeadCell>Category</StyledTableHeadCell>
                    <StyledTableHeadCell align='right'>Action</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {frames.map((frame, index) => (
                    <TableRow key={frame.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <StyledTableCell>{index + 1}</StyledTableCell>
                      <StyledTableCell>{frame.framesetname}</StyledTableCell>
                      <StyledTableCell align='right'>{renderActionButtons(frame.id)}</StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )
      case 'sets':
        return (
          <>
            <StyledButton
              variant='contained'
              color='primary'
              onClick={() => handleAdd('set')}
              style={{ marginBottom: '20px' }}
            >
              Add Set
            </StyledButton>
            <TableContainer component={Paper} className='shadow-lg rounded-lg'>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell>No</StyledTableHeadCell>
                    <StyledTableHeadCell>Size</StyledTableHeadCell>
                    <StyledTableHeadCell>Color</StyledTableHeadCell>
                    <StyledTableHeadCell>Category</StyledTableHeadCell>
                    <StyledTableHeadCell align='right'>Action</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sets.map((set, index) => (
                    <TableRow key={set.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <StyledTableCell>{index + 1}</StyledTableCell>
                      <StyledTableCell>{getNameById(sizes, set.frameSizeId, 'setsizename')}</StyledTableCell>
                      <StyledTableCell>{getNameById(colors, set.frameColorId, 'setcolorname')}</StyledTableCell>
                      <StyledTableCell>{getNameById(frames, set.frameCategoryId, 'framesetname')}</StyledTableCell>
                      <StyledTableCell align='right'>{renderActionButtons(set.id)}</StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )
      default:
        return null
    }
  }

  const AddSizeModal = () => (
    <Dialog open={openModal.size} onClose={() => handleCloseModal('size')}>
      <DialogTitle>Add New Size</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          label='Size Name'
          fullWidth
          value={formData.size}
          onChange={e => handleInputChange('size', e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleCloseModal('size')}>Cancel</Button>
        <Button onClick={submitAddSize} variant='contained' color='primary'>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )

  const AddColorModal = () => (
    <Dialog open={openModal.color} onClose={() => handleCloseModal('color')}>
      <DialogTitle>Add New Color</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          label='Color Name'
          fullWidth
          value={formData.color}
          onChange={e => handleInputChange('color', e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleCloseModal('color')}>Cancel</Button>
        <Button onClick={submitAddColor} variant='contained' color='primary'>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )

  const AddCategoryModal = () => (
    <Dialog open={openModal.category} onClose={() => handleCloseModal('category')}>
      <DialogTitle>Add New Category</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          label='Category Name'
          fullWidth
          value={formData.category}
          onChange={e => handleInputChange('category', e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleCloseModal('category')}>Cancel</Button>
        <Button onClick={submitAddCategory} variant='contained' color='primary'>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )

  const AddSetModal = () => (
    <Dialog open={openModal.set} onClose={() => handleCloseModal('set')}>
      <DialogTitle>Add New Set</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin='dense'>
          <InputLabel id='size-select-label'>Size</InputLabel>
          <Select
            labelId='size-select-label'
            value={formData.set.sizeId}
            label='Size'
            onChange={e => handleInputChange('set', { sizeId: e.target.value })}
          >
            {sizes.map(size => (
              <MenuItem key={size.id} value={size.id}>
                {size.setsizename}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin='dense'>
          <InputLabel id='color-select-label'>Color</InputLabel>
          <Select
            labelId='color-select-label'
            value={formData.set.colorId}
            label='Color'
            onChange={e => handleInputChange('set', { colorId: e.target.value })}
          >
            {colors.map(color => (
              <MenuItem key={color.id} value={color.id}>
                {color.setcolorname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin='dense'>
          <InputLabel id='category-select-label'>Category</InputLabel>
          <Select
            labelId='category-select-label'
            value={formData.set.categoryId}
            label='Category'
            onChange={e => handleInputChange('set', { categoryId: e.target.value })}
          >
            {frames.map(frame => (
              <MenuItem key={frame.id} value={frame.id}>
                {frame.framesetname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleCloseModal('set')}>Cancel</Button>
        <Button onClick={submitAddSet} variant='contained' color='primary'>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )

  return (
    <Box p={4}>
      <Typography variant='h3' component='h1' gutterBottom>
        {isLoading ? <Skeleton width='50%' /> : 'กำหนดค่า'}
      </Typography>
      <Typography variant='h6' className='text-gray-600 mb-6'>
        {isLoading ? <Skeleton width='70%' /> : 'เพิ่ม ลบ แก้ไข รายการ กรอบ สี ขนาด และ ราคาชุดภาพ'}
      </Typography>
      <Box mb={4} display='flex' gap={2}>
        {isLoading ? (
          <>
            <Skeleton variant='rectangular' width={100} height={36} />
            <Skeleton variant='rectangular' width={100} height={36} />
            <Skeleton variant='rectangular' width={100} height={36} />
            <Skeleton variant='rectangular' width={100} height={36} />
          </>
        ) : (
          <>
            <StyledButton
              variant={activeSection === 'size' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => setActiveSection('size')}
            >
              Sizes
            </StyledButton>
            <StyledButton
              variant={activeSection === 'color' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => setActiveSection('color')}
            >
              Colors
            </StyledButton>
            <StyledButton
              variant={activeSection === 'category' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => setActiveSection('category')}
            >
              Categories
            </StyledButton>
            <StyledButton
              variant={activeSection === 'sets' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => setActiveSection('sets')}
            >
              Sets
            </StyledButton>
          </>
        )}
      </Box>
      {renderSection()}

      {/* Modals */}
      <AddSizeModal />
      <AddColorModal />
      <AddCategoryModal />
      <AddSetModal />
    </Box>
  )
}
