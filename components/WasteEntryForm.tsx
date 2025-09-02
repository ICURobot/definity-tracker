'use client';

import { useState } from 'react';

interface WasteEntryFormProps {
  onSubmit: (amount_ml: number) => void;
}

export default function WasteEntryForm({ onSubmit }: WasteEntryFormProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount_ml = parseFloat(amount);
    if (isNaN(amount_ml) || amount_ml < 0) {
      alert('Please enter a valid amount (0 or greater)');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(amount_ml);
      setAmount(''); // Clear form on success
    } catch (error) {
      console.error('Error submitting waste entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleZeroWaste = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(0);
      setAmount(''); // Clear form on success
    } catch (error) {
      console.error('Error submitting zero waste entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cost = parseFloat(amount) * 10 || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Record Waste</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount Wasted (mL)
          </label>
          <input
            type="number"
            id="amount"
            step="0.1"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter amount in mL (0 for no waste)"
          />
        </div>

        {amount !== '' && (
          <div className={`border rounded-md p-3 ${
            parseFloat(amount) === 0 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-sm ${
              parseFloat(amount) === 0 
                ? 'text-green-800' 
                : 'text-blue-800'
            }`}>
              <strong>Cost:</strong> ${cost.toFixed(2)}
              {parseFloat(amount) === 0 && ' (No waste!)'}
            </p>
            <p className={`text-xs mt-1 ${
              parseFloat(amount) === 0 
                ? 'text-green-600' 
                : 'text-blue-600'
            }`}>
              $10 per mL of diluted Definity
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            type="submit"
            disabled={isSubmitting || !amount}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Recording...' : 'Record Waste'}
          </button>
          
          <button
            type="button"
            onClick={handleZeroWaste}
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Recording...' : 'Zero Waste (Used Syringe)'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-xs text-gray-500">
        <p className="font-medium mb-2">Quick Reference:</p>
        <ul className="space-y-1">
          <li>• 1 vial = 1.5mL = $200</li>
          <li>• 4 syringes × 5mL = 20mL total</li>
          <li>• Cost per mL = $10</li>
          <li>• Use "Zero Waste" when syringe is used but no waste</li>
        </ul>
      </div>
    </div>
  );
}
