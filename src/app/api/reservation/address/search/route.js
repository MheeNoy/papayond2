// app/api/reservation/address/search.js
import mysql from 'mysql2/promise'
import { NextResponse } from 'next/server'

// บังคับใช้ dynamic rendering
export const dynamic = 'force-dynamic'

// ฟังก์ชันเชื่อมต่อฐานข้อมูล
const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

export async function GET(req) {
  let connection
  try {
    // สร้างออบเจ็กต์ URL จาก req.url
    const url = new URL(req.url)
    const searchParams = url.searchParams

    // ดึงพารามิเตอร์ 'film_no' และ 'uni_id' จาก searchParams
    const film_no = searchParams.get('film_no')
    const uni_id = searchParams.get('uni_id')

    // ตรวจสอบความถูกต้องของพารามิเตอร์
    if (!film_no || !uni_id || isNaN(parseInt(uni_id))) {
      return NextResponse.json({ error: 'Invalid film_no or uni_id parameter' }, { status: 400 })
    }

    // เชื่อมต่อฐานข้อมูล
    connection = await dbConnect()

    // ค้นหา address ที่ตรงกับ film_no และ uni_id
    const [addressRows] = await connection.execute(`SELECT id FROM address WHERE film_no = ? AND uni_id = ?`, [
      film_no,
      parseInt(uni_id)
    ])

    // ถ้าไม่พบ address ที่ตรงกัน
    if (addressRows.length === 0) {
      return NextResponse.json({ error: 'No address found for the given film_no and uni_id' }, { status: 404 })
    }

    // สมมุติว่าเพียง address เดียวที่ตรงกัน จะส่งคืน id ของ address นั้น
    const addressId = addressRows[0].id

    return NextResponse.json({ id: addressId }, { status: 200 })
  } catch (error) {
    console.error('Error in search API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
