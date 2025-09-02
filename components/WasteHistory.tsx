'use client';

import { format } from 'date-fns';

interface WasteEntry {
  id: number;
  amount_ml: number;
  cost_dollars: number;
  created_at: string;
  date: string;
}

interface WasteHistoryProps {
  entries: WasteEntry[];
  isLoading: boolean;
  onDeleteEntry: (id: number) => void;
}

export default function WasteHistory({ entries, isLoading, onDeleteEntry }: WasteHistoryProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Entries</h2>
      
      {entries.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">📝</div>
          <p className="text-gray-500">No waste entries recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.slice(0, 10).map((entry) => (
            <div
              key={entry.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className={`text-sm font-medium ${
                    entry.amount_ml === 0 
                      ? 'text-green-600' 
                      : 'text-gray-900'
                  }`}>
                    {entry.amount_ml === 0 ? '0 mL (No Waste)' : `${entry.amount_ml} mL`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(entry.created_at), 'MMM dd, yyyy')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(entry.created_at), 'h:mm a')}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className={`text-sm font-semibold ${
                    entry.amount_ml === 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
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
          
          {entries.length > 10 && (
            <div className="text-center pt-3">
              <p className="text-sm text-gray-500">
                Showing 10 most recent entries
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
