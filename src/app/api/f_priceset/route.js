// /api/frame-sets.js
import mysql from 'mysql2/promise'

// Define the POST handler
export async function POST(request) {
  // Establish a connection to the database
  let connection
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return new Response(JSON.stringify({ error: 'Database connection failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Parse the JSON body of the request
    const body = await request.json()
    const { frameSizeId, frameColorId, frameCategoryId, uni_id } = body

    // Validate required fields
    if (!frameSizeId || !frameColorId || !frameCategoryId || !uni_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    //test

    // Insert the new frame set into the database
    const insertQuery = `
      INSERT INTO f_priceset (frameSizeId, frameColorId, frameCategoryId, uni_id)
      VALUES (?, ?, ?, ?)
    `
    const [result] = await connection.execute(insertQuery, [frameSizeId, frameColorId, frameCategoryId, uni_id])

    // Retrieve the newly created frame set (assuming `id` is auto-incremented)
    const [rows] = await connection.execute('SELECT * FROM f_priceset WHERE id = ?', [result.insertId])

    // Respond with the newly created frame set
    return new Response(JSON.stringify({ FrameSet: rows[0] }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error handling POST request:', error)
    return new Response(JSON.stringify({ error: 'Error creating frame set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
