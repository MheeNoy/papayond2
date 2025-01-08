// app/api/university/route.js
import mysql from 'mysql2/promise'

// ฟังก์ชันเชื่อมต่อฐานข้อมูล
const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

// GET: ดึงข้อมูลทั้งหมดจากตาราง m_univercities
// POST: เพิ่มมหาวิทยาลัยใหม่ลงในตาราง m_univercities
// PUT: อัปเดตมหาวิทยาลัยที่ระบุ id ผ่าน Request Body
// DELETE: ลบมหาวิทยาลัยที่ระบุ id ผ่าน Request Body

export async function GET(request) {
  const connection = await dbConnect()

  try {
    // ดึงข้อมูลทั้งหมดจากตาราง m_univercities
    const [universities] = await connection.execute('SELECT * FROM m_univercities')

    return new Response(JSON.stringify({ universities }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error handling GET request:', error)

    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการประมวลผลคำขอ', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    await connection.end()
  }
}

export async function POST(request) {
  let connection
    

  try {
    // const { unino, uniname, location, uni_year } = await request.json()

    const body = await request.json()
    const { unino, uniname, location, uni_year}  = body


    // ตรวจสอบว่ามีข้อมูลครบถ้วน
    if (!unino || !uniname || !uni_year) {
      return new Response(JSON.stringify({ error: 'กรุณากรอกข้อมูลที่จำเป็นทั้งหมด' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    // เชื่อมต่อกับฐานข้อมูล
    connection = await dbConnect()
    // เพิ่มมหาวิทยาลัยใหม่ลงในฐานข้อมูล
    const [result] = await connection.execute(
      `INSERT INTO m_univercities (unino, uniname, location, uni_year, created_at, updated_at) 
      VALUES (?, ?, ?,?,NOW(), NOW())`,
      [unino, uniname, location || '', uni_year]
    )
    // const [result] = await connection.execute(
    //   `INSERT INTO users (name, email, role, username, password, created_at, updated_at)
    //    VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    //   [name, email, 'user', username, hashedPassword] // ใช้ plainPassword แทน hashedPassword
    // )
    return new Response(JSON.stringify({ message: 'เพิ่มมหาวิทยาลัยสำเร็จ', id: '' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error handling POST request:', error)

    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการประมวลผลคำขอ', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    await connection.end()
  }
}

export async function PUT(request) {
  const connection = await dbConnect()

  try {
    const { id, unino, uniname, location, uni_year } = await request.json()

    // ตรวจสอบว่ามี id และข้อมูลจำเป็นครบถ้วน
    if (!id || !unino || !uniname || !uni_year) {
      return new Response(JSON.stringify({ error: 'กรุณาระบุ id และกรอกข้อมูลที่จำเป็นทั้งหมด' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // อัปเดตมหาวิทยาลัยในฐานข้อมูล
    const [result] = await connection.execute(
      'UPDATE m_univercities SET unino = ?, uniname = ?, location = ?, uni_year = ?, updated_at = NOW() WHERE id = ?',
      [unino, uniname, location || '', uni_year, id]
    )

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'ไม่พบมหาวิทยาลัยที่ระบุ' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ message: 'อัปเดตมหาวิทยาลัยสำเร็จ' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error handling PUT request:', error)

    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการประมวลผลคำขอ', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    await connection.end()
  }
}

export async function DELETE(request) {
  const connection = await dbConnect()

  try {
    const { id } = await request.json()

    // ตรวจสอบว่ามี id
    if (!id) {
      return new Response(JSON.stringify({ error: 'กรุณาระบุ id ของมหาวิทยาลัยที่ต้องการลบ' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ลบมหาวิทยาลัยจากฐานข้อมูล
    const [result] = await connection.execute('DELETE FROM m_univercities WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'ไม่พบมหาวิทยาลัยที่ระบุ' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ message: 'ลบมหาวิทยาลัยสำเร็จ' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error handling DELETE request:', error)

    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการประมวลผลคำขอ', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    await connection.end()
  }
}
