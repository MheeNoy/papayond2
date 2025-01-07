// app/api/reservation/address/create/route.js

import mysql from 'mysql2/promise'
import { NextResponse } from 'next/server'

// ฟังก์ชันสำหรับเชื่อมต่อฐานข้อมูล
const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

export async function POST(req) {
  try {
    // JSON
    const { fname, lname, bookingNumber, uni_id, update_by } = await req.json()

    // การตรวจสอบพื้นฐาน
    if (!fname || !lname || !bookingNumber || !uni_id || !update_by) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    let connection

    try {
      // เชื่อมต่อฐานข้อมูล
      connection = await dbConnect()

      await connection.beginTransaction()

      // ตรวจสอบว่า bookingNumber มีอยู่แล้ว
      const [existingBookings] = await connection.execute('SELECT id FROM address WHERE booking_no = ?', [
        bookingNumber
      ])

      if (existingBookings.length > 0) {
        await connection.rollback()
        return NextResponse.json({ success: false, message: 'Booking number already exists' }, { status: 409 })
      }

      // บันทึก address ใหม่
      const [result] = await connection.execute(
        `INSERT INTO address (fname, lname, booking_no, uni_id, update_by)
         VALUES (?, ?, ?, ?, ?)`,
        [fname, lname, bookingNumber, uni_id, update_by]
      )

      const newAddressId = result.insertId

      // สร้าง name_for_rec โดยรวม fname และ lname
      const name_for_rec = `${fname} ${lname}`

      // บันทึก address_booking ใหม่
      const [bookingResult] = await connection.execute(
        `INSERT INTO address_booking (address_id, booking_no, uni_id, name_for_rec, update_date, update_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [newAddressId, bookingNumber, uni_id, name_for_rec, new Date(), update_by]
      )

      await connection.commit()

      return NextResponse.json(
        {
          success: true,
          data: {
            id: newAddressId,
            fname,
            lname,
            booking_no: bookingNumber,
            uni_id,
            update_date: new Date(), // เวลาปัจจุบัน
            update_by
          }
        },
        { status: 201 }
      )
    } catch (error) {
      if (connection) {
        await connection.rollback()
      }
      console.error('Error creating new booking:', error)
      return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
    } finally {
      if (connection) {
        await connection.end()
      }
    }
  } catch (error) {
    console.error('Error parsing request:', error)
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }
}
