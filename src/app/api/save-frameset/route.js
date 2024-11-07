import mysql from 'mysql2/promise'

const dbConnect = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
}

export async function POST(request) {
  let dbConnection

  try {
    // รับข้อมูลจาก request body
    const { sizeset_id, colorset_id, frameset_id, set_amount, groupset_id, uni_id } = await request.json()

    // ตรวจสอบการเชื่อมต่อกับฐานข้อมูล
    dbConnection = await dbConnect()

    // บันทึกข้อมูลลงในฐานข้อมูล
    const query = `
      INSERT INTO f_priceset_group (sizeset_id, colorset_id, frameset_id, groupset_id, uni_id, set_amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    const values = [sizeset_id, colorset_id, frameset_id, groupset_id, uni_id, set_amount]

    const [result] = await dbConnection.execute(query, values)

    // ปิดการเชื่อมต่อ
    await dbConnection.end()

    return new Response(JSON.stringify({ success: true, message: 'Data saved successfully.' }), { status: 200 })
  } catch (error) {
    console.error('Error saving data:', error)
    return new Response(JSON.stringify({ success: false, message: 'Error saving data.' }), { status: 500 })
  }
}
