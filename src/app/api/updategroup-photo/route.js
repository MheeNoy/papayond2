// pages/api/updategroup-photo.js
import mysql from 'mysql2/promise'

const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

export async function PUT(request) {
  let connection

  try {
    // เชื่อมต่อกับฐานข้อมูล
    connection = await dbConnect()

    // ดึงค่า body จาก request
    const body = await request.json()
    const {
      id,
      posiphoto_1,
      posiphoto_2,
      posiphoto_3,
      posiphoto_4,
      posiphoto_5,
      posiphoto_6,
      posiphoto_7,
      posiphoto_8,
      posiphoto_9,
      film_no,
      update_by
    } = body

    // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วน
    if (!id || !update_by) {
      return new Response(JSON.stringify({ error: 'Missing id or update_by in body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // สร้าง query สำหรับอัปเดตข้อมูล
    const updateQuery = `
      UPDATE address
      SET
        posiphoto_1 = ?,
        posiphoto_2 = ?,
        posiphoto_3 = ?,
        posiphoto_4 = ?,
        posiphoto_5 = ?,
        posiphoto_6 = ?,
        posiphoto_7 = ?,
        posiphoto_8 = ?,
        posiphoto_9 = ?,
        film_no = ?,
        update_date = NOW(),
        update_by = ?
      WHERE id = ?
    `

    const updateValues = [
      posiphoto_1,
      posiphoto_2,
      posiphoto_3,
      posiphoto_4,
      posiphoto_5,
      posiphoto_6,
      posiphoto_7,
      posiphoto_8,
      posiphoto_9,
      film_no,
      update_by,
      id
    ]

    // ทำการอัปเดตข้อมูลในฐานข้อมูล
    const [result] = await connection.execute(updateQuery, updateValues)

    // ปิดการเชื่อมต่อหลังจากอัปเดตข้อมูลเสร็จ
    await connection.end()

    // ตรวจสอบว่ามีการอัปเดตแถวใดบ้าง
    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'No address found with the provided id' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ส่งข้อมูลกลับเป็น JSON ว่าอัปเดตสำเร็จ
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error updating address:', error.message)

    // ปิดการเชื่อมต่อในกรณีที่เกิดข้อผิดพลาด
    if (connection) await connection.end()

    return new Response(JSON.stringify({ error: 'Failed to update address' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
