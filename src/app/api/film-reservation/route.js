// app/api/film-reservation/route.js

import mysql from 'mysql2/promise'

// ฟังก์ชันเชื่อมต่อกับฐานข้อมูล
const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

// API GET เพื่อดึงข้อมูลจากตาราง address_booking หรือ address ตามพารามิเตอร์ที่ส่งมา

export async function GET(request) {
  let connection

  try {
    const url = new URL(request.url)
    const uni_id = url.searchParams.get('uni_id')
    const address_id = url.searchParams.get('address_id')

    // ตรวจสอบว่ามีการส่งพารามิเตอร์อย่างน้อยหนึ่งตัว
    if (!uni_id && !address_id) {
      return new Response(JSON.stringify({ error: 'Either uni_id or address_id parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // เชื่อมต่อกับฐานข้อมูล
    connection = await dbConnect()

    let responseData

    if (address_id) {
      // ดึง booking_no และ film_no ทั้งหมดจาก address_booking ตาม address_id
      const query = 'SELECT booking_no, film_no FROM address_booking WHERE address_id = ?'
      const params = [address_id]
      const [rows] = await connection.execute(query, params)

      // สร้างอาร์เรย์ของ booking_no และ film_no จากผลลัพธ์ที่ได้
      const bookingDetails = rows.map(row => ({
        booking_no: row.booking_no,
        film_no: row.film_no
      }))

      // ส่งข้อมูลกลับไป
      responseData = { booking_details: bookingDetails }
    } else if (uni_id) {
      // ขั้นตอนที่ 1: ดึงข้อมูลจากตาราง address ตาม uni_id
      const addressQuery = 'SELECT * FROM address WHERE uni_id = ?'
      const addressParams = [uni_id]
      const [addressRows] = await connection.execute(addressQuery, addressParams)

      if (addressRows.length === 0) {
        responseData = { data: [] }
      } else {
        const addressIds = addressRows.map(address => address.id)

        if (addressIds.length === 0) {
          responseData = { data: [] }
        } else {
          // ขั้นตอนที่ 2: ดึงข้อมูล booking จาก address_booking ตาม address_id ที่ได้จาก address
          // สร้าง placeholder สำหรับ IN clause
          const placeholders = addressIds.map(() => '?').join(', ')
          const bookingQuery = `SELECT address_id, booking_no, film_no FROM address_booking WHERE address_id IN (${placeholders})`
          const bookingParams = addressIds
          const [bookingRows] = await connection.execute(bookingQuery, bookingParams)

          // ขั้นตอนที่ 3: รวมข้อมูล address กับ booking
          const combinedData = []

          addressRows.forEach(address => {
            const bookings = bookingRows.filter(booking => booking.address_id === address.id)

            if (bookings.length > 0) {
              bookings.forEach(booking => {
                combinedData.push({
                  ...address,
                  film_no: address.film_no, // ดึง film_no จาก address
                  booking_no: booking.booking_no,
                  booking_film_no: booking.film_no // film_no จาก booking
                })
              })
            } else {
              // ถ้าไม่มี booking ให้ส่งข้อมูล address พร้อม booking_no และ film_no เป็น null
              combinedData.push({
                ...address,
                film_no: address.film_no, // ดึง film_no จาก address
                booking_no: null,
                booking_film_no: null
              })
            }
          })

          responseData = { data: combinedData }
        }
      }
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Failed to fetch data:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch data', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// API PUT เพื่ออัปเดตข้อมูลในตาราง address_booking
// API PUT เพื่ออัปเดตข้อมูลในตาราง address_booking และ address
export async function PUT(request) {
  let connection

  try {
    const { id, original_booking_no, film_no, booking_no, update_by, uni_id } = await request.json()

    // ตรวจสอบว่าฟิลด์ที่จำเป็นมีค่า
    if (!id || !update_by || !uni_id) {
      return new Response(JSON.stringify({ error: 'Fields id, update_by, and uni_id are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ตรวจสอบว่ามีการส่งอย่างน้อยหนึ่งฟิลด์สำหรับการอัปเดต
    if (film_no === undefined && booking_no === undefined) {
      return new Response(
        JSON.stringify({ error: 'At least one field (film_no or booking_no) must be provided to update' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // เชื่อมต่อกับฐานข้อมูล
    connection = await dbConnect()

    // เริ่มต้นธุรกรรม
    await connection.beginTransaction()

    let responseData

    if (original_booking_no !== undefined && original_booking_no !== null) {
      // ถ้า original_booking_no ถูกส่งมาและไม่เป็น 'null', ทำการ UPDATE ใน address_booking
      const updateBookingQuery = `
        UPDATE address_booking
        SET film_no = COALESCE(?, film_no),
            booking_no = COALESCE(?, booking_no),
            update_by = ?,
            update_date = NOW()
        WHERE address_id = ? AND booking_no = ?
      `
      const updateBookingParams = [film_no, booking_no, update_by, id, original_booking_no]
      const [updateBookingResult] = await connection.execute(updateBookingQuery, updateBookingParams)

      if (updateBookingResult.affectedRows === 0) {
        await connection.rollback()
        return new Response(JSON.stringify({ error: 'No matching reservation found to update' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      responseData = { message: 'Updated reservation successfully' }
    } else {
      // ถ้า original_booking_no เป็น null หรือไม่ถูกระบุ, ทำการ UPDATE แถวที่มี booking_no เป็น null
      const updateNullQuery = `
        UPDATE address_booking
        SET film_no = COALESCE(?, film_no),
            booking_no = COALESCE(?, booking_no),
            update_by = ?,
            update_date = NOW()
        WHERE address_id = ? AND booking_no IS NULL
      `
      const updateNullParams = [film_no, booking_no, update_by, id]
      const [updateNullResult] = await connection.execute(updateNullQuery, updateNullParams)

      if (updateNullResult.affectedRows > 0) {
        // ถ้าอัปเดตแถวสำเร็จ
        responseData = { message: 'Updated reservation successfully' }
      } else {
        // ถ้าไม่มีแถวที่มี booking_no เป็น null, ทำการ INSERT แถวใหม่
        const insertQuery = `
          INSERT INTO address_booking (address_id, film_no, booking_no, update_by, update_date, uni_id)
          VALUES (?, ?, ?, ?, NOW(), ?)
        `
        const insertParams = [id, film_no, booking_no, update_by, uni_id]
        const [insertResult] = await connection.execute(insertQuery, insertParams)

        responseData = { message: 'Reservation created successfully', reservation_id: insertResult.insertId }
      }
    }

    // ขั้นตอนเพิ่มเติม: ตรวจสอบและอัปเดต film_no ในตาราง address ถ้ามีการเปลี่ยนแปลง
    if (film_no !== undefined) {
      // ดึง film_no ปัจจุบันจากตาราง address
      const selectAddressQuery = 'SELECT film_no FROM address WHERE id = ?'
      const [addressRows] = await connection.execute(selectAddressQuery, [id])

      if (addressRows.length > 0) {
        const currentFilmNo = addressRows[0].film_no

        // ถ้า film_no ใหม่ไม่เท่ากับ film_no ปัจจุบัน, ทำการอัปเดต
        if (currentFilmNo !== film_no) {
          const updateAddressQuery = `
            UPDATE address
            SET film_no = ?,
                update_by = ?,
                update_date = NOW()
            WHERE id = ?
          `
          const updateAddressParams = [film_no, update_by, id]
          await connection.execute(updateAddressQuery, updateAddressParams)

          responseData.message += ' และอัปเดต film_no ใน address สำเร็จ'
        }
      } else {
        // ถ้าไม่พบ address ที่ตรงกับ id
        await connection.rollback()
        return new Response(JSON.stringify({ error: 'Address not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    // ยืนยันธุรกรรม
    await connection.commit()

    return new Response(JSON.stringify(responseData), {
      status: original_booking_no ? 200 : responseData.message.includes('created') ? 201 : 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error('Failed to update/create data:', error)
    return new Response(JSON.stringify({ error: 'Failed to update/create data', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// API POST เพื่อสร้างข้อมูลใหม่ในตาราง address_booking
export async function POST(request) {
  let connection

  try {
    const { id, film_no, booking_no, update_by, uni_id } = await request.json()

    // ตรวจสอบว่าฟิลด์ทั้งหมดมีค่า
    if (!id || !film_no || !booking_no || !update_by || !uni_id) {
      return new Response(
        { error: 'All fields except original_booking_no are required' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // เชื่อมต่อกับฐานข้อมูล
    connection = await dbConnect()

    // ตรวจสอบว่ามีแถวที่ตรงกับ address_id และ booking_no อยู่แล้วหรือไม่
    const checkQuery = `
      SELECT * FROM address_booking WHERE address_id = ? AND booking_no = ?
    `
    const checkParams = [id, booking_no]
    const [existingRows] = await connection.execute(checkQuery, checkParams)

    if (existingRows.length > 0) {
      return new Response(JSON.stringify({ error: 'Reservation with this booking_no already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ทำการ INSERT ข้อมูลใหม่ในตาราง address_booking
    const insertQuery = `
      INSERT INTO address_booking (address_id, film_no, booking_no, update_by, update_date, uni_id)
      VALUES (?, ?, ?, ?, NOW(), ?)
    `
    const insertParams = [id, film_no, booking_no, update_by, uni_id]
    const [result] = await connection.execute(insertQuery, insertParams)

    return new Response(
      JSON.stringify({ message: 'Reservation created successfully', reservation_id: result.insertId }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Failed to create reservation:', error)
    return new Response(JSON.stringify({ error: 'Failed to create reservation', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// API DELETE เพื่อลบข้อมูลในตาราง address_booking
export async function DELETE(request) {
  let connection

  try {
    const { id, booking_no } = await request.json()

    // ตรวจสอบว่าฟิลด์ที่จำเป็นมีค่า
    if (!id || !booking_no) {
      return new Response(JSON.stringify({ error: 'Fields id and booking_no are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // เชื่อมต่อกับฐานข้อมูล
    connection = await dbConnect()

    // ทำการ DELETE ข้อมูลในตาราง address_booking โดยใช้ address_id และ booking_no
    const deleteQuery = `
      DELETE FROM address_booking WHERE address_id = ? AND booking_no = ?
    `
    const deleteParams = [id, booking_no]
    const [result] = await connection.execute(deleteQuery, deleteParams)

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'No matching reservation found to delete' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ message: 'Reservation deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Failed to delete reservation:', error)
    return new Response(JSON.stringify({ error: 'Failed to delete reservation', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
