import { sql } from "../config/db.js";

// Get all groceries for authenticated user
export async function getGroceries(req, res) {
  try {
    const user_id = req.user.id;

    const groceries = await sql`
      SELECT * FROM groceries 
      WHERE user_id = ${user_id} 
      ORDER BY created_at DESC
    `;
      
    res.status(200).json(groceries);
  } catch (error) {
    console.error('Error fetching groceries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add new grocery for authenticated user
export async function addGrocery(req, res) {
  try {
    const { text } = req.body;
    const user_id = req.user.id;
    
    if (!text) {
      return res.status(400).json({ 
        error: 'Text is required' 
      });
    }

    const [newGrocery] = await sql`
      INSERT INTO groceries (user_id, text, is_completed)
      VALUES (${user_id}, ${text}, false)
      RETURNING *
    `;
    
    res.status(201).json(newGrocery);
  } catch (err) {
    console.error('Error adding grocery:', err);
    res.status(500).json({ error: 'Failed to add grocery' });
  }
};

// Toggle grocery status (checks ownership)
export async function toggleGrocery(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if grocery exists and belongs to user
    const [grocery] = await sql`
      SELECT * FROM groceries WHERE id = ${id} AND user_id = ${user_id}
    `;
    
    if (!grocery) {
      return res.status(404).json({ error: 'Grocery not found' });
    }

    const [updated] = await sql`
      UPDATE groceries 
      SET is_completed = ${!grocery.is_completed}
      WHERE id = ${id} AND user_id = ${user_id}
      RETURNING *
    `;
    
    res.json(updated);
  } catch (err) {
    console.error('Error toggling grocery:', err);
    res.status(500).json({ error: 'Failed to toggle grocery' });
  }
};

// Delete grocery (checks ownership)
export async function deleteGrocery(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Additional validation
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const result = await sql`
      DELETE FROM groceries 
      WHERE id = ${parseInt(id)} AND user_id = ${user_id}
      RETURNING id
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Grocery not found' });
    }
    
    res.status(200).json({ 
      message: 'Grocery deleted successfully',
      deletedId: result[0].id
    });
  } catch (err) {
    console.error('Error deleting grocery:', err);
    res.status(500).json({ 
      error: 'Failed to delete grocery',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update grocery text (checks ownership)
export async function updateGrocery(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const user_id = req.user.id;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid text' });
    }

    const [updated] = await sql`
      UPDATE groceries
      SET text = ${text}
      WHERE id = ${parseInt(id)} AND user_id = ${user_id}
      RETURNING *
    `;
    
    if (!updated) {
      return res.status(404).json({ error: 'Grocery not found' });
    }
    
    res.json(updated);
    console.log('Received update for id:', id, 'with text:', text);
  } catch (err) {
    console.error('Error updating grocery:', err);
    res.status(500).json({ 
      error: 'Failed to update grocery',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Delete all groceries for authenticated user
export async function clearAllGroceries(req, res) {
  try {
    const user_id = req.user.id;

    const result = await sql`
      DELETE FROM groceries WHERE user_id = ${user_id}
      RETURNING *
    `;
    
    res.status(200).json({ 
      message: 'All groceries deleted successfully',
      deletedCount: result.length
    });
  } catch (err) {
    console.error('Error clearing groceries:', err);
    res.status(500).json({ 
      error: 'Failed to clear groceries',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
  }
}

// Get groceries summary (total and completed count) for authenticated user
export async function getGroceriesSummary(req, res) {
  try {
    const user_id = req.user.id;

    const result = await sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_completed = TRUE THEN 1 ELSE 0 END) as completed
      FROM groceries 
      WHERE user_id = ${user_id}
    `;
    
    res.status(200).json(result[0]);
  } catch (error) {
    console.error('Error fetching groceries summary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};