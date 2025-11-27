import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_HISTORY = [
  { id: 'VIS-2025-0023', date: '2025-11-26', plate: 'ET 12345A', chassis: 'WDB1234567890123', owner: 'Abebe Tadesse', result: 'PASS', km: '45,230' },
  { id: 'VIS-2024-0512', date: '2024-11-20', plate: 'ET 12345A', chassis: 'WDB1234567890123', owner: 'Abebe Tadesse', result: 'PASS', km: '32,100' },
  { id: 'VIS-2023-0891', date: '2023-11-15', plate: 'ET 12345A', chassis: 'WDB1234567890123', owner: 'Abebe Tadesse', result: 'FAIL', km: '21,500' },
];

const VehicleHistoryPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setHasSearched(true);
    const q = searchQuery.toLowerCase();
    const results = MOCK_HISTORY.filter(
      (row) =>
        row.plate.toLowerCase().includes(q) ||
        row.chassis.toLowerCase().includes(q) ||
        row.owner.toLowerCase().includes(q)
    );
    setSearchResults(results);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Vehicle History</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className="text-sm text-gray-600 mb-4">Search by Plate Number, Chassis Number, or Owner Name</p>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter Plate, Chassis, or Owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#009639]/20"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-[#009639] text-white rounded-xl font-medium hover:bg-[#007c2d] transition"
          >
            Search
          </button>
        </div>
      </div>

      {hasSearched && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {searchResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No inspection history found for "{searchQuery}"
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">
                  Inspection History for {searchResults[0]?.plate}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Owner: {searchResults[0]?.owner} • Chassis: {searchResults[0]?.chassis}
                </p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Inspection ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Odometer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Result</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((row) => (
                    <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-600">{row.date}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#009639]">{row.id}</td>
                      <td className="px-4 py-3">{row.km} km</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          row.result === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}>
                          {row.result}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => navigate('/result')} className="text-xs text-[#009639] hover:underline font-medium">
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleHistoryPage;

