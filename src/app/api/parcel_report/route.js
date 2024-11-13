import mysql from 'mysql2/promise'

export async function POST(request) {
  // สร้างการเชื่อมต่อฐานข้อมูล
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  try {
    // ดึงข้อมูลจาก request body
    const { uni_id } = await request.json()

    // ตรวจสอบว่ามี uni_id ถูกส่งเข้ามาหรือไม่
    if (!uni_id) {
      return new Response(JSON.stringify({ error: 'กรุณาส่งค่า uni_id' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    // Query สำหรับดึงข้อมูลที่ตรงกับ uni_id จากตาราง b_bookingsend เท่านั้น
    const query = `
      SELECT *
      FROM b_bookingsend
      WHERE uni_id = ?
    `
    const [rows] = await connection.execute(query, [uni_id])

    // สร้างรายการ booking_no จากผลลัพธ์ที่ได้
    const bookingNos = rows.map(row => row.booking_no).filter(Boolean)

    // ตรวจสอบว่ามี booking_no หรือไม่
    let nameForRecMap = {}
    if (bookingNos.length > 0) {
      // ลบรายการซ้ำออกจาก bookingNos
      const uniqueBookingNos = [...new Set(bookingNos)]

      // สร้าง placeholders สำหรับใช้ในคำสั่ง SQL
      const placeholders = uniqueBookingNos.map(() => '?').join(',')

      // Query สำหรับดึง name_for_rec จากตาราง address_booking ที่ตรงกับ booking_no
      const query2 = `
        SELECT booking_no, name_for_rec
        FROM address_booking
        WHERE booking_no IN (${placeholders})
      `
      const [addressRows] = await connection.execute(query2, uniqueBookingNos)

      // สร้าง mapping จาก booking_no ไปยัง name_for_rec
      nameForRecMap = addressRows.reduce((acc, row) => {
        acc[row.booking_no] = row.name_for_rec
        return acc
      }, {})
    }

    // เพิ่มฟิลด์ name_for_rec เข้าไปในแต่ละแถวของผลลัพธ์เดิม
    const augmentedRows = rows.map(row => ({
      ...row,
      name_for_rec: nameForRecMap[row.booking_no] || null
    }))

    // ส่งผลลัพธ์กลับในรูปแบบ JSON
    return new Response(JSON.stringify(augmentedRows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } finally {
    // ปิดการเชื่อมต่อฐานข้อมูล
    await connection.end()
  }
}
