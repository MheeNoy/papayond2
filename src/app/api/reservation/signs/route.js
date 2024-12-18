// src/app/api/reservation/signs/route.js

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

// ฟังก์ชัน GET สำหรับ API route
export async function GET(request) {
  try {
    const connection = await dbConnect()
    const [rows] = await connection.execute('SELECT id, title FROM m_signs')
    await connection.end()

    return new Response(JSON.stringify({ signs: rows }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error fetching signs data:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch signs data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
