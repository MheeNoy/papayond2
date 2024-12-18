// app/api/prefix/route.js
import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// สร้างการเชื่อมต่อฐานข้อมูลภายในฟังก์ชัน handler
async function getConnection() {
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

// GET: ดึงข้อมูลทั้งหมดจาก m_signs
export async function GET() {
  try {
    const connection = await getConnection()
    const [rows] = await connection.query('SELECT * FROM m_signs')
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching prefixes:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

// POST: เพิ่มข้อมูลใหม่ลงใน m_signs
export async function POST(request) {
  try {
    const { title } = await request.json() // ใช้ 'title' แทน 'name'
    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 })
    }

    const connection = await getConnection()
    const [result] = await connection.query('INSERT INTO m_signs (title) VALUES (?)', [title]) // ใช้ 'title'
    return NextResponse.json({ id: result.insertId, title }, { status: 201 }) // ส่ง 'title'
  } catch (error) {
    console.error('Error creating prefix:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT: แก้ไขข้อมูลใน m_signs โดย id
export async function PUT(request) {
  try {
    const { id, title } = await request.json() // รับ 'id' และ 'title' จาก body
    if (!id || !title) {
      return NextResponse.json({ message: 'ID and Title are required' }, { status: 400 })
    }

    const connection = await getConnection()
    const [result] = await connection.query('UPDATE m_signs SET title = ? WHERE id = ?', [title, id]) // ใช้ 'title' และ 'id'

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Prefix not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Updated successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error updating prefix:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: ลบข้อมูลจาก m_signs โดย id
export async function DELETE(request) {
  try {
    const { id } = await request.json() // รับ 'id' จาก body
    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 })
    }

    const connection = await getConnection()
    const [result] = await connection.query('DELETE FROM m_signs WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Prefix not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting prefix:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
