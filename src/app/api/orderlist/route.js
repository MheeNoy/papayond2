import mysql from 'mysql2/promise'

// กำหนดให้ API Route นี้เป็นแบบไดนามิกเพื่อรองรับการใช้พารามิเตอร์
export const dynamic = 'force-dynamic'

// ฟังก์ชันเชื่อมต่อกับฐานข้อมูล
const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

export async function GET(request) {
  let connection

  try {
    connection = await dbConnect()

    // ตรวจสอบการมีอยู่ของพารามิเตอร์ uni_id
    const { searchParams } = new URL(request.url)
    const uni_id = searchParams.get('uni_id')

    if (!uni_id) {
      return new Response(JSON.stringify({ error: 'Parameter uni_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 1. ดึงข้อมูลจากตาราง address ตาม uni_id
    const addressQuery = `
      SELECT
        id,
        no_imported,
        film_no,
        fname,
        lname,
        facid,
        update_date,
        update_by
      FROM
        address
      WHERE
        uni_id = ?
    `
    const [addressRows] = await connection.execute(addressQuery, [uni_id])

    const addressIds = addressRows.map(row => row.id)

    if (addressIds.length === 0) {
      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 2. ดึง booking_no จากตาราง address_booking ที่เกี่ยวข้องกับ address_id
    const bookingQuery = `
      SELECT
        address_id,
        booking_no
      FROM
        address_booking
      WHERE
        address_id IN (${addressIds.map(() => '?').join(', ')})
    `
    const [bookingRows] = await connection.execute(bookingQuery, addressIds)

    // 3. จับคู่ booking_no กับ address_id
    const bookingMap = new Map()
    bookingRows.forEach(row => {
      if (!bookingMap.has(row.address_id)) {
        bookingMap.set(row.address_id, [])
      }
      bookingMap.get(row.address_id).push(row.booking_no)
    })

    // 4. เพิ่ม booking_ids ลงใน addressRows
    const result = addressRows.map(row => ({
      ...row,
      booking_ids: bookingMap.get(row.id) || []
    }))

    // 5. ดึง facuname จากตาราง m_faculties ตาม facid
    const facidArray = addressRows.map(row => row.facid)
    if (facidArray.length > 0) {
      const uniqueFacids = [...new Set(facidArray)]
      const facidPlaceholders = uniqueFacids.map(() => '?').join(', ')
      const facQuery = `
        SELECT
          id AS facid,
          facuname
        FROM
          m_faculties
        WHERE
          id IN (${facidPlaceholders})
      `
      const [faculties] = await connection.execute(facQuery, uniqueFacids)
      const facultyMap = new Map(faculties.map(faculty => [faculty.facid, faculty.facuname]))

      // 6. เพิ่ม facuname ลงในผลลัพธ์
      result.forEach(row => {
        row.facuname = facultyMap.get(row.facid) || ''
      })
    }

    return new Response(JSON.stringify({ data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching addresses:', error.message)
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch addresses',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
