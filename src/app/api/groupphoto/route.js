// pages/api/bookingfw.js

import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export async function POST(request) {
  try {
    const data = await request.json()
    const { uni_id } = data

    // ตรวจสอบว่ามีการส่ง uni_id มาหรือไม่
    if (!uni_id) {
      return NextResponse.json({ success: false, message: 'ไม่พบ uni_id' }, { status: 400 })
    }

    // สร้างการเชื่อมต่อฐานข้อมูล
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    })

    // ดึงข้อมูลจากตาราง b_bookingfw โดยใช้ uni_id
    const [rows] = await connection.execute(
      `SELECT booking_no, booking_set, amount, send_type, add_ademgo, chang_eleph, film_no
       FROM b_bookingfw
       WHERE uni_id = ?`,
      [uni_id]
    )

    // ปิดการเชื่อมต่อฐานข้อมูล
    await connection.end()

    // ส่งข้อมูลกลับไปยังฝั่งลูกค้า
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching data from b_bookingfw:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 })
  }
}
