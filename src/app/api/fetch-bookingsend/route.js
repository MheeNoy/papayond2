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
  const { uni_id } = await request.json() // รับค่า uni_id จาก body ของ request
  console.log('Received uni_id:', uni_id) // เพิ่มการแสดงผล uni_id

  let connection

  try {
    connection = await dbConnect()

    // ดึงข้อมูลจากตาราง b_bookingsend
    const bookingQuery = `
      SELECT * FROM b_bookingsend WHERE uni_id = ?
    `
    const [bookingRows] = await connection.execute(bookingQuery, [uni_id])

    // ดึงข้อมูลจากตาราง address_booking โดยใช้ booking_no จากผลลัพธ์แรก
    const bookingNos = bookingRows.map(row => row.booking_no)
    let addressRows = []

    if (bookingNos.length > 0) {
      const placeholders = bookingNos.map(() => '?').join(',')
      const addressQuery = `
        SELECT booking_no, name_for_rec FROM address_booking WHERE booking_no IN (${placeholders})
      `
      const [addressResults] = await connection.execute(addressQuery, bookingNos)
      addressRows = addressResults
    }

    // รวมข้อมูลจากทั้งสองตารางโดย match booking_no
    const combinedData = bookingRows.map(booking => {
      const address = addressRows.find(addr => addr.booking_no === booking.booking_no)
      return {
        ...booking,
        customerName: address ? address.name_for_rec : null
      }
    })

    return NextResponse.json({ success: true, data: combinedData })
  } catch (error) {
    console.error('Error fetching booking data:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch booking data' }, { status: 500 })
  } finally {
    if (connection) await connection.end()
  }
}
