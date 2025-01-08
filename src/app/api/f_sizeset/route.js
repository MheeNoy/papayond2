// /app/api/f_sizeset/route.js

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

// GET Handler: Retrieve all sizes
export async function GET() {
  let connection
  try {
    connection = await pool.getConnection()
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
    if (connection) connection.release()
  }
}

// POST Handler: Add a new size
export async function POST(request) {
  let connection
  try {
    connection = await pool.getConnection()
    const { setsizename } = await request.json()

    // Input Validation
    if (!setsizename || typeof setsizename !== 'string' || setsizename.trim() === '') {
      return new Response(JSON.stringify({ error: 'Invalid or missing "setsizename"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const trimmedSizeName = setsizename.trim()

    // Check for duplicate size name (optional but recommended)
    const [existingRows] = await connection.execute('SELECT * FROM f_sizeset WHERE setsizename = ?', [trimmedSizeName])

    if (existingRows.length > 0) {
      return new Response(JSON.stringify({ error: 'Size name already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Insert the new size into the database
    const [result] = await connection.execute('INSERT INTO f_sizeset (setsizename) VALUES (?)', [trimmedSizeName])

    // Retrieve the inserted row
    const [newSizeRows] = await connection.execute('SELECT * FROM f_sizeset WHERE id = ?', [result.insertId])

    const newSize = newSizeRows[0]

    return new Response(JSON.stringify({ FrameCategory: newSize }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Database insertion error:', error)
    return new Response(JSON.stringify({ error: 'Failed to add new size' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) connection.release()
  }
}

// DELETE Handler: Delete a size by ID
export async function DELETE(request) {
  let connection
  try {
    connection = await pool.getConnection()

    // Parse the query parameters from the request URL
    
    const url = new URL(request.url)
    const idParam = url.searchParams.get('id')

    const {id}  = await request.json();
   
    // Validate the id parameter
    if (!id) {
      console.error('DELETE request missing id parameter')
      return new Response(JSON.stringify({ error: 'Missing id query parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // const id = parseInt(id_, 10)
    // if (isNaN(id)) {
    //   console.error(`Invalid id parameter: ${idParam}`)
    //   return new Response(JSON.stringify({ error: 'Invalid id parameter' }), {
    //     status: 400,
    //     headers: { 'Content-Type': 'application/json' }
    //   })
    // }

    // Check if the size exists
    const [existingRows] = await connection.execute('SELECT * FROM f_sizeset WHERE id = ?', [id])
    if (existingRows.length === 0) {
      console.warn(`Size with id ${id} not found`)
      return new Response(JSON.stringify({ error: 'Size not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Optionally, check for dependencies (e.g., if a size is used in f_priceset)
    const [dependencyRows] = await connection.execute('SELECT * FROM f_priceset WHERE id = ?', [id])
    if (dependencyRows.length > 0) {
      return new Response(JSON.stringify({ error: 'Cannot delete size; it is associated with existing frame sets' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Delete the size
    const deleteQuery = 'DELETE FROM f_sizeset WHERE id = ?'
    const [deleteResult] = await connection.execute(deleteQuery, [id])

    // Respond with a success message
    return new Response(JSON.stringify({ message: 'Size deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error handling DELETE request:', error)
    return new Response(JSON.stringify({ error: 'Error deleting size' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) connection.release()
  }
}

// PUT Handler: Update a size by ID
export async function PUT(request) {
  let connection
  try {
    connection = await pool.getConnection()
    const body = await request.json()
    const { id, setsizename } = body

    // Validate required fields
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id field' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!setsizename || typeof setsizename !== 'string' || setsizename.trim() === '') {
      return new Response(JSON.stringify({ error: 'Invalid or missing "setsizename"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const trimmedSizeName = setsizename.trim()

    // Check if the size exists
    const [existingRows] = await connection.execute('SELECT * FROM f_sizeset WHERE id = ?', [id])
    if (existingRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Size not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check for duplicate size name (optional)
    const [duplicateRows] = await connection.execute('SELECT * FROM f_sizeset WHERE setsizename = ? AND id != ?', [
      trimmedSizeName,
      id
    ])
    if (duplicateRows.length > 0) {
      return new Response(JSON.stringify({ error: 'Another size with this name already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Update the size
    const updateQuery = 'UPDATE f_sizeset SET setsizename = ? WHERE id = ?'
    const [updateResult] = await connection.execute(updateQuery, [trimmedSizeName, id])

    // Retrieve the updated size
    const [updatedRows] = await connection.execute('SELECT * FROM f_sizeset WHERE id = ?', [id])
    const updatedSize = updatedRows[0]

    return new Response(JSON.stringify({ FrameCategory: updatedSize }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error handling PUT request:', error)
    return new Response(JSON.stringify({ error: 'Error updating size' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } finally {
    if (connection) connection.release()
  }
}
