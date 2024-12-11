import { NextResponse } from 'next/server'
import { Readable } from 'stream'
import mysql from 'mysql2/promise'
import SFTPClient from 'ssh2-sftp-client'

export async function POST(request) {
  try {
    const data = await request.formData()
    const file = data.get('file')
    const uni_id = data.get('uni_id')
    const group_id = data.get('group_id')

    if (!file || !uni_id || !group_id) {
      return NextResponse.json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' })
    }

    // ตรวจสอบประเภทและขนาดไฟล์
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'รองรับเฉพาะไฟล์รูปภาพเท่านั้น (JPEG, PNG, GIF)' })
    }

    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, message: 'ขนาดไฟล์ต้องไม่เกิน 2MB' })
    }

    // อ่านไฟล์จาก Blob
    const buffer = await file.arrayBuffer()
    const bufferData = Buffer.from(buffer)

    // อัปโหลดไฟล์ไปยัง SFTP
    const sftp = new SFTPClient()
    try {
      await sftp.connect({
        host: '203.146.170.155',
        port: 22,
        username: 'zpansawut',
        password: 'Drhq7ZV5QKXDn6brru6A'
      })

      const remotePath = `/domains/pansawut.orangeworkshop.info/public_html/papayond/public/dist/img/${file.name}`
      await sftp.put(bufferData, remotePath)
    } finally {
      await sftp.end()
    }

    // เชื่อมต่อฐานข้อมูล
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    })

    const [result] = await db.execute(
      'UPDATE f_pricegroup_active SET picture_path = ? WHERE uni_id = ? AND group_id = ?',
      [file.name, uni_id, group_id]
    )

    await db.end()

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลที่ตรงกันในฐานข้อมูล' })
    }

    return NextResponse.json({ success: true, message: 'อัปโหลดรูปภาพและบันทึกข้อมูลสำเร็จ' })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ success: false, message: 'การอัปโหลดล้มเหลว', error: error.message })
  }
}
