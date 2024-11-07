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
  let connection

  try {
    connection = await dbConnect()

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
      bookingMap.get(row.address_id).push(row.booking_no) // เปลี่ยนจาก booking_id เป็น booking_no
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

// ฟังก์ชัน PUT และ DELETE ที่ถูกคอมเมนต์ออกมาแล้วหรือมีการแก้ไขเพิ่มเติม

// export async function PUT(request) {
//   let connection

//   try {
//     connection = await dbConnect()

//     const body = await request.json()
//     let { id, film_no, booking_no, update_by, uni_id } = body

//     if (!id) {
//       return new Response(JSON.stringify({ error: 'Parameter id is required' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' }
//       })
//     }

//     film_no = film_no !== undefined ? film_no : null
//     booking_no = booking_no !== undefined ? booking_no : null
//     update_by = update_by !== undefined ? update_by : null
//     uni_id = uni_id !== undefined ? uni_id : null

//     await connection.beginTransaction()

//     const updateAddressQuery = `
//       UPDATE address
//       SET film_no = ?, booking_no = ?, update_date = NOW(), update_by = ?
//       WHERE id = ?
//     `
//     await connection.execute(updateAddressQuery, [film_no, booking_no, update_by, id])

//     const checkBookingQuery = `
//       SELECT id FROM b_bookingfw WHERE orderid = ?
//     `
//     const [existingBooking] = await connection.execute(checkBookingQuery, [id])

//     if (existingBooking.length > 0) {
//       const updateBookingQuery = `
//         UPDATE b_bookingfw
//         SET booking_no = ?, film_no = ?, uni_id = ?
//         WHERE orderid = ?
//       `
//       await connection.execute(updateBookingQuery, [booking_no, film_no, uni_id, id])
//     } else {
//       const insertBookingQuery = `
//         INSERT INTO b_bookingfw (booking_no, uni_id, orderid, film_no)
//         VALUES (?, ?, ?, ?)
//       `
//       await connection.execute(insertBookingQuery, [booking_no, uni_id, id, film_no])
//     }

//     const checkAddressBookingQuery = `
//       SELECT * FROM address_booking WHERE address_id = ?
//     `
//     const [existingAddressBooking] = await connection.execute(checkAddressBookingQuery, [id])

//     if (existingAddressBooking.length > 0) {
//       const updateAddressBookingQuery = `
//         UPDATE address_booking
//         SET booking_no = ?, film_no = ?, uni_id = ?
//         WHERE address_id = ?
//       `
//       const [updateResult] = await connection.execute(updateAddressBookingQuery, [booking_no, film_no, uni_id, id])
//     } else {
//       const insertAddressBookingQuery = `
//         INSERT INTO address_booking (booking_no, address_id, film_no, uni_id)
//         VALUES (?, ?, ?, ?)
//       `
//       const [insertResult] = await connection.execute(insertAddressBookingQuery, [booking_no, id, film_no, uni_id])
//     }

//     await connection.commit()

//     return new Response(JSON.stringify({ message: 'Reservation updated/inserted successfully' }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' }
//     })
//   } catch (error) {
//     if (connection) {
//       await connection.rollback()
//     }
//     console.error('Error updating/inserting reservation:', error.message)
//     return new Response(
//       JSON.stringify({
//         error: 'Failed to update/insert reservation',
//         details: error.message
//       }),
//       {
//         status: 500,
//         headers: { 'Content-Type': 'application/json' }
//       }
//     )
//   } finally {
//     if (connection) {
//       await connection.end()
//     }
//   }
// }

// export async function DELETE(request) {
//   let connection

//   try {
//     connection = await dbConnect()

//     const body = await request.json()
//     const { id, booking_no } = body

//     if (!id || !booking_no) {
//       return new Response(JSON.stringify({ error: 'Parameters id and booking_no are required' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' }
//       })
//     }

//     await connection.beginTransaction()

//     const deleteAddressBookingQuery = `
//       DELETE FROM address_booking WHERE address_id = ? AND booking_no = ?
//     `
//     await connection.execute(deleteAddressBookingQuery, [id, booking_no])

//     await connection.commit()

//     return new Response(JSON.stringify({ message: 'Reservation deleted successfully' }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' }
//     })
//   } catch (error) {
//     if (connection) {
//       await connection.rollback()
//     }
//     console.error('Error deleting reservation:', error.message)
//     return new Response(
//       JSON.stringify({
//         error: 'Failed to delete reservation',
//         details: error.message
//       }),
//       {
//         status: 500,
//         headers: { 'Content-Type': 'application/json' }
//       }
//     )
//   } finally {
//     if (connection) {
//       await connection.end()
//     }
//   }
// }
