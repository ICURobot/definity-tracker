'use client';

import { format } from 'date-fns';

interface WasteData {
  entries: any[];
  totals: {
    total_ml: number;
    total_cost: number;
  };
  period: string;
}

interface WasteSummaryProps {
  data: WasteData | null;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  isLoading: boolean;
}

export default function WasteSummary({ data, selectedPeriod, onPeriodChange, isLoading }: WasteSummaryProps) {
  const periods = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  const getPeriodLabel = (period: string) => {
    const periodObj = periods.find(p => p.value === period);
    return periodObj ? periodObj.label : 'All Time';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const totals = data?.totals || { total_ml: 0, total_cost: 0 };
  const entryCount = data?.entries?.length || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Waste Summary</h2>
        <div className="flex space-x-2">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => onPeriodChange(period.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Entries */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{entryCount}</div>
          <div className="text-sm text-gray-600">Entries</div>
          <div className="text-xs text-gray-500 mt-1">{getPeriodLabel(selectedPeriod)}</div>
        </div>

        {/* Total Volume */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{totals.total_ml.toFixed(1)}</div>
          <div className="text-sm text-gray-600">mL Wasted</div>
          <div className="text-xs text-gray-500 mt-1">
            {totals.total_ml > 0 && `${(totals.total_ml / 1.5).toFixed(1)} vials equivalent`}
          </div>
        </div>

        {/* Total Cost */}
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600">${totals.total_cost.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Cost</div>
          <div className="text-xs text-gray-500 mt-1">
            {totals.total_cost > 0 && `${(totals.total_cost / 200).toFixed(1)} vials worth`}
          </div>
        </div>
      </div>

      {entryCount === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">📊</div>
          <p className="text-gray-500">No waste entries for {getPeriodLabel(selectedPeriod).toLowerCase()}</p>
        </div>
      )}
    </div>
  );
}
