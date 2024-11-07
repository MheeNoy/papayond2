import mysql from 'mysql2/promise'

// ฟังก์ชันเชื่อมต่อกับฐานข้อมูล
const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

// API POST เพื่อดึงข้อมูลจากตาราง address_booking
export async function POST(request) {
  let connection
  try {
    // ดึงข้อมูลจาก body ของ request
    const { address_id, booking_no } = await request.json()

    // ตรวจสอบว่า address_id มีค่าไหม
    if (!address_id) {
      return new Response(JSON.stringify({ error: 'Parameter address_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // เชื่อมต่อกับฐานข้อมูล
    connection = await dbConnect()
    console.log('Connected to database for POST request')

    let query
    let params
    let responseData

    if (booking_no) {
      // หากมีการส่ง booking_no มาพร้อมกับ address_id ให้ดึงข้อมูลทั้งหมดของ booking นั้น
      query = 'SELECT * FROM address_booking WHERE address_id = ? AND booking_no = ?'
      params = [address_id, booking_no]
      const [rows] = await connection.execute(query, params)

      if (rows.length === 0) {
        return new Response(
          JSON.stringify({
            message: `No booking data found for address_id = ${address_id} and booking_no = ${booking_no}`
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      // ส่งข้อมูลทั้งหมดของ booking ที่พบ
      responseData = rows
    } else {
      // หากไม่มี booking_no ให้ดึงเฉพาะรายการ booking_no ตาม address_id
      query = 'SELECT booking_no FROM address_booking WHERE address_id = ?'
      params = [address_id]
      const [rows] = await connection.execute(query, params)

      // สร้างอาร์เรย์ของ booking_no จากผลลัพธ์ที่ได้
      const bookingNumbers = rows.map(row => row.booking_no)

      // ส่งข้อมูล booking_no กลับไป (รวมถึงกรณีที่ไม่มี booking_no)
      responseData = { booking_numbers: bookingNumbers }
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    // จัดการข้อผิดพลาดและส่ง response กลับ
    console.error('Error details:', error)
    return new Response(JSON.stringify({ error: 'Data could not be fetched', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    // ปิดการเชื่อมต่อฐานข้อมูล
    if (connection) {
      await connection.end()
      console.log('Disconnected from database for POST request')
    }
  }
}
