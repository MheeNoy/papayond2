// app/api/users/route.js
import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt' // นำเข้า bcrypt

// ฟังก์ชันเชื่อมต่อกับฐานข้อมูล
const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

// ฟังก์ชัน POST สำหรับเพิ่มผู้ใช้ใหม่
export async function POST(request) {
  let connection

  try {
    const body = await request.json()
    const { name, email, username, password, confirmPassword } = body

    // การตรวจสอบข้อมูลพื้นฐาน
    if (!name || !email || !username || !password || !confirmPassword) {
      return new Response(JSON.stringify({ message: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (password !== confirmPassword) {
      return new Response(JSON.stringify({ message: 'Passwords do not match' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // การตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ message: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // การตรวจสอบรูปแบบ username (ตัวอักษร, ตัวเลข, ขีดล่าง, 3-30 ตัวอักษร)
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
    if (!usernameRegex.test(username)) {
      return new Response(
        JSON.stringify({ message: 'Invalid username format. Use 3-30 characters: letters, numbers, underscores.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // เชื่อมต่อกับฐานข้อมูล
    connection = await dbConnect()

    // ตรวจสอบว่า username หรือ email มีอยู่แล้วหรือไม่
    const [rows] = await connection.execute('SELECT id FROM users WHERE username = ? OR email = ?', [username, email])

    if (rows.length > 0) {
      return new Response(JSON.stringify({ message: 'Username or Email already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // แฮชพาสเวิร์ด
    const hashedPassword = await bcrypt.hash(password, 10)

    // ใส่ข้อมูลผู้ใช้ใหม่ลงในฐานข้อมูล
    const [result] = await connection.execute(
      `INSERT INTO users (name, email, role, username, password, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, email, 'user', username, hashedPassword] // ปรับค่า role ตามต้องการ
    )

    // ดึงข้อมูลผู้ใช้ที่เพิ่งถูกสร้างขึ้น (ยกเว้นรหัสผ่าน)
    const newUserId = result.insertId
    const [newUserRows] = await connection.execute(
      'SELECT id, name, email, role, username, created_at, updated_at FROM users WHERE id = ?',
      [newUserId]
    )

    const newUser = newUserRows[0]
    newUser.permissions = [] // เพิ่มฟิลด์ permissions เป็นอาร์เรย์ว่าง

    return new Response(JSON.stringify(newUser), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    if (process.env.NODE_ENV === 'development') {
      return new Response(JSON.stringify({ message: 'Internal server error', error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// ฟังก์ชัน DELETE สำหรับลบผู้ใช้

export async function DELETE(request) {
  let connection

  try {
    const body = await request.json()
    console.log('DELETE request body:', body) // Log ข้อมูลที่รับมา
    const { id } = body

    // ตรวจสอบว่า id ถูกส่งมาไหม
    if (!id) {
      return new Response(JSON.stringify({ message: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // เชื่อมต่อกับฐานข้อมูล
    connection = await dbConnect()

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [rows] = await connection.execute('SELECT id FROM users WHERE id = ?', [id])

    if (rows.length === 0) {
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ลบผู้ใช้จากตาราง users
    await connection.execute('DELETE FROM users WHERE id = ?', [id])

    return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    if (process.env.NODE_ENV === 'development') {
      return new Response(JSON.stringify({ message: 'Internal server error', error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
