// /app/api/frame-sizes/route.js

import mysql from 'mysql2/promise'

export async function GET() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  try {
    const [rows] = await connection.execute('SELECT * FROM f_sizeset')

    return new Response(JSON.stringify({ FrameCategory: rows }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Database query error:', error)
    return new Response(JSON.stringify({ error: 'Database query failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    await connection.end()
  }
}
