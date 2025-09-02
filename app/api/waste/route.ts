import { NextRequest, NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/database';

// GET - Retrieve waste entries with filtering
export async function GET(request: NextRequest) {
  try {
    // Initialize database on first run
    await initDatabase();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period'); // 'daily', 'weekly', 'monthly', 'all'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let entries;

    if (startDate && endDate) {
      entries = await sql`
        SELECT 
          *,
          DATE(created_at) as date
        FROM waste_entries
        WHERE DATE(created_at) BETWEEN ${startDate} AND ${endDate}
        ORDER BY created_at DESC
      `;
    } else if (period === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      entries = await sql`
        SELECT 
          *,
          DATE(created_at) as date
        FROM waste_entries
        WHERE DATE(created_at) = ${today}
        ORDER BY created_at DESC
      `;
    } else if (period === 'weekly') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      entries = await sql`
        SELECT 
          *,
          DATE(created_at) as date
        FROM waste_entries
        WHERE DATE(created_at) >= ${weekAgo}
        ORDER BY created_at DESC
      `;
    } else if (period === 'monthly') {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      entries = await sql`
        SELECT 
          *,
          DATE(created_at) as date
        FROM waste_entries
        WHERE DATE(created_at) >= ${monthStart}
        ORDER BY created_at DESC
      `;
    } else {
      entries = await sql`
        SELECT 
          *,
          DATE(created_at) as date
        FROM waste_entries
        ORDER BY created_at DESC
      `;
    }

    // Calculate totals
    const totals = entries.rows.reduce((acc: { total_ml: number; total_cost: number }, entry: any) => {
      acc.total_ml += parseFloat(entry.amount_ml);
      acc.total_cost += parseFloat(entry.cost_dollars);
      return acc;
    }, { total_ml: 0, total_cost: 0 });

    // Convert string values to numbers for client-side compatibility
    const formattedEntries = entries.rows.map((entry: any) => ({
      ...entry,
      amount_ml: parseFloat(entry.amount_ml),
      cost_dollars: parseFloat(entry.cost_dollars)
    }));

    return NextResponse.json({
      entries: formattedEntries,
      totals,
      period: period || 'all'
    });

  } catch (error) {
    console.error('Error fetching waste entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waste entries' },
      { status: 500 }
    );
  }
}

// POST - Create new waste entry
export async function POST(request: NextRequest) {
  try {
    // Initialize database on first run
    await initDatabase();
    
    const { amount_ml } = await request.json();

    if (!amount_ml || amount_ml <= 0) {
      return NextResponse.json(
        { error: 'Valid amount in mL is required' },
        { status: 400 }
      );
    }

    // Calculate cost: $10 per mL of diluted Definity
    const cost_dollars = amount_ml * 10;

    const result = await sql`
      INSERT INTO waste_entries (amount_ml, cost_dollars)
      VALUES (${amount_ml}, ${cost_dollars})
      RETURNING id
    `;

    return NextResponse.json({
      id: result.rows[0].id,
      amount_ml,
      cost_dollars,
      message: 'Waste entry recorded successfully'
    });

  } catch (error) {
    console.error('Error creating waste entry:', error);
    return NextResponse.json(
      { error: 'Failed to create waste entry' },
      { status: 500 }
    );
  }
}

// DELETE - Remove waste entry
export async function DELETE(request: NextRequest) {
  try {
    // Initialize database on first run
    await initDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM waste_entries 
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Waste entry deleted successfully',
      deletedId: result.rows[0].id
    });

  } catch (error) {
    console.error('Error deleting waste entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete waste entry' },
      { status: 500 }
    );
  }
}
