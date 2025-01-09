// /api/f_priceset.js
import mysql from 'mysql2/promise'

// สร้าง Connection Pool ไว้นอกฟังก์ชันเพื่อให้สามารถนำกลับมาใช้ได้หลายครั้ง
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // ปรับตามความเหมาะสม
  queueLimit: 0
})

// GET: ดึงข้อมูล Frame Sets พร้อมชื่อจากตารางที่เกี่ยวข้องและรองรับ Pagination
export async function GET(request) {
  try {
    // Parse query parameters จาก URL
    const url = new URL(request.url)
    const uniId = url.searchParams.get('uni_id') // ตัวอย่างการกรองด้วย uni_id
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = parseInt(url.searchParams.get('limit')) || 10
    const offset = (page - 1) * limit

  

    // Construct the SELECT query with JOINs to get the names
    let selectQuery = `
      SELECT
        f_priceset.id,
        f_colorset.setcolorname AS colorName,
        f_frameset.framesetname AS frameName,
        f_sizeset.setsizename AS sizeName,
        f_priceset.uni_id,
        f_priceset.colorset_id,
        f_priceset.frameset_id,
        f_priceset.sizeset_id,
        f_priceset.priceset_single
      FROM f_priceset
      LEFT JOIN f_colorset ON f_priceset.colorset_id = f_colorset.id
      LEFT JOIN f_frameset ON f_priceset.frameset_id = f_frameset.id
      LEFT JOIN f_sizeset ON f_priceset.sizeset_id = f_sizeset.id
    `
    const queryParams = []

    if (uniId) {
      selectQuery += ' WHERE f_priceset.uni_id = ? '
      queryParams.push(uniId)
    }

    
    // เพิ่ม LIMIT และ OFFSET สำหรับ Pagination
    selectQuery += ' LIMIT ? OFFSET ?'
    queryParams.push(limit.toString(), offset.toString())

    // Execute the SELECT query using pool
    const [rows] = await pool.execute(selectQuery, queryParams)

    // ดึงจำนวนทั้งหมดเพื่อคำนวณจำนวนหน้า
    let countQuery = 'SELECT COUNT(*) as total FROM f_priceset'
    const countParams = []
    if (uniId) {
      countQuery += ' WHERE uni_id = ?'
      countParams.push(uniId)
    }
    const [countRows] = await pool.execute(countQuery, countParams)
    const total = countRows[0].total
    const totalPages = Math.ceil(total / limit)

    // Respond with the retrieved frame sets including names and pagination info
    return new Response(
      JSON.stringify({
        FrameSets: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error handling GET request:', error)
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// POST: เพิ่ม Frame Set ใหม่
export async function POST(request) {
  try {
    const body = await request.json()
    const { frameSizeId, frameColorId, frameCategoryId, priceset_single, uni_id } = body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!frameSizeId || !frameColorId || !frameCategoryId || !priceset_single || !uni_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Insert into f_priceset
    const insertQuery = `
      INSERT INTO f_priceset (sizeset_id, colorset_id, frameset_id, priceset_single, uni_id)
      VALUES (?, ?, ?, ?, ?)
    `
    const [result] = await pool.execute(insertQuery, [
      frameSizeId,
      frameColorId,
      frameCategoryId,
      priceset_single,
      uni_id

    ])

    // ดึงข้อมูลที่เพิ่มใหม่พร้อมชื่อจากตารางที่เกี่ยวข้อง
    const [newSetRows] = await pool.execute(
      `
      SELECT
        f_priceset.id,
        f_colorset.setcolorname AS colorName,
        f_frameset.framesetname AS frameName,
        f_sizeset.setsizename AS sizeName,
        f_priceset.uni_id,
        f_priceset.priceset_single
      FROM f_priceset
      LEFT JOIN f_colorset ON f_priceset.colorset_id = f_colorset.id
      LEFT JOIN f_frameset ON f_priceset.frameset_id = f_frameset.id
      LEFT JOIN f_sizeset ON f_priceset.sizeset_id = f_sizeset.id
      WHERE f_priceset.id = ?
    `,
      [result.insertId]
    )

    return new Response(JSON.stringify({ FrameSet: newSetRows[0] }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error handling POST request:', error)
    return new Response(JSON.stringify({ error: 'Error adding frame set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// PUT: อัปเดต Frame Set ที่มีอยู่
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, frameSizeId, frameColorId, frameCategoryId, priceset_single } = body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing frame set ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ตรวจสอบว่ามี Frame Set นี้อยู่จริงหรือไม่
    const [existingRows] = await pool.execute('SELECT * FROM f_priceset WHERE id = ?', [id])
    if (existingRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Frame set not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // อัปเดตข้อมูลที่ส่งมา (สามารถเลือกอัปเดตเฉพาะฟิลด์ที่ต้องการได้)
    const fields = []
    const params = []

    if (frameSizeId) {
      fields.push('sizeset_id = ?')
      params.push(frameSizeId)
    }
    if (frameColorId) {
      fields.push('colorset_id = ?')
      params.push(frameColorId)
    }
    if (frameCategoryId) {
      fields.push('frameset_id = ?')
      params.push(frameCategoryId)
    }
    if (priceset_single) {
      fields.push('priceset_single = ?')
      params.push(priceset_single)
    }

    if (fields.length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const updateQuery = `UPDATE f_priceset SET ${fields.join(', ')} WHERE id = ?`
    params.push(id)

    await pool.execute(updateQuery, params)

    // ดึงข้อมูลที่อัปเดตใหม่พร้อมชื่อจากตารางที่เกี่ยวข้อง
    const [updatedSetRows] = await pool.execute(
      `
      SELECT
        f_priceset.id,
        f_colorset.setcolorname AS colorName,
        f_frameset.framesetname AS frameName,
        f_sizeset.setsizename AS sizeName,
        f_priceset.uni_id,
        f_priceset.priceset_single
      FROM f_priceset
      LEFT JOIN f_colorset ON f_priceset.colorset_id = f_colorset.id
      LEFT JOIN f_frameset ON f_priceset.frameset_id = f_frameset.id
      LEFT JOIN f_sizeset ON f_priceset.sizeset_id = f_sizeset.id
      WHERE f_priceset.id = ?
    `,
      [id]
    )

    return new Response(JSON.stringify({ FrameSet: updatedSetRows[0] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error handling PUT request:', error)
    return new Response(JSON.stringify({ error: 'Error updating frame set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// DELETE: ลบ Frame Set ที่มีอยู่
export async function DELETE(request) {
  try {
    const body = await request.json()
    const { id } = body

    // ตรวจสอบว่ามี ID ที่ต้องการลบหรือไม่
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing frame set ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ตรวจสอบว่ามี Frame Set นี้อยู่จริงหรือไม่
    const [existingRows] = await pool.execute('SELECT * FROM f_priceset WHERE id = ?', [id])
    if (existingRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Frame set not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ลบ Frame Set
    await pool.execute('DELETE FROM f_priceset WHERE id = ?', [id])

    return new Response(JSON.stringify({ message: 'Frame set deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error handling DELETE request:', error)
    return new Response(JSON.stringify({ error: 'Error deleting frame set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
