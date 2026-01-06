import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RouteComparison } from '../../../core/domain/Route';
import { useServices } from '../../../shared/hooks/useServices';

const TARGET_INTENSITY = 89.3368; // gCO₂e/MJ

export default function CompareTab() {
  const { routeService } = useServices();
  const [comparisons, setComparisons] = useState<RouteComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComparisons();
  }, []);

  const loadComparisons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await routeService.getComparison(TARGET_INTENSITY);
      setComparisons(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load comparisons');
    } finally {
      setLoading(false);
    }
  };

  const chartData = comparisons.map(comp => ({
    routeId: comp.comparison.routeId,
    baseline: comp.baseline.ghgIntensity,
    comparison: comp.comparison.ghgIntensity,
    target: TARGET_INTENSITY,
  }));

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Compare Routes</h2>
        <p className="text-sm text-gray-600">Target Intensity: {TARGET_INTENSITY} gCO₂e/MJ</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="mb-8 bg-white shadow-sm rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Comparison Chart</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="routeId" />
                <YAxis label={{ value: 'GHG Intensity (gCO₂e/MJ)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="baseline" fill="#3b82f6" name="Baseline" />
                <Bar dataKey="comparison" fill="#10b981" name="Comparison" />
                <Bar dataKey="target" fill="#ef4444" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Baseline Intensity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comparison Intensity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Difference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliant</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparisons.map((comp, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {comp.comparison.routeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {comp.baseline.ghgIntensity.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {comp.comparison.ghgIntensity.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={comp.percentDiff < 0 ? 'text-green-600' : 'text-red-600'}>
                        {comp.percentDiff > 0 ? '+' : ''}{comp.percentDiff.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {comp.compliant ? (
                        <span className="text-green-600 font-semibold">✅ Compliant</span>
                      ) : (
                        <span className="text-red-600 font-semibold">❌ Non-compliant</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {comparisons.length === 0 && (
              <div className="text-center py-8 text-gray-500">No comparisons available. Please set a baseline route first.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}




