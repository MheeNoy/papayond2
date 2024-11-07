import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

export async function POST(request) {
  let connection
  try {
    connection = await dbConnect()
    console.log('Connected to database for updateBooking')

    const data = await request.json()
    console.log('Received data for updateBooking:', data)

    const {
      id, // ใช้ `id` เป็น `address_id`
      booking_no, // ใช้ในการระบุแถวที่ต้องการอัปเดต
      ...fieldsToUpdate // ฟิลด์ที่ต้องการอัปเดต
    } = data

    const address_id = id
    const update_date = new Date().toISOString()

    // ตรวจสอบว่า booking_no และ address_id ถูกส่งมาหรือไม่
    if (!booking_no || !address_id) {
      console.error('Missing booking_no or address_id')
      return NextResponse.json({ success: false, error: 'booking_no and address_id are required' }, { status: 400 })
    }

    // ตรวจสอบว่ามีฟิลด์ที่ต้องการอัปเดตหรือไม่
    if (Object.keys(fieldsToUpdate).length === 0) {
      console.error('No fields to update')
      return NextResponse.json({ success: false, error: 'No fields provided to update' }, { status: 400 })
    }

    // เพิ่มฟิลด์ update_by และ update_date เสมอ
    fieldsToUpdate.update_by = data.update_by || 'Unknown'
    fieldsToUpdate.update_date = update_date

    // สร้าง SET clause แบบไดนามิก
    const setClause = Object.keys(fieldsToUpdate)
      .map(field => `${field} = ?`)
      .join(', ')

    const values = Object.values(fieldsToUpdate)

    // เพิ่มค่า booking_no และ address_id สำหรับ WHERE clause
    values.push(booking_no, address_id)

    // สร้างคำสั่ง SQL แบบไดนามิก
    const query = `
      UPDATE address_booking
      SET ${setClause}
      WHERE booking_no = ? AND address_id = ?
    `

    console.log('Executing query:', query)
    console.log('With values:', values)

    const [result] = await connection.execute(query, values)
    console.log('Number of rows affected:', result.affectedRows)

    if (result.affectedRows === 0) {
      console.error('No rows updated. Please check booking_no and address_id.')
      return NextResponse.json(
        { success: false, error: 'No rows updated. Please check booking_no and address_id.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Booking data updated successfully' })
  } catch (error) {
    console.error('Error updating booking data:', error.message)
    console.error('Stack Trace:', error.stack)
    return NextResponse.json({ success: false, error: 'Failed to update booking data' }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
      console.log('Disconnected from database for updateBooking')
    }
  }
}
