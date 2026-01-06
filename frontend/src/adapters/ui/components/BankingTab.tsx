import { useState, useEffect } from 'react';
import { ComplianceBalance } from '../../../core/domain/ComplianceBalance';
import { useServices } from '../../../shared/hooks/useServices';

export default function BankingTab() {
  const { complianceService, bankingService } = useServices();
  const [shipId, setShipId] = useState('R001');
  const [year, setYear] = useState(2024);
  const [cb, setCb] = useState<ComplianceBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bankAmount, setBankAmount] = useState('');
  const [applyAmount, setApplyAmount] = useState('');

  useEffect(() => {
    loadCB();
  }, [shipId, year]);

  const loadCB = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await complianceService.getComplianceBalance(shipId, year);
      setCb(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load compliance balance');
      setCb(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBank = async () => {
    if (!bankAmount || parseFloat(bankAmount) <= 0) {
      alert('Please enter a valid amount to bank');
      return;
    }

    try {
      setError(null);
      await bankingService.bankSurplus(shipId, year, parseFloat(bankAmount));
      setBankAmount('');
      await loadCB();
      alert('Successfully banked surplus');
    } catch (err: any) {
      setError(err.message || 'Failed to bank surplus');
    }
  };

  const handleApply = async () => {
    if (!applyAmount || parseFloat(applyAmount) <= 0) {
      alert('Please enter a valid amount to apply');
      return;
    }

    try {
      setError(null);
      await bankingService.applyBanked(shipId, year, parseFloat(applyAmount));
      setApplyAmount('');
      await loadCB();
      alert('Successfully applied banked amount');
    } catch (err: any) {
      setError(err.message || 'Failed to apply banked amount');
    }
  };

  const canBank = cb && cb.cbGco2eq > 0;
  const canApply = cb && cb.cbGco2eq < 0;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Banking</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ship ID
            </label>
            <input
              type="text"
              value={shipId}
              onChange={(e) => setShipId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="R001"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : cb ? (
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Current Compliance Balance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">CB (gCO₂eq)</p>
                <p className={`text-2xl font-bold ${cb.cbGco2eq >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {cb.cbGco2eq.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {cb.cbGco2eq >= 0 ? 'Surplus' : 'Deficit'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Bank Surplus</h3>
            <p className="text-sm text-gray-600 mb-4">
              Bank positive compliance balance for future use.
            </p>
            <div className="flex gap-4">
              <input
                type="number"
                value={bankAmount}
                onChange={(e) => setBankAmount(e.target.value)}
                placeholder="Amount to bank (gCO₂eq)"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={!canBank}
              />
              <button
                onClick={handleBank}
                disabled={!canBank}
                className={`px-4 py-2 rounded ${
                  canBank
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Bank
              </button>
            </div>
            {!canBank && (
              <p className="text-sm text-red-600 mt-2">
                Can only bank positive compliance balance (surplus)
              </p>
            )}
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Apply Banked Amount</h3>
            <p className="text-sm text-gray-600 mb-4">
              Apply previously banked surplus to cover a deficit.
            </p>
            <div className="flex gap-4">
              <input
                type="number"
                value={applyAmount}
                onChange={(e) => setApplyAmount(e.target.value)}
                placeholder="Amount to apply (gCO₂eq)"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={!canApply}
              />
              <button
                onClick={handleApply}
                disabled={!canApply}
                className={`px-4 py-2 rounded ${
                  canApply
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Apply
              </button>
            </div>
            {!canApply && (
              <p className="text-sm text-red-600 mt-2">
                Can only apply banked amount when there is a deficit
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No compliance balance found. Please calculate CB first by selecting a route.
        </div>
      )}
    </div>
  );
}




