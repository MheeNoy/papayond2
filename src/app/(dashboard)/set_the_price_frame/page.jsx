'use client'

import React, { useState, useEffect, memo } from 'react'
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
  MenuItem,
  Alert,
  Snackbar,
  Pagination
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

// Memoized Modal Components with Error Handling
const AddSizeModal = memo(({ open, onClose, onAdd, sizeValue, onChange, error }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>เพิ่มขนาดใหม่</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin='dense'
        label='ชื่อขนาด'
        fullWidth
        value={sizeValue}
        onChange={e => onChange(e.target.value)}
        error={Boolean(error)}
        helperText={error}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>ยกเลิก</Button>
      <Button onClick={onAdd} variant='contained' color='primary'>
        เพิ่ม
      </Button>
    </DialogActions>
  </Dialog>
))

const AddColorModal = memo(({ open, onClose, onAdd, colorValue, onChange, error }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>เพิ่มสีใหม่</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin='dense'
        label='ชื่อสี'
        fullWidth
        value={colorValue}
        onChange={e => onChange(e.target.value)}
        error={Boolean(error)}
        helperText={error}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>ยกเลิก</Button>
      <Button onClick={onAdd} variant='contained' color='primary'>
        เพิ่ม
      </Button>
    </DialogActions>
  </Dialog>
))

const AddCategoryModal = memo(({ open, onClose, onAdd, categoryValue, onChange, error }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>เพิ่มหมวดหมู่ใหม่</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin='dense'
        label='ชื่อหมวดหมู่'
        fullWidth
        value={categoryValue}
        onChange={e => onChange(e.target.value)}
        error={Boolean(error)}
        helperText={error}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>ยกเลิก</Button>
      <Button onClick={onAdd} variant='contained' color='primary'>
        เพิ่ม
      </Button>
    </DialogActions>
  </Dialog>
))

const AddSetModal = memo(({ open, onClose, onAdd, setData, onChange, sizes, colors, categories, error }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>เพิ่มชุดใหม่</DialogTitle>
    <DialogContent>
      <FormControl fullWidth margin='dense' error={Boolean(error?.sizeId)}>
        <InputLabel id='size-select-label'>ขนาด</InputLabel>
        <Select
          labelId='size-select-label'
          value={setData.sizeId}
          label='ขนาด'
          onChange={e => onChange({ sizeId: e.target.value })}
        >
          {sizes.map(size => (
            <MenuItem key={size.id} value={size.id}>
              {size.setsizename}
            </MenuItem>
          ))}
        </Select>
        {error?.sizeId && (
          <Typography variant='caption' color='error'>
            {error.sizeId}
          </Typography>
        )}
      </FormControl>
      <FormControl fullWidth margin='dense' error={Boolean(error?.colorId)}>
        <InputLabel id='color-select-label'>สี</InputLabel>
        <Select
          labelId='color-select-label'
          value={setData.colorId}
          label='สี'
          onChange={e => onChange({ colorId: e.target.value })}
        >
          {colors.map(color => (
            <MenuItem key={color.id} value={color.id}>
              {color.setcolorname}
            </MenuItem>
          ))}
        </Select>
        {error?.colorId && (
          <Typography variant='caption' color='error'>
            {error.colorId}
          </Typography>
        )}
      </FormControl>
      <FormControl fullWidth margin='dense' error={Boolean(error?.categoryId)}>
        <InputLabel id='category-select-label'>หมวดหมู่</InputLabel>
        <Select
          labelId='category-select-label'
          value={setData.categoryId}
          label='หมวดหมู่'
          onChange={e => onChange({ categoryId: e.target.value })}
        >
          {categories.map(category => (
            <MenuItem key={category.id} value={category.id}>
              {category.framesetname}
            </MenuItem>
          ))}
        </Select>
        {error?.categoryId && (
          <Typography variant='caption' color='error'>
            {error.categoryId}
          </Typography>
        )}
      </FormControl>
      {/* เพิ่มฟิลด์สำหรับกรอกราคา */}
      <TextField
        margin='dense'
        label='ราคา'
        type='number'
        fullWidth
        value={setData.price || ''}
        onChange={e => onChange({ price: e.target.value })}
        error={Boolean(error?.price)}
        helperText={error?.price}
      />
      {error?.general && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error.general}
        </Alert>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>ยกเลิก</Button>
      <Button onClick={onAdd} variant='contained' color='primary'>
        เพิ่ม
      </Button>
    </DialogActions>
  </Dialog>
))

// Delete Confirmation Modal
const DeleteConfirmModal = memo(({ open, onClose, onConfirm, title, content }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography>{content}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>ยกเลิก</Button>
      <Button onClick={onConfirm} variant='contained' color='error'>
        ลบ
      </Button>
    </DialogActions>
  </Dialog>
))

