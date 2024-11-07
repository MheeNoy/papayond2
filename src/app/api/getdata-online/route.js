// /app/api/getOnlineBookings/route.js

import mysql from 'mysql2/promise'

const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

export async function GET(request) {
  let dbConnection

  try {
    // เชื่อมต่อฐานข้อมูล
    dbConnection = await dbConnect()

    // Query เพื่อดึงข้อมูลจาก online_booking, m_univercities, m_faculties และ group_freamset_online
    const [rows] = await dbConnection.execute(`
      SELECT ob.booking_no, ob.*, mu.uniname, mf.facuname, gfo.group_id, gfo.amount
      FROM online_booking ob
      LEFT JOIN m_univercities mu ON ob.uni_id = mu.id
      LEFT JOIN m_faculties mf ON ob.uni_id = mf.uni_id AND ob.facid = mf.id
      LEFT JOIN group_freamset_online gfo ON ob.booking_no = gfo.booking_no
      WHERE ob.status = 'unpaid'
    `)

    // จัดกลุ่มข้อมูลเพื่อให้ group_id และ amount รวมกันเป็นชุดสำหรับแต่ละ booking_no
    const orders = rows.reduce((acc, row) => {
      const { booking_no, group_id, amount, ...orderData } = row

      if (!acc[booking_no]) {
        acc[booking_no] = { booking_no, ...orderData, sets: [] }
      }

      acc[booking_no].sets.push({ group_id, amount })

      return acc
    }, {})

    return new Response(JSON.stringify({ orders: Object.values(orders) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Database query error:', error)
    return new Response(JSON.stringify({ message: 'Error retrieving data from the database.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (dbConnection) await dbConnection.end()
  }
}

export async function POST(request) {
  let dbConnection

  try {
    const data = await request.json()
    console.log('Data received:', data) // ตรวจสอบข้อมูลที่ได้รับจาก client

    dbConnection = await dbConnect()

    // ดึงข้อมูลทั้งหมดจาก online_booking ตาม booking_no ที่ได้รับมา
    const [bookingRows] = await dbConnection.execute(`SELECT * FROM online_booking WHERE booking_no = ?`, [
      data.booking_no
    ])

    if (bookingRows.length === 0) {
      throw new Error('Booking not found.')
    }

    const bookingData = bookingRows[0] // ข้อมูลการจองทั้งหมดที่ดึงมา

    // Insert ข้อมูลลงในตาราง address
    const [addressResult] = await dbConnection.execute(
      `INSERT INTO address (booking_no, signs_id, fname, lname, uni_id, facid, educ1, educ2, educ3, educ4)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingData.booking_no,
        bookingData.signs_id,
        bookingData.fname,
        bookingData.lname,
        bookingData.uni_id,
        bookingData.facid,
        bookingData.educ1,
        bookingData.educ2,
        bookingData.educ3,
        bookingData.educ4
      ]
    )

    const addressId = addressResult.insertId // ดึง address.id ที่เพิ่มใหม่
    console.log('Inserted address ID:', addressId)

    // Insert ข้อมูลลงในตาราง address_booking และเชื่อมโยงกับ address ผ่าน address_id
    await dbConnection.execute(
      `INSERT INTO address_booking (booking_no, addno, moo, soi, road, tumbol, amphur, province, zip, tel, typeofsend, name_for_rec, uni_id, address_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingData.booking_no,
        bookingData.addno,
        bookingData.moo,
        bookingData.soi,
        bookingData.road,
        bookingData.tumbol,
        bookingData.amphur,
        bookingData.province,
        bookingData.zip,
        bookingData.tel,
        bookingData.typeofsend,
        bookingData.name_for_rec,
        bookingData.uni_id,
        addressId
      ]
    )

    // ปรับ status ของ online_booking เป็น 'paid'
    await dbConnection.execute(`UPDATE online_booking SET status = 'paid' WHERE booking_no = ?`, [
      bookingData.booking_no
    ])

    return new Response(JSON.stringify({ message: 'Booking confirmed and status updated to paid.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Database insert/update error:', error) // บันทึกข้อผิดพลาด
    return new Response(JSON.stringify({ message: 'Error confirming booking.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (dbConnection) await dbConnection.end()
  }
}
