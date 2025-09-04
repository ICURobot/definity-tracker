'use client';

import { format, parseISO } from 'date-fns';
import { useState } from 'react';

// Helper function to parse timestamp correctly
function parseLocalTime(timestamp: string): Date {
  // Handle undefined or invalid timestamps
  if (!timestamp || typeof timestamp !== 'string') {
    return new Date(); // Return current date as fallback
  }
  
  // If it's a UTC timestamp (ends with Z), parse it and convert to local time
  if (timestamp.endsWith('Z')) {
    return new Date(timestamp);
  }
  
  // For other formats, try to parse as-is
  return new Date(timestamp);
}

interface WasteEntry {
  id: number;
  amount_ml: number;
  cost_dollars: number;
  created_at: string;
}

interface DailyData {
  date: string;
  entries: WasteEntry[];
  total_ml: number;
  total_cost: number;
  entry_count: number;
}

interface DailyBreakdownProps {
  entries: WasteEntry[];
  onDeleteEntry: (id: number) => void;
}

export default function DailyBreakdown({ entries, onDeleteEntry }: DailyBreakdownProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Handle empty entries
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-lg mb-2">📝</div>
        <p className="text-gray-500">No waste entries recorded yet</p>
      </div>
    );
  }

  // Group entries by date
  const dailyData: DailyData[] = entries.reduce((acc: DailyData[], entry) => {
    const date = format(parseLocalTime(entry.created_at), 'yyyy-MM-dd');
    let dayData = acc.find(d => d.date === date);
    
    if (!dayData) {
      dayData = {
        date,
        entries: [],
        total_ml: 0,
        total_cost: 0,
        entry_count: 0
      };
      acc.push(dayData);
    }
    
    dayData.entries.push(entry);
    dayData.total_ml += entry.amount_ml;
    dayData.total_cost += entry.cost_dollars;
    dayData.entry_count += 1;
    
    return acc;
  }, []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const getDayColor = (total_ml: number) => {
    if (total_ml === 0) return 'bg-green-50 border-green-200';
    if (total_ml <= 5) return 'bg-yellow-50 border-yellow-200';
    if (total_ml <= 15) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getDayTextColor = (total_ml: number) => {
    if (total_ml === 0) return 'text-green-800';
    if (total_ml <= 5) return 'text-yellow-800';
    if (total_ml <= 15) return 'text-orange-800';
    return 'text-red-800';
  };

  return (
    <div className="space-y-4">
      {dailyData.map((day) => (
        <div key={day.date} className={`border rounded-lg p-4 ${getDayColor(day.total_ml)}`}>
          {/* Day Header */}
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleDay(day.date)}
          >
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <h3 className={`text-lg font-semibold ${getDayTextColor(day.total_ml)}`}>
                  {format(new Date(day.date), 'EEEE, MMM dd, yyyy')}
                </h3>
                <div className="flex items-center space-x-6 text-sm">
                  <span className={`font-medium ${getDayTextColor(day.total_ml)}`}>
                    {day.entry_count} {day.entry_count === 1 ? 'entry' : 'entries'}
                  </span>
                  <span className={`font-medium ${getDayTextColor(day.total_ml)}`}>
                    {day.total_ml.toFixed(1)} mL
                  </span>
                  <span className={`font-bold ${getDayTextColor(day.total_ml)}`}>
                    ${day.total_cost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {expandedDays.has(day.date) ? 'Hide' : 'Show'} details
              </span>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedDays.has(day.date) ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedDays.has(day.date) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-2">
                {day.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-sm font-medium ${
                        entry.amount_ml === 0 ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {entry.amount_ml === 0 ? '0 mL (No Waste)' : `${entry.amount_ml} mL`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(parseLocalTime(entry.created_at), 'h:mm a')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${
                          entry.amount_ml === 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${entry.cost_dollars.toFixed(2)}
                          {entry.amount_ml === 0 && ' (No waste!)'}
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                        title="Delete entry"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
