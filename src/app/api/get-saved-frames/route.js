// /app/api/get-saved-frames/route.js
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
    const { uni_id, groupset_id } = await request.json() // รับข้อมูลจาก body

    dbConnection = await dbConnect()

    const [rows] = await dbConnection.execute(
      `
      SELECT
        f_priceset_group.set_amount AS quantity,
        f_sizeset.setsizename AS size,
        f_colorset.setcolorname AS color,
        f_frameset.framesetname AS frame
      FROM
        f_priceset_group
      JOIN
        f_sizeset ON f_priceset_group.sizeset_id = f_sizeset.id
      JOIN
        f_colorset ON f_priceset_group.colorset_id = f_colorset.id
      JOIN
        f_frameset ON f_priceset_group.frameset_id = f_frameset.id
      WHERE
        f_priceset_group.groupset_id = ? AND f_priceset_group.uni_id = ?
    `,
      [groupset_id, uni_id]
    )

    return new Response(JSON.stringify(rows), { status: 200 })
  } catch (error) {
    console.error('Error fetching saved frames:', error)
    return new Response('Error fetching data', { status: 500 })
  } finally {
    if (dbConnection) {
      dbConnection.end()
    }
  }
}
