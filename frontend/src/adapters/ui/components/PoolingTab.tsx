import { useState, useEffect } from 'react';
import { AdjustedComplianceBalance } from '../../../core/domain/ComplianceBalance';
import { CreatePoolRequest } from '../../../core/domain/Pool';
import { useServices } from '../../../shared/hooks/useServices';

export default function PoolingTab() {
  const { complianceService, poolService } = useServices();
  const [year, setYear] = useState(2024);
  const [availableShips, setAvailableShips] = useState<string[]>(['R001', 'R002', 'R003', 'R004', 'R005']);
  const [selectedShips, setSelectedShips] = useState<string[]>([]);
  const [memberCBs, setMemberCBs] = useState<Map<string, AdjustedComplianceBalance>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poolResult, setPoolResult] = useState<any>(null);

  useEffect(() => {
    loadMemberCBs();
  }, [selectedShips, year]);

  const loadMemberCBs = async () => {
    if (selectedShips.length === 0) {
      setMemberCBs(new Map());
      return;
    }

    try {
      setLoading(true);
      const cbMap = new Map<string, AdjustedComplianceBalance>();
      
      for (const shipId of selectedShips) {
        try {
          const cb = await complianceService.getAdjustedComplianceBalance(shipId, year);
          if (cb) {
            cbMap.set(shipId, cb);
          }
        } catch (err) {
          // Ship might not have CB yet
        }
      }
      
      setMemberCBs(cbMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load compliance balances');
    } finally {
      setLoading(false);
    }
  };

  const toggleShip = (shipId: string) => {
    if (selectedShips.includes(shipId)) {
      setSelectedShips(selectedShips.filter(id => id !== shipId));
    } else {
      setSelectedShips([...selectedShips, shipId]);
    }
  };

  const calculatePoolSum = (): number => {
    let sum = 0;
    memberCBs.forEach((cb) => {
      sum += cb.cbAfter;
    });
    return sum;
  };

  const handleCreatePool = async () => {
    if (selectedShips.length === 0) {
      alert('Please select at least one ship');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      const request: CreatePoolRequest = {
        year,
        memberShipIds: selectedShips,
      };
      
      const result = await poolService.createPool(request);
      setPoolResult(result);
      alert('Pool created successfully!');
      await loadMemberCBs();
    } catch (err: any) {
      setError(err.message || 'Failed to create pool');
    } finally {
      setLoading(false);
    }
  };

  const poolSum = calculatePoolSum();
  const isValidPool = poolSum >= 0 && selectedShips.length > 0;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pooling</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
            className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Ships for Pool
          </label>
          <div className="flex flex-wrap gap-2">
            {availableShips.map((shipId) => (
              <button
                key={shipId}
                onClick={() => toggleShip(shipId)}
                className={`px-4 py-2 rounded ${
                  selectedShips.includes(shipId)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {shipId}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {selectedShips.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Pool Members</h3>
          
          <div className="mb-4">
            <div className={`inline-block px-4 py-2 rounded ${
              poolSum >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <strong>Pool Sum: {poolSum.toFixed(2)} gCO₂eq</strong>
              {poolSum >= 0 ? ' ✅ Valid' : ' ❌ Invalid (must be >= 0)'}
            </div>
            {poolSum < 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Pool cannot be created:</strong> The combined compliance balance is negative.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  <strong>Solutions:</strong>
                </p>
                <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
                  <li>Remove ships with large deficits from the pool</li>
                  <li>Add more ships with surpluses to balance the pool</li>
                  <li>Use Banking feature first to improve individual ship CBs</li>
                  <li>Select different ships that have better compliance balances</li>
                </ul>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-4">Loading compliance balances...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ship ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CB Before</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CB After</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedShips.map((shipId) => {
                    const cb = memberCBs.get(shipId);
                    const cbValue = cb ? cb.cbBefore : 0;
                    const isSurplus = cbValue >= 0;
                    return (
                      <tr key={shipId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {shipId}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          isSurplus ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {cb ? cb.cbBefore.toFixed(2) : 'N/A'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          cb && cb.cbAfter >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {cb ? cb.cbAfter.toFixed(2) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {cb ? (
                            <span className={`px-2 py-1 rounded text-xs ${
                              isSurplus 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {isSurplus ? 'Surplus' : 'Deficit'}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                              No CB
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleCreatePool}
              disabled={!isValidPool || loading}
              className={`px-6 py-2 rounded ${
                isValidPool && !loading
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create Pool
            </button>
          </div>
        </div>
      )}

      {poolResult && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
          <h4 className="font-semibold mb-2">Pool Created Successfully!</h4>
          <p>Pool ID: {poolResult.poolId}</p>
          <p>Total CB Before: {poolResult.totalCbBefore.toFixed(2)}</p>
          <p>Total CB After: {poolResult.totalCbAfter.toFixed(2)}</p>
        </div>
      )}

      {selectedShips.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Please select ships to create a pool.
        </div>
      )}
    </div>
  );
}