// Edit Size Modal
const EditSizeModal = memo(({ open, onClose, onUpdate, sizeData, onChange, error }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>แก้ไขขนาด</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin='dense'
        label='ชื่อขนาด'
        fullWidth
        value={sizeData.setsizename}
        onChange={e => onChange({ setsizename: e.target.value })}
        error={Boolean(error)}
        helperText={error}
      />
      {error?.general && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error.general}
        </Alert>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>ยกเลิก</Button>
      <Button onClick={onUpdate} variant='contained' color='primary'>
        อัปเดต
      </Button>
    </DialogActions>
  </Dialog>
))

// Edit Color Modal
const EditColorModal = memo(({ open, onClose, onUpdate, colorData, onChange, error }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>แก้ไขสี</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin='dense'
        label='ชื่อสี'
        fullWidth
        value={colorData.setcolorname}
        onChange={e => onChange({ setcolorname: e.target.value })}
        error={Boolean(error)}
        helperText={error}
      />
      {error?.general && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error.general}
        </Alert>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>ยกเลิก</Button>
      <Button onClick={onUpdate} variant='contained' color='primary'>
        อัปเดต
      </Button>
    </DialogActions>
  </Dialog>
))

// Edit Frame Category Modal
const EditFrameCategoryModal = memo(({ open, onClose, onUpdate, categoryData, onChange, error }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>แก้ไขกรอบ</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin='dense'
        label='ชื่อหมวดหมู่'
        fullWidth
        value={categoryData.framesetname}
        onChange={e => onChange({ framesetname: e.target.value })}
        error={Boolean(error)}
        helperText={error}
      />
      {error?.general && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error.general}
        </Alert>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>ยกเลิก</Button>
      <Button onClick={onUpdate} variant='contained' color='primary'>
        อัปเดต
      </Button>
    </DialogActions>
  </Dialog>
))

// Edit Set Modal
const EditSetModal = memo(({ open, onClose, onUpdate, setData, sizes, colors, categories,onChange, error }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>แก้ไขชุด</DialogTitle>
    <DialogContent>
      <FormControl fullWidth margin='dense' error={Boolean(error?.sizeId)}>
        <InputLabel id='edit-size-select-label'>ขนาด</InputLabel>
        <Select
          labelId='edit-size-select-label'
          value={setData.sizeId}
          label='ขนาด'
          // onChange={e => onUpdate({ sizeId: e.target.value })}
          onChange={e => onChange({ sizeId: e.target.value })}
        >
          {sizes.map(size => (
            <MenuItem key={size.id} value={size.id}>
              {size.setsizename}
            </MenuItem>
          ))}
        </Select>
        {error?.sizeId && (
          <Typography variant='caption' color='error'>
            {error.sizeId}
          </Typography>
        )}
      </FormControl>
      <FormControl fullWidth margin='dense' error={Boolean(error?.colorId)}>
        <InputLabel id='edit-color-select-label'>สี</InputLabel>
        <Select
          labelId='edit-color-select-label'
          value={setData.colorId}
          label='สี'
          // onChange={e => onUpdate({ colorId: e.target.value })}
          onChange={e => onChange({ colorId: e.target.value })}
        >
          {colors.map(color => (
            <MenuItem key={color.id} value={color.id}>
              {color.setcolorname}
            </MenuItem>
          ))}
        </Select>
        {error?.colorId && (
          <Typography variant='caption' color='error'>
            {error.colorId}
          </Typography>
        )}
      </FormControl>
      <FormControl fullWidth margin='dense' error={Boolean(error?.categoryId)}>
        <InputLabel id='edit-category-select-label'>หมวดหมู่</InputLabel>
        <Select
          labelId='edit-category-select-label'
          value={setData.categoryId}
          label='หมวดหมู่'
          // onChange={e => onUpdate({ categoryId: e.target.value })}
          onChange={e => onChange({ categoryId: e.target.value })}
          
        >
          {categories.map(category => (
            <MenuItem key={category.id} value={category.id}>
              {category.framesetname}
            </MenuItem>
          ))}
        </Select>
        {error?.categoryId && (
          <Typography variant='caption' color='error'>
            {error.categoryId}
          </Typography>
        )}
      </FormControl>
      <TextField
        margin='dense'
        label='ราคา'
        type='number'
        fullWidth
        value={setData.priceset_single || ''}
        // onChange={e => onUpdate({ priceset_single: e.target.value })}
        onChange={e => onChange({ priceset_single: e.target.value })}
        error={Boolean(error?.priceset_single)}
        helperText={error?.priceset_single}
      />
      {error?.general && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error.general}
        </Alert>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>ยกเลิก</Button>
      <Button onClick={onUpdate} variant='contained' color='primary'>
        อัปเดต
      </Button>
    </DialogActions>
  </Dialog>
))

