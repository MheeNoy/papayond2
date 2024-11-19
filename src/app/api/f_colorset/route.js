// /app/api/f_colorset/route.js

import mysql from 'mysql2/promise'

// Create a connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your server's capacity
  queueLimit: 0
})

// GET Handler: Retrieve all colors
export async function GET() {
  let connection
  try {
    connection = await pool.getConnection()
    const [rows] = await connection.execute('SELECT * FROM f_colorset')
    return new Response(JSON.stringify({ FrameColor: rows }), {
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
    if (connection) connection.release()
  }
}

// POST Handler: Add a new color
export async function POST(request) {
  let connection
  try {
    connection = await pool.getConnection()
    const { setcolorname } = await request.json()

    // Input Validation
    if (!setcolorname || typeof setcolorname !== 'string' || setcolorname.trim() === '') {
      return new Response(JSON.stringify({ error: 'Invalid or missing "setcolorname"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const trimmedColorName = setcolorname.trim()

    // Check for duplicate color name (optional but recommended)
    const [existingRows] = await connection.execute('SELECT * FROM f_colorset WHERE setcolorname = ?', [
      trimmedColorName
    ])

    if (existingRows.length > 0) {
      return new Response(JSON.stringify({ error: 'Color name already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Insert the new color into the database
    const [result] = await connection.execute('INSERT INTO f_colorset (setcolorname) VALUES (?)', [trimmedColorName])

    // Retrieve the inserted row
    const [newColorRows] = await connection.execute('SELECT * FROM f_colorset WHERE id = ?', [result.insertId])

    const newColor = newColorRows[0]

    return new Response(JSON.stringify({ FrameColor: newColor }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Database insertion error:', error)
    return new Response(JSON.stringify({ error: 'Failed to add new color' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) connection.release()
  }
}

// PUT Handler: Update a color by ID
export async function PUT(request) {
  let connection
  try {
    connection = await pool.getConnection()
    const body = await request.json()
    const { id, setcolorname } = body

    // Validate required fields
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id field' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!setcolorname || typeof setcolorname !== 'string' || setcolorname.trim() === '') {
      return new Response(JSON.stringify({ error: 'Invalid or missing "setcolorname"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const trimmedColorName = setcolorname.trim()

    // Check if the color exists
    const [existingRows] = await connection.execute('SELECT * FROM f_colorset WHERE id = ?', [id])
    if (existingRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Color not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check for duplicate color name (optional)
    const [duplicateRows] = await connection.execute('SELECT * FROM f_colorset WHERE setcolorname = ? AND id != ?', [
      trimmedColorName,
      id
    ])
    if (duplicateRows.length > 0) {
      return new Response(JSON.stringify({ error: 'Another color with this name already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Update the color
    const updateQuery = 'UPDATE f_colorset SET setcolorname = ? WHERE id = ?'
    await connection.execute(updateQuery, [trimmedColorName, id])

    // Retrieve the updated color
    const [updatedRows] = await connection.execute('SELECT * FROM f_colorset WHERE id = ?', [id])
    const updatedColor = updatedRows[0]

    return new Response(JSON.stringify({ FrameColor: updatedColor }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error handling PUT request:', error)
    return new Response(JSON.stringify({ error: 'Error updating color' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) connection.release()
  }
}

// DELETE Handler: Delete a color by ID
export async function DELETE(request) {
  let connection
  try {
    connection = await pool.getConnection()

    // Parse the query parameters from the request URL
    const url = new URL(request.url)
    const idParam = url.searchParams.get('id')

    // Validate the id parameter
    if (!idParam) {
      console.error('DELETE request missing id parameter')
      return new Response(JSON.stringify({ error: 'Missing id query parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const id = parseInt(idParam, 10)
    if (isNaN(id)) {
      console.error(`Invalid id parameter: ${idParam}`)
      return new Response(JSON.stringify({ error: 'Invalid id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if the color exists
    const [existingRows] = await connection.execute('SELECT * FROM f_colorset WHERE id = ?', [id])
    if (existingRows.length === 0) {
      console.warn(`Color with id ${id} not found`)
      return new Response(JSON.stringify({ error: 'Color not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Optionally, check for dependencies (e.g., if a color is used in f_priceset)
    const [dependencyRows] = await connection.execute('SELECT * FROM f_priceset WHERE id = ?', [id])
    if (dependencyRows.length > 0) {
      return new Response(JSON.stringify({ error: 'Cannot delete color; it is associated with existing frame sets' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Delete the color
    const deleteQuery = 'DELETE FROM f_colorset WHERE id = ?'
    await connection.execute(deleteQuery, [id])

    // Respond with a success message
    return new Response(JSON.stringify({ message: 'Color deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error handling DELETE request:', error)
    return new Response(JSON.stringify({ error: 'Error deleting color' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) connection.release()
  }
}
