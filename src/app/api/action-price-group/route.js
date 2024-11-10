// pages/api/action-price-group.js
import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export async function POST(request) {
  try {
    const data = await request.json()
    const { action, booking_no, booking_set, amount, send_type, uni_id, orderid, add_ademgo, chang_eleph, film_no } =
      data

    // ตรวจสอบว่ามีการระบุ action มาหรือไม่
    if (!action) {
      return NextResponse.json({ success: false, message: 'ไม่ระบุการกระทำ (action) ที่ต้องการ' }, { status: 400 })
    }

    // เชื่อมต่อฐานข้อมูล
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    })

    let response

    switch (action) {
      case 'add':
        // ตรวจสอบข้อมูลที่จำเป็นสำหรับการเพิ่ม
        if (!booking_no || !booking_set || amount === undefined || !uni_id) {
          return NextResponse.json({ success: false, message: 'ข้อมูลไม่ครบถ้วนสำหรับการเพิ่ม' }, { status: 400 })
        }

        // เพิ่มเรคคอร์ดใหม่
        const [addResult] = await db.execute(
          `INSERT INTO b_bookingfw (booking_no, booking_set, amount, send_type, uni_id, orderid, add_ademgo, chang_eleph, film_no)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            booking_no,
            booking_set,
            amount,
            send_type || 0,
            uni_id,
            orderid || 0,
            add_ademgo || 0,
            chang_eleph || 0,
            film_no || ''
          ]
        )

        response = { success: true, message: 'เพิ่มชุดสำเร็จ', id: addResult.insertId }
        break

      case 'update':
        // ตรวจสอบข้อมูลที่จำเป็นสำหรับการอัปเดต
        if (!booking_no || !booking_set || amount === undefined) {
          return NextResponse.json({ success: false, message: 'ข้อมูลไม่ครบถ้วนสำหรับการอัปเดต' }, { status: 400 })
        }

        // อัปเดตเรคคอร์ด
        const [updateResult] = await db.execute(
          `UPDATE b_bookingfw SET amount = ?, add_ademgo = ?, chang_eleph = ? WHERE booking_no = ? AND booking_set = ?`,
          [amount, add_ademgo || 0, chang_eleph || 0, booking_no, booking_set]
        )

        if (updateResult.affectedRows > 0) {
          response = { success: true, message: 'อัปเดตชุดสำเร็จ' }
        } else {
          response = { success: false, message: 'ไม่พบเรคคอร์ดที่ต้องการอัปเดต' }
        }
        break

      case 'delete':
        // ตรวจสอบข้อมูลที่จำเป็นสำหรับการลบ
        if (!booking_no || !booking_set) {
          return NextResponse.json({ success: false, message: 'ข้อมูลไม่ครบถ้วนสำหรับการลบ' }, { status: 400 })
        }

        // ลบเรคคอร์ด
        const [deleteResult] = await db.execute(`DELETE FROM b_bookingfw WHERE booking_no = ? AND booking_set = ?`, [
          booking_no,
          booking_set
        ])

        if (deleteResult.affectedRows > 0) {
          response = { success: true, message: 'ลบชุดสำเร็จ' }
        } else {
          response = { success: false, message: 'ไม่พบเรคคอร์ดที่ต้องการลบ' }
        }
        break

      case 'check':
        // ตรวจสอบว่ามีเรคคอร์ดหรือไม่
        if (!booking_no || !booking_set) {
          return NextResponse.json({ success: false, message: 'ข้อมูลไม่ครบถ้วนสำหรับการตรวจสอบ' }, { status: 400 })
        }

        const [rows] = await db.execute(
          'SELECT COUNT(*) as count FROM b_bookingfw WHERE booking_no = ? AND booking_set = ?',
          [booking_no, booking_set]
        )

        const exists = rows[0].count > 0
        response = { success: true, exists }
        break

      case 'upsert':
        // ตรวจสอบข้อมูลที่จำเป็นสำหรับการ upsert
        if (!booking_no || !booking_set || amount === undefined || !uni_id) {
          return NextResponse.json({ success: false, message: 'ข้อมูลไม่ครบถ้วนสำหรับการ upsert' }, { status: 400 })
        }

        // ดำเนินการ upsert
        const [upsertResult] = await db.execute(
          `INSERT INTO b_bookingfw (booking_no, booking_set, amount, send_type, uni_id, orderid, add_ademgo, chang_eleph, film_no)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           amount = VALUES(amount),
           add_ademgo = VALUES(add_ademgo),
           chang_eleph = VALUES(chang_eleph),
           send_type = VALUES(send_type),
           uni_id = VALUES(uni_id),
           orderid = VALUES(orderid),
           film_no = VALUES(film_no)`,
          [
            booking_no,
            booking_set,
            amount,
            send_type || 0,
            uni_id,
            orderid || 0,
            add_ademgo || 0,
            chang_eleph || 0,
            film_no || ''
          ]
        )

        response = { success: true, message: 'ดำเนินการ upsert สำเร็จ' }
        break

      default:
        return NextResponse.json({ success: false, message: 'การกระทำที่ระบุไม่ถูกต้อง' }, { status: 400 })
    }

    // ปิดการเชื่อมต่อฐานข้อมูล
    await db.end()

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in action-price-group:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในการดำเนินการ' }, { status: 500 })
  }
}
