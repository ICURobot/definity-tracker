'use client';

import { useState, useEffect } from 'react';
import WasteEntryForm from './WasteEntryForm';
import WasteSummary from './WasteSummary';
import WasteHistory from './WasteHistory';

interface WasteEntry {
  id: number;
  amount_ml: number;
  cost_dollars: number;
  created_at: string;
  date: string;
}

interface WasteData {
  entries: WasteEntry[];
  totals: {
    total_ml: number;
    total_cost: number;
  };
  vials: {
    used: number;
    cost: number;
    totalEntries: number;
  };
  period: string;
}

export default function Dashboard() {
  const [wasteData, setWasteData] = useState<WasteData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchWasteData = async (period: string = selectedPeriod) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/waste?period=${period}`);
      const data = await response.json();
      
      // Check if the API returned an error
      if (data.error) {
        console.error('API Error:', data.error);
        setWasteData(null); // Set to null to show empty state
      } else {
        setWasteData(data);
      }
    } catch (error) {
      console.error('Error fetching waste data:', error);
      setWasteData(null); // Set to null to show empty state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWasteData();
  }, []);

  const handleWasteEntry = async (amount_ml: number) => {
    try {
      const response = await fetch('/api/waste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount_ml }),
      });

      if (response.ok) {
        // Refresh the data
        fetchWasteData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    fetchWasteData(period);
  };

  const handleDeleteEntry = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/waste?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the data
        fetchWasteData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Definity Waste Tracker</h1>
              <p className="text-gray-600 mt-1">Track contrast waste and costs</p>
            </div>
                                    <div className="text-sm text-gray-500">
                          <p>Cost: $10 per mL of diluted Definity</p>
                          <p>1 vial (1.5mL pure) = $200 → 4 syringes (5mL diluted each = 20mL total)</p>
                        </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Waste Entry Form */}
          <div className="lg:col-span-1">
            <WasteEntryForm onSubmit={handleWasteEntry} />
          </div>

          {/* Summary and History */}
          <div className="lg:col-span-2 space-y-8">
            <WasteSummary 
              data={wasteData} 
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
              isLoading={isLoading}
            />
            <WasteHistory 
              entries={wasteData?.entries || []} 
              isLoading={isLoading}
              onDeleteEntry={handleDeleteEntry}
              selectedPeriod={selectedPeriod}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
