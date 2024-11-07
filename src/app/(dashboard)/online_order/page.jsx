'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  Box
} from '@mui/material'

const OnlineOrderTable = () => {
  const [orders, setOrders] = useState([])
  const [open, setOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/getdata-online')
        setOrders(response.data.orders)
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    }

    fetchOrders()
  }, [])

  const handleOpen = picturepath => {
    setSelectedImage(`https://pansawut.orangeworkshop.info/papayond/dist/img/qrcodefromuser/${picturepath}`)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedImage(null)
  }

  const handleConfirm = async booking_no => {
    try {
      const response = await axios.post('/api/getdata-online', { booking_no })
      if (response.status === 200) {
        alert('ยืนยันการจองสำเร็จ')
        // อัปเดตสถานะในรายการที่แสดงอยู่ในตารางหลังจากยืนยันสำเร็จ
        setOrders(prevOrders =>
          prevOrders.map(order => (order.booking_no === booking_no ? { ...order, status: 'paid' } : order))
        )
      }
    } catch (error) {
      console.error('Error confirming booking:', error)
      alert('เกิดข้อผิดพลาดในการยืนยันการจอง')
    }
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label='online order table'>
        <TableHead>
          <TableRow>
            <TableCell>หมายเลขการจอง</TableCell>
            <TableCell>ชื่อ-นามสกุลผู้จอง</TableCell>
            <TableCell>มหาวิทยาลัย</TableCell>
            <TableCell>คณะ</TableCell>
            <TableCell>เบอร์โทร</TableCell>
            <TableCell>ชุดที่จอง</TableCell>
            <TableCell>วันที่จอง</TableCell>
            <TableCell>รวมที่ต้องชำระ</TableCell> {/* คอลัมน์ใหม่ */}
            <TableCell>ดูรูป</TableCell>
            <TableCell>การจัดการ</TableCell> {/* คอลัมน์รวมปุ่มยืนยันและยกเลิก */}
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell>{order.booking_no}</TableCell>
              <TableCell>
                {order.fname} {order.lname}
              </TableCell>
              <TableCell>{order.uniname}</TableCell>
              <TableCell>{order.facuname}</TableCell>
              <TableCell>{order.tel}</TableCell>
              {/* แสดงชุดที่จองพร้อมจำนวน */}
              <TableCell>
                {order.sets && order.sets.length > 0
                  ? order.sets.map((set, index) => (
                      <div key={index}>
                        ชุดที่ {set.group_id}: {set.amount} ชิ้น
                      </div>
                    ))
                  : 'ไม่มีชุดที่จอง'}
              </TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell> {/* วันที่จอง */}
              {/* คอลัมน์แสดงรวมที่ต้องชำระ */}
              <TableCell>{order.total_price ? `${order.total_price} บาท` : 'ไม่ระบุ'}</TableCell>
              <TableCell>
                {order.picturepath ? (
                  <Button variant='contained' color='primary' onClick={() => handleOpen(order.picturepath)}>
                    รูป
                  </Button>
                ) : (
                  'ยังไม่ได้แนบรูป'
                )}
              </TableCell>
              <TableCell>
                {/* ปุ่มยืนยันและยกเลิกในช่องเดียวกัน */}
                <Button
                  variant='contained'
                  color='success'
                  fullWidth
                  style={{ marginBottom: '8px' }}
                  onClick={() => handleConfirm(order.booking_no)}
                >
                  ยืนยัน
                </Button>
                <Button variant='contained' color='error' fullWidth>
                  ยกเลิก
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal สำหรับแสดงรูปภาพ */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {selectedImage && (
            <img src={selectedImage} alt='รูปภาพการจอง' style={{ maxWidth: '100%', maxHeight: '80vh' }} />
          )}
        </Box>
      </Modal>
    </TableContainer>
  )
}

export default OnlineOrderTable