export default function SetFramePrice() {
  const [sizes, setSizes] = useState([])
  const [colors, setColors] = useState([])
  const [frames, setFrames] = useState([])
  const [sets, setSets] = useState([])
  const [activeSection, setActiveSection] = useState('size')
  const [isLoading, setIsLoading] = useState(true)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10 // สามารถปรับได้ตามต้องการ

  // Separate state for each modal
  const [openSizeModal, setOpenSizeModal] = useState(false)
  const [openColorModal, setOpenColorModal] = useState(false)
  const [openCategoryModal, setOpenCategoryModal] = useState(false)
  const [openSetModal, setOpenSetModal] = useState(false)
  const [openEditSizeModal, setOpenEditSizeModal] = useState(false)
  const [openEditColorModal, setOpenEditColorModal] = useState(false)
  const [openEditFrameCategoryModal, setOpenEditFrameCategoryModal] = useState(false)
  const [openEditSetModal, setOpenEditSetModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

  // Form data state
  const [formData, setFormData] = useState({
    size: '',
    color: '',
    category: '',
    set: {
      sizeId: '',
      colorId: '',
      categoryId: '',
      price: '' // เพิ่มฟิลด์สำหรับราคา
    }
  })

  // Current items being edited
  const [currentEditSize, setCurrentEditSize] = useState(null)
  const [currentEditColor, setCurrentEditColor] = useState(null)
  const [currentEditFrameCategory, setCurrentEditFrameCategory] = useState(null)
  const [currentEditSet, setCurrentEditSet] = useState(null) // เพิ่ม state สำหรับ set

  // ID and type of the item targeted for deletion
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [deleteTargetType, setDeleteTargetType] = useState(null) // 'size' | 'color' | 'category' | 'set'

  // Error states for modals
  const [sizeError, setSizeError] = useState('')
  const [colorError, setColorError] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [setError, setSetError] = useState({})
  const [editSizeError, setEditSizeError] = useState('')
  const [editColorError, setEditColorError] = useState('')
  const [editFrameCategoryError, setEditFrameCategoryError] = useState('')
  const [editSetError, setEditSetError] = useState({}) // เพิ่ม error state สำหรับ set

  // Snackbar state for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success' | 'error' | 'warning' | 'info'
  })

  useEffect(() => {
    fetchData(currentPage)
  }, [currentPage])

  const fetchData = async (page = 1) => {
    setIsLoading(true)

    try {
      const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))
      const uni_id = selectedUniversity?.uni_id || ''

      // Fetch sizes
      const sizeResponse = await axios.get(`/api/f_sizeset`)
      setSizes(sizeResponse.data.FrameCategory || [])

      // Fetch colors
      const colorResponse = await axios.get(`/api/f_colorset`)
      setColors(colorResponse.data.FrameColor || [])

      // Fetch frame categories
      const frameResponse = await axios.get(`/api/f_frameset`)
      setFrames(frameResponse.data.FrameCategory || [])

      // Fetch sets with pagination
      const setsResponse = await axios.get(`/api/f_priceset`, {
        params: { uni_id, page, limit }
      })
      setSets(setsResponse.data.FrameSets || [])
      setTotalPages(setsResponse.data.pagination.totalPages || 1)
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลจากเซิร์ฟเวอร์',
        severity: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = type => {
    switch (type) {
      case 'size':
        setOpenSizeModal(true)
        break
      case 'color':
        setOpenColorModal(true)
        break
      case 'category':
        setOpenCategoryModal(true)
        break
      case 'set':
        setOpenSetModal(true)
        break
      default:
        break
    }
  }

  // Handle Edit: Open Edit Modal with selected item's data
  const handleEdit = (id, type) => {
    switch (type) {
      case 'size':
        const sizeToEdit = sizes.find(size => size.id === id)
        if (!sizeToEdit) {
          setSnackbar({
            open: true,
            message: 'ไม่พบขนาดที่เลือก',
            severity: 'error'
          })
          return
        }
        setCurrentEditSize(sizeToEdit)
        setOpenEditSizeModal(true)
        break
      case 'color':
        const colorToEdit = colors.find(color => color.id === id)
        if (!colorToEdit) {
          setSnackbar({
            open: true,
            message: 'ไม่พบสีที่เลือก',
            severity: 'error'
          })
          return
        }
        setCurrentEditColor(colorToEdit)
        setOpenEditColorModal(true)
        break
      case 'category':
        const categoryToEdit = frames.find(category => category.id === id)
        if (!categoryToEdit) {
          setSnackbar({
            open: true,
            message: 'ไม่พบกรอบที่เลือก',
            severity: 'error'
          })
          return
        }
        setCurrentEditFrameCategory(categoryToEdit)
        setOpenEditFrameCategoryModal(true)
        break
      case 'set':
        const setToEdit = sets.find(set => set.id === id)
        if (!setToEdit) {
          setSnackbar({
            open: true,
            message: 'ไม่พบชุดที่เลือก',
            severity: 'error'
          })
          return
        }
        setCurrentEditSet(setToEdit)
        setOpenEditSetModal(true)
        break
      default:
        break
    }
  }

  // Handle Delete: Open Delete Confirmation Modal
  const handleDelete = (id, type) => {
    setDeleteTargetId(id)
    setDeleteTargetType(type)
    setOpenDeleteModal(true)
  }

  // Confirm Delete
  const confirmDelete = async () => {
    if (!deleteTargetId || !deleteTargetType) return

    try {
      if (deleteTargetType === 'size') {
        await axios.delete(`/api/f_sizeset`, { data: { id: deleteTargetId } })
        setSizes(prev => prev.filter(size => size.id !== deleteTargetId))
        setSnackbar({
          open: true,
          message: 'ขนาดถูกลบเรียบร้อยแล้ว!',
          severity: 'success'
        })
      } else if (deleteTargetType === 'color') {
        await axios.delete(`/api/f_colorset`, { data: { id: deleteTargetId } })
        setColors(prev => prev.filter(color => color.id !== deleteTargetId))
        setSnackbar({
          open: true,
          message: 'สีถูกลบเรียบร้อยแล้ว!',
          severity: 'success'
        })
      } else if (deleteTargetType === 'category') {
        await axios.delete(`/api/f_frameset`, { data: { id: deleteTargetId } })
        setFrames(prev => prev.filter(category => category.id !== deleteTargetId))
        setSnackbar({
          open: true,
          message: 'กรอบถูกลบเรียบร้อยแล้ว!',
          severity: 'success'
        })
      } else if (deleteTargetType === 'set') {
        // เพิ่มกรณีสำหรับ 'set'
        await axios.delete(`/api/f_priceset`, { data: { id: deleteTargetId } })
        setSets(prev => prev.filter(set => set.id !== deleteTargetId))
        setSnackbar({
          open: true,
          message: 'ชุดถูกลบเรียบร้อยแล้ว!',
          severity: 'success'
        })
      }

      // Reset delete target and close modal
      setDeleteTargetId(null)
      setDeleteTargetType(null)
      setOpenDeleteModal(false)
    } catch (error) {
      let message = 'เกิดข้อผิดพลาดในการลบข้อมูล'
      if (error.response && error.response.data && error.response.data.error) {
        message = error.response.data.error
      }

      // Show error snackbar
      setSnackbar({
        open: true,
        message: message,
        severity: 'error'
      })

      // Optionally, reset delete target and close modal
      setDeleteTargetId(null)
      setDeleteTargetType(null)
      setOpenDeleteModal(false)
    }
  }

  const renderActionButtons = (id, type) => (

    
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
      <StyledButton variant='contained' color='primary' onClick={() => handleEdit(id, type)}>
        <SettingsIcon />
      </StyledButton>
      <StyledButton variant='contained' color='error' onClick={() => handleDelete(id, type)}>
        ลบ
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
          <StyledTableCell>
            <Skeleton animation='wave' />
          </StyledTableCell>
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

  // Submit Functions with Enhanced Error Handling
  const submitAddSize = async () => {
    try {
      // Reset previous error
      setSizeError('')

      if (!formData.size.trim()) {
        setSizeError('ชื่อขนาดไม่สามารถเว้นว่างได้')
        return
      }

      const response = await axios.post('/api/f_sizeset', { setsizename: formData.size })
      setSizes(prev => [...prev, response.data.FrameCategory])
      setFormData(prev => ({ ...prev, size: '' }))
      setOpenSizeModal(false)

      // Show success snackbar
      setSnackbar({
        open: true,
        message: 'เพิ่มขนาดเรียบร้อยแล้ว!',
        severity: 'success'
      })
    } catch (error) {
      // Determine error message
      let message = 'เกิดข้อผิดพลาดในการเพิ่มขนาด'
      if (error.response && error.response.data && error.response.data.error) {
        message = error.response.data.error
      }

      // Set error state
      setSizeError(message)

      // Show error snackbar
      setSnackbar({
        open: true,
        message: message,
        severity: 'error'
      })
    }
  }

  const submitAddColor = async () => {
    try {
      setColorError('')

      if (!formData.color.trim()) {
        setColorError('ชื่อสีไม่สามารถเว้นว่างได้')
        return
      }

      const response = await axios.post('/api/f_colorset', { setcolorname: formData.color })
      setColors(prev => [...prev, response.data.FrameColor])
      setFormData(prev => ({ ...prev, color: '' }))
      setOpenColorModal(false)

      setSnackbar({
        open: true,
        message: 'เพิ่มสีเรียบร้อยแล้ว!',
        severity: 'success'
      })
    } catch (error) {
      let message = 'เกิดข้อผิดพลาดในการเพิ่มสี'
      if (error.response && error.response.data && error.response.data.error) {
        message = error.response.data.error
      }

      setColorError(message)

      setSnackbar({
        open: true,
        message: message,
        severity: 'error'
      })
    }
  }

  const submitAddCategory = async () => {
    try {
      setCategoryError('')

      if (!formData.category.trim()) {
        setCategoryError('ชื่อหมวดหมู่ไม่สามารถเว้นว่างได้')
        return
      }

      const response = await axios.post('/api/f_frameset', { framesetname: formData.category })
      setFrames(prev => [...prev, response.data.FrameCategory])
      setFormData(prev => ({ ...prev, category: '' }))
      setOpenCategoryModal(false)

      setSnackbar({
        open: true,
        message: 'เพิ่มกรอบเรียบร้อยแล้ว!',
        severity: 'success'
      })
    } catch (error) {
      let message = 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่'
      if (error.response && error.response.data && error.response.data.error) {
        message = error.response.data.error
      }

      setCategoryError(message)

      setSnackbar({
        open: true,
        message: message,
        severity: 'error'
      })
    }
  }

  const submitAddSet = async () => {
    try {
      setSetError({})

      const { sizeId, colorId, categoryId, price } = formData.set

      // Basic validation
      const errors = {}
      if (!sizeId) errors.sizeId = 'ขนาดเป็นข้อมูลที่จำเป็น'
      if (!colorId) errors.colorId = 'สีเป็นข้อมูลที่จำเป็น'
      if (!categoryId) errors.categoryId = 'หมวดหมู่เป็นข้อมูลที่จำเป็น'
      if (!price) errors.price = 'ราคาถูกต้องเป็นข้อมูลที่จำเป็น'
      else if (price <= 0) errors.price = 'ราคาต้องเป็นค่าบวก'

      if (Object.keys(errors).length > 0) {
        setSetError(errors)
        return
      }

      const response = await axios.post('/api/f_priceset', {
        frameSizeId: sizeId,
        frameColorId: colorId,
        frameCategoryId: categoryId,
        priceset_single: parseFloat(price), // ส่งราคาที่เป็นตัวเลข
        uni_id: JSON.parse(sessionStorage.getItem('selectedUniversity'))?.uni_id || ''
      })

      setSets(prev => [...prev, response.data.FrameSet])
      setFormData(prev => ({
        ...prev,
        set: { sizeId: '', colorId: '', categoryId: '', price: '' }
      }))
      setOpenSetModal(false)

      setSnackbar({
        open: true,
        message: 'เพิ่มชุดเรียบร้อยแล้ว!',
        severity: 'success'
      })

      // Optionally, refetch data to ensure pagination is updated
      fetchData(currentPage)
    } catch (error) {
      let message = 'เกิดข้อผิดพลาดในการเพิ่มชุด'
      if (error.response && error.response.data && error.response.data.error) {
        message = error.response.data.error
      }

      setSetError({ general: message })

      setSnackbar({
        open: true,
        message: message,
        severity: 'error'
      })
    }
  }

  // Submit Update Size
  const submitUpdateSize = async () => {
    try {
      // Reset previous errors
      setEditSizeError('')

      const { id, setsizename } = currentEditSize

      // Basic validation
      if (!setsizename.trim()) {
        setEditSizeError('ชื่อขนาดไม่สามารถเว้นว่างได้')
        return
      }

      // Send PUT request to update the size
      const response = await axios.put('/api/f_sizeset', {
        id,
        setsizename: setsizename.trim()
      })

      // Update the local state
      setSizes(prev => prev.map(size => (size.id === id ? response.data.FrameCategory : size)))

      // Reset form and close modal
      setCurrentEditSize(null)
      setOpenEditSizeModal(false)

      // Show success snackbar
      setSnackbar({
        open: true,
        message: 'แก้ไขขนาดเรียบร้อยแล้ว!',
        severity: 'success'
      })
    } catch (error) {
      let message = 'เกิดข้อผิดพลาดในการแก้ไขขนาด'
      if (error.response && error.response.data && error.response.data.error) {
        message = error.response.data.error
      }

      setEditSizeError(message)

      // Show error snackbar
      setSnackbar({
        open: true,
        message: message,
        severity: 'error'
      })
    }
  }

  // Submit Update Color
  const submitUpdateColor = async () => {
    try {
      // Reset previous errors
      setEditColorError('')

      const { id, setcolorname } = currentEditColor

      // Basic validation
      if (!setcolorname.trim()) {
        setEditColorError('ชื่อสีไม่สามารถเว้นว่างได้')
        return
      }

      // Send PUT request to update the color
      const response = await axios.put('/api/f_colorset', {
        id,
        setcolorname: setcolorname.trim()
      })

      // Update the local state
      setColors(prev => prev.map(color => (color.id === id ? response.data.FrameColor : color)))

      // Reset form and close modal
      setCurrentEditColor(null)
      setOpenEditColorModal(false)

      // Show success snackbar
      setSnackbar({
        open: true,
        message: 'แก้ไขสีเรียบร้อยแล้ว!',
        severity: 'success'
      })
    } catch (error) {
      let message = 'เกิดข้อผิดพลาดในการแก้ไขสี'
      if (error.response && error.response.data && error.response.data.error) {
        message = error.response.data.error
      }

      setEditColorError(message)

      // Show error snackbar
      setSnackbar({
        open: true,
        message: message,
        severity: 'error'
      })
    }
  }

  // Submit Update Frame Category
  const submitUpdateFrameCategory = async () => {
    try {
      // Reset previous errors
      setEditFrameCategoryError('')

      const { id, framesetname } = currentEditFrameCategory

      // Basic validation
      if (!framesetname.trim()) {
        setEditFrameCategoryError('ชื่อหมวดหมู่ไม่สามารถเว้นว่างได้')
        return
      }

      // Send PUT request to update the frame category
      const response = await axios.put('/api/f_frameset', {
        id,
        framesetname: framesetname.trim()
      })

      // Update the local state
      setFrames(prev => prev.map(category => (category.id === id ? response.data.FrameCategory : category)))

      // Reset form and close modal
      setCurrentEditFrameCategory(null)
      setOpenEditFrameCategoryModal(false)

      // Show success snackbar
      setSnackbar({
        open: true,
        message: 'แก้ไขกรอบเรียบร้อยแล้ว!',
        severity: 'success'
      })
    } catch (error) {
      let message = 'เกิดข้อผิดพลาดในการแก้ไขกรอบ'
      if (error.response && error.response.data && error.response.data.error) {
        message = error.response.data.error
      }

      setEditFrameCategoryError(message)

      // Show error snackbar
      setSnackbar({
        open: true,
        message: message,
        severity: 'error'
      })
    }
  }

  // Submit Update Frame Set
  const submitUpdateSet = async () => {
    try {
      // Reset previous errors
      setEditSetError({})

      // console.log(currentEditSet)
      const { id, sizeId, colorId, categoryId, priceset_single } = currentEditSet

      // Basic validation
      const errors = {}
      if (!sizeId) errors.sizeId = 'ขนาดเป็นข้อมูลที่จำเป็น'
      if (!colorId) errors.colorId = 'สีเป็นข้อมูลที่จำเป็น'
      if (!categoryId) errors.categoryId = 'หมวดหมู่เป็นข้อมูลที่จำเป็น'
      if (!priceset_single) errors.priceset_single = 'ราคาถูกต้องเป็นข้อมูลที่จำเป็น'
      else if (priceset_single <= 0) errors.priceset_single = 'ราคาต้องเป็นค่าบวก'

      if (Object.keys(errors).length > 0) {
        setEditSetError(errors)
        return
      }

      // Send PUT request to update the set
      const response = await axios.put('/api/f_priceset', {
        id,
        frameSizeId: sizeId,
        frameColorId: colorId,
        frameCategoryId: categoryId,
        priceset_single: parseFloat(priceset_single)
      })

      // Update the local state
      setSets(prev => prev.map(set => (set.id === id ? response.data.FrameSet : set)))

      // Reset form and close modal
      setCurrentEditSet(null)
      setOpenEditSetModal(false)

      // Show success snackbar
      setSnackbar({
        open: true,
        message: 'แก้ไขชุดเรียบร้อยแล้ว!',
        severity: 'success'
      })
    } catch (error) {
      let message = 'เกิดข้อผิดพลาดในการแก้ไขชุด'
      if (error.response && error.response.data && error.response.data.error) {
        message = error.response.data.error
      }

      setEditSetError({ general: message })

      // Show error snackbar
      setSnackbar({
        open: true,
        message: message,
        severity: 'error'
      })
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
                  <StyledTableHeadCell>
                    <Skeleton animation='wave' />
                  </StyledTableHeadCell>
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
              เพิ่มขนาด
            </StyledButton>
            <TableContainer component={Paper} className='shadow-lg rounded-lg'>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell>ลำดับ</StyledTableHeadCell>
                    <StyledTableHeadCell>ขนาด</StyledTableHeadCell>
                    <StyledTableHeadCell align='right'>การดำเนินการ</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sizes.length === 0 ? (
                    <TableRow>
                      <StyledTableCell colSpan={3} align='center'>
                        ไม่มีข้อมูล
                      </StyledTableCell>
                    </TableRow>
                  ) : (
                    sizes.map((size, index) => (
                      <TableRow key={size.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <StyledTableCell>{index + 1}</StyledTableCell>
                        <StyledTableCell>{size.setsizename}</StyledTableCell>
                        <StyledTableCell align='right'>{renderActionButtons(size.id, 'size')}</StyledTableCell>
                      </TableRow>
                    ))
                  )}
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
              เพิ่มสี
            </StyledButton>
            <TableContainer component={Paper} className='shadow-lg rounded-lg'>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell>ลำดับ</StyledTableHeadCell>
                    <StyledTableHeadCell>สี</StyledTableHeadCell>
                    <StyledTableHeadCell align='right'>การดำเนินการ</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {colors.length === 0 ? (
                    <TableRow>
                      <StyledTableCell colSpan={3} align='center'>
                        ไม่มีข้อมูล
                      </StyledTableCell>
                    </TableRow>
                  ) : (
                    colors.map((color, index) => (
                      <TableRow key={color.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <StyledTableCell>{index + 1}</StyledTableCell>
                        <StyledTableHeadCell>{color.setcolorname}</StyledTableHeadCell>
                        <StyledTableCell align='right'>{renderActionButtons(color.id, 'color')}</StyledTableCell>
                      </TableRow>
                    ))
                  )}
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
              เพิ่มกรอบ
            </StyledButton>
            <TableContainer component={Paper} className='shadow-lg rounded-lg'>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell>ลำดับ</StyledTableHeadCell>
                    <StyledTableHeadCell>หมวดหมู่</StyledTableHeadCell>
                    <StyledTableHeadCell align='right'>การดำเนินการ</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {frames.length === 0 ? (
                    <TableRow>
                      <StyledTableCell colSpan={3} align='center'>
                        ไม่มีข้อมูล
                      </StyledTableCell>
                    </TableRow>
                  ) : (
                    frames.map((frame, index) => (
                      <TableRow key={frame.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <StyledTableCell>{index + 1}</StyledTableCell>
                        <StyledTableHeadCell>{frame.framesetname}</StyledTableHeadCell>
                        <StyledTableCell align='right'>{renderActionButtons(frame.id, 'category')}</StyledTableCell>
                      </TableRow>
                    ))
                  )}
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
              เพิ่มชุด
            </StyledButton>
            <TableContainer component={Paper} className='shadow-lg rounded-lg'>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell>ลำดับ</StyledTableHeadCell>
                    <StyledTableHeadCell>ชื่อกรอบ</StyledTableHeadCell>
                    <StyledTableHeadCell>ขนาด</StyledTableHeadCell>
                    <StyledTableHeadCell>สี</StyledTableHeadCell>
                    <StyledTableHeadCell>ราคา</StyledTableHeadCell>
                    <StyledTableHeadCell>การดำเนินการ</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sets.length === 0 ? (
                    <TableRow>
                      <StyledTableCell colSpan={6} align='center'>
                        ไม่มีข้อมูล
                      </StyledTableCell>
                    </TableRow>
                  ) : (
                    sets.map((set, index) => (
                      <TableRow key={set.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <StyledTableCell>{(currentPage - 1) * limit + index + 1}</StyledTableCell>
                        <StyledTableCell>{set.frameName}</StyledTableCell>
                        <StyledTableCell>{set.sizeName}</StyledTableCell>
                        <StyledTableCell>{set.colorName}</StyledTableCell>

                        {/* แสดงราคาแทนภาพตัวอย่าง */}
                        <StyledTableCell>{set.priceset_single} บาท</StyledTableCell>
                        <StyledTableCell align='right'>{renderActionButtons(set.id, 'set')}</StyledTableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {/* เพิ่ม Pagination */}
            {totalPages > 1 && (
              <Box display='flex' justifyContent='center' mt={2}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(event, value) => setCurrentPage(value)}
                  color='primary'
                />
              </Box>
            )}
          </>
        )
      default:
        return null
    }
  }

  return (
    <Box p={4}>
      <Typography variant='h3' component='h1' gutterBottom>
        {isLoading ? <Skeleton width='50%' /> : 'การตั้งค่า'}
      </Typography>
      <Typography variant='h6' className='text-gray-600 mb-6'>
        {isLoading ? <Skeleton width='70%' /> : 'เพิ่ม, ลบ, แก้ไข ขนาดกรอบ, สี, หมวดหมู่, และราคาเซ็ตกรอบ'}
      </Typography>
      <Box mb={4} display='flex' gap={2}>
        {isLoading ? (
          <>
            <Skeleton variant='rectangular' width={100} height={36} />
            <Skeleton variant='rectangular' width={100} height={36} />
            <Skeleton variant='rectangular' width={100} height={36} />
            <Skeleton variant='rectangular' width={150} height={36} />
          </>
        ) : (
          <>
            <StyledButton
              variant={activeSection === 'size' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => setActiveSection('size')}
            >
              จัดการขนาด
            </StyledButton>
            <StyledButton
              variant={activeSection === 'color' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => setActiveSection('color')}
            >
              จัดการสี
            </StyledButton>
            <StyledButton
              variant={activeSection === 'category' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => setActiveSection('category')}
            >
              จัดการกรอบ
            </StyledButton>
            <StyledButton
              variant={activeSection === 'sets' ? 'contained' : 'outlined'}
              color='primary'
              onClick={() => setActiveSection('sets')}
            >
              จัดการราคารูปเดียว
            </StyledButton>
          </>
        )}
      </Box>
      {renderSection()}

      {/* Modals with Error Props */}
      <AddSizeModal
        open={openSizeModal}
        onClose={() => setOpenSizeModal(false)}
        onAdd={submitAddSize}
        sizeValue={formData.size}
        onChange={value => handleInputChange('size', value)}
        error={sizeError}
      />
      <AddColorModal
        open={openColorModal}
        onClose={() => setOpenColorModal(false)}
        onAdd={submitAddColor}
        colorValue={formData.color}
        onChange={value => handleInputChange('color', value)}
        error={colorError}
      />
      <AddCategoryModal
        open={openCategoryModal}
        onClose={() => setOpenCategoryModal(false)}
        onAdd={submitAddCategory}
        categoryValue={formData.category}
        onChange={value => handleInputChange('category', value)}
        error={categoryError}
      />
      <AddSetModal
        open={openSetModal}
        onClose={() => setOpenSetModal(false)}
        onAdd={submitAddSet}
        setData={formData.set}
        onChange={value => handleInputChange('set', value)}
        sizes={sizes}
        colors={colors}
        categories={frames}
        error={setError}
      />

      {/* Edit Size Modal */}
      {currentEditSize && (
        <EditSizeModal
          open={openEditSizeModal}
          onClose={() => {
            setOpenEditSizeModal(false)
            setCurrentEditSize(null)
            setEditSizeError('')
          }}
          onUpdate={submitUpdateSize}
          sizeData={currentEditSize}
          onChange={updatedFields => {
            setCurrentEditSize(prev => ({
              ...prev,
              ...updatedFields
            }))
          }}
          error={editSizeError}
        />
      )}

      {/* Edit Color Modal */}
      {currentEditColor && (
        <EditColorModal
          open={openEditColorModal}
          onClose={() => {
            setOpenEditColorModal(false)
            setCurrentEditColor(null)
            setEditColorError('')
          }}
          onUpdate={submitUpdateColor}
          colorData={currentEditColor}
          onChange={updatedFields => {
            setCurrentEditColor(prev => ({
              ...prev,
              ...updatedFields
            }))
          }}
          error={editColorError}
        />
      )}

      {/* Edit Frame Category Modal */}
      {currentEditFrameCategory && (
        <EditFrameCategoryModal
          open={openEditFrameCategoryModal}
          onClose={() => {
            setOpenEditFrameCategoryModal(false)
            setCurrentEditFrameCategory(null)
            setEditFrameCategoryError('')
          }}
          onUpdate={submitUpdateFrameCategory}
          categoryData={currentEditFrameCategory}
          onChange={updatedFields => {
            setCurrentEditFrameCategory(prev => ({
              ...prev,
              ...updatedFields
            }))
          }}
          error={editFrameCategoryError}
        />
      )}

      {/* Edit Set Modal */}
      {currentEditSet && (
        <EditSetModal
          open={openEditSetModal}
          onClose={() => {
            setOpenEditSetModal(false)
            setCurrentEditSet(null)
            setEditSetError({})
          }}
          onUpdate={submitUpdateSet}
          setData={currentEditSet}
          onChange={updatedFields => {
            setCurrentEditSet(prev => ({
              ...prev,
              ...updatedFields
            }))
          }}
          sizes={sizes}
          colors={colors}
          categories={frames}
          error={editSetError}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false)
          setDeleteTargetId(null)
          setDeleteTargetType(null)
        }}
        onConfirm={confirmDelete}
        title='ยืนยันการลบ'
        content={`คุณแน่ใจหรือไม่ว่าต้องการลบ ${
          deleteTargetType === 'category'
            ? 'กรอบ'
            : deleteTargetType === 'size'
              ? 'ขนาด'
              : deleteTargetType === 'color'
                ? 'สี'
                : 'ชุด'
        } นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้.`}
      />

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
