import { useState, useEffect } from 'react';
import { Route } from '../../../core/domain/Route';
import { useServices } from '../../../shared/hooks/useServices';

export default function RoutesTab() {
  const { routeService, complianceService } = useServices();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<{
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }>({});

  useEffect(() => {
    loadRoutes();
  }, [filters]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await routeService.getAllRoutes(filters);
      setRoutes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const handleSetBaseline = async (routeId: string) => {
    try {
      await routeService.setBaseline(routeId);
      await loadRoutes(); // Reload to update baseline flag
    } catch (err: any) {
      alert(`Failed to set baseline: ${err.message}`);
    }
  };

  const handleCalculateCB = async (route: Route) => {
    try {
      const shipId = route.routeId; // Use routeId as shipId
      const routeId = route.routeId;
      const year = route.year;
      
      await complianceService.calculateComplianceBalance(shipId, routeId, year);
      alert(`Compliance balance calculated successfully for ${route.routeId} (${route.year})`);
    } catch (err: any) {
      alert(`Failed to calculate compliance balance: ${err.message}`);
    }
  };

  const uniqueVesselTypes = Array.from(new Set(routes.map(r => r.vesselType)));
  const uniqueFuelTypes = Array.from(new Set(routes.map(r => r.fuelType)));
  const uniqueYears = Array.from(new Set(routes.map(r => r.year))).sort();

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Routes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vessel Type
            </label>
            <select
              value={filters.vesselType || ''}
              onChange={(e) => setFilters({ ...filters, vesselType: e.target.value || undefined })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All</option>
              {uniqueVesselTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Type
            </label>
            <select
              value={filters.fuelType || ''}
              onChange={(e) => setFilters({ ...filters, fuelType: e.target.value || undefined })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All</option>
              {uniqueFuelTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={filters.year || ''}
              onChange={(e) => setFilters({ ...filters, year: e.target.value ? parseInt(e.target.value) : undefined })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
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
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vessel Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GHG Intensity (gCO₂e/MJ)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Consumption (t)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance (km)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Emissions (t)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routes.map((route) => (
                <tr key={route.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {route.routeId}
                    {route.isBaseline && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Baseline</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.vesselType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.fuelType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.ghgIntensity.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.fuelConsumption.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.distance.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.totalEmissions.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {!route.isBaseline && (
                        <button
                          onClick={() => handleSetBaseline(route.routeId)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Set Baseline
                        </button>
                      )}
                      <button
                        onClick={() => handleCalculateCB(route)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        title="Calculate Compliance Balance for this route"
                      >
                        Calculate CB
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {routes.length === 0 && (
            <div className="text-center py-8 text-gray-500">No routes found</div>
          )}
        </div>
      )}
    </div>
  );
}


