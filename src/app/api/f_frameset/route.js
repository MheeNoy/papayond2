// /app/api/f_frameset/route.js

import mysql from 'mysql2/promise'

// สร้าง connection pool เพื่อเพิ่มประสิทธิภาพ
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // ปรับตามความเหมาะสมของเซิร์ฟเวอร์คุณ
  queueLimit: 0
})

// GET Handler: ดึงข้อมูลทั้งหมดจาก f_frameset
export async function GET() {
  let connection
  try {
    connection = await pool.getConnection()
    const [rows] = await connection.execute('SELECT * FROM f_frameset')
    return new Response(JSON.stringify({ FrameCategory: rows }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Database query error:', error)
    return new Response(JSON.stringify({ error: 'Database query failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) connection.release()
  }
}

// POST Handler: เพิ่มกรอบใหม่
export async function POST(request) {
  let connection
  try {
    connection = await pool.getConnection()
    const { framesetname } = await request.json()

    // ตรวจสอบความถูกต้องของข้อมูล
    if (!framesetname || typeof framesetname !== 'string' || framesetname.trim() === '') {
      return new Response(JSON.stringify({ error: 'Invalid or missing "framesetname"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const trimmedFrameSetName = framesetname.trim()

    // ตรวจสอบว่ามีกรอบชื่อนี้อยู่แล้วหรือไม่ (อาจจะไม่จำเป็นขึ้นอยู่กับความต้องการ)
    const [existingRows] = await connection.execute('SELECT * FROM f_frameset WHERE framesetname = ?', [
      trimmedFrameSetName
    ])

    if (existingRows.length > 0) {
      return new Response(JSON.stringify({ error: 'Frame category name already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // เพิ่มกรอบใหม่ลงในฐานข้อมูล
    const [result] = await connection.execute('INSERT INTO f_frameset (framesetname) VALUES (?)', [trimmedFrameSetName])

    // ดึงข้อมูลกรอบที่เพิ่งเพิ่ม
    const [newFrameRows] = await connection.execute('SELECT * FROM f_frameset WHERE id = ?', [result.insertId])

    const newFrame = newFrameRows[0]

    return new Response(JSON.stringify({ FrameCategory: newFrame }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Database insertion error:', error)
    return new Response(JSON.stringify({ error: 'Failed to add new frame category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) connection.release()
  }
}

// PUT Handler: แก้ไขกรอบตาม ID
export async function PUT(request) {
  let connection
  try {
    connection = await pool.getConnection()
    const body = await request.json()
    const { id, framesetname } = body

    // ตรวจสอบฟิลด์ที่จำเป็น
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id field' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!framesetname || typeof framesetname !== 'string' || framesetname.trim() === '') {
      return new Response(JSON.stringify({ error: 'Invalid or missing "framesetname"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const trimmedFrameSetName = framesetname.trim()

    // ตรวจสอบว่ากรอบที่ต้องการแก้ไขมีอยู่จริงหรือไม่
    const [existingRows] = await connection.execute('SELECT * FROM f_frameset WHERE id = ?', [id])
    if (existingRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Frame category not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ตรวจสอบว่ามีกรอบชื่อซ้ำกันหรือไม่ (ยกเว้นกรอบที่กำลังแก้ไข)
    const [duplicateRows] = await connection.execute('SELECT * FROM f_frameset WHERE framesetname = ? AND id != ?', [
      trimmedFrameSetName,
      id
    ])
    if (duplicateRows.length > 0) {
      return new Response(JSON.stringify({ error: 'Another frame category with this name already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // อัปเดตกรอบ
    const updateQuery = 'UPDATE f_frameset SET framesetname = ? WHERE id = ?'
    await connection.execute(updateQuery, [trimmedFrameSetName, id])

    // ดึงข้อมูลกรอบที่อัปเดตแล้ว
    const [updatedRows] = await connection.execute('SELECT * FROM f_frameset WHERE id = ?', [id])
    const updatedFrame = updatedRows[0]

    return new Response(JSON.stringify({ FrameCategory: updatedFrame }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error handling PUT request:', error)
    return new Response(JSON.stringify({ error: 'Error updating frame category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) connection.release()
  }
}

// DELETE Handler: ลบกรอบตาม ID
export async function DELETE(request) {
  let connection
  try {
    connection = await pool.getConnection()

    // แยก query parameters จาก URL ของ request
    const url = new URL(request.url)
    const idParam = url.searchParams.get('id')

    const {id}  = await request.json();
    // ตรวจสอบพารามิเตอร์ id
    if (!id) {
      console.error('DELETE request missing id parameter')
      return new Response(JSON.stringify({ error: 'Missing id query parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // const id = parseInt(idParam, 10)
    // if (isNaN(id)) {
    //   console.error(`Invalid id parameter: ${idParam}`)
    //   return new Response(JSON.stringify({ error: 'Invalid id parameter' }), {
    //     status: 400,
    //     headers: { 'Content-Type': 'application/json' }
    //   })
    // }

    // ตรวจสอบว่ากรอบมีอยู่จริงหรือไม่
    const [existingRows] = await connection.execute('SELECT * FROM f_frameset WHERE id = ?', [id])
    if (existingRows.length === 0) {
      console.warn(`Frame category with id ${id} not found`)
      return new Response(JSON.stringify({ error: 'Frame category not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ลบกรอบจากตาราง f_frameset โดยไม่ตรวจสอบ dependencies
    const deleteQuery = 'DELETE FROM f_frameset WHERE id = ?'
    await connection.execute(deleteQuery, [id])

    // ตอบกลับด้วยข้อความสำเร็จ
    return new Response(JSON.stringify({ message: 'Frame category deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error handling DELETE request:', error)
    return new Response(JSON.stringify({ error: 'Error deleting frame category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) connection.release()
  }
}
