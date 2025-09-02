import { NextRequest, NextResponse } from 'next/server';
import db, { initDatabase } from '@/lib/database';

// Initialize database on first run
initDatabase();

// GET - Retrieve waste entries with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period'); // 'daily', 'weekly', 'monthly', 'all'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = `
      SELECT 
        *,
        DATE(created_at) as date
      FROM waste_entries
    `;
    
    const conditions = [];
    const params = [];

    if (startDate && endDate) {
      conditions.push('DATE(created_at) BETWEEN ? AND ?');
      params.push(startDate, endDate);
    } else if (period === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      conditions.push('DATE(created_at) = ?');
      params.push(today);
    } else if (period === 'weekly') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      conditions.push('DATE(created_at) >= ?');
      params.push(weekAgo);
    } else if (period === 'monthly') {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      conditions.push('DATE(created_at) >= ?');
      params.push(monthStart);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const entries = db.prepare(query).all(...params);

    // Calculate totals
    const totals = entries.reduce((acc: { total_ml: number; total_cost: number }, entry: any) => {
      acc.total_ml += entry.amount_ml;
      acc.total_cost += entry.cost_dollars;
      return acc;
    }, { total_ml: 0, total_cost: 0 });

    return NextResponse.json({
      entries,
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
    const { amount_ml } = await request.json();

    if (!amount_ml || amount_ml <= 0) {
      return NextResponse.json(
        { error: 'Valid amount in mL is required' },
        { status: 400 }
      );
    }

    // Calculate cost: $10 per mL of diluted Definity
    const cost_dollars = amount_ml * 10;

    const stmt = db.prepare(`
      INSERT INTO waste_entries (amount_ml, cost_dollars)
      VALUES (?, ?)
    `);

    const result = stmt.run(amount_ml, cost_dollars);

    return NextResponse.json({
      id: result.lastInsertRowid,
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
