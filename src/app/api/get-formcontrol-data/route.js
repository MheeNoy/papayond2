import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export async function POST(request) {
  try {
    const { uni_id, type, setof, valueof } = await request.json()

    if (!uni_id) {
      return NextResponse.json({ success: false, message: 'Missing uni_id' })
    }

    // Database connection
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    })

    // Fetch all data by uni_id to structure data by `typeof` and `setof`
    const [rows] = await db.execute('SELECT typeof, setof, valueof FROM m_formcontrol WHERE uni_id = ?', [uni_id])

    // Organize data by `typeof` and `setof`
    const data = rows.reduce((acc, row) => {
      const { typeof: type, setof, valueof } = row

      if (!acc[type]) {
        acc[type] = {}
      }

      acc[type][setof] = valueof
      return acc
    }, {})

    // Check if specific record exists to either update or insert data
    if (type !== undefined && setof !== undefined && valueof !== undefined) {
      const [existingRows] = await db.execute(
        'SELECT * FROM m_formcontrol WHERE uni_id = ? AND setof = ? AND typeof = ?',
        [uni_id, setof, type]
      )

      if (existingRows.length > 0) {
        // ถ้ามีข้อมูลอยู่แล้วและ valueof ไม่ตรงกัน จะอัปเดตค่าใหม่
        if (existingRows[0].valueof !== valueof) {
          await db.execute('UPDATE m_formcontrol SET valueof = ? WHERE uni_id = ? AND setof = ? AND typeof = ?', [
            valueof,
            uni_id,
            setof,
            type
          ])
          await db.end()
          return NextResponse.json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ', data })
        } else {
          await db.end()
          return NextResponse.json({ success: true, message: 'ไม่มีการเปลี่ยนแปลง เนื่องจากค่าเดิมเหมือนกัน', data })
        }
      } else {
        // ถ้าไม่มีข้อมูลอยู่ จะเพิ่มข้อมูลใหม่
        await db.execute('INSERT INTO m_formcontrol (typeof, setof, valueof, uni_id) VALUES (?, ?, ?, ?)', [
          type,
          setof,
          valueof,
          uni_id
        ])
        await db.end()
        return NextResponse.json({ success: true, message: 'เพิ่มข้อมูลสำเร็จ', data })
      }
    }

    // If only fetching data without modifying
    await db.end()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการจัดการข้อมูลฟอร์ม:', error)
    return NextResponse.json({ success: false, message: 'ไม่สามารถจัดการข้อมูลได้', error: error.message })
  }
}
