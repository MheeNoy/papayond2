// api/reservation/address/route.js
import mysql from 'mysql2/promise'
import { NextResponse } from 'next/server'

// บังคับใช้ dynamic rendering
export const dynamic = 'force-dynamic'

const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

export async function GET(req) {
  let connection
  try {
    const id = searchParams.get('id')
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Invalid ID parameter' }, { status: 400 })
    }

    connection = await dbConnect()
    const [addressRows] = await connection.execute(
      `SELECT signs_id, fname, lname, film_no, educ1, educ2, educ3, educ4, facid, tel, posiphoto_1, posiphoto_2,
      posiphoto_3, posiphoto_4, posiphoto_5, posiphoto_6, posiphoto_7, posiphoto_8, posiphoto_9, update_date,
      update_by, uni_id FROM address WHERE id = ?`,
      [parseInt(id)]
    )

    if (addressRows.length === 0) {
      return NextResponse.json({ message: 'No data found for address' }, { status: 404 })
    }

    const [signsRows] = await connection.execute('SELECT * FROM m_signs')
    const uni_id = addressRows[0].uni_id
    const [facultyRows] = await connection.execute('SELECT id AS facid, facuname FROM m_faculties WHERE uni_id = ?', [
      uni_id
    ])

    const addressDataWithFaculty = {
      ...addressRows[0],
      faculties: facultyRows
    }

    return NextResponse.json({
      addressData: addressDataWithFaculty,
      signsData: signsRows
    })
  } catch (error) {
    console.error('Error details:', error)
    return NextResponse.json({ error: 'Data could not be fetched', details: error.message }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
