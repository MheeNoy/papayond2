// /app/api/check-group-active/route.js

import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export async function POST(request) {
  try {
    const data = await request.json()
    const { uni_id, group_id, updateActive } = data // เพิ่ม updateActive เพื่อตรวจสอบว่าต้องการอัปเดตหรือไม่

    if (!uni_id || !group_id) {
      return NextResponse.json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' })
    }

    // เชื่อมต่อฐานข้อมูล
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    })

    // ถ้า updateActive มีค่า ให้ทำการอัปเดต group_active
    if (typeof updateActive === 'boolean') {
      const newActiveStatus = updateActive ? 1 : 0
      await db.execute('UPDATE f_pricegroup_active SET group_active = ? WHERE uni_id = ? AND group_id = ?', [
        newActiveStatus,
        uni_id,
        group_id
      ])
      await db.end()
      return NextResponse.json({ success: true, message: 'อัปเดตสถานะสำเร็จ', group_active: newActiveStatus })
    }

    // หากไม่มีการส่ง updateActive ให้ทำการค้นหาค่า group_active ตามปกติ
    const [rows] = await db.execute('SELECT group_active FROM f_pricegroup_active WHERE uni_id = ? AND group_id = ?', [
      uni_id,
      group_id
    ])

    await db.end()

    if (rows.length > 0) {
      const { group_active } = rows[0]
      return NextResponse.json({ success: true, group_active })
    } else {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลที่ตรงกัน' })
    }
  } catch (error) {
    console.error('Error checking or updating group active status:', error)
    return NextResponse.json({ success: false, message: 'การตรวจสอบหรือการอัปเดตล้มเหลว', error: error.message })
  }
}
