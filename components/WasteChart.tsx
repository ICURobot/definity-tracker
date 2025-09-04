'use client';

import { format, parseISO } from 'date-fns';

// Helper function to parse timestamp correctly
function parseLocalTime(timestamp: string): Date {
  // Handle undefined or invalid timestamps
  if (!timestamp || typeof timestamp !== 'string') {
    return new Date(); // Return current date as fallback
  }
  
  // If it's a UTC timestamp (ends with Z), parse it and convert to local time
  if (timestamp.endsWith('Z')) {
    const utcDate = new Date(timestamp);
    // The database stores local time but PostgreSQL returns it as UTC
    // We need to extract the local time components and create a local Date object
    // Toronto is UTC-4 in summer (EDT), so we need to subtract 4 hours
    const localTime = new Date(utcDate.getTime() - (4 * 60 * 60 * 1000));
    
    // Create a new Date object in local timezone using the components
    const localDate = new Date(
      localTime.getUTCFullYear(),
      localTime.getUTCMonth(),
      localTime.getUTCDate(),
      localTime.getUTCHours(),
      localTime.getUTCMinutes(),
      localTime.getUTCSeconds(),
      localTime.getUTCMilliseconds()
    );
    
    return localDate;
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
  total_ml: number;
  total_cost: number;
  entry_count: number;
}

interface WasteChartProps {
  entries: WasteEntry[];
  period: string;
}

export default function WasteChart({ entries, period }: WasteChartProps) {
  // Handle empty entries
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-lg mb-2">📊</div>
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
        total_ml: 0,
        total_cost: 0,
        entry_count: 0
      };
      acc.push(dayData);
    }
    
    dayData.total_ml += entry.amount_ml;
    dayData.total_cost += entry.cost_dollars;
    dayData.entry_count += 1;
    
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (dailyData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Waste Trend</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">📊</div>
          <p className="text-gray-500">No data to display</p>
        </div>
      </div>
    );
  }

  const maxMl = Math.max(...dailyData.map(d => d.total_ml));
  const maxCost = Math.max(...dailyData.map(d => d.total_cost));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Waste Trend - {period === 'weekly' ? 'Last 7 Days' : period === 'monthly' ? 'This Month' : 'All Time'}
      </h3>
      
      <div className="space-y-4">
        {/* Volume Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Volume (mL)</h4>
          <div className="space-y-2">
            {dailyData.map((day) => {
              const percentage = maxMl > 0 ? (day.total_ml / maxMl) * 100 : 0;
              const barColor = day.total_ml === 0 ? 'bg-green-500' : 
                              day.total_ml <= 5 ? 'bg-yellow-500' : 
                              day.total_ml <= 15 ? 'bg-orange-500' : 'bg-red-500';
              
              return (
                <div key={day.date} className="flex items-center space-x-3">
                  <div className="w-20 text-xs text-gray-600">
                    {format(new Date(day.date), 'MMM dd')}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div 
                      className={`h-6 rounded-full ${barColor} transition-all duration-300`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {day.total_ml > 0 && `${day.total_ml.toFixed(1)}mL`}
                    </div>
                  </div>
                  <div className="w-16 text-xs text-gray-600 text-right">
                    {day.entry_count} {day.entry_count === 1 ? 'entry' : 'entries'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost Chart */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Cost ($)</h4>
          <div className="space-y-2">
            {dailyData.map((day) => {
              const percentage = maxCost > 0 ? (day.total_cost / maxCost) * 100 : 0;
              const barColor = day.total_cost === 0 ? 'bg-green-500' : 
                              day.total_cost <= 50 ? 'bg-yellow-500' : 
                              day.total_cost <= 150 ? 'bg-orange-500' : 'bg-red-500';
              
              return (
                <div key={day.date} className="flex items-center space-x-3">
                  <div className="w-20 text-xs text-gray-600">
                    {format(new Date(day.date), 'MMM dd')}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div 
                      className={`h-6 rounded-full ${barColor} transition-all duration-300`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {day.total_cost > 0 && `$${day.total_cost.toFixed(0)}`}
                    </div>
                  </div>
                  <div className="w-16 text-xs text-gray-600 text-right">
                    {day.entry_count} {day.entry_count === 1 ? 'entry' : 'entries'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>No waste (0 mL)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Low waste (≤5 mL)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Medium waste (≤15 mL)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>High waste (&gt;15 mL)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
