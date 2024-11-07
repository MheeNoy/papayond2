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
  let dbConnection

  try {
    // เชื่อมต่อฐานข้อมูล
    dbConnection = await dbConnect()

    // Query เพื่อดึงข้อมูลจาก f_sizeset, f_colorset และ f_frameset
    const [sizes] = await dbConnection.execute(`SELECT * FROM f_sizeset`)
    const [colors] = await dbConnection.execute(`SELECT * FROM f_colorset`)
    const [frames] = await dbConnection.execute(`SELECT * FROM f_frameset`)

    // ส่งข้อมูลทั้งหมดกลับในรูปแบบ JSON
    return new Response(JSON.stringify({ sizes, colors, frames }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Database query error:', error)
    return new Response(JSON.stringify({ error: 'Database query failed' }), { status: 500 })
  } finally {
    if (dbConnection) {
      await dbConnection.end()
    }
  }
}
